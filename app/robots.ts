// Robots policy. Allow crawling of public surface area (homepage, About,
// methodology, the daily dilemma prompt page, archetype + philosopher pages).
// Disallow API routes (no useful content + we don't want crawlers hammering
// them), the admin dashboard, and the user-private spaces (account, diary,
// debate/me) which all require login anyway.
//
// Public profile pages at /u/<handle> ARE crawlable — that's the point of
// opting in. Search engines that follow shared links will index them.
//
// /share/<slug> is intentionally not blocked here because it's not in the
// sitemap and the page itself sets `robots: { index: false }` via metadata,
// so it stays out of indexes without needing a separate disallow rule.
import type { MetadataRoute } from 'next';

const SITE = 'https://mull.world';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/u/'],
        disallow: ['/api/', '/account', '/admin', '/diary', '/debate/me'],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
  };
}
