// /map — the philosophical constellation, full-bleed.
//
// The constellation has lived as a section on the home page and as
// a smaller widget on /result, but never had its own dedicated
// surface. Splitting `/map` (constellation-first, exploration UX)
// from `/philosopher` (alphabetical-by-archetype browseable list)
// gives both jobs their own room.
//
// Cross-links: /map → /philosopher ("Browse alphabetically") and
// /philosopher → /map ("View the constellation") so neither audience
// is stranded.

import Link from "next/link";
import type { Metadata } from "next";
import { ConstellationMount } from "@/components/constellation-mount";
import { PHILOSOPHERS } from "@/lib/philosophers";
import { ARCHETYPES } from "@/lib/archetypes";
import { PathwayNext } from "@/components/pathway-next";
import { pathwayForMap } from "@/lib/pathway";
import { getServerLocale } from "@/lib/locale-server";
import { t } from "@/lib/translations";

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";
const serif = "var(--font-prose)";

export const metadata: Metadata = {
  title: "The map",
  description: `The full philosophical map — ${PHILOSOPHERS.length} thinkers across ${ARCHETYPES.length} archetypes, plotted in 16-dimensional space. Pan, zoom, and find kindred minds.`,
  openGraph: {
    title: "The map — Mull",
    description: `${PHILOSOPHERS.length} thinkers across ${ARCHETYPES.length} archetypes. The whole map.`,
    url: "https://mull.world/map",
    siteName: "Mull",
    type: "article",
  },
  alternates: { canonical: "https://mull.world/map" },
};

export default async function MapPage() {
  const locale = await getServerLocale();
  return (
    <main className="mx-auto max-w-[1400px] px-4 pb-32 pt-10 sm:px-8 sm:pt-14">
      {/* Header — kept small so the constellation gets the room */}
      <header className="mb-6 sm:mb-8">
        <div
          className="flex items-center gap-3 text-[10px] tracking-[0.24em] text-acc-deep"
          style={{ fontFamily: pixel }}
        >
          <span aria-hidden className="inline-block h-2 w-2 bg-acc pixel-blink" />
          ▶ {t("map.eyebrow", locale)}
        </div>
        <h1
          className="mt-4 break-words pr-2 text-[24px] leading-[1.3] tracking-[0.04em] text-ink sm:text-[40px] md:text-[52px]"
          style={{ fontFamily: pixel }}
        >
          <span style={{ textShadow: "4px 4px 0 var(--pixel-shadow, var(--color-acc))" }}>{t("map.title", locale)}</span>
        </h1>
        <p
          className="mt-5 max-w-[640px] text-[17px] leading-[1.55] text-ink-soft"
          style={{ fontFamily: serif, fontStyle: "italic" }}
        >
          {t("map.intro", locale, { count: PHILOSOPHERS.length, archetypes: ARCHETYPES.length })}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3 text-[13px]">
          <Link
            href="/philosopher"
            className="border-2 border-ink bg-[#FFFCF4] px-3 py-2.5 text-[12px] tracking-[0.18em] text-ink hover:bg-acc-soft"
            style={{ fontFamily: pixel, textTransform: "uppercase" }}
          >
            ▶ {t("map.browse_alpha", locale)}
          </Link>
          <Link
            href="/quiz/journey"
            className="border-2 border-ink bg-[#F8C75E] px-3 py-2.5 text-[12px] tracking-[0.18em] text-[#1A1820] hover:bg-acc"
            style={{ fontFamily: pixel, textTransform: "uppercase" }}
          >
            ▶ {t("map.find_place", locale)}
          </Link>
          <Link
            href="/archetype"
            className="inline-block py-1 text-[13px] text-acc-deep underline decoration-line underline-offset-3 hover:text-ink hover:decoration-acc-deep"
          >
            {t("map.or_archetypes", locale, { count: ARCHETYPES.length })} ↗
          </Link>
        </div>
      </header>

      {/* The constellation — given the room it deserves. 720px on
          desktop (taller than the home-page embed at 640px) so this
          page reads as "this is the destination, not a preview". */}
      <div className="reveal-on-mount">
        <ConstellationMount height={720} variant="interactive" />
      </div>

      {/* Below the map — a short legend + the dimension list, so a
          user who's just landed here from a search engine understands
          what they're looking at without having to bounce to /about
          first. */}
      <section className="mt-12 grid gap-8 md:grid-cols-2">
        <div
          className="border-[3px] border-ink bg-[#FFFCF4] p-5"
          style={{ boxShadow: "4px 4px 0 0 var(--color-acc)" }}
        >
          <div
            className="text-[10px] tracking-[0.22em] text-acc-deep"
            style={{ fontFamily: pixel }}
          >
            ▶ {t("map.how_to_read", locale)}
          </div>
          <ul
            className="mt-3 space-y-2 text-[14.5px] leading-[1.6] text-ink"
            style={{ fontFamily: serif }}
          >
            <li>
              <strong>{t("map.read1_lead", locale)}</strong>{t("map.read1_rest", locale)}
            </li>
            <li>
              <strong>{t("map.read2_lead", locale)}</strong>{t("map.read2_rest", locale)}
            </li>
            <li>
              <strong>{t("map.read3a_lead", locale)}</strong>{t("map.read3a_rest", locale)}<strong>{t("map.read3b_lead", locale)}</strong>{t("map.read3b_rest", locale)}
            </li>
            <li>
              {t("map.read4", locale)}
            </li>
          </ul>
        </div>

        <div
          className="border-[3px] border-ink bg-[#FFFCF4] p-5"
          style={{ boxShadow: "4px 4px 0 0 var(--color-acc)" }}
        >
          <div
            className="text-[10px] tracking-[0.22em] text-acc-deep"
            style={{ fontFamily: pixel }}
          >
            ▶ {t("map.ten_archetypes", locale)}
          </div>
          <ul
            className="mt-3 grid grid-cols-2 gap-2 text-[14px] leading-[1.5] text-ink"
            style={{ fontFamily: serif }}
          >
            {ARCHETYPES.map((a) => (
              <li key={a.key}>
                <Link
                  href={`/archetype/${a.key}`}
                  className="block py-1.5 text-ink underline decoration-line underline-offset-3 hover:decoration-acc-deep"
                >
                  {t(`arch.${a.key}.name`, locale)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Pathway — quiz → dilemma → spar for cold visitors;
          spar → dilemma → anthology for warm visitors. */}
      <PathwayNext pathway={pathwayForMap(locale)} locale={locale} />
    </main>
  );
}
