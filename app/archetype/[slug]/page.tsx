// /archetype/[slug] — long-form archetype profile.
// v3 pixel chrome restyle. Pixel header, pixel windows around each
// section, Cormorant for the long prose (library-book-in-game beat),
// pixel sprite for the archetype mascot, per-archetype color theming
// driven by lib/archetype-colors.

import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ARCHETYPES, archetypeKeys, getArchetypeByKey } from '@/lib/archetypes';
import { getArchetypeColor } from '@/lib/archetype-colors';
import { ArchetypeSprite } from '@/components/archetype-sprite';
import { DIM_NAMES } from '@/lib/dimensions';
import { EXERCISES } from '@/lib/exercises';
import { PHILOSOPHERS, philosopherSlug } from '@/lib/philosophers';
import { getServerLocale } from '@/lib/locale-server';
import { t } from '@/lib/translations';
import LanguageSwitcher from '@/components/language-switcher';
import { PixelWindow } from '@/components/pixel-window';

export function generateStaticParams() {
  return archetypeKeys().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const a = getArchetypeByKey(slug);
  if (!a) return { title: 'Archetype not found' };

  const enName = a.key.charAt(0).toUpperCase() + a.key.slice(1);
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

export default async function ArchetypeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const archetype = getArchetypeByKey(slug);
  if (!archetype) notFound();

  const locale = await getServerLocale();
  const color = getArchetypeColor(archetype.key);
  const name = t(`arch.${archetype.key}.name`, locale) || archetype.key;
  const blurb = t(`arch.${archetype.key}.blurb`, locale) || '';

  const exerciseObjs = archetype.suggestedExercises
    .map((s) => EXERCISES.find((e) => e.slug === s))
    .filter((x): x is NonNullable<typeof x> => !!x);

  const dimensions = archetype.dominantDimensions.map((k) => ({
    key: k,
    name: DIM_NAMES[k as keyof typeof DIM_NAMES] || k,
  }));

  const others = ARCHETYPES.filter((a) => a.key !== archetype.key);

  return (
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
          href="/archetype"
          className="text-[13px] text-[#4A4338] hover:text-[#221E18] hover:underline"
        >
          ← {t('arch_detail.back_to_index', locale)}
        </Link>
        <LanguageSwitcher initial={locale} />
      </div>

      {/* ─── Hero — pixel sprite + name + spirit ─── */}
      <PixelWindow
        title={`▶ ARCHETYPE NO. ${String(ARCHETYPES.indexOf(archetype) + 1).padStart(2, '0')}`}
        badge="ARCHETYPE_PROFILE.MD"
        accent={{ primary: color.primary, deep: color.deep, soft: color.soft }}
      >
        <div className="grid grid-cols-1 items-center gap-6 sm:grid-cols-[auto_1fr]">
          <div
            className="mx-auto border-4 p-3"
            style={{
              borderColor: color.deep,
              background: '#FFFCF4',
              boxShadow: `4px 4px 0 0 ${color.deep}`,
            }}
            aria-hidden
          >
            <ArchetypeSprite archetypeKey={archetype.key} size={120} floating />
          </div>
          <div>
            <div
              className="text-[10px] tracking-[0.24em]"
              style={{ color: color.deep, fontFamily: 'var(--font-pixel-display)' }}
            >
              {t('arch_detail.eyebrow', locale).toUpperCase()}
            </div>
            <h1
              className="mt-2 pr-2 text-[28px] leading-[1.05] tracking-[0.04em] sm:text-[40px] md:text-[48px]"
              style={{
                color: color.deep,
                fontFamily: 'var(--font-pixel-display)',
              }}
            >
              <span style={{ textShadow: `3px 3px 0 ${color.primary}` }}>
                {name.toUpperCase()}
              </span>
            </h1>
            <p
              className="mt-4 text-[18px] italic leading-[1.45] text-[#221E18]"
              style={{ fontFamily: 'var(--font-prose)' }}
            >
              &ldquo;{archetype.spirit}&rdquo;
            </p>
          </div>
        </div>

        {blurb ? (
          <p
            className="mt-5 border-l-4 px-4 py-3 text-[15px] leading-[1.65] text-[#221E18]"
            style={{
              borderColor: color.deep,
              background: '#FFFCF4',
              fontFamily: 'var(--font-prose)',
            }}
          >
            {blurb}
          </p>
        ) : null}
      </PixelWindow>

      <div className="mt-8 space-y-8">
        {/* ─── About — long-form essay (Cormorant) ─── */}
        <PixelWindow title={t('arch_detail.section_about', locale).toUpperCase()} badge="▶ ESSAY">
          <Prose>
            {archetype.detailedAbout.split('\n\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </Prose>
        </PixelWindow>

        {/* ─── Quotes ─── */}
        <PixelWindow title={t('arch_detail.section_quotes', locale).toUpperCase()} badge="▶ QUOTES">
          <ul className="space-y-3">
            {archetype.quotes.map((q, i) => (
              <li
                key={i}
                className="border-l-4 px-4 py-3"
                style={{ borderColor: color.deep, background: '#FFFCF4' }}
              >
                <p
                  className="text-[16.5px] italic leading-[1.5] text-[#221E18]"
                  style={{ fontFamily: 'var(--font-prose)' }}
                >
                  &ldquo;{q.text}&rdquo;
                </p>
                <p className="mt-1 text-[12px] tracking-wide text-[#8C6520]">
                  — {q.attribution}
                </p>
              </li>
            ))}
          </ul>
        </PixelWindow>

        {/* ─── Reading list ─── */}
        <PixelWindow title={t('arch_detail.section_reading', locale).toUpperCase()} badge="▶ READING">
          <p
            className="mb-4 text-[14px] italic leading-[1.6] text-[#4A4338]"
            style={{ fontFamily: 'var(--font-prose)' }}
          >
            {t('arch_detail.reading_helper', locale)}
          </p>
          <ul className="space-y-3">
            {archetype.readingList.map((book, i) => (
              <li
                key={i}
                className="border-2 px-4 py-3"
                style={{
                  borderColor: '#EBE3CA',
                  background: '#FFFCF4',
                  boxShadow: `2px 2px 0 0 ${color.deep}`,
                }}
              >
                <div
                  className="text-[18px] font-medium leading-tight text-[#221E18]"
                  style={{ fontFamily: 'var(--font-prose)' }}
                >
                  {book.title}
                </div>
                <div className="mt-1 text-[12.5px] tracking-wide text-[#8C6520]">
                  {book.author}
                  {book.year ? ` · ${book.year}` : ''}
                </div>
                <p className="mt-2 text-[14px] leading-[1.55] text-[#4A4338]">
                  {book.note}
                </p>
              </li>
            ))}
          </ul>
        </PixelWindow>

        {/* ─── Kindred thinkers ─── */}
        <PixelWindow title={t('arch_detail.section_kindred', locale).toUpperCase()} badge="▶ KINDRED">
          <p
            className="mb-4 text-[14px] leading-[1.6] text-[#4A4338]"
            style={{ fontFamily: 'var(--font-prose)' }}
          >
            {t('arch_detail.kindred_helper', locale)}
          </p>
          <div className="flex flex-wrap gap-2">
            {archetype.kindredThinkers.map((thinker, i) => {
              const matched = PHILOSOPHERS.find(
                (p) =>
                  p.name.toLowerCase() === thinker.toLowerCase() ||
                  p.aliases.some(
                    (al) => al.toLowerCase() === thinker.toLowerCase(),
                  ),
              );
              const chipClass =
                'inline-block border-2 px-3 py-1.5 text-[13px] text-[#221E18] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px]';
              const chipStyle: React.CSSProperties = {
                borderColor: color.deep,
                background: '#F5EFDC',
                boxShadow: `2px 2px 0 0 ${color.deep}`,
              };
              if (matched) {
                return (
                  <Link
                    key={i}
                    href={`/philosopher/${philosopherSlug(matched.name)}`}
                    className={chipClass}
                    style={chipStyle}
                  >
                    {thinker} →
                  </Link>
                );
              }
              return (
                <span key={i} className={chipClass} style={chipStyle}>
                  {thinker}
                </span>
              );
            })}
          </div>
        </PixelWindow>

        {/* ─── What it gets right / Where it falters — side-by-side ─── */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <PixelWindow title={t('arch_detail.section_get_right', locale).toUpperCase()} badge="▶ STRENGTH">
            <p
              className="text-[15px] leading-[1.65] text-[#221E18]"
              style={{ fontFamily: 'var(--font-prose)' }}
            >
              {archetype.whatItGetsRight}
            </p>
          </PixelWindow>
          <PixelWindow title={t('arch_detail.section_falter', locale).toUpperCase()} badge="▶ LIMIT">
            <p
              className="text-[15px] leading-[1.65] text-[#221E18]"
              style={{ fontFamily: 'var(--font-prose)' }}
            >
              {archetype.whereItFalters}
            </p>
          </PixelWindow>
        </div>

        {/* ─── A day in the life ─── */}
        <PixelWindow title={t('arch_detail.section_dayinlife', locale).toUpperCase()} badge="▶ SCENE">
          <p
            className="text-[16px] italic leading-[1.7] text-[#221E18]"
            style={{ fontFamily: 'var(--font-prose)' }}
          >
            {archetype.dayInTheLife}
          </p>
        </PixelWindow>

        {/* ─── Dominant dimensions ─── */}
        <PixelWindow title={t('arch_detail.section_dimensions', locale).toUpperCase()} badge="▶ DIMS">
          <p
            className="mb-4 text-[14px] leading-[1.6] text-[#4A4338]"
            style={{ fontFamily: 'var(--font-prose)' }}
          >
            {t('arch_detail.dimensions_helper', locale)}
          </p>
          <ul className="space-y-2.5">
            {dimensions.map((d, i) => {
              const dimName = t(`dim.${d.key}.name`, locale) || d.name;
              const dimDesc = t(`dim.${d.key}.desc`, locale) || '';
              return (
                <li
                  key={i}
                  className="border-l-4 px-4 py-3"
                  style={{ borderColor: color.deep, background: '#FBFAF2' }}
                >
                  <div
                    className="text-[10px] tracking-[0.16em]"
                    style={{
                      color: color.deep,
                      fontFamily: 'var(--font-pixel-display)',
                    }}
                  >
                    {d.key}
                  </div>
                  <div
                    className="mt-1 text-[17px] font-medium text-[#221E18]"
                    style={{ fontFamily: 'var(--font-prose)' }}
                  >
                    {dimName}
                  </div>
                  <p className="mt-1.5 text-[13.5px] leading-[1.55] text-[#4A4338]">
                    {dimDesc}
                  </p>
                </li>
              );
            })}
          </ul>
        </PixelWindow>

        {/* ─── Suggested exercises ─── */}
        {exerciseObjs.length > 0 ? (
          <PixelWindow title={t('arch_detail.section_exercises', locale).toUpperCase()} badge="▶ PRACTICE">
            <p
              className="mb-4 text-[14px] leading-[1.6] text-[#4A4338]"
              style={{ fontFamily: 'var(--font-prose)' }}
            >
              {t('arch_detail.exercises_helper', locale)}
            </p>
            <ul className="space-y-2.5">
              {exerciseObjs.map((ex) => (
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

        {/* ─── Other archetypes ─── */}
        <PixelWindow title={t('arch_detail.section_other', locale).toUpperCase()} badge="▶ EXPLORE">
          <p
            className="mb-4 text-[14px] leading-[1.6] text-[#4A4338]"
            style={{ fontFamily: 'var(--font-prose)' }}
          >
            {t('arch_detail.other_helper', locale)}
          </p>
          <div className="flex flex-wrap gap-2">
            {others.map((a) => {
              const otherColor = getArchetypeColor(a.key);
              const otherName = t(`arch.${a.key}.name`, locale) || a.key;
              return (
                <Link
                  key={a.key}
                  href={`/archetype/${a.key}`}
                  className="inline-flex items-center gap-2 border-2 px-3 py-1.5 text-[13px] text-[#221E18] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px]"
                  style={{
                    borderColor: otherColor.deep,
                    background: '#FFFCF4',
                    boxShadow: `2px 2px 0 0 ${otherColor.deep}`,
                  }}
                >
                  <span aria-hidden className="inline-block h-5 w-5">
                    <ArchetypeSprite archetypeKey={a.key} size={20} />
                  </span>
                  {otherName}
                </Link>
              );
            })}
          </div>
        </PixelWindow>
      </div>

      {/* ─── CTA ─── */}
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
          {t('arch_detail.cta_unsure', locale)}
        </p>
        <Link
          href="/quiz?mode=quick"
          className="pixel-button pixel-button--amber mt-5"
        >
          <span>▶ {t('arch_detail.cta_take_quiz', locale).toUpperCase()}</span>
        </Link>
      </div>
    </main>
  );
}

function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="space-y-4 text-[15.5px] leading-[1.7] text-[#221E18]"
      style={{ fontFamily: 'var(--font-prose)' }}
    >
      {children}
    </div>
  );
}
