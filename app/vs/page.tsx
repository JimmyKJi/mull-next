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
import { PHILOSOPHERS, philosopherSlug, getPhilosopherBySlug } from '@/lib/philosophers';
import { localizePhilosopher } from '@/lib/philosophers-i18n';
import { toCanonicalPair, vsPairsByCategory, CURATED_VS_PAIRS } from '@/lib/vs-pairs';
import { PixelPageHeader } from '@/components/pixel-window';
import { getServerLocale } from '@/lib/locale-server';
import { t } from '@/lib/translations';
import { createClient } from '@/utils/supabase/server';
import { getUserOrientation } from '@/lib/user-orientation';
import { rankSplittingPairs } from '@/lib/recommendations';

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";
const serif = "var(--font-prose)";
const sans = "'Inter', system-ui, sans-serif";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return {
    title: t('vs.meta_title', locale),
    description: t('vs.meta_desc', locale),
    alternates: { canonical: 'https://mull.world/vs' },
  };
}

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

/** Personalized featured matchup: of the curated pairs, the one the user
 *  is drawn to BOTH sides of yet which genuinely opposes itself — "the
 *  debate that splits you." Returns null when the user has no vector
 *  (logged-out / unplaced / crawler), so the page falls back to the
 *  day-of-year pick and the public/SEO output stays byte-for-byte the same. */
function pickSplittingFeatured(
  userVec: number[] | null,
): { name1: string; name2: string; href: string } | null {
  if (!userVec) return null;
  const candidates: { n1: string; n2: string; vA: number[]; vB: number[] }[] = [];
  for (const [n1, n2] of CURATED_VS_PAIRS) {
    const p1 = getPhilosopherBySlug(philosopherSlug(n1));
    const p2 = getPhilosopherBySlug(philosopherSlug(n2));
    if (!p1 || !p2) continue;
    candidates.push({ n1, n2, vA: p1.vector, vB: p2.vector });
  }
  const ranked = rankSplittingPairs(userVec, candidates, (c) => c.vA, (c) => c.vB, 1);
  if (!ranked.length) return null;
  const { n1, n2 } = ranked[0].pair;
  const canonical = toCanonicalPair(n1, n2);
  return { name1: n1, name2: n2, href: `/vs/${canonical.a}/${canonical.b}` };
}

export default async function VsIndexPage() {
  const locale = await getServerLocale();
  // Name resolver — localized display name, defensive against renames.
  const resolveName = (n: string): { name: string } | undefined => {
    const p = PHILOSOPHERS.find(x => x.name === n);
    if (!p) return undefined;
    return { name: localizePhilosopher(p, philosopherSlug(p.name), locale).name };
  };
  const groups = vsPairsByCategory(resolveName, locale);

  // Featured matchup: for a placed user, "the debate that splits you" —
  // a curated pair they're drawn to both sides of, ranked by their own
  // 16-D coordinates. Logged-out / unplaced visitors + crawlers get no
  // vector, so this is null and we fall back to the day-of-year pick: the
  // public/SEO output is unchanged. This page already reads cookies via
  // getServerLocale, so the auth read here adds no caching penalty.
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const orientation = await getUserOrientation(supabase, user?.id ?? null);
  const splitting = pickSplittingFeatured(orientation.vector);
  const featured = splitting ?? pickFeatured();
  const featuredPersonalized = splitting !== null;
  const featuredName1 = resolveName(featured.name1)?.name ?? featured.name1;
  const featuredName2 = resolveName(featured.name2)?.name ?? featured.name2;

  // Total resolvable pairs for the header subtitle.
  const totalPairs = groups.reduce((sum, g) => sum + g.pairs.length, 0);

  return (
    <main className="mx-auto max-w-[920px] px-5 pb-32 pt-10 sm:px-10">
      <PixelPageHeader
        eyebrow={t('vs.eyebrow', locale)}
        title={t('vs.title', locale)}
        subtitle={
          <p style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 16, color: 'var(--color-ink-soft)', lineHeight: 1.55 }}>
            {t('vs.subtitle', locale, { n: totalPairs })}
          </p>
        }
      />

      {/* ─── Featured matchup ──────────────────────────────────── */}
      <section style={{ marginBottom: 36 }}>
        <div style={{
          fontFamily: pixel,
          fontSize: 10,
          color: 'var(--color-acc-deep)',
          letterSpacing: 0.6,
          textTransform: 'uppercase',
          marginBottom: 8,
        }}>
          {featuredPersonalized
            ? t('vs.featured_splits_you', locale)
            : t('vs.featured_today', locale)}
        </div>
        <Link
          href={featured.href}
          className="pixel-press"
          style={{
            display: 'block',
            padding: '26px 26px',
            background: '#F8EBC9',
            border: '4px solid var(--color-ink)',
            boxShadow: '6px 6px 0 0 var(--color-acc)',
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
              color: 'var(--color-ink)',
              lineHeight: 1.15,
            }}>
              {featuredName1}
            </div>
            <div style={{
              fontFamily: pixel,
              fontSize: 14,
              color: 'var(--color-acc-deep)',
              letterSpacing: 1,
              textTransform: 'uppercase',
            }}>
              {t('vs.vs_badge', locale)}
            </div>
            <div style={{
              fontFamily: serif,
              fontSize: 26,
              fontWeight: 500,
              color: 'var(--color-ink)',
              lineHeight: 1.15,
            }}>
              {featuredName2}
            </div>
          </div>
          {featuredPersonalized && (
            <div style={{
              marginTop: 12,
              fontFamily: serif,
              fontStyle: 'italic',
              fontSize: 14.5,
              color: 'var(--color-ink-soft)',
              lineHeight: 1.5,
            }}>
              {t('vs.splits_you_note', locale)}
            </div>
          )}
          <div style={{
            marginTop: 12,
            fontFamily: pixel,
            fontSize: 10,
            color: 'var(--color-acc-deep)',
            letterSpacing: 0.6,
            textTransform: 'uppercase',
          }}>
            {t('vs.compare_cta', locale)}
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
              padding: '11px 11px',
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
              color: 'var(--color-ink)',
            }}>
              {g.label}
            </h2>
            <span style={{
              fontFamily: sans,
              fontSize: 11,
              color: 'var(--color-acc-deep)',
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
            color: 'var(--color-ink-soft)',
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
                    border: '3px solid var(--color-ink)',
                    boxShadow: `3px 3px 0 0 ${g.accent}`,
                    borderRadius: 0,
                    textDecoration: 'none',
                    color: 'var(--color-ink)',
                    height: '100%',
                    transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end)',
                  }}
                >
                  <div style={{
                    fontFamily: serif,
                    fontSize: 17,
                    fontWeight: 500,
                    color: 'var(--color-ink)',
                    lineHeight: 1.25,
                  }}>
                    {p.name1} <span style={{ color: 'var(--color-acc-deep)', fontFamily: pixel, fontSize: 10 }}>{t('vs.vs_badge', locale)}</span> {p.name2}
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
        border: '3px solid var(--color-ink)',
        boxShadow: '4px 4px 0 0 #6B7F4F',
      }}>
        <p style={{
          fontFamily: serif,
          fontSize: 16,
          color: 'var(--color-ink)',
          margin: '0 0 6px',
          lineHeight: 1.5,
        }}>
          {t('vs.construct_q', locale)}
        </p>
        <p style={{
          fontFamily: serif,
          fontStyle: 'italic',
          fontSize: 14.5,
          color: 'var(--color-ink-soft)',
          margin: '0 0 12px',
          lineHeight: 1.5,
        }}>
          {t('vs.construct_body_pre', locale, { n: PHILOSOPHERS.length })}<code style={{ fontFamily: pixel, fontSize: 12, color: 'var(--color-acc-deep)' }}>/vs/[slug-a]/[slug-b]</code>{t('vs.construct_body_post', locale)}
        </p>
        <Link
          href="/philosopher"
          style={{
            display: 'inline-block',
            fontFamily: pixel,
            fontSize: 11,
            padding: '8px 14px',
            background: 'var(--color-ink)',
            color: '#F8EBC9',
            border: '2px solid var(--color-ink)',
            textDecoration: 'none',
            letterSpacing: 0.6,
            textTransform: 'uppercase',
          }}
        >
          {t('vs.browse_philosophers', locale)}
        </Link>
      </div>
    </main>
  );
}
