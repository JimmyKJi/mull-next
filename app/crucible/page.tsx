// /crucible — daily action commitment + tomorrow's check-in.

import type { Metadata } from "next";
import Link from "next/link";
import { PixelPageHeader } from "@/components/pixel-window";
import { getTodaysCrucible, getYesterdaysCrucible } from "@/lib/crucible";
import CrucibleClient from "./crucible-client";

export const metadata: Metadata = {
  title: "The Crucible · Mull",
  description:
    "One real action a day. Commit today, report tomorrow. Stoic evening-review meets daily moral practice.",
  alternates: { canonical: "https://mull.world/crucible" },
};

export default function CruciblePage() {
  const today = getTodaysCrucible();
  const yesterday = getYesterdaysCrucible();
  const todayKey = new Date().toISOString().slice(0, 10);
  const yesterdayKey = (() => {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - 1);
    return d.toISOString().slice(0, 10);
  })();

  return (
    <main className="mx-auto max-w-[760px] px-6 pb-32 pt-12 sm:px-10 sm:pt-16">
      <PixelPageHeader
        eyebrow="▶ THE CRUCIBLE · DAILY ACTION"
        title="COMMIT TODAY. REPORT TOMORROW."
        subtitle={
          <p
            className="text-[16px] italic"
            style={{ fontFamily: "var(--font-editorial)" }}
          >
            Different from the dilemma — this isn&rsquo;t a hypothetical.
            It&rsquo;s a real small thing to do today. Tomorrow Mull
            will ask how it went. Stoic evening-review, modern shape.
          </p>
        }
      />
      <CrucibleClient
        today={today}
        yesterday={yesterday}
        todayKey={todayKey}
        yesterdayKey={yesterdayKey}
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
