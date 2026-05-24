// MullWordmark — the editorial wordmark, optionally paired with the
// MullMark brand glyph.
//
// Usage:
//   <MullWordmark />                — link to "/" with default 28px text
//   <MullWordmark size="sm" />      — smaller (24px) for sub-headers
//   <MullWordmark size="lg" />      — bigger (32px) for share-card headers
//   <MullWordmark withMark />       — include the brand glyph to the left
//   <MullWordmark as="div" />       — render as <div> (non-link)
//
// When `withMark` is set, the mark is sized to match the text height
// and sits flush-left of the wordmark with a small gap.

import Link from 'next/link';
import type { CSSProperties } from 'react';
import { MullMark } from './mull-mark';

type Size = 'sm' | 'md' | 'lg';
type Props = {
  size?: Size;
  /** Render as a non-clickable <div>. Default: link to "/". */
  as?: 'link' | 'div';
  /** Override link href. Default "/" when as="link". */
  href?: string;
  /** Optional inline style overrides for the text element. */
  style?: CSSProperties;
  className?: string;
  /** When true, render the MullMark glyph beside the wordmark.
   *  Default true — the mark is the brand now. Pass `withMark={false}`
   *  on surfaces that need text-only (e.g. tight share cards). */
  withMark?: boolean;
  /** Variant for the mark. Defaults to 'color'. */
  markVariant?: 'color' | 'mono';
};

const SIZE_PX: Record<Size, number> = {
  sm: 24,
  md: 28,
  lg: 32,
};

// Mark is slightly smaller than text height — pairs visually
// with the cap-height of Cormorant Garamond.
const MARK_RATIO = 0.95;

export default function MullWordmark({
  size = 'md',
  as = 'link',
  href = '/',
  style,
  className,
  withMark = true,
  markVariant = 'color',
}: Props) {
  const fontSize = SIZE_PX[size];
  const markSize = Math.round(fontSize * MARK_RATIO);

  const textStyle: CSSProperties = {
    fontFamily: "var(--font-prose)",
    fontSize,
    fontWeight: 500,
    color: '#221E18',
    textDecoration: 'none',
    letterSpacing: '-0.5px',
    lineHeight: 1,
    ...style,
  };

  const wrapperStyle: CSSProperties = withMark
    ? {
        display: 'inline-flex',
        alignItems: 'center',
        gap: Math.round(fontSize * 0.32),
        textDecoration: 'none',
      }
    : {};

  const content = withMark ? (
    <span style={wrapperStyle}>
      <MullMark size={markSize} variant={markVariant} />
      <span style={textStyle}>
        Mull<span style={{ color: '#B8862F' }}>.</span>
      </span>
    </span>
  ) : (
    <>
      Mull<span style={{ color: '#B8862F' }}>.</span>
    </>
  );

  if (as === 'div') {
    return (
      <div
        style={withMark ? wrapperStyle : textStyle}
        className={className}
      >
        {content}
      </div>
    );
  }

  return (
    <Link
      href={href}
      style={withMark ? wrapperStyle : textStyle}
      className={className}
    >
      {content}
    </Link>
  );
}
