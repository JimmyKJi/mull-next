'use client';

// AtlasView — client-side render of the Capability Atlas.
//
// Reads capability events from localStorage, computes levels per
// skill, renders six progress bars + a "your week" panel + the
// recent event log. Re-renders when other tabs/components fire
// new events (via the `mull:capability-event` window event).

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  SKILLS,
  SKILL_META,
  type CapabilityEvent,
  type Skill,
  readEvents,
  aggregateXp,
  levelFromXp,
  cumulativeXpForLevel,
  currentStreak,
  activeDates,
} from '@/lib/capabilities';
import { t, type Locale } from '@/lib/translations';

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";
const serif = 'var(--font-editorial), Georgia, serif';

export default function AtlasView({ locale }: { locale: Locale }) {
  const [events, setEvents] = useState<CapabilityEvent[] | null>(null);

  // Initial load + listen for cross-component updates.
  useEffect(() => {
    setEvents(readEvents());
    const handler = () => setEvents(readEvents());
    window.addEventListener('mull:capability-event', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('mull:capability-event', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  if (events === null) {
    return (
      <div className="text-center text-[14px] text-acc-deep" style={{ fontFamily: serif }}>
        {t('atl.loading', locale)}
      </div>
    );
  }

  if (events.length === 0) {
    return <EmptyState locale={locale} />;
  }

  const xpBySkill = aggregateXp(events);
  const streak = currentStreak(events);
  const activeDays = activeDates(events).length;
  const eventsThisWeek = events.filter((e) => Date.now() - e.ts < 7 * 86400000).length;

  return (
    <div className="space-y-7">
      {/* Headline numbers */}
      <div className="grid grid-cols-3 gap-3">
        <BigStat value={String(streak)} label={t('atl.day_streak', locale)} color="#B8862F" />
        <BigStat
          value={String(activeDays)}
          label={activeDays === 1 ? t('atl.active_day', locale) : t('atl.active_days', locale)}
          color="#2F5D5C"
        />
        <BigStat
          value={String(eventsThisWeek)}
          label={t('atl.moves_this_week', locale)}
          color="#8C3717"
        />
      </div>

      {/* Six skill bars */}
      <div
        className="border-[3px] border-ink bg-[#FFFCF4]"
        style={{ boxShadow: '4px 4px 0 0 var(--color-acc)' }}
      >
        <div
          className="flex items-center justify-between border-b-2 border-ink bg-ink px-4 py-2 text-[10px] tracking-[0.22em] text-acc-soft"
          style={{ fontFamily: pixel }}
        >
          <span>▶ {t('atl.your_six_skills', locale)}</span>
          <span className="text-acc">ATLAS.SYS</span>
        </div>
        <div className="px-4 py-4 sm:px-6 sm:py-5">
          <ul className="space-y-3">
            {SKILLS.map((s) => (
              <SkillBar key={s} skill={s} xp={xpBySkill[s] ?? 0} locale={locale} />
            ))}
          </ul>
        </div>
      </div>

      {/* Recent event log */}
      <RecentEvents events={events} locale={locale} />
    </div>
  );
}

function EmptyState({ locale }: { locale: Locale }) {
  return (
    <div
      className="border-[3px] border-ink bg-[#FFFCF4] p-6"
      style={{ boxShadow: '4px 4px 0 0 var(--color-acc)' }}
    >
      <div className="text-[10px] tracking-[0.22em] text-acc-deep" style={{ fontFamily: pixel }}>
        ▶ {t('atl.empty_badge', locale)}
      </div>
      <p className="mt-3 text-[15px] leading-[1.6] text-ink" style={{ fontFamily: serif }}>
        {t('atl.empty_body', locale)}
      </p>
      <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <li>
          <Link
            href="/spar"
            className="block border-2 border-ink bg-[#F8C75E] px-3 py-2 text-center text-[11px] tracking-[0.18em] text-[#1A1820] hover:bg-acc"
            style={{
              fontFamily: pixel,
              textTransform: 'uppercase',
              boxShadow: '2px 2px 0 0 #2F5D5C',
            }}
          >
            ▶ {t('atl.cta_daily_spar', locale)}
          </Link>
        </li>
        <li>
          <Link
            href="/dilemma"
            className="block border-2 border-ink bg-[#F8C75E] px-3 py-2 text-center text-[11px] tracking-[0.18em] text-[#1A1820] hover:bg-acc"
            style={{
              fontFamily: pixel,
              textTransform: 'uppercase',
              boxShadow: '2px 2px 0 0 var(--color-acc)',
            }}
          >
            ▶ {t('atl.cta_todays_dilemma', locale)}
          </Link>
        </li>
        <li>
          <Link
            href="/pilgrimage"
            className="block border-2 border-ink bg-[#F8C75E] px-3 py-2 text-center text-[11px] tracking-[0.18em] text-[#1A1820] hover:bg-acc"
            style={{
              fontFamily: pixel,
              textTransform: 'uppercase',
              boxShadow: '2px 2px 0 0 #2F5D5C',
            }}
          >
            ▶ {t('atl.cta_the_pilgrimage', locale)}
          </Link>
        </li>
      </ul>
    </div>
  );
}

function BigStat({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div
      className="border-[3px] border-ink bg-[#FFFCF4] p-3 text-center"
      style={{ boxShadow: `3px 3px 0 0 ${color}` }}
    >
      <div
        className="text-[30px] leading-none"
        style={{ fontFamily: pixel, color: 'var(--color-ink)' }}
      >
        {value}
      </div>
      <div
        className="mt-1 text-[9px] tracking-[0.22em]"
        style={{
          fontFamily: pixel,
          color,
          textTransform: 'uppercase',
          letterSpacing: '0.22em',
        }}
      >
        {label}
      </div>
    </div>
  );
}

function SkillBar({ skill, xp, locale }: { skill: Skill; xp: number; locale: Locale }) {
  const meta = SKILL_META[skill];
  const { level, intoLevel, toNext } = levelFromXp(xp);
  const pct = Math.min(100, Math.round((intoLevel / toNext) * 100));
  const cumNext = cumulativeXpForLevel(level + 1);
  return (
    <li>
      <div className="flex items-baseline justify-between gap-2">
        <div
          className="text-[11px] tracking-[0.18em]"
          style={{
            fontFamily: pixel,
            color: meta.color,
            textTransform: 'uppercase',
          }}
        >
          {meta.name}
          <span className="ml-2 text-ink">{t('atl.level', locale, { level })}</span>
        </div>
        <div
          className="text-[10px] tracking-[0.14em] text-acc-deep"
          style={{ fontFamily: pixel, textTransform: 'uppercase' }}
        >
          {t('atl.xp_progress', locale, { xp, next: cumNext })}
        </div>
      </div>
      <div className="mt-1 h-3 border-2 border-ink bg-[#FBF6E8]" title={meta.description}>
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: meta.color,
          }}
        />
      </div>
      <div className="mt-1 text-[12px] italic text-[#5C4528]" style={{ fontFamily: serif }}>
        {meta.description}
      </div>
    </li>
  );
}

function RecentEvents({ events, locale }: { events: CapabilityEvent[]; locale: Locale }) {
  const recent = events.slice(-10).reverse();
  return (
    <div
      className="border-2 border-ink bg-[#FFFCF4] p-4"
      style={{ boxShadow: '3px 3px 0 0 var(--color-acc-deep)' }}
    >
      <div
        className="text-[10px] tracking-[0.22em] text-acc-deep"
        style={{ fontFamily: pixel, textTransform: 'uppercase' }}
      >
        ▶ {t('atl.recent_moves', locale)}
      </div>
      <ul className="mt-2 space-y-1.5">
        {recent.map((e, i) => {
          const meta = SKILL_META[e.skill];
          return (
            <li
              key={i}
              className="flex items-baseline justify-between gap-3 border-l-2 px-3 py-1.5 text-[13px]"
              style={{
                borderColor: meta.color,
                fontFamily: serif,
                background: '#FBF6E8',
              }}
            >
              <span className="text-ink">{e.label ?? labelFromSource(e.source, locale)}</span>
              <span
                className="text-[10px] tracking-[0.18em] whitespace-nowrap"
                style={{
                  fontFamily: pixel,
                  color: meta.color,
                  textTransform: 'uppercase',
                }}
              >
                +{e.xp} {meta.name}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function labelFromSource(source: string, locale: Locale): string {
  const keyMap: Record<string, string> = {
    dilemma: 'atl.src_dilemma',
    diary: 'atl.src_diary',
    exercise: 'atl.src_exercise',
    spar: 'atl.src_spar',
    arena: 'atl.src_arena',
    pilgrimage: 'atl.src_pilgrimage',
    crucible: 'atl.src_crucible',
    anthology: 'atl.src_anthology',
    wandering: 'atl.src_wandering',
    argument_diary: 'atl.src_argument_diary',
    reading_hour: 'atl.src_reading_hour',
    long_letter: 'atl.src_long_letter',
  };
  const key = keyMap[source];
  return key ? t(key, locale) : t('atl.src_default', locale);
}
