// POST /api/challenge/create
//
// Mints a short shareable code for a friend-challenge invite. The
// inviter shares https://mull.world/challenge/<code> ; when their
// friend hits the URL, the redirect route bumps view_count and
// sends them into the quiz with ?challenger=<code>.
//
// Auth: signed-in users only (we need the inviter_id).
// Idempotency: the route always mints a fresh code. Calling it
// repeatedly creates multiple invite links (which is fine — they
// might want to track invites separately per friend).
//
// Required SQL: 20260516_friend_challenges.sql

import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const runtime = 'nodejs';

// Generate a short shareable code. base36 = digits + lowercase, no
// ambiguous chars stripped (8 chars is ~2.8e12 keyspace, plenty).
function mintCode(): string {
  // crypto.randomUUID is available everywhere we run. Slice + convert.
  const buf = crypto.getRandomValues(new Uint8Array(6));
  return Array.from(buf, b => b.toString(36).padStart(2, '0')).join('').slice(0, 8);
}

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  // Retry up to 3x on UNIQUE collision (vanishingly rare at 2.8e12
  // keyspace, but cheap to handle correctly).
  let code = '';
  for (let i = 0; i < 3; i++) {
    code = mintCode();
    const { error } = await supabase
      .from('friend_challenges')
      .insert({ code, inviter_id: user.id });
    if (!error) {
      return NextResponse.json({
        ok: true,
        code,
        url: `/challenge/${code}`,
      });
    }
    if (error.code !== '23505') {
      // Not a unique-violation — real error, bail.
      console.error('[challenge/create] insert failed', error);
      return NextResponse.json({ error: 'Could not create invite.' }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Could not mint code; try again.' }, { status: 500 });
}
