// Per-archetype OG card. 1200×630 PNG via Satori (next/og).
// System fonts only (Georgia for serif, system-ui for sans) — runtime
// Google Fonts fetching was 500'ing on Vercel. Visual aesthetic is
// nearly identical at OG dimensions; the fancy-font upgrade can come
// later via bundled .ttf files in /public if we want it.

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
  const shortQuote = quoteText.length > 130
    ? quoteText.slice(0, 127).trimEnd() + '…'
    : quoteText;
  const quoteAttribution = a?.quotes?.[0]?.attribution ?? '';

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
          position: 'relative',
        }}
      >
        <div style={{
          display: 'flex',
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: 6,
          background: ACC,
        }} />

        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'baseline',
            fontFamily: 'Georgia, serif',
            fontSize: 56,
            fontWeight: 600,
            color: INK,
            letterSpacing: -1,
            lineHeight: 1,
          }}>
            <div style={{ display: 'flex' }}>Mull</div>
            <div style={{ display: 'flex', color: ACC }}>.</div>
          </div>
          <div style={{
            display: 'flex',
            fontFamily: 'system-ui, sans-serif',
            fontSize: 16,
            fontWeight: 600,
            color: ACC_DEEP,
            letterSpacing: 5,
            paddingBottom: 8,
          }}>
            ARCHETYPE
          </div>
        </div>

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
            fontFamily: 'Georgia, serif',
            fontStyle: 'italic',
            color: ACC_DEEP,
            fontSize: 56,
            fontWeight: 400,
            lineHeight: 1,
          }}>
            The
          </div>
          <div style={{
            display: 'flex',
            fontFamily: 'Georgia, serif',
            fontSize: 156,
            fontWeight: 600,
            lineHeight: 1.0,
            letterSpacing: -3,
            color: INK,
            marginTop: 4,
          }}>
            {name}
          </div>
          <div style={{
            display: 'flex',
            fontFamily: 'Georgia, serif',
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
                fontFamily: 'Georgia, serif',
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
                  fontFamily: 'system-ui, sans-serif',
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
              fontFamily: 'system-ui, sans-serif',
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
              fontFamily: 'Georgia, serif',
              fontStyle: 'italic',
              fontSize: 22,
              color: ACC_DEEP,
            }}>
              Find your place on the map of how you think.
            </div>
            <div style={{
              display: 'flex',
              fontFamily: 'system-ui, sans-serif',
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
    { ...size }
  );
}
