// JudgingNotice — a shared, collapsible "how you're judged" panel.
//
// Shown on every debate surface's landing (Daily Spar, the Arena hub,
// PvE setup, the PvP board) so players know the rules BEFORE they
// argue. It mirrors the 2026-06 judging reframe in lib/arena/judge.ts,
// in plain language:
//   - no winner is crowned; each side is scored on its own merits
//   - common ground counts as a strong outcome, not a draw
//   - plain words score the same as the technical jargon
//   - five criteria, 1-5 each (validity, premises, rigor, elegance,
//     engagement)
//   - last-word fairness — you're never penalised for the format
//   - non-zero-sum Elo: both players can rise, or both can fall
//
// Server-component-safe: a native <details>/<summary> disclosure, no
// client JS. Matches the chunky pixel-panel house style used across
// /dilemma, /arena, etc. Pass `style` to set per-surface margins.

import type { CSSProperties } from 'react';
import { t, type Locale } from '@/lib/translations';

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";
// Editorial serif (Cormorant) — the same elegant face used for topic
// prompts and subtitles that sit next to this notice on every debate
// surface. Reads better than the pixel-sans body for a dense panel.
const serif = 'var(--font-editorial)';

// Each point is a bold lead-in (…_h) + a plain-language gloss (…_b).
// Order tracks the four pieces of feedback that drove the reframe:
// no-winner, common-ground, no-jargon, criteria, last-word, Elo.
const POINTS: { h: string; b: string }[] = [
  { h: 'judging.no_winner_h', b: 'judging.no_winner_b' },
  { h: 'judging.common_ground_h', b: 'judging.common_ground_b' },
  { h: 'judging.plain_language_h', b: 'judging.plain_language_b' },
  { h: 'judging.criteria_h', b: 'judging.criteria_b' },
  { h: 'judging.last_word_h', b: 'judging.last_word_b' },
  { h: 'judging.elo_h', b: 'judging.elo_b' },
];

export function JudgingNotice({
  locale,
  className,
  style,
}: {
  locale: Locale;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <details
      className={className}
      style={{
        background: '#FFFCF4',
        border: '3px solid var(--color-ink)',
        boxShadow: '4px 4px 0 0 var(--color-acc)',
        borderRadius: 0,
        padding: '14px 18px',
        ...style,
      }}
    >
      <summary style={{ cursor: 'pointer', listStyle: 'none' }}>
        <span
          style={{
            display: 'block',
            fontFamily: pixel,
            fontSize: 10,
            color: 'var(--color-acc-deep)',
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            marginBottom: 6,
          }}
        >
          ▸ {t('judging.title', locale)}
        </span>
        <span
          style={{
            fontFamily: serif,
            fontStyle: 'italic',
            fontSize: 14,
            color: 'var(--color-ink-soft)',
            lineHeight: 1.5,
          }}
        >
          {t('judging.teaser', locale)}
        </span>
      </summary>

      <p
        style={{
          fontFamily: serif,
          fontSize: 16,
          color: 'var(--color-ink)',
          lineHeight: 1.6,
          margin: '14px 0 12px',
        }}
      >
        {t('judging.lede', locale)}
      </p>

      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
        {POINTS.map((p) => (
          <li key={p.h} style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
            <span
              aria-hidden
              style={{ color: 'var(--color-acc-deep)', fontFamily: pixel, fontSize: 10, lineHeight: 1.5 }}
            >
              ▪
            </span>
            <span style={{ fontFamily: serif, fontSize: 15.5, lineHeight: 1.55 }}>
              <strong style={{ color: 'var(--color-ink)' }}>{t(p.h, locale)}</strong>{' '}
              <span style={{ color: 'var(--color-ink-soft)' }}>{t(p.b, locale)}</span>
            </span>
          </li>
        ))}
      </ul>
    </details>
  );
}
