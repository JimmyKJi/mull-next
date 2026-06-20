// Source of truth for the optional, self-reported demographic metrics we
// collect (only) from research-consented users. These are the "general
// info" fields on the /consent surface: age, gender, cultural background,
// education, and religion/worldview.
//
// Kept in sync, by hand, with:
//   - supabase/migrations/20260606_research_demographics.sql — the CHECK
//     constraints on each column must list exactly these codes.
//   - app/api/demographics/route.ts — validates incoming values against
//     DEMOGRAPHIC_OPTIONS before the upsert.
//   - components/demographics-form.tsx — renders one <select> per field.
//   - lib/translations.ts — the `demo.*` keys provide the en/zh labels.
//
// Design notes:
//   - We store STABLE CODES, never display text. Labels are a presentation
//     concern (i18n via t('demo.opt.<code>', locale)), so we can relabel or
//     re-translate without a data migration.
//   - Every field is optional (the column is nullable). 'prefer_not_to_say'
//     is an EXPLICIT decline, distinct from NULL ("never answered"). Both
//     are valid; the distinction is itself a small research signal.
//   - Codes are snake_case and globally unique across fields EXCEPT the
//     shared 'prefer_not_to_say', which every field ends with. That lets a
//     single translation key cover the decline option everywhere.
//
// Pure leaf module (no imports) so server components, client components,
// and route handlers can all use it.

export const DEMOGRAPHIC_FIELDS = [
  'age_range',
  'gender',
  'cultural_group',
  'education',
  'religion',
] as const;

export type DemographicField = (typeof DEMOGRAPHIC_FIELDS)[number];

/** The shared explicit-decline option, valid on every field. */
export const PREFER_NOT_TO_SAY = 'prefer_not_to_say';

export const AGE_RANGE_OPTIONS = [
  'under_18',
  '18_24',
  '25_34',
  '35_44',
  '45_54',
  '55_64',
  '65_plus',
  PREFER_NOT_TO_SAY,
] as const;

export const GENDER_OPTIONS = ['woman', 'man', 'non_binary', 'another', PREFER_NOT_TO_SAY] as const;

// Broad world-region heritage buckets. Deliberately coarse — this is about
// cultural background for cross-cultural research, not nationality or race.
export const CULTURAL_GROUP_OPTIONS = [
  'east_asian',
  'south_asian',
  'southeast_asian',
  'central_asian',
  'mena', // Middle Eastern / North African
  'sub_saharan_african',
  'european',
  'latin_american',
  'north_american',
  'oceanian',
  'mixed_other',
  PREFER_NOT_TO_SAY,
] as const;

// Highest level completed (simplified ISCED-style ladder).
export const EDUCATION_OPTIONS = [
  'less_than_secondary',
  'secondary',
  'vocational',
  'some_tertiary',
  'bachelors',
  'masters',
  'doctorate',
  PREFER_NOT_TO_SAY,
] as const;

// Major traditions + the secular spectrum. Most worldview-relevant field.
export const RELIGION_OPTIONS = [
  'christianity',
  'islam',
  'hinduism',
  'buddhism',
  'judaism',
  'sikhism',
  'folk_traditional',
  'other_religion',
  'spiritual_not_religious',
  'agnostic',
  'atheist',
  PREFER_NOT_TO_SAY,
] as const;

/** Allowed option codes per field. The single source the API + UI read. */
export const DEMOGRAPHIC_OPTIONS: Record<DemographicField, readonly string[]> = {
  age_range: AGE_RANGE_OPTIONS,
  gender: GENDER_OPTIONS,
  cultural_group: CULTURAL_GROUP_OPTIONS,
  education: EDUCATION_OPTIONS,
  religion: RELIGION_OPTIONS,
};

/** A bag of (optional) demographic answers. `null` clears a field. */
export type DemographicValues = Partial<Record<DemographicField, string | null>>;

/** True if `field` is one of the five fields we collect. */
export function isDemographicField(field: string): field is DemographicField {
  return (DEMOGRAPHIC_FIELDS as readonly string[]).includes(field);
}

/** True if `value` is an allowed option code for `field`. */
export function isValidDemographicValue(field: DemographicField, value: unknown): value is string {
  return typeof value === 'string' && DEMOGRAPHIC_OPTIONS[field].includes(value);
}

/** The i18n key for a field's label, e.g. demo.age_range.label. */
export function fieldLabelKey(field: DemographicField): string {
  return `demo.${field}.label`;
}

/** The i18n key for an option's label, e.g. demo.opt.east_asian. */
export function optionLabelKey(code: string): string {
  return `demo.opt.${code}`;
}
