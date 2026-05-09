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
};
