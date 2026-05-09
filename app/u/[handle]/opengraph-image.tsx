// Per-user OG card. Same book-jacket aesthetic as the archetype +
// philosopher cards. Privacy: archetype + figure only show if the
// user opted into show_archetype on their public profile.

import { ImageResponse } from 'next/og';
import { createClient } from '@/utils/supabase/server';
import { FIGURES } from '@/lib/figures';
import { ARCHETYPES } from '@/lib/archetypes';
import { loadOGFonts, svgToDataUri } from '@/lib/og-fonts';

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
  let archetypeKey: string | null = null;
  if (profile.show_archetype) {
    const { data: latest } = await supabase
      .rpc('get_public_latest_archetype', { p_user_id: profile.user_id });
    archetype = (latest?.[0]?.archetype as string | undefined) ?? null;
    flavor = (latest?.[0]?.flavor as string | undefined) ?? null;
    if (archetype) {
      const cleaned = archetype.replace(/^The\s+/i, '').toLowerCase();
      const match = ARCHETYPES.find(a => a.key === cleaned);
      archetypeKey = match?.key ?? null;
    }
  }
  const figureSvg = archetypeKey ? FIGURES[archetypeKey] : null;
  const figureDataUri = figureSvg ? svgToDataUri(figureSvg) : null;

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
        <div style={{
          display: 'flex',
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: 6,
          background: ACC,
        }} />
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
            PROFILE
          </div>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'row',
          flex: 1,
          alignItems: 'center',
          gap: 36,
          marginTop: 8,
        }}>
          {figureDataUri ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 230,
              height: 230,
              flexShrink: 0,
              background: CREAM_2,
              borderRadius: '50%',
              border: `2px solid ${ACC}`,
              padding: 22,
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={figureDataUri} alt="" width={180} height={180} />
            </div>
          ) : null}

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            minWidth: 0,
          }}>
            <div style={{
              display: 'flex',
              fontFamily: 'Cormorant',
              fontSize: 100,
              fontWeight: 500,
              lineHeight: 0.95,
              letterSpacing: -2,
              color: INK,
              maxWidth: 800,
            }}>
              {name}
            </div>
            <div style={{
              display: 'flex',
              fontFamily: 'Inter',
              fontSize: 22,
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
                marginTop: 24,
                borderLeft: `4px solid ${ACC}`,
                paddingLeft: 18,
              }}>
                <div style={{
                  display: 'flex',
                  fontFamily: 'Inter',
                  fontSize: 13,
                  color: ACC_DEEP,
                  letterSpacing: 4,
                  fontWeight: 600,
                  marginBottom: 6,
                }}>
                  CURRENTLY
                </div>
                <div style={{
                  display: 'flex',
                  fontFamily: 'Cormorant',
                  fontStyle: 'italic',
                  fontSize: 44,
                  color: INK,
                  lineHeight: 1.1,
                }}>
                  {flavor ? `${flavor} ${archetype}` : archetype}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: 18,
          marginTop: 8,
          borderTop: `1px solid ${CREAM_2}`,
        }}>
          <div style={{
            display: 'flex',
            fontFamily: 'Cormorant',
            fontStyle: 'italic',
            fontSize: 22,
            color: INK_SOFT,
          }}>
            Find your place on the map of how you think.
          </div>
          <div style={{
            display: 'flex',
            fontFamily: 'Inter',
            fontSize: 12,
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
          width: '100%', height: '100%',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: CREAM, color: INK,
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'baseline',
          fontFamily: 'Cormorant',
          fontSize: 160, fontWeight: 500, letterSpacing: -3,
        }}>
          <div style={{ display: 'flex' }}>Mull</div>
          <div style={{ display: 'flex', color: ACC }}>.</div>
        </div>
        <div style={{
          display: 'flex',
          fontFamily: 'Cormorant',
          fontStyle: 'italic',
          fontSize: 30, color: INK_SOFT, marginTop: 18,
        }}>
          Find your place on the map of how you think.
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
