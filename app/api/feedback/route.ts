// POST /api/feedback — accepts a feedback note from anyone.
// Lightweight: no admin reads here, just inserts.
//
// Captures (if available):
//   - user_id from the request session
//   - the URL the user was on when they submitted
//   - user-agent (for bug triage)

import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { rateLimit } from '@/lib/rate-limit';
import { logError } from '@/lib/error-log';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  let body: { body?: unknown; page_url?: unknown };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 }); }

  const text = typeof body.body === 'string' ? body.body.trim() : '';
  if (!text || text.length < 2) {
    return NextResponse.json({ error: 'Empty feedback.' }, { status: 400 });
  }
  if (text.length > 4000) {
    return NextResponse.json({ error: 'Too long (max 4000 chars).' }, { status: 400 });
  }

  const pageUrl = typeof body.page_url === 'string' ? body.page_url.slice(0, 500) : null;
  const userAgent = (req.headers.get('user-agent') || '').slice(0, 500);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Rate limit: 5 feedback notes per IP per 5 minutes. A real human
  // typing 5+ separate notes in 5 minutes is implausible; bots get
  // 429s. Authenticated users still go through this — friends pile-
  // submitting at launch is unlikely past the 5/window threshold.
  const limit = await rateLimit(req, {
    bucket: 'feedback',
    max: 5,
    windowSec: 300,
    userId: user?.id,
  });
  if (!limit.ok) {
    return NextResponse.json({ error: limit.message }, { status: 429 });
  }

  const { error } = await supabase
    .from('feedback')
    .insert({
      user_id: user?.id ?? null,
      body: text,
      page_url: pageUrl,
      user_agent: userAgent,
    });

  if (error) {
    console.error('[feedback] insert failed', error);
    await logError({
      source: 'api:/feedback',
      error: new Error(`feedback insert: ${error.message}`),
      req,
      userId: user?.id ?? null,
    });
    return NextResponse.json({ error: 'Could not save feedback.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
