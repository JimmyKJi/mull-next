// /topic/[slug] — evergreen topic explainer.
//
// SEO-optimised: dynamic Metadata with topic-specific title/description,
// JSON-LD Article schema with mainEntity DefinedTerm, internal links to
// related philosophers + archetypes, canonical URL set. Static generation
// via generateStaticParams so every topic is pre-rendered.

import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { PHILOSOPHERS, philosopherSlug, type PhilosopherEntry } from '@/lib/philosophers';
import { findTopic, TOPICS } from '@/lib/topics';
import { DIM_NAMES, type DimKey } from '@/lib/dimensions';
import { ARCHETYPES } from '@/lib/archetypes';
import { getArchetypeColor } from '@/lib/archetype-colors';
import { ArchetypeSprite } from '@/components/archetype-sprite';
import { PhilosopherSprite } from '@/components/philosopher-sprite';
import { PathwayNext } from '@/components/pathway-next';
import { pathwayForTopic } from '@/lib/pathway';
import { getServerLocale } from '@/lib/locale-server';
import { t } from '@/lib/translations';
import { localizeTopic } from '@/lib/topics-i18n';
import { localizePhilosopher } from '@/lib/philosophers-i18n';
import { localizeArchetype } from '@/lib/archetypes-i18n';

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";
const serif = "var(--font-editorial)";

export function generateStaticParams() {
  return TOPICS.map(t => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const rawTopic = findTopic(slug);
  if (!rawTopic) return { title: 'Topic not found' };
  const locale = await getServerLocale();
  const topic = localizeTopic(rawTopic, locale);
  const url = `https://mull.world/topic/${slug}`;
  const description = topic.summary;
  return {
    title: topic.title,
    description,
    keywords: [
      topic.title.toLowerCase(),
      'philosophy',
      ...topic.philosopherNames.slice(0, 4),
    ].join(', '),
    openGraph: {
      title: `${topic.title} — Mull`,
      description,
      url,
      siteName: 'Mull',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${topic.title} — Mull`,
      description,
    },
    alternates: { canonical: url },
  };
}

export default async function TopicDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const rawTopic = findTopic(slug);
  if (!rawTopic) notFound();
  const locale = await getServerLocale();
  // Localized view for visible prose; rawTopic feeds the (English) JSON-LD.
  const topic = localizeTopic(rawTopic, locale);

  // Localize a related philosopher's display name while keeping the English
  // name for its URL slug and procedural sprite seed.
  const loc = (e: PhilosopherEntry) => localizePhilosopher(e, philosopherSlug(e.name), locale);

  // Resolve curated philosopher names to entries in the 560 corpus.
  // We tolerate misses silently (typo or new addition) and just skip
  // them; the page still renders.
  const philosophers = topic.philosopherNames
    .map(name => PHILOSOPHERS.find(p => p.name === name))
    .filter((p): p is NonNullable<typeof p> => !!p);

  const archetypeEntries = topic.relatedArchetypes
    .map(key => ARCHETYPES.find(a => a.key === key))
    .filter((a): a is NonNullable<typeof a> => !!a)
    .map(a => localizeArchetype(a, locale));

  // JSON-LD: Article + embedded DefinedTerm. Search engines use this
  // to disambiguate from the other things called "Stoicism" on the
  // web and surface rich result candidates.
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: rawTopic.title,
    description: rawTopic.summary,
    url: `https://mull.world/topic/${slug}`,
    inLanguage: 'en',
    mainEntity: {
      '@type': 'DefinedTerm',
      name: rawTopic.title,
      description: rawTopic.summary,
      inDefinedTermSet: {
        '@type': 'DefinedTermSet',
        name: 'Topics in philosophy on Mull',
        url: 'https://mull.world/topic',
      },
    },
    publisher: {
      '@type': 'Organization',
      name: 'Mull',
      url: 'https://mull.world',
    },
    about: philosophers.slice(0, 6).map(p => ({
      '@type': 'Person',
      name: p.name,
      url: `https://mull.world/philosopher/${philosopherSlug(p.name)}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <main className="mx-auto max-w-[760px] px-6 pb-32 pt-10 sm:px-10">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link href="/topic" style={{
            fontFamily: pixel, fontSize: 11,
            color: 'var(--color-ink-soft)', textDecoration: 'none',
            letterSpacing: 0.4, textTransform: 'uppercase',
            display: 'inline-block', padding: '10px 0',
          }}>
            ◂ {t('topic.back_all', locale)}
          </Link>
        </div>

        <div style={{
          fontFamily: pixel,
          fontSize: 12,
          color: 'var(--color-acc-deep)',
          textTransform: 'uppercase',
          letterSpacing: '0.18em',
          marginBottom: 14,
        }}>
          ▸ {t('topic.eyebrow', locale)}
        </div>

        <h1 style={{
          fontFamily: pixel,
          fontSize: 32,
          margin: '0 0 16px',
          color: 'var(--color-ink)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          textShadow: '3px 3px 0 var(--pixel-shadow, var(--color-acc))',
          lineHeight: 1.4,
        }}>
          {topic.title.toUpperCase()}
        </h1>

        <p style={{
          fontFamily: serif,
          fontStyle: 'italic',
          fontSize: 19,
          color: 'var(--color-ink-soft)',
          margin: '0 0 36px',
          lineHeight: 1.55,
          maxWidth: 600,
        }}>
          {topic.summary}
        </p>

        {/* Essay body — paragraphs split on \n\n */}
        <article style={{
          padding: '28px 32px',
          background: '#FFFCF4',
          border: '4px solid var(--color-ink)',
          boxShadow: '5px 5px 0 0 var(--color-acc)',
          borderRadius: 0,
          marginBottom: 36,
        }}>
          {topic.essay.split(/\n\n+/).map((para, i) => (
            <p key={i} style={{
              fontFamily: serif,
              fontSize: 17,
              color: 'var(--color-ink)',
              margin: i === 0 ? '0 0 16px' : '0 0 16px',
              lineHeight: 1.65,
            }}>
              {para}
            </p>
          ))}
        </article>

        {/* Related dimensions */}
        {topic.relevantDimensions.length > 0 && (
          <section style={{ marginBottom: 36 }}>
            <h2 style={sectionH2}>▸ {t('topic.section_dimensions', locale)}</h2>
            <p style={subtitle}>
              {t('topic.dimensions_helper', locale, { title: topic.title })}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
              {topic.relevantDimensions.map(key => (
                <span key={key} style={dimChip}>
                  {t(`dim.${key}.name`, locale) || DIM_NAMES[key as DimKey] || key}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Related philosophers */}
        {philosophers.length > 0 && (
          <section style={{ marginBottom: 36 }}>
            <h2 style={sectionH2}>▸ {t('topic.section_thinkers', locale)}</h2>
            <p style={subtitle}>
              {t('topic.thinkers_helper', locale, { n: PHILOSOPHERS.length })}
            </p>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: '14px 0 0',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 10,
            }}>
              {philosophers.map(p => (
                <li key={p.name}>
                  <Link
                    href={`/philosopher/${philosopherSlug(p.name)}`}
                    className="pixel-press"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 12px',
                      background: '#FFFCF4',
                      border: '3px solid var(--color-ink)',
                      boxShadow: '3px 3px 0 0 var(--color-acc)',
                      borderRadius: 0,
                      textDecoration: 'none',
                      color: 'var(--color-ink)',
                      transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end)',
                    }}
                  >
                    <div className="pixel-crisp" style={{
                      width: 36, height: 36,
                      background: 'var(--color-acc-soft)',
                      border: '2px solid var(--color-ink)',
                      padding: 2,
                      flexShrink: 0,
                    }}>
                      <PhilosopherSprite
                        name={p.name}
                        archetypeKey={p.archetypeKey}
                        size={28}
                      />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{
                        fontFamily: serif,
                        fontSize: 15,
                        fontWeight: 500,
                        color: 'var(--color-ink)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {loc(p).name}
                      </div>
                      <div style={{
                        fontFamily: pixel,
                        fontSize: 9,
                        color: 'var(--color-acc-deep)',
                        letterSpacing: 0.4,
                        textTransform: 'uppercase',
                        marginTop: 2,
                      }}>
                        {loc(p).dates}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Related archetypes — visual hook for the quiz CTA */}
        {archetypeEntries.length > 0 && (
          <section style={{ marginBottom: 36 }}>
            <h2 style={sectionH2}>▸ {t('topic.section_archetypes', locale)}</h2>
            <p style={subtitle}>
              {t('topic.archetypes_helper', locale, { title: topic.title })}
            </p>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: '14px 0 0',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 14,
            }}>
              {archetypeEntries.map(a => {
                const color = getArchetypeColor(a.key);
                return (
                  <li key={a.key}>
                    <Link
                      href={`/archetype/${a.key}`}
                      className="pixel-press"
                      style={{
                        display: 'block',
                        padding: '14px 14px',
                        background: color.soft,
                        border: '3px solid var(--color-ink)',
                        boxShadow: `3px 3px 0 0 ${color.deep}`,
                        borderRadius: 0,
                        textDecoration: 'none',
                        color: 'inherit',
                        transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end)',
                      }}
                    >
                      <div className="pixel-crisp" style={{
                        width: 48, height: 48,
                        background: '#FFFCF4',
                        border: '2px solid var(--color-ink)',
                        padding: 4,
                        marginBottom: 10,
                      }}>
                        <ArchetypeSprite archetypeKey={a.key} size={36} />
                      </div>
                      <div style={{
                        fontFamily: pixel,
                        fontSize: 10,
                        color: color.deep,
                        textTransform: 'uppercase',
                        letterSpacing: '0.18em',
                        marginBottom: 4,
                      }}>
                        THE {a.key.toUpperCase()}
                      </div>
                      <p style={{
                        fontFamily: serif,
                        fontStyle: 'italic',
                        fontSize: 13.5,
                        color: 'var(--color-ink)',
                        margin: 0,
                        lineHeight: 1.45,
                      }}>
                        {a.spirit}
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {/* Pathway — three illustrated stations leading onward.
            Replaces the old single-CTA quiz panel; the quiz still
            appears as Station 01 for cold visitors, but warm visitors
            now see a pilgrimage + spar trail instead. */}
        <PathwayNext pathway={pathwayForTopic(topic.slug, locale)} locale={locale} />
      </main>
    </>
  );
}

const sectionH2: React.CSSProperties = {
  fontFamily: pixel,
  fontSize: 14,
  color: 'var(--color-ink)',
  textTransform: 'uppercase',
  letterSpacing: '0.18em',
  marginBottom: 10,
  textShadow: '2px 2px 0 var(--pixel-shadow, var(--color-acc))',
};

const subtitle: React.CSSProperties = {
  fontFamily: serif,
  fontStyle: 'italic',
  fontSize: 15,
  color: 'var(--color-ink-soft)',
  margin: 0,
  lineHeight: 1.55,
};

const dimChip: React.CSSProperties = {
  padding: '6px 12px',
  background: '#FFFCF4',
  border: '2px solid var(--color-ink)',
  fontFamily: serif,
  fontSize: 14,
  color: 'var(--color-ink)',
};
