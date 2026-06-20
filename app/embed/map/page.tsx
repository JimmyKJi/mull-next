// /embed/map — the philosophical constellation, embed-only.
//
// Used by iframes on /account and /u/[handle] to show the user's
// position on the constellation. No nav, no chrome, no footer.
// The host page (account / public profile) provides the surrounding
// UI; this route renders only the constellation itself.
//
// Replaces the old "/?embed=map&v=..." pattern that targeted the
// static mull.html embed-mode. When the homepage migrated to Next.js
// (app/page.tsx), embed-mode broke silently — the iframe just loaded
// the full homepage, squished. This route is the dedicated successor.
//
// Query parameters:
//   v — base64-encoded JSON array of length 16 (user vector)
//   h — base64-encoded JSON array of vectors (trail; optional, not
//       yet rendered — Constellation3D doesn't support a trail prop
//       at the time of writing. Parsed and ignored for forward-
//       compatibility; once a trail prop lands, wire it through.)

import type { Metadata, Viewport } from 'next';
import { ConstellationMount } from '@/components/constellation-mount';

export const metadata: Metadata = {
  title: 'Your map · Mull',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

type SearchParams = Promise<{ v?: string; h?: string }>;

function decodeVector(raw: string | undefined): number[] | undefined {
  if (!raw) return undefined;
  try {
    const arr = JSON.parse(atob(raw));
    if (!Array.isArray(arr) || arr.length !== 16) return undefined;
    return arr.map((n) => {
      const x = Number(n);
      return Number.isFinite(x) ? x : 0;
    });
  } catch {
    return undefined;
  }
}

export default async function EmbedMapPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const userVector = decodeVector(params.v);
  // Trail decode kept for forward-compatibility — see comment at top.
  // void to avoid unused-var lint without changing the signature.
  void params.h;

  return (
    <main
      style={{
        // Fill the iframe completely — no padding, no margin. The host
        // page provides framing (border, label, etc.). Width:100% so
        // the constellation canvas measures the iframe's actual width
        // (otherwise it falls back to the default <canvas> 300x150).
        margin: 0,
        padding: 0,
        minHeight: '100svh',
        width: '100%',
        background: '#FFFCF4',
      }}
    >
      <ConstellationMount
        userVector={userVector}
        height={540}
        mobileHeight={360}
        variant="interactive"
      />
    </main>
  );
}
