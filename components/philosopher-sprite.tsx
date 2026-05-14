// PhilosopherSprite — procedural 16×16 pixel sprite seeded by the
// philosopher's name. Same name always produces the same sprite, so
// Plato is consistently Plato and Buddha is consistently Buddha.
//
// What it draws:
//   - A small pixel "head" (8 pixels wide, 5 tall) that varies in
//     style (round, square, triangular hat, hooded, crowned, etc)
//   - Eyes (single dot or pair)
//   - A torso stripe in the philosopher's archetype color
//   - Optional accessories (beard, scroll, lantern) seeded by hash
//
// All sprites share the same 16×16 grid + same anatomy slots, so the
// roster reads as a coherent set ("characters in the same game").
//
// Used by:
//   - Today's-thinker section on /home (size 96, floating)
//   - Constellation hover tooltip (size 64, floating)
//   - Quiz/result pages (later)

import { ARCHETYPE_COLORS, DEFAULT_ARCHETYPE_COLOR } from "@/lib/archetype-colors";

type Props = {
  /** Philosopher's full name. Determines the sprite via hash. */
  name: string;
  /** Archetype key — drives the body-color palette. */
  archetypeKey?: string;
  /** Rendered pixel size of the longest edge. Default 64. */
  size?: number;
  /** If true, applies the slow chunky bob animation. */
  floating?: boolean;
  /** Wraps the sprite in a circular cream "portrait" ring. */
  framed?: boolean;
};

// Simple deterministic string hash — FNV-1a 32-bit. Same string in,
// same number out, no allocation, fast. Used as a seed source.
function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Pseudo-random number generator — mulberry32. Tiny + fast + good
// enough for "pick from a list" decisions.
function makeRng(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6D2B79F5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Pick from an array using the rng.
function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

// Sprite anatomy.  Each "head" + "torso" + "accessory" is a list of
// pixel positions on a 16×16 grid. Composed by the renderer below.
//
// Coordinate system: x in [0, 15], y in [0, 15]. Origin top-left.
//
// Heads occupy roughly y = 2..7. Torso y = 8..14. Accessories sprinkle
// where they fit.

type Px = [x: number, y: number];

const HEADS: Record<string, Px[]> = {
  // Round bare head
  round: rect(5, 3, 6, 4).concat([[6, 2], [9, 2], [4, 4], [11, 4]]),
  // Square head
  square: rect(5, 3, 6, 5),
  // Hooded — covers ears + neck
  hooded: rect(4, 2, 8, 6).concat([[3, 5], [12, 5]]),
  // Crowned (single pointy crown segment in middle)
  crowned: rect(5, 3, 6, 4).concat([
    [7, 1], [8, 1],
    [7, 2], [8, 2],
  ]),
  // Pointy hat (philosopher hat / wizard / pyramid)
  pointed: rect(5, 4, 6, 3).concat([
    [7, 0], [8, 0],
    [7, 1], [8, 1],
    [6, 2], [7, 2], [8, 2], [9, 2],
    [5, 3], [10, 3],
  ]),
  // Top-hat (Hegel etc)
  topHat: rect(5, 4, 6, 3).concat(
    rect(5, 1, 6, 2).concat([
      [4, 3], [5, 3], [6, 3], [7, 3], [8, 3], [9, 3], [10, 3], [11, 3],
    ]),
  ),
};

const HAIR_STYLES: Record<string, Px[]> = {
  bald: [],
  fringe: [[5, 3], [6, 3], [7, 3], [8, 3], [9, 3], [10, 3]],
  long: [
    [4, 3], [4, 4], [4, 5], [4, 6], [4, 7],
    [11, 3], [11, 4], [11, 5], [11, 6], [11, 7],
  ],
  poof: [[5, 2], [6, 2], [9, 2], [10, 2], [4, 3], [11, 3]],
};

const BEARDS: Record<string, Px[]> = {
  none: [],
  short: [[6, 7], [7, 7], [8, 7], [9, 7]],
  long: [
    [6, 7], [7, 7], [8, 7], [9, 7],
    [7, 8], [8, 8],
    [7, 9], [8, 9],
  ],
  pointy: [[6, 7], [7, 7], [8, 7], [9, 7], [7, 8], [8, 8], [7, 9]],
};

// Eye positions — single eye (cyclops, blind, contemplative) or pair.
const EYE_STYLES: Record<string, Px[]> = {
  pair: [[6, 5], [9, 5]],
  closed: [[6, 5], [7, 5], [9, 5], [10, 5]],
  single: [[7, 5], [8, 5]],
};

// Torso shapes — fills 8..14 y range.
const TORSO_BODY: Px[] = rect(4, 9, 8, 5);
const TORSO_COLLAR: Px[] = [[5, 8], [10, 8]];

// Accessories — overlap on top of body.
const ACCESSORIES: Record<string, Px[]> = {
  none: [],
  scroll: [[3, 11], [3, 12], [12, 11], [12, 12]],     // sleeves/scroll
  necklace: [[7, 9], [8, 9]],                          // small medallion
  cape: [[3, 9], [12, 9], [3, 10], [12, 10], [3, 11], [12, 11]],
};

function rect(x: number, y: number, w: number, h: number): Px[] {
  const out: Px[] = [];
  for (let i = 0; i < w; i++) for (let j = 0; j < h; j++) out.push([x + i, y + j]);
  return out;
}

// Resolve a sprite spec deterministically from name.
function specFor(name: string) {
  const seed = hash(name.toLowerCase());
  const rng = makeRng(seed);
  return {
    head: pick(rng, ["round", "square", "hooded", "crowned", "pointed", "topHat"]),
    hair: pick(rng, ["bald", "fringe", "long", "poof", "bald", "fringe"]), // bias toward less hair
    beard: pick(rng, ["none", "short", "long", "pointy", "none"]),         // ~25% beardless
    eyes: pick(rng, ["pair", "pair", "pair", "closed", "single"]),
    accessory: pick(rng, ["none", "scroll", "necklace", "cape", "none", "none"]),
  };
}

export function PhilosopherSprite({
  name,
  archetypeKey,
  size = 64,
  floating = false,
  framed = false,
}: Props) {
  const spec = specFor(name);
  const color =
    archetypeKey && ARCHETYPE_COLORS[archetypeKey]
      ? ARCHETYPE_COLORS[archetypeKey]
      : DEFAULT_ARCHETYPE_COLOR;

  // Layered pixel set — z-order matters for things like beard
  // sitting on top of the head.
  const skin = "#E8C99B";       // a generic warm skin pixel — same for everyone
  const inkLine = "#221E18";
  const hairColor = "#3E2818";
  const eyeColor = "#221E18";
  const bodyColor = color.primary;
  const collarColor = color.deep;
  const accessoryColor = color.accent;
  const bgColor = color.soft;

  const layers: Array<{ pixels: Px[]; fill: string }> = [
    // 1. Soft halo background — single fill in the soft archetype tint
    { pixels: rect(0, 0, 16, 16), fill: bgColor },
    // 2. Head silhouette — outline ink, fill skin (handled below by
    //    drawing in two passes to keep this simple we just use ink as
    //    a 1-pixel border by drawing the head pixels in the ink color
    //    first and the skin pixels inset by 1 — too fiddly. Skin only.)
    { pixels: HEADS[spec.head], fill: skin },
    // 3. Hair on top of head
    { pixels: HAIR_STYLES[spec.hair], fill: hairColor },
    // 4. Eyes
    { pixels: EYE_STYLES[spec.eyes], fill: eyeColor },
    // 5. Beard
    { pixels: BEARDS[spec.beard], fill: hairColor },
    // 6. Torso body
    { pixels: TORSO_BODY, fill: bodyColor },
    // 7. Collar accent
    { pixels: TORSO_COLLAR, fill: collarColor },
    // 8. Accessory (cape/scroll/necklace)
    { pixels: ACCESSORIES[spec.accessory], fill: accessoryColor },
  ];

  const inner = (
    <svg
      viewBox="0 0 16 16"
      width={size}
      height={size}
      shapeRendering="crispEdges"
      className={floating ? "pixel-float" : undefined}
      aria-hidden
      style={{
        imageRendering: "pixelated",
        display: "block",
      }}
    >
      {layers.map((layer, i) =>
        layer.pixels.map(([x, y], j) => (
          <rect
            key={`${i}-${j}`}
            x={x}
            y={y}
            width={1}
            height={1}
            fill={layer.fill}
          />
        )),
      )}
    </svg>
  );

  if (!framed) return inner;

  // Frame variant — wraps the sprite in a chunky pixel-bordered
  // square portrait, matching the .pixel-panel aesthetic.
  return (
    <div
      className="inline-block"
      style={{
        padding: 4,
        background: "#FFFCF4",
        boxShadow: `4px 4px 0 0 ${inkLine}`,
        border: `2px solid ${inkLine}`,
      }}
    >
      {inner}
    </div>
  );
}
