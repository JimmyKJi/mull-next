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

const serif = "'Cormorant Garamond', Georgia, serif";
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

const SOURCE_LABEL: Record<Pick['source_type'], string> = {
  dilemma: 'Daily dilemma',
  diary: 'Diary',
  exercise: 'Exercise reflection',
};

export default async function EditorPicks({ locale = 'en' }: { locale?: string }) {
  const supabase = await createClient();
  const week = weekKey();
  const { data, error } = await supabase
    .rpc('get_editor_picks_for_week', { in_week_start: week });

  const picks = (error ? [] : (data ?? [])) as Pick[];

  return (
    <section style={{ marginBottom: 48 }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'baseline', marginBottom: 8, flexWrap: 'wrap', gap: 8,
      }}>
        <h2 style={{
          fontFamily: 'var(--font-pixel-display, "Courier New", monospace)',
          fontSize: 22, fontWeight: 400,
          margin: 0, color: '#221E18', letterSpacing: '0.04em',
          textShadow: '3px 3px 0 #B8862F', lineHeight: 1.1,
        }}>
          EDITOR&rsquo;S PICKS
        </h2>
        <span style={{
          fontFamily: sans, fontSize: 11, fontWeight: 600,
          color: '#8C6520', textTransform: 'uppercase',
          letterSpacing: '0.16em',
        }}>
          {weekRangeLabel(week, locale)}
        </span>
      </div>
      <p style={{
        fontFamily: serif, fontStyle: 'italic',
        fontSize: 16, color: '#4A4338',
        margin: '0 0 22px', lineHeight: 1.55,
      }}>
        Three publicly posted entries — dilemma, diary, or exercise reflection — chosen this week for the kind of attention they reward. A different three each week.
      </p>

      {picks.length === 0 ? (
        <p style={{
          fontFamily: serif, fontStyle: 'italic',
          fontSize: 15, color: '#8C6520',
          padding: '16px 18px',
          background: '#FFFCF4', border: '1px dashed #D6CDB6',
          borderRadius: 8, margin: 0,
        }}>
          No picks this week yet. Check back in a few days, or set your own entries to public to be eligible for next week&rsquo;s round.
        </p>
      ) : (
        <ol style={{
          listStyle: 'none', padding: 0, margin: 0,
          display: 'grid', gap: 14,
        }}>
          {picks.map(p => (
            <li key={`${p.slot}-${p.source_id}`} style={{
              padding: '18px 22px',
              background: '#FFFCF4',
              border: '4px solid #221E18',
              boxShadow: '4px 4px 0 0 #B8862F',
              borderRadius: 0,
            }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'baseline', flexWrap: 'wrap', gap: 8,
                marginBottom: 8,
              }}>
                <span style={{
                  fontFamily: sans, fontSize: 11, fontWeight: 600,
                  color: '#8C6520', textTransform: 'uppercase',
                  letterSpacing: '0.16em',
                }}>
                  {SOURCE_LABEL[p.source_type]}
                  {p.author_handle && (
                    <>
                      {' · '}
                      <Link href={`/u/${p.author_handle}`} style={{ color: '#8C6520' }}>
                        {p.author_display_name || `@${p.author_handle}`}
                      </Link>
                    </>
                  )}
                  {p.author_show_archetype && p.author_archetype && (
                    <> · {p.author_archetype}</>
                  )}
                </span>
                <span style={{
                  fontFamily: serif, fontSize: 18, fontWeight: 500,
                  color: '#B8862F', fontVariantNumeric: 'tabular-nums',
                }}>
                  {p.slot}
                </span>
              </div>

              {p.entry_question && (
                <div style={{
                  fontFamily: serif, fontStyle: 'italic',
                  fontSize: 15, color: '#4A4338',
                  marginBottom: 10, lineHeight: 1.4,
                }}>
                  {p.entry_question}
                </div>
              )}
              {p.entry_title && (
                <div style={{
                  fontFamily: serif, fontSize: 18, fontWeight: 500,
                  color: '#221E18', marginBottom: 6, lineHeight: 1.3,
                }}>
                  {p.entry_title}
                </div>
              )}
              {p.exercise_slug && (
                <div style={{
                  fontFamily: sans, fontSize: 12, color: '#8C6520',
                  marginBottom: 8,
                }}>
                  Exercise: <Link href={`/exercises/${p.exercise_slug}`} style={{ color: '#8C6520' }}>{p.exercise_slug}</Link>
                </div>
              )}

              <p style={{
                fontFamily: serif, fontSize: 16, color: '#221E18',
                lineHeight: 1.6, margin: 0,
                whiteSpace: 'pre-wrap',
              }}>
                {p.entry_text}
              </p>

              {p.curator_note && (
                <div style={{
                  marginTop: 14, padding: '10px 14px',
                  background: '#F5EFDC', borderRadius: 6,
                }}>
                  <div style={{
                    fontFamily: sans, fontSize: 10, fontWeight: 600,
                    color: '#8C6520', textTransform: 'uppercase',
                    letterSpacing: '0.18em', marginBottom: 4,
                  }}>
                    Why this
                  </div>
                  <div style={{
                    fontFamily: serif, fontStyle: 'italic',
                    fontSize: 14.5, color: '#4A4338', lineHeight: 1.5,
                  }}>
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
