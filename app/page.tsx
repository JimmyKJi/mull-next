// / — v2 homepage. Server-rendered, no client JS on first paint.
//
// Design intent (see DESIGN-DIRECTION.md):
//   Editorial-first, not app-first. Cormorant Garamond italic at
//   display scale. Real typographic hierarchy. Subtle paper-grain
//   texture instead of motion-as-decoration. Per-archetype color
//   only on the archetype chip strip, never on chrome.
//
// One file by design — small enough to read top-to-bottom, no
// premature abstraction. Components get extracted when they're
// actually shared, not before.
//
// As of cutover (this file replaces the / → /mull.html rewrite),
// this is the production homepage. mull.html stays in /public until
// the rest of the redesign lands so we have a quick rollback path
// if needed.

import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { ARCHETYPES } from "@/lib/archetypes";
import { getArchetypeColor } from "@/lib/archetype-colors";
import { getDailyWisdom } from "@/lib/daily-wisdom";
import { getServerLocale } from "@/lib/locale-server";
import { t } from "@/lib/translations";
import { ConstellationMount } from "@/components/constellation-mount";
import { HeroSprites } from "@/components/hero-sprites";
import { PhilosopherSprite } from "@/components/philosopher-sprite";
import { ArchetypeSprite } from "@/components/archetype-sprite";
import { PHILOSOPHERS } from "@/lib/philosophers";

export const metadata: Metadata = {
  title: "Mull · Find your place on the map of how you think",
  description:
    "A philosophical-mapping tool. 16 dimensions, ten archetypes, 560 thinkers. Take the quiz, see where your worldview sits — and which thinkers across history have stood near you.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

const EYEBROW_TODAY: Record<string, string> = {
  en: "Today's thinker",
  es: "Pensador de hoy",
  fr: "Penseur du jour",
  pt: "Pensador de hoje",
  ru: "Мыслитель дня",
  zh: "今日思想家",
  ja: "今日の思想家",
  ko: "오늘의 사상가",
};

export default async function HomeV2() {
  const locale = await getServerLocale();
  const { philosopher } = getDailyWisdom();
  const todayLabel = EYEBROW_TODAY[locale] ?? EYEBROW_TODAY.en;

  return (
    <>
      {/* Top-of-page paper-grain texture. Pure SVG, ~3KB, encoded
          inline so there's no network round-trip. Sits at 4% opacity
          — present enough that the page doesn't feel flat, faint
          enough that it never reads as "noise." */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.04] mix-blend-multiply"
        style={{
          backgroundImage:
            'url("data:image/svg+xml;utf8,<svg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'><filter id=\'n\'><feTurbulence type=\'fractalNoise\' baseFrequency=\'0.92\' numOctaves=\'2\' stitchTiles=\'stitch\'/><feColorMatrix values=\'0 0 0 0 0.1 0 0 0 0 0.07 0 0 0 0 0.04 0 0 0 0.7 0\'/></filter><rect width=\'100%\' height=\'100%\' filter=\'url(%23n)\'/></svg>")',
        }}
      />

      <main className="relative z-10 min-h-[100svh] bg-[#FAF6EC] text-[#221E18]">
        {/* SiteNav (in app/layout.tsx) is the global top bar now. */}

        {/* ─── Hero — pixel opening screen, 2 columns ───────────
            Left: title + lede + CTA. Right: decorative floating
            pixel sprites of the archetype mascots over a tiny
            "preview" of the philosopher cloud. */}
        <section className="mx-auto max-w-[1200px] px-6 pt-12 pb-12 sm:px-10 sm:pt-20 sm:pb-16 md:pt-24">
          <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[1fr_360px] lg:gap-16">
            {/* ── Left column: title + CTA ── */}
            <div className="relative">
              <div
                className="flex items-center gap-3 text-[10px] tracking-[0.24em] text-[#8C6520]"
                style={{ fontFamily: "var(--font-pixel-display)" }}
              >
                <span aria-hidden className="inline-block h-2 w-2 bg-[#B8862F] pixel-blink" />
                <span>AN ATLAS OF HOW YOU THINK</span>
              </div>

              <h1
                className="mt-6 text-[64px] leading-none tracking-[0.04em] text-[#221E18] sm:text-[96px] md:text-[128px]"
                style={{ fontFamily: "var(--font-pixel-display)" }}
              >
                <span className="inline-block" style={{ textShadow: "6px 6px 0 #B8862F" }}>
                  MULL
                </span>
              </h1>

              <p className="mt-7 max-w-[680px] text-[22px] font-light leading-[1.35] text-[#221E18] sm:text-[26px]">
                Find your place on the{" "}
                <span className="text-[#8C6520]">map of how you think.</span>
              </p>

              <div className="mt-10 max-w-[640px]">
                <div className="pixel-panel pixel-panel--amber">
                  <div
                    className="border-b-4 border-[#8C6520] bg-[#8C6520] px-4 py-1.5 text-[10px] tracking-[0.2em] text-[#F8EDC8]"
                    style={{ fontFamily: "var(--font-pixel-display)" }}
                  >
                    ▶ QUEST BRIEF
                  </div>
                  <p className="px-5 py-4 text-[16px] font-normal leading-[1.55] text-[#221E18] sm:text-[17px]">
                    {t("home.hero_lede", locale)}
                  </p>
                </div>
              </div>

              <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <Link
                  href="/quiz?mode=quick"
                  className="pixel-button pixel-button--amber"
                >
                  <span>▶ BEGIN THE QUIZ</span>
                </Link>
                {/* Deep-dive: a ghost pixel-button (chunky border,
                    transparent fill) so the path is discoverable as a
                    real option rather than a dimmed footnote. The
                    "fingerprint" framing sells what you get for the
                    extra 9 minutes — a finer placement on the map. */}
                <Link
                  href="/quiz?mode=detailed"
                  className="pixel-button pixel-button--ghost"
                >
                  <span>▶ 50-QUESTION FINGERPRINT</span>
                </Link>
              </div>

              <p className="mt-5 max-w-[520px] text-[14px] leading-[1.55] text-[#8C6520]">
                No right answers. Skip anything. No signup needed.{" "}
                <span className="text-[#4A4338]">
                  ~6 minutes quick · ~15 minutes for the fingerprint.
                </span>
              </p>

              {/* Mobile-only inline philosopher sprite. The right-rail
                  HeroSprites column hides on small screens, leaving
                  the hero feeling unusually flat. A single procedural
                  philosopher sprite under the lede gives the page the
                  same playful texture the desktop version gets, without
                  reflowing the column layout. */}
              <div className="mt-6 flex items-center gap-3 lg:hidden">
                <PhilosopherSprite
                  name="Diogenes"
                  archetypeKey="iconoclast"
                  size={64}
                  floating
                />
                <span
                  className="text-[10px] tracking-[0.18em] text-[#8C6520]"
                  style={{ fontFamily: "var(--font-pixel-display)" }}
                >
                  ▸ ONE OF 560 THINKERS<br/>WAITING ON THE MAP
                </span>
              </div>
            </div>

            {/* ── Right column: floating pixel sprites + mini map ── */}
            <HeroSprites />
          </div>
        </section>

        {/* ─── Today's thinker — sits right under the hero ─────── */}
        <section className="px-6 pb-16 sm:px-10 sm:pb-20">
          <div className="mx-auto max-w-[1200px]">
            <div className="pixel-panel">
              <div
                className="flex items-center justify-between border-b-4 border-[#221E18] bg-[#221E18] px-4 py-2 text-[10px] tracking-[0.22em] text-[#F8EDC8]"
                style={{ fontFamily: "var(--font-pixel-display)" }}
              >
                <span>{todayLabel.toUpperCase()}</span>
                <span className="text-[#B8862F]">▶ DAILY DROP</span>
              </div>
              <div className="relative grid grid-cols-1 md:grid-cols-[1fr_auto] md:items-center">
                <div className="px-6 py-7 sm:px-10 sm:py-9">
                  <p
                    className="text-[24px] leading-[1.35] text-[#221E18] sm:text-[30px]"
                    style={{ fontFamily: "var(--font-prose)", paddingRight: 56 }}
                  >
                    <em>&ldquo;{philosopher.keyIdea}&rdquo;</em>
                  </p>
                  <div className="mt-5 flex items-center gap-3 text-[14px] text-[#4A4338]">
                    <span aria-hidden className="inline-block h-2 w-2 bg-[#B8862F]" />
                    <span>
                      {philosopher.name}
                      {philosopher.dates ? (
                        <span className="text-[#8C6520]"> · {philosopher.dates}</span>
                      ) : null}
                    </span>
                  </div>
                </div>
                {/* A floating pixel sprite of today's philosopher.
                    Desktop (md+): 96px sprite in a right-side rail.
                    Mobile: 48px sprite floated top-right inside the
                    quote, with quote padding-right reserving the space.
                    Same delight beat for both viewports. */}
                <div className="hidden border-l-4 border-[#221E18] bg-[#F8EDC8] px-8 py-7 md:block">
                  <PhilosopherSprite
                    name={philosopher.name}
                    archetypeKey={philosopher.archetypeKey}
                    size={96}
                    floating
                  />
                </div>
                <div
                  aria-hidden
                  className="md:hidden"
                  style={{
                    position: 'absolute',
                    top: 18,
                    right: 14,
                  }}
                >
                  <PhilosopherSprite
                    name={philosopher.name}
                    archetypeKey={philosopher.archetypeKey}
                    size={48}
                    floating
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── The constellation — pixel-framed for this slice
            (next slice replaces R3F with a 2D pixel overworld) ─── */}
        <section className="border-y-4 border-[#221E18] bg-[#FFFCF4] px-6 py-14 sm:px-10 sm:py-20">
          <div className="mx-auto max-w-[1200px]">
            <div className="max-w-[800px]">
              <div
                className="flex items-center gap-3 text-[10px] tracking-[0.24em] text-[#8C6520]"
                style={{ fontFamily: "var(--font-pixel-display)" }}
              >
                <span aria-hidden className="inline-block h-2 w-2 bg-[#B8862F]" />
                THE PHILOSOPHICAL REALM
              </div>
              <h2
                className="mt-5 pr-2 text-[28px] leading-[1.05] tracking-[0.04em] text-[#221E18] sm:text-[40px] md:text-[48px]"
                style={{ fontFamily: "var(--font-pixel-display)" }}
              >
                <span style={{ textShadow: "3px 3px 0 #B8862F" }}>
                  {PHILOSOPHERS.length} THINKERS
                </span>
              </h2>
              <p className="mt-5 max-w-[640px] text-[16px] leading-[1.6] text-[#4A4338] sm:text-[17px]">
                Every philosopher in Mull sits at a real point in
                16-D space — drawn from their actual writings.
                Below is that space, flattened to a readable map.
                Hover anyone to read who they were.
              </p>
            </div>

            {/* Pixel-framed map container */}
            <div className="mt-10 border-4 border-[#221E18] bg-[#0E1419] shadow-[8px_8px_0_0_#8C6520]">
              <div
                className="flex items-center justify-between border-b-4 border-[#221E18] bg-[#221E18] px-4 py-2"
                style={{ fontFamily: "var(--font-pixel-display)" }}
              >
                <span className="text-[10px] tracking-[0.18em] text-[#F8EDC8]">
                  ▶ MAP_OF_MINDS.EXE
                </span>
                <span className="text-[10px] tracking-[0.14em] text-[#B8862F]">
                  DRAG · ZOOM · HOVER
                </span>
              </div>
              <ConstellationMount height={640} variant="interactive" />
            </div>

            <p className="mt-5 max-w-[720px] text-[14px] leading-[1.55] text-[#8C6520]">
              Take the quiz to see where{" "}
              <span className="text-[#221E18]">you</span> appear in the
              cloud. The closer the point, the closer their pattern is
              to yours.
            </p>
          </div>
        </section>


        {/* ─── What Mull actually is ──────────────────────────────
            Three short paragraphs. The "what's different about this"
            beat that wins over readers who arrive skeptical of
            personality quizzes. */}
        {/* ─── What this is — three pixel info-cards ─────────────
            Same content as before, restructured as three pixel-
            panel "stat cards" so the section reads as a game-style
            briefing instead of a wall of prose. Each card has a
            pixel-glyph icon, a chunky pixel heading, and short body. */}
        <section className="mx-auto max-w-[1200px] px-6 py-20 sm:px-10 sm:py-28">
          <div
            className="flex items-center gap-3 text-[10px] tracking-[0.24em] text-[#8C6520]"
            style={{ fontFamily: "var(--font-pixel-display)" }}
          >
            <span aria-hidden className="inline-block h-2 w-2 bg-[#B8862F]" />
            WHAT THIS IS
          </div>
          <h2
            className="mt-5 text-[28px] leading-none tracking-[0.04em] text-[#221E18] sm:text-[40px]"
            style={{ fontFamily: "var(--font-pixel-display)" }}
          >
            <span style={{ textShadow: "4px 4px 0 #B8862F" }}>HOW IT WORKS</span>
          </h2>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                glyph: "▦",
                num: "16",
                title: "DIMENSIONS",
                body: "Mull places you in a 16-dimensional space of philosophical tendencies — Trust in Reason, Tragic Vision, Mystical Receptivity, Communal Embeddedness, Self as Illusion, and twelve more. Each quiz answer is a small vector that nudges your position.",
              },
              {
                glyph: "✦",
                num: "560",
                title: "THINKERS",
                body: "Over 500 philosophers are positioned alongside you, drawn from their actual writings. Buddha and Hume both score high on Self as Illusion — but for opposite reasons. The dimensions catch real distinctions.",
              },
              {
                glyph: "◇",
                num: "1",
                title: "OF YOU",
                body: "You're a continuous point, not a fixed type. A political compass collapses to 4 quadrants. MBTI sorts you into 16 boxes. Mull never collapses you — two people with the same archetype still have different fingerprints.",
              },
            ].map((card) => (
              <div key={card.title} className="pixel-panel">
                <div
                  className="flex items-center justify-between border-b-4 border-[#221E18] bg-[#221E18] px-4 py-2 text-[10px] tracking-[0.22em] text-[#F8EDC8]"
                  style={{ fontFamily: "var(--font-pixel-display)" }}
                >
                  <span>{card.glyph}</span>
                  <span>{card.title}</span>
                </div>
                <div className="px-5 py-5">
                  <div
                    className="text-[64px] leading-none text-[#B8862F]"
                    style={{
                      fontFamily: "var(--font-pixel-display)",
                      textShadow: "4px 4px 0 #221E18",
                    }}
                  >
                    {card.num}
                  </div>
                  <p className="mt-5 text-[15px] leading-[1.6] text-[#4A4338] sm:text-[16px]">
                    {card.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Ten archetypes — pixel character roster ────────────
            Each archetype is a pixel "character card" — the SVG
            figure rendered with image-rendering:pixelated so it
            reads as a sprite, framed in a pixel panel in the
            archetype's color. */}
        <section className="mx-auto max-w-[1200px] border-t-4 border-[#221E18] px-6 py-20 sm:px-10 sm:py-28">
          <div className="flex items-baseline justify-between">
            <div>
              <div
                className="flex items-center gap-3 text-[10px] tracking-[0.24em] text-[#8C6520]"
                style={{ fontFamily: "var(--font-pixel-display)" }}
              >
                <span aria-hidden className="inline-block h-2 w-2 bg-[#B8862F]" />
                CHOOSE YOUR ARCHETYPE
              </div>
              <h2
                className="mt-5 pr-2 text-[22px] leading-[1.1] tracking-[0.04em] text-[#221E18] sm:text-[32px] md:text-[40px]"
                style={{ fontFamily: "var(--font-pixel-display)" }}
              >
                <span style={{ textShadow: "3px 3px 0 #B8862F" }}>
                  TEN WAYS TO HOLD THE WORLD
                </span>
              </h2>
            </div>
            <Link
              href="/archetype"
              className="hidden text-[14px] text-[#8C6520] hover:text-[#221E18] hover:underline sm:inline"
            >
              View all essays →
            </Link>
          </div>

          <p className="mt-6 max-w-[720px] text-[16px] leading-[1.6] text-[#4A4338] sm:text-[17px]">
            Each is one stable pattern across the 16 dimensions. The
            quiz places you near the one you&rsquo;re closest to — but
            no one sits exactly on top of one.
          </p>

          {/* Equal-height archetype tiles. `auto-rows-fr` makes every
              row the same height; `h-full` on the inner panel + `flex
              flex-col` lets the spirit text fill remaining space so all
              tiles end up the same total size regardless of spirit
              length. Hover: lifts up + jiggles the sprite + reveals an
              animated "READ ESSAY ▶" CTA at the bottom. */}
          <ul className="mt-10 grid auto-rows-fr grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {ARCHETYPES.map((a) => {
              const color = getArchetypeColor(a.key);
              return (
                <li key={a.key} className="h-full">
                  <Link
                    href={`/archetype/${a.key}`}
                    className="archetype-tile group block h-full transition-transform duration-200 ease-out hover:-translate-x-1 hover:-translate-y-1"
                  >
                    <div
                      className="pixel-panel flex h-full flex-col transition-all duration-200 group-hover:[box-shadow:8px_8px_0_0_var(--accent-deep)]"
                      style={
                        {
                          background: color.soft,
                          borderColor: color.deep,
                          boxShadow: `4px 4px 0 0 ${color.deep}`,
                          ["--accent" as string]: color.primary,
                          ["--accent-deep" as string]: color.deep,
                        } as React.CSSProperties
                      }
                    >
                      {/* Title bar */}
                      <div
                        className="flex items-center justify-between border-b-4 px-3 py-2 text-[10px] tracking-[0.18em]"
                        style={{
                          borderColor: color.deep,
                          backgroundColor: color.deep,
                          color: color.soft,
                          fontFamily: "var(--font-pixel-display)",
                        }}
                      >
                        <span>NO. {String(ARCHETYPES.indexOf(a) + 1).padStart(2, "0")}</span>
                        <span>THE {capitalize(a.key).toUpperCase()}</span>
                      </div>

                      {/* Hand-crafted 16×16 pixel sprite for this
                          archetype. The figure jiggles on hover —
                          archetype-tile-sprite animation defined in
                          globals.css. */}
                      <div
                        className="relative mx-auto my-4 flex h-[120px] w-[120px] shrink-0 items-center justify-center"
                        aria-hidden
                      >
                        <div
                          className="absolute inset-2 bg-[#FFFCF4]"
                          style={{
                            boxShadow: `inset 0 0 0 3px ${color.deep}`,
                          }}
                        />
                        <div className="archetype-sprite relative">
                          <ArchetypeSprite archetypeKey={a.key} size={88} />
                        </div>
                      </div>

                      {/* Spirit line — flex-1 so it pushes the CTA strip
                          to the bottom regardless of length. */}
                      <div
                        className="flex-1 border-t-2 px-3 py-3 text-center"
                        style={{ borderColor: color.deep }}
                      >
                        <p className="text-[14px] leading-[1.5] text-[#221E18]">
                          {a.spirit}
                        </p>
                      </div>

                      {/* Hover-revealed CTA strip */}
                      <div
                        className="overflow-hidden border-t-2 transition-[max-height,padding] duration-200 ease-out"
                        style={{
                          borderColor: color.deep,
                          backgroundColor: color.deep,
                          color: color.soft,
                        }}
                      >
                        <div
                          className="flex items-center justify-center px-3 py-2 text-[10px] tracking-[0.22em]"
                          style={{ fontFamily: "var(--font-pixel-display)" }}
                        >
                          <span className="opacity-60 transition-opacity group-hover:opacity-100">
                            ▶ READ ESSAY
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>

          <Link
            href="/archetype"
            className="mt-8 inline-block text-[14px] text-[#8C6520] hover:text-[#221E18] hover:underline sm:hidden"
          >
            View all essays →
          </Link>
        </section>

        {/* ─── Tail CTA — pixel "PRESS START" screen ─────────── */}
        <section className="mx-auto max-w-[920px] px-6 pb-28 pt-12 text-center sm:px-10">
          <div className="pixel-panel pixel-panel--ink mx-auto">
            <div className="px-6 py-10 sm:px-12 sm:py-14">
              <div
                className="text-[14px] tracking-[0.24em] text-[#B8862F]"
                style={{ fontFamily: "var(--font-pixel-display)" }}
              >
                <span className="pixel-blink">▶</span> READY?
              </div>
              <h2
                className="mt-5 px-2 text-[28px] leading-[1.05] tracking-[0.04em] text-[#F8EDC8] sm:text-[44px] md:text-[52px]"
                style={{ fontFamily: "var(--font-pixel-display)" }}
              >
                <span style={{ textShadow: "3px 3px 0 #B8862F" }}>
                  WHERE DO YOU SIT?
                </span>
              </h2>
              <p className="mx-auto mt-6 max-w-[520px] text-[16px] leading-[1.6] text-[#F8EDC8]/90">
                Twenty questions, six minutes, no signup. You can skip
                anything that doesn&rsquo;t fit you.
              </p>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                {/* Bigger CTA than the hero version — "PRESS START"
                    screen energy. Doubles the padding + adds a SAVE
                    glyph so the second viewing reads as "OK, I'm
                    ready" rather than "wait, did I scroll up?" */}
                <Link
                  href="/quiz?mode=quick"
                  className="pixel-button pixel-button--amber pixel-press--lg"
                  style={{
                    fontSize: 16,
                    padding: '18px 28px',
                    boxShadow: '6px 6px 0 0 #221E18',
                  }}
                >
                  <span>▶ START NOW · 6 MIN</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Footer — pixel status bar ─────────────────────── */}
        <footer className="border-t-4 border-[#221E18] bg-[#221E18] px-6 py-5 sm:px-10">
          <div className="mx-auto flex max-w-[1200px] flex-wrap items-baseline justify-between gap-4 text-[14px] leading-relaxed text-[#B8862F]">
            <div>
              <span
                className="mr-2 text-[12px] tracking-[0.2em] text-[#F8EDC8]"
                style={{ fontFamily: "var(--font-pixel-display)" }}
              >
                MULL
              </span>
              <span className="text-[#B8862F]">a passion project · </span>
              <a
                href="mailto:jimmy.kaian.ji@gmail.com"
                className="text-[#F8EDC8] underline decoration-[#B8862F]/40 underline-offset-2 hover:decoration-[#F8EDC8]"
              >
                jimmy.kaian.ji@gmail.com
              </a>
            </div>
            <nav className="flex flex-wrap gap-5 text-[#F8EDC8]">
              <Link href="/about" className="hover:text-[#B8862F]">About</Link>
              <Link href="/methodology" className="hover:text-[#B8862F]">Methodology</Link>
              <Link href="/privacy" className="hover:text-[#B8862F]">Privacy</Link>
              <Link href="/terms" className="hover:text-[#B8862F]">Terms</Link>
            </nav>
          </div>
        </footer>
      </main>
    </>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
