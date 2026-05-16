// POST /api/quiz/save
//
// Saves a freshly-finished quiz attempt to the `quiz_attempts` table.
// Companion to /api/account/claim-attempt — that one handles claiming
// a guest-stashed result post-signup; this one handles the authed
// happy path where the user is already signed in when the quiz finishes.
//
// Body (validated):
//   { vector: number[16], archetype: string, flavor?: string,
//     alignment_pct: number }
//
// Auth: requires a signed-in user. Returns 401 otherwise — the client
// is expected to stash to localStorage instead (then PendingAttemptClaimer
// will pick it up after signup).
//
// Idempotency: the same 5-minute dedupe window as claim-attempt — if
// the user has a quiz attempt saved in the last 5 minutes, we treat
// this as a duplicate (rapid retry / double-mount) and skip.

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export const runtime = "nodejs";

type Payload = {
  vector?: unknown;
  archetype?: unknown;
  flavor?: unknown;
  alignment_pct?: unknown;
};

export async function POST(req: Request) {
  let body: Payload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (!Array.isArray(body.vector) || body.vector.length !== 16) {
    return NextResponse.json({ error: "Invalid vector shape." }, { status: 400 });
  }
  const vector = body.vector.map((v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  });

  const archetype = typeof body.archetype === "string" ? body.archetype.trim() : "";
  if (!archetype) {
    return NextResponse.json({ error: "Missing archetype." }, { status: 400 });
  }

  const flavor =
    typeof body.flavor === "string" && body.flavor.trim()
      ? body.flavor.trim()
      : null;

  const pctRaw = Number(body.alignment_pct);
  const alignment_pct = Number.isFinite(pctRaw)
    ? Math.max(0, Math.min(100, Math.round(pctRaw)))
    : 0;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    // Client should stash to localStorage and let
    // PendingAttemptClaimer handle it after signup.
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  // 5-minute dedupe — matches claim-attempt's behavior. Protects
  // against double-mounts, fast retries, or the user navigating away
  // and back.
  const fiveMinAgo = new Date(Date.now() - 5 * 60_000).toISOString();
  const { data: recent } = await supabase
    .from("quiz_attempts")
    .select("id, taken_at")
    .eq("user_id", user.id)
    .gte("taken_at", fiveMinAgo)
    .limit(1)
    .maybeSingle();
  if (recent) {
    return NextResponse.json({
      ok: true,
      skipped: "recent attempt exists",
      existingId: recent.id,
    });
  }

  const { data: inserted, error } = await supabase
    .from("quiz_attempts")
    .insert({
      user_id: user.id,
      vector,
      archetype,
      flavor,
      alignment_pct,
    })
    .select("id, taken_at")
    .single();

  if (error) {
    console.error("[quiz/save] insert failed", error);
    return NextResponse.json({ error: "Could not save attempt." }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    saved: true,
    id: inserted.id,
    taken_at: inserted.taken_at,
  });
}
