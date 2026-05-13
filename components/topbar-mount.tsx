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
  '/home',     // redesign v2 sandbox — has its own slim wordmark header
];

export default function TopBarMount({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/';
  const hide = HIDDEN_PREFIXES.some(p => pathname === p || pathname.startsWith(p + '/'));
  if (hide) return null;
  return <>{children}</>;
}
