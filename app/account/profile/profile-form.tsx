'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { t, type Locale } from '@/lib/translations';

const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'Inter', system-ui, sans-serif";

type ProfileInitial = {
  handle: string;
  display_name: string | null;
  bio: string | null;
  show_archetype: boolean;
  show_dimensions: boolean;
  show_map: boolean;
  show_streak: boolean;
} | null;

const HANDLE_RE = /^[a-z0-9_-]{3,32}$/;

export default function ProfileForm({ initial, userEmail, locale = 'en' }: { initial: ProfileInitial; userEmail: string; locale?: Locale }) {
  const [handle, setHandle] = useState(initial?.handle || '');
  const [displayName, setDisplayName] = useState(initial?.display_name || '');
  const [bio, setBio] = useState(initial?.bio || '');
  const [showArchetype, setShowArchetype] = useState(initial?.show_archetype ?? true);
  const [showDimensions, setShowDimensions] = useState(initial?.show_dimensions ?? true);
  const [showMap, setShowMap] = useState(initial?.show_map ?? true);
  const [showStreak, setShowStreak] = useState(initial?.show_streak ?? false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedUrl, setSavedUrl] = useState<string | null>(null);
  const router = useRouter();

  const handleClean = handle.toLowerCase().trim();
  const handleValid = HANDLE_RE.test(handleClean);
  const isExisting = !!initial;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!handleValid || submitting) return;
    setSubmitting(true);
    setError(null);
    setSavedUrl(null);
    try {
      const res = await fetch('/api/profile/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          handle: handleClean,
          display_name: displayName,
          bio,
          show_archetype: showArchetype,
          show_dimensions: showDimensions,
          show_map: showMap,
          show_streak: showStreak,
        })
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error || t('profile.could_not_save', locale));
        setSubmitting(false);
        return;
      }
      setSavedUrl(json.url);
      router.refresh();
    } catch (err) {
      console.error(err);
      setError(t('profile.network_error', locale));
    } finally {
      setSubmitting(false);
    }
  }

  async function onDelete() {
    if (!window.confirm(t('profile.delete_confirm', locale, { handle: handleClean }))) return;
    setSubmitting(true);
    try {
      await fetch('/api/profile/save', { method: 'DELETE' });
      setHandle('');
      setDisplayName('');
      setBio('');
      setSavedUrl(null);
      router.refresh();
    } catch (err) {
      console.error(err);
      setError(t('profile.could_not_delete', locale));
    } finally {
      setSubmitting(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    fontFamily: sans,
    fontSize: 15,
    padding: '11px 14px',
    border: '1px solid #D6CDB6',
    borderRadius: 8,
    background: '#FFFCF4',
    color: '#221E18',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: sans,
    fontSize: 11,
    fontWeight: 600,
    color: '#8C6520',
    textTransform: 'uppercase',
    letterSpacing: '0.16em',
    display: 'block',
    marginBottom: 8,
  };

  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div>
        <label htmlFor="handle" style={labelStyle}>{t('profile.handle_label', locale)}</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: serif, fontSize: 18, color: '#8C6520' }}>mull.world/u/</span>
          <input
            id="handle"
            type="text"
            value={handle}
            onChange={e => setHandle(e.target.value.toLowerCase())}
            placeholder="your-handle"
            maxLength={32}
            style={{ ...inputStyle, fontFamily: serif, fontStyle: 'italic', fontSize: 18 }}
          />
        </div>
        {handle && !handleValid && (
          <p style={{
            fontFamily: sans,
            fontSize: 12,
            color: '#7A2E2E',
            margin: '6px 0 0',
          }}>
            {t('profile.handle_validation_hint', locale)}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="displayName" style={labelStyle}>{t('profile.display_name_label', locale)}</label>
        <input
          id="displayName"
          type="text"
          value={displayName}
          onChange={e => setDisplayName(e.target.value)}
          placeholder={t('profile.display_name_placeholder', locale)}
          maxLength={80}
          style={inputStyle}
        />
      </div>

      <div>
        <label htmlFor="bio" style={labelStyle}>{t('profile.bio_label', locale)}</label>
        <textarea
          id="bio"
          value={bio}
          onChange={e => setBio(e.target.value)}
          placeholder={t('profile.bio_placeholder', locale)}
          maxLength={280}
          rows={3}
          style={{ ...inputStyle, resize: 'vertical', minHeight: 80, fontFamily: serif, fontSize: 16, lineHeight: 1.5 }}
        />
        <div style={{ fontFamily: sans, fontSize: 11, color: '#8C6520', marginTop: 4, opacity: 0.75 }}>
          {bio.length}/280
        </div>
      </div>

      <div>
        <label style={labelStyle}>{t('profile.visibility_label', locale)}</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Checkbox label={t('profile.show_archetype', locale)} checked={showArchetype} onChange={setShowArchetype} />
          <Checkbox label={t('profile.show_dimensions', locale)} checked={showDimensions} onChange={setShowDimensions} />
          <Checkbox label={t('profile.show_map', locale)} checked={showMap} onChange={setShowMap} />
          <Checkbox label={t('profile.show_streak', locale)} checked={showStreak} onChange={setShowStreak} />
        </div>
      </div>

      <div style={{
        padding: '14px 16px',
        background: '#F5EFDC',
        borderLeft: '3px solid #B8862F',
        borderRadius: 6,
        fontFamily: sans,
        fontSize: 13,
        color: '#4A4338',
        lineHeight: 1.55,
      }}>
        <strong style={{ color: '#221E18' }}>{t('profile.never_visible', locale)}</strong> {t('profile.never_visible_body', locale, { email: userEmail })}
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          type="submit"
          disabled={!handleValid || submitting}
          style={{
            fontFamily: sans,
            fontSize: 14.5,
            fontWeight: 500,
            padding: '12px 24px',
            background: handleValid ? '#221E18' : '#A39880',
            color: '#FAF6EC',
            border: 'none',
            borderRadius: 8,
            cursor: handleValid && !submitting ? 'pointer' : 'not-allowed',
            opacity: submitting ? 0.7 : 1,
          }}
        >
          {submitting ? t('profile.saving', locale) : isExisting ? t('profile.update', locale) : t('profile.publish', locale)}
        </button>
        {isExisting && (
          <button
            type="button"
            onClick={onDelete}
            disabled={submitting}
            style={{
              fontFamily: sans,
              fontSize: 13,
              padding: '11px 18px',
              background: 'transparent',
              color: '#C7522A',
              border: '1px solid #C7522A',
              borderRadius: 8,
              cursor: 'pointer',
            }}
          >
            {t('profile.delete_button', locale)}
          </button>
        )}
        {(savedUrl || isExisting) && (
          <Link href={savedUrl || `/u/${handleClean}`} style={{
            fontFamily: sans,
            fontSize: 13,
            color: '#2F5D5C',
            textDecoration: 'underline',
            textUnderlineOffset: 3,
            marginLeft: 'auto',
          }} target="_blank">
            {t('profile.view_public_page', locale)}
          </Link>
        )}
      </div>

      {error && (
        <div style={{
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
      {savedUrl && (
        <div style={{
          fontFamily: sans,
          fontSize: 13,
          color: '#173533',
          background: 'rgba(47, 93, 92, 0.1)',
          border: '1px solid rgba(47, 93, 92, 0.3)',
          padding: '10px 14px',
          borderRadius: 6,
        }}>
          ✓ {t('profile.saved_notice', locale)}{' '}
          <Link href={savedUrl} style={{ color: '#2F5D5C', textDecoration: 'underline' }} target="_blank">
            mull.world{savedUrl}
          </Link>
        </div>
      )}
    </form>
  );
}

function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '8px 12px',
      background: checked ? '#F5EFDC' : 'transparent',
      border: '1px solid ' + (checked ? '#D6CDB6' : '#EBE3CA'),
      borderRadius: 6,
      cursor: 'pointer',
      fontFamily: sans,
      fontSize: 14,
      color: '#221E18',
      transition: 'background 0.12s ease',
    }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        style={{ accentColor: '#B8862F' }}
      />
      {label}
    </label>
  );
}
