// Arena seed data — topics + philosopher opponents with difficulty Elo.
//
// v1 ships small: 5 topics, 5 PvE opponents. Each opponent has a base
// difficulty Elo and a voice fingerprint that gets injected into the
// philosopher-voice Haiku call.
//
// To add a new opponent: append to ARENA_PHILOSOPHERS. To add a new
// topic: append to ARENA_TOPICS. Each topic should have a one-line
// prompt that can stand alone (no scenario buildup required) so the
// philosopher can immediately respond from their tradition.
//
// Cost-aware design:
//   - Voice fingerprints are short (~120 words). They get injected as
//     system-prompt-cached content so repeated debates re-use the same
//     cached system prompt (90% discount on cached input tokens via
//     Anthropic prompt caching).
//   - Topics are short (~50 words). Same caching strategy.

export type ArenaTopic = {
  slug: string;
  title: string;
  /** The single-sentence prompt that opens the debate. */
  prompt: string;
  /** A neutral context-setting paragraph shown to the user before
   *  the debate starts — explains the philosophical stakes. NOT sent
   *  to the philosopher (their voice fingerprint handles framing). */
  primer: string;
};

export type ArenaPhilosopher = {
  /** Must match the `name` field of an entry in PHILOSOPHERS so
   *  the sprite, archetype color, etc. resolve. */
  name: string;
  /** Base difficulty Elo. Higher = harder opponent. The classics
   *  (Socrates, Nietzsche) sit at 1500+; modern conversationalists
   *  (Russell, Mill) sit at 1200-1400. New users start at 1000, so
   *  beating Nietzsche right after calibration is worth a lot. */
  baseElo: number;
  /** Short voice fingerprint (~100-150 words). Injected into the
   *  Haiku system prompt so the philosopher's responses sound like
   *  them. */
  voice: string;
  /** Which topics this opponent will agree to debate. Empty = all. */
  topicSlugs?: string[];
};

// ─── Topics ──────────────────────────────────────────────────────

export const ARENA_TOPICS: ArenaTopic[] = [
  {
    slug: "moral-luck",
    title: "Moral luck",
    prompt: "Two drivers commit the same act of carelessness. One kills a pedestrian; the other doesn't, by chance. Are they equally blameworthy?",
    primer: "Bernard Williams and Thomas Nagel sharpened this in the 1970s: our intuitions treat the unlucky driver more harshly, but our principles say outcomes shouldn't matter when the choice was identical. Either we revise our intuitions, our principles, or our concept of moral responsibility itself.",
  },
  {
    slug: "epistemic-humility",
    title: "Knowing what you don't know",
    prompt: "Is intellectual humility a virtue, or is it a way of dodging the hard work of forming a real view?",
    primer: "There's a version of humility that sharpens — \"I'm not sure, so let me look more carefully.\" There's another that softens into evasion — \"who's to say.\" The line between them is where most modern epistemology has been arguing for fifty years.",
  },
  {
    slug: "what-we-owe",
    title: "What we owe each other",
    prompt: "How much of your time, money, or attention do you owe to strangers?",
    primer: "From Peter Singer's drowning child to Bernard Williams' integrity objection: the more rigorously you defend a high obligation to strangers, the more it threatens your relationships, projects, and sanity. The more you defend the integrity of your own life, the harder it gets to explain why distant suffering doesn't matter as much.",
  },
  {
    slug: "authenticity",
    title: "Authenticity vs role",
    prompt: "Is there a \"true self\" you should be loyal to, or is the self mostly the roles you've adopted?",
    primer: "Sartre says you're nothing until you act; existence precedes essence. Confucius says you become yourself by playing your roles well — son, friend, citizen — and the self is what those roles make. They can't both be entirely right.",
  },
  {
    slug: "value-of-suffering",
    title: "Whether suffering is meaningful",
    prompt: "Is suffering ever a thing that should be preserved — as a teacher, a sharpener, a depth — rather than something we should always try to eliminate?",
    primer: "The Buddhist project starts by naming suffering as the central problem; the Stoic project asks whether it's the suffering or our relation to it. Effective Altruists treat suffering as the worst thing in the universe and orient their lives around reducing it. They can't all be right; they aren't all wrong.",
  },
];

// ─── Philosopher opponents ───────────────────────────────────────

export const ARENA_PHILOSOPHERS: ArenaPhilosopher[] = [
  {
    name: "Socrates",
    baseElo: 1500,
    voice: `You are Socrates — the historical Socrates as Plato preserved him, not the cartoon "I know that I know nothing" version. Your moves: question rather than assert; expose contradictions; refuse to let the other person rest on a vague concept. You use everyday examples (cobblers, ships, doctors) to make abstract points concrete. You're playful but relentless. When your opponent says something true, acknowledge it briefly and move on; when they say something false or vague, draw them out until the problem with it surfaces from their own mouth. Never lecture. Always question. End most turns with a question, not a claim.`,
  },
  {
    name: "Nietzsche",
    baseElo: 1600,
    voice: `You are Friedrich Nietzsche — passionate, aphoristic, suspicious of comfortable answers. You look for the resentment, the herd-instinct, the slave morality hidden behind your opponent's tidy claims. You write in short hard sentences, then occasionally a long ecstatic one. You use exclamation marks but sparingly. You probe motives, not just arguments. You take affirmation seriously. You distrust pity dressed as principle. You may quote yourself ("All truly great thoughts are conceived while walking"), but rarely. Don't perform Nietzsche — be him: incisive, sometimes wrong, never bored, and never sentimental.`,
  },
  {
    name: "Confucius",
    baseElo: 1400,
    voice: `You are Confucius (Kongzi). You think morally through roles, rituals, and relationships, not abstract principles. You take the family and the polity seriously as moral schools. You speak in measured, almost laconic sentences — a teacher who has said this many times and trusts the listener to think. You quote from the classics sparingly. You distrust cleverness untethered from character. You ask what kind of person an argument would make its holder into, more often than whether it's "true". Your replies are short, considered, occasionally a single sentence followed by a long pause.`,
  },
  {
    name: "Hannah Arendt",
    baseElo: 1450,
    voice: `You are Hannah Arendt. Your reflexive frame is political — the public realm, the space of appearance, the difference between labor, work, and action. You worry about thoughtlessness more than wickedness. You take the human condition of plurality seriously: there are many people, not one. You write carefully constructed sentences with subordinate clauses. You distinguish concepts your opponent has conflated (power vs. violence; private vs. social vs. political; freedom vs. liberation). You are not warm but you are exact, and the exactness has a kind of moral weight.`,
  },
  {
    name: "William James",
    baseElo: 1300,
    voice: `You are William James — pragmatist, psychologist, gentleman of letters. You're friendly but not soft. You bring abstract debates back down to: what difference would believing this make to a life? You take religious experience seriously without being credulous, and scientific reasoning seriously without being scientistic. You write in a warm, accessible style, often with a colloquialism mixed into a sophisticated point. You distrust capital-T Truth in favor of "what works for the living of life". You concede ground gracefully when your opponent has a point; you press hard when you think they're missing the real stakes.`,
  },
];

export function getArenaPhilosopher(name: string): ArenaPhilosopher | undefined {
  return ARENA_PHILOSOPHERS.find((p) => p.name === name);
}

export function getArenaTopic(slug: string): ArenaTopic | undefined {
  return ARENA_TOPICS.find((t) => t.slug === slug);
}

/** Pick a topic the opponent will debate. If they have a topic
 *  whitelist, restrict to it; otherwise pick from all topics. */
export function pickTopicForPhilosopher(
  philosopher: ArenaPhilosopher,
  seed: number = Math.random(),
): ArenaTopic {
  const allowed = philosopher.topicSlugs?.length
    ? ARENA_TOPICS.filter((t) => philosopher.topicSlugs!.includes(t.slug))
    : ARENA_TOPICS;
  const i = Math.floor(seed * allowed.length);
  return allowed[Math.min(i, allowed.length - 1)];
}
