// /result — the redesigned quiz-result page.
//
// Server shell: decodes the user vector from the URL, computes the
// matched archetype + flavor + alignment percent server-side, then
// hands the resolved data to the client reveal component. This is
// the canonical migration target for the result POC built in Phase 2.
//
// URL shape (matches mull.html's share-link convention so old links
// keep working post-cutover):
//   /result?v=<base64Json(number[16])>&m=quick|detailed
//
// Authed save: the client component triggers /api/quiz/save on mount.
// Guest save: the client stashes to localStorage under
// mull.pending_quiz_attempt for PendingAttemptClaimer to grab post-signup.

import type { Metadata, Viewport } from "next";
import { ARCHETYPES } from "@/lib/archetypes";
import { ARCHETYPE_TARGETS, expandArchetypeVector } from "@/lib/archetype-targets";
import { cos, displayPct, computeFlavor, zeros, magnitude } from "@/lib/vectors";
import ResultClient from "./result-client";

export const metadata: Metadata = {
  title: "Your result · Mull",
  description: "Where your worldview sits — and which thinkers have stood near you.",
  // Redesign sandbox; flip during Phase 3g cutover.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

type SearchParams = Promise<{
  v?: string;
  m?: string;
}>;

// Decode the `v` query param into a 16-D vector. Returns the zero
// vector when the param is missing, malformed, or fails validation —
// the client uses magnitude() to decide whether to show the
// "not enough signal" empty state vs the reveal.
function decodeVector(raw: string | undefined): number[] {
  if (!raw) return zeros();
  try {
    const json = atob(raw);
    const arr = JSON.parse(json);
    if (!Array.isArray(arr) || arr.length !== 16) return zeros();
    return arr.map((n) => {
      const x = Number(n);
      return Number.isFinite(x) ? x : 0;
    });
  } catch {
    return zeros();
  }
}

export default async function ResultPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const vector = decodeVector(params.v);
  const mode = params.m === "detailed" ? "detailed" : "quick";

  // Sparse-vector edge case: someone skipped almost everything. We
  // pass the flag to the client and let it render the "not enough
  // signal" state rather than picking an arbitrary archetype from
  // near-noise.
  const sparse = magnitude(vector) < 2;

  // Score all 10 archetypes by cosine similarity against the user's
  // vector. `ARCHETYPE_TARGETS` has the canonical 16-D prototype
  // for each archetype (single source of truth — see lib/archetype-
  // targets.ts header).
  const scored = ARCHETYPES.map((a) => {
    const target = ARCHETYPE_TARGETS.find((t) => t.key === a.key);
    const prototype = target ? expandArchetypeVector(target) : zeros();
    return {
      archetype: a,
      prototype,
      sim: cos(vector, prototype),
    };
  }).sort((a, b) => b.sim - a.sim);

  const top = scored[0];
  const runnerUp = scored[1];
  const flavor = sparse ? "" : computeFlavor(vector, top.prototype);
  const alignmentPct = displayPct(top.sim);

  return (
    <ResultClient
      sparse={sparse}
      vector={vector}
      mode={mode}
      top={{
        archetypeKey: top.archetype.key,
        sim: top.sim,
      }}
      runnerUp={{
        archetypeKey: runnerUp.archetype.key,
        sim: runnerUp.sim,
      }}
      flavor={flavor}
      alignmentPct={alignmentPct}
    />
  );
}
