"use client";

// ResultSave — fire-and-forget persistence side effect.
//
// On mount, POST the result to /api/quiz/save. On 401 (signed out),
// stash to localStorage under the same `mull.pending_quiz_attempt`
// key mull.html uses, so the existing PendingAttemptClaimer at
// /account picks it up after signup. On network error, stash too —
// don't lose the user's result to a flaky connection.
//
// Also carries two research-data riders, both consent-gated server-side:
//   - research_consent: the user's localStorage opt-in/out choice, so
//     the save route knows whether to capture per-question answers.
//   - research_answers: the per-question answer trail the quiz engine
//     stashed at finish(). Only persisted (to research_quiz_responses)
//     when research_consent === "yes". Read-and-cleared here so it can't
//     leak into a later, unrelated attempt.
//
// Renders nothing visible.

import { useEffect, useRef } from "react";
import { getStoredConsent } from "@/components/research-consent-gate";

const STASH_KEY = "mull.pending_quiz_attempt";
// Lightweight archetype-only key for fast client-side personalization
// across the site (PathwayNext widget, retention nudges, etc.).
// Set alongside the heavier STASH_KEY so any page can do a single
// localStorage.getItem('mull.archetype') without parsing JSON.
const ARCHETYPE_KEY = "mull.archetype";
// The user's own 16-D coordinates, stashed for client-side vector-space
// personalization (the PathwayNext "mind nearest you" station, and any
// future "near you" surfaces). It's the user's own result — already shown
// on this very page — not sensitive. Lets client widgets rank content by
// cosine similarity without a server round-trip or an API call.
const VECTOR_KEY = "mull.vector";
// The per-question trail written by the quiz engine's finish(). Must
// match RESEARCH_ANSWERS_KEY in app/quiz/quiz-engine.tsx.
const RESEARCH_ANSWERS_KEY = "mull.quiz.research_answers";

type ResearchAnswers = {
  questionCount: number;
  answers: unknown[];
};

type Props = {
  vector: number[];
  archetype: string;
  flavor: string | null;
  alignmentPct: number;
  mode: "quick" | "detailed";
};

// Read + clear the per-question trail the engine stashed. Returns null
// unless a fresh stash exists whose mode matches this result (guards
// against a stale trail from a different/earlier attempt bleeding in).
function takeResearchAnswers(mode: "quick" | "detailed"): ResearchAnswers | null {
  try {
    const raw = window.localStorage.getItem(RESEARCH_ANSWERS_KEY);
    if (!raw) return null;
    // One-shot: clear immediately so it can never attach to a later attempt.
    window.localStorage.removeItem(RESEARCH_ANSWERS_KEY);
    const parsed = JSON.parse(raw) as {
      mode?: string;
      questionCount?: number;
      answers?: unknown[];
      ts?: number;
    };
    if (parsed.mode !== mode) return null;
    if (!Array.isArray(parsed.answers)) return null;
    // Staleness guard — only trust a trail written in the last 10 minutes.
    if (typeof parsed.ts === "number" && Date.now() - parsed.ts > 10 * 60_000) {
      return null;
    }
    return {
      questionCount:
        typeof parsed.questionCount === "number"
          ? parsed.questionCount
          : parsed.answers.length,
      answers: parsed.answers,
    };
  } catch {
    return null;
  }
}

export function ResultSave({
  vector,
  archetype,
  flavor,
  alignmentPct,
  mode,
}: Props) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    // Write the lightweight archetype marker first — synchronous +
    // independent of the network call. Even if /api/quiz/save fails,
    // the rest of the site gets the personalization signal.
    try {
      if (archetype) window.localStorage.setItem(ARCHETYPE_KEY, archetype);
      if (Array.isArray(vector) && vector.length === 16) {
        window.localStorage.setItem(VECTOR_KEY, JSON.stringify(vector));
      }
    } catch { /* storage disabled */ }

    const consent = getStoredConsent(); // "yes" | "no" | null
    const research = takeResearchAnswers(mode);

    const payload = {
      vector,
      archetype,
      flavor,
      alignment_pct: alignmentPct,
      mode,
      taken_at: new Date().toISOString(),
      version: 1,
      // Research riders. The server only acts on these when consent is
      // "yes"; sending them otherwise is harmless (ignored).
      research_consent: consent,
      research_answers: research?.answers ?? null,
      research_question_count: research?.questionCount ?? null,
    };

    (async () => {
      try {
        const res = await fetch("/api/quiz/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.status === 401) {
          // Guest — stash for the claimer to pick up post-signup.
          stash(payload);
        } else if (!res.ok) {
          console.warn("[result] save failed", res.status);
        }
      } catch (e) {
        // Network down / fetch refused / etc — preserve the result.
        stash(payload);
        console.warn("[result] save network error; stashed locally", e);
      }
    })();
  }, [vector, archetype, flavor, alignmentPct, mode]);

  return null;
}

function stash(payload: {
  vector: number[];
  archetype: string;
  flavor: string | null;
  alignment_pct: number;
  mode: "quick" | "detailed";
  taken_at: string;
  research_consent?: "yes" | "no" | null;
  research_answers?: unknown[] | null;
  research_question_count?: number | null;
}) {
  try {
    window.localStorage.setItem(
      STASH_KEY,
      JSON.stringify({
        vector: payload.vector,
        archetype: payload.archetype,
        flavor: payload.flavor,
        alignment_pct: payload.alignment_pct,
        taken_at: payload.taken_at,
        version: 1,
        // Carry the research riders through signup so claim-attempt can
        // persist them once the user has an account + consent on record.
        // `mode` rides along too so the research row is tagged correctly.
        mode: payload.mode,
        research_consent: payload.research_consent ?? null,
        research_answers: payload.research_answers ?? null,
        research_question_count: payload.research_question_count ?? null,
      }),
    );
  } catch {
    /* storage disabled — fine */
  }
}
