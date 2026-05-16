// EmbedBadgeSnippet — shows the user a one-liner iframe snippet they
// can paste into their personal site / Notion / Substack / Linktree.
// Rendered on /account/profile when the user has a public handle so
// the badge feature is discoverable (otherwise it's an undocumented
// /badge/<handle> URL).
//
// Renders a live preview of the badge on the right side of the
// snippet so users can see what they'll be embedding.

'use client';

import { useState } from 'react';

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";
const serif = "'Cormorant Garamond', Georgia, serif";

export default function EmbedBadgeSnippet({ handle }: { handle: string }) {
  const [copied, setCopied] = useState(false);

  const url = `https://mull.world/badge/${handle}`;
  const snippet = `<iframe src="${url}" width="320" height="100" frameborder="0" scrolling="no" title="Mull · @${handle}"></iframe>`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt('Copy this snippet:', snippet);
    }
  }

  return (
    <section style={{
      marginTop: 32,
      padding: '22px 24px',
      background: '#FFFCF4',
      border: '4px solid #221E18',
      boxShadow: '5px 5px 0 0 #B8862F',
      borderRadius: 0,
    }}>
      <div style={{
        fontFamily: pixel,
        fontSize: 12,
        color: '#8C6520',
        textTransform: 'uppercase',
        letterSpacing: '0.18em',
        marginBottom: 10,
      }}>
        ▸ EMBED YOUR BADGE
      </div>
      <p style={{
        fontFamily: serif,
        fontStyle: 'italic',
        fontSize: 15,
        color: '#4A4338',
        margin: '0 0 14px',
        lineHeight: 1.55,
      }}>
        Drop this snippet into your Notion page, Substack, personal
        site, or any other surface that accepts an iframe. It updates
        automatically as your archetype shifts.
      </p>

      {/* Live preview */}
      <div style={{
        padding: '14px',
        background: '#F8EDC8',
        border: '3px solid #221E18',
        marginBottom: 14,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <iframe
          src={`/badge/${handle}`}
          width={320}
          height={100}
          frameBorder={0}
          scrolling="no"
          title={`Mull badge preview for @${handle}`}
          style={{ background: 'transparent' }}
        />
      </div>

      {/* Snippet text + copy button */}
      <div style={{
        padding: '12px 14px',
        background: '#221E18',
        color: '#F8EDC8',
        fontFamily: 'ui-monospace, Menlo, monospace',
        fontSize: 12,
        lineHeight: 1.55,
        marginBottom: 12,
        overflowX: 'auto',
        whiteSpace: 'pre',
      }}>
        {snippet}
      </div>

      <button
        type="button"
        onClick={copy}
        className="pixel-press"
        style={{
          display: 'inline-block',
          padding: '10px 16px',
          background: copied ? '#2F5D5C' : '#221E18',
          color: '#FAF6EC',
          border: '3px solid #221E18',
          boxShadow: '3px 3px 0 0 #B8862F',
          borderRadius: 0,
          fontFamily: pixel,
          fontSize: 11,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end)',
        }}
      >
        {copied ? '✓ COPIED' : '▸ COPY SNIPPET'}
      </button>
    </section>
  );
}
