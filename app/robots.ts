// Robots policy. Allow crawling of public surface area (homepage, About,
// auth pages). Disallow API routes (no useful content + we don't want
// crawlers hammering them) and the user-private spaces (account, diary,
// dilemma) which all require login anyway and would just return redirects.
//
// Public profile pages at /u/<handle> ARE crawlable — that's the point of
// opting in. Search engines that follow shared links will index them.
import type { MetadataRoute } from 'next';

const SITE = 'https://mull.world';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/u/'],
        disallow: ['/api/', '/account', '/diary', '/dilemma', '/debate/me'],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
  };
}
