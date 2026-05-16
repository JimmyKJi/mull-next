// /classes/[id]/assignments/[assignmentId]
//
// Two-mode page:
//   - Teacher view: prompt + all submissions (one per student, with
//     who-submitted-vs-not), mark-reviewed buttons
//   - Student view: prompt + their own submission form (prefilled if
//     they've submitted before — UPSERT semantics)
//
// RLS does the gating: teachers see all submissions on assignments
// whose class they own; students see their own submission only.

import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import MullWordmark from '@/components/mull-wordmark';
import AssignmentSubmitForm from './assignment-submit-form';
import { scoreAuthenticity, authSummary, type AuthResult } from '@/lib/ai-authenticity';

export const metadata: Metadata = {
  title: 'Assignment · Mull',
  robots: { index: false, follow: false },
};

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";
const serif = "'Cormorant Garamond', Georgia, serif";

type Assignment = {
  id: string;
  class_id: string;
  kind: string;
  title: string;
  prompt: string;
  instructions: string | null;
  due_at: string | null;
  created_at: string;
};

type Cls = {
  id: string;
  name: string;
  teacher_user_id: string;
};

type Submission = {
  id: string;
  student_user_id: string;
  response_text: string;
  reviewed_at: string | null;
  submitted_at: string;
  updated_at: string;
};

type RosterEntry = {
  user_id: string;
  pseudonym: string | null;
};

export default async function AssignmentDetailPage({
  params,
}: {
  params: Promise<{ id: string; assignmentId: string }>;
}) {
  const { id: classId, assignmentId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/classes/${classId}/assignments/${assignmentId}`);

  const [aRes, clsRes] = await Promise.all([
    supabase
      .from('class_assignments')
      .select('id, class_id, kind, title, prompt, instructions, due_at, created_at')
      .eq('id', assignmentId)
      .maybeSingle<Assignment>(),
    supabase
      .from('classes')
      .select('id, name, teacher_user_id')
      .eq('id', classId)
      .maybeSingle<Cls>(),
  ]);

  const assignment = aRes.data;
  const cls = clsRes.data;
  if (!assignment || !cls) notFound();
  if (assignment.class_id !== cls.id) notFound();

  const isTeacher = cls.teacher_user_id === user.id;

  // Submissions: teacher sees all, student sees only theirs.
  const submissionsQ = supabase
    .from('class_assignment_submissions')
    .select('id, student_user_id, response_text, reviewed_at, submitted_at, updated_at')
    .eq('assignment_id', assignment.id);
  const { data: submissions } = isTeacher
    ? await submissionsQ.order('submitted_at', { ascending: false }).returns<Submission[]>()
    : await submissionsQ.eq('student_user_id', user.id).returns<Submission[]>();

  // For the teacher, also pull the class roster so we can show
  // "who hasn't submitted yet".
  let roster: RosterEntry[] = [];
  if (isTeacher) {
    const { data: rosterRows } = await supabase
      .from('class_members')
      .select('user_id, pseudonym')
      .eq('class_id', cls.id)
      .eq('role', 'student')
      .returns<RosterEntry[]>();
    roster = rosterRows ?? [];
  }

  const mySubmission = !isTeacher ? (submissions?.[0] ?? null) : null;

  const dueAtMs = assignment.due_at ? new Date(assignment.due_at).getTime() : null;
  const overdue = dueAtMs && dueAtMs < Date.now();

  return (
    <main className="mx-auto max-w-[760px] px-6 pb-32 pt-10 sm:px-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <MullWordmark />
        <Link href={`/classes/${cls.id}`} style={{
          fontFamily: pixel, fontSize: 11,
          color: '#4A4338', textDecoration: 'none',
          letterSpacing: 0.4, textTransform: 'uppercase',
        }}>
          ◂ {cls.name.toUpperCase()}
        </Link>
      </div>

      <div style={{
        fontFamily: pixel, fontSize: 12,
        color: '#8C6520', textTransform: 'uppercase',
        letterSpacing: '0.18em', marginBottom: 14,
      }}>
        ▸ {assignment.kind.replace('_', ' ').toUpperCase()}
        {assignment.due_at && (
          <span style={{ color: overdue ? '#7A2E2E' : '#8C6520', marginLeft: 8 }}>
            · DUE {new Date(assignment.due_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
          </span>
        )}
      </div>

      <h1 style={{
        fontFamily: serif,
        fontSize: 30,
        fontWeight: 500,
        margin: '0 0 18px',
        letterSpacing: '-0.3px',
        lineHeight: 1.2,
      }}>
        {assignment.title}
      </h1>

      <div style={{
        padding: '20px 24px',
        background: '#FFFCF4',
        border: '4px solid #221E18',
        boxShadow: '5px 5px 0 0 #B8862F',
        borderRadius: 0,
        marginBottom: 24,
      }}>
        <p style={{
          fontFamily: serif,
          fontStyle: 'italic',
          fontSize: 17,
          color: '#221E18',
          margin: 0,
          lineHeight: 1.6,
          whiteSpace: 'pre-wrap',
        }}>
          {assignment.prompt}
        </p>
        {assignment.instructions && (
          <div style={{
            marginTop: 16,
            paddingTop: 14,
            borderTop: '2px dashed #D6CDB6',
            fontFamily: 'Inter, sans-serif',
            fontSize: 14,
            color: '#4A4338',
            lineHeight: 1.55,
          }}>
            <div style={{
              fontFamily: pixel, fontSize: 10,
              color: '#8C6520', letterSpacing: 0.4,
              textTransform: 'uppercase', marginBottom: 6,
            }}>
              INSTRUCTIONS
            </div>
            {assignment.instructions}
          </div>
        )}
      </div>

      {/* Student view: response form. */}
      {!isTeacher && (
        <AssignmentSubmitForm
          classId={cls.id}
          assignmentId={assignment.id}
          existingText={mySubmission?.response_text ?? ''}
          existingSubmittedAt={mySubmission?.submitted_at ?? null}
        />
      )}

      {/* Teacher view: submissions list + who hasn't submitted. */}
      {isTeacher && (
        <TeacherSubmissionsView
          submissions={submissions ?? []}
          roster={roster}
        />
      )}
    </main>
  );
}

async function TeacherSubmissionsView({
  submissions,
  roster,
}: {
  submissions: Submission[];
  roster: RosterEntry[];
}) {
  const supabase = await createClient();
  // Resolve each submitter's display name.
  const submitterIds = submissions.map(s => s.student_user_id);
  const { data: profiles } = submitterIds.length > 0
    ? await supabase
        .from('public_profiles')
        .select('user_id, handle, display_name')
        .in('user_id', submitterIds)
        .returns<{ user_id: string; handle: string; display_name: string | null }[]>()
    : { data: [] as { user_id: string; handle: string; display_name: string | null }[] };

  const profileByUser = new Map(
    (profiles ?? []).map(p => [p.user_id, p]),
  );

  const submittedIds = new Set(submissions.map(s => s.student_user_id));
  const unsubmitted = roster.filter(r => !submittedIds.has(r.user_id));

  return (
    <>
      <section style={{ marginTop: 8, marginBottom: 32 }}>
        <h2 style={{
          fontFamily: pixel,
          fontSize: 14,
          color: '#221E18',
          textTransform: 'uppercase',
          letterSpacing: '0.18em',
          marginBottom: 16,
          textShadow: '2px 2px 0 #2F5D5C',
        }}>
          ▸ SUBMISSIONS ({submissions.length} / {roster.length})
        </h2>

        {submissions.length === 0 ? (
          <p style={{
            padding: '20px 18px',
            background: '#FFFCF4',
            border: '3px dashed #8C6520',
            borderRadius: 0,
            fontFamily: serif,
            fontStyle: 'italic',
            fontSize: 15,
            color: '#8C6520',
            margin: 0,
            textAlign: 'center',
          }}>
            No submissions yet.
          </p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12 }}>
            {submissions.map(s => {
              const profile = profileByUser.get(s.student_user_id);
              const rosterRow = roster.find(r => r.user_id === s.student_user_id);
              const studentLabel = rosterRow?.pseudonym
                ? rosterRow.pseudonym
                : (profile?.display_name || (profile ? `@${profile.handle}` : `Student · ${s.student_user_id.slice(0, 6)}`));
              // Heuristic AI-pattern score — computed on-the-fly,
              // no DB column, no API call. Surfaced as a signal,
              // not a verdict. See lib/ai-authenticity.ts header.
              const auth = scoreAuthenticity(s.response_text);
              return (
                <li key={s.id} style={{
                  padding: '14px 16px',
                  background: '#FFFCF4',
                  border: '3px solid #221E18',
                  boxShadow: `3px 3px 0 0 ${s.reviewed_at ? '#2F5D5C' : '#B8862F'}`,
                  borderRadius: 0,
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    gap: 12,
                    flexWrap: 'wrap',
                    marginBottom: 8,
                  }}>
                    <span style={{
                      fontFamily: serif,
                      fontSize: 17,
                      fontWeight: 500,
                      color: '#221E18',
                    }}>
                      {studentLabel}
                    </span>
                    <span style={{
                      fontFamily: pixel,
                      fontSize: 10,
                      color: '#8C6520',
                      letterSpacing: 0.4,
                      textTransform: 'uppercase',
                    }}>
                      SUBMITTED {new Date(s.submitted_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                      {s.reviewed_at && <> · ✓ REVIEWED</>}
                    </span>
                  </div>
                  <AuthBadge auth={auth} />
                  <p style={{
                    fontFamily: serif,
                    fontSize: 15.5,
                    color: '#221E18',
                    margin: 0,
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                  }}>
                    {s.response_text}
                  </p>
                </li>
              );
            })}
          </ul>
        )}

        {unsubmitted.length > 0 && (
          <details style={{ marginTop: 20 }}>
            <summary style={{
              cursor: 'pointer',
              fontFamily: pixel,
              fontSize: 11,
              color: '#7A2E2E',
              letterSpacing: 0.4,
              textTransform: 'uppercase',
            }}>
              ▸ {unsubmitted.length} STUDENT{unsubmitted.length === 1 ? '' : 'S'} HAVEN&apos;T SUBMITTED
            </summary>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: '12px 0 0',
              display: 'grid',
              gap: 6,
            }}>
              {unsubmitted.map(r => (
                <li key={r.user_id} style={{
                  padding: '6px 10px',
                  background: '#F5E0E0',
                  border: '2px solid #7A2E2E',
                  fontFamily: serif,
                  fontSize: 14,
                  color: '#4D1818',
                }}>
                  {r.pseudonym || <em>Student · {r.user_id.slice(0, 6)}</em>}
                </li>
              ))}
            </ul>
          </details>
        )}
      </section>
    </>
  );
}

// ─── AuthBadge ───────────────────────────────────────────────────────
//
// Heuristic AI-pattern indicator. NOT a verdict — just surfaces what
// the scorer noticed. Always paired with a tooltip-equivalent
// <details> drilling into the specific flags, so teachers don't have
// to take the score on faith.

function AuthBadge({ auth }: { auth: AuthResult }) {
  const palette = {
    high:   { fg: '#7A2E2E', bg: '#F5E0E0', border: '#7A2E2E', icon: '!' },
    medium: { fg: '#8C6520', bg: '#F8EDC8', border: '#B8862F', icon: '·' },
    low:    { fg: '#2F5D5C', bg: '#E5F0EE', border: '#2F5D5C', icon: '✓' },
  }[auth.bucket];
  return (
    <details style={{ marginBottom: 10 }}>
      <summary style={{
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '4px 10px',
        background: palette.bg,
        border: `2px solid ${palette.border}`,
        fontFamily: pixel,
        fontSize: 10,
        color: palette.fg,
        letterSpacing: 0.4,
        textTransform: 'uppercase',
      }}>
        <span aria-hidden style={{ fontWeight: 700 }}>{palette.icon}</span>
        <span>AI-PATTERN SCAN · {authSummary(auth)}</span>
      </summary>
      <div style={{
        marginTop: 8,
        padding: '10px 12px',
        background: '#FFFCF4',
        border: '2px solid #D6CDB6',
        fontFamily: serif,
        fontSize: 13,
        color: '#4A4338',
        lineHeight: 1.5,
      }}>
        <p style={{ margin: '0 0 8px', fontStyle: 'italic' }}>
          This is a heuristic signal, not a verdict. False positives
          happen, especially for students with a formal register or
          non-native English speakers writing carefully.
        </p>
        {auth.flags.length === 0 ? (
          <p style={{ margin: 0 }}>No patterns flagged.</p>
        ) : (
          <ul style={{
            margin: 0,
            paddingLeft: 16,
            display: 'grid',
            gap: 6,
          }}>
            {auth.flags.map(f => (
              <li key={f.kind} style={{ margin: 0 }}>
                <strong style={{ fontWeight: 600 }}>{f.label}</strong>
                {f.evidence.length > 0 && (
                  <div style={{
                    marginTop: 4,
                    fontSize: 12,
                    color: '#8C6520',
                    fontStyle: 'italic',
                  }}>
                    {f.evidence.slice(0, 2).map((e, i) => (
                      <div key={i}>{e}</div>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </details>
  );
}
