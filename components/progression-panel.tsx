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

const serif = "var(--font-prose)";
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
          margin: 0, color: 'var(--color-ink)', letterSpacing: '0.06em',
          textTransform: 'uppercase',
          textShadow: '3px 3px 0 var(--pixel-shadow, var(--color-acc))',
        }}>
          ▸ {t('progression.title', locale).toUpperCase()}
        </h2>
        <p style={{
          fontFamily: serif, fontStyle: 'italic',
          fontSize: 15, color: 'var(--color-ink-soft)',
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

      {/* Earned badges — compact lineup, hover to reveal description.
          Replaces the verbose card-grid version that ate ~half a
          screen of vertical space. Tooltip slides out below the
          hovered badge via pure CSS :hover, no JS needed. */}
      <div style={{ marginBottom: 32 }}>
        <h3 style={subhead}>▸ {t('progression.badges_earned', locale).toUpperCase()}</h3>
        {earned.length > 0 || previewUnearned.length > 0 ? (
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 10,
            }}
          >
            {earned.map((b) => (
              <BadgeTile key={b.key} badge={b} earned />
            ))}
            {previewUnearned.map((b) => (
              <BadgeTile key={b.key} badge={b} earned={false} />
            ))}
          </ul>
        ) : (
          <p style={emptyState}>{t('progression.no_badges_yet', locale)}</p>
        )}
        {(earned.length > 0 || previewUnearned.length > 0) && (
          <p
            style={{
              marginTop: 10,
              fontFamily: pixel,
              fontSize: 10,
              color: 'var(--color-acc-deep)',
              letterSpacing: 0.4,
              textTransform: 'uppercase',
            }}
          >
            ▸ {earned.length} earned · {unearned.length} remaining · hover any badge to read
          </p>
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
                    color: 'var(--color-ink)', margin: 0,
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
                  fontFamily: sans, fontSize: 13, color: 'var(--color-acc-deep)',
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
                        background: done ? 'var(--color-acc-soft)' : '#FFFCF4',
                        border: '3px solid var(--color-ink)',
                        boxShadow: done
                          ? `3px 3px 0 0 ${meta.accent}`
                          : '3px 3px 0 0 var(--color-line)',
                        borderRadius: 0,
                      }}>
                        <div style={{
                          display: 'flex', justifyContent: 'space-between',
                          alignItems: 'baseline', gap: 12,
                          marginBottom: 6, flexWrap: 'wrap',
                        }}>
                          <span style={{
                            fontFamily: serif, fontSize: 15.5,
                            color: 'var(--color-ink)', fontWeight: 500,
                          }}>
                            {done ? '✓ ' : ''}{m.name}
                          </span>
                          <span style={{
                            fontFamily: pixel, fontSize: 11,
                            color: done ? meta.accent : 'var(--color-acc-deep)',
                            fontVariantNumeric: 'tabular-nums',
                            letterSpacing: 0.4,
                          }}>
                            {current} / {m.target}
                          </span>
                        </div>
                        <p style={{
                          fontFamily: sans, fontSize: 13,
                          color: 'var(--color-ink-soft)', lineHeight: 1.5,
                          margin: '0 0 10px',
                        }}>
                          {m.description}
                        </p>
                        {/* Pixel progress bar — segmented look via stepped width */}
                        <div style={{
                          height: 8, background: 'var(--color-cream)',
                          border: '2px solid var(--color-ink)',
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
  color: 'var(--color-acc-deep)', textTransform: 'uppercase',
  letterSpacing: 0.4, margin: '0 0 14px',
};

const emptyState: React.CSSProperties = {
  fontFamily: serif, fontStyle: 'italic',
  fontSize: 14, color: 'var(--color-acc-deep)',
  padding: '12px 16px', background: '#FFFCF4',
  border: '2px dashed var(--color-acc-deep)', borderRadius: 0,
  margin: 0,
};

// ─── BadgeTile ───────────────────────────────────────────────────
//
// Compact badge in a horizontal lineup. The glyph is the main
// affordance; the badge name appears below, small. On hover/focus
// (touch tap-and-hold also fires :hover on mobile), a tooltip
// reveals the full description below the tile.
//
// Pure CSS hover via the .badge-tile / .badge-tile__tip pair. No JS.
// Tooltip is absolutely positioned and clipped to a higher z-index
// so it doesn't get blocked by adjacent tiles.

function BadgeTile({
  badge,
  earned,
}: {
  badge: typeof BADGES[number];
  earned: boolean;
}) {
  return (
    <li
      className="badge-tile"
      tabIndex={0}
      style={{
        position: 'relative',
        width: 72,
        height: 88,
        background: earned ? 'var(--color-acc-soft)' : '#FFFCF4',
        border: earned ? '3px solid var(--color-ink)' : '2px dashed var(--color-acc-deep)',
        boxShadow: earned ? '3px 3px 0 0 var(--color-acc)' : 'none',
        borderRadius: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        padding: '6px 4px',
        cursor: 'help',
        outline: 'none',
        transition: 'transform 120ms steps(2, end)',
      }}
    >
      <span
        aria-hidden
        style={{
          fontFamily: serif,
          fontSize: 26,
          lineHeight: 1,
          color: earned ? 'var(--color-acc-deep)' : '#A39880',
          textShadow: earned ? '1px 1px 0 var(--pixel-shadow, var(--color-acc))' : 'none',
        }}
      >
        {badge.glyph}
      </span>
      <span
        style={{
          fontFamily: pixel,
          fontSize: 8,
          color: earned ? 'var(--color-ink)' : 'var(--color-acc-deep)',
          letterSpacing: 0.4,
          textTransform: 'uppercase',
          textAlign: 'center',
          lineHeight: 1.15,
          maxWidth: 64,
          // Two-line clamp so longer names ("first-to-fifth", etc.)
          // don't overflow the tile.
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {badge.name}
      </span>

      {/* Tooltip — shows on hover OR keyboard focus. Positioned
          absolutely below the tile; clipped at the parent's
          overflow boundary via z-index. */}
      <span
        className="badge-tile__tip"
        role="tooltip"
        style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          left: '50%',
          transform: 'translateX(-50%)',
          minWidth: 200,
          maxWidth: 280,
          padding: '10px 12px',
          background: '#1A1820',
          border: '2px solid var(--color-acc)',
          boxShadow: '4px 4px 0 0 #2F5D5C',
          color: 'var(--color-acc-soft)',
          opacity: 0,
          pointerEvents: 'none',
          transition: 'opacity 140ms steps(3, end)',
          zIndex: 30,
          textAlign: 'left',
        }}
      >
        <span
          style={{
            display: 'block',
            fontFamily: pixel,
            fontSize: 10,
            color: 'var(--color-acc)',
            letterSpacing: 0.4,
            textTransform: 'uppercase',
            marginBottom: 4,
          }}
        >
          {earned ? '▸ EARNED' : '▸ NOT YET EARNED'}
        </span>
        <strong
          style={{
            display: 'block',
            fontFamily: serif,
            fontSize: 15,
            fontWeight: 500,
            color: 'var(--color-acc-soft)',
            marginBottom: 4,
          }}
        >
          {badge.name}
        </strong>
        <span
          style={{
            display: 'block',
            fontFamily: serif,
            fontSize: 13,
            fontStyle: 'italic',
            color: 'var(--color-line)',
            lineHeight: 1.5,
          }}
        >
          {badge.description}
        </span>
      </span>
    </li>
  );
}
