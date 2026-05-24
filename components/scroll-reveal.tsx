"use client";

// ScrollReveal — wrap any block of content; when it enters the
// viewport, the `.reveal` class flips to `.revealed` and the chunky
// stepped fade-up animation fires. Children stagger automatically
// via the `.reveal.revealed > *` CSS rules in globals.css.
//
// Usage:
//   <ScrollReveal>
//     <ChildA />
//     <ChildB />
//   </ScrollReveal>
//
// Behaviour:
//   - Fires ONCE on first entry. Subsequent scrolls don't re-trigger.
//   - Honours prefers-reduced-motion via the existing global rule
//     (the keyframe animation is disabled at the @media level, but
//     the elements remain visible).
//   - Threshold defaults to 0.15 so the reveal triggers when ~15%
//     of the element is in view — feels natural without being
//     too eager.
//   - On browsers without IntersectionObserver (none in practice for
//     modern Mull users), the content reveals immediately on mount.

import { useEffect, useRef, useState } from "react";

type Props = {
  children: React.ReactNode;
  /** Override the trigger threshold (0..1). Default 0.15. */
  threshold?: number;
  /** Optional className to forward to the wrapper div. */
  className?: string;
  /** Render as a different element. Default 'div'. Use 'section'
   *  for major page sections. */
  as?: "div" | "section";
};

export function ScrollReveal({
  children,
  threshold = 0.15,
  className = "",
  as = "div",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (typeof IntersectionObserver === "undefined") {
      // Old browser fallback: just reveal immediately.
      setRevealed(true);
      return;
    }
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setRevealed(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold, rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  const Tag = as;
  return (
    <Tag
      ref={ref as React.RefObject<HTMLDivElement> & React.RefObject<HTMLElement>}
      className={`reveal ${revealed ? "revealed" : ""} ${className}`.trim()}
    >
      {children}
    </Tag>
  );
}
