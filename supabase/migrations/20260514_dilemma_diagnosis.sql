-- Extend dilemma_responses with the same diagnosis/kinship/is_novel
-- triple that diary_entries got. The /api/dilemma/submit endpoint
-- populates these via the shared lib/kinship.ts helpers.
--
-- Partial index on novel+public so the "Original thinking" curator
-- tab can mix dilemma + diary efficiently without scanning the
-- whole table as the corpus grows.

ALTER TABLE public.dilemma_responses
  ADD COLUMN IF NOT EXISTS diagnosis text,
  ADD COLUMN IF NOT EXISTS kinship jsonb,
  ADD COLUMN IF NOT EXISTS is_novel boolean DEFAULT false;

CREATE INDEX IF NOT EXISTS dilemma_responses_novel_public_idx
  ON public.dilemma_responses (created_at DESC)
  WHERE is_novel = true AND is_public = true;
