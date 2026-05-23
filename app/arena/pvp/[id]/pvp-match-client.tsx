"use client";

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

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { JudgeOutput } from "@/lib/arena/judge";

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";
const serif = "'Cormorant Garamond', Georgia, serif";

type Turn = { turn_order: number; speaker: "user" | "opponent"; content: string };

type Props = {
  sessionId: string;
  status: "pending_opponent" | "active" | "judged" | "abandoned";
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
  const [input, setInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [judging, setJudging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mySpeaker: "user" | "opponent" = props.iAmChallenger ? "user" : "opponent";
  const myLabel = props.iAmChallenger ? "You" : "You";
  const otherLabel = props.iAmChallenger
    ? props.opponentLabel
    : props.challengerLabel;

  const lastTurn = turns[turns.length - 1];
  const myTurn =
    status === "active" &&
    (lastTurn ? lastTurn.speaker !== mySpeaker : props.iAmChallenger);

  const userCount = turns.filter((t) => t.speaker === "user").length;
  const oppCount = turns.filter((t) => t.speaker === "opponent").length;
  const canCallVerdict =
    status === "active" && userCount >= 2 && oppCount >= 2;

  async function accept() {
    if (accepting) return;
    setAccepting(true);
    setError(null);
    try {
      const res = await fetch("/api/arena/pvp/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: props.sessionId }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error ?? "Could not accept.");
        setAccepting(false);
        return;
      }
      setStatus("active");
      setAccepting(false);
      router.refresh(); // re-load server-side fields like opponent_user_id
    } catch {
      setError("Network error.");
      setAccepting(false);
    }
  }

  async function submit() {
    if (input.trim().length < 20 || submitting) return;
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
        setError(json?.error ?? "Could not submit.");
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
      setInput("");
      setSubmitting(false);
    } catch {
      setError("Network error.");
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
        setError(json?.error ?? "Judge failed.");
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
      setError("Network error.");
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
            color: "#8C6520",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          ▶ PVP · {props.challengerLabel.toUpperCase()} ({props.challengerElo}) VS{" "}
          {(status === "pending_opponent"
            ? "OPEN"
            : props.opponentLabel.toUpperCase()
          )}{" "}
          {status !== "pending_opponent" && `(${props.opponentElo})`}
        </div>
        <h1
          style={{
            fontFamily: serif,
            fontSize: 22,
            fontWeight: 500,
            color: "#221E18",
            lineHeight: 1.3,
            margin: "0 0 8px",
          }}
        >
          {props.topicTitle}
        </h1>
        <p
          style={{
            fontFamily: serif,
            fontStyle: "italic",
            fontSize: 15,
            color: "#4A4338",
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          {props.topicPrompt}
        </p>
      </header>

      {/* Transcript */}
      <section style={{ marginBottom: 20 }}>
        {turns.map((t) => (
          <TurnBubble
            key={t.turn_order}
            speaker={t.speaker}
            mine={t.speaker === mySpeaker}
            otherLabel={otherLabel}
            content={t.content}
          />
        ))}
      </section>

      {/* State: pending opponent, viewer isn't challenger → can accept */}
      {status === "pending_opponent" && !props.iAmChallenger && (
        <div
          style={{
            padding: "16px 20px",
            background: "#F8C75E",
            border: "3px solid #221E18",
            boxShadow: "4px 4px 0 0 #2F5D5C",
            marginBottom: 16,
          }}
        >
          <p
            style={{
              fontFamily: serif,
              fontSize: 16,
              color: "#1A1820",
              margin: "0 0 12px",
              lineHeight: 1.55,
            }}
          >
            This is an open challenge. Accept and write your response
            to {props.challengerLabel}'s opening turn above.
          </p>
          <button
            type="button"
            onClick={accept}
            disabled={accepting}
            style={btnPrimary}
          >
            {accepting ? "▸ ACCEPTING…" : "▶ ACCEPT CHALLENGE"}
          </button>
        </div>
      )}

      {/* State: pending opponent, viewer IS challenger → waiting */}
      {status === "pending_opponent" && props.iAmChallenger && (
        <div
          style={{
            padding: "16px 20px",
            background: "#1F1814",
            border: "3px solid #B8862F",
            marginBottom: 16,
          }}
        >
          <p
            style={{
              fontFamily: serif,
              fontStyle: "italic",
              fontSize: 16,
              color: "#F8EDC8",
              margin: 0,
              lineHeight: 1.55,
            }}
          >
            Waiting for an opponent to accept. Your challenge is
            visible on the PvP board. When someone accepts and writes
            their first turn, it'll be your turn next.
          </p>
        </div>
      )}

      {/* State: active, my turn → composer */}
      {status === "active" && myTurn && !judge && (
        <>
          <div
            style={{
              fontFamily: pixel,
              fontSize: 10,
              color: "#7A2E2E",
              letterSpacing: 0.4,
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            ▸ YOUR TURN
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Address ${otherLabel}'s last point directly. Min 20 chars.`}
            maxLength={2000}
            rows={6}
            style={{
              width: "100%",
              padding: 14,
              fontFamily: serif,
              fontSize: 16,
              lineHeight: 1.55,
              border: "3px solid #221E18",
              background: "#FFFCF4",
              color: "#221E18",
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
              gap: 10,
              marginTop: 10,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontFamily: pixel,
                fontSize: 10,
                color: "#8C6520",
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
                  {judging ? "▸ JUDGING…" : "▶ CALL THE VERDICT"}
                </button>
              )}
              <button
                type="button"
                onClick={submit}
                disabled={input.trim().length < 20 || submitting}
                style={input.trim().length >= 20 ? btnPrimary : btnDisabled}
              >
                {submitting ? "▸ SUBMITTING…" : "▶ SUBMIT TURN"}
              </button>
            </div>
          </div>
        </>
      )}

      {/* State: active, waiting on other player */}
      {status === "active" && !myTurn && !judge && (
        <div
          style={{
            padding: "16px 20px",
            background: "#1F1814",
            border: "3px solid #B8862F",
            marginBottom: 16,
          }}
        >
          <p
            style={{
              fontFamily: serif,
              fontStyle: "italic",
              fontSize: 16,
              color: "#F8EDC8",
              margin: "0 0 12px",
              lineHeight: 1.55,
            }}
          >
            Waiting on {otherLabel} to play their turn. Come back
            later — or call the verdict if you've both played enough.
          </p>
          {canCallVerdict && (
            <button
              type="button"
              onClick={callJudge}
              disabled={judging}
              style={btnPrimary}
            >
              {judging ? "▸ JUDGING…" : "▶ CALL THE VERDICT NOW"}
            </button>
          )}
        </div>
      )}

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

      {/* Verdict */}
      {judge && eloDelta !== null && (
        <VerdictPanel
          judge={judge}
          eloDelta={eloDelta}
          userEloAfter={userEloAfter}
          iAmChallenger={props.iAmChallenger}
          opponentLabel={otherLabel}
        />
      )}
    </div>
  );
}

// ─── Turn bubble ─────────────────────────────────────────────────

function TurnBubble({
  speaker,
  mine,
  otherLabel,
  content,
}: {
  speaker: "user" | "opponent";
  mine: boolean;
  otherLabel: string;
  content: string;
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div
        style={{
          fontFamily: pixel,
          fontSize: 10,
          color: mine ? "#2F5D5C" : "#8C6520",
          letterSpacing: 0.4,
          textTransform: "uppercase",
          marginBottom: 4,
          textAlign: mine ? "right" : "left",
        }}
      >
        {mine ? "You" : otherLabel}
      </div>
      <div
        style={{
          padding: "14px 18px",
          background: mine ? "#E5F0EE" : "#FFFCF4",
          border: "3px solid #221E18",
          boxShadow: mine
            ? "3px 3px 0 0 #2F5D5C"
            : "3px 3px 0 0 #B8862F",
          fontFamily: serif,
          fontSize: 16,
          color: "#221E18",
          lineHeight: 1.6,
          whiteSpace: "pre-wrap",
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
}: {
  judge: JudgeOutput;
  eloDelta: number;
  userEloAfter: number | null;
  iAmChallenger: boolean;
  opponentLabel: string;
}) {
  // The judge verdict is from the challenger's perspective ("user wins"
  // means challenger wins). Map that to whether the calling viewer won.
  const iWon =
    (judge.verdict === "user" && iAmChallenger) ||
    (judge.verdict === "opponent" && !iAmChallenger);
  const isDraw = judge.verdict === "draw";

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

  const verdictColor = iWon
    ? "#2F5D5C"
    : isDraw
      ? "#8C6520"
      : "#7A2E2E";
  const verdictLabel = iWon ? "YOU WON" : isDraw ? "DRAW" : `${opponentLabel.toUpperCase()} WON`;

  // Display "my score" vs "their score" — for the OPPONENT viewer,
  // the judge's "user_scores" is the CHALLENGER's, so we flip labels.
  const myScore = iAmChallenger ? userTotal : oppTotal;
  const theirScore = iAmChallenger ? oppTotal : userTotal;

  return (
    <div style={{ marginTop: 28 }}>
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
            color: "#8C6520",
            letterSpacing: 0.4,
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          ▶ VERDICT
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
            color: "#221E18",
            marginBottom: 12,
          }}
        >
          You {myScore} · {opponentLabel} {theirScore} (of 25)
        </div>
        {userEloAfter !== null && (
          <div
            style={{
              fontFamily: pixel,
              fontSize: 14,
              color: eloDelta >= 0 ? "#2F5D5C" : "#7A2E2E",
              letterSpacing: 0.5,
            }}
          >
            PVP ELO {userEloAfter - eloDelta} → {userEloAfter} ({eloDelta >= 0 ? "+" : ""}
            {eloDelta})
          </div>
        )}
      </div>

      <div
        style={{
          padding: "16px 20px",
          background: "#1F1814",
          border: "3px solid #B8862F",
          marginBottom: 18,
        }}
      >
        <div
          style={{
            fontFamily: pixel,
            fontSize: 10,
            color: "#B8862F",
            letterSpacing: 0.4,
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          ▸ JUDGE'S REASONING
        </div>
        <p
          style={{
            fontFamily: serif,
            fontSize: 16,
            color: "#F8EDC8",
            margin: 0,
            lineHeight: 1.65,
          }}
        >
          {judge.verdict_reasoning}
        </p>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Link
          href="/arena/pvp"
          style={{
            display: "inline-block",
            padding: "12px 18px",
            background: "#F8C75E",
            color: "#1A1820",
            border: "3px solid #221E18",
            boxShadow: "3px 3px 0 0 #2F5D5C",
            fontFamily: pixel,
            fontSize: 12,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            textDecoration: "none",
          }}
        >
          ▶ NEXT MATCH
        </Link>
      </div>
    </div>
  );
}

// ─── Shared style snippets ───────────────────────────────────────

const headerWrap: React.CSSProperties = {
  padding: "16px 18px",
  background: "#FFFCF4",
  border: "4px solid #221E18",
  boxShadow: "5px 5px 0 0 #B8862F",
  marginBottom: 18,
};

const btnPrimary: React.CSSProperties = {
  padding: "12px 18px",
  background: "#F8C75E",
  color: "#1A1820",
  border: "3px solid #221E18",
  boxShadow: "3px 3px 0 0 #2F5D5C",
  fontFamily: pixel,
  fontSize: 12,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  cursor: "pointer",
};

const btnDisabled: React.CSSProperties = {
  ...btnPrimary,
  background: "#D6CDB6",
  cursor: "not-allowed",
  boxShadow: "none",
};

const btnGhost: React.CSSProperties = {
  padding: "12px 18px",
  background: "transparent",
  color: "#4A4338",
  border: "2px solid #8C6520",
  fontFamily: pixel,
  fontSize: 11,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  cursor: "pointer",
};
