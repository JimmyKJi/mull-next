// /crucible — daily real-life moral action.
//
// Different from Dilemma in shape:
//   Dilemma asks "what would you do?" (hypothetical).
//   Crucible asks "do this thing today, report tomorrow" (actual).
//
// A small pool of 60 daily challenges rotates by day-of-year. Each
// has a category tag (notice / refuse / steelman / repair / give /
// withhold) so a user reading the pool over time sees variety.
//
// The "report" mechanic — tomorrow's prompt asks how it went —
// is what makes this a dopamine loop. Mull tracks completion rate
// and surfaces a "Crucible streak" alongside Dilemma streak.

export type CrucibleCategory =
  | "notice"
  | "refuse"
  | "steelman"
  | "repair"
  | "give"
  | "withhold"
  | "ask"
  | "listen";

export type Crucible = {
  /** Stable id, 1..60. */
  id: number;
  /** Category tag. */
  category: CrucibleCategory;
  /** The action itself, in plain present-tense imperative. */
  prompt: string;
  /** Optional helper text framing the practice. */
  framing: string;
};

export const CRUCIBLES: Crucible[] = [
  { id: 1, category: "notice", prompt: "Notice three moments today when you felt mildly defensive. Don't act on them — just notice.", framing: "The first move is awareness." },
  { id: 2, category: "ask", prompt: "Ask someone whose work you've quietly resented to tell you what they were trying to do. Just listen.", framing: "Hearing the intention often dissolves the resentment." },
  { id: 3, category: "refuse", prompt: "Refuse to share an opinion you have ready in three conversations today. Hold the silence.", framing: "Not every readiness needs spending." },
  { id: 4, category: "steelman", prompt: "Steelman a view you usually dismiss — to yourself, in 100 written words. Don't share it.", framing: "Writing the strongest version is the rigor; you don't need to publish." },
  { id: 5, category: "repair", prompt: "Send one short message to repair something small you've let drift. Don't over-explain.", framing: "Small repairs are weightier than they seem." },
  { id: 6, category: "give", prompt: "Give someone a specific piece of credit they haven't received yet. Concrete, not general.", framing: "Specific praise lands. Generic praise is noise." },
  { id: 7, category: "withhold", prompt: "Withhold the most flattering version of a story you'd tell today. Tell the plain one.", framing: "Strip the spin. Watch what's left." },
  { id: 8, category: "listen", prompt: "In one conversation today, ask only questions until the other person says everything they'd planned to say.", framing: "Most conversations end when someone interrupts." },
  { id: 9, category: "notice", prompt: "Notice one piece of advice you give that you don't take. Write it down.", framing: "Diagnosis precedes treatment." },
  { id: 10, category: "ask", prompt: "Ask one person you trust to name your biggest blind spot. Listen without rebutting.", framing: "The rebuttal you have ready is the data." },
  { id: 11, category: "refuse", prompt: "Refuse an invitation that you'd say yes to out of social inertia. Reply honestly: not this time.", framing: "Yeses owe nos elsewhere." },
  { id: 12, category: "steelman", prompt: "Find the strongest case for a recent decision someone made that you disapproved of. Hold it for ten minutes.", framing: "Charity costs nothing and changes everything." },
  { id: 13, category: "repair", prompt: "Apologize for one specific thing without 'but'. Don't qualify, don't justify, don't soften.", framing: "An apology with conditions is a defense in costume." },
  { id: 14, category: "give", prompt: "Spend 20 minutes helping someone with something that doesn't help you. No record.", framing: "The unsought help is the real one." },
  { id: 15, category: "withhold", prompt: "Skip social media for 12 hours. Note what urge you feel and when.", framing: "The pattern is more interesting than the abstinence." },
  { id: 16, category: "listen", prompt: "Ask a family member to tell you a story from their life you haven't heard. Listen as if it were a novel.", framing: "Most of the people closest to us are partially strangers." },
  { id: 17, category: "notice", prompt: "Notice every time today you reach for your phone without a specific reason. Don't change anything. Just count.", framing: "Counting is the practice." },
  { id: 18, category: "ask", prompt: "Ask 'and then what?' three times in a row about a goal of yours. See where it lands.", framing: "Most goals dissolve under three iterations of why." },
  { id: 19, category: "refuse", prompt: "Refuse to participate in one piece of office or group gossip today. Redirect or excuse yourself.", framing: "What you participate in is what you sponsor." },
  { id: 20, category: "steelman", prompt: "Read a piece of writing by someone you generally consider wrong. Don't argue with it as you read.", framing: "Reading for understanding is a separate move from reading to refute." },
  { id: 21, category: "repair", prompt: "Pay back a small favor that's lingered. Even if no one remembered.", framing: "Ledgers no one keeps are still real." },
  { id: 22, category: "give", prompt: "Tell one person you appreciate something specific about how they think — not what they think.", framing: "The how is rarer compliment material than the what." },
  { id: 23, category: "withhold", prompt: "Don't post anything online today. Note what you would have said.", framing: "What you'd have said is data about what you want from others." },
  { id: 24, category: "listen", prompt: "When someone tells you about a problem, ask 'what would help right now?' before offering anything.", framing: "Most help is unwanted because the question wasn't asked." },
  { id: 25, category: "notice", prompt: "Notice every time today you say something to seem clever, smart, or knowledgeable. Don't change. Count.", framing: "Performance is loud once you're listening for it." },
  { id: 26, category: "ask", prompt: "Ask someone older than you a question you'd otherwise ask the internet.", framing: "The internet has facts. People have judgment." },
  { id: 27, category: "refuse", prompt: "Decline to give your opinion on a topic you don't actually know much about. Don't manufacture one.", framing: "The space where opinion would go can be silence." },
  { id: 28, category: "steelman", prompt: "Find a sentence in your own writing or speech this week that's actually a placeholder for thinking. Rewrite it.", framing: "Most thinking is one rewrite away from being honest." },
  { id: 29, category: "repair", prompt: "Reach out to someone you've fallen out of touch with — without explanation, without lament. Just a hello.", framing: "Most reconnections die on the apology for not reconnecting sooner." },
  { id: 30, category: "give", prompt: "Pay for a stranger's small thing today (coffee, parking, train fare). Don't tell anyone.", framing: "The story is for you, not them." },

  { id: 31, category: "notice", prompt: "Notice the first opinion you form about each new person you meet today. Don't act on it — just note when you formed it.", framing: "Snap judgment is fast. Examination is slow." },
  { id: 32, category: "ask", prompt: "Ask someone close to you: 'is there something I do that you've been meaning to bring up?' Be quiet after.", framing: "The asking is the bravery; the listening is the work." },
  { id: 33, category: "refuse", prompt: "Refuse to multitask for one stretch of three hours today. One thing at a time.", framing: "Most multitasking is poor focus dressed up as productivity." },
  { id: 34, category: "steelman", prompt: "Take a position you hold and write the case against it as if you were going to be paid for winning. 200 words.", framing: "You'll know it's good when you slightly persuade yourself." },
  { id: 35, category: "repair", prompt: "Pay attention to a relationship that's been drifting and act on what you notice today — a call, a visit, a gift, an apology.", framing: "Drift continues unless acted against." },
  { id: 36, category: "give", prompt: "Give a stranger your full attention for one interaction today. Eye contact, presence, no rush.", framing: "Most strangers don't get strangers' presence." },
  { id: 37, category: "withhold", prompt: "Don't speak first in any meeting or conversation today. Wait until someone asks you in.", framing: "The first speaker often sets a frame they didn't mean to set." },
  { id: 38, category: "listen", prompt: "Listen to a song or piece of music with no other activity. Just the music.", framing: "Mono-attention is rarer than we admit." },
  { id: 39, category: "notice", prompt: "Notice the difference between fatigue and avoidance today, in yourself.", framing: "They feel similar; they need different responses." },
  { id: 40, category: "ask", prompt: "Ask three people today what they're working on — not what they do for a living. Listen.", framing: "Identity and practice diverge for most adults." },
  { id: 41, category: "refuse", prompt: "Refuse to look at a screen for the first hour after you wake. Read, write, or sit instead.", framing: "What you do with the first hour shapes the rest." },
  { id: 42, category: "steelman", prompt: "Find a position widely mocked online. Find one defender of it who is serious. Read what they wrote.", framing: "The mocked position usually has its serious defender, even if buried." },
  { id: 43, category: "repair", prompt: "Sit with someone tonight without a task or screen between you. Don't fill the silence.", framing: "Presence is the rarest gift adults give each other." },
  { id: 44, category: "give", prompt: "Write a thank-you note to someone whose work shaped yours, even if they don't know you exist.", framing: "Send it or not — write it either way." },
  { id: 45, category: "withhold", prompt: "Don't share any opinion online today (replies count). Hold what you'd have said.", framing: "Your considered version is usually different from your reactive one." },
  { id: 46, category: "listen", prompt: "When someone disagrees with you today, ask 'what would change your mind?' Listen to the answer.", framing: "Most disagreements have stoppable answers." },
  { id: 47, category: "notice", prompt: "Notice each time today you describe yourself with a noun ('I'm a person who'). What's at stake in the noun?", framing: "Most self-descriptions are protections." },
  { id: 48, category: "ask", prompt: "Ask one person what they'd do with a free year. Don't ask why.", framing: "The answer is data about both of you." },
  { id: 49, category: "refuse", prompt: "Refuse to add 'just' or 'kind of' or 'I think' to a sentence where you mean the thing flatly today.", framing: "The hedge tells the listener what you wish were less true." },
  { id: 50, category: "steelman", prompt: "Pick a past version of yourself you're embarrassed by. Steelman their reasoning at the time.", framing: "You were doing the best you could with what you had. Believe it for once." },
  { id: 51, category: "repair", prompt: "Reach out to someone you owe a real conversation. Schedule it, briefly, for this week.", framing: "Scheduled is more honest than 'soon.'" },
  { id: 52, category: "give", prompt: "Buy a book for someone whose mind you'd want it to feed. Send it without expectation.", framing: "The unsought book is more likely read than the requested one." },
  { id: 53, category: "withhold", prompt: "Don't ask anyone for advice today. Sit with the question, even if uncomfortable.", framing: "Most advice-seeking is anxiety-passing." },
  { id: 54, category: "listen", prompt: "Listen to someone you usually tune out. Don't pretend interest — find one specific thing to be curious about.", framing: "Curiosity is generative, not borne." },
  { id: 55, category: "notice", prompt: "Notice three small kindnesses given to you today. Out loud. Name them.", framing: "Most kindness goes unmarked." },
  { id: 56, category: "ask", prompt: "Ask yourself, on paper: 'what would I do this week if I weren't trying to be impressive?'", framing: "Write the answer. See if you'd actually do it." },
  { id: 57, category: "refuse", prompt: "Refuse to check email or notifications before noon today.", framing: "The first half of the day is yours; donate it consciously, not by default." },
  { id: 58, category: "steelman", prompt: "Find the wisest critic of something you love. Read them honestly.", framing: "The wisest critic is the one whose objections you can't dismiss." },
  { id: 59, category: "repair", prompt: "Forgive one small thing today — silently, without performing it.", framing: "The performance of forgiveness is often the holding-on." },
  { id: 60, category: "give", prompt: "Give someone an out from a commitment they made to you that you suspect they regret. Without explanation.", framing: "Outs are usually never offered; they should be." },
];

/** Ordinal day-of-year (1..366) for a date in UTC. */
function dayOfYear(date: Date): number {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const diff = date.getTime() - start;
  return Math.floor(diff / 86400000);
}

/** Today's Crucible — deterministic from day-of-year. */
export function getTodaysCrucible(now: Date = new Date()): Crucible {
  const doy = dayOfYear(now);
  return CRUCIBLES[doy % CRUCIBLES.length];
}

/** Yesterday's Crucible — used for the "did you do it?" check-in. */
export function getYesterdaysCrucible(now: Date = new Date()): Crucible {
  const y = new Date(now);
  y.setUTCDate(y.getUTCDate() - 1);
  return getTodaysCrucible(y);
}

/** Localstorage state shape. */
export type CrucibleReport = {
  dateKey: string;
  crucibleId: number;
  status: "kept" | "skipped" | "tried";
  note?: string;
};

export const CRUCIBLE_KEY = "mull.crucible_reports";

export const CRUCIBLE_TOTAL = CRUCIBLES.length;
