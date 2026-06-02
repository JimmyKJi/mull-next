// Broad language-region buckets for cross-cultural research analysis.
//
// The /admin/research console groups the consented corpus into two big
// families plus an Unknown bucket, so the maintainer can compare how
// Western- vs Eastern-language users answer the quiz:
//
//   western  — Latin-script European UIs: en, es, fr, pt, ru
//   eastern  — CJK UIs: zh, ja, ko
//   unknown  — rows captured before we tracked locale (NULL), or any
//              value outside the known LOCALES set
//
// This is a deliberately coarse cut. It is NOT a claim about a user's
// nationality, ethnicity, or philosophical tradition — only about the
// language their interface was in when they answered, which is the one
// signal we actually have. Treat the regions as "UI-language families,"
// nothing more.
//
// Pure leaf module (no imports) so both server components and .mjs
// tooling can use it. Keep it dependency-free.

export type LocaleRegion = 'western' | 'eastern' | 'unknown';

const WESTERN = new Set(['en', 'es', 'fr', 'pt', 'ru']);
const EASTERN = new Set(['zh', 'ja', 'ko']);

/**
 * Map a locale code (or NULL/undefined/unknown value) to its broad
 * region bucket. Anything we don't recognize — including a missing
 * locale on a pre-tracking row — lands in 'unknown'.
 */
export function localeRegion(locale: string | null | undefined): LocaleRegion {
  if (!locale) return 'unknown';
  const l = locale.toLowerCase();
  if (WESTERN.has(l)) return 'western';
  if (EASTERN.has(l)) return 'eastern';
  return 'unknown';
}

/** Display label for a region bucket (admin console + export). */
export const REGION_LABELS: Record<LocaleRegion, string> = {
  western: 'Western',
  eastern: 'Eastern',
  unknown: 'Unknown',
};

/** The languages that fall under each region, for admin tooltips/sublabels. */
export const REGION_LOCALES: Record<Exclude<LocaleRegion, 'unknown'>, string[]> = {
  western: ['en', 'es', 'fr', 'pt', 'ru'],
  eastern: ['zh', 'ja', 'ko'],
};
