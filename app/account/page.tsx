import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import LogoutButton from './logout-button';
import { DIM_NAMES, DIM_KEYS, topShifts } from '@/lib/dimensions';
import { getDailyDilemma } from '@/lib/dilemmas';
import { getServerLocale } from '@/lib/locale-server';
import { t } from '@/lib/translations';
import LanguageSwitcher from '@/components/language-switcher';
import ProgressionPanel from '@/components/progression-panel';
import { computeUserStats } from '@/lib/profile-progression';
import DilemmaReminderCard from '@/components/dilemma-reminder-card';
import ShareResultCard from '@/components/share-result-card';
import ReflectionCard from '@/components/reflection-card';
import WelcomePinger from '@/components/welcome-pinger';
import NextActionCard from '@/components/next-action-card';
import ReferralCard from '@/components/referral-card';
import PendingAttemptClaimer from '@/components/pending-attempt-claimer';
import { FIGURES } from '@/lib/figures';
import { isAdminUserId } from '@/lib/admin';

// Account pages should never be indexed by search engines — belt and braces
// alongside the disallow directive in app/robots.ts.
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

type Attempt = {
  id: string;
  archetype: string;
  flavor: string | null;
  alignment_pct: number;
  taken_at: string;
  vector: number[];
};

type DilemmaResponse = {
  id: string;
  dilemma_date: string;
  question_text: string;
  response_text: string;
  vector_delta: number[] | null;
  analysis: string | null;
  created_at: string;
};

type DiaryEntryRow = {
  id: string;
  title: string | null;
  content: string;
  vector_delta: number[] | null;
  analysis: string | null;
  word_count: number | null;
  created_at: string;
};

type ExerciseReflectionRow = {
  id: string;
  exercise_slug: string;
  content: string;
  vector_delta: number[] | null;
  analysis: string | null;
  word_count: number | null;
  created_at: string;
};

// Unified event the UI iterates over.
type EventEntry =
  | {
      kind: 'quiz';
      id: string;
      timestamp: number;
      archetype: string;
      flavor: string | null;
      alignment_pct: number;
      vector: number[];           // absolute position
      taken_at: string;
    }
  | {
      kind: 'dilemma';
      id: string;
      timestamp: number;
      question_text: string;
      response_text: string;
      delta: number[];
      analysis: string | null;
      created_at: string;
    }
  | {
      kind: 'diary';
      id: string;
      timestamp: number;
      title: string | null;
      content: string;
      delta: number[];
      analysis: string | null;
      word_count: number | null;
      created_at: string;
    }
  | {
      kind: 'exercise';
      id: string;
      timestamp: number;
      exercise_slug: string;
      content: string;
      delta: number[];
      analysis: string | null;
      word_count: number | null;
      created_at: string;
    };

function vecAdd(a: number[], b: number[]): number[] {
  return a.map((v, i) => +(v + (b[i] || 0)).toFixed(3));
}

// Walk through events oldest → newest, compute the absolute 16-D position at
// each step. Return an array of { event, positionAfter, deltaApplied }.
function computeTrajectory(events: EventEntry[]) {
  let position: number[] = new Array(16).fill(0);
  return events.map(ev => {
    const before = position.slice();
    let after: number[];
    let delta: number[];
    if (ev.kind === 'quiz') {
      after = ev.vector.slice();
      delta = after.map((v, i) => +(v - before[i]).toFixed(3));
    } else {
      delta = ev.delta.slice();
      after = vecAdd(before, delta);
    }
    position = after;
    return { event: ev, before, after, delta };
  });
}

const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'Inter', system-ui, sans-serif";
const pixel = "var(--font-pixel-display, 'Courier New', monospace)";

// Pixel-window stat card — used by the quiz/dilemma/diary tally row
// at the top of /account. Big VT323-ish pixel digit on top, tiny
// caret-prefixed pixel label below.
const statCardStyle: React.CSSProperties = {
  padding: '16px 20px',
  background: '#FFFCF4',
  border: '4px solid #221E18',
  boxShadow: '4px 4px 0 0 #B8862F',
  borderRadius: 0,
};
const statValueStyle: React.CSSProperties = {
  fontFamily: pixel,
  fontSize: 28,
  color: '#221E18',
  lineHeight: 1,
  letterSpacing: 0.4,
};
const statLabelStyle: React.CSSProperties = {
  fontFamily: pixel,
  fontSize: 10,
  color: '#8C6520',
  textTransform: 'uppercase',
  letterSpacing: '0.18em',
  marginTop: 8,
};

// Sub-page chip for /account/profile, /retrospective, /curate links
// in the signed-in card. Slim chunky pixel chrome — 2px ink + 2px
// hard amber shadow — so they read as feature entry points rather
// than footnote-text-links.
const accountSubChip: React.CSSProperties = {
  display: 'inline-block',
  padding: '6px 10px',
  background: '#FFFCF4',
  color: '#8C6520',
  border: '2px solid #221E18',
  boxShadow: '2px 2px 0 0 #B8862F',
  borderRadius: 0,
  fontFamily: pixel,
  fontSize: 10,
  letterSpacing: 0.4,
  textDecoration: 'none',
  transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end)',
};

// Jump-nav chip — same shape as accountSubChip but slightly larger
// + ink color (more navigation-y) so the two strips don't visually
// blur together.
const accountJumpChip: React.CSSProperties = {
  display: 'inline-block',
  padding: '8px 12px',
  background: '#F8EDC8',
  color: '#221E18',
  border: '2px solid #221E18',
  boxShadow: '3px 3px 0 0 #8C6520',
  borderRadius: 0,
  fontFamily: pixel,
  fontSize: 11,
  letterSpacing: 0.4,
  textDecoration: 'none',
  transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end)',
};

// Chunky pixel-button style for the trio of action <Link>s in the
// "latest result" card. Three configurable colors map to the three
// surfaces (fill, text, shadow). Hover lift handled via CSS in
// globals.css if present, else stays static.
function pixelActionLink(bg: string, color: string, shadow: string): React.CSSProperties {
  return {
    display: 'inline-block',
    padding: '10px 18px',
    background: bg,
    color,
    border: '3px solid #221E18',
    boxShadow: `3px 3px 0 0 ${shadow}`,
    borderRadius: 0,
    fontFamily: pixel,
    fontSize: 11,
    letterSpacing: 0.4,
    textDecoration: 'none',
    transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end)',
  };
}

export default async function AccountPage() {
  const supabase = await createClient();
  const locale = await getServerLocale();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Fetch all four event types in parallel.
  //
  // IMPORTANT: we explicitly filter every query by user_id. These tables
  // have two RLS policies on SELECT — "your own rows" via auth.uid() AND
  // "anyone's rows where is_public = true" (added in 20260509_public_per_entry).
  // Without an explicit user_id filter, a query returns the union: a brand
  // new account would see every other user's public entries in their own
  // trajectory. The trajectory is a private-by-design view; filter loudly.
  const [attemptsRes, dilemmasRes, diariesRes, reflectionsRes] = await Promise.all([
    supabase
      .from('quiz_attempts')
      .select('id, archetype, flavor, alignment_pct, taken_at, vector')
      .eq('user_id', user.id)
      .order('taken_at', { ascending: false })
      .limit(20)
      .returns<Attempt[]>(),
    supabase
      .from('dilemma_responses')
      .select('id, dilemma_date, question_text, response_text, vector_delta, analysis, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(40)
      .returns<DilemmaResponse[]>(),
    supabase
      .from('diary_entries')
      .select('id, title, content, vector_delta, analysis, word_count, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(60)
      .returns<DiaryEntryRow[]>(),
    supabase
      .from('exercise_reflections')
      .select('id, exercise_slug, content, vector_delta, analysis, word_count, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(60)
      .returns<ExerciseReflectionRow[]>()
  ]);

  const attempts = attemptsRes.data ?? [];
  const dilemmas = dilemmasRes.data ?? [];
  const diaries = diariesRes.data ?? [];
  const reflections = reflectionsRes.data ?? [];

  // Build unified event list, oldest → newest
  const events: EventEntry[] = [
    ...attempts
      .filter(a => Array.isArray(a.vector) && a.vector.length === 16)
      .map<EventEntry>(a => ({
        kind: 'quiz',
        id: a.id,
        timestamp: new Date(a.taken_at).getTime(),
        archetype: a.archetype,
        flavor: a.flavor,
        alignment_pct: a.alignment_pct,
        vector: a.vector,
        taken_at: a.taken_at,
      })),
    ...dilemmas
      .filter(d => Array.isArray(d.vector_delta) && d.vector_delta.length === 16)
      .map<EventEntry>(d => ({
        kind: 'dilemma',
        id: d.id,
        timestamp: new Date(d.created_at).getTime(),
        question_text: d.question_text,
        response_text: d.response_text,
        delta: d.vector_delta!,
        analysis: d.analysis,
        created_at: d.created_at,
      })),
    ...diaries
      .filter(d => Array.isArray(d.vector_delta) && d.vector_delta.length === 16)
      .map<EventEntry>(d => ({
        kind: 'diary',
        id: d.id,
        timestamp: new Date(d.created_at).getTime(),
        title: d.title,
        content: d.content,
        delta: d.vector_delta!,
        analysis: d.analysis,
        word_count: d.word_count,
        created_at: d.created_at,
      })),
    ...reflections
      .filter(r => Array.isArray(r.vector_delta) && r.vector_delta.length === 16)
      .map<EventEntry>(r => ({
        kind: 'exercise',
        id: r.id,
        timestamp: new Date(r.created_at).getTime(),
        exercise_slug: r.exercise_slug,
        content: r.content,
        delta: r.vector_delta!,
        analysis: r.analysis,
        word_count: r.word_count,
        created_at: r.created_at,
      }))
  ].sort((a, b) => a.timestamp - b.timestamp);

  const trajectory = computeTrajectory(events);
  const latestPos = trajectory.length ? trajectory[trajectory.length - 1].after : null;
  const latestQuiz = attempts[0] ?? null;

  // Trail: last 10 positions, oldest → newest
  const trailVectors = trajectory.slice(-10).map(t => t.after);

  // Reverse trajectory for display (newest first)
  const trajectoryNewestFirst = trajectory.slice().reverse();

  const fmt = (s: string) =>
    new Date(s).toLocaleString(locale === 'en' ? 'en-GB' : locale, { dateStyle: 'medium', timeStyle: 'short' });
  const fmtRel = (s: string) => {
    const diff = Date.now() - new Date(s).getTime();
    const days = Math.floor(diff / 86400000);
    if (days < 1) return t('time.today', locale);
    if (days === 1) return t('time.yesterday', locale);
    if (days < 7) return t(days === 1 ? 'time.day_ago' : 'time.days_ago', locale, { n: days });
    if (days < 30) {
      const w = Math.floor(days / 7);
      return t(w === 1 ? 'time.week_ago' : 'time.weeks_ago', locale, { n: w });
    }
    if (days < 365) {
      const m = Math.floor(days / 30);
      return t(m === 1 ? 'time.month_ago' : 'time.months_ago', locale, { n: m });
    }
    const y = Math.floor(days / 365);
    return t(y === 1 ? 'time.year_ago' : 'time.years_ago', locale, { n: y });
  };

  // Encode current position + history for the iframe
  const encodedVec = latestPos
    ? encodeURIComponent(Buffer.from(JSON.stringify(latestPos)).toString('base64'))
    : null;
  const encodedHist = trailVectors.length > 1
    ? encodeURIComponent(Buffer.from(JSON.stringify(trailVectors)).toString('base64'))
    : null;
  const iframeSrc = encodedVec
    ? `/?embed=map&v=${encodedVec}${encodedHist ? `&h=${encodedHist}` : ''}`
    : null;

  // Has the user already responded to today's dilemma?
  const todayKey = getDailyDilemma().dateKey;
  const respondedToday = dilemmas.some(d => d.dilemma_date === todayKey);

  // Streak: number of consecutive days ending today (or yesterday if not done today)
  // on which the user submitted a dilemma response.
  // Streak with one-day grace: a single missed day is forgiven so
  // users who forget once don't lose hard-won progress. Two
  // consecutive missed days break the streak.
  function computeStreak(dates: string[]): number {
    if (!dates.length) return 0;
    const set = new Set(dates);
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const cursor = new Date(today);
    if (!set.has(cursor.toISOString().slice(0, 10))) {
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    }
    let streak = 0;
    let graceUsed = false;
    for (let i = 0; i < 1825; i++) {
      const k = cursor.toISOString().slice(0, 10);
      if (set.has(k)) {
        streak++;
        cursor.setUTCDate(cursor.getUTCDate() - 1);
      } else if (!graceUsed) {
        graceUsed = true;
        cursor.setUTCDate(cursor.getUTCDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }
  const streak = computeStreak(dilemmas.map(d => d.dilemma_date));
  const dilemmaCount = dilemmas.length;
  const quizCount = attempts.length;
  const diaryCount = diaries.length;

  // Milestones + badges. Computed independently from the trajectory data
  // because progression needs unlimited counts (the trajectory queries
  // above limit to 40/60/60 for the visualization), and a couple extra
  // tables (debate_history, public_profiles) the trajectory doesn't.
  const stats = await computeUserStats(supabase, user.id);

  // Referral data — preload code + count so the card can render in
  // the first paint without waiting on /api/referral/save. The API
  // route still runs on the client to attribute any pending /r/<code>
  // cookie + lazily insert the code if missing.
  const [referralCodeRes, referralCountRes] = await Promise.all([
    supabase.from('referral_codes').select('code').eq('user_id', user.id).maybeSingle(),
    supabase.from('referrals').select('user_id', { count: 'exact', head: true }).eq('referrer_user_id', user.id),
  ]);
  const referralCode: string | null = (referralCodeRes.data?.code as string | undefined) ?? null;
  const referralCount: number = referralCountRes.count ?? 0;

  return (
    <main className="mx-auto max-w-[820px] px-6 pb-32 pt-10 sm:px-10">
      {/* Top rail — language switcher + sign-out (the wordmark lives
          in the global SiteNav now). */}
      <div className="mb-6 flex items-center justify-end gap-3">
        <LanguageSwitcher initial={locale} />
        <LogoutButton locale={locale} />
      </div>

      {locale !== 'en' && (
        <div
          className="mb-6 border-l-4 px-4 py-2.5 text-[13px] leading-[1.55] text-[#4A4338]"
          style={{ borderColor: '#B8862F', background: '#F5EFDC' }}
        >
          {t('i18n.content_notice', locale)}
        </div>
      )}

      {/* Pixel page header — "ACCOUNT" + signed-in pill. */}
      <header className="mb-8">
        <div
          className="flex items-center gap-3 text-[10px] tracking-[0.24em] text-[#8C6520]"
          style={{ fontFamily: 'var(--font-pixel-display)' }}
        >
          <span aria-hidden className="inline-block h-2 w-2 bg-[#B8862F]" />
          ▶ YOUR ACCOUNT
        </div>
        <h1
          className="mt-5 pr-2 text-[28px] leading-[1.05] tracking-[0.04em] text-[#221E18] sm:text-[40px]"
          style={{ fontFamily: 'var(--font-pixel-display)' }}
        >
          <span style={{ textShadow: '3px 3px 0 #B8862F' }}>
            {t('account.title', locale).toUpperCase()}
          </span>
        </h1>

        {/* Signed-in card — pixel-bordered with email + admin links.
            Sub-page links promoted from underline text to small chunky
            pixel chips so features like the yearly retrospective don't
            read as footnotes. */}
        <div
          className="mt-6 border-2 border-[#221E18] bg-[#FFFCF4] p-3 text-[13.5px] text-[#4A4338]"
          style={{ boxShadow: '3px 3px 0 0 #8C6520' }}
        >
          <div>
            {t('account.signed_in_as', locale)}{' '}
            <strong className="text-[#221E18]">{user.email}</strong>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/account/profile" className="pixel-press" style={accountSubChip}>
              ▸ {t('nav.public_profile_settings', locale).toUpperCase()}
            </Link>
            <Link href="/account/retrospective" className="pixel-press" style={accountSubChip}>
              ▸ YEARLY RETROSPECTIVE
            </Link>
            {isAdminUserId(user.id) ? (
              <Link href="/account/curate" className="pixel-press" style={accountSubChip}>
                ▸ CURATE PICKS
              </Link>
            ) : null}
          </div>
        </div>
      </header>

      {/* Account jump-nav strip — pixel chips that anchor-link to the
          major sections below. The page is long; on day-180 of usage,
          finding "where's the map again?" requires scrolling. This
          strip is the escape valve. Only renders for users with at
          least one quiz/dilemma/diary so brand-new accounts don't get
          a wall of "you don't have this yet" anchors. */}
      {(quizCount > 0 || dilemmaCount > 0 || diaryCount > 0) && (
        <nav
          aria-label="Jump to section"
          className="mb-9 flex flex-wrap gap-2"
        >
          <a href="#latest-result" className="pixel-press" style={accountJumpChip}>▸ RESULT</a>
          {iframeSrc && <a href="#trajectory" className="pixel-press" style={accountJumpChip}>▸ MAP</a>}
          {trajectoryNewestFirst.length > 0 && <a href="#shifts" className="pixel-press" style={accountJumpChip}>▸ SHIFTS</a>}
          <a href="#progression" className="pixel-press" style={accountJumpChip}>▸ BADGES</a>
          <a href="#invite" className="pixel-press" style={accountJumpChip}>▸ INVITE</a>
        </nav>
      )}

      {/* First-time empty state — shown only before the user has any data
          to display in the stats / trajectory sections below. Three doors
          into the product, in the order most people benefit from them.
          Pixel-restyled: chunky pixel eyebrow + grid of pixel-window doors. */}
      {quizCount === 0 && dilemmaCount === 0 && diaryCount === 0 && (
        <section style={{ marginBottom: 44 }}>
          <div style={{
            fontFamily: 'var(--font-pixel-display)',
            fontSize: 11,
            color: '#8C6520',
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            marginBottom: 14,
          }}>
            {t('first.eyebrow', locale).toUpperCase()}
          </div>
          <h2 style={{
            fontFamily: serif,
            fontSize: 30,
            fontWeight: 500,
            margin: '0 0 8px',
            letterSpacing: '-0.3px',
          }}>
            {t('first.title', locale)}
          </h2>
          <p style={{
            fontFamily: serif,
            fontStyle: 'italic',
            fontSize: 17,
            color: '#4A4338',
            margin: '0 0 24px',
            lineHeight: 1.55,
          }}>
            {t('first.subtitle', locale)}
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16,
          }}>
            <FirstStepCard
              accent="#B8862F"
              title={t('first.q_title', locale)}
              body={t('first.q_body', locale)}
              cta={t('first.cta_q', locale)}
              href="/"
              primary
            />
            <FirstStepCard
              accent="#2F5D5C"
              title={t('first.d_title', locale)}
              body={t('first.d_body', locale)}
              cta={t('first.cta_d', locale)}
              href="/dilemma"
            />
            <FirstStepCard
              accent="#7A4A2E"
              title={t('first.j_title', locale)}
              body={t('first.j_body', locale)}
              cta={t('first.cta_j', locale)}
              href="/diary"
            />
          </div>
        </section>
      )}

      {/* Adaptive next-action prompt — shows a single high-value
          suggestion based on user state. Renders nothing for
          brand-new users (the FirstStepCard grid above already covers
          the "do anything" case), so the two don't fight. */}
      <NextActionCard
        quizCount={quizCount}
        respondedToday={respondedToday}
        streak={streak}
        hasShareable={!!latestQuiz}
        topArchetypeKey={latestQuiz?.archetype
          ? latestQuiz.archetype
              .replace(/^The\s+/i, '')
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-+|-+$/g, '')
          : undefined}
      />

      {(quizCount > 0 || dilemmaCount > 0) && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 14,
          marginBottom: 44,
        }}>
          <div style={statCardStyle}>
            <div style={statValueStyle}>{quizCount}</div>
            <div style={statLabelStyle}>{t(quizCount === 1 ? 'account.stat_quiz_attempt' : 'account.stat_quiz_attempts', locale)}</div>
          </div>
          <div style={statCardStyle}>
            <div style={statValueStyle}>{dilemmaCount}</div>
            <div style={statLabelStyle}>{t(dilemmaCount === 1 ? 'account.stat_dilemma_answered' : 'account.stat_dilemmas_answered', locale)}</div>
          </div>
          <div style={statCardStyle}>
            <div style={statValueStyle}>{diaryCount}</div>
            <div style={statLabelStyle}>{t(diaryCount === 1 ? 'account.stat_diary_entry' : 'account.stat_diary_entries', locale)}</div>
          </div>
          {streak > 0 && (
            <div style={{
              padding: '16px 20px',
              background: '#221E18',
              border: '4px solid #221E18',
              boxShadow: '4px 4px 0 0 #B8862F',
              borderRadius: 0,
              color: '#FAF6EC',
            }}>
              <div style={{
                fontFamily: 'var(--font-pixel-display)',
                fontSize: 28,
                color: '#F8EDC8',
                lineHeight: 1,
                letterSpacing: 0.4,
              }}>{
                // Cap displayed streak at "30+" so a 200-day streak
                // doesn't dominate the stat row visually. The real
                // number still drives milestones + badges; this is
                // purely a layout-bound display cap.
                streak >= 30 ? '30+' : streak
              }<span style={{ fontSize: 13, opacity: 0.7, marginLeft: 6 }}>{t(streak === 1 ? 'account.stat_day' : 'account.stat_days', locale).toUpperCase()}</span></div>
              <div style={{
                fontFamily: 'var(--font-pixel-display)',
                fontSize: 10,
                color: '#F1C76A',
                textTransform: 'uppercase',
                letterSpacing: '0.18em',
                marginTop: 8,
              }}>{t('account.stat_current_streak', locale).toUpperCase()}{streak >= 30 ? ` · ${streak} DAYS` : ''}</div>
            </div>
          )}
        </div>
      )}

      <section id="latest-result" style={{ marginBottom: 48, scrollMarginTop: 96 }}>
        <h2 style={{
          fontFamily: pixel,
          fontSize: 16,
          color: '#221E18',
          textTransform: 'uppercase',
          letterSpacing: '0.18em',
          marginBottom: 18,
          textShadow: '2px 2px 0 #B8862F',
        }}>
          ▸ {t('account.latest_result', locale).toUpperCase()}
        </h2>

        {latestQuiz ? (
          <div style={{
            border: '4px solid #221E18',
            boxShadow: '5px 5px 0 0 #B8862F',
            borderRadius: 0,
            padding: '28px 32px',
            background: '#FFFCF4'
          }}>
            {/* Figure + name row. Figure links to the long-form archetype
                essay; on phones it sits above the name (flex-wrap) so the
                name remains readable instead of squeezing next to a 120px
                tile in 320px of width. Pixel-tile around the figure now. */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              marginBottom: 16,
              flexWrap: 'wrap',
            }}>
              {(() => {
                const archSlug = latestQuiz.archetype
                  .replace(/^The\s+/i, '')
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, '-')
                  .replace(/^-+|-+$/g, '');
                const figure = FIGURES[archSlug] || '';
                if (!figure) return null;
                return (
                  <Link href={`/archetype/${archSlug}`} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 100,
                    height: 100,
                    flexShrink: 0,
                    background: '#F8EDC8',
                    borderRadius: 0,
                    border: '4px solid #221E18',
                    boxShadow: '4px 4px 0 0 #8C6520',
                    padding: 10,
                    textDecoration: 'none',
                  }}
                    className="pixel-crisp"
                  >
                    <span
                      aria-hidden
                      style={{ width: '100%', height: '100%', display: 'block' }}
                      dangerouslySetInnerHTML={{ __html: figure }}
                    />
                  </Link>
                );
              })()}
              <div style={{ minWidth: 0, flex: '1 1 280px' }}>
                <div style={{
                  fontFamily: serif,
                  fontSize: 36,
                  fontWeight: 500,
                  letterSpacing: '-0.5px',
                  lineHeight: 1.1,
                  marginBottom: 10,
                }}>
                  {latestQuiz.flavor ? `${latestQuiz.flavor} ` : ''}
                  {latestQuiz.archetype.replace(/^The /, '')}
                </div>
                <div style={{
                  fontFamily: pixel,
                  fontSize: 11,
                  color: '#8C6520',
                  letterSpacing: 0.4,
                  textTransform: 'uppercase',
                }}>
                  {latestQuiz.alignment_pct}{t('account.percent_alignment', locale)} · {fmt(latestQuiz.taken_at)}
                </div>
              </div>
            </div>
            <div style={{ marginBottom: 24 }} />
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/" className="pixel-press" style={pixelActionLink('#221E18', '#FAF6EC', '#B8862F')}>
                {t('account.take_it_again', locale).toUpperCase()}
              </Link>
              <Link
                href="/dilemma"
                className="pixel-press"
                style={
                  respondedToday
                    ? pixelActionLink('#FFFCF4', '#4A4338', '#D6CDB6')
                    : pixelActionLink('#B8862F', '#1A1612', '#221E18')
                }
              >
                {(respondedToday ? t('account.todays_dilemma_answered', locale) : t('account.todays_dilemma_arrow', locale)).toUpperCase()}
              </Link>
              <Link href="/diary" className="pixel-press" style={pixelActionLink('#FFFCF4', '#2F5D5C', '#2F5D5C')}>
                {t('account.write_diary', locale).toUpperCase()}
              </Link>
            </div>
            {/* Share row — same X intent / copy link / native share that
                appears on the immediate quiz result, surfaced again here
                so users who come back later still have a way to share. */}
            <ShareResultCard
              archetype={latestQuiz.archetype}
              flavor={latestQuiz.flavor}
              alignmentPct={latestQuiz.alignment_pct}
            />
          </div>
        ) : (
          <div style={{
            border: '3px dashed #8C6520',
            borderRadius: 0,
            padding: '36px 28px',
            textAlign: 'center',
            color: '#4A4338',
            background: '#FFFCF4'
          }}>
            <p style={{
              margin: '0 0 18px',
              fontFamily: serif,
              fontStyle: 'italic',
              fontSize: 20
            }}>
              {t('account.no_quiz_yet', locale)}
            </p>
            <Link href="/" className="pixel-press" style={pixelActionLink('#B8862F', '#1A1612', '#221E18')}>
              {t('account.take_quiz_arrow', locale).toUpperCase()}
            </Link>
          </div>
        )}
      </section>

      {iframeSrc && (
        <section id="trajectory" style={{ marginBottom: 48, scrollMarginTop: 96 }}>
          <h2 style={{
            fontFamily: pixel,
            fontSize: 16,
            color: '#221E18',
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            marginBottom: 18,
            textShadow: '2px 2px 0 #2F5D5C',
          }}>
            ▸ {t('account.your_trajectory', locale).toUpperCase()}
          </h2>
          {/* Iframe wrapped in a 540px-tall pixel-shimmer placeholder
              so the page doesn't jump when the lazy iframe paints.
              The iframe sits on top with its own background; if it
              fails to load, the shimmer keeps animating instead of
              leaving a blank ink rectangle. */}
          <div style={{
            border: '4px solid #221E18',
            boxShadow: '5px 5px 0 0 #2F5D5C',
            borderRadius: 0,
            overflow: 'hidden',
            background: '#FFFCF4',
            position: 'relative',
            height: 540,
          }}>
            <div
              aria-hidden
              className="pixel-shimmer"
              style={{
                position: 'absolute',
                inset: 0,
                border: 'none',
                zIndex: 0,
              }}
            />
            <iframe
              src={iframeSrc}
              style={{
                position: 'relative',
                zIndex: 1,
                width: '100%',
                height: '100%',
                border: 'none',
                display: 'block',
              }}
              title="Your position and trajectory on the philosophical map"
              loading="lazy"
            />
          </div>
          <p style={{
            fontFamily: pixel,
            fontSize: 11,
            color: '#8C6520',
            marginTop: 14,
            letterSpacing: 0.4,
            textTransform: 'uppercase',
          }}>
            {(trailVectors.length > 1
              ? t('account.trajectory_caption_with_trail', locale, { n: trailVectors.length })
              : t('account.trajectory_caption_no_trail', locale)).toUpperCase()}
          </p>
          <div style={{
            marginTop: 18,
            padding: '14px 16px',
            background: '#F8EDC8',
            border: '3px solid #221E18',
            boxShadow: '3px 3px 0 0 #B8862F',
            borderRadius: 0,
            fontFamily: serif,
            fontSize: 14,
            color: '#221E18',
            lineHeight: 1.55,
          }}>
            <strong style={{ color: '#221E18' }}>{t('account.trajectory_explainer_title', locale)}</strong>{' '}
            {t('account.trajectory_explainer_body', locale)}
          </div>
        </section>
      )}

      {trajectoryNewestFirst.length > 0 && (
        <section id="shifts" style={{ marginBottom: 48, scrollMarginTop: 96 }}>
          <h2 style={{
            fontFamily: pixel,
            fontSize: 16,
            color: '#221E18',
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            marginBottom: 8,
            textShadow: '2px 2px 0 #B8862F',
          }}>
            ▸ {t('account.recent_shifts', locale).toUpperCase()}
          </h2>
          <p style={{
            fontFamily: serif,
            fontStyle: 'italic',
            fontSize: 14.5,
            color: '#4A4338',
            marginBottom: 22,
            lineHeight: 1.55,
          }}>
            {t('account.recent_shifts_subtitle', locale)}
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {trajectoryNewestFirst.map(({ event, delta }) => {
              const shifts = topShifts(delta, 0.3, 3);
              const ts =
                event.kind === 'quiz' ? event.taken_at :
                event.created_at;
              // Per-kind accent maps to the shadow color so each
              // event-type reads at-a-glance: amber=quiz, blue=dilemma,
              // teal=diary, brick=exercise.
              const accent =
                event.kind === 'quiz' ? '#B8862F' :
                event.kind === 'dilemma' ? '#3D7DA8' :
                event.kind === 'diary' ? '#2F5D5C' :
                '#7A2E2E';
              const labelText =
                event.kind === 'quiz' ? t('account.event_quiz_attempt', locale) :
                event.kind === 'dilemma' ? t('account.event_daily_dilemma', locale) :
                event.kind === 'diary' ? t('account.event_diary_entry', locale) :
                t('account.event_exercise_reflection', locale);
              return (
                <li key={event.id} style={{
                  padding: '18px 20px',
                  marginBottom: 14,
                  background: '#FFFCF4',
                  border: '4px solid #221E18',
                  boxShadow: `4px 4px 0 0 ${accent}`,
                  borderRadius: 0,
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    flexWrap: 'wrap',
                    gap: 8,
                    marginBottom: 8,
                  }}>
                    <span style={{
                      fontFamily: pixel,
                      fontSize: 11,
                      textTransform: 'uppercase',
                      letterSpacing: '0.18em',
                      color: accent,
                    }}>
                      {labelText.toUpperCase()} · {fmtRel(ts).toUpperCase()}
                    </span>
                    <span style={{
                      fontFamily: pixel,
                      fontSize: 10,
                      color: '#8C6520',
                      opacity: 0.85,
                      letterSpacing: 0.4,
                      textTransform: 'uppercase',
                    }}>
                      {fmt(ts)}
                    </span>
                  </div>
                  {event.kind === 'quiz' && (
                    <div style={{
                      fontFamily: serif,
                      fontSize: 22,
                      fontWeight: 500,
                      color: '#221E18',
                      marginBottom: shifts.length ? 10 : 0,
                      letterSpacing: '-0.01em',
                    }}>
                      {event.flavor ? `${event.flavor} ` : ''}
                      {event.archetype.replace(/^The /, '')}
                      <span style={{
                        fontFamily: pixel,
                        fontSize: 12,
                        color: '#8C6520',
                        marginLeft: 12,
                        letterSpacing: 0.4,
                      }}>
                        {event.alignment_pct}%
                      </span>
                    </div>
                  )}
                  {event.kind === 'dilemma' && (
                    <>
                      <p style={{
                        fontFamily: serif,
                        fontStyle: 'italic',
                        fontSize: 17,
                        color: '#4A4338',
                        margin: '0 0 8px',
                      }}>
                        &ldquo;{event.question_text}&rdquo;
                      </p>
                      {event.analysis && (
                        <p style={{
                          fontFamily: serif,
                          fontSize: 15,
                          color: '#221E18',
                          margin: '0 0 10px',
                          lineHeight: 1.55,
                        }}>
                          {event.analysis}
                        </p>
                      )}
                    </>
                  )}
                  {event.kind === 'diary' && (
                    <>
                      {event.title && (
                        <div style={{
                          fontFamily: serif,
                          fontSize: 19,
                          fontWeight: 500,
                          color: '#221E18',
                          marginBottom: 6,
                        }}>
                          {event.title}
                        </div>
                      )}
                      <p style={{
                        fontFamily: serif,
                        fontSize: 15.5,
                        color: '#4A4338',
                        margin: '0 0 8px',
                        lineHeight: 1.55,
                      }}>
                        {event.content.length > 240 ? event.content.slice(0, 240) + '…' : event.content}
                      </p>
                      {event.analysis && (
                        <p style={{
                          fontFamily: serif,
                          fontStyle: 'italic',
                          fontSize: 14,
                          color: '#8C6520',
                          margin: '0 0 10px',
                          lineHeight: 1.5,
                        }}>
                          {event.analysis}
                        </p>
                      )}
                      <a href={`/diary/${event.id}`} style={{
                        fontFamily: pixel,
                        fontSize: 11,
                        color: '#2F5D5C',
                        textDecoration: 'none',
                        letterSpacing: 0.4,
                        textTransform: 'uppercase',
                        borderBottom: '2px solid #2F5D5C',
                        paddingBottom: 1,
                      }}>
                        ▸ {t('account.read_full_entry', locale).toUpperCase()}
                      </a>
                    </>
                  )}
                  {shifts.length > 0 ? (
                    <div style={{
                      display: 'flex',
                      gap: 12,
                      flexWrap: 'wrap',
                      marginTop: 12,
                      paddingTop: 12,
                      borderTop: '2px dashed #D6CDB6',
                    }}>
                      {shifts.map(s => (
                        <span key={s.key} style={{
                          fontFamily: pixel,
                          fontSize: 11,
                          color: s.delta > 0 ? '#2F5D5C' : '#7A2E2E',
                          letterSpacing: 0.4,
                          textTransform: 'uppercase',
                          padding: '4px 10px',
                          background: s.delta > 0 ? '#E5F0EE' : '#F5E0E0',
                          border: `2px solid ${s.delta > 0 ? '#2F5D5C' : '#7A2E2E'}`,
                        }}>
                          <strong style={{ fontVariantNumeric: 'tabular-nums' }}>
                            {s.delta > 0 ? '+' : ''}{s.delta.toFixed(1)}
                          </strong>{' '}
                          {s.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    event.kind === 'quiz' && (
                      <div style={{
                        fontFamily: serif,
                        fontStyle: 'italic',
                        fontSize: 13,
                        color: '#8C6520',
                        opacity: 0.85,
                        marginTop: 10,
                      }}>
                        {t('account.first_event', locale)}
                      </div>
                    )
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Milestones + badges. Always renders, even for brand-new users —
          their progress bars start at zero and the unearned-badges
          preview shows what's coming. Wrapped in a #progression
          anchor so the jump-nav strip can scroll-to it. */}
      <div id="progression" style={{ scrollMarginTop: 96 }}>
        <ProgressionPanel stats={stats} locale={locale} />
      </div>

      {/* Reflection card — surfaces an 8+ week old dilemma response
          back to the user with a follow-up textarea. Returns null
          when there's nothing to surface (most users for the first
          8 weeks). The single highest-impact transformation feature
          we ship. */}
      <ReflectionCard />

      {/* Fires the one-time welcome email on first /account view. Renders
          nothing visible. Idempotent — the endpoint checks whether
          we've already sent before firing. */}
      <WelcomePinger />

      {/* Reads localStorage for a quiz result completed by an
          anonymous visitor before signup and claims it to this
          account. Renders nothing; refreshes the page on success
          so the trajectory rerenders with the new attempt. */}
      <PendingAttemptClaimer />

      {/* Friend referral card — generates the user's invite link
          (lazily, via /api/referral/save) and shows a count of
          friends who've joined. Renders nothing until the API
          responds with a code. Wrapped in #invite for jump-nav. */}
      <div id="invite" style={{ scrollMarginTop: 96 }}>
        <ReferralCard initialCode={referralCode} initialCount={referralCount} />
      </div>

      {/* Daily-dilemma email reminder card — opt-in, time-zone aware.
          Sits inside /account so the privacy-respecting opt-in is the
          first place a user encounters it. */}
      <DilemmaReminderCard locale={locale} />
    </main>
  );
}

// First-time empty-state door. Pixel chrome: chunky 4px ink border +
// hard accent shadow. Primary card swaps to amber fill so the
// "take the quiz" path reads as the recommended starting point.
function FirstStepCard({
  accent, title, body, cta, href, primary = false,
}: {
  accent: string; title: string; body: string; cta: string; href: string; primary?: boolean;
}) {
  return (
    <Link href={href} className="pixel-press" style={{
      display: 'block',
      padding: '20px 22px',
      background: primary ? '#F8EDC8' : '#FFFCF4',
      border: '4px solid #221E18',
      boxShadow: `5px 5px 0 0 ${accent}`,
      borderRadius: 0,
      textDecoration: 'none',
      color: '#221E18',
      transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end)',
    }}>
      <div style={{
        fontFamily: serif,
        fontSize: 21,
        fontWeight: 500,
        marginBottom: 8,
        letterSpacing: '-0.2px',
        color: '#221E18',
      }}>
        {title}
      </div>
      <p style={{
        fontFamily: sans,
        fontSize: 13.5,
        color: '#4A4338',
        margin: '0 0 14px',
        lineHeight: 1.55,
      }}>
        {body}
      </p>
      <span style={{
        fontFamily: pixel,
        fontSize: 11,
        color: accent,
        letterSpacing: 0.4,
        textTransform: 'uppercase',
      }}>
        ▸ {cta.toUpperCase()}
      </span>
    </Link>
  );
}
