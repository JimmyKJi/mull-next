// MullWordmark — single source of truth for the editorial "Mull."
// wordmark. Cormorant 500-weight serif with the period in amber.
// Several pages were duplicating the inline-style version, which is
// the only piece of brand chrome that should never drift between
// surfaces.
//
// Usage:
//   <MullWordmark />                 — link to "/" at default size
//   <MullWordmark size="sm" />       — smaller (24px) for sub-headers
//   <MullWordmark size="lg" />       — bigger (32px) for share-card headers
//   <MullWordmark as="div" />        — render as <div> (non-link)

import Link from 'next/link';
import type { CSSProperties } from 'react';

type Size = 'sm' | 'md' | 'lg';
type Props = {
  size?: Size;
  /** Render as a non-clickable <div>. Default: link to "/". */
  as?: 'link' | 'div';
  /** Override link href. Default "/" when as="link". */
  href?: string;
  /** Optional inline style overrides. */
  style?: CSSProperties;
  className?: string;
};

const SIZE_PX: Record<Size, number> = {
  sm: 24,
  md: 28,
  lg: 32,
};

export default function MullWordmark({
  size = 'md',
  as = 'link',
  href = '/',
  style,
  className,
}: Props) {
  const fontSize = SIZE_PX[size];
  const baseStyle: CSSProperties = {
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontSize,
    fontWeight: 500,
    color: '#221E18',
    textDecoration: 'none',
    letterSpacing: '-0.5px',
    lineHeight: 1,
    ...style,
  };

  const content = (
    <>
      Mull<span style={{ color: '#B8862F' }}>.</span>
    </>
  );

  if (as === 'div') {
    return <div style={baseStyle} className={className}>{content}</div>;
  }

  return (
    <Link href={href} style={baseStyle} className={className}>
      {content}
    </Link>
  );
}
