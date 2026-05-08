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
    hint: "Then answer it." }
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
