// POST /api/arena/pvp/create
//
// Create a PvP challenge: topic + opening turn. The challenge sits
// in 'pending_opponent' status on the open challenges board until
// someone accepts. No matchmaking (yet) — players browse + pick.
//
// Body: { topic_slug, opening_content }
// Returns: { session_id }

import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getArenaTopic } from '@/lib/arena/data';

const MIN_OPENING_CHARS = 50;
const MAX_OPENING_CHARS = 2000;
const MAX_OPEN_CHALLENGES_PER_USER = 3;

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const topicSlug = body?.topic_slug as string | undefined;
  const opening = (body?.opening_content as string | undefined)?.trim() ?? '';

  if (!topicSlug || !opening) {
    return NextResponse.json({ error: 'Missing topic_slug or opening_content.' }, { status: 400 });
  }
  if (opening.length < MIN_OPENING_CHARS) {
    return NextResponse.json(
      {
        error: `Opening too short (min ${MIN_OPENING_CHARS} chars). State a real position so the opponent has something to work with.`,
      },
      { status: 400 },
    );
  }
  if (opening.length > MAX_OPENING_CHARS) {
    return NextResponse.json(
      { error: `Opening too long (max ${MAX_OPENING_CHARS} chars).` },
      { status: 400 },
    );
  }

  const topic = getArenaTopic(topicSlug);
  if (!topic) {
    return NextResponse.json({ error: 'Unknown topic.' }, { status: 400 });
  }

  // Ensure rating row exists, get current pvp_elo for the session
  // start-snapshot.
  let { data: rating } = await supabase
    .from('arena_user_ratings')
    .select('pvp_elo')
    .eq('user_id', user.id)
    .maybeSingle();
  if (!rating) {
    const { data: created } = await supabase
      .from('arena_user_ratings')
      .insert({ user_id: user.id })
      .select('pvp_elo')
      .single();
    rating = created;
  }
  if (!rating) {
    return NextResponse.json({ error: 'Could not initialize rating.' }, { status: 500 });
  }

  // Cap how many open challenges a single user can have outstanding —
  // prevents the board from being flooded.
  const { count: openCount } = await supabase
    .from('arena_sessions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('kind', 'pvp')
    .eq('status', 'pending_opponent');
  if ((openCount ?? 0) >= MAX_OPEN_CHALLENGES_PER_USER) {
    return NextResponse.json(
      {
        error: `You already have ${MAX_OPEN_CHALLENGES_PER_USER} open challenges. Wait for one to be accepted or cancel one first.`,
      },
      { status: 429 },
    );
  }

  // Create session.
  const { data: session, error: sessionErr } = await supabase
    .from('arena_sessions')
    .insert({
      user_id: user.id,
      kind: 'pvp',
      topic_slug: topicSlug,
      opponent: '(open challenge)',
      // Opponent Elo at start is the challenger's own for now; updated
      // when the challenge is accepted (we'll record the snapshot then).
      opponent_elo_at_start: rating.pvp_elo,
      user_elo_at_start: rating.pvp_elo,
      status: 'pending_opponent',
    })
    .select('id')
    .single();
  if (sessionErr || !session) {
    return NextResponse.json({ error: 'Could not create challenge.' }, { status: 500 });
  }

  // Insert the opening turn (turn 1, challenger = "user").
  await supabase.from('arena_turns').insert({
    session_id: session.id,
    turn_order: 1,
    speaker: 'user',
    content: opening,
  });

  return NextResponse.json({ session_id: session.id });
}
