'use client';

// Student-only leave-class button. Confirmation prompt before the
// delete fires (mistakes here are recoverable — re-join with the
// code — but we still confirm).

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";

export default function ClassLeaveButton({
  classId,
  className,
}: {
  classId: string;
  className: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function leave() {
    if (busy) return;
    if (!confirm(`Leave "${className}"? You can re-join later with the invite code.`)) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Not signed in.');
        setBusy(false);
        return;
      }
      const { error: delErr } = await supabase
        .from('class_members')
        .delete()
        .eq('class_id', classId)
        .eq('user_id', user.id);
      if (delErr) {
        setError(delErr.message);
        setBusy(false);
        return;
      }
      router.push('/classes');
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <div style={{ width: '100%', textAlign: 'center' }}>
      <button
        type="button"
        onClick={leave}
        disabled={busy}
        className="pixel-press"
        style={{
          display: 'inline-block',
          padding: '10px 16px',
          background: 'transparent',
          color: '#7A2E2E',
          border: '3px solid #7A2E2E',
          boxShadow: '3px 3px 0 0 #7A2E2E',
          borderRadius: 0,
          fontFamily: pixel,
          fontSize: 11,
          letterSpacing: 0.4,
          textTransform: 'uppercase',
          cursor: 'pointer',
          transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end)',
        }}
      >
        {busy ? 'LEAVING…' : 'LEAVE CLASS'}
      </button>
      {error && (
        <p className="pixel-alert pixel-alert--error" style={{ marginTop: 10, display: 'inline-block' }}>
          {error}
        </p>
      )}
    </div>
  );
}
