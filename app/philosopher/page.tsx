// /philosopher — index of all 560 philosophers, grouped by archetype.
// v3 pixel chrome restyle. Each archetype cluster gets its own
// PixelWindow with the archetype sprite + per-archetype color.

import Link from 'next/link';
import type { Metadata } from 'next';
import { PHILOSOPHERS, philosopherSlug, getPhilosopherBySlug, type PhilosopherEntry } from '@/lib/philosophers';
import { localizePhilosopher } from '@/lib/philosophers-i18n';
import { ARCHETYPES } from '@/lib/archetypes';
import { getArchetypeColor } from '@/lib/archetype-colors';
import { ArchetypeSprite } from '@/components/archetype-sprite';
import { PhilosopherSprite } from '@/components/philosopher-sprite';
import { getServerLocale } from '@/lib/locale-server';
import { t } from '@/lib/translations';
import { PixelPageHeader, PixelWindow } from '@/components/pixel-window';
import { philosophersWithBios } from '@/lib/philosopher-bios';
import { createClient } from '@/utils/supabase/server';
import { getUserOrientation } from '@/lib/user-orientation';
import { nearestPhilosophersToVector } from '@/lib/recommendations';

export const metadata: Metadata = {
  title: 'All philosophers — 560 thinkers, 10 archetypes',
  description:
    `Browse all ${PHILOSOPHERS.length} philosophers in Mull's constellation — from Heraclitus to bell hooks, grouped by archetype. Each profile shows their key idea, their position on Mull's 16 dimensions, and their nearest kin.`,
  openGraph: {
    title: 'All philosophers — Mull',
    description: `${PHILOSOPHERS.length} thinkers across 10 archetypes. The full map of the long conversation.`,
    url: 'https://mull.world/philosopher',
    siteName: 'Mull',
    type: 'article',
  },
  alternates: { canonical: 'https://mull.world/philosopher' },
};

/** Featured profile rotates daily across the hand-written bio set so
 *  the index page feels alive + nudges users toward the deepest pages. */
function pickFeaturedProfile(): PhilosopherEntry | null {
  const slugs = philosophersWithBios();
  if (slugs.length === 0) return null;
  const now = new Date();
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86_400_000
  );
  const slug = slugs[dayOfYear % slugs.length];
  return getPhilosopherBySlug(slug) ?? null;
}

export default async function PhilosopherIndexPage() {
  const locale = await getServerLocale();
  // Localize display fields (name/dates/keyIdea); the English name still
  // drives the URL slug, the sprite seed, and the alphabetical sort.
  const loc = (e: PhilosopherEntry) => localizePhilosopher(e, philosopherSlug(e.name), locale);

  // Personalized "nearest you" row: for a placed user, rank all
  // philosophers by cosine similarity to their own 16-D coordinates and
  // surface the six closest. Logged-out / unplaced visitors — and crawlers
  // — get no vector, so the list is empty and the section simply doesn't
  // render: the public/SEO output is byte-for-byte unchanged. This page
  // already reads cookies via getServerLocale, so the auth read here adds
  // no caching penalty.
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const orientation = await getUserOrientation(supabase, user?.id ?? null);
  const nearestToYou = orientation.vector
    ? nearestPhilosophersToVector(orientation.vector, 6).map((r) => r.item)
    : [];

  const featured = pickFeaturedProfile();
  const bioSlugs = philosophersWithBios();
  const featuredList = bioSlugs
    .map(s => getPhilosopherBySlug(s))
    .filter((x): x is PhilosopherEntry => !!x);

  const byArchetype = new Map<string, PhilosopherEntry[]>();
  for (const a of ARCHETYPES) byArchetype.set(a.key, []);
  for (const p of PHILOSOPHERS) {
    const list = byArchetype.get(p.archetypeKey);
    if (list) list.push(p);
    else byArchetype.set(p.archetypeKey, [p]);
  }
  for (const list of byArchetype.values()) {
    list.sort((a, b) => a.name.localeCompare(b.name));
  }

  return (
    <main className="mx-auto max-w-[1200px] px-6 pb-32 pt-12 sm:px-10 sm:pt-16">
      <PixelPageHeader
        eyebrow={`▶ ${t('philindex.eyebrow', locale).toUpperCase()}`}
        title={t('hdr.constellation', locale)}
        subtitle={
          <div className="space-y-3">
            <p className="text-[16px] italic" style={{ fontFamily: 'var(--font-editorial)' }}>
              {t('philindex.subtitle', locale, { n: PHILOSOPHERS.length })}
            </p>
            <p className="text-[14px] text-[#8C6520]">{t('philindex.intro', locale)}</p>
          </div>
        }
      />

      {/* Personalized: the six philosophers nearest the user's OWN 16-D
          coordinates, ranked by cosine similarity. Only rendered for a
          placed (quiz-taken) user; absent for everyone else. */}
      {nearestToYou.length > 0 ? (
        <section className="mb-8">
          <div
            className="mb-2 text-[10px] tracking-[0.18em] text-[#8C6520]"
            style={{ fontFamily: "var(--font-pixel-display)", textTransform: 'uppercase' }}
          >
            ◆ {t('philindex.nearest_you', locale)}
          </div>
          <p className="mb-3 text-[13px] italic text-[#4A4338]" style={{ fontFamily: 'var(--font-editorial)' }}>
            {t('philindex.nearest_you_helper', locale, { n: PHILOSOPHERS.length })}
          </p>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
            {nearestToYou.map((p) => {
              const color = getArchetypeColor(p.archetypeKey);
              return (
                <li key={p.name}>
                  <Link
                    href={`/philosopher/${philosopherSlug(p.name)}`}
                    className="pixel-press flex items-start gap-3 border-2 px-3 py-2.5 transition-all hover:translate-x-[-1px] hover:translate-y-[-1px]"
                    style={{
                      borderColor: '#221E18',
                      background: '#FFFCF4',
                      boxShadow: `3px 3px 0 0 ${color.deep}`,
                      textDecoration: 'none',
                      color: 'inherit',
                    }}
                  >
                    <div
                      className="shrink-0 border-2 p-1"
                      style={{ borderColor: color.deep, background: '#FBFAF2' }}
                      aria-hidden
                    >
                      <PhilosopherSprite name={p.name} archetypeKey={p.archetypeKey} size={40} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div
                        className="text-[14.5px] font-medium leading-tight text-[#221E18]"
                        style={{ fontFamily: 'var(--font-prose)' }}
                      >
                        {loc(p).name}
                      </div>
                      <div className="mt-0.5 text-[10.5px] tracking-wide text-[#8C6520]">
                        {loc(p).dates}
                      </div>
                      <p
                        className="mt-1 text-[12px] italic leading-snug text-[#4A4338]"
                        style={{
                          fontFamily: 'var(--font-editorial)',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {loc(p).keyIdea}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {/* Featured profile rotates daily — links into a long-form bio
          page (~300 words of editorial content per philosopher). */}
      {featured ? (
        <section className="mb-8">
          <div
            className="mb-2 text-[10px] tracking-[0.18em] text-[#8C6520]"
            style={{ fontFamily: "var(--font-pixel-display)", textTransform: 'uppercase' }}
          >
            ◇ Featured profile today
          </div>
          <Link
            href={`/philosopher/${philosopherSlug(featured.name)}`}
            className="pixel-press flex items-start gap-5 border-4 border-[#221E18] p-5 sm:p-6"
            style={{
              background: '#F8EBC9',
              boxShadow: '6px 6px 0 0 #B8862F',
              textDecoration: 'none',
              color: 'inherit',
              transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end)',
            }}
          >
            <div
              className="shrink-0 border-4 p-2"
              style={{
                borderColor: '#221E18',
                background: '#FFFCF4',
                boxShadow: '3px 3px 0 0 #B8862F',
              }}
              aria-hidden
            >
              <PhilosopherSprite
                name={featured.name}
                archetypeKey={featured.archetypeKey}
                size={84}
              />
            </div>
            <div className="min-w-0 flex-1">
              <h2
                className="text-[24px] font-medium leading-[1.1] text-[#221E18] sm:text-[30px]"
                style={{ fontFamily: 'var(--font-editorial)' }}
              >
                {loc(featured).name}
              </h2>
              <div
                className="mt-1 text-[11px] tracking-[0.18em] text-[#8C6520]"
                style={{ fontFamily: 'var(--font-pixel-display)' }}
              >
                {loc(featured).dates}
              </div>
              <p
                className="mt-3 text-[14.5px] italic leading-[1.55] text-[#4A4338]"
                style={{ fontFamily: 'var(--font-editorial)' }}
              >
                {loc(featured).keyIdea}
              </p>
              <div
                className="mt-3 text-[10px] tracking-[0.18em] text-[#8C6520]"
                style={{ fontFamily: 'var(--font-pixel-display)', textTransform: 'uppercase' }}
              >
                READ THE FULL PROFILE ▶
              </div>
            </div>
          </Link>
        </section>
      ) : null}

      {/* Featured profiles strip — the ~25 philosophers with full
          long-form bios. High signal for "where do I even start" users. */}
      {featuredList.length > 0 ? (
        <section className="mb-8">
          <div
            className="mb-2 text-[10px] tracking-[0.18em] text-[#8C6520]"
            style={{ fontFamily: "var(--font-pixel-display)", textTransform: 'uppercase' }}
          >
            ★ Long-form profiles · {featuredList.length}
          </div>
          <p className="mb-3 text-[13px] italic text-[#4A4338]" style={{ fontFamily: 'var(--font-editorial)' }}>
            These have hand-written extended profiles — 200-400 words of editorial prose, not just a one-liner.
          </p>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {featuredList.map(fp => (
              <li key={fp.name}>
                <Link
                  href={`/philosopher/${philosopherSlug(fp.name)}`}
                  className="block border-2 px-3 py-2 transition-all hover:translate-x-[-1px] hover:translate-y-[-1px]"
                  style={{
                    borderColor: '#221E18',
                    background: '#FFFCF4',
                    boxShadow: '2px 2px 0 0 #B8862F',
                  }}
                >
                  <div className="text-[13.5px] font-medium text-[#221E18]" style={{ fontFamily: 'var(--font-editorial)' }}>
                    {loc(fp).name}
                  </div>
                  <div className="mt-0.5 text-[10.5px] tracking-wide text-[#8C6520]">
                    {loc(fp).dates}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Cross-link to the interactive constellation. This page is the
          alphabetical browseable list; /map is the explorable
          visual-first surface. Each linked from the other. */}
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <Link
          href="/map"
          className="border-2 border-[#221E18] bg-[#F8C75E] px-3 py-1.5 text-[12px] tracking-[0.18em] text-[#1A1820] hover:bg-[#B8862F]"
          style={{ fontFamily: "var(--font-pixel-display)", textTransform: "uppercase" }}
        >
          ▶ EXPLORE THE MAP VISUALLY
        </Link>
        <span className="text-[13px] text-[#8C6520]">
          — or browse alphabetically below, grouped by archetype.
        </span>
      </div>

      <div className="space-y-8">
        {ARCHETYPES.map((arch) => {
          const list = byArchetype.get(arch.key) || [];
          if (list.length === 0) return null;
          const archName = t(`arch.${arch.key}.name`, locale) || arch.key;
          const color = getArchetypeColor(arch.key);

          return (
            <PixelWindow
              key={arch.key}
              title={`THE ${arch.key.toUpperCase()} · ${list.length}`}
              badge="▶ ARCHETYPE CLUSTER"
              accent={{ primary: color.primary, deep: color.deep, soft: color.soft }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="border-2 p-2"
                  style={{
                    borderColor: color.deep,
                    background: '#FFFCF4',
                    boxShadow: `2px 2px 0 0 ${color.deep}`,
                  }}
                  aria-hidden
                >
                  <ArchetypeSprite archetypeKey={arch.key} size={56} />
                </div>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/archetype/${arch.key}`}
                    className="text-[20px] font-medium text-[#221E18] hover:text-[var(--acc-deep)] hover:underline sm:text-[22px]"
                    style={{ fontFamily: 'var(--font-prose)', color: color.deep }}
                  >
                    {archName} →
                  </Link>
                  <p
                    className="mt-1 text-[14px] italic leading-[1.4] text-[#4A4338]"
                    style={{ fontFamily: 'var(--font-prose)' }}
                  >
                    {arch.spirit}
                  </p>
                </div>
              </div>

              <ul className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                {list.map((p) => (
                  <li key={p.name}>
                    <Link
                      href={`/philosopher/${philosopherSlug(p.name)}`}
                      className="block border-2 px-3 py-2 transition-all hover:translate-x-[-1px] hover:translate-y-[-1px]"
                      style={{
                        borderColor: '#EBE3CA',
                        background: '#FFFCF4',
                        boxShadow: `2px 2px 0 0 ${color.deep}`,
                      }}
                    >
                      <div
                        className="text-[15px] font-medium text-[#221E18]"
                        style={{ fontFamily: 'var(--font-prose)' }}
                      >
                        {loc(p).name}
                      </div>
                      <div className="mt-0.5 text-[11.5px] tracking-wide text-[#8C6520]">
                        {loc(p).dates}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </PixelWindow>
          );
        })}
      </div>

      <p className="mt-12 text-center text-[13px] text-[#8C6520]">
        <Link
          href="/"
          className="underline decoration-[#B8862F]/40 underline-offset-3 hover:decoration-[#8C6520]"
        >
          ← {t('philindex.back_home', locale)}
        </Link>
      </p>
    </main>
  );
}
