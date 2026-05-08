// Public profile search. Returns profiles whose handle or display_name
// matches the query string (ILIKE prefix + substring). Privacy-respecting:
// only profiles in the public_profiles table can match — those are by
// definition the ones the user opted into showing publicly.
//
// Lightweight, no auth required (the discovery surface should be open
// for anyone curious about the network of public minds).

import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get('q') || '').trim().toLowerCase();
  const limit = Math.min(20, Math.max(1, parseInt(url.searchParams.get('limit') || '10', 10)));

  if (q.length < 1) {
    return NextResponse.json({ results: [] });
  }
  if (q.length > 64) {
    return NextResponse.json({ error: 'Query too long.' }, { status: 400 });
  }

  const supabase = await createClient();

  // ILIKE for case-insensitive substring match on either column.
  // The unauthenticated client respects the public_profiles read RLS
  // policy that the table itself enforces (profiles are world-readable
  // by design — the whole point of public profiles).
  const escaped = q.replace(/[%_]/g, '\\$&'); // escape SQL wildcards
  const { data, error } = await supabase
    .from('public_profiles')
    .select('handle, display_name, bio')
    .eq('is_searchable', true)
    .or(`handle.ilike.%${escaped}%,display_name.ilike.%${escaped}%`)
    .limit(limit);

  if (error) {
    console.error('[profile/search] failed', error);
    return NextResponse.json({ error: 'Search failed.' }, { status: 500 });
  }

  // Rank: exact handle match first, then handle prefix, then display_name
  // prefix, then anything-else.
  const ranked = (data ?? []).slice().sort((a, b) => {
    const score = (p: typeof a) => {
      const h = p.handle.toLowerCase();
      const n = (p.display_name || '').toLowerCase();
      if (h === q) return 0;
      if (h.startsWith(q)) return 1;
      if (n.startsWith(q)) return 2;
      if (h.includes(q)) return 3;
      return 4;
    };
    return score(a) - score(b);
  });

  return NextResponse.json({
    results: ranked.map(r => ({
      handle: r.handle,
      display_name: r.display_name,
      bio: r.bio,
      url: `/u/${r.handle}`,
    })),
  });
}
