// Global client error boundary. Catches uncaught render-time errors
// in any Next.js route, posts them to /api/error-report, and shows
// the user a friendly fallback with a Retry button.
//
// This is the App Router convention: app/error.tsx becomes the
// nearest error boundary for everything below it. The reset()
// function re-mounts the failed segment.

'use client';

import { useEffect } from 'react';

const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'Inter', system-ui, sans-serif";

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
      textAlign: 'center',
    }}>
      <div style={{
        fontFamily: sans,
        fontSize: 11,
        fontWeight: 600,
        color: '#7A2E2E',
        textTransform: 'uppercase',
        letterSpacing: '0.18em',
        marginBottom: 14,
      }}>
        Something went wrong
      </div>
      <h1 style={{
        fontFamily: serif,
        fontSize: 36,
        fontWeight: 500,
        margin: '0 0 14px',
        letterSpacing: '-0.5px',
      }}>
        We tripped on something.
      </h1>
      <p style={{
        fontFamily: serif,
        fontStyle: 'italic',
        fontSize: 18,
        color: '#4A4338',
        marginBottom: 28,
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
          style={{
            padding: '12px 22px',
            background: '#221E18',
            color: '#FAF6EC',
            border: 'none',
            borderRadius: 8,
            fontFamily: sans,
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
            letterSpacing: 0.4,
          }}
        >
          Try again
        </button>
        <a
          href="/"
          style={{
            padding: '12px 22px',
            background: 'transparent',
            color: '#221E18',
            border: '1px solid #221E18',
            borderRadius: 8,
            fontFamily: sans,
            fontSize: 14,
            textDecoration: 'none',
            letterSpacing: 0.4,
          }}
        >
          Go home
        </a>
      </div>
      {error.digest && (
        <p style={{
          fontFamily: sans,
          fontSize: 11,
          color: '#8C6520',
          marginTop: 36,
          letterSpacing: 0.5,
          opacity: 0.7,
        }}>
          Reference: {error.digest}
        </p>
      )}
    </main>
  );
}
