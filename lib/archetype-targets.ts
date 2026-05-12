// Canonical 16-D target vectors for the ten Mull archetypes.
//
// Why this file exists: the archetype target vectors used to live in
// three places — scripts/gen-philosophers.mjs, public/mull.html, and
// scripts/check-philosopher-calibration.mjs — which is exactly the
// kind of duplication that drifts silently. The pre-launch session
// already had to bump Cartographer's PO from 6 to 8 to fix Aria-the-
// Aristotelian's classification; the change had to be made in all
// three places, and the calibration script was added later (so the
// risk of drift is permanent until consolidated).
//
// This module is the source of truth. The other places should import
// from here when they need archetype targets — see the Wave 2
// generator and the calibration script for examples. public/mull.html
// still has its own copy because it's a static HTML file with inline
// JS, not a module — but it should be kept in sync by hand (and
// future code changes should prefer to move logic out of mull.html
// rather than add new copies).

export type ArchetypeTarget = {
  /** Slug used for /archetype/[slug] routes + asset lookups. */
  key: string;
  /** Display name, capitalized + with "The" prefix. */
  name: string;
  /**
   * Partial dim signature. Unspecified dimensions default to 5 (the
   * midpoint of the 0–10 range). Keep the targets sparse — only
   * encode the dims that genuinely characterize the archetype.
   */
  p: Partial<Record<DimKey, number>>;
};

export type DimKey =
  | 'TV' | 'VA' | 'WP' | 'TR' | 'TE' | 'RT' | 'MR' | 'SR'
  | 'CE' | 'SS' | 'PO' | 'TD' | 'AT' | 'ES' | 'UI' | 'SI';

export const DIM_KEYS_ORDER: readonly DimKey[] = [
  'TV','VA','WP','TR','TE','RT','MR','SR','CE','SS','PO','TD','AT','ES','UI','SI',
] as const;

export const ARCHETYPE_TARGETS: readonly ArchetypeTarget[] = [
  { key: 'cartographer', name: 'The Cartographer', p: { TV:4,VA:6,WP:3,TR:9,TE:7,RT:6,MR:2,SR:3,CE:5,SS:5,PO:8,TD:9,AT:5,ES:5,UI:7,SI:3 } },
  { key: 'keel',         name: 'The Keel',         p: { TV:7,VA:6,WP:2,TR:8,TE:6,RT:6,MR:3,SR:4,CE:6,SS:5,PO:9,TD:5,AT:8,ES:3,UI:7,SI:3 } },
  { key: 'threshold',    name: 'The Threshold',    p: { TV:9,VA:4,WP:2,TR:4,TE:7,RT:5,MR:9,SR:5,CE:6,SS:3,PO:8,TD:4,AT:8,ES:2,UI:7,SI:9 } },
  { key: 'pilgrim',      name: 'The Pilgrim',      p: { TV:8,VA:6,WP:5,TR:5,TE:6,RT:2,MR:3,SR:7,CE:3,SS:9,PO:7,TD:6,AT:3,ES:5,UI:4,SI:4 } },
  { key: 'touchstone',   name: 'The Touchstone',   p: { TV:4,VA:6,WP:3,TR:4,TE:9,RT:4,MR:1,SR:9,CE:4,SS:6,PO:7,TD:7,AT:3,ES:6,UI:3,SI:5 } },
  { key: 'hearth',       name: 'The Hearth',       p: { TV:4,VA:6,WP:3,TR:6,TE:7,RT:9,MR:3,SR:3,CE:9,SS:2,PO:9,TD:4,AT:5,ES:5,UI:6,SI:2 } },
  { key: 'forge',        name: 'The Forge',        p: { TV:5,VA:7,WP:8,TR:7,TE:7,RT:2,MR:1,SR:5,CE:8,SS:5,PO:8,TD:6,AT:3,ES:5,UI:8,SI:3 } },
  { key: 'hammer',       name: 'The Hammer',       p: { TV:7,VA:8,WP:9,TR:4,TE:6,RT:1,MR:3,SR:7,CE:2,SS:9,PO:6,TD:6,AT:4,ES:6,UI:3,SI:4 } },
  { key: 'garden',       name: 'The Garden',       p: { TV:3,VA:8,WP:4,TR:5,TE:8,RT:4,MR:1,SR:5,CE:5,SS:6,PO:8,TD:5,AT:2,ES:9,UI:4,SI:3 } },
  { key: 'lighthouse',   name: 'The Lighthouse',   p: { TV:5,VA:5,WP:5,TR:9,TE:3,RT:4,MR:6,SR:2,CE:5,SS:5,PO:5,TD:9,AT:6,ES:3,UI:9,SI:3 } },
] as const;

/** Expand an ArchetypeTarget's partial signature into a full 16-D vector. */
export function expandArchetypeVector(target: ArchetypeTarget): number[] {
  return DIM_KEYS_ORDER.map(k => target.p[k] ?? 5);
}

/** All ten archetype keys, in canonical order. */
export const ARCHETYPE_KEYS: readonly string[] =
  ARCHETYPE_TARGETS.map(t => t.key);
