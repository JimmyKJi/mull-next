import { NextResponse } from 'next/server';
import { PHILOSOPHERS } from '@/lib/philosophers';
import { createClient } from '@/utils/supabase/server';

type ClaudeResponse = {
  content?: Array<{ type: string; text?: string }>;
  error?: { message?: string; type?: string };
};

type DebateExchange = {
  speaker: string;        // 'A' or 'B'
  text: string;
};

type DebateOutput = {
  exchanges: DebateExchange[];
  setup: string;          // a one-line scene-setting summary
};

function buildSystemPrompt(a: { name: string; keyIdea: string }, b: { name: string; keyIdea: string }, topic: string): string {
  return `You simulate a real conversation between two philosophers — not a panel where each delivers a prepared statement, but an actual exchange where each is listening and responding to the specific moves the other just made.

THINKER A: ${a.name}
Core position: ${a.keyIdea}

THINKER B: ${b.name}
Core position: ${b.keyIdea}

TOPIC: ${topic}

HOW THE EXCHANGE SHOULD READ:
- It must feel like two people TALKING TO EACH OTHER. Each turn quotes back, restates, or directly answers what the other just said. Avoid lectures.
- Use each thinker's own technical vocabulary (e.g. "the categorical imperative" for Kant, "alienation" or "use-value" for Marx, "the Forms" or "anamnesis" for Plato, "ataraxia" for Epicurus, "the will to power" for Nietzsche, "śūnyatā" or "dependent origination" for Buddhist thinkers, etc.). When using a technical term unfamiliar to a modern reader, give a brief gloss in plain language ON THE SAME SENTENCE.
- Argue from each thinker's actual positions. Real disagreement where they disagree. Real agreement where they agree. No straw men. No flattery.
- Each turn should DO ONE THING — a counter-move, a probing question, a refinement, a concession, an analogy. Short and sharp beats long and exhaustive.
- Conversational momentum: A says X → B responds to X specifically and pushes back at the weakest point → A defends or refines → and so on. Build tension and resolution.

WRITE: 6 to 8 alternating exchanges starting with A (A, B, A, B, ...). Each is one paragraph, 2-4 sentences, under 500 characters. Plain modern English (with technical terms used naturally, not avoided).

CRITICAL: Output ONLY valid JSON. No preamble, no markdown code fences, no commentary outside the JSON. Start with { and end with }.

{
  "setup": "<one sentence framing the exchange — what specifically is at stake between these two on this topic>",
  "exchanges": [
    {"speaker": "A", "text": "..."},
    {"speaker": "B", "text": "..."},
    {"speaker": "A", "text": "..."},
    {"speaker": "B", "text": "..."},
    {"speaker": "A", "text": "..."},
    {"speaker": "B", "text": "..."}
  ]
}`;
}

async function callClaude(
  promptA: { name: string; keyIdea: string },
  promptB: { name: string; keyIdea: string },
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
      max_tokens: 4000,
      system: buildSystemPrompt(promptA, promptB, topic),
      messages: [{ role: 'user', content: `Generate the JSON exchange now. Output JSON only.` }]
    })
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('[debate] Claude API error', res.status, text);
    return null;
  }
  const data: ClaudeResponse = await res.json();
  if (data.error) {
    console.error('[debate] Claude returned error', data.error);
    return null;
  }
  const text = (data.content ?? [])
    .filter(b => b.type === 'text')
    .map(b => b.text || '')
    .join('')
    .trim();

  // Strip markdown code fences if present
  let cleaned = text;
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '');

  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start < 0 || end < 0) {
    console.error('[debate] no JSON found in response:', text.slice(0, 500));
    return null;
  }
  let parsed: { setup?: unknown; exchanges?: unknown };
  try {
    parsed = JSON.parse(cleaned.slice(start, end + 1));
  } catch (e) {
    // Sometimes the JSON is truncated. Try to recover by finding the last complete exchange.
    const recovered = recoverPartialJson(cleaned.slice(start));
    if (recovered) {
      parsed = recovered;
    } else {
      console.error('[debate] JSON parse failed:', e, '\nResponse start:', cleaned.slice(0, 800));
      return null;
    }
  }
  if (!Array.isArray(parsed.exchanges) || parsed.exchanges.length < 2) {
    console.error('[debate] bad exchanges shape:', parsed);
    return null;
  }
  const exchanges = (parsed.exchanges as Array<{ speaker?: unknown; text?: unknown }>)
    .filter(x => (x.speaker === 'A' || x.speaker === 'B') && typeof x.text === 'string' && (x.text as string).trim().length > 0)
    .map(x => ({ speaker: x.speaker as 'A' | 'B', text: (x.text as string).trim() }));
  if (exchanges.length < 2) {
    console.error('[debate] not enough valid exchanges:', exchanges.length);
    return null;
  }
  return {
    setup: typeof parsed.setup === 'string' ? parsed.setup : '',
    exchanges
  };
}

// Try to recover from a truncated JSON response by finding the last complete object.
function recoverPartialJson(s: string): { setup?: string; exchanges?: unknown[] } | null {
  // Look for "exchanges": [...] and try to close it at the last complete }
  const exchMatch = s.match(/"exchanges"\s*:\s*\[/);
  if (!exchMatch) return null;
  const arrStart = (exchMatch.index ?? 0) + exchMatch[0].length;
  // Walk through finding complete {...} entries
  const completed: string[] = [];
  let depth = 0;
  let cur = '';
  let inString = false;
  let escaped = false;
  for (let i = arrStart; i < s.length; i++) {
    const ch = s[i];
    cur += ch;
    if (escaped) { escaped = false; continue; }
    if (ch === '\\') { escaped = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) {
        completed.push(cur.trim().replace(/^,\s*/, ''));
        cur = '';
      }
    }
  }
  if (completed.length < 2) return null;
  // Try to extract setup from the original JSON
  const setupMatch = s.match(/"setup"\s*:\s*"((?:[^"\\]|\\.)*)"/);
  const setup = setupMatch ? JSON.parse('"' + setupMatch[1] + '"') : '';
  try {
    const exchanges = completed.map(c => JSON.parse(c));
    return { setup, exchanges };
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const aName = (body?.a_name ?? '').toString().trim();
    const bName = (body?.b_name ?? '').toString().trim();
    const topic = (body?.topic ?? '').toString().trim();

    if (!aName || !bName || aName === bName) {
      return NextResponse.json({ error: 'Pick two different philosophers.' }, { status: 400 });
    }
    if (!topic || topic.length < 4 || topic.length > 240) {
      return NextResponse.json({ error: 'Topic should be a short phrase (4–240 chars).' }, { status: 400 });
    }

    const a = PHILOSOPHERS.find(p => p.name === aName);
    const b = PHILOSOPHERS.find(p => p.name === bName);
    if (!a || !b) {
      return NextResponse.json({ error: 'Unknown philosopher.' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Debate generation requires the Anthropic API key, which isn\'t configured yet.' },
        { status: 503 }
      );
    }

    // One automatic retry — the model occasionally returns markdown-wrapped or
    // truncated JSON the parser can't recover.
    let result = await callClaude(
      { name: a.name, keyIdea: a.keyIdea },
      { name: b.name, keyIdea: b.keyIdea },
      topic,
      apiKey
    );
    if (!result) {
      console.warn('[debate] first attempt failed, retrying once');
      result = await callClaude(
        { name: a.name, keyIdea: a.keyIdea },
        { name: b.name, keyIdea: b.keyIdea },
        topic,
        apiKey
      );
    }

    if (!result) {
      return NextResponse.json({
        error: 'The model returned a malformed response twice. Try a slightly different topic, or try again in a moment.'
      }, { status: 502 });
    }

    // Save to debate_history if the user is signed in (best-effort, non-blocking
    // for the response). The trigger on this table prunes to most-recent-3.
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('debate_history').insert({
          user_id: user.id,
          a_name: a.name,
          a_dates: a.dates,
          a_archetype_key: a.archetypeKey,
          b_name: b.name,
          b_dates: b.dates,
          b_archetype_key: b.archetypeKey,
          topic,
          setup: result.setup,
          exchanges: result.exchanges,
        });
      }
    } catch (saveErr) {
      // Don't fail the user-facing request if persistence fails.
      console.warn('[debate] could not persist to history', saveErr);
    }

    return NextResponse.json({
      ok: true,
      a: { name: a.name, dates: a.dates, archetypeKey: a.archetypeKey },
      b: { name: b.name, dates: b.dates, archetypeKey: b.archetypeKey },
      topic,
      setup: result.setup,
      exchanges: result.exchanges
    });
  } catch (e) {
    console.error('[debate] unexpected error', e);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
