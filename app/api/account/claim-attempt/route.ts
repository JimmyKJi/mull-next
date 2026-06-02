// POST /api/account/claim-attempt
//
// Claims a quiz attempt that was completed by an anonymous visitor
// before they signed up, then stashed in localStorage by mull.html's
// stashPendingAttempt(). The client component <PendingAttemptClaimer />
// reads the stash on /account mount and POSTs it here.
//
// Idempotent in spirit: the client clears localStorage after a
// successful POST so we shouldn't see the same payload twice. We
// also defensively check that the user doesn't already have a quiz
// attempt within the last 5 minutes — if they do, we assume this
// is a duplicate from a rapid re-mount and skip.
//
// Body (validated):
//   { vector: number[16], archetype: string, flavor?: string,
//     alignment_pct: number, taken_at?: string (ISO),
//     mode?: "quick"|"detailed", research_consent?, research_answers?,
//     research_question_count? }
//
// Research riders: a guest who opted in before signing up carries their
// per-question trail + consent through the stash. Once they have an
// account we sync consent and (if opted in) write the research row, just
// like the authed /api/quiz/save path. Best-effort — never blocks the claim.

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
  taken_at?: unknown;
  mode?: unknown;
  research_consent?: unknown;
  research_answers?: unknown;
  research_question_count?: unknown;
};

export async function POST(req: Request) {
  let body: Payload;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 }); }

  if (!Array.isArray(body.vector) || body.vector.length !== 16) {
    return NextResponse.json({ error: 'Invalid vector shape.' }, { status: 400 });
  }
  const vector = body.vector.map(v => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  });

  const archetype = typeof body.archetype === 'string' ? body.archetype.trim() : '';
  if (!archetype) return NextResponse.json({ error: 'Missing archetype.' }, { status: 400 });

  const flavor = typeof body.flavor === 'string' && body.flavor.trim()
    ? body.flavor.trim()
    : null;

  const alignmentPctRaw = Number(body.alignment_pct);
  const alignment_pct = Number.isFinite(alignmentPctRaw)
    ? Math.max(0, Math.min(100, Math.round(alignmentPctRaw)))
    : 0;

  const mode = body.mode === 'detailed' ? 'detailed' : 'quick';

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  // Sync the now-signed-in user's consent with whatever they chose as a
  // guest (carried in the stash). Returns the effective consent.
  const consent = await syncConsent(supabase, user.id, body.research_consent);

  // Defensive dedupe: skip if this user already has any quiz_attempt
  // saved in the past 5 minutes. Rules out duplicate posts from
  // double-mounts or rapid retries. We don't compare vectors — the
  // user may legitimately have just retaken the quiz from inside
  // /account, in which case we trust the existing row.
  const fiveMinAgo = new Date(Date.now() - 5 * 60_000).toISOString();
  const { data: recent } = await supabase
    .from('quiz_attempts')
    .select('id, taken_at')
    .eq('user_id', user.id)
    .gte('taken_at', fiveMinAgo)
    .limit(1)
    .maybeSingle();
  if (recent) {
    return NextResponse.json({ ok: true, skipped: 'recent attempt exists', existingId: recent.id });
  }

  // Honor the stashed taken_at when present so the trajectory reflects
  // when the user *actually* answered, not when they signed up.
  // Clamp to a sensible window (last 7 days) — anything older is
  // suspicious (stale localStorage, clock-skewed device, etc.) and
  // falls back to now.
  let takenAt: string | null = null;
  if (typeof body.taken_at === 'string') {
    const t = Date.parse(body.taken_at);
    const sevenDaysAgoMs = Date.now() - 7 * 86400_000;
    if (Number.isFinite(t) && t >= sevenDaysAgoMs && t <= Date.now() + 60_000) {
      takenAt = new Date(t).toISOString();
    }
  }

  const { data: inserted, error } = await supabase
    .from('quiz_attempts')
    .insert({
      user_id: user.id,
      vector,
      archetype,
      flavor,
      alignment_pct,
      ...(takenAt ? { taken_at: takenAt } : {}),
    })
    .select('id, taken_at')
    .single();

  if (error) {
    console.error('[claim-attempt] insert failed', error);
    return NextResponse.json({ error: 'Could not save attempt.' }, { status: 500 });
  }

  // Consent-gated research capture (best-effort; never blocks the claim).
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
    claimed: true,
    id: inserted.id,
    taken_at: inserted.taken_at,
    research_captured: captured,
  });
}
