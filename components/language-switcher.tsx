'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LOCALES, LOCALE_LABELS, type Locale, isLocale } from '@/lib/translations';

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
    document.cookie = `mull_locale=${v}; path=/; max-age=${oneYear}; samesite=lax`;
    router.refresh();
  }

  return (
    <select
      value={locale}
      onChange={onChange}
      title="Language"
      aria-label="Choose language"
      style={{
        fontFamily: sans,
        fontSize: 12,
        padding: '4px 8px',
        background: 'transparent',
        border: '1px solid #D6CDB6',
        borderRadius: 6,
        color: '#4A4338',
        cursor: 'pointer',
      }}
    >
      {LOCALES.map(loc => (
        <option key={loc} value={loc}>
          {LOCALE_LABELS[loc].native}
        </option>
      ))}
    </select>
  );
}
