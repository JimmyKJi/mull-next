// Per-archetype OG card. Two-column book-jacket layout:
//   - Top: gold rule, Mull. wordmark, ARCHETYPE label
//   - Left column (~340px): the archetype's hand-drawn figure SVG
//     in a circular cream tile, plus a subtle constellation of dots
//   - Right column: italic 'The', huge serif name, italic spirit
//   - Bottom: quote with attribution + MULL.WORLD signature, gold rule
//
// Cormorant Garamond (medium + italic) + Inter (regular + semibold)
// loaded from /public/fonts at module load — no runtime network
// dependency, so this can't 500 from font fetch failures.

import { ImageResponse } from 'next/og';
import { getArchetypeByKey } from '@/lib/archetypes';
import { FIGURES } from '@/lib/figures';
import { loadOGFonts, svgToDataUri } from '@/lib/og-fonts';

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
  const figureSvg = a ? FIGURES[a.key] : null;
  const figureDataUri = figureSvg ? svgToDataUri(figureSvg) : null;

  const fonts = await loadOGFonts();

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
          padding: '50px 64px 44px',
          color: INK,
          position: 'relative',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {/* Gold accent rule top — visual anchor */}
        <div style={{
          display: 'flex',
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: 6,
          background: ACC,
        }} />

        {/* Decorative corner ornament — three small dots like a constellation */}
        <div style={{
          display: 'flex',
          position: 'absolute',
          top: 30, right: 38,
          flexDirection: 'row',
          gap: 5,
        }}>
          <div style={{ display: 'flex', width: 4, height: 4, borderRadius: '50%', background: ACC, opacity: 0.55 }} />
          <div style={{ display: 'flex', width: 4, height: 4, borderRadius: '50%', background: ACC, opacity: 0.35 }} />
          <div style={{ display: 'flex', width: 4, height: 4, borderRadius: '50%', background: ACC, opacity: 0.2 }} />
        </div>

        {/* TOP ROW: Mull. wordmark + ARCHETYPE label */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'baseline',
            fontFamily: 'Cormorant',
            fontSize: 48,
            fontWeight: 500,
            color: INK,
            letterSpacing: -0.5,
            lineHeight: 1,
          }}>
            <div style={{ display: 'flex' }}>Mull</div>
            <div style={{ display: 'flex', color: ACC }}>.</div>
          </div>
          <div style={{
            display: 'flex',
            fontFamily: 'Inter',
            fontSize: 14,
            fontWeight: 600,
            color: ACC_DEEP,
            letterSpacing: 5,
            paddingBottom: 6,
          }}>
            ARCHETYPE
          </div>
        </div>

        {/* MAIN — two columns: figure left, hero text right */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          flex: 1,
          alignItems: 'center',
          gap: 36,
          marginTop: 8,
        }}>
          {/* Figure column */}
          {figureDataUri ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 320,
              height: 320,
              flexShrink: 0,
              background: CREAM_2,
              borderRadius: '50%',
              border: `2px solid ${ACC}`,
              padding: 28,
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={figureDataUri}
                alt=""
                width={250}
                height={250}
              />
            </div>
          ) : null}

          {/* Hero text column */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            minWidth: 0,
          }}>
            <div style={{
              display: 'flex',
              fontFamily: 'Cormorant',
              fontStyle: 'italic',
              color: ACC_DEEP,
              fontSize: 52,
              fontWeight: 500,
              lineHeight: 0.95,
            }}>
              The
            </div>
            <div style={{
              display: 'flex',
              fontFamily: 'Cormorant',
              fontSize: 132,
              fontWeight: 500,
              lineHeight: 0.95,
              letterSpacing: -3,
              color: INK,
              marginTop: 2,
            }}>
              {name}
            </div>
            <div style={{
              display: 'flex',
              fontFamily: 'Cormorant',
              fontStyle: 'italic',
              fontSize: 30,
              color: INK_SOFT,
              marginTop: 18,
              lineHeight: 1.3,
              maxWidth: 580,
            }}>
              {spirit}
            </div>
          </div>
        </div>

        {/* BOTTOM — quote epigraph + signature, divided by hairline */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 32,
          paddingTop: 18,
          marginTop: 8,
          borderTop: `1px solid ${CREAM_2}`,
        }}>
          {shortQuote ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              maxWidth: 820,
            }}>
              <div style={{
                display: 'flex',
                fontFamily: 'Cormorant',
                fontStyle: 'italic',
                fontSize: 21,
                color: INK,
                lineHeight: 1.4,
              }}>
                {`“${shortQuote}”`}
              </div>
              {quoteAttribution ? (
                <div style={{
                  display: 'flex',
                  fontFamily: 'Inter',
                  fontSize: 13,
                  color: ACC_DEEP,
                  marginTop: 5,
                  letterSpacing: 1,
                }}>
                  — {quoteAttribution}
                </div>
              ) : null}
            </div>
          ) : (
            <div style={{
              display: 'flex',
              fontFamily: 'Cormorant',
              fontStyle: 'italic',
              fontSize: 22,
              color: ACC_DEEP,
            }}>
              Find your place on the map of how you think.
            </div>
          )}
          <div style={{
            display: 'flex',
            fontFamily: 'Inter',
            fontSize: 12,
            color: ACC_DEEP,
            letterSpacing: 4,
            fontWeight: 600,
            paddingBottom: 4,
            flexShrink: 0,
          }}>
            MULL.WORLD
          </div>
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
