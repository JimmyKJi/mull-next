"use client";

// ResultClient — v3 pixel-game result screen.
//
// Sequence:
//   1. "QUEST COMPLETE" pixel banner with the archetype sprite
//      springing in + alignment percent counting up from 0
//   2. 16-D radar fingerprint (pure SVG, draws itself with stroke
//      animation — pixel chrome around it)
//   3. The three closest philosophers as pixel character cards
//   4. The constellation embed with the user's point
//   5. Editorial walking tour (Cormorant inside pixel panels —
//      library-book-inside-the-game beat)
//   6. Pixel chunky next-step buttons

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getArchetypeColor } from "@/lib/archetype-colors";
import { ArchetypeSprite } from "@/components/archetype-sprite";
import { ConstellationMount } from "@/components/constellation-mount";
import { PhilosopherSprite } from "@/components/philosopher-sprite";
import { ResultSave } from "./result-save";
import { t, type Locale } from "@/lib/translations";

type DimRadarPoint = {
  key: string;
  name: string;
  value: number; // 0..1
};

type ClosestPhilosopher = {
  name: string;
  dates: string;
  keyIdea: string;
  archetypeKey: string;
  slug: string;
  sim: number;
};

type Props = {
  vector: number[];
  locale: Locale;
  mode: "quick" | "detailed";
  topKey: string;
  topName: string;
  spirit: string;
  whatItGetsRight: string;
  whereItFalters: string;
  flavor: string;
  alignmentPct: number;
  runnerUpKey: string;
  runnerUpPct: number;
  closest: ClosestPhilosopher[];
  dimRadar: DimRadarPoint[];
  userTop3: Array<{ key: string; name: string }>;
  /** Drives whether the next-steps section promotes the signup CTA
      full-width (anonymous viewers — the conversion population) or
      shows the standard 3-column footer (signed-in users). */
  isSignedIn: boolean;
  /** Friend-challenge inviter handle (resolved from challenger code).
   *  When non-null, we surface a "Compare with <inviter>" CTA at the
   *  top of the page that points directly to /compare?them=<handle>. */
  challengerHandle: string | null;
  challengerName: string | null;
  /** The raw challenger code we arrived with. Plumbed through to the
   *  accept-count bump (so the inviter sees their loop working). */
  challengerCode: string | null;
};

export function ResultClient({
  vector,
  locale,
  mode,
  topKey,
  spirit,
  whatItGetsRight,
  whereItFalters,
  flavor,
  alignmentPct,
  runnerUpKey,
  runnerUpPct,
  closest,
  dimRadar,
  userTop3,
  isSignedIn,
  challengerHandle,
  challengerName,
  challengerCode,
}: Props) {
  const color = getArchetypeColor(topKey);

  // Localized archetype name helpers. arch.<key>.name is e.g.
  // "The Cartographer" (en) / "制图师" (zh). archBare strips the
  // English article; archParts splits it for the two-line hero so
  // the article and the name can be sized/animated separately (and
  // the article line simply doesn't render for languages with none).
  const archFull = (key: string) => t(`arch.${key}.name`, locale);
  const archBare = (key: string) => {
    const m = archFull(key).match(/^(The|A|An)\s+(.+)$/i);
    return m ? m[2] : archFull(key);
  };
  const archParts = (key: string): { article: string | null; main: string } => {
    const full = archFull(key);
    const m = full.match(/^(The|A|An)\s+(.+)$/i);
    return m ? { article: m[1], main: m[2] } : { article: null, main: full };
  };

  return (
    <main
      className="min-h-[100svh] bg-[#FAF6EC] text-[#221E18]"
      style={
        {
          ["--acc" as string]: color.primary,
          ["--acc-deep" as string]: color.deep,
          ["--acc-soft" as string]: color.soft,
          ["--acc-accent" as string]: color.accent,
        } as React.CSSProperties
      }
    >
      <ResultSave
        vector={vector}
        archetype={`The ${capitalize(topKey)}`}
        flavor={flavor || null}
        alignmentPct={alignmentPct}
        mode={mode}
      />

      <ChallengerBanner
        challengerHandle={challengerHandle}
        challengerName={challengerName}
        challengerCode={challengerCode}
        locale={locale}
      />

      {/* ─── Hero — "QUEST COMPLETE" pixel banner ───────────────
          Big pixel panel with the archetype sprite springing in,
          archetype name in Press Start 2P with hard shadow,
          alignment % count-up. */}
      <section className="mx-auto max-w-[1100px] px-6 pt-12 pb-12 sm:px-10 sm:pt-20">
        <div
          className="pixel-panel"
          style={{
            background: color.soft,
            borderColor: color.deep,
            boxShadow: `8px 8px 0 0 ${color.deep}`,
          }}
        >
          {/* Title bar */}
          <div
            className="flex items-center justify-between border-b-4 px-4 py-2 text-[10px] tracking-[0.22em]"
            style={{
              borderColor: color.deep,
              backgroundColor: color.deep,
              color: color.soft,
              fontFamily: "var(--font-pixel-display)",
            }}
          >
            <span><span className="pixel-blink">▶</span> {t("res.quest_complete", locale)}</span>
            <span className="text-[#B8862F]">RESULT_ARCHETYPE.LOG</span>
          </div>

          <div className="grid grid-cols-1 gap-8 px-6 py-10 sm:px-10 sm:py-14 md:grid-cols-[auto_1fr] md:items-center md:gap-12">
            {/* Sprite — springs in via sprite-pop-in */}
            <div className="mx-auto sprite-pop-in">
              <div
                className="border-4 p-4"
                style={{
                  borderColor: color.deep,
                  background: "#FFFCF4",
                  boxShadow: `6px 6px 0 0 ${color.deep}`,
                }}
              >
                <ArchetypeSprite
                  archetypeKey={topKey}
                  size={176}
                  floating
                />
              </div>
            </div>

            <div className="text-center md:text-left">
              <div
                className="text-[11px] tracking-[0.26em]"
                style={{ color: color.deep, fontFamily: "var(--font-pixel-display)" }}
              >
                {t("res.you_are", locale)}
              </div>
              {flavor ? (
                <div
                  className="mt-2 text-[14px] tracking-[0.2em]"
                  style={{ color: color.deep, fontFamily: "var(--font-pixel-display)" }}
                >
                  {flavor.toUpperCase()}
                </div>
              ) : null}
              {/* Headline: wrap "THE" and the archetype word on
                  separate lines so long names ("THRESHOLD",
                  "CARTOGRAPHER", "LIGHTHOUSE") don't overflow the
                  panel. Sizes capped so even the widest name fits
                  with the 3-px hard shadow inside the column.
                  Right padding on the wrapper reserves space for
                  the drop shadow. */}
              <h1
                className="mt-3 pr-2 leading-[0.95] tracking-[0.04em] sm:pr-3"
                style={{
                  color: color.deep,
                  fontFamily: "var(--font-pixel-display)",
                }}
              >
                {(() => {
                  const parts = archParts(topKey);
                  return (
                    <>
                      {parts.article ? (
                        <div
                          className="text-[28px] sm:text-[40px] md:text-[44px]"
                          style={{ textShadow: `3px 3px 0 ${color.primary}` }}
                        >
                          {parts.article.toUpperCase()}
                        </div>
                      ) : null}
                      <div
                        className={`${parts.article ? "mt-2 " : ""}text-[34px] sm:text-[52px] md:text-[64px]`}
                        style={{ textShadow: `3px 3px 0 ${color.primary}` }}
                      >
                        {parts.main.toUpperCase()}
                      </div>
                    </>
                  );
                })()}
              </h1>

              <p
                className="mt-7 max-w-[520px] text-[18px] leading-[1.45] text-[#221E18] sm:text-[20px]"
                style={{ fontFamily: "var(--font-prose)" }}
              >
                <em>&ldquo;{spirit}&rdquo;</em>
              </p>

              {/* Alignment count-up + runner-up */}
              <div className="mt-8 flex flex-wrap items-end gap-6">
                <AlignmentCounter target={alignmentPct} color={color.deep} locale={locale} />
                <div className="text-[13px] text-[#4A4338]">
                  <div
                    className="text-[10px] tracking-[0.22em]"
                    style={{ color: color.deep, fontFamily: "var(--font-pixel-display)" }}
                  >
                    {t("res.runner_up", locale)}
                  </div>
                  <div className="mt-1">
                    {archFull(runnerUpKey)} ·{" "}
                    <span style={{ color: color.deep }}>{runnerUpPct}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Pilgrimage CTA — "your arc is ready" ──────────────
          Inserted right after the archetype reveal because that's
          the moment of highest engagement — the user just learned
          who they are; offer the 30-day arc shaped for that. */}
      <section className="mx-auto max-w-[1100px] px-6 pb-2 sm:px-10">
        <Link
          href="/pilgrimage"
          className="block border-[4px] p-5 transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 sm:p-6"
          style={{
            background: "#1A1612",
            color: "#F8EDC8",
            borderColor: color.deep,
            boxShadow: `6px 6px 0 0 ${color.deep}`,
          }}
        >
          <div
            className="text-[10px] tracking-[0.22em]"
            style={{
              color: color.primary,
              fontFamily: "var(--font-pixel-display)",
              textTransform: "uppercase",
            }}
          >
            {t("res.arc_ready", locale)}
          </div>
          <div
            className="mt-3 text-[22px] leading-tight sm:text-[26px]"
            style={{ fontFamily: "var(--font-editorial)" }}
          >
            {t("res.pilg_a", locale)}{flavor ? <em>{flavor.toLowerCase()}</em> : null}{" "}
            <strong>{archBare(topKey)}{t("res.pilg_plural", locale)}</strong>{t("res.pilg_b", locale)}
          </div>
          <p
            className="mt-3 max-w-[680px] text-[15.5px] leading-[1.55]"
            style={{ fontFamily: "var(--font-editorial)", color: "#E5DCC0" }}
          >
            {t("res.pilg_body", locale)}
          </p>
          <div
            className="mt-4 inline-block px-3 py-1 text-[10px] tracking-[0.18em]"
            style={{
              fontFamily: "var(--font-pixel-display)",
              textTransform: "uppercase",
              background: "#F8C75E",
              color: "#1A1820",
              border: "2px solid #221E18",
            }}
          >
            {t("res.begin_day1", locale)}
          </div>
        </Link>
      </section>

      {/* ─── Radar: your 16-D fingerprint ───────────────────────
          Pure SVG radar chart, pixel-bordered frame, sans labels. */}
      <section className="px-6 py-12 sm:px-10 sm:py-16">
        <div className="mx-auto max-w-[1100px]">
          <div className="pixel-panel">
            <div
              className="flex items-center justify-between border-b-4 border-[#221E18] bg-[#221E18] px-4 py-2 text-[10px] tracking-[0.22em] text-[#F8EDC8]"
              style={{ fontFamily: "var(--font-pixel-display)" }}
            >
              <span>{t("res.fingerprint", locale)}</span>
              <span className="text-[#B8862F]">RADAR.SYS</span>
            </div>
            <div className="grid grid-cols-1 gap-6 px-5 py-6 sm:px-8 sm:py-8 md:grid-cols-[1fr_300px]">
              <RadarChart points={dimRadar} color={color.primary} accent={color.accent} />
              <div>
                <div
                  className="text-[10px] tracking-[0.22em]"
                  style={{
                    color: color.deep,
                    fontFamily: "var(--font-pixel-display)",
                  }}
                >
                  {t("res.strongest_tendencies", locale)}
                </div>
                <ul className="mt-4 space-y-2">
                  {userTop3.map((d) => (
                    <li
                      key={d.key}
                      className="flex items-baseline gap-3 border-2 px-3 py-2 text-[14px]"
                      style={{
                        borderColor: color.deep,
                        background: color.soft,
                        boxShadow: `3px 3px 0 0 ${color.deep}`,
                      }}
                    >
                      <span
                        className="text-[10px] tracking-wider"
                        style={{
                          color: color.deep,
                          fontFamily: "var(--font-pixel-display)",
                        }}
                      >
                        {d.key}
                      </span>
                      <span className="text-[#221E18]">{d.name}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-6 text-[13px] leading-[1.55] text-[#4A4338]">
                  {t("res.radar_note", locale)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Three closest philosophers ─────────────────────────
          Pixel character cards with procedural sprites + key idea
          in Cormorant. */}
      <section className="px-6 py-12 sm:px-10 sm:py-16">
        <div className="mx-auto max-w-[1100px]">
          <div
            className="text-[10px] tracking-[0.26em]"
            style={{
              color: color.deep,
              fontFamily: "var(--font-pixel-display)",
            }}
          >
            {t("res.stood_near", locale)}
          </div>
          <h2
            className="mt-4 pr-2 text-[24px] leading-[1.1] tracking-[0.04em] text-[#221E18] sm:text-[32px] md:text-[40px]"
            style={{ fontFamily: "var(--font-pixel-display)" }}
          >
            <span style={{ textShadow: "3px 3px 0 #B8862F" }}>
              {t("res.nearest_three", locale)}
            </span>
          </h2>

          <ul className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
            {closest.map((p) => {
              const pc = getArchetypeColor(p.archetypeKey);
              return (
                <li key={p.slug}>
                  <Link
                    href={`/philosopher/${p.slug}`}
                    className="group block h-full transition-transform hover:-translate-x-1 hover:-translate-y-1"
                  >
                    <div
                      className="pixel-panel h-full"
                      style={{
                        background: pc.soft,
                        borderColor: pc.deep,
                        boxShadow: `4px 4px 0 0 ${pc.deep}`,
                      }}
                    >
                      {/* Same min-h fix as /archetype index — keeps
                          the title bar aligned across cards even when
                          archetype names wrap differently. */}
                      <div
                        className="flex min-h-[44px] items-center justify-between border-b-4 px-3 py-2 text-[10px] tracking-[0.2em]"
                        style={{
                          borderColor: pc.deep,
                          background: pc.deep,
                          color: pc.soft,
                          fontFamily: "var(--font-pixel-display)",
                        }}
                      >
                        <span>{archFull(p.archetypeKey).toUpperCase()}</span>
                        <span>{Math.round(p.sim * 100)}%</span>
                      </div>
                      <div className="flex flex-col items-center px-5 py-5 text-center">
                        <PhilosopherSprite
                          name={p.name}
                          archetypeKey={p.archetypeKey}
                          size={96}
                          floating
                        />
                        <div className="mt-4 text-[18px] font-medium text-[#221E18]">
                          {p.name}
                        </div>
                        <div className="mt-1 text-[12px] text-[#8C6520]">
                          {p.dates}
                        </div>
                        <p
                          className="mt-4 text-[14px] leading-[1.5] text-[#4A4338]"
                          style={{ fontFamily: "var(--font-editorial)" }}
                        >
                          <em>&ldquo;{p.keyIdea}&rdquo;</em>
                        </p>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ─── Constellation with you on it ───────────────────── */}
      <section className="border-y-4 border-[#221E18] bg-[#FFFCF4] px-6 py-14 sm:px-10 sm:py-20">
        <div className="mx-auto max-w-[1200px]">
          <div className="max-w-[760px]">
            <div
              className="text-[10px] tracking-[0.26em]"
              style={{
                color: color.deep,
                fontFamily: "var(--font-pixel-display)",
              }}
            >
              {t("res.where_you_sit", locale)}
            </div>
            <h2
              className="mt-4 pr-2 text-[24px] leading-[1.1] tracking-[0.04em] text-[#221E18] sm:text-[32px] md:text-[40px]"
              style={{ fontFamily: "var(--font-pixel-display)" }}
            >
              <span style={{ textShadow: "3px 3px 0 #B8862F" }}>
                {t("res.you_on_map", locale)}
              </span>
            </h2>
            <p className="mt-5 max-w-[640px] text-[16px] leading-[1.6] text-[#4A4338]">
              {t("res.map_note", locale)}
            </p>
          </div>

          <div className="mt-10 border-4 border-[#221E18] bg-[#0E1419] shadow-[8px_8px_0_0_#8C6520]">
            <div
              className="flex items-center justify-between border-b-4 border-[#221E18] bg-[#221E18] px-4 py-2 text-[10px] tracking-[0.18em] text-[#F8EDC8]"
              style={{ fontFamily: "var(--font-pixel-display)" }}
            >
              <span>{t("res.map_position", locale)}</span>
              <span className="text-[#B8862F]">{t("res.drag_zoom_hover", locale)}</span>
            </div>
            <ConstellationMount
              userVector={vector}
              height={640}
              variant="interactive"
            />
          </div>
        </div>
      </section>

      {/* ─── Walking tour — Cormorant inside pixel chrome ─────── */}
      <section className="mx-auto max-w-[860px] px-6 py-16 sm:px-10 sm:py-24">
        <div className="pixel-panel">
          <div
            className="flex items-center justify-between border-b-4 border-[#221E18] bg-[#221E18] px-4 py-2 text-[10px] tracking-[0.22em] text-[#F8EDC8]"
            style={{ fontFamily: "var(--font-pixel-display)" }}
          >
            <span>{t("res.orientation_sees", locale)}</span>
            <span className="text-[#B8862F]">LIBRARY_ENTRY</span>
          </div>
          <div className="px-6 py-8 sm:px-10 sm:py-10">
            <p
              className="text-[18px] leading-[1.55] text-[#221E18] sm:text-[20px]"
              style={{ fontFamily: "var(--font-prose)" }}
            >
              {whatItGetsRight}
            </p>
            <div
              className="mt-10 text-[10px] tracking-[0.24em]"
              style={{
                color: color.deep,
                fontFamily: "var(--font-pixel-display)",
              }}
            >
              {t("res.where_falters", locale)}
            </div>
            <p
              className="mt-4 text-[16px] leading-[1.55] text-[#4A4338] sm:text-[18px]"
              style={{ fontFamily: "var(--font-prose)" }}
            >
              {whereItFalters}
            </p>
          </div>
        </div>
      </section>

      {/* ─── Next steps — pixel buttons ─────────────────────── */}
      <section className="mx-auto max-w-[1100px] px-6 pb-32 pt-8 sm:px-10">
        {/* Anonymous viewers see a promoted full-width signup card
            on top — that's THE action that determines whether Mull
            keeps them. The other two cards (essay + retake) sit
            below in a 2-col. Signed-in viewers don't see the signup
            promotion (they already saved); they get the standard
            3-col footer with no signup card. */}
        {!isSignedIn && (
          <Link
            href="/signup"
            className="pixel-panel pixel-press pixel-press--lg block"
            style={{
              background: '#F8EDC8',
              borderColor: '#221E18',
              boxShadow: '6px 6px 0 0 #B8862F',
              marginBottom: 18,
              transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end)',
            }}
          >
            <div
              className="border-b-4 border-[#221E18] bg-[#221E18] px-5 py-2.5 text-[11px] tracking-[0.22em] text-[#B8862F]"
              style={{ fontFamily: "var(--font-pixel-display)" }}
            >
              <span className="pixel-blink">▶</span> {t("res.save_result", locale)}
            </div>
            <div className="grid gap-4 px-6 py-7 md:grid-cols-[1fr_auto] md:items-center sm:px-8">
              <div>
                <div className="text-[22px] font-medium text-[#221E18] sm:text-[24px]">
                  {t("res.disappears", locale)}
                </div>
                <p className="mt-3 text-[14px] leading-[1.55] text-[#4A4338] sm:text-[15px]">
                  {t("res.save_body", locale)}
                </p>
              </div>
              <span
                className="inline-block px-5 py-3 text-[12px] tracking-[0.08em] text-[#1A1612]"
                style={{
                  fontFamily: "var(--font-pixel-display)",
                  background: '#B8862F',
                  border: '4px solid #221E18',
                  boxShadow: '4px 4px 0 0 #221E18',
                  textTransform: 'uppercase',
                }}
              >
                {t("res.create_account", locale)}
              </span>
            </div>
          </Link>
        )}

        {/* HERO next-step: the archetype essay. The single most
            natural continuation — "now read about the kind of mind
            you turned out to be." Full-width, archetype-themed
            shadow so it visually anchors. */}
        <Link
          href={`/archetype/${topKey}`}
          className="pixel-panel pixel-press--lg block transition-transform"
          style={{
            background: color.soft,
            borderColor: color.deep,
            boxShadow: `6px 6px 0 0 ${color.deep}`,
            marginBottom: 16,
          }}
        >
          <div
            className="border-b-4 px-5 py-2.5 text-[11px] tracking-[0.22em]"
            style={{
              borderColor: color.deep,
              background: color.deep,
              color: color.soft,
              fontFamily: "var(--font-pixel-display)",
            }}
          >
            {t("res.read_on", locale)}
          </div>
          <div className="grid gap-4 px-6 py-7 md:grid-cols-[1fr_auto] md:items-center sm:px-8">
            <div>
              <div className="text-[22px] font-medium sm:text-[24px]" style={{ color: color.deep }}>
                {t("res.read_essay", locale, { archetype: archBare(topKey) })}
              </div>
              <p className="mt-3 text-[14px] leading-[1.55] sm:text-[15px]" style={{ color: '#4A4338' }}>
                {t("res.essay_body", locale)}
              </p>
            </div>
            <span
              className="inline-block px-5 py-3 text-[12px] tracking-[0.08em]"
              style={{
                fontFamily: "var(--font-pixel-display)",
                color: color.soft,
                background: color.deep,
                border: '4px solid #221E18',
                boxShadow: '4px 4px 0 0 #221E18',
                textTransform: 'uppercase',
              }}
            >
              {t("res.open_essay", locale)}
            </span>
          </div>
        </Link>

        {/* TIER 2: two peer next-actions — argue a philosopher (Arena)
            + take the narrative quiz (Inheritor). These are the two
            "now what" paths after seeing your placement. Same visual
            weight, color-coded (teal for Arena = "test yourself";
            amber for Inheritor = "go deeper into who you are"). */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Link
            href="/arena"
            className="pixel-panel block transition-transform hover:-translate-x-1 hover:-translate-y-1"
            style={{
              borderColor: '#221E18',
              boxShadow: '4px 4px 0 0 #2F5D5C',
            }}
          >
            <div
              className="border-b-4 border-[#221E18] bg-[#221E18] px-4 py-2 text-[10px] tracking-[0.22em] text-[#F8EDC8]"
              style={{ fontFamily: "var(--font-pixel-display)" }}
            >
              {t("res.arena_eyebrow", locale)}
            </div>
            <div className="px-5 py-5">
              <div className="text-[18px] font-medium text-[#221E18]">
                {t("res.arena_title", locale)}
              </div>
              <p className="mt-3 text-[13px] leading-[1.5] text-[#4A4338]">
                {t("res.arena_body", locale)}
              </p>
            </div>
          </Link>

          <Link
            href="/quiz/journey"
            className="pixel-panel block transition-transform hover:-translate-x-1 hover:-translate-y-1"
          >
            <div
              className="border-b-4 border-[#221E18] bg-[#221E18] px-4 py-2 text-[10px] tracking-[0.22em] text-[#F8EDC8]"
              style={{ fontFamily: "var(--font-pixel-display)" }}
            >
              {t("res.inheritor_eyebrow", locale)}
            </div>
            <div className="px-5 py-5">
              <div className="text-[18px] font-medium text-[#221E18]">
                {t("res.inheritor_title", locale)}
              </div>
              <p className="mt-3 text-[13px] leading-[1.5] text-[#4A4338]">
                {t("res.inheritor_body", locale)}
              </p>
            </div>
          </Link>
        </div>

        {/* TIER 3: quiet links for the optional actions — retake the
            classic, or (signed-in) open your trajectory page. */}
        <div className="mt-6 flex flex-wrap items-center gap-4 text-[13px] text-[#8C6520]">
          <span
            className="text-[10px] tracking-[0.22em]"
            style={{ fontFamily: "var(--font-pixel-display)" }}
          >
            {t("res.also", locale)}
          </span>
          <Link href="/quiz?mode=quick" className="hover:text-[#221E18] underline decoration-[#D6CDB6] underline-offset-3 hover:decoration-[#8C6520]">
            {t("res.retake_classic", locale)}
          </Link>
          {isSignedIn && (
            <>
              <span>·</span>
              <Link href="/account" className="hover:text-[#221E18] underline decoration-[#D6CDB6] underline-offset-3 hover:decoration-[#8C6520]">
                {t("res.see_trajectory", locale)}
              </Link>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

// ────────────────────────────────────────────────────────────────
// AlignmentCounter — counts up from 0 to target over ~0.9s on mount.
// Big chunky pixel-display digits.
//
// First-view detection: we stash a per-target sessionStorage flag so
// a user who refreshes the page or comes back via browser back gets
// the final number directly, without the count-up theatre. Avoids
// the "every time I see this, it animates again" annoyance.
// ────────────────────────────────────────────────────────────────
const SEEN_RESULT_KEY = 'mull.result.seen.v1';

function AlignmentCounter({
  target,
  color,
  locale,
}: {
  target: number;
  color: string;
  locale: Locale;
}) {
  // Detect first-view synchronously so we don't flash a 0 → target
  // animation on returning visits. We treat the sessionStorage flag
  // as "this exact target has been seen this session" — not strict
  // identity, since a fresh quiz attempt produces a new ResultClient
  // mount with a likely-different target value anyway.
  //
  // Also: respect prefers-reduced-motion — skip the animation entirely
  // and start at the final value for users who've opted out of motion.
  const [display, setDisplay] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    try {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced) return target;
      const seen = window.sessionStorage.getItem(SEEN_RESULT_KEY);
      if (seen && Number(seen) === target) return target;
    } catch {/* sessionStorage / matchMedia disabled — fall through to animation */}
    return 0;
  });

  useEffect(() => {
    // If we already started at the final value, no animation needed.
    if (display === target) {
      try { window.sessionStorage.setItem(SEEN_RESULT_KEY, String(target)); } catch { /* ignore */ }
      return;
    }
    const duration = 900; // ms
    const start = performance.now();
    let raf: number;
    function step(now: number) {
      const t = Math.min(1, (now - start) / duration);
      // Ease-out cubic so the count slows near the end
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(target * eased));
      if (t < 1) {
        raf = requestAnimationFrame(step);
      } else {
        try { window.sessionStorage.setItem(SEEN_RESULT_KEY, String(target)); } catch { /* ignore */ }
      }
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // We intentionally don't include `display` in deps — it would
    // re-trigger the animation on every step.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return (
    <div>
      <div
        className="text-[10px] tracking-[0.22em]"
        style={{ color, fontFamily: "var(--font-pixel-display)" }}
      >
        {t("res.alignment", locale)}
      </div>
      {/* Cap the digit size to 36px so the `%` glyph + 2-px hard
          shadow stay within the parent column. Display digits
          + percent sit on one baseline. */}
      <div className="mt-1 flex items-baseline gap-1.5">
        <span
          className="text-[36px] leading-none tracking-[0.04em]"
          style={{
            color,
            fontFamily: "var(--font-pixel-display)",
            textShadow: "2px 2px 0 #B8862F",
          }}
        >
          {display}
        </span>
        <span
          className="text-[20px] leading-none"
          style={{
            color,
            fontFamily: "var(--font-pixel-display)",
            textShadow: "2px 2px 0 #B8862F",
          }}
        >
          %
        </span>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// RadarChart — 16-D fingerprint as a polygon on a radial grid.
// Pure SVG, server-renderable, no Three.js. Draws itself via CSS
// stroke-dashoffset animation on the user polygon.
// ────────────────────────────────────────────────────────────────
function RadarChart({
  points,
  color,
  accent,
}: {
  points: DimRadarPoint[];
  color: string;
  accent: string;
}) {
  const SIZE = 420;
  const CENTER = SIZE / 2;
  const RADIUS = SIZE / 2 - 50;

  // Polygon vertex for each dim — evenly distributed around the
  // circle. Value 0..1 maps to 0..RADIUS.
  function vertex(angle: number, value: number) {
    const r = value * RADIUS;
    return {
      x: CENTER + Math.cos(angle - Math.PI / 2) * r,
      y: CENTER + Math.sin(angle - Math.PI / 2) * r,
    };
  }

  const angleStep = (Math.PI * 2) / points.length;

  // Concentric pixel rings — 5 levels (every 0.2).
  const rings = [0.2, 0.4, 0.6, 0.8, 1].map((level) => {
    const pts = points
      .map((_, i) => {
        const v = vertex(i * angleStep, level);
        return `${v.x},${v.y}`;
      })
      .join(" ");
    return { level, pts };
  });

  // User's polygon
  const userPts = points
    .map((p, i) => {
      const v = vertex(i * angleStep, p.value);
      return `${v.x},${v.y}`;
    })
    .join(" ");

  // Polygon vertices for placing labels around the outside
  const labels = points.map((p, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const lr = RADIUS + 24;
    const lx = CENTER + Math.cos(angle) * lr;
    const ly = CENTER + Math.sin(angle) * lr;
    return { x: lx, y: ly, label: p.key };
  });

  return (
    <div className="mx-auto w-full max-w-[440px]">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        shapeRendering="crispEdges"
        className="block w-full"
      >
        {/* Concentric grid rings */}
        {rings.map(({ level, pts }) => (
          <polygon
            key={level}
            points={pts}
            fill="none"
            stroke="#D6CDB6"
            strokeWidth={1}
            strokeDasharray={level === 1 ? undefined : "3 3"}
          />
        ))}
        {/* Spokes */}
        {points.map((_, i) => {
          const v = vertex(i * angleStep, 1);
          return (
            <line
              key={i}
              x1={CENTER}
              y1={CENTER}
              x2={v.x}
              y2={v.y}
              stroke="#EBE3CA"
              strokeWidth={1}
            />
          );
        })}
        {/* User polygon */}
        <polygon
          points={userPts}
          fill={accent}
          fillOpacity={0.28}
          stroke={color}
          strokeWidth={3}
          strokeLinejoin="round"
        />
        {/* Dim vertices as pixel squares */}
        {points.map((p, i) => {
          const v = vertex(i * angleStep, p.value);
          return (
            <rect
              key={p.key}
              x={v.x - 3}
              y={v.y - 3}
              width={6}
              height={6}
              fill={color}
            />
          );
        })}
        {/* Labels */}
        {labels.map((l, i) => (
          <text
            key={i}
            x={l.x}
            y={l.y}
            fontSize={11}
            fontFamily="var(--font-pixel-display)"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#8C6520"
          >
            {l.label}
          </text>
        ))}
      </svg>
    </div>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ────────────────────────────────────────────────────────────────
// ChallengerBanner — renders only when the user arrived via a
// friend-challenge invite link. Surfaces a "Compare with <inviter>"
// CTA at the top of the result page. Also fires a fire-and-forget
// "accept" bump so the inviter's account telemetry reflects that
// their link actually worked.
// ────────────────────────────────────────────────────────────────
function ChallengerBanner({
  challengerHandle,
  challengerName,
  challengerCode,
  locale,
}: {
  challengerHandle: string | null;
  challengerName: string | null;
  challengerCode: string | null;
  locale: Locale;
}) {
  useEffect(() => {
    if (!challengerCode) return;
    // Fire-and-forget — increments accept_count on the friend_challenges
    // row so the inviter can see "3 friends took the quiz from your link"
    // on /account. Don't block render; ignore errors (the comparison
    // still works without the telemetry bump).
    fetch('/api/challenge/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: challengerCode }),
    }).catch(() => {});
  }, [challengerCode]);

  if (!challengerHandle || !challengerName) return null;

  return (
    <section className="mx-auto max-w-[1100px] px-6 pt-8 sm:px-10 sm:pt-12">
      <Link
        href={`/compare?them=${encodeURIComponent(challengerHandle)}`}
        className="pixel-press pixel-press--lg block"
        style={{
          padding: '20px 24px',
          background: '#F8EDC8',
          border: '4px solid #221E18',
          boxShadow: '5px 5px 0 0 #B8862F',
          borderRadius: 0,
          textDecoration: 'none',
          color: '#221E18',
          transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <span>
            <span
              style={{
                fontFamily: 'var(--font-pixel-display)',
                fontSize: 11,
                color: '#8C6520',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: 6,
              }}
            >
              {t("res.challenged_you", locale, { name: challengerName.toUpperCase() })}
            </span>
            <span
              style={{
                fontFamily: "var(--font-prose)",
                fontSize: 18,
              }}
            >
              {t("res.challenge_body", locale)}
            </span>
          </span>
          <span
            style={{
              color: '#1A1612',
              background: '#B8862F',
              padding: '10px 16px',
              border: '3px solid #221E18',
              boxShadow: '3px 3px 0 0 #221E18',
              fontFamily: 'var(--font-pixel-display)',
              fontSize: 12,
              letterSpacing: 0.4,
              textTransform: 'uppercase',
              flexShrink: 0,
            }}
          >
            {t("res.compare_now", locale)}
          </span>
        </div>
      </Link>
    </section>
  );
}
