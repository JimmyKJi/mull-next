// SupportMullPrompt — small honest prompt that appears at meaningful
// moments (after an Arena verdict, after finishing The Inheritor).
//
// Honest framing because the audience is the kind that notices: tells
// the user the per-judgment cost out loud, and frames the tip as
// keeping the lights on rather than rewarding the creator. The Ko-fi
// link is a real one — update to your actual Ko-fi when you set up
// the account.

import React from "react";

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
  lead = "If this gave you something, consider keeping it running.",
  detail = "Mull is free to use. Each Arena verdict costs about 15 cents in AI fees; The Inheritor and the daily dilemma have their own small costs. A tip — any size — helps keep them open to everyone.",
  accent = "#B8862F",
}: Props) {
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
        ▸ KEEP MULL OPEN
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
        {lead}
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
        {detail}
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
        ▶ TIP MULL ON KO-FI
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
        no obligation · no signup · close this if you'd rather not
      </p>
    </aside>
  );
}
