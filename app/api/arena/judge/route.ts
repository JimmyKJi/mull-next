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
import { notifyVerdict } from "@/lib/arena/notifications";

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

  const topic = getArenaTopic(session.topic_slug);
  if (!topic) {
    return NextResponse.json({ error: "Session topic invalid." }, { status: 500 });
  }
  // PvE has a philosopher; PvP has a human opponent.
  const philosopher =
    session.kind === "pve" ? getArenaPhilosopher(session.opponent) : null;
  if (session.kind === "pve" && !philosopher) {
    return NextResponse.json(
      { error: "Session philosopher invalid." },
      { status: 500 },
    );
  }
  const opponentLabel =
    session.kind === "pvp" ? "Opponent" : philosopher!.name;

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
            opponentName: opponentLabel,
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

  // PvP: fire-and-forget notify the OTHER player that the verdict
  // is in. (The caller already sees it inline.)
  const callerIsChallenger = user.id === session.user_id;
  if (session.kind === "pvp" && session.opponent_user_id) {
    const otherUserId = callerIsChallenger
      ? session.opponent_user_id
      : session.user_id;
    const { data: callerProfile } = await supabase
      .from("public_profiles")
      .select("display_name, handle")
      .eq("user_id", user.id)
      .maybeSingle();
    const callerLabel =
      callerProfile?.display_name ||
      (callerProfile?.handle ? `@${callerProfile.handle}` : "Your opponent");
    // Verdict from the OTHER user's perspective. We know our score
    // and our verdict; flip for them.
    const userTotal = totalScore(parsed.user_scores);
    const oppTotal = totalScore(parsed.opponent_scores);
    // For the OTHER user (the recipient):
    //   - if they're the opponent (caller is challenger), their score = oppTotal
    //   - if they're the challenger (caller is opponent), their score = userTotal
    const otherIsChallenger = !callerIsChallenger;
    const recipientScore = otherIsChallenger ? userTotal : oppTotal;
    const senderScore = otherIsChallenger ? oppTotal : userTotal;
    const recipientWon =
      (parsed.verdict === "user" && otherIsChallenger) ||
      (parsed.verdict === "opponent" && !otherIsChallenger);
    const isDraw = parsed.verdict === "draw";
    const verdictLine = isDraw
      ? `Draw — you ${recipientScore}, ${callerLabel} ${senderScore}`
      : recipientWon
        ? `You won — ${recipientScore}, ${callerLabel} ${senderScore}`
        : `You lost — ${recipientScore}, ${callerLabel} ${senderScore}`;
    notifyVerdict({
      recipientUserId: otherUserId,
      opponentLabel: callerLabel,
      topicTitle: topic.title,
      sessionId,
      verdictLine,
    }).catch((e) => console.error("[arena/judge] notify failed:", e));
  }

  // For PvE: user_elo_before is always session.user_elo_at_start.
  // For PvP: depends on who called — challenger or opponent.
  // (callerIsChallenger declared above for the verdict notification.)
  const callerEloBefore =
    session.kind === "pvp"
      ? callerIsChallenger
        ? session.user_elo_at_start
        : session.opponent_elo_at_start
      : session.user_elo_at_start;
  const otherEloBefore =
    session.kind === "pvp"
      ? callerIsChallenger
        ? session.opponent_elo_at_start
        : session.user_elo_at_start
      : session.opponent_elo_at_start;

  return NextResponse.json({
    verdict: parsed.verdict,
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

/** Apply the verdict to player Elo(s).
 *
 *  - PvE / calibration: updates the calling user's pve_elo only.
 *  - PvP: updates BOTH players' pvp_elo symmetrically (the
 *    challenger and the opponent_user_id). The judge's `verdict`
 *    means "user wins" / "opponent wins" from the challenger's
 *    perspective regardless of who called the verdict.
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
  const { userScore } = judgmentToElo(
    judgment.user_scores,
    judgment.opponent_scores,
  );

  if (session.kind === "pvp" && session.opponent_user_id) {
    return applyPvpElo(supabase, callerId, session, userScore);
  }

  // PvE / calibration — single player update.
  return applyPveElo(supabase, callerId, session, userScore);
}

/** PvE Elo update — single user's pve_elo bumped. */
async function applyPveElo(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  session: {
    user_elo_at_start: number;
    opponent_elo_at_start: number;
  },
  userScore: number,
) {
  const { data: rating } = await supabase
    .from("arena_user_ratings")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (!rating) throw new Error("Rating row missing");
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

/** PvP Elo update — both players' pvp_elo bumped symmetrically.
 *  Returns the delta + after-Elo for the CALLING user. */
async function applyPvpElo(
  supabase: Awaited<ReturnType<typeof createClient>>,
  callerId: string,
  session: {
    user_id: string;
    opponent_user_id: string | null;
    user_elo_at_start: number;
    opponent_elo_at_start: number;
  },
  userScoreFromChallengerPerspective: number,
) {
  if (!session.opponent_user_id) throw new Error("PvP session missing opponent");

  const { data: challengerRating } = await supabase
    .from("arena_user_ratings")
    .select("*")
    .eq("user_id", session.user_id)
    .single();
  const { data: opponentRating } = await supabase
    .from("arena_user_ratings")
    .select("*")
    .eq("user_id", session.opponent_user_id)
    .single();
  if (!challengerRating || !opponentRating) throw new Error("Rating row missing");

  const challengerK = kFactorForGames(challengerRating.pvp_debates_count);
  const opponentK = kFactorForGames(opponentRating.pvp_debates_count);

  const challengerUpdated = newElo(
    challengerRating.pvp_elo,
    opponentRating.pvp_elo,
    userScoreFromChallengerPerspective,
    challengerK,
  );
  const opponentUpdated = newElo(
    opponentRating.pvp_elo,
    challengerRating.pvp_elo,
    1 - userScoreFromChallengerPerspective,
    opponentK,
  );

  await supabase
    .from("arena_user_ratings")
    .update({
      pvp_elo: challengerUpdated,
      pvp_debates_count: challengerRating.pvp_debates_count + 1,
      pvp_k_factor: kFactorForGames(challengerRating.pvp_debates_count + 1),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", session.user_id);
  await supabase
    .from("arena_user_ratings")
    .update({
      pvp_elo: opponentUpdated,
      pvp_debates_count: opponentRating.pvp_debates_count + 1,
      pvp_k_factor: kFactorForGames(opponentRating.pvp_debates_count + 1),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", session.opponent_user_id);

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
