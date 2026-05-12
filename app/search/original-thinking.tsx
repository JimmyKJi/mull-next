// "Original thinking" tab on /search.
//
// Shows recent free-text entries — diary entries, dilemma responses,
// and exercise reflections — that Claude flagged as voicing something
// the canon doesn't strongly capture (is_novel = true) AND that the
// user explicitly marked as public.
//
// Server component. The RLS policies on diary_entries, dilemma_responses,
// and exercise_reflections all permit anyone to SELECT rows where
// `is_public = true`. Partial indexes (`*_novel_public_idx`) keep these
// lookups cheap even as the corpora grow.
//
// Profile-existence gate: we use `public_profiles!inner` so an entry only
// surfaces when its author still has an active public profile (deleting
// the profile pulls the entry back into private space).

import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { findExercise } from '@/lib/exercises';

const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'Inter', system-ui, sans-serif";

// ─── Shared shapes ───────────────────────────────────────────────────

type KinshipPhilosopher = { slug: string; name: string; similarity: number; why: string };
type Kinship = { philosophers: KinshipPhilosopher[]; traditions: string[] };

/** What each entry-type query returns from Supabase before normalization. */
type RawDiary = {
  id: string;
  title: string | null;
  content: string;
  diagnosis: string | null;
  kinship: Kinship | null;
  created_at: string;
  user_id: string;
  public_profiles: Profile | Profile[] | null;
};
type RawDilemma = {
  id: string;
  question_text: string | null;
  response_text: string;
  dilemma_date: string;
  diagnosis: string | null;
  kinship: Kinship | null;
  created_at: string;
  user_id: string;
  public_profiles: Profile | Profile[] | null;
};
type RawExercise = {
  id: string;
  exercise_slug: string;
  content: string;
  diagnosis: string | null;
  kinship: Kinship | null;
  created_at: string;
  user_id: string;
  public_profiles: Profile | Profile[] | null;
};
type Profile = { handle: string | null; display_name: string | null };

/** Unified shape we render. */
type OriginalEntry = {
  sourceType: 'diary' | 'dilemma' | 'exercise';
  sourceLabel: string;          // "Diary", "Today's dilemma", "Exercise · Premortem"
  id: string;
  title: string | null;         // diary entries have titles; others don't
  context: string | null;       // the prompt the user was responding to (dilemma + exercise)
  preview: string;              // what we render as the body preview
  diagnosis: string | null;
  kinship: Kinship | null;
  created_at: string;
  author_handle: string | null;
  author_display_name: string | null;
};

// PostgREST sometimes returns the joined `public_profiles` as a single
// object, sometimes as an array — depends on whether it inferred 1:1
// or 1:N from the FK config. Normalize either way.
function pickProfile(pp: Profile | Profile[] | null): Profile | null {
  if (!pp) return null;
  if (Array.isArray(pp)) return pp[0] ?? null;
  return pp;
}

// Truncate preserving word boundaries when convenient.
function preview(text: string, max = 320): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1).trimEnd() + '…';
}

// ─── Component ───────────────────────────────────────────────────────

export default async function OriginalThinking() {
  const supabase = await createClient();

  // Fan out three queries in parallel — one per source table. Each pulls
  // up to PER_SOURCE_LIMIT recent novel+public entries with the author's
  // profile attached. We merge afterwards and take TOTAL_LIMIT across.
  const PER_SOURCE_LIMIT = 20;
  const TOTAL_LIMIT = 20;

  const [diaryRes, dilemmaRes, exerciseRes] = await Promise.all([
    supabase
      .from('diary_entries')
      .select(`
        id, title, content, diagnosis, kinship, created_at, user_id,
        public_profiles!inner ( handle, display_name )
      `)
      .eq('is_novel', true)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(PER_SOURCE_LIMIT),
    supabase
      .from('dilemma_responses')
      .select(`
        id, question_text, response_text, dilemma_date, diagnosis, kinship, created_at, user_id,
        public_profiles!inner ( handle, display_name )
      `)
      .eq('is_novel', true)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(PER_SOURCE_LIMIT),
    supabase
      .from('exercise_reflections')
      .select(`
        id, exercise_slug, content, diagnosis, kinship, created_at, user_id,
        public_profiles!inner ( handle, display_name )
      `)
      .eq('is_novel', true)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(PER_SOURCE_LIMIT),
  ]);

  if (diaryRes.error) console.error('[search/original-thinking] diary query failed', diaryRes.error);
  if (dilemmaRes.error) console.error('[search/original-thinking] dilemma query failed', dilemmaRes.error);
  if (exerciseRes.error) console.error('[search/original-thinking] exercise query failed', exerciseRes.error);

  const diaryRows: OriginalEntry[] = ((diaryRes.data ?? []) as unknown as RawDiary[]).map(r => {
    const pp = pickProfile(r.public_profiles);
    return {
      sourceType: 'diary',
      sourceLabel: 'Diary',
      id: r.id,
      title: r.title,
      context: null,
      preview: preview(r.content),
      diagnosis: r.diagnosis,
      kinship: r.kinship,
      created_at: r.created_at,
      author_handle: pp?.handle ?? null,
      author_display_name: pp?.display_name ?? null,
    };
  });

  const dilemmaRows: OriginalEntry[] = ((dilemmaRes.data ?? []) as unknown as RawDilemma[]).map(r => {
    const pp = pickProfile(r.public_profiles);
    return {
      sourceType: 'dilemma',
      sourceLabel: 'Daily dilemma',
      id: r.id,
      title: null,
      context: r.question_text,
      preview: preview(r.response_text),
      diagnosis: r.diagnosis,
      kinship: r.kinship,
      created_at: r.created_at,
      author_handle: pp?.handle ?? null,
      author_display_name: pp?.display_name ?? null,
    };
  });

  const exerciseRows: OriginalEntry[] = ((exerciseRes.data ?? []) as unknown as RawExercise[]).map(r => {
    const pp = pickProfile(r.public_profiles);
    // Resolve the exercise's display name from the slug so the label
    // reads like "Exercise · Premortem" rather than "exercise-reflections-premortem".
    const ex = findExercise(r.exercise_slug);
    return {
      sourceType: 'exercise',
      sourceLabel: ex ? `Exercise · ${ex.name}` : 'Exercise reflection',
      id: r.id,
      title: null,
      context: ex?.reflection ?? null,
      preview: preview(r.content),
      diagnosis: r.diagnosis,
      kinship: r.kinship,
      created_at: r.created_at,
      author_handle: pp?.handle ?? null,
      author_display_name: pp?.display_name ?? null,
    };
  });

  // Merge + sort by recency, cap at the cross-source total.
  const rows: OriginalEntry[] = [...diaryRows, ...dilemmaRows, ...exerciseRows]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, TOTAL_LIMIT);

  return (
    <section style={{ marginBottom: 48 }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'baseline', marginBottom: 8, flexWrap: 'wrap', gap: 8,
      }}>
        <h2 style={{
          fontFamily: serif, fontSize: 28, fontWeight: 500,
          margin: 0, color: '#221E18', letterSpacing: '-0.3px',
        }}>
          Original thinking
        </h2>
        <span style={{
          fontFamily: sans, fontSize: 11, fontWeight: 600,
          color: '#6B3E8C', textTransform: 'uppercase',
          letterSpacing: '0.16em',
        }}>
          ✦ outside the canon
        </span>
      </div>
      <p style={{
        fontFamily: serif, fontStyle: 'italic',
        fontSize: 16, color: '#4A4338',
        margin: '0 0 22px', lineHeight: 1.55,
      }}>
        Public writing — diary entries, dilemma responses, and exercise
        reflections — voicing moves the philosophical canon doesn&rsquo;t
        strongly capture. The judgement is conservative; most entries
        are echoes, and only the ones that aren&rsquo;t land here.
      </p>

      {rows.length === 0 ? (
        <p style={{
          fontFamily: serif, fontStyle: 'italic',
          fontSize: 15, color: '#8C6520',
          padding: '16px 18px',
          background: '#FFFCF4', border: '1px dashed #D6CDB6',
          borderRadius: 8, margin: 0,
        }}>
          No entries here yet. Once someone writes something genuinely
          uncovered by the canon and marks it public, it surfaces here.
        </p>
      ) : (
        <ol style={{
          listStyle: 'none', padding: 0, margin: 0,
          display: 'grid', gap: 14,
        }}>
          {rows.map(r => (
            <li key={`${r.sourceType}:${r.id}`} style={{
              padding: '18px 22px',
              background: '#FFFCF4',
              border: '1px solid #EBE3CA',
              borderLeft: '3px solid #6B3E8C',
              borderRadius: 8,
            }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'baseline', flexWrap: 'wrap', gap: 8,
                marginBottom: 8,
              }}>
                <span style={{
                  fontFamily: sans, fontSize: 11, fontWeight: 600,
                  color: '#6B3E8C', textTransform: 'uppercase',
                  letterSpacing: '0.16em',
                }}>
                  ✦ {r.sourceLabel}
                  {r.author_handle && (
                    <>
                      {' · '}
                      <Link href={`/u/${r.author_handle}`} style={{ color: '#6B3E8C' }}>
                        {r.author_display_name || `@${r.author_handle}`}
                      </Link>
                    </>
                  )}
                </span>
                <span style={{
                  fontFamily: sans, fontSize: 11.5, color: '#8C6520',
                }}>
                  {new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>

              {r.title && (
                <div style={{
                  fontFamily: serif, fontSize: 19, fontWeight: 500,
                  color: '#221E18', marginBottom: 6, lineHeight: 1.3,
                }}>
                  {r.title}
                </div>
              )}

              {/* Prompt context for dilemmas + exercises — the question or
                  reflection prompt the writer was responding to. Helps
                  readers understand the preview without clicking through. */}
              {r.context && (
                <p style={{
                  fontFamily: serif, fontStyle: 'italic',
                  fontSize: 14.5, color: '#8C6520',
                  margin: '0 0 10px', lineHeight: 1.5,
                }}>
                  {r.context}
                </p>
              )}

              <p style={{
                fontFamily: serif, fontSize: 16, color: '#221E18',
                lineHeight: 1.6, margin: 0, marginBottom: 12,
                whiteSpace: 'pre-wrap',
              }}>
                {r.preview}
              </p>

              {r.diagnosis && (
                <div style={{
                  padding: '10px 14px',
                  background: '#F1EAD8',
                  borderRadius: 6,
                }}>
                  <div style={{
                    fontFamily: sans, fontSize: 10, fontWeight: 600,
                    color: '#6B3E8C', textTransform: 'uppercase',
                    letterSpacing: '0.18em', marginBottom: 4,
                  }}>
                    Why this is original
                  </div>
                  <div style={{
                    fontFamily: serif, fontStyle: 'italic',
                    fontSize: 14.5, color: '#4A4338', lineHeight: 1.5,
                  }}>
                    {r.diagnosis}
                  </div>
                </div>
              )}

              {r.kinship && r.kinship.traditions && r.kinship.traditions.length > 0 && (
                <div style={{
                  display: 'flex', flexWrap: 'wrap', gap: 6,
                  marginTop: 10,
                }}>
                  {r.kinship.traditions.map(tr => (
                    <span key={tr} style={{
                      fontFamily: sans, fontSize: 11.5, color: '#8C6520',
                      padding: '3px 10px',
                      background: '#F5EFDC',
                      border: '1px solid #E2D8B6',
                      borderRadius: 999,
                      letterSpacing: 0.2,
                    }}>
                      adjacent to {tr}
                    </span>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
