// Loading state for /account. Account page does several Supabase reads
// (quiz attempts, dilemma responses, diary entries) so first paint can lag
// noticeably on a cold connection.

const serif = "'Cormorant Garamond', Georgia, serif";

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
        alignItems: 'baseline',
        marginBottom: 36,
        flexWrap: 'wrap',
        gap: 16,
      }}>
        <div style={{ fontFamily: serif, fontSize: 28, fontWeight: 500, color: '#221E18' }}>
          Mull<span style={{ color: '#B8862F' }}>.</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ ...shimmer, width: 90, height: 28 }} />
          <div style={{ ...shimmer, width: 80, height: 36, borderRadius: 999 }} />
        </div>
      </header>

      <div style={{ ...shimmer, width: '40%', height: 44, marginBottom: 12 }} />
      <div style={{ ...shimmer, width: '60%', height: 18, marginBottom: 36 }} />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 12,
        marginBottom: 44,
      }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{ ...shimmer, height: 80 }} />
        ))}
      </div>

      <div style={{ ...shimmer, height: 240, marginBottom: 24 }} />
      <div style={{ ...shimmer, height: 80 }} />
    </main>
  );
}
