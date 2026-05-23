// /arena/pvp/new — create a new PvP challenge.
//
// Picks topic + writes opening turn. Posts to /api/arena/pvp/create
// and redirects to /arena/pvp/[id] (which will show "waiting for
// opponent" until someone accepts).

import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { ARENA_TOPICS } from "@/lib/arena/data";
import NewChallengeClient from "./new-challenge-client";

export const metadata: Metadata = {
  title: "Arena · New Challenge · Mull",
  robots: { index: false, follow: false },
};

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";

export default async function NewPvpChallengePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/arena/pvp/new");

  return (
    <main className="mx-auto max-w-[760px] px-6 pb-32 pt-10 sm:px-10">
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
      <h1
        style={{
          fontFamily: pixel,
          fontSize: 22,
          color: "#221E18",
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          textShadow: "3px 3px 0 #2F5D5C",
          marginBottom: 18,
        }}
      >
        POST A CHALLENGE
      </h1>
      <NewChallengeClient
        topics={ARENA_TOPICS.map((t) => ({
          slug: t.slug,
          title: t.title,
          category: t.category,
          prompt: t.prompt,
          primer: t.primer,
        }))}
      />
    </main>
  );
}
