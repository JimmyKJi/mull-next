-- Diary diagnosis: extend diary_entries with three new fields capturing
-- the philosophical reading of an entry.
--
--   diagnosis     — a short paragraph naming the shape of the thinking
--                   (1–4 sentences). Complements `analysis` which is the
--                   terse 2–3 sentence read; diagnosis goes a step deeper.
--
--   kinship       — JSONB: { philosophers: [{slug, name, similarity, why}],
--                            traditions: ["Stoicism", ...] }.
--                   Up to 3 closest historical thinkers + their reasons,
--                   plus named schools/traditions the entry echoes.
--
--   is_novel      — true when no philosopher passes the similarity
--                   threshold AND Claude judged the entry as voicing
--                   something not strongly captured by the canon.
--                   Surfaces in the /search curator picks page in an
--                   "Original thinking" tab (public entries only).
--
-- All three are nullable so old entries continue to render before they
-- get re-analyzed.

ALTER TABLE public.diary_entries
  ADD COLUMN IF NOT EXISTS diagnosis text,
  ADD COLUMN IF NOT EXISTS kinship jsonb,
  ADD COLUMN IF NOT EXISTS is_novel boolean DEFAULT false;

-- Partial index on novel public entries for the curator "Original
-- thinking" tab. Keeps lookup cheap as the diary corpus grows.
CREATE INDEX IF NOT EXISTS diary_entries_novel_public_idx
  ON public.diary_entries (created_at DESC)
  WHERE is_novel = true AND is_public = true;
