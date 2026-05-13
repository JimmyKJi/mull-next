// DailyWisdom — today's deterministic philosopher quote.
//
// V2: bolder. The quote is larger (24 → 32px on desktop) and lives
// inside a thin-bordered accent rail that visually anchors it on
// the page. The attribution is its own line with a small accent dot
// so the eye finds it without scanning.
//
// Server component — quote ships in the initial HTML, indexed by
// crawlers, no flash on hydrate.

import { getDailyWisdom } from "@/lib/daily-wisdom";
import { getServerLocale } from "@/lib/locale-server";

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

  return (
    <section
      className="mt-16 max-w-[720px]"
      aria-label="Daily wisdom"
    >
      <div className="border-l-2 border-[var(--color-acc-deep,#8C6520)]/40 pl-5">
        <div className="text-[11px] uppercase tracking-[0.22em] text-[var(--color-acc-deep,#8C6520)] opacity-80">
          {eyebrow}
        </div>
        <p
          className="mt-4 font-display text-[26px] leading-[1.35] text-[var(--color-ink,#221E18)] sm:text-[30px]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          <em>&ldquo;{philosopher.keyIdea}&rdquo;</em>
        </p>
        <div className="mt-4 flex items-center gap-2 text-[13px] text-[var(--color-ink-soft,#4A4338)]">
          <span
            className="inline-block h-1 w-1 rounded-full bg-[var(--color-acc,#B8862F)]"
            aria-hidden
          />
          <span>
            {philosopher.name}
            {philosopher.dates ? `, ${philosopher.dates}` : ""}
          </span>
        </div>
      </div>
    </section>
  );
}
