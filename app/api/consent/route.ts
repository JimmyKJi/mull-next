// POST /api/consent — record a user's research-consent decision.
//
// v1 behavior: best-effort. If the user is signed in, write the
// preference to a 'research_consent' column on the public.profiles
// row (if the column exists). Otherwise, accept the request and
// return 204 without persisting — the client-side localStorage is
// the authoritative store for anonymous users.
//
// Why best-effort: this endpoint is called from a fire-and-forget
// fetch in <ResearchConsentGate>. Returning success even when DB
// write isn't possible keeps the UX smooth. A future migration can
// add the column + start enforcing it server-side; until then this
// keeps the integration point in place.
//
// Schema TODO (deferred — flagged in NEXT.md):
//   ALTER TABLE public.profiles
//     ADD COLUMN research_consent TEXT
//       CHECK (research_consent IN ('yes', 'no'));
//   GRANT UPDATE (research_consent) ON public.profiles TO authenticated;

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

  // Try to persist for signed-in users. We're tolerant of the column
  // not existing yet — the update will error and we return ok anyway.
  // localStorage on the client is the v1 source of truth.
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    try {
      await supabase
        .from("profiles")
        .update({ research_consent: choice })
        .eq("user_id", user.id);
    } catch {
      // Column may not exist yet — see schema TODO above. Swallow.
    }
  }

  return new NextResponse(null, { status: 204 });
}
