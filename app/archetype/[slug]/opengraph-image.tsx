// Dynamic OG image for each archetype detail page. Renders to a
// 1200×630 PNG via Satori (next/og). Used by both:
//   - Twitter/Facebook/LinkedIn previews when /archetype/[slug] is
//     shared (wired via the archetype detail page's metadata).
//   - The "Share your result" buttons that the quiz spawns inside
//     mull.html — those buttons link to /archetype/[slug], which
//     means previewing on every social platform shows a beautiful
//     designed card instead of a flat link.
//
// Satori has limited CSS support (no grid, no complex inline SVG),
// so the layout is deliberately flat: flexbox + text. Fonts default
// to a system serif/sans; if we ever want Cormorant Garamond
// rendered identically to the site, we'd need to fetch the font
// woff and pass it to ImageResponse — skipping for now since the
// system serif is close enough at thumbnail size.

import { ImageResponse } from 'next/og';
import { getArchetypeByKey } from '@/lib/archetypes';

// Node runtime (default). One image per route (no
// generateImageMetadata) so the URL stays the simple
// /archetype/<slug>/opengraph-image — what social-media scrapers
// expect when they read the openGraph.images entry from the page's
// metadata. Static generation still happens via the parent route's
// generateStaticParams.
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Mull · Archetype';

export default async function ArchetypeOGImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const a = getArchetypeByKey(slug);
  // Fallback for invalid slug — render a generic Mull card so the page
  // doesn't 404 on the OG fetch.
  const name = a
    ? `The ${a.key.charAt(0).toUpperCase() + a.key.slice(1)}`
    : 'Mull';
  const spirit = a?.spirit ?? 'Find your place on the map of how you think.';

  // Pull a short quote from the archetype's quote list to add a little
  // texture below the spirit line. Trim aggressively — long quotes blow
  // out of the visible area at OG dimensions.
  const quoteText = a?.quotes?.[0]?.text ?? '';
  const shortQuote = quoteText.length > 110
    ? quoteText.slice(0, 107).trimEnd() + '…'
    : quoteText;
  const quoteAttribution = a?.quotes?.[0]?.attribution ?? '';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: '#FAF6EC',
          padding: '64px 72px',
          color: '#221E18',
          fontFamily: 'Georgia, "Cormorant Garamond", serif',
        }}
      >
        {/* Top eyebrow */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 22,
            color: '#8C6520',
            letterSpacing: 6,
            textTransform: 'uppercase',
            fontFamily: '"Helvetica Neue", Arial, sans-serif',
            fontWeight: 600,
          }}
        >
          <div>Mull · Archetype</div>
          <div style={{ color: '#221E18', letterSpacing: 0 }}>
            mull<span style={{ color: '#B8862F' }}>.</span>world
          </div>
        </div>

        {/* Main name + spirit */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            flex: 1,
            marginTop: 40,
          }}
        >
          <div
            style={{
              fontSize: 124,
              fontWeight: 500,
              lineHeight: 1.0,
              letterSpacing: -2,
              color: '#221E18',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span style={{ fontStyle: 'italic', color: '#8C6520', fontSize: 64, fontWeight: 400, marginBottom: 8 }}>
              The
            </span>
            <span>{name.replace(/^The\s+/i, '')}</span>
          </div>
          <div
            style={{
              fontSize: 38,
              fontStyle: 'italic',
              color: '#4A4338',
              marginTop: 28,
              lineHeight: 1.3,
              maxWidth: 980,
            }}
          >
            {spirit}
          </div>
        </div>

        {/* Bottom quote */}
        {shortQuote ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              borderLeft: '4px solid #B8862F',
              paddingLeft: 20,
              marginTop: 20,
            }}
          >
            <div
              style={{
                fontSize: 22,
                fontStyle: 'italic',
                color: '#221E18',
                lineHeight: 1.4,
              }}
            >
              &ldquo;{shortQuote}&rdquo;
            </div>
            {quoteAttribution && (
              <div
                style={{
                  fontSize: 16,
                  color: '#8C6520',
                  marginTop: 6,
                  fontFamily: '"Helvetica Neue", Arial, sans-serif',
                  letterSpacing: 1,
                }}
              >
                — {quoteAttribution}
              </div>
            )}
          </div>
        ) : (
          <div
            style={{
              fontSize: 22,
              color: '#8C6520',
              fontFamily: '"Helvetica Neue", Arial, sans-serif',
              fontStyle: 'italic',
            }}
          >
            Find your place on the map of how you think.
          </div>
        )}
      </div>
    ),
    { ...size }
  );
}
