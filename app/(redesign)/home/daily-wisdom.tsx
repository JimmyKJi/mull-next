// DailyWisdom — server component that renders today's deterministic
// philosopher quote. Picks via lib/daily-wisdom.ts so the quote ships
// in the initial HTML (no flash, indexable, instant paint).
//
// Visual: small "Today's thinker" eyebrow, italic Cormorant quote,
// philosopher attribution. Aligns flush-left with the H1 + lede so
// the rag-right edge invariant holds (see AGENTS.md).

import { getDailyWisdom } from "@/lib/daily-wisdom";
import { getServerLocale } from "@/lib/locale-server";
import { t } from "@/lib/translations";

// We don't have a translated "Today's thinker" eyebrow string in the
// existing translations table; fall back to English for non-en locales
// here and add the key to translations.ts in a later i18n pass. Keeping
// the rest of the page i18n-clean is more important than blocking on
// this one label.
const EYEBROW: Record<string, string> = {
  en: "Today's thinker",
  es: "Pensador de hoy",
  fr: "Penseur du jour",
  pt: "Pensador de hoje",
  ru: "Мыслитель дня",
  zh: "今日思想家",
  ja: "今日の思想家",
  ko: "오늘의 사상가",
};

export default async function DailyWisdom() {
  const locale = await getServerLocale();
  const { philosopher } = getDailyWisdom();

  const eyebrow = EYEBROW[locale] ?? EYEBROW.en;
  // The keyIdea is English-only by design (philosophical content
  // policy — see AGENTS.md). All other locales fall back to it.
  void t;

  return (
    <section
      className="mt-10 max-w-[640px]"
      aria-label="Daily wisdom"
    >
      <div className="text-[11px] uppercase tracking-[0.2em] text-[var(--color-ink-soft,#4A4338)] opacity-65">
        {eyebrow}
      </div>
      <p
        className="mt-3 font-display text-[22px] leading-snug text-[var(--color-ink,#221E18)] sm:text-[24px]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        <em>&ldquo;{philosopher.keyIdea}&rdquo;</em>
      </p>
      <div className="mt-2 text-[13px] text-[var(--color-ink-soft,#4A4338)]">
        — {philosopher.name}
        {philosopher.dates ? `, ${philosopher.dates}` : ""}
      </div>
    </section>
  );
}
