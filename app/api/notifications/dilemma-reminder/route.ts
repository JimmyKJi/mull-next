// User-facing endpoint to read and update their daily-dilemma email
// reminder preferences. RLS on `notification_preferences` already
// restricts access to the row owner, so we use the request-scoped
// supabase client (not admin) and rely on auth.getUser().
//
// Pattern:
//   GET  → returns { enabled, hour, tz } (defaults if no row exists yet)
//   POST → upserts { enabled, hour, tz } on the user's row
//
// Time-zone validation is delegated to `Intl.DateTimeFormat`: if
// constructing one with the supplied tz throws, we reject. This catches
// typos and obsolete zones without us having to ship the tzdb.

import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const runtime = 'nodejs';

type Pref = {
  user_id: string;
  email_dilemma_reminder: boolean;
  reminder_local_hour: number;
  reminder_tz: string;
};

function isValidTz(tz: unknown): tz is string {
  if (typeof tz !== 'string' || !tz) return false;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return true;
  } catch { return false; }
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  const { data, error } = await supabase
    .from('notification_preferences')
    .select('email_dilemma_reminder, reminder_local_hour, reminder_tz')
    .eq('user_id', user.id)
    .maybeSingle<Omit<Pref, 'user_id'>>();
  if (error) {
    console.error('[notifications GET] failed', error);
    return NextResponse.json({ error: 'Could not load preferences.' }, { status: 500 });
  }

  // No row yet → return sensible defaults so the UI renders cleanly.
  return NextResponse.json({
    enabled: data?.email_dilemma_reminder ?? false,
    hour: data?.reminder_local_hour ?? 9,
    tz: data?.reminder_tz ?? 'UTC',
  });
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  let body: { enabled?: unknown; hour?: unknown; tz?: unknown };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 }); }

  const enabled = !!body.enabled;
  const hour = Math.max(0, Math.min(23, Math.round(Number(body.hour))));
  if (Number.isNaN(hour)) {
    return NextResponse.json({ error: 'Invalid hour.' }, { status: 400 });
  }
  const tz = body.tz;
  if (!isValidTz(tz)) {
    return NextResponse.json({ error: 'Invalid time zone.' }, { status: 400 });
  }

  const { error } = await supabase
    .from('notification_preferences')
    .upsert(
      {
        user_id: user.id,
        email_dilemma_reminder: enabled,
        reminder_local_hour: hour,
        reminder_tz: tz,
      },
      { onConflict: 'user_id' }
    );

  if (error) {
    console.error('[notifications POST] upsert failed', error);
    return NextResponse.json({ error: 'Could not save preferences.' }, { status: 500 });
  }
  return NextResponse.json({ ok: true, enabled, hour, tz });
}
