"use client";

// SiteNav — slim sticky top navigation. Always visible, scrolls with
// the page. Wordmark on the left, nav links in the center, Cmd-K
// search on the right. Opens a command palette overlay on Cmd-K (or
// Ctrl-K on non-Mac) for fuzzy-jumping to any of the ~40 routes
// without scrolling to a footer.
//
// Replaces the per-page slim headers in the v2 redesign so navigation
// is consistent and "where am I" is always one glance away.

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ARCHETYPES } from "@/lib/archetypes";
import { PHILOSOPHERS } from "@/lib/philosophers";
import FocusTrap from "./focus-trap";

// Routes pinned to the top nav. Anything else lives in the command
// palette under "Pages" or "Philosophers".
const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/archetype", label: "Archetypes" },
  { href: "/dilemma", label: "Today's dilemma" },
  { href: "/diary", label: "Diary" },
  { href: "/exercises", label: "Exercises" },
  { href: "/about", label: "About" },
] as const;

export function SiteNav() {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);

  // Cmd-K / Ctrl-K opens the palette. Escape closes.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isPaletteShortcut =
        (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";
      if (isPaletteShortcut) {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const isMac =
    typeof navigator !== "undefined" &&
    /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform || navigator.userAgent);

  return (
    <>
      {/* Pixel-game top nav — chunky 4px ink border on the bottom,
          flat cream surface, no rounded corners, no smooth shadows.
          Reads as the title bar of an 8-bit window. */}
      <nav className="sticky top-0 z-40 border-b-4 border-[#221E18] bg-[#FAF6EC]">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-6 px-4 sm:px-8">
          {/* Wordmark — Press Start 2P pixel typeface */}
          <Link
            href="/"
            className="flex items-center gap-2.5 hover:text-[#8C6520]"
          >
            {/* Tiny pixel-art "M" tile */}
            <span
              aria-hidden
              className="inline-block h-4 w-4 bg-[#221E18]"
              style={{
                backgroundImage:
                  "linear-gradient(45deg, #B8862F 25%, transparent 25%, transparent 75%, #B8862F 75%), linear-gradient(45deg, #B8862F 25%, transparent 25%, transparent 75%, #B8862F 75%)",
                backgroundSize: "8px 8px",
                backgroundPosition: "0 0, 4px 4px",
              }}
            />
            <span
              className="text-[14px] tracking-[0.12em] text-[#221E18]"
              style={{ fontFamily: "var(--font-pixel-display)" }}
            >
              MULL
            </span>
          </Link>

          {/* Center links — VT323 pixel font, hidden on small */}
          <ul className="hidden items-center gap-5 md:flex">
            {NAV_LINKS.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname === link.href ||
                    pathname.startsWith(link.href + "/");
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={
                      "text-[14px] font-medium leading-none transition-colors " +
                      (active
                        ? "text-[#221E18] underline decoration-[3px] decoration-[#B8862F] underline-offset-[6px]"
                        : "text-[#4A4338] hover:text-[#221E18]")
                    }
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Cmd-K trigger + Account button */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="hidden items-center gap-2 border-2 border-[#221E18] bg-[#FFFCF4] px-3 py-1.5 text-[13px] font-medium leading-none text-[#221E18] hover:bg-[#F8EDC8] sm:inline-flex"
              aria-label="Open command palette"
            >
              <span>Search</span>
              <kbd className="pixel-kbd">
                {isMac ? "⌘K" : "^K"}
              </kbd>
            </button>
            <Link
              href="/account"
              className="border-2 border-[#221E18] bg-[#221E18] px-3.5 py-1.5 text-[13px] font-medium leading-none text-[#FAF6EC] hover:bg-[#8C6520] hover:border-[#8C6520]"
            >
              Account
            </Link>
          </div>
        </div>
      </nav>

      {open ? <CommandPalette onClose={() => setOpen(false)} /> : null}
    </>
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
  { group: "Pages", label: "Home", href: "/" },
  { group: "Pages", label: "Take the quiz", href: "/quiz?mode=quick", hint: "20 questions" },
  { group: "Pages", label: "Detailed quiz", href: "/quiz?mode=detailed", hint: "50 questions" },
  { group: "Pages", label: "Today's dilemma", href: "/dilemma" },
  { group: "Pages", label: "Dilemma archive", href: "/dilemma/archive" },
  { group: "Pages", label: "Diary", href: "/diary" },
  { group: "Pages", label: "Exercises", href: "/exercises" },
  { group: "Pages", label: "Simulated debate", href: "/debate" },
  { group: "Pages", label: "Search minds", href: "/search" },
  { group: "Pages", label: "Compare", href: "/compare" },
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
