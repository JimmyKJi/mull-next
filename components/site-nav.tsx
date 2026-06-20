'use client';

// SiteNav — sticky pixel top bar with GROUPED umbrella dropdowns.
//
// The wordmark sits left; the center holds a handful of umbrella menus
// (Quiz · Daily · Practice · Explore · About) that reveal their sub-pages
// on hover / focus / tap. This replaces the old flat list of links, so
// deep surfaces (Exercises, the Crucible, Argument Diary, the Wandering
// Question…) are reachable in one move instead of hiding in the command
// palette. Cmd-K search + Account sit on the right.
//
// On <md the umbrella row collapses into a single "Menu" button that
// opens a full-screen grouped sheet — hover doesn't exist on touch, so
// the dropdowns wouldn't be reachable otherwise.
//
// Labels are localized via t(key, locale). The locale is passed down
// from the root layout (a server component that reads the cookie), so
// the bar renders in the right language on the server with no hydration
// flash.

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ARCHETYPES } from '@/lib/archetypes';
import { PHILOSOPHERS } from '@/lib/philosophers';
import { t, type Locale } from '@/lib/translations';
import FocusTrap from './focus-trap';
import { MullMark } from './mull-mark';
import LanguageSwitcher from './language-switcher';

// Umbrella groups. `key` is a translation key (nav.group.*); each item's
// `key` is a nav.* translation key. Order follows the funnel: assess →
// return daily → train → browse → meta. Every substantive route lives in
// exactly one group, so nothing is orphaned to the palette alone.
type NavItem = { href: string; key: string };
type NavGroup = { key: string; items: NavItem[] };

const NAV_GROUPS: NavGroup[] = [
  {
    key: 'nav.group.quiz',
    items: [
      { href: '/quiz/journey', key: 'nav.quiz_journey' },
      { href: '/quiz?mode=quick', key: 'nav.quiz_classic' },
      { href: '/quiz?mode=detailed', key: 'nav.quiz_detailed' },
      { href: '/result', key: 'nav.result' },
    ],
  },
  {
    key: 'nav.group.daily',
    items: [
      { href: '/spar', key: 'nav.spar' },
      { href: '/dilemma', key: 'nav.dilemma' },
      { href: '/diary', key: 'nav.diary' },
      { href: '/crucible', key: 'nav.crucible' },
      { href: '/wandering', key: 'nav.wandering' },
      { href: '/year', key: 'nav.year' },
    ],
  },
  {
    key: 'nav.group.practice',
    items: [
      { href: '/exercises', key: 'nav.exercises' },
      { href: '/arena', key: 'nav.arena' },
      { href: '/pilgrimage', key: 'nav.pilgrimage' },
      { href: '/argument-diary', key: 'nav.argument_diary' },
      { href: '/debate', key: 'nav.debate' },
    ],
  },
  {
    key: 'nav.group.explore',
    items: [
      { href: '/map', key: 'nav.map' },
      { href: '/atlas', key: 'nav.atlas' },
      { href: '/archetype', key: 'nav.archetypes' },
      { href: '/philosopher', key: 'nav.philosophers' },
      { href: '/topic', key: 'nav.topics' },
      { href: '/vs', key: 'nav.matchups' },
      { href: '/compare', key: 'nav.compare' },
      { href: '/anthology', key: 'nav.anthology' },
    ],
  },
  {
    key: 'nav.group.about',
    items: [
      { href: '/about', key: 'nav.about' },
      { href: '/methodology', key: 'nav.methodology' },
      { href: '/classes', key: 'nav.classes' },
      { href: '/install', key: 'nav.install' },
    ],
  },
];

// Routes that render inside a third-party iframe (or otherwise want a
// chromeless full-bleed experience). The nav is suppressed on these
// paths so the embed isn't cropped by it. Keep this list in sync with
// the comparable HIDDEN_PREFIXES in components/feedback-button.tsx.
const CHROMELESS_PREFIXES = ['/badge', '/share', '/wrapped', '/embed'];

export function SiteNav({ locale = 'en' }: { locale?: Locale }) {
  const pathname = usePathname() ?? '/';
  const [open, setOpen] = useState(false); // command palette
  const [openGroup, setOpenGroup] = useState<string | null>(null); // desktop dropdown
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const chromeless = CHROMELESS_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + '/'),
  );

  // Cmd-K / Ctrl-K toggles the palette; Escape closes whatever is open.
  // NB: every hook runs unconditionally — BEFORE the chromeless early
  // return below — so hook order stays stable when navigating between a
  // chromeless and a normal route (the old code returned null between
  // two hooks, which violated the rules of hooks).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isPaletteShortcut = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k';
      if (isPaletteShortcut) {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === 'Escape') {
        setOpen(false);
        setOpenGroup(null);
        setMobileOpen(false);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Close any open menu when the route changes (a link was followed).
  useEffect(() => {
    setOpenGroup(null);
    setMobileOpen(false);
  }, [pathname]);

  if (chromeless) return null;

  const isMac =
    typeof navigator !== 'undefined' &&
    /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform || navigator.userAgent);

  function isItemActive(href: string) {
    const base = href.split('?')[0];
    if (base === '/') return pathname === '/';
    return pathname === base || pathname.startsWith(base + '/');
  }
  function isGroupActive(g: NavGroup) {
    return g.items.some((it) => isItemActive(it.href));
  }

  // A short close delay lets the cursor cross the small gap between the
  // trigger and its panel without the menu flickering shut.
  function openNow(key: string) {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setOpenGroup(key);
  }
  function scheduleClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenGroup(null), 140);
  }

  return (
    <>
      {/* Pixel-game top nav — chunky 4px ink border on the bottom, flat
          cream surface, hard shadows, no rounded corners. Reads as the
          title bar of an 8-bit window. */}
      <nav className="sticky top-0 z-40 border-b-4 border-ink bg-cream">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-8">
          {/* Wordmark → home */}
          <Link
            href="/"
            className="-my-2 flex shrink-0 items-center gap-2.5 py-3 hover:text-acc-deep"
          >
            <span className="slow-bob inline-block">
              <MullMark size={22} />
            </span>
            <span
              className="text-[14px] tracking-[0.12em] text-ink"
              style={{ fontFamily: 'var(--font-pixel-display)' }}
            >
              MULL
            </span>
          </Link>

          {/* Center — umbrella dropdowns (md+). Each opens on hover, on
              keyboard focus, and on click/tap. */}
          <ul className="hidden items-center gap-1 md:flex">
            {NAV_GROUPS.map((g) => {
              const active = isGroupActive(g);
              const expanded = openGroup === g.key;
              return (
                <li
                  key={g.key}
                  className="relative"
                  onMouseEnter={() => openNow(g.key)}
                  onMouseLeave={scheduleClose}
                >
                  <button
                    type="button"
                    aria-haspopup="true"
                    aria-expanded={expanded}
                    onClick={() => setOpenGroup(expanded ? null : g.key)}
                    onFocus={() => openNow(g.key)}
                    className={
                      'flex items-center gap-1.5 px-2.5 py-1.5 text-[14px] font-medium leading-none transition-colors ' +
                      (active || expanded ? 'text-ink' : 'text-ink-soft hover:text-ink')
                    }
                  >
                    <span
                      className={
                        active
                          ? 'underline decoration-[3px] decoration-acc underline-offset-[6px]'
                          : ''
                      }
                    >
                      {t(g.key, locale)}
                    </span>
                    <span aria-hidden className="text-[8px] leading-none opacity-70">
                      {expanded ? '▲' : '▼'}
                    </span>
                  </button>

                  {expanded ? (
                    <div
                      role="menu"
                      aria-label={t(g.key, locale)}
                      className="absolute left-0 top-full z-50 mt-[6px] min-w-[210px] border-4 border-ink bg-[#FFFCF4] p-1.5 shadow-[6px_6px_0_0_var(--color-acc-deep)]"
                    >
                      <ul>
                        {g.items.map((it) => {
                          const itActive = isItemActive(it.href);
                          return (
                            <li key={it.href} role="none">
                              <Link
                                role="menuitem"
                                href={it.href}
                                onClick={() => setOpenGroup(null)}
                                className={
                                  'block whitespace-nowrap px-3 py-2 text-[14px] leading-none transition-none ' +
                                  (itActive
                                    ? 'bg-acc text-[#1A1612]'
                                    : 'text-ink hover:bg-acc-soft')
                                }
                              >
                                {t(it.key, locale)}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>

          {/* Right cluster — language, search, account, and (mobile) the menu toggle */}
          <div className="flex shrink-0 items-center gap-2.5">
            {/* Language picker — global, so it's reachable on every page
                (incl. home & the quiz). Hidden on the smallest screens
                where the bar is tight; the mobile drawer carries it
                there instead. */}
            <div className="hidden sm:block">
              <LanguageSwitcher initial={locale} />
            </div>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="hidden items-center gap-2 border-2 border-ink bg-[#FFFCF4] px-3 py-1.5 text-[13px] font-medium leading-none text-ink hover:bg-acc-soft sm:inline-flex"
              aria-label={t('nav.search_short', locale)}
            >
              <span>{t('nav.search_short', locale)}</span>
              <kbd className="pixel-kbd">{isMac ? '⌘K' : '^K'}</kbd>
            </button>
            <Link
              href="/account"
              className="hidden border-2 border-ink bg-ink px-3.5 py-1.5 text-[13px] font-medium leading-none text-cream hover:border-acc-deep hover:bg-acc-deep sm:inline-block"
            >
              {t('nav.account_btn', locale)}
            </Link>
            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-haspopup="true"
              aria-expanded={mobileOpen}
              aria-label={t('nav.menu', locale)}
              className="inline-flex items-center gap-1.5 border-2 border-ink bg-[#FFFCF4] px-3 py-3.5 text-[12px] font-medium leading-none text-ink hover:bg-acc-soft md:hidden"
              style={{ fontFamily: 'var(--font-pixel-display)' }}
            >
              <span aria-hidden>{mobileOpen ? '✕' : '☰'}</span>
              <span>{t('nav.menu', locale)}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile grouped sheet — full-bleed drawer under the bar. Rendered
          outside the sticky <nav> so it overlays content (fixed) instead
          of growing the bar and reflowing the page. */}
      {mobileOpen ? (
        <MobileMenu
          locale={locale}
          isItemActive={isItemActive}
          onClose={() => setMobileOpen(false)}
          onOpenSearch={() => {
            setMobileOpen(false);
            setOpen(true);
          }}
        />
      ) : null}

      {/* Mobile-only floating Cmd-K trigger. Sits bottom-RIGHT — the
          FeedbackButton's mobile icon lives bottom-LEFT, so the two
          thumb-zone corners are split between them. Safe-area inset
          stacks on the base offset so it clears the iPhone home
          indicator when installed as a PWA. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t('palette.open', locale)}
        className="pixel-press fixed right-[18px] z-[60] flex h-12 w-12 items-center justify-center border-4 border-ink bg-ink text-cream shadow-[3px_3px_0_0_var(--color-acc)] sm:hidden"
        style={{
          bottom: 'calc(18px + env(safe-area-inset-bottom, 0px))',
          fontFamily: 'var(--font-pixel-display)',
          fontSize: 14,
          letterSpacing: 0,
          transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end)',
        }}
      >
        ⌘K
      </button>

      {open ? <CommandPalette locale={locale} onClose={() => setOpen(false)} /> : null}
    </>
  );
}

// ────────────────────────────────────────────────────────────────
// MobileMenu — touch drawer. Lists every umbrella group as a labelled
// section of tap targets (hover dropdowns don't work on touch). Closes
// on backdrop tap, Escape, or following a link. Search + Account live at
// the bottom since they're hidden from the mobile bar.
// ────────────────────────────────────────────────────────────────
function MobileMenu({
  locale,
  isItemActive,
  onClose,
  onOpenSearch,
}: {
  locale: Locale;
  isItemActive: (href: string) => boolean;
  onClose: () => void;
  onOpenSearch: () => void;
}) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 top-16 z-50 bg-ink/50 md:hidden"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t('nav.menu', locale)}
    >
      <FocusTrap onEscape={onClose}>
        <div
          className="max-h-full overflow-y-auto border-b-4 border-ink bg-cream px-4 py-4"
          onClick={(e) => e.stopPropagation()}
        >
          {NAV_GROUPS.map((g) => (
            <div key={g.key} className="mb-4">
              <div
                className="mb-1.5 px-1 text-[11px] uppercase tracking-[0.2em] text-acc-deep"
                style={{ fontFamily: 'var(--font-pixel-display)' }}
              >
                {t(g.key, locale)}
              </div>
              <ul className="grid grid-cols-2 gap-1.5">
                {g.items.map((it) => {
                  const active = isItemActive(it.href);
                  return (
                    <li key={it.href}>
                      <Link
                        href={it.href}
                        onClick={onClose}
                        className={
                          'block border-2 px-3 py-3 text-[14px] leading-none ' +
                          (active
                            ? 'border-ink bg-acc text-[#1A1612]'
                            : 'border-[#EBE3CA] bg-[#FFFCF4] text-ink hover:bg-acc-soft')
                        }
                      >
                        {t(it.key, locale)}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          {/* Language — global picker, surfaced here for the small
              screens that hide it from the bar. */}
          <div className="mb-4">
            <div
              className="mb-1.5 px-1 text-[11px] uppercase tracking-[0.2em] text-acc-deep"
              style={{ fontFamily: 'var(--font-pixel-display)' }}
            >
              {t('a11y.language', locale)}
            </div>
            <LanguageSwitcher initial={locale} />
          </div>

          {/* Utilities — hidden from the mobile bar, surfaced here. */}
          <div className="flex gap-1.5 pb-[env(safe-area-inset-bottom,0px)]">
            <button
              type="button"
              onClick={onOpenSearch}
              className="flex-1 border-2 border-ink bg-[#FFFCF4] px-3 py-3 text-[14px] font-medium leading-none text-ink hover:bg-acc-soft"
            >
              {t('nav.search_short', locale)}
            </button>
            <Link
              href="/account"
              onClick={onClose}
              className="flex-1 border-2 border-ink bg-ink px-3 py-3 text-center text-[14px] font-medium leading-none text-cream hover:border-acc-deep hover:bg-acc-deep"
            >
              {t('nav.account_btn', locale)}
            </Link>
          </div>
        </div>
      </FocusTrap>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// CommandPalette — fuzzy-search overlay for jumping anywhere.
// Lightweight: no command framework, just substring matching, plus
// keyboard navigation (↑↓ Enter Esc). Items grouped into:
//   Pages         — top-level routes
//   Archetypes    — /archetype/[key]
//   Philosophers  — /philosopher/[slug]   (560 entries; only shown
//                                          when there's a query)
// ────────────────────────────────────────────────────────────────

type PaletteItem = {
  group: 'Pages' | 'Archetypes' | 'Philosophers';
  label: string;
  hint?: string;
  href: string;
};

// Page items are built per-locale (labels + hints run through t()).
// `group` stays an English discriminator used for filtering + as the
// translation-key lookup in ItemList; it is never rendered raw.
function buildPageItems(locale: Locale): PaletteItem[] {
  return [
    // ── Tier 1 — signature surfaces ──
    { group: 'Pages', label: t('palette.home', locale), href: '/' },
    {
      group: 'Pages',
      label: t('nav.quiz_journey', locale),
      href: '/quiz/journey',
      hint: t('palette.h_inheritor', locale),
    },
    {
      group: 'Pages',
      label: t('nav.quiz_classic', locale),
      href: '/quiz?mode=quick',
      hint: t('palette.h_classic', locale),
    },
    {
      group: 'Pages',
      label: t('nav.quiz_detailed', locale),
      href: '/quiz?mode=detailed',
      hint: t('palette.h_detailed', locale),
    },
    {
      group: 'Pages',
      label: t('nav.arena', locale),
      href: '/arena',
      hint: t('palette.h_arena', locale),
    },
    {
      group: 'Pages',
      label: t('palette.arena_pve', locale),
      href: '/arena/pve',
      hint: t('palette.h_arena_pve', locale),
    },
    {
      group: 'Pages',
      label: t('palette.arena_pvp', locale),
      href: '/arena/pvp',
      hint: t('palette.h_arena_pvp', locale),
    },
    { group: 'Pages', label: t('palette.arena_leaderboard', locale), href: '/arena/leaderboard' },
    { group: 'Pages', label: t('palette.arena_history', locale), href: '/arena/history' },
    {
      group: 'Pages',
      label: t('nav.spar', locale),
      href: '/spar',
      hint: t('palette.h_spar', locale),
    },
    {
      group: 'Pages',
      label: t('nav.pilgrimage', locale),
      href: '/pilgrimage',
      hint: t('palette.h_pilgrimage', locale),
    },
    {
      group: 'Pages',
      label: t('nav.crucible', locale),
      href: '/crucible',
      hint: t('palette.h_crucible', locale),
    },
    {
      group: 'Pages',
      label: t('nav.wandering', locale),
      href: '/wandering',
      hint: t('palette.h_wandering', locale),
    },
    {
      group: 'Pages',
      label: t('nav.anthology', locale),
      href: '/anthology',
      hint: t('palette.h_anthology', locale),
    },
    {
      group: 'Pages',
      label: t('nav.argument_diary', locale),
      href: '/argument-diary',
      hint: t('palette.h_argument_diary', locale),
    },
    {
      group: 'Pages',
      label: t('nav.year', locale),
      href: '/year',
      hint: t('palette.h_year', locale),
    },
    {
      group: 'Pages',
      label: t('nav.atlas', locale),
      href: '/atlas',
      hint: t('palette.h_atlas', locale),
    },
    // ── Tier 2 — explore ──
    { group: 'Pages', label: t('nav.archetypes', locale), href: '/archetype' },
    { group: 'Pages', label: t('nav.map', locale), href: '/map', hint: t('palette.h_map', locale) },
    {
      group: 'Pages',
      label: t('palette.browse_phil', locale),
      href: '/philosopher',
      hint: t('palette.h_browse_phil', locale, { count: PHILOSOPHERS.length }),
    },
    { group: 'Pages', label: t('nav.dilemma', locale), href: '/dilemma' },
    { group: 'Pages', label: t('palette.dilemma_archive', locale), href: '/dilemma/archive' },
    {
      group: 'Pages',
      label: t('nav.topics', locale),
      href: '/topic',
      hint: t('palette.h_topics', locale),
    },
    {
      group: 'Pages',
      label: t('nav.matchups', locale),
      href: '/vs',
      hint: t('palette.h_matchups', locale),
    },
    // ── Tier 3 — deepen ──
    { group: 'Pages', label: t('nav.diary', locale), href: '/diary' },
    {
      group: 'Pages',
      label: t('nav.compare', locale),
      href: '/compare',
      hint: t('palette.h_compare', locale),
    },
    { group: 'Pages', label: t('nav.exercises', locale), href: '/exercises' },
    {
      group: 'Pages',
      label: t('nav.debate', locale),
      href: '/debate',
      hint: t('palette.h_debate', locale),
    },
    { group: 'Pages', label: t('nav.search', locale), href: '/search' },
    // ── Tier 4 — also ──
    {
      group: 'Pages',
      label: t('palette.wrapped', locale),
      href: '/wrapped',
      hint: t('palette.h_wrapped', locale),
    },
    {
      group: 'Pages',
      label: t('nav.classes', locale),
      href: '/classes',
      hint: t('palette.h_classes', locale),
    },
    {
      group: 'Pages',
      label: t('home.add_home', locale),
      href: '/install',
      hint: t('palette.h_install', locale),
    },
    { group: 'Pages', label: t('nav.about', locale), href: '/about' },
    { group: 'Pages', label: t('nav.methodology', locale), href: '/methodology' },
    { group: 'Pages', label: t('nav.account_btn', locale), href: '/account' },
    { group: 'Pages', label: t('nav.signin', locale), href: '/login' },
    { group: 'Pages', label: t('nav.signup', locale), href: '/signup' },
  ];
}

function buildArchetypeItems(locale: Locale): PaletteItem[] {
  return ARCHETYPES.map((a) => ({
    group: 'Archetypes' as const,
    label: t(`arch.${a.key}.name`, locale),
    hint: t(`arch.${a.key}.spirit`, locale),
    href: `/archetype/${a.key}`,
  }));
}

// Group discriminator → translation key (rendered header in ItemList).
const PALETTE_GROUP_KEY: Record<PaletteItem['group'], string> = {
  Pages: 'palette.group_pages',
  Archetypes: 'palette.group_archetypes',
  Philosophers: 'palette.group_philosophers',
};

// Build philosopher items lazily — module load cost is negligible
// but searching all 560 substring is fine.
const PHILOSOPHER_ITEMS: PaletteItem[] = PHILOSOPHERS.map((p) => ({
  group: 'Philosophers' as const,
  label: p.name,
  hint: p.dates,
  href: `/philosopher/${p.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')}`,
}));

function CommandPalette({ locale, onClose }: { locale: Locale; onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);

  const items = useMemo<PaletteItem[]>(() => {
    const q = query.trim().toLowerCase();
    const fixedTop = [...buildPageItems(locale), ...buildArchetypeItems(locale)];
    if (!q) return fixedTop.slice(0, 30);
    const matchesQuery = (s: string) => s.toLowerCase().includes(q);
    const filteredFixed = fixedTop.filter(
      (i) => matchesQuery(i.label) || (i.hint ? matchesQuery(i.hint) : false),
    );
    const filteredPhils = PHILOSOPHER_ITEMS.filter((i) => matchesQuery(i.label)).slice(0, 30);
    return [...filteredFixed, ...filteredPhils];
  }, [query, locale]);

  // Reset selection when items change
  useEffect(() => {
    setActiveIdx(0);
  }, [items]);

  function navigate(item: PaletteItem) {
    onClose();
    router.push(item.href);
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = items[activeIdx];
      if (item) navigate(item);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-ink/60 px-4 pt-[12vh]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t('palette.aria', locale)}
    >
      <FocusTrap onEscape={onClose}>
        {/* Pixel dialog box: 4-px ink border, hard amber shadow */}
        <div
          className="w-full max-w-[640px] overflow-hidden border-4 border-ink bg-[#FFFCF4] shadow-[8px_8px_0_0_var(--color-acc-deep)]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Title bar */}
          <div className="flex items-center justify-between border-b-4 border-ink bg-ink px-4 py-2">
            <span
              className="text-[12px] tracking-[0.16em] text-acc-soft"
              style={{ fontFamily: 'var(--font-pixel-display)' }}
            >
              {t('palette.title', locale)}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="text-[14px] text-acc-soft hover:text-acc"
              style={{ fontFamily: 'var(--font-pixel-display)' }}
              aria-label={t('nav.close', locale)}
            >
              X
            </button>
          </div>
          <input
            autoFocus
            type="text"
            placeholder={t('palette.placeholder', locale)}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKey}
            className="w-full border-b-2 border-ink bg-acc-soft px-5 py-3 text-[15px] leading-tight text-ink placeholder:text-acc-deep/70 focus:outline-none"
          />
          <div className="max-h-[60vh] overflow-y-auto bg-[#FFFCF4] p-2">
            {items.length === 0 ? (
              <div className="px-3 py-8 text-center text-[14px] text-acc-deep">
                {t('palette.empty', locale)}
              </div>
            ) : (
              <ItemList
                items={items}
                activeIdx={activeIdx}
                onHover={setActiveIdx}
                onSelect={navigate}
                locale={locale}
              />
            )}
          </div>
          <div className="flex items-center justify-between border-t-2 border-ink bg-ink px-4 py-1.5 text-[12px] leading-none text-acc-soft">
            <span>{t('palette.footer_hint', locale)}</span>
            <span>
              {locale === 'en'
                ? `${items.length} match${items.length === 1 ? '' : 'es'}`
                : t('palette.matches', locale, { count: items.length })}
            </span>
          </div>
        </div>
      </FocusTrap>
    </div>
  );
}

function ItemList({
  items,
  activeIdx,
  onHover,
  onSelect,
  locale,
}: {
  items: PaletteItem[];
  activeIdx: number;
  onHover: (i: number) => void;
  onSelect: (item: PaletteItem) => void;
  locale: Locale;
}) {
  // Render with group headers, but track the absolute index so
  // keyboard nav stays in sync with the rendered list.
  const out: React.ReactNode[] = [];
  let lastGroup: string | null = null;
  items.forEach((item, idx) => {
    if (item.group !== lastGroup) {
      out.push(
        <div
          key={`g-${item.group}`}
          className="mt-2 px-3 pb-1 text-[11px] uppercase tracking-[0.22em] text-acc-deep"
          style={{ fontFamily: 'var(--font-pixel-display)' }}
        >
          {t(PALETTE_GROUP_KEY[item.group as PaletteItem['group']], locale)}
        </div>,
      );
      lastGroup = item.group;
    }
    const isActive = idx === activeIdx;
    out.push(
      <button
        key={`${item.group}-${item.label}-${item.href}`}
        type="button"
        onMouseEnter={() => onHover(idx)}
        onClick={() => onSelect(item)}
        className={
          'flex w-full items-baseline justify-between gap-3 px-3 py-2 text-left text-[14px] leading-none transition-none ' +
          (isActive ? 'bg-acc text-[#1A1612]' : 'text-ink hover:bg-acc-soft')
        }
      >
        <span className="font-medium">
          {isActive ? '▶ ' : '  '}
          {item.label}
        </span>
        {item.hint ? (
          <span
            className={`ml-auto truncate text-[12px] ${isActive ? 'text-[#3A2F18]' : 'text-acc-deep'}`}
          >
            {item.hint}
          </span>
        ) : null}
      </button>,
    );
  });
  return <div>{out}</div>;
}
