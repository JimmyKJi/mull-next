// /spar — Daily Spar landing.
//
// A 5-minute philosophical sparring match. One philosopher × one
// topic per day. You write one turn. The philosopher writes one
// back. A Sonnet judge calls it in 30 seconds. Designed as the
// fast on-ramp to argument practice — the user who doesn't have
// 20 minutes for full Arena but wants the rigor reps.
//
// Server renders today's challenge metadata; the client component
// (spar-client.tsx) handles the form + submission + result display.

import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { PixelPageHeader } from "@/components/pixel-window";
import { getDailySpar } from "@/lib/spar";
import { localizeArenaPhilosopherName } from "@/lib/arena/data";
import { localizeArenaTopic } from "@/lib/arena/topics-i18n";
import { getServerLocale } from "@/lib/locale-server";
import { t } from "@/lib/translations";
import SparClient from "./spar-client";

export const metadata: Metadata = {
  title: "Daily Spar · Mull",
  description:
    "One philosopher. One topic. One turn each. The judge calls it in 30 seconds. Today's spar refreshes at midnight UTC.",
  alternates: { canonical: "https://mull.world/spar" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";

export default async function SparPage() {
  const locale = await getServerLocale();
  const today = getDailySpar();
  // English name/slug stay the API lookup keys; localized values are
  // for display only.
  const topic = localizeArenaTopic(today.topic, locale);
  const philosopherName = today.philosopher.name;
  const philosopherDisplay = localizeArenaPhilosopherName(philosopherName, locale);
  const tierLabel = t(`spar.tier.${today.philosopher.tier}`, locale);

  return (
    <main className="mx-auto max-w-[760px] px-6 pb-32 pt-10 sm:px-10">
      <PixelPageHeader
        eyebrow={t("spar.eyebrow", locale)}
        title={t("spar.title", locale)}
        subtitle={
          <p
            className="text-[16px] italic"
            style={{ fontFamily: "var(--font-editorial)" }}
          >
            {t("spar.subtitle", locale)}
          </p>
        }
      />

      {/* Today's challenge banner — dark, urgent, the surface's hero. */}
      <div
        style={{
          marginBottom: 24,
          padding: "20px 22px",
          background: "#1A1612",
          color: "var(--color-acc-soft)",
          border: "4px solid var(--color-ink)",
          boxShadow: "5px 5px 0 0 var(--color-acc)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 12,
          }}
        >
          <span
            style={{
              fontFamily: pixel,
              fontSize: 10,
              color: "#F8C75E",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
            }}
          >
            {t("spar.today", locale, { date: today.dateKey })}
          </span>
          <span
            style={{
              fontFamily: pixel,
              fontSize: 9,
              color: "var(--color-acc)",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}
          >
            {t("spar.tier_line", locale, {
              tier: tierLabel,
              elo: today.philosopher.baseElo,
            })}
          </span>
        </div>
        <div
          style={{
            fontFamily: "var(--font-editorial)",
            fontSize: 22,
            color: "var(--color-acc-soft)",
            lineHeight: 1.3,
            margin: "0 0 10px",
          }}
        >
          <strong>{t("spar.vs", locale, { name: philosopherDisplay })}</strong>
          <span style={{ color: "var(--color-acc)" }}> · </span>
          <em>&ldquo;{topic.title}&rdquo;</em>
        </div>
        <p
          style={{
            fontFamily: "var(--font-editorial)",
            fontSize: 15,
            color: "#E5DCC0",
            lineHeight: 1.55,
            margin: 0,
          }}
        >
          {topic.prompt}
        </p>
      </div>

      <SparClient
        philosopherName={philosopherName}
        philosopherDisplay={philosopherDisplay}
        topicSlug={topic.slug}
        topicPrimer={topic.primer}
        dateKey={today.dateKey}
        locale={locale}
      />

      <p
        style={{
          marginTop: 26,
          fontFamily: "var(--font-editorial)",
          fontStyle: "italic",
          fontSize: 14,
          color: "var(--color-acc-deep)",
          lineHeight: 1.55,
        }}
      >
        {t("spar.cost_prefix", locale)}
        <Link
          href="/arena"
          className="underline decoration-acc/40 underline-offset-3 hover:decoration-acc-deep"
        >
          {t("spar.the_arena", locale)}
        </Link>
        {locale === "zh" ? "。" : "."}
      </p>

      <p className="mt-10 text-center text-[13px] text-acc-deep">
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
