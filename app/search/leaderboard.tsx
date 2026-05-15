// Activity leaderboard — top searchable users ranked by total entries
// (dilemmas + diary + exercise reflections). Server component; calls the
// `get_activity_leaderboard` RPC defined in
// supabase/migrations/20260512_activity_leaderboard.sql.
//
// Each row is clickable and links to /u/<handle>. Privacy: respects the
// per-field show_archetype / show_streak flags on public_profiles. The
// counts themselves are aggregate numbers and are always shown for users
// who've already opted in to being searchable.
//
// When the forum lands, this same surface will get a sibling tab ranking
// users by upvote/downvote received on forum posts (see TODO #38).

import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { FIGURES } from '@/lib/figures';
import { ARCHETYPES } from '@/lib/archetypes';
import { t, type Locale } from '@/lib/translations';

const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'Inter', system-ui, sans-serif";

type LeaderRow = {
  handle: string;
  display_name: string | null;
  show_archetype: boolean;
  show_streak: boolean;
  archetype: string | null;
  dilemma_count: number;
  diary_count: number;
  exercise_count: number;
  total_count: number;
  streak: number;
  last_activity: string | null;
};

// Map an English archetype name (as stored in quiz_attempts) to a slug used
// in lib/archetypes.ts and lib/figures.ts. The names there are like
// "The Cartographer"; the slugs are lowercase like "cartographer".
function archetypeNameToSlug(name: string | null): string | null {
  if (!name) return null;
  const cleaned = name.replace(/^The\s+/i, '').trim().toLowerCase();
  // Match against known archetype keys.
  return ARCHETYPES.find(a => a.key === cleaned)?.key ?? null;
}

export default async function Leaderboard({ locale = 'en' as Locale }: { locale?: Locale }) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc('get_activity_leaderboard', { limit_n: 25 });

  if (error) {
    console.error('[leaderboard] RPC failed:', error);
    return (
      <section style={sectionStyle}>
        <h2 style={headingStyle}>{t('leaderboard.title', locale)}</h2>
        <p style={{
          fontFamily: sans, fontSize: 14, color: '#8C6520',
          fontStyle: 'italic', margin: 0,
        }}>
          {t('leaderboard.unavailable', locale)}
        </p>
      </section>
    );
  }

  const rows = (data || []) as LeaderRow[];

  return (
    <section style={sectionStyle}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'baseline', marginBottom: 8, flexWrap: 'wrap', gap: 8,
      }}>
        <h2 style={headingStyle}>{t('leaderboard.title', locale)}</h2>
        <span style={{
          fontFamily: sans, fontSize: 11, fontWeight: 600,
          color: '#8C6520', textTransform: 'uppercase',
          letterSpacing: '0.16em',
        }}>
          {t('leaderboard.eyebrow_activity', locale)}
        </span>
      </div>
      <p style={{
        fontFamily: serif, fontStyle: 'italic',
        fontSize: 16, color: '#4A4338',
        margin: '0 0 18px', lineHeight: 1.55,
      }}>
        {t('leaderboard.subtitle', locale)}
      </p>

      {rows.length === 0 ? (
        <p style={{
          fontFamily: sans, fontSize: 14, color: '#8C6520',
          fontStyle: 'italic', padding: '16px 18px',
          background: '#FFFCF4', border: '1px dashed #D6CDB6',
          borderRadius: 8, margin: 0,
        }}>
          {t('leaderboard.empty', locale)}
        </p>
      ) : (
        <ol style={{
          listStyle: 'none', padding: 0, margin: 0,
          display: 'grid', gap: 8,
        }}>
          {rows.map((row, i) => {
            const rank = i + 1;
            const archSlug = archetypeNameToSlug(row.archetype);
            const figure = (row.show_archetype && archSlug && FIGURES[archSlug]) || '';
            const showName = row.display_name || `@${row.handle}`;

            return (
              <li key={row.handle}>
                <Link
                  href={`/u/${row.handle}`}
                  className="pixel-press"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'auto auto 1fr auto',
                    alignItems: 'center',
                    gap: 14,
                    padding: '12px 16px',
                    background: rank <= 3 ? '#F8EDC8' : '#FFFCF4',
                    border: '3px solid #221E18',
                    boxShadow: rank === 1
                      ? '3px 3px 0 0 #B8862F'
                      : rank <= 3
                        ? '3px 3px 0 0 #8C6520'
                        : '3px 3px 0 0 #D6CDB6',
                    borderRadius: 0,
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end)',
                  }}
                >
                  {/* Rank number */}
                  <span style={{
                    fontFamily: serif,
                    fontSize: 20,
                    fontWeight: 500,
                    color: rank === 1 ? '#B8862F' : rank <= 3 ? '#8C6520' : '#A39880',
                    fontVariantNumeric: 'tabular-nums',
                    minWidth: 28,
                    textAlign: 'right',
                  }}>
                    {rank}
                  </span>

                  {/* Archetype figure (if shown) */}
                  <span
                    aria-hidden
                    style={{
                      width: 36, height: 36,
                      display: 'inline-block',
                      flexShrink: 0,
                      // If show_archetype is off OR they haven't taken the
                      // quiz, render a quiet placeholder dot.
                      background: figure ? 'transparent' : '#F5EFDC',
                      borderRadius: 999,
                    }}
                    dangerouslySetInnerHTML={figure ? { __html: figure } : undefined}
                  />

                  {/* Name + handle + meta */}
                  <span style={{ minWidth: 0, overflow: 'hidden' }}>
                    <span style={{
                      display: 'block',
                      fontFamily: serif, fontSize: 17, fontWeight: 500,
                      color: '#221E18', lineHeight: 1.25,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {showName}
                    </span>
                    <span style={{
                      display: 'block',
                      fontFamily: sans, fontSize: 12,
                      color: '#8C6520', letterSpacing: 0.2,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      @{row.handle}
                      {row.show_archetype && row.archetype && (
                        <> · {row.archetype}</>
                      )}
                      {row.show_streak && row.streak > 0 && (
                        <> · {t('leaderboard.streak', locale, { n: row.streak })}</>
                      )}
                    </span>
                  </span>

                  {/* Counts */}
                  <span style={{
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'flex-end',
                    fontFamily: sans, lineHeight: 1.2,
                  }}>
                    <span style={{
                      fontSize: 18, fontWeight: 600,
                      color: '#221E18',
                      fontVariantNumeric: 'tabular-nums',
                    }}>
                      {row.total_count}
                    </span>
                    <span style={{
                      fontSize: 10, color: '#8C6520',
                      textTransform: 'uppercase', letterSpacing: '0.14em',
                      marginTop: 2,
                    }}>
                      {t('leaderboard.entries', locale)}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      )}

      <p style={{
        marginTop: 14,
        fontFamily: sans, fontSize: 12,
        color: '#8C6520', opacity: 0.75, lineHeight: 1.55,
      }}>
        {t('leaderboard.privacy_note', locale)}
      </p>
    </section>
  );
}

const sectionStyle: React.CSSProperties = {
  marginBottom: 48,
};

const headingStyle: React.CSSProperties = {
  // Pixel-display heading for v3 — large, hard amber drop shadow.
  fontFamily: 'var(--font-pixel-display, "Courier New", monospace)',
  fontSize: 22,
  fontWeight: 400,
  margin: 0,
  color: '#221E18',
  letterSpacing: '0.04em',
  textShadow: '3px 3px 0 #B8862F',
  lineHeight: 1.1,
};
