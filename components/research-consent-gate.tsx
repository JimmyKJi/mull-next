"use client";

// ResearchConsentGate — one-time consent screen shown before a user
// first takes the quiz. Offers two choices:
//
//   "YES — include my data in research"  (recommended; opt-in)
//   "NO — just let me take the quiz"     (opt-out; still works fully)
//
// Either choice unblocks the quiz immediately; the gate is never a
// hard block. The decision is persisted to localStorage and (when
// signed in) also synced server-side via /api/consent so the user
// doesn't see the gate twice across devices.
//
// Why this exists: Mull's quiz answers can usefully inform academic
// research on how people philosophically situate themselves. Asking
// up-front and storing the answer is the honest version. Defaults to
// opt-out (no implicit consent).
//
// Design: wraps its children. Renders the consent UI in place of
// children when no decision has been made; renders children directly
// once a decision exists. Pure client component — Next.js renders
// children server-side first, then this component hydrates and may
// briefly intercept them with the consent UI on first render.

import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "mull.research_consent";

export type ResearchConsent = "yes" | "no";

type Props = {
  children: React.ReactNode;
};

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";
const serif = "var(--font-editorial), Georgia, serif";

export function ResearchConsentGate({ children }: Props) {
  // Hydration-safe state. Start as "decided" so the SSR'd children
  // render briefly before we check localStorage and possibly show
  // the consent overlay. Avoids a layout-shift flash on every page
  // load by checking and hiding in a single effect tick.
  const [decision, setDecision] = useState<ResearchConsent | "loading" | "needed">("loading");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "yes" || stored === "no") {
        setDecision(stored);
      } else {
        setDecision("needed");
      }
    } catch {
      // localStorage blocked (private browsing edge case) — just let
      // the user through without consent capture.
      setDecision("needed");
    }
  }, []);

  function record(choice: ResearchConsent) {
    try {
      window.localStorage.setItem(STORAGE_KEY, choice);
    } catch {
      // ignore
    }
    // Fire-and-forget server-side sync. We don't await — even if it
    // fails, the client-side choice is honored.
    void fetch("/api/consent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ research_consent: choice }),
    }).catch(() => {});
    setDecision(choice);
  }

  if (decision === "loading") {
    // Render nothing during the brief hydration window. Prevents a
    // flash of the underlying gate before we know whether to show
    // the consent screen.
    return null;
  }

  if (decision === "needed") {
    return <ConsentScreen onDecide={record} />;
  }

  return <>{children}</>;
}

function ConsentScreen({
  onDecide,
}: {
  onDecide: (choice: ResearchConsent) => void;
}) {
  return (
    <div
      style={{
        background: "#26201A",
        minHeight: "100svh",
        padding: "60px 18px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ maxWidth: 580, width: "100%" }}>
        <div
          style={{
            background: "#FFFCF4",
            border: "4px solid #221E18",
            boxShadow: "6px 6px 0 0 #B8862F",
            padding: "32px 30px",
          }}
        >
          <div
            style={{
              fontFamily: pixel,
              fontSize: 10,
              color: "#8C6520",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              marginBottom: 18,
            }}
          >
            ▸ RESEARCH CONSENT · 30 SECONDS
          </div>
          <h1
            style={{
              fontFamily: pixel,
              fontSize: 18,
              color: "#221E18",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              lineHeight: 1.2,
              margin: "0 0 16px",
              textShadow: "3px 3px 0 #B8862F",
            }}
          >
            ABOUT YOUR DATA
          </h1>

          <div
            style={{
              fontFamily: serif,
              fontSize: 16,
              color: "#221E18",
              lineHeight: 1.65,
              margin: "0 0 14px",
            }}
          >
            <p style={{ margin: "0 0 12px" }}>
              Mull is built by{" "}
              <strong style={{ color: "#221E18" }}>Jimmy Ji</strong>, a
              philosophy student at King&rsquo;s College London. Your
              quiz answers — anonymized and aggregated — may be useful
              for academic research on how people philosophically
              situate themselves.
            </p>
            <p style={{ margin: "0 0 12px" }}>
              <strong style={{ color: "#221E18" }}>What this means:</strong>{" "}
              your answers — including which option you choose for each
              question — might appear in academic papers, in model
              refinements, or in aggregate plots. Never tied to your
              email, never sold to third parties, never used for
              advertising. Academic research only.
            </p>
            <p style={{ margin: "0 0 4px" }}>
              <strong style={{ color: "#221E18" }}>This choice doesn&rsquo;t gate anything.</strong>{" "}
              You can take the quiz, debate philosophers, save your
              map — all of it — either way. You can change your mind
              any time at{" "}
              <Link
                href="/consent"
                style={{
                  color: "#8C6520",
                  textDecoration: "underline",
                  textDecorationColor: "#B8862F",
                }}
              >
                /consent
              </Link>
              .
            </p>
          </div>

          <div
            style={{
              marginTop: 24,
              display: "grid",
              gap: 10,
            }}
          >
            <button
              type="button"
              onClick={() => onDecide("yes")}
              style={{
                width: "100%",
                padding: "14px 18px",
                background: "#F8C75E",
                color: "#1A1820",
                border: "3px solid #221E18",
                boxShadow: "4px 4px 0 0 #2F5D5C",
                fontFamily: pixel,
                fontSize: 12,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                cursor: "pointer",
                transition:
                  "transform 80ms steps(2, end), box-shadow 80ms steps(2, end)",
              }}
            >
              ▶ YES — INCLUDE MY DATA IN RESEARCH
            </button>
            <button
              type="button"
              onClick={() => onDecide("no")}
              style={{
                width: "100%",
                padding: "12px 18px",
                background: "transparent",
                color: "#4A4338",
                border: "2px solid #8C6520",
                fontFamily: pixel,
                fontSize: 11,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              ◂ NO — JUST LET ME TAKE THE QUIZ
            </button>
            <Link
              href="/consent"
              style={{
                textAlign: "center",
                paddingTop: 6,
                fontFamily: serif,
                fontSize: 14,
                color: "#8C6520",
                textDecoration: "underline",
                textDecorationColor: "rgba(184, 134, 47, 0.4)",
              }}
            >
              Read the full notice first →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Read the current consent value from localStorage. Safe to call
 *  in browser only — returns null on the server. */
export function getStoredConsent(): ResearchConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v === "yes" || v === "no" ? v : null;
  } catch {
    return null;
  }
}

/** Write the consent value to localStorage. Safe to call in browser
 *  only. Triggers a `storage` event other listeners can observe. */
export function setStoredConsent(choice: ResearchConsent | null): void {
  if (typeof window === "undefined") return;
  try {
    if (choice === null) {
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      window.localStorage.setItem(STORAGE_KEY, choice);
    }
  } catch {
    // ignore
  }
}
