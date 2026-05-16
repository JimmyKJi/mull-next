// Topic corpus — evergreen explainer pages at /topic/<slug>.
//
// Each entry is the SEO landing for one philosophical concept. The
// page renders:
//   1. The topic's name + summary + a longer-form essay
//   2. The Mull dimensions that correlate with thinking about this topic
//   3. A curated set of philosophers from our 560-corpus who're known
//      for working on this question (linked through to /philosopher/<slug>)
//   4. A mini "where do you sit?" CTA pointing at the quiz
//
// Goals:
//   - SEO: each page targets a thick keyword space ("what is stoicism",
//     "trolley problem explained", etc.). Mull becomes the canonical
//     short-form interactive primer.
//   - Funnel: every page nudges the reader into the quiz or related
//     archetypes/philosophers.
//
// Content is intentionally short (~200-400 words per essay) — readable
// in one screen, scannable by Google, and not trying to compete with
// Stanford Encyclopedia of Philosophy. The interactive hook is the
// differentiator.

import type { DimKey } from './dimensions';

export type Topic = {
  /** URL slug — lowercase, kebab-case. Keep stable; SEO depends on it. */
  slug: string;
  /** Display title (h1 + opengraph). */
  title: string;
  /** One-line summary for cards + meta description. */
  summary: string;
  /** Longer-form explainer prose — 2-4 paragraphs. Rendered as <p>s
   *  in the page body. Use \n\n between paragraphs. */
  essay: string;
  /** The 16-D dimensions most relevant to this topic. Surfaced in the
   *  page body as "thinking about this is shaped by ...". */
  relevantDimensions: DimKey[];
  /** Archetype keys whose thinking aligns most with this topic. Links
   *  to /archetype/<key> on each. */
  relatedArchetypes: string[];
  /** Curated list of philosopher names (must match an entry in
   *  PHILOSOPHERS in lib/philosophers.ts so the link resolves). Order
   *  matters — first names get more visual weight. */
  philosopherNames: string[];
  /** Optional: a custom quiz prompt that lets the reader take a
   *  one-question position on this topic, before deciding to take
   *  the full quiz. v2 feature; field reserved. */
  microPrompt?: string;
};

export const TOPICS: readonly Topic[] = [
  {
    slug: 'free-will',
    title: 'Free will',
    summary: 'Are your choices yours, or the inevitable output of physics + biology + upbringing?',
    essay: `The question is older than philosophy: when you decide between coffee and tea, is the decision genuinely yours, or just what your brain was always going to do? Compatibilists say "yours" can mean "made by your reasoning, given the circumstances" — that's enough for free will, even if the universe is deterministic. Hard determinists say no — every decision is the inevitable output of prior causes, and our sense of freedom is an illusion.

There's a third camp: libertarians (in the philosophical sense, not the political one) think genuine alternative possibilities exist — that the future is genuinely open, and we genuinely choose. Modern science complicates this: quantum mechanics offers randomness but not obviously agency, and neuroscience experiments (Libet, Soon, Schultze-Kraft) suggest your brain commits to a decision before you become consciously aware of it.

What's at stake: if there's no free will, do moral responsibility and praise and blame still make sense? Most philosophers think yes, in some form — but the answer reshapes how you think about punishment, addiction, and self-improvement.`,
    relevantDimensions: ['SI', 'CE', 'TR'],
    relatedArchetypes: ['cartographer', 'pilgrim', 'iconoclast'],
    philosopherNames: ['Spinoza', 'Kant', 'Schopenhauer', 'William James', 'Jean-Paul Sartre', 'Daniel Dennett', 'Galen Strawson'],
  },
  {
    slug: 'stoicism',
    title: 'Stoicism',
    summary: 'Live according to nature, focus on what you control, accept what you don\'t.',
    essay: `Stoicism is a school of ancient Greek and Roman philosophy that's enjoying an unlikely twenty-first-century revival in Silicon Valley boardrooms, military barracks, and self-help podcasts. The core idea is austere and useful: the only thing genuinely in your control is your own judgment + response, and serenity comes from radically accepting everything else.

The classical Stoics — Marcus Aurelius, Seneca, Epictetus — were practical philosophers, not abstract ones. They wrote letters, diaries, daily exercises. Memento mori (remember you'll die). Premeditatio malorum (rehearse the bad things). The view from above (zoom out cosmically when small troubles feel large). These practices aren't about emotional suppression — Stoics felt grief, anger, love — but about not being ruled by them.

Modern Stoicism gets criticized for being apolitical (the original Stoics largely accepted Roman slavery), for being too individualistic, for sometimes sliding into bro-grade "be tough" content. The serious version is none of those things — it's a careful framework for keeping your inner life intact while the outer world rearranges itself.`,
    relevantDimensions: ['TR', 'AT', 'TV'],
    relatedArchetypes: ['keel', 'pilgrim', 'hearth'],
    philosopherNames: ['Marcus Aurelius', 'Seneca', 'Epictetus', 'Zeno of Citium', 'Chrysippus', 'Musonius Rufus'],
  },
  {
    slug: 'existentialism',
    title: 'Existentialism',
    summary: 'You exist first, then you make yourself. Meaning isn\'t given — it\'s chosen.',
    essay: `Existentialism's bumper-sticker: existence precedes essence. You're not born with a fixed purpose (the way a knife is born for cutting). You exist first — a raw conscious being thrown into the world — and only later do your choices make you into who you are.

This is freedom, but it's also a weight. Sartre called it "condemned to be free." Without a god-given meaning, every important question (what to live for, what's worth dying for, what kind of person to be) is on you. No appeal to a higher authority can answer it for you, and the temptation to pretend otherwise — to live as if some authority has settled it — is what Sartre called bad faith.

Existentialists don't agree on much else. Kierkegaard was a Christian; Sartre was an atheist; Camus rejected the label. What they share is a refusal to look away from the fundamental strangeness of being a self-aware creature who has to keep choosing, with finite time, in the dark.`,
    relevantDimensions: ['SS', 'SI', 'TV'],
    relatedArchetypes: ['threshold', 'iconoclast', 'pilgrim'],
    philosopherNames: ['Søren Kierkegaard', 'Jean-Paul Sartre', 'Simone de Beauvoir', 'Albert Camus', 'Martin Heidegger', 'Karl Jaspers', 'Friedrich Nietzsche'],
  },
  {
    slug: 'trolley-problem',
    title: 'The trolley problem',
    summary: 'A runaway trolley will kill five people unless you pull a lever to divert it onto a track where it kills one. Do you pull?',
    essay: `The trolley problem was invented by philosopher Philippa Foot in 1967 to expose how messy our moral intuitions are. Most people say yes to the basic version: pull the lever, kill one to save five. Then Judith Jarvis Thomson added the variant: same outcome, but to save the five you have to push a fat man off a bridge into the trolley's path. Now most people say no.

The numbers are identical. The acts are different. Why does pushing feel categorically worse than pulling?

Consequentialists (who count outcomes) say the intuition is wrong — both should be yes. Deontologists (Kant especially) say the intuition is right — using a person as a mere instrument violates their dignity in a way that pulling a lever doesn't. Virtue ethicists ask a different question: what kind of person are you becoming by pushing or not pushing? Care ethicists ask: what does my relationship to the fat man require?

The trolley problem isn't really about trolleys. It's about whether moral reasoning is fundamentally about consequences, about rules, about character, or about relationships — and most people, when pressed, turn out to be all four at once.`,
    relevantDimensions: ['UI', 'PO', 'CE'],
    relatedArchetypes: ['hammer', 'forge', 'touchstone'],
    philosopherNames: ['Philippa Foot', 'Judith Jarvis Thomson', 'Immanuel Kant', 'John Stuart Mill', 'Bernard Williams', 'Peter Singer'],
  },
  {
    slug: 'utilitarianism',
    title: 'Utilitarianism',
    summary: 'The right action is the one that produces the greatest happiness for the greatest number.',
    essay: `Utilitarianism is one of those rare moral theories that sounds obviously right at first and obviously monstrous a few seconds later. The basic claim: actions are good to the degree they produce happiness (or reduce suffering) — not just for you, but for everyone affected, weighted equally.

This is radical. It says your child's broken arm doesn't count more than a stranger's broken arm. It says you should give until giving more would hurt you more than it would help the recipient. Peter Singer's version (effective altruism) takes this seriously enough to make people uncomfortable: if you can save a drowning child at small cost to yourself, you must; if you can save a stranger across the world with a charitable donation, the moral logic is the same.

Critics push back hard. Bernard Williams pointed out that utilitarianism asks you to be a happiness-calculating machine in situations where having integrity, loyalty, or love would require you to refuse. Other critics note the famous "utility monster" problem: if one being could derive enormous pleasure from harming others, would utilitarianism endorse the harm? Most utilitarians deny this — but the burden of working out exactly why is heavy.`,
    relevantDimensions: ['UI', 'PO', 'CE'],
    relatedArchetypes: ['hammer', 'forge', 'cartographer'],
    philosopherNames: ['Jeremy Bentham', 'John Stuart Mill', 'Henry Sidgwick', 'Peter Singer', 'Derek Parfit', 'R. M. Hare'],
  },
  {
    slug: 'virtue-ethics',
    title: 'Virtue ethics',
    summary: 'Don\'t ask "what should I do?" Ask "what kind of person should I become?"',
    essay: `Virtue ethics is the oldest moral framework in Western philosophy — older than utilitarianism, older than Kant. Aristotle's question wasn't "what action is permitted by the rules" but "what excellent character looks like, and how do I cultivate it." Ethics, on this view, is about becoming, not deciding.

The virtues — courage, temperance, justice, practical wisdom, honesty, generosity — aren't arbitrary; they're the dispositions that allow a human being to flourish. Aristotle called this flourishing eudaimonia. You don't get there by following rules; you get there through habituation, practice, and the influence of others who are already further along.

The framework's strength: it makes ethics part of life, not a set of decisions you only think about in dilemmas. Its weakness: it doesn't tell you what to do when virtues conflict (courage vs prudence; honesty vs kindness), and "what would a virtuous person do" can become a recursive non-answer.

The modern revival — Alasdair MacIntyre, Martha Nussbaum, Rosalind Hursthouse — argues that the framework's apparent weakness is actually its strength: real moral life is messier than any rulebook, and what we need are excellent character, not flowcharts.`,
    relevantDimensions: ['UI', 'TR', 'RT'],
    relatedArchetypes: ['touchstone', 'hearth', 'pilgrim'],
    philosopherNames: ['Aristotle', 'Confucius', 'Mencius', 'Thomas Aquinas', 'Alasdair MacIntyre', 'Martha Nussbaum', 'Rosalind Hursthouse'],
  },
  {
    slug: 'nihilism',
    title: 'Nihilism',
    summary: 'Nothing has inherent meaning, value, or truth — and that is the starting point, not the end.',
    essay: `Nihilism is the philosophical position that there are no objective moral truths, no inherent meaning in life, no values that exist apart from the people who hold them. Stated baldly, it sounds devastating. In practice, most thoughtful nihilists treat it as a starting point rather than a verdict.

Nietzsche, who took the diagnosis most seriously, distinguished passive nihilism (the despair that follows the collapse of inherited meaning) from active nihilism (the project of building new values once you accept that no values are given). His "death of god" wasn't a celebration — it was an alarm. If we can't honestly believe what we used to believe, what do we do next?

Twentieth-century existentialists (Sartre, Camus) lived in this aftermath. Camus's question — "is life worth living?" — assumes nihilism as the backdrop and then refuses to let the answer be no. His response was the absurd hero, who keeps going without metaphysical comfort, knowing the meaninglessness and choosing meaning anyway.

Nihilism gets a bad reputation because it's confused with apathy. Real nihilism is the opposite — it's the lucid recognition that nothing has been settled for you, which means everything is genuinely at stake in how you choose to live.`,
    relevantDimensions: ['SI', 'TV', 'SS'],
    relatedArchetypes: ['iconoclast', 'threshold', 'cartographer'],
    philosopherNames: ['Friedrich Nietzsche', 'Albert Camus', 'Jean-Paul Sartre', 'Emil Cioran', 'Thomas Ligotti', 'Eugene Thacker'],
  },
  {
    slug: 'absurdism',
    title: 'Absurdism',
    summary: 'The human need for meaning meets a universe that won\'t supply it. We live in that gap.',
    essay: `Absurdism is Camus's name for the collision between two things that won't go away: the human instinct to seek meaning, purpose, and order — and a universe that, as far as we can tell, supplies none of those things on its own. Most philosophies try to resolve the collision. Camus refused.

His view: don't pretend the universe has meaning (that's "philosophical suicide" — the kind of escape religion or fixed ideologies offer). Don't kill yourself either (that's literal suicide, an escape too). Instead, hold the absurd in view, and live anyway. The myth of Sisyphus — eternally pushing a boulder up a hill only to watch it roll down — becomes a model: "one must imagine Sisyphus happy" because his rebellion against the meaninglessness is itself the meaning.

Absurdism overlaps with existentialism but is more austere. Existentialists build meaning through commitment. Absurdists hold the question open. The strangeness of being conscious in an indifferent cosmos isn't a problem to solve — it's the condition we live with.

In practice, absurdism looks a lot like comedy. The cosmos doesn't care that you exist; here's a tomato sandwich anyway.`,
    relevantDimensions: ['TV', 'SS', 'SR'],
    relatedArchetypes: ['threshold', 'iconoclast', 'pilgrim'],
    philosopherNames: ['Albert Camus', 'Søren Kierkegaard', 'Franz Kafka', 'Samuel Beckett', 'Thomas Nagel'],
  },
  {
    slug: 'consciousness',
    title: 'Consciousness',
    summary: 'Why is there something it\'s like to be you? Why isn\'t the lights-on, no-one-home alternative just as physically possible?',
    essay: `Consciousness is the hard problem in philosophy of mind — David Chalmers's term for what makes it hard. The easy problems (how do brains process information, integrate signals, generate behavior) are scientifically tractable. The hard problem is why any of that information processing is accompanied by subjective experience — why there's "something it's like" to see red, taste coffee, feel pain.

You could imagine a being physically identical to you that does everything you do — including writing this sentence — without any inner experience. Philosophers call such a hypothetical creature a "philosophical zombie." If zombies are even conceivable, then consciousness isn't reducible to physical function. If they're not conceivable, the hard problem dissolves.

Theories proliferate. Eliminativists say consciousness as we conceive it doesn't exist — there's just the brain doing brain things. Functionalists say consciousness is what certain information processing IS. Panpsychists say consciousness is a fundamental feature of reality, more like mass than like digestion. Integrated Information Theory tries to quantify it. None has solved the problem to the others' satisfaction.

What's at stake: ethics (do shrimp suffer? do LLMs?), AI (could a machine be conscious?), and the basic question of where you and your inner life fit in physical reality.`,
    relevantDimensions: ['MR', 'TD', 'SI'],
    relatedArchetypes: ['cartographer', 'touchstone', 'threshold'],
    philosopherNames: ['David Chalmers', 'Daniel Dennett', 'Thomas Nagel', 'Galen Strawson', 'Frank Jackson', 'Patricia Churchland'],
  },
  {
    slug: 'meaning-of-life',
    title: 'The meaning of life',
    summary: 'Not "what is the answer" but "what kind of question is this".',
    essay: `"What is the meaning of life?" is the most famous question in philosophy and the one philosophers most often refuse to take at face value. Pressed for an answer, most will first take apart the question.

Are you asking what life is for (a teleological question — what's the purpose)? Are you asking what makes a life worth living (an evaluative question — what's the good)? Are you asking what role you should play in your own life (an existential question — what to do)? Each has different answers.

Some traditions give clean teleological answers: serve God, achieve enlightenment, perpetuate the species. Modern philosophers tend toward humbler positions: meaning isn't something the universe hands you, it's something you and the people you care about construct. Susan Wolf's "fitting fulfillment" view is one of the more durable: a meaningful life is one in which you're actively engaged in projects that have genuine value, and the engagement and the value both matter.

Maybe the question's hardest move is realizing it's not one question. Asking for "the meaning of life" is like asking for "the meaning of music" — you can answer for a particular piece, in a particular moment, for a particular listener. The general version dissolves into the specifics.`,
    relevantDimensions: ['SS', 'MR', 'CE'],
    relatedArchetypes: ['pilgrim', 'cartographer', 'hearth'],
    philosopherNames: ['Friedrich Nietzsche', 'Søren Kierkegaard', 'Albert Camus', 'Viktor Frankl', 'Susan Wolf', 'Thomas Nagel', 'Aristotle'],
  },
  {
    slug: 'personal-identity',
    title: 'Personal identity',
    summary: 'You at 5, you at 25, you at 75 — what makes them all "you"?',
    essay: `Almost nothing about you is the same as it was twenty years ago. Different cells, different beliefs, different memories, different friends. What makes you the same person across this constant turnover?

The candidates are familiar but each has a counter-example. Memory? Locke's classic answer — but memories fade and split, and false memories implant easily. Body? But your body's cells replace themselves; teleportation thought experiments suggest body might not be what matters. Continuous consciousness? You're not conscious when you're asleep, yet you wake up "the same." Some bundle of these things, woven through time? Probably — but the weaving doesn't have crisp boundaries.

Derek Parfit pushed this to a famous conclusion: "personal identity" is not what matters. What matters is psychological continuity and connectedness — and these come in degrees. A future you is "more or less you" depending on how richly connected your present mental life is to theirs. Less of you. Loose threads, not a fixed thing.

Eastern traditions (especially Buddhist) reached similar conclusions millennia earlier: the self is a process, not a substance — anatta, no-self. Whether this is liberating or terrifying depends on what you were hoping the self was in the first place.`,
    relevantDimensions: ['SI', 'TV', 'MR'],
    relatedArchetypes: ['threshold', 'cartographer', 'pilgrim'],
    philosopherNames: ['John Locke', 'David Hume', 'Derek Parfit', 'Buddha', 'Nāgārjuna', 'Daniel Dennett'],
  },
  {
    slug: 'justice',
    title: 'Justice',
    summary: 'What do we owe each other, and what makes a distribution fair?',
    essay: `"Justice" is the word philosophers reach for when asking what we owe each other — politically, economically, between strangers, across generations. Plato's Republic is the founding text in the Western tradition; he asked what a just city would look like, and what a just soul would look like, on the suspicion that the answers had to be the same.

Modern political philosophy is dominated by a Plato-vs-Hobbes choice. The Platonic side asks what's intrinsically right and tries to build institutions that match. The Hobbesian side asks what arrangements rational self-interested people would consent to. John Rawls's Theory of Justice is the most influential twentieth-century version of the consent-based approach: imagine you didn't know whether you'd be born rich or poor, talented or not, healthy or sick (the "veil of ignorance") — what social arrangement would you choose?

Rawls argued you'd pick a society where inequalities are only justified if they make the worst-off better off. Robert Nozick countered that focusing on outcomes (who has what at the end) ignores how things were acquired (was the process just?) — what matters is whether transactions were voluntary. Communitarians (MacIntyre, Sandel) argued both sides forget that justice is embedded in particular communities and traditions, not derivable from a thin universal premise.

The argument is alive because the stakes are real: every redistributive policy, every property claim, every reparations debate is a fight about which theory wins.`,
    relevantDimensions: ['CE', 'PO', 'UI'],
    relatedArchetypes: ['forge', 'hammer', 'touchstone'],
    philosopherNames: ['Plato', 'John Rawls', 'Robert Nozick', 'Amartya Sen', 'Martha Nussbaum', 'Michael Sandel', 'Iris Marion Young'],
  },
] as const;

export function findTopic(slug: string): Topic | undefined {
  return TOPICS.find(t => t.slug === slug);
}
