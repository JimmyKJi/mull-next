-- Activity leaderboard
--
-- Two SECURITY DEFINER functions used by /search (now /search → leaderboard +
-- search panel):
--
--   compute_dilemma_streak(uid uuid)
--     Walks back from today (or yesterday if today not yet answered) counting
--     consecutive days the user has a saved dilemma_response. Returns int.
--     Same logic as the JS version in app/dilemma/page.tsx, but in SQL so we
--     can compute it across many users without N round-trips.
--
--   get_activity_leaderboard(limit_n int)
--     Returns the top N searchable public-profile users ranked by total
--     entry count (dilemmas + diary + exercise reflections), with their
--     latest archetype name and current streak. Privacy flags from
--     public_profiles are returned so the UI can decide what to show.
--
-- Both are SECURITY DEFINER because they aggregate across users — under RLS
-- a normal user could only see their own rows, which would defeat the
-- leaderboard's purpose. The privacy gate is `is_searchable = true` on
-- public_profiles, which the user explicitly opts into via the profile page.
--
-- Grants are restricted to anon + authenticated (no service-role exposure
-- from the public schema).

-- ─── Streak helper ────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.compute_dilemma_streak(uid uuid)
RETURNS int
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public
AS $body$
DECLARE
  cursor_date date := CURRENT_DATE;
  streak int := 0;
BEGIN
  -- If today not yet answered, start counting from yesterday.
  IF NOT EXISTS (
    SELECT 1 FROM public.dilemma_responses
    WHERE user_id = uid AND dilemma_date = cursor_date
  ) THEN
    cursor_date := cursor_date - 1;
  END IF;

  -- Walk back day by day while a response exists.
  WHILE EXISTS (
    SELECT 1 FROM public.dilemma_responses
    WHERE user_id = uid AND dilemma_date = cursor_date
  ) LOOP
    streak := streak + 1;
    cursor_date := cursor_date - 1;
    -- Safety: stop after 5 years (1825 days). Streaks longer than
    -- that almost certainly indicate a bug, not a person.
    IF streak >= 1825 THEN
      EXIT;
    END IF;
  END LOOP;

  RETURN streak;
END;
$body$;

GRANT EXECUTE ON FUNCTION public.compute_dilemma_streak(uuid) TO anon, authenticated;

-- ─── Leaderboard ──────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_activity_leaderboard(limit_n int DEFAULT 25)
RETURNS TABLE (
  handle          text,
  display_name    text,
  show_archetype  boolean,
  show_streak     boolean,
  archetype       text,
  dilemma_count   int,
  diary_count     int,
  exercise_count  int,
  total_count     int,
  streak          int,
  last_activity   timestamptz
)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $body$
  SELECT
    p.handle,
    p.display_name,
    p.show_archetype,
    p.show_streak,
    -- Latest archetype name (NULL if user never took the quiz). We always
    -- compute it, but the UI only shows it when show_archetype = true.
    (
      SELECT qa.archetype FROM public.quiz_attempts qa
      WHERE qa.user_id = p.user_id
      ORDER BY qa.taken_at DESC
      LIMIT 1
    ) AS archetype,
    COALESCE(d.cnt, 0)::int  AS dilemma_count,
    COALESCE(j.cnt, 0)::int  AS diary_count,
    COALESCE(e.cnt, 0)::int  AS exercise_count,
    (COALESCE(d.cnt, 0) + COALESCE(j.cnt, 0) + COALESCE(e.cnt, 0))::int AS total_count,
    public.compute_dilemma_streak(p.user_id) AS streak,
    -- Most recent activity timestamp across the three sources, used as a
    -- tiebreaker so two users with identical totals sort sensibly.
    GREATEST(
      COALESCE(d.last_at, 'epoch'::timestamptz),
      COALESCE(j.last_at, 'epoch'::timestamptz),
      COALESCE(e.last_at, 'epoch'::timestamptz)
    ) AS last_activity
  FROM public.public_profiles p
  LEFT JOIN (
    SELECT user_id, COUNT(*) AS cnt, MAX(created_at) AS last_at
    FROM public.dilemma_responses
    GROUP BY user_id
  ) d ON d.user_id = p.user_id
  LEFT JOIN (
    SELECT user_id, COUNT(*) AS cnt, MAX(created_at) AS last_at
    FROM public.diary_entries
    GROUP BY user_id
  ) j ON j.user_id = p.user_id
  LEFT JOIN (
    SELECT user_id, COUNT(*) AS cnt, MAX(created_at) AS last_at
    FROM public.exercise_reflections
    GROUP BY user_id
  ) e ON e.user_id = p.user_id
  WHERE p.is_searchable = true
  ORDER BY total_count DESC, last_activity DESC, p.handle ASC
  LIMIT GREATEST(1, LEAST(limit_n, 100));
$body$;

GRANT EXECUTE ON FUNCTION public.get_activity_leaderboard(int) TO anon, authenticated;
