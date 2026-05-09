// Share buttons for an archetype result, used on /account so users
// who come back later can still share. Mirrors the share row in
// mull.html (showResults), so the visual + interaction language is
// consistent across both surfaces.
//
// Three buttons:
//   - Post on X — opens twitter.com/intent/tweet with prefilled copy
//   - Copy link — clipboard write with confirmation, falls back to
//     window.prompt() if clipboard API is blocked
//   - Share… — native navigator.share (mobile mostly), hides itself
//     when unsupported
//
// URL points at /archetype/<slug> so the visitor lands on the
// long-form archetype essay (with its OG card) instead of /account.

'use client';

import { useState } from 'react';

const sans = "'Inter', system-ui, sans-serif";

// Slugify an archetype name: "The Pilgrim" → "pilgrim", "The
// Cartographer" → "cartographer". Mirrors lib/archetypes.ts keys.
function archetypeSlug(name: string): string {
  return name
    .replace(/^The\s+/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function ShareResultCard({
  archetype,
  flavor,
  alignmentPct,
}: {
  archetype: string;       // "The Pilgrim"
  flavor?: string | null;  // e.g. "Mystical" — optional flavor descriptor
  alignmentPct?: number;
}) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const slug = archetypeSlug(archetype);
  const cleanArch = archetype.replace(/^The\s+/i, '');
  const flavorLabel = flavor ? `${flavor} ${cleanArch}` : cleanArch;
  const url = `https://mull.world/archetype/${slug}`;
  const tweet =
    `I just took the Mull quiz and landed at the ${flavorLabel}` +
    `${alignmentPct ? ` (${alignmentPct}% alignment)` : ''}. ` +
    `Find out where you sit on the map of how you think — `;

  const xIntent =
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}` +
    `&url=${encodeURIComponent(url)}`;

  async function copyLink() {
    setError(null);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Some browsers block clipboard write outside user-gesture or in
      // insecure contexts. Fall back to a manual prompt.
      window.prompt('Copy this link:', url);
    }
  }

  async function nativeShare() {
    setError(null);
    try {
      await navigator.share({
        title: `Mull — ${flavorLabel}`,
        text: tweet,
        url,
      });
    } catch (e) {
      if (e && (e as Error).name !== 'AbortError') {
        setError((e as Error).message);
      }
    }
  }

  const hasNativeShare =
    typeof window !== 'undefined' && typeof navigator.share === 'function';

  return (
    <div style={{
      marginTop: 22,
      paddingTop: 22,
      borderTop: '1px solid #EBE3CA',
    }}>
      <div style={{
        fontFamily: sans,
        fontSize: 11,
        fontWeight: 600,
        color: '#8C6520',
        textTransform: 'uppercase',
        letterSpacing: '0.18em',
        marginBottom: 10,
      }}>
        Share your archetype
      </div>
      <div style={{
        display: 'flex',
        gap: 10,
        flexWrap: 'wrap',
      }}>
        <a
          href={xIntent}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            ...buttonStyle,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span aria-hidden>𝕏</span>
          <span>Post on X</span>
        </a>
        <button
          type="button"
          onClick={copyLink}
          style={{
            ...buttonStyle,
            ...(copied ? copiedStyle : {}),
            cursor: 'pointer',
          }}
        >
          <span aria-hidden style={{ marginRight: 6 }}>↗</span>
          <span>{copied ? 'Copied!' : 'Copy link'}</span>
        </button>
        {hasNativeShare && (
          <button
            type="button"
            onClick={nativeShare}
            style={{ ...buttonStyle, cursor: 'pointer' }}
          >
            <span aria-hidden style={{ marginRight: 6 }}>↗</span>
            <span>Share…</span>
          </button>
        )}
      </div>
      {error && (
        <p style={{
          marginTop: 8,
          fontFamily: sans,
          fontSize: 12,
          color: '#7A2E2E',
        }}>
          {error}
        </p>
      )}
    </div>
  );
}

const buttonStyle: React.CSSProperties = {
  padding: '8px 14px',
  borderRadius: 999,
  border: '1px solid #D6CDB6',
  background: '#FFFCF4',
  color: '#221E18',
  fontFamily: sans,
  fontSize: 13,
  fontWeight: 500,
  textDecoration: 'none',
  letterSpacing: 0.2,
  transition: 'border-color 0.15s, color 0.15s, background 0.15s',
};

const copiedStyle: React.CSSProperties = {
  borderColor: '#8C6520',
  color: '#8C6520',
  background: '#F5EFDC',
};
