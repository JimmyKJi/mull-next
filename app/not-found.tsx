// Global 404 page. Next.js renders this when notFound() is called or
// when no route matches. The default Next.js 404 is unstyled HTML
// that breaks the pixel-game world abruptly; this version stays
// in-brand and offers obvious exits.
//
// Variants are not personalised because we don't know whether the
// user is signed in here — we'd need a server component to check
// auth, and even then a 404 with a "back to your account" CTA
// implicitly tells visitors there's an account system at all.

import Link from 'next/link';
import type { Metadata } from 'next';
import MullWordmark from '@/components/mull-wordmark';
import EmptyStateSprite from '@/components/empty-state-sprite';

export const metadata: Metadata = {
  title: 'Not found',
  robots: { index: false, follow: false },
};

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";
const serif = "'Cormorant Garamond', Georgia, serif";

export default function NotFound() {
  return (
    <main style={{
      maxWidth: 560,
      margin: '0 auto',
      padding: '80px 24px 120px',
    }}>
      <div style={{ marginBottom: 36 }}>
        <MullWordmark />
      </div>

      <div style={{
        padding: '32px 30px',
        background: '#FFFCF4',
        border: '4px solid #221E18',
        boxShadow: '6px 6px 0 0 #7A2E2E',
        borderRadius: 0,
        textAlign: 'center',
      }}>
        <div style={{
          fontFamily: pixel,
          fontSize: 12,
          color: '#7A2E2E',
          textTransform: 'uppercase',
          letterSpacing: '0.18em',
          marginBottom: 14,
        }}>
          ERROR 404
        </div>
        <h1 style={{
          fontFamily: pixel,
          fontSize: 32,
          margin: '0 0 16px',
          color: '#221E18',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          textShadow: '3px 3px 0 #7A2E2E',
          lineHeight: 1.1,
        }}>
          OFF THE MAP
        </h1>
        <p style={{
          fontFamily: serif,
          fontStyle: 'italic',
          fontSize: 17,
          color: '#4A4338',
          margin: '0 0 24px',
          lineHeight: 1.55,
        }}>
          The page you tried to reach isn&rsquo;t here. Maybe the link aged out,
          maybe the URL has a typo. Either way, here are three doors you
          probably want.
        </p>

        <EmptyStateSprite
          variant="compass"
          caption=""
          size={56}
        />

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 10,
          justifyContent: 'center',
          marginTop: 8,
        }}>
          <Link href="/" className="pixel-press" style={ctaPrimary}>
            ▸ HOME
          </Link>
          <Link href="/quiz?mode=quick" className="pixel-press" style={ctaSecondary('#B8862F')}>
            ▸ TAKE THE QUIZ
          </Link>
          <Link href="/search" className="pixel-press" style={ctaSecondary('#2F5D5C')}>
            ▸ SEARCH MINDS
          </Link>
        </div>
      </div>
    </main>
  );
}

const ctaPrimary: React.CSSProperties = {
  display: 'inline-block',
  padding: '10px 18px',
  background: '#221E18',
  color: '#FAF6EC',
  border: '3px solid #221E18',
  boxShadow: '3px 3px 0 0 #B8862F',
  borderRadius: 0,
  fontFamily: pixel,
  fontSize: 11,
  letterSpacing: 0.4,
  textTransform: 'uppercase',
  textDecoration: 'none',
  transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end)',
};

function ctaSecondary(accent: string): React.CSSProperties {
  return {
    display: 'inline-block',
    padding: '10px 18px',
    background: '#FFFCF4',
    color: accent,
    border: `3px solid ${accent}`,
    boxShadow: `3px 3px 0 0 ${accent}`,
    borderRadius: 0,
    fontFamily: pixel,
    fontSize: 11,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    textDecoration: 'none',
    transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end)',
  };
}
