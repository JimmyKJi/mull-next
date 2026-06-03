// MullMark — the brand glyph.
//
// The mark is a hand-drawn globe-headed figure reading an open book:
// the world as a mind, philosophy as reading the world. It ships as a
// transparent-ink PNG (public/mull-logo.png) generated from the source
// art by scripts/gen-logo-assets.mjs — white paper is knocked out to
// transparency so the glyph sits cleanly on any parchment/cream surface
// (nav, wordmark, share cards) and shows the page color through the
// figure's open interior.
//
// It works as a brand mark alone (favicon, app icon) and paired with the
// "Mull." wordmark (see MullWordmark). The art is portrait, so `size` is
// interpreted as the glyph HEIGHT in CSS px; width follows the intrinsic
// aspect ratio.
//
// The `variant` / `ink` / `accent` props are retained for backward
// compatibility with existing callers but are now no-ops: the artwork is
// a single fixed ink color baked into the PNG.

import React from "react";

// Intrinsic dimensions of public/mull-logo.png (see gen-logo-assets.mjs).
// Used to derive width from the requested height.
const LOGO_W = 377;
const LOGO_H = 600;

type Props = {
  /** Render HEIGHT in CSS px (width follows aspect). Default 32. */
  size?: number;
  /** Retained for API compatibility; no longer affects rendering. */
  variant?: "color" | "mono";
  /** Retained for API compatibility; no longer affects rendering. */
  ink?: string;
  /** Retained for API compatibility; no longer affects rendering. */
  accent?: string;
};

export function MullMark({ size = 32 }: Props) {
  const width = Math.round((size * LOGO_W) / LOGO_H);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/mull-logo.png"
      alt="Mull"
      aria-label="Mull — a globe-headed reader"
      width={width}
      height={size}
      draggable={false}
      style={{
        display: "block",
        flexShrink: 0,
        objectFit: "contain",
        userSelect: "none",
      }}
    />
  );
}
