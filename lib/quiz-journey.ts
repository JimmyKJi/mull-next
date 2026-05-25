// /quiz/journey — "The Inheritor" v7.
//
// GENRE: country-house murder mystery.
//
// Major reshape from v5/v6 (the quiet "midnight at a strange
// estate" framing) after Jimmy played the v6 build and asked
// for a more action-packed, more genre-familiar wrapper. The
// philosophical placement engine is unchanged — every choice in
// every chamber still maps to the same 16-D vector deltas — but
// the framing is now an investigation, the prompts are the
// inheritor's detective decisions, and the four chambers contain
// not just artifacts from the deceased's life but small anomalies
// that don't fit. A clue track runs underneath the questions.
//
// THE STORY (no spoilers in the user-facing prose until the
// reveal scene; this comment summarizes for future maintainers):
//   - A reclusive philosopher is dead in their estate.
//   - You are one of seven inheritors named in the will. You are
//     the only one who came tonight.
//   - The will requires the inheritor to pass through the four
//     chambers before claiming.
//   - A silent servant guides you. She doesn't explain herself.
//   - Each chamber contains: (a) an artifact from the deceased's
//     life that asks you to make a choice (same vector math as
//     before), and (b) a quiet anomaly the servant points out
//     that doesn't fit the official story of the death.
//   - The anomalies cumulate: the "late" wife is alive; the
//     estranged daughter forgave the deceased months ago; the
//     lifelong rival conceded the argument months ago; the
//     steamship ticket was bought LAST WEEK.
//
//   - TWIST 1 (final chamber): the deceased is alive. They faked
//     their death — not to flee, to see who would come.
//   - TWIST 2 (lighter beat in the reveal): the silent servant is
//     the deceased's "late" wife. She never died. The deceased
//     invented her death thirty years ago as their excuse to
//     withdraw from the world.
//
// TEN ENDINGS — one per archetype.
//   The deceased recognizes you as a specific kind of mind based
//   on how you investigated, and gives you a specific task that
//   only that archetype could do well (find the wife, publish the
//   rival's letter, take the ticket and live the life the deceased
//   never did, etc.). Each ending has a second-order FLAVOR beat
//   that varies by the user's strongest dimension outside their
//   archetype's defining cluster — so a "Tragic Cartographer" gets
//   a different mid-paragraph than a "Communal Cartographer," even
//   though the inheritance and ask are the same.
//
// SCORING + /result handoff unchanged. Chamber count unchanged.
// All 16 dimensions still covered by the choices.

import { cos, v, zeros } from "./vectors";
import { ARCHETYPE_TARGETS, expandArchetypeVector } from "./archetype-targets";
import { DIM_KEYS, type DimKey } from "./dimensions";

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
      /** Default epilogue, shown after any pick that doesn't have its
       *  own entry in `choiceEpilogues`. The servant's terse
       *  acknowledgement: "N have answered. Follow." Used to also
       *  carry the chamber's anomaly beat in the murder-mystery
       *  reshape — the servant points out what doesn't fit before
       *  moving on. */
      epilogue: string;
      /** Per-choice epilogues — keyed by choice index. When a user
       *  picks a choice with a key in this map, this text replaces
       *  the default `epilogue` for that turn. Used to make specific
       *  philosophically distinctive choices trigger a reveal about
       *  the deceased — actively pulling the user into the story
       *  rather than just acknowledging the pick. */
      choiceEpilogues?: Record<number, string>;
      twistClue?: string;
    }
  | {
      /** Branching final scene. The engine, when it reaches a 'reveal'
       *  scene, calls pickEnding(accumulatedVector) to pick which of
       *  the 10 archetype-keyed endings in JOURNEY_REVEALS to render.
       *  The reveal scene itself carries the shared cold-open prose
       *  (the walk into the final chamber) — the archetype-specific
       *  recognition + flavor beat + inheritance + ask are spliced in
       *  by the engine using the picker output. */
      kind: "reveal";
      id: string;
      art: SceneArtKey;
      eyebrow: string;
      /** Shared cold-open — what every inheritor sees regardless of
       *  archetype before the deceased recognizes them. */
      coldOpen: string;
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
    body: `The solicitor's letter is on your kitchen counter when you come home from work. You don't remember leaving the door unlocked.

Heavy paper, the kind law firms still use when they want to feel old. Two sheets inside.

The first is the official notice:

*A. K. WREN — DECEASED — FOUND AT SHORTHEATH ESTATE THIS MORNING. ARRANGEMENTS PRIVATE. NO PUBLIC SERVICE.*

The name means nothing to you. You search it on your phone, briefly. A recluse philosopher. Three obscure books, decades old. No photograph anywhere on the internet that you can verify.

The second sheet is the will. Or part of one. You stop reading at the third paragraph:

*Seven inheritors are named. Each must come, alone, to the estate by midnight on the day following the death. They must pass through the four chambers in the company of the housekeeper. Only those who complete the chambers may claim. The estate is bequeathed by lot among those who finish.*

Your name is in the list. So are six others. You don't recognise any of them.

You think about it for ninety minutes. You think about how a stranger you have never heard of has named you in a will. You think about what you would regret more — going or not going.

At ten, you order the cab.

The driver won't take you past the gate.`,
    advance: "Walk to the door",
  },

  // ─── Chamber 1 — the photograph ───────────────────────────────
  // ANOMALY: the deceased's "late wife" has no death record at the
  // local registry. The servant says so in the epilogue. First small
  // clue that the official story of Wren's life — and death — isn't
  // tight.
  {
    kind: "chamber",
    id: "ch1",
    art: "framed-photograph",
    eyebrow: "II · The Foyer",
    body: `The door opens before you can knock. The woman who opens it doesn't introduce herself. She's older than you were expecting. Her eyes are red around the edges in a way that suggests she has been crying earlier today but is past it now. She steps back and gestures you in.

The foyer smells of beeswax and old wood. A single candle burns in a brass holder on a small table. The hallway beyond is dark.

There is one thing on the wall.

A small framed photograph: a woman in a hospital bed, propped on pillows. Maybe thirty. She is reaching for someone outside the frame — you can see only the cuff of a sleeve where her hand meets his. Her face is calm but exhausted.

Below the photograph, an envelope rests on a small shelf. *For the inheritor — read first.* The solicitor's seal.

You open it.

*This was Wren and his wife, Elena. She died thirty-one years ago of a long illness, in her thirtieth year. Wren held her hand for the last hour of her life. She turned her head and asked him, without words, to say something to her. Anything.*

*If you would understand this man — and you must, before you may inherit from him — begin with this moment. Put yourself in his place.*`,
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
        text: `You don't speak. You stay completely still and present, every sense open. This moment — this — is what is sublime.`,
        vector: v({ VA: 3, ES: 2, SR: 1, MR: 1 }),
      },
      {
        text: `You don't say anything. You hold her hand tighter.`,
        vector: v({ SR: 2, AT: 1, MR: 1, CE: 1 }),
        silence: true,
      },
    ],
    epilogue: `The servant takes the empty envelope from you. "One has answered," she says, softly. It's the first time you've heard her voice. She pauses at the threshold.

"Before we move on. There is something the solicitor would not put in writing." She looks at the photograph. "I worked at this estate before Wren did. Elena Wren died thirty-one years ago. So says Wren, so says the will. But there is no record of her death at the county registry. There is no headstone. I do not know why."

She turns into the dark of the hallway. "Most who reach this house do not notice. Follow."`,
    choiceEpilogues: {
      // The "fully present, sublime" choice — the secular-reverence
      // stance. The servant reveals the missing-death-record anomaly
      // in a slightly different cadence here: the inheritor noticed
      // wordlessly, so she answers wordlessly first, then says it
      // anyway.
      4: `The servant does not take an envelope from you — you didn't write one. She watches you for a long moment. Then, with what might be the smallest possible nod, she says: "You felt it without being told. Good. Then you will be the first who hears this without surprise."

She looks at the photograph.

"Elena Wren has no death record at the county registry. There is no headstone. The illness is what Wren wrote. The county says otherwise."

She turns. "Follow."`,
    },
    twistClue: `In the hallway behind her, you count six closed doors. Behind one of them, you're almost certain, you can hear someone crying.`,
  },

  // ─── Chamber 2 — letters from the child ───────────────────────
  // ANOMALY: the daughter's last letter, three months ago, says she
  // forgave Wren and invited him to visit. He never went. Why does
  // a man four weeks from his own death leave a forgiveness on the
  // table?
  {
    kind: "chamber",
    id: "ch2",
    art: "stacked-letters",
    eyebrow: "III · The Writing Room",
    body: `She leads you down a long hallway. The floorboards creak under your weight; not under hers. You pass two doors — one open onto a sitting room you don't enter, one closed and silent. Then a smaller corridor, then a writing room with one window facing the dark.

There is a desk by the window. On the desk, a wooden box, its lid open. Inside, letters — many of them, stacked. The handwriting on the top letter is a child's wide print. Underneath, the next is a careful adolescent's. Underneath that, an adult's hand. The same person, writing across thirty years.

The servant says, without invitation: "Wren had a daughter. He left when she was three — to follow work that couldn't be done at home. He sent money. He came back, briefly, twice a year. The daughter wrote to him for thirty years. These are the letters. She is alive. She did not come tonight."

A note rests in the lid of the box, in a careful hand:

*This is the choice he made when she was three. He could not see, then, what it would cost. The will requires you to see it now, before you read further. Put yourself in his place. The infant is in the next room. The work is waiting. Do you leave?*`,
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
        text: `You leave. But you stay close — letters every week, visits every month. The pattern of being both, kept faithfully.`,
        vector: v({ PO: 3, TR: 1, CE: 2, WP: 1 }),
      },
      {
        text: `You try to be both. You know you may fail at both. You try anyway.`,
        vector: v({ TV: 3, SR: 1, CE: 1, MR: 1 }),
      },
      {
        text: `You don't decide. You hold both possibilities a long time, and let life decide for you.`,
        vector: v({ SR: 3, AT: 1, MR: 1 }),
        silence: true,
      },
    ],
    epilogue: `The servant closes the wooden box and rests her hand on it. "Two have answered."

She lifts the top letter out — the most recent. The paper is fresher than the others, and the handwriting older. Adult, careful, sad.

"Wren's daughter sent this three months ago. I am required by the will to show it to whoever passes through this chamber. Read the last line."

You take it. The last line, in the older woman's hand, is:

*I forgive you for all of it. Come visit, if you want. I am not angry anymore.*

The servant takes the letter back. "Wren never went. He wrote no reply. He died four weeks after receiving it."

She lifts the box back to the shelf. "Follow."`,
    choiceEpilogues: {
      // The "leave but stay close" choice — the practical-pattern
      // stance. Anomaly delivered as a heavier beat here, because the
      // user has shown they care about the pattern of return.
      3: `The servant closes the wooden box but does not lift it. She rests her hand on it instead. "Some have answered this way. Wren did. For seven years he wrote every Wednesday and visited at Christmas and Easter. Then one Christmas he didn't go. The daughter waited at the station for six hours. She never wrote about it. The letters in this box stop the month after."

She lifts the top letter out — the only one in a hand newer than the others. The handwriting is older, sad.

"Then, three months ago, she wrote again. The first time in twenty-three years." She unfolds it. The last line is: *I forgive you for all of it. Come visit, if you want. I am not angry anymore.*

She refolds the letter. "Wren never went. He wrote no reply. He died four weeks after receiving it. Some patterns are harder to keep than to start. Follow."`,
    },
    twistClue: `By the door, you notice a leather-bound ledger on a side table. It's open. The page is a list of names. Dozens crossed out. Dozens more, still waiting to be added.`,
  },

  // ─── Chamber 3 — the long disagreement ────────────────────────
  // ANOMALY: the rival's last letter, six months ago, conceded the
  // argument and urged Wren to publish. Wren never did. A man whose
  // life's argument has just been validated does not, ordinarily,
  // leave the book unwritten.
  {
    kind: "chamber",
    id: "ch3",
    art: "two-chairs",
    eyebrow: "IV · The Library",
    body: `She leads you through a smaller door — you have to duck — and into a library. This one is larger. It smells of paper and rain, somehow, though you've heard no rain.

Two chairs face each other across a low table. Between them: two stacks of letters, both thick, both tied with string.

She lifts one stack. "Wren corresponded with another scholar for thirty years. They disagreed about one thing — a book Wren wanted to write, and never wrote, about the limits of what one person owes another. The other one argued the book would do real harm. Wren argued the harm of NOT writing it would be greater. Neither yielded."

She gestures vaguely toward a corner. "The manuscript is in this room. Unbound. Whole."

She doesn't say where.

A note rests between the stacks, in the same careful hand as the last chamber:

*You have an argument like this. You know you do. It has gone on for years. They are someone you respect. They respect you. Neither yields.*

*Put yourself there. The next time you see them. What do you do?*`,
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
        text: `Sit down with the actual book — yours or theirs — and read it again from scratch. The argument may already be answered, or differently than either of you thought.`,
        vector: v({ TD: 3, TR: 2, PO: 1 }),
      },
      {
        text: `Stay with them, in silence. Some disagreements aren't meant to be resolved.`,
        vector: v({ MR: 2, AT: 2, SI: 1, TV: 1 }),
        silence: true,
      },
    ],
    epilogue: `The servant re-ties the strings around the letters with care. "Three have answered."

Then she lifts a single sheet from beside the rival's stack — a letter newer than the others, the paper still pale.

"The rival wrote this six months ago. It is the last letter she ever sent him. I am required to show it to whoever passes through this chamber. Read the last paragraph."

You take it. The last paragraph, in a tight scholar's hand, reads:

*Andrew — I have just finished reading your manuscript again, for the fourth time. The argument is yours, not mine. I was wrong. I am too old to pretend otherwise. Publish it. Publish it this year, or I will publish it for you with both our names. — M.*

The servant takes the letter back. "Wren never published. He wrote no reply that I have found. He died four months after receiving this."

She turns. "Follow."`,
    choiceEpilogues: {
      // "Read the manuscript yourself" — epistemic-engagement stance.
      // Original beat preserved (Wren reread the book every year),
      // anomaly delivered as a sharper question at the end.
      4: `The servant is still for a moment. Then she crosses the room, reaches into a low cupboard, and lifts out a thick bound stack — the manuscript. She does not hand it to you. She sets it on the floor between you and her, like a third presence.

"Wren opened this every year, on the same day. He read it cover to cover. By the end of his life he had read it forty-one times. The page he reread most is the one we are sitting near now. He never published it. The last time he read it, he told me: 'I think it was a different argument than I thought.' I do not know what he meant."

She lifts a newer sheet from beside the rival's stack — paper still pale.

"This came six months ago. The rival, conceding. *Publish it. Publish it this year, or I will publish it for you with both our names.* He still did not publish. He had four months and a manuscript and a rival's permission, and he did not publish. Three have answered. Follow."`,
    },
    twistClue: `She lifts a candle and crosses to the wall behind the chairs. There is a photograph pinned there. A figure in a coat that looks exactly like yours. Their face is in shadow — but it isn't your face. They were here. They left.`,
  },

  // ─── Chamber 4 — the unused ticket ────────────────────────────
  // ANOMALY: the ticket is dated LAST WEEK, not forty years ago.
  // Wren was planning to leave. Eight days before his "death."
  // The biggest of the four anomalies and the one that should make
  // the inheritor begin to suspect what the reveal will confirm.
  {
    kind: "chamber",
    id: "ch4",
    art: "ticket-and-photo",
    eyebrow: "V · The Box on the Table",
    body: `She leads you up a narrow staircase. Your footsteps sound louder than hers, which makes no sense — she's heavier than you are. At the top, a small room with one table.

On the table: a small wooden box, the lid lifted. You step closer.

Inside: a steamship ticket — unused, the paper crisp. Beside it, a small sepia photograph: a white house above a coastline you don't recognise. Underneath, a folded letter you don't open.

"Forty years ago," the servant says, "Wren was offered a quieter life. A small inheritance from a relative he barely knew. A settled love. Good work that would have been smaller. He refused. He stayed here. The ticket in the box is from that refusal — kept as a reminder of the road he did not take."

She closes the box and sets it back on the table.

A note rests under the box:

*You are offered the easier life. A quieter love. Good work that is smaller. Or you can stay where you are, doing what is harder. Put yourself there. The morning the ticket arrived.*`,
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
        text: `Take it, but keep coming back. Live both lives. Accept that neither will be fully yours.`,
        vector: v({ ES: 2, SS: 2, SR: 1, CE: 1, PO: 1 }),
      },
      {
        text: `You don't decide. You let the ticket sit on the table for a month and watch what your life does.`,
        vector: v({ SI: 3, SR: 1, TV: 1, MR: 1 }),
        silence: true,
      },
    ],
    epilogue: `The servant nods slowly. "Four have answered. There has not been a fourth in a long time."

She does not, this time, lift any new letter from the box. Instead she turns the ticket itself over in her fingers, and tilts it so the candlelight catches the date stamped at the top.

"Look at it."

You lean in. The date is not forty years ago. The date is eight days ago.

"A new ticket," she says, "issued under Wren's name, last Wednesday. The coastline is the same. The house above it is still standing — I have looked into it. Someone there is expecting a guest." She places the ticket back in the box. "Wren was, eight days ago, planning to leave. He died four days after he bought it."

She lifts a small key from her dress.

"There is one chamber left. The one waiting for you in it is not what the chambers may have suggested. I should tell you that now. You may keep silent and turn back, even now. Most have. The estate will let you go, and you will inherit nothing, and you will sleep well in the years to come."

She turns the key once in her palm.

"Or you may meet him."`,
    choiceEpilogues: {
      // "Take it but keep coming back" — partial-commitment stance.
      // We use a sharper variant of the anomaly: the servant says
      // Wren tried to live this way, and the new ticket suggests he
      // was finally going to commit. That makes the question of why
      // he didn't more urgent.
      4: `The servant nods slowly. "Four have answered, and a few have answered exactly this. Wren did, for a decade — took the ticket, kept the house above the coastline, made the crossing twice a year. The small love was waiting each time. And then one autumn he didn't go. He never went again. He never explained."

She closes the box, but does not lift her hand from it.

"Then last week he bought another ticket."

She tilts the new one toward the candle. The date is eight days ago. Last Wednesday.

"He was going to go back. For the first time in twenty years. He bought the ticket on the Wednesday. He died on the Sunday." She lifts a small key from her dress.

"There is one chamber left. The one waiting for you in it is not what the chambers may have suggested. I should tell you that now. You may keep silent and turn back, even now. Most have. The estate will let you go, and you will inherit nothing, and you will sleep well in the years to come.

"Or you may meet him."`,
    },
    twistClue: `From somewhere below — not above — you hear a chair scrape across a wooden floor. Once. Then nothing. The servant doesn't react. She has, perhaps, been hearing it all night.`,
  },

  // ─── Final chamber — branching reveal ─────────────────────────
  // The body of this scene is computed by the engine using
  // pickEnding(accumulatedVector) + JOURNEY_REVEALS. The coldOpen
  // below is the shared prose every inheritor sees before the
  // archetype-specific recognition + inheritance + ask are spliced
  // in.
  {
    kind: "reveal",
    id: "reveal",
    art: "candle-deathbed",
    eyebrow: "VI · The Last Chamber",
    coldOpen: `You take the key. The metal is colder than you expected. The servant doesn't follow you up.

The door at the end of the upstairs hall is the only one that wasn't closed when you walked the corridor on the way to chamber four. You hadn't noticed at the time. You notice now.

You push it open.

The chamber is small. A single candle on a bedside table. A bed against the far wall.

Someone is in it. Not very old. Older than middle age, but not the gaunt skeleton you had been bracing for. They are sitting up against the pillows, hands folded over the blanket. They are watching you cross the room.

"Wren," they say. Their own name, said like a passcode you have just earned.

You stop.

"You came," they say. "Most of the seven would not. You are the only one tonight. The body the solicitor described to the police this morning is not in this house, and never was. There is no death. I am sorry for the deception. It was required."

A second set of footsteps on the stair behind you. The servant. She has followed after all. She comes in and stands at the foot of the bed. Wren looks at her, then back at you.

"This is Elena. My wife. She has not been dead these thirty-one years. I invented her death because I wanted to disappear, and disappearing from the world is easier if the world believes you have already lost what would have kept you in it. Elena agreed to it. She has been here the whole time. The seven people named in the will tonight — none of them know I exist. You came on a stranger's word."

He lifts one hand. Steady.

"I have something terminal. The doctors gave me a year four months ago. I have perhaps a season. I needed an heir — not to the house; the house is leased — but to four small things I left undone. The chambers were how I chose. Elena watched you in each one. She has told me what you chose. From this I know what kind of person you are.

"And from this I know what I will ask of you."

He looks at you steadily.`,
  },
];

export function chamberCount(): number {
  return JOURNEY_SCENES.filter((s) => s.kind === "chamber").length;
}

// ─── Reveal endings ───────────────────────────────────────────────
//
// One ending per archetype (10 total). Each ending carries:
//   - recognition: Wren names what kind of mind you have
//     (1 paragraph, archetype-specific)
//   - flavorDetails: 1-2 sentence beats keyed by DimKey, spliced
//     between recognition and inheritance based on the user's
//     strongest dimension OUTSIDE the archetype's top-4 cluster.
//     Only the most likely flavor pairings have hand-tuned text;
//     the rest fall through to flavorDetailDefault.
//   - inheritance: the tangible thing Wren leaves you (1-2 paragraphs).
//     Each tied to one of the four chamber anomalies — finding
//     Elena, visiting the daughter, publishing the rival's letter,
//     taking the new steamship ticket — so the ending pays off the
//     mystery, not just the personality test.
//   - ask: what Wren wants from you in return (1 paragraph).
//   - advance: the button text — the action you take to leave the
//     chamber (varies per archetype).

export type RevealEnding = {
  /** Archetype key — must match a key in ARCHETYPE_TARGETS. */
  archetypeKey: string;
  /** "Wren recognizes you as [...]" — the archetype acknowledgement. */
  recognition: string;
  /** Per-flavor mid-paragraph beat. Keyed by DimKey of the flavor
   *  dimension. Falls back to flavorDetailDefault when the picked
   *  flavor has no entry here. */
  flavorDetails: Partial<Record<DimKey, string>>;
  /** Fallback beat for flavor dimensions not in flavorDetails. */
  flavorDetailDefault: string;
  /** What Wren is giving you. */
  inheritance: string;
  /** What Wren is asking of you. */
  ask: string;
  /** Button label for the action that closes the scene. */
  advance: string;
};

export const JOURNEY_REVEALS: Record<string, RevealEnding> = {
  // ─── Cartographer — patient mapper of how things fit ──────────
  // Inheritance: Wren's unpublished manuscript on what one person
  // owes another (Chamber 3 payoff). Ask: read it, find what's
  // wrong, fix it, publish under both names.
  cartographer: {
    archetypeKey: "cartographer",
    recognition: `"You answered like someone who would rather be slow than wrong," he says. "In every chamber. You would not move on a question until you had named what the question actually was. Elena saw it most clearly in the library — you did not take a side on the disagreement, you re-stated it. That is a particular kind of mind. There have been four mappers, in the seven who made it this far across decades. You are the fifth."`,
    flavorDetails: {
      TV: `"And you map knowing the territory is partly grief," he adds. "That the cleanest framework will always leave some real thing out. You came anyway. That is the only kind of cartography worth doing."`,
      CE: `"And you mapped with company in your head," he adds. "Not for yourself. You would hand the legend across a table without flinching. That is the harder kind."`,
      RT: `"And you did not redraw what was drawn well by others before you," he adds. "You sat with the older maps a long time. There is humility in that, and most map-makers your age have not learned it yet."`,
      AT: `"And you took only what you needed into your maps," he adds. "Not palaces. Not edifices nobody will walk in. That restraint is the difference between a useful map and a vanity."`,
      VA: `"And you have not lost the joy of it," he adds. "Most who map for thirty years grow brittle. You haven't yet. Don't."`,
      SR: `"And you brought doubt to the work without being paralysed by it," he adds. "Some mappers wear skepticism like armor and never finish a chart. You will finish. That matters."`,
    },
    flavorDetailDefault: `"And you mapped clean," he adds. "That is rarer than you know."`,
    inheritance: `He lifts his hand toward the bedside table. There is a thick bound manuscript on it. Even from here you can see it has been read many times.

"This is the book the rival and I argued about for thirty years. The book I never published. Six months ago she conceded. I still did not publish. I will tell you why: I am not sure the argument is right. I read it forty-one times. The forty-first time I told Elena it was a different argument than I had thought. I do not know whether I was finally seeing it clearly, or finally losing my nerve. I no longer have the time to know."

He looks at the manuscript.

"It is two hundred pages. The conclusion is unfinished. The middle is correct, I believe. The end may be wrong."`,
    ask: `"Read it. Read it the way you mapped the chambers. Find what is wrong. If anything is wrong. Fix it. Then publish — under your name and mine, or under your name alone if you have rebuilt the argument far enough that mine is no longer in it. The rival is still alive. She will help you. I have written to her, in a sealed envelope on the desk, telling her you will come. Take the envelope. Take the manuscript. Make the book exist."`,
    advance: "Take the manuscript",
  },

  // ─── Keel — what keeps the boat upright in any storm ──────────
  // Inheritance: Wren's correspondence with seven dying friends.
  // Tied loosely to Chamber 2 (letters / tending across years).
  // Ask: keep writing them until they go.
  keel: {
    archetypeKey: "keel",
    recognition: `"You answered with weight in you," he says. "The kind that lets a boat keep pointing forward when the wind argues with it. Elena watched you in the chamber of the daughter — you did not choose what was easiest, you chose what was workable, and you did not pretend the cost wasn't there. That is the Keel's reflex. There have been three of you, across the seven. The fourth of you lived a life I have used as a measure of my own. You will live one like it. I would not have asked otherwise."`,
    flavorDetails: {
      TR: `"And you brought reasons," he adds. "Most keels work by feel. They steady the boat without being able to say why. You can. That makes you slower in calm waters and stronger in long ones."`,
      RT: `"And you hold what was given to you before deciding to set it down," he adds. "Your steadiness reads as patience, not stubbornness. That is what I needed."`,
      CE: `"And you steady more than yourself," he adds. "You stand near other people when they need a steadier nearby. The work I am giving you depends on that almost entirely."`,
      TV: `"And you know the storm is real," he adds. "You do not steady because you trust the weather. You steady because you trust your hands. Good. The hands are the only honest part."`,
      AT: `"And your steadiness costs you," he adds. "You eat less, say less, keep less than you could. People mistake it for severity. It isn't. It is how you stay upright."`,
      SR: `"And you doubt the weather before you trust it," he adds. "You will not be surprised by what the work asks of you. Most keels are. You will know."`,
    },
    flavorDetailDefault: `"And you would do this work even if no one watched," he adds. "Which is the only condition under which this work gets done."`,
    inheritance: `He gestures to a small drawer in the bedside table. "Open it."

You do. Inside: a thin notebook. You lift it out. The pages are filled with names, addresses, dates of birth, and short notes — *Margaret, hip, can't write back the same week. Imre, blind in one eye now, prefers blue ink. Sasha, the postman won't go after dark.*

"Seven correspondents," Wren says. "All elderly. All without family who write to them anymore. I have written to each of them weekly for between four and twenty-two years. None of them know about each other. None of them know I am dying. They are between eighty-two and ninety-six. They have, between them, perhaps two more years."`,
    ask: `"Take over the writing. Start with Margaret — she is the oldest, and the one most likely to notice if a week goes by without a letter. The notebook tells you what to know. You will not need to pretend to be me; tell each of them, in your own first letter, that you are writing on my behalf because I cannot. They will not stop writing back. They never have. When each of them dies, you will know — the letters will stop. Keep writing the rest until they too go. Then it is finished. Two years. Maybe three."`,
    advance: "Take the notebook",
  },

  // ─── Threshold — at the edge of what language can hold ────────
  // Inheritance: Wren asks you to go to Elena's family in town
  // (Chamber 1 payoff — Elena's "death" never recorded). Tell
  // them she is alive. In person, in silence if needed.
  threshold: {
    archetypeKey: "threshold",
    recognition: `"You answered without filling the silences," he says. "More than once. Elena said that even when you spoke, you spoke as if the words were a placeholder for the thing — not the thing itself. That is a Threshold's reflex. I have been there too. So has Elena. So have three of the seven who came across the decades. The work I am giving you will only be done well by someone who can sit at the edge of what cannot be said without flinching, and you can."`,
    flavorDetails: {
      TV: `"And you came knowing what I would say before I said it," he adds. "Without making it your business to know. That is the harder version. The third of you knew that way."`,
      AT: `"And you give up easily what most cling to," he adds. "Words. Gestures. The urge to be understood. The silence holds because you do not keep filling it."`,
      UI: `"And the silence you keep is not selective," he adds. "You would sit with anyone in it, not just those who deserve it. That matters for what I am about to ask."`,
      CE: `"And you sit with others in it, not only with yourself," he adds. "Most threshold-people end up alone in their silence. You won't."`,
      MR: `"And you trust what does not need to be named," he adds. "Without making a religion of it. The third of you was like that. They are why I had the strength to stop trying to explain myself, near the end."`,
      RT: `"And you have inherited a silence rather than invented one," he adds. "There are practices behind your stillness. That makes it sturdier than the kind that comes from temperament alone."`,
    },
    flavorDetailDefault: `"And you will not turn the silence into a performance," he adds. "Which is why I can give you what I am about to give you."`,
    inheritance: `He looks at Elena. She nods, almost invisibly.

"Elena has a sister. The sister lives forty miles from here, in the town where Elena and I were married. The sister has believed Elena was dead for thirty-one years. Elena's mother believed it too, and died believing. The sister is now seventy-eight. She has perhaps a few years.

"We will not write to her. We will not call. Wren is the name on the death notice now, not Elena, but the truth of it" — he looks at his wife — "is that the lie is older. The sister deserves to learn the truth from another person, in a room, with someone who can sit through the long silence that will follow it. We are not the right people. We have spent the lie. You have not."`,
    ask: `"Go to the sister this week. Do not write ahead. Knock at the door. Tell her plainly that Elena is alive and would like to see her, and is sorry for the years. Then sit with the sister. Do not explain. Do not soften it. Do not narrate her own grief back to her. Sit. When she is ready — she will be ready, even if it takes hours — bring Elena to her. The reunion is not yours to manage. The opening is. You are the only one of the seven who could have done it."`,
    advance: "Go find the sister",
  },

  // ─── Pilgrim — walking on, alone, with the question still open
  // Inheritance: the new steamship ticket (Chamber 4 payoff). Ask:
  // go where Wren was going, deliver the news that he is not
  // coming, then keep going past what Wren left undone.
  pilgrim: {
    archetypeKey: "pilgrim",
    recognition: `"You came alone," he says. "Of course you did. Even the ones who arrive in company arrive alone, but you did not pretend otherwise. In every chamber you were the one deciding, and you did not ask Elena's opinion, and you did not look at her after answering to check whether she approved. That is the Pilgrim's reflex. There have been two of you. Both of them walked the rest of their lives the way they walked tonight."`,
    flavorDetails: {
      TV: `"And you walk knowing the road does not lead anywhere certain," he adds. "You aren't moving toward a city. You are moving because not moving is worse. That is what makes pilgrims actually pilgrims."`,
      VA: `"And you have not lost the joy of the road," he adds. "Some pilgrims drift into grimness by the third decade. You won't. There is light in the way you carry the weight."`,
      PO: `"And you do not romanticize the walking," he adds. "You watch the weather. You know which villages have water. You'd rather make it to the next inn than recite a poem about the dust. That is why pilgrims like you actually arrive."`,
      SR: `"And you do not stop to argue with the road," he adds. "You move while the question stays open. Most who try collapse into the question and stop moving. You haven't."`,
      AT: `"And you walk light," he adds. "You do not carry what will not serve. Whatever I give you will not weigh you down. Good."`,
      MR: `"And you walk listening," he adds. "You do not narrate the road back to yourself. Most pilgrims do, by the fifth year. You won't."`,
    },
    flavorDetailDefault: `"And the road is yours," he adds. "Whatever I give you will not slow you. Good."`,
    inheritance: `He looks toward the small table by the door. The wooden box from the upstairs chamber is on it — Elena must have moved it.

"Inside the box is the steamship ticket you found upstairs. Issued last week. I was going. For the first time in twenty years. There is a person waiting at a small white house on a coastline you saw in the photograph. They have been waiting since Wednesday. I was going to tell them, in person, that I was sorry and that I was going to stay. I had decided. Then I got worse faster than my doctors had predicted. I did not get to go."`,
    ask: `"Take the ticket. Take the photograph — there is an address on the back. Make the crossing. When you arrive, tell the person waiting at that house that I am not coming, and that I would have, and that I am sorry. Do not stay long. The crossing is yours, not theirs, and you have your own road to walk after.

"And after that — find the next thing I left undone, somewhere in this house or in the papers Elena will give you. Finish it the way you would walk: light, without ceremony, and on to the next."`,
    advance: "Lace up and go",
  },

  // ─── Touchstone — what's true is what survives the test ───────
  // Inheritance: a sealed box of Wren's unfinished essays. Ask:
  // test them. Keep what survives. Burn what doesn't. The drafts
  // tie obliquely to the library (Chamber 3 — drafts the rival
  // never saw).
  touchstone: {
    archetypeKey: "touchstone",
    recognition: `"You came testing," he says, faintly amused. "Elena noticed it in the third chamber — you didn't just answer, you turned the question over first to see whether it was the question. You asked yourself whether my choice was even the right shape of a choice. That is a Touchstone's reflex. There have been three of you. The third of you saved us from a mistake the second made. The work I am giving you is in that line."`,
    flavorDetails: {
      VA: `"And you did not sour," he adds. "Most testers do. They get good at finding what's wrong and lose the taste for what's right. You haven't. You would still pick up a thing you'd just tested and call it good, if it was."`,
      PO: `"And you test against what actually matters," he adds. "You do not run the assay on distinctions that will not change a single decision. The third of you was like that. They refused to test what they knew they would not act on."`,
      TR: `"And you bring reasons, not only doubts," he adds. "Many skeptics are talented at the *no* and silent on the *what now*. You aren't. You test, you conclude, and you act on the conclusion."`,
      SI: `"And you do not make the tests about yourself," he adds. "You do not need to be the one who is right. That is why your tests are sharper than other skeptics' — you do not soften them to protect a position."`,
      TV: `"And you test knowing you will fail to confirm most of what you had hoped was true," he adds. "You came anyway. That is the harder version."`,
      AT: `"And you take only what survives the test," he adds. "You do not collect what merely interests you. The third of you had a single shelf of books at the end of their life and had tested every one of them. You will be like that."`,
    },
    flavorDetailDefault: `"And you tested without becoming a cynic," he adds. "Which is more than most can do."`,
    inheritance: `He gestures at a low chest at the foot of the bed. "Inside that chest are forty-one drafts. Essays I wrote and never published, on the limits of what one person owes another. None of them are the manuscript in the library — the manuscript is the argument I finished and could not bring myself to ship. These are the arguments I started and could not finish. Some are wrong. Some are wrong in interesting ways. Some, possibly two or three, are right. I do not know which."`,
    ask: `"Test them. Read each one. Test the argument the way you would test any claim — what does it predict, what does it rule out, what does it survive. The ones that survive your test: publish, in any form you can. The ones that don't: burn. Do not be sentimental about my drafts. I was not. The rival's address is in the manuscript, downstairs. She will help you with the borderline cases. She will be honest. She always has been."`,
    advance: "Open the chest",
  },

  // ─── Hearth — where what binds us across generations is kept warm
  // Inheritance: the daughter's letters + the unsent reply. Ask:
  // visit the daughter in person, deliver the letters, stay.
  hearth: {
    archetypeKey: "hearth",
    recognition: `"You answered with others in your head," he says softly. "Not abstractly. Concretely. In the chamber of the letters, when you faced the daughter, you did not reach for a clean principle. You reached for the daughter herself. You wanted to know what she needed. There have been four of you across the seven. The third of you was a Hearth, and they were why the next two of us — Elena and I — chose the work at all. You will do better than I did at this particular task."`,
    flavorDetails: {
      TR: `"And you can say why," he adds. "Not everyone whose heart is in the village can articulate what holds it together. You can. That helps when someone arrives asking to dismantle it."`,
      PO: `"And you do the actual work," he adds. "The visits. The bread. The hard conversations between people who haven't spoken in years. You aren't sentimental. You would cancel a celebration that was not serving anyone."`,
      VA: `"And there is real warmth in your version," he adds. "Not duty alone. You like the people. The third of you liked them too. Most don't, by middle age."`,
      TV: `"And you keep the fire knowing the people will go," he adds. "You don't pretend the warmth lasts. You tend it anyway. That is the only honest version."`,
      SS: `"And you serve without losing yourself," he adds. "You would disagree with the village in a heartbeat if you thought it was wrong. That is the hardest part. Most who tend the hearth get mistaken for those who only defer. You won't be."`,
      UI: `"And the warmth you give is not selective," he adds. "You would have invited the rival to dinner along with the daughter. Most hearth-keepers play favourites. You don't."`,
    },
    flavorDetailDefault: `"And you would be welcomed at any table you walked up to," he adds. "Which is exactly what I need now."`,
    inheritance: `He looks at Elena. She crosses the room and takes a thick bundle from the writing-room shelf — the daughter's letters. All thirty years of them. She brings them and lays them on the blanket.

"My daughter wrote to me for thirty years. Three months ago she wrote and forgave me. I did not write back. I read the letter sitting in the chair you sat in, in the chamber of the writing room, and I had a reply written in my head before I had finished the second sentence. I did not put it on paper. I do not know why. I think I was afraid that she would think I had only written back because I knew I was dying. I think I was right to be afraid of that, and wrong to let it stop me."`,
    ask: `"Visit her. In person. This weekend, if you can. Bring the letters. Bring this one too" — he taps an envelope on the table — "which is the reply I should have written and finally did, last week, the only honest thing I have written in three years. Read it to her, if she will let you. Stay for dinner. Stay through the weekend. Tell her about Elena. Tell her about the chambers. Tell her that the forgiveness she sent six months ago was received, late, by a stranger who came on her father's behalf. She is going to be furious for a while. Sit through that too."`,
    advance: "Take the letters",
  },

  // ─── Forge — what is is not what must be ──────────────────────
  // Inheritance: the manuscript AND the rival's concession letter,
  // together. Ask: publish them as a pair. Make a public stir. Don't
  // be precious about Wren's reluctance.
  forge: {
    archetypeKey: "forge",
    recognition: `"You came to make something," he says. The voice is stronger than the sentence before it suggested. "Elena saw it in the third chamber. You wouldn't yield, but you wouldn't refuse to listen either. You wanted to *change the disagreement*. To make it move. That is a Forger's reflex. The fourth of you came in 1987 and started a press that is still printing. The work I am giving you is a thing I should have made and did not."`,
    flavorDetails: {
      UI: `"And what you would make, you would make for all," he adds. "Not a corner for the people who already do well. The fourth of you wrote: *if the work does not reach the worst-off, then I have not made anything yet*. You answered that way too."`,
      TR: `"And you forge with a plan," he adds. "You do not burn things to see what happens. You ran the chambers like someone who would rather be effective than loud."`,
      CE: `"And you make with others," he adds. "Most forgers think they are the hammer. You understood that the anvil and the iron and the fire are also people. That is what makes the work durable."`,
      VA: `"And there is joy in your forging," he adds. "You are not building from rage. The Hammer's version of this orientation runs on grievance. Yours runs on possibility. They are different metals entirely."`,
      PO: `"And you ask whether what you are making will actually serve," he adds. "That sounds obvious. It is not. Most forgers fall in love with the design before testing whether anyone needs it. You don't."`,
      SR: `"And you forge with doubt at your elbow," he adds. "Not as paralysis. As correction. The fourth of you was like that. They never overshot."`,
    },
    flavorDetailDefault: `"And you would put your name on the cover," he adds. "Without flinching. Which is exactly what this needs."`,
    inheritance: `He looks at the bedside table. The manuscript is there. Beside it, a single sheet of newer paper.

"Two things. The manuscript — the same one downstairs; this is the cleaner copy, marked up. And the rival's concession letter from six months ago, in which she names the argument as mine and authorizes me to publish it under both names or under my own. I have ten years of similar private notes from her, in a folder on the desk, that taken together make a complete public record of her capitulation."`,
    ask: `"Publish all of it. Together. Not quietly. Make a noise. The manuscript IS the argument; the letters are why everyone in the field who matters will have to read the manuscript. Use my name. Use the rival's name with her permission — I have written to ask, and she will say yes; she has already told Elena so. Do not be precious about my reluctance. I lacked the nerve. You have it. The work is more important than my discomfort, and I am about to be past discomfort either way."`,
    advance: "Take the work",
  },

  // ─── Hammer — break what no longer serves ─────────────────────
  // Inheritance: the truth itself — Elena's missing death record
  // (Chamber 1 anomaly). Wren asks the Hammer to expose the lie
  // publicly, correct the registry, make Elena visible again to
  // the world. Force the consequences.
  hammer: {
    archetypeKey: "hammer",
    recognition: `"You came with a no in you," he says. "Elena saw it in the fourth chamber — you would not take the ticket for the ordinary reasons. You were not refusing pleasure, you were refusing the version of yourself that would have used the ticket to escape something you were supposed to face. The third of you was a Hammer. I am not, and I have lived a coward's life as a result. You are not, and you have not, and you won't."`,
    flavorDetails: {
      TV: `"And you know what the refusal costs," he adds. "You do not refuse from a high horse. You refuse from somewhere closer to grief. That is the only Hammer worth being."`,
      SR: `"And you break things you have examined first," he adds. "You do not take a sledge to what you have not understood. Most who carry this hammer skip that part. You haven't."`,
      VA: `"And you have not lost the taste for what is good," he adds. "You would refuse the ordinary life and also know which ordinary lives are luminous. That precision matters for what I am about to ask."`,
      UI: `"And you refuse for everyone," he adds. "The hammer most people swing is selective. Yours is not. You would break a custom that hurt strangers as readily as one that hurt you."`,
      PO: `"And you break with a plan for what comes after," he adds. "You do not leave wreckage and walk away. That is the only kind of Hammer that improves a life."`,
      AT: `"And you take no pleasure in the breaking," he adds. "You do it because it needs doing. That is the precondition for doing it well."`,
    },
    flavorDetailDefault: `"And you would do this even if it cost you what you cannot afford to lose," he adds. "Which is exactly what I am about to ask of you."`,
    inheritance: `He looks at Elena. She holds his gaze a long moment.

"Elena has been dead for thirty-one years according to the county registry. She is not. The registry has been wrong, by my doing, since 1995. I have her marriage certificate, our wedding photographs, the deeds with her name on them, the doctor's letters about an illness she did not have. I have a complete, dated, documented archive of the lie. It is in a leather case on the writing-room shelf. The rival knows. The daughter does not. The sister does not. No one but the rival and Elena knows.

"My death notice this morning was the lever for this. Elena cannot be 'discovered alive' without my fraud also being discovered. While I was alive I would not have permitted the consequences. Now they no longer matter. The rest of you with names in this story do still matter, and you must judge whether they are worth what I am about to ask. I think they are. I am asking you to think so too."`,
    ask: `"Take the archive. Go to the local solicitor in town — Hargreaves; the address is in the case. Correct the registry. Let the consequences fall. The estate may be clawed back; let it be. The pension I drew under false widower status — there were small benefits — repay them from the cash in the writing-room safe. Do not soften any of it. Tell Elena's sister yourself, the same week, in person. Make it impossible for the daughter to hear it from a paper. Do the breaking cleanly. The kind of refusal that is also love. That is what I should have had thirty-one years ago and did not."`,
    advance: "Take the archive",
  },

  // ─── Garden — the good things this life offers, taken seriously
  // Inheritance: the new ticket, the coastal house, the season.
  // Ask: take the life Wren refused. Eat the figs. Send word back.
  garden: {
    archetypeKey: "garden",
    recognition: `"You came with appetite intact," he says, with what might almost be a smile. "In the fourth chamber — most who reach me refuse the ticket out of duty or principle. You did, mostly, but you knew what you were giving up. You named the joy of the smaller love before you refused it. You did not pretend not to want it. That is a Garden's clarity. The third of you were a Garden, and they were the warmest of the seven. You answered the way they would have."`,
    flavorDetails: {
      TE: `"And you trust what you can taste," he adds. "You do not argue with the strawberry. You eat it and notice it is sweeter than last year. The third of us would have liked you immediately."`,
      PO: `"And your noticing is useful," he adds. "You tend what grows. You do not only admire it. The Garden version that drifts into aesthetics alone is the saddest of them. Yours doesn't."`,
      CE: `"And you eat with company," he adds. "You do not tend alone for your own table. The garden you would grow has a long bench beside it."`,
      VA: `"And your joy does not apologize," he adds. "It does not perform itself either. You would eat a peach on a hard day and the eating wouldn't be either denial or defiance. It would just be the peach."`,
      TV: `"And you keep eating knowing it will end," he adds. "The third of us called this *late-summer attention* — the kind of noticing that knows the frost is coming. They thought it was the only kind worth practicing."`,
      SR: `"And you taste with your eyes open," he adds. "You know which figs are worth the eating and which are not. You do not get carried away."`,
    },
    flavorDetailDefault: `"And you would actually use the inheritance," he adds. "Which is the only one I have to give that requires using."`,
    inheritance: `He gestures at the wooden box from upstairs, now on the foot of the bed. "Inside is the new ticket. Last Wednesday's. Coastal house above the small village in the photograph. The house has been waiting for me for twenty years. A small fig tree in the courtyard that I have not eaten from in twelve. A person there I once loved who is still expecting me. I cannot make the crossing. The doctors are clear about that. I would not survive the ferry."`,
    ask: `"Make the crossing in my place. Not to deliver bad news — Elena will send a separate letter ahead so the person there knows I am not coming and why. Make the crossing for yourself. Eat from the tree. Stay the season. The house is leased through the autumn and the lease is yours. Sit on the porch in the late afternoon. Drink the small dark wine from the bottom shelf in the cellar. Send Elena one postcard a month so we know you are eating well. Be the version of this life I never gave myself, and let the trip back be no sooner than September. The world will not collapse without you for three months. It did not collapse without me for the whole twenty years."`,
    advance: "Take the ticket",
  },

  // ─── Lighthouse — the eternal pattern beneath the changing surface
  // Inheritance: thirty years of Wren+rival correspondence. Ask:
  // edit it for publication as a single volume — the argument is
  // the correspondence, not just the manuscript.
  lighthouse: {
    archetypeKey: "lighthouse",
    recognition: `"You came for the pattern," he says. "Elena could tell in the first chamber — when the photograph was offered, you did not reach for the immediate. You reached for what the moment was an instance of. The fifth of you was a Lighthouse. They built nothing visible in their lifetime and they kept things lit for centuries after. So will you, if you choose. The work I am leaving you is the only one in this room that depends on time you may not have but should pretend to."`,
    flavorDetails: {
      MR: `"And you sense the pattern beneath what words can hold," he adds. "You would rather sit with a mystery a long time than name it badly. Your light is steady because it is not running on the burn of having to prove it."`,
      TR: `"And you can say what the pattern is," he adds. "That makes you a teacher as well as a keeper. The third of you couldn't. They saw it; they couldn't speak it. The work suffered for it."`,
      AT: `"And you take little for yourself," he adds. "You live near the light. You do not decorate yourself with what you keep. The fifth of us was like that. Two pairs of shoes and a thousand books, worn evenly."`,
      UI: `"And the light is for everyone who can see it," he adds. "You do not shine selectively. The Lighthouse versions that drift into elite custodianship lose the meaning of the metaphor. Yours hasn't."`,
      TV: `"And you tend it knowing the boats may not arrive," he adds. "Some never will. You tend it anyway. That is the only honest kind of keeping."`,
      PO: `"And you maintain the light, you do not only revere it," he adds. "Practical attention is the difference between a lit lighthouse and a museum about one."`,
    },
    flavorDetailDefault: `"And you would maintain a light for a hundred years if it served," he adds. "Which is what I am about to ask of you in miniature."`,
    inheritance: `He looks at the bookshelves opposite the bed. "Three shelves. The middle three. Thirty years of letters between me and the rival. Some are arguments, some are gossip about other philosophers, some are the small daily texture of two minds in a long disagreement — what we ate the night we wrote, what we were reading, the weather. The manuscript is the argument we had at the surface. The letters are the argument that produced the manuscript, and the parts of it neither of us was clever enough to fit into a book."`,
    ask: `"Edit the letters into a single volume. Mine and hers, in order, with light annotation. Do not over-introduce them. Do not write a long preface explaining what you are about to show. Let the correspondence speak. The rival will help — she has been waiting for this; she told Elena last spring she had given up on me doing it myself. The volume will not sell. It will be read by perhaps two hundred people over the next century, and a small number of those will use it to do their own better work. That is the entire point. You are not building a monument. You are keeping a lamp lit for boats that may take fifty years to arrive."`,
    advance: "Take the first letter",
  },
};

// ─── Ending picker ────────────────────────────────────────────────
// Returns the archetype key + flavor dimension (or null when the
// user's vector has no signal outside the archetype's defining
// cluster). Matches the algorithm /result uses so the deceased
// recognizes the same archetype the user sees on the results page.

export function pickEnding(vector: number[]): {
  archetypeKey: string;
  flavor: DimKey | null;
} {
  // Cosine-sim against each archetype target prototype; pick the
  // closest. Identical to app/result/page.tsx so the two surfaces
  // agree on which archetype the user is.
  const scored = ARCHETYPE_TARGETS.map((target) => {
    const prototype = expandArchetypeVector(target);
    return { key: target.key, prototype, sim: cos(vector, prototype) };
  }).sort((a, b) => b.sim - a.sim);

  const top = scored[0] ?? { key: "cartographer", prototype: zeros(), sim: 0 };

  // Flavor dimension: the user's strongest dim that is NOT in the
  // archetype's top-4 defining cluster. Mirrors computeFlavor in
  // lib/vectors.ts but returns the DimKey directly (rather than the
  // adjective string) so we can index flavorDetails[DimKey].
  const archTopKeys = top.prototype
    .map((val, i) => ({ k: DIM_KEYS[i], v: val }))
    .sort((a, b) => b.v - a.v)
    .slice(0, 4)
    .map((x) => x.k);
  const userTopOutside = vector
    .map((val, i) => ({ k: DIM_KEYS[i], v: val }))
    .filter((x) => !archTopKeys.includes(x.k))
    .sort((a, b) => b.v - a.v);
  const flavor: DimKey | null =
    userTopOutside.length && userTopOutside[0].v > 0
      ? userTopOutside[0].k
      : null;

  return { archetypeKey: top.key, flavor };
}
