"use client";

// PilgrimageDayClient — submission flow for a single pilgrimage day.
//
// Loads state from localStorage. Renders the day's framing + prompt
// (looked up by the user's stored archetype), provides a textarea,
// and on submit:
//   - records the submission to localStorage (for now — see note below)
//   - marks the day complete; advances state.currentDay if relevant
//   - shows a brief "next day available tomorrow" confirmation
//
// Future server-side hook: submissions could fire the existing diary
// pipeline (POST /api/diary/save) so the vector drifts. For v1 the
// submission is local — the value is the reflection itself, not the
// drift. Adding the diary hook is a 10-line follow-up.

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  PILGRIMAGE_KEY,
  getPilgrimageArc,
  type PilgrimageState,
} from "@/lib/pilgrimage";
import { ARCHETYPE_COLORS } from "@/lib/archetype-colors";

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";
const serif = "var(--font-editorial), Georgia, serif";

const RESPONSE_KEY_PREFIX = "mull.pilgrimage.response.";

type Props = {
  day: number;
};

export default function PilgrimageDayClient({ day }: Props) {
  const [state, setState] = useState<PilgrimageState | null | "loading">("loading");
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(PILGRIMAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PilgrimageState;
        setState(parsed);
        // Pre-fill if user already submitted today.
        try {
          const prior = window.localStorage.getItem(RESPONSE_KEY_PREFIX + day);
          if (prior) {
            setText(prior);
            setSubmitted(true);
          }
        } catch {
          // ignore
        }
      } else {
        setState(null);
      }
    } catch {
      setState(null);
    }
  }, [day]);

  const arc = useMemo(
    () => (state && state !== "loading" ? getPilgrimageArc(state.archetype) : null),
    [state],
  );
  const dayData = arc?.days[day - 1];
  const color = state && state !== "loading"
    ? ARCHETYPE_COLORS[state.archetype] ?? ARCHETYPE_COLORS.cartographer
    : ARCHETYPE_COLORS.cartographer;

  if (state === "loading") {
    return (
      <div className="text-center text-[14px] text-[#8C6520]" style={{ fontFamily: serif }}>
        Loading…
      </div>
    );
  }

  if (state === null) {
    return (
      <div
        className="border-[3px] border-[#221E18] bg-[#FFFCF4] p-6"
        style={{ boxShadow: "4px 4px 0 0 #B8862F" }}
      >
        <div
          className="text-[10px] tracking-[0.22em] text-[#8C6520]"
          style={{ fontFamily: pixel }}
        >
          ▶ NOT ENROLLED YET
        </div>
        <p
          className="mt-3 text-[15px] leading-[1.6] text-[#221E18]"
          style={{ fontFamily: serif }}
        >
          You haven&rsquo;t started a pilgrimage yet. Begin on the
          landing page — it&rsquo;ll match the arc to your archetype.
        </p>
        <Link
          href="/pilgrimage"
          className="mt-4 inline-block border-[3px] border-[#221E18] bg-[#F8C75E] px-4 py-2 text-[11px] tracking-[0.18em] text-[#1A1820] hover:bg-[#B8862F]"
          style={{
            fontFamily: pixel,
            textTransform: "uppercase",
            boxShadow: "3px 3px 0 0 #2F5D5C",
          }}
        >
          ▶ TO THE LANDING
        </Link>
      </div>
    );
  }

  if (!arc || !dayData) {
    return (
      <div className="text-[14px] text-[#8C6520]" style={{ fontFamily: serif }}>
        Day not found.
      </div>
    );
  }

  function submit() {
    if (!text.trim() || state === "loading" || state === null) return;
    try {
      window.localStorage.setItem(RESPONSE_KEY_PREFIX + day, text.trim());
    } catch {
      // ignore
    }
    // Mark day complete; advance currentDay if this is the current day.
    const next: PilgrimageState = {
      ...state,
      completedDays: Array.from(new Set([...state.completedDays, day])).sort(
        (a, b) => a - b,
      ),
      currentDay:
        day === state.currentDay && state.currentDay < 30
          ? state.currentDay + 1
          : state.currentDay,
    };
    try {
      window.localStorage.setItem(PILGRIMAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
    setState(next);
    setSubmitted(true);
  }

  const done = state.completedDays.includes(day);

  return (
    <div className="space-y-5">
      {/* Day card */}
      <article
        className="border-[4px] bg-[#FFFCF4] p-6"
        style={{
          borderColor: "#221E18",
          boxShadow: `5px 5px 0 0 ${color.deep}`,
        }}
      >
        <div
          className="text-[10px] tracking-[0.22em]"
          style={{
            fontFamily: pixel,
            color: color.deep,
            textTransform: "uppercase",
          }}
        >
          ▶ THE {state.archetype.toUpperCase()} ARC
        </div>
        <h2
          className="mt-2 text-[28px] leading-tight text-[#221E18]"
          style={{ fontFamily: serif }}
        >
          {dayData.title}
        </h2>
        <p
          className="mt-4 text-[16px] leading-[1.65] text-[#221E18]"
          style={{ fontFamily: serif }}
        >
          {dayData.framing}
        </p>
        <p
          className="mt-5 border-l-4 px-4 py-3 text-[18px] leading-[1.55] text-[#221E18]"
          style={{
            fontFamily: serif,
            fontWeight: 500,
            borderColor: color.primary,
            background: color.soft,
          }}
        >
          {dayData.prompt}
        </p>
        <p
          className="mt-3 text-[13.5px] italic leading-[1.55] text-[#8C6520]"
          style={{ fontFamily: serif }}
        >
          {dayData.expect}
        </p>
      </article>

      {/* Submission */}
      {!submitted ? (
        <div
          className="border-[3px] border-[#221E18] bg-[#FFFCF4] p-5"
          style={{ boxShadow: "3px 3px 0 0 #B8862F" }}
        >
          <label
            htmlFor="pilgrim-response"
            className="text-[10px] tracking-[0.22em] text-[#8C6520]"
            style={{ fontFamily: pixel, textTransform: "uppercase" }}
          >
            ▶ YOUR RESPONSE
          </label>
          <textarea
            id="pilgrim-response"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={9}
            placeholder="Write as much or as little as serves. There is no length expected."
            style={{
              marginTop: 8,
              width: "100%",
              padding: "12px 14px",
              background: "#FBF6E8",
              border: "2px solid #221E18",
              fontFamily: serif,
              fontSize: 15.5,
              lineHeight: 1.6,
              color: "#221E18",
              resize: "vertical",
              minHeight: 180,
              borderRadius: 0,
            }}
          />
          <button
            type="button"
            onClick={submit}
            disabled={!text.trim()}
            className="mt-4 w-full border-[3px] border-[#221E18] px-4 py-3 text-[12px] tracking-[0.18em] text-[#1A1820] hover:opacity-90"
            style={{
              fontFamily: pixel,
              textTransform: "uppercase",
              background: text.trim() ? "#F8C75E" : "#D6CDB6",
              boxShadow: text.trim() ? "4px 4px 0 0 #2F5D5C" : "none",
              cursor: text.trim() ? "pointer" : "default",
            }}
          >
            ▶ MARK DAY {day} COMPLETE
          </button>
        </div>
      ) : (
        <div
          className="border-[3px] p-5"
          style={{
            background: color.soft,
            borderColor: color.deep,
            boxShadow: `3px 3px 0 0 ${color.deep}`,
          }}
        >
          <div
            className="text-[10px] tracking-[0.22em]"
            style={{
              fontFamily: pixel,
              color: color.deep,
              textTransform: "uppercase",
            }}
          >
            ✓ DAY {day} COMPLETE
          </div>
          <p
            className="mt-3 text-[15px] leading-[1.6] text-[#221E18]"
            style={{ fontFamily: serif }}
          >
            Saved to your device. Come back tomorrow for Day{" "}
            {Math.min(30, day + 1)} — or read your response here any
            time.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {day < 30 && (
              <Link
                href={`/pilgrimage/day/${day + 1}`}
                className="border-[3px] border-[#221E18] bg-[#F8C75E] px-4 py-2 text-[11px] tracking-[0.18em] text-[#1A1820] hover:bg-[#B8862F]"
                style={{
                  fontFamily: pixel,
                  textTransform: "uppercase",
                  boxShadow: "3px 3px 0 0 #2F5D5C",
                }}
              >
                ▶ DAY {day + 1} →
              </Link>
            )}
            <Link
              href="/pilgrimage"
              className="border-[3px] border-[#221E18] bg-[#FFFCF4] px-4 py-2 text-[11px] tracking-[0.18em] text-[#221E18] hover:bg-[#F8EDC8]"
              style={{ fontFamily: pixel, textTransform: "uppercase" }}
            >
              ◂ BACK TO PROGRESS
            </Link>
          </div>
          {done && (
            <p
              className="mt-4 text-[13px] italic text-[#8C6520]"
              style={{ fontFamily: serif }}
            >
              You can edit and resubmit by changing the text above and
              clicking again. Your response stays on this device until
              you sign in and we add server-side sync.
            </p>
          )}
        </div>
      )}

      {/* Nav row */}
      <div className="flex justify-between text-[11px] tracking-[0.18em]" style={{ fontFamily: pixel }}>
        {day > 1 ? (
          <Link
            href={`/pilgrimage/day/${day - 1}`}
            className="text-[#8C6520] hover:text-[#221E18]"
            style={{ textTransform: "uppercase" }}
          >
            ◂ DAY {day - 1}
          </Link>
        ) : (
          <span />
        )}
        {day < 30 ? (
          <Link
            href={`/pilgrimage/day/${day + 1}`}
            className="text-[#8C6520] hover:text-[#221E18]"
            style={{ textTransform: "uppercase" }}
          >
            DAY {day + 1} ▸
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
