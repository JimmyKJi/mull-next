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

import { useEffect, useState } from 'react';
import { t, type Locale, isLocale } from '@/lib/translations';

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
  const [locale, setLocale] = useState<Locale>('en');

  useEffect(() => {
    const m = document.cookie.match(/(?:^|; )mull_locale=([^;]+)/);
    const v = m?.[1];
    if (v && isLocale(v)) setLocale(v);
  }, []);

  const slug = archetypeSlug(archetype);
  const cleanArch = archetype.replace(/^The\s+/i, '');
  const flavorLabel = flavor ? `${flavor} ${cleanArch}` : cleanArch;
  const url = `https://mull.world/archetype/${slug}`;
  const tweet = alignmentPct
    ? t('crd.share_tweet_pct', locale, { label: flavorLabel, pct: alignmentPct })
    : t('crd.share_tweet', locale, { label: flavorLabel });

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
      window.prompt(t('crd.copy_link_prompt', locale), url);
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

  const hasNativeShare = typeof window !== 'undefined' && typeof navigator.share === 'function';

  // ── Friend-challenge invite ──────────────────────────────────────
  // Click → POST /api/challenge/create → copy the returned URL to
  // clipboard. Signed-out users see a sign-in prompt instead; we
  // detect that via the 401 from the API.
  const [challengeUrl, setChallengeUrl] = useState<string | null>(null);
  const [challengeBusy, setChallengeBusy] = useState(false);

  async function challengeFriend() {
    if (challengeBusy) return;
    setChallengeBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/challenge/create', { method: 'POST' });
      if (res.status === 401) {
        // Signed-out user — send them to /signup with a return-to
        // hint so they can come back and challenge after signup.
        window.location.href = '/signup?next=/result';
        return;
      }
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error || t('crd.challenge_err_create', locale));
        setChallengeBusy(false);
        return;
      }
      const full = `${window.location.origin}${json.url}`;
      setChallengeUrl(full);
      try {
        await navigator.clipboard.writeText(full);
      } catch {
        /* clipboard denied — the URL is still visible below */
      }
    } catch {
      setError(t('crd.challenge_err_network', locale));
    } finally {
      setChallengeBusy(false);
    }
  }

  return (
    <div
      style={{
        marginTop: 22,
        paddingTop: 22,
        borderTop: '4px solid var(--color-ink)',
      }}
    >
      <div
        style={{
          fontFamily: pixel,
          fontSize: 11,
          color: 'var(--color-acc-deep)',
          textTransform: 'uppercase',
          letterSpacing: '0.18em',
          marginBottom: 12,
        }}
      >
        ▸ {t('crd.share_eyebrow', locale)}
      </div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <a
          href={xIntent}
          target="_blank"
          rel="noopener noreferrer"
          className="pixel-press"
          style={{ ...pixelShareButton, textDecoration: 'none' }}
        >
          <span aria-hidden style={{ marginRight: 8 }}>
            𝕏
          </span>
          <span>{t('crd.share_post_x', locale)}</span>
        </a>
        <a
          href={shareCardUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="pixel-press"
          style={{ ...pixelShareButton, textDecoration: 'none' }}
          title={t('crd.share_instagram_title', locale)}
        >
          <span aria-hidden style={{ marginRight: 8 }}>
            ◎
          </span>
          <span>INSTAGRAM</span>
        </a>
        <a
          href={shareCardUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="pixel-press"
          style={{ ...pixelShareButton, textDecoration: 'none' }}
          title={t('crd.share_tiktok_title', locale)}
        >
          <span aria-hidden style={{ marginRight: 8 }}>
            ♪
          </span>
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
          <span aria-hidden style={{ marginRight: 8 }}>
            ↗
          </span>
          <span>{copied ? t('crd.share_copied', locale) : t('crd.share_copy_link', locale)}</span>
        </button>
        {hasNativeShare && (
          <button
            type="button"
            onClick={nativeShare}
            className="pixel-press"
            style={{ ...pixelShareButton, cursor: 'pointer' }}
          >
            <span aria-hidden style={{ marginRight: 8 }}>
              ↗
            </span>
            <span>{t('crd.share_native', locale)}</span>
          </button>
        )}
        {/* Friend-challenge invite. Different visual weight (amber
            fill) because this is the high-leverage growth CTA: a
            friend who takes the quiz via this link lands on /compare
            with you, not on the generic result page. */}
        <button
          type="button"
          onClick={challengeFriend}
          disabled={challengeBusy}
          className="pixel-press"
          style={{
            ...pixelShareButton,
            background: 'var(--color-acc)',
            color: '#1A1612',
            borderColor: 'var(--color-ink)',
            boxShadow: '3px 3px 0 0 var(--color-ink)',
            cursor: challengeBusy ? 'wait' : 'pointer',
          }}
        >
          <span aria-hidden style={{ marginRight: 8 }}>
            ⚔
          </span>
          <span>
            {challengeBusy ? t('crd.challenge_minting', locale) : t('crd.challenge_friend', locale)}
          </span>
        </button>
      </div>
      {challengeUrl && (
        <div
          style={{
            marginTop: 14,
            padding: '12px 14px',
            background: 'var(--color-acc-soft)',
            border: '3px solid var(--color-ink)',
            boxShadow: '3px 3px 0 0 var(--color-acc)',
            borderRadius: 0,
          }}
        >
          <div
            style={{
              fontFamily: pixel,
              fontSize: 10,
              color: 'var(--color-acc-deep)',
              letterSpacing: 0.4,
              textTransform: 'uppercase',
              marginBottom: 8,
            }}
          >
            ▸ {t('crd.invite_copied_banner', locale)}
          </div>
          <code
            style={{
              fontFamily: 'ui-monospace, Menlo, monospace',
              fontSize: 12,
              color: 'var(--color-ink)',
              wordBreak: 'break-all',
            }}
          >
            {challengeUrl}
          </code>
        </div>
      )}
      {error && (
        <p
          style={{
            marginTop: 12,
            fontFamily: sans,
            fontSize: 12,
            color: '#7A2E2E',
          }}
        >
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
  color: 'var(--color-ink)',
  border: '3px solid var(--color-ink)',
  borderRadius: 0,
  fontFamily: pixel,
  fontSize: 12,
  letterSpacing: 0.4,
  textTransform: 'uppercase',
  boxShadow: '3px 3px 0 0 var(--color-acc)',
  transition:
    'transform 80ms steps(2, end), box-shadow 80ms steps(2, end), background 80ms steps(2, end)',
};

const copiedStyle: React.CSSProperties = {
  background: 'var(--color-acc-soft)',
  color: 'var(--color-acc-deep)',
  boxShadow: '3px 3px 0 0 #2F5D5C',
};
