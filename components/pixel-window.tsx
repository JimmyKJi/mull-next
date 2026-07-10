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

import type { ReactNode } from 'react';

type WindowVariant = 'cream' | 'ink' | 'amber';

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
  variant = 'cream',
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
        bodyText: 'var(--color-ink)',
      }
    : variant === 'ink'
      ? {
          border: 'var(--color-ink)',
          shadow: 'var(--color-acc-deep)',
          bg: '#1A1612',
          titleBg: 'var(--color-ink)',
          titleText: 'var(--color-acc-soft)',
          bodyText: 'var(--color-acc-soft)',
        }
      : variant === 'amber'
        ? {
            border: 'var(--color-acc-deep)',
            shadow: 'var(--color-acc-deep)',
            bg: 'var(--color-acc-soft)',
            titleBg: 'var(--color-acc-deep)',
            titleText: 'var(--color-acc-soft)',
            bodyText: 'var(--color-ink)',
          }
        : {
            border: 'var(--color-ink)',
            shadow: 'var(--color-ink)',
            bg: '#FFFCF4',
            titleBg: 'var(--color-ink)',
            titleText: 'var(--color-acc-soft)',
            bodyText: 'var(--color-ink)',
          };

  return (
    <div
      className={'border-4 ' + (className ?? '')}
      style={{
        borderColor: tokens.border,
        background: tokens.bg,
        color: tokens.bodyText,
        boxShadow: `4px 4px 0 0 ${tokens.shadow}`,
      }}
    >
      {title || badge ? (
        <div
          className="flex items-center justify-between gap-3 border-b-4 px-4 py-2 text-[10px] leading-[1.3] tracking-[0.22em]"
          style={{
            borderColor: tokens.border,
            background: tokens.titleBg,
            color: tokens.titleText,
            fontFamily: 'var(--font-pixel-display)',
          }}
        >
          {/* Title wraps freely; badges are decorative filename chips
              ("PHILOSOPHER_PROFILE.MD") that must never force the page
              wider than the viewport — on narrow screens they ellipsize
              instead (a shrink-0 here once pushed /philosopher/[slug]
              to 483px on a 375px phone). */}
          <span>{title}</span>
          {badge ? <span className="min-w-0 truncate text-acc">{badge}</span> : null}
        </div>
      ) : null}
      <div className={(flush ? '' : 'px-5 py-5 sm:px-7 sm:py-6 ') + (bodyClassName ?? '')}>
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
  const accentColor = accent?.deep ?? 'var(--color-acc-deep)';
  const shadowColor = accent?.primary ?? 'var(--color-acc)';
  return (
    <header className="mb-10 sm:mb-14">
      {eyebrow ? (
        <div
          className="flex items-center gap-3 text-[10px] tracking-[0.24em]"
          style={{ color: accentColor, fontFamily: 'var(--font-pixel-display)' }}
        >
          <span aria-hidden className="inline-block h-2 w-2" style={{ background: shadowColor }} />
          {eyebrow}
        </div>
      ) : null}
      {/* Title uses clamp() so very narrow viewports (<360px, e.g.
          iPhone SE / Android compact) drop to 16px before the pixel
          font starts wrapping awkwardly on long titles like
          "PHILOSOPHER VS PHILOSOPHER". The Tailwind classes still
          set the upper breakpoints (sm/md) so wider screens keep the
          chunkier 32px / 44px the design intends. */}
      <h1
        className="mull-pixel-title mt-5 pr-2 leading-[1.45] tracking-[0.04em] text-ink sm:text-[32px] md:text-[44px]"
        style={{ fontFamily: 'var(--font-pixel-display)' }}
      >
        <span
          className="mull-pixel-title-shadow"
          style={{ ['--mull-shadow-color' as string]: shadowColor } as React.CSSProperties}
        >
          {title}
        </span>
      </h1>
      <style>{`
        .mull-pixel-title { font-size: 20px; }
        .mull-pixel-title-shadow { text-shadow: 3px 3px 0 var(--mull-shadow-color); }
        @media (max-width: 360px) {
          .mull-pixel-title { font-size: 16px; letter-spacing: 0.02em; }
          .mull-pixel-title-shadow { text-shadow: 2px 2px 0 var(--mull-shadow-color); }
        }
      `}</style>
      {subtitle ? (
        <div className="mt-5 max-w-[680px] text-[15px] leading-[1.6] text-ink-soft sm:text-[16px]">
          {subtitle}
        </div>
      ) : null}
    </header>
  );
}
