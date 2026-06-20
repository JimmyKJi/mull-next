// /quiz — server shell. Reads `mode` (quick | detailed) from the
// URL, picks the right question set + locale, hands them to the
// client engine. The engine is the only client component on this
// surface; everything else stays static / server-rendered.

import type { Metadata, Viewport } from 'next';
import { getServerLocale } from '@/lib/locale-server';
import { createClient } from '@/utils/supabase/server';
import { QUICK_QUESTIONS } from '@/lib/quiz-questions';
import { DETAILED_QUESTIONS } from '@/lib/quiz-questions-detailed';
import { QuizEngine } from './quiz-engine';
import { ResearchConsentGate } from '@/components/research-consent-gate';

export const metadata: Metadata = {
  title: 'Quiz · Mull',
  description: 'Find your place on the map of how you think.',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

type SearchParams = Promise<{ mode?: string }>;

export default async function QuizPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const mode = params.mode === 'detailed' ? 'detailed' : 'quick';
  const questions = mode === 'detailed' ? DETAILED_QUESTIONS : QUICK_QUESTIONS;
  const locale = await getServerLocale();

  // Auth state drives the gate's optional post-opt-in demographics step:
  // only signed-in users see it, since anonymous answers can't be saved.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="min-h-[100svh] bg-cream text-ink">
      {/* First-time visitors see the research-consent screen; once
          they've decided (yes or no), the gate becomes a no-op and
          renders the quiz directly. */}
      <ResearchConsentGate isLoggedIn={!!user} locale={locale}>
        <QuizEngine questions={questions} mode={mode} locale={locale} />
      </ResearchConsentGate>
    </main>
  );
}
