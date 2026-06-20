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
import { getServerLocale } from '@/lib/locale-server';
import { t } from '@/lib/translations';

export const metadata: Metadata = {
  title: 'Not found',
  robots: { index: false, follow: false },
};

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";
const serif = "var(--font-prose)";

export default async function NotFound() {
  const locale = await getServerLocale();
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
        border: '4px solid var(--color-ink)',
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
          color: 'var(--color-ink)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          textShadow: '3px 3px 0 var(--pixel-shadow, #7A2E2E)',
          lineHeight: 1.4,
        }}>
          {t('nf.title', locale)}
        </h1>
        <p style={{
          fontFamily: serif,
          fontStyle: 'italic',
          fontSize: 17,
          color: 'var(--color-ink-soft)',
          margin: '0 0 24px',
          lineHeight: 1.55,
        }}>
          {t('nf.body', locale)}
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
            ▸ {t('nf.home', locale)}
          </Link>
          <Link href="/quiz?mode=quick" className="pixel-press" style={ctaSecondary('var(--color-acc)')}>
            ▸ {t('nf.take_quiz', locale)}
          </Link>
          <Link href="/search" className="pixel-press" style={ctaSecondary('#2F5D5C')}>
            ▸ {t('nf.search_minds', locale)}
          </Link>
        </div>
      </div>
    </main>
  );
}

const ctaPrimary: React.CSSProperties = {
  display: 'inline-block',
  padding: '10px 18px',
  background: 'var(--color-ink)',
  color: 'var(--color-cream)',
  border: '3px solid var(--color-ink)',
  boxShadow: '3px 3px 0 0 var(--color-acc)',
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
