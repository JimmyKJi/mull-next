// /crucible — daily action commitment + tomorrow's check-in.

import type { Metadata } from "next";
import Link from "next/link";
import { PixelPageHeader } from "@/components/pixel-window";
import { getTodaysCrucible, getYesterdaysCrucible } from "@/lib/crucible";
import { getServerLocale } from "@/lib/locale-server";
import { t } from "@/lib/translations";
import CrucibleClient from "./crucible-client";

export const metadata: Metadata = {
  title: "The Crucible · Mull",
  description:
    "One real action a day. Commit today, report tomorrow. Stoic evening-review meets daily moral practice.",
  alternates: { canonical: "https://mull.world/crucible" },
};

export default async function CruciblePage() {
  const locale = await getServerLocale();
  const today = getTodaysCrucible();
  const yesterday = getYesterdaysCrucible();
  const todayKey = new Date().toISOString().slice(0, 10);
  const yesterdayKey = (() => {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - 1);
    return d.toISOString().slice(0, 10);
  })();

  return (
    <main className="mx-auto max-w-[760px] px-6 pb-32 pt-12 sm:px-10 sm:pt-16">
      <PixelPageHeader
        eyebrow={t("crucible.eyebrow", locale)}
        title={t("crucible.title", locale)}
        subtitle={
          <p
            className="text-[16px] italic"
            style={{ fontFamily: "var(--font-editorial)" }}
          >
            {t("crucible.subtitle", locale)}
          </p>
        }
      />
      <CrucibleClient
        today={today}
        yesterday={yesterday}
        todayKey={todayKey}
        yesterdayKey={yesterdayKey}
        locale={locale}
      />
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
