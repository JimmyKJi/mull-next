'use client';

// JourneyEngine — "The Inheritor" v3.
//
// Changes from v2:
//   - Scene illustration moved INSIDE the cream card (was on dark
//     background, clashed). Reads as a chapter-page vignette now.
//   - Illustrations switched from crude pixel-art to clean
//     iconographic flat SVG — single iconic element per scene on
//     sepia ground. Less ambitious, more dignified, doesn't pretend.
//   - Prompt is **bolded** for re-takers / skimmers who want to find
//     the hinge question without re-reading the prose.
//   - "Silence" is now a real in-chamber choice in every chamber,
//     with a small vector delta toward SR/AT/MR (genuine philosophical
//     stance of withholding judgment). Rendered with subtler styling
//     so it reads as withdrawal rather than a louder claim.
//   - Header bail-out simplified — small "Leave" link, click-through,
//     no longer the visual peer of the alpha badge. Most users will
//     stay; the in-chamber silence is the diegetic exit.
//
// Scoring + handoff unchanged from v1.

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { add, zeros } from '@/lib/vectors';
import type { JourneyScene, RevealEnding } from '@/lib/quiz-journey';
import { chamberCount, pickEnding } from '@/lib/quiz-journey';
import { t, type Locale } from '@/lib/translations';
import { SceneIllustration } from '@/components/scene-illustration';
import { SupportMullPrompt } from '@/components/support-mull-prompt';
import { ResearchConsentGate } from '@/components/research-consent-gate';

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";
const serif = 'var(--font-prose)';

type Props = {
  scenes: JourneyScene[];
  /** The ten reveal endings, already localized server-side. */
  reveals: Record<string, RevealEnding>;
  locale: Locale;
};

export function JourneyEngine({ scenes, reveals, locale }: Props) {
  const router = useRouter();
  /** Gate screen — shown before scene 0 to make expectations clear
   *  (15 min, narrative). Click "Begin" to drop it; click the
   *  classic link to bounce to /quiz?mode=quick. Solves the "casual
   *  visitor expected a 5-min quiz, got dropped into atmospheric
   *  prose" problem. */
  const [gated, setGated] = useState(true);
  const [idx, setIdx] = useState(0);
  const [vector, setVector] = useState<number[]>(zeros());
  const [revealed, setRevealed] = useState(false);
  const [pickedIdx, setPickedIdx] = useState<number | null>(null);

  const totalChambers = useMemo(() => chamberCount(), []);
  const currentChamberNumber = useMemo(() => {
    let count = 0;
    for (let i = 0; i <= idx; i++) {
      if (scenes[i]?.kind === 'chamber') count++;
    }
    return count;
  }, [idx, scenes]);

  useEffect(() => {
    setRevealed(false);
    setPickedIdx(null);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [idx]);

  const scene = scenes[idx];
  if (!scene) return null;

  // Gate: render the fork-screen before any narrative starts.
  // Wrapped in ResearchConsentGate so first-time users see the
  // consent screen first; returning users skip straight through.
  if (gated) {
    return (
      <ResearchConsentGate>
        <GateScreen onBegin={() => setGated(false)} locale={locale} />
      </ResearchConsentGate>
    );
  }

  function advance() {
    if (idx + 1 < scenes.length) {
      setIdx(idx + 1);
    } else {
      finish();
    }
  }

  function pick(choiceIdx: number) {
    if (scene.kind !== 'chamber') return;
    const delta = scene.choices[choiceIdx]?.vector;
    if (!delta) return;
    setVector((prev) => add(prev, delta));
    setPickedIdx(choiceIdx);
    setRevealed(true);
    window.setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 80);
  }

  function finish() {
    const enc = btoa(JSON.stringify(vector.map((n) => +n.toFixed(3))));
    router.push(`/result?v=${encodeURIComponent(enc)}&m=quick`);
  }

  return (
    <div
      style={{
        background: '#26201A', // warm dark — feels like night by lamplight, not pure black
        minHeight: '100svh',
        padding: '24px 14px 48px',
      }}
    >
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        {/* Header chrome */}
        <header
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            gap: 12,
            marginBottom: 20,
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 10,
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                fontFamily: pixel,
                fontSize: 10,
                color: '#1A1820',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                background: '#F8C75E',
                border: '2px solid var(--color-ink)',
                padding: '3px 8px',
              }}
            >
              {t('journey.badge', locale)}
            </span>
            {scene.kind === 'chamber' && (
              <span
                style={{
                  fontFamily: pixel,
                  fontSize: 10,
                  color: 'var(--color-acc)',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                }}
              >
                {t('journey.chamber_of', locale, {
                  n: currentChamberNumber,
                  m: totalChambers,
                })}
              </span>
            )}
          </div>
          <Link
            href="/quiz?mode=quick"
            style={{
              fontFamily: pixel,
              fontSize: 9,
              color: '#5C4528',
              letterSpacing: 0.4,
              textTransform: 'uppercase',
              textDecoration: 'none',
              opacity: 0.75,
            }}
            title={t('journey.leave_title', locale)}
          >
            {t('journey.leave', locale)}
          </Link>
        </header>

        {/* Scene body */}
        {scene.kind === 'frame' && <FrameScene scene={scene} onAdvance={advance} locale={locale} />}
        {scene.kind === 'chamber' && (
          <ChamberScene
            scene={scene}
            revealed={revealed}
            pickedIdx={pickedIdx}
            onPick={pick}
            onAdvance={advance}
            locale={locale}
          />
        )}
        {scene.kind === 'reveal' && (
          <RevealScene
            scene={scene}
            vector={vector}
            reveals={reveals}
            onAdvance={advance}
            locale={locale}
          />
        )}
      </div>
    </div>
  );
}

// ─── Reveal scene (branching ending) ──────────────────────────────
//
// Calls pickEnding(vector) to choose one of the 10 archetype-keyed
// endings, then splices the shared cold-open prose with the picked
// recognition + flavor beat + inheritance + ask. Falls back to the
// Cartographer ending if the picker somehow returns an archetype
// that's not in JOURNEY_REVEALS (shouldn't happen — both come from
// the same archetype-targets source).

function RevealScene({
  scene,
  vector,
  reveals,
  onAdvance,
  locale,
}: {
  scene: Extract<JourneyScene, { kind: 'reveal' }>;
  vector: number[];
  reveals: Record<string, RevealEnding>;
  onAdvance: () => void;
  locale: Locale;
}) {
  const { archetypeKey, flavor } = useMemo(() => pickEnding(vector), [vector]);
  const ending: RevealEnding = reveals[archetypeKey] ?? reveals.cartographer;

  // Compose body: cold-open + recognition + flavor beat + inheritance
  // + ask, joined by paragraph breaks. The shared cold-open already
  // ends with "He looks at you steadily." — the recognition picks up
  // from that beat as Wren's first archetype-specific line.
  const flavorBeat = (flavor != null && ending.flavorDetails[flavor]) || ending.flavorDetailDefault;
  const body = [
    scene.coldOpen,
    ending.recognition,
    flavorBeat,
    ending.inheritance,
    ending.ask,
  ].join('\n\n');
  const paragraphs = body.split(/\n\n+/);

  return (
    <article
      style={{
        background: '#FFFCF4',
        border: '4px solid var(--color-ink)',
        boxShadow: '6px 6px 0 0 var(--color-acc)',
      }}
    >
      <div style={illustrationContainer}>
        <SceneIllustration scene={scene.art} width={360} locale={locale} />
      </div>

      <div style={{ padding: '26px 32px 30px' }}>
        <div style={eyebrowStyle}>{scene.eyebrow}</div>
        {paragraphs.map((p, i) => (
          <p
            key={i}
            style={{
              fontFamily: serif,
              fontSize: 18,
              color: 'var(--color-ink)',
              margin: i === paragraphs.length - 1 ? '0 0 24px' : '0 0 16px',
              lineHeight: 1.7,
            }}
            dangerouslySetInnerHTML={{ __html: italicizeMarkers(p) }}
          />
        ))}
        <button type="button" onClick={onAdvance} style={advanceBtn}>
          ▶ {ending.advance.toUpperCase()}
        </button>
        {/* Tip-jar nudge on the reveal — catches the user at the
            moment they've finished the work, before /result. */}
        <div style={{ marginTop: 24 }}>
          <SupportMullPrompt
            lead="If The Inheritor gave you something, consider keeping it open."
            detail="The narrative quiz is free to take, but each playthrough runs a small AI bill. Tips from people who can afford it keep Mull free for everyone else."
          />
        </div>
      </div>
    </article>
  );
}

// ─── Frame scene (intro / reveal) ────────────────────────────────

function FrameScene({
  scene,
  onAdvance,
  locale,
}: {
  scene: Extract<JourneyScene, { kind: 'frame' }>;
  onAdvance: () => void;
  locale: Locale;
}) {
  const paragraphs = scene.body.split(/\n\n+/);
  return (
    <article
      style={{
        background: '#FFFCF4',
        border: '4px solid var(--color-ink)',
        boxShadow: '6px 6px 0 0 var(--color-acc)',
      }}
    >
      {/* Illustration sits at the top of the cream card */}
      <div style={illustrationContainer}>
        <SceneIllustration scene={scene.art} width={360} locale={locale} />
      </div>

      <div style={{ padding: '26px 32px 30px' }}>
        {scene.eyebrow && <div style={eyebrowStyle}>{scene.eyebrow}</div>}
        {paragraphs.map((p, i) => (
          <p
            key={i}
            style={{
              fontFamily: serif,
              fontSize: 18,
              color: 'var(--color-ink)',
              margin: i === paragraphs.length - 1 ? '0 0 24px' : '0 0 16px',
              lineHeight: 1.7,
            }}
            dangerouslySetInnerHTML={{ __html: italicizeMarkers(p) }}
          />
        ))}
        <button type="button" onClick={onAdvance} style={advanceBtn}>
          ▶ {scene.advance.toUpperCase()}
        </button>
      </div>
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
  locale,
}: {
  scene: Extract<JourneyScene, { kind: 'chamber' }>;
  revealed: boolean;
  pickedIdx: number | null;
  onPick: (i: number) => void;
  onAdvance: () => void;
  locale: Locale;
}) {
  const paragraphs = scene.body.split(/\n\n+/);
  return (
    <article>
      <div
        style={{
          background: '#FFFCF4',
          border: '4px solid var(--color-ink)',
          boxShadow: '5px 5px 0 0 var(--color-acc)',
          marginBottom: 18,
        }}
      >
        {/* Illustration sits at the top of the cream card */}
        <div style={illustrationContainer}>
          <SceneIllustration scene={scene.art} width={360} locale={locale} />
        </div>

        <div style={{ padding: '24px 30px 28px' }}>
          <div style={eyebrowStyle}>{scene.eyebrow}</div>
          {paragraphs.map((p, i) => (
            <p
              key={i}
              style={{
                fontFamily: serif,
                fontSize: 17.5,
                color: 'var(--color-ink)',
                margin: i === paragraphs.length - 1 ? '0 0 18px' : '0 0 14px',
                lineHeight: 1.7,
              }}
              dangerouslySetInnerHTML={{ __html: italicizeMarkers(p) }}
            />
          ))}

          {/* BOLD prompt — easy to find for re-takers and skimmers */}
          <p
            style={{
              fontFamily: serif,
              fontWeight: 600,
              fontSize: 19,
              color: 'var(--color-ink)',
              margin: '12px 0 0',
              lineHeight: 1.55,
              borderLeft: '3px solid var(--color-acc)',
              paddingLeft: 14,
            }}
          >
            {scene.prompt}
          </p>
        </div>
      </div>

      {/* Choice cards */}
      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: '0 0 18px',
          display: 'grid',
          gap: 8,
        }}
      >
        {scene.choices.map((c, i) => {
          const isPicked = pickedIdx === i;
          const isDimmed = revealed && pickedIdx !== i;
          const isSilence = !!c.silence;
          return (
            <li key={i}>
              <button
                type="button"
                onClick={() => !revealed && onPick(i)}
                disabled={revealed}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: isSilence ? '12px 16px' : '14px 16px',
                  background: isPicked
                    ? '#F8C75E'
                    : isDimmed
                      ? '#2F261E'
                      : isSilence
                        ? 'transparent'
                        : '#FFFCF4',
                  color: isDimmed
                    ? '#5D5644'
                    : isSilence
                      ? 'var(--color-line)'
                      : 'var(--color-ink)',
                  border: isSilence
                    ? '2px dashed var(--color-acc-deep)'
                    : '3px solid var(--color-ink)',
                  boxShadow: isPicked
                    ? '4px 4px 0 0 #2F5D5C'
                    : isDimmed
                      ? 'none'
                      : isSilence
                        ? 'none'
                        : '3px 3px 0 0 var(--color-acc)',
                  cursor: revealed ? 'default' : 'pointer',
                  opacity: isDimmed ? 0.5 : 1,
                  transition: 'background 120ms ease, opacity 220ms ease, box-shadow 120ms ease',
                  fontFamily: serif,
                  fontStyle: isSilence ? 'italic' : 'normal',
                  fontSize: isSilence ? 15 : 16,
                  lineHeight: 1.55,
                }}
              >
                {c.text}
              </button>
            </li>
          );
        })}
      </ul>

      {revealed &&
        (() => {
          // Per-choice epilogue overrides the scene default when the
          // picked choice has its own narrative beat (a reveal about
          // the deceased that the standard "N have answered" line
          // would flatten). Falls back to scene.epilogue otherwise.
          const epilogueText =
            (pickedIdx != null && scene.choiceEpilogues?.[pickedIdx]) || scene.epilogue;
          // Multi-paragraph epilogues render with paragraph breaks via
          // \n\n splitting — the new long-form choice epilogues use this.
          const paragraphs = epilogueText.split(/\n\n+/);
          return (
            <div
              style={{
                padding: '18px 22px',
                background: '#1F1814',
                border: '3px solid var(--color-acc)',
                marginBottom: scene.twistClue ? 14 : 20,
              }}
            >
              {paragraphs.map((p, i) => (
                <p
                  key={i}
                  style={{
                    fontFamily: serif,
                    fontStyle: 'italic',
                    fontSize: 16.5,
                    color: 'var(--color-acc-soft)',
                    margin: i === paragraphs.length - 1 ? 0 : '0 0 12px',
                    lineHeight: 1.65,
                  }}
                  dangerouslySetInnerHTML={{ __html: italicizeMarkers(p) }}
                />
              ))}
            </div>
          );
        })()}

      {revealed && scene.twistClue && (
        <div
          style={{
            padding: '14px 18px',
            background: '#2A1818',
            border: '2px dashed #7A2E2E',
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontFamily: pixel,
              fontSize: 9,
              color: 'var(--color-acc)',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              marginBottom: 6,
            }}
          >
            {t('journey.something_else', locale)}
          </div>
          <p
            style={{
              fontFamily: serif,
              fontSize: 15.5,
              color: '#E5DCC0',
              margin: 0,
              lineHeight: 1.6,
              fontStyle: 'italic',
            }}
          >
            {scene.twistClue}
          </p>
        </div>
      )}

      {revealed && (
        <button type="button" onClick={onAdvance} style={advanceBtn}>
          ▶ {t('journey.continue', locale)}
        </button>
      )}
    </article>
  );
}

// ─── Gate screen (fork: enter Inheritor vs take 5-min classic) ───
//
// Shown as the very first render on /quiz/journey before any of the
// six narrative scenes. Sets expectations explicitly so casual
// visitors who landed here expecting a 5-min quiz have a one-click
// path out, and visitors who came for the immersive version have a
// clear "yes, I want this" commit before the prose starts.

function GateScreen({ onBegin, locale }: { onBegin: () => void; locale: Locale }) {
  return (
    <div
      style={{
        background: '#26201A',
        minHeight: '100svh',
        padding: '60px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ maxWidth: 540, width: '100%' }}>
        <div
          style={{
            background: '#FFFCF4',
            border: '4px solid var(--color-ink)',
            boxShadow: '6px 6px 0 0 var(--color-acc)',
            padding: '32px 30px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontFamily: pixel,
              fontSize: 10,
              color: 'var(--color-acc-deep)',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              marginBottom: 22,
            }}
          >
            {t('journey.gate_eyebrow', locale)}
          </div>
          <h1
            style={{
              fontFamily: pixel,
              fontSize: 22,
              color: 'var(--color-ink)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              lineHeight: 1.4,
              margin: '0 0 18px',
              textShadow: '3px 3px 0 var(--pixel-shadow, var(--color-acc))',
            }}
          >
            {t('journey.gate_title', locale)}
          </h1>
          <p
            style={{
              fontFamily: serif,
              fontSize: 17,
              color: 'var(--color-ink)',
              margin: '0 0 12px',
              lineHeight: 1.65,
            }}
          >
            {t('journey.gate_desc', locale)}
          </p>
          <p
            style={{
              fontFamily: serif,
              fontSize: 15,
              fontStyle: 'italic',
              color: 'var(--color-acc-deep)',
              margin: '0 0 28px',
              lineHeight: 1.5,
            }}
          >
            {t('journey.gate_time', locale)}
          </p>
          <div
            style={{
              display: 'grid',
              gap: 10,
            }}
          >
            <button
              type="button"
              onClick={onBegin}
              style={{
                width: '100%',
                padding: '16px 20px',
                background: '#F8C75E',
                color: '#1A1820',
                border: '3px solid var(--color-ink)',
                boxShadow: '4px 4px 0 0 #2F5D5C',
                fontFamily: pixel,
                fontSize: 13,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end)',
              }}
            >
              {t('journey.gate_begin', locale)}
            </button>
            <Link
              href="/quiz?mode=quick"
              style={{
                width: '100%',
                padding: '14px 18px',
                background: 'transparent',
                color: 'var(--color-ink-soft)',
                border: '2px solid var(--color-acc-deep)',
                fontFamily: pixel,
                fontSize: 11,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                textDecoration: 'none',
                textAlign: 'center',
                display: 'block',
              }}
            >
              {t('journey.gate_classic', locale)}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tiny utilities + shared style snippets ──────────────────────

function italicizeMarkers(s: string): string {
  return s.replace(/\*([^*]+)\*/g, '<em style="font-style: italic; color: inherit;">$1</em>');
}

const illustrationContainer: React.CSSProperties = {
  background: '#F0E5CB',
  borderBottom: '3px solid var(--color-ink)',
  padding: '16px 14px',
  display: 'flex',
  justifyContent: 'center',
};

const eyebrowStyle: React.CSSProperties = {
  fontFamily: pixel,
  fontSize: 10,
  color: 'var(--color-acc-deep)',
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  marginBottom: 16,
  textAlign: 'center',
};

const advanceBtn: React.CSSProperties = {
  width: '100%',
  padding: '14px 20px',
  background: '#F8C75E',
  color: '#1A1820',
  border: '3px solid var(--color-ink)',
  boxShadow: '4px 4px 0 0 #2F5D5C',
  fontFamily: "var(--font-pixel-display, 'Courier New', monospace)",
  fontSize: 12,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  cursor: 'pointer',
  transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end)',
};
