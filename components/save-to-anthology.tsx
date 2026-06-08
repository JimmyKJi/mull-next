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
import { t, type Locale } from "@/lib/translations";

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";

type Props = {
  text: string;
  source: AnthologySource;
  attribution?: string;
  link?: string;
  locale?: Locale;
};

export default function SaveToAnthology({
  text,
  source,
  attribution,
  link,
  locale = "en",
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
        color: saved ? "var(--color-acc-soft)" : "var(--color-acc-deep)",
        border: "2px solid var(--color-ink)",
        fontFamily: pixel,
        fontSize: 10,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        cursor: saved ? "default" : "pointer",
        boxShadow: saved ? "none" : "2px 2px 0 0 var(--color-acc)",
        transition: "background 120ms",
      }}
    >
      {saved ? t("anthology.saved_pill", locale) : t("anthology.save_pill", locale)}
    </button>
  );
}
