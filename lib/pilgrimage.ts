// /pilgrimage — a 30-day personalized course tied to the user's
// archetype + secondary flavor.
//
// Design:
//   - Ten archetype-specific arcs (one per archetype key), each 30
//     days, organized into 3 ten-day phases that match that
//     archetype's character. The Cartographer's phases work on
//     framework-edges; the Garden's on attention and taste; the
//     Hammer's on refusal-and-cost.
//   - Each day has: title, framing, prompt, and expectation hint.
//     Short by design — the user does the substantive work.
//   - Per-(archetype, flavor) enrollment lenses: a 2-3 sentence note
//     shown when the user enrolls, calibrating the whole arc to the
//     specific shape of their mind. (E.g., a Tragic Cartographer
//     hears different opening words from a Communal Cartographer.)
//   - Kindred passages are picked algorithmically per day in the
//     UI from the user's nearest philosophers (lib/philosophers.ts).
//     The arcs themselves stay archetype-content.
//
// Enrollment state lives in localStorage in v1 (no DB migration):
//   key: "mull.pilgrimage"
//   value: { startedAt: ISO, archetype, flavor: DimKey|null,
//            currentDay: 1..30, completedDays: number[] }
//
// Submission goes through the existing diary pipeline so the user's
// 16-D vector continues to drift — pilgrimage days are tagged but
// the math is shared with /diary and /dilemma.

import type { DimKey } from "./dimensions";

export type PilgrimageDay = {
  /** Day number 1..30. */
  day: number;
  /** 3-5 word title — sharp, evocative. */
  title: string;
  /** 2-sentence framing of the day's theme. */
  framing: string;
  /** The single question the user writes against. */
  prompt: string;
  /** 1-sentence hint about what a substantive answer looks like. */
  expect: string;
};

export type PilgrimageArc = {
  /** Matches an entry in ARCHETYPE_TARGETS. */
  archetypeKey: string;
  /** Displayed at the top of the arc — what this 30-day shape is. */
  spirit: string;
  /** 3 ten-day phases by name. */
  phases: [string, string, string];
  /** Default welcome shown at enrollment if no flavor lens applies. */
  welcomeDefault: string;
  /** The 30 days. */
  days: PilgrimageDay[];
};

/** Per-(archetype, flavor) enrollment lens. Replaces the default
 *  welcome when set. Keyed by flavor DimKey. Only the most likely
 *  flavor pairings per archetype have hand-tuned lenses. */
export type FlavorLensMap = Partial<Record<DimKey, string>>;

// ─── Shared helpers ───────────────────────────────────────────────

/** Get the arc for an archetype key. Falls back to Cartographer if
 *  the key isn't recognized (shouldn't happen — pickEnding and the
 *  archetype targets are in sync). */
export function getPilgrimageArc(archetypeKey: string): PilgrimageArc {
  return PILGRIMAGE_ARCS[archetypeKey] ?? PILGRIMAGE_ARCS.cartographer;
}

/** Get the per-flavor welcome lens, falling back to the arc's
 *  default. */
export function getEnrollmentMessage(
  archetypeKey: string,
  flavor: DimKey | null,
): string {
  const arc = getPilgrimageArc(archetypeKey);
  if (flavor && FLAVOR_LENSES[archetypeKey]?.[flavor]) {
    return FLAVOR_LENSES[archetypeKey][flavor]!;
  }
  return arc.welcomeDefault;
}

/** Localstorage key for pilgrimage state. */
export const PILGRIMAGE_KEY = "mull.pilgrimage";

export type PilgrimageState = {
  startedAt: string;          // ISO date
  archetype: string;          // snapshot at enrollment
  flavor: DimKey | null;      // snapshot at enrollment
  currentDay: number;         // 1..30
  completedDays: number[];    // sorted ascending
};

// ─── The 10 archetype arcs ────────────────────────────────────────
//
// Each arc has 30 days in 3 phases of 10. Phases reflect that
// archetype's natural movement: a Cartographer moves outward from
// framework-edges; a Pilgrim moves down the road; a Garden moves
// through a season.

export const PILGRIMAGE_ARCS: Record<string, PilgrimageArc> = {
  // ─── CARTOGRAPHER ─────────────────────────────────────────────
  cartographer: {
    archetypeKey: "cartographer",
    spirit: "Thirty days redrawing what you thought was settled.",
    phases: ["The Edges of Your Framework", "Other Maps, Other Mappers", "Toward A Sharper Atlas"],
    welcomeDefault:
      "You map carefully. Most pilgrimages give general prompts; yours starts from the assumption that you already think systematically and need not gentling but sharpening. Thirty days of questions designed to make you redraw what you thought was already settled — and to notice where the map has been wrong the whole time.",
    days: [
      { day: 1, title: "The First Map", framing: "Before the quiz, you had a working model of how you thought. Mull's reading is one version. Compare them.", prompt: "What did your old model get right that Mull's reading misses? What did Mull catch that you'd missed?", expect: "Specific examples beat general claims here." },
      { day: 2, title: "The Hidden Premise", framing: "Every conviction rests on a premise. Most of them are unexamined. That's how convictions work.", prompt: "What's the premise underneath your strongest position, and have you defended it yourself rather than borrowing the defense?", expect: "Steelmen, not stand-ins." },
      { day: 3, title: "Define A Term", framing: "Words you use casually carry a lot of philosophical freight. Define one well enough that it could be tested.", prompt: "Pick a word you use often — fairness, freedom, responsibility, love. Define it in 100 words such that someone could check the definition against cases.", expect: "A definition that excludes things, not just one that includes." },
      { day: 4, title: "A Framework You've Dropped", framing: "Cartographers update. The frameworks you've outgrown taught you something about what you needed from a framework.", prompt: "What's a theory or framework you used to hold and have dropped? What specifically made you drop it?", expect: "Be honest about the moment — not the post-hoc rationalization." },
      { day: 5, title: "The Counterexample", framing: "Most maps fail at the edges. Find the case yours doesn't quite fit.", prompt: "A case your current framework handles awkwardly. Don't reconcile it. Just describe it sharply.", expect: "The discomfort of leaving the case unresolved is part of the practice." },
      { day: 6, title: "Distinction That Costs", framing: "Where in your life does the difference between two adjacent ideas matter most?", prompt: "Two ideas that look similar to most people but mean different things in your hands. Name them and a case where the difference matters.", expect: "If the case is hypothetical, sharpen it. If real, anonymize as needed." },
      { day: 7, title: "Your Steelman", framing: "Cartographers tend to be good at taking down weak versions of opposing positions and bad at engaging the strong ones.", prompt: "Pick a position you disagree with. Argue its strongest case — better than its average defender does.", expect: "If you don't slightly persuade yourself, you haven't steelmanned." },
      { day: 8, title: "Mapping Doubt", framing: "Doubt has structure. Your skepticism is shaped, not formless.", prompt: "A question where you've stopped looking for the answer. Why did you stop? Was it the right time?", expect: "Distinguish 'I've concluded' from 'I've given up' from 'I've gotten bored'." },
      { day: 9, title: "The Aristotle Hour", framing: "One question, one philosopher, one hour. The constraint sharpens the question.", prompt: "If you could bring one open question to one philosopher for one hour, what's the question and who's the philosopher?", expect: "The choice of philosopher tells you what kind of answer you're hoping for." },
      { day: 10, title: "A Map Of Today", framing: "Frameworks are for daily use. Apply yours to one small choice you made.", prompt: "A choice you made today. What principle was operating? What was actually going on?", expect: "The gap between the principle and the reality is where the next chapter of the map gets drawn." },

      { day: 11, title: "An Unlike Mapper", framing: "A thinker whose tools differ from yours but whose conclusions overlap somewhere with yours. Find one.", prompt: "Name a philosopher whose method you don't share but whose answers sometimes match yours. Why do you both arrive somewhere similar?", expect: "Convergent conclusions from divergent methods are diagnostic — they may name what's actually true." },
      { day: 12, title: "The Mystic's Map", framing: "Some thinkers work without explicit frameworks. What might you be missing because you need yours first?", prompt: "A truth you might be missing because you require it to be articulated before it counts.", expect: "The missing thing may be available to you in moments — not propositions." },
      { day: 13, title: "Read Wrong", framing: "Cartographers tend to read for what confirms or contradicts. Try reading for what reorients.", prompt: "Find a paragraph in a primary text near you. Read it not for what's true or false but for what it would feel like to hold the view from the inside.", expect: "Quote the paragraph; name the felt thing." },
      { day: 14, title: "Practical Wisdom", framing: "Aristotle distinguished episteme (theoretical knowledge) from phronesis (practical wisdom). Most cartographers underweight the second.", prompt: "Name someone in your life who has phronesis but couldn't write a single principle down. What do they do that you can't reduce to a rule?", expect: "Try to describe their judgment in motion, not as principles." },
      { day: 15, title: "The Communal Mapper", framing: "Most maps are drawn by groups, not individuals. Find one you've been on without naming.", prompt: "An understanding you share with a community of thinkers — explicit or not. Name the community and the understanding.", expect: "Including online communities, work cultures, families." },
      { day: 16, title: "Two Maps That Disagree", framing: "Pick two thinkers whose maps of the same territory differ sharply. Don't pick the winner.", prompt: "Two philosophers who disagree about the same thing. Describe the disagreement without taking a side.", expect: "The exercise is restraint." },
      { day: 17, title: "What Doesn't Fit On The Map", framing: "Some experiences resist mapping. They're not anti-map. They're outside your map's resolution.", prompt: "A real experience your map handles badly. Don't fix the map. Just sit with the misfit.", expect: "Resist the urge to upgrade the framework. The upgrade is the next day, not today." },
      { day: 18, title: "Pick A Better Tool", framing: "A different framework would handle yesterday's case better. Borrow it.", prompt: "What framework would handle yesterday's misfit better than yours? Use it for one paragraph.", expect: "Pure tool-trying — no commitment to keep the borrowed framework." },
      { day: 19, title: "The Tradition You Carry", framing: "You inherited methods. Most of them you didn't choose. Some are worth keeping anyway.", prompt: "A method or distinction you inherited from a tradition (academic, religious, family, professional). What does it still get right?", expect: "Distinguish what works from what feels familiar." },
      { day: 20, title: "Halfway Reflection", framing: "Twenty days in. Look at what you've written. What pattern is emerging?", prompt: "What pattern do your last twenty days reveal about how you think? Not what they prove — what they hint.", expect: "Try not to over-name it. The pattern is forming." },

      { day: 21, title: "The Atlas, Reorganized", framing: "If you redrew your current map from scratch using only what's survived these twenty days, what would the structure look like?", prompt: "Sketch the structure of your current best map. Two paragraphs.", expect: "Not the contents — the architecture." },
      { day: 22, title: "A Map For Someone Else", framing: "The mapper's discipline includes giving the map away. Make one usable by another person.", prompt: "Write a paragraph that would help someone unlike you navigate a question you've thought about clearly.", expect: "Translate the framework into their vocabulary, not yours." },
      { day: 23, title: "What You Won't Map", framing: "Some territory you've decided not to enter. Why?", prompt: "A question you've decided not to spend any more of your life on. What made it not yours?", expect: "Honor the choice. Don't take it back." },
      { day: 24, title: "The Edge You're At", framing: "The growing edge of any framework is the place where it starts to break.", prompt: "Where is your current best framework starting to break? Not where it's wrong — where it's reaching its limit.", expect: "Limit is different from error." },
      { day: 25, title: "Ascetic Map", framing: "A simpler map covers less but is more portable. Make yours simpler for one case.", prompt: "Strip one of your views down to the smallest version that still does the work. What does that smaller version look like?", expect: "Test by deletion: keep removing until removal breaks it." },
      { day: 26, title: "The Living Mapper", framing: "Maps are for someone using them, not for the archive. Use one today.", prompt: "Apply your sharpest current framework to a decision you'll make this week. Show the work.", expect: "The use is the test." },
      { day: 27, title: "What The Map Doesn't Predict", framing: "Maps that explain everything explain nothing. Yours should fail somewhere.", prompt: "A case your framework predicts wrong. Don't fix the framework yet. Name the wrong prediction.", expect: "Living with the wrongness is part of the work." },
      { day: 28, title: "An Atlas, Not A Map", framing: "An atlas is a collection of maps for different purposes. The mature mind doesn't pick one.", prompt: "Three of your current frameworks. Which question is each one for?", expect: "Tools, not loyalties." },
      { day: 29, title: "What You'd Tell A Student", framing: "The next person down this path is twenty years younger and starting cartography. What do you wish you'd been told?", prompt: "One paragraph you'd give to your younger self about how to map well.", expect: "Specific over general." },
      { day: 30, title: "The Open Map", framing: "Pilgrimages end. The walking doesn't.", prompt: "What's the question you want to spend the next year inside? And what about your current map needs to change to spend it well?", expect: "Make this concrete enough to remember in February." },
    ],
  },

  // ─── KEEL ────────────────────────────────────────────────────
  keel: {
    archetypeKey: "keel",
    spirit: "Thirty days clarifying what you hold, what tests your holding, and what comes after.",
    phases: ["What You Hold", "What Tests Holding", "What Comes After Holding"],
    welcomeDefault:
      "You're the Keel: what keeps the boat upright when the wind argues with it. This pilgrimage is for people who already know steadiness; the work is making it more precise. Thirty days of small questions about what you actually hold, the storms that test holding, and what holding produces.",
    days: [
      { day: 1, title: "The Thing You Hold", framing: "Steady people hold something. Sometimes they can't articulate it.", prompt: "What do you hold steady on? Not a value — a felt commitment that's survived.", expect: "Be specific enough that someone could test whether you actually hold it." },
      { day: 2, title: "Where You Learned It", framing: "Most steadiness is inherited. Some is hard-won. Both count.", prompt: "Who or what taught you to hold this? Were you a willing student?", expect: "The inheritance matters as much as the commitment." },
      { day: 3, title: "The First Storm", framing: "The first time your steadiness was tested for real.", prompt: "The first time the wind argued with you and you didn't yield. What did the holding cost?", expect: "Cost is the measure." },
      { day: 4, title: "What You'd Concede", framing: "Steadiness is not the same as rigidity. The keel that won't move in any direction breaks.", prompt: "What would you concede on, even on the thing you most hold? Under what conditions?", expect: "Not 'never.' What conditions." },
      { day: 5, title: "Quiet Days", framing: "Most days the wind doesn't blow. Holding is invisible. That's also when it's most important.", prompt: "What does your holding look like on a quiet day? When no one would notice if you didn't.", expect: "The mundane shape of the commitment." },
      { day: 6, title: "A Steadier Than You", framing: "Someone you know holds harder than you do. Watch them.", prompt: "Name someone whose steadiness exceeds yours. What does theirs cost them that yours doesn't?", expect: "Cost again. It's always cost." },
      { day: 7, title: "The Person You'd Steady", framing: "Keels also steady others. Sometimes that's the whole point.", prompt: "Someone whose own steadiness depends partly on you. Who, and how do you do it?", expect: "Most keel-people do this without naming it." },
      { day: 8, title: "What Tradition Says", framing: "Traditions accrete steadiness over centuries. You might be carrying more than you know.", prompt: "A practice you do because it was given to you. Why does it still serve?", expect: "Distinguish 'still serves' from 'still does it.'" },
      { day: 9, title: "Where Your Steadiness Fails", framing: "Every keel has a wind it can't withstand. Knowing yours is part of the practice.", prompt: "A specific kind of pressure that breaks your steadiness. What does the breaking look like?", expect: "Naming the breaking pattern is the start of holding through it." },
      { day: 10, title: "Three Things You Won't Hold", framing: "Steadiness is selective. The keel chooses its weight.", prompt: "Three commitments you've deliberately set down. What did setting them down free?", expect: "Releases as deliberate as holdings." },

      { day: 11, title: "The Argument You're In", framing: "Keels are tested by argument as much as by storm. The slow disagreement is harder than the fast one.", prompt: "A disagreement you're inside right now. What's the version of you that yielded? Why didn't it?", expect: "Visit the yielding version honestly." },
      { day: 12, title: "Practical Action", framing: "Practical orientation is the keel's native virtue. Most days that's enough.", prompt: "One small useful thing you did this week that no principle predicted. What was it?", expect: "Phronesis: practice that overflows principle." },
      { day: 13, title: "A Loyalty Tested", framing: "Loyalty is steadiness with a person rather than a principle. It comes with its own storms.", prompt: "A loyalty that's cost you something recently. Did the steadiness pay?", expect: "Honest about whether holding was right or wrong." },
      { day: 14, title: "The Sober Reading", framing: "Steady people tend to read for what works, not what astonishes. That's a strength and a limit.", prompt: "Find a passage in a primary text. Read it for what would actually help if you held it. What did you find?", expect: "Useful is its own measure." },
      { day: 15, title: "Stress Without Drama", framing: "A real test that wasn't a Big Moment. The slow grind under steadiness.", prompt: "A months-long stress where your holding mattered without anyone naming it. What kept you on course?", expect: "The unnamed kind matters most." },
      { day: 16, title: "Steady When Wrong", framing: "Sometimes steadiness held you to a wrong position too long. That's also the practice.", prompt: "A time your steadiness was a vice. How did you finally let go?", expect: "Letting go is part of holding well, in the long run." },
      { day: 17, title: "The Community That Holds", framing: "You're not the only keel. Other steady people form a community whether they meet or not.", prompt: "Three people you've never met whose steadiness you trust. What about them is durable?", expect: "Models can be living, dead, or fictional." },
      { day: 18, title: "Asceticism", framing: "Most steadiness costs material comfort. The keel is heavier than the boat.", prompt: "Something you do without, in order to hold what you hold. Honor it by naming it.", expect: "Without sentiment — just the trade." },
      { day: 19, title: "Reasoning Steadily", framing: "Some steadiness is felt. Some is argued. Both are valid.", prompt: "Walk through your reasoning for one core commitment, as if a stranger asked.", expect: "Reasons, not just convictions." },
      { day: 20, title: "Halfway Steady", framing: "Twenty days in. Has your understanding of your own steadiness shifted?", prompt: "What about your holding has you seen differently in these twenty days?", expect: "Small shifts. Don't manufacture one." },

      { day: 21, title: "Tend One Thing", framing: "Steadiness produces tending. Pick one small ongoing care of yours.", prompt: "Something you tend that no one would notice if you stopped. Why do you tend it?", expect: "Tending is what holding becomes." },
      { day: 22, title: "Pass The Watch", framing: "Long steadiness involves handing it off. Eventually someone else will hold this.", prompt: "Who would hold this after you? How would you prepare them?", expect: "Even if no one comes to mind, write it." },
      { day: 23, title: "The Slow Letter", framing: "A long-haul correspondence is its own kind of holding.", prompt: "Someone you've written to over years. What has the writing held that nothing else would have?", expect: "If you don't have one, name the absence and what it has cost." },
      { day: 24, title: "Steadiness, Not Stubbornness", framing: "The line is real but moves. Name where it moves for you.", prompt: "How do you tell the difference, in yourself, between holding firm and refusing to update?", expect: "The internal tell is what matters." },
      { day: 25, title: "What Hurts Doesn't Mean Wrong", framing: "Pain doesn't mean you should let go. It also doesn't mean you shouldn't.", prompt: "A pain right now from your holding. What would changing your hold cost more?", expect: "Sober trade, not heroic story." },
      { day: 26, title: "Where Help Comes From", framing: "Even the steady need help. Letting it in is part of the practice.", prompt: "A kind of help you'd refuse without thinking. Why?", expect: "The refusal is sometimes wisdom, sometimes pride." },
      { day: 27, title: "Sit With The Loss", framing: "Steadiness doesn't prevent loss. It changes how you carry it.", prompt: "Something you've lost that your holding didn't save. How are you carrying it now?", expect: "Carry, don't resolve." },
      { day: 28, title: "The Long View", framing: "Steady people see decades. Most arguments are about months.", prompt: "A decision you'd make differently if you took a 20-year view. What stops you from taking it?", expect: "The reasons are often valid." },
      { day: 29, title: "An Heir", framing: "Who's the next keel after you, in the small communities you serve?", prompt: "Name them. What do you most want them to learn from your holding?", expect: "Even if speculative, write it." },
      { day: 30, title: "Steady Outward", framing: "The end is not arrival. It's continuation under different weather.", prompt: "What weather do you expect in the year ahead? What about your holding will need to change?", expect: "Anticipate. Don't pretend continuity will be costless." },
    ],
  },

  // ─── THRESHOLD ───────────────────────────────────────────────
  threshold: {
    archetypeKey: "threshold",
    spirit: "Thirty days at the edge of what language can hold.",
    phases: ["What Words Won't Reach", "Sitting With", "What You Don't Need To Say"],
    welcomeDefault:
      "You live at the edge. Most pilgrimages talk you back into articulation; yours doesn't. Thirty days of brief prompts about what won't fit into words, what fits badly, and what you might stop trying to name. Write only when writing serves; the rest is permission to keep silent.",
    days: [
      { day: 1, title: "The Unwordable", framing: "Begin where words don't go. Don't write to fix that.", prompt: "Something true about your life this year that no sentence has held well. Describe the failure of language, not the thing.", expect: "Short is fine. Even one line." },
      { day: 2, title: "A Time You Stayed Silent", framing: "Silence is sometimes wisdom, sometimes cowardice. You know the difference.", prompt: "A silence you kept this year that you're sure was right.", expect: "Don't justify. Just describe." },
      { day: 3, title: "What Was Said For You", framing: "Sometimes someone names what you couldn't.", prompt: "Words from another that landed where your own wouldn't reach. Quote them.", expect: "If the words were yours later, note that." },
      { day: 4, title: "The Apophatic", framing: "The negative way — defining by what isn't, not what is.", prompt: "Define one of your central commitments by listing five things it is NOT.", expect: "Sharper than the positive definition would be." },
      { day: 5, title: "A Phrase You Outgrew", framing: "Some language was right once. Now it's a costume.", prompt: "Words you used to use about something important that no longer fit. Why don't they fit?", expect: "The misfit is information." },
      { day: 6, title: "Stillness In A Place", framing: "Where your interior quiets — actual physical places, not metaphors.", prompt: "A place where you don't need to talk. What makes it that?", expect: "Sense-data. Light, smell, temperature." },
      { day: 7, title: "The Tear In Speech", framing: "Sometimes mid-sentence you realize the sentence is wrong. Honor those moments.", prompt: "A moment you couldn't finish a sentence because finishing it would have been false. What was the sentence trying to be?", expect: "The half-sentence is the data." },
      { day: 8, title: "Something Said Too Much", framing: "Over-talking a true thing makes it less true. Most people learn this late.", prompt: "Something you over-explained recently. What part should have been left silent?", expect: "Don't apologize for it — just name it." },
      { day: 9, title: "What Doesn't Need Reasons", framing: "Some commitments aren't arguments. Trying to argue them weakens them.", prompt: "A commitment that resists being defended. Don't defend it. Describe its weight.", expect: "Weight, not argument." },
      { day: 10, title: "A Bracket Around Knowing", framing: "Skepticism and mysticism touch each other here.", prompt: "A question you've stopped trying to answer, not because you gave up but because answering it would betray it.", expect: "The betrayal is the clue." },

      { day: 11, title: "An Hour Without Words", framing: "Hold the question without sentences. See what happens.", prompt: "Pick one of yesterday's questions. Sit with it for ten minutes without writing. Then write only the residue.", expect: "Two sentences. No more." },
      { day: 12, title: "What Music Holds", framing: "Some truths only music holds. Same with paintings, dance, certain rooms.", prompt: "A piece of music that holds something language would falsify. What does it hold?", expect: "Don't translate. Gesture." },
      { day: 13, title: "The Shape Of A Mood", framing: "Moods aren't propositions. They have shape — duration, density, edges.", prompt: "Describe the shape of your current mood without saying what it 'means.'", expect: "Geometry, not story." },
      { day: 14, title: "Sit With Grief", framing: "Threshold-people often have a relationship with loss most others find heavy.", prompt: "A grief you carry that you don't try to resolve. Write three sentences about how it sits.", expect: "Carrying, not solving." },
      { day: 15, title: "The Practice You'd Recommend", framing: "Almost everyone needs more silence. What practice gives you yours?", prompt: "A small daily practice that opens silence in you. Why does it work?", expect: "Don't sell it. Just say what it does." },
      { day: 16, title: "An Asceticism That Serves", framing: "Cutting back on noise of any kind makes room for the unnamed.", prompt: "Something you've removed from your life that made room for something else. What came in?", expect: "The trade is the practice." },
      { day: 17, title: "Mystical Receptivity", framing: "Available to truths you didn't construct. Open, not credulous.", prompt: "A time you were available to something larger than yourself without belief. What did it ask?", expect: "Belief is one shape; availability is another." },
      { day: 18, title: "What The Body Knows", framing: "Threshold doesn't have to mean disembodied. Sometimes the body knows first.", prompt: "Something your body has known before your mind. What did it do with it?", expect: "Sensation, not interpretation." },
      { day: 19, title: "A Conversation You Didn't Need", framing: "Some communions don't require talking at all.", prompt: "A person you've been with in silence — not awkward silence, full silence. What does that bond hold?", expect: "If only one person — that's enough." },
      { day: 20, title: "Twenty Days Of Listening", framing: "Halfway. What have you been listening for?", prompt: "What's been audible in these twenty days that wasn't audible before?", expect: "Audible — not visible, not knowable. What did you hear?" },

      { day: 21, title: "The Question You Won't Force", framing: "Some questions answer themselves over years. Don't push them.", prompt: "A long question you're letting ripen. What's the discipline of not pushing it?", expect: "The discipline is the answer in progress." },
      { day: 22, title: "What You're Not Ready To Say", framing: "Some truths arrive but haven't yet earned the right to be spoken aloud.", prompt: "Something you know that you haven't yet said. Why not yet?", expect: "Not-yet is its own kind of integrity." },
      { day: 23, title: "Sit With Another", framing: "Being-with at the threshold of someone else's life — a discipline.", prompt: "Someone you've sat with recently in their difficulty. What did you offer that wasn't words?", expect: "Honor what you actually did." },
      { day: 24, title: "Where You'd Be Useless", framing: "Threshold-people are useless in some situations. That's part of the integrity.", prompt: "A situation you'd refuse to apply yourself to. What about it isn't yours?", expect: "Refusal-as-honesty." },
      { day: 25, title: "The Self As Process", framing: "Self-as-illusion: the I is a story, not a thing. Test it on one belief about yourself.", prompt: "A belief about who you are that you suspect is more story than substance. Hold it loosely.", expect: "Loosely — not dismissed." },
      { day: 26, title: "Tradition's Quiet", framing: "Almost every tradition has a silence at its center. Find yours, even if you have no formal tradition.", prompt: "A silence at the center of a tradition you carry. What is it?", expect: "Tradition can be inherited, chosen, or improvised." },
      { day: 27, title: "Letting Go Of Naming", framing: "Some growth comes from refusing to name what's happening to you while it happens.", prompt: "Something happening in your life right now that you're declining to name. What would naming do to it?", expect: "Don't name it for this exercise either." },
      { day: 28, title: "What You'd Pass On Wordlessly", framing: "Some things travel between generations through presence, not instruction.", prompt: "Something you carry that you'd want to transmit, but not by teaching. What is it, and how does it travel?", expect: "Presence is the medium." },
      { day: 29, title: "A Practice For The Year", framing: "What practice will keep you available to silence over the coming year?", prompt: "One small daily commitment that protects your interior quiet. Make it small enough to actually keep.", expect: "Small. Smaller. There." },
      { day: 30, title: "Stay Listening", framing: "The pilgrimage doesn't conclude. It just stops being scaffolded.", prompt: "What are you now listening for that you weren't on Day 1?", expect: "Brief is fine. The answer might be a phrase." },
    ],
  },

  // ─── PILGRIM ─────────────────────────────────────────────────
  pilgrim: {
    archetypeKey: "pilgrim",
    spirit: "Thirty days walking the road, alone, with the question still open.",
    phases: ["The Question", "The Road", "The Continuing"],
    welcomeDefault:
      "You walk. Not toward a city, just away from where standing still would be worse. This pilgrimage is for people whose ground is movement and whose answer is unfolding. Thirty days of questions for the long road — about what you're walking toward, what the walking costs, and what walking continues to be after the obvious destinations are gone.",
    days: [
      { day: 1, title: "Why You Walk", framing: "Start with the why. Pilgrims rarely articulate it.", prompt: "Why are you on the road you're on? Not the official reason — the one underneath.", expect: "Try not to be poetic. The underneath is usually plainer than the official version." },
      { day: 2, title: "The First Step", framing: "The moment you turned from standing still. It was a moment, even if you don't remember it.", prompt: "The first step you took toward where you are now. When was it?", expect: "If you can't pinpoint a moment, name the season." },
      { day: 3, title: "Sovereignty", framing: "Pilgrims carry their own authority. Most days that's a strength; sometimes a loneliness.", prompt: "A decision you made that no one would have made for you. What did being the only one mean?", expect: "Honor both the freedom and the weight." },
      { day: 4, title: "The Last Town", framing: "What you walked away from. Don't romanticize it.", prompt: "What were you walking away from? Be specific. Why did walking serve better than staying?", expect: "Walking-away is data about what you needed." },
      { day: 5, title: "Tragic Vision", framing: "Pilgrims rarely walk because the world is good. More often because something's amiss.", prompt: "What about how things are makes the road necessary for you?", expect: "Not despair — just honest reading." },
      { day: 6, title: "What You Carry", framing: "Pilgrims travel light, but not empty. What's in your pack?", prompt: "Three things — material, mental, or moral — you carry on the road. Why these?", expect: "Specifics: a phrase, an object, a habit, a person's name." },
      { day: 7, title: "What You Set Down", framing: "Setting down is its own practice. It made the walking possible.", prompt: "Something you've set down to walk this far. What does its absence enable?", expect: "Naming the loss honors the trade." },
      { day: 8, title: "A Companion On The Road", framing: "Solo pilgrimages still pass others. Sometimes the meeting is the whole point.", prompt: "Someone you met on the road who changed direction. What did they give you?", expect: "Real person or composite — either works." },
      { day: 9, title: "Practical Steps", framing: "Pilgrims who don't watch the weather end at the bottom of ravines. Pragma matters.", prompt: "A practical concession you've made because the road required it. Are you at peace with it?", expect: "Concession isn't compromise of the journey." },
      { day: 10, title: "The Map You Don't Use", framing: "Pilgrims often have a map. Sometimes they don't consult it.", prompt: "A framework you've been given that you don't reach for. Why not?", expect: "Not rejection — just honest report on what works for you in motion." },

      { day: 11, title: "The Long Stretch", framing: "Most of the road is flat and uneventful. That's where the walking is real.", prompt: "Describe a long unremarkable stretch of your current life. What kept you walking?", expect: "Boredom is part of the practice." },
      { day: 12, title: "An Inn You Didn't Stay At", framing: "Sometimes the offer to settle is real. You said no for a reason.", prompt: "An opportunity to stop walking that you turned down. Why?", expect: "Don't justify — just observe." },
      { day: 13, title: "The Question Open", framing: "Pilgrims don't close their questions. Closing would be arrival, and they don't trust arrival.", prompt: "The question you're walking with — say it cleanly, in one sentence.", expect: "If it takes more than a sentence, you're still answering it." },
      { day: 14, title: "Skepticism In Motion", framing: "Pilgrims are skeptical without being paralyzed. The walking is the resolution.", prompt: "A claim you don't trust but don't refute. How do you hold uncertainty without it stopping you?", expect: "The technique matters." },
      { day: 14, title: "A Storm", framing: "A storm you walked through, not because you should have but because you couldn't not.", prompt: "A hard season on the road. How did the walking continue?", expect: "If walking continued through what should have stopped you, name what carried you." },
      { day: 15, title: "Hospitality", framing: "Pilgrims receive what's given. Even when they didn't ask.", prompt: "Kindness you received on the road that you couldn't pay back. How do you carry it?", expect: "Gratitude that doesn't demand reciprocity." },
      { day: 16, title: "A Wrong Turn", framing: "Sometimes you walked the wrong way for months. The wrong turn was still part of the road.", prompt: "A path you took that turned out to be wrong. What did the wrongness teach you that the right path wouldn't have?", expect: "Without retconning into 'meant to be.'" },
      { day: 17, title: "Other People's Roads", framing: "Pilgrims often see roads they could have taken. Honor the ones you didn't.", prompt: "A life you could have lived. What's it doing right that you can learn from at a distance?", expect: "Without envy or regret." },
      { day: 18, title: "Vital Joy", framing: "Pilgrims rarely walk grimly. The road has joy in it.", prompt: "A moment of joy on the road in the last week. Describe it briefly.", expect: "Resist the urge to explain why it was joy." },
      { day: 19, title: "The Continuing Question", framing: "Has the question shifted? Pilgrims sometimes realize they're carrying a different question than they thought.", prompt: "Is the question you started with still the question you're walking? If it's shifted, into what?", expect: "Shifts are usually quiet." },
      { day: 20, title: "Halfway Down The Road", framing: "Twenty days in. What about the walking has changed?", prompt: "What's different in your stride now than on Day 1?", expect: "Stride — not destination." },

      { day: 21, title: "What You'd Tell A Younger Pilgrim", framing: "Someone is just starting out. They've taken their first step. What do they need to hear?", prompt: "One paragraph for someone who has just left where they were standing.", expect: "Don't tell them the destination. Tell them how to keep walking." },
      { day: 22, title: "When You Stop", framing: "Pilgrims do stop, eventually. Briefly. To eat, sleep, mend.", prompt: "What stopping looks like for you, when it's the right kind. Not abandonment — rest.", expect: "Honor the difference." },
      { day: 23, title: "A Year From Now", framing: "Pilgrims rarely plan, but they can sense direction. What direction is the road taking you?", prompt: "Where does the road seem to be tending, as of right now?", expect: "Tending — not arriving." },
      { day: 24, title: "The Solitude Inside", framing: "Solo doesn't mean alone in your head. There are voices on the road.", prompt: "A voice you carry on the road that isn't yours. Whose, and what do they say?", expect: "Ancestor, mentor, friend, philosopher — any source." },
      { day: 25, title: "What You'd Refuse To Carry", framing: "Even pilgrims set limits. Some weights aren't yours.", prompt: "A weight someone tried to give you that you refused. Why did you refuse it?", expect: "Refusal is part of integrity." },
      { day: 26, title: "An Arrival That Wasn't", framing: "Some places you thought were destinations turned out to be waystations.", prompt: "A place you thought you'd arrived that turned out to be partway. What told you?", expect: "The signal often surprises." },
      { day: 27, title: "Walking With Loss", framing: "By the third decade, the road has dead behind you. They walk with you.", prompt: "Someone gone whose presence you still feel on the road. How do they walk with you?", expect: "If too raw, write less. The naming is enough." },
      { day: 28, title: "What The Walking Has Made", framing: "Pilgrims often don't see what their walking has produced. From here, look.", prompt: "Something your walking has produced — in you, around you, in others — that you can name now.", expect: "Modest naming." },
      { day: 29, title: "An Ongoing Vow", framing: "What do you commit to walking under, going forward?", prompt: "One commitment for the next year. Small enough to keep walking under.", expect: "Small. Keep walking under it." },
      { day: 30, title: "Continue", framing: "End that isn't an end.", prompt: "Three words for the next step.", expect: "Brief is the form." },
    ],
  },

  // ─── TOUCHSTONE ──────────────────────────────────────────────
  touchstone: {
    archetypeKey: "touchstone",
    spirit: "Thirty days of testing — what survives, what doesn't, what to build with.",
    phases: ["Test, Test, Test", "The Stones That Survived", "Building With What Lasts"],
    welcomeDefault:
      "You test. Most pilgrimages assume you need to soften; yours assumes the testing is the way you care. Thirty days of small examinations — of your own claims, of inherited claims, of the things you'd hate to find out are wrong but want to know either way. The point is not to be right but to find out.",
    days: [
      { day: 1, title: "A Claim You Hold", framing: "Pick a claim you'd defend if pressed. Start here.", prompt: "A specific claim you hold confidently. Write it as if it were a hypothesis.", expect: "Specific enough that someone could ask 'how would you know?'" },
      { day: 2, title: "How You'd Know You're Wrong", framing: "What evidence would change your mind on yesterday's claim?", prompt: "What would you need to observe — or learn — to abandon yesterday's claim?", expect: "If nothing would, that's information about the claim." },
      { day: 3, title: "A Claim You Don't Hold", framing: "Same exercise, opposite direction.", prompt: "A claim you don't hold. What evidence would convince you of it?", expect: "Watch for asymmetries with Day 2." },
      { day: 4, title: "Where You Got It", framing: "Most of what we believe came from somewhere. Trace one.", prompt: "A belief you hold. Where did you first encounter it? Has the source been tested?", expect: "Sources aren't evidence, but knowing the source matters." },
      { day: 5, title: "An Asymmetry", framing: "We tend to demand stronger evidence for things we don't want to be true.", prompt: "A topic where you demand more proof for one side than the other. Notice it without fixing it.", expect: "Naming the asymmetry is the test." },
      { day: 6, title: "What Survived", framing: "Most claims you've tested have failed. Some haven't. The survivors are worth listing.", prompt: "Three claims you've held for at least five years that have survived testing. Why?", expect: "What about them resists falsification?" },
      { day: 7, title: "Skepticism As Care", framing: "Touchstones test because they care about what's true, not because they distrust people.", prompt: "Something you tested because you cared about getting it right. Was the testing welcome by the people involved?", expect: "Honest about the social cost." },
      { day: 8, title: "A Test You Avoided", framing: "Some tests you've deliberately skipped. Why?", prompt: "A claim you haven't tested because you don't want to know. Name it.", expect: "Just name it. The testing comes when it comes." },
      { day: 9, title: "Practical Test", framing: "Not all tests are intellectual. Some are: did it work?", prompt: "A practice you've tested by doing. Did it work? How do you know?", expect: "The doing is the test." },
      { day: 10, title: "What Doesn't Yield To Testing", framing: "Some things resist proof. That doesn't make them false.", prompt: "Something true about your life that resists being tested. How do you hold it without testing?", expect: "Honor the resistance." },

      { day: 11, title: "Two Tests, Same Topic", framing: "Most disputes turn on what counts as a test.", prompt: "A topic where you and someone else apply different tests. What does each test favor?", expect: "Description, not verdict." },
      { day: 12, title: "An Old Stone", framing: "Some claims have survived centuries of testing. They've earned standing.", prompt: "A traditional claim that's survived testing across cultures and centuries. What about it survives?", expect: "Specific enough that you could quote a version." },
      { day: 13, title: "Tradition's Testing", framing: "Reverence for tradition isn't anti-test. The tradition has been tested for you.", prompt: "A practice you do because it's been tested by many people for many years. What does the testing show?", expect: "If you can't answer, that's information." },
      { day: 14, title: "Vital Affirmation", framing: "Touchstones can sour. Testing without affirmation produces cynics.", prompt: "Something good in your life you tested and found stood up. Honor it by naming it concretely.", expect: "Concrete." },
      { day: 15, title: "The Test You Failed", framing: "A claim you held that didn't survive. Honor the failure.", prompt: "Something you used to believe that you let go of. What was the test?", expect: "Letting go is the touchstone's competence." },
      { day: 16, title: "Sober Embodiment", framing: "Tested practices live in the body, not just the mind.", prompt: "A bodily practice you do that's survived testing. Why does it work?", expect: "If the why escapes you, the survival is its own evidence." },
      { day: 17, title: "The Charlatan", framing: "Some claims survive testing by avoiding it. You've spotted some.", prompt: "A claim around you that pretends to have been tested but hasn't. How can you tell?", expect: "Diagnose without naming names if needed." },
      { day: 18, title: "Cost Of Testing", framing: "Testing has social costs. Most cultures don't welcome it.", prompt: "A relationship or community where your testing has cost you something. Was the testing worth it?", expect: "Honest about the trade." },
      { day: 19, title: "The Slow Test", framing: "Some things can only be tested over decades. Trust the slow ones.", prompt: "A claim you're testing slowly. What's the timeline, and what would resolve it?", expect: "Patience is part of testing." },
      { day: 20, title: "Halfway, What's Survived", framing: "Twenty days of testing. What's still standing?", prompt: "Which of your claims has gotten stronger from being tested in these twenty days?", expect: "Strength can mean any direction — clearer, more bounded, more honest." },

      { day: 21, title: "An Inherited Claim", framing: "Take one belief you didn't choose. Test it.", prompt: "A belief you inherited (family, culture, tradition). Apply your testing to it. What survives?", expect: "Sometimes everything; sometimes nothing." },
      { day: 22, title: "Building With Survivors", framing: "What can you actually build with the claims that have survived your testing?", prompt: "A small structure (a routine, a habit, a project) built only on claims you've personally tested. What would it look like?", expect: "Small. Testable. Yours." },
      { day: 23, title: "What Your Tests Miss", framing: "Every test has blind spots. Yours do too.", prompt: "A kind of truth your testing doesn't catch. What would the missing kind look like?", expect: "Even acknowledging the blind spot is partial vision." },
      { day: 24, title: "A Friendly Charlatan", framing: "Someone you love holds a claim you can't test. How do you live with that?", prompt: "A loved one's untested claim that you don't challenge. Why don't you?", expect: "The reasons usually matter." },
      { day: 25, title: "The Test That Would Be Cruel", framing: "Some tests would be true to your method and wrong to apply.", prompt: "A test you've withheld because applying it would harm. Honor the restraint.", expect: "Restraint is part of testing well." },
      { day: 26, title: "Egoless Testing", framing: "The strongest testers don't need to be right. The test isn't about them.", prompt: "A test where you wished to be wrong and found out you were right. What did it feel like?", expect: "Both possibilities count." },
      { day: 27, title: "A Stone For The Pocket", framing: "One claim worth carrying as a touchstone — small enough for daily use.", prompt: "One survivor claim small enough to hold daily. Why this one?", expect: "Pick the most portable, not the most important." },
      { day: 28, title: "What You'd Test Next", framing: "Looking ahead. What's the next claim worth your attention?", prompt: "A claim you'd like to test in the coming year. Why this one, why now?", expect: "Selecting the next test is its own discipline." },
      { day: 29, title: "Teaching The Testing", framing: "How would you teach what you do? Most testing is invisible.", prompt: "One paragraph for someone who wants to test more rigorously than they do now.", expect: "Concrete moves, not abstract principles." },
      { day: 30, title: "Hold The Stone", framing: "End by carrying one survivor forward into the rest of the year.", prompt: "Which claim, tested across these thirty days, will you carry into next month?", expect: "One sentence. Holdable." },
    ],
  },

  // ─── HEARTH ──────────────────────────────────────────────────
  hearth: {
    archetypeKey: "hearth",
    spirit: "Thirty days at the table — what binds, what tends, what passes on.",
    phases: ["The Table", "Tending", "Inheritance"],
    welcomeDefault:
      "You're a hearth. The table you set, the people you call, the small fires you keep going — that's the philosophical work. This pilgrimage is for the keeper. Thirty days of small questions about what binds you across the people in your life, what your tending costs, and what gets passed on.",
    days: [
      { day: 1, title: "The Table You Set", framing: "Start at the table. Who's been at it recently?", prompt: "List the people who've been at your table — actual or metaphorical — in the last month. What did the table give them?", expect: "Even three names is enough." },
      { day: 2, title: "The Inherited Recipe", framing: "Most hearths inherit. What did you?", prompt: "A practice or recipe (literal or otherwise) you inherited from someone who tended before you. What do you still do that way?", expect: "If a meal — name it. If an attitude — describe it." },
      { day: 3, title: "Communal Embeddedness", framing: "You're part of a community whether you named it or not. Name yours.", prompt: "Three communities you belong to. What does each ask of you?", expect: "Ask, not give — start with the costs." },
      { day: 4, title: "Reverence For What's Held", framing: "Hearths preserve. Some of what's preserved is worth examining anyway.", prompt: "A tradition you keep that you also have questions about. Hold both.", expect: "The questions don't have to win." },
      { day: 5, title: "Tending Small", framing: "Most tending is invisible. Most of it doesn't feel heroic. That's the hearth's character.", prompt: "Three small tendings you did this week that no one would have noticed if you didn't. Name them.", expect: "Concrete: meals, calls, visits, repairs." },
      { day: 6, title: "Someone You'd Call", framing: "Hearths have people. Specific ones. Who would you call first if something happened?", prompt: "Three people you'd call in different crises. Why each?", expect: "Different crises — not just one." },
      { day: 7, title: "Practical Care", framing: "Care that doesn't translate to action is sentiment. Hearths know the difference.", prompt: "A way you care that involves a small inconvenience or cost. What is it?", expect: "Don't make it heroic. Just describe it." },
      { day: 8, title: "Vital Warmth", framing: "Hearths can dry into duty. Don't let that happen. Where's your warmth coming from?", prompt: "What still warms you about the people you tend? Be specific.", expect: "Specific enough to remember in February." },
      { day: 9, title: "The Hard Conversation", framing: "Hearths sometimes have to host difficult ones. Most people defer them. Hearths don't.", prompt: "A hard conversation pending in your life. What's the right time and place to host it?", expect: "Time and place — not just topic." },
      { day: 10, title: "What The Table Holds Without Saying", framing: "Some of what a table holds isn't spoken. The unsaid is part of the hospitality.", prompt: "Something held at your table without being said. Name it for yourself.", expect: "For yourself. Not for the table." },

      { day: 11, title: "An Old Letter", framing: "Hearths often correspond. Sometimes for decades.", prompt: "A correspondence — literal or via text/calls/visits — that's lasted years. What does the long-haul give that the short one wouldn't?", expect: "If absent, name the absence." },
      { day: 12, title: "Universal Hospitality", framing: "Hearths can play favorites or extend to strangers. The widening matters.", prompt: "Someone outside your circle who you'd welcome at the table. Why them?", expect: "The reason tells you what your hospitality is built on." },
      { day: 13, title: "The Visitor Who Took Without Asking", framing: "Hearths get used. Sometimes the using is welcome; sometimes not.", prompt: "Someone who's taken more than they gave. How do you tell whether it's still okay?", expect: "Internal tell, not external rule." },
      { day: 14, title: "A Disagreement At The Table", framing: "Tables hold disagreements. The hearth's skill is keeping the table whole through them.", prompt: "A disagreement among people you tend. What kept the table whole?", expect: "Tactic, not principle." },
      { day: 15, title: "The Smaller Hearth", framing: "Sometimes the hearth shrinks. Concentration is also a virtue.", prompt: "A circle you've deliberately shrunk recently. What did the shrinking serve?", expect: "Concentration is not abandonment." },
      { day: 16, title: "Tradition That Failed", framing: "Some inherited practices stopped serving. Letting them go is part of tending well.", prompt: "A tradition you've quietly stopped doing. Why?", expect: "Without apology to the inheritance." },
      { day: 17, title: "What Your Table Lacks", framing: "Every table has gaps. Yours does too.", prompt: "Something your circle doesn't have that another circle has. What would adding it cost?", expect: "Cost — not 'is it worth it.'" },
      { day: 18, title: "An Outside Hearth", framing: "Other people's hearths can teach yours.", prompt: "A community whose tending you admire from outside. What do they do that yours doesn't?", expect: "Learning, not envying." },
      { day: 19, title: "The Long Tend", framing: "Some tending shows results across decades, not weeks. Find one of yours.", prompt: "A long tending whose payoff is taking years. What keeps you going while the result is slow?", expect: "The motivation matters more than the result here." },
      { day: 20, title: "Halfway Tended", framing: "Twenty days in. What has tending taught you in this pilgrimage?", prompt: "What's surprised you about your own tending across these twenty days?", expect: "Small surprises. Don't manufacture." },

      { day: 21, title: "What Gets Passed On", framing: "Hearths build for what comes after. What's getting transmitted?", prompt: "Something you tend that someone after you will inherit. What do you want them to know about it?", expect: "Not legacy — instruction." },
      { day: 22, title: "An Heir You Don't Have Yet", framing: "Sometimes the next keeper isn't visible. That's okay. The tending continues.", prompt: "A part of your tending that has no obvious successor. Are you okay with that?", expect: "Sometimes the tending dies with the keeper. That's a possibility worth sitting with." },
      { day: 23, title: "The Cost Of Tending", framing: "Tending has a price. Hearths are bad at naming it. Try.", prompt: "What does your tending cost you that you don't usually count?", expect: "Time, energy, opportunities, attention." },
      { day: 24, title: "When You Were Tended", framing: "Hearths are usually the ones tending. Honor the times you've been the one tended.", prompt: "A time you were tended by someone else's hearth. How does it sit?", expect: "Receiving is harder than giving for many hearths." },
      { day: 25, title: "A Recipe That Travels", framing: "Some of your tending could travel. Sharing isn't dilution.", prompt: "A small practice from your tending that could be useful in someone else's table. Describe it transferably.", expect: "Transferably — i.e., generic-enough that another hearth could try it." },
      { day: 26, title: "Tradition's Future", framing: "Traditions endure when each generation adds something. What are you adding?", prompt: "A small change you've made to an inherited tradition. What does the change carry forward?", expect: "Even a small alteration counts." },
      { day: 27, title: "An Apology Owed", framing: "Hearths fail too. Naming the failure honors the work.", prompt: "Someone at your table you owe a small repair. What's the smallest honest repair you could offer?", expect: "Small. Honest. Don't over-stage." },
      { day: 28, title: "A Hearth Across Distance", framing: "Some tables are kept across continents. The distance doesn't dilute.", prompt: "Someone you tend without proximity. What practice keeps it real?", expect: "Specific — texts, calls, letters, visits, gifts." },
      { day: 29, title: "What You'd Cook Tonight", framing: "Bring it to the immediate. Something to do with tomorrow's tending.", prompt: "One specific small act of tending you'll do this week. Name it.", expect: "Small enough to actually do." },
      { day: 30, title: "Keep The Fire", framing: "The pilgrimage ends; the hearth doesn't.", prompt: "What about your tending will be different next month because of these thirty days?", expect: "Even one small change counts." },
    ],
  },

  // ─── FORGE ───────────────────────────────────────────────────
  forge: {
    archetypeKey: "forge",
    spirit: "Thirty days at the forge — what resists, what you hammer, what's made.",
    phases: ["The Resistance", "The Hammer", "The Made Thing"],
    welcomeDefault:
      "You make. Most pilgrimages assume reflection produces change; yours assumes the change is what you're already trying to make. Thirty days of small questions about what's resisting you, how you're shaping it, what you've made that lasts. The work is the practice. The reflection is in service.",
    days: [
      { day: 1, title: "What You're Making", framing: "Start with what you're actually trying to bring into being.", prompt: "Something you're trying to make right now — a project, a change, a thing that doesn't yet exist. Name it.", expect: "If multiple — pick the most live one." },
      { day: 2, title: "The Resistance", framing: "Every thing made is made against resistance. What's yours?", prompt: "What's resisting the thing you're making? Internal, external, both?", expect: "Specific — not just 'inertia.'" },
      { day: 3, title: "Will To Power", framing: "Forge-people believe in shaping. Some days the believing is harder than the shaping.", prompt: "Where in your life have you stopped believing you can shape? What would re-believing cost?", expect: "Cost — not promise." },
      { day: 4, title: "Vital Affirmation", framing: "Forges run on affirmation, not grievance. Check what's fueling you.", prompt: "Is your current making powered by possibility or by anger? Be honest.", expect: "Both can power forge-work; the kind matters." },
      { day: 5, title: "Universal Reach", framing: "Forges that build only for their own kind end up making little. Who's yours for?", prompt: "Who is your current making meant for? Be specific.", expect: "Specific enough that you could name three of them." },
      { day: 6, title: "Communal Forging", framing: "Most made things are made with others. The forge is rarely solo.", prompt: "Who's working with you on this making? Even tangentially.", expect: "Anyone whose presence makes the work possible." },
      { day: 7, title: "Practical Move", framing: "Most forging is small daily moves. Heroic versions are rare.", prompt: "One small move tomorrow that advances the making. Be specific.", expect: "Specific enough that you'd know if you did it." },
      { day: 8, title: "The Trial", framing: "Forges test what they make. Most makers under-test.", prompt: "A way you could put your current making to a test this week. What would the test reveal?", expect: "Test — not opinion-poll." },
      { day: 9, title: "Reasoning About Means", framing: "Forges with vision but no plan don't make. Plan part of yours.", prompt: "What's the next concrete step? After that? After that?", expect: "Three steps deep." },
      { day: 10, title: "The Anvil", framing: "Every forge has a fixed surface to shape against. What's yours?", prompt: "The fixed thing — community, deadline, person, principle — that your making is shaped against. What is it?", expect: "Without an anvil, the hammer falls into air." },

      { day: 11, title: "What Doesn't Yield", framing: "Some material refuses to be shaped. Knowing it is part of the work.", prompt: "Something you've been trying to shape that won't yield. Why?", expect: "Refusal is information about the material, not just the maker." },
      { day: 12, title: "A Made Thing You're Proud Of", framing: "Look at what you've already made. The current making is part of a longer arc.", prompt: "Something you've made (in the broadest sense — built, founded, raised, repaired) that you're proud of. Why?", expect: "Honoring without modesty-tic." },
      { day: 13, title: "What You Unmade", framing: "Forges sometimes have to unmake. Letting something dissolve is also work.", prompt: "Something you actively let dissolve. Why was unmaking right?", expect: "Unmaking is harder than refusing to make in the first place." },
      { day: 14, title: "A Maker You Admire", framing: "Forges learn by watching forges. Someone you admire was once you.", prompt: "Someone who made something you're trying to make. What did their process look like?", expect: "Process — not result." },
      { day: 15, title: "The Hammer's Cost", framing: "Forging costs the forger. Most makers underestimate the rate.", prompt: "What is the current making costing you? Be specific.", expect: "Time, sleep, relationships, attention, money." },
      { day: 16, title: "Tradition's Material", framing: "Forge-people sometimes dismiss tradition as just material. It's also instruction.", prompt: "Something you'd be making better if you used a tradition you've ignored. What would using it cost?", expect: "Use, not adopt." },
      { day: 17, title: "Skeptical Forging", framing: "Even the most decisive makers should doubt periodically. When was your last doubt?", prompt: "A real doubt about the current making. What would resolve it?", expect: "Resolve — even if 'continue and find out.'" },
      { day: 18, title: "The Premortem", framing: "Imagine the making has failed completely. Why did it fail?", prompt: "Future-fail your current making. List the three likeliest reasons it didn't work.", expect: "Specific. Plausible." },
      { day: 19, title: "What Survives Failure", framing: "Forges that fail still make something — usually skill, sometimes a community.", prompt: "If the current making fails, what will still have been made by trying?", expect: "Honor the residue." },
      { day: 20, title: "Halfway Through Heat", framing: "Twenty days. What has the forging revealed in this pilgrimage?", prompt: "What's clearer to you about your making after twenty days of attention?", expect: "Even small clarity counts." },

      { day: 21, title: "The Helper You Haven't Asked", framing: "Most makers refuse help they should accept. Who could you ask?", prompt: "Someone whose help would speed your making. Have you asked? Why or why not?", expect: "Why not is usually the real question." },
      { day: 22, title: "Shipping", framing: "Forges that don't ship aren't forges. They're workshops.", prompt: "What does shipping your current making look like? When?", expect: "Date if possible." },
      { day: 23, title: "An Asceticism", framing: "Most major makings require giving things up. What's the trade?", prompt: "Something you've given up for the making. Honor it by naming.", expect: "Without resentment — just description." },
      { day: 24, title: "The Apprentice", framing: "Forges teach by working with others. Who's learning from yours?", prompt: "Someone learning from how you make — explicitly or implicitly. What are they catching?", expect: "Even an apprentice you didn't choose counts." },
      { day: 25, title: "A Material You Won't Use", framing: "Some materials you've decided not to forge with. Why?", prompt: "A tool, partner, or approach you've refused to use in this making. Why?", expect: "The refusal usually reveals what you value." },
      { day: 26, title: "What The Made Thing Will Outlast", framing: "Some makings outlive their makers. Most don't. Be honest.", prompt: "How long do you actually expect this making to last? What would extend it?", expect: "Honest, not aspirational." },
      { day: 27, title: "A Failure To Repair", framing: "A made thing that's broken. Repair is also making.", prompt: "Something already-made in your life that needs repair. What would repairing it cost?", expect: "Cost. Time. Pride." },
      { day: 28, title: "The Next Making", framing: "Forges think in series. What comes after this one?", prompt: "After the current making, what would you want to make next? Even tentatively.", expect: "Tentative is fine. Direction matters." },
      { day: 29, title: "What You'd Tell A Young Forger", framing: "Someone is starting their first major making. What do they need?", prompt: "One paragraph for someone just beginning to make something serious.", expect: "Concrete, not motivational." },
      { day: 30, title: "Keep Making", framing: "The pilgrimage closes. The forge doesn't.", prompt: "One change to your making practice that you'll keep from these thirty days.", expect: "One. Make it small enough to keep." },
    ],
  },

  // ─── HAMMER ──────────────────────────────────────────────────
  hammer: {
    archetypeKey: "hammer",
    spirit: "Thirty days of refusal — what to break, what it costs, what survives.",
    phases: ["Refusal", "The Cost", "What's Left After"],
    welcomeDefault:
      "You refuse. Most pilgrimages try to soften you; yours sharpens. Thirty days of small questions about what you won't accept, what your refusing has cost, and what stands when the refusing has done its work. The point isn't to break more. It's to break with precision — and to know what the breaking is for.",
    days: [
      { day: 1, title: "What You Refuse", framing: "Begin with the no in you. What does it land on?", prompt: "Three things you currently refuse — small or large, public or private.", expect: "Specific. Refusals tell you what you value." },
      { day: 2, title: "The First Refusal", framing: "When you first said no to something most people accepted. The moment formed you.", prompt: "An early no that shaped you. What did it cost? Was it worth it?", expect: "Cost first, worth second." },
      { day: 3, title: "Sovereign Self", framing: "Hammers locate authority in themselves. Most days that's a strength.", prompt: "A decision you made against everyone else's counsel. What told you you were right?", expect: "Internal tell, not external proof." },
      { day: 4, title: "Will Against Inertia", framing: "Most refusal is against drift, not opposition. Most things continue because no one stops them.", prompt: "Something you should refuse that's drifting on. What's the cost of letting it drift?", expect: "Drift has a price." },
      { day: 5, title: "Tragic Refusal", framing: "Hammers know that refusing has consequences. The refusing is still right.", prompt: "A refusal you made knowing it would damage something. Are you at peace with it?", expect: "Honest — not propaganda for your past self." },
      { day: 6, title: "Vital Affirmation", framing: "Hammers can sour into pure refusal. Don't. Find what you affirm.", prompt: "Three things you affirm unambiguously. Don't qualify.", expect: "If qualifications creep in, redo." },
      { day: 7, title: "What Pleasure You'd Refuse", framing: "Some pleasures cost more than they're worth. The hammer knows.", prompt: "A pleasure you've refused on principle. What's the principle?", expect: "Principle, not aesthetics." },
      { day: 8, title: "A Refusal You Regret", framing: "Hammers refuse too much sometimes. Honor the regret.", prompt: "A refusal you'd take back. What did it cost that you didn't see at the time?", expect: "Without re-justifying." },
      { day: 9, title: "Skeptical Refusal", framing: "The strongest refusals come after the hardest examination. Otherwise it's just reflex.", prompt: "A refusal you examined fully before holding. How did the examination strengthen it?", expect: "Examination is part of the hammer's craft." },
      { day: 10, title: "Practical Refusal", framing: "Some refusals are pragmatic. Not heroic. Just the only thing that worked.", prompt: "A refusal where the principle was practical, not moral. Honor the practicality.", expect: "Practical can be principled too." },

      { day: 11, title: "Universal Refusal", framing: "If your refusal applies only to you, it's selective. The hammer's refusals are broader.", prompt: "Does your strongest refusal apply to people unlike you in equal measure? Where does it break down?", expect: "The breakdown is information." },
      { day: 12, title: "Refusal As Love", framing: "Hammers sometimes refuse because they care. The pretense of care without refusal is enabling.", prompt: "A time refusing was the loving move. How did you tell it was love?", expect: "Sometimes only in retrospect — that counts." },
      { day: 13, title: "The Cost To You", framing: "Refusing costs the refuser. Most days that's the deal.", prompt: "What has refusing cost you in the last year? Be specific.", expect: "Specific: relationships, opportunities, money, time, peace." },
      { day: 14, title: "An Asceticism", framing: "Refusal is asceticism's blood relative. Both turn on giving up.", prompt: "Something you've given up that the giving-up has freed something for. What did it free?", expect: "Freedom is the test." },
      { day: 15, title: "Community Cost", framing: "Refusals exile you from places. Some of the exile is worth it; some isn't.", prompt: "A community you can't be fully in because of your refusing. Are you okay with that?", expect: "Sit with whichever answer." },
      { day: 16, title: "Tradition To Refuse", framing: "Inherited practices include some worth breaking. The hammer breaks specifically.", prompt: "A tradition you carry that's worth breaking. What would breaking it ask of you?", expect: "Ask — not gain." },
      { day: 17, title: "Tradition To Keep", framing: "The hammer's selectivity matters. Some inherited things should be kept.", prompt: "A tradition you actively keep even though others might expect you to break it. Why keep it?", expect: "Selectivity is the discipline." },
      { day: 18, title: "Refusing Cowardice", framing: "Some of what looks like principle is actually cowardice in good clothes. Test yours.", prompt: "A refusal that might be cowardice in disguise. Honestly: is it?", expect: "Hard. Required." },
      { day: 19, title: "Refusing Pride", framing: "Some of what looks like principle is pride. Same test.", prompt: "A refusal where pride is doing most of the work. What's underneath it?", expect: "If pride, then what?" },
      { day: 20, title: "Halfway Refusing", framing: "Twenty days in. What has refusal looked like in this pilgrimage?", prompt: "What about your refusing has gotten clearer in these twenty days?", expect: "Sharpness is the practice." },

      { day: 21, title: "What Survives The Hammer", framing: "After the refusing, something remains. What's still standing?", prompt: "After everything you've refused, what's still in your life that you've affirmed by keeping?", expect: "Not the inverse of refusal — affirmation is its own act." },
      { day: 22, title: "An Apology For Excess", framing: "The hammer breaks things it shouldn't sometimes. Where do you owe a repair?", prompt: "Someone or something you damaged by refusing too much, too sharply, or too soon. How would you repair?", expect: "If the relationship is gone, the repair is internal." },
      { day: 23, title: "The Long Refusal", framing: "Some refusals are months and years, not moments. The slow refusing.", prompt: "A long refusing you're inside. What's the cost month-over-month?", expect: "Long refusing wears differently than fast refusing." },
      { day: 24, title: "A Refusal Coming", framing: "Most hammers know what's next. What refusal is approaching for you?", prompt: "A refusal you anticipate having to make this year. How will you do it?", expect: "Plan, not just resolve." },
      { day: 25, title: "Allies In Refusal", framing: "Even hammers have allies. Solo refusing is sometimes pride.", prompt: "Three people who'd back your refusing if asked. Have you asked?", expect: "Asking is a refusal of pride." },
      { day: 26, title: "The Refusing You Won't Do Anymore", framing: "Some refusals stop serving. Letting them go is also the hammer's discipline.", prompt: "A refusal you've quietly set down. Why was setting it down right?", expect: "Quietly is fine. Loudly isn't required." },
      { day: 27, title: "The Question Behind Refusing", framing: "Beneath refusing is usually a question. What's yours?", prompt: "What question is your refusing trying to answer?", expect: "Question, not conclusion." },
      { day: 28, title: "Refusing And Loving", framing: "The hardest hammer-craft: refuse without ceasing to love what you refuse for the sake of.", prompt: "Someone you refuse with and for, simultaneously. How do you hold both?", expect: "Both, not either-or." },
      { day: 29, title: "What To Refuse Next", framing: "Next month. What's the next refusing?", prompt: "One refusing for the coming month. Make it specific.", expect: "Specific, dated, owned." },
      { day: 30, title: "The Hammer Resting", framing: "Even hammers rest. The rest is part of the practice.", prompt: "How do you rest the hammer without losing its edge?", expect: "Method, not metaphor." },
    ],
  },

  // ─── GARDEN ──────────────────────────────────────────────────
  garden: {
    archetypeKey: "garden",
    spirit: "Thirty days of attention — what grows, what's worth tasting, what light remains.",
    phases: ["Attention", "Taste", "Late Light"],
    welcomeDefault:
      "You attend. Most pilgrimages train you in discipline; yours trains you in not flinching from pleasure. Thirty days of small noticings — figs, weather, conversation, the way a room is held — and the questions they open. The garden is not a metaphor here. The attending is the practice.",
    days: [
      { day: 1, title: "Today's First Taste", framing: "Begin in the body. Something you tasted today, in detail.", prompt: "Something you ate or drank today. Describe it concretely — temperature, texture, what it surprised you with.", expect: "Sense-data. No interpretation." },
      { day: 2, title: "A Window You Like", framing: "A place where light comes in well. Notice why.", prompt: "A window in your life. What does the light do there?", expect: "Specific window. Specific time of day." },
      { day: 3, title: "Embodied Sensibility", framing: "Your body knows things before you do. Honor that knowing.", prompt: "Something your body has been telling you that you haven't yet acted on. What is it?", expect: "Don't translate it into a problem to solve." },
      { day: 4, title: "The Fig", framing: "Some pleasures are seasonal. Don't miss them.", prompt: "What's in season right now in your life — literally or metaphorically — that won't be for long?", expect: "Specific. Eat it." },
      { day: 5, title: "Vital Affirmation", framing: "Gardens affirm what's here. The metaphysical question can wait.", prompt: "Three things in your life today worth affirming. Don't qualify.", expect: "Affirm — short and plain." },
      { day: 6, title: "Practical Tending", framing: "Gardens get tended. Inattentive ones go to seed.", prompt: "A small tending in your life that pays back the time. What is it?", expect: "Tending — not project." },
      { day: 7, title: "Companions At The Table", framing: "Gardens are best with company. Who eats with you?", prompt: "Someone who eats well with you. Why is it good with them?", expect: "Specific person, specific meal, specific reason." },
      { day: 8, title: "Trust The Tongue", framing: "What your senses tell you is data — not opinion to be argued with.", prompt: "Something you knew through taste/touch/smell that argument couldn't reach. What was it?", expect: "Sensory primacy." },
      { day: 9, title: "Skeptical Pleasure", framing: "Not every pleasure is worth the having. Some you correctly decline.", prompt: "A pleasure you've declined recently because it wasn't quite worth it. How did you know?", expect: "Internal tell — taste discriminates." },
      { day: 10, title: "Tragic Garden", framing: "Frost will come. The eating now is honest, not denial.", prompt: "What about your current garden's season ending makes the eating now more right?", expect: "Late-summer attention." },

      { day: 11, title: "A Recipe You Trust", framing: "Some inherited practices reliably produce pleasure. Honor one.", prompt: "A small inherited practice (a recipe, a routine, a method) that reliably gives. What does it give?", expect: "Reliability is itself a quality." },
      { day: 12, title: "What Tradition Provides", framing: "Tradition curates which figs are worth eating. Sometimes that's the whole work.", prompt: "Something the tradition you carry has saved you from having to figure out alone. What is it?", expect: "Without sentiment — just gratitude for the selection." },
      { day: 13, title: "Communal Eating", framing: "A meal alone is one thing. A meal at a long table is another.", prompt: "A recent meal with company that mattered. What made it matter?", expect: "Specific moment in the meal." },
      { day: 14, title: "Saying No To A Garden", framing: "Some gardens you've been offered weren't yours. Honor the no.", prompt: "An invitation to a kind of life that wasn't yours. Why did you decline?", expect: "Honor without defensiveness." },
      { day: 15, title: "The Reading That Tastes", framing: "Some passages read like a sip of wine. Find one this week.", prompt: "A passage you read recently that tasted like something. Quote it.", expect: "Quote, then describe the taste." },
      { day: 16, title: "Sovereign Pleasure", framing: "Gardens are not collective. Your tongue is yours.", prompt: "A pleasure you have that most people around you don't share. Why is it yours?", expect: "Don't apologize for it." },
      { day: 17, title: "Practical Wisdom", framing: "Most pleasure depends on knowing when. Timing is everything.", prompt: "A pleasure you mistimed recently. What did the mistiming cost?", expect: "Mistiming has a price." },
      { day: 18, title: "What Doesn't Grow Where You Are", framing: "Some things won't grow in your soil. That's data, not deprivation.", prompt: "Something that doesn't grow well in your current life. What soil would it need?", expect: "Description, not migration plan." },
      { day: 19, title: "Universal Hospitality", framing: "Gardens are best when others can eat from them. Selfish gardens go bitter.", prompt: "Who eats from your garden besides you? In any sense.", expect: "Even one name counts." },
      { day: 20, title: "Halfway Through Season", framing: "Twenty days of attention. What's clearer now?", prompt: "What have you been tasting in these twenty days that you wouldn't have noticed on Day 1?", expect: "Sensory specifics, not interpretation." },

      { day: 21, title: "Late Light", framing: "The angle of the sun in October. The way some pleasures sharpen as they shrink.", prompt: "Something whose value has sharpened recently because its time is running short. What is it?", expect: "Without melodrama. Just notice." },
      { day: 22, title: "What You'd Cook Tomorrow", framing: "Gardens produce meals. What would you serve?", prompt: "If you cooked tomorrow for someone you love, what would you make? Why?", expect: "Specific meal. Specific person." },
      { day: 23, title: "Pleasures You Haven't Tried", framing: "Some figs you haven't eaten yet. The list isn't infinite — but it's not short.", prompt: "One pleasure you've been meaning to try and haven't. What's been keeping you?", expect: "Be honest about the holding-off." },
      { day: 24, title: "An Eating That Stayed", framing: "Some meals stay with you decades. Find one.", prompt: "A meal from years ago you remember in detail. What about it lodged?", expect: "Detail is the witness." },
      { day: 25, title: "Saying Yes To Frost", framing: "Late-season eating includes acknowledging the end. The acknowledgement is part of the taste.", prompt: "Something coming to an end in your life. Not lament — describe the late tasting.", expect: "Late tasting, not premortem." },
      { day: 26, title: "A Tradition You'd Cook For", framing: "Some traditions worth feeding even when no one asks you to.", prompt: "A tradition you'd cook for even if it asked nothing of you. Why?", expect: "Voluntary tending is the deepest." },
      { day: 27, title: "Skeptical Of A Pleasure", framing: "Periodically, examine a long-standing pleasure for whether it still serves.", prompt: "A pleasure you've held for years. Does it still serve, or are you holding it from habit?", expect: "If habit, the pleasure has hollowed." },
      { day: 28, title: "Asceticism To Make Room", framing: "Sometimes a small subtraction lets a larger taste in.", prompt: "Something small you'd give up to make room for something better. What's the trade?", expect: "Trade. Not sacrifice." },
      { day: 29, title: "What You'll Plant Next", framing: "What would you set growing now for the next season?", prompt: "Something — a habit, a friendship, a small project, a practice — you'd plant now for next year's harvest.", expect: "Plant, not declare." },
      { day: 30, title: "Eat Well", framing: "End where you started: in the body. The attention is the gift.", prompt: "How will the rest of this season be different because you spent thirty days attending?", expect: "Even one specific change counts." },
    ],
  },

  // ─── LIGHTHOUSE ──────────────────────────────────────────────
  lighthouse: {
    archetypeKey: "lighthouse",
    spirit: "Thirty days tending the light — the pattern, the watch, the inheritance.",
    phases: ["The Pattern", "The Watch", "The Inheritance Of Light"],
    welcomeDefault:
      "You keep the light. Some boats won't come this year, some won't come this decade. The light is for them anyway. Thirty days of slow questions about the patterns beneath surface, the discipline of the watch, and what you're keeping lit for whoever needs it later.",
    days: [
      { day: 1, title: "The Pattern You See", framing: "Begin with the recurring thing. Lighthouses notice patterns across centuries.", prompt: "A pattern you've noticed that most people don't. What recurs that they miss?", expect: "Specific. Personal observation, not received wisdom." },
      { day: 2, title: "Theoretical Drive", framing: "You pursue understanding for its own sake. That's rarer than people pretend.", prompt: "A question you're spending time on that has no practical payoff. Why do you keep at it?", expect: "Honor the lack of payoff." },
      { day: 3, title: "Trust In Reason", framing: "Lighthouses trust careful argument. It's slow but it stays lit longest.", prompt: "An argument you've worked through over years that still holds. What about it has held?", expect: "Specific — paraphrase the argument." },
      { day: 4, title: "Universal Reach", framing: "The light is for everyone who can see it, not just the right kind of boats.", prompt: "An understanding you have that you'd want everyone to have. What does universalizing cost?", expect: "Cost — most universalizations have one." },
      { day: 5, title: "The Slow Read", framing: "Lighthouses read across centuries. A passage rewards going slow.", prompt: "A passage you've read multiple times that opens further each time. Quote it and describe what's opening.", expect: "Quote first, then the opening." },
      { day: 6, title: "Mystical Pattern", framing: "Some patterns can't be argued, only sensed. Honor those too.", prompt: "A pattern you sense but can't yet defend with argument. What does it ask of you?", expect: "Ask — not demand." },
      { day: 7, title: "Ascetic Watch", framing: "Lighthouses live simply. The light is what's bright; the keeper is plain.", prompt: "A simplicity you keep because it lets you tend something else better. What is it?", expect: "Specific — what you've given up to keep the light." },
      { day: 8, title: "The Light's Direction", framing: "What direction is your light pointing? Some directions you've chosen; some have chosen you.", prompt: "What are you trying to make visible? Be specific about the audience.", expect: "Direction, not vague illumination." },
      { day: 9, title: "What Has Been Lost", framing: "Lighthouses fail too. Boats hit rocks anyway. The work continues.", prompt: "Something you tended that didn't reach who it was meant for. How do you carry the missing?", expect: "Carry, don't resolve." },
      { day: 10, title: "Reverence Without Faith", framing: "Lighthouses can revere a tradition without believing every claim. The keeping is its own integrity.", prompt: "A tradition you honor without fully assenting to. How do you hold both?", expect: "Both, not either-or." },

      { day: 11, title: "The Lamp", framing: "The actual light — the thing you're trying to keep lit. Describe it small.", prompt: "What concrete practice keeps your light lit? Daily or near-daily.", expect: "Concrete: study, writing, conversation, reading." },
      { day: 12, title: "A Boat You'll Never See", framing: "Most boats pass without the keeper knowing. Your light helps people you'll never meet.", prompt: "Someone you helped without knowing. How can you tell?", expect: "Even partial answers — the trace, not the testimony." },
      { day: 13, title: "Tradition Of Keepers", framing: "Lighthouses come in lineages. Who's in yours?", prompt: "Three keepers — alive or dead — whose practice yours descends from. What did you take from each?", expect: "Specific debts." },
      { day: 14, title: "The Cold Watch", framing: "Some seasons are long and uneventful. The watch is the work.", prompt: "A cold stretch in your tending. What kept you at the lamp?", expect: "What kept you — not what should have." },
      { day: 15, title: "Reach Across Time", framing: "Lighthouses tend light for centuries. The horizon is longer than careers.", prompt: "Something you tend whose payoff (if any) is decades out. Why is the long horizon right?", expect: "Right — not 'fine.'" },
      { day: 16, title: "Practical Maintenance", framing: "Even the most theoretical practice has practical maintenance.", prompt: "Practical work that keeps your tending possible. Pay your bills, repair the lamp.", expect: "Concrete chores. Honor them." },
      { day: 17, title: "An Apprentice", framing: "Someone is watching how you tend. Maybe you don't know who.", prompt: "Someone you might be teaching by example. What might they be catching from you?", expect: "Might. The honest version." },
      { day: 18, title: "Asymmetry Of Effort", framing: "The keeper does more than most boats know. The asymmetry is part of the role.", prompt: "What you've put in that goes mostly unseen. Honor it without self-pity.", expect: "Just description." },
      { day: 19, title: "Skepticism Of Your Own Light", framing: "Even keepers should sometimes ask whether the light is aimed right.", prompt: "A doubt about whether your tending is reaching what it should. Real, or imagined?", expect: "If real, what would tell you?" },
      { day: 20, title: "Halfway Through Watch", framing: "Twenty days. What about the tending has clarified?", prompt: "What's different about how you understand your tending after twenty days of attention?", expect: "Even subtle shifts." },

      { day: 21, title: "What Survives The Keeper", framing: "Lighthouses outlive keepers. What from your tending will outlive you?", prompt: "Something you tend that will continue without you. What do you want it to keep?", expect: "Specific. The handoff matters." },
      { day: 22, title: "The Manuscript", framing: "Some keepers write. Some teach. Some build. What's your medium?", prompt: "The form your tending takes. What does the form preserve that another form wouldn't?", expect: "Forms have grammars. Yours has one." },
      { day: 23, title: "What You'd Pass To One Person", framing: "Some inheritance is transmitted by lineage, one person to one person.", prompt: "If you could pass one piece of your tending to one specific person, what to whom?", expect: "Specific, even if unrealistic." },
      { day: 24, title: "The Steady Light", framing: "The light's value is its steadiness. The keeper's job is steadiness.", prompt: "What discipline keeps your tending steady through fatigue?", expect: "Discipline — not motivation." },
      { day: 25, title: "Universal Watch", framing: "Lighthouses aren't selective. The light is for everyone who can see.", prompt: "Where does your tending become selective when it shouldn't? Notice without fixing.", expect: "Noticing first." },
      { day: 26, title: "Tragic Tending", framing: "Some of what you tend won't be received. Tending is still right.", prompt: "Something you tend knowing it likely won't reach. Why still tend it?", expect: "Why still — not 'it might.'" },
      { day: 27, title: "Embodied Tending", framing: "Even tending of abstract things lives in bodies. Mind your own.", prompt: "A bodily practice that keeps your tending possible. What is it?", expect: "Bodily — sleep, movement, food, presence." },
      { day: 28, title: "What You'd Read Next", framing: "Lighthouses keep their own light fed by reading. What's the next text?", prompt: "What text or thinker is next in your reading? Why?", expect: "Specific. Why now." },
      { day: 29, title: "An Heir You'd Train", framing: "Most lighthouses don't have apprentices. Some do. What would training look like?", prompt: "How would you train someone to take over what you tend? One paragraph.", expect: "Concrete. Method, not principle." },
      { day: 30, title: "Keep The Light", framing: "Pilgrimages end. The watch continues.", prompt: "What about your tending will change because of these thirty days?", expect: "Even one keepable change." },
    ],
  },
};

// ─── Per-(archetype, flavor) enrollment lenses ─────────────────────
//
// Only the most likely flavor pairings per archetype have hand-tuned
// lenses (4-6 each). Other flavors fall through to the arc's
// welcomeDefault. The picker function in lib/quiz-journey.ts surfaces
// the same flavor that /result shows, so the user reads a lens
// matching the archetype + flavor word they see elsewhere on the site.

export const FLAVOR_LENSES: Record<string, FlavorLensMap> = {
  cartographer: {
    TV: "You map carefully and also know the territory holds grief the cleanest framework can't cover. This pilgrimage assumes both — the rigor and the limit. Don't soften either across the next thirty days.",
    CE: "You map for company. The framework you draw is one you'd hand across a table. These thirty days will press you on what your map gives to people unlike you — and where it stops being theirs.",
    RT: "You honor older maps. The pilgrimage asks you to redraw without dismissing what came before. Where the inheritance still serves, honor it. Where it doesn't, redraw — and explain why.",
    AT: "You map with restraint. Most makers under-edit; you don't. The thirty days will test what stays when you keep stripping. The smallest sufficient map is usually the strongest.",
    VA: "You haven't lost the joy of mapping. The thirty days will sharpen without grimming. The exercise is precision in service of what you find worth attending to.",
    SR: "You bring doubt to the work without paralysis. The thirty days will deepen the doubt where it's useful and surface where it's become a hiding place.",
  },
  keel: {
    TR: "You hold by reason as well as by feel. The pilgrimage will press both — the reasons you've been giving, the felt commitments underneath. Where they diverge is where the next thirty days begin.",
    RT: "You hold what was passed to you. The pilgrimage honors that and asks what's worth still carrying and what isn't. Tradition tests its own keepers across decades.",
    CE: "You steady others, not just yourself. The thirty days will press you on the cost of being a steadier nearby — and on whether the steadiness is being received well.",
    TV: "You know the storm is real. The pilgrimage doesn't pretend otherwise. The work is precision about what you hold and what you let go in weather you didn't ask for.",
    AT: "Your steadiness costs you. The thirty days will press you on the trade — what you've given up to hold what you hold, and whether the trade still serves.",
    SR: "You hold with doubt at your elbow. The pilgrimage trusts that. The doubt is part of why your steadiness reads as patience rather than stubbornness.",
  },
  threshold: {
    TV: "You came knowing language won't reach. The pilgrimage assumes that. Brief is welcome. The discipline is staying available, not articulating well.",
    AT: "You give up easily what others cling to. The pilgrimage will press you on what to keep giving up and what to keep — the line is moving as it should.",
    UI: "Your silence isn't selective. The pilgrimage trusts that — and will press you on the cost of holding silence with people who don't reciprocate.",
    CE: "You sit with others in silence, not only with yourself. The thirty days will press you on the discipline of staying-with when staying-with is uncomfortable.",
    MR: "You sense what doesn't need to be named. The pilgrimage assumes that capacity and asks how to protect it from being talked away.",
    RT: "You inherit a silence rather than invent one. The pilgrimage honors the lineage — and asks what part of it is yours to add to.",
  },
  pilgrim: {
    TV: "You walk knowing the road doesn't lead anywhere certain. The pilgrimage assumes the walking is its own answer. Don't pretend otherwise across the thirty days.",
    SR: "You move while the question stays open. The pilgrimage trusts that movement. The discipline is not collapsing the question by demanding an answer.",
    VA: "You haven't lost joy in walking. The thirty days will sharpen the noticing — the road has joy in it, and noticing it is part of the practice.",
    PO: "You watch the weather. You aren't romantic about the road. The thirty days will press you on whether the practicalities are serving the walking or replacing it.",
    AT: "You walk light. The pilgrimage will press you on what you've set down recently and what you might next.",
    MR: "You walk listening. The pilgrimage assumes you don't narrate the road to yourself. The work is staying available to what the road keeps trying to give.",
  },
  touchstone: {
    VA: "You haven't soured. The pilgrimage assumes you can test without becoming a cynic. The work is staying that way for thirty more days.",
    PO: "You test against what actually matters. The pilgrimage will press you on which of your tests are still earning their place and which have become reflex.",
    TR: "You bring reasons, not only doubts. The pilgrimage will press you on what you've concluded after testing — and what acting on it would ask.",
    SI: "You don't make tests about yourself. The pilgrimage trusts that — and will press the few places ego has crept back into the testing.",
    TV: "You test knowing most of what you'd hoped to confirm won't survive. The pilgrimage assumes that's worth doing anyway.",
    AT: "You take only what survives the test. The pilgrimage will press you on whether the editing has gone far enough.",
  },
  hearth: {
    TR: "You can say what holds your hearth together. The pilgrimage will press you on the cases where the saying matters and the cases where it would diminish what it names.",
    PO: "You do the actual work. The pilgrimage trusts the tending. The discipline is not letting the work harden into duty without warmth.",
    VA: "You like the people, not only the role. The pilgrimage will protect the warmth across thirty days that could otherwise become rote.",
    TV: "You tend knowing the people will go. The pilgrimage assumes that knowledge. The work is keeping the fire anyway.",
    SS: "You serve without losing yourself. The pilgrimage will press you on the cases where the line gets blurry — being the keeper without becoming a doormat.",
    UI: "Your hospitality isn't selective. The pilgrimage assumes that — and will press the cases where it costs you to keep the table open.",
  },
  forge: {
    UI: "You make for all. The pilgrimage will press the cases where the universal reach is harder to hold — when the making is in fact serving a narrower audience than you'd hope.",
    TR: "You forge with a plan. The pilgrimage will press the cases where the plan needs revision — and where conviction has hardened into procrastination.",
    CE: "You make with others. The pilgrimage will press the collaborations you've been carrying alone that could be shared.",
    VA: "Your forging is powered by possibility. The pilgrimage protects that against the months when grievance would be easier fuel.",
    PO: "You ask whether what you're making will serve. The pilgrimage will press the question on every project that has accreted under your name.",
    SR: "You forge with doubt at your elbow. The pilgrimage assumes that — and will surface where the doubt has become an excuse to delay.",
  },
  hammer: {
    TV: "You refuse from grief, not from a high horse. The pilgrimage assumes that. The work is staying that way as the refusing accretes a record.",
    SR: "You examine before breaking. The pilgrimage trusts the examination and will press you on the refusals that didn't earn the same scrutiny.",
    VA: "You haven't lost taste for what's good. The pilgrimage will protect the affirming side of your refusing across thirty days that could otherwise crystallize.",
    UI: "You refuse for everyone, not just the convenient cases. The pilgrimage will press the asymmetry where it's slipped in.",
    PO: "You break with a plan for what comes after. The pilgrimage will press you on the breakings where the after-plan was thinner than the conviction.",
    AT: "You take no pleasure in the breaking. The pilgrimage assumes that — and will protect against the slow drift into enjoying it.",
  },
  garden: {
    TE: "You trust what you can taste. The pilgrimage assumes the senses are competent witnesses. The discipline is staying attentive when the noticing gets boring.",
    PO: "You tend, not only admire. The pilgrimage will press you on the maintenance underneath the pleasure — the work that keeps the garden producing.",
    CE: "You eat with company. The pilgrimage will press you on which tables you're keeping and which you've let lapse.",
    VA: "Your joy doesn't apologize. The pilgrimage protects against the small drift toward justifying pleasure rather than just having it.",
    TV: "You eat knowing it ends. The pilgrimage assumes the lateness — and asks what it's making sharper this season.",
    SR: "You taste with eyes open. The pilgrimage will press the pleasures you've stopped examining for whether they still serve.",
  },
  lighthouse: {
    MR: "You sense the pattern beneath what words can hold. The pilgrimage will press you on the discipline of keeping it lit even when nothing demands articulation.",
    TR: "You can say what the pattern is. The pilgrimage will press you on the teaching side — what would it ask to transmit what you've understood?",
    AT: "You live near the light, not decorated by it. The pilgrimage will press the few places ornament has crept in.",
    UI: "The light is for everyone who can see. The pilgrimage will press the cases where selectivity has crept in without you noticing.",
    TV: "You tend knowing the boats may not arrive. The pilgrimage assumes that's the harder, truer version of the watch.",
    PO: "You maintain — not only revere. The pilgrimage will press the practical chores that keep the tending possible.",
  },
};
