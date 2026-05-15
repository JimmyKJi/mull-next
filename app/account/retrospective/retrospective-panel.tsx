'use client';

// Year picker + "Generate" button + essay display. Calls the API on demand
// rather than auto-loading (Claude essay generation isn't free).

import { useState } from 'react';
import { t, type Locale } from '@/lib/translations';

const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'Inter', system-ui, sans-serif";

type Result = {
  year: number;
  periodSummary: {
    counts: { quizzes: number; dilemmas: number; diaries: number; reflections?: number };
    topShifts: Array<{ key: string; name: string; delta: number }>;
    firstArchetype: string | null;
    lastArchetype: string | null;
  };
  essay: string | null;
};

export default function RetrospectivePanel({ locale = 'en' }: { locale?: Locale }) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`/api/account/retrospective?year=${year}`);
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error || 'Could not generate retrospective.');
      } else {
        setResult(json);
      }
    } catch (e) {
      console.error(e);
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }

  const years: number[] = [];
  for (let y = 2024; y <= currentYear; y++) years.push(y);

  return (
    <div className="pixel-form">
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
        <label style={{ fontFamily: sans, fontSize: 13, color: '#4A4338' }}>
          {t('retro.year_label', locale)}{' '}
          <select
            value={year}
            onChange={e => setYear(parseInt(e.target.value, 10))}
            style={{
              fontFamily: sans,
              fontSize: 14,
              padding: '6px 10px',
              border: '1px solid #D6CDB6',
              borderRadius: 6,
              background: '#FFFCF4',
              color: '#221E18',
            }}
            aria-label="Select year for retrospective"
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </label>
        <button
          type="button"
          onClick={generate}
          disabled={loading}
          style={{
            fontFamily: sans,
            fontSize: 14.5,
            fontWeight: 500,
            padding: '11px 22px',
            background: '#221E18',
            color: '#FAF6EC',
            border: 'none',
            borderRadius: 8,
            cursor: loading ? 'wait' : 'pointer',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? t('retro.generating', locale) : t('retro.generate', locale)}
        </button>
      </div>

      {error && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(122, 46, 46, 0.08)',
          border: '1px solid rgba(122, 46, 46, 0.2)',
          borderRadius: 6,
          color: '#7A2E2E',
          fontFamily: sans,
          fontSize: 13.5,
          lineHeight: 1.55,
          marginBottom: 24,
        }}>
          {error}
        </div>
      )}

      {result && (
        <div>
          {/* Numbers strip */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: 10,
            marginBottom: 28,
          }}>
            <Stat label={t('retro.label_quizzes', locale)} value={result.periodSummary.counts.quizzes} />
            <Stat label={t('retro.label_dilemmas', locale)} value={result.periodSummary.counts.dilemmas} />
            <Stat label={t('retro.label_diary', locale)} value={result.periodSummary.counts.diaries} />
            <Stat label={t('retro.label_reflections', locale)} value={result.periodSummary.counts.reflections ?? 0} />
          </div>

          {/* Top shifts */}
          {result.periodSummary.topShifts.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <div style={{
                fontFamily: sans,
                fontSize: 11,
                fontWeight: 600,
                color: '#8C6520',
                textTransform: 'uppercase',
                letterSpacing: '0.16em',
                marginBottom: 10,
              }}>
                {t('retro.top_shifts', locale)}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
                {result.periodSummary.topShifts.map(s => (
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

          {/* Essay */}
          {result.essay ? (
            <article style={{
              padding: '32px 36px',
              background: '#FFFCF4',
              border: '4px solid #221E18',
              boxShadow: '5px 5px 0 0 #B8862F',
              borderRadius: 0,
              fontFamily: serif,
              fontSize: 17.5,
              color: '#221E18',
              lineHeight: 1.7,
            }}>
              {result.essay.split(/\n\n+/).map((para, i) => (
                <p key={i} style={{ margin: i === 0 ? '0 0 16px' : '0 0 16px' }}>{para}</p>
              ))}
            </article>
          ) : (
            <p style={{
              fontFamily: serif,
              fontStyle: 'italic',
              fontSize: 16,
              color: '#8C6520',
              opacity: 0.85,
            }}>
              {t('retro.essay_failed', locale)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div style={{
      padding: '14px 16px',
      background: '#FFFCF4',
      border: '3px solid #221E18',
      boxShadow: '3px 3px 0 0 #8C6520',
      borderRadius: 0,
    }}>
      <div style={{
        fontFamily: serif,
        fontSize: 28,
        fontWeight: 500,
        color: '#221E18',
        lineHeight: 1,
      }}>
        {value}
      </div>
      <div style={{
        fontFamily: sans,
        fontSize: 11,
        color: '#8C6520',
        textTransform: 'uppercase',
        letterSpacing: '0.16em',
        marginTop: 6,
      }}>
        {label}
      </div>
    </div>
  );
}
