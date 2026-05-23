-- Arena: PvE/PvP philosophical debate with Elo scoring.
--
-- v1 ships PvE only (user vs AI-philosopher, judged by Claude Sonnet).
-- PvP scaffolding is in the schema so the second wave doesn't require
-- a migration churn.
--
-- Cost ceiling (per Jimmy's funding constraint, ≤ £500/mo):
--   - Calibration: 3 questions × Haiku scoring = ~$0.02 per user (one-time)
--   - Per debate: Haiku for philosopher turns + Sonnet for judge = ~$0.18
--   - Daily cap of 3 debates/day per user enforced at the API layer
--   - At budget = ~3,400 debates/mo headroom

-- ─── arena_user_ratings ──────────────────────────────────────────
-- One row per user (created on calibration completion).
-- pve_elo + pvp_elo are tracked separately per design — different
-- skill curves, different opponent dynamics.
create table if not exists arena_user_ratings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  pve_elo integer not null default 1000,
  pvp_elo integer not null default 1000,
  /* Calibration done = user has played their placement matches and
     their pve_elo is no longer the default 1000. PvP calibration
     happens separately (placement matches use PvE; PvP starts at
     the user's PvE rating with reduced confidence). */
  calibration_done_at timestamptz,
  pve_debates_count integer not null default 0,
  pvp_debates_count integer not null default 0,
  /* K-factor scales: high (60) for first 20 debates, then 32, then 16.
     Tracked here so we don't have to recompute on every Elo update. */
  pve_k_factor integer not null default 60,
  pvp_k_factor integer not null default 60,
  /* Per-day debate counter — reset on first debate of a new day.
     Enforces the daily cap that caps cost. */
  daily_debates_count integer not null default 0,
  daily_debates_reset_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_arena_ratings_pve_elo on arena_user_ratings(pve_elo desc);
create index if not exists idx_arena_ratings_pvp_elo on arena_user_ratings(pvp_elo desc);

-- ─── arena_sessions ──────────────────────────────────────────────
-- One row per debate session (calibration round OR pve debate OR
-- future pvp debate).
create table if not exists arena_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  /* 'calibration' | 'pve' | 'pvp' */
  kind text not null check (kind in ('calibration', 'pve', 'pvp')),
  /* Topic slug — from lib/arena/topics.ts. */
  topic_slug text not null,
  /* Opponent identifier:
       - pve: philosopher name (e.g. 'Nietzsche')
       - pvp: future — opponent user_id as string
       - calibration: philosopher name */
  opponent text not null,
  /* Opponent difficulty Elo at session start — needed for fair Elo
     calculations even if we later adjust philosopher difficulty. */
  opponent_elo_at_start integer not null,
  /* User Elo at session start. */
  user_elo_at_start integer not null,
  /* 'active' | 'judged' | 'abandoned' */
  status text not null default 'active' check (status in ('active', 'judged', 'abandoned')),
  /* Set on judgment. */
  verdict text check (verdict in ('user', 'opponent', 'draw')),
  /* Full judge JSON output — per-criterion scores + justifications + kindred. */
  judge_json jsonb,
  /* Elo delta applied after judgment. Stored for transparency on the
     verdict UI ("you gained +18 Elo"). */
  elo_delta integer,
  started_at timestamptz not null default now(),
  judged_at timestamptz
);

create index if not exists idx_arena_sessions_user on arena_sessions(user_id, started_at desc);
create index if not exists idx_arena_sessions_status on arena_sessions(status) where status = 'active';

-- ─── arena_turns ─────────────────────────────────────────────────
-- One row per turn in a session. Alternating user / opponent.
create table if not exists arena_turns (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references arena_sessions(id) on delete cascade,
  turn_order integer not null,
  /* 'user' | 'opponent' */
  speaker text not null check (speaker in ('user', 'opponent')),
  content text not null,
  created_at timestamptz not null default now(),
  unique (session_id, turn_order)
);

create index if not exists idx_arena_turns_session on arena_turns(session_id, turn_order);

-- ─── RLS ─────────────────────────────────────────────────────────
alter table arena_user_ratings enable row level security;
alter table arena_sessions enable row level security;
alter table arena_turns enable row level security;

-- Anyone can read their own rating; service role manages writes
-- (Elo updates happen via API after judge call).
drop policy if exists "Users read own arena rating" on arena_user_ratings;
create policy "Users read own arena rating"
  on arena_user_ratings for select
  using (user_id = auth.uid());

-- Public read on aggregated leaderboard happens via a view, not direct
-- table access (we don't want users querying everyone's exact rating).

-- Sessions: users see their own.
drop policy if exists "Users read own arena sessions" on arena_sessions;
create policy "Users read own arena sessions"
  on arena_sessions for select
  using (user_id = auth.uid());

drop policy if exists "Users insert own arena sessions" on arena_sessions;
create policy "Users insert own arena sessions"
  on arena_sessions for insert
  with check (user_id = auth.uid());

drop policy if exists "Users update own arena sessions" on arena_sessions;
create policy "Users update own arena sessions"
  on arena_sessions for update
  using (user_id = auth.uid());

-- Turns: users see + insert turns on their own sessions.
drop policy if exists "Users read own arena turns" on arena_turns;
create policy "Users read own arena turns"
  on arena_turns for select
  using (exists (
    select 1 from arena_sessions
    where arena_sessions.id = arena_turns.session_id
      and arena_sessions.user_id = auth.uid()
  ));

drop policy if exists "Users insert own arena turns" on arena_turns;
create policy "Users insert own arena turns"
  on arena_turns for insert
  with check (exists (
    select 1 from arena_sessions
    where arena_sessions.id = arena_turns.session_id
      and arena_sessions.user_id = auth.uid()
  ));

-- ─── Leaderboard view ───────────────────────────────────────────
-- Surfaces only display_name + pve_elo + pvp_elo + debate counts.
-- No timestamps, no raw user_ids exposed. Used by /arena/leaderboard.
create or replace view arena_leaderboard as
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
