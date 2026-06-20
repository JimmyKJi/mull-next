// /long-letter — The Long Letter (S20). Coming soon scaffold.

import type { Metadata } from 'next';
import Link from 'next/link';
import { PixelPageHeader } from '@/components/pixel-window';
import ComingSoonCard from '@/components/coming-soon-card';
import { getServerLocale } from '@/lib/locale-server';
import { t } from '@/lib/translations';

export const metadata: Metadata = {
  title: 'The Long Letter · Mull',
  description:
    'Once a year, write 2,000+ words on something specifically hard. Mull saves it. Five years later: resurfaces it. Coming soon.',
  alternates: { canonical: 'https://mull.world/long-letter' },
};

export default async function LongLetterPage() {
  const locale = await getServerLocale();
  return (
    <main className="mx-auto max-w-[820px] px-6 pb-32 pt-12 sm:px-10 sm:pt-16">
      <PixelPageHeader
        eyebrow={t('llr.header_eyebrow', locale)}
        title={t('llr.header_title', locale)}
        subtitle={null}
      />
      <ComingSoonCard
        locale={locale}
        eyebrow={t('llr.card_eyebrow', locale)}
        title={t('llr.card_title', locale)}
        pitch={t('llr.pitch', locale)}
        doing={[
          t('llr.doing_1', locale),
          t('llr.doing_2', locale),
          t('llr.doing_3', locale),
          t('llr.doing_4', locale),
        ]}
        when={t('llr.when', locale)}
        accent={{ primary: 'var(--color-acc)', deep: '#5C4528', soft: '#FBF6E8' }}
        meantime={{ href: '/diary', label: t('llr.meantime', locale) }}
      />
      <p className="mt-12 text-center text-[13px] text-acc-deep">
        <Link
          href="/"
          className="underline decoration-acc/40 underline-offset-3 hover:decoration-acc-deep"
        >
          {t('llr.back', locale)}
        </Link>
      </p>
    </main>
  );
}
