'use client';

// Create-class form. Submits to /api/classes/create; on success
// routes to /classes/<id> so the teacher can copy the invite link.

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ClassCreateForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [term, setTerm] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/classes/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          term: term.trim() || null,
          school_name: schoolName.trim() || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error || 'Could not create class.');
        setSubmitting(false);
        return;
      }
      router.push(`/classes/${json.id}`);
      router.refresh();
    } catch {
      setError('Network error.');
      setSubmitting(false);
    }
  }

  return (
    <form className="pixel-form" onSubmit={onSubmit} style={{ display: 'grid', gap: 16 }}>
      <label style={{ display: 'grid', gap: 6 }}>
        <span>CLASS NAME</span>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Intro to Ethics — Fall 2026"
          maxLength={120}
          required
        />
      </label>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
        <label style={{ display: 'grid', gap: 6 }}>
          <span>TERM (OPTIONAL)</span>
          <input
            type="text"
            value={term}
            onChange={e => setTerm(e.target.value)}
            placeholder="Fall 2026"
            maxLength={48}
          />
        </label>
        <label style={{ display: 'grid', gap: 6 }}>
          <span>SCHOOL (OPTIONAL)</span>
          <input
            type="text"
            value={schoolName}
            onChange={e => setSchoolName(e.target.value)}
            placeholder="Lincoln High School"
            maxLength={120}
          />
        </label>
      </div>

      <label style={{ display: 'grid', gap: 6 }}>
        <span>DESCRIPTION (OPTIONAL)</span>
        <textarea
          rows={3}
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="What students will read, debate, and write this term."
          maxLength={600}
          style={{ resize: 'vertical' }}
        />
      </label>

      {error && (
        <p className="pixel-alert pixel-alert--error" role="alert">{error}</p>
      )}

      <button type="submit" disabled={submitting || !name.trim()}>
        {submitting ? 'Creating…' : 'Create class'}
      </button>
    </form>
  );
}
