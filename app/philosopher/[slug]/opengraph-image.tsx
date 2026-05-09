// Per-philosopher OG card. System fonts for reliability.

import { ImageResponse } from 'next/og';
import { getPhilosopherBySlug } from '@/lib/philosophers';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Mull · Philosopher';

export default async function PhilosopherOGImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = getPhilosopherBySlug(slug);
  if (!p) return genericCard();

  const idea = p.keyIdea.length > 200
    ? p.keyIdea.slice(0, 197).trimEnd() + '…'
    : p.keyIdea;

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
            CONSTELLATION
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
            fontSize: 116,
            fontWeight: 600,
            lineHeight: 1.0,
            letterSpacing: -2,
            color: INK,
          }}>
            {p.name}
          </div>
          <div style={{
            display: 'flex',
            fontFamily: 'system-ui, sans-serif',
            fontSize: 22,
            color: ACC_DEEP,
            marginTop: 14,
            letterSpacing: 0.5,
          }}>
            {p.dates}
          </div>
          <div style={{
            display: 'flex',
            fontFamily: 'Georgia, serif',
            fontStyle: 'italic',
            marginTop: 32,
            fontSize: 30,
            color: INK_SOFT,
            lineHeight: 1.4,
            borderLeft: `4px solid ${ACC}`,
            paddingLeft: 22,
            maxWidth: 1000,
          }}>
            {idea}
          </div>
        </div>

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
            {p.archetypeName}
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
      </div>
    ),
    { ...size }
  );
}

function genericCard() {
  const CREAM = '#FAF6EC';
  const INK = '#221E18';
  const ACC = '#B8862F';
  const INK_SOFT = '#4A4338';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: CREAM,
          color: INK,
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          fontFamily: 'Georgia, serif',
          fontSize: 160,
          fontWeight: 600,
          letterSpacing: -3,
        }}>
          <div style={{ display: 'flex' }}>Mull</div>
          <div style={{ display: 'flex', color: ACC }}>.</div>
        </div>
        <div style={{
          display: 'flex',
          fontFamily: 'Georgia, serif',
          fontStyle: 'italic',
          fontSize: 32,
          color: INK_SOFT,
          marginTop: 18,
        }}>
          Find your place on the map of how you think.
        </div>
      </div>
    ),
    { ...size }
  );
}
