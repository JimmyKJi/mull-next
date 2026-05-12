// Design tokens — the TypeScript-side source of truth for Mull's
// visual system. Mirrors the `@theme` block in app/globals.css.
//
// Why both? Tailwind v4 reads tokens from CSS, but a non-trivial
// amount of Mull's surfaces still compute styles in JS (per-archetype
// accent overrides on the result reveal, three.js material colors on
// the constellation map, OG image generation). Those need typed
// access to the same palette, so we keep a TS copy and rely on the
// two files staying in sync. Changes must be made in BOTH places.
//
// The cream + warm editorial palette is preserved from the existing
// mull.html `:root` block. Modernization happens via motion and depth
// (see lib/motion-tokens.ts), not by replacing the visual voice.

export const COLOR = {
  // Editorial cream surface. Background of every page that isn't a
  // dark-mode-style reveal.
  cream: "#FAF6EC",
  cream2: "#F1EAD8",

  // Ink (near-black, warm). Body copy and primary text.
  ink: "#221E18",
  inkSoft: "#4A4338",

  // Hairlines and divider rules.
  line: "#D6CDB6",

  // Night palette — used by the constellation map background and the
  // result reveal's "press reveal" moment.
  night: "#0C141E",
  night2: "#131F2E",
  night3: "#1D2D44",
  star: "#F1EAD8",

  // Default accent (amber). The result reveal overrides these on a
  // per-archetype basis by setting CSS custom properties on the
  // result wrapper, so component code reading from this object only
  // sees the default. For the per-archetype accent, read the CSS
  // variable directly (see archetype-themed components in Phase 2+).
  acc: "#B8862F",
  accDeep: "#8C6520",
  accSoft: "#F8EDC8",
  accBg: "#F8EDC8",
} as const;

export type ColorToken = keyof typeof COLOR;

// Font stacks. Inline strings rather than imports because:
//   - the system stack must work without webfont load
//   - Cormorant Garamond is loaded via a separate Google Fonts call
//     when needed (Phase 3 will move this to next/font), and we don't
//     want every page to pay the latency cost.
export const FONT = {
  sans: 'ui-sans-serif, -apple-system, "Inter", "Helvetica Neue", Arial, sans-serif',
  display: '"Cormorant Garamond", Georgia, serif',
} as const;

// Layout widths. The editorial column width (720px) is load-bearing —
// the H1 + lede + daily-wisdom rag-right invariant (see AGENTS.md)
// breaks if you change this without auditing the homepage.
export const CONTAINER = {
  editorial: 720,
  editorialWide: 1040,
} as const;

// Shadow recipes. The base shadow mirrors mull.html's `--shadow` token.
// Use these via inline style or by extending Tailwind theme later.
export const SHADOW = {
  base: "0 1px 2px rgba(34,30,24,.05), 0 8px 24px rgba(34,30,24,.06)",
  // Soft elevation for cards above the cream baseline.
  card: "0 1px 2px rgba(34,30,24,.04), 0 12px 32px rgba(34,30,24,.08)",
  // Press-into-night elevation used by the result reveal scrim.
  reveal: "0 20px 60px rgba(12,20,30,.35)",
} as const;

// Spacing scale (px). Matches the multiples used throughout mull.html
// so a migration of any surface lands close to its current rhythm.
// Tailwind v4's default 4px-multiple scale (`p-1`, `p-2`, `p-4`, ...)
// covers most cases — this object is for the few spots that need a
// non-default step (the 28px brandbar padding, the 36px section gap).
export const SPACE = {
  hairline: 1,
  xs: 4,
  sm: 8,
  md: 16,
  brandbar: 28,
  lg: 24,
  section: 36,
  xl: 48,
  xxl: 96,
} as const;

// Border radius. mull.html uses 4–24px depending on element class
// (chips, cards, modals). Tailwind's defaults cover the most-used.
export const RADIUS = {
  chip: 4,
  card: 12,
  modal: 16,
  reveal: 24,
} as const;
