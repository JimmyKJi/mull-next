// /year — the always-updating annual page.
//
// Aggregates capability events + anthology entries + crucible
// reports + wandering responses by month. Shows "you've been most
// in X this year" headlines + a monthly heatmap.

import type { Metadata } from "next";
import Link from "next/link";
import { PixelPageHeader } from "@/components/pixel-window";
import YearView from "./year-view";

export const metadata: Metadata = {
  title: "Year-in-View · Mull",
  description:
    "Your year on Mull, always updating. Monthly skill drift, top moves, open questions.",
  alternates: { canonical: "https://mull.world/year" },
};

export default function YearPage() {
  return (
    <main className="mx-auto max-w-[860px] px-6 pb-32 pt-12 sm:px-10 sm:pt-16">
      <PixelPageHeader
        eyebrow={`▶ YEAR-IN-VIEW · ${new Date().getFullYear()}`}
        title="YOUR YEAR, ALWAYS UPDATING"
        subtitle={
          <p
            className="text-[16px] italic"
            style={{ fontFamily: "var(--font-editorial)" }}
          >
            Mull Wrapped freezes in December. This page updates the
            day you live it. Twelve months across, six skills down,
            the moves you&rsquo;ve made between.
          </p>
        }
      />
      <YearView />
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
