"use client";

// QuizEngine — client-side state machine for the redesigned quiz.
//
// Responsibilities:
//   1. Track which question we're on, the user's running vector, and
//      the answers history (so Back works).
//   2. Render one question at a time with a progress bar, skip, back,
//      and multi-pick handling.
//   3. On finish, encode the result vector into the URL and navigate
//      to /result?v=...&m=... where the server can decode and render
//      via the Phase 2 POC reveal.
//
// Save flow (handed off to the result page, not done here): the
// result page knows whether to persist via Supabase (authed) or
// stash in localStorage for later claiming (guest). This component
// just hands off the vector + mode.

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import type { Question } from "@/lib/quiz-questions";
import { add, scale, zeros } from "@/lib/vectors";
import { getLocalizedQuickQuestion, type SupportedQuizLocale } from "@/lib/quiz-i18n";
import type { Locale } from "@/lib/translations";
import { t } from "@/lib/translations";
import { DURATION, EASE } from "@/lib/motion-tokens";
import { cn } from "@/lib/cn";

type Props = {
  questions: Question[];
  mode: "quick" | "detailed";
  locale: Locale;
};

type AnswerHistoryEntry =
  | { kind: "single"; index: number }
  | { kind: "multi"; indices: number[] }
  | { kind: "skip" };

// sessionStorage shape — persists mid-quiz so refresh doesn't blow
// away progress. Keyed by mode so quick and detailed have separate
// resume states.
type PersistedState = {
  idx: number;
  answers: AnswerHistoryEntry[];
  vector: number[];
  mode: "quick" | "detailed";
  startedAt: string;
};

const STORAGE_PREFIX = "mull.quiz.progress.";

export function QuizEngine({ questions, mode, locale }: Props) {
  const router = useRouter();
  const reduce = useReducedMotion();

  // Resume from sessionStorage if we have a stash for this mode. We
  // initialize lazily in useEffect (not via useState's initializer)
  // because sessionStorage isn't available during SSR.
  const [idx, setIdx] = useState(0);
  const [vector, setVector] = useState<number[]>(zeros);
  const [answers, setAnswers] = useState<AnswerHistoryEntry[]>([]);
  const [multiPicks, setMultiPicks] = useState<number[]>([]);
  const [resumed, setResumed] = useState(false);

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

  // Persist every time idx/vector/answers changes (after first resume).
  useEffect(() => {
    if (!resumed) return;
    try {
      const payload: PersistedState = {
        idx,
        answers,
        vector,
        mode,
        startedAt: new Date().toISOString(),
      };
      window.sessionStorage.setItem(STORAGE_PREFIX + mode, JSON.stringify(payload));
    } catch {
      // Storage full or disabled — fine, just lose resume.
    }
  }, [idx, vector, answers, mode, resumed]);

  const question = questions[idx];
  const isMulti = !!question?.multi;
  const maxPicks = question?.multi?.max ?? 1;

  // Pick the localized prompt + answers when available, otherwise
  // fall back to the English source. The detailed quiz is English-only
  // by policy (see AGENTS.md); the quick quiz has full i18n.
  const localized = useMemo(() => {
    if (mode === "detailed" || locale === "en") return null;
    return getLocalizedQuickQuestion(idx, locale as SupportedQuizLocale);
  }, [idx, locale, mode]);

  const prompt = localized?.p ?? question?.p ?? "";
  const answerTexts = useMemo(() => {
    if (!question) return [];
    return question.a.map((ans, i) => localized?.a[i] ?? ans.t);
  }, [question, localized]);

  // Restart multi-pick state when arriving at a new question.
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
    const newAnswers = [...answers, { kind: "single" as const, index: answerIdx }];
    advance(newVector, newAnswers);
  }

  function toggleMulti(answerIdx: number) {
    setMultiPicks((prev) => {
      if (prev.includes(answerIdx)) return prev.filter((i) => i !== answerIdx);
      if (prev.length >= maxPicks) return prev;
      return [...prev, answerIdx];
    });
  }

  function submitMulti() {
    if (!question || multiPicks.length === 0) return;
    // Sum the picked answer vectors, then scale by 1/n so a multi-pick
    // doesn't double-count weight. Same approach as mull.html.
    const summed = multiPicks.reduce(
      (acc, i) => add(acc, question.a[i].v),
      zeros(),
    );
    const delta = scale(summed, 1 / multiPicks.length);
    const newVector = add(vector, delta);
    const newAnswers = [...answers, { kind: "multi" as const, indices: multiPicks }];
    advance(newVector, newAnswers);
  }

  function skip() {
    const newAnswers = [...answers, { kind: "skip" as const }];
    advance(vector, newAnswers);
  }

  function advance(newVector: number[], newAnswers: AnswerHistoryEntry[]) {
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
    const last = answers[answers.length - 1];
    if (!last) return;
    // Recompute the vector by subtracting the last delta. We could
    // also keep a stack of vectors, but recomputing keeps the source
    // of truth as `answers` and protects against drift.
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
      // skip contributes 0
    }
    setVector(prevVec);
    setAnswers(prevAnswers);
    setIdx(idx - 1);
    setMultiPicks([]);
  }

  function finish(finalVector: number[]) {
    // Clear the resume stash; from here the result page owns the state.
    try {
      window.sessionStorage.removeItem(STORAGE_PREFIX + mode);
    } catch {
      /* ignore */
    }
    // base64-encoded JSON in the `v` param; same convention mull.html
    // used so a shared link from the old surface still decodes on the
    // new result page once Phase 3d lands.
    const v = btoa(JSON.stringify(finalVector.map((n) => +n.toFixed(3))));
    router.push(`/result?v=${encodeURIComponent(v)}&m=${mode}`);
  }

  const progressPct = Math.round(((idx + 0.0) / questions.length) * 100);

  if (!question) {
    return (
      <div className="mx-auto max-w-[680px] px-6 py-20 text-center text-[var(--color-ink,#221E18)]">
        Loading…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[680px] px-6 pt-10 pb-20 sm:pt-16">
      {/* Progress bar */}
      <div
        className="h-1 w-full overflow-hidden rounded-full bg-[var(--color-line,#D6CDB6)]/60"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progressPct}
      >
        <motion.div
          initial={false}
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: reduce ? 0 : DURATION.base, ease: EASE.outSoft }}
          className="h-full bg-[var(--color-acc-deep,#8C6520)]"
        />
      </div>
      <div className="mt-3 flex items-center justify-between text-[12px] text-[var(--color-ink-soft,#4A4338)]">
        <span>
          Question {idx + 1} of {questions.length}
        </span>
        {isMulti && (
          <span>
            Pick up to {maxPicks}
          </span>
        )}
      </div>

      {/* Question + answers — keyed by idx so each transition is fresh */}
      <motion.div
        key={idx}
        initial={{ opacity: 0, y: reduce ? 0 : 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduce ? 0 : DURATION.base, ease: EASE.outSoft }}
        className="mt-10"
      >
        <h1
          className="font-display text-[28px] leading-[1.2] text-[var(--color-ink,#221E18)] sm:text-[32px]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {prompt}
        </h1>

        <div className="mt-8 flex flex-col gap-3">
          {answerTexts.map((text, i) => {
            const selected = multiPicks.includes(i);
            return (
              <button
                key={i}
                type="button"
                onClick={() => (isMulti ? toggleMulti(i) : selectSingle(i))}
                className={cn(
                  "group w-full rounded-xl border bg-[var(--color-cream-2,#F1EAD8)] px-5 py-4 text-left text-[15px] leading-relaxed transition-all",
                  "hover:border-[var(--color-acc-deep,#8C6520)]/60 hover:shadow-[0_6px_20px_rgba(34,30,24,0.08)]",
                  selected
                    ? "border-[var(--color-acc-deep,#8C6520)] bg-[var(--color-acc-soft,#F8EDC8)]"
                    : "border-[var(--color-line,#D6CDB6)]",
                )}
              >
                <span className="flex items-start gap-3">
                  <span
                    className={cn(
                      "mt-1 inline-block h-3 w-3 shrink-0 rounded-full border",
                      selected
                        ? "border-[var(--color-acc-deep,#8C6520)] bg-[var(--color-acc-deep,#8C6520)]"
                        : "border-[var(--color-line,#D6CDB6)] group-hover:border-[var(--color-acc-deep,#8C6520)]",
                    )}
                    aria-hidden
                  />
                  <span className="text-[var(--color-ink,#221E18)]">{text}</span>
                </span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Footer controls */}
      <div className="mt-10 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={goBack}
          disabled={idx === 0}
          className="text-[14px] text-[var(--color-ink-soft,#4A4338)] underline decoration-[var(--color-line,#D6CDB6)] decoration-1 underline-offset-4 hover:text-[var(--color-ink,#221E18)] hover:decoration-[var(--color-acc-deep,#8C6520)] disabled:opacity-30 disabled:no-underline"
        >
          ← {t("quiz.back", locale)}
        </button>
        <button
          type="button"
          onClick={skip}
          className="text-[14px] text-[var(--color-ink-soft,#4A4338)] underline decoration-[var(--color-line,#D6CDB6)] decoration-1 underline-offset-4 hover:text-[var(--color-ink,#221E18)] hover:decoration-[var(--color-acc-deep,#8C6520)]"
        >
          {t("quiz.skip", locale)}
        </button>
        {isMulti ? (
          <button
            type="button"
            onClick={submitMulti}
            disabled={multiPicks.length === 0}
            className={cn(
              "rounded-full px-5 py-2.5 text-[14px] font-medium",
              multiPicks.length === 0
                ? "cursor-not-allowed bg-[var(--color-line,#D6CDB6)] text-[var(--color-ink-soft,#4A4338)]"
                : "bg-[var(--color-acc-deep,#8C6520)] text-[var(--color-cream,#FAF6EC)] hover:scale-[1.02]",
            )}
          >
            {t("quiz.continue", locale)}
          </button>
        ) : (
          <div className="w-[88px]" /> // spacer for layout balance
        )}
      </div>
    </div>
  );
}
