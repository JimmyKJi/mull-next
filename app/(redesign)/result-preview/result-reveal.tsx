"use client";

// ResultReveal — the choreographed quiz-result reveal (V2: bolder).
//
// This is the highest-emotional-payoff surface of Mull. V1 was too
// quiet — fades, small slides, ~2.6s total. V2 leans into drama:
// a longer build, larger spatial gestures, spring physics, an
// expanding ink-blot transition into night, the figure rising from
// off-screen, per-word reveal on the archetype name, alignment
// percent counting up, dim chips bouncing in with overshoot.
//
// Choreography (in seconds):
//   0.00  Page sits on cream. Tight, restrained.
//   0.10  Ink expands from center — a radial circle grows outward and
//         floods the screen with night. ~1.4s sweep.
//   0.50  Halo births at the future figure spot — starts at scale:0.1
//   1.10  Figure rises from below (y:140 → 0) while scaling 0.7→1
//   2.20  "You are" eyebrow cascades letter by letter
//   2.70  "The" lands (scale 1.4 → 1, soft spring)
//   2.95  Archetype name word lands (scale 1.4 → 1, soft spring)
//   3.40  Spirit phrase slides up (y:40 → 0, slow ease)
//   3.85  Alignment % counts up 0 → final over 0.9s
//   4.30  Dim chips bounce in with spring overshoot, staggered
//   5.10  Stars burst out radially from figure center
//   5.50  Cream coda becomes visible
//
// All timings collapse to ~0 under prefers-reduced-motion (the
// useReducedMotion hook returns true, every duration multiplies by 0,
// every delay collapses, and Framer Motion jumps to the final frame).

import {
  motion,
  useReducedMotion,
  useMotionValue,
  animate,
} from "framer-motion";
import { useEffect, useState } from "react";
import type { Archetype } from "@/lib/archetypes";
import { DIM_NAMES, type DimKey } from "@/lib/dimensions";
import { FIGURES } from "@/lib/figures";
import { getArchetypeColor } from "@/lib/archetype-colors";
import { EASE, SPRING } from "@/lib/motion-tokens";
import { cn } from "@/lib/cn";

type Props = {
  archetype: Archetype;
  /** User's alignment percent for the small caption. POC defaults to
   *  87 — strong enough to feel like a real result, low enough not to
   *  claim a perfect match every time. */
  alignmentPct?: number;
};

// Beat times — in seconds. Centralized so we can tune the rhythm
// without grepping the file. These are the "begin animating" delays
// from page mount.
const BEAT = {
  ink: 0.1,
  halo: 0.5,
  figure: 1.1,
  eyebrow: 2.2,
  nameThe: 2.7,
  nameWord: 2.95,
  spirit: 3.4,
  alignment: 3.85,
  chips: 4.3,
  stars: 5.1,
} as const;

export function ResultReveal({ archetype, alignmentPct = 87 }: Props) {
  const reduce = useReducedMotion();
  const color = getArchetypeColor(archetype.key);

  // Per-archetype theme tokens, published as CSS custom properties so
  // nested elements can read them via `var(--acc)` etc. Re-publishing
  // the cream/star/ink palette here too so arbitrary-value Tailwind
  // classes like `text-[var(--star)]` resolve inside this subtree.
  const themeStyle: React.CSSProperties = {
    ["--acc" as string]: color.primary,
    ["--acc-deep" as string]: color.deep,
    ["--acc-soft" as string]: color.soft,
    ["--acc-accent" as string]: color.accent,
    ["--star" as string]: "#F1EAD8",
    ["--cream" as string]: "#FAF6EC",
    ["--cream-2" as string]: "#F1EAD8",
    ["--ink" as string]: "#221E18",
    ["--ink-soft" as string]: "#4A4338",
    ["--line" as string]: "#D6CDB6",
  };

  const dims = (archetype.dominantDimensions as DimKey[]).slice(0, 3);
  const kin = archetype.kindredThinkers.slice(0, 3);

  return (
    <div style={themeStyle} className="relative w-full overflow-hidden">
      <NightStage reduce={!!reduce}>
        <div className="relative z-20 mx-auto flex max-w-[680px] flex-col items-center px-6 pt-24 pb-28 text-center md:pt-32">
          {/* Halo + figure column */}
          <Halo reduce={!!reduce} />
          <FigureBloom svg={FIGURES[archetype.key] ?? ""} reduce={!!reduce} />

          {/* Eyebrow — letter-by-letter cascade */}
          <LetterReveal
            text="YOU ARE"
            beat={BEAT.eyebrow}
            reduce={!!reduce}
            className="mt-12 text-[13px] tracking-[0.22em] text-[var(--acc-soft)]"
          />

          {/* Archetype name — "The" first, then the archetype word.
              Each scales from 1.4 → 1 with a soft spring, creating a
              "lands hard" feeling. Two-beat rhythm so the name reads
              as a deliberate naming, not a label slap. */}
          <h1
            className="mt-5 flex flex-wrap items-baseline justify-center gap-x-3 font-display text-[48px] leading-[1.0] text-[var(--star)] sm:text-[64px] md:text-[76px]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            <motion.span
              initial={{ opacity: 0, scale: 1.4 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                ...SPRING.soft,
                delay: reduce ? 0 : BEAT.nameThe,
              }}
              className="not-italic"
              style={{
                textShadow:
                  "0 2px 30px color-mix(in oklab, var(--acc) 60%, transparent)",
              }}
            >
              The
            </motion.span>
            <motion.em
              initial={{ opacity: 0, scale: 1.4, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                ...SPRING.soft,
                delay: reduce ? 0 : BEAT.nameWord,
              }}
              style={{
                textShadow:
                  "0 2px 30px color-mix(in oklab, var(--acc) 70%, transparent)",
              }}
            >
              {capitalize(archetype.key)}
            </motion.em>
          </h1>

          {/* Spirit phrase — bigger slide (y:40), slower duration so it
              feels like a sentence being placed, not a hover hint. */}
          <motion.p
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reduce ? 0 : 0.7,
              ease: EASE.outSoft,
              delay: reduce ? 0 : BEAT.spirit,
            }}
            className="mt-7 max-w-[520px] text-[18px] leading-relaxed text-[var(--cream-2)] sm:text-[20px]"
          >
            {archetype.spirit}
          </motion.p>

          {/* Alignment counter — counts up from 0 instead of just
              fading in. Numeric animation reads as "the system is
              measuring you", which is the truthful frame for what
              just happened. */}
          <AlignmentCounter
            target={alignmentPct}
            reduce={!!reduce}
            className="mt-7"
          />

          {/* Dimension chips — bounce in with spring overshoot,
              staggered. */}
          <DimChips dims={dims} reduce={!!reduce} />
        </div>

        {/* Radial star-burst — fires after the chips land. Each star
            travels OUTWARD from the figure center as if the reveal
            expelled them. */}
        <StarBurst reduce={!!reduce} />
      </NightStage>

      <CreamCoda archetype={archetype} kin={kin} reduce={!!reduce} />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// NightStage — the dark surface that the reveal happens on. Starts
// as cream, then an expanding ink-blot wipes from center outward to
// fill the screen with the per-archetype night.
// ──────────────────────────────────────────────────────────────────
function NightStage({
  reduce,
  children,
}: {
  reduce: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className="relative min-h-[100svh] w-full overflow-hidden"
      style={{ backgroundColor: "#FAF6EC" }}
    >
      {/* The ink — a giant circle scaled from 0 to ~2.5 viewport widths,
          colored with the archetype's deep shade fading to true night
          at the center. Behind everything but absolutely positioned
          and clip-pathed by overflow-hidden on the parent. */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          duration: reduce ? 0 : 1.4,
          ease: EASE.inOutSoft,
          delay: reduce ? 0 : 0.1,
        }}
        className="pointer-events-none absolute left-1/2 top-[28%] z-0 aspect-square w-[250vmax] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, #0C141E 0%, #0C141E 30%, color-mix(in oklab, var(--acc-deep) 70%, #0C141E) 60%, #0C141E 100%)",
        }}
      />

      {/* Subtle vignette overlay — adds depth once the ink settles */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{
          duration: reduce ? 0 : 1.0,
          delay: reduce ? 0 : 1.4,
        }}
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.5) 100%)",
        }}
      />

      {children}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Halo — soft glow behind the figure. Starts as a near-zero point,
// expands to full halo with a slow spring. The big scale range
// (0.1 → 1) is what makes this feel like a birth rather than a fade.
// ──────────────────────────────────────────────────────────────────
function Halo({ reduce }: { reduce: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.1 }}
      animate={{ opacity: 0.75, scale: 1 }}
      transition={{
        ...SPRING.floaty,
        delay: reduce ? 0 : BEAT.halo,
      }}
      className="pointer-events-none absolute left-1/2 top-[22%] z-10 -translate-x-1/2 md:top-[24%]"
      style={{
        width: 340,
        height: 340,
        background:
          "radial-gradient(circle, var(--acc) 0%, var(--acc-deep) 30%, transparent 70%)",
        filter: "blur(50px)",
      }}
    />
  );
}

// ──────────────────────────────────────────────────────────────────
// FigureBloom — the archetype SVG. Rises from below (y:140), scaling
// up from 0.7. Generous shadow + inset ring frame it. Once landed,
// continues a slow ambient "breathing" loop (small scale 1↔1.02) so
// it never feels static.
// ──────────────────────────────────────────────────────────────────
function FigureBloom({ svg, reduce }: { svg: string; reduce: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7, y: 140 }}
      animate={
        reduce
          ? { opacity: 1, scale: 1, y: 0 }
          : {
              opacity: 1,
              scale: [0.7, 1.05, 1, 1.02, 1],
              y: 0,
            }
      }
      transition={
        reduce
          ? { duration: 0 }
          : {
              y: { ...SPRING.soft, delay: BEAT.figure },
              opacity: { duration: 0.6, delay: BEAT.figure },
              scale: {
                times: [0, 0.4, 0.6, 0.85, 1],
                duration: 1.4,
                ease: EASE.outSoft,
                delay: BEAT.figure,
              },
            }
      }
      className="relative z-20 h-[200px] w-[200px] overflow-hidden rounded-full sm:h-[220px] sm:w-[220px]"
      style={{
        boxShadow:
          "0 30px 80px rgba(12,20,30,.6), 0 0 0 1px color-mix(in oklab, var(--acc) 30%, transparent), inset 0 0 0 10px color-mix(in oklab, var(--acc) 25%, transparent)",
      }}
      // SVG is hand-authored in lib/figures.ts (extracted from
      // mull.html), known-safe.
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

// ──────────────────────────────────────────────────────────────────
// LetterReveal — splits text into characters and cascades them in
// one by one. Used for the small "YOU ARE" eyebrow to give a sense of
// "the system is composing this for you, character by character."
// ──────────────────────────────────────────────────────────────────
function LetterReveal({
  text,
  beat,
  reduce,
  className,
}: {
  text: string;
  beat: number;
  reduce: boolean;
  className?: string;
}) {
  // Split keeping spaces — we need them rendered, not collapsed.
  const chars = text.split("");
  return (
    <motion.div
      aria-label={text}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: reduce ? 0 : 0.05,
            delayChildren: reduce ? 0 : beat,
          },
        },
      }}
      className={className}
    >
      {chars.map((ch, i) => (
        <motion.span
          key={i}
          aria-hidden
          variants={{
            hidden: { opacity: 0, y: 10 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: reduce ? 0 : 0.4, ease: EASE.outSoft }}
          style={{
            display: "inline-block",
            whiteSpace: "pre",
          }}
        >
          {ch}
        </motion.span>
      ))}
    </motion.div>
  );
}

// ──────────────────────────────────────────────────────────────────
// AlignmentCounter — numeric count-up from 0 to the final percent.
// Uses Framer Motion's `animate()` with a motion value so the digit
// re-renders smoothly. The accent dot pulses once the count lands.
// ──────────────────────────────────────────────────────────────────
function AlignmentCounter({
  target,
  reduce,
  className,
}: {
  target: number;
  reduce: boolean;
  className?: string;
}) {
  const mv = useMotionValue(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (reduce) {
      setDisplay(target);
      mv.set(target);
      return;
    }
    const id = setTimeout(() => {
      const controls = animate(mv, target, {
        duration: 0.9,
        ease: EASE.outSoft,
        onUpdate: (v) => setDisplay(Math.round(v)),
      });
      return () => controls.stop();
    }, BEAT.alignment * 1000);
    return () => clearTimeout(id);
  }, [mv, target, reduce]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: reduce ? 0 : 0.4,
        delay: reduce ? 0 : BEAT.alignment,
      }}
      className={cn(
        "flex items-baseline justify-center gap-3 text-[var(--cream-2)]",
        className,
      )}
    >
      <motion.span
        animate={{ scale: reduce ? 1 : [1, 1.3, 1] }}
        transition={{
          duration: 0.5,
          delay: reduce ? 0 : BEAT.alignment + 0.9,
          times: [0, 0.5, 1],
        }}
        className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--acc-accent)]"
      />
      <span
        className="font-display text-[36px] leading-none text-[var(--star)]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {display}
      </span>
      <span className="text-[12px] uppercase tracking-[0.22em] opacity-70">
        % alignment
      </span>
    </motion.div>
  );
}

// ──────────────────────────────────────────────────────────────────
// StarBurst — twelve points scattered around the figure, each
// animating OUTWARD from the center on a timed delay. Reads as the
// reveal "expelling" stars as it lands. Static positions after they
// arrive — we don't loop, just want the burst gesture.
// ──────────────────────────────────────────────────────────────────
const STAR_DESTS = [
  { x: -180, y: -120, size: 1.5 },
  { x: 180, y: -130, size: 2 },
  { x: -220, y: -40, size: 1 },
  { x: 220, y: -30, size: 1.2 },
  { x: -260, y: 80, size: 1 },
  { x: 260, y: 70, size: 1.3 },
  { x: -160, y: 180, size: 1 },
  { x: 170, y: 190, size: 1.5 },
  { x: 0, y: -260, size: 1 },
  { x: 0, y: 260, size: 1 },
  { x: -300, y: -200, size: 0.8 },
  { x: 310, y: -210, size: 0.8 },
];

function StarBurst({ reduce }: { reduce: boolean }) {
  return (
    <div
      className="pointer-events-none absolute left-1/2 top-[22%] z-[15] -translate-x-1/2"
      style={{ width: 0, height: 0 }}
    >
      {STAR_DESTS.map((s, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
          animate={{
            opacity: 0.7,
            x: s.x,
            y: s.y,
            scale: 1,
          }}
          transition={{
            duration: reduce ? 0 : 1.6,
            ease: EASE.outSoft,
            delay: reduce ? 0 : BEAT.stars + i * 0.04,
          }}
          className="absolute rounded-full bg-[var(--star)]"
          style={{
            width: s.size * 3,
            height: s.size * 3,
            top: -s.size,
            left: -s.size,
            boxShadow: "0 0 8px var(--star)",
          }}
        />
      ))}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// DimChips — three dominant-dimension chips that bounce in one by
// one with spring overshoot. The overshoot is what makes this feel
// like physical objects landing rather than UI fading in.
// ──────────────────────────────────────────────────────────────────
function DimChips({ dims, reduce }: { dims: DimKey[]; reduce: boolean }) {
  return (
    <motion.div
      initial="pre"
      animate="reveal"
      variants={{
        pre: {},
        reveal: {
          transition: {
            staggerChildren: reduce ? 0 : 0.12,
            delayChildren: reduce ? 0 : BEAT.chips,
          },
        },
      }}
      className="mt-10 flex flex-wrap items-center justify-center gap-2.5"
    >
      {dims.map((k) => (
        <motion.div
          key={k}
          variants={{
            pre: { opacity: 0, y: 30, scale: 0.6 },
            reveal: { opacity: 1, y: 0, scale: 1 },
          }}
          transition={reduce ? { duration: 0 } : SPRING.soft}
          className={cn(
            "flex items-center gap-2 rounded-full border border-[var(--acc-soft)]/30 bg-[var(--acc-deep)]/50 px-4 py-2",
            "text-[13px] text-[var(--star)] backdrop-blur-sm",
            "shadow-[0_4px_20px_rgba(0,0,0,0.3)]",
          )}
        >
          <span className="font-mono text-[10px] tracking-wider text-[var(--acc-accent)] opacity-90">
            {k}
          </span>
          <span>{DIM_NAMES[k]}</span>
        </motion.div>
      ))}
    </motion.div>
  );
}

// ──────────────────────────────────────────────────────────────────
// CreamCoda — back-to-cream section. Triggers off scroll (whileInView)
// so it isn't visible until the user has soaked in the reveal.
// ──────────────────────────────────────────────────────────────────
function CreamCoda({
  archetype,
  kin,
  reduce,
}: {
  archetype: Archetype;
  kin: string[];
  reduce: boolean;
}) {
  return (
    <div className="relative w-full bg-[#FAF6EC] px-6 pb-32 pt-24 text-[#221E18]">
      <div className="mx-auto max-w-[680px]">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{
            duration: reduce ? 0 : 0.4,
            ease: EASE.outSoft,
          }}
          className="text-[11px] uppercase tracking-[0.2em] text-[#4A4338] opacity-70"
        >
          What this orientation sees
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{
            duration: reduce ? 0 : 0.7,
            ease: EASE.outSoft,
            delay: reduce ? 0 : 0.1,
          }}
          className="mt-4 font-display text-[28px] leading-[1.3] text-[#221E18] sm:text-[32px]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {archetype.whatItGetsRight}
        </motion.p>

        <motion.div
          initial="pre"
          whileInView="reveal"
          viewport={{ once: true, margin: "-15%" }}
          variants={{
            pre: {},
            reveal: {
              transition: {
                staggerChildren: reduce ? 0 : 0.1,
                delayChildren: reduce ? 0 : 0.25,
              },
            },
          }}
          className="mt-14"
        >
          <motion.div
            variants={{
              pre: { opacity: 0, y: 10 },
              reveal: { opacity: 1, y: 0 },
            }}
            transition={{ duration: reduce ? 0 : 0.4 }}
            className="text-[11px] uppercase tracking-[0.2em] text-[#4A4338] opacity-70"
          >
            Kindred thinkers
          </motion.div>
          <div className="mt-4 grid grid-cols-1 gap-px overflow-hidden rounded-md border border-[#D6CDB6] bg-[#D6CDB6] sm:grid-cols-3">
            {kin.map((name) => (
              <motion.div
                key={name}
                variants={{
                  pre: { opacity: 0, y: 20, scale: 0.95 },
                  reveal: { opacity: 1, y: 0, scale: 1 },
                }}
                transition={reduce ? { duration: 0 } : SPRING.soft}
                className="bg-[#FAF6EC] px-4 py-5 text-[16px] text-[#221E18]"
              >
                <div
                  className="font-display text-[22px] leading-tight"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {name}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{
            duration: reduce ? 0 : 0.7,
            ease: EASE.outSoft,
            delay: reduce ? 0 : 0.35,
          }}
          className={cn(
            "mt-16 overflow-hidden rounded-2xl border bg-[var(--acc-soft)] p-7",
            "border-[var(--acc-deep)]/15 shadow-[0_12px_40px_rgba(34,30,24,0.06)]",
          )}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-[var(--acc-deep)] opacity-80">
                Read on
              </div>
              <div
                className="mt-1 font-display text-[28px] leading-tight text-[var(--acc-deep)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                The full essay on the {capitalize(archetype.key)}
              </div>
            </div>
            <button
              type="button"
              className={cn(
                "shrink-0 rounded-full bg-[var(--acc-deep)] px-6 py-3 text-[14px] font-medium",
                "text-[var(--acc-soft)] transition-transform hover:scale-[1.05] focus-visible:outline-none",
                "focus-visible:ring-2 focus-visible:ring-[var(--acc-deep)] focus-visible:ring-offset-2",
                "focus-visible:ring-offset-[var(--acc-soft)]",
              )}
            >
              Open essay →
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
