'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { t, type Locale, isLocale } from '@/lib/translations';
import LanguageSwitcher from '@/components/language-switcher';

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

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [locale, setLocale] = useState<Locale>('en');
  const router = useRouter();

  useEffect(() => {
    const m = document.cookie.match(/(?:^|; )mull_locale=([^;]+)/);
    const v = m?.[1];
    if (v && isLocale(v)) setLocale(v);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }
    router.push('/account');
    router.refresh();
  }

  return (
    <main style={{
      maxWidth: 420,
      margin: '0 auto',
      padding: '60px 24px',
      minHeight: '100vh',
    }}>
      <header style={{
        marginBottom: 48,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
      }}>
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
        <LanguageSwitcher initial={locale} />
      </header>

      <h1 style={{
        fontFamily: serif,
        fontSize: 42,
        fontWeight: 500,
        margin: '0 0 8px',
        letterSpacing: '-0.5px',
      }}>
        {t('auth.welcome_back', locale)}
      </h1>
      <p style={{
        fontFamily: serif,
        fontStyle: 'italic',
        fontSize: 18,
        color: '#4A4338',
        marginBottom: 36,
      }}>
        {t('auth.signin_subtitle', locale)}
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <label style={labelStyle}>
          {t('auth.email', locale)}
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
          {t('auth.password', locale)}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            style={inputStyle}
          />
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
          {loading ? t('auth.signing_in', locale) : t('auth.signin', locale)}
        </button>
      </form>

      <p style={{
        fontFamily: sans,
        fontSize: 14,
        color: '#4A4338',
        marginTop: 32,
        textAlign: 'center',
      }}>
        {t('auth.no_account', locale)}{' '}
        <Link href="/signup" style={{ color: '#8C6520', textDecoration: 'underline', textUnderlineOffset: 3 }}>
          {t('auth.create_one', locale)}
        </Link>
      </p>
    </main>
  );
}