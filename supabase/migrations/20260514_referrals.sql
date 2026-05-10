-- Friend referral system. Two tables:
--
--   referral_codes — maps each user to a short, stable invite code.
--                    Users share /r/<code> links; clicking sets a
--                    cookie that, on signup, attributes the new user
--                    back to the referrer.
--
--   referrals      — one row per referred user. Tracks who introduced
--                    whom for the "introduced by X" badge on profiles
--                    and for /admin's referrer leaderboard.
--
-- Both are user-scoped under RLS:
--   - Users see + manage their own code
--   - Anyone can read codes (so we can resolve a /r/<code> click
--     server-side without service-role)
--   - Referrals are insert-only by the system; users see only the
--     row about themselves

CREATE TABLE IF NOT EXISTS public.referral_codes (
  user_id     uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  code        text NOT NULL UNIQUE CHECK (char_length(code) BETWEEN 4 AND 24),
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS referral_codes_code_idx
  ON public.referral_codes (code);

ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

-- Anyone can read codes (resolution is part of the public flow).
DROP POLICY IF EXISTS "anyone reads referral codes" ON public.referral_codes;
CREATE POLICY "anyone reads referral codes" ON public.referral_codes
  FOR SELECT USING (true);

-- Users insert their own code on first /account visit.
DROP POLICY IF EXISTS "users insert own code" ON public.referral_codes;
CREATE POLICY "users insert own code" ON public.referral_codes
  FOR INSERT WITH CHECK (user_id = auth.uid());


CREATE TABLE IF NOT EXISTS public.referrals (
  user_id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  referrer_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  referrer_code    text,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS referrals_referrer_idx
  ON public.referrals (referrer_user_id);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Users see their own referral record (i.e. who introduced them).
DROP POLICY IF EXISTS "users see own referral" ON public.referrals;
CREATE POLICY "users see own referral" ON public.referrals
  FOR SELECT USING (user_id = auth.uid());

-- Users see referrals THEY made (i.e. who they introduced) — so we
-- can show "X friends joined via your link" on /account.
DROP POLICY IF EXISTS "users see own referrer count" ON public.referrals;
CREATE POLICY "users see own referrer count" ON public.referrals
  FOR SELECT USING (referrer_user_id = auth.uid());

-- Users insert their own referral row on signup. The API enforces
-- that user_id = auth.uid() and referrer_user_id != auth.uid().
DROP POLICY IF EXISTS "users insert own referral" ON public.referrals;
CREATE POLICY "users insert own referral" ON public.referrals
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND (referrer_user_id IS NULL OR referrer_user_id != auth.uid())
  );
