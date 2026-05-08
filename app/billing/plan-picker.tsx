'use client';

// Three buttons → POST to checkout → navigate to returned URL.
// Live or dry-run is decided server-side; this component is the same.

import { useState } from 'react';
import { t, type Locale } from '@/lib/translations';

const sans = "'Inter', system-ui, sans-serif";

const PLAN_KEYS = ['plus_monthly', 'plus_yearly', 'founding_lifetime'] as const;
const PLAN_LABEL_KEYS: Record<typeof PLAN_KEYS[number], string> = {
  plus_monthly: 'billing.choose_monthly',
  plus_yearly: 'billing.choose_yearly',
  founding_lifetime: 'billing.choose_lifetime',
};

export default function PlanPicker({ locale = 'en' }: { locale?: Locale }) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function pick(plan: string) {
    setLoading(plan);
    setError(null);
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const json = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          // Not signed in.
          window.location.href = `/login?next=${encodeURIComponent('/billing')}`;
          return;
        }
        setError(json?.error || 'Could not start checkout.');
        setLoading(null);
        return;
      }
      if (json.checkoutUrl) {
        window.location.href = json.checkoutUrl;
      } else {
        setError('Checkout URL missing in response.');
        setLoading(null);
      }
    } catch (e) {
      console.error(e);
      setError('Network error.');
      setLoading(null);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {PLAN_KEYS.map(key => (
          <button
            key={key}
            type="button"
            onClick={() => pick(key)}
            disabled={!!loading}
            style={{
              fontFamily: sans,
              fontSize: 14.5,
              fontWeight: 500,
              padding: '13px 22px',
              background: '#221E18',
              color: '#FAF6EC',
              border: 'none',
              borderRadius: 8,
              cursor: loading ? 'wait' : 'pointer',
              opacity: loading && loading !== key ? 0.5 : (loading === key ? 0.8 : 1),
              textAlign: 'left',
            }}
          >
            {loading === key ? t('billing.starting', locale) : t(PLAN_LABEL_KEYS[key], locale)}
          </button>
        ))}
      </div>
      {error && (
        <div style={{
          marginTop: 12,
          padding: '10px 14px',
          background: 'rgba(122, 46, 46, 0.08)',
          border: '1px solid rgba(122, 46, 46, 0.2)',
          borderRadius: 6,
          fontFamily: sans,
          fontSize: 13,
          color: '#7A2E2E',
        }}>
          {error}
        </div>
      )}
    </div>
  );
}
