// /anthology — your commonplace book.

import type { Metadata } from "next";
import Link from "next/link";
import { PixelPageHeader } from "@/components/pixel-window";
import AnthologyView from "./anthology-view";

export const metadata: Metadata = {
  title: "Personal Anthology · Mull",
  description:
    "Your saved passages, quotes, and exchanges. A commonplace book that fills as you use Mull.",
  alternates: { canonical: "https://mull.world/anthology" },
};

export default function AnthologyPage() {
  return (
    <main className="mx-auto max-w-[860px] px-6 pb-32 pt-12 sm:px-10 sm:pt-16">
      <PixelPageHeader
        eyebrow="▶ PERSONAL ANTHOLOGY"
        title="YOUR COMMONPLACE BOOK"
        subtitle={
          <p
            className="text-[16px] italic"
            style={{ fontFamily: "var(--font-editorial)" }}
          >
            Save passages, verdicts, and exchanges from any Mull
            surface — they accrue here. Over months it becomes a
            picture of what you&rsquo;ve actually been thinking about.
          </p>
        }
      />
      <AnthologyView />
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
