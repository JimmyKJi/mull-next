// POST /api/arena/turn
//
// Submit the user's turn for an active session. The philosopher's
// rebuttal is generated and returned in the same response.
//
// Body: { session_id, content }
// Returns: { user_turn: {...}, opponent_turn: {...}, next_turn_number }

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getArenaPhilosopher, getArenaTopic } from "@/lib/arena/data";
import { generatePhilosopherTurn } from "@/lib/arena/philosopher-voice";

const MAX_USER_CHARS = 2000;
const MAX_TURNS_BEFORE_VERDICT = 8; // 4 exchanges = ample for v1

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const sessionId = body.session_id as string | undefined;
  const content = (body.content as string | undefined)?.trim() ?? "";

  if (!sessionId || !content) {
    return NextResponse.json(
      { error: "Missing session_id or content." },
      { status: 400 },
    );
  }
  if (content.length > MAX_USER_CHARS) {
    return NextResponse.json(
      { error: `Response too long (max ${MAX_USER_CHARS} chars).` },
      { status: 400 },
    );
  }

  // Load session (RLS scopes to this user).
  const { data: session } = await supabase
    .from("arena_sessions")
    .select("*")
    .eq("id", sessionId)
    .maybeSingle();

  if (!session) {
    return NextResponse.json({ error: "Session not found." }, { status: 404 });
  }
  if (session.status !== "active") {
    return NextResponse.json({ error: "Session not active." }, { status: 400 });
  }

  // Load current turns.
  const { data: turns } = await supabase
    .from("arena_turns")
    .select("turn_order, speaker, content")
    .eq("session_id", sessionId)
    .order("turn_order", { ascending: true });

  if (!turns) {
    return NextResponse.json({ error: "Could not load turns." }, { status: 500 });
  }

  // Cap turn count so the user can't drag a debate forever (cost ceiling).
  if (turns.length >= MAX_TURNS_BEFORE_VERDICT) {
    return NextResponse.json(
      { error: "Debate limit reached — call for the verdict.", code: "max_turns" },
      { status: 400 },
    );
  }

  // Validate it's the user's turn (last turn should be opponent).
  const lastTurn = turns[turns.length - 1];
  if (lastTurn?.speaker === "user") {
    return NextResponse.json(
      { error: "Already submitted; waiting on opponent." },
      { status: 400 },
    );
  }

  // Persist user turn.
  const userTurnOrder = turns.length + 1;
  await supabase.from("arena_turns").insert({
    session_id: sessionId,
    turn_order: userTurnOrder,
    speaker: "user",
    content,
  });

  // Generate opponent rebuttal.
  const philosopher = getArenaPhilosopher(session.opponent);
  const topic = getArenaTopic(session.topic_slug);
  if (!philosopher || !topic) {
    return NextResponse.json(
      { error: "Session references unknown opponent/topic." },
      { status: 500 },
    );
  }

  const transcript = [
    ...turns.map((t) => ({
      speaker: t.speaker as "user" | "opponent",
      content: t.content,
    })),
    { speaker: "user" as const, content },
  ];

  const opponentReply = await generatePhilosopherTurn({
    philosopher,
    topicPrompt: topic.prompt,
    transcript,
  });

  if (!opponentReply) {
    // Don't penalize the user for an upstream Anthropic failure.
    return NextResponse.json(
      { error: "Could not generate opponent rebuttal. Try again in a moment." },
      { status: 502 },
    );
  }

  const opponentTurnOrder = userTurnOrder + 1;
  await supabase.from("arena_turns").insert({
    session_id: sessionId,
    turn_order: opponentTurnOrder,
    speaker: "opponent",
    content: opponentReply,
  });

  return NextResponse.json({
    user_turn: { turn_order: userTurnOrder, content },
    opponent_turn: { turn_order: opponentTurnOrder, content: opponentReply },
    turns_remaining: MAX_TURNS_BEFORE_VERDICT - opponentTurnOrder,
    can_call_verdict: opponentTurnOrder >= 4, // ≥ 2 exchanges before verdict allowed
  });
}
