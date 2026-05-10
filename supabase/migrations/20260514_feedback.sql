-- User-submitted feedback. Anyone (signed in or out) can drop a note;
-- only admins can read. Used to capture unfiltered launch reactions.
--
-- Privacy: we record user_id when present so we can follow up if
-- needed, plus the URL the feedback was submitted from (helpful for
-- "this page is broken" reports). User-Agent is collected for bug
-- triage but never displayed.

CREATE TABLE IF NOT EXISTS public.feedback (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  body        text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 4000),
  page_url    text,
  user_agent  text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS feedback_created_idx
  ON public.feedback (created_at DESC);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Anyone can INSERT. We trust the API route to validate the body.
DROP POLICY IF EXISTS "Anyone submits feedback" ON public.feedback;
CREATE POLICY "Anyone submits feedback" ON public.feedback
  FOR INSERT
  WITH CHECK (true);

-- No SELECT policy → only the service-role key (admin API) reads.
