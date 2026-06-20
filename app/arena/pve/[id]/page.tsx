// /arena/pve/[id] — active debate session.
//
// Server loads the session + turns + judge_json (if any) and hands
// them to the client engine.

import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import { getArenaPhilosopher, getArenaTopic, localizeArenaPhilosopherName } from '@/lib/arena/data';
import { localizeArenaTopic } from '@/lib/arena/topics-i18n';
import { getServerLocale } from '@/lib/locale-server';
import { t } from '@/lib/translations';
import MatchClient from './match-client';

export const metadata: Metadata = {
  title: 'Arena · Match · Mull',
  robots: { index: false, follow: false },
};

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const locale = await getServerLocale();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/arena/pve/${id}`);

  const { data: session } = await supabase
    .from('arena_sessions')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (!session) notFound();

  const { data: turns } = await supabase
    .from('arena_turns')
    .select('turn_order, speaker, content')
    .eq('session_id', id)
    .order('turn_order', { ascending: true });

  const philosopher = getArenaPhilosopher(session.opponent);
  const topic = getArenaTopic(session.topic_slug);
  if (!philosopher || !topic) notFound();

  const lzTopic = localizeArenaTopic(topic, locale);
  const opponentDisplay = localizeArenaPhilosopherName(philosopher.name, locale);

  return (
    <main className="mx-auto max-w-[800px] px-6 pb-32 pt-10 sm:px-10">
      <div className="mb-5">
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
      <MatchClient
        sessionId={id}
        opponentName={opponentDisplay}
        opponentElo={philosopher.baseElo}
        topicTitle={lzTopic.title}
        topicPrompt={lzTopic.prompt}
        topicPrimer={lzTopic.primer}
        userElo={session.user_elo_at_start}
        locale={locale}
        initialTurns={(turns ?? []).map((t) => ({
          turn_order: t.turn_order as number,
          speaker: t.speaker as 'user' | 'opponent',
          content: t.content as string,
        }))}
        initialJudge={session.judge_json}
        initialEloDelta={session.elo_delta}
        initialStatus={session.status as 'active' | 'judged' | 'abandoned'}
        initialVerdict={session.verdict as 'user' | 'opponent' | 'draw' | null}
      />
    </main>
  );
}
