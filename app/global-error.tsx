'use client';

// Root-level error boundary of last resort. app/error.tsx catches
// route-segment crashes, but if the ROOT layout itself throws (or the
// error boundary does), Next falls back to this file — which replaces
// the entire document. Without it, users get the unstyled browser
// default error page.
//
// Because the root layout is gone when this renders, nothing from
// globals.css exists: no CSS variables, no loaded fonts. Everything
// here is self-contained — hardcoded palette (cream/ink/brick from
// the house theme) and system font stacks that approximate the look.

import { useEffect, useState } from 'react';
import { t, type Locale, isLocale } from '@/lib/translations';

const serif = "Georgia, 'Times New Roman', serif";
const mono = "'Courier New', Courier, monospace";

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
          source: `client-global:${typeof window !== 'undefined' ? window.location.pathname : 'unknown'}`,
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
    <html lang={locale === 'zh' ? 'zh-Hans' : locale}>
      <body style={{ margin: 0, background: '#FAF6EC', color: '#1A1820' }}>
        <main style={{ maxWidth: 480, margin: '0 auto', padding: '80px 24px' }}>
          <div
            style={{
              background: '#FFFCF4',
              border: '4px solid #1A1820',
              boxShadow: '6px 6px 0 0 #7A2E2E',
              padding: '32px 30px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontFamily: mono,
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
                color: '#5C574B',
                margin: '0 0 28px',
                lineHeight: 1.55,
              }}
            >
              {t('errp.body', locale)}
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => reset()}
                style={{
                  padding: '12px 22px',
                  background: '#1A1820',
                  color: '#FAF6EC',
                  border: '4px solid #1A1820',
                  boxShadow: '4px 4px 0 0 #C9A24B',
                  borderRadius: 0,
                  fontFamily: mono,
                  fontSize: 12,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                }}
              >
                ▸ {t('errp.try_again', locale)}
              </button>
              <a
                href="/"
                style={{
                  padding: '12px 22px',
                  background: 'transparent',
                  color: '#1A1820',
                  border: '4px solid #1A1820',
                  boxShadow: '4px 4px 0 0 #C9A24B',
                  borderRadius: 0,
                  fontFamily: mono,
                  fontSize: 12,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                }}
              >
                ◂ {t('errp.go_home', locale)}
              </a>
            </div>
            {error.digest && (
              <p
                style={{
                  fontFamily: mono,
                  fontSize: 10,
                  color: '#8A7B4F',
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
      </body>
    </html>
  );
}
