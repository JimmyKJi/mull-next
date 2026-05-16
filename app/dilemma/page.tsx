import { createClient } from '@/utils/supabase/server';
import { getDailyDilemma } from '@/lib/dilemmas';
import { topShifts } from '@/lib/dimensions';
import Link from 'next/link';
import type { Metadata } from 'next';
import DilemmaForm from './dilemma-form';
import { getServerLocale } from '@/lib/locale-server';
import { t, type Locale } from '@/lib/translations';
import LanguageSwitcher from '@/components/language-switcher';
import DiagnosisCard from '@/components/diagnosis-card';
import type { Kinship } from '@/lib/kinship';

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
  diagnosis: string | null;
  kinship: Kinship | null;
  is_novel: boolean | null;
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
      .select('id, question_text, response_text, vector_delta, analysis, diagnosis, kinship, is_novel, created_at')
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
      // Grace policy: one missed day is forgiven so a single forgotten
      // morning doesn't reset hard-won progress. Two missed days break.
      if (!dateSet.has(cursor.toISOString().slice(0, 10))) {
        cursor.setUTCDate(cursor.getUTCDate() - 1);
      }
      let graceUsed = false;
      for (let i = 0; i < 1825; i++) {
        const k = cursor.toISOString().slice(0, 10);
        if (dateSet.has(k)) {
          streak++;
          cursor.setUTCDate(cursor.getUTCDate() - 1);
        } else if (!graceUsed) {
          graceUsed = true;
          cursor.setUTCDate(cursor.getUTCDate() - 1);
        } else {
          break;
        }
      }
    }
  }

  const shifts = existing?.vector_delta ? topShifts(existing.vector_delta) : [];

  return (
    <main className="mx-auto max-w-[820px] px-6 pb-32 pt-10 sm:px-10">
      <div className="mb-6 flex items-center justify-end gap-3">
        <LanguageSwitcher initial={locale} />
        <Link
          href="/account"
          className="text-[13px] text-[#4A4338] hover:text-[#221E18] hover:underline"
        >
          {t('nav.account_arrow', locale)}
        </Link>
      </div>

      {/* Pixel eyebrow with date + streak + archive link */}
      <div
        className="flex flex-wrap items-center gap-3 text-[10px] tracking-[0.22em] text-[#8C6520]"
        style={{ fontFamily: 'var(--font-pixel-display)' }}
      >
        <span aria-hidden className="inline-block h-2 w-2 bg-[#B8862F] pixel-blink" />
        <span>▶ {t('dilemma.eyebrow', locale).toUpperCase()}</span>
        <span className="opacity-60">·</span>
        <span className="text-[#221E18]">
          {new Date(today.dateKey).toLocaleDateString(
            locale === 'en' ? 'en-GB' : locale,
            { weekday: 'long', day: 'numeric', month: 'long' },
          ).toUpperCase()}
        </span>
        {streak > 1 ? (
          <>
            <span className="opacity-60">·</span>
            <span className="text-[#2F5D5C]">
              {t('dilemma.streak', locale, { n: streak }).toUpperCase()}
            </span>
          </>
        ) : null}
        {user ? (
          <Link
            href="/dilemma/archive"
            className="ml-auto text-[#8C6520] underline decoration-[#B8862F]/50 underline-offset-3 hover:decoration-[#8C6520]"
          >
            {t('dilemma.see_archive', locale).toUpperCase()} →
          </Link>
        ) : null}
      </div>

      {/* Prompt panel — pixel-bordered, big Cormorant question */}
      <div
        className="mt-7 border-4 border-[#221E18] bg-[#FFFCF4]"
        style={{ boxShadow: '6px 6px 0 0 #8C6520' }}
      >
        <div
          className="border-b-4 border-[#221E18] bg-[#221E18] px-4 py-2 text-[10px] tracking-[0.22em] text-[#F8EDC8]"
          style={{ fontFamily: 'var(--font-pixel-display)' }}
        >
          ▶ TODAY&apos;S QUESTION
        </div>
        <div className="px-6 py-7 sm:px-8 sm:py-9">
          <h1
            className="text-[24px] font-medium leading-[1.3] text-[#221E18] sm:text-[30px] md:text-[34px]"
            style={{ fontFamily: 'var(--font-prose)' }}
          >
            {localizedPrompt}
          </h1>
          {localizedHint ? (
            <p
              className="mt-5 border-l-4 px-4 py-2 text-[15.5px] italic leading-[1.55] text-[#4A4338]"
              style={{ borderColor: '#B8862F', fontFamily: 'var(--font-prose)' }}
            >
              {localizedHint}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-8" />


      {!user ? (
        <div style={{
          padding: '28px 32px',
          background: '#FFFCF4',
          border: '4px solid #221E18',
          boxShadow: '5px 5px 0 0 #B8862F',
          borderRadius: 0,
          textAlign: 'center',
        }}>
          <p style={{
            fontFamily: serif,
            fontStyle: 'italic',
            fontSize: 18,
            color: '#4A4338',
            margin: '0 0 20px',
          }}>
            {t('dilemma.account_required_msg', locale)}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/signup"
              className="pixel-press"
              style={{
                display: 'inline-block',
                padding: '12px 22px',
                background: '#B8862F',
                color: '#1A1612',
                border: '4px solid #221E18',
                boxShadow: '4px 4px 0 0 #221E18',
                borderRadius: 0,
                fontFamily: 'var(--font-pixel-display)',
                fontSize: 12,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end)',
              }}
            >
              ▸ {t('dilemma.create_account', locale).toUpperCase()}
            </Link>
            <Link
              href="/login"
              className="pixel-press"
              style={{
                display: 'inline-block',
                padding: '12px 22px',
                background: '#FFFCF4',
                color: '#221E18',
                border: '4px solid #221E18',
                boxShadow: '4px 4px 0 0 #B8862F',
                borderRadius: 0,
                fontFamily: 'var(--font-pixel-display)',
                fontSize: 12,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end)',
              }}
            >
              {t('dilemma.sign_in', locale).toUpperCase()}
            </Link>
          </div>
        </div>
      ) : existing ? (
        <div style={{
          padding: '28px 32px',
          background: '#FFFCF4',
          border: '4px solid #221E18',
          boxShadow: '5px 5px 0 0 #2F5D5C',
          borderRadius: 0,
        }}>
          <div style={{
            fontFamily: 'var(--font-pixel-display)',
            fontSize: 12,
            color: '#2F5D5C',
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            marginBottom: 14,
          }}>
            ✓ {t('dilemma.you_answered_today', locale).toUpperCase()}
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
              background: '#F8EDC8',
              border: '3px solid #221E18',
              boxShadow: '3px 3px 0 0 #B8862F',
              borderRadius: 0,
              marginBottom: 16,
            }}>
              <div style={{
                fontFamily: 'var(--font-pixel-display)',
                fontSize: 10,
                color: '#8C6520',
                textTransform: 'uppercase',
                letterSpacing: '0.18em',
                marginBottom: 8,
              }}>
                {t('dilemma.what_revealed', locale).toUpperCase()}
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
          {/* Diagnosis card for the already-answered-today response. */}
          <DiagnosisCard
            diagnosis={existing.diagnosis}
            kinship={existing.kinship}
            is_novel={existing.is_novel}
          />
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
            borderTop: '2px dashed #D6CDB6',
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}>
            <Link
              href="/account#shifts"
              className="pixel-press"
              style={{
                display: 'inline-block',
                padding: '10px 16px',
                background: '#221E18',
                color: '#FAF6EC',
                border: '3px solid #221E18',
                boxShadow: '3px 3px 0 0 #B8862F',
                borderRadius: 0,
                fontFamily: 'var(--font-pixel-display)',
                fontSize: 11,
                letterSpacing: 0.4,
                textTransform: 'uppercase',
                textDecoration: 'none',
                transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end)',
              }}
            >
              ▸ {t('dilemma.see_trajectory', locale).toUpperCase()}
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
                  border: '3px solid #221E18',
                  boxShadow: '3px 3px 0 0 #B8862F',
                  borderRadius: 0,
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
                    fontFamily: 'var(--font-pixel-display)',
                    fontSize: 10,
                    color: '#8C6520',
                    textTransform: 'uppercase',
                    letterSpacing: '0.18em',
                    marginBottom: 8,
                  }}>
                    ▸ {new Date(r.dilemma_date).toLocaleDateString(locale === 'en' ? 'en-GB' : locale, {
                      weekday: 'short', day: 'numeric', month: 'short'
                    }).toUpperCase()}
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
