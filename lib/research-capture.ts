// Server-side research-data capture helpers, shared by the two routes
// that finalize a quiz attempt:
//   - app/api/quiz/save/route.ts        (authed happy path)
//   - app/api/account/claim-attempt/route.ts (guest → post-signup claim)
//
// Two responsibilities:
//   1. syncConsent — keep the research_consent table in step with the
//      client's localStorage choice, and report the effective consent.
//   2. captureResearchResponse — write the per-question answer trail to
//      research_quiz_responses, but ONLY for opted-in users.
//
// Everything here is best-effort: a failure logs and returns a falsy
// result; it never throws into the caller, because the operational quiz
// save must succeed regardless of whether research capture does.

import type { SupabaseClient } from "@supabase/supabase-js";

export type Consent = "yes" | "no";

/** The compact per-question shape stored in research_quiz_responses.answers. */
export type ResearchAnswer =
  | { q: number; kind: "single"; a: number }
  | { q: number; kind: "multi"; indices: number[] }
  | { q: number; kind: "skip" };

/** Normalize an untrusted consent value to "yes" | "no" | undefined. */
function normalizeConsent(raw: unknown): Consent | undefined {
  return raw === "yes" || raw === "no" ? raw : undefined;
}

/**
 * Reconcile the client-reported consent with the server record.
 *
 * - If the client sent an explicit "yes"/"no", upsert it (this is the
 *   user's own choice for their own data — no privilege concern) and
 *   return it.
 * - Otherwise, read whatever we already have on file and return that.
 *
 * Returns the *effective* consent ("yes" | "no" | null). Never throws.
 */
export async function syncConsent(
  supabase: SupabaseClient,
  userId: string,
  rawConsent: unknown,
): Promise<Consent | null> {
  const choice = normalizeConsent(rawConsent);
  try {
    if (choice) {
      await supabase.from("research_consent").upsert(
        {
          user_id: userId,
          consent: choice,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );
      return choice;
    }
    const { data } = await supabase
      .from("research_consent")
      .select("consent")
      .eq("user_id", userId)
      .maybeSingle();
    const stored = data?.consent;
    return stored === "yes" || stored === "no" ? stored : null;
  } catch (e) {
    console.warn("[research] syncConsent failed", e);
    // Fall back to the client's stated choice if we couldn't reach the DB.
    return choice ?? null;
  }
}

// Defensive bounds — a quiz set is at most ~50 questions; anything wildly
// larger is malformed/abusive input and gets rejected wholesale.
const MAX_ANSWERS = 200;

/**
 * Validate + normalize an untrusted answers payload into clean
 * ResearchAnswer[]. Drops malformed entries; returns null if nothing
 * usable survives (so the caller skips the insert).
 */
function sanitizeAnswers(raw: unknown): ResearchAnswer[] | null {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_ANSWERS) {
    return null;
  }
  const out: ResearchAnswer[] = [];
  for (const el of raw) {
    if (!el || typeof el !== "object") continue;
    const e = el as Record<string, unknown>;
    const q = Number(e.q);
    if (!Number.isInteger(q) || q < 0 || q > MAX_ANSWERS) continue;
    if (e.kind === "single") {
      const a = Number(e.a);
      if (!Number.isInteger(a) || a < 0 || a > 50) continue;
      out.push({ q, kind: "single", a });
    } else if (e.kind === "multi") {
      if (!Array.isArray(e.indices)) continue;
      const indices = e.indices
        .map((i) => Number(i))
        .filter((i) => Number.isInteger(i) && i >= 0 && i <= 50);
      if (indices.length === 0) continue;
      out.push({ q, kind: "multi", indices });
    } else if (e.kind === "skip") {
      out.push({ q, kind: "skip" });
    }
  }
  return out.length > 0 ? out : null;
}

export type CaptureArgs = {
  userId: string;
  attemptId: string | null;
  consent: Consent | null;
  mode: "quick" | "detailed";
  answers: unknown;
  questionCount: unknown;
  vector: number[];
  archetype: string;
  alignmentPct: number;
};

/**
 * Write one research_quiz_responses row — but only for opted-in users
 * with a usable answer trail. Returns true if a row was written.
 *
 * The opt-in check here is the single gate that keeps the research table
 * consent-clean: if consent !== "yes", nothing is written, full stop.
 * Never throws.
 */
export async function captureResearchResponse(
  supabase: SupabaseClient,
  args: CaptureArgs,
): Promise<boolean> {
  if (args.consent !== "yes") return false;

  const answers = sanitizeAnswers(args.answers);
  if (!answers) return false;

  const qcRaw = Number(args.questionCount);
  const question_count =
    Number.isInteger(qcRaw) && qcRaw > 0 ? qcRaw : answers.length;

  try {
    const { error } = await supabase.from("research_quiz_responses").insert({
      user_id: args.userId,
      attempt_id: args.attemptId,
      mode: args.mode,
      question_count,
      answers,
      vector: args.vector,
      archetype: args.archetype,
      alignment_pct: args.alignmentPct,
    });
    if (error) {
      console.warn("[research] capture insert failed", error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.warn("[research] capture threw", e);
    return false;
  }
}
