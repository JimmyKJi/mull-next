'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'Inter', system-ui, sans-serif";

const inputStyle: React.CSSProperties = {
  fontFamily: sans,
  fontSize: 15,
  padding: '12px 14px',
  border: '1px solid #D6CDB6',
  borderRadius: 8,
  background: '#FFFCF4',
  color: '#221E18',
  outline: 'none',
};

const labelStyle: React.CSSProperties = {
  fontFamily: sans,
  fontSize: 13,
  color: '#4A4338',
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  letterSpacing: 0.3,
};

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmSent, setConfirmSent] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/account` : undefined,
      },
    });
    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }
    if (data.session) {
      router.push('/account');
      router.refresh();
      return;
    }
    setConfirmSent(true);
    setLoading(false);
  }

  return (
    <main style={{
      maxWidth: 420,
      margin: '0 auto',
      padding: '60px 24px',
      minHeight: '100vh',
    }}>
      <header style={{ marginBottom: 48 }}>
        <Link href="/" style={{
          fontFamily: serif,
          fontSize: 28,
          fontWeight: 500,
          color: '#221E18',
          textDecoration: 'none',
          letterSpacing: '-0.5px',
        }}>
          Mull<span style={{ color: '#B8862F' }}>.</span>
        </Link>
      </header>

      {confirmSent ? (
        <>
          <h1 style={{
            fontFamily: serif,
            fontSize: 38,
            fontWeight: 500,
            margin: '0 0 12px',
            letterSpacing: '-0.5px',
          }}>
            Check your email
          </h1>
          <p style={{
            fontFamily: serif,
            fontStyle: 'italic',
            fontSize: 19,
            color: '#4A4338',
            lineHeight: 1.5,
          }}>
            We sent a confirmation link to <strong>{email}</strong>. Click it to finish setting up your account.
          </p>
          <p style={{
            fontFamily: sans,
            fontSize: 13,
            color: '#8C6520',
            marginTop: 24,
          }}>
            Didn&apos;t arrive? Check your spam folder, or{' '}
            <button
              onClick={() => { setConfirmSent(false); setError(null); }}
              style={{
                background: 'none', border: 'none', padding: 0,
                color: '#8C6520', textDecoration: 'underline', cursor: 'pointer',
                font: 'inherit',
              }}
            >
              try again
            </button>.
          </p>
        </>
      ) : (
        <>
          <h1 style={{
            fontFamily: serif,
            fontSize: 42,
            fontWeight: 500,
            margin: '0 0 8px',
            letterSpacing: '-0.5px',
          }}>
            Create an account
          </h1>
          <p style={{
            fontFamily: serif,
            fontStyle: 'italic',
            fontSize: 18,
            color: '#4A4338',
            marginBottom: 36,
          }}>
            Save your results. Track how your stances shift over time.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <label style={labelStyle}>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                style={inputStyle}
              />
            </label>

            <label style={labelStyle}>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                minLength={6}
                style={inputStyle}
              />
              <span style={{ fontSize: 12, color: '#8C6520', marginTop: 2, letterSpacing: 0 }}>
                At least 6 characters
              </span>
            </label>

            {error && (
              <div style={{
                fontFamily: sans,
                fontSize: 13,
                color: '#7A2E2E',
                background: 'rgba(122, 46, 46, 0.08)',
                border: '1px solid rgba(122, 46, 46, 0.2)',
                padding: '10px 14px',
                borderRadius: 6,
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                fontFamily: sans,
                fontSize: 15,
                fontWeight: 500,
                padding: '14px 20px',
                background: '#221E18',
                color: '#FAF6EC',
                border: 'none',
                borderRadius: 8,
                cursor: loading ? 'wait' : 'pointer',
                opacity: loading ? 0.7 : 1,
                marginTop: 8,
                letterSpacing: 0.5,
              }}
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p style={{
            fontFamily: sans,
            fontSize: 14,
            color: '#4A4338',
            marginTop: 32,
            textAlign: 'center',
          }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#8C6520', textDecoration: 'underline', textUnderlineOffset: 3 }}>
              Sign in
            </Link>
          </p>
        </>
      )}
    </main>
  );
}