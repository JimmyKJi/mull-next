// /account/curate — admin-only UI for setting this week's editor's
// picks. v3 pixel chrome restyle.

import { createClient } from '@/utils/supabase/server';
import { isAdminUserId } from '@/lib/admin';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import CurationPanel from './curation-panel';
import { PixelPageHeader } from '@/components/pixel-window';

export const metadata: Metadata = {
  title: "Editor's picks — curate",
  robots: { index: false, follow: false },
};

export default async function CuratePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?return_to=/account/curate');
  if (!isAdminUserId(user.id)) redirect('/account');

  return (
    <main className="mx-auto max-w-[920px] px-6 pb-32 pt-10 sm:px-10">
      <PixelPageHeader
        eyebrow="▶ ADMIN · EDITOR PICKS"
        title="CURATE THIS WEEK"
        subtitle={
          <p className="text-[16px] italic" style={{ fontFamily: 'var(--font-prose)' }}>
            Pick three public entries from the last two weeks. They show up
            on the leaderboard&rsquo;s{' '}
            <Link
              href="/search"
              className="not-italic text-[#8C6520] underline decoration-[#B8862F]/40 underline-offset-3 hover:decoration-[#8C6520]"
            >
              Editor&rsquo;s picks
            </Link>{' '}
            tab until you replace them next week.
          </p>
        }
      />

      <CurationPanel />

      <p className="mt-9 text-[13px] leading-[1.6] text-[#8C6520] opacity-90">
        Picks are world-readable. Authors are linked via their public
        profile, so make sure the entries are ones the writers would be
        glad to be highlighted for.
      </p>
    </main>
  );
}
