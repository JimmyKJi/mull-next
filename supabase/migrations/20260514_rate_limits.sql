-- Lightweight per-IP rate-limit counter table.
--
-- We don't run Redis. For the volumes we expect at launch (~30-50
-- friends), a Postgres table with an INSERT-on-attempt + COUNT in a
-- rolling window is plenty. The atomic_check_rate_limit RPC below
-- is fast (single index lookup + insert) and the index keeps it
-- so as we grow.
--
-- Old rows are pruned by a simple DELETE every cron run; with a
-- 60-minute window and tiny launch volume, table size stays trivial.

CREATE TABLE IF NOT EXISTS public.rate_limit_events (
  id          bigserial PRIMARY KEY,
  bucket      text NOT NULL,         -- e.g. 'feedback', 'dilemma_submit'
  ip_hash     text NOT NULL,         -- sha256 of IP, never the raw IP
  user_id     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS rate_limit_events_lookup_idx
  ON public.rate_limit_events (bucket, ip_hash, created_at DESC);

ALTER TABLE public.rate_limit_events ENABLE ROW LEVEL SECURITY;
-- No SELECT/INSERT policies — only the service-role admin client
-- (used by API routes server-side) can read or write. Anonymous +
-- authenticated clients are denied by default once RLS is on.

-- Atomic check-and-insert: returns the count of recent events for
-- this (bucket, ip_hash) within the window. Caller compares against
-- their per-bucket limit and decides 429 vs proceed.
--
-- Window is in seconds. The function inserts the new event regardless
-- so we count this attempt as part of the window — a cheap form of
-- "every request costs a token."
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  in_bucket text,
  in_ip_hash text,
  in_user_id uuid,
  in_window_seconds int DEFAULT 60
)
RETURNS int
LANGUAGE plpgsql VOLATILE SECURITY DEFINER
SET search_path = public
AS $body$
DECLARE
  attempts int;
BEGIN
  INSERT INTO public.rate_limit_events (bucket, ip_hash, user_id)
  VALUES (in_bucket, in_ip_hash, in_user_id);

  SELECT COUNT(*)::int INTO attempts
  FROM public.rate_limit_events
  WHERE bucket = in_bucket
    AND ip_hash = in_ip_hash
    AND created_at >= now() - (in_window_seconds || ' seconds')::interval;

  RETURN attempts;
END;
$body$;

-- The function is service-role-only; no GRANT to anon or authenticated.
