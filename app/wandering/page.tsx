// /wandering — this week's wandering question + the 4-beat arc.

import type { Metadata } from "next";
import Link from "next/link";
import { PixelPageHeader } from "@/components/pixel-window";
import { getThisWeeksQuestion } from "@/lib/wandering";
import { getServerLocale } from "@/lib/locale-server";
import { t } from "@/lib/translations";
import WanderingClient from "./wandering-client";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return {
    title: t("wndr.meta_title", locale),
    description: t("wndr.meta_description", locale),
    alternates: { canonical: "https://mull.world/wandering" },
  };
}

export default async function WanderingPage() {
  const locale = await getServerLocale();
  const q = getThisWeeksQuestion();
  return (
    <main className="mx-auto max-w-[760px] px-6 pb-32 pt-12 sm:px-10 sm:pt-16">
      <PixelPageHeader
        eyebrow={t("wndr.eyebrow", locale, { week: q.week })}
        title={t("wndr.title", locale)}
        subtitle={
          <p
            className="text-[16px] italic"
            style={{ fontFamily: "var(--font-editorial)" }}
          >
            {t("wndr.subtitle", locale)}
          </p>
        }
      />
      <WanderingClient question={q} locale={locale} />
      <p className="mt-12 text-center text-[13px] text-[#8C6520]">
        <Link
          href="/"
          className="underline decoration-[#B8862F]/40 underline-offset-3 hover:decoration-[#8C6520]"
        >
          ← {t("wndr.back_to_mull", locale)}
        </Link>
      </p>
    </main>
  );
}
