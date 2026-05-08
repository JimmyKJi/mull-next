// Self-serve account deletion. Requires the user to confirm by sending the
// literal string "DELETE MY ACCOUNT" in the request body — the same phrase
// they have to type into the UI before the button activates.
//
// Order of operations:
//   1. Authenticate the requester via the regular cookie-bound client.
//   2. Wipe every user-scoped row across our tables. We do this explicitly
//      (rather than relying on ON DELETE CASCADE from auth.users) because
//      not every table currently has the FK cascade set, and we'd rather be
//      certain everything is gone than depend on schema state.
//   3. Delete the auth.users row via the admin client. This signs the user
//      out everywhere and prevents re-login.
//
// Requires SUPABASE_SERVICE_ROLE_KEY in env (see utils/supabase/admin.ts).
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';

const CONFIRMATION = 'DELETE MY ACCOUNT';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const confirm: string = (body?.confirm ?? '').toString();
    if (confirm !== CONFIRMATION) {
      return NextResponse.json({
        error: `To confirm, send {"confirm": "${CONFIRMATION}"} in the request body.`,
      }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

    // Wipe user-scoped rows. We swallow individual errors and report at the
    // end so partial failures still get the auth row removed where possible.
    const tableErrors: Array<{ table: string; code?: string; message: string }> = [];
    const wipe = async (table: string) => {
      const { error } = await supabase.from(table).delete().eq('user_id', user.id);
      if (error) tableErrors.push({ table, code: error.code, message: error.message });
    };
    await wipe('quiz_attempts');
    await wipe('dilemma_responses');
    await wipe('diary_entries');
    await wipe('debate_history');
    await wipe('public_profiles');

    // Now delete the auth row. Any failure here is the only one that's truly
    // fatal — without removing auth.users, the user could log back in.
    let admin;
    try {
      admin = createAdminClient();
    } catch (e) {
      console.error('[account/delete] admin client unavailable', e);
      return NextResponse.json({
        error: 'Account deletion is misconfigured server-side. Email jimmy.kaian.ji@gmail.com — your data has been wiped but the auth record could not be removed.',
        partial: true,
        wiped: ['quiz_attempts', 'dilemma_responses', 'diary_entries', 'debate_history', 'public_profiles'],
        tableErrors,
      }, { status: 500 });
    }

    const { error: authDeleteError } = await admin.auth.admin.deleteUser(user.id);
    if (authDeleteError) {
      console.error('[account/delete] auth.users delete failed', authDeleteError);
      return NextResponse.json({
        error: 'Your data was wiped but we could not remove your sign-in record. Email jimmy.kaian.ji@gmail.com to finish.',
        partial: true,
        tableErrors,
      }, { status: 500 });
    }

    return NextResponse.json({ deleted: true, tableErrors });
  } catch (e) {
    console.error('[account/delete] unexpected', e);
    return NextResponse.json({ error: 'Could not delete account.' }, { status: 500 });
  }
}
