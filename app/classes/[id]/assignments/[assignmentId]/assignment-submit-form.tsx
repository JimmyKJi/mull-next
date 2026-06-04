'use client';

// Student-side assignment submit form. UPSERT semantics — re-submit
// overwrites. Prefilled if the student already submitted.

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { t, type Locale } from '@/lib/translations';

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";
const serif = "var(--font-prose)";

export default function AssignmentSubmitForm({
  classId,
  assignmentId,
  existingText,
  existingSubmittedAt,
  locale,
}: {
  classId: string;
  assignmentId: string;
  existingText: string;
  existingSubmittedAt: string | null;
  locale: Locale;
}) {
  const router = useRouter();
  const [text, setText] = useState(existingText);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(existingSubmittedAt);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/classes/${classId}/assignments/${assignmentId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response_text: text }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error || t('cls.submit_error', locale));
        setSubmitting(false);
        return;
      }
      setSavedAt(new Date().toISOString());
      setSubmitting(false);
      router.refresh();
    } catch {
      setError(t('cls.network_error', locale));
      setSubmitting(false);
    }
  }

  return (
    <form className="pixel-form" onSubmit={onSubmit} style={{ display: 'grid', gap: 14 }}>
      <div style={{
        fontFamily: pixel,
        fontSize: 12,
        color: savedAt ? '#2F5D5C' : '#8C6520',
        textTransform: 'uppercase',
        letterSpacing: '0.18em',
        marginBottom: 0,
      }}>
        {savedAt
          ? t('cls.submitted_at', locale, {
              date: new Date(savedAt).toLocaleString(locale === 'zh' ? 'zh-CN' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' }),
            })
          : `▸ ${t('cls.your_response', locale)}`}
      </div>

      <textarea
        rows={10}
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder={t('cls.response_ph', locale)}
        maxLength={8000}
        required
        style={{ resize: 'vertical', minHeight: 220 }}
      />

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <span style={{
          fontFamily: pixel,
          fontSize: 11,
          color: '#8C6520',
          letterSpacing: 0.4,
          textTransform: 'uppercase',
        }}>
          {text.length} / 8000
        </span>
        <button type="submit" disabled={submitting || !text.trim()}>
          {submitting
            ? t('cls.saving', locale)
            : (savedAt ? t('cls.update_response', locale) : t('cls.submit_response', locale))}
        </button>
      </div>

      {error && <p className="pixel-alert pixel-alert--error" role="alert">{error}</p>}

      {savedAt && (
        <p style={{
          fontFamily: serif,
          fontStyle: 'italic',
          fontSize: 13.5,
          color: '#8C6520',
          margin: 0,
          padding: '10px 12px',
          background: '#E5F0EE',
          border: '2px solid #2F5D5C',
        }}>
          {t('cls.saved_note', locale)}
        </p>
      )}

      {/* Honest disclosure: a heuristic AI-pattern scan runs on
          submissions so teachers see a "patterns we noticed" signal.
          Telling students up front means no surprise + the framing
          stays accurate ("we look for patterns, not run a verdict"). */}
      <p style={{
        fontFamily: serif,
        fontSize: 12.5,
        color: '#8C6520',
        margin: 0,
        lineHeight: 1.5,
      }}>
        {t('cls.ai_disclosure', locale)}
      </p>
    </form>
  );
}
