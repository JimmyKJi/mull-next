-- Reflection loop: surface old dilemma responses back to the user
-- weeks later for a re-reading + follow-up. Single most distinctive
-- feature for transformation depth — turns one-time journaling into
-- a longitudinal practice.
--
-- Schema: extend dilemma_responses with two columns rather than a
-- separate table. A response either has a followup or it doesn't;
-- one-to-one. No need for a junction.

ALTER TABLE public.dilemma_responses
  ADD COLUMN IF NOT EXISTS followup_text text,
  ADD COLUMN IF NOT EXISTS followup_at timestamptz;

-- Partial index on rows that DO have followups, for the "see all my
-- reflections" view we'll likely want later.
CREATE INDEX IF NOT EXISTS dilemma_responses_followup_idx
  ON public.dilemma_responses (user_id, followup_at DESC)
  WHERE followup_at IS NOT NULL;

-- Helper RPC: returns the oldest unanswered (no followup) dilemma
-- response for the calling user that's at least N days old. Used by
-- the /api/dilemma/reflection GET endpoint to find a candidate to
-- resurface. Default 56 days (8 weeks) — old enough that the user
-- has actually moved a bit, recent enough to remember the context.
CREATE OR REPLACE FUNCTION public.next_reflection_candidate(
  in_user_id uuid,
  min_age_days int DEFAULT 56
)
RETURNS TABLE (
  id            uuid,
  dilemma_date  date,
  question_text text,
  response_text text,
  analysis      text,
  created_at    timestamptz
)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $body$
  SELECT id, dilemma_date, question_text, response_text, analysis, created_at
  FROM public.dilemma_responses
  WHERE user_id = in_user_id
    AND followup_at IS NULL
    AND created_at <= now() - (min_age_days || ' days')::interval
  ORDER BY created_at ASC
  LIMIT 1;
$body$;

GRANT EXECUTE ON FUNCTION public.next_reflection_candidate(uuid, int) TO authenticated;
