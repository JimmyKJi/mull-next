// /dilemma/archive/[date] — the actual answer form for a past dilemma.
// Mull+ only. Shows the prompt and hint that were live on that date,
// plus a textarea form that submits to /api/dilemma/submit-archive.
//
// If the user already answered, redirects them to /account so they can see
// it in their trajectory.

import { createClient } from '@/utils/supabase/server';
import { getDailyDilemma } from '@/lib/dilemmas';
import { getUserPlan } from '@/lib/subscription';
import { getServerLocale } from '@/lib/locale-server';
import { t } from '@/lib/translations';
import LanguageSwitcher from '@/components/language-switcher';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import DilemmaArchiveForm from './archive-form';

const LAUNCH_DATE = '2026-01-01';

const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'Inter', system-ui, sans-serif";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: 'Past dilemma',
};

function isValidDateKey(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function formatDateKey(date: Date): string {
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export default async function DilemmaArchiveDatePage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  if (!isValidDateKey(date)) notFound();

  const todayKey = formatDateKey(new Date());
  if (date >= todayKey) {
    // Today or future — bounce to the regular today page.
    redirect('/dilemma');
  }
  if (date < LAUNCH_DATE) notFound();

  const supabase = await createClient();
  const locale = await getServerLocale();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?return_to=${encodeURIComponent(`/dilemma/archive/${date}`)}`);
  }

  // Tier gate.
  const { isMullPlus } = await getUserPlan(supabase, user.id);
  if (!isMullPlus) {
    redirect('/dilemma/archive');
  }

  // Already answered? Show the saved version on /account instead.
  const { data: existing } = await supabase
    .from('dilemma_responses')
    .select('id')
    .eq('user_id', user.id)
    .eq('dilemma_date', date)
    .maybeSingle();
  if (existing) {
    redirect('/account');
  }

  const dilemmaDate = new Date(`${date}T12:00:00Z`);
  const { dilemma } = getDailyDilemma(dilemmaDate);

  const dateFmt = locale === 'en' ? 'en-GB' : locale;
  const dateLabel = dilemmaDate.toLocaleDateString(dateFmt, {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '60px 24px 120px' }}>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 36,
        gap: 16,
        flexWrap: 'wrap'
      }}>
        <Link href="/" style={{
          fontFamily: serif, fontSize: 28, fontWeight: 500,
          color: '#221E18', textDecoration: 'none', letterSpacing: '-0.5px'
        }}>
          Mull<span style={{ color: '#B8862F' }}>.</span>
        </Link>
        <nav style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <LanguageSwitcher initial={locale} />
          <Link href="/dilemma/archive" style={{
            fontFamily: sans, fontSize: 13, color: '#4A4338',
            textDecoration: 'none', letterSpacing: 0.3,
          }}>
            ← {t('archive.back_to_archive', locale)}
          </Link>
        </nav>
      </header>

      <div style={{
        fontFamily: sans, fontSize: 11, fontWeight: 600, color: '#8C6520',
        textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 14,
      }}>
        {t('archive.past_eyebrow', locale)} · {dateLabel}
      </div>

      <h1 style={{
        fontFamily: serif, fontSize: 36, fontWeight: 500,
        margin: '0 0 16px', letterSpacing: '-0.01em', lineHeight: 1.2,
      }}>
        {dilemma.prompt}
      </h1>

      {dilemma.hint && (
        <p style={{
          fontFamily: serif, fontStyle: 'italic',
          fontSize: 17, color: '#4A4338', marginBottom: 32,
        }}>
          {dilemma.hint}
        </p>
      )}

      <DilemmaArchiveForm targetDate={date} locale={locale} />

      <p style={{
        fontFamily: sans, fontSize: 12, color: '#8C6520',
        marginTop: 48, opacity: 0.75, textAlign: 'center', letterSpacing: 0.3,
      }}>
        {t('archive.past_footer_note', locale)}
      </p>
    </main>
  );
}
