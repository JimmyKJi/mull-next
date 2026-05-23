-- Arena PvP: async player-vs-player debates with separate Elo.
--
-- Design: "open challenges" model (vs auto-matchmaking) — Player A
-- creates a challenge with a topic and opening turn, the challenge
-- sits in a public board, Player B browses and accepts. Once
-- accepted, status flips from 'pending_opponent' to 'active' and
-- both players take alternating turns asynchronously.
--
-- Either player can call the verdict after each has played ≥2 turns.
-- The judge call works the same as PvE (Sonnet, same rubric); only
-- the Elo update changes — both users' pvp_elo moves symmetrically.

-- Allow new status value.
alter table arena_sessions drop constraint if exists arena_sessions_status_check;
alter table arena_sessions add constraint arena_sessions_status_check
  check (status in ('pending_opponent', 'active', 'judged', 'abandoned'));

-- Opponent user id (nullable — PvE sessions use philosopher name only).
alter table arena_sessions add column if not exists opponent_user_id uuid
  references auth.users(id) on delete set null;

-- Index for browsing open PvP challenges.
create index if not exists idx_arena_sessions_pending_pvp
  on arena_sessions(started_at desc)
  where status = 'pending_opponent' and kind = 'pvp';

-- ─── RLS update: opponent can also see + write ───────────────────
-- PvE sessions: only the creator (user_id) participates.
-- PvP sessions: creator + opponent_user_id both participate.

drop policy if exists "Users read own arena sessions" on arena_sessions;
drop policy if exists "Users read participating arena sessions" on arena_sessions;
create policy "Users read participating arena sessions"
  on arena_sessions for select
  using (
    user_id = auth.uid()
    or opponent_user_id = auth.uid()
    -- Open PvP challenges visible to everyone signed in (so they can
    -- browse and accept):
    or (status = 'pending_opponent' and kind = 'pvp' and auth.uid() is not null)
  );

drop policy if exists "Users update own arena sessions" on arena_sessions;
drop policy if exists "Users update participating arena sessions" on arena_sessions;
create policy "Users update participating arena sessions"
  on arena_sessions for update
  using (
    user_id = auth.uid()
    or opponent_user_id = auth.uid()
    -- Anyone signed in can accept an open challenge (the API
    -- enforces the actual "set yourself as opponent" logic).
    or (status = 'pending_opponent' and kind = 'pvp' and auth.uid() is not null)
  );

drop policy if exists "Users read own arena turns" on arena_turns;
drop policy if exists "Users read participating arena turns" on arena_turns;
create policy "Users read participating arena turns"
  on arena_turns for select
  using (exists (
    select 1 from arena_sessions s
    where s.id = arena_turns.session_id
      and (s.user_id = auth.uid() or s.opponent_user_id = auth.uid())
  ));

drop policy if exists "Users insert own arena turns" on arena_turns;
drop policy if exists "Users insert participating arena turns" on arena_turns;
create policy "Users insert participating arena turns"
  on arena_turns for insert
  with check (exists (
    select 1 from arena_sessions s
    where s.id = arena_turns.session_id
      and (s.user_id = auth.uid() or s.opponent_user_id = auth.uid())
  ));

-- ─── Open challenges view ───────────────────────────────────────
-- For the browse-and-accept board at /arena/pvp.
create or replace view arena_open_challenges as
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

-- ─── My active matches view ─────────────────────────────────────
-- "Your matches awaiting your turn" surface for the /arena landing.
create or replace view arena_my_active_pvp as
select
  s.id,
  s.user_id as challenger_user_id,
  s.opponent_user_id,
  s.topic_slug,
  s.started_at,
  -- Whose turn it is, derived from the last turn's speaker.
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
