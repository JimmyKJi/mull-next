import { NextResponse } from 'next/server';
import { PHILOSOPHERS } from '@/lib/philosophers';
import { DIM_KEYS, DIM_NAMES } from '@/lib/dimensions';
import { createClient } from '@/utils/supabase/server';

type ClaudeResponse = {
  content?: Array<{ type: string; text?: string }>;
  error?: { message?: string; type?: string };
};

type DebateOutput = {
  exchanges: Array<{ speaker: 'A' | 'B'; text: string }>;
  setup: string;
};

function vecAdd(a: number[], b: number[]): number[] {
  return a.map((v, i) => v + (b[i] || 0));
}

function buildSystemPrompt(
  user: {
    archetype: string | null;
    flavor: string | null;
    topDims: Array<{ name: string; v: number }>;
    diaryNote: string;
  },
  phil: { name: string; keyIdea: string },
  topic: string
): string {
  const userProfile = [
    user.archetype ? `their nearest archetype is "${user.archetype}"${user.flavor ? ` with a ${user.flavor.toLowerCase()} flavor` : ''}` : null,
    user.topDims.length ? `their highest-scoring dimensions are: ${user.topDims.map(d => `${d.name} (${d.v.toFixed(1)})`).join(', ')}` : null,
    user.diaryNote || null,
  ].filter(Boolean).join('. ');

  return `You simulate a real philosophical exchange between a contemporary thinker (THE USER, Speaker A) and a historical philosopher (Speaker B), in their actual recorded positions. It feels like two people TALKING TO EACH OTHER — quoting back, restating, answering specific moves the other just made. No lectures, no straw men.

SPEAKER A — THE USER (a contemporary, anonymous, but with a known shape of mind):
${userProfile}
The user argues from this position. Make their voice consistent with these tendencies, but do NOT name their dimensions or archetype out loud. They speak as a person, not a profile. Their language is everyday and direct.

SPEAKER B — ${phil.name} (in character):
${phil.keyIdea}
Argue from ${phil.name}'s actual recorded positions and use their technical vocabulary — but EXPLAIN every technical term in plain language as you introduce it.

TOPIC: ${topic}

⚠️ AUDIENCE: written for a general reader, not philosophers. Most readers have never taken a philosophy class. Make this feel like a real, readable conversation.

HOW IT SHOULD READ:
- Two people TALKING — each turn directly answers what the other just said, pushes on a specific weak point, or asks a probing question.
- When a technical term appears, gloss it inline in plain English the first time. Examples of the form:
   • "the categorical imperative — the rule that you should only act on principles you'd be willing for everyone to follow"
   • "the will to power — the drive to shape and master, not just survive"
   • "śūnyatā — emptiness, but not nothing; the way everything depends on everything else"
- After defining a term once, you can use it bare. Don't over-explain twice.
- The user's voice is conversational and direct — they speak like a thoughtful person, not a textbook. The philosopher uses their own concepts but always glosses them.
- Real disagreement, real agreement, no flattery, no straw men. Short and sharp beats long.

WRITE 4 to 6 alternating exchanges starting with A (A, B, A, B, ...). Each turn under 500 characters. The whole exchange should be readable in under two minutes by someone with no philosophy background.

CRITICAL: Output ONLY valid JSON. No markdown fences, no preamble.

{
  "setup": "<one plain-language sentence framing what's at stake — why this specific disagreement matters, written for a curious newcomer>",
  "exchanges": [
    {"speaker": "A", "text": "..."},
    {"speaker": "B", "text": "..."},
    {"speaker": "A", "text": "..."},
    {"speaker": "B", "text": "..."}
  ]
}`;
}

async function callClaude(
  user: Parameters<typeof buildSystemPrompt>[0],
  phil: { name: string; keyIdea: string },
  topic: string,
  apiKey: string
): Promise<DebateOutput | null> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 3500,
      system: buildSystemPrompt(user, phil, topic),
      messages: [{ role: 'user', content: `Generate the JSON exchange now. Output JSON only.` }]
    })
  });
  if (!res.ok) {
    console.error('[debate/me] Claude API error', res.status, await res.text());
    return null;
  }
  const data: ClaudeResponse = await res.json();
  if (data.error) {
    console.error('[debate/me] Claude returned error', data.error);
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
  if (start < 0 || end < 0) return null;
  let parsed: { setup?: unknown; exchanges?: unknown };
  try {
    parsed = JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return null;
  }
  if (!Array.isArray(parsed.exchanges) || parsed.exchanges.length < 2) return null;
  const exchanges = (parsed.exchanges as Array<{ speaker?: unknown; text?: unknown }>)
    .filter(x => (x.speaker === 'A' || x.speaker === 'B') && typeof x.text === 'string')
    .map(x => ({ speaker: x.speaker as 'A' | 'B', text: (x.text as string).trim() }));
  if (exchanges.length < 2) return null;
  return { setup: typeof parsed.setup === 'string' ? parsed.setup : '', exchanges };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const philName: string = (body?.phil_name ?? '').toString().trim();
    const topic: string = (body?.topic ?? '').toString().trim();

    if (!philName || !topic || topic.length < 4 || topic.length > 240) {
      return NextResponse.json({ error: 'Pick a philosopher and provide a short topic.' }, { status: 400 });
    }
    const phil = PHILOSOPHERS.find(p => p.name === philName);
    if (!phil) return NextResponse.json({ error: 'Unknown philosopher.' }, { status: 400 });

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'You need an account to be in the debate. Sign in or take the quiz to build a profile.' },
        { status: 401 }
      );
    }

    // Soft rate limit: 3 user-vs-philosopher debates per user per day during prototype.
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count: recentCount } = await supabase
      .from('debate_history')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('a_name', '(you)')
      .gte('created_at', since);
    if ((recentCount ?? 0) >= 3) {
      return NextResponse.json({
        error: 'You\'ve hit the prototype limit of 3 personal debates per day. Reset at midnight UTC. (This will become a Mull+ feature.)'
      }, { status: 429 });
    }

    // Build the user's profile from their data
    const [attemptsRes, dilemmasRes, diariesRes] = await Promise.all([
      supabase
        .from('quiz_attempts')
        .select('archetype, flavor, taken_at, vector')
        .eq('user_id', user.id)
        .order('taken_at', { ascending: false })
        .limit(20),
      supabase
        .from('dilemma_responses')
        .select('vector_delta, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(40),
      supabase
        .from('diary_entries')
        .select('vector_delta, content, analysis, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20),
    ]);

    const attempts = (attemptsRes.data ?? []) as Array<{ archetype: string; flavor: string | null; taken_at: string; vector: number[] }>;
    const dilemmas = (dilemmasRes.data ?? []) as Array<{ vector_delta: number[] | null; created_at: string }>;
    const diaries = (diariesRes.data ?? []) as Array<{ vector_delta: number[] | null; content: string; analysis: string | null; created_at: string }>;

    if (attempts.length === 0) {
      return NextResponse.json({
        error: 'Take the quiz first — Mull needs a sense of how you think to put you in the debate.'
      }, { status: 400 });
    }

    // Compute current position
    const events = [
      ...attempts.map(a => ({ kind: 'q' as const, ts: new Date(a.taken_at).getTime(), vec: a.vector, delta: null as number[] | null })),
      ...dilemmas.filter(d => Array.isArray(d.vector_delta) && d.vector_delta!.length === 16)
        .map(d => ({ kind: 'd' as const, ts: new Date(d.created_at).getTime(), vec: null, delta: d.vector_delta! })),
      ...diaries.filter(d => Array.isArray(d.vector_delta) && d.vector_delta!.length === 16)
        .map(d => ({ kind: 'j' as const, ts: new Date(d.created_at).getTime(), vec: null, delta: d.vector_delta! })),
    ].sort((a, b) => a.ts - b.ts);

    let position: number[] = new Array(16).fill(0);
    for (const ev of events) {
      if (ev.kind === 'q' && ev.vec) position = ev.vec.slice();
      else if (ev.delta) position = vecAdd(position, ev.delta);
    }

    const topDims = position
      .map((v, i) => ({ key: DIM_KEYS[i], name: DIM_NAMES[DIM_KEYS[i]], v }))
      .sort((a, b) => b.v - a.v)
      .slice(0, 5);

    const latest = attempts[0];

    // Build a small note from latest diary analyses (no raw text — preserves privacy)
    const recentAnalyses = diaries
      .map(d => d.analysis)
      .filter((a): a is string => !!a && a.length > 0)
      .slice(0, 3);
    const diaryNote = recentAnalyses.length
      ? 'recent reflections suggest: ' + recentAnalyses.join(' / ')
      : '';

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Debate generation requires the Anthropic API key, not yet configured.' },
        { status: 503 }
      );
    }

    let result = await callClaude(
      {
        archetype: latest.archetype,
        flavor: latest.flavor,
        topDims,
        diaryNote,
      },
      { name: phil.name, keyIdea: phil.keyIdea },
      topic,
      apiKey
    );
    if (!result) {
      result = await callClaude(
        {
          archetype: latest.archetype,
          flavor: latest.flavor,
          topDims,
          diaryNote,
        },
        { name: phil.name, keyIdea: phil.keyIdea },
        topic,
        apiKey
      );
    }

    if (!result) {
      return NextResponse.json({
        error: 'The model returned a malformed response twice. Try again or pick a different topic.'
      }, { status: 502 });
    }

    // Persist as a debate_history row tagged "(you)" for Speaker A
    try {
      await supabase.from('debate_history').insert({
        user_id: user.id,
        a_name: '(you)',
        a_dates: 'now',
        a_archetype_key: null,
        b_name: phil.name,
        b_dates: phil.dates,
        b_archetype_key: phil.archetypeKey,
        topic,
        setup: result.setup,
        exchanges: result.exchanges,
      });
    } catch (saveErr) {
      console.warn('[debate/me] save failed', saveErr);
    }

    return NextResponse.json({
      ok: true,
      a: {
        name: latest.flavor ? `${latest.flavor} ${latest.archetype.replace(/^The /, '')}` : `You — ${latest.archetype.replace(/^The /, '')}`,
        dates: 'you, today',
        archetypeKey: null,
      },
      b: { name: phil.name, dates: phil.dates, archetypeKey: phil.archetypeKey },
      topic,
      setup: result.setup,
      exchanges: result.exchanges,
    });
  } catch (e) {
    console.error('[debate/me] error', e);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
