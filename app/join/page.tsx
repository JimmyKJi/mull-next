// /join — manual invite-code entry page.
//
// Students who got the code another way (verbal, on a slide, etc.)
// land here, type the 6-char code, and the form POSTs to
// /api/classes/join. Signed-out users get sent to signup first;
// the code is preserved through the round-trip via the next= param.

import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import { getServerLocale } from '@/lib/locale-server';
import { t, type Locale } from '@/lib/translations';
import MullWordmark from '@/components/mull-wordmark';
import JoinForm from './join-form';

export const metadata: Metadata = {
  title: 'Join a class · Mull',
  robots: { index: false, follow: false },
};

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";
const serif = "var(--font-prose)";

export default async function JoinPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/join');

  const locale = await getServerLocale();

  return (
    <main className="mx-auto max-w-[540px] px-6 pb-32 pt-10 sm:px-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <MullWordmark />
        <Link href="/classes" style={{
          fontFamily: pixel, fontSize: 11,
          color: 'var(--color-ink-soft)', textDecoration: 'none',
          letterSpacing: 0.4, textTransform: 'uppercase',
        }}>
          ◂ {t('join.your_classes', locale)}
        </Link>
      </div>

      <div style={{
        fontFamily: pixel,
        fontSize: 12,
        color: 'var(--color-acc-deep)',
        textTransform: 'uppercase',
        letterSpacing: '0.18em',
        marginBottom: 14,
      }}>
        ▸ {t('join.eyebrow', locale)}
      </div>
      <h1 style={{
        fontFamily: pixel,
        fontSize: 26,
        margin: '0 0 14px',
        color: 'var(--color-ink)',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        textShadow: '3px 3px 0 #2F5D5C',
        lineHeight: 1.1,
      }}>
        {t('join.heading', locale)}
      </h1>
      <p style={{
        fontFamily: serif,
        fontStyle: 'italic',
        fontSize: 16,
        color: 'var(--color-ink-soft)',
        margin: '0 0 26px',
        lineHeight: 1.55,
      }}>
        {t('join.intro_before', locale)}
        <strong style={{ fontStyle: 'normal' }}> A2B3C4</strong>
        {t('join.intro_after', locale)}
      </p>

      <JoinForm initialCode="" locale={locale} />
    </main>
  );
}
