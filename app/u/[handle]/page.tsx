import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { DIM_KEYS, DIM_NAMES, topShifts } from '@/lib/dimensions';
import { getServerLocale } from '@/lib/locale-server';
import { t } from '@/lib/translations';
import LanguageSwitcher from '@/components/language-switcher';
import type { Metadata } from 'next';

const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'Inter', system-ui, sans-serif";

type ProfileRow = {
  user_id: string;
  handle: string;
  display_name: string | null;
  bio: string | null;
  show_archetype: boolean;
  show_dimensions: boolean;
  show_map: boolean;
  show_streak: boolean;
};

type Attempt = {
  archetype: string;
  flavor: string | null;
  alignment_pct: number;
  taken_at: string;
  vector: number[];
};

type DilemmaRow = {
  id: string;
  dilemma_date: string;
  question_text: string;
  response_text: string;
  vector_delta: number[] | null;
  analysis: string | null;
  created_at: string;
};
type DiaryRow = {
  id: string;
  title: string | null;
  content: string;
  vector_delta: number[] | null;
  analysis: string | null;
  word_count: number | null;
  created_at: string;
};

function vecAdd(a: number[], b: number[]): number[] {
  return a.map((v, i) => v + (b[i] || 0));
}

// Generate per-profile share-preview metadata. Renders nicely on Twitter,
// Slack, iMessage, etc. Falls back to generic Mull description when the
// profile is missing or has chosen a low-disclosure setup.
export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params;
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('public_profiles')
    .select('user_id, handle, display_name, bio, show_archetype')
    .eq('handle', handle.toLowerCase())
    .maybeSingle<{ user_id: string; handle: string; display_name: string | null; bio: string | null; show_archetype: boolean }>();
  if (!profile) {
    return { title: 'Not found', description: 'No public profile at this handle.' };
  }
  const name = profile.display_name || profile.handle;
  let description = profile.bio || '';
  if (!description && profile.show_archetype) {
    const { data: latest } = await supabase
      .rpc('get_public_latest_archetype', { p_user_id: profile.user_id });
    const arch = (latest?.[0]?.archetype as string | undefined);
    const flavor = (latest?.[0]?.flavor as string | undefined);
    if (arch) description = `${flavor ? flavor + ' ' : ''}${arch} on Mull — find your place on the map of how you think.`;
  }
  if (!description) description = `${name} on Mull — find your place on the map of how you think.`;
  const title = `${name} on Mull`;
  const url = `https://mull.world/u/${profile.handle}`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: 'Mull',
      type: 'profile',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    alternates: { canonical: url },
  };
}

export default async function PublicProfilePage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const supabase = await createClient();
  const locale = await getServerLocale();

  const { data: profile } = await supabase
    .from('public_profiles')
    .select('user_id, handle, display_name, bio, show_archetype, show_dimensions, show_map, show_streak')
    .eq('handle', handle.toLowerCase())
    .maybeSingle<ProfileRow>();

  if (!profile) notFound();

  // Trajectory and latest archetype come from SECURITY DEFINER functions that
  // expose only vectors/timestamps (no prose) and only when the user has a
  // public profile. Per-entry text is read separately via the public is_public
  // RLS policy on dilemma_responses + diary_entries.
  const [trajRes, latestArchRes, publicDilemmasRes, publicDiariesRes] = await Promise.all([
    supabase.rpc('get_public_trajectory', { p_user_id: profile.user_id }),
    supabase.rpc('get_public_latest_archetype', { p_user_id: profile.user_id }),
    supabase
      .from('dilemma_responses')
      .select('id, dilemma_date, question_text, response_text, vector_delta, analysis, created_at')
      .eq('user_id', profile.user_id)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(5)
      .returns<DilemmaRow[]>(),
    supabase
      .from('diary_entries')
      .select('id, title, content, vector_delta, analysis, word_count, created_at')
      .eq('user_id', profile.user_id)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(5)
      .returns<DiaryRow[]>(),
  ]);

  type TrajRow = { kind: 'q' | 'd' | 'j' | 'e'; ts: string; dilemma_date: string | null; vec: number[] | null; delta: number[] | null };
  const trajRows = (trajRes.data ?? []) as TrajRow[];
  const latestArch = (latestArchRes.data?.[0] ?? null) as Attempt | null;
  const publicDilemmas = publicDilemmasRes.data ?? [];
  const publicDiaries = publicDiariesRes.data ?? [];

  // Build chronological event list (oldest → newest) for trajectory
  const events = trajRows.map(r => ({
    kind: r.kind,
    ts: new Date(r.ts).getTime(),
    vec: r.vec,
    delta: r.delta,
    dilemma_date: r.dilemma_date,
  })).sort((a, b) => a.ts - b.ts);

  // Walk events, accumulating position; collect positions for trail
  const trailPositions: number[][] = [];
  let position: number[] = new Array(16).fill(0);
  for (const ev of events) {
    if (ev.kind === 'q' && Array.isArray(ev.vec) && ev.vec.length === 16) {
      position = ev.vec.slice();
    } else if (Array.isArray(ev.delta) && ev.delta.length === 16) {
      position = vecAdd(position, ev.delta);
    }
    trailPositions.push(position.slice());
  }
  const trailVectors = trailPositions.slice(-10);

  function computeStreak(dates: string[]): number {
    if (!dates.length) return 0;
    const set = new Set(dates);
    const today = new Date(); today.setUTCHours(0, 0, 0, 0);
    let streak = 0;
    const cursor = new Date(today);
    if (!set.has(cursor.toISOString().slice(0, 10))) {
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    }
    while (set.has(cursor.toISOString().slice(0, 10))) {
      streak++;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    }
    return streak;
  }
  const dilemmaDates = events.filter(e => e.kind === 'd' && e.dilemma_date).map(e => e.dilemma_date as string);
  const streak = computeStreak(dilemmaDates);
  const latest = latestArch;

  const topDims = position
    .map((v, i) => ({ key: DIM_KEYS[i], name: DIM_NAMES[DIM_KEYS[i]], v }))
    .sort((a, b) => b.v - a.v)
    .slice(0, 5);

  const hasMapData = profile.show_map && position.some(v => v !== 0);
  const encodedVec = hasMapData
    ? encodeURIComponent(Buffer.from(JSON.stringify(position)).toString('base64'))
    : null;
  const encodedHist = hasMapData && trailVectors.length > 1
    ? encodeURIComponent(Buffer.from(JSON.stringify(trailVectors)).toString('base64'))
    : null;
  const iframeSrc = encodedVec
    ? `/?embed=map&v=${encodedVec}${encodedHist ? `&h=${encodedHist}` : ''}`
    : null;

  const headline = profile.show_archetype && latest
    ? `${latest.flavor ? latest.flavor + ' ' : ''}${latest.archetype.replace(/^The /, '')}`
    : t('pub.anonymous_mind', locale);

  const displayName = profile.display_name || profile.handle;

  const fmtDate = (s: string) =>
    new Date(s).toLocaleDateString(locale === 'en' ? 'en-GB' : locale, { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '60px 24px 100px' }}>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 36,
        gap: 16,
        flexWrap: 'wrap',
      }}>
        <Link href="/" style={{
          fontFamily: serif,
          fontSize: 28,
          fontWeight: 500,
          color: '#221E18',
          textDecoration: 'none',
          letterSpacing: '-0.5px'
        }}>
          Mull<span style={{ color: '#B8862F' }}>.</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <LanguageSwitcher initial={locale} />
          <Link href="/" style={{ fontFamily: sans, fontSize: 13, color: '#4A4338', textDecoration: 'none' }}>
            {t('nav.find_your_place', locale)}
          </Link>
        </div>
      </header>

      <div style={{
        fontFamily: sans,
        fontSize: 11,
        fontWeight: 600,
        color: '#8C6520',
        textTransform: 'uppercase',
        letterSpacing: '0.18em',
        marginBottom: 14,
      }}>
        @{profile.handle}
      </div>

      <h1 style={{
        fontFamily: serif,
        fontSize: 44,
        fontWeight: 500,
        margin: '0 0 6px',
        letterSpacing: '-0.01em',
        lineHeight: 1.1,
      }}>
        {displayName}
      </h1>

      {profile.show_archetype && latest && (
        <p style={{
          fontFamily: serif,
          fontStyle: 'italic',
          fontSize: 22,
          color: '#8C6520',
          margin: '0 0 18px',
        }}>
          {headline} · <span style={{ fontStyle: 'normal', fontSize: 16, color: '#8C6520' }}>{latest.alignment_pct}{t('account.percent_alignment', locale)}</span>
        </p>
      )}

      {profile.bio && (
        <p style={{
          fontFamily: serif,
          fontSize: 18,
          color: '#221E18',
          margin: '0 0 32px',
          lineHeight: 1.55,
          maxWidth: 560,
        }}>
          {profile.bio}
        </p>
      )}

      {profile.show_streak && streak > 0 && (
        <div style={{
          display: 'inline-block',
          padding: '8px 16px',
          background: '#221E18',
          color: '#FAF6EC',
          borderRadius: 999,
          fontFamily: sans,
          fontSize: 13,
          marginBottom: 32,
        }}>
          {t('pub.streak_emoji', locale, { n: streak })}
        </div>
      )}

      {iframeSrc && (
        <section style={{ marginBottom: 40 }}>
          <h2 style={{
            fontFamily: serif,
            fontStyle: 'italic',
            fontSize: 22,
            fontWeight: 500,
            color: '#4A4338',
            margin: '0 0 12px',
          }}>
            {t('pub.their_place', locale)}
          </h2>
          <div style={{
            border: '1px solid #D6CDB6',
            borderRadius: 12,
            overflow: 'hidden',
            background: '#FFFCF4',
          }}>
            <iframe
              src={iframeSrc}
              style={{
                width: '100%',
                height: 480,
                border: 'none',
                display: 'block',
              }}
              title={`${displayName}'s position on the philosophical map`}
              loading="lazy"
            />
          </div>
          {trailVectors.length > 1 && (
            <p style={{
              fontFamily: sans,
              fontSize: 12,
              color: '#8C6520',
              marginTop: 8,
              opacity: 0.75,
            }}>
              {t('pub.trail_caption', locale, { count: trailVectors.length })}
            </p>
          )}
        </section>
      )}

      {profile.show_dimensions && topDims.some(d => d.v > 0) && (
        <section style={{ marginBottom: 40 }}>
          <h2 style={{
            fontFamily: serif,
            fontStyle: 'italic',
            fontSize: 22,
            fontWeight: 500,
            color: '#4A4338',
            margin: '0 0 14px',
          }}>
            {t('pub.strongest_tendencies', locale)}
          </h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {topDims.map(d => (
              <li key={d.key} style={{
                display: 'grid',
                gridTemplateColumns: '180px 1fr 50px',
                gap: 12,
                alignItems: 'center',
                fontFamily: sans,
                fontSize: 14,
                color: '#221E18',
              }}>
                <span>{d.name}</span>
                <div style={{
                  height: 6,
                  background: '#EBE3CA',
                  borderRadius: 3,
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.max(0, Math.min(100, (d.v / 12) * 100))}%`,
                    background: '#B8862F',
                  }} />
                </div>
                <span style={{
                  fontVariantNumeric: 'tabular-nums',
                  color: '#8C6520',
                  textAlign: 'right',
                }}>
                  {d.v.toFixed(1)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {publicDilemmas.length > 0 && (
        <section style={{ marginBottom: 40 }}>
          <h2 style={{
            fontFamily: serif,
            fontStyle: 'italic',
            fontSize: 22,
            fontWeight: 500,
            color: '#4A4338',
            margin: '0 0 14px',
          }}>
            Recent dilemma responses · last {publicDilemmas.length}
          </h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {publicDilemmas.map(d => {
              const shifts = topShifts(d.vector_delta || [], 0.3, 3);
              return (
                <li key={d.id} style={{
                  padding: '18px 22px',
                  background: '#FFFCF4',
                  border: '1px solid #EBE3CA',
                  borderLeft: '3px solid #3D7DA8',
                  borderRadius: 8,
                }}>
                  <div style={{
                    fontFamily: sans,
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#1F4666',
                    textTransform: 'uppercase',
                    letterSpacing: '0.14em',
                    marginBottom: 8,
                  }}>
                    Daily dilemma · {fmtDate(d.created_at)}
                  </div>
                  <p style={{
                    fontFamily: serif,
                    fontStyle: 'italic',
                    fontSize: 16,
                    color: '#4A4338',
                    margin: '0 0 8px',
                  }}>
                    "{d.question_text}"
                  </p>
                  <p style={{
                    fontFamily: serif,
                    fontSize: 16,
                    color: '#221E18',
                    margin: '0 0 8px',
                    lineHeight: 1.55,
                    whiteSpace: 'pre-wrap',
                  }}>
                    {d.response_text}
                  </p>
                  {d.analysis && (
                    <p style={{
                      fontFamily: serif,
                      fontStyle: 'italic',
                      fontSize: 14,
                      color: '#8C6520',
                      margin: '0 0 8px',
                      lineHeight: 1.5,
                    }}>
                      {d.analysis}
                    </p>
                  )}
                  {shifts.length > 0 && (
                    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 6 }}>
                      {shifts.map(s => (
                        <span key={s.key} style={{
                          fontFamily: sans,
                          fontSize: 12.5,
                          color: s.delta > 0 ? '#2F5D5C' : '#7A2E2E',
                        }}>
                          <strong style={{ fontVariantNumeric: 'tabular-nums' }}>
                            {s.delta > 0 ? '+' : ''}{s.delta.toFixed(1)}
                          </strong>{' '}
                          <span style={{ color: '#4A4338' }}>{s.name}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {publicDiaries.length > 0 && (
        <section style={{ marginBottom: 40 }}>
          <h2 style={{
            fontFamily: serif,
            fontStyle: 'italic',
            fontSize: 22,
            fontWeight: 500,
            color: '#4A4338',
            margin: '0 0 14px',
          }}>
            Recent diary entries · last {publicDiaries.length}
          </h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {publicDiaries.map(d => {
              const shifts = topShifts(d.vector_delta || [], 0.3, 3);
              const preview = d.content.length > 320 ? d.content.slice(0, 320) + '…' : d.content;
              return (
                <li key={d.id} style={{
                  padding: '18px 22px',
                  background: '#FFFCF4',
                  border: '1px solid #EBE3CA',
                  borderLeft: '3px solid #2F5D5C',
                  borderRadius: 8,
                }}>
                  <div style={{
                    fontFamily: sans,
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#173533',
                    textTransform: 'uppercase',
                    letterSpacing: '0.14em',
                    marginBottom: 8,
                  }}>
                    Diary entry · {fmtDate(d.created_at)}
                  </div>
                  {d.title && (
                    <div style={{
                      fontFamily: serif,
                      fontSize: 19,
                      fontWeight: 500,
                      color: '#221E18',
                      marginBottom: 6,
                    }}>
                      {d.title}
                    </div>
                  )}
                  <p style={{
                    fontFamily: serif,
                    fontSize: 16,
                    color: '#221E18',
                    margin: '0 0 8px',
                    lineHeight: 1.55,
                    whiteSpace: 'pre-wrap',
                  }}>
                    {preview}
                  </p>
                  {d.analysis && (
                    <p style={{
                      fontFamily: serif,
                      fontStyle: 'italic',
                      fontSize: 14,
                      color: '#8C6520',
                      margin: '0 0 8px',
                      lineHeight: 1.5,
                    }}>
                      {d.analysis}
                    </p>
                  )}
                  {shifts.length > 0 && (
                    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 6 }}>
                      {shifts.map(s => (
                        <span key={s.key} style={{
                          fontFamily: sans,
                          fontSize: 12.5,
                          color: s.delta > 0 ? '#2F5D5C' : '#7A2E2E',
                        }}>
                          <strong style={{ fontVariantNumeric: 'tabular-nums' }}>
                            {s.delta > 0 ? '+' : ''}{s.delta.toFixed(1)}
                          </strong>{' '}
                          <span style={{ color: '#4A4338' }}>{s.name}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <div style={{
        marginTop: 56,
        padding: '20px 24px',
        background: '#F5EFDC',
        borderLeft: '3px solid #B8862F',
        borderRadius: 8,
        fontFamily: sans,
        fontSize: 13.5,
        color: '#4A4338',
        lineHeight: 1.55,
      }}>
        <strong style={{ color: '#221E18' }}>{t('pub.cta_title', locale)}</strong> {t('pub.cta_body', locale)}{' '}
        <Link href="/" style={{ color: '#8C6520', textDecoration: 'underline' }}>{t('pub.cta_link', locale)}</Link>
      </div>
    </main>
  );
}
