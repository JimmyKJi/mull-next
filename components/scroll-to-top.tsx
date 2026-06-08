// ScrollToTop — small pixel button that appears at the bottom-right
// of long pages once the user has scrolled down. Sits above the
// feedback button and avoids the Cmd-K mobile button (bottom-left).
//
// Hidden until the user has scrolled at least 600px so it doesn't
// clutter short pages. Click to smooth-scroll back to top (or
// instant-scroll under prefers-reduced-motion).

'use client';

import { useEffect, useState } from 'react';
import { t, type Locale, isLocale } from '@/lib/translations';

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const [locale, setLocale] = useState<Locale>('en');

  useEffect(() => {
    const m = document.cookie.match(/(?:^|; )mull_locale=([^;]+)/);
    const v = m?.[1];
    if (v && isLocale(v)) setLocale(v);
  }, []);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 600);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => {
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
      }}
      aria-label={t('a11y.scroll_top', locale)}
      className="pixel-press"
      style={{
        position: 'fixed',
        bottom: 80, // Above the Feedback button (bottom: 18)
        right: 18,
        zIndex: 55,
        width: 40,
        height: 40,
        padding: 0,
        background: 'var(--color-ink)',
        color: 'var(--color-cream)',
        border: '3px solid var(--color-acc)',
        boxShadow: '3px 3px 0 0 var(--color-acc)',
        borderRadius: 0,
        fontFamily: "var(--font-pixel-display, 'Courier New', monospace)",
        fontSize: 16,
        cursor: 'pointer',
        transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end)',
      }}
    >
      ▲
    </button>
  );
}
