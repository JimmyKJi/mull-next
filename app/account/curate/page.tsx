// /account/curate — admin-only UI for setting this week's editor's
// picks. Shows the three slots at the top + a feed of recent public
// entries from the past 14 days below. Click "Pick into slot N" to
// set; click ✕ on a current pick to clear it.
//
// Server-rendered shell does the admin gate (redirects non-admins
// to /account); the actual interactive UI is a client component.

import { createClient } from '@/utils/supabase/server';
import { isAdminUserId } from '@/lib/admin';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import CurationPanel from './curation-panel';

const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'Inter', system-ui, sans-serif";

export const metadata: Metadata = {
  title: "Editor's picks — curate",
  robots: { index: false, follow: false },
};

export default async function CuratePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?return_to=/account/curate');
  if (!isAdminUserId(user.id)) redirect('/account');

  return (
    <main style={{ maxWidth: 880, margin: '40px auto 80px', padding: '0 24px' }}>
      <div style={{
        fontFamily: sans, fontSize: 11, fontWeight: 600,
        color: '#8C6520', textTransform: 'uppercase',
        letterSpacing: '0.18em', marginBottom: 12,
      }}>
        Admin
      </div>
      <h1 style={{
        fontFamily: serif, fontSize: 38, fontWeight: 500,
        margin: '0 0 10px', letterSpacing: '-0.4px', lineHeight: 1.1,
      }}>
        Curate this week's picks
      </h1>
      <p style={{
        fontFamily: serif, fontStyle: 'italic',
        fontSize: 17, color: '#4A4338',
        margin: '0 0 28px', lineHeight: 1.55,
      }}>
        Pick three public entries from the last two weeks. They show up on the leaderboard's <Link href="/search" style={{ color: '#8C6520' }}>Editor's picks</Link> tab until you replace them next week.
      </p>

      <CurationPanel />

      <p style={{
        marginTop: 36, fontFamily: sans, fontSize: 13, color: '#8C6520',
        opacity: 0.85, lineHeight: 1.5,
      }}>
        Picks are world-readable. Authors are linked via their public profile, so make sure the entries are ones the writers would be glad to be highlighted for.
      </p>
    </main>
  );
}
