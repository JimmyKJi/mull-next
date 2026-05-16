// /topic/[slug] — evergreen topic explainer.
//
// SEO-optimised: dynamic Metadata with topic-specific title/description,
// JSON-LD Article schema with mainEntity DefinedTerm, internal links to
// related philosophers + archetypes, canonical URL set. Static generation
// via generateStaticParams so every topic is pre-rendered.

import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { PHILOSOPHERS, philosopherSlug } from '@/lib/philosophers';
import { findTopic, TOPICS } from '@/lib/topics';
import { DIM_NAMES, type DimKey } from '@/lib/dimensions';
import { ARCHETYPES } from '@/lib/archetypes';
import { getArchetypeColor } from '@/lib/archetype-colors';
import { ArchetypeSprite } from '@/components/archetype-sprite';
import { PhilosopherSprite } from '@/components/philosopher-sprite';

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";
const serif = "'Cormorant Garamond', Georgia, serif";

export function generateStaticParams() {
  return TOPICS.map(t => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const topic = findTopic(slug);
  if (!topic) return { title: 'Topic not found' };
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
  const topic = findTopic(slug);
  if (!topic) notFound();

  // Resolve curated philosopher names to entries in the 560 corpus.
  // We tolerate misses silently (typo or new addition) and just skip
  // them; the page still renders.
  const philosophers = topic.philosopherNames
    .map(name => PHILOSOPHERS.find(p => p.name === name))
    .filter((p): p is NonNullable<typeof p> => !!p);

  const archetypeEntries = topic.relatedArchetypes
    .map(key => ARCHETYPES.find(a => a.key === key))
    .filter((a): a is NonNullable<typeof a> => !!a);

  // JSON-LD: Article + embedded DefinedTerm. Search engines use this
  // to disambiguate from the other things called "Stoicism" on the
  // web and surface rich result candidates.
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: topic.title,
    description: topic.summary,
    url: `https://mull.world/topic/${slug}`,
    inLanguage: 'en',
    mainEntity: {
      '@type': 'DefinedTerm',
      name: topic.title,
      description: topic.summary,
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
            color: '#4A4338', textDecoration: 'none',
            letterSpacing: 0.4, textTransform: 'uppercase',
          }}>
            ◂ ALL TOPICS
          </Link>
        </div>

        <div style={{
          fontFamily: pixel,
          fontSize: 12,
          color: '#8C6520',
          textTransform: 'uppercase',
          letterSpacing: '0.18em',
          marginBottom: 14,
        }}>
          ▸ TOPIC
        </div>

        <h1 style={{
          fontFamily: pixel,
          fontSize: 32,
          margin: '0 0 16px',
          color: '#221E18',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          textShadow: '3px 3px 0 #B8862F',
          lineHeight: 1.1,
        }}>
          {topic.title.toUpperCase()}
        </h1>

        <p style={{
          fontFamily: serif,
          fontStyle: 'italic',
          fontSize: 19,
          color: '#4A4338',
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
          border: '4px solid #221E18',
          boxShadow: '5px 5px 0 0 #B8862F',
          borderRadius: 0,
          marginBottom: 36,
        }}>
          {topic.essay.split(/\n\n+/).map((para, i) => (
            <p key={i} style={{
              fontFamily: serif,
              fontSize: 17,
              color: '#221E18',
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
            <h2 style={sectionH2}>▸ DIMENSIONS THIS LIVES ON</h2>
            <p style={subtitle}>
              When you take the quiz, the dimensions most relevant to
              {' '}{topic.title.toLowerCase()} are:
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
              {topic.relevantDimensions.map(key => (
                <span key={key} style={dimChip}>
                  {DIM_NAMES[key as DimKey] || key}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Related philosophers */}
        {philosophers.length > 0 && (
          <section style={{ marginBottom: 36 }}>
            <h2 style={sectionH2}>▸ THINKERS ON THIS QUESTION</h2>
            <p style={subtitle}>
              From the {PHILOSOPHERS.length}-philosopher corpus on Mull —
              click through for each one&rsquo;s position + their place on the
              map.
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
                      border: '3px solid #221E18',
                      boxShadow: '3px 3px 0 0 #B8862F',
                      borderRadius: 0,
                      textDecoration: 'none',
                      color: '#221E18',
                      transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end)',
                    }}
                  >
                    <div className="pixel-crisp" style={{
                      width: 36, height: 36,
                      background: '#F8EDC8',
                      border: '2px solid #221E18',
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
                        color: '#221E18',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {p.name}
                      </div>
                      <div style={{
                        fontFamily: pixel,
                        fontSize: 9,
                        color: '#8C6520',
                        letterSpacing: 0.4,
                        textTransform: 'uppercase',
                        marginTop: 2,
                      }}>
                        {p.dates}
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
            <h2 style={sectionH2}>▸ ARCHETYPES THAT CLUSTER HERE</h2>
            <p style={subtitle}>
              Among Mull&rsquo;s ten archetypes, the ones most likely to wrestle
              with {topic.title.toLowerCase()} are:
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
                        border: '3px solid #221E18',
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
                        border: '2px solid #221E18',
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
                        color: '#221E18',
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

        {/* Closing CTA — where you sit */}
        <div style={{
          padding: '24px 26px',
          background: '#F8EDC8',
          border: '4px solid #221E18',
          boxShadow: '6px 6px 0 0 #B8862F',
          borderRadius: 0,
          textAlign: 'center',
        }}>
          <p style={{
            fontFamily: serif,
            fontStyle: 'italic',
            fontSize: 17,
            color: '#221E18',
            margin: '0 0 18px',
            lineHeight: 1.55,
          }}>
            Want to know where you sit on questions like this? The quiz
            places you in 16-D space, near the philosophers whose pattern
            yours most resembles.
          </p>
          <Link
            href="/quiz?mode=quick"
            className="pixel-button pixel-button--amber"
          >
            <span>▶ TAKE THE QUIZ · 6 MIN</span>
          </Link>
        </div>
      </main>
    </>
  );
}

const sectionH2: React.CSSProperties = {
  fontFamily: pixel,
  fontSize: 14,
  color: '#221E18',
  textTransform: 'uppercase',
  letterSpacing: '0.18em',
  marginBottom: 10,
  textShadow: '2px 2px 0 #B8862F',
};

const subtitle: React.CSSProperties = {
  fontFamily: serif,
  fontStyle: 'italic',
  fontSize: 15,
  color: '#4A4338',
  margin: 0,
  lineHeight: 1.55,
};

const dimChip: React.CSSProperties = {
  padding: '6px 12px',
  background: '#FFFCF4',
  border: '2px solid #221E18',
  fontFamily: serif,
  fontSize: 14,
  color: '#221E18',
};
