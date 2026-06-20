// POST /api/spar/play
//
// One-shot Daily Spar endpoint. Takes the user's single turn,
// generates the philosopher's single response (Haiku), then runs
// the Sonnet judge — all in one round-trip. Returns the
// philosopher's turn plus the judge verdict.
//
// Unlike /api/arena/turn + /api/arena/judge, this endpoint:
//   - Doesn't require a session row (no arena_sessions DB write)
//   - Doesn't update Elo (spar is a casual surface; no ladder yet)
//   - Doesn't auth-gate (anonymous users can spar; client-side
//     limit applies via localStorage)
//
// Body: { philosopherName, topicSlug, userTurn }
// Returns: { philosopherTurn, judge: JudgeOutput }

import { NextResponse } from 'next/server';
import { ARENA_PHILOSOPHERS, ARENA_TOPICS } from '@/lib/arena/data';
import { SPAR_MAX_USER_CHARS } from '@/lib/spar';
import { generatePhilosopherTurn } from '@/lib/arena/philosopher-voice';
import {
  judgeSystemPrompt,
  judgeUserPrompt,
  parseJudgeResponse,
  JUDGE_TOOL,
  JUDGE_TOOL_NAME,
  type JudgeOutput,
} from '@/lib/arena/judge';
import { aiGate } from '@/lib/rate-limit';
import { createClient } from '@/utils/supabase/server';
import { type Locale } from '@/lib/translations';

const SONNET_MODEL = 'claude-sonnet-4-6';

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const philosopherName = body?.philosopherName as string | undefined;
  const topicSlug = body?.topicSlug as string | undefined;
  const userTurn = (body?.userTurn as string | undefined)?.trim() ?? '';
  // Optional UI locale. When set (and non-English) the philosopher turn +
  // verdict come back in that language; the topic prompt sent to the model
  // stays English (the canonical source). Invalid values fall back to English
  // inside the prompt builders.
  const locale = body?.locale as Locale | undefined;

  if (!philosopherName || !topicSlug || !userTurn) {
    return NextResponse.json(
      { error: 'Missing philosopherName, topicSlug, or userTurn.' },
      { status: 400 },
    );
  }
  if (userTurn.length > SPAR_MAX_USER_CHARS) {
    return NextResponse.json(
      { error: `Your turn is too long (max ${SPAR_MAX_USER_CHARS} characters).` },
      { status: 400 },
    );
  }

  const philosopher = ARENA_PHILOSOPHERS.find((p) => p.name === philosopherName);
  const topic = ARENA_TOPICS.find((t) => t.slug === topicSlug);
  if (!philosopher || !topic) {
    return NextResponse.json(
      { error: "Unknown philosopher or topic for today's spar." },
      { status: 400 },
    );
  }

  // Per-user + global spend gate. Inserts the bucket event on success
  // so the global ceiling sees this turn even before the API call
  // completes — a worst-case rapid-fire abuser hits the per-user cap
  // (3/day) before the second request even returns.
  const supabaseForUser = await createClient();
  const {
    data: { user },
  } = await supabaseForUser.auth.getUser();
  const gate = await aiGate(req, { bucket: 'spar_play', userId: user?.id });
  if (!gate.ok) {
    return NextResponse.json({ error: gate.message }, { status: gate.status });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Spar unavailable: AI key not configured.' },
      { status: 500 },
    );
  }

  // 1) Generate the philosopher's one rebuttal turn.
  const philosopherTurn = await generatePhilosopherTurn({
    philosopher,
    topicPrompt: topic.prompt,
    transcript: [{ speaker: 'user', content: userTurn }],
    // Spar turns are tighter than Arena turns — keep cost low.
    maxChars: 900,
    locale,
  });
  if (!philosopherTurn) {
    return NextResponse.json(
      { error: "Could not generate philosopher's turn. Try again." },
      { status: 502 },
    );
  }

  // 2) Call the judge on the two-turn exchange.
  const judgeRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: SONNET_MODEL,
      max_tokens: 2200,
      tools: [JUDGE_TOOL],
      tool_choice: { type: 'tool', name: JUDGE_TOOL_NAME },
      system: judgeSystemPrompt(locale),
      messages: [
        {
          role: 'user',
          content: judgeUserPrompt({
            topicPrompt: topic.prompt,
            opponentName: philosopher.name,
            transcript: [
              { speaker: 'user', content: userTurn },
              { speaker: 'opponent', content: philosopherTurn },
            ],
          }),
        },
      ],
    }),
  });

  if (!judgeRes.ok) {
    const errText = await judgeRes.text();
    console.error('[spar/judge] Sonnet error', judgeRes.status, errText);
    // Return the philosopher turn even if judge fails — the user can
    // see the exchange. Mark the judge as unavailable.
    return NextResponse.json({
      philosopherTurn,
      judge: null,
      judgeError: 'Judge call failed. The exchange is shown above.',
    });
  }
  const data = (await judgeRes.json()) as {
    content?: { type: string; text?: string; name?: string; input?: unknown }[];
    error?: { message?: string };
  };
  const judge: JudgeOutput | null = parseJudgeResponse(data);
  if (!judge) {
    console.error('[spar/judge] could not parse:', JSON.stringify(data.content)?.slice(0, 500));
    return NextResponse.json({
      philosopherTurn,
      judge: null,
      judgeError: 'Judge returned malformed output. Exchange is shown.',
    });
  }

  return NextResponse.json({ philosopherTurn, judge });
}
