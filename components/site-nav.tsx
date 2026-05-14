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
      <nav className="sticky top-0 z-40 border-b border-[#EBE3CA] bg-[#FAF6EC]/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between gap-6 px-4 sm:px-8">
          {/* Wordmark */}
          <Link
            href="/"
            className="font-display text-[22px] italic text-[#221E18] hover:text-[#8C6520]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Mull
          </Link>

          {/* Center links — hidden on the smallest viewports; the
              palette is the fallback there */}
          <ul className="hidden items-center gap-7 md:flex">
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
                      "text-[13px] transition-colors " +
                      (active
                        ? "font-medium text-[#221E18]"
                        : "text-[#4A4338] hover:text-[#221E18]")
                    }
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Cmd-K trigger + sign-in */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="hidden items-center gap-2 rounded-full border border-[#D6CDB6] bg-[#FFFCF4] px-3 py-1.5 text-[12px] text-[#4A4338] hover:border-[#8C6520] hover:text-[#221E18] sm:inline-flex"
              aria-label="Open command palette"
            >
              <span>Search</span>
              <kbd className="rounded bg-[#EBE3CA] px-1.5 py-0.5 font-mono text-[10px] text-[#8C6520]">
                {isMac ? "⌘K" : "Ctrl K"}
              </kbd>
            </button>
            <Link
              href="/account"
              className="rounded-full bg-[#221E18] px-4 py-1.5 text-[13px] font-medium text-[#FAF6EC] hover:bg-[#8C6520]"
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
      className="fixed inset-0 z-50 flex items-start justify-center bg-[#221E18]/40 px-4 pt-[12vh] backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[640px] overflow-hidden rounded-2xl border border-[#D6CDB6] bg-[#FFFCF4] shadow-[0_30px_80px_rgba(34,30,24,0.3)]"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          autoFocus
          type="text"
          placeholder="Search pages, archetypes, philosophers…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKey}
          className="w-full border-b border-[#EBE3CA] bg-transparent px-5 py-4 text-[16px] text-[#221E18] placeholder:text-[#8C6520]/60 focus:outline-none"
        />
        <div className="max-h-[60vh] overflow-y-auto p-2">
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
        <div className="flex items-center justify-between border-t border-[#EBE3CA] bg-[#FAF6EC] px-4 py-2 text-[11px] text-[#8C6520]">
          <span>↑↓ navigate · ↵ open · esc close</span>
          <span>{items.length} match{items.length === 1 ? "" : "es"}</span>
        </div>
      </div>
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
          className="mt-2 px-3 pb-1 text-[10px] uppercase tracking-[0.22em] text-[#8C6520]"
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
          "flex w-full items-baseline justify-between gap-3 rounded-md px-3 py-2 text-left transition-colors " +
          (isActive
            ? "bg-[#F8EDC8] text-[#221E18]"
            : "text-[#221E18] hover:bg-[#F1EAD8]")
        }
      >
        <span className="text-[14px]">{item.label}</span>
        {item.hint ? (
          <span className="ml-auto truncate text-[12px] text-[#8C6520]">
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
