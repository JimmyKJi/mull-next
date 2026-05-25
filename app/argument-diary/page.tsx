// /argument-diary — log a real disagreement, get a structured
// response (steelman + fallacies + kindred philosophers).

import type { Metadata } from "next";
import Link from "next/link";
import { PixelPageHeader } from "@/components/pixel-window";
import ArgumentDiaryClient from "./argument-diary-client";

export const metadata: Metadata = {
  title: "Argument Diary · Mull",
  description:
    "Log a real argument you had. Get a steelman of the other side, fallacy spotting on your own framing, and three kindred philosophers' takes.",
  alternates: { canonical: "https://mull.world/argument-diary" },
};

export default function ArgumentDiaryPage() {
  return (
    <main className="mx-auto max-w-[820px] px-6 pb-32 pt-12 sm:px-10 sm:pt-16">
      <PixelPageHeader
        eyebrow="▶ ARGUMENT DIARY"
        title="LOG IT. GET FEEDBACK."
        subtitle={
          <p
            className="text-[16px] italic"
            style={{ fontFamily: "var(--font-editorial)" }}
          >
            When you have a real argument with someone, write a short
            account here. Mull steelmans the other side, identifies
            two fallacies in your framing, and pulls three kindred
            philosophers&rsquo; takes. Honest feedback, not therapy.
          </p>
        }
      />
      <ArgumentDiaryClient />
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
