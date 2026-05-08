'use client';

import { useMemo, useState } from 'react';
import { matchesPhilosopherSearch, type PhilosopherEntry } from '@/lib/philosophers';
import { FIGURES } from '@/lib/figures';

type SavedDebate = {
  id: string;
  a_name: string;
  a_dates: string | null;
  a_archetype_key: string | null;
  b_name: string;
  b_dates: string | null;
  b_archetype_key: string | null;
  topic: string;
  setup: string | null;
  exchanges: { speaker: 'A' | 'B'; text: string }[];
  created_at: string;
};

const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'Inter', system-ui, sans-serif";

const SUGGESTED_TOPICS = [
  'whether free will is real',
  'what makes a life worth living',
  'whether the self is an illusion',
  'the source of moral authority',
  'whether we owe anything to strangers',
  'the role of suffering in a good life',
  'whether tradition is wisdom or weight',
  'what beauty is for',
  'whether reason or experience reveals truth',
  'how to face death well',
];

type Exchange = { speaker: 'A' | 'B'; text: string };
type DebateResult = {
  ok: boolean;
  a: { name: string; dates: string; archetypeKey: string };
  b: { name: string; dates: string; archetypeKey: string };
  topic: string;
  setup: string;
  exchanges: Exchange[];
};

export default function DebateForm({
  philosophers,
  savedDebates = []
}: {
  philosophers: PhilosopherEntry[];
  savedDebates?: SavedDebate[];
}) {
  const [aName, setAName] = useState('');
  const [bName, setBName] = useState('');
  const [aSearch, setASearch] = useState('');
  const [bSearch, setBSearch] = useState('');
  const [topic, setTopic] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DebateResult | null>(null);

  const filteredA = useMemo(
    () => philosophers.filter(p => matchesPhilosopherSearch(p, aSearch)),
    [aSearch, philosophers]
  );
  const filteredB = useMemo(
    () => philosophers.filter(p => matchesPhilosopherSearch(p, bSearch)),
    [bSearch, philosophers]
  );

  const aPhil = philosophers.find(p => p.name === aName);
  const bPhil = philosophers.find(p => p.name === bName);

  const ready = aName && bName && aName !== bName && topic.trim().length >= 4;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ready || submitting) return;
    setSubmitting(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/debate/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ a_name: aName, b_name: bName, topic: topic.trim() })
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error || 'Could not generate the debate.');
        setSubmitting(false);
        return;
      }
      setResult({
        ...json,
        a: { ...json.a, archetypeKey: aPhil?.archetypeKey || 'cartographer' },
        b: { ...json.b, archetypeKey: bPhil?.archetypeKey || 'hammer' },
      });
    } catch (err) {
      console.error(err);
      setError('Network error. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setResult(null);
    setError(null);
  }

  function loadSaved(d: SavedDebate) {
    setResult({
      ok: true,
      a: { name: d.a_name, dates: d.a_dates ?? '', archetypeKey: d.a_archetype_key ?? 'cartographer' },
      b: { name: d.b_name, dates: d.b_dates ?? '', archetypeKey: d.b_archetype_key ?? 'hammer' },
      topic: d.topic,
      setup: d.setup ?? '',
      exchanges: d.exchanges,
    });
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  if (result) {
    return (
      <div>
        <div style={{
          fontFamily: sans,
          fontSize: 11,
          fontWeight: 600,
          color: '#8C6520',
          textTransform: 'uppercase',
          letterSpacing: '0.18em',
          marginBottom: 14,
        }}>
          The exchange · on {result.topic}
        </div>
        {result.setup && (
          <p style={{
            fontFamily: serif,
            fontStyle: 'italic',
            fontSize: 17,
            color: '#4A4338',
            margin: '0 0 32px',
            lineHeight: 1.55,
          }}>
            {result.setup}
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
          {result.exchanges.map((ex, i) => {
            const isA = ex.speaker === 'A';
            const speaker = isA ? result.a : result.b;
            return (
              <SpeechBubble
                key={i}
                speakerName={speaker.name}
                speakerDates={speaker.dates}
                archetypeKey={speaker.archetypeKey}
                text={ex.text}
                side={isA ? 'left' : 'right'}
              />
            );
          })}
        </div>

        <div style={{ marginTop: 36, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            onClick={reset}
            style={{
              padding: '11px 20px',
              background: '#221E18',
              color: '#FAF6EC',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontFamily: sans,
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            ← Different debate
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 20,
      }}>
        <PhilosopherPicker
          letter="A"
          accent="#1E3A5F"
          search={aSearch}
          setSearch={setASearch}
          selected={aName}
          setSelected={setAName}
          options={filteredA}
          excludeName={bName}
        />
        <PhilosopherPicker
          letter="B"
          accent="#7A2E2E"
          search={bSearch}
          setSearch={setBSearch}
          selected={bName}
          setSelected={setBName}
          options={filteredB}
          excludeName={aName}
        />
      </div>

      <div>
        <label style={{
          fontFamily: sans,
          fontSize: 11,
          fontWeight: 600,
          color: '#8C6520',
          textTransform: 'uppercase',
          letterSpacing: '0.18em',
          display: 'block',
          marginBottom: 10,
        }}>
          The topic
        </label>
        <input
          type="text"
          value={topic}
          onChange={e => setTopic(e.target.value)}
          placeholder="e.g. whether free will is real"
          maxLength={240}
          style={{
            fontFamily: serif,
            fontSize: 18,
            padding: '14px 18px',
            border: '1px solid #D6CDB6',
            borderRadius: 10,
            background: '#FFFCF4',
            color: '#221E18',
            outline: 'none',
            width: '100%',
            boxSizing: 'border-box',
          }}
        />
        <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {SUGGESTED_TOPICS.map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setTopic(t)}
              style={{
                fontFamily: sans,
                fontSize: 12,
                padding: '6px 12px',
                background: topic === t ? '#221E18' : '#F5EFDC',
                color: topic === t ? '#FAF6EC' : '#4A4338',
                border: '1px solid #D6CDB6',
                borderRadius: 999,
                cursor: 'pointer',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <button
          type="submit"
          disabled={!ready || submitting}
          style={{
            fontFamily: sans,
            fontSize: 15,
            fontWeight: 500,
            padding: '14px 28px',
            background: ready ? '#221E18' : '#A39880',
            color: '#FAF6EC',
            border: 'none',
            borderRadius: 8,
            cursor: ready && !submitting ? 'pointer' : 'not-allowed',
            opacity: submitting ? 0.7 : 1,
            letterSpacing: 0.4,
          }}
        >
          {submitting ? 'Generating exchange…' : 'Stage the debate →'}
        </button>
        {!ready && (aName || bName) && (
          <span style={{ fontFamily: sans, fontSize: 12.5, color: '#8C6520' }}>
            {!aName ? 'Pick a thinker for A.' :
             !bName ? 'Pick a thinker for B.' :
             aName === bName ? 'Pick two different thinkers.' :
             topic.trim().length < 4 ? 'Choose a topic.' : ''}
          </span>
        )}
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

      {savedDebates.length > 0 && (
        <SavedDebatesList debates={savedDebates} onPick={loadSaved} />
      )}
    </form>
  );
}

function SavedDebatesList({
  debates, onPick
}: {
  debates: SavedDebate[];
  onPick: (d: SavedDebate) => void;
}) {
  const fmtRel = (s: string) => {
    const diff = Date.now() - new Date(s).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return mins <= 1 ? 'just now' : `${mins} min ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hr${hours === 1 ? '' : 's'} ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
    return new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  return (
    <div style={{
      marginTop: 28,
      paddingTop: 28,
      borderTop: '1px solid #EBE3CA',
    }}>
      <div style={{
        fontFamily: sans,
        fontSize: 11,
        fontWeight: 600,
        color: '#8C6520',
        textTransform: 'uppercase',
        letterSpacing: '0.18em',
        marginBottom: 14,
      }}>
        Your recent debates · last {debates.length}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {debates.map(d => (
          <button
            key={d.id}
            type="button"
            onClick={() => onPick(d)}
            style={{
              textAlign: 'left',
              padding: '14px 18px',
              background: '#FFFCF4',
              border: '1px solid #EBE3CA',
              borderLeft: '3px solid #B8862F',
              borderRadius: 8,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'border-color 0.12s ease, background 0.12s ease',
              width: '100%',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderLeftColor = '#221E18';
              e.currentTarget.style.background = '#F5EFDC';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderLeftColor = '#B8862F';
              e.currentTarget.style.background = '#FFFCF4';
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              flexWrap: 'wrap',
              gap: 8,
              marginBottom: 4,
            }}>
              <span style={{
                fontFamily: serif,
                fontSize: 17,
                fontWeight: 500,
                color: '#221E18',
              }}>
                <em style={{ fontStyle: 'italic' }}>{d.a_name}</em>
                <span style={{ color: '#8C6520', margin: '0 8px', fontStyle: 'normal' }}>×</span>
                <em style={{ fontStyle: 'italic' }}>{d.b_name}</em>
              </span>
              <span style={{
                fontFamily: sans,
                fontSize: 11,
                color: '#8C6520',
                letterSpacing: 0.3,
              }}>
                {fmtRel(d.created_at)}
              </span>
            </div>
            <div style={{
              fontFamily: serif,
              fontStyle: 'italic',
              fontSize: 14.5,
              color: '#4A4338',
              lineHeight: 1.4,
            }}>
              on {d.topic}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function SpeechBubble({
  speakerName, speakerDates, archetypeKey, text, side
}: {
  speakerName: string;
  speakerDates: string;
  archetypeKey: string;
  text: string;
  side: 'left' | 'right';
}) {
  const figureSvg = FIGURES[archetypeKey] || FIGURES['cartographer'] || '';
  const isLeft = side === 'left';

  const portrait = (
    <div style={{
      width: 80,
      height: 80,
      borderRadius: '50%',
      background: '#FFFCF4',
      border: '2px solid #D6CDB6',
      flexShrink: 0,
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div
        style={{ width: '100%', height: '100%' }}
        dangerouslySetInnerHTML={{ __html: figureSvg }}
      />
    </div>
  );

  const nameLabel = (
    <div style={{ flexShrink: 0, textAlign: isLeft ? 'left' : 'right', minWidth: 0 }}>
      <div style={{
        fontFamily: serif,
        fontSize: 16,
        fontWeight: 500,
        fontStyle: 'italic',
        color: '#221E18',
        lineHeight: 1.1,
      }}>
        {speakerName}
      </div>
      <div style={{
        fontFamily: sans,
        fontSize: 11,
        color: '#8C6520',
        letterSpacing: 0.3,
        marginTop: 2,
      }}>
        {speakerDates}
      </div>
    </div>
  );

  const bubble = (
    <div style={{
      flex: 1,
      minWidth: 0,
      position: 'relative',
      background: '#FFFCF4',
      border: '1px solid #D6CDB6',
      borderRadius: 18,
      padding: '18px 22px',
      fontFamily: serif,
      fontSize: 17,
      color: '#221E18',
      lineHeight: 1.6,
      boxShadow: '0 2px 8px rgba(34, 30, 24, 0.04)',
    }}>
      {/* Speech-bubble tail */}
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 28,
          [isLeft ? 'left' : 'right']: -8,
          width: 16,
          height: 16,
          background: '#FFFCF4',
          borderTop: '1px solid #D6CDB6',
          borderLeft: isLeft ? '1px solid #D6CDB6' : 'none',
          borderRight: !isLeft ? '1px solid #D6CDB6' : 'none',
          borderBottom: 'none',
          transform: `rotate(${isLeft ? '-45deg' : '45deg'})`,
          borderTopLeftRadius: 2,
        }}
      />
      <p style={{ margin: 0 }}>{text}</p>
    </div>
  );

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: isLeft ? '90px 1fr' : '1fr 90px',
      gap: 18,
      alignItems: 'flex-start',
    }}>
      {isLeft ? (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            {portrait}
            {nameLabel}
          </div>
          {bubble}
        </>
      ) : (
        <>
          {bubble}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            {portrait}
            {nameLabel}
          </div>
        </>
      )}
    </div>
  );
}

function PhilosopherPicker({
  letter, accent, search, setSearch, selected, setSelected, options, excludeName
}: {
  letter: string;
  accent: string;
  search: string;
  setSearch: (s: string) => void;
  selected: string;
  setSelected: (s: string) => void;
  options: PhilosopherEntry[];
  excludeName: string;
}) {
  const filtered = options.filter(p => p.name !== excludeName);
  return (
    <div>
      <label style={{
        fontFamily: sans,
        fontSize: 11,
        fontWeight: 600,
        color: accent,
        textTransform: 'uppercase',
        letterSpacing: '0.18em',
        display: 'block',
        marginBottom: 10,
      }}>
        Speaker {letter}
      </label>
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search by name, first name, or idea…"
        style={{
          fontFamily: sans,
          fontSize: 14,
          padding: '11px 14px',
          border: '1px solid #D6CDB6',
          borderRadius: 8,
          background: '#FFFCF4',
          color: '#221E18',
          outline: 'none',
          width: '100%',
          boxSizing: 'border-box',
          marginBottom: 8,
        }}
      />
      <div style={{
        fontFamily: sans,
        fontSize: 11,
        color: '#8C6520',
        marginBottom: 6,
        letterSpacing: 0.3,
      }}>
        {filtered.length} thinker{filtered.length === 1 ? '' : 's'}{search ? ` matching "${search}"` : ''}
      </div>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        maxHeight: 360,
        overflowY: 'auto',
        background: '#FFFCF4',
        border: '1px solid #EBE3CA',
        borderRadius: 8,
        padding: 6,
      }}>
        {filtered.length === 0 && (
          <div style={{
            padding: '12px',
            fontFamily: sans,
            fontSize: 13,
            color: '#8C6520',
            fontStyle: 'italic',
          }}>
            No matches.
          </div>
        )}
        {filtered.map(p => {
          const isSelected = selected === p.name;
          return (
            <button
              key={p.name}
              type="button"
              onClick={() => setSelected(p.name)}
              style={{
                textAlign: 'left',
                padding: '8px 12px',
                background: isSelected ? accent : 'transparent',
                color: isSelected ? '#FAF6EC' : '#221E18',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                fontFamily: sans,
                fontSize: 14,
                transition: 'background 0.12s ease',
              }}
            >
              <div style={{
                fontFamily: serif,
                fontSize: 16,
                fontWeight: 500,
                lineHeight: 1.15,
              }}>
                {p.name}
              </div>
              <div style={{
                fontSize: 11,
                opacity: isSelected ? 0.85 : 0.6,
                marginTop: 2,
              }}>
                {p.dates}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
