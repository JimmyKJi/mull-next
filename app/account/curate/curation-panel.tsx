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

const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'Inter', system-ui, sans-serif";

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

export default function CurationPanel() {
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
      if (!res.ok) throw new Error(json?.error || 'Failed to load.');
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
      if (!res.ok) throw new Error(json?.error || 'Save failed.');
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function clearSlot(slot: number) {
    if (!confirm(`Clear slot ${slot}?`)) return;
    setBusy('clear:' + slot);
    setError(null);
    try {
      const res = await fetch(`/api/admin/curate?slot=${slot}&week=${encodeURIComponent(week)}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Delete failed.');
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
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
              borderLeft: `3px solid ${pick ? '#B8862F' : '#D6CDB6'}`,
              borderRadius: 8,
              minHeight: 110,
              display: 'flex', flexDirection: 'column',
            }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                fontFamily: sans, fontSize: 11, fontWeight: 600,
                color: pick ? '#B8862F' : '#8C6520',
                textTransform: 'uppercase', letterSpacing: '0.16em',
                marginBottom: 8,
              }}>
                <span>Slot {slot}</span>
                {pick && (
                  <button
                    onClick={() => clearSlot(slot)}
                    disabled={busy === 'clear:' + slot}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#8C6520', fontSize: 14,
                    }}
                    title="Clear this slot"
                  >
                    ✕
                  </button>
                )}
              </div>
              {pick ? (
                <>
                  <div style={{
                    fontFamily: sans, fontSize: 11,
                    color: '#8C6520', marginBottom: 4,
                  }}>
                    {pick.source_type} · {pick.author_handle ? `@${pick.author_handle}` : 'no profile'}
                  </div>
                  <div style={{
                    fontFamily: serif, fontSize: 14, color: '#221E18',
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
                      fontSize: 12, color: '#4A4338',
                    }}>
                      {pick.curator_note}
                    </div>
                  )}
                </>
              ) : (
                <div style={{
                  fontFamily: serif, fontStyle: 'italic',
                  fontSize: 14, color: '#8C6520',
                }}>
                  Empty
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
          fontFamily: sans, fontSize: 12, color: '#8C6520',
          textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 600,
        }}>Filter:</span>
        {(['all', 'dilemma', 'diary', 'exercise'] as FilterValue[]).map(v => (
          <button
            key={v}
            onClick={() => setFilter(v)}
            style={{
              padding: '5px 12px',
              borderRadius: 999,
              border: '1px solid',
              borderColor: filter === v ? '#221E18' : '#D6CDB6',
              background: filter === v ? '#221E18' : 'transparent',
              color: filter === v ? '#FAF6EC' : '#4A4338',
              fontFamily: sans, fontSize: 12.5, cursor: 'pointer',
            }}
          >
            {v}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontFamily: sans, fontSize: 12, color: '#4A4338' }}>
          From last
          <select
            value={days}
            onChange={e => setDays(Number(e.target.value))}
            style={{
              marginLeft: 6, padding: '3px 8px',
              fontFamily: sans, fontSize: 12.5,
              border: '1px solid #D6CDB6', borderRadius: 4, background: '#FFFCF4',
            }}
          >
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
            <option value={30}>30 days</option>
            <option value={60}>60 days</option>
          </select>
        </span>
      </div>

      {/* Status / errors */}
      {loading && (
        <p style={{ fontFamily: sans, fontSize: 13, color: '#8C6520' }}>
          Loading candidates…
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
        <p style={{
          fontFamily: serif, fontStyle: 'italic',
          fontSize: 15, color: '#8C6520',
          padding: '14px 18px',
          background: '#FFFCF4', border: '1px dashed #D6CDB6',
          borderRadius: 8,
        }}>
          No public entries match these filters yet.
        </p>
      )}
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12 }}>
        {candidates.map(c => {
          const draftKey = `${c.source_type}:${c.source_id}`;
          return (
            <li key={draftKey} style={{
              padding: '14px 18px',
              background: '#FFFCF4', border: '1px solid #EBE3CA',
              borderRadius: 8,
            }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                gap: 12, marginBottom: 6, flexWrap: 'wrap',
              }}>
                <span style={{
                  fontFamily: sans, fontSize: 11, fontWeight: 600,
                  color: '#8C6520', textTransform: 'uppercase',
                  letterSpacing: '0.14em',
                }}>
                  {c.source_type}
                  {c.author_handle && (
                    <> · <Link href={`/u/${c.author_handle}`} style={{ color: '#8C6520' }}>@{c.author_handle}</Link></>
                  )}
                  {c.word_count != null && <> · {c.word_count}w</>}
                </span>
                <span style={{ fontFamily: sans, fontSize: 11, color: '#8C6520' }}>
                  {new Date(c.entry_created_at).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric',
                  })}
                </span>
              </div>
              {c.entry_label && (
                <div style={{
                  fontFamily: serif, fontStyle: 'italic',
                  fontSize: 14, color: '#4A4338',
                  marginBottom: 6, lineHeight: 1.4,
                }}>
                  {c.entry_label}
                </div>
              )}
              <p style={{
                fontFamily: serif, fontSize: 15.5, color: '#221E18',
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
                  placeholder="Optional curator note (shown publicly)"
                  value={noteDrafts[draftKey] || ''}
                  onChange={e => setNoteDrafts({ ...noteDrafts, [draftKey]: e.target.value })}
                  style={{
                    flex: 1, minWidth: 200,
                    padding: '6px 10px', fontFamily: sans, fontSize: 13,
                    border: '1px solid #D6CDB6', borderRadius: 4, background: '#FAF6EC',
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
                      background: '#221E18', color: '#FAF6EC',
                      border: 'none', borderRadius: 4,
                      cursor: busy ? 'wait' : 'pointer',
                      opacity: busy === draftKey + ':' + slot ? 0.6 : 1,
                    }}
                  >
                    Slot {slot}
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
