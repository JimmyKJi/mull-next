// /account/profile — public profile + data controls.
// v3 pixel chrome restyle. Form components (ProfileForm, DataControls)
// kept as-is since they have their own internal styling already.

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import ProfileForm from './profile-form';
import DataControls from './data-controls';
import { getServerLocale } from '@/lib/locale-server';
import { t } from '@/lib/translations';
import LanguageSwitcher from '@/components/language-switcher';
import { PixelPageHeader } from '@/components/pixel-window';

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

type ProfileRow = {
  handle: string;
  display_name: string | null;
  bio: string | null;
  show_archetype: boolean;
  show_dimensions: boolean;
  show_map: boolean;
  show_streak: boolean;
  is_searchable: boolean;
};

export default async function ProfileSettingsPage() {
  const supabase = await createClient();
  const locale = await getServerLocale();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('public_profiles')
    .select(
      'handle, display_name, bio, show_archetype, show_dimensions, show_map, show_streak, is_searchable',
    )
    .eq('user_id', user.id)
    .maybeSingle<ProfileRow>();

  return (
    <main className="mx-auto max-w-[760px] px-6 pb-32 pt-10 sm:px-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <Link
          href="/account"
          className="text-[13px] text-[#4A4338] hover:text-[#221E18] hover:underline"
        >
          ← {t('nav.account', locale)}
        </Link>
        <LanguageSwitcher initial={locale} />
      </div>

      <PixelPageHeader
        eyebrow={`▶ ${t('profile.eyebrow', locale).toUpperCase()}`}
        title="PUBLIC PROFILE"
        subtitle={
          <p className="text-[16px] italic" style={{ fontFamily: 'var(--font-prose)' }}>
            {t('profile.subtitle_html', locale, {
              code: 'mull.world/u/<your-handle>',
            })}
          </p>
        }
      />

      <ProfileForm initial={profile} userEmail={user.email || ''} locale={locale} />

      <p className="mt-9 text-[12px] leading-[1.6] text-[#8C6520] opacity-80">
        {t('profile.privacy_footer', locale)}
      </p>

      <DataControls locale={locale} />
    </main>
  );
}
