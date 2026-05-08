-- Search-discoverability toggle.
-- Default true: existing public profiles stay searchable.
-- Users who want "publicly viewable if you have the link, but not in
-- search results" can flip this off.

ALTER TABLE public_profiles
  ADD COLUMN IF NOT EXISTS is_searchable boolean NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS public_profiles_searchable_idx
  ON public_profiles(is_searchable)
  WHERE is_searchable = true;
