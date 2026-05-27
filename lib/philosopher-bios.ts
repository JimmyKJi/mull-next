// Extended bios for the philosophers most people actually search for.
//
// The constellation has ~560 entries; hand-writing a long bio for each
// is intractable + low-ROI. This file holds 200-400 words of unique
// prose for the ~25 most-searched philosophers — the ones for which
// "[name] philosophy" or "[name] beliefs" is a high-volume query.
//
// Used by /philosopher/[slug]: when the slug has a bio here, it renders
// below the keyIdea quote as the page's main editorial content. Pages
// without a bio still work — they just rely on the existing chrome.
//
// Each bio:
//   - Reads as one coherent essay (3-5 paragraphs)
//   - Is unique prose (not paraphrased from Wikipedia)
//   - Names 2-3 of the philosopher's key works inline
//   - Frames the position in terms a curious-but-not-academic reader can
//     follow, then sharpens it
//   - Does NOT duplicate the keyIdea sentence verbatim
//
// Slugs match philosopherSlug() output from lib/philosophers.ts. If a
// slug doesn't resolve, the page silently skips the bio — never errors.

export const PHILOSOPHER_BIOS: Record<string, string> = {
  plato: `Plato is the philosopher Western philosophy keeps arguing with — Whitehead's "footnotes to Plato" line is overused because it's basically true. The dialogues read like theatre: Socrates in conversation with friends, sophists, generals, slaves, working through a question by pressing it until the easy answers collapse.

The structural moves matter more than any single conclusion. Plato thought ordinary perception was unreliable — what we see and touch are imperfect copies of perfect Forms (the Form of the Good, the Form of Justice). The famous Cave allegory in *Republic* makes the case: most people live in shadows, mistaking projections for the things themselves. Real knowledge is hard, slow, and unflattering to the knower.

The political philosophy in *Republic* is unsettling. Plato wanted philosopher-kings, censored poetry, and rigid class structure — all in service of a city that mirrored a well-ordered soul. Modern readers wince. But the argument underneath is the still-live one: who should rule, and what makes them fit to? Democracy's defenders are still answering Plato.

Other dialogues stretch in different directions. *Symposium* on love. *Phaedo* on death and the soul. *Theaetetus* on knowledge. *Timaeus* on cosmology. There's no single "Plato's view" — there's Plato thinking out loud across forty-odd years, often via Socrates, increasingly via other characters. Reading him is less like absorbing a system and more like watching philosophy invent itself.`,

  aristotle: `Aristotle is what Plato's student looked like after he decided his teacher was wrong about almost everything fundamental. Where Plato reached for transcendent Forms, Aristotle stayed with things — what they are, how they change, what they're for. The result was the most systematic body of work in ancient philosophy, and the framework Europe would use for nearly two thousand years.

The teleological move is the key one. For Aristotle, things have purposes built into them. An acorn's *telos* is to become an oak. A knife's *telos* is to cut. A human's *telos* is to live well — to flourish (*eudaimonia*) by exercising the rational soul in line with virtue. This is the foundation of virtue ethics, the tradition revived in the twentieth century by Anscombe, MacIntyre, and Foot when they grew frustrated with utilitarian and Kantian frameworks.

The *Nicomachean Ethics* is the practical text — Aristotle on courage, friendship, justice, pleasure, the contemplative life. The *Politics* extends the ethics outward: humans are political animals, and the city exists for the sake of the good life, not merely survival. The *Metaphysics* asks what it means for anything to be at all. The biology, often dismissed, is meticulous — he dissected hundreds of species.

What's quietly radical about Aristotle is the methodological commitment: start from how things appear (the *phainomena*), respect ordinary judgment, then refine. He thought common-sense beliefs probably tracked something real, even if confusedly. That's the opposite of Plato's deep distrust of appearance — and it's why Aristotle still reads as the philosopher most amenable to science.`,

  nietzsche: `Nietzsche is more often quoted than understood. The aphoristic style, the rhetorical pyrotechnics, and the late breakdown all encourage selective reading — Christians treat him as the enemy, secularists as the prophet of disenchantment, fascists co-opted him in the 1930s through his sister's tampered edition. Reading him directly is a corrective.

The central diagnosis is the death of God — not as celebration but as catastrophe-in-waiting. *The Gay Science* (1882) introduces the madman who proclaims it. The point isn't atheism (Nietzsche assumed most educated Europeans were already there in practice); the point is that European morality had been borrowing Christian metaphysics for centuries without paying for it. With the bill due, two roads opened: nihilism, or a transvaluation of values.

*Thus Spoke Zarathustra* (1883-85) is the speculative answer — the Übermensch, eternal recurrence, the will to power. *Beyond Good and Evil* (1886) and *On the Genealogy of Morality* (1887) are the analytic sharpening: slave morality versus master morality, asceticism, ressentiment, the ascetic priest. The genealogy method — tracing the historical contingency of moral ideas we treat as eternal — is Nietzsche's enduring methodological gift to philosophy.

He's a writer first. The aphorisms aren't laziness; they're a form designed to ambush the reader's cherished assumptions one at a time. The result is exhilarating and dangerous in equal measure. Half the twentieth century — Heidegger, Foucault, Deleuze, Bataille — is Nietzsche metabolizing in different directions.`,

  kant: `Kant's *Critique of Pure Reason* (1781) is one of the hardest books in the canon, and the one that sets the agenda for almost everything after him. The project: figure out what reason can know, what it can't, and why. The answer rearranged the question.

Kant's move was to ask what conditions any knowledge requires. Time, space, causality — these aren't features of the world we discover, he argued; they're the structure our minds impose on experience to make experience possible at all. We can never know the *Ding an sich* (the thing-in-itself); we know phenomena, the world as it appears under our cognitive scaffolding. Empiricists like Hume had shown experience couldn't ground necessary truths; rationalists like Leibniz had spun systems untethered from experience. Kant's "Copernican revolution" was to say: both are right about half the puzzle.

The ethical philosophy is the other monument. The *Groundwork for the Metaphysics of Morals* (1785) gives us the categorical imperative — act only on a maxim you could will to become universal law; treat people as ends in themselves, never merely as means. This is duty-based ethics in its purest form, and the perennial alternative to utilitarianism. It also delivers an unflinchingly strict view: lying is always wrong, even to a murderer at your door. (Kant defended this; most contemporary Kantians don't.)

Kant lived his whole life in Königsberg, never travelled. Reading him is exacting — the prose is dense, the terminology technical, the system architectural. But the influence is total: Hegel, Schopenhauer, the entire analytic / continental split, Rawls, contemporary metaethics — all argue downstream of Kant.`,

  sartre: `Sartre took existentialism out of theology and into the streets. By the late 1940s he was a celebrity philosopher — café debates, political pamphlets, the lecture "Existentialism Is a Humanism" that he later half-disowned. The Nobel committee gave him the Prize in 1964; he refused it.

The big idea: existence precedes essence. There's no human nature waiting to be uncovered, no divine plan we're filling out. We exist first; then, through choices, we make ourselves into something. This sounds liberating until you notice the burden — you can't blame your essence for what you do, because you don't have one. The famous formulation: we are condemned to be free.

*Being and Nothingness* (1943) is the dense phenomenological treatise: consciousness as nothingness, the look of the Other, bad faith (the lie we tell ourselves to escape our freedom — the waiter who plays at being a waiter to avoid being a person who is choosing to wait tables). The later *Critique of Dialectical Reason* tries to reconcile existentialism with Marxism — Sartre's lifelong political commitment.

The novels and plays — *Nausea*, *No Exit*, *The Roads to Freedom* — carry the same philosophy in human-scale form. "Hell is other people" is a line from *No Exit*, not a complaint about strangers but a claim about how the gaze of others objectifies us. Simone de Beauvoir was his lifelong partner and intellectual equal; her *The Second Sex* (1949) extends and corrects existentialist phenomenology toward feminism.`,

  marx: `Marx is read more often as a political symbol than as the actual nineteenth-century German philosopher he was — which is a shame, because the philosophical work is sharper than the politics it inspired.

The early Marx is humanist and Hegelian. The 1844 *Economic and Philosophical Manuscripts* introduce alienation — the worker estranged from the product of their labour, from the act of working, from other people, from their own species-being. Capitalism, in this view, isn't merely unfair distribution; it's a mode of production that severs humans from what makes them human. This is the Marx Christian humanists and humanistic Marxists still find indispensable.

The later Marx is the one most people half-remember. *Capital* (1867) is a structural analysis of how capitalism works — surplus value, commodity fetishism, the tendency of the rate of profit to fall, the historical specificity of "free" wage labour. The *Communist Manifesto* (1848), co-written with Engels, is propaganda in the technical sense — a call to action with theoretical scaffolding. The *Grundrisse* (notebooks from 1857-58, not published until the twentieth century) is where Marx's thinking is rawest and arguably most interesting.

Whether the twentieth-century regimes that invoked his name had much to do with what he wrote is contested. Marx himself once said, of certain French disciples: "I am not a Marxist." Read him as a diagnostic of capitalism's internal dynamics, and he holds up remarkably well — economists from very different traditions still mine *Capital* for its analytical apparatus, even when they reject the prescriptions.`,

  confucius: `Confucius (Kongzi, 551-479 BCE) lived through the Spring and Autumn period — a time of political fragmentation in China, when the old Zhou order was visibly decaying. His response was relentlessly practical: focus on the cultivation of character, on the proper relationships between people, on ritual that gives form to the moral life.

The *Analects* (the *Lunyu*) is a collection of fragments — sayings, dialogues, anecdotes — compiled by disciples after his death. There's no Confucian *system* the way there's a Kantian one. There's a sensibility, repeated and refined: *ren* (benevolence, humanity), *li* (ritual propriety), *xiao* (filial respect), the *junzi* (the exemplary person, often translated "gentleman" but better thought of as someone who has *worked* on themselves). The goal isn't transcendence or salvation; it's becoming the kind of person who acts well, almost without noticing, because they've internalized the right dispositions.

The political dimension is inseparable. Confucius believed governance worked from the top down through moral example, not coercion — a ruler who is genuinely virtuous makes virtuous subjects more or less automatically. This sounds naive to modern ears; it's also the seed of a serious critique of pure procedural government. Without virtuous officials, the procedures break.

Later Confucianism splits in interesting directions. Mencius (Mengzi) argued human nature is fundamentally good; Xunzi argued it isn't, and needs ritual to discipline it. Neo-Confucianism (Zhu Xi, Wang Yangming) develops a more metaphysical edge. The tradition has shaped East Asian moral culture for 2,500 years — and is being seriously reread in the West as virtue ethics' renaissance overlaps with growing interest in non-Western frameworks.`,

  buddha: `The historical Siddhartha Gautama (probably c. 5th-4th century BCE, exact dates contested) is harder to recover than the legend. The legend is well-known: prince leaves the palace, sees suffering for the first time, renounces wealth, sits under the Bodhi tree, wakes up. What he claimed to have woken up *to* — that's the philosophical content, and it's more rigorous than the legend suggests.

The Four Noble Truths sit at the centre. Suffering (*dukkha*) is intrinsic to ordinary life. The cause is craving (*tanha*) — clinging to things that can't bear the weight of our clinging. The cessation of craving is possible. The Eightfold Path is how. This isn't a list of pieties; it's an analytic framework for diagnosing why life feels the way it does and what could be done about it.

The doctrine of *anatta* (no-self) is the radical part. Buddha argued that what we call "self" is a bundle of constantly shifting processes — bodily form, sensations, perceptions, mental formations, consciousness — with no underlying soul or essence holding them together. Modern philosophy of mind (Derek Parfit) and cognitive science have circled back to remarkably similar conclusions through entirely different routes.

The traditions diverge sharply after the early period. Theravada preserves what it takes to be the earliest teachings; Mahayana adds the *bodhisattva* ideal (delay your own liberation to help others) and the deep emptiness metaphysics of Nagarjuna; Vajrayana adds tantric methods; Zen strips back to the act of practice itself. They share the diagnostic core. Whether you treat the framework as religion, philosophy, or applied psychology is up to you — it functions in all three registers.`,

  hume: `David Hume is the Scot whose skepticism about reason quietly disassembled Enlightenment confidence — and whose prose is so good that you can almost miss what he's doing.

*A Treatise of Human Nature* (1739) was a young man's masterpiece that, as he put it, "fell deadborn from the press." The same arguments, repackaged as the *Enquiry Concerning Human Understanding* (1748) and the *Enquiry Concerning the Principles of Morals* (1751), made his reputation. The targets are large: causation, the self, induction, miracles, the foundations of morality.

The causation argument is the famous one. When you see one billiard ball hit another and the second move, you don't observe causation — you observe sequence and conjunction, and your mind adds the necessary connection by habit. Causal reasoning, in Hume's analysis, is not rational inference; it's psychological projection. Induction has the same problem: you can't justify the assumption that the future will resemble the past without circularly assuming what you're trying to prove. Kant said Hume woke him from his "dogmatic slumber" — meaning Kant felt the bite of these arguments and spent the rest of his career responding to them.

The ethics is sentimentalist: moral judgments are expressions of feeling, not deliverances of reason. "Reason is, and ought only to be, the slave of the passions." This sounds reductive until you read his actual moral psychology — Hume is subtle about how social emotions, sympathy, and reflective endorsement produce something stable enough to function as morality, without needing metaphysical grounding.

The *Dialogues Concerning Natural Religion*, published posthumously in 1779, is his demolition of the design argument for God's existence. Polite, devastating, structurally still the best version of the argument.`,

  descartes: `Descartes is the founder myth of modern philosophy — the man who allegedly cleared the deck of medieval scholasticism and started over from first principles. The story is too clean (medieval philosophy didn't actually go quietly), but the rhetorical move was real: take nothing on authority, doubt everything that admits of doubt, and see what remains.

The *Meditations on First Philosophy* (1641) walks you through it. Could you be dreaming? Possibly. Could a malicious demon be deceiving you about all your sensory experience? Possibly. But — and this is the move — could that demon deceive you about the fact that you are thinking? No: even doubt is a kind of thought. *Cogito, ergo sum*. I think, therefore I am. From this fixed point Descartes tries to rebuild the edifice: a non-deceiving God, the reliability of clear and distinct ideas, the external world.

The rebuild is less convincing than the destruction. The famous "Cartesian circle" — using clear and distinct ideas to prove God, then using God to validate clear and distinct ideas — has been debated for nearly four centuries. But the dualism that came out of it shaped everything: mind and body as two fundamentally different substances, interacting (somehow) at the pineal gland. The "mind-body problem" in contemporary philosophy of mind is in many ways the long shadow of Descartes' division.

He was also a working mathematician — Cartesian coordinates, optics, mechanics. The philosophy didn't sit apart from the science; it was supposed to give the new science its epistemological warrant. Reading the *Meditations* alongside the *Principles of Philosophy* and the *Discourse on the Method* gives you the full picture: a mind trying to give the new physics a foundation that scholastic Aristotelianism couldn't.`,

  spinoza: `Spinoza was excommunicated from Amsterdam's Jewish community at twenty-three for reasons the *cherem* doesn't specify — but his subsequent philosophy makes the likely offence obvious. The *Ethics* (published posthumously in 1677, geometrically ordered like Euclid) argues that God and Nature are the same thing: one substance, infinite, of which mind and matter are two attributes among infinitely many. There is no transcendent creator standing apart from creation. This is pantheism — or, depending on who's reading, naturalism with the word "God" used unconventionally.

The metaphysics has uncomfortable consequences. Free will, in Spinoza's view, is an illusion of perspective. Everything that happens follows necessarily from the nature of the one substance. Human beings are modes, finite expressions of infinite substance, and we are *not* the special exceptions we like to think we are. Acting morally, in this framework, isn't about deserving — it's about understanding. The more clearly we see why we feel and act as we do, the more we move from passive bondage to the active power of reason. The closing book of the *Ethics* — "Of Human Freedom" — is some of the strangest, most luminous philosophy ever written, ending with the intellectual love of God that he carefully redefines along the way.

The political philosophy is just as bold. The *Theological-Political Treatise* (1670) was anonymous and banned almost everywhere; it argues for freedom of thought, against scriptural authority over civic life, and for democracy on broadly naturalistic grounds. Hobbes was a clear influence; the conclusions diverge sharply.

He earned his living grinding optical lenses. He died at forty-four, probably of silicosis from glass dust. Hegel later said: "You are either a Spinozist or not a philosopher at all." Twentieth-century readers — Deleuze, Negri, the new naturalists — have made him fashionable again.`,

  // Socrates intentionally omitted — he's not in lib/philosophers.ts
  // (the corpus excludes him because he wrote nothing of his own).
  // If Socrates is ever added to PHILOSOPHERS, reinstate a bio here.

  augustine: `Augustine of Hippo (354-430 CE) is the bridge from antiquity to the medieval West. He wrote in late Roman North Africa as the empire visibly cracked: *The City of God* was prompted by the Visigothic sack of Rome in 410. His work shaped Christian theology, Western political thought, and the philosophical psychology of the inner life for over a thousand years.

The *Confessions* (c. 397-400) is the first real autobiography, and arguably still the best. Augustine traces his own life from infancy through his Manichean phase, his Neoplatonist phase, his sexual restlessness, his conversion in a Milan garden, and his subsequent work as bishop of Hippo. The book is addressed to God throughout — it's prayer and philosophy simultaneously. The famous bits — the stolen pears, "Lord, make me chaste, but not yet," the meditation on time in Book XI — are embedded in a continuous theological project.

*The City of God* (begun 413, finished 426) is the big political-theological work. Two cities run through history: the City of God (oriented toward divine love) and the City of Man (oriented toward self-love). Earthly empires belong to the latter; their rise and fall are not the providential story. This was a serious challenge to the Constantinian fusion of empire and church, and it gave medieval Christianity a way to think about politics that wasn't simply imperial cheerleading.

The philosophical anthropology is dark. Original sin, the deeply broken will, the inability to do good without grace — these are Augustinian innovations that Catholic, Lutheran, Calvinist, and Jansenist traditions would all draw on. The philosophy of time (the past exists in memory, the future in expectation, the present is a knife-edge) anticipated Husserl. The interior turn — taking introspection itself as the route to truth — anticipated Descartes by twelve centuries.`,

  'thomas-aquinas': `Thomas Aquinas (1225-1274) is the Dominican who set out to baptize Aristotle. The Greek's complete works had only recently re-entered the Latin West via Arabic translations and commentaries (Avicenna, Averroes), and the Church's initial response was suspicion — Aristotle looked like a threat to Christian doctrine. Aquinas argued the opposite: properly understood, Aristotle and Christian revelation are compatible, even complementary.

The *Summa Theologiae* (begun 1265, unfinished at his death) is the architectural achievement. The structure — question, objections, response (*sed contra*), Aquinas's own answer, replies to objections — feels almost like adversarial litigation, which is roughly the point. He never argues in a vacuum; every position is staked against the strongest opposing case he can construct. Few philosophers since have been as good at steelmanning their opponents before refuting them.

The *Five Ways* — five arguments for God's existence — are the most famous fragment. They're often presented as ironclad proofs; Aquinas presents them more cautiously, as paths reason can travel even without revelation. The argument from causation, the argument from contingency, the argument from design — these have been refined, attacked, and refined again across eight centuries.

The ethics is virtue-based and natural-law-based at once. Humans have a *telos* — flourishing through union with God — and the natural virtues (prudence, justice, fortitude, temperance) plus the theological virtues (faith, hope, love) get us there. Same Aristotelian framework, baptized. Modern natural-law theory (Finnis, Grisez, the New Natural Law school) is still working out the implications.

Late in life Aquinas had a mystical experience and said all his writing was "as straw" compared to what he'd seen. He stopped writing. Three months later he was dead.`,

  wittgenstein: `Wittgenstein wrote two short books that contradict each other, and both reshaped twentieth-century philosophy. He thought he had solved philosophy with the first one, walked away, came back a decade later, and spent the rest of his life dismantling it.

The *Tractatus Logico-Philosophicus* (1921) is seventy-five pages of numbered propositions. The world is everything that is the case. Facts are configurations of objects. Language pictures facts. Logic shows the structure of the world. Whatever can be said can be said clearly; about what we cannot speak, we must be silent. The closing move is the killer: the propositions of the book itself fail their own test — they're ladders to be climbed and then thrown away. The Vienna Circle adopted the book as a foundational text for logical positivism. Wittgenstein thought they'd badly misread it.

He spent the 1920s teaching schoolchildren in rural Austria, designed a house for his sister, then returned to Cambridge and gradually built the position of the *Philosophical Investigations* (published posthumously in 1953). Meaning isn't picture-mirror correspondence; meaning is use. Words function inside "language-games" — embedded practices with their own rules. The mistakes philosophers make are usually grammatical: a word ripped from its normal habitat starts looking like it names something deep and mysterious, when really it was always doing more pedestrian work.

The famous arguments — the private language argument, the rule-following considerations, "a picture held us captive" — are aimed at a tradition that takes itself as discovering eternal truths about Mind, Knowledge, Language, when (Wittgenstein thinks) it's mostly bewitched by its own grammar. The philosophical job is therapeutic: show the fly the way out of the fly-bottle.

He didn't quite invent ordinary-language philosophy, but he made it possible. Half of late-twentieth-century philosophy is in conversation with one Wittgenstein or the other.`,

  heidegger: `Heidegger's *Being and Time* (1927) is the long question: what does it even mean for anything to *be*? Western philosophy, from Plato onward, had taken being for granted while obsessing over particular beings. Heidegger's project was to wake up the question.

The method is phenomenology — describe the structures of experience as they actually present themselves — but Heidegger pushes it toward fundamental ontology. He starts not with a disinterested subject contemplating objects, but with *Dasein*: the being for whom being is a question. That's us. We don't first encounter the world as a collection of objects, then add meanings; we encounter it always already meaningful, organized by our concerns and projects. A hammer isn't first a lump of stuff plus the property "for hammering"; it's *zuhanden* — ready-to-hand, embedded in a workshop of involvements. Only when it breaks does it become *vorhanden* — present-at-hand, the bare thing we then theorize about.

The book's other monument is Heidegger's analysis of authenticity. Most of the time, we live as "das Man" — the They, the impersonal anyone — borrowing our opinions, tastes, even our anxieties from the public sphere. Authenticity is the rare move of facing our own being-toward-death and choosing our possibilities as our own. The framework runs through Sartre, the entire existentialist tradition, and a lot of twentieth-century theology.

Then there's the Nazi problem. Heidegger joined the Nazi party in 1933 as rector of Freiburg, gave speeches in line with the regime, and never explicitly recanted. The *Black Notebooks* (released starting 2014) contain unmistakable antisemitism. How much this contaminates the philosophy is a serious, ongoing debate — split roughly between those who think the work survives quarantining the man and those who think the philosophy itself contains the seeds of what he chose.

Later Heidegger (the *Letter on Humanism*, *The Question Concerning Technology*) shifts toward a more poetic, meditative idiom about language as "the house of Being." Influential on Derrida, Gadamer, much of continental philosophy.`,

  laozi: `Laozi (the "Old Master") is half historical figure, half legend. Tradition makes him a sixth-century BCE archivist at the Zhou court who, weary of the world, rode off west on a water buffalo and wrote down 5,000 characters at a frontier guard's request before disappearing. The 5,000 characters became the *Tao Te Ching* (the *Daodejing*) — one of the most translated books in human history, and the foundational text of philosophical Daoism.

The text is short, oblique, and resistant to systematic exposition. The opening line is famous: *the Tao that can be spoken is not the eternal Tao*. The book that follows then proceeds to speak about the Tao for eighty-one more chapters. The performative contradiction is the point — language is being used to point past itself, the way a finger points at the moon.

Three big moves shape the philosophy. First, the *Tao*: the way things naturally go, the underlying movement that you can align with but cannot grasp. Second, *wu wei*: often translated "non-action," but better understood as effortless action — moving with the grain of things rather than imposing your will against them. Third, the *uncarved block* (*pu*): the value of simplicity, what is before culture and naming starts dividing it up. A vessel is useful because it's empty; a wheel works because of the hole at its centre. The text keeps returning to the productive power of what isn't there.

The political content is sharp and quietist. Laozi distrusts heroes, sages, and big projects. The best rulers govern least; people scarcely know they exist. This isn't anarchism — it's the suspicion that the more you try to fix things, the more you generate the very problems you're trying to solve.

Pair with Zhuangzi (Chuang Tzu) for the more playful, story-rich expression of the same broad tradition. Together they form the philosophical core of Daoism, distinct from the later religious Daoism with its alchemy and immortality cults.`,

  rousseau: `Rousseau is the philosopher of the modern self in its tense, contradictory, self-suspicious form. The Geneva-born outsider who alternately scandalized and seduced Enlightenment Paris, he wrote political theory, educational philosophy, novels, an opera, and the first modern autobiography — and his ideas fed both democratic revolution and Romantic reaction.

*Discourse on the Origin of Inequality* (1755) is the diagnostic. Humans in the state of nature, Rousseau argues, were neither noble savages nor brutish wretches — they were simply self-sufficient, free from the comparative envy that drives modern misery. Inequality arose with property; civilization compounded it. The famous opening of *The Social Contract* (1762): "Man is born free, and everywhere he is in chains." The chains aren't an accident — they're produced by the social arrangements we mistake for civilization itself.

The *Social Contract* tries to imagine arrangements that wouldn't produce them. The *general will* — what the community wills for itself, distinct from the mere aggregation of private preferences — became one of the most contested concepts in political theory. Read benignly, it grounds modern democratic sovereignty. Read suspiciously (as Constant and Berlin did), it can justify forcing people to be free in the name of what they "really" want.

*Émile* (1762) is the educational treatise — a child raised away from society's corruptions, learning from direct experience rather than authority, allowed to develop their natural sensibilities before encountering moral and intellectual abstractions. The book got Rousseau exiled; the Sorbonne and the Geneva authorities both condemned it. It also shaped modern progressive education from Pestalozzi forward.

The *Confessions* (published posthumously 1782) is the first autobiography to insist on revealing everything — petty cruelties, sexual humiliations, the children he fathered and sent to a foundling home. The book invents a new form of subjectivity that runs straight through to contemporary memoir. Rousseau is the philosopher who insisted you couldn't separate the work from the man — and then made the man impossibly difficult to admire.`,

  hobbes: `Hobbes wrote *Leviathan* (1651) in the middle of the English Civil War, with friends dead and the country fractured. The book bears its context. The state of nature, for Hobbes, is what you get when the sovereign collapses: "war of all against all," life "solitary, poor, nasty, brutish, and short." Civil society is the contract — everyone gives up the right to self-help in exchange for the security a sovereign can provide.

The metaphysics underneath is austere. Hobbes is a strict materialist: minds are matter, sensations are motions in the body, will is just the last appetite before action. There are no Aristotelian final causes hiding in nature; there's just stuff moving according to mechanical laws. Morality isn't discovered; it's constructed, by agreement, to keep the war of all against all from resuming.

The political theory derives downward from these premises. People are roughly equal in their capacity to harm each other, and scarcity makes some conflict inevitable. The only stable solution is to authorize a single sovereign — monarch, assembly, whatever — with effectively absolute power. Resistance to that sovereign reopens the war that the contract existed to end. The argument is uncomfortable: many readers want the resistance Hobbes denies them. But the logical structure of the case is what makes him the founding text of modern political philosophy. Every subsequent contract theorist — Locke, Rousseau, Rawls — is responding to Hobbes.

He was anti-clerical in an era when that was dangerous. The book's last quarter is an extended attack on the Catholic Church and on the political ambitions of religious authorities of any stripe. He died at ninety-one, having outlived most of his enemies, after a long life of being denounced by clerics, royalists, parliamentarians, and Oxford dons in roughly equal measure.`,

  locke: `John Locke is the philosopher you get if you take Hobbes's contractarian framework and use it for radically different political conclusions. Where Hobbes saw the state of nature as war, Locke saw it as inconvenient — people mostly working things out, hampered by the lack of an impartial judge. The contract therefore creates a *limited* government, not an absolute one, and the people retain the right to revolt if the government breaks its trust.

The *Two Treatises of Government* (1689) — published anonymously, since Locke was politically exposed — is the founding text of liberal political theory. The first treatise demolishes the divine right of kings; the second builds the positive case for government by consent. Natural rights to life, liberty, and property are pre-political — government's job is to protect them, not grant them. When it fails, revolution is legitimate. The American founders read this carefully; the *Declaration of Independence* is recognizably Lockean.

The epistemology — *An Essay Concerning Human Understanding* (1690) — is the foundational text of British empiricism. The mind at birth is a *tabula rasa*; all knowledge comes from experience, either through sensation or reflection. There are no innate ideas. Primary qualities (size, shape, motion) really inhere in objects; secondary qualities (colour, taste, smell) are produced by the interaction of objects with our senses. This distinction shaped the next two centuries of philosophy of mind, even as Berkeley and Hume successively dismantled it.

The *Letter Concerning Toleration* (1689) is the religious-pluralism argument: the state cannot save souls, civil and religious authority should be separated, dissenting Protestants should be tolerated. (Catholics and atheists, in Locke's qualified version, get less generous treatment — historians of liberalism debate how much this matters.) The framework that came out of these books is the template for modern liberal democracy: limited government, property rights, religious toleration, popular sovereignty. The arguments Locke didn't quite finish — about Indigenous land, about slavery (in which he was complicit through the *Fundamental Constitutions of Carolina*) — are arguments his intellectual heirs are still working through.`,

  camus: `Camus was the Algerian-born French novelist-essayist who got tangled in the existentialist label, mostly rejected it, and then accidentally became its most readable proponent. He won the Nobel Prize in 1957 at forty-four — the second-youngest laureate — and died in a car crash three years later with an unused train ticket in his pocket.

*The Myth of Sisyphus* (1942) sets out his version of the absurd. The fundamental philosophical question, he opens, is suicide — whether life is worth living. The argument that follows isn't existentialist. No Sartrean radical freedom, no leap into authenticity. It's something else: the absurd is the gap between human need for meaning and the universe's silent refusal to supply any. Three responses are possible. Physical suicide, which Camus rules out. Philosophical suicide — Kierkegaard's leap of faith — also ruled out. Or lucid revolt. Sisyphus, pushing the rock forever, becomes the absurd hero: "one must imagine Sisyphus happy."

*The Stranger* (1942) is the novel that delivers the same point through Meursault — the Algerian clerk who shoots an Arab on a beach and is convicted as much for not crying at his mother's funeral as for the murder itself. The flat, affectless prose is the philosophical method. *The Plague* (1947) extends the framework to the moral terrain — what do you do, knowing the absurd, when actual suffering arrives at scale? The doctor Rieux's quiet, unheroic competence is Camus's positive ethics.

*The Rebel* (1951) is the political book, and the one that broke his friendship with Sartre. Camus argued that the revolutionary tradition — Hegel, Marx, the twentieth-century terror states — had betrayed itself by absolutizing the future and excusing present murder in its name. Authentic rebellion has limits; the murderous revolutionary is no longer rebelling but ruling. Sartre's circle treated this as a defection; Camus held the line.

The Algerian War tortured him to the end. As a *pied-noir* who loved Algeria deeply, he could neither side fully with French colonialism nor with the FLN's terrorism. His most-quoted line on this — "between justice and my mother, I choose my mother" — is more nuanced in context than the slogan suggests, but it was politically toxic. He died before the war ended, before independence, before the question could be properly resolved.`,

  schopenhauer: `Schopenhauer is the philosopher Nietzsche read in adolescence and never quite stopped responding to — even when he was eventually rejecting him. The *World as Will and Representation* (1819, expanded 1844) was largely ignored at publication; by the 1850s, when European confidence in progress was wavering, Schopenhauer became fashionable, and stayed influential for half a century.

The Kantian inheritance is the starting point. We don't access reality directly; we access representations — phenomena structured by the categories of our minds. Behind all appearances, Kant said, lies the thing-in-itself, which we cannot know. Schopenhauer's move was to say: actually, we can — partially. From the inside, each of us knows our own willing immediately, not as representation but as a kind of direct acquaintance with what we are. Generalize that, and the thing-in-itself behind all phenomena is *Will* — a blind, restless, purposeless striving that manifests in every level of nature, from gravity through plant growth through human desire.

The conclusion is grim. Will is suffering — it wants and wants and is never satisfied; satisfaction merely yields the next wanting. Pessimism is the philosophical default once you see this clearly. The escape routes Schopenhauer identifies are largely contemplative: aesthetic experience (which momentarily lifts us out of willing into pure contemplation), compassion (which recognizes the unity of Will across apparent separateness), and ascetic renunciation (the quieting of Will itself).

He was the first major Western philosopher to take Indian thought seriously — the *Upanishads* and Buddhist sources shape the metaphysics directly. The ethics is built around *Mitleid* (compassion), which Schopenhauer thinks is the only foundation morality can have once the Kantian rationalist program is abandoned.

His readers form an unlikely lineage: Nietzsche, Wagner (who set the *Ring* to Schopenhauerian themes), Mann, Borges, Wittgenstein (who carried a copy of *Parerga and Paralipomena* through WWI), Beckett. The essays in *Parerga* — short, mordant, often funny — are the best entry point if the metaphysical treatise feels forbidding.`,

  kierkegaard: `Kierkegaard wrote in nineteenth-century Copenhagen, in Danish, under a small forest of pseudonyms — Johannes Climacus, Anti-Climacus, Vigilius Haufniensis, Constantin Constantius — each given their own voice and position. He thought direct philosophical communication couldn't reach what he wanted to reach. You had to be tricked into noticing your own situation.

His enemy was Hegel — or more precisely, the System, the assumption that philosophy could absorb the individual into a totality that made sense of everything. Kierkegaard's answer was the existing individual, irreducibly particular, whose decisions cannot be settled by abstract reasoning. *Either/Or* (1843) stages the choice between the aesthetic life (immediate, sensuous, ultimately empty) and the ethical life (committed, responsible, oriented to duty). Later works push past the ethical to the religious — the highest stage in Kierkegaard's existence-scheme.

*Fear and Trembling* (1843), under the Johannes de Silentio pseudonym, is the book on Abraham. Asked by God to sacrifice Isaac, Abraham must suspend the ethical (do not murder your son) for the sake of the religious (obey God absolutely). The book is an extended meditation on what Abraham must have felt, and whether the leap of faith — irreducible to ethical reasoning — is anything we can recognize from the outside. Kierkegaard thinks it isn't; faith is essentially incommunicable, lived in fear and trembling, in absolute solitude before God.

*Concluding Unscientific Postscript* (1846) is the methodological masterpiece — the longest argument in his work for why subjectivity is truth, why objective uncertainty held fast in the passion of inwardness is what faith actually is. He died at forty-two, exhausted by his polemic against the established Danish church.

Twentieth-century existentialism — Sartre, Marcel, Jaspers, Tillich, the early Heidegger — all run through Kierkegaard. So does dialectical theology (Barth). The pseudonymous strategy makes him hard to quote responsibly; what *Kierkegaard* thinks and what *Anti-Climacus* says are not necessarily the same thing, and this is by design.`,
};

export function philosopherBio(slug: string): string | null {
  return PHILOSOPHER_BIOS[slug] ?? null;
}

export function philosopherHasBio(slug: string): boolean {
  return slug in PHILOSOPHER_BIOS;
}

/** All slugs with hand-written extended bios. Used by the index page
 *  to surface "Featured profiles" the user can read in long form. */
export function philosophersWithBios(): string[] {
  return Object.keys(PHILOSOPHER_BIOS);
}
