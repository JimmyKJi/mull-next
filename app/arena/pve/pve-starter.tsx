"use client";

// Client component: pick philosopher + topic, hit /api/arena/start,
// redirect to the new session page on success.

import { useState } from "react";
import { useRouter } from "next/navigation";

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";
const serif = "'Cormorant Garamond', Georgia, serif";

type Phil = { name: string; baseElo: number };
type Topic = { slug: string; title: string; primer: string };

export default function PveStarter({
  philosophers,
  topics,
}: {
  philosophers: Phil[];
  topics: Topic[];
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
        setError(json?.error ?? "Could not start. Try again.");
        setStarting(false);
        return;
      }
      router.push(`/arena/pve/${json.session_id}`);
    } catch {
      setError("Network error.");
      setStarting(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 28 }}>
      {/* Step 1: opponent */}
      <section>
        <SectionHead n={1} title="Pick a philosopher" />
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
          {philosophers.map((p) => {
            const picked = opponent === p.name;
            return (
              <li key={p.name}>
                <button
                  type="button"
                  onClick={() => setOpponent(p.name)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    background: picked ? "#F8C75E" : "#FFFCF4",
                    border: "3px solid #221E18",
                    boxShadow: picked
                      ? "4px 4px 0 0 #2F5D5C"
                      : "3px 3px 0 0 #B8862F",
                    cursor: "pointer",
                    textAlign: "left",
                    fontFamily: serif,
                    fontSize: 16,
                    color: "#221E18",
                  }}
                >
                  <div style={{ fontWeight: 500 }}>{p.name}</div>
                  <div
                    style={{
                      fontFamily: pixel,
                      fontSize: 10,
                      color: picked ? "#1A1820" : "#8C6520",
                      letterSpacing: 0.4,
                      textTransform: "uppercase",
                      marginTop: 4,
                    }}
                  >
                    Elo {p.baseElo}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Step 2: topic */}
      <section>
        <SectionHead n={2} title="Pick a topic" />
        <ul
          style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}
        >
          {topics.map((t) => {
            const picked = topicSlug === t.slug;
            return (
              <li key={t.slug}>
                <button
                  type="button"
                  onClick={() => setTopicSlug(t.slug)}
                  style={{
                    display: "block",
                    width: "100%",
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
                    style={{ fontSize: 16, fontWeight: 500, color: "#221E18" }}
                  >
                    {t.title}
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      fontStyle: "italic",
                      color: picked ? "#1A1820" : "#4A4338",
                      marginTop: 4,
                      lineHeight: 1.5,
                    }}
                  >
                    {t.primer}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
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
            ? "▸ STARTING…"
            : opponent && topicSlug
              ? `▶ FACE ${opponent.toUpperCase()}`
              : "PICK A PHILOSOPHER + TOPIC"}
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

function SectionHead({ n, title }: { n: number; title: string }) {
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
      ▸ STEP {n} · {title.toUpperCase()}
    </div>
  );
}
