// Friend-invite card for /account.
//
// On mount: fires POST /api/referral/save once. That endpoint
// (a) generates the user's referral code if they don't have one,
// (b) attributes the signup to a referrer if there's a cookie
// from /r/<code>, (c) returns the user's code + referral count.
//
// We then render a copy-to-clipboard invite link plus a small
// "X friends joined" tally. The card stays present even when the
// count is 0 — the invite link is the primary action; the count
// is the long-term feedback loop.
//
// v3 pixel chrome: chunky amber-shadowed pixel window. The link
// input is a monospace pixel field, the copy button is a pixel
// button that swaps to teal when the user copies.

'use client';

import { useEffect, useState } from 'react';
import { t, type Locale, isLocale } from '@/lib/translations';

const serif = "var(--font-prose)";
const pixel = "var(--font-pixel-display, 'Courier New', monospace)";

type Props = {
  /** Pre-fetched referral code from the server, if available. */
  initialCode?: string | null;
  /** Pre-fetched count of users referred by this user. */
  initialCount?: number;
};

export default function ReferralCard({ initialCode = null, initialCount = 0 }: Props) {
  const [code, setCode] = useState<string | null>(initialCode);
  const [count] = useState<number>(initialCount);
  const [copied, setCopied] = useState(false);
  const [locale, setLocale] = useState<Locale>('en');

  useEffect(() => {
    const m = document.cookie.match(/(?:^|; )mull_locale=([^;]+)/);
    const v = m?.[1];
    if (v && isLocale(v)) setLocale(v);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/referral/save', { method: 'POST' });
        if (!res.ok) return;
        const json = await res.json();
        if (cancelled) return;
        if (json.code) setCode(json.code);
      } catch {
        /* swallow — referral system is best-effort */
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (!code) {
    // Don't show the card if we couldn't establish a code (e.g.
    // before the API has responded on the very first /account load).
    return null;
  }

  const url = typeof window !== 'undefined'
    ? `${window.location.origin}/r/${code}`
    : `https://mull.world/r/${code}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Fallback: select the input
    }
  }

  return (
    <section style={{
      marginTop: 28,
      padding: '20px 24px',
      background: '#FFFCF4',
      border: '4px solid var(--color-ink)',
      boxShadow: '5px 5px 0 0 var(--color-acc)',
      borderRadius: 0,
    }}>
      <div style={{
        fontFamily: pixel, fontSize: 12,
        color: 'var(--color-acc-deep)', textTransform: 'uppercase',
        letterSpacing: '0.18em', marginBottom: 10,
      }}>
        ▸ {t('crd.referral_eyebrow', locale)}
      </div>
      <p style={{
        fontFamily: serif, fontStyle: 'italic',
        fontSize: 15.5, color: 'var(--color-ink-soft)',
        margin: '0 0 16px', lineHeight: 1.55,
      }}>
        {t('crd.referral_lead', locale)}
        {count > 0 && (
          <> {t(count === 1 ? 'crd.referral_count_one' : 'crd.referral_count_many', locale, { n: count })}</>
        )}
      </p>

      <div style={{
        display: 'flex',
        gap: 10,
        alignItems: 'stretch',
        flexWrap: 'wrap',
      }}>
        <input
          readOnly
          value={url}
          onFocus={(e) => e.currentTarget.select()}
          style={{
            flex: '1 1 240px',
            minWidth: 0,
            padding: '10px 12px',
            border: '3px solid var(--color-ink)',
            borderRadius: 0,
            background: 'var(--color-acc-soft)',
            fontFamily: 'ui-monospace, Menlo, monospace',
            fontSize: 13,
            color: 'var(--color-ink)',
            outline: 'none',
          }}
        />
        <button
          type="button"
          onClick={copy}
          className="pixel-press"
          style={{
            padding: '10px 18px',
            background: copied ? '#2F5D5C' : 'var(--color-ink)',
            color: 'var(--color-cream)',
            border: '3px solid var(--color-ink)',
            borderRadius: 0,
            boxShadow: '3px 3px 0 0 var(--color-acc)',
            fontFamily: pixel,
            fontSize: 12,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end)',
          }}
        >
          {copied ? `✓ ${t('crd.copied_label', locale)}` : t('crd.copy_link', locale)}
        </button>
      </div>
      <p style={{
        fontFamily: serif, fontStyle: 'italic', fontSize: 13,
        color: 'var(--color-acc-deep)',
        margin: '12px 0 0', opacity: 0.85, lineHeight: 1.5,
      }}>
        {t('crd.referral_note', locale)}
      </p>
    </section>
  );
}
