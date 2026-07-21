// TodayHome — the logged-in front door.
//
// Anonymous visitors get the editorial marketing page (app/page.tsx);
// a signed-in user gets THIS instead: a calm, bounded "here is today"
// surface, so returning doesn't mean re-reading a brochure or digging
// into /account (which reads as settings). The whole point is one
// obvious next act — today's question — plus quiet continuity: your
// streak, where your mind has been drifting, your pilgrimage day.
//
// Contemplative, not a game HUD. The daily dilemma is the centerpiece;
// numbers stay quiet; the streak is "days of reflection", never "ON
// FIRE". Server component — assembles pieces that already exist
// (NextActionCard, PilgrimageStatusCard) rather than inventing new
// mechanics.
//
// Split into a data-fetching wrapper (default export) + a pure view
// (TodayHomeView) so every state can be rendered from a mock in review
// without needing an authenticated DB session.

import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { getUserOrientation } from '@/lib/user-orientation';
import { getPersonalizedDilemma, localizeDeepDilemma } from '@/lib/archetype-dilemmas';
import { computeDilemmaStreak } from '@/lib/streak';
import { topShifts } from '@/lib/dimensions';
import { nearestPhilosophersToVector } from '@/lib/recommendations';
import { philosopherSlug } from '@/lib/philosophers';
import { localizePhilosopher } from '@/lib/philosophers-i18n';
import { t, type Locale } from '@/lib/translations';
import PilgrimageStatusCard from '@/components/pilgrimage-status-card';
import NextActionCard from '@/components/next-action-card';
import DailyQuestionShare from '@/components/daily-question-share';

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";
const serif = 'var(--font-prose)';
const editorial = 'var(--font-editorial), Georgia, serif';

type DilemmaRow = { dilemma_date: string; vector_delta: number[] | null };

export type TodayVM = {
  locale: Locale;
  placed: boolean;
  dateLabel: string;
  prompt: string;
  hint?: string;
  respondedToday: boolean;
  archetypeName: string | null;
  archetypeKey: string | null;
  todayShifts: { key: string; delta: number; name: string }[];
  driftStr: string;
  streak: number;
  total: number;
  nearestName: string | null;
};

// ── Data-fetching wrapper ────────────────────────────────────────
export default async function TodayHome({ userId, locale }: { userId: string; locale: Locale }) {
  const supabase = await createClient();
  const orientation = await getUserOrientation(supabase, userId);
  const placed = Array.isArray(orientation.vector) && orientation.vector.length === 16;

  // Today's question — personalized to archetype, deterministic per UTC
  // day (identical to what /dilemma shows).
  const today = getPersonalizedDilemma(orientation.archetypeKey);
  const lz = localizeDeepDilemma(today.dilemma, locale);

  // One read covers streak, responded-today, today's shift, and the
  // recent-drift trend; a head count gives the lifetime total.
  const [{ data: rows }, { count: dilemmaTotal }] = await Promise.all([
    supabase
      .from('dilemma_responses')
      .select('dilemma_date, vector_delta')
      .eq('user_id', userId)
      .order('dilemma_date', { ascending: false })
      .limit(60)
      .returns<DilemmaRow[]>(),
    supabase
      .from('dilemma_responses')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId),
  ]);
  const responses = rows ?? [];
  const dates = responses.map((r) => r.dilemma_date);
  const streak = computeDilemmaStreak(dates, today.dateKey);
  const respondedToday = dates.includes(today.dateKey);
  const total = dilemmaTotal ?? responses.length;

  const todayDelta = responses.find((r) => r.dilemma_date === today.dateKey)?.vector_delta;
  const todayShifts = (Array.isArray(todayDelta) ? topShifts(todayDelta, 0.3, 2) : []).map((s) => ({
    key: s.key,
    delta: s.delta,
    name: t(`dim.${s.key}.name`, locale),
  }));

  // Recent drift — the renewable hook. Sum the last ~14 reflection
  // deltas and name the dominant directions. Self-knowledge saturates;
  // watching your mind MOVE does not. Only named once there's real
  // signal (≥3 reflections and a cumulative magnitude worth showing).
  const recentDeltas = responses
    .slice(0, 14)
    .map((r) => r.vector_delta)
    .filter((v): v is number[] => Array.isArray(v) && v.length === 16);
  const drift =
    recentDeltas.length >= 3
      ? topShifts(
          recentDeltas.reduce((acc, v) => acc.map((a, i) => a + v[i]), new Array(16).fill(0)),
          0.8,
          2,
        ).map((s) => t(`dim.${s.key}.name`, locale))
      : [];

  const nearest = placed ? nearestPhilosophersToVector(orientation.vector, 1)[0]?.item : null;

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
    todayShifts,
    driftStr: drift.join(locale === 'zh' ? '、' : ' and '),
    streak,
    total,
    nearestName: nearest
      ? localizePhilosopher(nearest, philosopherSlug(nearest.name), locale).name
      : null,
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
  const { locale } = vm;
  return (
    <main className="mx-auto max-w-[760px] px-6 pb-32 pt-10 sm:px-10 sm:pt-14">
      {/* Masthead — quiet, time-anchored */}
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
        <span aria-hidden className="inline-block h-2 w-2 bg-acc" />
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
          lineHeight: 1.25,
          margin: '14px 0 0',
          letterSpacing: '-0.3px',
        }}
      >
        {t('today.welcome_line', locale)}
      </h1>

      {/* Unplaced nudge — a signed-in user with no quiz yet gets pointed
          at the one act that personalizes everything else. */}
      {!vm.placed && (
        <Link
          href="/quiz"
          style={{
            display: 'block',
            marginTop: 24,
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
      )}

      {/* ── Today's question — the centerpiece ── */}
      <section
        style={{
          marginTop: 26,
          border: '4px solid var(--color-ink)',
          background: '#FFFCF4',
          boxShadow: '6px 6px 0 0 var(--color-acc-deep)',
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
            ▶{' '}
            {vm.respondedToday ? t('today.answered_eyebrow', locale) : t('today.q_eyebrow', locale)}
          </span>
          {vm.archetypeName && (
            <span style={{ color: 'var(--color-acc)' }} className="min-w-0 truncate">
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
                  <div
                    style={{
                      fontFamily: pixel,
                      fontSize: 9,
                      color: 'var(--color-acc-deep)',
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      marginBottom: 8,
                    }}
                  >
                    {t('today.shift_today_label', locale)}
                  </div>
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
                  background: '#F8C75E',
                  color: '#1A1820',
                  border: '3px solid var(--color-ink)',
                  boxShadow: '4px 4px 0 0 #2F5D5C',
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

          {/* Invite loop — share the PUBLIC daily question (not your
              answer). Turns finishing today's into a reason to pull a
              friend in, the way a daily puzzle does. */}
          <div
            style={{
              marginTop: 20,
              paddingTop: 14,
              borderTop: '1px solid var(--color-line)',
            }}
          >
            <DailyQuestionShare question={vm.prompt} locale={locale} />
          </div>
        </div>
      </section>

      {/* Post-completion nudge — only once today's done, so it never
          competes with the centerpiece CTA. */}
      {vm.respondedToday && (
        <div style={{ marginTop: 22 }}>
          <NextActionCard
            quizCount={vm.placed ? 1 : 0}
            respondedToday={vm.respondedToday}
            streak={vm.streak}
            hasShareable={!!vm.archetypeKey}
            topArchetypeKey={vm.archetypeKey ?? undefined}
            locale={locale}
          />
        </div>
      )}

      {/* Pilgrimage — the strongest structured returning-user hook when
          enrolled; a quiet invite otherwise. Client (localStorage). */}
      <div style={{ marginTop: 22 }}>
        <PilgrimageStatusCard />
      </div>

      {/* Recent drift — "your mind has been moving toward…". The
          renewable reason to come back. */}
      {vm.driftStr && (
        <div
          style={{
            marginTop: 6,
            padding: '16px 20px',
            background: '#E5F0EE',
            border: '3px solid #2F5D5C',
          }}
        >
          <div
            style={{
              fontFamily: pixel,
              fontSize: 9,
              color: '#2F5D5C',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              marginBottom: 6,
            }}
          >
            {t('today.trend_eyebrow', locale)}
          </div>
          <div
            style={{
              fontFamily: editorial,
              fontStyle: 'italic',
              fontSize: 17,
              color: 'var(--color-ink)',
              lineHeight: 1.5,
            }}
          >
            {t('today.trend_line', locale, { dims: vm.driftStr })}
          </div>
        </div>
      )}

      {/* Standing + practice — quiet continuity, never loud. */}
      <div
        style={{
          marginTop: 24,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 12,
        }}
      >
        {vm.placed && vm.archetypeName && (
          <Link
            href="/account#map"
            style={quietCard}
            className="hover:-translate-y-0.5 transition-transform"
          >
            <div style={quietLabel}>{t('today.you_stand', locale)}</div>
            <div style={quietValue}>{vm.archetypeName}</div>
            {vm.nearestName && (
              <div style={quietSub}>
                {t('today.nearest_mind', locale)}: {vm.nearestName}
              </div>
            )}
          </Link>
        )}
        <div style={quietCard}>
          <div style={quietLabel}>{t('today.practice_eyebrow', locale)}</div>
          <div style={quietValue}>
            {vm.streak > 0
              ? t('today.streak_days', locale, { n: vm.streak })
              : t('today.streak_none', locale)}
          </div>
          {vm.total > 0 && (
            <div style={quietSub}>{t('today.dilemmas_total', locale, { n: vm.total })}</div>
          )}
        </div>
      </div>

      {/* The fuller view — for those who want to go deeper. */}
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

const quietCard: React.CSSProperties = {
  padding: '14px 16px',
  background: '#FFFCF4',
  border: '3px solid var(--color-ink)',
  boxShadow: '3px 3px 0 0 var(--color-line)',
  textDecoration: 'none',
  color: 'inherit',
  display: 'block',
};
const quietLabel: React.CSSProperties = {
  fontFamily: pixel,
  fontSize: 9,
  color: 'var(--color-acc-deep)',
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  marginBottom: 6,
};
const quietValue: React.CSSProperties = {
  fontFamily: serif,
  fontSize: 18,
  fontWeight: 500,
  color: 'var(--color-ink)',
  lineHeight: 1.25,
};
const quietSub: React.CSSProperties = {
  fontFamily: serif,
  fontSize: 13,
  color: 'var(--color-ink-soft)',
  marginTop: 4,
};
