// POST /api/arena/judge
//
// Calls the judge (Sonnet) on a session's transcript, updates the
// user's Elo, marks the session 'judged', returns the verdict.
//
// Body: { session_id }
// Returns: { verdict, judge_output, user_elo_before, user_elo_after,
//            elo_delta, opponent_elo, opponent_name }

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getArenaPhilosopher, getArenaTopic } from "@/lib/arena/data";
import {
  judgeSystemPrompt,
  judgeUserPrompt,
  parseJudgeJson,
  judgmentToElo,
  totalScore,
  type JudgeOutput,
} from "@/lib/arena/judge";
import { newElo, kFactorForGames } from "@/lib/arena/elo";

const SONNET_MODEL = "claude-sonnet-4-6";
const MIN_EXCHANGES_BEFORE_JUDGE = 2; // 2 user turns + 2 opponent turns

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const sessionId = body?.session_id as string | undefined;
  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id." }, { status: 400 });
  }

  // Load session.
  const { data: session } = await supabase
    .from("arena_sessions")
    .select("*")
    .eq("id", sessionId)
    .maybeSingle();
  if (!session) {
    return NextResponse.json({ error: "Session not found." }, { status: 404 });
  }
  if (session.status === "judged") {
    return NextResponse.json(
      {
        error: "Already judged.",
        code: "already_judged",
        judge_output: session.judge_json,
        elo_delta: session.elo_delta,
        verdict: session.verdict,
      },
      { status: 400 },
    );
  }
  if (session.status !== "active") {
    return NextResponse.json({ error: "Session not active." }, { status: 400 });
  }

  // Load transcript.
  const { data: turns } = await supabase
    .from("arena_turns")
    .select("turn_order, speaker, content")
    .eq("session_id", sessionId)
    .order("turn_order", { ascending: true });

  if (!turns) {
    return NextResponse.json({ error: "Could not load turns." }, { status: 500 });
  }

  const userTurns = turns.filter((t) => t.speaker === "user").length;
  if (userTurns < MIN_EXCHANGES_BEFORE_JUDGE) {
    return NextResponse.json(
      {
        error: `Need at least ${MIN_EXCHANGES_BEFORE_JUDGE} of your turns before judgment.`,
      },
      { status: 400 },
    );
  }

  const philosopher = getArenaPhilosopher(session.opponent);
  const topic = getArenaTopic(session.topic_slug);
  if (!philosopher || !topic) {
    return NextResponse.json({ error: "Session metadata invalid." }, { status: 500 });
  }

  // Call the judge.
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Judge unavailable." }, { status: 500 });
  }

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: SONNET_MODEL,
      max_tokens: 2500,
      system: judgeSystemPrompt(),
      messages: [
        {
          role: "user",
          content: judgeUserPrompt({
            topicPrompt: topic.prompt,
            opponentName: philosopher.name,
            transcript: turns.map((t) => ({
              speaker: t.speaker as "user" | "opponent",
              content: t.content,
            })),
          }),
        },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("[arena/judge] Sonnet error", res.status, errText);
    return NextResponse.json(
      { error: "Judge call failed. Try again." },
      { status: 502 },
    );
  }

  const data = (await res.json()) as {
    content?: { type: string; text?: string }[];
    error?: { message?: string };
  };
  if (data.error) {
    console.error("[arena/judge] Sonnet returned error", data.error);
    return NextResponse.json({ error: "Judge errored." }, { status: 502 });
  }

  const rawText = data.content?.find((c) => c.type === "text")?.text ?? "";
  const parsed = parseJudgeJson(rawText);
  if (!parsed) {
    console.error("[arena/judge] could not parse:", rawText.slice(0, 500));
    return NextResponse.json(
      { error: "Judge returned malformed output. Try again." },
      { status: 502 },
    );
  }

  // Update Elo.
  const { rating, eloDelta, userEloAfter } = await applyElo(
    supabase,
    user.id,
    session,
    parsed,
  );

  // Persist judgment to session.
  await supabase
    .from("arena_sessions")
    .update({
      status: "judged",
      verdict: parsed.verdict,
      judge_json: parsed,
      elo_delta: eloDelta,
      judged_at: new Date().toISOString(),
    })
    .eq("id", sessionId);

  return NextResponse.json({
    verdict: parsed.verdict,
    judge_output: parsed,
    user_score: totalScore(parsed.user_scores),
    opponent_score: totalScore(parsed.opponent_scores),
    user_elo_before: session.user_elo_at_start,
    user_elo_after: userEloAfter,
    elo_delta: eloDelta,
    opponent_elo: session.opponent_elo_at_start,
    opponent_name: philosopher.name,
    debates_count: rating.pve_debates_count + 1,
  });
}

/** Apply the verdict to the user's Elo + increment debate count. */
async function applyElo(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  session: {
    kind: string;
    user_elo_at_start: number;
    opponent_elo_at_start: number;
  },
  judgment: JudgeOutput,
): Promise<{
  rating: { pve_debates_count: number };
  eloDelta: number;
  userEloAfter: number;
}> {
  const { userScore } = judgmentToElo(
    judgment.user_scores,
    judgment.opponent_scores,
  );

  // Load current rating fresh (in case of races).
  const { data: rating } = await supabase
    .from("arena_user_ratings")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (!rating) {
    throw new Error("Rating row missing");
  }

  if (session.kind === "calibration") {
    // For calibration matches, just bump the debate count — the actual
    // Elo gets set after all 3 calibration matches complete (see the
    // calibration finalize endpoint, not implemented in v1 prototype).
    // For now: apply normal Elo update so the user sees movement even
    // during calibration.
    const k = kFactorForGames(rating.pve_debates_count);
    const updated = newElo(
      rating.pve_elo,
      session.opponent_elo_at_start,
      userScore,
      k,
    );
    const delta = updated - rating.pve_elo;
    await supabase
      .from("arena_user_ratings")
      .update({
        pve_elo: updated,
        pve_debates_count: rating.pve_debates_count + 1,
        pve_k_factor: kFactorForGames(rating.pve_debates_count + 1),
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);
    return {
      rating: { pve_debates_count: rating.pve_debates_count + 1 },
      eloDelta: delta,
      userEloAfter: updated,
    };
  }

  // PvE normal flow.
  const k = kFactorForGames(rating.pve_debates_count);
  const updated = newElo(
    rating.pve_elo,
    session.opponent_elo_at_start,
    userScore,
    k,
  );
  const delta = updated - rating.pve_elo;
  await supabase
    .from("arena_user_ratings")
    .update({
      pve_elo: updated,
      pve_debates_count: rating.pve_debates_count + 1,
      pve_k_factor: kFactorForGames(rating.pve_debates_count + 1),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);
  return {
    rating: { pve_debates_count: rating.pve_debates_count + 1 },
    eloDelta: delta,
    userEloAfter: updated,
  };
}
