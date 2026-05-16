// POST /api/classes/create
//
// Teacher creates a class. Body: { name, description?, term?, school_name? }
// Returns: { id, invite_code, url }
//
// Mints a unique 6-char invite code (base36-upper) and inserts the
// classes row. Teacher becomes the implicit member via classes.teacher_user_id;
// no class_members row is created for the teacher (they appear in
// the roster UI as "instructor" regardless).

import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const runtime = 'nodejs';

// 6-char base36 code uppercase, with ambiguous chars (0/O, 1/I, etc.)
// kept simple — readability matters more than max entropy. ~2.2bn
// keyspace, plenty.
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function mintCode(): string {
  const buf = crypto.getRandomValues(new Uint8Array(6));
  return Array.from(buf, b => CODE_ALPHABET[b % CODE_ALPHABET.length]).join('');
}

type CreateBody = {
  name?: unknown;
  description?: unknown;
  term?: unknown;
  school_name?: unknown;
};

export async function POST(req: Request) {
  let body: CreateBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (!name || name.length > 120) {
    return NextResponse.json({ error: 'Class name required (1–120 chars).' }, { status: 400 });
  }

  const description = typeof body.description === 'string' ? body.description.trim() || null : null;
  const term        = typeof body.term === 'string'        ? body.term.trim() || null        : null;
  const schoolName  = typeof body.school_name === 'string' ? body.school_name.trim() || null : null;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sign in to create a class.' }, { status: 401 });

  // Retry on UNIQUE collision (extremely rare at 2.2e9 keyspace).
  for (let i = 0; i < 5; i++) {
    const code = mintCode();
    const { data, error } = await supabase
      .from('classes')
      .insert({
        teacher_user_id: user.id,
        name,
        invite_code: code,
        description,
        term,
        school_name: schoolName,
      })
      .select('id, invite_code')
      .single();

    if (!error && data) {
      return NextResponse.json({
        ok: true,
        id: data.id,
        invite_code: data.invite_code,
        url: `/join/${data.invite_code}`,
      });
    }
    if (error?.code !== '23505') {
      console.error('[classes/create] insert failed', error);
      return NextResponse.json({ error: 'Could not create class.' }, { status: 500 });
    }
  }
  return NextResponse.json({ error: 'Could not mint code; try again.' }, { status: 500 });
}
