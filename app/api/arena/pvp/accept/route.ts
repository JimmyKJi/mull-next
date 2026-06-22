// POST /api/arena/pvp/accept
//
// Accept an open PvP challenge: become the opponent, flip status to
// 'active', snapshot the challenger's pvp_elo as opponent_elo_at_start.
//
// Body: { session_id }
// Returns: { session_id, message }

import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { notifyChallengeAccepted } from '@/lib/arena/notifications';
import { resolveTopicFromSlug } from '@/lib/arena/data';

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

  // Load the open challenge.
  const { data: session } = await supabase
    .from('arena_sessions')
    .select('*')
    .eq('id', sessionId)
    .maybeSingle();
  if (!session) {
    return NextResponse.json({ error: 'Challenge not found.' }, { status: 404 });
  }
  if (session.kind !== 'pvp' || session.status !== 'pending_opponent') {
    return NextResponse.json({ error: 'Challenge is no longer open.' }, { status: 400 });
  }
  if (session.user_id === user.id) {
    return NextResponse.json({ error: "You can't accept your own challenge." }, { status: 400 });
  }

  // Ensure accepter has a rating row.
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

  // Get the challenger's current pvp_elo for the opponent snapshot.
  // (session.user_elo_at_start was set when the challenge was created;
  //  we keep that as the challenger's; the accepter's becomes the
  //  opponent_elo_at_start.)
  const { data: challengerRating } = await supabase
    .from('arena_user_ratings')
    .select('pvp_elo')
    .eq('user_id', session.user_id)
    .maybeSingle();

  // Flip to active. Note we re-snapshot opponent_elo_at_start to the
  // ACCEPTER's pvp_elo (the actual opponent of the challenger) and
  // user_elo_at_start to the CHALLENGER's current pvp_elo (in case it
  // changed between create and accept).
  const { error: updateErr } = await supabase
    .from('arena_sessions')
    .update({
      status: 'active',
      opponent_user_id: user.id,
      opponent: '(opponent)',
      opponent_elo_at_start: rating.pvp_elo,
      user_elo_at_start: challengerRating?.pvp_elo ?? session.user_elo_at_start,
    })
    .eq('id', sessionId)
    .eq('status', 'pending_opponent'); // race guard

  if (updateErr) {
    return NextResponse.json({ error: 'Could not accept challenge.' }, { status: 500 });
  }

  // Fire-and-forget notification to the challenger. Doesn't block
  // the response — if Resend is slow / down, the user still gets
  // the success.
  const topic = resolveTopicFromSlug(session.topic_slug);
  if (topic) {
    const { data: opponentProfile } = await supabase
      .from('public_profiles')
      .select('display_name, handle')
      .eq('user_id', user.id)
      .maybeSingle();
    const opponentLabel =
      opponentProfile?.display_name ||
      (opponentProfile?.handle ? `@${opponentProfile.handle}` : 'Your opponent');
    notifyChallengeAccepted({
      challengerUserId: session.user_id,
      opponentLabel,
      topicTitle: topic.title,
      sessionId,
    }).catch((e) => console.error('[arena/accept] notify failed:', e));
  }

  return NextResponse.json({
    session_id: sessionId,
    message: "Challenge accepted. It's your turn.",
  });
}
