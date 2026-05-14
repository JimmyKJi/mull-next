'use client';

// /login — v3 pixel chrome restyle. Pixel form panel, pixel button.
// All functionality (Supabase signInWithPassword, locale cookie
// reading, error display, redirect to /account) preserved.

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { t, type Locale, isLocale } from '@/lib/translations';
import LanguageSwitcher from '@/components/language-switcher';

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
      <div className="mb-6 flex justify-end">
        <LanguageSwitcher initial={locale} />
      </div>

      <div
        className="border-4 border-[#221E18] bg-[#FFFCF4]"
        style={{ boxShadow: '6px 6px 0 0 #8C6520' }}
      >
        {/* Title bar */}
        <div
          className="flex items-center justify-between border-b-4 border-[#221E18] bg-[#221E18] px-4 py-2 text-[10px] tracking-[0.22em] text-[#F8EDC8]"
          style={{ fontFamily: 'var(--font-pixel-display)' }}
        >
          <span>▶ SIGN IN</span>
          <span className="text-[#B8862F]">AUTH.SYS</span>
        </div>

        <div className="px-6 py-7 sm:px-8">
          <h1
            className="text-[26px] leading-[1.1] tracking-[0.04em] text-[#221E18] sm:text-[36px]"
            style={{ fontFamily: 'var(--font-pixel-display)' }}
          >
            <span style={{ textShadow: '3px 3px 0 #B8862F' }}>
              {t('auth.welcome_back', locale).toUpperCase()}
            </span>
          </h1>
          <p
            className="mt-4 text-[15px] italic leading-[1.5] text-[#4A4338]"
            style={{ fontFamily: 'var(--font-prose)' }}
          >
            {t('auth.signin_subtitle', locale)}
          </p>

          <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-5">
            <label className="flex flex-col gap-1.5 text-[12px] tracking-[0.18em] text-[#8C6520]" style={{ fontFamily: 'var(--font-pixel-display)' }}>
              {t('auth.email', locale).toUpperCase()}
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="border-2 border-[#221E18] bg-[#FFFCF4] px-3 py-2.5 text-[16px] text-[#221E18] focus:bg-[#F8EDC8] focus:outline-none"
                style={{ fontFamily: 'var(--font-prose)' }}
              />
            </label>

            <label className="flex flex-col gap-1.5 text-[12px] tracking-[0.18em] text-[#8C6520]" style={{ fontFamily: 'var(--font-pixel-display)' }}>
              {t('auth.password', locale).toUpperCase()}
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="border-2 border-[#221E18] bg-[#FFFCF4] px-3 py-2.5 text-[16px] text-[#221E18] focus:bg-[#F8EDC8] focus:outline-none"
                style={{ fontFamily: 'var(--font-prose)' }}
              />
            </label>

            {error ? (
              <div
                className="border-2 border-[#7A2E2E] bg-[#F5DCD0] px-3 py-2 text-[13px] text-[#7A2E2E]"
                style={{ boxShadow: '2px 2px 0 0 #7A2E2E' }}
              >
                ▶ {error}
              </div>
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
          className="border-t-2 border-[#221E18] bg-[#F8EDC8] px-6 py-3 text-center text-[13px] text-[#4A4338] sm:px-8"
        >
          {t('auth.no_account', locale)}{' '}
          <Link
            href="/signup"
            className="font-medium text-[#8C6520] underline decoration-[#B8862F]/40 underline-offset-3 hover:decoration-[#8C6520]"
          >
            {t('auth.create_one', locale)} →
          </Link>
        </div>
      </div>
    </main>
  );
}
