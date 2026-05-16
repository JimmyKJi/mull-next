// POST /api/classes/[id]/assignments/[assignmentId]/submit
//
// Student submits a response. UPSERT-style — a second submission
// overwrites the first, so students can edit until the teacher
// reviews. The unique (assignment_id, student_user_id) constraint
// + onConflict ensures one row per (assignment, student).
//
// Body: { response_text }

import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const runtime = 'nodejs';

type SubmitBody = { response_text?: unknown };

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string; assignmentId: string }> },
) {
  const { assignmentId } = await params;
  if (!assignmentId) return NextResponse.json({ error: 'Missing assignment id.' }, { status: 400 });

  let body: SubmitBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
  }
  const text = typeof body.response_text === 'string' ? body.response_text.trim() : '';
  if (!text || text.length > 8000) {
    return NextResponse.json({ error: 'Response required (1–8000 chars).' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sign in.' }, { status: 401 });

  const { error } = await supabase
    .from('class_assignment_submissions')
    .upsert(
      {
        assignment_id: assignmentId,
        student_user_id: user.id,
        response_text: text,
        reviewed_at: null, // re-submit clears review state
      },
      { onConflict: 'assignment_id,student_user_id' },
    );

  if (error) {
    if (error.code === '42501') {
      return NextResponse.json({ error: 'Not a member of this class.' }, { status: 403 });
    }
    console.error('[assignments/submit] upsert failed', error);
    return NextResponse.json({ error: 'Could not save response.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
