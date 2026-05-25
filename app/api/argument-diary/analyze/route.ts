// POST /api/argument-diary/analyze
//
// One-shot Haiku call that takes the user's account of a real
// argument and returns three things:
//   1. A steelman of the OTHER side (the person they argued with)
//   2. Two specific fallacies / weaknesses in the USER's framing
//   3. Three kindred philosophers (from the corpus) and a one-line
//      sketch of how each would approach the disagreement
//
// Reuses the Anthropic API key + Haiku model the rest of Mull uses.

import { NextResponse } from "next/server";
import { aiGate } from "@/lib/rate-limit";
import { createClient } from "@/utils/supabase/server";

const HAIKU_MODEL = "claude-haiku-4-5";

type Body = {
  account: string;
  context?: string;
};

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI not configured." },
      { status: 500 },
    );
  }

  const body = (await req.json().catch(() => null)) as Body | null;
  const account = body?.account?.trim();
  const context = body?.context?.trim();
  if (!account) {
    return NextResponse.json({ error: "Missing account." }, { status: 400 });
  }
  if (account.length > 4000) {
    return NextResponse.json(
      { error: "Account too long (4000 char max)." },
      { status: 400 },
    );
  }

  // Per-user + global spend gate before the Haiku call.
  const supabaseForUser = await createClient();
  const { data: { user } } = await supabaseForUser.auth.getUser();
  const gate = await aiGate(req, { bucket: "argument_diary", userId: user?.id });
  if (!gate.ok) {
    return NextResponse.json({ error: gate.message }, { status: gate.status });
  }

  const system = `You are Mull's argument-diary helper. Read a user's account of a real-world argument they had. Return a JSON object with EXACTLY this shape:

{
  "steelman": "<200-300 word steelman of the OTHER party's view, written charitably, as if you held it>",
  "fallacies": [
    { "name": "<specific fallacy or weakness in the user's framing>", "explanation": "<2-3 sentence specific explanation referencing what the user wrote>" },
    { "name": "<another>", "explanation": "<another>" }
  ],
  "kindred": [
    { "philosopher": "<famous philosopher name>", "take": "<one sentence on how this thinker would approach the disagreement>" },
    { "philosopher": "<another>", "take": "<another>" },
    { "philosopher": "<another>", "take": "<another>" }
  ]
}

Rules:
- Be specific, not generic. Reference what the user actually wrote.
- Be tough but fair on the user — they're here for honest feedback.
- The steelman should be the version the other party would recognize as theirs.
- Fallacies should name the move (e.g. "straw man", "appeal to consequences", "moving the goalposts", "false dichotomy", "selection bias", "motte and bailey", "ad hominem", "argument from ignorance", etc.) AND explain how it appeared.
- Kindred philosophers should be 3 different traditions — picking only Stoics, or only Western analytic philosophers, is a fail. Aim for breadth across the canon.
- Return ONLY the JSON. No prose before or after.`;

  const userMessage = `Here is my account of an argument I had recently:\n\n${account}${
    context ? `\n\nContext: ${context}` : ""
  }`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: HAIKU_MODEL,
      max_tokens: 1500,
      system,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("[argument-diary] Haiku error", res.status, errText);
    return NextResponse.json(
      { error: "AI call failed. Try again." },
      { status: 502 },
    );
  }

  const data = (await res.json()) as {
    content?: { type: string; text?: string }[];
    error?: { message?: string };
  };
  if (data.error) {
    return NextResponse.json(
      { error: "AI errored." },
      { status: 502 },
    );
  }

  const rawText = data.content?.find((c) => c.type === "text")?.text ?? "";
  // Try to extract the JSON block (Haiku sometimes prefaces).
  const start = rawText.indexOf("{");
  const end = rawText.lastIndexOf("}");
  if (start < 0 || end <= start) {
    return NextResponse.json(
      { error: "Couldn't parse AI output. Try again." },
      { status: 502 },
    );
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText.slice(start, end + 1));
  } catch {
    return NextResponse.json(
      { error: "Malformed AI output. Try again." },
      { status: 502 },
    );
  }
  return NextResponse.json({ analysis: parsed });
}
