import { createClient } from '@/utils/supabase/server';
import { getDailyDilemma } from '@/lib/dilemmas';
import { topShifts } from '@/lib/dimensions';
import Link from 'next/link';
import DilemmaForm from './dilemma-form';

const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'Inter', system-ui, sans-serif";

type ExistingResponse = {
  id: string;
  question_text: string;
  response_text: string;
  vector_delta: number[] | null;
  analysis: string | null;
  created_at: string;
};

export default async function DilemmaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const today = getDailyDilemma();

  let existing: ExistingResponse | null = null;
  if (user) {
    const { data } = await supabase
      .from('dilemma_responses')
      .select('id, question_text, response_text, vector_delta, analysis, created_at')
      .eq('user_id', user.id)
      .eq('dilemma_date', today.dateKey)
      .maybeSingle<ExistingResponse>();
    existing = data;
  }

  const shifts = existing?.vector_delta ? topShifts(existing.vector_delta) : [];

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '60px 24px 120px' }}>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 36,
        gap: 16,
        flexWrap: 'wrap'
      }}>
        <Link href="/" style={{
          fontFamily: serif,
          fontSize: 28,
          fontWeight: 500,
          color: '#221E18',
          textDecoration: 'none',
          letterSpacing: '-0.5px'
        }}>
          Mull<span style={{ color: '#B8862F' }}>.</span>
        </Link>
        <nav style={{ display: 'flex', gap: 16 }}>
          <Link href="/account" style={{
            fontFamily: sans, fontSize: 13, color: '#4A4338',
            textDecoration: 'none', letterSpacing: 0.3,
          }}>Your account →</Link>
        </nav>
      </header>

      <div style={{
        fontFamily: sans,
        fontSize: 11,
        fontWeight: 600,
        color: '#8C6520',
        textTransform: 'uppercase',
        letterSpacing: '0.18em',
        marginBottom: 14,
      }}>
        Daily dilemma · {new Date(today.dateKey).toLocaleDateString('en-GB', {
          weekday: 'long', day: 'numeric', month: 'long'
        })}
      </div>

      <h1 style={{
        fontFamily: serif,
        fontSize: 38,
        fontWeight: 500,
        margin: '0 0 16px',
        letterSpacing: '-0.01em',
        lineHeight: 1.2,
      }}>
        {today.dilemma.prompt}
      </h1>

      {today.dilemma.hint && (
        <p style={{
          fontFamily: serif,
          fontStyle: 'italic',
          fontSize: 17,
          color: '#4A4338',
          marginBottom: 32,
        }}>
          {today.dilemma.hint}
        </p>
      )}

      {!user ? (
        <div style={{
          padding: '28px 32px',
          background: '#FFFCF4',
          border: '1px dashed #D6CDB6',
          borderRadius: 12,
          textAlign: 'center',
        }}>
          <p style={{
            fontFamily: serif,
            fontStyle: 'italic',
            fontSize: 18,
            color: '#4A4338',
            margin: '0 0 16px',
          }}>
            The daily dilemma needs an account to track shifts in your worldview.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/signup" style={{
              padding: '10px 20px',
              background: '#221E18',
              color: '#FAF6EC',
              borderRadius: 6,
              textDecoration: 'none',
              fontFamily: sans,
              fontSize: 14,
              fontWeight: 500,
            }}>
              Create an account
            </Link>
            <Link href="/login" style={{
              padding: '10px 20px',
              border: '1px solid #221E18',
              color: '#221E18',
              borderRadius: 6,
              textDecoration: 'none',
              fontFamily: sans,
              fontSize: 14,
            }}>
              Sign in
            </Link>
          </div>
        </div>
      ) : existing ? (
        <div style={{
          padding: '28px 32px',
          background: '#FFFCF4',
          border: '1px solid #D6CDB6',
          borderLeft: '3px solid #B8862F',
          borderRadius: 8,
        }}>
          <div style={{
            fontFamily: sans,
            fontSize: 11,
            fontWeight: 600,
            color: '#2F5D5C',
            textTransform: 'uppercase',
            letterSpacing: '0.16em',
            marginBottom: 14,
          }}>
            ✓ You answered today
          </div>
          <p style={{
            fontFamily: serif,
            fontSize: 17,
            color: '#221E18',
            lineHeight: 1.6,
            margin: '0 0 18px',
            whiteSpace: 'pre-wrap',
          }}>
            {existing.response_text}
          </p>
          {existing.analysis && (
            <div style={{
              padding: '14px 16px',
              background: '#F5EFDC',
              borderRadius: 6,
              marginBottom: 16,
            }}>
              <div style={{
                fontFamily: sans,
                fontSize: 10,
                fontWeight: 600,
                color: '#8C6520',
                textTransform: 'uppercase',
                letterSpacing: '0.16em',
                marginBottom: 6,
              }}>
                What this revealed
              </div>
              <p style={{
                fontFamily: serif,
                fontStyle: 'italic',
                fontSize: 16,
                color: '#221E18',
                margin: 0,
                lineHeight: 1.5,
              }}>
                {existing.analysis}
              </p>
            </div>
          )}
          {shifts.length > 0 && (
            <div>
              <div style={{
                fontFamily: sans,
                fontSize: 10,
                fontWeight: 600,
                color: '#8C6520',
                textTransform: 'uppercase',
                letterSpacing: '0.16em',
                marginBottom: 8,
              }}>
                Shift this added to your map
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
                {shifts.map(s => (
                  <span key={s.key} style={{
                    fontFamily: sans,
                    fontSize: 14,
                    color: s.delta > 0 ? '#2F5D5C' : '#7A2E2E',
                  }}>
                    <strong style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {s.delta > 0 ? '+' : ''}{s.delta.toFixed(1)}
                    </strong>{' '}
                    <span style={{ color: '#4A4338' }}>{s.name}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
          <div style={{
            marginTop: 22,
            paddingTop: 18,
            borderTop: '1px solid #EBE3CA',
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
          }}>
            <Link href="/account" style={{
              padding: '9px 18px',
              border: '1px solid #221E18',
              borderRadius: 6,
              color: '#221E18',
              textDecoration: 'none',
              fontFamily: sans,
              fontSize: 13.5,
            }}>
              See your trajectory →
            </Link>
            <span style={{
              fontFamily: sans,
              fontSize: 12,
              color: '#8C6520',
              alignSelf: 'center',
            }}>
              The next dilemma arrives tomorrow.
            </span>
          </div>
        </div>
      ) : (
        <DilemmaForm questionPrompt={today.dilemma.prompt} />
      )}

      <p style={{
        fontFamily: sans,
        fontSize: 12,
        color: '#8C6520',
        marginTop: 48,
        opacity: 0.75,
        textAlign: 'center',
        letterSpacing: 0.3,
      }}>
        Each daily dilemma is a single question, the same for everyone today, asked again with a new question tomorrow.
      </p>
    </main>
  );
}
