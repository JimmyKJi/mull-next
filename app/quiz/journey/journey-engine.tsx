"use client";

// JourneyEngine — the narrative quiz UX, "The Inheritor" frame.
//
// Scene-by-scene Telltale-style player. Each scene is either a frame
// (intro/reveal — just prose + advance button) or a chamber (prose
// + prompt + choice cards + epilogue + optional twist clue).
//
// Typography decisions:
//   - Body prose: Lora (substantial serif, designed for body reads —
//     replaces Cormorant Garamond which felt too thin)
//   - Tiny labels only: pixel display font (eyebrow, scene counter,
//     KEEP SILENT link). Never on the same line as serif.
//   - Italic for atmospheric epilogues + the prompt; roman for body.
//
// Visual decisions:
//   - Top of each scene: hand-coded SVG pixel-art scene illustration
//     (estate, photograph, mirrors, etc.). All scenes share a palette
//     so they read as shots from the same film.
//   - Background: nearly-black at the page level to create theatre
//     immersion. The scene "card" sits on cream with chunky ink border.
//
// Scoring: same as classic quiz — vector starts at zeros, picks add
// deltas, finish → /result?v=...&m=quick.
//
// "KEEP SILENT" is the diegetic bail-out: refuse the inheritance,
// leave the estate. Routes back to /quiz?mode=quick (classic) so
// users who prefer the survey format are never stranded.

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { add, zeros } from "@/lib/vectors";
import type { JourneyScene } from "@/lib/quiz-journey";
import { chamberCount } from "@/lib/quiz-journey";
import { SceneIllustration } from "@/components/scene-illustration";

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";
const serif = "var(--font-lora, 'Lora', Georgia, serif)";

type Props = {
  scenes: JourneyScene[];
};

export function JourneyEngine({ scenes }: Props) {
  const router = useRouter();
  const [idx, setIdx] = useState(0);
  const [vector, setVector] = useState<number[]>(zeros());
  const [revealed, setRevealed] = useState(false);
  const [pickedIdx, setPickedIdx] = useState<number | null>(null);

  const totalChambers = useMemo(() => chamberCount(), []);
  const currentChamberNumber = useMemo(() => {
    let count = 0;
    for (let i = 0; i <= idx; i++) {
      if (scenes[i]?.kind === "chamber") count++;
    }
    return count;
  }, [idx, scenes]);

  useEffect(() => {
    setRevealed(false);
    setPickedIdx(null);
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [idx]);

  const scene = scenes[idx];
  if (!scene) return null;

  function advance() {
    if (idx + 1 < scenes.length) {
      setIdx(idx + 1);
    } else {
      finish();
    }
  }

  function pick(choiceIdx: number) {
    if (scene.kind !== "chamber") return;
    const delta = scene.choices[choiceIdx]?.vector;
    if (!delta) return;
    setVector((prev) => add(prev, delta));
    setPickedIdx(choiceIdx);
    setRevealed(true);
    window.setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }, 80);
  }

  function finish() {
    const enc = btoa(JSON.stringify(vector.map((n) => +n.toFixed(3))));
    router.push(`/result?v=${encodeURIComponent(enc)}&m=quick`);
  }

  return (
    <div
      style={{
        background: "#0D0C12",
        minHeight: "100svh",
        padding: "28px 16px 48px",
      }}
    >
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        {/* Header chrome */}
        <header
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 24,
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
                fontSize: 10,
                color: "#1A1820",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                background: "#F8C75E",
                border: "2px solid #221E18",
                padding: "3px 8px",
              }}
            >
              THE INHERITOR · ALPHA
            </span>
            {scene.kind === "chamber" && (
              <span
                style={{
                  fontFamily: pixel,
                  fontSize: 10,
                  color: "#B8862F",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                }}
              >
                Chamber {currentChamberNumber} of {totalChambers}
              </span>
            )}
          </div>
          <KeepSilentLink />
        </header>

        {/* Scene illustration */}
        <div
          style={{
            background: "#1A1820",
            border: "3px solid #221E18",
            padding: 16,
            marginBottom: 16,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <SceneIllustration scene={scene.art} width={320} />
        </div>

        {/* Scene body */}
        {scene.kind === "frame" && (
          <FrameScene scene={scene} onAdvance={advance} />
        )}
        {scene.kind === "chamber" && (
          <ChamberScene
            scene={scene}
            revealed={revealed}
            pickedIdx={pickedIdx}
            onPick={pick}
            onAdvance={advance}
          />
        )}
      </div>
    </div>
  );
}

// ─── Keep Silent link (diegetic bail-out) ────────────────────────

function KeepSilentLink() {
  const [confirming, setConfirming] = useState(false);
  if (confirming) {
    return (
      <span
        style={{
          fontFamily: pixel,
          fontSize: 10,
          color: "#D6CDB6",
          letterSpacing: 0.4,
          textTransform: "uppercase",
        }}
      >
        <Link
          href="/quiz?mode=quick"
          style={{ color: "#F8C75E", textDecoration: "none" }}
        >
          ✓ Leave the estate
        </Link>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          style={{
            background: "none",
            border: "none",
            color: "#8C6520",
            font: "inherit",
            cursor: "pointer",
            padding: "0 0 0 10px",
          }}
        >
          stay
        </button>
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      style={{
        background: "none",
        border: "none",
        fontFamily: pixel,
        fontSize: 10,
        color: "#8C6520",
        letterSpacing: 0.4,
        textTransform: "uppercase",
        cursor: "pointer",
        padding: 0,
        textDecoration: "underline",
        textDecorationStyle: "dotted",
        textUnderlineOffset: 3,
      }}
      aria-label="Keep silent — leave the estate, take the classic quiz instead"
    >
      ◂ Keep silent
    </button>
  );
}

// ─── Frame scene (intro / reveal) ────────────────────────────────

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
        padding: "30px 28px 26px",
        background: "#FFFCF4",
        border: "4px solid #221E18",
        boxShadow: "6px 6px 0 0 #B8862F",
      }}
    >
      {scene.eyebrow && (
        <div
          style={{
            fontFamily: pixel,
            fontSize: 10,
            color: "#8C6520",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            marginBottom: 18,
            textAlign: "center",
          }}
        >
          {scene.eyebrow}
        </div>
      )}
      {paragraphs.map((p, i) => (
        <p
          key={i}
          style={{
            fontFamily: serif,
            fontSize: 18,
            color: "#221E18",
            margin: i === paragraphs.length - 1 ? "0 0 26px" : "0 0 16px",
            lineHeight: 1.7,
          }}
          dangerouslySetInnerHTML={{ __html: italicizeMarkers(p) }}
        />
      ))}
      <button
        type="button"
        onClick={onAdvance}
        style={advanceBtn}
      >
        ▶ {scene.advance.toUpperCase()}
      </button>
    </article>
  );
}

// ─── Chamber scene ───────────────────────────────────────────────

function ChamberScene({
  scene,
  revealed,
  pickedIdx,
  onPick,
  onAdvance,
}: {
  scene: Extract<JourneyScene, { kind: "chamber" }>;
  revealed: boolean;
  pickedIdx: number | null;
  onPick: (i: number) => void;
  onAdvance: () => void;
}) {
  const paragraphs = scene.body.split(/\n\n+/);
  return (
    <article>
      <div
        style={{
          padding: "26px 28px",
          background: "#FFFCF4",
          border: "4px solid #221E18",
          boxShadow: "5px 5px 0 0 #B8862F",
          marginBottom: 20,
        }}
      >
        <div
          style={{
            fontFamily: pixel,
            fontSize: 10,
            color: "#8C6520",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            marginBottom: 16,
            textAlign: "center",
          }}
        >
          {scene.eyebrow}
        </div>
        {paragraphs.map((p, i) => (
          <p
            key={i}
            style={{
              fontFamily: serif,
              fontSize: 17.5,
              color: "#221E18",
              margin: i === paragraphs.length - 1 ? "0" : "0 0 14px",
              lineHeight: 1.7,
            }}
            dangerouslySetInnerHTML={{ __html: italicizeMarkers(p) }}
          />
        ))}
      </div>

      <div
        style={{
          fontFamily: serif,
          fontStyle: "italic",
          fontSize: 17,
          color: "#F8EDC8",
          margin: "0 0 14px",
          lineHeight: 1.5,
          textAlign: "center",
        }}
      >
        {scene.prompt}
      </div>

      {/* Choice cards */}
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: "0 0 22px",
          display: "grid",
          gap: 8,
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
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "14px 16px",
                  background: isPicked
                    ? "#F8C75E"
                    : isDimmed
                      ? "#2A2630"
                      : "#FFFCF4",
                  color: isDimmed ? "#5D5644" : "#221E18",
                  border: "3px solid #221E18",
                  boxShadow: isPicked
                    ? "4px 4px 0 0 #2F5D5C"
                    : isDimmed
                      ? "none"
                      : "3px 3px 0 0 #B8862F",
                  cursor: revealed ? "default" : "pointer",
                  opacity: isDimmed ? 0.5 : 1,
                  transition:
                    "background 120ms ease, opacity 220ms ease, box-shadow 120ms ease",
                  fontFamily: serif,
                  fontSize: 16,
                  lineHeight: 1.5,
                }}
              >
                {c.text}
              </button>
            </li>
          );
        })}
      </ul>

      {revealed && (
        <div
          style={{
            padding: "18px 22px",
            background: "#1A1820",
            border: "3px solid #B8862F",
            marginBottom: scene.twistClue ? 14 : 22,
          }}
        >
          <p
            style={{
              fontFamily: serif,
              fontStyle: "italic",
              fontSize: 16,
              color: "#F8EDC8",
              margin: 0,
              lineHeight: 1.65,
            }}
            dangerouslySetInnerHTML={{ __html: italicizeMarkers(scene.epilogue) }}
          />
        </div>
      )}

      {revealed && scene.twistClue && (
        <div
          style={{
            padding: "14px 18px",
            background: "#2A1818",
            border: "2px dashed #7A2E2E",
            marginBottom: 22,
          }}
        >
          <div
            style={{
              fontFamily: pixel,
              fontSize: 9,
              color: "#B8862F",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              marginBottom: 6,
            }}>
            something else
          </div>
          <p
            style={{
              fontFamily: serif,
              fontSize: 15,
              color: "#D6CDB6",
              margin: 0,
              lineHeight: 1.6,
              fontStyle: "italic",
            }}
          >
            {scene.twistClue}
          </p>
        </div>
      )}

      {revealed && (
        <button type="button" onClick={onAdvance} style={advanceBtn}>
          ▶ CONTINUE
        </button>
      )}
    </article>
  );
}

// ─── Tiny utilities ──────────────────────────────────────────────

/** Convert `*text*` markers in prose to <em>text</em> tags for
 *  inline italics. Lets the scene data stay readable as plain text. */
function italicizeMarkers(s: string): string {
  return s.replace(
    /\*([^*]+)\*/g,
    '<em style="font-style: italic; color: inherit;">$1</em>',
  );
}

const advanceBtn: React.CSSProperties = {
  width: "100%",
  padding: "14px 20px",
  background: "#F8C75E",
  color: "#1A1820",
  border: "3px solid #221E18",
  boxShadow: "4px 4px 0 0 #2F5D5C",
  fontFamily: "var(--font-pixel-display, 'Courier New', monospace)",
  fontSize: 12,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  cursor: "pointer",
  transition: "transform 80ms steps(2, end), box-shadow 80ms steps(2, end)",
};
