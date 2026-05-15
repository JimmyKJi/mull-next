// Loading state for /u/[handle] — shown by Next.js while the server
// component is fetching the profile + trajectory + public entries.
// Quiet skeleton, same overall layout as the real page so the swap is
// visually stable.
//
// Pixel chrome: each shimmer block is a chunky pixel rectangle (3px
// ink border, no border-radius) so the skeleton matches the resolved
// public profile.

import MullWordmark from '@/components/mull-wordmark';

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";

export default function Loading() {
  return (
    <main style={{ maxWidth: 760, margin: '60px auto', padding: '0 24px' }}>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 36,
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <MullWordmark as="div" />
        <div className="pixel-shimmer" style={{ width: 110, height: 28 }} />
      </header>

      <div className="pixel-shimmer" style={{ width: 120, height: 14, marginBottom: 18 }} />
      <div className="pixel-shimmer" style={{ width: '70%', height: 44, marginBottom: 14 }} />
      <div className="pixel-shimmer" style={{ width: '50%', height: 22, marginBottom: 36 }} />

      <div className="pixel-shimmer" style={{ height: 220, marginBottom: 28 }} />

      <div className="pixel-shimmer" style={{ width: 180, height: 18, marginBottom: 18 }} />
      <div style={{ display: 'grid', gap: 10 }}>
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} className="pixel-shimmer" style={{ height: 16, width: `${90 - i * 8}%` }} />
        ))}
      </div>

      <p style={{
        textAlign: 'center',
        marginTop: 60,
        fontFamily: pixel,
        fontSize: 11,
        color: '#8C6520',
        opacity: 0.85,
        letterSpacing: 0.4,
        textTransform: 'uppercase',
      }}>
        ▸ LOADING…
      </p>
    </main>
  );
}
