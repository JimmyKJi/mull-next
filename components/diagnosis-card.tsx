// Shared diagnosis-card for diary entries + dilemma responses.
//
// Renders the diagnosis paragraph, kindred-philosopher list (each
// linked to /philosopher/<slug> with a computed kinship %),
// tradition pills, and — when is_novel is true — a ✦ original
// thinking badge. Returns null when there's nothing to show.
//
// Pure presentational component; takes already-shaped data. Both
// surfaces (diary detail + dilemma archive) pass the same fields.
//
// v3 pixel chrome: chunky 4px ink border + hard amber drop-shadow.
// "Original thinking" branch swaps the shadow to plum so the novel
// callout reads at-a-glance.

import Link from 'next/link';
import type { Kinship } from '@/lib/kinship';

const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'Inter', system-ui, sans-serif";
const pixel = "var(--font-pixel-display, 'Courier New', monospace)";

export type DiagnosisCardProps = {
  diagnosis: string | null;
  kinship: Kinship | null;
  is_novel: boolean | null;
};

export default function DiagnosisCard({ diagnosis, kinship, is_novel }: DiagnosisCardProps) {
  const hasPhilosophers = !!kinship && kinship.philosophers.length > 0;
  const hasEchoes = !!kinship && Array.isArray(kinship.echoes) && kinship.echoes.length > 0;
  const hasTraditions = !!kinship && kinship.traditions.length > 0;
  const hasAnything = !!diagnosis || hasPhilosophers || hasEchoes || hasTraditions || is_novel;
  if (!hasAnything) return null;

  // Two color worlds: novel thinking (plum) vs. canonical kinship (teal).
  const accent = is_novel ? '#6B3E8C' : '#2F5D5C';
  const accentSoft = is_novel ? '#F0E6F5' : '#E5F0EE';

  return (
    <div style={{
      marginTop: 24,
      padding: '20px 24px',
      background: '#FFFCF4',
      border: '4px solid #221E18',
      boxShadow: `5px 5px 0 0 ${accent}`,
      borderRadius: 0,
    }}>
      <div style={{
        fontFamily: pixel,
        fontSize: 11,
        color: accent,
        textTransform: 'uppercase',
        letterSpacing: '0.18em',
        marginBottom: 12,
        display: 'flex',
        gap: 10,
        alignItems: 'center',
        flexWrap: 'wrap',
      }}>
        <span>▸ DIAGNOSIS</span>
        {is_novel && (
          <span style={{
            padding: '3px 8px',
            background: '#6B3E8C',
            color: '#FAF6EC',
            border: '2px solid #221E18',
            fontFamily: pixel,
            fontSize: 10,
            letterSpacing: '0.18em',
          }}>
            ✦ ORIGINAL THINKING
          </span>
        )}
      </div>

      {diagnosis && (
        <p style={{
          fontFamily: serif,
          fontSize: 16.5,
          color: '#221E18',
          margin: '0 0 14px',
          lineHeight: 1.6,
        }}>
          {diagnosis}
        </p>
      )}

      {hasPhilosophers && kinship && (
        <>
          <div style={{
            fontFamily: pixel, fontSize: 10.5,
            color: '#8C6520', textTransform: 'uppercase',
            letterSpacing: '0.18em', marginBottom: 10, marginTop: 16,
          }}>
            KINDRED THINKERS
          </div>
          <ul style={{
            listStyle: 'none', padding: 0, margin: 0,
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            {kinship.philosophers.map(kp => (
              <li key={kp.slug}>
                <Link
                  href={`/philosopher/${kp.slug}`}
                  style={{
                    textDecoration: 'none',
                    color: 'inherit',
                    display: 'block',
                    padding: '11px 14px',
                    background: '#FAF6EC',
                    border: '3px solid #221E18',
                    boxShadow: '3px 3px 0 0 #B8862F',
                    borderRadius: 0,
                    transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end)',
                  }}
                  className="pixel-press"
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    gap: 10,
                    marginBottom: 4,
                  }}>
                    <span style={{
                      fontFamily: serif, fontSize: 17, fontWeight: 500,
                      color: '#221E18',
                    }}>{kp.name}</span>
                    {kp.similarity > 0 && (
                      <span style={{
                        fontFamily: pixel, fontSize: 11, color: '#8C6520',
                        fontVariantNumeric: 'tabular-nums', letterSpacing: 0.4,
                      }}>
                        {Math.round(kp.similarity * 100)}% KIN
                      </span>
                    )}
                  </div>
                  {kp.why && (
                    <p style={{
                      fontFamily: serif, fontStyle: 'italic',
                      fontSize: 14.5, color: '#4A4338',
                      margin: 0, lineHeight: 1.5,
                    }}>
                      {kp.why}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}

      {hasEchoes && kinship && kinship.echoes && (
        <>
          <div style={{
            fontFamily: pixel, fontSize: 10.5,
            color: '#8C6520', textTransform: 'uppercase',
            letterSpacing: '0.18em', marginBottom: 10, marginTop: 16,
          }}>
            ALSO ECHOES
          </div>
          <ul style={{
            listStyle: 'none', padding: 0, margin: 0,
            display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            {kinship.echoes.map(kp => (
              <li key={kp.slug}>
                <Link
                  href={`/philosopher/${kp.slug}`}
                  style={{
                    textDecoration: 'none',
                    color: 'inherit',
                    display: 'block',
                    padding: '8px 12px',
                    background: '#FAF6EC',
                    border: '2px dashed #8C6520',
                    borderRadius: 0,
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    gap: 10,
                    marginBottom: 2,
                  }}>
                    <span style={{
                      fontFamily: serif, fontSize: 15, fontWeight: 500,
                      color: '#221E18',
                    }}>{kp.name}</span>
                    {kp.similarity > 0 && (
                      <span style={{
                        fontFamily: pixel, fontSize: 10.5, color: '#8C6520',
                        fontVariantNumeric: 'tabular-nums', letterSpacing: 0.4,
                        opacity: 0.85,
                      }}>
                        {Math.round(kp.similarity * 100)}%
                      </span>
                    )}
                  </div>
                  {kp.why && (
                    <p style={{
                      fontFamily: serif, fontStyle: 'italic',
                      fontSize: 13.5, color: '#4A4338',
                      margin: 0, lineHeight: 1.45,
                    }}>
                      {kp.why}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}

      {hasTraditions && kinship && (
        <>
          <div style={{
            fontFamily: pixel, fontSize: 10.5,
            color: '#8C6520', textTransform: 'uppercase',
            letterSpacing: '0.18em', marginBottom: 10, marginTop: 16,
          }}>
            TRADITIONS
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {kinship.traditions.map(tr => (
              <span key={tr} style={{
                padding: '5px 12px',
                background: accentSoft,
                border: `2px solid ${accent}`,
                borderRadius: 0,
                fontFamily: pixel, fontSize: 11, color: accent,
                letterSpacing: 0.4, textTransform: 'uppercase',
              }}>
                {tr}
              </span>
            ))}
          </div>
        </>
      )}

      {is_novel && !hasPhilosophers && !hasEchoes && (
        <p style={{
          fontFamily: serif, fontStyle: 'italic',
          fontSize: 15, color: '#6B3E8C',
          margin: '14px 0 0', lineHeight: 1.55,
        }}>
          No philosopher in our database voices this move strongly.
          That doesn&rsquo;t mean it&rsquo;s untouched ground, but it&rsquo;s outside
          the canon as Mull currently maps it. Worth following.
        </p>
      )}
    </div>
  );
}
