import { cookies, headers } from 'next/headers';
import { isLocale, type Locale } from './translations';

// Resolve the active locale for a server render.
//
// Priority:
//   1. The `mull_locale` cookie — an explicit choice the user made via
//      the LanguageSwitcher. Always wins once set.
//   2. The browser's `Accept-Language` header — so a first-time visitor
//      whose browser is set to Chinese (zh-CN, zh-TW…), Japanese, etc.
//      lands in their own language instead of always seeing English.
//   3. English, as the final fallback.
//
// Reading headers()/cookies() already makes these pages dynamic, so the
// Accept-Language read adds no new caching penalty.
export async function getServerLocale(): Promise<Locale> {
  const c = await cookies();
  const explicit = c.get('mull_locale')?.value;
  if (isLocale(explicit)) return explicit;

  const h = await headers();
  const fromBrowser = pickFromAcceptLanguage(h.get('accept-language'));
  return fromBrowser ?? 'en';
}

// Parse an Accept-Language header ("zh-CN,zh;q=0.9,en;q=0.8") and return
// the highest-priority entry whose base subtag is a locale we support
// (zh-CN → zh, pt-BR → pt, en-US → en). Returns null if none match.
function pickFromAcceptLanguage(header: string | null): Locale | null {
  if (!header) return null;
  const ranked = header
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().split(';');
      let q = 1;
      for (const p of params) {
        const m = p.trim().match(/^q=([0-9.]+)$/);
        if (m) q = parseFloat(m[1]);
      }
      return { tag: tag.trim().toLowerCase(), q };
    })
    .filter((r) => r.tag && r.tag !== '*')
    .sort((a, b) => b.q - a.q);

  for (const { tag } of ranked) {
    const base = tag.split('-')[0];
    if (isLocale(base)) return base;
  }
  return null;
}
