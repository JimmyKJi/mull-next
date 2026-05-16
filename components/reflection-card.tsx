// "You wrote this 8 weeks ago — has anything shifted?" card.
//
// Mounted on /account. Fetches the oldest un-followed-up dilemma
// response (≥56 days old) via /api/dilemma/reflection. If there is
// one, shows the original question + response, plus a textarea for
// the user to write what they think now.
//
// On submit: POST to the same endpoint, render a thank-you, then
// fade out so the user can move on.
//
// Returns null when there's nothing to surface — most users for
// the first 8 weeks of using Mull.
//
// v3 pixel chrome: outer card is a teal-shadowed pixel window; inner
// blocks (the original prompt + the response) are pixel sub-cards.
// The pixel-form class on the wrapper picks up the textarea + submit
// button styling from globals.css.

'use client';

import { useEffect, useState } from 'react';

const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'Inter', system-ui, sans-serif";
const pixel = "var(--font-pixel-display, 'Courier New', monospace)";

type Candidate = {
  id: string;
  dilemma_date: string;
  question_text: string;
  response_text: string;
  analysis: string | null;
  created_at: string;
};

function relativeWeeks(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const days = Math.floor((now - then) / 86400000);
  if (days < 14) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 8) return `${weeks} weeks ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} months ago`;
  return `over a year ago`;
}

export default function ReflectionCard() {
  const [loading, setLoading] = useState(true);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/dilemma/reflection');
        const json = await res.json();
        if (cancelled) return;
        setCandidate(json.candidate ?? null);
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  async function submit() {
    if (!candidate || text.trim().length < 10 || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/dilemma/reflection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dilemma_response_id: candidate.id,
          followup_text: text,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Could not save.');
      setDone(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (loading || !candidate) return null;
  if (done) {
    return (
      <section style={cardStyle}>
        <div style={eyebrow}>▸ REFLECTION SAVED</div>
        <p style={{
          fontFamily: serif, fontStyle: 'italic',
          fontSize: 17, color: '#221E18', margin: 0, lineHeight: 1.55,
        }}>
          Saved. The note will sit alongside the original — you can read both, side by side, on the dilemma archive whenever you want.
        </p>
      </section>
    );
  }

  return (
    <section className="pixel-form" style={cardStyle}>
      <div style={eyebrow}>▸ HAS ANYTHING SHIFTED?</div>
      <p style={{
        fontFamily: serif, fontStyle: 'italic', fontSize: 16,
        color: '#4A4338', margin: '0 0 18px', lineHeight: 1.55,
      }}>
        You wrote this {relativeWeeks(candidate.created_at)}. Read it again before answering — what feels different now?
      </p>

      {/* Original prompt */}
      <div style={{
        padding: '14px 16px',
        background: '#F8EDC8',
        border: '3px solid #221E18',
        boxShadow: '3px 3px 0 0 #B8862F',
        borderRadius: 0,
        marginBottom: 14,
      }}>
        <div style={subEyebrow}>
          THE DILEMMA
        </div>
        <p style={{
          fontFamily: serif, fontStyle: 'italic',
          fontSize: 16, color: '#221E18', margin: 0, lineHeight: 1.5,
        }}>
          {candidate.question_text}
        </p>
      </div>

      {/* Original response */}
      <div style={{
        padding: '14px 16px',
        background: '#FFFCF4',
        border: '3px solid #221E18',
        boxShadow: '3px 3px 0 0 #2F5D5C',
        borderRadius: 0,
        marginBottom: 20,
      }}>
        <div style={subEyebrow}>
          WHAT YOU WROTE
        </div>
        <p style={{
          fontFamily: serif, fontSize: 15.5, color: '#221E18',
          margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap',
        }}>
          {candidate.response_text}
        </p>
      </div>

      {/* Followup input */}
      <div style={{
        fontFamily: pixel, fontSize: 11,
        color: '#2F5D5C', textTransform: 'uppercase',
        letterSpacing: '0.18em', marginBottom: 8,
      }}>
        ▸ WHAT YOU THINK NOW
      </div>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        rows={6}
        placeholder="What's still true. What's no longer true. What you'd write differently if asked today."
        maxLength={4000}
        style={{
          width: '100%',
          minHeight: 140,
          resize: 'vertical',
          boxSizing: 'border-box',
        }}
      />
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <span style={{
          fontFamily: pixel, fontSize: 11,
          color: text.trim().length < 10 ? '#7A2E2E' : '#8C6520',
          letterSpacing: 0.4,
        }}>
          {text.length} / 4000
          {text.trim().length < 10 && text.length > 0 && ' · A LITTLE MORE'}
        </span>
        <button
          type="submit"
          onClick={submit}
          disabled={text.trim().length < 10 || busy}
        >
          {busy ? 'Saving…' : 'Save reflection'}
        </button>
      </div>
      {error && (
        <p style={{
          marginTop: 12, fontFamily: sans, fontSize: 13, color: '#7A2E2E',
          background: 'rgba(122, 46, 46, 0.08)', padding: '8px 12px',
          border: '2px solid #7A2E2E', borderRadius: 0,
        }}>
          {error}
        </p>
      )}
    </section>
  );
}

const cardStyle: React.CSSProperties = {
  marginTop: 32,
  padding: '24px 26px',
  background: '#FFFCF4',
  border: '4px solid #221E18',
  boxShadow: '5px 5px 0 0 #2F5D5C',
  borderRadius: 0,
};

const eyebrow: React.CSSProperties = {
  fontFamily: pixel, fontSize: 12,
  color: '#2F5D5C', textTransform: 'uppercase',
  letterSpacing: '0.18em', marginBottom: 12,
};

const subEyebrow: React.CSSProperties = {
  fontFamily: pixel, fontSize: 10,
  color: '#8C6520', textTransform: 'uppercase',
  letterSpacing: '0.18em', marginBottom: 6,
};
