// Deeper content for each exercise — added later, kept as a separate
// dictionary so the original `EXERCISES` array (which already gets imported
// in many places) stays small. Keyed by slug.
//
// English-only for now, matching the policy for archetype detail pages and
// philosopher entries: structured labels translated, long-form essays in
// English until scholar-verified machine translation is run.

export type ExerciseExtras = {
  // Continues the `about` field — 2–3 more paragraphs of history, lineage,
  // and why this practice survived. Renders below the original `about`.
  longerAbout?: string;
  // Common ways people get this wrong. 2–4 short bullets.
  commonPitfalls?: string[];
  // A concrete worked example or scenario. One paragraph.
  workedExample?: string;
  // Thinkers historically associated with this practice. 3–5 entries.
  relatedThinkers?: { name: string; note: string }[];
  // Suggested books / essays / texts. 2–4 entries.
  furtherReading?: { title: string; author: string; year?: string; note: string }[];
  // Sibling exercises in this collection that pair well. Slugs from EXERCISES.
  relatedExercises?: string[];
  // Allied practices outside this collection — meditation, journaling forms,
  // anything kindred. Each is name + one-line description.
  kindredPractices?: { name: string; note: string }[];
};

export const EXERCISE_EXTRAS: Record<string, ExerciseExtras> = {
  // ─── Premortem ─────────────────────────────────────────────────────
  premortem: {
    longerAbout:
      "The technique was systematized by the cognitive psychologist Gary Klein in the early 2000s, but the underlying intuition is much older. Stoic premeditatio malorum — premeditation of evils — was the daily morning practice of imagining what could go wrong. The Stoics weren't catastrophizing; they were robbing the future of its sharpest edge. The premortem is a project-management cousin of that practice.\n\n" +
      "What changes when you do this is subtle. Most people, asked to predict project failure, give vague generalities. Asked to explain why a project DID fail (even hypothetically), they get specific fast — calendars, vendors, conversations not had. The frame change does the work. You are no longer defending optimism; you are reporting on a failure that already happened in your mind. Defenses drop.\n\n" +
      "Done in groups, the premortem also surfaces concerns that politeness usually buries. The most senior person in the room, when invited to imagine the failure, often names the very risk that the junior people had been too uncomfortable to raise.",
    commonPitfalls: [
      "Generic answers ('we lost focus', 'communication broke down'). Push for specifics — the exact email, the exact missed deadline.",
      "Treating the premortem as a checkbox. If you didn't change the plan, you didn't actually do the exercise.",
      "Doing it alone for a project that involves others. The point is the multiple perspectives — the team's blind spots are different from yours.",
    ],
    workedExample:
      "You're about to launch a small website. Premortem: it's six months later and the site quietly fizzled. The reasons you write down: nobody knew it existed, you only built features you cared about, the analytics were never set up so you couldn't tell what was working, and you stopped updating it after the first month because the workflow for posting was annoying. Three of those four are fixable in the first week. The fourth (no one knows) you treat as a serious enough risk to do something specific about — line up two early supporters before launch.",
    relatedThinkers: [
      { name: "Seneca", note: "Letters 91 and 99 are the classical sources for premeditatio malorum." },
      { name: "Marcus Aurelius", note: "Meditations II.1 — begin each day expecting friction." },
      { name: "Gary Klein", note: "Modern formalization in 'Performing a Project Premortem' (Harvard Business Review, 2007)." },
      { name: "Daniel Kahneman", note: "Thinking, Fast and Slow recommends the technique as a corrective to planning-fallacy optimism." },
    ],
    furtherReading: [
      { title: "Sources of Power", author: "Gary Klein", year: "1998", note: "Klein's foundational work on naturalistic decision-making, including the cognitive logic that became the premortem." },
      { title: "Letters from a Stoic", author: "Seneca", note: "Letter 91 is the key one for this practice." },
      { title: "Thinking, Fast and Slow", author: "Daniel Kahneman", year: "2011", note: "Chapter 23 on the planning fallacy is the empirical case for why premortems work." },
    ],
    relatedExercises: ['negative-visualization', 'anticipating-objections'],
    kindredPractices: [
      { name: "Pre-mortem letter to your future self", note: "A long-form variant — write a full letter from six-month-future-you describing the failure." },
      { name: "Red-teaming", note: "An institutional cousin — a designated team is tasked with attacking the plan." },
    ],
  },

  // ─── Negative visualization ────────────────────────────────────────
  'negative-visualization': {
    longerAbout:
      "Negative visualization sits awkwardly in modern life because it looks superficially like rumination, the cognitive habit therapy spends a lot of effort trying to break. The difference is real and worth naming. Rumination is involuntary, repeating, and locked onto something that's already gone wrong. Negative visualization is voluntary, brief, and chosen with a specific purpose — to see the present clearly by imagining its absence. After about a minute it ends, and the practitioner returns to the present. Rumination doesn't end.\n\n" +
      "Practiced consistently, it produces a slightly different baseline. Things you used to find irritating — a delayed train, a bad meal, a cold morning — show up against the background of their possible absence and don't quite land the same way. The Stoics' word for this was apatheia: not numbness, but freedom from being knocked around by passing conditions.\n\n" +
      "It's worth saying: this is a practice, not a one-time decision. The acclimation it pushes back against is constant. The Stoics knew this, which is why Marcus Aurelius reread the same exercises to himself every morning for years.",
    commonPitfalls: [
      "Going dark — letting the imagined loss tip into actual grief and staying there. Set a timer. One minute is enough.",
      "Doing it about something abstract ('what if I lost my freedom') rather than concrete ('what if my mother were not at the other end of the line tomorrow').",
      "Confusing it with gratitude journaling. Gratitude lists what's good; negative visualization sees what's good against the background of its possible absence. They're cousins, not the same.",
    ],
    workedExample:
      "It's evening. You spend one minute imagining your partner is no longer there. The room. The empty side of the bed. The conversation you'd want to have but can't. After a minute you stop. You go into the next room where they actually are, doing something boring, and you sit with them for ten minutes without your phone. The exercise is the unspectacular ten minutes that follow it.",
    relatedThinkers: [
      { name: "Epictetus", note: "Discourses III.24: 'When you kiss your child, say to yourself, perhaps tomorrow you will kiss a corpse.'" },
      { name: "Marcus Aurelius", note: "Meditations IX.30 — picture a thing about to be lost." },
      { name: "William Irvine", note: "A Guide to the Good Life rebuilds Stoic practice around this exercise specifically." },
    ],
    furtherReading: [
      { title: "A Guide to the Good Life", author: "William Irvine", year: "2008", note: "The clearest modern reconstruction; Irvine treats negative visualization as the central Stoic practice." },
      { title: "Meditations", author: "Marcus Aurelius", year: "c. 170 CE", note: "Books II and IX have the densest concentration of these exercises in their original form." },
    ],
    relatedExercises: ['memento-mori', 'examen', 'view-from-above'],
    kindredPractices: [
      { name: "Tibetan death meditation", note: "Buddhist parallels — visualizing one's own dying as preparation for a clearer life." },
      { name: "Tonglen", note: "A different Buddhist practice: take in suffering, give out relief — not the same shape, but in the same family." },
    ],
  },

  // ─── Socratic self-questioning ─────────────────────────────────────
  'socratic-self-questioning': {
    longerAbout:
      "Socrates' actual practice was conducted on others, in the agora, and was famously irritating. He'd corner a confident expert — a general, a statesman, a poet — and by asking simple questions reveal that the expert didn't quite know what they were claiming to know. The expert tended to leave angry. Plato's dialogues are essentially a record of this practice, refined into literary form.\n\n" +
      "Run on yourself, the practice is gentler but produces the same diagnostic. Most strong beliefs survive one or two 'whys'. By the third, you tend to find the foundation is something you absorbed from a parent, a teacher, a tribe, or a younger version of yourself — and never separately examined. This isn't a refutation. The foundation might be perfectly good. But knowing that's where it sits is different from imagining you reasoned your way to it.\n\n" +
      "The discipline is to actually answer each 'why' rather than re-state the previous answer in different words. Most failures of this exercise are restatements rather than reasons. If your fifth answer paraphrases your first, you went in a circle.",
    commonPitfalls: [
      "Restating instead of justifying. 'Because it's important' is not a reason for 'X is important.'",
      "Going meta too quickly ('it's just my values'). Stay concrete for at least three rounds before allowing values-talk.",
      "Picking a belief that's safely unimportant. Pick one that has actual stakes for you, or the exercise underdelivers.",
    ],
    workedExample:
      "Belief: I should respond to messages quickly. Why? Because being responsive is a sign of respect. Why does respect require speed? Because slow responses signal that the other person doesn't matter to me. Is that actually true? In context — sometimes. With a colleague waiting on something blocking, yes. With a friend asking how my weekend was, no. So the belief, examined, narrows: I should respond quickly to messages where my response is blocking someone else. Suddenly the unread number drops by half and so does the anxiety.",
    relatedThinkers: [
      { name: "Socrates", note: "The original — preserved in Plato's early dialogues (Apology, Crito, Euthyphro)." },
      { name: "Pierre Hadot", note: "Made the case that ancient philosophy was primarily exercises of this kind, not abstract theory." },
      { name: "Iris Murdoch", note: "Modern Platonist who treats moral attention as a related skill." },
    ],
    furtherReading: [
      { title: "Plato: Apology, Crito, Euthyphro", author: "Plato", year: "c. 399 BCE", note: "Three short dialogues — the Socratic method in its native form." },
      { title: "What Is Ancient Philosophy?", author: "Pierre Hadot", year: "1995", note: "The argument that the ancients practiced philosophy as a way of life, not as theory." },
    ],
    relatedExercises: ['steelmanning', 'reductio', 'counterexample-drill'],
    kindredPractices: [
      { name: "Five whys", note: "Toyota's industrial cousin — used for diagnosing manufacturing problems by repeated 'why' questions." },
    ],
  },

  // ─── View from above ──────────────────────────────────────────────
  'view-from-above': {
    longerAbout:
      "Marcus Aurelius returned to this exercise repeatedly throughout the Meditations. He'd imagine himself rising up, looking down at the small business of human life — the markets, the wars, the petty quarrels — and the imaginative move shrank his immediate concerns to their actual proportions. The Roman Empire, from far enough away, was a rough patch on a larger map.\n\n" +
      "The contemporary version that comes closest is the so-called overview effect that astronauts report. Many of them describe a permanent shift after seeing Earth from orbit: the borders disappear, the proportions are correct, the daily fights look small. You can't get to space, but the imaginative version of the same move is available any time, and it works on the same neural circuitry — at least according to the research that compared the practice to similar contemplative exercises.\n\n" +
      "Don't confuse this with dismissiveness. The view from above doesn't say your problem doesn't matter; it says it's the size it is, not the size it feels at eye level. After the exercise the problem is still there. You just have a more accurate sense of what it weighs.",
    commonPitfalls: [
      "Using it to dismiss real grief or injustice. The exercise is about right-sizing, not minimizing.",
      "Doing it in the abstract ('I'm just a speck'). The practice requires concrete imagery — your specific room, your specific street, your specific city, in specific physical detail.",
      "Skipping the return. The exercise has two halves — rising and coming back. Coming back is where the integration happens.",
    ],
    workedExample:
      "You're stewing about an email exchange. You sit, close your eyes, and walk through it: the office you're sitting in, the building, the city, the country. From above the country, the email exchange is a few electrons. You stay there a minute. When you come back, you don't reply to the email yet — you wait until tomorrow. The reply you write tomorrow is shorter, less defensive, and resolves the matter in one round.",
    relatedThinkers: [
      { name: "Marcus Aurelius", note: "Meditations VII.48 and IX.30 are the two clearest versions of the practice." },
      { name: "Pierre Hadot", note: "His essay 'The View from Above' is the modern study of the practice's history." },
      { name: "Frank White", note: "Coined 'overview effect' to describe what astronauts report — the structurally identical experience from space." },
    ],
    furtherReading: [
      { title: "The Inner Citadel", author: "Pierre Hadot", year: "1992", note: "The best book on Marcus Aurelius and the philosophical exercises of his Meditations." },
      { title: "The Overview Effect", author: "Frank White", year: "1987", note: "The original astronaut interviews — strange, moving documentation of a parallel practice." },
    ],
    relatedExercises: ['memento-mori', 'examen', 'negative-visualization'],
    kindredPractices: [
      { name: "Loving-kindness meditation", note: "Buddhist cousin — radiating attention outward in concentric circles." },
      { name: "Cosmic perspective grounding", note: "Sometimes used in CBT as a defusion technique." },
    ],
  },

  // ─── Examen ───────────────────────────────────────────────────────
  examen: {
    longerAbout:
      "Ignatius of Loyola wrote the Spiritual Exercises in the 1520s for Jesuit novices, but the daily Examen was the practice he most insisted should outlive their training. He recommended it twice a day, around midday and at bedtime, fifteen minutes each time. The structure was deliberately simple — gratitude, awareness, response, sorrow, hope — because it had to be done by tired people without much equipment.\n\n" +
      "What survives in the practice when you strip out the theology is a structured noticing. Most days dissolve into impressions; the Examen catches them before they leave. People who do it consistently for a few weeks tend to notice they've been over- or under-investing in something they hadn't seen — a relationship that's been running on goodwill they never restocked, a worry they kept bringing up that they could have actually addressed.\n\n" +
      "It pairs naturally with morning intentions. Examens at night reveal what tomorrow's morning intention should be. After a month or two, the loop produces a different texture of day — you're a little less swept along, a little more present to what's actually happening.",
    commonPitfalls: [
      "Turning step 4 (where you fell short) into self-flagellation. Notice; don't berate. The point is awareness, not performance.",
      "Skipping gratitude because you're tired. Gratitude is the load-bearing step — without it the rest curdles.",
      "Doing it in your head instead of writing. Holding the structure in memory while you walk through the day is harder than it sounds; a notebook helps for the first month at least.",
    ],
    workedExample:
      "Eight thirty p.m., kitchen table, ten minutes. Gratitude: warm shower, good bread, the friend who called unprompted. Review: the morning was good, mid-afternoon dipped — you were curt with someone who didn't deserve it. Awareness: the curtness was downstream of skipping lunch and arriving at the meeting hungry. Response: tomorrow, eat lunch. That's it. The Examen is the boring sequence of small adjustments that accumulate into a life less driven by avoidable friction.",
    relatedThinkers: [
      { name: "Ignatius of Loyola", note: "Spiritual Exercises (1548) — the Examen is part of the broader month-long retreat program." },
      { name: "Karl Rahner", note: "20th-century Jesuit who reframed the Examen for modern consciousness." },
      { name: "James Martin", note: "Contemporary Jesuit whose 'The Jesuit Guide to (Almost) Everything' has the cleanest plain-English account." },
    ],
    furtherReading: [
      { title: "The Jesuit Guide to (Almost) Everything", author: "James Martin", year: "2010", note: "The Examen explained for non-religious readers without losing its substance." },
      { title: "Spiritual Exercises", author: "Ignatius of Loyola", year: "1548", note: "The original. Dense, theological, but the Examen is in part 1 if you want to read just that." },
    ],
    relatedExercises: ['view-from-above', 'memento-mori', 'negative-visualization'],
    kindredPractices: [
      { name: "Morning pages", note: "Julia Cameron's longer-form journaling cousin — fewer rules, similar daily-noticing function." },
      { name: "Naikan", note: "Japanese Buddhist practice with an interestingly inverted structure — what did I receive, what did I give, what trouble did I cause." },
    ],
  },

  // ─── Memento mori ──────────────────────────────────────────────────
  'memento-mori': {
    longerAbout:
      "The phrase translates as 'remember you must die', and almost every contemplative tradition has some version of the practice. Roman generals were said to have a slave whisper memento mori during triumphs. Trappist monks greeted each other with 'Brother, we shall die'. Buddhist monks meditated in charnel grounds. Renaissance painters smuggled skulls into otherwise serene portraits. The persistence of the practice across cultures is itself a kind of evidence.\n\n" +
      "What it does is straightforward: reduces the gap between what you say you care about and what you spend hours on. People who genuinely sit with their mortality, even briefly, tend to spend less of the next week on email. The effect doesn't last forever — acclimation is brutal — which is why the practice is recurring rather than one-time.\n\n" +
      "There's a misunderstanding worth heading off: this is not a practice about feeling bad. The Stoics, Buddhists, and contemplatives who developed it were generally cheerful people. The clarity that comes from facing mortality squarely is, in their experience, a relief. The exhausting thing isn't the death; it's the constant low-grade evasion of it.",
    commonPitfalls: [
      "Turning it into self-improvement theater. 'I will live each day to the fullest!' is a worse outcome than just doing the exercise.",
      "Doing it once and assuming you've got it. Acclimation will erase the effect within days unless the practice recurs.",
      "Skipping it during good times. The exercise works by adjusting your relationship to time, which is most useful when you're not in crisis.",
    ],
    workedExample:
      "Five minutes, late evening. You picture, without ornament, your last day. Who do you want near. What do you want to be doing. What you'd want to have said. After five minutes you open your eyes. Tomorrow you make a small change — you call your sister, who'd been on the list, instead of pushing it back. The point isn't grand reorganization; it's the small alignment.",
    relatedThinkers: [
      { name: "Marcus Aurelius", note: "Meditations II.11 and IV.17 are about choosing well in light of mortality." },
      { name: "Seneca", note: "On the Shortness of Life is the great Stoic essay on time and finitude." },
      { name: "Heidegger", note: "Being and Time argues that authentic life requires Being-toward-death — a 20th-century reformulation of the same intuition." },
      { name: "Atul Gawande", note: "Being Mortal brings the practice into contemporary medical context." },
    ],
    furtherReading: [
      { title: "On the Shortness of Life", author: "Seneca", year: "c. 49 CE", note: "Forty pages on time, mortality, and how we waste our hours. Indispensable." },
      { title: "Being Mortal", author: "Atul Gawande", year: "2014", note: "What modern medicine has gotten wrong about the end of life — and the kind of memento-mori medicine ought to teach." },
      { title: "Four Thousand Weeks", author: "Oliver Burkeman", year: "2021", note: "Modern productivity-cult critique built around the finitude of a life." },
    ],
    relatedExercises: ['negative-visualization', 'view-from-above', 'examen'],
    kindredPractices: [
      { name: "Death meditation (maranasati)", note: "Buddhist practice; the Theravada tradition has detailed instructions on contemplating the body's decomposition." },
      { name: "Letter to mourners", note: "Write what you'd want said about you when you're not there. Read it once a year." },
    ],
  },

  // ─── Fallacy hunt ──────────────────────────────────────────────────
  'fallacy-hunt': {
    longerAbout:
      "The taxonomy of fallacies goes back to Aristotle's Sophistical Refutations and has been added to ever since. Schopenhauer's Art of Being Right (1831) is a darkly amusing catalog of dishonest argumentative moves. Modern critical-thinking texts give standardized lists with names: ad hominem, straw man, false dilemma, motte-and-bailey, special pleading, and dozens more.\n\n" +
      "The names matter less than the skill. What you're training is the ability to feel a wrong move before you can name it. Fluent speakers of any language have the same skill for grammar — they can tell when something is off without articulating the rule. Argument has the same texture once you've practiced enough.\n\n" +
      "The harder half of the exercise — finding fallacies in things you agree with — is where most of the real growth happens. Anyone can be hard on the other side. The discipline is to apply the same standards to your own. Doing this regularly produces a particular kind of intellectual integrity: you stop losing arguments because you've already stress-tested your side privately.",
    commonPitfalls: [
      "Naming the fallacy without explaining why the move is bad. The label isn't the analysis.",
      "Using fallacy-hunting as a debating weapon ('that's a strawman!') instead of as a tool for understanding.",
      "Applying the discipline only to opponents. The harder skill is on yourself.",
    ],
    workedExample:
      "An op-ed argues that a new policy is bad because most experts who support it are funded by industry. You read it twice. The argument has confused 'has industry funding' with 'is wrong' — a genetic fallacy. You then pick an op-ed on your own side. It argues the same policy is good because 'everyone reasonable agrees'. That's an appeal to consensus dressed as an appeal to reason. You've learned more about how people argue from the second analysis than from the first.",
    relatedThinkers: [
      { name: "Aristotle", note: "Sophistical Refutations is the founding catalog of fallacious moves." },
      { name: "Arthur Schopenhauer", note: "The Art of Being Right is grimly funny — the dishonest moves systematized." },
      { name: "Carl Sagan", note: "The Demon-Haunted World's 'baloney detection kit' is the modern lay-reader's version." },
      { name: "Bo Bennett", note: "Compiled the most extensive contemporary online catalog (logicallyfallacious.com)." },
    ],
    furtherReading: [
      { title: "The Demon-Haunted World", author: "Carl Sagan", year: "1995", note: "Chapter 12 has the baloney detection kit — accessible, charming, lasting." },
      { title: "Asking the Right Questions", author: "Browne & Keeley", note: "A standard critical-thinking textbook — drier than Sagan but more thorough." },
    ],
    relatedExercises: ['steelmanning', 'counterexample-drill', 'argument-map'],
    kindredPractices: [
      { name: "Daily news-reading with margin notes", note: "Mark every appeal-to-fear, false dichotomy, and unsupported claim. Two weeks of this changes how you read." },
    ],
  },

  // ─── Steelmanning ──────────────────────────────────────────────────
  steelmanning: {
    longerAbout:
      "The principle of charity in philosophy is older than the term steelman: when interpreting an opponent, take their argument in its strongest form, not its weakest. Daniel Dennett's modern statement of it — in Intuition Pumps and Other Tools for Thinking — is that you should be able to express an opposing view so well that the opposite party says 'thanks, I wish I'd thought of that'.\n\n" +
      "This is the closest thing intellectual life has to a fitness test. If you can't write a steelman of your opponent's view that they would recognize as fair, you don't actually understand their position; you've been arguing against a phantom of your own making. Most political and religious arguments are conducted between people in this state, on both sides.\n\n" +
      "The cost of the practice is real. If you genuinely write a strong version of a view you reject, you sometimes find yourself less sure of your own. This is uncomfortable but valuable. The alternative — going through life confident that everyone who disagrees with you is stupid or evil — is much worse, even if it feels better.",
    commonPitfalls: [
      "Writing a steelman that's really still a strawman ('the strongest version is still ridiculous because...'). If the holder of the view wouldn't recognize themselves in your account, you haven't done the exercise.",
      "Picking a position that's actually toothless. Steelman a view you find genuinely irritating, not one you're indifferent to.",
      "Refusing to include the strongest argument because it would weaken your side. That's the whole point.",
    ],
    workedExample:
      "You strongly believe the work-from-home revolution is a clear good. Steelman the opposite: the case for in-office work. You write 250 words about how mentorship of junior employees happens by osmosis in shared spaces, how culture is hard to maintain over Slack, how home isolation correlates with measurable mental-health declines, how some kinds of cross-team collaboration require physical proximity. You find, when you read it back, that you'd revise your previous claim from 'clear good' to 'good with significant tradeoffs the field hasn't fully reckoned with.' That revision is the exercise working.",
    relatedThinkers: [
      { name: "Daniel Dennett", note: "Intuition Pumps codifies steelmanning as a tool, attributing the underlying logic to Anatol Rapoport." },
      { name: "Anatol Rapoport", note: "Game theorist whose rules for productive disagreement underlie the practice." },
      { name: "John Stuart Mill", note: "On Liberty Ch. 2 makes the case that holding a view without engaging its best opponent leaves the view itself shallow." },
    ],
    furtherReading: [
      { title: "Intuition Pumps and Other Tools for Thinking", author: "Daniel Dennett", year: "2013", note: "The contemporary toolkit; steelmanning sits alongside other moves of the same family." },
      { title: "On Liberty", author: "John Stuart Mill", year: "1859", note: "Chapter 2 is the classical defense of why we need to take opponents seriously." },
    ],
    relatedExercises: ['switch-sides', 'anticipating-objections', 'fallacy-hunt'],
    kindredPractices: [
      { name: "Ideological Turing test", note: "Bryan Caplan's variant — write the opposing view convincingly enough to be mistaken for an actual believer." },
    ],
  },

  // ─── Counterexample drill ──────────────────────────────────────────
  'counterexample-drill': {
    longerAbout:
      "Counterexample is the workhorse move of analytic ethics. A philosopher proposes a moral principle — say, 'an act is right if it maximizes overall welfare' — and another philosopher poses a single, sharp case where the principle gives the wrong answer. The principle either gets revised, abandoned, or its proponent has to bite the bullet and accept the strange consequence.\n\n" +
      "What survives this kind of scrutiny is rarely the original principle. Most rules turn out to need exceptions, and the exceptions in turn need their own justification. This isn't a defect; it's how moral thinking gets refined. The pleasant illusion that we have a clean rule that works in all cases dissolves, and what replaces it is messier but more honest.\n\n" +
      "The drill is also useful on yourself, on rules you actually live by. 'I'm always honest with people I love' is a noble-sounding rule. Under counterexample pressure — what if telling the truth would clearly cause more harm than the lie — it usually narrows to something more specific that you can actually defend.",
    commonPitfalls: [
      "Choosing the easiest cases. If your counterexamples don't bite, you're not really stress-testing the rule.",
      "Reflexively rewriting the rule for every counterexample. Some rules are worth biting the bullet on; others should be revised; the discrimination is the skill.",
      "Stopping after one round. Most interesting moral structure shows up at three or four rounds of attack-and-revise.",
    ],
    workedExample:
      "Rule: never lie. Counterexample: a friend asks if you like their new haircut, and you don't. You have three options. (1) Bite the bullet — tell the truth. (2) Revise the rule — 'don't lie about things that significantly affect the other person's interests' (the haircut doesn't). (3) Reject the rule entirely. Most people end up at (2), and now they have a more useful rule than the one they started with.",
    relatedThinkers: [
      { name: "Philippa Foot", note: "Originator of the trolley problem — counterexample as ethical instrument, weaponized." },
      { name: "Judith Jarvis Thomson", note: "'Killing, Letting Die, and the Trolley Problem' (1976) is the modern fountainhead." },
      { name: "Edmund Gettier", note: "His 1963 three-page paper on knowledge is the most famous single counterexample in philosophy." },
    ],
    furtherReading: [
      { title: "The Right and the Good", author: "W.D. Ross", year: "1930", note: "An entire ethical system designed to survive the counterexamples of utilitarianism and Kantianism." },
      { title: "Justice: What's the Right Thing to Do?", author: "Michael Sandel", year: "2009", note: "An accessible book-length tour through ethical principles via counterexamples." },
    ],
    relatedExercises: ['reductio', 'fallacy-hunt', 'socratic-self-questioning'],
    kindredPractices: [
      { name: "Trolley problem rounds", note: "Run a chain of trolley variants on yourself. Notice where your intuitions flip and try to articulate why." },
    ],
  },

  // ─── Argument map ──────────────────────────────────────────────────
  'argument-map': {
    longerAbout:
      "Argument mapping has a long pedagogical history — Beardsley codified it in the 1950s, and software like Rationale and Argunet have made it easier to do digitally. But pen and paper still works. The point is to make explicit what prose hides: which premises actually support the conclusion, which are decoration, and where the argument has its load-bearing wall.\n\n" +
      "Once you can map other people's arguments cleanly, you start writing your own with the map in mind. The discipline produces tighter prose: every sentence does work, the support structure is visible, and you stop hiding weak premises in long subordinate clauses.\n\n" +
      "The most surprising thing the practice teaches is how often the load-bearing premise of a famous argument is something the author barely mentioned. They spent the bulk of the essay defending easier ground while the real work was being done by an assumption snuck in early.",
    commonPitfalls: [
      "Mapping the argument the author meant to make rather than the one they actually made. Be a fair stenographer.",
      "Treating every sentence as a node. Most prose has a lot of connective tissue; a good map has fewer nodes than the original had sentences.",
      "Not naming the inference type — if a premise supports a conclusion, what kind of support is it? (Inductive? Deductive? By analogy?) The mapping is sharper when you label.",
    ],
    workedExample:
      "An op-ed argues for a policy change. You map it: conclusion at the bottom, three premises above. Premise 1 has substantial textual support and is well-defended. Premise 2 is asserted twice and never argued. Premise 3 cites three studies. You read the studies. They don't quite say what the author claims. The argument's load-bearing wall turned out to be Premise 3, and Premise 3 is weaker than the author let on. The map made the structural weakness visible.",
    relatedThinkers: [
      { name: "Stephen Toulmin", note: "His model of argument — claim, data, warrant, backing — is the most influential modern framework." },
      { name: "Monroe Beardsley", note: "His 1950 textbook Practical Logic gave argument mapping a popular form." },
      { name: "Tim van Gelder", note: "Modern proponent; built tools and ran studies on how mapping changes reasoning." },
    ],
    furtherReading: [
      { title: "The Uses of Argument", author: "Stephen Toulmin", year: "1958", note: "The Toulmin model — slightly dry but foundational." },
      { title: "Critical Thinking: An Introduction", author: "Alec Fisher", note: "Modern textbook with extensive mapping exercises." },
    ],
    relatedExercises: ['fallacy-hunt', 'reductio', 'translation-under-constraint'],
    kindredPractices: [
      { name: "Mind mapping", note: "A non-argumentative cousin — useful for ideation but doesn't enforce inferential structure." },
    ],
  },

  // ─── Reductio ──────────────────────────────────────────────────────
  reductio: {
    longerAbout:
      "Reductio ad absurdum has been the philosopher's pry bar since the Greeks. Zeno used it to argue that motion is impossible (his arrow paradox is essentially a reductio applied to the standard view of time). Plato used it constantly in the dialogues. Modern mathematicians use it for proofs by contradiction, which is the same move in formal dress.\n\n" +
      "The technique works because it doesn't require you to attack a position frontally. You take the position more seriously than its proponent did and follow where it leads. If it leads somewhere clearly unacceptable, the position has a problem — even if the proponent can't see it from their starting point.\n\n" +
      "The skill is in the chain. Sloppy reductios skip steps and fall to the obvious objection that you smuggled in a hidden premise. A good reductio walks each step, names what's being assumed, and arrives at the absurdity by means the position's proponent would have to accept.",
    commonPitfalls: [
      "Smuggling in your own premise mid-chain. If the absurdity required an extra assumption the position didn't make, you haven't actually refuted it.",
      "Calling a consequence 'absurd' that the position's holder would just accept. Some bullets get bitten; you have to argue why this one shouldn't be.",
      "Stopping at the first step. Most positions have an exit at step one or two; the interesting absurdities are usually three or four steps in.",
    ],
    workedExample:
      "Position: human actions that don't directly harm others should never be regulated. Run it. Then helmet laws are unjustified, even though the cost of brain injuries falls on shared healthcare. So the harm isn't 'direct' but is real. You can either bite the bullet ('yes, repeal helmet laws') or revise the rule ('actions whose direct OR clearly attributable indirect harms fall on others should be regulable'). The revision is more defensible — and now the rule covers helmet laws but not, say, what you wear in private. The reductio sharpened the position rather than killing it.",
    relatedThinkers: [
      { name: "Zeno of Elea", note: "The arrow and Achilles paradoxes are reductios on the standard understanding of motion." },
      { name: "Plato", note: "Used reductio extensively in the dialogues, especially the Parmenides." },
      { name: "Bertrand Russell", note: "Russell's paradox is a reductio that broke naive set theory." },
    ],
    furtherReading: [
      { title: "Paradoxes from A to Z", author: "Michael Clark", year: "2002", note: "An accessible catalog of philosophical paradoxes — many of which are reductios on common-sense positions." },
      { title: "Russell's autobiography", author: "Bertrand Russell", note: "Russell's account of what it felt like to discover the paradox that broke Frege's life work — applied reductio at its most consequential." },
    ],
    relatedExercises: ['counterexample-drill', 'socratic-self-questioning', 'fallacy-hunt'],
    kindredPractices: [
      { name: "Proof by contradiction", note: "The mathematical formalization — assume the opposite, derive a contradiction, conclude the original." },
    ],
  },

  // ─── Sixty-second case ─────────────────────────────────────────────
  'sixty-second-case': {
    longerAbout:
      "Compression is one of the great tests of understanding. If you can give a five-minute version but not a one-minute version, you may not yet know which parts are load-bearing. Most people, asked to defend a position, fill the available time — and the available time hides which parts they couldn't have done without.\n\n" +
      "The discipline of cutting to 60 seconds is uncomfortable. Things you wanted to say (the elegant qualification, the witty aside, the obscure reference) have to go. What's left is usually the actual argument: a premise, a piece of evidence, a conclusion, and the link between them. If you've been carrying a position for a while without ever articulating it this tightly, you may discover that your support for it was thinner than you thought.\n\n" +
      "Done with friends who'll push back, the exercise sharpens further. They'll ask 'what about X?' and you'll discover whether X is genuinely answered by your 60-second case or whether you'd been counting on the longer version to absorb the objection.",
    commonPitfalls: [
      "Speeding up rather than cutting. Talking faster doesn't compress; it just fits more vagueness in.",
      "Dropping the example — examples are usually load-bearing, not decoration.",
      "Hiding a hedge in the conclusion ('and that's why I think it's probably the case in some senses that...'). If your 60-second version ends in a hedge, your position is hedgier than you thought.",
    ],
    workedExample:
      "Position: kids should learn to code. Five-minute version sprawls into history of programming, school reform, the future of work. Two-minute version cuts the history. 60-second version: 'Coding is the literacy of the next century — not because all kids will be programmers, but because being able to instruct a machine to do something is becoming as basic as being able to write a memo. Schools that teach it produce kids who think more clearly about cause and effect. The earlier you start, the easier it is.' Read aloud, that's almost exactly 60 seconds. It also reveals that the position rests on an empirical claim — 'kids who code think more clearly' — that you should probably go check.",
    relatedThinkers: [
      { name: "Cicero", note: "On Invention is the classical text on argumentative compression." },
      { name: "George Orwell", note: "'Politics and the English Language' is the modern manifesto for cutting flab." },
      { name: "William Strunk Jr.", note: "Strunk and White's 'omit needless words' — the same instinct, in the prose register." },
    ],
    furtherReading: [
      { title: "On Writing Well", author: "William Zinsser", year: "1976", note: "About prose, but the underlying discipline of compression carries directly to argument." },
      { title: "Politics and the English Language", author: "George Orwell", year: "1946", note: "The essay, not a book — read in twenty minutes, useful for life." },
    ],
    relatedExercises: ['translation-under-constraint', 'argument-map', 'anticipating-objections'],
    kindredPractices: [
      { name: "Elevator pitch", note: "The startup-world cousin — same compression skill, different content." },
    ],
  },

  // ─── Anticipating objections ───────────────────────────────────────
  'anticipating-objections': {
    longerAbout:
      "Aquinas built the entire Summa Theologiae around objections. Each section starts not with his position but with the strongest cases against it (the videtur quod sections — 'it would seem that...'), and only then offers his sed contra ('on the contrary') and his own argument. The architecture is itself a moral commitment: you don't get to defend your view without first taking seriously the people who disagree.\n\n" +
      "The medieval schools that developed this style trained students to argue both sides of every question before being allowed to take a position. The result was a generation of thinkers who couldn't be embarrassed by an objection because they'd already considered it.\n\n" +
      "Modern academic writing has retained a thinned version of this — 'in this paper I will respond to objections raised by...' — but the sharper practice is to write the objections as if you were their author, in your own voice, before responding. If you're going to lose anyway, lose to the strongest version of what's on the other side.",
    commonPitfalls: [
      "Writing token objections you can dispatch easily. Three weak objections do less work than one strong one.",
      "Burying the response in qualifications. If part of the objection lands, concede it. The remaining defense is more credible.",
      "Skipping the imaginative step of who'd press the objection. 'Some might argue...' is too vague; pick a specific person or type of person.",
    ],
    workedExample:
      "Claim: remote work is broadly good. Objection 1 (from a sceptical manager): 'You can't build culture over Zoom; junior people stop learning by osmosis.' Response: partly right — synchronous in-person time matters, but the answer is hybrid, not all-in-office. Objection 2 (from a junior employee): 'I'm lonely.' Response: this is the real cost of the policy; companies should fund coworking, social meetups, in-person retreats. Objection 3 (from a city planner): 'Empty downtowns hurt businesses that depend on office workers.' Response: true, and a real cost — the policy needs city-level adjustments, not just employer-level ones. The original claim survives but is now nuanced into something that addresses real concerns rather than dismissing them.",
    relatedThinkers: [
      { name: "Thomas Aquinas", note: "The Summa Theologiae's structure is the canonical exemplar of objection-first writing." },
      { name: "Peter Abelard", note: "Sic et Non (Yes and No) collected contradictory authoritative quotations to train students in dialectical thinking." },
      { name: "John Stuart Mill", note: "On Liberty Ch. 2 is one long argument that you don't actually understand your view until you can rebut its strongest opponent." },
    ],
    furtherReading: [
      { title: "Selections from the Summa Theologiae", author: "Thomas Aquinas", note: "Read a few articles in the videtur-sed contra-respondeo structure to feel how the medieval objection-first method worked." },
      { title: "On Liberty", author: "John Stuart Mill", year: "1859", note: "Mill's argument that opposing views are necessary even for the truth-holder is the modern defense of the practice." },
    ],
    relatedExercises: ['steelmanning', 'switch-sides', 'sixty-second-case'],
    kindredPractices: [
      { name: "Devil's advocate", note: "An institutional cousin — formally assigning someone to argue the opposing view in deliberation." },
    ],
  },

  // ─── Translation under constraint ──────────────────────────────────
  'translation-under-constraint': {
    longerAbout:
      "Richard Feynman's reputation as an explainer rested largely on this practice: he could re-explain a complicated physical concept in simpler and simpler terms until it survived in vocabulary a smart twelve-year-old could follow. The discipline isn't about dumbing down. It's about discovering whether you understand the concept or have just memorized the vocabulary.\n\n" +
      "The version of this exercise where you translate for an adversary is harder and more useful. An adversary will press exactly the parts of your argument you'd hoped no one would press. Translating with that audience in mind forces you to reinforce the load-bearing parts and lose the flourishes that wouldn't survive contact with someone hostile.\n\n" +
      "What happens over time, with practice, is that you start writing the original drafts in already-translated language. Jargon thins out. Hedges stop hiding confusion. The vocabulary that remains is doing actual work, because anything that wasn't doing work has been quietly cut over years of cross-audience translation.",
    commonPitfalls: [
      "Confusing the 12-year-old version with a child-talk version. The audience is intelligent and curious — you're cutting jargon, not concepts.",
      "Skipping the adversary version because it's uncomfortable. That's the version most people need most.",
      "Treating the original as the 'real' version and the translations as concessions. The translations often reveal the original was bloated.",
    ],
    workedExample:
      "Concept: 'cognitive dissonance.' Original: 'a state of psychological discomfort arising from the inconsistency of cognitions.' For a 12-year-old: 'when two things you believe don't fit together and it makes you uncomfortable.' For a sceptic: 'the discomfort of believing two contradictory things at once — the experimental evidence for it is in Festinger's 1957 work, though the effect sizes have been challenged in recent replications.' For an adversary: 'a label psychologists give to a feeling that may be real but that's been used to explain so many different behaviors that the term is doing less work than it appears to.' The fourth version is, weirdly, the truest of all four.",
    relatedThinkers: [
      { name: "Richard Feynman", note: "His undergraduate physics lectures are the modern monument to this discipline." },
      { name: "George Orwell", note: "'Politics and the English Language' is the ethical version — clear prose as a moral act." },
      { name: "Mortimer Adler", note: "'How to Read a Book' includes a parallel exercise on the receiving end: explaining a book back to demonstrate you read it." },
    ],
    furtherReading: [
      { title: "Surely You're Joking, Mr. Feynman!", author: "Richard Feynman", year: "1985", note: "The popular memoir; doesn't teach the technique directly, but the spirit is everywhere." },
      { title: "Politics and the English Language", author: "George Orwell", year: "1946", note: "Six rules for clear writing that double as rules for clear thinking." },
    ],
    relatedExercises: ['sixty-second-case', 'argument-map', 'steelmanning'],
    kindredPractices: [
      { name: "ELI5 (Explain Like I'm Five)", note: "The Reddit subgenre — same discipline, more casual." },
      { name: "Teaching back", note: "A pedagogical cousin — students explain a concept to peers as a check on their own understanding." },
    ],
  },

  // ─── Dialectical loop ──────────────────────────────────────────────
  'dialectical-loop': {
    longerAbout:
      "Hegel's actual writing on the dialectic is famously hard, and the textbook 'thesis-antithesis-synthesis' shorthand is closer to a later simplification (often credited to Fichte and Marx) than to anything Hegel cleanly stated. But the underlying move is real and useful: every position can be seen as a response to a different position, and the most interesting third position is the one that takes seriously what each was responding to without becoming either.\n\n" +
      "The discipline distinguishes itself from compromise. A compromise meets in the middle. A synthesis emerges from understanding what each side was getting at and finding a frame that holds both. Sometimes the synthesis is closer to one side than the other; sometimes it's a third place neither side anticipated.\n\n" +
      "Marx's adaptation of the move was historical — he saw the dialectic as how social arrangements actually evolve, with each form of society generating its own contradictions and being superseded by a synthesis that resolves them. Whether or not you accept the historical claim, the methodological one survives: arguing dialectically rather than oppositionally tends to produce more interesting positions.",
    commonPitfalls: [
      "Splitting the difference and calling it synthesis. A real synthesis is structurally different from either thesis or antithesis, not halfway between them.",
      "Stopping at one round. The discipline is the loop — synthesis becomes the new thesis, and you go again.",
      "Picking an antithesis that's just the negation. Antithesis means a different position that opposes from a different starting point, not 'not-thesis.'",
    ],
    workedExample:
      "Thesis: institutions should be efficient. Antithesis: institutions should be just. (Notice this isn't 'not efficient' — it's a different value-axis.) What each assumes the other denies: efficiency assumes outcomes are measurable; justice assumes some outcomes are owed regardless of measurement. Synthesis: institutions should be designed so that just outcomes are also efficient — which means redesigning what we measure, not picking between values. New thesis. The next round will surface a deeper antithesis: what about outcomes you can't measure at all? And so on.",
    relatedThinkers: [
      { name: "G.W.F. Hegel", note: "The Phenomenology of Spirit is the source — extremely difficult; read with a guide." },
      { name: "Karl Marx", note: "Adapted Hegel's dialectic to history; the Communist Manifesto is the most accessible application." },
      { name: "Theodor Adorno", note: "Negative Dialectics is the 20th-century rethinking — the synthesis isn't always available." },
    ],
    furtherReading: [
      { title: "Hegel: A Very Short Introduction", author: "Peter Singer", year: "1983", note: "The cleanest entry point to Hegel for first-time readers." },
      { title: "Reading Capital Politically", author: "Harry Cleaver", year: "1979", note: "How dialectical thinking works in a contemporary political reading." },
    ],
    relatedExercises: ['switch-sides', 'steelmanning', 'reductio'],
    kindredPractices: [
      { name: "Six Hats thinking", note: "Edward de Bono's heuristic — wear different perspectives sequentially. Less rigorous than dialectic but in the same family." },
    ],
  },

  // ─── Switch sides ──────────────────────────────────────────────────
  'switch-sides': {
    longerAbout:
      "Protagoras's claim that on every question there are two equally arguable sides was treated by his contemporaries as cynicism — the rhetorical training that lets you make the worse argument appear better. The deeper version of his teaching, which Plato attacked but didn't entirely refute, is that the skill of arguing well from any side is what frees you from being captured by the side you happen to start on.\n\n" +
      "Done seriously, the exercise produces a particular freedom. You stop confusing 'I have arguments for this side' with 'this side is right.' You realize that having arguments doesn't settle questions; arguments come for both sides. What does settle questions is some combination of evidence, framing, and value commitments — which is much harder to change than position.\n\n" +
      "The exercise is also a humility check. Most people, after thirty minutes of switching sides, find that they've made arguments they hadn't considered before, and that some of them genuinely complicate their previous certainty. This is the point.",
    commonPitfalls: [
      "Treating it as a debate-team performance. The point is to discover, not to win.",
      "Picking a topic where you already see both sides. Pick one where you don't; the exercise loses its bite otherwise.",
      "Stopping when the easy arguments are exhausted. The growth is in rounds 4–8, when you have to find arguments you'd never made before.",
    ],
    workedExample:
      "Question: should social media be regulated? You start (by coin flip) on the no-regulate side. Two minutes: speech values, regulatory capture, who decides what's misinformation. Switch. Two minutes: documented harms to teen mental health, foreign disinformation, attention economy externalities. Switch. Two minutes: regulatory tools applied to other media (TV, radio) didn't kill them; First Amendment is more flexible than maximalists claim. Switch. Two minutes: the 'just don't use it' counter doesn't work because network effects make non-use costly. After thirty minutes you have a more nuanced view than either of the original sides — and you no longer hold the position you started with quite as crisply.",
    relatedThinkers: [
      { name: "Protagoras", note: "The original — 'on every matter there are two opposing arguments.'" },
      { name: "Cicero", note: "Trained students to argue both sides as the central skill of education." },
      { name: "John Stuart Mill", note: "On Liberty Ch. 2 makes the moral case for the practice." },
    ],
    furtherReading: [
      { title: "On Liberty", author: "John Stuart Mill", year: "1859", note: "Chapter 2 in particular — Mill's defense of why opposing views must be honestly engaged." },
      { title: "The Sophists", author: "G.B. Kerferd", year: "1981", note: "A scholarly recovery of the sophists from Plato's dismissal — including Protagoras's actual position." },
    ],
    relatedExercises: ['steelmanning', 'dialectical-loop', 'anticipating-objections'],
    kindredPractices: [
      { name: "Devil's advocate", note: "Lighter version — argue the opposing view once, not iteratively." },
      { name: "Red team / blue team", note: "Institutional version used in security and policy — formally assign teams to attack and defend a plan." },
    ],
  },

  // ─── Morning intention ─────────────────────────────────────────────
  'morning-intention': {
    longerAbout:
      "The Stoics called the underlying skill prosoche — continuous attention to the present and to one's own judgments. The morning was where it got primed. Epictetus told his students to begin the day by rehearsing what is and isn't 'up to us'; Marcus Aurelius opens the second book of the Meditations with 'Begin each day by telling yourself: today I shall be meeting with interference, ingratitude, insolence, disloyalty, ill-will, and selfishness.' The line reads as gloom until you notice what it's doing — it sets a stance before the day can set one for you.\n\n" +
      "What separates an intention from a goal is the locus of control. A goal lives in the world, where other people, weather, and accident get a vote. An intention lives in your own conduct, which the Stoics regarded as the one province genuinely yours. Setting one is a small act of taking back the steering you actually have, and declining to stake your morning on the steering you don't.\n\n" +
      "The modern wellness habit of 'setting an intention' — borrowed loosely from yoga's sankalpa — descends from this, though often emptied of the Stoic spine. The version worth keeping is closer to Marcus: not a wish for the day to be pleasant, but a decision about who you'll be when it isn't.",
    commonPitfalls: [
      "Naming an outcome ('finish the draft') instead of a quality ('work without rushing'). Outcomes aren't yours to set; conduct is.",
      "Choosing an intention so abstract it can't be falsified. 'Be present' survives nothing; 'don't check my phone before the meeting' survives the morning.",
      "Setting it and never returning to it. The midday reread is what turns a sentence into a practice.",
    ],
    workedExample:
      "You wake knowing today holds a performance review you've been dreading. The vague version: 'I want today to go well.' The intention version: 'Today I want to bring steadiness to the review — I'll listen fully before I defend.' You name the friction (the moment your manager raises the missed deadline) and how the intention meets it (a breath, then a question, instead of the instant explanation). At noon you reread the line. You'd already half-forgotten it, which is exactly why you wrote it down.",
    relatedThinkers: [
      { name: "Marcus Aurelius", note: "Meditations II.1 — the morning rehearsal of the day's friction." },
      { name: "Epictetus", note: "Enchiridion 1 — begin by sorting what is and isn't within your power." },
      { name: "Pierre Hadot", note: "Recovered prosoche (attention) as the central Stoic 'spiritual exercise' in Philosophy as a Way of Life." },
    ],
    furtherReading: [
      { title: "Meditations", author: "Marcus Aurelius", year: "c. 170 CE", note: "Book II opens with the canonical morning preparation." },
      { title: "Philosophy as a Way of Life", author: "Pierre Hadot", year: "1995", note: "The scholarly case that Stoicism was a set of daily exercises, attention chief among them." },
    ],
    relatedExercises: ['three-line-evening', 'stoic-preview', 'examen'],
    kindredPractices: [
      { name: "Sankalpa", note: "The yogic intention set at the start of practice — a resolve stated in the present tense." },
      { name: "Examen (forward version)", note: "The Ignatian review run forward — previewing the day's likely temptations rather than reviewing the past one." },
    ],
  },

  // ─── Three-line evening ────────────────────────────────────────────
  'three-line-evening': {
    longerAbout:
      "The nightly self-review is one of the oldest recorded contemplative habits in the West. The Pythagoreans were told, in the Golden Verses, not to let sleep close their eyes until they had thrice reviewed the day's deeds: 'Where have I gone wrong? What have I done? What duty have I left undone?' Seneca describes his own version in On Anger — each night, lights out and his wife gone quiet, he arraigns the whole day before himself: 'I examine my entire day and retrace my deeds and words.'\n\n" +
      "What the Stoics understood, and what the three-line compression preserves, is that the value is in the regularity, not the length. Seneca wasn't writing a memoir; he was keeping a short standing appointment with himself. The Christian examen later formalized the same move into a daily discipline. The brevity here is a feature borrowed from hard experience: the journal you can keep for a year beats the one you abandon in February.\n\n" +
      "Three lines force a triage that longer entries let you dodge. You can't list everything, so you choose the moment that mattered — and the choosing is itself a small act of judgment, repeated nightly, that slowly trains what you notice.",
    commonPitfalls: [
      "Summarizing the day as a whole ('good day') instead of a single moment. The specificity is the point — one scene, not a verdict.",
      "Skipping the 'badly' line on good days and the 'well' line on bad ones. The discipline is to find both every night, even when one is small.",
      "Rereading and editing. This isn't an archive to curate; the writing is the practice, and closing the notebook is part of it.",
    ],
    workedExample:
      "A flat, unremarkable Tuesday. Line 1: 'Today went well when I caught myself about to interrupt Sam and let them finish.' Line 2: 'Today went badly when I scrolled for forty minutes instead of starting the thing I was avoiding.' Line 3: 'Tomorrow I'd choose differently if I put my phone in the other room before 9am.' Ninety seconds; nothing literary. But a week of these, read together, shows you a person who keeps choosing the phone over the hard first task — a pattern no single night could have shown you.",
    relatedThinkers: [
      { name: "Seneca", note: "On Anger III.36 — the locus classicus of the nightly self-examination." },
      { name: "Pythagoras", note: "The Golden Verses prescribe a threefold review of the day before sleep." },
      { name: "Ignatius of Loyola", note: "The Examen turned the practice into a structured daily spiritual exercise." },
    ],
    furtherReading: [
      { title: "On Anger", author: "Seneca", year: "c. 45 CE", note: "Book III, chapter 36 describes Seneca's own nightly accounting in detail." },
      { title: "Letters from a Stoic", author: "Seneca", note: "The Letters return repeatedly to the habit of daily self-reckoning." },
    ],
    relatedExercises: ['morning-intention', 'examen', 'letter-future-self'],
    kindredPractices: [
      { name: "Ignatian examen", note: "The fuller Christian version — review the day for where you moved toward or away from your values." },
      { name: "Five-minute journal", note: "A modern structured-prompt journal in the same minimal-dose spirit." },
    ],
  },

  // ─── Metta (loving-kindness) ───────────────────────────────────────
  'loving-kindness': {
    longerAbout:
      "Metta is the first of the four brahmaviharas — the 'divine abodes' of loving-kindness, compassion, sympathetic joy, and equanimity. Its founding text is the Karaniya Metta Sutta, a short poem in the Pali canon that ends on the image of a mother protecting her only child: 'even so let one cultivate a boundless heart toward all beings.' In the fifth century the monk Buddhaghosa, in the Visuddhimagga, laid out the graded sequence the practice still uses — self, friend, neutral person, enemy — and warned against starting with the people who make it hardest.\n\n" +
      "The order isn't arbitrary. Buddhaghosa observed that goodwill, like water, runs easiest downhill and pools where there's least resistance. You begin with yourself and the easily-loved not because they need it most but because they teach the felt sense of the thing, which you then carry to the harder circles. Trying to begin with the difficult person tends to produce strain dressed up as virtue.\n\n" +
      "Brought West largely by Sharon Salzberg in the 1990s, metta has since been studied empirically — Barbara Fredrickson's work found that a few weeks of it measurably widened people's daily positive emotion and even their sense of social connection. The tradition would call this unsurprising: the heart, like a muscle, grows in the direction it's repeatedly asked to move.",
    commonPitfalls: [
      "Trying to manufacture a warm feeling. The practice directs attention and repeats the phrases; the feeling, when it comes, is a byproduct, not the assignment.",
      "Starting with the hardest person to prove you can. Buddhaghosa specifically warns against this — begin where goodwill flows easily and extend outward.",
      "Treating resistance as failure. The circle that snags is the most informative one; it shows where your goodwill currently draws its border.",
    ],
    workedExample:
      "You move through the circles and they go smoothly until the fourth — the difficult person, a coworker who takes credit for shared work. 'May you be safe, may you be well, may you be at peace.' The words come out clenched. You notice the clench. You don't force past it; you just keep returning the phrases to them, gently, for the minute. Nothing dramatic resolves. But the next time you see them, the reflexive tightening in your chest arrives a half-second slower than usual — a gap that wasn't there before.",
    relatedThinkers: [
      { name: "The Buddha", note: "The Karaniya Metta Sutta (Sutta Nipata 1.8) is the canonical source." },
      { name: "Buddhaghosa", note: "The Visuddhimagga (5th c.) systematized the graded sequence of recipients." },
      { name: "Sharon Salzberg", note: "Did the most to bring metta to a Western lay audience; her Lovingkindness (1995) is the standard guide." },
      { name: "Barbara Fredrickson", note: "Psychologist whose studies measured the practice's effect on positive emotion and social connection." },
    ],
    furtherReading: [
      { title: "Lovingkindness", author: "Sharon Salzberg", year: "1995", note: "The accessible modern manual, faithful to the Theravada source." },
      { title: "The Path of Purification (Visuddhimagga)", author: "Buddhaghosa", year: "c. 430 CE", note: "The classical treatment of the brahmaviharas and the order of practice." },
    ],
    relatedExercises: ['breath-count', 'body-scan', 'mindful-eating'],
    kindredPractices: [
      { name: "Tonglen", note: "A Tibetan practice in the same family: breathe in another's suffering, breathe out relief." },
      { name: "Compassion cultivation (CCT)", note: "Thupten Jinpa's secular protocol, developed at Stanford from the same Buddhist roots." },
    ],
  },

  // ─── Breath count to ten ───────────────────────────────────────────
  'breath-count': {
    longerAbout:
      "Counting the breath — susokukan in Japanese Zen — is the practice traditionally given to beginners, and quietly kept by many who are not. Its lineage runs back to the Anapanasati Sutta, the Buddha's discourse on mindfulness of breathing, but Zen pared it to a numbered minimum. Dogen, in the Fukanzazengi, insisted that zazen is not a technique for achieving anything; the counting is a fence around the attention, not a ladder to somewhere.\n\n" +
      "The design is deliberately unforgiving. There's no narrative, no scenery, no progress to report — only ten numbers and the plain fact of whether you held them. This is why it humbles people who are good at things. The point was never to reach ten cleanly. The point is the instant you notice you've drifted to four-then-elsewhere, because that instant of noticing is the actual repetition the practice trains: not concentration, but the return.\n\n" +
      "Shunryu Suzuki put the attitude precisely in Zen Mind, Beginner's Mind — the beginner's willingness to start again, without grievance, is the whole of it. Counting back from ten to one starts you over with no record kept. The slate is clean every breath, which is both the difficulty and the mercy.",
    commonPitfalls: [
      "Berating yourself for losing count. The self-criticism is just more thinking; the instruction is to start at one without comment.",
      "Controlling the breath to make counting easier. Let the breath do what it does — you're counting it, not conducting it.",
      "Mistaking a long clean run for success. A wandering mind caught and returned a dozen times has done more of the actual training than an unbroken count.",
    ],
    workedExample:
      "You sit and count. One on the exhale, two, three — and somewhere around four you're abruptly planning tomorrow's lunch, with no memory of the transition. You were gone and didn't know it. You start at one. It happens again at three. And again. After ten minutes you've reached ten exactly twice and started over perhaps thirty times. By the old scorekeeping that's a failure. By the practice's own terms you did thirty repetitions of the one move that matters — the noticing and the return — which is twenty-eight more than a flawless run would have given you.",
    relatedThinkers: [
      { name: "The Buddha", note: "The Anapanasati Sutta is the canonical root of breath-based meditation." },
      { name: "Dogen", note: "The Fukanzazengi (13th c.) frames zazen as goalless sitting, not a means to an end." },
      { name: "Shunryu Suzuki", note: "Zen Mind, Beginner's Mind articulates the begin-again attitude the count requires." },
    ],
    furtherReading: [
      { title: "Zen Mind, Beginner's Mind", author: "Shunryu Suzuki", year: "1970", note: "The classic Western introduction to Soto Zen practice and posture." },
      { title: "The Three Pillars of Zen", author: "Philip Kapleau", year: "1965", note: "Includes detailed instruction on breath-counting for beginners." },
    ],
    relatedExercises: ['body-scan', 'loving-kindness', 'mindful-eating'],
    kindredPractices: [
      { name: "Shikantaza", note: "'Just sitting' — the count's advanced sibling, which drops the number and rests in bare awareness." },
      { name: "Mantra repetition", note: "A parallel concentration device across traditions: a repeated word in place of a count." },
    ],
  },

  // ─── Mindful eating ────────────────────────────────────────────────
  'mindful-eating': {
    longerAbout:
      "The most famous instruction in modern mindful eating is Thich Nhat Hanh's tangerine: eat it as if eating, not as if already reaching for the next thing. In The Miracle of Mindfulness he contrasts the person who pops the sections in before finishing the last one with the person who actually meets the fruit. The clinical version is older than the bumper-sticker fame suggests — the raisin exercise, in which a single raisin is examined, smelled, and slowly eaten, is the very first practice Jon Kabat-Zinn assigns in his eight-week MBSR course.\n\n" +
      "The choice of food is the lesson in miniature. A whole meal is too much to attend to at first; a single raisin or wedge of fruit is small enough that there's nowhere to hide. With nothing to distract you, the ordinary turns strange: a raisin you've eaten a thousand times turns out to have a smell, a structure, a sequence of flavors you'd never once registered. The mild disorientation is the point — it shows how much of life passes through a half-attentive fog.\n\n" +
      "There's an older, more austere relative of this in the canon — the contemplation of food's unattractiveness (ahare patikulasanna), meant to loosen craving. Modern mindful eating keeps the attentiveness and drops the aversion. The aim isn't to spoil the meal but to actually be present for it.",
    commonPitfalls: [
      "Reaching for a phone, book, or podcast within the first minute. The urge to fill the attention is the very habit being studied — notice it rather than obeying it.",
      "Turning it into a performance of slowness. The aim is genuine attention, not theatrical chewing; pace follows from noticing, not the reverse.",
      "Picking a whole meal on the first try. Start with one piece of fruit. The smaller the object, the harder it is to drift.",
    ],
    workedExample:
      "You sit with a single clementine and nothing else — no screen, no music. You look at it first: the dimpled skin, the small give as you press it. Peeling it releases a sharp citrus mist you've never consciously smelled despite eating dozens of them. One segment. You notice it's both sweeter and more sour than the idea of 'clementine' in your head. Between segments you set your hand down and feel the immediate, almost physical pull to speed up and be done. You stay. The fruit, it turns out, was more interesting than the entire afternoon of half-watched videos it would normally have accompanied.",
    relatedThinkers: [
      { name: "Thich Nhat Hanh", note: "The Miracle of Mindfulness — the tangerine as the emblem of eating with full presence." },
      { name: "Jon Kabat-Zinn", note: "Made the raisin exercise the opening practice of the MBSR curriculum." },
      { name: "Jan Chozen Bays", note: "Zen teacher and physician whose Mindful Eating gathered the practice into a full method." },
    ],
    furtherReading: [
      { title: "The Miracle of Mindfulness", author: "Thich Nhat Hanh", year: "1975", note: "The source of the tangerine teaching and a gentle introduction to everyday mindfulness." },
      { title: "Mindful Eating", author: "Jan Chozen Bays", year: "2009", note: "A practical book-length treatment blending Zen and clinical nutrition." },
    ],
    relatedExercises: ['breath-count', 'body-scan', 'loving-kindness'],
    kindredPractices: [
      { name: "Oryoki", note: "The formal, fully-attentive Zen meal practice, choreographed down to the placement of the bowls." },
      { name: "Saying grace", note: "The pause-and-acknowledge before eating found across traditions — a brief reorientation of attention to the food." },
    ],
  },

  // ─── Letter to your future self ────────────────────────────────────
  'letter-future-self': {
    longerAbout:
      "Writing to the self you'll become is a modern, near-universal practice without a single founding text — but it rests on a long tradition of self-address. Marcus Aurelius's Meditations were written to no audience but their author; the Greek title, Ta eis heauton, means simply 'to himself.' The letter to a future self extends that across time: a message from who you are now to who you'll have become, sealed before you know what the years will do.\n\n" +
      "Psychology has lately given the practice a sharper rationale. Hal Hershfield's research on 'future-self continuity' finds that most people relate to their future selves almost as strangers — brain scans show we think about 'me in ten years' using the circuitry we use for other people. The more vividly and warmly you can picture that future person, the better you tend to treat them: saving more, deciding more patiently, keeping the promises that benefit them. The letter is a way of shortening that imaginative distance by hand.\n\n" +
      "There's a philosophical depth here too. Derek Parfit argued that the connection between you-now and you-in-thirty-years is a matter of degree, not an all-or-nothing identity — more like the bond between close relatives than a single unbroken self. The letter doesn't resolve that puzzle, but it takes a stance toward it: it treats the future self as kin worth writing to, rather than a stranger you'll be surprised to meet.",
    commonPitfalls: [
      "Slipping into advice. The future self has already lived the intervening years; what they can't get back is a record of who you were before them.",
      "Writing to an idealized self instead of a real one. Address the actual person who will read it, with the actual life they may have.",
      "Making it a to-do list for the future. The letter preserves a self; it doesn't assign tasks to one.",
    ],
    workedExample:
      "You write to yourself five years out. You resist the urge to advise ('you should have...') and instead report: here's what I'm afraid of right now, here's the friendship I hope you've kept, here's the small daily thing — the walk after dinner — that's currently holding me together and that I suspect you'll have quietly dropped. You name one belief you hold fiercely today and admit you're not sure they'll still hold it. Sealing the envelope, you notice the letter told you more about your present values than any direct question would have — you found out what you cared about by deciding what was worth preserving.",
    relatedThinkers: [
      { name: "Marcus Aurelius", note: "The Meditations are the great example of philosophical self-address — literally 'to himself.'" },
      { name: "Hal Hershfield", note: "Psychologist whose work on future-self continuity explains why vividly picturing your later self changes present behavior." },
      { name: "Derek Parfit", note: "Reasons and Persons argues identity over time is a matter of degree — reframing what 'your future self' even is." },
    ],
    furtherReading: [
      { title: "Reasons and Persons", author: "Derek Parfit", year: "1984", note: "Part Three on personal identity is the deep background for why writing to a 'future self' is stranger than it looks." },
      { title: "Your Future Self", author: "Hal Hershfield", year: "2023", note: "The accessible account of the continuity research and how to act on it." },
    ],
    relatedExercises: ['memento-mori', 'three-line-evening', 'morning-intention'],
    kindredPractices: [
      { name: "FutureMe letters", note: "The online service (since 2002) that emails your letter back to you on a date you set." },
      { name: "Time capsule", note: "The object version of the same impulse — sealing the present away for a later self to open." },
    ],
  },

  // ─── Body scan ─────────────────────────────────────────────────────
  'body-scan': {
    longerAbout:
      "The body scan as most people meet it today comes from Jon Kabat-Zinn, who made it the second formal practice of Mindfulness-Based Stress Reduction, the eight-week clinical program he founded at the University of Massachusetts in 1979. Lying still and moving attention region by region through the body, the practitioner is asked only to notice — not to relax, not to fix — whatever is already there.\n\n" +
      "Kabat-Zinn was adapting something older. The technique descends most directly from the Burmese Vipassana of U Ba Khin and his student S.N. Goenka, in which the meditator sweeps attention through the body observing raw sensation (vedana) without reacting — the discipline being equanimity toward whatever is pleasant or unpleasant. A parallel root runs through Yoga Nidra's 'rotation of consciousness,' the systematic naming of body parts that the Satyananda lineage formalized in the twentieth century.\n\n" +
      "What unites these sources is a wager about attention and the body: that we carry a great deal of unfelt holding — a clamped jaw, raised shoulders, a braced stomach — and that simply attending to it, without an agenda to change it, is often enough to loosen it. The body, the practice assumes, has been trying to tell you something all day. The scan is a way of finally listening.",
    commonPitfalls: [
      "Trying to relax each region. The instruction is to notice, not to fix; relaxation, when it comes, is a side effect of attention, not its goal.",
      "Rushing to 'finish' the body. The pace is slow on purpose — a region given two breaths reveals what a region given two seconds never will.",
      "Treating numbness or 'nothing there' as failure. 'Nothing' is a finding too; not every region has a message, and noticing the blank is part of the scan.",
    ],
    workedExample:
      "You lie down at the end of a long day and move attention from the toes upward. Feet, calves, knees — mostly quiet. Then you arrive at your shoulders and find them hiked up near your ears, where they have apparently been for hours, holding a tension you never consciously felt. You don't order them down. You just keep your attention there, breathing, and within a minute they drop on their own with a small involuntary sigh. The day's stress had been living in your trapezius the whole time, unbilled, and the scan was simply the first moment you'd checked the account.",
    relatedThinkers: [
      { name: "Jon Kabat-Zinn", note: "Founded MBSR and made the body scan a core clinical mindfulness practice." },
      { name: "S.N. Goenka", note: "Carried the Burmese Vipassana body-sweeping technique (from U Ba Khin) to a worldwide lay audience." },
      { name: "Swami Satyananda", note: "Systematized Yoga Nidra's 'rotation of consciousness' through the body." },
    ],
    furtherReading: [
      { title: "Full Catastrophe Living", author: "Jon Kabat-Zinn", year: "1990", note: "The foundational MBSR text, with the body scan as a central practice." },
      { title: "The Art of Living", author: "William Hart", year: "1987", note: "A clear account of Goenka's Vipassana, including the body-sweeping method." },
    ],
    relatedExercises: ['breath-count', 'loving-kindness', 'mindful-eating'],
    kindredPractices: [
      { name: "Yoga Nidra", note: "A guided 'rotation of consciousness' through the body, done lying down at the edge of sleep." },
      { name: "Progressive muscle relaxation", note: "Jacobson's clinical cousin — deliberately tensing and releasing each muscle group in turn." },
    ],
  },

  // ─── Burden-of-proof check ─────────────────────────────────────────
  'burden-of-proof': {
    longerAbout:
      "The principle is older than analytic philosophy; it's Roman law. The maxim ei incumbit probatio qui dicit, non qui negat — the proof lies on the one who asserts, not the one who denies — set the default that the claimant, not the doubter, owes the argument. Carried into philosophy, it becomes a tool for sorting who has work to do before anyone has done any.\n\n" +
      "Bertrand Russell gave the idea its most memorable image. If he asserted that a china teapot orbits the sun between Earth and Mars, too small for any telescope to find, he couldn't expect others to disprove it — and they'd be right to stay unconvinced, because the burden sits with the one making the strange positive claim, not the one declining to accept it. The same logic powers Sagan's 'extraordinary claims require extraordinary evidence' and Hitchens's blunter razor: what's asserted without evidence can be dismissed without evidence.\n\n" +
      "Most real-world confusion comes from the burden being quietly switched. Someone makes an assertion, then demands you refute it, and if you can't, claims victory — as though failure to disprove were the same as proof. Naming the swap out loud usually ends the move, because once it's visible it's obviously illegitimate.",
    commonPitfalls: [
      "Accepting a burden swap. 'You can't prove it's false, so it's true' inverts the rule; non-disproof is not evidence.",
      "Forgetting that 'extraordinary' is relative to background knowledge. A mundane claim needs little; one that overturns a great deal needs a great deal.",
      "Using the principle only against others. Your own positive claims carry the same burden you're holding opponents to.",
    ],
    workedExample:
      "In an online thread someone claims a supplement cures a condition, and when challenged replies: 'Well, you can't prove it doesn't work.' You stop and locate the burden. The positive claim — 'this cures X' — is theirs to support, and they've offered nothing but a demand that you disprove it. You point out, without heat, that the absence of a disproof isn't evidence of a cure; if it were, every untested claim ever made would be true by default. The conversation either produces actual evidence or ends. Either outcome is cleaner than the disproof chase they were trying to start.",
    relatedThinkers: [
      { name: "Bertrand Russell", note: "The celestial-teapot analogy (1952) — the burden sits with the one asserting, not the one doubting." },
      { name: "Antony Flew", note: "'The Presumption of Atheism' (1976) made burden-of-proof central to a famous philosophical debate." },
      { name: "Carl Sagan", note: "'Extraordinary claims require extraordinary evidence' scales the burden to the claim's strangeness." },
    ],
    furtherReading: [
      { title: "Is There a God?", author: "Bertrand Russell", year: "1952", note: "The short essay containing the teapot — two pages that fixed the idea in popular thought." },
      { title: "Burden of Proof, Presumption and Argumentation", author: "Douglas Walton", year: "2014", note: "The rigorous modern treatment of how burdens actually shift in real argument." },
    ],
    relatedExercises: ['hidden-premises', 'fallacy-hunt', 'necessary-sufficient'],
    kindredPractices: [
      { name: "Hitchens's razor", note: "'What can be asserted without evidence can be dismissed without evidence' — the principle as a one-line blade." },
      { name: "Presumption of innocence", note: "The legal form — the prosecution bears the burden, the accused need prove nothing." },
    ],
  },

  // ─── Necessary vs sufficient ───────────────────────────────────────
  'necessary-sufficient': {
    longerAbout:
      "The distinction is bread-and-butter logic, but it earns its keep in the messy business of talking about causes. A necessary condition is one without which the effect can't occur; a sufficient condition is one whose presence guarantees it. Oxygen is necessary for fire but not sufficient — a room full of air doesn't ignite. A lit match in dry tinder is closer to sufficient but not necessary — there are other ways to start a fire. Most of the words we fight over ('the cause', 'the reason', 'because') blur the two together.\n\n" +
      "The philosopher who mapped the messiness most carefully was J.L. Mackie, whose 'INUS condition' — an insufficient but necessary part of an unnecessary but sufficient condition — sounds like a tongue-twister and is actually a precise description of how ordinary causes work. A short circuit causes a house fire: not alone (it needs oxygen, flammable material, no working sprinkler), and not uniquely (other things could have started it). It's one necessary piece of one sufficient package among several. Almost every everyday cause has this shape.\n\n" +
      "This matters outside the seminar because policy and blame both run on it. 'Poverty causes crime,' 'social media causes depression,' 'the diet caused the weight loss' — each is usually a claim about a necessary-but-not-sufficient piece, wearing the grammar of a sufficient one. Pulling the two apart is often the whole disagreement.",
    commonPitfalls: [
      "Hearing 'necessary' and 'sufficient' as the same strength. 'You need X' and 'X is enough' are different claims and often have different truth values.",
      "Treating a single necessary condition as 'the cause.' Most effects need a package; singling out one piece is usually a rhetorical choice, not a factual one.",
      "Forgetting that a condition can be neither. Some alleged causes correlate without being required or guaranteeing anything — the hardest and most common case to catch.",
    ],
    workedExample:
      "A friend insists that 'hard work causes success.' You run the two tests. Is hard work necessary for success? Mostly yes — luck-only success is rare and unstable. Is it sufficient? Plainly no — plenty of people work brutally hard and don't succeed, because they also needed opportunity, timing, health, capital. So the honest claim narrows from 'hard work causes success' to 'hard work is usually necessary for success but never sufficient.' That single revision dissolves the argument you were about to have, because your friend was defending the necessity and you were attacking the sufficiency — and you were both right.",
    relatedThinkers: [
      { name: "Aristotle", note: "His analysis of the four 'causes' (aitia) is the ancient root of thinking carefully about what produces what." },
      { name: "J.L. Mackie", note: "The Cement of the Universe introduced the INUS condition, the precise anatomy of an everyday cause." },
      { name: "David Hume", note: "Forced the whole question open by asking what, beyond constant conjunction, we even mean by 'cause.'" },
    ],
    furtherReading: [
      { title: "The Cement of the Universe", author: "J.L. Mackie", year: "1974", note: "The classic modern analysis of causation and conditions; source of the INUS idea." },
      { title: "A Concise Introduction to Logic", author: "Patrick Hurley", note: "A standard primer that drills the necessary/sufficient distinction with clear exercises." },
    ],
    relatedExercises: ['modus-tollens', 'hidden-premises', 'ockhams-razor'],
    kindredPractices: [
      { name: "Causal diagrams (DAGs)", note: "The modern statistical tool for laying out which conditions actually feed which effects." },
      { name: "Five whys", note: "A diagnostic that, done well, separates the necessary links in a causal chain from the incidental ones." },
    ],
  },

  // ─── Modus tollens practice ────────────────────────────────────────
  'modus-tollens': {
    longerAbout:
      "Modus tollens — 'the mode that denies' — is one of the oldest validated argument forms in the Western tradition. The Stoic logician Chrysippus listed it among his five 'indemonstrables,' the basic inference patterns from which all others could be built, in the third century BCE. Its shape is simple: if P then Q; not Q; therefore not P. If the theory predicts rain and the ground is dry, the theory has a problem.\n\n" +
      "The form became the backbone of a whole philosophy of science when Karl Popper made it the engine of falsification. A scientific theory, Popper argued, earns its standing not by being confirmed but by surviving attempts to refute it: you derive a risky prediction, check it, and if the prediction fails, modus tollens forces a retreat. A single black swan refutes 'all swans are white' in a way that ten thousand white swans can never confirm it.\n\n" +
      "There's a famous catch worth holding onto — the Duhem-Quine thesis. When a prediction fails, modus tollens tells you something in your reasoning is false, but not which thing. Maybe the theory is wrong — or maybe an auxiliary assumption, the instrument, or the background conditions are. The disconfirmed theory takes a hit, but it can sometimes legitimately pass the blame to a neighbor. This is why a failed prediction owes you an explanation rather than an automatic surrender.",
    commonPitfalls: [
      "Confusing it with its invalid mirror, denying the antecedent: 'if P then Q; not P; therefore not Q' does not follow.",
      "Treating a single failed prediction as a knockout. Modus tollens shows something is wrong, not that the headline theory specifically is — check the auxiliary assumptions first.",
      "Only running it on other people's theories. Aim a risky prediction at one of your own beliefs and actually check it.",
    ],
    workedExample:
      "You believe a colleague dislikes you. Stated as a conditional: if they dislike me (P), then they'll avoid working with me (Q). You watch. In fact they volunteered to pair with you twice this month (not-Q). Modus tollens does its quiet work: not-Q gives you not-P — the avoidance you predicted didn't happen, so the dislike you assumed takes a real hit. You pause before concluding outright that they like you (maybe your conditional was too crude), but the belief that felt like fact this morning is now a hypothesis that failed its first test.",
    relatedThinkers: [
      { name: "Chrysippus", note: "The Stoic logician who catalogued modus tollens among his five basic indemonstrable inferences." },
      { name: "Karl Popper", note: "Built falsificationism on modus tollens — theories advance by surviving attempted refutation." },
      { name: "Duhem & Quine", note: "Showed that a failed prediction indicts the whole web of assumptions, not one theory in isolation." },
    ],
    furtherReading: [
      { title: "The Logic of Scientific Discovery", author: "Karl Popper", year: "1959", note: "The case that science progresses by falsification — modus tollens as method." },
      { title: "Two Dogmas of Empiricism", author: "W.V.O. Quine", year: "1951", note: "The essay behind the holism that complicates any clean falsification." },
    ],
    relatedExercises: ['necessary-sufficient', 'bayesian-update', 'hidden-premises'],
    kindredPractices: [
      { name: "Falsification test", note: "Before holding a belief, ask: what observation would prove it wrong? If nothing could, modus tollens has nothing to grip." },
      { name: "Debugging by elimination", note: "The programmer's version — a failing test denies the consequent and sends you hunting the false premise." },
    ],
  },

  // ─── Bayesian update ───────────────────────────────────────────────
  'bayesian-update': {
    longerAbout:
      "The theorem is named for Thomas Bayes, an English Presbyterian minister whose solution to a problem in probability was published in 1763, two years after his death, by his friend Richard Price. It might have stayed a curiosity if Pierre-Simon Laplace hadn't independently rediscovered and vastly extended it a few years later, turning it into a general method for reasoning from evidence back to cause. For two centuries it was mistrusted by statisticians who disliked its central move — treating a degree of belief as a probability.\n\n" +
      "That move was given its footing by Frank Ramsey and Bruno de Finetti, who argued that your subjective probabilities are coherent only if they obey the probability axioms — on pain of a 'Dutch book,' a set of bets you'd accept that guarantees you lose. Bayes' rule then tells you not what to believe from scratch but how much to move when evidence arrives: your new confidence is your old confidence reweighted by how well each hypothesis predicted what you just saw.\n\n" +
      "The everyday version needs no arithmetic, only honesty about two things people prefer to skip: what you actually believed before the evidence (the prior), and how expected the evidence was on each hypothesis (the likelihood). Most reasoning errors are failures at one of these — ignoring the base rate, or treating evidence as decisive when it was nearly as likely under the hypothesis you're rejecting as under the one you're adopting.",
    commonPitfalls: [
      "Ignoring the prior. A positive result for a rare condition can still leave it unlikely if the base rate is low enough — the base rate is part of the calculation, not a distraction from it.",
      "Over-updating on evidence that both hypotheses predict equally well. If the new fact was just as likely whether you're right or wrong, it shouldn't move you at all.",
      "Refusing to state a prior because it feels arbitrary. A rough honest number beats a hidden one; the discipline is making the starting belief explicit so the update is visible.",
    ],
    workedExample:
      "You wake to silence from a normally-prompt friend who's gone quiet for three days. Prior: 60% they're just busy, 30% something's wrong, 10% they're upset with you. The new evidence: a cheerful text, 'sorry, swamped!' Ask how likely that message is under each story. Very likely if they were busy; unlikely if something were wrong; unlikely if they were upset (an upset friend rarely sends a breezy apology). The evidence fits 'busy' far better, so it gets boosted toward, say, 90%, and the worry stories shrink. You didn't need a formula — you needed to ask, for each story, 'how expected was this text if that story were true?'",
    relatedThinkers: [
      { name: "Thomas Bayes", note: "The minister whose 1763 posthumous essay first stated the rule for updating on evidence." },
      { name: "Pierre-Simon Laplace", note: "Rediscovered and generalized the method into a working tool for scientific inference." },
      { name: "Frank Ramsey", note: "Grounded subjective probability with the Dutch-book argument — beliefs must obey the axioms or you can be made to lose for sure." },
    ],
    furtherReading: [
      { title: "The Theory That Would Not Die", author: "Sharon Bertsch McGrayne", year: "2011", note: "A readable history of Bayes' rule and its long climb from disrepute to ubiquity." },
      { title: "The Signal and the Noise", author: "Nate Silver", year: "2012", note: "An accessible case for Bayesian thinking in forecasting and everyday judgment." },
    ],
    relatedExercises: ['modus-tollens', 'necessary-sufficient', 'ockhams-razor'],
    kindredPractices: [
      { name: "Superforecasting", note: "Philip Tetlock's research on forecasters who win by making many small updates instead of few large ones." },
      { name: "Calibration training", note: "Practicing confidence estimates against outcomes so that your '70% sure' is right about 70% of the time." },
    ],
  },

  // ─── Naming hidden premises ────────────────────────────────────────
  'hidden-premises': {
    longerAbout:
      "The technical name for an argument with a suppressed premise is an enthymeme, and Aristotle treated it as the basic unit of real-world persuasion. We almost never state every step; we lean on what we assume the listener already grants. 'She's a politician, so don't trust her' is an enthymeme — the unstated premise, 'politicians aren't trustworthy,' is doing the actual work while staying out of sight, where it can't be challenged.\n\n" +
      "Stephen Toulmin gave the hidden step a more precise role with his notion of the 'warrant' — the often-unspoken general rule that licenses the move from evidence to conclusion. Data: the ground is wet. Claim: it rained. Warrant (unstated): wet ground means rain — which quietly ignores sprinklers, hoses, and dew. Toulmin's point was that the warrant is exactly where arguments are weakest and least examined, precisely because it's the part nobody says out loud.\n\n" +
      "Modern argumentation theory, especially the pragma-dialectics of Frans van Eemeren, treats reconstructing these 'unexpressed premises' as a core skill — and a charitable one, since you have to supply the premise that makes the argument valid before you test whether it's true. The reliable discovery is that the load-bearing assumption, once written down, is frequently the one the arguer would least want to defend.",
    commonPitfalls: [
      "Supplying an uncharitably weak hidden premise to make refutation easy. Add the premise that makes the argument strongest, then test that one.",
      "Confusing a hidden premise with the conclusion restated. The missing piece is a general bridge, not a paraphrase of the claim.",
      "Stopping at one. Many arguments hide a chain of assumptions; the interesting one is often two steps down, not the first you find.",
    ],
    workedExample:
      "A headline argues: 'This product is natural, so it's safe.' You reconstruct it. Stated premise: the product is natural. Conclusion: it's safe. The conclusion doesn't follow on its own, so you supply the bridge that would make it valid: 'whatever is natural is safe.' Written out, that premise is plainly false — arsenic, hemlock, and snake venom are all entirely natural. The argument's whole weight was resting on an unstated rule its author would never have asserted directly, and naming it out loud is the entire refutation.",
    relatedThinkers: [
      { name: "Aristotle", note: "Named the enthymeme — the everyday syllogism with a premise left unspoken — in the Rhetoric." },
      { name: "Stephen Toulmin", note: "His 'warrant' is the usually-unstated rule licensing the leap from evidence to claim." },
      { name: "Frans van Eemeren", note: "Made reconstructing 'unexpressed premises' central to the pragma-dialectical analysis of argument." },
    ],
    furtherReading: [
      { title: "The Uses of Argument", author: "Stephen Toulmin", year: "1958", note: "Introduces the warrant and the anatomy of everyday arguments." },
      { title: "A Rulebook for Arguments", author: "Anthony Weston", year: "1986", note: "A short, practical guide that drills the spotting of missing premises." },
    ],
    relatedExercises: ['argument-map', 'burden-of-proof', 'fallacy-hunt'],
    kindredPractices: [
      { name: "Enthymeme reconstruction", note: "Aristotle's own move — restore the suppressed premise and judge the argument whole." },
      { name: "'What would have to be true?'", note: "A one-question version: ask what would need to hold for the conclusion to follow, then check whether it does." },
    ],
  },

  // ─── Ockham's razor ────────────────────────────────────────────────
  'ockhams-razor': {
    longerAbout:
      "William of Ockham, a fourteenth-century Franciscan, is remembered for a sentence he never quite wrote. The famous Latin — entia non sunt multiplicanda praeter necessitatem, 'entities must not be multiplied beyond necessity' — was put in his mouth by later writers (the phrasing is John Punch's, in 1639). What Ockham actually said was closer to 'plurality should not be posited without necessity' and 'it is futile to do with more what can be done with fewer.' The idea outgrew its author and kept his name.\n\n" +
      "As a working principle the razor is a tie-breaker, not a truth-detector. When two theories account for the same evidence equally well, prefer the one that assumes less, because it has fewer places to be wrong and is easier to test. Newton built a version into the Principia as his first rule of reasoning; the sentiment recurs in the line often pinned on Einstein, that an account should be as simple as possible but no simpler. That last clause is the whole discipline: simplicity is a virtue only among theories that explain the same amount.\n\n" +
      "The razor is one of the most misused tools in popular reasoning, usually by people who wield it to kill a theory simply for being complicated. But a more complex theory that explains things the simpler one can't isn't being extravagant — it's earning its parts. Modern statistics even formalizes the trade-off: model-selection methods penalize extra parameters but reward the explanatory power they buy, which is exactly Ockham's bargain made quantitative.",
    commonPitfalls: [
      "Using it to dismiss a theory for being complex, full stop. The razor only applies when the rival explains the evidence equally well — complexity that buys extra explanation is legitimate.",
      "Confusing 'simpler' with 'more familiar' or 'easier for me.' Fewer assumed entities is the measure, not lower effort or comfort.",
      "Forgetting the 'but no simpler' clause. An account that drops a needed part isn't parsimonious; it's just inadequate.",
    ],
    workedExample:
      "Your houseplant is wilting. Two explanations: (A) you've been underwatering it, or (B) a fungal pathogen has colonized the roots, complicated by a nutrient lockout from your tap water's pH. Both fit the drooping leaves. Ockham says start with A, because it assumes far less and is trivially testable — water it and wait. If it perks up, the elaborate theory was never needed. If it keeps wilting despite watering, the simple story has failed to explain the evidence, and now B has earned the right to its extra moving parts. The razor didn't decide the truth; it ordered the investigation.",
    relatedThinkers: [
      { name: "William of Ockham", note: "The 14th-c. Franciscan whose name attached to parsimony, though not to the famous Latin phrasing." },
      { name: "Isaac Newton", note: "Made parsimony his first 'Rule of Reasoning in Philosophy' in the Principia." },
      { name: "Albert Einstein", note: "Associated with the qualifier that matters most: as simple as possible, but no simpler." },
    ],
    furtherReading: [
      { title: "Ockham's Razors: A User's Manual", author: "Elliott Sober", year: "2015", note: "The definitive modern examination of when parsimony is and isn't a good guide." },
      { title: "The Principia (Rules of Reasoning)", author: "Isaac Newton", year: "1687", note: "Newton's own statement of the simplicity rule, in his own words." },
    ],
    relatedExercises: ['necessary-sufficient', 'bayesian-update', 'hidden-premises'],
    kindredPractices: [
      { name: "Model selection", note: "The statistical formalization — criteria like AIC penalize extra parameters but credit the fit they earn." },
      { name: "KISS principle", note: "The engineering folk-version: keep it simple — fewer parts, fewer failure modes." },
    ],
  },

  // ─── Disjunction elimination ───────────────────────────────────────
  'disjunction-elimination': {
    longerAbout:
      "The move 'either P or Q; not P; therefore Q' has two ancestries. As a formal rule it sits among Chrysippus's Stoic indemonstrables (the fifth), and logicians call this particular shape the disjunctive syllogism. Its most quoted expression, though, is Sherlock Holmes's: 'when you have eliminated the impossible, whatever remains, however improbable, must be the truth' — a line Conan Doyle gave him as early as The Sign of Four.\n\n" +
      "The rule is valid, which is exactly what makes it dangerous in casual use. The logic is airtight given the disjunction — but the disjunction itself is an assumption, and it's usually where the reasoning breaks. Holmes can only land on the improbable remainder if his list of possibilities was genuinely complete. In real life, 'it's either A or B' is constantly a disguised 'it's either A or B or some C I haven't thought of,' and the whole elimination collapses the moment the unlisted option turns out to be the truth.\n\n" +
      "There's a second, quieter trap: the kind of 'or.' Logicians distinguish the inclusive or (at least one, maybe both) from the exclusive or (exactly one). Disjunctive syllogism is safe either way, but everyday reasoning slides between them and sometimes rules out a possibility that was never actually excluded. So the practice has two halves: use the rule when the alternatives are truly exhaustive, and — far more often — catch yourself when they aren't.",
    commonPitfalls: [
      "Assuming the disjunction is complete. 'It's either A or B' is the step that fails most often; the real list was longer the whole time.",
      "Eliminating an option on weak grounds just to force a clean answer. The remainder is only as solid as the ruling-out that produced it.",
      "Forgetting to confirm the survivor. Even after eliminating the rest, check that the last option actually fits the evidence rather than merely being what's left.",
    ],
    workedExample:
      "Your bike is gone from the rack. You reason: either it was stolen, or a friend borrowed it, or I left it somewhere else. You rule out 'borrowed' (no one has the lock code) and lean toward 'stolen.' Then you stop and check the list for completeness — and remember a fourth option you'd omitted: the building moved bikes during the rack repair you got an email about. You check the relocated rack. There it is. The disjunctive syllogism was running perfectly; it just had the wrong menu, and the answer was an item that was never on it.",
    relatedThinkers: [
      { name: "Chrysippus", note: "Catalogued the disjunctive syllogism among the Stoic indemonstrables in the 3rd c. BCE." },
      { name: "Arthur Conan Doyle", note: "Gave Holmes the popular formulation — eliminate the impossible, and the remainder, however improbable, is the truth." },
      { name: "John Venn", note: "Whose diagrams make vivid the inclusive-vs-exclusive 'or' distinction the rule depends on." },
    ],
    furtherReading: [
      { title: "Stoic Logic", author: "Benson Mates", year: "1953", note: "The scholarly account of Chrysippus's logic and the indemonstrable inference forms." },
      { title: "The Sign of Four", author: "Arthur Conan Doyle", year: "1890", note: "Where Holmes states the elimination principle that dramatizes the rule's appeal and its hazard." },
    ],
    relatedExercises: ['modus-tollens', 'necessary-sufficient', 'reductio'],
    kindredPractices: [
      { name: "Differential diagnosis", note: "Medicine's disciplined version — list the possible causes, then test to eliminate, while guarding against the one you forgot to list." },
      { name: "Process of elimination", note: "The everyday cousin — only as reliable as the completeness of the options you started with." },
    ],
  },

  // ─── Charitable interpretation ─────────────────────────────────────
  'charitable-interpretation': {
    longerAbout:
      "The 'principle of charity' got its name from Neil Wilson in 1959, but its philosophical weight comes from Quine and especially Donald Davidson, who made it a condition of understanding anyone at all. Davidson's argument is radical: to interpret another person's words, you have no choice but to assume they're mostly right and mostly consistent, because an interpretation that made them come out massively false or contradictory would more likely be a bad interpretation than an accurate portrait of a fool. Charity isn't generosity; it's the price of admission to understanding.\n\n" +
      "On the page this becomes a discipline of restraint. Before answering a position, you state it in a form its holder would endorse — not the weakest reading you can plausibly pin on them, but the strongest the words will bear. The test is concrete and unforgiving: would they recognize themselves in your account, and want to add nothing? If not, you're arguing with a figure of your own construction, and any victory is against a phantom.\n\n" +
      "It's worth distinguishing this from its close cousin, steelmanning. Charity is interpretive — get the view they actually hold right. Steelmanning is constructive — build the best version of the view, even past what they said. Charity comes first and is the more basic obligation: you can't responsibly improve an argument you haven't yet understood.",
    commonPitfalls: [
      "Charitable in name only — restating the view in words that secretly smuggle in its weakness ('they basically think feelings beat facts').",
      "Skipping the recognition test. If the holder wouldn't say 'yes, that's it,' you haven't yet earned the right to reply.",
      "Confusing charity with agreement. Interpreting a view at its strongest doesn't commit you to it; it commits you to arguing against the real thing.",
    ],
    workedExample:
      "A relative says they oppose a new bike lane. The uncharitable reading writes itself: 'they don't care about cyclists' safety.' You resist it and restate their actual view: 'You think the lane will remove parking that local shops depend on, and that the city pushed it through without consulting the businesses it affects.' You check — would they endorse that? They do, and add a detail about a specific store. Now you're positioned to respond to a real concern about process and small-business impact, a very different and far more productive conversation than the one you'd have had with the strawman.",
    relatedThinkers: [
      { name: "Donald Davidson", note: "Made charity a precondition of interpretation itself — you can only understand someone by assuming they're mostly right." },
      { name: "W.V.O. Quine", note: "Word and Object grounds the principle in the practical problem of translating an unfamiliar language." },
      { name: "Neil L. Wilson", note: "Coined the phrase 'principle of charity' in 1959." },
    ],
    furtherReading: [
      { title: "Inquiries into Truth and Interpretation", author: "Donald Davidson", year: "1984", note: "The essays where charity becomes a load-bearing part of a theory of meaning." },
      { title: "A Rulebook for Arguments", author: "Anthony Weston", year: "1986", note: "Puts the principle to practical, everyday use for ordinary disagreements." },
    ],
    relatedExercises: ['steelmanning', 'ideological-turing-test', 'concession-and-counter'],
    kindredPractices: [
      { name: "Rapoport's rules", note: "Anatol Rapoport's protocol — restate your target's position so well they thank you, before any criticism." },
      { name: "Active listening", note: "The therapeutic cousin — reflect back what you heard until the other person confirms you've got it." },
    ],
  },

  // ─── Concession-and-counter ────────────────────────────────────────
  'concession-and-counter': {
    longerAbout:
      "Classical rhetoric had a name for granting ground on purpose — concessio — and treated it not as weakness but as a setup. Quintilian, drilling Roman orators in the Institutio Oratoria, taught that conceding the points you can afford to concede earns you the standing to contest the one that matters. An argument that disputes everything signals an opponent who can't be reasoned with; one that concedes the obvious signals one who can.\n\n" +
      "The structure trades on a fact about how people listen. As long as someone feels their valid point hasn't been heard, they spend their attention defending it rather than considering yours. Naming what they've gotten right — genuinely, in terms they'd accept — discharges that defensiveness and frees them to actually weigh the counter. The small but crucial hinge is the connective: 'and also' rather than 'but.' 'But' retroactively cancels the concession ('you're right, BUT' means 'you're not really right'); 'and also' lets the conceded point stand while you add to it.\n\n" +
      "The twentieth century rediscovered this through Carl Rogers. The so-called Rogerian argument, adapted for writing by Young, Becker, and Pike, asks you to restate the opposing view to its holder's satisfaction before advancing your own — the therapist's empathy turned into a rhetorical strategy. It works for the same reason the therapy does: people change their minds in the presence of feeling understood, almost never in its absence.",
    commonPitfalls: [
      "Conceding something trivial or insincere. The concession only works if it's a point you genuinely grant and they genuinely care about.",
      "Using 'but,' which erases the concession. 'And also' keeps the granted point alive while you add the counter.",
      "Rushing past the concession to get to the rebuttal. Let the agreement land fully before you pivot, or it reads as a tactic rather than a recognition.",
    ],
    workedExample:
      "A coworker argues the team should ship the feature now rather than polish it for two more weeks. Instead of opening with the risks (your real position), you start: 'You're right that we've been gold-plating this, and that shipping sooner would get us real user feedback we badly need.' You mean it. Then: 'And also, the data-loss bug in the export flow is the kind of first impression we don't get to retake — so I'd ship this week, but with that one path fixed first.' Because they heard their core point affirmed, they engage with the bug instead of re-litigating the timeline, and you converge on 'ship soon, minus the one landmine' in a fraction of the time.",
    relatedThinkers: [
      { name: "Quintilian", note: "The Institutio Oratoria taught concessio — yielding minor points to win the major one." },
      { name: "Aristotle", note: "The Rhetoric anatomizes how establishing goodwill and common ground precedes effective persuasion." },
      { name: "Carl Rogers", note: "His client-centered method became the 'Rogerian argument' — understand the other side before advancing your own." },
    ],
    furtherReading: [
      { title: "Rhetoric: Discovery and Change", author: "Young, Becker & Pike", year: "1970", note: "The text that turned Rogers's therapeutic empathy into a teachable argumentative method." },
      { title: "Rhetoric", author: "Aristotle", note: "The foundational treatment of persuasion, including the role of common ground and goodwill." },
    ],
    relatedExercises: ['charitable-interpretation', 'reframe-disagreement', 'anticipating-objections'],
    kindredPractices: [
      { name: "Rogerian argument", note: "Restate the opposing position to its holder's satisfaction before making your own case." },
      { name: "'Yes, and' (improv)", note: "The stage discipline of accepting an offer before building on it — the same move, played for invention." },
    ],
  },

  // ─── Ideological Turing test ───────────────────────────────────────
  'ideological-turing-test': {
    longerAbout:
      "The economist Bryan Caplan proposed the test on his blog in 2011, borrowing the frame from Alan Turing. Turing's original imitation game asked whether a machine could converse well enough that a judge couldn't tell it from a human. Caplan's version asks whether you can argue for a view you reject well enough that its actual believers can't tell you're a critic in disguise. Passing means you've understood the position from the inside — not just its claims, but the felt reasons someone holds it.\n\n" +
      "It's the most demanding member of the steelmanning family. Charitable interpretation asks you to get the view right; steelmanning asks you to build its strongest form; the ideological Turing test asks you to inhabit it convincingly enough to be mistaken for a native. That last step exposes a particular kind of ignorance — the comfortable conviction that the other side is simply stupid or wicked, which survives only as long as you never have to reproduce their reasoning in a form they'd applaud.\n\n" +
      "The underlying idea is old. Mill, in On Liberty, warned that 'he who knows only his own side of the case knows little of that' — you don't really understand your own position until you can state the opposing one in its full force. The test makes Mill's warning operational and falsifiable: show your essay to a believer and find out, empirically, whether you understand them or only think you do.",
    commonPitfalls: [
      "Writing a version dripping with tells — the faint sneer, the giveaway caricature — that no actual believer would produce. If they can spot you, you've failed the test by definition.",
      "Capturing the claims but not the motivations. The hardest and most important part is why a reasonable person finds the view compelling, not merely what it asserts.",
      "Picking a view you've never seriously engaged. You can't pass a test on a position you've only met through its opponents.",
    ],
    workedExample:
      "You favor open borders and decide to write the restrictionist essay in the first person. You can list the slogans, but to pass you have to reach the reasons a thoughtful person holds the view: that a wage floor and a welfare state may depend on bounded membership; that communities have a legitimate interest in the pace, not just the fact, of change; that 'the world's poor' is a real moral claim and so is 'my unemployed neighbor.' You show it to a restrictionist friend. They say it sounds like one of them — except you missed the argument about assimilation capacity, which they consider central. You revise. Whatever you now think of the view, you can no longer pretend its holders are simply heartless, because you just made their case in a form they signed off on.",
    relatedThinkers: [
      { name: "Bryan Caplan", note: "Coined the 'ideological Turing test' in 2011, adapting Turing's imitation game to belief." },
      { name: "Alan Turing", note: "His 1950 imitation game is the original — indistinguishability as the test of a capacity." },
      { name: "John Stuart Mill", note: "On Liberty Ch. 2: knowing only your own side of an argument is barely knowing it at all." },
    ],
    furtherReading: [
      { title: "On Liberty", author: "John Stuart Mill", year: "1859", note: "Chapter 2 is the classical argument for why you must be able to state the other side." },
      { title: "The Scout Mindset", author: "Julia Galef", year: "2021", note: "A modern treatment of the habits — including this test — that keep reasoning honest." },
    ],
    relatedExercises: ['steelmanning', 'charitable-interpretation', 'switch-sides'],
    kindredPractices: [
      { name: "Devil's advocate", note: "The lighter, looser cousin — argue the other side once, without the bar of fooling a believer." },
      { name: "Red team", note: "The institutional form — a group tasked with making the adversary's case as convincingly as possible." },
    ],
  },

  // ─── Reframing the disagreement ────────────────────────────────────
  'reframe-disagreement': {
    longerAbout:
      "A great deal of conflict is two people defending positions when the real disagreement is about something underneath them. The canonical naming comes from Roger Fisher and William Ury's Getting to Yes, the 1981 book from the Harvard Negotiation Project: separate positions (what each side says it wants) from interests (why they want it). Two siblings fight over an orange and split it in half — only to discover one wanted the juice and the other the peel for baking. The position was 'the orange'; the interests were never actually in conflict.\n\n" +
      "Therapy arrived at the same insight from a different door. Couples researchers like John Gottman observe that the surface argument — about dishes, money, the in-laws — is frequently a proxy for a deeper unmet need about respect, security, or being known. Sue Johnson's emotionally-focused therapy treats the recurring fight as a clue: the content keeps changing but the underlying bid stays the same, and resolving the content never helps because the content was never the problem.\n\n" +
      "The practice borrows the move from both traditions. Instead of pressing your position harder, you ask what would have to be true for it to be right — surfacing the value or experience feeding it — and do the same for the other side. Sometimes the underlying interests turn out to be compatible all along, and the fight dissolves. Sometimes they're genuinely opposed, and you've at least traded a confused argument for an honest one.",
    commonPitfalls: [
      "Reframing as a tactic to win rather than to understand. If you're hunting the deeper level only to outflank them, people feel it, and it backfires.",
      "Assuming the deeper disagreement is always resolvable. Sometimes the surface fight hides a real clash of values; naming it honestly is still progress, even without resolution.",
      "Diagnosing only their underlying interest, not your own. The move requires excavating both sides, including the value you hadn't noticed you were defending.",
    ],
    workedExample:
      "You and your partner keep fighting about how much to spend on a vacation. The surface positions: you say 'too expensive,' they say 'we deserve it.' You ask what's underneath. For you: a deep need for a financial cushion, rooted in a childhood where money was precarious. For them: a need to feel the relationship still makes room for joy, not just obligations. Named that way, the disagreement isn't about the trip's price at all — it's security versus aliveness, two values you both actually share. The conversation that was supposed to happen ('how do we honor both?') replaces the one you kept having ('is $2,000 too much?'), and the budget sorts itself out once the real thing is on the table.",
    relatedThinkers: [
      { name: "Fisher & Ury", note: "Getting to Yes drew the foundational distinction between positions and underlying interests." },
      { name: "John Gottman", note: "His couples research shows the surface fight is usually a proxy for a deeper, recurring need." },
      { name: "Sue Johnson", note: "Emotionally-focused therapy treats the repeating argument as a signal of an unmet attachment bid." },
    ],
    furtherReading: [
      { title: "Getting to Yes", author: "Roger Fisher & William Ury", year: "1981", note: "The negotiation classic; 'focus on interests, not positions' is its central move." },
      { title: "Difficult Conversations", author: "Stone, Patton & Heen", year: "1999", note: "The Harvard Negotiation Project's guide to finding the real conversation beneath the surface one." },
    ],
    relatedExercises: ['concession-and-counter', 'charitable-interpretation', 'switch-sides'],
    kindredPractices: [
      { name: "Double crux", note: "Find the single underlying belief that, if it flipped, would change each side's conclusion — then argue about that." },
      { name: "Interests, not positions", note: "The negotiator's habit of asking 'why do they want this?' instead of bargaining over the stated demand." },
    ],
  },

  // ─── Stoic preview ─────────────────────────────────────────────────
  'stoic-preview': {
    longerAbout:
      "Premeditatio malorum — the premeditation of evils — was a daily Stoic discipline, and the conversational version simply points it at a hard talk you're about to have. Seneca recommended rehearsing exile, loss, and death in advance so that, when they came, they arrived as expected guests rather than ambushes: 'the unexpected blow falls heaviest.' Epictetus, in the Enchiridion, told his students to rehearse the disturbance before the event — to picture the crowded baths, the jostling, the theft, and to decide who they'd be in it beforehand.\n\n" +
      "Applied to a confrontation, the move is to imagine, vividly and concretely, the version where it goes badly: the raised voice, the cruelest thing they might say, the moment your own composure could break. The aim isn't to frighten yourself but to rob those moments of their surprise. Surprise is what hijacks us; a sharp remark you've already lived through in imagination lands with a fraction of its force, leaving you free to respond as the person you decided to be rather than the one the moment provokes.\n\n" +
      "The discipline has a modern, evidence-backed cousin. Gabriele Oettingen's research on 'mental contrasting' found that pairing a wished-for outcome with vivid anticipation of the obstacles in the way produces far better follow-through than positive visualization alone. Picturing the hard parts, it turns out, isn't pessimism — it's preparation, and the Stoics had the mechanism two thousand years before the studies confirmed it.",
    commonPitfalls: [
      "Letting the rehearsal curdle into dread. The point is preparation, not anticipatory suffering — visualize the bad outcome, then deliberately turn to how you'd want to meet it.",
      "Imagining the worst but skipping the response. Half the exercise is deciding, in advance, who you want to be in the hard moment.",
      "Mistaking vivid fear for accurate prediction. The worst case is usually less likely than it feels; rehearsing it prepares you without committing you to expect it.",
    ],
    workedExample:
      "You have to tell a friend you can't lend them money again. You spend three minutes on the bad version: their face falling, the accusation that you don't really care, the silence after. Then three minutes on the response: you decide that even if they're hurt, you want to stay warm and clear, neither defensive nor cold. Two minutes naming the stake: you want to keep the friendship and keep the boundary, and you'd accept some temporary hurt to do both. When the conversation comes and they do say something sharp, you notice it land softly — you've already met this moment in rehearsal, so instead of snapping back you say the warm, clear thing you'd chosen. The preparation didn't prevent the hard moment; it changed who showed up for it.",
    relatedThinkers: [
      { name: "Seneca", note: "Urged daily premeditatio malorum — rehearse misfortune so it can't ambush you; 'the unexpected blow falls heaviest.'" },
      { name: "Epictetus", note: "The Enchiridion advises rehearsing a disturbance, and your intended response, before the event." },
      { name: "Gabriele Oettingen", note: "Her 'mental contrasting' research shows that vividly anticipating obstacles improves follow-through." },
    ],
    furtherReading: [
      { title: "Letters from a Stoic", author: "Seneca", note: "Letters 91 and 107 lay out the premeditation of misfortune in Seneca's own voice." },
      { title: "Rethinking Positive Thinking", author: "Gabriele Oettingen", year: "2014", note: "The empirical case that imagining obstacles beats imagining success." },
    ],
    relatedExercises: ['negative-visualization', 'premortem', 'anticipating-objections'],
    kindredPractices: [
      { name: "Premortem", note: "The project version of the same logic — imagine the plan has already failed, then trace why." },
      { name: "Mental contrasting (WOOP)", note: "Oettingen's protocol: Wish, Outcome, Obstacle, Plan — pair the goal with its likely obstacles." },
    ],
  },

  // ─── The ten-word version ──────────────────────────────────────────
  'ten-word-version': {
    longerAbout:
      "Compression has always been the test prose hides from. Blaise Pascal apologized in a 1657 letter that he'd made it longer than usual only because he 'had not the time to make it shorter' — the joke being that brevity is the expensive thing, the product of more work, not less. The precis, a standard exercise in classical and Anglo-American education, drilled exactly this: reduce a passage to a fraction of its length while keeping its argument intact, and discover how much was scaffolding.\n\n" +
      "The newsroom made a craft of it. The inverted pyramid puts the irreducible claim in the first sentence — the 'lede' — on the theory that everything after it is elaboration a hurried reader can drop. Strunk and White compressed the whole ethic into three words, 'omit needless words,' and Hemingway's 'iceberg theory' pushed further: most of a piece's substance should sit below the surface, the visible tenth carrying the weight precisely because the rest has been cut.\n\n" +
      "What the ten-word constraint does that gentle editing doesn't is make hiding impossible. Qualifications, hedges, and rhetorical throat-clearing are the first to go, and what's left is the actual claim, stripped of its protective padding. If that bare claim sounds trivial, you were padding a platitude; if it sounds wrong, the qualifications were doing more than refine the argument — they were concealing that you didn't quite believe it.",
    commonPitfalls: [
      "Cheating the count with hyphenates and clauses to smuggle the hedges back in. The constraint only works if you actually obey it.",
      "Mistaking a hard-to-compress idea for a deep one. Some ideas resist ten words because they're genuinely complex; many resist because they're muddled. Be honest about which.",
      "Stopping at the brutal version. The ten-word cut is a diagnostic, not the final draft — learn what's load-bearing, then restore only the qualifications that earn their place.",
    ],
    workedExample:
      "You've written a long, hedged paragraph arguing for remote work. The ten-word version: 'Trust people to work where they focus; measure output, not presence.' Read aloud, it's clear and defensible — the compression confirms there's a real claim under the padding. You try a different paragraph, your case against a colleague's proposal, and the ten-word version comes out as 'Their plan is risky and we should probably be careful' — which, stripped of its qualifications, reveals itself as content-free caution dressed up as analysis. The first argument survived the cut; the second didn't, and now you know which of your two paragraphs was actually saying something.",
    relatedThinkers: [
      { name: "Blaise Pascal", note: "Source of the 'I would have written a shorter letter if I'd had the time' insight (Lettres Provinciales, 1657)." },
      { name: "Strunk & White", note: "The Elements of Style distilled the ethic to 'omit needless words.'" },
      { name: "Ernest Hemingway", note: "His 'iceberg theory' — most of the meaning carried by what's left out — is compression as an aesthetic." },
    ],
    furtherReading: [
      { title: "The Elements of Style", author: "Strunk & White", year: "1959", note: "The slim classic on cutting everything that isn't doing work." },
      { title: "Politics and the English Language", author: "George Orwell", year: "1946", note: "Orwell's rules for concision and against the padding that hides empty thought." },
    ],
    relatedExercises: ['translation-under-constraint', 'sixty-second-case', 'argument-map'],
    kindredPractices: [
      { name: "Elevator pitch", note: "The business version — the whole case in the time between floors." },
      { name: "BLUF (bottom line up front)", note: "The military and email convention of leading with the conclusion, then supporting it." },
    ],
  },
};
