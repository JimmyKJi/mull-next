// /argument-diary — log a real disagreement, get a structured
// response (steelman + fallacies + kindred philosophers).

import type { Metadata } from "next";
import Link from "next/link";
import { PixelPageHeader } from "@/components/pixel-window";
import { getServerLocale } from "@/lib/locale-server";
import { t } from "@/lib/translations";
import ArgumentDiaryClient from "./argument-diary-client";

export const metadata: Metadata = {
  title: "Argument Diary · Mull",
  description:
    "Log a real argument you had. Get a steelman of the other side, fallacy spotting on your own framing, and three kindred philosophers' takes.",
  alternates: { canonical: "https://mull.world/argument-diary" },
};

export default async function ArgumentDiaryPage() {
  const locale = await getServerLocale();
  return (
    <main className="mx-auto max-w-[820px] px-6 pb-32 pt-12 sm:px-10 sm:pt-16">
      <PixelPageHeader
        eyebrow={t("argdiary.eyebrow", locale)}
        title={t("argdiary.title", locale)}
        subtitle={
          <p
            className="text-[16px] italic"
            style={{ fontFamily: "var(--font-editorial)" }}
          >
            {t("argdiary.subtitle", locale)}
          </p>
        }
      />
      <ArgumentDiaryClient locale={locale} />
      <p className="mt-12 text-center text-[13px] text-acc-deep">
        <Link
          href="/"
          className="underline decoration-acc/40 underline-offset-3 hover:decoration-acc-deep"
        >
          {t("pilgrimage.back_mull", locale)}
        </Link>
      </p>
    </main>
  );
}
