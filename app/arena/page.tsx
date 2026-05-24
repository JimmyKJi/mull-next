// /arena — landing page for Mull's argument-Elo system.
//
// Three doors: calibrate (placement matches), PvE (debate a
// philosopher), PvP (coming soon stub). User's current Elo + debate
// count surfaced if they're signed in.

import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import { PixelPageHeader } from "@/components/pixel-window";
import { ARENA_PHILOSOPHERS } from "@/lib/arena/data";

export const metadata: Metadata = {
  title: "Arena · Mull",
  description: "Debate philosophers. Be judged on rigor, not stance. Climb the Elo.",
  robots: { index: false, follow: false },
};

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";
const serif = "var(--font-prose)";

export default async function ArenaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let rating: {
    pve_elo: number;
    pvp_elo: number;
    pve_debates_count: number;
    calibration_done_at: string | null;
  } | null = null;
  if (user) {
    const { data } = await supabase
      .from("arena_user_ratings")
      .select("pve_elo, pvp_elo, pve_debates_count, calibration_done_at")
      .eq("user_id", user.id)
      .maybeSingle();
    rating = data;
  }

  const calibrated = !!rating?.calibration_done_at;

  return (
    <main className="mx-auto max-w-[760px] px-6 pb-32 pt-10 sm:px-10">
      <PixelPageHeader
        eyebrow="▶ ARENA"
        title="ARGUE A PHILOSOPHER"
        subtitle={
          <p
            style={{
              fontFamily: serif,
              fontStyle: "italic",
              fontSize: 16,
              color: "#4A4338",
              lineHeight: 1.55,
            }}
          >
            Pick a philosopher. Debate them. An impartial judge scores
            you on logical rigor, philosophical principle, and
            engagement — not on whose side won. Climb the Elo.
          </p>
        }
      />

      {user && rating && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 8,
            marginBottom: 28,
          }}
        >
          <Stat label="PvE Elo" value={String(rating.pve_elo)} />
          <Stat
            label="Debates"
            value={String(rating.pve_debates_count)}
          />
          <Stat
            label="Status"
            value={calibrated ? "Rated" : "Provisional"}
          />
        </div>
      )}

      {/* Three doors */}
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: "0 0 36px",
          display: "grid",
          gap: 14,
        }}
      >
        <DoorCard
          href={user ? "/arena/pve" : "/login?next=/arena"}
          eyebrow={calibrated ? "▶ PVE · OPEN" : "▶ START HERE"}
          title={
            calibrated
              ? "Face a philosopher"
              : "Calibrate — three placement matches"
          }
          body={
            calibrated
              ? "Choose any of five thinkers, pick a topic, and argue. Three exchanges, then the judge calls it."
              : "Three short debates against opponents of rising difficulty. Sets your starter Elo so the first real matches are fair."
          }
        />
        <DoorCard
          href={user ? "/arena/pvp" : "/login?next=/arena/pvp"}
          eyebrow="▶ PVP · NEW"
          title="Debate another human"
          body="Async player-vs-player matches. Post a challenge or accept one. Same judge + rubric. Separate PvP Elo, separate climb."
        />
        <DoorCard
          href="/arena/leaderboard"
          eyebrow="▶ LEADERBOARD"
          title="Who's climbing"
          body="Top PvE debaters this season. Updated after every judged match."
        />
        {user && (
          <DoorCard
            href="/arena/history"
            eyebrow="▶ YOUR HISTORY"
            title="Re-read your matches"
            body="Every judged debate you've played — verdict, scores, kindred philosopher, Elo delta. Click through to re-read any one."
          />
        )}
      </ul>

      {/* Philosopher roster preview */}
      <div
        style={{
          fontFamily: pixel,
          fontSize: 11,
          color: "#221E18",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          marginBottom: 12,
          textShadow: "2px 2px 0 #B8862F",
        }}
      >
        ▸ ROSTER · {ARENA_PHILOSOPHERS.length} OPPONENTS
      </div>
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 8,
        }}
      >
        {ARENA_PHILOSOPHERS.map((p) => (
          <li
            key={p.name}
            style={{
              padding: "12px 14px",
              background: "#FFFCF4",
              border: "2px solid #221E18",
              boxShadow: "3px 3px 0 0 #B8862F",
            }}
          >
            <div
              style={{
                fontFamily: serif,
                fontSize: 16,
                fontWeight: 500,
                color: "#221E18",
                marginBottom: 2,
              }}
            >
              {p.name}
            </div>
            <div
              style={{
                fontFamily: pixel,
                fontSize: 10,
                color: "#8C6520",
                letterSpacing: 0.4,
                textTransform: "uppercase",
              }}
            >
              Elo {p.baseElo}
            </div>
          </li>
        ))}
      </ul>

      <p
        style={{
          marginTop: 26,
          fontFamily: serif,
          fontStyle: "italic",
          fontSize: 14,
          color: "#8C6520",
          lineHeight: 1.5,
        }}
      >
        Three debates per day. Mull pays for the judge out of pocket
        right now; the cap keeps it sustainable while we work on
        funding.
      </p>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: "10px 12px",
        background: "#FFFCF4",
        border: "3px solid #221E18",
        boxShadow: "3px 3px 0 0 #B8862F",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontFamily: pixel,
          fontSize: 9,
          color: "#8C6520",
          letterSpacing: 0.4,
          textTransform: "uppercase",
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: pixel,
          fontSize: 18,
          color: "#221E18",
          letterSpacing: 0.5,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function DoorCard({
  href,
  eyebrow,
  title,
  body,
  disabled,
}: {
  href: string;
  eyebrow: string;
  title: string;
  body: string;
  disabled?: boolean;
}) {
  const inner = (
    <div
      style={{
        padding: "18px 22px",
        background: disabled ? "#F2EFE3" : "#FFFCF4",
        border: "4px solid #221E18",
        boxShadow: disabled ? "none" : "5px 5px 0 0 #B8862F",
        opacity: disabled ? 0.55 : 1,
        transition: "transform 80ms steps(2, end), box-shadow 80ms steps(2, end)",
      }}
    >
      <div
        style={{
          fontFamily: pixel,
          fontSize: 10,
          color: "#8C6520",
          letterSpacing: 0.4,
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        {eyebrow}
      </div>
      <div
        style={{
          fontFamily: serif,
          fontSize: 20,
          fontWeight: 500,
          color: "#221E18",
          marginBottom: 6,
          letterSpacing: "-0.2px",
        }}
      >
        {title}
      </div>
      <p
        style={{
          fontFamily: serif,
          fontSize: 15,
          color: "#4A4338",
          margin: 0,
          lineHeight: 1.55,
        }}
      >
        {body}
      </p>
    </div>
  );
  if (disabled) return <li>{inner}</li>;
  return (
    <li>
      <Link
        href={href}
        className="pixel-press"
        style={{ display: "block", textDecoration: "none", color: "inherit" }}
      >
        {inner}
      </Link>
    </li>
  );
}
