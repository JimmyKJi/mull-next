import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id: string = (body?.id ?? '').toString();
    if (!id) return NextResponse.json({ error: 'Missing id.' }, { status: 400 });

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

    const { error } = await supabase
      .from('diary_entries')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('[diary] delete failed', error);
      return NextResponse.json({ error: 'Could not delete.' }, { status: 500 });
    }
    return NextResponse.json({ deleted: true });
  } catch (e) {
    console.error('[diary] delete error', e);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
