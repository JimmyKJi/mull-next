// Billing helpers — single source of truth for plan definitions
// (PRICES below) + the dry-run/live mode switch.
//
// Live mode kicks in automatically when STRIPE_SECRET_KEY is set;
// otherwise routes return a synthetic dry-run URL pointing at
// /billing/dry-run so the UI flow can be exercised end-to-end.
//
// Required env vars (live mode):
//   STRIPE_SECRET_KEY       — sk_test_… or sk_live_…
//   STRIPE_WEBHOOK_SECRET   — whsec_… (webhook receiver)
//   NEXT_PUBLIC_SITE_URL    — optional; defaults to https://mull.world
//
// Required SQL: supabase/migrations/20260510_subscriptions.sql.

export type Plan = 'free' | 'plus_monthly' | 'plus_yearly' | 'founding_lifetime';

export type PriceConfig = {
  plan: Plan;
  amountCents: number;
  currency: string;
  interval: 'month' | 'year' | 'lifetime';
  label: string;
  description: string;
};

// Single source of truth for what we charge. Update prices here;
// the checkout route + the pricing UI both read from this.
export const PRICES: Record<Exclude<Plan, 'free'>, PriceConfig> = {
  plus_monthly: {
    plan: 'plus_monthly',
    amountCents: 499,
    currency: 'usd',
    interval: 'month',
    label: 'Mull+ monthly',
    description: 'Daily dilemma, diary, debate, retrospectives. Cancel any time.',
  },
  plus_yearly: {
    plan: 'plus_yearly',
    amountCents: 2900,
    currency: 'usd',
    interval: 'year',
    label: 'Mull+ yearly',
    description: 'Same as monthly, billed once a year. Saves about half.',
  },
  founding_lifetime: {
    plan: 'founding_lifetime',
    amountCents: 4900,
    currency: 'usd',
    interval: 'lifetime',
    label: 'Founding Mind (lifetime)',
    description: 'One payment, forever. Capped at first 1,000 supporters.',
  },
};

export function isDryRun(): boolean {
  return !process.env.STRIPE_SECRET_KEY;
}

// Returns a synthetic checkout URL for the dry-run flow. The UI navigates
// the browser to this URL just like it would a real Stripe checkout, but
// the page rendered there explains the user is in dry-run.
export function dryRunCheckoutUrl(plan: Exclude<Plan, 'free'>): string {
  return `/billing/dry-run?plan=${encodeURIComponent(plan)}`;
}

// Helper: derive the "premium-features-allowed" boolean from a plan.
export function isPaidPlan(plan: Plan | undefined | null): boolean {
  if (!plan) return false;
  return plan !== 'free';
}

// Academic email detection — drives the free EDU Mull+ tier.
// We grant Mull+ at no charge to anyone whose primary email matches
// a recognised academic domain. The detection is intentionally
// permissive (better to comp Mull+ to a few false positives than
// turn away a real student / professor).
//
// Patterns covered:
//   - .edu                  (US universities + some K-12)
//   - .edu.<cc>             (Brazil .edu.br, India .edu.in, etc.)
//   - .ac.<cc>              (UK .ac.uk, JP .ac.jp, NZ .ac.nz, AU .ac.au, KR .ac.kr, ZA .ac.za, IN .ac.in, CN .ac.cn)
//   - .k12.<state>.us       (US K-12 districts)
//   - Common explicit school domains we whitelist by hand (none yet)
//
// If a partner institution uses a non-standard domain (e.g.
// alumni-style addresses), we can add it to EXTRA_EDU_DOMAINS below.

const EDU_REGEX = /(?:\.edu|\.edu\.[a-z]{2,3}|\.ac\.[a-z]{2,3}|\.k12\.[a-z]{2}\.us)$/i;

const EXTRA_EDU_DOMAINS = new Set<string>([
  // Add bespoke partner domains here, e.g. 'hostos.cuny.edu' (already
  // covered by .edu), 'maths.cam.ac.uk' (already covered by .ac.uk).
  // Kept as an escape hatch for institutions on non-standard TLDs.
]);

export function isEduEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const at = email.indexOf('@');
  if (at < 0) return false;
  const domain = email.slice(at + 1).toLowerCase().trim();
  if (!domain) return false;
  if (EDU_REGEX.test(domain)) return true;
  if (EXTRA_EDU_DOMAINS.has(domain)) return true;
  return false;
}
