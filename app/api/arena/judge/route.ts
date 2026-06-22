// POST /api/arena/judge
//
// Calls the judge (Sonnet) on a session's transcript, updates each
// player's Elo independently (performance-based, non-zero-sum), marks
// the session 'judged', and returns the outcome.
//
// Body: { session_id }
// Returns: { outcome, judge_output, user_elo_before, user_elo_after,
//            elo_delta, opponent_elo, opponent_name }

import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getArenaPhilosopher, getArenaTopic } from '@/lib/arena/data';
import {
  judgeSystemPrompt,
  judgeUserPrompt,
  parseJudgeResponse,
  JUDGE_TOOL,
  JUDGE_TOOL_NAME,
  totalScore,
  type JudgeOutput,
} from '@/lib/arena/judge';
import { performanceElo, scoreToPerformance, kFactorForGames } from '@/lib/arena/elo';
import { notifyVerdict } from '@/lib/arena/notifications';
import { aiGate } from '@/lib/rate-limit';
import { getServerLocale } from '@/lib/locale-server';

const SONNET_MODEL = 'claude-sonnet-4-6';
const MIN_EXCHANGES_BEFORE_JUDGE = 2; // 2 user turns + 2 opponent turns

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const sessionId = body?.session_id as string | undefined;
  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session_id.' }, { status: 400 });
  }

  // AI rate limit + spend gate. Bucket: arena_judge (per-user daily
  // cap of 4 verdicts). The judge is the expensive Sonnet call —
  // tighter cap than arena_turn.
  const gate = await aiGate(req, { bucket: 'arena_judge', userId: user.id });
  if (!gate.ok) {
    return NextResponse.json({ error: gate.message }, { status: gate.status });
  }

  // Load session.
  const { data: session } = await supabase
    .from('arena_sessions')
    .select('*')
    .eq('id', sessionId)
    .maybeSingle();
  if (!session) {
    return NextResponse.json({ error: 'Session not found.' }, { status: 404 });
  }
  if (session.status === 'judged') {
    return NextResponse.json(
      {
        error: 'Already judged.',
        code: 'already_judged',
        judge_output: session.judge_json,
        elo_delta: session.elo_delta,
        outcome: session.judge_json?.outcome ?? null,
      },
      { status: 400 },
    );
  }
  if (session.status !== 'active') {
    return NextResponse.json({ error: 'Session not active.' }, { status: 400 });
  }

  // Load transcript.
  const { data: turns } = await supabase
    .from('arena_turns')
    .select('turn_order, speaker, content')
    .eq('session_id', sessionId)
    .order('turn_order', { ascending: true });

  if (!turns) {
    return NextResponse.json({ error: 'Could not load turns.' }, { status: 500 });
  }

  const userTurns = turns.filter((t) => t.speaker === 'user').length;
  if (userTurns < MIN_EXCHANGES_BEFORE_JUDGE) {
    return NextResponse.json(
      {
        error: `Need at least ${MIN_EXCHANGES_BEFORE_JUDGE} of your turns before judgment.`,
      },
      { status: 400 },
    );
  }

  const topic = getArenaTopic(session.topic_slug);
  if (!topic) {
    return NextResponse.json({ error: 'Session topic invalid.' }, { status: 500 });
  }
  // PvE has a philosopher; PvP has a human opponent.
  const philosopher = session.kind === 'pve' ? getArenaPhilosopher(session.opponent) : null;
  if (session.kind === 'pve' && !philosopher) {
    return NextResponse.json({ error: 'Session philosopher invalid.' }, { status: 500 });
  }
  const opponentLabel = session.kind === 'pvp' ? 'Opponent' : philosopher!.name;

  // Call the judge.
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Judge unavailable.' }, { status: 500 });
  }

  const locale = await getServerLocale();

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: SONNET_MODEL,
      max_tokens: 2500,
      tools: [JUDGE_TOOL],
      tool_choice: { type: 'tool', name: JUDGE_TOOL_NAME },
      system: judgeSystemPrompt(locale),
      messages: [
        {
          role: 'user',
          content: judgeUserPrompt({
            topicPrompt: topic.prompt,
            opponentName: opponentLabel,
            transcript: turns.map((t) => ({
              speaker: t.speaker as 'user' | 'opponent',
              content: t.content,
            })),
          }),
        },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('[arena/judge] Sonnet error', res.status, errText);
    return NextResponse.json({ error: 'Judge call failed. Try again.' }, { status: 502 });
  }

  const data = (await res.json()) as {
    content?: { type: string; text?: string; name?: string; input?: unknown }[];
    error?: { message?: string };
  };
  if (data.error) {
    console.error('[arena/judge] Sonnet returned error', data.error);
    return NextResponse.json({ error: 'Judge errored.' }, { status: 502 });
  }

  const parsed = parseJudgeResponse(data);
  if (!parsed) {
    console.error('[arena/judge] could not parse:', JSON.stringify(data.content)?.slice(0, 500));
    return NextResponse.json(
      { error: 'Judge returned malformed output. Try again.' },
      { status: 502 },
    );
  }

  // Update Elo.
  const { rating, eloDelta, userEloAfter } = await applyElo(supabase, user.id, session, parsed);

  // Persist judgment to session.
  await supabase
    .from('arena_sessions')
    .update({
      status: 'judged',
      // The `verdict` column has a CHECK constraint (user/opponent/draw)
      // and we can't migrate from here. New non-zero-sum semantics
      // (outcome/assessment/common_ground) live in judge_json instead;
      // write null to the legacy column.
      verdict: null,
      judge_json: parsed,
      elo_delta: eloDelta,
      judged_at: new Date().toISOString(),
    })
    .eq('id', sessionId);

  // PvP: fire-and-forget notify the OTHER player that the verdict
  // is in. (The caller already sees it inline.)
  const callerIsChallenger = user.id === session.user_id;
  if (session.kind === 'pvp' && session.opponent_user_id) {
    const otherUserId = callerIsChallenger ? session.opponent_user_id : session.user_id;
    const { data: callerProfile } = await supabase
      .from('public_profiles')
      .select('display_name, handle')
      .eq('user_id', user.id)
      .maybeSingle();
    const callerLabel =
      callerProfile?.display_name ||
      (callerProfile?.handle ? `@${callerProfile.handle}` : 'Your opponent');
    // Winner-free summary for the OTHER user. There is no "you won" —
    // each side is judged on its own argument quality, so we report the
    // outcome (common ground / distinct positions / talked past) plus
    // both /25 scores from the recipient's perspective.
    const userTotal = totalScore(parsed.user_scores);
    const oppTotal = totalScore(parsed.opponent_scores);
    // For the OTHER user (the recipient):
    //   - if they're the opponent (caller is challenger), their score = oppTotal
    //   - if they're the challenger (caller is opponent), their score = userTotal
    const otherIsChallenger = !callerIsChallenger;
    const recipientScore = otherIsChallenger ? userTotal : oppTotal;
    const senderScore = otherIsChallenger ? oppTotal : userTotal;
    const outcomeText =
      parsed.outcome === 'common_ground'
        ? 'You found common ground'
        : parsed.outcome === 'talked_past'
          ? 'You talked past each other'
          : 'You held distinct positions';
    const verdictLine = `${outcomeText}. Your argument scored ${recipientScore}/25, ${callerLabel} ${senderScore}/25.`;
    notifyVerdict({
      recipientUserId: otherUserId,
      opponentLabel: callerLabel,
      topicTitle: topic.title,
      sessionId,
      verdictLine,
    }).catch((e) => console.error('[arena/judge] notify failed:', e));
  }

  // For PvE: user_elo_before is always session.user_elo_at_start.
  // For PvP: depends on who called — challenger or opponent.
  // (callerIsChallenger declared above for the verdict notification.)
  const callerEloBefore =
    session.kind === 'pvp'
      ? callerIsChallenger
        ? session.user_elo_at_start
        : session.opponent_elo_at_start
      : session.user_elo_at_start;
  const otherEloBefore =
    session.kind === 'pvp'
      ? callerIsChallenger
        ? session.opponent_elo_at_start
        : session.user_elo_at_start
      : session.opponent_elo_at_start;

  return NextResponse.json({
    outcome: parsed.outcome,
    judge_output: parsed,
    user_score: totalScore(parsed.user_scores),
    opponent_score: totalScore(parsed.opponent_scores),
    user_elo_before: callerEloBefore,
    user_elo_after: userEloAfter,
    elo_delta: eloDelta,
    opponent_elo: otherEloBefore,
    opponent_name: opponentLabel,
    debates_count: rating.pve_debates_count + 1,
  });
}

/** Apply the judgment to player Elo(s) — performance-based, non-zero-sum.
 *
 *  Each player's rating moves on how well THEY argued (their own 5–25
 *  side-total mapped to a 0–1 performance), compared to what their
 *  rating predicted against this opponent. The two updates are
 *  independent: both can rise, both can fall, or they can diverge.
 *  There is no winner-takes-the-points transfer.
 *
 *  - PvE / calibration: updates the calling user's pve_elo only.
 *  - PvP: updates BOTH players' pvp_elo, each on its own performance.
 */
async function applyElo(
  supabase: Awaited<ReturnType<typeof createClient>>,
  callerId: string,
  session: {
    kind: string;
    user_id: string;
    opponent_user_id: string | null;
    user_elo_at_start: number;
    opponent_elo_at_start: number;
  },
  judgment: JudgeOutput,
): Promise<{
  rating: { pve_debates_count: number };
  eloDelta: number;
  userEloAfter: number;
}> {
  // "user_scores" is always the challenger's side; "opponent_scores"
  // the opponent's. Each maps to its own 0–1 performance.
  const userPerf = scoreToPerformance(totalScore(judgment.user_scores));
  const opponentPerf = scoreToPerformance(totalScore(judgment.opponent_scores));

  if (session.kind === 'pvp' && session.opponent_user_id) {
    return applyPvpElo(supabase, callerId, session, userPerf, opponentPerf);
  }

  // PvE / calibration — single player update on their own performance.
  return applyPveElo(supabase, callerId, session, userPerf);
}

/** PvE Elo update — single user's pve_elo bumped on their own
 *  performance (0–1), independent of how the philosopher scored. */
async function applyPveElo(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  session: {
    user_elo_at_start: number;
    opponent_elo_at_start: number;
  },
  userPerf: number,
) {
  const { data: rating } = await supabase
    .from('arena_user_ratings')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (!rating) throw new Error('Rating row missing');
  const k = kFactorForGames(rating.pve_debates_count);
  const updated = performanceElo({
    currentElo: rating.pve_elo,
    opponentElo: session.opponent_elo_at_start,
    performance: userPerf,
    kFactor: k,
  });
  const delta = updated - rating.pve_elo;
  await supabase
    .from('arena_user_ratings')
    .update({
      pve_elo: updated,
      pve_debates_count: rating.pve_debates_count + 1,
      pve_k_factor: kFactorForGames(rating.pve_debates_count + 1),
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);
  return {
    rating: { pve_debates_count: rating.pve_debates_count + 1 },
    eloDelta: delta,
    userEloAfter: updated,
  };
}

/** PvP Elo update — both players' pvp_elo bumped on their OWN
 *  performance (non-zero-sum). No coupling: both can rise, both can
 *  fall, or they diverge. Returns the delta + after-Elo for the
 *  CALLING user. */
async function applyPvpElo(
  supabase: Awaited<ReturnType<typeof createClient>>,
  callerId: string,
  session: {
    user_id: string;
    opponent_user_id: string | null;
    user_elo_at_start: number;
    opponent_elo_at_start: number;
  },
  challengerPerf: number,
  opponentPerf: number,
) {
  if (!session.opponent_user_id) throw new Error('PvP session missing opponent');

  const { data: challengerRating } = await supabase
    .from('arena_user_ratings')
    .select('*')
    .eq('user_id', session.user_id)
    .single();
  const { data: opponentRating } = await supabase
    .from('arena_user_ratings')
    .select('*')
    .eq('user_id', session.opponent_user_id)
    .single();
  if (!challengerRating || !opponentRating) throw new Error('Rating row missing');

  const challengerK = kFactorForGames(challengerRating.pvp_debates_count);
  const opponentK = kFactorForGames(opponentRating.pvp_debates_count);

  // Each side moves on its own performance vs the expectation its
  // rating set against this opponent. Independent updates.
  const challengerUpdated = performanceElo({
    currentElo: challengerRating.pvp_elo,
    opponentElo: opponentRating.pvp_elo,
    performance: challengerPerf,
    kFactor: challengerK,
  });
  const opponentUpdated = performanceElo({
    currentElo: opponentRating.pvp_elo,
    opponentElo: challengerRating.pvp_elo,
    performance: opponentPerf,
    kFactor: opponentK,
  });

  await supabase
    .from('arena_user_ratings')
    .update({
      pvp_elo: challengerUpdated,
      pvp_debates_count: challengerRating.pvp_debates_count + 1,
      pvp_k_factor: kFactorForGames(challengerRating.pvp_debates_count + 1),
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', session.user_id);
  await supabase
    .from('arena_user_ratings')
    .update({
      pvp_elo: opponentUpdated,
      pvp_debates_count: opponentRating.pvp_debates_count + 1,
      pvp_k_factor: kFactorForGames(opponentRating.pvp_debates_count + 1),
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', session.opponent_user_id);

  // Return the delta + after-Elo for the calling user.
  const callerIsChallenger = callerId === session.user_id;
  return {
    rating: {
      pve_debates_count: callerIsChallenger
        ? challengerRating.pve_debates_count
        : opponentRating.pve_debates_count,
    },
    eloDelta: callerIsChallenger
      ? challengerUpdated - challengerRating.pvp_elo
      : opponentUpdated - opponentRating.pvp_elo,
    userEloAfter: callerIsChallenger ? challengerUpdated : opponentUpdated,
  };
}
