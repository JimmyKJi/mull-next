// /archetype — index of all 10 archetypes. Public, indexable. Each card
// links to its detail page with the long-form essay, quotes, reading list,
// and so on.

import Link from 'next/link';
import type { Metadata } from 'next';
import { ARCHETYPES } from '@/lib/archetypes';
import { FIGURES } from '@/lib/figures';
import { getServerLocale } from '@/lib/locale-server';
import { t } from '@/lib/translations';
import LanguageSwitcher from '@/components/language-switcher';

const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'Inter', system-ui, sans-serif";

export const metadata: Metadata = {
  title: 'The ten archetypes',
  description: "The ten philosophical orientations Mull's quiz can place you at — Cartographer, Keel, Threshold, Pilgrim, Touchstone, Hearth, Forge, Hammer, Garden, Lighthouse.",
  openGraph: {
    title: 'The ten archetypes — Mull',
    description: "The ten philosophical orientations Mull's quiz can place you at.",
    url: 'https://mull.world/archetype',
    siteName: 'Mull',
    type: 'article',
  },
  alternates: { canonical: 'https://mull.world/archetype' },
};

export default async function ArchetypeIndexPage() {
  const locale = await getServerLocale();

  return (
    <main style={{ maxWidth: 920, margin: '0 auto', padding: '60px 24px 120px' }}>
      <header style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        marginBottom: 36, gap: 16, flexWrap: 'wrap'
      }}>
        <Link href="/" style={{
          fontFamily: serif, fontSize: 28, fontWeight: 500,
          color: '#221E18', textDecoration: 'none', letterSpacing: '-0.5px'
        }}>
          Mull<span style={{ color: '#B8862F' }}>.</span>
        </Link>
        <LanguageSwitcher initial={locale} />
      </header>

      <section style={{ marginBottom: 40 }}>
        <h1 style={{
          fontFamily: serif, fontSize: 42, fontWeight: 500,
          margin: '0 0 14px', letterSpacing: '-0.5px', lineHeight: 1.1,
        }}>
          {t('arch_index.title', locale)}
        </h1>
        <p style={{
          fontFamily: serif, fontStyle: 'italic',
          fontSize: 18, color: '#4A4338', margin: '0 0 12px', lineHeight: 1.5,
        }}>
          {t('arch_index.subtitle', locale)}
        </p>
        <p style={{
          fontFamily: sans, fontSize: 14, color: '#8C6520',
          margin: 0, lineHeight: 1.6, opacity: 0.9, maxWidth: 640,
        }}>
          {t('arch_index.intro', locale)}
        </p>
      </section>

      <ul style={{
        listStyle: 'none', padding: 0, margin: 0,
        display: 'grid', gap: 16,
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      }}>
        {ARCHETYPES.map(a => {
          const name = t(`arch.${a.key}.name`, locale) || a.key;
          const blurb = t(`arch.${a.key}.blurb`, locale) || '';
          const svg = FIGURES[a.key] || '';

          return (
            <li key={a.key}>
              <Link
                href={`/archetype/${a.key}`}
                style={{
                  display: 'block',
                  background: '#FFFCF4',
                  border: '1px solid #EBE3CA',
                  borderRadius: 10,
                  padding: '20px 22px',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'border-color 0.18s, box-shadow 0.18s',
                  height: '100%',
                }}
              >
                <div style={{
                  display: 'flex', alignItems: 'flex-start', gap: 14,
                  marginBottom: 10,
                }}>
                  <div
                    style={{ width: 64, height: 64, flexShrink: 0 }}
                    aria-hidden
                    dangerouslySetInnerHTML={{ __html: svg }}
                  />
                  <div>
                    <div style={{
                      fontFamily: sans, fontSize: 10, fontWeight: 600,
                      color: '#8C6520', textTransform: 'uppercase',
                      letterSpacing: '0.18em', marginBottom: 4,
                    }}>
                      {t('arch_index.eyebrow_one', locale)}
                    </div>
                    <h2 style={{
                      fontFamily: serif, fontSize: 22, fontWeight: 500,
                      margin: 0, color: '#221E18', lineHeight: 1.2,
                    }}>
                      {name}
                    </h2>
                    <p style={{
                      fontFamily: serif, fontStyle: 'italic',
                      fontSize: 14, color: '#8C6520',
                      margin: '4px 0 0', lineHeight: 1.4,
                    }}>
                      {a.spirit}
                    </p>
                  </div>
                </div>
                <p style={{
                  fontFamily: sans, fontSize: 14,
                  color: '#4A4338', margin: 0, lineHeight: 1.55,
                }}>
                  {blurb}
                </p>
                <span style={{
                  display: 'inline-block', marginTop: 10,
                  fontFamily: sans, fontSize: 13, color: '#2F5D5C',
                  borderBottom: '1px solid rgba(47, 93, 92, 0.4)',
                  paddingBottom: 1,
                }}>
                  {t('arch_index.read_more', locale)}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <p style={{
        marginTop: 48, textAlign: 'center',
        fontFamily: sans, fontSize: 13, color: '#8C6520',
      }}>
        <Link href="/" style={{ color: '#8C6520', textDecoration: 'underline', textUnderlineOffset: 3 }}>
          ← {t('arch_index.back_to_home', locale)}
        </Link>
      </p>
    </main>
  );
}
