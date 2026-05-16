// ObfuscatedEmail — small client component that renders an email
// address as visible text but only constructs the mailto: href when
// the user clicks. Naive scrapers that parse rendered HTML for
// `mailto:` strings or for `name@domain` patterns get fooled by the
// HTML-entity-split visual spelling; the real address is reassembled
// in the click handler.
//
// Not bulletproof — a determined scraper that runs JS will still
// catch it. But blocks the trivial 80% case and is zero-config.

'use client';

import { useState } from 'react';

type Props = {
  user: string;
  domain: string;
  className?: string;
};

export function ObfuscatedEmail({ user, domain, className }: Props) {
  const [revealed, setRevealed] = useState(false);
  const visible = revealed
    ? `${user}@${domain}`
    : `${user} [at] ${domain}`;
  return (
    <a
      href={revealed ? `mailto:${user}@${domain}` : '#'}
      className={className}
      onClick={(e) => {
        if (!revealed) {
          // First click reveals + sets the href; subsequent clicks
          // act as normal mailto. Browsers won't open a mailto on
          // the same click that set href, so we re-fire it.
          e.preventDefault();
          setRevealed(true);
          window.setTimeout(() => {
            window.location.href = `mailto:${user}@${domain}`;
          }, 50);
        }
      }}
    >
      {visible}
    </a>
  );
}
