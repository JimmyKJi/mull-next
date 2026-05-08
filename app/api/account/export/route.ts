// Export all data we hold for the signed-in user as a single JSON payload.
//
// What this includes: every row in every table that's user-scoped — quiz
// attempts, dilemma responses, diary entries, saved debates, public profile
// settings if any. Each row is included as-is (no transformation), so this
// doubles as a transparency tool: you can see literally what we have on you.
//
// What this DOES NOT include: anything from the Supabase auth.users row
// (email, password hash, sign-in metadata) since that's managed by Supabase
// itself. The user's email is added separately so the file is self-contained.
//
// Returns: a downloadable JSON file.
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

    // Fan out — these tables are all user-scoped via RLS, so the simple
    // SELECTs return only this user's rows.
    const [quiz, dilemmas, diary, debates, profile] = await Promise.all([
      supabase.from('quiz_attempts').select('*').eq('user_id', user.id),
      supabase.from('dilemma_responses').select('*').eq('user_id', user.id),
      supabase.from('diary_entries').select('*').eq('user_id', user.id),
      supabase.from('debate_history').select('*').eq('user_id', user.id),
      supabase.from('public_profiles').select('*').eq('user_id', user.id).maybeSingle(),
    ]);

    const payload = {
      schema: 'mull/account-export@v1',
      exported_at: new Date().toISOString(),
      account: {
        id: user.id,
        email: user.email ?? null,
        created_at: user.created_at ?? null,
      },
      quiz_attempts: quiz.data ?? [],
      dilemma_responses: dilemmas.data ?? [],
      diary_entries: diary.data ?? [],
      debate_history: debates.data ?? [],
      public_profile: profile.data ?? null,
      // Tables that returned errors are surfaced so the user knows something
      // didn't make it into the export rather than silently missing.
      _errors: [
        quiz.error && { table: 'quiz_attempts', code: quiz.error.code, message: quiz.error.message },
        dilemmas.error && { table: 'dilemma_responses', code: dilemmas.error.code, message: dilemmas.error.message },
        diary.error && { table: 'diary_entries', code: diary.error.code, message: diary.error.message },
        debates.error && { table: 'debate_history', code: debates.error.code, message: debates.error.message },
        profile.error && { table: 'public_profiles', code: profile.error.code, message: profile.error.message },
      ].filter(Boolean),
    };

    const filename = `mull-export-${user.id.slice(0, 8)}-${new Date().toISOString().slice(0, 10)}.json`;
    return new NextResponse(JSON.stringify(payload, null, 2), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (e) {
    console.error('[account/export] failed', e);
    return NextResponse.json({ error: 'Could not build export.' }, { status: 500 });
  }
}
