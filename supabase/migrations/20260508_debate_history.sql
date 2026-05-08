-- Debate history table.
-- Stores the user's most recent simulated debates so they can re-read them
-- without regenerating (and without burning Anthropic credits twice).
--
-- We keep at most 3 per user — older ones are pruned by an INSERT trigger.

CREATE TABLE IF NOT EXISTS debate_history (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  a_name          text NOT NULL,
  a_dates         text,
  a_archetype_key text,
  b_name          text NOT NULL,
  b_dates         text,
  b_archetype_key text,
  topic           text NOT NULL,
  setup           text,
  exchanges       jsonb NOT NULL,
  created_at      timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE debate_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own debate history"
  ON debate_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own debate history"
  ON debate_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own debate history"
  ON debate_history FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX debate_history_user_id_created_at_idx
  ON debate_history(user_id, created_at DESC);

-- Auto-prune: after insert, delete older rows beyond the 3 most recent for this user.
CREATE OR REPLACE FUNCTION debate_history_trim() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  DELETE FROM debate_history
  WHERE user_id = NEW.user_id
    AND id NOT IN (
      SELECT id FROM debate_history
      WHERE user_id = NEW.user_id
      ORDER BY created_at DESC
      LIMIT 3
    );
  RETURN NEW;
END;
$$;

CREATE TRIGGER debate_history_trim_after_insert
  AFTER INSERT ON debate_history
  FOR EACH ROW EXECUTE FUNCTION debate_history_trim();
