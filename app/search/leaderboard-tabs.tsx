// Tab switcher for the /search page. Two tabs today (Activity +
// Editor's picks); a third (Forum reputation) gets added when the
// forum lands. Uses a query param `?tab=` so tab state survives
// reloads + bookmarks. Defaults to 'activity'.
//
// Renders only the headers — the bodies (Leaderboard component vs
// EditorPicks component) are conditionally rendered by the parent
// based on `activeTab`. This keeps the server components from doing
// unnecessary work.

'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { t, isLocale, type Locale } from '@/lib/translations';

const sans = "'Inter', system-ui, sans-serif";

export type TabKey = 'activity' | 'picks' | 'original';

const TABS: Array<{ key: TabKey; labelKey: string }> = [
  { key: 'activity', labelKey: 'srch2.tab_activity' },
  { key: 'picks',    labelKey: 'srch2.tab_picks' },
  { key: 'original', labelKey: 'srch2.tab_original' },
];

export function useActiveTab(): TabKey {
  const params = useSearchParams();
  const tab = params.get('tab');
  if (tab === 'picks') return 'picks';
  if (tab === 'original') return 'original';
  return 'activity';
}

export default function LeaderboardTabs({ active }: { active: TabKey }) {
  const [locale, setLocale] = useState<Locale>('en');
  useEffect(() => {
    const m = document.cookie.match(/(?:^|; )mull_locale=([^;]+)/);
    const v = m?.[1];
    if (v && isLocale(v)) setLocale(v);
  }, []);

  return (
    // Pixel-tabs: chunky 4-px ink bottom border with each tab as a
    // pixel-bordered "button". Active tab gets the amber fill +
    // hard ink shadow, inactive tabs sit flat in cream.
    <div
      role="tablist"
      className="flex flex-wrap gap-2 border-b-4 border-ink pb-0"
      style={{ marginBottom: 20 }}
    >
      {TABS.map((tab) => {
        const isActive = active === tab.key;
        return (
          <Link
            key={tab.key}
            href={tab.key === 'activity' ? '/search' : `/search?tab=${tab.key}`}
            role="tab"
            aria-selected={isActive}
            className={
              'inline-flex items-center border-l-2 border-r-2 border-t-2 px-4 py-2 text-[11px] tracking-[0.18em] transition-colors ' +
              (isActive
                ? 'bg-acc text-[#1A1612] border-ink'
                : 'bg-[#FFFCF4] text-acc-deep border-line hover:bg-acc-soft hover:text-ink hover:border-ink')
            }
            style={{ fontFamily: 'var(--font-pixel-display)' }}
          >
            ▶ {t(tab.labelKey, locale).toUpperCase()}
          </Link>
        );
      })}
    </div>
  );
}
