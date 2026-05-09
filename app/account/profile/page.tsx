import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import ProfileForm from './profile-form';
import DataControls from './data-controls';
import { getServerLocale } from '@/lib/locale-server';
import { t } from '@/lib/translations';
import LanguageSwitcher from '@/components/language-switcher';

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'Inter', system-ui, sans-serif";

type ProfileRow = {
  handle: string;
  display_name: string | null;
  bio: string | null;
  show_archetype: boolean;
  show_dimensions: boolean;
  show_map: boolean;
  show_streak: boolean;
  is_searchable: boolean;
};

export default async function ProfileSettingsPage() {
  const supabase = await createClient();
  const locale = await getServerLocale();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('public_profiles')
    .select('handle, display_name, bio, show_archetype, show_dimensions, show_map, show_streak, is_searchable')
    .eq('user_id', user.id)
    .maybeSingle<ProfileRow>();

  return (
    <main style={{ maxWidth: 640, margin: '0 auto', padding: '60px 24px 120px' }}>
      <header style={{
        marginBottom: 36,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <Link href="/account" style={{
          fontFamily: sans,
          fontSize: 13,
          color: '#4A4338',
          textDecoration: 'none',
        }}>
          ← {t('nav.account', locale)}
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
        {t('profile.eyebrow', locale)}
      </div>
      <h1 style={{
        fontFamily: serif,
        fontSize: 38,
        fontWeight: 500,
        margin: '0 0 12px',
        letterSpacing: '-0.01em',
        lineHeight: 1.1,
      }}>
        {t('profile.title_html', locale).split('{em_map}').map((part, i, arr) => (
          <span key={i}>{part}{i < arr.length - 1 && <em style={{ color: '#8C6520' }}>{t('profile.map_em', locale)}</em>}</span>
        ))}
      </h1>
      <p style={{
        fontFamily: serif,
        fontStyle: 'italic',
        fontSize: 17,
        color: '#4A4338',
        marginBottom: 30,
        lineHeight: 1.55,
      }}>
        {t('profile.subtitle_html', locale, {
          code: 'mull.world/u/<your-handle>'
        })}
      </p>

      <ProfileForm initial={profile} userEmail={user.email || ''} locale={locale} />

      <p style={{
        fontFamily: sans,
        fontSize: 12,
        color: '#8C6520',
        marginTop: 36,
        opacity: 0.75,
        lineHeight: 1.55,
      }}>
        {t('profile.privacy_footer', locale)}
      </p>

      <DataControls locale={locale} />
    </main>
  );
}
