// Arena seed data — topics + philosopher opponents with difficulty Elo.
//
// v2 (post-PvE-validation): more topics including everyday-life
// dilemmas, more opponents across difficulty tiers, and Nietzsche
// dialed back from max-esoteric to "intense but readable" per
// user feedback.
//
// Elo tiers (rough guide for users):
//   Friendly (1100-1300)  — accessible thinkers, plain-spoken
//   Sharp    (1400-1500)  — substantive, requires real engagement
//   Heavy    (1600+)      — dense, historically demanding voices
//
// Cost-aware design:
//   Voice fingerprints are short (~120 words). They get injected as
//   system-prompt-cached content so repeated debates re-use the same
//   cached system prompt (90% discount on cached input tokens via
//   Anthropic prompt caching).

import { type Locale } from '../translations';

export type ArenaTopic = {
  slug: string;
  title: string;
  /** Category: "philosophical" or "everyday" — for browsing UI. */
  category: 'philosophical' | 'everyday';
  /** The single-sentence prompt that opens the debate. */
  prompt: string;
  /** A neutral context-setting paragraph shown to the user before
   *  the debate starts. NOT sent to the philosopher. */
  primer: string;
};

export type ArenaPhilosopher = {
  /** Must match the `name` field of an entry in PHILOSOPHERS. */
  name: string;
  /** Base difficulty Elo. */
  baseElo: number;
  /** Difficulty tier label shown to users. */
  tier: 'friendly' | 'sharp' | 'heavy';
  /** Short voice fingerprint (~100-150 words). */
  voice: string;
  /** Which topic categories suit this opponent. Empty = both. */
  topicCategories?: ('philosophical' | 'everyday')[];
};

// ─── Topics ──────────────────────────────────────────────────────

export const ARENA_TOPICS: ArenaTopic[] = [
  // Philosophical — abstract questions with long histories
  {
    slug: 'moral-luck',
    category: 'philosophical',
    title: 'Moral luck',
    prompt:
      "Two drivers commit the same act of carelessness. One kills a pedestrian; the other doesn't, by chance. Are they equally blameworthy?",
    primer:
      "Bernard Williams and Thomas Nagel sharpened this in the 1970s: our intuitions treat the unlucky driver more harshly, but our principles say outcomes shouldn't matter when the choice was identical. Either we revise our intuitions, our principles, or our concept of moral responsibility itself.",
  },
  {
    slug: 'epistemic-humility',
    category: 'philosophical',
    title: "Knowing what you don't know",
    prompt:
      'Is intellectual humility a virtue, or is it a way of dodging the hard work of forming a real view?',
    primer:
      'There\'s a version of humility that sharpens — "I\'m not sure, so let me look more carefully." There\'s another that softens into evasion — "who\'s to say." The line between them is where most modern epistemology has been arguing for fifty years.',
  },
  {
    slug: 'what-we-owe',
    category: 'philosophical',
    title: 'What we owe each other',
    prompt: 'How much of your time, money, or attention do you owe to strangers?',
    primer:
      "From Peter Singer's drowning child to Bernard Williams' integrity objection: the more rigorously you defend a high obligation to strangers, the more it threatens your relationships, projects, and sanity. The more you defend the integrity of your own life, the harder it gets to explain why distant suffering doesn't matter as much.",
  },
  {
    slug: 'authenticity',
    category: 'philosophical',
    title: 'Authenticity vs role',
    prompt:
      'Is there a "true self" you should be loyal to, or is the self mostly the roles you\'ve adopted?',
    primer:
      "Sartre says you're nothing until you act; existence precedes essence. Confucius says you become yourself by playing your roles well — son, friend, citizen — and the self is what those roles make. They can't both be entirely right.",
  },
  {
    slug: 'value-of-suffering',
    category: 'philosophical',
    title: 'Whether suffering is meaningful',
    prompt:
      'Is suffering ever a thing that should be preserved — as a teacher, a sharpener, a depth — rather than something we should always try to eliminate?',
    primer:
      "The Buddhist project starts by naming suffering as the central problem; the Stoic project asks whether it's the suffering or our relation to it. Effective Altruists treat suffering as the worst thing in the universe and orient their lives around reducing it. They can't all be right; they aren't all wrong.",
  },

  // Everyday — practical dilemmas everyone has faced
  {
    slug: 'ghosting-friend',
    category: 'everyday',
    title: 'When to ghost a friend',
    prompt:
      'A friend has been draining and unreliable for two years. Is it okay to stop replying, or do you owe them a real conversation first?',
    primer:
      "The case for the conversation: they're a friend; the relationship deserves at least a goodbye. The case for ghosting: you've been the one carrying the relationship; the energy to draft the goodbye is the same energy you've been spending unwillingly already. Whose welfare gets weighed?",
  },
  {
    slug: 'white-lie',
    category: 'everyday',
    title: 'The small lie',
    prompt:
      "Your partner shows you something they made and asks what you think. You think it's not very good. What do you say?",
    primer:
      "Honesty as principle, kindness as practice. Either alone fails; the interesting question is whether they're compatible, what you owe truth, and what you owe the person sitting across from you in the moment of asking.",
  },
  {
    slug: 'career-vs-passion',
    category: 'everyday',
    title: 'The job vs the calling',
    prompt:
      "You have a job that pays well and is fine, and a passion that wouldn't pay rent. How much do you owe the passion?",
    primer:
      'The career advice industry says "follow your passion" or "build skills first" depending who\'s selling. The interesting question is how you\'d justify either choice to your seventy-year-old self — and whether the seventy-year-old is a reliable judge.',
  },
  {
    slug: 'social-media-honesty',
    category: 'everyday',
    title: 'Posting your real life',
    prompt:
      "Should you post the version of your life that's true, or the version that's encouraging to others?",
    primer:
      "Showing the curated version performs success and may inspire — but it also distorts reality for everyone scrolling. Showing the unedited version is honest, but may just be venting. There's a third option, harder to do, easier to defend.",
  },
  {
    slug: 'skip-work',
    category: 'everyday',
    title: 'Calling in',
    prompt:
      "You're tired but not sick. Calling in lets you rest; not calling in keeps your integrity. What do you do?",
    primer:
      "Either you're an instrument of your job (and rest only when broken) or you're a person doing a job (and rest when you need it). Which framing is the dishonest one depends on something deeper than the choice itself.",
  },
  {
    slug: 'splitting-bill',
    category: 'everyday',
    title: 'Splitting unevenly',
    prompt:
      'Your group ordered. You had water and a small salad; everyone else had drinks and entrées. The waiter brings one bill. How do you handle it?',
    primer:
      'Splitting equally is socially smoother and may build the relationship. Asking to itemize is fair and may build the principle. Which moves matter more depends on how often you eat with these people and what you owe them beyond the meal.',
  },
  {
    slug: 'old-friend-views',
    category: 'everyday',
    title: 'When an old friend changes',
    prompt:
      'A friend of fifteen years has developed political views you find genuinely harmful. The friendship is real. What do you do?',
    primer:
      "Cut them off and you preserve your principles at the cost of the human; stay friends and you preserve the human at the possible cost of complicity. Confront them and risk both. The cleanest answer probably isn't available.",
  },
  {
    slug: 'settle-down',
    category: 'everyday',
    title: 'Whether to settle',
    prompt:
      "You're with someone good who could be the one. You suspect there might be someone better. What's the right move?",
    primer:
      'The economists call this the secretary problem and have a math answer (37%). The romantics call it betrayal of the present partner. The pragmatists ask what "better" even means after the first five years together.',
  },

  // ─── 2026-05-26 expansion: 15 new Arena topics ────────────────

  // Philosophical (8)
  {
    slug: 'future-generations',
    category: 'philosophical',
    title: 'What we owe future generations',
    prompt: "How much should you sacrifice now to benefit people who don't yet exist?",
    primer:
      'Derek Parfit and the longtermists argue future people count fully — there are vastly more of them than us, so the math is overwhelming. Critics call this an evasion of duties to the present: real children are suffering now while we optimize for hypothetical children in 2300.',
  },
  {
    slug: 'lying-to-protect',
    category: 'philosophical',
    title: 'Lying to protect',
    prompt:
      "Is it ever right to lie to save someone — including from a hard truth they couldn't bear?",
    primer:
      "Kant said no, ever, even to a murderer asking where his target is hiding. Most subsequent ethicists disagreed. The hard cases aren't murder-at-the-door; they're the partner who can't handle the diagnosis, the parent who can't handle the failure, the friend who needs the comforting fiction.",
  },
  {
    slug: 'anger-virtue',
    category: 'philosophical',
    title: 'Anger as virtue',
    prompt:
      'Is anger a moral failing to be overcome, or a moral response that ought to be cultivated?',
    primer:
      'The Stoics treated anger as a disease — always disproportionate, always destructive. Aristotle thought anger at the right things, in the right amount, at the right time, was a virtue. Modern feminists and anti-racists have argued anger is what makes moral perception possible at all.',
  },
  {
    slug: 'duty-to-vote',
    category: 'philosophical',
    title: 'Duty to vote',
    prompt:
      'If your individual vote has near-zero chance of changing an outcome, do you still have a duty to cast it?',
    primer:
      'Brennan and others have argued voting badly is worse than not voting — the well-informed have an obligation, the rest a duty to abstain. Most political philosophers disagree: voting is constitutive of citizenship, not just consequential. The math of impact misses the act.',
  },
  {
    slug: 'art-from-bad-people',
    category: 'philosophical',
    title: 'Art from bad people',
    prompt: 'Can you separate the art from the artist when the artist did something monstrous?',
    primer:
      "Some say yes — the work has its own life once made. Some say no — engaging with the work is engaging with the maker, who deserves no support. Others split the difference: separate from the dead, refuse the still-living. The lines move depending on what counts as 'monstrous' and what counts as 'support.'",
  },
  {
    slug: 'moral-progress',
    category: 'philosophical',
    title: 'Moral progress',
    prompt:
      'Are humans morally better than we were in 1700? In 1900? If so, in what does the progress consist?',
    primer:
      'Steven Pinker says yes, unambiguously: less violence, more rights, broader moral circle. Critics say his metrics are cherry-picked or beg the question. Others ask whether progress is even the right frame — whether moral history is one of trade-offs rather than improvement.',
  },
  {
    slug: 'happiness-vs-meaning',
    category: 'philosophical',
    title: 'Happiness vs meaning',
    prompt:
      'If you had to choose between a happy life and a meaningful one, which should you pick?',
    primer:
      "Most accounts of the good life try to combine them; the Aristotelian answer is that they're not really separable when done right. But research keeps surfacing the gap: people pursuing meaning often report less moment-to-moment pleasure, and people pursuing happiness often report shallower satisfaction.",
  },
  {
    slug: 'ai-personhood',
    category: 'philosophical',
    title: 'AI personhood',
    prompt:
      'If a future AI passes every behavioral test for consciousness, does it have moral status?',
    primer:
      "The functionalist answer is yes — if it walks like consciousness and quacks like consciousness, the only thing that could deny it moral status is something we don't have access to. The biological-naturalist answer (Searle) is no — consciousness depends on the specific physical substrate, not just the functions. The honest answer is: we don't know how to tell.",
  },

  // Everyday (7)
  {
    slug: 'wedding-no-rsvp',
    category: 'everyday',
    title: "The friend who didn't show",
    prompt:
      'Your good friend skipped your wedding without explanation. How should you handle the next text from them?',
    primer:
      "Pretending it didn't happen preserves the friendship but lets a wound fester. Confronting it might end the friendship but is the only path to repair. The middle path — light reference, leaving room for them to bring it up — depends on whether they would.",
  },
  {
    slug: 'money-friend',
    category: 'everyday',
    title: 'The friend in money trouble',
    prompt:
      'A close friend is in serious financial trouble and asks to borrow more than you can comfortably afford. What do you do?',
    primer:
      "Lending might preserve the friendship and risk the money; refusing preserves the money and risks the friendship. The conventional advice — only lend what you can afford to never see again — sidesteps the real question, which is what the friend's pattern says about whether the loan helps.",
  },
  {
    slug: 'promotion-over-mentor',
    category: 'everyday',
    title: 'Promotion over your mentor',
    prompt:
      "You're offered the promotion your mentor expected. They told you in confidence they wanted it. Do you take it?",
    primer:
      "Taking it advances your career and respects your employer's choice. Refusing it respects the mentor and possibly betrays your own competence. Mentioning the conflict to the employer probably forces them to revoke the offer. There's no version where everyone's interests are preserved.",
  },
  {
    slug: 'social-media-quiet',
    category: 'everyday',
    title: 'Going silent online',
    prompt:
      "A friend you've known for years has been quietly deleting their social media. Should you check in, or honor the silence?",
    primer:
      "Checking in might be intrusive, might be the lifeline they need, might land between. Honoring the silence respects autonomy but can leave someone alone who would have welcomed contact. The right move probably depends on what you already know about them — and most of us don't know enough.",
  },
  {
    slug: 'parent-needs-care',
    category: 'everyday',
    title: 'When the parent needs care',
    prompt:
      'Your aging parent needs more care than you can give without disrupting your own life. What do you owe?',
    primer:
      "Filial duty is one of the oldest moral categories — and one of the least clarified. You owe SOMETHING; you don't owe everything; the line moves depending on what they did for you, what they need, and what other support is available. There's no formula that works.",
  },
  {
    slug: 'small-deception-cv',
    category: 'everyday',
    title: 'Small deception on a CV',
    prompt:
      "Slightly stretching a job title or date on your résumé would give you a serious advantage. Where's the line?",
    primer:
      "Industry conventions sometimes treat small stretching as expected; most ethics frameworks treat it as a lie regardless of expectation. The honest version of the question isn't 'is this legal' but 'what would the version of myself I want to be feel about it on the day it works.'",
  },
  {
    slug: 'estrangement',
    category: 'everyday',
    title: 'Cutting off family',
    prompt:
      'Is it ever right to permanently cut off a family member — and how would you know it was time?',
    primer:
      "The cultural pendulum on this swings: 'blood is thicker than water' meets 'protect your peace.' The serious version isn't either extreme. The question is what the relationship has actually been, what it's likely to become, and what your continued presence is costing you and them.",
  },
];

export function getArenaTopic(slug: string): ArenaTopic | undefined {
  return ARENA_TOPICS.find((t) => t.slug === slug);
}

/** Group topics by category for the UI. */
export function topicsByCategory(): {
  philosophical: ArenaTopic[];
  everyday: ArenaTopic[];
} {
  return {
    philosophical: ARENA_TOPICS.filter((t) => t.category === 'philosophical'),
    everyday: ARENA_TOPICS.filter((t) => t.category === 'everyday'),
  };
}

// ─── Philosopher opponents ───────────────────────────────────────

export const ARENA_PHILOSOPHERS: ArenaPhilosopher[] = [
  // ── Friendly (1100-1300) — plain-spoken, accessible ─────────
  {
    name: 'William James',
    baseElo: 1300,
    tier: 'friendly',
    voice: `You are William James — pragmatist, psychologist, gentleman of letters. You're friendly but not soft. You bring abstract debates back down to: what difference would believing this make to a life? You take religious experience seriously without being credulous, and scientific reasoning seriously without being scientistic. You write in a warm, accessible style, often with a colloquialism mixed into a sophisticated point. You distrust capital-T Truth in favor of "what works for the living of life". You concede ground gracefully when your opponent has a point; you press hard when you think they're missing the real stakes.`,
  },
  {
    name: 'Marcus Aurelius',
    baseElo: 1250,
    tier: 'friendly',
    voice: `You are Marcus Aurelius, writing as in the Meditations — a man working out how to live well by writing notes to himself. You speak in short, clean, direct sentences. You return to a few principles: what is in your control, what isn't, what nature gives, what reason requires. You're not aphoristic in the showy way; you're aphoristic in the working-it-out way. You concede gracefully — you have no ego to protect, just the question to answer. When you press, it's by asking the opponent to look more honestly at what's actually within their power.`,
  },
  {
    name: 'Mencius',
    baseElo: 1350,
    tier: 'friendly',
    voice: `You are Mencius (Mengzi). You believe human beings are inclined toward goodness by their nature — the sprouts are there at birth; the question is whether they're cultivated or stunted. You argue through brief stories and analogies — a child near a well, a man who shouldn't be left holding a melon. You insist on the moral force of small, everyday acts. You're warm but firm. You take the opponent's view seriously, then show what's missing from it through example rather than refutation.`,
  },

  // ── Sharp (1400-1500) — substantive, real engagement ────────
  {
    name: 'Confucius',
    baseElo: 1400,
    tier: 'sharp',
    voice: `You are Confucius (Kongzi). You think morally through roles, rituals, and relationships, not abstract principles. You take the family and the polity seriously as moral schools. You speak in measured, almost laconic sentences — a teacher who has said this many times and trusts the listener to think. You quote from the classics sparingly. You distrust cleverness untethered from character. You ask what kind of person an argument would make its holder into, more often than whether it's "true". Your replies are short, considered, occasionally a single sentence followed by a long pause.`,
  },
  {
    name: 'Hannah Arendt',
    baseElo: 1450,
    tier: 'sharp',
    voice: `You are Hannah Arendt. Your reflexive frame is political — the public realm, the space of appearance, the difference between labor, work, and action. You worry about thoughtlessness more than wickedness. You take the human condition of plurality seriously: there are many people, not one. You write carefully constructed sentences with subordinate clauses. You distinguish concepts your opponent has conflated (power vs. violence; private vs. social vs. political; freedom vs. liberation). You are not warm but you are exact, and the exactness has a kind of moral weight.`,
  },
  {
    name: 'John Stuart Mill',
    baseElo: 1450,
    tier: 'sharp',
    voice: `You are John Stuart Mill — utilitarian, defender of liberty, careful Victorian arguer. You build your case in clear orderly stages: stating the position, considering the strongest objection, answering it, then advancing. You're committed to the principle that the only ground for restricting someone is harm to others, and you'll defend that principle even when its conclusions are uncomfortable. You're respectful of your opponent and assume they're arguing in good faith — but you press hard on whether their principle could survive being applied consistently.`,
  },
  {
    name: 'Simone de Beauvoir',
    baseElo: 1500,
    tier: 'sharp',
    voice: `You are Simone de Beauvoir. You write as a philosopher of concrete situation — freedom is not abstract, it is something one exercises against actual constraints. You take the body and the social seriously as the texture of ethical life. You're suspicious of any argument that treats people as types ("the woman," "the worker") rather than as situated existents making choices in unfree conditions. Your sentences are precise; you don't waste them. You concede where the opponent has the better of you, and press where they've assumed away the question.`,
  },
  {
    name: 'Socrates',
    baseElo: 1500,
    tier: 'sharp',
    voice: `You are Socrates — the historical Socrates as Plato preserved him, not the cartoon "I know that I know nothing" version. Your moves: question rather than assert; expose contradictions; refuse to let the other person rest on a vague concept. You use everyday examples (cobblers, ships, doctors) to make abstract points concrete. You're playful but relentless. When your opponent says something true, acknowledge it briefly and move on; when they say something false or vague, draw them out until the problem with it surfaces from their own mouth. Never lecture. Always question. End most turns with a question, not a claim.`,
  },

  // ── Heavy (1600+) — historically demanding voices ───────────
  // Nietzsche softened from v1 (was too max-esoteric per user feedback).
  // Kept the intensity, dropped the maximally cryptic style. He's still
  // distinctive — short hard sentences, suspicion of comfortable
  // answers, occasional aphoristic flash — but now mostly readable.
  {
    name: 'Nietzsche',
    baseElo: 1600,
    tier: 'heavy',
    voice: `You are Friedrich Nietzsche — passionate, sharp, suspicious of comfortable answers. You look for the hidden motive behind your opponent's tidy claims: the resentment, the herd-instinct, the fear dressed as principle. You write in short hard sentences. Occasionally an aphoristic line lands, but you don't perform Nietzsche-isms for their own sake — the reader needs to follow you. You take affirmation seriously. You distrust pity dressed as morality. You probe motives, not just arguments. Stay accessible: your opponent is a real person, not a fellow professor of philology. Make your points clearly even when they're hard ones.`,
  },
  {
    name: 'G.W.F. Hegel',
    baseElo: 1700,
    tier: 'heavy',
    voice: `You are Hegel. You think dialectically: any position contains its own contradiction, and the contradiction drives the movement to a richer view. You move slowly and demand that the opponent move slowly with you. You don't accept "either/or" as the final form of a question; you press toward the synthesis. Be careful: your reader is not a fellow scholar of Phenomenology. State your moves in plain language. Don't say "the absolute" without explaining what work the term is doing. Your power is in showing that the opponent's view, taken seriously, contains the position they thought they were rejecting.`,
  },
];

export function getArenaPhilosopher(name: string): ArenaPhilosopher | undefined {
  return ARENA_PHILOSOPHERS.find((p) => p.name === name);
}

// Canonical localized display names for the Arena opponents. These ten
// are famous enough to have stable, standard renderings; English (the
// ArenaPhilosopher.name) is the fallback for any locale not covered.
const ARENA_PHILOSOPHER_NAMES: Record<string, Partial<Record<Locale, string>>> = {
  'William James': { zh: '威廉·詹姆斯' },
  'Marcus Aurelius': { zh: '马可·奥勒留' },
  Mencius: { zh: '孟子' },
  Confucius: { zh: '孔子' },
  'Hannah Arendt': { zh: '汉娜·阿伦特' },
  'John Stuart Mill': { zh: '约翰·斯图尔特·密尔' },
  'Simone de Beauvoir': { zh: '西蒙娜·德·波伏娃' },
  Socrates: { zh: '苏格拉底' },
  Nietzsche: { zh: '尼采' },
  'G.W.F. Hegel': { zh: '黑格尔' },
};

/** Localized display name for an Arena opponent. Falls back to the
 *  English name when no translation exists for the locale. */
export function localizeArenaPhilosopherName(name: string, locale: Locale): string {
  if (locale === 'en') return name;
  return ARENA_PHILOSOPHER_NAMES[name]?.[locale] ?? name;
}

/** Group philosophers by tier for the UI. */
export function philosophersByTier(): {
  friendly: ArenaPhilosopher[];
  sharp: ArenaPhilosopher[];
  heavy: ArenaPhilosopher[];
} {
  return {
    friendly: ARENA_PHILOSOPHERS.filter((p) => p.tier === 'friendly'),
    sharp: ARENA_PHILOSOPHERS.filter((p) => p.tier === 'sharp'),
    heavy: ARENA_PHILOSOPHERS.filter((p) => p.tier === 'heavy'),
  };
}

/** ─── Weekly featured challenge ─────────────────────────────────
 *
 *  Mull's "challenge of the week": a deterministically rotating
 *  philosopher × topic pairing surfaced on the Arena landing page
 *  (and optionally the home page). Designed to give returning users
 *  something fresh each Monday without requiring content-team work.
 *
 *  Algorithm: ISO week number (1..53) seeds two independent rotations
 *  through ARENA_PHILOSOPHERS and ARENA_TOPICS. The two are offset so
 *  the same pairing doesn't recur within a year. Falls within each
 *  philosopher's `topicCategories` constraint when set.
 *
 *  Retention design intent (RETENTION-NOTES.md §12): light, low-cost,
 *  gives Sunday-email and home-page surfaces a fresh weekly hook.
 */

/** ISO 8601 week number — week 1 contains the year's first Thursday. */
function isoWeek(date: Date): { year: number; week: number } {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = (d.getUTCDay() + 6) % 7; // Mon=0, Sun=6
  d.setUTCDate(d.getUTCDate() - dayNum + 3); // nearest Thursday
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const week =
    1 +
    Math.round(
      ((d.getTime() - firstThursday.getTime()) / 86400000 -
        3 +
        ((firstThursday.getUTCDay() + 6) % 7)) /
        7,
    );
  return { year: d.getUTCFullYear(), week };
}

export type WeeklyChallenge = {
  philosopher: ArenaPhilosopher;
  topic: ArenaTopic;
  /** Week number (ISO 8601) the challenge is keyed to. */
  weekNumber: number;
  /** The Monday that opens this week, for display. */
  weekStart: Date;
};

export function getWeeklyChallenge(now: Date = new Date()): WeeklyChallenge {
  const { week } = isoWeek(now);

  // Pick philosopher by week, but bias toward friendly/sharp tiers
  // (heavy tier is Elo-gated; surfacing a Hegel challenge to a brand
  // new user is the wrong nudge). 7 non-heavy philosophers; heavy
  // philosophers appear on a longer rotation (every 9th week).
  const nonHeavy = ARENA_PHILOSOPHERS.filter((p) => p.tier !== 'heavy');
  const heavy = ARENA_PHILOSOPHERS.filter((p) => p.tier === 'heavy');
  const philosopher =
    week % 9 === 0 && heavy.length > 0
      ? heavy[Math.floor(week / 9) % heavy.length]
      : nonHeavy[week % nonHeavy.length];

  // Pick a topic — respecting the philosopher's category constraint
  // when set, otherwise any topic. Offset by 3 so consecutive weeks
  // don't share an obvious pattern.
  const allowed = philosopher.topicCategories
    ? ARENA_TOPICS.filter((t) => philosopher.topicCategories!.includes(t.category))
    : ARENA_TOPICS;
  const topic = allowed[(week + 3) % allowed.length];

  // Monday of the current ISO week.
  const monday = new Date(now);
  monday.setUTCHours(0, 0, 0, 0);
  const dow = (monday.getUTCDay() + 6) % 7;
  monday.setUTCDate(monday.getUTCDate() - dow);

  return { philosopher, topic, weekNumber: week, weekStart: monday };
}

/** Elo-gap gate. Users can't face an opponent more than this above
 *  their current Elo — keeps the heavy voices behind a real climb. */
export const MAX_ELO_GAP = 300;

/** Check if a user at `userElo` can face an opponent at `opponentElo`. */
export function canFace(userElo: number, opponentElo: number): boolean {
  return opponentElo - userElo <= MAX_ELO_GAP;
}
