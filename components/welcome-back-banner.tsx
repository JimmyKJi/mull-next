// WelcomeBackBanner — client-only component that tracks the user's
// last /account visit in localStorage and shows a small pixel banner
// when they return after a meaningful gap (>3 days). Auto-dismisses
// after 6 seconds or on click.
//
// Stays silent on:
//   - First-ever visit (no prior timestamp stashed)
//   - Same-day or recent visits (<3 days since last)
//   - Subsequent visits within the same session (we stash on mount)
//
// The component is purely additive: it renders nothing visible
// most of the time, and never blocks the rest of /account from
// loading. The localStorage key is namespaced with mull. to avoid
// collisions with other apps on the same origin.

'use client';

import { useEffect, useState } from 'react';

const KEY = 'mull.last_account_visit';
const THRESHOLD_DAYS = 3;

function relativeGap(daysAgo: number): string {
  if (daysAgo < 7) return `${daysAgo} days`;
  if (daysAgo < 30) {
    const w = Math.round(daysAgo / 7);
    return w === 1 ? 'a week' : `${w} weeks`;
  }
  if (daysAgo < 365) {
    const m = Math.round(daysAgo / 30);
    return m === 1 ? 'a month' : `${m} months`;
  }
  const y = Math.round(daysAgo / 365);
  return y === 1 ? 'a year' : `${y} years`;
}

export default function WelcomeBackBanner() {
  const [daysAgo, setDaysAgo] = useState<number | null>(null);

  useEffect(() => {
    try {
      const now = Date.now();
      const raw = window.localStorage.getItem(KEY);
      const prior = raw ? Number(raw) : NaN;
      // Always stash the current visit so the next visit can compute
      // the gap. Do this before deciding whether to show — even if we
      // don't show the banner this time, we still want the timestamp.
      window.localStorage.setItem(KEY, String(now));
      if (Number.isFinite(prior) && prior > 0) {
        const days = Math.floor((now - prior) / 86400000);
        if (days >= THRESHOLD_DAYS) setDaysAgo(days);
      }
    } catch {
      // localStorage disabled — just don't show the banner.
    }
  }, []);

  // Auto-dismiss after 6s if the user doesn't click it.
  useEffect(() => {
    if (daysAgo === null) return;
    const id = window.setTimeout(() => setDaysAgo(null), 6000);
    return () => window.clearTimeout(id);
  }, [daysAgo]);

  if (daysAgo === null) return null;

  return (
    <button
      type="button"
      onClick={() => setDaysAgo(null)}
      aria-label="Dismiss welcome-back banner"
      className="pixel-press"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        width: '100%',
        marginBottom: 18,
        padding: '10px 16px',
        background: '#F8EDC8',
        color: '#221E18',
        border: '3px solid #221E18',
        boxShadow: '3px 3px 0 0 #2F5D5C',
        borderRadius: 0,
        fontFamily: "var(--font-pixel-display, 'Courier New', monospace)",
        fontSize: 11,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end)',
        animation: 'pixel-banner-in 0.32s steps(5, end) both',
      }}
    >
      <style>{`
        @keyframes pixel-banner-in {
          0%   { transform: translateY(-12px); opacity: 0; }
          60%  { transform: translateY(2px); opacity: 1; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}</style>
      <span>
        ▸ WELCOME BACK · {relativeGap(daysAgo)} SINCE YOUR LAST VISIT
      </span>
      <span aria-hidden style={{ opacity: 0.6 }}>✕</span>
    </button>
  );
}
