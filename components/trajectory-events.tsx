// TrajectoryEvents — the "recent shifts" event-card list on /account.
//
// Extracted from app/account/page.tsx in the code-structure pass. The
// inline JSX block was ~220 lines of switch-on-event.kind rendering;
// pulling it into a dedicated component leaves /account/page.tsx
// focused on data fetching + layout, and keeps the per-event UI
// logic (accent color map, formatting, shift chip layout) in one
// reviewable place.
//
// Server component — no client state, no event handlers. Only
// reads + renders.

import { topShifts } from '@/lib/dimensions';
import { t, type Locale } from '@/lib/translations';

const serif = "'Cormorant Garamond', Georgia, serif";
const pixel = "var(--font-pixel-display, 'Courier New', monospace)";

// Unified event the UI iterates over. Mirrors the type in
// app/account/page.tsx; if you change one, change the other.
export type EventEntry =
  | {
      kind: 'quiz';
      id: string;
      timestamp: number;
      archetype: string;
      flavor: string | null;
      alignment_pct: number;
      vector: number[];           // absolute position
      taken_at: string;
    }
  | {
      kind: 'dilemma';
      id: string;
      timestamp: number;
      question_text: string;
      response_text: string;
      delta: number[];
      analysis: string | null;
      created_at: string;
    }
  | {
      kind: 'diary';
      id: string;
      timestamp: number;
      title: string | null;
      content: string;
      delta: number[];
      analysis: string | null;
      word_count: number | null;
      created_at: string;
    }
  | {
      kind: 'exercise';
      id: string;
      timestamp: number;
      exercise_slug: string;
      content: string;
      delta: number[];
      analysis: string | null;
      word_count: number | null;
      created_at: string;
    };

export type TrajectoryStep = {
  event: EventEntry;
  before: number[];
  after: number[];
  delta: number[];
};

// Per-kind accent map — drives the shadow color so each event-type
// reads at-a-glance: amber=quiz, blue=dilemma, teal=diary, brick=exercise.
const ACCENT: Record<EventEntry['kind'], string> = {
  quiz: '#B8862F',
  dilemma: '#3D7DA8',
  diary: '#2F5D5C',
  exercise: '#7A2E2E',
};

function eventTimestamp(event: EventEntry): string {
  return event.kind === 'quiz' ? event.taken_at : event.created_at;
}

function eventLabel(event: EventEntry, locale: Locale): string {
  switch (event.kind) {
    case 'quiz':
      return t('account.event_quiz_attempt', locale);
    case 'dilemma':
      return t('account.event_daily_dilemma', locale);
    case 'diary':
      return t('account.event_diary_entry', locale);
    case 'exercise':
      return t('account.event_exercise_reflection', locale);
  }
}

export default function TrajectoryEvents({
  trajectory,
  locale,
  fmt,
  fmtRel,
}: {
  trajectory: TrajectoryStep[];
  locale: Locale;
  /** Absolute datetime formatter (e.g. "Jan 14, 2026, 9:00 AM"). */
  fmt: (s: string) => string;
  /** Relative time string (e.g. "2 days ago"). */
  fmtRel: (s: string) => string;
}) {
  if (trajectory.length === 0) return null;

  return (
    <section id="shifts" style={{ marginBottom: 48, scrollMarginTop: 96 }}>
      <h2 style={sectionH2}>
        ▸ {t('account.recent_shifts', locale).toUpperCase()}
      </h2>
      <p style={sectionSubtitle}>
        {t('account.recent_shifts_subtitle', locale)}
      </p>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {trajectory.map(({ event, delta }) => (
          <EventCard
            key={event.id}
            event={event}
            delta={delta}
            locale={locale}
            fmt={fmt}
            fmtRel={fmtRel}
          />
        ))}
      </ul>
    </section>
  );
}

function EventCard({
  event, delta, locale, fmt, fmtRel,
}: {
  event: EventEntry;
  delta: number[];
  locale: Locale;
  fmt: (s: string) => string;
  fmtRel: (s: string) => string;
}) {
  const shifts = topShifts(delta, 0.3, 3);
  const ts = eventTimestamp(event);
  const accent = ACCENT[event.kind];
  const labelText = eventLabel(event, locale);

  return (
    <li style={{
      padding: '18px 20px',
      marginBottom: 14,
      background: '#FFFCF4',
      border: '4px solid #221E18',
      boxShadow: `4px 4px 0 0 ${accent}`,
      borderRadius: 0,
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 8,
      }}>
        <span style={{
          fontFamily: pixel,
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: '0.18em',
          color: accent,
        }}>
          {labelText.toUpperCase()} · {fmtRel(ts).toUpperCase()}
        </span>
        <span style={{
          fontFamily: pixel,
          fontSize: 10,
          color: '#8C6520',
          opacity: 0.85,
          letterSpacing: 0.4,
          textTransform: 'uppercase',
        }}>
          {fmt(ts)}
        </span>
      </div>

      {event.kind === 'quiz' && (
        <div style={{
          fontFamily: serif,
          fontSize: 22,
          fontWeight: 500,
          color: '#221E18',
          marginBottom: shifts.length ? 10 : 0,
          letterSpacing: '-0.01em',
        }}>
          {event.flavor ? `${event.flavor} ` : ''}
          {event.archetype.replace(/^The /, '')}
          <span style={{
            fontFamily: pixel,
            fontSize: 12,
            color: '#8C6520',
            marginLeft: 12,
            letterSpacing: 0.4,
          }}>
            {event.alignment_pct}%
          </span>
        </div>
      )}

      {event.kind === 'dilemma' && (
        <>
          <p style={{
            fontFamily: serif,
            fontStyle: 'italic',
            fontSize: 17,
            color: '#4A4338',
            margin: '0 0 8px',
          }}>
            &ldquo;{event.question_text}&rdquo;
          </p>
          {event.analysis && (
            <p style={{
              fontFamily: serif,
              fontSize: 15,
              color: '#221E18',
              margin: '0 0 10px',
              lineHeight: 1.55,
            }}>
              {event.analysis}
            </p>
          )}
        </>
      )}

      {event.kind === 'diary' && (
        <>
          {event.title && (
            <div style={{
              fontFamily: serif,
              fontSize: 19,
              fontWeight: 500,
              color: '#221E18',
              marginBottom: 6,
            }}>
              {event.title}
            </div>
          )}
          <p style={{
            fontFamily: serif,
            fontSize: 15.5,
            color: '#4A4338',
            margin: '0 0 8px',
            lineHeight: 1.55,
          }}>
            {event.content.length > 240 ? event.content.slice(0, 240) + '…' : event.content}
          </p>
          {event.analysis && (
            <p style={{
              fontFamily: serif,
              fontStyle: 'italic',
              fontSize: 14,
              color: '#8C6520',
              margin: '0 0 10px',
              lineHeight: 1.5,
            }}>
              {event.analysis}
            </p>
          )}
          <a href={`/diary/${event.id}`} style={{
            fontFamily: pixel,
            fontSize: 11,
            color: '#2F5D5C',
            textDecoration: 'none',
            letterSpacing: 0.4,
            textTransform: 'uppercase',
            borderBottom: '2px solid #2F5D5C',
            paddingBottom: 1,
          }}>
            ▸ {t('account.read_full_entry', locale).toUpperCase()}
          </a>
        </>
      )}

      {shifts.length > 0 ? (
        <div style={{
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
          marginTop: 12,
          paddingTop: 12,
          borderTop: '2px dashed #D6CDB6',
        }}>
          {shifts.map(s => (
            <span key={s.key} style={{
              fontFamily: pixel,
              fontSize: 11,
              color: s.delta > 0 ? '#2F5D5C' : '#7A2E2E',
              letterSpacing: 0.4,
              textTransform: 'uppercase',
              padding: '4px 10px',
              background: s.delta > 0 ? '#E5F0EE' : '#F5E0E0',
              border: `2px solid ${s.delta > 0 ? '#2F5D5C' : '#7A2E2E'}`,
            }}>
              <strong style={{ fontVariantNumeric: 'tabular-nums' }}>
                {s.delta > 0 ? '+' : ''}{s.delta.toFixed(1)}
              </strong>{' '}
              {s.name}
            </span>
          ))}
        </div>
      ) : (
        event.kind === 'quiz' && (
          <div style={{
            fontFamily: serif,
            fontStyle: 'italic',
            fontSize: 13,
            color: '#8C6520',
            opacity: 0.85,
            marginTop: 10,
          }}>
            {t('account.first_event', locale)}
          </div>
        )
      )}
    </li>
  );
}

const sectionH2: React.CSSProperties = {
  fontFamily: pixel,
  fontSize: 16,
  color: '#221E18',
  textTransform: 'uppercase',
  letterSpacing: '0.18em',
  marginBottom: 8,
  textShadow: '2px 2px 0 #B8862F',
};

const sectionSubtitle: React.CSSProperties = {
  fontFamily: serif,
  fontStyle: 'italic',
  fontSize: 14.5,
  color: '#4A4338',
  marginBottom: 22,
  lineHeight: 1.55,
};
