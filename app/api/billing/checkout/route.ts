// POST /api/billing/checkout
//
// Initiate a Stripe Checkout session for one of the paid plans.
// When STRIPE_SECRET_KEY is unset (dev / dry-run mode), redirects to
// the /billing/dry-run preview page so the flow can be exercised end
// to end without real charges.
//
// Body: { plan: 'plus_monthly' | 'plus_yearly' | 'founding_lifetime' }
//
// Required env vars (live mode):
//   STRIPE_SECRET_KEY              — sk_test_... or sk_live_...
//   NEXT_PUBLIC_SITE_URL (optional) — overrides https://mull.world
//                                     for success/cancel URLs

import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { PRICES, isDryRun, dryRunCheckoutUrl, type Plan } from '@/lib/billing';
import { getStripe } from '@/lib/stripe';

const VALID_PLANS = new Set<Plan>(['plus_monthly', 'plus_yearly', 'founding_lifetime']);

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://mull.world';
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const plan = body?.plan as Plan | undefined;
    if (!plan || !VALID_PLANS.has(plan)) {
      return NextResponse.json({ error: 'Invalid plan.' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Sign in to subscribe.' }, { status: 401 });

    const price = PRICES[plan as Exclude<Plan, 'free'>];

    // Dry-run fallback — returns the preview page URL so the UI flow
    // works without a Stripe account configured.
    if (isDryRun()) {
      return NextResponse.json({
        dryRun: true,
        checkoutUrl: dryRunCheckoutUrl(plan as Exclude<Plan, 'free'>),
        price,
      });
    }

    const stripe = getStripe();
    if (!stripe) {
      // Should be unreachable since isDryRun() == !STRIPE_SECRET_KEY,
      // but defensive: if the SDK init fails for some other reason we
      // surface a structured error instead of crashing.
      return NextResponse.json({
        error: 'Billing temporarily unavailable.',
      }, { status: 503 });
    }

    // Reuse a Stripe customer per Mull user. The subscriptions table
    // caches stripe_customer_id; if absent, create the customer now
    // and the webhook will fill in the rest after checkout completes.
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle<{ stripe_customer_id: string | null }>();

    let customerId = sub?.stripe_customer_id ?? null;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { mull_user_id: user.id },
      });
      customerId = customer.id;
    }

    // mode == 'payment' for the lifetime one-shot, 'subscription' for
    // the recurring plans. Stripe rejects recurring price_data on a
    // payment-mode session, so we conditionally include `recurring`.
    const isLifetime = plan === 'founding_lifetime';

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: isLifetime ? 'payment' : 'subscription',
      line_items: [{
        price_data: {
          currency: price.currency,
          product_data: {
            name: price.label,
            description: price.description,
          },
          unit_amount: price.amountCents,
          ...(isLifetime
            ? {}
            : { recurring: { interval: price.interval as 'month' | 'year' } }),
        },
        quantity: 1,
      }],
      success_url: `${siteUrl()}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl()}/billing`,
      metadata: {
        mull_user_id: user.id,
        plan,
      },
      // Save the plan on the subscription metadata too so the webhook
      // handler can recover plan info from a subscription event even
      // when the original checkout-session metadata isn't accessible.
      ...(isLifetime ? {} : {
        subscription_data: {
          metadata: {
            mull_user_id: user.id,
            plan,
          },
        },
      }),
    });

    if (!session.url) {
      return NextResponse.json({
        error: 'Stripe did not return a checkout URL.',
      }, { status: 502 });
    }
    return NextResponse.json({ checkoutUrl: session.url, price });
  } catch (e) {
    console.error('[billing/checkout] error', e);
    return NextResponse.json({ error: 'Could not start checkout.' }, { status: 500 });
  }
}
