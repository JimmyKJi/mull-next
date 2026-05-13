"use client";

// ResultClient — wraps the ResultReveal from the Phase 2 POC, adds
// the alignment-percent + flavor data from the URL-decoded vector,
// and handles the save-on-mount flow.
//
// Save flow:
//   1. Try POST /api/quiz/save.
//   2. On 200 → done.
//   3. On 401 (not signed in) → stash in localStorage under the same
//      `mull.pending_quiz_attempt` key mull.html uses, so the existing
//      PendingAttemptClaimer at /account picks it up post-signup.
//   4. On any other error → log to console + ignore (the result is
//      still readable; persistence is best-effort).
//
// The sparse-vector case renders an apologetic empty state — same
// posture as mull.html's "Not yet placed" fallback. Better to show
// nothing than to show something fake.

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ARCHETYPES, getArchetypeByKey } from "@/lib/archetypes";
import { ResultReveal } from "../result-preview/result-reveal";

const STASH_KEY = "mull.pending_quiz_attempt";

type Props = {
  sparse: boolean;
  vector: number[];
  mode: "quick" | "detailed";
  top: { archetypeKey: string; sim: number };
  runnerUp: { archetypeKey: string; sim: number };
  flavor: string;
  alignmentPct: number;
};

export default function ResultClient({
  sparse,
  vector,
  mode,
  top,
  flavor,
  alignmentPct,
}: Props) {
  const saved = useRef(false);

  useEffect(() => {
    if (sparse) return;
    if (saved.current) return;
    saved.current = true;

    const archetype = getArchetypeByKey(top.archetypeKey);
    if (!archetype) return;

    const payload = {
      vector,
      archetype: `The ${capitalize(archetype.key)}`,
      flavor: flavor || null,
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
          // Guest — stash for the PendingAttemptClaimer to pick up
          // after signup.
          stashForGuest(payload);
        } else if (!res.ok) {
          const err = await safeReadJson(res);
          console.warn("[result] save failed", res.status, err);
        }
      } catch (e) {
        // Network error or otherwise — degrade to guest stash so
        // the user doesn't lose their result even if they were
        // signed in but offline.
        stashForGuest(payload);
        console.warn("[result] save network error; stashed locally", e);
      }
    })();
  }, [sparse, vector, mode, top.archetypeKey, flavor, alignmentPct]);

  if (sparse) {
    return <SparseFallback />;
  }

  const archetype = getArchetypeByKey(top.archetypeKey);
  if (!archetype) {
    // Shouldn't happen — top is picked from ARCHETYPES — but guard so
    // a future archetype-key drift doesn't crash the page.
    return <SparseFallback />;
  }

  return (
    <ResultReveal
      archetype={archetype}
      alignmentPct={alignmentPct}
    />
  );
}

function stashForGuest(payload: {
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
    // Storage disabled — fine, persistence is best-effort.
  }
}

async function safeReadJson(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ─── Sparse-vector fallback ──────────────────────────────────────
// Shown when the user skipped enough questions that their vector has
// effectively zero magnitude — we'd be matching them to an archetype
// from noise. Better to show nothing than to show something fake.

function SparseFallback() {
  return (
    <main className="min-h-[100svh] bg-[var(--color-cream,#FAF6EC)] px-6 py-20">
      <div className="mx-auto max-w-[560px] text-center">
        <div className="text-[11px] uppercase tracking-[0.2em] text-[#4A4338] opacity-65">
          Your result
        </div>
        <h1
          className="mt-4 font-display text-[40px] leading-tight text-[#221E18]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          <em>Not yet placed.</em>
        </h1>
        <p className="mt-6 text-[16px] leading-relaxed text-[#4A4338]">
          You skipped most of the questions, which is honest. Mull would
          rather show you nothing than show you something fake. Take it
          again with answers that fit you, or explore the ten archetypes
          to see what you might be near.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/quiz?mode=quick"
            className="rounded-full bg-[#221E18] px-5 py-3 text-[14px] font-medium text-[#FAF6EC] hover:scale-[1.02]"
          >
            Retake the quiz
          </Link>
          <Link
            href="/archetype"
            className="text-[14px] underline decoration-[#D6CDB6] decoration-1 underline-offset-4 hover:text-[#221E18] hover:decoration-[#8C6520]"
          >
            Browse the ten archetypes →
          </Link>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-2 sm:grid-cols-5">
          {ARCHETYPES.map((a) => (
            <Link
              key={a.key}
              href={`/archetype/${a.key}`}
              className="rounded-md border border-[#D6CDB6] bg-[#F1EAD8] px-3 py-2 text-[13px] italic text-[#221E18] hover:bg-[#F8EDC8]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {capitalize(a.key)}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
