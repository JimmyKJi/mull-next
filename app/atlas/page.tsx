// /atlas — the Capability Atlas.
//
// The user's "stats page" — six skill bars, levels, totals, a recent-
// event log, a streak counter. Every retention surface in Mull fires
// events into this. Returning users come here to see their growth
// in one place.
//
// Server shell hands to the client component which reads localStorage.

import type { Metadata } from 'next';
import Link from 'next/link';
import { PixelPageHeader } from '@/components/pixel-window';
import { getServerLocale } from '@/lib/locale-server';
import { t } from '@/lib/translations';
import AtlasView from './atlas-view';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return {
    title: t('atl.meta_title', locale),
    description: t('atl.meta_description', locale),
    alternates: { canonical: 'https://mull.world/atlas' },
  };
}

export default async function AtlasPage() {
  const locale = await getServerLocale();
  return (
    <main className="mx-auto max-w-[860px] px-6 pb-32 pt-12 sm:px-10 sm:pt-16">
      <PixelPageHeader
        eyebrow={t('atl.eyebrow', locale)}
        title={t('atl.title', locale)}
        subtitle={
          <p className="text-[16px] italic" style={{ fontFamily: 'var(--font-editorial)' }}>
            {t('atl.subtitle', locale)}
          </p>
        }
      />
      <AtlasView locale={locale} />
      <p className="mt-12 text-center text-[13px] text-acc-deep">
        <Link
          href="/"
          className="underline decoration-acc/40 underline-offset-3 hover:decoration-acc-deep"
        >
          ← {t('atl.back_to_mull', locale)}
        </Link>
      </p>
    </main>
  );
}
