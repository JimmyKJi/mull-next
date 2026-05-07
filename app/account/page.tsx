import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import LogoutButton from './logout-button';

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: attempts } = await supabase
    .from('quiz_attempts')
    .select('id, archetype, flavor, alignment_pct, taken_at')
    .order('taken_at', { ascending: false })
    .limit(20);

  const latest = attempts?.[0];
  const older = attempts?.slice(1) ?? [];

  const fmt = (s: string) =>
    new Date(s).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });

  const serif = "'Cormorant Garamond', Georgia, serif";
  const sans = "'Inter', system-ui, sans-serif";

  return (
    <main style={{ maxWidth: 720, margin: '60px auto', padding: '0 24px' }}>
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
        <LogoutButton />
      </header>

      <h1 style={{
        fontFamily: serif,
        fontSize: 42,
        fontWeight: 500,
        margin: '0 0 8px',
        letterSpacing: '-0.5px'
      }}>
        Your account
      </h1>
      <p style={{
        fontFamily: sans,
        fontSize: 15,
        color: '#4A4338',
        marginBottom: 40
      }}>
        Signed in as <strong>{user.email}</strong>
      </p>

      <section style={{ marginBottom: 48 }}>
        <h2 style={{
          fontFamily: serif,
          fontStyle: 'italic',
          fontSize: 22,
          fontWeight: 500,
          color: '#4A4338',
          marginBottom: 16
        }}>
          Latest result
        </h2>

        {latest ? (
          <div style={{
            border: '1px solid #D6CDB6',
            borderRadius: 12,
            padding: '28px 32px',
            background: '#FFFCF4'
          }}>
            <div style={{
              fontFamily: serif,
              fontSize: 36,
              fontWeight: 500,
              letterSpacing: '-0.5px',
              marginBottom: 10
            }}>
              {latest.flavor ? `${latest.flavor} ` : ''}
              {latest.archetype.replace(/^The /, '')}
            </div>
            <div style={{
              fontFamily: sans,
              fontSize: 13,
              color: '#8C6520',
              letterSpacing: 1,
              textTransform: 'uppercase',
              marginBottom: 24
            }}>
              {latest.alignment_pct}% alignment · {fmt(latest.taken_at)}
            </div>
            <Link href="/" style={{
              display: 'inline-block',
              padding: '10px 20px',
              border: '1px solid #221E18',
              borderRadius: 6,
              color: '#221E18',
              textDecoration: 'none',
              fontFamily: sans,
              fontSize: 14
            }}>
              Take it again →
            </Link>
          </div>
        ) : (
          <div style={{
            border: '1px dashed #D6CDB6',
            borderRadius: 12,
            padding: '36px 28px',
            textAlign: 'center',
            color: '#4A4338',
            background: '#FFFCF4'
          }}>
            <p style={{
              margin: '0 0 16px',
              fontFamily: serif,
              fontStyle: 'italic',
              fontSize: 20
            }}>
              You haven't taken the quiz yet.
            </p>
            <Link href="/" style={{
              display: 'inline-block',
              padding: '10px 20px',
              border: '1px solid #221E18',
              borderRadius: 6,
              color: '#221E18',
              textDecoration: 'none',
              fontFamily: sans,
              fontSize: 14
            }}>
              Take the quiz →
            </Link>
          </div>
        )}
      </section>

      {older.length > 0 && (
        <section>
          <h2 style={{
            fontFamily: serif,
            fontStyle: 'italic',
            fontSize: 22,
            fontWeight: 500,
            color: '#4A4338',
            marginBottom: 8
          }}>
            Earlier results
          </h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {older.map(a => (
              <li key={a.id} style={{
                padding: '16px 0',
                borderTop: '1px solid #EBE3CA',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                gap: 16,
                flexWrap: 'wrap'
              }}>
                <span style={{ fontFamily: serif, fontSize: 20, fontWeight: 500 }}>
                  {a.flavor ? `${a.flavor} ` : ''}
                  {a.archetype.replace(/^The /, '')}
                  <span style={{
                    fontFamily: sans,
                    fontSize: 13,
                    color: '#8C6520',
                    marginLeft: 10,
                    letterSpacing: 1
                  }}>
                    {a.alignment_pct}%
                  </span>
                </span>
                <span style={{
                  fontFamily: sans,
                  fontSize: 13,
                  color: '#8C6520'
                }}>
                  {fmt(a.taken_at)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}