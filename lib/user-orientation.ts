// A signed-in user's CURRENT philosophical orientation, read from their most
// recent quiz attempt. This is the single source the personalized experience
// reads from — starting with the daily dilemma (which question you get), and
// (the larger plan) every other recommendation surface that should adapt to
// who the person actually is rather than treating everyone the same.
//
// The quiz_attempts row carries both representations of a placement:
//   - archetype     — the English display NAME, e.g. "The Cartographer"
//   - vector        — the 16-D coordinate (number[16])
//   - alignment_pct — how cleanly they landed on that archetype
// We expose both the normalized archetype SLUG (for archetype-keyed content
// like lib/archetype-dilemmas.ts) and the raw vector (for cosine-similarity
// ranking, where archetype buckets are too coarse).
//
// Pure data-access leaf: takes a Supabase client, never creates one, so it
// works from server components, route handlers, and the service-role admin
// client alike.

import type { SupabaseClient } from '@supabase/supabase-js';
import { ARCHETYPE_KEYS } from '@/lib/archetype-targets';

export type UserOrientation = {
  /** Canonical archetype slug, e.g. 'cartographer'. Null if not yet placed
   *  (no attempts) or the stored name doesn't map to a known archetype. */
  archetypeKey: string | null;
  /** Raw display name as stored in quiz_attempts, e.g. "The Cartographer". */
  archetypeName: string | null;
  /** The 16-D vector from the latest attempt, or null if absent/malformed. */
  vector: number[] | null;
  /** How cleanly they landed on the archetype (0–100), or null. */
  alignmentPct: number | null;
  /** ISO timestamp of the latest attempt, or null. */
  takenAt: string | null;
};

/** The orientation of someone who hasn't taken the quiz (or whose row is
 *  unreadable). Callers treat this as "not yet placed" → universal content. */
export const UNPLACED: UserOrientation = {
  archetypeKey: null,
  archetypeName: null,
  vector: null,
  alignmentPct: null,
  takenAt: null,
};

/** Normalize the English archetype display name stored in quiz_attempts
 *  ("The Cartographer") to its canonical slug ("cartographer"). Returns null
 *  for unknown names. Mirrors archetypeNameToSlug in app/search/leaderboard. */
export function archetypeNameToSlug(name: string | null | undefined): string | null {
  if (!name) return null;
  const cleaned = name
    .replace(/^The\s+/i, '')
    .trim()
    .toLowerCase();
  return ARCHETYPE_KEYS.includes(cleaned) ? cleaned : null;
}

/** Read a user's current orientation from their most recent quiz attempt.
 *  Never throws — a missing/erroring row resolves to UNPLACED so every caller
 *  can degrade gracefully to universal (non-personalized) content. */
export async function getUserOrientation(
  supabase: SupabaseClient,
  userId: string | null | undefined,
): Promise<UserOrientation> {
  if (!userId) return UNPLACED;

  const { data, error } = await supabase
    .from('quiz_attempts')
    .select('archetype, vector, alignment_pct, taken_at')
    .eq('user_id', userId)
    .order('taken_at', { ascending: false })
    .limit(1)
    .maybeSingle<{
      archetype: string | null;
      vector: number[] | null;
      alignment_pct: number | null;
      taken_at: string | null;
    }>();

  if (error || !data) return UNPLACED;

  const vector =
    Array.isArray(data.vector) && data.vector.length === 16
      ? data.vector.map((n) => (typeof n === 'number' ? n : 0))
      : null;

  return {
    archetypeKey: archetypeNameToSlug(data.archetype),
    archetypeName: data.archetype ?? null,
    vector,
    alignmentPct: typeof data.alignment_pct === 'number' ? data.alignment_pct : null,
    takenAt: data.taken_at ?? null,
  };
}
