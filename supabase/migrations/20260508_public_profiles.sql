-- Public profile pages.
-- Opt-in. A user picks a handle, then their archetype + map position is
-- visible at /u/<handle> to anyone who has the link. Off by default.
--
-- Privacy by default: nothing is shared until the user explicitly creates a
-- row here. Deletion of the row removes the public page.

CREATE TABLE IF NOT EXISTS public_profiles (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  handle          text NOT NULL UNIQUE,
  display_name    text,
  bio             text,
  show_archetype  boolean NOT NULL DEFAULT true,
  show_dimensions boolean NOT NULL DEFAULT true,
  show_map        boolean NOT NULL DEFAULT true,
  show_streak     boolean NOT NULL DEFAULT false,
  created_at      timestamptz DEFAULT now() NOT NULL,
  updated_at      timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT public_profiles_handle_format
    CHECK (handle ~* '^[a-z0-9_-]{3,32}$')
);

ALTER TABLE public_profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can read public profiles (intended).
CREATE POLICY "Anyone can read public profiles"
  ON public_profiles FOR SELECT
  USING (true);

-- Only the owner can insert/update/delete their own row.
CREATE POLICY "Users insert own profile"
  ON public_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own profile"
  ON public_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own profile"
  ON public_profiles FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX public_profiles_handle_idx ON public_profiles(handle);
