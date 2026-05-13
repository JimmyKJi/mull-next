// /quiz — the redesigned quiz engine.
//
// Server shell: reads `mode` from search params (`quick` or `detailed`),
// resolves the right question set, picks the locale, and hands all of
// it to the client engine. The engine itself runs entirely on the
// client — state, navigation, validation, finish.
//
// Strictly additive: doesn't touch mull.html's quiz flow. When Phase
// 3g lands, the `/` rewrite flips and this becomes the canonical quiz.

import type { Metadata, Viewport } from "next";
import { getServerLocale } from "@/lib/locale-server";
import { QUICK_QUESTIONS } from "@/lib/quiz-questions";
import { DETAILED_QUESTIONS } from "@/lib/quiz-questions-detailed";
import { QuizEngine } from "./quiz-engine";

export const metadata: Metadata = {
  title: "Quiz · Mull",
  description: "Find your place on the map of how you think.",
  // Sandbox during Phase 3 — don't index until cutover.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

type SearchParams = Promise<{ mode?: string }>;

export default async function QuizPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const mode = params.mode === "detailed" ? "detailed" : "quick";
  const questions = mode === "detailed" ? DETAILED_QUESTIONS : QUICK_QUESTIONS;
  const locale = await getServerLocale();

  return (
    <main className="min-h-[100svh] bg-[var(--color-cream,#FAF6EC)]">
      <QuizEngine
        questions={questions}
        mode={mode}
        locale={locale}
      />
    </main>
  );
}
