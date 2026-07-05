'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LOCALES, LOCALE_LABELS, type Locale, isLocale, t } from '@/lib/translations';

const sans = "'Inter', system-ui, sans-serif";

export default function LanguageSwitcher({ initial = 'en' }: { initial?: Locale }) {
  const [locale, setLocale] = useState<Locale>(initial);
  const router = useRouter();

  useEffect(() => {
    // Read cookie on client to stay synced if it changed elsewhere
    const m = document.cookie.match(/(?:^|; )mull_locale=([^;]+)/);
    const v = m?.[1];
    if (v && isLocale(v)) setLocale(v);
  }, []);

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const v = e.target.value;
    if (!isLocale(v)) return;
    setLocale(v);
    const oneYear = 60 * 60 * 24 * 365;
    // `secure` everywhere we serve https (i.e. production); omitted on
    // plain-http localhost so the cookie still sets in local dev.
    const secure = window.location.protocol === 'https:' ? '; secure' : '';
    document.cookie = `mull_locale=${v}; path=/; max-age=${oneYear}; samesite=lax${secure}`;
    router.refresh();
  }

  return (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      {/* Globe sits over the select's left padding so the control reads
          instantly as a language picker, regardless of which language
          name is currently selected. */}
      <span
        aria-hidden
        style={{
          position: 'absolute',
          left: 9,
          fontSize: 14,
          lineHeight: 1,
          pointerEvents: 'none',
        }}
      >
        🌐
      </span>
      <select
        value={locale}
        onChange={onChange}
        title={t('a11y.language', locale)}
        aria-label={t('a11y.choose_language', locale)}
        style={{
          fontFamily: sans,
          fontSize: 13,
          fontWeight: 500,
          // Extra left padding clears the globe; the native dropdown
          // arrow sits at the right.
          padding: '7px 8px 7px 31px',
          background: '#FFFCF4',
          border: '2px solid var(--color-ink)',
          borderRadius: 0,
          color: 'var(--color-ink)',
          cursor: 'pointer',
        }}
      >
        {LOCALES.map((loc) => (
          <option key={loc} value={loc}>
            {LOCALE_LABELS[loc].native}
          </option>
        ))}
      </select>
    </span>
  );
}
