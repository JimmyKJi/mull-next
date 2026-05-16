// Motion tokens — durations, easings, and springs used across the
// redesign. Mirrors the motion-related variables in the `@theme`
// block of app/globals.css.
//
// Design intent: Mull's existing surfaces feel static. The redesign
// adds motion at a deliberate cadence — fast for interaction feedback
// (button press, focus reveal), base for in-place content transitions
// (chip toggle, accordion), slow for navigation/state changes (route
// transitions, modal open), and reveal-pace for the high-emotional-
// payoff moments (quiz result, archetype unveiling). The four
// durations let designers pick a register rather than guessing.
//
// All Framer Motion components and any CSS transitions should pull
// from this file. Inline literal durations are a smell — they fragment
// the rhythm and make tuning the whole feel impossible.

// Durations in seconds (Framer Motion's native unit). CSS-side copies
// in app/globals.css use ms — keep the numbers paired.
export const DURATION = {
  fast: 0.18,
  base: 0.28,
  slow: 0.52,
  reveal: 0.88,
} as const;

// Cubic-bezier easings as 4-tuples (Framer Motion's `ease` prop accepts
// these directly). `outSoft` is the workhorse — it's the same curve
// Apple uses for most of iOS, with a quick start and a long settle that
// reads as "intentional but unhurried". `inOutSoft` is for transitions
// that need a symmetric feel (modal open/close, chip group reordering).
export const EASE = {
  outSoft: [0.22, 1, 0.36, 1] as const,
  inOutSoft: [0.65, 0, 0.35, 1] as const,
  // Linear is sometimes correct (a progress bar, a marquee). Listed
  // here so usage is explicit rather than a magic string.
  linear: [0, 0, 1, 1] as const,
} as const;

// Spring presets for Framer Motion. Springs feel more alive than
// duration-based curves for direct-manipulation gestures (drag, snap)
// and for layout animations where multiple elements rearrange.
export const SPRING = {
  // Snappy: drag release, chip selection — settles fast, no overshoot.
  snappy: { type: "spring" as const, stiffness: 420, damping: 38 },
  // Soft: card mount, modal open — gentle overshoot reads as "alive".
  soft: { type: "spring" as const, stiffness: 220, damping: 26 },
  // Floaty: hero illustration, ambient drift — slow recovery.
  floaty: { type: "spring" as const, stiffness: 80, damping: 18 },
} as const;

// Reduced-motion check. CSS-side already collapses transition/animation
// durations to ~0 via the `@media (prefers-reduced-motion: reduce)`
// rule in app/globals.css. This helper lets JS-driven motion (Framer
// Motion, R3F frame loop overrides) read the same signal and either
// skip the animation or replace it with a hard cut.
//
// Returns false during SSR (window not defined). Components that care
// should call this from `useEffect` after mount and re-render with the
// resolved value, or use Framer Motion's `useReducedMotion()` hook
// which handles SSR correctly.
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Stagger increment for ordered reveals (lists, chips, paragraph
// blocks). Multiplied by index to compute each child's delay. Picked
// to feel "swift but readable" — too small and you can't perceive the
// ordering, too large and the user waits.
export const STAGGER_STEP = 0.06;

// Variants for `motion.div` — picked up by FadeIn / SlideUp wrappers
// in lib/motion-primitives.tsx. Exported so other components can
// extend them rather than re-define near-identical shapes.
export const VARIANTS = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  slideUp: {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0 },
  },
  slideDown: {
    hidden: { opacity: 0, y: -12 },
    visible: { opacity: 1, y: 0 },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.96 },
    visible: { opacity: 1, scale: 1 },
  },
} as const;
