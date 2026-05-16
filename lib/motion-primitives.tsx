"use client";

// Motion primitives — reusable Framer Motion wrappers that pull from
// lib/motion-tokens.ts so every animated surface in Mull shares the
// same rhythm. Each primitive:
//   - respects `prefers-reduced-motion` via Framer's `useReducedMotion`
//     hook (substitutes a hard cut when set)
//   - takes a `delay` prop for cascading reveals
//   - forwards `className` so callers can size/layout with Tailwind
//   - keeps the underlying motion.div escape hatch via the `as` prop
//     pattern only where it carries weight; otherwise sticks to div
//
// Why a "use client" file: Framer Motion's `motion.*` components ship
// runtime JS for the animation loop and ref handling, so any tree they
// live in must be client-side. Server components that need a reveal
// should mount one of these primitives at the appropriate boundary.

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";
import { DURATION, EASE, STAGGER_STEP, VARIANTS } from "./motion-tokens";

type BaseProps = {
  children: ReactNode;
  className?: string;
  /** Delay before the animation starts, in seconds. */
  delay?: number;
  /**
   * If true, the animation runs once when the element first enters
   * the viewport (uses IntersectionObserver via Framer's whileInView).
   * If false, it runs on mount. Defaults to false — most surfaces in
   * Mull are above-the-fold and benefit from running immediately.
   */
  onView?: boolean;
};

/**
 * FadeIn — opacity 0 → 1, no transform.
 *
 * Use for content that should appear gently without movement:
 *   ambient text blocks, the daily-wisdom paragraph, footer copy.
 */
export function FadeIn({
  children,
  className,
  delay = 0,
  onView = false,
}: BaseProps) {
  const reduce = useReducedMotion();
  // When reduced-motion is set, skip the transition entirely — the
  // element is still rendered, just with no opacity ramp. Returning
  // children directly would lose any wrapping className.
  const triggerProps = onView
    ? { whileInView: "visible", viewport: { once: true, margin: "-10%" } }
    : { animate: "visible" };

  return (
    <motion.div
      className={className}
      initial="hidden"
      {...triggerProps}
      variants={VARIANTS.fadeIn as Variants}
      transition={{
        duration: reduce ? 0 : DURATION.base,
        ease: EASE.outSoft,
        delay: reduce ? 0 : delay,
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * SlideUp — opacity 0 → 1 with a 12px upward translate.
 *
 * The workhorse reveal. Use for cards, headings, hero blocks — any
 * content where a small upward motion reads as "arriving from below."
 * Pairs naturally with `Stagger` for lists.
 */
export function SlideUp({
  children,
  className,
  delay = 0,
  onView = false,
}: BaseProps) {
  const reduce = useReducedMotion();
  const triggerProps = onView
    ? { whileInView: "visible", viewport: { once: true, margin: "-10%" } }
    : { animate: "visible" };

  return (
    <motion.div
      className={className}
      initial="hidden"
      {...triggerProps}
      // When reduced-motion is set, replace the slide with a plain
      // fade so the user still sees an "appear" cue but not the
      // vestibular-triggering translate.
      variants={(reduce ? VARIANTS.fadeIn : VARIANTS.slideUp) as Variants}
      transition={{
        duration: reduce ? 0 : DURATION.slow,
        ease: EASE.outSoft,
        delay: reduce ? 0 : delay,
      }}
    >
      {children}
    </motion.div>
  );
}

type StaggerProps = BaseProps & {
  /** Per-child delay step in seconds. Defaults to STAGGER_STEP. */
  step?: number;
  /** Delay before the first child starts. */
  initialDelay?: number;
};

/**
 * Stagger — parent that cascades its children's reveal.
 *
 * Children should be wrapped in `StaggerChild` (or any motion.div
 * with `variants={VARIANTS.slideUp}` etc), and they inherit the
 * `hidden`/`visible` state from this parent. The parent itself does
 * not animate, only orchestrates timing.
 *
 * Example:
 *   <Stagger onView>
 *     <StaggerChild>First</StaggerChild>
 *     <StaggerChild>Second</StaggerChild>
 *   </Stagger>
 */
export function Stagger({
  children,
  className,
  step = STAGGER_STEP,
  initialDelay = 0,
  onView = false,
}: StaggerProps) {
  const reduce = useReducedMotion();
  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reduce ? 0 : step,
        delayChildren: reduce ? 0 : initialDelay,
      },
    },
  };

  const triggerProps = onView
    ? { whileInView: "visible", viewport: { once: true, margin: "-10%" } }
    : { animate: "visible" };

  return (
    <motion.div
      className={className}
      initial="hidden"
      {...triggerProps}
      variants={containerVariants}
    >
      {children}
    </motion.div>
  );
}

/**
 * StaggerChild — the per-item wrapper for use inside `Stagger`.
 *
 * Defaults to a slide-up variant. Pass `variant="fade"` for a plain
 * opacity ramp (useful in dense tables where the translate would
 * cause layout jitter).
 */
export function StaggerChild({
  children,
  className,
  variant = "slideUp",
}: {
  children: ReactNode;
  className?: string;
  variant?: "fade" | "slideUp" | "scaleIn";
}) {
  const reduce = useReducedMotion();
  const chosen =
    variant === "fade"
      ? VARIANTS.fadeIn
      : variant === "scaleIn"
      ? VARIANTS.scaleIn
      : VARIANTS.slideUp;

  return (
    <motion.div
      className={className}
      // Children variants must not include their own transition —
      // the timing comes from the parent's stagger config. Override
      // only the duration/ease.
      variants={(reduce ? VARIANTS.fadeIn : chosen) as Variants}
      transition={{
        duration: reduce ? 0 : DURATION.base,
        ease: EASE.outSoft,
      }}
    >
      {children}
    </motion.div>
  );
}
