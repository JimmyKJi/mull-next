// Yearly retrospective essay — Mull+ feature.
//
// Pulls a year of trajectory (quiz attempts + dilemma responses + diary
// entries), distills it into a Claude-generated essay about how the user's
// thinking shifted over the year. Designed to be sent around Dec 28.
//
// Gated to Mull+ subscribers via getUserPlan (lib/subscription). Free
// users hit 402 with a "Mull+ only" payload the client uses to point
// them at /billing.
//
// GET params:
//   year=YYYY  (defaults to current calendar year in user's local TZ)
// Response:
//   { year, periodSummary, essay }
// where periodSummary is a structured synopsis (counts, top dimensions,
// trail) and essay is the prose Claude wrote.

import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { DIM_KEYS, DIM_NAMES } from '@/lib/dimensions';
import { getUserPlan } from '@/lib/subscription';

export const runtime = 'nodejs';
export const maxDuration = 60;

type QuizAttempt = { archetype: string; alignment_pct: number; vector: number[]; taken_at: string };
type Dilemma = { dilemma_date: string; question_text: string; response_text: string; vector_delta: number[] | null; analysis: string | null; created_at: string };
type DiaryEntry = { title: string | null; content: string; vector_delta: number[] | null; analysis: string | null; created_at: string };
type ExerciseReflection = { exercise_slug: string; content: string; vector_delta: number[] | null; analysis: string | null; created_at: string };

function vecAdd(a: number[], b: number[]) { return a.map((v, i) => v + (b[i] || 0)); }

export async function GET(req: Request) {
  const url = new URL(req.url);
  const yearStr = url.searchParams.get('year');
  const year = yearStr ? parseInt(yearStr, 10) : new Date().getFullYear();
  if (!Number.isInteger(year) || year < 2024 || year > 2100) {
    return NextResponse.json({ error: 'Invalid year.' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  // ── Gating (Mull+ only) ────────────────────────────────────────────
  // 402 Payment Required is the semantically-correct response for a
  // gated route. The client surfaces a "Upgrade to Mull+" CTA when it
  // sees this status.
  const { isMullPlus } = await getUserPlan(supabase, user.id);
  if (!isMullPlus) {
    return NextResponse.json(
      { error: 'Mull+ only.', upgradeUrl: '/billing' },
      { status: 402 },
    );
  }

  const start = `${year}-01-01T00:00:00Z`;
  const end = `${year + 1}-01-01T00:00:00Z`;

  const [attempts, dilemmas, diaries, reflections] = await Promise.all([
    supabase
      .from('quiz_attempts')
      .select('archetype, alignment_pct, vector, taken_at')
      .eq('user_id', user.id)
      .gte('taken_at', start)
      .lt('taken_at', end)
      .order('taken_at', { ascending: true })
      .returns<QuizAttempt[]>(),
    supabase
      .from('dilemma_responses')
      .select('dilemma_date, question_text, response_text, vector_delta, analysis, created_at')
      .eq('user_id', user.id)
      .gte('created_at', start)
      .lt('created_at', end)
      .order('created_at', { ascending: true })
      .returns<Dilemma[]>(),
    supabase
      .from('diary_entries')
      .select('title, content, vector_delta, analysis, created_at')
      .eq('user_id', user.id)
      .gte('created_at', start)
      .lt('created_at', end)
      .order('created_at', { ascending: true })
      .returns<DiaryEntry[]>(),
    supabase
      .from('exercise_reflections')
      .select('exercise_slug, content, vector_delta, analysis, created_at')
      .eq('user_id', user.id)
      .gte('created_at', start)
      .lt('created_at', end)
      .order('created_at', { ascending: true })
      .returns<ExerciseReflection[]>(),
  ]);

  const attemptRows = attempts.data ?? [];
  const dilemmaRows = dilemmas.data ?? [];
  const diaryRows = diaries.data ?? [];
  const reflectionRows = reflections.data ?? [];

  if (attemptRows.length === 0 && dilemmaRows.length === 0 && diaryRows.length === 0 && reflectionRows.length === 0) {
    return NextResponse.json({
      error: `No data for ${year}. The retrospective needs at least one quiz, dilemma, or diary entry in the year to look back on.`,
    }, { status: 404 });
  }

  // Compute the trajectory: walk events in time order, accumulating shifts.
  type Event = { kind: 'quiz' | 'dilemma' | 'diary' | 'exercise'; ts: number; vec?: number[]; delta?: number[]; preview: string };
  const events: Event[] = [
    ...attemptRows.map(a => ({ kind: 'quiz' as const, ts: new Date(a.taken_at).getTime(), vec: a.vector, preview: `${a.archetype} (${a.alignment_pct}% aligned)` })),
    ...dilemmaRows.map(d => ({ kind: 'dilemma' as const, ts: new Date(d.created_at).getTime(), delta: d.vector_delta || undefined, preview: d.response_text.slice(0, 240) })),
    ...diaryRows.map(d => ({ kind: 'diary' as const, ts: new Date(d.created_at).getTime(), delta: d.vector_delta || undefined, preview: (d.title ? d.title + ' — ' : '') + d.content.slice(0, 240) })),
    ...reflectionRows.map(r => ({ kind: 'exercise' as const, ts: new Date(r.created_at).getTime(), delta: r.vector_delta || undefined, preview: `[${r.exercise_slug}] ${r.content.slice(0, 240)}` })),
  ].sort((a, b) => a.ts - b.ts);

  let position = new Array(16).fill(0);
  const trail: number[][] = [];
  for (const ev of events) {
    if (ev.kind === 'quiz' && ev.vec) position = ev.vec.slice();
    else if (ev.delta) position = vecAdd(position, ev.delta);
    trail.push(position.slice());
  }

  const startPos = trail.length > 0 ? trail[0] : position;
  const endPos = trail.length > 0 ? trail[trail.length - 1] : position;
  const netShift = endPos.map((v, i) => +(v - startPos[i]).toFixed(2));
  const topShifts = netShift
    .map((d, i) => ({ key: DIM_KEYS[i], name: DIM_NAMES[DIM_KEYS[i]], delta: d }))
    .filter(s => Math.abs(s.delta) >= 0.4)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, 5);

  const periodSummary = {
    year,
    counts: { quizzes: attemptRows.length, dilemmas: dilemmaRows.length, diaries: diaryRows.length, reflections: reflectionRows.length },
    topShifts,
    firstArchetype: attemptRows[0]?.archetype ?? null,
    lastArchetype: attemptRows[attemptRows.length - 1]?.archetype ?? null,
  };

  // Compose the essay.
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      year,
      periodSummary,
      essay: null,
      error: 'ANTHROPIC_API_KEY not set; returning summary only.',
    });
  }

  const prompt = composePrompt(year, periodSummary, dilemmaRows, diaryRows);

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2400,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error('[retrospective] anthropic non-ok', res.status, errText);
      return NextResponse.json({ year, periodSummary, essay: null, error: 'Could not generate essay — try again in a moment.' }, { status: 502 });
    }
    const json = await res.json();
    const block = (json.content || []).find((b: { type: string }) => b.type === 'text');
    const essay: string | null = block?.text ?? null;
    return NextResponse.json({ year, periodSummary, essay });
  } catch (e) {
    console.error('[retrospective] anthropic call failed', e);
    return NextResponse.json({
      year,
      periodSummary,
      essay: null,
      error: 'Could not generate essay — try again in a moment.',
    }, { status: 500 });
  }
}

function composePrompt(year: number, summary: object, dilemmas: Dilemma[], diaries: DiaryEntry[]): string {
  const dilemmaSummaries = dilemmas.slice(0, 30).map(d => `- ${d.dilemma_date}: Q: ${d.question_text.slice(0, 150)}\n  A: ${d.response_text.slice(0, 350)}`).join('\n');
  const diarySummaries = diaries.slice(0, 30).map(d => `- ${d.created_at.slice(0, 10)}: ${(d.title ? d.title + ' — ' : '') + d.content.slice(0, 350)}`).join('\n');
  const summaryJson = JSON.stringify(summary, null, 2);

  return [
    `You are writing a contemplative end-of-year essay (~700 words) for a single user of Mull, a philosophy-mapping app. The user has agreed to receive this — they're a paying subscriber.`,
    ``,
    `Your job: distill how their thinking moved over ${year} from the data below. Look for actual patterns, not horoscope-flattery. Quote them back to themselves where it lands. Push back where their writing reveals tension. Be specific, not generic.`,
    ``,
    `Tone: contemplative, careful, honest. Not therapeutic, not prophetic, not a coach. Closer to a thoughtful friend who has actually read the journal.`,
    ``,
    `Rules:`,
    `- Write in second person ("you").`,
    `- Don't lecture or moralize.`,
    `- Don't use "as the year progressed" / "throughout the year" filler.`,
    `- Cite specific entries by quoting a phrase or two when relevant — don't paraphrase generically.`,
    `- If their data is sparse, write a shorter essay rather than padding.`,
    `- End with a question, not a conclusion. Something they could carry into next year.`,
    ``,
    `Year: ${year}`,
    ``,
    `Quantitative summary:`,
    summaryJson,
    ``,
    `Dilemma responses (chronological, up to 30):`,
    dilemmaSummaries || '(none)',
    ``,
    `Diary entries (chronological, up to 30):`,
    diarySummaries || '(none)',
  ].join('\n');
}
