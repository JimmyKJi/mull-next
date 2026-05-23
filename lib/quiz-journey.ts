// /quiz/journey — narrative version of the quiz.
//
// FRAME: "The Inheritor"
//
// A letter arrives. A wax seal. A name you don't know. You're asked
// to come alone, at midnight, to a remote estate. You are, the letter
// says, an heir.
//
// At the estate, an elderly servant leads you through a series of
// chambers. Each chamber holds an artifact, a question, and a witness.
// The deceased — whose name you still don't know — designed the
// chambers as a test. Only one capable of true philosophical integrity
// may inherit.
//
// As you progress: other claimants are mentioned, the servant calls
// you by a name that isn't yours, you encounter a photograph of
// yourself you've never seen. The estate's architecture becomes
// impossible. The final chamber reveals: the deceased was you —
// from another life, an older self, a self you didn't become.
//
// You inherit by deciding what kind of person to become.
//
// SCORING: identical to classic quiz. Each choice's vector delta is
// the SAME as the corresponding QUICK_QUESTIONS entry — only the
// surrounding frame changes. /result reads the final 16-D vector
// unchanged.
//
// "KEEP SILENT" is the diegetic bail-out — refuse to answer, leave
// the estate empty-handed. Same effect as "skip to classic quiz" in
// the underlying mechanics, but lives inside the world.

import { v } from "./vectors";

export type JourneyChoice = {
  text: string;
  vector: number[];
};

export type JourneyScene =
  | {
      kind: "frame";
      id: string;
      /** Scene illustration key — see SceneIllustration component. */
      art: SceneArtKey;
      /** Optional eyebrow shown above the body ("CHAPTER ONE"). */
      eyebrow?: string;
      /** Prose body — \n\n between paragraphs. */
      body: string;
      /** Label for the advance button. */
      advance: string;
    }
  | {
      kind: "chamber";
      id: string;
      art: SceneArtKey;
      /** Eyebrow shown above the body ("CHAMBER ONE · THE PHOTOGRAPH"). */
      eyebrow: string;
      /** Setting prose. */
      body: string;
      /** The artifact-rooted philosophical question. */
      prompt: string;
      /** 3-5 choices, same vector deltas as the underlying quiz question. */
      choices: JourneyChoice[];
      /** Brief reaction from the servant (or atmosphere) after the
       *  choice is made. Same epilogue regardless of pick — the weight
       *  is in the having-chosen, not in branching. */
      epilogue: string;
      /** Optional small "twist clue" planted between the answer and
       *  the next advance — escalating mystery across chambers. */
      twistClue?: string;
    };

/** Keys for SVG scene illustrations rendered by SceneIllustration. */
export type SceneArtKey =
  | "estate-night"
  | "foyer-photograph"
  | "doctors-letter"
  | "library-fire"
  | "mirror-room"
  | "key-in-hand";

export const JOURNEY_SCENES: JourneyScene[] = [
  // ─── Arrival ───────────────────────────────────────────────────
  {
    kind: "frame",
    id: "arrival",
    art: "estate-night",
    eyebrow: "I · The Invitation",
    body: `You weren't expecting the letter.

Heavy paper. A wax seal. A name you don't know. The address handwritten in a careful, slightly trembling script: *To the one who would inherit. Come alone, at midnight, this Wednesday.*

You almost threw it away. You didn't.

The estate is two hours from the city. The cab driver won't take you past the gate.`,
    advance: "Walk to the door",
  },

  // ─── Chamber 1 — the photograph ───────────────────────────────
  // Maps to QUICK_QUESTIONS[0]. Vector deltas identical.
  {
    kind: "chamber",
    id: "ch1",
    art: "foyer-photograph",
    eyebrow: "II · The Foyer",
    body: `The door opens before you knock. An elderly woman in dark clothes inclines her head and gestures you inside. She does not introduce herself.

The foyer is candlelit. On a single panelled wall hangs one framed photograph — a young woman, perhaps thirty, on what is clearly her deathbed. Her hand reaches for someone outside the frame. Below the photograph rests a sealed envelope. Your name is on it.

Inside: a slip of paper. The handwriting is the same as the letter.

*She had hours, perhaps a day. He was the one with her. What should he have told her?*

The servant watches you read. She has not said a word.`,
    prompt: "What is the right answer?",
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
    ],
    epilogue: `The servant takes the envelope from your hand without looking at it. "One has answered," she says, softly. It is the first time you've heard her voice. "Many have stopped here. Follow."`,
    twistClue: `In the hallway behind her, you notice for the first time: there are six other doors, and behind one, you think you hear someone weeping.`,
  },

  // ─── Chamber 2 — the doctor's letter ──────────────────────────
  // Maps to QUICK_QUESTIONS[1] (surgeon/transplant trolley).
  {
    kind: "chamber",
    id: "ch2",
    art: "doctors-letter",
    eyebrow: "III · The Study",
    body: `She leads you through a long gallery and into a study. Bookshelves rise to a ceiling you cannot see. The fire is lit but very low.

On a desk lies a letter, opened, in old ink. It is from a doctor.

*"Five would have died without a transplant. One healthy patient was in the building, here for an unrelated examination. I was asked, in effect, to take that one life to save the five. I refused. I know how the arithmetic looks. I know what I did. I have not slept in twenty years."*

Below the letter, in the same trembling hand as before:

*The deceased never spoke to this doctor again. Was the doctor right?*`,
    prompt: "Your answer?",
    choices: [
      {
        text: `"Yes. Some lines you do not cross, even for the better arithmetic."`,
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
    ],
    epilogue: `The servant places the letter back exactly where it lay. She does not say whether you are right. She gestures to a small door at the back of the study. "Two have answered," she says. "Most stop here. Follow."`,
    twistClue: `As you cross the study, you glance at the wall above the fireplace. There is a portrait there. It is too dark to make out the face. You feel, briefly, that the face is one you would recognise if there were more light.`,
  },

  // ─── Chamber 3 — the library, the argument ─────────────────────
  // Maps to QUICK_QUESTIONS[2] (lasting moral disagreement).
  {
    kind: "chamber",
    id: "ch3",
    art: "library-fire",
    eyebrow: "IV · The Correspondence",
    body: `The small door opens onto another library — larger than the first, smelling of old paper and rain. Two chairs face one another across a low table. On the table, two stacks of letters, tied with string.

The servant lifts the first stack. "The deceased corresponded with another scholar for thirty years," she says. "They disagreed about something. Not a misunderstanding. An actual moral disagreement, never resolved. Read."

You don't read the letters. You don't have to. You know already what they were arguing about — you have had your own version of this argument, with someone you respected, who respected you.

A note rests between the stacks:

*What does true moral disagreement deserve?*`,
    prompt: "Choose.",
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
        text: `"Humility. Decide which of you is more likely right and learn from them."`,
        vector: v({ SR: 2, RT: 2, TR: 1 }),
      },
      {
        text: `"Silence. Some disagreements are not meant to be resolved."`,
        vector: v({ MR: 2, AT: 1, SI: 1, TV: 1 }),
      },
      {
        text: `"Distance. Live differently. Let the disagreement breathe."`,
        vector: v({ SS: 3, PO: 1 }),
      },
    ],
    epilogue: `The servant retie the string around the letters. "Three have answered." She does not turn to face you when she next speaks. "May I ask you something not in the testament?"

She turns.

"You have come a long way tonight. Why did you come?"

You realise you don't have an answer. You opened the letter. You walked through the door. You don't know why.`,
    twistClue: `She lifts a candle. In its light, on the wall behind her, you see a slip of paper pinned at eye-level. A photograph. You catch only a corner of it — but the figure in the photograph is wearing a coat exactly like yours.`,
  },

  // ─── Chamber 4 — the mirror room ───────────────────────────────
  // Maps to QUICK_QUESTIONS[3] (experience machine / pleasure button).
  {
    kind: "chamber",
    id: "ch4",
    art: "mirror-room",
    eyebrow: "V · The Apparatus",
    body: `She brings you to a room with mirrors on every wall. In the centre, a small wooden box rests on a table. From the box, a single brass button protrudes.

"The deceased built this in their later years," she says. "It does nothing. But they wished to know what one would say it does, if it did the thing they suspected was possible."

She reads from a small card.

*Press the button: you live a perfect, joyful life — but it is a simulation, complete and undetectable. Don't press: you keep your real life, with all its disappointments, intact.*

She closes the card.

The mirrors show many of you. You can't quite make out, in some of them, which one is yours.`,
    prompt: "What do you do?",
    choices: [
      {
        text: `Press it. Pleasure is real wherever it arises.`,
        vector: v({ ES: 3, VA: 2, TE: 1, SI: 1 }),
      },
      {
        text: `Refuse. Real life has weight that pleasure cannot replace.`,
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
    ],
    epilogue: `The servant nods slowly. "Four have answered. There has not been a fourth in a long time."

She lifts a key from her dress.

"There is one chamber left. You may keep silent and turn back, even now. Most have. The estate will let you go, and you will inherit nothing, and you will sleep well in the years to come."

She extends the key.

"Or you may meet the one who left this to you."`,
  },

  // ─── Final chamber — the reveal ────────────────────────────────
  {
    kind: "frame",
    id: "reveal",
    art: "key-in-hand",
    eyebrow: "VI · The Last Chamber",
    body: `You take the key.

The last chamber is small. No mirrors. One chair, occupied. A figure in shadow, very still, head bowed, hands folded.

"I knew you'd take the key," they say. "I always do."

They lift their head.

It is your face.

Older. Tired in a way you have not been tired. But unmistakably yours — the same eyes, the same set of the mouth, the small crooked tooth you never bothered to fix.

"I have already lived the answers you've just given," they say. "I left this place for the one who would come next — for the one who, given everything I learned, might choose what I could not.

"You are the one who came. So choose."

They lift a small wooden box from the floor and set it on a stool between you.

"It is not money. It is not a house. It is the shape of a life. Take it, and you will know — when you wake tomorrow — what you must do. The decision you've been carrying for weeks will simply be clear.

"Or keep silent. Go home. Some answers, you will find later, on your own.

"You have done well, either way."`,
    advance: "Open the box",
  },
];

/** Convenience for the engine's "Chamber N of M" chip. */
export function chamberCount(): number {
  return JOURNEY_SCENES.filter((s) => s.kind === "chamber").length;
}
