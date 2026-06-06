// POST /api/demographics — save a user's optional self-reported demographics.
//
// Body: a partial map of field → code | null, e.g.
//   { "age_range": "25_34", "gender": null, "religion": "buddhism" }
//   - a valid code (see lib/demographics.ts) sets the field
//   - null clears the field
//   - an omitted field is left unchanged
//
// Privacy boundary (mirrors research_quiz_responses): this table holds
// CONSENTED data only. We write here only when the user's research_consent
// row is 'yes'. A request from an opted-out / undecided user is rejected
// (403) without writing — so a row in research_demographics always implies
// the user consented at the time they shared it.
//
// Anonymous users: nothing to attach a row to, so we 204 without persisting.
// The UI never shows the form to logged-out users for this reason.
//
// Best-effort by design: called from a fire-and-forget fetch in
// <DemographicsForm>. We still surface 4xx/5xx so genuine failures are
// observable, but the client doesn't block on the result.

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import {
  DEMOGRAPHIC_FIELDS,
  isValidDemographicValue,
  type DemographicField,
} from "@/lib/demographics";

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "expected an object" }, { status: 400 });
  }

  // Validate + collect only the recognized fields. null clears a field; a
  // non-null value must be an allowed code. Unknown keys are ignored.
  const update: Record<string, string | null> = {};
  for (const field of DEMOGRAPHIC_FIELDS as readonly DemographicField[]) {
    if (!(field in body)) continue;
    const value = body[field];
    if (value === null || value === "") {
      update[field] = null;
    } else if (isValidDemographicValue(field, value)) {
      update[field] = value;
    } else {
      return NextResponse.json(
        { error: `invalid value for ${field}` },
        { status: 400 },
      );
    }
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "no recognized fields" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Anonymous — nothing to persist. The form is logged-in only.
  if (!user) {
    return new NextResponse(null, { status: 204 });
  }

  // Gate on research consent so the table stays consented-only.
  const { data: consentRow, error: consentErr } = await supabase
    .from("research_consent")
    .select("consent")
    .eq("user_id", user.id)
    .maybeSingle();

  if (consentErr) {
    console.error("[demographics] consent lookup failed", consentErr);
    return NextResponse.json({ error: "could not verify consent" }, { status: 500 });
  }
  if (consentRow?.consent !== "yes") {
    return NextResponse.json(
      { error: "research consent required" },
      { status: 403 },
    );
  }

  // Upsert on the user_id PK. created_at defaults on insert and is left
  // untouched on update; updated_at always touches.
  const { error } = await supabase.from("research_demographics").upsert(
    {
      user_id: user.id,
      ...update,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (error) {
    console.error("[demographics] upsert failed", error);
    return NextResponse.json({ error: "could not save" }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
