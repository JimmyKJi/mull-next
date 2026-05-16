// /classes/[id] — class detail.
//
// Renders two views based on whether the viewer is the teacher or a
// student in the class:
//   - Teacher view: roster (with display names), invite-link copy,
//     "soon: assignments" placeholder, archive button
//   - Student view: classmates list (anonymized as count when a
//     pseudonym is set), instructor name, leave-class link
//
// Anyone outside the class hits notFound — RLS already blocks the
// queries, we just translate that to a 404.

import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import MullWordmark from '@/components/mull-wordmark';
import ClassInviteShare from './class-invite-share';
import ClassLeaveButton from './class-leave-button';

export const metadata: Metadata = {
  title: 'Class · Mull',
  robots: { index: false, follow: false },
};

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";
const serif = "'Cormorant Garamond', Georgia, serif";

type ClassRow = {
  id: string;
  teacher_user_id: string;
  name: string;
  invite_code: string;
  description: string | null;
  term: string | null;
  school_name: string | null;
  is_archived: boolean;
  created_at: string;
};

type MemberRow = {
  user_id: string;
  role: string;
  pseudonym: string | null;
  joined_at: string;
};

export default async function ClassDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/classes/${id}`);

  const { data: cls } = await supabase
    .from('classes')
    .select('id, teacher_user_id, name, invite_code, description, term, school_name, is_archived, created_at')
    .eq('id', id)
    .maybeSingle<ClassRow>();

  if (!cls) notFound();

  const isTeacher = cls.teacher_user_id === user.id;

  // Roster — RLS lets members see other members. For students this
  // returns themselves + classmates; for the teacher it returns the
  // full student list (teacher is implicit via classes.teacher_user_id,
  // not in class_members).
  const { data: roster } = await supabase
    .from('class_members')
    .select('user_id, role, pseudonym, joined_at')
    .eq('class_id', cls.id)
    .order('joined_at', { ascending: true })
    .returns<MemberRow[]>();

  const studentCount = (roster ?? []).filter(r => r.role === 'student').length;

  return (
    <main className="mx-auto max-w-[820px] px-6 pb-32 pt-10 sm:px-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <MullWordmark />
        <Link href="/classes" style={{
          fontFamily: pixel, fontSize: 11,
          color: '#4A4338', textDecoration: 'none',
          letterSpacing: 0.4, textTransform: 'uppercase',
        }}>
          ◂ ALL CLASSES
        </Link>
      </div>

      <div style={{
        fontFamily: pixel, fontSize: 12,
        color: '#8C6520', textTransform: 'uppercase',
        letterSpacing: '0.18em', marginBottom: 14,
      }}>
        ▸ {isTeacher ? 'TEACHING' : 'ENROLLED IN'}
        {cls.is_archived && ' · ARCHIVED'}
      </div>

      <h1 style={{
        fontFamily: pixel,
        fontSize: 28,
        margin: '0 0 14px',
        color: '#221E18',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        textShadow: '3px 3px 0 #B8862F',
        lineHeight: 1.1,
      }}>
        {cls.name}
      </h1>

      {(cls.term || cls.school_name) && (
        <p style={{
          fontFamily: serif,
          fontStyle: 'italic',
          fontSize: 16,
          color: '#8C6520',
          margin: '0 0 12px',
        }}>
          {[cls.term, cls.school_name].filter(Boolean).join(' · ')}
        </p>
      )}

      {cls.description && (
        <p style={{
          fontFamily: serif,
          fontSize: 16.5,
          color: '#221E18',
          margin: '0 0 28px',
          lineHeight: 1.6,
        }}>
          {cls.description}
        </p>
      )}

      {/* Invite link share — teacher only. */}
      {isTeacher && (
        <ClassInviteShare
          inviteCode={cls.invite_code}
          studentCount={studentCount}
        />
      )}

      {/* Roster section — both views. Teacher sees full list; student
          sees classmates count + their own row. */}
      <section style={{ marginTop: 36 }}>
        <h2 style={{
          fontFamily: pixel,
          fontSize: 14,
          color: '#221E18',
          textTransform: 'uppercase',
          letterSpacing: '0.18em',
          marginBottom: 16,
          textShadow: '2px 2px 0 #B8862F',
        }}>
          ▸ ROSTER ({studentCount} {studentCount === 1 ? 'STUDENT' : 'STUDENTS'})
        </h2>
        {studentCount === 0 ? (
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
            No students yet. Share the invite link above and they&rsquo;ll appear here.
          </p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
            {(roster ?? []).filter(r => r.role === 'student').map(r => (
              <li key={r.user_id} style={{
                padding: '10px 14px',
                background: '#FFFCF4',
                border: '2px solid #221E18',
                borderRadius: 0,
                fontFamily: serif,
                fontSize: 15,
                color: '#221E18',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                gap: 12,
              }}>
                <span>
                  {r.pseudonym
                    ? <em style={{ color: '#8C6520' }}>{r.pseudonym}</em>
                    : isTeacher
                      ? <RosterUserCell userId={r.user_id} />
                      : (r.user_id === user.id ? 'You' : 'A classmate')}
                </span>
                <span style={{
                  fontFamily: pixel,
                  fontSize: 10,
                  color: '#8C6520',
                  letterSpacing: 0.4,
                  textTransform: 'uppercase',
                }}>
                  JOINED {new Date(r.joined_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Assignments placeholder — wired up in 20260518 / P2.5. */}
      <section style={{ marginTop: 40 }}>
        <h2 style={{
          fontFamily: pixel,
          fontSize: 14,
          color: '#221E18',
          textTransform: 'uppercase',
          letterSpacing: '0.18em',
          marginBottom: 14,
          textShadow: '2px 2px 0 #2F5D5C',
        }}>
          ▸ ASSIGNMENTS
        </h2>
        <p style={{
          fontFamily: serif,
          fontStyle: 'italic',
          fontSize: 15,
          color: '#8C6520',
          padding: '18px 20px',
          background: '#FFFCF4',
          border: '3px dashed #2F5D5C',
          borderRadius: 0,
          margin: 0,
        }}>
          Assignment system lands in the next slice — teachers will pick a
          dilemma or exercise, set a due date, and see a roster grid of who
          submitted what.
        </p>
      </section>

      {/* Footer actions */}
      <nav
        aria-label="Class actions"
        style={{
          marginTop: 48,
          paddingTop: 24,
          borderTop: '2px dashed #D6CDB6',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          justifyContent: 'center',
        }}
      >
        {!isTeacher && (
          <ClassLeaveButton classId={cls.id} className={cls.name} />
        )}
      </nav>
    </main>
  );
}

// Tiny server helper — fetch the user's public profile to render
// their name if they have one, otherwise show "Student #N" with a
// short truncated user id for the teacher's visibility. Defined in
// the page so it can reach back into Supabase without a round-trip.
async function RosterUserCell({ userId }: { userId: string }) {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('public_profiles')
    .select('handle, display_name')
    .eq('user_id', userId)
    .maybeSingle<{ handle: string; display_name: string | null }>();
  if (profile) {
    return (
      <>
        {profile.display_name || `@${profile.handle}`}
        <span style={{ color: '#8C6520', fontStyle: 'italic' }}> · @{profile.handle}</span>
      </>
    );
  }
  // No public profile — show short ID. Teacher gets visibility
  // without leaking PII.
  return <em style={{ color: '#8C6520' }}>Student · {userId.slice(0, 6)}</em>;
}
