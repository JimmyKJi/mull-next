"use client";

// PilgrimageStatusCard — slim status block for /account.
//
// Reads pilgrimage enrollment from localStorage. Three render modes:
//   - loading: nothing (avoid flash)
//   - not enrolled: a small "Begin your pilgrimage" CTA card
//   - enrolled: Day X of 30 + the day's title + a CTA to today's prompt

import Link from "next/link";
import { useEffect, useState } from "react";
import { PILGRIMAGE_KEY, getPilgrimageArc, type PilgrimageState } from "@/lib/pilgrimage";
import { ARCHETYPE_COLORS } from "@/lib/archetype-colors";

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";
const serif = "var(--font-editorial), Georgia, serif";

export default function PilgrimageStatusCard() {
  const [state, setState] = useState<PilgrimageState | null | "loading">("loading");

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(PILGRIMAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PilgrimageState;
        setState(parsed);
      } else {
        setState(null);
      }
    } catch {
      setState(null);
    }
  }, []);

  if (state === "loading") return null;

  if (state === null) {
    // Not enrolled — a small invitation card.
    return (
      <div
        style={{
          padding: "14px 18px",
          background: "#FFFCF4",
          border: "3px solid #221E18",
          boxShadow: "3px 3px 0 0 #B8862F",
          marginBottom: 18,
        }}
      >
        <div
          style={{
            fontFamily: pixel,
            fontSize: 10,
            color: "#8C6520",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          ▶ THE PILGRIMAGE · 30 DAYS · ARCHETYPE-PERSONALIZED
        </div>
        <p
          style={{
            fontFamily: serif,
            fontSize: 14.5,
            color: "#221E18",
            lineHeight: 1.55,
            margin: "0 0 10px",
          }}
        >
          A 30-day arc tuned to your archetype. One prompt per day,
          slow drift across the month, real momentum. Different from
          the daily dilemma — this one has a curve.
        </p>
        <Link
          href="/pilgrimage"
          style={{
            display: "inline-block",
            padding: "6px 12px",
            background: "#F8C75E",
            color: "#1A1820",
            border: "2px solid #221E18",
            fontFamily: pixel,
            fontSize: 10,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            textDecoration: "none",
          }}
        >
          ▶ BEGIN
        </Link>
      </div>
    );
  }

  // Enrolled.
  const arc = getPilgrimageArc(state.archetype);
  const today = arc.days[state.currentDay - 1];
  const color = ARCHETYPE_COLORS[state.archetype] ?? ARCHETYPE_COLORS.cartographer;
  const done = state.completedDays.length;
  const phase = state.currentDay <= 10 ? 0 : state.currentDay <= 20 ? 1 : 2;

  return (
    <Link
      href={`/pilgrimage/day/${state.currentDay}`}
      style={{
        display: "block",
        padding: "14px 18px",
        background: color.soft,
        border: `3px solid ${color.deep}`,
        boxShadow: `3px 3px 0 0 ${color.deep}`,
        marginBottom: 18,
        textDecoration: "none",
        color: "inherit",
      }}
      className="transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5"
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: 8,
          flexWrap: "wrap",
          marginBottom: 8,
        }}
      >
        <div
          style={{
            fontFamily: pixel,
            fontSize: 10,
            color: color.deep,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
          }}
        >
          ▶ THE {state.archetype.toUpperCase()} ARC · DAY {state.currentDay}/30
        </div>
        <div
          style={{
            fontFamily: pixel,
            fontSize: 9,
            color: color.deep,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          {arc.phases[phase]} · {done} COMPLETED
        </div>
      </div>
      {/* Progress bar */}
      <div style={{ display: "flex", gap: 2, marginBottom: 10 }}>
        {Array.from({ length: 30 }, (_, i) => {
          const d = i + 1;
          const isDone = state.completedDays.includes(d);
          const isToday = d === state.currentDay;
          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: 6,
                background: isDone ? color.deep : isToday ? color.primary : "#E2D8B6",
              }}
            />
          );
        })}
      </div>
      <div
        style={{
          fontFamily: serif,
          fontSize: 15.5,
          color: "#221E18",
          lineHeight: 1.4,
        }}
      >
        <strong>Today:</strong> {today.title}
      </div>
      <div
        style={{
          marginTop: 8,
          fontFamily: pixel,
          fontSize: 10,
          color: color.deep,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
        }}
      >
        ▶ OPEN DAY {state.currentDay} →
      </div>
    </Link>
  );
}
