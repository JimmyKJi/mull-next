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
import { ObfuscatedEmail } from "@/components/obfuscated-email";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TIPPING_ENABLED } from "@/lib/feature-flags";

export const metadata: Metadata = {
  title: "Mull · Find your place on the map of how you think",
  description:
    `A philosophical-mapping tool. 16 dimensions, ten archetypes, ${PHILOSOPHERS.length} thinkers. Take the quiz, see where your worldview sits — and which thinkers across history have stood near you.`,
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

  // JSON-LD for SEO. Two schemas: Organization (so Google knows
  // who Mull is and links to the right social profiles, etc.) and
  // WebSite (so the SearchAction lets Google show a search box
  // sitelink for the canonical homepage). Both rendered as one
  // application/ld+json blob since they share @context.
  const homeSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://mull.world/#org',
        name: 'Mull',
        url: 'https://mull.world',
        description:
          `A philosophical-mapping tool. 16 dimensions, ten archetypes, ${PHILOSOPHERS.length} thinkers.`,
      },
      {
        '@type': 'WebSite',
        '@id': 'https://mull.world/#site',
        url: 'https://mull.world',
        name: 'Mull',
        publisher: { '@id': 'https://mull.world/#org' },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://mull.world/search?q={search_term_string}',
          },
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeSchema) }}
      />
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

      <main className="relative z-10 min-h-[100svh] bg-cream text-ink">
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
                className="flex items-center gap-3 text-[10px] tracking-[0.24em] text-acc-deep"
                style={{ fontFamily: "var(--font-pixel-display)" }}
              >
                <span aria-hidden className="inline-block h-2 w-2 bg-acc pixel-blink" />
                <span>{t("home.eyebrow_atlas", locale)}</span>
              </div>

              <h1
                className="mt-6 text-[64px] leading-none tracking-[0.04em] text-ink sm:text-[96px] md:text-[128px]"
                style={{ fontFamily: "var(--font-pixel-display)" }}
              >
                <span className="inline-block" style={{ textShadow: "6px 6px 0 var(--pixel-shadow, var(--color-acc))" }}>
                  MULL
                </span>
              </h1>

              <p
                className="mt-7 max-w-[680px] text-[22px] font-light leading-[1.35] text-ink sm:text-[26px]"
                dangerouslySetInnerHTML={{ __html: t("home.hero_tagline", locale) }}
              />

              <div className="mt-10 max-w-[640px]">
                <div className="pixel-panel pixel-panel--amber">
                  <div
                    className="border-b-4 border-acc-deep bg-acc-deep px-4 py-1.5 text-[10px] tracking-[0.2em] text-acc-soft"
                    style={{ fontFamily: "var(--font-pixel-display)" }}
                  >
                    ▶ {t("home.quest_brief", locale)}
                  </div>
                  <p className="px-5 py-4 text-[16px] font-normal leading-[1.55] text-ink sm:text-[17px]">
                    {t("home.hero_lede", locale)}
                  </p>
                </div>
              </div>

              {/* Two PEER tier-1 entry points: the Quiz (find where you
                  sit) and the Arena (argue a philosopher). Equal visual
                  weight — these are Mull's two signature surfaces. The
                  Inheritor is the default quiz path; classic is a small
                  link below for users who want short. */}
              <div className="mt-10 grid max-w-[640px] grid-cols-1 gap-4 sm:grid-cols-2">
                {/* — Tier 1: The Quiz — */}
                <Link
                  href="/quiz/journey"
                  className="block border-[4px] border-ink bg-[#FFFCF4] p-5 transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5"
                  style={{ boxShadow: "5px 5px 0 0 var(--color-acc)" }}
                >
                  <div
                    className="text-[10px] tracking-[0.22em] text-acc-deep"
                    style={{ fontFamily: "var(--font-pixel-display)" }}
                  >
                    ▶ {t("home.inheritor_eyebrow", locale)}
                  </div>
                  <div
                    className="mt-2 text-[18px] font-medium leading-[1.2] text-ink"
                    style={{ fontFamily: "var(--font-prose)" }}
                  >
                    {t("home.inheritor_title", locale)}
                  </div>
                  <p className="mt-2 text-[13.5px] leading-[1.5] text-ink-soft">
                    {t("home.inheritor_body", locale)}
                  </p>
                  <div
                    className="mt-3 inline-block bg-[#F8C75E] px-3 py-1 text-[10px] tracking-[0.18em] text-[#1A1820]"
                    style={{ fontFamily: "var(--font-pixel-display)" }}
                  >
                    ▶ {t("home.inheritor_cta", locale)}
                  </div>
                </Link>

                {/* — Tier 1: The Arena — */}
                <Link
                  href="/arena"
                  className="block border-[4px] border-ink bg-[#FFFCF4] p-5 transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5"
                  style={{ boxShadow: "5px 5px 0 0 #2F5D5C" }}
                >
                  <div
                    className="text-[10px] tracking-[0.22em] text-[#2F5D5C]"
                    style={{ fontFamily: "var(--font-pixel-display)" }}
                  >
                    ▶ {t("home.arena_eyebrow", locale)}
                  </div>
                  <div
                    className="mt-2 text-[18px] font-medium leading-[1.2] text-ink"
                    style={{ fontFamily: "var(--font-prose)" }}
                  >
                    {t("home.arena_title", locale)}
                  </div>
                  <p className="mt-2 text-[13.5px] leading-[1.5] text-ink-soft">
                    {t("home.arena_body", locale)}
                  </p>
                  <div
                    className="mt-3 inline-block bg-[#F8C75E] px-3 py-1 text-[10px] tracking-[0.18em] text-[#1A1820]"
                    style={{ fontFamily: "var(--font-pixel-display)" }}
                  >
                    ▶ {t("home.arena_cta", locale)}
                  </div>
                </Link>
              </div>

              <p className="mt-5 max-w-[640px] text-[13.5px] leading-[1.55] text-acc-deep">
                {t("home.no_signup", locale)}{" "}
                <Link href="/quiz?mode=quick" className="text-ink-soft underline decoration-acc/40 underline-offset-3 hover:decoration-acc-deep">
                  {t("home.classic_instead", locale)}
                </Link>{" "}
                {t("home.same_placement", locale)}
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
                  archetypeKey="hammer"
                  size={64}
                  floating
                />
                <span
                  className="text-[10px] tracking-[0.18em] text-acc-deep"
                  style={{ fontFamily: "var(--font-pixel-display)" }}
                >
                  ▸ {t("home.one_of_560_l1", locale, { count: PHILOSOPHERS.length })}<br/>{t("home.one_of_560_l2", locale)}
                </span>
              </div>
            </div>

            {/* ── Right column: floating pixel sprites + mini map ──
                Hidden on mobile (the inline philosopher sprite in
                the left column already gives the page visual texture
                at that size; rendering both leaves a 480px empty gap
                between hero and the "WHAT TO DO TOMORROW" section). */}
            <div className="hidden lg:block">
              <HeroSprites />
            </div>
          </div>
        </section>

        {/* ─── Find Your Rhythm — the retention bridge ───────────
            Sits between the hero (entry points) and Today's drop
            (a daily ritual). Makes the recurring surfaces — Daily
            Spar, Today's Dilemma, The Pilgrimage — visible without
            requiring discovery. The 5-min/5-min/30-day arc gives
            users a clear "what to do once you have your archetype"
            menu. RETENTION-NOTES.md §UX-rewire. */}
        <ScrollReveal as="section" className="px-6 pb-16 sm:px-10 sm:pb-20">
          <div className="mx-auto max-w-[1200px]">
            <div
              className="text-[10px] tracking-[0.24em] text-acc-deep"
              style={{ fontFamily: "var(--font-pixel-display)" }}
            >
              ▸ {t("home.rhythm_eyebrow", locale)}
            </div>
            <h2
              className="mt-4 text-[26px] leading-[1.05] tracking-[0.04em] text-ink sm:text-[34px]"
              style={{ fontFamily: "var(--font-pixel-display)" }}
            >
              <span style={{ textShadow: "3px 3px 0 var(--pixel-shadow, var(--color-acc))" }}>{t("home.rhythm_title", locale)}</span>
            </h2>
            <p
              className="mt-3 max-w-[680px] text-[15px] leading-[1.55] text-ink-soft sm:text-[16px]"
              style={{ fontFamily: "var(--font-editorial)" }}
            >
              {t("home.rhythm_intro_pre", locale)}
              <Link
                href="/atlas"
                className="text-acc-deep underline decoration-acc/40 underline-offset-3 hover:decoration-acc-deep"
              >
                {t("home.rhythm_intro_atlas", locale)}
              </Link>
              {t("home.rhythm_intro_post", locale)}
            </p>
            {/* Three tiers of cadence stacked into one grid so the
                user can pick what kind of return-rhythm matches
                their day. Each row is a different commitment shape:
                fast daily / weekly / long-arc. */}
            <ul className="mt-7 grid grid-cols-1 gap-3 md:grid-cols-3">
              <li>
                <RhythmCard
                  href="/spar"
                  cadence={t("home.rc_spar_cadence", locale)}
                  title={t("nav.spar", locale)}
                  pitch={t("home.rc_spar_pitch", locale)}
                  cta={t("home.rc_spar_cta", locale)}
                  dark
                  shadow="#8C3717"
                />
              </li>
              <li>
                <RhythmCard
                  href="/crucible"
                  cadence={t("home.rc_crucible_cadence", locale)}
                  title={t("nav.crucible", locale)}
                  pitch={t("home.rc_crucible_pitch", locale)}
                  cta={t("home.rc_crucible_cta", locale)}
                  shadow="#2F5D5C"
                />
              </li>
              <li>
                <RhythmCard
                  href="/dilemma"
                  cadence={t("home.rc_dilemma_cadence", locale)}
                  title={t("nav.dilemma", locale)}
                  pitch={t("home.rc_dilemma_pitch", locale)}
                  cta={t("home.rc_dilemma_cta", locale)}
                  shadow="#B8862F"
                />
              </li>
              <li>
                <RhythmCard
                  href="/wandering"
                  cadence={t("home.rc_wandering_cadence", locale)}
                  title={t("nav.wandering", locale)}
                  pitch={t("home.rc_wandering_pitch", locale)}
                  cta={t("home.rc_wandering_cta", locale)}
                  shadow="#5D5777"
                />
              </li>
              <li>
                <RhythmCard
                  href="/pilgrimage"
                  cadence={t("home.rc_pilgrimage_cadence", locale)}
                  title={t("nav.pilgrimage", locale)}
                  pitch={t("home.rc_pilgrimage_pitch", locale)}
                  cta={t("home.rc_pilgrimage_cta", locale)}
                  shadow="#1E3A5F"
                />
              </li>
              <li>
                <RhythmCard
                  href="/atlas"
                  cadence={t("home.rc_atlas_cadence", locale)}
                  title={t("nav.atlas", locale)}
                  pitch={t("home.rc_atlas_pitch", locale)}
                  cta={t("home.rc_atlas_cta", locale)}
                  shadow="#7A8B43"
                />
              </li>
            </ul>
          </div>
        </ScrollReveal>

        {/* ─── Today's thinker — sits right under the hero ─────── */}
        <ScrollReveal as="section" className="px-6 pb-16 sm:px-10 sm:pb-20">
          <div className="mx-auto max-w-[1200px]">
            <div className="pixel-panel">
              <div
                className="flex items-center justify-between border-b-4 border-ink bg-ink px-4 py-2 text-[10px] tracking-[0.22em] text-acc-soft"
                style={{ fontFamily: "var(--font-pixel-display)" }}
              >
                <span>{todayLabel.toUpperCase()}</span>
                <span className="text-acc">▶ {t("home.daily_drop", locale)}</span>
              </div>
              <div className="relative grid grid-cols-1 md:grid-cols-[1fr_auto] md:items-center">
                <div className="px-6 py-7 sm:px-10 sm:py-9">
                  <p
                    className="text-[24px] leading-[1.35] text-ink sm:text-[30px]"
                    style={{ fontFamily: "var(--font-editorial)", paddingRight: 56 }}
                  >
                    <em>&ldquo;{philosopher.keyIdea}&rdquo;</em>
                  </p>
                  <div className="mt-5 flex items-center gap-3 text-[14px] text-ink-soft">
                    <span aria-hidden className="inline-block h-2 w-2 bg-acc" />
                    <span>
                      {philosopher.name}
                      {philosopher.dates ? (
                        <span className="text-acc-deep"> · {philosopher.dates}</span>
                      ) : null}
                    </span>
                  </div>
                </div>
                {/* A floating pixel sprite of today's philosopher.
                    Desktop (md+): 96px sprite in a right-side rail.
                    Mobile: 48px sprite floated top-right inside the
                    quote, with quote padding-right reserving the space.
                    Same delight beat for both viewports. */}
                <div className="hidden border-l-4 border-ink bg-acc-soft px-8 py-7 md:block">
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
        </ScrollReveal>

        {/* ─── The constellation — pixel-framed for this slice
            (next slice replaces R3F with a 2D pixel overworld) ─── */}
        <ScrollReveal as="section" className="border-y-4 border-ink bg-[#FFFCF4] px-6 py-14 sm:px-10 sm:py-20">
          <div className="mx-auto max-w-[1200px]">
            <div className="max-w-[800px]">
              <div
                className="flex items-center gap-3 text-[10px] tracking-[0.24em] text-acc-deep"
                style={{ fontFamily: "var(--font-pixel-display)" }}
              >
                <span aria-hidden className="inline-block h-2 w-2 bg-acc" />
                {t("home.realm_eyebrow", locale)}
              </div>
              <h2
                className="mt-5 pr-2 text-[28px] leading-[1.05] tracking-[0.04em] text-ink sm:text-[40px] md:text-[48px]"
                style={{ fontFamily: "var(--font-pixel-display)" }}
              >
                <span style={{ textShadow: "3px 3px 0 var(--pixel-shadow, var(--color-acc))" }}>
                  {t("home.n_thinkers", locale, { count: PHILOSOPHERS.length })}
                </span>
              </h2>
              <p className="mt-5 max-w-[640px] text-[16px] leading-[1.6] text-ink-soft sm:text-[17px]">
                {t("home.realm_body", locale)}
              </p>
            </div>

            {/* Pixel-framed map container */}
            <div className="mt-10 border-4 border-ink bg-[#0E1419] shadow-[8px_8px_0_0_var(--color-acc-deep)]">
              <div
                className="flex items-center justify-between border-b-4 border-ink bg-ink px-4 py-2"
                style={{ fontFamily: "var(--font-pixel-display)" }}
              >
                <span className="text-[10px] tracking-[0.18em] text-acc-soft">
                  ▶ MAP_OF_MINDS.EXE
                </span>
                <span className="text-[10px] tracking-[0.14em] text-acc">
                  {t("home.map_controls", locale)}
                </span>
              </div>
              <ConstellationMount height={640} variant="interactive" />
            </div>

            <p
              className="mt-5 max-w-[720px] text-[14px] leading-[1.55] text-acc-deep"
              dangerouslySetInnerHTML={{ __html: t("home.realm_footer", locale) }}
            />
          </div>
        </ScrollReveal>


        {/* ─── What Mull actually is ──────────────────────────────
            Three short paragraphs. The "what's different about this"
            beat that wins over readers who arrive skeptical of
            personality quizzes. */}
        {/* ─── What this is — three pixel info-cards ─────────────
            Same content as before, restructured as three pixel-
            panel "stat cards" so the section reads as a game-style
            briefing instead of a wall of prose. Each card has a
            pixel-glyph icon, a chunky pixel heading, and short body. */}
        <ScrollReveal as="section" className="mx-auto max-w-[1200px] px-6 py-20 sm:px-10 sm:py-28">
          <div
            className="flex items-center gap-3 text-[10px] tracking-[0.24em] text-acc-deep"
            style={{ fontFamily: "var(--font-pixel-display)" }}
          >
            <span aria-hidden className="inline-block h-2 w-2 bg-acc" />
            {t("home.what_eyebrow", locale)}
          </div>
          <h2
            className="mt-5 text-[28px] leading-none tracking-[0.04em] text-ink sm:text-[40px]"
            style={{ fontFamily: "var(--font-pixel-display)" }}
          >
            <span style={{ textShadow: "4px 4px 0 var(--pixel-shadow, var(--color-acc))" }}>{t("home.what_title", locale)}</span>
          </h2>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                glyph: "▦",
                num: "16",
                title: t("home.card_dimensions_title", locale),
                body: t("home.card_dimensions_body", locale),
              },
              {
                glyph: "✦",
                num: String(PHILOSOPHERS.length),
                title: t("home.card_thinkers_title", locale),
                body: t("home.card_thinkers_body", locale, { count: PHILOSOPHERS.length }),
              },
              {
                glyph: "◇",
                num: "1",
                title: t("home.card_ofyou_title", locale),
                body: t("home.card_ofyou_body", locale),
              },
            ].map((card) => (
              <div key={card.title} className="pixel-panel">
                <div
                  className="flex items-center justify-between border-b-4 border-ink bg-ink px-4 py-2 text-[10px] tracking-[0.22em] text-acc-soft"
                  style={{ fontFamily: "var(--font-pixel-display)" }}
                >
                  <span>{card.glyph}</span>
                  <span>{card.title}</span>
                </div>
                <div className="px-5 py-5">
                  <div
                    className="text-[64px] leading-none text-acc"
                    style={{
                      fontFamily: "var(--font-pixel-display)",
                      textShadow: "4px 4px 0 var(--pixel-shadow, var(--color-ink))",
                    }}
                  >
                    {card.num}
                  </div>
                  <p className="mt-5 text-[15px] leading-[1.6] text-ink-soft sm:text-[16px]">
                    {card.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* ─── What you can do — feature-hierarchy grid ───────────
            Replaces the implicit "discover by scrolling" with an
            explicit map of Mull's surfaces in importance order.
            Tier 1 (Quiz + Arena) already lived in the hero; this
            section makes the rest of the product navigable so users
            who skip the hero CTAs still see what's here. */}
        <ScrollReveal as="section" className="mx-auto max-w-[1200px] border-t-4 border-ink px-6 py-20 sm:px-10 sm:py-24">
          <div
            className="flex items-center gap-3 text-[10px] tracking-[0.24em] text-acc-deep"
            style={{ fontFamily: "var(--font-pixel-display)" }}
          >
            <span aria-hidden className="inline-block h-2 w-2 bg-acc" />
            {t("home.can_eyebrow", locale)}
          </div>
          <h2
            className="mt-5 text-[28px] leading-none tracking-[0.04em] text-ink sm:text-[40px]"
            style={{ fontFamily: "var(--font-pixel-display)" }}
          >
            <span style={{ textShadow: "4px 4px 0 var(--pixel-shadow, var(--color-acc))" }}>{t("home.can_title", locale)}</span>
          </h2>
          <p
            className="mt-5 max-w-[640px] text-[16px] leading-[1.55] text-ink-soft"
            style={{ fontFamily: "var(--font-prose)" }}
          >
            {t("home.can_intro", locale)}
          </p>

          {/* Tier 2 — substantial features (constellation, daily
              dilemma, topic explainers, vs matchups). Three columns. */}
          <div
            className="mt-10 flex items-center gap-3 text-[10px] tracking-[0.22em] text-[#2F5D5C]"
            style={{ fontFamily: "var(--font-pixel-display)" }}
          >
            <span aria-hidden className="inline-block h-2 w-2 bg-[#2F5D5C]" />
            {t("home.explore_label", locale)}
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <SurfaceCard
              href="/philosopher"
              eyebrow={`▶ ${t("home.sc_constellation_eb", locale)}`}
              title={t("home.sc_constellation_title", locale, { count: PHILOSOPHERS.length })}
              body={t("home.sc_constellation_body", locale)}
            />
            <SurfaceCard
              href="/dilemma"
              eyebrow={`▶ ${t("home.sc_daily_eb", locale)}`}
              title={t("home.sc_daily_title", locale)}
              body={t("home.sc_daily_body", locale)}
            />
            <SurfaceCard
              href="/topic"
              eyebrow={`▶ ${t("home.sc_read_eb", locale)}`}
              title={t("home.sc_read_title", locale)}
              body={t("home.sc_read_body", locale)}
            />
          </div>

          {/* Tier 3 — supporting features. Smaller cards, denser
              grid. These are real and useful but not where new users
              should start. */}
          <div
            className="mt-12 flex items-center gap-3 text-[10px] tracking-[0.22em] text-acc-deep"
            style={{ fontFamily: "var(--font-pixel-display)" }}
          >
            <span aria-hidden className="inline-block h-2 w-2 bg-acc-deep" />
            {t("home.deepen_label", locale)}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            <SmallSurface
              href="/diary"
              label={t("home.ss_diary_label", locale)}
              body={t("home.ss_diary_body", locale)}
            />
            <SmallSurface
              href="/compare"
              label={t("home.ss_compare_label", locale)}
              body={t("home.ss_compare_body", locale)}
            />
            <SmallSurface
              href="/exercises"
              label={t("home.ss_exercises_label", locale)}
              body={t("home.ss_exercises_body", locale)}
            />
            <SmallSurface
              href="/debate"
              label={t("home.ss_debate_label", locale)}
              body={t("home.ss_debate_body", locale)}
            />
          </div>

          {/* Tier 4 — utility + social. Quietest row. */}
          <div className="mt-10 flex flex-wrap items-center gap-4 text-[12px] text-acc-deep">
            <span
              className="text-[10px] tracking-[0.22em]"
              style={{ fontFamily: "var(--font-pixel-display)" }}
            >
              ▸ {t("home.also_label", locale)}
            </span>
            <Link href="/wrapped" className="py-1.5 hover:text-ink">{t("home.also_wrapped", locale)}</Link>
            <span>·</span>
            <Link href="/classes" className="py-1.5 hover:text-ink">{t("home.also_classes", locale)}</Link>
            <span>·</span>
            <Link href="/install" className="py-1.5 hover:text-ink">{t("home.add_home", locale)}</Link>
            <span>·</span>
            <Link href="/about" className="py-1.5 hover:text-ink">{t("home.also_about", locale)}</Link>
            <span>·</span>
            <Link href="/methodology" className="py-1.5 hover:text-ink">{t("nav.methodology", locale)}</Link>
          </div>
        </ScrollReveal>

        {/* ─── Ten archetypes — pixel character roster ────────────
            Each archetype is a pixel "character card" — the SVG
            figure rendered with image-rendering:pixelated so it
            reads as a sprite, framed in a pixel panel in the
            archetype's color. */}
        <ScrollReveal as="section" className="mx-auto max-w-[1200px] border-t-4 border-ink px-6 py-20 sm:px-10 sm:py-28">
          <div className="flex items-baseline justify-between">
            <div>
              <div
                className="flex items-center gap-3 text-[10px] tracking-[0.24em] text-acc-deep"
                style={{ fontFamily: "var(--font-pixel-display)" }}
              >
                <span aria-hidden className="inline-block h-2 w-2 bg-acc" />
                {t("home.arch_eyebrow", locale)}
              </div>
              <h2
                className="mt-5 pr-2 text-[22px] leading-[1.1] tracking-[0.04em] text-ink sm:text-[32px] md:text-[40px]"
                style={{ fontFamily: "var(--font-pixel-display)" }}
              >
                <span style={{ textShadow: "3px 3px 0 var(--pixel-shadow, var(--color-acc))" }}>
                  {t("home.arch_title", locale)}
                </span>
              </h2>
            </div>
            <Link
              href="/archetype"
              className="hidden text-[14px] text-acc-deep hover:text-ink hover:underline sm:inline"
            >
              {t("home.view_all_essays", locale)}
            </Link>
          </div>

          <p className="mt-6 max-w-[720px] text-[16px] leading-[1.6] text-ink-soft sm:text-[17px]">
            {t("home.arch_intro", locale)}
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
                      {/* Title bar — stacked layout (number on top,
                          name below). The horizontal "NO. NN  NAME"
                          version broke on long names. */}
                      <div
                        className="flex min-h-[60px] flex-col items-center justify-center border-b-4 px-3 py-2 text-center tracking-[0.16em]"
                        style={{
                          borderColor: color.deep,
                          backgroundColor: color.deep,
                          color: color.soft,
                          fontFamily: "var(--font-pixel-display)",
                        }}
                      >
                        <span className="text-[9px] opacity-70">
                          NO. {String(ARCHETYPES.indexOf(a) + 1).padStart(2, "0")}
                        </span>
                        {/* Reserve two lines so 1- and 2-line names keep the
                            header (and the sprite/tagline/footer rows below it)
                            vertically aligned across every tile. */}
                        <span className="mt-0.5 flex min-h-[2lh] items-center text-[11px] leading-[1.15]">
                          {t(`arch.${a.key}.name`, locale).toUpperCase()}
                        </span>
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
                        <p className="text-[14px] leading-[1.5] text-ink">
                          {t(`arch.${a.key}.spirit`, locale)}
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
                            ▶ {t("home.read_essay", locale)}
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
            className="mt-8 inline-block py-1.5 text-[14px] text-acc-deep hover:text-ink hover:underline sm:hidden"
          >
            {t("home.view_all_essays", locale)}
          </Link>
        </ScrollReveal>

        {/* ─── Tail CTA — pixel "PRESS START" screen ─────────── */}
        <ScrollReveal as="section" className="mx-auto max-w-[920px] px-6 pb-28 pt-12 text-center sm:px-10">
          <div className="pixel-panel pixel-panel--ink mx-auto">
            <div className="px-6 py-10 sm:px-12 sm:py-14">
              <div
                className="text-[14px] tracking-[0.24em] text-acc"
                style={{ fontFamily: "var(--font-pixel-display)" }}
              >
                <span className="pixel-blink">▶</span> {t("home.ready", locale)}
              </div>
              <h2
                className="mt-5 px-2 text-[28px] leading-[1.05] tracking-[0.04em] text-acc-soft sm:text-[44px] md:text-[52px]"
                style={{ fontFamily: "var(--font-pixel-display)" }}
              >
                <span style={{ textShadow: "3px 3px 0 var(--pixel-shadow, var(--color-acc))" }}>
                  {t("home.where_sit", locale)}
                </span>
              </h2>
              <p className="mx-auto mt-6 max-w-[520px] text-[16px] leading-[1.6] text-acc-soft/90">
                {t("home.tail_body", locale)}
              </p>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/quiz/journey"
                  className="pixel-button pixel-button--amber pixel-press--lg"
                  style={{
                    fontSize: 16,
                    padding: '18px 28px',
                    boxShadow: '6px 6px 0 0 var(--color-ink)',
                  }}
                >
                  <span>▶ {t("home.enter_inheritor", locale)}</span>
                </Link>
                <Link
                  href="/quiz?mode=quick"
                  className="pixel-button pixel-button--ghost"
                  style={{ fontSize: 14, padding: '16px 22px' }}
                >
                  <span>{t("home.or_classic", locale)}</span>
                </Link>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* ─── Footer — pixel status bar ─────────────────────── */}
        <footer className="border-t-4 border-ink bg-ink px-6 py-5 sm:px-10">
          <div className="mx-auto flex max-w-[1200px] flex-wrap items-baseline justify-between gap-4 text-[14px] leading-relaxed text-acc">
            <div>
              <span
                className="mr-2 text-[12px] tracking-[0.2em] text-acc-soft"
                style={{ fontFamily: "var(--font-pixel-display)" }}
              >
                MULL
              </span>
              <span className="text-acc">{t("home.footer_passion", locale)} · </span>
              {/* Email obfuscated to dodge naive scrapers — the real
                  address is reassembled at click via the <ObfuscatedEmail>
                  component (writes the mailto on the fly). Bots that
                  parse the rendered HTML statically just see the visual
                  spelling, not a clickable mailto. */}
              <ObfuscatedEmail
                user="jimmy.kaian.ji"
                domain="gmail.com"
                className="text-acc-soft underline decoration-acc/40 underline-offset-2 hover:decoration-acc-soft"
              />
            </div>
            <nav className="flex flex-wrap gap-5 text-acc-soft">
              <Link href="/about" className="py-1.5 hover:text-acc">{t("nav.about", locale)}</Link>
              <Link href="/topic" className="py-1.5 hover:text-acc">{t("nav.topics", locale)}</Link>
              <Link href="/vs" className="py-1.5 hover:text-acc">{t("nav.matchups", locale)}</Link>
              <Link href="/install" className="py-1.5 hover:text-acc">{t("home.add_home", locale)}</Link>
              <Link href="/methodology" className="py-1.5 hover:text-acc">{t("nav.methodology", locale)}</Link>
              <Link href="/privacy" className="py-1.5 hover:text-acc">{t("home.footer_privacy", locale)}</Link>
              <Link href="/terms" className="py-1.5 hover:text-acc">{t("home.footer_terms", locale)}</Link>
              {/* Tip jar — Mull is free to use; this lets users who want
                  to chip in cover the AI bill. Hidden for now via
                  TIPPING_ENABLED (legal hold on accepting tips); flip the
                  flag in lib/feature-flags.ts to bring the link back. */}
              {TIPPING_ENABLED && (
                <a
                  href="https://ko-fi.com/mull"
                  target="_blank"
                  rel="noreferrer"
                  className="text-acc hover:text-acc-soft underline decoration-acc/40 underline-offset-2 hover:decoration-acc-soft"
                >
                  {t("home.support", locale)}
                </a>
              )}
            </nav>
          </div>
        </footer>
      </main>
    </>
  );
}

// ─── Surface cards (used by the "What you can do" section) ──────

function SurfaceCard({
  href,
  eyebrow,
  title,
  body,
}: {
  href: string;
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <Link
      href={href}
      className="block border-[3px] border-ink bg-[#FFFCF4] p-5 transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5"
      style={{ boxShadow: "4px 4px 0 0 var(--color-acc)" }}
    >
      <div
        className="text-[10px] tracking-[0.22em] text-acc-deep"
        style={{ fontFamily: "var(--font-pixel-display)" }}
      >
        {eyebrow}
      </div>
      <div
        className="mt-2 text-[17px] font-medium leading-[1.25] text-ink"
        style={{ fontFamily: "var(--font-prose)" }}
      >
        {title}
      </div>
      <p className="mt-2 text-[13.5px] leading-[1.5] text-ink-soft">{body}</p>
    </Link>
  );
}

function SmallSurface({
  href,
  label,
  body,
}: {
  href: string;
  label: string;
  body: string;
}) {
  return (
    <Link
      href={href}
      className="block border-[2px] border-ink bg-[#FFFCF4] p-3 transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5"
      style={{ boxShadow: "3px 3px 0 0 var(--color-acc)" }}
    >
      <div
        className="text-[14px] font-medium text-ink"
        style={{ fontFamily: "var(--font-prose)" }}
      >
        {label}
      </div>
      <p className="mt-1 text-[12.5px] leading-[1.45] text-acc-deep">{body}</p>
    </Link>
  );
}

// RhythmCard — uniform card for the "FIND YOUR RHYTHM" grid. One
// per retention surface; `dark` flips to ink palette for the
// signature daily surface (Spar).
function RhythmCard({
  href,
  cadence,
  title,
  pitch,
  cta,
  shadow,
  dark,
}: {
  href: string;
  cadence: string;
  title: string;
  pitch: string;
  cta: string;
  shadow: string;
  dark?: boolean;
}) {
  return (
    <Link
      href={href}
      className="block h-full border-[3px] border-ink p-4 transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5"
      style={{
        background: dark ? "#1A1612" : "#FFFCF4",
        color: dark ? "var(--color-acc-soft)" : "var(--color-ink)",
        boxShadow: `4px 4px 0 0 ${shadow}`,
      }}
    >
      <div
        className="text-[10px] tracking-[0.22em]"
        style={{
          fontFamily: "var(--font-pixel-display)",
          color: dark ? "#F8C75E" : shadow,
        }}
      >
        ▶ {cadence}
      </div>
      <div
        className="mt-2 text-[18px] leading-tight"
        style={{ fontFamily: "var(--font-editorial)" }}
      >
        <strong>{title}</strong>
      </div>
      <p
        className="mt-1.5 text-[13.5px] leading-[1.5]"
        style={{
          fontFamily: "var(--font-editorial)",
          color: dark ? "#E5DCC0" : "var(--color-ink-soft)",
        }}
      >
        {pitch}
      </p>
      <div
        className="mt-3 inline-block px-2.5 py-1 text-[10px] tracking-[0.18em]"
        style={{
          fontFamily: "var(--font-pixel-display)",
          background: dark ? "#F8C75E" : shadow,
          color: dark ? "#1A1820" : "var(--color-acc-soft)",
          textTransform: "uppercase",
        }}
      >
        ▶ {cta}
      </div>
    </Link>
  );
}
