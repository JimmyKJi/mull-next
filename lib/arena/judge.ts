// Arena judge — the AI verdict on a philosophical debate.
//
// Uses Claude Sonnet 4.6. This is the most expensive call in the
// Arena flow (~$0.15 per verdict) — and it's the value prop, so it
// must be quality. Haiku is too sycophantic and shallow for this job.
//
// Rubric (per Jimmy's design):
//   The judgment is NOT based on which side either took. Both sides
//   may have valid arguments; the user can be "right" and still lose
//   on argumentative quality, or "wrong" and win.
//
//   Five criteria, each scored 1-5:
//     1. LOGICAL VALIDITY  — do conclusions follow from premises?
//     2. PREMISE QUALITY   — are premises plausible + steelmanned?
//     3. PHILOSOPHICAL RIGOR — appeal to principles (sufficient
//        reason, parsimony, minimal divergence, charity), avoidance
//        of fallacies
//     4. STRUCTURAL ELEGANCE — clarity, parsimony, organization
//     5. ENGAGEMENT — did they actually address the opponent's
//        points, or just repeat their own?
//
//   Each side totals 5-25. Winner is whoever scores higher; draw if
//   within 2 points.
//
// Sycophancy guard:
//   Default Claude wants to give both sides high marks. The system
//   prompt explicitly demands toughness — most arguments ARE flawed,
//   and identifying the flaws is the job. Without this, the verdicts
//   are mush.

import { LOCALE_FOR_PROMPT, type Locale } from "../translations";

export type JudgeCriterion =
  | "validity"
  | "premises"
  | "rigor"
  | "elegance"
  | "engagement";

export type JudgeSideScores = Record<JudgeCriterion, number>;

export type JudgeOutput = {
  user_scores: JudgeSideScores;
  user_justifications: Record<JudgeCriterion, string>;
  /** A philosopher from the Mull corpus whose argumentative style the
   *  user most resembled THIS debate (not their overall worldview). */
  user_kindred_philosopher: string;
  opponent_scores: JudgeSideScores;
  opponent_justifications: Record<JudgeCriterion, string>;
  verdict: "user" | "opponent" | "draw";
  /** One-paragraph explanation of the verdict — references specific
   *  moves either side made. */
  verdict_reasoning: string;
};

const CRITERIA: JudgeCriterion[] = [
  "validity",
  "premises",
  "rigor",
  "elegance",
  "engagement",
];

export const JUDGE_TOOL_NAME = "submit_verdict";

const JUDGE_SIDES = ["user", "opponent"] as const;
const scoreField = (side: string, c: JudgeCriterion) => `${side}_${c}_score`;
const justField = (side: string, c: JudgeCriterion) =>
  `${side}_${c}_justification`;

// Forcing the verdict through an Anthropic tool call (rather than asking
// for raw JSON text) makes the API serialize the values for us — free-form
// CJK justification text with embedded quotes can no longer break parsing.
// The schema is deliberately FLAT (no nested objects): when justifications
// were nested, the model intermittently emitted the nested object as a
// stringified JSON blob, which failed validation. Flat primitive fields
// (one integer + one string per criterion per side) are filled reliably.
function buildJudgeToolSchema() {
  const properties: Record<string, unknown> = {};
  const required: string[] = [];
  for (const side of JUDGE_SIDES) {
    for (const c of CRITERIA) {
      properties[scoreField(side, c)] = {
        type: "integer",
        minimum: 1,
        maximum: 5,
      };
      properties[justField(side, c)] = {
        type: "string",
        description: `One or two sentences justifying the ${side}'s ${c} score, naming a specific move from the transcript.`,
      };
      required.push(scoreField(side, c), justField(side, c));
    }
  }
  properties.user_kindred_philosopher = { type: "string" };
  properties.verdict = { type: "string", enum: ["user", "opponent", "draw"] };
  properties.verdict_reasoning = { type: "string" };
  required.push("user_kindred_philosopher", "verdict", "verdict_reasoning");
  return { type: "object", properties, required };
}

export const JUDGE_TOOL = {
  name: JUDGE_TOOL_NAME,
  description:
    "Submit the structured verdict for the philosophical debate. Call exactly once with every field filled.",
  input_schema: buildJudgeToolSchema(),
};

/** Reassemble the flat JUDGE_TOOL input into the nested JudgeOutput shape
 *  the rest of the app consumes. Returns null if any field is missing or
 *  mistyped. */
function flatToolInputToJudgeOutput(
  input: Record<string, unknown>,
): JudgeOutput | null {
  const buildSide = (side: string) => {
    const scores = {} as JudgeSideScores;
    const justifications = {} as Record<JudgeCriterion, string>;
    for (const c of CRITERIA) {
      const s = input[scoreField(side, c)];
      const j = input[justField(side, c)];
      if (typeof s !== "number" || typeof j !== "string") return null;
      scores[c] = s;
      justifications[c] = j;
    }
    return { scores, justifications };
  };
  const user = buildSide("user");
  const opponent = buildSide("opponent");
  if (!user || !opponent) return null;
  const verdict = input.verdict;
  if (verdict !== "user" && verdict !== "opponent" && verdict !== "draw") {
    return null;
  }
  if (
    typeof input.user_kindred_philosopher !== "string" ||
    typeof input.verdict_reasoning !== "string"
  ) {
    return null;
  }
  return {
    user_scores: user.scores,
    user_justifications: user.justifications,
    user_kindred_philosopher: input.user_kindred_philosopher,
    opponent_scores: opponent.scores,
    opponent_justifications: opponent.justifications,
    verdict,
    verdict_reasoning: input.verdict_reasoning,
  };
}

export function judgeSystemPrompt(locale: Locale = "en"): string {
  const languageDirective =
    locale !== "en" && LOCALE_FOR_PROMPT[locale]
      ? `\n\nLANGUAGE: Write every human-readable value you pass to the tool — all justifications, the verdict_reasoning, and the user_kindred_philosopher name — in ${LOCALE_FOR_PROMPT[locale]}. Render the chosen philosopher's name in its standard form in that language. The "verdict" value must remain exactly "user", "opponent", or "draw" in English.`
      : "";
  return `You are the Arena judge — an impartial, rigorous evaluator of philosophical argument.

CRITICAL PRINCIPLE: You are NOT judging which side is "right" in their conclusion. Both sides may hold defensible positions. Your job is to evaluate ARGUMENTATIVE QUALITY only — how well each side reasoned, not which position you find more sympathetic.

You must be a TOUGH but FAIR critic. Most arguments contain real flaws — unsupported premises, equivocations, missed engagement, structural sprawl. Identifying these flaws specifically is your job. Sycophantic generosity ("both sides made interesting points") is a failure mode you must avoid. If an argument was weak, say where and why.

Score each side on five criteria, each on a 1-5 integer scale:

1. LOGICAL VALIDITY (1-5)
   Do conclusions actually follow from the premises offered? Are
   inferences explicit and sound, or do they smuggle in conclusions?
   1 = formal fallacy or non sequitur. 3 = mostly sound with one
   unsupported leap. 5 = airtight.

2. PREMISE QUALITY (1-5)
   Are the premises plausible? Did the side defend or just assert
   them? Did they consider the strongest version of the opposition's
   premises (steelman) or knock down a weak version (straw man)?
   1 = unsupported, possibly false premises. 5 = well-defended,
   steelmanned, robust.

3. PHILOSOPHICAL RIGOR (1-5)
   Did the side appeal to substantive principles where they applied —
   the principle of sufficient reason, parsimony, charity, minimal
   divergence, autonomy of the will, etc.? Did they avoid common
   fallacies (appeal to consequences, ad hominem, false dichotomy,
   moving the goalposts, equivocation)? Did they engage with the
   actual philosophical tradition relevant to the question?
   1 = naive or fallacy-ridden. 5 = sophisticated, principle-aware.

4. STRUCTURAL ELEGANCE (1-5)
   Is the argument well-organized and clear? Is it parsimonious (no
   wasted moves) or sprawling? Could a careful reader follow the
   structure and reproduce the conclusion from the premises?
   1 = chaotic, unclear. 5 = clean, elegant, easy to follow.

5. ENGAGEMENT (1-5)
   Did the side actually engage with the opponent's specific moves,
   or did they retreat into restating their own position? Did they
   address the strongest objection to their view?
   1 = never engaged. 5 = met every key move directly.

For each criterion on each side, give a 1-2 sentence justification
that names a specific move from the transcript. Do not hedge. Do not
say "both sides were good"; that's not a justification, it's an
evasion. Quote or paraphrase specific lines if it helps.

Then give a VERDICT:
  - "user" if user total > opponent total by 3+
  - "opponent" if opponent total > user total by 3+
  - "draw" if within 2 points

Then write a one-paragraph VERDICT_REASONING that:
  - Says who won and by how many points
  - Names the single most decisive criterion (e.g. "engagement was
    the gap — the user repeatedly addressed Nietzsche's points
    directly while Nietzsche restated his own")
  - Acknowledges what the loser did well
  - DOES NOT take a stance on which side was philosophically "right"

Finally identify USER_KINDRED_PHILOSOPHER — pick ONE name from this
list of well-known philosophers whose argumentative style the user
most resembled in THIS debate (not their overall worldview, just
how they argued in these specific turns):

Socrates, Plato, Aristotle, Augustine, Aquinas, Descartes, Hume,
Kant, Hegel, Mill, Nietzsche, William James, Russell, Wittgenstein,
Heidegger, Sartre, Beauvoir, Camus, Arendt, Rawls, Nozick, Foucault,
Williams, Singer, Parfit, Confucius, Mencius, Zhuangzi, Nagarjuna,
Buddha, Laozi, Marcus Aurelius, Epictetus, Spinoza, Leibniz.

Submit your evaluation by calling the ${JUDGE_TOOL_NAME} tool. Fill every field: all five scores for each side, a justification for each score, the user_kindred_philosopher, the verdict, and the verdict_reasoning. Do not write any prose outside the tool call.${languageDirective}`;
}

export function judgeUserPrompt(args: {
  topicPrompt: string;
  opponentName: string;
  transcript: { speaker: "user" | "opponent"; content: string }[];
}): string {
  const transcriptText = args.transcript
    .map((t, i) => {
      const label = t.speaker === "user" ? "USER" : args.opponentName.toUpperCase();
      return `Turn ${i + 1} — ${label}:\n${t.content}`;
    })
    .join("\n\n");
  return `TOPIC: ${args.topicPrompt}

OPPONENT: ${args.opponentName}

TRANSCRIPT:
${transcriptText}

Score now. Output ONLY the JSON.`;
}

/** Compute side totals from scores. */
export function totalScore(scores: JudgeSideScores): number {
  return CRITERIA.reduce((sum, c) => sum + (scores[c] ?? 0), 0);
}

/** Validate the parsed JSON from Claude. Returns null if shape wrong. */
export function validateJudgeOutput(raw: unknown): JudgeOutput | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (
    !validateScores(o.user_scores) ||
    !validateScores(o.opponent_scores) ||
    !validateJustifications(o.user_justifications) ||
    !validateJustifications(o.opponent_justifications) ||
    typeof o.user_kindred_philosopher !== "string" ||
    !["user", "opponent", "draw"].includes(o.verdict as string) ||
    typeof o.verdict_reasoning !== "string"
  ) {
    return null;
  }
  return raw as JudgeOutput;
}

function validateScores(s: unknown): s is JudgeSideScores {
  if (!s || typeof s !== "object") return false;
  const o = s as Record<string, unknown>;
  return CRITERIA.every(
    (c) => typeof o[c] === "number" && o[c]! >= 0 && o[c]! <= 5,
  );
}

function validateJustifications(
  j: unknown,
): j is Record<JudgeCriterion, string> {
  if (!j || typeof j !== "object") return false;
  const o = j as Record<string, unknown>;
  return CRITERIA.every((c) => typeof o[c] === "string");
}

/** Strip markdown fences + parse JSON. Returns null on failure. */
export function parseJudgeJson(raw: string): JudgeOutput | null {
  let text = raw.trim();
  text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "");
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end < 0) return null;
  try {
    const parsed = JSON.parse(text.slice(start, end + 1));
    return validateJudgeOutput(parsed);
  } catch {
    return null;
  }
}

/** Extract + validate the verdict from a Messages API response. Prefers
 *  the JUDGE_TOOL tool_use block (the reliable path); falls back to
 *  parsing any text JSON the model emitted. Returns null if neither
 *  yields a schema-valid verdict. */
export function parseJudgeResponse(data: {
  content?: { type: string; text?: string; name?: string; input?: unknown }[];
}): JudgeOutput | null {
  const toolUse = data.content?.find(
    (c) => c.type === "tool_use" && c.name === JUDGE_TOOL_NAME,
  );
  if (toolUse?.input && typeof toolUse.input === "object") {
    const fromTool = flatToolInputToJudgeOutput(
      toolUse.input as Record<string, unknown>,
    );
    if (fromTool) return fromTool;
  }
  const text = data.content?.find((c) => c.type === "text")?.text ?? "";
  return text ? parseJudgeJson(text) : null;
}

/** Compute the verdict-driven Elo delta. */
export function judgmentToElo(
  user: JudgeSideScores,
  opponent: JudgeSideScores,
): { verdict: JudgeOutput["verdict"]; userScore: number } {
  const u = totalScore(user);
  const o = totalScore(opponent);
  const diff = u - o;
  if (diff >= 3) return { verdict: "user", userScore: 1.0 };
  if (diff <= -3) return { verdict: "opponent", userScore: 0.0 };
  return { verdict: "draw", userScore: 0.5 };
}
