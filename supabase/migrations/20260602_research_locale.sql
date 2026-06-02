-- Research capture: record the user's UI language at capture time.
--
-- Adds a nullable `locale` column to research_quiz_responses so the
-- /admin/research console can split the corpus into broad language
-- regions — Western (en/es/fr/pt/ru) vs Eastern (zh/ja/ko) — for
-- cross-cultural comparison of how people answer the quiz.
--
-- Nullable on purpose:
--   · Rows captured before this migration have no locale → they fall
--     into an "Unknown" bucket in the admin view. We do NOT backfill;
--     we never actually knew their UI language at capture time, and
--     inventing one would corrupt the very comparison this enables.
--   · Capture is forward-looking: app/api/quiz/save + claim-attempt
--     start stamping the server locale (from the mull_locale cookie)
--     onto new rows once this column exists. The code degrades
--     gracefully if the column is missing (insert simply omits it),
--     so deploying the code before/after this migration is safe.
--
-- Idempotent: guarded ADD COLUMN. Safe to re-run.
--
-- ─────────────────────────────────────────────────────────────────────
-- HOW TO APPLY (no Supabase CLI on this machine):
--   1. Open Supabase Dashboard → SQL Editor → New query.
--   2. Paste this whole file. Run.
--   3. Confirm "Success. No rows returned."
-- ─────────────────────────────────────────────────────────────────────

ALTER TABLE research_quiz_responses
  ADD COLUMN IF NOT EXISTS locale text;

-- No CHECK constraint on the value: the app validates against the
-- LOCALES allowlist before writing, and keeping the column permissive
-- means a future locale doesn't require a migration to start landing.
-- A NULL here means "captured before we tracked language" (Unknown).

COMMENT ON COLUMN research_quiz_responses.locale IS
  'UI language at capture time (mull_locale cookie). NULL = pre-tracking. Used by /admin/research for Western/Eastern region split.';
