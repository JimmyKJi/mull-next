'use client';

// Three buttons → POST to checkout → navigate to returned URL.
// Live or dry-run is decided server-side; this component is the same.
//
// v3 pixel chrome: chunky pixel-button look. Buttons stack and span
// the full row. The clicked one stays at full opacity while the
// others dim, signalling the in-flight choice.

import { useState } from 'react';
import { t, type Locale } from '@/lib/translations';

const sans = "'Inter', system-ui, sans-serif";
const pixel = "var(--font-pixel-display, 'Courier New', monospace)";

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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {PLAN_KEYS.map(key => {
          const isPrimary = key === 'plus_yearly';
          return (
            <button
              key={key}
              type="button"
              onClick={() => pick(key)}
              disabled={!!loading}
              style={{
                fontFamily: pixel,
                fontSize: 13,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                padding: '14px 22px',
                background: isPrimary ? '#B8862F' : '#221E18',
                color: isPrimary ? '#1A1612' : '#FAF6EC',
                border: '4px solid #221E18',
                borderRadius: 0,
                boxShadow: isPrimary ? '4px 4px 0 0 #221E18' : '4px 4px 0 0 #B8862F',
                cursor: loading ? 'wait' : 'pointer',
                opacity: loading && loading !== key ? 0.5 : (loading === key ? 0.85 : 1),
                textAlign: 'left',
                transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end)',
              }}
            >
              ▸ {(loading === key ? t('billing.starting', locale) : t(PLAN_LABEL_KEYS[key], locale)).toUpperCase()}
            </button>
          );
        })}
      </div>
      {error && (
        <div style={{
          marginTop: 14,
          padding: '10px 14px',
          background: 'rgba(122, 46, 46, 0.08)',
          border: '2px solid #7A2E2E',
          borderRadius: 0,
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
