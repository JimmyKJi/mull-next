// /archetype — index of all 10 archetypes. v3 pixel chrome restyle.
// Each card uses the new pixel ArchetypeSprite (was the smooth SVG)
// and the chunky pixel-panel styling pattern.

import Link from 'next/link';
import type { Metadata } from 'next';
import { ARCHETYPES } from '@/lib/archetypes';
import { getArchetypeColor } from '@/lib/archetype-colors';
import { ArchetypeSprite } from '@/components/archetype-sprite';
import { getServerLocale } from '@/lib/locale-server';
import { t } from '@/lib/translations';
import LanguageSwitcher from '@/components/language-switcher';
import { PixelPageHeader } from '@/components/pixel-window';

export const metadata: Metadata = {
  title: 'The ten archetypes',
  description:
    "The ten philosophical orientations Mull's quiz can place you at — Cartographer, Keel, Threshold, Pilgrim, Touchstone, Hearth, Forge, Hammer, Garden, Lighthouse.",
  openGraph: {
    title: 'The ten archetypes — Mull',
    description: "The ten philosophical orientations Mull's quiz can place you at.",
    url: 'https://mull.world/archetype',
    siteName: 'Mull',
    type: 'article',
  },
  alternates: { canonical: 'https://mull.world/archetype' },
};

export default async function ArchetypeIndexPage() {
  const locale = await getServerLocale();

  return (
    <main className="mx-auto max-w-[1200px] px-6 pb-32 pt-12 sm:px-10 sm:pt-16">
      <div className="mb-6 flex justify-end">
        <LanguageSwitcher initial={locale} />
      </div>

      <PixelPageHeader
        eyebrow="▶ THE TEN ARCHETYPES"
        title="CHOOSE YOUR ARCHETYPE"
        subtitle={
          <p
            className="text-[16px] italic"
            style={{ fontFamily: 'var(--font-prose)' }}
          >
            {t('arch_index.subtitle', locale)}
          </p>
        }
      />

      <p className="-mt-6 mb-10 max-w-[680px] text-[14px] leading-[1.6] text-[#4A4338] sm:mb-12">
        {t('arch_index.intro', locale)}
      </p>

      {/* Equal-height roster — same pattern as the home grid. */}
      <ul className="grid auto-rows-fr grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {ARCHETYPES.map((a) => {
          const color = getArchetypeColor(a.key);
          const name = t(`arch.${a.key}.name`, locale) || a.key;
          const blurb = t(`arch.${a.key}.blurb`, locale) || '';

          return (
            <li key={a.key} className="h-full">
              <Link
                href={`/archetype/${a.key}`}
                className="archetype-tile group block h-full transition-transform duration-200 hover:-translate-x-1 hover:-translate-y-1"
              >
                <div
                  className="flex h-full flex-col border-4"
                  style={{
                    background: color.soft,
                    borderColor: color.deep,
                    boxShadow: `4px 4px 0 0 ${color.deep}`,
                  }}
                >
                  <div
                    className="flex items-center justify-between border-b-4 px-3 py-2 text-[10px] tracking-[0.18em]"
                    style={{
                      borderColor: color.deep,
                      backgroundColor: color.deep,
                      color: color.soft,
                      fontFamily: 'var(--font-pixel-display)',
                    }}
                  >
                    <span>NO. {String(ARCHETYPES.indexOf(a) + 1).padStart(2, '0')}</span>
                    <span>THE {a.key.toUpperCase()}</span>
                  </div>

                  <div
                    className="relative mx-auto my-4 flex h-[120px] w-[120px] shrink-0 items-center justify-center"
                    aria-hidden
                  >
                    <div
                      className="absolute inset-2 bg-[#FFFCF4]"
                      style={{
                        boxShadow: `inset 0 0 0 3px ${color.deep}`,
                      }}
                    />
                    <div className="archetype-sprite relative">
                      <ArchetypeSprite archetypeKey={a.key} size={88} />
                    </div>
                  </div>

                  <div
                    className="flex-1 border-t-2 px-3 py-3 text-center"
                    style={{ borderColor: color.deep }}
                  >
                    <h2 className="text-[18px] font-medium leading-tight text-[#221E18]">
                      {name}
                    </h2>
                    <p
                      className="mt-1 text-[13px] italic leading-[1.4] text-[#8C6520]"
                      style={{ fontFamily: 'var(--font-prose)' }}
                    >
                      {a.spirit}
                    </p>
                    {blurb ? (
                      <p
                        className="mt-3 text-[13px] leading-[1.55] text-[#4A4338]"
                        style={{ fontFamily: 'var(--font-prose)' }}
                      >
                        {blurb}
                      </p>
                    ) : null}
                  </div>

                  <div
                    className="border-t-2 px-3 py-2 text-center text-[10px] tracking-[0.22em]"
                    style={{
                      borderColor: color.deep,
                      backgroundColor: color.deep,
                      color: color.soft,
                      fontFamily: 'var(--font-pixel-display)',
                    }}
                  >
                    <span className="opacity-60 transition-opacity group-hover:opacity-100">
                      ▶ {t('arch_index.read_more', locale)}
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      <p className="mt-12 text-center text-[13px] text-[#8C6520]">
        <Link
          href="/"
          className="underline decoration-[#B8862F]/40 underline-offset-3 hover:decoration-[#8C6520]"
        >
          ← {t('arch_index.back_to_home', locale)}
        </Link>
      </p>
    </main>
  );
}
