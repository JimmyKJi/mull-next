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
import { FIGURES } from "@/lib/figures";
import { getDailyWisdom } from "@/lib/daily-wisdom";
import { getServerLocale } from "@/lib/locale-server";
import { t } from "@/lib/translations";
import { ConstellationMount } from "@/components/constellation-mount";
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

        {/* ─── Hero — pixel-game opening screen ──────────────────
            Big chunky title in Press Start 2P, a pixel-dialog
            "QUEST BRIEF" panel containing the lede, and a chunky
            pixel "BEGIN THE QUIZ" button as the primary action. */}
        <section className="mx-auto max-w-[1200px] px-6 pt-12 pb-20 sm:px-10 sm:pt-20 sm:pb-28 md:pt-24">
          <div className="relative">
            {/* "PRESS START" eyebrow with blink */}
            <div
              className="flex items-center gap-3 text-[10px] tracking-[0.24em] text-[#8C6520]"
              style={{ fontFamily: "var(--font-pixel-display)" }}
            >
              <span aria-hidden className="inline-block h-2 w-2 bg-[#B8862F] pixel-blink" />
              <span>AN ATLAS OF HOW YOU THINK</span>
            </div>

            {/* Big pixel title MULL */}
            <h1
              className="mt-6 text-[64px] leading-none tracking-[0.04em] text-[#221E18] sm:text-[96px] md:text-[128px]"
              style={{ fontFamily: "var(--font-pixel-display)" }}
            >
              <span className="inline-block" style={{ textShadow: "6px 6px 0 #B8862F" }}>
                MULL
              </span>
            </h1>

            {/* Subtitle in VT323 — the human-readable version of the hero */}
            <p
              className="mt-7 max-w-[680px] text-[26px] leading-[1.25] text-[#221E18] sm:text-[30px]"
              style={{ fontFamily: "var(--font-pixel-body)" }}
            >
              Find your place on the{" "}
              <span className="text-[#8C6520]">map of how you think.</span>
            </p>

            {/* Lede inside a pixel dialog window — "quest brief" beat */}
            <div className="mt-10 max-w-[720px]">
              <div className="pixel-panel--amber pixel-panel">
                <div
                  className="border-b-4 border-[#8C6520] bg-[#8C6520] px-4 py-1.5 text-[10px] tracking-[0.2em] text-[#F8EDC8]"
                  style={{ fontFamily: "var(--font-pixel-display)" }}
                >
                  ▶ QUEST BRIEF
                </div>
                <p
                  className="px-5 py-4 text-[22px] leading-[1.35] text-[#221E18]"
                  style={{ fontFamily: "var(--font-pixel-body)" }}
                >
                  {t("home.hero_lede", locale)}
                </p>
              </div>
            </div>

            {/* Chunky pixel CTA + secondary link */}
            <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <Link
                href="/quiz?mode=quick"
                className="pixel-button pixel-button--amber"
              >
                <span>▶ BEGIN THE QUIZ</span>
              </Link>
              <Link
                href="/quiz?mode=detailed"
                className="text-[20px] leading-none text-[#4A4338] hover:text-[#221E18] hover:underline"
                style={{ fontFamily: "var(--font-pixel-body)" }}
              >
                or the 50-question deep dive →
              </Link>
            </div>

            <p
              className="mt-5 max-w-[520px] text-[18px] leading-[1.4] text-[#8C6520]"
              style={{ fontFamily: "var(--font-pixel-body)" }}
            >
              No right answers. Skip anything. No signup needed.{" "}
              <span className="text-[#4A4338]">
                ~6 minutes for the quick read.
              </span>
            </p>
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
                className="mt-5 text-[32px] leading-none tracking-[0.04em] text-[#221E18] sm:text-[44px] md:text-[56px]"
                style={{ fontFamily: "var(--font-pixel-display)" }}
              >
                <span style={{ textShadow: "4px 4px 0 #B8862F" }}>
                  {PHILOSOPHERS.length} THINKERS
                </span>
              </h2>
              <p
                className="mt-5 max-w-[640px] text-[22px] leading-[1.3] text-[#4A4338]"
                style={{ fontFamily: "var(--font-pixel-body)" }}
              >
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

            <p
              className="mt-5 max-w-[720px] text-[18px] leading-[1.4] text-[#8C6520]"
              style={{ fontFamily: "var(--font-pixel-body)" }}
            >
              Take the quiz to see where{" "}
              <span className="text-[#221E18]">you</span> appear in the
              cloud. The closer the point, the closer their pattern is
              to yours.
            </p>
          </div>
        </section>

        {/* ─── Today's thinker — pixel scroll panel ────────────── */}
        <section className="px-6 py-16 sm:px-10 sm:py-24">
          <div className="mx-auto max-w-[900px]">
            <div className="pixel-panel">
              {/* Title bar */}
              <div
                className="flex items-center justify-between border-b-4 border-[#221E18] bg-[#221E18] px-4 py-2 text-[10px] tracking-[0.22em] text-[#F8EDC8]"
                style={{ fontFamily: "var(--font-pixel-display)" }}
              >
                <span>{todayLabel.toUpperCase()}</span>
                <span className="text-[#B8862F]">DAILY DROP</span>
              </div>
              {/* Quote in Cormorant — the "library book inside the
                  game" beat. Pixel chrome, Cormorant content. */}
              <div className="px-6 py-8 sm:px-10 sm:py-10">
                <p
                  className="text-[26px] leading-[1.35] text-[#221E18] sm:text-[34px]"
                  style={{ fontFamily: "var(--font-prose)" }}
                >
                  <em>&ldquo;{philosopher.keyIdea}&rdquo;</em>
                </p>
                <div
                  className="mt-6 flex items-center gap-3 text-[18px] text-[#4A4338]"
                  style={{ fontFamily: "var(--font-pixel-body)" }}
                >
                  <span aria-hidden className="inline-block h-2 w-2 bg-[#B8862F]" />
                  <span>
                    {philosopher.name}
                    {philosopher.dates ? (
                      <span className="text-[#8C6520]"> · {philosopher.dates}</span>
                    ) : null}
                  </span>
                </div>
              </div>
            </div>
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
                  <p
                    className="mt-5 text-[18px] leading-[1.35] text-[#4A4338]"
                    style={{ fontFamily: "var(--font-pixel-body)" }}
                  >
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
                className="mt-5 text-[28px] leading-none tracking-[0.04em] text-[#221E18] sm:text-[40px] md:text-[48px]"
                style={{ fontFamily: "var(--font-pixel-display)" }}
              >
                <span style={{ textShadow: "4px 4px 0 #B8862F" }}>
                  TEN WAYS TO HOLD THE WORLD
                </span>
              </h2>
            </div>
            <Link
              href="/archetype"
              className="hidden text-[18px] text-[#8C6520] hover:text-[#221E18] hover:underline sm:inline"
              style={{ fontFamily: "var(--font-pixel-body)" }}
            >
              View all essays →
            </Link>
          </div>

          <p
            className="mt-6 max-w-[720px] text-[22px] leading-[1.3] text-[#4A4338]"
            style={{ fontFamily: "var(--font-pixel-body)" }}
          >
            Each is one stable pattern across the 16 dimensions. The
            quiz places you near the one you&rsquo;re closest to — but
            no one sits exactly on top of one.
          </p>

          <ul className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {ARCHETYPES.map((a) => {
              const color = getArchetypeColor(a.key);
              const figure = FIGURES[a.key] ?? "";
              return (
                <li key={a.key}>
                  <Link
                    href={`/archetype/${a.key}`}
                    className="group block transition-transform hover:-translate-x-[2px] hover:-translate-y-[2px]"
                  >
                    <div
                      className="pixel-panel transition-shadow group-hover:[box-shadow:6px_6px_0_0_#221E18]"
                      style={
                        {
                          // Per-archetype tint of the panel
                          background: color.soft,
                          borderColor: color.deep,
                          boxShadow: `4px 4px 0 0 ${color.deep}`,
                          ["--accent" as string]: color.primary,
                          ["--accent-deep" as string]: color.deep,
                        } as React.CSSProperties
                      }
                    >
                      {/* Title bar — archetype name in pixel display */}
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

                      {/* Sprite — SVG figure rendered with crisp pixel
                          edges. CSS image-rendering:pixelated forces
                          the browser to nearest-neighbor scale. */}
                      <div
                        className="relative mx-auto my-4 flex h-[120px] w-[120px] items-center justify-center"
                        aria-hidden
                      >
                        <div
                          className="absolute inset-2 bg-[#FFFCF4]"
                          style={{
                            boxShadow: `inset 0 0 0 3px ${color.deep}`,
                          }}
                        />
                        <div
                          className="pixel-crisp pixel-float relative h-[88px] w-[88px]"
                          dangerouslySetInnerHTML={{ __html: figure }}
                        />
                      </div>

                      {/* Spirit line in VT323 + Cormorant italic for
                          the proper name. */}
                      <div className="border-t-2 px-3 py-3 text-center"
                        style={{ borderColor: color.deep }}>
                        <p
                          className="text-[18px] leading-[1.3] text-[#221E18]"
                          style={{ fontFamily: "var(--font-pixel-body)" }}
                        >
                          {a.spirit}
                        </p>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>

          <Link
            href="/archetype"
            className="mt-8 inline-block text-[18px] text-[#8C6520] hover:text-[#221E18] hover:underline sm:hidden"
            style={{ fontFamily: "var(--font-pixel-body)" }}
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
                className="mt-5 text-[40px] leading-none tracking-[0.04em] text-[#F8EDC8] sm:text-[64px]"
                style={{ fontFamily: "var(--font-pixel-display)" }}
              >
                <span style={{ textShadow: "5px 5px 0 #B8862F" }}>
                  WHERE DO YOU SIT?
                </span>
              </h2>
              <p
                className="mx-auto mt-6 max-w-[520px] text-[22px] leading-[1.35] text-[#F8EDC8]/85"
                style={{ fontFamily: "var(--font-pixel-body)" }}
              >
                Twenty questions, six minutes, no signup. You can skip
                anything that doesn&rsquo;t fit you.
              </p>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/quiz?mode=quick"
                  className="pixel-button pixel-button--amber"
                >
                  <span>▶ BEGIN THE QUIZ</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Footer — pixel status bar ─────────────────────── */}
        <footer
          className="border-t-4 border-[#221E18] bg-[#221E18] px-6 py-5 sm:px-10"
          style={{ fontFamily: "var(--font-pixel-body)" }}
        >
          <div className="mx-auto flex max-w-[1200px] flex-wrap items-baseline justify-between gap-4 text-[18px] leading-relaxed text-[#B8862F]">
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
