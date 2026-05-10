// "Original thinking" tab on /search. Shows recent diary entries
// where Claude flagged the writing as voicing something the canon
// doesn't capture (is_novel = true) AND the user has marked the
// entry public.
//
// Server component. The RLS policy on diary_entries permits anyone
// to SELECT rows where is_public = true (existing policy from when
// public diary entries were added). The partial index
// `diary_entries_novel_public_idx` keeps this lookup cheap.
//
// We only render entries from authors whose public_profiles row has
// `is_public = true` — same gate as Editor's picks, so a user
// flipping their profile back to private hides their old novels too.

import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';

const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'Inter', system-ui, sans-serif";

type KinshipPhilosopher = { slug: string; name: string; similarity: number; why: string };
type Kinship = { philosophers: KinshipPhilosopher[]; traditions: string[] };

type Row = {
  id: string;
  title: string | null;
  content: string;
  diagnosis: string | null;
  kinship: Kinship | null;
  created_at: string;
  user_id: string;
  author_handle: string | null;
  author_display_name: string | null;
};

export default async function OriginalThinking() {
  const supabase = await createClient();

  // Pull recent public-and-novel diary entries. JOIN against the
  // public_profiles table to attach handle + display name only when
  // the author has an active public profile.
  const { data, error } = await supabase
    .from('diary_entries')
    .select(`
      id, title, content, diagnosis, kinship, created_at, user_id,
      public_profiles!inner ( handle, display_name, is_public )
    `)
    .eq('is_novel', true)
    .eq('is_public', true)
    .eq('public_profiles.is_public', true)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('[search/original-thinking] failed', error);
  }

  // Supabase returns the joined table as a nested object/array; flatten.
  const rows: Row[] = ((data ?? []) as unknown as Array<{
    id: string; title: string | null; content: string; diagnosis: string | null;
    kinship: Kinship | null; created_at: string; user_id: string;
    public_profiles: { handle: string | null; display_name: string | null } | { handle: string | null; display_name: string | null }[] | null;
  }>).map(r => {
    const pp = Array.isArray(r.public_profiles) ? r.public_profiles[0] : r.public_profiles;
    return {
      id: r.id,
      title: r.title,
      content: r.content,
      diagnosis: r.diagnosis,
      kinship: r.kinship,
      created_at: r.created_at,
      user_id: r.user_id,
      author_handle: pp?.handle ?? null,
      author_display_name: pp?.display_name ?? null,
    };
  });

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
        Public diary entries voicing moves the philosophical canon doesn&rsquo;t
        strongly capture. The judgement is conservative — most entries are
        echoes; here are the ones that aren&rsquo;t.
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
          {rows.map(r => {
            const preview = r.content.length > 320
              ? r.content.slice(0, 317).trimEnd() + '…'
              : r.content;
            return (
              <li key={r.id} style={{
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
                    ✦ Original
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

                <p style={{
                  fontFamily: serif, fontSize: 16, color: '#221E18',
                  lineHeight: 1.6, margin: 0, marginBottom: 12,
                  whiteSpace: 'pre-wrap',
                }}>
                  {preview}
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

                {r.kinship && r.kinship.traditions.length > 0 && (
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
            );
          })}
        </ol>
      )}
    </section>
  );
}
