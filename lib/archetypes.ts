// Rich archetype data — the 10 philosophical archetypes Mull's quiz can
// place a person at. Names + short blurbs already live as i18n keys in
// translations.ts under arch.<key>.name / arch.<key>.blurb; this module adds
// the long-form content for /archetype/[slug] pages.
//
// Each entry is intentionally English-only for now — same policy as the
// philosopher database. (The structured content — names, dimension labels,
// short blurb — stays translated; the long-form essays are English until
// scholar-verified machine translation is run.) See i18n.content_notice in
// translations.ts.

export type ArchetypeQuote = {
  text: string;
  attribution: string;       // "Marcus Aurelius, Meditations IV.49"
};

export type ArchetypeReading = {
  title: string;
  author: string;
  year?: string;             // approximate; "c. 50 CE", "1843", "1996"
  note: string;              // why this book, in one line
};

export type Archetype = {
  key: string;               // matches FIGURES key + arch.<key>.* i18n
  // Short, evocative phrase usable as a subtitle. NOT a full sentence.
  spirit: string;
  // Long-form essay — 4–5 paragraphs. The "what is this archetype, really".
  detailedAbout: string;
  // Curated quotes from the tradition. 6–8 each.
  quotes: ArchetypeQuote[];
  // 4–6 books, prioritized: an entry point + a primary text + a serious
  // study + something contemporary.
  readingList: ArchetypeReading[];
  // 6–10 philosophers / writers / figures whose orientation lines up.
  // Names only — let users go look them up.
  kindredThinkers: string[];
  // What this orientation gets right that others miss. One paragraph.
  whatItGetsRight: string;
  // Where it tends to hit its limits. One paragraph.
  whereItFalters: string;
  // A small scene — what a day or moment in the life of this orientation
  // looks like. Concrete and imagistic, not abstract.
  dayInTheLife: string;
  // Suggested exercises from /exercises that suit this archetype.
  // Use the slugs from lib/exercises.ts.
  suggestedExercises: string[];
  // Suggested dilemma themes that resonate (used as soft tags for now).
  dilemmaThemes: string[];
  // The dimension(s) this archetype most strongly leans on, in priority
  // order. Keys from lib/dimensions.ts (TV, VA, WP, ...).
  dominantDimensions: string[];
};

export const ARCHETYPES: Archetype[] = [
  // ─── Cartographer ────────────────────────────────────────────────────
  {
    key: 'cartographer',
    spirit: 'Patient mapper of how things fit.',
    detailedAbout:
      "The Cartographer believes the world has a structure — and that structure is something a patient mind can come to see, slowly, with discipline. You don't expect insight to arrive in flashes; you expect it to be built, one careful distinction at a time, until the map of how things relate is good enough to walk by.\n\n" +
      "Underneath this is a quiet faith: that the universe is intelligible. It rewards effort, not in the sense that hard work always pays off financially, but in the sense that the more carefully you look, the more there is to see. A confused situation isn't proof that the world is meaningless; it's an invitation to look again, more slowly, with better tools.\n\n" +
      "Cartographers tend to mistrust intuition that can't justify itself. A felt certainty isn't enough — it has to be reconstructable, in principle, for someone else to follow. This makes you steadier than most people but sometimes slower. Where a Hammer trusts a sudden judgment and a Threshold trusts what bypasses words, you trust the longer route: the diagram, the chain of reasoning, the framework that survives examination.\n\n" +
      "The risk is that map-making can drift from the territory. Spend long enough refining the framework and you forget the point of having one. The best Cartographers stay in regular contact with the messy ground — checking, revising, willing to redraw the map when something refuses to fit. The worst ones keep tidying the map while reality moves underneath.\n\n" +
      "Mull's own design has a Cartographer in its bones — the 16-dimensional model, the careful definitions, the insistence on showing the work. That's not an accident. The Cartographer is the orientation of someone who has decided that confusion is not the natural state of things.",
    quotes: [
      { text: "Philosophy is written in this grand book — I mean the universe — which stands continually open to our gaze, but it cannot be understood unless one first learns to comprehend the language in which it is written.", attribution: "Galileo Galilei, The Assayer (1623)" },
      { text: "It is the mark of an educated mind to be able to entertain a thought without accepting it.", attribution: "Aristotle (commonly attributed)" },
      { text: "If you wish to converse with me, define your terms.", attribution: "Voltaire" },
      { text: "Whereof one cannot speak, thereof one must be silent.", attribution: "Ludwig Wittgenstein, Tractatus 7" },
      { text: "What can be asserted without evidence can be dismissed without evidence.", attribution: "Christopher Hitchens (after Euclid)" },
      { text: "I think it would be a very good idea.", attribution: "Mahatma Gandhi, on Western civilization (apocryphal but in this spirit)" },
      { text: "There is no royal road to geometry.", attribution: "Euclid, to King Ptolemy" },
      { text: "The ideal of a free society is one in which we treat each other as ends in ourselves.", attribution: "After Immanuel Kant, Groundwork (1785)" },
    ],
    readingList: [
      { title: "Discourse on the Method", author: "René Descartes", year: "1637", note: "The founding manifesto of modern systematic doubt — short, accessible, and the model for how to think your way down to firm ground." },
      { title: "Critique of Pure Reason (selections)", author: "Immanuel Kant", year: "1781", note: "Hard, but the attempt to map the limits of what reason can know. Read it in extracts via a guide." },
      { title: "Naming and Necessity", author: "Saul Kripke", year: "1980", note: "A short modern classic — three lectures that reorient how analytic philosophy thinks about language and reality." },
      { title: "How to Think Straight About Psychology", author: "Keith Stanovich", year: "1986/2018", note: "Not philosophy strictly, but the best contemporary training in how to demand evidence and clarify your terms." },
      { title: "The Logic of Scientific Discovery", author: "Karl Popper", year: "1934", note: "Why falsifiability matters; how to tell a real claim from one dressed as a real claim." },
    ],
    kindredThinkers: [
      "Aristotle", "Thomas Aquinas", "Spinoza", "Descartes", "Leibniz",
      "Kant", "Frege", "Russell", "Quine", "Saul Kripke",
    ],
    whatItGetsRight:
      "The Cartographer notices what most others slide past: that words mean different things in different mouths, that what feels obvious is often unjustified, that conviction without scaffolding is fragile. In a culture that rewards confident assertion, the Cartographer's slower habit — defining terms, making distinctions, asking whether a claim could in principle be wrong — is a quiet corrective. Most of the durable intellectual progress humans have made was made by people willing to be patient in this exact way.",
    whereItFalters:
      "The map is not the territory. A Cartographer can spend years refining a framework that no longer touches anything that matters, while a Garden eats fresh figs in the sun and a Forge changes the world. Systematic thinkers also tend to underweight tacit knowledge — the kind of competence that lives in hands and hunches and resists being written down. When Cartographers dismiss what they can't articulate, they sometimes dismiss the very things that should have caused them to revise the map.",
    dayInTheLife:
      "It's late afternoon. You've been working through a problem for two hours, and a colleague drops by with a quick question. You answer, then notice the answer assumed something you'd actually been challenging an hour ago. You stop, write it down, walk a few steps in the room. The point isn't to be clever. The point is that the question you were quick about contained a hidden premise, and the small embarrassment of catching yourself is the moment the work actually moves.",
    suggestedExercises: ['argument-map', 'reductio', 'counterexample-drill', 'translation-under-constraint'],
    dilemmaThemes: ['Belief and certainty', 'Knowledge and learning', 'Doubt and uncertainty'],
    dominantDimensions: ['TR', 'TD', 'UI'],
  },

  // ─── Keel ───────────────────────────────────────────────────────────
  {
    key: 'keel',
    spirit: 'What keeps the boat upright in any storm.',
    detailedAbout:
      "The Keel is the part of the boat you don't see and don't think about — until the wind picks up. Then it's the only thing keeping you from capsizing. People oriented this way carry a kind of inner ballast: not flashy, not loud, but steady. When circumstances change, others scramble. You adjust.\n\n" +
      "At its core is a Stoic insight, older than the name: most of what disturbs us isn't the event itself, it's our judgment about the event. The traffic isn't the problem; the story we're telling about being late is the problem. The Keel doesn't deny the rain — it just doesn't argue with the rain. There's a distinction, sharply held, between what you can change and what you can't, and the energy goes to the first.\n\n" +
      "This orientation tends toward discipline. Routines, practices, the daily reminder that you'll die — these aren't joyless rituals; they're how the Keel keeps weight where it belongs. There's something almost athletic about it: you train for difficulty before it arrives, so when it arrives you've already met it.\n\n" +
      "The risk is becoming so hardened that you stop being moved at all. A Keel can mistake numbness for equanimity, can use \"acceptance\" as a way to avoid sitting with something that should rightly bother you. The classical Stoics knew this. They argued strenuously that the wise person should still feel — should weep at a friend's death, should burn at injustice — just shouldn't be controlled by feeling. The line is finer than it sounds.\n\n" +
      "What the Keel offers, when it works, is a deep reliability — to others, and to yourself. People around a Keel can do their best work because the ground under them isn't shifting. And the Keel themselves can spend their finite hours on what matters, instead of being thrown around by whatever wave came in this morning.",
    quotes: [
      { text: "You have power over your mind — not outside events. Realize this, and you will find strength.", attribution: "Marcus Aurelius, Meditations" },
      { text: "It is not what happens to you, but how you react to it that matters.", attribution: "Epictetus, Enchiridion" },
      { text: "Wealth consists not in having great possessions, but in having few wants.", attribution: "Epictetus" },
      { text: "Begin at once to live, and count each separate day as a separate life.", attribution: "Seneca, Letters to Lucilius" },
      { text: "Difficulties strengthen the mind, as labor does the body.", attribution: "Seneca" },
      { text: "A man who suffers before it is necessary, suffers more than is necessary.", attribution: "Seneca, Letters" },
      { text: "First say to yourself what you would be; and then do what you have to do.", attribution: "Epictetus, Discourses" },
      { text: "Of each particular thing ask: What is it in itself? What is its nature?", attribution: "Marcus Aurelius, Meditations VIII.11" },
    ],
    readingList: [
      { title: "Meditations", author: "Marcus Aurelius", year: "c. 170 CE", note: "The original. Read a few entries each morning. The Hays translation reads cleanest in modern English." },
      { title: "Letters from a Stoic", author: "Seneca", year: "c. 65 CE", note: "Stoicism as practical correspondence — closer in feel to a friend's letters than a system of doctrine." },
      { title: "The Discourses & Enchiridion", author: "Epictetus (compiled by Arrian)", year: "c. 108 CE", note: "Sharper, more pointed than Aurelius. The Enchiridion is short enough to carry around." },
      { title: "A Guide to the Good Life", author: "William Irvine", year: "2008", note: "A modern reconstruction of Stoicism as a practice you can actually try, day to day." },
      { title: "On the Shortness of Life", author: "Seneca", year: "c. 49 CE", note: "Forty pages on time, mortality, and how we spend our hours. Reread it every few years." },
    ],
    kindredThinkers: [
      "Zeno of Citium", "Marcus Aurelius", "Epictetus", "Seneca", "Cato the Younger",
      "Boethius", "Pierre Hadot", "Viktor Frankl", "Nelson Mandela",
    ],
    whatItGetsRight:
      "The Keel notices the size of the gap between what happens and how we respond — and how much of that gap is trainable. A surprising amount of suffering comes from arguing with reality, and the Keel quietly stops doing that. They also notice mortality earlier than most: the daily reminder that life is finite makes the small grievances small again. People around a steady Keel feel that steadiness as a kind of generosity.",
    whereItFalters:
      "The Keel can drift into a quiet stoic affect that's actually emotional avoidance with better PR. The line between 'this is not under my control, so I'll let it pass' and 'I'm not letting myself feel this because feeling it is inconvenient' is real and the Keel sometimes crosses it without noticing. There's also a temptation toward a private, individualist consolation that has nothing to say to systemic harm — discipline can become a way of opting out of solidarity.",
    dayInTheLife:
      "Six in the morning. The kettle is on. You sit in the small kitchen and write three sentences in a notebook: one thing you're grateful for, one thing you're worried about, one thing in your control today. You drink the coffee. The day's news is bad — somewhere it usually is — and you take a slow breath, get dressed, do the next thing. By evening, two of the three things you were worried about turned out not to matter. The third did, and you handled it.",
    suggestedExercises: ['premortem', 'negative-visualization', 'memento-mori', 'examen', 'view-from-above'],
    dilemmaThemes: ['Time and mortality', 'Power and autonomy', 'Pleasure and suffering'],
    dominantDimensions: ['TV', 'AT', 'SS'],
  },

  // ─── Threshold ──────────────────────────────────────────────────────
  {
    key: 'threshold',
    spirit: 'At the edge of what language can hold.',
    detailedAbout:
      "The Threshold stands at a boundary. On one side: the things we can say, weigh, name, prove. On the other: something the names keep almost touching but never quite catching. People oriented this way notice this gap — and trust that what's on the far side is at least as real as what's on the near side, even if it can't be made to sit still for inspection.\n\n" +
      "This isn't quite mysticism in the woolly sense. It's closer to the apophatic tradition: a careful, sometimes severe practice of saying what something is not, because what it is exceeds the saying. You'll find it in the Cloud of Unknowing, in Meister Eckhart, in the Tao Te Ching's first lines (\"the Tao that can be named is not the eternal Tao\"), in Wittgenstein's late silence, in Simone Weil's attention.\n\n" +
      "A Threshold tends to be skeptical of claims that explain too much. The big neat system, the bestseller that resolves the mystery of being human in twelve chapters — these get the side-eye. Not because the world isn't intelligible, but because the most important things have a way of dissolving when you grip them too hard. You sense that the surface of things isn't the whole story, and that a certain kind of seeing requires letting go of the grip.\n\n" +
      "The risk is the cousin to the gift: making a fetish of inarticulacy. \"Words can't capture this\" can be a deep truth or a way of dodging the work of finding better words. The discipline of the Threshold isn't to give up on language; it's to push language to its edge and then notice, honestly, where it stops.\n\n" +
      "When this orientation is well-formed, it produces a particular kind of presence. People feel it. There's space around the Threshold for things that don't fit on a form — grief, awe, the unsayable parts of love, the moments when ordinary life suddenly has more in it than its surface suggested.",
    quotes: [
      { text: "The Tao that can be told is not the eternal Tao. The name that can be named is not the eternal name.", attribution: "Lao Tzu, Tao Te Ching 1" },
      { text: "Whereof one cannot speak, thereof one must be silent.", attribution: "Ludwig Wittgenstein, Tractatus 7" },
      { text: "Attention is the rarest and purest form of generosity.", attribution: "Simone Weil" },
      { text: "I pray God to rid me of God.", attribution: "Meister Eckhart, sermons" },
      { text: "Knowing that you do not know is the highest. Not knowing that you do not know is sickness.", attribution: "Lao Tzu, Tao Te Ching 71" },
      { text: "The mystical is not how the world is, but that it is.", attribution: "Wittgenstein, Tractatus 6.44" },
      { text: "Form is emptiness, emptiness is form.", attribution: "Heart Sutra" },
      { text: "He who knows does not speak; he who speaks does not know.", attribution: "Lao Tzu" },
    ],
    readingList: [
      { title: "Tao Te Ching", author: "Lao Tzu", year: "c. 4th c. BCE", note: "Eighty-one short chapters; carry it for a year. Try the Mitchell or Le Guin translation alongside a more literal one." },
      { title: "The Cloud of Unknowing", author: "Anonymous", year: "14th c.", note: "An English mystical guide to apophatic prayer — surprisingly practical." },
      { title: "Waiting for God", author: "Simone Weil", year: "1942", note: "Attention as a spiritual discipline; the most concrete account of mysticism you'll find from a 20th-century writer." },
      { title: "Sermons", author: "Meister Eckhart", year: "c. 1300", note: "Dense, paradoxical, alive. Read with a guide — the McGinn anthology is a good entry." },
      { title: "Philosophical Investigations", author: "Wittgenstein", year: "1953", note: "Late Wittgenstein abandoning the system-building of his early work; an extended demonstration of running language to its edge." },
    ],
    kindredThinkers: [
      "Lao Tzu", "Zhuangzi", "Pseudo-Dionysius", "Meister Eckhart",
      "Julian of Norwich", "Simone Weil", "Wittgenstein", "Nāgārjuna",
      "Iris Murdoch",
    ],
    whatItGetsRight:
      "The Threshold notices that the most important parts of a life — love, grief, awe, the felt sense that something matters — don't survive being fully reduced to argument. People who try to live entirely on the proven side of the boundary tend to end up flat, even when they're correct about things. The Threshold keeps a door open that other orientations sometimes accidentally close.",
    whereItFalters:
      "Ineffability can shade into evasion. \"There are no words\" can be a true report or a refusal to do the work of articulation. The Threshold can also drift into a private spirituality with little obligation to anyone else — a contemplative life that nobody around them benefits from. The best traditions in this orientation balance the silence with action: Weil with the factory work, the Buddhist monks with the begging bowl, Eckhart preaching to actual congregations.",
    dayInTheLife:
      "Late evening. You've been doing nothing for ten minutes — not on your phone, not reading, just sitting by the window watching the shape of the room change as the light goes. You couldn't say what you've been thinking about. There's a feeling of being slightly more here than you were an hour ago. Tomorrow you'll be busy and forget this happened. But the kindness you'll show a stranger on the train will come from this evening, even if the connection isn't visible.",
    suggestedExercises: ['view-from-above', 'memento-mori', 'examen', 'negative-visualization'],
    dilemmaThemes: ['Spirituality / the unseen', 'Solitude and silence', 'Beauty and aesthetics'],
    dominantDimensions: ['MR', 'SI', 'AT'],
  },

  // ─── Pilgrim ────────────────────────────────────────────────────────
  {
    key: 'pilgrim',
    spirit: 'Walking on, alone, with the question still open.',
    detailedAbout:
      "The Pilgrim has set out without a guarantee that the destination exists. They've looked the situation over honestly — that life is finite, that meaning isn't handed to you, that the ground under any inherited belief can give way — and they've decided to keep walking anyway. Not because it'll all turn out fine. Because walking is what's available, and giving up looks worse from the inside than continuing.\n\n" +
      "This is the existentialist temperament. It crosses Christian (Kierkegaard), Jewish (Buber), atheist (Camus), and ambiguous (Sartre, Beauvoir) variants. What unites them is a refusal of the easy comforts: the cosmic guarantee, the tribal certainty, the system that hands you your meaning prepackaged. The Pilgrim wants the answer they've earned — even if 'earned' means 'lived through enough to have a right to it.'\n\n" +
      "There's a specific honesty in this orientation. The Pilgrim doesn't pretend the absurdity isn't there. They don't argue Camus down. They take seriously the possibility that the universe has nothing to say about whether their life mattered. Then they decide what to do anyway. Camus's image of Sisyphus pushing the rock and finding meaning in the pushing isn't a happy ending; it's a posture.\n\n" +
      "The risk is romantic individualism. Lone wanderers can drift toward a self-image — heroic, lonely, more honest than the people who never left their village — that's actually a kind of pride. The most serious Pilgrims are aware of this trap and stay close to ordinary life: they have friendships, ordinary jobs, weekends like everyone else's. The pilgrimage is an interior posture, not an aesthetic.\n\n" +
      "When this orientation is mature, it produces something rare: a person who doesn't need the world to be a certain way to keep showing up. They've already done the calculation; they know what they're working with. The work continues.",
    quotes: [
      { text: "One must imagine Sisyphus happy.", attribution: "Albert Camus, The Myth of Sisyphus (1942)" },
      { text: "Existence precedes essence.", attribution: "Jean-Paul Sartre, Existentialism Is a Humanism (1946)" },
      { text: "Life can only be understood backwards; but it must be lived forwards.", attribution: "Søren Kierkegaard, journals" },
      { text: "Man is condemned to be free.", attribution: "Sartre, Being and Nothingness" },
      { text: "He who has a why to live for can bear almost any how.", attribution: "Friedrich Nietzsche, in Frankl's Man's Search for Meaning" },
      { text: "The most painful thing is losing yourself in the process of loving someone too much, and forgetting that you are special too.", attribution: "Often attributed to Kierkegaard (variously)" },
      { text: "Everything has been figured out, except how to live.", attribution: "Sartre" },
      { text: "There is only one really serious philosophical problem, and that is suicide.", attribution: "Camus, The Myth of Sisyphus" },
    ],
    readingList: [
      { title: "The Myth of Sisyphus", author: "Albert Camus", year: "1942", note: "The clearest statement of the absurdist position. Slim, lucid, foundational." },
      { title: "Fear and Trembling", author: "Søren Kierkegaard", year: "1843", note: "The original existentialist text — Kierkegaard wrestling with Abraham. Difficult, but the prose is alive." },
      { title: "Man's Search for Meaning", author: "Viktor Frankl", year: "1946", note: "Existentialism tested against the worst conditions humans have produced. The argument survives." },
      { title: "The Ethics of Ambiguity", author: "Simone de Beauvoir", year: "1947", note: "Beauvoir patches the political hole in Sartre — what an existentialist ethics actually requires of you toward others." },
      { title: "I and Thou", author: "Martin Buber", year: "1923", note: "Religious existentialism: meeting the world as 'thou' rather than 'it'. Strange and worth it." },
    ],
    kindredThinkers: [
      "Søren Kierkegaard", "Friedrich Nietzsche", "Jean-Paul Sartre",
      "Simone de Beauvoir", "Albert Camus", "Martin Buber",
      "Viktor Frankl", "Karl Jaspers", "Gabriel Marcel",
    ],
    whatItGetsRight:
      "The Pilgrim refuses cheap consolation. They don't borrow meaning from a system they don't actually believe; they don't pretend the cosmic question is settled when it isn't. This honesty is what allows the meaning they do construct to be real to them. People who haven't passed through this kind of negotiation often have a brittle certainty — strong-looking, but cracks show up the first time it's pressed.",
    whereItFalters:
      "Existentialism can curdle into a self-regarding individualism — the lonely hero of one's own narrative. It can also struggle with collective action: if meaning is forged individually, what holds a community to a shared project? The Pilgrim sometimes underrates the way most people derive real meaning from belonging — and arrives at solidarity late, after first having to be talked out of treating it as a kind of bad faith.",
    dayInTheLife:
      "It's a Tuesday in February, mid-afternoon, and you're walking back from the post office. The sky is the color of slate. You realize, on the corner before your street, that nothing in particular happened this morning and nothing in particular will happen this evening, and you're alright. The realization isn't joyful, exactly. It's something better — clean. You unlock the door, hang up your coat, and start dinner. The sentence Camus gave you has been quiet under everything for years now: keep going.",
    suggestedExercises: ['memento-mori', 'examen', 'view-from-above', 'sixty-second-case', 'switch-sides'],
    dilemmaThemes: ['Time and mortality', 'Loneliness and connection', 'Hope and despair'],
    dominantDimensions: ['TV', 'SS', 'SR'],
  },

  // ─── Touchstone ─────────────────────────────────────────────────────
  {
    key: 'touchstone',
    spirit: "What's true is what survives the test.",
    detailedAbout:
      "A touchstone was the dark stone that goldsmiths rubbed against a piece of metal to see if it was real gold. Streak it on the stone and the color of the streak tells you. The Touchstone orientation works the same way: claims have to be tested, and the test has to be something more than how confidently they were said.\n\n" +
      "This is the empirical, skeptical temper. It runs from Pyrrho through Sextus Empiricus, into Hume's beautiful demolition of unjustified inference, into Mill's experiments and Russell's plain prose. The Touchstone trusts what can be observed, replicated, checked. They distrust grand systems precisely because grand systems generate confident answers without the verification step. \"It hangs together\" isn't enough; lots of false things hang together.\n\n" +
      "There's an honesty about uncertainty in this orientation. The Touchstone is more comfortable saying \"I don't know\" than most people are. Where others patch holes with story, the Touchstone leaves the hole and says it's a hole. This sometimes reads as colder than it is. In fact it's a kind of respect: for evidence, for the thing being studied, for the listener who deserves not to be sold something.\n\n" +
      "The risk is hyper-skepticism. Pushed too far, the Touchstone can refuse any claim that hasn't been triple-verified, which paralyzes ordinary life — most decisions don't have time for that. There's also a tendency to treat what isn't measurable as if it weren't real, which underrates exactly the kinds of human experience that resist the meter and the survey.\n\n" +
      "When the orientation is well-formed, the Touchstone is the friend whose endorsement actually means something. They don't say things they don't believe; when they say them, they've checked. In a world full of overclaiming, that's rare and valuable, and the people around a Touchstone feel safer for having one nearby.",
    quotes: [
      { text: "If it disagrees with experiment, it's wrong.", attribution: "Richard Feynman" },
      { text: "Custom, then, is the great guide of human life.", attribution: "David Hume, Enquiry Concerning Human Understanding" },
      { text: "Extraordinary claims require extraordinary evidence.", attribution: "Carl Sagan" },
      { text: "Nothing should be more highly prized than the value of each day.", attribution: "Goethe (Touchstones often quote past the schools)" },
      { text: "The chief cause of problems is solutions.", attribution: "Eric Sevareid" },
      { text: "The first principle is that you must not fool yourself — and you are the easiest person to fool.", attribution: "Richard Feynman" },
      { text: "When the facts change, I change my mind. What do you do, sir?", attribution: "John Maynard Keynes (commonly attributed)" },
      { text: "If a thing is worth doing, it is worth doing well.", attribution: "G.K. Chesterton, on the value of evidence-based standards" },
    ],
    readingList: [
      { title: "An Enquiry Concerning Human Understanding", author: "David Hume", year: "1748", note: "The cleanest, most readable empiricist text. Hume on causation and miracles is still the standard." },
      { title: "Outlines of Pyrrhonism", author: "Sextus Empiricus", year: "c. 200 CE", note: "The classical handbook of skepticism. How to suspend judgment without going mad." },
      { title: "On Liberty", author: "John Stuart Mill", year: "1859", note: "Empiricism applied to social arrangements. Why we need to keep testing even our most cherished moral views." },
      { title: "The Demon-Haunted World", author: "Carl Sagan", year: "1995", note: "A modern empiricist's case for evidence-based thinking, written for general readers. The 'baloney detection kit' chapter alone is worth the cover price." },
      { title: "Thinking, Fast and Slow", author: "Daniel Kahneman", year: "2011", note: "The empirical case study of how we fool ourselves. Read this even if you're skeptical of pop-science behavioral econ." },
    ],
    kindredThinkers: [
      "Pyrrho of Elis", "Sextus Empiricus", "Francis Bacon",
      "John Locke", "David Hume", "John Stuart Mill",
      "Bertrand Russell", "Karl Popper", "Richard Feynman",
    ],
    whatItGetsRight:
      "The Touchstone refuses to be sold things. They notice when arguments do work language is not entitled to do — when 'natural' is doing the lifting in 'unnatural,' when 'obvious' is hiding a premise. This habit of demanding the ledger has saved a lot of people from a lot of harm. It also keeps the Touchstone honest with themselves: they tend to know what they actually believe, because they've checked.",
    whereItFalters:
      "Some of the most important questions in a life don't have evidence sufficient to settle them — what to do for love, when to leave a job, whether to forgive — and the Touchstone can stall there. The skeptical reflex can also go too far: refusing to act until certainty arrives is itself a choice, often a bad one. And what isn't measurable is sometimes what matters most. The mature Touchstone knows when to put the meter down.",
    dayInTheLife:
      "A friend forwards an article that's clearly meant to alarm them. You read it twice. The second read, you notice the original study had n=20, the headline misstates the conclusion, and the quoted expert is talking about a different question. You write a careful reply. Not 'this is fake'; that would be its own kind of overclaim. Just: here's what the study actually showed, here's what the headline added, here's how to think about the gap. Your friend doesn't necessarily thank you. But two months later they catch a similar article on their own.",
    suggestedExercises: ['fallacy-hunt', 'counterexample-drill', 'steelmanning', 'reductio'],
    dilemmaThemes: ['Belief and certainty', 'Knowledge and learning', 'Doubt and uncertainty'],
    dominantDimensions: ['SR', 'TE', 'TR'],
  },

  // ─── Hearth ─────────────────────────────────────────────────────────
  {
    key: 'hearth',
    spirit: 'Where what binds us across generations is kept warm.',
    detailedAbout:
      "The Hearth is the orientation of someone who feels the weight of inheritance — and treats it as a gift rather than a burden. Behind us is a long line of people who carried the world this far: the recipes, the rituals, the small ways of marking births and deaths, the things grandparents knew that nobody wrote down. The Hearth's instinct is to keep the fire lit and pass it on.\n\n" +
      "This is the communitarian and traditionalist temper, and it's older and stranger than the political vocabulary that's grown up around it. It runs through Confucius's emphasis on family and ritual; through Burke's defense of the 'little platoons' against abstract reform; through Wendell Berry's farms; through MacIntyre's argument that there's no thinking ethics outside the community that gives moral language its meaning. The shared insight: humans aren't atoms. Most of what makes a life livable was handed to you by people you'll never meet.\n\n" +
      "A Hearth notices what most modern frameworks underrate: that ritual matters, that place matters, that the long chain of obligation between the dead and the unborn is real. They're suspicious of solutions that require erasing what's already there. The good ones aren't reactionary; they're conservators — knowing what's worth keeping, willing to argue for it, willing also to revise.\n\n" +
      "The risk is exclusion. A community defined by inheritance has to decide who counts as inheriting from it, and that question can be answered narrowly. Tradition can become an instrument of preserving privilege, and 'we've always done it this way' a defense of things that should not have been done that way. The Hearth at their best is honest about this temptation — and works to widen the circle.\n\n" +
      "When this orientation is mature, it makes a particular kind of place — one that holds people. Children grow up with someone who remembers their grandfather. Strangers are fed. Holidays are observed not for the sake of nostalgia but because the rhythm itself is part of how a life is woven. The Hearth knows what most contemporary life forgets: most meaning is shared meaning, or it isn't meaning at all.",
    quotes: [
      { text: "When you know a thing, to hold that you know it; and when you do not know a thing, to allow that you do not know it — this is knowledge.", attribution: "Confucius, Analects" },
      { text: "Society is indeed a contract... a partnership not only between those who are living, but between those who are living, those who are dead, and those who are to be born.", attribution: "Edmund Burke, Reflections on the Revolution in France (1790)" },
      { text: "To take what there is, and use it, without waiting forever in vain for the preconceived — to dig deep into the actual and get something out of that — this doubtless is the right way to live.", attribution: "Henry James (in the Hearth's spirit)" },
      { text: "We do not inherit the earth from our ancestors; we borrow it from our children.", attribution: "Often attributed to Native American sources" },
      { text: "The center cannot hold; mere anarchy is loosed upon the world.", attribution: "W.B. Yeats, The Second Coming" },
      { text: "I take my own little corner and I do my work.", attribution: "Wendell Berry (paraphrase from many essays)" },
      { text: "Filial piety and fraternal submission — are they not the root of all benevolent actions?", attribution: "Confucius, Analects 1.2" },
      { text: "A man may not transfer the obligation of friendship.", attribution: "Confucian saying" },
    ],
    readingList: [
      { title: "Analects", author: "Confucius (compiled by disciples)", year: "c. 5th c. BCE", note: "Short, aphoristic, the foundational text. The Slingerland or Ames/Rosemont translations preserve the texture." },
      { title: "After Virtue", author: "Alasdair MacIntyre", year: "1981", note: "The contemporary case that ethics requires community and tradition to be intelligible at all. Dense but rewarding." },
      { title: "Reflections on the Revolution in France", author: "Edmund Burke", year: "1790", note: "Long-winded but full of the Hearth's argument: that abstract reform underrates inherited wisdom." },
      { title: "The Unsettling of America", author: "Wendell Berry", year: "1977", note: "Essays on land, place, and what's lost when you treat communities as interchangeable." },
      { title: "Habits of the Heart", author: "Robert Bellah et al.", year: "1985", note: "American sociologists asking what holds a society together when individualism is the default. Still relevant." },
    ],
    kindredThinkers: [
      "Confucius", "Mencius", "Edmund Burke", "Hannah Arendt",
      "Alasdair MacIntyre", "Wendell Berry", "Roger Scruton",
      "Hans-Georg Gadamer", "Robert Putnam",
    ],
    whatItGetsRight:
      "The Hearth notices what individualism rounds off: that humans are formed in communities, that practices matter, that some kinds of knowledge live only in the keeping of small groups. The ethical life isn't a set of personal preferences — it's an inheritance, refined over generations, that we hold in trust. Most contemporary loneliness, the Hearth would argue, is the cost of forgetting this.",
    whereItFalters:
      "Tradition can be an alibi. 'We've always done it this way' has been used to defend things that should never have been done at all. The Hearth's love of the local can shade into suspicion of outsiders — and the line between rooted community and exclusionary tribe is real and worth watching. The best Hearths argue continuously for which inheritances are worth keeping and which need to be left at the door.",
    dayInTheLife:
      "Sunday afternoon. The kitchen smells of something that takes four hours. Children at the table doing something — homework, a card game, half of both. An older relative on the phone in the next room, telling a story you've heard six times. You set out plates, including one for the friend who said they couldn't come and might still come. The conversation, when it happens at dinner, is not particularly clever. It's something better. It's the same conversation, more or less, that this house has been having for thirty years, with the names changing.",
    suggestedExercises: ['examen', 'switch-sides', 'anticipating-objections'],
    dilemmaThemes: ['Relationships', 'Childhood and inheritance', 'Friendship'],
    dominantDimensions: ['CE', 'RT', 'PO'],
  },

  // ─── Forge ──────────────────────────────────────────────────────────
  {
    key: 'forge',
    spirit: 'What is is not what must be.',
    detailedAbout:
      "The Forge looks at the world as material — heated, malleable, capable of being shaped into something better than what it currently is. Where others see fixed conditions, the Forge sees raw stock. The injustice that everyone treats as natural turns out to be a contingent arrangement that humans made and humans can unmake. The institution that seems eternal is actually a hundred and forty years old.\n\n" +
      "This is the orientation of social construction, of utopian imagination, of the long political tradition that runs from the Hebrew prophets through Plato's Republic, through Marx, Wollstonecraft, Du Bois, Beauvoir, Sen. What unites these otherwise very different thinkers is a refusal to mistake the present arrangement for the only possible arrangement. The Forge's question is always: how could this be different, and what would it take?\n\n" +
      "There's a moral seriousness in this orientation that distinguishes it from ordinary discontent. The Forge isn't just complaining; they're holding a picture of how things could be against how they are, and the gap is what motivates the work. They tend to read history backwards from the present, looking for the moments when other paths were available, and forwards into the future, looking for the moments when other paths still are.\n\n" +
      "The risk is utopianism's classic failure: knowing exactly what the better world looks like and being willing to break a lot of present-day people on the way to it. The history of the 20th century is full of Forges who lost the distinction between transforming a system and trampling the people inside it. The mature Forge has read this history and refuses to repeat it.\n\n" +
      "When this orientation is well-formed, it produces real change — usually more slowly than the Forge wants, more durable than they expected, and through coalitions they didn't initially think were possible. The Forge knows that the world we currently have is a snapshot of an ongoing argument, and that they have a vote in what comes next.",
    quotes: [
      { text: "Philosophers have only interpreted the world, in various ways; the point is to change it.", attribution: "Karl Marx, Theses on Feuerbach (1845)" },
      { text: "Be the change you wish to see in the world.", attribution: "Often attributed to Mahatma Gandhi" },
      { text: "Mind has no sex.", attribution: "Mary Wollstonecraft, Vindication of the Rights of Woman (1792)" },
      { text: "Power concedes nothing without a demand. It never did and it never will.", attribution: "Frederick Douglass (1857)" },
      { text: "One is not born, but rather becomes, a woman.", attribution: "Simone de Beauvoir, The Second Sex (1949)" },
      { text: "The arc of the moral universe is long, but it bends toward justice.", attribution: "After Theodore Parker, popularized by Martin Luther King Jr." },
      { text: "Another world is not only possible, she is on her way.", attribution: "Arundhati Roy" },
      { text: "I am invisible, understand, simply because people refuse to see me.", attribution: "Ralph Ellison, Invisible Man" },
    ],
    readingList: [
      { title: "Republic", author: "Plato", year: "c. 380 BCE", note: "The original utopian thought experiment — flawed, magnificent, indispensable. The cave is non-negotiable." },
      { title: "A Vindication of the Rights of Woman", author: "Mary Wollstonecraft", year: "1792", note: "The first systematic feminist political philosophy in English. Still bracing." },
      { title: "The Communist Manifesto", author: "Marx & Engels", year: "1848", note: "Read it in an hour. Whatever you make of the politics, the analytical claim about how social arrangements get naturalized is foundational." },
      { title: "The Souls of Black Folk", author: "W.E.B. Du Bois", year: "1903", note: "An extraordinary blend of social analysis, history, and lyrical prose. The 'double consciousness' concept reshapes everything after it." },
      { title: "Development as Freedom", author: "Amartya Sen", year: "1999", note: "A modern Forge: rebuilding the meaning of 'development' around what humans can actually do, not what countries' GDP says they can." },
    ],
    kindredThinkers: [
      "Plato", "the Hebrew prophets", "Mary Wollstonecraft", "Karl Marx",
      "John Dewey", "W.E.B. Du Bois", "Simone de Beauvoir",
      "Amartya Sen", "Iris Marion Young", "Martha Nussbaum",
    ],
    whatItGetsRight:
      "The Forge sees what's contingent that the rest of us treat as natural. Most of the structures that organize a life — economy, gender, race, family forms, work — are historically specific arrangements that could have been otherwise and have been otherwise. Naming this opens a door that 'just the way things are' tries to keep shut. Lots of moral progress has come from people who refused to accept the categories they were handed.",
    whereItFalters:
      "Knowing what should change is not knowing how to change it. Forges sometimes underrate the friction of moving real institutions full of real people, including the ways their proposed solutions fail in ways the existing arrangement doesn't. They can also become so identified with the picture of the better world that they're willing to harm present-day people in pursuit of it — a recurring tragedy. Patience and humility are the Forge's hardest virtues.",
    dayInTheLife:
      "You're at a long meeting where everyone has decided the problem is unsolvable. You disagree. You've spent six months learning how the regulation actually works, where the leverage is, what the carve-out language would have to say. You wait until the third hour, when people are tired and ready for someone to give them a way forward. You hand them a one-page draft. Three weeks later it goes through, modified. Two years later, the policy people you've been quietly cultivating remember you, and the next bigger change is easier.",
    suggestedExercises: ['premortem', 'steelmanning', 'switch-sides', 'argument-map', 'anticipating-objections'],
    dilemmaThemes: ['Justice and fairness', 'Power and autonomy', 'Politics (personal stake)'],
    dominantDimensions: ['UI', 'WP', 'PO'],
  },

  // ─── Hammer ─────────────────────────────────────────────────────────
  {
    key: 'hammer',
    spirit: 'Break what no longer serves.',
    detailedAbout:
      "Nietzsche described his late work as \"philosophizing with a hammer\" — striking the idols of his culture to find which were hollow. The Hammer is the orientation of someone who would rather break a comfortable inheritance than carry it past the point where it's still alive. They distrust pieties. They trust their own judgment over the consensus. Where others see continuity, they see a system being held up by people too tired to ask whether it should be.\n\n" +
      "This is a difficult orientation. The Hammer is the type to be early in seeing what's wrong, and lonely while seeing it. The historical exemplars — Diogenes mocking Athens, Nietzsche dismantling Christian morality, Camus refusing the comforting story — all paid socially for being right too soon. The Hammer's privilege is to see clearly; the cost is that nobody thanks them for it.\n\n" +
      "Underneath the iconoclasm is, often, a deeper affirmation. Nietzsche didn't tear down inherited values because he was a nihilist; he tore them down because he wanted humans to be capable of creating values worthy of them. The Hammer destroys what's exhausted to make room for what could come next. The negative gesture serves a positive one — even if it's not always articulated.\n\n" +
      "The risk is mistaking destruction for accomplishment. It's easier to demolish than to build. The Hammer can become attached to the pose of the iconoclast: contrarian for its own sake, suspicious of any consensus regardless of its merits, performatively outside the herd. When this happens, the Hammer's clarity becomes a kind of vanity, and they lose the affirmative project that made the destruction worth it in the first place.\n\n" +
      "When the Hammer is well-formed, they're the friend who tells you the thing nobody else will. They puncture your most flattering self-narrative without unkindness, point at the contradiction in the conventional wisdom you'd been planning to adopt. People around a real Hammer are sharper because of the friction. The Hammer themselves, if they're honest, knows the difficulty: they're useful precisely to the people who can withstand them.",
    quotes: [
      { text: "He who has a why to live for can bear almost any how.", attribution: "Friedrich Nietzsche, Twilight of the Idols (1888)" },
      { text: "Become what you are.", attribution: "Nietzsche, Thus Spoke Zarathustra" },
      { text: "What does not kill me makes me stronger.", attribution: "Nietzsche, Twilight of the Idols" },
      { text: "Without music, life would be a mistake.", attribution: "Nietzsche, Twilight of the Idols" },
      { text: "The individual has always had to struggle to keep from being overwhelmed by the tribe.", attribution: "Nietzsche" },
      { text: "I love those who do not know how to live, except by going under.", attribution: "Nietzsche, Thus Spoke Zarathustra" },
      { text: "There are no facts, only interpretations.", attribution: "Nietzsche, notebooks" },
      { text: "Every great philosophy has been the personal confession of its author.", attribution: "Nietzsche, Beyond Good and Evil" },
    ],
    readingList: [
      { title: "Twilight of the Idols", author: "Friedrich Nietzsche", year: "1888", note: "Short and ferocious. The book Nietzsche himself called the entry point. Read it in a sitting." },
      { title: "Thus Spoke Zarathustra", author: "Friedrich Nietzsche", year: "1883–1885", note: "Strange, beautiful, deliberately mythic. Approach it as poetry rather than treatise." },
      { title: "Beyond Good and Evil", author: "Friedrich Nietzsche", year: "1886", note: "More argumentative than Zarathustra; the systematic critique of inherited morality." },
      { title: "Diogenes the Cynic", author: "Luis E. Navia", year: "2005", note: "A modern study of the Greek who lived in a barrel and mocked Alexander. Diogenes was the original Hammer." },
      { title: "Stirner's Critics", author: "Max Stirner", year: "1845", note: "Stirner is the underrated radical individualist — the Hammer applied to the self. Difficult, bracing." },
    ],
    kindredThinkers: [
      "Diogenes the Cynic", "La Rochefoucauld", "Voltaire",
      "Friedrich Nietzsche", "Max Stirner", "Emil Cioran",
      "Christopher Hitchens", "Camille Paglia",
    ],
    whatItGetsRight:
      "The Hammer notices when convention has gone hollow — when the words people are using don't refer to anything they actually believe. They notice the small lies that hold a community together when the community has run out of better material. This is uncomfortable to be around but indispensable. Cultures that have no Hammers eventually become ridiculous to themselves; cultures that have Hammers but can't tolerate them become rigid.",
    whereItFalters:
      "Negation is easier than affirmation, and the Hammer can become attached to the pose of being against. Contrarianism for its own sake produces no work and no community; the iconoclast who can only break starts to look like a child with a stick. The mature Hammer eventually has to build something — even if it's only a small group of people who can stand each other's honesty — or the destruction was for nothing.",
    dayInTheLife:
      "A friend tells you the thing they're proud of and you can see, immediately, that it's a story they're telling themselves to avoid noticing something else. You wait. There's a moment to say it kindly, and a moment to say it not at all, and a moment to say it directly. You take the third. The conversation gets harder for ten minutes. Then it gets easier than it has been in a year. Walking home, you wonder for the hundredth time whether being this kind of friend is a gift or just a habit. You'll never quite know.",
    suggestedExercises: ['fallacy-hunt', 'reductio', 'counterexample-drill', 'switch-sides'],
    dilemmaThemes: ['Anger and grievance', 'Authority and obedience', 'Truth-telling and lying'],
    dominantDimensions: ['SS', 'WP', 'SR'],
  },

  // ─── Garden ─────────────────────────────────────────────────────────
  {
    key: 'garden',
    spirit: 'The good things this life offers, taken seriously.',
    detailedAbout:
      "Epicurus literally taught in his garden, just outside Athens, in a community that grew its own food and spent its days in conversation, friendship, and study. The school was unusual for the time — it admitted women, foreigners, slaves — and it organized itself around a startling claim: that pleasure is the natural good, and a well-lived life is one that arranges itself thoughtfully around the things that genuinely make a person happy.\n\n" +
      "The Garden orientation has been misunderstood for two thousand years as hedonism. It isn't. Epicurus was almost ascetic in practice — he ate barley bread and drank water — and he was specific about why: most of what people pursue under the name of pleasure (status, wealth, reputation) doesn't actually produce sustained enjoyment, and chasing it makes life worse. The Garden distinguishes carefully between necessary pleasures (food, friendship, sleep), unnecessary but natural pleasures (good wine, fine food, comfort), and unnatural pleasures (fame, riches), and orients toward the first.\n\n" +
      "What the Garden notices, that other orientations miss, is that the embodied, sensory, present-moment world is where most of life actually happens — and that taking it seriously is not philosophical small-talk. The taste of bread, the company of a friend, an afternoon walk, the relief of a good night's sleep: a person who has these in good order has more of what makes life worth having than a person with great wealth and constant low-grade anxiety. The contemporary inheritor of this tradition is whoever cooks dinner from a garden they planted, eats it slowly, and goes to bed at ten.\n\n" +
      "The risk is depoliticization. Epicurus's school famously withdrew from politics — \"live unnoticed\" was a maxim — and this can shade into a kind of comfortable irrelevance to the larger fortunes of the community. The Garden can also drift into curated pleasure-seeking that loses the original austerity of the doctrine; the Instagram feed of artisanal sourdough is the Garden's modern caricature.\n\n" +
      "When the orientation is mature, the Garden produces what may be the rarest thing in any culture: people who know how to enjoy themselves. This sounds trivial. It isn't. Most people don't. Most people are either chasing the next thing or recovering from the last one. A Garden, properly grown, is the kind of person other people slow down around because the slowing-down feels like permission.",
    quotes: [
      { text: "Pleasure is our first and kindred good. It is the starting-point of every choice and every aversion.", attribution: "Epicurus, Letter to Menoeceus" },
      { text: "If thou wilt make a man happy, add not unto his riches but take away from his desires.", attribution: "Epicurus" },
      { text: "Of all the things which wisdom acquires to produce the blessedness of the complete life, by far the greatest is the possession of friendship.", attribution: "Epicurus, Principal Doctrines" },
      { text: "It is impossible to live a pleasant life without living wisely and well and justly. And it is impossible to live wisely and well and justly without living pleasantly.", attribution: "Epicurus, Principal Doctrines V" },
      { text: "I have never wished to cater to the crowd; for what I know they do not approve, and what they approve I do not know.", attribution: "Epicurus" },
      { text: "Death is nothing to us; for the body, when it has been resolved into its elements, has no feeling, and that which has no feeling is nothing to us.", attribution: "Epicurus, Letter to Menoeceus" },
      { text: "Misfortune seldom intrudes upon the wise man; his greatest and highest interests are directed by reason throughout the course of life.", attribution: "Epicurus" },
      { text: "Eat, drink and be merry, for tomorrow we may die.", attribution: "Often (mis)attributed to Epicurus; closer to Ecclesiastes 8:15" },
    ],
    readingList: [
      { title: "Letter to Menoeceus", author: "Epicurus", year: "c. 300 BCE", note: "Short — fifteen pages. The clearest single statement of Epicurean ethics. Read it slowly." },
      { title: "On the Nature of Things", author: "Lucretius", year: "c. 50 BCE", note: "The great Latin poem laying out Epicureanism in full. Stunning even in translation." },
      { title: "The Swerve", author: "Stephen Greenblatt", year: "2011", note: "How Lucretius's poem was nearly lost and then rediscovered. Popular but well-told." },
      { title: "The Art of Happiness", author: "Daniel Klein & Antonia Macaro", year: "2013", note: "A modern reconstruction of Epicurean practice — practical, charming." },
      { title: "Walden", author: "Henry David Thoreau", year: "1854", note: "Not Epicurean by name, but in deep sympathy. The American Garden." },
    ],
    kindredThinkers: [
      "Epicurus", "Lucretius", "Diogenes Laertius",
      "Michel de Montaigne", "Henry David Thoreau",
      "Wendell Berry", "Mary Oliver", "Thich Nhat Hanh",
    ],
    whatItGetsRight:
      "The Garden notices that most people are bad at pleasure. They confuse it with intensity, with novelty, with what other people are doing. The actual pleasures of an embodied life — well-prepared food, time with someone you love, an unhurried morning — are mostly free, and most people don't know how to take them. Epicurus's quiet correction was: this is what the good life is, and you can have it now if you can stop chasing the wrong things.",
    whereItFalters:
      "The Garden's withdrawal from politics has consequences. Other people are running the world while the Garden is in the kitchen, and the world they run sometimes comes for the kitchen. The orientation can also become precious — a curated aestheticization of small pleasures that's really just a class marker. The mature Garden eats simple food with whoever is around, not artisanal foam off a tasting menu.",
    dayInTheLife:
      "Saturday morning. You're in no hurry. There's coffee, and the dog needs to be walked, and the bread you started yesterday is rising. A friend texts asking if you want to come to a thing tonight; you say maybe. By noon you've cooked something, written a letter you'd been meaning to write, taken a long shower, and read for an hour. None of it was urgent. That's the point. By the time evening comes you actually want to see your friend, instead of dragging yourself to the thing because you should.",
    suggestedExercises: ['examen', 'view-from-above', 'memento-mori'],
    dilemmaThemes: ['Pleasure and suffering', 'The body', 'Beauty and aesthetics'],
    dominantDimensions: ['VA', 'ES', 'TE'],
  },

  // ─── Lighthouse ─────────────────────────────────────────────────────
  {
    key: 'lighthouse',
    spirit: 'The eternal pattern beneath the changing surface.',
    detailedAbout:
      "The Lighthouse stands above the sea and sees what individual waves can't see: the same patterns repeating, the steady stars, the contour of the coast that doesn't change with the weather. People oriented this way notice that beneath every individual instance — every just act, every beautiful object, every true sentence — there's something the instance is participating in, and that this 'something' is more real than any particular case of it.\n\n" +
      "This is the Platonic temperament. Plato's claim — controversial then, controversial now — was that the visible world is shadows on a wall, and that what casts the shadows is a realm of eternal forms: Justice itself, Beauty itself, the Good itself. We catch glimpses through ordinary experience: an act of fairness, a piece of music, a moment of insight. But the act and the music and the insight are pointers. The thing they point to is what the Lighthouse loves.\n\n" +
      "This orientation tends to take seriously what other temperaments dismiss as abstraction. The mathematician who feels that mathematical truths are discovered, not invented; the lawyer who believes Justice exists independently of any legal system; the lover of music who senses they're touching something more permanent than the recording — these are Lighthouses. The world has structure that's not arbitrary, and a life can be organized around contact with that structure.\n\n" +
      "The risk is contempt for the changing world. Plato was hard on the body, hard on the senses, hard on art that didn't point upward. A Lighthouse can drift into a kind of impatience with ordinary reality — with the messy, finite, embodied lives that other people are leading — and that impatience is its own failure. The form of Justice doesn't pay your friend's medical bills; the form of Beauty doesn't keep an actual marriage alive.\n\n" +
      "When the orientation is mature, the Lighthouse holds both: the pointer and the pointed-at. The actual friend whose face has aged, and the love that face is participating in. The piece of music being played by an imperfect quartet, and the music itself. They live in the visible world without ever quite forgetting that the visible world is not all there is.",
    quotes: [
      { text: "Until philosophers are kings, or the kings and princes of this world have the spirit and power of philosophy, cities will never have rest from their evils.", attribution: "Plato, Republic" },
      { text: "Beauty awakens the soul to act.", attribution: "Dante (in the Lighthouse spirit)" },
      { text: "The eye, by which I see God, is the same eye by which God sees me.", attribution: "Meister Eckhart" },
      { text: "I think, therefore I am.", attribution: "René Descartes — but the Lighthouse hears it as: thinking is what's real" },
      { text: "Whoever is moved by Beauty when it is presented to him is alive.", attribution: "Robert Adams" },
      { text: "The unexamined life is not worth living.", attribution: "Socrates, in Plato's Apology" },
      { text: "Mathematics, rightly viewed, possesses not only truth, but supreme beauty.", attribution: "Bertrand Russell" },
      { text: "The whole of life is a journey toward Heaven.", attribution: "After Augustine" },
    ],
    readingList: [
      { title: "Republic", author: "Plato", year: "c. 380 BCE", note: "Books V–VII contain the cave, the divided line, the form of the Good. Read these even if you skip the rest." },
      { title: "Symposium", author: "Plato", year: "c. 385 BCE", note: "On love as the ascent through beautiful things to Beauty itself. The Lighthouse's most beautiful text." },
      { title: "Phaedo", author: "Plato", year: "c. 360 BCE", note: "Socrates on the eve of his execution, arguing for the immortality of the soul. Strange, moving, foundational." },
      { title: "Confessions", author: "Augustine", year: "c. 400 CE", note: "Christian Platonism in its highest form. The autobiography of a soul ascending toward what it has always been seeking." },
      { title: "Iris Murdoch's The Sovereignty of Good", author: "Iris Murdoch", year: "1970", note: "The 20th-century Lighthouse: defending the reality of the Good against the moral skepticism of her era." },
    ],
    kindredThinkers: [
      "Pythagoras", "Plato", "Plotinus", "Augustine",
      "Boethius", "Anselm", "Spinoza", "Iris Murdoch",
      "Simone Weil", "Roger Scruton",
    ],
    whatItGetsRight:
      "The Lighthouse notices that some things — Justice, Beauty, mathematical truth — don't seem reducible to the particular cases they show up in. A society that lost the entire idea of Justice as something to aim at would be impoverished even if all its laws happened to be procedurally fair. The Lighthouse keeps alive a sense that the highest things are real and accessible, however imperfectly, through honest attention. That sense is hard to maintain in a thoroughly disenchanted culture, and rare.",
    whereItFalters:
      "Contempt for the body, contempt for the changing world, contempt for the people who can't or won't ascend. Platonism's worst tendency is to treat ordinary life as a way station to the real thing, and to treat the people most invested in ordinary life as unenlightened. The mature Lighthouse remembers that they're standing on the same ground as everyone else — and that the eternal forms, if they're real, are also present in the very ordinary moments other people are simply living.",
    dayInTheLife:
      "You're at a quartet performance, second row. The third movement begins. About twenty seconds in, something happens — the passage you've heard a hundred times opens out, and for maybe forty seconds you have the strange feeling that the music is doing something the musicians aren't entirely responsible for. They look as surprised as you do. Afterwards, walking home, you can't reconstruct what made it that performance and not the others. But you know you weren't imagining it. You go to bed having added a small piece of evidence to the long argument inside you that some things are real in a way that doesn't quite fit on any of the available lists.",
    suggestedExercises: ['view-from-above', 'sixty-second-case', 'argument-map', 'memento-mori'],
    dilemmaThemes: ['Beauty and aesthetics', 'Spirituality / the unseen', 'Knowledge and learning'],
    dominantDimensions: ['UI', 'TD', 'AT'],
  },
];

// Look up an archetype by key. Returns undefined if the slug isn't valid.
export function getArchetypeByKey(key: string): Archetype | undefined {
  return ARCHETYPES.find(a => a.key === key);
}

// All keys, for generateStaticParams.
export function archetypeKeys(): string[] {
  return ARCHETYPES.map(a => a.key);
}
