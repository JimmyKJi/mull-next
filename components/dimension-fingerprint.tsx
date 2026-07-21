// DimensionFingerprint — "the shape of your mind" as a compact bar
// graph: the user's strongest dimensions, tallest first, each a
// horizontal bar filled proportional to its 0–10 value. Server
// component, archetype-themed, fully responsive (percentage widths —
// reads cleanly at 320px). The account page has the full 16-D map;
// this is the at-a-glance signature for the Today home.

import { DIM_KEYS } from '@/lib/dimensions';
import { t, type Locale } from '@/lib/translations';

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";
const serif = 'var(--font-prose)';

type Accent = { primary: string; deep: string; soft: string };

export function DimensionFingerprint({
  vector,
  locale,
  accent,
  n = 6,
}: {
  vector: number[];
  locale: Locale;
  accent: Accent;
  n?: number;
}) {
  if (!Array.isArray(vector) || vector.length !== 16) return null;
  const tops = vector
    .map((value, idx) => ({ idx, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, n);
  const max = 10;

  return (
    <div style={{ display: 'grid', gap: 7 }}>
      {tops.map(({ idx, value }) => {
        const pct = Math.max(4, Math.min(100, (value / max) * 100));
        const key = DIM_KEYS[idx];
        return (
          <div key={key} style={{ display: 'grid', gap: 3 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                gap: 8,
              }}
            >
              <span
                style={{
                  fontFamily: serif,
                  fontSize: 13.5,
                  color: 'var(--color-ink)',
                  lineHeight: 1.2,
                  minWidth: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {t(`dim.${key}.name`, locale)}
              </span>
              <span
                style={{
                  fontFamily: pixel,
                  fontSize: 10,
                  color: accent.deep,
                  letterSpacing: '0.06em',
                  flexShrink: 0,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {value.toFixed(1)}
              </span>
            </div>
            <div
              style={{
                height: 10,
                background: '#EFE7D0',
                border: '2px solid var(--color-ink)',
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: `${pct}%`,
                  background: accent.primary,
                  borderRight: `2px solid ${accent.deep}`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
