// /atlas — the Capability Atlas.
//
// The user's "stats page" — six skill bars, levels, totals, a recent-
// event log, a streak counter. Every retention surface in Mull fires
// events into this. Returning users come here to see their growth
// in one place.
//
// Server shell hands to the client component which reads localStorage.

import type { Metadata } from "next";
import Link from "next/link";
import { PixelPageHeader } from "@/components/pixel-window";
import AtlasView from "./atlas-view";

export const metadata: Metadata = {
  title: "Capability Atlas · Mull",
  description:
    "Your six skills, growing across everything you do on Mull — Rigor, Depth, Consistency, Range, Self-Awareness, Synthesis.",
  alternates: { canonical: "https://mull.world/atlas" },
};

export default function AtlasPage() {
  return (
    <main className="mx-auto max-w-[860px] px-6 pb-32 pt-12 sm:px-10 sm:pt-16">
      <PixelPageHeader
        eyebrow="▶ THE CAPABILITY ATLAS"
        title="WHAT YOU'RE GETTING BETTER AT"
        subtitle={
          <p
            className="text-[16px] italic"
            style={{ fontFamily: "var(--font-editorial)" }}
          >
            Six skills, six bars. Every Spar, every Pilgrimage day,
            every Crucible kept, every Dilemma answered — moves at
            least one of these. Don&rsquo;t grind for the bars; the
            bars are honest about your actual practice.
          </p>
        }
      />
      <AtlasView />
      <p className="mt-12 text-center text-[13px] text-[#8C6520]">
        <Link
          href="/"
          className="underline decoration-[#B8862F]/40 underline-offset-3 hover:decoration-[#8C6520]"
        >
          ← Back to Mull
        </Link>
      </p>
    </main>
  );
}
