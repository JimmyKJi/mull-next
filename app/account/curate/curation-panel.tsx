// Client-side curation UI. Loads the candidates + current picks
// from /api/admin/curate, lets the admin assign entries to the three
// slots, optionally with a curator note.
//
// Three areas:
//   - Top: the three slots (1, 2, 3). Each shows the current pick or
//     "Empty — pick into this slot".
//   - Middle: filter chips (all / dilemma / diary / exercise) +
//     days-back select.
//   - Bottom: feed of candidate entries; each has three small
//     "Pick into slot N" buttons + a curator-note input.

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import EmptyStateSprite from '@/components/empty-state-sprite';
import { t, type Locale } from '@/lib/translations';

const serif = "var(--font-prose)";
const sans = "'Inter', system-ui, sans-serif";

const SOURCE_LABEL_KEY: Record<'dilemma' | 'diary' | 'exercise', string> = {
  dilemma: 'crt.source_dilemma',
  diary: 'crt.source_diary',
  exercise: 'crt.source_exercise',
};

type Candidate = {
  source_type: 'dilemma' | 'diary' | 'exercise';
  source_id: string;
  entry_text: string;
  entry_label: string | null;
  entry_created_at: string;
  author_handle: string | null;
  author_display_name: string | null;
  word_count: number | null;
};

type CurrentPick = {
  slot: number;
  source_type: 'dilemma' | 'diary' | 'exercise';
  source_id: string;
  entry_text: string;
  entry_question: string | null;
  entry_title: string | null;
  exercise_slug: string | null;
  entry_created_at: string;
  curator_note: string | null;
  author_handle: string | null;
  author_display_name: string | null;
};

type FilterValue = 'all' | 'dilemma' | 'diary' | 'exercise';

export default function CurationPanel({ locale = 'en' as Locale }: { locale?: Locale }) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [picks, setPicks] = useState<CurrentPick[]>([]);
  const [week, setWeek] = useState<string>('');
  const [filter, setFilter] = useState<FilterValue>('all');
  const [days, setDays] = useState<number>(14);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        days: String(days),
      });
      if (filter !== 'all') params.set('filter', filter);
      if (week) params.set('week', week);
      const res = await fetch(`/api/admin/curate?${params}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || t('crt.err_load', locale));
      setCandidates(json.candidates || []);
      setPicks(json.currentPicks || []);
      setWeek(json.week);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [filter, days]);

  async function pickIntoSlot(slot: 1 | 2 | 3, c: Candidate) {
    const draftKey = `${c.source_type}:${c.source_id}`;
    const note = noteDrafts[draftKey] || '';
    setBusy(draftKey + ':' + slot);
    setError(null);
    try {
      const res = await fetch('/api/admin/curate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          week,
          slot,
          source_type: c.source_type,
          source_id: c.source_id,
          curator_note: note,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || t('crt.err_save', locale));
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function clearSlot(slot: number) {
    if (!confirm(t('crt.confirm_clear', locale, { slot }))) return;
    setBusy('clear:' + slot);
    setError(null);
    try {
      const res = await fetch(`/api/admin/curate?slot=${slot}&week=${encodeURIComponent(week)}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || t('crt.err_delete', locale));
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="pixel-form">
      {/* Slot row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 12,
        marginBottom: 28,
      }}>
        {[1, 2, 3].map(slot => {
          const pick = picks.find(p => p.slot === slot);
          return (
            <div key={slot} style={{
              padding: '14px 16px',
              background: pick ? '#FBF6E8' : '#FFFCF4',
              border: '1px solid',
              borderColor: pick ? '#E2D8B6' : '#EBE3CA',
              borderLeft: `3px solid ${pick ? 'var(--color-acc)' : 'var(--color-line)'}`,
              borderRadius: 8,
              minHeight: 110,
              display: 'flex', flexDirection: 'column',
            }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                fontFamily: sans, fontSize: 11, fontWeight: 600,
                color: pick ? 'var(--color-acc)' : 'var(--color-acc-deep)',
                textTransform: 'uppercase', letterSpacing: '0.16em',
                marginBottom: 8,
              }}>
                <span>{t('crt.slot', locale, { n: slot })}</span>
                {pick && (
                  <button
                    onClick={() => clearSlot(slot)}
                    disabled={busy === 'clear:' + slot}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--color-acc-deep)', fontSize: 14,
                    }}
                    title={t('crt.clear_slot', locale)}
                  >
                    ✕
                  </button>
                )}
              </div>
              {pick ? (
                <>
                  <div style={{
                    fontFamily: sans, fontSize: 11,
                    color: 'var(--color-acc-deep)', marginBottom: 4,
                  }}>
                    {t(SOURCE_LABEL_KEY[pick.source_type], locale)} · {pick.author_handle ? `@${pick.author_handle}` : t('crt.no_profile', locale)}
                  </div>
                  <div style={{
                    fontFamily: serif, fontSize: 14, color: 'var(--color-ink)',
                    lineHeight: 1.4, flex: 1,
                    overflow: 'hidden', display: '-webkit-box',
                    WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' as const,
                  }}>
                    {pick.entry_text}
                  </div>
                  {pick.curator_note && (
                    <div style={{
                      marginTop: 8, padding: '6px 8px',
                      background: '#F5EFDC', borderRadius: 4,
                      fontFamily: serif, fontStyle: 'italic',
                      fontSize: 12, color: 'var(--color-ink-soft)',
                    }}>
                      {pick.curator_note}
                    </div>
                  )}
                </>
              ) : (
                <div style={{
                  fontFamily: serif, fontStyle: 'italic',
                  fontSize: 14, color: 'var(--color-acc-deep)',
                }}>
                  {t('crt.slot_empty', locale)}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Filter row */}
      <div style={{
        display: 'flex', gap: 12, alignItems: 'center',
        flexWrap: 'wrap', marginBottom: 18,
      }}>
        <span style={{
          fontFamily: sans, fontSize: 12, color: 'var(--color-acc-deep)',
          textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 600,
        }}>{t('crt.filter_label', locale)}</span>
        {(['all', 'dilemma', 'diary', 'exercise'] as FilterValue[]).map(v => (
          <button
            key={v}
            onClick={() => setFilter(v)}
            style={{
              padding: '5px 12px',
              borderRadius: 999,
              border: '1px solid',
              borderColor: filter === v ? 'var(--color-ink)' : 'var(--color-line)',
              background: filter === v ? 'var(--color-ink)' : 'transparent',
              color: filter === v ? 'var(--color-cream)' : 'var(--color-ink-soft)',
              fontFamily: sans, fontSize: 12.5, cursor: 'pointer',
            }}
          >
            {v === 'all' ? t('crt.filter_all', locale) : t(SOURCE_LABEL_KEY[v], locale)}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontFamily: sans, fontSize: 12, color: 'var(--color-ink-soft)' }}>
          {t('crt.from_last', locale)}
          <select
            value={days}
            onChange={e => setDays(Number(e.target.value))}
            style={{
              marginLeft: 6, padding: '3px 8px',
              fontFamily: sans, fontSize: 12.5,
              border: '1px solid var(--color-line)', borderRadius: 4, background: '#FFFCF4',
            }}
          >
            <option value={7}>{t('crt.days', locale, { n: 7 })}</option>
            <option value={14}>{t('crt.days', locale, { n: 14 })}</option>
            <option value={30}>{t('crt.days', locale, { n: 30 })}</option>
            <option value={60}>{t('crt.days', locale, { n: 60 })}</option>
          </select>
        </span>
      </div>

      {/* Status / errors */}
      {loading && (
        <p style={{ fontFamily: sans, fontSize: 13, color: 'var(--color-acc-deep)' }}>
          {t('crt.loading_candidates', locale)}
        </p>
      )}
      {error && (
        <p style={{
          fontFamily: sans, fontSize: 13, color: '#7A2E2E',
          background: 'rgba(122,46,46,0.08)',
          padding: '8px 12px', borderRadius: 6,
        }}>{error}</p>
      )}

      {/* Candidates feed */}
      {!loading && candidates.length === 0 && (
        <div style={{
          padding: '20px 18px',
          background: '#FFFCF4',
          border: '3px dashed var(--color-acc-deep)',
          borderRadius: 0,
        }}>
          <EmptyStateSprite
            variant="explorer"
            caption={t('crt.feed_empty', locale)}
          />
        </div>
      )}
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12 }}>
        {candidates.map(c => {
          const draftKey = `${c.source_type}:${c.source_id}`;
          return (
            <li key={draftKey} style={{
              padding: '14px 18px',
              background: '#FFFCF4',
              border: '3px solid var(--color-ink)',
              boxShadow: '3px 3px 0 0 var(--color-acc)',
              borderRadius: 0,
            }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                gap: 12, marginBottom: 6, flexWrap: 'wrap',
              }}>
                <span style={{
                  fontFamily: sans, fontSize: 11, fontWeight: 600,
                  color: 'var(--color-acc-deep)', textTransform: 'uppercase',
                  letterSpacing: '0.14em',
                }}>
                  {t(SOURCE_LABEL_KEY[c.source_type], locale)}
                  {c.author_handle && (
                    <> · <Link href={`/u/${c.author_handle}`} style={{ color: 'var(--color-acc-deep)' }}>@{c.author_handle}</Link></>
                  )}
                  {c.word_count != null && <> · {t('crt.word_count', locale, { n: c.word_count })}</>}
                </span>
                <span style={{ fontFamily: sans, fontSize: 11, color: 'var(--color-acc-deep)' }}>
                  {new Date(c.entry_created_at).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric',
                  })}
                </span>
              </div>
              {c.entry_label && (
                <div style={{
                  fontFamily: serif, fontStyle: 'italic',
                  fontSize: 14, color: 'var(--color-ink-soft)',
                  marginBottom: 6, lineHeight: 1.4,
                }}>
                  {c.entry_label}
                </div>
              )}
              <p style={{
                fontFamily: serif, fontSize: 15.5, color: 'var(--color-ink)',
                margin: '0 0 12px', lineHeight: 1.55, whiteSpace: 'pre-wrap',
                maxHeight: 200, overflow: 'hidden',
              }}>
                {c.entry_text}
              </p>
              <div style={{
                display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap',
              }}>
                <input
                  type="text"
                  placeholder={t('crt.note_placeholder', locale)}
                  value={noteDrafts[draftKey] || ''}
                  onChange={e => setNoteDrafts({ ...noteDrafts, [draftKey]: e.target.value })}
                  style={{
                    flex: 1, minWidth: 200,
                    padding: '6px 10px', fontFamily: sans, fontSize: 13,
                    border: '1px solid var(--color-line)', borderRadius: 4, background: 'var(--color-cream)',
                  }}
                />
                {[1, 2, 3].map(slot => (
                  <button
                    key={slot}
                    onClick={() => pickIntoSlot(slot as 1|2|3, c)}
                    disabled={!!busy}
                    style={{
                      padding: '6px 12px',
                      fontFamily: sans, fontSize: 12.5, fontWeight: 500,
                      background: 'var(--color-ink)', color: 'var(--color-cream)',
                      border: 'none', borderRadius: 4,
                      cursor: busy ? 'wait' : 'pointer',
                      opacity: busy === draftKey + ':' + slot ? 0.6 : 1,
                    }}
                  >
                    {t('crt.slot', locale, { n: slot })}
                  </button>
                ))}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
