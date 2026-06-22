// /arena — landing page for Mull's argument-Elo system.
//
// Three doors: calibrate (placement matches), PvE (debate a
// philosopher), PvP (coming soon stub). User's current Elo + debate
// count surfaced if they're signed in.

import Link from 'next/link';
import type { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import { PixelPageHeader } from '@/components/pixel-window';
import {
  ARENA_PHILOSOPHERS,
  getWeeklyChallenge,
  localizeArenaPhilosopherName,
} from '@/lib/arena/data';
import { localizeArenaTopic } from '@/lib/arena/topics-i18n';
import { getServerLocale } from '@/lib/locale-server';
import { t } from '@/lib/translations';
import { JudgingNotice } from '@/components/judging-notice';

export const metadata: Metadata = {
  title: 'Arena · Mull',
  description: 'Debate philosophers. Be judged on rigor, not stance. Climb the Elo.',
  robots: { index: false, follow: false },
};

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";
const serif = 'var(--font-prose)';

export default async function ArenaPage() {
  const locale = await getServerLocale();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let rating: {
    pve_elo: number;
    pvp_elo: number;
    pve_debates_count: number;
    calibration_done_at: string | null;
  } | null = null;
  if (user) {
    const { data } = await supabase
      .from('arena_user_ratings')
      .select('pve_elo, pvp_elo, pve_debates_count, calibration_done_at')
      .eq('user_id', user.id)
      .maybeSingle();
    rating = data;
  }

  const calibrated = !!rating?.calibration_done_at;
  const weekly = getWeeklyChallenge();
  const weeklyTopic = localizeArenaTopic(weekly.topic, locale);
  const weeklyPhilosopher = localizeArenaPhilosopherName(weekly.philosopher.name, locale);
  // URL deep-link so a click drops you into PvE pre-loaded with the
  // featured topic + philosopher. /arena/pve already parses these.
  // English slug/name stay the lookup keys.
  const weeklyHref = user
    ? `/arena/pve?topic=${weekly.topic.slug}&opponent=${encodeURIComponent(weekly.philosopher.name)}`
    : '/login?next=/arena';

  return (
    <main className="mx-auto max-w-[760px] px-6 pb-32 pt-10 sm:px-10">
      <PixelPageHeader
        eyebrow={t('arena.eyebrow', locale)}
        title={t('arena.title', locale)}
        subtitle={
          <p
            style={{
              fontFamily: 'var(--font-editorial)',
              fontStyle: 'italic',
              fontSize: 16,
              color: 'var(--color-ink-soft)',
              lineHeight: 1.55,
            }}
          >
            {t('arena.subtitle', locale)}
          </p>
        }
      />

      {/* ─── Weekly featured challenge ─────────────────────────────
          Rotating philosopher × topic per ISO week. Driver of
          weekly return — gives the Arena a "today's puzzle" beat.
          RETENTION-NOTES.md §12. */}
      <Link
        href={weeklyHref}
        style={{
          display: 'block',
          marginBottom: 28,
          padding: '18px 20px',
          background: '#1A1612',
          color: 'var(--color-acc-soft)',
          border: '4px solid var(--color-ink)',
          boxShadow: '5px 5px 0 0 var(--color-acc)',
          textDecoration: 'none',
        }}
        className="transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5"
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 8,
            marginBottom: 10,
          }}
        >
          <span
            style={{
              fontFamily: pixel,
              fontSize: 10,
              color: '#F8C75E',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
            }}
          >
            {t('arena.weekly_eyebrow', locale, { week: weekly.weekNumber })}
          </span>
          <span
            style={{
              fontFamily: pixel,
              fontSize: 9,
              color: 'var(--color-acc)',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}
          >
            {t('spar.tier_line', locale, {
              tier: t(`spar.tier.${weekly.philosopher.tier}`, locale),
              elo: weekly.philosopher.baseElo,
            })}
          </span>
        </div>
        <div
          style={{
            fontFamily: 'var(--font-editorial)',
            fontSize: 20,
            color: 'var(--color-acc-soft)',
            lineHeight: 1.3,
            marginBottom: 8,
          }}
        >
          <strong>{t('arena.weekly_argue', locale, { name: weeklyPhilosopher })}</strong>
          {t('arena.weekly_on', locale)}
          <em>&ldquo;{weeklyTopic.title}&rdquo;</em>
        </div>
        <p
          style={{
            fontFamily: 'var(--font-editorial)',
            fontSize: 14,
            color: '#E5DCC0',
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          {weeklyTopic.prompt}
        </p>
        <div
          style={{
            marginTop: 14,
            display: 'inline-block',
            padding: '6px 12px',
            background: '#F8C75E',
            color: '#1A1820',
            border: '2px solid var(--color-ink)',
            fontFamily: pixel,
            fontSize: 11,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
          }}
        >
          {t('arena.enter', locale)}
        </div>
      </Link>

      {user && rating && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 8,
            marginBottom: 28,
          }}
        >
          <Stat label={t('arena.stat_pve_elo', locale)} value={String(rating.pve_elo)} />
          <Stat label={t('arena.stat_debates', locale)} value={String(rating.pve_debates_count)} />
          <Stat
            label={t('arena.stat_status', locale)}
            value={
              calibrated ? t('arena.status_rated', locale) : t('arena.status_provisional', locale)
            }
          />
        </div>
      )}

      <JudgingNotice locale={locale} style={{ marginBottom: 28 }} />

      {/* Three doors */}
      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: '0 0 36px',
          display: 'grid',
          gap: 14,
        }}
      >
        <DoorCard
          href={user ? '/arena/pve' : '/login?next=/arena'}
          eyebrow={
            calibrated
              ? t('arena.door_pve_open_eyebrow', locale)
              : t('arena.door_start_eyebrow', locale)
          }
          title={
            calibrated
              ? t('arena.door_pve_open_title', locale)
              : t('arena.door_calibrate_title', locale)
          }
          body={
            calibrated
              ? t('arena.door_pve_open_body', locale)
              : t('arena.door_calibrate_body', locale)
          }
        />
        <DoorCard
          href={user ? '/arena/pvp' : '/login?next=/arena/pvp'}
          eyebrow={t('arena.door_pvp_eyebrow', locale)}
          title={t('arena.door_pvp_title', locale)}
          body={t('arena.door_pvp_body', locale)}
        />
        <DoorCard
          href="/arena/leaderboard"
          eyebrow={t('arena.door_lb_eyebrow', locale)}
          title={t('arena.door_lb_title', locale)}
          body={t('arena.door_lb_body', locale)}
        />
        {user && (
          <DoorCard
            href="/arena/history"
            eyebrow={t('arena.door_hist_eyebrow', locale)}
            title={t('arena.door_hist_title', locale)}
            body={t('arena.door_hist_body', locale)}
          />
        )}
      </ul>

      {/* Philosopher roster preview */}
      <div
        style={{
          fontFamily: pixel,
          fontSize: 11,
          color: 'var(--color-ink)',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          marginBottom: 12,
          textShadow: '2px 2px 0 var(--pixel-shadow, var(--color-acc))',
        }}
      >
        {t('arena.roster', locale, { n: ARENA_PHILOSOPHERS.length })}
      </div>
      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 8,
        }}
      >
        {ARENA_PHILOSOPHERS.map((p) => (
          <li
            key={p.name}
            style={{
              padding: '12px 14px',
              background: '#FFFCF4',
              border: '2px solid var(--color-ink)',
              boxShadow: '3px 3px 0 0 var(--color-acc)',
            }}
          >
            <div
              style={{
                fontFamily: serif,
                fontSize: 16,
                fontWeight: 500,
                color: 'var(--color-ink)',
                marginBottom: 2,
              }}
            >
              {localizeArenaPhilosopherName(p.name, locale)}
            </div>
            <div
              style={{
                fontFamily: pixel,
                fontSize: 10,
                color: 'var(--color-acc-deep)',
                letterSpacing: 0.4,
                textTransform: 'uppercase',
              }}
            >
              {t('arena.elo_value', locale, { elo: p.baseElo })}
            </div>
          </li>
        ))}
      </ul>

      <p
        style={{
          marginTop: 26,
          fontFamily: serif,
          fontStyle: 'italic',
          fontSize: 14,
          color: 'var(--color-acc-deep)',
          lineHeight: 1.5,
        }}
      >
        {t('arena.cap_note', locale)}
      </p>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: '10px 12px',
        background: '#FFFCF4',
        border: '3px solid var(--color-ink)',
        boxShadow: '3px 3px 0 0 var(--color-acc)',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontFamily: pixel,
          fontSize: 9,
          color: 'var(--color-acc-deep)',
          letterSpacing: 0.4,
          textTransform: 'uppercase',
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: pixel,
          fontSize: 18,
          color: 'var(--color-ink)',
          letterSpacing: 0.5,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function DoorCard({
  href,
  eyebrow,
  title,
  body,
  disabled,
}: {
  href: string;
  eyebrow: string;
  title: string;
  body: string;
  disabled?: boolean;
}) {
  const inner = (
    <div
      style={{
        padding: '18px 22px',
        background: disabled ? '#F2EFE3' : '#FFFCF4',
        border: '4px solid var(--color-ink)',
        boxShadow: disabled ? 'none' : '5px 5px 0 0 var(--color-acc)',
        opacity: disabled ? 0.55 : 1,
        transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end)',
      }}
    >
      <div
        style={{
          fontFamily: pixel,
          fontSize: 10,
          color: 'var(--color-acc-deep)',
          letterSpacing: 0.4,
          textTransform: 'uppercase',
          marginBottom: 8,
        }}
      >
        {eyebrow}
      </div>
      <div
        style={{
          fontFamily: serif,
          fontSize: 20,
          fontWeight: 500,
          color: 'var(--color-ink)',
          marginBottom: 6,
          letterSpacing: '-0.2px',
        }}
      >
        {title}
      </div>
      <p
        style={{
          fontFamily: serif,
          fontSize: 15,
          color: 'var(--color-ink-soft)',
          margin: 0,
          lineHeight: 1.55,
        }}
      >
        {body}
      </p>
    </div>
  );
  if (disabled) return <li>{inner}</li>;
  return (
    <li>
      <Link
        href={href}
        className="pixel-press"
        style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
      >
        {inner}
      </Link>
    </li>
  );
}
