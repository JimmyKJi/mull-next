'use client';

// A quiet "invite a friend to today's question" affordance. Shares the
// PUBLIC daily dilemma (same for everyone that day) — never the user's
// private response — which makes the daily a low-key Wordle-style loop:
// finishing today's question is also a reason to pull someone in. Native
// share where available, clipboard fallback otherwise.

import { useState } from 'react';
import { t, type Locale } from '@/lib/translations';

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";

export default function DailyQuestionShare({
  question,
  locale,
}: {
  question: string;
  locale: Locale;
}) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = `${window.location.origin}/dilemma`;
    const text = t('today.share_text', locale, { question });
    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({ title: 'Mull', text, url });
        return;
      }
    } catch (e) {
      // AbortError = user dismissed the sheet; not an error worth surfacing.
      if (e && (e as Error).name === 'AbortError') return;
    }
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt(t('today.share_cta', locale), `${text} ${url}`);
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      style={{
        background: 'none',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        fontFamily: pixel,
        fontSize: 11,
        color: 'var(--color-acc-deep)',
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        textDecoration: 'underline',
        textUnderlineOffset: 3,
      }}
    >
      ↗ {copied ? t('today.share_copied', locale) : t('today.share_cta', locale)}
    </button>
  );
}
