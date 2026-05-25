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

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";
const serif = "var(--font-editorial), Georgia, serif";

type Props = {
  philosopherName: string;
  topicSlug: string;
  topicPrimer: string;
  dateKey: string;
};

type ResultState = {
  philosopherTurn: string;
  judge: JudgeOutput | null;
  judgeError?: string;
  userTurn: string;
};

export default function SparClient({
  philosopherName,
  topicSlug,
  topicPrimer,
  dateKey,
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
        }),
      });
      if (!res.ok) {
        const errBody = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(errBody.error || `Request failed (${res.status}).`);
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
      setError(e instanceof Error ? e.message : "Something went wrong.");
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
          background: "#F8EDC8",
          border: "3px solid #8C6520",
          boxShadow: "3px 3px 0 0 #B8862F",
        }}
      >
        <div
          style={{
            fontFamily: pixel,
            fontSize: 10,
            color: "#8C6520",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          ▶ DAILY CAP REACHED
        </div>
        <p
          style={{
            fontFamily: serif,
            fontSize: 15.5,
            color: "#221E18",
            lineHeight: 1.6,
            margin: "0 0 10px",
          }}
        >
          You&rsquo;ve played {SPAR_DAILY_LIMIT} spars today. Come
          back tomorrow for a new challenge — or head to{" "}
          <Link
            href="/arena"
            style={{
              color: "#8C6520",
              textDecoration: "underline",
              textDecorationColor: "#B8862F",
            }}
          >
            the Arena
          </Link>{" "}
          for unlimited multi-turn debates.
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
        philosopherName={philosopherName}
        judge={result.judge}
        judgeError={result.judgeError}
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
          borderLeft: "4px solid #B8862F",
          marginBottom: 14,
          fontFamily: serif,
          fontSize: 14,
          color: "#4A4338",
          lineHeight: 1.6,
        }}
      >
        <strong style={{ color: "#221E18" }}>Context:</strong>{" "}
        {topicPrimer}
      </div>

      <label
        htmlFor="spar-turn"
        style={{
          display: "block",
          fontFamily: pixel,
          fontSize: 10,
          color: "#8C6520",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        ▶ YOUR TURN · {SPAR_MAX_USER_CHARS} CHARS MAX
      </label>
      <textarea
        id="spar-turn"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={8}
        disabled={submitting}
        placeholder="Make your strongest case. The philosopher will get one turn back. The judge will call it on argumentative quality, not stance."
        style={{
          width: "100%",
          padding: "12px 14px",
          background: "#FFFCF4",
          border: "3px solid #221E18",
          boxShadow: "3px 3px 0 0 #B8862F",
          fontFamily: serif,
          fontSize: 15.5,
          lineHeight: 1.55,
          color: "#221E18",
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
          color: overLimit ? "#8C3717" : "#8C6520",
        }}
      >
        <span>
          {chars} / {SPAR_MAX_USER_CHARS}
        </span>
        <span>
          {SPAR_DAILY_LIMIT - playsToday} of {SPAR_DAILY_LIMIT} spars left today
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
          background: submitting || !text.trim() || overLimit ? "#D6CDB6" : "#F8C75E",
          color: submitting || !text.trim() || overLimit ? "#8C6520" : "#1A1820",
          border: "3px solid #221E18",
          boxShadow: submitting || !text.trim() || overLimit ? "none" : "4px 4px 0 0 #2F5D5C",
          fontFamily: pixel,
          fontSize: 12,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          cursor: submitting || !text.trim() || overLimit ? "default" : "pointer",
          transition: "transform 80ms steps(2, end), box-shadow 80ms steps(2, end)",
        }}
      >
        {submitting ? "◷ JUDGING — 30 SECONDS" : "▶ SPAR"}
      </button>
    </div>
  );
}

// ─── Result panel ────────────────────────────────────────────────

function SparResult({
  userTurn,
  philosopherTurn,
  philosopherName,
  judge,
  judgeError,
  onAgain,
  reachedLimit,
}: {
  userTurn: string;
  philosopherTurn: string;
  philosopherName: string;
  judge: JudgeOutput | null;
  judgeError?: string;
  onAgain: () => void;
  reachedLimit: boolean;
}) {
  return (
    <div className="space-y-4">
      <TurnCard speaker="YOU" content={userTurn} accent="#2F5D5C" />
      <TurnCard
        speaker={philosopherName.toUpperCase()}
        content={philosopherTurn}
        accent="#8C3717"
      />
      {judge ? (
        <JudgeVerdict judge={judge} philosopherName={philosopherName} />
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
          {judgeError}
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
            color: "#4A4338",
            border: "2px solid #8C6520",
            fontFamily: pixel,
            fontSize: 11,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          ▶ SPAR AGAIN (SAME OPPONENT, TODAY)
        </button>
      )}
      <p
        style={{
          marginTop: 12,
          fontFamily: serif,
          fontSize: 14,
          color: "#8C6520",
          lineHeight: 1.55,
          fontStyle: "italic",
        }}
      >
        Tomorrow&rsquo;s spar refreshes at midnight UTC.
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
        border: "3px solid #221E18",
        background: "#FFFCF4",
        boxShadow: `3px 3px 0 0 ${accent}`,
      }}
    >
      <div
        style={{
          padding: "8px 12px",
          background: "#221E18",
          color: "#F8EDC8",
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
          color: "#221E18",
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
  philosopherName,
}: {
  judge: JudgeOutput;
  philosopherName: string;
}) {
  const userTotal = sumScores(judge.user_scores);
  const oppTotal = sumScores(judge.opponent_scores);
  const verdictLabel =
    judge.verdict === "user"
      ? "YOU WIN"
      : judge.verdict === "opponent"
        ? `${philosopherName.toUpperCase()} WINS`
        : "DRAW";
  const verdictColor =
    judge.verdict === "user" ? "#2F5D5C" : judge.verdict === "opponent" ? "#8C3717" : "#8C6520";

  return (
    <div
      style={{
        border: "4px solid #221E18",
        background: "#1A1612",
        color: "#F8EDC8",
        boxShadow: "5px 5px 0 0 #B8862F",
      }}
    >
      <div
        style={{
          padding: "12px 16px",
          background: "#221E18",
          color: "#F8C75E",
          fontFamily: pixel,
          fontSize: 11,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
        }}
      >
        ▶ VERDICT
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
              color: verdictColor === "#8C6520" ? "#F8C75E" : verdictColor,
              letterSpacing: "0.16em",
            }}
          >
            {verdictLabel}
          </span>
          <span
            style={{
              fontFamily: pixel,
              fontSize: 12,
              color: "#B8862F",
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
            attribution={`Verdict on ${philosopherName} spar`}
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
              color: "#B8862F",
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            ▶ KINDRED THIS DEBATE
          </div>
          <div
            style={{
              fontFamily: serif,
              fontSize: 15,
              color: "#F8EDC8",
            }}
          >
            Your argumentative style most resembled{" "}
            <strong>{judge.user_kindred_philosopher}</strong> in this spar.
          </div>
        </div>
      </div>
    </div>
  );
}

function sumScores(s: Record<string, number>): number {
  return Object.values(s).reduce((a, b) => a + b, 0);
}
