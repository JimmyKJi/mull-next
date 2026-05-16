// POST /api/classes/join
//
// Body: { code: "ABC123" }
// Returns: { ok, class_id, class_name, already_member }
//
// Calls the class_join_by_code RPC which does the validation +
// insert atomically (SECURITY DEFINER so a missing INSERT policy
// on class_members doesn't matter). Auth-required.

import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const runtime = 'nodejs';

type JoinBody = { code?: unknown };

export async function POST(req: Request) {
  let body: JoinBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
  }

  const code = typeof body.code === 'string' ? body.code.trim().toUpperCase() : '';
  if (!code || code.length < 4 || code.length > 12) {
    return NextResponse.json({ error: 'Invite code required.' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sign in to join a class.' }, { status: 401 });

  const { data, error } = await supabase.rpc('class_join_by_code', { p_code: code });
  if (error) {
    if (error.code === 'P0002' || error.message?.includes('Invalid invite')) {
      return NextResponse.json({ error: 'Invite code not found or class archived.' }, { status: 404 });
    }
    console.error('[classes/join] rpc failed', error);
    return NextResponse.json({ error: 'Could not join class.' }, { status: 500 });
  }

  // RPC returns an array of one row.
  const row = data?.[0];
  if (!row) {
    return NextResponse.json({ error: 'Could not join class.' }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    class_id: row.class_id,
    class_name: row.class_name,
    already_member: row.already_member,
  });
}
