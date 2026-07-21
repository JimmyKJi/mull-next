// Reflection streak — consecutive days the user saved a dilemma
// response, with a one-day grace so a single forgotten morning doesn't
// reset hard-won progress. Two consecutive missed days break it.
//
// The logic lived inline (and identically) in app/account/page.tsx and
// app/dilemma/page.tsx; the Today home needs it too, so it's shared
// here. Pure + deterministic given the date set and today's key.

/**
 * @param dates    the user's dilemma_date strings ('YYYY-MM-DD'), any order
 * @param todayKey today's UTC date key ('YYYY-MM-DD')
 */
export function computeDilemmaStreak(dates: string[], todayKey: string): number {
  if (!dates.length) return 0;
  const set = new Set(dates);
  const cursor = new Date(todayKey);
  // If today isn't answered yet, start counting from yesterday so an
  // as-yet-undone today doesn't read as a broken streak.
  if (!set.has(cursor.toISOString().slice(0, 10))) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  let streak = 0;
  let graceUsed = false;
  for (let i = 0; i < 1825; i++) {
    const k = cursor.toISOString().slice(0, 10);
    if (set.has(k)) {
      streak++;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    } else if (!graceUsed) {
      graceUsed = true;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}
