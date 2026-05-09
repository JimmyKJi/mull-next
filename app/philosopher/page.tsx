// /philosopher — index of all 166 philosophers in the constellation.
// Grouped by archetype so the page also doubles as a "browse by
// orientation" surface. Each entry links to /philosopher/[slug].
//
// Public, indexable. Functions as a hub for the SEO surface — Google
// crawls this once and finds all 166 detail pages from a single
// click. Also where users go when they want to browse rather than
// search.
//
// Not interactive search yet — that's a follow-up. For now: alphabetical
// within each archetype cluster, with the archetype's spirit phrase as
// the cluster headline.

import Link from 'next/link';
import type { Metadata } from 'next';
import { PHILOSOPHERS, philosopherSlug, type PhilosopherEntry } from '@/lib/philosophers';
import { ARCHETYPES } from '@/lib/archetypes';
import { FIGURES } from '@/lib/figures';
import { getServerLocale } from '@/lib/locale-server';
import { t } from '@/lib/translations';

const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'Inter', system-ui, sans-serif";

export const metadata: Metadata = {
  title: 'The constellation',
  description: 'All 166 thinkers in Mull\'s philosophical constellation, grouped by archetype. Click any to read their key idea, dimensional position, and nearest minds.',
  openGraph: {
    title: 'The constellation — Mull',
    description: '166 thinkers across 10 archetypes. The full map of the long conversation.',
    url: 'https://mull.world/philosopher',
    siteName: 'Mull',
    type: 'article',
  },
  alternates: { canonical: 'https://mull.world/philosopher' },
};

export default async function PhilosopherIndexPage() {
  const locale = await getServerLocale();

  // Group philosophers by archetype, preserving the order in ARCHETYPES.
  const byArchetype = new Map<string, PhilosopherEntry[]>();
  for (const a of ARCHETYPES) byArchetype.set(a.key, []);
  for (const p of PHILOSOPHERS) {
    const list = byArchetype.get(p.archetypeKey);
    if (list) list.push(p);
    else byArchetype.set(p.archetypeKey, [p]);
  }
  // Alphabetize within each cluster — names without surnames mostly,
  // so a simple .sort works.
  for (const list of byArchetype.values()) {
    list.sort((a, b) => a.name.localeCompare(b.name));
  }

  return (
    <main style={{ maxWidth: 920, margin: '24px auto 80px', padding: '0 24px' }}>
      <div style={{
        fontFamily: sans, fontSize: 11, fontWeight: 600,
        color: '#8C6520', textTransform: 'uppercase',
        letterSpacing: '0.18em', marginBottom: 14,
      }}>
        {t('philindex.eyebrow', locale)}
      </div>
      <h1 style={{
        fontFamily: serif, fontSize: 46, fontWeight: 500,
        margin: '0 0 12px', letterSpacing: '-0.5px', lineHeight: 1.05,
      }}>
        {t('philindex.title', locale)}
      </h1>
      <p style={{
        fontFamily: serif, fontStyle: 'italic',
        fontSize: 19, color: '#4A4338',
        margin: '0 0 12px', lineHeight: 1.5,
      }}>
        {t('philindex.subtitle', locale, { n: PHILOSOPHERS.length })}
      </p>
      <p style={{
        fontFamily: sans, fontSize: 14, color: '#8C6520',
        margin: '0 0 40px', lineHeight: 1.6, opacity: 0.9, maxWidth: 700,
      }}>
        {t('philindex.intro', locale)}
      </p>

      {ARCHETYPES.map(arch => {
        const list = byArchetype.get(arch.key) || [];
        if (list.length === 0) return null;
        const figure = FIGURES[arch.key] || '';
        const archName = t(`arch.${arch.key}.name`, locale) || arch.key;
        return (
          <section key={arch.key} style={{
            marginBottom: 44, paddingTop: 24,
            borderTop: '1px solid #EBE3CA',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 14,
              marginBottom: 6,
            }}>
              <div
                style={{ width: 48, height: 48, flexShrink: 0 }}
                aria-hidden
                dangerouslySetInnerHTML={{ __html: figure }}
              />
              <div>
                <Link href={`/archetype/${arch.key}`} style={{
                  fontFamily: serif, fontSize: 26, fontWeight: 500,
                  color: '#221E18', textDecoration: 'none',
                  letterSpacing: '-0.2px',
                }}>
                  {archName} →
                </Link>
                <div style={{
                  fontFamily: serif, fontStyle: 'italic',
                  fontSize: 15, color: '#8C6520',
                  marginTop: 2, lineHeight: 1.4,
                }}>
                  {arch.spirit}
                </div>
              </div>
              <div style={{
                marginLeft: 'auto',
                fontFamily: sans, fontSize: 11, fontWeight: 600,
                color: '#8C6520', textTransform: 'uppercase',
                letterSpacing: '0.14em',
              }}>
                {list.length}
              </div>
            </div>
            <ul style={{
              listStyle: 'none', padding: 0, margin: '14px 0 0',
              display: 'grid', gap: 8,
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            }}>
              {list.map(p => (
                <li key={p.name}>
                  <Link
                    href={`/philosopher/${philosopherSlug(p.name)}`}
                    style={{
                      display: 'block', padding: '10px 14px',
                      background: '#FFFCF4', border: '1px solid #EBE3CA',
                      borderRadius: 6, textDecoration: 'none', color: 'inherit',
                    }}
                  >
                    <div style={{
                      fontFamily: serif, fontSize: 16, fontWeight: 500,
                      color: '#221E18', marginBottom: 2,
                    }}>
                      {p.name}
                    </div>
                    <div style={{
                      fontFamily: sans, fontSize: 11.5,
                      color: '#8C6520', letterSpacing: 0.2,
                    }}>
                      {p.dates}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <p style={{
        marginTop: 48, textAlign: 'center',
        fontFamily: sans, fontSize: 13, color: '#8C6520',
      }}>
        <Link href="/" style={{ color: '#8C6520', textDecoration: 'underline', textUnderlineOffset: 3 }}>
          ← {t('philindex.back_home', locale)}
        </Link>
      </p>
    </main>
  );
}
