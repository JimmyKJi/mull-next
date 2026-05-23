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

export function judgeSystemPrompt(): string {
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

Output ONLY valid JSON matching this exact schema, no preamble:
{
  "user_scores": { "validity": N, "premises": N, "rigor": N, "elegance": N, "engagement": N },
  "user_justifications": { "validity": "...", "premises": "...", "rigor": "...", "elegance": "...", "engagement": "..." },
  "user_kindred_philosopher": "Name",
  "opponent_scores": { "validity": N, "premises": N, "rigor": N, "elegance": N, "engagement": N },
  "opponent_justifications": { "validity": "...", "premises": "...", "rigor": "...", "elegance": "...", "engagement": "..." },
  "verdict": "user" | "opponent" | "draw",
  "verdict_reasoning": "..."
}`;
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
