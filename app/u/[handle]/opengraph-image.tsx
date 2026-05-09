// Per-user OG image. 1200×630 PNG via Satori.
// Strict Satori-friendly: every <div> has explicit display, no
// mixed text + element children inside the same div.
//
// Privacy: respects show_archetype just like the page itself. If the
// user opted out, the card just shows their name + tagline.
//
// Falls back to a generic Mull card if the handle doesn't resolve.

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

  if (!profile) return genericCard();

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
          <div style={{ display: 'flex' }}>MULL · PROFILE</div>
          <div style={{ display: 'flex', color: '#221E18', letterSpacing: 0 }}>MULL.WORLD</div>
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
          <div style={{
            display: 'flex',
            fontSize: 110,
            fontWeight: 500,
            lineHeight: 1.0,
            letterSpacing: -2,
            color: '#221E18',
            maxWidth: 1056,
          }}>
            {name}
          </div>
          <div style={{
            display: 'flex',
            fontSize: 30,
            color: '#8C6520',
            marginTop: 14,
            letterSpacing: 1,
          }}>
            @{profile.handle}
          </div>

          {archetype ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                marginTop: 40,
                borderLeft: '4px solid #B8862F',
                paddingLeft: 22,
              }}
            >
              <div style={{
                display: 'flex',
                fontSize: 18,
                color: '#8C6520',
                letterSpacing: 4,
                textTransform: 'uppercase',
                fontWeight: 600,
                marginBottom: 6,
              }}>
                CURRENTLY
              </div>
              <div style={{
                display: 'flex',
                fontSize: 56,
                fontStyle: 'italic',
                color: '#221E18',
                lineHeight: 1.1,
              }}>
                {flavor ? `${flavor} ${archetype}` : archetype}
              </div>
            </div>
          ) : null}
        </div>

        <div style={{
          display: 'flex',
          fontSize: 22,
          color: '#8C6520',
          fontStyle: 'italic',
        }}>
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
