// Per-philosopher OG image. 1200×630 PNG via Satori.
// Strict Satori-friendly: every <div> has explicit display, no
// mixed text + element children inside the same div.

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

  const idea = p.keyIdea.length > 180
    ? p.keyIdea.slice(0, 177).trimEnd() + '…'
    : p.keyIdea;

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
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 22,
            color: '#8C6520',
            letterSpacing: 6,
            textTransform: 'uppercase',
            fontWeight: 600,
          }}
        >
          <div style={{ display: 'flex' }}>MULL · CONSTELLATION</div>
          <div style={{ display: 'flex', color: '#221E18', letterSpacing: 0 }}>MULL.WORLD</div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            flex: 1,
            marginTop: 28,
          }}
        >
          <div style={{
            display: 'flex',
            fontSize: 100,
            fontWeight: 500,
            lineHeight: 1.0,
            letterSpacing: -1.5,
            color: '#221E18',
          }}>
            {p.name}
          </div>
          <div style={{
            display: 'flex',
            fontSize: 24,
            color: '#8C6520',
            letterSpacing: 1,
            marginTop: 10,
          }}>
            {p.dates}
          </div>
          <div style={{
            display: 'flex',
            marginTop: 36,
            fontSize: 30,
            fontStyle: 'italic',
            color: '#221E18',
            lineHeight: 1.4,
            borderLeft: '4px solid #B8862F',
            paddingLeft: 22,
            maxWidth: 1000,
          }}>
            {idea}
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          fontSize: 20,
          color: '#8C6520',
          letterSpacing: 1,
        }}>
          {p.archetypeName}
        </div>
      </div>
    ),
    { ...size }
  );
}

function genericCard() {
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
          background: '#FAF6EC',
          color: '#221E18',
          fontFamily: 'Georgia, serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 140, fontWeight: 600, letterSpacing: -3 }}>
          Mull.
        </div>
        <div style={{
          display: 'flex',
          fontSize: 32,
          fontStyle: 'italic',
          color: '#4A4338',
          marginTop: 18,
        }}>
          Find your place on the map of how you think.
        </div>
      </div>
    ),
    { ...size }
  );
}
