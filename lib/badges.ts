// Badges — earned identity markers, separate from milestones. Where
// milestones are predictable count-driven progress (write 50 dilemmas,
// hit a 7-day streak), badges are flavored honors awarded for *patterns*
// or *unusual paths*: trying every category, surviving a long break,
// touching every theme, etc.
//
// Ten defined here. Each carries its own check function — `awarded(s)`
// returns true if the user qualifies given a UserStats snapshot. Once
// awarded, they don't un-earn (the check is idempotent in practice
// because all current checks are monotonic).
//
// Where they show up: /account renders earned badges prominently and
// dimly previews a few near-miss ones; /u/[handle] shows a small grid
// of earned badges alongside the archetype card.

import type { UserStats } from './profile-progression';
import { CATEGORY_META } from './exercises';

export type Badge = {
  // Stable id, used as a storage key if/when we cache earned badges.
  key: string;
  // Display name.
  name: string;
  // Glyph (single character). Plays the role of a small icon without
  // requiring an image asset.
  glyph: string;
  // One-sentence description shown alongside the glyph.
  description: string;
  // Returns true if the user has earned the badge.
  awarded: (s: UserStats) => boolean;
};

export const BADGES: Badge[] = [
  {
    key: 'first_steps',
    name: 'First Steps',
    glyph: '✦',
    description: 'Took the quiz and wrote your first dilemma. The threshold is crossed.',
    awarded: s => s.quizAttempts >= 1 && s.dilemmaCount >= 1,
  },
  {
    key: 'iron_streak',
    name: 'Iron Streak',
    glyph: '◆',
    description: 'Held a streak of 14 consecutive days. The practice has caught.',
    awarded: s => s.streak >= 14 || s.longestStreak >= 14,
  },
  {
    key: 'returner',
    name: 'The Returner',
    glyph: '↻',
    description: 'Came back after a 30+ day silence and started writing again. The path widens after a pause.',
    awarded: s => s.gapDaysBeforeLastWrite >= 30 && s.dilemmaCount >= 5,
  },
  {
    key: 'polymath',
    name: 'Polymath',
    glyph: '✺',
    description: 'Reflected on at least one exercise in every category — contemplative, logic, and argument.',
    awarded: s => s.uniqueCategoriesTried >= Object.keys(CATEGORY_META).length,
  },
  {
    key: 'cartographers_apprentice',
    name: 'The Cartographer\'s Apprentice',
    glyph: '◬',
    description: 'Took the quiz at least three times. Watching how the map shifts is its own discipline.',
    awarded: s => s.quizAttempts >= 3,
  },
  {
    key: 'voice_in_chorus',
    name: 'A Voice in the Chorus',
    glyph: '❋',
    description: 'Made your profile public and shared at least one dilemma response. Joined the conversation.',
    awarded: s => s.hasPublicProfile && s.publicEntryCount >= 1,
  },
  {
    key: 'deep_archive',
    name: 'Deep Archive',
    glyph: '∾',
    description: 'Wrote a hundred entries across all surfaces. The personal record is substantial now.',
    awarded: s => s.totalEntries >= 100,
  },
  {
    key: 'pilgrims_pace',
    name: 'The Pilgrim\'s Pace',
    glyph: '⟶',
    description: 'Sustained writing for sixty days, even with gaps. Long-haul over intensity.',
    awarded: s => s.activeDays >= 60,
  },
  {
    key: 'simulated_socrates',
    name: 'Simulated Socrates',
    glyph: '⊕',
    description: 'Generated three or more debates between thinkers. Conversation as inquiry.',
    awarded: s => s.debateCount >= 3,
  },
  {
    key: 'all_archetypes_seen',
    name: 'The Constellation Walker',
    glyph: '✧',
    description: 'Visited every one of the ten archetype pages. The full map of orientations seen, not just one.',
    awarded: s => s.archetypePagesVisited >= 10,
  },
];

// Convenience: split the user's badges into earned vs unearned. The
// unearned list is useful for "near misses" — showing what's almost in
// reach to keep motivation honest.
export function partitionBadges(stats: UserStats): { earned: Badge[]; unearned: Badge[] } {
  const earned: Badge[] = [];
  const unearned: Badge[] = [];
  for (const b of BADGES) {
    if (b.awarded(stats)) earned.push(b);
    else unearned.push(b);
  }
  return { earned, unearned };
}
