// Index page for /exercises — lists the starter set of philosophical
// practices. Each card links to its detail page at /exercises/[slug].
//
// Static for now (no DB, no completion tracking). When the page evolves to
// save user reflections + tie completions to dimensional shifts, that
// wiring goes through a separate migration.

import Link from 'next/link';
import { EXERCISES, CATEGORY_META, type ExerciseCategory } from '@/lib/exercises';
import { localizeExercise } from '@/lib/exercises-i18n';
import { t } from '@/lib/translations';
import { getServerLocale } from '@/lib/locale-server';
import LanguageSwitcher from '@/components/language-switcher';
import type { Metadata } from 'next';

const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'Inter', system-ui, sans-serif";

export const metadata: Metadata = {
  title: 'Philosophical exercises',
  description: 'Guided practices drawn from the Stoic, Socratic, and Buddhist traditions. Short. Practical.',
  alternates: { canonical: 'https://mull.world/exercises' },
};

export default async function ExercisesPage() {
  const locale = await getServerLocale();

  return (
    <main style={{ maxWidth: 760, margin: '60px auto', padding: '0 24px 120px' }}>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 36,
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <Link href="/" style={{
          fontFamily: serif,
          fontSize: 28,
          fontWeight: 500,
          color: '#221E18',
          textDecoration: 'none',
          letterSpacing: '-0.5px',
        }}>
          Mull<span style={{ color: '#B8862F' }}>.</span>
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
        marginBottom: 14,
      }}>
        {t('exercises.eyebrow', locale)}
      </div>
      <h1 style={{
        fontFamily: serif,
        fontSize: 42,
        fontWeight: 500,
        margin: '0 0 12px',
        letterSpacing: '-0.5px',
      }}>
        {t('exercises.title', locale)}
      </h1>
      <p style={{
        fontFamily: serif,
        fontStyle: 'italic',
        fontSize: 18,
        color: '#4A4338',
        margin: '0 0 36px',
        lineHeight: 1.55,
      }}>
        {t('exercises.subtitle', locale)}
      </p>

      {(['contemplative', 'logic', 'argument'] as ExerciseCategory[]).map(cat => {
        const meta = CATEGORY_META[cat];
        const items = EXERCISES.filter(e => e.category === cat).map(e => localizeExercise(e, locale));
        if (items.length === 0) return null;
        return (
          <section key={cat} style={{ marginBottom: 48 }}>
            <h2 style={{
              fontFamily: serif,
              fontSize: 28,
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
              fontSize: 15.5,
              color: '#4A4338',
              margin: '0 0 18px',
              lineHeight: 1.55,
            }}>
              {t(`excat.${cat}.blurb`, locale)}
            </p>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {items.map(ex => (
                <li key={ex.slug}>
                  <Link href={`/exercises/${ex.slug}`} style={{
                    display: 'block',
                    padding: '18px 20px',
                    background: '#FFFCF4',
                    border: '1px solid #EBE3CA',
                    borderLeft: '3px solid ' + meta.accent,
                    borderRadius: 10,
                    textDecoration: 'none',
                    color: 'inherit',
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      justifyContent: 'space-between',
                      gap: 12,
                      marginBottom: 6,
                      flexWrap: 'wrap',
                    }}>
                      <span style={{
                        fontFamily: serif,
                        fontSize: 21,
                        fontWeight: 500,
                        color: '#221E18',
                      }}>
                        {ex.name}
                      </span>
                      <span style={{
                        fontFamily: sans,
                        fontSize: 12,
                        color: '#8C6520',
                      }}>
                        {ex.duration}
                      </span>
                    </div>
                    <p style={{
                      margin: '0 0 6px',
                      fontFamily: serif,
                      fontStyle: 'italic',
                      fontSize: 15,
                      color: '#4A4338',
                      lineHeight: 1.55,
                    }}>
                      {ex.summary}
                    </p>
                    <span style={{
                      fontFamily: sans,
                      fontSize: 12,
                      color: '#8C6520',
                      opacity: 0.85,
                    }}>
                      {ex.tradition}
                    </span>
                  </Link>
                </li>
              ))}
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
