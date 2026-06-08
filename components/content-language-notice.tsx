"use client";

// ContentLanguageNotice — slim banner shown on long-form English-only
// surfaces (archetype detail, philosopher detail, topic, vs, about,
// methodology, exercises) when the user's locale isn't English.
//
// Renders nothing when locale === 'en'. Surfaces the existing
// i18n.content_notice translation so non-English visitors know that
// while UI navigation is in their language, the essay-length content
// on this page is currently English-only.
//
// IMPORTANT — why this is a client component:
//
// All five long-form detail pages (`/philosopher/[slug]`,
// `/archetype/[slug]`, `/topic/[slug]`, `/vs/[a]/[b]`,
// `/exercises/[slug]`) are statically generated via
// generateStaticParams. The build ships one cached HTML per slug,
// and that HTML doesn't vary by cookie — so a server-rendered notice
// would always reflect the locale of the *build host*, never the
// user's actual locale. (The /about and /methodology pages don't have
// generateStaticParams so the server version *does* work there;
// keeping the same component shape across all pages is cleaner than
// branching by page type.)
//
// The fix: render the banner client-side after hydration by reading
// `mull_locale` from document.cookie. This keeps SSG for all the SEO
// benefits, costs zero on server-render (the component returns null
// during SSR), and still shows the banner for non-EN visitors after
// the page loads.
//
// Tracked in NEXT.md §Translations: full content translation requires
// human-translated philosophy (machine translation gets nuance wrong);
// for now, we tell users honestly rather than hide it.

import { useEffect, useState } from "react";
import { t, isLocale, type Locale } from "@/lib/translations";

type Props = {
  /** Optional server-known locale. Used as the initial value on first
   *  paint; if the page is SSG and the build locale doesn't match the
   *  user's, useEffect overrides on hydration. */
  locale?: Locale;
  /** Optional margin-bottom override (in px). Defaults to 24. */
  marginBottom?: number;
  /** Locales whose page content is already fully translated. The notice
   *  hides for these (no point telling a zh visitor the content is
   *  English-only when this surface ships a complete zh render) while
   *  staying honest for every other non-English locale. */
  translatedLocales?: Locale[];
};

function readCookieLocale(): Locale {
  if (typeof document === "undefined") return "en";
  // Parse `mull_locale=xx` from the cookie string.
  const m = document.cookie.match(/(?:^|;\s*)mull_locale=([^;]+)/);
  const raw = m ? decodeURIComponent(m[1]) : null;
  return isLocale(raw) ? raw : "en";
}

export function ContentLanguageNotice({
  locale,
  marginBottom = 24,
  translatedLocales,
}: Props) {
  // Start with the server-supplied locale (or 'en' if not provided).
  // On hydration, swap to the locale read from document.cookie so
  // statically-generated pages still show the notice to non-EN users.
  const [resolved, setResolved] = useState<Locale>(locale ?? "en");
  useEffect(() => {
    const cookieLocale = readCookieLocale();
    if (cookieLocale !== resolved) setResolved(cookieLocale);
  }, [resolved]);

  if (resolved === "en") return null;
  if (translatedLocales?.includes(resolved)) return null;
  return (
    <div
      style={{
        borderLeft: "4px solid var(--color-acc)",
        background: "#F5EFDC",
        padding: "10px 14px",
        marginBottom,
        fontSize: 13,
        lineHeight: 1.55,
        color: "var(--color-ink-soft)",
        fontFamily: "var(--font-editorial), Georgia, serif",
        fontStyle: "italic",
      }}
    >
      {t("i18n.content_notice", resolved)}
    </div>
  );
}
