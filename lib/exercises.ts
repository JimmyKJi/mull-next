// Philosophical exercises — three categories:
//   - Contemplative: introspective practices (Stoic, Buddhist, monastic).
//   - Logic: structured reasoning / puzzle-solving exercises.
//   - Argument: practical practice in forming and delivering arguments.
//
// The exercises are static for now (no DB). When the page evolves to track
// completion / let users save reflections, that storage layer goes in a
// separate migration.

import type { DimKey } from './dimensions';

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
  /** The 16-D dimensions this practice most works/embodies — grounded in
   *  its tradition + mechanism (a Stoic memento mori sits on TV/AT/MR; a
   *  fallacy hunt on SR/TR/TD). Mirrors Topic.relevantDimensions, and lets
   *  rankByDimensionFocus surface "the practice for where you stand" on the
   *  /exercises featured slot. Keep to 2–3 — the dims that genuinely
   *  characterize the practice, not every axis it brushes. */
  relevantDimensions: DimKey[];
};

export const EXERCISES: Exercise[] = [
  {
    slug: 'premortem',
    relevantDimensions: ['TV', 'PO', 'TR'],
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
    relevantDimensions: ['TV', 'AT', 'VA'],
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
    relevantDimensions: ['SR', 'TR', 'SS'],
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
    relevantDimensions: ['MR', 'SI', 'TV'],
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
    relevantDimensions: ['AT', 'RT', 'SS'],
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
    relevantDimensions: ['TV', 'AT', 'MR'],
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
    relevantDimensions: ['SR', 'TR', 'TD'],
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
    relevantDimensions: ['TR', 'UI', 'SR'],
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
    relevantDimensions: ['TR', 'SR', 'UI'],
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
    relevantDimensions: ['TR', 'TD', 'SR'],
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
    relevantDimensions: ['TR', 'TD', 'SR'],
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
    relevantDimensions: ['TR', 'SS', 'PO'],
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
    relevantDimensions: ['TR', 'SR', 'RT'],
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
    relevantDimensions: ['TR', 'CE', 'PO'],
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
    relevantDimensions: ['TD', 'TR', 'SR'],
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
    relevantDimensions: ['SR', 'TR', 'UI'],
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

  // ─── Expansion batch (2026-05-26): 20 new exercises ────────────

  // ── Contemplative (7) ─────────────────────────────────────────
  {
    slug: 'morning-intention',
    relevantDimensions: ['AT', 'SS', 'PO'],
    category: 'contemplative',
    name: 'Morning intention',
    summary: 'Begin the day by naming what you\'re bringing to it, not what you want from it.',
    tradition: 'Stoic',
    duration: '3–5 min',
    about: "Marcus Aurelius opened his Meditations with what amounts to morning intentions: 'Today I shall be meeting with interference, ingratitude, insolence, disloyalty…' This isn't pessimism — it's preparation. Setting an intention isn't fixing the day's outcomes; it's choosing the stance you'll meet whatever comes with.\n\nThe version that works avoids two failure modes: vague aspirations ('be present today') don't survive contact with the morning email, and outcome goals ('finish the proposal') mistake productivity for character. The intention to set is about HOW you'll show up, not WHAT you'll accomplish.",
    steps: [
      "Within five minutes of waking, before phone or news, sit with a notebook.",
      "Write the date.",
      "Write one sentence: 'Today I want to bring ___ to whatever happens.' Fill the blank with a quality — patience, honesty, attention, lightness, refusal-to-be-rushed — that's actually within your control.",
      "Write one likely friction the day will bring (a meeting, a person, a task you've been avoiding) and how the intention would meet it.",
      "Carry the notebook with you. Reread the line at lunch.",
    ],
    reflection: "Did the intention survive the day? Where did you forget it? What would let you remember sooner next time?",
  },
  {
    slug: 'three-line-evening',
    relevantDimensions: ['AT', 'SS', 'PO'],
    category: 'contemplative',
    name: 'Three-line evening',
    summary: 'A nightly review compressed to its three honest sentences.',
    tradition: 'Stoic (modern compression)',
    duration: '2–3 min',
    about: "Long journals defeat their purpose for most people — they demand a daily commitment too big to sustain. Three lines is the minimum dose that actually carries the practice: short enough to do tired, long enough to land.\n\nThe structure: one line on what went well, one line on what went badly, one line on what you'd choose differently tomorrow. The discipline is the brevity. You don't get to over-explain. The compression forces honesty.",
    steps: [
      "Before bed, in a notebook (paper, not phone — the phone leads elsewhere).",
      "Line 1: 'Today went well when ___.' One specific moment. Not the day as a whole.",
      "Line 2: 'Today went badly when ___.' Same: specific moment, not category.",
      "Line 3: 'Tomorrow I'd choose differently if ___.' One concrete preparation, action, or reframe.",
      "Close the notebook. Don't reread. The point is the writing, not the archive.",
    ],
    reflection: "After a week, reread the lines together. What pattern do you see? What's the same person across all seven?",
  },
  {
    slug: 'loving-kindness',
    relevantDimensions: ['CE', 'MR', 'UI'],
    category: 'contemplative',
    name: 'Metta (loving-kindness)',
    summary: 'Buddhist practice for extending warmth — first to yourself, then outward in widening circles.',
    tradition: 'Theravada Buddhist (with modern adaptations)',
    duration: '8–15 min',
    about: "Metta meditation is the Buddhist discipline of training the felt sense of goodwill. It's structured because the structure helps — and because the structure surfaces where the goodwill snags. Almost everyone finds at least one circle hard.\n\nThe traditional sequence: yourself, a loved one, a neutral person (the barista you see daily), a difficult person, and finally all beings. The phrases stay simple: 'may you be safe, may you be well, may you be at peace.' The point is not to manufacture a feeling but to direct the attention.",
    steps: [
      "Sit comfortably. Eyes closed or soft gaze. Three slow breaths.",
      "First circle (1 min): yourself. Silently: 'May I be safe. May I be well. May I be at peace.' Notice what comes up — including resistance.",
      "Second circle (1 min): someone you love unambiguously. Same phrases, picturing them.",
      "Third circle (1 min): a neutral person — someone you see often but don't really know.",
      "Fourth circle (1 min): a difficult person. Not the worst person you can think of — start with mild friction. Same phrases. Notice what's hard.",
      "Fifth circle (1 min): all beings. As wide as your attention will go.",
      "Close with three breaths.",
    ],
    reflection: "Which circle was hardest? What does that tell you about where your goodwill draws its line?",
  },
  {
    slug: 'breath-count',
    relevantDimensions: ['MR', 'AT', 'SI'],
    category: 'contemplative',
    name: 'Breath count to ten',
    summary: 'The simplest concentration practice in the Zen toolkit. Most people fail before five.',
    tradition: 'Zen',
    duration: '5–20 min',
    about: "Count your breaths from one to ten. On the exhale: 'one.' Next exhale: 'two.' At ten, start over at one. If your mind wanders and you lose count, don't berate yourself — just start over at one.\n\nThe practice is brutal in its simplicity. There's no story to tell about how it's going. Either you make it to ten or you don't. Most people, on the first attempt, lose count by four. The not-losing isn't the point. The noticing-you-lost is the point. That's the moment of training: the gap between distraction and return.",
    steps: [
      "Sit upright but not tense. Hands wherever they rest naturally. Soft gaze or closed eyes.",
      "Let breathing happen naturally. Don't control it.",
      "On the exhale, count 'one' silently. Next exhale: 'two.' Continue to ten.",
      "If you reach ten, start over at one.",
      "If you lose count, start over at one. Do not judge the losing.",
      "Continue for the time you set. End with one slow breath without counting.",
    ],
    reflection: "What did your mind reach for when it left the counting? Where did it tend to go?",
  },
  {
    slug: 'mindful-eating',
    relevantDimensions: ['ES', 'MR', 'AT'],
    category: 'contemplative',
    name: 'Mindful eating',
    summary: 'One meal eaten with full attention. Reveals how rarely you taste what you eat.',
    tradition: 'Buddhist (Vipassana lineage)',
    duration: '10–25 min (one meal)',
    about: "Pick one meal — start small, maybe one piece of fruit or a single small dish — and eat it with full attention. No phone, no book, no TV, no conversation. Just the food.\n\nThis is harder than it sounds. Almost everyone reaches for something to fill the attention within thirty seconds. The discomfort is itself the practice. You're noticing the habit of partial attention — and discovering, almost always, that the food was more interesting than you'd remembered.",
    steps: [
      "Choose food deliberately. Something you'd normally eat while multitasking.",
      "Sit at a table. No screens, no books, nothing to read on the packaging.",
      "Before eating, look at the food. Notice its color, shape, smell.",
      "Take one bite. Chew slowly. Notice texture, temperature, the flavor changing as you chew.",
      "Between bites, set the utensil down. Notice the urge to pick it up immediately.",
      "Continue until done, OR until you can tell you're full (which usually comes earlier than you'd expect).",
    ],
    reflection: "What did you taste that you'd normally miss? What did you want to fill the silence with — and why?",
  },
  {
    slug: 'letter-future-self',
    relevantDimensions: ['SS', 'TV', 'VA'],
    category: 'contemplative',
    name: 'Letter to your future self',
    summary: 'Write to who you\'ll be in one year, five years, ten. Discover what you most want to tell them.',
    tradition: 'Universal contemplative',
    duration: '20–40 min',
    about: "Pick a horizon — one year, five, ten — and write a letter to the version of yourself who will read it then. What you want them to know about who you are now. What you fear they'll have forgotten. What you hope they've kept.\n\nThe practice surfaces values you don't notice you have. The temptation is to give advice — resist it. The future self has already lived the years between; advice is the wrong frame. What they need is a record of who you were before the years happened.",
    steps: [
      "Choose your horizon. Write the date you're writing AND the future date.",
      "Open: 'I'm writing this on ___ because I want you to remember ___.'",
      "Write what you most want them to have kept from your current life: a relationship, a practice, a question, a kindness, a belief.",
      "Write what you fear they'll have given up that you'd grieve.",
      "Write what you hope they've finally gotten over.",
      "Close with one sentence that's just for them. Seal in an envelope, mark it with the future date, put it somewhere you'll find it.",
    ],
    reflection: "Reading what you wrote, what surprises you about the person doing the writing?",
  },
  {
    slug: 'body-scan',
    relevantDimensions: ['ES', 'MR', 'SI'],
    category: 'contemplative',
    name: 'Body scan',
    summary: 'Slow attention to each region of the body. Returns you to the only place you actually live.',
    tradition: 'Modern (Kabat-Zinn) + ancient (Vipassana, Yoga Nidra)',
    duration: '15–30 min',
    about: "Lie down. Move attention slowly through the body, region by region — feet to head or head to feet, doesn't matter — noticing whatever is there. Tension, warmth, ache, nothing. The practice isn't to fix anything; it's to attend.\n\nMost people discover, after a few minutes, that they've been holding their jaw, shoulders, or stomach all day without noticing. The body knows things the mind has been ignoring. The scan is a way of asking, gently, what the body wants to tell you.",
    steps: [
      "Lie on your back. Hands at your sides. Eyes closed.",
      "Three slow breaths. Settle.",
      "Start at the toes. Notice the left big toe. Then each toe. Notice without changing.",
      "Move up the left foot to the ankle. Calf. Knee. Thigh. Hip.",
      "Repeat the right leg.",
      "Continue up: pelvis, lower back, abdomen, chest, upper back, shoulders.",
      "Down each arm to the fingertips.",
      "Back up to neck, jaw, face (one region at a time: jaw, cheeks, eyes, forehead, scalp).",
      "End with attention on the whole body at once. Three slow breaths.",
    ],
    reflection: "Which region was holding something you hadn't noticed? What was it holding?",
  },

  // ── Logic (7) ─────────────────────────────────────────────────
  {
    slug: 'burden-of-proof',
    relevantDimensions: ['SR', 'TR', 'TD'],
    category: 'logic',
    name: 'Burden-of-proof check',
    summary: 'Most arguments lose because the wrong side is being asked to prove the wrong thing.',
    tradition: 'Analytic philosophy',
    duration: '5–10 min',
    about: "Whoever makes the positive claim bears the burden of proof. 'X exists' has to be defended; 'X doesn't exist' doesn't, by default. This sounds obvious, but in real arguments it shifts constantly, and most informal-logical confusion comes from a smuggled burden swap.\n\nThe practice: take a real argument you're in (or have read recently) and ask, of each claim made, 'who has the burden here?' The shifts will surprise you.",
    steps: [
      "Pick an argument. Real and recent. Maybe a debate you witnessed online.",
      "List the claims each side made.",
      "For each claim, ask: is this a POSITIVE claim (X is true) or a NEGATIVE claim (X is false)? Mark each.",
      "For each positive claim, ask: did the claimant offer evidence sufficient for the claim's weight?",
      "Identify any burden swap: did someone shift their burden by demanding the other side disprove their assertion?",
      "Rewrite one of the side's strongest moves with the burden returned to its rightful place.",
    ],
    reflection: "Which side handled their burden better? Where did your own assumptions stop them from needing to?",
  },
  {
    slug: 'necessary-sufficient',
    relevantDimensions: ['TR', 'TD', 'SR'],
    category: 'logic',
    name: 'Necessary vs sufficient',
    summary: 'A confusion that\'s killed more arguments than any fallacy.',
    tradition: 'Analytic logic',
    duration: '5 min',
    about: "A NECESSARY condition has to hold for X. A SUFFICIENT condition guarantees X. They're often confused — most casually, by people arguing about what 'caused' something. A spark is sufficient for a forest fire given dry brush; the dry brush is necessary but not sufficient on its own.\n\nThe practice trains the distinction by forcing you to name both, separately, for cases where one is doing the work.",
    steps: [
      "Pick three claims of the form 'X causes Y' or 'X is the reason for Y.'",
      "For each, ask: is X necessary for Y? (Could Y happen without X?)",
      "Then ask: is X sufficient for Y? (Will X reliably produce Y, even alone?)",
      "Most causes are necessary but not sufficient — they need other conditions to actually produce the effect. Note which ones are which in your three examples.",
      "Bonus: find a case where someone argued 'X causes Y' but X was neither necessary NOR sufficient. (Common in pop-science writing.)",
    ],
    reflection: "Where in your own thinking do you treat something as sufficient that's only necessary?",
  },
  {
    slug: 'modus-tollens',
    relevantDimensions: ['TR', 'SR', 'TD'],
    category: 'logic',
    name: 'Modus tollens practice',
    summary: 'The classical denying-the-consequent move. The fastest way to spot a broken conditional.',
    tradition: 'Classical logic',
    duration: '5–10 min',
    about: "Modus tollens: if P then Q. Not-Q. Therefore not-P. The move is the engine of most theory-falsification.\n\nThe practice is small and useful: take a claim of the form 'if [theory], then [prediction].' Look at what's actually happening. If the prediction isn't happening, the theory takes a real hit — and you've just used modus tollens.",
    steps: [
      "Pick a theoretical claim with a testable prediction. E.g.: 'If raising minimum wage to $15 causes unemployment, we'd see job losses in Seattle after the 2017 raise.'",
      "State the conditional clearly: 'If P (theory), then Q (prediction).'",
      "Check Q. What did actually happen?",
      "If Q didn't happen: the theory is in trouble. (Not necessarily refuted — maybe the conditional was wrong, or other factors interfered — but it owes you an explanation.)",
      "Try this with three of your own beliefs. What did you predict? What actually happened?",
    ],
    reflection: "Which of your beliefs have you stopped checking against their predictions?",
  },
  {
    slug: 'bayesian-update',
    relevantDimensions: ['SR', 'TE', 'TR'],
    category: 'logic',
    name: 'Bayesian update',
    summary: 'New evidence in. How much should the belief move? Probability done responsibly.',
    tradition: 'Bayesian epistemology',
    duration: '10–15 min',
    about: "Bayes' theorem, informally: your degree of belief in something should be proportional to your prior belief times the likelihood of the new evidence given that belief. New evidence doesn't replace your prior; it updates it. The size of the update depends on how surprising the evidence is given each hypothesis.\n\nThe practical version doesn't require math. It requires honestly stating: what did you believe before? How likely is this new piece of evidence on each hypothesis you're entertaining? Then: how much should you move?",
    steps: [
      "Pick a question with two or three candidate answers (hypotheses).",
      "Before the new evidence: assign each hypothesis a rough probability that adds to 100%. E.g.: 'I was 60% sure my partner is upset about X, 30% about Y, 10% something else.'",
      "Name the new evidence: what just happened?",
      "For each hypothesis, ask: 'How likely is this evidence GIVEN this hypothesis?'",
      "The hypothesis under which the evidence is more LIKELY gets boosted; the others shrink. Reassign probabilities.",
      "Notice: did your beliefs move? By how much? Was the movement proportional to the evidence?",
    ],
    reflection: "Where in your life are you over-updating on weak evidence, or under-updating on strong evidence?",
  },
  {
    slug: 'hidden-premises',
    relevantDimensions: ['SR', 'TR', 'TD'],
    category: 'logic',
    name: 'Naming hidden premises',
    summary: 'Most arguments don\'t state their assumptions. The fastest way to refute one is to make them visible.',
    tradition: 'Argumentation theory',
    duration: '10 min',
    about: "Every argument rests on premises — assumed truths from which the conclusion follows. Most arguments only state SOME of their premises; others are smuggled in, assumed shared.\n\nThe practice: take an argument and reconstruct its hidden premises. The exercise of writing them out almost always reveals at least one that the arguer would have had trouble defending if asked.",
    steps: [
      "Pick an argument — your own or someone else's. Quote it or paraphrase tightly.",
      "Identify the conclusion: what is the argument trying to establish?",
      "Identify the stated premises: what facts/claims are being offered as support?",
      "Ask: does the conclusion ACTUALLY follow from the stated premises? If not, what additional premise would make it follow?",
      "Write the hidden premise(s) out explicitly. Examples: 'Most people are like X,' 'What's natural is good,' 'What's profitable is what works.'",
      "Ask: would the arguer defend each hidden premise as confidently as they defended the stated ones?",
    ],
    reflection: "Which of your own arguments rest on hidden premises you've never defended?",
  },
  {
    slug: 'ockhams-razor',
    relevantDimensions: ['TR', 'SR', 'TD'],
    category: 'logic',
    name: 'Ockham\'s razor',
    summary: 'When two theories explain the same evidence, prefer the one with fewer entities. A scalpel, not a club.',
    tradition: 'Scholastic + scientific',
    duration: '5–10 min',
    about: "William of Ockham (14th c.) is remembered for the principle: do not multiply entities beyond necessity. Modern science treats this as a guideline: when two theories explain the same data, prefer the simpler one. The simpler theory is more likely to be right (or at least more useful) because it makes fewer assumptions that could be wrong.\n\nThe practice trains the careful application of this. Ockham's razor is widely misused. It's not 'simpler theories are true.' It's 'when two theories EXPLAIN THE SAME THING, prefer the simpler.' The exception is when the simpler theory loses explanatory power.",
    steps: [
      "Pick a phenomenon that has competing explanations. (Could be small: 'why was my friend short with me?')",
      "List at least two candidate explanations, in order of complexity (simplest first).",
      "For each, ask: does it account for ALL the evidence?",
      "If the simpler explanation accounts for the evidence, you've found Ockham's preferred answer.",
      "If it doesn't, the more complex explanation has to earn its complexity by explaining MORE than the simpler one.",
      "Common misapplication to watch for: dismissing a more complex theory just because it's complex, even when it explains things the simpler one can't.",
    ],
    reflection: "Where do you reach for elaborate explanations when a simple one already does the work? Where do you over-simplify?",
  },
  {
    slug: 'disjunction-elimination',
    relevantDimensions: ['TR', 'SR', 'TD'],
    category: 'logic',
    name: 'Disjunction elimination',
    summary: 'When you know it\'s A or B, and you can rule out one, the other is forced.',
    tradition: 'Classical logic',
    duration: '5 min',
    about: "Disjunction elimination is the formal name for the move 'either P or Q. Not P. Therefore Q.' Sherlock Holmes used it constantly: when you've eliminated the impossible, whatever remains, however improbable, must be the truth.\n\nThe practice trains you to USE disjunction elimination — but more importantly, to notice when you're tempted to use it on disjunctions that aren't actually exhaustive.",
    steps: [
      "Pick a situation where you're trying to figure out what's going on.",
      "List the candidate explanations as a disjunction: 'It's either A or B or C.'",
      "First check: is the list exhaustive? Are there explanations missing? (This is where most informal disjunction elimination fails — the 'A or B' was actually 'A or B or C or D' the whole time.)",
      "If the list is exhaustive, work through each: what would have to be the case for it to be true? What evidence rules it out?",
      "Rule out what you can rule out. Whatever remains is your tentative answer.",
      "Then test the remainder: even if you've eliminated the others, does this one fit the evidence well?",
    ],
    reflection: "Where in life do you use 'it must be either A or B' without checking whether C, D, and E are also possible?",
  },

  // ── Argument (6) ──────────────────────────────────────────────
  {
    slug: 'charitable-interpretation',
    relevantDimensions: ['TR', 'UI', 'CE'],
    category: 'argument',
    name: 'Charitable interpretation',
    summary: 'Before arguing against a position, prove you understand it well enough that its holder would say "yes, that\'s it."',
    tradition: 'Analytic + virtue epistemology',
    duration: '10 min',
    about: "The principle of charity asks you to interpret an opponent's argument in its strongest form, not its weakest. It's not a kindness — it's a discipline. Refuting the weakest version proves nothing about the strongest, and most public 'rebuttals' are doing this without noticing.\n\nThe practice forces you to slow down. Before you respond to a position, restate it in a way the holder would endorse. Then respond.",
    steps: [
      "Pick a position you disagree with. Real, recent, specific.",
      "Restate it in your own words, in the most generous interpretation possible.",
      "Run a check: would the holder of this position, reading your restatement, recognize their view? Would they want to add anything? Subtract anything?",
      "If you can't pass that check, you haven't understood the view yet. Read more. Talk to a defender. Don't respond.",
      "Once you can pass the check, write your response. Notice if the response that worked against the WEAK version still works against the STRONG one.",
    ],
    reflection: "Where in past arguments did you refute a weaker version than your opponent actually held? How would the conversation have gone differently?",
  },
  {
    slug: 'concession-and-counter',
    relevantDimensions: ['CE', 'TR', 'UI'],
    category: 'argument',
    name: 'Concession-and-counter',
    summary: 'A rhetorical structure that builds trust before it pushes back.',
    tradition: 'Classical rhetoric',
    duration: '5–10 min',
    about: "Most arguments fail at the first sentence — by attacking the opposing position before establishing any common ground. The opposite move, drawn from classical rhetoric: name what your opponent has gotten right BEFORE arguing for the part you disagree with.\n\nThe structure: 'You're right that X. AND ALSO, Y.' Not 'but' — 'and also.' The shift signals that you've registered the right thing without conceding the whole point.",
    steps: [
      "Pick a disagreement. Identify the other side's central claim.",
      "Find at least one thing in the other side's argument that's actually right — not in a watered-down sense, but in a way you genuinely affirm.",
      "Open your response: 'You're right that ___.' State it as cleanly as they would.",
      "Then: 'AND ALSO ___.' Make your counter-claim — but as an addition, not a refutation, of the conceded point.",
      "Notice the difference in how the other person hears 'and also' vs 'but.'",
    ],
    reflection: "What did conceding feel like? Did it weaken your argument, strengthen it, or change its shape in some other way?",
  },
  {
    slug: 'ideological-turing-test',
    relevantDimensions: ['UI', 'SR', 'CE'],
    category: 'argument',
    name: 'Ideological Turing test',
    summary: 'Argue an opponent\'s view well enough that strangers can\'t tell you\'re not a believer.',
    tradition: 'Modern (Bryan Caplan, 2011) + classical (Plato\'s Socratic method)',
    duration: '15–30 min',
    about: "The original Turing test: a machine passes if humans can't tell whether they're talking to a human or a machine. The ideological version: you pass if defenders of a position you disagree with can't tell whether you actually hold the position.\n\nThis is the most demanding version of steelmanning. It requires not just understanding the argument but inhabiting its motivations — feeling the world from inside the position. Most arguments would improve if both sides could pass this test before responding.",
    steps: [
      "Pick a view you disagree with. Choose one you've ENGAGED with — not a strawman you've avoided.",
      "Write a 300-word essay arguing FOR the position. In first person. As if you held it.",
      "Specifically include the motivations: not just what the position says, but why someone reasonable might find it compelling.",
      "If possible, show the essay to someone who actually holds the view. Ask: 'Does this sound like one of us, or someone pretending to be?'",
      "If they say pretending, ask what you missed. Revise.",
      "If you can't access a real holder, ask yourself: would I be embarrassed for the holder to read this?",
    ],
    reflection: "What did writing the essay teach you about why intelligent people hold the view? What's now harder to dismiss?",
  },
  {
    slug: 'reframe-disagreement',
    relevantDimensions: ['CE', 'SS', 'SR'],
    category: 'argument',
    name: 'Reframing the disagreement',
    summary: 'When two people argue past each other, the disagreement is usually deeper than either is naming.',
    tradition: 'Dialectic + therapy',
    duration: '10–15 min',
    about: "A surprising amount of conflict happens because the two sides are arguing about different things while believing they're arguing about the same thing. The disagreement on the surface (the policy, the decision, the line) hides a disagreement underneath (the value, the principle, the experience).\n\nThe practice trains the move that ends the cycle: instead of defending your position, ask what the underlying disagreement actually is. Sometimes that's the conversation that was supposed to happen.",
    steps: [
      "Pick a real disagreement — the recurring kind. The argument you keep having.",
      "Write what the disagreement seems to be on the surface. In one sentence.",
      "Now ask: what would have to be true for my position to be right? What underlying belief, value, or experience am I drawing on?",
      "Do the same for the other side: what underlying belief/value/experience would have to be true for them to be right?",
      "Compare. The disagreement on the SURFACE often turns out to be downstream of a disagreement on the UNDERLYING level. Name the underlying disagreement.",
      "Optional: bring the underlying disagreement to the other person. 'I think we're actually disagreeing about ___. Does that ring true?'",
    ],
    reflection: "Did naming the deeper disagreement change the surface argument? Was it resolvable when reframed, or did the deeper disagreement turn out to be the real one?",
  },
  {
    slug: 'stoic-preview',
    relevantDimensions: ['TV', 'AT', 'CE'],
    category: 'argument',
    name: 'Stoic preview',
    summary: 'Before a hard conversation, rehearse the worst version of how it could go. Then walk in.',
    tradition: 'Stoic (premeditatio malorum)',
    duration: '10 min',
    about: "The Stoic discipline of premeditation: imagine vividly the bad outcomes before they happen, so they don't surprise you when they do. Applied to arguments: before a hard conversation, rehearse the version where everything goes badly — they get angry, they refuse to listen, they say the cruelest thing, you lose your composure.\n\nThe practice doesn't depress you — it does the opposite. By having mentally lived the worst, you walk in with the actual stakes clearer, less surprised by any sharp move, and more able to stay with your own intentions.",
    steps: [
      "Identify the hard conversation. Real, near.",
      "Spend 3 minutes vividly imagining it going badly. Concrete details: their face, their words, the moment you most fear.",
      "Spend 3 minutes asking: if this happened, what would I want to do? What's the version of myself I'd want to show up as in the worst moment?",
      "Spend 2 minutes naming what's actually at stake in the conversation — what you want to communicate, what outcome you'd accept, what outcome would be a real loss.",
      "Walk into the conversation. Notice how having rehearsed the worst affects your composure.",
    ],
    reflection: "After the conversation: did the worst happen? Or did the worst case turn out to be less likely than it felt? What was your actual composure built from?",
  },
  {
    slug: 'ten-word-version',
    relevantDimensions: ['TR', 'PO', 'SS'],
    category: 'argument',
    name: 'The ten-word version',
    summary: 'Compress your argument to ten words. The compression forces honesty.',
    tradition: 'Modern (precis writing, Hemingway, Anglo-American journalism)',
    duration: '5–10 min',
    about: "Take any argument you're making — written or held — and reduce it to ten words. Then to twenty. Notice what survives the compression and what doesn't.\n\nThe ten-word version is brutal. It strips out the qualifications, the rhetorical flourishes, the safety hedges. What's left is the actual claim. If your argument doesn't survive the compression — if the ten-word version sounds either trivial or wrong — you've learned something important about the argument.",
    steps: [
      "Pick an argument you've made recently. Written essay, debate, position in a conversation.",
      "Write the ten-word version. Exactly ten words. Cut everything else.",
      "Read the ten-word version out loud. How does it sound? Defensible? Embarrassing? Surprisingly different from what you thought you were arguing?",
      "Write the twenty-word version, allowing yourself one qualification. Re-read.",
      "Notice the gap between the ten-word and twenty-word versions — what survived the further compression?",
      "Now write the hundred-word version. Most arguments fit comfortably here. The longer original was probably padding.",
    ],
    reflection: "What did you SAY in the long version that the ten-word version reveals you didn't actually mean?",
  },
];

export function findExercise(slug: string): Exercise | null {
  return EXERCISES.find(e => e.slug === slug) || null;
}

export function exercisesByCategory(category: ExerciseCategory): Exercise[] {
  return EXERCISES.filter(e => e.category === category);
}
