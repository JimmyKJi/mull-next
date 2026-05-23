// /arena/pve — choose your opponent + topic, then start a session.
//
// Server component lists the 5 PvE philosophers + 5 topics. Client
// kicker handles the actual session creation + redirect to the
// match page.

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { ARENA_PHILOSOPHERS, ARENA_TOPICS } from "@/lib/arena/data";
import PveStarter from "./pve-starter";

export const metadata: Metadata = {
  title: "Arena · PvE · Mull",
  robots: { index: false, follow: false },
};

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";
const serif = "'Cormorant Garamond', Georgia, serif";

export default async function ArenaPvePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/arena/pve");

  return (
    <main className="mx-auto max-w-[760px] px-6 pb-32 pt-10 sm:px-10">
      <div className="mb-6">
        <Link
          href="/arena"
          style={{
            fontFamily: pixel,
            fontSize: 11,
            color: "#4A4338",
            textDecoration: "none",
            letterSpacing: 0.4,
            textTransform: "uppercase",
          }}
        >
          ◂ ARENA
        </Link>
      </div>
      <h1
        style={{
          fontFamily: pixel,
          fontSize: 24,
          color: "#221E18",
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          textShadow: "3px 3px 0 #B8862F",
          marginBottom: 20,
        }}
      >
        CHOOSE YOUR OPPONENT
      </h1>
      <PveStarter
        philosophers={ARENA_PHILOSOPHERS.map((p) => ({
          name: p.name,
          baseElo: p.baseElo,
        }))}
        topics={ARENA_TOPICS.map((t) => ({
          slug: t.slug,
          title: t.title,
          primer: t.primer,
        }))}
      />
    </main>
  );
}
