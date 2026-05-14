"use client";

// QuizEngine — client state machine for the v2 quiz.
//
// Design intent (DESIGN-DIRECTION.md §3):
//   "Single question at a time. Each question is its own moment —
//   minimal chrome, generous prompt, answer cards that feel like
//   deliberate choices rather than radio buttons. A faint progress
//   dot, not a bar. No-go: bouncy progress animation, sound effects,
//   gamification beyond the actual moral seriousness of the prompts."
//
// What this does:
//   - Tracks idx, running 16-D vector, answers history (so Back works)
//   - Persists to sessionStorage so refresh doesn't lose progress
//   - On finish: base64-encodes the vector into ?v= and pushes to
//     /result. URL convention matches mull.html's share links so
//     old links keep working post-cutover.

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Question } from "@/lib/quiz-questions";
import { add, scale, zeros } from "@/lib/vectors";
import {
  getLocalizedQuickQuestion,
  type SupportedQuizLocale,
} from "@/lib/quiz-i18n";
import type { Locale } from "@/lib/translations";
import { t } from "@/lib/translations";

type Props = {
  questions: Question[];
  mode: "quick" | "detailed";
  locale: Locale;
};

// Per-question history. `single` = one answer picked. `multi` = up to
// `max` answers picked (vectors get averaged). `skip` = user skipped.
type AnswerHistoryEntry =
  | { kind: "single"; index: number }
  | { kind: "multi"; indices: number[] }
  | { kind: "skip" };

// sessionStorage payload. Keyed by mode so quick + detailed have
// separate resume states (otherwise jumping between modes would
// corrupt the running vector).
type PersistedState = {
  idx: number;
  answers: AnswerHistoryEntry[];
  vector: number[];
  mode: "quick" | "detailed";
};

const STORAGE_PREFIX = "mull.quiz.progress.";

export function QuizEngine({ questions, mode, locale }: Props) {
  const router = useRouter();

  const [idx, setIdx] = useState(0);
  const [vector, setVector] = useState<number[]>(zeros);
  const [answers, setAnswers] = useState<AnswerHistoryEntry[]>([]);
  const [multiPicks, setMultiPicks] = useState<number[]>([]);
  const [resumed, setResumed] = useState(false);

  // Hydrate from sessionStorage on mount. Not via useState's
  // initializer because sessionStorage is undefined during SSR.
  useEffect(() => {
    if (resumed) return;
    setResumed(true);
    try {
      const raw = window.sessionStorage.getItem(STORAGE_PREFIX + mode);
      if (!raw) return;
      const parsed = JSON.parse(raw) as PersistedState;
      if (
        parsed.mode === mode &&
        Number.isInteger(parsed.idx) &&
        parsed.idx >= 0 &&
        parsed.idx < questions.length &&
        Array.isArray(parsed.vector) &&
        parsed.vector.length === 16
      ) {
        setIdx(parsed.idx);
        setVector(parsed.vector);
        setAnswers(parsed.answers ?? []);
      }
    } catch {
      // Corrupt stash — start fresh.
    }
  }, [mode, questions.length, resumed]);

  // Persist on every state change once we're past the initial
  // hydration. Cheap; sessionStorage writes are synchronous but the
  // payload is tiny.
  useEffect(() => {
    if (!resumed) return;
    try {
      const payload: PersistedState = { idx, answers, vector, mode };
      window.sessionStorage.setItem(
        STORAGE_PREFIX + mode,
        JSON.stringify(payload),
      );
    } catch {
      /* storage disabled or full — fine */
    }
  }, [idx, vector, answers, mode, resumed]);

  const question = questions[idx];
  const isMulti = !!question?.multi;
  const maxPicks = question?.multi?.max ?? 1;

  // Resolve the localized version if we have one. The detailed
  // (50-question) set is English-only per AGENTS.md content policy;
  // only the quick set has translations.
  const localized = useMemo(() => {
    if (mode === "detailed" || locale === "en") return null;
    return getLocalizedQuickQuestion(idx, locale as SupportedQuizLocale);
  }, [idx, locale, mode]);

  const prompt = localized?.p ?? question?.p ?? "";
  const answerTexts = useMemo(() => {
    if (!question) return [];
    return question.a.map((ans, i) => localized?.a[i] ?? ans.t);
  }, [question, localized]);

  // Reset multi-pick state on question change.
  const lastIdx = useRef(idx);
  useEffect(() => {
    if (lastIdx.current !== idx) {
      setMultiPicks([]);
      lastIdx.current = idx;
    }
  }, [idx]);

  function selectSingle(answerIdx: number) {
    if (!question) return;
    const delta = question.a[answerIdx]?.v ?? zeros();
    const newVector = add(vector, delta);
    advance(newVector, [
      ...answers,
      { kind: "single", index: answerIdx },
    ]);
  }

  function toggleMulti(answerIdx: number) {
    setMultiPicks((prev) => {
      if (prev.includes(answerIdx)) {
        return prev.filter((i) => i !== answerIdx);
      }
      if (prev.length >= maxPicks) return prev;
      return [...prev, answerIdx];
    });
  }

  function submitMulti() {
    if (!question || multiPicks.length === 0) return;
    // Sum then divide by count — so multi-pick doesn't double-count
    // weight vs single-pick. Same approach as mull.html.
    const summed = multiPicks.reduce(
      (acc, i) => add(acc, question.a[i].v),
      zeros(),
    );
    const delta = scale(summed, 1 / multiPicks.length);
    advance(add(vector, delta), [
      ...answers,
      { kind: "multi", indices: multiPicks },
    ]);
  }

  function skip() {
    advance(vector, [...answers, { kind: "skip" }]);
  }

  function advance(
    newVector: number[],
    newAnswers: AnswerHistoryEntry[],
  ) {
    if (idx + 1 >= questions.length) {
      finish(newVector);
      return;
    }
    setVector(newVector);
    setAnswers(newAnswers);
    setIdx(idx + 1);
  }

  function goBack() {
    if (idx === 0) return;
    // Recompute from scratch by replaying all-but-last answers.
    // Keeps `answers` as source of truth; protects against vector
    // drift from add/subtract rounding.
    const prevAnswers = answers.slice(0, -1);
    let prevVec = zeros();
    for (let i = 0; i < prevAnswers.length; i++) {
      const a = prevAnswers[i];
      const q = questions[i];
      if (!q) break;
      if (a.kind === "single") {
        prevVec = add(prevVec, q.a[a.index]?.v ?? zeros());
      } else if (a.kind === "multi") {
        const summed = a.indices.reduce(
          (acc, idx) => add(acc, q.a[idx]?.v ?? zeros()),
          zeros(),
        );
        prevVec = add(prevVec, scale(summed, 1 / a.indices.length));
      }
      // skip contributes 0.
    }
    setVector(prevVec);
    setAnswers(prevAnswers);
    setIdx(idx - 1);
    setMultiPicks([]);
  }

  function finish(finalVector: number[]) {
    try {
      window.sessionStorage.removeItem(STORAGE_PREFIX + mode);
    } catch {
      /* ignore */
    }
    const v = btoa(JSON.stringify(finalVector.map((n) => +n.toFixed(3))));
    router.push(`/result?v=${encodeURIComponent(v)}&m=${mode}`);
  }

  if (!question) {
    return (
      <div className="mx-auto max-w-[720px] px-6 py-32 text-center text-[#4A4338]">
        Loading…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[820px] px-6 pt-12 pb-24 sm:px-10 sm:pt-20 sm:pb-32">
      {/* Faint progress dots only — the wordmark + nav live in the
          global SiteNav now. Each dot is filled if visited, hollow if
          ahead. Active dot is the deeper amber. */}
      <div className="flex items-center justify-end">
        <ProgressDots
          total={questions.length}
          current={idx}
        />
      </div>

      {/* ─── Question prompt ─────────────────────────────────────
          Generous Cormorant italic, big leading. The eyebrow above
          gives a sense of "where I am in this" without bouncing
          progress chrome. */}
      <div className="mt-16 sm:mt-24">
        <div className="flex items-baseline gap-3 text-[11px] uppercase tracking-[0.22em] text-[#8C6520]">
          <span>Question {idx + 1}</span>
          <span className="text-[#8C6520]/40">/</span>
          <span className="text-[#8C6520]/60">{questions.length}</span>
          {isMulti ? (
            <span className="ml-4 text-[#8C6520]/80">
              Pick up to {maxPicks}
            </span>
          ) : null}
        </div>

        <h1
          className="mt-8 font-display text-[28px] leading-[1.25] text-[#221E18] sm:text-[36px] md:text-[44px]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {prompt}
        </h1>
      </div>

      {/* ─── Answer cards ───────────────────────────────────────
          Each answer is a substantial card, not a radio button. The
          dot on the left fills in on hover/selection. Multi-pick
          shows selected state without auto-advancing. */}
      <ul className="mt-12 flex flex-col gap-3">
        {answerTexts.map((text, i) => {
          const selected = multiPicks.includes(i);
          return (
            <li key={i}>
              <button
                type="button"
                onClick={() =>
                  isMulti ? toggleMulti(i) : selectSingle(i)
                }
                className={
                  // Card-style answer. Hover lifts the border, fills
                  // the leading dot, and shifts the text faintly.
                  // Selected (multi-pick) state uses accent-soft bg.
                  "group flex w-full items-start gap-4 rounded-xl border bg-[#FFFCF4] px-5 py-5 text-left transition-all duration-200 " +
                  "hover:border-[#8C6520]/60 hover:bg-[#FFF9E8] " +
                  (selected
                    ? "border-[#8C6520] bg-[#F8EDC8]"
                    : "border-[#D6CDB6]")
                }
              >
                <span
                  className={
                    "mt-1.5 inline-block h-3 w-3 shrink-0 rounded-full border-2 transition-colors " +
                    (selected
                      ? "border-[#8C6520] bg-[#8C6520]"
                      : "border-[#D6CDB6] group-hover:border-[#8C6520]")
                  }
                  aria-hidden
                />
                <span className="text-[16px] leading-[1.55] text-[#221E18] sm:text-[17px]">
                  {text}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* ─── Footer controls ────────────────────────────────────
          Three actions: Back (quiet), Skip (quiet), Continue (only
          for multi-pick, deep-amber button when active). */}
      <div className="mt-10 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={goBack}
          disabled={idx === 0}
          className="text-[13.5px] text-[#4A4338] underline decoration-[#D6CDB6] decoration-1 underline-offset-4 hover:text-[#221E18] hover:decoration-[#8C6520] disabled:opacity-30 disabled:no-underline"
        >
          ← {t("quiz.back", locale)}
        </button>
        <button
          type="button"
          onClick={skip}
          className="text-[13.5px] text-[#4A4338] underline decoration-[#D6CDB6] decoration-1 underline-offset-4 hover:text-[#221E18] hover:decoration-[#8C6520]"
        >
          {t("quiz.skip", locale)}
        </button>
        {isMulti ? (
          <button
            type="button"
            onClick={submitMulti}
            disabled={multiPicks.length === 0}
            className={
              "rounded-full px-5 py-2.5 text-[14px] font-medium transition-all " +
              (multiPicks.length === 0
                ? "cursor-not-allowed bg-[#EBE3CA] text-[#8C6520]/50"
                : "bg-[#221E18] text-[#FAF6EC] hover:bg-[#8C6520] hover:shadow-[0_8px_24px_rgba(140,101,32,0.25)]")
            }
          >
            {t("quiz.continue", locale)} →
          </button>
        ) : (
          // Spacer keeps the back/skip alignment consistent across
          // single-pick and multi-pick questions.
          <div className="w-[92px]" aria-hidden />
        )}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// ProgressDots — a row of small dots, one per question. Visited
// dots are filled in dim amber; the current is filled deep amber;
// upcoming are hollow. On wider screens we show all dots; on
// narrow ones we compress to ~10 evenly-spaced indicators.
// ────────────────────────────────────────────────────────────────
function ProgressDots({
  total,
  current,
}: {
  total: number;
  current: number;
}) {
  // Limit visible dots to 20 even on the 50-question set —
  // more dots become noise rather than information. Map current
  // onto a visible position.
  const visible = Math.min(total, 20);
  const ratio = total === 1 ? 1 : current / (total - 1);
  const visibleCurrent = Math.round(ratio * (visible - 1));

  return (
    <div className="flex items-center gap-1.5" aria-hidden>
      {Array.from({ length: visible }).map((_, i) => {
        const filled = i < visibleCurrent;
        const here = i === visibleCurrent;
        return (
          <span
            key={i}
            className={
              "inline-block rounded-full transition-all " +
              (here
                ? "h-2 w-2 bg-[#8C6520]"
                : filled
                  ? "h-1.5 w-1.5 bg-[#B8862F]/60"
                  : "h-1.5 w-1.5 bg-[#D6CDB6]")
            }
          />
        );
      })}
    </div>
  );
}
