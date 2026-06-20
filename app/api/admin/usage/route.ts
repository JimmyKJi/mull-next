// GET /api/admin/usage
//
// Admin-only endpoint. Returns the current AI spend snapshot
// (daily + monthly cents, caps, pause status) + per-bucket
// breakdown for the last 24h and 31d.
//
// Used by /admin/usage to render the kill-switch dashboard.

import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { isAdminUserId } from '@/lib/admin';
import { readAiSpend } from '@/lib/rate-limit';

const AI_BUCKETS = [
  'dilemma_submit',
  'reflection',
  'diary',
  'exercise',
  'spar_play',
  'arena_turn',
  'arena_judge',
  'argument_diary',
];

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!isAdminUserId(user?.id)) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
  }

  const spend = await readAiSpend();

  // Per-bucket breakdown for the last 24h and 31d.
  let perBucketDay: Record<string, number> = {};
  let perBucketMonth: Record<string, number> = {};
  try {
    const admin = createAdminClient();
    const now = Date.now();
    const dayCutoff = new Date(now - 24 * 3600_000).toISOString();
    const monthCutoff = new Date(now - 31 * 24 * 3600_000).toISOString();

    const { data: dayRows } = await admin
      .from('rate_limit_events')
      .select('bucket')
      .gte('created_at', dayCutoff);
    const { data: monthRows } = await admin
      .from('rate_limit_events')
      .select('bucket')
      .gte('created_at', monthCutoff);

    for (const b of AI_BUCKETS) {
      perBucketDay[b] = (dayRows ?? []).filter((r) => r.bucket === b).length;
      perBucketMonth[b] = (monthRows ?? []).filter((r) => r.bucket === b).length;
    }
  } catch (e) {
    console.error('[admin/usage] per-bucket query failed', e);
  }

  return NextResponse.json({
    spend,
    perBucketDay,
    perBucketMonth,
    envFlags: {
      killSwitch: process.env.MULL_KILL_SWITCH ?? null,
      dailyCapCents: process.env.MULL_DAILY_SPEND_CAP_CENTS ?? null,
      monthlyCapCents: process.env.MULL_MONTHLY_SPEND_CAP_CENTS ?? null,
    },
  });
}
