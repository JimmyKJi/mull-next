import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import type { Metadata } from 'next';
import DiaryComposer from './diary-composer';
import { topShifts } from '@/lib/dimensions';
import { getServerLocale } from '@/lib/locale-server';
import { t } from '@/lib/translations';
import LanguageSwitcher from '@/components/language-switcher';

// Personal page; never index. Belt and braces alongside robots.ts.
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'Inter', system-ui, sans-serif";

type DiaryEntry = {
  id: string;
  title: string | null;
  content: string;
  vector_delta: number[] | null;
  analysis: string | null;
  word_count: number | null;
  created_at: string;
  updated_at: string;
};

export default async function DiaryPage() {
  const supabase = await createClient();
  const locale = await getServerLocale();
  const { data: { user } } = await supabase.auth.getUser();

  let entries: DiaryEntry[] = [];
  if (user) {
    const { data } = await supabase
      .from('diary_entries')
      .select('id, title, content, vector_delta, analysis, word_count, created_at, updated_at')
      .order('created_at', { ascending: false })
      .limit(50)
      .returns<DiaryEntry[]>();
    entries = data ?? [];
  }

  const fmtDate = (s: string) =>
    new Date(s).toLocaleDateString(locale === 'en' ? 'en-GB' : locale, { day: 'numeric', month: 'short', year: 'numeric' });
  const fmtRel = (s: string) => {
    const diff = Date.now() - new Date(s).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return mins <= 1 ? t('time.just_now', locale) : t('time.min_ago', locale, { n: mins });
    const hours = Math.floor(mins / 60);
    if (hours < 24) return t(hours === 1 ? 'time.hr_ago' : 'time.hrs_ago', locale, { n: hours });
    const days = Math.floor(hours / 24);
    if (days < 7) return t(days === 1 ? 'time.day_ago' : 'time.days_ago', locale, { n: days });
    return fmtDate(s);
  };

  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '60px 24px 120px' }}>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 36,
        gap: 16,
        flexWrap: 'wrap',
      }}>
        <Link href="/" style={{
          fontFamily: serif,
          fontSize: 28,
          fontWeight: 500,
          color: '#221E18',
          textDecoration: 'none',
          letterSpacing: '-0.5px'
        }}>
          Mull<span style={{ color: '#B8862F' }}>.</span>
        </Link>
        <nav style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
          <LanguageSwitcher initial={locale} />
          <Link href="/dilemma" style={{ fontFamily: sans, fontSize: 13, color: '#4A4338', textDecoration: 'none' }}>{t('nav.dilemma_arrow', locale)}</Link>
          <Link href="/account" style={{ fontFamily: sans, fontSize: 13, color: '#4A4338', textDecoration: 'none' }}>{t('nav.account_arrow', locale)}</Link>
        </nav>
      </header>

      <div style={{
        fontFamily: sans,
        fontSize: 11,
        fontWeight: 600,
        color: '#8C6520',
        textTransform: 'uppercase',
        letterSpacing: '0.18em',
        marginBottom: 14,
      }}>
        {t('diary.eyebrow', locale)}
      </div>
      <h1 style={{
        fontFamily: serif,
        fontSize: 44,
        fontWeight: 500,
        margin: '0 0 12px',
        letterSpacing: '-0.01em',
        lineHeight: 1.05,
      }}>
        {t('diary.title', locale)}
      </h1>
      <p style={{
        fontFamily: serif,
        fontStyle: 'italic',
        fontSize: 18,
        color: '#4A4338',
        marginBottom: 36,
        lineHeight: 1.5,
      }}>
        {t('diary.subtitle', locale)}
      </p>

      {!user ? (
        <div style={{
          padding: '28px 32px',
          background: '#FFFCF4',
          border: '1px dashed #D6CDB6',
          borderRadius: 12,
          textAlign: 'center',
        }}>
          <p style={{
            fontFamily: serif,
            fontStyle: 'italic',
            fontSize: 18,
            color: '#4A4338',
            margin: '0 0 16px',
          }}>
            {t('diary.account_required', locale)}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/signup" style={{
              padding: '10px 20px',
              background: '#221E18',
              color: '#FAF6EC',
              borderRadius: 6,
              textDecoration: 'none',
              fontFamily: sans,
              fontSize: 14,
              fontWeight: 500,
            }}>
              {t('dilemma.create_account', locale)}
            </Link>
            <Link href="/login" style={{
              padding: '10px 20px',
              border: '1px solid #221E18',
              color: '#221E18',
              borderRadius: 6,
              textDecoration: 'none',
              fontFamily: sans,
              fontSize: 14,
            }}>
              {t('dilemma.sign_in', locale)}
            </Link>
          </div>
        </div>
      ) : (
        <DiaryComposer locale={locale} />
      )}

      {user && entries.length > 0 && (
        <section style={{ marginTop: 56 }}>
          <h2 style={{
            fontFamily: serif,
            fontStyle: 'italic',
            fontSize: 24,
            fontWeight: 500,
            color: '#4A4338',
            margin: '0 0 18px',
          }}>
            {t('diary.earlier_entries', locale)}
          </h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {entries.map(e => {
              const shifts = topShifts(e.vector_delta || [], 0.3, 3);
              const preview = e.content.length > 280 ? e.content.slice(0, 280) + '…' : e.content;
              return (
                <li key={e.id}>
                  <Link href={`/diary/${e.id}`} style={{
                    display: 'block',
                    padding: '20px 22px',
                    background: '#FFFCF4',
                    border: '1px solid #EBE3CA',
                    borderLeft: '3px solid #2F5D5C',
                    borderRadius: 8,
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'border-color 0.15s ease, transform 0.15s ease',
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      gap: 8,
                      flexWrap: 'wrap',
                      marginBottom: 8,
                    }}>
                      <span style={{
                        fontFamily: sans,
                        fontSize: 11,
                        fontWeight: 600,
                        color: '#2F5D5C',
                        textTransform: 'uppercase',
                        letterSpacing: '0.14em',
                      }}>
                        {t('diary.entry_eyebrow', locale)} · {fmtRel(e.created_at)}
                      </span>
                      <span style={{
                        fontFamily: sans,
                        fontSize: 12,
                        color: '#8C6520',
                        opacity: 0.75,
                      }}>
                        {t('diary.entry_words', locale, { n: e.word_count || 0 })}
                      </span>
                    </div>
                    {e.title && (
                      <div style={{
                        fontFamily: serif,
                        fontSize: 22,
                        fontWeight: 500,
                        color: '#221E18',
                        marginBottom: 6,
                      }}>
                        {e.title}
                      </div>
                    )}
                    <p style={{
                      fontFamily: serif,
                      fontSize: 16,
                      color: '#221E18',
                      margin: 0,
                      lineHeight: 1.55,
                      whiteSpace: 'pre-wrap',
                    }}>
                      {preview}
                    </p>
                    {shifts.length > 0 && (
                      <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                        {shifts.map(s => (
                          <span key={s.key} style={{
                            fontFamily: sans,
                            fontSize: 12.5,
                            color: s.delta > 0 ? '#2F5D5C' : '#7A2E2E',
                          }}>
                            <strong style={{ fontVariantNumeric: 'tabular-nums' }}>
                              {s.delta > 0 ? '+' : ''}{s.delta.toFixed(1)}
                            </strong>{' '}
                            <span style={{ color: '#4A4338' }}>{s.name}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <p style={{
        fontFamily: sans,
        fontSize: 12,
        color: '#8C6520',
        marginTop: 56,
        opacity: 0.7,
        textAlign: 'center',
        letterSpacing: 0.3,
        lineHeight: 1.55,
      }}>
        {t('diary.footer_note', locale)}
      </p>
    </main>
  );
}
