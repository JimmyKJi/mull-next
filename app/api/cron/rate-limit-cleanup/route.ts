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

  // 24-hour cutoff. The longest rate-limit window we use is 5 min;
  // 24h gives generous headroom in case we add a longer-window
  // bucket later, while still preventing unbounded growth.
  const cutoff = new Date(Date.now() - 24 * 3600_000).toISOString();

  // count: 'exact' returns the number of deleted rows so we can
  // log meaningful telemetry without selecting them.
  const { error, count } = await admin
    .from('rate_limit_events')
    .delete({ count: 'exact' })
    .lt('created_at', cutoff);

  if (error) {
    console.error('[cron/rate-limit-cleanup] delete failed', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    deletedCount: count ?? 0,
    cutoff,
  });
}
