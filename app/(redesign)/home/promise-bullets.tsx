// PromiseBullets — three short trust signals (skippable, no signup,
// no prior philosophy needed). Server component; the bold leading
// phrase comes through as inline HTML from the i18n string, hence
// dangerouslySetInnerHTML on each <li>. The strings are author-
// curated, not user input, so this is safe.

import type { Locale } from "@/lib/translations";
import { t } from "@/lib/translations";

const KEYS = ["home.promise_skip", "home.promise_nosignup", "home.promise_curious"] as const;

export default function PromiseBullets({ locale }: { locale: Locale }) {
  return (
    <ul className="mt-12 space-y-3 max-w-[640px]">
      {KEYS.map((key) => (
        <li
          key={key}
          className="flex gap-3 text-[15px] leading-relaxed text-[var(--color-ink-soft,#4A4338)]"
        >
          <span className="mt-2 inline-block h-1 w-1 shrink-0 rounded-full bg-[var(--color-acc,#B8862F)]" />
          <span dangerouslySetInnerHTML={{ __html: t(key, locale) }} />
        </li>
      ))}
    </ul>
  );
}
