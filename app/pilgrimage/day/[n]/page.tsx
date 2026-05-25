// /pilgrimage/day/[n] — one day in the pilgrimage.
//
// Server shell. The day's content is the same regardless of who's
// reading (each archetype has its own arc; we look up by the user's
// stored archetype on the client). The submission form + state
// management lives in PilgrimageDayClient.

import type { Metadata } from "next";
import Link from "next/link";
import { PixelPageHeader } from "@/components/pixel-window";
import PilgrimageDayClient from "./day-client";

export const metadata: Metadata = {
  title: "Pilgrimage · Day · Mull",
  robots: { index: false, follow: false },
};

type Params = Promise<{ n: string }>;

export default async function PilgrimageDayPage({
  params,
}: {
  params: Params;
}) {
  const { n } = await params;
  const day = Math.max(1, Math.min(30, parseInt(n, 10) || 1));

  return (
    <main className="mx-auto max-w-[760px] px-6 pb-32 pt-12 sm:px-10 sm:pt-16">
      <PixelPageHeader
        eyebrow={`▶ THE PILGRIMAGE · DAY ${String(day).padStart(2, "0")} OF 30`}
        title="ONE PROMPT"
        subtitle={null}
      />
      <PilgrimageDayClient day={day} />
      <p className="mt-12 text-center text-[13px] text-[#8C6520]">
        <Link
          href="/pilgrimage"
          className="underline decoration-[#B8862F]/40 underline-offset-3 hover:decoration-[#8C6520]"
        >
          ← Back to the pilgrimage
        </Link>
      </p>
    </main>
  );
}
