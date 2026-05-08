import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import LogoutButton from './logout-button';
import { DIM_NAMES, DIM_KEYS, topShifts } from '@/lib/dimensions';
import { getDailyDilemma } from '@/lib/dilemmas';
import { getServerLocale } from '@/lib/locale-server';
import { t } from '@/lib/translations';
import LanguageSwitcher from '@/components/language-switcher';

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

export default async function AccountPage() {
  const supabase = await createClient();
  const locale = await getServerLocale();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Fetch all three event types in parallel
  const [attemptsRes, dilemmasRes, diariesRes] = await Promise.all([
    supabase
      .from('quiz_attempts')
      .select('id, archetype, flavor, alignment_pct, taken_at, vector')
      .order('taken_at', { ascending: false })
      .limit(20)
      .returns<Attempt[]>(),
    supabase
      .from('dilemma_responses')
      .select('id, dilemma_date, question_text, response_text, vector_delta, analysis, created_at')
      .order('created_at', { ascending: false })
      .limit(40)
      .returns<DilemmaResponse[]>(),
    supabase
      .from('diary_entries')
      .select('id, title, content, vector_delta, analysis, word_count, created_at')
      .order('created_at', { ascending: false })
      .limit(60)
      .returns<DiaryEntryRow[]>()
  ]);

  const attempts = attemptsRes.data ?? [];
  const dilemmas = dilemmasRes.data ?? [];
  const diaries = diariesRes.data ?? [];

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
  function computeStreak(dates: string[]): number {
    if (!dates.length) return 0;
    const set = new Set(dates);
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    let streak = 0;
    const cursor = new Date(today);
    // If they didn't answer today, start counting from yesterday
    if (!set.has(cursor.toISOString().slice(0, 10))) {
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    }
    while (set.has(cursor.toISOString().slice(0, 10))) {
      streak++;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    }
    return streak;
  }
  const streak = computeStreak(dilemmas.map(d => d.dilemma_date));
  const dilemmaCount = dilemmas.length;
  const quizCount = attempts.length;
  const diaryCount = diaries.length;

  return (
    <main style={{ maxWidth: 760, margin: '60px auto', padding: '0 24px' }}>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 36,
        gap: 16,
        flexWrap: 'wrap'
      }}>
        <Link href="/" style={{
          fontFamily: serif,
          fontSize: 28,
          fontWeight: 500,
          color: '#221E18',
          textDecoration: 'none',
          letterSpacing: '-0.5px'
        }}>
          Mull<span style={{ color: '#B8862F' }}>.</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <LanguageSwitcher initial={locale} />
          <LogoutButton locale={locale} />
        </div>
      </header>

      {locale !== 'en' && (
        <div style={{
          padding: '10px 14px',
          background: '#F5EFDC',
          borderLeft: '3px solid #B8862F',
          borderRadius: 6,
          fontFamily: sans,
          fontSize: 12.5,
          color: '#4A4338',
          marginBottom: 24,
          lineHeight: 1.55,
        }}>
          {t('i18n.content_notice', locale)}
        </div>
      )}

      <h1 style={{
        fontFamily: serif,
        fontSize: 42,
        fontWeight: 500,
        margin: '0 0 8px',
        letterSpacing: '-0.5px'
      }}>
        {t('account.title', locale)}
      </h1>
      <p style={{
        fontFamily: sans,
        fontSize: 15,
        color: '#4A4338',
        marginBottom: 32
      }}>
        {t('account.signed_in_as', locale)} <strong>{user.email}</strong>
        {' · '}
        <Link href="/account/profile" style={{
          color: '#8C6520',
          textDecoration: 'underline',
          textUnderlineOffset: 3,
        }}>
          {t('nav.public_profile_settings', locale)}
        </Link>
      </p>

      {(quizCount > 0 || dilemmaCount > 0) && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 12,
          marginBottom: 44,
        }}>
          <div style={{
            padding: '16px 20px',
            background: '#FFFCF4',
            border: '1px solid #EBE3CA',
            borderRadius: 10,
          }}>
            <div style={{
              fontFamily: serif,
              fontSize: 32,
              fontWeight: 500,
              color: '#221E18',
              lineHeight: 1,
            }}>{quizCount}</div>
            <div style={{
              fontFamily: sans,
              fontSize: 11,
              color: '#8C6520',
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              marginTop: 6,
            }}>{t(quizCount === 1 ? 'account.stat_quiz_attempt' : 'account.stat_quiz_attempts', locale)}</div>
          </div>
          <div style={{
            padding: '16px 20px',
            background: '#FFFCF4',
            border: '1px solid #EBE3CA',
            borderRadius: 10,
          }}>
            <div style={{
              fontFamily: serif,
              fontSize: 32,
              fontWeight: 500,
              color: '#221E18',
              lineHeight: 1,
            }}>{dilemmaCount}</div>
            <div style={{
              fontFamily: sans,
              fontSize: 11,
              color: '#8C6520',
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              marginTop: 6,
            }}>{t(dilemmaCount === 1 ? 'account.stat_dilemma_answered' : 'account.stat_dilemmas_answered', locale)}</div>
          </div>
          <div style={{
            padding: '16px 20px',
            background: '#FFFCF4',
            border: '1px solid #EBE3CA',
            borderRadius: 10,
          }}>
            <div style={{
              fontFamily: serif,
              fontSize: 32,
              fontWeight: 500,
              color: '#221E18',
              lineHeight: 1,
            }}>{diaryCount}</div>
            <div style={{
              fontFamily: sans,
              fontSize: 11,
              color: '#8C6520',
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              marginTop: 6,
            }}>{t(diaryCount === 1 ? 'account.stat_diary_entry' : 'account.stat_diary_entries', locale)}</div>
          </div>
          {streak > 0 && (
            <div style={{
              padding: '16px 20px',
              background: '#221E18',
              border: '1px solid #221E18',
              borderRadius: 10,
              color: '#FAF6EC',
            }}>
              <div style={{
                fontFamily: serif,
                fontSize: 32,
                fontWeight: 500,
                lineHeight: 1,
              }}>{streak} <span style={{ fontSize: 16, opacity: 0.7 }}>{t(streak === 1 ? 'account.stat_day' : 'account.stat_days', locale)}</span></div>
              <div style={{
                fontFamily: sans,
                fontSize: 11,
                color: '#F1C76A',
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                marginTop: 6,
              }}>{t('account.stat_current_streak', locale)}</div>
            </div>
          )}
        </div>
      )}

      <section style={{ marginBottom: 48 }}>
        <h2 style={{
          fontFamily: serif,
          fontStyle: 'italic',
          fontSize: 22,
          fontWeight: 500,
          color: '#4A4338',
          marginBottom: 16
        }}>
          {t('account.latest_result', locale)}
        </h2>

        {latestQuiz ? (
          <div style={{
            border: '1px solid #D6CDB6',
            borderRadius: 12,
            padding: '28px 32px',
            background: '#FFFCF4'
          }}>
            <div style={{
              fontFamily: serif,
              fontSize: 36,
              fontWeight: 500,
              letterSpacing: '-0.5px',
              marginBottom: 10
            }}>
              {latestQuiz.flavor ? `${latestQuiz.flavor} ` : ''}
              {latestQuiz.archetype.replace(/^The /, '')}
            </div>
            <div style={{
              fontFamily: sans,
              fontSize: 13,
              color: '#8C6520',
              letterSpacing: 1,
              textTransform: 'uppercase',
              marginBottom: 24
            }}>
              {latestQuiz.alignment_pct}{t('account.percent_alignment', locale)} · {fmt(latestQuiz.taken_at)}
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Link href="/" style={{
                display: 'inline-block',
                padding: '10px 20px',
                border: '1px solid #221E18',
                borderRadius: 6,
                color: '#221E18',
                textDecoration: 'none',
                fontFamily: sans,
                fontSize: 14
              }}>
                {t('account.take_it_again', locale)}
              </Link>
              <Link href="/dilemma" style={{
                display: 'inline-block',
                padding: '10px 20px',
                background: respondedToday ? 'transparent' : '#221E18',
                border: respondedToday ? '1px solid #D6CDB6' : '1px solid #221E18',
                borderRadius: 6,
                color: respondedToday ? '#4A4338' : '#FAF6EC',
                textDecoration: 'none',
                fontFamily: sans,
                fontSize: 14
              }}>
                {respondedToday ? t('account.todays_dilemma_answered', locale) : t('account.todays_dilemma_arrow', locale)}
              </Link>
              <Link href="/diary" style={{
                display: 'inline-block',
                padding: '10px 20px',
                border: '1px solid #2F5D5C',
                borderRadius: 6,
                color: '#2F5D5C',
                textDecoration: 'none',
                fontFamily: sans,
                fontSize: 14
              }}>
                {t('account.write_diary', locale)}
              </Link>
            </div>
          </div>
        ) : (
          <div style={{
            border: '1px dashed #D6CDB6',
            borderRadius: 12,
            padding: '36px 28px',
            textAlign: 'center',
            color: '#4A4338',
            background: '#FFFCF4'
          }}>
            <p style={{
              margin: '0 0 16px',
              fontFamily: serif,
              fontStyle: 'italic',
              fontSize: 20
            }}>
              {t('account.no_quiz_yet', locale)}
            </p>
            <Link href="/" style={{
              display: 'inline-block',
              padding: '10px 20px',
              border: '1px solid #221E18',
              borderRadius: 6,
              color: '#221E18',
              textDecoration: 'none',
              fontFamily: sans,
              fontSize: 14
            }}>
              {t('account.take_quiz_arrow', locale)}
            </Link>
          </div>
        )}
      </section>

      {iframeSrc && (
        <section style={{ marginBottom: 48 }}>
          <h2 style={{
            fontFamily: serif,
            fontStyle: 'italic',
            fontSize: 22,
            fontWeight: 500,
            color: '#4A4338',
            marginBottom: 16
          }}>
            {t('account.your_trajectory', locale)}
          </h2>
          <div style={{
            border: '1px solid #D6CDB6',
            borderRadius: 12,
            overflow: 'hidden',
            background: '#FFFCF4',
            position: 'relative'
          }}>
            <iframe
              src={iframeSrc}
              style={{
                width: '100%',
                height: 540,
                border: 'none',
                display: 'block',
              }}
              title="Your position and trajectory on the philosophical map"
              loading="lazy"
            />
          </div>
          <p style={{
            fontFamily: sans,
            fontSize: 13,
            color: '#8C6520',
            marginTop: 12,
            letterSpacing: 0.3,
          }}>
            {trailVectors.length > 1
              ? t('account.trajectory_caption_with_trail', locale, { n: trailVectors.length })
              : t('account.trajectory_caption_no_trail', locale)}
          </p>
          <div style={{
            marginTop: 18,
            padding: '14px 16px',
            background: '#F5EFDC',
            borderLeft: '3px solid #B8862F',
            borderRadius: 6,
            fontFamily: sans,
            fontSize: 13,
            color: '#4A4338',
            lineHeight: 1.55,
          }}>
            <strong style={{ color: '#221E18' }}>{t('account.trajectory_explainer_title', locale)}</strong>{' '}
            {t('account.trajectory_explainer_body', locale)}
          </div>
        </section>
      )}

      {trajectoryNewestFirst.length > 0 && (
        <section style={{ marginBottom: 48 }}>
          <h2 style={{
            fontFamily: serif,
            fontStyle: 'italic',
            fontSize: 22,
            fontWeight: 500,
            color: '#4A4338',
            marginBottom: 8
          }}>
            {t('account.recent_shifts', locale)}
          </h2>
          <p style={{
            fontFamily: sans,
            fontSize: 13,
            color: '#8C6520',
            marginBottom: 18,
            letterSpacing: 0.3,
          }}>
            {t('account.recent_shifts_subtitle', locale)}
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {trajectoryNewestFirst.map(({ event, delta }) => {
              const shifts = topShifts(delta, 0.3, 3);
              const ts =
                event.kind === 'quiz' ? event.taken_at :
                event.kind === 'dilemma' ? event.created_at :
                event.created_at;
              const accent =
                event.kind === 'quiz' ? '#B8862F' :
                event.kind === 'dilemma' ? '#3D7DA8' :
                '#2F5D5C';
              const labelColor =
                event.kind === 'quiz' ? '#8C6520' :
                event.kind === 'dilemma' ? '#1F4666' :
                '#173533';
              const labelText =
                event.kind === 'quiz' ? t('account.event_quiz_attempt', locale) :
                event.kind === 'dilemma' ? t('account.event_daily_dilemma', locale) :
                t('account.event_diary_entry', locale);
              return (
                <li key={event.id} style={{
                  padding: '18px 20px',
                  marginBottom: 10,
                  background: '#FFFCF4',
                  border: '1px solid #EBE3CA',
                  borderLeft: `3px solid ${accent}`,
                  borderRadius: 8,
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    flexWrap: 'wrap',
                    gap: 8,
                    marginBottom: 6,
                  }}>
                    <span style={{
                      fontFamily: sans,
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.14em',
                      color: labelColor,
                    }}>
                      {labelText} · {fmtRel(ts)}
                    </span>
                    <span style={{
                      fontFamily: sans,
                      fontSize: 12,
                      color: '#8C6520',
                      opacity: 0.75,
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
                        fontFamily: sans,
                        fontSize: 13,
                        color: '#8C6520',
                        marginLeft: 10,
                        letterSpacing: 1,
                        fontWeight: 400,
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
                        "{event.question_text}"
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
                        fontFamily: sans,
                        fontSize: 12,
                        color: '#2F5D5C',
                        textDecoration: 'underline',
                        textUnderlineOffset: 3,
                      }}>
                        {t('account.read_full_entry', locale)}
                      </a>
                    </>
                  )}
                  {shifts.length > 0 ? (
                    <div style={{
                      display: 'flex',
                      gap: 14,
                      flexWrap: 'wrap',
                      marginTop: 10,
                    }}>
                      {shifts.map(s => (
                        <span key={s.key} style={{
                          fontFamily: sans,
                          fontSize: 13,
                          color: s.delta > 0 ? '#2F5D5C' : '#7A2E2E',
                        }}>
                          <strong style={{ fontVariantNumeric: 'tabular-nums' }}>
                            {s.delta > 0 ? '+' : ''}{s.delta.toFixed(1)}
                          </strong>{' '}
                          <span style={{ color: '#4A4338' }}>{s.name}</span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    event.kind === 'quiz' && (
                      <div style={{
                        fontFamily: sans,
                        fontSize: 12,
                        color: '#8C6520',
                        fontStyle: 'italic',
                        opacity: 0.7,
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
    </main>
  );
}
