// Dry-run "checkout" page. Lets us exercise the full flow during
// development without a real payment processor.
//
// v3 pixel chrome: chunky pixel-window with amber drop-shadow.
// Pixel-display headings + pixel back-to-plans button. Looks like a
// JRPG "purchase confirmed" dialog.

import Link from 'next/link';
import { PRICES, type Plan } from '@/lib/billing';
import { getServerLocale } from '@/lib/locale-server';
import { t } from '@/lib/translations';
import MullWordmark from '@/components/mull-wordmark';

const serif = "'Cormorant Garamond', Georgia, serif";
const pixel = "var(--font-pixel-display, 'Courier New', monospace)";

export default async function DryRunCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const { plan } = await searchParams;
  const locale = await getServerLocale();
  const valid = plan && (plan === 'plus_monthly' || plan === 'plus_yearly' || plan === 'founding_lifetime');
  const price = valid ? PRICES[plan as Exclude<Plan, 'free'>] : null;

  return (
    <main style={{ maxWidth: 540, margin: '120px auto', padding: '0 24px', textAlign: 'center' }}>
      <div style={{ marginBottom: 36 }}>
        <MullWordmark />
      </div>

      <div style={{
        padding: '32px 28px',
        background: '#FFFCF4',
        border: '4px solid #221E18',
        boxShadow: '6px 6px 0 0 #B8862F',
        borderRadius: 0,
      }}>
        <div style={{
          fontFamily: pixel,
          fontSize: 12,
          color: '#8C6520',
          textTransform: 'uppercase',
          letterSpacing: '0.18em',
          marginBottom: 16,
        }}>
          ▸ {t('billing.dryrun_title', locale).toUpperCase()}
        </div>

        {price ? (
          <>
            <h1 style={{
              fontFamily: serif,
              fontSize: 26,
              fontWeight: 500,
              margin: '0 0 10px',
            }}>
              {price.label}
            </h1>
            <p style={{
              fontFamily: pixel,
              fontSize: 14,
              color: '#4A4338',
              margin: '0 0 26px',
              letterSpacing: 0.4,
              textTransform: 'uppercase',
            }}>
              ${(price.amountCents / 100).toFixed(price.amountCents % 100 === 0 ? 0 : 2)} · {(price.interval === 'lifetime' ? 'one-time' : 'per ' + price.interval).toUpperCase()}
            </p>
          </>
        ) : (
          <p style={{ fontFamily: serif, fontSize: 17, color: '#7A2E2E', margin: '0 0 24px' }}>
            No valid plan in URL.
          </p>
        )}

        <p style={{
          fontFamily: serif,
          fontStyle: 'italic',
          fontSize: 15,
          color: '#4A4338',
          margin: '0 0 28px',
          lineHeight: 1.6,
        }}>
          {t('billing.dryrun_body', locale)}
        </p>

        <Link href="/billing" className="pixel-press" style={{
          display: 'inline-block',
          padding: '12px 22px',
          background: '#221E18',
          color: '#FAF6EC',
          textDecoration: 'none',
          borderRadius: 0,
          border: '4px solid #221E18',
          boxShadow: '4px 4px 0 0 #B8862F',
          fontFamily: pixel,
          fontSize: 12,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end)',
        }}>
          ◂ {t('billing.back_to_plans', locale).toUpperCase()}
        </Link>
      </div>
    </main>
  );
}
