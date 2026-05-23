// /quiz/journey — narrative version of the quiz.
//
// Frame: "The Vigil". You're sitting in a small kitchen, late, the
// night before a decision you've known is coming for weeks. You can't
// sleep. Memories rise. Each memory is a moment in your life where
// you chose — or someone else asked you to. You replay each one.
//
// Mechanics:
//   - Each Scene wraps an existing quiz question's vector mapping in
//     narrative prose + Telltale-style choice buttons.
//   - Choices map 1:1 to the SAME 16-D vector deltas the classic quiz
//     uses, so scoring is identical and /result reads them the same
//     way. (No re-calibration needed; we're just changing the UX layer.)
//   - Intro + outro frame the vigil without contributing vector
//     weight (kind:'frame').
//   - Each memory has a brief "epilogue" line shown after the choice
//     is made, giving each pick the weight of a small consequence.
//
// The prose voice is intentionally sparse — present-tense, second-
// person, short sentences. Restraint over excess. The frame is about
// looking back honestly, not performing emotion.

import { v } from "./vectors";

export type JourneyChoice = {
  /** Display text. */
  text: string;
  /** 16-D vector delta — same shape + scale as classic quiz answers. */
  vector: number[];
};

export type JourneyScene =
  | {
      kind: "frame";
      /** Stable ID used as React key + for resume-from-storage. */
      id: string;
      /** Prose body — paragraphs separated by \n\n. */
      body: string;
      /** Label for the single advance button. */
      advance: string;
    }
  | {
      kind: "memory";
      id: string;
      /** Short period marker shown as the scene's eyebrow ("YOU ARE NINETEEN"). */
      era: string;
      /** Prose body. */
      body: string;
      /** The hinge question the memory poses. */
      prompt: string;
      /** 3-5 choices. Order shown as written. */
      choices: JourneyChoice[];
      /** Brief 1-2 line aftermath shown after the user chooses,
       *  before they advance to the next scene. The same epilogue is
       *  shown regardless of which choice — the weight is in the
       *  having-chosen, not in branching. */
      epilogue: string;
    };

export const JOURNEY_SCENES: JourneyScene[] = [
  // ─── Intro ─────────────────────────────────────────────────────
  {
    kind: "frame",
    id: "intro",
    body: `The kitchen is small. The lamp is the kind that hums.

Tomorrow you have to do the thing. You know what it is. You've known for weeks.

Outside, the street is quiet in the way streets are at three a.m. You sat down to drink water. You're still sitting.

A memory surfaces. Not the obvious one. An older one, like a smaller stone underneath the larger stones at the bottom of a river. You're not sure why it's the one that came.`,
    advance: "Stay with it",
  },

  // ─── Memory 1: the hospital ────────────────────────────────────
  // Maps to QUICK_QUESTIONS[0] (dying friend). Same vector deltas.
  {
    kind: "memory",
    id: "hospital",
    era: "You are nineteen.",
    body: `The hospital corridor smells of bleach and bad coffee.

Marco's hand in yours is cold. He has been crying for an hour — the kind of crying you didn't know he could do. He's nineteen, too. He won't be twenty.

He wants you to say something. Not "it'll be okay" — he's smarter than that, and so are you. He wants whatever truth you can offer. The words are sitting in your throat like a stone.

Then they come out:`,
    prompt: "What do you actually say?",
    choices: [
      {
        text: `"There's something beyond this. We don't know what, but I can feel it."`,
        vector: v({ MR: 3, TV: 1, CE: 2, SI: 1 }),
      },
      {
        text: `"Everyone faces this. The wisdom is in how we face it."`,
        vector: v({ AT: 2, PO: 2, TR: 2, TV: 1 }),
      },
      {
        text: `"Tell me what mattered to you. Let's name it together."`,
        vector: v({ SS: 2, VA: 1, CE: 2 }),
      },
      {
        text: `"We made beautiful things. That doesn't disappear because you do."`,
        vector: v({ VA: 2, ES: 1, TD: 1, SS: 1 }),
      },
    ],
    epilogue: `Marco looks at you. The fear in his face does not go away. But something in his hand changes. He squeezes once.`,
  },

  // ─── Memory 2: the kitchen table ───────────────────────────────
  // Maps to QUICK_QUESTIONS[1] (surgeon/transplant). Reframed as a
  // childhood conversation with a parent to fit the Vigil structure.
  {
    kind: "memory",
    id: "table",
    era: "You are twelve.",
    body: `Your father is at the kitchen table with his head in his hands. He is a doctor.

He has been telling you about a case at the hospital. A surgeon was asked, in effect, to kill one healthy patient — someone in the building for unrelated reasons — to save five who would otherwise die without transplants. Same hour. Same building. The math, your father said, was plain.

"Were they right?" you asked.

Your father looked at you a long time. "What do you think?"`,
    prompt: "What did you tell him?",
    choices: [
      {
        text: "No — some lines you don't cross, even for good outcomes.",
        vector: v({ UI: 3, RT: 1, AT: 1 }),
      },
      {
        text: "Yes — five lives outweigh one. The math is hard but clear.",
        vector: v({ TR: 2, UI: 1, PO: 2, WP: 1 }),
      },
      {
        text: "No, but for practical reasons — it would destroy trust in medicine.",
        vector: v({ PO: 3, TE: 2, SR: 1 }),
      },
      {
        text: "The question is malformed. Real ethics doesn't reduce to such cases.",
        vector: v({ CE: 1, RT: 2, MR: 1, SR: 2 }),
      },
    ],
    epilogue: `Your father nodded once. He didn't tell you whether you were right.`,
  },

  // ─── Memory 3: the long disagreement ───────────────────────────
  // Maps to QUICK_QUESTIONS[2] (moral disagreement with a respected
  // friend). Set later in life, walking home from a café.
  {
    kind: "memory",
    id: "cafe",
    era: "You are twenty-six.",
    body: `A friend you really respect — and they really respect you — and the two of you have been arguing about the same thing for two years. Not a misunderstanding. An actual, lasting moral disagreement.

Tonight they left the café earlier than usual. The argument is unresolved. Walking home, you find yourself talking out loud to no one, finishing what you didn't get to say.

What you would say, given another evening — that is the honest answer to what you actually believe.`,
    prompt: "What's the honest move?",
    choices: [
      {
        text: "Argue, hard. Truth deserves it.",
        vector: v({ UI: 2, TR: 2, WP: 1 }),
      },
      {
        text: "Find what you actually disagree about underneath the surface.",
        vector: v({ TD: 3, SR: 1, TR: 1 }),
      },
      {
        text: "Decide which of you is more likely right and learn from them.",
        vector: v({ SR: 2, RT: 2, TR: 1 }),
      },
      {
        text: "Hold the disagreement. Some things won't resolve.",
        vector: v({ MR: 2, AT: 1, SI: 1, TV: 1 }),
      },
      {
        text: "Live differently and let the disagreement breathe.",
        vector: v({ SS: 3, PO: 1 }),
      },
    ],
    epilogue: `Your steps are slow. The city sounds different at this hour — quieter and stranger, as if it, too, is thinking something through.`,
  },

  // ─── Memory 4: the button ──────────────────────────────────────
  // Maps to QUICK_QUESTIONS[3] (simulated perfect life). Reframed as
  // a thought experiment read in a book; the present-self is asked
  // whether they knew their answer back then.
  {
    kind: "memory",
    id: "button",
    era: "You are thirty-four.",
    body: `You sit with the last memory for a while. Then another arrives — but it isn't a memory, exactly. A thought experiment from a book you read in your thirties.

A button. Press it: you live a perfect, joyful life — but it's all a simulation. Don't press it: you keep your real life with all its disappointments.

You remember closing the book and putting it on the table. You sat for a long time. You're sitting now, too. You think you knew, then.`,
    prompt: "Did you press it?",
    choices: [
      {
        text: "Press it — pleasure is real wherever it comes from.",
        vector: v({ ES: 3, VA: 2, TE: 1, SI: 1 }),
      },
      {
        text: "Don't press it — real life has meaning beyond pleasure.",
        vector: v({ SS: 2, TV: 2, UI: 1, MR: 1 }),
      },
      {
        text: "Don't press it — what would I be losing if I never knew anything was real?",
        vector: v({ TR: 2, SS: 1, SR: 2 }),
      },
      {
        text: `Press it. Most of "real life" isn't great anyway.`,
        vector: v({ TV: 3, SR: 1, SI: 2 }),
      },
    ],
    epilogue: `You drink the rest of the water. Outside, the dark is thinning. Almost dawn.`,
  },

  // ─── Outro ─────────────────────────────────────────────────────
  {
    kind: "frame",
    id: "outro",
    body: `The lamp still hums. You realize you've sat through the night.

Tomorrow you'll still have to do the thing. You still don't know exactly what you'll choose. But you know more, now, about the person who will be choosing.

The dawn is coming.`,
    advance: "See your place on the map",
  },
];

/** Convenience: count of memory scenes (the ones that contribute to
 *  the vector). Used by the engine for the "Memory 2 of 4" chip. */
export function memoryCount(): number {
  return JOURNEY_SCENES.filter((s) => s.kind === "memory").length;
}
