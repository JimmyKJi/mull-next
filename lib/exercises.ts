// Philosophical exercises — three categories:
//   - Contemplative: introspective practices (Stoic, Buddhist, monastic).
//   - Logic: structured reasoning / puzzle-solving exercises.
//   - Argument: practical practice in forming and delivering arguments.
//
// The exercises are static for now (no DB). When the page evolves to track
// completion / let users save reflections, that storage layer goes in a
// separate migration.

export type ExerciseCategory = 'contemplative' | 'logic' | 'argument';

export const CATEGORY_META: Record<ExerciseCategory, { label: string; blurb: string; accent: string }> = {
  contemplative: {
    label: 'Contemplative',
    blurb: 'Introspective practices drawn from the Stoic, Buddhist, and monastic traditions. Short, structured, deliberately quiet.',
    accent: '#2F5D5C',
  },
  logic: {
    label: 'Logic',
    blurb: 'Sharpen the moves themselves: spot fallacies, structure inferences, pressure-test your own reasoning.',
    accent: '#1E3A5F',
  },
  argument: {
    label: 'Argument',
    blurb: 'Practical exercises in forming, delivering, and defending arguments — what philosophers actually do with each other.',
    accent: '#7A2E2E',
  },
};

export type Exercise = {
  slug: string;
  category: ExerciseCategory;
  name: string;
  summary: string;
  tradition: string;
  duration: string;       // free-form, e.g. "5–10 min"
  about: string;          // 2–3 paragraphs
  steps: string[];        // numbered steps
  reflection: string;     // a closing prompt to consider after
};

export const EXERCISES: Exercise[] = [
  {
    slug: 'premortem',
    category: 'contemplative',
    name: 'Premortem',
    summary: 'Imagine the failure of your plan in vivid detail before you start.',
    tradition: 'Stoic / decision theory (Gary Klein, after Seneca)',
    duration: '10–15 min',
    about:
      "A premortem is the inverse of a postmortem. Instead of asking after the fact why something went wrong, you imagine the failure first — concretely, six months from now — and reverse-engineer what led there. " +
      "The Stoics did a version of this every morning: visualize the day's possible disasters, not to wallow, but to rob them of surprise. Modern decision research (Klein, Kahneman) finds that prospective hindsight raises the accuracy of failure prediction by about 30%.",
    steps: [
      "Pick a real plan you're about to commit to. Big or small — a project, a conversation, a purchase.",
      "Imagine it's six months later. The plan failed. Not catastrophically, just clearly.",
      "Write 5–10 specific reasons it failed. Not platitudes ('I lost focus') — concrete causes ('I underestimated how long the legal review would take').",
      "For each reason, ask: what could I do now that would meaningfully reduce that risk?",
      "Update the plan with the top two or three changes. Discard the rest if they'd cost more than the risk justifies.",
    ],
    reflection: "Which failure mode were you least willing to imagine? What does that tell you about where you're least honest with yourself?",
  },
  {
    slug: 'negative-visualization',
    category: 'contemplative',
    name: 'Negative visualization',
    summary: "Imagine losing what you have, briefly and concretely, to remember it's a gift.",
    tradition: 'Stoic (Marcus Aurelius, Epictetus, Seneca)',
    duration: '5–10 min',
    about:
      "The Stoics called this premeditatio malorum — premeditation of evils. Counterintuitively, they didn't practice it to be morbid. They practiced it because we acclimate. The wonder of being alive, of having coffee, of having someone who texts you back — all of it fades into background unless you periodically remember it could be otherwise. " +
      "Negative visualization is a kind of artificial scarcity. You hold the loss in your mind for one minute, then let it go, and the thing in front of you looks brighter for a few hours.",
    steps: [
      'Pick something or someone present in your life right now. Specific, not abstract.',
      "Imagine vividly that it's gone. Not hypothetically — concretely. The empty chair, the silence, the missing routine.",
      'Sit with the loss for about a minute. Let yourself feel the weight of it.',
      "Now return to the present. The thing is still there. Notice that it didn't have to be.",
      "Optional: write one line about what you'd want to remember about it that you'd otherwise forget.",
    ],
    reflection: "What did you notice about the thing once you 'got it back'? Anything you've been taking for granted?",
  },
  {
    slug: 'socratic-self-questioning',
    category: 'contemplative',
    name: 'Socratic self-questioning',
    summary: "Take one strongly-held belief and walk it through five 'why' questions.",
    tradition: 'Socratic (Plato\'s dialogues)',
    duration: '15–25 min',
    about:
      "Socrates' method wasn't lecture; it was questioning, especially of people who thought they already understood. The point wasn't to humiliate but to surface the gap between what we say we believe and what we can actually defend. " +
      "Done on yourself, this is uncomfortable in a useful way. Most strong beliefs unravel after three or four 'whys'. The ones that don't unravel — those are the ones to take seriously.",
    steps: [
      "Pick a belief you hold strongly. Political, ethical, personal — anything where you'd push back if challenged.",
      "Write it down in a single sentence. Be precise.",
      "Ask: Why do I believe this? Write a one-sentence answer.",
      "Ask the same question of that answer. And of that one. Five times total.",
      "On the fifth answer, look back at the first. Is your foundation what you thought it was?",
    ],
    reflection: "If your belief held up, can you describe more precisely what makes it true? If it didn't, what's the new shape of the belief you actually hold?",
  },
  {
    slug: 'view-from-above',
    category: 'contemplative',
    name: 'View from above',
    summary: "Mentally zoom out — your city, your country, the planet — and look back at your day.",
    tradition: 'Stoic (Marcus Aurelius)',
    duration: '5 min',
    about:
      "Marcus Aurelius did this in the Meditations: imagining himself rising up, seeing the whole human business from cosmic distance, then returning. The point isn't to belittle your problems — it's to put them next to a larger frame so you can see them more accurately. " +
      "What looked like a wall at eye level often becomes a small detail when you can see the whole map.",
    steps: [
      "Sit with whatever's preoccupying you. Hold it in mind clearly.",
      "Now imagine yourself rising slowly. The room. The building. Your neighborhood, your city, your country, the curve of the earth.",
      "From that height, look back down. Pick out the version of you who's worried about this thing. Watch them.",
      "Ask: from up here, how big does the problem look? Is it the size you thought?",
      'Come back down slowly. Notice anything that shifted on the way back.',
    ],
    reflection: "What looks different now? What stayed exactly as urgent as it was?",
  },
  {
    slug: 'examen',
    category: 'contemplative',
    name: 'The Examen',
    summary: 'Five-step Ignatian end-of-day review — what was given, what was missed, what to take into tomorrow.',
    tradition: 'Ignatian (Jesuit, but works secular)',
    duration: '10–15 min',
    about:
      "Ignatius of Loyola asked his Jesuits to do this twice a day. It survived 500 years because it works on its own terms even if you strip out the theology. " +
      "The Examen is a structured noticing. It's not a journal entry, it's a five-step inventory you do in your head or in a few sentences — gratitude, awareness, response, what to repent, what to ask for tomorrow.",
    steps: [
      "Become aware of where you are. A breath. Settle.",
      "Gratitude: what came to you today that wasn't owed? Name it specifically. Three things if you can.",
      "Review the day in scenes. Walk through it from waking to now. Where did you feel alive? Where did you feel hollow? Don't analyze — just notice.",
      "Where did you fall short of who you want to be? Don't berate. Just notice the gap between intention and act.",
      "Look toward tomorrow. What's one thing you'd want to bring different attention to? Hold it lightly.",
    ],
    reflection: "Are there patterns across multiple days' Examens? What do they suggest you actually care about — versus what you say you care about?",
  },
  {
    slug: 'memento-mori',
    category: 'contemplative',
    name: 'Memento mori',
    summary: 'A short, deliberate confrontation with mortality. Clarifying.',
    tradition: 'Stoic, Buddhist, monastic Christian',
    duration: '5–10 min',
    about:
      "Almost every contemplative tradition has some version of this practice. The Stoics carried small reminders. Buddhist monks meditate on corpses. Medieval Christian orders kept skulls on their desks. The intention isn't morbidity — it's clarification. " +
      "We choose differently when we briefly remember that we are temporary. Not in despair, but in alignment: we stop spending our hours on things that, sub specie aeternitatis, we don't actually care about.",
    steps: [
      "Get somewhere quiet. Set a timer for 5 minutes.",
      "Close your eyes. Acknowledge plainly that one day you will die. No one is exempt.",
      "Imagine — without melodrama — your last day. Who would you want near you? What would you want to be doing?",
      "Now think of today. What's the gap between how you spent today and how you'd spend that last day?",
      "When the timer goes, open your eyes. Don't try to do anything with the answer right away. Just notice it.",
    ],
    reflection: "What's one small thing you'd shift in tomorrow's plan if you took today's answer seriously?",
  },

  // ─────────────────── LOGIC ─────────────────────────────────────────
  {
    slug: 'fallacy-hunt',
    category: 'logic',
    name: 'Fallacy hunt',
    summary: 'Pick a real argument from the wild and find three reasoning errors in it.',
    tradition: 'Critical thinking (Aristotelian fallacy taxonomy onward)',
    duration: '15–25 min',
    about:
      "Most everyday arguments contain at least one fallacy. The skill isn't memorizing the names of fallacies; it's learning to feel the wrongness of a move and then identifying which standard distortion is happening. " +
      "Pick a piece of real-world rhetoric (an op-ed, a Twitter thread, a politician's speech, a sales pitch). Read it carefully. Find three places where the reasoning, not just the conclusion, is broken.",
    steps: [
      "Find a piece of rhetoric. About 500–1500 words. Something from outside your bubble is best — easier to see fallacies that don't flatter you.",
      "Read it once for the gist. What's the conclusion the author wants you to land on?",
      "Read it a second time, hunting. Mark three sentences where the author moves from premise to conclusion in a way that doesn't actually support the move.",
      "For each, write a one-line description of what's wrong. Optional: name the fallacy (ad hominem? appeal to consequences? false dichotomy? motte-and-bailey?). Don't worry about getting the name right — describe the move.",
      "Now flip: pick a piece of rhetoric you AGREE with. Find three fallacies there too. (This is the harder half of the exercise.)",
    ],
    reflection: "Was finding fallacies in the side you agreed with measurably harder? What does that suggest about how you read on a normal day?",
  },
  {
    slug: 'steelmanning',
    category: 'logic',
    name: 'Steelmanning the opposite',
    summary: 'Write the strongest possible version of the view you most reject.',
    tradition: 'Analytic philosophy (Daniel Dennett, after the principle of charity)',
    duration: '20–40 min',
    about:
      "A strawman is a deliberately weak version of an opposing view, made easy to knock down. A steelman is the opposite: the strongest version, articulated as well as the smartest defender of that view would. " +
      "The discipline of steelmanning is the closest thing intellectual life has to a fitness test. If you can't write a steelman of your opponent's view that they would recognize as fair, you don't actually understand their position — you're arguing against a phantom of your own making.",
    steps: [
      "Pick a view you reject — political, ethical, religious, methodological. Pick something that genuinely irritates you.",
      "Imagine the most thoughtful person who holds this view. What life experience would have led them there?",
      "Write 250 words defending the view in the first person, as if you held it. Use the strongest arguments and evidence available, not the embarrassing ones.",
      "Now ask: is there any part of this steelman that, if you're honest, you find more compelling than you'd previously admitted?",
      "Optional: send the steelman to someone who actually holds the view. Ask if you got it right.",
    ],
    reflection: "Did anything in writing the steelman shift your confidence in your own position — even slightly? Where did the resistance come from when it did?",
  },
  {
    slug: 'counterexample-drill',
    category: 'logic',
    name: 'Counterexample drill',
    summary: 'Try to break a moral rule with a single concrete case.',
    tradition: 'Analytic ethics (the trolley-problem tradition)',
    duration: '15–20 min',
    about:
      "Moral rules — 'never lie', 'always maximize welfare', 'don't kill' — are easy to articulate and very hard to defend. The standard analytic move is to pose a single counterexample sharp enough to make the holder of the rule either revise or abandon it. " +
      "This exercise puts you on both sides: you propose a rule, then attack it.",
    steps: [
      "State a moral rule you actually believe. Write it in one clean sentence. ('It's wrong to lie.' 'You should help strangers in need if it costs you little.')",
      "Imagine three concrete cases where following the rule would lead to a clearly bad outcome, OR breaking it would lead to a clearly good one.",
      "Pick the case that bites hardest. Could you bite the bullet and say: yes, even here, follow the rule?",
      "If yes — what does the rule actually depend on? You've found the deeper principle.",
      "If no — rewrite the rule with the right exception or qualification. Then attack the new rule the same way.",
    ],
    reflection: "After three rounds of attack-and-revise, what does the rule look like? Is it still useful as a guide, or has it become a hedge?",
  },
  {
    slug: 'argument-map',
    category: 'logic',
    name: 'Argument mapping',
    summary: 'Draw the structure of an argument as boxes and arrows. See its load-bearing walls.',
    tradition: 'Informal logic, critical thinking pedagogy',
    duration: '20–30 min',
    about:
      "Most arguments arrive in prose — long sentences with implicit moves between them. An argument map makes the moves explicit: each premise is a node, each inference an arrow. The result looks like an electrical schematic. Its great virtue is that it forces you to identify which premises are actually doing the work versus which are just decoration. " +
      "You don't need software. Pen and paper is fine. The skill carries over to your own arguments — once you can map other people's, you start writing yours with the map in mind.",
    steps: [
      "Find an argument: a paragraph, an essay section, an opinion piece. ~300–800 words.",
      "Identify the conclusion. Write it at the bottom of a page in a box.",
      "Identify the premises that directly support the conclusion. Boxes above, arrows down.",
      "For each premise, ask: what supports THIS? Add another row of boxes if needed. Stop when you reach claims you'd accept without support.",
      "Look at the map. Which premise, if attacked, would collapse the most of the structure? That's the argument's load-bearing wall.",
    ],
    reflection: "Was the load-bearing premise the one the author spent the most time defending? Or one they slipped past quickly?",
  },
  {
    slug: 'reductio',
    category: 'logic',
    name: 'Reductio ad absurdum',
    summary: 'Take a claim seriously, run it to its logical limit, see if you still believe it.',
    tradition: 'Greek (Zeno, Plato), surviving across all of analytic philosophy',
    duration: '15–25 min',
    about:
      "The reductio is one of the oldest moves in philosophy: assume the position is true, follow its consequences without flinching, and see whether the result is something you can accept. If not, the original position was wrong somewhere. " +
      "It's powerful because it doesn't require you to argue against the position directly — you just take it more seriously than its holder did.",
    steps: [
      "Pick a claim you have mixed feelings about, or one widely held that you suspect is sloppy.",
      "Assume it's true, fully and consistently. No exceptions.",
      "Now ask: what else would have to be true if this claim were true? Write down three or four implications. Push them to their concrete consequences.",
      "Look at those implications. Are any of them clearly absurd, monstrous, or just embarrassing?",
      "If yes, the original claim needs revision — figure out where the move into absurdity happened. If no, you've taken the claim more seriously than most of its proponents have, and earned more confidence in it.",
    ],
    reflection: "Where in the chain of consequences did you most want to flinch and add a hedge? That's the place to investigate next.",
  },

  // ─────────────────── ARGUMENT ──────────────────────────────────────
  {
    slug: 'sixty-second-case',
    category: 'argument',
    name: 'The 60-second case',
    summary: 'Compress your argument until 60 seconds is enough.',
    tradition: 'Rhetoric (think the elevator pitch, but slower)',
    duration: '15–25 min',
    about:
      "If you can't make your case in 60 seconds, you probably don't yet know what your case is. Compressing forces you to identify the load-bearing premise, the cleanest example, and the conclusion — and to throw out everything that wasn't actually doing work. " +
      "The exercise is uncomfortable. Most arguments hide their weakness in volume.",
    steps: [
      "Pick a position you actually hold strongly. Something a thoughtful friend disagrees with.",
      "Write a 5-minute version. Stretch it out — every nuance, every example, every objection-and-response.",
      "Now compress to 2 minutes. Cut the weakest material first. Keep what's load-bearing.",
      "Now compress to 60 seconds. Read it aloud and time yourself. If you go over, cut more.",
      "Read the 60-second version against the 5-minute one. What did you cut that you'd actually defend if asked?",
    ],
    reflection: "Was the most-cut material the part you find most personally important — or the part that's actually weakest?",
  },
  {
    slug: 'anticipating-objections',
    category: 'argument',
    name: 'Anticipating objections',
    summary: 'For every position, list the three strongest objections — then answer them.',
    tradition: 'Aquinas (Summa structure: objection, sed contra, response)',
    duration: '20–35 min',
    about:
      "Aquinas wrote his Summa as objections-first: he stated the strongest case against each of his positions before defending them. The result was that anyone reading him couldn't accuse him of ignoring the difficulty. " +
      "The same move works in any argument you're preparing — a paper, a conversation, a pitch. List three objections, name the smartest people who would make each, then answer.",
    steps: [
      "Pick a claim you're going to argue. Something specific enough to be wrong.",
      "Write three objections to it, in the strongest form you can muster (you've already practiced steelmanning).",
      "For each objection, name a real or imagined person who'd press it. Make them specific — a thoughtful skeptic, not a strawman.",
      "Write a one-paragraph response to each. Be honest if part of the objection lands; concede the part that's right and defend the part that isn't.",
      "Read all three responses together. Is your overall position more nuanced now? Better-defined? Or did you just apologize and run?",
    ],
    reflection: "Which objection did you find hardest to answer cleanly? That's where your view is weakest — and possibly where it's interesting.",
  },
  {
    slug: 'translation-under-constraint',
    category: 'argument',
    name: 'Translation under constraint',
    summary: 'Rephrase a complex argument for a 12-year-old, then for a skeptic, then for an adversary.',
    tradition: 'Pedagogy + rhetoric (Feynman technique generalized)',
    duration: '20–30 min',
    about:
      "If you can only present one version of your argument, you're at the mercy of whether your audience happens to be the one you wrote for. Translating for different audiences forces you to identify the core, the metaphors, and the bits that only worked for the original audience. " +
      "It's also an honesty test: jargon often hides confusion. Putting it in a 12-year-old's vocabulary tells you whether you actually understood it.",
    steps: [
      "Pick a position you'd want to defend — something with a few moving parts.",
      "Write the original version. Use the vocabulary that comes naturally.",
      "Translate it for an intelligent, curious 12-year-old. No jargon, no name-dropping, no appeals to authority.",
      "Translate again for a skeptic — someone who's read more than you and disagrees. Compress, anticipate.",
      "Translate one more time for an adversary — someone who'd love to see you fail. Where do they hit hardest? Build that response into the argument itself.",
    ],
    reflection: "Did the 12-year-old version reveal anything you couldn't actually explain? That's where your understanding has a hole.",
  },
  {
    slug: 'dialectical-loop',
    category: 'argument',
    name: 'Dialectical loop',
    summary: "Thesis → strongest antithesis → synthesis. Hegel's move, made walkable.",
    tradition: 'Hegelian dialectic, refined by Marx and many others',
    duration: '25–40 min',
    about:
      "The dialectical move: every position contains the seeds of its own opposite. You make a thesis. You then articulate not just an objection to it, but the position that flips it — the antithesis. The synthesis isn't a compromise; it's the third position that emerges when you take both seriously and notice they were both responding to something deeper. " +
      "The loop is iterative. Each synthesis becomes a new thesis. You're not trying to reach a final answer — you're using the structure to keep moving toward one.",
    steps: [
      "State your thesis. One clean sentence. (Not 'maybe X' — actually X.)",
      "Now state the antithesis. Not just the negation — the position that genuinely opposes yours from a different starting point.",
      "What does each position assume that the other denies? Surface the buried premise.",
      "Now write a synthesis: a position that takes seriously what each was responding to, while denying neither's core insight. Don't split the difference — find the third place.",
      "Treat the synthesis as a new thesis. What's its antithesis? Run the loop a second time. The third position is usually deeper than the first.",
    ],
    reflection: "Did the synthesis feel like a compromise or a discovery? If compromise, you didn't push the antithesis hard enough.",
  },
  {
    slug: 'switch-sides',
    category: 'argument',
    name: 'Switch sides',
    summary: 'Argue both sides of a debate, alternating, until you no longer know which side you started on.',
    tradition: 'Sophistic / dialectical (Protagoras, antilogic)',
    duration: '30–45 min',
    about:
      "Protagoras taught that on every question there are two sides equally arguable. He didn't mean this as cynicism — he meant it as a discipline. The skill of arguing well from any side is what frees you from being captured by the side you happened to start on. " +
      "It's a real exercise. Pick a question, find a partner (or do it alone with timer + journal), and switch sides every two minutes for half an hour. By the end you've made every argument available to either side.",
    steps: [
      "Pick a question with two real positions — debatable, contested, both with strong defenders.",
      "Decide which side you'll start on (flip a coin if you don't know).",
      "Argue that side for 2 minutes — out loud, or in writing, your strongest case.",
      "Switch. Argue the other side for 2 minutes. Don't repeat what you've already argued.",
      "Keep switching every 2 minutes until both sides are exhausted. Then sit and notice: which side did you find harder to argue? Which felt more natural? Did you discover an argument on either side that you hadn't considered before?",
    ],
    reflection: "Where in the exercise did you genuinely change your mind, even briefly? Could you stay there?",
  },
];

export function findExercise(slug: string): Exercise | null {
  return EXERCISES.find(e => e.slug === slug) || null;
}

export function exercisesByCategory(category: ExerciseCategory): Exercise[] {
  return EXERCISES.filter(e => e.category === category);
}
