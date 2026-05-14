'use client';

// /signup — v3 pixel chrome restyle.
// Same Supabase signUp flow, locale cookie reading, "check your
// email" confirm state. Just visual rework.

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { t, type Locale, isLocale } from '@/lib/translations';
import LanguageSwitcher from '@/components/language-switcher';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmSent, setConfirmSent] = useState(false);
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
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo:
          typeof window !== 'undefined'
            ? `${window.location.origin}/account`
            : undefined,
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
          <span>▶ {confirmSent ? 'CHECK YOUR EMAIL' : 'CREATE ACCOUNT'}</span>
          <span className="text-[#B8862F]">AUTH.SYS</span>
        </div>

        <div className="px-6 py-7 sm:px-8">
          {confirmSent ? (
            <ConfirmState
              email={email}
              locale={locale}
              onTryAgain={() => {
                setConfirmSent(false);
                setError(null);
              }}
            />
          ) : (
            <>
              <h1
                className="text-[24px] leading-[1.1] tracking-[0.04em] text-[#221E18] sm:text-[32px]"
                style={{ fontFamily: 'var(--font-pixel-display)' }}
              >
                <span style={{ textShadow: '3px 3px 0 #B8862F' }}>
                  {t('auth.create_account', locale).toUpperCase()}
                </span>
              </h1>
              <p
                className="mt-4 text-[15px] italic leading-[1.5] text-[#4A4338]"
                style={{ fontFamily: 'var(--font-prose)' }}
              >
                {t('auth.signup_subtitle', locale)}
              </p>

              <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-5">
                <label
                  className="flex flex-col gap-1.5 text-[12px] tracking-[0.18em] text-[#8C6520]"
                  style={{ fontFamily: 'var(--font-pixel-display)' }}
                >
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

                <label
                  className="flex flex-col gap-1.5 text-[12px] tracking-[0.18em] text-[#8C6520]"
                  style={{ fontFamily: 'var(--font-pixel-display)' }}
                >
                  {t('auth.password', locale).toUpperCase()}
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    minLength={6}
                    className="border-2 border-[#221E18] bg-[#FFFCF4] px-3 py-2.5 text-[16px] text-[#221E18] focus:bg-[#F8EDC8] focus:outline-none"
                    style={{ fontFamily: 'var(--font-prose)' }}
                  />
                  <span className="mt-1 text-[11.5px] tracking-normal text-[#8C6520]" style={{ fontFamily: 'var(--font-prose)' }}>
                    {t('auth.password_hint', locale)}
                  </span>
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
                    ▶{' '}
                    {loading
                      ? t('auth.creating', locale).toUpperCase()
                      : t('auth.create_account', locale).toUpperCase()}
                  </span>
                </button>
              </form>
            </>
          )}
        </div>

        <div className="border-t-2 border-[#221E18] bg-[#F8EDC8] px-6 py-3 text-center text-[13px] text-[#4A4338] sm:px-8">
          {t('auth.already_account', locale)}{' '}
          <Link
            href="/login"
            className="font-medium text-[#8C6520] underline decoration-[#B8862F]/40 underline-offset-3 hover:decoration-[#8C6520]"
          >
            {t('auth.signin', locale)} →
          </Link>
        </div>
      </div>
    </main>
  );
}

function ConfirmState({
  email,
  locale,
  onTryAgain,
}: {
  email: string;
  locale: Locale;
  onTryAgain: () => void;
}) {
  const body = t('auth.check_email_body', locale, { email: '' });
  const [before, after] = body.split('{email}');
  return (
    <>
      <h1
        className="text-[22px] leading-[1.1] tracking-[0.04em] text-[#221E18] sm:text-[28px]"
        style={{ fontFamily: 'var(--font-pixel-display)' }}
      >
        <span style={{ textShadow: '3px 3px 0 #B8862F' }}>
          {t('auth.check_email', locale).toUpperCase()}
        </span>
      </h1>
      <p
        className="mt-4 text-[16px] italic leading-[1.55] text-[#4A4338]"
        style={{ fontFamily: 'var(--font-prose)' }}
      >
        {before}
        <strong className="text-[#221E18]">{email}</strong>
        {after || ''}
      </p>
      <p className="mt-6 text-[13px] text-[#8C6520]">
        {t('auth.didnt_arrive', locale)}{' '}
        <button
          onClick={onTryAgain}
          className="border-0 bg-transparent p-0 text-[#8C6520] underline decoration-[#B8862F]/40 underline-offset-3 hover:decoration-[#8C6520]"
          style={{ font: 'inherit' }}
        >
          {t('auth.try_again', locale)}
        </button>
        .
      </p>
    </>
  );
}
