// POST /api/error-report — client-side error reporter. Body:
//   { source: 'client:/account', message, stack?, url? }
//
// Rate-limited so a misbehaving page that throws on every render
// can't flood the table. We swallow malformed payloads silently.

import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { logError } from '@/lib/error-log';
import { rateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  // 20 reports per IP per minute is generous — protects against a
  // crash-on-render loop while keeping headroom for legitimate
  // multi-error pages.
  const limit = await rateLimit(req, {
    bucket: 'feedback', // reuse bucket — same volume profile
    max: 20,
    windowSec: 60,
  });
  if (!limit.ok) return NextResponse.json({ ok: false, throttled: true });

  let body: { source?: unknown; message?: unknown; stack?: unknown; url?: unknown };
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: 'Invalid JSON.' }, { status: 400 }); }

  const source = typeof body.source === 'string' ? body.source.slice(0, 200) : 'client:unknown';
  const message = typeof body.message === 'string' ? body.message : '';
  if (!message) return NextResponse.json({ ok: false, error: 'Empty.' }, { status: 400 });

  const stack = typeof body.stack === 'string' ? body.stack : undefined;
  const url = typeof body.url === 'string' ? body.url.slice(0, 500) : undefined;

  // Pull user-id if signed in, just for triage. RLS-scoped read,
  // not stored as PII anywhere visible.
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const fakeError = new Error(message);
  if (stack) fakeError.stack = stack;
  await logError({ source, error: fakeError, req, userId: user?.id, url });

  return NextResponse.json({ ok: true });
}
