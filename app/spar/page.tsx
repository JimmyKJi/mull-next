// /spar — Daily Spar landing.
//
// A 5-minute philosophical sparring match. One philosopher × one
// topic per day. You write one turn. The philosopher writes one
// back. A Sonnet judge calls it in 30 seconds. Designed as the
// fast on-ramp to argument practice — the user who doesn't have
// 20 minutes for full Arena but wants the rigor reps.
//
// Server renders today's challenge metadata; the client component
// (spar-client.tsx) handles the form + submission + result display.

import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { PixelPageHeader } from "@/components/pixel-window";
import { getDailySpar } from "@/lib/spar";
import SparClient from "./spar-client";

export const metadata: Metadata = {
  title: "Daily Spar · Mull",
  description:
    "One philosopher. One topic. One turn each. The judge calls it in 30 seconds. Today's spar refreshes at midnight UTC.",
  alternates: { canonical: "https://mull.world/spar" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";

export default function SparPage() {
  const today = getDailySpar();

  return (
    <main className="mx-auto max-w-[760px] px-6 pb-32 pt-10 sm:px-10">
      <PixelPageHeader
        eyebrow="▶ DAILY SPAR · 5 MIN"
        title="ONE TURN. ONE JUDGE."
        subtitle={
          <p
            className="text-[16px] italic"
            style={{ fontFamily: "var(--font-editorial)" }}
          >
            A philosopher. A topic. You get one turn. They get one
            turn. Sonnet calls it on rigor, principle, and engagement
            — not on whose side won. Refreshes daily at midnight UTC.
          </p>
        }
      />

      {/* Today's challenge banner — dark, urgent, the surface's hero. */}
      <div
        style={{
          marginBottom: 24,
          padding: "20px 22px",
          background: "#1A1612",
          color: "#F8EDC8",
          border: "4px solid #221E18",
          boxShadow: "5px 5px 0 0 #B8862F",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 12,
          }}
        >
          <span
            style={{
              fontFamily: pixel,
              fontSize: 10,
              color: "#F8C75E",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
            }}
          >
            ▶ TODAY · {today.dateKey}
          </span>
          <span
            style={{
              fontFamily: pixel,
              fontSize: 9,
              color: "#B8862F",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}
          >
            {today.philosopher.tier} TIER · ELO {today.philosopher.baseElo}
          </span>
        </div>
        <div
          style={{
            fontFamily: "var(--font-editorial)",
            fontSize: 22,
            color: "#F8EDC8",
            lineHeight: 1.3,
            margin: "0 0 10px",
          }}
        >
          <strong>You vs {today.philosopher.name}</strong>
          <span style={{ color: "#B8862F" }}> · </span>
          <em>&ldquo;{today.topic.title}&rdquo;</em>
        </div>
        <p
          style={{
            fontFamily: "var(--font-editorial)",
            fontSize: 15,
            color: "#E5DCC0",
            lineHeight: 1.55,
            margin: 0,
          }}
        >
          {today.topic.prompt}
        </p>
      </div>

      <SparClient
        philosopherName={today.philosopher.name}
        topicSlug={today.topic.slug}
        topicPrimer={today.topic.primer}
        dateKey={today.dateKey}
      />

      <p
        style={{
          marginTop: 26,
          fontFamily: "var(--font-editorial)",
          fontStyle: "italic",
          fontSize: 14,
          color: "#8C6520",
          lineHeight: 1.55,
        }}
      >
        Spar costs about 15¢ in AI fees per match. Daily cap of 3
        keeps it sustainable while Mull is free. If you want full
        multi-turn debates with Elo + leaderboard, head to{" "}
        <Link
          href="/arena"
          className="underline decoration-[#B8862F]/40 underline-offset-3 hover:decoration-[#8C6520]"
        >
          the Arena
        </Link>
        .
      </p>

      <p className="mt-10 text-center text-[13px] text-[#8C6520]">
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
