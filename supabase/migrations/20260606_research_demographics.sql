-- Optional self-reported demographics for research-consented users.
--
--   research_demographics — one row per signed-in user holding the optional
--                           "general info" they chose to share (age range,
--                           gender, cultural background, education, religion/
--                           worldview). Every column is nullable: a user may
--                           answer some, all, or none. Stored as STABLE CODES
--                           (not display text) — labels live in i18n.
--
-- Privacy boundary, same as research_quiz_responses: this table holds
-- consented data only. The app writes here only for users whose
-- research_consent row is 'yes' (enforced in app/api/demographics/route.ts).
-- Registered in lib/user-scoped-tables.ts so account export + delete both
-- pick it up automatically.
--
-- The CHECK constraints below MUST mirror the option codes in
-- lib/demographics.ts exactly. If you add/rename a code there, update the
-- matching CHECK here (and the demo.opt.<code> label in lib/translations.ts).
--
-- Idempotent: every statement is IF NOT EXISTS or guarded. Safe to re-run.
--
-- ─────────────────────────────────────────────────────────────────────
-- HOW TO APPLY (no Supabase CLI on this machine):
--   1. Open Supabase Dashboard → SQL Editor → New query.
--   2. Paste this whole file. Run.
--   3. Confirm "Success. No rows returned."
-- ─────────────────────────────────────────────────────────────────────


-- ═══ research_demographics ══════════════════════════════════════════
-- Singleton per user. Upserted via POST /api/demographics. Default state
-- is "no row" = nothing shared. Each column nullable + an explicit
-- 'prefer_not_to_say' code, distinct from NULL ("never answered").

CREATE TABLE IF NOT EXISTS research_demographics (
  user_id        uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  age_range      text CHECK (age_range IN (
                   'under_18','18_24','25_34','35_44','45_54','55_64','65_plus',
                   'prefer_not_to_say')),

  gender         text CHECK (gender IN (
                   'woman','man','non_binary','another',
                   'prefer_not_to_say')),

  cultural_group text CHECK (cultural_group IN (
                   'east_asian','south_asian','southeast_asian','central_asian',
                   'mena','sub_saharan_african','european','latin_american',
                   'north_american','oceanian','mixed_other',
                   'prefer_not_to_say')),

  education      text CHECK (education IN (
                   'less_than_secondary','secondary','vocational','some_tertiary',
                   'bachelors','masters','doctorate',
                   'prefer_not_to_say')),

  religion       text CHECK (religion IN (
                   'christianity','islam','hinduism','buddhism','judaism','sikhism',
                   'folk_traditional','other_religion','spiritual_not_religious',
                   'agnostic','atheist',
                   'prefer_not_to_say')),

  -- When the row was first created, and last touched.
  created_at     timestamptz DEFAULT now() NOT NULL,
  updated_at     timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE research_demographics ENABLE ROW LEVEL SECURITY;

-- User reads their own row (prefills the /consent demographics form).
DROP POLICY IF EXISTS "Users read own demographics" ON research_demographics;
CREATE POLICY "Users read own demographics"
  ON research_demographics FOR SELECT
  USING (auth.uid() = user_id);

-- User inserts their own row (first time they share anything).
DROP POLICY IF EXISTS "Users insert own demographics" ON research_demographics;
CREATE POLICY "Users insert own demographics"
  ON research_demographics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- User updates their own row (changing or clearing fields).
DROP POLICY IF EXISTS "Users update own demographics" ON research_demographics;
CREATE POLICY "Users update own demographics"
  ON research_demographics FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- User deletes their own row (account-delete flow + privacy).
DROP POLICY IF EXISTS "Users delete own demographics" ON research_demographics;
CREATE POLICY "Users delete own demographics"
  ON research_demographics FOR DELETE
  USING (auth.uid() = user_id);

-- The admin research console (if/when it surfaces demographic breakdowns)
-- reads via the SERVICE-ROLE client (bypasses RLS) for aggregate tallies
-- only — it never surfaces user_id. No cross-user SELECT policy is wanted.
