// Per-user OG card. Same book-jacket aesthetic as the archetype +
// philosopher cards. Privacy: respects show_archetype.

import { ImageResponse } from 'next/og';
import { createClient } from '@/utils/supabase/server';
import { loadOGFonts } from '@/lib/og-fonts';

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
  const fonts = await loadOGFonts();

  const { data: profile } = await supabase
    .from('public_profiles')
    .select('user_id, handle, display_name, show_archetype')
    .eq('handle', handle.toLowerCase())
    .maybeSingle<{ user_id: string; handle: string; display_name: string | null; show_archetype: boolean }>();

  if (!profile) return genericCard(fonts);

  const name = profile.display_name || profile.handle;

  let archetype: string | null = null;
  let flavor: string | null = null;
  if (profile.show_archetype) {
    const { data: latest } = await supabase
      .rpc('get_public_latest_archetype', { p_user_id: profile.user_id });
    archetype = (latest?.[0]?.archetype as string | undefined) ?? null;
    flavor = (latest?.[0]?.flavor as string | undefined) ?? null;
  }

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
          <div style={{
            display: 'flex',
            fontFamily: 'Inter, sans-serif',
            fontSize: 16,
            fontWeight: 600,
            color: ACC_DEEP,
            letterSpacing: 5,
            paddingBottom: 8,
          }}>
            PROFILE
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
            fontFamily: 'Cormorant, Georgia, serif',
            fontSize: 116,
            fontWeight: 500,
            lineHeight: 1.0,
            letterSpacing: -2,
            color: INK,
            maxWidth: 1056,
          }}>
            {name}
          </div>
          <div style={{
            display: 'flex',
            fontFamily: 'Inter, sans-serif',
            fontSize: 24,
            color: ACC_DEEP,
            marginTop: 10,
            letterSpacing: 0.5,
          }}>
            @{profile.handle}
          </div>

          {archetype ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              marginTop: 36,
              borderLeft: `4px solid ${ACC}`,
              paddingLeft: 22,
            }}>
              <div style={{
                display: 'flex',
                fontFamily: 'Inter, sans-serif',
                fontSize: 14,
                color: ACC_DEEP,
                letterSpacing: 4,
                fontWeight: 600,
                marginBottom: 8,
              }}>
                CURRENTLY
              </div>
              <div style={{
                display: 'flex',
                fontFamily: 'Cormorant, Georgia, serif',
                fontStyle: 'italic',
                fontSize: 56,
                color: INK,
                lineHeight: 1.1,
              }}>
                {flavor ? `${flavor} ${archetype}` : archetype}
              </div>
            </div>
          ) : null}
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
            fontFamily: 'Cormorant, Georgia, serif',
            fontStyle: 'italic',
            fontSize: 22,
            color: INK_SOFT,
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
      </div>
    ),
    { ...size, fonts }
  );
}

function genericCard(fonts: Awaited<ReturnType<typeof loadOGFonts>>) {
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
          fontFamily: 'Cormorant, Georgia, serif',
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          fontSize: 160,
          fontWeight: 500,
          letterSpacing: -3,
        }}>
          <div style={{ display: 'flex' }}>Mull</div>
          <div style={{ display: 'flex', color: ACC }}>.</div>
        </div>
        <div style={{
          display: 'flex',
          fontStyle: 'italic',
          fontSize: 32,
          color: INK_SOFT,
          marginTop: 18,
        }}>
          Find your place on the map of how you think.
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
