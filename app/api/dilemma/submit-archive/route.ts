// POST /api/dilemma/submit-archive — Mull+ only.
// Accepts a `target_date` (YYYY-MM-DD) and a `response_text` and saves the
// response as if it had been submitted on that past date. Mirrors the
// today-only /api/dilemma/submit, but for filling in dilemmas the user
// missed.
//
// Gated:
//  - User must be signed in.
//  - User must be on a paid plan (subscriptions.plan != 'free' AND status ok).
//  - target_date must be a real past date (between LAUNCH_DATE and yesterday).
//  - No existing response for (user, target_date).
//
// The dilemma shown for that date is the same one served by getDailyDilemma()
// for that date — so the archive is deterministic, not user-picked. (Letting
// users pick any of the 379 prompts arbitrarily would defeat the rotation
// design and bias data toward whichever prompts are popular.)
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { DIM_KEYS, DIM_NAMES, DIM_DESCRIPTIONS } from '@/lib/dimensions';
import { getDailyDilemma } from '@/lib/dilemmas';
import { getUserPlan } from '@/lib/subscription';

// The earliest date the archive will accept. Anything before this returns 400.
// Keep in sync with the LAUNCH_DATE constant in app/dilemma/archive/page.tsx.
const LAUNCH_DATE = '2026-01-01';

function buildSystemPrompt(): string {
  const dimList = DIM_KEYS.map(k =>
    `- ${k} (${DIM_NAMES[k]}): ${DIM_DESCRIPTIONS[k]}`
  ).join('\n');

  return `You are an analyst for Mull, a philosophy mapping tool. You will read a person's brief written response to a daily reflective question, and produce a small vector delta indicating which philosophical dimensions their thinking momentarily leans toward in this specific response.

THE 16 DIMENSIONS (in fixed order):
${dimList}

OUTPUT FORMAT — strict JSON only, no prose around it:
{
  "vector_delta": [<16 numbers>],
  "analysis": "<one sentence>"
}

The vector_delta array must contain exactly 16 numbers in the order ${DIM_KEYS.join('/')}. Each number is between -2.0 and +2.0. Most should be 0. Only set non-zero values where the response clearly leans that way — vague or short responses should produce mostly zeros. Negative values represent leaning AWAY from a dimension.

The analysis is one sentence describing what the response revealed about how the person is thinking right now. Plain prose, no formatting.

Do not over-attribute. Do not flatter. If the response is empty or evasive, return all zeros and say so in the analysis.`;
}

type ClaudeResponse = {
  content?: Array<{ type: string; text?: string }>;
  error?: { message?: string; type?: string };
};

async function callClaude(
  question: string,
  response: string,
  apiKey: string
): Promise<{ vector_delta: number[]; analysis: string } | null> {
  const userMessage = `Question of the day: "${question}"\n\nThe person's response:\n${response.trim()}`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      system: buildSystemPrompt(),
      messages: [{ role: 'user', content: userMessage }]
    })
  });
  if (!res.ok) return null;
  const data: ClaudeResponse = await res.json();
  if (data.error) return null;

  const text = (data.content ?? [])
    .filter(b => b.type === 'text')
    .map(b => b.text || '')
    .join('')
    .trim();
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end < 0 || end <= start) return null;

  let parsed: { vector_delta?: unknown; analysis?: unknown };
  try {
    parsed = JSON.parse(text.slice(start, end + 1));
  } catch { return null; }

  if (!Array.isArray(parsed.vector_delta) || parsed.vector_delta.length !== 16) return null;
  const delta = parsed.vector_delta.map(n => {
    const v = typeof n === 'number' ? n : 0;
    return Math.max(-2, Math.min(2, v));
  });
  const analysis = typeof parsed.analysis === 'string' ? parsed.analysis : '';
  return { vector_delta: delta, analysis };
}

function isValidDateKey(s: unknown): s is string {
  return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const responseText: string = (body?.response_text ?? '').toString().trim();
    const targetDate = body?.target_date;
    const isPublic: boolean = !!body?.is_public;

    if (!isValidDateKey(targetDate)) {
      return NextResponse.json({ error: 'Invalid target_date.' }, { status: 400 });
    }
    if (!responseText || responseText.length < 10) {
      return NextResponse.json({ error: 'Response is too short.' }, { status: 400 });
    }
    if (responseText.length > 4000) {
      return NextResponse.json({ error: 'Response is too long (max 4000 chars).' }, { status: 400 });
    }

    // Check date range: must be >= LAUNCH_DATE and < today (UTC)
    const todayKey = (() => {
      const d = new Date();
      const yyyy = d.getUTCFullYear();
      const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
      const dd = String(d.getUTCDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    })();
    if (targetDate < LAUNCH_DATE) {
      return NextResponse.json({ error: 'Date is before the archive opened.' }, { status: 400 });
    }
    if (targetDate >= todayKey) {
      return NextResponse.json({ error: 'For today, use the regular dilemma page.' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
    }

    // Mull+ gate.
    const { isMullPlus } = await getUserPlan(supabase, user.id);
    if (!isMullPlus) {
      return NextResponse.json({ error: 'Mull+ unlocks past dilemmas.' }, { status: 402 });
    }

    // Compute the dilemma that was actually shown on that historical date.
    const target = getDailyDilemma(new Date(`${targetDate}T12:00:00Z`));

    // Duplicate-per-day check
    const { data: existing } = await supabase
      .from('dilemma_responses')
      .select('id')
      .eq('user_id', user.id)
      .eq('dilemma_date', targetDate)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: 'You already responded to that day\'s dilemma.' },
        { status: 409 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    let analysis: string | null = null;
    let vector_delta: number[] | null = null;

    if (apiKey) {
      const result = await callClaude(target.dilemma.prompt, responseText, apiKey);
      if (result) {
        vector_delta = result.vector_delta;
        analysis = result.analysis;
      }
    }

    const { error: insertError, data: inserted } = await supabase
      .from('dilemma_responses')
      .insert({
        user_id: user.id,
        dilemma_date: targetDate,
        dilemma_index: target.index,
        question_text: target.dilemma.prompt,
        response_text: responseText,
        vector_delta,
        analysis,
        is_public: isPublic
      })
      .select('id, vector_delta, analysis')
      .single();

    if (insertError) {
      console.error('[dilemma archive] insert failed', insertError);
      return NextResponse.json({ error: 'Could not save your response.' }, { status: 500 });
    }

    return NextResponse.json({
      saved: true,
      id: inserted.id,
      vector_delta: inserted.vector_delta,
      analysis: inserted.analysis,
      analyzed: !!apiKey && !!vector_delta
    });
  } catch (e) {
    console.error('[dilemma archive] unexpected error', e);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
