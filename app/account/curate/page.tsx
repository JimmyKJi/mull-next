// /account/curate — admin-only UI for setting this week's editor's
// picks. v3 pixel chrome restyle.

import { createClient } from '@/utils/supabase/server';
import { isAdminUserId } from '@/lib/admin';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import CurationPanel from './curation-panel';
import { PixelPageHeader } from '@/components/pixel-window';
import { getServerLocale } from '@/lib/locale-server';
import { t } from '@/lib/translations';

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

  const locale = await getServerLocale();
  const linkLabel = t('crt.subtitle_picks_link', locale);
  const subtitleParts = t('crt.subtitle', locale, { picks: linkLabel }).split(linkLabel);

  return (
    <main className="mx-auto max-w-[920px] px-6 pb-32 pt-10 sm:px-10">
      <PixelPageHeader
        eyebrow={t('crt.header_eyebrow', locale)}
        title={t('crt.header_title', locale)}
        subtitle={
          <p className="text-[16px] italic" style={{ fontFamily: 'var(--font-editorial)' }}>
            {subtitleParts[0]}
            <Link
              href="/search"
              className="not-italic text-acc-deep underline decoration-acc/40 underline-offset-3 hover:decoration-acc-deep"
            >
              {linkLabel}
            </Link>
            {subtitleParts.slice(1).join(linkLabel)}
          </p>
        }
      />

      <CurationPanel locale={locale} />

      <p className="mt-9 text-[13px] leading-[1.6] text-acc-deep opacity-90">
        {t('crt.footer_note', locale)}
      </p>
    </main>
  );
}
