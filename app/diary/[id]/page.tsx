import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { topShifts } from '@/lib/dimensions';
import DiaryEntryActions from './diary-entry-actions';
import { getServerLocale } from '@/lib/locale-server';
import { t } from '@/lib/translations';
import LanguageSwitcher from '@/components/language-switcher';
import DiagnosisCard from '@/components/diagnosis-card';
import type { Kinship } from '@/lib/kinship';

const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'Inter', system-ui, sans-serif";

type DiaryEntry = {
  id: string;
  title: string | null;
  content: string;
  vector_delta: number[] | null;
  analysis: string | null;
  diagnosis: string | null;
  kinship: Kinship | null;
  is_novel: boolean | null;
  word_count: number | null;
  created_at: string;
  updated_at: string;
};

export default async function DiaryEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const locale = await getServerLocale();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: entry } = await supabase
    .from('diary_entries')
    .select('id, title, content, vector_delta, analysis, diagnosis, kinship, is_novel, word_count, created_at, updated_at')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle<DiaryEntry>();

  if (!entry) notFound();

  const shifts = topShifts(entry.vector_delta || [], 0.3, 5);
  const localeMap: Record<string, string> = { en: 'en-GB', es: 'es-ES', fr: 'fr-FR', pt: 'pt-BR', ru: 'ru-RU', zh: 'zh-CN', ja: 'ja-JP', ko: 'ko-KR' };
  const fmtDate = (s: string) =>
    new Date(s).toLocaleString(localeMap[locale] || 'en-GB', { dateStyle: 'long', timeStyle: 'short' });

  return (
    <main className="mx-auto max-w-[820px] px-6 pb-32 pt-10 sm:px-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <Link
          href="/diary"
          className="text-[13px] text-[#4A4338] hover:text-[#221E18] hover:underline"
        >
          ← {t('nav.all_entries', locale)}
        </Link>
        <LanguageSwitcher initial={locale} />
      </div>

      <div
        className="flex flex-wrap items-center gap-3 text-[10px] tracking-[0.22em] text-[#2F5D5C]"
        style={{ fontFamily: 'var(--font-pixel-display)' }}
      >
        <span aria-hidden className="inline-block h-2 w-2 bg-[#2F5D5C]" />
        ▶ {t('diary.entry_eyebrow_detail', locale, { date: fmtDate(entry.created_at) }).toUpperCase()}
      </div>

      {entry.title && (
        <h1
          className="mt-5 text-[28px] font-medium leading-[1.15] text-[#221E18] sm:text-[36px]"
          style={{ fontFamily: 'var(--font-prose)' }}
        >
          {entry.title}
        </h1>
      )}

      <article style={{
        fontFamily: serif,
        fontSize: 19,
        color: '#221E18',
        lineHeight: 1.7,
        whiteSpace: 'pre-wrap',
        padding: '24px 28px',
        background: '#FFFCF4',
        border: '1px solid #EBE3CA',
        borderLeft: '3px solid #2F5D5C',
        borderRadius: 8,
      }}>
        {entry.content}
      </article>

      <div style={{
        fontFamily: sans,
        fontSize: 12,
        color: '#8C6520',
        marginTop: 12,
        opacity: 0.75,
      }}>
        {entry.word_count || '?'} words
        {entry.updated_at !== entry.created_at && ` · edited ${fmtDate(entry.updated_at)}`}
      </div>

      {entry.analysis && (
        <div style={{
          marginTop: 32,
          padding: '20px 24px',
          background: '#F5EFDC',
          borderLeft: '3px solid #B8862F',
          borderRadius: 8,
        }}>
          <div style={{
            fontFamily: sans,
            fontSize: 11,
            fontWeight: 600,
            color: '#8C6520',
            textTransform: 'uppercase',
            letterSpacing: '0.16em',
            marginBottom: 10,
          }}>
            {t('dilemma.what_revealed', locale)}
          </div>
          <p style={{
            fontFamily: serif,
            fontStyle: 'italic',
            fontSize: 17,
            color: '#221E18',
            margin: 0,
            lineHeight: 1.6,
          }}>
            {entry.analysis}
          </p>
        </div>
      )}

      {/* Shared DiagnosisCard renders nothing when everything is null/empty. */}
      <DiagnosisCard
        diagnosis={entry.diagnosis}
        kinship={entry.kinship}
        is_novel={entry.is_novel}
      />

      {shifts.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={{
            fontFamily: sans,
            fontSize: 11,
            fontWeight: 600,
            color: '#8C6520',
            textTransform: 'uppercase',
            letterSpacing: '0.16em',
            marginBottom: 10,
          }}>
            {t('dilemma.shift_added', locale)}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
            {shifts.map(s => (
              <span key={s.key} style={{
                fontFamily: sans,
                fontSize: 14,
                color: s.delta > 0 ? '#2F5D5C' : '#7A2E2E',
              }}>
                <strong style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {s.delta > 0 ? '+' : ''}{s.delta.toFixed(1)}
                </strong>{' '}
                <span style={{ color: '#4A4338' }}>{s.name}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      <DiaryEntryActions entryId={entry.id} locale={locale} />
    </main>
  );
}
