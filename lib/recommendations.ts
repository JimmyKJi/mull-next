// Vector-space recommendation engine. The single home for "rank this
// content against the USER's own 16-D philosophy vector" logic, so every
// personalized surface (the pathway trail, philosopher index, wandering,
// …) ranks the same way instead of re-implementing cosine inline.
//
// Layering: lib/vectors.ts is the math kernel (cos, displayPct, …).
// Content-aware rankers live HERE and build on that kernel. Archetype
// buckets are coarse; this is the finer-grained personalization the
// product leans on wherever a user vector is available.

import { cos } from './vectors';
import { DIM_KEYS } from './dimensions';
import { PHILOSOPHERS, type PhilosopherEntry } from './philosophers';

export type Ranked<T> = { item: T; sim: number };

/** True when `v` is a length-16 array of finite numbers — the shape every
 *  vector in the model must have before we do math on it. */
function isVec16(v: unknown): v is number[] {
  return (
    Array.isArray(v) &&
    v.length === DIM_KEYS.length &&
    v.every((x) => typeof x === 'number' && Number.isFinite(x))
  );
}

/** Coerce an unknown (e.g. `JSON.parse` of a localStorage string) into a
 *  clean 16-D vector, or null if it isn't one. Use this at the trust
 *  boundary — parsing client storage, request bodies — before handing a
 *  vector to the rankers below. */
export function coerceVector16(raw: unknown): number[] | null {
  return isVec16(raw) ? (raw as number[]).slice() : null;
}

/** Rank a list of items by cosine similarity of each item's vector to the
 *  user's vector, most-similar first. Returns the top `n` (all if `n` is
 *  omitted), each paired with its similarity so callers can show "how
 *  close" without recomputing.
 *
 *  Robust by design: items with a missing/malformed vector are skipped —
 *  a recommender must never throw on dirty data. If `userVec` itself is
 *  absent/invalid this returns [], and the caller should fall back to a
 *  non-personalized ordering. */
export function rankByVector<T>(
  userVec: number[] | null | undefined,
  items: readonly T[],
  getVec: (item: T) => number[] | null | undefined,
  n?: number,
): Ranked<T>[] {
  if (!isVec16(userVec)) return [];
  const ranked: Ranked<T>[] = [];
  for (const item of items) {
    const vec = getVec(item);
    if (!isVec16(vec)) continue;
    ranked.push({ item, sim: cos(userVec, vec) });
  }
  ranked.sort((a, b) => b.sim - a.sim);
  return typeof n === 'number' ? ranked.slice(0, n) : ranked;
}

/** Philosophers nearest the user's OWN coordinates, most-kindred first.
 *  The user-relative counterpart to philosophers.ts's nearestPhilosophers
 *  (which ranks against a philosopher). Powers "the minds nearest you"
 *  surfaces. Returns [] when the user vector is absent/invalid. */
export function nearestPhilosophersToVector(
  userVec: number[] | null | undefined,
  n = 6,
): Ranked<PhilosopherEntry>[] {
  return rankByVector(userVec, PHILOSOPHERS, (p) => p.vector, n);
}
