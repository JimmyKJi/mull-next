'use client';

// PathwayNext — the "trail from here" panel at the bottom of content
// pages. Renders a row of illustrated stations (archetype sprite,
// philosopher sprite, or glyph) connected by a dashed pixel-art line
// with an animated arrow between them. Looks like a quest log fragment
// — not a row of buttons.
//
// Two trails per pathway: cold (default, server-rendered) and warm
// (rendered after hydration if `mull.archetype` is set in
// localStorage). The swap is intentional — if a user has taken the
// quiz, the trail leads to the retention loop; if not, the trail
// leads through the quiz.
//
// Mobile: stations stack vertically with a vertical connector. The
// trail metaphor still works either way.

import { useEffect, useState, useId } from 'react';
import Link from 'next/link';
import { ArchetypeSprite } from '@/components/archetype-sprite';
import { PhilosopherSprite } from '@/components/philosopher-sprite';
import type { Pathway, PathwayStation } from '@/lib/pathway';
import { personalizeWarmTrail } from '@/lib/pathway';
import { coerceVector16 } from '@/lib/recommendations';
import { t, type Locale } from '@/lib/translations';

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";
const serif = 'var(--font-prose)';
const sans = "'Inter', system-ui, sans-serif";

type Props = {
  pathway: Pathway;
  locale?: Locale;
  /** Eyebrow + heading override. Defaults to a generic trail title. */
  eyebrow?: string;
  heading?: string;
};

export function PathwayNext({ pathway, locale = 'en', eyebrow, heading }: Props) {
  const id = useId();
  // Start with cold trail (server-render-safe). Swap to warm after
  // hydration if archetype is set.
  const [trail, setTrail] = useState<PathwayStation[]>(pathway.cold);
  const [warmedUp, setWarmedUp] = useState(false);

  useEffect(() => {
    try {
      const archetypeKey = window.localStorage.getItem('mull.archetype');
      if (archetypeKey) {
        // Read the user's own 16-D coordinates too (if present) so the
        // warm trail can lead with the philosopher nearest them in vector
        // space. Users who took the quiz before vectors were stashed fall
        // back to archetype-only personalization inside personalizeWarmTrail.
        let vector: number[] | null = null;
        try {
          const rawVec = window.localStorage.getItem('mull.vector');
          if (rawVec) vector = coerceVector16(JSON.parse(rawVec));
        } catch {
          /* malformed vector — fall back to archetype-only */
        }
        setTrail(personalizeWarmTrail(pathway, archetypeKey, locale, vector));
        setWarmedUp(true);
      } else if (pathway.warm) {
        // No archetype, but the surface defines a warm fallback.
        // Keep cold for first visit — the quiz CTA matters most then.
      }
    } catch {
      /* storage disabled */
    }
  }, [pathway, locale]);

  return (
    <section
      aria-labelledby={`${id}-heading`}
      style={{
        marginTop: 48,
        position: 'relative',
      }}
    >
      <div
        style={{
          fontFamily: pixel,
          fontSize: 10,
          letterSpacing: '0.18em',
          color: '#8C6520',
          textTransform: 'uppercase',
          marginBottom: 4,
        }}
      >
        ▶{' '}
        {eyebrow ??
          (warmedUp ? t('pathway.eyebrow_warm', locale) : t('pathway.eyebrow_cold', locale))}
      </div>
      <h2
        id={`${id}-heading`}
        style={{
          fontFamily: serif,
          fontSize: 24,
          fontWeight: 500,
          margin: '0 0 18px',
          color: '#221E18',
          letterSpacing: '-0.3px',
        }}
      >
        {heading ??
          (warmedUp ? t('pathway.heading_warm', locale) : t('pathway.heading_cold', locale))}
      </h2>

      <ol
        className="pathway-trail"
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'grid',
          gap: 0,
          gridTemplateColumns: `repeat(${trail.length}, 1fr)`,
          alignItems: 'stretch',
        }}
      >
        {trail.map((station, i) => (
          <PathwayCard
            key={station.href + ':' + i}
            station={station}
            stepNumber={i + 1}
            isLast={i === trail.length - 1}
            locale={locale}
          />
        ))}
      </ol>

      {/* Mobile-stack rules + connector animation. */}
      <style>{`
        @keyframes pathway-arrow-pulse {
          0%, 100% { transform: translateX(0); opacity: 0.7; }
          50% { transform: translateX(3px); opacity: 1; }
        }
        @keyframes pathway-arrow-pulse-v {
          0%, 100% { transform: translateY(0); opacity: 0.7; }
          50% { transform: translateY(3px); opacity: 1; }
        }
        .pathway-card-link:hover .pathway-card,
        .pathway-card-link:focus-visible .pathway-card {
          transform: translate(-2px, -2px);
          box-shadow: 6px 6px 0 0 var(--station-accent);
        }
        @media (max-width: 720px) {
          .pathway-trail {
            grid-template-columns: 1fr !important;
          }
          .pathway-connector-h { display: none !important; }
          .pathway-connector-v { display: flex !important; }
        }
      `}</style>
    </section>
  );
}

function PathwayCard({
  station,
  stepNumber,
  isLast,
  locale,
}: {
  station: PathwayStation;
  stepNumber: number;
  isLast: boolean;
  locale: Locale;
}) {
  return (
    <li style={{ display: 'flex', position: 'relative' }}>
      <Link
        href={station.href}
        prefetch={false}
        className="pathway-card-link"
        style={
          {
            display: 'block',
            flex: 1,
            textDecoration: 'none',
            color: 'inherit',
            ['--station-accent' as string]: station.accent,
          } as React.CSSProperties
        }
      >
        <div
          className="pathway-card"
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            padding: '16px 14px 14px',
            margin: 6,
            background: '#FFFCF4',
            border: '3px solid #221E18',
            boxShadow: `4px 4px 0 0 ${station.accent}`,
            transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end)',
            height: '100%',
          }}
        >
          {/* Step number tag — anchors the trail metaphor. */}
          <div
            style={{
              position: 'absolute',
              top: -10,
              left: 10,
              fontFamily: pixel,
              fontSize: 9,
              padding: '2px 6px',
              background: station.accent,
              color: '#FFFCF4',
              letterSpacing: 0.4,
              textTransform: 'uppercase',
            }}
          >
            {String(stepNumber).padStart(2, '0')} · {station.tag}
          </div>

          {/* Visual — sprite or glyph. */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 72,
              paddingTop: 6,
            }}
          >
            <StationVisual visual={station.visual} accent={station.accent} />
          </div>

          {/* Title + blurb. */}
          <div>
            <div
              style={{
                fontFamily: serif,
                fontSize: 17,
                fontWeight: 500,
                color: '#221E18',
                lineHeight: 1.2,
                marginBottom: 4,
              }}
            >
              {station.title}
            </div>
            <div
              style={{
                fontFamily: serif,
                fontStyle: 'italic',
                fontSize: 13,
                color: '#4A4338',
                lineHeight: 1.5,
              }}
            >
              {station.blurb}
            </div>
          </div>

          <div
            style={{
              marginTop: 'auto',
              paddingTop: 6,
              fontFamily: pixel,
              fontSize: 9,
              color: station.accent,
              letterSpacing: 0.6,
              textTransform: 'uppercase',
            }}
          >
            {t('pathway.continue', locale)}
          </div>
        </div>
      </Link>

      {/* Horizontal connector — desktop. */}
      {!isLast && (
        <div
          className="pathway-connector-h"
          aria-hidden
          style={{
            position: 'absolute',
            right: -8,
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            pointerEvents: 'none',
            zIndex: 2,
          }}
        >
          <DashedLineH accent={station.accent} />
          <span
            style={{
              fontFamily: pixel,
              fontSize: 14,
              color: station.accent,
              animation: 'pathway-arrow-pulse 1.6s infinite ease-in-out',
            }}
          >
            ▶
          </span>
        </div>
      )}

      {/* Vertical connector — mobile. */}
      {!isLast && (
        <div
          className="pathway-connector-v"
          aria-hidden
          style={{
            display: 'none',
            position: 'absolute',
            bottom: -18,
            left: '50%',
            transform: 'translateX(-50%)',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            pointerEvents: 'none',
            zIndex: 2,
          }}
        >
          <DashedLineV accent={station.accent} />
          <span
            style={{
              fontFamily: pixel,
              fontSize: 14,
              color: station.accent,
              animation: 'pathway-arrow-pulse-v 1.6s infinite ease-in-out',
            }}
          >
            ▼
          </span>
        </div>
      )}
    </li>
  );
}

function StationVisual({ visual, accent }: { visual: PathwayStation['visual']; accent: string }) {
  if (visual.kind === 'archetype') {
    return (
      <div
        style={{
          border: `2px solid ${accent}`,
          background: '#FBFAF2',
          padding: 6,
          boxShadow: `2px 2px 0 0 ${accent}`,
        }}
        aria-hidden
      >
        <ArchetypeSprite archetypeKey={visual.archetypeKey} size={56} />
      </div>
    );
  }
  if (visual.kind === 'philosopher') {
    return (
      <div
        style={{
          border: `2px solid ${accent}`,
          background: '#FBFAF2',
          padding: 6,
          boxShadow: `2px 2px 0 0 ${accent}`,
        }}
        aria-hidden
      >
        <PhilosopherSprite name={visual.name} archetypeKey={visual.archetypeKey} size={56} />
      </div>
    );
  }
  // Glyph — large pixel-art unicode in an accent-tinted frame.
  return (
    <div
      style={{
        width: 72,
        height: 72,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: `2px solid ${accent}`,
        background: '#FBFAF2',
        boxShadow: `2px 2px 0 0 ${accent}`,
      }}
      aria-hidden
    >
      <span
        style={{
          fontFamily: pixel,
          fontSize: 38,
          color: accent,
          lineHeight: 1,
        }}
      >
        {visual.glyph}
      </span>
    </div>
  );
}

function DashedLineH({ accent }: { accent: string }) {
  return (
    <svg width="20" height="6" viewBox="0 0 20 6" aria-hidden>
      <line x1="0" y1="3" x2="20" y2="3" stroke={accent} strokeWidth="2" strokeDasharray="3 3" />
    </svg>
  );
}

function DashedLineV({ accent }: { accent: string }) {
  return (
    <svg width="6" height="20" viewBox="0 0 6 20" aria-hidden>
      <line x1="3" y1="0" x2="3" y2="20" stroke={accent} strokeWidth="2" strokeDasharray="3 3" />
    </svg>
  );
}
