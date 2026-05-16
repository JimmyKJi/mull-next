// /vs/[a]/[b] — head-to-head philosopher comparison.
//
// Designed to be the canonical short-form interactive page when someone
// searches "Nietzsche vs Kant", "Plato vs Aristotle", etc. The full
// 156k combinatoric pair space isn't statically generated — only the
// ~30 curated marquee pairs (lib/vs-pairs.ts) ship in
// generateStaticParams + the sitemap. Other pairs still resolve (the
// page handles any two corpus philosophers) — they just render on-
// demand and aren't crawler-discovered.
//
// URL canonicalization: alphabetical-by-slug. /vs/aristotle/plato is
// canonical; /vs/plato/aristotle 301-redirects so backlinks + indexing
// don't split.

import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import {
  getPhilosopherBySlug,
  philosopherSlug,
  type PhilosopherEntry,
} from '@/lib/philosophers';
import { getArchetypeColor } from '@/lib/archetype-colors';
import { getArchetypeByKey } from '@/lib/archetypes';
import { PhilosopherSprite } from '@/components/philosopher-sprite';
import {
  curatedPairSlugs,
  compareDimensions,
  disagreementPhrase,
  agreementPhrase,
  type DimComparison,
} from '@/lib/vs-pairs';

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";
const serif = "'Cormorant Garamond', Georgia, serif";

export function generateStaticParams() {
  return curatedPairSlugs();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ a: string; b: string }>;
}): Promise<Metadata> {
  const { a, b } = await params;
  const pa = getPhilosopherBySlug(a);
  const pb = getPhilosopherBySlug(b);
  if (!pa || !pb) return { title: 'Comparison not found' };

  // Use the canonical (alphabetical) form for the canonical URL even if
  // someone hits the non-canonical order — the page itself redirects,
  // so this is belt-and-suspenders.
  const canonicalA = a < b ? a : b;
  const canonicalB = a < b ? b : a;
  const canonicalUrl = `https://mull.world/vs/${canonicalA}/${canonicalB}`;

  const title = `${pa.name} vs ${pb.name}`;
  const desc = `Compare ${pa.name} and ${pb.name} across Mull's 16 philosophical dimensions. Where they agree, where they sharply diverge, and where you sit between them.`;
  return {
    title,
    description: desc,
    keywords: [
      `${pa.name} vs ${pb.name}`,
      `${pb.name} vs ${pa.name}`,
      pa.name,
      pb.name,
      'philosophy',
      'compare',
    ].join(', '),
    openGraph: {
      title: `${title} — Mull`,
      description: desc,
      url: canonicalUrl,
      siteName: 'Mull',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} — Mull`,
      description: desc,
    },
    alternates: { canonical: canonicalUrl },
  };
}

export default async function VsPage({
  params,
}: {
  params: Promise<{ a: string; b: string }>;
}) {
  const { a, b } = await params;

  // Canonicalise: alphabetical by slug. Redirect non-canonical orders
  // to the canonical URL so we don't split SEO weight across both
  // orderings.
  if (a > b) {
    redirect(`/vs/${b}/${a}`);
  }
  if (a === b) {
    // Self-pair: send to the philosopher page instead.
    redirect(`/philosopher/${a}`);
  }

  const pa = getPhilosopherBySlug(a);
  const pb = getPhilosopherBySlug(b);
  if (!pa || !pb) notFound();

  const comparisons = compareDimensions(pa.vector, pb.vector);
  // Top 3 sharpest disagreements.
  const disagreements = comparisons.slice(0, 3);
  // Top 3 closest agreements — take the smallest absDelta entries
  // (i.e. last entries when sorted descending) but only where there's
  // meaningful presence (avg >= 4) so we're not just reporting "both
  // ignore this".
  const agreements = comparisons
    .slice()
    .reverse()
    .filter(c => (c.valueA + c.valueB) / 2 >= 4)
    .slice(0, 3);

  const colorA = getArchetypeColor(pa.archetypeKey);
  const colorB = getArchetypeColor(pb.archetypeKey);
  const archA = getArchetypeByKey(pa.archetypeKey);
  const archB = getArchetypeByKey(pb.archetypeKey);

  // JSON-LD: ItemList with two ListItem (each pointing at the
  // philosopher pages) inside an Article. Gives Google a clean
  // structured signal that this is a comparison between two notable
  // people.
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${pa.name} vs ${pb.name}`,
    description: `Side-by-side comparison of ${pa.name} and ${pb.name} across 16 philosophical dimensions.`,
    url: `https://mull.world/vs/${a}/${b}`,
    inLanguage: 'en',
    about: [
      {
        '@type': 'Person',
        name: pa.name,
        url: `https://mull.world/philosopher/${a}`,
      },
      {
        '@type': 'Person',
        name: pb.name,
        url: `https://mull.world/philosopher/${b}`,
      },
    ],
    publisher: {
      '@type': 'Organization',
      name: 'Mull',
      url: 'https://mull.world',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <main className="mx-auto max-w-[860px] px-6 pb-32 pt-10 sm:px-10">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link href="/vs" style={{
            fontFamily: pixel, fontSize: 11,
            color: '#4A4338', textDecoration: 'none',
            letterSpacing: 0.4, textTransform: 'uppercase',
          }}>
            ◂ ALL MATCHUPS
          </Link>
        </div>

        <div style={{
          fontFamily: pixel, fontSize: 12,
          color: '#8C6520', textTransform: 'uppercase',
          letterSpacing: '0.18em', marginBottom: 14,
        }}>
          ▸ HEAD-TO-HEAD
        </div>

        <h1 style={{
          fontFamily: pixel,
          fontSize: 28,
          margin: '0 0 22px',
          color: '#221E18',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          textShadow: '3px 3px 0 #B8862F',
          lineHeight: 1.1,
        }}>
          {pa.name.toUpperCase()} <span style={{ color: '#8C6520' }}>VS</span> {pb.name.toUpperCase()}
        </h1>

        {/* Hero: side-by-side sprite + name + dates + archetype */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
          marginBottom: 36,
        }}>
          <PhilosopherCard p={pa} color={colorA} archetypeName={archA?.spirit ?? pa.archetypeName} />
          <PhilosopherCard p={pb} color={colorB} archetypeName={archB?.spirit ?? pb.archetypeName} />
        </section>

        {/* Where they sharply disagreed */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={sectionH2}>▸ WHERE THEY SHARPLY DISAGREED</h2>
          <p style={subtitle}>
            The three dimensions on which {pa.name} and {pb.name} are
            farthest apart on Mull&rsquo;s 0–10 scale.
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: '14px 0 0', display: 'grid', gap: 12 }}>
            {disagreements.map(c => (
              <DimRow
                key={c.key}
                c={c}
                nameA={pa.name}
                nameB={pb.name}
                colorA={colorA}
                colorB={colorB}
                kind="disagree"
              />
            ))}
          </ul>
        </section>

        {/* Where they overlapped */}
        {agreements.length > 0 && (
          <section style={{ marginBottom: 36 }}>
            <h2 style={sectionH2}>▸ WHERE THEY OVERLAPPED</h2>
            <p style={subtitle}>
              Where the gap is smallest — both with meaningful presence
              on the dimension (not "neither cared").
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '14px 0 0', display: 'grid', gap: 12 }}>
              {agreements.map(c => (
                <DimRow
                  key={c.key}
                  c={c}
                  nameA={pa.name}
                  nameB={pb.name}
                  colorA={colorA}
                  colorB={colorB}
                  kind="agree"
                />
              ))}
            </ul>
          </section>
        )}

        {/* Full 16-dimension comparison */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={sectionH2}>▸ ALL 16 DIMENSIONS</h2>
          <p style={subtitle}>
            The full vector comparison. Bars show their 0–10 scores
            side-by-side.
          </p>
          <div style={{
            marginTop: 14,
            padding: '20px 22px',
            background: '#FFFCF4',
            border: '3px solid #221E18',
            boxShadow: '4px 4px 0 0 #B8862F',
            borderRadius: 0,
          }}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12 }}>
              {comparisons
                .slice()
                .sort((x, y) => x.key.localeCompare(y.key))
                .map(c => (
                  <li key={c.key}>
                    <div style={{
                      fontFamily: pixel,
                      fontSize: 10,
                      color: '#221E18',
                      letterSpacing: 0.4,
                      textTransform: 'uppercase',
                      marginBottom: 4,
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}>
                      <span>{c.name}</span>
                      <span style={{ color: '#8C6520' }}>Δ {c.absDelta}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <DimBar value={c.valueA} color={colorA.deep} align="right" />
                      <DimBar value={c.valueB} color={colorB.deep} align="left" />
                    </div>
                  </li>
                ))}
            </ul>
            <div style={{
              marginTop: 14,
              paddingTop: 12,
              borderTop: '2px dashed #D6CDB6',
              display: 'flex',
              justifyContent: 'space-between',
              gap: 12,
              fontFamily: pixel,
              fontSize: 10,
              color: '#4A4338',
              letterSpacing: 0.4,
              textTransform: 'uppercase',
            }}>
              <span style={{ color: colorA.deep }}>◀ {pa.name.toUpperCase()}</span>
              <span style={{ color: colorB.deep }}>{pb.name.toUpperCase()} ▶</span>
            </div>
          </div>
        </section>

        {/* Quiz CTA — where do YOU sit */}
        <div style={{
          padding: '24px 26px',
          background: '#F8EDC8',
          border: '4px solid #221E18',
          boxShadow: '6px 6px 0 0 #B8862F',
          borderRadius: 0,
          textAlign: 'center',
        }}>
          <p style={{
            fontFamily: serif,
            fontStyle: 'italic',
            fontSize: 17,
            color: '#221E18',
            margin: '0 0 18px',
            lineHeight: 1.55,
          }}>
            Where do you sit between {pa.name} and {pb.name}? The quiz
            places you in 16-D space — closer to one or the other, or
            somewhere they never thought to look.
          </p>
          <Link
            href="/quiz?mode=quick"
            className="pixel-button pixel-button--amber"
          >
            <span>▶ TAKE THE QUIZ · 6 MIN</span>
          </Link>
        </div>
      </main>
    </>
  );
}

// ─── Pieces ──────────────────────────────────────────────────────────

function PhilosopherCard({
  p,
  color,
  archetypeName,
}: {
  p: PhilosopherEntry;
  color: { soft: string; deep: string };
  archetypeName: string;
}) {
  return (
    <Link
      href={`/philosopher/${philosopherSlug(p.name)}`}
      className="pixel-press"
      style={{
        display: 'block',
        padding: '16px 16px',
        background: color.soft,
        border: '3px solid #221E18',
        boxShadow: `4px 4px 0 0 ${color.deep}`,
        borderRadius: 0,
        textDecoration: 'none',
        color: 'inherit',
        transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end)',
      }}
    >
      <div className="pixel-crisp" style={{
        width: 64, height: 64,
        background: '#FFFCF4',
        border: '2px solid #221E18',
        padding: 4,
        marginBottom: 10,
      }}>
        <PhilosopherSprite name={p.name} archetypeKey={p.archetypeKey} size={52} />
      </div>
      <div style={{
        fontFamily: serif,
        fontSize: 19,
        fontWeight: 500,
        color: '#221E18',
        marginBottom: 2,
      }}>
        {p.name}
      </div>
      <div style={{
        fontFamily: pixel,
        fontSize: 10,
        color: color.deep,
        letterSpacing: 0.4,
        textTransform: 'uppercase',
        marginBottom: 8,
      }}>
        {p.dates}
      </div>
      <div style={{
        fontFamily: serif,
        fontStyle: 'italic',
        fontSize: 13,
        color: '#4A4338',
        lineHeight: 1.45,
      }}>
        {archetypeName}
      </div>
    </Link>
  );
}

function DimRow({
  c,
  nameA,
  nameB,
  colorA,
  colorB,
  kind,
}: {
  c: DimComparison;
  nameA: string;
  nameB: string;
  colorA: { soft: string; deep: string };
  colorB: { soft: string; deep: string };
  kind: 'agree' | 'disagree';
}) {
  return (
    <li style={{
      padding: '14px 16px',
      background: '#FFFCF4',
      border: '3px solid #221E18',
      boxShadow: kind === 'disagree' ? '4px 4px 0 0 #7A2E2E' : '4px 4px 0 0 #2F5D5C',
      borderRadius: 0,
    }}>
      <div style={{
        fontFamily: pixel,
        fontSize: 11,
        color: '#221E18',
        letterSpacing: 0.4,
        textTransform: 'uppercase',
        marginBottom: 8,
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 8,
      }}>
        <span>{c.name}</span>
        <span style={{ color: kind === 'disagree' ? '#7A2E2E' : '#2F5D5C' }}>
          {kind === 'disagree' ? `Δ ${c.absDelta} / 10` : `gap ${c.absDelta} / 10`}
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        <div>
          <div style={{
            fontFamily: serif,
            fontSize: 13,
            color: colorA.deep,
            fontWeight: 500,
            marginBottom: 2,
          }}>
            {nameA}: {c.valueA}/10
          </div>
          <DimBar value={c.valueA} color={colorA.deep} align="left" />
        </div>
        <div>
          <div style={{
            fontFamily: serif,
            fontSize: 13,
            color: colorB.deep,
            fontWeight: 500,
            marginBottom: 2,
          }}>
            {nameB}: {c.valueB}/10
          </div>
          <DimBar value={c.valueB} color={colorB.deep} align="left" />
        </div>
      </div>
      <p style={{
        fontFamily: serif,
        fontStyle: 'italic',
        fontSize: 14,
        color: '#221E18',
        margin: 0,
        lineHeight: 1.5,
      }}>
        {kind === 'disagree'
          ? disagreementPhrase(c, nameA, nameB)
          : agreementPhrase(c)}
      </p>
    </li>
  );
}

function DimBar({
  value,
  color,
  align,
}: {
  value: number;
  color: string;
  align: 'left' | 'right';
}) {
  const pct = Math.max(0, Math.min(10, value)) * 10;
  return (
    <div style={{
      height: 14,
      background: '#EFE6CC',
      border: '2px solid #221E18',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        [align === 'left' ? 'left' : 'right']: 0,
        width: `${pct}%`,
        background: color,
      }} />
    </div>
  );
}

// ─── Style snippets ──────────────────────────────────────────────────

const sectionH2: React.CSSProperties = {
  fontFamily: pixel,
  fontSize: 14,
  color: '#221E18',
  textTransform: 'uppercase',
  letterSpacing: '0.18em',
  marginBottom: 10,
  textShadow: '2px 2px 0 #B8862F',
};

const subtitle: React.CSSProperties = {
  fontFamily: serif,
  fontStyle: 'italic',
  fontSize: 15,
  color: '#4A4338',
  margin: 0,
  lineHeight: 1.55,
};
