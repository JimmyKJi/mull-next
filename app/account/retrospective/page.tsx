// /account/retrospective — yearly retrospective essay (Mull+ feature).
// v3 pixel chrome restyle.

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { getServerLocale } from '@/lib/locale-server';
import { t } from '@/lib/translations';
import LanguageSwitcher from '@/components/language-switcher';
import RetrospectivePanel from './retrospective-panel';
import { PixelPageHeader } from '@/components/pixel-window';

export default async function RetrospectivePage() {
  const supabase = await createClient();
  const locale = await getServerLocale();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return (
    <main className="mx-auto max-w-[820px] px-6 pb-32 pt-10 sm:px-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <Link
          href="/account"
          className="text-[13px] text-[#4A4338] hover:text-[#221E18] hover:underline"
        >
          ← Account
        </Link>
        <LanguageSwitcher initial={locale} />
      </div>

      <PixelPageHeader
        eyebrow={`▶ ${t('retro.eyebrow', locale).toUpperCase()}`}
        title="YEARLY RETROSPECTIVE"
        subtitle={
          <p className="text-[16px] italic" style={{ fontFamily: 'var(--font-prose)' }}>
            {t('retro.subtitle', locale)}
          </p>
        }
      />

      <RetrospectivePanel locale={locale} />

      <p className="mt-12 text-[12px] leading-[1.6] text-[#8C6520] opacity-75">
        {t('retro.dogfood_note', locale)}
      </p>
    </main>
  );
}
