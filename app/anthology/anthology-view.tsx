"use client";

// AnthologyView — reads localStorage anthology + renders the
// collection grouped by source. Also offers a manual "add a quote"
// form for things the user noticed elsewhere.

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  type AnthologyEntry,
  readAnthology,
  saveAnthologyEntry,
  removeAnthologyEntry,
  sourceBreadth,
} from "@/lib/anthology";
import { t, type Locale } from "@/lib/translations";
import { emitFeatureEvent } from "@/lib/capabilities";

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";
const serif = "var(--font-editorial), Georgia, serif";

// Localized source label, falling back to the raw source key for any
// source without a translation entry.
function sourceLabel(source: string, locale: Locale): string {
  const key = `anthology.source.${source}`;
  const v = t(key, locale);
  return v === key ? source : v;
}

const SOURCE_COLORS: Record<string, string> = {
  spar: "#8C3717",
  arena: "#2F5D5C",
  pilgrimage: "#1E3A5F",
  wandering: "#5D5777",
  philosopher: "#0F2236",
  topic: "#7A8B43",
  dilemma: "#B8862F",
  diary: "#3F2454",
  manual: "#5C4528",
};

export default function AnthologyView({ locale = "en" }: { locale?: Locale }) {
  const [entries, setEntries] = useState<AnthologyEntry[] | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newText, setNewText] = useState("");
  const [newAttr, setNewAttr] = useState("");

  useEffect(() => {
    setEntries(readAnthology());
    const handler = () => setEntries(readAnthology());
    window.addEventListener("mull:anthology-change", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("mull:anthology-change", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  if (entries === null) {
    return (
      <div className="text-center text-[14px] text-[#8C6520]" style={{ fontFamily: serif }}>
        {t("anthology.loading", locale)}
      </div>
    );
  }

  function addManual() {
    if (!newText.trim()) return;
    saveAnthologyEntry({
      source: "manual",
      text: newText.trim(),
      attribution: newAttr.trim() || undefined,
    });
    emitFeatureEvent("anthology", "Added a quote by hand");
    setNewText("");
    setNewAttr("");
    setShowAdd(false);
  }

  const sorted = [...entries].sort((a, b) => b.ts - a.ts);
  const breadth = sourceBreadth(entries);

  return (
    <div className="space-y-5">
      {/* Headline */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label={t("anthology.stat_entries", locale)} value={String(entries.length)} color="#8C6520" />
        <Stat label={t("anthology.stat_sources", locale)} value={String(breadth)} color="#2F5D5C" />
        <Stat
          label={t("anthology.stat_this_month", locale)}
          value={String(
            entries.filter((e) => Date.now() - e.ts < 30 * 86400000).length,
          )}
          color="#8C3717"
        />
      </div>

      {/* Add-by-hand toggle */}
      <div>
        {!showAdd ? (
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="border-2 border-[#221E18] bg-[#F8C75E] px-3 py-1.5 text-[11px] tracking-[0.18em] text-[#1A1820] hover:bg-[#B8862F]"
            style={{
              fontFamily: pixel,
              textTransform: "uppercase",
              boxShadow: "2px 2px 0 0 #2F5D5C",
            }}
          >
            {t("anthology.add_by_hand", locale)}
          </button>
        ) : (
          <div
            className="border-[3px] border-[#221E18] bg-[#FFFCF4] p-4"
            style={{ boxShadow: "3px 3px 0 0 #B8862F" }}
          >
            <label
              className="text-[10px] tracking-[0.22em] text-[#8C6520]"
              style={{ fontFamily: pixel, textTransform: "uppercase" }}
            >
              {t("anthology.the_passage", locale)}
            </label>
            <textarea
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              rows={4}
              placeholder={t("anthology.passage_placeholder", locale)}
              style={{
                marginTop: 6,
                width: "100%",
                padding: "10px 12px",
                background: "#FBF6E8",
                border: "2px solid #221E18",
                fontFamily: serif,
                fontSize: 15,
                color: "#221E18",
                resize: "vertical",
                minHeight: 100,
                borderRadius: 0,
              }}
            />
            <label
              className="mt-3 block text-[10px] tracking-[0.22em] text-[#8C6520]"
              style={{ fontFamily: pixel, textTransform: "uppercase" }}
            >
              {t("anthology.attribution", locale)}
            </label>
            <input
              value={newAttr}
              onChange={(e) => setNewAttr(e.target.value)}
              placeholder={t("anthology.attribution_placeholder", locale)}
              style={{
                marginTop: 6,
                width: "100%",
                padding: "8px 12px",
                background: "#FBF6E8",
                border: "2px solid #221E18",
                fontFamily: serif,
                fontSize: 14,
                color: "#221E18",
                borderRadius: 0,
              }}
            />
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={addManual}
                disabled={!newText.trim()}
                className="border-[3px] border-[#221E18] bg-[#F8C75E] px-3 py-2 text-[11px] tracking-[0.18em] text-[#1A1820]"
                style={{
                  fontFamily: pixel,
                  textTransform: "uppercase",
                  boxShadow: newText.trim() ? "3px 3px 0 0 #2F5D5C" : "none",
                  opacity: newText.trim() ? 1 : 0.5,
                  cursor: newText.trim() ? "pointer" : "default",
                }}
              >
                {t("anthology.add", locale)}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAdd(false);
                  setNewText("");
                  setNewAttr("");
                }}
                className="border-2 border-[#8C6520] px-3 py-2 text-[11px] tracking-[0.18em] text-[#8C6520]"
                style={{
                  fontFamily: pixel,
                  textTransform: "uppercase",
                }}
              >
                {t("anthology.cancel", locale)}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Entries */}
      {sorted.length === 0 ? (
        <div
          className="border-[3px] border-[#221E18] bg-[#FFFCF4] p-6"
          style={{ boxShadow: "4px 4px 0 0 #B8862F" }}
        >
          <p
            className="text-[15px] leading-[1.55] text-[#221E18]"
            style={{ fontFamily: serif }}
          >
            {t("anthology.empty_prefix", locale)}
            <Link
              href="/spar"
              className="text-[#8C6520] underline decoration-[#B8862F]/40 underline-offset-3 hover:decoration-[#8C6520]"
            >
              {t("anthology.empty_spar", locale)}
            </Link>
            {t("anthology.list_sep", locale)}
            <Link
              href="/pilgrimage"
              className="text-[#8C6520] underline decoration-[#B8862F]/40 underline-offset-3 hover:decoration-[#8C6520]"
            >
              {t("anthology.empty_pilgrimage", locale)}
            </Link>
            {t("anthology.list_sep", locale)}
            <Link
              href="/philosopher"
              className="text-[#8C6520] underline decoration-[#B8862F]/40 underline-offset-3 hover:decoration-[#8C6520]"
            >
              {t("anthology.empty_philosopher", locale)}
            </Link>
            {t("anthology.empty_suffix", locale)}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {sorted.map((e) => (
            <li key={e.id}>
              <div
                className="border-l-[5px] border-[#221E18] bg-[#FFFCF4] p-4"
                style={{
                  borderLeftColor: SOURCE_COLORS[e.source] ?? "#221E18",
                  boxShadow: "3px 3px 0 0 #B8862F",
                }}
              >
                <div
                  className="flex items-baseline justify-between gap-2"
                >
                  <span
                    className="text-[10px] tracking-[0.22em]"
                    style={{
                      fontFamily: pixel,
                      color: SOURCE_COLORS[e.source] ?? "#221E18",
                      textTransform: "uppercase",
                    }}
                  >
                    {sourceLabel(e.source, locale)}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeAnthologyEntry(e.id)}
                    className="text-[10px] tracking-[0.18em] text-[#8C6520] hover:text-[#8C3717]"
                    style={{
                      fontFamily: pixel,
                      textTransform: "uppercase",
                    }}
                    aria-label={t("anthology.remove_aria", locale)}
                  >
                    {t("anthology.remove", locale)}
                  </button>
                </div>
                <p
                  className="mt-3 text-[15.5px] leading-[1.6] text-[#221E18]"
                  style={{ fontFamily: serif }}
                >
                  &ldquo;{e.text}&rdquo;
                </p>
                {(e.attribution || e.link) && (
                  <p
                    className="mt-2 text-[13px] text-[#8C6520]"
                    style={{ fontFamily: serif }}
                  >
                    {e.attribution && (
                      <span>
                        — {e.link ? (
                          <Link
                            href={e.link}
                            className="underline decoration-[#B8862F]/40 underline-offset-3 hover:decoration-[#8C6520]"
                          >
                            {e.attribution}
                          </Link>
                        ) : (
                          e.attribution
                        )}
                      </span>
                    )}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div
      className="border-2 border-[#221E18] bg-[#FFFCF4] p-3 text-center"
      style={{ boxShadow: `2px 2px 0 0 ${color}` }}
    >
      <div
        className="text-[24px] leading-none text-[#221E18]"
        style={{ fontFamily: pixel }}
      >
        {value}
      </div>
      <div
        className="mt-1 text-[9px] tracking-[0.22em]"
        style={{
          fontFamily: pixel,
          color,
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
    </div>
  );
}
