// /pilgrimage — landing page.
//
// Three states the client component resolves:
//   1. Not enrolled, no quiz taken — prompt to take the quiz.
//   2. Not enrolled, quiz taken — show "begin your pilgrimage" CTA
//      with the archetype-tuned welcome lens.
//   3. Enrolled — show progress (Day X of 30), the current day's
//      title, link to today's prompt, recent completed days.

import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { PixelPageHeader } from "@/components/pixel-window";
import { PilgrimageLanding } from "./pilgrimage-landing";

export const metadata: Metadata = {
  title: "The Pilgrimage · Mull",
  description:
    "A 30-day course personalized to your philosophical archetype. Daily prompts, slow drift, real momentum.",
  alternates: { canonical: "https://mull.world/pilgrimage" },
};

export default async function PilgrimagePage() {
  // Server-side: try to pull the user's latest quiz attempt for the
  // initial render. Client can also fall back to localStorage for
  // anonymous users with a stashed pending quiz.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let initialArchetype: string | null = null;
  let initialFlavor: string | null = null;
  if (user) {
    const { data } = await supabase
      .from("quiz_attempts")
      .select("archetype, flavor")
      .eq("user_id", user.id)
      .order("taken_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data) {
      initialArchetype =
        typeof data.archetype === "string"
          ? data.archetype
              .replace(/^The\s+/i, "")
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-+|-+$/g, "")
          : null;
      initialFlavor = (data.flavor as string | null) ?? null;
    }
  }

  return (
    <main className="mx-auto max-w-[820px] px-6 pb-32 pt-12 sm:px-10 sm:pt-16">
      <PixelPageHeader
        eyebrow="▶ THE PILGRIMAGE · 30 DAYS"
        title="A 30-DAY COURSE FOR YOU"
        subtitle={
          <p
            className="text-[16px] italic"
            style={{ fontFamily: "var(--font-editorial)" }}
          >
            Most reflection apps give the same prompts to everyone.
            This one gives you an arc shaped for your archetype, with
            a lens tuned to your secondary flavor. Thirty days of
            daily prompts that move with you — and a visible chart
            of how your map shifts across them.
          </p>
        }
      />

      <PilgrimageLanding
        initialArchetype={initialArchetype}
        initialFlavor={initialFlavor}
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
