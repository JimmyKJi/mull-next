"use client";

// Client: pick philosopher + topic, hit /api/arena/start, redirect.
//
// v2:
//   - Opponents grouped by tier (Friendly / Sharp / Heavy)
//   - Opponents above user's Elo + MAX_ELO_GAP are shown locked with
//     "needs Elo X" — gives users a goal, not a confusing rejection
//   - Topics grouped by category (Philosophical / Everyday)

import { useState } from "react";
import { useRouter } from "next/navigation";
import { t, type Locale } from "@/lib/translations";

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";
const serif = "var(--font-prose)";

type Phil = {
  name: string;
  displayName: string;
  baseElo: number;
  tier: "friendly" | "sharp" | "heavy";
};
type Topic = {
  slug: string;
  title: string;
  category: "philosophical" | "everyday";
  primer: string;
};

const MAX_ELO_GAP = 300;

export default function PveStarter({
  philosophers,
  topics,
  userElo,
  locale,
}: {
  philosophers: Phil[];
  topics: Topic[];
  userElo: number;
  locale: Locale;
}) {
  const router = useRouter();
  const [opponent, setOpponent] = useState<string | null>(null);
  const [topicSlug, setTopicSlug] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    if (!opponent || !topicSlug || starting) return;
    setStarting(true);
    setError(null);
    try {
      const res = await fetch("/api/arena/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "pve",
          opponent,
          topic_slug: topicSlug,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error ?? t("arena.err_start", locale));
        setStarting(false);
        return;
      }
      router.push(`/arena/pve/${json.session_id}`);
    } catch {
      setError(t("arena.err_network", locale));
      setStarting(false);
    }
  }

  const grouped = {
    friendly: philosophers.filter((p) => p.tier === "friendly"),
    sharp: philosophers.filter((p) => p.tier === "sharp"),
    heavy: philosophers.filter((p) => p.tier === "heavy"),
  };
  const topicsGrouped = {
    philosophical: topics.filter((t) => t.category === "philosophical"),
    everyday: topics.filter((t) => t.category === "everyday"),
  };

  return (
    <div style={{ display: "grid", gap: 28 }}>
      {/* Step 1: opponent */}
      <section>
        <SectionHead n={1} title={t("arena.pve_pick_phil", locale)} locale={locale} />
        <p
          style={{
            fontFamily: serif,
            fontStyle: "italic",
            fontSize: 14,
            color: "#8C6520",
            margin: "0 0 14px",
          }}
        >
          {t("arena.pve_elo_note_a", locale)}
          <strong>{userElo}</strong>
          {t("arena.pve_elo_note_b", locale, { gap: MAX_ELO_GAP })}
        </p>

        {(["friendly", "sharp", "heavy"] as const).map((tier) => {
          const list = grouped[tier];
          if (list.length === 0) return null;
          return (
            <div key={tier} style={{ marginBottom: 18 }}>
              <div
                style={{
                  fontFamily: pixel,
                  fontSize: 10,
                  color: "#8C6520",
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  marginBottom: 4,
                }}
              >
                ▸ {t(`spar.tier.${tier}`, locale)}
              </div>
              <p
                style={{
                  fontFamily: serif,
                  fontStyle: "italic",
                  fontSize: 13,
                  color: "#4A4338",
                  margin: "0 0 8px",
                  lineHeight: 1.45,
                }}
              >
                {t(`arena.pve_blurb_${tier}`, locale)}
              </p>
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
                {list.map((p) => {
                  const locked = p.baseElo - userElo > MAX_ELO_GAP;
                  const picked = opponent === p.name;
                  return (
                    <li key={p.name}>
                      <button
                        type="button"
                        onClick={() => !locked && setOpponent(p.name)}
                        disabled={locked}
                        title={locked ? t("arena.pve_locked_title", locale, { elo: p.baseElo - MAX_ELO_GAP }) : ""}
                        style={{
                          width: "100%",
                          padding: "12px 14px",
                          background: locked
                            ? "#E8E2D3"
                            : picked
                              ? "#F8C75E"
                              : "#FFFCF4",
                          border: "3px solid #221E18",
                          boxShadow: locked
                            ? "none"
                            : picked
                              ? "4px 4px 0 0 #2F5D5C"
                              : "3px 3px 0 0 #B8862F",
                          cursor: locked ? "not-allowed" : "pointer",
                          opacity: locked ? 0.55 : 1,
                          textAlign: "left",
                          fontFamily: serif,
                          fontSize: 16,
                          color: "#221E18",
                          transition: "background 120ms ease",
                        }}
                      >
                        <div style={{ fontWeight: 500 }}>{p.displayName}</div>
                        <div
                          style={{
                            fontFamily: pixel,
                            fontSize: 10,
                            color: locked
                              ? "#7A2E2E"
                              : picked
                                ? "#1A1820"
                                : "#8C6520",
                            letterSpacing: 0.4,
                            textTransform: "uppercase",
                            marginTop: 4,
                          }}
                        >
                          {locked
                            ? t("arena.pve_locked_short", locale, { elo: p.baseElo - MAX_ELO_GAP })
                            : t("arena.elo_value", locale, { elo: p.baseElo })}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </section>

      {/* Step 2: topic */}
      <section>
        <SectionHead n={2} title={t("arena.pve_pick_topic", locale)} locale={locale} />
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 14,
          flexWrap: "wrap",
          gap: 10,
        }}>
          <p
            style={{
              fontFamily: serif,
              fontStyle: "italic",
              fontSize: 13,
              color: "#4A4338",
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            {t("arena.pve_topic_count", locale, { n: topics.length })}
          </p>
          <button
            type="button"
            onClick={() => {
              const pick = topics[Math.floor(Math.random() * topics.length)];
              if (pick) {
                setTopicSlug(pick.slug);
                // Smooth-scroll the picked card into view.
                setTimeout(() => {
                  document.getElementById(`topic-${pick.slug}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
                }, 50);
              }
            }}
            style={{
              fontFamily: pixel,
              fontSize: 10,
              padding: "6px 12px",
              background: "#FFFCF4",
              border: "2px solid #221E18",
              boxShadow: "2px 2px 0 0 #B8862F",
              cursor: "pointer",
              color: "#221E18",
              letterSpacing: 0.5,
              textTransform: "uppercase",
            }}
          >
            {t("arena.pve_shuffle", locale)}
          </button>
        </div>
        {(["philosophical", "everyday"] as const).map((cat) => {
          const list = topicsGrouped[cat];
          if (list.length === 0) return null;
          return (
            <div key={cat} style={{ marginBottom: 18 }}>
              <div
                style={{
                  fontFamily: pixel,
                  fontSize: 10,
                  color: "#8C6520",
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                ▸ {t(cat === "philosophical" ? "arena.pve_cat_philosophical" : "arena.pve_cat_everyday", locale)} · {list.length}
              </div>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                  gap: 8,
                }}
              >
                {list.map((t) => {
                  const picked = topicSlug === t.slug;
                  return (
                    <li key={t.slug} id={`topic-${t.slug}`}>
                      <button
                        type="button"
                        onClick={() => setTopicSlug(t.slug)}
                        style={{
                          display: "block",
                          width: "100%",
                          height: "100%",
                          textAlign: "left",
                          padding: "12px 14px",
                          background: picked ? "#F8C75E" : "#FFFCF4",
                          border: "3px solid #221E18",
                          boxShadow: picked
                            ? "4px 4px 0 0 #2F5D5C"
                            : "3px 3px 0 0 #B8862F",
                          cursor: "pointer",
                          fontFamily: serif,
                        }}
                      >
                        <div
                          style={{ fontSize: 15.5, fontWeight: 500, color: "#221E18", lineHeight: 1.25 }}
                        >
                          {t.title}
                        </div>
                        <div
                          style={{
                            fontSize: 13.5,
                            fontStyle: "italic",
                            color: picked ? "#1A1820" : "#4A4338",
                            marginTop: 4,
                            lineHeight: 1.45,
                          }}
                        >
                          {t.primer}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </section>

      {/* Action */}
      <div>
        <button
          type="button"
          onClick={start}
          disabled={!opponent || !topicSlug || starting}
          style={{
            width: "100%",
            padding: "16px 22px",
            background: !opponent || !topicSlug ? "#D6CDB6" : "#F8C75E",
            color: "#1A1820",
            border: "3px solid #221E18",
            boxShadow: "4px 4px 0 0 #2F5D5C",
            cursor: !opponent || !topicSlug ? "not-allowed" : "pointer",
            fontFamily: pixel,
            fontSize: 13,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          {starting
            ? t("arena.pve_starting", locale)
            : opponent && topicSlug
              ? t("arena.pve_face", locale, {
                  name: (
                    philosophers.find((p) => p.name === opponent)?.displayName ??
                    opponent
                  ).toUpperCase(),
                })
              : t("arena.pve_pick_prompt", locale)}
        </button>
        {error && (
          <p
            style={{
              marginTop: 12,
              padding: "10px 14px",
              background: "#F5E0E0",
              border: "2px solid #7A2E2E",
              fontFamily: serif,
              fontSize: 14,
              color: "#4D1818",
            }}
          >
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

function SectionHead({ n, title, locale }: { n: number; title: string; locale: Locale }) {
  return (
    <div
      style={{
        fontFamily: pixel,
        fontSize: 11,
        color: "#221E18",
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        marginBottom: 10,
        textShadow: "2px 2px 0 #B8862F",
      }}
    >
      {t("arena.pve_step", locale, { n, title: title.toUpperCase() })}
    </div>
  );
}
