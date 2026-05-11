// Reads the `mull.pending_quiz_attempt` localStorage key on /account
// mount. If a stashed quiz result is present (deposited by mull.html
// when a guest finished the quiz pre-signup), POSTs it to
// /api/account/claim-attempt and clears the stash.
//
// Renders nothing visible — purely a side effect. On success we
// `router.refresh()` so the just-claimed attempt shows up in the
// page's server-rendered trajectory immediately.
//
// Idempotent in the common case: the stash is cleared on first
// successful POST; subsequent /account mounts find no stash and
// no-op. The server route also dedupes against any quiz attempt
// saved in the last 5 minutes as a backstop.

'use client';

import { useEffect, useRef } from 'react';
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

  return null;
}
