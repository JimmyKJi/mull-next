-- Editor's picks — weekly curated highlights.
--
-- Each row is one pick: a single public entry (dilemma response,
-- diary entry, or exercise reflection) chosen by an admin. Three
-- picks per ISO-week. Cycles weekly: a new week → new picks.
--
-- Schema notes:
--   - week_start is a date set to the Monday of the pick's week
--     (UTC). The UI computes this from the pick's creation moment.
--   - position is 1, 2, or 3 — the slot the pick occupies in that
--     week's display. UNIQUE (week_start, position) means each slot
--     can hold only one pick at a time; replacing is "upsert".
--   - source_type discriminates which table source_id refers to.
--     We can't FK across multiple tables, so we enforce referential
--     integrity at the API layer (refuse picks of nonexistent or
--     non-public entries).
--   - curator_note is a free-form short editorial caption, optional.
--
-- Privacy: picks are public reads (visible to everyone on the
-- leaderboard). Writes require admin gate, enforced at the API
-- layer using an env-var allowlist of user UUIDs (see lib/admin.ts).
-- RLS on this table denies all writes from anon/authenticated;
-- only the service-role key (used by our admin API route) can
-- insert/update/delete.

CREATE TABLE IF NOT EXISTS public.editor_picks (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start   date NOT NULL,
  position     int  NOT NULL CHECK (position BETWEEN 1 AND 3),
  source_type  text NOT NULL CHECK (source_type IN ('dilemma','diary','exercise')),
  source_id    uuid NOT NULL,
  curator_note text,
  picked_by    uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (week_start, position)
);

CREATE INDEX IF NOT EXISTS editor_picks_week_idx
  ON public.editor_picks (week_start DESC, position);

ALTER TABLE public.editor_picks ENABLE ROW LEVEL SECURITY;

-- Public read — picks are editorial content, world-readable.
DROP POLICY IF EXISTS "Anyone reads picks" ON public.editor_picks;
CREATE POLICY "Anyone reads picks" ON public.editor_picks
  FOR SELECT
  USING (true);

-- No anon/authenticated writes. The /api/admin/curate routes use the
-- service-role key (or the request-scoped client after server-side
-- admin gate) to insert/update; no client should be able to forge
-- picks. Without an INSERT/UPDATE policy here, RLS denies by default.

-- ─── RPC: get_editor_picks_for_week ────────────────────────────────
-- Returns the three picks for a given Monday-keyed ISO-week, JOINed
-- against the source entry's table so the UI gets entry text +
-- author info in one round trip.
--
-- Defaults to the current week if no arg given. Returns rows in
-- position order (1, 2, 3); missing positions are simply absent.
--
-- SECURITY DEFINER so it can read across tables without RLS
-- friction; we only return is_public = true entries to be safe even
-- if a pick references something that became private later.
CREATE OR REPLACE FUNCTION public.get_editor_picks_for_week(
  in_week_start date DEFAULT date_trunc('week', current_date)::date
)
RETURNS TABLE (
  position           int,
  source_type        text,
  source_id          uuid,
  entry_text         text,
  entry_question     text,    -- only for dilemmas
  entry_title        text,    -- only for diary
  exercise_slug      text,    -- only for exercises
  entry_created_at   timestamptz,
  curator_note       text,
  author_handle      text,
  author_display_name text,
  author_archetype   text,
  author_show_archetype boolean
)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $body$
  WITH picks AS (
    SELECT * FROM public.editor_picks
    WHERE week_start = in_week_start
    ORDER BY position
  )
  SELECT
    p.position,
    p.source_type,
    p.source_id,
    CASE p.source_type
      WHEN 'dilemma'  THEN d.response_text
      WHEN 'diary'    THEN dy.content
      WHEN 'exercise' THEN ex.content
    END AS entry_text,
    CASE WHEN p.source_type = 'dilemma' THEN d.question_text END AS entry_question,
    CASE WHEN p.source_type = 'diary'   THEN dy.title          END AS entry_title,
    CASE WHEN p.source_type = 'exercise' THEN ex.exercise_slug END AS exercise_slug,
    CASE p.source_type
      WHEN 'dilemma'  THEN d.created_at
      WHEN 'diary'    THEN dy.created_at
      WHEN 'exercise' THEN ex.created_at
    END AS entry_created_at,
    p.curator_note,
    pp.handle           AS author_handle,
    pp.display_name     AS author_display_name,
    (
      SELECT qa.archetype FROM public.quiz_attempts qa
      WHERE qa.user_id = COALESCE(d.user_id, dy.user_id, ex.user_id)
      ORDER BY qa.taken_at DESC LIMIT 1
    ) AS author_archetype,
    pp.show_archetype   AS author_show_archetype
  FROM picks p
  LEFT JOIN public.dilemma_responses    d  ON p.source_type = 'dilemma'  AND d.id  = p.source_id AND d.is_public  = true
  LEFT JOIN public.diary_entries        dy ON p.source_type = 'diary'    AND dy.id = p.source_id AND dy.is_public = true
  LEFT JOIN public.exercise_reflections ex ON p.source_type = 'exercise' AND ex.id = p.source_id AND ex.is_public = true
  LEFT JOIN public.public_profiles      pp ON pp.user_id = COALESCE(d.user_id, dy.user_id, ex.user_id)
  WHERE
    -- Drop picks whose underlying entry is gone or no longer public.
    (p.source_type <> 'dilemma'  OR d.id  IS NOT NULL)
    AND (p.source_type <> 'diary'    OR dy.id IS NOT NULL)
    AND (p.source_type <> 'exercise' OR ex.id IS NOT NULL)
  ORDER BY p.position;
$body$;

GRANT EXECUTE ON FUNCTION public.get_editor_picks_for_week(date) TO anon, authenticated;

-- ─── RPC: list_curation_candidates ────────────────────────────────
-- Returns recent public entries across all three tables, for the
-- admin curation UI. Limited to entries from the last N days
-- (default 14) so the picker isn't overwhelmed. Includes author info
-- so the admin can see who wrote what.
--
-- Public reads of public entries are already RLS-allowed, so this
-- function doesn't need SECURITY DEFINER for that — but we mark it
-- so the cross-table query plan is reused.
CREATE OR REPLACE FUNCTION public.list_curation_candidates(
  days_back int DEFAULT 14,
  source_filter text DEFAULT NULL  -- 'dilemma' | 'diary' | 'exercise' | NULL = all
)
RETURNS TABLE (
  source_type   text,
  source_id     uuid,
  entry_text    text,
  entry_label   text,    -- question for dilemma, title for diary, slug for exercise
  entry_created_at timestamptz,
  author_handle text,
  author_display_name text,
  word_count    int
)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $body$
  SELECT * FROM (
    SELECT
      'dilemma'::text    AS source_type,
      d.id               AS source_id,
      d.response_text    AS entry_text,
      d.question_text    AS entry_label,
      d.created_at       AS entry_created_at,
      pp.handle          AS author_handle,
      pp.display_name    AS author_display_name,
      array_length(string_to_array(trim(d.response_text), ' '), 1) AS word_count
    FROM public.dilemma_responses d
    LEFT JOIN public.public_profiles pp ON pp.user_id = d.user_id
    WHERE d.is_public = true
      AND d.created_at >= now() - (days_back || ' days')::interval
      AND (source_filter IS NULL OR source_filter = 'dilemma')

    UNION ALL

    SELECT
      'diary'::text,
      dy.id,
      dy.content,
      COALESCE(dy.title, '(untitled)'),
      dy.created_at,
      pp.handle,
      pp.display_name,
      dy.word_count
    FROM public.diary_entries dy
    LEFT JOIN public.public_profiles pp ON pp.user_id = dy.user_id
    WHERE dy.is_public = true
      AND dy.created_at >= now() - (days_back || ' days')::interval
      AND (source_filter IS NULL OR source_filter = 'diary')

    UNION ALL

    SELECT
      'exercise'::text,
      ex.id,
      ex.content,
      ex.exercise_slug,
      ex.created_at,
      pp.handle,
      pp.display_name,
      ex.word_count
    FROM public.exercise_reflections ex
    LEFT JOIN public.public_profiles pp ON pp.user_id = ex.user_id
    WHERE ex.is_public = true
      AND ex.created_at >= now() - (days_back || ' days')::interval
      AND (source_filter IS NULL OR source_filter = 'exercise')
  ) candidates
  ORDER BY entry_created_at DESC
  LIMIT 200;
$body$;

GRANT EXECUTE ON FUNCTION public.list_curation_candidates(int, text) TO authenticated;
