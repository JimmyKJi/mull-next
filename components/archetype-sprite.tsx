// ArchetypeSprite — detailed "64-bit" pixel sprites for each of the 10
// archetypes. Replaces the crude 16×16 glyphs (and, before those, the
// smooth SVG figures in lib/figures.ts) with richer 32×32 shaded pixel
// art that actually reads as the thing it depicts.
//
// HOW IT WORKS
// Each sprite is built from shape primitives (rect / line / circle /
// polygon) onto a 32×32 char grid, then an auto-outline pass inks every
// empty pixel that touches a colored one. This is the trick that
// "de-crudes" pixel art: hand-placed primitives give clean silhouettes,
// the outline pass gives a cohesive 8-bit edge, and a 3-tone shading
// convention (highlight / body / shadow) gives depth. The grids are
// computed once at module load, then the renderer walks each row and
// emits run-length-merged <rect>s.
//
// Glyph → fill (see `FILL` below):
//   '.' transparent   '#' ink outline (#221E18)
//   '*' primary        '+' deep (shadow)
//   '^' accent (highlight)   '~' soft (glow / light)
//
// The four color glyphs resolve per-archetype via lib/archetype-colors.
// Symbols are intentionally iconic, not portraits: a compass for the
// Cartographer, an anvil for the Forge, a hammer for the Hammer, etc —
// and Forge (anvil) vs Hammer (hammer) read as opposites, not twins.
//
// To tweak a sprite, edit its build function and the change shows up
// everywhere the component is used. Keep edits inside the 32×32 grid.

import { getArchetypeColor } from '@/lib/archetype-colors';

type SpriteGrid = readonly string[];
type Cell = string;

// ─── pixel-art primitives ─────────────────────────────────────
const GRID_N = 32;

function makeGrid(n = GRID_N): Cell[][] {
  return Array.from({ length: n }, () => Array.from({ length: n }, () => '.'));
}
function inBounds(g: Cell[][], x: number, y: number): boolean {
  return y >= 0 && y < g.length && x >= 0 && x < g[0].length;
}
function setPx(g: Cell[][], x: number, y: number, c: Cell): void {
  x = Math.round(x);
  y = Math.round(y);
  if (inBounds(g, x, y)) g[y][x] = c;
}
function fillRect(g: Cell[][], x: number, y: number, w: number, h: number, c: Cell): void {
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) setPx(g, x + i, y + j, c);
}
function drawLine(g: Cell[][], x0: number, y0: number, x1: number, y1: number, c: Cell): void {
  x0 = Math.round(x0);
  y0 = Math.round(y0);
  x1 = Math.round(x1);
  y1 = Math.round(y1);
  const dx = Math.abs(x1 - x0),
    dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1,
    sy = y0 < y1 ? 1 : -1;
  let e = dx + dy;
  for (;;) {
    setPx(g, x0, y0, c);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * e;
    if (e2 >= dy) {
      e += dy;
      x0 += sx;
    }
    if (e2 <= dx) {
      e += dx;
      y0 += sy;
    }
  }
}
function fillCircle(g: Cell[][], cx: number, cy: number, r: number, c: Cell): void {
  for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++)
    for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++)
      if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r) setPx(g, x, y, c);
}
function ring(g: Cell[][], cx: number, cy: number, r: number, c: Cell, t = 1): void {
  for (let y = Math.floor(cy - r - 1); y <= Math.ceil(cy + r + 1); y++)
    for (let x = Math.floor(cx - r - 1); x <= Math.ceil(cx + r + 1); x++) {
      const d = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      if (d <= r + 0.4 && d >= r - t + 0.6) setPx(g, x, y, c);
    }
}
function fillPoly(g: Cell[][], pts: ReadonlyArray<readonly [number, number]>, c: Cell): void {
  const ys = pts.map((p) => p[1]);
  const y0 = Math.floor(Math.min(...ys)),
    y1 = Math.ceil(Math.max(...ys));
  for (let y = y0; y <= y1; y++) {
    const xs: number[] = [];
    for (let i = 0; i < pts.length; i++) {
      const [ax, ay] = pts[i];
      const [bx, by] = pts[(i + 1) % pts.length];
      if ((ay <= y && by > y) || (by <= y && ay > y))
        xs.push(ax + ((y - ay) / (by - ay)) * (bx - ax));
    }
    xs.sort((a, b) => a - b);
    for (let k = 0; k + 1 < xs.length; k += 2)
      for (let x = Math.round(xs[k]); x <= Math.round(xs[k + 1]); x++) setPx(g, x, y, c);
  }
}
// Auto-outline: any transparent pixel orthogonally adjacent to a non-ink
// colored pixel becomes ink. Run this AFTER the body, BEFORE stray
// single-pixel details (sparks) so those stay un-outlined.
function outline(g: Cell[][], c: Cell = '#'): void {
  const add: Array<[number, number]> = [];
  const n = g.length,
    m = g[0].length;
  for (let y = 0; y < n; y++)
    for (let x = 0; x < m; x++) {
      if (g[y][x] !== '.') continue;
      if (
        (x > 0 && g[y][x - 1] !== '.' && g[y][x - 1] !== c) ||
        (x < m - 1 && g[y][x + 1] !== '.' && g[y][x + 1] !== c) ||
        (y > 0 && g[y - 1][x] !== '.' && g[y - 1][x] !== c) ||
        (y < n - 1 && g[y + 1][x] !== '.' && g[y + 1][x] !== c)
      )
        add.push([x, y]);
    }
  for (const [x, y] of add) g[y][x] = c;
}
function toRows(g: Cell[][]): SpriteGrid {
  return g.map((r) => r.join(''));
}

// ─── the 10 sprites ───────────────────────────────────────────

// Cartographer — compass: dial, bezel, 4-point star (NW lit, SE shaded).
function buildCartographer(): SpriteGrid {
  const g = makeGrid();
  fillCircle(g, 16, 16, 13, '~');
  ring(g, 16, 16, 13, '+', 2);
  ring(g, 16, 16, 11, '^', 1);
  fillPoly(
    g,
    [
      [16, 4],
      [18, 15],
      [16, 15],
      [14, 15],
    ],
    '^',
  );
  fillPoly(
    g,
    [
      [16, 28],
      [14, 17],
      [16, 17],
      [18, 17],
    ],
    '+',
  );
  fillPoly(
    g,
    [
      [28, 16],
      [17, 14],
      [17, 16],
      [17, 18],
    ],
    '*',
  );
  fillPoly(
    g,
    [
      [4, 16],
      [15, 18],
      [15, 16],
      [15, 14],
    ],
    '^',
  );
  fillCircle(g, 16, 16, 2, '#');
  setPx(g, 16, 16, '^');
  setPx(g, 16, 3, '#');
  setPx(g, 16, 29, '#');
  setPx(g, 3, 16, '#');
  setPx(g, 29, 16, '#');
  outline(g, '#');
  ring(g, 16, 16, 14, '#', 1);
  return toRows(g);
}

// Keel — anchor: ring, shank, stock, curved flukes.
function buildKeel(): SpriteGrid {
  const g = makeGrid();
  ring(g, 16, 6, 3, '*', 2);
  fillRect(g, 15, 8, 3, 17, '*');
  fillRect(g, 17, 8, 1, 17, '+');
  fillRect(g, 15, 8, 1, 17, '^');
  fillRect(g, 9, 11, 14, 2, '*');
  fillRect(g, 9, 12, 14, 1, '+');
  fillRect(g, 9, 11, 14, 1, '^');
  for (let x = 7; x <= 25; x++) {
    const u = 81 - (x - 16) ** 2;
    if (u < 0) continue;
    const y = 17 + Math.sqrt(u);
    setPx(g, x, Math.round(y), '*');
    setPx(g, x, Math.round(y) - 1, '*');
    setPx(g, x, Math.round(y) + 1, '+');
  }
  fillPoly(
    g,
    [
      [7, 22],
      [4, 18],
      [10, 16],
    ],
    '*',
  );
  fillPoly(
    g,
    [
      [25, 22],
      [28, 18],
      [22, 16],
    ],
    '*',
  );
  outline(g, '#');
  return toRows(g);
}

// Threshold — arched doorway with light beyond, opening to the base.
function buildThreshold(): SpriteGrid {
  const g = makeGrid();
  fillRect(g, 8, 13, 16, 15, '*');
  fillCircle(g, 16, 13, 8, '*');
  fillRect(g, 8, 13, 2, 15, '^');
  fillRect(g, 22, 13, 2, 15, '+');
  fillRect(g, 12, 15, 8, 13, '~');
  fillCircle(g, 16, 15, 4, '~');
  fillCircle(g, 16, 19, 2, '^');
  fillRect(g, 6, 28, 20, 3, '+');
  fillRect(g, 6, 28, 20, 1, '*');
  outline(g, '#');
  return toRows(g);
}

// Pilgrim — robed figure gripping a vertical staff.
function buildPilgrim(): SpriteGrid {
  const g = makeGrid();
  fillRect(g, 21, 4, 2, 25, '+');
  setPx(g, 21, 4, '^');
  fillCircle(g, 22, 4, 2, '*');
  fillCircle(g, 13, 9, 3.5, '~');
  fillPoly(
    g,
    [
      [13, 12],
      [7, 29],
      [19, 29],
    ],
    '*',
  );
  fillRect(g, 7, 28, 12, 2, '*');
  fillPoly(
    g,
    [
      [13, 12],
      [7, 29],
      [9, 29],
    ],
    '^',
  );
  fillPoly(
    g,
    [
      [13, 12],
      [17, 29],
      [19, 29],
    ],
    '+',
  );
  fillRect(g, 16, 16, 5, 2, '*');
  outline(g, '#');
  return toRows(g);
}

// Touchstone — faceted gem: lit table, shadowed lower facets, facet lines.
function buildTouchstone(): SpriteGrid {
  const g = makeGrid();
  fillPoly(
    g,
    [
      [10, 11],
      [22, 11],
      [26, 17],
      [16, 28],
      [6, 17],
    ],
    '*',
  );
  fillPoly(
    g,
    [
      [10, 11],
      [22, 11],
      [19, 17],
      [13, 17],
    ],
    '^',
  );
  fillPoly(
    g,
    [
      [6, 17],
      [13, 17],
      [16, 28],
    ],
    '+',
  );
  fillPoly(
    g,
    [
      [16, 28],
      [19, 17],
      [26, 17],
    ],
    '+',
  );
  drawLine(g, 6, 17, 26, 17, '+');
  drawLine(g, 13, 17, 16, 28, '+');
  drawLine(g, 19, 17, 16, 28, '+');
  drawLine(g, 10, 11, 13, 17, '+');
  drawLine(g, 22, 11, 19, 17, '+');
  setPx(g, 12, 13, '~');
  setPx(g, 11, 14, '~');
  outline(g, '#');
  return toRows(g);
}

// Hearth — flame with an inner glow over a hearthstone.
function buildHearth(): SpriteGrid {
  const g = makeGrid();
  fillPoly(
    g,
    [
      [16, 4],
      [21, 12],
      [22, 20],
      [16, 26],
      [10, 20],
      [11, 13],
      [14, 10],
    ],
    '*',
  );
  fillCircle(g, 16, 20, 6, '*');
  fillCircle(g, 16, 21, 4, '^');
  fillCircle(g, 16, 22, 2, '~');
  fillRect(g, 8, 26, 16, 4, '+');
  fillRect(g, 8, 26, 16, 1, '*');
  outline(g, '#');
  setPx(g, 12, 6, '~');
  setPx(g, 20, 7, '~');
  return toRows(g);
}

// Forge — anvil (horn, face, waist, base) with a glowing billet + embers.
function buildForge(): SpriteGrid {
  const g = makeGrid();
  fillRect(g, 6, 24, 20, 4, '*');
  fillRect(g, 6, 27, 20, 1, '+');
  fillRect(g, 12, 20, 8, 5, '*');
  fillRect(g, 18, 20, 2, 5, '+');
  fillPoly(
    g,
    [
      [6, 14],
      [24, 14],
      [24, 19],
      [12, 19],
    ],
    '*',
  );
  fillPoly(
    g,
    [
      [6, 14],
      [12, 19],
      [2, 17],
    ],
    '*',
  );
  fillRect(g, 6, 14, 18, 1, '^');
  fillRect(g, 6, 18, 18, 1, '+');
  fillRect(g, 12, 11, 7, 3, '^');
  fillRect(g, 13, 11, 5, 1, '~');
  outline(g, '#');
  setPx(g, 12, 9, '^');
  setPx(g, 16, 7, '~');
  setPx(g, 20, 9, '^');
  setPx(g, 22, 6, '~');
  setPx(g, 15, 5, '~');
  return toRows(g);
}

// Hammer — chunky sledgehammer: heavy head with striking faces + eye.
function buildHammer(): SpriteGrid {
  const g = makeGrid();
  fillRect(g, 15, 12, 3, 17, '*');
  fillRect(g, 17, 12, 1, 17, '+');
  fillRect(g, 15, 12, 1, 17, '^');
  fillRect(g, 8, 6, 16, 9, '*');
  fillRect(g, 8, 6, 16, 1, '^');
  fillRect(g, 8, 14, 16, 1, '+');
  fillRect(g, 8, 6, 3, 9, '+');
  fillRect(g, 21, 6, 3, 9, '+');
  fillRect(g, 8, 6, 1, 9, '^');
  fillRect(g, 13, 8, 6, 5, '+');
  outline(g, '#');
  return toRows(g);
}

// Garden — potted plant: three leaves, stem, rimmed pot.
function buildGarden(): SpriteGrid {
  const g = makeGrid();
  fillPoly(
    g,
    [
      [16, 5],
      [12, 15],
      [16, 19],
    ],
    '^',
  );
  fillPoly(
    g,
    [
      [16, 5],
      [20, 15],
      [16, 19],
    ],
    '*',
  );
  fillPoly(
    g,
    [
      [10, 9],
      [6, 17],
      [15, 16],
    ],
    '*',
  );
  fillPoly(
    g,
    [
      [22, 9],
      [26, 17],
      [17, 16],
    ],
    '*',
  );
  fillRect(g, 15, 15, 2, 7, '+');
  fillPoly(
    g,
    [
      [9, 22],
      [23, 22],
      [20, 30],
      [12, 30],
    ],
    '+',
  );
  fillRect(g, 8, 21, 16, 2, '*');
  fillRect(g, 9, 22, 1, 8, '^');
  outline(g, '#');
  return toRows(g);
}

// Lighthouse — tapered banded tower, lantern room, roof, light + beams.
function buildLighthouse(): SpriteGrid {
  const g = makeGrid();
  fillPoly(
    g,
    [
      [12, 12],
      [20, 12],
      [22, 28],
      [10, 28],
    ],
    '*',
  );
  fillRect(g, 11, 16, 11, 2, '+');
  fillRect(g, 10, 22, 12, 2, '+');
  fillPoly(
    g,
    [
      [12, 12],
      [14, 12],
      [12, 28],
      [10, 28],
    ],
    '^',
  );
  fillRect(g, 12, 7, 8, 5, '~');
  fillCircle(g, 16, 9, 2, '^');
  fillPoly(
    g,
    [
      [11, 7],
      [21, 7],
      [16, 3],
    ],
    '+',
  );
  fillRect(g, 8, 28, 16, 2, '+');
  fillRect(g, 8, 28, 16, 1, '*');
  outline(g, '#');
  setPx(g, 24, 8, '^');
  setPx(g, 26, 7, '~');
  setPx(g, 8, 8, '^');
  setPx(g, 6, 7, '~');
  return toRows(g);
}

const SPRITES: Record<string, SpriteGrid> = {
  cartographer: buildCartographer(),
  keel: buildKeel(),
  threshold: buildThreshold(),
  pilgrim: buildPilgrim(),
  touchstone: buildTouchstone(),
  hearth: buildHearth(),
  forge: buildForge(),
  hammer: buildHammer(),
  garden: buildGarden(),
  lighthouse: buildLighthouse(),
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
  const FILL: Record<string, string> = {
    '#': '#221E18',
    '*': color.primary,
    '+': color.deep,
    '^': color.accent,
    '~': color.soft,
  };

  const n = grid.length;
  // Emit run-length-merged rects: consecutive same-fill pixels in a row
  // collapse into one <rect>, keeping crisp pixels but ~3× fewer nodes.
  const rects: React.ReactNode[] = [];
  for (let y = 0; y < n; y++) {
    const row = grid[y];
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      const f = FILL[ch];
      if (!f) {
        x++;
        continue;
      }
      let run = 1;
      while (x + run < row.length && row[x + run] === ch) run++;
      rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={run} height={1} fill={f} />);
      x += run;
    }
  }

  const inner = (
    <svg
      viewBox={`0 0 ${n} ${n}`}
      width={size}
      height={size}
      shapeRendering="crispEdges"
      className={floating ? 'pixel-float' : undefined}
      style={{ imageRendering: 'pixelated', display: 'block' }}
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
        background: '#FFFCF4',
        boxShadow: `4px 4px 0 0 ${color.deep}`,
        border: `2px solid ${color.deep}`,
      }}
    >
      {inner}
    </div>
  );
}
