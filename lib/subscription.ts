// Subscription helpers — wraps the `subscriptions` table to answer the simple
// question "is this user on a paid Mull+ plan right now?". Used to gate
// premium features (dilemma archive, retrospective essays, future Mo+).
//
// Two access paths grant Mull+:
//   1. Paid plan in subscriptions table (plus_monthly, plus_yearly,
//      founding_lifetime) with status active/trialing.
//   2. Free EDU tier — any account whose email matches a recognised
//      academic domain (.edu, .ac.*, .k12.*.us, etc.). Mull+ comp'd
//      to anyone teaching or studying. Detection lives in
//      lib/billing.isEduEmail.
//
// Pattern is to pass in a Supabase client so the caller can re-use the one
// they already created (server components do this once per request).

import type { SupabaseClient } from '@supabase/supabase-js';
import { isEduEmail, isPaidPlan, type Plan } from './billing';

type SubRow = {
  plan: Plan | null;
  status: string | null;
  current_period_end: string | null;
};

export type PlanResult = {
  plan: Plan;
  status: string | null;
  isMullPlus: boolean;
  /** True when Mull+ access is granted via the free EDU tier rather
   *  than a paid subscription. Lets UI surfaces show "Thanks for
   *  teaching" instead of "Manage billing", etc. */
  isEduTier: boolean;
};

export async function getUserPlan(
  supabase: SupabaseClient,
  userId: string,
  /** Optional: pass user.email if available so the EDU-tier check
   *  can fire without an extra round-trip to auth.users. */
  emailHint?: string | null,
): Promise<PlanResult> {
  const { data } = await supabase
    .from('subscriptions')
    .select('plan, status, current_period_end')
    .eq('user_id', userId)
    .maybeSingle<SubRow>();

  const plan = (data?.plan ?? 'free') as Plan;
  const status = data?.status ?? null;
  // 'incomplete' / 'past_due' / 'canceled' don't grant access — they're
  // states where the subscription either never started, lapsed, or ended.
  // Trialing users do get access (we can offer a free trial later).
  const statusOk = status === 'active' || status === 'trialing';
  // Lifetime founding-mind doesn't track period_end — but if it did, ignore.
  const paidMullPlus = isPaidPlan(plan) && (plan === 'founding_lifetime' || statusOk);

  // EDU tier — overrides "no subscription" with comped Mull+ access
  // when the user's email matches an academic domain. We still report
  // their actual plan ('free'), but flip isMullPlus + isEduTier so
  // gated features open up.
  if (!paidMullPlus && isEduEmail(emailHint ?? null)) {
    return { plan, status, isMullPlus: true, isEduTier: true };
  }

  return { plan, status, isMullPlus: paidMullPlus, isEduTier: false };
}

// Convenience: caller doesn't have a userId yet, just wants to know if the
// current request is from a Mull+ user. Returns false if not signed in.
// Picks up the email automatically so EDU tier detection works.
export async function isMullPlusFromAuth(
  supabase: SupabaseClient,
): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { isMullPlus } = await getUserPlan(supabase, user.id, user.email);
  return isMullPlus;
}
