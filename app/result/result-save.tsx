"use client";

// ResultSave — fire-and-forget persistence side effect.
//
// On mount, POST the result to /api/quiz/save. On 401 (signed out),
// stash to localStorage under the same `mull.pending_quiz_attempt`
// key mull.html uses, so the existing PendingAttemptClaimer at
// /account picks it up after signup. On network error, stash too —
// don't lose the user's result to a flaky connection.
//
// Renders nothing visible.

import { useEffect, useRef } from "react";

const STASH_KEY = "mull.pending_quiz_attempt";

type Props = {
  vector: number[];
  archetype: string;
  flavor: string | null;
  alignmentPct: number;
  mode: "quick" | "detailed";
};

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

    const payload = {
      vector,
      archetype,
      flavor,
      alignment_pct: alignmentPct,
      mode,
      taken_at: new Date().toISOString(),
      version: 1,
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
  taken_at: string;
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
      }),
    );
  } catch {
    /* storage disabled — fine */
  }
}
