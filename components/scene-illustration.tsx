// SceneIllustration — flat-illustration SVG vignettes for the
// /quiz/journey "Inheritor" prototype.
//
// Honest scope: these are PLACEHOLDER illustrations meant to add
// visual rhythm + atmosphere without pretending to be the final art.
// Clean geometric shapes, restrained palette, no fake-pixel-art
// crudeness. If the prototype direction is approved, the production
// version would either be hand-illustrated by a real artist or
// upgraded to a much more detailed style.
//
// Visual approach: single iconic element per scene (envelope,
// photograph, brass button, etc.), drawn as a strong dark silhouette
// on a sepia-warm background, with one accent color (wax-red,
// candle-amber) for emphasis. Reads as a woodcut or a chapter
// vignette — dignified, period-appropriate, intentional.

import type { SceneArtKey } from "@/lib/quiz-journey";

// Shared palette — warm, restrained, "estate library" vibe.
const PAL = {
  ground: "#F0E5CB",       // sepia background (warm, paper-like)
  groundShadow: "#D4C09A", // shadow tint
  ink: "#2A1F12",          // dark line / silhouette
  inkSoft: "#5C4528",      // mid-tone wood / mid-shadow
  wax: "#7A2E2E",          // wax seal, blood red accent — rare
  flame: "#E8A33D",        // candle flame, single warm accent
  flameSoft: "#C9842E",
  white: "#FFFDF5",        // bright paper / candle halo
} as const;

type Props = {
  scene: SceneArtKey;
  /** Display width in CSS pixels. Height set by aspect ratio. */
  width?: number;
};

export function SceneIllustration({ scene, width = 360 }: Props) {
  const aspectRatio = 5 / 2.5; // 200×100 viewBox
  const height = Math.round(width / aspectRatio);
  return (
    <svg
      viewBox="0 0 200 100"
      width={width}
      height={height}
      style={{ display: "block", margin: "0 auto", maxWidth: "100%" }}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={SCENE_ALT[scene]}
    >
      {/* Sepia ground */}
      <rect x={0} y={0} width={200} height={100} fill={PAL.ground} />
      {/* Subtle ground texture — two horizontal bands suggesting a
          shelf or floor line behind the subject */}
      <rect x={0} y={75} width={200} height={1} fill={PAL.groundShadow} />
      <rect x={0} y={76} width={200} height={24} fill={PAL.groundShadow} opacity={0.3} />
      {/* Scene content */}
      {SCENES[scene]()}
      {/* Decorative corner ornaments — give it the chapter-vignette feel */}
      <Corner x={2} y={2} />
      <Corner x={195} y={2} flipX />
      <Corner x={2} y={95} flipY />
      <Corner x={195} y={95} flipX flipY />
    </svg>
  );
}

function Corner({
  x,
  y,
  flipX,
  flipY,
}: {
  x: number;
  y: number;
  flipX?: boolean;
  flipY?: boolean;
}) {
  const sx = flipX ? -1 : 1;
  const sy = flipY ? -1 : 1;
  return (
    <g transform={`translate(${x},${y}) scale(${sx},${sy})`}>
      <path
        d="M 0 0 L 5 0 L 5 1 L 1 1 L 1 5 L 0 5 Z"
        fill={PAL.ink}
      />
    </g>
  );
}

// ─── Per-scene illustrations ─────────────────────────────────────

const SCENES: Record<SceneArtKey, () => React.ReactNode> = {
  // I · The Invitation — an envelope, sealed in dark red wax.
  "envelope-seal": () => (
    <>
      {/* Envelope body */}
      <polygon
        points="60,30 140,30 140,70 60,70"
        fill={PAL.white}
        stroke={PAL.ink}
        strokeWidth={1.5}
      />
      {/* Envelope flap */}
      <polygon
        points="60,30 100,55 140,30"
        fill={PAL.ground}
        stroke={PAL.ink}
        strokeWidth={1.5}
      />
      {/* Wax seal — single red circle, slightly off-center */}
      <circle cx={100} cy={55} r={6} fill={PAL.wax} stroke={PAL.ink} strokeWidth={1} />
      {/* Tiny embossed marks on the seal */}
      <circle cx={100} cy={55} r={2.5} fill="none" stroke={PAL.ink} strokeWidth={0.6} />
      {/* Handwritten address line suggestion */}
      <line
        x1={75}
        y1={62}
        x2={92}
        y2={62}
        stroke={PAL.inkSoft}
        strokeWidth={0.6}
      />
      <line
        x1={75}
        y1={66}
        x2={88}
        y2={66}
        stroke={PAL.inkSoft}
        strokeWidth={0.6}
      />
    </>
  ),

  // II · The Foyer — a framed photograph on a panelled wall, single
  // candle below.
  "framed-photograph": () => (
    <>
      {/* Wall panel suggestion */}
      <rect x={20} y={10} width={160} height={75} fill="none" stroke={PAL.inkSoft} strokeWidth={0.6} />
      {/* Frame — heavier outer, lighter inner */}
      <rect x={75} y={20} width={50} height={45} fill={PAL.flameSoft} stroke={PAL.ink} strokeWidth={1.5} />
      <rect x={78} y={23} width={44} height={39} fill={PAL.white} />
      {/* Photograph content: simple silhouette of a hand reaching up */}
      <path
        d="M 95 60 L 95 45 Q 95 40 100 40 Q 105 40 105 45 L 105 55 L 110 55 L 110 60 Z"
        fill={PAL.ink}
      />
      <circle cx={100} cy={37} r={3} fill={PAL.ink} />
      {/* Candle below frame — single warm light */}
      <rect x={97} y={70} width={6} height={10} fill={PAL.flameSoft} />
      <ellipse cx={100} cy={68} rx={2} ry={3} fill={PAL.flame} />
      {/* Halo glow */}
      <circle cx={100} cy={68} r={10} fill={PAL.flame} opacity={0.12} />
    </>
  ),

  // III · The Study — desk with an opened letter + inkwell.
  "doctors-letter": () => (
    <>
      {/* Desk */}
      <rect x={20} y={62} width={160} height={4} fill={PAL.inkSoft} />
      <rect x={20} y={62} width={160} height={20} fill={PAL.inkSoft} opacity={0.4} />
      {/* Letter — opened, slightly tilted */}
      <g transform="translate(80, 30) rotate(-3)">
        <rect x={0} y={0} width={50} height={36} fill={PAL.white} stroke={PAL.ink} strokeWidth={1} />
        {/* Lines of writing */}
        <line x1={5} y1={6} x2={45} y2={6} stroke={PAL.inkSoft} strokeWidth={0.5} />
        <line x1={5} y1={11} x2={40} y2={11} stroke={PAL.inkSoft} strokeWidth={0.5} />
        <line x1={5} y1={16} x2={45} y2={16} stroke={PAL.inkSoft} strokeWidth={0.5} />
        <line x1={5} y1={21} x2={32} y2={21} stroke={PAL.inkSoft} strokeWidth={0.5} />
        <line x1={5} y1={26} x2={38} y2={26} stroke={PAL.inkSoft} strokeWidth={0.5} />
        <line x1={5} y1={31} x2={28} y2={31} stroke={PAL.inkSoft} strokeWidth={0.5} />
      </g>
      {/* Inkwell — small dark cylinder */}
      <rect x={38} y={52} width={10} height={10} fill={PAL.ink} />
      <rect x={36} y={50} width={14} height={3} fill={PAL.ink} />
      <ellipse cx={43} cy={50} rx={5} ry={1.2} fill={PAL.wax} opacity={0.7} />
      {/* Quill */}
      <line x1={43} y1={50} x2={55} y2={32} stroke={PAL.ink} strokeWidth={1.2} />
      {/* Low fire glow on right edge */}
      <circle cx={172} cy={68} r={14} fill={PAL.flame} opacity={0.18} />
      <circle cx={172} cy={70} r={7} fill={PAL.flame} opacity={0.3} />
      <rect x={170} y={65} width={4} height={6} fill={PAL.wax} />
      <ellipse cx={172} cy={64} rx={2} ry={3} fill={PAL.flame} />
    </>
  ),

  // IV · The Correspondence — two chairs facing across a low table.
  "two-chairs": () => (
    <>
      {/* Chair left — silhouette in profile */}
      <g transform="translate(40, 30)">
        {/* High back */}
        <rect x={0} y={0} width={4} height={40} fill={PAL.ink} />
        {/* Seat */}
        <rect x={0} y={28} width={28} height={4} fill={PAL.ink} />
        {/* Front leg */}
        <rect x={24} y={32} width={4} height={20} fill={PAL.ink} />
        {/* Back leg */}
        <rect x={0} y={32} width={4} height={20} fill={PAL.ink} />
      </g>
      {/* Chair right — mirrored */}
      <g transform="translate(160, 30) scale(-1, 1)">
        <rect x={0} y={0} width={4} height={40} fill={PAL.ink} />
        <rect x={0} y={28} width={28} height={4} fill={PAL.ink} />
        <rect x={24} y={32} width={4} height={20} fill={PAL.ink} />
        <rect x={0} y={32} width={4} height={20} fill={PAL.ink} />
      </g>
      {/* Low table between */}
      <rect x={84} y={55} width={32} height={3} fill={PAL.inkSoft} />
      <rect x={86} y={58} width={3} height={14} fill={PAL.inkSoft} />
      <rect x={111} y={58} width={3} height={14} fill={PAL.inkSoft} />
      {/* Two stacks of letters on table */}
      <rect x={90} y={50} width={10} height={5} fill={PAL.white} stroke={PAL.ink} strokeWidth={0.5} />
      <rect x={100} y={50} width={10} height={5} fill={PAL.white} stroke={PAL.ink} strokeWidth={0.5} />
      {/* String tying letters — single curved line */}
      <line x1={95} y1={48} x2={95} y2={56} stroke={PAL.wax} strokeWidth={0.5} />
      <line x1={105} y1={48} x2={105} y2={56} stroke={PAL.wax} strokeWidth={0.5} />
    </>
  ),

  // V · The Apparatus — wooden box with a brass button.
  "brass-button": () => (
    <>
      {/* Table — simple horizontal line + legs */}
      <rect x={50} y={65} width={100} height={3} fill={PAL.inkSoft} />
      <rect x={55} y={68} width={3} height={16} fill={PAL.inkSoft} />
      <rect x={142} y={68} width={3} height={16} fill={PAL.inkSoft} />
      {/* Wooden box */}
      <rect x={80} y={50} width={40} height={15} fill={PAL.inkSoft} stroke={PAL.ink} strokeWidth={1.5} />
      {/* Wood grain — two faint horizontal lines */}
      <line x1={82} y1={55} x2={118} y2={55} stroke={PAL.ink} strokeWidth={0.4} opacity={0.5} />
      <line x1={82} y1={60} x2={118} y2={60} stroke={PAL.ink} strokeWidth={0.4} opacity={0.5} />
      {/* Brass button — circle on top, with a small protruding stem */}
      <rect x={97} y={46} width={6} height={4} fill={PAL.flameSoft} />
      <circle cx={100} cy={43} r={5} fill={PAL.flame} stroke={PAL.ink} strokeWidth={1} />
      <circle cx={100} cy={43} r={2} fill={PAL.flameSoft} />
      {/* Tiny shine highlight */}
      <circle cx={98} cy={41} r={1} fill={PAL.white} opacity={0.7} />
      {/* Single shadow under the box */}
      <ellipse cx={100} cy={67} rx={22} ry={1.5} fill={PAL.ink} opacity={0.3} />
    </>
  ),

  // VI · The Last Chamber — a single candle and the foot of a bed
  // in shadow.
  "candle-deathbed": () => (
    <>
      {/* Most of the frame is dark — almost-black with sepia tint */}
      <rect x={0} y={0} width={200} height={100} fill={PAL.ink} />
      {/* Candle on the right — primary light source */}
      <g transform="translate(150, 35)">
        {/* Candle body */}
        <rect x={-3} y={10} width={6} height={28} fill={PAL.flameSoft} />
        {/* Flame */}
        <ellipse cx={0} cy={6} rx={3} ry={5} fill={PAL.flame} />
        <ellipse cx={0} cy={4} rx={1.5} ry={3} fill={PAL.white} />
        {/* Halo */}
        <circle cx={0} cy={6} r={20} fill={PAL.flame} opacity={0.18} />
        <circle cx={0} cy={6} r={35} fill={PAL.flame} opacity={0.08} />
      </g>
      {/* Bed on the left — only the foot visible, silhouetted */}
      <g transform="translate(20, 60)">
        {/* Bedframe */}
        <rect x={0} y={0} width={80} height={4} fill={PAL.inkSoft} />
        {/* Footboard */}
        <rect x={0} y={-15} width={4} height={19} fill={PAL.inkSoft} />
        <rect x={0} y={-18} width={4} height={3} fill={PAL.flameSoft} />
        {/* Blanket suggestion */}
        <rect x={4} y={4} width={76} height={6} fill={PAL.inkSoft} opacity={0.7} />
        {/* Shape suggesting a person under the blanket — single rise */}
        <path
          d="M 4 4 Q 40 -2 80 4"
          fill="none"
          stroke={PAL.flameSoft}
          strokeWidth={0.6}
          opacity={0.6}
        />
      </g>
      {/* Faint floor line */}
      <line x1={0} y1={88} x2={200} y2={88} stroke={PAL.flameSoft} strokeWidth={0.3} opacity={0.4} />
    </>
  ),
};

const SCENE_ALT: Record<SceneArtKey, string> = {
  "envelope-seal":
    "An envelope sealed with dark red wax, handwritten address visible.",
  "framed-photograph":
    "A framed photograph hanging on a panelled wall, candle below.",
  "doctors-letter":
    "A desk with an opened letter, an inkwell and quill, low fire glow on the side.",
  "two-chairs":
    "Two chairs facing each other across a low table holding two stacks of bound letters.",
  "brass-button":
    "A wooden box on a table, a brass button protruding from its top.",
  "candle-deathbed":
    "A single candle illuminating the foot of a bed in deep shadow.",
};
