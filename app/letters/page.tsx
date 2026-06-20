// /letters — Letters Between Inheritors (S14). Coming soon scaffold.

import type { Metadata } from 'next';
import Link from 'next/link';
import { PixelPageHeader } from '@/components/pixel-window';
import ComingSoonCard from '@/components/coming-soon-card';
import { getServerLocale } from '@/lib/locale-server';
import { t } from '@/lib/translations';

export const metadata: Metadata = {
  title: 'Letters · Mull',
  description:
    "Structured letters that follow the Inheritor's archetype-keyed task at +1 week, +1 month, +3 months. Coming soon.",
  alternates: { canonical: 'https://mull.world/letters' },
};

export default async function LettersPage() {
  const locale = await getServerLocale();
  return (
    <main className="mx-auto max-w-[820px] px-6 pb-32 pt-12 sm:px-10 sm:pt-16">
      <PixelPageHeader
        eyebrow={t('ltr.header_eyebrow', locale)}
        title={t('ltr.header_title', locale)}
        subtitle={null}
      />
      <ComingSoonCard
        locale={locale}
        eyebrow={t('ltr.card_eyebrow', locale)}
        title={t('ltr.card_title', locale)}
        pitch={t('ltr.pitch', locale)}
        doing={[
          t('ltr.doing_1', locale),
          t('ltr.doing_2', locale),
          t('ltr.doing_3', locale),
          t('ltr.doing_4', locale),
        ]}
        when={t('ltr.when', locale)}
        accent={{ primary: '#9067B0', deep: '#3F2454', soft: '#E8DCF0' }}
        meantime={{ href: '/quiz/journey', label: t('ltr.meantime', locale) }}
      />
      <p className="mt-12 text-center text-[13px] text-acc-deep">
        <Link
          href="/"
          className="underline decoration-acc/40 underline-offset-3 hover:decoration-acc-deep"
        >
          {t('ltr.back', locale)}
        </Link>
      </p>
    </main>
  );
}
