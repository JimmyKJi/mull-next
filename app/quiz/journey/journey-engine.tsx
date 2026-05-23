"use client";

// JourneyEngine — the narrative quiz UX.
//
// Scene-by-scene Telltale-style player. Each scene is either a frame
// (intro/outro, just prose + advance button) or a memory (prose +
// prompt + 3-5 choice cards + epilogue after picking).
//
// Scoring: identical to the classic /quiz engine. Vector starts at
// zeros, each pick adds its delta. On finish: base64-encode the
// rounded vector and navigate to /result?v=...&m=quick (same
// handoff). The /result page doesn't know or care which UX produced
// the vector.
//
// State: kept in component memory only — no sessionStorage for the
// prototype, since narrative flow benefits from not being resumable
// (the moment of choice is part of the design; saving + resuming
// would dilute that). If we ship to production we'll add a resume
// mechanic + a "are you sure you want to abandon the vigil?" guard.

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { add, zeros } from "@/lib/vectors";
import type { JourneyScene } from "@/lib/quiz-journey";
import { memoryCount } from "@/lib/quiz-journey";

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";
const serif = "'Cormorant Garamond', Georgia, serif";

type Props = {
  scenes: JourneyScene[];
};

export function JourneyEngine({ scenes }: Props) {
  const router = useRouter();
  const [idx, setIdx] = useState(0);
  const [vector, setVector] = useState<number[]>(zeros());
  /** After picking on a memory scene, we show the epilogue + advance
   *  button before progressing. `revealed` flips on after choice and
   *  resets to false on each scene change. */
  const [revealed, setRevealed] = useState(false);
  /** Which choice the user picked on the current memory (so we can
   *  visually mark it after they pick). */
  const [pickedIdx, setPickedIdx] = useState<number | null>(null);

  const totalMemories = useMemo(() => memoryCount(), []);
  const currentMemoryIndex = useMemo(() => {
    let count = 0;
    for (let i = 0; i <= idx; i++) {
      if (scenes[i]?.kind === "memory") count++;
    }
    return count; // 1-indexed; 0 when we're on intro
  }, [idx, scenes]);

  // Reset per-scene state when scene changes.
  useEffect(() => {
    setRevealed(false);
    setPickedIdx(null);
  }, [idx]);

  const scene = scenes[idx];
  if (!scene) return null;

  function advance() {
    if (idx + 1 < scenes.length) {
      setIdx(idx + 1);
      window.scrollTo({ top: 0, behavior: "auto" });
    } else {
      finish();
    }
  }

  function pick(choiceIdx: number) {
    if (scene.kind !== "memory") return;
    const delta = scene.choices[choiceIdx]?.vector;
    if (!delta) return;
    setVector((prev) => add(prev, delta));
    setPickedIdx(choiceIdx);
    setRevealed(true);
    // Scroll to epilogue for emphasis.
    window.setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }, 60);
  }

  function finish() {
    const enc = btoa(JSON.stringify(vector.map((n) => +n.toFixed(3))));
    router.push(`/result?v=${encodeURIComponent(enc)}&m=quick`);
  }

  return (
    <div className="mx-auto max-w-[680px] px-6 py-10 sm:px-8 sm:py-14">
      {/* Header chrome — alpha badge + classic-quiz escape hatch */}
      <header
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 28,
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontFamily: pixel,
              fontSize: 11,
              color: "#221E18",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              background: "#F8EDC8",
              border: "2px solid #221E18",
              padding: "3px 8px",
            }}
          >
            ▸ THE VIGIL · ALPHA
          </span>
          {scene.kind === "memory" && (
            <span
              style={{
                fontFamily: pixel,
                fontSize: 10,
                color: "#8C6520",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
              }}
            >
              Memory {currentMemoryIndex} of {totalMemories}
            </span>
          )}
        </div>
        <Link
          href="/quiz?mode=quick"
          style={{
            fontFamily: pixel,
            fontSize: 10,
            color: "#4A4338",
            letterSpacing: 0.4,
            textTransform: "uppercase",
            textDecoration: "underline",
            textDecorationStyle: "dotted",
            textUnderlineOffset: 3,
          }}
        >
          ◂ Skip to classic quiz
        </Link>
      </header>

      {/* Scene body */}
      {scene.kind === "frame" && (
        <FrameScene scene={scene} onAdvance={advance} />
      )}
      {scene.kind === "memory" && (
        <MemoryScene
          scene={scene}
          revealed={revealed}
          pickedIdx={pickedIdx}
          onPick={pick}
          onAdvance={advance}
          isLast={idx === scenes.length - 2 /* memory before outro */}
        />
      )}
    </div>
  );
}

// ─── Frame scene (intro / outro) ─────────────────────────────────

function FrameScene({
  scene,
  onAdvance,
}: {
  scene: Extract<JourneyScene, { kind: "frame" }>;
  onAdvance: () => void;
}) {
  const paragraphs = scene.body.split(/\n\n+/);
  return (
    <article
      style={{
        padding: "32px 32px",
        background: "#FFFCF4",
        border: "4px solid #221E18",
        boxShadow: "6px 6px 0 0 #B8862F",
        borderRadius: 0,
      }}
    >
      {paragraphs.map((p, i) => (
        <p
          key={i}
          style={{
            fontFamily: serif,
            fontSize: 19,
            color: "#221E18",
            margin: i === paragraphs.length - 1 ? "0 0 28px" : "0 0 18px",
            lineHeight: 1.65,
          }}
        >
          {p}
        </p>
      ))}
      <button
        type="button"
        onClick={onAdvance}
        className="pixel-button pixel-button--amber"
        style={{ width: "100%" }}
      >
        <span>▶ {scene.advance.toUpperCase()}</span>
      </button>
    </article>
  );
}

// ─── Memory scene ────────────────────────────────────────────────

function MemoryScene({
  scene,
  revealed,
  pickedIdx,
  onPick,
  onAdvance,
  isLast,
}: {
  scene: Extract<JourneyScene, { kind: "memory" }>;
  revealed: boolean;
  pickedIdx: number | null;
  onPick: (i: number) => void;
  onAdvance: () => void;
  isLast: boolean;
}) {
  const paragraphs = scene.body.split(/\n\n+/);
  return (
    <article>
      <div
        style={{
          fontFamily: pixel,
          fontSize: 11,
          color: "#8C6520",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          marginBottom: 14,
        }}
      >
        ▸ {scene.era}
      </div>

      <div
        style={{
          padding: "28px 32px",
          background: "#FFFCF4",
          border: "4px solid #221E18",
          boxShadow: "5px 5px 0 0 #B8862F",
          borderRadius: 0,
          marginBottom: 22,
        }}
      >
        {paragraphs.map((p, i) => (
          <p
            key={i}
            style={{
              fontFamily: serif,
              fontSize: 18.5,
              color: "#221E18",
              margin: i === paragraphs.length - 1 ? "0" : "0 0 16px",
              lineHeight: 1.65,
            }}
          >
            {p}
          </p>
        ))}
      </div>

      <div
        style={{
          fontFamily: serif,
          fontStyle: "italic",
          fontSize: 17,
          color: "#4A4338",
          margin: "0 0 16px",
          lineHeight: 1.45,
          textAlign: "center",
        }}
      >
        {scene.prompt}
      </div>

      {/* Choice cards — Telltale-style */}
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: "0 0 24px",
          display: "grid",
          gap: 10,
        }}
      >
        {scene.choices.map((c, i) => {
          const isPicked = pickedIdx === i;
          const isDimmed = revealed && pickedIdx !== i;
          return (
            <li key={i}>
              <button
                type="button"
                onClick={() => !revealed && onPick(i)}
                disabled={revealed}
                className={revealed ? "" : "pixel-press"}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "16px 18px",
                  background: isPicked
                    ? "#F8EDC8"
                    : isDimmed
                      ? "#F2EFE3"
                      : "#FFFCF4",
                  border: `3px solid ${isPicked ? "#221E18" : "#221E18"}`,
                  boxShadow: isPicked
                    ? "4px 4px 0 0 #2F5D5C"
                    : isDimmed
                      ? "none"
                      : "3px 3px 0 0 #B8862F",
                  borderRadius: 0,
                  cursor: revealed ? "default" : "pointer",
                  opacity: isDimmed ? 0.45 : 1,
                  transition:
                    "transform 80ms steps(2, end), box-shadow 80ms steps(2, end), opacity 200ms ease",
                  fontFamily: serif,
                  fontSize: 16.5,
                  color: "#221E18",
                  lineHeight: 1.45,
                }}
              >
                {isPicked && (
                  <span
                    style={{
                      display: "inline-block",
                      marginRight: 8,
                      fontFamily: pixel,
                      fontSize: 11,
                      color: "#2F5D5C",
                      letterSpacing: 0.4,
                    }}
                  >
                    ▸
                  </span>
                )}
                {c.text}
              </button>
            </li>
          );
        })}
      </ul>

      {/* Epilogue + advance */}
      {revealed && (
        <div
          style={{
            padding: "18px 22px",
            background: "#EEEAD9",
            border: "3px solid #4A4338",
            borderRadius: 0,
            marginBottom: 20,
          }}
        >
          <p
            style={{
              fontFamily: serif,
              fontStyle: "italic",
              fontSize: 16.5,
              color: "#221E18",
              margin: 0,
              lineHeight: 1.55,
            }}
          >
            {scene.epilogue}
          </p>
        </div>
      )}

      {revealed && (
        <button
          type="button"
          onClick={onAdvance}
          className="pixel-button pixel-button--amber"
          style={{ width: "100%" }}
        >
          <span>
            ▶ {isLast ? "SEE YOURSELF" : "THE KITCHEN RETURNS"}
          </span>
        </button>
      )}
    </article>
  );
}
