// Adaptive "what's next" prompt for the /account top section.
//
// Surfaces a single high-value next action based on user state:
//   - Took the quiz? Direct them to today's dilemma.
//   - Answered today's dilemma + low streak? Encourage tomorrow's.
//   - Hot streak? Suggest sharing.
//   - No quiz yet? (Handled elsewhere by the FirstStepCard grid;
//     we render null here.)
//
// Static / server component — takes pre-computed flags from the
// /account page so we don't double-fetch.
//
// v3 pixel chrome: chunky 4px ink border + accent-colored hard
// shadow that matches the branch's accent color. The CTA is a
// pixel button with stepped hover.

import Link from 'next/link';
import { t, type Locale } from '@/lib/translations';

const serif = "var(--font-prose)";
const pixel = "var(--font-pixel-display, 'Courier New', monospace)";

type Props = {
  quizCount: number;
  respondedToday: boolean;
  streak: number;
  hasShareable: boolean;       // user has at least one quiz attempt to share
  topArchetypeKey?: string;
  locale?: Locale;
};

export default function NextActionCard({
  quizCount, respondedToday, streak, hasShareable, topArchetypeKey, locale = 'en',
}: Props) {
  // No quiz yet → caller already shows the FirstStepCard grid; render
  // nothing here so the two don't fight for attention.
  if (quizCount === 0) return null;

  let eyebrow: string;
  let title: string;
  let body: string;
  let cta: string;
  let href: string;
  let accent: string;

  if (!respondedToday) {
    eyebrow = t('uic.next_today_eyebrow', locale);
    title = t('uic.next_today_title', locale);
    body = t('uic.next_today_body', locale);
    cta = t('uic.next_today_cta', locale);
    href = '/dilemma';
    accent = 'var(--color-acc)';
  } else if (streak >= 7 && hasShareable && topArchetypeKey) {
    eyebrow = t('uic.next_streak_eyebrow', locale, { n: streak });
    title = t('uic.next_week_title', locale);
    body = t('uic.next_week_body', locale);
    cta = t('uic.next_week_cta', locale);
    href = `/share/${topArchetypeKey}`;
    accent = '#2F5D5C';
  } else if (streak >= 3) {
    eyebrow = t('uic.next_streak_eyebrow', locale, { n: streak });
    title = t('uic.next_angle_title', locale);
    body = t('uic.next_angle_body', locale);
    cta = t('uic.next_angle_cta', locale);
    href = '/diary';
    accent = '#7A4A2E';
  } else if (streak >= 1) {
    eyebrow = t('uic.next_day_eyebrow', locale, { n: streak });
    title = t('uic.next_tomorrow_title', locale);
    body = t('uic.next_tomorrow_body', locale);
    cta = t('uic.next_tomorrow_cta', locale);
    href = '/account#progression';
    accent = '#2F5D5C';
  } else {
    // respondedToday && streak === 0 — shouldn't normally happen, but
    // be defensive.
    eyebrow = t('uic.next_today_eyebrow', locale);
    title = t('uic.next_done_title', locale);
    body = t('uic.next_done_body', locale);
    cta = t('uic.next_done_cta', locale);
    href = '/account#map';
    accent = '#2F5D5C';
  }

  return (
    <section style={{
      padding: '20px 24px',
      background: '#FFFCF4',
      border: '4px solid var(--color-ink)',
      boxShadow: `5px 5px 0 0 ${accent}`,
      borderRadius: 0,
      marginBottom: 28,
      display: 'flex',
      gap: 18,
      alignItems: 'center',
      flexWrap: 'wrap',
    }}>
      <div style={{ flex: '1 1 320px', minWidth: 0 }}>
        <div style={{
          fontFamily: pixel,
          fontSize: 11,
          color: accent,
          textTransform: 'uppercase',
          letterSpacing: '0.18em',
          marginBottom: 8,
        }}>
          ▸ {eyebrow}
        </div>
        <h2 style={{
          fontFamily: serif,
          fontSize: 22,
          fontWeight: 500,
          color: 'var(--color-ink)',
          margin: '0 0 4px',
          letterSpacing: '-0.3px',
          lineHeight: 1.25,
        }}>
          {title}
        </h2>
        <p style={{
          fontFamily: serif,
          fontStyle: 'italic',
          fontSize: 15,
          color: 'var(--color-ink-soft)',
          margin: 0,
          lineHeight: 1.5,
        }}>
          {body}
        </p>
      </div>
      <Link
        href={href}
        className="pixel-press"
        style={{
          padding: '12px 20px',
          background: 'var(--color-ink)',
          color: 'var(--color-cream)',
          border: '4px solid var(--color-ink)',
          borderRadius: 0,
          boxShadow: `4px 4px 0 0 ${accent}`,
          fontFamily: pixel,
          fontSize: 12,
          letterSpacing: '0.08em',
          textDecoration: 'none',
          flexShrink: 0,
          transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end)',
        }}
      >
        {cta}
      </Link>
    </section>
  );
}
