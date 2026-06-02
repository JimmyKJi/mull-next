"use client";

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

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ARCHETYPES } from "@/lib/archetypes";
import { PHILOSOPHERS } from "@/lib/philosophers";
import { t, type Locale } from "@/lib/translations";
import FocusTrap from "./focus-trap";
import { MullMark } from "./mull-mark";

// Umbrella groups. `key` is a translation key (nav.group.*); each item's
// `key` is a nav.* translation key. Order follows the funnel: assess →
// return daily → train → browse → meta. Every substantive route lives in
// exactly one group, so nothing is orphaned to the palette alone.
type NavItem = { href: string; key: string };
type NavGroup = { key: string; items: NavItem[] };

const NAV_GROUPS: NavGroup[] = [
  {
    key: "nav.group.quiz",
    items: [
      { href: "/quiz/journey", key: "nav.quiz_journey" },
      { href: "/quiz?mode=quick", key: "nav.quiz_classic" },
      { href: "/quiz?mode=detailed", key: "nav.quiz_detailed" },
      { href: "/result", key: "nav.result" },
    ],
  },
  {
    key: "nav.group.daily",
    items: [
      { href: "/spar", key: "nav.spar" },
      { href: "/dilemma", key: "nav.dilemma" },
      { href: "/diary", key: "nav.diary" },
      { href: "/crucible", key: "nav.crucible" },
      { href: "/wandering", key: "nav.wandering" },
      { href: "/year", key: "nav.year" },
    ],
  },
  {
    key: "nav.group.practice",
    items: [
      { href: "/exercises", key: "nav.exercises" },
      { href: "/arena", key: "nav.arena" },
      { href: "/pilgrimage", key: "nav.pilgrimage" },
      { href: "/argument-diary", key: "nav.argument_diary" },
      { href: "/debate", key: "nav.debate" },
    ],
  },
  {
    key: "nav.group.explore",
    items: [
      { href: "/map", key: "nav.map" },
      { href: "/atlas", key: "nav.atlas" },
      { href: "/archetype", key: "nav.archetypes" },
      { href: "/philosopher", key: "nav.philosophers" },
      { href: "/topic", key: "nav.topics" },
      { href: "/vs", key: "nav.matchups" },
      { href: "/compare", key: "nav.compare" },
      { href: "/anthology", key: "nav.anthology" },
    ],
  },
  {
    key: "nav.group.about",
    items: [
      { href: "/about", key: "nav.about" },
      { href: "/methodology", key: "nav.methodology" },
      { href: "/classes", key: "nav.classes" },
      { href: "/install", key: "nav.install" },
    ],
  },
];

// Routes that render inside a third-party iframe (or otherwise want a
// chromeless full-bleed experience). The nav is suppressed on these
// paths so the embed isn't cropped by it. Keep this list in sync with
// the comparable HIDDEN_PREFIXES in components/feedback-button.tsx.
const CHROMELESS_PREFIXES = ['/badge', '/share', '/wrapped', '/embed'];

export function SiteNav({ locale = "en" }: { locale?: Locale }) {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false); // command palette
  const [openGroup, setOpenGroup] = useState<string | null>(null); // desktop dropdown
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const chromeless = CHROMELESS_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );

  // Cmd-K / Ctrl-K toggles the palette; Escape closes whatever is open.
  // NB: every hook runs unconditionally — BEFORE the chromeless early
  // return below — so hook order stays stable when navigating between a
  // chromeless and a normal route (the old code returned null between
  // two hooks, which violated the rules of hooks).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isPaletteShortcut =
        (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";
      if (isPaletteShortcut) {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape") {
        setOpen(false);
        setOpenGroup(null);
        setMobileOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Close any open menu when the route changes (a link was followed).
  useEffect(() => {
    setOpenGroup(null);
    setMobileOpen(false);
  }, [pathname]);

  if (chromeless) return null;

  const isMac =
    typeof navigator !== "undefined" &&
    /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform || navigator.userAgent);

  function isItemActive(href: string) {
    const base = href.split("?")[0];
    if (base === "/") return pathname === "/";
    return pathname === base || pathname.startsWith(base + "/");
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
      <nav className="sticky top-0 z-40 border-b-4 border-[#221E18] bg-[#FAF6EC]">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-8">
          {/* Wordmark → home */}
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2.5 hover:text-[#8C6520]"
          >
            <span className="slow-bob inline-block">
              <MullMark size={22} />
            </span>
            <span
              className="text-[14px] tracking-[0.12em] text-[#221E18]"
              style={{ fontFamily: "var(--font-pixel-display)" }}
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
                      "flex items-center gap-1.5 px-2.5 py-1.5 text-[14px] font-medium leading-none transition-colors " +
                      (active || expanded
                        ? "text-[#221E18]"
                        : "text-[#4A4338] hover:text-[#221E18]")
                    }
                  >
                    <span
                      className={
                        active
                          ? "underline decoration-[3px] decoration-[#B8862F] underline-offset-[6px]"
                          : ""
                      }
                    >
                      {t(g.key, locale)}
                    </span>
                    <span aria-hidden className="text-[8px] leading-none opacity-70">
                      {expanded ? "▲" : "▼"}
                    </span>
                  </button>

                  {expanded ? (
                    <div
                      role="menu"
                      aria-label={t(g.key, locale)}
                      className="absolute left-0 top-full z-50 mt-[6px] min-w-[210px] border-4 border-[#221E18] bg-[#FFFCF4] p-1.5 shadow-[6px_6px_0_0_#8C6520]"
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
                                  "block whitespace-nowrap px-3 py-2 text-[14px] leading-none transition-none " +
                                  (itActive
                                    ? "bg-[#B8862F] text-[#1A1612]"
                                    : "text-[#221E18] hover:bg-[#F8EDC8]")
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

          {/* Right cluster — search, account, and (mobile) the menu toggle */}
          <div className="flex shrink-0 items-center gap-2.5">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="hidden items-center gap-2 border-2 border-[#221E18] bg-[#FFFCF4] px-3 py-1.5 text-[13px] font-medium leading-none text-[#221E18] hover:bg-[#F8EDC8] sm:inline-flex"
              aria-label={t("nav.search_short", locale)}
            >
              <span>{t("nav.search_short", locale)}</span>
              <kbd className="pixel-kbd">{isMac ? "⌘K" : "^K"}</kbd>
            </button>
            <Link
              href="/account"
              className="hidden border-2 border-[#221E18] bg-[#221E18] px-3.5 py-1.5 text-[13px] font-medium leading-none text-[#FAF6EC] hover:border-[#8C6520] hover:bg-[#8C6520] sm:inline-block"
            >
              {t("nav.account_btn", locale)}
            </Link>
            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-haspopup="true"
              aria-expanded={mobileOpen}
              aria-label={t("nav.menu", locale)}
              className="inline-flex items-center gap-1.5 border-2 border-[#221E18] bg-[#FFFCF4] px-2.5 py-1.5 text-[12px] font-medium leading-none text-[#221E18] hover:bg-[#F8EDC8] md:hidden"
              style={{ fontFamily: "var(--font-pixel-display)" }}
            >
              <span aria-hidden>{mobileOpen ? "✕" : "☰"}</span>
              <span>{t("nav.menu", locale)}</span>
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
        aria-label="Open command palette"
        className="pixel-press fixed right-[18px] z-[60] flex h-12 w-12 items-center justify-center border-4 border-[#221E18] bg-[#221E18] text-[#FAF6EC] shadow-[3px_3px_0_0_#B8862F] sm:hidden"
        style={{
          bottom: 'calc(18px + env(safe-area-inset-bottom, 0px))',
          fontFamily: "var(--font-pixel-display)",
          fontSize: 14,
          letterSpacing: 0,
          transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end)',
        }}
      >
        ⌘K
      </button>

      {open ? <CommandPalette onClose={() => setOpen(false)} /> : null}
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
      className="fixed inset-x-0 bottom-0 top-16 z-50 bg-[#221E18]/50 md:hidden"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t("nav.menu", locale)}
    >
      <FocusTrap onEscape={onClose}>
        <div
          className="max-h-full overflow-y-auto border-b-4 border-[#221E18] bg-[#FAF6EC] px-4 py-4"
          onClick={(e) => e.stopPropagation()}
        >
          {NAV_GROUPS.map((g) => (
            <div key={g.key} className="mb-4">
              <div
                className="mb-1.5 px-1 text-[11px] uppercase tracking-[0.2em] text-[#8C6520]"
                style={{ fontFamily: "var(--font-pixel-display)" }}
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
                          "block border-2 px-3 py-2.5 text-[14px] leading-none " +
                          (active
                            ? "border-[#221E18] bg-[#B8862F] text-[#1A1612]"
                            : "border-[#EBE3CA] bg-[#FFFCF4] text-[#221E18] hover:bg-[#F8EDC8]")
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

          {/* Utilities — hidden from the mobile bar, surfaced here. */}
          <div className="flex gap-1.5 pb-[env(safe-area-inset-bottom,0px)]">
            <button
              type="button"
              onClick={onOpenSearch}
              className="flex-1 border-2 border-[#221E18] bg-[#FFFCF4] px-3 py-2.5 text-[14px] font-medium leading-none text-[#221E18] hover:bg-[#F8EDC8]"
            >
              {t("nav.search_short", locale)}
            </button>
            <Link
              href="/account"
              onClick={onClose}
              className="flex-1 border-2 border-[#221E18] bg-[#221E18] px-3 py-2.5 text-center text-[14px] font-medium leading-none text-[#FAF6EC] hover:border-[#8C6520] hover:bg-[#8C6520]"
            >
              {t("nav.account_btn", locale)}
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
  group: "Pages" | "Archetypes" | "Philosophers";
  label: string;
  hint?: string;
  href: string;
};

const PAGE_ITEMS: PaletteItem[] = [
  // ── Tier 1 — signature surfaces ──
  { group: "Pages", label: "Home", href: "/" },
  { group: "Pages", label: "The Inheritor (narrative quiz)", href: "/quiz/journey", hint: "~15 min" },
  { group: "Pages", label: "Take the classic quiz", href: "/quiz?mode=quick", hint: "20 questions, ~5 min" },
  { group: "Pages", label: "Detailed quiz", href: "/quiz?mode=detailed", hint: "50 questions, ~15 min" },
  { group: "Pages", label: "Arena", href: "/arena", hint: "argue a philosopher" },
  { group: "Pages", label: "Arena · PvE", href: "/arena/pve", hint: "face a philosopher" },
  { group: "Pages", label: "Arena · PvP", href: "/arena/pvp", hint: "vs another human" },
  { group: "Pages", label: "Arena · Leaderboard", href: "/arena/leaderboard" },
  { group: "Pages", label: "Arena · Your match history", href: "/arena/history" },
  { group: "Pages", label: "Daily Spar", href: "/spar", hint: "one turn, one judge, 5 min" },
  { group: "Pages", label: "The Pilgrimage", href: "/pilgrimage", hint: "30-day archetype-personalized course" },
  { group: "Pages", label: "The Crucible", href: "/crucible", hint: "daily real-life action commitment" },
  { group: "Pages", label: "The Wandering Question", href: "/wandering", hint: "a question across the week" },
  { group: "Pages", label: "Personal Anthology", href: "/anthology", hint: "your commonplace book" },
  { group: "Pages", label: "Argument Diary", href: "/argument-diary", hint: "log real arguments, get fallacy spotting" },
  { group: "Pages", label: "Year-in-View", href: "/year", hint: "your year, always updating" },
  { group: "Pages", label: "Capability Atlas", href: "/atlas", hint: "your six skills + level" },
  // ── Tier 2 — explore ──
  { group: "Pages", label: "Archetypes", href: "/archetype" },
  { group: "Pages", label: "The constellation map", href: "/map", hint: "interactive philosophical space" },
  { group: "Pages", label: "Browse philosophers alphabetically", href: "/philosopher", hint: "560 thinkers, grouped by archetype" },
  { group: "Pages", label: "Today's dilemma", href: "/dilemma" },
  { group: "Pages", label: "Dilemma archive", href: "/dilemma/archive" },
  { group: "Pages", label: "Topic explainers", href: "/topic", hint: "12 evergreen primers" },
  { group: "Pages", label: "Philosopher matchups", href: "/vs", hint: "head-to-head comparisons" },
  // ── Tier 3 — deepen ──
  { group: "Pages", label: "Diary", href: "/diary" },
  { group: "Pages", label: "Compare", href: "/compare", hint: "stack two thinkers" },
  { group: "Pages", label: "Exercises", href: "/exercises" },
  { group: "Pages", label: "Simulated debate", href: "/debate", hint: "watch two philosophers argue" },
  { group: "Pages", label: "Search minds", href: "/search" },
  // ── Tier 4 — also ──
  { group: "Pages", label: "Mull Wrapped", href: "/wrapped", hint: "year in review" },
  { group: "Pages", label: "Classes", href: "/classes", hint: "for educators" },
  { group: "Pages", label: "Add to home screen", href: "/install", hint: "iOS + Android install guide" },
  { group: "Pages", label: "About", href: "/about" },
  { group: "Pages", label: "Methodology", href: "/methodology" },
  { group: "Pages", label: "Account", href: "/account" },
  { group: "Pages", label: "Sign in", href: "/login" },
  { group: "Pages", label: "Sign up", href: "/signup" },
];

const ARCHETYPE_ITEMS: PaletteItem[] = ARCHETYPES.map((a) => ({
  group: "Archetypes" as const,
  label: `The ${capitalize(a.key)}`,
  hint: a.spirit,
  href: `/archetype/${a.key}`,
}));

// Build philosopher items lazily — module load cost is negligible
// but searching all 560 substring is fine.
const PHILOSOPHER_ITEMS: PaletteItem[] = PHILOSOPHERS.map((p) => ({
  group: "Philosophers" as const,
  label: p.name,
  hint: p.dates,
  href: `/philosopher/${p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
}));

function CommandPalette({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);

  const items = useMemo<PaletteItem[]>(() => {
    const q = query.trim().toLowerCase();
    const fixedTop = [...PAGE_ITEMS, ...ARCHETYPE_ITEMS];
    if (!q) return fixedTop.slice(0, 30);
    const matchesQuery = (s: string) => s.toLowerCase().includes(q);
    const filteredFixed = fixedTop.filter(
      (i) => matchesQuery(i.label) || (i.hint ? matchesQuery(i.hint) : false),
    );
    const filteredPhils = PHILOSOPHER_ITEMS.filter((i) =>
      matchesQuery(i.label),
    ).slice(0, 30);
    return [...filteredFixed, ...filteredPhils];
  }, [query]);

  // Reset selection when items change
  useEffect(() => {
    setActiveIdx(0);
  }, [items]);

  function navigate(item: PaletteItem) {
    onClose();
    router.push(item.href);
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = items[activeIdx];
      if (item) navigate(item);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-[#221E18]/60 px-4 pt-[12vh]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Quick travel command palette"
    >
      <FocusTrap onEscape={onClose}>
      {/* Pixel dialog box: 4-px ink border, hard amber shadow */}
      <div
        className="w-full max-w-[640px] overflow-hidden border-4 border-[#221E18] bg-[#FFFCF4] shadow-[8px_8px_0_0_#8C6520]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title bar */}
        <div className="flex items-center justify-between border-b-4 border-[#221E18] bg-[#221E18] px-4 py-2">
          <span
            className="text-[12px] tracking-[0.16em] text-[#F8EDC8]"
            style={{ fontFamily: "var(--font-pixel-display)" }}
          >
            QUICK TRAVEL
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-[14px] text-[#F8EDC8] hover:text-[#B8862F]"
            style={{ fontFamily: "var(--font-pixel-display)" }}
            aria-label="Close"
          >
            X
          </button>
        </div>
        <input
          autoFocus
          type="text"
          placeholder="Search pages, archetypes, philosophers…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKey}
          className="w-full border-b-2 border-[#221E18] bg-[#F8EDC8] px-5 py-3 text-[15px] leading-tight text-[#221E18] placeholder:text-[#8C6520]/70 focus:outline-none"
        />
        <div className="max-h-[60vh] overflow-y-auto bg-[#FFFCF4] p-2">
          {items.length === 0 ? (
            <div className="px-3 py-8 text-center text-[14px] text-[#8C6520]">
              No matches. Try a different search.
            </div>
          ) : (
            <ItemList
              items={items}
              activeIdx={activeIdx}
              onHover={setActiveIdx}
              onSelect={navigate}
            />
          )}
        </div>
        <div className="flex items-center justify-between border-t-2 border-[#221E18] bg-[#221E18] px-4 py-1.5 text-[12px] leading-none text-[#F8EDC8]">
          <span>↑↓ navigate · ↵ open · esc close</span>
          <span>{items.length} match{items.length === 1 ? "" : "es"}</span>
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
}: {
  items: PaletteItem[];
  activeIdx: number;
  onHover: (i: number) => void;
  onSelect: (item: PaletteItem) => void;
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
          className="mt-2 px-3 pb-1 text-[11px] uppercase tracking-[0.22em] text-[#8C6520]"
          style={{ fontFamily: "var(--font-pixel-display)" }}
        >
          {item.group}
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
          "flex w-full items-baseline justify-between gap-3 px-3 py-2 text-left text-[14px] leading-none transition-none " +
          (isActive
            ? "bg-[#B8862F] text-[#1A1612]"
            : "text-[#221E18] hover:bg-[#F8EDC8]")
        }
      >
        <span className="font-medium">{isActive ? "▶ " : "  "}{item.label}</span>
        {item.hint ? (
          <span className={`ml-auto truncate text-[12px] ${isActive ? "text-[#3A2F18]" : "text-[#8C6520]"}`}>
            {item.hint}
          </span>
        ) : null}
      </button>,
    );
  });
  return <div>{out}</div>;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
