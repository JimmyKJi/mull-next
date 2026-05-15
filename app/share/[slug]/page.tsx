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
//
// v3 pixel chrome: the card itself is a chunky pixel dialog window
// (4px ink border + 6px hard amber drop-shadow), the figure tile
// becomes a square pixel-tile (no more circle), the wordmark stays
// editorial cream-on-ink so it reads as the brand. Screenshots will
// look like a JRPG result panel.

import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getArchetypeByKey } from '@/lib/archetypes';
import { FIGURES } from '@/lib/figures';

const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'Inter', system-ui, sans-serif";
const pixel = "var(--font-pixel-display, 'Courier New', monospace)";

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
      padding: '40px 16px',
      background: '#FAF6EC',
      fontFamily: sans,
    }}>
      {/* The card — designed to be screenshotted. 9:16-ish aspect
          (~380×640) works well for IG stories and TikTok. Centered.
          Pixel dialog-window chrome: chunky 4px ink border + 6px hard
          amber shadow + flat (no border-radius). */}
      <article
        aria-label="Mull result card"
        className="pixel-crisp"
        style={{
          width: '100%',
          maxWidth: 380,
          minHeight: 640,
          background: '#FFFCF4',
          border: '4px solid #221E18',
          boxShadow: '6px 6px 0 0 #B8862F',
          borderRadius: 0,
          padding: '24px 24px 28px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          color: '#221E18',
          position: 'relative',
        }}
      >
        {/* Top amber bar — 8-bit "title bar" anchor across the top */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: 8,
          background: '#B8862F',
          borderBottom: '2px solid #221E18',
        }} />

        {/* Top row: Mull. wordmark + ARCHETYPE label */}
        <div style={{
          width: '100%',
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginTop: 14,
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
            fontFamily: pixel,
            fontSize: 10,
            color: '#8C6520',
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
          }}>
            ▸ ARCHETYPE
          </div>
        </div>

        {/* Figure inside square pixel-tile (replaces the old circle) */}
        <div style={{
          width: 180,
          height: 180,
          background: '#F8EDC8',
          border: '4px solid #221E18',
          boxShadow: '4px 4px 0 0 #8C6520',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 14,
          marginBottom: 28,
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
          marginBottom: 16,
        }}>
          {archName}
        </div>

        {/* Alignment line */}
        {pct !== null && (
          <div style={{
            fontFamily: pixel,
            fontSize: 12,
            color: '#8C6520',
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            marginBottom: 22,
            padding: '4px 12px',
            border: '2px solid #8C6520',
            background: '#F8EDC8',
          }}>
            ▸ {pct}% ALIGNMENT
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
            borderTop: '2px dashed #D6CDB6',
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
              marginBottom: 6,
              maxWidth: 320,
            }}>
              &ldquo;{shortQuote}&rdquo;
            </div>
            {quote?.attribution && (
              <div style={{
                fontFamily: pixel,
                fontSize: 10,
                color: '#8C6520',
                letterSpacing: 0.4,
                textTransform: 'uppercase',
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
          fontFamily: pixel,
          fontSize: 10,
          color: '#8C6520',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
        }}>
          ▸ FIND YOURS AT MULL.WORLD
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
          background: '#E5F0EE',
          border: '3px solid #2F5D5C',
          boxShadow: '3px 3px 0 0 #2F5D5C',
          color: '#173533',
          fontFamily: serif,
          fontSize: 14,
          lineHeight: 1.5,
          marginBottom: 16,
        }}>
          📸 Screenshot the card above and share it to your story or post. Tag <strong>@mull</strong> if you&rsquo;d like.
        </div>
        <p style={{
          fontFamily: serif,
          fontStyle: 'italic',
          fontSize: 13,
          color: '#8C6520',
          margin: '0 0 18px',
          lineHeight: 1.55,
          opacity: 0.9,
        }}>
          Saving as an image: long-press the card on iOS/Android, or use your phone&rsquo;s screenshot shortcut.
        </p>
        <Link href="/account" style={{
          fontFamily: pixel,
          fontSize: 11,
          color: '#8C6520',
          textDecoration: 'none',
          letterSpacing: 0.4,
          textTransform: 'uppercase',
          borderBottom: '2px solid #8C6520',
          paddingBottom: 1,
        }}>
          ◂ BACK TO YOUR ACCOUNT
        </Link>
      </div>
    </main>
  );
}
