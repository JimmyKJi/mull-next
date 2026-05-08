// Loading state for /u/[handle] — shown by Next.js while the server
// component is fetching the profile + trajectory + public entries.
// Quiet skeleton, same overall layout as the real page so the swap is
// visually stable.

const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'Inter', system-ui, sans-serif";

const shimmer: React.CSSProperties = {
  background: 'linear-gradient(90deg, #F5EFDC 0%, #FBF6E8 50%, #F5EFDC 100%)',
  backgroundSize: '200% 100%',
  animation: 'mull-shimmer 1.4s ease-in-out infinite',
  borderRadius: 8,
};

export default function Loading() {
  return (
    <main style={{ maxWidth: 760, margin: '60px auto', padding: '0 24px' }}>
      <style>{`
        @keyframes mull-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 36,
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <div style={{ fontFamily: serif, fontSize: 28, fontWeight: 500, color: '#221E18' }}>
          Mull<span style={{ color: '#B8862F' }}>.</span>
        </div>
        <div style={{ ...shimmer, width: 110, height: 28 }} />
      </header>

      <div style={{ ...shimmer, width: 120, height: 14, marginBottom: 18 }} />
      <div style={{ ...shimmer, width: '70%', height: 44, marginBottom: 12 }} />
      <div style={{ ...shimmer, width: '50%', height: 22, marginBottom: 36 }} />

      <div style={{ ...shimmer, height: 220, marginBottom: 24 }} />

      <div style={{ ...shimmer, width: 180, height: 18, marginBottom: 18 }} />
      <div style={{ display: 'grid', gap: 10 }}>
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} style={{ ...shimmer, height: 14, width: `${90 - i * 8}%` }} />
        ))}
      </div>

      <p style={{
        textAlign: 'center',
        marginTop: 60,
        fontFamily: sans,
        fontSize: 12,
        color: '#8C6520',
        opacity: 0.7,
        letterSpacing: 0.3,
      }}>
        loading…
      </p>
    </main>
  );
}
