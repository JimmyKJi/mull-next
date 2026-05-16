// Share buttons for an archetype result on /account.
//
// X uses the web compose intent (works seamlessly).
// Instagram + TikTok have no web composer, but pasting captions is
// friction-heavy and feels broken. Better UX: send the user to a
// designed /share/[slug] page, which they screenshot and post
// manually. The screenshot itself becomes the visual asset.
//
// Native share + copy-link are kept as supplementary options.
//
// v3 pixel chrome: chunky pixel-button look on each share entry,
// hover lifts via translate + shadow shift. Eyebrow uses pixel font.

'use client';

import { useState } from 'react';

const sans = "'Inter', system-ui, sans-serif";
const pixel = "var(--font-pixel-display, 'Courier New', monospace)";

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
  archetype: string;
  flavor?: string | null;
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

  // Screenshot-friendly share page URL — flavor + pct as query params
  // so the page renders the user's specific result.
  const shareCardParams = new URLSearchParams();
  if (flavor) shareCardParams.set('flavor', flavor);
  if (alignmentPct) shareCardParams.set('pct', String(alignmentPct));
  const shareCardUrl = `/share/${slug}${shareCardParams.toString() ? `?${shareCardParams}` : ''}`;

  async function copyLink() {
    setError(null);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
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
      if (e && (e as Error).name !== 'AbortError') setError((e as Error).message);
    }
  }

  const hasNativeShare =
    typeof window !== 'undefined' && typeof navigator.share === 'function';

  return (
    <div style={{
      marginTop: 22,
      paddingTop: 22,
      borderTop: '4px solid #221E18',
    }}>
      <div style={{
        fontFamily: pixel, fontSize: 11,
        color: '#8C6520', textTransform: 'uppercase',
        letterSpacing: '0.18em', marginBottom: 12,
      }}>
        ▸ SHARE YOUR ARCHETYPE
      </div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <a
          href={xIntent}
          target="_blank"
          rel="noopener noreferrer"
          className="pixel-press"
          style={{ ...pixelShareButton, textDecoration: 'none' }}
        >
          <span aria-hidden style={{ marginRight: 8 }}>𝕏</span>
          <span>POST ON X</span>
        </a>
        <a
          href={shareCardUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="pixel-press"
          style={{ ...pixelShareButton, textDecoration: 'none' }}
          title="Opens a screenshot-friendly card you can share to Instagram"
        >
          <span aria-hidden style={{ marginRight: 8 }}>◎</span>
          <span>INSTAGRAM</span>
        </a>
        <a
          href={shareCardUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="pixel-press"
          style={{ ...pixelShareButton, textDecoration: 'none' }}
          title="Opens a screenshot-friendly card you can share to TikTok"
        >
          <span aria-hidden style={{ marginRight: 8 }}>♪</span>
          <span>TIKTOK</span>
        </a>
        <button
          type="button"
          onClick={copyLink}
          className="pixel-press"
          style={{
            ...pixelShareButton,
            ...(copied ? copiedStyle : {}),
            cursor: 'pointer',
          }}
        >
          <span aria-hidden style={{ marginRight: 8 }}>↗</span>
          <span>{copied ? 'COPIED!' : 'COPY LINK'}</span>
        </button>
        {hasNativeShare && (
          <button type="button" onClick={nativeShare} className="pixel-press" style={{ ...pixelShareButton, cursor: 'pointer' }}>
            <span aria-hidden style={{ marginRight: 8 }}>↗</span>
            <span>SHARE…</span>
          </button>
        )}
      </div>
      {error && (
        <p style={{
          marginTop: 12, fontFamily: sans, fontSize: 12, color: '#7A2E2E',
        }}>
          {error}
        </p>
      )}
    </div>
  );
}

const pixelShareButton: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '10px 16px',
  background: '#FFFCF4',
  color: '#221E18',
  border: '3px solid #221E18',
  borderRadius: 0,
  fontFamily: pixel,
  fontSize: 12,
  letterSpacing: 0.4,
  textTransform: 'uppercase',
  boxShadow: '3px 3px 0 0 #B8862F',
  transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end), background 80ms steps(2, end)',
};

const copiedStyle: React.CSSProperties = {
  background: '#F8EDC8',
  color: '#8C6520',
  boxShadow: '3px 3px 0 0 #2F5D5C',
};
