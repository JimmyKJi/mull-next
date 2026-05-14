// /result — v2. Editorial walking tour after the quiz.
//
// Design intent (DESIGN-DIRECTION.md §4):
//   "Here is where you sit. The constellation re-renders with the
//   user's point. Three closest philosophers introduce themselves
//   through their key ideas. The matched archetype is named —
//   italic, generous — with its short spirit phrase. A walking tour
//   of why this archetype (the dimensions you share, the runner-up,
//   the productive tensions). At the bottom: archetype essay,
//   retake, save/sign-up CTA."
//
// Server-rendered: vector decode + archetype match + similarity
// scoring all happens on the server. The client is only loaded for
// the save-on-mount side effect.

import type { Metadata, Viewport } from "next";
import Link from "next/link";
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
import { ConstellationMount } from "@/components/constellation-mount";
import { ResultSave } from "./result-save";

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

type SearchParams = Promise<{ v?: string; m?: string }>;

// Decode the base64-JSON vector from the URL. Returns a zero vector
// on any parse failure — the page renders the "not yet placed"
// fallback when magnitude is too low.
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

  // Sparse: the user skipped most of the quiz. Better to show the
  // empty state than match against noise.
  const sparse = magnitude(vector) < 2;

  if (sparse) {
    return <SparseFallback />;
  }

  // Rank archetypes by cosine similarity against the user's vector.
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
  const color = getArchetypeColor(top.archetype.key);

  // Three closest philosophers — same cosine projection. These
  // become the "people who stood near you" reveal at the top of
  // the walking tour.
  const closestPhilosophers = PHILOSOPHERS.map((p) => ({
    p,
    sim: cos(vector, p.vector),
  }))
    .sort((a, b) => b.sim - a.sim)
    .slice(0, 3);

  // Which of the user's top dimensions overlap with the archetype's
  // defining four? Drives the "you share X of the four" line.
  const archDefining = top.prototype
    .map((val, i) => ({ key: DIM_KEYS[i], v: val }))
    .sort((a, b) => b.v - a.v)
    .slice(0, 4)
    .map((d) => d.key);

  const userTop4 = vector
    .map((val, i) => ({ key: DIM_KEYS[i], v: val }))
    .sort((a, b) => b.v - a.v)
    .slice(0, 4)
    .map((d) => d.key);

  const sharedDims = archDefining.filter((k) =>
    userTop4.includes(k as DimKey),
  ) as DimKey[];

  // Pull the user's top 3 dimensions (regardless of shared status)
  // for the standalone "your strongest tendencies" callout.
  const userTop3 = vector
    .map((val, i) => ({ key: DIM_KEYS[i] as DimKey, v: val }))
    .filter((d) => d.v > 0)
    .sort((a, b) => b.v - a.v)
    .slice(0, 3);

  return (
    <main
      className="min-h-[100svh] bg-[#FAF6EC] text-[#221E18]"
      style={
        {
          ["--acc" as string]: color.primary,
          ["--acc-deep" as string]: color.deep,
          ["--acc-soft" as string]: color.soft,
          ["--acc-accent" as string]: color.accent,
        } as React.CSSProperties
      }
    >
      {/* Save-on-mount: POSTs to /api/quiz/save when authed, stashes
          to localStorage when guest. Returns null — purely a side
          effect. */}
      <ResultSave
        vector={vector}
        archetype={`The ${capitalize(top.archetype.key)}`}
        flavor={flavor || null}
        alignmentPct={alignmentPct}
        mode={mode}
      />

      {/* SiteNav (in app/layout.tsx) handles the top bar. */}

      {/* ─── Hero: "where you sit" ──────────────────────────────
          The archetype headline. Big Cormorant italic name with the
          flavor adjective in deep amber. Alignment percent below as
          a small caption. */}
      <section className="mx-auto max-w-[1100px] px-6 pt-20 pb-16 sm:px-10 sm:pt-28 md:pt-36">
        <div className="max-w-[800px]">
          <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.24em] text-[var(--acc-deep)]">
            <span className="h-px w-10 bg-[var(--acc-deep)] opacity-50" />
            <span>You sit closest to</span>
          </div>

          <h1
            className="mt-7 font-display text-[56px] leading-[0.95] tracking-tight text-[#221E18] sm:text-[88px] md:text-[104px]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            <span>The </span>
            {flavor ? (
              <em
                className="italic"
                style={{ color: color.deep, fontFamily: "var(--font-display)" }}
              >
                {flavor}{" "}
              </em>
            ) : null}
            <em
              className="italic"
              style={{ color: color.deep, fontFamily: "var(--font-display)" }}
            >
              {capitalize(top.archetype.key)}
            </em>
          </h1>

          <p className="mt-8 max-w-[640px] text-[18px] leading-[1.6] text-[#4A4338] sm:text-[20px]">
            {top.archetype.spirit}
          </p>

          <div className="mt-8 flex flex-wrap items-baseline gap-x-6 gap-y-2 text-[13px] text-[#8C6520]">
            <span className="flex items-baseline gap-2">
              <span
                aria-hidden
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: color.primary }}
              />
              <span className="uppercase tracking-[0.18em]">
                {alignmentPct}% alignment
              </span>
            </span>
            <span className="text-[#4A4338] opacity-70">
              Runner-up: The {capitalize(runnerUp.archetype.key)} ({runnerUpPct}%)
            </span>
          </div>
        </div>
      </section>

      {/* ─── The constellation, with YOU on it ─────────────────
          Centerpiece of the result. The user's point pulses; the
          rest of the cloud dims to make the highlight clear. */}
      <section className="border-y border-[#EBE3CA] bg-[#FFFCF4] px-6 py-16 sm:px-10 sm:py-20">
        <div className="mx-auto max-w-[1200px]">
          <div className="max-w-[760px]">
            <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.24em] text-[var(--acc-deep)]">
              <span className="h-px w-10 bg-[var(--acc-deep)] opacity-50" />
              <span>Where you sit</span>
            </div>
            <h2
              className="mt-5 font-display text-[32px] leading-tight text-[#221E18] sm:text-[44px]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              You on the map
            </h2>
            <p className="mt-5 max-w-[640px] text-[16px] leading-relaxed text-[#4A4338]">
              The dark point — that&rsquo;s you. The colored points
              nearby are the philosophers whose patterns most
              resemble yours. Hover any to read who they were.
            </p>
          </div>

          <div className="mt-10">
            <ConstellationMount
              userVector={vector}
              height={640}
              variant="interactive"
            />
          </div>

          <p className="mt-5 max-w-[640px] text-[13.5px] leading-relaxed text-[#8C6520]/80">
            The dark amber pulse is{" "}
            <span className="text-[#221E18]">you</span>. Drag to orbit,
            scroll to zoom. Hover any colored point to see who they were.
            Hide other archetypes from the legend to see who specifically
            sits near you.
          </p>
        </div>
      </section>

      {/* ─── The three closest philosophers ─────────────────────
          The "people who stood near you" beat. */}
      <section className="px-6 py-20 sm:px-10 sm:py-28">
        <div className="mx-auto max-w-[1100px]">
          <div className="max-w-[760px]">
            <div className="text-[11px] uppercase tracking-[0.24em] text-[var(--acc-deep)]">
              Stood near you
            </div>
            <h2
              className="mt-4 font-display text-[32px] leading-tight text-[#221E18] sm:text-[40px]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Three thinkers who held the world <em>your way</em>
            </h2>
            <p className="mt-5 max-w-[640px] text-[16px] leading-relaxed text-[#4A4338]">
              By cosine similarity against {PHILOSOPHERS.length} positioned
              philosophers. Not who you agree with — who held the world the
              way you do.
            </p>
          </div>

          <ul className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-[#D6CDB6] bg-[#D6CDB6] md:grid-cols-3">
            {closestPhilosophers.map(({ p }) => (
              <li key={p.name} className="flex flex-col gap-3 bg-[#FFFCF4] p-7">
                <div className="text-[11px] uppercase tracking-[0.2em] text-[var(--acc-deep)] opacity-80">
                  {p.dates}
                </div>
                <Link
                  href={`/philosopher/${encodeURIComponent(
                    p.name.toLowerCase().replace(/\s+/g, "-"),
                  )}`}
                  className="font-display text-[26px] leading-tight text-[#221E18] hover:text-[var(--acc-deep)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {p.name}
                </Link>
                <p className="text-[14.5px] leading-relaxed text-[#4A4338]">
                  &ldquo;{p.keyIdea}&rdquo;
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ─── Why this archetype ─────────────────────────────────
          Editorial breakdown — the dimensions you share, what they
          mean, the runner-up tension. */}
      <section className="mx-auto max-w-[820px] px-6 py-20 sm:px-10 sm:py-28">
        <div className="text-[11px] uppercase tracking-[0.24em] text-[var(--acc-deep)]">
          Why this archetype
        </div>
        <h2
          className="mt-4 font-display text-[32px] leading-tight text-[#221E18] sm:text-[40px]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          You match{" "}
          <em style={{ color: color.deep }}>{sharedDims.length}</em>{" "}
          of the four dimensions that define this orientation
        </h2>
        <p className="mt-6 text-[17px] leading-[1.65] text-[#221E18] sm:text-[19px]">
          {sharedDims.length >= 3
            ? `Which is why it came up on top. Your strongest tendencies overlap with three or more of the archetype's defining dims — that's a tight fit.`
            : sharedDims.length === 2
              ? `Your overall pattern is closest to this archetype, with related tendencies on the rest. A solid fit, not a perfect one.`
              : `Your overall pattern is closer to this archetype than to any other, even though no single dimension dominates the match.`}
        </p>

        <div className="mt-10">
          <div className="text-[11px] uppercase tracking-[0.2em] text-[#8C6520] opacity-80">
            Your strongest tendencies
          </div>
          <ul className="mt-4 flex flex-wrap gap-2">
            {userTop3.map((d) => (
              <li
                key={d.key}
                className="rounded-full border border-[#D6CDB6] bg-[#F8EDC8]/50 px-4 py-2 text-[13.5px] text-[#221E18]"
              >
                <span className="mr-2 font-mono text-[10.5px] uppercase tracking-wider text-[#8C6520]">
                  {d.key}
                </span>
                {DIM_NAMES[d.key]}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ─── What this orientation sees ─────────────────────────
          The archetype's editorial pull. */}
      <section className="border-t border-[#EBE3CA] px-6 py-20 sm:px-10 sm:py-28">
        <div className="mx-auto max-w-[820px]">
          <div className="text-[11px] uppercase tracking-[0.24em] text-[var(--acc-deep)]">
            What this orientation sees
          </div>
          <p
            className="mt-6 font-display text-[26px] leading-[1.4] text-[#221E18] sm:text-[32px]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {top.archetype.whatItGetsRight}
          </p>
          <div className="mt-12 text-[11px] uppercase tracking-[0.24em] text-[var(--acc-deep)]">
            Where it falters
          </div>
          <p className="mt-4 text-[17px] leading-[1.65] text-[#221E18] sm:text-[19px]">
            {top.archetype.whereItFalters}
          </p>
        </div>
      </section>

      {/* ─── Next steps ──────────────────────────────────────── */}
      <section className="mx-auto max-w-[1100px] px-6 pb-32 pt-20 sm:px-10 sm:pt-28">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Link
            href={`/archetype/${top.archetype.key}`}
            className="group flex flex-col gap-3 rounded-xl border-2 p-7 transition-all hover:shadow-[0_16px_40px_rgba(34,30,24,0.1)]"
            style={{
              borderColor: color.deep,
              backgroundColor: color.soft,
            }}
          >
            <div
              className="text-[11px] uppercase tracking-[0.22em]"
              style={{ color: color.deep }}
            >
              Read on
            </div>
            <div
              className="font-display text-[26px] leading-tight"
              style={{
                color: color.deep,
                fontFamily: "var(--font-display)",
              }}
            >
              The full essay on the {capitalize(top.archetype.key)}
            </div>
            <div
              className="mt-2 inline-flex items-center gap-2 text-[14px] font-medium transition-transform group-hover:translate-x-0.5"
              style={{ color: color.deep }}
            >
              <span>Open essay</span>
              <span>→</span>
            </div>
          </Link>

          <Link
            href="/quiz?mode=quick"
            className="group flex flex-col gap-3 rounded-xl border border-[#D6CDB6] bg-[#FFFCF4] p-7 transition-all hover:border-[#8C6520]/60 hover:shadow-[0_16px_40px_rgba(34,30,24,0.08)]"
          >
            <div className="text-[11px] uppercase tracking-[0.22em] text-[#8C6520]">
              Try again
            </div>
            <div
              className="font-display text-[26px] leading-tight text-[#221E18]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Retake the quiz
            </div>
            <p className="text-[14px] leading-relaxed text-[#4A4338]">
              The same questions; a fresh attempt. Useful when an
              answer surprised you the first time through.
            </p>
          </Link>

          <Link
            href="/signup"
            className="group flex flex-col gap-3 rounded-xl border border-[#D6CDB6] bg-[#FFFCF4] p-7 transition-all hover:border-[#8C6520]/60 hover:shadow-[0_16px_40px_rgba(34,30,24,0.08)]"
          >
            <div className="text-[11px] uppercase tracking-[0.22em] text-[#8C6520]">
              Save it
            </div>
            <div
              className="font-display text-[26px] leading-tight text-[#221E18]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Create an account
            </div>
            <p className="text-[14px] leading-relaxed text-[#4A4338]">
              Free. Tracks how your position shifts over time as you
              write dilemmas, diary entries, and reflections.
            </p>
          </Link>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-[#EBE3CA] px-6 py-8 sm:px-10">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-baseline justify-between gap-4 text-[12.5px] leading-relaxed text-[#8C6520]">
          <div className="opacity-90">
            <strong className="font-semibold text-[#221E18]">Mull</strong>
            {" · a passion project"}
          </div>
          <nav className="flex flex-wrap gap-5">
            <Link href="/about" className="underline decoration-[#B8862F]/40 underline-offset-2 hover:decoration-[#8C6520]">About</Link>
            <Link href="/methodology" className="underline decoration-[#B8862F]/40 underline-offset-2 hover:decoration-[#8C6520]">Methodology</Link>
            <Link href="/privacy" className="underline decoration-[#B8862F]/40 underline-offset-2 hover:decoration-[#8C6520]">Privacy</Link>
            <Link href="/terms" className="underline decoration-[#B8862F]/40 underline-offset-2 hover:decoration-[#8C6520]">Terms</Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}

// ─── Sparse-vector fallback ──────────────────────────────────
function SparseFallback() {
  return (
    <main className="min-h-[100svh] bg-[#FAF6EC] px-6 py-24 text-[#221E18] sm:px-10 sm:py-32">
      <div className="mx-auto max-w-[640px] text-center">
        <div className="text-[11px] uppercase tracking-[0.24em] text-[#8C6520]">
          Your result
        </div>
        <h1
          className="mt-6 font-display text-[48px] leading-[1.05] text-[#221E18] sm:text-[72px]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          <em>Not yet placed.</em>
        </h1>
        <p className="mx-auto mt-8 max-w-[480px] text-[17px] leading-[1.65] text-[#4A4338] sm:text-[19px]">
          You skipped most of the questions, which is honest. Mull
          would rather show you nothing than show you something fake.
          Take it again with answers that fit you, or browse the ten
          archetypes to see what you might be near.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-5">
          <Link
            href="/quiz?mode=quick"
            className="group inline-flex items-center gap-3 rounded-full bg-[#221E18] px-7 py-4 text-[15px] font-medium text-[#FAF6EC] hover:bg-[#8C6520]"
          >
            <span>Retake the quiz</span>
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </Link>
          <Link
            href="/archetype"
            className="text-[14px] text-[#4A4338] underline decoration-[#D6CDB6] decoration-1 underline-offset-4 hover:text-[#221E18] hover:decoration-[#8C6520]"
          >
            Browse the ten archetypes →
          </Link>
        </div>
      </div>
    </main>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
