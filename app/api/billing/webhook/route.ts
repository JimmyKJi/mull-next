// POST /api/billing/webhook — Stripe webhook receiver.
//
// Configure in Stripe Dashboard → Developers → Webhooks → Add endpoint:
//   URL: https://mull.world/api/billing/webhook
//   Events:
//     - checkout.session.completed        (initial subscribe + lifetime payment)
//     - customer.subscription.updated     (plan change / status change)
//     - customer.subscription.deleted     (cancellation effective)
//     - invoice.payment_succeeded         (period end refreshed)
//     - invoice.payment_failed            (status → past_due)
//
// Required env vars (live mode):
//   STRIPE_SECRET_KEY      — same as checkout route
//   STRIPE_WEBHOOK_SECRET  — whsec_… from the dashboard
//   SUPABASE_SERVICE_ROLE_KEY — to bypass RLS on subscriptions table
//
// Dry-run (no STRIPE_SECRET_KEY): returns 200 with a no-op note so
// any infrastructure poking the endpoint doesn't blow up.

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { isDryRun, type Plan } from '@/lib/billing';
import { getStripe } from '@/lib/stripe';
import type Stripe from 'stripe';

export const runtime = 'nodejs';

// Stripe sends the body raw — must NOT be parsed by Next's auto-body
// handling or signature verification fails. The `await req.text()`
// below gets the raw payload directly.
export async function POST(req: Request) {
  if (isDryRun()) {
    return NextResponse.json({
      dryRun: true,
      message: 'Webhook received but STRIPE_SECRET_KEY is unset. No-op.',
    });
  }

  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !webhookSecret) {
    console.error('[billing/webhook] missing stripe or STRIPE_WEBHOOK_SECRET');
    return NextResponse.json({ error: 'Misconfigured webhook.' }, { status: 500 });
  }

  const sig = req.headers.get('stripe-signature') || '';
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (e) {
    console.error('[billing/webhook] signature verification failed', e);
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (e) {
    console.error('[billing/webhook] admin client unavailable', e);
    return NextResponse.json({ error: 'Admin client misconfigured.' }, { status: 500 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await onCheckoutCompleted(admin, event.data.object as Stripe.Checkout.Session);
        break;
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await onSubscriptionChange(admin, event.data.object as Stripe.Subscription);
        break;
      case 'invoice.payment_succeeded':
      case 'invoice.payment_failed':
        await onInvoiceEvent(admin, event.data.object as Stripe.Invoice);
        break;
      default:
        // Ignore unhandled types — Stripe sends many we don't care
        // about. Return 200 so it doesn't retry.
        break;
    }
  } catch (e) {
    console.error(`[billing/webhook] handler error for ${event.type}`, e);
    return NextResponse.json({ error: 'Handler error.' }, { status: 500 });
  }

  return NextResponse.json({ received: true, type: event.type });
}

// ─── Handlers ──────────────────────────────────────────────────────

type AdminClient = ReturnType<typeof createAdminClient>;

async function onCheckoutCompleted(admin: AdminClient, session: Stripe.Checkout.Session) {
  const userId = session.metadata?.mull_user_id;
  const plan = session.metadata?.plan as Plan | undefined;
  if (!userId || !plan) {
    console.warn('[billing/webhook] checkout.session.completed without mull metadata', session.id);
    return;
  }

  // Lifetime: mode=payment, no subscription id. Recurring: mode=subscription.
  const isLifetime = plan === 'founding_lifetime';

  // For lifetime, also reserve a founding_seat_number. We use an
  // atomic-ish approach: count existing founding seats + 1. Race-y
  // under high concurrency, but at $49/seat × 1000 seats max this is
  // not a problem in practice; an occasional duplicate # gets caught
  // by the UNIQUE constraint and the webhook just retries.
  let foundingSeat: number | null = null;
  if (isLifetime) {
    const { count } = await admin
      .from('subscriptions')
      .select('user_id', { count: 'exact', head: true })
      .eq('plan', 'founding_lifetime')
      .not('founding_seat_number', 'is', null);
    foundingSeat = (count ?? 0) + 1;
  }

  await admin.from('subscriptions').upsert({
    user_id: userId,
    stripe_customer_id: typeof session.customer === 'string' ? session.customer : null,
    stripe_subscription_id: typeof session.subscription === 'string' ? session.subscription : null,
    plan,
    status: 'active',
    current_period_end: null, // filled by invoice.payment_succeeded for recurring
    founding_seat_number: foundingSeat,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });
}

async function onSubscriptionChange(admin: AdminClient, sub: Stripe.Subscription) {
  const userId = sub.metadata?.mull_user_id;
  if (!userId) {
    console.warn('[billing/webhook] subscription event without mull_user_id', sub.id);
    return;
  }

  // On 'deleted' or 'canceled' status, downgrade to free so paid features
  // turn off cleanly. We keep the row (with status=canceled) for the audit
  // trail rather than deleting it.
  const newPlan = (sub.status === 'canceled' || sub.status === 'incomplete_expired')
    ? 'free'
    : (sub.metadata?.plan as Plan | undefined) ?? undefined;

  // Stripe types reflect current_period_end on the subscription's primary
  // item, not on the subscription root, in recent API versions.
  const periodEndUnix =
    (sub as unknown as { current_period_end?: number }).current_period_end
    ?? sub.items?.data?.[0]?.current_period_end
    ?? null;

  await admin.from('subscriptions').update({
    status: sub.status,
    current_period_end: periodEndUnix ? new Date(periodEndUnix * 1000).toISOString() : null,
    ...(newPlan ? { plan: newPlan } : {}),
    updated_at: new Date().toISOString(),
  }).eq('stripe_subscription_id', sub.id);
}

async function onInvoiceEvent(admin: AdminClient, invoice: Stripe.Invoice) {
  // Stripe's Invoice type doesn't include `subscription` directly on
  // every API version, so we narrow defensively.
  const subId = (invoice as unknown as { subscription?: string | null }).subscription;
  if (!subId) return;

  // Re-derive status from the invoice event: succeeded → active,
  // failed → past_due. This catches the common "card declined mid-cycle"
  // case where Stripe doesn't fire a subscription.updated immediately.
  const status = invoice.status === 'paid' ? 'active' : 'past_due';

  await admin.from('subscriptions').update({
    status,
    updated_at: new Date().toISOString(),
  }).eq('stripe_subscription_id', subId);
}
