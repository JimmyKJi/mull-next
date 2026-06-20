"use client";

// QuizEngine — v3 pixel-game world.
//
// New beats vs v2:
//   - Pixel chrome on the question container (4-px ink border,
//     amber shadow, title bar "QUESTION 03 / 20")
//   - Chapter pagination: every 5 questions the user passes through
//     a CHAPTER-TRANSITION screen — a chunky pixel scene with the
//     chapter number, a thematic line, a "▶ CONTINUE" button.
//   - Per-question decorative sprite — a tiny pixel glyph next to
//     the prompt that reflects what kind of question this is.
//   - System sans body for prompts/answers (NO VT323 at body size).
//   - Pixel buttons for skip/back/continue.

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Question } from "@/lib/quiz-questions";
import { add, scale, zeros } from "@/lib/vectors";
import {
  getLocalizedQuickQuestion,
  type SupportedQuizLocale,
} from "@/lib/quiz-i18n";
import { getLocalizedDetailedQuestion } from "@/lib/quiz-detailed-i18n";
import type { Locale } from "@/lib/translations";
import { t } from "@/lib/translations";

type Props = {
  questions: Question[];
  mode: "quick" | "detailed";
  locale: Locale;
};

type AnswerHistoryEntry =
  | { kind: "single"; index: number }
  | { kind: "multi"; indices: number[] }
  | { kind: "skip" };

type PersistedState = {
  idx: number;
  answers: AnswerHistoryEntry[];
  vector: number[];
  mode: "quick" | "detailed";
};

const STORAGE_PREFIX = "mull.quiz.progress.";

// Per-question answer trail, handed to <ResultSave> after the quiz so it
// can be persisted to research_quiz_responses (for opted-in users only).
// Written at finish(); read + cleared on the /result page. Short-lived —
// it carries the just-finished attempt across the route hop, nothing more.
const RESEARCH_ANSWERS_KEY = "mull.quiz.research_answers";

// Normalize the in-engine answer history into the compact, position-keyed
// shape research_quiz_responses stores: one element per question, with the
// answer index(es) or a skip marker. See the migration for the schema.
type ResearchAnswer =
  | { q: number; kind: "single"; a: number }
  | { q: number; kind: "multi"; indices: number[] }
  | { q: number; kind: "skip" };

function stashResearchAnswers(
  mode: "quick" | "detailed",
  questionCount: number,
  history: AnswerHistoryEntry[],
) {
  try {
    const answers: ResearchAnswer[] = history.map((entry, q) => {
      if (entry.kind === "single") return { q, kind: "single", a: entry.index };
      if (entry.kind === "multi") return { q, kind: "multi", indices: entry.indices };
      return { q, kind: "skip" };
    });
    window.localStorage.setItem(
      RESEARCH_ANSWERS_KEY,
      JSON.stringify({ mode, questionCount, answers, ts: Date.now() }),
    );
  } catch {
    /* storage disabled — research capture just doesn't happen, no harm */
  }
}

// ─── Chapter metadata ──────────────────────────────────────────
// Every 5 questions = 1 chapter. We show a transition screen between
// chapters with a thematic title + a small pixel glyph. Themes are
// loose and rotated rather than perfectly mapped to question content
// — the goal is rhythm, not curriculum.

const CHAPTER_TITLES = [
  "OF ENDINGS",
  "OF KNOWING",
  "OF POWER",
  "OF THE SELF",
  "OF MEANING",
  "OF BEAUTY",
  "OF JUSTICE",
  "OF LOVE",
  "OF TIME",
  "OF SILENCE",
] as const;

const CHAPTER_GLYPHS = ["✦", "◆", "▲", "◐", "✶", "❋", "▣", "◉", "✧", "◇"] as const;

const CHAPTER_LINES = [
  "Five questions about what we do with finitude.",
  "Five questions about how we come to trust what we believe.",
  "Five questions about authority, freedom, and force.",
  "Five questions about the person you take yourself to be.",
  "Five questions about what life is supposed to be for.",
  "Five questions about taste, art, and what catches you.",
  "Five questions about fairness, harm, and what we owe.",
  "Five questions about attention, attachment, and care.",
  "Five questions about memory, change, and the long arc.",
  "Five questions about what can't be said.",
] as const;

const QUESTIONS_PER_CHAPTER = 5;

function chapterOf(idx: number): number {
  return Math.floor(idx / QUESTIONS_PER_CHAPTER);
}
function isChapterBoundary(idx: number): boolean {
  // Boundary = the question is the first of a new chapter (idx 5, 10, ...).
  // Excludes idx 0 — chapter 1 doesn't need a transition before it.
  return idx > 0 && idx % QUESTIONS_PER_CHAPTER === 0;
}

// ─── Per-question decorative glyphs ────────────────────────────
// A tiny rotating set of pixel glyphs — purely decorative, gives
// each question a slightly different visual flavor without us
// having to hand-author 20-50 illustrations.
const QUESTION_GLYPHS = [
  "✦", "❋", "◆", "✧", "◉", "◇", "✶", "▲", "△", "▤",
  "◐", "◑", "◒", "◓", "□", "▣", "▢", "◈", "✺", "✹",
];

export function QuizEngine({ questions, mode, locale }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Friend-challenge invite code (if the user landed via /challenge/<code>).
  // Plumbed through to /result so the post-quiz CTA can offer "Compare
  // with your friend" instead of the standard share screen.
  const challengerCode = searchParams?.get('challenger') || null;

  const [idx, setIdx] = useState(0);
  const [vector, setVector] = useState<number[]>(zeros);
  const [answers, setAnswers] = useState<AnswerHistoryEntry[]>([]);
  const [multiPicks, setMultiPicks] = useState<number[]>([]);
  const [resumed, setResumed] = useState(false);

  // Chapter-transition view. When the user advances INTO a chapter
  // boundary, we briefly show the chapter intro before the question.
  const [showingChapter, setShowingChapter] = useState(false);

  // Computing-result transition. Between the final answer and the
  // /result navigation, we show a ~1.6s pixel "computing" screen so
  // the moment the user submitted their last answer feels weighty
  // and the (potentially slow) /result server fetch is masked. The
  // navigation fires after the screen renders so it overlaps with
  // the route load.
  const [computing, setComputing] = useState(false);

  // Resumed-from-stash banner. When the engine silently restores
  // progress from sessionStorage on mount, surface a one-time chip
  // so the user knows they're not starting fresh ("▸ RESUMED FROM
  // QUESTION 6"). Auto-dismisses after 4s or on user interaction
  // (next answer, back, skip — any of which set this to null).
  const [resumedNotice, setResumedNotice] = useState<number | null>(null);

  // Resume from sessionStorage on mount.
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
        parsed.vector.length === 16 &&
        parsed.idx > 0   // Only show "resumed" if they're past Q1
      ) {
        setIdx(parsed.idx);
        setVector(parsed.vector);
        setAnswers(parsed.answers ?? []);
        setResumedNotice(parsed.idx + 1);
        window.setTimeout(() => setResumedNotice(null), 4000);
      }
    } catch {
      // corrupt stash, start fresh
    }
  }, [mode, questions.length, resumed]);

  useEffect(() => {
    if (!resumed) return;
    try {
      const payload: PersistedState = { idx, answers, vector, mode };
      window.sessionStorage.setItem(
        STORAGE_PREFIX + mode,
        JSON.stringify(payload),
      );
    } catch {
      /* storage disabled, fine */
    }
  }, [idx, vector, answers, mode, resumed]);

  const question = questions[idx];
  const isMulti = !!question?.multi;
  const maxPicks = question?.multi?.max ?? 1;

  // Per-question translation overlay. Quick + detailed sets live in
  // separate overlay files but normalize to the same { p?, a:[...] } shape,
  // so the prompt/answer fallbacks below treat them identically. Missing
  // entries (untranslated locale/question) return undefined → English
  // source shows through.
  const localized = useMemo(() => {
    if (locale === "en") return null;
    if (mode === "detailed") {
      return getLocalizedDetailedQuestion(idx, locale);
    }
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
      setLockedSingle(null);
      lastIdx.current = idx;
    }
  }, [idx]);

  // Single-pick selection feedback. When the user clicks an answer
  // we briefly hold on the question screen with the chosen card
  // visually "locked in" (amber fill + ink shadow) before advancing.
  // The 180ms beat makes the click feel intentional rather than
  // making the question yank away mid-thought.
  const [lockedSingle, setLockedSingle] = useState<number | null>(null);

  function selectSingle(answerIdx: number) {
    if (!question || lockedSingle !== null) return;
    setLockedSingle(answerIdx);
    const delta = question.a[answerIdx]?.v ?? zeros();
    window.setTimeout(() => {
      advance(add(vector, delta), [
        ...answers,
        { kind: "single", index: answerIdx },
      ]);
    }, 180);
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
  function advance(newVector: number[], newAnswers: AnswerHistoryEntry[]) {
    if (idx + 1 >= questions.length) {
      // newAnswers already includes this final answer; the `answers`
      // state does not (we only setAnswers in the non-finish branch),
      // so hand the complete trail straight to finish().
      finish(newVector, newAnswers);
      return;
    }
    setVector(newVector);
    setAnswers(newAnswers);
    const next = idx + 1;
    setIdx(next);
    if (isChapterBoundary(next)) setShowingChapter(true);
  }
  function goBack() {
    if (idx === 0) return;
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
    }
    setVector(prevVec);
    setAnswers(prevAnswers);
    setIdx(idx - 1);
    setMultiPicks([]);
  }
  function finish(finalVector: number[], finalAnswers: AnswerHistoryEntry[]) {
    try {
      window.sessionStorage.removeItem(STORAGE_PREFIX + mode);
    } catch {
      /* ignore */
    }
    // Stash the per-question trail for <ResultSave> to persist (only
    // used if the user has opted in to research). Best-effort.
    stashResearchAnswers(mode, questions.length, finalAnswers);
    const v = btoa(JSON.stringify(finalVector.map((n) => +n.toFixed(3))));
    // Show the computing screen first so the moment of submission
    // feels weighty; fire the navigation in parallel so the route
    // load overlaps with the visible animation.
    setComputing(true);
    const challengerSuffix = challengerCode
      ? `&challenger=${encodeURIComponent(challengerCode)}`
      : '';
    router.push(`/result?v=${encodeURIComponent(v)}&m=${mode}${challengerSuffix}`);
  }

  if (!question) {
    return (
      <div className="mx-auto max-w-[720px] px-6 py-32 text-center text-ink-soft">
        Gathering the questions…
      </div>
    );
  }

  // ── COMPUTING SCREEN ─────────────────────────────────────────
  // Renders after the user submits their final answer, while the
  // /result route is being fetched. The screen has its own pixel
  // animation that runs concurrently with the navigation so the
  // user sees the system "doing something" with their input.
  if (computing) {
    return <ComputingScreen />;
  }

  // ── CHAPTER TRANSITION ───────────────────────────────────────
  if (showingChapter) {
    const chapter = chapterOf(idx);
    const title = CHAPTER_TITLES[chapter % CHAPTER_TITLES.length];
    const glyph = CHAPTER_GLYPHS[chapter % CHAPTER_GLYPHS.length];
    const line = CHAPTER_LINES[chapter % CHAPTER_LINES.length];
    const totalChapters = Math.ceil(
      questions.length / QUESTIONS_PER_CHAPTER,
    );
    return (
      <ChapterTransition
        title={title}
        glyph={glyph}
        line={line}
        chapter={chapter + 1}
        totalChapters={totalChapters}
        onContinue={() => setShowingChapter(false)}
      />
    );
  }

  // ── QUESTION ─────────────────────────────────────────────────
  const chapter = chapterOf(idx);
  const totalChapters = Math.ceil(questions.length / QUESTIONS_PER_CHAPTER);
  const positionInChapter = (idx % QUESTIONS_PER_CHAPTER) + 1;
  const decorGlyph = QUESTION_GLYPHS[idx % QUESTION_GLYPHS.length];

  return (
    <div className="mx-auto max-w-[820px] px-6 pt-8 pb-24 sm:px-10 sm:pt-12 sm:pb-32">
      {/* Resumed-from-stash banner. Auto-dismisses after 4s. */}
      {resumedNotice !== null && (
        <div
          role="status"
          aria-live="polite"
          className="mb-4 inline-flex items-center gap-2 border-[3px] border-ink bg-acc-soft px-3 py-1.5 text-[10px] tracking-[0.16em] text-ink"
          style={{
            fontFamily: "var(--font-pixel-display)",
            boxShadow: '3px 3px 0 0 #2F5D5C',
          }}
        >
          ▸ RESUMED FROM QUESTION {resumedNotice}
        </div>
      )}

      {/* Top status row — chapter + progress dots */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          className="text-[10px] tracking-[0.24em] text-acc-deep"
          style={{ fontFamily: "var(--font-pixel-display)" }}
        >
          CHAPTER {chapter + 1} / {totalChapters} ·
          <span className="ml-2 text-acc">
            {positionInChapter} / {QUESTIONS_PER_CHAPTER}
          </span>
        </div>
        <ProgressDots total={questions.length} current={idx} />
      </div>

      {/* Pixel question panel */}
      <div className="mt-8 pixel-panel">
        {/* Title bar */}
        <div
          className="flex items-center justify-between border-b-4 border-ink bg-ink px-4 py-2 text-[10px] tracking-[0.22em] text-acc-soft"
          style={{ fontFamily: "var(--font-pixel-display)" }}
        >
          <span>QUESTION {String(idx + 1).padStart(2, "0")} / {questions.length}</span>
          {isMulti ? (
            <span className="text-acc">PICK UP TO {maxPicks}</span>
          ) : (
            <span className="text-acc">PICK ONE</span>
          )}
        </div>

        {/* Prompt + decorative pixel glyph */}
        <div className="px-6 py-8 sm:px-10 sm:py-10">
          <div className="flex items-start gap-5">
            <div
              className="hidden shrink-0 pt-1 text-[44px] leading-none text-acc sm:block"
              aria-hidden
            >
              {decorGlyph}
            </div>
            <h1 className="text-[22px] font-medium leading-[1.4] text-ink sm:text-[28px]">
              {prompt}
            </h1>
          </div>

          {/* Multi-pick hint — surfaces the "you need to manually
              continue" instruction so users don't think they're stuck. */}
          {isMulti && (
            <p
              className="mt-6 text-[12.5px] tracking-[0.04em] text-acc-deep sm:text-[13px]"
              style={{ fontFamily: "var(--font-pixel-display)" }}
            >
              ▸ TAP UP TO {maxPicks} · THEN CONTINUE →
            </p>
          )}

          {/* Answer cards */}
          <ul className="mt-8 flex flex-col gap-3">
            {answerTexts.map((text, i) => {
              // For multi-pick: card is "selected" if it's in
              // multiPicks. For single-pick: card is "locked-in" if
              // it's the one we just clicked (the 180ms feedback
              // beat before advance fires).
              const selected = isMulti
                ? multiPicks.includes(i)
                : lockedSingle === i;
              const otherLocked = !isMulti && lockedSingle !== null && lockedSingle !== i;
              return (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() =>
                      isMulti ? toggleMulti(i) : selectSingle(i)
                    }
                    disabled={otherLocked}
                    className={
                      // Pixel-border answer card. No rounded corners,
                      // 3-px border, hard amber shadow on hover.
                      "group flex w-full items-start gap-4 border-[3px] bg-[#FFFCF4] px-5 py-4 text-left transition-all duration-150 " +
                      "hover:translate-x-[-2px] hover:translate-y-[-2px] hover:bg-[#FFF9E8] hover:shadow-[4px_4px_0_0_var(--color-acc-deep)] " +
                      (selected
                        ? "border-acc-deep bg-acc-soft shadow-[4px_4px_0_0_var(--color-ink)]"
                        : otherLocked
                          ? "border-line opacity-40"
                          : "border-line")
                    }
                  >
                    <span
                      className={
                        "mt-1.5 inline-block h-3 w-3 shrink-0 border-2 transition-colors " +
                        (selected
                          ? "border-acc-deep bg-acc-deep"
                          : "border-line group-hover:border-acc-deep")
                      }
                      aria-hidden
                    />
                    <span className="text-[15px] leading-[1.55] text-ink sm:text-[16px]">
                      {text}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Footer controls — pixel chrome */}
      <div className="mt-8 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={goBack}
          disabled={idx === 0}
          className="border-2 border-ink bg-[#FFFCF4] px-4 py-2 text-[13px] font-medium leading-none text-ink hover:bg-acc-soft disabled:cursor-not-allowed disabled:border-line disabled:text-acc-deep/40"
        >
          ← {t("quiz.back", locale)}
        </button>
        <button
          type="button"
          onClick={skip}
          className="border-2 border-ink/40 bg-transparent px-3 py-2 text-[12px] tracking-[0.06em] text-acc-deep hover:border-ink hover:bg-acc-soft hover:text-ink"
          style={{ fontFamily: "var(--font-pixel-display)" }}
        >
          {t("quiz.skip", locale).toUpperCase()}
        </button>
        {isMulti ? (
          <button
            type="button"
            onClick={submitMulti}
            disabled={multiPicks.length === 0}
            className={
              "border-2 px-5 py-2 text-[13px] font-medium leading-none transition-all " +
              (multiPicks.length === 0
                ? "cursor-not-allowed border-line bg-[#EBE3CA] text-acc-deep/50"
                : "border-ink bg-ink text-cream shadow-[3px_3px_0_0_var(--color-acc-deep)] hover:bg-acc-deep hover:shadow-[3px_3px_0_0_var(--color-ink)]")
            }
          >
            {t("quiz.continue", locale)} →
          </button>
        ) : (
          <div className="w-[88px]" aria-hidden />
        )}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// ComputingScreen — bridge between the final quiz answer and the
// /result route load. Renders a chunky pixel "MAPPING YOUR PLACE"
// dialog with cycling stage labels (loosely matches what the server
// is actually doing — projecting the vector, scoring archetypes,
// finding kindred philosophers).
//
// The /result navigation fires at the same moment this renders, so
// the screen's animation overlaps with the route load. Most users
// will see the full ~1.6s loop once before /result mounts; slow
// connections see it longer.
// ────────────────────────────────────────────────────────────────
const COMPUTING_STAGES = [
  'PROJECTING YOUR VECTOR INTO 16-D SPACE',
  'SCORING TEN ARCHETYPES BY COSINE SIMILARITY',
  'FINDING THE PHILOSOPHERS NEAREST TO YOU',
  'PLACING YOU ON THE CONSTELLATION',
] as const;

function ComputingScreen() {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const id = window.setInterval(
      () => setStage((s) => (s + 1) % COMPUTING_STAGES.length),
      450,
    );
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-[720px] flex-col items-center justify-center px-6 py-16 text-center">
      <div className="pixel-panel pixel-panel--ink w-full max-w-[520px]">
        <div
          className="border-b-4 border-ink bg-ink px-4 py-2 text-[10px] tracking-[0.24em] text-acc-soft"
          style={{ fontFamily: "var(--font-pixel-display)" }}
        >
          <span className="pixel-blink">▶</span> MAPPING_YOUR_PLACE.EXE
        </div>
        <div className="px-8 py-12">
          <div
            className="text-[64px] leading-none text-acc pixel-float"
            aria-hidden
          >
            ✦
          </div>
          <h1
            className="mt-6 text-[20px] leading-[1.45] tracking-[0.04em] text-acc-soft sm:text-[24px]"
            style={{ fontFamily: "var(--font-pixel-display)" }}
          >
            <span style={{ textShadow: "3px 3px 0 var(--pixel-shadow, var(--color-acc))" }}>
              COMPUTING YOUR RESULT
            </span>
          </h1>
          {/* Stage label rotates every ~450ms so the user can read
              what's happening behind the screen. The label is
              aria-live so screen readers also hear the progression. */}
          <p
            aria-live="polite"
            aria-atomic="true"
            className="mt-7 min-h-[2.5em] text-[12px] leading-[1.6] tracking-[0.18em] text-acc-soft/85"
            style={{ fontFamily: "var(--font-pixel-display)" }}
          >
            {COMPUTING_STAGES[stage]}
          </p>
          {/* Marching pixel dots — three squares cycling. */}
          <div className="mt-7 flex items-center justify-center gap-2" aria-hidden>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="inline-block h-3 w-3 bg-acc"
                style={{
                  animation: `pixel-blink 1.2s steps(2, end) ${i * 0.2}s infinite`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// ChapterTransition — between-chapter pixel scene. Auto-advances
// after AUTO_MS so users in flow don't get speed-bumped on every
// 5-question boundary, but the "▶ CONTINUE" button is always there
// for someone who wants to read the chapter line carefully.
//
// A small pixel countdown bar fills across the bottom of the panel
// as the timer counts down. Hovering pauses the timer (so a slow
// reader doesn't feel rushed); moving away resumes. Reduced-motion
// users get an extended timer and no animation on the countdown bar.
// ────────────────────────────────────────────────────────────────

const CHAPTER_AUTO_MS = 3500;
const CHAPTER_AUTO_MS_REDUCED = 6000;

function ChapterTransition({
  title,
  glyph,
  line,
  chapter,
  totalChapters,
  onContinue,
}: {
  title: string;
  glyph: string;
  line: string;
  chapter: number;
  totalChapters: number;
  onContinue: () => void;
}) {
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const totalMsRef = useRef(CHAPTER_AUTO_MS);
  const startedAtRef = useRef<number>(performance.now());
  const elapsedAtPauseRef = useRef(0);
  const [progress, setProgress] = useState(0);
  const finishedRef = useRef(false);

  // Detect reduced-motion once on mount.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    totalMsRef.current = mq.matches ? CHAPTER_AUTO_MS_REDUCED : CHAPTER_AUTO_MS;
  }, []);

  // Tick — RAF loop that advances progress. Pauses are handled by
  // freezing startedAtRef so elapsed time stops accumulating.
  useEffect(() => {
    let raf = 0;
    function step(now: number) {
      if (finishedRef.current) return;
      const total = totalMsRef.current;
      let elapsed: number;
      if (paused) {
        elapsed = elapsedAtPauseRef.current;
      } else {
        elapsed = (now - startedAtRef.current) + elapsedAtPauseRef.current;
      }
      const ratio = Math.min(1, elapsed / total);
      setProgress(ratio);
      if (ratio >= 1) {
        finishedRef.current = true;
        onContinue();
        return;
      }
      raf = requestAnimationFrame(step);
    }
    if (!paused) {
      startedAtRef.current = performance.now();
      raf = requestAnimationFrame(step);
    } else {
      // Capture elapsed at pause so resume picks up where we left off.
      elapsedAtPauseRef.current = elapsedAtPauseRef.current +
        (performance.now() - startedAtRef.current);
    }
    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, [paused, onContinue]);

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-[820px] flex-col items-center justify-center px-6 py-16 text-center">
      <div
        className="pixel-panel pixel-panel--ink w-full max-w-[560px]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        <div
          className="border-b-4 border-ink bg-ink px-4 py-2 text-[10px] tracking-[0.24em] text-acc-soft"
          style={{ fontFamily: "var(--font-pixel-display)" }}
        >
          CHAPTER {chapter} / {totalChapters}
        </div>
        <div className="px-8 py-12">
          <div
            className="text-[64px] leading-none text-acc"
            aria-hidden
          >
            {glyph}
          </div>
          <h1
            className="mt-6 px-2 text-[26px] leading-[1.45] tracking-[0.04em] text-acc-soft sm:text-[36px]"
            style={{ fontFamily: "var(--font-pixel-display)" }}
          >
            <span style={{ textShadow: "3px 3px 0 var(--pixel-shadow, var(--color-acc))" }}>
              {title}
            </span>
          </h1>
          <p className="mx-auto mt-7 max-w-[420px] text-[15px] leading-[1.65] text-acc-soft/85 sm:text-[16px]">
            {line}
          </p>
          <div className="mt-10">
            <button
              type="button"
              onClick={() => {
                finishedRef.current = true;
                onContinue();
              }}
              className="pixel-button pixel-button--amber"
            >
              <span>▶ CONTINUE</span>
            </button>
          </div>
        </div>
        {/* Pixel countdown bar — fills across the bottom as the
            auto-advance timer ticks down. Reduced-motion: no
            transition, just step jumps. */}
        <div
          aria-hidden
          className="border-t-4 border-ink bg-[#0E0B07]"
          style={{ height: 6 }}
        >
          <div
            style={{
              height: '100%',
              width: `${progress * 100}%`,
              background: 'var(--color-acc)',
              transition: reduced ? 'none' : 'width 80ms linear',
            }}
          />
        </div>
      </div>
      <p
        className="mt-4 text-[10px] tracking-[0.2em] text-acc-deep"
        style={{ fontFamily: "var(--font-pixel-display)" }}
      >
        {paused ? '▸ HOVERED — TIMER PAUSED' : `▸ AUTO-ADVANCE IN ${Math.ceil((1 - progress) * (totalMsRef.current / 1000))}s`}
      </p>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// ProgressDots — pixel-square dots, one per question. Visited =
// filled; current = bigger filled; upcoming = hollow. Limited to
// 20 visible dots on long sets.
// ────────────────────────────────────────────────────────────────
function ProgressDots({
  total,
  current,
}: {
  total: number;
  current: number;
}) {
  const visible = Math.min(total, 20);
  const ratio = total === 1 ? 1 : current / (total - 1);
  const visibleCurrent = Math.round(ratio * (visible - 1));

  return (
    <div className="flex items-center gap-1" aria-hidden>
      {Array.from({ length: visible }).map((_, i) => {
        const filled = i < visibleCurrent;
        const here = i === visibleCurrent;
        return (
          <span
            key={i}
            className={
              "inline-block transition-all " +
              (here
                ? "h-2.5 w-2.5 bg-acc-deep"
                : filled
                  ? "h-2 w-2 bg-acc/60"
                  : "h-2 w-2 bg-line")
            }
          />
        );
      })}
    </div>
  );
}
