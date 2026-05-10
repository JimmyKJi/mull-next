import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { topShifts } from '@/lib/dimensions';
import DiaryEntryActions from './diary-entry-actions';
import { getServerLocale } from '@/lib/locale-server';
import { t } from '@/lib/translations';
import LanguageSwitcher from '@/components/language-switcher';

const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'Inter', system-ui, sans-serif";

type KinshipPhilosopher = {
  slug: string;
  name: string;
  similarity: number;
  why: string;
};

type Kinship = {
  philosophers: KinshipPhilosopher[];
  traditions: string[];
};

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/diary" style={{ fontFamily: sans, fontSize: 13, color: '#4A4338', textDecoration: 'none' }}>
            {t('nav.all_entries', locale)}
          </Link>
          <LanguageSwitcher initial={locale} />
        </div>
      </header>

      <div style={{
        fontFamily: sans,
        fontSize: 11,
        fontWeight: 600,
        color: '#2F5D5C',
        textTransform: 'uppercase',
        letterSpacing: '0.18em',
        marginBottom: 14,
      }}>
        {t('diary.entry_eyebrow_detail', locale, { date: fmtDate(entry.created_at) })}
      </div>

      {entry.title && (
        <h1 style={{
          fontFamily: serif,
          fontSize: 38,
          fontWeight: 500,
          margin: '0 0 24px',
          letterSpacing: '-0.01em',
          lineHeight: 1.15,
        }}>
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

      {/* Diagnosis card — names the shape of the thinking + lists
          philosophical kin (or flags as novel). Sits between the
          analysis (what the entry reveals) and the dimensional
          shifts (numeric reading), bridging qualitative and
          quantitative. */}
      {(entry.diagnosis || (entry.kinship && (entry.kinship.philosophers.length > 0 || entry.kinship.traditions.length > 0)) || entry.is_novel) && (
        <div style={{
          marginTop: 24,
          padding: '20px 24px',
          background: '#FFFCF4',
          border: '1px solid #EBE3CA',
          borderLeft: entry.is_novel ? '3px solid #6B3E8C' : '3px solid #2F5D5C',
          borderRadius: 8,
        }}>
          <div style={{
            fontFamily: sans,
            fontSize: 11,
            fontWeight: 600,
            color: entry.is_novel ? '#6B3E8C' : '#2F5D5C',
            textTransform: 'uppercase',
            letterSpacing: '0.16em',
            marginBottom: 10,
            display: 'flex',
            gap: 10,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}>
            <span>Diagnosis</span>
            {entry.is_novel && (
              <span style={{
                padding: '2px 8px',
                background: '#6B3E8C',
                color: '#FAF6EC',
                borderRadius: 999,
                fontSize: 10,
                letterSpacing: '0.18em',
              }}>
                ✦ original thinking
              </span>
            )}
          </div>

          {entry.diagnosis && (
            <p style={{
              fontFamily: serif,
              fontSize: 16.5,
              color: '#221E18',
              margin: '0 0 14px',
              lineHeight: 1.6,
            }}>
              {entry.diagnosis}
            </p>
          )}

          {entry.kinship && entry.kinship.philosophers.length > 0 && (
            <>
              <div style={{
                fontFamily: sans,
                fontSize: 10.5,
                fontWeight: 600,
                color: '#8C6520',
                textTransform: 'uppercase',
                letterSpacing: '0.18em',
                marginBottom: 8,
                marginTop: 14,
              }}>
                Kindred thinkers
              </div>
              <ul style={{
                listStyle: 'none', padding: 0, margin: 0,
                display: 'flex', flexDirection: 'column', gap: 10,
              }}>
                {entry.kinship.philosophers.map(kp => (
                  <li key={kp.slug}>
                    <Link
                      href={`/philosopher/${kp.slug}`}
                      style={{
                        textDecoration: 'none',
                        color: 'inherit',
                        display: 'block',
                        padding: '10px 14px',
                        background: '#FAF6EC',
                        border: '1px solid #EBE3CA',
                        borderRadius: 6,
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'baseline',
                        gap: 10,
                        marginBottom: 4,
                      }}>
                        <span style={{
                          fontFamily: serif,
                          fontSize: 17,
                          fontWeight: 500,
                          color: '#221E18',
                        }}>{kp.name}</span>
                        {kp.similarity > 0 && (
                          <span style={{
                            fontFamily: sans,
                            fontSize: 11.5,
                            color: '#8C6520',
                            fontVariantNumeric: 'tabular-nums',
                            letterSpacing: 0.2,
                          }}>
                            {Math.round(kp.similarity * 100)}% kinship
                          </span>
                        )}
                      </div>
                      {kp.why && (
                        <p style={{
                          fontFamily: serif,
                          fontStyle: 'italic',
                          fontSize: 14.5,
                          color: '#4A4338',
                          margin: 0,
                          lineHeight: 1.5,
                        }}>
                          {kp.why}
                        </p>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}

          {entry.kinship && entry.kinship.traditions.length > 0 && (
            <>
              <div style={{
                fontFamily: sans,
                fontSize: 10.5,
                fontWeight: 600,
                color: '#8C6520',
                textTransform: 'uppercase',
                letterSpacing: '0.18em',
                marginBottom: 8,
                marginTop: 14,
              }}>
                Traditions
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {entry.kinship.traditions.map(tr => (
                  <span key={tr} style={{
                    padding: '5px 12px',
                    background: '#F1EAD8',
                    border: '1px solid #E2D8B6',
                    borderRadius: 999,
                    fontFamily: sans,
                    fontSize: 12.5,
                    color: '#5C4B1F',
                    letterSpacing: 0.2,
                  }}>
                    {tr}
                  </span>
                ))}
              </div>
            </>
          )}

          {entry.is_novel && (!entry.kinship || entry.kinship.philosophers.length === 0) && (
            <p style={{
              fontFamily: serif,
              fontStyle: 'italic',
              fontSize: 15,
              color: '#6B3E8C',
              margin: '14px 0 0',
              lineHeight: 1.55,
            }}>
              No philosopher in our database voices this move strongly.
              That doesn&rsquo;t mean it&rsquo;s untouched ground, but it&rsquo;s outside
              the canon as Mull currently maps it. Worth following.
            </p>
          )}
        </div>
      )}

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
