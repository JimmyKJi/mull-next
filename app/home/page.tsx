// /home — v2 homepage. Server-rendered, no client JS on first paint.
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

import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { ARCHETYPES } from "@/lib/archetypes";
import { getArchetypeColor } from "@/lib/archetype-colors";
import { getDailyWisdom } from "@/lib/daily-wisdom";
import { getServerLocale } from "@/lib/locale-server";
import { t } from "@/lib/translations";
import { Constellation } from "@/components/constellation";
import { PHILOSOPHERS } from "@/lib/philosophers";

export const metadata: Metadata = {
  title: "Mull · Find your place on the map of how you think",
  description:
    "A philosophical-mapping tool. 16 dimensions, ten archetypes, 560 thinkers. Take the quiz, see where your worldview sits — and which thinkers across history have stood near you.",
  // Sandbox during the redesign — production / still serves mull.html.
  robots: { index: false, follow: false },
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
        {/* ─── Slim top rail ──────────────────────────────────────
            No global top bar on this surface — TopBarMount opts out
            of /home. The wordmark + version pill is the entire top. */}
        <header className="mx-auto flex max-w-[1200px] items-center justify-between px-6 pt-7 pb-2 sm:px-10 sm:pt-10">
          <Link
            href="/"
            className="font-display text-[22px] italic tracking-tight text-[#221E18]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Mull
          </Link>
          <span className="text-[11px] uppercase tracking-[0.22em] text-[#8C6520]">
            v0.9 · early build
          </span>
        </header>

        {/* ─── Hero ───────────────────────────────────────────────
            Generous H1, single accent rule, lede column.
            On desktop the column is centered with substantial padding;
            on mobile it left-aligns with the rest of the page rhythm. */}
        <section className="mx-auto max-w-[1200px] px-6 pt-16 pb-24 sm:px-10 sm:pt-24 sm:pb-32 md:pt-32 md:pb-40">
          <div className="relative max-w-[900px]">
            {/* Ambient amber wash — absolute, behind the H1. Subtle. */}
            <div
              aria-hidden
              className="pointer-events-none absolute -left-16 -top-16 h-[420px] w-[640px] sm:-left-32 sm:-top-20"
              style={{
                background:
                  "radial-gradient(ellipse at 30% 50%, rgba(184, 134, 47, 0.18) 0%, transparent 65%)",
                filter: "blur(40px)",
              }}
            />

            {/* Hairline rule + page label */}
            <div className="relative flex items-center gap-3 text-[11px] uppercase tracking-[0.24em] text-[#8C6520]">
              <span className="h-px w-10 bg-[#8C6520] opacity-50" />
              An atlas of how you think
            </div>

            <h1
              className="relative mt-7 font-display text-[56px] leading-[0.95] tracking-tight text-[#221E18] sm:text-[88px] md:text-[112px] [&_em]:not-italic [&_em]:italic [&_em]:font-display [&_em]:text-[#8C6520]"
              style={{ fontFamily: "var(--font-display)" }}
              dangerouslySetInnerHTML={{ __html: t("home.hero_h1", locale) }}
            />

            <p className="relative mt-10 max-w-[640px] text-[18px] leading-relaxed text-[#4A4338] sm:text-[20px] sm:leading-[1.6]">
              {t("home.hero_lede", locale)}
            </p>

            {/* Primary CTA. Single button — the secondary "detailed
                diagnosis" option lives one tap deeper, on the next
                screen, because the choice between modes is genuinely
                a secondary concern. */}
            <div className="relative mt-12 flex flex-col items-start gap-4 sm:flex-row sm:items-baseline">
              <Link
                href="/quiz?mode=quick"
                className="group inline-flex items-center gap-3 rounded-full bg-[#221E18] px-7 py-4 text-[15px] font-medium text-[#FAF6EC] transition-all hover:bg-[#8C6520] hover:shadow-[0_12px_40px_rgba(140,101,32,0.25)]"
              >
                <span>Begin the quiz</span>
                <span className="transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </Link>
              <Link
                href="/quiz?mode=detailed"
                className="text-[14px] text-[#4A4338] underline decoration-[#D6CDB6] decoration-1 underline-offset-4 hover:text-[#221E18] hover:decoration-[#8C6520]"
              >
                Or take the 50-question deep dive →
              </Link>
            </div>

            <p className="relative mt-6 max-w-[520px] text-[13.5px] leading-relaxed text-[#8C6520] opacity-80">
              No right answers. Skip anything. No signup needed.
              {" "}
              <span className="text-[#4A4338]">
                ~6 minutes for the quick read.
              </span>
            </p>
          </div>
        </section>

        {/* ─── The constellation ──────────────────────────────────
            All {PHILOSOPHERS.length} positioned philosophers, projected
            from 16 dimensions into a 2-D plane. Hover any point for
            the name + dates; click to open their entry. The map is
            the soul of the product — putting it on /home makes that
            unmistakable. */}
        <section className="border-y border-[#EBE3CA] bg-[#FFFCF4] px-6 py-16 sm:px-10 sm:py-24">
          <div className="mx-auto max-w-[1200px]">
            <div className="max-w-[800px]">
              <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.24em] text-[#8C6520]">
                <span className="h-px w-10 bg-[#8C6520] opacity-50" />
                The map
              </div>
              <h2
                className="mt-5 font-display text-[36px] leading-tight text-[#221E18] sm:text-[48px] md:text-[56px]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {PHILOSOPHERS.length} thinkers, <em>positioned</em>
              </h2>
              <p className="mt-5 max-w-[640px] text-[16px] leading-relaxed text-[#4A4338] sm:text-[17px]">
                Every philosopher in Mull sits at a real point in
                16-D space, drawn from their actual writings. The map
                below is that space, flattened to two readable axes.
                Hover any point to read their name.
              </p>
            </div>

            <div className="mt-10">
              <Constellation
                variant="interactive"
                clickable={true}
                className="max-h-[640px]"
              />
            </div>

            <div className="mt-6 flex flex-wrap items-baseline justify-between gap-2 text-[12.5px] text-[#8C6520]">
              <span className="opacity-80">
                X axis: theoretical / abstract ↔ embodied / practical
              </span>
              <span className="opacity-80">
                Y axis: sovereign self ↔ communal embeddedness
              </span>
            </div>
          </div>
        </section>

        {/* ─── Today's thinker ────────────────────────────────────
            Editorial pull-quote moment. Left rail in amber. */}
        <section className="border-y border-[#EBE3CA] bg-gradient-to-b from-[#F8EDC8]/30 to-[#FAF6EC] px-6 py-20 sm:px-10 sm:py-28">
          <div className="mx-auto max-w-[900px]">
            <div className="border-l-2 border-[#8C6520]/40 pl-6 sm:pl-10">
              <div className="text-[11px] uppercase tracking-[0.24em] text-[#8C6520] opacity-90">
                {todayLabel}
              </div>
              <p
                className="mt-5 font-display text-[28px] leading-[1.35] text-[#221E18] sm:text-[36px] md:text-[42px]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                <em>&ldquo;{philosopher.keyIdea}&rdquo;</em>
              </p>
              <div className="mt-6 flex items-center gap-3 text-[14px] text-[#4A4338]">
                <span
                  aria-hidden
                  className="inline-block h-1.5 w-1.5 rounded-full bg-[#B8862F]"
                />
                <span>
                  {philosopher.name}
                  {philosopher.dates ? <>, <span className="opacity-70">{philosopher.dates}</span></> : null}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ─── What Mull actually is ──────────────────────────────
            Three short paragraphs. The "what's different about this"
            beat that wins over readers who arrive skeptical of
            personality quizzes. */}
        <section className="mx-auto max-w-[760px] px-6 py-24 sm:px-10 sm:py-32">
          <div className="text-[11px] uppercase tracking-[0.24em] text-[#8C6520]">
            What this is
          </div>
          <div className="mt-6 space-y-7 text-[17px] leading-[1.65] text-[#221E18] sm:text-[19px]">
            <p>
              <strong className="font-medium">
                Mull places you in a 16-dimensional space
              </strong>{" "}
              of philosophical tendencies — Trust in Reason, Tragic
              Vision, Mystical Receptivity, Communal Embeddedness,
              Self as Illusion, and twelve more. Each answer in the
              quiz is a small vector that nudges your position.
            </p>
            <p>
              <strong className="font-medium">
                Over 500 philosophers are positioned alongside you
              </strong>
              , drawn from their actual writings. Buddha and Hume both
              score high on Self as Illusion but for opposite reasons.
              Nietzsche and Sartre both score high on Sovereign Self
              but split on Will to Power. The dimensions catch real
              distinctions.
            </p>
            <p>
              <strong className="font-medium">
                You&rsquo;re a continuous point, not a fixed type.
              </strong>{" "}
              A political compass collapses everything to two axes
              and four quadrants. MBTI sorts you into one of sixteen
              boxes. Mull never collapses you — two people who get
              the same archetype headline still have different
              fingerprints, and the same person, taking the test six
              months later, will land somewhere slightly different.
            </p>
          </div>
        </section>

        {/* ─── Ten archetypes preview ─────────────────────────────
            Each archetype as a small pillar with the accent dot in
            its primary color. Click → /archetype/[key]. */}
        <section className="mx-auto max-w-[1200px] border-t border-[#EBE3CA] px-6 py-24 sm:px-10 sm:py-32">
          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-[0.24em] text-[#8C6520]">
                The ten archetypes
              </div>
              <h2
                className="mt-4 font-display text-[36px] leading-tight text-[#221E18] sm:text-[44px]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Ten ways of <em>holding the world</em>
              </h2>
            </div>
            <Link
              href="/archetype"
              className="hidden text-[13px] text-[#8C6520] underline decoration-1 underline-offset-4 hover:text-[#221E18] sm:inline"
            >
              View all essays →
            </Link>
          </div>

          <p className="mt-6 max-w-[640px] text-[16px] leading-relaxed text-[#4A4338]">
            Each is one stable pattern across the 16 dimensions. The
            quiz places you near the one you&rsquo;re closest to — but
            no one sits exactly on top of one.
          </p>

          <ul className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-[#D6CDB6] bg-[#D6CDB6] sm:grid-cols-2 md:grid-cols-5">
            {ARCHETYPES.map((a) => {
              const color = getArchetypeColor(a.key);
              return (
                <li key={a.key}>
                  <Link
                    href={`/archetype/${a.key}`}
                    className="flex h-full flex-col gap-2 bg-[#FAF6EC] px-5 py-6 transition-colors hover:bg-[color:var(--hover)]"
                    style={
                      {
                        ["--hover" as string]: color.soft,
                      } as React.CSSProperties
                    }
                  >
                    <span
                      aria-hidden
                      className="inline-block h-1 w-6 rounded-full"
                      style={{ backgroundColor: color.primary }}
                    />
                    <span
                      className="font-display text-[24px] italic leading-tight text-[#221E18]"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {capitalize(a.key)}
                    </span>
                    <span className="text-[13.5px] leading-relaxed text-[#4A4338]">
                      {a.spirit}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <Link
            href="/archetype"
            className="mt-8 inline-block text-[13px] text-[#8C6520] underline decoration-1 underline-offset-4 hover:text-[#221E18] sm:hidden"
          >
            View all essays →
          </Link>
        </section>

        {/* ─── Tail CTA ───────────────────────────────────────────
            One more push to start, after the reader has been given
            real reasons. */}
        <section className="mx-auto max-w-[760px] px-6 pb-32 pt-12 text-center sm:px-10">
          <div
            className="font-display text-[36px] italic leading-tight text-[#221E18] sm:text-[48px]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Where do <em>you</em> sit?
          </div>
          <p className="mx-auto mt-6 max-w-[480px] text-[16px] leading-relaxed text-[#4A4338]">
            Twenty questions, six minutes, no signup. You can skip
            anything that doesn&rsquo;t fit you.
          </p>
          <Link
            href="/quiz?mode=quick"
            className="group mt-10 inline-flex items-center gap-3 rounded-full bg-[#221E18] px-8 py-4 text-[15px] font-medium text-[#FAF6EC] transition-all hover:bg-[#8C6520] hover:shadow-[0_12px_40px_rgba(140,101,32,0.25)]"
          >
            <span>Begin the quiz</span>
            <span className="transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </Link>
        </section>

        {/* ─── Footer ─────────────────────────────────────────────
            Quiet. Inline rather than its own component — small enough. */}
        <footer className="border-t border-[#EBE3CA] px-6 py-8 sm:px-10">
          <div className="mx-auto flex max-w-[1200px] flex-wrap items-baseline justify-between gap-4 text-[12.5px] leading-relaxed text-[#8C6520]">
            <div className="opacity-90">
              <strong className="font-semibold text-[#221E18]">Mull</strong>
              {" · a passion project · "}
              <a
                href="mailto:jimmy.kaian.ji@gmail.com"
                className="underline decoration-[#B8862F]/30 underline-offset-2 hover:decoration-[#8C6520]"
              >
                jimmy.kaian.ji@gmail.com
              </a>
            </div>
            <nav className="flex flex-wrap gap-5">
              <Link
                href="/about"
                className="underline decoration-[#B8862F]/40 underline-offset-2 hover:decoration-[#8C6520]"
              >
                About
              </Link>
              <Link
                href="/methodology"
                className="underline decoration-[#B8862F]/40 underline-offset-2 hover:decoration-[#8C6520]"
              >
                Methodology
              </Link>
              <Link
                href="/privacy"
                className="underline decoration-[#B8862F]/40 underline-offset-2 hover:decoration-[#8C6520]"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="underline decoration-[#B8862F]/40 underline-offset-2 hover:decoration-[#8C6520]"
              >
                Terms
              </Link>
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
