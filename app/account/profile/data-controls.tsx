'use client';

// Data-control panel: export everything we hold on the user as JSON, or
// permanently delete the account. Lives at the bottom of /account/profile
// because that's already where privacy / public-profile decisions are made.
//
// The delete flow is a two-step gate: type the literal phrase, then click.
// This is deliberately friction-y — account deletion is irreversible, and
// the words act as both a confirmation and a sanity check.

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { t, type Locale } from '@/lib/translations';

const sans = "'Inter', system-ui, sans-serif";
const CONFIRM_PHRASE = 'DELETE MY ACCOUNT';

export default function DataControls({ locale = 'en' }: { locale?: Locale }) {
  const [exporting, setExporting] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDangerZone, setShowDangerZone] = useState(false);
  const router = useRouter();

  const ready = confirmText.trim().toUpperCase() === CONFIRM_PHRASE;

  function onExport() {
    setExporting(true);
    // Simple GET is enough — the route returns a Content-Disposition: attachment
    // header so the browser downloads instead of rendering.
    window.location.href = '/api/account/export';
    // Re-enable the button after a short delay (we can't await a download).
    setTimeout(() => setExporting(false), 1500);
  }

  async function onDelete() {
    if (!ready || deleting) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch('/api/account/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: CONFIRM_PHRASE }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json?.error || t('profile.could_not_delete', locale));
        setDeleting(false);
        return;
      }
      // Account is gone. Send the user home; the auth cookie they had now
      // points at nothing.
      router.push('/');
      router.refresh();
    } catch (e) {
      console.error(e);
      setError(t('profile.network_error', locale));
      setDeleting(false);
    }
  }

  return (
    <section className="pixel-form" style={{
      marginTop: 56,
      paddingTop: 28,
      borderTop: '4px solid #221E18',
    }}>
      <div style={{
        fontFamily: sans,
        fontSize: 11,
        fontWeight: 600,
        color: '#8C6520',
        textTransform: 'uppercase',
        letterSpacing: '0.18em',
        marginBottom: 14,
      }}>
        {t('data.eyebrow', locale)}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button
          type="button"
          onClick={onExport}
          disabled={exporting}
          style={{
            fontFamily: sans,
            fontSize: 14,
            padding: '11px 18px',
            background: 'transparent',
            color: '#221E18',
            border: '1px solid #221E18',
            borderRadius: 8,
            cursor: exporting ? 'wait' : 'pointer',
            textAlign: 'left',
            opacity: exporting ? 0.7 : 1,
          }}
        >
          {exporting ? t('data.exporting', locale) : t('data.export_button', locale)}
        </button>
        <p style={{
          fontFamily: sans,
          fontSize: 12,
          color: '#8C6520',
          margin: 0,
          opacity: 0.75,
          lineHeight: 1.55,
        }}>
          {t('data.export_help', locale)}
        </p>
      </div>

      {!showDangerZone ? (
        <button
          type="button"
          onClick={() => setShowDangerZone(true)}
          style={{
            marginTop: 28,
            fontFamily: sans,
            fontSize: 13,
            color: '#C7522A',
            background: 'transparent',
            border: 'none',
            padding: 0,
            textDecoration: 'underline',
            textUnderlineOffset: 3,
            cursor: 'pointer',
          }}
        >
          {t('data.danger_show', locale)}
        </button>
      ) : (
        <div style={{
          marginTop: 28,
          padding: '18px 20px',
          border: '1px solid #C7522A',
          borderRadius: 8,
          background: 'rgba(199, 82, 42, 0.04)',
        }}>
          <div style={{
            fontFamily: sans,
            fontSize: 13.5,
            fontWeight: 600,
            color: '#7A2E2E',
            marginBottom: 8,
          }}>
            {t('data.danger_title', locale)}
          </div>
          <p style={{
            fontFamily: sans,
            fontSize: 13,
            color: '#4A4338',
            margin: '0 0 14px',
            lineHeight: 1.55,
          }}>
            {t('data.danger_body', locale)}
          </p>
          <label style={{
            fontFamily: sans,
            fontSize: 12,
            color: '#4A4338',
            display: 'block',
            marginBottom: 8,
          }}>
            {t('data.confirm_label', locale, { phrase: CONFIRM_PHRASE })}
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={e => setConfirmText(e.target.value)}
            placeholder={CONFIRM_PHRASE}
            style={{
              fontFamily: sans,
              fontSize: 13,
              padding: '9px 12px',
              border: '1px solid #D6CDB6',
              borderRadius: 6,
              background: '#FFFCF4',
              color: '#221E18',
              outline: 'none',
              width: '100%',
              boxSizing: 'border-box',
              marginBottom: 12,
            }}
          />
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={onDelete}
              disabled={!ready || deleting}
              style={{
                fontFamily: sans,
                fontSize: 13.5,
                padding: '10px 18px',
                background: ready ? '#C7522A' : '#D6CDB6',
                color: '#FAF6EC',
                border: 'none',
                borderRadius: 8,
                cursor: ready && !deleting ? 'pointer' : 'not-allowed',
                opacity: deleting ? 0.7 : 1,
              }}
            >
              {deleting ? t('data.deleting', locale) : t('data.delete_button', locale)}
            </button>
            <button
              type="button"
              onClick={() => { setShowDangerZone(false); setConfirmText(''); setError(null); }}
              disabled={deleting}
              style={{
                fontFamily: sans,
                fontSize: 13.5,
                padding: '10px 18px',
                background: 'transparent',
                color: '#4A4338',
                border: '1px solid #4A4338',
                borderRadius: 8,
                cursor: 'pointer',
              }}
            >
              {t('btn.cancel', locale)}
            </button>
          </div>
          {error && (
            <div style={{
              marginTop: 12,
              fontFamily: sans,
              fontSize: 13,
              color: '#7A2E2E',
              background: 'rgba(122, 46, 46, 0.08)',
              border: '1px solid rgba(122, 46, 46, 0.2)',
              padding: '10px 14px',
              borderRadius: 6,
            }}>
              {error}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
