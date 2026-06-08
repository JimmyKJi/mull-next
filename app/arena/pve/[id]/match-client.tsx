"use client";

// MatchClient — active debate session UI.
//
// Renders the transcript so far, lets the user submit their next
// turn, displays the philosopher's rebuttal, and (once enough turns
// have happened) offers a "Call the verdict" button that triggers
// /api/arena/judge.
//
// Post-verdict: renders the verdict panel inline (no separate page),
// with per-criterion scores, justifications, the kindred philosopher,
// and the Elo delta.

import { useState } from "react";
import Link from "next/link";
import type { JudgeOutput } from "@/lib/arena/judge";
import { SupportMullPrompt } from "@/components/support-mull-prompt";
import { t, type Locale } from "@/lib/translations";

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";
const serif = "var(--font-prose)";

type Turn = { turn_order: number; speaker: "user" | "opponent"; content: string };

type Props = {
  sessionId: string;
  opponentName: string;
  opponentElo: number;
  topicTitle: string;
  topicPrompt: string;
  topicPrimer: string;
  userElo: number;
  initialTurns: Turn[];
  initialJudge: JudgeOutput | null;
  initialEloDelta: number | null;
  initialStatus: "active" | "judged" | "abandoned";
  initialVerdict: "user" | "opponent" | "draw" | null;
  locale: Locale;
};

export default function MatchClient(props: Props) {
  const [turns, setTurns] = useState<Turn[]>(props.initialTurns);
  const [judge, setJudge] = useState<JudgeOutput | null>(props.initialJudge);
  const [eloDelta, setEloDelta] = useState<number | null>(props.initialEloDelta);
  const [userEloAfter, setUserEloAfter] = useState<number | null>(
    props.initialEloDelta !== null ? props.userElo + props.initialEloDelta : null,
  );
  const [status, setStatus] = useState(props.initialStatus);
  const [input, setInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [judging, setJudging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userTurns = turns.filter((t) => t.speaker === "user").length;
  const canSubmit =
    status === "active" &&
    (turns.length === 0 || turns[turns.length - 1].speaker === "opponent") &&
    input.trim().length >= 20;
  const canCallVerdict =
    status === "active" &&
    userTurns >= 2 &&
    turns[turns.length - 1]?.speaker === "opponent";

  async function submit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/arena/turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: props.sessionId,
          content: input.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error ?? t("arena.err_submit", props.locale));
        setSubmitting(false);
        return;
      }
      setTurns((prev) => [
        ...prev,
        { ...json.user_turn, speaker: "user" },
        { ...json.opponent_turn, speaker: "opponent" },
      ]);
      setInput("");
      setSubmitting(false);
    } catch {
      setError(t("arena.err_network", props.locale));
      setSubmitting(false);
    }
  }

  async function callJudge() {
    if (!canCallVerdict || judging) return;
    setJudging(true);
    setError(null);
    try {
      const res = await fetch("/api/arena/judge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: props.sessionId }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error ?? t("arena.err_judge", props.locale));
        setJudging(false);
        return;
      }
      setJudge(json.judge_output);
      setEloDelta(json.elo_delta);
      setUserEloAfter(json.user_elo_after);
      setStatus("judged");
      setJudging(false);
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    } catch {
      setError(t("arena.err_network", props.locale));
      setJudging(false);
    }
  }

  return (
    <div>
      {/* Header — topic + opponent */}
      <header style={headerWrap}>
        <div
          style={{
            fontFamily: pixel,
            fontSize: 10,
            color: "var(--color-acc-deep)",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          {t("arena.match_header", props.locale, {
            myElo: props.userElo,
            opp: props.opponentName.toUpperCase(),
            oppElo: props.opponentElo,
          })}
        </div>
        <h1
          style={{
            fontFamily: serif,
            fontSize: 24,
            fontWeight: 500,
            color: "var(--color-ink)",
            lineHeight: 1.3,
            margin: "0 0 10px",
          }}
        >
          {props.topicTitle}
        </h1>
        <p
          style={{
            fontFamily: serif,
            fontStyle: "italic",
            fontSize: 16,
            color: "var(--color-ink-soft)",
            margin: "0 0 12px",
            lineHeight: 1.5,
          }}
        >
          {props.topicPrompt}
        </p>
        <details>
          <summary
            style={{
              fontFamily: pixel,
              fontSize: 10,
              color: "var(--color-acc-deep)",
              letterSpacing: 0.4,
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            {t("arena.match_context", props.locale)}
          </summary>
          <p
            style={{
              fontFamily: serif,
              fontSize: 14,
              color: "var(--color-ink-soft)",
              margin: "10px 0 0",
              lineHeight: 1.6,
            }}
          >
            {props.topicPrimer}
          </p>
        </details>
      </header>

      {/* Transcript */}
      <section style={{ marginBottom: 20 }}>
        {turns.map((turn) => (
          <TurnBubble
            key={turn.turn_order}
            speaker={turn.speaker}
            opponentName={props.opponentName}
            content={turn.content}
            locale={props.locale}
          />
        ))}
      </section>

      {/* Active: composer */}
      {status === "active" && !judge && (
        <>
          <div
            style={{
              fontFamily: pixel,
              fontSize: 10,
              color: "var(--color-acc-deep)",
              letterSpacing: 0.4,
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            {t("arena.match_your_turn", props.locale)}
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("arena.match_placeholder", props.locale)}
            maxLength={2000}
            rows={6}
            style={{
              width: "100%",
              padding: 14,
              fontFamily: serif,
              fontSize: 16,
              lineHeight: 1.55,
              border: "3px solid var(--color-ink)",
              background: "#FFFCF4",
              color: "var(--color-ink)",
              resize: "vertical",
              minHeight: 140,
            }}
            disabled={submitting}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              marginTop: 10,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontFamily: pixel,
                fontSize: 10,
                color: "var(--color-acc-deep)",
                letterSpacing: 0.4,
                textTransform: "uppercase",
              }}
            >
              {input.length} / 2000
            </span>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {canCallVerdict && (
                <button
                  type="button"
                  onClick={callJudge}
                  disabled={judging}
                  style={btnGhost}
                >
                  {judging ? t("arena.match_judging", props.locale) : t("arena.match_call_verdict", props.locale)}
                </button>
              )}
              <button
                type="button"
                onClick={submit}
                disabled={!canSubmit || submitting}
                style={canSubmit ? btnPrimary : btnDisabled}
              >
                {submitting ? t("arena.match_thinking", props.locale) : t("arena.match_submit", props.locale)}
              </button>
            </div>
          </div>
          {error && (
            <p
              style={{
                marginTop: 12,
                padding: "10px 14px",
                background: "#F5E0E0",
                border: "2px solid #7A2E2E",
                fontFamily: serif,
                fontSize: 14,
                color: "#4D1818",
              }}
            >
              {error}
            </p>
          )}
        </>
      )}

      {/* Verdict */}
      {judge && eloDelta !== null && userEloAfter !== null && (
        <VerdictPanel
          judge={judge}
          eloDelta={eloDelta}
          userEloBefore={props.userElo}
          userEloAfter={userEloAfter}
          opponentName={props.opponentName}
          locale={props.locale}
        />
      )}
    </div>
  );
}

// ─── Turn bubble ─────────────────────────────────────────────────

function TurnBubble({
  speaker,
  opponentName,
  content,
  locale,
}: {
  speaker: "user" | "opponent";
  opponentName: string;
  content: string;
  locale: Locale;
}) {
  const isUser = speaker === "user";
  return (
    <div style={{ marginBottom: 12 }}>
      <div
        style={{
          fontFamily: pixel,
          fontSize: 10,
          color: isUser ? "#2F5D5C" : "var(--color-acc-deep)",
          letterSpacing: 0.4,
          textTransform: "uppercase",
          marginBottom: 4,
          textAlign: isUser ? "right" : "left",
        }}
      >
        {isUser ? t("arena.you", locale) : opponentName}
      </div>
      <div
        style={{
          padding: "14px 18px",
          background: isUser ? "#E5F0EE" : "#FFFCF4",
          border: "3px solid var(--color-ink)",
          boxShadow: isUser
            ? "3px 3px 0 0 #2F5D5C"
            : "3px 3px 0 0 var(--color-acc)",
          fontFamily: serif,
          fontSize: 16,
          color: "var(--color-ink)",
          lineHeight: 1.6,
          whiteSpace: "pre-wrap",
        }}
      >
        {content}
      </div>
    </div>
  );
}

// ─── Verdict ─────────────────────────────────────────────────────

function VerdictPanel({
  judge,
  eloDelta,
  userEloBefore,
  userEloAfter,
  opponentName,
  locale,
}: {
  judge: JudgeOutput;
  eloDelta: number;
  userEloBefore: number;
  userEloAfter: number;
  opponentName: string;
  locale: Locale;
}) {
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

  const verdictColor =
    judge.verdict === "user"
      ? "#2F5D5C"
      : judge.verdict === "opponent"
        ? "#7A2E2E"
        : "var(--color-acc-deep)";
  const verdictLabel =
    judge.verdict === "user"
      ? t("arena.match_you_won", locale)
      : judge.verdict === "opponent"
        ? t("arena.match_opp_won", locale, { name: opponentName.toUpperCase() })
        : t("arena.match_draw", locale);

  return (
    <div style={{ marginTop: 28 }}>
      {/* Verdict banner */}
      <div
        style={{
          padding: "20px 24px",
          background: "#FFFCF4",
          border: `5px solid ${verdictColor}`,
          boxShadow: `6px 6px 0 0 ${verdictColor}`,
          marginBottom: 18,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: pixel,
            fontSize: 11,
            color: "var(--color-acc-deep)",
            letterSpacing: 0.4,
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          {t("spar.verdict", locale)}
        </div>
        <div
          style={{
            fontFamily: pixel,
            fontSize: 22,
            color: verdictColor,
            letterSpacing: "0.06em",
            marginBottom: 8,
            textShadow: "2px 2px 0 rgba(0,0,0,0.08)",
          }}
        >
          {verdictLabel}
        </div>
        <div
          style={{
            fontFamily: serif,
            fontSize: 15,
            color: "var(--color-ink)",
            marginBottom: 12,
          }}
        >
          {t("arena.match_scoreline", locale, {
            my: userTotal,
            opp: opponentName,
            their: oppTotal,
          })}
        </div>
        <div
          style={{
            fontFamily: pixel,
            fontSize: 14,
            color: eloDelta >= 0 ? "#2F5D5C" : "#7A2E2E",
            letterSpacing: 0.5,
          }}
        >
          ELO {userEloBefore} → {userEloAfter} ({eloDelta >= 0 ? "+" : ""}
          {eloDelta})
        </div>
      </div>

      {/* Verdict reasoning */}
      <div
        style={{
          padding: "16px 20px",
          background: "#1F1814",
          border: "3px solid var(--color-acc)",
          marginBottom: 18,
        }}
      >
        <div
          style={{
            fontFamily: pixel,
            fontSize: 10,
            color: "var(--color-acc)",
            letterSpacing: 0.4,
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          {t("arena.match_reasoning", locale)}
        </div>
        <p
          style={{
            fontFamily: serif,
            fontSize: 16,
            color: "var(--color-acc-soft)",
            margin: 0,
            lineHeight: 1.65,
          }}
        >
          {judge.verdict_reasoning}
        </p>
      </div>

      {/* Per-criterion breakdown */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          marginBottom: 18,
        }}
      >
        <ScoreColumn
          label={t("arena.you", locale).toUpperCase()}
          color="#2F5D5C"
          scores={judge.user_scores}
          justifications={judge.user_justifications}
          total={userTotal}
          locale={locale}
        />
        <ScoreColumn
          label={opponentName.toUpperCase()}
          color="#8C6520"
          scores={judge.opponent_scores}
          justifications={judge.opponent_justifications}
          total={oppTotal}
          locale={locale}
        />
      </div>

      {/* Kindred philosopher — the one you most resembled */}
      <div
        style={{
          padding: "16px 20px",
          background: "var(--color-acc-soft)",
          border: "3px solid var(--color-acc)",
          marginBottom: 22,
        }}
      >
        <div
          style={{
            fontFamily: pixel,
            fontSize: 10,
            color: "var(--color-acc-deep)",
            letterSpacing: 0.4,
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          {t("arena.match_kin_header", locale)}
        </div>
        <p
          style={{
            fontFamily: serif,
            fontSize: 16,
            color: "var(--color-ink)",
            margin: 0,
            lineHeight: 1.55,
          }}
        >
          {t("arena.match_kin_body", locale, {
            name: judge.user_kindred_philosopher,
          })}
        </p>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Link
          href="/arena/pve"
          style={{
            display: "inline-block",
            padding: "12px 18px",
            background: "#F8C75E",
            color: "#1A1820",
            border: "3px solid var(--color-ink)",
            boxShadow: "3px 3px 0 0 #2F5D5C",
            fontFamily: pixel,
            fontSize: 12,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            textDecoration: "none",
          }}
        >
          {t("arena.match_face_another", locale)}
        </Link>
        <Link
          href="/arena/leaderboard"
          style={{
            display: "inline-block",
            padding: "12px 18px",
            background: "transparent",
            color: "var(--color-ink-soft)",
            border: "2px solid var(--color-acc-deep)",
            fontFamily: pixel,
            fontSize: 11,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            textDecoration: "none",
          }}
        >
          {t("arena.match_leaderboard", locale)}
        </Link>
      </div>

      <SupportMullPrompt
        lead={t("arena.support_lead", locale)}
        detail={t("arena.support_detail", locale)}
      />
    </div>
  );
}

function ScoreColumn({
  label,
  color,
  scores,
  justifications,
  total,
  locale,
}: {
  label: string;
  color: string;
  scores: JudgeOutput["user_scores"];
  justifications: JudgeOutput["user_justifications"];
  total: number;
  locale: Locale;
}) {
  const rows: { key: keyof typeof scores; labelKey: string }[] = [
    { key: "validity", labelKey: "arena.crit.validity" },
    { key: "premises", labelKey: "arena.crit.premises" },
    { key: "rigor", labelKey: "arena.crit.rigor" },
    { key: "elegance", labelKey: "arena.crit.elegance" },
    { key: "engagement", labelKey: "arena.crit.engagement" },
  ];
  return (
    <div
      style={{
        padding: "14px 16px",
        background: "#FFFCF4",
        border: "3px solid var(--color-ink)",
        boxShadow: `3px 3px 0 0 ${color}`,
      }}
    >
      <div
        style={{
          fontFamily: pixel,
          fontSize: 11,
          color,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          marginBottom: 10,
          textAlign: "center",
        }}
      >
        {label} · {total}/25
      </div>
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "grid",
          gap: 10,
        }}
      >
        {rows.map((r) => (
          <li key={r.key}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontFamily: pixel,
                fontSize: 10,
                color: "var(--color-ink)",
                letterSpacing: 0.4,
                textTransform: "uppercase",
                marginBottom: 3,
              }}
            >
              <span>{t(r.labelKey, locale)}</span>
              <span style={{ color }}>{scores[r.key]}/5</span>
            </div>
            <p
              style={{
                fontFamily: serif,
                fontSize: 13,
                color: "var(--color-ink-soft)",
                fontStyle: "italic",
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              {justifications[r.key]}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Shared style snippets ───────────────────────────────────────

const headerWrap: React.CSSProperties = {
  padding: "16px 18px",
  background: "#FFFCF4",
  border: "4px solid var(--color-ink)",
  boxShadow: "5px 5px 0 0 var(--color-acc)",
  marginBottom: 18,
};

const btnPrimary: React.CSSProperties = {
  padding: "12px 18px",
  background: "#F8C75E",
  color: "#1A1820",
  border: "3px solid var(--color-ink)",
  boxShadow: "3px 3px 0 0 #2F5D5C",
  fontFamily: pixel,
  fontSize: 12,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  cursor: "pointer",
};

const btnDisabled: React.CSSProperties = {
  ...btnPrimary,
  background: "var(--color-line)",
  cursor: "not-allowed",
  boxShadow: "none",
};

const btnGhost: React.CSSProperties = {
  padding: "12px 18px",
  background: "transparent",
  color: "var(--color-ink-soft)",
  border: "2px solid var(--color-acc-deep)",
  fontFamily: pixel,
  fontSize: 11,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  cursor: "pointer",
};
