// ArchetypeSprite — proper 16×16 pixel sprites for each of the 10
// archetypes. Replaces the smooth SVG figures from lib/figures.ts
// with hand-crafted pixel art that actually reads as 8-bit.
//
// Each sprite is a string array (16 rows × 16 chars) where:
//   '.' = transparent (no fill — shows the panel bg)
//   '#' = ink outline (#221E18)
//   '*' = archetype primary color
//   '+' = archetype deep color (shadow / detail)
//   '^' = archetype accent color (highlight)
//   '~' = archetype soft color (fill / glow)
//
// This approach lets me iterate quickly: edit the string grid, the
// renderer parses and emits SVG <rect> elements. Each sprite is
// ~50-120 rects; all 10 together render in <1ms.
//
// Sprites are intentionally symbolic, not portraits — each archetype
// gets a recognizable glyph (compass for the Cartographer, boat for
// the Keel, etc) instead of a face.

import { getArchetypeColor } from "@/lib/archetype-colors";

type SpriteGrid = readonly string[];

// ─── The Cartographer — compass star + a scroll ───────────────
const CARTOGRAPHER: SpriteGrid = [
  "................",
  ".......##.......",
  "......#**#......",
  ".....#****#.....",
  "....#******#....",
  "...#********#...",
  "....#******#....",
  ".....#****#.....",
  "......#**#......",
  ".......##.......",
  "................",
  "..###########...",
  "..#*********#...",
  "..#~~~~~~~~~#...",
  "..###########...",
  "................",
];

// ─── The Keel — small ship / anchor ──────────────────────────
const KEEL: SpriteGrid = [
  ".......#........",
  "......###.......",
  "......#*#.......",
  "......#*#.......",
  "......#*#.......",
  ".....#***#......",
  "....##***##.....",
  "...##*****##....",
  "...#*******#....",
  "...##*****##....",
  "....#######.....",
  "................",
  "....##...##.....",
  "....##...##.....",
  "...####.####....",
  "................",
];

// ─── The Threshold — archway with a candle ───────────────────
const THRESHOLD: SpriteGrid = [
  "....########....",
  "...#~~~~~~~~#...",
  "..#~~~####~~~#..",
  "..#~~#****#~~#..",
  ".#~~#******#~~#.",
  ".#~~#******#~~#.",
  ".#~~#******#~~#.",
  ".#~~#******#~~#.",
  ".#~~#***^**#~~#.",
  ".#~~#******#~~#.",
  ".#~~#******#~~#.",
  ".#~~#******#~~#.",
  ".#~~#******#~~#.",
  ".#~~#******#~~#.",
  ".#~~#******#~~#.",
  "................",
];

// ─── The Pilgrim — figure with staff ─────────────────────────
const PILGRIM: SpriteGrid = [
  "...........##...",
  "....###....#*#..",
  "...#***#...#*#..",
  "...#***#...#*#..",
  "....###....#*#..",
  "....#+#....#*#..",
  ".+++###++..#*#..",
  "++#####++.##*##.",
  ".+#***#+...#*#..",
  "..#***#....#*#..",
  "..#***#....#*#..",
  "..#***#....#*#..",
  "..#***#....#*#..",
  "..##.##....#*#..",
  ".###.###...#*#..",
  "................",
];

// ─── The Touchstone — gem in hand ────────────────────────────
const TOUCHSTONE: SpriteGrid = [
  "................",
  "......####......",
  ".....#^^^^#.....",
  "....#^****#.....",
  "....#*****#.....",
  "....#*****#.....",
  "....#*****#.....",
  ".....#***#......",
  "......#*#.......",
  ".......#........",
  "................",
  "..##.....##.....",
  ".#~~#...#~~#....",
  "#~~~##.#~~~#....",
  "#~~~~~#~~~~#....",
  ".##########.....",
];

// ─── The Hearth — hearth flame ───────────────────────────────
const HEARTH: SpriteGrid = [
  "................",
  ".......##.......",
  "......#^^#......",
  "......#^^#......",
  ".....#^*^#......",
  ".....#^**#......",
  "....#^***#......",
  "....#****#......",
  "...#******#.....",
  "...#******#.....",
  "..#********#....",
  "..#*+++++*#.....",
  "..##########....",
  ".#~~~~~~~~~~#...",
  ".############...",
  "................",
];

// ─── The Forge — hammer on anvil ─────────────────────────────
const FORGE: SpriteGrid = [
  "................",
  "................",
  ".......##.......",
  "......#*#.......",
  "......#*#.......",
  "....#######.....",
  "....#*****#.....",
  "....##***##.....",
  ".....#####......",
  "................",
  "...##########...",
  "..#**********#..",
  "...##########...",
  "....#######.....",
  ".....#####......",
  "................",
];

// ─── The Hammer — raised hammer ──────────────────────────────
const HAMMER: SpriteGrid = [
  "................",
  "...##########...",
  "...#**********..",
  "..#************.",
  "..#**+++++++**#.",
  "..#************.",
  "...#**********..",
  "....##########..",
  "........#.......",
  ".......#*#......",
  ".......#*#......",
  ".......#*#......",
  ".......#*#......",
  ".......#*#......",
  "......#####.....",
  "................",
];

// ─── The Garden — potted plant ───────────────────────────────
const GARDEN: SpriteGrid = [
  ".....##.........",
  "....#**#..##....",
  "...#****##**#...",
  "..#**^**#**^*#..",
  "..#****####**#..",
  "...#**##**##....",
  "....####**#.....",
  ".....#####......",
  "......#*#.......",
  "......#*#.......",
  "......#*#.......",
  "................",
  "..##########....",
  ".#~~~~~~~~~~#...",
  ".#~~~~~~~~~~#...",
  ".############...",
];

// ─── The Lighthouse — tower with beam ────────────────────────
const LIGHTHOUSE: SpriteGrid = [
  ".......##.......",
  "......####......",
  ".....#^^^^#.....",
  ".....#****#.....",
  "....##****##....",
  "....#******#....",
  "....##****##....",
  ".....######.....",
  ".....#****#.....",
  "....#******#....",
  "....#**++**#....",
  "....#******#....",
  "....#**++**#....",
  "...##********##.",
  "..##############",
  "................",
];

const SPRITES: Record<string, SpriteGrid> = {
  cartographer: CARTOGRAPHER,
  keel: KEEL,
  threshold: THRESHOLD,
  pilgrim: PILGRIM,
  touchstone: TOUCHSTONE,
  hearth: HEARTH,
  forge: FORGE,
  hammer: HAMMER,
  garden: GARDEN,
  lighthouse: LIGHTHOUSE,
};

type Props = {
  archetypeKey: string;
  /** Rendered pixel size (longest edge). Default 96. */
  size?: number;
  /** Slow chunky bob animation. */
  floating?: boolean;
  /** Wraps in a chunky pixel portrait frame. */
  framed?: boolean;
};

export function ArchetypeSprite({
  archetypeKey,
  size = 96,
  floating = false,
  framed = false,
}: Props) {
  const grid = SPRITES[archetypeKey];
  if (!grid) return null;
  const color = getArchetypeColor(archetypeKey);

  // Map glyph → fill. Transparent stays transparent (no rect emitted).
  const fill: Record<string, string> = {
    "#": "#221E18",
    "*": color.primary,
    "+": color.deep,
    "^": color.accent,
    "~": color.soft,
  };

  const rects: React.ReactNode[] = [];
  for (let y = 0; y < grid.length; y++) {
    const row = grid[y];
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      const f = fill[ch];
      if (!f) continue;
      rects.push(
        <rect
          key={`${x}-${y}`}
          x={x}
          y={y}
          width={1}
          height={1}
          fill={f}
        />,
      );
    }
  }

  const inner = (
    <svg
      viewBox="0 0 16 16"
      width={size}
      height={size}
      shapeRendering="crispEdges"
      className={floating ? "pixel-float" : undefined}
      style={{ imageRendering: "pixelated", display: "block" }}
      aria-hidden
    >
      {rects}
    </svg>
  );

  if (!framed) return inner;

  return (
    <div
      className="inline-block"
      style={{
        padding: 4,
        background: "#FFFCF4",
        boxShadow: `4px 4px 0 0 ${color.deep}`,
        border: `2px solid ${color.deep}`,
      }}
    >
      {inner}
    </div>
  );
}
