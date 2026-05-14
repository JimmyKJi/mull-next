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
};

export function ResultClient({
  vector,
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
}: Props) {
  const color = getArchetypeColor(topKey);

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
            <span><span className="pixel-blink">▶</span> QUEST COMPLETE</span>
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
                YOU ARE
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
                <div
                  className="text-[28px] sm:text-[40px] md:text-[44px]"
                  style={{ textShadow: `3px 3px 0 ${color.primary}` }}
                >
                  THE
                </div>
                <div
                  className="mt-2 text-[34px] sm:text-[52px] md:text-[64px]"
                  style={{ textShadow: `3px 3px 0 ${color.primary}` }}
                >
                  {capitalize(topKey).toUpperCase()}
                </div>
              </h1>

              <p
                className="mt-7 max-w-[520px] text-[18px] leading-[1.45] text-[#221E18] sm:text-[20px]"
                style={{ fontFamily: "var(--font-prose)" }}
              >
                <em>&ldquo;{spirit}&rdquo;</em>
              </p>

              {/* Alignment count-up + runner-up */}
              <div className="mt-8 flex flex-wrap items-end gap-6">
                <AlignmentCounter target={alignmentPct} color={color.deep} />
                <div className="text-[13px] text-[#4A4338]">
                  <div
                    className="text-[10px] tracking-[0.22em]"
                    style={{ color: color.deep, fontFamily: "var(--font-pixel-display)" }}
                  >
                    RUNNER-UP
                  </div>
                  <div className="mt-1">
                    The {capitalize(runnerUpKey)} ·{" "}
                    <span style={{ color: color.deep }}>{runnerUpPct}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
              <span>▶ YOUR 16-D FINGERPRINT</span>
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
                  YOUR STRONGEST TENDENCIES
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
                  The radar shows where each of your 16 dimensions
                  sits on a 0–10 scale. The further from center,
                  the stronger that tendency in your answers.
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
            ▶ STOOD NEAR YOU
          </div>
          <h2
            className="mt-4 pr-2 text-[24px] leading-[1.1] tracking-[0.04em] text-[#221E18] sm:text-[32px] md:text-[40px]"
            style={{ fontFamily: "var(--font-pixel-display)" }}
          >
            <span style={{ textShadow: "3px 3px 0 #B8862F" }}>
              THE NEAREST THREE
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
                      <div
                        className="flex items-center justify-between border-b-4 px-3 py-2 text-[10px] tracking-[0.2em]"
                        style={{
                          borderColor: pc.deep,
                          background: pc.deep,
                          color: pc.soft,
                          fontFamily: "var(--font-pixel-display)",
                        }}
                      >
                        <span>THE {p.archetypeKey.toUpperCase()}</span>
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
                          style={{ fontFamily: "var(--font-prose)" }}
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
              ▶ WHERE YOU SIT
            </div>
            <h2
              className="mt-4 pr-2 text-[24px] leading-[1.1] tracking-[0.04em] text-[#221E18] sm:text-[32px] md:text-[40px]"
              style={{ fontFamily: "var(--font-pixel-display)" }}
            >
              <span style={{ textShadow: "3px 3px 0 #B8862F" }}>
                YOU ON THE MAP
              </span>
            </h2>
            <p className="mt-5 max-w-[640px] text-[16px] leading-[1.6] text-[#4A4338]">
              The dark amber pulse is you. Hover the colored points
              nearby to read who they were. Use the legend to hide
              other archetypes — see who specifically sits near you.
            </p>
          </div>

          <div className="mt-10 border-4 border-[#221E18] bg-[#0E1419] shadow-[8px_8px_0_0_#8C6520]">
            <div
              className="flex items-center justify-between border-b-4 border-[#221E18] bg-[#221E18] px-4 py-2 text-[10px] tracking-[0.18em] text-[#F8EDC8]"
              style={{ fontFamily: "var(--font-pixel-display)" }}
            >
              <span>▶ MAP_OF_MINDS.EXE — YOUR POSITION</span>
              <span className="text-[#B8862F]">DRAG · ZOOM · HOVER</span>
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
            <span>▶ WHAT THIS ORIENTATION SEES</span>
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
              ▶ WHERE IT FALTERS
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Link
            href={`/archetype/${topKey}`}
            className="pixel-panel block transition-transform hover:-translate-x-1 hover:-translate-y-1"
            style={{
              background: color.soft,
              borderColor: color.deep,
              boxShadow: `4px 4px 0 0 ${color.deep}`,
            }}
          >
            <div
              className="border-b-4 px-4 py-2 text-[10px] tracking-[0.22em]"
              style={{
                borderColor: color.deep,
                background: color.deep,
                color: color.soft,
                fontFamily: "var(--font-pixel-display)",
              }}
            >
              ▶ READ ON
            </div>
            <div className="px-5 py-5">
              <div className="text-[18px] font-medium" style={{ color: color.deep }}>
                The full essay on the {capitalize(topKey)}
              </div>
              <div
                className="mt-3 text-[12px] tracking-[0.2em]"
                style={{ color: color.deep, fontFamily: "var(--font-pixel-display)" }}
              >
                ▶ OPEN ESSAY
              </div>
            </div>
          </Link>

          <Link
            href="/quiz?mode=quick"
            className="pixel-panel block transition-transform hover:-translate-x-1 hover:-translate-y-1"
          >
            <div
              className="border-b-4 border-[#221E18] bg-[#221E18] px-4 py-2 text-[10px] tracking-[0.22em] text-[#F8EDC8]"
              style={{ fontFamily: "var(--font-pixel-display)" }}
            >
              ▶ TRY AGAIN
            </div>
            <div className="px-5 py-5">
              <div className="text-[18px] font-medium text-[#221E18]">
                Retake the quiz
              </div>
              <p className="mt-3 text-[13px] leading-[1.5] text-[#4A4338]">
                The same questions; a fresh attempt. Useful when an
                answer surprised you the first time through.
              </p>
            </div>
          </Link>

          <Link
            href="/signup"
            className="pixel-panel block transition-transform hover:-translate-x-1 hover:-translate-y-1"
          >
            <div
              className="border-b-4 border-[#221E18] bg-[#221E18] px-4 py-2 text-[10px] tracking-[0.22em] text-[#F8EDC8]"
              style={{ fontFamily: "var(--font-pixel-display)" }}
            >
              ▶ SAVE IT
            </div>
            <div className="px-5 py-5">
              <div className="text-[18px] font-medium text-[#221E18]">
                Create an account
              </div>
              <p className="mt-3 text-[13px] leading-[1.5] text-[#4A4338]">
                Free. Tracks how your position shifts over time as
                you write dilemmas, diary entries, and reflections.
              </p>
            </div>
          </Link>
        </div>
      </section>
    </main>
  );
}

// ────────────────────────────────────────────────────────────────
// AlignmentCounter — counts up from 0 to target over ~0.9s on mount.
// Big chunky pixel-display digits.
// ────────────────────────────────────────────────────────────────
function AlignmentCounter({
  target,
  color,
}: {
  target: number;
  color: string;
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const duration = 900; // ms
    const start = performance.now();
    let raf: number;
    function step(now: number) {
      const t = Math.min(1, (now - start) / duration);
      // Ease-out cubic so the count slows near the end
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  return (
    <div>
      <div
        className="text-[10px] tracking-[0.22em]"
        style={{ color, fontFamily: "var(--font-pixel-display)" }}
      >
        ALIGNMENT
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
