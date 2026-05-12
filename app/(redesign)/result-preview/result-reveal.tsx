"use client";

// ResultReveal — the choreographed quiz-result reveal.
//
// This is the highest-emotional-payoff surface of Mull: the moment a
// person finds out which of the 10 archetypes they are. Today
// (mull.html) the reveal is a static jump — the result section becomes
// visible, all at once, with no sense of arrival. This POC explores
// what it feels like when the reveal is staged like a small piece of
// cinema: a press from cream into night, the figure developing out of
// the dark, the name landing, the dimensions laddering in, the
// kindred thinkers gathering around.
//
// Choreography (in seconds, all timings tuned together):
//   0.00  Cream → night background ramp (the "press into night" feel)
//   0.25  Halo bloom behind where the figure will be
//   0.45  Figure scales up + fades in (svg renders all at once;
//         "drawing" effect comes from the halo + scale, not stroke
//         animation, which would require per-svg stroke prep)
//   0.95  "You are..." label fades in
//   1.20  Archetype name (italic, large) slides up
//   1.55  Spirit phrase fades in below
//   2.00  Four dominant-dimension chips ladder in, staggered
//   2.60  Cream coda begins (kindred thinkers, blurb, CTA)
//
// All timings collapse to ~0 under prefers-reduced-motion (handled by
// the motion primitives + a top-level reduce check).

import { motion, useReducedMotion } from "framer-motion";
import type { Archetype } from "@/lib/archetypes";
import { DIM_NAMES, type DimKey } from "@/lib/dimensions";
import { FIGURES } from "@/lib/figures";
import { getArchetypeColor } from "@/lib/archetype-colors";
import { DURATION, EASE } from "@/lib/motion-tokens";
import { cn } from "@/lib/cn";

type Props = {
  archetype: Archetype;
  /**
   * If provided, used as the user's "alignment" percent in the small
   * caption under the archetype name. POC defaults to 87 — high
   * enough to feel like a real result, low enough that not every
   * preview claims a perfect match.
   */
  alignmentPct?: number;
  // (replayToken accepted by the parent wrapper, where it drives a
  // `key` to force remount; not consumed here.)
};

export function ResultReveal({ archetype, alignmentPct = 87 }: Props) {
  const reduce = useReducedMotion();
  const color = getArchetypeColor(archetype.key);

  // No phase state — Framer Motion handles the initial→animate
  // transition automatically on mount. Replay/archetype-switch is
  // implemented via a `key` change on the wrapper, which forces a
  // fresh mount and re-runs the choreography from the top.
  //
  // Earlier versions tried to gate the reveal on a useEffect-driven
  // phase token to guarantee a paint of the pre-state. That dance
  // turned out brittle under React strict mode + reduced-motion: the
  // cleanup could cancel the rAF chain mid-flight and leave phase
  // stuck at "pre" forever, with all opacities at 0 — total whiteout.
  // The simpler `key`-based approach is what Framer Motion is built
  // for and never gets stuck.

  // Per-archetype CSS custom properties — drives the scrim hue, the
  // halo behind the figure, the chip border, and the CTA button.
  // Setting these on the root wrapper lets nested elements `var(--acc)`
  // without each component knowing the archetype.
  //
  // We also re-publish the cream/night/star tokens locally (matching
  // mull.html's :root names) so nested arbitrary-value Tailwind
  // classes like `text-[var(--star)]` resolve. The @theme block uses
  // the `--color-*` prefix Tailwind requires for utility generation,
  // but those names aren't always the cleanest to reference inline.
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

  // Top-4 dominant dimensions for this archetype. We use the
  // dominantDimensions array from lib/archetypes.ts (3 entries) and
  // pad with the next-most-prominent — for the POC, we just show the
  // 3 we have, which keeps the layout balanced on mobile.
  const dims = (archetype.dominantDimensions as DimKey[]).slice(0, 3);

  // Three kindred thinkers — first three from the curated list. The
  // full archetype page shows all 6–10; the reveal moment wants
  // restraint.
  const kin = archetype.kindredThinkers.slice(0, 3);

  return (
    <div
      style={themeStyle}
      className="relative w-full overflow-hidden"
    >
      {/* ── REVEAL PANEL (night) ─────────────────────────────────────
          Full-bleed dark surface that ramps in from the cream baseline.
          On mobile this fills the viewport on first paint; on desktop
          it's contained to a tall hero block. */}
      <NightPanel reduce={!!reduce}>
        <div className="relative z-10 mx-auto flex max-w-[680px] flex-col items-center px-6 pt-20 pb-24 text-center md:pt-28">
          {/* Halo + figure */}
          <Halo reduce={!!reduce} />
          <FigureBloom svg={FIGURES[archetype.key] ?? ""} reduce={!!reduce} />

          {/* Eyebrow ("You are...") */}
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reduce ? 0 : DURATION.base,
              ease: EASE.outSoft,
              delay: reduce ? 0 : 0.95,
            }}
            className="mt-10 text-[13px] uppercase tracking-[0.18em] text-[var(--acc-soft)] opacity-80"
          >
            You are
          </motion.p>

          {/* Archetype name — Cormorant italic, generous */}
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reduce ? 0 : DURATION.slow,
              ease: EASE.outSoft,
              delay: reduce ? 0 : 1.2,
            }}
            className="mt-3 font-display text-[44px] leading-[1.05] text-[var(--star)] sm:text-[56px] md:text-[64px]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            <em className="not-italic">The </em>
            <em>{capitalize(archetype.key)}</em>
          </motion.h1>

          {/* Spirit phrase */}
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reduce ? 0 : DURATION.base,
              ease: EASE.outSoft,
              delay: reduce ? 0 : 1.55,
            }}
            className="mt-4 max-w-[480px] text-[17px] leading-relaxed text-[var(--cream-2)] opacity-85"
          >
            {archetype.spirit}
          </motion.p>

          {/* Alignment percent — small, low-key, builds trust without
              shouting */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: reduce ? 0 : DURATION.base,
              delay: reduce ? 0 : 1.75,
            }}
            className="mt-5 flex items-center gap-2 text-[12px] uppercase tracking-[0.16em] text-[var(--cream-2)] opacity-65"
          >
            <span className="inline-block h-1 w-1 rounded-full bg-[var(--acc-accent)]" />
            {alignmentPct}% alignment
          </motion.div>

          {/* Dominant-dimension chips */}
          <DimChips dims={dims} reduce={!!reduce} />
        </div>
      </NightPanel>

      {/* ── CREAM CODA ──────────────────────────────────────────────
          The transition back to cream — kindred thinkers, blurb,
          what's next. Uses onView so it animates as the user scrolls
          into it (or, on desktop where it's already in view, it
          comes in with a small delay after the reveal completes). */}
      <CreamCoda archetype={archetype} kin={kin} reduce={!!reduce} />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// NightPanel — the dark surface that ramps in from the cream baseline.
// Uses a layered radial gradient so the per-archetype --acc-deep
// tints the night without dominating it. The 100vh min-height on
// mobile is what makes the reveal feel like its own page.
// ──────────────────────────────────────────────────────────────────
function NightPanel({
  reduce,
  children,
}: {
  reduce: boolean;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ backgroundColor: "#FAF6EC" }}
      animate={{ backgroundColor: "#0C141E" }}
      transition={{
        duration: reduce ? 0 : DURATION.reveal,
        ease: EASE.inOutSoft,
      }}
      className="relative min-h-[100svh] w-full"
      // Static gradient — it sits on top of the animated bg-color.
      // Pre-state shows as a slightly-warm radial on cream; once the
      // bg ramps to night the gradient reads as the per-archetype
      // halo behind the figure. Cheaper than animating two layers.
      style={{
        backgroundImage:
          "radial-gradient(circle at 50% 38%, color-mix(in oklab, var(--acc-deep) 55%, transparent) 0%, transparent 55%)",
      }}
    >
      {/* Star field — very subtle, only ten or so. Adds depth without
          pretending to be a real night sky. */}
      <Stars reduce={reduce} />
      {children}
    </motion.div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Halo — the soft glow behind the figure, in the per-archetype hue.
// Scales + fades in slightly before the figure does, so the figure
// looks like it's emerging from the halo rather than landing on it.
// ──────────────────────────────────────────────────────────────────
function Halo({ reduce }: { reduce: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 0.5, scale: 1 }}
      transition={{
        duration: reduce ? 0 : DURATION.reveal,
        ease: EASE.outSoft,
        delay: reduce ? 0 : 0.25,
      }}
      className="pointer-events-none absolute left-1/2 top-[18%] -translate-x-1/2 -translate-y-0 md:top-[22%]"
      style={{
        width: 280,
        height: 280,
        background:
          "radial-gradient(circle, var(--acc) 0%, var(--acc-deep) 35%, transparent 72%)",
        filter: "blur(40px)",
      }}
    />
  );
}

// ──────────────────────────────────────────────────────────────────
// FigureBloom — the archetype SVG, scales up while fading, sitting
// inside a soft circular cream "card" so the dark line work in the
// SVGs reads against the night background.
// ──────────────────────────────────────────────────────────────────
function FigureBloom({
  svg,
  reduce,
}: {
  svg: string;
  reduce: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        duration: reduce ? 0 : DURATION.reveal,
        ease: EASE.outSoft,
        delay: reduce ? 0 : 0.45,
      }}
      className="relative h-[180px] w-[180px] overflow-hidden rounded-full ring-1 ring-[var(--acc-deep)]/30 sm:h-[200px] sm:w-[200px]"
      style={{
        // The figures all draw a cream-ish circle background via their
        // own SVG; the ring + the scale-from-92 frames it nicely.
        boxShadow:
          "0 20px 60px rgba(12,20,30,.5), inset 0 0 0 8px color-mix(in oklab, var(--acc) 25%, transparent)",
      }}
      // SVG markup is hand-authored in lib/figures.ts (extracted from
      // mull.html) — it's known-safe, not user input.
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

// ──────────────────────────────────────────────────────────────────
// Stars — a small scatter of points, very low opacity, that fade in
// after the night background is established. Adds the sense that the
// reveal happens against something rather than nothing.
// ──────────────────────────────────────────────────────────────────
const STAR_POSITIONS = [
  { top: "14%", left: "12%", size: 1.5, delay: 1.6 },
  { top: "9%", left: "78%", size: 2, delay: 1.4 },
  { top: "62%", left: "8%", size: 1, delay: 1.9 },
  { top: "70%", left: "92%", size: 1.5, delay: 1.7 },
  { top: "30%", left: "5%", size: 1, delay: 2.1 },
  { top: "44%", left: "94%", size: 1, delay: 2.0 },
  { top: "82%", left: "22%", size: 1, delay: 1.85 },
  { top: "88%", left: "70%", size: 1.5, delay: 1.95 },
];

function Stars({ reduce }: { reduce: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {STAR_POSITIONS.map((s, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.55, scale: 1 }}
          transition={{
            duration: reduce ? 0 : DURATION.slow,
            delay: reduce ? 0 : s.delay,
          }}
          className="absolute rounded-full bg-[var(--star)]"
          style={{
            top: s.top,
            left: s.left,
            width: s.size * 2,
            height: s.size * 2,
          }}
        />
      ))}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// DimChips — the three dominant dimensions, each as a small chip
// with the dim code + name. Ladders in 0.06s apart.
// ──────────────────────────────────────────────────────────────────
function DimChips({
  dims,
  reduce,
}: {
  dims: DimKey[];
  reduce: boolean;
}) {
  return (
    <motion.div
      initial="pre"
      animate="reveal"
      variants={{
        pre: {},
        reveal: {
          transition: {
            staggerChildren: reduce ? 0 : 0.08,
            delayChildren: reduce ? 0 : 2.0,
          },
        },
      }}
      className="mt-8 flex flex-wrap items-center justify-center gap-2"
    >
      {dims.map((k) => (
        <motion.div
          key={k}
          variants={{
            pre: { opacity: 0, y: 8 },
            reveal: { opacity: 1, y: 0 },
          }}
          transition={{
            duration: reduce ? 0 : DURATION.base,
            ease: EASE.outSoft,
          }}
          className={cn(
            "flex items-center gap-2 rounded-full border border-[var(--acc-soft)]/25 bg-[var(--acc-deep)]/40 px-3 py-1.5",
            "text-[12px] text-[var(--star)] backdrop-blur-sm"
          )}
        >
          <span className="font-mono text-[10px] tracking-wider text-[var(--acc-accent)] opacity-80">
            {k}
          </span>
          <span>{DIM_NAMES[k]}</span>
        </motion.div>
      ))}
    </motion.div>
  );
}

// ──────────────────────────────────────────────────────────────────
// CreamCoda — the back-to-cream section with the longer-form context.
// Three blocks: "What this orientation gets right" lift from the
// archetype data, kindred thinkers (3 names), and a CTA card that
// nods to "Save this result" / "Read the full essay".
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
    <div className="relative w-full bg-[#FAF6EC] px-6 pb-32 pt-20 text-[#221E18]">
      <div className="mx-auto max-w-[680px]">
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{
            duration: reduce ? 0 : DURATION.base,
            ease: EASE.outSoft,
          }}
          className="text-[11px] uppercase tracking-[0.2em] text-[#4A4338] opacity-70"
        >
          What this orientation sees
        </motion.div>

        {/* "What it gets right" pull — the philosophical value-prop */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{
            duration: reduce ? 0 : DURATION.slow,
            ease: EASE.outSoft,
            delay: reduce ? 0 : 0.08,
          }}
          className="mt-4 font-display text-[26px] leading-[1.35] text-[#221E18] sm:text-[30px]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {archetype.whatItGetsRight}
        </motion.p>

        {/* Kindred thinkers — three names, slim layout */}
        <motion.div
          initial="pre"
          whileInView="reveal"
          viewport={{ once: true, margin: "-15%" }}
          variants={{
            pre: {},
            reveal: {
              transition: {
                staggerChildren: reduce ? 0 : 0.08,
                delayChildren: reduce ? 0 : 0.2,
              },
            },
          }}
          className="mt-12"
        >
          <motion.div
            variants={{
              pre: { opacity: 0, y: 10 },
              reveal: { opacity: 1, y: 0 },
            }}
            transition={{ duration: reduce ? 0 : DURATION.base }}
            className="text-[11px] uppercase tracking-[0.2em] text-[#4A4338] opacity-70"
          >
            Kindred thinkers
          </motion.div>
          <div className="mt-4 grid grid-cols-1 gap-px overflow-hidden rounded-md border border-[#D6CDB6] bg-[#D6CDB6] sm:grid-cols-3">
            {kin.map((name) => (
              <motion.div
                key={name}
                variants={{
                  pre: { opacity: 0, y: 10 },
                  reveal: { opacity: 1, y: 0 },
                }}
                transition={{
                  duration: reduce ? 0 : DURATION.base,
                  ease: EASE.outSoft,
                }}
                className="bg-[#FAF6EC] px-4 py-5 text-[16px] text-[#221E18]"
              >
                <div className="font-display text-[20px] leading-tight" style={{ fontFamily: "var(--font-display)" }}>
                  {name}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA card — what's next */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{
            duration: reduce ? 0 : DURATION.slow,
            ease: EASE.outSoft,
            delay: reduce ? 0 : 0.3,
          }}
          className={cn(
            "mt-14 overflow-hidden rounded-2xl border bg-[var(--acc-soft)] p-7",
            "border-[var(--acc-deep)]/15 shadow-[0_12px_40px_rgba(34,30,24,0.06)]"
          )}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-[var(--acc-deep)] opacity-80">
                Read on
              </div>
              <div
                className="mt-1 font-display text-[26px] leading-tight text-[var(--acc-deep)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                The full essay on the {capitalize(archetype.key)}
              </div>
            </div>
            <button
              type="button"
              className={cn(
                "shrink-0 rounded-full bg-[var(--acc-deep)] px-5 py-3 text-[14px] font-medium",
                "text-[var(--acc-soft)] transition-transform hover:scale-[1.03] focus-visible:outline-none",
                "focus-visible:ring-2 focus-visible:ring-[var(--acc-deep)] focus-visible:ring-offset-2",
                "focus-visible:ring-offset-[var(--acc-soft)]"
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
