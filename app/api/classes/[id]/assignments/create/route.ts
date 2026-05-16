// POST /api/classes/[id]/assignments/create
//
// Teacher creates an assignment on a class they own. RLS on the
// underlying insert enforces "must own the class" — we don't need
// an extra check here.
//
// Body: { kind, title, prompt, instructions?, source_ref?, due_at? }

import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const runtime = 'nodejs';

const VALID_KINDS = new Set(['dilemma', 'exercise', 'diary_prompt']);

type CreateBody = {
  kind?: unknown;
  title?: unknown;
  prompt?: unknown;
  instructions?: unknown;
  source_ref?: unknown;
  due_at?: unknown;
};

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: classId } = await params;
  if (!classId) return NextResponse.json({ error: 'Missing class id.' }, { status: 400 });

  let body: CreateBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
  }

  const kind = typeof body.kind === 'string' ? body.kind : '';
  if (!VALID_KINDS.has(kind)) {
    return NextResponse.json({ error: 'Invalid kind.' }, { status: 400 });
  }
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  if (!title || title.length > 200) {
    return NextResponse.json({ error: 'Title required (1–200 chars).' }, { status: 400 });
  }
  const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
  if (!prompt || prompt.length > 4000) {
    return NextResponse.json({ error: 'Prompt required (1–4000 chars).' }, { status: 400 });
  }
  const instructions = typeof body.instructions === 'string' ? body.instructions.trim() || null : null;
  const sourceRef = typeof body.source_ref === 'string' ? body.source_ref.trim() || null : null;

  // due_at: accept ISO string or null. Validate it parses.
  let dueAt: string | null = null;
  if (typeof body.due_at === 'string' && body.due_at.trim()) {
    const t = Date.parse(body.due_at);
    if (Number.isFinite(t)) dueAt = new Date(t).toISOString();
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sign in.' }, { status: 401 });

  const { data, error } = await supabase
    .from('class_assignments')
    .insert({
      class_id: classId,
      created_by: user.id,
      kind,
      title,
      prompt,
      instructions,
      source_ref: sourceRef,
      due_at: dueAt,
    })
    .select('id')
    .single();

  if (error) {
    if (error.code === '42501') {
      // Row violates RLS — the user isn't the teacher of this class.
      return NextResponse.json({ error: 'Not authorized for this class.' }, { status: 403 });
    }
    console.error('[assignments/create] insert failed', error);
    return NextResponse.json({ error: 'Could not create assignment.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: data.id });
}
