// /arena/leaderboard — top PvE Elo rankings.
//
// Reads from the `arena_leaderboard` view (only exposes display_name
// + handle + Elo, not raw user_ids or timestamps).

import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import { PixelPageHeader } from "@/components/pixel-window";

export const metadata: Metadata = {
  title: "Arena · Leaderboard · Mull",
  robots: { index: false, follow: false },
};

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";
const serif = "'Cormorant Garamond', Georgia, serif";

type Row = {
  user_id: string;
  handle: string | null;
  display_name: string | null;
  pve_elo: number;
  pve_debates_count: number;
};

export default async function ArenaLeaderboardPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("arena_leaderboard")
    .select("user_id, handle, display_name, pve_elo, pve_debates_count")
    .order("pve_elo", { ascending: false })
    .limit(50);

  const rows = (data as Row[] | null) ?? [];

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const myRow = user ? rows.find((r) => r.user_id === user.id) : null;
  const myRank = myRow
    ? rows.findIndex((r) => r.user_id === user!.id) + 1
    : null;

  return (
    <main className="mx-auto max-w-[760px] px-6 pb-32 pt-10 sm:px-10">
      <div className="mb-5">
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

      <PixelPageHeader
        eyebrow="▶ LEADERBOARD"
        title="PVE · TOP DEBATERS"
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
            Top 50 by Elo. Updated after every judged debate. Only
            users who&rsquo;ve completed at least one match appear here.
          </p>
        }
      />

      {myRow && myRank && (
        <div
          style={{
            padding: "14px 16px",
            background: "#F8C75E",
            border: "3px solid #221E18",
            boxShadow: "4px 4px 0 0 #2F5D5C",
            marginBottom: 20,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              fontFamily: pixel,
              fontSize: 11,
              color: "#1A1820",
              letterSpacing: 0.4,
              textTransform: "uppercase",
            }}
          >
            ▸ YOU · #{myRank}
          </div>
          <div
            style={{
              fontFamily: pixel,
              fontSize: 14,
              color: "#1A1820",
              letterSpacing: 0.5,
            }}
          >
            ELO {myRow.pve_elo} · {myRow.pve_debates_count} debates
          </div>
        </div>
      )}

      {rows.length === 0 ? (
        <div
          style={{
            padding: "24px 22px",
            background: "#FFFCF4",
            border: "3px dashed #8C6520",
            textAlign: "center",
            fontFamily: serif,
            fontStyle: "italic",
            fontSize: 16,
            color: "#8C6520",
          }}
        >
          No debates judged yet. Be the first to climb.
        </div>
      ) : (
        <ol
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "grid",
            gap: 6,
          }}
        >
          {rows.map((r, i) => (
            <li
              key={r.user_id}
              style={{
                padding: "12px 16px",
                background:
                  user?.id === r.user_id ? "#F8EDC8" : "#FFFCF4",
                border: "2px solid #221E18",
                boxShadow: "3px 3px 0 0 #B8862F",
                display: "grid",
                gridTemplateColumns: "40px 1fr auto",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  fontFamily: pixel,
                  fontSize: 14,
                  color:
                    i === 0
                      ? "#B8862F"
                      : i < 3
                        ? "#8C6520"
                        : "#4A4338",
                  letterSpacing: 0.5,
                  textAlign: "center",
                }}
              >
                #{i + 1}
              </div>
              <div>
                <div
                  style={{
                    fontFamily: serif,
                    fontSize: 16,
                    fontWeight: 500,
                    color: "#221E18",
                  }}
                >
                  {r.display_name || (r.handle ? `@${r.handle}` : "Anonymous")}
                </div>
                <div
                  style={{
                    fontFamily: pixel,
                    fontSize: 10,
                    color: "#8C6520",
                    letterSpacing: 0.4,
                    textTransform: "uppercase",
                    marginTop: 2,
                  }}
                >
                  {r.pve_debates_count} debates
                </div>
              </div>
              <div
                style={{
                  fontFamily: pixel,
                  fontSize: 16,
                  color: "#221E18",
                  letterSpacing: 0.5,
                }}
              >
                {r.pve_elo}
              </div>
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}
