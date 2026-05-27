-- 20260527_arena_view_security.sql
--
-- Fix Supabase Database Advisor "Security Definer View" warnings on:
--   - public.arena_leaderboard
--   - public.arena_open_challenges
--   - public.arena_my_active_pvp
--
-- Background
--
-- Postgres views run in one of two security modes:
--   - SECURITY DEFINER (the historical default): the view's queries
--     run with the privileges of the view *creator* (typically
--     postgres/superuser), bypassing RLS on the underlying tables.
--   - SECURITY INVOKER: the queries run with the privileges of the
--     *calling user*, so RLS on the underlying tables applies.
--
-- Our three arena views were created without an explicit setting and
-- inherited DEFINER semantics. They expose only intentionally-public
-- columns (handles, display names, elos, debate counts) so the actual
-- data leakage risk is low, but the Supabase advisor flags this
-- pattern as CRITICAL because it's a common shape for accidental
-- privacy leaks. Belt-and-braces is right here.
--
-- The fix below does two things together (both required — switching
-- to INVOKER without adding the RLS policies would break the views
-- because the underlying tables restrict reads to row owners):
--
--   1. Add narrow row-level read policies on arena_user_ratings and
--      arena_sessions that match exactly what each view exposes —
--      i.e. only the rows the view filters in.
--
--   2. Recreate each view WITH (security_invoker = true) so the
--      underlying RLS policies apply.
--
-- The result: the views return identical data to before, but the
-- access path now goes through RLS as the calling user. The advisor
-- warnings clear, and the underlying tables themselves grant read
-- access only to the rows that were already publicly visible through
-- the views — no new exposure.

-- ─── Narrow read policies on the underlying tables ────────────────

-- arena_user_ratings: allow anon/authenticated to read rows that
-- represent calibrated, debate-active users. This is exactly the
-- subset the arena_leaderboard view exposes (and only those rows —
-- a private/calibrating user's rating row stays hidden).
drop policy if exists "Public read calibrated arena ratings" on arena_user_ratings;
create policy "Public read calibrated arena ratings"
  on arena_user_ratings for select
  to anon, authenticated
  using (
    calibration_done_at is not null
    and pve_debates_count >= 1
  );

-- arena_sessions: allow authenticated users to read PvP sessions that
-- are in the "waiting for opponent" state. Exposed by the
-- arena_open_challenges view for the matchmaking board. The existing
-- "Users read own arena sessions" policy still gives users full
-- visibility into their own non-pending sessions; this new policy
-- only adds visibility to the open-challenge subset.
drop policy if exists "Public read pending PvP challenges" on arena_sessions;
create policy "Public read pending PvP challenges"
  on arena_sessions for select
  to authenticated
  using (kind = 'pvp' and status = 'pending_opponent');

-- (arena_my_active_pvp doesn't need a new policy — its WHERE clause
-- includes `s.user_id = auth.uid() or s.opponent_user_id = auth.uid()`,
-- which the existing "Users read own arena sessions" policy already
-- allows for s.user_id = auth.uid(). For the opponent case, we need
-- one more narrow policy: authenticated users can read sessions where
-- they're the opponent. Otherwise the view drops those rows under
-- INVOKER mode.)
drop policy if exists "Users read PvP sessions they're the opponent in" on arena_sessions;
create policy "Users read PvP sessions they're the opponent in"
  on arena_sessions for select
  to authenticated
  using (kind = 'pvp' and opponent_user_id = auth.uid());

-- ─── Recreate the views with security_invoker = true ──────────────

-- arena_leaderboard — unchanged shape, now security_invoker. The
-- underlying SELECT will resolve through the new narrow ratings
-- policy + the existing "Anyone can read public profiles" policy.
drop view if exists arena_leaderboard;
create view arena_leaderboard
  with (security_invoker = true) as
select
  r.user_id,
  p.handle,
  p.display_name,
  r.pve_elo,
  r.pvp_elo,
  r.pve_debates_count,
  r.pvp_debates_count,
  r.calibration_done_at is not null as calibrated
from arena_user_ratings r
left join public_profiles p on p.user_id = r.user_id
where r.calibration_done_at is not null
  and r.pve_debates_count >= 1;

grant select on arena_leaderboard to anon, authenticated;

-- arena_open_challenges — unchanged shape, now security_invoker.
-- Resolves through the new pending-PvP policy + public_profiles read
-- + the new calibrated-ratings policy (for the challenger_elo column).
drop view if exists arena_open_challenges;
create view arena_open_challenges
  with (security_invoker = true) as
select
  s.id,
  s.user_id as challenger_user_id,
  p.handle as challenger_handle,
  p.display_name as challenger_display_name,
  r.pvp_elo as challenger_elo,
  s.topic_slug,
  s.started_at
from arena_sessions s
left join public_profiles p on p.user_id = s.user_id
left join arena_user_ratings r on r.user_id = s.user_id
where s.kind = 'pvp'
  and s.status = 'pending_opponent';

grant select on arena_open_challenges to authenticated;

-- arena_my_active_pvp — unchanged shape, now security_invoker.
-- Resolves through the existing "Users read own arena sessions" +
-- the new "opponent" policy, both narrow.
drop view if exists arena_my_active_pvp;
create view arena_my_active_pvp
  with (security_invoker = true) as
select
  s.id,
  s.user_id as challenger_user_id,
  s.opponent_user_id,
  s.topic_slug,
  s.started_at,
  (
    select t.speaker
    from arena_turns t
    where t.session_id = s.id
    order by t.turn_order desc
    limit 1
  ) as last_speaker
from arena_sessions s
where s.kind = 'pvp'
  and s.status = 'active'
  and (s.user_id = auth.uid() or s.opponent_user_id = auth.uid());

grant select on arena_my_active_pvp to authenticated;

-- arena_turns: arena_my_active_pvp reads from arena_turns via the
-- inline subquery for `last_speaker`. The existing
-- "Users read own arena turns" policy only allows reads when the
-- caller is the session owner. For PvP sessions, the opponent also
-- needs to see the last turn's speaker so the "whose turn is it"
-- UI works after we flip the views to invoker mode.
drop policy if exists "Users read PvP turns they're the opponent in" on arena_turns;
create policy "Users read PvP turns they're the opponent in"
  on arena_turns for select
  to authenticated
  using (exists (
    select 1 from arena_sessions s
    where s.id = arena_turns.session_id
      and s.kind = 'pvp'
      and s.opponent_user_id = auth.uid()
  ));
