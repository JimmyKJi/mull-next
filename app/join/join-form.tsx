'use client';

// Code-entry form shared between /join (blank) and /join/[code]
// (prefilled). POSTs to /api/classes/join and routes to the joined
// class on success.

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function JoinForm({ initialCode }: { initialCode: string }) {
  const router = useRouter();
  const [code, setCode] = useState(initialCode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/classes/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: trimmed }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error || 'Could not join class.');
        setSubmitting(false);
        return;
      }
      router.push(`/classes/${json.class_id}`);
      router.refresh();
    } catch {
      setError('Network error.');
      setSubmitting(false);
    }
  }

  return (
    <form className="pixel-form" onSubmit={onSubmit} style={{ display: 'grid', gap: 16 }}>
      <label style={{ display: 'grid', gap: 6 }}>
        <span>INVITE CODE</span>
        <input
          type="text"
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          placeholder="ABC123"
          maxLength={12}
          required
          autoComplete="off"
          autoCapitalize="characters"
          style={{
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            textAlign: 'center',
            fontSize: 22,
          }}
        />
      </label>

      {error && (
        <p className="pixel-alert pixel-alert--error" role="alert">{error}</p>
      )}

      <button type="submit" disabled={submitting || !code.trim()}>
        {submitting ? 'Joining…' : 'Join class'}
      </button>
    </form>
  );
}
