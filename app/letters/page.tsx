// /letters — Letters Between Inheritors (S14). Coming soon scaffold.

import type { Metadata } from "next";
import Link from "next/link";
import { PixelPageHeader } from "@/components/pixel-window";
import ComingSoonCard from "@/components/coming-soon-card";

export const metadata: Metadata = {
  title: "Letters · Mull",
  description:
    "Structured letters that follow the Inheritor's archetype-keyed task at +1 week, +1 month, +3 months. Coming soon.",
  alternates: { canonical: "https://mull.world/letters" },
};

export default function LettersPage() {
  return (
    <main className="mx-auto max-w-[820px] px-6 pb-32 pt-12 sm:px-10 sm:pt-16">
      <PixelPageHeader
        eyebrow="▶ LETTERS BETWEEN INHERITORS · BUILDING"
        title="A CORRESPONDENCE WITH THE DECEASED"
        subtitle={null}
      />
      <ComingSoonCard
        eyebrow="LETTERS BETWEEN INHERITORS · BUILDING"
        title="The Inheritor mystery, continued"
        pitch="If you finished the Inheritor, you got an archetype-keyed task from the deceased — visit the daughter, take the steamship ticket, publish the rival's letter. This surface extends the mystery: structured letters arrive in your inbox at +1 week, +1 month, +3 months, asking what you've done with the task. You write back. The deceased writes back to you."
        doing={[
          "Opt-in after you finish the Inheritor. Mull schedules the first letter for +7 days.",
          "Each letter is in-fiction (the deceased writing) and personal (refers to your specific task and ending).",
          "Your replies persist as a private correspondence — readable only by you.",
          "Drops into /atlas as Depth + Self-Awareness XP.",
        ]}
        when="Building now. Needs Resend cron + persistent conversation state. Earliest ship: Q3 2026."
        accent={{ primary: "#9067B0", deep: "#3F2454", soft: "#E8DCF0" }}
        meantime={{ href: "/quiz/journey", label: "Take or re-take the Inheritor murder mystery." }}
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
