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
          className="flex items-center gap-3 text-[10px] tracking-[0.24em] text-[#8C6520]"
          style={{ fontFamily: pixel }}
        >
          <span aria-hidden className="inline-block h-2 w-2 bg-[#B8862F] pixel-blink" />
          ▶ THE MAP
        </div>
        <h1
          className="mt-4 text-[36px] leading-none tracking-[0.04em] text-[#221E18] sm:text-[52px]"
          style={{ fontFamily: pixel }}
        >
          <span style={{ textShadow: "4px 4px 0 #B8862F" }}>THE CONSTELLATION</span>
        </h1>
        <p
          className="mt-5 max-w-[640px] text-[17px] leading-[1.55] text-[#4A4338]"
          style={{ fontFamily: serif, fontStyle: "italic" }}
        >
          {PHILOSOPHERS.length} philosophers across {ARCHETYPES.length} archetypes,
          plotted in a 16-dimensional space of philosophical tendencies.
          Pan, zoom, hover any thinker to see their position. After
          you take the quiz, your own point appears among them.
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3 text-[13px]">
          <Link
            href="/philosopher"
            className="border-2 border-[#221E18] bg-[#FFFCF4] px-3 py-1.5 text-[12px] tracking-[0.18em] text-[#221E18] hover:bg-[#F8EDC8]"
            style={{ fontFamily: pixel, textTransform: "uppercase" }}
          >
            ▶ BROWSE ALPHABETICALLY
          </Link>
          <Link
            href="/quiz/journey"
            className="border-2 border-[#221E18] bg-[#F8C75E] px-3 py-1.5 text-[12px] tracking-[0.18em] text-[#1A1820] hover:bg-[#B8862F]"
            style={{ fontFamily: pixel, textTransform: "uppercase" }}
          >
            ▶ FIND YOUR PLACE
          </Link>
          <Link
            href="/archetype"
            className="text-[13px] text-[#8C6520] underline decoration-[#D6CDB6] underline-offset-3 hover:text-[#221E18] hover:decoration-[#8C6520]"
          >
            Or the 10 archetypes ↗
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
          className="border-[3px] border-[#221E18] bg-[#FFFCF4] p-5"
          style={{ boxShadow: "4px 4px 0 0 #B8862F" }}
        >
          <div
            className="text-[10px] tracking-[0.22em] text-[#8C6520]"
            style={{ fontFamily: pixel }}
          >
            ▶ HOW TO READ IT
          </div>
          <ul
            className="mt-3 space-y-2 text-[14.5px] leading-[1.6] text-[#221E18]"
            style={{ fontFamily: serif }}
          >
            <li>
              <strong>Each point</strong> is a philosopher, colored by
              their dominant archetype.
            </li>
            <li>
              <strong>Nearness</strong> on the plane means similar
              positions on the 16 underlying dimensions — Buddha and
              Hume both score high on "Self as Illusion" but for
              opposite reasons, so they sit near each other for a
              specific axis, and far apart on others.
            </li>
            <li>
              <strong>Hover</strong> any point for the name, dates, and
              key idea. <strong>Click</strong> to open their full page.
            </li>
            <li>
              After you take the quiz, your own point appears with a
              pulsing halo so you can see your nearest kin.
            </li>
          </ul>
        </div>

        <div
          className="border-[3px] border-[#221E18] bg-[#FFFCF4] p-5"
          style={{ boxShadow: "4px 4px 0 0 #B8862F" }}
        >
          <div
            className="text-[10px] tracking-[0.22em] text-[#8C6520]"
            style={{ fontFamily: pixel }}
          >
            ▶ THE TEN ARCHETYPES
          </div>
          <ul
            className="mt-3 grid grid-cols-2 gap-2 text-[14px] leading-[1.5] text-[#221E18]"
            style={{ fontFamily: serif }}
          >
            {ARCHETYPES.map((a) => (
              <li key={a.key}>
                <Link
                  href={`/archetype/${a.key}`}
                  className="text-[#221E18] underline decoration-[#D6CDB6] underline-offset-3 hover:decoration-[#8C6520]"
                >
                  The {a.key.charAt(0).toUpperCase() + a.key.slice(1)}
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
