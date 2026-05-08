import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { DIM_KEYS, DIM_NAMES, DIM_DESCRIPTIONS } from '@/lib/dimensions';

function buildSystemPrompt(): string {
  const dimList = DIM_KEYS.map(k =>
    `- ${k} (${DIM_NAMES[k]}): ${DIM_DESCRIPTIONS[k]}`
  ).join('\n');

  return `You are an analyst for Mull, a philosophy mapping tool. You will read a person's free-form journal entry and produce two things: a small vector delta indicating which philosophical dimensions their thinking momentarily leans toward in this entry, and a short analysis of what their writing reveals about how they're thinking right now.

A diary entry can be about anything — a moment, a memory, a question they're sitting with, a frustration, a small good thing, a half-formed thought. Your job is to read between the lines: what worldview, values, or tendencies does the writing reveal?

THE 16 DIMENSIONS (in fixed order):
${dimList}

OUTPUT FORMAT — strict JSON only, no prose around it:
{
  "vector_delta": [<16 numbers>],
  "analysis": "<2-3 sentences>"
}

The vector_delta array must contain exactly 16 numbers in the order ${DIM_KEYS.join('/')}. Each number is between -2.0 and +2.0. Most should be 0. Only set non-zero values where the writing clearly leans that way — vague, short, or factual entries should produce mostly zeros. Negative values represent leaning AWAY from a dimension.

The analysis is 2-3 sentences describing what the entry reveals about the person's current thinking. Specific to what they wrote, not generic. Don't flatter, don't moralize, don't summarize back to them — name a tendency, an underlying assumption, or a tension you noticed.

Do not over-attribute. If the entry is descriptive without philosophical content, return all zeros and say so plainly.`;
}

type ClaudeResponse = {
  content?: Array<{ type: string; text?: string }>;
  error?: { message?: string; type?: string };
};

async function callClaude(
  content: string,
  apiKey: string
): Promise<{ vector_delta: number[]; analysis: string } | null> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 700,
      system: buildSystemPrompt(),
      messages: [{ role: 'user', content: `Diary entry:\n\n${content.trim()}` }]
    })
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('[diary] Claude API error', res.status, text);
    return null;
  }
  const data: ClaudeResponse = await res.json();
  if (data.error) {
    console.error('[diary] Claude returned error', data.error);
    return null;
  }
  const text = (data.content ?? [])
    .filter(b => b.type === 'text')
    .map(b => b.text || '')
    .join('')
    .trim();

  let cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '');
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start < 0 || end < 0) {
    console.error('[diary] no JSON found:', text.slice(0, 500));
    return null;
  }
  let parsed: { vector_delta?: unknown; analysis?: unknown };
  try {
    parsed = JSON.parse(cleaned.slice(start, end + 1));
  } catch (e) {
    console.error('[diary] JSON parse failed:', e);
    return null;
  }
  if (!Array.isArray(parsed.vector_delta) || parsed.vector_delta.length !== 16) {
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
    const content: string = (body?.content ?? '').toString().trim();
    const title: string = (body?.title ?? '').toString().trim();
    const id: string | undefined = body?.id; // for editing existing entries
    const isPublic: boolean = !!body?.is_public;

    if (!content || content.length < 30) {
      return NextResponse.json({ error: 'Entry is too short (min 30 chars).' }, { status: 400 });
    }
    if (content.length > 12000) {
      return NextResponse.json({ error: 'Entry is too long (max 12000 chars).' }, { status: 400 });
    }
    if (title.length > 200) {
      return NextResponse.json({ error: 'Title is too long (max 200 chars).' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
    }

    const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

    // Run Claude analysis (graceful degradation if no key)
    const apiKey = process.env.ANTHROPIC_API_KEY;
    let vector_delta: number[] | null = null;
    let analysis: string | null = null;
    if (apiKey) {
      const result = await callClaude(content, apiKey);
      if (result) {
        vector_delta = result.vector_delta;
        analysis = result.analysis;
      }
    }

    if (id) {
      // Update existing entry — re-analyze on each update
      const { error: updateError, data: updated } = await supabase
        .from('diary_entries')
        .update({
          title: title || null,
          content,
          vector_delta,
          analysis,
          word_count: wordCount,
          is_public: isPublic,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select('id, vector_delta, analysis')
        .single();

      if (updateError) {
        console.error('[diary] update failed', updateError);
        return NextResponse.json({ error: 'Could not save your entry.' }, { status: 500 });
      }
      return NextResponse.json({
        saved: true,
        id: updated.id,
        vector_delta: updated.vector_delta,
        analysis: updated.analysis,
        analyzed: !!apiKey && !!vector_delta
      });
    }

    // Create new entry
    const { error: insertError, data: inserted } = await supabase
      .from('diary_entries')
      .insert({
        user_id: user.id,
        title: title || null,
        content,
        vector_delta,
        analysis,
        word_count: wordCount,
        is_public: isPublic,
      })
      .select('id, vector_delta, analysis')
      .single();

    if (insertError) {
      console.error('[diary] insert failed', insertError);
      return NextResponse.json({ error: 'Could not save your entry.' }, { status: 500 });
    }

    return NextResponse.json({
      saved: true,
      id: inserted.id,
      vector_delta: inserted.vector_delta,
      analysis: inserted.analysis,
      analyzed: !!apiKey && !!vector_delta
    });
  } catch (e) {
    console.error('[diary] unexpected error', e);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
