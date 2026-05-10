// /api/dilemma/reflection
//
// GET → returns the oldest dilemma response without a followup that's
//       at least 56 days old, for the calling user. Null if none.
//
// POST → saves a follow-up text against a specific dilemma response.
//        Body: { dilemma_response_id, followup_text }
//
// Drives the "you wrote this 8 weeks ago — has anything shifted?"
// card on /account.

import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const runtime = 'nodejs';

type Candidate = {
  id: string;
  dilemma_date: string;
  question_text: string;
  response_text: string;
  analysis: string | null;
  created_at: string;
};

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  const { data, error } = await supabase
    .rpc('next_reflection_candidate', { in_user_id: user.id, min_age_days: 56 });

  if (error) {
    console.error('[reflection GET] failed', error);
    return NextResponse.json({ error: 'Could not load reflection.' }, { status: 500 });
  }
  const candidate = (data as Candidate[] | null)?.[0] ?? null;
  return NextResponse.json({ candidate });
}

export async function POST(req: Request) {
  let body: { dilemma_response_id?: unknown; followup_text?: unknown };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 }); }

  const id = typeof body.dilemma_response_id === 'string' ? body.dilemma_response_id : '';
  const text = typeof body.followup_text === 'string' ? body.followup_text.trim() : '';

  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ error: 'Invalid id.' }, { status: 400 });
  }
  if (text.length < 10) {
    return NextResponse.json({ error: 'Follow-up too short.' }, { status: 400 });
  }
  if (text.length > 4000) {
    return NextResponse.json({ error: 'Follow-up too long (max 4000).' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  // RLS already restricts updates to the row owner, but we double-
  // check user_id explicitly so a misconfigured policy can't leak.
  const { error } = await supabase
    .from('dilemma_responses')
    .update({
      followup_text: text,
      followup_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error('[reflection POST] failed', error);
    return NextResponse.json({ error: 'Could not save reflection.' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
