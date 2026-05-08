// Dry-run "checkout" page. Lets us exercise the full flow during
// development without a real payment processor.

import Link from 'next/link';
import { PRICES, type Plan } from '@/lib/billing';
import { getServerLocale } from '@/lib/locale-server';
import { t } from '@/lib/translations';

const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'Inter', system-ui, sans-serif";

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
      <Link href="/" style={{
        fontFamily: serif,
        fontSize: 28,
        fontWeight: 500,
        color: '#221E18',
        textDecoration: 'none',
        letterSpacing: '-0.5px',
        display: 'inline-block',
        marginBottom: 36,
      }}>
        Mull<span style={{ color: '#B8862F' }}>.</span>
      </Link>

      <div style={{
        padding: '32px 28px',
        background: '#FFFCF4',
        border: '1px solid #D6CDB6',
        borderRadius: 12,
      }}>
        <div style={{
          fontFamily: sans,
          fontSize: 11,
          fontWeight: 600,
          color: '#8C6520',
          textTransform: 'uppercase',
          letterSpacing: '0.18em',
          marginBottom: 14,
        }}>
          {t('billing.dryrun_title', locale)}
        </div>

        {price ? (
          <>
            <h1 style={{
              fontFamily: serif,
              fontSize: 26,
              fontWeight: 500,
              margin: '0 0 8px',
            }}>
              {price.label}
            </h1>
            <p style={{
              fontFamily: serif,
              fontStyle: 'italic',
              fontSize: 16,
              color: '#4A4338',
              margin: '0 0 24px',
              lineHeight: 1.55,
            }}>
              ${(price.amountCents / 100).toFixed(price.amountCents % 100 === 0 ? 0 : 2)} · {price.interval === 'lifetime' ? 'one-time' : 'per ' + price.interval}
            </p>
          </>
        ) : (
          <p style={{ fontFamily: serif, fontSize: 17, color: '#7A2E2E', margin: '0 0 24px' }}>
            No valid plan in URL.
          </p>
        )}

        <p style={{
          fontFamily: sans,
          fontSize: 13.5,
          color: '#4A4338',
          margin: '0 0 24px',
          lineHeight: 1.6,
        }}>
          {t('billing.dryrun_body', locale)}
        </p>

        <Link href="/billing" style={{
          display: 'inline-block',
          padding: '11px 20px',
          background: '#221E18',
          color: '#FAF6EC',
          textDecoration: 'none',
          borderRadius: 8,
          fontFamily: sans,
          fontSize: 14,
          fontWeight: 500,
        }}>
          {t('billing.back_to_plans', locale)}
        </Link>
      </div>
    </main>
  );
}
