// Daily dilemma questions — reflective prompts inviting a paragraph or two of writing.
// Different in style from the multiple-choice quiz: open-ended, personal, observational.
//
// One question is shown per day, deterministic from the date so all users see the
// same prompt on the same day. The pool rotates every (length) days — if more
// variety is needed later, expand the pool or add a yearly offset.

export type Dilemma = {
  prompt: string;
  hint?: string;
};

export const DILEMMAS: Dilemma[] = [
  { prompt: "What did you avoid today, and what would have happened if you hadn't?",
    hint: "A specific moment is more useful than a general pattern." },
  { prompt: "When did you most feel like yourself this week?",
    hint: "What was happening, who was there, what did you notice?" },
  { prompt: "Name something you believed strongly six months ago that you don't believe now. What changed?",
    hint: "Try to recover both the old reasons and the new ones." },
  { prompt: "What would you say to someone who came to you with the question that's been sitting with you?",
    hint: "The question you'd want answered, asked back at you." },
  { prompt: "The last time you felt envy — what was it actually about?",
    hint: "Envy is a clue about what you want and won't admit to." },
  { prompt: "Describe a small good thing in your life that almost no one else would notice.",
    hint: "Something you'd miss if it were gone, even though it's invisible to others." },
  { prompt: "What did you do recently that surprised you about yourself?",
    hint: "Surprise upward or downward — both count." },
  { prompt: "Think of someone you disagreed with this week. Write the strongest version of their position.",
    hint: "Steelman it. Be more generous than feels natural." },
  { prompt: "What conversation would you have if you could be guaranteed of being heard?",
    hint: "With whom, about what, in what tone?" },
  { prompt: "Name a way of thinking you've inherited from your parents that you're not sure you've earned.",
    hint: "Inherited isn't necessarily wrong — but it's worth knowing." },
  { prompt: "When were you last bored, properly bored, with nothing to fall back on? What surfaced?",
    hint: "If you can't remember, that's worth writing about too." },
  { prompt: "Describe a moment recently when you knew the right thing to do but did the easier thing.",
    hint: "Don't make it dramatic. The small ones tell more." },
  { prompt: "What do you protect that you'd be embarrassed to admit you protect?",
    hint: "An attachment, a story, a routine, an image of yourself." },
  { prompt: "What have you been pretending not to know?",
    hint: "About yourself, a relationship, a situation. Pick one." },
  { prompt: "If your closest friend secretly read your private journal, what would they learn that you haven't told them?",
    hint: "The thing you keep just to yourself for reasons you might not be sure of." },
  { prompt: "Name a fear you've grown out of. How did you grow out of it?",
    hint: "Was it experience, argument, exhaustion, time?" },
  { prompt: "What's been on your mind that you haven't found words for yet?",
    hint: "Write the rough shape. Words don't have to be right." },
  { prompt: "Think of a recent kindness, given or received. Why did it land the way it did?",
    hint: "What was happening before and after — that's where the meaning sits." },
  { prompt: "What would you give up easily if asked? What would be hard?",
    hint: "Two answers. The gap between them is the interesting thing." },
  { prompt: "When did you last change someone's mind, or have yours changed? What did it actually take?",
    hint: "Most mind-changes are slow. Try to see the actual mechanism." },
  { prompt: "Describe a habit of attention you've developed without realizing it.",
    hint: "Where do your eyes go, your thoughts return, your worries cluster?" },
  { prompt: "What are you currently working harder than necessary to convince yourself of?",
    hint: "Effort is often a tell." },
  { prompt: "Think of someone you admire who you've never met. What's the specific thing they do that you'd want to do too?",
    hint: "Specific, not vague. A move, a posture, a way." },
  { prompt: "Where in your life are you imitating someone? Where are you not?",
    hint: "Imitation isn't bad — but knowing it lets you choose." },
  { prompt: "Think of something you've outgrown without noticing. What is it?",
    hint: "An interest, a conviction, a fear. The kind that fades rather than ends." },
  { prompt: "If you had to be honest with yourself about the next year, what would you most want?",
    hint: "Not what you should want. What you actually want." },
  { prompt: "What's something you say often that you're not sure you actually believe?",
    hint: "A line, a phrase, a moral position you repeat." },
  { prompt: "Describe a failure that taught you something you couldn't have learned otherwise.",
    hint: "What specifically did the failure show that argument couldn't?" },
  { prompt: "When did you last help someone without expecting anything in return — and what made it possible?",
    hint: "The internal conditions matter more than the act." },
  { prompt: "What's the question you'd want to be asked, but no one ever asks?",
    hint: "Then answer it." },

  // ─── Expansion batch — added to break the 30-day repeat cycle ──────────
  // Self-knowledge
  { prompt: "What do you do when no one is watching that you'd be embarrassed for them to see?",
    hint: "Not the worst version — the version that's just yours." },
  { prompt: "Describe a habit you have that you can't quite justify but won't give up.",
    hint: "What does keeping it cost? What would giving it up cost?" },
  { prompt: "When did you last notice yourself performing for an audience that wasn't actually there?",
    hint: "Whose imagined judgment were you adjusting to?" },
  { prompt: "What's a compliment you receive often that doesn't quite land?",
    hint: "Why does the praise miss what you'd actually want recognized?" },
  { prompt: "Name a part of yourself you'd be sad to outgrow.",
    hint: "Even if outgrowing it would be 'progress.'" },

  // Relationships
  { prompt: "Who in your life makes you better company than you usually are?",
    hint: "And what specifically do they do that pulls it out of you?" },
  { prompt: "What's something you've never told someone you love — not because it's a secret, but because the moment never came?",
    hint: "Why hasn't the moment come?" },
  { prompt: "When did you last receive an apology that mattered? What made it work?",
    hint: "Was it the words, the timing, or something else?" },
  { prompt: "Think of the last argument you had. What was the argument actually about?",
    hint: "Not the surface topic — the deeper claim each side was making." },
  { prompt: "Who taught you something important that they probably don't know they taught you?",
    hint: "Could you tell them now?" },

  // Work and vocation
  { prompt: "If your work disappeared tomorrow, what would you miss about doing it?",
    hint: "Separate what you'd miss from what you're paid for." },
  { prompt: "What kind of problem makes you lose track of time?",
    hint: "Be specific about the texture of it." },
  { prompt: "Name something you're good at that you don't enjoy. What does that mean?",
    hint: "Skill and meaning are not the same thing — what is the gap telling you?" },
  { prompt: "When did you last feel proud of work you did privately, with no one to show it to?",
    hint: "What did the privacy add or remove?" },
  { prompt: "What's the hardest part of your work that no one else would think is hard?",
    hint: "Sometimes the load is invisible from the outside." },

  // Time and mortality
  { prompt: "If you knew you had ten more years of full health, what would you spend the first one doing?",
    hint: "Notice what changes when the timeline is finite but not short." },
  { prompt: "What did you do this week that future-you will be grateful for?",
    hint: "And what will future-you wish you'd skipped?" },
  { prompt: "Describe something you've been postponing for over a year. Why?",
    hint: "Postponement is information." },
  { prompt: "What's a memory from your childhood you keep returning to? What do you think it's holding for you?",
    hint: "Not nostalgia — the shape of why it stays." },
  { prompt: "If you died tomorrow, what would the people closest to you not know about you that you'd want them to?",
    hint: "Could you tell them this week?" },

  // Belief and certainty
  { prompt: "Name something most people around you believe that you secretly suspect is wrong.",
    hint: "What would it cost to say it out loud?" },
  { prompt: "What's a position you hold mostly because of where you grew up?",
    hint: "Try to imagine the version of you that grew up elsewhere." },
  { prompt: "What's a question you used to think had a clear answer, and now don't?",
    hint: "What changed — your view, or the question?" },
  { prompt: "When did you last update a belief because of evidence rather than mood?",
    hint: "And how could you tell the difference?" },
  { prompt: "If you had to bet against one of your strongly-held beliefs, which would survive the bet?",
    hint: "The question is about confidence, not preference." },

  // Pleasure and suffering
  { prompt: "What pleasure do you take more seriously than you let on?",
    hint: "The one you'd be slightly defensive about if asked." },
  { prompt: "Describe a difficulty in your life right now that you wouldn't actually trade away.",
    hint: "What does it teach, do, or hold for you?" },
  { prompt: "When did you last feel a clean joy — uncomplicated, no shadow?",
    hint: "What were the conditions? Could they be reproduced?" },
  { prompt: "What pain are you currently outsourcing to someone else?",
    hint: "Most pain doesn't disappear — it relocates." },
  { prompt: "If your suffering were entirely useless, would it be more bearable or less?",
    hint: "Be honest about the role meaning plays." },

  // Power and autonomy
  { prompt: "When did you last say yes when you wanted to say no? What stopped the no?",
    hint: "Was it kindness, fear, habit, or something else?" },
  { prompt: "Where in your life are you waiting for permission you don't actually need?",
    hint: "Permission from whom? For what?" },
  { prompt: "What's a small power you have over other people that you'd be reluctant to admit?",
    hint: "Power isn't always institutional." },
  { prompt: "Name a constraint in your life that you'd actually choose to keep, given the option.",
    hint: "Some limits are gifts; others are inheritances. Which is this?" },
  { prompt: "If you could change one rule you live by, what would it be — and why haven't you?",
    hint: "What is the rule protecting?" },

  // Justice and fairness
  { prompt: "When did you last witness something unfair and stay silent?",
    hint: "What did silence cost? What did speaking up have cost?" },
  { prompt: "What advantage do you have that you don't fully see?",
    hint: "Often the question requires asking someone who lacks it." },
  { prompt: "Describe a situation where the right thing to do conflicts with the legal thing.",
    hint: "Not hypothetical — has this happened to you?" },
  { prompt: "If you could redistribute one thing in society and only one, what would it be?",
    hint: "Money, attention, time, dignity, opportunity, something else?" },
  { prompt: "When have you been treated more generously than you deserved? What did it teach you?",
    hint: "About fairness, about generosity, about yourself." },

  // Beauty and aesthetics
  { prompt: "What's something most people find beautiful that you don't, and vice versa?",
    hint: "Try to articulate why your taste runs as it does." },
  { prompt: "Describe an everyday object in your life that quietly pleases you.",
    hint: "Why does it work? What would replacing it cost?" },
  { prompt: "When did beauty last interrupt your day?",
    hint: "Beauty as event, not as decoration." },
  { prompt: "If you had to fill a room with five things that capture your taste, what would they be?",
    hint: "And what would the room say to a stranger?" },
  { prompt: "What does ugliness teach you that beauty can't?",
    hint: "Not all ugliness is just absence-of-beauty." },

  // Knowledge and learning
  { prompt: "What's the most useful thing you learned this year, and how did you learn it?",
    hint: "The learning method is half the lesson." },
  { prompt: "Name a topic you'd like to be deeply knowledgeable in but haven't pursued. Why not?",
    hint: "What's actually in the way?" },
  { prompt: "What's a question you've been carrying for years without asking aloud?",
    hint: "Asking is its own answer sometimes." },
  { prompt: "When did you last be wrong about something publicly? How did it land?",
    hint: "Public wrongness is a different practice from private wrongness." },
  { prompt: "If you could spend an hour with someone alive, learning what they know, who would you pick — and what would you ask first?",
    hint: "The first question is the one that matters." },

  // Money, status, and ambition
  { prompt: "What would be enough money for you, and how do you know?",
    hint: "Be specific. 'A lot' is not an answer." },
  { prompt: "Whose opinion do you adjust your life to without admitting it?",
    hint: "Could be a person, a class, a tribe." },
  { prompt: "Describe a status game you used to play and don't anymore.",
    hint: "What freed you from it?" },
  { prompt: "If recognition for your work were guaranteed, what would change about how you do it?",
    hint: "What would stay the same? Those are the parts that matter to you." },
  { prompt: "What's something you'd do tomorrow if you couldn't fail and no one would know?",
    hint: "Two constraints removed at once. What's left?" },

  // Loneliness and connection
  { prompt: "When did you last feel deeply known by another person?",
    hint: "What did they see? What did seeing it require?" },
  { prompt: "Describe a kind of loneliness that's been with you for a long time.",
    hint: "Not all loneliness is the same — what is the texture of yours?" },
  { prompt: "Who in your life are you slightly afraid of disappointing?",
    hint: "And what does that fear protect or distort?" },
  { prompt: "What's a relationship you let drift that you wish you hadn't? What stopped you from holding it?",
    hint: "What would reconnecting cost now?" },
  { prompt: "If you could send a message to a stranger somewhere who needs to hear it, what would it say?",
    hint: "And does that message also belong to you?" }
];

// Get today's dilemma deterministically from the date.
// Same day, same dilemma, for every user (anywhere in the world based on UTC).
export function getDailyDilemma(date: Date = new Date()): { dilemma: Dilemma; index: number; dateKey: string } {
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  const dateKey = `${yyyy}-${mm}-${dd}`;

  // Day-of-year — Jan 1 is day 0
  const start = Date.UTC(yyyy, 0, 0);
  const now = Date.UTC(yyyy, date.getUTCMonth(), date.getUTCDate());
  const dayOfYear = Math.floor((now - start) / 86400000);

  // Add year as a small rotation so the same calendar date doesn't always
  // hit the same dilemma year-over-year.
  const index = (dayOfYear + yyyy * 7) % DILEMMAS.length;
  return { dilemma: DILEMMAS[index], index, dateKey };
}
