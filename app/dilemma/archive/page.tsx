// /dilemma/archive — past daily dilemmas the user can browse and (if Mull+)
// answer. Renders chronologically from yesterday going back to LAUNCH_DATE,
// with each row showing the prompt, hint, and the user's status for that
// date (answered / unanswered / locked-by-tier).
//
// LAUNCH_DATE is duplicated in app/api/dilemma/submit-archive/route.ts —
// keep them in sync.

import { createClient } from '@/utils/supabase/server';
import { getDailyDilemma } from '@/lib/dilemmas';
import { getUserPlan } from '@/lib/subscription';
import { getServerLocale } from '@/lib/locale-server';
import { t } from '@/lib/translations';
import LanguageSwitcher from '@/components/language-switcher';
import Link from 'next/link';
import type { Metadata } from 'next';
import { PixelPageHeader } from '@/components/pixel-window';

const LAUNCH_DATE = '2026-01-01';
const PAGE_SIZE = 30;

const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'Inter', system-ui, sans-serif";

// Private to the user — don't surface in search.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: 'Dilemma archive',
};

function formatDateKey(date: Date): string {
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export default async function DilemmaArchivePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || '1', 10) || 1);
  const supabase = await createClient();
  const locale = await getServerLocale();
  const { data: { user } } = await supabase.auth.getUser();

  // Build the chronological list of past date keys (yesterday → LAUNCH_DATE).
  // We compute today in UTC, walk back one day at a time. Stop at LAUNCH_DATE.
  const today = new Date();
  const todayKey = formatDateKey(today);
  const launchTime = Date.parse(`${LAUNCH_DATE}T00:00:00Z`);

  const allKeys: string[] = [];
  {
    const cursor = new Date(today);
    cursor.setUTCDate(cursor.getUTCDate() - 1);
    while (cursor.getTime() >= launchTime) {
      allKeys.push(formatDateKey(cursor));
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    }
  }

  const totalPages = Math.max(1, Math.ceil(allKeys.length / PAGE_SIZE));
  const pageKeys = allKeys.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Resolve which dilemma was shown on each of those dates.
  const items = pageKeys.map(key => {
    const d = new Date(`${key}T12:00:00Z`);
    const { dilemma, index } = getDailyDilemma(d);
    return { dateKey: key, dilemma, index };
  });

  // Look up which of those the user has already answered.
  let answeredSet = new Set<string>();
  let isMullPlus = false;
  if (user) {
    const { data: rows } = await supabase
      .from('dilemma_responses')
      .select('dilemma_date')
      .eq('user_id', user.id)
      .in('dilemma_date', pageKeys);
    answeredSet = new Set((rows || []).map(r => r.dilemma_date as string));
    const sub = await getUserPlan(supabase, user.id);
    isMullPlus = sub.isMullPlus;
  }

  const dateFmt = locale === 'en' ? 'en-GB' : locale;

  return (
    <main className="mx-auto max-w-[860px] px-6 pb-32 pt-10 sm:px-10">
      <div className="mb-6 flex items-center justify-end gap-3">
        <LanguageSwitcher initial={locale} />
        <Link
          href="/dilemma"
          className="text-[13px] text-[#4A4338] hover:text-[#221E18] hover:underline"
        >
          {t('archive.todays_dilemma', locale)} →
        </Link>
      </div>

      <PixelPageHeader
        eyebrow={`▶ ${t('archive.eyebrow', locale).toUpperCase()}`}
        title="DILEMMA ARCHIVE"
        subtitle={
          <p className="text-[16px] italic" style={{ fontFamily: 'var(--font-prose)' }}>
            {t('archive.subtitle', locale)}
          </p>
        }
      />


      {!user && (
        <div style={{
          padding: '20px 24px', background: '#FFFCF4', border: '1px dashed #D6CDB6',
          borderRadius: 10, marginBottom: 32,
        }}>
          <p style={{
            fontFamily: serif, fontStyle: 'italic', fontSize: 16,
            color: '#4A4338', margin: '0 0 12px',
          }}>
            {t('archive.signin_required', locale)}
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/signup" style={primaryButton}>
              {t('dilemma.create_account', locale)}
            </Link>
            <Link href="/login" style={secondaryButton}>
              {t('dilemma.sign_in', locale)}
            </Link>
          </div>
        </div>
      )}

      {user && !isMullPlus && (
        <div style={{
          padding: '18px 22px', background: '#F5EFDC', border: '1px solid #E2D8B6',
          borderLeft: '3px solid #B8862F', borderRadius: 8, marginBottom: 28,
        }}>
          <div style={{
            fontFamily: sans, fontSize: 11, fontWeight: 600, color: '#8C6520',
            textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: 8,
          }}>
            {t('archive.plus_lock_eyebrow', locale)}
          </div>
          <p style={{
            fontFamily: serif, fontSize: 16, color: '#221E18',
            margin: '0 0 12px', lineHeight: 1.5,
          }}>
            {t('archive.plus_lock_body', locale)}
          </p>
          <Link href="/billing" style={primaryButton}>
            {t('archive.see_plus', locale)}
          </Link>
        </div>
      )}

      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 14 }}>
        {items.map(item => {
          const answered = answeredSet.has(item.dateKey);
          const date = new Date(`${item.dateKey}T12:00:00Z`);
          const dateLabel = date.toLocaleDateString(dateFmt, {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
          });

          return (
            <li
              key={item.dateKey}
              style={{
                background: answered ? '#F8EDC8' : '#FFFCF4',
                border: '3px solid #221E18',
                boxShadow: answered ? '3px 3px 0 0 #2F5D5C' : '3px 3px 0 0 #D6CDB6',
                borderRadius: 0,
                padding: '16px 20px',
              }}
            >
              <div style={{
                fontFamily: 'var(--font-pixel-display)', fontSize: 10,
                color: answered ? '#2F5D5C' : '#8C6520',
                textTransform: 'uppercase', letterSpacing: '0.18em',
                marginBottom: 10,
              }}>
                ▸ {dateLabel.toUpperCase()}
                {answered && <span style={{ marginLeft: 10 }}>· {t('archive.answered_tag', locale).toUpperCase()}</span>}
              </div>

              <h2 style={{
                fontFamily: serif, fontSize: 19, fontWeight: 500,
                color: '#221E18', margin: '0 0 6px', lineHeight: 1.35,
              }}>
                {item.dilemma.prompt}
              </h2>

              {item.dilemma.hint && (
                <p style={{
                  fontFamily: serif, fontStyle: 'italic',
                  fontSize: 14.5, color: '#4A4338',
                  margin: '0 0 12px', lineHeight: 1.5,
                }}>
                  {item.dilemma.hint}
                </p>
              )}

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                {answered ? (
                  <span style={{ ...statusChip, color: '#2F5D5C' }}>
                    ✓ {t('archive.answered_chip', locale)}
                  </span>
                ) : !user ? (
                  <Link href="/login" style={statusLink}>
                    {t('archive.signin_to_answer', locale)}
                  </Link>
                ) : !isMullPlus ? (
                  <span style={{ ...statusChip, color: '#8C6520' }}>
                    🔒 {t('archive.plus_required', locale)}
                  </span>
                ) : (
                  <Link
                    href={`/dilemma/archive/${item.dateKey}`}
                    style={primaryButtonSmall}
                  >
                    {t('archive.answer_this', locale)}
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {totalPages > 1 && (
        <nav style={{
          marginTop: 32, display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', fontFamily: sans, fontSize: 14, color: '#4A4338',
          flexWrap: 'wrap', gap: 12,
        }}>
          {page > 1 ? (
            <Link href={`/dilemma/archive?page=${page - 1}`} style={pageLink}>
              ← {t('archive.newer', locale)}
            </Link>
          ) : <span />}
          <span style={{ color: '#8C6520', fontSize: 12, letterSpacing: 0.3 }}>
            {t('archive.page_of', locale, { n: page, total: totalPages })}
          </span>
          {page < totalPages ? (
            <Link href={`/dilemma/archive?page=${page + 1}`} style={pageLink}>
              {t('archive.older', locale)} →
            </Link>
          ) : <span />}
        </nav>
      )}

      <p style={{
        fontFamily: sans, fontSize: 12, color: '#8C6520',
        marginTop: 48, opacity: 0.75, textAlign: 'center', letterSpacing: 0.3,
      }}>
        {t('archive.footer_note', locale, { date: new Date(`${LAUNCH_DATE}T00:00:00Z`).toLocaleDateString(dateFmt, { day: 'numeric', month: 'long', year: 'numeric' }) })}
      </p>
    </main>
  );

  // (Today's dateKey is unused in render but kept for future "show today at top" affordance.)
  void todayKey;
}

const primaryButton: React.CSSProperties = {
  padding: '10px 20px', background: '#221E18', color: '#FAF6EC',
  borderRadius: 6, textDecoration: 'none',
  fontFamily: sans, fontSize: 14, fontWeight: 500, display: 'inline-block',
};
const primaryButtonSmall: React.CSSProperties = {
  padding: '7px 14px', background: '#221E18', color: '#FAF6EC',
  borderRadius: 6, textDecoration: 'none',
  fontFamily: sans, fontSize: 13, fontWeight: 500, display: 'inline-block',
};
const secondaryButton: React.CSSProperties = {
  padding: '10px 20px', border: '1px solid #221E18', color: '#221E18',
  borderRadius: 6, textDecoration: 'none',
  fontFamily: sans, fontSize: 14, display: 'inline-block',
};
const statusChip: React.CSSProperties = {
  fontFamily: sans, fontSize: 13, fontWeight: 500, letterSpacing: 0.2,
};
const statusLink: React.CSSProperties = {
  fontFamily: sans, fontSize: 13, color: '#2F5D5C',
  textDecoration: 'underline', textUnderlineOffset: 3,
};
const pageLink: React.CSSProperties = {
  fontFamily: sans, fontSize: 14, color: '#221E18',
  textDecoration: 'none', padding: '8px 14px',
  border: '1px solid #D6CDB6', borderRadius: 6,
};
