// POST /api/challenge/accept
//
// Bumps friend_challenges.accept_count for the given code. Fired
// fire-and-forget from /result when the user arrived via a challenge
// link, so the inviter's account telemetry reflects that their link
// worked.
//
// Auth: signed-in. Anonymous users can't be deduped (they could
// fire this 100 times in a loop) so we just no-op for them.

import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  let body: { code?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
  }
  const code = (body.code || '').trim();
  if (!code) return NextResponse.json({ error: 'Missing code.' }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    // Anonymous can't be deduped. Skip silently.
    return NextResponse.json({ ok: true, skipped: 'not signed in' });
  }

  // Fire the SECURITY DEFINER bump.
  const { error } = await supabase.rpc('friend_challenge_increment_accept', {
    p_code: code,
  });
  if (error) {
    console.error('[challenge/accept] rpc failed', error);
    return NextResponse.json({ error: 'Could not record accept.' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
