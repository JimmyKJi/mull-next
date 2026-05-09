// Subscription helpers — wraps the `subscriptions` table to answer the simple
// question "is this user on a paid Mull+ plan right now?". Used to gate
// premium features (dilemma archive, retrospective essays, future Mo+).
//
// Only one tier currently: free vs Mull+. The latter spans plus_monthly,
// plus_yearly, founding_lifetime — anything `isPaidPlan` says is paid AND
// whose status is active or trialing.
//
// Pattern is to pass in a Supabase client so the caller can re-use the one
// they already created (server components do this once per request).

import type { SupabaseClient } from '@supabase/supabase-js';
import { isPaidPlan, type Plan } from './billing';

type SubRow = {
  plan: Plan | null;
  status: string | null;
  current_period_end: string | null;
};

export async function getUserPlan(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ plan: Plan; status: string | null; isMullPlus: boolean }> {
  const { data } = await supabase
    .from('subscriptions')
    .select('plan, status, current_period_end')
    .eq('user_id', userId)
    .maybeSingle<SubRow>();

  if (!data) return { plan: 'free', status: null, isMullPlus: false };

  const plan = (data.plan ?? 'free') as Plan;
  const status = data.status;
  // 'incomplete' / 'past_due' / 'canceled' don't grant access — they're
  // states where the subscription either never started, lapsed, or ended.
  // Trialing users do get access (we can offer a free trial later).
  const statusOk = status === 'active' || status === 'trialing';
  // Lifetime founding-mind doesn't track period_end — but if it did, ignore.
  const isMullPlus = isPaidPlan(plan) && (plan === 'founding_lifetime' || statusOk);

  return { plan, status, isMullPlus };
}

// Convenience: caller doesn't have a userId yet, just wants to know if the
// current request is from a Mull+ user. Returns false if not signed in.
export async function isMullPlusFromAuth(
  supabase: SupabaseClient,
): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { isMullPlus } = await getUserPlan(supabase, user.id);
  return isMullPlus;
}
