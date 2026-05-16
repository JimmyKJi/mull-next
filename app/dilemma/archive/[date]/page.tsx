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
    <main className="mx-auto max-w-[820px] px-6 pb-32 pt-10 sm:px-10">
      <div className="mb-6 flex items-center justify-end gap-3">
        <LanguageSwitcher initial={locale} />
        <Link
          href="/dilemma/archive"
          className="text-[13px] text-[#4A4338] hover:text-[#221E18] hover:underline"
        >
          ← {t('archive.back_to_archive', locale)}
        </Link>
      </div>

      <div
        className="flex flex-wrap items-center gap-3 text-[10px] tracking-[0.22em] text-[#8C6520]"
        style={{ fontFamily: 'var(--font-pixel-display)' }}
      >
        <span aria-hidden className="inline-block h-2 w-2 bg-[#B8862F]" />
        <span>▶ {t('archive.past_eyebrow', locale).toUpperCase()}</span>
        <span className="opacity-60">·</span>
        <span className="text-[#221E18]">{dateLabel.toUpperCase()}</span>
      </div>

      <div
        className="mt-7 border-4 border-[#221E18] bg-[#FFFCF4]"
        style={{ boxShadow: '6px 6px 0 0 #8C6520' }}
      >
        <div
          className="border-b-4 border-[#221E18] bg-[#221E18] px-4 py-2 text-[10px] tracking-[0.22em] text-[#F8EDC8]"
          style={{ fontFamily: 'var(--font-pixel-display)' }}
        >
          ▶ PAST QUESTION
        </div>
        <div className="px-6 py-7 sm:px-8 sm:py-9">
          <h1
            className="text-[24px] font-medium leading-[1.3] text-[#221E18] sm:text-[28px] md:text-[32px]"
            style={{ fontFamily: 'var(--font-prose)' }}
          >
            {dilemma.prompt}
          </h1>
          {dilemma.hint ? (
            <p
              className="mt-5 border-l-4 px-4 py-2 text-[15.5px] italic leading-[1.55] text-[#4A4338]"
              style={{ borderColor: '#B8862F', fontFamily: 'var(--font-prose)' }}
            >
              {dilemma.hint}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-8">
        <DilemmaArchiveForm targetDate={date} locale={locale} />
      </div>

      <p className="mt-12 text-center text-[12px] tracking-[0.16em] text-[#8C6520] opacity-75">
        {t('archive.past_footer_note', locale)}
      </p>

      {/* Back-navigation footer. Same chunky pixel-chip pattern as
          the diary detail + exercise detail pages — paired with the
          today's-dilemma path for users who'd rather catch up live. */}
      <nav
        aria-label="Continue elsewhere"
        className="mt-10 flex flex-wrap justify-center gap-3 border-t-2 border-dashed border-[#D6CDB6] pt-6"
      >
        <Link
          href="/dilemma/archive"
          className="pixel-press inline-block border-[3px] border-[#221E18] bg-[#FFFCF4] px-4 py-2.5 text-[11px] tracking-[0.08em] text-[#2F5D5C] no-underline"
          style={{
            fontFamily: 'var(--font-pixel-display)',
            boxShadow: '3px 3px 0 0 #2F5D5C',
            textTransform: 'uppercase',
            transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end)',
          }}
        >
          ◂ ALL PAST DILEMMAS
        </Link>
        <Link
          href="/dilemma"
          className="pixel-press inline-block border-[3px] border-[#221E18] bg-[#221E18] px-4 py-2.5 text-[11px] tracking-[0.08em] text-[#FAF6EC] no-underline"
          style={{
            fontFamily: 'var(--font-pixel-display)',
            boxShadow: '3px 3px 0 0 #B8862F',
            textTransform: 'uppercase',
            transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end)',
          }}
        >
          ▸ TODAY&apos;S DILEMMA
        </Link>
      </nav>
    </main>
  );
}
