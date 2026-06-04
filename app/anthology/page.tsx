// /anthology — your commonplace book.

import type { Metadata } from "next";
import Link from "next/link";
import { PixelPageHeader } from "@/components/pixel-window";
import { getServerLocale } from "@/lib/locale-server";
import { t } from "@/lib/translations";
import AnthologyView from "./anthology-view";

export const metadata: Metadata = {
  title: "Personal Anthology · Mull",
  description:
    "Your saved passages, quotes, and exchanges. A commonplace book that fills as you use Mull.",
  alternates: { canonical: "https://mull.world/anthology" },
};

export default async function AnthologyPage() {
  const locale = await getServerLocale();
  return (
    <main className="mx-auto max-w-[860px] px-6 pb-32 pt-12 sm:px-10 sm:pt-16">
      <PixelPageHeader
        eyebrow={t("anthology.eyebrow", locale)}
        title={t("anthology.title", locale)}
        subtitle={
          <p
            className="text-[16px] italic"
            style={{ fontFamily: "var(--font-editorial)" }}
          >
            {t("anthology.subtitle", locale)}
          </p>
        }
      />
      <AnthologyView locale={locale} />
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
