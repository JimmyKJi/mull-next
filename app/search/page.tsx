// /search — leaderboard + public-profile search.
// v3 pixel chrome restyle.

import { getServerLocale } from '@/lib/locale-server';
import { t } from '@/lib/translations';
import LanguageSwitcher from '@/components/language-switcher';
import Link from 'next/link';
import SearchPanel from './search-panel';
import Leaderboard from './leaderboard';
import EditorPicks from './editor-picks';
import OriginalThinking from './original-thinking';
import LeaderboardTabs, { type TabKey } from './leaderboard-tabs';
import { PixelPageHeader } from '@/components/pixel-window';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Leaderboard & search',
  description: 'The most active Mull users, plus a search across public profiles.',
  alternates: { canonical: 'https://mull.world/search' },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const locale = await getServerLocale();
  const sp = await searchParams;
  const activeTab: TabKey =
    sp.tab === 'picks' ? 'picks' : sp.tab === 'original' ? 'original' : 'activity';

  return (
    <main className="mx-auto max-w-[860px] px-6 pb-32 pt-10 sm:px-10">
      <div className="mb-6 flex items-center justify-end gap-4">
        <LanguageSwitcher initial={locale} />
        <Link
          href="/account"
          className="text-[13px] text-[#4A4338] hover:text-[#221E18] hover:underline"
        >
          {t('nav.account_arrow', locale)}
        </Link>
      </div>

      <PixelPageHeader
        eyebrow={`▶ ${t('search.eyebrow', locale).toUpperCase()}`}
        title={t('search.h1', locale).toUpperCase()}
        subtitle={
          <p className="text-[16px] italic" style={{ fontFamily: 'var(--font-prose)' }}>
            {t('search.h1_subtitle', locale)}
          </p>
        }
      />

      <LeaderboardTabs active={activeTab} />
      {activeTab === 'activity' && <Leaderboard locale={locale} />}
      {activeTab === 'picks' && <EditorPicks locale={locale} />}
      {activeTab === 'original' && <OriginalThinking />}

      <section className="mt-12">
        <div
          className="flex items-center gap-3 text-[10px] tracking-[0.22em] text-[#8C6520]"
          style={{ fontFamily: 'var(--font-pixel-display)' }}
        >
          <span aria-hidden className="inline-block h-2 w-2 bg-[#B8862F]" />
          ▶ FIND SOMEONE
        </div>
        <h2
          className="mt-4 text-[22px] leading-[1.1] tracking-[0.04em] text-[#221E18] sm:text-[28px]"
          style={{ fontFamily: 'var(--font-pixel-display)' }}
        >
          <span style={{ textShadow: '3px 3px 0 #B8862F' }}>
            {t('search.find_someone', locale).toUpperCase()}
          </span>
        </h2>
        <p
          className="mt-4 text-[15.5px] italic leading-[1.55] text-[#4A4338]"
          style={{ fontFamily: 'var(--font-prose)' }}
        >
          {t('search.subtitle', locale)}
        </p>
        <div className="mt-5">
          <SearchPanel locale={locale} />
        </div>
      </section>

      {/* "Make yourself searchable" CTA — was a small underline text
          link; promoted to a chunky pixel chip so users who searched
          for themselves and found nothing have an obvious next step. */}
      <div className="mt-16 flex justify-center">
        <Link
          href="/account/profile"
          className="pixel-press inline-block border-[3px] border-[#221E18] bg-[#F8EDC8] px-4 py-2.5 text-[11px] tracking-[0.08em] text-[#221E18] no-underline"
          style={{
            fontFamily: 'var(--font-pixel-display)',
            boxShadow: '3px 3px 0 0 #B8862F',
            textTransform: 'uppercase',
            transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end)',
          }}
        >
          ▸ {t('search.cta_make_profile', locale).toUpperCase()}
        </Link>
      </div>
    </main>
  );
}
