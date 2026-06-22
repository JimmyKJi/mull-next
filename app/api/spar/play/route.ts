// POST /api/spar/play
//
// Daily Spar endpoint, in TWO phases so the exchange always ends on
// the USER's turn (a player should never be judged for failing to
// answer an argument they had no turn to answer):
//
//   Phase 1 — REPLY  (body has userTurn, no closingTurn)
//     The user's opening is in. Generate the philosopher's single
//     rebuttal (Haiku) and return it. No judge yet.
//     Gate: spar_play (1 Haiku).
//
//   Phase 2 — JUDGE  (body has userTurn + philosopherTurn + closingTurn)
//     The user has read the rebuttal and written a closing turn. Run
//     the Sonnet judge over the full 3-turn exchange
//     (user → philosopher → user) and return the verdict.
//     Gate: spar_judge (1 Sonnet).
//
// Splitting the two AI calls across two requests means a user only
// spends the (expensive) Sonnet judge after they've committed a
// closing turn, and the philosopher is never the last voice in the
// room. Spar stays stateless (no arena_sessions row) — the client
// hands the opening + rebuttal back on the judge call.
//
// Unlike /api/arena/*, this endpoint doesn't auth-gate (anonymous
// users can spar; client-side localStorage limit applies too).
//
// Body (reply): { philosopherName, topicSlug, userTurn, locale? }
//   → { philosopherTurn }
// Body (judge): { philosopherName, topicSlug, userTurn, philosopherTurn,
//                 closingTurn, locale? }
//   → { judge: JudgeOutput | null, judgeError? }

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
  // Present only on the JUDGE phase. The client hands back the opening
  // rebuttal it received in phase 1 plus the user's closing turn.
  const philosopherTurn = (body?.philosopherTurn as string | undefined)?.trim() ?? '';
  const closingTurn = (body?.closingTurn as string | undefined)?.trim() ?? '';
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
  if (userTurn.length > SPAR_MAX_USER_CHARS || closingTurn.length > SPAR_MAX_USER_CHARS) {
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

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Spar unavailable: AI key not configured.' }, { status: 500 });
  }

  // Identify the user (optional) for per-user gating.
  const supabaseForUser = await createClient();
  const {
    data: { user },
  } = await supabaseForUser.auth.getUser();

  const isJudgePhase = closingTurn.length > 0;

  // ─── Phase 2: JUDGE the full 3-turn exchange ───────────────────────
  if (isJudgePhase) {
    if (!philosopherTurn) {
      return NextResponse.json(
        { error: 'Missing philosopherTurn for the closing judgment.' },
        { status: 400 },
      );
    }

    const gate = await aiGate(req, { bucket: 'spar_judge', userId: user?.id });
    if (!gate.ok) {
      return NextResponse.json({ error: gate.message }, { status: gate.status });
    }

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
              // User opens, philosopher replies, user closes — the user
              // always speaks last, so they're judged on an exchange they
              // got to finish.
              transcript: [
                { speaker: 'user', content: userTurn },
                { speaker: 'opponent', content: philosopherTurn },
                { speaker: 'user', content: closingTurn },
              ],
            }),
          },
        ],
      }),
    });

    if (!judgeRes.ok) {
      const errText = await judgeRes.text();
      console.error('[spar/judge] Sonnet error', judgeRes.status, errText);
      return NextResponse.json({
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
        judge: null,
        judgeError: 'Judge returned malformed output. Exchange is shown.',
      });
    }

    return NextResponse.json({ judge });
  }

  // ─── Phase 1: generate the philosopher's single rebuttal ───────────
  const gate = await aiGate(req, { bucket: 'spar_play', userId: user?.id });
  if (!gate.ok) {
    return NextResponse.json({ error: gate.message }, { status: gate.status });
  }

  const rebuttal = await generatePhilosopherTurn({
    philosopher,
    topicPrompt: topic.prompt,
    transcript: [{ speaker: 'user', content: userTurn }],
    // Spar turns are tighter than Arena turns — keep cost low.
    maxChars: 900,
    locale,
  });
  if (!rebuttal) {
    return NextResponse.json(
      { error: "Could not generate philosopher's turn. Try again." },
      { status: 502 },
    );
  }

  return NextResponse.json({ philosopherTurn: rebuttal });
}
