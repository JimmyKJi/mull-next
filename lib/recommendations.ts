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
import { DIM_KEYS, type DimKey } from './dimensions';
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

/** Rank "subject-matter" items — ones defined by the DIMENSIONS they
 *  probe rather than by a position in the space (e.g. topics, whose
 *  `relevantDimensions` declare what the concept is ABOUT) — by how
 *  strongly the user loads on those dimensions relative to their OWN
 *  average.
 *
 *  Mean-centering is the whole point. A topic has subject matter, not a
 *  stance, so cosine-to-a-topic-vector is the wrong question; the right
 *  one is "is this about the axes that stand out in YOU?" Raw loadings
 *  would just resurface whatever axes everyone scores high on; centering
 *  by the user's own mean surfaces the item about the dimensions that
 *  most DISTINGUISH this user — "the question that lives where you do."
 *  A positive score means the item's dimensions sit above your personal
 *  baseline; negative means below it.
 *
 *  Items with no (resolvable) dimensions are skipped. Returns [] when the
 *  user vector is absent/invalid — caller should fall back to a
 *  non-personalized pick. */
export function rankByDimensionFocus<T>(
  userVec: number[] | null | undefined,
  items: readonly T[],
  getDims: (item: T) => readonly DimKey[],
  n?: number,
): Ranked<T>[] {
  if (!isVec16(userVec)) return [];
  const mean = userVec.reduce((s, x) => s + x, 0) / userVec.length;
  const out: Ranked<T>[] = [];
  for (const item of items) {
    const dims = getDims(item);
    let acc = 0;
    let count = 0;
    for (const k of dims) {
      const i = DIM_KEYS.indexOf(k);
      if (i < 0) continue;
      acc += userVec[i] - mean;
      count++;
    }
    if (count === 0) continue;
    out.push({ item, sim: acc / count });
  }
  out.sort((a, b) => b.sim - a.sim);
  return typeof n === 'number' ? out.slice(0, n) : out;
}

// ─────────────────────────────────────────────────────────────────────
// Question-aware ranking — proximity that counts the dimensions a given
// question probes more heavily than the rest. Powers the Wandering
// feature's "kindred / far" beats, where the contrast we want is "near
// you ON WHAT THIS QUESTION IS ABOUT," not generic global proximity.
// ─────────────────────────────────────────────────────────────────────

/** Per-dimension weights: the `touched` dimensions get weight `boost`,
 *  the rest 1. Folds a question's focus into an otherwise-uniform metric. */
function dimWeights(touched: readonly DimKey[], boost: number): number[] {
  const set = new Set(touched);
  return DIM_KEYS.map((k) => (set.has(k) ? boost : 1));
}

/** Weighted cosine similarity: ordinary cosine after scaling each
 *  dimension by sqrt(weight). Scaling by sqrt(w) is the standard way to
 *  fold per-axis weights into a cosine while keeping it a proper
 *  normalized similarity (the weight then appears linearly inside the
 *  dot product and the norms). */
function weightedCos(a: number[], b: number[], weights: number[]): number {
  const sa = a.map((x, i) => x * Math.sqrt(weights[i]));
  const sb = b.map((x, i) => x * Math.sqrt(weights[i]));
  return cos(sa, sb);
}

/** Of a question's touched dimensions, the single one that best explains
 *  a pick in human terms:
 *    - 'shared'    → where the two vectors lean the same way most strongly
 *                    (largest product) — "you both go hard on this."
 *    - 'divergent' → where they split hardest (largest absolute gap) —
 *                    "this is where you part ways."
 *  Returns null when there are no touched dimensions. Robust to the
 *  model's non-negative magnitude convention either way. */
export function touchAxis(
  userVec: number[],
  otherVec: number[],
  touched: readonly DimKey[],
  mode: 'shared' | 'divergent',
): DimKey | null {
  let best: DimKey | null = null;
  let bestScore = -Infinity;
  for (const k of touched) {
    const i = DIM_KEYS.indexOf(k);
    if (i < 0) continue;
    const score = mode === 'shared' ? userVec[i] * otherVec[i] : Math.abs(userVec[i] - otherVec[i]);
    if (score > bestScore) {
      bestScore = score;
      best = k;
    }
  }
  return best;
}

/** One philosopher surfaced for a wandering beat, paired with the
 *  question-weighted similarity and the touched dimension that best
 *  explains the pick (for a "near you on X" / "you split on X" label). */
export type WanderingPick = {
  philosopher: PhilosopherEntry;
  sim: number;
  axis: DimKey | null;
};

export type WanderingPicks = {
  /** Nearest the user, question-weighted — the Wednesday "kindred" beat. */
  kindred: WanderingPick[];
  /** The single most-distant philosopher by the same question-weighted
   *  metric — the Friday "far" beat. null when no user vector. */
  far: WanderingPick | null;
};

/** Pick the philosophers a wandering question surfaces across the week:
 *  `kindred` (near you, question-weighted) for Wednesday and a single
 *  `far` (the question-weighted opposite) for Friday.
 *
 *  Question-aware by design: `touches` (the dimensions the question most
 *  tests) are weighted up, so the kindred are near you *on what this
 *  question is about* and the far voice disagrees with you *there* too —
 *  a sharper, more relevant contrast than a generic global opposite.
 *
 *  Returns empties when the user vector is absent/invalid; the caller
 *  then falls back to a non-personalized invitation (e.g. "take the
 *  quiz to meet the minds nearest you"). */
export function pickWanderingPhilosophers(
  userVec: number[] | null | undefined,
  touches: readonly DimKey[],
  opts?: { kindredN?: number; boost?: number },
): WanderingPicks {
  if (!isVec16(userVec)) return { kindred: [], far: null };
  const u = userVec;
  const kindredN = opts?.kindredN ?? 2;
  // Mild boost: a touched dim counts ~sqrt(2)× its usual voice — enough to
  // make the pick question-aware without letting 3 axes drown the other 13.
  const boost = opts?.boost ?? 2;
  const weights = dimWeights(touches, boost);

  const ranked: { p: PhilosopherEntry; sim: number }[] = [];
  for (const p of PHILOSOPHERS) {
    if (!isVec16(p.vector)) continue;
    ranked.push({ p, sim: weightedCos(u, p.vector, weights) });
  }
  ranked.sort((a, b) => b.sim - a.sim);

  const kindred: WanderingPick[] = ranked.slice(0, kindredN).map(({ p, sim }) => ({
    philosopher: p,
    sim,
    axis: touchAxis(u, p.vector, touches, 'shared'),
  }));

  const last = ranked.length ? ranked[ranked.length - 1] : null;
  const far: WanderingPick | null = last
    ? {
        philosopher: last.p,
        sim: last.sim,
        axis: touchAxis(u, last.p.vector, touches, 'divergent'),
      }
    : null;

  return { kindred, far };
}

export type RankedPair<T> = {
  pair: T;
  /** Cosine of the user to each member. */
  simA: number;
  simB: number;
  /** 1 - cos(A, B): how opposed the two members are. */
  tension: number;
  /** The "splits you" score (see rankSplittingPairs). */
  score: number;
};

/** Rank candidate pairs by how much they "split" the user: a pair scores
 *  high when the user is close to BOTH members yet the two members
 *  genuinely oppose each other — the debate you're personally torn by,
 *  rather than a random marquee matchup.
 *
 *  score = min(simToA, simToB) · (1 + tension), where tension = 1 - cos(A,B).
 *  The min() term demands you actually lean toward *both* sides (a lopsided
 *  pair scores low); the (1 + tension) factor rewards a real opposition
 *  over two thinkers who merely resemble each other.
 *
 *  Pairs with a missing/invalid member vector are skipped. Returns [] when
 *  the user vector is absent/invalid — caller should fall back to a
 *  non-personalized pick. */
export function rankSplittingPairs<T>(
  userVec: number[] | null | undefined,
  pairs: readonly T[],
  getVecA: (p: T) => number[] | null | undefined,
  getVecB: (p: T) => number[] | null | undefined,
  n?: number,
): RankedPair<T>[] {
  if (!isVec16(userVec)) return [];
  const out: RankedPair<T>[] = [];
  for (const pair of pairs) {
    const va = getVecA(pair);
    const vb = getVecB(pair);
    if (!isVec16(va) || !isVec16(vb)) continue;
    const simA = cos(userVec, va);
    const simB = cos(userVec, vb);
    const tension = 1 - cos(va, vb);
    const score = Math.min(simA, simB) * (1 + tension);
    out.push({ pair, simA, simB, tension, score });
  }
  out.sort((a, b) => b.score - a.score);
  return typeof n === 'number' ? out.slice(0, n) : out;
}
