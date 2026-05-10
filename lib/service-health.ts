// Lightweight service health checks for the /admin dashboard.
// Each check returns { ok, latencyMs, note } and is tightly time-
// boxed so a stalled provider doesn't hang the dashboard render.
//
// What we check:
//   - Supabase DB: a count() on a tiny table (always fast in healthy state)
//   - Anthropic API: a HEAD request to api.anthropic.com (no API call cost)
//   - Resend API: GET /domains (cheap auth check, fails fast if key bad)
//
// All three are best-effort — the chip shows green/amber/red, not
// the diagnostic detail, so they're informational rather than load-
// bearing.

import { createAdminClient } from '@/utils/supabase/admin';

export type HealthCheck = {
  name: string;
  ok: boolean;
  latencyMs: number;
  note?: string;
};

async function withTimeout<T>(p: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>(resolve => setTimeout(() => resolve(fallback), ms)),
  ]);
}

export async function runHealthChecks(): Promise<HealthCheck[]> {
  return Promise.all([
    checkSupabase(),
    checkAnthropic(),
    checkResend(),
  ]);
}

async function checkSupabase(): Promise<HealthCheck> {
  const start = Date.now();
  try {
    const admin = createAdminClient();
    // Wrap the PostgrestBuilder in a real Promise so withTimeout's typing works.
    const queryPromise: Promise<{ error: { message: string } | null }> = (async () => {
      const r = await admin.from('feedback').select('id', { count: 'exact', head: true });
      return { error: r.error ? { message: r.error.message } : null };
    })();
    const result = await withTimeout(queryPromise, 3000, { error: { message: 'timeout' } });
    const latencyMs = Date.now() - start;
    if (result.error) return { name: 'Supabase', ok: false, latencyMs, note: result.error.message };
    return { name: 'Supabase', ok: true, latencyMs };
  } catch (e) {
    return { name: 'Supabase', ok: false, latencyMs: Date.now() - start, note: (e as Error).message };
  }
}

async function checkAnthropic(): Promise<HealthCheck> {
  const start = Date.now();
  try {
    // We don't have an unauth health endpoint; a HEAD to the root API
    // hostname returns quickly without spending tokens. 401/404 still
    // counts as "service reachable" — only network failure is "down."
    const res = await withTimeout(
      fetch('https://api.anthropic.com', { method: 'HEAD', cache: 'no-store' }),
      3000,
      null,
    );
    const latencyMs = Date.now() - start;
    if (!res) return { name: 'Anthropic', ok: false, latencyMs, note: 'timeout' };
    return { name: 'Anthropic', ok: true, latencyMs, note: `HTTP ${res.status}` };
  } catch (e) {
    return { name: 'Anthropic', ok: false, latencyMs: Date.now() - start, note: (e as Error).message };
  }
}

async function checkResend(): Promise<HealthCheck> {
  const start = Date.now();
  const apiKey = process.env.EMAIL_PROVIDER_API_KEY;
  if (!apiKey) {
    return { name: 'Resend', ok: false, latencyMs: 0, note: 'EMAIL_PROVIDER_API_KEY not set' };
  }
  try {
    const res = await withTimeout(
      fetch('https://api.resend.com/domains', {
        headers: { 'Authorization': `Bearer ${apiKey}` },
        cache: 'no-store',
      }),
      3000,
      null,
    );
    const latencyMs = Date.now() - start;
    if (!res) return { name: 'Resend', ok: false, latencyMs, note: 'timeout' };
    if (res.status === 401 || res.status === 403) {
      return { name: 'Resend', ok: false, latencyMs, note: 'auth failed' };
    }
    return { name: 'Resend', ok: res.ok, latencyMs, note: `HTTP ${res.status}` };
  } catch (e) {
    return { name: 'Resend', ok: false, latencyMs: Date.now() - start, note: (e as Error).message };
  }
}
