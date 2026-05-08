// Sitemap for the Next.js app. Public profile pages aren't enumerated here
// (privacy: don't volunteer the list of public users to crawlers — they
// already need to know the handle). Static routes only.
//
// The homepage at / is served from public/mull.html via a rewrite, but
// search engines should still find it through this sitemap entry.
import type { MetadataRoute } from 'next';

const SITE = 'https://mull.world';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE}/`,         lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${SITE}/login`,    lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE}/signup`,   lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE}/dilemma`,  lastModified: now, changeFrequency: 'daily',   priority: 0.8 },
    { url: `${SITE}/diary`,    lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE}/debate`,   lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
  ];
}
