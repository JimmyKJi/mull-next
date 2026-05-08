// One exercise — its purpose, steps, and a closing reflection prompt.
// Static content (sourced from lib/exercises.ts). When user reflections
// become saveable, the form goes here.

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { findExercise, EXERCISES } from '@/lib/exercises';
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
    <main style={{ maxWidth: 720, margin: '60px auto', padding: '0 24px 120px' }}>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 36,
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <Link href="/exercises" style={{
          fontFamily: sans,
          fontSize: 13,
          color: '#4A4338',
          textDecoration: 'none',
        }}>
          {t('exercises.all', locale)}
        </Link>
        <LanguageSwitcher initial={locale} />
      </header>

      <div style={{
        fontFamily: sans,
        fontSize: 11,
        fontWeight: 600,
        color: '#8C6520',
        textTransform: 'uppercase',
        letterSpacing: '0.18em',
        marginBottom: 12,
      }}>
        {ex.tradition} · {ex.duration}
      </div>
      <h1 style={{
        fontFamily: serif,
        fontSize: 44,
        fontWeight: 500,
        margin: '0 0 12px',
        letterSpacing: '-0.5px',
        lineHeight: 1.05,
      }}>
        {ex.name}
      </h1>
      <p style={{
        fontFamily: serif,
        fontStyle: 'italic',
        fontSize: 19,
        color: '#4A4338',
        margin: '0 0 36px',
        lineHeight: 1.55,
      }}>
        {ex.summary}
      </p>

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
        background: '#F5EFDC',
        borderLeft: '3px solid #B8862F',
        borderRadius: 8,
      }}>
        <div style={{
          fontFamily: sans,
          fontSize: 11,
          fontWeight: 600,
          color: '#8C6520',
          textTransform: 'uppercase',
          letterSpacing: '0.18em',
          marginBottom: 10,
        }}>
          {t('exercises.after', locale)}
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

      <p style={{
        textAlign: 'center',
        marginTop: 48,
        fontFamily: sans,
        fontSize: 13,
      }}>
        <Link href="/exercises" style={{ color: '#8C6520', textDecoration: 'underline', textUnderlineOffset: 3 }}>
          {t('exercises.all', locale)}
        </Link>
      </p>
    </main>
  );
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
