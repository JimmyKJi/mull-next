// TodayHome — the logged-in front door.
//
// Anonymous visitors get the editorial marketing page (app/page.tsx);
// a signed-in user gets THIS: a wide, archetype-themed dashboard that
// makes their mind VISIBLE. Single column on mobile; on desktop it
// spreads into a bento grid that actually fills the width (the daily
// question + identity across the top, then a full-width constellation,
// movement chart, and rhythm heatmap).
//
// Reuses existing visual components (ArchetypeSprite, TrajectoryChart,
// ActivityHeatmap, the /embed/map constellation) plus two new small
// ones (DimensionRadar, StreakStrip). Split into a data-fetching
// wrapper (default export) + a pure view (TodayHomeView) so every state
// renders from a mock in review without an authenticated DB session.

import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { getUserOrientation } from '@/lib/user-orientation';
import { getPersonalizedDilemma, localizeDeepDilemma } from '@/lib/archetype-dilemmas';
import { computeDilemmaStreak } from '@/lib/streak';
import { computeTrajectory, type TrajectoryEvent } from '@/lib/trajectory';
import { topShifts, DIM_KEYS } from '@/lib/dimensions';
import { nearestPhilosophersToVector } from '@/lib/recommendations';
import { philosopherSlug } from '@/lib/philosophers';
import { localizePhilosopher } from '@/lib/philosophers-i18n';
import { getArchetypeColor } from '@/lib/archetype-colors';
import { t, type Locale } from '@/lib/translations';
import PilgrimageStatusCard from '@/components/pilgrimage-status-card';
import NextActionCard from '@/components/next-action-card';
import DailyQuestionShare from '@/components/daily-question-share';
import { ArchetypeSprite } from '@/components/archetype-sprite';
import { DimensionRadar } from '@/components/dimension-radar';
import { StreakStrip } from '@/components/streak-strip';
import { TrajectoryChart } from '@/components/trajectory-chart';
import { ActivityHeatmap } from '@/components/activity-heatmap';

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";
const serif = 'var(--font-prose)';
const editorial = 'var(--font-editorial), Georgia, serif';

type Accent = { primary: string; deep: string; soft: string };

type DilemmaRow = { dilemma_date: string; vector_delta: number[] | null; created_at: string };
type QuizRow = { vector: number[] | null; taken_at: string };
type DeltaRow = { vector_delta: number[] | null; created_at: string };

export type TodayVM = {
  locale: Locale;
  placed: boolean;
  dateLabel: string;
  prompt: string;
  hint?: string;
  respondedToday: boolean;
  archetypeName: string | null;
  archetypeKey: string | null;
  accent: Accent;
  todayShifts: { key: string; delta: number; name: string }[];
  driftStr: string;
  streak: number;
  total: number;
  nearestName: string | null;
  fingerprint: number[] | null;
  strongest: string[];
  reflectDates: string[];
  todayKey: string;
  trajectory: { timestamp: number; after: number[] }[];
  timestamps: number[];
  iframeSrc: string | null;
};

const isVec = (v: unknown): v is number[] => Array.isArray(v) && v.length === 16;
const b64 = (obj: unknown) =>
  encodeURIComponent(Buffer.from(JSON.stringify(obj)).toString('base64'));

// ── Data-fetching wrapper ────────────────────────────────────────
export default async function TodayHome({ userId, locale }: { userId: string; locale: Locale }) {
  const supabase = await createClient();
  const orientation = await getUserOrientation(supabase, userId);
  const placed = isVec(orientation.vector);
  const color = getArchetypeColor(orientation.archetypeKey ?? 'cartographer');
  const accent: Accent = { primary: color.primary, deep: color.deep, soft: color.soft };

  const today = getPersonalizedDilemma(orientation.archetypeKey);
  const lz = localizeDeepDilemma(today.dilemma, locale);

  const [dilemmaRes, quizRes, diaryRes, exRes, { count: dilemmaTotal }] = await Promise.all([
    supabase
      .from('dilemma_responses')
      .select('dilemma_date, vector_delta, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(200)
      .returns<DilemmaRow[]>(),
    supabase
      .from('quiz_attempts')
      .select('vector, taken_at')
      .eq('user_id', userId)
      .order('taken_at', { ascending: false })
      .limit(20)
      .returns<QuizRow[]>(),
    supabase
      .from('diary_entries')
      .select('vector_delta, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100)
      .returns<DeltaRow[]>(),
    supabase
      .from('exercise_reflections')
      .select('vector_delta, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100)
      .returns<DeltaRow[]>(),
    supabase
      .from('dilemma_responses')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId),
  ]);

  const dilemmas = dilemmaRes.data ?? [];
  const dates = dilemmas.map((r) => r.dilemma_date);
  const streak = computeDilemmaStreak(dates, today.dateKey);
  const respondedToday = dates.includes(today.dateKey);
  const total = dilemmaTotal ?? dilemmas.length;

  const todayDelta = dilemmas.find((r) => r.dilemma_date === today.dateKey)?.vector_delta;
  const todayShifts = (isVec(todayDelta) ? topShifts(todayDelta, 0.3, 2) : []).map((s) => ({
    key: s.key,
    delta: s.delta,
    name: t(`dim.${s.key}.name`, locale),
  }));

  const recentDeltas = dilemmas
    .slice(0, 14)
    .map((r) => r.vector_delta)
    .filter(isVec);
  const drift =
    recentDeltas.length >= 3
      ? topShifts(
          recentDeltas.reduce((acc, v) => acc.map((a, i) => a + v[i]), new Array(16).fill(0)),
          0.8,
          2,
        ).map((s) => t(`dim.${s.key}.name`, locale))
      : [];

  const events: TrajectoryEvent[] = [
    ...(quizRes.data ?? [])
      .filter((q) => isVec(q.vector))
      .map<TrajectoryEvent>((q) => ({
        kind: 'quiz',
        timestamp: Date.parse(q.taken_at),
        vector: q.vector as number[],
      })),
    ...[...dilemmas, ...(diaryRes.data ?? []), ...(exRes.data ?? [])]
      .filter((d) => isVec(d.vector_delta))
      .map<TrajectoryEvent>((d) => ({
        kind: 'delta',
        timestamp: Date.parse(d.created_at),
        delta: d.vector_delta as number[],
      })),
  ].sort((a, b) => a.timestamp - b.timestamp);

  const trajectory = computeTrajectory(events);
  const latestPos = trajectory.length
    ? trajectory[trajectory.length - 1].after
    : orientation.vector;
  const fingerprint = isVec(latestPos) ? latestPos : null;
  const timestamps = events.map((e) => e.timestamp);

  const trail = trajectory.slice(-10).map((p) => p.after);
  const iframeSrc = fingerprint
    ? `/embed/map?v=${b64(fingerprint)}${trail.length > 1 ? `&h=${b64(trail)}` : ''}`
    : null;

  const nearest = fingerprint ? nearestPhilosophersToVector(fingerprint, 1)[0]?.item : null;

  const strongest = fingerprint
    ? fingerprint
        .map((v, i) => ({ i, v }))
        .sort((a, b) => b.v - a.v)
        .slice(0, 3)
        .map((x) => t(`dim.${DIM_KEYS[x.i]}.name`, locale))
    : [];

  const vm: TodayVM = {
    locale,
    placed,
    dateLabel: formatDate(today.dateKey, locale),
    prompt: lz.prompt,
    hint: lz.hint,
    respondedToday,
    archetypeName: orientation.archetypeKey
      ? t(`arch.${orientation.archetypeKey}.name`, locale)
      : null,
    archetypeKey: orientation.archetypeKey ?? null,
    accent,
    todayShifts,
    driftStr: drift.join(locale === 'zh' ? '、' : ' and '),
    streak,
    total,
    nearestName: nearest
      ? localizePhilosopher(nearest, philosopherSlug(nearest.name), locale).name
      : null,
    fingerprint,
    strongest,
    reflectDates: dates,
    todayKey: today.dateKey,
    trajectory,
    timestamps,
    iframeSrc,
  };

  return <TodayHomeView vm={vm} />;
}

function formatDate(dateKey: string, locale: Locale): string {
  return new Date(dateKey)
    .toLocaleDateString(locale === 'en' ? 'en-GB' : locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
    .toUpperCase();
}

// ── Pure presentational view ─────────────────────────────────────
export function TodayHomeView({ vm }: { vm: TodayVM }) {
  const { locale, accent } = vm;
  return (
    <main className="mx-auto max-w-[1180px] px-4 pb-32 pt-10 sm:px-6 sm:pt-12 lg:px-8">
      {/* Masthead */}
      <div
        style={{
          fontFamily: pixel,
          fontSize: 10,
          color: 'var(--color-acc-deep)',
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          display: 'flex',
          gap: 10,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <span aria-hidden className="inline-block h-2 w-2" style={{ background: accent.primary }} />
        <span>▶ {t('today.eyebrow', locale)}</span>
        <span style={{ opacity: 0.5 }}>·</span>
        <span style={{ color: 'var(--color-ink)' }}>{vm.dateLabel}</span>
      </div>
      <h1
        style={{
          fontFamily: editorial,
          fontStyle: 'italic',
          fontSize: 30,
          fontWeight: 500,
          color: 'var(--color-ink)',
          lineHeight: 1.2,
          margin: '12px 0 0',
          letterSpacing: '-0.3px',
        }}
      >
        {t('today.welcome_line', locale)}
      </h1>

      {!vm.placed && <UnplacedBanner locale={locale} />}

      {vm.placed ? (
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-start lg:gap-5">
          {/* Row 1 — the act (left) + who you are (right) */}
          <div className="lg:col-span-7">
            <QuestionCard vm={vm} />
          </div>
          <div className="lg:col-span-5">
            <IdentityCard vm={vm} />
          </div>

          {/* Full-width visual showpieces (each hides until it has data) */}
          {vm.iframeSrc && (
            <div className="lg:col-span-12">
              <VisualBlock eyebrow={t('today.map_eyebrow', locale)} accent={accent}>
                <p style={captionStyle}>{t('today.map_sub', locale)}</p>
                <div
                  style={{
                    position: 'relative',
                    height: 460,
                    border: `2px solid ${accent.deep}`,
                    background: '#FFFCF4',
                    boxShadow: `3px 3px 0 0 ${accent.primary}`,
                    overflow: 'hidden',
                  }}
                >
                  <iframe
                    src={vm.iframeSrc}
                    style={{ width: '100%', height: '100%', border: 0, display: 'block' }}
                    title={t('a11y.map_position', locale)}
                    loading="lazy"
                  />
                </div>
              </VisualBlock>
            </div>
          )}

          {vm.trajectory.length >= 3 && (
            <div className="lg:col-span-12">
              <VisualBlock eyebrow={t('today.movement_eyebrow', locale)} accent={accent}>
                {vm.driftStr && (
                  <p style={captionStyle}>{t('today.trend_line', locale, { dims: vm.driftStr })}</p>
                )}
                <TrajectoryChart trajectory={vm.trajectory} accent={accent} />
              </VisualBlock>
            </div>
          )}

          {vm.timestamps.length > 0 && (
            <div className="lg:col-span-12">
              <VisualBlock eyebrow={t('today.rhythm_eyebrow', locale)} accent={accent}>
                <ActivityHeatmap timestamps={vm.timestamps} accent={accent} locale={locale} />
              </VisualBlock>
            </div>
          )}

          {/* Row — pilgrimage + post-completion nudge */}
          <div className="lg:col-span-6">
            <PilgrimageStatusCard />
          </div>
          {vm.respondedToday && (
            <div className="lg:col-span-6">
              <NextActionCard
                quizCount={1}
                respondedToday={vm.respondedToday}
                streak={vm.streak}
                hasShareable={!!vm.archetypeKey}
                topArchetypeKey={vm.archetypeKey ?? undefined}
                locale={locale}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="mt-6 grid max-w-[760px] gap-4">
          <QuestionCard vm={vm} />
          <PilgrimageStatusCard />
        </div>
      )}

      {/* The fuller view */}
      <div
        style={{
          marginTop: 30,
          paddingTop: 18,
          borderTop: '1px solid var(--color-line)',
          display: 'flex',
          gap: 18,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            fontFamily: pixel,
            fontSize: 9,
            color: 'var(--color-acc-deep)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}
        >
          {t('today.fuller_eyebrow', locale)}
        </span>
        <FullerLink href="/account#map" label={t('today.view_trajectory', locale)} />
        <FullerLink href="/map" label={t('today.view_map', locale)} />
        <FullerLink href="/account" label={t('today.view_account', locale)} />
      </div>
    </main>
  );
}

// ── Identity card — figure + archetype + radar + streak strip ──
function IdentityCard({ vm }: { vm: TodayVM }) {
  const { locale, accent } = vm;
  if (!vm.placed || !vm.archetypeName || !vm.fingerprint) return null;
  return (
    <section
      style={{
        height: '100%',
        border: `4px solid ${accent.deep}`,
        background: accent.soft,
        boxShadow: `6px 6px 0 0 ${accent.deep}`,
        padding: '18px 20px',
      }}
    >
      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
        <div style={{ flexShrink: 0 }}>
          <ArchetypeSprite archetypeKey={vm.archetypeKey!} size={64} framed />
        </div>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontFamily: pixel,
              fontSize: 9,
              color: accent.deep,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              marginBottom: 3,
            }}
          >
            {t('today.you_stand', locale)}
          </div>
          <div
            style={{
              fontFamily: editorial,
              fontSize: 24,
              fontWeight: 500,
              color: 'var(--color-ink)',
              lineHeight: 1.1,
            }}
          >
            {vm.archetypeName}
          </div>
          {vm.nearestName && (
            <div
              style={{
                marginTop: 4,
                fontFamily: serif,
                fontSize: 13,
                color: 'var(--color-ink-soft)',
              }}
            >
              {t('today.nearest_mind', locale)}:{' '}
              <strong style={{ color: 'var(--color-ink)' }}>{vm.nearestName}</strong>
            </div>
          )}
        </div>
      </div>

      {/* Streak strip — last 21 days at a glance */}
      <div style={{ marginTop: 16 }}>
        <div style={{ ...miniLabel, color: accent.deep }}>
          {vm.streak > 0
            ? t('today.streak_days', locale, { n: vm.streak })
            : t('today.streak_none', locale)}
        </div>
        <StreakStrip dates={vm.reflectDates} todayKey={vm.todayKey} accent={accent} days={21} />
      </div>

      {/* Radar — the shape of your mind */}
      <div style={{ marginTop: 18 }}>
        <div style={{ ...miniLabel, color: accent.deep }}>
          {t('today.fingerprint_eyebrow', locale)}
        </div>
        <DimensionRadar vector={vm.fingerprint} accent={accent} />
        {vm.strongest.length > 0 && (
          <p
            style={{
              marginTop: 6,
              fontFamily: serif,
              fontStyle: 'italic',
              fontSize: 13.5,
              color: 'var(--color-ink-soft)',
              textAlign: 'center',
              lineHeight: 1.45,
            }}
          >
            {t('today.strongest', locale, {
              dims: vm.strongest.join(locale === 'zh' ? '、' : ', '),
            })}
          </p>
        )}
      </div>
    </section>
  );
}

// ── Today's question card ──
function QuestionCard({ vm }: { vm: TodayVM }) {
  const { locale, accent } = vm;
  return (
    <section
      style={{
        border: '4px solid var(--color-ink)',
        background: '#FFFCF4',
        boxShadow: '6px 6px 0 0 var(--color-ink)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 8,
          flexWrap: 'wrap',
          borderBottom: '4px solid var(--color-ink)',
          background: 'var(--color-ink)',
          color: 'var(--color-acc-soft)',
          padding: '8px 16px',
          fontFamily: pixel,
          fontSize: 10,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
        }}
      >
        <span>
          ▶ {vm.respondedToday ? t('today.answered_eyebrow', locale) : t('today.q_eyebrow', locale)}
        </span>
        {vm.archetypeName && (
          <span style={{ color: accent.primary }} className="min-w-0 truncate">
            {t('today.q_for', locale, { archetype: vm.archetypeName.toUpperCase() })}
          </span>
        )}
      </div>

      <div style={{ padding: '22px 24px 24px' }}>
        <p
          style={{
            fontFamily: editorial,
            fontSize: 25,
            fontWeight: 500,
            color: 'var(--color-ink)',
            lineHeight: 1.4,
            margin: 0,
          }}
        >
          {vm.prompt}
        </p>

        {vm.respondedToday ? (
          <div style={{ marginTop: 18 }}>
            <div
              style={{
                fontFamily: serif,
                fontStyle: 'italic',
                fontSize: 15.5,
                color: 'var(--color-ink-soft)',
                lineHeight: 1.55,
              }}
            >
              {t('today.answered_body', locale)}
            </div>
            {vm.todayShifts.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div style={miniLabel}>{t('today.shift_today_label', locale)}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
                  {vm.todayShifts.map((s) => (
                    <span key={s.key} style={{ fontFamily: serif, fontSize: 14 }}>
                      <strong
                        style={{
                          fontVariantNumeric: 'tabular-nums',
                          color: s.delta > 0 ? '#2F5D5C' : '#7A2E2E',
                        }}
                      >
                        {s.delta > 0 ? '+' : ''}
                        {s.delta.toFixed(1)}
                      </strong>{' '}
                      <span style={{ color: 'var(--color-ink-soft)' }}>{s.name}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
            <Link
              href="/dilemma"
              style={{
                display: 'inline-block',
                marginTop: 18,
                fontFamily: pixel,
                fontSize: 11,
                color: 'var(--color-acc-deep)',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                textDecoration: 'underline',
                textUnderlineOffset: 3,
              }}
            >
              {t('today.reread', locale)} →
            </Link>
          </div>
        ) : (
          <>
            {vm.hint && (
              <p
                style={{
                  fontFamily: serif,
                  fontStyle: 'italic',
                  fontSize: 14.5,
                  color: 'var(--color-ink-soft)',
                  lineHeight: 1.55,
                  margin: '14px 0 0',
                }}
              >
                {vm.hint}
              </p>
            )}
            <Link
              href="/dilemma"
              className="pixel-press"
              style={{
                display: 'inline-block',
                marginTop: 20,
                padding: '13px 22px',
                background: accent.primary,
                color: '#1A1820',
                border: '3px solid var(--color-ink)',
                boxShadow: `4px 4px 0 0 ${accent.deep}`,
                fontFamily: pixel,
                fontSize: 12,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end)',
              }}
            >
              {t('today.sit_with_it', locale)}
            </Link>
          </>
        )}

        <div style={{ marginTop: 20, paddingTop: 14, borderTop: '1px solid var(--color-line)' }}>
          <DailyQuestionShare question={vm.prompt} locale={locale} />
        </div>
      </div>
    </section>
  );
}

function UnplacedBanner({ locale }: { locale: Locale }) {
  return (
    <Link
      href="/quiz"
      style={{
        display: 'block',
        marginTop: 24,
        maxWidth: 760,
        padding: '16px 20px',
        background: 'var(--color-acc-soft)',
        border: '3px solid var(--color-ink)',
        boxShadow: '4px 4px 0 0 var(--color-acc)',
        textDecoration: 'none',
        color: 'inherit',
      }}
      className="transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5"
    >
      <div
        style={{
          fontFamily: serif,
          fontSize: 17,
          fontWeight: 500,
          color: 'var(--color-ink)',
          marginBottom: 4,
        }}
      >
        {t('today.unplaced_title', locale)}
      </div>
      <div
        style={{
          fontFamily: serif,
          fontStyle: 'italic',
          fontSize: 14.5,
          color: 'var(--color-ink-soft)',
          lineHeight: 1.5,
          marginBottom: 8,
        }}
      >
        {t('today.unplaced_body', locale)}
      </div>
      <div
        style={{
          fontFamily: pixel,
          fontSize: 11,
          color: 'var(--color-acc-deep)',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
        }}
      >
        {t('today.unplaced_cta', locale)}
      </div>
    </Link>
  );
}

// A titled section wrapper for a visual block.
function VisualBlock({
  eyebrow,
  accent,
  children,
}: {
  eyebrow: string;
  accent: Accent;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div
        style={{
          fontFamily: pixel,
          fontSize: 10,
          color: accent.deep,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          marginBottom: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span aria-hidden className="inline-block h-2 w-2" style={{ background: accent.primary }} />
        {eyebrow}
      </div>
      {children}
    </section>
  );
}

const miniLabel: React.CSSProperties = {
  fontFamily: pixel,
  fontSize: 9,
  color: 'var(--color-acc-deep)',
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  marginBottom: 8,
};

const captionStyle: React.CSSProperties = {
  fontFamily: editorial,
  fontStyle: 'italic',
  fontSize: 15.5,
  color: 'var(--color-ink)',
  lineHeight: 1.5,
  margin: '0 0 12px',
};

function FullerLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      style={{
        fontFamily: serif,
        fontSize: 14,
        color: 'var(--color-ink)',
        textDecoration: 'underline',
        textDecorationColor: 'var(--color-acc)',
        textUnderlineOffset: 3,
      }}
    >
      {label} →
    </Link>
  );
}
