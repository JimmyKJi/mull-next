-- Diary entries: free-form philosophical journal.
-- Each entry feeds into the user's vector space the same way daily dilemma
-- responses do — Claude analyzes the prose into a small directional shift.
--
-- Mull+ will eventually gate this; for now it's unlimited.

CREATE TABLE IF NOT EXISTS diary_entries (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title         text,
  content       text NOT NULL,
  vector_delta  jsonb,
  analysis      text,
  word_count    integer,
  created_at    timestamptz DEFAULT now() NOT NULL,
  updated_at    timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own diary entries"
  ON diary_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own diary entries"
  ON diary_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own diary entries"
  ON diary_entries FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own diary entries"
  ON diary_entries FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX diary_entries_user_id_created_at_idx
  ON diary_entries(user_id, created_at DESC);
