// /account/retrospective — generates and displays the user's yearly
// retrospective essay. Mull+ feature, but currently open while we dogfood.

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { getServerLocale } from '@/lib/locale-server';
import { t } from '@/lib/translations';
import LanguageSwitcher from '@/components/language-switcher';
import RetrospectivePanel from './retrospective-panel';

const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'Inter', system-ui, sans-serif";

export default async function RetrospectivePage() {
  const supabase = await createClient();
  const locale = await getServerLocale();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '60px 24px 120px' }}>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 36,
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <Link href="/account" style={{
          fontFamily: sans,
          fontSize: 13,
          color: '#4A4338',
          textDecoration: 'none',
        }}>
          ← Account
        </Link>
        <LanguageSwitcher initial={locale} />
      </header>

      <div style={{
        fontFamily: sans,
        fontSize: 11,
        fontWeight: 600,
        color: '#8C6520',
        textTransform: 'uppercase',
        letterSpacing: '0.18em',
        marginBottom: 14,
      }}>
        {t('retro.eyebrow', locale)}
      </div>
      <h1 style={{
        fontFamily: serif,
        fontSize: 42,
        fontWeight: 500,
        margin: '0 0 12px',
        letterSpacing: '-0.5px',
      }}>
        {t('retro.title', locale)}
      </h1>
      <p style={{
        fontFamily: serif,
        fontStyle: 'italic',
        fontSize: 18,
        color: '#4A4338',
        margin: '0 0 36px',
        lineHeight: 1.55,
      }}>
        {t('retro.subtitle', locale)}
      </p>

      <RetrospectivePanel locale={locale} />

      <p style={{
        marginTop: 56,
        fontFamily: sans,
        fontSize: 12,
        color: '#8C6520',
        opacity: 0.75,
        lineHeight: 1.6,
      }}>
        {t('retro.dogfood_note', locale)}
      </p>
    </main>
  );
}
