// PixelWindow — shared chrome wrapper for any v3 page section.
//
// Reproduces the chunky pixel "dialog box" pattern that's repeated
// across /home, /quiz, /result and now will land on every other
// route too. Two parts:
//
//   <PixelWindow>     - the wrapper (4-px ink border + amber shadow)
//                       with optional title bar + sub-bar
//   <PixelPageHeader> - chunky page-level title block (used at the
//                       top of any restyled route)
//
// Server-component-safe (no client JS). Variants opt into per-page
// archetype color theming via inline CSS vars.

import type { ReactNode } from "react";

type WindowVariant = "cream" | "ink" | "amber";

type WindowProps = {
  children: ReactNode;
  /** Optional title-bar text — shown in Press Start 2P, uppercase. */
  title?: string;
  /** Optional right-aligned text in the title bar (e.g. "▶ STATUS"). */
  badge?: string;
  /** Visual variant. cream = default, ink = dark, amber = warm. */
  variant?: WindowVariant;
  /** Per-archetype tint override. When set, the panel tints itself
   *  with `--accent`/`--accent-deep`/`--accent-soft` from the
   *  archetype palette instead of the variant's default colors. */
  accent?: { primary: string; deep: string; soft: string };
  /** Extra classes on the outer wrapper (margin, max-width, etc). */
  className?: string;
  /** Extra classes on the inner content body. */
  bodyClassName?: string;
  /** If true, no inner padding — for cases where the children
   *  manage their own spacing (forms, embedded canvases). */
  flush?: boolean;
};

export function PixelWindow({
  children,
  title,
  badge,
  variant = "cream",
  accent,
  className,
  bodyClassName,
  flush = false,
}: WindowProps) {
  // Resolve color tokens. accent override wins over variant defaults.
  const tokens = accent
    ? {
        border: accent.deep,
        shadow: accent.deep,
        bg: accent.soft,
        titleBg: accent.deep,
        titleText: accent.soft,
        bodyText: "#221E18",
      }
    : variant === "ink"
      ? {
          border: "#221E18",
          shadow: "#8C6520",
          bg: "#1A1612",
          titleBg: "#221E18",
          titleText: "#F8EDC8",
          bodyText: "#F8EDC8",
        }
      : variant === "amber"
        ? {
            border: "#8C6520",
            shadow: "#8C6520",
            bg: "#F8EDC8",
            titleBg: "#8C6520",
            titleText: "#F8EDC8",
            bodyText: "#221E18",
          }
        : {
            border: "#221E18",
            shadow: "#221E18",
            bg: "#FFFCF4",
            titleBg: "#221E18",
            titleText: "#F8EDC8",
            bodyText: "#221E18",
          };

  return (
    <div
      className={"border-4 " + (className ?? "")}
      style={{
        borderColor: tokens.border,
        background: tokens.bg,
        color: tokens.bodyText,
        boxShadow: `4px 4px 0 0 ${tokens.shadow}`,
      }}
    >
      {title || badge ? (
        <div
          className="flex items-center justify-between border-b-4 px-4 py-2 text-[10px] tracking-[0.22em]"
          style={{
            borderColor: tokens.border,
            background: tokens.titleBg,
            color: tokens.titleText,
            fontFamily: "var(--font-pixel-display)",
          }}
        >
          <span>{title}</span>
          {badge ? <span className="text-[#B8862F]">{badge}</span> : null}
        </div>
      ) : null}
      <div className={(flush ? "" : "px-5 py-5 sm:px-7 sm:py-6 ") + (bodyClassName ?? "")}>
        {children}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// PixelPageHeader — chunky top-of-page header used on restyled
// routes. Eyebrow (Press Start 2P 10-12px) → big H1 (Press Start
// 2P 24-44px with hard shadow) → optional subtitle (sans body).
// Sized conservatively (per the polish pass) so even long titles
// like "TODAY'S DILEMMA" or "PHILOSOPHER LIBRARY" stay inside the
// page column on mobile.
// ────────────────────────────────────────────────────────────────
type HeaderProps = {
  /** Small uppercase label above the title (e.g. "▶ ARCHETYPE", "▶ PHILOSOPHER"). */
  eyebrow?: string;
  /** Page title in pixel display. */
  title: string;
  /** Optional sans-body subtitle paragraph. */
  subtitle?: ReactNode;
  /** Optional accent override (per-archetype theming). */
  accent?: { primary: string; deep: string; soft: string };
};

export function PixelPageHeader({ eyebrow, title, subtitle, accent }: HeaderProps) {
  const accentColor = accent?.deep ?? "#8C6520";
  const shadowColor = accent?.primary ?? "#B8862F";
  return (
    <header className="mb-10 sm:mb-14">
      {eyebrow ? (
        <div
          className="flex items-center gap-3 text-[10px] tracking-[0.24em]"
          style={{ color: accentColor, fontFamily: "var(--font-pixel-display)" }}
        >
          <span aria-hidden className="inline-block h-2 w-2" style={{ background: shadowColor }} />
          {eyebrow}
        </div>
      ) : null}
      <h1
        className="mt-5 pr-2 text-[26px] leading-[1.08] tracking-[0.04em] text-[#221E18] sm:text-[36px] md:text-[44px]"
        style={{ fontFamily: "var(--font-pixel-display)" }}
      >
        <span style={{ textShadow: `3px 3px 0 ${shadowColor}` }}>{title}</span>
      </h1>
      {subtitle ? (
        <div className="mt-5 max-w-[680px] text-[15px] leading-[1.6] text-[#4A4338] sm:text-[16px]">
          {subtitle}
        </div>
      ) : null}
    </header>
  );
}
