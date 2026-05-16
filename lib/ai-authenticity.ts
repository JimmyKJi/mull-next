// AI-authenticity heuristic — pure-function scorer.
//
// Used on the teacher view of assignment submissions to flag responses
// that exhibit patterns commonly seen in AI-generated text. This is
// EXPLICITLY a heuristic signal, not a verdict. The UI surfaces both
// the score and the flagged patterns so teachers can judge for
// themselves — false positives happen, especially for students who
// already write in a formal register or for non-native speakers
// imitating textbook style.
//
// Why heuristic, not an API call:
//   1. Privacy — student responses don't leave Mull's database
//   2. Latency — scored at render time, no async wait
//   3. Cost — no per-submission API spend
//   4. Honest framing — published heuristic detectors (GPTZero etc.)
//      have well-documented failure modes, so an in-house "patterns
//      we noticed" framing is more accurate than borrowing a brand
//      that implies false confidence
//
// The scorer returns:
//   - score: 0-100 (higher = more AI-pattern-rich)
//   - confidence: 'low' | 'medium' | 'high' (based on text length)
//   - flags: per-pattern hits with the snippets that triggered them
//
// The teacher UI groups flags into a short summary; the student-side
// submit form discloses that detection runs ("we look for common AI
// phrases — false positives are possible").

export type AuthFlagKind =
  | 'phrase'           // a well-known AI phrase (e.g. "delve into")
  | 'uniform_sentence' // sentence lengths are unusually uniform
  | 'hedging_density'  // too many "it's important to consider" hedges
  | 'list_density'     // too many bullet/numbered structures
  | 'meta_language'    // first-person scaffolding ("In this response, I will...")
  | 'lexical_polish';  // too many "comprehensive, nuanced, intricate"

export type AuthFlag = {
  kind: AuthFlagKind;
  /** Human-readable label for the teacher UI. */
  label: string;
  /** How much this flag contributed to the total score, 0-30. */
  weight: number;
  /** Example snippets from the text (max 3) so the teacher can see
   *  what triggered the flag. */
  evidence: string[];
};

export type AuthResult = {
  /** 0-100. Higher = more AI-typical patterns observed. NOT a
   *  probability — calibration is rough. */
  score: number;
  /** Bucket label for quick reads in the UI. */
  bucket: 'low' | 'medium' | 'high';
  /** How seriously to treat the score — text under ~80 words gives
   *  almost no signal, so confidence stays 'low' regardless. */
  confidence: 'low' | 'medium' | 'high';
  /** Per-pattern breakdown. */
  flags: AuthFlag[];
  /** Word count of the submission. */
  wordCount: number;
};

// Well-known AI overuse phrases. List drawn from public AI-detection
// literature + observed Mull traffic. Case-insensitive substring
// match. Each hit = +3 to score, capped at +24 total for this flag.
const AI_PHRASES = [
  'delve into',
  'navigate the',
  'tapestry of',
  'realm of',
  'intricate web',
  'multifaceted',
  'in conclusion',
  'in summary',
  'it is important to note',
  "it's important to note",
  'it is worth noting',
  "it's worth noting",
  'it is worth mentioning',
  "it's worth mentioning",
  "let's explore",
  'this essay will',
  'in this essay',
  'in this response',
  'in the realm of',
  'pivotal role',
  'crucial role',
  'paramount importance',
  'comprehensive understanding',
  'nuanced understanding',
  'profound implications',
  'far-reaching implications',
  'serves as a',
  'plays a crucial role',
  'plays a pivotal role',
  'a testament to',
];

// Hedging templates — common AI scaffolding that softens claims.
const HEDGING_PHRASES = [
  'it is important to consider',
  "it's important to consider",
  'there are many perspectives',
  'on the other hand',
  'while it is true that',
  "while it's true that",
  'one could argue',
  'some would argue',
  'it could be argued',
  'arguably',
  'ultimately, the answer depends',
];

// Polished/elevated adjectives that AI overuses to sound serious.
const POLISH_WORDS = [
  'comprehensive',
  'nuanced',
  'intricate',
  'multifaceted',
  'profound',
  'pivotal',
  'crucial',
  'paramount',
  'compelling',
  'overarching',
  'underlying',
  'foundational',
  'imperative',
  'essential',
];

// Self-referential framing that gives away that the text is performing
// "I am writing an essay" rather than just being one.
const META_PHRASES = [
  'in this essay',
  'in this response',
  'this paper will',
  'this essay will',
  'this response will',
  'as discussed above',
  'as mentioned earlier',
  'first, second, third',
  'firstly, secondly',
  'i will explore',
  'i will examine',
  'i will discuss',
];

function findEvidence(text: string, phrases: string[]): string[] {
  const lower = text.toLowerCase();
  const hits: string[] = [];
  for (const phrase of phrases) {
    const idx = lower.indexOf(phrase);
    if (idx !== -1) {
      // Grab ~60 chars around the hit for context.
      const start = Math.max(0, idx - 20);
      const end = Math.min(text.length, idx + phrase.length + 20);
      hits.push('…' + text.slice(start, end).trim() + '…');
      if (hits.length >= 3) break;
    }
  }
  return hits;
}

/** Count how many distinct phrases from a list appear at least once. */
function countDistinctMatches(text: string, phrases: string[]): number {
  const lower = text.toLowerCase();
  let count = 0;
  for (const p of phrases) {
    if (lower.includes(p)) count++;
  }
  return count;
}

/** Sentence-length uniformity: AI text tends to produce sentences
 *  within a tight band; human writing has more variance. We compute
 *  the coefficient of variation (stddev / mean) of sentence lengths.
 *  CV under ~0.35 over 5+ sentences is suspicious. */
function sentenceUniformityFlag(text: string): AuthFlag | null {
  const sentences = text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 5);
  if (sentences.length < 5) return null;

  const lengths = sentences.map(s => s.split(/\s+/).length);
  const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  if (mean < 4) return null; // texts of single-word sentences are weird; skip
  const variance = lengths.reduce((acc, l) => acc + (l - mean) ** 2, 0) / lengths.length;
  const stddev = Math.sqrt(variance);
  const cv = stddev / mean;

  if (cv < 0.25) {
    return {
      kind: 'uniform_sentence',
      label: `Sentences are unusually uniform in length (CV ${cv.toFixed(2)})`,
      weight: 14,
      evidence: [`${sentences.length} sentences averaging ${mean.toFixed(0)} words, stddev ${stddev.toFixed(1)}`],
    };
  }
  if (cv < 0.35) {
    return {
      kind: 'uniform_sentence',
      label: `Sentence lengths are fairly uniform (CV ${cv.toFixed(2)})`,
      weight: 7,
      evidence: [`${sentences.length} sentences averaging ${mean.toFixed(0)} words, stddev ${stddev.toFixed(1)}`],
    };
  }
  return null;
}

/** Bullet / numbered list density. Heavy structure isn't impossible
 *  for a student, but it's atypical for a short prompt response and
 *  very typical of AI templated output. */
function listDensityFlag(text: string): AuthFlag | null {
  const lines = text.split('\n');
  let bulletCount = 0;
  for (const line of lines) {
    const trimmed = line.trim();
    if (/^([-*•·–—]|\d+[.)])\s+/.test(trimmed)) bulletCount++;
  }
  if (bulletCount === 0) return null;
  const ratio = bulletCount / lines.length;
  if (bulletCount >= 4 && ratio > 0.4) {
    return {
      kind: 'list_density',
      label: `Heavy bullet/numbered list structure (${bulletCount} list items)`,
      weight: 10,
      evidence: [`${bulletCount} structured items across ${lines.length} lines`],
    };
  }
  return null;
}

/** Main scorer. Pure function — no DB, no async. */
export function scoreAuthenticity(rawText: string): AuthResult {
  const text = (rawText ?? '').trim();
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;

  const flags: AuthFlag[] = [];

  // Phrase scan — common AI-overuse.
  const phraseHits = countDistinctMatches(text, AI_PHRASES);
  if (phraseHits > 0) {
    flags.push({
      kind: 'phrase',
      label: phraseHits === 1
        ? '1 commonly AI-overused phrase'
        : `${phraseHits} commonly AI-overused phrases`,
      weight: Math.min(24, phraseHits * 4),
      evidence: findEvidence(text, AI_PHRASES),
    });
  }

  // Hedging scaffold.
  const hedgeHits = countDistinctMatches(text, HEDGING_PHRASES);
  if (hedgeHits >= 2) {
    flags.push({
      kind: 'hedging_density',
      label: `${hedgeHits} hedging phrases — sounds non-committal`,
      weight: Math.min(15, hedgeHits * 4),
      evidence: findEvidence(text, HEDGING_PHRASES),
    });
  }

  // Polish-word density (only flag if it's high relative to text length).
  const polishHits = countDistinctMatches(text, POLISH_WORDS);
  if (wordCount > 50 && polishHits >= 3) {
    flags.push({
      kind: 'lexical_polish',
      label: `${polishHits} elevated AI-typical adjectives ("comprehensive", "nuanced", "intricate")`,
      weight: Math.min(15, polishHits * 3),
      evidence: findEvidence(text, POLISH_WORDS),
    });
  }

  // Meta-language scaffolding.
  const metaHits = countDistinctMatches(text, META_PHRASES);
  if (metaHits > 0) {
    flags.push({
      kind: 'meta_language',
      label: metaHits === 1
        ? 'Essay-meta scaffolding ("in this response...")'
        : `${metaHits} essay-meta scaffolding phrases`,
      weight: Math.min(12, metaHits * 5),
      evidence: findEvidence(text, META_PHRASES),
    });
  }

  // Sentence uniformity (only meaningful on enough text).
  if (wordCount >= 50) {
    const uniformFlag = sentenceUniformityFlag(text);
    if (uniformFlag) flags.push(uniformFlag);
  }

  // List density.
  const listFlag = listDensityFlag(text);
  if (listFlag) flags.push(listFlag);

  // Aggregate score. Cap at 100.
  const rawScore = flags.reduce((acc, f) => acc + f.weight, 0);
  const score = Math.min(100, rawScore);

  let bucket: AuthResult['bucket'];
  if (score >= 50) bucket = 'high';
  else if (score >= 20) bucket = 'medium';
  else bucket = 'low';

  // Confidence: short text doesn't give the scorer enough to work
  // with, so cap confidence even if the score is high.
  let confidence: AuthResult['confidence'];
  if (wordCount < 40) confidence = 'low';
  else if (wordCount < 120) confidence = 'medium';
  else confidence = 'high';

  return { score, bucket, confidence, flags, wordCount };
}

/** Human-readable summary line for the teacher UI. Short, hedged,
 *  with the confidence baked in. */
export function authSummary(r: AuthResult): string {
  if (r.confidence === 'low' && r.wordCount < 40) {
    return `Too short (${r.wordCount} words) to score meaningfully.`;
  }
  const conf = r.confidence === 'high' ? '' : ` · ${r.confidence} confidence`;
  switch (r.bucket) {
    case 'high':
      return `${r.score}/100 — multiple AI-typical patterns${conf}`;
    case 'medium':
      return `${r.score}/100 — some AI-typical patterns${conf}`;
    case 'low':
      return `${r.score}/100 — reads naturally${conf}`;
  }
}
