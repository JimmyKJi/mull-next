// Vector math + flavor selection — TypeScript port of the helpers in
// public/mull.html. Pure functions, no DOM or React.
//
// The 16-D model is defined in lib/dimensions.ts. Vectors here are
// always `number[]` of length 16, in DIM_KEYS order. Anywhere a
// vector is constructed, prefer `v({TR:3, SS:2})` — it's the same
// shorthand mull.html uses, and it gives compile-time key safety.

import { DIM_KEYS, type DimKey } from "./dimensions";

/** Build a 16-D vector from a partial `{ DIM: weight }` object.
 *  Missing dimensions default to 0. Same shape as mull.html's `v()`. */
export function v(o: Partial<Record<DimKey, number>>): number[] {
  return DIM_KEYS.map((k) => o[k] ?? 0);
}

/** A zero vector of length 16. */
export function zeros(): number[] {
  return DIM_KEYS.map(() => 0);
}

/** Element-wise add two vectors. Assumes same length. */
export function add(a: number[], b: number[]): number[] {
  return a.map((x, i) => x + b[i]);
}

/** Multiply vector by scalar. */
export function scale(a: number[], s: number): number[] {
  return a.map((x) => x * s);
}

/** L2 norm. */
export function magnitude(a: number[]): number {
  return Math.sqrt(a.reduce((s, x) => s + x * x, 0));
}

/** Unit vector — divide by magnitude. Returns the input scaled if
 *  the vector is the zero vector (avoids divide-by-zero). */
export function normalize(a: number[]): number[] {
  const m = magnitude(a) || 1;
  return a.map((x) => x / m);
}

/** Cosine similarity between two vectors, in [-1, 1]. */
export function cos(a: number[], b: number[]): number {
  const an = normalize(a);
  const bn = normalize(b);
  return an.reduce((s, x, i) => s + x * bn[i], 0);
}

/** Map a cosine similarity to a 0–100 percent for display.
 *
 *  Tightened relative to a naive [0, 1] → [0, 100] mapping so the
 *  spread between primary and shadow archetype reads honestly.
 *  Empirically:
 *    cos 0.96+ → 100% (essentially this archetype)
 *    cos 0.91  → ~80% (primary archetype, strong)
 *    cos 0.85  → ~58% (close runner-up)
 *    cos 0.78  → ~31% (typical shadow on the opposite pole)
 *    cos 0.70  → 0%  (orthogonal-ish; not aligned)
 *
 *  The previous mapping ([0.55, 1.0] → [0, 100]) made shadows read as
 *  ~50%, which felt absurd given they're literally the opposite end
 *  of the model. New mapping squashes the high end where most
 *  archetype distances naturally cluster, expanding distinctions. */
export function displayPct(sim: number | null | undefined): number {
  if (sim == null || isNaN(sim)) return 0;
  return Math.max(0, Math.min(100, Math.round(((sim - 0.7) / 0.26) * 100)));
}

/** One-word flavor adjective for each dimension. Used to compute
 *  the "Stoic Cartographer" / "Mystical Hammer"-style headline by
 *  picking the user's strongest dimension that ISN'T already part
 *  of the matched archetype's defining cluster. See `computeFlavor`. */
export const ADJ: Record<DimKey, string> = {
  TV: "Tragic",
  VA: "Vital",
  WP: "Striving",
  TR: "Rational",
  TE: "Empirical",
  RT: "Reverent",
  MR: "Mystical",
  SR: "Skeptical",
  CE: "Communal",
  SS: "Sovereign",
  PO: "Practical",
  TD: "Theoretical",
  AT: "Ascetic",
  ES: "Embodied",
  UI: "Universal",
  SI: "Egoless",
};

/** Compute the flavor word for a result.
 *
 *  Algorithm (matches mull.html):
 *    1. Take the archetype's top-4 dimensions (its defining cluster).
 *    2. Filter those out of the user's vector.
 *    3. Pick the user's highest remaining dimension.
 *    4. Return that dimension's adjective.
 *
 *  Returns "" when the user's vector has no signal outside the
 *  archetype's cluster (e.g. someone who scored exactly the
 *  archetype's prototype or near-zero).
 *
 *  Pass the archetype's prototype vector as `archP`. */
export function computeFlavor(userVec: number[], archP: number[]): string {
  const archTop = archP
    .map((val, i) => ({ k: DIM_KEYS[i], v: val }))
    .sort((a, b) => b.v - a.v)
    .slice(0, 4)
    .map((x) => x.k);

  const userTop = userVec
    .map((val, i) => ({ k: DIM_KEYS[i], v: val }))
    .filter((x) => !archTop.includes(x.k))
    .sort((a, b) => b.v - a.v);

  if (!userTop.length || userTop[0].v <= 0) return "";
  return ADJ[userTop[0].k] ?? "";
}
