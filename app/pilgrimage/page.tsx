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
import { getServerLocale } from "@/lib/locale-server";
import { t } from "@/lib/translations";
import { PilgrimageLanding } from "./pilgrimage-landing";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return {
    title: t("pilgrimage.meta_title", locale),
    description: t("pilgrimage.meta_desc", locale),
    alternates: { canonical: "https://mull.world/pilgrimage" },
  };
}

export default async function PilgrimagePage() {
  const locale = await getServerLocale();
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
        eyebrow={t("pilgrimage.header_eyebrow", locale)}
        title={t("pilgrimage.header_title", locale)}
        subtitle={
          <p
            className="text-[16px] italic"
            style={{ fontFamily: "var(--font-editorial)" }}
          >
            {t("pilgrimage.header_subtitle", locale)}
          </p>
        }
      />

      <PilgrimageLanding
        initialArchetype={initialArchetype}
        initialFlavor={initialFlavor}
        locale={locale}
      />

      <p className="mt-12 text-center text-[13px] text-[#8C6520]">
        <Link
          href="/"
          className="underline decoration-[#B8862F]/40 underline-offset-3 hover:decoration-[#8C6520]"
        >
          {t("pilgrimage.back_mull", locale)}
        </Link>
      </p>
    </main>
  );
}
