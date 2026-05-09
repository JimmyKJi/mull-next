// Public read endpoint for the current week's editor's picks.
// Calls the SQL RPC `get_editor_picks_for_week` (which JOINs across
// the three entry tables and returns full content + author info).
// No auth required — picks are world-readable editorial content.

import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { weekKey } from '@/lib/week';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const week = url.searchParams.get('week') || weekKey();

  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc('get_editor_picks_for_week', { in_week_start: week });

  if (error) {
    console.error('[leaderboard/editor-picks GET] failed', error);
    return NextResponse.json({ error: 'Could not load picks.' }, { status: 500 });
  }

  return NextResponse.json({
    week,
    picks: data ?? [],
  });
}
