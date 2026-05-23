// /quiz/journey — narrative version of the quiz.
//
// FRAME: "The Inheritor" — v3
//
// A letter arrives. A wax seal. A name you don't know. You're asked
// to come alone, at midnight, to a remote estate. You are, the letter
// says, an heir.
//
// At the estate, an elderly servant leads you through a series of
// chambers. Each chamber holds an artifact, a witness, and a question.
// You answer or you remain silent.
//
// Multiple small mysteries compound across the chambers:
//   - C1: six doors, weeping behind one — who else is here?
//   - C2: a ledger of names by the door, dozens crossed out, dozens
//     awaiting — what kind of process is this?
//   - C3: a photograph of someone in your coat, but their face is
//     not yours — who came before you?
//   - C4: footsteps overhead, another candidate on the second floor,
//     "you will not meet"
//   - Final: the truth is not what you feared. The deceased is alive.
//     They are dying tonight. The "inheritance" is not wealth — it is
//     entry into a small, quiet lineage of people who have committed
//     to a particular kind of moral seriousness. The chambers tested
//     whether you would accept the weight. The final choice is whether
//     to sit with the dying teacher through the hours that remain.
//
// The trope-y "you are the deceased" version is gone. The ending now
// rests on a more grounded stake: real death, real lineage, real
// choice. The mystery clues all resolve concretely (the weeping is
// another candidate who failed and is being driven home; the ledger
// is the lineage roster; the coat photo is a candidate from years
// past; the footsteps are exactly what they sound like — another
// person being tested in parallel).
//
// "SILENCE" is now a real philosophical answer in every chamber, not
// just a bail-out. It carries a small vector toward Skeptical Reflex
// + Ascetic Tendency + Mystical Receptivity, reflecting the genuine
// philosophical stance of withholding judgment. The user can still
// leave the quiz entirely via the header link if they want, but the
// in-chamber silence option keeps them inside the world.

import { v } from "./vectors";

export type JourneyChoice = {
  text: string;
  vector: number[];
  /** Optional flag: this choice is the "silence" / withholding answer
   *  for the chamber. Rendered with subtler styling so it reads as a
   *  withdrawal rather than a louder claim. */
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
      /** Small mystery clue planted between answer and advance. Stays
       *  oblique — clues resolve only at the final reveal. */
      twistClue?: string;
    };

export type SceneArtKey =
  | "envelope-seal"
  | "framed-photograph"
  | "doctors-letter"
  | "two-chairs"
  | "brass-button"
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
  // Q1 dimensions (dying friend last words).
  {
    kind: "chamber",
    id: "ch1",
    art: "framed-photograph",
    eyebrow: "II · The Foyer",
    body: `The door opens before you knock. An elderly woman in dark clothes inclines her head and gestures you inside. She does not introduce herself.

The foyer is candlelit. On a single panelled wall hangs one framed photograph — a young woman, perhaps thirty, on what is clearly her deathbed. Her hand reaches for someone outside the frame. Below the photograph rests a sealed envelope. Your name is on it.

Inside: a slip of paper. The handwriting is the same as the letter.`,
    prompt: `She had hours, perhaps a day. He was the one with her. What should he have told her?`,
    choices: [
      {
        text: `"That something lies beyond. He could not be sure — but he could feel it."`,
        vector: v({ MR: 3, TV: 1, CE: 2, SI: 1 }),
      },
      {
        text: `"That everyone faces this. The wisdom is in how we meet it."`,
        vector: v({ AT: 2, PO: 2, TR: 2, TV: 1 }),
      },
      {
        text: `"That he asked her what had mattered. That they named it together."`,
        vector: v({ SS: 2, VA: 1, CE: 2 }),
      },
      {
        text: `"That they had made beautiful things together. Things that would not vanish because she did."`,
        vector: v({ VA: 2, ES: 1, TD: 1, SS: 1 }),
      },
      {
        text: `He didn't know what to say. He held her hand.`,
        vector: v({ SR: 2, AT: 1, MR: 1, CE: 1 }),
        silence: true,
      },
    ],
    epilogue: `The servant takes the envelope from your hand without looking at it. "One has answered," she says, softly. It is the first time you've heard her voice. "Many have stopped here. Follow."`,
    twistClue: `In the hallway behind her, there are six closed doors. Behind one of them, you are almost certain, someone is weeping.`,
  },

  // ─── Chamber 2 — the doctor's letter ──────────────────────────
  // Q2 dimensions (surgeon trolley reframed).
  {
    kind: "chamber",
    id: "ch2",
    art: "doctors-letter",
    eyebrow: "III · The Study",
    body: `She leads you through a long gallery and into a study. Bookshelves rise to a ceiling you cannot see. The fire is lit but very low.

On a desk lies a letter, opened, in old ink. It is from a doctor.

*"Five would have died without a transplant. One healthy patient was in the building, here for an unrelated examination. I was asked, in effect, to take that one life to save the five. I refused. I know how the arithmetic looks. I know what I did. I have not slept in twenty years."*

Below the letter, in the same trembling hand as before, a note:`,
    prompt: `The deceased never spoke to this doctor again. Was the doctor right?`,
    choices: [
      {
        text: `"Yes. Some lines you do not cross, even for better arithmetic."`,
        vector: v({ UI: 3, RT: 1, AT: 1 }),
      },
      {
        text: `"No. Five lives are five lives. The math is heavy but it is plain."`,
        vector: v({ TR: 2, UI: 1, PO: 2, WP: 1 }),
      },
      {
        text: `"Yes — but for practical reasons. He would have destroyed the trust on which medicine depends."`,
        vector: v({ PO: 3, TE: 2, SR: 1 }),
      },
      {
        text: `"The question is malformed. No real life ever comes down to such a clean dilemma."`,
        vector: v({ CE: 1, RT: 2, MR: 1, SR: 2 }),
      },
      {
        text: `I cannot judge him. I was not there.`,
        vector: v({ SR: 3, AT: 1, MR: 1 }),
        silence: true,
      },
    ],
    epilogue: `The servant places the letter back exactly where it lay. She does not say whether you are right. She gestures to a small door at the back of the study. "Two have answered."`,
    twistClue: `As you cross the study, you notice a leather-bound ledger on a side table by the door. It is open. The page is a list of names. Dozens crossed out. Dozens more, waiting.`,
  },

  // ─── Chamber 3 — the library, the argument ─────────────────────
  // Q3 dimensions (lasting moral disagreement).
  {
    kind: "chamber",
    id: "ch3",
    art: "two-chairs",
    eyebrow: "IV · The Correspondence",
    body: `The small door opens onto another library — larger than the first, smelling of old paper and rain. Two chairs face one another across a low table. On the table, two stacks of letters, tied with string.

The servant lifts the first stack. "The deceased corresponded with another scholar for thirty years," she says. "They disagreed about something. Not a misunderstanding. An actual moral disagreement, never resolved."

You don't read the letters. You don't have to. You have had your own version of this argument — with someone you respected, who respected you.

A note rests between the stacks:`,
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
    epilogue: `The servant re-ties the string around the letters. "Three have answered." She does not turn to face you when she next speaks.

"May I ask you something not in the testament?"

She turns.

"Why did you come?"

You realise you don't have an answer. You opened the letter. You walked through the door. You don't know why.`,
    twistClue: `She lifts a candle and crosses to the wall behind the chairs. There is a photograph pinned there. A person in a coat exactly like yours. Their face is in shadow — but it is not your face. They are smaller than you. They were here. They left.`,
  },

  // ─── Chamber 4 — the mirror room ───────────────────────────────
  // Q4 dimensions (experience machine).
  {
    kind: "chamber",
    id: "ch4",
    art: "brass-button",
    eyebrow: "V · The Apparatus",
    body: `She brings you to a small room. No mirrors — your reflection of the room from your last imagining was wrong. There is one wooden box on a table, and a single brass button protruding from it.

"The deceased built this in their later years," she says. "It does nothing. But they wished to know what one would say it does, if it did the thing they suspected was possible."

She reads from a small card.

*Press the button: you live a perfect, joyful life — but it is a simulation, complete and undetectable. Don't press: you keep your real life, with all its disappointments, intact.*

She closes the card. From somewhere above, you hear footsteps. Slow. Measured. Not hers.

"Another candidate," she says, without surprise. "On the second floor. You will not meet."`,
    prompt: `Press, or refuse?`,
    choices: [
      {
        text: `Press it. Pleasure is real wherever it arises.`,
        vector: v({ ES: 3, VA: 2, TE: 1, SI: 1 }),
      },
      {
        text: `Refuse. Real life has a weight pleasure cannot replace.`,
        vector: v({ SS: 2, TV: 2, UI: 1, MR: 1 }),
      },
      {
        text: `Refuse. To never know what is real would itself be a loss.`,
        vector: v({ TR: 2, SS: 1, SR: 2 }),
      },
      {
        text: `Press it. Most of "real life" was never what it claimed to be.`,
        vector: v({ TV: 3, SR: 1, SI: 2 }),
      },
      {
        text: `Leave my hand at my side. Refuse to choose at all.`,
        vector: v({ AT: 2, SR: 2, MR: 1 }),
        silence: true,
      },
    ],
    epilogue: `The servant nods slowly. "Four have answered. There has not been a fourth in a long time."

She lifts a small key from her dress.

"There is one chamber left. The one waiting for you in it is not what the chambers suggested. I should tell you that now. You may keep silent and turn back, even now. Most have. The estate will let you go, and you will inherit nothing, and you will sleep well in the years to come.

"Or you may meet them."`,
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

"I am dying tonight," the person on the bed says. "I have been dying for a week. It is now hours. The chambers — what you have just done — they were not a test of whether you deserved my house, or my money. I never had either. They were a test of whether you could be trusted with something smaller, and much heavier."

They lift one hand. It shakes badly.

"There is a name for what I am. There have been people like me for two hundred years. We are not a school, exactly. We are not a religion. We are a small, quiet thread of people who have committed to a particular kind of moral seriousness, and who tend to one another at the end. The servant beside you was the sixth. I was the fifth.

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
