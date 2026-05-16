'use client';

// Reflection form for the bottom of the exercise detail page.
// Same shape as the dilemma + diary forms: textarea → submit → Claude
// analyzes → show the dimensional shift it produced. If the user isn't
// signed in, we surface a soft prompt to sign in instead of the form.
//
// Props:
//   slug:          which exercise this is a reflection on
//   isAuthed:      whether the page server-detected an authenticated user
//   reflectionPrompt: the question the user is reflecting on (already
//                  localized server-side)

import { useState } from 'react';
import Link from 'next/link';
import { t, type Locale } from '@/lib/translations';
import { DIM_KEYS, DIM_NAMES } from '@/lib/dimensions';
import DiagnosisCard from '@/components/diagnosis-card';
import type { Kinship } from '@/lib/kinship';

const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'Inter', system-ui, sans-serif";

// Server returns these alongside the vector_delta + analysis. The
// schema, the API route, and the database all carry diagnosis/kinship/
// is_novel since the exercise_diagnosis migration; this form just
// needs to render them. See app/diary/diary-composer.tsx for the
// matching shape on the diary side.
type SubmitResult = {
  saved: boolean;
  id: string;
  vector_delta: number[] | null;
  analysis: string | null;
  diagnosis: string | null;
  kinship: Kinship | null;
  is_novel: boolean | null;
  analyzed: boolean;
};

type ShiftItem = { key: string; name: string; delta: number };

function deltaToShifts(delta: number[] | null): ShiftItem[] {
  if (!Array.isArray(delta)) return [];
  return delta
    .map((d, i) => ({ key: DIM_KEYS[i], name: DIM_NAMES[DIM_KEYS[i]], delta: +d.toFixed(2) }))
    .filter(s => Math.abs(s.delta) >= 0.3)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, 4);
}

export default function ReflectionForm({
  slug,
  isAuthed,
  locale = 'en',
}: {
  slug: string;
  isAuthed: boolean;
  locale?: Locale;
}) {
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [makePublic, setMakePublic] = useState(false);

  const charCount = content.length;
  const tooShort = charCount > 0 && charCount < 30;
  const ready = charCount >= 30 && charCount <= 8000;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ready || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/exercises/reflect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, content, isPublic: makePublic }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error || 'Could not save reflection.');
        setSubmitting(false);
        return;
      }
      setResult(json as SubmitResult);
    } catch (err) {
      console.error(err);
      setError(t('profile.network_error', locale));
    } finally {
      setSubmitting(false);
    }
  }

  // Not signed in → soft prompt, no form.
  if (!isAuthed) {
    return (
      <div style={{
        marginTop: 36,
        padding: '22px 26px',
        background: '#FFFCF4',
        border: '1px dashed #D6CDB6',
        borderRadius: 10,
        textAlign: 'center',
      }}>
        <p style={{
          fontFamily: serif,
          fontStyle: 'italic',
          fontSize: 17,
          color: '#4A4338',
          margin: '0 0 16px',
          lineHeight: 1.55,
        }}>
          {t('reflect.signin_prompt', locale)}
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/signup" style={{
            padding: '10px 20px',
            background: '#221E18',
            color: '#FAF6EC',
            borderRadius: 6,
            textDecoration: 'none',
            fontFamily: sans,
            fontSize: 14,
            fontWeight: 500,
          }}>
            {t('dilemma.create_account', locale)}
          </Link>
          <Link href="/login" style={{
            padding: '10px 20px',
            border: '1px solid #221E18',
            color: '#221E18',
            borderRadius: 6,
            textDecoration: 'none',
            fontFamily: sans,
            fontSize: 14,
          }}>
            {t('dilemma.sign_in', locale)}
          </Link>
        </div>
      </div>
    );
  }

  // Signed in & submitted → result screen.
  if (result) {
    const shifts = deltaToShifts(result.vector_delta);
    return (
      <div style={{
        marginTop: 36,
        padding: '28px 32px',
        background: '#FFFCF4',
        border: '4px solid #221E18',
        boxShadow: '5px 5px 0 0 #2F5D5C',
        borderRadius: 0,
      }}>
        <div style={{
          fontFamily: 'var(--font-pixel-display)',
          fontSize: 12,
          color: '#2F5D5C',
          textTransform: 'uppercase',
          letterSpacing: '0.18em',
          marginBottom: 14,
        }}>
          ✓ {t('reflect.saved', locale).toUpperCase()}
        </div>
        {result.analysis ? (
          <div style={{
            padding: '14px 16px',
            background: '#F8EDC8',
            border: '3px solid #221E18',
            boxShadow: '3px 3px 0 0 #B8862F',
            borderRadius: 0,
            marginBottom: 16,
          }}>
            <div style={{
              fontFamily: 'var(--font-pixel-display)',
              fontSize: 10,
              color: '#8C6520',
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
              marginBottom: 8,
            }}>
              {t('dilemma.what_revealed', locale).toUpperCase()}
            </div>
            <p style={{
              fontFamily: serif,
              fontStyle: 'italic',
              fontSize: 16,
              color: '#221E18',
              margin: 0,
              lineHeight: 1.55,
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
            {t('reflect.unanalyzed', locale)}
          </p>
        ) : null}

        {/* Diagnosis: which philosophical move the reflection made,
            kindred thinkers, traditions, novel-flag. Renders nothing
            when all four fields are absent (e.g. when ANTHROPIC_API_KEY
            was missing and the analysis pipeline degraded). */}
        <DiagnosisCard
          diagnosis={result.diagnosis}
          kinship={result.kinship}
          is_novel={result.is_novel}
        />

        {shifts.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{
              fontFamily: sans,
              fontSize: 10,
              fontWeight: 600,
              color: '#8C6520',
              textTransform: 'uppercase',
              letterSpacing: '0.16em',
              marginBottom: 8,
            }}>
              {t('dilemma.shift_added', locale)}
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
          paddingTop: 18,
          borderTop: '1px solid #EBE3CA',
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
        }}>
          <button
            type="button"
            onClick={() => { setResult(null); setContent(''); }}
            style={{
              padding: '10px 20px',
              background: '#221E18',
              color: '#FAF6EC',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontFamily: sans,
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            {t('reflect.write_another', locale)}
          </button>
          <Link href="/account" style={{
            padding: '10px 20px',
            border: '1px solid #221E18',
            borderRadius: 6,
            color: '#221E18',
            textDecoration: 'none',
            fontFamily: sans,
            fontSize: 14,
          }}>
            {t('dilemma.see_trajectory', locale)}
          </Link>
        </div>
      </div>
    );
  }

  // Signed in & writing → form.
  return (
    <form onSubmit={onSubmit} className="pixel-form" style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{
        fontFamily: sans,
        fontSize: 11,
        fontWeight: 600,
        color: '#8C6520',
        textTransform: 'uppercase',
        letterSpacing: '0.18em',
      }}>
        {t('reflect.compose_eyebrow', locale)}
      </div>
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder={t('reflect.placeholder', locale)}
        rows={9}
        maxLength={8000}
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
          {charCount}/8000
          {tooShort ? ' · ' + t('diary.too_short_hint', locale) : ''}
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
          {submitting ? t('dilemma.analyzing', locale) : t('reflect.save', locale)}
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
      <label style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        padding: '10px 14px',
        background: makePublic ? '#F8EDC8' : '#FFFCF4',
        border: '2px solid #221E18',
        borderRadius: 0,
        cursor: 'pointer',
        fontFamily: sans,
        fontSize: 13,
        color: '#4A4338',
        lineHeight: 1.5,
      }}>
        <input
          type="checkbox"
          checked={makePublic}
          onChange={e => setMakePublic(e.target.checked)}
          style={{ marginTop: 2, accentColor: '#B8862F', flexShrink: 0 }}
        />
        <span>{t('reflect.public_toggle', locale)}</span>
      </label>
    </form>
  );
}
