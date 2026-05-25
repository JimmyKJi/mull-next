// /wandering — this week's wandering question + the 4-beat arc.

import type { Metadata } from "next";
import Link from "next/link";
import { PixelPageHeader } from "@/components/pixel-window";
import { getThisWeeksQuestion } from "@/lib/wandering";
import WanderingClient from "./wandering-client";

export const metadata: Metadata = {
  title: "The Wandering Question · Mull",
  description:
    "A single question travels with you across a week. Monday: start. Wednesday: kindred. Friday: far. Sunday: synthesis.",
  alternates: { canonical: "https://mull.world/wandering" },
};

export default function WanderingPage() {
  const q = getThisWeeksQuestion();
  return (
    <main className="mx-auto max-w-[760px] px-6 pb-32 pt-12 sm:px-10 sm:pt-16">
      <PixelPageHeader
        eyebrow={`▶ THE WANDERING QUESTION · WEEK ${q.week}`}
        title="ONE QUESTION. ONE WEEK."
        subtitle={
          <p
            className="text-[16px] italic"
            style={{ fontFamily: "var(--font-editorial)" }}
          >
            Different from the dilemma: not a one-shot. A question
            you carry from Monday to Sunday. Mull surfaces it on four
            beats across the week and helps you synthesize at the end.
          </p>
        }
      />
      <WanderingClient question={q} />
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
