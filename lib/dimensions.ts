// Shared 16-dimension constants — kept in sync with mull.html DIMS array.
// Order matters: the same index across the codebase must mean the same dimension.

export const DIM_KEYS = [
  'TV', 'VA', 'WP', 'TR', 'TE', 'RT', 'MR', 'SR',
  'CE', 'SS', 'PO', 'TD', 'AT', 'ES', 'UI', 'SI'
] as const;

export type DimKey = typeof DIM_KEYS[number];

export const DIM_NAMES: Record<DimKey, string> = {
  TV: 'Tragic Vision',
  VA: 'Vital Affirmation',
  WP: 'Will to Power',
  TR: 'Trust in Reason',
  TE: 'Trust in Experience',
  RT: 'Reverence for Tradition',
  MR: 'Mystical Receptivity',
  SR: 'Skeptical Reflex',
  CE: 'Communal Embeddedness',
  SS: 'Sovereign Self',
  PO: 'Practical Orientation',
  TD: 'Theoretical Drive',
  AT: 'Ascetic Tendency',
  ES: 'Embodied Sensibility',
  UI: 'Universalist Impulse',
  SI: 'Self as Illusion'
};

export const DIM_DESCRIPTIONS: Record<DimKey, string> = {
  TV: 'Sees suffering and limitation as fundamental to existence; meaning grows through how you face them.',
  VA: 'Affirms life as it is — pleasure, beauty, being alive — without needing transcendent justification.',
  WP: 'Believes in shaping rather than accepting; value comes from effort, mastery, creating against resistance.',
  TR: 'Trusts careful reasoning from clear principles as the most reliable path to truth.',
  TE: 'Trusts direct observation and lived experience over abstract systems.',
  RT: 'Sees inherited practices and texts as carrying hidden wisdom.',
  MR: 'Senses there are truths beyond what language and reason can reach; values silence, depth, the apophatic.',
  SR: 'Habitually questions claims, suspends judgment, prefers humility about what we can really know.',
  CE: 'Locates the self in relationships, communities, traditions — we exist through and for others.',
  SS: 'Locates moral authority in the individual — you author your own life and answer for it yourself.',
  PO: 'Asks first what helps a life go well — wisdom is what works under real conditions.',
  TD: 'Pursues understanding for its own sake — the question matters more than any payoff.',
  AT: 'Values discipline, restraint, simplicity — meaning is found through what you give up.',
  ES: 'Trusts the body, the senses, the immediate world; suspicious of dualisms.',
  UI: 'Holds moral principles that apply to everyone, everywhere — not bounded by culture.',
  SI: 'Suspects the unified "self" is a story we tell — what\'s real is processes, not a fixed essence.'
};

// Convert a 16-D delta vector into top movements with names.
export function topShifts(
  delta: number[],
  threshold = 0.3,
  limit = 3
): { key: DimKey; name: string; delta: number }[] {
  if (!Array.isArray(delta) || delta.length !== 16) return [];
  return delta
    .map((d, i) => ({
      key: DIM_KEYS[i],
      name: DIM_NAMES[DIM_KEYS[i]],
      delta: +d.toFixed(2)
    }))
    .filter(d => Math.abs(d.delta) >= threshold)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, limit);
}
