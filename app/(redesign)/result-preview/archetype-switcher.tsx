"use client";

// ArchetypeSwitcher — small floating control for the preview page.
//
// Not part of the production result reveal — it exists so Jimmy can
// click through all 10 archetypes from a single URL and see how the
// theming and choreography land for each. The control is intentionally
// not chrome-heavy: a small pill in the corner, cycle-by-tap, with
// the current archetype name visible so it's never ambiguous which
// one you're looking at.

import { useState, useEffect } from "react";
import { ARCHETYPES, type Archetype } from "@/lib/archetypes";
import { getArchetypeColor } from "@/lib/archetype-colors";
import { ResultReveal } from "./result-reveal";

export function ResultPreviewWithSwitcher() {
  const [index, setIndex] = useState(0);
  // Bumped every time we change archetype so the reveal component
  // restarts its choreography (otherwise it'd just swap the still frame).
  const [token, setToken] = useState(0);

  const current: Archetype = ARCHETYPES[index];
  const color = getArchetypeColor(current.key);

  // Keyboard support — arrow keys to cycle, R to replay current.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        replay();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function next() {
    setIndex((i) => (i + 1) % ARCHETYPES.length);
    setToken((t) => t + 1);
  }
  function prev() {
    setIndex((i) => (i - 1 + ARCHETYPES.length) % ARCHETYPES.length);
    setToken((t) => t + 1);
  }
  function replay() {
    setToken((t) => t + 1);
  }
  function pick(i: number) {
    setIndex(i);
    setToken((t) => t + 1);
  }

  return (
    <>
      {/* Key on the wrapper forces ResultReveal to remount when the
          archetype changes or Replay is clicked. Remount restarts
          Framer Motion's initial→animate transitions, which is the
          cleanest way to re-trigger a multi-element choreography. */}
      <div key={`${current.key}-${token}`}>
        <ResultReveal archetype={current} />
      </div>

      {/* Floating switcher — fixed bottom on mobile, side-floating on
          desktop. Designed to be obviously a preview tool, not chrome
          that would ship to real users. */}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center p-3 sm:bottom-6 sm:left-6 sm:right-auto sm:justify-start sm:p-0"
        aria-hidden={false}
      >
        <div
          className="pointer-events-auto flex flex-col gap-3 rounded-2xl border border-[#D6CDB6] bg-[#FAF6EC]/95 p-3 shadow-[0_12px_40px_rgba(34,30,24,0.18)] backdrop-blur-md"
          style={{ maxWidth: "calc(100vw - 24px)" }}
        >
          <div className="flex items-center gap-2 px-1">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: color.primary }}
            />
            <span className="text-[11px] uppercase tracking-[0.16em] text-[#4A4338]">
              Preview
            </span>
            <span className="ml-auto text-[11px] text-[#4A4338] opacity-60">
              {index + 1} / {ARCHETYPES.length}
            </span>
          </div>

          {/* The current name — sized for legibility, italic to echo
              the reveal headline */}
          <div className="px-1 font-display text-[20px] italic text-[#221E18]" style={{ fontFamily: "var(--font-display)" }}>
            The {capitalize(current.key)}
          </div>

          {/* Cycle controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={prev}
              className="rounded-full border border-[#D6CDB6] bg-[#FAF6EC] px-3 py-1.5 text-[13px] text-[#221E18] hover:bg-[#F1EAD8]"
              aria-label="Previous archetype"
            >
              ←
            </button>
            <button
              type="button"
              onClick={replay}
              className="rounded-full border border-[#D6CDB6] bg-[#FAF6EC] px-3 py-1.5 text-[13px] text-[#221E18] hover:bg-[#F1EAD8]"
              aria-label="Replay reveal"
            >
              Replay
            </button>
            <button
              type="button"
              onClick={next}
              className="rounded-full border border-[#D6CDB6] bg-[#FAF6EC] px-3 py-1.5 text-[13px] text-[#221E18] hover:bg-[#F1EAD8]"
              aria-label="Next archetype"
            >
              →
            </button>
          </div>

          {/* Direct-pick grid — 5×2 so all 10 are visible without a
              scroll. Hidden on the tightest phone widths to keep the
              pill compact. */}
          <div className="hidden grid-cols-5 gap-1.5 px-1 sm:grid">
            {ARCHETYPES.map((a, i) => {
              const c = getArchetypeColor(a.key);
              const active = i === index;
              return (
                <button
                  key={a.key}
                  type="button"
                  onClick={() => pick(i)}
                  className="group relative aspect-square rounded-md transition-transform hover:scale-110"
                  style={{
                    backgroundColor: active ? c.primary : c.soft,
                    outline: active ? `2px solid ${c.deep}` : "none",
                    outlineOffset: 2,
                  }}
                  aria-label={`Pick the ${a.key}`}
                  title={`The ${capitalize(a.key)}`}
                />
              );
            })}
          </div>

          <div className="hidden px-1 text-[10px] uppercase tracking-wider text-[#4A4338] opacity-60 sm:block">
            ← → cycle · R replay
          </div>
        </div>
      </div>
    </>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
