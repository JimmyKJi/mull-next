import { createClient } from '@/utils/supabase/server';
import { getDailyDilemma } from '@/lib/dilemmas';
import { topShifts } from '@/lib/dimensions';
import Link from 'next/link';
import type { Metadata } from 'next';
import DilemmaForm from './dilemma-form';
import { getServerLocale } from '@/lib/locale-server';
import { t, type Locale } from '@/lib/translations';
import LanguageSwitcher from '@/components/language-switcher';

// Daily dilemma page is OK to index (the question itself is shareable),
// but the user's response is private — only meta is open. Index allowed,
// but the dynamic content the user types into is never persisted in the DOM
// for crawlers to see, so this is fine.
export const metadata: Metadata = {
  // intentionally not setting noindex here — daily prompt is public-facing
};

const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'Inter', system-ui, sans-serif";

type ExistingResponse = {
  id: string;
  question_text: string;
  response_text: string;
  vector_delta: number[] | null;
  analysis: string | null;
  created_at: string;
};

type RecentResponse = {
  id: string;
  dilemma_date: string;
  question_text: string;
  response_text: string;
  analysis: string | null;
  created_at: string;
};

export default async function DilemmaPage() {
  const supabase = await createClient();
  const locale = await getServerLocale();
  const { data: { user } } = await supabase.auth.getUser();
  const today = getDailyDilemma();
  // Localize today's dilemma question + hint via the dil.N.* keys.
  // t() returns the key itself when no entry exists (so it's always
  // truthy — `||` fallback won't trigger). We expanded DILEMMAS to 379
  // but the dil.N.* translation keys only cover the original ~90, so
  // for any newer index we need to fall through to the English source
  // string explicitly. Detect "no translation" by comparing against the
  // key string.
  const promptKey = `dil.${today.index}.prompt`;
  const hintKey = `dil.${today.index}.hint`;
  const promptLookup = t(promptKey, locale);
  const hintLookup = t(hintKey, locale);
  const localizedPrompt = (promptLookup && promptLookup !== promptKey)
    ? promptLookup
    : today.dilemma.prompt;
  const localizedHint = (hintLookup && hintLookup !== hintKey)
    ? hintLookup
    : (today.dilemma.hint || '');

  let existing: ExistingResponse | null = null;
  let streak = 0;
  let recent: RecentResponse[] = [];
  if (user) {
    const { data } = await supabase
      .from('dilemma_responses')
      .select('id, question_text, response_text, vector_delta, analysis, created_at')
      .eq('user_id', user.id)
      .eq('dilemma_date', today.dateKey)
      .maybeSingle<ExistingResponse>();
    existing = data;

    // Fetch the user's 3 most recent past responses (excluding today's), so
    // they can re-read what they've been thinking about over the past week or
    // so. Helps surface continuity without dragging them all the way to /account.
    const { data: recentRows } = await supabase
      .from('dilemma_responses')
      .select('id, dilemma_date, question_text, response_text, analysis, created_at')
      .eq('user_id', user.id)
      .neq('dilemma_date', today.dateKey)
      .order('dilemma_date', { ascending: false })
      .limit(3);
    recent = (recentRows as RecentResponse[] | null) || [];

    // Compute current streak: walk backward from today (or yesterday if not
    // yet answered today), counting consecutive days with a saved response.
    const { data: dateRows } = await supabase
      .from('dilemma_responses')
      .select('dilemma_date')
      .eq('user_id', user.id)
      .order('dilemma_date', { ascending: false })
      .limit(400);
    if (dateRows) {
      const dateSet = new Set(dateRows.map(r => r.dilemma_date as string));
      const cursor = new Date(today.dateKey);
      // If today isn't done yet, the streak is whatever ran up to yesterday.
      if (!dateSet.has(cursor.toISOString().slice(0, 10))) {
        cursor.setUTCDate(cursor.getUTCDate() - 1);
      }
      while (dateSet.has(cursor.toISOString().slice(0, 10))) {
        streak++;
        cursor.setUTCDate(cursor.getUTCDate() - 1);
      }
    }
  }

  const shifts = existing?.vector_delta ? topShifts(existing.vector_delta) : [];

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
          fontFamily: serif,
          fontSize: 28,
          fontWeight: 500,
          color: '#221E18',
          textDecoration: 'none',
          letterSpacing: '-0.5px'
        }}>
          Mull<span style={{ color: '#B8862F' }}>.</span>
        </Link>
        <nav style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <LanguageSwitcher initial={locale} />
          <Link href="/account" style={{
            fontFamily: sans, fontSize: 13, color: '#4A4338',
            textDecoration: 'none', letterSpacing: 0.3,
          }}>{t('nav.account_arrow', locale)}</Link>
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
        {t('dilemma.eyebrow', locale)} · {new Date(today.dateKey).toLocaleDateString(locale === 'en' ? 'en-GB' : locale, {
          weekday: 'long', day: 'numeric', month: 'long'
        })}
        {streak > 1 && (
          <span style={{ marginLeft: 14, color: '#2F5D5C' }}>
            · {t('dilemma.streak', locale, { n: streak })}
          </span>
        )}
        {user && (
          <Link href="/dilemma/archive" style={{
            marginLeft: 14, color: '#8C6520',
            textDecoration: 'none', fontWeight: 500,
            borderBottom: '1px solid rgba(140, 101, 32, 0.4)',
            paddingBottom: 1,
          }}>
            {t('dilemma.see_archive', locale)}
          </Link>
        )}
      </div>

      <h1 style={{
        fontFamily: serif,
        fontSize: 38,
        fontWeight: 500,
        margin: '0 0 16px',
        letterSpacing: '-0.01em',
        lineHeight: 1.2,
      }}>
        {localizedPrompt}
      </h1>

      {localizedHint && (
        <p style={{
          fontFamily: serif,
          fontStyle: 'italic',
          fontSize: 17,
          color: '#4A4338',
          marginBottom: 32,
        }}>
          {localizedHint}
        </p>
      )}

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
            {t('dilemma.account_required_msg', locale)}
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
      ) : existing ? (
        <div style={{
          padding: '28px 32px',
          background: '#FFFCF4',
          border: '1px solid #D6CDB6',
          borderLeft: '3px solid #B8862F',
          borderRadius: 8,
        }}>
          <div style={{
            fontFamily: sans,
            fontSize: 11,
            fontWeight: 600,
            color: '#2F5D5C',
            textTransform: 'uppercase',
            letterSpacing: '0.16em',
            marginBottom: 14,
          }}>
            {t('dilemma.you_answered_today', locale)}
          </div>
          <p style={{
            fontFamily: serif,
            fontSize: 17,
            color: '#221E18',
            lineHeight: 1.6,
            margin: '0 0 18px',
            whiteSpace: 'pre-wrap',
          }}>
            {existing.response_text}
          </p>
          {existing.analysis && (
            <div style={{
              padding: '14px 16px',
              background: '#F5EFDC',
              borderRadius: 6,
              marginBottom: 16,
            }}>
              <div style={{
                fontFamily: sans,
                fontSize: 10,
                fontWeight: 600,
                color: '#8C6520',
                textTransform: 'uppercase',
                letterSpacing: '0.16em',
                marginBottom: 6,
              }}>
                {t('dilemma.what_revealed', locale)}
              </div>
              <p style={{
                fontFamily: serif,
                fontStyle: 'italic',
                fontSize: 16,
                color: '#221E18',
                margin: 0,
                lineHeight: 1.5,
              }}>
                {existing.analysis}
              </p>
            </div>
          )}
          {shifts.length > 0 && (
            <div>
              <div style={{
                fontFamily: sans,
                fontSize: 10,
                fontWeight: 600,
                color: '#8C6520',
                textTransform: 'uppercase',
                letterSpacing: '0.16em',
                marginBottom: 8,
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
          <div style={{
            marginTop: 22,
            paddingTop: 18,
            borderTop: '1px solid #EBE3CA',
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
          }}>
            <Link href="/account" style={{
              padding: '9px 18px',
              border: '1px solid #221E18',
              borderRadius: 6,
              color: '#221E18',
              textDecoration: 'none',
              fontFamily: sans,
              fontSize: 13.5,
            }}>
              {t('dilemma.see_trajectory', locale)}
            </Link>
            <span style={{
              fontFamily: sans,
              fontSize: 12,
              color: '#8C6520',
              alignSelf: 'center',
            }}>
              {t('dilemma.next_arrives', locale)}
            </span>
          </div>
        </div>
      ) : (
        <DilemmaForm questionPrompt={localizedPrompt} locale={locale} />
      )}

      {user && existing && recent.length > 0 && (
        <section style={{ marginTop: 48 }}>
          <div style={{
            fontFamily: sans,
            fontSize: 11,
            fontWeight: 600,
            color: '#8C6520',
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            marginBottom: 6,
          }}>
            {t('dilemma.recent_eyebrow', locale)}
          </div>
          <p style={{
            fontFamily: serif,
            fontStyle: 'italic',
            fontSize: 15,
            color: '#4A4338',
            margin: '0 0 18px',
          }}>
            {t('dilemma.recent_helper', locale)}
          </p>
          <div style={{ display: 'grid', gap: 14 }}>
            {recent.map(r => (
              <details
                key={r.id}
                style={{
                  background: '#FFFCF4',
                  border: '1px solid #EBE3CA',
                  borderRadius: 8,
                  padding: '14px 18px',
                }}
              >
                <summary style={{
                  cursor: 'pointer',
                  listStyle: 'none',
                  fontFamily: serif,
                  fontSize: 16,
                  color: '#221E18',
                  lineHeight: 1.4,
                }}>
                  <span style={{
                    display: 'block',
                    fontFamily: sans,
                    fontSize: 10,
                    fontWeight: 600,
                    color: '#8C6520',
                    textTransform: 'uppercase',
                    letterSpacing: '0.16em',
                    marginBottom: 6,
                  }}>
                    {new Date(r.dilemma_date).toLocaleDateString(locale === 'en' ? 'en-GB' : locale, {
                      weekday: 'short', day: 'numeric', month: 'short'
                    })}
                  </span>
                  {r.question_text}
                </summary>
                <p style={{
                  fontFamily: serif,
                  fontSize: 15.5,
                  color: '#221E18',
                  lineHeight: 1.6,
                  margin: '12px 0 0',
                  whiteSpace: 'pre-wrap',
                }}>
                  {r.response_text}
                </p>
                {r.analysis && (
                  <p style={{
                    fontFamily: serif,
                    fontStyle: 'italic',
                    fontSize: 14.5,
                    color: '#4A4338',
                    lineHeight: 1.55,
                    margin: '10px 0 0',
                    paddingLeft: 12,
                    borderLeft: '2px solid #D6CDB6',
                  }}>
                    {r.analysis}
                  </p>
                )}
              </details>
            ))}
          </div>
        </section>
      )}

      <p style={{
        fontFamily: sans,
        fontSize: 12,
        color: '#8C6520',
        marginTop: 48,
        opacity: 0.75,
        textAlign: 'center',
        letterSpacing: 0.3,
      }}>
        {t('dilemma.footer_note', locale)}
      </p>
    </main>
  );
}
