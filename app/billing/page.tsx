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
        fontFamily: sans,
        fontSize: 11,
        fontWeight: 600,
        color: '#8C6520',
        textTransform: 'uppercase',
        letterSpacing: '0.18em',
        marginBottom: 14,
      }}>
        {t('billing.eyebrow', locale)}
      </div>
      <h1 style={{
        fontFamily: serif,
        fontSize: 44,
        fontWeight: 500,
        margin: '0 0 12px',
        letterSpacing: '-0.5px',
        lineHeight: 1.05,
      }}>
        {t('billing.title', locale)}
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
        background: '#FBF6E8',
        borderLeft: '3px solid #B8862F',
        borderRadius: 8,
        fontFamily: sans,
        fontSize: 13.5,
        color: '#4A4338',
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
      padding: '22px 22px 16px',
      background: primary ? '#FFFCF4' : 'transparent',
      border: '1px solid ' + (primary ? '#D6CDB6' : '#EBE3CA'),
      borderLeft: '3px solid ' + accent,
      borderRadius: 10,
    }}>
      {badge && (
        <div style={{
          fontFamily: sans,
          fontSize: 10,
          fontWeight: 600,
          color: accent,
          textTransform: 'uppercase',
          letterSpacing: '0.16em',
          marginBottom: 10,
        }}>
          {badge}
        </div>
      )}
      <div style={{
        fontFamily: serif,
        fontSize: 32,
        fontWeight: 500,
        color: '#221E18',
        margin: '0 0 4px',
        letterSpacing: '-0.4px',
      }}>
        {headline}
      </div>
      <div style={{
        fontFamily: sans,
        fontSize: 13.5,
        fontWeight: 500,
        color: '#221E18',
        marginBottom: 8,
      }}>
        {label}
      </div>
      <p style={{
        margin: 0,
        fontFamily: sans,
        fontSize: 13,
        color: '#4A4338',
        lineHeight: 1.55,
      }}>
        {description}
      </p>
    </div>
  );
}
