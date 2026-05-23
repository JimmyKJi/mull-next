// /quiz/journey — narrative version of the quiz.
//
// FRAME: "The Inheritor" — v4
//
// Per feedback on v3: the questions felt forced and disconnected from
// the narrative. The Inheritor frame demanded that each chamber feel
// like it belongs in this estate, in this person's life — not like
// a textbook philosophical thought-experiment bolted onto a story.
//
// v4 redesigns the chambers from the DECEASED'S LIFE outward. Each
// artifact and question emerges from who this specific person was.
// By the time the inheritor meets them in the final chamber, the
// inheritor has assembled a coherent person:
//
//   Chamber 1 — A photograph of a young woman on her deathbed. The
//     deceased was with her. This was the wound that shaped their
//     life. Question: what should one say to the dying?
//
//   Chamber 2 — Letters from a child who waited. The deceased left
//     when the child was three to follow a vocation, sent money,
//     visited rarely. The child wrote for thirty years. Question:
//     were they right to leave?
//
//   Chamber 3 — Two stacks of letters: a thirty-year correspondence
//     with another scholar about a book the deceased wished to write
//     and never did. The correspondent said the book would do harm;
//     the deceased said the harm of NOT writing it would be worse.
//     Neither yielded. The manuscript still sits in this room.
//     Question: what does true moral disagreement deserve?
//
//   Chamber 4 — A small box: an unused steamship ticket, dated forty
//     years ago, paired with a photograph of a small house by a sea.
//     The deceased was offered an easy life — a settled love, a
//     comfortable inheritance — and refused. Question: were they right
//     to refuse?
//
// In the final chamber, the dying person speaks as someone the
// inheritor has come to know piece by piece — and the inheritor's
// answers were never about abstract ethics; they were about whether
// the inheritor was the kind of person who could understand and
// continue this life. The ask at the end ("sit with me until morning,
// and do the same for the next, decades from now") rests on the
// inheritor already having seen the shape of the life that asks it.
//
// SCORING: each chamber's choices cover ~4 of the 16 dimensions, with
// silence carrying a small SR/AT/MR weight. Full 16-D coverage is
// preserved across the four chambers + silence options. /result handoff
// unchanged.

import { v } from "./vectors";

export type JourneyChoice = {
  text: string;
  vector: number[];
  silence?: boolean;
};

export type JourneyScene =
  | {
      kind: "frame";
      id: string;
      art: SceneArtKey;
      eyebrow?: string;
      body: string;
      advance: string;
    }
  | {
      kind: "chamber";
      id: string;
      art: SceneArtKey;
      eyebrow: string;
      body: string;
      prompt: string;
      choices: JourneyChoice[];
      epilogue: string;
      twistClue?: string;
    };

export type SceneArtKey =
  | "envelope-seal"
  | "framed-photograph"
  | "stacked-letters"
  | "two-chairs"
  | "ticket-and-photo"
  | "candle-deathbed";

export const JOURNEY_SCENES: JourneyScene[] = [
  // ─── Arrival ──────────────────────────────────────────────────
  {
    kind: "frame",
    id: "arrival",
    art: "envelope-seal",
    eyebrow: "I · The Invitation",
    body: `You weren't expecting the letter.

Heavy paper. A wax seal in dark red. A name you don't know signed at the bottom. The address is handwritten in a careful, slightly trembling script: *To the one who would inherit. Come alone, at midnight, this Wednesday.*

You almost threw it away. You didn't.

The estate is two hours from the city. The cab driver won't take you past the gate.`,
    advance: "Walk to the door",
  },

  // ─── Chamber 1 — the photograph ───────────────────────────────
  // Probes: MR, TV, CE, SI, AT, PO, TR, SS, VA, ES, TD, SR
  {
    kind: "chamber",
    id: "ch1",
    art: "framed-photograph",
    eyebrow: "II · The Foyer",
    body: `The door opens before you knock. An elderly woman in dark clothes inclines her head and gestures you inside. She does not introduce herself.

The foyer is candlelit. On a single panelled wall hangs one framed photograph — a young woman on what is clearly her deathbed. She is perhaps thirty. The hand reaching for her, just outside the frame, you understand to be the deceased's. This is, the photograph says without speaking, the wound that shaped their life.

Below the photograph rests a sealed envelope. Your name is on it.

Inside: a slip of paper. The handwriting is the same as the letter.`,
    prompt: `She had hours, perhaps a day. The deceased was the one with her. What should they have told her?`,
    choices: [
      {
        text: `"That something lies beyond. They could not be sure — but they could feel it."`,
        vector: v({ MR: 3, TV: 1, CE: 2, SI: 1 }),
      },
      {
        text: `"That everyone faces this. The wisdom is in how we meet it."`,
        vector: v({ AT: 2, PO: 2, TR: 2, TV: 1 }),
      },
      {
        text: `"That they asked her what had mattered. That they named it together."`,
        vector: v({ SS: 2, VA: 1, CE: 2 }),
      },
      {
        text: `"That they had made beautiful things together. Things that would not vanish because she did."`,
        vector: v({ VA: 2, ES: 1, TD: 1, SS: 1 }),
      },
      {
        text: `They didn't know what to say. They held her hand.`,
        vector: v({ SR: 2, AT: 1, MR: 1, CE: 1 }),
        silence: true,
      },
    ],
    epilogue: `The servant takes the envelope from your hand without looking at it. "One has answered," she says, softly. It is the first time you've heard her voice. "Many have stopped here. Follow."`,
    twistClue: `In the hallway behind her, there are six closed doors. Behind one of them, you are almost certain, someone is weeping.`,
  },

  // ─── Chamber 2 — letters from the child ───────────────────────
  // Probes: CE, SS, WP, TD, AT, UI, RT, PO, TR, SR, TV, MR
  {
    kind: "chamber",
    id: "ch2",
    art: "stacked-letters",
    eyebrow: "III · The Writing Room",
    body: `She leads you through a long gallery and into a small writing room. A desk by a window. On it, a wooden box, opened. Inside, letters — many letters, in different handwriting at different ages. A child's print, then a careful adolescent script, then an adult's hand.

The servant says, without invitation: "The deceased had a daughter. They left when she was three, to follow work that could not be done at home. They sent money. They came back, when they came, briefly. She wrote to them for thirty years. These are all from her.

"She is alive. She did not come tonight."

A note rests in the box, in the deceased's trembling hand:`,
    prompt: `Was the deceased right to leave?`,
    choices: [
      {
        text: `"Yes. Some callings deserve everything. A child can have one parent fully present and still flourish."`,
        vector: v({ SS: 3, WP: 2, TD: 1, AT: 1 }),
      },
      {
        text: `"No. A parent's first vocation is the child. The other work can wait, or never come at all."`,
        vector: v({ CE: 3, UI: 2, RT: 2, PO: 1 }),
      },
      {
        text: `"Yes — but they owed her honesty about what they were choosing. The evasion was the wrong, not the leaving."`,
        vector: v({ TR: 2, SR: 1, SS: 2, UI: 1 }),
      },
      {
        text: `"No — but I don't blame them. They were trying to be both, and the world does not let you."`,
        vector: v({ TV: 3, SR: 2, CE: 1, MR: 1 }),
      },
      {
        text: `Some questions don't resolve this neatly. I will not say.`,
        vector: v({ SR: 3, AT: 1, MR: 1 }),
        silence: true,
      },
    ],
    epilogue: `The servant closes the wooden box and lifts it back to its shelf. "Two have answered." She does not say whether you are right.`,
    twistClue: `As you cross the room you notice a leather-bound ledger on a side table by the door. It is open. The page is a list of names. Dozens crossed out. Dozens more, waiting.`,
  },

  // ─── Chamber 3 — the long disagreement ────────────────────────
  // Probes: UI, TR, WP, TD, SR, RT, MR, AT, SI, TV, SS, PO
  {
    kind: "chamber",
    id: "ch3",
    art: "two-chairs",
    eyebrow: "IV · The Library",
    body: `A small door opens onto a larger library — smelling of old paper and rain. Two chairs face one another across a low table. Between them, two stacks of letters tied with string.

"They corresponded with another scholar for thirty years," the servant says. "They disagreed about a single matter — a book the deceased wished to write, and never did write, on the limits of what one person owes another. The other argued the book would do harm. The deceased argued the harm of NOT writing it would be greater. Neither yielded.

"The manuscript is in this room still. Unbound. Unpublished. Whole."

She does not gesture to where it is.

A note rests between the stacks of letters:`,
    prompt: `What does true moral disagreement deserve?`,
    choices: [
      {
        text: `"Argument, hard. Truth deserves it."`,
        vector: v({ UI: 2, TR: 2, WP: 1 }),
      },
      {
        text: `"Patience. Find what the disagreement is really about, underneath."`,
        vector: v({ TD: 3, SR: 1, TR: 1 }),
      },
      {
        text: `"Humility. Decide which of you is more likely right, and learn from them."`,
        vector: v({ SR: 2, RT: 2, TR: 1 }),
      },
      {
        text: `"Distance. Live differently. Let the disagreement breathe."`,
        vector: v({ SS: 3, PO: 1 }),
      },
      {
        text: `Some disagreements are not meant to be resolved. I would not try.`,
        vector: v({ MR: 2, AT: 2, SI: 1, TV: 1 }),
        silence: true,
      },
    ],
    epilogue: `The servant re-ties the string around the letters with care. "Three have answered." She turns to you, slowly.

"May I ask you something not in the testament?"

She does not wait for permission.

"Why did you come?"

You realise you don't have an answer. You opened the letter. You walked through the door. You don't know why.`,
    twistClue: `She lifts a candle and crosses to the wall behind the chairs. There is a photograph pinned there. A person in a coat exactly like yours. Their face is in shadow — but it is not your face. They are smaller than you. They were here. They left.`,
  },

  // ─── Chamber 4 — the unused ticket ────────────────────────────
  // Probes: ES, VA, TE, SI, SS, TV, UI, MR, TR, SR, AT, CE, RT, WP, TD
  {
    kind: "chamber",
    id: "ch4",
    art: "ticket-and-photo",
    eyebrow: "V · The Box on the Table",
    body: `She brings you to a smaller room. There is a table. On the table, a small wooden box, lid lifted.

Inside: a steamship ticket, never used, dated forty years ago. A photograph of a small white house above a coastline you don't recognise. A folded letter — an inheritance offered, an easy life proposed, a love that had been waiting.

"They could have left," the servant says. "Forty years ago. A small house. A settled life. Someone who would have made them happy in the ordinary way. They refused. They stayed here, doing what you have just seen them doing."

She closes the box and sets it back on the table.

A note has been resting under the box:`,
    prompt: `Was the deceased right to refuse?`,
    choices: [
      {
        text: `"Yes. Some kinds of work — and some kinds of love — survive only if you stay."`,
        vector: v({ CE: 2, RT: 2, AT: 1, WP: 1 }),
      },
      {
        text: `"No. Joy is not a small thing. To refuse it on principle is its own failure."`,
        vector: v({ ES: 3, VA: 3, TE: 1 }),
      },
      {
        text: `"Yes — but only if they saw clearly what they were giving up. Refusal without seeing the cost is a kind of vanity."`,
        vector: v({ SR: 2, TR: 2, TD: 1, SS: 1 }),
      },
      {
        text: `"I don't know. The life they had after refusing might have been worth more than the one they refused. Or much less. We can't say."`,
        vector: v({ SI: 3, SR: 1, TV: 1, MR: 1 }),
      },
      {
        text: `I cannot judge a refusal that wasn't mine.`,
        vector: v({ AT: 2, SR: 2, MR: 1 }),
        silence: true,
      },
    ],
    epilogue: `The servant nods slowly. "Four have answered. There has not been a fourth in a long time."

She lifts a small key from her dress.

"There is one chamber left. The one waiting for you in it is not what the chambers may have suggested. I should tell you that now. You may keep silent and turn back, even now. Most have. The estate will let you go, and you will inherit nothing, and you will sleep well in the years to come.

"Or you may meet them."`,
    twistClue: `From somewhere above, you hear footsteps. Slow. Measured. Not hers. "Another candidate," she says, without surprise. "On the second floor. You will not meet."`,
  },

  // ─── Final chamber — the real reveal ───────────────────────────
  {
    kind: "frame",
    id: "reveal",
    art: "candle-deathbed",
    eyebrow: "VI · The Last Chamber",
    body: `You take the key.

The last chamber is small. A single candle. A bed against the far wall. In it, a person — old, very old. Not your face. Not the servant's. Someone you have never seen.

Their eyes are open. They are watching you.

"You came," they say. Their voice is very thin. "Most don't. You are the seventh in eighty years."

You look at the servant. She does not look back at you.

"I am dying tonight," the person on the bed says. "I have been dying for a week. It is now hours. The chambers — what you have just done — they were never a test of whether you deserved my house, or my money. I never had either. They were the things of my life set out on tables, and you were asked what you thought of them.

"You answered as someone who could understand them. Not everyone has. That is what the test was."

They lift one hand. It shakes badly.

"There is a name for what I am. There have been people like me for two hundred years. We are not a school, exactly. We are not a religion. We are a small, quiet thread of people who have committed to a particular kind of moral seriousness — and who tend to one another at the end. The servant beside you was the sixth. I was the fifth.

"You are not inheriting wealth. You are being asked to sit with me, here, until the morning. And then to do the same for the next, when their time comes, decades from now."

They look at you.

"You may say yes. You may walk out. Either is a real answer. Neither will be wrong.

"Take your time."`,
    advance: "Sit with them",
  },
];

export function chamberCount(): number {
  return JOURNEY_SCENES.filter((s) => s.kind === "chamber").length;
}
