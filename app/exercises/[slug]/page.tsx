// One exercise — its purpose, steps, and a closing reflection prompt.
// Static content (sourced from lib/exercises.ts). When user reflections
// become saveable, the form goes here.

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { findExercise, EXERCISES } from '@/lib/exercises';
import { EXERCISE_EXTRAS } from '@/lib/exercises-extras';
import { localizeExercise } from '@/lib/exercises-i18n';
import { getServerLocale } from '@/lib/locale-server';
import { t } from '@/lib/translations';
import LanguageSwitcher from '@/components/language-switcher';
import { createClient } from '@/utils/supabase/server';
import ReflectionForm from './reflection-form';
import type { Metadata } from 'next';

const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'Inter', system-ui, sans-serif";

export async function generateStaticParams() {
  return EXERCISES.map(e => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const ex = findExercise(slug);
  if (!ex) return { title: 'Exercise not found' };
  return {
    title: ex.name,
    description: ex.summary,
    openGraph: {
      title: `${ex.name} — Mull`,
      description: ex.summary,
      url: `https://mull.world/exercises/${ex.slug}`,
      siteName: 'Mull',
      type: 'article',
    },
    alternates: { canonical: `https://mull.world/exercises/${ex.slug}` },
  };
}

export default async function ExercisePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const original = findExercise(slug);
  if (!original) notFound();
  const locale = await getServerLocale();
  const ex = localizeExercise(original, locale);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isAuthed = !!user;

  return (
    <main className="mx-auto max-w-[820px] px-6 pb-32 pt-10 sm:px-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <Link
          href="/exercises"
          className="text-[13px] text-[#4A4338] hover:text-[#221E18] hover:underline"
        >
          ← {t('exercises.all', locale)}
        </Link>
        <LanguageSwitcher initial={locale} />
      </div>

      <div
        className="flex flex-wrap items-center gap-3 text-[10px] tracking-[0.22em] text-[#8C6520]"
        style={{ fontFamily: 'var(--font-pixel-display)' }}
      >
        <span aria-hidden className="inline-block h-2 w-2 bg-[#B8862F]" />
        <span>▶ {ex.tradition.toUpperCase()}</span>
        <span className="opacity-60">·</span>
        <span className="text-[#221E18]">{ex.duration.toUpperCase()}</span>
      </div>

      <h1
        className="mt-5 pr-2 text-[26px] leading-[1.1] tracking-[0.04em] text-[#221E18] sm:text-[36px] md:text-[44px]"
        style={{ fontFamily: 'var(--font-pixel-display)' }}
      >
        <span style={{ textShadow: '3px 3px 0 #B8862F' }}>
          {ex.name.toUpperCase()}
        </span>
      </h1>

      <p
        className="mt-6 text-[18px] italic leading-[1.55] text-[#4A4338]"
        style={{ fontFamily: 'var(--font-prose)' }}
      >
        {ex.summary}
      </p>

      <div className="mt-8" />

      <Section title={t('exercises.about', locale)}>
        {locale !== 'en' && (
          <p style={{
            fontSize: 12.5,
            color: '#8C6520',
            fontStyle: 'italic',
            opacity: 0.85,
            marginBottom: 14,
          }}>
            {t('i18n.untranslated_short', locale)}
          </p>
        )}
        {ex.about.split('\n').filter(Boolean).map((p, i) => (
          <p key={i} style={{ margin: '0 0 14px' }}>{p}</p>
        ))}
      </Section>

      <Section title={t('exercises.steps', locale)}>
        <ol style={{
          margin: 0,
          padding: 0,
          listStyle: 'none',
          counterReset: 'step',
        }}>
          {ex.steps.map((s, i) => (
            <li key={i} style={{
              padding: '14px 0 14px 50px',
              borderBottom: i === ex.steps.length - 1 ? 'none' : '1px solid #EBE3CA',
              position: 'relative',
              fontFamily: sans,
              fontSize: 15,
              color: '#221E18',
              lineHeight: 1.6,
            }}>
              <span style={{
                position: 'absolute',
                left: 0,
                top: 14,
                fontFamily: serif,
                fontSize: 22,
                fontWeight: 500,
                color: '#8C6520',
                lineHeight: 1,
              }}>
                {i + 1}.
              </span>
              {s}
            </li>
          ))}
        </ol>
      </Section>

      <div style={{
        marginTop: 36,
        padding: '22px 26px',
        background: '#F8EDC8',
        border: '4px solid #221E18',
        boxShadow: '5px 5px 0 0 #B8862F',
        borderRadius: 0,
      }}>
        <div style={{
          fontFamily: 'var(--font-pixel-display)',
          fontSize: 11,
          color: '#8C6520',
          textTransform: 'uppercase',
          letterSpacing: '0.18em',
          marginBottom: 12,
        }}>
          ▸ {t('exercises.after', locale).toUpperCase()}
        </div>
        <p style={{
          margin: 0,
          fontFamily: serif,
          fontStyle: 'italic',
          fontSize: 18,
          color: '#221E18',
          lineHeight: 1.55,
        }}>
          {ex.reflection}
        </p>
        <p style={{
          marginTop: 14,
          fontFamily: sans,
          fontSize: 12.5,
          color: '#8C6520',
          opacity: 0.8,
          lineHeight: 1.55,
        }}>
          {t('exercises.diary_note', locale)}
        </p>
      </div>

      <ReflectionForm slug={ex.slug} isAuthed={isAuthed} locale={locale} />

      {/* Deeper content — only renders when present in EXERCISE_EXTRAS.
          English-only for now (matches the policy for archetype detail
          pages and philosopher entries). */}
      {EXERCISE_EXTRAS[slug] && (
        <ExerciseExtrasSection slug={slug} extras={EXERCISE_EXTRAS[slug]} locale={locale} />
      )}

      {/* Back-navigation footer — paired pixel chips so users coming
          from the trajectory list, the exercise index, or the
          archetype's "suggested exercises" section have an obvious
          path back. Account-trajectory only renders if the user has
          one (we don't know that here without auth) so we always
          show both and let the user choose. */}
      <nav
        aria-label="Continue elsewhere"
        style={{
          marginTop: 56,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          justifyContent: 'center',
          paddingTop: 24,
          borderTop: '2px dashed #D6CDB6',
        }}
      >
        <Link
          href="/exercises"
          className="pixel-press"
          style={{
            display: 'inline-block',
            padding: '10px 16px',
            background: '#FFFCF4',
            color: '#7A4A2E',
            border: '3px solid #221E18',
            boxShadow: '3px 3px 0 0 #7A4A2E',
            borderRadius: 0,
            fontFamily: 'var(--font-pixel-display)',
            fontSize: 11,
            letterSpacing: 0.4,
            textDecoration: 'none',
            textTransform: 'uppercase',
            transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end)',
          }}
        >
          ◂ {t('exercises.all', locale).toUpperCase()}
        </Link>
        <Link
          href="/account#shifts"
          className="pixel-press"
          style={{
            display: 'inline-block',
            padding: '10px 16px',
            background: '#221E18',
            color: '#FAF6EC',
            border: '3px solid #221E18',
            boxShadow: '3px 3px 0 0 #B8862F',
            borderRadius: 0,
            fontFamily: 'var(--font-pixel-display)',
            fontSize: 11,
            letterSpacing: 0.4,
            textDecoration: 'none',
            textTransform: 'uppercase',
            transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end)',
          }}
        >
          ▸ YOUR TRAJECTORY
        </Link>
      </nav>
    </main>
  );
}

import type { ExerciseExtras } from '@/lib/exercises-extras';
import type { Locale } from '@/lib/translations';

function ExerciseExtrasSection({
  slug, extras, locale,
}: {
  slug: string;
  extras: ExerciseExtras;
  locale: Locale;
}) {
  const sibs = (extras.relatedExercises || [])
    .map(s => EXERCISES.find(e => e.slug === s))
    .filter((x): x is NonNullable<typeof x> => !!x);

  return (
    <div style={{ marginTop: 48 }}>
      {locale !== 'en' && (
        <p style={{
          fontFamily: sans, fontSize: 12.5, color: '#8C6520',
          fontStyle: 'italic', opacity: 0.85, marginBottom: 18,
          padding: '10px 14px', background: '#F5EFDC',
          borderLeft: '3px solid #B8862F', borderRadius: 6,
        }}>
          {t('i18n.untranslated_short', locale)}
        </p>
      )}

      {extras.longerAbout && (
        <Section title={t('exercises.deeper', locale)}>
          {extras.longerAbout.split('\n\n').map((p, i) => (
            <p key={i} style={{ margin: '0 0 14px' }}>{p}</p>
          ))}
        </Section>
      )}

      {extras.commonPitfalls && extras.commonPitfalls.length > 0 && (
        <Section title={t('exercises.pitfalls', locale)}>
          <ul style={{ margin: 0, padding: '0 0 0 20px', display: 'grid', gap: 10 }}>
            {extras.commonPitfalls.map((p, i) => (
              <li key={i} style={{ lineHeight: 1.6 }}>{p}</li>
            ))}
          </ul>
        </Section>
      )}

      {extras.workedExample && (
        <Section title={t('exercises.example', locale)}>
          <p style={{
            margin: 0, fontStyle: 'italic',
            padding: '14px 18px', background: '#FBFAF2',
            borderLeft: '3px solid #2F5D5C', borderRadius: 6,
            lineHeight: 1.7,
          }}>
            {extras.workedExample}
          </p>
        </Section>
      )}

      {extras.relatedThinkers && extras.relatedThinkers.length > 0 && (
        <Section title={t('exercises.thinkers', locale)}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
            {extras.relatedThinkers.map((thinker, i) => (
              <li key={i} style={{
                padding: '10px 14px', background: '#FFFCF4',
                border: '2px solid #221E18', borderRadius: 0,
              }}>
                <strong style={{ color: '#221E18' }}>{thinker.name}</strong>
                <span style={{ color: '#4A4338' }}> — {thinker.note}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {extras.furtherReading && extras.furtherReading.length > 0 && (
        <Section title={t('exercises.further_reading', locale)}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12 }}>
            {extras.furtherReading.map((book, i) => (
              <li key={i} style={{
                padding: '12px 16px', background: '#FFFCF4',
                border: '3px solid #221E18',
                boxShadow: '3px 3px 0 0 #B8862F',
                borderRadius: 0,
              }}>
                <div style={{
                  fontFamily: serif, fontSize: 17, color: '#221E18',
                  marginBottom: 2, lineHeight: 1.3,
                }}>
                  {book.title}
                </div>
                <div style={{
                  fontFamily: sans, fontSize: 12,
                  color: '#8C6520', marginBottom: 6, letterSpacing: 0.2,
                }}>
                  {book.author}{book.year ? ` · ${book.year}` : ''}
                </div>
                <p style={{ margin: 0, fontSize: 14, color: '#4A4338', lineHeight: 1.55 }}>{book.note}</p>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {sibs.length > 0 && (
        <Section title={t('exercises.related', locale)}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
            {sibs.map(rex => (
              <li key={rex.slug}>
                <Link
                  href={`/exercises/${rex.slug}`}
                  className="pixel-press"
                  style={{
                    display: 'block', padding: '12px 16px',
                    background: '#FFFCF4',
                    border: '3px solid #221E18',
                    boxShadow: '3px 3px 0 0 #2F5D5C',
                    borderRadius: 0, textDecoration: 'none', color: 'inherit',
                    transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end)',
                  }}
                >
                  <div style={{ fontFamily: serif, fontSize: 17, color: '#221E18' }}>
                    {rex.name} →
                  </div>
                  <p style={{ margin: '2px 0 0', fontSize: 13.5, color: '#4A4338' }}>{rex.summary}</p>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {extras.kindredPractices && extras.kindredPractices.length > 0 && (
        <Section title={t('exercises.kindred', locale)}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
            {extras.kindredPractices.map((kp, i) => (
              <li key={i} style={{ padding: '8px 0', borderBottom: '1px solid #EBE3CA' }}>
                <strong style={{ color: '#221E18' }}>{kp.name}</strong>
                <span style={{ color: '#4A4338' }}> — {kp.note}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
  void slug;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{
      marginBottom: 36,
      paddingTop: 24,
      borderTop: '1px solid #EBE3CA',
    }}>
      <h2 style={{
        fontFamily: serif,
        fontSize: 22,
        fontWeight: 500,
        margin: '0 0 14px',
        letterSpacing: '-0.2px',
        color: '#221E18',
      }}>
        {title}
      </h2>
      <div style={{
        fontFamily: sans,
        fontSize: 15.5,
        color: '#4A4338',
        lineHeight: 1.65,
      }}>
        {children}
      </div>
    </section>
  );
}
