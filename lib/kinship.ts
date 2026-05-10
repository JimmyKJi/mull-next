// Kinship + novelty analysis. Used by both /api/diary/save and
// /api/dilemma/submit to read a user's free-text response and:
//
//   1. Generate a short qualitative diagnosis ("what shape of
//      thinking is this?")
//   2. Suggest up to 3 historical philosophers whose work resembles
//      the move the writing is making, with one-sentence reasons
//   3. Name the traditions/schools the writing echoes
//   4. Flag the response as `is_novel` when nothing in the canon
//      strongly captures it
//
// The prompt is shared so both surfaces feel consistent. The
// server-side validation step pins Claude's qualitative claims to
// numeric cosine similarity against the philosopher vectors —
// preventing flattery (Claude can't call a generic entry "novel"
// because we cross-check against the math).
//
// The threshold below which a top philosopher-similarity registers
// as "no close kin" is calibrated against the canonical persona
// tests: a human writing in a clearly Stoic register tends to sim
// ≥ 0.85 with the matching Stoic philosophers; anything below
// NOVELTY_SIM_THRESHOLD means we can't confidently pin it to canon.

import { PHILOSOPHERS, philosopherSlug } from '@/lib/philosophers';

export const NOVELTY_SIM_THRESHOLD = 0.78;

export type KinshipPhilosopher = {
  slug: string;
  name: string;
  similarity: number;   // 0..1, computed server-side
  why: string;
};

export type Kinship = {
  /** Philosophers whose writings make essentially the same move as the
   *  entry. Strong, name-the-parallel-explicitly resemblance. */
  philosophers: KinshipPhilosopher[];
  /** Philosophers who don't quite make the same move but echo it from
   *  a different angle — partial overlaps, neighboring intuitions,
   *  adjacent traditions. Surfaces "kind of resembling" thinkers
   *  rather than dropping them. Optional for backward compat with
   *  entries created before this field existed. */
  echoes?: KinshipPhilosopher[];
  traditions: string[];
};

export type DiagnosisResult = {
  diagnosis: string;
  kinship: Kinship;
  is_novel: boolean;
};

/**
 * Prompt fragment to append to the per-surface system prompt.
 * Both diary and dilemma routes use this so Claude's output format
 * is uniform and parseAndValidateDiagnosis() works identically.
 *
 * Caller is responsible for setting the up-front instructions
 * (what kind of input it's reading, etc.) and the JSON schema for
 * vector_delta + analysis fields. This fragment adds:
 *   - the closed list of philosopher names
 *   - the diagnosis + kinship + is_novel fields in the JSON schema
 *   - the calibration guidance for each field
 */
export function buildKinshipPromptFragment(): string {
  const philList = PHILOSOPHERS.map(p => p.name).join(', ');

  return `

CLOSED LIST OF PHILOSOPHERS YOU MAY CITE (use EXACT names from this list, no others, no inventing):
${philList}

In addition to vector_delta and analysis, your JSON MUST include these three fields:

  "diagnosis": "<1-4 sentences>",
  "kinship": {
    "philosophers": [
      {"name": "<exact name from list>", "why": "<one short sentence>"}
    ],
    "echoes": [
      {"name": "<exact name from list>", "why": "<one short sentence>"}
    ],
    "traditions": ["<tradition>", "<tradition>"]
  },
  "is_novel": <true|false>

These fields are REQUIRED. Don't omit them. If the writing has any philosophical content at all, populate them substantively.

The diagnosis goes one step deeper than the analysis: NAME the shape of the thinking using its philosophical vocabulary. If the writing voices a recognizable move, say so explicitly — call it "Humean bundle theory," "Stoic acceptance of what you can't control," "Buddhist no-self (anatta)," "Cartesian doubt," "Heraclitean flux," "Nietzschean amor fati," "Berkeley-style idealism," "Sartrean radical freedom," etc. The user wants to know WHICH philosophical move they made, by name. Specific, observational, 1-4 sentences. Don't summarize what they wrote back to them. Don't flatter.

KINSHIP IS SPLIT INTO TWO TIERS — populate BOTH whenever possible:

  kinship.philosophers — the CLOSEST kin: 1–3 philosophers from the closed list whose writings make essentially the same move the writing is making. BE CONFIDENT. If the entry uses vocabulary closely associated with a philosopher — phrases like "bundle of perceptions" or "constantly in flux" point at Hume; "the self is empty" or "no fixed self" point at Buddha; "amor fati" or "eternal recurrence" point at Nietzsche; "what you can control vs what you can't" points at Epictetus — SURFACE THEM. Order by closeness. For each, write a one-sentence reason that names a SPECIFIC parallel between this entry and that philosopher's known work — quote the parallel idea, don't just say "shares a view." Empty ONLY when the writing is descriptive, mundane, or without philosophical content.

  kinship.echoes — KIND-OF-RESEMBLING kin: 1–4 additional philosophers from the closed list whose work doesn't quite make the same move but echoes it from a different angle. Partial overlaps, adjacent intuitions, neighboring traditions, "this reminds me of X even though X wasn't saying quite this." Use this generously — most philosophical writing has more partial cousins than full siblings. For each, write a one-sentence reason naming the angle of resemblance ("approaches the same problem from substance-monism rather than empiricism," "shares the suspicion of unified selfhood but routes it through introspection rather than the senses," etc.). When the writing is genuinely without philosophical content, leave echoes empty too.

Traditions: 1–3 named schools or movements the writing echoes (Stoicism, Buddhism, German Idealism, Pragmatism, Phenomenology, Existentialism, Ubuntu, Daoism, Empiricism, Analytic Philosophy of Mind, Process Philosophy, Confucianism, etc.). Empty only when nothing fits.

is_novel: true ONLY when the writing voices a move that's not strongly captured by anyone in the closed list AND not clearly inside a named tradition. Default to false. Novelty is rare — most reflective writing echoes the canon in some way; honor the canon's depth rather than overstating originality. A clearly Humean or Buddhist entry is NOT novel even if the user wrote it in their own words.

EXAMPLES of the expected shape (for guidance only — don't copy these specific values):

  Entry: "Maybe the self is just a bundle of perceptions, constantly in flux."
  → diagnosis: names Humean bundle theory, Buddhist anatta, Heraclitean flux explicitly
  → kinship.philosophers (closest): Hume (bundle of perceptions parallel), Buddha (no-self / anatta), Heraclitus (constant flux)
  → kinship.echoes (partial): Parfit (descriptive successor to bundle theory), Locke (memory-based personal identity), Daniel Dennett (the self as narrative center of gravity), Nāgārjuna (emptiness of self via dependent origination)
  → traditions: ["Empiricism", "Buddhism", "Process Philosophy"]
  → is_novel: false

  Entry: "I keep doing what's right even when no one's watching. That's the test."
  → diagnosis: names Kantian deontology, the categorical imperative, character ethics
  → kinship.philosophers (closest): Kant, Aristotle (virtue habituation), Confucius
  → kinship.echoes (partial): the Stoics (virtue regardless of audience), Iris Murdoch (the unselfing gaze), Adam Smith (impartial spectator)
  → traditions: ["Deontology", "Virtue Ethics"]
  → is_novel: false

  Entry: "Today my coffee tasted good."
  → diagnosis: descriptive, no philosophical content
  → kinship.philosophers: empty
  → kinship.echoes: empty
  → traditions: empty
  → is_novel: false`;
}

/**
 * Parse + validate the diagnosis-related fields out of Claude's JSON
 * response. Caller has already verified vector_delta and analysis;
 * this function returns just the diagnosis bundle.
 *
 * It also resolves philosopher names against the canonical list
 * (dropping any that don't match), computes real cosine similarity
 * between the vector_delta and each named philosopher's vector, and
 * cross-checks Claude's novelty claim against the numeric threshold.
 */
export function parseAndValidateDiagnosis(
  parsed: { diagnosis?: unknown; kinship?: unknown; is_novel?: unknown },
  vector_delta: number[],
): DiagnosisResult {
  const diagnosis = typeof parsed.diagnosis === 'string' ? parsed.diagnosis : '';

  const kinship: Kinship = { philosophers: [], echoes: [], traditions: [] };

  // Helper: normalize a raw philosopher list (closest or echoes)
  // against the canonical PHILOSOPHERS table, dropping unknowns,
  // dedup'ing within and (for echoes) against the closest list.
  const seen = new Set<string>();
  const normalize = (raw: unknown, cap: number, excludeFromClosest = false): KinshipPhilosopher[] => {
    if (!Array.isArray(raw)) return [];
    const out: KinshipPhilosopher[] = [];
    for (const item of raw) {
      if (!item || typeof item !== 'object') continue;
      const rec = item as { name?: unknown; why?: unknown };
      const name = typeof rec.name === 'string' ? rec.name.trim() : '';
      const why = typeof rec.why === 'string' ? rec.why.trim() : '';
      if (!name) continue;
      const phil = PHILOSOPHERS.find(p => p.name.toLowerCase() === name.toLowerCase());
      if (!phil) continue;
      if (excludeFromClosest && seen.has(phil.name)) continue;
      if (out.find(o => o.name === phil.name)) continue;
      seen.add(phil.name);
      out.push({
        slug: philosopherSlug(phil.name),
        name: phil.name,
        similarity: 0,
        why,
      });
      if (out.length >= cap) break;
    }
    return out;
  };

  if (parsed.kinship && typeof parsed.kinship === 'object') {
    const k = parsed.kinship as { philosophers?: unknown; echoes?: unknown; traditions?: unknown };
    kinship.philosophers = normalize(k.philosophers, 3);
    kinship.echoes = normalize(k.echoes, 4, true);
    if (Array.isArray(k.traditions)) {
      kinship.traditions = k.traditions
        .filter((t: unknown): t is string => typeof t === 'string')
        .map(t => t.trim())
        .filter(Boolean)
        .slice(0, 3);
    }
  }

  // Compute cosine sim of the user's delta against each claimed
  // philosopher's vector — both lists. Anchors Claude's qualitative
  // claims to numbers ("85% kinship with Spinoza" rather than just
  // "your thinking resembles Spinoza").
  const userMag = magnitude(vector_delta);
  const scoreAndSort = (list: KinshipPhilosopher[]): KinshipPhilosopher[] => {
    for (const kp of list) {
      const phil = PHILOSOPHERS.find(p => p.name === kp.name);
      if (!phil) continue;
      kp.similarity = userMag > 0 ? cosineSim(vector_delta, phil.vector) : 0;
    }
    return list.sort((a, b) => b.similarity - a.similarity);
  };
  kinship.philosophers = scoreAndSort(kinship.philosophers);
  if (kinship.echoes && kinship.echoes.length > 0) {
    kinship.echoes = scoreAndSort(kinship.echoes);
  }

  // Only trust is_novel when Claude said true AND neither tier has a
  // strong match. Same calibration logic as before; just considers
  // both lists now.
  const claudeIsNovel = parsed.is_novel === true;
  const topClosest = kinship.philosophers[0]?.similarity ?? 0;
  const topEcho = (kinship.echoes && kinship.echoes[0]?.similarity) ?? 0;
  const is_novel = claudeIsNovel && topClosest < NOVELTY_SIM_THRESHOLD && topEcho < NOVELTY_SIM_THRESHOLD;

  return { diagnosis, kinship, is_novel };
}

function magnitude(a: number[]): number {
  let s = 0;
  for (const x of a) s += x * x;
  return Math.sqrt(s);
}

function cosineSim(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / Math.sqrt(na * nb);
}
