-- Tiny error log — captures unhandled errors from API routes + the
-- client error boundary so we can read them in /admin without
-- spelunking through Vercel logs.
--
-- Privacy: no PII fields. We capture a stack/message and a short
-- context tag, that's it. The user_id is kept for triage so we can
-- ask the affected user "what were you doing?" — RLS scopes
-- service-role-only reads, so it never leaks.

CREATE TABLE IF NOT EXISTS public.error_log (
  id          bigserial PRIMARY KEY,
  source      text NOT NULL,         -- 'api:/dilemma/submit', 'client:/account', etc.
  message     text NOT NULL,
  stack       text,
  user_id     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_agent  text,
  url         text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS error_log_created_idx
  ON public.error_log (created_at DESC);

ALTER TABLE public.error_log ENABLE ROW LEVEL SECURITY;
-- Service role only. Anonymous + authenticated denied by default.
