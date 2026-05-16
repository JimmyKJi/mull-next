// /philosopher — index of all 560 philosophers, grouped by archetype.
// v3 pixel chrome restyle. Each archetype cluster gets its own
// PixelWindow with the archetype sprite + per-archetype color.

import Link from 'next/link';
import type { Metadata } from 'next';
import { PHILOSOPHERS, philosopherSlug, type PhilosopherEntry } from '@/lib/philosophers';
import { ARCHETYPES } from '@/lib/archetypes';
import { getArchetypeColor } from '@/lib/archetype-colors';
import { ArchetypeSprite } from '@/components/archetype-sprite';
import { getServerLocale } from '@/lib/locale-server';
import { t } from '@/lib/translations';
import { PixelPageHeader, PixelWindow } from '@/components/pixel-window';

export const metadata: Metadata = {
  title: 'The constellation',
  description:
    "All 560 thinkers in Mull's philosophical constellation, grouped by archetype. Click any to read their key idea, dimensional position, and nearest minds.",
  openGraph: {
    title: 'The constellation — Mull',
    description: '560 thinkers across 10 archetypes. The full map of the long conversation.',
    url: 'https://mull.world/philosopher',
    siteName: 'Mull',
    type: 'article',
  },
  alternates: { canonical: 'https://mull.world/philosopher' },
};

export default async function PhilosopherIndexPage() {
  const locale = await getServerLocale();

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
        title="THE CONSTELLATION"
        subtitle={
          <div className="space-y-3">
            <p className="text-[16px] italic" style={{ fontFamily: 'var(--font-prose)' }}>
              {t('philindex.subtitle', locale, { n: PHILOSOPHERS.length })}
            </p>
            <p className="text-[14px] text-[#8C6520]">{t('philindex.intro', locale)}</p>
          </div>
        }
      />

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
                        {p.name}
                      </div>
                      <div className="mt-0.5 text-[11.5px] tracking-wide text-[#8C6520]">
                        {p.dates}
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
