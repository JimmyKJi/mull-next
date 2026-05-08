import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

const HANDLE_RE = /^[a-z0-9_-]{3,32}$/;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const handle: string = (body?.handle ?? '').toString().toLowerCase().trim();
    const displayName: string = (body?.display_name ?? '').toString().trim();
    const bio: string = (body?.bio ?? '').toString().trim();
    const showArchetype = !!body?.show_archetype;
    const showDimensions = !!body?.show_dimensions;
    const showMap = !!body?.show_map;
    const showStreak = !!body?.show_streak;

    if (!handle) {
      return NextResponse.json({ error: 'Handle is required.' }, { status: 400 });
    }
    if (!HANDLE_RE.test(handle)) {
      return NextResponse.json({
        error: 'Handle must be 3-32 chars: lowercase letters, numbers, underscore, or dash.'
      }, { status: 400 });
    }
    if (displayName.length > 80) {
      return NextResponse.json({ error: 'Display name too long (max 80 chars).' }, { status: 400 });
    }
    if (bio.length > 280) {
      return NextResponse.json({ error: 'Bio too long (max 280 chars).' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

    // Upsert by user_id (one profile per user)
    const { error: upsertError, data: saved } = await supabase
      .from('public_profiles')
      .upsert({
        user_id: user.id,
        handle,
        display_name: displayName || null,
        bio: bio || null,
        show_archetype: showArchetype,
        show_dimensions: showDimensions,
        show_map: showMap,
        show_streak: showStreak,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
      .select('handle')
      .single();

    if (upsertError) {
      // 23505 is unique_violation — almost certainly the handle is taken
      if (upsertError.code === '23505') {
        return NextResponse.json({ error: 'That handle is already taken.' }, { status: 409 });
      }
      console.error('[profile] upsert failed', upsertError);
      return NextResponse.json({ error: 'Could not save profile.' }, { status: 500 });
    }

    return NextResponse.json({ saved: true, handle: saved.handle, url: `/u/${saved.handle}` });
  } catch (e) {
    console.error('[profile] error', e);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

    const { error } = await supabase
      .from('public_profiles')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      console.error('[profile] delete failed', error);
      return NextResponse.json({ error: 'Could not delete profile.' }, { status: 500 });
    }
    return NextResponse.json({ deleted: true });
  } catch (e) {
    console.error('[profile] delete error', e);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
