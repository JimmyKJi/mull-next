"use client";

// SaveToAnthology — a small reusable "★ Save" pill that any surface
// can drop next to a quote. Captures the passage to the anthology
// localStorage + fires a capability event.

import { useState } from "react";
import {
  saveAnthologyEntry,
  type AnthologySource,
} from "@/lib/anthology";
import { emitFeatureEvent } from "@/lib/capabilities";

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";

type Props = {
  text: string;
  source: AnthologySource;
  attribution?: string;
  link?: string;
};

export default function SaveToAnthology({
  text,
  source,
  attribution,
  link,
}: Props) {
  const [saved, setSaved] = useState(false);

  function save() {
    if (saved) return;
    saveAnthologyEntry({ text, source, attribution, link });
    emitFeatureEvent("anthology", `Saved to anthology: ${attribution ?? source}`);
    setSaved(true);
  }

  return (
    <button
      type="button"
      onClick={save}
      disabled={saved}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 10px",
        background: saved ? "#2F5D5C" : "#FFFCF4",
        color: saved ? "#F8EDC8" : "#8C6520",
        border: "2px solid #221E18",
        fontFamily: pixel,
        fontSize: 10,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        cursor: saved ? "default" : "pointer",
        boxShadow: saved ? "none" : "2px 2px 0 0 #B8862F",
        transition: "background 120ms",
      }}
    >
      {saved ? "✓ SAVED" : "★ SAVE"}
    </button>
  );
}
