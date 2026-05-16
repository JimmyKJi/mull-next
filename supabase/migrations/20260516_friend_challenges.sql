-- Friend challenges — invite links that pair the inviter and the
-- invitee on /compare after the invitee finishes the quiz.
--
-- Flow:
--   1. Authed user POSTs /api/challenge/create → row inserted, code returned
--   2. They share https://mull.world/challenge/<code>
--   3. Friend visits → server-side redirect to /quiz?challenger=<code>
--      (view_count incremented)
--   4. Quiz finishes → /result with challenger=<code> in URL
--   5. Result page surfaces "Compare with <inviter>" CTA
--   6. Click → /compare?challenger=<code> which resolves to inviter's handle
--
-- Codes are short (~8 chars, base36) for shareable URLs. Collisions are
-- handled by retrying on UNIQUE violation in the create route.

CREATE TABLE IF NOT EXISTS friend_challenges (
  code         text PRIMARY KEY,
  inviter_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at   timestamptz NOT NULL DEFAULT now(),
  -- Telemetry: how many people have visited the link + finished a quiz
  -- via it. Surfaced on /account so the inviter can see their loop
  -- working ("3 friends took the quiz from your invite").
  view_count   integer NOT NULL DEFAULT 0,
  accept_count integer NOT NULL DEFAULT 0
);

ALTER TABLE friend_challenges ENABLE ROW LEVEL SECURITY;

-- Anyone can read a challenge by code (the redirect route uses anon).
-- Reading reveals only the inviter_id + counts, not their email.
DROP POLICY IF EXISTS "Public read of friend_challenges" ON friend_challenges;
CREATE POLICY "Public read of friend_challenges"
  ON friend_challenges FOR SELECT
  USING (true);

-- Users can insert their own challenge rows (limit enforced in the
-- API route, not at the DB level).
DROP POLICY IF EXISTS "Users insert own friend_challenges" ON friend_challenges;
CREATE POLICY "Users insert own friend_challenges"
  ON friend_challenges FOR INSERT
  WITH CHECK (auth.uid() = inviter_id);

-- Users can read their own challenge stats.
-- (Public read above covers this; this policy is for clarity.)

-- Users can delete their own challenges (clean up old links).
DROP POLICY IF EXISTS "Users delete own friend_challenges" ON friend_challenges;
CREATE POLICY "Users delete own friend_challenges"
  ON friend_challenges FOR DELETE
  USING (auth.uid() = inviter_id);

-- Index for /account "my invite stats" lookup.
CREATE INDEX IF NOT EXISTS friend_challenges_inviter_id_idx
  ON friend_challenges(inviter_id, created_at DESC);

-- Atomic increment helpers (called via supabase.rpc). Using SECURITY
-- DEFINER lets the anon redirect route bump view_count without an
-- INSERT/UPDATE policy that would otherwise allow tampering.

CREATE OR REPLACE FUNCTION friend_challenge_increment_view(p_code text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE friend_challenges
     SET view_count = view_count + 1
   WHERE code = p_code;
END;
$$;

CREATE OR REPLACE FUNCTION friend_challenge_increment_accept(p_code text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE friend_challenges
     SET accept_count = accept_count + 1
   WHERE code = p_code;
END;
$$;

GRANT EXECUTE ON FUNCTION friend_challenge_increment_view(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION friend_challenge_increment_accept(text) TO authenticated;
