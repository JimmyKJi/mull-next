// POST /api/exercises/reflect
//
// User writes a reflection after completing a philosophical exercise.
// We pass the exercise context (name, summary, tradition, the reflection
// prompt) plus the user's prose to Claude, which returns a 16-D vector
// delta describing what the reflection reveals about how the user is
// thinking. Save the row + delta + analysis into exercise_reflections.
//
// Body: { slug: string, content: string, isPublic?: boolean }
// Response: { saved, id, vector_delta, analysis, analyzed }
//
// Mirrors the dilemma + diary submit routes — same prose-to-vector pipeline,
// same graceful degradation when Claude is unavailable (we still save the
// reflection text; the trajectory just doesn't get a delta this time).

import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { DIM_KEYS, DIM_NAMES, DIM_DESCRIPTIONS } from '@/lib/dimensions';
import { findExercise } from '@/lib/exercises';
import {
  buildKinshipPromptFragment,
  parseAndValidateDiagnosis,
  type Kinship,
} from '@/lib/kinship';

function buildSystemPrompt(): string {
  const dimList = DIM_KEYS.map(k =>
    `- ${k} (${DIM_NAMES[k]}): ${DIM_DESCRIPTIONS[k]}`
  ).join('\n');

  return `You are an analyst for Mull, a philosophy mapping tool. The user has just completed a structured philosophical exercise — a contemplative practice, a logic drill, or an argument-formation exercise — and written a short reflection on what came out of it. Your job is to read that reflection and produce a small vector delta indicating which philosophical dimensions their thinking momentarily leans toward, plus a deeper diagnosis of the shape of the thinking, the closest historical kin, the traditions it echoes, and a judgement of whether the reflection says something genuinely novel.

THE 16 DIMENSIONS (in fixed order):
${dimList}

OUTPUT FORMAT — strict JSON only, no prose around it. The JSON has these fields:
{
  "vector_delta": [<16 numbers>],
  "analysis": "<one sentence>"
}
(plus the additional diagnosis fields specified below)

Each value is a small signed number, typically in [-1.5, +1.5]. The values represent the lean of THIS specific reflection, not a wholesale identity claim. Most positions should be near zero. Move only on dimensions the reflection actually surfaces.

The analysis is one sentence describing what the reflection revealed about how the person is currently thinking. Plain prose, no formatting.

Do not over-attribute. Do not flatter. Reflections done well often surface contradictions or shifts — name those when you see them.`
+ buildKinshipPromptFragment();
}

type ClaudeResponse = {
  content?: Array<{ type: string; text?: string }>;
  error?: { message?: string; type?: string };
};

type ExerciseClaudeResult = {
  vector_delta: number[];
  analysis: string;
  diagnosis: string;
  kinship: Kinship;
  is_novel: boolean;
};

async function callClaude(
  exerciseContext: string,
  reflection: string,
  apiKey: string
): Promise<ExerciseClaudeResult | null> {
  const userMessage = `Exercise context:\n${exerciseContext}\n\nThe person's reflection:\n${reflection.trim()}`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1400,
      system: buildSystemPrompt(),
      messages: [{ role: 'user', content: userMessage }]
    })
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('[exercises/reflect] Claude API error', res.status, text);
    return null;
  }

  const data: ClaudeResponse = await res.json();
  if (data.error) {
    console.error('[exercises/reflect] Claude returned error', data.error);
    return null;
  }

  const text = (data.content ?? [])
    .filter(b => b.type === 'text')
    .map(b => b.text || '')
    .join('')
    .trim();

  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end < 0 || end <= start) {
    console.error('[exercises/reflect] no JSON in response:', text);
    return null;
  }
  let parsed: {
    vector_delta?: unknown; analysis?: unknown;
    diagnosis?: unknown; kinship?: unknown; is_novel?: unknown;
  };
  try {
    parsed = JSON.parse(text.slice(start, end + 1));
  } catch (e) {
    console.error('[exercises/reflect] JSON parse failed', e, text);
    return null;
  }
  if (!Array.isArray(parsed.vector_delta) || parsed.vector_delta.length !== 16) {
    console.error('[exercises/reflect] invalid vector_delta shape');
    return null;
  }
  const vec = (parsed.vector_delta as unknown[]).map(v => {
    const n = Number(v);
    return Number.isFinite(n) ? +n.toFixed(3) : 0;
  });
  const analysis = typeof parsed.analysis === 'string' ? parsed.analysis.trim() : '';
  const { diagnosis, kinship, is_novel } = parseAndValidateDiagnosis(parsed, vec);
  return { vector_delta: vec, analysis, diagnosis, kinship, is_novel };
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const slug = (body?.slug ?? '').toString().trim();
    const content = (body?.content ?? '').toString().trim();
    const isPublic = !!body?.isPublic;

    if (!slug) return NextResponse.json({ error: 'Missing slug.' }, { status: 400 });
    const exercise = findExercise(slug);
    if (!exercise) return NextResponse.json({ error: 'Unknown exercise.' }, { status: 404 });

    if (content.length < 30) {
      return NextResponse.json({
        error: 'Reflection is too short — write at least a couple of sentences for the analysis to be meaningful.',
      }, { status: 400 });
    }
    if (content.length > 8000) {
      return NextResponse.json({ error: 'Reflection is too long (max 8000 characters).' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Sign in to save reflections.' }, { status: 401 });

    // Compose the context block we hand to Claude. Includes everything
    // about the exercise that helps Claude interpret a reflection on it.
    const exerciseContext = [
      `Name: ${exercise.name}`,
      `Tradition: ${exercise.tradition}`,
      `Summary: ${exercise.summary}`,
      `Reflection prompt the user was responding to: ${exercise.reflection}`,
    ].join('\n');

    const apiKey = process.env.ANTHROPIC_API_KEY;
    let vectorDelta: number[] | null = null;
    let analysis: string | null = null;
    let diagnosis: string | null = null;
    let kinship: Kinship | null = null;
    let is_novel = false;
    let analyzed = false;

    if (apiKey) {
      const claude = await callClaude(exerciseContext, content, apiKey);
      if (claude) {
        vectorDelta = claude.vector_delta;
        analysis = claude.analysis;
        diagnosis = claude.diagnosis;
        kinship = claude.kinship;
        is_novel = claude.is_novel;
        analyzed = true;
      }
    }

    const wordCount = content.split(/\s+/).filter(Boolean).length;

    const { data: row, error } = await supabase
      .from('exercise_reflections')
      .insert({
        user_id: user.id,
        exercise_slug: slug,
        content,
        vector_delta: vectorDelta,
        analysis,
        diagnosis,
        kinship: kinship as unknown as object | null,
        is_novel,
        word_count: wordCount,
        is_public: isPublic,
      })
      .select('id')
      .single();

    if (error) {
      console.error('[exercises/reflect] insert failed', error);
      return NextResponse.json({ error: 'Could not save reflection.' }, { status: 500 });
    }

    return NextResponse.json({
      saved: true,
      id: row.id,
      vector_delta: vectorDelta,
      analysis,
      diagnosis,
      kinship,
      is_novel,
      analyzed,
    });
  } catch (e) {
    console.error('[exercises/reflect] error', e);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
