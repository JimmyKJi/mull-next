// Loading state for /account. Account page does several Supabase reads
// (quiz attempts, dilemma responses, diary entries) so first paint can lag
// noticeably on a cold connection.
//
// Pixel chrome: each shimmer block is a chunky pixel rectangle (3px
// ink border, no border-radius) so the skeleton speaks the same
// visual language as the resolved page.

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";

export default function Loading() {
  return (
    <main style={{ maxWidth: 760, margin: '60px auto', padding: '0 24px' }}>
      <header style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginBottom: 28,
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <div className="pixel-shimmer" style={{ width: 90, height: 28 }} />
        <div className="pixel-shimmer" style={{ width: 80, height: 36 }} />
      </header>

      {/* Eyebrow caret + title shimmer */}
      <div style={{
        fontFamily: pixel, fontSize: 11,
        color: '#8C6520', textTransform: 'uppercase',
        letterSpacing: '0.18em', marginBottom: 14,
      }}>
        ▸ LOADING…
      </div>
      <div className="pixel-shimmer" style={{ width: '40%', height: 36, marginBottom: 16 }} />
      <div className="pixel-shimmer" style={{ width: '60%', height: 18, marginBottom: 36 }} />

      {/* Stat row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 14,
        marginBottom: 36,
      }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="pixel-shimmer" style={{ height: 84 }} />
        ))}
      </div>

      {/* Latest result block + map */}
      <div className="pixel-shimmer" style={{ height: 220, marginBottom: 24 }} />
      <div className="pixel-shimmer" style={{ height: 80 }} />
    </main>
  );
}
