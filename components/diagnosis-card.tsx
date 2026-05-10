// Shared diagnosis-card for diary entries + dilemma responses.
//
// Renders the diagnosis paragraph, kindred-philosopher list (each
// linked to /philosopher/<slug> with a computed kinship %),
// tradition pills, and — when is_novel is true — a ✦ original
// thinking badge. Returns null when there's nothing to show.
//
// Pure presentational component; takes already-shaped data. Both
// surfaces (diary detail + dilemma archive) pass the same fields.

import Link from 'next/link';
import type { Kinship } from '@/lib/kinship';

const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'Inter', system-ui, sans-serif";

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

  return (
    <div style={{
      marginTop: 24,
      padding: '20px 24px',
      background: '#FFFCF4',
      border: '1px solid #EBE3CA',
      borderLeft: is_novel ? '3px solid #6B3E8C' : '3px solid #2F5D5C',
      borderRadius: 8,
    }}>
      <div style={{
        fontFamily: sans,
        fontSize: 11,
        fontWeight: 600,
        color: is_novel ? '#6B3E8C' : '#2F5D5C',
        textTransform: 'uppercase',
        letterSpacing: '0.16em',
        marginBottom: 10,
        display: 'flex',
        gap: 10,
        alignItems: 'center',
        flexWrap: 'wrap',
      }}>
        <span>Diagnosis</span>
        {is_novel && (
          <span style={{
            padding: '2px 8px',
            background: '#6B3E8C',
            color: '#FAF6EC',
            borderRadius: 999,
            fontSize: 10,
            letterSpacing: '0.18em',
          }}>
            ✦ original thinking
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
            fontFamily: sans, fontSize: 10.5, fontWeight: 600,
            color: '#8C6520', textTransform: 'uppercase',
            letterSpacing: '0.18em', marginBottom: 8, marginTop: 14,
          }}>
            Kindred thinkers
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
                    padding: '10px 14px',
                    background: '#FAF6EC',
                    border: '1px solid #EBE3CA',
                    borderRadius: 6,
                  }}
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
                        fontFamily: sans, fontSize: 11.5, color: '#8C6520',
                        fontVariantNumeric: 'tabular-nums', letterSpacing: 0.2,
                      }}>
                        {Math.round(kp.similarity * 100)}% kinship
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
            fontFamily: sans, fontSize: 10.5, fontWeight: 600,
            color: '#8C6520', textTransform: 'uppercase',
            letterSpacing: '0.18em', marginBottom: 8, marginTop: 14,
          }}>
            Also echoes
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
                    border: '1px dashed #D6CDB6',
                    borderRadius: 6,
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
                        fontFamily: sans, fontSize: 11, color: '#8C6520',
                        fontVariantNumeric: 'tabular-nums', letterSpacing: 0.2,
                        opacity: 0.75,
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
            fontFamily: sans, fontSize: 10.5, fontWeight: 600,
            color: '#8C6520', textTransform: 'uppercase',
            letterSpacing: '0.18em', marginBottom: 8, marginTop: 14,
          }}>
            Traditions
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {kinship.traditions.map(tr => (
              <span key={tr} style={{
                padding: '5px 12px',
                background: '#F1EAD8',
                border: '1px solid #E2D8B6',
                borderRadius: 999,
                fontFamily: sans, fontSize: 12.5, color: '#5C4B1F',
                letterSpacing: 0.2,
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
