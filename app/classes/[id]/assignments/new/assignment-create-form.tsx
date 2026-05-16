'use client';

// Teacher-side assignment create form. POSTs to
// /api/classes/<id>/assignments/create and routes to the assignment
// detail page on success.

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Kind = 'dilemma' | 'exercise' | 'diary_prompt';

const KIND_OPTIONS: { value: Kind; label: string; hint: string }[] = [
  { value: 'dilemma', label: 'Dilemma', hint: 'A philosophical question students respond to in prose.' },
  { value: 'exercise', label: 'Exercise reflection', hint: 'A guided practice + a reflection prompt.' },
  { value: 'diary_prompt', label: 'Diary prompt', hint: 'Open-ended writing prompt.' },
];

export default function AssignmentCreateForm({ classId }: { classId: string }) {
  const router = useRouter();
  const [kind, setKind] = useState<Kind>('dilemma');
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [instructions, setInstructions] = useState('');
  const [dueAt, setDueAt] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !prompt.trim() || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/classes/${classId}/assignments/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind,
          title: title.trim(),
          prompt: prompt.trim(),
          instructions: instructions.trim() || null,
          due_at: dueAt ? new Date(dueAt).toISOString() : null,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error || 'Could not create assignment.');
        setSubmitting(false);
        return;
      }
      router.push(`/classes/${classId}/assignments/${json.id}`);
      router.refresh();
    } catch {
      setError('Network error.');
      setSubmitting(false);
    }
  }

  return (
    <form className="pixel-form" onSubmit={onSubmit} style={{ display: 'grid', gap: 16 }}>
      <fieldset style={{ border: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
        <legend style={{
          fontFamily: 'var(--font-pixel-display)',
          fontSize: 11,
          color: '#8C6520',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          padding: 0,
          marginBottom: 4,
        }}>
          KIND
        </legend>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {KIND_OPTIONS.map(opt => (
            <label
              key={opt.value}
              style={{
                flex: '1 1 160px',
                padding: '10px 12px',
                background: kind === opt.value ? '#F8EDC8' : '#FFFCF4',
                border: '3px solid #221E18',
                boxShadow: kind === opt.value ? '3px 3px 0 0 #B8862F' : 'none',
                cursor: 'pointer',
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 14,
              }}
            >
              <input
                type="radio"
                name="kind"
                value={opt.value}
                checked={kind === opt.value}
                onChange={() => setKind(opt.value)}
                style={{ marginRight: 8, accentColor: '#B8862F' }}
              />
              <strong>{opt.label}</strong>
              <div style={{ fontStyle: 'italic', color: '#8C6520', marginTop: 4, fontSize: 12.5 }}>
                {opt.hint}
              </div>
            </label>
          ))}
        </div>
      </fieldset>

      <label style={{ display: 'grid', gap: 6 }}>
        <span>TITLE</span>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Week 3 — Is the self an illusion?"
          maxLength={200}
          required
        />
      </label>

      <label style={{ display: 'grid', gap: 6 }}>
        <span>PROMPT</span>
        <textarea
          rows={5}
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="The question students will respond to."
          maxLength={4000}
          required
          style={{ resize: 'vertical', minHeight: 120 }}
        />
      </label>

      <label style={{ display: 'grid', gap: 6 }}>
        <span>INSTRUCTIONS (OPTIONAL)</span>
        <textarea
          rows={3}
          value={instructions}
          onChange={e => setInstructions(e.target.value)}
          placeholder="Aim for 200–400 words. Cite one philosopher from the syllabus."
          maxLength={1000}
          style={{ resize: 'vertical' }}
        />
      </label>

      <label style={{ display: 'grid', gap: 6 }}>
        <span>DUE DATE (OPTIONAL)</span>
        <input
          type="datetime-local"
          value={dueAt}
          onChange={e => setDueAt(e.target.value)}
        />
      </label>

      {error && <p className="pixel-alert pixel-alert--error" role="alert">{error}</p>}

      <button type="submit" disabled={submitting || !title.trim() || !prompt.trim()}>
        {submitting ? 'Posting…' : 'Post assignment'}
      </button>
    </form>
  );
}
