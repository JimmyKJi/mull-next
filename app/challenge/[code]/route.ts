// GET /challenge/<code>
//
// Lightweight landing handler — resolves the code, bumps view_count,
// and redirects the visitor into the quiz with the challenger param
// set. We do this server-side so:
//   - The link works even before JS hydrates
//   - View telemetry is accurate (client-side beacons get blocked)
//   - The 302 lets X / IG previews resolve to the canonical /quiz
//
// If the code doesn't resolve, fall through to the home page so the
// visitor still lands somewhere useful rather than a 404.

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

export const runtime = 'nodejs';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  if (!code) return NextResponse.redirect(new URL('/', 'https://mull.world'));

  // Use the admin client so the SECURITY DEFINER RPC fires regardless
  // of whether the visitor is signed in.
  let admin;
  try {
    admin = createAdminClient();
  } catch {
    // Admin client unavailable — still redirect, just skip telemetry.
    return NextResponse.redirect(new URL(`/quiz?challenger=${encodeURIComponent(code)}`, 'https://mull.world'));
  }

  // Verify the code exists before we bump telemetry, so a bot hitting
  // /challenge/garbage doesn't pollute counts.
  const { data: row } = await admin
    .from('friend_challenges')
    .select('code')
    .eq('code', code)
    .maybeSingle();

  if (!row) {
    return NextResponse.redirect(new URL('/', 'https://mull.world'));
  }

  // Fire-and-forget view bump — don't await; we want the redirect snappy.
  void admin.rpc('friend_challenge_increment_view', { p_code: code });

  return NextResponse.redirect(
    new URL(`/quiz?challenger=${encodeURIComponent(code)}`, 'https://mull.world'),
  );
}
