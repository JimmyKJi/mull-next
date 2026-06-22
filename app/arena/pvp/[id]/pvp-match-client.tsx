'use client';

// PvP match client. Adapted from the PvE client but:
//   - Different "whose turn" logic (based on iAmChallenger + last
//     turn's speaker, vs PvE's "after opponent reply"-only)
//   - "Accept and respond" CTA when status='pending_opponent' and
//     viewer isn't the challenger
//   - "Waiting for opponent to accept" state for challenger of
//     unaccepted challenges
//   - "Waiting on opponent's reply" state when it's not your turn
//     in an active match
//   - Either party can call the verdict once both have played ≥2 turns

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { resolveOutcome, resolveAssessment, type JudgeOutput } from '@/lib/arena/judge';
import { SupportMullPrompt } from '@/components/support-mull-prompt';
import { t, type Locale } from '@/lib/translations';

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";
const serif = 'var(--font-prose)';

type Turn = { turn_order: number; speaker: 'user' | 'opponent'; content: string };

type Props = {
  sessionId: string;
  locale: Locale;
  status: 'pending_opponent' | 'active' | 'judged' | 'abandoned';
  topicTitle: string;
  topicPrompt: string;
  topicPrimer: string;
  iAmChallenger: boolean;
  iAmOpponent: boolean;
  challengerLabel: string;
  opponentLabel: string;
  challengerElo: number;
  opponentElo: number;
  initialTurns: Turn[];
  initialJudge: JudgeOutput | null;
  initialEloDelta: number | null;
};

export default function PvpMatchClient(props: Props) {
  const router = useRouter();
  const [turns, setTurns] = useState<Turn[]>(props.initialTurns);
  const [status, setStatus] = useState(props.status);
  const [judge, setJudge] = useState<JudgeOutput | null>(props.initialJudge);
  const [eloDelta, setEloDelta] = useState<number | null>(props.initialEloDelta);
  const [userEloAfter, setUserEloAfter] = useState<number | null>(null);
  const [input, setInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [judging, setJudging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const locale = props.locale;
  const mySpeaker: 'user' | 'opponent' = props.iAmChallenger ? 'user' : 'opponent';
  const otherLabel = props.iAmChallenger ? props.opponentLabel : props.challengerLabel;

  const lastTurn = turns[turns.length - 1];
  const myTurn =
    status === 'active' && (lastTurn ? lastTurn.speaker !== mySpeaker : props.iAmChallenger);

  const userCount = turns.filter((t) => t.speaker === 'user').length;
  const oppCount = turns.filter((t) => t.speaker === 'opponent').length;
  const canCallVerdict = status === 'active' && userCount >= 2 && oppCount >= 2;

  async function accept() {
    if (accepting) return;
    setAccepting(true);
    setError(null);
    try {
      const res = await fetch('/api/arena/pvp/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: props.sessionId }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error ?? t('arena.err_accept', locale));
        setAccepting(false);
        return;
      }
      setStatus('active');
      setAccepting(false);
      router.refresh(); // re-load server-side fields like opponent_user_id
    } catch {
      setError(t('arena.err_network', locale));
      setAccepting(false);
    }
  }

  async function submit() {
    if (input.trim().length < 20 || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/arena/turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: props.sessionId,
          content: input.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error ?? t('arena.err_submit', locale));
        setSubmitting(false);
        return;
      }
      setTurns((prev) => [
        ...prev,
        {
          turn_order: json.my_turn.turn_order,
          speaker: json.my_turn.speaker,
          content: json.my_turn.content,
        },
      ]);
      setInput('');
      setSubmitting(false);
    } catch {
      setError(t('arena.err_network', locale));
      setSubmitting(false);
    }
  }

  async function callJudge() {
    if (!canCallVerdict || judging) return;
    setJudging(true);
    setError(null);
    try {
      const res = await fetch('/api/arena/judge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: props.sessionId }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error ?? t('arena.err_judge', locale));
        setJudging(false);
        return;
      }
      setJudge(json.judge_output);
      setEloDelta(json.elo_delta);
      setUserEloAfter(json.user_elo_after);
      setStatus('judged');
      setJudging(false);
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    } catch {
      setError(t('arena.err_network', locale));
      setJudging(false);
    }
  }

  return (
    <div>
      {/* Topic header */}
      <header style={headerWrap}>
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
          {status === 'pending_opponent'
            ? t('arena.pvp_match_header_open', locale, {
                a: props.challengerLabel.toUpperCase(),
                ae: props.challengerElo,
                b: t('arena.pvp_open_slot', locale),
              })
            : t('arena.pvp_match_header', locale, {
                a: props.challengerLabel.toUpperCase(),
                ae: props.challengerElo,
                b: props.opponentLabel.toUpperCase(),
                be: props.opponentElo,
              })}
        </div>
        <h1
          style={{
            fontFamily: serif,
            fontSize: 22,
            fontWeight: 500,
            color: 'var(--color-ink)',
            lineHeight: 1.3,
            margin: '0 0 8px',
          }}
        >
          {props.topicTitle}
        </h1>
        <p
          style={{
            fontFamily: serif,
            fontStyle: 'italic',
            fontSize: 15,
            color: 'var(--color-ink-soft)',
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          {props.topicPrompt}
        </p>
      </header>

      {/* Transcript */}
      <section style={{ marginBottom: 20 }}>
        {turns.map((turn) => (
          <TurnBubble
            key={turn.turn_order}
            mine={turn.speaker === mySpeaker}
            otherLabel={otherLabel}
            content={turn.content}
            locale={locale}
          />
        ))}
      </section>

      {/* State: pending opponent, viewer isn't challenger → can accept */}
      {status === 'pending_opponent' && !props.iAmChallenger && (
        <div
          style={{
            padding: '16px 20px',
            background: '#F8C75E',
            border: '3px solid var(--color-ink)',
            boxShadow: '4px 4px 0 0 #2F5D5C',
            marginBottom: 16,
          }}
        >
          <p
            style={{
              fontFamily: serif,
              fontSize: 16,
              color: '#1A1820',
              margin: '0 0 12px',
              lineHeight: 1.55,
            }}
          >
            {t('arena.pvp_accept_prompt', locale, { name: props.challengerLabel })}
          </p>
          <button type="button" onClick={accept} disabled={accepting} style={btnPrimary}>
            {accepting ? t('arena.pvp_accepting', locale) : t('arena.pvp_accept_cta', locale)}
          </button>
        </div>
      )}

      {/* State: pending opponent, viewer IS challenger → waiting */}
      {status === 'pending_opponent' && props.iAmChallenger && (
        <div
          style={{
            padding: '16px 20px',
            background: '#1F1814',
            border: '3px solid var(--color-acc)',
            marginBottom: 16,
          }}
        >
          <p
            style={{
              fontFamily: serif,
              fontStyle: 'italic',
              fontSize: 16,
              color: 'var(--color-acc-soft)',
              margin: 0,
              lineHeight: 1.55,
            }}
          >
            {t('arena.pvp_waiting_accept', locale)}
          </p>
        </div>
      )}

      {/* State: active, my turn → composer */}
      {status === 'active' && myTurn && !judge && (
        <>
          <div
            style={{
              fontFamily: pixel,
              fontSize: 10,
              color: '#7A2E2E',
              letterSpacing: 0.4,
              textTransform: 'uppercase',
              marginBottom: 8,
            }}
          >
            {t('arena.match_your_turn', locale)}
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('arena.pvp_turn_placeholder', locale, { name: otherLabel })}
            maxLength={2000}
            rows={6}
            style={{
              width: '100%',
              padding: 14,
              fontFamily: serif,
              fontSize: 16,
              lineHeight: 1.55,
              border: '3px solid var(--color-ink)',
              background: '#FFFCF4',
              color: 'var(--color-ink)',
              resize: 'vertical',
              minHeight: 140,
            }}
            disabled={submitting}
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 10,
              marginTop: 10,
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                fontFamily: pixel,
                fontSize: 10,
                color: 'var(--color-acc-deep)',
                letterSpacing: 0.4,
                textTransform: 'uppercase',
              }}
            >
              {input.length} / 2000
            </span>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {canCallVerdict && (
                <button type="button" onClick={callJudge} disabled={judging} style={btnGhost}>
                  {judging
                    ? t('arena.match_judging', locale)
                    : t('arena.match_call_verdict', locale)}
                </button>
              )}
              <button
                type="button"
                onClick={submit}
                disabled={input.trim().length < 20 || submitting}
                style={input.trim().length >= 20 ? btnPrimary : btnDisabled}
              >
                {submitting ? t('arena.pvp_submitting', locale) : t('arena.match_submit', locale)}
              </button>
            </div>
          </div>
        </>
      )}

      {/* State: active, waiting on other player */}
      {status === 'active' && !myTurn && !judge && (
        <div
          style={{
            padding: '16px 20px',
            background: '#1F1814',
            border: '3px solid var(--color-acc)',
            marginBottom: 16,
          }}
        >
          <p
            style={{
              fontFamily: serif,
              fontStyle: 'italic',
              fontSize: 16,
              color: 'var(--color-acc-soft)',
              margin: '0 0 12px',
              lineHeight: 1.55,
            }}
          >
            {t('arena.pvp_waiting_turn', locale, { name: otherLabel })}
          </p>
          {canCallVerdict && (
            <button type="button" onClick={callJudge} disabled={judging} style={btnPrimary}>
              {judging ? t('arena.match_judging', locale) : t('arena.pvp_call_verdict_now', locale)}
            </button>
          )}
        </div>
      )}

      {error && (
        <p
          style={{
            marginTop: 12,
            padding: '10px 14px',
            background: '#F5E0E0',
            border: '2px solid #7A2E2E',
            fontFamily: serif,
            fontSize: 14,
            color: '#4D1818',
          }}
        >
          {error}
        </p>
      )}

      {/* Verdict */}
      {judge && eloDelta !== null && (
        <VerdictPanel
          judge={judge}
          eloDelta={eloDelta}
          userEloAfter={userEloAfter}
          iAmChallenger={props.iAmChallenger}
          opponentLabel={otherLabel}
          locale={locale}
        />
      )}
    </div>
  );
}

// ─── Turn bubble ─────────────────────────────────────────────────

function TurnBubble({
  mine,
  otherLabel,
  content,
  locale,
}: {
  mine: boolean;
  otherLabel: string;
  content: string;
  locale: Locale;
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div
        style={{
          fontFamily: pixel,
          fontSize: 10,
          color: mine ? '#2F5D5C' : 'var(--color-acc-deep)',
          letterSpacing: 0.4,
          textTransform: 'uppercase',
          marginBottom: 4,
          textAlign: mine ? 'right' : 'left',
        }}
      >
        {mine ? t('arena.you', locale) : otherLabel}
      </div>
      <div
        style={{
          padding: '14px 18px',
          background: mine ? '#E5F0EE' : '#FFFCF4',
          border: '3px solid var(--color-ink)',
          boxShadow: mine ? '3px 3px 0 0 #2F5D5C' : '3px 3px 0 0 var(--color-acc)',
          fontFamily: serif,
          fontSize: 16,
          color: 'var(--color-ink)',
          lineHeight: 1.6,
          whiteSpace: 'pre-wrap',
        }}
      >
        {content}
      </div>
    </div>
  );
}

// ─── Verdict (re-uses PvE pattern) ───────────────────────────────

function VerdictPanel({
  judge,
  eloDelta,
  userEloAfter,
  iAmChallenger,
  opponentLabel,
  locale,
}: {
  judge: JudgeOutput;
  eloDelta: number;
  userEloAfter: number | null;
  iAmChallenger: boolean;
  opponentLabel: string;
  locale: Locale;
}) {
  // No winner. The judge reports the SHAPE of the exchange; each player
  // is scored on their OWN argument. "user_scores" is always the
  // challenger's side — flip for an opponent viewer so "my score" is
  // really theirs.
  const outcome = resolveOutcome(judge);
  const assessment = resolveAssessment(judge);

  const userTotal =
    judge.user_scores.validity +
    judge.user_scores.premises +
    judge.user_scores.rigor +
    judge.user_scores.elegance +
    judge.user_scores.engagement;
  const oppTotal =
    judge.opponent_scores.validity +
    judge.opponent_scores.premises +
    judge.opponent_scores.rigor +
    judge.opponent_scores.elegance +
    judge.opponent_scores.engagement;

  const outcomeColor =
    outcome === 'common_ground'
      ? '#2F5D5C'
      : outcome === 'talked_past'
        ? '#7A2E2E'
        : 'var(--color-acc-deep)';
  const outcomeLabel =
    outcome === 'common_ground'
      ? t('arena.outcome.common_ground', locale)
      : outcome === 'talked_past'
        ? t('arena.outcome.talked_past', locale)
        : t('arena.outcome.distinct', locale);

  // Display "my score" and "their score" — for the OPPONENT viewer,
  // the judge's "user_scores" is the CHALLENGER's, so we flip labels.
  const myScore = iAmChallenger ? userTotal : oppTotal;
  const theirScore = iAmChallenger ? oppTotal : userTotal;

  return (
    <div style={{ marginTop: 28 }}>
      <div
        style={{
          padding: '20px 24px',
          background: '#FFFCF4',
          border: `5px solid ${outcomeColor}`,
          boxShadow: `6px 6px 0 0 ${outcomeColor}`,
          marginBottom: 18,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontFamily: pixel,
            fontSize: 11,
            color: 'var(--color-acc-deep)',
            letterSpacing: 0.4,
            textTransform: 'uppercase',
            marginBottom: 6,
          }}
        >
          {t('arena.outcome_header', locale)}
        </div>
        <div
          style={{
            fontFamily: pixel,
            fontSize: 22,
            color: outcomeColor,
            letterSpacing: '0.06em',
            marginBottom: 8,
            textShadow: '2px 2px 0 rgba(0,0,0,0.08)',
          }}
        >
          {outcomeLabel}
        </div>
        <div
          style={{
            fontFamily: serif,
            fontSize: 15,
            color: 'var(--color-ink)',
            marginBottom: 4,
          }}
        >
          {t('arena.your_score_line', locale, { score: myScore })}
        </div>
        <div
          style={{
            fontFamily: serif,
            fontSize: 13,
            color: 'var(--color-ink-soft)',
            marginBottom: 12,
          }}
        >
          {t('arena.opp_score_line', locale, { name: opponentLabel, score: theirScore })}
        </div>
        {userEloAfter !== null && (
          <div
            style={{
              fontFamily: pixel,
              fontSize: 14,
              color: eloDelta >= 0 ? '#2F5D5C' : '#7A2E2E',
              letterSpacing: 0.5,
            }}
          >
            {t('arena.pvp_elo_line', locale, {
              before: userEloAfter - eloDelta,
              after: userEloAfter,
              delta: `${eloDelta >= 0 ? '+' : ''}${eloDelta}`,
            })}
          </div>
        )}
      </div>

      <div
        style={{
          padding: '16px 20px',
          background: '#1F1814',
          border: '3px solid var(--color-acc)',
          marginBottom: 18,
        }}
      >
        <div
          style={{
            fontFamily: pixel,
            fontSize: 10,
            color: 'var(--color-acc)',
            letterSpacing: 0.4,
            textTransform: 'uppercase',
            marginBottom: 8,
          }}
        >
          {t('arena.assessment_header', locale)}
        </div>
        <p
          style={{
            fontFamily: serif,
            fontSize: 16,
            color: 'var(--color-acc-soft)',
            margin: 0,
            lineHeight: 1.65,
          }}
        >
          {assessment}
        </p>
      </div>

      {judge.common_ground && (
        <div
          style={{
            padding: '16px 20px',
            background: '#E5F0EE',
            border: '3px solid #2F5D5C',
            marginBottom: 18,
          }}
        >
          <div
            style={{
              fontFamily: pixel,
              fontSize: 10,
              color: '#2F5D5C',
              letterSpacing: 0.4,
              textTransform: 'uppercase',
              marginBottom: 8,
            }}
          >
            {t('arena.common_ground_header', locale)}
          </div>
          <p
            style={{
              fontFamily: serif,
              fontSize: 16,
              color: 'var(--color-ink)',
              margin: 0,
              lineHeight: 1.65,
            }}
          >
            {judge.common_ground}
          </p>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Link
          href="/arena/pvp"
          style={{
            display: 'inline-block',
            padding: '12px 18px',
            background: '#F8C75E',
            color: '#1A1820',
            border: '3px solid var(--color-ink)',
            boxShadow: '3px 3px 0 0 #2F5D5C',
            fontFamily: pixel,
            fontSize: 12,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            textDecoration: 'none',
          }}
        >
          {t('arena.pvp_next_match', locale)}
        </Link>
      </div>

      <SupportMullPrompt
        lead={t('arena.support_lead', locale)}
        detail={t('arena.support_detail', locale)}
      />
    </div>
  );
}

// ─── Shared style snippets ───────────────────────────────────────

const headerWrap: React.CSSProperties = {
  padding: '16px 18px',
  background: '#FFFCF4',
  border: '4px solid var(--color-ink)',
  boxShadow: '5px 5px 0 0 var(--color-acc)',
  marginBottom: 18,
};

const btnPrimary: React.CSSProperties = {
  padding: '12px 18px',
  background: '#F8C75E',
  color: '#1A1820',
  border: '3px solid var(--color-ink)',
  boxShadow: '3px 3px 0 0 #2F5D5C',
  fontFamily: pixel,
  fontSize: 12,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  cursor: 'pointer',
};

const btnDisabled: React.CSSProperties = {
  ...btnPrimary,
  background: 'var(--color-line)',
  cursor: 'not-allowed',
  boxShadow: 'none',
};

const btnGhost: React.CSSProperties = {
  padding: '12px 18px',
  background: 'transparent',
  color: 'var(--color-ink-soft)',
  border: '2px solid var(--color-acc-deep)',
  fontFamily: pixel,
  fontSize: 11,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  cursor: 'pointer',
};
