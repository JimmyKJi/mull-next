// /result — v3 pixel-game world.
//
// Server shell decodes the vector and computes archetype match,
// then hands everything to the client component for the animated
// reveal (figure landing + alignment count-up + radar draw).

import type { Metadata, Viewport } from "next";
import { ARCHETYPES } from "@/lib/archetypes";
import {
  ARCHETYPE_TARGETS,
  expandArchetypeVector,
} from "@/lib/archetype-targets";
import { getArchetypeColor } from "@/lib/archetype-colors";
import { DIM_KEYS, DIM_NAMES, type DimKey } from "@/lib/dimensions";
import { PHILOSOPHERS } from "@/lib/philosophers";
import {
  cos,
  displayPct,
  computeFlavor,
  zeros,
  magnitude,
} from "@/lib/vectors";
import { createClient } from "@/utils/supabase/server";
import { ResultClient } from "./result-client";

export const metadata: Metadata = {
  title: "Your result · Mull",
  description:
    "Where your worldview sits — and which thinkers across history have stood near you.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

type SearchParams = Promise<{ v?: string; m?: string; challenger?: string }>;

function decodeVector(raw: string | undefined): number[] {
  if (!raw) return zeros();
  try {
    const arr = JSON.parse(atob(raw));
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

  const sparse = magnitude(vector) < 2;
  if (sparse) {
    return <SparseFallback />;
  }

  // Check signed-in state — drives whether the result page promotes
  // the signup CTA full-width or shows the standard 3-column footer.
  // Anonymous users are the conversion population; signed-in users
  // already saved.
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isSignedIn = !!user;

  // If the user arrived via a friend-challenge link, resolve the
  // inviter so we can show a "Compare with <inviter>" CTA. Falls back
  // to plain string "your friend" when handle is private/missing.
  let challengerHandle: string | null = null;
  let challengerName: string | null = null;
  if (params.challenger) {
    const { data: challenge } = await supabase
      .from('friend_challenges')
      .select('inviter_id')
      .eq('code', params.challenger)
      .maybeSingle<{ inviter_id: string }>();
    if (challenge) {
      const { data: profile } = await supabase
        .from('public_profiles')
        .select('handle, display_name')
        .eq('user_id', challenge.inviter_id)
        .maybeSingle<{ handle: string; display_name: string | null }>();
      if (profile) {
        challengerHandle = profile.handle;
        challengerName = profile.display_name || profile.handle;
      }
    }
  }

  const scored = ARCHETYPES.map((a) => {
    const target = ARCHETYPE_TARGETS.find((t) => t.key === a.key);
    const prototype = target ? expandArchetypeVector(target) : zeros();
    return { archetype: a, prototype, sim: cos(vector, prototype) };
  }).sort((a, b) => b.sim - a.sim);

  const top = scored[0];
  const runnerUp = scored[1];
  const flavor = computeFlavor(vector, top.prototype);
  const alignmentPct = displayPct(top.sim);
  const runnerUpPct = displayPct(runnerUp.sim);

  // Three closest philosophers by cosine similarity.
  const closest = PHILOSOPHERS.map((p) => ({
    name: p.name,
    dates: p.dates,
    keyIdea: p.keyIdea,
    archetypeKey: p.archetypeKey,
    slug: p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    sim: cos(vector, p.vector),
  }))
    .sort((a, b) => b.sim - a.sim)
    .slice(0, 3);

  // Dimensions data for the radar — normalize each value to 0..1
  // (vectors come in roughly 0..10 range).
  const dimRadar = DIM_KEYS.map((k, i) => ({
    key: k,
    name: DIM_NAMES[k],
    value: Math.max(0, Math.min(1, (vector[i] ?? 0) / 10)),
  }));

  // User top-3 dims for the "your strongest tendencies" chip strip.
  const userTop3: { key: DimKey; v: number }[] = vector
    .map((v, i) => ({ key: DIM_KEYS[i] as DimKey, v }))
    .filter((d) => d.v > 0)
    .sort((a, b) => b.v - a.v)
    .slice(0, 3);

  return (
    <ResultClient
      vector={vector}
      mode={mode}
      topKey={top.archetype.key}
      topName={top.archetype.key}
      spirit={top.archetype.spirit}
      whatItGetsRight={top.archetype.whatItGetsRight}
      whereItFalters={top.archetype.whereItFalters}
      flavor={flavor}
      alignmentPct={alignmentPct}
      runnerUpKey={runnerUp.archetype.key}
      runnerUpPct={runnerUpPct}
      closest={closest}
      dimRadar={dimRadar}
      userTop3={userTop3.map((d) => ({ key: d.key, name: DIM_NAMES[d.key] }))}
      isSignedIn={isSignedIn}
      challengerHandle={challengerHandle}
      challengerName={challengerName}
      challengerCode={params.challenger ?? null}
    />
  );
}

import Link from "next/link";

function SparseFallback() {
  return (
    <main className="min-h-[100svh] bg-[#FAF6EC] px-6 py-24 text-[#221E18] sm:px-10 sm:py-32">
      <div className="mx-auto max-w-[640px] text-center">
        <div
          className="text-[11px] uppercase tracking-[0.24em] text-[#8C6520]"
          style={{ fontFamily: "var(--font-pixel-display)" }}
        >
          ▶ YOUR RESULT
        </div>
        <h1
          className="mt-6 text-[36px] leading-none tracking-[0.04em] text-[#221E18] sm:text-[56px]"
          style={{ fontFamily: "var(--font-pixel-display)" }}
        >
          <span style={{ textShadow: "4px 4px 0 #B8862F" }}>
            NOT YET PLACED
          </span>
        </h1>
        <p className="mx-auto mt-8 max-w-[480px] text-[16px] leading-[1.65] text-[#4A4338] sm:text-[17px]">
          You skipped most of the questions, which is honest. Mull
          would rather show you nothing than show you something fake.
          Take it again with answers that fit you, or browse the ten
          archetypes to see what you might be near.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-5">
          <Link href="/quiz?mode=quick" className="pixel-button pixel-button--amber">
            <span>▶ RETAKE THE QUIZ</span>
          </Link>
          <Link
            href="/archetype"
            className="text-[14px] text-[#4A4338] underline decoration-[#D6CDB6] decoration-2 underline-offset-4 hover:text-[#221E18] hover:decoration-[#8C6520]"
          >
            Browse the ten archetypes →
          </Link>
        </div>
      </div>
    </main>
  );
}
