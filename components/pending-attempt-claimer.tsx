// Reads the `mull.pending_quiz_attempt` localStorage key on /account
// mount. If a stashed quiz result is present (deposited by mull.html
// when a guest finished the quiz pre-signup), POSTs it to
// /api/account/claim-attempt and clears the stash.
//
// On success: pops a brief pixel toast in the bottom-right ("▸ QUIZ
// RESULT IMPORTED") for ~3.5s so the user gets visible confirmation
// that the pre-signup attempt landed in their trajectory. Then
// router.refresh() so the just-claimed attempt shows up in the
// page's server-rendered trajectory immediately.
//
// Idempotent in the common case: the stash is cleared on first
// successful POST; subsequent /account mounts find no stash and
// no-op. The server route also dedupes against any quiz attempt
// saved in the last 5 minutes as a backstop.

'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

const KEY = 'mull.pending_quiz_attempt';

type Stash = {
  vector: number[];
  archetype: string;
  flavor: string | null;
  alignment_pct: number;
  taken_at?: string;
  version?: number;
};

export default function PendingAttemptClaimer() {
  const router = useRouter();
  const fired = useRef(false);
  const [toast, setToast] = useState<{ archetype: string; flavor: string | null } | null>(null);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    (async () => {
      let stash: Stash | null = null;
      try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (
          parsed &&
          Array.isArray(parsed.vector) &&
          parsed.vector.length === 16 &&
          typeof parsed.archetype === 'string'
        ) {
          stash = parsed as Stash;
        } else {
          // Bad payload — drop it.
          localStorage.removeItem(KEY);
          return;
        }
      } catch {
        try { localStorage.removeItem(KEY); } catch {}
        return;
      }
      if (!stash) return;

      try {
        const res = await fetch('/api/account/claim-attempt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(stash),
        });
        if (res.ok) {
          // Whether the server claimed or skipped (dedupe), the stash
          // has done its job — drop it so we don't keep retrying.
          try { localStorage.removeItem(KEY); } catch {}
          // Pop the toast so the user sees the import landed.
          setToast({ archetype: stash.archetype, flavor: stash.flavor });
          // Refresh so the trajectory rerenders with the new attempt.
          router.refresh();
        }
        // On non-ok responses we leave the stash in place so a
        // future load can retry. /api/account/claim-attempt is
        // robust to duplicates so this is safe.
      } catch {
        // Network blip; try again next /account load.
      }
    })();
  }, [router]);

  // Auto-dismiss the toast after a beat.
  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(id);
  }, [toast]);

  if (!toast) return null;

  const archName = toast.archetype.replace(/^The\s+/i, '');
  const label = toast.flavor ? `${toast.flavor} ${archName}` : archName;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: 80, // Sits above the FeedbackButton (bottom: 18)
        right: 18,
        zIndex: 50,
        padding: '12px 16px',
        background: '#221E18',
        color: '#FAF6EC',
        border: '4px solid #221E18',
        boxShadow: '5px 5px 0 0 #B8862F',
        borderRadius: 0,
        maxWidth: 320,
        animation: 'pixel-toast-in 0.32s steps(5, end) both',
      }}
    >
      <style>{`
        @keyframes pixel-toast-in {
          0%   { transform: translateX(120%); opacity: 0; }
          60%  { transform: translateX(-4px); opacity: 1; }
          100% { transform: translateX(0); opacity: 1; }
        }
      `}</style>
      <div style={{
        fontFamily: "var(--font-pixel-display, 'Courier New', monospace)",
        fontSize: 10,
        color: '#B8862F',
        letterSpacing: '0.18em',
        marginBottom: 6,
        textTransform: 'uppercase',
      }}>
        ▸ QUIZ RESULT IMPORTED
      </div>
      <div style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontSize: 16,
        lineHeight: 1.35,
      }}>
        Your <strong>{label}</strong> result is now part of your trajectory.
      </div>
    </div>
  );
}
