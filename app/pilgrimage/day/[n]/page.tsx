// /pilgrimage/day/[n] — one day in the pilgrimage.
//
// Server shell. The day's content is the same regardless of who's
// reading (each archetype has its own arc; we look up by the user's
// stored archetype on the client). The submission form + state
// management lives in PilgrimageDayClient.

import type { Metadata } from "next";
import Link from "next/link";
import { PixelPageHeader } from "@/components/pixel-window";
import { getServerLocale } from "@/lib/locale-server";
import { t } from "@/lib/translations";
import PilgrimageDayClient from "./day-client";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return {
    title: t("pilgrimage.day_meta_title", locale),
    robots: { index: false, follow: false },
  };
}

type Params = Promise<{ n: string }>;

export default async function PilgrimageDayPage({
  params,
}: {
  params: Params;
}) {
  const { n } = await params;
  const day = Math.max(1, Math.min(30, parseInt(n, 10) || 1));
  const locale = await getServerLocale();

  return (
    <main className="mx-auto max-w-[760px] px-6 pb-32 pt-12 sm:px-10 sm:pt-16">
      <PixelPageHeader
        eyebrow={t("pilgrimage.day_eyebrow", locale, {
          n: String(day).padStart(2, "0"),
        })}
        title={t("pilgrimage.day_header_title", locale)}
        subtitle={null}
      />
      <PilgrimageDayClient day={day} locale={locale} />
      <p className="mt-12 text-center text-[13px] text-[#8C6520]">
        <Link
          href="/pilgrimage"
          className="underline decoration-[#B8862F]/40 underline-offset-3 hover:decoration-[#8C6520]"
        >
          {t("pilgrimage.back_pilgrimage", locale)}
        </Link>
      </p>
    </main>
  );
}
