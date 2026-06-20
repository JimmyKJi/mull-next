// /spar — Daily Spar config.
//
// A daily rotating philosopher × topic pairing. One turn from the
// user (200 words), one turn from the philosopher (300 words),
// scored by Sonnet in ~30 seconds. Built for users who don't have
// 20 minutes for a full Arena debate but want the rigor practice.
//
// Retention design intent: a "Wordle for arguments". Everyone who
// plays today gets the same matchup, so screenshots are recognizable
// and a "best response of the day" angle can ride on top later.
//
// Design choices:
//   - Daily rotation by ordinal day of year (so the same matchup
//     repeats once a year; users effectively get a fresh one each
//     day for a calendar year)
//   - Skews toward friendly/sharp tiers since this is the casual
//     entry-point; heavy tier (Hegel, Nietzsche) appears once a week
//   - Topic respects the philosopher's category constraint when set

import {
  ARENA_PHILOSOPHERS,
  ARENA_TOPICS,
  type ArenaPhilosopher,
  type ArenaTopic,
} from './arena/data';

export type DailySpar = {
  philosopher: ArenaPhilosopher;
  topic: ArenaTopic;
  /** Ordinal day of year (1-366) used as the rotation seed. */
  dayOfYear: number;
  /** ISO date string this spar is for, in UTC. */
  dateKey: string;
};

/** Ordinal day-of-year (1..366) for a given date in UTC. */
function dayOfYear(date: Date): number {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const diff = date.getTime() - start;
  return Math.floor(diff / 86400000);
}

export function getDailySpar(now: Date = new Date()): DailySpar {
  const doy = dayOfYear(now);

  // Heavy tier (Nietzsche, Hegel) every 7th day. Sharp tier on
  // half of remaining days; friendly tier on the other half.
  const nonHeavy = ARENA_PHILOSOPHERS.filter((p) => p.tier !== 'heavy');
  const heavy = ARENA_PHILOSOPHERS.filter((p) => p.tier === 'heavy');
  const philosopher =
    doy % 7 === 0 && heavy.length > 0
      ? heavy[Math.floor(doy / 7) % heavy.length]
      : nonHeavy[doy % nonHeavy.length];

  // Topic: respect category constraint when set, offset by 5 so
  // consecutive days don't share an obvious pattern.
  const allowed = philosopher.topicCategories
    ? ARENA_TOPICS.filter((t) => philosopher.topicCategories!.includes(t.category))
    : ARENA_TOPICS;
  const topic = allowed[(doy + 5) % allowed.length];

  const dateKey = now.toISOString().slice(0, 10);
  return { philosopher, topic, dayOfYear: doy, dateKey };
}

/** Localstorage key for daily spar limit tracking (v1 — client only). */
export const SPAR_LIMIT_KEY = 'mull.spar_plays';
export const SPAR_DAILY_LIMIT = 3;

/** Word-count cap on a single spar turn (rough, by string length). */
export const SPAR_MAX_USER_CHARS = 1400; // ~200 words
