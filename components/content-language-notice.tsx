// ContentLanguageNotice — slim banner shown on long-form English-only
// surfaces (archetype detail, philosopher detail, topic, vs, about,
// methodology, exercises) when the user's locale isn't English.
//
// Renders nothing when locale === 'en'. Surfaces the existing
// i18n.content_notice translation so non-English visitors know that
// while UI navigation is in their language, the essay-length content
// on this page is currently English-only.
//
// Tracked in NEXT.md §Translations: full content translation requires
// human-translated philosophy (machine translation gets nuance wrong);
// for now, we tell users honestly rather than hide it.

import { t, type Locale } from "@/lib/translations";

type Props = {
  locale: Locale;
  /** Optional margin-bottom override (in px). Defaults to 24. */
  marginBottom?: number;
};

export function ContentLanguageNotice({ locale, marginBottom = 24 }: Props) {
  if (locale === "en") return null;
  return (
    <div
      style={{
        borderLeft: "4px solid #B8862F",
        background: "#F5EFDC",
        padding: "10px 14px",
        marginBottom,
        fontSize: 13,
        lineHeight: 1.55,
        color: "#4A4338",
        fontFamily: "var(--font-editorial), Georgia, serif",
        fontStyle: "italic",
      }}
    >
      {t("i18n.content_notice", locale)}
    </div>
  );
}
