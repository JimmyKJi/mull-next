// Stripe SDK lazy-singleton. The SDK is heavy (~200KB minified) and
// only needed by /api/billing/checkout + /api/billing/webhook. By
// importing it through this helper we keep cold-start cost off any
// route that doesn't need billing.
//
// Returns null when STRIPE_SECRET_KEY is unset — callers should
// check isDryRun() from lib/billing first; this helper is the actual
// gate that ensures we never instantiate Stripe with a missing key.

import Stripe from 'stripe';

let cached: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (cached) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  cached = new Stripe(key, {
    // Pin the API version so a Stripe-side upgrade doesn't silently
    // break our webhook parsing. Bump intentionally when verified.
    apiVersion: '2026-04-22.dahlia',
    appInfo: { name: 'mull', url: 'https://mull.world' },
  });
  return cached;
}
