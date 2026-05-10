// Global TopBar — the same brandbar that lives on the mull.html homepage,
// rendered as a Next.js server component so every Next.js route gets it
// for free. Mounted in app/layout.tsx via TopBarMount, which hides it on
// /account (per Jimmy's request — /account keeps its existing in-page
// header with the LogoutButton).
//
// Auth state is detected server-side. Signed-in users see the full nav
// (incl. Diary, Simulated debate, Account chip); signed-out users see
// the public subset and a Sign in chip.
//
// Visual styling deliberately mirrors mull.html's brandbar so the chrome
// feels continuous between the static home page and the Next.js routes.

import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { getServerLocale } from '@/lib/locale-server';
import { t } from '@/lib/translations';
import LanguageSwitcher from './language-switcher';

const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'Inter', system-ui, sans-serif";

export default async function GlobalTopBar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const locale = await getServerLocale();

  return (
    <>
      {/* Topbar styles — kept inline so the component is self-contained
          and we don't have to thread CSS imports through layout.tsx. */}
      <style>{`
        .mull-topbar-shell {
          width: 100%;
          background: #FAF6EC;
          padding: 24px 28px 0;
          box-sizing: border-box;
        }
        .mull-topbar-inner {
          max-width: 1280px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 36px;
        }
        .mull-topbar-brand {
          font-family: ${serif};
          font-weight: 600;
          font-size: 38px;
          letter-spacing: 0.5px;
          color: #221E18;
          text-decoration: none;
          line-height: 1;
        }
        .mull-topbar-brand span { color: #B8862F; }
        .mull-topbar-right {
          display: flex;
          align-items: center;
          gap: 18px;
          flex-wrap: nowrap;
          justify-content: flex-end;
          min-width: 0;
        }
        .mull-topbar-link {
          background: none;
          border: none;
          font-family: ${sans};
          font-size: 14px;
          color: #4A4338;
          font-weight: 500;
          cursor: pointer;
          padding: 4px 2px;
          text-decoration: none;
          transition: color .15s ease;
        }
        .mull-topbar-link:hover { color: #8C6520; }
        .mull-topbar-chip {
          padding: 6px 14px;
          border: 1px solid #D6CDB6;
          border-radius: 999px;
          background: #FFFCF4;
          font-size: 13.5px;
          font-weight: 500;
          color: #221E18;
          text-decoration: none;
        }
        .mull-topbar-chip:hover { border-color: #B8862F; color: #8C6520; }
        @media (min-width: 700px) {
          .mull-topbar-brand { font-size: 44px; }
        }
        @media (max-width: 900px) {
          .mull-topbar-right { gap: 12px; }
          .mull-topbar-link { font-size: 13px; }
        }
        @media (max-width: 700px) {
          .mull-topbar-shell { padding: 18px 18px 0; }
          .mull-topbar-inner { margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
          .mull-topbar-right { gap: 10px; flex-wrap: wrap; }
          .mull-topbar-brand { font-size: 32px; }
          .mull-topbar-link-secondary { display: none; }
        }
      `}</style>

      <div className="mull-topbar-shell">
        <div className="mull-topbar-inner">
          <Link href="/" className="mull-topbar-brand">
            Mull<span>.</span>
          </Link>
          <nav className="mull-topbar-right" aria-label="Primary">
            <Link href="/dilemma" className="mull-topbar-link">
              {t('nav.dilemma', locale)}
            </Link>
            <Link href="/exercises" className="mull-topbar-link mull-topbar-link-secondary">
              {t('nav.exercises', locale)}
            </Link>
            <Link href="/archetype" className="mull-topbar-link mull-topbar-link-secondary">
              {t('nav.archetypes', locale)}
            </Link>
            <Link href="/philosopher" className="mull-topbar-link mull-topbar-link-secondary">
              {t('nav.philosophers', locale)}
            </Link>
            <Link href="/about" className="mull-topbar-link">
              {t('nav.about', locale)}
            </Link>
            <Link href="/search" className="mull-topbar-link mull-topbar-link-secondary">
              {t('nav.search_leaderboard', locale)}
            </Link>
            <Link href="/compare" className="mull-topbar-link mull-topbar-link-secondary">
              Compare
            </Link>
            {user && (
              <>
                <Link href="/diary" className="mull-topbar-link mull-topbar-link-secondary">
                  {t('nav.diary', locale)}
                </Link>
                <Link href="/debate" className="mull-topbar-link mull-topbar-link-secondary">
                  {t('nav.debate', locale)}
                </Link>
              </>
            )}
            <Link
              href={user ? '/account' : '/login'}
              className="mull-topbar-link mull-topbar-chip"
              title={user ? 'Your account' : 'Sign in or create an account'}
            >
              {user ? t('nav.account_arrow', locale) : t('nav.signin', locale)}
            </Link>
            <LanguageSwitcher initial={locale} />
          </nav>
        </div>
      </div>
    </>
  );
}
