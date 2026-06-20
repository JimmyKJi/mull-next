// POST /api/quiz/save
//
// Saves a freshly-finished quiz attempt to the `quiz_attempts` table.
// Companion to /api/account/claim-attempt — that one handles claiming
// a guest-stashed result post-signup; this one handles the authed
// happy path where the user is already signed in when the quiz finishes.
//
// Body (validated):
//   { vector: number[16], archetype: string, flavor?: string,
//     alignment_pct: number, mode?: "quick"|"detailed",
//     research_consent?: "yes"|"no"|null,
//     research_answers?: ResearchAnswer[]|null,
//     research_question_count?: number|null }
//
// Auth: requires a signed-in user. Returns 401 otherwise — the client
// is expected to stash to localStorage instead (then PendingAttemptClaimer
// will pick it up after signup).
//
// Idempotency: the same 5-minute dedupe window as claim-attempt — if
// the user has a quiz attempt saved in the last 5 minutes, we treat
// this as a duplicate (rapid retry / double-mount) and skip.
//
// Research capture: when the caller is opted in (research_consent
// "yes", synced to the research_consent table), we ALSO write a row to
// research_quiz_responses with the per-question answer trail. This is
// best-effort and never blocks or fails the core attempt save. Opted-out
// users never get a research row written — the table holds consented
// data only. See app/admin/research/page.tsx for where this is consumed.

import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { captureResearchResponse, syncConsent } from '@/lib/research-capture';
import { getServerLocale } from '@/lib/locale-server';

export const runtime = 'nodejs';

type Payload = {
  vector?: unknown;
  archetype?: unknown;
  flavor?: unknown;
  alignment_pct?: unknown;
  mode?: unknown;
  research_consent?: unknown;
  research_answers?: unknown;
  research_question_count?: unknown;
};

export async function POST(req: Request) {
  let body: Payload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
  }

  if (!Array.isArray(body.vector) || body.vector.length !== 16) {
    return NextResponse.json({ error: 'Invalid vector shape.' }, { status: 400 });
  }
  const vector = body.vector.map((v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  });

  const archetype = typeof body.archetype === 'string' ? body.archetype.trim() : '';
  if (!archetype) {
    return NextResponse.json({ error: 'Missing archetype.' }, { status: 400 });
  }

  const flavor = typeof body.flavor === 'string' && body.flavor.trim() ? body.flavor.trim() : null;

  const pctRaw = Number(body.alignment_pct);
  const alignment_pct = Number.isFinite(pctRaw)
    ? Math.max(0, Math.min(100, Math.round(pctRaw)))
    : 0;

  const mode = body.mode === 'detailed' ? 'detailed' : 'quick';

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    // Client should stash to localStorage and let
    // PendingAttemptClaimer handle it after signup.
    return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  }

  // Keep the server-side consent record in step with the client's
  // localStorage choice (best-effort; never blocks the save). Returns
  // the effective consent — the client's choice if given, else whatever
  // we already have on file.
  const consent = await syncConsent(supabase, user.id, body.research_consent);

  // 5-minute dedupe — matches claim-attempt's behavior. Protects
  // against double-mounts, fast retries, or the user navigating away
  // and back.
  const fiveMinAgo = new Date(Date.now() - 5 * 60_000).toISOString();
  const { data: recent } = await supabase
    .from('quiz_attempts')
    .select('id, taken_at')
    .eq('user_id', user.id)
    .gte('taken_at', fiveMinAgo)
    .limit(1)
    .maybeSingle();
  if (recent) {
    return NextResponse.json({
      ok: true,
      skipped: 'recent attempt exists',
      existingId: recent.id,
    });
  }

  const { data: inserted, error } = await supabase
    .from('quiz_attempts')
    .insert({
      user_id: user.id,
      vector,
      archetype,
      flavor,
      alignment_pct,
    })
    .select('id, taken_at')
    .single();

  if (error) {
    console.error('[quiz/save] insert failed', error);
    return NextResponse.json({ error: 'Could not save attempt.' }, { status: 500 });
  }

  // Consent-gated research capture. Best-effort: a failure here is logged
  // but never surfaced to the user — the attempt is already safely saved.
  const locale = await getServerLocale();
  const captured = await captureResearchResponse(supabase, {
    userId: user.id,
    attemptId: inserted.id,
    consent,
    mode,
    answers: body.research_answers,
    questionCount: body.research_question_count,
    vector,
    archetype,
    alignmentPct: alignment_pct,
    locale,
  });

  return NextResponse.json({
    ok: true,
    saved: true,
    id: inserted.id,
    taken_at: inserted.taken_at,
    research_captured: captured,
  });
}
