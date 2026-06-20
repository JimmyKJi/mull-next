// Daily cleanup of the rate_limit_events table.
//
// Without this, every rate-checked request leaves a row that lives
// forever — over months it bloats the table and slows the lookup
// query. The actual rate-limit window is 5 minutes max, so anything
// older than 24 hours is safe to delete.
//
// Schedule: daily at 03:00 UTC (low-traffic hour).
//
// Returns a small JSON payload with the count of deleted rows so
// /admin can surface "last cleanup: N rows" if we ever want that.

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { requireCronAuth } from '@/lib/cron-auth';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const denied = requireCronAuth(req);
  if (denied) return denied;

  let admin;
  try {
    admin = createAdminClient();
  } catch (e) {
    console.error('[cron/rate-limit-cleanup] admin client unavailable', e);
    return NextResponse.json({ error: 'Admin client misconfigured.' }, { status: 500 });
  }

  // Two cutoffs now:
  //   - 24h for non-AI buckets (feedback, welcome) — these are pure
  //     per-IP spam protection, the rate window is minutes.
  //   - 31 days for AI-bearing buckets (spar_play, arena_*, diary,
  //     etc.) — these power the monthly spend ceiling in lib/rate-
  //     limit.ts's readAiSpend() and must survive a full month.
  const dayCutoff = new Date(Date.now() - 24 * 3600_000).toISOString();
  const monthCutoff = new Date(Date.now() - 31 * 24 * 3600_000).toISOString();

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

  // Delete non-AI buckets older than 24h.
  const { error: e1, count: c1 } = await admin
    .from('rate_limit_events')
    .delete({ count: 'exact' })
    .not('bucket', 'in', `(${AI_BUCKETS.map((b) => `"${b}"`).join(',')})`)
    .lt('created_at', dayCutoff);

  // Delete AI buckets older than 31 days.
  const { error: e2, count: c2 } = await admin
    .from('rate_limit_events')
    .delete({ count: 'exact' })
    .in('bucket', AI_BUCKETS)
    .lt('created_at', monthCutoff);

  if (e1 || e2) {
    console.error('[cron/rate-limit-cleanup] delete failed', e1, e2);
    return NextResponse.json({ error: (e1 ?? e2)?.message ?? 'cleanup failed' }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    deletedNonAi: c1 ?? 0,
    deletedAi: c2 ?? 0,
    dayCutoff,
    monthCutoff,
  });
}
