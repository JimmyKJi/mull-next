// GET /api/admin/research/export?format=json|csv
//
// Downloads the consented research corpus (research_quiz_responses) for
// offline analysis. Admin-only. Anonymized by construction: we never
// select user_id, so the export carries no identifier — matching the
// promise on /consent that research data is never tied to an account.
//
//   format=json (default) — full fidelity: one object per response with
//                            the nested answers array + 16-D vector.
//   format=csv            — flat: scalar fields + 16 dimension columns +
//                            the answers array as a JSON string. Loads
//                            straight into a spreadsheet / pandas.
//
// Reads via the SERVICE-ROLE client (bypasses RLS) because this is an
// aggregate maintainer tool. The RLS policies on the table only let a
// user read their OWN rows; the cross-user research read is intentional
// and gated here by isAdminUserId instead.

import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { isAdminUserId } from '@/lib/admin';
import { DIM_KEYS } from '@/lib/dimensions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Row = {
  mode: string | null;
  question_count: number | null;
  answers: unknown;
  vector: unknown;
  archetype: string | null;
  alignment_pct: number | null;
  created_at: string | null;
};

export async function GET(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdminUserId(user.id)) {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }

  const url = new URL(req.url);
  const format = url.searchParams.get('format') === 'csv' ? 'csv' : 'json';

  const admin = createAdminClient();
  // Note: NO user_id in the select — the export is deliberately anonymized.
  const { data, error } = await admin
    .from('research_quiz_responses')
    .select('mode, question_count, answers, vector, archetype, alignment_pct, created_at')
    .order('created_at', { ascending: true })
    .limit(50000);

  if (error) {
    console.error('[research/export] query failed', error);
    return NextResponse.json({ error: 'Could not build export.' }, { status: 500 });
  }

  const rows = (data as Row[] | null) || [];
  const stamp = new Date().toISOString().slice(0, 10);

  if (format === 'json') {
    const payload = {
      schema: 'mull/research-corpus@v1',
      exported_at: new Date().toISOString(),
      note: 'Anonymized consented quiz responses. No user identifiers. Per-question answer trails + 16-D vectors.',
      dimension_order: DIM_KEYS,
      count: rows.length,
      responses: rows,
    };
    return new NextResponse(JSON.stringify(payload, null, 2), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="mull-research-${stamp}.json"`,
        'Cache-Control': 'no-store',
      },
    });
  }

  // CSV. Header: scalars + one column per dimension + answers JSON.
  const header = [
    'created_at',
    'mode',
    'question_count',
    'archetype',
    'alignment_pct',
    ...DIM_KEYS.map((k) => `dim_${k}`),
    'answers_json',
  ];

  const esc = (v: unknown): string => {
    const s = v === null || v === undefined ? '' : String(v);
    // Quote if it contains comma, quote, or newline; double internal quotes.
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const lines = [header.join(',')];
  for (const r of rows) {
    const vec = Array.isArray(r.vector) ? r.vector : [];
    const dims = DIM_KEYS.map((_, i) => {
      const n = Number(vec[i]);
      return Number.isFinite(n) ? n.toFixed(4) : '';
    });
    const cells = [
      esc(r.created_at),
      esc(r.mode),
      esc(r.question_count),
      esc(r.archetype),
      esc(r.alignment_pct),
      ...dims,
      esc(JSON.stringify(r.answers ?? [])),
    ];
    lines.push(cells.join(','));
  }

  return new NextResponse(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="mull-research-${stamp}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
