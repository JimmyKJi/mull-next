// /read — The Reading Hour (S13). Coming soon scaffold.

import type { Metadata } from "next";
import Link from "next/link";
import { PixelPageHeader } from "@/components/pixel-window";
import ComingSoonCard from "@/components/coming-soon-card";

export const metadata: Metadata = {
  title: "The Reading Hour · Mull",
  description:
    "A 60-minute timer-bound reading session with a primary text Mull picks for you. Coming soon.",
  alternates: { canonical: "https://mull.world/read" },
};

export default function ReadingHourPage() {
  return (
    <main className="mx-auto max-w-[820px] px-6 pb-32 pt-12 sm:px-10 sm:pt-16">
      <PixelPageHeader
        eyebrow="▶ THE READING HOUR · BUILDING"
        title="ONE HOUR. ONE TEXT. FIVE PROMPTS."
        subtitle={null}
      />
      <ComingSoonCard
        eyebrow="THE READING HOUR · BUILDING"
        title="An hour with a primary text"
        pitch="A 60-minute reading session with a primary text Mull picks for you — chosen from your nearest philosophers. Five prompts fire at intervals during the hour (Pomodoro-style, but for thinking). Brief synthesis at the end you can save to your anthology."
        doing={[
          "Mull picks a passage of the right length from a thinker close to you.",
          "Five prompts space out across the hour: notice the question, define a term, find the move, steelman one objection, write the line you'd remember.",
          "End-of-hour: a short synthesis form, with three sentences of yours and a kindred quote.",
          "Drops into your /atlas as Range + Depth XP.",
        ]}
        when="Building now. Earliest ship: Q3 2026. Needs ~80 hand-picked text excerpts before it can launch with substance."
        accent={{ primary: "#3D6FA5", deep: "#0F2236", soft: "#E0E8F0" }}
        meantime={{ href: "/pilgrimage", label: "The Pilgrimage gives you a 30-day reading-shaped arc tuned to your archetype." }}
      />
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
