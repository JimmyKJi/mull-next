// /search — was just a public-profile search panel; now leads with an
// activity leaderboard, with the search panel below as a "find someone
// specific" affordance. The route stays /search so existing links from
// brandbar etc. don't break.
//
// When the forum lands, this page will get a tab switcher above the
// leaderboard with at least two leaderboards: activity (this one) and
// forum reputation (upvotes received). See task #38.

import { getServerLocale } from '@/lib/locale-server';
import { t } from '@/lib/translations';
import LanguageSwitcher from '@/components/language-switcher';
import Link from 'next/link';
import SearchPanel from './search-panel';
import Leaderboard from './leaderboard';
import type { Metadata } from 'next';

const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'Inter', system-ui, sans-serif";

export const metadata: Metadata = {
  title: 'Leaderboard & search',
  description: 'The most active Mull users, plus a search across public profiles.',
  alternates: { canonical: 'https://mull.world/search' },
};

export default async function SearchPage() {
  const locale = await getServerLocale();

  return (
    <main style={{ maxWidth: 760, margin: '60px auto', padding: '0 24px 120px' }}>
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
        <nav style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <LanguageSwitcher initial={locale} />
          <Link href="/account" style={{
            fontFamily: sans, fontSize: 13, color: '#4A4338',
            textDecoration: 'none', letterSpacing: 0.3,
          }}>
            {t('nav.account_arrow', locale)}
          </Link>
        </nav>
      </header>

      <div style={{
        fontFamily: sans, fontSize: 11, fontWeight: 600,
        color: '#8C6520', textTransform: 'uppercase',
        letterSpacing: '0.18em', marginBottom: 14,
      }}>
        {t('search.eyebrow', locale)}
      </div>
      <h1 style={{
        fontFamily: serif,
        fontSize: 42,
        fontWeight: 500,
        margin: '0 0 12px',
        letterSpacing: '-0.5px',
        lineHeight: 1.1,
      }}>
        {t('search.h1', locale)}
      </h1>
      <p style={{
        fontFamily: serif,
        fontStyle: 'italic',
        fontSize: 18,
        color: '#4A4338',
        margin: '0 0 36px',
        lineHeight: 1.55,
      }}>
        {t('search.h1_subtitle', locale)}
      </p>

      <Leaderboard locale={locale} />

      <section>
        <h2 style={{
          fontFamily: serif, fontSize: 24, fontWeight: 500,
          margin: '0 0 6px', color: '#221E18', letterSpacing: '-0.2px',
        }}>
          {t('search.find_someone', locale)}
        </h2>
        <p style={{
          fontFamily: serif, fontStyle: 'italic',
          fontSize: 15, color: '#4A4338',
          margin: '0 0 18px', lineHeight: 1.55,
        }}>
          {t('search.subtitle', locale)}
        </p>
        <SearchPanel locale={locale} />
      </section>

      <p style={{
        marginTop: 60,
        fontFamily: sans,
        fontSize: 12,
        color: '#8C6520',
        opacity: 0.8,
        textAlign: 'center',
        lineHeight: 1.55,
      }}>
        <Link href="/account/profile" style={{ color: '#8C6520', textDecoration: 'underline', textUnderlineOffset: 3 }}>
          {t('search.cta_make_profile', locale)}
        </Link>
      </p>
    </main>
  );
}
