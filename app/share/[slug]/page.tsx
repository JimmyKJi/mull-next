// /share/[slug] — screenshot-friendly result card.
//
// Users click "Post on Instagram" or "Post on TikTok" and land here.
// The page renders a centered, vertically-oriented card with the
// archetype figure, name, alignment, spirit phrase, and Mull
// wordmark — designed to look great as a phone screenshot dropped
// into a story or feed post.
//
// Below the card we render screenshot instructions + a small back
// link (these are OUTSIDE the visible card so they don't get
// captured in the screenshot).
//
// URL shape: /share/forge?flavor=Mystical&pct=76
//   - slug    (path)  — archetype key, lowercase
//   - flavor  (query) — optional flavor adjective
//   - pct     (query) — optional alignment percentage

import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getArchetypeByKey } from '@/lib/archetypes';
import { FIGURES } from '@/lib/figures';

const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'Inter', system-ui, sans-serif";

export const metadata: Metadata = {
  // Page is meant for screenshot, not search-indexable as content.
  robots: { index: false, follow: false },
  title: 'Share your result',
};

export default async function SharePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ flavor?: string; pct?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const archetype = getArchetypeByKey(slug);
  if (!archetype) notFound();

  const figure = FIGURES[archetype.key] || '';
  const flavor = (sp.flavor || '').trim();
  const pctRaw = parseInt(sp.pct || '', 10);
  const pct = Number.isFinite(pctRaw) ? Math.max(0, Math.min(100, pctRaw)) : null;
  const archName = archetype.key.charAt(0).toUpperCase() + archetype.key.slice(1);

  // First quote from the archetype — adds visual texture below the
  // alignment line. Trim aggressively so it doesn't dominate.
  const quote = archetype.quotes?.[0];
  const shortQuote = quote && quote.text.length > 90
    ? quote.text.slice(0, 87).trimEnd() + '…'
    : quote?.text;

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: '32px 16px',
      background: '#FAF6EC',
      fontFamily: sans,
    }}>
      {/* The card — designed to be screenshotted. 9:16-ish aspect
          (~380×640) works well for IG stories and TikTok. Centered. */}
      <article
        aria-label="Mull result card"
        style={{
          width: '100%',
          maxWidth: 380,
          minHeight: 640,
          background: '#FAF6EC',
          border: '1px solid #EBE3CA',
          borderRadius: 16,
          padding: '28px 26px 32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          color: '#221E18',
          position: 'relative',
          boxShadow: '0 1px 0 rgba(0,0,0,0.02), 0 8px 24px rgba(34,30,24,0.04)',
        }}
      >
        {/* Top gold accent bar — visual anchor */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: 4,
          background: '#B8862F',
          borderRadius: '16px 16px 0 0',
        }} />

        {/* Top row: Mull. wordmark + ARCHETYPE label */}
        <div style={{
          width: '100%',
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginTop: 6,
          marginBottom: 28,
        }}>
          <div style={{
            fontFamily: serif,
            fontSize: 28,
            fontWeight: 600,
            lineHeight: 1,
            letterSpacing: '-0.5px',
          }}>
            Mull<span style={{ color: '#B8862F' }}>.</span>
          </div>
          <div style={{
            fontSize: 10,
            fontWeight: 600,
            color: '#8C6520',
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
          }}>
            Archetype
          </div>
        </div>

        {/* Figure inside circular cream-2 tile */}
        <div style={{
          width: 180,
          height: 180,
          borderRadius: '50%',
          background: '#F1EAD8',
          border: '2px solid #B8862F',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 18,
          marginBottom: 24,
          flexShrink: 0,
        }}>
          <span
            aria-hidden
            style={{ width: '100%', height: '100%', display: 'block' }}
            dangerouslySetInnerHTML={{ __html: figure }}
          />
        </div>

        {/* Italic 'The' + flavor + name */}
        <div style={{
          fontFamily: serif,
          fontStyle: 'italic',
          fontSize: 22,
          color: '#8C6520',
          fontWeight: 400,
          marginBottom: 4,
          lineHeight: 1,
        }}>
          {flavor ? `The ${flavor}` : 'The'}
        </div>
        <div style={{
          fontFamily: serif,
          fontSize: 56,
          fontWeight: 500,
          lineHeight: 1.0,
          letterSpacing: '-1.5px',
          marginBottom: 14,
        }}>
          {archName}
        </div>

        {/* Alignment line */}
        {pct !== null && (
          <div style={{
            fontFamily: sans,
            fontSize: 12,
            fontWeight: 600,
            color: '#8C6520',
            textTransform: 'uppercase',
            letterSpacing: '0.16em',
            marginBottom: 22,
          }}>
            {pct}% alignment
          </div>
        )}

        {/* Spirit phrase — italic gold */}
        <div style={{
          fontFamily: serif,
          fontStyle: 'italic',
          fontSize: 17,
          color: '#4A4338',
          lineHeight: 1.45,
          marginBottom: 22,
          maxWidth: 320,
        }}>
          {archetype.spirit}
        </div>

        {/* Quote (if available) */}
        {shortQuote && (
          <div style={{
            paddingTop: 18,
            paddingBottom: 8,
            borderTop: '1px solid #EBE3CA',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            <div style={{
              fontFamily: serif,
              fontStyle: 'italic',
              fontSize: 14,
              color: '#221E18',
              lineHeight: 1.5,
              marginBottom: 4,
              maxWidth: 320,
            }}>
              &ldquo;{shortQuote}&rdquo;
            </div>
            {quote?.attribution && (
              <div style={{
                fontFamily: sans,
                fontSize: 10.5,
                color: '#8C6520',
                letterSpacing: 0.5,
              }}>
                — {quote.attribution}
              </div>
            )}
          </div>
        )}

        {/* Bottom: mull.world signature, pushed to bottom by flex */}
        <div style={{
          marginTop: 'auto',
          paddingTop: 18,
          fontFamily: sans,
          fontSize: 11,
          fontWeight: 600,
          color: '#8C6520',
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
        }}>
          Find yours at mull.world
        </div>
      </article>

      {/* Instructions BELOW the card — these are not part of the
          screenshot area so users won't capture them. */}
      <div style={{
        marginTop: 28,
        maxWidth: 380,
        width: '100%',
        textAlign: 'center',
      }}>
        <div style={{
          padding: '12px 16px',
          background: '#EFF5F1',
          border: '1px solid #C9DBCB',
          borderRadius: 8,
          color: '#2F5D5C',
          fontFamily: sans,
          fontSize: 13.5,
          lineHeight: 1.5,
          marginBottom: 14,
        }}>
          📸 Screenshot the card above and share it to your story or post. Tag <strong>@mull</strong> if you&rsquo;d like.
        </div>
        <p style={{
          fontFamily: sans,
          fontSize: 12,
          color: '#8C6520',
          margin: '0 0 14px',
          lineHeight: 1.55,
          opacity: 0.85,
        }}>
          Saving as an image: long-press the card on iOS/Android, or use your phone&rsquo;s screenshot shortcut.
        </p>
        <Link href="/account" style={{
          fontFamily: sans,
          fontSize: 13,
          color: '#8C6520',
          textDecoration: 'underline',
          textUnderlineOffset: 3,
        }}>
          ← Back to your account
        </Link>
      </div>
    </main>
  );
}
