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
import { useSearchParams } from 'next/navigation';

const sans = "'Inter', system-ui, sans-serif";

export type TabKey = 'activity' | 'picks' | 'original';

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: 'activity', label: 'Activity' },
  { key: 'picks',    label: "Editor's picks" },
  { key: 'original', label: 'Original thinking' },
];

export function useActiveTab(): TabKey {
  const params = useSearchParams();
  const t = params.get('tab');
  if (t === 'picks') return 'picks';
  if (t === 'original') return 'original';
  return 'activity';
}

export default function LeaderboardTabs({ active }: { active: TabKey }) {
  return (
    // Pixel-tabs: chunky 4-px ink bottom border with each tab as a
    // pixel-bordered "button". Active tab gets the amber fill +
    // hard ink shadow, inactive tabs sit flat in cream.
    <div
      role="tablist"
      className="flex flex-wrap gap-2 border-b-4 border-[#221E18] pb-0"
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
                ? 'bg-[#B8862F] text-[#1A1612] border-[#221E18]'
                : 'bg-[#FFFCF4] text-[#8C6520] border-[#D6CDB6] hover:bg-[#F8EDC8] hover:text-[#221E18] hover:border-[#221E18]')
            }
            style={{ fontFamily: 'var(--font-pixel-display)' }}
          >
            ▶ {tab.label.toUpperCase()}
          </Link>
        );
      })}
    </div>
  );
}
