// /philosopher/[slug] — long-form philosopher profile.
// v3 pixel chrome restyle. Procedural pixel sprite of the philosopher
// (deterministic from name) sits beside the name + dates + key idea
// in the hero. Sections wrapped in PixelWindow with archetype-tinted
// borders. Content + functionality preserved.

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
import { getArchetypeByKey } from '@/lib/archetypes';
import { getArchetypeColor } from '@/lib/archetype-colors';
import { ArchetypeSprite } from '@/components/archetype-sprite';
import { PhilosopherSprite } from '@/components/philosopher-sprite';
import { EXERCISES } from '@/lib/exercises';
import { getServerLocale } from '@/lib/locale-server';
import { t } from '@/lib/translations';
import { PixelWindow } from '@/components/pixel-window';

export function generateStaticParams() {
  return philosopherSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = getPhilosopherBySlug(slug);
  if (!p) return { title: 'Philosopher not found' };

  const desc =
    p.keyIdea.length > 155 ? p.keyIdea.slice(0, 152).trimEnd() + '…' : p.keyIdea;
  const ogImage = `https://mull.world/philosopher/${slug}/opengraph-image`;

  return {
    title: p.name,
    description: `${p.name} (${p.dates}) — ${desc}`,
    keywords: [p.name, ...p.aliases, 'philosophy', 'philosopher', p.archetypeName].join(', '),
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

export default async function PhilosopherDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = getPhilosopherBySlug(slug);
  if (!p) notFound();

  const locale = await getServerLocale();
  const archetype = getArchetypeByKey(p.archetypeKey);
  const color = getArchetypeColor(p.archetypeKey);
  const dims = topDimensions(p, 4);
  const nearest = nearestPhilosophers(p, 6);

  const suggestedExerciseSlugs = archetype?.suggestedExercises ?? [];
  const suggestedExercises = suggestedExerciseSlugs
    .map((s) => EXERCISES.find((e) => e.slug === s))
    .filter((x): x is NonNullable<typeof x> => !!x)
    .slice(0, 3);

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
      ...dims.map((d) => DIM_NAMES[Object.keys(DIM_NAMES)[d.idx] as keyof typeof DIM_NAMES]),
    ].filter(Boolean),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <main
        className="mx-auto max-w-[860px] px-6 pb-32 pt-12 sm:px-10 sm:pt-16"
        style={
          {
            ['--acc' as string]: color.primary,
            ['--acc-deep' as string]: color.deep,
            ['--acc-soft' as string]: color.soft,
          } as React.CSSProperties
        }
      >
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link
            href="/philosopher"
            className="text-[13px] text-[#4A4338] hover:text-[#221E18] hover:underline"
          >
            ← {t('philindex.eyebrow', locale)}
          </Link>
        </div>

        {/* Hero */}
        <PixelWindow
          title={`▶ ${t('phil.eyebrow', locale).toUpperCase()}`}
          badge="PHILOSOPHER_PROFILE.MD"
          accent={{ primary: color.primary, deep: color.deep, soft: color.soft }}
        >
          <div className="grid grid-cols-1 items-start gap-5 sm:grid-cols-[auto_1fr]">
            <div
              className="mx-auto border-4 p-2"
              style={{
                borderColor: color.deep,
                background: '#FFFCF4',
                boxShadow: `4px 4px 0 0 ${color.deep}`,
              }}
              aria-hidden
            >
              <PhilosopherSprite
                name={p.name}
                archetypeKey={p.archetypeKey}
                size={104}
                floating
              />
            </div>
            <div>
              <h1
                className="pr-2 text-[28px] font-medium leading-[1.05] text-[#221E18] sm:text-[40px]"
                style={{ fontFamily: 'var(--font-prose)' }}
              >
                {p.name}
              </h1>
              <p
                className="mt-1 text-[12px] tracking-[0.18em] text-[#8C6520]"
                style={{ fontFamily: 'var(--font-pixel-display)' }}
              >
                {p.dates}
              </p>
              <p
                className="mt-4 border-l-4 px-4 py-3 text-[16px] italic leading-[1.55] text-[#221E18]"
                style={{
                  borderColor: color.deep,
                  background: '#FFFCF4',
                  fontFamily: 'var(--font-prose)',
                }}
              >
                &ldquo;{p.keyIdea}&rdquo;
              </p>
            </div>
          </div>
        </PixelWindow>

        <div className="mt-8 space-y-8">
          {/* Archetype card */}
          {archetype ? (
            <PixelWindow title={t('phil.section_archetype', locale).toUpperCase()} badge="▶ KIN">
              <Link
                href={`/archetype/${p.archetypeKey}`}
                className="flex items-center gap-4 border-2 px-4 py-3 transition-all hover:translate-x-[-1px] hover:translate-y-[-1px]"
                style={{
                  borderColor: color.deep,
                  background: '#FFFCF4',
                  boxShadow: `3px 3px 0 0 ${color.deep}`,
                }}
              >
                <div
                  className="border-2 p-1.5"
                  style={{
                    borderColor: color.deep,
                    background: color.soft,
                  }}
                  aria-hidden
                >
                  <ArchetypeSprite archetypeKey={p.archetypeKey} size={56} />
                </div>
                <div className="min-w-0 flex-1">
                  <div
                    className="text-[20px] font-medium text-[#221E18]"
                    style={{ fontFamily: 'var(--font-prose)' }}
                  >
                    {p.archetypeName} →
                  </div>
                  <p className="mt-1 text-[13.5px] leading-[1.5] text-[#4A4338]">
                    {archetype.spirit}
                  </p>
                </div>
              </Link>
            </PixelWindow>
          ) : null}

          {/* Defining dimensions */}
          <PixelWindow title={t('phil.section_dimensions', locale).toUpperCase()} badge="▶ FINGERPRINT">
            <p
              className="mb-4 text-[14px] leading-[1.6] text-[#4A4338]"
              style={{ fontFamily: 'var(--font-prose)' }}
            >
              {t('phil.dimensions_helper', locale)}
            </p>
            <ul className="space-y-2">
              {dims.map((d) => {
                const key = Object.keys(DIM_NAMES)[d.idx] as keyof typeof DIM_NAMES;
                const name = DIM_NAMES[key];
                const pct = (d.value / 10) * 100;
                return (
                  <li
                    key={d.idx}
                    className="border-l-4 px-4 py-2.5"
                    style={{ borderColor: color.deep, background: '#FBFAF2' }}
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <div>
                        <span
                          className="mr-2 text-[10px] tracking-[0.16em]"
                          style={{
                            color: color.deep,
                            fontFamily: 'var(--font-pixel-display)',
                          }}
                        >
                          {key}
                        </span>
                        <span
                          className="text-[16px] font-medium text-[#221E18]"
                          style={{ fontFamily: 'var(--font-prose)' }}
                        >
                          {name}
                        </span>
                      </div>
                      <span
                        className="text-[12px] tracking-wider"
                        style={{
                          color: color.deep,
                          fontFamily: 'var(--font-pixel-display)',
                        }}
                      >
                        {d.value} / 10
                      </span>
                    </div>
                    {/* Pixel meter */}
                    <div
                      className="mt-2 h-2 w-full"
                      style={{ background: '#EBE3CA' }}
                    >
                      <div
                        className="h-full"
                        style={{ background: color.primary, width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </PixelWindow>

          {/* Nearest thinkers */}
          <PixelWindow title={t('phil.section_nearest', locale).toUpperCase()} badge="▶ NEAREST">
            <p
              className="mb-4 text-[14px] leading-[1.6] text-[#4A4338]"
              style={{ fontFamily: 'var(--font-prose)' }}
            >
              {t('phil.nearest_helper', locale)}
            </p>
            <ul className="space-y-2.5">
              {nearest.map((other) => {
                const otherColor = getArchetypeColor(other.archetypeKey);
                return (
                  <li key={other.name}>
                    <Link
                      href={`/philosopher/${philosopherSlug(other.name)}`}
                      className="flex items-start gap-3 border-2 px-4 py-3 transition-all hover:translate-x-[-1px] hover:translate-y-[-1px]"
                      style={{
                        borderColor: '#EBE3CA',
                        background: '#FFFCF4',
                        boxShadow: `2px 2px 0 0 ${otherColor.deep}`,
                      }}
                    >
                      <div className="shrink-0">
                        <PhilosopherSprite
                          name={other.name}
                          archetypeKey={other.archetypeKey}
                          size={44}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-3">
                          <span
                            className="text-[16px] font-medium text-[#221E18]"
                            style={{ fontFamily: 'var(--font-prose)' }}
                          >
                            {other.name}
                          </span>
                          <span
                            className="text-[10px] tracking-[0.16em]"
                            style={{
                              color: otherColor.deep,
                              fontFamily: 'var(--font-pixel-display)',
                            }}
                          >
                            {other.archetypeKey.toUpperCase()}
                          </span>
                        </div>
                        <p
                          className="mt-1 text-[13px] leading-[1.5] text-[#4A4338]"
                          style={{ fontFamily: 'var(--font-prose)' }}
                        >
                          {other.keyIdea}
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </PixelWindow>

          {/* Suggested exercises */}
          {suggestedExercises.length > 0 ? (
            <PixelWindow title={t('phil.section_exercises', locale).toUpperCase()} badge="▶ PRACTICE">
              <p
                className="mb-4 text-[14px] leading-[1.6] text-[#4A4338]"
                style={{ fontFamily: 'var(--font-prose)' }}
              >
                {t('phil.exercises_helper', locale, { name: p.name })}
              </p>
              <ul className="space-y-2.5">
                {suggestedExercises.map((ex) => (
                  <li key={ex.slug}>
                    <Link
                      href={`/exercises/${ex.slug}`}
                      className="block border-2 px-4 py-3 transition-all hover:translate-x-[-1px] hover:translate-y-[-1px]"
                      style={{
                        borderColor: '#EBE3CA',
                        background: '#FFFCF4',
                        boxShadow: `2px 2px 0 0 ${color.deep}`,
                      }}
                    >
                      <div
                        className="text-[17px] font-medium text-[#221E18]"
                        style={{ fontFamily: 'var(--font-prose)' }}
                      >
                        {ex.name} →
                      </div>
                      <p className="mt-1 text-[13.5px] leading-[1.55] text-[#4A4338]">
                        {ex.summary}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </PixelWindow>
          ) : null}
        </div>

        {/* CTA */}
        <div
          className="mt-10 border-4 px-6 py-7 text-center"
          style={{
            borderColor: color.deep,
            background: color.soft,
            boxShadow: `4px 4px 0 0 ${color.deep}`,
          }}
        >
          <p
            className="text-[16px] leading-[1.5] text-[#221E18]"
            style={{ fontFamily: 'var(--font-prose)' }}
          >
            {t('phil.cta_text', locale, { name: p.name })}
          </p>
          <Link
            href="/quiz?mode=quick"
            className="pixel-button pixel-button--amber mt-5"
          >
            <span>▶ {t('phil.cta_button', locale).toUpperCase()}</span>
          </Link>
        </div>
      </main>
    </>
  );
}
