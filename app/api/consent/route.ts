// POST /api/consent — record a user's research-consent decision.
//
// Body: { research_consent: "yes" | "no" | null }
//   "yes" / "no"  → upsert the choice into research_consent.
//   null          → reset (delete the row); the user goes back to
//                   "undecided" and the gate will ask again next time.
//
// Anonymous users: there's no row to attach a decision to, so we accept
// the request and return 204 without persisting. localStorage on the
// client (key `mull.research_consent`) is the source of truth for them —
// and anonymous quiz attempts aren't saved server-side anyway (the
// save route 401s for guests), so there's nothing to gate.
//
// Signed-in users: we upsert research_consent (RLS-bound, one row per
// user). This is what /admin/research counts as "opted in", and what
// /api/quiz/save reads to decide whether to capture per-question answers.
//
// Best-effort by design: this is called from a fire-and-forget fetch in
// <ResearchConsentGate> and <ConsentToggle>. We still surface a 500 on a
// genuine DB error so the rare failure is observable, but the client
// never awaits the result — the localStorage write already happened.

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

type Body = {
  research_consent?: "yes" | "no" | null;
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const choice = body.research_consent;
  if (choice !== "yes" && choice !== "no" && choice !== null) {
    return NextResponse.json(
      { error: "research_consent must be 'yes', 'no', or null" },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Anonymous — nothing to persist. localStorage is authoritative.
  if (!user) {
    return new NextResponse(null, { status: 204 });
  }

  if (choice === null) {
    // Reset → remove the row entirely. Next gate view asks again.
    const { error } = await supabase
      .from("research_consent")
      .delete()
      .eq("user_id", user.id);
    if (error) {
      console.error("[consent] delete failed", error);
      return NextResponse.json({ error: "could not reset" }, { status: 500 });
    }
    return new NextResponse(null, { status: 204 });
  }

  // Upsert. On insert, decided_at defaults to now(); on conflict we only
  // touch consent + updated_at, so decided_at keeps the original first
  // decision time. onConflict on the user_id PK.
  const { error } = await supabase
    .from("research_consent")
    .upsert(
      {
        user_id: user.id,
        consent: choice,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );

  if (error) {
    console.error("[consent] upsert failed", error);
    return NextResponse.json({ error: "could not save" }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
