// Per-user OG image. Renders a personal "card" showing the user's
// handle, display name, and (if they've opted to show their archetype
// publicly) their current archetype. Generated on the edge so a viral
// share doesn't pile up server load.
//
// Privacy: respects show_archetype just like the page itself. If the
// user opted out, the card just says their name + "on Mull" with the
// site tagline.
//
// Falls back to a generic Mull card if the handle doesn't resolve, so
// scrapers don't break.

import { ImageResponse } from 'next/og';
import { createClient } from '@/utils/supabase/server';

export const runtime = 'nodejs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export const alt = 'Public profile on Mull';

export default async function ProfileOGImage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('public_profiles')
    .select('user_id, handle, display_name, show_archetype')
    .eq('handle', handle.toLowerCase())
    .maybeSingle<{ user_id: string; handle: string; display_name: string | null; show_archetype: boolean }>();

  // Guard: missing profile → generic Mull card.
  if (!profile) {
    return genericCard();
  }

  const name = profile.display_name || profile.handle;

  let archetype: string | null = null;
  let flavor: string | null = null;
  if (profile.show_archetype) {
    const { data: latest } = await supabase
      .rpc('get_public_latest_archetype', { p_user_id: profile.user_id });
    archetype = (latest?.[0]?.archetype as string | undefined) ?? null;
    flavor = (latest?.[0]?.flavor as string | undefined) ?? null;
  }

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
          <div>Mull · Profile</div>
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
            marginTop: 32,
          }}
        >
          <div
            style={{
              fontSize: 110,
              fontWeight: 500,
              lineHeight: 1.0,
              letterSpacing: -2,
              color: '#221E18',
              maxWidth: 1056,
              overflow: 'hidden',
            }}
          >
            {name}
          </div>
          <div
            style={{
              fontSize: 30,
              color: '#8C6520',
              marginTop: 14,
              fontFamily: '"Helvetica Neue", Arial, sans-serif',
              letterSpacing: 1,
            }}
          >
            @{profile.handle}
          </div>

          {archetype && (
            <div
              style={{
                marginTop: 40,
                display: 'flex',
                flexDirection: 'column',
                borderLeft: '4px solid #B8862F',
                paddingLeft: 22,
              }}
            >
              <div
                style={{
                  fontSize: 18,
                  color: '#8C6520',
                  letterSpacing: 4,
                  textTransform: 'uppercase',
                  fontFamily: '"Helvetica Neue", Arial, sans-serif',
                  fontWeight: 600,
                  marginBottom: 6,
                }}
              >
                Currently
              </div>
              <div
                style={{
                  fontSize: 56,
                  fontStyle: 'italic',
                  color: '#221E18',
                  lineHeight: 1.1,
                }}
              >
                {flavor ? `${flavor} ${archetype}` : archetype}
              </div>
            </div>
          )}
        </div>

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
