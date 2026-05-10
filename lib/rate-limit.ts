// Tiny rate limiter backed by Supabase. Use from API routes:
//
//   const limit = await rateLimit(req, { bucket: 'feedback', max: 5, windowSec: 60 });
//   if (!limit.ok) return NextResponse.json({ error: limit.message }, { status: 429 });
//
// Uses the service-role admin client so RLS doesn't block writes.
// Hashes the client IP before storing — we never persist a raw IP,
// just a sha256 hex of (ip + a salt). The salt is rotated by setting
// RATE_LIMIT_SALT env; if absent we use a fallback constant which is
// fine for "two requests look like the same person" purposes but
// not for offline attacks (since we never reveal the hash).
//
// The function is intentionally non-fatal: if the rate-limiter
// itself errors (e.g. no Supabase connection), we let the request
// through. Better to under-protect than to take the whole site
// down on a transient DB hiccup.

import { createHash } from 'crypto';
import { createAdminClient } from '@/utils/supabase/admin';

type Bucket = 'feedback' | 'dilemma_submit' | 'welcome' | 'reflection' | 'diary' | 'exercise';

type Options = {
  bucket: Bucket;
  max: number;        // attempts allowed
  windowSec: number;  // window length in seconds
  userId?: string | null;
};

type Result =
  | { ok: true; remaining: number }
  | { ok: false; message: string };

function clientIp(req: Request): string {
  // Vercel sets x-forwarded-for to the real client IP; the first
  // entry is the user, the rest are proxies.
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  const real = req.headers.get('x-real-ip');
  if (real) return real.trim();
  return 'unknown';
}

function hashIp(ip: string): string {
  const salt = process.env.RATE_LIMIT_SALT || 'mull-default-salt-rotate-me';
  return createHash('sha256').update(`${salt}::${ip}`).digest('hex');
}

export async function rateLimit(req: Request, opts: Options): Promise<Result> {
  let admin;
  try {
    admin = createAdminClient();
  } catch {
    // No service-role key configured — let the request through.
    // Logged once on boot via createAdminClient's own warning.
    return { ok: true, remaining: opts.max };
  }

  try {
    const ipHash = hashIp(clientIp(req));
    const { data, error } = await admin.rpc('check_rate_limit', {
      in_bucket: opts.bucket,
      in_ip_hash: ipHash,
      in_user_id: opts.userId ?? null,
      in_window_seconds: opts.windowSec,
    });
    if (error) {
      console.error('[rate-limit] RPC failed', error);
      return { ok: true, remaining: opts.max };
    }
    const attempts = typeof data === 'number' ? data : 1;
    if (attempts > opts.max) {
      return { ok: false, message: `Too many requests. Try again in ${opts.windowSec}s.` };
    }
    return { ok: true, remaining: Math.max(0, opts.max - attempts) };
  } catch (e) {
    console.error('[rate-limit] threw', e);
    return { ok: true, remaining: opts.max };
  }
}
