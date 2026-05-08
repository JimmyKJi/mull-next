'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'Inter', system-ui, sans-serif";

type SubmitResult = {
  saved: boolean;
  vector_delta: number[] | null;
  analysis: string | null;
  analyzed: boolean;
};

type ShiftItem = { key: string; name: string; delta: number };

const DIM_KEYS = ['TV','VA','WP','TR','TE','RT','MR','SR','CE','SS','PO','TD','AT','ES','UI','SI'];
const DIM_NAMES: Record<string, string> = {
  TV: 'Tragic Vision', VA: 'Vital Affirmation', WP: 'Will to Power',
  TR: 'Trust in Reason', TE: 'Trust in Experience', RT: 'Reverence for Tradition',
  MR: 'Mystical Receptivity', SR: 'Skeptical Reflex', CE: 'Communal Embeddedness',
  SS: 'Sovereign Self', PO: 'Practical Orientation', TD: 'Theoretical Drive',
  AT: 'Ascetic Tendency', ES: 'Embodied Sensibility', UI: 'Universalist Impulse',
  SI: 'Self as Illusion'
};

function deltaToShifts(delta: number[] | null): ShiftItem[] {
  if (!Array.isArray(delta)) return [];
  return delta
    .map((d, i) => ({ key: DIM_KEYS[i], name: DIM_NAMES[DIM_KEYS[i]], delta: +d.toFixed(2) }))
    .filter(s => Math.abs(s.delta) >= 0.3)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, 4);
}

export default function DilemmaForm({ questionPrompt }: { questionPrompt: string }) {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const router = useRouter();

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;
  const tooShort = charCount > 0 && charCount < 30;
  const ready = charCount >= 30 && charCount <= 4000;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ready || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/dilemma/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response_text: text })
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error || 'Could not save your response.');
        setSubmitting(false);
        return;
      }
      setResult({
        saved: true,
        vector_delta: json.vector_delta,
        analysis: json.analysis,
        analyzed: !!json.analyzed
      });
      router.refresh();
    } catch (err) {
      console.error(err);
      setError('Network error. Try again.');
      setSubmitting(false);
    }
  }

  if (result?.saved) {
    const shifts = deltaToShifts(result.vector_delta);
    return (
      <div style={{
        padding: '28px 32px',
        background: '#FFFCF4',
        border: '1px solid #D6CDB6',
        borderLeft: '3px solid #2F5D5C',
        borderRadius: 8,
      }}>
        <div style={{
          fontFamily: sans,
          fontSize: 11,
          fontWeight: 600,
          color: '#2F5D5C',
          textTransform: 'uppercase',
          letterSpacing: '0.16em',
          marginBottom: 14,
        }}>
          ✓ Saved
        </div>
        <p style={{
          fontFamily: serif,
          fontSize: 17,
          color: '#221E18',
          lineHeight: 1.6,
          margin: '0 0 18px',
          whiteSpace: 'pre-wrap',
        }}>
          {text}
        </p>
        {result.analysis ? (
          <div style={{
            padding: '14px 16px',
            background: '#F5EFDC',
            borderRadius: 6,
            marginBottom: 16,
          }}>
            <div style={{
              fontFamily: sans,
              fontSize: 10,
              fontWeight: 600,
              color: '#8C6520',
              textTransform: 'uppercase',
              letterSpacing: '0.16em',
              marginBottom: 6,
            }}>
              What this revealed
            </div>
            <p style={{
              fontFamily: serif,
              fontStyle: 'italic',
              fontSize: 16,
              color: '#221E18',
              margin: 0,
              lineHeight: 1.5,
            }}>
              {result.analysis}
            </p>
          </div>
        ) : !result.analyzed ? (
          <p style={{
            fontFamily: sans,
            fontSize: 13,
            color: '#8C6520',
            marginBottom: 16,
            fontStyle: 'italic',
          }}>
            Your response was saved. The AI analyzer isn't connected yet — when it is,
            past responses will be re-analyzed.
          </p>
        ) : null}

        {shifts.length > 0 && (
          <div>
            <div style={{
              fontFamily: sans,
              fontSize: 10,
              fontWeight: 600,
              color: '#8C6520',
              textTransform: 'uppercase',
              letterSpacing: '0.16em',
              marginBottom: 8,
            }}>
              Shift this added to your map
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
              {shifts.map(s => (
                <span key={s.key} style={{
                  fontFamily: sans,
                  fontSize: 14,
                  color: s.delta > 0 ? '#2F5D5C' : '#7A2E2E',
                }}>
                  <strong style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {s.delta > 0 ? '+' : ''}{s.delta.toFixed(1)}
                  </strong>{' '}
                  <span style={{ color: '#4A4338' }}>{s.name}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        <div style={{
          marginTop: 22,
          paddingTop: 18,
          borderTop: '1px solid #EBE3CA',
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
        }}>
          <Link href="/account" style={{
            padding: '9px 18px',
            border: '1px solid #221E18',
            borderRadius: 6,
            color: '#221E18',
            textDecoration: 'none',
            fontFamily: sans,
            fontSize: 13.5,
          }}>
            See your trajectory →
          </Link>
          <span style={{
            fontFamily: sans,
            fontSize: 12,
            color: '#8C6520',
            alignSelf: 'center',
          }}>
            The next dilemma arrives tomorrow.
          </span>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Take your time. A paragraph or two is plenty."
        rows={10}
        maxLength={4000}
        style={{
          fontFamily: serif,
          fontSize: 17,
          lineHeight: 1.6,
          padding: '20px 22px',
          border: '1px solid #D6CDB6',
          borderRadius: 12,
          background: '#FFFCF4',
          color: '#221E18',
          outline: 'none',
          resize: 'vertical',
          minHeight: 200,
        }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{
          height: 3,
          background: '#EBE3CA',
          borderRadius: 2,
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${Math.min(100, (charCount / 4000) * 100)}%`,
            background: charCount < 30 ? '#D6CDB6'
                      : charCount > 3700 ? '#C7522A'
                      : '#B8862F',
            transition: 'width 0.18s ease, background 0.2s ease',
          }} />
        </div>
      </div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
        flexWrap: 'wrap',
      }}>
        <span style={{
          fontFamily: sans,
          fontSize: 12,
          color: tooShort ? '#7A2E2E' : '#8C6520',
          letterSpacing: 0.3,
        }}>
          {wordCount} word{wordCount === 1 ? '' : 's'} · {charCount}/4000 chars
          {tooShort ? ' · a little more, please' : charCount > 3700 ? ' · approaching limit' : ''}
        </span>
        <button
          type="submit"
          disabled={!ready || submitting}
          style={{
            fontFamily: sans,
            fontSize: 14.5,
            fontWeight: 500,
            padding: '12px 24px',
            background: ready ? '#221E18' : '#A39880',
            color: '#FAF6EC',
            border: 'none',
            borderRadius: 8,
            cursor: ready && !submitting ? 'pointer' : 'not-allowed',
            opacity: submitting ? 0.7 : 1,
            letterSpacing: 0.4,
          }}
        >
          {submitting ? 'Analyzing…' : 'Submit response'}
        </button>
      </div>
      {error && (
        <div style={{
          fontFamily: sans,
          fontSize: 13,
          color: '#7A2E2E',
          background: 'rgba(122, 46, 46, 0.08)',
          border: '1px solid rgba(122, 46, 46, 0.2)',
          padding: '10px 14px',
          borderRadius: 6,
        }}>
          {error}
        </div>
      )}
      <p style={{
        fontFamily: sans,
        fontSize: 12,
        color: '#8C6520',
        margin: 0,
        opacity: 0.75,
        lineHeight: 1.55,
      }}>
        Your response is saved to your account, analyzed by Claude into a small shift across the
        sixteen dimensions, and added to your trajectory. Private to you. Only one submission per day.
      </p>
    </form>
  );
}
