-- Tracks who has received the one-time streak-broken courtesy email
-- so we don't pester users who lapse intentionally. The "miss_date"
-- column is the date their streak broke (the second-consecutive
-- missed day; one missed day is forgiven by the grace policy), and
-- the (user_id, miss_date) primary key prevents duplicates within a
-- run.
--
-- A user can theoretically receive multiple of these over time — one
-- per distinct break — but the cron only ever surfaces the most
-- recent break, so in practice it's about once per cycle of return-
-- and-lapse. We don't want this to become spammy; the cron itself
-- enforces a "at most one per 14 days" lookback per user.

CREATE TABLE IF NOT EXISTS public.streak_break_emails (
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  miss_date   date NOT NULL,
  sent_at     timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, miss_date)
);

ALTER TABLE public.streak_break_emails ENABLE ROW LEVEL SECURITY;
-- Service role only — the cron writes via admin client. Users don't
-- need to see this; it's just a dedupe ledger.
