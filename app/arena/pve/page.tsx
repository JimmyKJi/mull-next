// /arena/pve — choose your opponent + topic, then start a session.
//
// Server component lists the 5 PvE philosophers + 5 topics. Client
// kicker handles the actual session creation + redirect to the
// match page.

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { ARENA_PHILOSOPHERS, ARENA_TOPICS, localizeArenaPhilosopherName } from '@/lib/arena/data';
import { localizeArenaTopic } from '@/lib/arena/topics-i18n';
import { getServerLocale } from '@/lib/locale-server';
import { t } from '@/lib/translations';
import PveStarter from './pve-starter';
import { JudgingNotice } from '@/components/judging-notice';

// Force dynamic — user's rating is loaded per-request.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Arena · PvE · Mull',
  robots: { index: false, follow: false },
};

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";
const serif = 'var(--font-prose)';

export default async function ArenaPvePage() {
  const locale = await getServerLocale();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/arena/pve');

  // Load current Elo so the starter can lock opponents > MAX_ELO_GAP above.
  const { data: rating } = await supabase
    .from('arena_user_ratings')
    .select('pve_elo')
    .eq('user_id', user.id)
    .maybeSingle();
  const userElo = (rating?.pve_elo as number) ?? 1000;

  return (
    <main className="mx-auto max-w-[760px] px-6 pb-32 pt-10 sm:px-10">
      <div className="mb-6">
        <Link
          href="/arena"
          style={{
            fontFamily: pixel,
            fontSize: 11,
            color: 'var(--color-ink-soft)',
            textDecoration: 'none',
            letterSpacing: 0.4,
            textTransform: 'uppercase',
          }}
        >
          {t('arena.back', locale)}
        </Link>
      </div>
      <h1
        style={{
          fontFamily: pixel,
          fontSize: 24,
          color: 'var(--color-ink)',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          textShadow: '3px 3px 0 var(--pixel-shadow, var(--color-acc))',
          marginBottom: 20,
        }}
      >
        {t('arena.pve_choose_title', locale)}
      </h1>
      <JudgingNotice locale={locale} style={{ marginBottom: 20 }} />
      <PveStarter
        philosophers={ARENA_PHILOSOPHERS.map((p) => ({
          name: p.name,
          displayName: localizeArenaPhilosopherName(p.name, locale),
          baseElo: p.baseElo,
          tier: p.tier,
        }))}
        topics={ARENA_TOPICS.map((topic) => {
          const lz = localizeArenaTopic(topic, locale);
          return {
            slug: topic.slug,
            title: lz.title,
            category: topic.category,
            primer: lz.primer,
          };
        })}
        userElo={userElo}
        locale={locale}
      />
    </main>
  );
}
