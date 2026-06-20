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
//
// Every user-visible string flows through `t(key, locale)`. The builders
// take a `locale` and produce a fully-localized pathway; dynamic names
// (philosophers, archetypes, topics, exercises) route through the
// per-entity localizers.

import { getArchetypeByKey } from './archetypes';
import { findTopic } from './topics';
import { EXERCISES } from './exercises';
import {
  PHILOSOPHERS,
  philosopherSlug,
  getPhilosopherBySlug,
  nearestPhilosophers,
} from './philosophers';
import { nearestPhilosophersToVector } from './recommendations';
import { getArchetypeColor } from './archetype-colors';
import { t, type Locale } from './translations';
import { localizePhilosopher } from './philosophers-i18n';
import { localizeArchetype } from './archetypes-i18n';
import { localizeTopic } from './topics-i18n';
import { localizeExercise } from './exercises-i18n';

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

function stationQuiz(locale: Locale): PathwayStation {
  return {
    visual: { kind: 'glyph', glyph: '◆' },
    title: t('pathway.station.quiz.title', locale),
    blurb: t('pathway.station.quiz.blurb', locale),
    href: '/quiz/journey',
    accent: '#B8862F',
    tag: t('pathway.tag.quiz', locale),
  };
}

function stationSpar(locale: Locale): PathwayStation {
  return {
    visual: { kind: 'glyph', glyph: '⚔' },
    title: t('pathway.station.spar.title', locale),
    blurb: t('pathway.station.spar.blurb', locale),
    href: '/spar',
    accent: '#7A2E2E',
    tag: t('pathway.tag.daily', locale),
  };
}

function stationDilemma(locale: Locale): PathwayStation {
  return {
    visual: { kind: 'glyph', glyph: '◐' },
    title: t('pathway.station.dilemma.title', locale),
    blurb: t('pathway.station.dilemma.blurb', locale),
    href: '/dilemma',
    accent: '#3D5A7E',
    tag: t('pathway.tag.daily', locale),
  };
}

function stationCrucible(locale: Locale): PathwayStation {
  return {
    visual: { kind: 'glyph', glyph: '✦' },
    title: t('pathway.station.crucible.title', locale),
    blurb: t('pathway.station.crucible.blurb', locale),
    href: '/crucible',
    accent: '#A65846',
    tag: t('pathway.tag.daily', locale),
  };
}

function stationDiary(locale: Locale): PathwayStation {
  return {
    visual: { kind: 'glyph', glyph: '◈' },
    title: t('pathway.station.diary.title', locale),
    blurb: t('pathway.station.diary.blurb', locale),
    href: '/argument-diary',
    accent: '#6B7F4F',
    tag: t('pathway.tag.practice', locale),
  };
}

function stationAnthology(locale: Locale): PathwayStation {
  return {
    visual: { kind: 'glyph', glyph: '✧' },
    title: t('pathway.station.anthology.title', locale),
    blurb: t('pathway.station.anthology.blurb', locale),
    href: '/anthology',
    accent: '#7C5A8C',
    tag: t('pathway.tag.return', locale),
  };
}

/** Localized display name for an archetype. The canonical translated
 *  name lives in translations under `arch.<key>.name` for all 10 keys. */
function archetypeDisplayName(key: string, locale: Locale): string {
  return t(`arch.${key}.name`, locale);
}

function stationArchetype(archetypeKey: string, locale: Locale, suffix?: string): PathwayStation {
  const a = getArchetypeByKey(archetypeKey);
  const color = getArchetypeColor(archetypeKey);
  return {
    visual: { kind: 'archetype', archetypeKey },
    title: archetypeDisplayName(archetypeKey, locale),
    blurb: suffix ?? (a ? localizeArchetype(a, locale).spirit : t('pathway.read_essay', locale)),
    href: `/archetype/${archetypeKey}`,
    accent: color.deep,
    tag: t('pathway.tag.essay', locale),
  };
}

function stationPilgrimage(archetypeKey: string, locale: Locale): PathwayStation {
  const color = getArchetypeColor(archetypeKey);
  return {
    visual: { kind: 'archetype', archetypeKey },
    title: t('pathway.pilgrimage_title', locale, {
      arch: archetypeDisplayName(archetypeKey, locale),
    }),
    blurb: t('pathway.pilgrimage_blurb', locale),
    href: '/pilgrimage',
    accent: color.deep,
    tag: t('pathway.tag.journey', locale),
  };
}

function stationPhilosopher(name: string, blurb: string, locale: Locale): PathwayStation {
  const slug = philosopherSlug(name);
  const p = getPhilosopherBySlug(slug);
  const accent = p ? getArchetypeColor(p.archetypeKey).deep : '#8C6520';
  // visual.name stays English — it keys the sprite lookup. Only the
  // displayed title is localized.
  const displayName = p ? localizePhilosopher(p, slug, locale).name : name;
  return {
    visual: { kind: 'philosopher', name: p?.name ?? name, archetypeKey: p?.archetypeKey },
    title: displayName,
    blurb,
    href: `/philosopher/${slug}`,
    accent,
    tag: t('pathway.tag.profile', locale),
  };
}

/** Like stationPhilosopher, but framed as the user's nearest kin in the
 *  16-D space — the vector-personalized lead for a warm trail. Reuses the
 *  philosopher station's sprite/accent/href; only the blurb + tag change. */
function stationNearestMind(name: string, locale: Locale): PathwayStation {
  return {
    ...stationPhilosopher(name, t('pathway.nearest_you', locale), locale),
    tag: t('pathway.tag.kindred', locale),
  };
}

function stationVs(nameA: string, nameB: string, blurb: string, locale: Locale): PathwayStation {
  const slugA = philosopherSlug(nameA);
  const slugB = philosopherSlug(nameB);
  const [a, b] = slugA < slugB ? [slugA, slugB] : [slugB, slugA];
  const pA = getPhilosopherBySlug(slugA);
  const pB = getPhilosopherBySlug(slugB);
  const dispA = pA ? localizePhilosopher(pA, slugA, locale).name : nameA;
  const dispB = pB ? localizePhilosopher(pB, slugB, locale).name : nameB;
  return {
    visual: { kind: 'glyph', glyph: '⚖' },
    title: t('pathway.vs_title', locale, { a: dispA, b: dispB }),
    blurb,
    href: `/vs/${a}/${b}`,
    accent: '#3D5A7E',
    tag: t('pathway.tag.compare', locale),
  };
}

function stationExercise(slug: string, locale: Locale, blurb?: string): PathwayStation | null {
  const ex = EXERCISES.find((e) => e.slug === slug);
  if (!ex) return null;
  const lex = localizeExercise(ex, locale);
  const glyph = ex.category === 'contemplative' ? '☷' : ex.category === 'logic' ? '⊕' : '◍';
  const accent =
    ex.category === 'contemplative' ? '#2F5D5C' : ex.category === 'logic' ? '#1E3A5F' : '#7A2E2E';
  return {
    visual: { kind: 'glyph', glyph },
    title: lex.name,
    blurb: blurb ?? lex.summary,
    href: `/exercises/${slug}`,
    accent,
    tag: t('pathway.tag.practice', locale),
  };
}

function stationArena(locale: Locale, opponentName?: string): PathwayStation {
  let disp = opponentName;
  if (opponentName) {
    const slug = philosopherSlug(opponentName);
    const p = getPhilosopherBySlug(slug);
    if (p) disp = localizePhilosopher(p, slug, locale).name;
  }
  return {
    visual: { kind: 'glyph', glyph: '⚔' },
    title: disp
      ? t('pathway.arena_argue', locale, { name: disp })
      : t('pathway.arena_title', locale),
    blurb: disp
      ? t('pathway.arena_blurb_opp', locale, { name: disp })
      : t('pathway.arena_blurb', locale),
    href: '/arena',
    accent: '#7A2E2E',
    tag: t('pathway.tag.arena', locale),
  };
}

// ─── Per-surface pathway builders ───────────────────────────────────

export function pathwayForTopic(topicSlug: string, locale: Locale = 'en'): Pathway {
  const top = findTopic(topicSlug);
  const cold: PathwayStation[] = [];

  // Cold lead: the quiz — the unlocking move.
  cold.push({
    ...stationQuiz(locale),
    blurb: top
      ? t('pathway.topic.quiz', locale, { topic: localizeTopic(top, locale).title.toLowerCase() })
      : stationQuiz(locale).blurb,
  });

  // Middle: a flagship philosopher from this topic.
  if (top && top.philosopherNames.length > 0) {
    cold.push(
      stationPhilosopher(top.philosopherNames[0], t('pathway.topic.philosopher', locale), locale),
    );
  }

  // Tail: daily ritual.
  cold.push(stationSpar(locale));

  // Warm trail: skip the quiz; lead with archetype pilgrimage,
  // keep the philosopher recommendation, end with daily ritual.
  // Note: warm trail is generated client-side using actual archetype.
  // Stations below are a generic warm fallback if archetype unknown.
  const warm: PathwayStation[] = [];
  if (top && top.relatedArchetypes.length > 0) {
    warm.push(
      stationArchetype(top.relatedArchetypes[0], locale, t('pathway.topic.warm_archetype', locale)),
    );
  }
  if (top && top.philosopherNames.length > 0) {
    warm.push(
      stationPhilosopher(
        top.philosopherNames[0],
        t('pathway.topic.warm_philosopher', locale),
        locale,
      ),
    );
  }
  warm.push(stationSpar(locale));

  return { cold, warm };
}

export function pathwayForPhilosopher(slug: string, locale: Locale = 'en'): Pathway {
  const p = getPhilosopherBySlug(slug);
  if (!p) return { cold: [stationQuiz(locale), stationSpar(locale), stationDilemma(locale)] };

  const pName = localizePhilosopher(p, slug, locale).name;
  const cold: PathwayStation[] = [];

  // Cold lead: the quiz — frame it as "see if you think like this one".
  cold.push({
    ...stationQuiz(locale),
    blurb: t('pathway.philosopher.quiz', locale, { name: pName }),
  });

  // Middle: head-to-head with the nearest dimensional neighbor.
  const nearest = nearestPhilosophers(p, 3);
  if (nearest.length > 0) {
    const partner = nearest[0];
    const partnerName = localizePhilosopher(partner, philosopherSlug(partner.name), locale).name;
    cold.push(
      stationVs(
        p.name,
        partner.name,
        t('pathway.philosopher.vs', locale, { name: partnerName }),
        locale,
      ),
    );
  }

  // Tail: daily ritual.
  cold.push(stationSpar(locale));

  // Warm: Arena duel + matchup + daily.
  const warm: PathwayStation[] = [];
  warm.push(stationArena(locale, p.name));
  if (nearest.length > 0) {
    const partnerName = localizePhilosopher(
      nearest[0],
      philosopherSlug(nearest[0].name),
      locale,
    ).name;
    warm.push(
      stationVs(
        p.name,
        nearest[0].name,
        t('pathway.philosopher.warm_vs', locale, { a: pName, b: partnerName }),
        locale,
      ),
    );
  }
  warm.push(stationSpar(locale));

  return { cold, warm };
}

export function pathwayForArchetype(archetypeKey: string, locale: Locale = 'en'): Pathway {
  const a = getArchetypeByKey(archetypeKey);
  if (!a) return { cold: [stationQuiz(locale), stationSpar(locale), stationDilemma(locale)] };

  // Find a flagship philosopher of this archetype.
  const flagship = PHILOSOPHERS.find((p) => p.archetypeKey === archetypeKey);

  const cold: PathwayStation[] = [];

  cold.push({
    ...stationQuiz(locale),
    blurb: t('pathway.archetype.quiz', locale, {
      arch: archetypeDisplayName(archetypeKey, locale),
    }),
  });
  if (flagship) {
    cold.push(
      stationPhilosopher(flagship.name, t('pathway.archetype.philosopher', locale), locale),
    );
  }
  // Tail: an exercise tied to this archetype.
  const exSlug = a.suggestedExercises?.[0];
  if (exSlug) {
    const ex = stationExercise(exSlug, locale, t('pathway.archetype.exercise', locale));
    if (ex) cold.push(ex);
  } else {
    cold.push(stationSpar(locale));
  }

  // Warm: pilgrimage primary + a daily ritual + archetype's flagship exercise.
  const warm: PathwayStation[] = [];
  warm.push(stationPilgrimage(archetypeKey, locale));
  warm.push(stationSpar(locale));
  if (exSlug) {
    const ex = stationExercise(exSlug, locale);
    if (ex) warm.push(ex);
  } else {
    warm.push(stationDiary(locale));
  }

  return { cold, warm };
}

export function pathwayForVs(slugA: string, slugB: string, locale: Locale = 'en'): Pathway {
  const pa = getPhilosopherBySlug(slugA);
  const pb = getPhilosopherBySlug(slugB);
  if (!pa || !pb)
    return { cold: [stationQuiz(locale), stationSpar(locale), stationDilemma(locale)] };

  const cold: PathwayStation[] = [];
  cold.push({
    ...stationQuiz(locale),
    blurb: t('pathway.vs.quiz', locale),
  });
  // Pick a bridging philosopher (nearest to pa that isn't pb).
  const bridges = nearestPhilosophers(pa, 5).filter((p) => p.name !== pb.name);
  if (bridges.length > 0) {
    cold.push(stationPhilosopher(bridges[0].name, t('pathway.vs.philosopher', locale), locale));
  }
  cold.push(stationArena(locale, pa.name));

  const warm: PathwayStation[] = [];
  warm.push(stationArena(locale, pa.name));
  warm.push(stationArena(locale, pb.name));
  warm.push(stationSpar(locale));

  return { cold, warm };
}

export function pathwayForExercise(exerciseSlug: string, locale: Locale = 'en'): Pathway {
  const ex = EXERCISES.find((e) => e.slug === exerciseSlug);

  const cold: PathwayStation[] = [];
  cold.push({
    ...stationQuiz(locale),
    blurb: t('pathway.exercise.quiz', locale),
  });
  // Surface another exercise in the same category.
  if (ex) {
    const sibling = EXERCISES.find((e) => e.category === ex.category && e.slug !== ex.slug);
    if (sibling) {
      const lsib = localizeExercise(sibling, locale);
      cold.push({
        visual: {
          kind: 'glyph',
          glyph: ex.category === 'contemplative' ? '☷' : ex.category === 'logic' ? '⊕' : '◍',
        },
        title: lsib.name,
        blurb: lsib.summary,
        href: `/exercises/${sibling.slug}`,
        accent:
          ex.category === 'contemplative'
            ? '#2F5D5C'
            : ex.category === 'logic'
              ? '#1E3A5F'
              : '#7A2E2E',
        tag: t('pathway.tag.next_exercise', locale),
      });
    }
  }
  cold.push(stationCrucible(locale));

  const warm: PathwayStation[] = [];
  warm.push(stationCrucible(locale));
  warm.push(stationAnthology(locale));
  warm.push(stationSpar(locale));

  return { cold, warm };
}

export function pathwayForDilemma(locale: Locale = 'en'): Pathway {
  return {
    cold: [
      { ...stationQuiz(locale), blurb: t('pathway.dilemma.quiz', locale) },
      stationSpar(locale),
      stationCrucible(locale),
    ],
    warm: [stationSpar(locale), stationCrucible(locale), stationDiary(locale)],
  };
}

export function pathwayForMap(locale: Locale = 'en'): Pathway {
  return {
    cold: [
      { ...stationQuiz(locale), blurb: t('pathway.map.quiz', locale) },
      stationDilemma(locale),
      stationSpar(locale),
    ],
    warm: [stationSpar(locale), stationDilemma(locale), stationAnthology(locale)],
  };
}

/** Returns the pathway with the warm trail rebuilt for a returning user.
 *  Called by the client component once it reads the user's orientation
 *  from localStorage.
 *
 *  Two tiers of personalization:
 *    - With a 16-D `vector` (the user's own coordinates): lead the trail
 *      with the single philosopher NEAREST them in vector space — a
 *      genuinely personal "go meet your closest kin" hook that coarse
 *      archetype buckets can't express — then the archetype pilgrimage
 *      and a daily ritual.
 *    - Without a vector (older clients / pre-vector users): fall back to
 *      the archetype-only trail (pilgrimage → spar → flagship exercise). */
export function personalizeWarmTrail(
  pathway: Pathway,
  archetypeKey: string,
  locale: Locale = 'en',
  vector?: number[] | null,
): PathwayStation[] {
  const a = getArchetypeByKey(archetypeKey);
  if (!a) return pathway.warm ?? pathway.cold;

  // Vector-space lead, when we know the user's own coordinates.
  const nearest = nearestPhilosophersToVector(vector, 1)[0]?.item;
  if (nearest) {
    return [
      stationNearestMind(nearest.name, locale),
      stationPilgrimage(archetypeKey, locale),
      stationSpar(locale),
    ];
  }

  // Archetype-only fallback.
  const exSlug = a.suggestedExercises?.[0];
  const ex = exSlug ? stationExercise(exSlug, locale) : null;
  return [stationPilgrimage(archetypeKey, locale), stationSpar(locale), ex ?? stationDiary(locale)];
}
