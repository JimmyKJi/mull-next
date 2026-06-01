-- Research-data foundation: server-side consent + per-question capture.
--
-- Two tables, both user-scoped (registered in lib/user-scoped-tables.ts):
--
--   research_consent          — one row per signed-in user recording their
--                               yes/no research-consent decision. Mirrors the
--                               localStorage 'mull.research_consent' key so the
--                               choice survives across devices and so the
--                               server can gate research capture on it.
--
--   research_quiz_responses   — per-question answer capture for the standard
--                               quiz (quick/detailed). Written ONLY for users
--                               who opted in. This is the dataset behind
--                               /admin/research: "for question N, what did
--                               people pick?" Never written for opted-out users,
--                               so the table itself contains only consented data.
--
-- Why a dedicated research table rather than columns on quiz_attempts:
--   quiz_attempts is operational (drives /result, /account trajectory) and is
--   written for EVERY attempt regardless of consent. Folding per-question
--   answers + a consent gate into it would tangle operational and research
--   concerns. A separate table keeps the privacy boundary crisp — if a row
--   exists here, the user consented; full stop.
--
-- Idempotent: every statement is IF NOT EXISTS or guarded. Safe to re-run.
--
-- ─────────────────────────────────────────────────────────────────────
-- HOW TO APPLY (no Supabase CLI on this machine):
--   1. Open Supabase Dashboard → SQL Editor → New query.
--   2. Paste this whole file. Run.
--   3. Confirm "Success. No rows returned."
-- ─────────────────────────────────────────────────────────────────────


-- ═══ research_consent ═══════════════════════════════════════════════
-- Singleton per user. The app upserts on every consent decision via
-- POST /api/consent. Default state is "no row" = undecided (the gate
-- still asks). We never default a row to 'yes' — consent is explicit.

CREATE TABLE IF NOT EXISTS research_consent (
  user_id    uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  -- 'yes' = opted in to anonymized research use; 'no' = opted out.
  consent    text NOT NULL CHECK (consent IN ('yes', 'no')),
  -- When the user FIRST decided. Stays fixed across later changes.
  decided_at timestamptz DEFAULT now() NOT NULL,
  -- Last time the value changed (opt-in → opt-out or vice versa).
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE research_consent ENABLE ROW LEVEL SECURITY;

-- User reads their own consent row (drives the /consent toggle state).
DROP POLICY IF EXISTS "Users read own consent" ON research_consent;
CREATE POLICY "Users read own consent"
  ON research_consent FOR SELECT
  USING (auth.uid() = user_id);

-- User inserts their own consent row (first decision).
DROP POLICY IF EXISTS "Users insert own consent" ON research_consent;
CREATE POLICY "Users insert own consent"
  ON research_consent FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- User updates their own consent row (changing their mind).
DROP POLICY IF EXISTS "Users update own consent" ON research_consent;
CREATE POLICY "Users update own consent"
  ON research_consent FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- User deletes their own consent row (account-delete flow + privacy).
DROP POLICY IF EXISTS "Users delete own consent" ON research_consent;
CREATE POLICY "Users delete own consent"
  ON research_consent FOR DELETE
  USING (auth.uid() = user_id);


-- ═══ research_quiz_responses ════════════════════════════════════════
-- One row per consented quiz completion. Holds the per-question answer
-- trail so research can ask "what did people pick for question N".

CREATE TABLE IF NOT EXISTS research_quiz_responses (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  -- Soft link to the operational attempt. SET NULL (not CASCADE) so a
  -- user deleting a single attempt doesn't silently drop the research
  -- row — the account-delete flow wipes by user_id explicitly instead.
  attempt_id     uuid REFERENCES quiz_attempts(id) ON DELETE SET NULL,
  -- 'quick' (20 Q) | 'detailed' (50 Q). Determines which question set
  -- /admin/research joins against when tallying answer distributions.
  mode           text NOT NULL CHECK (mode IN ('quick', 'detailed')),
  -- How many questions were in the set at capture time. Lets the admin
  -- view detect set-version drift (if QUICK_QUESTIONS grows, old rows
  -- still carry their original length).
  question_count integer NOT NULL,
  -- The answer trail. JSONB array, one element per answered question:
  --   { "q": 0, "kind": "single", "a": 2 }
  --   { "q": 1, "kind": "multi",  "indices": [0, 3] }
  --   { "q": 2, "kind": "skip" }
  -- `q` is the question's position in the set. `a` / `indices` are
  -- answer positions within that question's answer list.
  answers        jsonb NOT NULL,
  -- The final 16-D vector + landing archetype, duplicated here so the
  -- research dataset is self-contained (no join to quiz_attempts needed,
  -- and it survives attempt deletion via the SET NULL above).
  vector         jsonb NOT NULL,
  archetype      text NOT NULL,
  alignment_pct  integer CHECK (alignment_pct BETWEEN 0 AND 100),
  created_at     timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE research_quiz_responses ENABLE ROW LEVEL SECURITY;

-- User reads their own research rows (so /api/account/export can return
-- them under the RLS-respecting client, and the user can audit what we
-- captured about them).
DROP POLICY IF EXISTS "Users read own research responses" ON research_quiz_responses;
CREATE POLICY "Users read own research responses"
  ON research_quiz_responses FOR SELECT
  USING (auth.uid() = user_id);

-- User inserts their own research rows (via /api/quiz/save when opted in).
DROP POLICY IF EXISTS "Users insert own research responses" ON research_quiz_responses;
CREATE POLICY "Users insert own research responses"
  ON research_quiz_responses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- User deletes their own research rows (account-delete flow + privacy).
DROP POLICY IF EXISTS "Users delete own research responses" ON research_quiz_responses;
CREATE POLICY "Users delete own research responses"
  ON research_quiz_responses FOR DELETE
  USING (auth.uid() = user_id);

-- The admin research console reads the whole table via the SERVICE-ROLE
-- client (bypasses RLS) for aggregate tallies only — it never surfaces
-- user_id. No SELECT policy for other users is needed or wanted.

-- Index for the admin tally scan (ordered by recency, filtered by mode).
CREATE INDEX IF NOT EXISTS research_quiz_responses_mode_created_idx
  ON research_quiz_responses(mode, created_at DESC);

-- Index for the per-user lookup used by export + account-delete.
CREATE INDEX IF NOT EXISTS research_quiz_responses_user_idx
  ON research_quiz_responses(user_id);
