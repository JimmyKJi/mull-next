// 16-D → 2-D projection for the constellation map.
//
// The two axes are hand-picked combinations of dimensions that
// create a philosophically meaningful spread. Not principal-
// component analysis (which would be more rigorous but harder to
// interpret) — instead, axes designed for "you can read them":
//
//   X axis: theoretical / abstract  ←→  embodied / practical
//           (TR + TD + UI) − (TE + ES + PO)
//
//   Y axis: sovereign self          ←→  communal embeddedness
//           (SS + WP) − (CE + RT)
//
// This gives the classic four-quadrant philosophical map. Top-right
// (Nietzsche, Sartre) is abstract + individual. Top-left (Aristotle,
// Confucius, Burke) is abstract + communal. Bottom-right (Epicurus,
// some contemporary feminists) is embodied + individual. Bottom-left
// (Buddhists, ecological thinkers) is embodied + communal.
//
// Projections are normalized to roughly [-1, 1] using bounds computed
// once over the entire PHILOSOPHERS cloud. New entries that fall
// outside the bounds clip — that's fine, it preserves the map's
// established frame.

import { DIM_KEYS, type DimKey } from "./dimensions";
import { PHILOSOPHERS } from "./philosophers";

// Map a DimKey → its index in DIM_KEYS for fast lookups.
const DIM_INDEX: Record<DimKey, number> = DIM_KEYS.reduce(
  (acc, k, i) => {
    acc[k] = i;
    return acc;
  },
  {} as Record<DimKey, number>,
);

function dim(vec: number[], k: DimKey): number {
  return vec[DIM_INDEX[k]] ?? 0;
}

/**
 * Raw 2-D projection of a 16-D vector, before normalization. Returned
 * units are arbitrary — feed into normalizeProjection() to map into
 * the standard [-1, 1] frame established by the philosopher cloud.
 */
export function projectRaw(vector: number[]): [number, number] {
  const x =
    dim(vector, "TR") +
    dim(vector, "TD") +
    dim(vector, "UI") -
    dim(vector, "TE") -
    dim(vector, "ES") -
    dim(vector, "PO");

  const y =
    dim(vector, "SS") + dim(vector, "WP") - dim(vector, "CE") - dim(vector, "RT");

  return [x, y];
}

/**
 * Raw 3-D projection. X and Y match projectRaw above; Z adds a third
 * axis: skeptical ↔ mystical. Picked because SR and MR don't appear
 * in the other two axes (orthogonal), and the tension between
 * skeptical-empirical and mystical-receptive is one of the cleanest
 * splits in the canon — Hume vs Eckhart, Sextus vs Buddha,
 * Wittgenstein straddles it.
 */
export function projectRaw3D(vector: number[]): [number, number, number] {
  const [x, y] = projectRaw(vector);
  const z = dim(vector, "SR") - dim(vector, "MR");
  return [x, y, z];
}

// Compute the cloud bounds once at module load time. Used to map
// raw projections into a consistent [-1, 1] frame across all
// surfaces.
const BOUNDS = (() => {
  let xMin = Infinity;
  let xMax = -Infinity;
  let yMin = Infinity;
  let yMax = -Infinity;
  let zMin = Infinity;
  let zMax = -Infinity;
  for (const p of PHILOSOPHERS) {
    const [x, y, z] = projectRaw3D(p.vector);
    if (x < xMin) xMin = x;
    if (x > xMax) xMax = x;
    if (y < yMin) yMin = y;
    if (y > yMax) yMax = y;
    if (z < zMin) zMin = z;
    if (z > zMax) zMax = z;
  }
  // Small inset so points don't render flush against the edges.
  const xPad = (xMax - xMin) * 0.04;
  const yPad = (yMax - yMin) * 0.04;
  const zPad = (zMax - zMin) * 0.04;
  return {
    xMin: xMin - xPad,
    xMax: xMax + xPad,
    yMin: yMin - yPad,
    yMax: yMax + yPad,
    zMin: zMin - zPad,
    zMax: zMax + zPad,
  };
})();

/**
 * Normalize a raw projection into [-1, 1] using the bounds computed
 * over the philosopher cloud. Returns clamped values so out-of-range
 * inputs don't leak outside the established frame.
 */
export function normalizeProjection(raw: [number, number]): [number, number] {
  const [x, y] = raw;
  const nx = ((x - BOUNDS.xMin) / (BOUNDS.xMax - BOUNDS.xMin)) * 2 - 1;
  const ny = ((y - BOUNDS.yMin) / (BOUNDS.yMax - BOUNDS.yMin)) * 2 - 1;
  return [clamp(nx, -1, 1), clamp(ny, -1, 1)];
}

/**
 * Convenience: raw + normalize in one call. Returns the normalized
 * (x, y) — both in [-1, 1].
 */
export function projectTo2D(vector: number[]): [number, number] {
  return normalizeProjection(projectRaw(vector));
}

/**
 * Normalize a raw 3-D projection into the [-1, 1] cube using cloud
 * bounds for all three axes.
 */
export function normalizeProjection3D(
  raw: [number, number, number],
): [number, number, number] {
  const [x, y, z] = raw;
  const nx = ((x - BOUNDS.xMin) / (BOUNDS.xMax - BOUNDS.xMin)) * 2 - 1;
  const ny = ((y - BOUNDS.yMin) / (BOUNDS.yMax - BOUNDS.yMin)) * 2 - 1;
  const nz = ((z - BOUNDS.zMin) / (BOUNDS.zMax - BOUNDS.zMin)) * 2 - 1;
  return [clamp(nx, -1, 1), clamp(ny, -1, 1), clamp(nz, -1, 1)];
}

/** Convenience: raw + normalize in 3D, returns (x, y, z) in [-1, 1]. */
export function projectTo3D(vector: number[]): [number, number, number] {
  return normalizeProjection3D(projectRaw3D(vector));
}

/** Pre-computed positions for the entire philosopher cloud. Cached
 *  at module load — re-importing is a constant cost. */
export const PHILOSOPHER_POSITIONS: ReadonlyArray<{
  name: string;
  dates: string;
  keyIdea: string;
  archetypeKey: string;
  slug: string;
  x: number;
  y: number;
}> = PHILOSOPHERS.map((p) => {
  const [x, y] = projectTo2D(p.vector);
  return {
    name: p.name,
    dates: p.dates,
    keyIdea: p.keyIdea,
    archetypeKey: p.archetypeKey,
    slug: p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    x,
    y,
  };
});

/** Pre-computed 3-D positions for the full cloud. Same shape as the
 *  2D version with a `z` added. Used by the R3F constellation. */
export const PHILOSOPHER_POSITIONS_3D: ReadonlyArray<{
  name: string;
  dates: string;
  keyIdea: string;
  archetypeKey: string;
  slug: string;
  x: number;
  y: number;
  z: number;
}> = PHILOSOPHERS.map((p) => {
  const [x, y, z] = projectTo3D(p.vector);
  return {
    name: p.name,
    dates: p.dates,
    keyIdea: p.keyIdea,
    archetypeKey: p.archetypeKey,
    slug: p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    x,
    y,
    z,
  };
});

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}
