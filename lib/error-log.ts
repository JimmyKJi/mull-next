// Server-side error logger. Use from API route catch blocks:
//
//   } catch (e) {
//     await logError({ source: 'api:/feedback', error: e, req });
//     return NextResponse.json({ error: 'Server error' }, { status: 500 });
//   }
//
// Uses the service-role admin client so RLS doesn't block writes.
// Best-effort: if the logger itself fails we just console.error
// rather than throwing — we never want logging to break the
// response that's already on its way out the door.

import { createAdminClient } from '@/utils/supabase/admin';

type LogArgs = {
  source: string;          // 'api:/dilemma/submit', 'client:/account', etc.
  error: unknown;
  req?: Request;
  userId?: string | null;
  url?: string;
};

export async function logError(args: LogArgs): Promise<void> {
  try {
    const message = args.error instanceof Error ? args.error.message : String(args.error);
    const stack = args.error instanceof Error ? args.error.stack ?? null : null;
    const userAgent = args.req?.headers.get('user-agent')?.slice(0, 500) ?? null;
    const url = args.url ?? args.req?.url ?? null;

    let admin;
    try { admin = createAdminClient(); }
    catch { return; } // No service-role key — silently skip.

    await admin.from('error_log').insert({
      source: args.source.slice(0, 200),
      message: message.slice(0, 2000),
      stack: stack ? stack.slice(0, 8000) : null,
      user_id: args.userId ?? null,
      user_agent: userAgent,
      url: url ? url.slice(0, 500) : null,
    });
  } catch (e) {
    // Logger of last resort — Vercel will keep this.
    console.error('[error-log] failed to log error', e);
  }
}
