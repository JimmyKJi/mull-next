import type { NextConfig } from 'next';
import path from 'node:path';

const nextConfig: NextConfig = {
  // Pin Turbopack's workspace root to this directory. Without this,
  // Next infers the wrong root when run from a git worktree (it
  // walks up to the parent checkout's lockfile and treats *that*
  // directory as root, which means new files in the worktree are
  // never picked up). The pin is harmless in production builds.
  turbopack: {
    root: path.resolve(__dirname),
  },
  // The / → /mull.html rewrite was removed at v2 cutover. The new
  // editorial homepage at app/page.tsx is now what / serves. The
  // mull.html file stays in /public until the rest of the redesign
  // (archetype + philosopher restyles) lands, so we have a quick
  // rollback path: re-add the rewrite if anything's broken.

  // Security headers, in two layers:
  //
  //   1. Baseline hardening on every response (HSTS, nosniff,
  //      Referrer-Policy, Permissions-Policy). Zero-breakage — these
  //      constrain how browsers treat our responses without changing what
  //      we serve.
  //
  //   2. A Content-Security-Policy. We deliberately use a STATIC, nonce-free
  //      CSP ('unsafe-inline' in script/style) rather than a per-request
  //      nonce: a nonce forces every route to render dynamically, which
  //      would kill static generation / ISR / CDN caching for the ~550
  //      static philosopher pages, the 10 archetypes, the SEO essays — i.e.
  //      most of this site. 'unsafe-inline' is acceptable here because we
  //      never inject user-supplied HTML into a <script>: the only inline
  //      scripts are our own JSON-LD and Next's bootstrap, and every
  //      dangerouslySetInnerHTML feeds trusted first-party SVG/markup.
  //
  // Clickjacking is handled by CSP `frame-ancestors`, NOT X-Frame-Options.
  // Per Next's own headers doc, frame-ancestors supersedes X-Frame-Options
  // and — crucially — it can be RELAXED per route. The public badge and map
  // embeds (/badge/*, /embed/*) are meant to be iframed on third-party sites
  // (Notion, Substack, personal pages), so those routes omit the ancestor
  // lock while every other route is pinned to 'self'. A single global
  // X-Frame-Options: SAMEORIGIN could not express that exception (the header
  // has no "allow these embeds" value), which is why it's dropped entirely.
  async headers() {
    const isDev = process.env.NODE_ENV !== 'production';

    // Supabase origin: REST + auth over https, realtime over wss. Derived
    // from the public URL so connect-src follows whatever project is wired
    // (and degrades to 'self'-only if the env var is missing).
    const supabaseConnect: string[] = [];
    try {
      const u = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || '');
      supabaseConnect.push(u.origin, `wss://${u.host}`);
    } catch {
      // unset / malformed — leave it out; data calls would already be broken.
    }

    const connectSrc = [
      "'self'",
      ...supabaseConnect,
      'https://vitals.vercel-insights.com', // Vercel Speed Insights beacon
      // Turbopack HMR socket + the Vercel analytics debug script's host,
      // both dev-only. In production Vercel serves analytics/speed-insights
      // from same-origin /_vercel/* paths (covered by 'self'), so this host
      // is deliberately NOT in the production policy.
      ...(isDev ? ['ws:', 'wss:', 'https://va.vercel-scripts.com'] : []),
    ];

    // The CSP differs by exactly one directive — frame-ancestors — so build
    // it once and vary that. Everything else is identical across routes.
    const csp = (embeddable: boolean) =>
      [
        "default-src 'self'",
        "base-uri 'self'",
        "object-src 'none'",
        // 'unsafe-eval' is dev-only: Turbopack / React Fast Refresh need it.
        // Production never evals (three.js shaders compile on the GPU, not JS).
        // va.vercel-scripts.com is also dev-only — it's where @vercel/analytics
        // and speed-insights fetch their *debug* script; production loads them
        // from same-origin /_vercel/* (so 'self' covers prod, host omitted there).
        `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval' https://va.vercel-scripts.com" : ''}`,
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob:",
        "font-src 'self' data:",
        `connect-src ${connectSrc.join(' ')}`,
        "worker-src 'self' blob:",
        "media-src 'self'",
        "frame-src 'self'",
        "form-action 'self'",
        // Public embeds are framable anywhere; every other route only by us.
        ...(embeddable ? [] : ["frame-ancestors 'self'"]),
        // Force http→https, prod only (would break plain http://localhost).
        ...(isDev ? [] : ['upgrade-insecure-requests']),
      ].join('; ');

    const baseline = [
      // Force HTTPS for two years. Vercel already serves HTTPS-only; this
      // tells browsers to refuse any future plaintext attempt (SSL-strip /
      // downgrade). No `preload` — that's a permanent public-list commitment
      // we don't need.
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains',
      },
      // Stop browsers MIME-sniffing a response into a different content type
      // (a classic XSS vector for user-supplied files).
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      // Send only the origin (not the full path/query) on cross-origin
      // navigations — never leak a user's in-app URL to third parties.
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      // Drop access to powerful features the app never uses, and opt out of
      // the Topics advertising API.
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
      },
    ];

    return [
      // Every route: baseline hardening + the locked-down CSP.
      {
        source: '/(.*)',
        headers: [...baseline, { key: 'Content-Security-Policy', value: csp(false) }],
      },
      // Public embed routes, listed AFTER the broad rule so their CSP key
      // overrides it (see "Header Overriding Behavior" in Next's headers
      // doc — last match for a given key wins). Same policy, minus the
      // frame-ancestors lock, so they can be iframed on any site.
      {
        source: '/badge/:path*',
        headers: [{ key: 'Content-Security-Policy', value: csp(true) }],
      },
      {
        source: '/embed/:path*',
        headers: [{ key: 'Content-Security-Policy', value: csp(true) }],
      },
    ];
  },
};

export default nextConfig;
