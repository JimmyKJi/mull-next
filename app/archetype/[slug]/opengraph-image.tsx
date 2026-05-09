// Per-archetype OG card. 1200×630 PNG via Satori (next/og).
// Layout is a book-jacket style: brand wordmark top-left, archetype
// label top-right, big serif name center, italic spirit phrase below,
// a quote with attribution, and a small mull.world signature bottom.
//
// Cormorant Garamond + Inter loaded via lib/og-fonts so the rendered
// type matches the on-site typography. First render warm-up loads the
// fonts (~300ms); subsequent renders on the same warm instance reuse
// the cached bytes.

import { ImageResponse } from 'next/og';
import { getArchetypeByKey } from '@/lib/archetypes';
import { loadOGFonts } from '@/lib/og-fonts';

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
  const name = a
    ? a.key.charAt(0).toUpperCase() + a.key.slice(1)
    : 'Mull';
  const spirit = a?.spirit ?? 'Find your place on the map of how you think.';
  const quoteText = a?.quotes?.[0]?.text ?? '';
  const shortQuote = quoteText.length > 130
    ? quoteText.slice(0, 127).trimEnd() + '…'
    : quoteText;
  const quoteAttribution = a?.quotes?.[0]?.attribution ?? '';

  const fonts = await loadOGFonts();

  // Brand color palette — matches the live site's --cream, --ink,
  // --acc, --acc-deep CSS variables.
  const CREAM = '#FAF6EC';
  const CREAM_2 = '#F1EAD8';
  const INK = '#221E18';
  const INK_SOFT = '#4A4338';
  const ACC = '#B8862F';
  const ACC_DEEP = '#8C6520';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: CREAM,
          padding: '54px 72px 48px',
          color: INK,
          fontFamily: 'Inter, sans-serif',
          position: 'relative',
        }}
      >
        {/* Decorative gold rule across the very top */}
        <div style={{
          display: 'flex',
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: 6,
          background: ACC,
        }} />

        {/* Top row: brand wordmark + archetype label */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
        }}>
          {/* Mull. wordmark — proper serif, big enough to be brand-anchoring */}
          <div style={{
            display: 'flex',
            alignItems: 'baseline',
            fontFamily: 'Cormorant, Georgia, serif',
            fontSize: 56,
            fontWeight: 500,
            color: INK,
            letterSpacing: -1,
            lineHeight: 1,
          }}>
            <div style={{ display: 'flex' }}>Mull</div>
            <div style={{ display: 'flex', color: ACC }}>.</div>
          </div>
          {/* Section label */}
          <div style={{
            display: 'flex',
            fontFamily: 'Inter, sans-serif',
            fontSize: 16,
            fontWeight: 600,
            color: ACC_DEEP,
            letterSpacing: 5,
            paddingBottom: 8,
          }}>
            ARCHETYPE
          </div>
        </div>

        {/* Center hero: italic 'The' + giant name + spirit */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            flex: 1,
            marginTop: 20,
          }}
        >
          <div style={{
            display: 'flex',
            fontFamily: 'Cormorant, Georgia, serif',
            fontStyle: 'italic',
            color: ACC_DEEP,
            fontSize: 56,
            fontWeight: 500,
            lineHeight: 1,
          }}>
            The
          </div>
          <div style={{
            display: 'flex',
            fontFamily: 'Cormorant, Georgia, serif',
            fontSize: 156,
            fontWeight: 500,
            lineHeight: 1.0,
            letterSpacing: -3,
            color: INK,
            marginTop: 4,
          }}>
            {name}
          </div>
          <div style={{
            display: 'flex',
            fontFamily: 'Cormorant, Georgia, serif',
            fontStyle: 'italic',
            fontSize: 36,
            color: INK_SOFT,
            marginTop: 20,
            lineHeight: 1.3,
            maxWidth: 1000,
          }}>
            {spirit}
          </div>
        </div>

        {/* Quote block — designed like a small footer epigraph */}
        {shortQuote ? (
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 32,
            paddingTop: 22,
            borderTop: `1px solid ${CREAM_2}`,
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              maxWidth: 820,
            }}>
              <div style={{
                display: 'flex',
                fontFamily: 'Cormorant, Georgia, serif',
                fontStyle: 'italic',
                fontSize: 22,
                color: INK,
                lineHeight: 1.4,
              }}>
                {`“${shortQuote}”`}
              </div>
              {quoteAttribution ? (
                <div style={{
                  display: 'flex',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 14,
                  color: ACC_DEEP,
                  marginTop: 6,
                  letterSpacing: 1,
                }}>
                  — {quoteAttribution}
                </div>
              ) : null}
            </div>
            <div style={{
              display: 'flex',
              fontFamily: 'Inter, sans-serif',
              fontSize: 13,
              color: ACC_DEEP,
              letterSpacing: 4,
              fontWeight: 600,
              paddingBottom: 4,
            }}>
              MULL.WORLD
            </div>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: 22,
            borderTop: `1px solid ${CREAM_2}`,
          }}>
            <div style={{
              display: 'flex',
              fontFamily: 'Cormorant, Georgia, serif',
              fontStyle: 'italic',
              fontSize: 22,
              color: ACC_DEEP,
            }}>
              Find your place on the map of how you think.
            </div>
            <div style={{
              display: 'flex',
              fontFamily: 'Inter, sans-serif',
              fontSize: 13,
              color: ACC_DEEP,
              letterSpacing: 4,
              fontWeight: 600,
            }}>
              MULL.WORLD
            </div>
          </div>
        )}
      </div>
    ),
    { ...size, fonts }
  );
}
