import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import LogoutButton from './logout-button';
import { DIM_NAMES, DIM_KEYS, topShifts } from '@/lib/dimensions';
import { getDailyDilemma } from '@/lib/dilemmas';

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
      delta: number[];            // 16-D delta from previous position
      analysis: string | null;
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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Fetch both event types in parallel
  const [attemptsRes, dilemmasRes] = await Promise.all([
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
      .returns<DilemmaResponse[]>()
  ]);

  const attempts = attemptsRes.data ?? [];
  const dilemmas = dilemmasRes.data ?? [];

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
    new Date(s).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
  const fmtRel = (s: string) => {
    const diff = Date.now() - new Date(s).getTime();
    const days = Math.floor(diff / 86400000);
    if (days < 1) return 'today';
    if (days === 1) return 'yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
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
        <LogoutButton />
      </header>

      <h1 style={{
        fontFamily: serif,
        fontSize: 42,
        fontWeight: 500,
        margin: '0 0 8px',
        letterSpacing: '-0.5px'
      }}>
        Your account
      </h1>
      <p style={{
        fontFamily: sans,
        fontSize: 15,
        color: '#4A4338',
        marginBottom: 32
      }}>
        Signed in as <strong>{user.email}</strong>
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
            }}>Quiz attempt{quizCount === 1 ? '' : 's'}</div>
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
            }}>Dilemma{dilemmaCount === 1 ? '' : 's'} answered</div>
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
              }}>{streak} <span style={{ fontSize: 16, opacity: 0.7 }}>day{streak === 1 ? '' : 's'}</span></div>
              <div style={{
                fontFamily: sans,
                fontSize: 11,
                color: '#F1C76A',
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                marginTop: 6,
              }}>Current streak</div>
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
          Latest result
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
              {latestQuiz.alignment_pct}% alignment · {fmt(latestQuiz.taken_at)}
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
                Take it again →
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
                {respondedToday ? "Today's dilemma — answered ✓" : "Today's dilemma →"}
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
              You haven't taken the quiz yet.
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
              Take the quiz →
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
            Your trajectory on the map
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
              ? `Pulsing gold star is your current position. Faded dots show your last ${trailVectors.length} positions, threaded by a dashed line — each dot is one quiz attempt or daily dilemma response.`
              : `Pulsing gold star is you on the map. As you take the quiz again or answer daily dilemmas, your position will shift and a trail of past positions will appear here.`}
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
            <strong style={{ color: '#221E18' }}>How the trajectory works.</strong>{' '}
            Each <strong>quiz attempt</strong> is a hard reset — it replaces your current position
            with the new one (since the quiz is broad and re-orienting). Each{' '}
            <strong>daily dilemma response</strong> adds a small directional shift to wherever you
            already were. So the quiz draws the big picture; daily dilemmas refine it.
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
            Recent shifts
          </h2>
          <p style={{
            fontFamily: sans,
            fontSize: 13,
            color: '#8C6520',
            marginBottom: 18,
            letterSpacing: 0.3,
          }}>
            Every event that moved your position. Quiz attempts replace your absolute position; daily dilemmas add small directional shifts.
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {trajectoryNewestFirst.map(({ event, delta }) => {
              const shifts = topShifts(delta, 0.3, 3);
              const isQuiz = event.kind === 'quiz';
              const ts = isQuiz ? (event as Extract<EventEntry, { kind: 'quiz' }>).taken_at
                                  : (event as Extract<EventEntry, { kind: 'dilemma' }>).created_at;
              return (
                <li key={event.id} style={{
                  padding: '18px 20px',
                  marginBottom: 10,
                  background: '#FFFCF4',
                  border: '1px solid #EBE3CA',
                  borderLeft: `3px solid ${isQuiz ? '#B8862F' : '#3D7DA8'}`,
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
                      color: isQuiz ? '#8C6520' : '#1F4666',
                    }}>
                      {isQuiz ? 'Quiz attempt' : 'Daily dilemma'} · {fmtRel(ts)}
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
                  {isQuiz ? (
                    <div style={{
                      fontFamily: serif,
                      fontSize: 22,
                      fontWeight: 500,
                      color: '#221E18',
                      marginBottom: shifts.length ? 10 : 0,
                      letterSpacing: '-0.01em',
                    }}>
                      {(event as Extract<EventEntry, { kind: 'quiz' }>).flavor
                        ? `${(event as Extract<EventEntry, { kind: 'quiz' }>).flavor} ` : ''}
                      {(event as Extract<EventEntry, { kind: 'quiz' }>).archetype.replace(/^The /, '')}
                      <span style={{
                        fontFamily: sans,
                        fontSize: 13,
                        color: '#8C6520',
                        marginLeft: 10,
                        letterSpacing: 1,
                        fontWeight: 400,
                      }}>
                        {(event as Extract<EventEntry, { kind: 'quiz' }>).alignment_pct}%
                      </span>
                    </div>
                  ) : (
                    <>
                      <p style={{
                        fontFamily: serif,
                        fontStyle: 'italic',
                        fontSize: 17,
                        color: '#4A4338',
                        margin: '0 0 8px',
                      }}>
                        "{(event as Extract<EventEntry, { kind: 'dilemma' }>).question_text}"
                      </p>
                      {(event as Extract<EventEntry, { kind: 'dilemma' }>).analysis && (
                        <p style={{
                          fontFamily: serif,
                          fontSize: 15,
                          color: '#221E18',
                          margin: '0 0 10px',
                          lineHeight: 1.55,
                        }}>
                          {(event as Extract<EventEntry, { kind: 'dilemma' }>).analysis}
                        </p>
                      )}
                    </>
                  )}
                  {shifts.length > 0 ? (
                    <div style={{
                      display: 'flex',
                      gap: 14,
                      flexWrap: 'wrap',
                      marginTop: 4,
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
                    isQuiz && (
                      <div style={{
                        fontFamily: sans,
                        fontSize: 12,
                        color: '#8C6520',
                        fontStyle: 'italic',
                        opacity: 0.7,
                      }}>
                        First event — no shifts yet
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
