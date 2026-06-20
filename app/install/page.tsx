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
import { getServerLocale } from '@/lib/locale-server';
import { t } from '@/lib/translations';
import { InstallClient } from './install-client';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return {
    title: t('inst.meta_title', locale),
    description: t('inst.meta_description', locale),
    alternates: { canonical: 'https://mull.world/install' },
    openGraph: {
      title: t('inst.meta_og_title', locale),
      description: t('inst.meta_og_description', locale),
      type: 'article',
    },
  };
}

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";
const serif = 'var(--font-prose)';

// Render **bold** spans inside a translated string.
function emph(text: string): React.ReactNode[] {
  return text
    .split(/(\*\*[^*]+\*\*)/g)
    .map((seg, i) =>
      seg.startsWith('**') && seg.endsWith('**') ? (
        <strong key={i}>{seg.slice(2, -2)}</strong>
      ) : (
        seg
      ),
    );
}

export default async function InstallPage() {
  const locale = await getServerLocale();
  return (
    <main className="mx-auto max-w-[760px] px-5 pb-32 pt-10 sm:px-10">
      <PixelPageHeader
        eyebrow={t('inst.eyebrow', locale)}
        title={t('inst.title', locale)}
        subtitle={
          <p
            style={{
              fontFamily: serif,
              fontStyle: 'italic',
              fontSize: 16,
              color: 'var(--color-ink-soft)',
              lineHeight: 1.55,
            }}
          >
            {emph(t('inst.subtitle', locale))}
          </p>
        }
      />

      <InstallClient locale={locale} />
    </main>
  );
}
