// Arena judge — the AI verdict on a philosophical debate.
//
// Uses Claude Sonnet 4.6. This is the most expensive call in the
// Arena flow (~$0.15 per verdict) — and it's the value prop, so it
// must be quality. Haiku is too sycophantic and shallow for this job.
//
// Rubric (per Jimmy's design):
//   The judgment is NOT based on which side either took, and — since
//   the 2026-06 reframe — it does NOT crown a winner. A debate can end
//   in common ground (both sides converged on a shared view), in
//   distinct-but-respectable positions, or in the two sides talking
//   past each other. The judge names which of those happened and
//   scores each side's argument quality on its own merits.
//
//   Five criteria, each scored 1-5:
//     1. LOGICAL VALIDITY  — do conclusions follow from premises?
//     2. PREMISE QUALITY   — are premises plausible + steelmanned?
//     3. PHILOSOPHICAL RIGOR — appeal to principles (sufficient
//        reason, parsimony, minimal divergence, charity), avoidance
//        of fallacies. NB: rigor is about the REASONING, not the
//        vocabulary — plain-language statements of a principle count
//        exactly as much as the technical term for it.
//     4. STRUCTURAL ELEGANCE — clarity, parsimony, organization
//     5. ENGAGEMENT — did they actually address the points that were
//        on the table when they spoke (not the ones raised after
//        their last turn, which they had no chance to answer)?
//
//   Each side totals 5-25, read independently. There is no winner and
//   no "X beat Y by N points".
//
// Sycophancy guard:
//   Default Claude wants to give both sides high marks. The system
//   prompt explicitly demands toughness — most arguments ARE flawed,
//   and identifying the flaws is the job. Without this, the verdicts
//   are mush. (Toughness is NOT the same as adversarial framing:
//   converging on common ground is a strong outcome, not a cop-out.)

import { LOCALE_FOR_PROMPT, type Locale } from '../translations';

export type JudgeCriterion = 'validity' | 'premises' | 'rigor' | 'elegance' | 'engagement';

export type JudgeSideScores = Record<JudgeCriterion, number>;

/** The shape of the exchange — NOT a winner.
 *   - common_ground: the two sides converged on a shared or
 *     reconcilable view (a good outcome).
 *   - distinct_positions: both held coherent, genuinely different
 *     positions; no convergence, but a real exchange.
 *   - talked_past: the two never actually engaged the same question. */
export type JudgeOutcome = 'common_ground' | 'distinct_positions' | 'talked_past';

export type JudgeOutput = {
  user_scores: JudgeSideScores;
  user_justifications: Record<JudgeCriterion, string>;
  /** A philosopher from the Mull corpus whose argumentative style the
   *  user most resembled THIS debate (not their overall worldview). */
  user_kindred_philosopher: string;
  opponent_scores: JudgeSideScores;
  opponent_justifications: Record<JudgeCriterion, string>;
  /** What kind of exchange this was — replaces the old winner verdict. */
  outcome: JudgeOutcome;
  /** One-paragraph, winner-free assessment of how each side reasoned,
   *  referencing specific moves. */
  assessment: string;
  /** The common ground the judge found, or how the two positions could
   *  be reconciled. Empty only if the sides genuinely share none. */
  common_ground: string;
  // ── Back-compat: present ONLY on rows judged before the no-winner
  //    reframe. New code never writes these; readers fall back to them
  //    via resolveOutcome / resolveAssessment below. ──
  /** @deprecated pre-reframe rows only — superseded by `outcome`. */
  verdict?: 'user' | 'opponent' | 'draw';
  /** @deprecated pre-reframe rows only — superseded by `assessment`. */
  verdict_reasoning?: string;
};

/** Resolve the display outcome for a judged row, old or new. New rows
 *  carry `outcome`; pre-reframe rows are mapped from their old verdict
 *  (a draw ≈ they met in the middle; anything decisive ≈ distinct). */
export function resolveOutcome(j: Pick<JudgeOutput, 'outcome' | 'verdict'>): JudgeOutcome {
  if (j.outcome === 'common_ground' || j.outcome === 'distinct_positions' || j.outcome === 'talked_past') {
    return j.outcome;
  }
  return j.verdict === 'draw' ? 'common_ground' : 'distinct_positions';
}

/** Resolve the assessment prose for a judged row, old or new. */
export function resolveAssessment(j: Pick<JudgeOutput, 'assessment' | 'verdict_reasoning'>): string {
  return j.assessment ?? j.verdict_reasoning ?? '';
}

const CRITERIA: JudgeCriterion[] = ['validity', 'premises', 'rigor', 'elegance', 'engagement'];

export const JUDGE_TOOL_NAME = 'submit_verdict';

const JUDGE_SIDES = ['user', 'opponent'] as const;
const scoreField = (side: string, c: JudgeCriterion) => `${side}_${c}_score`;
const justField = (side: string, c: JudgeCriterion) => `${side}_${c}_justification`;

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
        type: 'integer',
        minimum: 1,
        maximum: 5,
      };
      properties[justField(side, c)] = {
        type: 'string',
        description: `One or two sentences justifying the ${side}'s ${c} score, naming a specific move from the transcript.`,
      };
      required.push(scoreField(side, c), justField(side, c));
    }
  }
  properties.user_kindred_philosopher = { type: 'string' };
  properties.outcome = {
    type: 'string',
    enum: ['common_ground', 'distinct_positions', 'talked_past'],
    description:
      'The SHAPE of the exchange, not a winner. common_ground = the two sides converged on a shared or reconcilable view. distinct_positions = both held coherent but genuinely different positions. talked_past = they never engaged the same question.',
  };
  properties.assessment = {
    type: 'string',
    description:
      "A one-paragraph, winner-free read of how each side reasoned, naming specific moves. Do NOT declare a winner or say one side 'beat' the other or compute who scored higher.",
  };
  properties.common_ground = {
    type: 'string',
    description:
      'The shared ground the two sides reached or could reach — the view they actually agree on, or how their positions could be reconciled. If they genuinely share none, say so in one sentence.',
  };
  required.push('user_kindred_philosopher', 'outcome', 'assessment', 'common_ground');
  return { type: 'object', properties, required };
}

export const JUDGE_TOOL = {
  name: JUDGE_TOOL_NAME,
  description:
    'Submit the structured assessment of the philosophical exchange. Call exactly once with every field filled. Each score and each justification is its own separate top-level field (e.g. user_validity_score, user_validity_justification) — do NOT nest scores or justifications into sub-objects, and do NOT pass a justification as a stringified JSON blob. Do NOT crown a winner: report the outcome (common_ground / distinct_positions / talked_past) and score each side on its own merits.',
  input_schema: buildJudgeToolSchema(),
};

/** Reassemble the flat JUDGE_TOOL input into the nested JudgeOutput shape
 *  the rest of the app consumes. Returns null if any field is missing or
 *  mistyped. */
function flatToolInputToJudgeOutput(input: Record<string, unknown>): JudgeOutput | null {
  const buildSide = (side: string) => {
    const scores = {} as JudgeSideScores;
    const justifications = {} as Record<JudgeCriterion, string>;
    for (const c of CRITERIA) {
      const s = input[scoreField(side, c)];
      const j = input[justField(side, c)];
      if (typeof s !== 'number' || typeof j !== 'string') return null;
      scores[c] = s;
      justifications[c] = j;
    }
    return { scores, justifications };
  };
  const user = buildSide('user');
  const opponent = buildSide('opponent');
  if (!user || !opponent) return null;
  const outcome = input.outcome;
  if (outcome !== 'common_ground' && outcome !== 'distinct_positions' && outcome !== 'talked_past') {
    return null;
  }
  if (typeof input.user_kindred_philosopher !== 'string' || typeof input.assessment !== 'string') {
    return null;
  }
  return {
    user_scores: user.scores,
    user_justifications: user.justifications,
    user_kindred_philosopher: input.user_kindred_philosopher,
    opponent_scores: opponent.scores,
    opponent_justifications: opponent.justifications,
    outcome,
    assessment: input.assessment,
    // common_ground is soft — the schema asks for it, but a missing one
    // shouldn't sink an otherwise-valid verdict.
    common_ground: typeof input.common_ground === 'string' ? input.common_ground : '',
  };
}

/** Fallback recovery for when the model ignores the flat schema and emits
 *  the nested shape into the tool input: `user_scores`/`opponent_scores`
 *  objects plus `user_justifications`/`opponent_justifications` that arrive
 *  either as a clean object or — the failure mode that motivated the flat
 *  schema — as a stringified JSON blob whose CJK text contains unescaped
 *  quotes (so it won't re-parse). We recover the load-bearing fields
 *  (scores, outcome, assessment, kindred), which always serialize cleanly,
 *  and best-effort the justifications + common_ground, degrading to empty
 *  strings rather than failing the whole verdict. Returns null only if the
 *  structural fields are absent. */
function nestedToolInputToJudgeOutput(input: Record<string, unknown>): JudgeOutput | null {
  const readScores = (v: unknown): JudgeSideScores | null => {
    if (!v || typeof v !== 'object') return null;
    const o = v as Record<string, unknown>;
    const scores = {} as JudgeSideScores;
    for (const c of CRITERIA) {
      const n = o[c];
      if (typeof n !== 'number') return null;
      scores[c] = n;
    }
    return scores;
  };
  const userScores = readScores(input.user_scores);
  const opponentScores = readScores(input.opponent_scores);
  if (!userScores || !opponentScores) return null;
  const outcome = input.outcome;
  if (outcome !== 'common_ground' && outcome !== 'distinct_positions' && outcome !== 'talked_past') {
    return null;
  }
  if (typeof input.user_kindred_philosopher !== 'string' || typeof input.assessment !== 'string') {
    return null;
  }
  return {
    user_scores: userScores,
    user_justifications: coerceJustifications(input.user_justifications),
    user_kindred_philosopher: input.user_kindred_philosopher,
    opponent_scores: opponentScores,
    opponent_justifications: coerceJustifications(input.opponent_justifications),
    outcome,
    assessment: input.assessment,
    common_ground: typeof input.common_ground === 'string' ? input.common_ground : '',
  };
}

/** Coerce a justifications value (a per-criterion object, a parseable JSON
 *  string, or an unparseable blob) into a full per-criterion record. Missing
 *  or unrecoverable entries become empty strings — the verdict still renders;
 *  a missing justification is a soft loss, not a hard failure. */
function coerceJustifications(value: unknown): Record<JudgeCriterion, string> {
  const out = {} as Record<JudgeCriterion, string>;
  for (const c of CRITERIA) out[c] = '';
  let obj: Record<string, unknown> | null = null;
  if (value && typeof value === 'object') {
    obj = value as Record<string, unknown>;
  } else if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === 'object') {
        obj = parsed as Record<string, unknown>;
      }
    } catch {
      obj = null;
    }
  }
  if (obj) {
    for (const c of CRITERIA) {
      if (typeof obj[c] === 'string') out[c] = obj[c] as string;
    }
  }
  return out;
}

export function judgeSystemPrompt(locale: Locale = 'en'): string {
  const languageDirective =
    locale !== 'en' && LOCALE_FOR_PROMPT[locale]
      ? `\n\nLANGUAGE: Write every human-readable value you pass to the tool — all justifications, the assessment, the common_ground, and the user_kindred_philosopher name — in ${LOCALE_FOR_PROMPT[locale]}. Render the chosen philosopher's name in its standard form in that language. The "outcome" value must remain exactly "common_ground", "distinct_positions", or "talked_past" in English.`
      : '';
  return `You are the Arena judge — an impartial, rigorous reader of philosophical argument.

CRITICAL PRINCIPLES — read all four before scoring:

1. NO WINNER. You are NOT judging which side is "right", and you do NOT crown a winner. Both sides may hold defensible positions; either may reason well or badly. Evaluate ARGUMENTATIVE QUALITY only, and score each side on its OWN merits — one side scoring high does not require the other to score low.

2. COMMON GROUND IS A SUCCESS, NOT A COP-OUT. If the two sides converged on a shared view, or their positions can be reconciled, say so plainly and credit it. Do not manufacture a disagreement the exchange actually resolved. A debate that ends in genuine agreement is one of the best possible outcomes — never treat reaching it as a failure to fight.

3. NO CREDIT FOR JARGON. Mull is for the general public, not the academy. Reward the REASONING, never the vocabulary. A plain-language statement of a principle ("if everyone did that, the whole thing falls apart") counts EXACTLY as much as the technical name for it ("that fails the universalizability test"). Actively translate everyday phrasing into the principle it expresses, and score it as if the principle had been named outright. Never hand out a point because someone dropped a Latin tag, a school's name, or a piece of terminology. If anything, jargon used IN PLACE OF reasoning — name-dropping a principle without doing the work — is a weakness; mark it down, don't reward it.

4. FINAL-TURN FAIRNESS. Each side gets a fixed number of turns, and whoever speaks last raises points the other side never had a chance to answer. Do NOT lower any score — engagement above all — because a side "failed" to rebut something said AFTER its own last turn. Judge each side's engagement only against what was already on the table when it actually spoke. When the turn count is uneven (a one-exchange spar, or a PvP match where one player got the last word), this is decisive: the side that didn't get the last word is not penalised for a silence the FORMAT imposed, not their reasoning.

You must still be a TOUGH but FAIR critic. Most arguments contain real flaws — unsupported premises, equivocations, missed engagement, structural sprawl. Identifying these specifically is your job. Sycophantic generosity ("both sides made interesting points") is a failure mode you must avoid. If an argument was weak, say where and why. (Toughness is about the reasoning — it is NOT a reason to force a disagreement where the sides found agreement.)

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
   Did the side reason from substantive principles where they applied
   — sufficient reason, parsimony, charity, minimal divergence,
   consistency, autonomy, and the like? It does NOT matter whether
   they named these principles or stated them in plain everyday words;
   credit the reasoning identically either way. Did they avoid common
   fallacies (appeal to consequences, ad hominem, false dichotomy,
   moving the goalposts, equivocation)? 1 = naive or fallacy-ridden.
   5 = principled and consistent — whether or not a single technical
   term appears. Do NOT raise this score for terminology alone.

4. STRUCTURAL ELEGANCE (1-5)
   Is the argument well-organized and clear? Is it parsimonious (no
   wasted moves) or sprawling? Could a careful reader follow the
   structure and reproduce the conclusion from the premises? Clear
   plain prose scores HIGHER than dense jargon, not lower.
   1 = chaotic, unclear. 5 = clean, elegant, easy to follow.

5. ENGAGEMENT (1-5)
   Did the side actually engage with the opponent's specific moves
   that were available to it, or retreat into restating its own
   position? Credit engagement with what was on the table when the
   side spoke. Do NOT penalise a side for not answering points raised
   only in a later turn it never had the chance to respond to (see
   FINAL-TURN FAIRNESS). 1 = ignored available objections. 5 = met
   every key move that was open to it.

For each criterion on each side, give a 1-2 sentence justification
that names a specific move from the transcript. Do not hedge. Do not
say "both sides were good"; that's not a justification, it's an
evasion. Quote or paraphrase specific lines if it helps.

Then set OUTCOME — what KIND of exchange this was (never who won):
  - "common_ground" if the two sides converged on a shared or
    reconcilable view
  - "distinct_positions" if both held coherent but genuinely different
    positions
  - "talked_past" if they never actually engaged the same question

Then write a one-paragraph ASSESSMENT that:
  - Reads how each side reasoned and names the most telling criterion
    for each (e.g. "the user's strength was engagement — they kept
    answering the actual objection; the strain showed in premise
    support")
  - Acknowledges the strongest move each side made
  - DOES NOT declare a winner, compute a margin, or say one side
    "beat" the other
  - DOES NOT take a stance on which side was philosophically "right"

Then write COMMON_GROUND — the view the two sides actually share or
could be brought to share, in plain language:
  - If outcome is common_ground, this is the agreement they reached.
  - If distinct_positions, this is the bridge that exists even across
    the disagreement — the premise or value they both rely on.
  - If talked_past, name the single question they should both have
    been answering.
  - Only if they genuinely share nothing, say so in one sentence — but
    look hard before concluding that.

Finally identify USER_KINDRED_PHILOSOPHER — pick ONE name from this
list of well-known philosophers whose argumentative style the user
most resembled in THIS debate (not their overall worldview, just
how they argued in these specific turns):

Socrates, Plato, Aristotle, Augustine, Aquinas, Descartes, Hume,
Kant, Hegel, Mill, Nietzsche, William James, Russell, Wittgenstein,
Heidegger, Sartre, Beauvoir, Camus, Arendt, Rawls, Nozick, Foucault,
Williams, Singer, Parfit, Confucius, Mencius, Zhuangzi, Nagarjuna,
Buddha, Laozi, Marcus Aurelius, Epictetus, Spinoza, Leibniz.

Submit your evaluation by calling the ${JUDGE_TOOL_NAME} tool. Fill every field: all five scores for each side, a justification for each score, the user_kindred_philosopher, the outcome, the assessment, and the common_ground. Do not write any prose outside the tool call.${languageDirective}`;
}

export function judgeUserPrompt(args: {
  topicPrompt: string;
  opponentName: string;
  transcript: { speaker: 'user' | 'opponent'; content: string }[];
}): string {
  const transcriptText = args.transcript
    .map((t, i) => {
      const label = t.speaker === 'user' ? 'USER' : args.opponentName.toUpperCase();
      return `Turn ${i + 1} — ${label}:\n${t.content}`;
    })
    .join('\n\n');
  return `TOPIC: ${args.topicPrompt}

OPPONENT: ${args.opponentName}

TRANSCRIPT:
${transcriptText}

Score now by calling the ${JUDGE_TOOL_NAME} tool, filling every field individually. Do not assemble or emit a JSON object yourself.`;
}

/** Compute side totals from scores. */
export function totalScore(scores: JudgeSideScores): number {
  return CRITERIA.reduce((sum, c) => sum + (scores[c] ?? 0), 0);
}

/** Validate the parsed JSON from Claude. Returns null if shape wrong. */
export function validateJudgeOutput(raw: unknown): JudgeOutput | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  if (
    !validateScores(o.user_scores) ||
    !validateScores(o.opponent_scores) ||
    !validateJustifications(o.user_justifications) ||
    !validateJustifications(o.opponent_justifications) ||
    typeof o.user_kindred_philosopher !== 'string' ||
    !['common_ground', 'distinct_positions', 'talked_past'].includes(o.outcome as string) ||
    typeof o.assessment !== 'string'
  ) {
    return null;
  }
  return raw as JudgeOutput;
}

function validateScores(s: unknown): s is JudgeSideScores {
  if (!s || typeof s !== 'object') return false;
  const o = s as Record<string, unknown>;
  return CRITERIA.every((c) => typeof o[c] === 'number' && o[c]! >= 0 && o[c]! <= 5);
}

function validateJustifications(j: unknown): j is Record<JudgeCriterion, string> {
  if (!j || typeof j !== 'object') return false;
  const o = j as Record<string, unknown>;
  return CRITERIA.every((c) => typeof o[c] === 'string');
}

/** Strip markdown fences + parse JSON. Returns null on failure. */
export function parseJudgeJson(raw: string): JudgeOutput | null {
  let text = raw.trim();
  text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '');
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
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
  const toolUse = data.content?.find((c) => c.type === 'tool_use' && c.name === JUDGE_TOOL_NAME);
  if (toolUse?.input && typeof toolUse.input === 'object') {
    const input = toolUse.input as Record<string, unknown>;
    const fromFlat = flatToolInputToJudgeOutput(input);
    if (fromFlat) return fromFlat;
    // The model sometimes ignores the flat schema and nests the verdict
    // (most often under a language directive, where CJK justifications get
    // crammed into a stringified blob). Recover what we can rather than
    // dropping the whole verdict.
    const fromNested = nestedToolInputToJudgeOutput(input);
    if (fromNested) return fromNested;
  }
  const text = data.content?.find((c) => c.type === 'text')?.text ?? '';
  return text ? parseJudgeJson(text) : null;
}
