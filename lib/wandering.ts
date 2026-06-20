// The Wandering Question — a single deep question travels across
// the week. Different from Dilemma's daily one-shots.
//
// Weekly arc:
//   - Monday: get the question. Write your initial response.
//   - Wednesday: read how 2 philosophers near you answered. React.
//   - Friday: a new angle from one further on the map. React.
//   - Sunday: synthesis. Mull pulls your three responses + the
//     philosophers' frames and writes a short note.
//
// 52 questions, one per ISO week, rotated by week-of-year. Each
// designed to reward thinking-it-through rather than a clean answer.

import type { DimKey } from './dimensions';

export type WanderingQuestion = {
  /** Stable id, matches week-of-year slot. */
  week: number;
  /** The question itself. */
  prompt: string;
  /** A brief framing shown beneath. */
  framing: string;
  /** Dimensions this question most tests — used by the picker to
   *  surface kindred philosophers later in the week. */
  touches: DimKey[];
};

const QUESTIONS: WanderingQuestion[] = [
  {
    week: 1,
    prompt: "What do you owe the version of yourself you'll be in five years?",
    framing:
      'Not legacy. The actual debt — what your future self could rightly claim you should have done.',
    touches: ['SS', 'TV', 'PO'],
  },
  {
    week: 2,
    prompt: "What's a belief you'd defend in public but quietly doubt?",
    framing: 'The asymmetry is the data. What does the defense cost that the doubt would save?',
    touches: ['SR', 'SS', 'TR'],
  },
  {
    week: 3,
    prompt: 'When does loyalty stop being a virtue?',
    framing: 'Specific people, specific cases. Not a principle — a moment.',
    touches: ['CE', 'UI', 'SS'],
  },
  {
    week: 4,
    prompt: "What's the smallest thing you'd refuse to do for the right amount of money?",
    framing: "Small enough that the refusal feels almost silly. That's the place to look.",
    touches: ['SS', 'AT', 'UI'],
  },
  {
    week: 5,
    prompt: "What practice would you build if you knew you'd keep it for thirty years?",
    framing: "The thirty-year constraint changes what you'd start.",
    touches: ['AT', 'PO', 'RT'],
  },
  {
    week: 6,
    prompt: "What's a kindness you've received that you've never been able to repay?",
    framing: 'The unrepayable kind is the only kind we should still try to honor.',
    touches: ['CE', 'VA', 'TV'],
  },
  {
    week: 7,
    prompt: 'What would change about your life if you trusted your judgment more?',
    framing: "Specific changes. Not 'I'd be more confident' — what you'd do tomorrow.",
    touches: ['SS', 'WP', 'TR'],
  },
  {
    week: 8,
    prompt: 'When is it right to be embarrassed by your past self?',
    framing: 'Some embarrassment is growth; some is rewriting. The line matters.',
    touches: ['TV', 'SR', 'SI'],
  },
  {
    week: 9,
    prompt: 'What do you protect in your day that has no obvious payoff?',
    framing: 'Protect — actively. The unpaid for its own sake.',
    touches: ['AT', 'VA', 'MR'],
  },
  {
    week: 10,
    prompt: 'When have you been wrong about a person, and what did the wrongness teach you?',
    framing:
      'Both directions count — when they were better than expected and when they were worse.',
    touches: ['SR', 'CE', 'TV'],
  },
  {
    week: 11,
    prompt: 'What argument do you keep having that you should give up?',
    framing: 'Give up — not concede. Just stop spending your life on it.',
    touches: ['SR', 'PO', 'AT'],
  },
  {
    week: 12,
    prompt: "What's a small thing you'd do if you were certain no one would notice?",
    framing: 'The unnoticed version is the test of motive.',
    touches: ['SS', 'AT', 'VA'],
  },
  {
    week: 13,
    prompt: 'What do you hope someone says about you that no one says yet?',
    framing: "Specific praise you wish were true. Then ask why they don't.",
    touches: ['SS', 'SR', 'TV'],
  },
  {
    week: 14,
    prompt: 'When is silence cowardice and when is it wisdom?',
    framing: 'Same act, different motivations. The internal tell matters.',
    touches: ['AT', 'MR', 'SR'],
  },
  {
    week: 15,
    prompt: "What's a question you keep deferring, and what would deferring it forever cost?",
    framing: 'Forever is the question. Most defers become forevers.',
    touches: ['TV', 'SR', 'PO'],
  },
  {
    week: 16,
    prompt: 'When have you mistaken intensity for depth?',
    framing: "Loud isn't deep. Some of the deepest things move quietly.",
    touches: ['MR', 'TV', 'SR'],
  },
  {
    week: 17,
    prompt:
      "What's a tradition you carry without believing in it, and why do you keep carrying it?",
    framing: 'Holding without belief is its own integrity.',
    touches: ['RT', 'CE', 'SR'],
  },
  {
    week: 18,
    prompt: 'When do you steelman your enemies, and when do you stop?',
    framing: 'The stopping is the more interesting data.',
    touches: ['TR', 'UI', 'SR'],
  },
  {
    week: 19,
    prompt: "What's something you've gotten unfairly good at, and what does it cost you?",
    framing: 'Unfair to whom — and what does the cost look like, three years out?',
    touches: ['WP', 'TV', 'SS'],
  },
  {
    week: 20,
    prompt: "What's a part of your life you've decided to leave to chance?",
    framing: "Leaving to chance is itself a choice. Name what you've chosen.",
    touches: ['SI', 'SR', 'MR'],
  },
  {
    week: 21,
    prompt: 'When does ambition become the thing that prevents the work?',
    framing: 'Most ambition is one notch past where it serves the work.',
    touches: ['WP', 'AT', 'SR'],
  },
  {
    week: 22,
    prompt: "What's a friendship you've outgrown without admitting it?",
    framing: 'Specific person, specific moment. The admission is half the work.',
    touches: ['CE', 'TV', 'SS'],
  },
  {
    week: 23,
    prompt: 'When does generosity become a way of avoiding being known?',
    framing: 'Some giving is keeping the other person at distance.',
    touches: ['SR', 'CE', 'SS'],
  },
  {
    week: 24,
    prompt: "What's a thing about you that's harder to change than you'd like to admit?",
    framing: 'Acknowledge it without resolving to fix it this week.',
    touches: ['TV', 'SI', 'SR'],
  },
  {
    week: 25,
    prompt: 'Who are you most yourself with, and why?',
    framing: "The 'why' is what you should be paying attention to.",
    touches: ['CE', 'VA', 'SS'],
  },
  {
    week: 26,
    prompt: "What's an opinion you hold that you can't quite trace back to its source?",
    framing: 'Inherited opinions feel like ours until we trace the inheritance.',
    touches: ['RT', 'SR', 'TR'],
  },

  {
    week: 27,
    prompt: 'When does following advice replace having a view?',
    framing: 'Advice can be data or substitute. The difference matters.',
    touches: ['SS', 'SR', 'TR'],
  },
  {
    week: 28,
    prompt: "What do you do when you notice you're hiding from a real question?",
    framing: "Notice the noticing. That's where the work starts.",
    touches: ['SR', 'SI', 'TV'],
  },
  {
    week: 29,
    prompt: "What's a kindness you've withheld out of pride?",
    framing: "Pride sometimes wears principle's clothes.",
    touches: ['TV', 'CE', 'AT'],
  },
  {
    week: 30,
    prompt: 'Whose approval still has too much weight in your decisions?',
    framing: 'Naming them is the loosening.',
    touches: ['SS', 'CE', 'SR'],
  },
  {
    week: 31,
    prompt:
      "What's a recurring frustration in your life that points at something you should change about yourself?",
    framing: 'External pattern often = internal pattern.',
    touches: ['SR', 'SI', 'TV'],
  },
  {
    week: 32,
    prompt: 'When is being right a defense and when is it a discipline?',
    framing: 'Same word, different motivations.',
    touches: ['TR', 'SS', 'SR'],
  },
  {
    week: 33,
    prompt: "What's a part of your routine you'd defend that doesn't actually serve you?",
    framing: 'Defended routines often replace examined ones.',
    touches: ['PO', 'SR', 'RT'],
  },
  {
    week: 34,
    prompt: 'What do you owe yourself that you keep giving to others instead?',
    framing: 'Both can be true. The proportions matter.',
    touches: ['SS', 'CE', 'AT'],
  },
  {
    week: 35,
    prompt: 'When do you confuse being needed with being valuable?',
    framing: 'Needed is conditional. Valuable can be quieter.',
    touches: ['SS', 'CE', 'TV'],
  },
  {
    week: 36,
    prompt: "What's something you've outgrown but still pretend to want?",
    framing: 'Pretense is its own information.',
    touches: ['SR', 'VA', 'TV'],
  },
  {
    week: 37,
    prompt: 'What advice would you give your best friend that you ignore yourself?',
    framing: 'The advice is data about your own knowing.',
    touches: ['SR', 'CE', 'PO'],
  },
  {
    week: 38,
    prompt: "When does saying yes to one thing mean saying no to something you weren't naming?",
    framing: "Every yes is a no elsewhere. Notice today's.",
    touches: ['AT', 'PO', 'SR'],
  },
  {
    week: 39,
    prompt:
      "What's a small daily injustice you've stopped seeing because you'd have to act on it if you saw it?",
    framing: 'Selective blindness is the most useful kind.',
    touches: ['UI', 'SR', 'TV'],
  },
  {
    week: 40,
    prompt: 'When has being misunderstood served you, and when has it cost you?',
    framing: 'Both have happened. Both teach.',
    touches: ['SS', 'TV', 'CE'],
  },
  {
    week: 41,
    prompt: 'What kind of mind would you want to have at 80?',
    framing: "Specific qualities, not just 'sharp.'",
    touches: ['AT', 'VA', 'PO'],
  },
  {
    week: 42,
    prompt:
      "What's a piece of your past you'd describe differently to a stranger than to a friend, and why?",
    framing: "The variance tells you what you're still negotiating with.",
    touches: ['SI', 'SR', 'TV'],
  },
  {
    week: 43,
    prompt: 'When is asking for help an act of trust and when is it an act of avoidance?',
    framing: 'Both shapes look similar from the outside.',
    touches: ['SS', 'CE', 'SR'],
  },
  {
    week: 44,
    prompt: "What's a small lie you've told often enough that it's started to feel true?",
    framing: 'Most of these are about ourselves to ourselves.',
    touches: ['SI', 'SR', 'TV'],
  },
  {
    week: 45,
    prompt: 'When does your tolerance for ambiguity flip into avoidance of decision?',
    framing: "There's a line. You can feel it.",
    touches: ['SR', 'PO', 'AT'],
  },
  {
    week: 46,
    prompt: "What do you wish people understood about you that you've never explained?",
    framing: 'Some of the not-explaining is itself the explanation.',
    touches: ['TV', 'MR', 'SS'],
  },
  {
    week: 47,
    prompt: "What's an early commitment you've kept that you'd quietly remake today?",
    framing: 'Kept commitments deserve revisiting too.',
    touches: ['SR', 'WP', 'SS'],
  },
  {
    week: 48,
    prompt: "Whose forgiveness do you most need that's not God's?",
    framing: 'Specific person. Specific forgiveness. Why not yet?',
    touches: ['CE', 'TV', 'SR'],
  },
  {
    week: 49,
    prompt: "What's an idea you've changed your mind about that you should announce out loud?",
    framing: 'Public revision is a kindness to others mid-change.',
    touches: ['SR', 'TR', 'UI'],
  },
  {
    week: 50,
    prompt: "What do you take pride in that you didn't earn?",
    framing: 'Honor it without claiming it.',
    touches: ['VA', 'SR', 'TV'],
  },
  {
    week: 51,
    prompt: "What's a question you've outgrown — and what's the next one?",
    framing: 'Questions deserve retirement. New ones deserve naming.',
    touches: ['SR', 'TD', 'SI'],
  },
  {
    week: 52,
    prompt: 'What from this year would your ten-years-younger self have most wanted to know?',
    framing: 'Write it to them. Time-bound and specific.',
    touches: ['TV', 'VA', 'PO'],
  },
];

/** ISO 8601 week number (1..53). */
function isoWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  return (
    1 +
    Math.round(
      ((d.getTime() - firstThursday.getTime()) / 86400000 -
        3 +
        ((firstThursday.getUTCDay() + 6) % 7)) /
        7,
    )
  );
}

export function getThisWeeksQuestion(now: Date = new Date()): WanderingQuestion {
  const wk = isoWeek(now);
  return QUESTIONS[(wk - 1) % QUESTIONS.length];
}

/** Beats (days of the week the user is invited back) — Mon/Wed/Fri/Sun. */
export const WANDERING_BEATS = [
  { day: 'Mon', label: 'Start', description: 'First response — what comes to mind unedited.' },
  { day: 'Wed', label: 'Kindred', description: 'Two philosophers near you. React to one.' },
  { day: 'Fri', label: 'Far', description: 'One philosopher further on the map. React.' },
  {
    day: 'Sun',
    label: 'Synthesis',
    description: 'Pull the threads together — the synthesis is yours to write.',
  },
] as const;

export type WanderingResponse = {
  week: number;
  beat: 'Mon' | 'Wed' | 'Fri' | 'Sun';
  text: string;
  ts: number;
};

export const WANDERING_KEY = 'mull.wandering';
