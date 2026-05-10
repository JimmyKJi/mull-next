import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { DIM_KEYS, DIM_NAMES, DIM_DESCRIPTIONS } from '@/lib/dimensions';
import {
  buildKinshipPromptFragment,
  parseAndValidateDiagnosis,
  type Kinship,
} from '@/lib/kinship';

function buildSystemPrompt(): string {
  const dimList = DIM_KEYS.map(k =>
    `- ${k} (${DIM_NAMES[k]}): ${DIM_DESCRIPTIONS[k]}`
  ).join('\n');

  return `You are an analyst for Mull, a philosophy mapping tool. You will read a person's free-form journal entry and produce a structured reading: where their thinking sits in 16-dimensional philosophical space, a short observation of what the entry reveals, a deeper diagnosis of the shape of the thinking, the closest historical kin (if any), the traditions the thinking echoes, and a judgement of whether the entry says something genuinely novel.

A diary entry can be about anything — a moment, a memory, a question they're sitting with, a frustration, a small good thing, a half-formed thought. Read between the lines: what worldview, values, or tendencies does the writing reveal?

THE 16 DIMENSIONS (in fixed order):
${dimList}

OUTPUT FORMAT — strict JSON only, no prose around it. The JSON has these fields:
{
  "vector_delta": [<16 numbers>],
  "analysis": "<2-3 sentences>"
}
(plus the additional diagnosis fields specified below)

The vector_delta array must contain exactly 16 numbers in the order ${DIM_KEYS.join('/')}. Each number is between -2.0 and +2.0. Most should be 0. Only set non-zero values where the writing clearly leans that way. Negative values represent leaning AWAY from a dimension.

The analysis is 2-3 sentences naming a tendency, an underlying assumption, or a tension you noticed. Don't flatter, don't moralize, don't summarize back to them.

Do not over-attribute. If the entry is short, descriptive, or without philosophical content, return mostly zeros and say so plainly in the analysis. In that case kinship.philosophers and traditions should be empty and is_novel should be false.`
+ buildKinshipPromptFragment();
}

type ClaudeResponse = {
  content?: Array<{ type: string; text?: string }>;
  error?: { message?: string; type?: string };
};

type ClaudeAnalysis = {
  vector_delta: number[];
  analysis: string;
  diagnosis: string;
  kinship: Kinship;
  is_novel: boolean;
};

async function callClaude(
  content: string,
  apiKey: string
): Promise<ClaudeAnalysis | null> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      // Larger token budget for the extended payload.
      model: 'claude-sonnet-4-6',
      max_tokens: 1400,
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

  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '');
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start < 0 || end < 0) {
    console.error('[diary] no JSON found:', text.slice(0, 500));
    return null;
  }
  let parsed: {
    vector_delta?: unknown;
    analysis?: unknown;
    diagnosis?: unknown;
    kinship?: unknown;
    is_novel?: unknown;
  };
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
  const { diagnosis, kinship, is_novel } = parseAndValidateDiagnosis(parsed, delta);
  return { vector_delta: delta, analysis, diagnosis, kinship, is_novel };
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
    let diagnosis: string | null = null;
    let kinship: Kinship | null = null;
    let is_novel = false;
    if (apiKey) {
      const result = await callClaude(content, apiKey);
      if (result) {
        vector_delta = result.vector_delta;
        analysis = result.analysis;
        diagnosis = result.diagnosis;
        kinship = result.kinship;
        is_novel = result.is_novel;
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
          diagnosis,
          kinship: kinship as unknown as object | null,
          is_novel,
          word_count: wordCount,
          is_public: isPublic,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select('id, vector_delta, analysis, diagnosis, kinship, is_novel')
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
        diagnosis: updated.diagnosis,
        kinship: updated.kinship,
        is_novel: updated.is_novel,
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
        diagnosis,
        kinship: kinship as unknown as object | null,
        is_novel,
        word_count: wordCount,
        is_public: isPublic,
      })
      .select('id, vector_delta, analysis, diagnosis, kinship, is_novel')
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
      diagnosis: inserted.diagnosis,
      kinship: inserted.kinship,
      is_novel: inserted.is_novel,
      analyzed: !!apiKey && !!vector_delta
    });
  } catch (e) {
    console.error('[diary] unexpected error', e);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
