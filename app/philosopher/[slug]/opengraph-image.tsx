// Per-philosopher OG image, 1200×630, served at
// /philosopher/[slug]/opengraph-image. Generated on the edge.
//
// Layout: name + dates + key idea, with a small "MULL · Constellation"
// eyebrow and the archetype label as a footer signature. Designed to
// look like a clean book-jacket card so the share looks substantial.

import { ImageResponse } from 'next/og';
import { getPhilosopherBySlug, philosopherSlugs } from '@/lib/philosophers';

// Node runtime (default) — Next 16 doesn't allow `runtime = 'edge'`
// alongside generateImageMetadata, and we want the OG images
// statically prerendered so crawlers fetching share previews don't
// pay Satori cold-start latency.
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export function generateImageMetadata() {
  return philosopherSlugs().map(slug => ({
    id: slug,
    contentType: 'image/png',
    size: { width: 1200, height: 630 },
    alt: `${slug} — Mull`,
  }));
}

export default async function PhilosopherOGImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = getPhilosopherBySlug(slug);
  if (!p) return genericCard();

  // Trim aggressively for the visible area.
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
          fontFamily: 'Georgia, "Cormorant Garamond", serif',
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
            fontFamily: '"Helvetica Neue", Arial, sans-serif',
            fontWeight: 600,
          }}
        >
          <div>Mull · Constellation</div>
          <div style={{ color: '#221E18', letterSpacing: 0 }}>
            mull<span style={{ color: '#B8862F' }}>.</span>world
          </div>
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
          <div
            style={{
              fontSize: 100,
              fontWeight: 500,
              lineHeight: 1.0,
              letterSpacing: -1.5,
              color: '#221E18',
            }}
          >
            {p.name}
          </div>
          <div
            style={{
              fontSize: 24,
              color: '#8C6520',
              fontFamily: '"Helvetica Neue", Arial, sans-serif',
              letterSpacing: 1,
              marginTop: 10,
            }}
          >
            {p.dates}
          </div>
          <div
            style={{
              marginTop: 36,
              fontSize: 30,
              fontStyle: 'italic',
              color: '#221E18',
              lineHeight: 1.4,
              borderLeft: '4px solid #B8862F',
              paddingLeft: 22,
              maxWidth: 1000,
            }}
          >
            {idea}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: 20,
            color: '#8C6520',
            fontFamily: '"Helvetica Neue", Arial, sans-serif',
            letterSpacing: 1,
          }}
        >
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
        <div style={{ fontSize: 140, fontWeight: 600, letterSpacing: -3 }}>
          Mull<span style={{ color: '#B8862F' }}>.</span>
        </div>
        <div style={{ fontSize: 32, fontStyle: 'italic', color: '#4A4338', marginTop: 18 }}>
          Find your place on the map of how you think.
        </div>
      </div>
    ),
    { ...size }
  );
}
