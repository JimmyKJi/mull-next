// /read — The Reading Hour (S13). Coming soon scaffold.

import type { Metadata } from "next";
import Link from "next/link";
import { PixelPageHeader } from "@/components/pixel-window";
import ComingSoonCard from "@/components/coming-soon-card";
import { getServerLocale } from "@/lib/locale-server";
import { t } from "@/lib/translations";

export const metadata: Metadata = {
  title: "The Reading Hour · Mull",
  description:
    "A 60-minute timer-bound reading session with a primary text Mull picks for you. Coming soon.",
  alternates: { canonical: "https://mull.world/read" },
};

export default async function ReadingHourPage() {
  const locale = await getServerLocale();
  return (
    <main className="mx-auto max-w-[820px] px-6 pb-32 pt-12 sm:px-10 sm:pt-16">
      <PixelPageHeader
        eyebrow={t("rd.header_eyebrow", locale)}
        title={t("rd.header_title", locale)}
        subtitle={null}
      />
      <ComingSoonCard
        locale={locale}
        eyebrow={t("rd.card_eyebrow", locale)}
        title={t("rd.card_title", locale)}
        pitch={t("rd.pitch", locale)}
        doing={[
          t("rd.doing_1", locale),
          t("rd.doing_2", locale),
          t("rd.doing_3", locale),
          t("rd.doing_4", locale),
        ]}
        when={t("rd.when", locale)}
        accent={{ primary: "#3D6FA5", deep: "#0F2236", soft: "#E0E8F0" }}
        meantime={{ href: "/pilgrimage", label: t("rd.meantime", locale) }}
      />
      <p className="mt-12 text-center text-[13px] text-acc-deep">
        <Link
          href="/"
          className="underline decoration-acc/40 underline-offset-3 hover:decoration-acc-deep"
        >
          {t("rd.back", locale)}
        </Link>
      </p>
    </main>
  );
}
