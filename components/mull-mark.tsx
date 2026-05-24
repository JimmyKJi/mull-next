// MullMark — the brand glyph.
//
// Concept: "The Map." A circle (the philosophical space), eight small
// dots scattered around its inside (positions / philosophers across
// history), and one larger amber dot offset inside the ring (your
// place, after you've taken the quiz).
//
// The metaphor is exactly what Mull does — show you where you sit on
// a 16-D map of philosophical positions, near specific thinkers.
//
// Works as a brand mark alone (favicon, app icon, share badges) and
// paired with the "Mull." wordmark (header, footer, share cards).
//
// Two variants:
//   - `color`: dark ink ring + dots, amber "you" dot
//   - `mono`:  dark ink everywhere (for favicons, single-color contexts)

import React from "react";

type Props = {
  /** Render size in CSS px. Square. Default 32. */
  size?: number;
  /** Color variant — `color` (default) shows the amber "you" dot;
   *  `mono` uses dark ink throughout. */
  variant?: "color" | "mono";
  /** Override the ink color. Default `#221E18`. */
  ink?: string;
  /** Override the accent color (only applies if variant='color').
   *  Default `#B8862F`. */
  accent?: string;
};

export function MullMark({
  size = 32,
  variant = "color",
  ink = "#221E18",
  accent = "#B8862F",
}: Props) {
  const youColor = variant === "color" ? accent : ink;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      role="img"
      aria-label="Mull — the philosophical map"
      style={{ display: "block", flexShrink: 0 }}
    >
      {/* Outer ring — the philosophical space.
          Thin enough to feel like a horizon line, thick enough to read
          at favicon sizes (16-32 px). */}
      <circle
        cx={16}
        cy={16}
        r={14}
        fill="none"
        stroke={ink}
        strokeWidth={1.6}
      />

      {/* Eight small dots — positions/philosophers around the inside
          edge. Slightly irregular spacing to feel hand-placed rather
          than mathematical. Each ~1.6px radius. */}
      {POSITIONS.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={1.4} fill={ink} />
      ))}

      {/* "You" dot — larger, in accent color, offset inward so it
          reads as "near a philosopher but distinct from them". */}
      <circle cx={19} cy={12} r={2.6} fill={youColor} />
      {/* Subtle ink ring on the you-dot to give it weight at small
          sizes. Only shown in color variant where the amber fill
          gives the contrast naturally. */}
      {variant === "color" && (
        <circle
          cx={19}
          cy={12}
          r={2.6}
          fill="none"
          stroke={ink}
          strokeWidth={0.5}
        />
      )}
    </svg>
  );
}

// Hand-placed dot positions. Approximate compass points but
// deliberately uneven — feels less like a clock face, more like a
// constellation. Each pair is [x, y] in the 32×32 viewBox.
const POSITIONS: [number, number][] = [
  [16, 4.5],   // N
  [25, 8],     // NE
  [27.5, 17],  // E
  [23, 25],    // SE
  [15, 27],    // S (slight wobble off-center)
  [7, 24],     // SW
  [4.5, 16],   // W
  [7.5, 8],    // NW
];
