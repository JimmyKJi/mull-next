'use client';

// Student-side assignment submit form. UPSERT semantics — re-submit
// overwrites. Prefilled if the student already submitted.

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";
const serif = "'Cormorant Garamond', Georgia, serif";

export default function AssignmentSubmitForm({
  classId,
  assignmentId,
  existingText,
  existingSubmittedAt,
}: {
  classId: string;
  assignmentId: string;
  existingText: string;
  existingSubmittedAt: string | null;
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
        setError(json?.error || 'Could not save response.');
        setSubmitting(false);
        return;
      }
      setSavedAt(new Date().toISOString());
      setSubmitting(false);
      router.refresh();
    } catch {
      setError('Network error.');
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
          ? `✓ SUBMITTED ${new Date(savedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}`
          : '▸ YOUR RESPONSE'}
      </div>

      <textarea
        rows={10}
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Write your response here. You can edit and re-submit until your teacher marks it reviewed."
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
            ? 'Saving…'
            : (savedAt ? 'Update response' : 'Submit response')}
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
          Your response is saved. You can come back and edit it any time until
          your instructor reviews the submission.
        </p>
      )}
    </form>
  );
}
