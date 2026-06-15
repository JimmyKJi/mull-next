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
import { t, type Locale, isLocale } from "@/lib/translations";
import DemographicsForm from "@/components/demographics-form";

const STORAGE_KEY = "mull.research_consent";
// Remembers that we've shown the one-time optional demographics step after
// opt-in, so we don't re-prompt on every subsequent quiz start.
const DEMO_PROMPTED_KEY = "mull.research_demographics_prompted";

export type ResearchConsent = "yes" | "no";

type Props = {
  children: React.ReactNode;
  /** Whether a Supabase session exists. Only logged-in users see the
   *  optional demographics step (anonymous answers can't be persisted). */
  isLoggedIn?: boolean;
  /** Server-resolved locale, so the gate renders in-language on first
   *  paint. Falls back to the mull_locale cookie, then English. */
  locale?: Locale;
};

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";
const serif = "var(--font-editorial), Georgia, serif";

type Phase = "loading" | "consent" | "demographics" | "done";

export function ResearchConsentGate({
  children,
  isLoggedIn = false,
  locale: localeProp,
}: Props) {
  // Hydration-safe. Start "loading" and render nothing until we've read
  // localStorage in an effect, so there's no flash of the consent overlay
  // on a page the user already decided on.
  const [phase, setPhase] = useState<Phase>("loading");
  const [locale, setLocale] = useState<Locale>(localeProp ?? "en");

  useEffect(() => {
    const m = document.cookie.match(/(?:^|; )mull_locale=([^;]+)/);
    const v = m?.[1];
    if (v && isLocale(v)) setLocale(v);
  }, []);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      setPhase(stored === "yes" || stored === "no" ? "done" : "consent");
    } catch {
      // localStorage blocked (private browsing edge case) — just let the
      // user through without consent capture.
      setPhase("done");
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

    // After a logged-in user opts IN, offer the optional demographics step
    // once. Everyone else (opted out, anonymous, or already prompted) goes
    // straight to the quiz.
    if (choice === "yes" && isLoggedIn && !demographicsPrompted()) {
      setPhase("demographics");
    } else {
      setPhase("done");
    }
  }

  function finishDemographics() {
    try {
      window.localStorage.setItem(DEMO_PROMPTED_KEY, "1");
    } catch {
      // ignore
    }
    setPhase("done");
  }

  if (phase === "loading") return null;
  if (phase === "consent") {
    return <ConsentScreen onDecide={record} locale={locale} />;
  }
  if (phase === "demographics") {
    return <DemographicsStep onDone={finishDemographics} locale={locale} />;
  }
  return <>{children}</>;
}

/** Have we already shown the one-time post-opt-in demographics step? */
function demographicsPrompted(): boolean {
  try {
    return window.localStorage.getItem(DEMO_PROMPTED_KEY) === "1";
  } catch {
    return false;
  }
}

function ConsentScreen({
  onDecide,
  locale,
}: {
  onDecide: (choice: ResearchConsent) => void;
  locale: Locale;
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
            border: "4px solid var(--color-ink)",
            boxShadow: "6px 6px 0 0 var(--color-acc)",
            padding: "32px 30px",
          }}
        >
          <div
            style={{
              fontFamily: pixel,
              fontSize: 10,
              color: "var(--color-acc-deep)",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              marginBottom: 18,
            }}
          >
            {t("consent.gate_eyebrow", locale)}
          </div>
          <h1
            style={{
              fontFamily: pixel,
              fontSize: 18,
              color: "var(--color-ink)",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              lineHeight: 1.2,
              margin: "0 0 16px",
              textShadow: "3px 3px 0 var(--pixel-shadow, var(--color-acc))",
            }}
          >
            {t("consent.title", locale)}
          </h1>

          <div
            style={{
              fontFamily: serif,
              fontSize: 16,
              color: "var(--color-ink)",
              lineHeight: 1.65,
              margin: "0 0 14px",
            }}
          >
            <p style={{ margin: "0 0 12px" }}>
              {emph(t("consent.gate_p1", locale))}
            </p>
            <p style={{ margin: "0 0 12px" }}>
              {emph(t("consent.gate_p2", locale))}
            </p>
            <p style={{ margin: "0 0 4px" }}>
              {emph(t("consent.gate_p3_a", locale))}
              <Link
                href="/consent"
                style={{
                  color: "var(--color-acc-deep)",
                  textDecoration: "underline",
                  textDecorationColor: "var(--color-acc)",
                }}
              >
                /consent
              </Link>
              {t("consent.gate_p3_b", locale)}
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
                border: "3px solid var(--color-ink)",
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
              {t("consent.gate_yes", locale)}
            </button>
            <button
              type="button"
              onClick={() => onDecide("no")}
              style={{
                width: "100%",
                padding: "12px 18px",
                background: "transparent",
                color: "var(--color-ink-soft)",
                border: "2px solid var(--color-acc-deep)",
                fontFamily: pixel,
                fontSize: 11,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              {t("consent.gate_no", locale)}
            </button>
            <Link
              href="/consent"
              style={{
                textAlign: "center",
                padding: "14px 0",
                fontFamily: serif,
                fontSize: 14,
                color: "var(--color-acc-deep)",
                textDecoration: "underline",
                textDecorationColor: "rgba(184, 134, 47, 0.4)",
              }}
            >
              {t("consent.gate_read_full", locale)}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Optional demographics step — shown once, right after a logged-in user
// opts in. Reuses the same dark-overlay + cream-card chrome as the consent
// screen. Never a hard block: "Skip for now" proceeds straight to the quiz.
function DemographicsStep({
  onDone,
  locale,
}: {
  onDone: () => void;
  locale: Locale;
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
            border: "4px solid var(--color-ink)",
            boxShadow: "6px 6px 0 0 var(--color-acc)",
            padding: "32px 30px",
          }}
        >
          <div
            style={{
              fontFamily: pixel,
              fontSize: 10,
              color: "var(--color-acc-deep)",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              marginBottom: 14,
            }}
          >
            {t("demo.win_badge", locale)}
          </div>
          <h1
            style={{
              fontFamily: pixel,
              fontSize: 18,
              color: "var(--color-ink)",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              lineHeight: 1.2,
              margin: "0 0 12px",
              textShadow: "3px 3px 0 var(--pixel-shadow, var(--color-acc))",
            }}
          >
            {t("demo.gate_title", locale)}
          </h1>
          <p
            style={{
              fontFamily: serif,
              fontSize: 15.5,
              color: "var(--color-ink-soft)",
              lineHeight: 1.6,
              margin: "0 0 22px",
            }}
          >
            {t("demo.gate_intro", locale)}
          </p>
          <DemographicsForm locale={locale} variant="gate" onDone={onDone} />
        </div>
      </div>
    </div>
  );
}

// Render **bold** spans inside a translated string, styled to match
// the gate's inline ink color.
function emph(text: string): React.ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((seg, i) =>
    seg.startsWith("**") && seg.endsWith("**") ? (
      <strong key={i} style={{ color: "var(--color-ink)" }}>
        {seg.slice(2, -2)}
      </strong>
    ) : (
      seg
    ),
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
