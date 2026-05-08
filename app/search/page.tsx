// Public profile search. Live search as the user types (300ms debounce),
// hits /api/profile/search, renders a result list. No auth required —
// public profiles are by definition world-readable.

import { getServerLocale } from '@/lib/locale-server';
import { t } from '@/lib/translations';
import LanguageSwitcher from '@/components/language-switcher';
import Link from 'next/link';
import SearchPanel from './search-panel';
import type { Metadata } from 'next';

const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'Inter', system-ui, sans-serif";

export const metadata: Metadata = {
  title: 'Search public profiles',
  description: 'Find public Mull profiles by name or handle.',
  alternates: { canonical: 'https://mull.world/search' },
};

export default async function SearchPage() {
  const locale = await getServerLocale();
  return (
    <main style={{ maxWidth: 720, margin: '60px auto', padding: '0 24px 120px' }}>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 36,
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <Link href="/" style={{
          fontFamily: serif,
          fontSize: 28,
          fontWeight: 500,
          color: '#221E18',
          textDecoration: 'none',
          letterSpacing: '-0.5px',
        }}>
          Mull<span style={{ color: '#B8862F' }}>.</span>
        </Link>
        <LanguageSwitcher initial={locale} />
      </header>

      <h1 style={{
        fontFamily: serif,
        fontSize: 38,
        fontWeight: 500,
        margin: '0 0 8px',
        letterSpacing: '-0.5px',
      }}>
        {t('search.title', locale)}
      </h1>
      <p style={{
        fontFamily: serif,
        fontStyle: 'italic',
        fontSize: 18,
        color: '#4A4338',
        margin: '0 0 32px',
        lineHeight: 1.55,
      }}>
        {t('search.subtitle', locale)}
      </p>

      <SearchPanel locale={locale} />

      <p style={{
        marginTop: 60,
        fontFamily: sans,
        fontSize: 12,
        color: '#8C6520',
        opacity: 0.7,
        textAlign: 'center',
      }}>
        <Link href="/account/profile" style={{ color: '#8C6520', textDecoration: 'underline', textUnderlineOffset: 3 }}>
          {t('search.cta_make_profile', locale)}
        </Link>
      </p>
    </main>
  );
}
