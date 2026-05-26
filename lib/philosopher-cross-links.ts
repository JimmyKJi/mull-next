// Reverse-index lookups for the /philosopher/[slug] detail page.
//
// Topics and vs-pairs are organized by topic/pair as their primary
// surface, but each philosopher page wants the inverse: "which topics
// list this person?" and "which matchups feature them?"
//
// Both indexes are built once at module load. The TOPICS and
// CURATED_VS_PAIRS arrays are small enough (~30 + ~60 entries) that
// this is trivially cheap.

import { TOPICS, type Topic } from './topics';
import { CURATED_VS_PAIRS, toCanonicalPair } from './vs-pairs';
import { philosopherSlug } from './philosophers';

type TopicLink = { slug: string; title: string; summary: string };
type VsLink = { partner: string; href: string };

let _topicsByPhilosopher: Map<string, TopicLink[]> | null = null;
function buildTopicIndex(): Map<string, TopicLink[]> {
  if (_topicsByPhilosopher) return _topicsByPhilosopher;
  const m = new Map<string, TopicLink[]>();
  for (const t of TOPICS) {
    for (const name of t.philosopherNames) {
      const slug = philosopherSlug(name);
      const arr = m.get(slug) ?? [];
      arr.push({ slug: t.slug, title: t.title, summary: t.summary });
      m.set(slug, arr);
    }
  }
  _topicsByPhilosopher = m;
  return m;
}

let _vsByPhilosopher: Map<string, VsLink[]> | null = null;
function buildVsIndex(): Map<string, VsLink[]> {
  if (_vsByPhilosopher) return _vsByPhilosopher;
  const m = new Map<string, VsLink[]>();
  const seenHref = new Map<string, Set<string>>();

  for (const [n1, n2] of CURATED_VS_PAIRS) {
    const s1 = philosopherSlug(n1);
    const s2 = philosopherSlug(n2);
    const canonical = toCanonicalPair(n1, n2);
    const href = `/vs/${canonical.a}/${canonical.b}`;

    // For each name in the pair, the "partner" is the other one.
    // De-dupe per philosopher (in case the curated list has overlaps).
    for (const [self, partner] of [[s1, n2], [s2, n1]] as const) {
      const seen = seenHref.get(self) ?? new Set();
      if (seen.has(href)) continue;
      seen.add(href);
      seenHref.set(self, seen);
      const arr = m.get(self) ?? [];
      arr.push({ partner, href });
      m.set(self, arr);
    }
  }
  _vsByPhilosopher = m;
  return m;
}

/** Topics that explicitly list this philosopher in their
 *  `philosopherNames` array. Order matches the topics file. */
export function topicsForPhilosopher(slug: string): TopicLink[] {
  return buildTopicIndex().get(slug) ?? [];
}

/** Matchup pages featuring this philosopher. Returns the partner name
 *  + the canonical /vs/<a>/<b> href. */
export function matchupsForPhilosopher(slug: string): VsLink[] {
  return buildVsIndex().get(slug) ?? [];
}
