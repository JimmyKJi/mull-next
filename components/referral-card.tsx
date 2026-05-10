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

'use client';

import { useEffect, useState } from 'react';

const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'Inter', system-ui, sans-serif";

type Props = {
  /** Pre-fetched referral code from the server, if available. */
  initialCode?: string | null;
  /** Pre-fetched count of users referred by this user. */
  initialCount?: number;
};

export default function ReferralCard({ initialCode = null, initialCount = 0 }: Props) {
  const [code, setCode] = useState<string | null>(initialCode);
  const [count, setCount] = useState<number>(initialCount);
  const [copied, setCopied] = useState(false);

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
      border: '1px solid #EBE3CA',
      borderLeft: '3px solid #B8862F',
      borderRadius: 8,
    }}>
      <div style={{
        fontFamily: sans, fontSize: 11, fontWeight: 600,
        color: '#8C6520', textTransform: 'uppercase',
        letterSpacing: '0.18em', marginBottom: 8,
      }}>
        Bring a friend
      </div>
      <p style={{
        fontFamily: serif, fontStyle: 'italic',
        fontSize: 15.5, color: '#4A4338',
        margin: '0 0 14px', lineHeight: 1.55,
      }}>
        Two people thinking on the same questions sharpens both maps.
        {count > 0 && (
          <> {count} {count === 1 ? 'friend has' : 'friends have'} joined via your link.</>
        )}
      </p>

      <div style={{
        display: 'flex',
        gap: 8,
        alignItems: 'center',
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
            border: '1px solid #D6CDB6',
            borderRadius: 6,
            background: '#FAF6EC',
            fontFamily: 'ui-monospace, Menlo, monospace',
            fontSize: 13,
            color: '#221E18',
          }}
        />
        <button
          type="button"
          onClick={copy}
          style={{
            padding: '10px 18px',
            background: copied ? '#2F5D5C' : '#221E18',
            color: '#FAF6EC',
            border: 'none',
            borderRadius: 6,
            fontFamily: sans,
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            letterSpacing: 0.4,
          }}
        >
          {copied ? '✓ Copied' : 'Copy link'}
        </button>
      </div>
      <p style={{
        fontFamily: sans, fontSize: 11.5, color: '#8C6520',
        margin: '10px 0 0', opacity: 0.8, letterSpacing: 0.2,
      }}>
        Friends who join via your link show as &ldquo;introduced by you&rdquo; on their public profile (if they make one).
      </p>
    </section>
  );
}
