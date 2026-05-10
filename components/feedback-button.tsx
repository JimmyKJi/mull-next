// Floating feedback button. Bottom-right corner, opens a small
// textarea + send. Submits to /api/feedback. Only on Next.js routes
// (mull.html homepage doesn't get this — it has its own surface
// area; if we want feedback there too, add a similar inline button
// inside the brandbar later).
//
// Designed for the launch window: friends see it on every page,
// and you wake up Wednesday to a list of unfiltered first
// impressions in your Supabase 'feedback' table.

'use client';

import { useState } from 'react';

const sans = "'Inter', system-ui, sans-serif";

export default function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          style={{
            position: 'fixed',
            bottom: 18,
            right: 18,
            zIndex: 60,
            padding: '9px 16px',
            background: '#221E18',
            color: '#FAF6EC',
            border: 'none',
            borderRadius: 999,
            fontFamily: sans,
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(34,30,24,0.18)',
            letterSpacing: 0.3,
          }}
        >
          Feedback
        </button>
      )}

      {open && (
        <div
          role="dialog"
          aria-label="Feedback form"
          style={{
            position: 'fixed',
            bottom: 18,
            right: 18,
            zIndex: 60,
            width: 320,
            maxWidth: 'calc(100vw - 36px)',
            background: '#FFFCF4',
            border: '1px solid #D6CDB6',
            borderRadius: 12,
            boxShadow: '0 12px 32px rgba(34,30,24,0.18)',
            padding: '16px 18px',
            fontFamily: sans,
          }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 10,
          }}>
            <strong style={{
              fontSize: 11, fontWeight: 600,
              color: '#8C6520', textTransform: 'uppercase',
              letterSpacing: '0.16em',
            }}>
              Send feedback
            </strong>
            <button
              type="button"
              onClick={() => { setOpen(false); setSent(false); setError(null); }}
              aria-label="Close"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 18, color: '#8C6520', padding: '0 4px', lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>
          {sent ? (
            <p style={{
              margin: 0, fontFamily: 'Cormorant Garamond, Georgia, serif',
              fontStyle: 'italic', fontSize: 15, color: '#2F5D5C',
              lineHeight: 1.5,
            }}>
              Thank you. Read every word.
            </p>
          ) : (
            <>
              <textarea
                placeholder="What's broken, what's confusing, what worked, what didn't?"
                value={text}
                onChange={e => setText(e.target.value)}
                rows={4}
                maxLength={4000}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  fontFamily: 'Cormorant Garamond, Georgia, serif',
                  fontSize: 14,
                  lineHeight: 1.5,
                  border: '1px solid #EBE3CA',
                  borderRadius: 6,
                  background: '#FAF6EC',
                  color: '#221E18',
                  resize: 'vertical',
                  minHeight: 80,
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              />
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 8,
                fontSize: 11,
                color: '#8C6520',
              }}>
                <span>{text.length} / 4000</span>
                <button
                  type="button"
                  onClick={submit}
                  disabled={!text.trim() || busy}
                  style={{
                    padding: '7px 14px',
                    background: text.trim() && !busy ? '#221E18' : '#A39880',
                    color: '#FAF6EC',
                    border: 'none',
                    borderRadius: 6,
                    fontFamily: sans,
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: text.trim() && !busy ? 'pointer' : 'not-allowed',
                    letterSpacing: 0.3,
                  }}
                >
                  {busy ? 'Sending…' : 'Send'}
                </button>
              </div>
              {error && (
                <p style={{
                  margin: '8px 0 0', fontSize: 12, color: '#7A2E2E',
                }}>
                  {error}
                </p>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}
