// Progression panel — renders the user's milestones (with progress bars)
// and badges (earned + a few near-miss previews) on /account.
//
// Server component: takes a UserStats snapshot and renders. The snapshot
// is computed once per page render in the parent (lib/profile-progression
// .computeUserStats), so this component does no I/O.
//
// v3 pixel chrome: badges + milestones are tiny dialog-windows with
// chunky 3px ink borders + hard amber drop-shadows. Earned items get
// a brighter shadow color; pending items use the muted line color.
// The progress bar is a chunky 6px segmented bar (no smooth transition).

import { MILESTONES, MILESTONE_TRACK_META, type MilestoneTrack } from '@/lib/milestones';
import { BADGES, partitionBadges } from '@/lib/badges';
import type { UserStats } from '@/lib/profile-progression';
import { t, type Locale } from '@/lib/translations';

const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'Inter', system-ui, sans-serif";
const pixel = "var(--font-pixel-display, 'Courier New', monospace)";

export default function ProgressionPanel({
  stats,
  locale = 'en' as Locale,
}: {
  stats: UserStats;
  locale?: Locale;
}) {
  const { earned, unearned } = partitionBadges(stats);

  // Group milestones by track so they render in clusters.
  const byTrack: Record<MilestoneTrack, typeof MILESTONES> = {
    reflection: [], practice: [], diary: [], constellation: [], consistency: [],
  };
  for (const m of MILESTONES) byTrack[m.track].push(m);

  // For each milestone compute progress + earned status.
  const compute = (m: typeof MILESTONES[number]) => {
    const current = m.metric(stats);
    const ratio = Math.min(1, current / m.target);
    return { current, ratio, done: current >= m.target };
  };

  // Earned-milestone count for the headline.
  const earnedMilestones = MILESTONES.filter(m => m.metric(stats) >= m.target).length;

  // Choose 3 unearned badges closest to being earned (heuristic: the ones
  // whose underlying numbers are closest to the threshold). For now,
  // show a fixed-order subset.
  const previewUnearned = unearned.slice(0, 3);

  return (
    <section style={{ marginTop: 48, marginBottom: 48 }}>
      <header style={{ marginBottom: 22 }}>
        <h2 style={{
          fontFamily: pixel, fontSize: 22,
          margin: 0, color: '#221E18', letterSpacing: '0.06em',
          textTransform: 'uppercase',
          textShadow: '3px 3px 0 #B8862F',
        }}>
          ▸ {t('progression.title', locale).toUpperCase()}
        </h2>
        <p style={{
          fontFamily: serif, fontStyle: 'italic',
          fontSize: 15, color: '#4A4338',
          margin: '12px 0 0', lineHeight: 1.55,
        }}>
          {t('progression.subtitle', locale, {
            earned: earnedMilestones,
            total: MILESTONES.length,
            badges: earned.length,
            badgeTotal: BADGES.length,
          })}
        </p>
      </header>

      {/* Earned badges */}
      <div style={{ marginBottom: 32 }}>
        <h3 style={subhead}>▸ {t('progression.badges_earned', locale).toUpperCase()}</h3>
        {earned.length > 0 ? (
          <ul style={{
            listStyle: 'none', padding: 0, margin: 0,
            display: 'grid', gap: 12,
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          }}>
            {earned.map(b => (
              <li key={b.key} style={{
                display: 'flex', alignItems: 'flex-start', gap: 12,
                padding: '12px 14px',
                background: '#F8EDC8',
                border: '3px solid #221E18',
                boxShadow: '3px 3px 0 0 #B8862F',
                borderRadius: 0,
              }}>
                <span aria-hidden style={{
                  fontFamily: serif, fontSize: 26,
                  color: '#8C6520', lineHeight: 1, flexShrink: 0,
                  minWidth: 28, textAlign: 'center',
                }}>
                  {b.glyph}
                </span>
                <span>
                  <strong style={{
                    display: 'block', color: '#221E18',
                    fontFamily: serif, fontSize: 16, fontWeight: 500,
                    marginBottom: 2,
                  }}>
                    {b.name}
                  </strong>
                  <span style={{
                    display: 'block', fontFamily: sans, fontSize: 12.5,
                    color: '#4A4338', lineHeight: 1.4,
                  }}>
                    {b.description}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p style={emptyState}>{t('progression.no_badges_yet', locale)}</p>
        )}

        {previewUnearned.length > 0 && (
          <details style={{ marginTop: 16 }}>
            <summary style={{
              cursor: 'pointer', fontFamily: pixel, fontSize: 12,
              color: '#8C6520', letterSpacing: 0.4,
              textTransform: 'uppercase',
            }}>
              {t('progression.show_unearned', locale, { n: unearned.length })}
            </summary>
            <ul style={{
              listStyle: 'none', padding: 0, margin: '12px 0 0',
              display: 'grid', gap: 8,
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              opacity: 0.7,
            }}>
              {previewUnearned.map(b => (
                <li key={b.key} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                  padding: '10px 14px',
                  background: '#FFFCF4',
                  border: '2px dashed #8C6520',
                  borderRadius: 0,
                }}>
                  <span aria-hidden style={{
                    fontFamily: serif, fontSize: 22,
                    color: '#A39880', lineHeight: 1, flexShrink: 0,
                    minWidth: 28, textAlign: 'center',
                  }}>
                    {b.glyph}
                  </span>
                  <span>
                    <strong style={{
                      display: 'block', color: '#4A4338',
                      fontFamily: serif, fontSize: 15, fontWeight: 500,
                      marginBottom: 2,
                    }}>
                      {b.name}
                    </strong>
                    <span style={{
                      display: 'block', fontFamily: sans, fontSize: 12,
                      color: '#8C6520', lineHeight: 1.4, fontStyle: 'italic',
                    }}>
                      {b.description}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>

      {/* Milestones grouped by track */}
      <div>
        <h3 style={subhead}>▸ {t('progression.milestones', locale).toUpperCase()}</h3>
        <div style={{ display: 'grid', gap: 24 }}>
          {(Object.keys(byTrack) as MilestoneTrack[]).map(track => {
            const meta = MILESTONE_TRACK_META[track];
            const items = byTrack[track];
            return (
              <div key={track}>
                <div style={{
                  display: 'flex', alignItems: 'baseline',
                  justifyContent: 'space-between', gap: 8,
                  marginBottom: 8,
                }}>
                  <h4 style={{
                    fontFamily: serif, fontSize: 17, fontWeight: 500,
                    color: '#221E18', margin: 0,
                  }}>
                    {meta.label}
                  </h4>
                  <span style={{
                    fontFamily: pixel, fontSize: 11,
                    color: meta.accent, textTransform: 'uppercase',
                    letterSpacing: 0.4,
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    {items.filter(m => compute(m).done).length} / {items.length}
                  </span>
                </div>
                <p style={{
                  fontFamily: sans, fontSize: 13, color: '#8C6520',
                  margin: '0 0 12px', opacity: 0.85, lineHeight: 1.5,
                }}>
                  {meta.blurb}
                </p>
                <ul style={{
                  listStyle: 'none', padding: 0, margin: 0,
                  display: 'grid', gap: 10,
                }}>
                  {items.map(m => {
                    const { current, ratio, done } = compute(m);
                    return (
                      <li key={m.key} style={{
                        padding: '12px 14px',
                        background: done ? '#F8EDC8' : '#FFFCF4',
                        border: '3px solid #221E18',
                        boxShadow: done
                          ? `3px 3px 0 0 ${meta.accent}`
                          : '3px 3px 0 0 #D6CDB6',
                        borderRadius: 0,
                      }}>
                        <div style={{
                          display: 'flex', justifyContent: 'space-between',
                          alignItems: 'baseline', gap: 12,
                          marginBottom: 6, flexWrap: 'wrap',
                        }}>
                          <span style={{
                            fontFamily: serif, fontSize: 15.5,
                            color: '#221E18', fontWeight: 500,
                          }}>
                            {done ? '✓ ' : ''}{m.name}
                          </span>
                          <span style={{
                            fontFamily: pixel, fontSize: 11,
                            color: done ? meta.accent : '#8C6520',
                            fontVariantNumeric: 'tabular-nums',
                            letterSpacing: 0.4,
                          }}>
                            {current} / {m.target}
                          </span>
                        </div>
                        <p style={{
                          fontFamily: sans, fontSize: 13,
                          color: '#4A4338', lineHeight: 1.5,
                          margin: '0 0 10px',
                        }}>
                          {m.description}
                        </p>
                        {/* Pixel progress bar — segmented look via stepped width */}
                        <div style={{
                          height: 8, background: '#FAF6EC',
                          border: '2px solid #221E18',
                          borderRadius: 0, overflow: 'hidden',
                        }}>
                          <div style={{
                            height: '100%',
                            width: `${ratio * 100}%`,
                            background: meta.accent,
                            transition: 'width 0.4s steps(8, end)',
                          }} />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const subhead: React.CSSProperties = {
  fontFamily: pixel, fontSize: 12,
  color: '#8C6520', textTransform: 'uppercase',
  letterSpacing: 0.4, margin: '0 0 14px',
};

const emptyState: React.CSSProperties = {
  fontFamily: serif, fontStyle: 'italic',
  fontSize: 14, color: '#8C6520',
  padding: '12px 16px', background: '#FFFCF4',
  border: '2px dashed #8C6520', borderRadius: 0,
  margin: 0,
};
