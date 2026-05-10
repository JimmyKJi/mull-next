-- Update compute_dilemma_streak to allow one missed day in the streak.
-- Humane policy: a single forgotten morning shouldn't reset hard-won
-- progress. Two consecutive missed days break the streak.
--
-- Mirrors the JS implementation in lib/profile-progression.ts and
-- the per-page streak compute in app/account/page.tsx,
-- app/dilemma/page.tsx, app/u/[handle]/page.tsx.

CREATE OR REPLACE FUNCTION public.compute_dilemma_streak(uid uuid)
RETURNS int
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public
AS $body$
DECLARE
  cursor_date date := CURRENT_DATE;
  streak int := 0;
  grace_used boolean := false;
BEGIN
  -- If today not yet answered, start counting from yesterday.
  IF NOT EXISTS (
    SELECT 1 FROM public.dilemma_responses
    WHERE user_id = uid AND dilemma_date = cursor_date
  ) THEN
    cursor_date := cursor_date - 1;
  END IF;

  FOR i IN 1..1825 LOOP -- 5y safety bound
    IF EXISTS (
      SELECT 1 FROM public.dilemma_responses
      WHERE user_id = uid AND dilemma_date = cursor_date
    ) THEN
      streak := streak + 1;
      cursor_date := cursor_date - 1;
    ELSIF NOT grace_used THEN
      grace_used := true;
      cursor_date := cursor_date - 1;
    ELSE
      EXIT;
    END IF;
  END LOOP;

  RETURN streak;
END;
$body$;
