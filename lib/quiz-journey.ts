// /quiz/journey — narrative version of the quiz.
//
// FRAME: "The Inheritor" — v5
//
// Two changes per first-time-user feedback (Jimmy's gf testing v4):
//
//   1. The user is IN the choice, not judging the deceased.
//      v4 prompts read as "what should they have said?" — abstract,
//      observer-position. v5 reframes every prompt as YOU put yourself
//      in the deceased's place. The artifacts in each chamber still
//      tell you who the deceased was, but the note in each chamber
//      sets up "this happened to them. it could happen to you. what
//      would you do?" The choices become dialogue or actions you'd
//      take, not abstract philosophical positions.
//
//   2. Prose is more sensory, embodied, contemporary — less "fable".
//      v4 felt distanced ("a young woman on what is clearly her
//      deathbed"). v5 puts you in the physical scene: smells, sounds,
//      temperatures, concrete actions you take (you open the
//      envelope, you cross the room, you take the key — the metal
//      colder than you expected). Present tense throughout. No
//      archaic phrasing.
//
// Scoring + chamber count unchanged. All 16 dimensions covered.
// /result handoff unchanged.

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
    body: `The letter is on your kitchen counter when you come home from work. You don't know how it got there.

Heavy paper, thicker than letters get anymore. A wax seal in dark red, broken open. Your name on the envelope in a slightly trembling script — careful, like someone who hadn't written by hand in a long time had made themselves write this one.

Inside, a single sheet:

*To the one who would inherit.*
*Come alone, at midnight, this Wednesday.*

A signature you don't recognise. An address two hours outside the city.

You almost throw it away. You think about it for two days. On Wednesday afternoon, you find yourself ordering the cab.

The driver won't take you past the gate.`,
    advance: "Walk to the door",
  },

  // ─── Chamber 1 — the photograph ───────────────────────────────
  {
    kind: "chamber",
    id: "ch1",
    art: "framed-photograph",
    eyebrow: "II · The Foyer",
    body: `The door opens before you can knock. The woman who opens it doesn't introduce herself. She's older than you were expecting, and her eyes are kind. She steps back and gestures you in.

The foyer smells of beeswax and old wood. A single candle burns in a brass holder on a small table. The hallway beyond is dark.

There is one thing on the wall.

A small framed photograph: a woman in a hospital bed, propped on pillows. Maybe thirty. She is reaching for someone outside the frame, and you can see only the cuff of a sleeve where her hand meets his. Her face is calm but exhausted.

Below the photograph rests an envelope with your name on it. You open it. The handwriting matches the invitation.

*This was the deceased and the person they loved. She had hours, maybe a day. He had been holding her hand for a long time. She turned her head and asked him, without words, to say something to her. Anything.*

*Put yourself in his place.*`,
    prompt: `She's looking at you. What do you say?`,
    choices: [
      {
        text: `"There's something on the other side of this. I don't know what. But I can feel it."`,
        vector: v({ MR: 3, TV: 1, CE: 2, SI: 1 }),
      },
      {
        text: `"Everyone we love faces this. What matters is how we meet it."`,
        vector: v({ AT: 2, PO: 2, TR: 2, TV: 1 }),
      },
      {
        text: `"Tell me what mattered. Let's name it together while we still can."`,
        vector: v({ SS: 2, VA: 1, CE: 2 }),
      },
      {
        text: `"We made beautiful things together. Those don't disappear because you do."`,
        vector: v({ VA: 2, ES: 1, TD: 1, SS: 1 }),
      },
      {
        text: `You don't say anything. You hold her hand tighter.`,
        vector: v({ SR: 2, AT: 1, MR: 1, CE: 1 }),
        silence: true,
      },
    ],
    epilogue: `The servant takes the empty envelope from you. "One has answered," she says, softly — it's the first time you've heard her voice. "Many have stopped here. Follow."`,
    twistClue: `In the hallway behind her, you count six closed doors. Behind one of them, you're almost certain, you can hear someone crying.`,
  },

  // ─── Chamber 2 — letters from the child ───────────────────────
  {
    kind: "chamber",
    id: "ch2",
    art: "stacked-letters",
    eyebrow: "III · The Writing Room",
    body: `She leads you down a long hallway. The floorboards creak under your weight; not under hers. You pass two doors — one open onto a sitting room you don't enter, one closed and silent. Then a smaller corridor, then a writing room with one window facing the dark.

There is a desk by the window. On the desk, a wooden box, its lid open. Inside, letters — many of them, stacked. The handwriting on the top letter is a child's wide print. Underneath, the next is a careful adolescent's. Underneath that, an adult's hand. The same person, writing across thirty years.

The servant says, without invitation: "The deceased had a daughter. They left when she was three — to follow work that couldn't be done at home. They sent money. They came back, briefly, twice a year. The daughter wrote to them for thirty years. These are the letters."

She pauses. "She is alive. She did not come tonight."

A note rests in the lid of the box, in the same trembling handwriting:

*Your work is your calling. It can't be done at home. There is a small child who needs you.*

*Put yourself in their place.*`,
    prompt: `Do you leave?`,
    choices: [
      {
        text: `Yes. Some callings ask for everything. The child can have one parent fully present and still flourish.`,
        vector: v({ SS: 3, WP: 2, TD: 1, AT: 1 }),
      },
      {
        text: `No. Your first vocation is the child. Whatever else can wait, or not happen at all.`,
        vector: v({ CE: 3, UI: 2, RT: 2, PO: 1 }),
      },
      {
        text: `Yes — but you tell the child the truth about what you're choosing and why. The honesty is the thing you owe them.`,
        vector: v({ TR: 2, SR: 1, SS: 2, UI: 1 }),
      },
      {
        text: `You try to be both. You know you may fail at both. You try anyway.`,
        vector: v({ TV: 3, SR: 2, CE: 1, MR: 1 }),
      },
      {
        text: `You don't decide. You hold both possibilities a long time, and let life decide for you.`,
        vector: v({ SR: 3, AT: 1, MR: 1 }),
        silence: true,
      },
    ],
    epilogue: `The servant closes the wooden box and lifts it back to its shelf. "Two have answered." She doesn't say whether you are right.`,
    twistClue: `By the door, you notice a leather-bound ledger on a side table. It's open. The page is a list of names. Dozens crossed out. Dozens more, still waiting to be added.`,
  },

  // ─── Chamber 3 — the long disagreement ────────────────────────
  {
    kind: "chamber",
    id: "ch3",
    art: "two-chairs",
    eyebrow: "IV · The Library",
    body: `She leads you through a smaller door — you have to duck — and into a library. This one is larger. It smells of paper and rain, somehow, though you've heard no rain.

Two chairs face each other across a low table. Between them: two stacks of letters, both thick, both tied with string.

She lifts one stack. "The deceased corresponded with another scholar for thirty years. They disagreed about one thing — a book the deceased wanted to write, and never wrote, about the limits of what one person owes another. The other one argued the book would do real harm. The deceased argued the harm of NOT writing it would be greater. Neither would yield."

She gestures vaguely toward a corner. "The manuscript is in this room. Unbound. Whole."

She doesn't say where.

A note rests between the stacks:

*You have an argument like this. You know you do. It's gone on for years. They're someone you respect. They respect you. Neither of you yields.*

*Put yourself there. The next time you see them.*`,
    prompt: `What do you do?`,
    choices: [
      {
        text: `Keep arguing. If they're wrong about something this important, they need to hear it from you.`,
        vector: v({ UI: 2, TR: 2, WP: 1 }),
      },
      {
        text: `Stop arguing and start listening. Try to find what you actually disagree about, underneath the surface of it.`,
        vector: v({ TD: 3, SR: 1, TR: 1 }),
      },
      {
        text: `Yield. They've thought about this longer than you have. You have things to learn from them.`,
        vector: v({ SR: 2, RT: 2, TR: 1 }),
      },
      {
        text: `Walk away from the argument. Live your life by your answer; let them live by theirs.`,
        vector: v({ SS: 3, PO: 1 }),
      },
      {
        text: `Stay with them, in silence. Some disagreements aren't meant to be resolved.`,
        vector: v({ MR: 2, AT: 2, SI: 1, TV: 1 }),
        silence: true,
      },
    ],
    epilogue: `The servant re-ties the strings around the letters with care. "Three have answered." She turns to you, slowly.

"May I ask you something not in the testament?"

She doesn't wait for permission.

"Why did you come?"

You realise you don't have an answer. You opened the letter. You walked through the door. You don't know why.`,
    twistClue: `She lifts a candle and crosses to the wall behind the chairs. There is a photograph pinned there. A figure in a coat that looks exactly like yours. Their face is in shadow — but it isn't your face. They were here. They left.`,
  },

  // ─── Chamber 4 — the unused ticket ────────────────────────────
  {
    kind: "chamber",
    id: "ch4",
    art: "ticket-and-photo",
    eyebrow: "V · The Box on the Table",
    body: `She leads you up a narrow staircase. Your footsteps sound louder than hers, which makes no sense — she's heavier than you are. At the top, a small room with one table.

On the table: a small wooden box, the lid lifted. You step closer.

Inside: a steamship ticket — never used, the paper aged but still crisp. The date is forty years ago. Beside it, a small sepia photograph: a white house above a coastline you don't recognise. Underneath, a folded letter you don't open.

"They could have left," the servant says. "Forty years ago. A small inheritance from a relative they barely knew. A settled life. Someone who would have made them happy in the ordinary way. They refused. They stayed here, doing what you have just seen them do."

She closes the box and sets it back on the table.

A note has been resting under the box:

*You are offered the easier life. A quieter love. Good work that is smaller. Or you can stay where you are, doing what's harder.*

*Put yourself there. The morning the ticket arrived.*`,
    prompt: `Do you take it?`,
    choices: [
      {
        text: `Yes. Joy is not a small thing. To refuse it on principle is its own kind of failure.`,
        vector: v({ ES: 3, VA: 3, TE: 1 }),
      },
      {
        text: `No. Some kinds of work — and some kinds of love — only survive if you stay where you are.`,
        vector: v({ CE: 2, RT: 2, AT: 1, WP: 1 }),
      },
      {
        text: `Yes — but only if you can keep doing the harder work somehow alongside it.`,
        vector: v({ PO: 3, SR: 1, TR: 1, CE: 1 }),
      },
      {
        text: `No — but only if you can see clearly what you're giving up. Refusing without seeing the cost is its own kind of vanity.`,
        vector: v({ SR: 2, TR: 2, TD: 1, SS: 1 }),
      },
      {
        text: `You don't decide. You let the ticket sit on the table for a month and watch what your life does.`,
        vector: v({ SI: 3, SR: 1, TV: 1, MR: 1 }),
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
    body: `You take the key. The metal is colder than you expected. The servant watches you take it. She doesn't follow you.

The last chamber is small. A single candle on a bedside table. A bed against the far wall. Someone in it — very old. Not your face. Not the servant's. Someone you have never seen.

Their eyes are open. They are watching you cross the room.

"You came," they say. The voice is thin, a paper sound. "Most don't. You are the seventh in eighty years."

You don't know what to say.

"I am dying tonight," they say. "I have been dying for a week. It is hours now. The chambers — what you just did — those weren't a test of whether you deserved my house, or my money. I never had either. They were the things of my life, set out on tables, and you were asked what you would have done in them.

"You answered as someone who could understand them. Not everyone has."

They lift one hand. It shakes.

"There is a name for what I am. There have been people like me for two hundred years. We're not a school. We aren't a religion. We are a small, quiet thread of people who have committed to a particular kind of moral seriousness — and who tend to one another at the end. The woman beside you was the sixth. I was the fifth.

"You are not inheriting wealth. You are being asked to sit with me here, until the morning. And then to do the same for the next, when their time comes, decades from now."

They look at you.

"You can say yes. You can walk out. Either is a real answer. Neither would be wrong.

"Take your time."`,
    advance: "Sit with them",
  },
];

export function chamberCount(): number {
  return JOURNEY_SCENES.filter((s) => s.kind === "chamber").length;
}
