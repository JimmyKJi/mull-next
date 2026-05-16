// /billing/success — landing page after a Stripe Checkout completes.
//
// Stripe redirects here with ?session_id=cs_… We don't actually
// need to verify the session here — the webhook is the source of
// truth and will have upserted the subscription row by the time the
// browser arrives (usually). The page just thanks the user and
// links them into /account where their new plan shows up.
//
// If the webhook hasn't fired yet (slow connection / Stripe queue),
// we show a brief "your subscription is being activated" beat and
// let the user proceed; the next /account load will reflect the
// new plan once the webhook lands.

import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import MullWordmark from '@/components/mull-wordmark';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Welcome to Mull+',
  robots: { index: false, follow: false },
};

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";
const serif = "'Cormorant Garamond', Georgia, serif";

export default async function BillingSuccessPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Read the subscription if it exists yet. Webhook race is OK — we
  // just show a slightly different "activating" message.
  let plan: string | null = null;
  let foundingSeat: number | null = null;
  if (user) {
    const { data } = await supabase
      .from('subscriptions')
      .select('plan, founding_seat_number')
      .eq('user_id', user.id)
      .maybeSingle<{ plan: string; founding_seat_number: number | null }>();
    plan = data?.plan ?? null;
    foundingSeat = data?.founding_seat_number ?? null;
  }

  const activated = plan && plan !== 'free';

  return (
    <main style={{ maxWidth: 560, margin: '0 auto', padding: '80px 24px 120px' }}>
      <div style={{ marginBottom: 36 }}>
        <MullWordmark />
      </div>

      <div style={{
        padding: '32px 30px',
        background: '#FFFCF4',
        border: '4px solid #221E18',
        boxShadow: '6px 6px 0 0 #B8862F',
        borderRadius: 0,
        textAlign: 'center',
      }}>
        <div style={{
          fontFamily: pixel,
          fontSize: 12,
          color: '#8C6520',
          textTransform: 'uppercase',
          letterSpacing: '0.18em',
          marginBottom: 14,
        }}>
          ▸ {activated ? 'WELCOME TO MULL+' : 'ACTIVATING…'}
        </div>
        <h1 style={{
          fontFamily: pixel,
          fontSize: 30,
          margin: '0 0 16px',
          color: '#221E18',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          textShadow: '3px 3px 0 #B8862F',
          lineHeight: 1.1,
        }}>
          {activated ? 'YOU\'RE IN.' : 'JUST A MOMENT.'}
        </h1>
        <p style={{
          fontFamily: serif,
          fontStyle: 'italic',
          fontSize: 17,
          color: '#4A4338',
          margin: '0 0 22px',
          lineHeight: 1.55,
        }}>
          {activated
            ? 'Your subscription is active. Yearly retrospectives, unlimited dilemma analysis, and the rest of Mull+ are unlocked on your account.'
            : "Your payment went through. Stripe is letting us know any second now — your account will reflect Mull+ on the next page load."}
        </p>

        {foundingSeat && (
          <div style={{
            display: 'inline-block',
            padding: '8px 16px',
            background: '#221E18',
            color: '#FAF6EC',
            border: '3px solid #221E18',
            boxShadow: '3px 3px 0 0 #B8862F',
            borderRadius: 0,
            fontFamily: pixel,
            fontSize: 11,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: 22,
          }}>
            ▸ FOUNDING MIND · SEAT #{foundingSeat} / 1000
          </div>
        )}

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          justifyContent: 'center',
          marginTop: 8,
        }}>
          <Link
            href="/account"
            className="pixel-press"
            style={{
              display: 'inline-block',
              padding: '12px 22px',
              background: '#221E18',
              color: '#FAF6EC',
              border: '4px solid #221E18',
              boxShadow: '4px 4px 0 0 #B8862F',
              borderRadius: 0,
              fontFamily: pixel,
              fontSize: 12,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end)',
            }}
          >
            ▸ OPEN MY ACCOUNT
          </Link>
          <Link
            href="/dilemma"
            className="pixel-press"
            style={{
              display: 'inline-block',
              padding: '12px 22px',
              background: '#FFFCF4',
              color: '#2F5D5C',
              border: '4px solid #221E18',
              boxShadow: '4px 4px 0 0 #2F5D5C',
              borderRadius: 0,
              fontFamily: pixel,
              fontSize: 12,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end)',
            }}
          >
            ▸ TODAY'S DILEMMA
          </Link>
        </div>
      </div>
    </main>
  );
}
