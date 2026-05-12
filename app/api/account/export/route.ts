// Export all data we hold for the signed-in user as a single JSON payload.
//
// What this includes: every row in every user-scoped table — registered in
// lib/user-scoped-tables.ts. The list is shared with the account-deletion
// route so the data we wipe is the data we expose: there's no longer a way
// for the two flows to drift.
//
// What this DOES NOT include:
//   - The Supabase auth.users row beyond { id, email, created_at }. The
//     password hash and sign-in metadata are owned by Supabase, not by us.
//   - Tables marked `inExport: false` in the registry (currently just
//     rate_limit_events — IP-hashed ops data that auto-prunes every 24h).
//
// Returns: a downloadable JSON file with one top-level key per table.
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { TABLES_TO_EXPORT } from '@/lib/user-scoped-tables';

type TableError = { table: string; code?: string; message: string };

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

    // Fan out reads in parallel. Singletons get .maybeSingle() so the
    // payload field is `<table>: {…}` rather than `<table>: [{…}]`; the
    // shape matches what we documented in the prior hand-curated version.
    const results = await Promise.all(
      TABLES_TO_EXPORT.map(async (t) => {
        const base = supabase.from(t.name).select('*').eq('user_id', user.id);
        const res = t.singleton ? await base.maybeSingle() : await base;
        return { table: t, res };
      }),
    );

    // Build payload + errors array. Keep tables as top-level keys for
    // readability; collected error metadata goes under `_errors` so
    // existing scripts that consume the export keep working.
    const payload: Record<string, unknown> = {
      schema: 'mull/account-export@v3',
      exported_at: new Date().toISOString(),
      account: {
        id: user.id,
        email: user.email ?? null,
        created_at: user.created_at ?? null,
      },
    };
    const errors: TableError[] = [];

    for (const { table, res } of results) {
      payload[table.name] = res.data ?? (table.singleton ? null : []);
      if (res.error) {
        errors.push({
          table: table.name,
          code: res.error.code,
          message: res.error.message,
        });
      }
    }

    // Tables that returned errors are surfaced so the user knows something
    // didn't make it into the export rather than silently missing.
    payload._errors = errors;

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
