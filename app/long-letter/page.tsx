// /long-letter — The Long Letter (S20). Coming soon scaffold.

import type { Metadata } from "next";
import Link from "next/link";
import { PixelPageHeader } from "@/components/pixel-window";
import ComingSoonCard from "@/components/coming-soon-card";

export const metadata: Metadata = {
  title: "The Long Letter · Mull",
  description:
    "Once a year, write 2,000+ words on something specifically hard. Mull saves it. Five years later: resurfaces it. Coming soon.",
  alternates: { canonical: "https://mull.world/long-letter" },
};

export default function LongLetterPage() {
  return (
    <main className="mx-auto max-w-[820px] px-6 pb-32 pt-12 sm:px-10 sm:pt-16">
      <PixelPageHeader
        eyebrow="▶ THE LONG LETTER · ONE PER YEAR"
        title="WRITE 2,000 WORDS. WE'LL HOLD IT."
        subtitle={null}
      />
      <ComingSoonCard
        eyebrow="THE LONG LETTER · BUILDING"
        title="The slowest retention feature on Mull"
        pitch="Once a year (or once per major life event), Mull invites you to write a long letter — 2,000+ words — about something specifically hard. Mull provides scaffolding (an outline tuned to your archetype) and saves it to a vault only you can read. Five years later, Mull surfaces the letter for re-reading. The five-year resurfacing IS the loop."
        doing={[
          "Once-yearly invitation, on a date you choose, with an archetype-tuned outline.",
          "Long-form composition surface (no rich text — just plain serif, focused).",
          "Vaulted: only you can read it. Not backed up to research even if you've opted in.",
          "Five years later, Mull surfaces it: 'You wrote this. Here is who you were.' The most permanent dopamine loop on Mull.",
        ]}
        when="Building now. Lowest priority because the payoff is 5 years out — but the most distinctive retention idea on the roadmap. Earliest ship: Q4 2026."
        accent={{ primary: "#B8862F", deep: "#5C4528", soft: "#FBF6E8" }}
        meantime={{ href: "/diary", label: "The Diary is the daily-ish version. Start writing — the rhythm is the practice." }}
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
