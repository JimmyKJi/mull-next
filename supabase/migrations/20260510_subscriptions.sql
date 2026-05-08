-- Subscription state, mirrored from Stripe.
-- Stripe is the source of truth for subscription status; this table is a
-- local cache so we don't have to call Stripe on every page load.
--
-- Updated by the Stripe webhook (/api/billing/webhook).

CREATE TABLE IF NOT EXISTS subscriptions (
  user_id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id   text UNIQUE,
  stripe_subscription_id text UNIQUE,
  -- Plan: "free", "plus_monthly", "plus_yearly", "founding_lifetime".
  plan                 text NOT NULL DEFAULT 'free'
                         CHECK (plan IN ('free','plus_monthly','plus_yearly','founding_lifetime')),
  -- Status: "active", "trialing", "canceled", "past_due", "incomplete".
  status               text NOT NULL DEFAULT 'active',
  -- When the current paid period ends (null for free / lifetime).
  current_period_end   timestamptz,
  -- Lifetime-pass cap (1000 founding seats, see About page).
  -- Null until claimed; sequential after that.
  founding_seat_number integer UNIQUE,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users see own subscription" ON subscriptions;
CREATE POLICY "Users see own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Only the service role (used by the webhook) can write to this table.
-- No INSERT / UPDATE policies for authenticated → effectively RLS-locked
-- against direct client mutation.

CREATE INDEX IF NOT EXISTS subscriptions_status_idx ON subscriptions(status);
CREATE INDEX IF NOT EXISTS subscriptions_plan_idx ON subscriptions(plan);
