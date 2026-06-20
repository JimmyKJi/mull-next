// /arena/open — Mull Open (S16). Quarterly PvP tournament. Coming soon.

import type { Metadata } from 'next';
import Link from 'next/link';
import { PixelPageHeader } from '@/components/pixel-window';
import ComingSoonCard from '@/components/coming-soon-card';
import { getServerLocale } from '@/lib/locale-server';
import { t } from '@/lib/translations';

export const metadata: Metadata = {
  title: 'Mull Open · Quarterly Tournament',
  description:
    'A quarterly PvP Arena tournament with brackets, seeding, and spectator finals. Coming soon.',
  alternates: { canonical: 'https://mull.world/arena/open' },
};

export default async function MullOpenPage() {
  const locale = await getServerLocale();
  return (
    <main className="mx-auto max-w-[820px] px-6 pb-32 pt-12 sm:px-10 sm:pt-16">
      <PixelPageHeader
        eyebrow={t('arena.open_eyebrow', locale)}
        title={t('arena.open_title', locale)}
        subtitle={null}
      />
      <ComingSoonCard
        locale={locale}
        eyebrow={t('arena.open_card_eyebrow', locale)}
        title={t('arena.open_card_title', locale)}
        pitch={t('arena.open_pitch', locale)}
        doing={[
          t('arena.open_doing_1', locale),
          t('arena.open_doing_2', locale),
          t('arena.open_doing_3', locale),
          t('arena.open_doing_4', locale),
        ]}
        when={t('arena.open_when', locale)}
        accent={{ primary: '#C7522A', deep: '#8C3717', soft: '#F5DCD0' }}
        meantime={{ href: '/arena', label: t('arena.open_meantime', locale) }}
      />
      <p className="mt-12 text-center text-[13px] text-acc-deep">
        <Link
          href="/arena"
          className="underline decoration-acc/40 underline-offset-3 hover:decoration-acc-deep"
        >
          {t('arena.back_to_arena', locale)}
        </Link>
      </p>
    </main>
  );
}
