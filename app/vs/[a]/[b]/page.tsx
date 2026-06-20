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
import { PathwayNext } from '@/components/pathway-next';
import { pathwayForVs } from '@/lib/pathway';
import { ContentLanguageNotice } from '@/components/content-language-notice';
import { getServerLocale } from '@/lib/locale-server';
import { localizePhilosopher } from '@/lib/philosophers-i18n';
import { localizeArchetype } from '@/lib/archetypes-i18n';
import { t, type Locale } from '@/lib/translations';

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";
const serif = "var(--font-editorial)";

export function generateStaticParams() {
  return curatedPairSlugs();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ a: string; b: string }>;
}): Promise<Metadata> {
  const { a, b } = await params;
  const locale = await getServerLocale();
  const pa = getPhilosopherBySlug(a);
  const pb = getPhilosopherBySlug(b);
  if (!pa || !pb) return { title: 'Comparison not found' };

  // Use the canonical (alphabetical) form for the canonical URL even if
  // someone hits the non-canonical order — the page itself redirects,
  // so this is belt-and-suspenders.
  const canonicalA = a < b ? a : b;
  const canonicalB = a < b ? b : a;
  const canonicalUrl = `https://mull.world/vs/${canonicalA}/${canonicalB}`;

  const paName = localizePhilosopher(pa, a, locale).name;
  const pbName = localizePhilosopher(pb, b, locale).name;
  const title = t('vs.meta_pair_title', locale, { a: paName, b: pbName });
  const desc = t('vs.meta_pair_desc', locale, { a: paName, b: pbName });
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
  const locale = await getServerLocale();

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

  // Localized display strings. The raw `pa`/`pb` keep English name +
  // slug for sprites, links, and the (English-for-SEO) JSON-LD.
  const paL = localizePhilosopher(pa, a, locale);
  const pbL = localizePhilosopher(pb, b, locale);
  const paName = paL.name;
  const pbName = pbL.name;
  const archASpirit = archA ? localizeArchetype(archA, locale).spirit : pa.archetypeName;
  const archBSpirit = archB ? localizeArchetype(archB, locale).spirit : pb.archetypeName;

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
            color: 'var(--color-ink-soft)', textDecoration: 'none',
            letterSpacing: 0.4, textTransform: 'uppercase',
            display: 'inline-block', padding: '10px 0',
          }}>
            {t('vs.all_matchups', locale)}
          </Link>
        </div>

        <ContentLanguageNotice locale={locale} translatedLocales={["zh"]} />

        <div style={{
          fontFamily: pixel, fontSize: 12,
          color: 'var(--color-acc-deep)', textTransform: 'uppercase',
          letterSpacing: '0.18em', marginBottom: 14,
        }}>
          {t('vs.head_to_head', locale)}
        </div>

        <h1 style={{
          fontFamily: pixel,
          fontSize: 28,
          margin: '0 0 22px',
          color: 'var(--color-ink)',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          textShadow: '3px 3px 0 var(--pixel-shadow, var(--color-acc))',
          lineHeight: 1.4,
        }}>
          {paName.toUpperCase()} <span style={{ color: 'var(--color-acc-deep)' }}>{t('vs.vs_badge', locale)}</span> {pbName.toUpperCase()}
        </h1>

        {/* Hero: side-by-side sprite + name + dates + archetype */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
          marginBottom: 36,
        }}>
          <PhilosopherCard p={pa} color={colorA} displayName={paName} displayDates={paL.dates} archetypeName={archASpirit} />
          <PhilosopherCard p={pb} color={colorB} displayName={pbName} displayDates={pbL.dates} archetypeName={archBSpirit} />
        </section>

        {/* Where they sharply disagreed */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={sectionH2}>{t('vs.disagreed_title', locale)}</h2>
          <p style={subtitle}>
            {t('vs.disagreed_sub', locale, { a: paName, b: pbName })}
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: '14px 0 0', display: 'grid', gap: 12 }}>
            {disagreements.map(c => (
              <DimRow
                key={c.key}
                c={c}
                nameA={paName}
                nameB={pbName}
                colorA={colorA}
                colorB={colorB}
                kind="disagree"
                locale={locale}
              />
            ))}
          </ul>
        </section>

        {/* Where they overlapped */}
        {agreements.length > 0 && (
          <section style={{ marginBottom: 36 }}>
            <h2 style={sectionH2}>{t('vs.overlapped_title', locale)}</h2>
            <p style={subtitle}>
              {t('vs.overlapped_sub', locale)}
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '14px 0 0', display: 'grid', gap: 12 }}>
              {agreements.map(c => (
                <DimRow
                  key={c.key}
                  c={c}
                  nameA={paName}
                  nameB={pbName}
                  colorA={colorA}
                  colorB={colorB}
                  kind="agree"
                  locale={locale}
                />
              ))}
            </ul>
          </section>
        )}

        {/* Full 16-dimension comparison */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={sectionH2}>{t('vs.all_dims_title', locale)}</h2>
          <p style={subtitle}>
            {t('vs.all_dims_sub', locale)}
          </p>
          <div style={{
            marginTop: 14,
            padding: '20px 22px',
            background: '#FFFCF4',
            border: '3px solid var(--color-ink)',
            boxShadow: '4px 4px 0 0 var(--color-acc)',
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
                      color: 'var(--color-ink)',
                      letterSpacing: 0.4,
                      textTransform: 'uppercase',
                      marginBottom: 4,
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}>
                      <span>{t(`dim.${c.key}.name`, locale)}</span>
                      <span style={{ color: 'var(--color-acc-deep)' }}>Δ {c.absDelta}</span>
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
              borderTop: '2px dashed var(--color-line)',
              display: 'flex',
              justifyContent: 'space-between',
              gap: 12,
              fontFamily: pixel,
              fontSize: 10,
              color: 'var(--color-ink-soft)',
              letterSpacing: 0.4,
              textTransform: 'uppercase',
            }}>
              <span style={{ color: colorA.deep }}>◀ {paName.toUpperCase()}</span>
              <span style={{ color: colorB.deep }}>{pbName.toUpperCase()} ▶</span>
            </div>
          </div>
        </section>

        {/* Pathway — three illustrated stations leading onward.
            Cold visitor: quiz → bridging philosopher → argue one in Arena.
            Warm visitor: argue both in Arena + daily Spar. */}
        <PathwayNext
          pathway={pathwayForVs(a, b, locale)}
          locale={locale}
          heading={t('vs.pathway_heading', locale, { a: paName, b: pbName })}
        />
      </main>
    </>
  );
}

// ─── Pieces ──────────────────────────────────────────────────────────

function PhilosopherCard({
  p,
  color,
  archetypeName,
  displayName,
  displayDates,
}: {
  p: PhilosopherEntry;
  color: { soft: string; deep: string };
  archetypeName: string;
  displayName: string;
  displayDates: string;
}) {
  return (
    <Link
      href={`/philosopher/${philosopherSlug(p.name)}`}
      className="pixel-press"
      style={{
        display: 'block',
        padding: '16px 16px',
        background: color.soft,
        border: '3px solid var(--color-ink)',
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
        border: '2px solid var(--color-ink)',
        padding: 4,
        marginBottom: 10,
      }}>
        <PhilosopherSprite name={p.name} archetypeKey={p.archetypeKey} size={52} />
      </div>
      <div style={{
        fontFamily: serif,
        fontSize: 19,
        fontWeight: 500,
        color: 'var(--color-ink)',
        marginBottom: 2,
      }}>
        {displayName}
      </div>
      <div style={{
        fontFamily: pixel,
        fontSize: 10,
        color: color.deep,
        letterSpacing: 0.4,
        textTransform: 'uppercase',
        marginBottom: 8,
      }}>
        {displayDates}
      </div>
      <div style={{
        fontFamily: serif,
        fontStyle: 'italic',
        fontSize: 13,
        color: 'var(--color-ink-soft)',
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
  locale,
}: {
  c: DimComparison;
  nameA: string;
  nameB: string;
  colorA: { soft: string; deep: string };
  colorB: { soft: string; deep: string };
  kind: 'agree' | 'disagree';
  locale: Locale;
}) {
  return (
    <li style={{
      padding: '14px 16px',
      background: '#FFFCF4',
      border: '3px solid var(--color-ink)',
      boxShadow: kind === 'disagree' ? '4px 4px 0 0 #7A2E2E' : '4px 4px 0 0 #2F5D5C',
      borderRadius: 0,
    }}>
      <div style={{
        fontFamily: pixel,
        fontSize: 11,
        color: 'var(--color-ink)',
        letterSpacing: 0.4,
        textTransform: 'uppercase',
        marginBottom: 8,
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 8,
      }}>
        <span>{t(`dim.${c.key}.name`, locale)}</span>
        <span style={{ color: kind === 'disagree' ? '#7A2E2E' : '#2F5D5C' }}>
          {kind === 'disagree' ? `Δ ${c.absDelta} / 10` : t('vs.gap_line', locale, { n: c.absDelta })}
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
            {t('vs.score_line', locale, { name: nameA, v: c.valueA })}
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
            {t('vs.score_line', locale, { name: nameB, v: c.valueB })}
          </div>
          <DimBar value={c.valueB} color={colorB.deep} align="left" />
        </div>
      </div>
      <p style={{
        fontFamily: serif,
        fontStyle: 'italic',
        fontSize: 14,
        color: 'var(--color-ink)',
        margin: 0,
        lineHeight: 1.5,
      }}>
        {kind === 'disagree'
          ? disagreementPhrase(c, nameA, nameB, locale)
          : agreementPhrase(c, locale)}
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
      border: '2px solid var(--color-ink)',
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
  color: 'var(--color-ink)',
  textTransform: 'uppercase',
  letterSpacing: '0.18em',
  marginBottom: 10,
  textShadow: '2px 2px 0 var(--pixel-shadow, var(--color-acc))',
};

const subtitle: React.CSSProperties = {
  fontFamily: serif,
  fontStyle: 'italic',
  fontSize: 15,
  color: 'var(--color-ink-soft)',
  margin: 0,
  lineHeight: 1.55,
};
