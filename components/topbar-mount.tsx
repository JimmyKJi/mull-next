// Thin client wrapper that decides whether to render the global TopBar
// based on the current pathname. /account opted out of the TopBar (it
// has its own in-page header with the LogoutButton); every other Next.js
// route gets the bar.
//
// Pulling pathname requires a client component. The TopBar itself stays
// a server component — we just gate its visibility here.

'use client';

import { usePathname } from 'next/navigation';

const HIDDEN_PREFIXES = [
  '/account',  // has its own header with LogoutButton + privacy controls
  '/quiz',     // v2 sandbox — focused single-task surface
  '/result',   // v2 sandbox — owns the page chrome
];

// Exact-match pathnames (no prefix match). Used for `/` because
// the prefix logic would otherwise hide the bar on every route.
const HIDDEN_EXACT = new Set([
  '/',         // v2 homepage has its own slim wordmark header
]);

export default function TopBarMount({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/';
  const hideExact = HIDDEN_EXACT.has(pathname);
  const hidePrefix = HIDDEN_PREFIXES.some(
    p => pathname === p || pathname.startsWith(p + '/'),
  );
  if (hideExact || hidePrefix) return null;
  return <>{children}</>;
}
