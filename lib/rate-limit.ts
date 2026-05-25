// Tiny rate limiter backed by Supabase. Use from API routes:
//
//   const limit = await rateLimit(req, { bucket: 'feedback', max: 5, windowSec: 60 });
//   if (!limit.ok) return NextResponse.json({ error: limit.message }, { status: 429 });
//
// For AI endpoints, prefer the combined helper aiGate() which adds a
// site-wide daily/monthly spend ceiling on top of the per-user check:
//
//   const gate = await aiGate(req, { bucket: 'spar_play', userId: user?.id });
//   if (!gate.ok) return NextResponse.json({ error: gate.message }, { status: gate.status });
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
// down on a transient DB hiccup. The KILL SWITCH (aiGate's global
// spend check) is the exception — if we can't verify spend we fail
// CLOSED on AI endpoints, since the cost of a runaway is bigger
// than the cost of a temporary outage.

import { createHash } from 'crypto';
import { createAdminClient } from '@/utils/supabase/admin';

// Buckets group requests for per-user rate limiting. Add a new
// bucket when introducing a new gated endpoint. Buckets that
// reference AI inference get a non-zero entry in BUCKET_COST_CENTS
// (below) so they roll into the global spend ceiling too.
type Bucket =
  // Non-AI (cheap, just per-user spam protection)
  | 'feedback'
  | 'welcome'
  // AI-bearing (also rolled into global spend ceiling)
  | 'dilemma_submit'
  | 'reflection'
  | 'diary'
  | 'exercise'
  | 'spar_play'
  | 'arena_turn'
  | 'arena_judge'
  | 'argument_diary';

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

// ─── AI spend ceiling (the kill switch) ─────────────────────────────
//
// On top of per-user rate limits, every AI endpoint runs an aiGate()
// that also checks a site-wide daily + monthly spend ceiling. If the
// ceiling is reached, all AI inference stops for the rest of the day
// (or month) — returning 503 with a friendly "Mull is paused for the
// day" message. Resets at midnight UTC.
//
// Per-bucket cost estimates are conservative averages (cents). They
// don't have to match the actual Anthropic invoice cent-for-cent —
// the point is to keep aggregate cost bounded.

const BUCKET_COST_CENTS: Record<Bucket, number> = {
  feedback: 0,        // no AI
  welcome: 0,         // no AI
  dilemma_submit: 1,  // ~$0.005 Haiku — round up
  reflection: 1,
  diary: 1,
  exercise: 1,
  argument_diary: 1,  // single Haiku call
  spar_play: 8,       // 1 Haiku turn + 1 Sonnet judge, ~$0.05–0.08
  arena_turn: 1,      // 1 Haiku turn alone
  arena_judge: 15,    // Sonnet judge on full transcript, ~$0.15
};

// Daily ceiling — defaults to $17/day. Budget math: Jimmy's
// ~£500/mo ≈ $625/mo cash budget, but Anthropic charges 20% VAT
// on top of the listed API price, so $1 of cap = $1.20 of cash.
// $17/day × 30 = $510/mo of API → ~$612 cash after VAT. Sits just
// inside £500 GBP at current FX.
const DAILY_SPEND_CAP_CENTS = parseInt(
  process.env.MULL_DAILY_SPEND_CAP_CENTS || '1700',
  10,
);
// Monthly ceiling — defaults to $500/mo of API (~$600 cash with
// VAT). Hard stop even if daily cap never trips on a given day —
// catches the slow-grind scenario.
const MONTHLY_SPEND_CAP_CENTS = parseInt(
  process.env.MULL_MONTHLY_SPEND_CAP_CENTS || '50000',
  10,
);

// Admin override (set MULL_KILL_SWITCH=on to force-pause all AI even
// when under the cap; set MULL_KILL_SWITCH=off to disable the cap
// entirely, e.g. for testing — use with care).
const KILL_SWITCH_OVERRIDE = process.env.MULL_KILL_SWITCH; // "on" | "off" | undefined

type SpendStatus = {
  dailyCents: number;
  monthlyCents: number;
  dailyCapCents: number;
  monthlyCapCents: number;
  paused: boolean;
  reason: string | null;
};

/** Read current spend totals + whether AI is paused. Cheap query
 *  (single COUNT(*) grouped by bucket over the rate_limit_events
 *  table); safe to call from any route. */
export async function readAiSpend(): Promise<SpendStatus> {
  const blank: SpendStatus = {
    dailyCents: 0,
    monthlyCents: 0,
    dailyCapCents: DAILY_SPEND_CAP_CENTS,
    monthlyCapCents: MONTHLY_SPEND_CAP_CENTS,
    paused: KILL_SWITCH_OVERRIDE === 'on',
    reason: KILL_SWITCH_OVERRIDE === 'on' ? 'Admin override active.' : null,
  };
  if (KILL_SWITCH_OVERRIDE === 'off') {
    return { ...blank, paused: false, reason: null };
  }
  let admin;
  try {
    admin = createAdminClient();
  } catch {
    // Can't verify — fail CLOSED on the kill switch path. Better to
    // pause AI briefly than to run unchecked.
    return { ...blank, paused: true, reason: 'Spend tracker unavailable.' };
  }

  try {
    const now = Date.now();
    const dayCutoff = new Date(now - 24 * 3600_000).toISOString();
    const monthCutoff = new Date(now - 31 * 24 * 3600_000).toISOString();

    // Pull bucket counts in one query each; bucket cost is tiny so
    // multiplying client-side is fine.
    const { data: dayRows } = await admin
      .from('rate_limit_events')
      .select('bucket')
      .gte('created_at', dayCutoff);
    const { data: monthRows } = await admin
      .from('rate_limit_events')
      .select('bucket')
      .gte('created_at', monthCutoff);

    let dailyCents = 0;
    for (const r of dayRows ?? []) {
      const c = BUCKET_COST_CENTS[r.bucket as Bucket];
      if (c) dailyCents += c;
    }
    let monthlyCents = 0;
    for (const r of monthRows ?? []) {
      const c = BUCKET_COST_CENTS[r.bucket as Bucket];
      if (c) monthlyCents += c;
    }

    const dailyHit = dailyCents >= DAILY_SPEND_CAP_CENTS;
    const monthlyHit = monthlyCents >= MONTHLY_SPEND_CAP_CENTS;
    return {
      dailyCents,
      monthlyCents,
      dailyCapCents: DAILY_SPEND_CAP_CENTS,
      monthlyCapCents: MONTHLY_SPEND_CAP_CENTS,
      paused: dailyHit || monthlyHit,
      reason: dailyHit
        ? `Daily AI cap reached ($${(dailyCents / 100).toFixed(2)} of $${(DAILY_SPEND_CAP_CENTS / 100).toFixed(2)}).`
        : monthlyHit
          ? `Monthly AI cap reached ($${(monthlyCents / 100).toFixed(2)} of $${(MONTHLY_SPEND_CAP_CENTS / 100).toFixed(2)}).`
          : null,
    };
  } catch (e) {
    console.error('[ai-spend] readAiSpend threw', e);
    // Fail closed.
    return { ...blank, paused: true, reason: 'Spend tracker errored.' };
  }
}

// Per-bucket per-user daily caps used by aiGate(). Conservative:
// generous enough that engaged users don't hit them in practice,
// strict enough that one bad actor can't run a $50 bill alone.
const PER_USER_DAILY_CAPS: Partial<Record<Bucket, number>> = {
  spar_play: 3,        // 3 Spars/day ≈ $0.24/day max per user
  arena_turn: 32,      // ~4 full debates of 8 turns
  arena_judge: 4,      // 4 verdicts/day → $0.60 cap per user
  argument_diary: 3,   // 3 analyses/day → $0.03 cap per user
  // Cheap ones get higher caps since they don't move the budget much:
  dilemma_submit: 5,
  diary: 10,
  exercise: 10,
  reflection: 10,
};

type GateOptions = {
  bucket: Bucket;
  userId?: string | null;
  /** Optional override of the per-user daily cap. Defaults to the
   *  PER_USER_DAILY_CAPS entry for the bucket, or 10 if none set. */
  perUserDaily?: number;
};

type GateResult =
  | { ok: true; remaining: number; spend: SpendStatus }
  | { ok: false; status: 429 | 503; message: string };

/** The all-in-one AI endpoint gate. Combines:
 *    1. Site-wide daily/monthly spend ceiling (kill switch)
 *    2. Per-user daily cap for the bucket
 *  Returns 503 for kill-switch, 429 for per-user limit. */
export async function aiGate(
  req: Request,
  opts: GateOptions,
): Promise<GateResult> {
  // 1. Global spend ceiling first — if we're paused, no one's
  //    request matters.
  const spend = await readAiSpend();
  if (spend.paused) {
    return {
      ok: false,
      status: 503,
      message:
        spend.reason ??
        'Mull is paused for the day — AI cost cap reached. Try again tomorrow.',
    };
  }

  // 2. Per-user daily cap. Uses the existing rateLimit() with a
  //    24-hour window. Falls open on DB hiccup (per the existing
  //    contract).
  const cap = opts.perUserDaily ?? PER_USER_DAILY_CAPS[opts.bucket] ?? 10;
  const limit = await rateLimit(req, {
    bucket: opts.bucket,
    max: cap,
    windowSec: 24 * 3600,
    userId: opts.userId,
  });
  if (!limit.ok) {
    return {
      ok: false,
      status: 429,
      message: friendlyPerUserMessage(opts.bucket, cap),
    };
  }

  return { ok: true, remaining: limit.remaining, spend };
}

function friendlyPerUserMessage(bucket: Bucket, cap: number): string {
  switch (bucket) {
    case 'spar_play':
      return `You've used your ${cap} Spars for today. The next one rotates in tomorrow.`;
    case 'arena_judge':
      return `You've called for ${cap} Arena verdicts today. Take a breath — back tomorrow.`;
    case 'arena_turn':
      return `You've played ${cap} Arena turns today. Plenty for one day. Continue tomorrow.`;
    case 'argument_diary':
      return `You've logged ${cap} arguments today. The analysis is yours — come back tomorrow with the next one.`;
    case 'diary':
      return `You've added ${cap} diary entries today. That's a lot of honest thinking. Back tomorrow.`;
    case 'exercise':
      return `You've submitted ${cap} exercise reflections today. Worth letting them settle. Back tomorrow.`;
    case 'dilemma_submit':
      return `You've submitted ${cap} dilemma responses today. Wait for tomorrow's question.`;
    default:
      return `Daily limit reached. Try again tomorrow.`;
  }
}
