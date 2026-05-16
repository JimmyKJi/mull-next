// /classes — index of "your classes".
//
// Shows two stacks:
//   1. Classes the user teaches (newest first)
//   2. Classes the user is a student in
// Plus a "Create a class" + "Join a class" CTA pair.
//
// Authed-only — redirects to login otherwise. The /classes/new
// create page is gated similarly.

import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import MullWordmark from '@/components/mull-wordmark';

export const metadata: Metadata = {
  title: 'Your classes · Mull',
  robots: { index: false, follow: false },
};

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";
const serif = "'Cormorant Garamond', Georgia, serif";

type TaughtClass = {
  id: string;
  name: string;
  invite_code: string;
  description: string | null;
  term: string | null;
  school_name: string | null;
  is_archived: boolean;
  created_at: string;
};

type StudentClass = {
  class_id: string;
  joined_at: string;
  classes: {
    id: string;
    name: string;
    term: string | null;
    school_name: string | null;
    is_archived: boolean;
    teacher_user_id: string;
  } | null;
};

export default async function ClassesIndexPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/classes');

  const [taughtRes, memberRes] = await Promise.all([
    supabase
      .from('classes')
      .select('id, name, invite_code, description, term, school_name, is_archived, created_at')
      .eq('teacher_user_id', user.id)
      .order('created_at', { ascending: false })
      .returns<TaughtClass[]>(),
    supabase
      .from('class_members')
      .select('class_id, joined_at, classes ( id, name, term, school_name, is_archived, teacher_user_id )')
      .eq('user_id', user.id)
      .order('joined_at', { ascending: false })
      .returns<StudentClass[]>(),
  ]);

  const taught = (taughtRes.data ?? []).filter(c => !c.is_archived);
  const studentMemberships = (memberRes.data ?? [])
    .filter(m => m.classes && !m.classes.is_archived);

  const hasAny = taught.length + studentMemberships.length > 0;

  return (
    <main className="mx-auto max-w-[820px] px-6 pb-32 pt-10 sm:px-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <MullWordmark />
        <Link
          href="/account"
          style={{
            fontFamily: pixel,
            fontSize: 11,
            color: '#4A4338',
            textDecoration: 'none',
            letterSpacing: 0.4,
            textTransform: 'uppercase',
          }}
        >
          ◂ ACCOUNT
        </Link>
      </div>

      <div style={{
        fontFamily: pixel, fontSize: 12,
        color: '#8C6520', textTransform: 'uppercase',
        letterSpacing: '0.18em', marginBottom: 14,
      }}>
        ▸ CLASSROOM
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
        YOUR CLASSES
      </h1>

      <p style={{
        fontFamily: serif,
        fontStyle: 'italic',
        fontSize: 17,
        color: '#4A4338',
        margin: '0 0 28px',
        lineHeight: 1.55,
      }}>
        Classes you teach, plus classes you&rsquo;re a student in. Create one to
        invite a roster — students join with the 6-character code.
      </p>

      <div className="flex flex-wrap gap-3 mb-10">
        <Link
          href="/classes/new"
          className="pixel-press"
          style={{
            display: 'inline-block',
            padding: '12px 22px',
            background: '#B8862F',
            color: '#1A1612',
            border: '4px solid #221E18',
            boxShadow: '4px 4px 0 0 #221E18',
            borderRadius: 0,
            fontFamily: pixel,
            fontSize: 12,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            textDecoration: 'none',
            transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end)',
          }}
        >
          ▸ CREATE A CLASS
        </Link>
        <Link
          href="/join"
          className="pixel-press"
          style={{
            display: 'inline-block',
            padding: '12px 22px',
            background: '#FFFCF4',
            color: '#2F5D5C',
            border: '4px solid #221E18',
            boxShadow: '4px 4px 0 0 #2F5D5C',
            borderRadius: 0,
            fontFamily: pixel,
            fontSize: 12,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            textDecoration: 'none',
            transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end)',
          }}
        >
          ▸ JOIN WITH A CODE
        </Link>
      </div>

      {taught.length > 0 && (
        <section style={{ marginBottom: 36 }}>
          <h2 style={{
            fontFamily: pixel,
            fontSize: 14,
            color: '#221E18',
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            marginBottom: 16,
            textShadow: '2px 2px 0 #B8862F',
          }}>
            ▸ TEACHING ({taught.length})
          </h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 14 }}>
            {taught.map(c => <TeacherClassCard key={c.id} c={c} />)}
          </ul>
        </section>
      )}

      {studentMemberships.length > 0 && (
        <section style={{ marginBottom: 36 }}>
          <h2 style={{
            fontFamily: pixel,
            fontSize: 14,
            color: '#221E18',
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            marginBottom: 16,
            textShadow: '2px 2px 0 #2F5D5C',
          }}>
            ▸ ENROLLED ({studentMemberships.length})
          </h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 14 }}>
            {studentMemberships.map(m => m.classes && (
              <StudentClassCard key={m.class_id} c={m.classes} joinedAt={m.joined_at} />
            ))}
          </ul>
        </section>
      )}

      {!hasAny && (
        <div style={{
          padding: '32px 28px',
          background: '#FFFCF4',
          border: '3px dashed #8C6520',
          borderRadius: 0,
          textAlign: 'center',
        }}>
          <p style={{
            fontFamily: serif,
            fontStyle: 'italic',
            fontSize: 17,
            color: '#4A4338',
            margin: 0,
            lineHeight: 1.55,
          }}>
            No classes yet. Create one to teach with Mull, or join an
            existing class with a 6-character code from your instructor.
          </p>
        </div>
      )}
    </main>
  );
}

function TeacherClassCard({ c }: { c: TaughtClass }) {
  return (
    <li>
      <Link
        href={`/classes/${c.id}`}
        className="pixel-press"
        style={{
          display: 'block',
          padding: '16px 18px',
          background: '#FFFCF4',
          border: '4px solid #221E18',
          boxShadow: '4px 4px 0 0 #B8862F',
          borderRadius: 0,
          textDecoration: 'none',
          color: 'inherit',
          transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline', flexWrap: 'wrap', marginBottom: 6 }}>
          <span style={{
            fontFamily: serif,
            fontSize: 20,
            fontWeight: 500,
            color: '#221E18',
          }}>
            {c.name}
          </span>
          <span style={{
            fontFamily: pixel,
            fontSize: 11,
            color: '#8C6520',
            letterSpacing: 0.4,
            textTransform: 'uppercase',
          }}>
            CODE · {c.invite_code}
          </span>
        </div>
        {(c.term || c.school_name) && (
          <div style={{
            fontFamily: serif,
            fontStyle: 'italic',
            fontSize: 14,
            color: '#8C6520',
            marginBottom: c.description ? 6 : 0,
          }}>
            {[c.term, c.school_name].filter(Boolean).join(' · ')}
          </div>
        )}
        {c.description && (
          <p style={{ fontFamily: serif, fontSize: 14.5, color: '#4A4338', margin: 0, lineHeight: 1.5 }}>
            {c.description}
          </p>
        )}
      </Link>
    </li>
  );
}

function StudentClassCard({ c, joinedAt }: { c: NonNullable<StudentClass['classes']>; joinedAt: string }) {
  return (
    <li>
      <Link
        href={`/classes/${c.id}`}
        className="pixel-press"
        style={{
          display: 'block',
          padding: '16px 18px',
          background: '#FFFCF4',
          border: '4px solid #221E18',
          boxShadow: '4px 4px 0 0 #2F5D5C',
          borderRadius: 0,
          textDecoration: 'none',
          color: 'inherit',
          transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline', flexWrap: 'wrap', marginBottom: 6 }}>
          <span style={{
            fontFamily: serif,
            fontSize: 20,
            fontWeight: 500,
            color: '#221E18',
          }}>
            {c.name}
          </span>
          <span style={{
            fontFamily: pixel,
            fontSize: 10,
            color: '#8C6520',
            letterSpacing: 0.4,
            textTransform: 'uppercase',
          }}>
            JOINED {new Date(joinedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>
        {(c.term || c.school_name) && (
          <div style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 14, color: '#8C6520' }}>
            {[c.term, c.school_name].filter(Boolean).join(' · ')}
          </div>
        )}
      </Link>
    </li>
  );
}
