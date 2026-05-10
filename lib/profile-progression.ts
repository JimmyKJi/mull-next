// Profile progression — computes the UserStats snapshot consumed by both
// lib/milestones.ts and lib/badges.ts. One round-trip per user; everything
// derived from the four entry tables (dilemma_responses, diary_entries,
// exercise_reflections, debate_history) plus public_profiles + quiz_attempts.
//
// Two entry points:
//   computeUserStats(supabase, userId)  — full snapshot, server-side
//   computeUserStatsFromTables(rows)    — pure function, used in tests
//
// Heavy lifting (mostly counting + a few date walks) intentionally lives
// in JS rather than as another SECURITY DEFINER RPC. Stats are scoped to
// "yourself" or to a public-profile user, both of which RLS already
// permits read access for.

import type { SupabaseClient } from '@supabase/supabase-js';
import { EXERCISES } from './exercises';

export type UserStats = {
  // Counts
  dilemmaCount: number;
  diaryCount: number;
  exerciseCount: number;
  debateCount: number;
  totalEntries: number;
  publicEntryCount: number;

  // Quiz
  quizAttempts: number;

  // Distinct exercise slugs touched (for "tried 3 different / all 16")
  uniqueExerciseSlugs: number;
  // Distinct exercise CATEGORIES touched (contemplative / logic / argument)
  uniqueCategoriesTried: number;

  // Streaks (dilemma-based, walked from today UTC backwards)
  streak: number;
  longestStreak: number;

  // Days the user wrote anything (any of the four sources). Used for
  // "Pilgrim's Pace" badge.
  activeDays: number;

  // Days between the user's longest gap and most recent write.
  // For the "Returner" badge — came back after a long silence.
  gapDaysBeforeLastWrite: number;

  // Public profile + visibility
  hasPublicProfile: boolean;

  // Localstorage-driven counters (these need to come from the client and
  // be passed through; server can't know what archetype pages a user has
  // visited unless we log them. Default to 0 server-side; UI can hydrate
  // from localStorage and re-evaluate badges client-side.)
  archetypePagesVisited: number;
};

// Lightweight rows — only the fields we actually need for stats.
type DilemmaRow = { dilemma_date: string; created_at: string; is_public: boolean };
type DiaryRow = { created_at: string; is_public: boolean };
type ExerciseRow = { exercise_slug: string; created_at: string; is_public: boolean };
type DebateRow = { created_at: string };
type QuizRow = { taken_at: string };

function toDateKey(d: Date): string {
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Walk backward from today (or yesterday if today not answered) counting
// consecutive days the user has a saved dilemma_response. Allows ONE
// missed day in the streak — humane policy so a single forgotten day
// doesn't reset hard-won progress to zero.
//
// Algorithm: walk back, count present days, allow exactly one absent
// day to be skipped (grace), then any second absent day breaks. This
// way a user who writes Mon/Tue/Wed, skips Thu, writes Fri/Sat/Sun
// shows a streak of 6 (Mon-Wed + grace + Fri-Sun) instead of 3.
function computeStreakFromDates(dateKeys: Set<string>): number {
  const cursor = new Date();
  if (!dateKeys.has(toDateKey(cursor))) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  let streak = 0;
  let graceUsed = false;
  for (let i = 0; i < 1825; i++) { // 5y safety bound
    if (dateKeys.has(toDateKey(cursor))) {
      streak++;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    } else if (!graceUsed) {
      graceUsed = true; // skip exactly one missed day
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    } else {
      break; // second missed day → end of streak
    }
  }
  return streak;
}

// Walk through all dilemma dates (sorted ascending) finding the longest
// uninterrupted run.
function computeLongestStreak(dateKeysSorted: string[]): number {
  if (dateKeysSorted.length === 0) return 0;
  let longest = 1;
  let current = 1;
  for (let i = 1; i < dateKeysSorted.length; i++) {
    const prev = new Date(`${dateKeysSorted[i - 1]}T00:00:00Z`);
    const curr = new Date(`${dateKeysSorted[i]}T00:00:00Z`);
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86400000);
    if (diffDays === 1) {
      current++;
      if (current > longest) longest = current;
    } else {
      current = 1;
    }
  }
  return longest;
}

// Days between the longest gap before the user's most recent activity.
// "If your last write came after silence of N days, gap = N." Used for
// the Returner badge.
function computeGapBeforeLastWrite(allDates: Date[]): number {
  if (allDates.length < 2) return 0;
  const sorted = [...allDates].sort((a, b) => a.getTime() - b.getTime());
  const last = sorted[sorted.length - 1];
  const prev = sorted[sorted.length - 2];
  return Math.floor((last.getTime() - prev.getTime()) / 86400000);
}

export type StatsBundle = {
  dilemmas: DilemmaRow[];
  diary: DiaryRow[];
  exercises: ExerciseRow[];
  debates: DebateRow[];
  quizzes: QuizRow[];
  hasPublicProfile: boolean;
  archetypePagesVisited?: number;
};

// Pure function — given the raw row arrays, compute the stats. Used both
// by the server-side fetch wrapper and (eventually) tests.
export function computeUserStatsFromTables(b: StatsBundle): UserStats {
  const dilemmaDateKeys = new Set(b.dilemmas.map(r => r.dilemma_date));
  const dilemmaDateKeysSorted = [...dilemmaDateKeys].sort();

  const allWriteDates: Date[] = [
    ...b.dilemmas.map(r => new Date(r.created_at)),
    ...b.diary.map(r => new Date(r.created_at)),
    ...b.exercises.map(r => new Date(r.created_at)),
  ];

  // active days: distinct calendar dates with at least one write
  const activeDayKeys = new Set(allWriteDates.map(d => toDateKey(d)));

  const exerciseSlugSet = new Set(b.exercises.map(r => r.exercise_slug));
  const categorySet = new Set<string>();
  for (const slug of exerciseSlugSet) {
    const ex = EXERCISES.find(e => e.slug === slug);
    if (ex) categorySet.add(ex.category);
  }

  const publicEntryCount =
    b.dilemmas.filter(r => r.is_public).length +
    b.diary.filter(r => r.is_public).length +
    b.exercises.filter(r => r.is_public).length;

  return {
    dilemmaCount: b.dilemmas.length,
    diaryCount: b.diary.length,
    exerciseCount: b.exercises.length,
    debateCount: b.debates.length,
    totalEntries: b.dilemmas.length + b.diary.length + b.exercises.length,
    publicEntryCount,

    quizAttempts: b.quizzes.length,

    uniqueExerciseSlugs: exerciseSlugSet.size,
    uniqueCategoriesTried: categorySet.size,

    streak: computeStreakFromDates(dilemmaDateKeys),
    longestStreak: computeLongestStreak(dilemmaDateKeysSorted),

    activeDays: activeDayKeys.size,
    gapDaysBeforeLastWrite: computeGapBeforeLastWrite(allWriteDates),

    hasPublicProfile: b.hasPublicProfile,

    archetypePagesVisited: b.archetypePagesVisited ?? 0,
  };
}

// Server-side fetch wrapper. Caller passes in the supabase client and a
// userId; we hit the four tables in parallel, then compute stats in JS.
//
// Intentionally not paginated — for an active user with thousands of
// entries this could be slow, but the per-user scale is small for the
// foreseeable future and the alternative (a SECURITY DEFINER RPC that
// aggregates) is heavier to maintain.
export async function computeUserStats(
  supabase: SupabaseClient,
  userId: string,
  archetypePagesVisited = 0,
): Promise<UserStats> {
  const [dilemmasR, diaryR, exercisesR, debatesR, quizzesR, profileR] = await Promise.all([
    supabase.from('dilemma_responses')
      .select('dilemma_date, created_at, is_public')
      .eq('user_id', userId),
    supabase.from('diary_entries')
      .select('created_at, is_public')
      .eq('user_id', userId),
    supabase.from('exercise_reflections')
      .select('exercise_slug, created_at, is_public')
      .eq('user_id', userId),
    supabase.from('debate_history')
      .select('created_at')
      .eq('user_id', userId),
    supabase.from('quiz_attempts')
      .select('taken_at')
      .eq('user_id', userId),
    supabase.from('public_profiles')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle(),
  ]);

  return computeUserStatsFromTables({
    dilemmas: (dilemmasR.data || []) as DilemmaRow[],
    diary: (diaryR.data || []) as DiaryRow[],
    exercises: (exercisesR.data || []) as ExerciseRow[],
    debates: (debatesR.data || []) as DebateRow[],
    quizzes: (quizzesR.data || []) as QuizRow[],
    hasPublicProfile: !!profileR.data,
    archetypePagesVisited,
  });
}
