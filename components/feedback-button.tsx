// Floating feedback button. Bottom-right corner, opens a small
// textarea + send. Submits to /api/feedback. Only on Next.js routes
// (mull.html homepage doesn't get this — it has its own surface
// area; if we want feedback there too, add a similar inline button
// inside the brandbar later).
//
// Designed for the launch window: friends see it on every page,
// and you wake up Wednesday to a list of unfiltered first
// impressions in your Supabase 'feedback' table.
//
// v3 pixel chrome: chunky pixel button (replaces the rounded pill),
// pixel dialog window for the popup form. Reuses .pixel-form so the
// textarea inside picks up the chunky-bordered cream input look.

'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import FocusTrap from './focus-trap';
import { t, type Locale, isLocale } from '@/lib/translations';

const serif = "var(--font-prose)";
const sans = "'Inter', system-ui, sans-serif";
const pixel = "var(--font-pixel-display, 'Courier New', monospace)";

// Routes where the floating Feedback pill would clash visually with
// the page. Quiz + result want a clean bottom edge for focus;
// /badge, /share, /wrapped are chromeless embed/screenshot pages
// that shouldn't include our floating UI in the captured frame.
const HIDDEN_PREFIXES = ['/quiz', '/result', '/badge', '/share', '/wrapped', '/embed'];

export default function FeedbackButton() {
  const pathname = usePathname() || '/';
  const hide = HIDDEN_PREFIXES.some(p => pathname === p || pathname.startsWith(p + '/'));

  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locale, setLocale] = useState<Locale>('en');

  useEffect(() => {
    const m = document.cookie.match(/(?:^|; )mull_locale=([^;]+)/);
    const v = m?.[1];
    if (v && isLocale(v)) setLocale(v);
  }, []);

  if (hide) return null;

  async function submit() {
    if (!text.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          body: text,
          page_url: window.location.pathname + window.location.search,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || t('crd.feedback_err_send', locale));
      setSent(true);
      setText('');
      setTimeout(() => { setOpen(false); setSent(false); }, 1800);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={t('crd.feedback_send_aria', locale)}
          title={t('crd.feedback_send_aria', locale)}
          className="pixel-press mull-feedback-fab"
          style={{
            position: 'fixed',
            zIndex: 60,
            background: 'var(--color-ink)',
            color: 'var(--color-cream)',
            border: '3px solid var(--color-ink)',
            boxShadow: '3px 3px 0 0 var(--color-acc)',
            borderRadius: 0,
            fontFamily: pixel,
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end)',
          }}
        >
          <span className="mull-feedback-fab-full">▸ {t('crd.feedback_fab', locale)}</span>
          <span className="mull-feedback-fab-mini" aria-hidden>?</span>
          <style>{`
            /* Desktop: full pill in the bottom-right.
               iOS safe-area: env() resolves to 0 on devices without
               a home-indicator, so this is a no-op on desktop. */
            .mull-feedback-fab {
              bottom: calc(18px + env(safe-area-inset-bottom, 0px));
              right: 18px;
              padding: 10px 16px;
              font-size: 11px;
              letter-spacing: 0.08em;
            }
            .mull-feedback-fab-mini { display: none; }

            /* Mobile: small circular icon in the bottom-left so the
               thumb-friendly scroll edge on the right stays clean
               and content isn't covered by a 120-px-wide pill.
               Safe-area inset stacks above the 12px base offset so
               the button sits above the iPhone home-indicator. */
            @media (max-width: 640px) {
              .mull-feedback-fab {
                bottom: calc(12px + env(safe-area-inset-bottom, 0px));
                left: 12px;
                right: auto;
                padding: 0;
                width: 44px;
                height: 44px;
                font-size: 16px;
                letter-spacing: 0;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                opacity: 0.85;
              }
              .mull-feedback-fab-full { display: none; }
              .mull-feedback-fab-mini { display: inline; }
            }
          `}</style>
        </button>
      )}

      {open && (
        <FocusTrap onEscape={() => { setOpen(false); setSent(false); setError(null); }}>
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t('crd.feedback_form_aria', locale)}
          className="pixel-form"
          style={{
            position: 'fixed',
            // Stack the safe-area inset onto the base 18px so the
            // open dialog also clears the iPhone home-indicator.
            bottom: 'calc(18px + env(safe-area-inset-bottom, 0px))',
            right: 18,
            zIndex: 60,
            width: 320,
            maxWidth: 'calc(100vw - 36px)',
            background: '#FFFCF4',
            border: '4px solid var(--color-ink)',
            boxShadow: '5px 5px 0 0 var(--color-acc)',
            borderRadius: 0,
            padding: '16px 18px',
            fontFamily: sans,
          }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
          }}>
            <strong style={{
              fontFamily: pixel,
              fontSize: 11,
              color: 'var(--color-acc-deep)',
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
            }}>
              ▸ {t('crd.feedback_dialog_title', locale)}
            </strong>
            <button
              type="button"
              onClick={() => { setOpen(false); setSent(false); setError(null); }}
              aria-label={t('crd.feedback_close_aria', locale)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: pixel,
                fontSize: 14, color: 'var(--color-acc-deep)',
                padding: '0 4px', lineHeight: 1,
              }}
            >
              X
            </button>
          </div>
          {sent ? (
            <p style={{
              margin: 0,
              fontFamily: serif,
              fontStyle: 'italic',
              fontSize: 15,
              color: '#2F5D5C',
              lineHeight: 1.5,
              padding: '8px 0',
            }}>
              {t('crd.feedback_sent', locale)}
            </p>
          ) : (
            <>
              {/* The pixel-form wrapper above auto-applies chunky cream
                  input chrome via globals.css — no inline border / fonts
                  needed here beyond width + min-height. */}
              <textarea
                placeholder={t('crd.feedback_placeholder', locale)}
                value={text}
                onChange={e => setText(e.target.value)}
                rows={4}
                maxLength={4000}
                style={{
                  width: '100%',
                  minHeight: 90,
                  resize: 'vertical',
                  boxSizing: 'border-box',
                }}
              />
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 10,
                fontFamily: pixel,
                fontSize: 10,
                color: 'var(--color-acc-deep)',
                letterSpacing: 0.4,
                textTransform: 'uppercase',
              }}>
                <span>{t('crd.feedback_counter', locale, { n: text.length })}</span>
                <button
                  type="submit"
                  onClick={submit}
                  disabled={!text.trim() || busy}
                >
                  {busy ? t('crd.feedback_sending', locale) : t('crd.feedback_send_btn', locale)}
                </button>
              </div>
              {error && (
                <p className="pixel-alert pixel-alert--error" style={{ marginTop: 12 }}>
                  {error}
                </p>
              )}
            </>
          )}
        </div>
        </FocusTrap>
      )}
    </>
  );
}
