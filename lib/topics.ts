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
    relatedArchetypes: ['cartographer', 'pilgrim', 'hammer'],
    philosopherNames: [
      'Spinoza',
      'Kant',
      'Schopenhauer',
      'William James',
      'Sartre',
      'Daniel Dennett',
      'Galen Strawson',
    ],
  },
  {
    slug: 'stoicism',
    title: 'Stoicism',
    summary: "Live according to nature, focus on what you control, accept what you don't.",
    essay: `Stoicism is a school of ancient Greek and Roman philosophy that's enjoying an unlikely twenty-first-century revival in Silicon Valley boardrooms, military barracks, and self-help podcasts. The core idea is austere and useful: the only thing genuinely in your control is your own judgment + response, and serenity comes from radically accepting everything else.

The classical Stoics — Marcus Aurelius, Seneca, Epictetus — were practical philosophers, not abstract ones. They wrote letters, diaries, daily exercises. Memento mori (remember you'll die). Premeditatio malorum (rehearse the bad things). The view from above (zoom out cosmically when small troubles feel large). These practices aren't about emotional suppression — Stoics felt grief, anger, love — but about not being ruled by them.

Modern Stoicism gets criticized for being apolitical (the original Stoics largely accepted Roman slavery), for being too individualistic, for sometimes sliding into bro-grade "be tough" content. The serious version is none of those things — it's a careful framework for keeping your inner life intact while the outer world rearranges itself.`,
    relevantDimensions: ['TR', 'AT', 'TV'],
    relatedArchetypes: ['keel', 'pilgrim', 'hearth'],
    philosopherNames: ['Marcus Aurelius', 'Seneca', 'Epictetus', 'Chrysippus', 'Musonius Rufus'],
  },
  {
    slug: 'existentialism',
    title: 'Existentialism',
    summary: "You exist first, then you make yourself. Meaning isn't given — it's chosen.",
    essay: `Existentialism's bumper-sticker: existence precedes essence. You're not born with a fixed purpose (the way a knife is born for cutting). You exist first — a raw conscious being thrown into the world — and only later do your choices make you into who you are.

This is freedom, but it's also a weight. Sartre called it "condemned to be free." Without a god-given meaning, every important question (what to live for, what's worth dying for, what kind of person to be) is on you. No appeal to a higher authority can answer it for you, and the temptation to pretend otherwise — to live as if some authority has settled it — is what Sartre called bad faith.

Existentialists don't agree on much else. Kierkegaard was a Christian; Sartre was an atheist; Camus rejected the label. What they share is a refusal to look away from the fundamental strangeness of being a self-aware creature who has to keep choosing, with finite time, in the dark.`,
    relevantDimensions: ['SS', 'SI', 'TV'],
    relatedArchetypes: ['threshold', 'hammer', 'pilgrim'],
    philosopherNames: [
      'Kierkegaard',
      'Sartre',
      'Simone de Beauvoir',
      'Camus',
      'Heidegger',
      'Karl Jaspers',
      'Nietzsche',
    ],
  },
  {
    slug: 'trolley-problem',
    title: 'The trolley problem',
    summary:
      'A runaway trolley will kill five people unless you pull a lever to divert it onto a track where it kills one. Do you pull?',
    essay: `The trolley problem was invented by philosopher Philippa Foot in 1967 to expose how messy our moral intuitions are. Most people say yes to the basic version: pull the lever, kill one to save five. Then Judith Jarvis Thomson added the variant: same outcome, but to save the five you have to push a heavy stranger off a bridge into the trolley's path. Now most people say no.

The numbers are identical. The acts are different. Why does pushing feel categorically worse than pulling?

Consequentialists (who count outcomes) say the intuition is wrong — both should be yes. Deontologists (Kant especially) say the intuition is right — using a person as a mere instrument violates their dignity in a way that pulling a lever doesn't. Virtue ethicists ask a different question: what kind of person are you becoming by pushing or not pushing? Care ethicists ask: what does my relationship to the stranger on the bridge require?

The trolley problem isn't really about trolleys. It's about whether moral reasoning is fundamentally about consequences, about rules, about character, or about relationships — and most people, when pressed, turn out to be all four at once.`,
    relevantDimensions: ['UI', 'PO', 'CE'],
    relatedArchetypes: ['hammer', 'forge', 'touchstone'],
    philosopherNames: ['Philippa Foot', 'Kant', 'Mill', 'Bernard Williams', 'Peter Singer'],
  },
  {
    slug: 'utilitarianism',
    title: 'Utilitarianism',
    summary:
      'The right action is the one that produces the greatest happiness for the greatest number.',
    essay: `Utilitarianism is one of those rare moral theories that sounds obviously right at first and obviously monstrous a few seconds later. The basic claim: actions are good to the degree they produce happiness (or reduce suffering) — not just for you, but for everyone affected, weighted equally.

This is radical. It says your child's broken arm doesn't count more than a stranger's broken arm. It says you should give until giving more would hurt you more than it would help the recipient. Peter Singer's version (effective altruism) takes this seriously enough to make people uncomfortable: if you can save a drowning child at small cost to yourself, you must; if you can save a stranger across the world with a charitable donation, the moral logic is the same.

Critics push back hard. Bernard Williams pointed out that utilitarianism asks you to be a happiness-calculating machine in situations where having integrity, loyalty, or love would require you to refuse. Other critics note the famous "utility monster" problem: if one being could derive enormous pleasure from harming others, would utilitarianism endorse the harm? Most utilitarians deny this — but the burden of working out exactly why is heavy.`,
    relevantDimensions: ['UI', 'PO', 'CE'],
    relatedArchetypes: ['hammer', 'forge', 'cartographer'],
    philosopherNames: ['Jeremy Bentham', 'Mill', 'Henry Sidgwick', 'Peter Singer', 'Derek Parfit'],
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
    philosopherNames: [
      'Aristotle',
      'Confucius',
      'Mencius',
      'Thomas Aquinas',
      'Alasdair MacIntyre',
      'Martha Nussbaum',
    ],
  },
  {
    slug: 'nihilism',
    title: 'Nihilism',
    summary:
      'Nothing has inherent meaning, value, or truth — and that is the starting point, not the end.',
    essay: `Nihilism is the philosophical position that there are no objective moral truths, no inherent meaning in life, no values that exist apart from the people who hold them. Stated baldly, it sounds devastating. In practice, most thoughtful nihilists treat it as a starting point rather than a verdict.

Nietzsche, who took the diagnosis most seriously, distinguished passive nihilism (the despair that follows the collapse of inherited meaning) from active nihilism (the project of building new values once you accept that no values are given). His "death of god" wasn't a celebration — it was an alarm. If we can't honestly believe what we used to believe, what do we do next?

Twentieth-century existentialists (Sartre, Camus) lived in this aftermath. Camus's question — "is life worth living?" — assumes nihilism as the backdrop and then refuses to let the answer be no. His response was the absurd hero, who keeps going without metaphysical comfort, knowing the meaninglessness and choosing meaning anyway.

Nihilism gets a bad reputation because it's confused with apathy. Real nihilism is the opposite — it's the lucid recognition that nothing has been settled for you, which means everything is genuinely at stake in how you choose to live.`,
    relevantDimensions: ['SI', 'TV', 'SS'],
    relatedArchetypes: ['hammer', 'threshold', 'cartographer'],
    philosopherNames: ['Nietzsche', 'Camus', 'Sartre', 'Schopenhauer'],
  },
  {
    slug: 'absurdism',
    title: 'Absurdism',
    summary:
      "The human need for meaning meets a universe that won't supply it. We live in that gap.",
    essay: `Absurdism is Camus's name for the collision between two things that won't go away: the human instinct to seek meaning, purpose, and order — and a universe that, as far as we can tell, supplies none of those things on its own. Most philosophies try to resolve the collision. Camus refused.

His view: don't pretend the universe has meaning (that's "philosophical suicide" — the kind of escape religion or fixed ideologies offer). Don't kill yourself either (that's literal suicide, an escape too). Instead, hold the absurd in view, and live anyway. The myth of Sisyphus — eternally pushing a boulder up a hill only to watch it roll down — becomes a model: "one must imagine Sisyphus happy" because his rebellion against the meaninglessness is itself the meaning.

Absurdism overlaps with existentialism but is more austere. Existentialists build meaning through commitment. Absurdists hold the question open. The strangeness of being conscious in an indifferent cosmos isn't a problem to solve — it's the condition we live with.

In practice, absurdism looks a lot like comedy. The cosmos doesn't care that you exist; here's a tomato sandwich anyway.`,
    relevantDimensions: ['TV', 'SS', 'SR'],
    relatedArchetypes: ['threshold', 'hammer', 'pilgrim'],
    philosopherNames: ['Camus', 'Kierkegaard', 'Nietzsche', 'Schopenhauer'],
  },
  {
    slug: 'consciousness',
    title: 'Consciousness',
    summary:
      "Why is there something it's like to be you? Why isn't the lights-on, no-one-home alternative just as physically possible?",
    essay: `Consciousness is the hard problem in philosophy of mind — David Chalmers's term for what makes it hard. The easy problems (how do brains process information, integrate signals, generate behavior) are scientifically tractable. The hard problem is why any of that information processing is accompanied by subjective experience — why there's "something it's like" to see red, taste coffee, feel pain.

You could imagine a being physically identical to you that does everything you do — including writing this sentence — without any inner experience. Philosophers call such a hypothetical creature a "philosophical zombie." If zombies are even conceivable, then consciousness isn't reducible to physical function. If they're not conceivable, the hard problem dissolves.

Theories proliferate. Eliminativists say consciousness as we conceive it doesn't exist — there's just the brain doing brain things. Functionalists say consciousness is what certain information processing IS. Panpsychists say consciousness is a fundamental feature of reality, more like mass than like digestion. Integrated Information Theory tries to quantify it. None has solved the problem to the others' satisfaction.

What's at stake: ethics (do shrimp suffer? do LLMs?), AI (could a machine be conscious?), and the basic question of where you and your inner life fit in physical reality.`,
    relevantDimensions: ['MR', 'TD', 'SI'],
    relatedArchetypes: ['cartographer', 'touchstone', 'threshold'],
    philosopherNames: [
      'David Chalmers',
      'Daniel Dennett',
      'Galen Strawson',
      'Frank Jackson',
      'Patricia Churchland',
    ],
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
    philosopherNames: ['Nietzsche', 'Kierkegaard', 'Camus', 'Susan Wolf', 'Aristotle', 'Mill'],
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
    philosopherNames: ['Locke', 'Hume', 'Derek Parfit', 'Buddha', 'Nagarjuna', 'Daniel Dennett'],
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
    philosopherNames: [
      'Plato',
      'John Rawls',
      'Martha Nussbaum',
      'Michael Sandel',
      'Alasdair MacIntyre',
      'Aristotle',
    ],
  },

  // ─── Expansion batch (2026-05-26): 20 new topics ─────────────────

  {
    slug: 'skepticism',
    title: 'Skepticism',
    summary: 'How sure can we really be of anything — and what should we do with the uncertainty?',
    essay: `Skepticism is the discipline of withholding belief when the evidence doesn't earn it. Ancient skeptics — Pyrrho, Sextus Empiricus — went further: they suspended belief on almost everything, hoping the suspension itself would lead to tranquility. Their target wasn't truth but the anxious certainty of dogmatists who claimed to have it.

Modern skepticism narrowed. Descartes used radical doubt as a method: doubt everything that could be doubted, then see what's left. He concluded *cogito ergo sum* — at minimum, the doubter must exist. Hume pushed harder: even basic inferences (the sun will rise tomorrow because it always has) rest on a habit, not a proof. We act as if induction works because we couldn't function otherwise.

The serious version of skepticism today is calibration, not paralysis. Believe in proportion to evidence. Hold strong opinions weakly. Be ready to revise. The cost of failing at this is everywhere — in conspiracy theories, in political tribalism, in the confident asserting of things the asserter hasn't actually checked. The skeptic's discipline is not "doubt everything" but "doubt yourself first."`,
    relevantDimensions: ['SR', 'TR', 'SI'],
    relatedArchetypes: ['touchstone', 'cartographer'],
    philosopherNames: [
      'Pyrrho',
      'Sextus Empiricus',
      'Descartes',
      'Hume',
      'Montaigne',
      'Bayle',
      'Wittgenstein',
    ],
  },
  {
    slug: 'empiricism-vs-rationalism',
    title: 'Empiricism vs rationalism',
    summary: 'Does knowledge come from experience or from reason? The 350-year argument.',
    essay: `Rationalists (Descartes, Spinoza, Leibniz) thought the most important truths — math, logic, the structure of reality — could be derived by pure reason. The mind has innate concepts; experience just triggers them. Empiricists (Locke, Berkeley, Hume) thought the mind starts blank. Everything we know comes through the senses, and concepts are built up from sensory impressions.

The disagreement isn't academic. It shapes what counts as evidence, what counts as proof, what kinds of claims are even possible. A rationalist will accept a mathematical demonstration as final; an empiricist will ask what observation could falsify it. A rationalist will trust intuition; an empiricist will demand the data.

Kant tried to resolve the fight: some knowledge is *a priori* (independent of experience, like math) but applies to experience through the categories the mind imposes. Most contemporary philosophy of science is empiricist in spirit but quietly rationalist about logic and mathematics. The argument never ends because both sides catch something true — most of what you know about chairs is empirical, most of what you know about 2+2 is not.`,
    relevantDimensions: ['TR', 'TE', 'SR'],
    relatedArchetypes: ['cartographer', 'touchstone'],
    philosopherNames: [
      'Descartes',
      'Spinoza',
      'Leibniz',
      'Locke',
      'Berkeley',
      'Hume',
      'Kant',
      'W. V. O. Quine',
    ],
  },
  {
    slug: 'phenomenology',
    title: 'Phenomenology',
    summary:
      'The careful description of experience as experience — before any theory about what it really is.',
    essay: `Phenomenology asks a strange-sounding question: what is it actually like, from the inside, to perceive a tree, to grieve, to remember childhood? Edmund Husserl founded the movement in the early 1900s. His insistence: philosophy should describe experience in its own terms. No reducing it to neuroscience or behavior. No jumping immediately to "what's really there."

The method is "bracketing": set aside, temporarily, the question of whether your experience corresponds to reality. Just look at the structure of the experience itself. What's at the center? What's at the periphery? What's the temporal flow? What's the body's role? The resulting descriptions can be surprisingly rich — and they often reveal that the casual things we say about consciousness (it's "in" the head, we "have" experiences) are theories, not observations.

Heidegger turned phenomenology into existential analysis: what is it like to be a creature aware of its own mortality, thrown into a world it didn't choose? Merleau-Ponty insisted that perception is embodied — you don't have a mind looking out of a body; you ARE a body-knowing-the-world. Phenomenology still shapes how we talk about consciousness, art, embodiment, and the limits of objective description.`,
    relevantDimensions: ['MR', 'ES', 'TD'],
    relatedArchetypes: ['threshold', 'lighthouse', 'garden'],
    philosopherNames: [
      'Edmund Husserl',
      'Heidegger',
      'Merleau-Ponty',
      'Sartre',
      'Simone de Beauvoir',
      'Emmanuel Levinas',
    ],
  },
  {
    slug: 'pragmatism',
    title: 'Pragmatism',
    summary:
      'Truth is what works under inquiry. Ideas earn their keep by their consequences for action.',
    essay: `Pragmatism is the most distinctively American philosophical tradition. Peirce, James, and Dewey, working in the late 1800s, were suspicious of the grand metaphysical disputes European philosophers had been having for centuries. Their move: treat ideas as tools. An idea's meaning is the difference its truth would make to practice. An idea is "true" if it survives the inquiries we put it through.

This isn't relativism. Pragmatists believe in disciplined inquiry, in evidence, in being responsive to facts. What they reject is the picture of truth as a perfect correspondence between propositions and a mind-independent reality — a picture they think generates pseudo-problems. Instead: what would have to be the case for this idea to do its job? Does the idea hold up when we try?

The practical bite is enormous. William James used pragmatism to defend religious belief (if it works in your life, it earns a place). John Dewey used it to reshape education and democracy. Contemporary neo-pragmatists like Richard Rorty pushed further — denying that "truth" is a useful concept beyond what works for whom. The continuing influence is most visible in pluralist political theory, in empirical philosophy, and in the deep suspicion among American philosophers of any system claiming a god's-eye view.`,
    relevantDimensions: ['PO', 'TE', 'VA'],
    relatedArchetypes: ['keel', 'forge', 'touchstone'],
    philosopherNames: [
      'Charles Sanders Peirce',
      'William James',
      'John Dewey',
      'Richard Rorty',
      'Hilary Putnam',
      'Cornel West',
    ],
  },
  {
    slug: 'determinism',
    title: 'Determinism',
    summary:
      'If everything follows from prior causes, what room is left for freedom — or for blame?',
    essay: `Determinism is the claim that every event, including every choice you make, is the necessary consequence of prior conditions plus the laws of nature. If you rewound the universe to last Tuesday with everything identical, the same Wednesday would unfold. There's no genuine alternative; the future is fixed.

The thesis is surprisingly hard to dismiss. Most of what we know about the physical world looks deterministic. Even quantum mechanics, which introduces randomness, doesn't obviously help — random isn't the same as free. And the evidence from neuroscience increasingly suggests that the brain commits to a decision milliseconds before consciousness catches up.

What's at stake is moral responsibility. If you couldn't have done otherwise, can you really be blamed? Compatibilists (the majority position in academic philosophy) say yes — "could have done otherwise" should be understood as "would have done otherwise if you'd wanted to." That's enough for praise, blame, and the practices that hold society together. Hard determinists say no, the whole apparatus of guilt and merit is built on an illusion, and we should reorient our institutions accordingly — focusing on rehabilitation rather than punishment. The debate has real-world consequences for criminal justice, addiction policy, and how we treat people who fail.`,
    relevantDimensions: ['TR', 'TV', 'SR'],
    relatedArchetypes: ['cartographer', 'lighthouse', 'threshold'],
    philosopherNames: [
      'Spinoza',
      'Laplace',
      'Daniel Dennett',
      'Galen Strawson',
      'Sam Harris',
      'Robert Sapolsky',
    ],
  },
  {
    slug: 'buddhism',
    title: 'Buddhism (philosophical)',
    summary:
      'A 2,500-year tradition built around three claims about the self, suffering, and attention.',
    essay: `Stripped to its philosophical bones, Buddhism makes three claims that have weathered 2,500 years of refinement. First: the unified, persisting "self" we casually assume we have is a construction — what's actually there is a stream of experiences, mistakenly bundled. Second: most suffering comes from clinging to things (including the constructed self) as if they were stable when they aren't. Third: there's a discipline of attention that loosens the clinging.

This isn't escapism. Serious Buddhist philosophy — Nagarjuna on emptiness, Dharmakirti on perception, Dogen on time — is some of the most subtle metaphysics ever written. The arguments rival anything in the Western analytic tradition for rigor. They just start from different premises about what's worth analyzing.

The practical core: there's a difference between pain (unavoidable, the cost of being alive) and suffering (avoidable, the result of resisting pain). Mindfulness practice trains the gap between stimulus and response, where you can notice the resistance rather than being it. Modern Western psychology has absorbed enormous amounts of this without always crediting the source. Whether you treat Buddhism as religion, philosophy, or practical psychology, its claims about how minds actually work hold up under inspection.`,
    relevantDimensions: ['MR', 'SI', 'AT'],
    relatedArchetypes: ['threshold', 'pilgrim', 'lighthouse'],
    philosopherNames: [
      'Buddha',
      'Nagarjuna',
      'Dharmakirti',
      'Dogen',
      'Padmasambhava',
      'Asanga',
      'Vasubandhu',
    ],
  },
  {
    slug: 'daoism',
    title: 'Daoism',
    summary:
      'Live in accord with the way things move. Stop forcing. Notice what your interference produces.',
    essay: `Daoism (Taoism) is the philosophical tradition that grew around the Daodejing — eighty-one short chapters of cryptic poetry attributed to Laozi, plus the playful, antic essays of Zhuangzi. The central concept, *dao*, means "way" or "path" but expands to mean the underlying pattern by which things spontaneously occur. To act *wu wei* — without forcing — is to align with this pattern, not against it.

The pictures are vivid. Water wears down stone not by violence but by yielding. A skilled cook cuts an ox by finding the natural joints. A wise ruler governs by stepping back. Most of what we call effort, the Daoists noticed, is interference — pushing where push isn't needed, naming what doesn't need a name, drawing lines where reality is continuous.

There's a sharper critique underneath the imagery: when you try to impose categories on the world (good/bad, useful/useless, success/failure), you generate the opposite of what you intended. Force "good" and you create new evils. Pursue "success" and you guarantee a particular kind of failure. The Daoist way isn't passivity; it's the difficult discipline of acting only when action is needed, and learning to recognize when it isn't.`,
    relevantDimensions: ['MR', 'VA', 'SR'],
    relatedArchetypes: ['threshold', 'garden', 'pilgrim'],
    philosopherNames: ['Laozi', 'Zhuangzi', 'Liezi', 'Wang Bi', 'Guo Xiang'],
  },
  {
    slug: 'confucianism',
    title: 'Confucianism',
    summary:
      'The self is constituted by its relationships. Ritual + role + cultivation, not freedom from these.',
    essay: `Confucius (Kongzi, 551–479 BCE) and his successors built an ethics around a single conviction: a human being is not a free-floating individual who happens to have relationships, but a creature constituted by them. You are a child to your parents, a sibling to your siblings, a friend to your friends, a citizen of your community. To become a good person is to become good at being all of these — in the right ways, with the right feeling, at the right time.

The technical word is *ren* (humaneness, fellow-feeling). It can't be taught as a rule. It's cultivated through ritual (*li*) — the practices that, repeated, shape what feels right. A Western ethicist might ask "what's the rule for being kind to strangers?" A Confucian asks "what practices, over years, will make kindness toward strangers your second nature?"

Modern philosophy often dismisses Confucianism as conservative, role-bound, hierarchical — and there are versions that are. The serious tradition is something else. Mencius argued every human has innate moral sprouts that, watered by good practice, grow into virtue. Wang Yangming insisted that genuine knowledge and action can't be separated — to know the good and not do it is to not really know it. Contemporary virtue ethicists (Aristotle's heirs) keep rediscovering what Confucius worked out: a good life is a long apprenticeship in the company of others.`,
    relevantDimensions: ['CE', 'RT', 'PO'],
    relatedArchetypes: ['hearth', 'keel', 'pilgrim'],
    philosopherNames: [
      'Confucius',
      'Mencius',
      'Xunzi',
      'Wang Yangming',
      'Cheng Yi',
      'Cheng Hao',
      'Tu Weiming',
    ],
  },
  {
    slug: 'problem-of-evil',
    title: 'The problem of evil',
    summary:
      'If God is all-powerful and all-good, why does suffering exist? The hardest question in theology.',
    essay: `The problem is ancient and brutal. If a creator god is all-powerful, all-knowing, and all-good, then suffering shouldn't exist — or, where it exists, it should serve a purpose proportionate to its cost. Yet children die of cancer, earthquakes bury villages, and millions starve. Either God isn't all-powerful, or isn't all-good, or has reasons we can't see. Each option costs something significant.

The standard defenses are old and refined. The free-will defense (Augustine, Plantinga): evil comes from human choice, not God; a world with genuine freedom is worth the cost. The soul-making defense (Hick): suffering forms character that couldn't form otherwise. The skeptical theist: God's reasons exceed our grasp; we have no standing to call the picture incoherent.

David Hume, Voltaire, and Dostoevsky each found these defenses wanting. Hume noted that a competent designer could have built a world with the same moral lessons and less unnecessary cruelty. Voltaire's *Candide* made the soul-making defense look obscene in the face of actual mass death. Dostoevsky's Ivan Karamazov returns the ticket of admission — declines a salvation built on the suffering of even one tortured child. The problem is not solved; the most honest theists treat it as a wound that lives alongside faith, rather than a puzzle that yields to argument.`,
    relevantDimensions: ['TV', 'MR', 'TR'],
    relatedArchetypes: ['threshold', 'cartographer', 'pilgrim'],
    philosopherNames: [
      'Epicurus',
      'Augustine',
      'Hume',
      'Voltaire',
      'Dostoevsky',
      'Alvin Plantinga',
      'Marilyn McCord Adams',
    ],
  },
  {
    slug: 'mind-body-problem',
    title: 'The mind-body problem',
    summary:
      'How does the wet electrical mass between your ears produce the experience of being you?',
    essay: `Stare at your hand and try to notice the experience of red. Now try to describe, in the language of neurons and chemistry, what that experience IS. You'll find a strange gap. Brain states are publicly observable, made of physical stuff, locatable in space. Experience is private, subjective, and seemingly not locatable in any obvious physical sense. How do they connect?

Descartes thought they couldn't, really — mind and body must be distinct substances, somehow interacting at the pineal gland. Contemporary philosophers mostly reject substance dualism but disagree on what to put in its place. Physicalists say mental states ARE brain states — qualia (the redness of red) is just a way the brain processes information. Property dualists, like David Chalmers, say physical processes generate experience but experience isn't reducible to them. The "hard problem" of consciousness is exactly this irreducibility.

Eliminativists (the Churchlands) go further: maybe our folk-psychological talk about beliefs, desires, and qualia is just wrong — like talk of phlogiston was wrong — and a mature neuroscience will replace it. Functionalists say it doesn't matter what mental states are made of, as long as they play the right role in cognition. Each view costs something — and no one currently knows how to close the explanatory gap between objective brain and subjective mind.`,
    relevantDimensions: ['TD', 'TR', 'SI'],
    relatedArchetypes: ['cartographer', 'lighthouse', 'threshold'],
    philosopherNames: [
      'Descartes',
      'Spinoza',
      'Gilbert Ryle',
      'Thomas Nagel',
      'David Chalmers',
      'Daniel Dennett',
      'Paul Churchland',
    ],
  },
  {
    slug: 'solipsism',
    title: 'Solipsism',
    summary:
      "How do you know other minds exist? The challenge that's philosophically harder than it looks.",
    essay: `Solipsism is the view that only your own mind is certain to exist. Other people might be philosophical zombies — outwardly indistinguishable from the conscious, but with nothing going on inside. The position sounds obviously crazy, but it's surprisingly hard to refute on its own terms.

You can't introspect another person's experience. All you have access to is behavior — what they do, what they say, how they react. You infer minds behind the behavior because behavior matches what you'd do if you had a mind. But the inference is exactly the kind of inductive leap Hume warned about: just because the pattern has held so far doesn't prove it generalizes.

Most philosophers don't take solipsism as a serious metaphysical position. They take it as a useful boundary case that reveals something about the limits of proof. Wittgenstein argued that the very meaning of "mind" or "pain" depends on a community of users; a private language doesn't make sense, so radical solipsism is incoherent on its own terms. Levinas turned the problem upside down: the encounter with the *face* of the other is the foundational moral fact, prior to any inferred metaphysics. Whether you find any of these convincing is itself a test of how seriously you take the question.`,
    relevantDimensions: ['SR', 'SI', 'CE'],
    relatedArchetypes: ['threshold', 'cartographer'],
    philosopherNames: [
      'Descartes',
      'Berkeley',
      'Wittgenstein',
      'Emmanuel Levinas',
      'Bertrand Russell',
    ],
  },
  {
    slug: 'authenticity',
    title: 'Authenticity',
    summary:
      'What would it mean to actually be yourself — and is "yourself" even a coherent thing to be?',
    essay: `"Be yourself" is one of the most common pieces of moral advice and one of the most underexamined. Existentialists were the first to take it seriously as a philosophical problem. Sartre, Heidegger, and Beauvoir all argued that most of what we do is *inauthentic* — we let "the they" (Heidegger's term for impersonal social pressure) decide what we want, what we believe, who we become.

Authenticity, on this view, isn't a fixed self you discover. It's a stance you take toward your own life: claiming the choices you make as YOURS, not blaming circumstance or social role, owning the freedom and the responsibility together. Bad faith — Sartre's term — is the move where you pretend you couldn't have done otherwise, or that your role required it. Authentic action faces the freedom squarely.

Critics push back hard. Charles Taylor and Bernard Williams asked: authentic to WHAT? There's no neutral self underneath the social roles, no preference-list waiting to be revealed. We're constituted by our communities, our languages, our histories. The advice to "be yourself" can become its own form of bad faith — pretending you can stand outside your situation and pick a true self. The honest version asks something harder: not who are you, but who do you keep choosing to become, and is the choosing yours?`,
    relevantDimensions: ['SS', 'TV', 'SI'],
    relatedArchetypes: ['threshold', 'pilgrim', 'hammer'],
    philosopherNames: [
      'Kierkegaard',
      'Heidegger',
      'Sartre',
      'Simone de Beauvoir',
      'Charles Taylor',
      'Bernard Williams',
    ],
  },
  {
    slug: 'eudaimonia',
    title: 'Eudaimonia — the good life',
    summary:
      "Aristotle's answer: not pleasure, not virtue alone, but the activity of a whole life lived well.",
    essay: `*Eudaimonia* is usually translated "happiness" but means something closer to "flourishing" or "a life going well." For Aristotle, who put the concept at the center of his ethics, eudaimonia isn't a feeling. It's the activity of a soul living in accordance with its excellences (*aretai*) — virtues — over a complete life.

This sounds abstract until you notice what it isn't. It isn't moment-to-moment pleasure (you can have a string of pleasures and still be living badly). It isn't external success (you can have wealth and fame and be miserable, or be cheated of them by bad luck and still be flourishing). It isn't a permanent psychological state (you can flourish while grieving, while struggling, while old). It's something more like: a person living rightly is doing what a flourishing human does, and the flourishing is constituted by the doing.

The Aristotelian tradition matured into modern virtue ethics (MacIntyre, Foot, Nussbaum, Hursthouse). The core insight survives: the question "what's the good life?" can't be answered by looking at any single moment or feeling. It has to be answered by what you'd recognize, watching from outside, as a life that was good to live, that was good for others, and that was good to have been. Most other ethical frameworks (deontology, consequentialism) presuppose an answer to this question and then ask how to achieve it. Virtue ethics goes after the question itself.`,
    relevantDimensions: ['VA', 'PO', 'RT'],
    relatedArchetypes: ['garden', 'hearth', 'keel'],
    philosopherNames: [
      'Aristotle',
      'Alasdair MacIntyre',
      'Philippa Foot',
      'Martha Nussbaum',
      'Rosalind Hursthouse',
    ],
  },
  {
    slug: 'social-contract',
    title: 'The social contract',
    summary: 'Why submit to political authority? Because a rational agent would have agreed to.',
    essay: `Social contract theory is the dominant Western framework for justifying political authority. The basic move: imagine humans before government — Hobbes\' "state of nature," Locke\'s pre-political community, Rousseau\'s natural innocence. Ask what arrangement those people, reasoning carefully about their interests, would have agreed to. Whatever they would have agreed to, you (today) have implicitly consented to by participating in the arrangement.

The three founders disagree sharply. Hobbes thought the state of nature was so brutal — "solitary, poor, nasty, brutish, and short" — that rational agents would consent to almost any sovereign capable of keeping order. Locke had a friendlier view: even in the state of nature, people have rights to life, liberty, and property; legitimate government protects these, and loses legitimacy when it violates them. Rousseau argued that civilization itself had corrupted us, and only a radical reconstruction (the general will) could restore freedom.

John Rawls revived the tradition in the twentieth century with his "veil of ignorance" — imagine choosing the basic structure of society without knowing what role you'd play in it. Rawls argued you\'d pick a society where the worst-off were as well-off as possible. Robert Nozick fired back that any pattern enforced by the state inevitably violates individual rights to free transaction. The argument continues because the question is unavoidable: every state demands obedience; every state owes its citizens a story for why.`,
    relevantDimensions: ['UI', 'PO', 'CE'],
    relatedArchetypes: ['forge', 'cartographer', 'touchstone'],
    philosopherNames: [
      'Hobbes',
      'Locke',
      'Rousseau',
      'Kant',
      'John Rawls',
      'Robert Nozick',
      'Hugo Grotius',
    ],
  },
  {
    slug: 'aesthetics',
    title: 'Aesthetics — what is beauty?',
    summary:
      'Is beauty in the eye of the beholder, in the object, in the relationship between them, or somewhere else?',
    essay: `Aesthetics asks what makes something beautiful, sublime, ugly, kitsch, or great. The puzzle that keeps the field alive: aesthetic judgments feel both deeply personal AND somehow shareable. When you call a sunset beautiful, you're not just reporting a private feeling — you'd be surprised to find someone who thought it ugly. Yet there's no fact about the sunset that PROVES beauty.

Kant gave the most influential modern answer. Beauty is what produces in us a disinterested pleasure — we don't want to consume the beautiful object, we want to keep contemplating it. The pleasure feels universal because it tracks the harmony between our imagination and our understanding, which all humans share. This is why we expect others to see beauty when we do, even though we can't prove they should.

Other traditions diverge. The Confucian aesthetic ties beauty to moral character — the brushstroke reveals the person. Romantic aesthetics (Schopenhauer, Nietzsche) tied beauty to access to deeper realities than concept could reach. Contemporary aesthetics has expanded to include everyday aesthetics (the beauty of a well-set table), environmental aesthetics, and aesthetic appreciation of nature on its own terms. The big practical takeaway: aesthetic taste is trainable, judgments improve with attention, and a culture that treats all aesthetic claims as mere preference loses something important.`,
    relevantDimensions: ['ES', 'VA', 'MR'],
    relatedArchetypes: ['garden', 'threshold', 'lighthouse'],
    philosopherNames: [
      'Plato',
      'Kant',
      'Schopenhauer',
      'Nietzsche',
      'John Dewey',
      'Susanne Langer',
      'Arthur Danto',
    ],
  },
  {
    slug: 'epistemology',
    title: 'Epistemology — what is knowledge?',
    summary:
      "The classical answer: justified true belief. The four-decade argument over whether that's enough.",
    essay: `For most of philosophical history, "knowledge" was defined as *justified true belief*. To know that the cat is on the mat, three things had to be true: the cat IS on the mat (truth), you BELIEVE the cat is on the mat (belief), and you have GOOD REASONS for the belief (justification). Simple enough — until 1963.

Edmund Gettier published a three-page paper that broke the field. He constructed cases where someone has a justified true belief that doesn't intuitively count as knowledge. A standard example: you look at a clock that, unbeknownst to you, stopped exactly twelve hours ago; it currently reads 3:00, and the actual time IS 3:00. You believe it's 3:00 (true), you\'re justified (clocks usually work), and the belief is true — but you don\'t know what time it is. You got lucky.

Sixty years of "Gettier responses" tried to add a fourth condition. None has held. Some philosophers (Williamson) gave up on analyzing knowledge into parts and treated it as basic. Others (virtue epistemologists like Linda Zagzebski) argued that knowledge is a kind of cognitive achievement — knowing requires success that's CREDITABLE to the knower\'s competence, not luck. Whichever direction the field eventually settles, Gettier permanently changed what philosophers think they\'re doing when they say "I know."`,
    relevantDimensions: ['TR', 'SR', 'TD'],
    relatedArchetypes: ['cartographer', 'touchstone', 'lighthouse'],
    philosopherNames: [
      'Plato',
      'Descartes',
      'Hume',
      'Kant',
      'Edmund Gettier',
      'Timothy Williamson',
      'Linda Zagzebski',
      'Alvin Goldman',
    ],
  },
  {
    slug: 'truth',
    title: 'Truth',
    summary:
      'Is truth a relationship between sentences and reality, or something built up inside our practices?',
    essay: `What makes a sentence true? The intuitive answer is the correspondence theory: a sentence is true if it accurately describes the world. "Snow is white" is true if and only if snow is, in fact, white. This is so obvious it feels like a triviality — but spelling it out has been one of the harder projects in twentieth-century philosophy.

Tarski showed how to give a formal theory of truth for limited languages, treating "is true" as a relation between sentences and the world. But for natural languages, correspondence runs into problems: what does "corresponds" actually MEAN? What corresponds to abstract truths like "torture is wrong"? Coherentists (Hegel, Brand Blanshard) said truth is a property of whole systems of belief — a sentence is true if it fits with the rest of what we accept. Pragmatists (James, Dewey) said truth is what works — what survives inquiry.

The contemporary picture is humbler. Deflationists like Paul Horwich argue "true" is just a useful device: to say "snow is white is true" is to say snow is white. There's no deep theory of truth, only a logical convenience. Anti-realists in particular domains (mathematics, ethics) argue you can have a useful concept of truth without metaphysical realism. The fight matters because what you think truth IS shapes what you think disagreement amounts to, and how seriously you take rival worldviews.`,
    relevantDimensions: ['TR', 'TD', 'SR'],
    relatedArchetypes: ['cartographer', 'touchstone', 'lighthouse'],
    philosopherNames: [
      'Plato',
      'Aristotle',
      'Aquinas',
      'Frege',
      'Russell',
      'Alfred Tarski',
      'Paul Horwich',
      'Hilary Putnam',
    ],
  },
  {
    slug: 'hedonism',
    title: 'Hedonism',
    summary:
      'Pleasure is the only thing intrinsically good. Everything else is good only insofar as it leads there.',
    essay: `Hedonism — the claim that pleasure is the only ultimate good and pain the only ultimate bad — has a worse reputation than it deserves. Its serious advocates weren't decadent libertines. Epicurus, the founding figure, lived simply in a garden with friends, ate mostly bread and water, and thought the most reliable pleasures were the absence of pain, anxiety, and want.

The interesting hedonist move is to keep asking "good for what?" until you hit something self-justifying. Most things we value (money, fame, achievement) are valuable instrumentally — they lead to states we like. The hedonist insists that what makes any of this valuable in the end is the experience it produces. Even the satisfaction of knowing you\'ve done good is, ultimately, a kind of pleasure (a refined one, but still).

Nozick\'s "experience machine" thought experiment hit hedonism hard. Imagine a machine that could give you any pleasurable experience you wanted, indistinguishable from real life, for the rest of your life — would you plug in? Most people say no. They want to actually accomplish things, actually be in relationships, actually know reality. If pleasure were the only good, plugging in would be the obvious choice. The fact that most of us refuse suggests pleasure isn't the only thing we value — though figuring out what else IS valued, and why, turns out to be much harder than the hedonist made it look.`,
    relevantDimensions: ['VA', 'ES', 'PO'],
    relatedArchetypes: ['garden', 'pilgrim'],
    philosopherNames: [
      'Epicurus',
      'Lucretius',
      'Jeremy Bentham',
      'Mill',
      'Sidgwick',
      'Robert Nozick',
    ],
  },
  {
    slug: 'moral-luck',
    title: 'Moral luck',
    summary:
      'Should chance affect how blameworthy you are? Our intuitions say one thing; our principles another.',
    essay: `Two drivers are equally careless. One arrives home safely. The other, by sheer bad luck, hits a child who runs into the road. We treat them very differently — the first faces no consequences; the second may face years in prison and a lifetime of grief. Yet the act was identical, the choice was identical, the character was identical. Should the difference in outcome change the moral judgment?

Bernard Williams and Thomas Nagel sharpened the question in the 1970s. Our intuition says yes — the unlucky driver IS worse off morally, blameworthy in a way the lucky driver isn\'t. But our principle says no — what\'s under your control is what makes you praiseworthy or blameworthy, and outcomes (especially when they hinge on luck) aren\'t fully under your control. Something has to give.

Nagel identified several kinds of moral luck. Resultant luck: the outcome of your choice. Circumstantial luck: the situations you find yourself in (a German in 1939 had moral choices forced on them an American didn't). Constitutive luck: the character you happened to develop. Causal luck: the very fact that you have any agency at all, in a universe of prior causes. Once you start counting, the supposedly luck-free domain of moral responsibility shrinks alarmingly. The contemporary picture: either we revise our intuitions, our principles, or our concept of responsibility itself. None of the three is comfortable.`,
    relevantDimensions: ['TV', 'SR', 'CE'],
    relatedArchetypes: ['touchstone', 'threshold', 'cartographer'],
    philosopherNames: [
      'Bernard Williams',
      'Thomas Nagel',
      'Aristotle',
      'Kant',
      'Susan Wolf',
      'Dana Nelkin',
    ],
  },
  {
    slug: 'philosophy-of-love',
    title: 'Philosophy of love',
    summary:
      'Is romantic love a feeling, a choice, a virtue, a contract — or something stranger than any of these?',
    essay: `Philosophy of love is younger than you might expect. Plato wrote about it in the Symposium — love as a ladder ascending from particular beautiful bodies to the Form of Beauty itself. But the systematic philosophy of romantic love really begins in the twentieth century, when the assumption that love sits outside rational analysis started to give way.

Harry Frankfurt argues love is a *volitional* state, not just an emotional one — to love someone is to be committed to caring about their good for their own sake, in a way that organizes your other commitments. This makes love continuous with what you do, not just what you feel. Robert Solomon (and the long tradition behind him) treated love as a kind of project — you and the other person create something together, and the relationship\'s quality reflects the quality of the creating.

Other traditions push back. Iris Murdoch, drawing on Plato and Buddhism, treated love as a particular kind of attention — the discipline of seeing the other person as they actually are, without your own ego distorting the picture. Care ethicists insist that love isn\'t reducible to either feeling or choice — it lives in patterns of responsive attention that come from being-in-relationship over time. The philosophical interest is partly diagnostic: what we think love IS shapes what we expect from it, and many modern unhappinesses come from importing one tradition\'s picture into a relationship built on another.`,
    relevantDimensions: ['CE', 'VA', 'MR'],
    relatedArchetypes: ['hearth', 'garden', 'threshold'],
    philosopherNames: [
      'Plato',
      'Augustine',
      'Kierkegaard',
      'Heloise of Argenteuil',
      'Iris Murdoch',
      'Harry Frankfurt',
      'bell hooks',
    ],
  },
] as const;

export function findTopic(slug: string): Topic | undefined {
  return TOPICS.find((t) => t.slug === slug);
}

// ─── Index-page categorisation ──────────────────────────────────────
//
// Topics are categorized for the /topic index page only — the data
// itself stays flat. If you add a new topic, also add its slug to
// the right bucket here, or it falls into the "More" bucket as a
// fallback.

export type TopicCategoryKey =
  | 'big-questions'
  | 'schools'
  | 'eastern'
  | 'ethics'
  | 'knowledge-beauty';

export const TOPIC_CATEGORIES: {
  key: TopicCategoryKey;
  label: string;
  blurb: string;
  icon: string;
  accent: string;
  slugs: string[];
}[] = [
  {
    key: 'big-questions',
    label: 'The big questions',
    blurb:
      'The puzzles philosophers keep returning to — about freedom, mind, identity, and what is.',
    icon: '◆',
    accent: '#B8862F',
    slugs: [
      'free-will',
      'consciousness',
      'meaning-of-life',
      'personal-identity',
      'mind-body-problem',
      'solipsism',
      'determinism',
      'problem-of-evil',
    ],
  },
  {
    key: 'schools',
    label: 'Schools of thought',
    blurb:
      'The named movements — stoicism, existentialism, pragmatism. Different starting points, different answers.',
    icon: '▲',
    accent: '#6B7F4F',
    slugs: [
      'stoicism',
      'existentialism',
      'nihilism',
      'absurdism',
      'skepticism',
      'empiricism-vs-rationalism',
      'phenomenology',
      'pragmatism',
      'hedonism',
    ],
  },
  {
    key: 'eastern',
    label: 'Eastern traditions',
    blurb:
      'Three traditions that shaped half the world — and got mostly cut from the Western syllabus.',
    icon: '◯',
    accent: '#A65846',
    slugs: ['buddhism', 'daoism', 'confucianism'],
  },
  {
    key: 'ethics',
    label: 'Ethics & how to live',
    blurb: 'What we owe each other. What makes a life good. How to act when the rules run out.',
    icon: '✦',
    accent: '#7C5A8C',
    slugs: [
      'utilitarianism',
      'virtue-ethics',
      'trolley-problem',
      'justice',
      'social-contract',
      'moral-luck',
      'philosophy-of-love',
      'authenticity',
      'eudaimonia',
    ],
  },
  {
    key: 'knowledge-beauty',
    label: 'Knowledge & beauty',
    blurb: 'How we know what we know. What makes something beautiful. The theory side of the map.',
    icon: '✧',
    accent: '#3D5A7E',
    slugs: ['truth', 'epistemology', 'aesthetics'],
  },
];

type TopicBucket = {
  key: string;
  label: string;
  blurb: string;
  icon: string;
  accent: string;
  topics: Topic[];
};

/** Helper: returns topics grouped by category, with any uncategorized
 *  ones placed in a trailing "More" bucket so the page never silently
 *  drops content if a slug isn't registered above. */
export function topicsByCategory(): TopicBucket[] {
  const seen = new Set<string>();
  const buckets: TopicBucket[] = TOPIC_CATEGORIES.map((cat) => {
    const topics = cat.slugs
      .map((slug) => {
        const t = TOPICS.find((x) => x.slug === slug);
        if (t) seen.add(slug);
        return t;
      })
      .filter((x): x is Topic => !!x);
    return {
      key: cat.key,
      label: cat.label,
      blurb: cat.blurb,
      icon: cat.icon,
      accent: cat.accent,
      topics,
    };
  });
  const leftover = TOPICS.filter((t) => !seen.has(t.slug));
  if (leftover.length > 0) {
    buckets.push({
      key: 'more',
      label: 'More topics',
      blurb: 'Recently added — not yet sorted into a section.',
      icon: '○',
      accent: '#8C6520',
      topics: [...leftover],
    });
  }
  return buckets;
}
