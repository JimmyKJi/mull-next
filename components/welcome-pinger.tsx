// Fires once on /account mount to trigger the welcome email if the
// user hasn't received it yet. Renders nothing — purely a side
// effect. The endpoint is idempotent (welcome_emails table tracks
// who's been sent), so if the user opens /account in three tabs only
// one email fires.
//
// We POST silently. If it fails, the user will retry on next page
// load — no UI feedback needed since the email is a courtesy.

'use client';

import { useEffect, useRef } from 'react';

export default function WelcomePinger() {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    // Don't await — runs in the background, errors swallowed.
    fetch('/api/account/welcome', { method: 'POST' }).catch(() => {});
  }, []);

  return null;
}
