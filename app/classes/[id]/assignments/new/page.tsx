// /classes/[id]/assignments/new — teacher creates an assignment.
//
// Server shell + AssignmentCreateForm client component. POSTs to
// /api/classes/[id]/assignments/create and redirects to the
// assignment detail page on success.

import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import MullWordmark from '@/components/mull-wordmark';
import AssignmentCreateForm from './assignment-create-form';

export const metadata: Metadata = {
  title: 'New assignment · Mull',
  robots: { index: false, follow: false },
};

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";
const serif = "'Cormorant Garamond', Georgia, serif";

export default async function NewAssignmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: classId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/classes/${classId}/assignments/new`);

  // Confirm the teacher owns this class.
  const { data: cls } = await supabase
    .from('classes')
    .select('id, name, teacher_user_id')
    .eq('id', classId)
    .maybeSingle<{ id: string; name: string; teacher_user_id: string }>();

  if (!cls) notFound();
  if (cls.teacher_user_id !== user.id) {
    // Students who somehow land here get sent back to the class detail.
    redirect(`/classes/${classId}`);
  }

  return (
    <main className="mx-auto max-w-[640px] px-6 pb-32 pt-10 sm:px-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <MullWordmark />
        <Link href={`/classes/${classId}`} style={{
          fontFamily: pixel,
          fontSize: 11,
          color: '#4A4338',
          textDecoration: 'none',
          letterSpacing: 0.4,
          textTransform: 'uppercase',
        }}>
          ◂ BACK TO CLASS
        </Link>
      </div>

      <div style={{
        fontFamily: pixel,
        fontSize: 12,
        color: '#8C6520',
        textTransform: 'uppercase',
        letterSpacing: '0.18em',
        marginBottom: 14,
      }}>
        ▸ NEW ASSIGNMENT · {cls.name.toUpperCase()}
      </div>
      <h1 style={{
        fontFamily: pixel,
        fontSize: 26,
        margin: '0 0 14px',
        color: '#221E18',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        textShadow: '3px 3px 0 #B8862F',
        lineHeight: 1.1,
      }}>
        POST A PROMPT
      </h1>
      <p style={{
        fontFamily: serif,
        fontStyle: 'italic',
        fontSize: 16,
        color: '#4A4338',
        margin: '0 0 28px',
        lineHeight: 1.55,
      }}>
        Pick what kind of response you want, write the prompt, and
        optionally set a due date. Students see it on their next visit
        to the class page.
      </p>

      <AssignmentCreateForm classId={classId} />
    </main>
  );
}
