"use client";

// WanderingClient — renders the week's question + 4 beat panels.
// Each beat captures the user's response. Beats are independent —
// you can do them in any order and revisit any.

import { useEffect, useState } from "react";
import {
  type WanderingQuestion,
  type WanderingResponse,
  WANDERING_KEY,
  WANDERING_BEATS,
} from "@/lib/wandering";
import { emitFeatureEvent } from "@/lib/capabilities";
import { t, type Locale } from "@/lib/translations";

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";
const serif = "var(--font-editorial), Georgia, serif";

type Beat = "Mon" | "Wed" | "Fri" | "Sun";

export default function WanderingClient({
  question,
  locale,
}: {
  question: WanderingQuestion;
  locale: Locale;
}) {
  const [responses, setResponses] = useState<WanderingResponse[] | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(WANDERING_KEY);
      const parsed = raw ? (JSON.parse(raw) as WanderingResponse[]) : [];
      setResponses(parsed);
    } catch {
      setResponses([]);
    }
  }, []);

  function saveResponse(beat: Beat, text: string) {
    if (!responses) return;
    const trimmed = text.trim();
    if (!trimmed) return;
    const next = [
      ...responses.filter((r) => !(r.week === question.week && r.beat === beat)),
      { week: question.week, beat, text: trimmed, ts: Date.now() },
    ];
    setResponses(next);
    try {
      window.localStorage.setItem(WANDERING_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
    const xp = beat === "Sun" ? 2 : 1;
    emitFeatureEvent(
      "wandering",
      `${beat} response on week ${question.week}: ${trimmed.slice(0, 32)}…`,
      xp,
    );
  }

  if (responses === null) {
    return (
      <div className="text-center text-[14px] text-[#8C6520]" style={{ fontFamily: serif }}>
        {t("wndr.loading", locale)}
      </div>
    );
  }

  const week = question.week;
  const responsesByBeat = new Map<Beat, WanderingResponse>();
  for (const r of responses) {
    if (r.week === week) responsesByBeat.set(r.beat, r);
  }
  const beatsDone = responsesByBeat.size;

  return (
    <div className="space-y-5">
      {/* The question card */}
      <div
        className="border-[4px] border-[#221E18] p-6"
        style={{
          background: "#5D5777", // threshold-ish, since wandering is deep
          color: "#F8EDC8",
          boxShadow: "5px 5px 0 0 #221E18",
        }}
      >
        <div
          className="text-[10px] tracking-[0.22em]"
          style={{
            fontFamily: pixel,
            color: "#F8C75E",
            textTransform: "uppercase",
          }}
        >
          ▶ {t("wndr.this_weeks_question", locale)}
        </div>
        <h2
          className="mt-3 text-[26px] leading-tight"
          style={{ fontFamily: serif, color: "#F8EDC8" }}
        >
          {question.prompt}
        </h2>
        <p
          className="mt-3 text-[15px] italic leading-[1.6]"
          style={{ fontFamily: serif, color: "#E5DCC0" }}
        >
          {question.framing}
        </p>
        <div
          className="mt-4 inline-block border-2 border-[#F8C75E] px-2.5 py-1 text-[10px] tracking-[0.18em]"
          style={{
            fontFamily: pixel,
            color: "#F8C75E",
            textTransform: "uppercase",
          }}
        >
          {t("wndr.beats_answered", locale, { done: beatsDone })}
        </div>
      </div>

      {/* The four beats */}
      <ul className="space-y-3">
        {WANDERING_BEATS.map((b) => (
          <li key={b.day}>
            <BeatPanel
              beat={b.day as Beat}
              label={b.label}
              description={b.description}
              existing={responsesByBeat.get(b.day as Beat)}
              onSave={(text) => saveResponse(b.day as Beat, text)}
              locale={locale}
            />
          </li>
        ))}
      </ul>

      <p
        className="text-[13px] italic text-[#8C6520]"
        style={{ fontFamily: serif }}
      >
        {t("wndr.scaffolding_note", locale)}
      </p>
    </div>
  );
}

function BeatPanel({
  beat,
  label,
  description,
  existing,
  onSave,
  locale,
}: {
  beat: Beat;
  label: string;
  description: string;
  existing?: WanderingResponse;
  onSave: (text: string) => void;
  locale: Locale;
}) {
  const [text, setText] = useState(existing?.text ?? "");
  const [open, setOpen] = useState(!existing);

  if (!open && existing) {
    return (
      <div
        className="border-l-[5px] border-[#5D5777] bg-[#FFFCF4] px-4 py-3"
        style={{ boxShadow: "3px 3px 0 0 #8C6520" }}
      >
        <div className="flex items-baseline justify-between gap-2">
          <span
            className="text-[10px] tracking-[0.22em] text-[#5D5777]"
            style={{ fontFamily: pixel, textTransform: "uppercase" }}
          >
            ✓ {beat} · {label}
          </span>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="text-[10px] tracking-[0.18em] text-[#8C6520] hover:text-[#221E18]"
            style={{ fontFamily: pixel, textTransform: "uppercase" }}
          >
            {t("wndr.edit", locale)}
          </button>
        </div>
        <p
          className="mt-2 text-[14.5px] leading-[1.55] text-[#221E18]"
          style={{ fontFamily: serif }}
        >
          {existing.text}
        </p>
      </div>
    );
  }

  return (
    <div
      className="border-l-[5px] border-[#5D5777] bg-[#FFFCF4] p-4"
      style={{ boxShadow: "3px 3px 0 0 #8C6520" }}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span
          className="text-[11px] tracking-[0.22em] text-[#5D5777]"
          style={{ fontFamily: pixel, textTransform: "uppercase" }}
        >
          ▶ {beat} · {label}
        </span>
        {existing && (
          <button
            type="button"
            onClick={() => {
              setText(existing.text);
              setOpen(false);
            }}
            className="text-[10px] tracking-[0.18em] text-[#8C6520]"
            style={{ fontFamily: pixel, textTransform: "uppercase" }}
          >
            {t("wndr.cancel", locale)}
          </button>
        )}
      </div>
      <p
        className="mt-1 text-[13px] italic text-[#5C4528]"
        style={{ fontFamily: serif }}
      >
        {description}
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5}
        placeholder={t("wndr.placeholder", locale)}
        style={{
          marginTop: 10,
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
      <button
        type="button"
        onClick={() => {
          onSave(text);
          setOpen(false);
        }}
        disabled={!text.trim()}
        className="mt-3 border-[3px] border-[#221E18] px-3 py-2 text-[11px] tracking-[0.18em] text-[#1A1820]"
        style={{
          fontFamily: pixel,
          textTransform: "uppercase",
          background: text.trim() ? "#F8C75E" : "#D6CDB6",
          boxShadow: text.trim() ? "3px 3px 0 0 #5D5777" : "none",
          cursor: text.trim() ? "pointer" : "default",
          opacity: text.trim() ? 1 : 0.5,
        }}
      >
        ▶ {t("wndr.save_beat", locale, { beat })}
      </button>
    </div>
  );
}
