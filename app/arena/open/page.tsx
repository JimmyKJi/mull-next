// /arena/open — Mull Open (S16). Quarterly PvP tournament. Coming soon.

import type { Metadata } from "next";
import Link from "next/link";
import { PixelPageHeader } from "@/components/pixel-window";
import ComingSoonCard from "@/components/coming-soon-card";

export const metadata: Metadata = {
  title: "Mull Open · Quarterly Tournament",
  description:
    "A quarterly PvP Arena tournament with brackets, seeding, and spectator finals. Coming soon.",
  alternates: { canonical: "https://mull.world/arena/open" },
};

export default function MullOpenPage() {
  return (
    <main className="mx-auto max-w-[820px] px-6 pb-32 pt-12 sm:px-10 sm:pt-16">
      <PixelPageHeader
        eyebrow="▶ MULL OPEN · QUARTERLY · BUILDING"
        title="THE QUARTERLY TOURNAMENT"
        subtitle={null}
      />
      <ComingSoonCard
        eyebrow="MULL OPEN · BUILDING"
        title="A real tournament with brackets"
        pitch="Once a quarter, the Arena gets a season-cap event. Top 16 PvP players from the season's leaderboard get seeded; the rest enter via a play-in qualifier. Single-elimination brackets, three judged rounds, finals spectator-viewable with the judge's verdict broken out by round. Annual champion gets a permanent badge and a featured kindred-minds page."
        doing={[
          "Quarterly schedule (Q1/Q2/Q3/Q4) with a 7-day play-in and a 7-day bracket.",
          "Brackets visible to all signed-in users.",
          "Finals are spectator-viewable — read the debates as they happen.",
          "Drops into /atlas as Rigor + Depth + Consistency XP for participants.",
        ]}
        when="Building now. Needs tournament + bracket infra. Earliest ship: Q4 2026. Will launch when the PvP user base hits a threshold to make brackets meaningful."
        accent={{ primary: "#C7522A", deep: "#8C3717", soft: "#F5DCD0" }}
        meantime={{ href: "/arena", label: "Climb the Arena Elo ladder — that's what'll seed you when the Open opens." }}
      />
      <p className="mt-12 text-center text-[13px] text-[#8C6520]">
        <Link
          href="/arena"
          className="underline decoration-[#B8862F]/40 underline-offset-3 hover:decoration-[#8C6520]"
        >
          ← Back to the Arena
        </Link>
      </p>
    </main>
  );
}
