// Share buttons for an archetype result, used on /account so users
// who come back later can still share. Mirrors the share row in
// mull.html (showResults).
//
// Five buttons:
//   - Post on X — opens twitter.com/intent/tweet (web intent)
//   - Share to Instagram — copies caption + opens IG app via deep
//     link on mobile; on desktop just copies + tells user where to
//     paste. (Instagram has no web share API.)
//   - Share to TikTok — same pattern as Instagram
//   - Copy link — clipboard write with confirmation
//   - Share… — native navigator.share, mobile-only
//
// Why the IG/TT design: neither platform exposes a URL-based
// composer the way X does, so the most we can do from a webpage is
// (a) put a ready-to-paste caption on the user's clipboard and (b)
// deep-link the app to save them one tap. The toast text makes the
// "now go paste it" step clear so the button doesn't feel broken.

'use client';

import { useState } from 'react';

const sans = "'Inter', system-ui, sans-serif";

function archetypeSlug(name: string): string {
  return name
    .replace(/^The\s+/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

type Toast = { kind: 'copied' | 'caption-copied'; platform?: string } | null;

export default function ShareResultCard({
  archetype,
  flavor,
  alignmentPct,
}: {
  archetype: string;
  flavor?: string | null;
  alignmentPct?: number;
}) {
  const [toast, setToast] = useState<Toast>(null);
  const [error, setError] = useState<string | null>(null);

  const slug = archetypeSlug(archetype);
  const cleanArch = archetype.replace(/^The\s+/i, '');
  const flavorLabel = flavor ? `${flavor} ${cleanArch}` : cleanArch;
  const url = `https://mull.world/archetype/${slug}`;

  const tweet =
    `I just took the Mull quiz and landed at the ${flavorLabel}` +
    `${alignmentPct ? ` (${alignmentPct}% alignment)` : ''}. ` +
    `Find out where you sit on the map of how you think — `;

  // Caption-style copy for Instagram — emoji-friendly, line breaks,
  // hashtags. Optimized for paste-into-story or feed-post caption.
  const igCaption =
    `Just found my philosophical archetype on Mull:\n\n` +
    `✦ The ${flavorLabel} ✦\n\n` +
    `Take the quiz at mull.world to find yours.\n\n` +
    `#philosophy #worldview #mull`;

  // TikTok captions skew shorter, hashtag-heavy.
  const tiktokCaption =
    `Found my philosophical archetype on Mull: The ${flavorLabel} 🌌 ` +
    `Take the quiz at mull.world ` +
    `#philosophy #philosophytok #mull #worldview #thinking`;

  const xIntent =
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}` +
    `&url=${encodeURIComponent(url)}`;

  function showToast(t: Toast) {
    setToast(t);
    setTimeout(() => setToast(null), 3500);
  }

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      window.prompt('Copy this:', text);
      return false;
    }
  }

  async function copyLink() {
    setError(null);
    const ok = await copyText(url);
    if (ok) showToast({ kind: 'copied' });
  }

  async function shareToInstagram() {
    setError(null);
    const ok = await copyText(igCaption);
    if (ok) showToast({ kind: 'caption-copied', platform: 'Instagram' });
    // On mobile, try to deep-link the IG app so the user can paste
    // immediately. Desktop quietly ignores — they'll have to switch
    // devices to actually post.
    if (typeof window !== 'undefined' && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)) {
      // Tiny delay so the clipboard write completes before navigation.
      setTimeout(() => { window.location.href = 'instagram://camera'; }, 300);
    }
  }

  async function shareToTikTok() {
    setError(null);
    const ok = await copyText(tiktokCaption);
    if (ok) showToast({ kind: 'caption-copied', platform: 'TikTok' });
    if (typeof window !== 'undefined' && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)) {
      setTimeout(() => { window.location.href = 'snssdk1233://'; }, 300);
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

  const toastText =
    toast?.kind === 'copied' ? 'Link copied!' :
    toast?.kind === 'caption-copied' ? `Caption copied — open ${toast.platform} and paste it in your post or story.` :
    null;

  return (
    <div style={{
      marginTop: 22,
      paddingTop: 22,
      borderTop: '1px solid #EBE3CA',
    }}>
      <div style={{
        fontFamily: sans, fontSize: 11, fontWeight: 600,
        color: '#8C6520', textTransform: 'uppercase',
        letterSpacing: '0.18em', marginBottom: 10,
      }}>
        Share your archetype
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <a
          href={xIntent}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            ...buttonStyle,
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}
        >
          <span aria-hidden>𝕏</span>
          <span>Post on X</span>
        </a>
        <button type="button" onClick={shareToInstagram} style={{ ...buttonStyle, cursor: 'pointer' }}>
          <span aria-hidden style={{ marginRight: 6 }}>◎</span>
          <span>Post on Instagram</span>
        </button>
        <button type="button" onClick={shareToTikTok} style={{ ...buttonStyle, cursor: 'pointer' }}>
          <span aria-hidden style={{ marginRight: 6 }}>♪</span>
          <span>Post on TikTok</span>
        </button>
        <button type="button" onClick={copyLink} style={{ ...buttonStyle, cursor: 'pointer' }}>
          <span aria-hidden style={{ marginRight: 6 }}>↗</span>
          <span>Copy link</span>
        </button>
        {hasNativeShare && (
          <button type="button" onClick={nativeShare} style={{ ...buttonStyle, cursor: 'pointer' }}>
            <span aria-hidden style={{ marginRight: 6 }}>↗</span>
            <span>Share…</span>
          </button>
        )}
      </div>
      {toastText && (
        <p style={{
          marginTop: 10, fontFamily: sans, fontSize: 12.5,
          color: '#2F5D5C',
          padding: '6px 10px',
          background: '#EFF5F1',
          border: '1px solid #C9DBCB',
          borderRadius: 6,
          display: 'inline-block',
          maxWidth: '100%',
          lineHeight: 1.5,
        }}>
          {toastText}
        </p>
      )}
      {error && (
        <p style={{
          marginTop: 8, fontFamily: sans, fontSize: 12, color: '#7A2E2E',
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
