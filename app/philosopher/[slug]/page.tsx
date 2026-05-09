// /philosopher/[slug] — long-form profile per philosopher in the
// constellation. 166 statically generated routes, indexable, designed
// to be the entry point for searches like "Marcus Aurelius philosophy"
// or "what is Epicurean ethics".
//
// Each page surfaces:
//   - Name, dates, key idea (the canonical line)
//   - Their archetype (links to /archetype/[slug])
//   - Top 4 dimensions they lean toward
//   - 6 nearest other thinkers in vector space
//   - Suggested exercises in their lineage (via archetype's suggestions)
//   - JSON-LD Person schema for Google's knowledge surfaces
//   - OG image at /philosopher/[slug]/opengraph-image
//
// All page chrome is wrapped in the global TopBar via app/layout.tsx
// so we don't repeat brand + nav here.

import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  getPhilosopherBySlug,
  philosopherSlugs,
  philosopherSlug,
  nearestPhilosophers,
  topDimensions,
} from '@/lib/philosophers';
import { DIM_NAMES } from '@/lib/dimensions';
import { getArchetypeByKey, ARCHETYPES } from '@/lib/archetypes';
import { EXERCISES } from '@/lib/exercises';
import { FIGURES } from '@/lib/figures';
import { getServerLocale } from '@/lib/locale-server';
import { t } from '@/lib/translations';

const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'Inter', system-ui, sans-serif";

export function generateStaticParams() {
  return philosopherSlugs().map(slug => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getPhilosopherBySlug(slug);
  if (!p) return { title: 'Philosopher not found' };

  // Description trims the keyIdea aggressively so social previews don't
  // truncate mid-sentence.
  const desc = p.keyIdea.length > 155
    ? p.keyIdea.slice(0, 152).trimEnd() + '…'
    : p.keyIdea;
  const ogImage = `https://mull.world/philosopher/${slug}/opengraph-image`;

  return {
    title: p.name,
    description: `${p.name} (${p.dates}) — ${desc}`,
    keywords: [
      p.name,
      ...p.aliases,
      'philosophy',
      'philosopher',
      p.archetypeName,
    ].join(', '),
    openGraph: {
      title: `${p.name} — Mull`,
      description: desc,
      url: `https://mull.world/philosopher/${slug}`,
      siteName: 'Mull',
      type: 'profile',
      images: [{ url: ogImage, width: 1200, height: 630, alt: `${p.name} on Mull` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${p.name} — Mull`,
      description: desc,
      images: [ogImage],
    },
    alternates: { canonical: `https://mull.world/philosopher/${slug}` },
  };
}

export default async function PhilosopherDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getPhilosopherBySlug(slug);
  if (!p) notFound();

  const locale = await getServerLocale();

  const archetype = getArchetypeByKey(p.archetypeKey);
  const dims = topDimensions(p, 4);
  const nearest = nearestPhilosophers(p, 6);
  const figure = FIGURES[p.archetypeKey] || '';
  // Suggested exercises pulled from the archetype's recommendations —
  // good enough as a first pass, since philosophers in the same archetype
  // share roughly the same practice tradition.
  const suggestedExerciseSlugs = archetype?.suggestedExercises ?? [];
  const suggestedExercises = suggestedExerciseSlugs
    .map(s => EXERCISES.find(e => e.slug === s))
    .filter((x): x is NonNullable<typeof x> => !!x)
    .slice(0, 3);

  // JSON-LD Person schema. Tells Google this is a person profile and
  // helps with knowledge-graph surfaces.
  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: p.name,
    alternateName: p.aliases,
    description: p.keyIdea,
    url: `https://mull.world/philosopher/${slug}`,
    image: `https://mull.world/philosopher/${slug}/opengraph-image`,
    jobTitle: 'Philosopher',
    knowsAbout: [
      'Philosophy',
      p.archetypeName,
      ...dims.map(d => DIM_NAMES[Object.keys(DIM_NAMES)[d.idx] as keyof typeof DIM_NAMES]),
    ].filter(Boolean),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <main style={{ maxWidth: 760, margin: '24px auto 80px', padding: '0 24px' }}>
        {/* Hero */}
        <div style={{
          fontFamily: sans, fontSize: 11, fontWeight: 600,
          color: '#8C6520', textTransform: 'uppercase',
          letterSpacing: '0.18em', marginBottom: 14,
        }}>
          {t('phil.eyebrow', locale)}
        </div>
        <h1 style={{
          fontFamily: serif, fontSize: 46, fontWeight: 500,
          margin: '0 0 8px', letterSpacing: '-0.5px', lineHeight: 1.05,
        }}>
          {p.name}
        </h1>
        <p style={{
          fontFamily: sans, fontSize: 14, color: '#8C6520',
          margin: '0 0 24px', letterSpacing: 0.4,
        }}>
          {p.dates}
        </p>
        <p style={{
          fontFamily: serif, fontStyle: 'italic',
          fontSize: 22, color: '#221E18',
          margin: '0 0 32px', lineHeight: 1.5,
          paddingLeft: 18, borderLeft: '3px solid #B8862F',
        }}>
          {p.keyIdea}
        </p>

        {/* Archetype card */}
        {archetype && (
          <Section title={t('phil.section_archetype', locale)}>
            <Link href={`/archetype/${p.archetypeKey}`} style={{
              display: 'flex', gap: 16, alignItems: 'center',
              padding: '16px 18px',
              background: '#FFFCF4', border: '1px solid #EBE3CA',
              borderRadius: 8, textDecoration: 'none', color: 'inherit',
            }}>
              <div
                style={{ width: 64, height: 64, flexShrink: 0 }}
                aria-hidden
                dangerouslySetInnerHTML={{ __html: figure }}
              />
              <div>
                <div style={{
                  fontFamily: serif, fontSize: 22, fontWeight: 500,
                  color: '#221E18', marginBottom: 4,
                }}>
                  {p.archetypeName} →
                </div>
                <div style={{
                  fontFamily: sans, fontSize: 13.5,
                  color: '#4A4338', lineHeight: 1.5,
                }}>
                  {archetype.spirit}
                </div>
              </div>
            </Link>
          </Section>
        )}

        {/* Defining dimensions */}
        <Section title={t('phil.section_dimensions', locale)}>
          <p style={paragraphStyle}>
            {t('phil.dimensions_helper', locale)}
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
            {dims.map(d => {
              const key = Object.keys(DIM_NAMES)[d.idx] as keyof typeof DIM_NAMES;
              const name = DIM_NAMES[key];
              return (
                <li key={d.idx} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                  padding: '10px 14px',
                  background: '#FBFAF2', borderLeft: '3px solid #2F5D5C',
                  borderRadius: 6,
                }}>
                  <span style={{
                    fontFamily: serif, fontSize: 17, color: '#221E18',
                  }}>
                    {name}
                  </span>
                  <span style={{
                    fontFamily: sans, fontSize: 13, fontWeight: 600,
                    color: '#2F5D5C', fontVariantNumeric: 'tabular-nums',
                  }}>
                    {d.value} / 10
                  </span>
                </li>
              );
            })}
          </ul>
        </Section>

        {/* Nearest thinkers */}
        <Section title={t('phil.section_nearest', locale)}>
          <p style={paragraphStyle}>
            {t('phil.nearest_helper', locale)}
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
            {nearest.map(other => (
              <li key={other.name}>
                <Link
                  href={`/philosopher/${philosopherSlug(other.name)}`}
                  style={{
                    display: 'block', padding: '12px 16px',
                    background: '#FFFCF4', border: '1px solid #EBE3CA',
                    borderRadius: 8, textDecoration: 'none', color: 'inherit',
                  }}
                >
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'baseline', gap: 12, marginBottom: 4,
                  }}>
                    <span style={{
                      fontFamily: serif, fontSize: 17, fontWeight: 500,
                      color: '#221E18',
                    }}>
                      {other.name}
                    </span>
                    <span style={{
                      fontFamily: sans, fontSize: 12,
                      color: '#8C6520', letterSpacing: 0.2,
                    }}>
                      {other.archetypeName}
                    </span>
                  </div>
                  <p style={{
                    fontFamily: sans, fontSize: 13.5,
                    color: '#4A4338', margin: 0, lineHeight: 1.5,
                  }}>
                    {other.keyIdea}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </Section>

        {/* Suggested exercises */}
        {suggestedExercises.length > 0 && (
          <Section title={t('phil.section_exercises', locale)}>
            <p style={paragraphStyle}>
              {t('phil.exercises_helper', locale, { name: p.name })}
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
              {suggestedExercises.map(ex => (
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

        {/* CTA — convert reader → quiz-taker */}
        <div style={{
          marginTop: 36, padding: '20px 24px',
          background: '#F5EFDC', border: '1px solid #E2D8B6',
          borderLeft: '3px solid #B8862F', borderRadius: 8,
          textAlign: 'center',
        }}>
          <p style={{
            fontFamily: serif, fontSize: 17, color: '#221E18',
            margin: '0 0 14px', lineHeight: 1.5,
          }}>
            {t('phil.cta_text', locale, { name: p.name })}
          </p>
          <Link href="/" style={{
            display: 'inline-block',
            padding: '10px 22px', background: '#221E18', color: '#FAF6EC',
            borderRadius: 6, textDecoration: 'none',
            fontFamily: sans, fontSize: 14, fontWeight: 500,
          }}>
            {t('phil.cta_button', locale)}
          </Link>
        </div>
      </main>
    </>
  );

  // ARCHETYPES referenced silently to keep import live for future use
  void ARCHETYPES;
}

const paragraphStyle: React.CSSProperties = {
  fontFamily: sans, fontSize: 14.5, color: '#4A4338',
  lineHeight: 1.65, margin: '0 0 14px',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{
      marginBottom: 32, paddingTop: 24, borderTop: '1px solid #EBE3CA',
    }}>
      <h2 style={{
        fontFamily: serif, fontSize: 24, fontWeight: 500,
        margin: '0 0 14px', letterSpacing: '-0.2px', color: '#221E18',
      }}>
        {title}
      </h2>
      <div>{children}</div>
    </section>
  );
}
