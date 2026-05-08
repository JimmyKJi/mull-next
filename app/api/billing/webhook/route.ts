// POST /api/billing/webhook — Stripe webhook receiver.
//
// SCAFFOLD: signature verification + event-handler skeletons in place,
// real Stripe SDK calls commented out until `stripe` is installed.
//
// Stripe Dashboard → Developers → Webhooks → Add endpoint:
//   URL: https://mull.world/api/billing/webhook
//   Events to listen for:
//     - checkout.session.completed
//     - customer.subscription.updated
//     - customer.subscription.deleted
//     - invoice.payment_succeeded
//     - invoice.payment_failed

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { isDryRun, type Plan } from '@/lib/billing';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature') || '';
  const body = await req.text();

  if (isDryRun()) {
    return NextResponse.json({
      dryRun: true,
      message: 'Webhook received but Stripe SDK not installed. No-op.',
    });
  }

  // ── Live mode (commented until stripe is installed) ────────────────
  //
  // const Stripe = (await import('stripe')).default;
  // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  // let event;
  // try {
  //   event = stripe.webhooks.constructEvent(
  //     body,
  //     sig,
  //     process.env.STRIPE_WEBHOOK_SECRET!
  //   );
  // } catch (e) {
  //   console.error('[billing/webhook] signature verification failed', e);
  //   return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 });
  // }
  //
  // const admin = createAdminClient();
  //
  // switch (event.type) {
  //   case 'checkout.session.completed': {
  //     const session = event.data.object as any;
  //     const userId = session.metadata?.mull_user_id;
  //     const plan = session.metadata?.plan as Plan;
  //     if (!userId || !plan) break;
  //     await admin.from('subscriptions').upsert({
  //       user_id: userId,
  //       stripe_customer_id: session.customer,
  //       stripe_subscription_id: session.subscription,
  //       plan,
  //       status: plan === 'founding_lifetime' ? 'active' : (session.subscription ? 'active' : 'incomplete'),
  //       updated_at: new Date().toISOString(),
  //     }, { onConflict: 'user_id' });
  //     break;
  //   }
  //   case 'customer.subscription.updated':
  //   case 'customer.subscription.deleted': {
  //     const sub = event.data.object as any;
  //     await admin.from('subscriptions').update({
  //       status: sub.status,
  //       current_period_end: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null,
  //       plan: sub.status === 'active' ? undefined : 'free', // downgrade on cancel
  //       updated_at: new Date().toISOString(),
  //     }).eq('stripe_subscription_id', sub.id);
  //     break;
  //   }
  //   case 'invoice.payment_succeeded':
  //   case 'invoice.payment_failed':
  //     // Keep period_end fresh / mark past_due. Same upsert pattern.
  //     break;
  // }
  //
  // return NextResponse.json({ received: true });

  // Suppress unused-var warnings on the placeholders.
  void sig; void body; void createAdminClient;
  return NextResponse.json({
    error: 'Live webhook not wired up — Stripe SDK install pending.',
  }, { status: 501 });
}
