// /r/<code> — friend referral landing.
//
// When a user clicks a friend's invite link, we:
//   1. Look up the code in referral_codes to confirm it's valid.
//   2. Set a `mull_ref` cookie holding the referrer's user_id for
//      30 days (HttpOnly so JS can't read or mutate it).
//   3. 302-redirect to /  (the homepage / quiz start).
//
// On signup or first /account visit, /api/referral/save reads the
// cookie, writes the referrals row, and clears it. The user
// experiences a normal landing — they don't even know the cookie
// exists.
//
// If the code is invalid, we still redirect to / silently — better
// to drop the user into the homepage than show "your friend's link
// was bad" (which is mostly noise; bad codes happen from typos in
// shared messages).

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

const COOKIE_NAME = 'mull_ref';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;

  // Build a fresh anon client — we don't need cookies on this route
  // because referral_codes has a public-read RLS policy.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let referrerId: string | null = null;
  if (url && anon && code && /^[a-z0-9-]{4,24}$/i.test(code)) {
    try {
      const sb = createClient(url, anon);
      const { data } = await sb
        .from('referral_codes')
        .select('user_id')
        .eq('code', code)
        .maybeSingle();
      if (data && typeof data.user_id === 'string') {
        referrerId = data.user_id;
      }
    } catch {
      // Silently fall through — bad code, network blip, anything.
    }
  }

  // Always redirect to root so the click is invisible to the user.
  const res = NextResponse.redirect(new URL('/', _req.url), 302);
  if (referrerId) {
    res.cookies.set({
      name: COOKIE_NAME,
      value: referrerId,
      maxAge: COOKIE_MAX_AGE,
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
    });
  }
  return res;
}
