// /arena/pvp/[id] — active or pending PvP match.
//
// Three states:
//   1. status = 'pending_opponent' AND viewer != challenger: show
//      the opening turn + "Accept and respond" CTA
//   2. status = 'pending_opponent' AND viewer = challenger: show
//      the opening turn + "Waiting for opponent" message + cancel
//   3. status = 'active': transcript + composer if it's your turn,
//      otherwise "waiting on opponent" message
//   4. status = 'judged': transcript + verdict panel

import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import { getArenaTopic } from "@/lib/arena/data";
import PvpMatchClient from "./pvp-match-client";

export const metadata: Metadata = {
  title: "Arena · PvP Match · Mull",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";

export default async function PvpMatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/arena/pvp/${id}`);

  const { data: session } = await supabase
    .from("arena_sessions")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!session) notFound();
  if (session.kind !== "pvp") notFound();

  const { data: turns } = await supabase
    .from("arena_turns")
    .select("turn_order, speaker, content")
    .eq("session_id", id)
    .order("turn_order", { ascending: true });

  const topic = getArenaTopic(session.topic_slug);
  if (!topic) notFound();

  // Look up display names for both players.
  const ids = [session.user_id];
  if (session.opponent_user_id) ids.push(session.opponent_user_id);
  const { data: profiles } = await supabase
    .from("public_profiles")
    .select("user_id, handle, display_name")
    .in("user_id", ids);
  const profileByUser = new Map(
    (profiles ?? []).map((p) => [p.user_id, p]),
  );
  const challengerProfile = profileByUser.get(session.user_id);
  const opponentProfile = session.opponent_user_id
    ? profileByUser.get(session.opponent_user_id)
    : null;

  const iAmChallenger = session.user_id === user.id;
  const iAmOpponent = session.opponent_user_id === user.id;
  const canParticipate =
    iAmChallenger ||
    iAmOpponent ||
    session.status === "pending_opponent"; // anyone can view + accept open

  if (!canParticipate) {
    return (
      <main className="mx-auto max-w-[600px] px-6 pt-20 text-center">
        <p style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}>
          That match isn't open and you're not a participant.
        </p>
        <Link href="/arena/pvp">◂ Back to PvP</Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[800px] px-6 pb-32 pt-10 sm:px-10">
      <div className="mb-5">
        <Link
          href="/arena/pvp"
          style={{
            fontFamily: pixel,
            fontSize: 11,
            color: "#4A4338",
            textDecoration: "none",
            letterSpacing: 0.4,
            textTransform: "uppercase",
          }}
        >
          ◂ PVP
        </Link>
      </div>
      <PvpMatchClient
        sessionId={id}
        status={session.status as "pending_opponent" | "active" | "judged" | "abandoned"}
        topicTitle={topic.title}
        topicPrompt={topic.prompt}
        topicPrimer={topic.primer}
        iAmChallenger={iAmChallenger}
        iAmOpponent={iAmOpponent}
        challengerLabel={
          challengerProfile?.display_name ||
          (challengerProfile?.handle ? `@${challengerProfile.handle}` : "Challenger")
        }
        opponentLabel={
          opponentProfile?.display_name ||
          (opponentProfile?.handle ? `@${opponentProfile.handle}` : "Opponent")
        }
        challengerElo={session.user_elo_at_start}
        opponentElo={session.opponent_elo_at_start}
        initialTurns={
          (turns ?? []).map((t) => ({
            turn_order: t.turn_order as number,
            speaker: t.speaker as "user" | "opponent",
            content: t.content as string,
          }))
        }
        initialJudge={session.judge_json}
        initialEloDelta={session.elo_delta}
      />
    </main>
  );
}
