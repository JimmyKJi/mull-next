// POST /api/arena/start
//
// Creates a new debate session. Body: { kind, opponent, topic_slug }
// OR { kind: 'pve', opponent, custom_prompt } when the user authors
// their own topic instead of picking a seeded one.
// Returns: { session_id, opening_turn } — opening_turn is the
// philosopher's first move (since they go first in the prototype).
//
// Enforces the daily debate cap (3/day per user) to keep AI cost
// bounded under the £500/mo ceiling.

import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import {
  getArenaPhilosopher,
  getArenaTopic,
  canFace,
  MAX_ELO_GAP,
  normalizeCustomTopicText,
  makeCustomTopicSlug,
  customTopicFromSlug,
  MIN_CUSTOM_TOPIC_CHARS,
  MAX_CUSTOM_TOPIC_CHARS,
  type ArenaTopic,
} from '@/lib/arena/data';
import { generatePhilosopherTurn } from '@/lib/arena/philosopher-voice';
import { getServerLocale } from '@/lib/locale-server';

const DAILY_CAP = 3;

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Bad request.' }, { status: 400 });
  }

  const kind = body.kind as string | undefined;
  const opponent = body.opponent as string | undefined;
  const topicSlug = body.topic_slug as string | undefined;
  const customPrompt = body.custom_prompt as string | undefined;

  if (!kind || !['calibration', 'pve'].includes(kind)) {
    return NextResponse.json({ error: 'Invalid kind.' }, { status: 400 });
  }
  if (!opponent) {
    return NextResponse.json({ error: 'Missing opponent.' }, { status: 400 });
  }

  const philosopher = getArenaPhilosopher(opponent);
  if (!philosopher) {
    return NextResponse.json({ error: 'Unknown opponent.' }, { status: 400 });
  }

  // Resolve the topic: either a user-authored custom prompt (pve only)
  // or a seeded slug. Custom topics are stored as the slug itself behind
  // a `custom:` prefix — no schema change, re-resolved everywhere else.
  let topic: ArenaTopic;
  let resolvedSlug: string;
  const wantsCustom = typeof customPrompt === 'string' && customPrompt.trim().length > 0;
  if (wantsCustom) {
    if (kind !== 'pve') {
      return NextResponse.json(
        { error: 'Custom topics are only available in practice debates.' },
        { status: 400 },
      );
    }
    // Reject oversized bodies up front. normalizeCustomTopicText would
    // silently truncate to MAX chars anyway, but bounding the raw input
    // avoids doing string work on a multi-megabyte payload.
    if ((customPrompt as string).length > MAX_CUSTOM_TOPIC_CHARS * 8) {
      return NextResponse.json({ error: 'Topic is too long.' }, { status: 400 });
    }
    const clean = normalizeCustomTopicText(customPrompt as string);
    if (clean.length < MIN_CUSTOM_TOPIC_CHARS) {
      return NextResponse.json(
        {
          error: `Your topic is too short — add a bit more (at least ${MIN_CUSTOM_TOPIC_CHARS} characters).`,
        },
        { status: 400 },
      );
    }
    resolvedSlug = makeCustomTopicSlug(clean);
    topic = customTopicFromSlug(resolvedSlug);
  } else {
    if (!topicSlug) {
      return NextResponse.json({ error: 'Missing opponent or topic_slug.' }, { status: 400 });
    }
    const seeded = getArenaTopic(topicSlug);
    if (!seeded) {
      return NextResponse.json({ error: 'Unknown opponent/topic.' }, { status: 400 });
    }
    topic = seeded;
    resolvedSlug = topicSlug;
  }

  // Load (or create) the user's arena rating + enforce daily cap.
  let { data: rating } = await supabase
    .from('arena_user_ratings')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!rating) {
    const { data: inserted, error: insertErr } = await supabase
      .from('arena_user_ratings')
      .insert({ user_id: user.id })
      .select('*')
      .single();
    if (insertErr || !inserted) {
      return NextResponse.json({ error: 'Could not initialize rating.' }, { status: 500 });
    }
    rating = inserted;
  }

  // Daily cap reset.
  const today = new Date().toISOString().slice(0, 10);
  const resetDate = rating.daily_debates_reset_at as string | null;
  const dailyCount = resetDate === today ? (rating.daily_debates_count as number) : 0;
  if (kind === 'pve' && dailyCount >= DAILY_CAP) {
    return NextResponse.json(
      {
        error: `Daily limit reached (${DAILY_CAP}/day). The cap keeps the Arena affordable to run. Come back tomorrow.`,
        code: 'daily_cap_reached',
      },
      { status: 429 },
    );
  }

  // Elo gate — can't punch up more than MAX_ELO_GAP. Keeps heavy
  // voices (Nietzsche, Hegel) behind a real climb so newer users
  // don't lose 60 Elo to a thinker they're not ready for, and the
  // judge isn't comparing apples to oranges.
  if (kind === 'pve' && !canFace(rating.pve_elo, philosopher.baseElo)) {
    return NextResponse.json(
      {
        error: `${philosopher.name} (Elo ${philosopher.baseElo}) is too far above your current rating of ${rating.pve_elo}. Climb closer first — you can face opponents up to ${MAX_ELO_GAP} Elo above you.`,
        code: 'elo_gap_too_large',
      },
      { status: 403 },
    );
  }

  // Create session.
  const { data: session, error: sessionErr } = await supabase
    .from('arena_sessions')
    .insert({
      user_id: user.id,
      kind,
      topic_slug: resolvedSlug,
      opponent,
      opponent_elo_at_start: philosopher.baseElo,
      user_elo_at_start: rating.pve_elo,
    })
    .select('id')
    .single();
  if (sessionErr || !session) {
    return NextResponse.json({ error: 'Could not start session.' }, { status: 500 });
  }

  // Update daily counter (only for pve; calibration counted separately).
  if (kind === 'pve') {
    await supabase
      .from('arena_user_ratings')
      .update({
        daily_debates_count: dailyCount + 1,
        daily_debates_reset_at: today,
      })
      .eq('user_id', user.id);
  }

  // Generate opening turn — the philosopher opens. Kept deliberately
  // short (a long opening wall reads as a lecture and scares off
  // first-time debaters); the locale matters here too — without it a
  // zh user's debate would OPEN in English and only switch language
  // from turn two.
  const locale = await getServerLocale();
  const opening = await generatePhilosopherTurn({
    philosopher,
    topicPrompt: topic.prompt,
    maxChars: 750,
    locale,
    transcript: [
      {
        speaker: 'user',
        content: `(Open the debate. In a short opening — well under 120 words — take a clear side on the topic in plain language, give one concrete reason or everyday example for it, and end with one direct question that invites me to disagree. You speak first.)`,
      },
    ],
  });

  if (!opening) {
    // Mark abandoned so the cap isn't burned on a broken session.
    await supabase.from('arena_sessions').update({ status: 'abandoned' }).eq('id', session.id);
    return NextResponse.json(
      { error: 'Could not generate opening turn. Try again.' },
      { status: 502 },
    );
  }

  // Insert the opening turn (turn 1, opponent speaker).
  await supabase.from('arena_turns').insert({
    session_id: session.id,
    turn_order: 1,
    speaker: 'opponent',
    content: opening,
  });

  return NextResponse.json({
    session_id: session.id,
    opening_turn: opening,
    topic_prompt: topic.prompt,
    topic_title: topic.title,
    opponent_name: philosopher.name,
    opponent_elo: philosopher.baseElo,
    user_elo: rating.pve_elo,
    daily_debates_remaining: DAILY_CAP - dailyCount - 1,
  });
}
