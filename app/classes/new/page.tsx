// /classes/new — teacher creates a class.
//
// Server shell + ClassCreateForm client component. The form POSTs
// to /api/classes/create and on success redirects to /classes/<id>
// where the teacher can copy the invite link to share.

import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import MullWordmark from '@/components/mull-wordmark';
import { getServerLocale } from '@/lib/locale-server';
import { t } from '@/lib/translations';
import ClassCreateForm from './class-create-form';

export const metadata: Metadata = {
  title: 'Create a class · Mull',
  robots: { index: false, follow: false },
};

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";
const serif = "var(--font-prose)";

export default async function ClassCreatePage() {
  const locale = await getServerLocale();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/classes/new');

  return (
    <main className="mx-auto max-w-[640px] px-6 pb-32 pt-10 sm:px-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <MullWordmark />
        <Link href="/classes" style={{
          fontFamily: pixel,
          fontSize: 11,
          color: '#4A4338',
          textDecoration: 'none',
          letterSpacing: 0.4,
          textTransform: 'uppercase',
        }}>
          ◂ {t('cls.nav_your_classes', locale)}
        </Link>
      </div>

      <div style={{
        fontFamily: pixel,
        fontSize: 12,
        color: '#8C6520',
        textTransform: 'uppercase',
        letterSpacing: '0.18em',
        marginBottom: 14,
      }}>
        ▸ {t('cls.new_eyebrow', locale)}
      </div>
      <h1 style={{
        fontFamily: pixel,
        fontSize: 28,
        margin: '0 0 14px',
        color: '#221E18',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        textShadow: '3px 3px 0 #B8862F',
        lineHeight: 1.1,
      }}>
        {t('cls.new_title', locale)}
      </h1>
      <p style={{
        fontFamily: serif,
        fontStyle: 'italic',
        fontSize: 16,
        color: '#4A4338',
        margin: '0 0 28px',
        lineHeight: 1.55,
      }}>
        {t('cls.new_intro', locale)}
      </p>

      <ClassCreateForm locale={locale} />
    </main>
  );
}
