// Shared CRON_SECRET auth gate for /api/cron/* routes.
//
// Every cron route had this same five-line dance:
//   const authHeader = req.headers.get('authorization') || '';
//   const expected = process.env.CRON_SECRET ? `Bearer ${process.env.CRON_SECRET}` : null;
//   if (!expected || authHeader !== expected) {
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }
//
// Now: `const denied = requireCronAuth(req); if (denied) return denied;`
//
// Critical behavior: when CRON_SECRET is unset (development, or before
// you've configured Vercel cron), we fail closed — return 401 to
// everyone, including the cron scheduler itself. The cron simply won't
// fire until you set the secret on both sides. This is the right
// trade-off: a missing env var should never silently leave routes wide
// open to the public internet.

import { NextResponse } from 'next/server';

/**
 * Return a 401 response when the request isn't authenticated as the
 * Vercel cron scheduler; return null when it is. Callers compose:
 *
 *   const denied = requireCronAuth(req);
 *   if (denied) return denied;
 */
export function requireCronAuth(req: Request): NextResponse | null {
  const authHeader = req.headers.get('authorization') || '';
  const secret = process.env.CRON_SECRET;
  const expected = secret ? `Bearer ${secret}` : null;
  if (!expected || authHeader !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}
