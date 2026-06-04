// SupportMullPrompt — small honest prompt that appears at meaningful
// moments (after an Arena verdict, after finishing The Inheritor).
//
// Honest framing because the audience is the kind that notices: tells
// the user the per-judgment cost out loud, and frames the tip as
// keeping the lights on rather than rewarding the creator. The Ko-fi
// link is a real one — update to your actual Ko-fi when you set up
// the account.

"use client";

import React, { useEffect, useState } from "react";
import { TIPPING_ENABLED } from "@/lib/feature-flags";
import { t, type Locale, isLocale } from "@/lib/translations";

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";
const serif = "var(--font-prose)";

type Props = {
  /** Optional override for the lead line — defaults to a generic
   *  "If this gave you something" framing. */
  lead?: string;
  /** Optional secondary line — usually a specific cost mention. */
  detail?: string;
  /** Optional accent color override. */
  accent?: string;
};

export function SupportMullPrompt({
  lead,
  detail,
  accent = "#B8862F",
}: Props) {
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    const m = document.cookie.match(/(?:^|; )mull_locale=([^;]+)/);
    const v = m?.[1];
    if (v && isLocale(v)) setLocale(v);
  }, []);

  const leadText = lead ?? t("uic.support_lead_default", locale);
  const detailText = detail ?? t("uic.support_detail_default", locale);
  // Tip jar temporarily hidden pending a legal constraint on accepting
  // tips/donations — see TIPPING_ENABLED in lib/feature-flags.ts. While
  // off, this renders nothing on all three surfaces (quiz-journey reveal
  // + both Arena match screens). Flip the flag to bring it back.
  if (!TIPPING_ENABLED) return null;

  return (
    <aside
      style={{
        marginTop: 24,
        padding: "16px 20px",
        background: "#FFFCF4",
        border: `3px solid ${accent}`,
        boxShadow: `4px 4px 0 0 ${accent}`,
      }}
    >
      <div
        style={{
          fontFamily: pixel,
          fontSize: 10,
          color: accent,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        ▸ {t("uic.support_eyebrow", locale)}
      </div>
      <p
        style={{
          fontFamily: serif,
          fontSize: 15.5,
          color: "#221E18",
          margin: "0 0 6px",
          lineHeight: 1.55,
        }}
      >
        {leadText}
      </p>
      <p
        style={{
          fontFamily: serif,
          fontStyle: "italic",
          fontSize: 13.5,
          color: "#4A4338",
          margin: "0 0 14px",
          lineHeight: 1.55,
        }}
      >
        {detailText}
      </p>
      <a
        href="https://ko-fi.com/mull"
        target="_blank"
        rel="noopener"
        style={{
          display: "inline-block",
          padding: "10px 16px",
          background: "#F8C75E",
          color: "#1A1820",
          border: "2px solid #221E18",
          boxShadow: "3px 3px 0 0 #2F5D5C",
          fontFamily: pixel,
          fontSize: 11,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          textDecoration: "none",
        }}
      >
        ▶ {t("uic.support_tip_cta", locale)}
      </a>
      <p
        style={{
          marginTop: 10,
          fontFamily: pixel,
          fontSize: 9,
          color: "#8C6520",
          letterSpacing: 0.4,
          textTransform: "uppercase",
          margin: "10px 0 0",
        }}
      >
        {t("uic.support_footer", locale)}
      </p>
    </aside>
  );
}
