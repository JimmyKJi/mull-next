-- Baseline migration: quiz_attempts table.
--
-- This table predates the migrations directory — it was originally
-- provisioned via the Supabase dashboard when Mull was a static
-- mull.html prototype. Codifying it here so a fresh-init Supabase
-- project bootstraps the full schema from `supabase db reset`.
--
-- Idempotent: every statement is IF NOT EXISTS or guarded by an
-- existence check. Safe to re-run on the existing production DB.
--
-- Columns + types match the existing live table; if you suspect a
-- schema drift, compare against the live Supabase dashboard before
-- editing.

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  -- 16-element float vector — the user's position in the dimensional
  -- space after this quiz attempt. JSONB rather than a float8[] so we
  -- can evolve the schema (named keys, version field) without a
  -- migration. Caller code validates length=16 before insert.
  vector          jsonb NOT NULL,
  -- Closest archetype at quiz-complete time (e.g. "The Cartographer").
  archetype       text NOT NULL,
  -- Optional adjective modifier ("Mystical", "Tragic", …).
  flavor          text,
  -- 0–100 integer percent. How close the vector landed to the
  -- archetype's prototype centroid.
  alignment_pct   integer NOT NULL CHECK (alignment_pct BETWEEN 0 AND 100),
  taken_at        timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Users read their own attempts (drives /account trajectory + result page).
DROP POLICY IF EXISTS "Users read own quiz attempts" ON quiz_attempts;
CREATE POLICY "Users read own quiz attempts"
  ON quiz_attempts FOR SELECT
  USING (auth.uid() = user_id);

-- Users insert their own attempts (via /api/quiz/save + claim-attempt).
DROP POLICY IF EXISTS "Users insert own quiz attempts" ON quiz_attempts;
CREATE POLICY "Users insert own quiz attempts"
  ON quiz_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users delete their own attempts (account-delete flow + privacy).
DROP POLICY IF EXISTS "Users delete own quiz attempts" ON quiz_attempts;
CREATE POLICY "Users delete own quiz attempts"
  ON quiz_attempts FOR DELETE
  USING (auth.uid() = user_id);

-- Index for the "latest attempt per user" + "all attempts ordered" patterns
-- that drive /account, /result, and the trajectory event list.
CREATE INDEX IF NOT EXISTS quiz_attempts_user_id_taken_at_idx
  ON quiz_attempts(user_id, taken_at DESC);

-- Index for /admin's "recent quizzes across all users" query, which scans
-- by taken_at without a user filter.
CREATE INDEX IF NOT EXISTS quiz_attempts_taken_at_idx
  ON quiz_attempts(taken_at DESC);
