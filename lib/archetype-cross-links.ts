// Reverse-index lookups for the /archetype/[slug] detail page.
//
// Topics are organised by topic as their primary surface, but each
// archetype page wants the inverse: "which topics cluster on this
// archetype?" Mirror of lib/philosopher-cross-links.ts.

import { TOPICS, type Topic } from './topics';

let _topicsByArchetype: Map<string, { slug: string; title: string; summary: string }[]> | null =
  null;
function buildTopicIndex(): Map<string, { slug: string; title: string; summary: string }[]> {
  if (_topicsByArchetype) return _topicsByArchetype;
  const m = new Map<string, { slug: string; title: string; summary: string }[]>();
  for (const t of TOPICS) {
    for (const archKey of t.relatedArchetypes) {
      const arr = m.get(archKey) ?? [];
      arr.push({ slug: t.slug, title: t.title, summary: t.summary });
      m.set(archKey, arr);
    }
  }
  _topicsByArchetype = m;
  return m;
}

/** Topics whose `relatedArchetypes` list includes this archetype key.
 *  Used by /archetype/[slug] to render a "Topics that cluster here"
 *  section — internal-link gold + helps users see which philosophical
 *  questions tend to occupy this orientation. */
export function topicsForArchetype(
  archetypeKey: string,
): { slug: string; title: string; summary: string }[] {
  return buildTopicIndex().get(archetypeKey) ?? [];
}
