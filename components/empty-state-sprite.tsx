// EmptyStateSprite — small pixel sprite + caption for empty states
// across the app. Replaces the italic-text-only empty states that
// previously read as "you have nothing here" without any visual
// anchor.
//
// Variants are small 16×16 SVG sprites rendered crisp via the
// pixel-crisp class. Each variant matches a context:
//   - 'explorer' — "you haven't found anything yet" (default)
//   - 'book'     — "no entries yet" (diary, exercises)
//   - 'star'     — "no curated picks yet"
//   - 'compass'  — "you're not on the map yet"
//
// Usage:
//   <EmptyStateSprite variant="explorer" caption="No matches yet." />

import type { CSSProperties } from 'react';

type Variant = 'explorer' | 'book' | 'star' | 'compass';

const SPRITES: Record<Variant, string> = {
  // Tiny pixel "explorer" — head + walking-staff. 16x16 grid,
  // each rect a single pixel. Drawn ink + amber accent.
  explorer: `
    <svg viewBox="0 0 16 16" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" aria-hidden="true">
      <rect x="6" y="2" width="3" height="3" fill="#221E18"/>
      <rect x="5" y="5" width="5" height="1" fill="#B8862F"/>
      <rect x="5" y="6" width="5" height="3" fill="#221E18"/>
      <rect x="6" y="9" width="3" height="3" fill="#221E18"/>
      <rect x="4" y="12" width="2" height="3" fill="#221E18"/>
      <rect x="9" y="12" width="2" height="3" fill="#221E18"/>
      <rect x="2" y="6" width="1" height="9" fill="#8C6520"/>
      <rect x="2" y="5" width="2" height="1" fill="#B8862F"/>
    </svg>
  `,
  // Open pixel "book" — two pages with a spine.
  book: `
    <svg viewBox="0 0 16 16" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" aria-hidden="true">
      <rect x="2" y="3" width="6" height="10" fill="#FFFCF4"/>
      <rect x="8" y="3" width="6" height="10" fill="#FFFCF4"/>
      <rect x="2" y="3" width="12" height="1" fill="#221E18"/>
      <rect x="2" y="12" width="12" height="1" fill="#221E18"/>
      <rect x="2" y="3" width="1" height="10" fill="#221E18"/>
      <rect x="13" y="3" width="1" height="10" fill="#221E18"/>
      <rect x="7" y="3" width="2" height="10" fill="#8C6520"/>
      <rect x="3" y="6" width="4" height="1" fill="#B8862F"/>
      <rect x="3" y="9" width="4" height="1" fill="#B8862F"/>
      <rect x="9" y="6" width="4" height="1" fill="#B8862F"/>
      <rect x="9" y="9" width="4" height="1" fill="#B8862F"/>
    </svg>
  `,
  // Pixel star — celebrates / "nothing curated yet".
  star: `
    <svg viewBox="0 0 16 16" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" aria-hidden="true">
      <rect x="7" y="2" width="2" height="2" fill="#B8862F"/>
      <rect x="2" y="7" width="2" height="2" fill="#B8862F"/>
      <rect x="12" y="7" width="2" height="2" fill="#B8862F"/>
      <rect x="7" y="12" width="2" height="2" fill="#B8862F"/>
      <rect x="6" y="6" width="4" height="4" fill="#221E18"/>
      <rect x="5" y="5" width="6" height="6" fill="none" stroke="#221E18" stroke-width="1"/>
      <rect x="4" y="4" width="2" height="2" fill="#8C6520"/>
      <rect x="10" y="4" width="2" height="2" fill="#8C6520"/>
      <rect x="4" y="10" width="2" height="2" fill="#8C6520"/>
      <rect x="10" y="10" width="2" height="2" fill="#8C6520"/>
    </svg>
  `,
  // Pixel compass — needle + circular face. Used when the user
  // hasn't placed themselves on the map yet.
  compass: `
    <svg viewBox="0 0 16 16" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" aria-hidden="true">
      <rect x="3" y="3" width="10" height="1" fill="#221E18"/>
      <rect x="3" y="12" width="10" height="1" fill="#221E18"/>
      <rect x="3" y="3" width="1" height="10" fill="#221E18"/>
      <rect x="12" y="3" width="1" height="10" fill="#221E18"/>
      <rect x="2" y="4" width="1" height="8" fill="#221E18"/>
      <rect x="13" y="4" width="1" height="8" fill="#221E18"/>
      <rect x="4" y="2" width="8" height="1" fill="#221E18"/>
      <rect x="4" y="13" width="8" height="1" fill="#221E18"/>
      <rect x="4" y="4" width="8" height="8" fill="#FFFCF4"/>
      <rect x="7" y="5" width="2" height="3" fill="#B8862F"/>
      <rect x="7" y="8" width="2" height="3" fill="#221E18"/>
      <rect x="7" y="7" width="2" height="2" fill="#221E18"/>
    </svg>
  `,
};

export default function EmptyStateSprite({
  variant = 'explorer',
  caption,
  size = 64,
  style,
}: {
  variant?: Variant;
  caption: string;
  size?: number;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
        padding: '24px 16px',
        ...style,
      }}
    >
      <div
        className="pixel-crisp pixel-float"
        style={{ width: size, height: size }}
        aria-hidden
        dangerouslySetInnerHTML={{ __html: SPRITES[variant] }}
      />
      <p
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontStyle: 'italic',
          fontSize: 15,
          color: '#8C6520',
          margin: 0,
          textAlign: 'center',
          maxWidth: 320,
          lineHeight: 1.55,
        }}
      >
        {caption}
      </p>
    </div>
  );
}
