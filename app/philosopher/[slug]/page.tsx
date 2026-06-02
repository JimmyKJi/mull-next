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
import { localizePhilosopher } from '@/lib/philosophers-i18n';
import { localizeTopic } from '@/lib/topics-i18n';
import { localizeExercise } from '@/lib/exercises-i18n';
import { EXERCISES } from '@/lib/exercises';
import { getServerLocale } from '@/lib/locale-server';
import { t } from '@/lib/translations';
import { PixelWindow } from '@/components/pixel-window';
import { philosopherBio } from '@/lib/philosopher-bios';
import { topicsForPhilosopher, matchupsForPhilosopher } from '@/lib/philosopher-cross-links';
import { findTopic } from '@/lib/topics';
import { PathwayNext } from '@/components/pathway-next';
import { pathwayForPhilosopher } from '@/lib/pathway';

export function generateStaticParams() {
  return philosopherSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const rawP = getPhilosopherBySlug(slug);
  if (!rawP) return { title: 'Philosopher not found' };
  const locale = await getServerLocale();
  const p = localizePhilosopher(rawP, slug, locale);

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
  const rawP = getPhilosopherBySlug(slug);
  if (!rawP) notFound();

  const locale = await getServerLocale();
  // Localized view for display text; rawP keeps the English name for the
  // procedural sprite seed, the URL slug, and (English) structured data.
  const p = localizePhilosopher(rawP, slug, locale);
  const archetype = getArchetypeByKey(p.archetypeKey);
  const color = getArchetypeColor(p.archetypeKey);
  const dims = topDimensions(p, 4);
  const nearest = nearestPhilosophers(rawP, 6);

  // Resolve a display name from an English name string: keeps slugs/sprites
  // English while showing the localized label (e.g. matchup partners).
  const displayName = (name: string) => {
    const e = getPhilosopherBySlug(philosopherSlug(name));
    return e ? localizePhilosopher(e, philosopherSlug(name), locale).name : name;
  };

  const suggestedExerciseSlugs = archetype?.suggestedExercises ?? [];
  const suggestedExercises = suggestedExerciseSlugs
    .map((s) => EXERCISES.find((e) => e.slug === s))
    .filter((x): x is NonNullable<typeof x> => !!x)
    .slice(0, 3)
    .map((ex) => localizeExercise(ex, locale));

  // Editorial bio (top 25 only). Renders as the page's main content
  // body when present; otherwise the page falls back to chrome-only.
  const bio = philosopherBio(slug);

  // Reverse-index cross-links — surfaces topic + matchup SEO pages
  // from the philosopher page (internal-link gold).
  // topicsForPhilosopher returns a light {slug,title,summary} link; look
  // up the full Topic so the i18n overlay (keyed by slug) can localize it.
  const relatedTopics = topicsForPhilosopher(slug)
    .slice(0, 6)
    .map((rt) => {
      const full = findTopic(rt.slug);
      return full ? localizeTopic(full, locale) : rt;
    });
  const matchups = matchupsForPhilosopher(slug).slice(0, 8);

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: rawP.name,
    alternateName: rawP.aliases,
    description: rawP.keyIdea,
    url: `https://mull.world/philosopher/${slug}`,
    image: `https://mull.world/philosopher/${slug}/opengraph-image`,
    jobTitle: 'Philosopher',
    knowsAbout: [
      'Philosophy',
      p.archetypeName,
      ...dims.map((d) => DIM_NAMES[Object.keys(DIM_NAMES)[d.idx] as keyof typeof DIM_NAMES]),
    ].filter(Boolean),
  };

  // FAQ JSON-LD — eligible for Google's FAQ rich result. Answers are
  // pulled from real page content so we don't ship snippet bait that
  // doesn't match the body.
  const nearestName = nearest[0]?.name;
  const dimNamesForFaq = dims.slice(0, 3).map(d => {
    const key = Object.keys(DIM_NAMES)[d.idx] as keyof typeof DIM_NAMES;
    return DIM_NAMES[key];
  }).join(', ');
  const faqEntries: { q: string; a: string }[] = [
    {
      q: `Who was ${rawP.name}?`,
      a: `${rawP.name} (${rawP.dates}) was a philosopher classified on Mull under the ${rawP.archetypeName} archetype. ${rawP.keyIdea}`,
    },
    {
      q: `When did ${rawP.name} live?`,
      a: `${rawP.name}'s dates are ${rawP.dates}.`,
    },
    {
      q: `What is ${rawP.name} known for?`,
      a: `${rawP.keyIdea} On Mull's 16-dimensional map, ${rawP.name} scores highest on ${dimNamesForFaq}.`,
    },
  ];
  if (nearestName) {
    faqEntries.push({
      q: `Which philosophers are similar to ${rawP.name}?`,
      a: `By Mull's dimensional analysis, ${rawP.name} sits closest to ${nearest.slice(0, 3).map(n => n.name).join(', ')}.`,
    });
  }
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqEntries.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
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
                name={rawP.name}
                archetypeKey={p.archetypeKey}
                size={104}
                floating
              />
            </div>
            <div>
              <h1
                className="pr-2 text-[28px] font-medium leading-[1.05] text-[#221E18] sm:text-[40px]"
                style={{ fontFamily: 'var(--font-editorial)' }}
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
                  fontFamily: 'var(--font-editorial)',
                }}
              >
                &ldquo;{p.keyIdea}&rdquo;
              </p>
            </div>
          </div>
        </PixelWindow>

        <div className="mt-8 space-y-8">
          {/* Extended bio — only present for top 25 most-searched
              philosophers (hand-written prose, 200-400 words). */}
          {bio ? (
            <PixelWindow title="ABOUT" badge="▶ PROFILE">
              <div
                className="space-y-4 text-[15.5px] leading-[1.65] text-[#221E18]"
                style={{ fontFamily: 'var(--font-editorial)' }}
              >
                {bio.split('\n\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </PixelWindow>
          ) : null}

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
                    style={{ fontFamily: 'var(--font-editorial)' }}
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
              style={{ fontFamily: 'var(--font-editorial)' }}
            >
              {t('phil.dimensions_helper', locale)}
            </p>
            <ul className="space-y-2">
              {dims.map((d) => {
                const key = Object.keys(DIM_NAMES)[d.idx] as keyof typeof DIM_NAMES;
                const name = t(`dim.${key}.name`, locale) || DIM_NAMES[key];
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
                          style={{ fontFamily: 'var(--font-editorial)' }}
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
              style={{ fontFamily: 'var(--font-editorial)' }}
            >
              {t('phil.nearest_helper', locale)}
            </p>
            <ul className="space-y-2.5">
              {nearest.map((other) => {
                const otherColor = getArchetypeColor(other.archetypeKey);
                const ol = localizePhilosopher(other, philosopherSlug(other.name), locale);
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
                            style={{ fontFamily: 'var(--font-editorial)' }}
                          >
                            {ol.name}
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
                          style={{ fontFamily: 'var(--font-editorial)' }}
                        >
                          {ol.keyIdea}
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </PixelWindow>

          {/* Topics this philosopher is listed under — internal SEO
              link gold. Reverse-indexed from lib/topics.ts. */}
          {relatedTopics.length > 0 ? (
            <PixelWindow title="TOPICS" badge="▶ EXPLORE">
              <p
                className="mb-4 text-[14px] leading-[1.6] text-[#4A4338]"
                style={{ fontFamily: 'var(--font-editorial)' }}
              >
                {t('phil.topics_helper', locale, { name: p.name })}
              </p>
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {relatedTopics.map(rt => (
                  <li key={rt.slug}>
                    <Link
                      href={`/topic/${rt.slug}`}
                      className="block border-2 px-3 py-2.5 transition-all hover:translate-x-[-1px] hover:translate-y-[-1px]"
                      style={{
                        borderColor: '#EBE3CA',
                        background: '#FFFCF4',
                        boxShadow: `2px 2px 0 0 ${color.deep}`,
                      }}
                    >
                      <div
                        className="text-[15px] font-medium text-[#221E18]"
                        style={{ fontFamily: 'var(--font-editorial)' }}
                      >
                        {rt.title}
                      </div>
                      <div
                        className="mt-1 text-[12.5px] italic leading-[1.5] text-[#4A4338]"
                        style={{ fontFamily: 'var(--font-editorial)' }}
                      >
                        {rt.summary}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </PixelWindow>
          ) : null}

          {/* Curated matchups featuring this philosopher. */}
          {matchups.length > 0 ? (
            <PixelWindow title="MATCHUPS" badge="▶ COMPARE">
              <p
                className="mb-4 text-[14px] leading-[1.6] text-[#4A4338]"
                style={{ fontFamily: 'var(--font-editorial)' }}
              >
                {t('phil.matchups_helper', locale)}
              </p>
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {matchups.map(m => (
                  <li key={m.href}>
                    <Link
                      href={m.href}
                      className="block border-2 px-3 py-2.5 transition-all hover:translate-x-[-1px] hover:translate-y-[-1px]"
                      style={{
                        borderColor: '#EBE3CA',
                        background: '#FFFCF4',
                        boxShadow: `2px 2px 0 0 ${color.deep}`,
                      }}
                    >
                      <div
                        className="text-[15px] font-medium text-[#221E18]"
                        style={{ fontFamily: 'var(--font-editorial)' }}
                      >
                        {p.name} <span style={{ color: '#8C6520', fontFamily: 'var(--font-pixel-display)', fontSize: 10 }}>VS</span> {displayName(m.partner)}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </PixelWindow>
          ) : null}

          {/* Suggested exercises */}
          {suggestedExercises.length > 0 ? (
            <PixelWindow title={t('phil.section_exercises', locale).toUpperCase()} badge="▶ PRACTICE">
              <p
                className="mb-4 text-[14px] leading-[1.6] text-[#4A4338]"
                style={{ fontFamily: 'var(--font-editorial)' }}
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
                        style={{ fontFamily: 'var(--font-editorial)' }}
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

        {/* Pathway — three illustrated stations leading onward.
            Replaces the old single quiz-CTA panel; the quiz still
            appears as Station 01 for cold visitors, but warm visitors
            see Pilgrimage → Spar → exercise instead. Share button kept
            below as a secondary action. */}
        <PathwayNext pathway={pathwayForPhilosopher(slug)} />

        {/* Share — small secondary action, kept from the old CTA panel. */}
        <div className="mt-8 flex justify-center">
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
              `${p.name} on Mull — ${p.keyIdea.length > 120 ? p.keyIdea.slice(0, 117).trimEnd() + '…' : p.keyIdea}`
            )}&url=${encodeURIComponent(`https://mull.world/philosopher/${slug}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="pixel-press"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 14px',
              background: 'transparent',
              color: color.deep,
              border: `2px solid ${color.deep}`,
              boxShadow: `2px 2px 0 0 ${color.deep}`,
              borderRadius: 0,
              fontFamily: "var(--font-pixel-display, 'Courier New', monospace)",
              fontSize: 10,
              letterSpacing: 0.4,
              textTransform: 'uppercase',
              textDecoration: 'none',
              transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end)',
            }}
          >
            <span aria-hidden>𝕏</span>
            <span>SHARE {p.name.toUpperCase()}</span>
          </a>
        </div>
      </main>
    </>
  );
}
