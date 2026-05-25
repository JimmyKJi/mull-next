"use client";

// PilgrimageLanding — the client-side state machine on /pilgrimage.
//
// Resolves enrollment state from localStorage. Falls back to a stashed
// pending quiz attempt (mull.pending_quiz_attempt) for anonymous users
// who took the quiz before signing up.
//
// States:
//   - loading: pre-hydration
//   - need-quiz: no quiz result anywhere — prompt to take it
//   - ready: not enrolled but has quiz — show enrollment CTA
//   - enrolled: show progress + today's day link

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  PILGRIMAGE_KEY,
  getPilgrimageArc,
  getEnrollmentMessage,
  type PilgrimageState,
} from "@/lib/pilgrimage";
import type { DimKey } from "@/lib/dimensions";
import { ARCHETYPE_COLORS } from "@/lib/archetype-colors";

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";
const serif = "var(--font-editorial), Georgia, serif";

const PENDING_QUIZ_KEY = "mull.pending_quiz_attempt";

type Props = {
  initialArchetype: string | null;
  initialFlavor: string | null;
};

type Phase =
  | { kind: "loading" }
  | { kind: "need-quiz" }
  | { kind: "ready"; archetype: string; flavor: DimKey | null }
  | { kind: "enrolled"; state: PilgrimageState };

export function PilgrimageLanding({
  initialArchetype,
  initialFlavor,
}: Props) {
  const [phase, setPhase] = useState<Phase>({ kind: "loading" });

  // Resolve initial state on hydration.
  useEffect(() => {
    // 1) If already enrolled, that wins.
    try {
      const raw = window.localStorage.getItem(PILGRIMAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PilgrimageState;
        if (
          parsed?.archetype &&
          typeof parsed.currentDay === "number" &&
          parsed.currentDay >= 1 &&
          parsed.currentDay <= 30
        ) {
          setPhase({ kind: "enrolled", state: parsed });
          return;
        }
      }
    } catch {
      // continue
    }

    // 2) Use the server's hint if present.
    if (initialArchetype) {
      setPhase({
        kind: "ready",
        archetype: initialArchetype,
        flavor: (initialFlavor as DimKey | null) ?? null,
      });
      return;
    }

    // 3) Fall back to a stashed pending quiz (anonymous users).
    try {
      const raw = window.localStorage.getItem(PENDING_QUIZ_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          archetype?: string;
          flavor?: string | null;
        };
        if (parsed.archetype) {
          const key = parsed.archetype
            .replace(/^The\s+/i, "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
          setPhase({
            kind: "ready",
            archetype: key,
            flavor: (parsed.flavor as DimKey | null) ?? null,
          });
          return;
        }
      }
    } catch {
      // continue
    }

    // 4) Nothing — needs the quiz.
    setPhase({ kind: "need-quiz" });
  }, [initialArchetype, initialFlavor]);

  function enroll(archetype: string, flavor: DimKey | null) {
    const state: PilgrimageState = {
      startedAt: new Date().toISOString(),
      archetype,
      flavor,
      currentDay: 1,
      completedDays: [],
    };
    try {
      window.localStorage.setItem(PILGRIMAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
    setPhase({ kind: "enrolled", state });
  }

  if (phase.kind === "loading") {
    return (
      <div
        className="text-center text-[14px] text-[#8C6520]"
        style={{ fontFamily: serif }}
      >
        Loading your pilgrimage…
      </div>
    );
  }

  if (phase.kind === "need-quiz") {
    return (
      <div
        className="border-[3px] border-[#221E18] bg-[#FFFCF4] p-6"
        style={{ boxShadow: "4px 4px 0 0 #B8862F" }}
      >
        <div
          className="text-[10px] tracking-[0.22em] text-[#8C6520]"
          style={{ fontFamily: pixel }}
        >
          ▶ NEED YOUR ARCHETYPE FIRST
        </div>
        <h2
          className="mt-3 text-[20px] leading-tight text-[#221E18]"
          style={{ fontFamily: serif }}
        >
          The pilgrimage is shaped around the kind of mind you turned
          out to be.
        </h2>
        <p
          className="mt-3 text-[15px] leading-[1.55] text-[#4A4338]"
          style={{ fontFamily: serif }}
        >
          Take the quiz first — five minutes, no signup. Once you have
          an archetype, this page will offer you a 30-day arc tuned to
          it.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/quiz/journey"
            className="border-[3px] border-[#221E18] bg-[#F8C75E] px-4 py-2 text-[11px] tracking-[0.18em] text-[#1A1820] hover:bg-[#B8862F]"
            style={{
              fontFamily: pixel,
              textTransform: "uppercase",
              boxShadow: "3px 3px 0 0 #2F5D5C",
            }}
          >
            ▶ TAKE THE INHERITOR (15 MIN)
          </Link>
          <Link
            href="/quiz?mode=quick"
            className="border-[3px] border-[#221E18] bg-[#FFFCF4] px-4 py-2 text-[11px] tracking-[0.18em] text-[#221E18] hover:bg-[#F8EDC8]"
            style={{ fontFamily: pixel, textTransform: "uppercase" }}
          >
            ◂ OR THE 5-MIN CLASSIC
          </Link>
        </div>
      </div>
    );
  }

  if (phase.kind === "ready") {
    const arc = getPilgrimageArc(phase.archetype);
    const welcome = getEnrollmentMessage(phase.archetype, phase.flavor);
    const color = ARCHETYPE_COLORS[phase.archetype] ?? ARCHETYPE_COLORS.cartographer;
    return (
      <div className="space-y-5">
        <div
          className="border-[4px] p-6"
          style={{
            background: color.soft,
            borderColor: color.deep,
            boxShadow: `5px 5px 0 0 ${color.deep}`,
          }}
        >
          <div
            className="text-[10px] tracking-[0.22em]"
            style={{
              fontFamily: pixel,
              color: color.deep,
              textTransform: "uppercase",
            }}
          >
            ▶ YOUR ARC · THE {phase.archetype.toUpperCase()}
          </div>
          <h2
            className="mt-3 text-[22px] leading-tight text-[#221E18]"
            style={{ fontFamily: serif }}
          >
            {arc.spirit}
          </h2>
          <p
            className="mt-4 text-[15.5px] leading-[1.65] text-[#221E18]"
            style={{ fontFamily: serif }}
          >
            {welcome}
          </p>
          <div className="mt-5 grid grid-cols-3 gap-2">
            {arc.phases.map((p, i) => (
              <div
                key={i}
                className="border-2 px-3 py-2 text-center"
                style={{
                  borderColor: color.deep,
                  background: "#FFFCF4",
                  fontFamily: pixel,
                  fontSize: 10,
                  letterSpacing: "0.16em",
                  color: color.deep,
                  textTransform: "uppercase",
                }}
              >
                <div className="opacity-60">DAYS {i * 10 + 1}–{(i + 1) * 10}</div>
                <div className="mt-1" style={{ fontFamily: serif, fontSize: 13, color: "#221E18", textTransform: "none", letterSpacing: 0 }}>
                  {p}
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => enroll(phase.archetype, phase.flavor)}
            className="mt-6 w-full border-[3px] border-[#221E18] px-4 py-3 text-[12px] tracking-[0.18em] text-[#1A1820] hover:opacity-90"
            style={{
              fontFamily: pixel,
              textTransform: "uppercase",
              background: "#F8C75E",
              boxShadow: "4px 4px 0 0 #2F5D5C",
            }}
          >
            ▶ BEGIN DAY 1
          </button>
        </div>
        <p
          className="text-center text-[13px] text-[#8C6520]"
          style={{ fontFamily: serif, fontStyle: "italic" }}
        >
          The pilgrimage is one prompt per day. You decide the pace —
          it&rsquo;ll wait. Not signed in? Your enrollment lives on
          this device until you create an account.
        </p>
      </div>
    );
  }

  // Enrolled.
  return <EnrolledView state={phase.state} />;
}

function EnrolledView({ state }: { state: PilgrimageState }) {
  const arc = getPilgrimageArc(state.archetype);
  const color = ARCHETYPE_COLORS[state.archetype] ?? ARCHETYPE_COLORS.cartographer;
  const today = arc.days[state.currentDay - 1];
  const completed = state.completedDays.length;
  const phase = state.currentDay <= 10 ? 0 : state.currentDay <= 20 ? 1 : 2;

  return (
    <div className="space-y-5">
      {/* Progress strip */}
      <div
        className="border-[3px] p-4"
        style={{
          borderColor: color.deep,
          background: color.soft,
          boxShadow: `3px 3px 0 0 ${color.deep}`,
        }}
      >
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <div
              className="text-[10px] tracking-[0.22em]"
              style={{ fontFamily: pixel, color: color.deep, textTransform: "uppercase" }}
            >
              ▶ THE {state.archetype.toUpperCase()} · ARC IN PROGRESS
            </div>
            <div
              className="mt-1 text-[18px] leading-tight text-[#221E18]"
              style={{ fontFamily: serif }}
            >
              {arc.phases[phase]} — Day {state.currentDay} of 30
            </div>
          </div>
          <div
            className="text-[10px] tracking-[0.18em]"
            style={{
              fontFamily: pixel,
              color: color.deep,
              textTransform: "uppercase",
            }}
          >
            {completed} / 30 COMPLETED
          </div>
        </div>
        {/* 30-segment progress bar */}
        <div className="mt-3 flex gap-[2px]">
          {Array.from({ length: 30 }, (_, i) => {
            const day = i + 1;
            const done = state.completedDays.includes(day);
            const isToday = day === state.currentDay;
            return (
              <div
                key={i}
                title={`Day ${day}${done ? " · done" : isToday ? " · today" : ""}`}
                style={{
                  flex: 1,
                  height: 10,
                  background: done
                    ? color.deep
                    : isToday
                      ? color.primary
                      : "#E2D8B6",
                  border: `1px solid ${isToday ? color.deep : "#D6CDB6"}`,
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Today's day card */}
      <Link
        href={`/pilgrimage/day/${state.currentDay}`}
        className="block border-[4px] p-5 transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5"
        style={{
          background: "#FFFCF4",
          borderColor: "#221E18",
          boxShadow: `5px 5px 0 0 ${color.deep}`,
        }}
      >
        <div
          className="text-[10px] tracking-[0.22em] text-[#8C6520]"
          style={{ fontFamily: pixel, textTransform: "uppercase" }}
        >
          ▶ TODAY · DAY {state.currentDay}
        </div>
        <h3
          className="mt-2 text-[22px] leading-tight text-[#221E18]"
          style={{ fontFamily: serif }}
        >
          {today.title}
        </h3>
        <p
          className="mt-3 text-[15px] leading-[1.55] text-[#4A4338]"
          style={{ fontFamily: serif }}
        >
          {today.framing}
        </p>
        <div
          className="mt-4 inline-block bg-[#F8C75E] px-3 py-1 text-[10px] tracking-[0.18em] text-[#1A1820]"
          style={{ fontFamily: pixel, textTransform: "uppercase" }}
        >
          ▶ OPEN TODAY&rsquo;S PROMPT
        </div>
      </Link>

      {/* Browse all days */}
      <details
        className="border-2 border-[#221E18] bg-[#FFFCF4] px-3 py-2"
        style={{ fontFamily: serif }}
      >
        <summary
          className="cursor-pointer text-[12px] text-[#8C6520]"
          style={{ fontFamily: pixel, letterSpacing: "0.18em", textTransform: "uppercase" }}
        >
          ▸ BROWSE ALL 30 DAYS
        </summary>
        <ol className="mt-3 grid grid-cols-1 gap-1 sm:grid-cols-2">
          {arc.days.map((d) => {
            const done = state.completedDays.includes(d.day);
            const isToday = d.day === state.currentDay;
            return (
              <li key={d.day}>
                <Link
                  href={`/pilgrimage/day/${d.day}`}
                  className="flex items-baseline gap-3 border-l-2 px-2 py-1.5 text-[13.5px] leading-tight hover:bg-[#F5EFDC]"
                  style={{
                    borderColor: done ? color.deep : isToday ? color.primary : "#D6CDB6",
                    color: "#221E18",
                  }}
                >
                  <span
                    className="text-[10px] tracking-[0.18em] text-[#8C6520]"
                    style={{ fontFamily: pixel, textTransform: "uppercase", minWidth: 30 }}
                  >
                    {done ? "✓" : "·"} {String(d.day).padStart(2, "0")}
                  </span>
                  <span>{d.title}</span>
                </Link>
              </li>
            );
          })}
        </ol>
      </details>
    </div>
  );
}
