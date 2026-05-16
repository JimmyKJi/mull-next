// /vs — index of curated philosopher comparison pages.
//
// Each card jumps to /vs/<a>/<b> (canonicalised, alphabetical). The
// curated list lives in lib/vs-pairs.ts and is intentionally short
// — ~30 high-search-volume matchups, not the full ~156k combinatoric
// space.

import Link from 'next/link';
import type { Metadata } from 'next';
import { PHILOSOPHERS, philosopherSlug } from '@/lib/philosophers';
import { CURATED_VS_PAIRS, toCanonicalPair } from '@/lib/vs-pairs';
import { PixelPageHeader } from '@/components/pixel-window';

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";
const serif = "'Cormorant Garamond', Georgia, serif";

export const metadata: Metadata = {
  title: 'Philosopher matchups',
  description: 'Plato vs Aristotle, Nietzsche vs Kant, Sartre vs Camus — side-by-side comparisons across Mull\'s 16 philosophical dimensions.',
  alternates: { canonical: 'https://mull.world/vs' },
};

export default function VsIndexPage() {
  // Build display list — drop pairs whose names don't resolve in the
  // corpus (defensive — should never happen since curated names are
  // verified, but means the page doesn't crash if a future rename
  // breaks one).
  const pairs = CURATED_VS_PAIRS
    .map(([n1, n2]) => {
      const p1 = PHILOSOPHERS.find(p => p.name === n1);
      const p2 = PHILOSOPHERS.find(p => p.name === n2);
      if (!p1 || !p2) return null;
      const canonical = toCanonicalPair(n1, n2);
      return {
        name1: p1.name,
        name2: p2.name,
        href: `/vs/${canonical.a}/${canonical.b}`,
      };
    })
    .filter((x): x is NonNullable<typeof x> => !!x);

  // De-dupe (same canonical pair from two source entries).
  const seen = new Set<string>();
  const unique = pairs.filter(p => {
    if (seen.has(p.href)) return false;
    seen.add(p.href);
    return true;
  });

  return (
    <main className="mx-auto max-w-[820px] px-6 pb-32 pt-10 sm:px-10">
      <PixelPageHeader
        eyebrow="▶ MATCHUPS"
        title="PHILOSOPHER VS PHILOSOPHER"
        subtitle={
          <p style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 16, color: '#4A4338', lineHeight: 1.55 }}>
            Side-by-side comparisons across Mull&rsquo;s 16 dimensions. See
            where two thinkers agree, where they sharply disagree, and
            where you sit between them.
          </p>
        }
      />

      <ul style={{
        listStyle: 'none',
        padding: 0,
        margin: 0,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 12,
      }}>
        {unique.map(p => (
          <li key={p.href}>
            <Link
              href={p.href}
              className="pixel-press"
              style={{
                display: 'block',
                padding: '16px 18px',
                background: '#FFFCF4',
                border: '3px solid #221E18',
                boxShadow: '4px 4px 0 0 #B8862F',
                borderRadius: 0,
                textDecoration: 'none',
                color: '#221E18',
                transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end)',
              }}
            >
              <div style={{
                fontFamily: pixel,
                fontSize: 10,
                color: '#8C6520',
                letterSpacing: 0.4,
                textTransform: 'uppercase',
                marginBottom: 6,
              }}>
                MATCHUP
              </div>
              <div style={{
                fontFamily: serif,
                fontSize: 19,
                fontWeight: 500,
                color: '#221E18',
                lineHeight: 1.25,
              }}>
                {p.name1} <span style={{ color: '#8C6520' }}>vs</span> {p.name2}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
