'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { t, type Locale } from '@/lib/translations';

const sans = "'Inter', system-ui, sans-serif";

export default function DiaryEntryActions({ entryId, locale = 'en' }: { entryId: string; locale?: Locale }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onDelete() {
    if (!window.confirm(t('diary.delete_confirm', locale))) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch('/api/diary/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: entryId })
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error || t('profile.could_not_delete', locale));
        setDeleting(false);
        return;
      }
      router.push('/diary');
      router.refresh();
    } catch (err) {
      console.error(err);
      setError(t('profile.network_error', locale));
      setDeleting(false);
    }
  }

  return (
    <div style={{
      marginTop: 40,
      paddingTop: 24,
      borderTop: '1px solid #EBE3CA',
      display: 'flex',
      gap: 12,
      flexWrap: 'wrap',
    }}>
      <Link href="/diary" style={{
        padding: '10px 20px',
        background: '#221E18',
        color: '#FAF6EC',
        borderRadius: 6,
        textDecoration: 'none',
        fontFamily: sans,
        fontSize: 14,
        fontWeight: 500,
      }}>
        {t('nav.all_entries', locale)}
      </Link>
      <Link href="/account" style={{
        padding: '10px 20px',
        border: '1px solid #221E18',
        color: '#221E18',
        borderRadius: 6,
        textDecoration: 'none',
        fontFamily: sans,
        fontSize: 14,
      }}>
        {t('diary.see_trajectory', locale)}
      </Link>
      <button
        type="button"
        onClick={onDelete}
        disabled={deleting}
        style={{
          padding: '10px 20px',
          border: '1px solid #C7522A',
          color: '#C7522A',
          background: 'transparent',
          borderRadius: 6,
          fontFamily: sans,
          fontSize: 14,
          cursor: deleting ? 'wait' : 'pointer',
          marginLeft: 'auto',
        }}
      >
        {deleting ? t('diary.deleting', locale) : t('diary.delete_entry', locale)}
      </button>
      {error && (
        <div style={{
          width: '100%',
          fontFamily: sans,
          fontSize: 13,
          color: '#7A2E2E',
          marginTop: 8,
        }}>
          {error}
        </div>
      )}
    </div>
  );
}
