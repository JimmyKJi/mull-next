-- Extend exercise_reflections with the same diagnosis/kinship/is_novel
-- triple that diary_entries and dilemma_responses got. Same partial
-- index pattern for the curator "Original thinking" tab.

ALTER TABLE public.exercise_reflections
  ADD COLUMN IF NOT EXISTS diagnosis text,
  ADD COLUMN IF NOT EXISTS kinship jsonb,
  ADD COLUMN IF NOT EXISTS is_novel boolean DEFAULT false;

CREATE INDEX IF NOT EXISTS exercise_reflections_novel_public_idx
  ON public.exercise_reflections (created_at DESC)
  WHERE is_novel = true AND is_public = true;
