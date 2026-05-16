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

import { useEffect } from 'react';

const serif = "'Cormorant Garamond', Georgia, serif";
const pixel = "var(--font-pixel-display, 'Courier New', monospace)";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
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
    <main style={{
      maxWidth: 480,
      margin: '0 auto',
      padding: '80px 24px',
    }}>
      <div style={{
        background: '#FFFCF4',
        border: '4px solid #221E18',
        boxShadow: '6px 6px 0 0 #7A2E2E',
        borderRadius: 0,
        padding: '32px 30px',
        textAlign: 'center',
      }}>
        <div style={{
          fontFamily: pixel,
          fontSize: 12,
          color: '#7A2E2E',
          textTransform: 'uppercase',
          letterSpacing: '0.18em',
          marginBottom: 16,
        }}>
          ▸ SOMETHING WENT WRONG
        </div>
        <h1 style={{
          fontFamily: serif,
          fontSize: 32,
          fontWeight: 500,
          margin: '0 0 16px',
          letterSpacing: '-0.5px',
          lineHeight: 1.15,
        }}>
          We tripped on something.
        </h1>
        <p style={{
          fontFamily: serif,
          fontStyle: 'italic',
          fontSize: 17,
          color: '#4A4338',
          margin: '0 0 28px',
          lineHeight: 1.55,
        }}>
          The error has been logged. You can try again, or head back home.
        </p>
        <div style={{
          display: 'flex',
          gap: 12,
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}>
          <button
            type="button"
            onClick={() => reset()}
            className="pixel-press"
            style={{
              padding: '12px 22px',
              background: '#221E18',
              color: '#FAF6EC',
              border: '4px solid #221E18',
              boxShadow: '4px 4px 0 0 #B8862F',
              borderRadius: 0,
              fontFamily: pixel,
              fontSize: 12,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end)',
            }}
          >
            ▸ TRY AGAIN
          </button>
          <a
            href="/"
            className="pixel-press"
            style={{
              padding: '12px 22px',
              background: 'transparent',
              color: '#221E18',
              border: '4px solid #221E18',
              boxShadow: '4px 4px 0 0 #B8862F',
              borderRadius: 0,
              fontFamily: pixel,
              fontSize: 12,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end)',
            }}
          >
            ◂ GO HOME
          </a>
        </div>
        {error.digest && (
          <p style={{
            fontFamily: pixel,
            fontSize: 10,
            color: '#8C6520',
            marginTop: 32,
            letterSpacing: 0.4,
            opacity: 0.85,
            textTransform: 'uppercase',
          }}>
            REF: {error.digest}
          </p>
        )}
      </div>
    </main>
  );
}
