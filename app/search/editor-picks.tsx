// Editor's picks display — server component fetching this week's
// curated highlights via the /api/leaderboard/editor-picks route
// (which calls the get_editor_picks_for_week SQL RPC).
//
// Renders three cards per week, each showing the entry text +
// author handle (linked to their profile) + optional curator note.
// Falls back to a quiet "no picks yet" placeholder when the table
// is empty for the current week.

import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { weekKey, weekRangeLabel } from '@/lib/week';
import EmptyStateSprite from '@/components/empty-state-sprite';
import { t, type Locale } from '@/lib/translations';

const serif = 'var(--font-prose)';
const sans = "'Inter', system-ui, sans-serif";

type Pick = {
  slot: number;
  source_type: 'dilemma' | 'diary' | 'exercise';
  source_id: string;
  entry_text: string | null;
  entry_question: string | null;
  entry_title: string | null;
  exercise_slug: string | null;
  entry_created_at: string | null;
  curator_note: string | null;
  author_handle: string | null;
  author_display_name: string | null;
  author_archetype: string | null;
  author_show_archetype: boolean | null;
};

const SOURCE_LABEL_KEY: Record<Pick['source_type'], string> = {
  dilemma: 'srch2.source_dilemma',
  diary: 'srch2.source_diary',
  exercise: 'srch2.source_exercise',
};

export default async function EditorPicks({ locale = 'en' as Locale }: { locale?: Locale }) {
  const supabase = await createClient();
  const week = weekKey();
  const { data, error } = await supabase.rpc('get_editor_picks_for_week', { in_week_start: week });

  const picks = (error ? [] : (data ?? [])) as Pick[];

  return (
    <section style={{ marginBottom: 48 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 8,
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-pixel-display, "Courier New", monospace)',
            fontSize: 22,
            fontWeight: 400,
            margin: 0,
            color: 'var(--color-ink)',
            letterSpacing: '0.04em',
            textShadow: '3px 3px 0 var(--pixel-shadow, var(--color-acc))',
            lineHeight: 1.4,
          }}
        >
          {t('srch2.picks_h2', locale).toUpperCase()}
        </h2>
        <span
          style={{
            fontFamily: sans,
            fontSize: 11,
            fontWeight: 600,
            color: 'var(--color-acc-deep)',
            textTransform: 'uppercase',
            letterSpacing: '0.16em',
          }}
        >
          {weekRangeLabel(week, locale)}
        </span>
      </div>
      <p
        style={{
          fontFamily: serif,
          fontStyle: 'italic',
          fontSize: 16,
          color: 'var(--color-ink-soft)',
          margin: '0 0 22px',
          lineHeight: 1.55,
        }}
      >
        {t('srch2.picks_blurb', locale)}
      </p>

      {picks.length === 0 ? (
        <div
          style={{
            padding: '20px 18px',
            background: '#FFFCF4',
            border: '3px dashed var(--color-acc-deep)',
            borderRadius: 0,
          }}
        >
          <EmptyStateSprite variant="star" caption={t('srch2.picks_empty', locale)} />
        </div>
      ) : (
        <ol
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'grid',
            gap: 14,
          }}
        >
          {picks.map((p) => (
            <li
              key={`${p.slot}-${p.source_id}`}
              style={{
                padding: '18px 22px',
                background: '#FFFCF4',
                border: '4px solid var(--color-ink)',
                boxShadow: '4px 4px 0 0 var(--color-acc)',
                borderRadius: 0,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  flexWrap: 'wrap',
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    fontFamily: sans,
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--color-acc-deep)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.16em',
                  }}
                >
                  {t(SOURCE_LABEL_KEY[p.source_type], locale)}
                  {p.author_handle && (
                    <>
                      {' · '}
                      <Link
                        href={`/u/${p.author_handle}`}
                        style={{ color: 'var(--color-acc-deep)' }}
                      >
                        {p.author_display_name || `@${p.author_handle}`}
                      </Link>
                    </>
                  )}
                  {p.author_show_archetype && p.author_archetype && <> · {p.author_archetype}</>}
                </span>
                <span
                  style={{
                    fontFamily: serif,
                    fontSize: 18,
                    fontWeight: 500,
                    color: 'var(--color-acc)',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {p.slot}
                </span>
              </div>

              {p.entry_question && (
                <div
                  style={{
                    fontFamily: serif,
                    fontStyle: 'italic',
                    fontSize: 15,
                    color: 'var(--color-ink-soft)',
                    marginBottom: 10,
                    lineHeight: 1.4,
                  }}
                >
                  {p.entry_question}
                </div>
              )}
              {p.entry_title && (
                <div
                  style={{
                    fontFamily: serif,
                    fontSize: 18,
                    fontWeight: 500,
                    color: 'var(--color-ink)',
                    marginBottom: 6,
                    lineHeight: 1.3,
                  }}
                >
                  {p.entry_title}
                </div>
              )}
              {p.exercise_slug && (
                <div
                  style={{
                    fontFamily: sans,
                    fontSize: 12,
                    color: 'var(--color-acc-deep)',
                    marginBottom: 8,
                  }}
                >
                  {t('srch2.picks_exercise_label', locale)}{' '}
                  <Link
                    href={`/exercises/${p.exercise_slug}`}
                    style={{ color: 'var(--color-acc-deep)' }}
                  >
                    {p.exercise_slug}
                  </Link>
                </div>
              )}

              <p
                style={{
                  fontFamily: serif,
                  fontSize: 16,
                  color: 'var(--color-ink)',
                  lineHeight: 1.6,
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {p.entry_text}
              </p>

              {p.curator_note && (
                <div
                  style={{
                    marginTop: 14,
                    padding: '10px 14px',
                    background: '#F5EFDC',
                    borderRadius: 6,
                  }}
                >
                  <div
                    style={{
                      fontFamily: sans,
                      fontSize: 10,
                      fontWeight: 600,
                      color: 'var(--color-acc-deep)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.18em',
                      marginBottom: 4,
                    }}
                  >
                    {t('srch2.picks_why_this', locale)}
                  </div>
                  <div
                    style={{
                      fontFamily: serif,
                      fontStyle: 'italic',
                      fontSize: 14.5,
                      color: 'var(--color-ink-soft)',
                      lineHeight: 1.5,
                    }}
                  >
                    {p.curator_note}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
