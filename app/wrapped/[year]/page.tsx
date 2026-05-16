// /wrapped/[year] — screenshot-friendly year-in-review card.
//
// Mull's answer to Spotify Wrapped — a vertical 9:16 visual card that
// recaps the user's year: counts, top dimensional shifts, archetypes
// at start vs end of year. Designed to be screenshotted and posted to
// IG stories or X.
//
// Free, not Mull+ gated — virality matters more than gating. The
// Claude-essay retrospective at /account/retrospective stays Mull+
// (it's the deeper artifact, this is the share moment).
//
// Privacy: auth-gated, reads only the current user's own data via
// RLS. Other people's URLs return 404 / not-found rather than
// silently leaking.

import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import { DIM_KEYS, DIM_NAMES, topShifts } from '@/lib/dimensions';
import { ArchetypeSprite } from '@/components/archetype-sprite';
import MullWordmark from '@/components/mull-wordmark';

export const metadata: Metadata = {
  title: 'Your year in philosophy · Mull',
  robots: { index: false, follow: false },
};

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";
const serif = "'Cormorant Garamond', Georgia, serif";

type Attempt = {
  archetype: string;
  flavor: string | null;
  alignment_pct: number;
  vector: number[];
  taken_at: string;
};

type Dilemma = { vector_delta: number[] | null; created_at: string };
type Diary = { vector_delta: number[] | null; created_at: string };
type Reflection = { vector_delta: number[] | null; created_at: string };

function vecAdd(a: number[], b: number[]) {
  return a.map((v, i) => v + (b[i] || 0));
}

function archetypeSlug(name: string): string {
  return name
    .replace(/^The\s+/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default async function WrappedPage({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const { year: yearStr } = await params;
  const year = parseInt(yearStr, 10);
  if (!Number.isInteger(year) || year < 2024 || year > 2100) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/wrapped/${year}`);

  const start = `${year}-01-01T00:00:00Z`;
  const end = `${year + 1}-01-01T00:00:00Z`;

  // Parallel fetch — same shape as the retrospective panel, but no
  // Claude call.
  const [attemptsRes, dilemmasRes, diariesRes, reflectionsRes] = await Promise.all([
    supabase
      .from('quiz_attempts')
      .select('archetype, flavor, alignment_pct, vector, taken_at')
      .eq('user_id', user.id)
      .gte('taken_at', start)
      .lt('taken_at', end)
      .order('taken_at', { ascending: true })
      .returns<Attempt[]>(),
    supabase
      .from('dilemma_responses')
      .select('vector_delta, created_at')
      .eq('user_id', user.id)
      .gte('created_at', start)
      .lt('created_at', end)
      .returns<Dilemma[]>(),
    supabase
      .from('diary_entries')
      .select('vector_delta, created_at')
      .eq('user_id', user.id)
      .gte('created_at', start)
      .lt('created_at', end)
      .returns<Diary[]>(),
    supabase
      .from('exercise_reflections')
      .select('vector_delta, created_at')
      .eq('user_id', user.id)
      .gte('created_at', start)
      .lt('created_at', end)
      .returns<Reflection[]>(),
  ]);

  const attempts = attemptsRes.data ?? [];
  const dilemmas = dilemmasRes.data ?? [];
  const diaries = diariesRes.data ?? [];
  const reflections = reflectionsRes.data ?? [];

  // Aggregate the year's vector_delta into one summary so we can show
  // the user's biggest shifts. Quiz attempts re-snap the position
  // (absolute, not additive) so we just take the diff between first +
  // last for those; deltas from dilemmas/diaries/reflections sum.
  let summed: number[] = new Array(16).fill(0);
  for (const d of dilemmas) {
    if (Array.isArray(d.vector_delta) && d.vector_delta.length === 16) {
      summed = vecAdd(summed, d.vector_delta);
    }
  }
  for (const d of diaries) {
    if (Array.isArray(d.vector_delta) && d.vector_delta.length === 16) {
      summed = vecAdd(summed, d.vector_delta);
    }
  }
  for (const r of reflections) {
    if (Array.isArray(r.vector_delta) && r.vector_delta.length === 16) {
      summed = vecAdd(summed, r.vector_delta);
    }
  }
  // Quiz attempts: if more than one, add the first→last diff.
  if (attempts.length >= 2) {
    const first = attempts[0].vector;
    const last = attempts[attempts.length - 1].vector;
    if (Array.isArray(first) && Array.isArray(last) && first.length === 16 && last.length === 16) {
      const diff = last.map((v, i) => v - (first[i] || 0));
      summed = vecAdd(summed, diff);
    }
  }

  const top3Shifts = topShifts(summed, 0.5, 3);
  const firstArchetype = attempts[0] ?? null;
  const lastArchetype = attempts[attempts.length - 1] ?? null;
  const movedArchetypes =
    firstArchetype && lastArchetype && firstArchetype.archetype !== lastArchetype.archetype;

  const totalEntries =
    dilemmas.length + diaries.length + reflections.length;

  // Empty-year fallback. Show a quiet card instead of a wall of zeros.
  if (totalEntries === 0 && attempts.length === 0) {
    return <EmptyYear year={year} />;
  }

  const finalSlug = lastArchetype ? archetypeSlug(lastArchetype.archetype) : null;

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: '32px 16px',
      background: '#FAF6EC',
    }}>
      {/* Screenshot-target card. 9:16-ish aspect (~380×720) so phone
          screenshots crop perfectly to IG stories + TikTok shares. */}
      <article
        aria-label={`Mull year-in-review card for ${year}`}
        className="pixel-crisp"
        style={{
          width: '100%',
          maxWidth: 380,
          minHeight: 720,
          background: '#FFFCF4',
          border: '4px solid #221E18',
          boxShadow: '6px 6px 0 0 #B8862F',
          borderRadius: 0,
          padding: '24px 24px 28px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          color: '#221E18',
          position: 'relative',
        }}
      >
        {/* Title-bar amber strip */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: 8,
          background: '#B8862F',
          borderBottom: '2px solid #221E18',
        }} />

        {/* Top row: Mull wordmark + YEAR badge */}
        <div style={{
          width: '100%',
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginTop: 14,
          marginBottom: 24,
        }}>
          <MullWordmark as="div" />
          <div style={{
            fontFamily: pixel,
            fontSize: 10,
            color: '#8C6520',
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
          }}>
            ▸ {year} WRAPPED
          </div>
        </div>

        {/* Headline */}
        <h1 style={{
          fontFamily: pixel,
          fontSize: 22,
          margin: '0 0 18px',
          color: '#221E18',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          lineHeight: 1.15,
          textShadow: '3px 3px 0 #B8862F',
        }}>
          YOUR YEAR<br />IN PHILOSOPHY
        </h1>

        {/* Big-number stat grid — the most screenshotable element.
            Each cell is a chunky pixel tile with the count + label. */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10,
          width: '100%',
          marginBottom: 24,
        }}>
          <StatTile value={dilemmas.length} label="DILEMMAS" accent="#3D7DA8" />
          <StatTile value={diaries.length} label="DIARY" accent="#2F5D5C" />
          <StatTile value={reflections.length} label="REFLECTIONS" accent="#7A4A2E" />
          <StatTile value={attempts.length} label="QUIZ ATTEMPTS" accent="#B8862F" />
        </div>

        {/* Archetype shift narrative — first → last when changed. */}
        {movedArchetypes && firstArchetype && lastArchetype && (
          <div style={{
            width: '100%',
            padding: '14px 14px',
            background: '#F8EDC8',
            border: '3px solid #221E18',
            boxShadow: '3px 3px 0 0 #B8862F',
            borderRadius: 0,
            marginBottom: 24,
          }}>
            <div style={{
              fontFamily: pixel,
              fontSize: 9,
              color: '#8C6520',
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
              marginBottom: 8,
            }}>
              ▸ HOW YOU MOVED
            </div>
            <div style={{
              fontFamily: serif,
              fontStyle: 'italic',
              fontSize: 16,
              lineHeight: 1.45,
              color: '#221E18',
            }}>
              You started the year as a{' '}
              <strong style={{ fontStyle: 'normal' }}>
                {firstArchetype.archetype.replace(/^The /, '')}
              </strong>{' '}
              and ended as a{' '}
              <strong style={{ fontStyle: 'normal' }}>
                {lastArchetype.archetype.replace(/^The /, '')}
              </strong>.
            </div>
          </div>
        )}

        {/* Final archetype sprite + name (always present if any quiz). */}
        {lastArchetype && finalSlug && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: 22,
          }}>
            <div
              className="pixel-crisp"
              style={{
                width: 96,
                height: 96,
                background: '#F8EDC8',
                border: '4px solid #221E18',
                boxShadow: '4px 4px 0 0 #8C6520',
                padding: 8,
                marginBottom: 12,
              }}
              aria-hidden
            >
              <ArchetypeSprite archetypeKey={finalSlug} size={72} />
            </div>
            <div style={{
              fontFamily: serif,
              fontStyle: 'italic',
              fontSize: 13,
              color: '#8C6520',
              marginBottom: 2,
            }}>
              You ended the year as
            </div>
            <div style={{
              fontFamily: serif,
              fontSize: 22,
              fontWeight: 500,
              color: '#221E18',
              lineHeight: 1.1,
            }}>
              {lastArchetype.flavor ? `The ${lastArchetype.flavor} ` : 'The '}
              {lastArchetype.archetype.replace(/^The /, '')}
            </div>
          </div>
        )}

        {/* Top dimensional shifts — green for positive, brick for negative. */}
        {top3Shifts.length > 0 && (
          <div style={{
            width: '100%',
            marginBottom: 22,
          }}>
            <div style={{
              fontFamily: pixel,
              fontSize: 9,
              color: '#8C6520',
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
              marginBottom: 10,
              textAlign: 'left',
            }}>
              ▸ TOP SHIFTS
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {top3Shifts.map(s => (
                <div
                  key={s.key}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    background: s.delta > 0 ? '#E5F0EE' : '#F5E0E0',
                    border: `2px solid ${s.delta > 0 ? '#2F5D5C' : '#7A2E2E'}`,
                    borderRadius: 0,
                    fontFamily: serif,
                    fontSize: 14,
                  }}
                >
                  <span style={{ color: '#221E18' }}>
                    {DIM_NAMES[s.key as keyof typeof DIM_NAMES] || s.key}
                  </span>
                  <span style={{
                    fontFamily: pixel,
                    fontSize: 12,
                    color: s.delta > 0 ? '#2F5D5C' : '#7A2E2E',
                    letterSpacing: 0.4,
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    {s.delta > 0 ? '+' : ''}{s.delta.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom CTA — signature line. */}
        <div style={{
          marginTop: 'auto',
          paddingTop: 18,
          fontFamily: pixel,
          fontSize: 10,
          color: '#8C6520',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
        }}>
          ▸ FIND YOURS AT MULL.WORLD
        </div>
      </article>

      {/* Screenshot instructions — outside the card so they don't
          get captured. */}
      <div style={{
        marginTop: 28,
        maxWidth: 380,
        width: '100%',
        textAlign: 'center',
      }}>
        <div style={{
          padding: '12px 16px',
          background: '#E5F0EE',
          border: '3px solid #2F5D5C',
          boxShadow: '3px 3px 0 0 #2F5D5C',
          color: '#173533',
          fontFamily: serif,
          fontSize: 14,
          lineHeight: 1.5,
          marginBottom: 16,
        }}>
          📸 Screenshot the card above and share it to your story.
          Tag <strong>@mull</strong> if you&rsquo;d like.
        </div>
        <p style={{
          fontFamily: serif,
          fontStyle: 'italic',
          fontSize: 13,
          color: '#8C6520',
          margin: '0 0 18px',
          lineHeight: 1.55,
        }}>
          Long-press the card on iOS/Android, or use your phone&rsquo;s screenshot shortcut.
        </p>
        <Link href="/account" style={{
          fontFamily: pixel,
          fontSize: 11,
          color: '#8C6520',
          textDecoration: 'none',
          letterSpacing: 0.4,
          textTransform: 'uppercase',
          borderBottom: '2px solid #8C6520',
          paddingBottom: 1,
        }}>
          ◂ BACK TO YOUR ACCOUNT
        </Link>
      </div>
    </main>
  );
}

function StatTile({ value, label, accent }: { value: number; label: string; accent: string }) {
  return (
    <div style={{
      padding: '12px 8px',
      background: '#FFFCF4',
      border: '3px solid #221E18',
      boxShadow: `3px 3px 0 0 ${accent}`,
      borderRadius: 0,
    }}>
      <div style={{
        fontFamily: pixel,
        fontSize: 28,
        color: '#221E18',
        lineHeight: 1,
        letterSpacing: 0.4,
      }}>
        {value}
      </div>
      <div style={{
        fontFamily: pixel,
        fontSize: 8,
        color: accent,
        textTransform: 'uppercase',
        letterSpacing: '0.18em',
        marginTop: 6,
      }}>
        {label}
      </div>
    </div>
  );
}

function EmptyYear({ year }: { year: number }) {
  return (
    <main style={{ maxWidth: 480, margin: '0 auto', padding: '80px 24px' }}>
      <div style={{
        padding: '32px 30px',
        background: '#FFFCF4',
        border: '4px solid #221E18',
        boxShadow: '6px 6px 0 0 #B8862F',
        borderRadius: 0,
        textAlign: 'center',
      }}>
        <div style={{
          fontFamily: pixel,
          fontSize: 12,
          color: '#8C6520',
          textTransform: 'uppercase',
          letterSpacing: '0.18em',
          marginBottom: 14,
        }}>
          ▸ {year} WRAPPED
        </div>
        <h1 style={{
          fontFamily: serif,
          fontSize: 30,
          fontWeight: 500,
          margin: '0 0 14px',
          letterSpacing: '-0.5px',
          lineHeight: 1.15,
        }}>
          No year to wrap yet.
        </h1>
        <p style={{
          fontFamily: serif,
          fontStyle: 'italic',
          fontSize: 16,
          color: '#4A4338',
          margin: '0 0 28px',
          lineHeight: 1.55,
        }}>
          You haven&rsquo;t taken a quiz, answered a dilemma, written a diary entry,
          or saved an exercise reflection in {year}. Come back at year&rsquo;s end —
          or now, and start.
        </p>
        <Link
          href="/dilemma"
          className="pixel-press"
          style={{
            display: 'inline-block',
            padding: '12px 22px',
            background: '#221E18',
            color: '#FAF6EC',
            border: '4px solid #221E18',
            boxShadow: '4px 4px 0 0 #B8862F',
            borderRadius: 0,
            fontFamily: pixel,
            fontSize: 12,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            textDecoration: 'none',
            transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end)',
          }}
        >
          ▸ TODAY&apos;S DILEMMA
        </Link>
      </div>
    </main>
  );
}
