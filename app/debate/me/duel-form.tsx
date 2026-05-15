'use client';

import { useMemo, useState } from 'react';
import { matchesPhilosopherSearch, type PhilosopherEntry } from '@/lib/philosophers';
import { FIGURES } from '@/lib/figures';
import { t, type Locale } from '@/lib/translations';

const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'Inter', system-ui, sans-serif";

const SUGGESTED_TOPICS = [
  'whether free will is real',
  'what makes a life worth living',
  'whether the self is an illusion',
  'the source of moral authority',
  'whether tradition is wisdom or weight',
  'how to face death well',
  'what beauty is for',
  'whether we owe anything to strangers',
];

type Exchange = { speaker: 'A' | 'B'; text: string };
type DuelResult = {
  ok: boolean;
  a: { name: string; dates: string; archetypeKey: string | null };
  b: { name: string; dates: string; archetypeKey: string };
  topic: string;
  setup: string;
  exchanges: Exchange[];
};

export default function DuelForm({ philosophers, locale = 'en' }: { philosophers: PhilosopherEntry[]; locale?: Locale }) {
  const [philName, setPhilName] = useState('');
  const [search, setSearch] = useState('');
  const [topic, setTopic] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DuelResult | null>(null);

  const filtered = useMemo(
    () => philosophers.filter(p => matchesPhilosopherSearch(p, search)),
    [search, philosophers]
  );

  const ready = !!philName && topic.trim().length >= 4;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ready || submitting) return;
    setSubmitting(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/debate/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phil_name: philName, topic: topic.trim() })
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error || 'Could not generate.');
        setSubmitting(false);
        return;
      }
      setResult(json);
    } catch (err) {
      console.error(err);
      setError('Network error.');
    } finally {
      setSubmitting(false);
    }
  }

  function reset() { setResult(null); setError(null); }

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
          {t('duel.you_vs', locale, { name: result.b.name, topic: result.topic })}
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
              <DuelBubble
                key={i}
                speakerName={isA ? 'You' : speaker.name}
                speakerSubtitle={isA ? `as ${speaker.name}` : speaker.dates}
                archetypeKey={speaker.archetypeKey}
                text={ex.text}
                side={isA ? 'left' : 'right'}
                isUser={isA}
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
            {t('duel.different_debate', locale)}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="pixel-form" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <PhilosopherPicker
        search={search}
        setSearch={setSearch}
        selected={philName}
        setSelected={setPhilName}
        options={filtered}
        locale={locale}
      />

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
          {t('debate.topic_label', locale)}
        </label>
        <input
          type="text"
          value={topic}
          onChange={e => setTopic(e.target.value)}
          placeholder={t('debate.topic_placeholder', locale)}
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
          {SUGGESTED_TOPICS.map(suggestion => (
            <button
              key={suggestion}
              type="button"
              onClick={() => setTopic(suggestion)}
              style={{
                fontFamily: sans,
                fontSize: 12,
                padding: '6px 12px',
                background: topic === suggestion ? '#221E18' : '#F5EFDC',
                color: topic === suggestion ? '#FAF6EC' : '#4A4338',
                border: '1px solid #D6CDB6',
                borderRadius: 999,
                cursor: 'pointer',
              }}
            >
              {suggestion}
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
          {submitting ? t('debate.generating', locale) : t('debate.stage_debate', locale)}
        </button>
        {!ready && (
          <span style={{ fontFamily: sans, fontSize: 12.5, color: '#8C6520' }}>
            {!philName ? t('duel.pick_thinker', locale) : topic.trim().length < 4 ? t('debate.choose_topic', locale) : ''}
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
    </form>
  );
}

function DuelBubble({
  speakerName, speakerSubtitle, archetypeKey, text, side, isUser
}: {
  speakerName: string;
  speakerSubtitle: string;
  archetypeKey: string | null;
  text: string;
  side: 'left' | 'right';
  isUser: boolean;
}) {
  const figureSvg = archetypeKey ? (FIGURES[archetypeKey] || '') : '';
  const isLeft = side === 'left';

  const portrait = (
    <div style={{
      width: 80,
      height: 80,
      borderRadius: '50%',
      background: isUser ? '#221E18' : '#FFFCF4',
      border: isUser ? '2px solid #B8862F' : '2px solid #D6CDB6',
      flexShrink: 0,
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#F1C76A',
    }}>
      {isUser ? (
        <span style={{
          fontFamily: serif,
          fontSize: 24,
          fontWeight: 500,
          fontStyle: 'italic',
          letterSpacing: 1,
        }}>YOU</span>
      ) : (
        <div
          style={{ width: '100%', height: '100%' }}
          dangerouslySetInnerHTML={{ __html: figureSvg }}
        />
      )}
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
        {speakerSubtitle}
      </div>
    </div>
  );

  const bubble = (
    <div style={{
      flex: 1,
      minWidth: 0,
      position: 'relative',
      background: isUser ? '#F5EFDC' : '#FFFCF4',
      border: '1px solid #D6CDB6',
      borderRadius: 18,
      padding: '18px 22px',
      fontFamily: serif,
      fontSize: 17,
      color: '#221E18',
      lineHeight: 1.6,
      boxShadow: '0 2px 8px rgba(34, 30, 24, 0.04)',
    }}>
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 28,
          [isLeft ? 'left' : 'right']: -8,
          width: 16,
          height: 16,
          background: isUser ? '#F5EFDC' : '#FFFCF4',
          borderTop: '1px solid #D6CDB6',
          borderLeft: isLeft ? '1px solid #D6CDB6' : 'none',
          borderRight: !isLeft ? '1px solid #D6CDB6' : 'none',
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
  search, setSearch, selected, setSelected, options, locale
}: {
  search: string;
  setSearch: (s: string) => void;
  selected: string;
  setSelected: (s: string) => void;
  options: PhilosopherEntry[];
  locale: Locale;
}) {
  return (
    <div>
      <label style={{
        fontFamily: sans,
        fontSize: 11,
        fontWeight: 600,
        color: '#7A2E2E',
        textTransform: 'uppercase',
        letterSpacing: '0.18em',
        display: 'block',
        marginBottom: 10,
      }}>
        {t('duel.opponent_label', locale)}
      </label>
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder={t('duel.search_placeholder', locale)}
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
        {search ? t('duel.matching', locale, { count: options.length, q: search }) : `${options.length} thinker${options.length === 1 ? '' : 's'}`}
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
        {options.length === 0 && (
          <div style={{
            padding: '12px',
            fontFamily: sans,
            fontSize: 13,
            color: '#8C6520',
            fontStyle: 'italic',
          }}>
            {t('duel.no_matches', locale)}
          </div>
        )}
        {options.map(p => {
          const isSelected = selected === p.name;
          return (
            <button
              key={p.name}
              type="button"
              onClick={() => setSelected(p.name)}
              style={{
                textAlign: 'left',
                padding: '8px 12px',
                background: isSelected ? '#7A2E2E' : 'transparent',
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
