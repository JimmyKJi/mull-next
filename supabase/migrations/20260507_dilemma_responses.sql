-- Daily dilemma responses table.
-- Each row is one user's prose response to one day's dilemma, with the
-- AI-derived 16-D vector delta and short analysis attached.
--
-- One response per user per day (enforced by unique constraint).

CREATE TABLE IF NOT EXISTS dilemma_responses (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  dilemma_date    date NOT NULL,
  dilemma_index   integer NOT NULL,
  question_text   text NOT NULL,
  response_text   text NOT NULL,
  vector_delta    jsonb,
  analysis        text,
  created_at      timestamptz DEFAULT now() NOT NULL,
  UNIQUE (user_id, dilemma_date)
);

ALTER TABLE dilemma_responses ENABLE ROW LEVEL SECURITY;

-- Users can read only their own responses.
CREATE POLICY "Users read own dilemma responses"
  ON dilemma_responses FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert only their own responses.
CREATE POLICY "Users insert own dilemma responses"
  ON dilemma_responses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own responses (for the eventual delete-account flow).
CREATE POLICY "Users delete own dilemma responses"
  ON dilemma_responses FOR DELETE
  USING (auth.uid() = user_id);

-- Index for quick history queries.
CREATE INDEX dilemma_responses_user_id_created_at_idx
  ON dilemma_responses(user_id, created_at DESC);
