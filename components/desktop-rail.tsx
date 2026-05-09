// Persistent right-side navigation rail. Mounted in app/layout.tsx inside
// a CSS grid (the .mull-shell), so on desktop the rail occupies the column
// next to the centered page content — content + rail are centered together
// as a unit. On mobile the rail is hidden via CSS and pages keep their
// per-page header layout.
//
// Sticky-positioned within its grid cell so it stays in view as the user
// scrolls down a long page.
//
// Auth state is detected server-side. Signed-in users see all features;
// unsigned visitors see only the public ones plus a prominent Sign in
// button at the top.

import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { getServerLocale } from '@/lib/locale-server';
import { t } from '@/lib/translations';

const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'Inter', system-ui, sans-serif";

export default async function DesktopRail() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const locale = await getServerLocale();

  return (
    <>
      {/* Hide on narrow viewports — phones keep per-page header layout. */}
      <style>{`
        .mull-desktop-rail { display: none; }
        @media (min-width: 1100px) {
          .mull-desktop-rail {
            display: flex;
            position: sticky;
            top: 24px;
            margin-top: 24px;
            margin-right: 24px;
            max-height: calc(100vh - 48px);
            overflow-y: auto;
          }
        }
      `}</style>
      <aside
        className="mull-desktop-rail"
        aria-label="Site navigation"
        style={{
          width: 200,
          flexDirection: 'column',
          gap: 4,
          padding: '20px 18px',
          background: '#FFFCF4',
          border: '1px solid #EBE3CA',
          borderRadius: 12,
          boxShadow: '0 1px 0 rgba(0,0,0,0.02), 0 8px 24px rgba(34,30,24,0.04)',
          fontFamily: sans,
          boxSizing: 'border-box',
        }}
      >
        {/* Brand */}
        <Link href="/" style={{
          display: 'block', marginBottom: 14,
          fontFamily: serif, fontSize: 32, fontWeight: 600,
          color: '#221E18', textDecoration: 'none',
          letterSpacing: '-0.5px', lineHeight: 1,
        }}>
          Mull<span style={{ color: '#B8862F' }}>.</span>
        </Link>

        {/* Account / sign-in — most prominent so it's always findable */}
        {user ? (
          <Link
            href="/account"
            style={{
              ...accountChip,
              background: '#221E18',
              color: '#FAF6EC',
              borderColor: '#221E18',
            }}
          >
            {t('rail.account', locale)}
          </Link>
        ) : (
          <Link
            href="/login"
            style={{
              ...accountChip,
              background: '#221E18',
              color: '#FAF6EC',
              borderColor: '#221E18',
            }}
          >
            {t('rail.signin', locale)}
          </Link>
        )}

        <RailDivider />
        <RailSectionHeading>{t('rail.section_today', locale)}</RailSectionHeading>
        <RailLink href="/dilemma">{t('rail.dilemma', locale)}</RailLink>
        {user && <RailLink href="/dilemma/archive">{t('rail.archive', locale)}</RailLink>}
        {user && <RailLink href="/diary">{t('rail.diary', locale)}</RailLink>}

        <RailDivider />
        <RailSectionHeading>{t('rail.section_practice', locale)}</RailSectionHeading>
        <RailLink href="/exercises">{t('rail.exercises', locale)}</RailLink>
        {user && <RailLink href="/debate">{t('rail.debate', locale)}</RailLink>}

        <RailDivider />
        <RailSectionHeading>{t('rail.section_explore', locale)}</RailSectionHeading>
        <RailLink href="/archetype">{t('rail.archetypes', locale)}</RailLink>
        <RailLink href="/search">{t('rail.leaderboard', locale)}</RailLink>

        <RailDivider />
        <RailSectionHeading>{t('rail.section_about', locale)}</RailSectionHeading>
        <RailLink href="/about" small>{t('rail.about', locale)}</RailLink>
        <RailLink href="/methodology" small>{t('rail.methodology', locale)}</RailLink>
        <RailLink href="/billing" small>{t('rail.billing', locale)}</RailLink>
      </aside>
    </>
  );
}

const accountChip: React.CSSProperties = {
  display: 'block',
  textAlign: 'center',
  padding: '10px 14px',
  borderRadius: 8,
  border: '1px solid',
  fontSize: 13.5,
  fontWeight: 500,
  textDecoration: 'none',
  letterSpacing: 0.3,
  marginBottom: 4,
};

function RailDivider() {
  return <div style={{ height: 1, background: '#EBE3CA', margin: '12px 0 8px' }} />;
}

function RailSectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 600,
      color: '#8C6520', textTransform: 'uppercase',
      letterSpacing: '0.16em', margin: '4px 0 6px',
    }}>
      {children}
    </div>
  );
}

function RailLink({
  href, children, small = false,
}: {
  href: string;
  children: React.ReactNode;
  small?: boolean;
}) {
  return (
    <Link
      href={href}
      style={{
        display: 'block',
        padding: small ? '4px 0' : '6px 0',
        fontFamily: sans,
        fontSize: small ? 12.5 : 13.5,
        color: small ? '#8C6520' : '#221E18',
        textDecoration: 'none',
        lineHeight: 1.4,
      }}
    >
      {children}
    </Link>
  );
}
