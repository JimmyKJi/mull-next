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

export type TabKey = 'activity' | 'picks';

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: 'activity', label: 'Activity' },
  { key: 'picks', label: "Editor's picks" },
];

export function useActiveTab(): TabKey {
  const params = useSearchParams();
  const t = params.get('tab');
  return t === 'picks' ? 'picks' : 'activity';
}

export default function LeaderboardTabs({ active }: { active: TabKey }) {
  return (
    <div role="tablist" style={{
      display: 'flex',
      gap: 6,
      marginBottom: 18,
      borderBottom: '1px solid #EBE3CA',
    }}>
      {TABS.map(tab => {
        const isActive = active === tab.key;
        return (
          <Link
            key={tab.key}
            href={tab.key === 'activity' ? '/search' : `/search?tab=${tab.key}`}
            role="tab"
            aria-selected={isActive}
            style={{
              fontFamily: sans,
              fontSize: 14,
              fontWeight: isActive ? 600 : 500,
              color: isActive ? '#221E18' : '#8C6520',
              textDecoration: 'none',
              padding: '10px 16px',
              borderBottom: isActive ? '2px solid #B8862F' : '2px solid transparent',
              marginBottom: -1,
              transition: 'color 0.15s, border-color 0.15s',
            }}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
