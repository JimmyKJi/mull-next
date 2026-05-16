// Curated philosopher-pair list for /vs/[a]/[b] SEO pages.
//
// We DON'T statically generate all C(560, 2) ≈ 156k pairs — most have
// no organic-search demand. Instead, ship a tight list of the matchups
// people actually search: "Plato vs Aristotle", "Nietzsche vs Kant",
// "Sartre vs Camus", etc. Each becomes a pre-rendered HTML page that
// Google can index.
//
// All other pairs (rendered on-demand when a user constructs a URL by
// hand or follows an internal link) still work — they just don't sit
// in the sitemap. The page itself is fully generic; the curated list
// is purely about which slugs get blessed for static prerender + the
// sitemap.
//
// Slug rules: alphabetical order is canonical. /vs/aristotle/plato is
// the canonical form; /vs/plato/aristotle 301-redirects to it. Keeps
// us from accidentally splitting backlinks + indexing two URLs for
// the same page.
//
// The pair entries here use the philosopher's full name; the slug
// computation runs through philosopherSlug() at build time.

import { philosopherSlug, PHILOSOPHERS } from './philosophers';

/** Pairs we explicitly want indexed + prerendered. Order within each
 *  pair doesn't matter — canonicalisation happens in toCanonicalPair.
 *  Names MUST match an entry in PHILOSOPHERS exactly (slug-resolves). */
export const CURATED_VS_PAIRS: readonly [string, string][] = [
  ['Plato', 'Aristotle'],
  ['Nietzsche', 'Kant'],
  ['Sartre', 'Camus'],
  ['Hobbes', 'Locke'],
  ['Marx', 'Adam Smith'],
  ['Hume', 'Kant'],
  ['Descartes', 'Spinoza'],
  ['Mill', 'Jeremy Bentham'],
  ['Confucius', 'Laozi'],
  ['Wittgenstein', 'Heidegger'],
  ['Confucius', 'Mencius'],
  ['Hegel', 'Marx'],
  ['Kierkegaard', 'Nietzsche'],
  ['Schopenhauer', 'Nietzsche'],
  ['Rousseau', 'Hobbes'],
  ['Thomas Aquinas', 'Augustine'],
  ['Bertrand Russell', 'Wittgenstein'],
  ['Locke', 'Hume'],
  ['Berkeley', 'Locke'],
  ['Spinoza', 'Leibniz'],
  ['William James', 'John Dewey'],
  ['Buddha', 'Confucius'],
  ['Simone de Beauvoir', 'Sartre'],
  ['Mary Wollstonecraft', 'Mill'],
  ['Hannah Arendt', 'Heidegger'],
  ['Nietzsche', 'Plato'],
  ['Aristotle', 'Confucius'],
  ['Karl Popper', 'Thomas Kuhn'],
  ['John Rawls', 'Peter Singer'],
  ['Peter Singer', 'Bernard Williams'],
] as const;

/** Canonicalises a pair by sorting alphabetically by slug. Returns the
 *  ordered tuple of slugs and a "matched both" flag. */
export function toCanonicalPair(
  nameA: string,
  nameB: string,
): { a: string; b: string } {
  const sa = philosopherSlug(nameA);
  const sb = philosopherSlug(nameB);
  return sa < sb ? { a: sa, b: sb } : { a: sb, b: sa };
}

/** Cached set of canonical curated slug-pair strings ("a|b") for fast
 *  lookup during generateStaticParams + canonical-vs-other checks. */
let _curatedSet: Set<string> | null = null;
function buildCuratedSet(): Set<string> {
  if (_curatedSet) return _curatedSet;
  const s = new Set<string>();
  for (const [n1, n2] of CURATED_VS_PAIRS) {
    const { a, b } = toCanonicalPair(n1, n2);
    s.add(`${a}|${b}`);
  }
  _curatedSet = s;
  return s;
}

/** All canonical pair tuples — used by generateStaticParams + sitemap. */
export function curatedPairSlugs(): { a: string; b: string }[] {
  const out: { a: string; b: string }[] = [];
  for (const [n1, n2] of CURATED_VS_PAIRS) {
    out.push(toCanonicalPair(n1, n2));
  }
  // De-dupe in case the curated list has overlaps.
  const seen = new Set<string>();
  return out.filter(p => {
    const k = `${p.a}|${p.b}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

export function isCuratedPair(a: string, b: string): boolean {
  const sorted = a < b ? `${a}|${b}` : `${b}|${a}`;
  return buildCuratedSet().has(sorted);
}

// ─── Comparison analytics ────────────────────────────────────────────

import { DIM_KEYS, DIM_NAMES, type DimKey } from './dimensions';

export type DimComparison = {
  key: DimKey;
  name: string;
  /** 0-10. Higher = more present in this philosopher. */
  valueA: number;
  valueB: number;
  /** valueA - valueB. Positive means A scores higher. */
  delta: number;
  /** Absolute delta — sort key. */
  absDelta: number;
};

/** Build a full 16-dim comparison between two philosophers, returned
 *  pre-sorted by absolute delta descending. Top of the list = biggest
 *  disagreement; bottom = closest agreement. */
export function compareDimensions(
  vectorA: number[],
  vectorB: number[],
): DimComparison[] {
  return DIM_KEYS.map((key, i): DimComparison => {
    const a = vectorA[i] ?? 0;
    const b = vectorB[i] ?? 0;
    return {
      key,
      name: DIM_NAMES[key],
      valueA: a,
      valueB: b,
      delta: a - b,
      absDelta: Math.abs(a - b),
    };
  }).sort((x, y) => y.absDelta - x.absDelta);
}

/** A short evocative phrase describing the gap on this dimension.
 *  Used in the auto-generated "where they disagreed" section. The
 *  phrasing is intentionally template-y; this isn't AI-essay quality,
 *  but it's truthful, scannable, and respects the dimension's
 *  meaning. */
export function disagreementPhrase(
  c: DimComparison,
  nameA: string,
  nameB: string,
): string {
  const higher = c.delta > 0 ? nameA : nameB;
  const lower = c.delta > 0 ? nameB : nameA;
  const gap = c.absDelta;
  const intensifier = gap >= 6 ? 'sharply' : gap >= 4 ? 'clearly' : 'somewhat';

  // Dimension-specific phrasing. Fallback for any we don't have a
  // hand-written one for.
  const templates: Record<DimKey, string> = {
    TV: `${higher} sees tragedy and limit as central; ${lower} doesn't make that the starting point.`,
    VA: `${higher} affirms life as it is more readily; ${lower} qualifies that affirmation.`,
    WP: `${higher} emphasises shaping and self-overcoming; ${lower} weighs acceptance or context more.`,
    TR: `${higher} trusts reasoned argument more strongly than ${lower} does.`,
    TE: `${higher} grounds knowing in lived experience; ${lower} weights other sources of evidence more.`,
    RT: `${higher} treats inherited tradition as a source of wisdom; ${lower} is readier to question it.`,
    MR: `${higher} is more open to mystical or apophatic depths; ${lower} stays within what reason can name.`,
    SR: `${higher} holds doubt and suspended judgment as a discipline; ${lower} is more willing to commit.`,
    CE: `${higher} locates the self in community and relationship; ${lower} starts from the individual.`,
    SS: `${higher} treats the individual as the seat of moral authority; ${lower} embeds it elsewhere.`,
    PO: `${higher} is oriented toward what helps a life go well in practice; ${lower} foregrounds other priorities.`,
    TD: `${higher} pursues understanding for its own sake; ${lower} is more interested in what understanding is for.`,
    AT: `${higher} values restraint and ascetic discipline; ${lower} is less drawn to that path.`,
    ES: `${higher} trusts the body and the senses; ${lower} is more dualist or sceptical of them.`,
    UI: `${higher} reaches for universal moral principles; ${lower} weighs particular contexts more heavily.`,
    SI: `${higher} treats the unified self as an illusion or construction; ${lower} takes the self as more given.`,
  };

  return `${intensifier} (${gap}/10): ${templates[c.key]}`;
}

/** A short evocative phrase describing agreement on a dimension. */
export function agreementPhrase(c: DimComparison): string {
  const avg = (c.valueA + c.valueB) / 2;
  if (avg >= 7) return `Both lean strongly into ${c.name.toLowerCase()}.`;
  if (avg >= 5) return `Both register moderate ${c.name.toLowerCase()}.`;
  if (avg >= 3) return `Both keep ${c.name.toLowerCase()} muted.`;
  return `Both have very little ${c.name.toLowerCase()}.`;
}
