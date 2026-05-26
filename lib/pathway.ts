// Pathway: "what's the natural next step from this surface?"
//
// Every content page on Mull eventually wants to send the user somewhere
// useful. Before this lived in scattered ad-hoc CTAs at the bottom of
// each page — sometimes a quiz button, sometimes nothing, sometimes a
// share link. The result was that most users discovered the SEO surface
// once and never found the retention features (Spar, Pilgrimage, etc.).
//
// This module defines, per surface type, three to four stations on
// the user's natural trail from here. The pathway is rendered as a
// hand-drawn trail by <PathwayNext />: a horizontal strip of pixel-art
// stations connected by dashed lines, each station an illustrated card
// (archetype/philosopher sprite or glyph) with a one-line "why go
// here" — not just a button.
//
// Each pathway returns TWO variants:
//   - cold: the trail for a first-time visitor (no archetype yet).
//     Always leads with the quiz, because that's the unlocking move.
//   - warm: the trail for a returning user (has archetype in
//     localStorage). Skips the quiz, foregrounds the retention loop.
//
// PathwayNext picks the variant client-side after hydration. If a
// surface only defines `cold`, warm visitors see the same trail.

import { ARCHETYPES, getArchetypeByKey } from './archetypes';
import { TOPICS, findTopic } from './topics';
import { EXERCISES } from './exercises';
import { PHILOSOPHERS, philosopherSlug, getPhilosopherBySlug, nearestPhilosophers } from './philosophers';
import { getArchetypeColor } from './archetype-colors';

export type PathwayVisual =
  | { kind: 'archetype'; archetypeKey: string }
  | { kind: 'philosopher'; name: string; archetypeKey?: string }
  | { kind: 'glyph'; glyph: string };

export type PathwayStation = {
  visual: PathwayVisual;
  /** 1-3 word label — large pixel-style headline. */
  title: string;
  /** 1-sentence "why go here" — italic editorial line. */
  blurb: string;
  /** Click target. */
  href: string;
  /** Hex accent for shadow + border. */
  accent: string;
  /** Tiny uppercase pill — e.g. "QUIZ", "ARENA", "DAILY". */
  tag: string;
};

export type Pathway = {
  /** Trail shown when no archetype is set (first visit). */
  cold: PathwayStation[];
  /** Trail shown when archetype is set. Optional — falls back to cold. */
  warm?: PathwayStation[];
};

// ─── Reusable stations ──────────────────────────────────────────────

const STATION_QUIZ: PathwayStation = {
  visual: { kind: 'glyph', glyph: '◆' },
  title: 'The Inheritor',
  blurb: '15-minute murder mystery. By the end you have a placement on the map.',
  href: '/quiz/journey',
  accent: '#B8862F',
  tag: 'QUIZ',
};

const STATION_QUICK_QUIZ: PathwayStation = {
  visual: { kind: 'glyph', glyph: '◇' },
  title: 'The 5-min quiz',
  blurb: 'Faster, lighter, less story — same map at the end.',
  href: '/quiz?mode=quick',
  accent: '#8C6520',
  tag: 'QUIZ',
};

const STATION_SPAR: PathwayStation = {
  visual: { kind: 'glyph', glyph: '⚔' },
  title: "Today's Spar",
  blurb: 'One philosopher, one topic, five minutes. A new one drops every day.',
  href: '/spar',
  accent: '#7A2E2E',
  tag: 'DAILY',
};

const STATION_DILEMMA: PathwayStation = {
  visual: { kind: 'glyph', glyph: '◐' },
  title: "Today's dilemma",
  blurb: "One unfair scenario per day. Write a response, see how others answered.",
  href: '/dilemma',
  accent: '#3D5A7E',
  tag: 'DAILY',
};

const STATION_CRUCIBLE: PathwayStation = {
  visual: { kind: 'glyph', glyph: '✦' },
  title: 'The Crucible',
  blurb: 'A philosophical action to actually do today. Tomorrow you report back.',
  href: '/crucible',
  accent: '#A65846',
  tag: 'DAILY',
};

const STATION_DIARY: PathwayStation = {
  visual: { kind: 'glyph', glyph: '◈' },
  title: 'The Argument Diary',
  blurb: 'Paste a real disagreement, have it rebuilt with rigor.',
  href: '/argument-diary',
  accent: '#6B7F4F',
  tag: 'PRACTICE',
};

const STATION_ANTHOLOGY: PathwayStation = {
  visual: { kind: 'glyph', glyph: '✧' },
  title: 'Your anthology',
  blurb: 'A commonplace book — keep the lines that struck you.',
  href: '/anthology',
  accent: '#7C5A8C',
  tag: 'RETURN',
};

/** Display name for an archetype. The canonical translated name lives
 *  in translations under `arch.<key>.name`, but this lib is pure data
 *  (no i18n access) — and every archetype name is "The <Key>", so a
 *  simple capitalize works. */
function archetypeDisplayName(key: string): string {
  return 'The ' + key.charAt(0).toUpperCase() + key.slice(1);
}

function stationArchetype(archetypeKey: string, suffix?: string): PathwayStation {
  const a = getArchetypeByKey(archetypeKey);
  const color = getArchetypeColor(archetypeKey);
  return {
    visual: { kind: 'archetype', archetypeKey },
    title: archetypeDisplayName(archetypeKey),
    blurb: suffix ?? a?.spirit ?? 'Read the full essay.',
    href: `/archetype/${archetypeKey}`,
    accent: color.deep,
    tag: 'ESSAY',
  };
}

function stationPilgrimage(archetypeKey: string): PathwayStation {
  const color = getArchetypeColor(archetypeKey);
  return {
    visual: { kind: 'archetype', archetypeKey },
    title: `${archetypeDisplayName(archetypeKey)} pilgrimage`,
    blurb: '30 days, one micro-practice each, sized to this archetype. The slow build.',
    href: '/pilgrimage',
    accent: color.deep,
    tag: 'JOURNEY',
  };
}

function stationPhilosopher(name: string, blurb: string): PathwayStation {
  const p = getPhilosopherBySlug(philosopherSlug(name));
  const accent = p ? getArchetypeColor(p.archetypeKey).deep : '#8C6520';
  return {
    visual: { kind: 'philosopher', name: p?.name ?? name, archetypeKey: p?.archetypeKey },
    title: p?.name ?? name,
    blurb,
    href: `/philosopher/${philosopherSlug(name)}`,
    accent,
    tag: 'PROFILE',
  };
}

function stationVs(nameA: string, nameB: string, blurb: string): PathwayStation {
  const slugA = philosopherSlug(nameA);
  const slugB = philosopherSlug(nameB);
  const [a, b] = slugA < slugB ? [slugA, slugB] : [slugB, slugA];
  return {
    visual: { kind: 'glyph', glyph: '⚖' },
    title: `${nameA} vs ${nameB}`,
    blurb,
    href: `/vs/${a}/${b}`,
    accent: '#3D5A7E',
    tag: 'COMPARE',
  };
}

function stationExercise(slug: string, blurb?: string): PathwayStation | null {
  const ex = EXERCISES.find(e => e.slug === slug);
  if (!ex) return null;
  const glyph =
    ex.category === 'contemplative' ? '☷' :
    ex.category === 'logic' ? '⊕' :
    '◍';
  const accent =
    ex.category === 'contemplative' ? '#2F5D5C' :
    ex.category === 'logic' ? '#1E3A5F' :
    '#7A2E2E';
  return {
    visual: { kind: 'glyph', glyph },
    title: ex.name,
    blurb: blurb ?? ex.summary,
    href: `/exercises/${slug}`,
    accent,
    tag: 'PRACTICE',
  };
}

function stationTopic(slug: string, blurb?: string): PathwayStation | null {
  const t = findTopic(slug);
  if (!t) return null;
  return {
    visual: { kind: 'glyph', glyph: '◓' },
    title: t.title,
    blurb: blurb ?? t.summary,
    href: `/topic/${slug}`,
    accent: '#6B7F4F',
    tag: 'TOPIC',
  };
}

function stationArena(opponentName?: string): PathwayStation {
  return {
    visual: { kind: 'glyph', glyph: '⚔' },
    title: opponentName ? `Argue ${opponentName}` : 'The Arena',
    blurb: opponentName
      ? `Face ${opponentName} in a 5-minute single-turn debate, judged on rigor.`
      : 'Pick a philosopher, write your argument, get judged on rigor + engagement.',
    href: '/arena',
    accent: '#7A2E2E',
    tag: 'ARENA',
  };
}

// ─── Per-surface pathway builders ───────────────────────────────────

export function pathwayForTopic(topicSlug: string): Pathway {
  const t = findTopic(topicSlug);
  const cold: PathwayStation[] = [];

  // Cold lead: the quiz — the unlocking move.
  cold.push({
    ...STATION_QUIZ,
    blurb: t
      ? `Find where you sit on ${t.title.toLowerCase()} and 15 other dimensions.`
      : STATION_QUIZ.blurb,
  });

  // Middle: a flagship philosopher from this topic.
  if (t && t.philosopherNames.length > 0) {
    const flagshipName = t.philosopherNames[0];
    cold.push(stationPhilosopher(
      flagshipName,
      `One of the thinkers who lived this question. Read their position in their own register.`
    ));
  }

  // Tail: daily ritual.
  cold.push(STATION_SPAR);

  // Warm trail: skip the quiz; lead with archetype pilgrimage,
  // keep the philosopher recommendation, end with daily ritual.
  // Note: warm trail is generated client-side using actual archetype.
  // Stations below are a generic warm fallback if archetype unknown.
  const warm: PathwayStation[] = [];
  if (t && t.relatedArchetypes.length > 0) {
    warm.push(stationArchetype(t.relatedArchetypes[0], `Your archetype's 30-day pilgrimage starts here.`));
  }
  if (t && t.philosopherNames.length > 0) {
    warm.push(stationPhilosopher(t.philosopherNames[0], 'The thinker most associated with this question.'));
  }
  warm.push(STATION_SPAR);

  return { cold, warm };
}

export function pathwayForPhilosopher(slug: string): Pathway {
  const p = getPhilosopherBySlug(slug);
  if (!p) return { cold: [STATION_QUIZ, STATION_SPAR, STATION_DILEMMA] };

  const cold: PathwayStation[] = [];

  // Cold lead: the quiz — frame it as "see if you think like this one".
  cold.push({
    ...STATION_QUIZ,
    blurb: `Find your archetype — discover whether you'd argue with ${p.name} or alongside them.`,
  });

  // Middle: head-to-head with the nearest dimensional neighbor.
  const nearest = nearestPhilosophers(p, 3);
  if (nearest.length > 0) {
    const partner = nearest[0];
    cold.push(stationVs(
      p.name,
      partner.name,
      `On Mull's map ${partner.name} sits closest. See where they agree and where they part.`
    ));
  }

  // Tail: daily ritual.
  cold.push(STATION_SPAR);

  // Warm: Arena duel + matchup + daily.
  const warm: PathwayStation[] = [];
  warm.push(stationArena(p.name));
  if (nearest.length > 0) {
    warm.push(stationVs(p.name, nearest[0].name, `See how ${p.name} and ${nearest[0].name} disagreed.`));
  }
  warm.push(STATION_SPAR);

  return { cold, warm };
}

export function pathwayForArchetype(archetypeKey: string): Pathway {
  const a = getArchetypeByKey(archetypeKey);
  if (!a) return { cold: [STATION_QUIZ, STATION_SPAR, STATION_DILEMMA] };

  // Find a flagship philosopher of this archetype.
  const flagship = PHILOSOPHERS.find(p => p.archetypeKey === archetypeKey);

  const cold: PathwayStation[] = [];

  cold.push({
    ...STATION_QUIZ,
    blurb: `Take the quiz — find out if you're a ${archetypeDisplayName(archetypeKey)}, or somewhere nearby.`,
  });
  if (flagship) {
    cold.push(stationPhilosopher(
      flagship.name,
      `A thinker who lived close to this archetype. Read them as a window into the type.`
    ));
  }
  // Tail: an exercise tied to this archetype.
  const exSlug = a.suggestedExercises?.[0];
  if (exSlug) {
    const ex = stationExercise(exSlug, `A practice this archetype tends to find natural.`);
    if (ex) cold.push(ex);
  } else {
    cold.push(STATION_SPAR);
  }

  // Warm: pilgrimage primary + a daily ritual + archetype's flagship exercise.
  const warm: PathwayStation[] = [];
  warm.push(stationPilgrimage(archetypeKey));
  warm.push(STATION_SPAR);
  if (exSlug) {
    const ex = stationExercise(exSlug);
    if (ex) warm.push(ex);
  } else {
    warm.push(STATION_DIARY);
  }

  return { cold, warm };
}

export function pathwayForVs(slugA: string, slugB: string): Pathway {
  const pa = getPhilosopherBySlug(slugA);
  const pb = getPhilosopherBySlug(slugB);
  if (!pa || !pb) return { cold: [STATION_QUIZ, STATION_SPAR, STATION_DILEMMA] };

  const cold: PathwayStation[] = [];
  cold.push({
    ...STATION_QUIZ,
    blurb: `Take the quiz — see which of them you sit closer to on the map.`,
  });
  // Pick a bridging philosopher (nearest to pa that isn't pb).
  const bridges = nearestPhilosophers(pa, 5).filter(p => p.name !== pb.name);
  if (bridges.length > 0) {
    cold.push(stationPhilosopher(
      bridges[0].name,
      `A third thinker who sits between them — useful for triangulating.`
    ));
  }
  cold.push(stationArena(pa.name));

  const warm: PathwayStation[] = [];
  warm.push(stationArena(pa.name));
  warm.push(stationArena(pb.name));
  warm.push(STATION_SPAR);

  return { cold, warm };
}

export function pathwayForExercise(exerciseSlug: string): Pathway {
  const ex = EXERCISES.find(e => e.slug === exerciseSlug);

  const cold: PathwayStation[] = [];
  cold.push({
    ...STATION_QUIZ,
    blurb: 'Find your archetype — exercises hit differently when tuned to who you are.',
  });
  // Surface another exercise in the same category.
  if (ex) {
    const sibling = EXERCISES.find(e => e.category === ex.category && e.slug !== ex.slug);
    if (sibling) {
      cold.push({
        visual: { kind: 'glyph', glyph: ex.category === 'contemplative' ? '☷' : ex.category === 'logic' ? '⊕' : '◍' },
        title: sibling.name,
        blurb: sibling.summary,
        href: `/exercises/${sibling.slug}`,
        accent: ex.category === 'contemplative' ? '#2F5D5C' : ex.category === 'logic' ? '#1E3A5F' : '#7A2E2E',
        tag: 'NEXT EXERCISE',
      });
    }
  }
  cold.push(STATION_CRUCIBLE);

  const warm: PathwayStation[] = [];
  warm.push(STATION_CRUCIBLE);
  warm.push(STATION_ANTHOLOGY);
  warm.push(STATION_SPAR);

  return { cold, warm };
}

export function pathwayForDilemma(): Pathway {
  return {
    cold: [
      { ...STATION_QUIZ, blurb: 'Find your archetype — see why you reach for the answer you do.' },
      STATION_SPAR,
      STATION_CRUCIBLE,
    ],
    warm: [STATION_SPAR, STATION_CRUCIBLE, STATION_DIARY],
  };
}

export function pathwayForMap(): Pathway {
  return {
    cold: [
      { ...STATION_QUIZ, blurb: 'Add your point to the map — see who you cluster with.' },
      STATION_DILEMMA,
      STATION_SPAR,
    ],
    warm: [STATION_SPAR, STATION_DILEMMA, STATION_ANTHOLOGY],
  };
}

/** Returns the pathway with the warm trail rebuilt to use a specific
 *  archetype. Used by the client component once it reads the
 *  archetype from localStorage. */
export function personalizeWarmTrail(
  pathway: Pathway,
  archetypeKey: string,
): PathwayStation[] {
  const a = getArchetypeByKey(archetypeKey);
  if (!a) return pathway.warm ?? pathway.cold;
  const exSlug = a.suggestedExercises?.[0];
  const ex = exSlug ? stationExercise(exSlug) : null;
  return [
    stationPilgrimage(archetypeKey),
    STATION_SPAR,
    ex ?? STATION_DIARY,
  ];
}
