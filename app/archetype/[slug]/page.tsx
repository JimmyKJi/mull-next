// /archetype/[slug] — long-form archetype profile.
// Public, indexable, statically generated for the 10 known keys.
//
// Sections in order: hero (figure + name + spirit), detailedAbout, quotes,
// reading list, kindred thinkers, what it gets right, where it falters,
// day in the life, dominant dimensions, suggested exercises, suggested
// dilemma themes, footer with link to take the quiz.

import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ARCHETYPES, archetypeKeys, getArchetypeByKey } from '@/lib/archetypes';
import { FIGURES } from '@/lib/figures';
import { DIM_NAMES } from '@/lib/dimensions';
import { EXERCISES } from '@/lib/exercises';
import { PHILOSOPHERS, philosopherSlug } from '@/lib/philosophers';
import { getServerLocale } from '@/lib/locale-server';
import { t } from '@/lib/translations';
import LanguageSwitcher from '@/components/language-switcher';

const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'Inter', system-ui, sans-serif";

export function generateStaticParams() {
  return archetypeKeys().map(slug => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = getArchetypeByKey(slug);
  if (!a) return { title: 'Archetype not found' };

  // Use the English name for SEO predictability.
  const enName = a.key.charAt(0).toUpperCase() + a.key.slice(1);
  // Built dynamically by app/archetype/[slug]/opengraph-image.tsx and
  // routed by Next as /archetype/<slug>/opengraph-image. Twitter wants
  // the large-image card; Facebook/LinkedIn pick this up automatically
  // from the openGraph.images entry.
  const ogImage = `https://mull.world/archetype/${slug}/opengraph-image`;
  return {
    title: `The ${enName}`,
    description: a.spirit,
    openGraph: {
      title: `The ${enName} — Mull`,
      description: a.spirit,
      url: `https://mull.world/archetype/${slug}`,
      siteName: 'Mull',
      type: 'article',
      images: [{ url: ogImage, width: 1200, height: 630, alt: `The ${enName} — Mull` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `The ${enName} — Mull`,
      description: a.spirit,
      images: [ogImage],
    },
    alternates: { canonical: `https://mull.world/archetype/${slug}` },
  };
}

export default async function ArchetypeDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const archetype = getArchetypeByKey(slug);
  if (!archetype) notFound();

  const locale = await getServerLocale();
  const name = t(`arch.${archetype.key}.name`, locale) || archetype.key;
  const blurb = t(`arch.${archetype.key}.blurb`, locale) || '';
  const svg = FIGURES[archetype.key] || '';

  // Resolve suggested exercises by slug.
  const exerciseObjs = archetype.suggestedExercises
    .map(s => EXERCISES.find(e => e.slug === s))
    .filter((x): x is NonNullable<typeof x> => !!x);

  // Resolve dominant dimensions by key.
  const dimensions = archetype.dominantDimensions
    .map(k => ({ key: k, name: DIM_NAMES[k as keyof typeof DIM_NAMES] || k }));

  // Other archetypes to suggest at the bottom.
  const others = ARCHETYPES.filter(a => a.key !== archetype.key);

  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '60px 24px 120px' }}>
      <header style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        marginBottom: 36, gap: 16, flexWrap: 'wrap'
      }}>
        <Link href="/" style={{
          fontFamily: serif, fontSize: 28, fontWeight: 500,
          color: '#221E18', textDecoration: 'none', letterSpacing: '-0.5px'
        }}>
          Mull<span style={{ color: '#B8862F' }}>.</span>
        </Link>
        <nav style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <LanguageSwitcher initial={locale} />
          <Link href="/archetype" style={{
            fontFamily: sans, fontSize: 13, color: '#4A4338',
            textDecoration: 'none', letterSpacing: 0.3,
          }}>
            ← {t('arch_detail.back_to_index', locale)}
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section style={{ marginBottom: 40 }}>
        <div style={{
          display: 'flex', gap: 22, alignItems: 'flex-start',
          flexWrap: 'wrap',
        }}>
          <div
            style={{ width: 110, height: 110, flexShrink: 0 }}
            aria-hidden
            dangerouslySetInnerHTML={{ __html: svg }}
          />
          <div style={{ flex: '1 1 320px', minWidth: 0 }}>
            <div style={{
              fontFamily: sans, fontSize: 11, fontWeight: 600,
              color: '#8C6520', textTransform: 'uppercase',
              letterSpacing: '0.18em', marginBottom: 8,
            }}>
              {t('arch_detail.eyebrow', locale)}
            </div>
            <h1 style={{
              fontFamily: serif, fontSize: 42, fontWeight: 500,
              margin: '0 0 8px', letterSpacing: '-0.4px', lineHeight: 1.05,
            }}>
              {name}
            </h1>
            <p style={{
              fontFamily: serif, fontStyle: 'italic',
              fontSize: 19, color: '#8C6520',
              margin: 0, lineHeight: 1.4,
            }}>
              {archetype.spirit}
            </p>
          </div>
        </div>

        {blurb && (
          <p style={{
            fontFamily: sans, fontSize: 16,
            color: '#4A4338', lineHeight: 1.65,
            margin: '24px 0 0', padding: '14px 18px',
            background: '#FFFCF4', borderLeft: '3px solid #B8862F',
            borderRadius: 6,
          }}>
            {blurb}
          </p>
        )}
      </section>

      <Section title={t('arch_detail.section_about', locale)}>
        {archetype.detailedAbout.split('\n\n').map((para, i) => (
          <p key={i} style={paragraphStyle}>{para}</p>
        ))}
      </Section>

      <Section title={t('arch_detail.section_quotes', locale)}>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 18 }}>
          {archetype.quotes.map((q, i) => (
            <li key={i} style={{
              padding: '14px 18px', background: '#FFFCF4',
              borderLeft: '3px solid #D6CDB6', borderRadius: 6,
            }}>
              <p style={{
                fontFamily: serif, fontStyle: 'italic',
                fontSize: 17, color: '#221E18',
                margin: '0 0 6px', lineHeight: 1.5,
              }}>
                &ldquo;{q.text}&rdquo;
              </p>
              <p style={{
                fontFamily: sans, fontSize: 12,
                color: '#8C6520', margin: 0, letterSpacing: 0.3,
              }}>
                — {q.attribution}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      <Section title={t('arch_detail.section_reading', locale)}>
        <p style={{ ...paragraphStyle, marginBottom: 18, color: '#4A4338', fontSize: 14, fontStyle: 'italic' }}>
          {t('arch_detail.reading_helper', locale)}
        </p>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 14 }}>
          {archetype.readingList.map((book, i) => (
            <li key={i} style={{
              padding: '14px 18px', background: '#FFFCF4',
              border: '1px solid #EBE3CA', borderRadius: 8,
            }}>
              <div style={{
                fontFamily: serif, fontSize: 18, fontWeight: 500,
                color: '#221E18', marginBottom: 2, lineHeight: 1.3,
              }}>
                {book.title}
              </div>
              <div style={{
                fontFamily: sans, fontSize: 12.5,
                color: '#8C6520', marginBottom: 6, letterSpacing: 0.2,
              }}>
                {book.author}{book.year ? ` · ${book.year}` : ''}
              </div>
              <p style={{
                fontFamily: sans, fontSize: 14,
                color: '#4A4338', margin: 0, lineHeight: 1.55,
              }}>
                {book.note}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      <Section title={t('arch_detail.section_kindred', locale)}>
        <p style={{ ...paragraphStyle, marginBottom: 12 }}>
          {t('arch_detail.kindred_helper', locale)}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {archetype.kindredThinkers.map((thinker, i) => {
            // If this kindred-thinker name matches a philosopher in the
            // constellation, link the chip to their /philosopher/[slug]
            // page. Otherwise render as a static chip (for thinkers
            // who're listed by category, e.g. "the Hebrew prophets").
            const matched = PHILOSOPHERS.find(p =>
              p.name.toLowerCase() === thinker.toLowerCase() ||
              p.aliases.some(a => a.toLowerCase() === thinker.toLowerCase())
            );
            const chipStyle: React.CSSProperties = {
              padding: '6px 12px',
              background: '#F5EFDC',
              border: '1px solid #E2D8B6',
              borderRadius: 999,
              fontFamily: sans, fontSize: 13.5, color: '#221E18',
              letterSpacing: 0.2,
              textDecoration: 'none',
              display: 'inline-block',
            };
            if (matched) {
              return (
                <Link
                  key={i}
                  href={`/philosopher/${philosopherSlug(matched.name)}`}
                  style={chipStyle}
                >
                  {thinker} →
                </Link>
              );
            }
            return (
              <span key={i} style={chipStyle}>
                {thinker}
              </span>
            );
          })}
        </div>
      </Section>

      <div style={{
        display: 'grid', gap: 18,
        // auto-fit minmax so the pair collapses to one column on
        // narrow screens; otherwise the two paragraphs become
        // ~140px wide on a phone and unreadable.
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        marginBottom: 32,
      }}>
        <SidedSection
          title={t('arch_detail.section_get_right', locale)}
          tone="positive"
          body={archetype.whatItGetsRight}
        />
        <SidedSection
          title={t('arch_detail.section_falter', locale)}
          tone="caution"
          body={archetype.whereItFalters}
        />
      </div>

      <Section title={t('arch_detail.section_dayinlife', locale)}>
        <p style={{ ...paragraphStyle, fontStyle: 'italic', fontSize: 16.5 }}>
          {archetype.dayInTheLife}
        </p>
      </Section>

      <Section title={t('arch_detail.section_dimensions', locale)}>
        <p style={{ ...paragraphStyle, marginBottom: 14 }}>
          {t('arch_detail.dimensions_helper', locale)}
        </p>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
          {dimensions.map((d, i) => {
            const dimName = t(`dim.${d.key}.name`, locale) || d.name;
            const dimDesc = t(`dim.${d.key}.desc`, locale) || '';
            return (
              <li key={i} style={{
                padding: '12px 16px', background: '#FBFAF2',
                borderLeft: '3px solid #2F5D5C', borderRadius: 6,
              }}>
                <div style={{
                  fontFamily: sans, fontSize: 11, fontWeight: 600,
                  color: '#2F5D5C', textTransform: 'uppercase',
                  letterSpacing: '0.16em',
                }}>
                  {d.key}
                </div>
                <div style={{
                  fontFamily: serif, fontSize: 17, color: '#221E18',
                  margin: '2px 0 4px', fontWeight: 500,
                }}>
                  {dimName}
                </div>
                <p style={{
                  fontFamily: sans, fontSize: 13.5,
                  color: '#4A4338', margin: 0, lineHeight: 1.5,
                }}>
                  {dimDesc}
                </p>
              </li>
            );
          })}
        </ul>
      </Section>

      {exerciseObjs.length > 0 && (
        <Section title={t('arch_detail.section_exercises', locale)}>
          <p style={{ ...paragraphStyle, marginBottom: 14 }}>
            {t('arch_detail.exercises_helper', locale)}
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
            {exerciseObjs.map(ex => (
              <li key={ex.slug}>
                <Link
                  href={`/exercises/${ex.slug}`}
                  style={{
                    display: 'block', padding: '12px 16px',
                    background: '#FFFCF4', border: '1px solid #EBE3CA',
                    borderRadius: 8, textDecoration: 'none', color: 'inherit',
                  }}
                >
                  <div style={{
                    fontFamily: serif, fontSize: 17, fontWeight: 500,
                    color: '#221E18', marginBottom: 2,
                  }}>
                    {ex.name} →
                  </div>
                  <p style={{
                    fontFamily: sans, fontSize: 13.5, color: '#4A4338',
                    margin: 0, lineHeight: 1.5,
                  }}>
                    {ex.summary}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title={t('arch_detail.section_other', locale)}>
        <p style={{ ...paragraphStyle, marginBottom: 14 }}>
          {t('arch_detail.other_helper', locale)}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {others.map(a => {
            const otherName = t(`arch.${a.key}.name`, locale) || a.key;
            return (
              <Link
                key={a.key}
                href={`/archetype/${a.key}`}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '8px 14px',
                  background: '#FFFCF4', border: '1px solid #D6CDB6',
                  borderRadius: 999, textDecoration: 'none', color: '#221E18',
                  fontFamily: sans, fontSize: 13,
                }}
              >
                <span style={{
                  display: 'inline-block', width: 22, height: 22,
                }}
                  aria-hidden
                  dangerouslySetInnerHTML={{ __html: FIGURES[a.key] || '' }}
                />
                {otherName}
              </Link>
            );
          })}
        </div>
      </Section>

      <div style={{
        marginTop: 32, padding: '20px 24px',
        background: '#F5EFDC', border: '1px solid #E2D8B6',
        borderLeft: '3px solid #B8862F', borderRadius: 8,
        textAlign: 'center',
      }}>
        <p style={{
          fontFamily: serif, fontSize: 17, color: '#221E18',
          margin: '0 0 14px', lineHeight: 1.5,
        }}>
          {t('arch_detail.cta_unsure', locale)}
        </p>
        <Link href="/" style={{
          display: 'inline-block',
          padding: '10px 22px', background: '#221E18', color: '#FAF6EC',
          borderRadius: 6, textDecoration: 'none',
          fontFamily: sans, fontSize: 14, fontWeight: 500,
        }}>
          {t('arch_detail.cta_take_quiz', locale)}
        </Link>
      </div>
    </main>
  );
}

const paragraphStyle: React.CSSProperties = {
  fontFamily: sans, fontSize: 15.5,
  color: '#4A4338', lineHeight: 1.7, margin: '0 0 14px',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{
      marginBottom: 36, paddingTop: 28, borderTop: '1px solid #EBE3CA',
    }}>
      <h2 style={{
        fontFamily: serif, fontSize: 26, fontWeight: 500,
        margin: '0 0 16px', letterSpacing: '-0.3px', color: '#221E18',
      }}>
        {title}
      </h2>
      <div>{children}</div>
    </section>
  );
}

function SidedSection({
  title, body, tone,
}: {
  title: string;
  body: string;
  tone: 'positive' | 'caution';
}) {
  const accent = tone === 'positive' ? '#2F5D5C' : '#8C6520';
  return (
    <section style={{
      padding: '20px 22px',
      background: '#FFFCF4', border: '1px solid #EBE3CA',
      borderTop: `3px solid ${accent}`, borderRadius: 8,
    }}>
      <h3 style={{
        fontFamily: sans, fontSize: 11, fontWeight: 600,
        color: accent, textTransform: 'uppercase',
        letterSpacing: '0.18em', margin: '0 0 10px',
      }}>
        {title}
      </h3>
      <p style={{
        fontFamily: sans, fontSize: 14, color: '#4A4338',
        margin: 0, lineHeight: 1.65,
      }}>
        {body}
      </p>
    </section>
  );
}
