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
import { topDivergences } from '@/lib/dim-narration';

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
  const youName = you.profile.display_name || `@${you.profile.handle}`;
  const themName = them.profile.display_name || `@${them.profile.handle}`;
  const youSlug = archetypeKey(you.archetype?.archetype);
  const themSlug = archetypeKey(them.archetype?.archetype);

  return (
    <main style={{ maxWidth: 880, margin: '40px auto', padding: '0 24px 120px' }}>
      <div style={{
        fontFamily: sans, fontSize: 11, fontWeight: 600,
        color: '#8C6520', textTransform: 'uppercase',
        letterSpacing: '0.18em', marginBottom: 12,
      }}>
        Compare two minds
      </div>
      <h1 style={{
        fontFamily: serif, fontSize: 42, fontWeight: 500,
        margin: '0 0 8px', letterSpacing: '-0.4px', lineHeight: 1.05,
      }}>
        {youName} <span style={{ fontStyle: 'italic', color: '#8C6520', fontSize: 28 }}>&amp;</span> {themName}
      </h1>
      <p style={{
        fontFamily: serif, fontStyle: 'italic',
        fontSize: 17, color: '#4A4338',
        margin: '0 0 32px', lineHeight: 1.55,
      }}>
        Two worldviews, sixteen dimensions. Where you converge, and where you don&rsquo;t.
      </p>

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
        border: '1px solid #EBE3CA',
        borderLeft: '3px solid #B8862F',
        borderRadius: 8,
      }}>
        <div style={eyebrow}>Where you diverge most</div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 16 }}>
          {divergences.length === 0 ? (
            <li style={{ fontFamily: serif, fontStyle: 'italic', color: '#8C6520' }}>
              Not enough data to compute divergence — one of you may not have taken the quiz yet.
            </li>
          ) : divergences.map((d, i) => (
            <li key={d.key}>
              <div style={{
                fontFamily: sans, fontSize: 11, fontWeight: 600,
                color: '#8C6520', textTransform: 'uppercase',
                letterSpacing: '0.16em', marginBottom: 6,
              }}>
                {i === 0 ? 'Biggest divergence' : `#${i + 1}`} · {d.label}
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

      {/* Full 16-dim side-by-side table */}
      <section style={{ marginBottom: 36 }}>
        <div style={eyebrow}>All sixteen dimensions</div>
        <div style={{
          background: '#FFFCF4',
          border: '1px solid #EBE3CA',
          borderRadius: 8,
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
                padding: '10px 14px',
                borderTop: i === 0 ? 'none' : '1px solid #EBE3CA',
                fontFamily: sans, fontSize: 13.5,
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
      border: '1px solid #EBE3CA',
      borderRadius: 10,
    }}>
      <div style={{
        display: 'flex', gap: 14, alignItems: 'center', marginBottom: 12,
      }}>
        {figure && (
          <Link href={slug ? `/archetype/${slug}` : '#'} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 64, height: 64, flexShrink: 0,
            background: '#F1EAD8', borderRadius: '50%',
            border: '1.5px solid #B8862F', padding: 8,
            textDecoration: 'none',
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
    <main style={{ maxWidth: 560, margin: '60px auto', padding: '0 24px 120px' }}>
      <div style={{
        fontFamily: sans, fontSize: 11, fontWeight: 600,
        color: '#8C6520', textTransform: 'uppercase',
        letterSpacing: '0.18em', marginBottom: 12,
      }}>
        Compare two minds
      </div>
      <h1 style={{
        fontFamily: serif, fontSize: 38, fontWeight: 500,
        margin: '0 0 12px', letterSpacing: '-0.4px', lineHeight: 1.1,
      }}>
        Which two profiles?
      </h1>
      <p style={{
        fontFamily: serif, fontStyle: 'italic',
        fontSize: 17, color: '#4A4338',
        margin: '0 0 28px', lineHeight: 1.55,
      }}>
        Enter two public-profile handles. The page lays them side by side, calls out the three biggest divergences in plain language, and shows all sixteen dimensions for both.
      </p>
      <form action="/compare" method="GET" style={{ display: 'grid', gap: 14 }}>
        <label style={fieldLabel}>
          <span style={fieldText}>Your handle</span>
          <input
            type="text"
            name="you"
            defaultValue={initialYou}
            placeholder="e.g. jimmy"
            style={inputStyle}
            required
          />
        </label>
        <label style={fieldLabel}>
          <span style={fieldText}>Their handle</span>
          <input
            type="text"
            name="them"
            defaultValue={initialThem}
            placeholder="e.g. alice"
            style={inputStyle}
            required
          />
        </label>
        <button type="submit" style={{
          marginTop: 6,
          padding: '12px 22px',
          background: '#221E18',
          color: '#FAF6EC',
          border: 'none',
          borderRadius: 8,
          fontFamily: sans,
          fontSize: 14, fontWeight: 500,
          cursor: 'pointer',
          letterSpacing: 0.4,
        }}>
          Compare
        </button>
      </form>
      <p style={{
        marginTop: 22, fontFamily: sans, fontSize: 12.5,
        color: '#8C6520', opacity: 0.85, lineHeight: 1.55,
      }}>
        Both users need a public profile (Account → Public profile settings → toggle on) for the comparison to work. Per-field visibility (archetype, dimensions, etc.) is respected.
      </p>
    </main>
  );
}

const eyebrow: React.CSSProperties = {
  fontFamily: sans, fontSize: 11, fontWeight: 600,
  color: '#8C6520', textTransform: 'uppercase',
  letterSpacing: '0.18em', marginBottom: 14,
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
