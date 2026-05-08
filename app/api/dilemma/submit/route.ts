import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { DIM_KEYS, DIM_NAMES, DIM_DESCRIPTIONS } from '@/lib/dimensions';
import { DILEMMAS, getDailyDilemma } from '@/lib/dilemmas';

// Build the system prompt from the dimension table — one place to edit.
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

  if (!res.ok) {
    const text = await res.text();
    console.error('[dilemma] Claude API error', res.status, text);
    return null;
  }

  const data: ClaudeResponse = await res.json();
  if (data.error) {
    console.error('[dilemma] Claude returned error', data.error);
    return null;
  }

  // Extract text from content blocks
  const text = (data.content ?? [])
    .filter(b => b.type === 'text')
    .map(b => b.text || '')
    .join('')
    .trim();

  // Extract JSON — model might wrap it in code fences or add stray prose.
  // Find first { and last } and parse between.
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end < 0 || end <= start) {
    console.error('[dilemma] no JSON found in Claude response:', text);
    return null;
  }
  let parsed: { vector_delta?: unknown; analysis?: unknown };
  try {
    parsed = JSON.parse(text.slice(start, end + 1));
  } catch (e) {
    console.error('[dilemma] JSON parse failed', e, text);
    return null;
  }

  if (!Array.isArray(parsed.vector_delta) || parsed.vector_delta.length !== 16) {
    console.error('[dilemma] invalid vector_delta shape', parsed.vector_delta);
    return null;
  }
  const delta = parsed.vector_delta.map(n => {
    const v = typeof n === 'number' ? n : 0;
    return Math.max(-2, Math.min(2, v));
  });
  const analysis = typeof parsed.analysis === 'string' ? parsed.analysis : '';
  return { vector_delta: delta, analysis };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const responseText: string = (body?.response_text ?? '').toString().trim();
    const isPublic: boolean = !!body?.is_public;
    if (!responseText || responseText.length < 10) {
      return NextResponse.json({ error: 'Response is too short.' }, { status: 400 });
    }
    if (responseText.length > 4000) {
      return NextResponse.json({ error: 'Response is too long (max 4000 chars).' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
    }

    const today = getDailyDilemma();
    const dateKey = today.dateKey;

    // Check if already submitted today
    const { data: existing } = await supabase
      .from('dilemma_responses')
      .select('id')
      .eq('user_id', user.id)
      .eq('dilemma_date', dateKey)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: 'You have already responded to today\'s dilemma.' },
        { status: 409 }
      );
    }

    // Call Claude — gracefully degrade if no API key set
    const apiKey = process.env.ANTHROPIC_API_KEY;
    let analysis: string | null = null;
    let vector_delta: number[] | null = null;

    if (apiKey) {
      const result = await callClaude(today.dilemma.prompt, responseText, apiKey);
      if (result) {
        vector_delta = result.vector_delta;
        analysis = result.analysis;
      }
    } else {
      console.warn('[dilemma] ANTHROPIC_API_KEY not set — saving response without vector analysis');
    }

    const { error: insertError, data: inserted } = await supabase
      .from('dilemma_responses')
      .insert({
        user_id: user.id,
        dilemma_date: dateKey,
        dilemma_index: today.index,
        question_text: today.dilemma.prompt,
        response_text: responseText,
        vector_delta,
        analysis,
        is_public: isPublic
      })
      .select('id, vector_delta, analysis')
      .single();

    if (insertError) {
      console.error('[dilemma] insert failed', insertError);
      return NextResponse.json({ error: 'Could not save your response.' }, { status: 500 });
    }

    return NextResponse.json({
      saved: true,
      id: inserted.id,
      vector_delta: inserted.vector_delta,
      analysis: inserted.analysis,
      // For client display, send back a list of top shifts with names
      analyzed: !!apiKey && !!vector_delta
    });
  } catch (e) {
    console.error('[dilemma] unexpected error', e);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
