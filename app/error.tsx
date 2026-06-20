// Global client error boundary. Catches uncaught render-time errors
// in any Next.js route, posts them to /api/error-report, and shows
// the user a friendly fallback with a Retry button.
//
// This is the App Router convention: app/error.tsx becomes the
// nearest error boundary for everything below it. The reset()
// function re-mounts the failed segment.
//
// v3 pixel chrome: chunky pixel dialog window with a brick-red drop
// shadow (so the alert reads as "something broke" without being
// shouty), pixel-display headings, pixel-button retry CTA.

'use client';

import { useEffect, useState } from 'react';
import { t, type Locale, isLocale } from '@/lib/translations';

const serif = 'var(--font-prose)';
const pixel = "var(--font-pixel-display, 'Courier New', monospace)";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [locale, setLocale] = useState<Locale>('en');

  useEffect(() => {
    const m = document.cookie.match(/(?:^|; )mull_locale=([^;]+)/);
    const v = m?.[1];
    if (v && isLocale(v)) setLocale(v);
  }, []);

  useEffect(() => {
    // Best-effort report. Don't block the UI on this.
    try {
      fetch('/api/error-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: `client:${typeof window !== 'undefined' ? window.location.pathname : 'unknown'}`,
          message: error.message,
          stack: error.stack,
          url: typeof window !== 'undefined' ? window.location.href : undefined,
        }),
      }).catch(() => {});
    } catch {
      /* swallow */
    }
  }, [error]);

  return (
    <main
      style={{
        maxWidth: 480,
        margin: '0 auto',
        padding: '80px 24px',
      }}
    >
      <div
        style={{
          background: '#FFFCF4',
          border: '4px solid var(--color-ink)',
          boxShadow: '6px 6px 0 0 #7A2E2E',
          borderRadius: 0,
          padding: '32px 30px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontFamily: pixel,
            fontSize: 12,
            color: '#7A2E2E',
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            marginBottom: 16,
          }}
        >
          ▸ {t('errp.eyebrow', locale)}
        </div>
        <h1
          style={{
            fontFamily: serif,
            fontSize: 32,
            fontWeight: 500,
            margin: '0 0 16px',
            letterSpacing: '-0.5px',
            lineHeight: 1.15,
          }}
        >
          {t('errp.title', locale)}
        </h1>
        <p
          style={{
            fontFamily: serif,
            fontStyle: 'italic',
            fontSize: 17,
            color: 'var(--color-ink-soft)',
            margin: '0 0 28px',
            lineHeight: 1.55,
          }}
        >
          {t('errp.body', locale)}
        </p>
        <div
          style={{
            display: 'flex',
            gap: 12,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            onClick={() => reset()}
            className="pixel-press"
            style={{
              padding: '12px 22px',
              background: 'var(--color-ink)',
              color: 'var(--color-cream)',
              border: '4px solid var(--color-ink)',
              boxShadow: '4px 4px 0 0 var(--color-acc)',
              borderRadius: 0,
              fontFamily: pixel,
              fontSize: 12,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end)',
            }}
          >
            ▸ {t('errp.try_again', locale)}
          </button>
          <a
            href="/"
            className="pixel-press"
            style={{
              padding: '12px 22px',
              background: 'transparent',
              color: 'var(--color-ink)',
              border: '4px solid var(--color-ink)',
              boxShadow: '4px 4px 0 0 var(--color-acc)',
              borderRadius: 0,
              fontFamily: pixel,
              fontSize: 12,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end)',
            }}
          >
            ◂ {t('errp.go_home', locale)}
          </a>
        </div>
        {error.digest && (
          <p
            style={{
              fontFamily: pixel,
              fontSize: 10,
              color: 'var(--color-acc-deep)',
              marginTop: 32,
              letterSpacing: 0.4,
              opacity: 0.85,
              textTransform: 'uppercase',
            }}
          >
            REF: {error.digest}
          </p>
        )}
      </div>
    </main>
  );
}
