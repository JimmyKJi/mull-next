-- Per-entry visibility for dilemma responses and diary entries.
-- Users can mark individual entries public; only those (max 5 each) show on
-- their public profile. Default false — privacy by default.

ALTER TABLE dilemma_responses
  ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false;

ALTER TABLE diary_entries
  ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false;

-- Public read policies: anyone can read entries the user explicitly marked public.
-- Drop-then-create pattern keeps this script idempotent (re-runnable without
-- crashing on "policy already exists"). Postgres 16 has CREATE POLICY IF NOT
-- EXISTS but Supabase isn't reliably on 16+ yet, so we do it the portable way.
DROP POLICY IF EXISTS "Anyone reads public dilemma responses" ON dilemma_responses;
CREATE POLICY "Anyone reads public dilemma responses"
  ON dilemma_responses FOR SELECT
  USING (is_public = true);

DROP POLICY IF EXISTS "Anyone reads public diary entries" ON diary_entries;
CREATE POLICY "Anyone reads public diary entries"
  ON diary_entries FOR SELECT
  USING (is_public = true);

CREATE INDEX IF NOT EXISTS dilemma_responses_user_public_idx
  ON dilemma_responses(user_id, is_public, created_at DESC)
  WHERE is_public = true;

CREATE INDEX IF NOT EXISTS diary_entries_user_public_idx
  ON diary_entries(user_id, is_public, created_at DESC)
  WHERE is_public = true;

-- Trajectory function: exposes only the math (vectors + deltas + timestamps)
-- needed to render someone's position and trail on their public profile.
-- NEVER returns text content. Returns nothing for users without a public_profile.
-- SECURITY DEFINER lets it bypass row-level security, so we explicitly gate
-- on the existence of a public profile inside the function body.
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
    ORDER BY 2;
END;
$$;

-- Latest archetype/alignment via security definer, same gating.
CREATE OR REPLACE FUNCTION get_public_latest_archetype(p_user_id uuid)
RETURNS TABLE (
  archetype     text,
  flavor        text,
  alignment_pct integer,
  taken_at      timestamptz
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
    SELECT qa.archetype, qa.flavor, qa.alignment_pct, qa.taken_at
      FROM quiz_attempts qa
      WHERE qa.user_id = p_user_id
      ORDER BY qa.taken_at DESC
      LIMIT 1;
END;
$$;

-- Allow anyone (including anon) to call these functions.
GRANT EXECUTE ON FUNCTION get_public_trajectory(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_public_latest_archetype(uuid) TO anon, authenticated;
