-- Tracks who has received the one-time welcome email so we don't
-- send twice. Single row per user, inserted by the server route once
-- the email goes out. RLS scopes reads/inserts to the row owner so
-- it's safe to query from the cookie-bound client.
--
-- The actual sending happens from /api/account/welcome, but we may
-- also want to backfill via cron later — both paths use service-role
-- to insert, which bypasses RLS anyway.

CREATE TABLE IF NOT EXISTS public.welcome_emails (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  sent_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.welcome_emails ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users insert own welcome record" ON public.welcome_emails;
CREATE POLICY "users insert own welcome record" ON public.welcome_emails
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "users see own welcome record" ON public.welcome_emails;
CREATE POLICY "users see own welcome record" ON public.welcome_emails
  FOR SELECT
  USING (user_id = auth.uid());
