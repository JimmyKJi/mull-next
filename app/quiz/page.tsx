// /quiz — server shell. Reads `mode` (quick | detailed) from the
// URL, picks the right question set + locale, hands them to the
// client engine. The engine is the only client component on this
// surface; everything else stays static / server-rendered.

import type { Metadata, Viewport } from "next";
import { getServerLocale } from "@/lib/locale-server";
import { QUICK_QUESTIONS } from "@/lib/quiz-questions";
import { DETAILED_QUESTIONS } from "@/lib/quiz-questions-detailed";
import { QuizEngine } from "./quiz-engine";

export const metadata: Metadata = {
  title: "Quiz · Mull",
  description: "Find your place on the map of how you think.",
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
    <main className="min-h-[100svh] bg-[#FAF6EC] text-[#221E18]">
      <QuizEngine questions={questions} mode={mode} locale={locale} />
    </main>
  );
}
