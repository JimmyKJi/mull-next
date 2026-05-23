// SceneIllustration — pixel-art-style SVG scene illustrations for
// the /quiz/journey narrative quiz.
//
// Each illustration is a small viewBox of integer-grid rects, scaled
// up via image-rendering:pixelated. The result reads as 8-bit pixel
// art without requiring external image assets.
//
// Palette is restrained — a deep night-blue ground, candlelit amber
// highlights, ink-dark silhouettes. Same palette across all scenes so
// they read as "shots from the same film".

import type { SceneArtKey } from "@/lib/quiz-journey";

// ─── Shared palette ──────────────────────────────────────────────
const PAL = {
  night: "#1A1820",     // deep night sky / room shadow
  estate: "#0D0C12",    // estate silhouette
  candle: "#F8C75E",    // candle flame / lamp glow
  candleSoft: "#B8862F",// candle halo
  wall: "#3D362B",      // interior wall / wood
  ink: "#221E18",       // ink dark outlines
  cream: "#F8EDC8",     // paper, photograph mat
  bone: "#D6CDB6",      // mid-warm
  blood: "#7A2E2E",     // accent — rare, dramatic
  moon: "#EFE6CC",      // moon, mirror glint
} as const;

type Props = {
  scene: SceneArtKey;
  /** Render width in CSS pixels. Height auto via aspect ratio. */
  width?: number;
};

export function SceneIllustration({ scene, width = 320 }: Props) {
  // Common SVG props — pixelated rendering, integer-grid alignment.
  const aspectRatio = 5 / 3; // 30×18 viewBox cells
  const height = Math.round(width / aspectRatio);
  const wrapperStyle: React.CSSProperties = {
    width,
    height,
    imageRendering: "pixelated",
    display: "block",
    margin: "0 auto",
  };

  return (
    <svg
      viewBox="0 0 30 18"
      width={width}
      height={height}
      style={wrapperStyle}
      preserveAspectRatio="xMidYMid meet"
      shapeRendering="crispEdges"
      role="img"
      aria-label={SCENE_ALT[scene]}
    >
      {SCENES[scene]()}
    </svg>
  );
}

// ─── Per-scene rendering ─────────────────────────────────────────

const SCENES: Record<SceneArtKey, () => React.ReactNode> = {
  "estate-night": () => (
    <>
      {/* Sky */}
      <rect x={0} y={0} width={30} height={18} fill={PAL.night} />
      {/* Stars */}
      <rect x={3} y={2} width={1} height={1} fill={PAL.moon} />
      <rect x={7} y={1} width={1} height={1} fill={PAL.bone} />
      <rect x={11} y={3} width={1} height={1} fill={PAL.moon} />
      <rect x={26} y={2} width={1} height={1} fill={PAL.bone} />
      <rect x={22} y={4} width={1} height={1} fill={PAL.moon} />
      {/* Moon */}
      <rect x={23} y={2} width={3} height={3} fill={PAL.moon} />
      <rect x={22} y={3} width={1} height={1} fill={PAL.moon} />
      <rect x={26} y={3} width={1} height={1} fill={PAL.moon} />
      {/* Distant tree silhouettes */}
      <rect x={0} y={11} width={2} height={3} fill={PAL.estate} />
      <rect x={2} y={12} width={3} height={2} fill={PAL.estate} />
      <rect x={28} y={11} width={2} height={3} fill={PAL.estate} />
      {/* Estate silhouette */}
      <rect x={8} y={7} width={14} height={7} fill={PAL.estate} />
      <rect x={9} y={6} width={12} height={1} fill={PAL.estate} />
      <rect x={10} y={5} width={10} height={1} fill={PAL.estate} />
      {/* Estate windows — lit */}
      <rect x={10} y={9} width={1} height={1} fill={PAL.candle} />
      <rect x={13} y={9} width={1} height={1} fill={PAL.candle} />
      <rect x={16} y={9} width={1} height={1} fill={PAL.candle} />
      <rect x={19} y={9} width={1} height={1} fill={PAL.candle} />
      {/* Door */}
      <rect x={14} y={11} width={2} height={3} fill={PAL.wall} />
      <rect x={14} y={10} width={2} height={1} fill={PAL.candleSoft} />
      {/* Ground */}
      <rect x={0} y={14} width={30} height={4} fill={PAL.estate} />
      {/* Path */}
      <rect x={14} y={14} width={2} height={4} fill={PAL.wall} />
    </>
  ),

  "foyer-photograph": () => (
    <>
      {/* Wall */}
      <rect x={0} y={0} width={30} height={18} fill={PAL.wall} />
      {/* Wall panel */}
      <rect x={2} y={1} width={26} height={16} fill={PAL.night} />
      {/* Photograph frame (outer) */}
      <rect x={11} y={3} width={8} height={9} fill={PAL.candleSoft} />
      <rect x={12} y={4} width={6} height={7} fill={PAL.cream} />
      {/* Photograph content — silhouette of a hand reaching */}
      <rect x={13} y={5} width={4} height={2} fill={PAL.bone} />
      <rect x={14} y={7} width={2} height={2} fill={PAL.wall} />
      <rect x={13} y={9} width={3} height={1} fill={PAL.wall} />
      {/* Candle below */}
      <rect x={14} y={13} width={2} height={3} fill={PAL.candleSoft} />
      <rect x={14} y={12} width={2} height={1} fill={PAL.candle} />
      {/* Candle glow */}
      <rect x={13} y={12} width={1} height={1} fill={PAL.candleSoft} opacity={0.6} />
      <rect x={16} y={12} width={1} height={1} fill={PAL.candleSoft} opacity={0.6} />
      {/* Envelope on a small ledge */}
      <rect x={20} y={13} width={5} height={3} fill={PAL.cream} />
      <rect x={20} y={13} width={5} height={1} fill={PAL.bone} />
      <rect x={22} y={14} width={1} height={1} fill={PAL.blood} />
    </>
  ),

  "doctors-letter": () => (
    <>
      {/* Wall */}
      <rect x={0} y={0} width={30} height={18} fill={PAL.night} />
      {/* Bookshelf hint */}
      <rect x={0} y={0} width={4} height={11} fill={PAL.wall} />
      <rect x={26} y={0} width={4} height={11} fill={PAL.wall} />
      <rect x={0} y={2} width={4} height={1} fill={PAL.bone} />
      <rect x={0} y={5} width={4} height={1} fill={PAL.bone} />
      <rect x={0} y={8} width={4} height={1} fill={PAL.bone} />
      <rect x={26} y={2} width={4} height={1} fill={PAL.bone} />
      <rect x={26} y={5} width={4} height={1} fill={PAL.bone} />
      <rect x={26} y={8} width={4} height={1} fill={PAL.bone} />
      {/* Desk */}
      <rect x={4} y={11} width={22} height={4} fill={PAL.wall} />
      <rect x={5} y={15} width={2} height={3} fill={PAL.estate} />
      <rect x={23} y={15} width={2} height={3} fill={PAL.estate} />
      {/* Letter on desk */}
      <rect x={11} y={9} width={8} height={3} fill={PAL.cream} />
      {/* Ink lines */}
      <rect x={12} y={10} width={3} height={1} fill={PAL.ink} />
      <rect x={16} y={10} width={2} height={1} fill={PAL.ink} />
      <rect x={12} y={11} width={5} height={1} fill={PAL.ink} />
      {/* Inkwell */}
      <rect x={6} y={9} width={2} height={2} fill={PAL.estate} />
      <rect x={6} y={9} width={2} height={1} fill={PAL.blood} />
      {/* Fireplace (small, low) */}
      <rect x={21} y={7} width={5} height={4} fill={PAL.estate} />
      <rect x={22} y={9} width={3} height={2} fill={PAL.blood} />
      <rect x={23} y={9} width={1} height={1} fill={PAL.candle} />
    </>
  ),

  "library-fire": () => (
    <>
      {/* Wall */}
      <rect x={0} y={0} width={30} height={18} fill={PAL.night} />
      {/* Bookshelves on both sides, taller */}
      <rect x={0} y={0} width={5} height={14} fill={PAL.wall} />
      <rect x={25} y={0} width={5} height={14} fill={PAL.wall} />
      {[1, 3, 5, 7, 9, 11].map((y) => (
        <g key={y}>
          <rect x={0} y={y} width={5} height={1} fill={PAL.bone} />
          <rect x={25} y={y} width={5} height={1} fill={PAL.bone} />
        </g>
      ))}
      {/* Two chairs facing each other */}
      <rect x={7} y={9} width={4} height={5} fill={PAL.wall} />
      <rect x={7} y={8} width={4} height={1} fill={PAL.wall} />
      <rect x={19} y={9} width={4} height={5} fill={PAL.wall} />
      <rect x={19} y={8} width={4} height={1} fill={PAL.wall} />
      {/* Low table between */}
      <rect x={12} y={12} width={6} height={2} fill={PAL.wall} />
      {/* Two letter stacks on table */}
      <rect x={13} y={11} width={2} height={1} fill={PAL.cream} />
      <rect x={15} y={11} width={2} height={1} fill={PAL.cream} />
      {/* Fire at back, very small / low */}
      <rect x={14} y={6} width={2} height={2} fill={PAL.blood} />
      <rect x={14} y={5} width={2} height={1} fill={PAL.candle} />
      {/* Floor */}
      <rect x={0} y={14} width={30} height={4} fill={PAL.estate} />
    </>
  ),

  "mirror-room": () => (
    <>
      {/* Walls = mirrors, lighter */}
      <rect x={0} y={0} width={30} height={18} fill={PAL.night} />
      {/* Mirror panels */}
      <rect x={1} y={1} width={6} height={13} fill={PAL.bone} />
      <rect x={23} y={1} width={6} height={13} fill={PAL.bone} />
      <rect x={9} y={0} width={12} height={2} fill={PAL.bone} />
      {/* Mirror reflections — faint figure */}
      <rect x={3} y={6} width={2} height={4} fill={PAL.wall} />
      <rect x={25} y={6} width={2} height={4} fill={PAL.wall} />
      {/* Center table */}
      <rect x={12} y={11} width={6} height={3} fill={PAL.wall} />
      {/* Box on table */}
      <rect x={13} y={9} width={4} height={2} fill={PAL.estate} />
      {/* Brass button protruding */}
      <rect x={14} y={8} width={2} height={1} fill={PAL.candleSoft} />
      {/* Center figure (the user) */}
      <rect x={14} y={4} width={2} height={4} fill={PAL.estate} />
      {/* Floor */}
      <rect x={0} y={14} width={30} height={4} fill={PAL.estate} />
    </>
  ),

  "key-in-hand": () => (
    <>
      {/* Dark space */}
      <rect x={0} y={0} width={30} height={18} fill={PAL.night} />
      {/* Single candle glow on right */}
      <rect x={22} y={3} width={1} height={3} fill={PAL.candleSoft} />
      <rect x={22} y={2} width={1} height={1} fill={PAL.candle} />
      {/* Light pool */}
      <rect x={18} y={5} width={9} height={7} fill={PAL.wall} opacity={0.6} />
      {/* Hand silhouette holding key */}
      <rect x={9} y={9} width={5} height={3} fill={PAL.estate} />
      {/* Fingers */}
      <rect x={13} y={8} width={1} height={1} fill={PAL.estate} />
      <rect x={14} y={8} width={1} height={2} fill={PAL.estate} />
      {/* Key shaft */}
      <rect x={15} y={9} width={5} height={1} fill={PAL.candleSoft} />
      {/* Key bow (round end) */}
      <rect x={6} y={9} width={3} height={3} fill={PAL.estate} />
      <rect x={5} y={10} width={1} height={1} fill={PAL.estate} />
      <rect x={9} y={10} width={1} height={1} fill={PAL.estate} />
      {/* Key teeth */}
      <rect x={19} y={10} width={1} height={1} fill={PAL.candleSoft} />
      <rect x={18} y={10} width={1} height={1} fill={PAL.candleSoft} />
      {/* Floor */}
      <rect x={0} y={14} width={30} height={4} fill={PAL.estate} />
    </>
  ),
};

const SCENE_ALT: Record<SceneArtKey, string> = {
  "estate-night": "A grand estate at night under a full moon, lit windows glowing amber.",
  "foyer-photograph": "A candlelit foyer with a framed photograph on the wall and a sealed envelope on a ledge.",
  "doctors-letter": "A library study with a desk, an opened letter, an inkwell, and a low fire.",
  "library-fire": "A library with two facing chairs, a low table holding two stacks of letters, and a small fire.",
  "mirror-room": "A room with mirrored walls, a center table holding a wooden box with a brass button.",
  "key-in-hand": "A silhouetted hand offering a brass key, candlelight in the background.",
};
