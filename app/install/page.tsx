// /install — guide for adding Mull to the home screen on iOS + Android.
//
// Why a dedicated route: PWA install behaviour is split across two
// totally different flows. Android can fire a `beforeinstallprompt`
// event we can intercept and trigger from a button — but only in
// Chromium browsers, only once, only after some engagement heuristic
// fires. iOS Safari has no API at all — the user has to use the share
// sheet manually. So the only thing that actually works on both is a
// step-by-step illustrated guide.
//
// The page detects the user's platform client-side and reorders the
// sections so iOS users see iOS steps first on iPhones, Android users
// see Android steps first. Both flows are always present (for users
// reading on desktop / on someone else's device / to share the link).
//
// On Android Chromium, we also surface the native install prompt if
// the browser exposes `beforeinstallprompt` — saves the user the
// share-sheet ritual when we can.

import type { Metadata } from 'next';
import { PixelPageHeader } from '@/components/pixel-window';
import { InstallClient } from './install-client';

export const metadata: Metadata = {
  title: 'Add Mull to your home screen',
  description: 'Step-by-step guide to installing Mull as an app on iPhone, iPad, or Android — no app store required.',
  alternates: { canonical: 'https://mull.world/install' },
  openGraph: {
    title: 'Add Mull to your home screen — Mull',
    description: 'Install Mull as an app on iOS or Android in three taps.',
    type: 'article',
  },
};

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";
const serif = "var(--font-prose)";

export default function InstallPage() {
  return (
    <main className="mx-auto max-w-[760px] px-5 pb-32 pt-10 sm:px-10">
      <PixelPageHeader
        eyebrow="▶ INSTALL"
        title="ADD MULL TO YOUR HOME SCREEN"
        subtitle={
          <p style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 16, color: '#4A4338', lineHeight: 1.55 }}>
            Three taps and Mull lives on your phone like a native app — full-screen,
            no URL bar, with a tile that pulls up <strong>Daily Spar</strong>,{' '}
            <strong>Pilgrimage</strong>, or <strong>The Inheritor</strong> straight from your home screen.
            No App Store. No download.
          </p>
        }
      />

      <InstallClient />
    </main>
  );
}
