// Hero — version banner pill + H1 + lede. Server component;
// translations resolve at request time via getServerLocale.
//
// Visual: editorial-rag-right H1 in Cormorant italic, generous
// leading. The H1 + lede + DailyWisdom (sibling component) share a
// 640px column so they all hit the same rag-right edge — see the
// AGENTS.md invariant about the homepage rag.

import type { Locale } from "@/lib/translations";
import { t } from "@/lib/translations";

export default function Hero({ locale }: { locale: Locale }) {
  return (
    <header className="max-w-[640px]">
      {/* Version pill — small, restrained */}
      <div
        className="inline-flex items-center gap-2 rounded-full border border-[var(--color-line,#D6CDB6)] bg-[var(--color-cream-2,#F1EAD8)] px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-[var(--color-ink-soft,#4A4338)]"
        // The version banner string contains <strong>; trust the i18n
        // entry (author-curated) and render as inline HTML.
        dangerouslySetInnerHTML={{ __html: t("home.version_banner", locale) }}
      />

      {/* H1 — Cormorant italic for the emphasis span. The hero_h1 i18n
          string contains the <em>...</em> markup; render as HTML so the
          translated <em> tags work. */}
      <h1
        className="mt-8 font-display text-[40px] leading-[1.05] text-[var(--color-ink,#221E18)] sm:text-[52px] md:text-[60px] [&_em]:not-italic [&_em]:text-[var(--color-acc-deep,#8C6520)]"
        style={{ fontFamily: "var(--font-display)" }}
        dangerouslySetInnerHTML={{ __html: dressUpHeroEm(t("home.hero_h1", locale)) }}
      />

      <p className="mt-6 text-[18px] leading-relaxed text-[var(--color-ink-soft,#4A4338)] sm:text-[19px]">
        {t("home.hero_lede", locale)}
      </p>
    </header>
  );
}

// The translated `home.hero_h1` strings wrap the emphasis phrase in
// <em>...</em>. We want the emphasis rendered as italic Cormorant in
// the accent color rather than plain italic — easiest to do is to
// re-inject an `italic` class on the em tags client-side via this
// transform (or, equivalently, target with `[&_em]` Tailwind selector).
// We're using the [&_em] selector above, so this transform is a no-op
// for now — kept as a hook for future per-locale dressing (e.g.
// adding a no-break attribute to the emphasis phrase in zh/ja).
function dressUpHeroEm(html: string): string {
  return html;
}
