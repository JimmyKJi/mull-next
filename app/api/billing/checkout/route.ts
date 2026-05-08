// POST /api/billing/checkout
//
// Initiate a checkout session. In dry-run mode (no STRIPE_SECRET_KEY)
// returns a fake URL the UI navigates to so the flow can be exercised end
// to end. In live mode, would call stripe.checkout.sessions.create().
//
// Body: { plan: 'plus_monthly' | 'plus_yearly' | 'founding_lifetime' }

import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { PRICES, isDryRun, dryRunCheckoutUrl, type Plan } from '@/lib/billing';

const VALID_PLANS = new Set<Plan>(['plus_monthly', 'plus_yearly', 'founding_lifetime']);

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

    if (isDryRun()) {
      return NextResponse.json({
        dryRun: true,
        checkoutUrl: dryRunCheckoutUrl(plan as Exclude<Plan, 'free'>),
        price,
      });
    }

    // ── Live mode ────────────────────────────────────────────────────
    // Real implementation, kept commented until `stripe` is installed:
    //
    // const Stripe = (await import('stripe')).default;
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    //
    // // Reuse customer if one exists; create otherwise.
    // const { data: sub } = await supabase
    //   .from('subscriptions')
    //   .select('stripe_customer_id')
    //   .eq('user_id', user.id)
    //   .maybeSingle();
    // let customerId = sub?.stripe_customer_id ?? null;
    // if (!customerId) {
    //   const customer = await stripe.customers.create({
    //     email: user.email ?? undefined,
    //     metadata: { mull_user_id: user.id },
    //   });
    //   customerId = customer.id;
    // }
    //
    // const session = await stripe.checkout.sessions.create({
    //   customer: customerId,
    //   mode: plan === 'founding_lifetime' ? 'payment' : 'subscription',
    //   line_items: [{
    //     price_data: {
    //       currency: price.currency,
    //       product_data: { name: price.label, description: price.description },
    //       unit_amount: price.amountCents,
    //       ...(plan !== 'founding_lifetime' && {
    //         recurring: { interval: price.interval as 'month' | 'year' },
    //       }),
    //     },
    //     quantity: 1,
    //   }],
    //   success_url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mull.world'}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    //   cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mull.world'}/billing`,
    //   metadata: { mull_user_id: user.id, plan },
    // });
    // return NextResponse.json({ checkoutUrl: session.url, price });

    return NextResponse.json({
      error: 'Live billing not wired up — Stripe SDK install pending. Run npm install stripe and replace the commented block in /api/billing/checkout/route.ts.',
    }, { status: 501 });
  } catch (e) {
    console.error('[billing/checkout] error', e);
    return NextResponse.json({ error: 'Could not start checkout.' }, { status: 500 });
  }
}
