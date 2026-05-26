// /vs — index of curated philosopher comparison pages.
//
// Now grouped by tradition / era, with a featured matchup that rotates
// daily. Each card jumps to /vs/<a>/<b> (canonicalised, alphabetical).
// The curated list + categorisation live in lib/vs-pairs.ts.
//
// The page intentionally caps at the curated set (~58 pairs) rather
// than exposing the full ~156k combinatoric space — those still render
// on-demand if someone constructs the URL, but they don't get
// prerendered or indexed.

import Link from 'next/link';
import type { Metadata } from 'next';
import { PHILOSOPHERS } from '@/lib/philosophers';
import { CURATED_VS_PAIRS, toCanonicalPair, vsPairsByCategory } from '@/lib/vs-pairs';
import { PixelPageHeader } from '@/components/pixel-window';

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";
const serif = "var(--font-prose)";
const sans = "'Inter', system-ui, sans-serif";

export const metadata: Metadata = {
  title: 'Philosopher matchups',
  description: 'Plato vs Aristotle, Nietzsche vs Kant, Sartre vs Camus and dozens more — side-by-side comparisons across Mull\'s 16 philosophical dimensions.',
  alternates: { canonical: 'https://mull.world/vs' },
};

/** Featured matchup rotates by day-of-year so the page feels alive
 *  without server state. Picks from a hand-chosen subset of the most
 *  attention-grabbing pairs. */
function pickFeatured() {
  const featured: [string, string][] = [
    ['Plato', 'Aristotle'],
    ['Nietzsche', 'Kant'],
    ['Sartre', 'Camus'],
    ['Confucius', 'Laozi'],
    ['Hume', 'Kant'],
    ['Wittgenstein', 'Heidegger'],
    ['Kierkegaard', 'Nietzsche'],
    ['Foucault', 'Habermas'],
    ['Plato', 'Socrates'],
    ['Buddha', 'Nagarjuna'],
  ];
  const now = new Date();
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86_400_000
  );
  const [n1, n2] = featured[dayOfYear % featured.length];
  const canonical = toCanonicalPair(n1, n2);
  return { name1: n1, name2: n2, href: `/vs/${canonical.a}/${canonical.b}` };
}

export default function VsIndexPage() {
  // Name resolver — defensive against renames in the philosopher corpus.
  const resolveName = (n: string) => PHILOSOPHERS.find(p => p.name === n);
  const groups = vsPairsByCategory(resolveName);
  const featured = pickFeatured();

  // Total resolvable pairs for the header subtitle.
  const totalPairs = groups.reduce((sum, g) => sum + g.pairs.length, 0);

  return (
    <main className="mx-auto max-w-[920px] px-5 pb-32 pt-10 sm:px-10">
      <PixelPageHeader
        eyebrow="▶ MATCHUPS"
        title="PHILOSOPHER VS PHILOSOPHER"
        subtitle={
          <p style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 16, color: '#4A4338', lineHeight: 1.55 }}>
            {`${totalPairs} side-by-side comparisons across Mull’s 16 dimensions. See where two thinkers agree, where they sharply disagree, and where you sit between them.`}
          </p>
        }
      />

      {/* ─── Featured matchup ──────────────────────────────────── */}
      <section style={{ marginBottom: 36 }}>
        <div style={{
          fontFamily: pixel,
          fontSize: 10,
          color: '#8C6520',
          letterSpacing: 0.6,
          textTransform: 'uppercase',
          marginBottom: 8,
        }}>
          ◇ Featured matchup today
        </div>
        <Link
          href={featured.href}
          className="pixel-press"
          style={{
            display: 'block',
            padding: '26px 26px',
            background: '#F8EBC9',
            border: '4px solid #221E18',
            boxShadow: '6px 6px 0 0 #B8862F',
            borderRadius: 0,
            textDecoration: 'none',
            color: 'inherit',
            transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end)',
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 18,
            flexWrap: 'wrap',
          }}>
            <div style={{
              fontFamily: serif,
              fontSize: 26,
              fontWeight: 500,
              color: '#221E18',
              lineHeight: 1.15,
            }}>
              {featured.name1}
            </div>
            <div style={{
              fontFamily: pixel,
              fontSize: 14,
              color: '#8C6520',
              letterSpacing: 1,
              textTransform: 'uppercase',
            }}>
              vs
            </div>
            <div style={{
              fontFamily: serif,
              fontSize: 26,
              fontWeight: 500,
              color: '#221E18',
              lineHeight: 1.15,
            }}>
              {featured.name2}
            </div>
          </div>
          <div style={{
            marginTop: 12,
            fontFamily: pixel,
            fontSize: 10,
            color: '#8C6520',
            letterSpacing: 0.6,
            textTransform: 'uppercase',
          }}>
            COMPARE ▶
          </div>
        </Link>
      </section>

      {/* ─── Quick jump nav ────────────────────────────────────── */}
      <nav style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 28,
        paddingBottom: 16,
        borderBottom: '2px dashed #C2A062',
      }}>
        {groups.map(g => (
          <a
            key={g.key}
            href={`#${g.key}`}
            style={{
              fontFamily: pixel,
              fontSize: 9.5,
              padding: '6px 10px',
              border: `2px solid ${g.accent}`,
              color: g.accent,
              textDecoration: 'none',
              letterSpacing: 0.5,
              textTransform: 'uppercase',
              background: '#FFFCF4',
            }}
          >
            {g.icon} {g.label}
          </a>
        ))}
      </nav>

      {/* ─── Sections ──────────────────────────────────────────── */}
      {groups.map(g => (
        <section key={g.key} id={g.key} style={{ marginBottom: 44, scrollMarginTop: 24 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 6,
          }}>
            <span style={{
              fontFamily: pixel,
              fontSize: 18,
              color: g.accent,
              lineHeight: 1,
            }}>
              {g.icon}
            </span>
            <h2 style={{
              fontFamily: serif,
              fontSize: 25,
              fontWeight: 500,
              margin: 0,
              letterSpacing: '-0.3px',
              color: '#221E18',
            }}>
              {g.label}
            </h2>
            <span style={{
              fontFamily: sans,
              fontSize: 11,
              color: '#8C6520',
              opacity: 0.7,
              marginLeft: 'auto',
            }}>
              {g.pairs.length}
            </span>
          </div>
          <p style={{
            fontFamily: serif,
            fontStyle: 'italic',
            fontSize: 14.5,
            color: '#4A4338',
            margin: '0 0 16px',
            lineHeight: 1.55,
          }}>
            {g.blurb}
          </p>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 10,
          }}>
            {g.pairs.map(p => (
              <li key={p.href}>
                <Link
                  href={p.href}
                  className="pixel-press"
                  style={{
                    display: 'block',
                    padding: '14px 16px',
                    background: '#FFFCF4',
                    border: '3px solid #221E18',
                    boxShadow: `3px 3px 0 0 ${g.accent}`,
                    borderRadius: 0,
                    textDecoration: 'none',
                    color: '#221E18',
                    height: '100%',
                    transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end)',
                  }}
                >
                  <div style={{
                    fontFamily: serif,
                    fontSize: 17,
                    fontWeight: 500,
                    color: '#221E18',
                    lineHeight: 1.25,
                  }}>
                    {p.name1} <span style={{ color: '#8C6520', fontFamily: pixel, fontSize: 10 }}>VS</span> {p.name2}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {/* ─── Construct-your-own ────────────────────────────────── */}
      <div style={{
        marginTop: 36,
        padding: '20px 22px',
        background: '#FFFCF4',
        border: '3px solid #221E18',
        boxShadow: '4px 4px 0 0 #6B7F4F',
      }}>
        <p style={{
          fontFamily: serif,
          fontSize: 16,
          color: '#221E18',
          margin: '0 0 6px',
          lineHeight: 1.5,
        }}>
          Want a matchup not listed here?
        </p>
        <p style={{
          fontFamily: serif,
          fontStyle: 'italic',
          fontSize: 14.5,
          color: '#4A4338',
          margin: '0 0 12px',
          lineHeight: 1.5,
        }}>
          Any two of our {PHILOSOPHERS.length} philosophers can be compared. Browse the full list to find them, then construct the URL: <code style={{ fontFamily: pixel, fontSize: 12, color: '#8C6520' }}>/vs/[slug-a]/[slug-b]</code>.
        </p>
        <Link
          href="/philosopher"
          style={{
            display: 'inline-block',
            fontFamily: pixel,
            fontSize: 11,
            padding: '8px 14px',
            background: '#221E18',
            color: '#F8EBC9',
            border: '2px solid #221E18',
            textDecoration: 'none',
            letterSpacing: 0.6,
            textTransform: 'uppercase',
          }}
        >
          ▶ Browse philosophers
        </Link>
      </div>
    </main>
  );
}
