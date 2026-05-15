// /billing — pricing page. Three plans (monthly, yearly, lifetime).
// Click on one POSTs to /api/billing/checkout and navigates to the
// returned checkout URL. In dry-run mode that's a fake page; in live
// mode, real Stripe Checkout.

import Link from 'next/link';
import { getServerLocale } from '@/lib/locale-server';
import { t } from '@/lib/translations';
import LanguageSwitcher from '@/components/language-switcher';
import { PRICES } from '@/lib/billing';
import PlanPicker from './plan-picker';
import type { Metadata } from 'next';

const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'Inter', system-ui, sans-serif";
const pixel = "var(--font-pixel-display, 'Courier New', monospace)";

export const metadata: Metadata = {
  title: 'Mull+',
  description: 'Subscribe to Mull+ — yearly retrospectives, unlimited dilemma analysis, and the rest of the deeper features.',
  alternates: { canonical: 'https://mull.world/billing' },
};

export default async function BillingPage() {
  const locale = await getServerLocale();
  const fmt = (cents: number) => `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;

  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '60px 24px 120px' }}>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 36,
        flexWrap: 'wrap',
        gap: 16,
      }}>
        <Link href="/" style={{
          fontFamily: serif,
          fontSize: 28,
          fontWeight: 500,
          color: '#221E18',
          textDecoration: 'none',
          letterSpacing: '-0.5px',
        }}>
          Mull<span style={{ color: '#B8862F' }}>.</span>
        </Link>
        <LanguageSwitcher initial={locale} />
      </header>

      <div style={{
        fontFamily: pixel,
        fontSize: 12,
        color: '#8C6520',
        textTransform: 'uppercase',
        letterSpacing: '0.18em',
        marginBottom: 14,
      }}>
        ▸ {t('billing.eyebrow', locale).toUpperCase()}
      </div>
      <h1 style={{
        fontFamily: pixel,
        fontSize: 36,
        margin: '0 0 14px',
        color: '#221E18',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        textShadow: '3px 3px 0 #B8862F',
        lineHeight: 1.1,
      }}>
        {t('billing.title', locale).toUpperCase()}
      </h1>
      <p style={{
        fontFamily: serif,
        fontStyle: 'italic',
        fontSize: 18,
        color: '#4A4338',
        margin: '0 0 36px',
        lineHeight: 1.55,
      }}>
        {t('billing.subtitle', locale)}
      </p>

      <div style={{
        padding: '14px 18px',
        background: '#F8EDC8',
        border: '3px solid #221E18',
        boxShadow: '3px 3px 0 0 #B8862F',
        borderRadius: 0,
        fontFamily: serif,
        fontSize: 14.5,
        color: '#221E18',
        marginBottom: 36,
        lineHeight: 1.55,
      }}>
        {t('billing.dryrun_notice', locale)}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 14,
      }}>
        <PlanCard
          plan="plus_monthly"
          accent="#2F5D5C"
          headline={fmt(PRICES.plus_monthly.amountCents) + '/mo'}
          label={PRICES.plus_monthly.label}
          description={t('billing.plus_monthly_desc', locale)}
        />
        <PlanCard
          plan="plus_yearly"
          accent="#221E18"
          headline={fmt(PRICES.plus_yearly.amountCents) + '/yr'}
          label={PRICES.plus_yearly.label}
          description={t('billing.plus_yearly_desc', locale)}
          badge={t('billing.badge_yearly', locale)}
          primary
        />
        <PlanCard
          plan="founding_lifetime"
          accent="#8C6520"
          headline={fmt(PRICES.founding_lifetime.amountCents) + ' once'}
          label={PRICES.founding_lifetime.label}
          description={t('billing.lifetime_desc', locale)}
          badge={t('billing.badge_lifetime', locale)}
        />
      </div>

      <div style={{ marginTop: 48 }}>
        <PlanPicker locale={locale} />
      </div>

      <p style={{
        marginTop: 56,
        fontFamily: sans,
        fontSize: 12.5,
        color: '#8C6520',
        opacity: 0.8,
        lineHeight: 1.6,
      }}>
        {t('billing.cancel_anytime', locale)}
      </p>
    </main>
  );
}

// One billing-plan tile. Pixel chrome with the plan accent colour as
// the hard drop shadow. Primary tile (yearly) gets the amber fill so
// the recommended plan reads at-a-glance.
function PlanCard({ plan, accent, headline, label, description, badge, primary }: {
  plan: string;
  accent: string;
  headline: string;
  label: string;
  description: string;
  badge?: string;
  primary?: boolean;
}) {
  return (
    <div data-plan={plan} style={{
      padding: '22px 22px 18px',
      background: primary ? '#F8EDC8' : '#FFFCF4',
      border: '4px solid #221E18',
      boxShadow: `5px 5px 0 0 ${accent}`,
      borderRadius: 0,
    }}>
      {badge && (
        <div style={{
          fontFamily: pixel,
          fontSize: 10,
          color: accent,
          textTransform: 'uppercase',
          letterSpacing: '0.18em',
          marginBottom: 10,
          padding: '3px 8px',
          background: '#FFFCF4',
          border: `2px solid ${accent}`,
          display: 'inline-block',
        }}>
          ▸ {badge.toUpperCase()}
        </div>
      )}
      <div style={{
        fontFamily: pixel,
        fontSize: 28,
        color: '#221E18',
        margin: '0 0 6px',
        letterSpacing: 0.4,
      }}>
        {headline}
      </div>
      <div style={{
        fontFamily: serif,
        fontSize: 16,
        fontWeight: 500,
        color: '#221E18',
        marginBottom: 10,
      }}>
        {label}
      </div>
      <p style={{
        margin: 0,
        fontFamily: serif,
        fontSize: 14,
        color: '#4A4338',
        lineHeight: 1.55,
      }}>
        {description}
      </p>
    </div>
  );
}
