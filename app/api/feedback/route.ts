// POST /api/feedback — accepts a feedback note from anyone.
// Lightweight: no admin reads here, just inserts.
//
// Captures (if available):
//   - user_id from the request session
//   - the URL the user was on when they submitted
//   - user-agent (for bug triage)

import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

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
    return NextResponse.json({ error: 'Could not save feedback.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
