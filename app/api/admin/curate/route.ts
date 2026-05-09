// /api/admin/curate — admin-only API for managing editor's picks.
//
// GET ?week=YYYY-MM-DD&days=14&filter=dilemma
//   Returns:
//     - candidates: recent public entries that could be picked
//     - currentPicks: the three slots for the requested week (or
//       this week if none specified), with full entry content
//
// POST { week: 'YYYY-MM-DD', slot: 1|2|3, source_type, source_id, curator_note }
//   Upserts a pick into the given slot for the given week. Replaces
//   whatever was previously in that slot.
//
// DELETE ?week=YYYY-MM-DD&slot=1
//   Clears one slot.
//
// All three operations gated by isAdminUserId(user.id) — the
// authenticated user's id must be in the ADMIN_USER_IDS env var
// allowlist. Non-admins get 403.

import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { isAdminUserId } from '@/lib/admin';
import { weekKey } from '@/lib/week';

export const runtime = 'nodejs';

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: 'Not signed in.' }, { status: 401 }) };
  if (!isAdminUserId(user.id)) {
    return { error: NextResponse.json({ error: 'Not authorized.' }, { status: 403 }) };
  }
  return { user };
}

export async function GET(req: Request) {
  const gate = await requireAdmin();
  if ('error' in gate) return gate.error;

  const url = new URL(req.url);
  const week = url.searchParams.get('week') || weekKey();
  const days = Math.max(1, Math.min(60, parseInt(url.searchParams.get('days') || '14', 10) || 14));
  const filterParam = url.searchParams.get('filter');
  const filter = (filterParam === 'dilemma' || filterParam === 'diary' || filterParam === 'exercise')
    ? filterParam
    : null;

  // Use the request-scoped client (RLS allows reading public entries).
  const supabase = await createClient();

  const [candidatesRes, picksRes] = await Promise.all([
    supabase.rpc('list_curation_candidates', {
      days_back: days,
      source_filter: filter,
    }),
    supabase.rpc('get_editor_picks_for_week', { in_week_start: week }),
  ]);

  if (candidatesRes.error) {
    console.error('[admin/curate GET] candidates failed', candidatesRes.error);
    return NextResponse.json({ error: 'Could not load candidates.' }, { status: 500 });
  }
  if (picksRes.error) {
    console.error('[admin/curate GET] picks failed', picksRes.error);
    return NextResponse.json({ error: 'Could not load picks.' }, { status: 500 });
  }

  return NextResponse.json({
    week,
    candidates: candidatesRes.data ?? [],
    currentPicks: picksRes.data ?? [],
  });
}

export async function POST(req: Request) {
  const gate = await requireAdmin();
  if ('error' in gate) return gate.error;

  let body: {
    week?: string;
    slot?: number;
    source_type?: string;
    source_id?: string;
    curator_note?: string;
  };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 }); }

  const week = body.week || weekKey();
  const slot = Number(body.slot);
  const sourceType = body.source_type;
  const sourceId = body.source_id;
  const note = (body.curator_note || '').slice(0, 500);

  if (![1, 2, 3].includes(slot)) {
    return NextResponse.json({ error: 'slot must be 1, 2, or 3.' }, { status: 400 });
  }
  if (!sourceType || !['dilemma', 'diary', 'exercise'].includes(sourceType)) {
    return NextResponse.json({ error: 'source_type must be dilemma | diary | exercise.' }, { status: 400 });
  }
  if (!sourceId || !/^[0-9a-f-]{36}$/i.test(sourceId)) {
    return NextResponse.json({ error: 'source_id must be a uuid.' }, { status: 400 });
  }

  // Use the admin client so we bypass RLS on editor_picks (which
  // denies all non-service writes by design).
  const admin = createAdminClient();

  const { error } = await admin
    .from('editor_picks')
    .upsert({
      week_start: week,
      slot,
      source_type: sourceType,
      source_id: sourceId,
      curator_note: note,
      picked_by: gate.user.id,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'week_start,slot',
    });

  if (error) {
    console.error('[admin/curate POST] upsert failed', error);
    return NextResponse.json({ error: 'Could not save pick.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, week, slot });
}

export async function DELETE(req: Request) {
  const gate = await requireAdmin();
  if ('error' in gate) return gate.error;

  const url = new URL(req.url);
  const week = url.searchParams.get('week') || weekKey();
  const slot = Number(url.searchParams.get('slot'));
  if (![1, 2, 3].includes(slot)) {
    return NextResponse.json({ error: 'slot must be 1, 2, or 3.' }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from('editor_picks')
    .delete()
    .eq('week_start', week)
    .eq('slot', slot);

  if (error) {
    console.error('[admin/curate DELETE] failed', error);
    return NextResponse.json({ error: 'Could not delete pick.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
