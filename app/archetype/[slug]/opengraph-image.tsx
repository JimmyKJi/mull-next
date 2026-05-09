// Dynamic OG image for each archetype detail page. Renders to a
// 1200×630 PNG via Satori (next/og).
//
// Satori is strict: every <div> must have explicit `display`, can't
// mix text + element children inside the same div, doesn't support
// CSS grid, etc. The JSX below is deliberately flat to satisfy those
// constraints — flexbox + atomic elements only.

import { ImageResponse } from 'next/og';
import { getArchetypeByKey } from '@/lib/archetypes';

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
          fontFamily: 'Georgia, serif',
        }}
      >
        {/* Top eyebrow row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 22,
            color: '#8C6520',
            letterSpacing: 6,
            textTransform: 'uppercase',
            fontWeight: 600,
          }}
        >
          <div style={{ display: 'flex' }}>MULL · ARCHETYPE</div>
          <div style={{ display: 'flex', color: '#221E18', letterSpacing: 0 }}>MULL.WORLD</div>
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
          <div style={{
            display: 'flex',
            fontStyle: 'italic',
            color: '#8C6520',
            fontSize: 64,
            fontWeight: 400,
            marginBottom: 8,
          }}>
            The
          </div>
          <div style={{
            display: 'flex',
            fontSize: 124,
            fontWeight: 500,
            lineHeight: 1.0,
            letterSpacing: -2,
            color: '#221E18',
          }}>
            {name}
          </div>
          <div style={{
            display: 'flex',
            fontSize: 38,
            fontStyle: 'italic',
            color: '#4A4338',
            marginTop: 28,
            lineHeight: 1.3,
            maxWidth: 980,
          }}>
            {spirit}
          </div>
        </div>

        {/* Bottom quote OR fallback */}
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
            <div style={{
              display: 'flex',
              fontSize: 22,
              fontStyle: 'italic',
              color: '#221E18',
              lineHeight: 1.4,
            }}>
              {`“${shortQuote}”`}
            </div>
            {quoteAttribution ? (
              <div style={{
                display: 'flex',
                fontSize: 16,
                color: '#8C6520',
                marginTop: 6,
                letterSpacing: 1,
              }}>
                — {quoteAttribution}
              </div>
            ) : null}
          </div>
        ) : (
          <div style={{
            display: 'flex',
            fontSize: 22,
            color: '#8C6520',
            fontStyle: 'italic',
          }}>
            Find your place on the map of how you think.
          </div>
        )}
      </div>
    ),
    { ...size }
  );
}
