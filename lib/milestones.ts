// Milestones — count-based progression markers a user advances toward as
// they use Mull. Twenty defined here, grouped into five tracks
// (Reflection, Practice, Diary, Constellation, Consistency). Each
// milestone has a `target` count and a `metric` function that pulls the
// relevant number from a precomputed UserStats object. Progress = current
// count / target, capped at 1.
//
// Milestones are deliberately count-driven and therefore *predictable* —
// you can see how far you have to go. Badges (lib/badges.ts) are the
// counterpart: identity-flavored, sometimes earned by unusual paths,
// shown as small honors rather than progress bars.
//
// Where they show up: /account renders the user's full milestone list
// with progress bars; /u/[handle] surfaces only the EARNED milestones
// (those at 100%) under a small "Honors" section. Both gated by the
// existing show_streak / show_archetype / etc. privacy flags.

import type { UserStats } from './profile-progression';

export type MilestoneTrack = 'reflection' | 'practice' | 'diary' | 'constellation' | 'consistency';

export type Milestone = {
  // Stable identifier, used for storage and lookup.
  key: string;
  track: MilestoneTrack;
  // Short title shown in the UI.
  name: string;
  // One-sentence flavor. Past tense once earned, present until then.
  description: string;
  // The integer the user is climbing toward.
  target: number;
  // Pulls the current count from a UserStats object. The compute layer
  // (lib/profile-progression.ts) gives this everything it needs.
  metric: (s: UserStats) => number;
};

export const MILESTONES: Milestone[] = [
  // ─── Reflection (dilemmas) ───────────────────────────────────────
  {
    key: 'first_dilemma',
    track: 'reflection',
    name: 'First reflection',
    description: 'Wrote your first daily dilemma response.',
    target: 1,
    metric: s => s.dilemmaCount,
  },
  {
    key: 'ten_dilemmas',
    track: 'reflection',
    name: 'Ten dilemmas in',
    description: 'Wrote ten daily dilemma responses.',
    target: 10,
    metric: s => s.dilemmaCount,
  },
  {
    key: 'fifty_dilemmas',
    track: 'reflection',
    name: 'Fifty dilemmas',
    description: 'Wrote fifty daily dilemma responses. The shape of how you think is becoming visible.',
    target: 50,
    metric: s => s.dilemmaCount,
  },
  {
    key: 'hundred_dilemmas',
    track: 'reflection',
    name: 'A hundred written',
    description: 'A hundred daily dilemma responses. A real practice now.',
    target: 100,
    metric: s => s.dilemmaCount,
  },

  // ─── Practice (exercises) ────────────────────────────────────────
  {
    key: 'first_exercise',
    track: 'practice',
    name: 'First exercise reflection',
    description: 'Tried one of the philosophical exercises and wrote about it after.',
    target: 1,
    metric: s => s.exerciseCount,
  },
  {
    key: 'three_exercises',
    track: 'practice',
    name: 'Three different exercises',
    description: 'Reflected on three distinct exercises. Variety is starting to show.',
    target: 3,
    metric: s => s.uniqueExerciseSlugs,
  },
  {
    key: 'eight_exercises',
    track: 'practice',
    name: 'Half the catalog',
    description: 'Tried eight of the sixteen exercises with reflection. You\'re sampling the breadth.',
    target: 8,
    metric: s => s.uniqueExerciseSlugs,
  },
  {
    key: 'all_exercises',
    track: 'practice',
    name: 'All sixteen exercises',
    description: 'Reflected on every exercise in the catalog. A serious sweep.',
    target: 16,
    metric: s => s.uniqueExerciseSlugs,
  },

  // ─── Diary ───────────────────────────────────────────────────────
  {
    key: 'first_diary',
    track: 'diary',
    name: 'First diary entry',
    description: 'Opened the diary and wrote.',
    target: 1,
    metric: s => s.diaryCount,
  },
  {
    key: 'ten_diary',
    track: 'diary',
    name: 'Ten diary entries',
    description: 'Ten entries in the diary. The thread is forming.',
    target: 10,
    metric: s => s.diaryCount,
  },
  {
    key: 'fifty_diary',
    track: 'diary',
    name: 'Fifty diary entries',
    description: 'Fifty entries. The diary is starting to know things about you.',
    target: 50,
    metric: s => s.diaryCount,
  },

  // ─── Constellation (philosopher proximity, debates) ─────────────
  {
    key: 'quiz_taken',
    track: 'constellation',
    name: 'Found your first position',
    description: 'Took the quiz and landed somewhere on the map.',
    target: 1,
    metric: s => s.quizAttempts,
  },
  {
    key: 'quiz_taken_three',
    track: 'constellation',
    name: 'Retook the quiz',
    description: 'Took the quiz three times. Watching the map shift over time.',
    target: 3,
    metric: s => s.quizAttempts,
  },
  {
    key: 'first_debate',
    track: 'constellation',
    name: 'First simulated debate',
    description: 'Generated your first conversation between two thinkers.',
    target: 1,
    metric: s => s.debateCount,
  },
  {
    key: 'five_debates',
    track: 'constellation',
    name: 'Five debates',
    description: 'Convened five conversations between different thinkers.',
    target: 5,
    metric: s => s.debateCount,
  },

  // ─── Consistency (streaks + total) ──────────────────────────────
  {
    key: 'streak_3',
    track: 'consistency',
    name: 'Three-day streak',
    description: 'Three consecutive days of dilemma responses.',
    target: 3,
    metric: s => s.streak,
  },
  {
    key: 'streak_7',
    track: 'consistency',
    name: 'Week-long streak',
    description: 'Seven consecutive days. Real habit forming.',
    target: 7,
    metric: s => s.streak,
  },
  {
    key: 'streak_30',
    track: 'consistency',
    name: 'Month-long streak',
    description: 'Thirty consecutive days. Through the dip — the practice is yours now.',
    target: 30,
    metric: s => s.streak,
  },
  {
    key: 'streak_100',
    track: 'consistency',
    name: 'Hundred-day streak',
    description: 'A hundred consecutive days. Vanishingly rare.',
    target: 100,
    metric: s => s.streak,
  },
  {
    key: 'total_200',
    track: 'consistency',
    name: 'Two hundred entries total',
    description: 'Two hundred entries across dilemmas, diary, and exercises combined.',
    target: 200,
    metric: s => s.totalEntries,
  },
];

export const MILESTONE_TRACK_META: Record<MilestoneTrack, { label: string; blurb: string; accent: string }> = {
  reflection: {
    label: 'Reflection',
    blurb: 'The daily dilemma — written prose, one prompt a day.',
    accent: '#B8862F',
  },
  practice: {
    label: 'Practice',
    blurb: 'The contemplative, logic, and argument exercises with written reflection.',
    accent: '#2F5D5C',
  },
  diary: {
    label: 'Diary',
    blurb: 'Free-form entries — whatever\'s on your mind, however often.',
    accent: '#7A2E2E',
  },
  constellation: {
    label: 'Constellation',
    blurb: 'Quiz attempts, archetype shifts, simulated debates with the thinkers.',
    accent: '#1E3A5F',
  },
  consistency: {
    label: 'Consistency',
    blurb: 'Streaks and accumulated entries — the slow work of showing up.',
    accent: '#5C3D26',
  },
};
