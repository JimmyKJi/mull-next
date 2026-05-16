// Daily wisdom — picks today's philosopher quote deterministically by
// date. Same quote for every visitor on the same UTC day; rotates each
// morning. Same algorithm as getDailyDilemma in lib/dilemmas.ts.
//
// Used by app/(redesign)/home/daily-wisdom.tsx as a server component
// so the quote renders in the initial HTML (good for SEO, instant
// paint, no flash).

import { PHILOSOPHERS, type PhilosopherEntry } from "./philosophers";

export type DailyWisdom = {
  philosopher: PhilosopherEntry;
  index: number;
  /** YYYY-MM-DD UTC for cache-busting / debugging. */
  dateKey: string;
};

export function getDailyWisdom(date: Date = new Date()): DailyWisdom {
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  const dateKey = `${yyyy}-${mm}-${dd}`;

  // Day-of-year — Jan 1 is day 0.
  const start = Date.UTC(yyyy, 0, 0);
  const now = Date.UTC(yyyy, date.getUTCMonth(), date.getUTCDate());
  const dayOfYear = Math.floor((now - start) / 86400000);

  // Year * 7 rotates the cycle year-over-year so the same calendar
  // date doesn't always land on the same philosopher. (Same trick
  // getDailyDilemma uses.)
  const index = (dayOfYear + yyyy * 7) % PHILOSOPHERS.length;

  return {
    philosopher: PHILOSOPHERS[index],
    index,
    dateKey,
  };
}
