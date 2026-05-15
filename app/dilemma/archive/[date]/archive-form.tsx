// Past-dilemma submission form. Mirrors the today form (DilemmaForm), but
// posts to /api/dilemma/submit-archive with target_date so the response is
// saved against the historical date. On success, redirects to /account so
// the user can see it land in their trajectory.

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { t, type Locale } from '@/lib/translations';

const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'Inter', system-ui, sans-serif";

export default function DilemmaArchiveForm({
  targetDate,
  locale = 'en',
}: {
  targetDate: string;
  locale?: Locale;
}) {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;
  const tooShort = charCount > 0 && charCount < 30;
  const ready = charCount >= 30 && charCount <= 4000;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ready || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/dilemma/submit-archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response_text: text, target_date: targetDate }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error || 'Could not save your response.');
        setSubmitting(false);
        return;
      }
      // Redirect to /account where the new trajectory point shows.
      router.push('/account');
      router.refresh();
    } catch (err) {
      console.error(err);
      setError('Network error. Try again.');
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="pixel-form" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t('dilemma.placeholder', locale)}
        rows={10}
        maxLength={4000}
        style={{
          fontFamily: serif,
          fontSize: 17,
          lineHeight: 1.6,
          padding: '20px 22px',
          border: '1px solid #D6CDB6',
          borderRadius: 12,
          background: '#FFFCF4',
          color: '#221E18',
          outline: 'none',
          resize: 'vertical',
          minHeight: 200,
        }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{
          height: 3, background: '#EBE3CA', borderRadius: 2, overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${Math.min(100, (charCount / 4000) * 100)}%`,
            background: charCount < 30 ? '#D6CDB6' : charCount > 3700 ? '#C7522A' : '#B8862F',
            transition: 'width 0.18s ease, background 0.2s ease',
          }} />
        </div>
      </div>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', gap: 12, flexWrap: 'wrap',
      }}>
        <span style={{
          fontFamily: sans, fontSize: 12,
          color: tooShort ? '#7A2E2E' : '#8C6520', letterSpacing: 0.3,
        }}>
          {wordCount} {t(wordCount === 1 ? 'dilemma.words' : 'dilemma.words_plural', locale)} · {charCount}/4000
          {tooShort ? ' · ' + t('dilemma.too_short', locale) : ''}
        </span>
        <button
          type="submit"
          disabled={!ready || submitting}
          style={{
            fontFamily: sans, fontSize: 14.5, fontWeight: 500,
            padding: '12px 24px',
            background: ready ? '#221E18' : '#A39880',
            color: '#FAF6EC', border: 'none', borderRadius: 8,
            cursor: ready && !submitting ? 'pointer' : 'not-allowed',
            opacity: submitting ? 0.7 : 1, letterSpacing: 0.4,
          }}
        >
          {submitting ? t('dilemma.analyzing', locale) : t('archive.submit_past', locale)}
        </button>
      </div>
      {error && (
        <div style={{
          fontFamily: sans, fontSize: 13, color: '#7A2E2E',
          background: 'rgba(122, 46, 46, 0.08)',
          border: '1px solid rgba(122, 46, 46, 0.2)',
          padding: '10px 14px', borderRadius: 6,
        }}>
          {error}
        </div>
      )}
    </form>
  );
}
