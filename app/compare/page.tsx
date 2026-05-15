// /compare?you=handleA&them=handleB — overlay two public profiles
// side by side. Highlights the top 3 dimensions where they diverge,
// in plain language, plus a full 16-dim table.
//
// Privacy: only works when BOTH users have public profiles
// (`is_searchable=true` on public_profiles). Respects per-field
// visibility — if one user has show_dimensions off, we hide their
// individual dim scores in the table but still compute divergences
// over the underlying vectors (since they opted into a public
// profile, their position is already exposed via the constellation
// embed elsewhere).

import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { DIM_KEYS, DIM_NAMES } from '@/lib/dimensions';
import { ARCHETYPES } from '@/lib/archetypes';
import { FIGURES } from '@/lib/figures';
import { topDivergences, topConvergences } from '@/lib/dim-narration';

const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'Inter', system-ui, sans-serif";

export const metadata: Metadata = {
  title: 'Compare two minds',
  description: 'Side-by-side worldview comparison across 16 dimensions of thought.',
  alternates: { canonical: 'https://mull.world/compare' },
};

type TrajectoryEvent = {
  kind: 'q' | 'd' | 'j' | 'e';
  vec?: number[] | null;
  delta?: number[] | null;
  ts?: string;
};

type Profile = {
  user_id: string;
  handle: string;
  display_name: string | null;
  show_archetype: boolean;
  show_dimensions: boolean;
  show_map: boolean;
  show_streak: boolean;
};

function vecAdd(a: number[], b: number[]): number[] {
  const out = new Array(16).fill(0);
  for (let i = 0; i < 16; i++) out[i] = (a[i] || 0) + (b[i] || 0);
  return out;
}

// Walk the trajectory events the same way /u/[handle] does — quizzes
// reset the position; dilemmas/diary/exercise add deltas.
function reconstructPosition(events: TrajectoryEvent[]): number[] {
  let pos = new Array(16).fill(0);
  for (const ev of events) {
    if (ev.kind === 'q' && Array.isArray(ev.vec) && ev.vec.length === 16) {
      pos = ev.vec.slice();
    } else if (Array.isArray(ev.delta) && ev.delta.length === 16) {
      pos = vecAdd(pos, ev.delta);
    }
  }
  return pos;
}

async function fetchUser(handle: string) {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('public_profiles')
    .select('user_id, handle, display_name, show_archetype, show_dimensions, show_map, show_streak')
    .eq('handle', handle.toLowerCase())
    .maybeSingle<Profile>();
  if (!profile) return null;

  const [{ data: trajRows }, { data: archRows }] = await Promise.all([
    supabase.rpc('get_public_trajectory', { p_user_id: profile.user_id }),
    supabase.rpc('get_public_latest_archetype', { p_user_id: profile.user_id }),
  ]);

  const events = (trajRows as TrajectoryEvent[] | null) ?? [];
  const sorted = [...events].sort((a, b) => {
    const at = a.ts ? new Date(a.ts).getTime() : 0;
    const bt = b.ts ? new Date(b.ts).getTime() : 0;
    return at - bt;
  });
  const position = reconstructPosition(sorted);

  const arch = (archRows as Array<{ archetype: string; flavor: string | null }> | null)?.[0] ?? null;

  return { profile, position, archetype: arch };
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ you?: string; them?: string }>;
}) {
  const sp = await searchParams;
  const youHandle = (sp.you || '').trim().toLowerCase();
  const themHandle = (sp.them || '').trim().toLowerCase();

  // No params yet → show the entry form.
  if (!youHandle || !themHandle) {
    return <ComparePicker initialYou={youHandle} initialThem={themHandle} />;
  }

  const [you, them] = await Promise.all([
    fetchUser(youHandle),
    fetchUser(themHandle),
  ]);

  if (!you || !them) {
    return (
      <main style={{ maxWidth: 720, margin: '60px auto', padding: '0 24px 120px' }}>
        <h1 style={{ fontFamily: serif, fontSize: 36, fontWeight: 500, margin: 0 }}>
          One of those handles doesn&rsquo;t resolve
        </h1>
        <p style={{ fontFamily: serif, fontStyle: 'italic', color: '#4A4338', marginTop: 12 }}>
          Either the handle has a typo, or that profile isn&rsquo;t public. Both users need to have opted into a public profile (Account → Public profile settings) for the comparison to work.
        </p>
        <p style={{ marginTop: 24 }}>
          <Link href="/compare" style={{ color: '#8C6520' }}>← Try different handles</Link>
        </p>
      </main>
    );
  }

  const divergences = topDivergences(you.position, them.position, 3);
  const convergences = topConvergences(you.position, them.position, 3);
  const youName = you.profile.display_name || `@${you.profile.handle}`;
  const themName = them.profile.display_name || `@${them.profile.handle}`;
  const youSlug = archetypeKey(you.archetype?.archetype);
  const themSlug = archetypeKey(them.archetype?.archetype);

  return (
    <main className="mx-auto max-w-[920px] px-6 pb-32 pt-10 sm:px-10">
      <div
        className="flex items-center gap-3 text-[10px] tracking-[0.22em] text-[#8C6520]"
        style={{ fontFamily: 'var(--font-pixel-display)' }}
      >
        <span aria-hidden className="inline-block h-2 w-2 bg-[#B8862F]" />
        ▶ COMPARE TWO MINDS
      </div>
      <h1
        className="mt-5 pr-2 text-[24px] leading-[1.1] tracking-[0.04em] text-[#221E18] sm:text-[32px] md:text-[40px]"
        style={{ fontFamily: 'var(--font-pixel-display)' }}
      >
        <span style={{ textShadow: '3px 3px 0 #B8862F' }}>
          {youName.toUpperCase()} VS {themName.toUpperCase()}
        </span>
      </h1>
      <p
        className="mt-5 text-[16px] italic leading-[1.55] text-[#4A4338]"
        style={{ fontFamily: 'var(--font-prose)' }}
      >
        Two worldviews, sixteen dimensions. Where you converge, and where
        you don&rsquo;t.
      </p>
      <div className="mb-8" />

      {/* Side-by-side hero cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 16,
        marginBottom: 36,
      }}>
        <UserHeroCard
          name={youName}
          handle={you.profile.handle}
          archetype={you.profile.show_archetype ? you.archetype?.archetype ?? null : null}
          flavor={you.profile.show_archetype ? you.archetype?.flavor ?? null : null}
          slug={you.profile.show_archetype ? youSlug : null}
        />
        <UserHeroCard
          name={themName}
          handle={them.profile.handle}
          archetype={them.profile.show_archetype ? them.archetype?.archetype ?? null : null}
          flavor={them.profile.show_archetype ? them.archetype?.flavor ?? null : null}
          slug={them.profile.show_archetype ? themSlug : null}
        />
      </div>

      {/* Top divergences in plain language */}
      <section style={{
        marginBottom: 36,
        padding: '24px 26px',
        background: '#FFFCF4',
        border: '4px solid #221E18',
        boxShadow: '5px 5px 0 0 #B8862F',
        borderRadius: 0,
      }}>
        <div style={{ ...eyebrow, color: '#B8862F' }}>▸ WHERE YOU DIVERGE MOST</div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 16 }}>
          {divergences.length === 0 ? (
            <li style={{ fontFamily: serif, fontStyle: 'italic', color: '#8C6520' }}>
              Not enough data to compute divergence — one of you may not have taken the quiz yet.
            </li>
          ) : divergences.map((d, i) => (
            <li key={d.key}>
              <div style={{
                fontFamily: 'var(--font-pixel-display)', fontSize: 11,
                color: '#8C6520', textTransform: 'uppercase',
                letterSpacing: '0.18em', marginBottom: 8,
              }}>
                ▸ {(i === 0 ? 'Biggest divergence' : `#${i + 1}`).toUpperCase()} · {d.label}
                {d.poleFlip && (
                  <span style={{
                    marginLeft: 10,
                    padding: '2px 6px',
                    color: '#FAF6EC',
                    background: '#7A2E2E',
                    border: '2px solid #221E18',
                    fontSize: 9,
                    letterSpacing: '0.18em',
                  }}>↔ OPPOSITE POLES</span>
                )}
              </div>
              <p style={{
                fontFamily: serif, fontSize: 16, color: '#221E18',
                margin: 0, lineHeight: 1.55,
              }}>
                <strong style={{ fontWeight: 500 }}>{youName}</strong> {d.aText}.
                <br />
                <strong style={{ fontWeight: 500 }}>{themName}</strong> {d.bText}.
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* Top convergences — counterpart section. Only renders when
          there are dimensions where both users have real signal AND
          land on the same side; pure 0/0 ties (shared lack of
          opinion) are filtered out by topConvergences(). */}
      {convergences.length > 0 && (
        <section style={{
          marginBottom: 36,
          padding: '24px 26px',
          background: '#FFFCF4',
          border: '4px solid #221E18',
          boxShadow: '5px 5px 0 0 #2F5D5C',
          borderRadius: 0,
        }}>
          <div style={{ ...eyebrow, color: '#2F5D5C' }}>▸ WHERE YOU CONVERGE MOST</div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 16 }}>
            {convergences.map((c, i) => (
              <li key={c.key}>
                <div style={{
                  fontFamily: 'var(--font-pixel-display)', fontSize: 11,
                  color: '#2F5D5C', textTransform: 'uppercase',
                  letterSpacing: '0.18em', marginBottom: 8,
                }}>
                  ▸ {(i === 0 ? 'Strongest agreement' : `#${i + 1}`).toUpperCase()} · {c.label}
                </div>
                <p style={{
                  fontFamily: serif, fontSize: 16, color: '#221E18',
                  margin: 0, lineHeight: 1.55,
                }}>
                  <strong style={{ fontWeight: 500 }}>{youName}</strong> {c.aText}.
                  <br />
                  <strong style={{ fontWeight: 500 }}>{themName}</strong> {c.bText}.
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Full 16-dim side-by-side table */}
      <section style={{ marginBottom: 36 }}>
        <div style={eyebrow}>▸ ALL SIXTEEN DIMENSIONS</div>
        <div style={{
          background: '#FFFCF4',
          border: '4px solid #221E18',
          boxShadow: '5px 5px 0 0 #8C6520',
          borderRadius: 0,
          overflow: 'hidden',
        }}>
          {DIM_KEYS.map((k, i) => {
            const va = you.position[i] ?? 0;
            const vb = them.position[i] ?? 0;
            const showA = you.profile.show_dimensions;
            const showB = them.profile.show_dimensions;
            return (
              <div key={k} style={{
                display: 'grid',
                gridTemplateColumns: '1.4fr 1fr 1fr',
                gap: 12,
                padding: '12px 16px',
                borderTop: i === 0 ? 'none' : '2px dashed #D6CDB6',
                fontFamily: serif, fontSize: 15,
                color: '#221E18',
                alignItems: 'center',
              }}>
                <div style={{ fontWeight: 500 }}>{DIM_NAMES[k as keyof typeof DIM_NAMES]}</div>
                <DimBar value={showA ? va : null} />
                <DimBar value={showB ? vb : null} />
              </div>
            );
          })}
        </div>
        <p style={{
          fontFamily: sans, fontSize: 12, color: '#8C6520',
          margin: '10px 4px 0', opacity: 0.85, lineHeight: 1.55,
        }}>
          Bars show position on each dimension (0–12). Hidden when a user has turned <em>show dimensions</em> off in their public profile settings.
        </p>
      </section>

      {/* Footer with try-another link */}
      <p style={{
        marginTop: 28, textAlign: 'center',
        fontFamily: sans, fontSize: 13, color: '#8C6520',
      }}>
        <Link href="/compare" style={{ color: '#8C6520', textDecoration: 'underline', textUnderlineOffset: 3 }}>
          Compare different handles →
        </Link>
      </p>
    </main>
  );
}

function archetypeKey(name?: string | null): string | null {
  if (!name) return null;
  const cleaned = name.replace(/^The\s+/i, '').toLowerCase();
  return ARCHETYPES.find(a => a.key === cleaned)?.key ?? null;
}

function UserHeroCard({
  name, handle, archetype, flavor, slug,
}: {
  name: string;
  handle: string;
  archetype: string | null;
  flavor: string | null;
  slug: string | null;
}) {
  const figure = slug ? FIGURES[slug] || '' : '';
  return (
    <div style={{
      padding: '20px 22px',
      background: '#FFFCF4',
      border: '4px solid #221E18',
      boxShadow: '4px 4px 0 0 #B8862F',
      borderRadius: 0,
    }}>
      <div style={{
        display: 'flex', gap: 14, alignItems: 'center', marginBottom: 12,
      }}>
        {figure && (
          <Link href={slug ? `/archetype/${slug}` : '#'} className="pixel-press pixel-crisp" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 64, height: 64, flexShrink: 0,
            background: '#F8EDC8', borderRadius: 0,
            border: '3px solid #221E18',
            boxShadow: '3px 3px 0 0 #8C6520',
            padding: 6,
            textDecoration: 'none',
            transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end)',
          }}>
            <span aria-hidden style={{ width: '100%', height: '100%' }}
              dangerouslySetInnerHTML={{ __html: figure }} />
          </Link>
        )}
        <div style={{ minWidth: 0, flex: 1 }}>
          <Link href={`/u/${handle}`} style={{
            fontFamily: serif, fontSize: 22, fontWeight: 500,
            color: '#221E18', textDecoration: 'none',
            display: 'block', lineHeight: 1.2,
          }}>{name}</Link>
          <span style={{
            fontFamily: sans, fontSize: 12,
            color: '#8C6520', letterSpacing: 0.2,
          }}>@{handle}</span>
        </div>
      </div>
      {archetype ? (
        <div style={{
          fontFamily: serif, fontStyle: 'italic',
          fontSize: 15, color: '#4A4338', lineHeight: 1.4,
        }}>
          {flavor ? `${flavor} ` : ''}{archetype.replace(/^The\s+/i, '')}
        </div>
      ) : (
        <div style={{
          fontFamily: sans, fontSize: 12.5,
          color: '#8C6520', fontStyle: 'italic',
        }}>
          Archetype hidden by user
        </div>
      )}
    </div>
  );
}

function DimBar({ value }: { value: number | null }) {
  if (value == null) {
    return (
      <span style={{
        fontFamily: sans, fontSize: 11, fontStyle: 'italic',
        color: '#8C6520', opacity: 0.6,
      }}>
        hidden
      </span>
    );
  }
  const pct = Math.max(0, Math.min(100, (value / 12) * 100));
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        flex: 1, height: 6, background: '#EBE3CA', borderRadius: 3, overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', width: `${pct}%`, background: '#B8862F',
        }} />
      </div>
      <span style={{
        fontVariantNumeric: 'tabular-nums', color: '#8C6520', minWidth: 32, textAlign: 'right',
      }}>
        {value.toFixed(1)}
      </span>
    </div>
  );
}

function ComparePicker({ initialYou, initialThem }: { initialYou: string; initialThem: string }) {
  return (
    <main className="mx-auto max-w-[640px] px-6 pb-32 pt-10 sm:px-10">
      <div
        className="flex items-center gap-3 text-[10px] tracking-[0.22em] text-[#8C6520]"
        style={{ fontFamily: 'var(--font-pixel-display)' }}
      >
        <span aria-hidden className="inline-block h-2 w-2 bg-[#B8862F]" />
        ▶ COMPARE TWO MINDS
      </div>
      <h1
        className="mt-5 pr-2 text-[26px] leading-[1.1] tracking-[0.04em] text-[#221E18] sm:text-[34px]"
        style={{ fontFamily: 'var(--font-pixel-display)' }}
      >
        <span style={{ textShadow: '3px 3px 0 #B8862F' }}>WHICH TWO PROFILES?</span>
      </h1>
      <p
        className="mt-5 text-[16px] italic leading-[1.55] text-[#4A4338]"
        style={{ fontFamily: 'var(--font-prose)' }}
      >
        Enter two public-profile handles. The page lays them side by side,
        calls out the three biggest divergences in plain language, and shows
        all sixteen dimensions for both.
      </p>

      <div
        className="mt-8 border-4 border-[#221E18] bg-[#FFFCF4]"
        style={{ boxShadow: '6px 6px 0 0 #8C6520' }}
      >
        <div
          className="border-b-4 border-[#221E18] bg-[#221E18] px-4 py-2 text-[10px] tracking-[0.22em] text-[#F8EDC8]"
          style={{ fontFamily: 'var(--font-pixel-display)' }}
        >
          ▶ COMPARE.SYS
        </div>
        <form action="/compare" method="GET" className="grid gap-4 px-6 py-6 sm:px-8">
          <label
            className="flex flex-col gap-1.5 text-[12px] tracking-[0.18em] text-[#8C6520]"
            style={{ fontFamily: 'var(--font-pixel-display)' }}
          >
            YOUR HANDLE
            <input
              type="text"
              name="you"
              defaultValue={initialYou}
              placeholder="e.g. jimmy"
              required
              className="border-2 border-[#221E18] bg-[#FFFCF4] px-3 py-2.5 text-[16px] text-[#221E18] focus:bg-[#F8EDC8] focus:outline-none"
              style={{ fontFamily: 'var(--font-prose)' }}
            />
          </label>
          <label
            className="flex flex-col gap-1.5 text-[12px] tracking-[0.18em] text-[#8C6520]"
            style={{ fontFamily: 'var(--font-pixel-display)' }}
          >
            THEIR HANDLE
            <input
              type="text"
              name="them"
              defaultValue={initialThem}
              placeholder="e.g. alice"
              required
              className="border-2 border-[#221E18] bg-[#FFFCF4] px-3 py-2.5 text-[16px] text-[#221E18] focus:bg-[#F8EDC8] focus:outline-none"
              style={{ fontFamily: 'var(--font-prose)' }}
            />
          </label>
          <button type="submit" className="pixel-button pixel-button--amber justify-center">
            <span>▶ COMPARE</span>
          </button>
        </form>
      </div>

      <p className="mt-6 text-[12.5px] leading-[1.55] text-[#8C6520] opacity-90">
        Both users need a public profile (Account → Public profile settings →
        toggle on) for the comparison to work. Per-field visibility
        (archetype, dimensions, etc.) is respected.
      </p>
    </main>
  );
}

const eyebrow: React.CSSProperties = {
  fontFamily: 'var(--font-pixel-display)', fontSize: 12,
  color: '#8C6520', textTransform: 'uppercase',
  letterSpacing: '0.18em', marginBottom: 16,
};
const fieldLabel: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 4 };
const fieldText: React.CSSProperties = {
  fontFamily: sans, fontSize: 12, color: '#8C6520',
  textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 600,
};
const inputStyle: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif',
  fontSize: 16,
  padding: '11px 14px',
  border: '1px solid #D6CDB6',
  borderRadius: 8,
  background: '#FFFCF4',
};
