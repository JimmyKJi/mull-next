// /admin — the launch-night dashboard. Live counts of signups, quiz
// completions, dilemma responses, feedback. Gated to ADMIN_USER_IDS
// (currently just Jimmy). Auto-refreshes every 60 seconds via the
// embedded client component.
//
// What this shows:
//   - Total signups (all time + last 24h + last hour)
//   - Total quiz attempts
//   - Total dilemma responses (today's count + all time)
//   - Total feedback submissions (with the latest 10 messages preview)
//   - Top 10 archetype distribution among quiz attempts
//
// Reads via the SERVICE-ROLE admin client so it bypasses RLS — these
// are aggregated counts, not user data leakage.

import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { isAdminUserId } from '@/lib/admin';
import { runHealthChecks } from '@/lib/service-health';
import AdminAutoRefresh from './auto-refresh';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: 'Admin · Mull',
};

// Don't cache — this page is for watching the launch live.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'Inter', system-ui, sans-serif";
const pixel = "var(--font-pixel-display, 'Courier New', monospace)";

type FeedbackRow = {
  id: string;
  body: string;
  page_url: string | null;
  user_id: string | null;
  created_at: string;
};

type ErrorRow = {
  id: number;
  source: string;
  message: string;
  url: string | null;
  created_at: string;
};

type ArchetypeRow = { archetype: string };

async function loadStats() {
  const admin = createAdminClient();
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 3600_000).toISOString();
  const oneDayAgo = new Date(now.getTime() - 86400_000).toISOString();
  const todayKey = now.toISOString().slice(0, 10);

  const [
    usersRes, quizTotal, quizDay, quizHour, archetypes,
    dilemmaTotal, dilemmaToday, dilemmaDay,
    feedbackTotal, feedbackRecent,
    diaryTotal, exerciseTotal, debatesTotal,
    errorsHour, errorsRecent,
  ] = await Promise.all([
    admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    admin.from('quiz_attempts').select('*', { count: 'exact', head: true }),
    admin.from('quiz_attempts').select('*', { count: 'exact', head: true }).gte('taken_at', oneDayAgo),
    admin.from('quiz_attempts').select('*', { count: 'exact', head: true }).gte('taken_at', oneHourAgo),
    admin.from('quiz_attempts').select('archetype').limit(2000),
    admin.from('dilemma_responses').select('*', { count: 'exact', head: true }),
    admin.from('dilemma_responses').select('*', { count: 'exact', head: true }).eq('dilemma_date', todayKey),
    admin.from('dilemma_responses').select('*', { count: 'exact', head: true }).gte('created_at', oneDayAgo),
    admin.from('feedback').select('*', { count: 'exact', head: true }),
    admin.from('feedback').select('id, body, page_url, user_id, created_at').order('created_at', { ascending: false }).limit(10),
    admin.from('diary_entries').select('*', { count: 'exact', head: true }),
    admin.from('exercise_reflections').select('*', { count: 'exact', head: true }),
    admin.from('debate_history').select('*', { count: 'exact', head: true }),
    admin.from('error_log').select('*', { count: 'exact', head: true }).gte('created_at', oneHourAgo),
    admin.from('error_log').select('id, source, message, url, created_at').order('created_at', { ascending: false }).limit(8),
  ]);

  // Archetype distribution: tally the most-recent attempts.
  const archCounts: Record<string, number> = {};
  for (const row of (archetypes.data as ArchetypeRow[] | null) || []) {
    const k = (row.archetype || 'unknown').toLowerCase();
    archCounts[k] = (archCounts[k] || 0) + 1;
  }
  const archDistribution = Object.entries(archCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // Signup buckets — listUsers gives us a single page, so for low-volume
  // launch this is fine. Beyond ~1000 users we'd page.
  const users = usersRes.data?.users || [];
  const signupsTotal = users.length;
  const signupsDay = users.filter(u => u.created_at && u.created_at >= oneDayAgo).length;
  const signupsHour = users.filter(u => u.created_at && u.created_at >= oneHourAgo).length;

  return {
    signups: { total: signupsTotal, day: signupsDay, hour: signupsHour },
    quiz: {
      total: quizTotal.count ?? 0,
      day: quizDay.count ?? 0,
      hour: quizHour.count ?? 0,
    },
    dilemma: {
      total: dilemmaTotal.count ?? 0,
      today: dilemmaToday.count ?? 0,
      day: dilemmaDay.count ?? 0,
    },
    feedback: {
      total: feedbackTotal.count ?? 0,
      recent: (feedbackRecent.data as FeedbackRow[] | null) ?? [],
    },
    other: {
      diary: diaryTotal.count ?? 0,
      exercise: exerciseTotal.count ?? 0,
      debate: debatesTotal.count ?? 0,
    },
    archDistribution,
    errors: {
      hour: errorsHour.count ?? 0,
      recent: (errorsRecent.data as ErrorRow[] | null) ?? [],
    },
    fetchedAt: new Date().toISOString(),
  };
}

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/admin');
  if (!isAdminUserId(user.id)) redirect('/account');

  const [stats, health] = await Promise.all([loadStats(), runHealthChecks()]);

  return (
    <main style={{ maxWidth: 920, margin: '0 auto', padding: '40px 24px 120px' }}>
      <AdminAutoRefresh seconds={60} />

      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 28,
        gap: 12,
        flexWrap: 'wrap',
      }}>
        <div>
          <div style={{
            fontFamily: pixel, fontSize: 11,
            color: '#8C6520', textTransform: 'uppercase',
            letterSpacing: '0.18em', marginBottom: 8,
          }}>
            ▸ ADMIN · LIVE
          </div>
          <h1 style={{
            fontFamily: pixel, fontSize: 28,
            margin: 0, color: '#221E18',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            textShadow: '3px 3px 0 #B8862F',
          }}>
            LAUNCH DASHBOARD
          </h1>
        </div>
        <div style={{
          fontFamily: pixel, fontSize: 11, color: '#8C6520',
          textAlign: 'right', lineHeight: 1.5,
          letterSpacing: 0.4,
          textTransform: 'uppercase',
        }}>
          ▸ REFRESHES EVERY 60S<br />
          LAST FETCH {new Date(stats.fetchedAt).toLocaleTimeString('en-GB')}
        </div>
      </header>

      {/* Service health — chunky pixel chips, square corners. Green
          when reachable, brick when down. */}
      <div style={{
        display: 'flex',
        gap: 10,
        flexWrap: 'wrap',
        marginBottom: 22,
      }}>
        {health.map(h => (
          <div key={h.name} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 12px',
            background: h.ok ? '#E5F0EE' : '#F5E0E0',
            border: `2px solid ${h.ok ? '#2F5D5C' : '#7A2E2E'}`,
            borderRadius: 0,
            fontFamily: pixel,
            fontSize: 11,
            color: h.ok ? '#2F5D5C' : '#7A2E2E',
            letterSpacing: 0.4,
            textTransform: 'uppercase',
          }}>
            <span style={{
              width: 8, height: 8,
              background: h.ok ? '#3D8C7A' : '#7A2E2E',
              display: 'inline-block',
            }} />
            <strong>{h.name}</strong>
            <span style={{ opacity: 0.85 }}>· {h.latencyMs}MS{h.note ? ` · ${h.note.toUpperCase()}` : ''}</span>
          </div>
        ))}
      </div>

      {/* Top row: signups + quiz + dilemma — the launch-night vitals */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 14,
        marginBottom: 18,
      }}>
        <StatCard label="Signups" total={stats.signups.total} day={stats.signups.day} hour={stats.signups.hour} accent="#2F5D5C" />
        <StatCard label="Quiz attempts" total={stats.quiz.total} day={stats.quiz.day} hour={stats.quiz.hour} accent="#B8862F" />
        <StatCard label="Dilemma responses" total={stats.dilemma.total} day={stats.dilemma.day} hour={stats.dilemma.today} hourLabel="today" accent="#7A4A2E" />
        <StatCard label="Feedback notes" total={stats.feedback.total} day={null} hour={null} accent="#5A3A6A" />
      </div>

      {/* Engagement (secondary) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 12,
        marginBottom: 32,
      }}>
        <MiniStat label="Diary entries" value={stats.other.diary} />
        <MiniStat label="Exercise reflections" value={stats.other.exercise} />
        <MiniStat label="Debate sessions" value={stats.other.debate} />
      </div>

      {/* Archetype distribution */}
      {stats.archDistribution.length > 0 && (
        <section style={cardStyle('#B8862F')}>
          <h2 style={sectionTitle}>▸ ARCHETYPE DISTRIBUTION</h2>
          <p style={sectionSub}>How recent quiz takers are landing across the ten archetypes.</p>
          <div style={{ marginTop: 18 }}>
            {stats.archDistribution.map(([key, count]) => {
              const max = stats.archDistribution[0][1] || 1;
              const pct = Math.round((count / max) * 100);
              return (
                <div key={key} style={{
                  display: 'grid',
                  gridTemplateColumns: '120px 1fr 50px',
                  alignItems: 'center',
                  gap: 14,
                  marginBottom: 10,
                }}>
                  <span style={{
                    fontFamily: serif, fontSize: 15,
                    color: '#221E18', textTransform: 'capitalize',
                  }}>{key}</span>
                  <div style={{
                    height: 10,
                    background: '#FAF6EC',
                    border: '2px solid #221E18',
                    borderRadius: 0,
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${pct}%`,
                      height: '100%',
                      background: '#B8862F',
                      transition: 'width 0.4s steps(8, end)',
                    }} />
                  </div>
                  <span style={{
                    fontFamily: pixel, fontSize: 12, color: '#8C6520',
                    textAlign: 'right',
                    letterSpacing: 0.4,
                    fontVariantNumeric: 'tabular-nums',
                  }}>{count}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Recent errors — surfaced first because they're actionable.
          Critical errors (>0 last hour) get a brick shadow, otherwise teal. */}
      <section style={cardStyle(stats.errors.hour > 0 ? '#7A2E2E' : '#2F5D5C')}>
        <h2 style={sectionTitle}>
          ▸ ERRORS {stats.errors.hour > 0 && (
            <span style={{ color: '#7A2E2E', fontSize: 14, marginLeft: 10 }}>
              · {stats.errors.hour} IN THE LAST HOUR
            </span>
          )}
        </h2>
        <p style={sectionSub}>API and client errors — most recent 8.</p>
        {stats.errors.recent.length === 0 ? (
          <p style={{
            fontFamily: serif, fontStyle: 'italic',
            color: '#2F5D5C', margin: '14px 0 0',
          }}>
            No errors logged. Things are quiet.
          </p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: '14px 0 0' }}>
            {stats.errors.recent.map(e => (
              <li key={e.id} style={{
                padding: '12px 0',
                borderBottom: '2px dashed #D6CDB6',
              }}>
                <div style={{
                  fontFamily: pixel, fontSize: 10, color: '#7A2E2E',
                  marginBottom: 6, letterSpacing: 0.4,
                  textTransform: 'uppercase',
                }}>
                  {new Date(e.created_at).toLocaleString('en-GB')} · {e.source}
                  {e.url && ` · ${e.url}`}
                </div>
                <p style={{
                  fontFamily: 'ui-monospace, Menlo, monospace',
                  fontSize: 13, color: '#221E18',
                  margin: 0, lineHeight: 1.5, whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}>{e.message}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Recent feedback */}
      <section style={cardStyle('#5A3A6A')}>
        <h2 style={sectionTitle}>▸ LATEST FEEDBACK</h2>
        <p style={sectionSub}>Most recent 10 notes — the unfiltered launch reactions.</p>
        {stats.feedback.recent.length === 0 ? (
          <p style={{
            fontFamily: serif, fontStyle: 'italic',
            color: '#8C6520', margin: '14px 0 0',
          }}>
            No feedback yet. Friends will leave thoughts via the floating button.
          </p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: '14px 0 0' }}>
            {stats.feedback.recent.map(f => (
              <li key={f.id} style={{
                padding: '14px 0',
                borderBottom: '2px dashed #D6CDB6',
              }}>
                <div style={{
                  fontFamily: pixel, fontSize: 10, color: '#8C6520',
                  marginBottom: 6, letterSpacing: 0.4,
                  textTransform: 'uppercase',
                }}>
                  {new Date(f.created_at).toLocaleString('en-GB')} · {f.user_id ? 'signed in' : 'anonymous'}
                  {f.page_url && ` · ${f.page_url}`}
                </div>
                <p style={{
                  fontFamily: serif, fontSize: 15, color: '#221E18',
                  margin: 0, lineHeight: 1.55, whiteSpace: 'pre-wrap',
                }}>{f.body}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

// Top-row launch vital. Pixel chrome: chunky 4px ink + accent shadow.
// Big VT323-ish pixel digit on top, tiny pixel-display label below,
// secondary deltas in serif.
function StatCard({
  label, total, day, hour, hourLabel = 'last hour', accent,
}: {
  label: string;
  total: number;
  day: number | null;
  hour: number | null;
  hourLabel?: string;
  accent: string;
}) {
  return (
    <div style={{
      padding: '18px 20px',
      background: '#FFFCF4',
      border: '4px solid #221E18',
      boxShadow: `4px 4px 0 0 ${accent}`,
      borderRadius: 0,
    }}>
      <div style={{
        fontFamily: pixel, fontSize: 11,
        color: accent, textTransform: 'uppercase',
        letterSpacing: '0.18em', marginBottom: 12,
      }}>▸ {label.toUpperCase()}</div>
      <div style={{
        fontFamily: pixel, fontSize: 36,
        color: '#221E18', lineHeight: 1, marginBottom: 10,
        letterSpacing: 0.4,
        fontVariantNumeric: 'tabular-nums',
      }}>{total.toLocaleString()}</div>
      {(day !== null || hour !== null) && (
        <div style={{
          fontFamily: serif, fontStyle: 'italic',
          fontSize: 13, color: '#4A4338',
        }}>
          {day !== null && <>+{day} last 24h</>}
          {day !== null && hour !== null && ' · '}
          {hour !== null && <>+{hour} {hourLabel}</>}
        </div>
      )}
    </div>
  );
}

// Secondary mini-stat for the diary/exercise/debate row. Slimmer
// pixel chrome — 3px border, no shadow — so it reads as a sub-tier
// to the StatCard above.
function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div style={{
      padding: '12px 14px',
      background: '#FAF6EC',
      border: '3px solid #221E18',
      borderRadius: 0,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
    }}>
      <span style={{
        fontFamily: pixel, fontSize: 11,
        color: '#8C6520', letterSpacing: 0.4,
        textTransform: 'uppercase',
      }}>{label.toUpperCase()}</span>
      <span style={{
        fontFamily: pixel, fontSize: 22,
        color: '#221E18', letterSpacing: 0.4,
        fontVariantNumeric: 'tabular-nums',
      }}>{value.toLocaleString()}</span>
    </div>
  );
}

// Section card with a colored accent shadow that matches the
// content (gold for archetype distribution, brick or teal for
// errors, plum for feedback).
function cardStyle(accent: string): React.CSSProperties {
  return {
    padding: '24px 26px',
    background: '#FFFCF4',
    border: '4px solid #221E18',
    boxShadow: `4px 4px 0 0 ${accent}`,
    borderRadius: 0,
    marginBottom: 24,
  };
}

const sectionTitle: React.CSSProperties = {
  fontFamily: pixel, fontSize: 16,
  color: '#221E18', margin: '0 0 6px',
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
};

const sectionSub: React.CSSProperties = {
  fontFamily: serif, fontStyle: 'italic',
  fontSize: 14, color: '#4A4338', margin: 0,
};
