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

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";

export default function ConsentToggle() {
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
        className="text-[14px] text-[#8C6520]"
        style={{ fontFamily: "var(--font-editorial)" }}
      >
        Loading…
      </p>
    );
  }

  const statusLine =
    current === "yes"
      ? "You're opted IN. Your anonymized data may be used in academic research."
      : current === "no"
        ? "You're opted OUT. Your data is not used for research."
        : "You haven't decided yet. You'll be asked the next time you start the quiz.";

  return (
    <div>
      <p
        className="mb-4 text-[15px] leading-[1.6] text-[#221E18]"
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
            color: current === "yes" ? "#F8EDC8" : "#1A1820",
            border: "3px solid #221E18",
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
          {current === "yes" ? "✓ OPTED IN" : "▶ OPT IN TO RESEARCH"}
        </button>
        <button
          type="button"
          onClick={() => choose("no")}
          disabled={current === "no"}
          style={{
            padding: "12px 14px",
            background: current === "no" ? "#1F1814" : "transparent",
            color: current === "no" ? "#F8EDC8" : "#4A4338",
            border: "3px solid #221E18",
            boxShadow: current === "no" ? "none" : "4px 4px 0 0 #8C6520",
            fontFamily: pixel,
            fontSize: 11,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            cursor: current === "no" ? "default" : "pointer",
            opacity: current === "no" ? 0.85 : 1,
            textAlign: "center",
          }}
        >
          {current === "no" ? "✓ OPTED OUT" : "◂ OPT OUT"}
        </button>
      </div>
      {current !== null && (
        <button
          type="button"
          onClick={clear}
          className="mt-3 text-[12px] text-[#8C6520] underline decoration-[#B8862F]/40 underline-offset-3 hover:decoration-[#8C6520]"
        >
          reset — ask me next time
        </button>
      )}
    </div>
  );
}
