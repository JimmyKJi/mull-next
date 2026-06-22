// POST /api/arena/turn
//
// Submit a turn. Behavior depends on session.kind:
//   - PvE: record user's turn, generate philosopher rebuttal via Haiku
//     (auto-played), return both turns
//   - PvP: record the current player's turn (figured out from who
//     they are vs session.user_id / opponent_user_id), return just
//     the recorded turn; the other player gets it when they reload
//
// Body: { session_id, content }

import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getArenaPhilosopher, resolveTopicFromSlug } from '@/lib/arena/data';
import { generatePhilosopherTurn } from '@/lib/arena/philosopher-voice';
import { notifyYourTurn } from '@/lib/arena/notifications';
import { aiGate } from '@/lib/rate-limit';
import { getServerLocale } from '@/lib/locale-server';
import type { Locale } from '@/lib/translations';

const MAX_USER_CHARS = 2000;
const MAX_TURNS_BEFORE_VERDICT = 8;

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
  const content = (body?.content as string | undefined)?.trim() ?? '';

  if (!sessionId || !content) {
    return NextResponse.json({ error: 'Missing session_id or content.' }, { status: 400 });
  }
  if (content.length > MAX_USER_CHARS) {
    return NextResponse.json(
      { error: `Response too long (max ${MAX_USER_CHARS} chars).` },
      { status: 400 },
    );
  }

  // AI rate limit + spend gate. Bucket: arena_turn (per-user daily
  // cap of 32 turns ≈ 4 full debates). The judge call has its own
  // separate, tighter gate in /api/arena/judge.
  const gate = await aiGate(req, { bucket: 'arena_turn', userId: user.id });
  if (!gate.ok) {
    return NextResponse.json({ error: gate.message }, { status: gate.status });
  }

  const { data: session } = await supabase
    .from('arena_sessions')
    .select('*')
    .eq('id', sessionId)
    .maybeSingle();
  if (!session) {
    return NextResponse.json({ error: 'Session not found.' }, { status: 404 });
  }
  if (session.status !== 'active') {
    return NextResponse.json({ error: 'Session not active.' }, { status: 400 });
  }

  // Authorization: caller must be a participant.
  const isChallenger = session.user_id === user.id;
  const isOpponent = session.opponent_user_id === user.id;
  if (!isChallenger && !isOpponent) {
    return NextResponse.json({ error: 'Not your session.' }, { status: 403 });
  }

  // Load turns.
  const { data: turns } = await supabase
    .from('arena_turns')
    .select('turn_order, speaker, content')
    .eq('session_id', sessionId)
    .order('turn_order', { ascending: true });
  if (!turns) {
    return NextResponse.json({ error: 'Could not load turns.' }, { status: 500 });
  }

  if (turns.length >= MAX_TURNS_BEFORE_VERDICT) {
    return NextResponse.json(
      { error: 'Debate limit reached — call for the verdict.', code: 'max_turns' },
      { status: 400 },
    );
  }

  if (session.kind === 'pvp') {
    return handlePvpTurn({
      supabase,
      session,
      turns,
      isChallenger,
      content,
      callerId: user.id,
    });
  }
  // PvE
  const locale = await getServerLocale();
  return handlePveTurn({
    supabase,
    session,
    turns,
    content,
    locale,
  });
}

async function handlePveTurn(args: {
  supabase: Awaited<ReturnType<typeof createClient>>;
  session: {
    id: string;
    opponent: string;
    topic_slug: string;
  };
  turns: { turn_order: number; speaker: string; content: string }[];
  content: string;
  locale: Locale;
}) {
  const { supabase, session, turns, content, locale } = args;
  const lastTurn = turns[turns.length - 1];
  if (lastTurn?.speaker === 'user') {
    return NextResponse.json({ error: 'Already submitted; waiting on opponent.' }, { status: 400 });
  }

  // Persist user turn.
  const userTurnOrder = turns.length + 1;
  await supabase.from('arena_turns').insert({
    session_id: session.id,
    turn_order: userTurnOrder,
    speaker: 'user',
    content,
  });

  // Generate Haiku rebuttal.
  const philosopher = getArenaPhilosopher(session.opponent);
  const topic = resolveTopicFromSlug(session.topic_slug);
  if (!philosopher || !topic) {
    return NextResponse.json({ error: 'Session metadata invalid.' }, { status: 500 });
  }
  const transcript = [
    ...turns.map((t) => ({
      speaker: t.speaker as 'user' | 'opponent',
      content: t.content,
    })),
    { speaker: 'user' as const, content },
  ];
  const opponentReply = await generatePhilosopherTurn({
    philosopher,
    topicPrompt: topic.prompt,
    transcript,
    locale,
  });
  if (!opponentReply) {
    return NextResponse.json(
      { error: 'Could not generate opponent rebuttal. Try again.' },
      { status: 502 },
    );
  }
  const opponentTurnOrder = userTurnOrder + 1;
  await supabase.from('arena_turns').insert({
    session_id: session.id,
    turn_order: opponentTurnOrder,
    speaker: 'opponent',
    content: opponentReply,
  });

  return NextResponse.json({
    user_turn: { turn_order: userTurnOrder, content },
    opponent_turn: { turn_order: opponentTurnOrder, content: opponentReply },
    turns_remaining: MAX_TURNS_BEFORE_VERDICT - opponentTurnOrder,
    can_call_verdict: opponentTurnOrder >= 4,
  });
}

async function handlePvpTurn(args: {
  supabase: Awaited<ReturnType<typeof createClient>>;
  session: {
    id: string;
    user_id: string;
    opponent_user_id: string | null;
    topic_slug: string;
  };
  turns: { turn_order: number; speaker: string; content: string }[];
  isChallenger: boolean;
  content: string;
  callerId: string;
}) {
  const { supabase, session, turns, isChallenger, content, callerId } = args;
  // In PvP, "user" speaker = challenger; "opponent" speaker = accepter.
  const mySpeaker: 'user' | 'opponent' = isChallenger ? 'user' : 'opponent';
  const lastTurn = turns[turns.length - 1];
  // Not your turn if the last turn was yours OR (no turns at all and
  // you're not the challenger — challenger goes first via the create
  // endpoint, so this case shouldn't happen but we guard anyway).
  if (lastTurn?.speaker === mySpeaker) {
    return NextResponse.json(
      { error: 'Not your turn — waiting on the opponent.' },
      { status: 400 },
    );
  }
  if (!lastTurn && !isChallenger) {
    return NextResponse.json({ error: 'Challenger plays the opening turn.' }, { status: 400 });
  }

  const turnOrder = turns.length + 1;
  await supabase.from('arena_turns').insert({
    session_id: session.id,
    turn_order: turnOrder,
    speaker: mySpeaker,
    content,
  });

  // Fire-and-forget: notify the other player it's their turn now.
  const recipientUserId = isChallenger ? session.opponent_user_id : session.user_id;
  const topic = resolveTopicFromSlug(session.topic_slug);
  if (recipientUserId && topic) {
    const { data: senderProfile } = await supabase
      .from('public_profiles')
      .select('display_name, handle')
      .eq('user_id', callerId)
      .maybeSingle();
    const senderLabel =
      senderProfile?.display_name ||
      (senderProfile?.handle ? `@${senderProfile.handle}` : 'Your opponent');
    notifyYourTurn({
      recipientUserId,
      opponentLabel: senderLabel,
      topicTitle: topic.title,
      sessionId: session.id,
    }).catch((e) => console.error('[arena/turn] notify failed:', e));
  }

  // Count how many turns each side has played to compute can_call_verdict.
  const userTurns =
    turns.filter((t) => t.speaker === 'user').length + (mySpeaker === 'user' ? 1 : 0);
  const oppTurns =
    turns.filter((t) => t.speaker === 'opponent').length + (mySpeaker === 'opponent' ? 1 : 0);

  return NextResponse.json({
    my_turn: { turn_order: turnOrder, speaker: mySpeaker, content },
    turns_remaining: MAX_TURNS_BEFORE_VERDICT - turnOrder,
    can_call_verdict: userTurns >= 2 && oppTurns >= 2,
  });
}
