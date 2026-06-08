"use client";

// SparClient — the user-facing form for the Daily Spar.
//
// Three states:
//   1. "compose" — textarea for the user's one turn
//   2. "submitting" — loader while the philosopher turn + judge run
//   3. "result" — the philosopher's response + judge verdict
//
// Daily limit (v1, client-side): 3 spars per day tracked in
// localStorage. Hits the cap → form is replaced with a "come back
// tomorrow" notice + link to /arena.

import { useEffect, useState } from "react";
import Link from "next/link";
import { SPAR_DAILY_LIMIT, SPAR_LIMIT_KEY, SPAR_MAX_USER_CHARS } from "@/lib/spar";
import type { JudgeOutput } from "@/lib/arena/judge";
import { emitFeatureEvent } from "@/lib/capabilities";
import SaveToAnthology from "@/components/save-to-anthology";
import { t, type Locale } from "@/lib/translations";

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";
const serif = "var(--font-editorial), Georgia, serif";

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

type ResultState = {
  philosopherTurn: string;
  judge: JudgeOutput | null;
  judgeError?: string;
  userTurn: string;
};

export default function SparClient({
  philosopherName,
  philosopherDisplay,
  topicSlug,
  topicPrimer,
  dateKey,
  locale,
}: Props) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ResultState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [playsToday, setPlaysToday] = useState<number>(0);

  // Load today's play count from localStorage.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SPAR_LIMIT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { dateKey?: string; count?: number };
        if (parsed.dateKey === dateKey && typeof parsed.count === "number") {
          setPlaysToday(parsed.count);
        }
      }
    } catch {
      // ignore
    }
  }, [dateKey]);

  const reachedLimit = playsToday >= SPAR_DAILY_LIMIT;
  const chars = text.length;
  const overLimit = chars > SPAR_MAX_USER_CHARS;

  async function submit() {
    if (submitting || !text.trim() || overLimit || reachedLimit) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/spar/play", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          philosopherName,
          topicSlug,
          userTurn: text.trim(),
          locale,
        }),
      });
      if (!res.ok) {
        const errBody = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(
          errBody.error || t("argdiary.err_request", locale, { status: res.status }),
        );
      }
      const data = (await res.json()) as {
        philosopherTurn: string;
        judge: JudgeOutput | null;
        judgeError?: string;
      };
      setResult({
        philosopherTurn: data.philosopherTurn,
        judge: data.judge,
        judgeError: data.judgeError,
        userTurn: text.trim(),
      });
      // Capability event — bigger XP if the user won the verdict.
      const won = data.judge?.verdict === "user";
      emitFeatureEvent(
        "spar",
        `Daily Spar vs ${philosopherName}${won ? " · won" : ""}`,
        won ? 2 : 1,
      );
      // Increment today's play count.
      const nextCount = playsToday + 1;
      setPlaysToday(nextCount);
      try {
        window.localStorage.setItem(
          SPAR_LIMIT_KEY,
          JSON.stringify({ dateKey, count: nextCount }),
        );
      } catch {
        // ignore
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t("argdiary.err_generic", locale));
    } finally {
      setSubmitting(false);
    }
  }

  // Reached the daily limit and haven't played the current attempt:
  // show a friendly "come back tomorrow" panel.
  if (reachedLimit && !result) {
    return (
      <div
        style={{
          padding: "18px 22px",
          background: "var(--color-acc-soft)",
          border: "3px solid var(--color-acc-deep)",
          boxShadow: "3px 3px 0 0 var(--color-acc)",
        }}
      >
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
          {t("spar.cap_reached", locale)}
        </div>
        <p
          style={{
            fontFamily: serif,
            fontSize: 15.5,
            color: "var(--color-ink)",
            lineHeight: 1.6,
            margin: "0 0 10px",
          }}
        >
          {t("spar.cap_body_prefix", locale, { n: SPAR_DAILY_LIMIT })}
          <Link
            href="/arena"
            style={{
              color: "var(--color-acc-deep)",
              textDecoration: "underline",
              textDecorationColor: "var(--color-acc)",
            }}
          >
            {t("spar.the_arena", locale)}
          </Link>
          {t("spar.cap_body_suffix", locale)}
        </p>
      </div>
    );
  }

  // Render the result if we have it.
  if (result) {
    return (
      <SparResult
        userTurn={result.userTurn}
        philosopherTurn={result.philosopherTurn}
        philosopherDisplay={philosopherDisplay}
        judge={result.judge}
        judgeError={result.judgeError}
        locale={locale}
        onAgain={() => {
          setResult(null);
          setText("");
        }}
        reachedLimit={reachedLimit}
      />
    );
  }

  // Compose state — the textarea + submit.
  return (
    <div>
      <div
        style={{
          padding: "14px 16px",
          background: "#FBF6E8",
          borderLeft: "4px solid var(--color-acc)",
          marginBottom: 14,
          fontFamily: serif,
          fontSize: 14,
          color: "var(--color-ink-soft)",
          lineHeight: 1.6,
        }}
      >
        <strong style={{ color: "var(--color-ink)" }}>{t("spar.context_label", locale)}</strong>{" "}
        {topicPrimer}
      </div>

      <label
        htmlFor="spar-turn"
        style={{
          display: "block",
          fontFamily: pixel,
          fontSize: 10,
          color: "var(--color-acc-deep)",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        {t("spar.your_turn", locale, { n: SPAR_MAX_USER_CHARS })}
      </label>
      <textarea
        id="spar-turn"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={8}
        disabled={submitting}
        placeholder={t("spar.placeholder", locale)}
        style={{
          width: "100%",
          padding: "12px 14px",
          background: "#FFFCF4",
          border: "3px solid var(--color-ink)",
          boxShadow: "3px 3px 0 0 var(--color-acc)",
          fontFamily: serif,
          fontSize: 15.5,
          lineHeight: 1.55,
          color: "var(--color-ink)",
          resize: "vertical",
          minHeight: 140,
          borderRadius: 0,
        }}
      />
      <div
        style={{
          marginTop: 6,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          fontFamily: pixel,
          fontSize: 10,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: overLimit ? "#8C3717" : "var(--color-acc-deep)",
        }}
      >
        <span>
          {chars} / {SPAR_MAX_USER_CHARS}
        </span>
        <span>
          {t("spar.spars_left", locale, {
            n: SPAR_DAILY_LIMIT - playsToday,
            total: SPAR_DAILY_LIMIT,
          })}
        </span>
      </div>

      {error && (
        <div
          style={{
            marginTop: 14,
            padding: "10px 14px",
            background: "#FEE9E0",
            borderLeft: "4px solid #8C3717",
            color: "#8C3717",
            fontFamily: serif,
            fontSize: 14,
          }}
        >
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={submitting || !text.trim() || overLimit}
        style={{
          marginTop: 16,
          width: "100%",
          padding: "14px 20px",
          background: submitting || !text.trim() || overLimit ? "var(--color-line)" : "#F8C75E",
          color: submitting || !text.trim() || overLimit ? "var(--color-acc-deep)" : "#1A1820",
          border: "3px solid var(--color-ink)",
          boxShadow: submitting || !text.trim() || overLimit ? "none" : "4px 4px 0 0 #2F5D5C",
          fontFamily: pixel,
          fontSize: 12,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          cursor: submitting || !text.trim() || overLimit ? "default" : "pointer",
          transition: "transform 80ms steps(2, end), box-shadow 80ms steps(2, end)",
        }}
      >
        {submitting ? t("spar.judging", locale) : t("spar.spar_btn", locale)}
      </button>
    </div>
  );
}

// ─── Result panel ────────────────────────────────────────────────

function SparResult({
  userTurn,
  philosopherTurn,
  philosopherDisplay,
  judge,
  judgeError,
  locale,
  onAgain,
  reachedLimit,
}: {
  userTurn: string;
  philosopherTurn: string;
  philosopherDisplay: string;
  judge: JudgeOutput | null;
  judgeError?: string;
  locale: Locale;
  onAgain: () => void;
  reachedLimit: boolean;
}) {
  return (
    <div className="space-y-4">
      <TurnCard speaker={t("spar.you", locale)} content={userTurn} accent="#2F5D5C" />
      <TurnCard
        speaker={philosopherDisplay}
        content={philosopherTurn}
        accent="#8C3717"
      />
      {judge ? (
        <JudgeVerdict judge={judge} philosopherDisplay={philosopherDisplay} locale={locale} />
      ) : judgeError ? (
        <div
          style={{
            padding: "14px 18px",
            background: "#FEE9E0",
            borderLeft: "4px solid #8C3717",
            fontFamily: serif,
            fontSize: 14,
            color: "#8C3717",
          }}
        >
          {t("spar.judge_unavailable", locale)}
        </div>
      ) : null}
      {!reachedLimit && (
        <button
          type="button"
          onClick={onAgain}
          style={{
            width: "100%",
            padding: "12px 18px",
            background: "transparent",
            color: "var(--color-ink-soft)",
            border: "2px solid var(--color-acc-deep)",
            fontFamily: pixel,
            fontSize: 11,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          {t("spar.spar_again", locale)}
        </button>
      )}
      <p
        style={{
          marginTop: 12,
          fontFamily: serif,
          fontSize: 14,
          color: "var(--color-acc-deep)",
          lineHeight: 1.55,
          fontStyle: "italic",
        }}
      >
        {t("spar.refreshes", locale)}
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
        border: "3px solid var(--color-ink)",
        background: "#FFFCF4",
        boxShadow: `3px 3px 0 0 ${accent}`,
      }}
    >
      <div
        style={{
          padding: "8px 12px",
          background: "var(--color-ink)",
          color: "var(--color-acc-soft)",
          fontFamily: pixel,
          fontSize: 10,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
        }}
      >
        ▶ {speaker}
      </div>
      <div
        style={{
          padding: "14px 18px",
          fontFamily: serif,
          fontSize: 15.5,
          lineHeight: 1.65,
          color: "var(--color-ink)",
          whiteSpace: "pre-wrap",
        }}
      >
        {content}
      </div>
    </div>
  );
}

function JudgeVerdict({
  judge,
  philosopherDisplay,
  locale,
}: {
  judge: JudgeOutput;
  philosopherDisplay: string;
  locale: Locale;
}) {
  const userTotal = sumScores(judge.user_scores);
  const oppTotal = sumScores(judge.opponent_scores);
  const verdictLabel =
    judge.verdict === "user"
      ? t("spar.you_win", locale)
      : judge.verdict === "opponent"
        ? t("spar.opp_wins", locale, { name: philosopherDisplay.toUpperCase() })
        : t("spar.draw", locale);
  // The kindred line bolds just the philosopher's name; split the
  // localized template on {name} so word order stays correct per locale.
  const [kindredBefore, kindredAfter] = t("spar.kindred_body", locale).split("{name}");
  const verdictColor =
    judge.verdict === "user" ? "#2F5D5C" : judge.verdict === "opponent" ? "#8C3717" : "var(--color-acc-deep)";

  return (
    <div
      style={{
        border: "4px solid var(--color-ink)",
        background: "#1A1612",
        color: "var(--color-acc-soft)",
        boxShadow: "5px 5px 0 0 var(--color-acc)",
      }}
    >
      <div
        style={{
          padding: "12px 16px",
          background: "var(--color-ink)",
          color: "#F8C75E",
          fontFamily: pixel,
          fontSize: 11,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
        }}
      >
        {t("spar.verdict", locale)}
      </div>
      <div
        style={{
          padding: "18px 20px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 14,
          }}
        >
          <span
            style={{
              fontFamily: pixel,
              fontSize: 18,
              color: verdictColor === "var(--color-acc-deep)" ? "#F8C75E" : verdictColor,
              letterSpacing: "0.16em",
            }}
          >
            {verdictLabel}
          </span>
          <span
            style={{
              fontFamily: pixel,
              fontSize: 12,
              color: "var(--color-acc)",
              letterSpacing: "0.18em",
            }}
          >
            {userTotal} — {oppTotal}
          </span>
        </div>
        <p
          style={{
            fontFamily: serif,
            fontStyle: "italic",
            fontSize: 15.5,
            color: "#E5DCC0",
            lineHeight: 1.65,
            margin: "0 0 14px",
          }}
        >
          {judge.verdict_reasoning}
        </p>
        <div style={{ marginBottom: 8 }}>
          <SaveToAnthology
            text={judge.verdict_reasoning}
            source="spar"
            attribution={t("spar.verdict_attribution", locale, { name: philosopherDisplay })}
            locale={locale}
          />
        </div>
        <div
          style={{
            marginTop: 10,
            padding: "10px 12px",
            background: "#26201A",
            border: "2px solid #3F3528",
          }}
        >
          <div
            style={{
              fontFamily: pixel,
              fontSize: 9,
              letterSpacing: "0.22em",
              color: "var(--color-acc)",
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            {t("spar.kindred_header", locale)}
          </div>
          <div
            style={{
              fontFamily: serif,
              fontSize: 15,
              color: "var(--color-acc-soft)",
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
