// /consent — the long-form explanation of Mull's research-data
// policy + a toggle so users can change their consent any time.
//
// The short version is captured in <ResearchConsentGate> before the
// quiz. This page is for the user who wants to read the full thing,
// or who wants to revisit their decision later.

import type { Metadata } from "next";
import Link from "next/link";
import { PixelWindow, PixelPageHeader } from "@/components/pixel-window";
import { t, type Locale } from "@/lib/translations";
import { getServerLocale } from "@/lib/locale-server";
import ConsentToggle from "./consent-toggle";

export const metadata: Metadata = {
  title: "Research consent · Mull",
  description:
    "What Mull does with your quiz data: academic research only, never sold, opt-in by choice, change your mind any time.",
  alternates: { canonical: "https://mull.world/consent" },
};

export default async function ConsentPage() {
  const locale = await getServerLocale();
  return (
    <main className="mx-auto max-w-[760px] px-6 pb-32 pt-12 sm:px-10 sm:pt-16">
      <PixelPageHeader
        eyebrow={t("consent.eyebrow", locale)}
        title={t("consent.title", locale)}
        subtitle={
          <p
            className="text-[16px] italic"
            style={{ fontFamily: "var(--font-editorial)" }}
          >
            {t("consent.subtitle", locale)}
          </p>
        }
      />

      <div className="space-y-8">
        {/* Live toggle — pulled out into a client component so the
            page can stay server-rendered around it. */}
        <PixelWindow
          title={t("consent.win_choice_title", locale)}
          badge={t("consent.win_choice_badge", locale)}
        >
          <ConsentToggle locale={locale} />
        </PixelWindow>

        <PixelWindow
          title={t("consent.win_short_title", locale)}
          badge={t("consent.win_short_badge", locale)}
        >
          <Prose>
            <p>{t("consent.short_body", locale)}</p>
          </Prose>
        </PixelWindow>

        <PixelWindow
          title={t("consent.win_data_title", locale)}
          badge={t("consent.win_data_badge", locale)}
        >
          <Prose>
            <p>{t("consent.data_intro", locale)}</p>
          </Prose>
          <ul className="mt-3 space-y-2.5">
            <Bullet>{emph(t("consent.data_b1", locale))}</Bullet>
            <Bullet>{emph(t("consent.data_b2", locale))}</Bullet>
            <Bullet>{emph(t("consent.data_b3", locale))}</Bullet>
            <Bullet>{emph(t("consent.data_b4", locale))}</Bullet>
          </ul>
          <Prose className="mt-4">
            <p>{emph(t("consent.data_never_intro", locale))}</p>
          </Prose>
          <ul className="mt-3 space-y-2.5">
            <Bullet>{emph(t("consent.data_n1", locale))}</Bullet>
            <Bullet>{emph(t("consent.data_n2", locale))}</Bullet>
            <Bullet>{emph(t("consent.data_n3", locale))}</Bullet>
          </ul>
        </PixelWindow>

        <PixelWindow
          title={t("consent.win_who_title", locale)}
          badge={t("consent.win_who_badge", locale)}
        >
          <Prose>
            <p>
              {emph(t("consent.who_p1_a", locale))}
              <a
                href="mailto:jimmy.kaian.ji@gmail.com"
                className="text-[#8C6520] underline decoration-[#B8862F]/40 underline-offset-3 hover:decoration-[#8C6520]"
              >
                jimmy.kaian.ji@gmail.com
              </a>
              {emph(t("consent.who_p1_b", locale))}
            </p>
            <p>{t("consent.who_p2", locale)}</p>
          </Prose>
        </PixelWindow>

        <PixelWindow
          title={t("consent.win_never_title", locale)}
          badge={t("consent.win_never_badge", locale)}
        >
          <ul className="space-y-3">
            <Bullet>{emph(t("consent.never_b1", locale))}</Bullet>
            <Bullet>{emph(t("consent.never_b2", locale))}</Bullet>
            <Bullet>{emph(t("consent.never_b3", locale))}</Bullet>
            <Bullet>{emph(t("consent.never_b4", locale))}</Bullet>
            <Bullet>{emph(t("consent.never_b5", locale))}</Bullet>
          </ul>
        </PixelWindow>

        <PixelWindow
          title={t("consent.win_owns_title", locale)}
          badge={t("consent.win_owns_badge", locale)}
        >
          <Prose>
            <p>
              {emph(t("consent.owns_p1_a", locale))}
              <Link
                href="/account/profile"
                className="text-[#8C6520] underline decoration-[#B8862F]/40 underline-offset-3 hover:decoration-[#8C6520]"
              >
                {t("consent.owns_p1_link", locale)}
              </Link>
              {emph(t("consent.owns_p1_b", locale))}
            </p>
            <p>{emph(t("consent.owns_p2", locale))}</p>
          </Prose>
        </PixelWindow>
      </div>

      <p className="mt-12 text-[13px] leading-[1.6] text-[#8C6520] opacity-80">
        {t("consent.footer_a", locale)}
        <a
          href="mailto:jimmy.kaian.ji@gmail.com"
          className="underline decoration-[#B8862F]/40 underline-offset-3 hover:decoration-[#8C6520]"
        >
          jimmy.kaian.ji@gmail.com
        </a>
        {t("consent.footer_b", locale)}
      </p>

      <p className="mt-10 text-center text-[13px] text-[#8C6520]">
        <Link
          href="/"
          className="underline decoration-[#B8862F]/40 underline-offset-3 hover:decoration-[#8C6520]"
        >
          {t("consent.back_to_mull", locale)}
        </Link>
      </p>
    </main>
  );
}

// Render **bold** and *italic* spans inside a translated string. Lets
// localized prose carry inline emphasis without per-fragment keys.
function emph(text: string): React.ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((seg, i) => {
    if (seg.startsWith("**") && seg.endsWith("**")) {
      return <strong key={i}>{seg.slice(2, -2)}</strong>;
    }
    if (seg.startsWith("*") && seg.endsWith("*")) {
      return <em key={i}>{seg.slice(1, -1)}</em>;
    }
    return seg;
  });
}

function Prose({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={
        "space-y-4 text-[15.5px] leading-[1.65] text-[#4A4338] [&_strong]:text-[#221E18] " +
        (className ?? "")
      }
      style={{ fontFamily: "var(--font-editorial)" }}
    >
      {children}
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li
      className="border-l-4 px-4 py-2.5 text-[14.5px] leading-[1.6] text-[#4A4338]"
      style={{
        borderColor: "#B8862F",
        background: "#FFFCF4",
        fontFamily: "var(--font-editorial)",
      }}
    >
      {children}
    </li>
  );
}
