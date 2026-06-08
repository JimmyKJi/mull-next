"use client";

// WanderingClient — renders the week's question + 4 beat panels.
// Each beat captures the user's response. Beats are independent —
// you can do them in any order and revisit any.
//
// Two of the beats surface real philosophers, picked from the user's
// own 16-D quiz coordinates (read client-side from localStorage, so it
// works for guest quiz-takers too — this whole feature is localStorage-
// driven and offline-friendly):
//   - Wed "Kindred": the 2 minds nearest you, weighted toward the
//     dimensions THIS question probes (question.touches).
//   - Fri "Far": the 1 mind furthest from you by that same
//     question-weighted metric.
// No vector yet (never took the quiz) → a gentle nudge instead, and the
// beats still work as free-writing scaffolds.

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  type WanderingQuestion,
  type WanderingResponse,
  WANDERING_KEY,
  WANDERING_BEATS,
} from "@/lib/wandering";
import {
  pickWanderingPhilosophers,
  coerceVector16,
  type WanderingPick,
  type WanderingPicks,
} from "@/lib/recommendations";
import { philosopherSlug } from "@/lib/philosophers";
import { getArchetypeColor } from "@/lib/archetype-colors";
import { PhilosopherSprite } from "@/components/philosopher-sprite";
import { emitFeatureEvent } from "@/lib/capabilities";
import { t, type Locale } from "@/lib/translations";

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";
const serif = "var(--font-editorial), Georgia, serif";
const VECTOR_KEY = "mull.vector";

type Beat = "Mon" | "Wed" | "Fri" | "Sun";

export default function WanderingClient({
  question,
  locale,
}: {
  question: WanderingQuestion;
  locale: Locale;
}) {
  const [responses, setResponses] = useState<WanderingResponse[] | null>(null);
  // null until hydration; then the vector-space picks (or empty if no
  // vector is stored). Kept in sync with `responses` so the beats and
  // their rosters appear together rather than in two flashes.
  const [picks, setPicks] = useState<WanderingPicks | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(WANDERING_KEY);
      const parsed = raw ? (JSON.parse(raw) as WanderingResponse[]) : [];
      setResponses(parsed);
    } catch {
      setResponses([]);
    }
    // Pick the kindred + far philosophers from the user's own coordinates.
    try {
      const rawVec = window.localStorage.getItem(VECTOR_KEY);
      const vector = rawVec ? coerceVector16(JSON.parse(rawVec)) : null;
      setPicks(pickWanderingPhilosophers(vector, question.touches));
    } catch {
      setPicks({ kindred: [], far: null });
    }
  }, [question]);

  function saveResponse(beat: Beat, text: string) {
    if (!responses) return;
    const trimmed = text.trim();
    if (!trimmed) return;
    const next = [
      ...responses.filter((r) => !(r.week === question.week && r.beat === beat)),
      { week: question.week, beat, text: trimmed, ts: Date.now() },
    ];
    setResponses(next);
    try {
      window.localStorage.setItem(WANDERING_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
    const xp = beat === "Sun" ? 2 : 1;
    emitFeatureEvent(
      "wandering",
      `${beat} response on week ${question.week}: ${trimmed.slice(0, 32)}…`,
      xp,
    );
  }

  if (responses === null) {
    return (
      <div className="text-center text-[14px] text-acc-deep" style={{ fontFamily: serif }}>
        {t("wndr.loading", locale)}
      </div>
    );
  }

  const week = question.week;
  const responsesByBeat = new Map<Beat, WanderingResponse>();
  for (const r of responses) {
    if (r.week === week) responsesByBeat.set(r.beat, r);
  }
  const beatsDone = responsesByBeat.size;

  return (
    <div className="space-y-5">
      {/* The question card */}
      <div
        className="border-[4px] border-ink p-6"
        style={{
          background: "#5D5777", // threshold-ish, since wandering is deep
          color: "var(--color-acc-soft)",
          boxShadow: "5px 5px 0 0 var(--color-ink)",
        }}
      >
        <div
          className="text-[10px] tracking-[0.22em]"
          style={{
            fontFamily: pixel,
            color: "#F8C75E",
            textTransform: "uppercase",
          }}
        >
          ▶ {t("wndr.this_weeks_question", locale)}
        </div>
        <h2
          className="mt-3 text-[26px] leading-tight"
          style={{ fontFamily: serif, color: "var(--color-acc-soft)" }}
        >
          {question.prompt}
        </h2>
        <p
          className="mt-3 text-[15px] italic leading-[1.6]"
          style={{ fontFamily: serif, color: "#E5DCC0" }}
        >
          {question.framing}
        </p>
        <div
          className="mt-4 inline-block border-2 border-[#F8C75E] px-2.5 py-1 text-[10px] tracking-[0.18em]"
          style={{
            fontFamily: pixel,
            color: "#F8C75E",
            textTransform: "uppercase",
          }}
        >
          {t("wndr.beats_answered", locale, { done: beatsDone })}
        </div>
      </div>

      {/* The four beats */}
      <ul className="space-y-3">
        {WANDERING_BEATS.map((b) => {
          // Two beats carry a vector-space roster. `picks === null` means
          // we haven't hydrated yet → render nothing (no flash); an empty
          // roster after hydration → the "take the quiz" nudge.
          let roster: ReactNode = null;
          if (b.day === "Wed") {
            roster = <KindredRoster picks={picks} locale={locale} />;
          } else if (b.day === "Fri") {
            roster = <FarRoster picks={picks} locale={locale} />;
          }
          return (
            <li key={b.day}>
              <BeatPanel
                beat={b.day as Beat}
                label={b.label}
                description={b.description}
                existing={responsesByBeat.get(b.day as Beat)}
                onSave={(text) => saveResponse(b.day as Beat, text)}
                locale={locale}
                roster={roster}
              />
            </li>
          );
        })}
      </ul>

      <p
        className="text-[13px] italic text-acc-deep"
        style={{ fontFamily: serif }}
      >
        {t("wndr.scaffolding_note", locale)}
      </p>
    </div>
  );
}

function BeatPanel({
  beat,
  label,
  description,
  existing,
  onSave,
  locale,
  roster,
}: {
  beat: Beat;
  label: string;
  description: string;
  existing?: WanderingResponse;
  onSave: (text: string) => void;
  locale: Locale;
  roster?: ReactNode;
}) {
  const [text, setText] = useState(existing?.text ?? "");
  const [open, setOpen] = useState(!existing);

  if (!open && existing) {
    return (
      <div
        className="border-l-[5px] border-[#5D5777] bg-[#FFFCF4] px-4 py-3"
        style={{ boxShadow: "3px 3px 0 0 var(--color-acc-deep)" }}
      >
        <div className="flex items-baseline justify-between gap-2">
          <span
            className="text-[10px] tracking-[0.22em] text-[#5D5777]"
            style={{ fontFamily: pixel, textTransform: "uppercase" }}
          >
            ✓ {beat} · {label}
          </span>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="text-[10px] tracking-[0.18em] text-acc-deep hover:text-ink"
            style={{ fontFamily: pixel, textTransform: "uppercase" }}
          >
            {t("wndr.edit", locale)}
          </button>
        </div>
        <p
          className="mt-2 text-[14.5px] leading-[1.55] text-ink"
          style={{ fontFamily: serif }}
        >
          {existing.text}
        </p>
      </div>
    );
  }

  return (
    <div
      className="border-l-[5px] border-[#5D5777] bg-[#FFFCF4] p-4"
      style={{ boxShadow: "3px 3px 0 0 var(--color-acc-deep)" }}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span
          className="text-[11px] tracking-[0.22em] text-[#5D5777]"
          style={{ fontFamily: pixel, textTransform: "uppercase" }}
        >
          ▶ {beat} · {label}
        </span>
        {existing && (
          <button
            type="button"
            onClick={() => {
              setText(existing.text);
              setOpen(false);
            }}
            className="text-[10px] tracking-[0.18em] text-acc-deep"
            style={{ fontFamily: pixel, textTransform: "uppercase" }}
          >
            {t("wndr.cancel", locale)}
          </button>
        )}
      </div>
      <p
        className="mt-1 text-[13px] italic text-[#5C4528]"
        style={{ fontFamily: serif }}
      >
        {description}
      </p>
      {/* Vector-space roster (Wed/Fri only) — the minds this beat asks you
          to react to, picked from your own coordinates. */}
      {roster ? <div className="mt-3">{roster}</div> : null}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5}
        placeholder={t("wndr.placeholder", locale)}
        style={{
          marginTop: 10,
          width: "100%",
          padding: "10px 12px",
          background: "#FBF6E8",
          border: "2px solid var(--color-ink)",
          fontFamily: serif,
          fontSize: 15,
          color: "var(--color-ink)",
          resize: "vertical",
          minHeight: 100,
          borderRadius: 0,
        }}
      />
      <button
        type="button"
        onClick={() => {
          onSave(text);
          setOpen(false);
        }}
        disabled={!text.trim()}
        className="mt-3 border-[3px] border-ink px-3 py-2 text-[11px] tracking-[0.18em] text-[#1A1820]"
        style={{
          fontFamily: pixel,
          textTransform: "uppercase",
          background: text.trim() ? "#F8C75E" : "var(--color-line)",
          boxShadow: text.trim() ? "3px 3px 0 0 #5D5777" : "none",
          cursor: text.trim() ? "pointer" : "default",
          opacity: text.trim() ? 1 : 0.5,
        }}
      >
        ▶ {t("wndr.save_beat", locale, { beat })}
      </button>
    </div>
  );
}

// ─── Vector-space rosters ──────────────────────────────────────────────

function KindredRoster({
  picks,
  locale,
}: {
  picks: WanderingPicks | null;
  locale: Locale;
}) {
  if (!picks) return null; // not hydrated yet
  if (!picks.kindred.length) return <NoVectorNudge locale={locale} />;
  return (
    <div>
      <p className="text-[13px] italic leading-[1.55] text-[#5C4528]" style={{ fontFamily: serif }}>
        {t("wndr.kindred_intro", locale)}
      </p>
      <ul className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {picks.kindred.map((pick) => (
          <li key={pick.philosopher.name}>
            <RosterCard pick={pick} tone="kindred" locale={locale} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function FarRoster({
  picks,
  locale,
}: {
  picks: WanderingPicks | null;
  locale: Locale;
}) {
  if (!picks) return null; // not hydrated yet
  if (!picks.far) return <NoVectorNudge locale={locale} />;
  return (
    <div>
      <p className="text-[13px] italic leading-[1.55] text-[#5C4528]" style={{ fontFamily: serif }}>
        {t("wndr.far_intro", locale)}
      </p>
      <div className="mt-2">
        <RosterCard pick={picks.far} tone="far" locale={locale} />
      </div>
    </div>
  );
}

function RosterCard({
  pick,
  tone,
  locale,
}: {
  pick: WanderingPick;
  tone: "kindred" | "far";
  locale: Locale;
}) {
  const p = pick.philosopher;
  const color = getArchetypeColor(p.archetypeKey);
  // The wandering question + framing are English-only (hardcoded in
  // lib/wandering.ts), so the philosopher's own fields stay English too —
  // consistent with the page, and it keeps the heavy philosophers-i18n
  // data out of this client bundle. The chip/intro chrome IS localized.
  const axisName = pick.axis ? t(`dim.${pick.axis}.name`, locale) : null;
  const chip =
    tone === "kindred"
      ? axisName
        ? t("wndr.near_axis", locale, { dim: axisName })
        : t("wndr.near_generic", locale)
      : axisName
        ? t("wndr.far_axis", locale, { dim: axisName })
        : t("wndr.far_generic", locale);

  return (
    <Link
      href={`/philosopher/${philosopherSlug(p.name)}`}
      className="pixel-press flex items-start gap-3 border-2 px-3 py-2.5 transition-all hover:translate-x-[-1px] hover:translate-y-[-1px]"
      style={{
        borderColor: "var(--color-ink)",
        background: "#FFFCF4",
        boxShadow: `3px 3px 0 0 ${color.deep}`,
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <div
        className="shrink-0 border-2 p-1"
        style={{ borderColor: color.deep, background: "#FBFAF2" }}
        aria-hidden
      >
        <PhilosopherSprite name={p.name} archetypeKey={p.archetypeKey} size={40} />
      </div>
      <div className="min-w-0 flex-1">
        <span
          className="inline-block px-1.5 py-0.5 text-[8.5px] tracking-[0.12em]"
          style={{
            fontFamily: pixel,
            background: color.deep,
            color: "#FFFCF4",
            textTransform: "uppercase",
          }}
        >
          {chip}
        </span>
        <div
          className="mt-1 text-[14.5px] font-medium leading-tight text-ink"
          style={{ fontFamily: "var(--font-prose)" }}
        >
          {p.name}
        </div>
        <div className="mt-0.5 text-[10.5px] tracking-wide text-acc-deep">
          {p.dates}
        </div>
        <p
          className="mt-1 text-[12px] italic leading-snug text-ink-soft"
          style={{
            fontFamily: serif,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {p.keyIdea}
        </p>
      </div>
    </Link>
  );
}

function NoVectorNudge({ locale }: { locale: Locale }) {
  return (
    <div
      className="border-2 border-dashed px-3 py-2.5"
      style={{ borderColor: "var(--color-acc)", background: "#FBF6E8" }}
    >
      <p className="text-[13px] italic leading-[1.5] text-[#5C4528]" style={{ fontFamily: serif }}>
        {t("wndr.no_vector_nudge", locale)}
      </p>
      <Link
        href="/quiz/journey"
        className="mt-2 inline-block text-[10px] tracking-[0.18em] text-acc-deep underline decoration-acc/40 underline-offset-2 hover:text-ink"
        style={{ fontFamily: pixel, textTransform: "uppercase" }}
      >
        {t("wndr.no_vector_cta", locale)}
      </Link>
    </div>
  );
}
