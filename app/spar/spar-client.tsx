'use client';

// SparClient — the user-facing form for the Daily Spar.
//
// The exchange runs in TWO phases so it always ends on the USER's turn
// (you should never be judged for failing to answer an argument you had
// no turn to respond to):
//
//   1. "compose"  — textarea for the user's opening turn
//   2. "thinking" — loader while the philosopher's single rebuttal runs
//   3. "closing"  — the rebuttal is shown + a textarea for the user's
//                   closing turn (their last word)
//   4. "judging"  — loader while the Sonnet judge reads all three turns
//   5. "result"   — the full exchange + the judge's winner-free outcome
//
// The judge never crowns a winner: it reports the OUTCOME (common
// ground / distinct positions / talked past) and scores each side on
// its own merits.
//
// Daily limit (v1, client-side): 3 spars per day tracked in
// localStorage, consumed when the opening turn is sent. Hits the cap →
// the compose form is replaced with a "come back tomorrow" notice.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SPAR_DAILY_LIMIT, SPAR_LIMIT_KEY, SPAR_MAX_USER_CHARS } from '@/lib/spar';
import { resolveOutcome, resolveAssessment, type JudgeOutput } from '@/lib/arena/judge';
import { scoreToPerformance } from '@/lib/arena/elo';
import { emitFeatureEvent } from '@/lib/capabilities';
import SaveToAnthology from '@/components/save-to-anthology';
import { t, type Locale } from '@/lib/translations';

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";
const serif = 'var(--font-editorial), Georgia, serif';

type Props = {
  /** English name — the API lookup key + internal event label. */
  philosopherName: string;
  /** Localized name — for display. */
  philosopherDisplay: string;
  topicSlug: string;
  topicPrimer: string;
  dateKey: string;
  locale: Locale;
};

export default function SparClient({
  philosopherName,
  philosopherDisplay,
  topicSlug,
  topicPrimer,
  dateKey,
  locale,
}: Props) {
  // Phase 1 input (opening) and phase 2 input (closing).
  const [opening, setOpening] = useState('');
  const [closing, setClosing] = useState('');
  // Set once phase 1 returns — also the signal that the spar has started.
  const [philosopherTurn, setPhilosopherTurn] = useState<string | null>(null);
  // Set once phase 2 returns — the signal that the spar is over.
  const [judged, setJudged] = useState(false);
  const [judge, setJudge] = useState<JudgeOutput | null>(null);
  const [judgeError, setJudgeError] = useState<string | undefined>(undefined);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playsToday, setPlaysToday] = useState<number>(0);

  // Load today's play count from localStorage.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SPAR_LIMIT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { dateKey?: string; count?: number };
        if (parsed.dateKey === dateKey && typeof parsed.count === 'number') {
          setPlaysToday(parsed.count);
        }
      }
    } catch {
      // ignore
    }
  }, [dateKey]);

  const reachedLimit = playsToday >= SPAR_DAILY_LIMIT;
  const started = philosopherTurn !== null;
  const openingOver = opening.length > SPAR_MAX_USER_CHARS;
  const closingOver = closing.length > SPAR_MAX_USER_CHARS;

  // ─── Phase 1: send the opening, get the philosopher's rebuttal ───
  async function submitOpening() {
    if (submitting || !opening.trim() || openingOver || reachedLimit) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/spar/play', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          philosopherName,
          topicSlug,
          userTurn: opening.trim(),
          locale,
        }),
      });
      if (!res.ok) {
        const errBody = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(errBody.error || t('argdiary.err_request', locale, { status: res.status }));
      }
      const data = (await res.json()) as { philosopherTurn?: string };
      if (!data.philosopherTurn) {
        throw new Error(t('argdiary.err_generic', locale));
      }
      setPhilosopherTurn(data.philosopherTurn);
      // Opening sent = one spar consumed. Increment now so a 4th can't
      // start; the closing turn below is part of this same spar.
      const nextCount = playsToday + 1;
      setPlaysToday(nextCount);
      try {
        window.localStorage.setItem(SPAR_LIMIT_KEY, JSON.stringify({ dateKey, count: nextCount }));
      } catch {
        // ignore
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t('argdiary.err_generic', locale));
    } finally {
      setSubmitting(false);
    }
  }

  // ─── Phase 2: send the closing, get the judge's outcome ──────────
  async function submitClosing() {
    if (submitting || !closing.trim() || closingOver || !philosopherTurn) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/spar/play', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          philosopherName,
          topicSlug,
          userTurn: opening.trim(),
          philosopherTurn,
          closingTurn: closing.trim(),
          locale,
        }),
      });
      if (!res.ok) {
        const errBody = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(errBody.error || t('argdiary.err_request', locale, { status: res.status }));
      }
      const data = (await res.json()) as {
        judge: JudgeOutput | null;
        judgeError?: string;
      };
      setJudge(data.judge);
      setJudgeError(data.judgeError);
      setJudged(true);
      // Capability XP — weight on the user's OWN argument quality (not on
      // beating the philosopher). A strong case (≥15/25 → perf ≥ 0.5)
      // earns the 2× bump; a weak one earns 1×.
      const perf = data.judge ? scoreToPerformance(sumScores(data.judge.user_scores)) : 0;
      emitFeatureEvent('spar', `Daily Spar vs ${philosopherName}`, 1 + Math.round(perf));
    } catch (e) {
      setError(e instanceof Error ? e.message : t('argdiary.err_generic', locale));
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setOpening('');
    setClosing('');
    setPhilosopherTurn(null);
    setJudged(false);
    setJudge(null);
    setJudgeError(undefined);
    setError(null);
  }

  // Reached the daily limit and haven't started a spar: show a friendly
  // "come back tomorrow" panel. (Once started, the closing turn must
  // stay reachable even at the cap.)
  if (reachedLimit && !started && !judged) {
    return (
      <div
        style={{
          padding: '18px 22px',
          background: 'var(--color-acc-soft)',
          border: '3px solid var(--color-acc-deep)',
          boxShadow: '3px 3px 0 0 var(--color-acc)',
        }}
      >
        <div
          style={{
            fontFamily: pixel,
            fontSize: 10,
            color: 'var(--color-acc-deep)',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            marginBottom: 8,
          }}
        >
          {t('spar.cap_reached', locale)}
        </div>
        <p
          style={{
            fontFamily: serif,
            fontSize: 15.5,
            color: 'var(--color-ink)',
            lineHeight: 1.6,
            margin: '0 0 10px',
          }}
        >
          {t('spar.cap_body_prefix', locale, { n: SPAR_DAILY_LIMIT })}
          <Link
            href="/arena"
            style={{
              color: 'var(--color-acc-deep)',
              textDecoration: 'underline',
              textDecorationColor: 'var(--color-acc)',
            }}
          >
            {t('spar.the_arena', locale)}
          </Link>
          {t('spar.cap_body_suffix', locale)}
        </p>
      </div>
    );
  }

  // Final state — the full exchange + the judge's outcome.
  if (judged) {
    return (
      <SparResult
        userTurn={opening.trim()}
        philosopherTurn={philosopherTurn ?? ''}
        closingTurn={closing.trim()}
        philosopherDisplay={philosopherDisplay}
        judge={judge}
        judgeError={judgeError}
        locale={locale}
        onAgain={reset}
        reachedLimit={reachedLimit}
      />
    );
  }

  // Phase 3 — the rebuttal is in; collect the user's closing turn.
  if (started) {
    return (
      <div className="space-y-4">
        <TurnCard speaker={t('spar.you', locale)} content={opening.trim()} accent="#2F5D5C" />
        <TurnCard speaker={philosopherDisplay} content={philosopherTurn ?? ''} accent="#8C3717" />

        <div
          style={{
            padding: '12px 16px',
            background: '#FBF6E8',
            borderLeft: '4px solid var(--color-acc)',
            fontFamily: serif,
            fontSize: 14,
            color: 'var(--color-ink-soft)',
            lineHeight: 1.6,
          }}
        >
          {t('spar.rebuttal_intro', locale)}
        </div>

        <div>
          <label
            htmlFor="spar-closing"
            style={{
              display: 'block',
              fontFamily: pixel,
              fontSize: 10,
              color: 'var(--color-acc-deep)',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              marginBottom: 8,
            }}
          >
            {t('spar.closing_label', locale, { n: SPAR_MAX_USER_CHARS })}
          </label>
          <textarea
            id="spar-closing"
            value={closing}
            onChange={(e) => setClosing(e.target.value)}
            rows={7}
            disabled={submitting}
            placeholder={t('spar.closing_placeholder', locale)}
            style={{
              width: '100%',
              padding: '12px 14px',
              background: '#FFFCF4',
              border: '3px solid var(--color-ink)',
              boxShadow: '3px 3px 0 0 var(--color-acc)',
              fontFamily: serif,
              fontSize: 15.5,
              lineHeight: 1.55,
              color: 'var(--color-ink)',
              resize: 'vertical',
              minHeight: 130,
              borderRadius: 0,
            }}
          />
          <div
            style={{
              marginTop: 6,
              fontFamily: pixel,
              fontSize: 10,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: closingOver ? '#8C3717' : 'var(--color-acc-deep)',
            }}
          >
            {closing.length} / {SPAR_MAX_USER_CHARS}
          </div>
        </div>

        {error && <ErrorNote message={error} />}

        <button
          type="button"
          onClick={submitClosing}
          disabled={submitting || !closing.trim() || closingOver}
          style={primaryBtnStyle(submitting || !closing.trim() || closingOver)}
        >
          {submitting ? t('spar.judging', locale) : t('spar.closing_btn', locale)}
        </button>
      </div>
    );
  }

  // Phase 1 — the opening textarea + submit.
  return (
    <div>
      <div
        style={{
          padding: '14px 16px',
          background: '#FBF6E8',
          borderLeft: '4px solid var(--color-acc)',
          marginBottom: 14,
          fontFamily: serif,
          fontSize: 14,
          color: 'var(--color-ink-soft)',
          lineHeight: 1.6,
        }}
      >
        <strong style={{ color: 'var(--color-ink)' }}>{t('spar.context_label', locale)}</strong>{' '}
        {topicPrimer}
      </div>

      <label
        htmlFor="spar-turn"
        style={{
          display: 'block',
          fontFamily: pixel,
          fontSize: 10,
          color: 'var(--color-acc-deep)',
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          marginBottom: 8,
        }}
      >
        {t('spar.your_turn', locale, { n: SPAR_MAX_USER_CHARS })}
      </label>
      <textarea
        id="spar-turn"
        value={opening}
        onChange={(e) => setOpening(e.target.value)}
        rows={8}
        disabled={submitting}
        placeholder={t('spar.placeholder', locale)}
        style={{
          width: '100%',
          padding: '12px 14px',
          background: '#FFFCF4',
          border: '3px solid var(--color-ink)',
          boxShadow: '3px 3px 0 0 var(--color-acc)',
          fontFamily: serif,
          fontSize: 15.5,
          lineHeight: 1.55,
          color: 'var(--color-ink)',
          resize: 'vertical',
          minHeight: 140,
          borderRadius: 0,
        }}
      />
      <div
        style={{
          marginTop: 6,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          fontFamily: pixel,
          fontSize: 10,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: openingOver ? '#8C3717' : 'var(--color-acc-deep)',
        }}
      >
        <span>
          {opening.length} / {SPAR_MAX_USER_CHARS}
        </span>
        <span>
          {t('spar.spars_left', locale, {
            n: SPAR_DAILY_LIMIT - playsToday,
            total: SPAR_DAILY_LIMIT,
          })}
        </span>
      </div>

      {error && <ErrorNote message={error} />}

      <button
        type="button"
        onClick={submitOpening}
        disabled={submitting || !opening.trim() || openingOver}
        style={{ ...primaryBtnStyle(submitting || !opening.trim() || openingOver), marginTop: 16 }}
      >
        {submitting
          ? t('spar.thinking', locale, { name: philosopherDisplay })
          : t('spar.spar_btn', locale)}
      </button>
    </div>
  );
}

// ─── Shared bits ─────────────────────────────────────────────────

function primaryBtnStyle(disabled: boolean): React.CSSProperties {
  return {
    width: '100%',
    padding: '14px 20px',
    background: disabled ? 'var(--color-line)' : '#F8C75E',
    color: disabled ? 'var(--color-acc-deep)' : '#1A1820',
    border: '3px solid var(--color-ink)',
    boxShadow: disabled ? 'none' : '4px 4px 0 0 #2F5D5C',
    fontFamily: pixel,
    fontSize: 12,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    cursor: disabled ? 'default' : 'pointer',
    transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end)',
  };
}

function ErrorNote({ message }: { message: string }) {
  return (
    <div
      style={{
        marginTop: 14,
        padding: '10px 14px',
        background: '#FEE9E0',
        borderLeft: '4px solid #8C3717',
        color: '#8C3717',
        fontFamily: serif,
        fontSize: 14,
      }}
    >
      {message}
    </div>
  );
}

// ─── Result panel ────────────────────────────────────────────────

function SparResult({
  userTurn,
  philosopherTurn,
  closingTurn,
  philosopherDisplay,
  judge,
  judgeError,
  locale,
  onAgain,
  reachedLimit,
}: {
  userTurn: string;
  philosopherTurn: string;
  closingTurn: string;
  philosopherDisplay: string;
  judge: JudgeOutput | null;
  judgeError?: string;
  locale: Locale;
  onAgain: () => void;
  reachedLimit: boolean;
}) {
  return (
    <div className="space-y-4">
      <TurnCard speaker={t('spar.you', locale)} content={userTurn} accent="#2F5D5C" />
      <TurnCard speaker={philosopherDisplay} content={philosopherTurn} accent="#8C3717" />
      <TurnCard speaker={t('spar.you', locale)} content={closingTurn} accent="#2F5D5C" />
      {judge ? (
        <JudgeOutcome judge={judge} philosopherDisplay={philosopherDisplay} locale={locale} />
      ) : judgeError ? (
        <div
          style={{
            padding: '14px 18px',
            background: '#FEE9E0',
            borderLeft: '4px solid #8C3717',
            fontFamily: serif,
            fontSize: 14,
            color: '#8C3717',
          }}
        >
          {t('spar.judge_unavailable', locale)}
        </div>
      ) : null}
      {!reachedLimit && (
        <button
          type="button"
          onClick={onAgain}
          style={{
            width: '100%',
            padding: '12px 18px',
            background: 'transparent',
            color: 'var(--color-ink-soft)',
            border: '2px solid var(--color-acc-deep)',
            fontFamily: pixel,
            fontSize: 11,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          {t('spar.spar_again', locale)}
        </button>
      )}
      <p
        style={{
          marginTop: 12,
          fontFamily: serif,
          fontSize: 14,
          color: 'var(--color-acc-deep)',
          lineHeight: 1.55,
          fontStyle: 'italic',
        }}
      >
        {t('spar.refreshes', locale)}
      </p>
    </div>
  );
}

function TurnCard({
  speaker,
  content,
  accent,
}: {
  speaker: string;
  content: string;
  accent: string;
}) {
  return (
    <div
      style={{
        border: '3px solid var(--color-ink)',
        background: '#FFFCF4',
        boxShadow: `3px 3px 0 0 ${accent}`,
      }}
    >
      <div
        style={{
          padding: '8px 12px',
          background: 'var(--color-ink)',
          color: 'var(--color-acc-soft)',
          fontFamily: pixel,
          fontSize: 10,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
        }}
      >
        ▶ {speaker}
      </div>
      <div
        style={{
          padding: '14px 18px',
          fontFamily: serif,
          fontSize: 15.5,
          lineHeight: 1.65,
          color: 'var(--color-ink)',
          whiteSpace: 'pre-wrap',
        }}
      >
        {content}
      </div>
    </div>
  );
}

function JudgeOutcome({
  judge,
  philosopherDisplay,
  locale,
}: {
  judge: JudgeOutput;
  philosopherDisplay: string;
  locale: Locale;
}) {
  const outcome = resolveOutcome(judge);
  const assessment = resolveAssessment(judge);
  const userTotal = sumScores(judge.user_scores);

  const outcomeLabel =
    outcome === 'common_ground'
      ? t('arena.outcome.common_ground', locale)
      : outcome === 'talked_past'
        ? t('arena.outcome.talked_past', locale)
        : t('arena.outcome.distinct', locale);
  // Common ground reads warm (teal); talked-past reads cautionary
  // (rust); distinct positions stays neutral gold. None of these is a
  // "win" colour — there is no winner.
  const outcomeColor =
    outcome === 'common_ground' ? '#7FB7A6' : outcome === 'talked_past' ? '#E0A07F' : '#F8C75E';

  // The kindred line bolds just the philosopher's name; split the
  // localized template on {name} so word order stays correct per locale.
  const [kindredBefore, kindredAfter] = t('spar.kindred_body', locale).split('{name}');

  return (
    <div
      style={{
        border: '4px solid var(--color-ink)',
        background: '#1A1612',
        color: 'var(--color-acc-soft)',
        boxShadow: '5px 5px 0 0 var(--color-acc)',
      }}
    >
      <div
        style={{
          padding: '12px 16px',
          background: 'var(--color-ink)',
          color: '#F8C75E',
          fontFamily: pixel,
          fontSize: 11,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
        }}
      >
        {t('spar.outcome_header', locale)}
      </div>
      <div style={{ padding: '18px 20px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            flexWrap: 'wrap',
            gap: 8,
            marginBottom: 14,
          }}
        >
          <span
            style={{
              fontFamily: pixel,
              fontSize: 18,
              color: outcomeColor,
              letterSpacing: '0.16em',
            }}
          >
            {outcomeLabel}
          </span>
          <span
            style={{
              fontFamily: pixel,
              fontSize: 11,
              color: 'var(--color-acc)',
              letterSpacing: '0.16em',
            }}
          >
            {t('spar.your_score', locale, { score: userTotal })}
          </span>
        </div>
        <p
          style={{
            fontFamily: serif,
            fontStyle: 'italic',
            fontSize: 15.5,
            color: '#E5DCC0',
            lineHeight: 1.65,
            margin: '0 0 14px',
          }}
        >
          {assessment}
        </p>
        <div style={{ marginBottom: 8 }}>
          <SaveToAnthology
            text={assessment}
            source="spar"
            attribution={t('spar.verdict_attribution', locale, { name: philosopherDisplay })}
            locale={locale}
          />
        </div>

        {judge.common_ground && (
          <div
            style={{
              marginTop: 10,
              padding: '10px 12px',
              background: '#22302A',
              border: '2px solid #2F5D5C',
            }}
          >
            <div
              style={{
                fontFamily: pixel,
                fontSize: 9,
                letterSpacing: '0.22em',
                color: '#7FB7A6',
                textTransform: 'uppercase',
                marginBottom: 6,
              }}
            >
              {t('spar.common_ground_header', locale)}
            </div>
            <div
              style={{
                fontFamily: serif,
                fontSize: 15,
                color: 'var(--color-acc-soft)',
                lineHeight: 1.6,
              }}
            >
              {judge.common_ground}
            </div>
          </div>
        )}

        <div
          style={{
            marginTop: 10,
            padding: '10px 12px',
            background: '#26201A',
            border: '2px solid #3F3528',
          }}
        >
          <div
            style={{
              fontFamily: pixel,
              fontSize: 9,
              letterSpacing: '0.22em',
              color: 'var(--color-acc)',
              textTransform: 'uppercase',
              marginBottom: 6,
            }}
          >
            {t('spar.kindred_header', locale)}
          </div>
          <div
            style={{
              fontFamily: serif,
              fontSize: 15,
              color: 'var(--color-acc-soft)',
            }}
          >
            {kindredBefore}
            <strong>{judge.user_kindred_philosopher}</strong>
            {kindredAfter}
          </div>
        </div>
      </div>
    </div>
  );
}

function sumScores(s: Record<string, number>): number {
  return Object.values(s).reduce((a, b) => a + b, 0);
}
