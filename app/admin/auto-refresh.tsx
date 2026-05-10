// Tiny client component that triggers a router.refresh() every N
// seconds. Used by /admin so the dashboard stays current without
// the user manually reloading. Pauses while the tab is hidden so we
// don't hammer Supabase when no one's looking.

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminAutoRefresh({ seconds = 60 }: { seconds?: number }) {
  const router = useRouter();

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;

    const start = () => {
      if (timer) return;
      timer = setInterval(() => {
        if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
        router.refresh();
      }, Math.max(15, seconds) * 1000);
    };
    const stop = () => {
      if (timer) { clearInterval(timer); timer = null; }
    };

    start();

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        // Refresh once immediately on coming back, then resume the interval.
        router.refresh();
        start();
      } else {
        stop();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [router, seconds]);

  return null;
}
