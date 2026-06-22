// /arena/pvp — landing for player-vs-player Arena.
//
// Three sections:
//   1. Your active matches (where it's your turn) — surface first
//   2. Open challenges — browse + accept
//   3. Create a new challenge

import Link from 'next/link';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getArenaTopic } from '@/lib/arena/data';
import { localizeArenaTopic } from '@/lib/arena/topics-i18n';
import { getServerLocale } from '@/lib/locale-server';
import { t, type Locale } from '@/lib/translations';
import { JudgingNotice } from '@/components/judging-notice';

export const metadata: Metadata = {
  title: 'Arena · PvP · Mull',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";
const serif = 'var(--font-prose)';

type OpenChallenge = {
  id: string;
  challenger_user_id: string;
  challenger_handle: string | null;
  challenger_display_name: string | null;
  challenger_elo: number | null;
  topic_slug: string;
  started_at: string;
};

type MyActiveMatch = {
  id: string;
  challenger_user_id: string;
  opponent_user_id: string;
  topic_slug: string;
  last_speaker: 'user' | 'opponent' | null;
};

export default async function ArenaPvpPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/arena/pvp');
  const locale = await getServerLocale();

  const [openRes, activeRes, ratingRes] = await Promise.all([
    supabase
      .from('arena_open_challenges')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(20),
    supabase.from('arena_my_active_pvp').select('*').limit(20),
    supabase
      .from('arena_user_ratings')
      .select('pvp_elo, pvp_debates_count')
      .eq('user_id', user.id)
      .maybeSingle(),
  ]);

  const openChallenges = (openRes.data as OpenChallenge[] | null) ?? [];
  const myMatches = (activeRes.data as MyActiveMatch[] | null) ?? [];
  const myPvpElo = (ratingRes.data?.pvp_elo as number) ?? 1000;

  // Categorize my matches by whose turn it is.
  const myTurnMatches: MyActiveMatch[] = [];
  const theirTurnMatches: MyActiveMatch[] = [];
  for (const m of myMatches) {
    const iAmChallenger = m.challenger_user_id === user.id;
    const mySpeaker = iAmChallenger ? 'user' : 'opponent';
    if (m.last_speaker !== mySpeaker) {
      myTurnMatches.push(m); // last turn was NOT mine → my turn now
    } else {
      theirTurnMatches.push(m);
    }
  }

  // Filter out my own open challenges from the browse list.
  const browsableChallenges = openChallenges.filter((c) => c.challenger_user_id !== user.id);
  const myOpenChallenges = openChallenges.filter((c) => c.challenger_user_id === user.id);

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

      <header style={{ marginBottom: 24 }}>
        <h1
          style={{
            fontFamily: pixel,
            fontSize: 24,
            color: 'var(--color-ink)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            textShadow: '3px 3px 0 var(--pixel-shadow, #2F5D5C)',
            marginBottom: 10,
          }}
        >
          {t('arena.pvp_title', locale)}
        </h1>
        <p
          style={{
            fontFamily: serif,
            fontStyle: 'italic',
            fontSize: 16,
            color: 'var(--color-ink-soft)',
            margin: 0,
            lineHeight: 1.55,
          }}
        >
          {t('arena.pvp_sub_a', locale)}
          <strong style={{ color: 'var(--color-ink)' }}>{myPvpElo}</strong>
          {t('arena.pvp_sub_b', locale, { n: ratingRes.data?.pvp_debates_count ?? 0 })}
        </p>
      </header>

      <JudgingNotice locale={locale} style={{ marginBottom: 28 }} />

      {/* Section: your turn */}
      {myTurnMatches.length > 0 && (
        <section style={{ marginBottom: 28 }}>
          <SectionHead
            label={t('arena.pvp_sec_your_turn', locale, { n: myTurnMatches.length })}
            accent="#7A2E2E"
          />
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'grid',
              gap: 8,
            }}
          >
            {myTurnMatches.map((m) => (
              <MatchRow key={m.id} match={m} flavour="your-turn" locale={locale} />
            ))}
          </ul>
        </section>
      )}

      {/* Section: waiting on opponent */}
      {theirTurnMatches.length > 0 && (
        <section style={{ marginBottom: 28 }}>
          <SectionHead
            label={t('arena.pvp_sec_waiting', locale, { n: theirTurnMatches.length })}
            accent="#8C6520"
          />
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'grid',
              gap: 8,
            }}
          >
            {theirTurnMatches.map((m) => (
              <MatchRow key={m.id} match={m} flavour="waiting" locale={locale} />
            ))}
          </ul>
        </section>
      )}

      {/* Section: your open challenges */}
      {myOpenChallenges.length > 0 && (
        <section style={{ marginBottom: 28 }}>
          <SectionHead label={t('arena.pvp_sec_your_open', locale)} accent="#8C6520" />
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'grid',
              gap: 8,
            }}
          >
            {myOpenChallenges.map((c) => (
              <OpenChallengeRow key={c.id} challenge={c} locale={locale} mine />
            ))}
          </ul>
        </section>
      )}

      {/* Section: open challenges board */}
      <section style={{ marginBottom: 28 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 10,
          }}
        >
          <SectionHead
            label={t('arena.pvp_sec_open', locale, { n: browsableChallenges.length })}
            accent="#2F5D5C"
          />
          <Link
            href="/arena/pvp/new"
            style={{
              padding: '8px 14px',
              background: '#F8C75E',
              color: '#1A1820',
              border: '2px solid var(--color-ink)',
              boxShadow: '3px 3px 0 0 #2F5D5C',
              fontFamily: pixel,
              fontSize: 10,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              textDecoration: 'none',
            }}
          >
            {t('arena.pvp_post_cta', locale)}
          </Link>
        </div>
        {browsableChallenges.length === 0 ? (
          <p
            style={{
              padding: '20px 18px',
              background: '#FFFCF4',
              border: '3px dashed var(--color-acc-deep)',
              fontFamily: serif,
              fontStyle: 'italic',
              fontSize: 15,
              color: 'var(--color-acc-deep)',
              margin: 0,
              textAlign: 'center',
            }}
          >
            {t('arena.pvp_empty', locale)}
          </p>
        ) : (
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'grid',
              gap: 8,
            }}
          >
            {browsableChallenges.map((c) => (
              <OpenChallengeRow key={c.id} challenge={c} locale={locale} />
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function SectionHead({ label, accent }: { label: string; accent: string }) {
  return (
    <div
      style={{
        fontFamily: pixel,
        fontSize: 11,
        color: accent,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        marginBottom: 10,
        textShadow: '2px 2px 0 rgba(0,0,0,0.05)',
      }}
    >
      {label}
    </div>
  );
}

function MatchRow({
  match,
  flavour,
  locale,
}: {
  match: MyActiveMatch;
  flavour: 'your-turn' | 'waiting';
  locale: Locale;
}) {
  const baseTopic = getArenaTopic(match.topic_slug);
  const topic = baseTopic ? localizeArenaTopic(baseTopic, locale) : null;
  const accent = flavour === 'your-turn' ? '#7A2E2E' : 'var(--color-acc-deep)';
  return (
    <li>
      <Link
        href={`/arena/pvp/${match.id}`}
        style={{
          display: 'block',
          padding: '14px 16px',
          background: '#FFFCF4',
          border: '3px solid var(--color-ink)',
          boxShadow: `3px 3px 0 0 ${accent}`,
          textDecoration: 'none',
          color: 'inherit',
          fontFamily: serif,
        }}
      >
        <div
          style={{
            fontFamily: pixel,
            fontSize: 10,
            color: accent,
            letterSpacing: 0.4,
            textTransform: 'uppercase',
            marginBottom: 4,
          }}
        >
          {flavour === 'your-turn'
            ? t('arena.match_your_turn', locale)
            : t('arena.pvp_waiting_opp', locale)}
        </div>
        <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--color-ink)' }}>
          {topic?.title ?? match.topic_slug}
        </div>
      </Link>
    </li>
  );
}

function OpenChallengeRow({
  challenge,
  locale,
  mine,
}: {
  challenge: OpenChallenge;
  locale: Locale;
  mine?: boolean;
}) {
  const baseTopic = getArenaTopic(challenge.topic_slug);
  const topic = baseTopic ? localizeArenaTopic(baseTopic, locale) : null;
  const challengerLabel =
    challenge.challenger_display_name ||
    (challenge.challenger_handle
      ? `@${challenge.challenger_handle}`
      : t('arena.anonymous', locale));
  return (
    <li>
      <Link
        href={mine ? `/arena/pvp/${challenge.id}` : `/arena/pvp/${challenge.id}`}
        style={{
          display: 'block',
          padding: '14px 16px',
          background: mine ? 'var(--color-acc-soft)' : '#FFFCF4',
          border: '3px solid var(--color-ink)',
          boxShadow: '3px 3px 0 0 #2F5D5C',
          textDecoration: 'none',
          color: 'inherit',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            gap: 8,
            flexWrap: 'wrap',
            marginBottom: 4,
          }}
        >
          <div
            style={{
              fontFamily: serif,
              fontSize: 16,
              fontWeight: 500,
              color: 'var(--color-ink)',
            }}
          >
            {topic?.title ?? challenge.topic_slug}
          </div>
          <div
            style={{
              fontFamily: pixel,
              fontSize: 10,
              color: 'var(--color-acc-deep)',
              letterSpacing: 0.4,
              textTransform: 'uppercase',
            }}
          >
            {mine
              ? t('arena.pvp_yours_waiting', locale)
              : t('arena.pvp_vs_challenger', locale, {
                  name: challengerLabel,
                  elo: challenge.challenger_elo ?? 1000,
                })}
          </div>
        </div>
        <div
          style={{
            fontFamily: serif,
            fontStyle: 'italic',
            fontSize: 14,
            color: 'var(--color-ink-soft)',
            lineHeight: 1.45,
          }}
        >
          {topic?.prompt ?? ''}
        </div>
      </Link>
    </li>
  );
}
