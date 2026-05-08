-- Reflections written after a user completes a philosophical exercise.
-- Same prose-to-vector pattern as dilemma_responses + diary_entries:
-- the user writes a paragraph, Claude analyzes it against the exercise's
-- reflection prompt, returns a 16-D vector_delta + a one-sentence analysis,
-- and the entry feeds into the trajectory map alongside dilemmas and diary.

CREATE TABLE IF NOT EXISTS exercise_reflections (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- The exercise's slug (premortem, switch-sides, fallacy-hunt, etc.).
  -- Soft reference: exercises live in a TS file, not a DB table.
  exercise_slug   text NOT NULL,
  content         text NOT NULL,
  -- Claude's analysis: 16-D delta + one-sentence summary. Both nullable so
  -- the row still saves if the AI step fails (graceful degradation, same
  -- pattern as the dilemma route).
  vector_delta    jsonb,
  analysis        text,
  word_count      integer,
  -- Per-entry public visibility, like diary entries. Default false.
  is_public       boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS exercise_reflections_user_recent
  ON exercise_reflections(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS exercise_reflections_user_slug
  ON exercise_reflections(user_id, exercise_slug, created_at DESC);

ALTER TABLE exercise_reflections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users see own reflections" ON exercise_reflections;
CREATE POLICY "Users see own reflections"
  ON exercise_reflections FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own reflections" ON exercise_reflections;
CREATE POLICY "Users insert own reflections"
  ON exercise_reflections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own reflections" ON exercise_reflections;
CREATE POLICY "Users update own reflections"
  ON exercise_reflections FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own reflections" ON exercise_reflections;
CREATE POLICY "Users delete own reflections"
  ON exercise_reflections FOR DELETE
  USING (auth.uid() = user_id);

-- Public read: anyone can see reflections the user explicitly marked public
-- (mirrors the dilemma + diary public-read pattern).
DROP POLICY IF EXISTS "Anyone reads public reflections" ON exercise_reflections;
CREATE POLICY "Anyone reads public reflections"
  ON exercise_reflections FOR SELECT
  USING (is_public = true);

-- Extend the trajectory function so reflections show up on public profiles
-- alongside dilemmas + diary entries. Same gating: only when the user has
-- a public profile.
CREATE OR REPLACE FUNCTION get_public_trajectory(p_user_id uuid)
RETURNS TABLE (
  kind          text,
  ts            timestamptz,
  dilemma_date  date,
  vec           jsonb,
  delta         jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public_profiles WHERE user_id = p_user_id) THEN
    RETURN;
  END IF;
  RETURN QUERY
    SELECT 'q'::text, qa.taken_at, NULL::date, to_jsonb(qa.vector), NULL::jsonb
      FROM quiz_attempts qa WHERE qa.user_id = p_user_id
    UNION ALL
    SELECT 'd'::text, dr.created_at, dr.dilemma_date, NULL::jsonb, dr.vector_delta
      FROM dilemma_responses dr
      WHERE dr.user_id = p_user_id AND dr.vector_delta IS NOT NULL
    UNION ALL
    SELECT 'j'::text, de.created_at, NULL::date, NULL::jsonb, de.vector_delta
      FROM diary_entries de
      WHERE de.user_id = p_user_id AND de.vector_delta IS NOT NULL
    UNION ALL
    SELECT 'e'::text, er.created_at, NULL::date, NULL::jsonb, er.vector_delta
      FROM exercise_reflections er
      WHERE er.user_id = p_user_id AND er.vector_delta IS NOT NULL
    ORDER BY 2;
END;
$$;

GRANT EXECUTE ON FUNCTION get_public_trajectory(uuid) TO anon, authenticated;
