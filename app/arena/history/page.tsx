// /arena/history — your past judged Arena matches (PvE + PvP).
//
// Shows: date, mode, opponent, topic, verdict, score (you/opponent),
// Elo delta, kindred philosopher. Click through to re-read the full
// transcript + verdict.

import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getArenaTopic, localizeArenaPhilosopherName } from "@/lib/arena/data";
import { localizeArenaTopic } from "@/lib/arena/topics-i18n";
import { totalScore, type JudgeOutput } from "@/lib/arena/judge";
import { getServerLocale } from "@/lib/locale-server";
import { t, type Locale } from "@/lib/translations";

const BCP47: Record<Locale, string> = {
  en: "en-US",
  es: "es-ES",
  fr: "fr-FR",
  pt: "pt-BR",
  ru: "ru-RU",
  zh: "zh-CN",
  ja: "ja-JP",
  ko: "ko-KR",
};

export const metadata: Metadata = {
  title: "Arena · History · Mull",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";
const serif = "var(--font-prose)";

type Session = {
  id: string;
  kind: "calibration" | "pve" | "pvp";
  topic_slug: string;
  opponent: string;
  user_id: string;
  opponent_user_id: string | null;
  user_elo_at_start: number;
  opponent_elo_at_start: number;
  verdict: "user" | "opponent" | "draw";
  judge_json: JudgeOutput;
  elo_delta: number;
  judged_at: string;
};

export default async function ArenaHistoryPage() {
  const locale = await getServerLocale();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/arena/history");

  // Load all judged sessions where the user participated.
  // RLS already scopes via either user_id or opponent_user_id.
  const { data } = await supabase
    .from("arena_sessions")
    .select(
      "id, kind, topic_slug, opponent, user_id, opponent_user_id, user_elo_at_start, opponent_elo_at_start, verdict, judge_json, elo_delta, judged_at",
    )
    .eq("status", "judged")
    .order("judged_at", { ascending: false })
    .limit(100);

  const sessions = (data as Session[] | null) ?? [];

  return (
    <main className="mx-auto max-w-[820px] px-6 pb-32 pt-10 sm:px-10">
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
          {t("arena.back", locale)}
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
          marginBottom: 8,
        }}
      >
        {t("arena.hist_page_title", locale)}
      </h1>
      <p
        style={{
          fontFamily: serif,
          fontStyle: "italic",
          fontSize: 15,
          color: "#4A4338",
          margin: "0 0 28px",
          lineHeight: 1.55,
        }}
      >
        {t("arena.hist_subtitle", locale)}
      </p>

      {sessions.length === 0 ? (
        <div
          style={{
            padding: "24px 22px",
            background: "#FFFCF4",
            border: "3px dashed #8C6520",
            fontFamily: serif,
            fontStyle: "italic",
            fontSize: 15,
            color: "#8C6520",
            textAlign: "center",
          }}
        >
          {t("arena.hist_empty_1", locale)}
          <Link href="/arena/pve" style={{ color: "#221E18" }}>{t("arena.hist_empty_face", locale)}</Link>
          {t("arena.hist_empty_or", locale)}
          <Link href="/arena/pvp" style={{ color: "#221E18" }}>{t("arena.hist_empty_pvp", locale)}</Link>
          {t("arena.hist_empty_2", locale)}
        </div>
      ) : (
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "grid",
            gap: 8,
          }}
        >
          {sessions.map((s) => (
            <HistoryRow key={s.id} session={s} viewerId={user.id} locale={locale} />
          ))}
        </ul>
      )}
    </main>
  );
}

function HistoryRow({
  session,
  viewerId,
  locale,
}: {
  session: Session;
  viewerId: string;
  locale: Locale;
}) {
  const topic = getArenaTopic(session.topic_slug);
  const localizedTopicTitle = topic
    ? localizeArenaTopic(topic, locale).title
    : session.topic_slug;
  const viewerIsChallenger = session.user_id === viewerId;

  // Figure out who the viewer was up against.
  const opponentDisplay =
    session.kind === "pve"
      ? localizeArenaPhilosopherName(session.opponent, locale)
      : viewerIsChallenger
        ? t("arena.opp_generic", locale)
        : t("arena.challenger", locale);

  // Map verdict → "did the viewer win".
  const viewerWon =
    (session.verdict === "user" && viewerIsChallenger) ||
    (session.verdict === "opponent" && !viewerIsChallenger);
  const wasDraw = session.verdict === "draw";

  const verdictLabel = wasDraw
    ? t("arena.result.draw", locale)
    : viewerWon
      ? t("arena.result.win", locale)
      : t("arena.result.loss", locale);
  const verdictColor = wasDraw ? "#8C6520" : viewerWon ? "#2F5D5C" : "#7A2E2E";

  // Score breakdown (mine vs opp).
  const userTotal = totalScore(session.judge_json.user_scores);
  const oppTotal = totalScore(session.judge_json.opponent_scores);
  const myScore = viewerIsChallenger ? userTotal : oppTotal;
  const theirScore = viewerIsChallenger ? oppTotal : userTotal;

  const detailHref =
    session.kind === "pvp"
      ? `/arena/pvp/${session.id}`
      : `/arena/pve/${session.id}`;

  return (
    <li>
      <Link
        href={detailHref}
        style={{
          display: "block",
          padding: "14px 16px",
          background: "#FFFCF4",
          border: "3px solid #221E18",
          boxShadow: `3px 3px 0 0 ${verdictColor}`,
          textDecoration: "none",
          color: "inherit",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 6,
          }}
        >
          <div
            style={{
              fontFamily: pixel,
              fontSize: 10,
              color: verdictColor,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
            }}
          >
            ▸ {t(`arena.kind.${session.kind}`, locale)} · {verdictLabel}
          </div>
          <div
            style={{
              fontFamily: pixel,
              fontSize: 9,
              color: "#8C6520",
              letterSpacing: 0.4,
              textTransform: "uppercase",
            }}
          >
            {new Date(session.judged_at).toLocaleDateString(BCP47[locale], {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        </div>
        <div
          style={{
            fontFamily: serif,
            fontSize: 17,
            fontWeight: 500,
            color: "#221E18",
            marginBottom: 4,
          }}
        >
          {localizedTopicTitle} <span style={{ color: "#8C6520" }}>{t("arena.hist_vs", locale)}</span> {opponentDisplay}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            gap: 8,
            flexWrap: "wrap",
            fontFamily: pixel,
            fontSize: 10,
            color: "#4A4338",
            letterSpacing: 0.4,
            textTransform: "uppercase",
          }}
        >
          <span>
            {t("arena.hist_scoreline", locale, {
              my: myScore,
              opp: opponentDisplay,
              their: theirScore,
            })}
          </span>
          <span
            style={{
              color: session.elo_delta >= 0 ? "#2F5D5C" : "#7A2E2E",
            }}
          >
            ELO {session.elo_delta >= 0 ? "+" : ""}
            {session.elo_delta}
          </span>
        </div>
        {session.judge_json.user_kindred_philosopher && viewerIsChallenger && (
          <div
            style={{
              marginTop: 6,
              fontFamily: serif,
              fontStyle: "italic",
              fontSize: 13,
              color: "#8C6520",
            }}
          >
            {t("arena.argued_like", locale, {
              name: session.judge_json.user_kindred_philosopher,
            })}
          </div>
        )}
      </Link>
    </li>
  );
}
