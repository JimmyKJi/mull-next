// POST /api/referral/save
//
// Idempotent. Called from a small client component on /account on
// first visit. If the visitor has a `mull_ref` cookie:
//   1. Insert a referrals row mapping them → referrer.
//   2. Clear the cookie so we don't double-attribute.
// If the cookie is missing or the user already has a referral row,
// no-op.
//
// Also ensures the user has their OWN referral_code generated, so
// /account can show their invite link without a separate fetch.
//
// The /r/<code> route only sets the cookie; this endpoint does the
// actual write so we have an authenticated user to bind to.

import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const runtime = 'nodejs';

const COOKIE_NAME = 'mull_ref';

// Generate a short, URL-safe referral code from the user's UUID.
// First 8 hex chars of the UUID (no dashes). Collision risk for
// 50–500 users is negligible; the UNIQUE constraint catches it
// regardless and we'd reroll on the rare hit.
function codeFromUserId(uid: string): string {
  return uid.replace(/-/g, '').slice(0, 8).toLowerCase();
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  // 1. Ensure user has their own referral code. Race-safe: ON
  //    CONFLICT DO NOTHING by way of the UNIQUE constraint — if
  //    another tab raced us, the second insert errors and we ignore.
  let myCode: string | null = null;
  const { data: existingCode } = await supabase
    .from('referral_codes')
    .select('code')
    .eq('user_id', user.id)
    .maybeSingle();
  if (existingCode?.code) {
    myCode = existingCode.code;
  } else {
    let code = codeFromUserId(user.id);
    // Up to 3 attempts in case of UUID-prefix collision (unlikely).
    for (let i = 0; i < 3 && !myCode; i++) {
      const tryCode = i === 0 ? code : code + '-' + Math.random().toString(36).slice(2, 5);
      const { error: insertErr } = await supabase
        .from('referral_codes')
        .insert({ user_id: user.id, code: tryCode });
      if (!insertErr) myCode = tryCode;
      else if (insertErr.code !== '23505') break; // not a unique violation
    }
  }

  // 2. If the cookie is present and we don't already have a
  //    referrals row, attribute the signup. We pull the cookie
  //    via the request headers (the server client doesn't expose
  //    cookies directly).
  let referrerId: string | null = null;
  const cookieHeader = req.headers.get('cookie') || '';
  const m = cookieHeader.match(/(?:^|;\s*)mull_ref=([^;]+)/);
  if (m) referrerId = decodeURIComponent(m[1]);

  let referralAttempted = false;
  let referralAttributed = false;
  if (referrerId && referrerId !== user.id) {
    referralAttempted = true;
    const { data: alreadyReferred } = await supabase
      .from('referrals')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle();
    if (!alreadyReferred) {
      // Look up the referrer's code (so we can store it for analytics).
      const { data: refRow } = await supabase
        .from('referral_codes')
        .select('code')
        .eq('user_id', referrerId)
        .maybeSingle();
      const { error: refInsertErr } = await supabase
        .from('referrals')
        .insert({
          user_id: user.id,
          referrer_user_id: referrerId,
          referrer_code: refRow?.code ?? null,
        });
      if (!refInsertErr) referralAttributed = true;
    }
  }

  // 3. Build response with cleared cookie if we acted on it.
  const res = NextResponse.json({
    ok: true,
    code: myCode,
    referralAttributed,
    referralAttempted,
  });
  if (referralAttempted) {
    res.cookies.set({
      name: COOKIE_NAME,
      value: '',
      maxAge: 0,
      path: '/',
    });
  }
  return res;
}
