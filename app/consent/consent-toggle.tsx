"use client";

// Live toggle for the research-consent preference. Reads + writes
// localStorage via the shared helpers in ResearchConsentGate. Also
// fires the same /api/consent sync so server-side state stays in
// step (best-effort).

import { useEffect, useState } from "react";
import {
  getStoredConsent,
  setStoredConsent,
  type ResearchConsent,
} from "@/components/research-consent-gate";
import { t, type Locale } from "@/lib/translations";

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";

export default function ConsentToggle({ locale }: { locale: Locale }) {
  const [current, setCurrent] = useState<ResearchConsent | null | "loading">(
    "loading",
  );

  useEffect(() => {
    setCurrent(getStoredConsent());
  }, []);

  function choose(next: ResearchConsent) {
    setStoredConsent(next);
    setCurrent(next);
    void fetch("/api/consent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ research_consent: next }),
    }).catch(() => {});
  }

  function clear() {
    setStoredConsent(null);
    setCurrent(null);
    void fetch("/api/consent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ research_consent: null }),
    }).catch(() => {});
  }

  if (current === "loading") {
    return (
      <p
        className="text-[14px] text-acc-deep"
        style={{ fontFamily: "var(--font-editorial)" }}
      >
        {t("consent.toggle_loading", locale)}
      </p>
    );
  }

  const statusLine =
    current === "yes"
      ? t("consent.toggle_status_yes", locale)
      : current === "no"
        ? t("consent.toggle_status_no", locale)
        : t("consent.toggle_status_undecided", locale);

  return (
    <div>
      <p
        className="mb-4 text-[15px] leading-[1.6] text-ink"
        style={{ fontFamily: "var(--font-editorial)" }}
      >
        {statusLine}
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => choose("yes")}
          disabled={current === "yes"}
          style={{
            padding: "12px 14px",
            background: current === "yes" ? "#2F5D5C" : "#F8C75E",
            color: current === "yes" ? "var(--color-acc-soft)" : "#1A1820",
            border: "3px solid var(--color-ink)",
            boxShadow: current === "yes" ? "none" : "4px 4px 0 0 #2F5D5C",
            fontFamily: pixel,
            fontSize: 11,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            cursor: current === "yes" ? "default" : "pointer",
            opacity: current === "yes" ? 0.85 : 1,
            textAlign: "center",
          }}
        >
          {current === "yes"
            ? t("consent.toggle_opted_in", locale)
            : t("consent.toggle_opt_in", locale)}
        </button>
        <button
          type="button"
          onClick={() => choose("no")}
          disabled={current === "no"}
          style={{
            padding: "12px 14px",
            background: current === "no" ? "#1F1814" : "transparent",
            color: current === "no" ? "var(--color-acc-soft)" : "var(--color-ink-soft)",
            border: "3px solid var(--color-ink)",
            boxShadow: current === "no" ? "none" : "4px 4px 0 0 var(--color-acc-deep)",
            fontFamily: pixel,
            fontSize: 11,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            cursor: current === "no" ? "default" : "pointer",
            opacity: current === "no" ? 0.85 : 1,
            textAlign: "center",
          }}
        >
          {current === "no"
            ? t("consent.toggle_opted_out", locale)
            : t("consent.toggle_opt_out", locale)}
        </button>
      </div>
      {current !== null && (
        <button
          type="button"
          onClick={clear}
          className="mt-3 text-[12px] text-acc-deep underline decoration-acc/40 underline-offset-3 hover:decoration-acc-deep"
        >
          {t("consent.toggle_reset", locale)}
        </button>
      )}
    </div>
  );
}
