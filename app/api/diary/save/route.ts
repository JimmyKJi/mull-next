import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { DIM_KEYS, DIM_NAMES, DIM_DESCRIPTIONS } from '@/lib/dimensions';
import { PHILOSOPHERS, philosopherSlug } from '@/lib/philosophers';

// Threshold below which we treat the entry as "no close philosophical
// kin." 0.78 is calibrated against the canonical persona tests — a
// human writing in a clearly Stoic register tends to sim ≥ 0.85 with
// the relevant Stoic philosophers; anything below 0.78 means we can't
// confidently pin it to existing canon.
const NOVELTY_SIM_THRESHOLD = 0.78;

function buildSystemPrompt(): string {
  const dimList = DIM_KEYS.map(k =>
    `- ${k} (${DIM_NAMES[k]}): ${DIM_DESCRIPTIONS[k]}`
  ).join('\n');

  // We expose a shortlist of philosopher NAMES (not vectors) to Claude
  // so it can suggest kin from a closed set we know how to resolve to
  // slugs. The vector-similarity scoring runs server-side AFTER Claude
  // returns — Claude's suggestions are the qualitative read; the
  // numeric ranking is the quantitative cross-check.
  const philList = PHILOSOPHERS.map(p => p.name).join(', ');

  return `You are an analyst for Mull, a philosophy mapping tool. You will read a person's free-form journal entry and produce a structured reading: where their thinking sits in 16-dimensional philosophical space, a short observation of what the entry reveals, a deeper diagnosis of the shape of the thinking, the closest historical kin (if any), the traditions the thinking echoes, and a judgement of whether the entry says something genuinely novel.

A diary entry can be about anything — a moment, a memory, a question they're sitting with, a frustration, a small good thing, a half-formed thought. Read between the lines: what worldview, values, or tendencies does the writing reveal?

THE 16 DIMENSIONS (in fixed order):
${dimList}

CLOSED LIST OF PHILOSOPHERS YOU MAY CITE (use EXACT names from this list, no others, no inventing):
${philList}

OUTPUT FORMAT — strict JSON only, no prose around it:
{
  "vector_delta": [<16 numbers>],
  "analysis": "<2-3 sentences>",
  "diagnosis": "<1-4 sentences>",
  "kinship": {
    "philosophers": [
      {"name": "<exact name from list>", "why": "<one short sentence>"}
    ],
    "traditions": ["<tradition>", "<tradition>"]
  },
  "is_novel": <true|false>
}

The vector_delta array must contain exactly 16 numbers in the order ${DIM_KEYS.join('/')}. Each number is between -2.0 and +2.0. Most should be 0. Only set non-zero values where the writing clearly leans that way. Negative values represent leaning AWAY from a dimension.

The analysis is 2-3 sentences naming a tendency, an underlying assumption, or a tension you noticed. Don't flatter, don't moralize, don't summarize back to them.

The diagnosis goes one step deeper than the analysis: name the shape of the thinking. Is the entry sitting inside a recognizable philosophical move (e.g. "Stoic acceptance of what you can't control", "Buddhist attention to the constructed self", "Humean suspicion of inference")? Or is it doing something the canon would struggle to capture? Specific, observational, 1-4 sentences.

Kinship: list 0–3 philosophers from the closed list whose writings most closely resemble the move the entry is making. Order by closeness. For each, write a one-sentence reason that names a SPECIFIC parallel — not generic praise. If no philosopher in the list resembles the entry, return an empty array. Traditions: 0–3 named schools or movements (Stoicism, Buddhism, German Idealism, Pragmatism, Phenomenology, Existentialism, Ubuntu, Daoism, Analytic Philosophy of Mind, etc.). Empty if none fit cleanly.

is_novel: true ONLY when the entry voices a move that's not strongly captured by anyone in the closed list AND not clearly inside a named tradition. Default to false. Novelty is rare; ordinary entries should be false. Be honest — don't flatter the user by calling generic thoughts "novel."

Do not over-attribute. If the entry is short, descriptive, or without philosophical content, return mostly zeros and say so plainly in the analysis. In that case kinship.philosophers and traditions should be empty and is_novel should be false.`;
}

type ClaudeResponse = {
  content?: Array<{ type: string; text?: string }>;
  error?: { message?: string; type?: string };
};

export type KinshipPhilosopher = {
  slug: string;
  name: string;
  similarity: number;       // 0..1, computed server-side from vectors
  why: string;
};

export type Kinship = {
  philosophers: KinshipPhilosopher[];
  traditions: string[];
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
  const diagnosis = typeof parsed.diagnosis === 'string' ? parsed.diagnosis : '';

  // Normalize kinship — be defensive about Claude's structure.
  // Resolve philosopher names to slugs via our canonical list,
  // dropping any that don't match (so we never link to a /philosopher
  // page that doesn't exist).
  const kinship: Kinship = { philosophers: [], traditions: [] };
  if (parsed.kinship && typeof parsed.kinship === 'object') {
    const k = parsed.kinship as { philosophers?: unknown; traditions?: unknown };
    if (Array.isArray(k.philosophers)) {
      for (const item of k.philosophers.slice(0, 3)) {
        if (!item || typeof item !== 'object') continue;
        const rec = item as { name?: unknown; why?: unknown };
        const name = typeof rec.name === 'string' ? rec.name.trim() : '';
        const why = typeof rec.why === 'string' ? rec.why.trim() : '';
        if (!name) continue;
        // Match against canonical philosopher list.
        const phil = PHILOSOPHERS.find(p => p.name.toLowerCase() === name.toLowerCase());
        if (!phil) continue;
        kinship.philosophers.push({
          slug: philosopherSlug(phil.name),
          name: phil.name,
          similarity: 0, // computed in step 2 below
          why,
        });
      }
    }
    if (Array.isArray(k.traditions)) {
      kinship.traditions = k.traditions
        .filter((t: unknown): t is string => typeof t === 'string')
        .map(t => t.trim())
        .filter(Boolean)
        .slice(0, 3);
    }
  }

  // Compute cosine similarity of the entry's delta against each
  // claimed philosopher's known vector — this anchors Claude's
  // qualitative claims to a numeric reality. The delta alone is the
  // best signal we have for a single entry; over time we may layer
  // the user's running position in too.
  const userMag = magnitude(delta);
  for (const kp of kinship.philosophers) {
    const phil = PHILOSOPHERS.find(p => p.name === kp.name);
    if (!phil) continue;
    kp.similarity = userMag > 0 ? cosineSim(delta, phil.vector) : 0;
  }
  // Re-sort by computed similarity (Claude's order was qualitative).
  kinship.philosophers.sort((a, b) => b.similarity - a.similarity);

  const claudeIsNovel = parsed.is_novel === true;
  // Cross-check Claude's novelty claim against the numeric similarity.
  // We only TRUST is_novel when (a) Claude said true AND (b) the top
  // computed similarity is below NOVELTY_SIM_THRESHOLD. This
  // prevents Claude from over-flattering by labeling generic
  // entries as "novel."
  const topSim = kinship.philosophers[0]?.similarity ?? 0;
  const is_novel = claudeIsNovel && topSim < NOVELTY_SIM_THRESHOLD;

  return { vector_delta: delta, analysis, diagnosis, kinship, is_novel };
}

function magnitude(a: number[]): number {
  let s = 0;
  for (const x of a) s += x * x;
  return Math.sqrt(s);
}

function cosineSim(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / Math.sqrt(na * nb);
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
