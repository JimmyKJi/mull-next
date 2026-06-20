import { createClient } from '@/utils/supabase/server';
import { getUserOrientation } from '@/lib/user-orientation';
import { getPersonalizedDilemma, localizeDeepDilemma } from '@/lib/archetype-dilemmas';
import { topShifts } from '@/lib/dimensions';
import Link from 'next/link';
import type { Metadata } from 'next';
import DilemmaForm from './dilemma-form';
import { getServerLocale } from '@/lib/locale-server';
import { t, type Locale } from '@/lib/translations';
import DiagnosisCard from '@/components/diagnosis-card';
import type { Kinship } from '@/lib/kinship';
import { PathwayNext } from '@/components/pathway-next';
import { pathwayForDilemma } from '@/lib/pathway';

// Daily dilemma page is OK to index (the question itself is shareable),
// but the user's response is private — only meta is open. Index allowed,
// but the dynamic content the user types into is never persisted in the DOM
// for crawlers to see, so this is fine.
export const metadata: Metadata = {
  // intentionally not setting noindex here — daily prompt is public-facing
};

const serif = 'var(--font-prose)';
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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Personalized daily dilemma: the question is chosen for the user's current
  // archetype (from their latest quiz attempt) and aimed at that archetype's
  // growth edge. Unplaced users (no attempt) get the universal-deep pool.
  // Deterministic per UTC day, so a refresh shows the same question.
  const orientation = await getUserOrientation(supabase, user?.id ?? null);
  const today = getPersonalizedDilemma(orientation.archetypeKey);
  const localized = localizeDeepDilemma(today.dilemma, locale);
  const localizedPrompt = localized.prompt;
  const localizedHint = localized.hint || '';
  // Localized archetype display name for the "FOR THE CARTOGRAPHER" pill.
  const archetypeName = orientation.archetypeKey
    ? t(`arch.${orientation.archetypeKey}.name`, locale)
    : null;

  let existing: ExistingResponse | null = null;
  let streak = 0;
  let recent: RecentResponse[] = [];
  if (user) {
    const { data } = await supabase
      .from('dilemma_responses')
      .select(
        'id, question_text, response_text, vector_delta, analysis, diagnosis, kinship, is_novel, created_at',
      )
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
      const dateSet = new Set(dateRows.map((r) => r.dilemma_date as string));
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
        <Link href="/account" className="text-[13px] text-ink-soft hover:text-ink hover:underline">
          {t('nav.account_arrow', locale)}
        </Link>
      </div>

      {/* Pixel eyebrow with date + streak + archive link */}
      <div
        className="flex flex-wrap items-center gap-3 text-[10px] tracking-[0.22em] text-acc-deep"
        style={{ fontFamily: 'var(--font-pixel-display)' }}
      >
        <span aria-hidden className="inline-block h-2 w-2 bg-acc pixel-blink" />
        <span>▶ {t('dilemma.eyebrow', locale).toUpperCase()}</span>
        <span className="opacity-60">·</span>
        <span className="text-ink">
          {new Date(today.dateKey)
            .toLocaleDateString(locale === 'en' ? 'en-GB' : locale, {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })
            .toUpperCase()}
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
            className="ml-auto text-acc-deep underline decoration-acc/50 underline-offset-3 hover:decoration-acc-deep"
          >
            {t('dilemma.see_archive', locale).toUpperCase()} →
          </Link>
        ) : null}
      </div>

      {/* Prompt panel — pixel-bordered, big Cormorant question */}
      <div
        className="mt-7 border-4 border-ink bg-[#FFFCF4]"
        style={{ boxShadow: '6px 6px 0 0 var(--color-acc-deep)' }}
      >
        <div
          className="border-b-4 border-ink bg-ink px-4 py-2 text-[10px] tracking-[0.22em] text-acc-soft"
          style={{ fontFamily: 'var(--font-pixel-display)' }}
        >
          ▶{' '}
          {(archetypeName
            ? t('dilemma.for_archetype', locale, { name: archetypeName })
            : t('dilemma.todays_question', locale)
          ).toUpperCase()}
        </div>
        <div className="px-6 py-7 sm:px-8 sm:py-9">
          <h1
            className="text-[24px] font-medium leading-[1.3] text-ink sm:text-[30px] md:text-[34px]"
            style={{ fontFamily: 'var(--font-prose)' }}
          >
            {localizedPrompt}
          </h1>
          {archetypeName ? (
            <p className="mt-3 text-[12px] leading-[1.5] text-acc-deep">
              {t('dilemma.personalized_note', locale)}
            </p>
          ) : null}
          {localizedHint ? (
            <p
              className="mt-5 border-l-4 px-4 py-2 text-[15.5px] italic leading-[1.55] text-ink-soft"
              style={{ borderColor: 'var(--color-acc)', fontFamily: 'var(--font-prose)' }}
            >
              {localizedHint}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-8" />

      {!user ? (
        <div
          style={{
            padding: '28px 32px',
            background: '#FFFCF4',
            border: '4px solid var(--color-ink)',
            boxShadow: '5px 5px 0 0 var(--color-acc)',
            borderRadius: 0,
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontFamily: serif,
              fontStyle: 'italic',
              fontSize: 18,
              color: 'var(--color-ink-soft)',
              margin: '0 0 20px',
            }}
          >
            {t('dilemma.account_required_msg', locale)}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/signup"
              className="pixel-press"
              style={{
                display: 'inline-block',
                padding: '12px 22px',
                background: 'var(--color-acc)',
                color: '#1A1612',
                border: '4px solid var(--color-ink)',
                boxShadow: '4px 4px 0 0 var(--color-ink)',
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
                color: 'var(--color-ink)',
                border: '4px solid var(--color-ink)',
                boxShadow: '4px 4px 0 0 var(--color-acc)',
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
        <div
          style={{
            padding: '28px 32px',
            background: '#FFFCF4',
            border: '4px solid var(--color-ink)',
            boxShadow: '5px 5px 0 0 #2F5D5C',
            borderRadius: 0,
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-pixel-display)',
              fontSize: 12,
              color: '#2F5D5C',
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
              marginBottom: 14,
            }}
          >
            ✓ {t('dilemma.you_answered_today', locale).toUpperCase()}
          </div>
          <p
            style={{
              fontFamily: serif,
              fontSize: 17,
              color: 'var(--color-ink)',
              lineHeight: 1.6,
              margin: '0 0 18px',
              whiteSpace: 'pre-wrap',
            }}
          >
            {existing.response_text}
          </p>
          {existing.analysis && (
            <div
              style={{
                padding: '14px 16px',
                background: 'var(--color-acc-soft)',
                border: '3px solid var(--color-ink)',
                boxShadow: '3px 3px 0 0 var(--color-acc)',
                borderRadius: 0,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-pixel-display)',
                  fontSize: 10,
                  color: 'var(--color-acc-deep)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.18em',
                  marginBottom: 8,
                }}
              >
                {t('dilemma.what_revealed', locale).toUpperCase()}
              </div>
              <p
                style={{
                  fontFamily: serif,
                  fontStyle: 'italic',
                  fontSize: 16,
                  color: 'var(--color-ink)',
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                {existing.analysis}
              </p>
            </div>
          )}
          {/* Diagnosis card for the already-answered-today response. */}
          <DiagnosisCard
            diagnosis={existing.diagnosis}
            kinship={existing.kinship}
            is_novel={existing.is_novel}
            locale={locale}
          />
          {shifts.length > 0 && (
            <div>
              <div
                style={{
                  fontFamily: sans,
                  fontSize: 10,
                  fontWeight: 600,
                  color: 'var(--color-acc-deep)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.16em',
                  marginBottom: 8,
                }}
              >
                {t('dilemma.shift_added', locale)}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
                {shifts.map((s) => (
                  <span
                    key={s.key}
                    style={{
                      fontFamily: sans,
                      fontSize: 14,
                      color: s.delta > 0 ? '#2F5D5C' : '#7A2E2E',
                    }}
                  >
                    <strong style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {s.delta > 0 ? '+' : ''}
                      {s.delta.toFixed(1)}
                    </strong>{' '}
                    <span style={{ color: 'var(--color-ink-soft)' }}>{s.name}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
          <div
            style={{
              marginTop: 22,
              paddingTop: 18,
              borderTop: '2px dashed var(--color-line)',
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <Link
              href="/account#shifts"
              className="pixel-press"
              style={{
                display: 'inline-block',
                padding: '10px 16px',
                background: 'var(--color-ink)',
                color: 'var(--color-cream)',
                border: '3px solid var(--color-ink)',
                boxShadow: '3px 3px 0 0 var(--color-acc)',
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
            <span
              style={{
                fontFamily: sans,
                fontSize: 12,
                color: 'var(--color-acc-deep)',
                alignSelf: 'center',
              }}
            >
              {t('dilemma.next_arrives', locale)}
            </span>
          </div>
        </div>
      ) : (
        <DilemmaForm
          questionPrompt={localizedPrompt}
          locale={locale}
          dilemmaRef={{ poolKey: today.poolKey, index: today.index }}
        />
      )}

      {user && existing && recent.length > 0 && (
        <section style={{ marginTop: 48 }}>
          <div
            style={{
              fontFamily: sans,
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--color-acc-deep)',
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
              marginBottom: 6,
            }}
          >
            {t('dilemma.recent_eyebrow', locale)}
          </div>
          <p
            style={{
              fontFamily: serif,
              fontStyle: 'italic',
              fontSize: 15,
              color: 'var(--color-ink-soft)',
              margin: '0 0 18px',
            }}
          >
            {t('dilemma.recent_helper', locale)}
          </p>
          <div style={{ display: 'grid', gap: 14 }}>
            {recent.map((r) => (
              <details
                key={r.id}
                style={{
                  background: '#FFFCF4',
                  border: '3px solid var(--color-ink)',
                  boxShadow: '3px 3px 0 0 var(--color-acc)',
                  borderRadius: 0,
                  padding: '14px 18px',
                }}
              >
                <summary
                  style={{
                    cursor: 'pointer',
                    listStyle: 'none',
                    fontFamily: serif,
                    fontSize: 16,
                    color: 'var(--color-ink)',
                    lineHeight: 1.4,
                  }}
                >
                  <span
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-pixel-display)',
                      fontSize: 10,
                      color: 'var(--color-acc-deep)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.18em',
                      marginBottom: 8,
                    }}
                  >
                    ▸{' '}
                    {new Date(r.dilemma_date)
                      .toLocaleDateString(locale === 'en' ? 'en-GB' : locale, {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                      })
                      .toUpperCase()}
                  </span>
                  {r.question_text}
                </summary>
                <p
                  style={{
                    fontFamily: serif,
                    fontSize: 15.5,
                    color: 'var(--color-ink)',
                    lineHeight: 1.6,
                    margin: '12px 0 0',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {r.response_text}
                </p>
                {r.analysis && (
                  <p
                    style={{
                      fontFamily: serif,
                      fontStyle: 'italic',
                      fontSize: 14.5,
                      color: 'var(--color-ink-soft)',
                      lineHeight: 1.55,
                      margin: '10px 0 0',
                      paddingLeft: 12,
                      borderLeft: '2px solid var(--color-line)',
                    }}
                  >
                    {r.analysis}
                  </p>
                )}
              </details>
            ))}
          </div>
        </section>
      )}

      {/* Pathway — cold visitors get the quiz; warm visitors get
          Spar → Crucible → Argument Diary. */}
      <PathwayNext pathway={pathwayForDilemma(locale)} locale={locale} />

      <p
        style={{
          fontFamily: sans,
          fontSize: 12,
          color: 'var(--color-acc-deep)',
          marginTop: 32,
          opacity: 0.75,
          textAlign: 'center',
          letterSpacing: 0.3,
        }}
      >
        {t('dilemma.footer_note', locale)}
      </p>
    </main>
  );
}
