'use client';

// /login — v3 pixel chrome restyle. Pixel form panel, pixel button.
// All functionality (Supabase signInWithPassword, locale cookie
// reading, error display, redirect to /account) preserved.

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { t, type Locale, isLocale } from '@/lib/translations';

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
    <main className="mx-auto flex min-h-[calc(100vh-64px)] max-w-[480px] flex-col px-6 pb-32 pt-12 sm:pt-16">
      <div
        className="border-4 border-ink bg-[#FFFCF4]"
        style={{ boxShadow: '6px 6px 0 0 var(--color-acc-deep)' }}
      >
        {/* Title bar */}
        <div
          className="flex items-center justify-between border-b-4 border-ink bg-ink px-4 py-2 text-[10px] tracking-[0.22em] text-acc-soft"
          style={{ fontFamily: 'var(--font-pixel-display)' }}
        >
          <span>▶ {t('auth.signin', locale).toUpperCase()}</span>
          <span className="text-acc">AUTH.SYS</span>
        </div>

        <div className="px-6 py-7 sm:px-8">
          <h1
            className="text-[26px] leading-[1.1] tracking-[0.04em] text-ink sm:text-[36px]"
            style={{ fontFamily: 'var(--font-pixel-display)' }}
          >
            <span style={{ textShadow: '3px 3px 0 var(--color-acc)' }}>
              {t('auth.welcome_back', locale).toUpperCase()}
            </span>
          </h1>
          <p
            className="mt-4 text-[15px] italic leading-[1.5] text-ink-soft"
            style={{ fontFamily: 'var(--font-prose)' }}
          >
            {t('auth.signin_subtitle', locale)}
          </p>

          <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-5">
            <label className="flex flex-col gap-1.5 text-[12px] tracking-[0.18em] text-acc-deep" style={{ fontFamily: 'var(--font-pixel-display)' }}>
              {t('auth.email', locale).toUpperCase()}
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="border-2 border-ink bg-[#FFFCF4] px-3 py-2.5 text-[16px] text-ink focus:bg-acc-soft focus:outline-none"
                style={{ fontFamily: 'var(--font-prose)' }}
              />
            </label>

            <label className="flex flex-col gap-1.5 text-[12px] tracking-[0.18em] text-acc-deep" style={{ fontFamily: 'var(--font-pixel-display)' }}>
              {t('auth.password', locale).toUpperCase()}
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="border-2 border-ink bg-[#FFFCF4] px-3 py-2.5 text-[16px] text-ink focus:bg-acc-soft focus:outline-none"
                style={{ fontFamily: 'var(--font-prose)' }}
              />
            </label>

            {error ? (
              <p className="pixel-alert pixel-alert--error" role="alert">
                ▶ {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="pixel-button pixel-button--amber justify-center disabled:cursor-wait disabled:opacity-70"
            >
              <span>
                ▶ {loading
                  ? t('auth.signing_in', locale).toUpperCase()
                  : t('auth.signin', locale).toUpperCase()}
              </span>
            </button>
          </form>
        </div>

        <div
          className="border-t-2 border-ink bg-acc-soft px-6 py-3 text-center text-[13px] text-ink-soft sm:px-8"
        >
          {t('auth.no_account', locale)}{' '}
          <Link
            href="/signup"
            className="font-medium text-acc-deep underline decoration-acc/40 underline-offset-3 hover:decoration-acc-deep"
          >
            {t('auth.create_one', locale)} →
          </Link>
        </div>
      </div>
    </main>
  );
}
