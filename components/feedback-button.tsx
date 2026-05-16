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

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import FocusTrap from './focus-trap';

const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'Inter', system-ui, sans-serif";
const pixel = "var(--font-pixel-display, 'Courier New', monospace)";

// Routes where the floating Feedback pill would clash visually with
// the page. Quiz + result want a clean bottom edge for focus;
// /badge, /share, /wrapped are chromeless embed/screenshot pages
// that shouldn't include our floating UI in the captured frame.
const HIDDEN_PREFIXES = ['/quiz', '/result', '/badge', '/share', '/wrapped'];

export default function FeedbackButton() {
  const pathname = usePathname() || '/';
  const hide = HIDDEN_PREFIXES.some(p => pathname === p || pathname.startsWith(p + '/'));

  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      if (!res.ok) throw new Error(json?.error || 'Could not send.');
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
          aria-label="Send feedback"
          className="pixel-press"
          style={{
            position: 'fixed',
            bottom: 18,
            right: 18,
            zIndex: 60,
            padding: '10px 16px',
            background: '#221E18',
            color: '#FAF6EC',
            border: '4px solid #221E18',
            boxShadow: '4px 4px 0 0 #B8862F',
            borderRadius: 0,
            fontFamily: pixel,
            fontSize: 11,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end)',
          }}
        >
          ▸ FEEDBACK
        </button>
      )}

      {open && (
        <FocusTrap onEscape={() => { setOpen(false); setSent(false); setError(null); }}>
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Feedback form"
          className="pixel-form"
          style={{
            position: 'fixed',
            bottom: 18,
            right: 18,
            zIndex: 60,
            width: 320,
            maxWidth: 'calc(100vw - 36px)',
            background: '#FFFCF4',
            border: '4px solid #221E18',
            boxShadow: '5px 5px 0 0 #B8862F',
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
              color: '#8C6520',
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
            }}>
              ▸ SEND FEEDBACK
            </strong>
            <button
              type="button"
              onClick={() => { setOpen(false); setSent(false); setError(null); }}
              aria-label="Close"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: pixel,
                fontSize: 14, color: '#8C6520',
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
              Thank you. Read every word.
            </p>
          ) : (
            <>
              {/* The pixel-form wrapper above auto-applies chunky cream
                  input chrome via globals.css — no inline border / fonts
                  needed here beyond width + min-height. */}
              <textarea
                placeholder="What's broken, what's confusing, what worked, what didn't?"
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
                color: '#8C6520',
                letterSpacing: 0.4,
                textTransform: 'uppercase',
              }}>
                <span>{text.length} / 4000</span>
                <button
                  type="submit"
                  onClick={submit}
                  disabled={!text.trim() || busy}
                >
                  {busy ? 'Sending…' : 'Send'}
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
