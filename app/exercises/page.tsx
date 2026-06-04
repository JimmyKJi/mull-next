// Index page for /exercises — lists the philosophical practices in
// three categories (contemplative / logic / argument), with a daily
// featured exercise + quick-jump nav.
//
// Static for now (no DB, no completion tracking). When the page evolves
// to save user reflections + tie completions to dimensional shifts, that
// wiring goes through a separate migration.

import Link from 'next/link';
import { EXERCISES, CATEGORY_META, type ExerciseCategory } from '@/lib/exercises';
import { localizeExercise } from '@/lib/exercises-i18n';
import { t } from '@/lib/translations';
import { getServerLocale } from '@/lib/locale-server';
import { PixelPageHeader } from '@/components/pixel-window';
import type { Metadata } from 'next';

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";
const serif = "var(--font-prose)";
const sans = "'Inter', system-ui, sans-serif";

export const metadata: Metadata = {
  title: 'Philosophical exercises',
  description: '36 guided practices drawn from the Stoic, Socratic, Buddhist, and analytic traditions. Short. Practical. Done in under 30 minutes.',
  alternates: { canonical: 'https://mull.world/exercises' },
};

/** Featured exercise rotates by day-of-year. Picks from a hand-chosen
 *  subset that reads well as the day's starter. */
function pickFeaturedExercise() {
  const featured = [
    'premortem', 'negative-visualization', 'view-from-above', 'memento-mori',
    'morning-intention', 'three-line-evening', 'fallacy-hunt', 'steelmanning',
    'sixty-second-case', 'charitable-interpretation', 'breath-count', 'examen',
  ];
  const now = new Date();
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86_400_000
  );
  const slug = featured[dayOfYear % featured.length];
  return EXERCISES.find(e => e.slug === slug) ?? EXERCISES[0];
}

/** Bucket duration string into a visual category for the time chip. */
function durationBucket(duration: string): { label: string; color: string } {
  // Extract first number from strings like "5 min", "10–15 min".
  const m = duration.match(/(\d+)/);
  const n = m ? parseInt(m[1], 10) : 10;
  if (n <= 5) return { label: '⚡ Quick', color: '#6B7F4F' };
  if (n <= 15) return { label: '◐ Medium', color: '#B8862F' };
  return { label: '◑ Long', color: '#7C5A8C' };
}

export default async function ExercisesPage() {
  const locale = await getServerLocale();
  const featured = pickFeaturedExercise();
  const featuredLocal = localizeExercise(featured, locale);
  const featuredBucket = durationBucket(featured.duration);

  return (
    <main className="mx-auto max-w-[920px] px-5 pb-32 pt-10 sm:px-10">
      <PixelPageHeader
        eyebrow={`▶ ${t('exercises.eyebrow', locale).toUpperCase()}`}
        title={t('exercises.title', locale).toUpperCase()}
        subtitle={
          <p className="text-[16px] italic" style={{ fontFamily: 'var(--font-editorial)' }}>
            {EXERCISES.length} guided practices · {t('exercises.subtitle', locale)}
          </p>
        }
      />

      {/* ─── Featured exercise ─────────────────────────────────── */}
      <section style={{ marginBottom: 36 }}>
        <div style={{
          fontFamily: pixel,
          fontSize: 10,
          color: '#8C6520',
          letterSpacing: 0.6,
          textTransform: 'uppercase',
          marginBottom: 8,
        }}>
          ◇ Try this today
        </div>
        <Link
          href={`/exercises/${featured.slug}`}
          className="pixel-press"
          style={{
            display: 'block',
            padding: '24px 26px',
            background: '#F8EBC9',
            border: '4px solid #221E18',
            boxShadow: '6px 6px 0 0 #B8862F',
            borderRadius: 0,
            textDecoration: 'none',
            color: 'inherit',
            transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end)',
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            gap: 12,
            marginBottom: 10,
            flexWrap: 'wrap',
          }}>
            <h2 style={{
              fontFamily: serif,
              fontSize: 28,
              fontWeight: 500,
              margin: 0,
              letterSpacing: '-0.4px',
              color: '#221E18',
              lineHeight: 1.15,
            }}>
              {featuredLocal.name}
            </h2>
            <span style={{
              fontFamily: pixel,
              fontSize: 10,
              color: featuredBucket.color,
              letterSpacing: 0.5,
              border: `2px solid ${featuredBucket.color}`,
              padding: '3px 8px',
            }}>
              {featuredBucket.label} · {featuredLocal.duration}
            </span>
          </div>
          <p style={{
            fontFamily: serif,
            fontStyle: 'italic',
            fontSize: 17,
            color: '#4A4338',
            margin: '0 0 10px',
            lineHeight: 1.5,
          }}>
            {featuredLocal.summary}
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{
              fontFamily: sans,
              fontSize: 12,
              color: '#8C6520',
              opacity: 0.85,
            }}>
              {featuredLocal.tradition}
            </span>
            <span style={{
              fontFamily: pixel,
              fontSize: 10,
              color: '#8C6520',
              letterSpacing: 0.6,
              textTransform: 'uppercase',
            }}>
              BEGIN ▶
            </span>
          </div>
        </Link>
      </section>

      {/* ─── Quick jump nav ────────────────────────────────────── */}
      <nav style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 28,
        paddingBottom: 16,
        borderBottom: '2px dashed #C2A062',
      }}>
        {(['contemplative', 'logic', 'argument'] as ExerciseCategory[]).map(cat => {
          const meta = CATEGORY_META[cat];
          const count = EXERCISES.filter(e => e.category === cat).length;
          return (
            <a
              key={cat}
              href={`#${cat}`}
              style={{
                fontFamily: pixel,
                fontSize: 9.5,
                padding: '6px 10px',
                border: `2px solid ${meta.accent}`,
                color: meta.accent,
                textDecoration: 'none',
                letterSpacing: 0.5,
                textTransform: 'uppercase',
                background: '#FFFCF4',
              }}
            >
              {t(`excat.${cat}.label`, locale)} · {count}
            </a>
          );
        })}
      </nav>

      {/* ─── Category sections ─────────────────────────────────── */}
      {(['contemplative', 'logic', 'argument'] as ExerciseCategory[]).map(cat => {
        const meta = CATEGORY_META[cat];
        const items = EXERCISES.filter(e => e.category === cat).map(e => localizeExercise(e, locale));
        if (items.length === 0) return null;
        return (
          <section key={cat} id={cat} style={{ marginBottom: 44, scrollMarginTop: 24 }}>
            <h2 style={{
              fontFamily: serif,
              fontSize: 25,
              fontWeight: 500,
              margin: '0 0 6px',
              letterSpacing: '-0.3px',
              color: '#221E18',
            }}>
              {t(`excat.${cat}.label`, locale)}
            </h2>
            <p style={{
              fontFamily: serif,
              fontStyle: 'italic',
              fontSize: 14.5,
              color: '#4A4338',
              margin: '0 0 18px',
              lineHeight: 1.55,
            }}>
              {t(`excat.${cat}.blurb`, locale)}
            </p>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 10,
            }}>
              {items.map(ex => {
                const bucket = durationBucket(ex.duration);
                return (
                  <li key={ex.slug}>
                    <Link href={`/exercises/${ex.slug}`} className="pixel-press" style={{
                      display: 'block',
                      padding: '16px 18px',
                      background: '#FFFCF4',
                      border: '3px solid #221E18',
                      boxShadow: `3px 3px 0 0 ${meta.accent}`,
                      borderRadius: 0,
                      textDecoration: 'none',
                      color: 'inherit',
                      height: '100%',
                      transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end)',
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        justifyContent: 'space-between',
                        gap: 10,
                        marginBottom: 6,
                        flexWrap: 'wrap',
                      }}>
                        <span style={{
                          fontFamily: serif,
                          fontSize: 19,
                          fontWeight: 500,
                          color: '#221E18',
                          lineHeight: 1.2,
                        }}>
                          {ex.name}
                        </span>
                        <span style={{
                          fontFamily: pixel,
                          fontSize: 9,
                          color: bucket.color,
                          letterSpacing: 0.4,
                          border: `1.5px solid ${bucket.color}`,
                          padding: '2px 6px',
                          whiteSpace: 'nowrap',
                        }}>
                          {ex.duration}
                        </span>
                      </div>
                      <p style={{
                        margin: '0 0 8px',
                        fontFamily: serif,
                        fontStyle: 'italic',
                        fontSize: 14,
                        color: '#4A4338',
                        lineHeight: 1.5,
                      }}>
                        {ex.summary}
                      </p>
                      <span style={{
                        fontFamily: sans,
                        fontSize: 11,
                        color: '#8C6520',
                        opacity: 0.85,
                      }}>
                        {ex.tradition}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      <p style={{
        marginTop: 48,
        fontFamily: sans,
        fontSize: 12.5,
        color: '#8C6520',
        opacity: 0.75,
        lineHeight: 1.6,
      }}>
        {t('exercises.footer', locale, { email: 'jimmy.kaian.ji@gmail.com' }).split('jimmy.kaian.ji@gmail.com').map((part, i, arr) => (
          <span key={i}>{part}{i < arr.length - 1 && (
            <a href="mailto:jimmy.kaian.ji@gmail.com" style={{ color: '#8C6520', textDecoration: 'underline', textUnderlineOffset: 3 }}>jimmy.kaian.ji@gmail.com</a>
          )}</span>
        ))}
      </p>
    </main>
  );
}
