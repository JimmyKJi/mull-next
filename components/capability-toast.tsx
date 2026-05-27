"use client";

// CapabilityToast — the dopamine hit.
//
// Listens for `mull:capability-event` window events and renders a
// small pixel-styled badge in the bottom-right showing the XP gained
// + which skill leveled. Fades after 4 seconds. Stacks if multiple
// events fire close together.
//
// Designed to feel like a Stardew-Valley level-up notification:
// brief, visual, satisfying, never modal. The point is to make the
// invisible work visible at the moment it happens.
//
// Place once near the root (in app/layout.tsx) so every page picks
// up events. Renders nothing on the server side or until an event
// has fired.

import { useEffect, useState } from "react";
import {
  type CapabilityEvent,
  SKILL_META,
  readEvents,
  aggregateXp,
  levelFromXp,
} from "@/lib/capabilities";

type Toast = {
  id: number;
  event: CapabilityEvent;
  leveledUp: boolean;
  newLevel: number;
};

let toastIdCounter = 0;

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";

export default function CapabilityToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    let lastEventsLength = readEvents().length;
    function handler() {
      const events = readEvents();
      // Diff: new events appended since last check.
      const newOnes = events.slice(lastEventsLength);
      lastEventsLength = events.length;
      // For each new event, check if it caused a level-up.
      const newToasts: Toast[] = newOnes.map((e) => {
        // Build the cumulative event list up to AND including this event
        // for this skill, plus exclude this event to compare.
        const beforeXp = aggregateXp(
          events.filter((x) => x.skill === e.skill && x.ts < e.ts),
        )[e.skill];
        const afterXp = aggregateXp(
          events.filter((x) => x.skill === e.skill && x.ts <= e.ts),
        )[e.skill];
        const before = levelFromXp(beforeXp).level;
        const after = levelFromXp(afterXp).level;
        return {
          id: ++toastIdCounter,
          event: e,
          leveledUp: after > before,
          newLevel: after,
        };
      });
      if (newToasts.length === 0) return;
      setToasts((prev) => [...prev, ...newToasts]);
      // Auto-dismiss each after 4s (level-ups stay 6s).
      for (const t of newToasts) {
        const ms = t.leveledUp ? 6000 : 4000;
        setTimeout(() => {
          setToasts((prev) => prev.filter((x) => x.id !== t.id));
        }, ms);
      }
    }
    window.addEventListener("mull:capability-event", handler);
    return () => window.removeEventListener("mull:capability-event", handler);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        // Stack the iPhone home-indicator inset onto the base 24px
        // so capability toasts don't disappear behind the indicator
        // when the PWA is installed standalone.
        bottom: "calc(24px + env(safe-area-inset-bottom, 0px))",
        right: 24,
        zIndex: 100,
        display: "flex",
        flexDirection: "column-reverse",
        gap: 8,
        pointerEvents: "none",
      }}
      aria-live="polite"
    >
      {toasts.slice(-3).map((t) => {
        const meta = SKILL_META[t.event.skill];
        return (
          <div
            key={t.id}
            style={{
              padding: "10px 14px",
              background: t.leveledUp ? meta.color : "#1A1612",
              color: "#F8EDC8",
              border: "3px solid #221E18",
              boxShadow: `4px 4px 0 0 ${t.leveledUp ? "#F8C75E" : meta.color}`,
              minWidth: 220,
              fontFamily: pixel,
              animation: "mull-toast-in 200ms steps(3, end) both",
              pointerEvents: "auto",
            }}
          >
            <div
              style={{
                fontSize: 10,
                letterSpacing: "0.22em",
                color: t.leveledUp ? "#1A1820" : "#F8C75E",
                textTransform: "uppercase",
                marginBottom: 4,
              }}
            >
              {t.leveledUp
                ? `▶ LEVEL UP · ${meta.name} LV ${t.newLevel}`
                : `▶ +${t.event.xp} ${meta.name}`}
            </div>
            <div
              style={{
                fontFamily: "var(--font-editorial), Georgia, serif",
                fontSize: 14,
                color: t.leveledUp ? "#1A1820" : "#E5DCC0",
                lineHeight: 1.4,
              }}
            >
              {t.event.label ?? `Practice in ${meta.name.toLowerCase()}.`}
            </div>
          </div>
        );
      })}
      <style>{`
        @keyframes mull-toast-in {
          0% { transform: translateY(12px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
