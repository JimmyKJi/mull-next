// /year — the always-updating annual page.
//
// Aggregates capability events + anthology entries + crucible
// reports + wandering responses by month. Shows "you've been most
// in X this year" headlines + a monthly heatmap.

import type { Metadata } from "next";
import Link from "next/link";
import { PixelPageHeader } from "@/components/pixel-window";
import { getServerLocale } from "@/lib/locale-server";
import { t } from "@/lib/translations";
import YearView from "./year-view";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return {
    title: t("yr.meta_title", locale),
    description: t("yr.meta_description", locale),
    alternates: { canonical: "https://mull.world/year" },
  };
}

export default async function YearPage() {
  const locale = await getServerLocale();
  return (
    <main className="mx-auto max-w-[860px] px-6 pb-32 pt-12 sm:px-10 sm:pt-16">
      <PixelPageHeader
        eyebrow={t("yr.eyebrow", locale, { year: new Date().getFullYear() })}
        title={t("yr.title", locale)}
        subtitle={
          <p
            className="text-[16px] italic"
            style={{ fontFamily: "var(--font-editorial)" }}
          >
            {t("yr.subtitle", locale)}
          </p>
        }
      />
      <YearView locale={locale} />
      <p className="mt-12 text-center text-[13px] text-[#8C6520]">
        <Link
          href="/"
          className="underline decoration-[#B8862F]/40 underline-offset-3 hover:decoration-[#8C6520]"
        >
          ← {t("yr.back_to_mull", locale)}
        </Link>
      </p>
    </main>
  );
}
