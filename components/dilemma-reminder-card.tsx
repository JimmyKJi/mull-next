// /account UI for opting into the daily-dilemma email reminder.
// Client component because it manages form state, talks to the
// /api/notifications/dilemma-reminder endpoint, and auto-fills the
// time zone from the browser on first render.
//
// Defaults shown: opt-out (the user has to actively turn it on),
// 9 AM in their detected zone. The UI also explains, in one line,
// what they'll get and how to turn it off — opt-in needs to be
// honest about scope to be trusted.

'use client';

import { useEffect, useState } from 'react';
import { t, type Locale } from '@/lib/translations';

const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'Inter', system-ui, sans-serif";

type Prefs = { enabled: boolean; hour: number; tz: string };

export default function DilemmaReminderCard({ locale = 'en' as Locale }: { locale?: Locale }) {
  const [prefs, setPrefs] = useState<Prefs | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load existing prefs once on mount. If the user has no row yet, the
  // GET endpoint returns sensible defaults — but their tz won't be set
  // (defaults to UTC), so we override with the browser-detected zone.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/notifications/dilemma-reminder');
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok) throw new Error(json?.error || 'Failed to load.');
        const detected = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
        setPrefs({
          enabled: !!json.enabled,
          hour: typeof json.hour === 'number' ? json.hour : 9,
          // If the server returned UTC AND the user has never saved, use the
          // browser's detected zone so we're not silently sending at 4am
          // local time. Once they've saved, we trust whatever they chose.
          tz: json.tz && json.tz !== 'UTC' ? json.tz : detected,
        });
      } catch (e) {
        if (cancelled) return;
        setError((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  async function save(next: Prefs) {
    setPrefs(next);
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/notifications/dilemma-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(next),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Save failed.');
      setSavedAt(Date.now());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section style={cardStyle}>
        <div style={eyebrow}>{t('reminder.eyebrow', locale)}</div>
        <p style={loadingText}>{t('reminder.loading', locale)}</p>
      </section>
    );
  }
  if (!prefs) return null;

  // 24 hours, formatted in the user's locale (12-hour for en-US, 24-hour
  // for most others).
  const hourOptions = Array.from({ length: 24 }, (_, h) => {
    const d = new Date();
    d.setHours(h, 0, 0, 0);
    const label = d.toLocaleTimeString(locale === 'en' ? 'en-US' : locale, {
      hour: 'numeric', minute: '2-digit',
    });
    return { value: h, label };
  });

  return (
    <section style={cardStyle}>
      <div style={eyebrow}>{t('reminder.eyebrow', locale)}</div>
      <h3 style={heading}>{t('reminder.title', locale)}</h3>
      <p style={blurb}>{t('reminder.blurb', locale)}</p>

      <label style={toggleRow}>
        <input
          type="checkbox"
          checked={prefs.enabled}
          onChange={e => save({ ...prefs, enabled: e.target.checked })}
          style={{ accentColor: '#B8862F', marginRight: 10, width: 18, height: 18 }}
        />
        <span style={{ fontFamily: sans, fontSize: 14.5, color: '#221E18' }}>
          {prefs.enabled
            ? t('reminder.toggle_on', locale)
            : t('reminder.toggle_off', locale)}
        </span>
      </label>

      {prefs.enabled && (
        <div style={{ marginTop: 14, display: 'grid', gap: 12 }}>
          <label style={fieldRow}>
            <span style={fieldLabel}>{t('reminder.field_hour', locale)}</span>
            <select
              value={prefs.hour}
              onChange={e => save({ ...prefs, hour: Number(e.target.value) })}
              style={selectStyle}
            >
              {hourOptions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>
          <label style={fieldRow}>
            <span style={fieldLabel}>{t('reminder.field_tz', locale)}</span>
            <input
              type="text"
              value={prefs.tz}
              onChange={e => setPrefs({ ...prefs, tz: e.target.value })}
              onBlur={() => save(prefs)}
              placeholder="e.g. America/New_York"
              style={inputStyle}
            />
          </label>
          <p style={helpText}>
            {t('reminder.help_text', locale)}
          </p>
        </div>
      )}

      {error && (
        <p style={{
          marginTop: 12, fontFamily: sans, fontSize: 13, color: '#7A2E2E',
          background: 'rgba(122, 46, 46, 0.08)', padding: '8px 12px',
          borderRadius: 6,
        }}>{error}</p>
      )}
      {savedAt && !error && (
        <p style={{
          marginTop: 8, fontFamily: sans, fontSize: 12, color: '#2F5D5C',
          opacity: saving ? 0.6 : 1,
        }}>
          {saving ? t('reminder.saving', locale) : t('reminder.saved', locale)}
        </p>
      )}
    </section>
  );
}

const cardStyle: React.CSSProperties = {
  marginTop: 32,
  padding: '22px 26px',
  background: '#FFFCF4',
  border: '1px solid #EBE3CA',
  borderLeft: '3px solid #B8862F',
  borderRadius: 8,
};
const eyebrow: React.CSSProperties = {
  fontFamily: sans, fontSize: 11, fontWeight: 600,
  color: '#8C6520', textTransform: 'uppercase',
  letterSpacing: '0.18em', marginBottom: 8,
};
const heading: React.CSSProperties = {
  fontFamily: serif, fontSize: 22, fontWeight: 500,
  color: '#221E18', margin: '0 0 6px',
};
const blurb: React.CSSProperties = {
  fontFamily: serif, fontStyle: 'italic',
  fontSize: 15, color: '#4A4338',
  margin: '0 0 14px', lineHeight: 1.55,
};
const toggleRow: React.CSSProperties = {
  display: 'flex', alignItems: 'center', cursor: 'pointer',
  padding: '8px 0',
};
const fieldRow: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
};
const fieldLabel: React.CSSProperties = {
  fontFamily: sans, fontSize: 13, color: '#4A4338',
  minWidth: 120,
};
const selectStyle: React.CSSProperties = {
  fontFamily: sans, fontSize: 14, padding: '6px 10px',
  border: '1px solid #D6CDB6', borderRadius: 6, background: '#FFFCF4',
};
const inputStyle: React.CSSProperties = {
  fontFamily: sans, fontSize: 14, padding: '6px 10px',
  border: '1px solid #D6CDB6', borderRadius: 6, background: '#FFFCF4',
  flex: 1, minWidth: 200,
};
const helpText: React.CSSProperties = {
  fontFamily: sans, fontSize: 12, color: '#8C6520',
  margin: 0, opacity: 0.85, lineHeight: 1.5,
};
const loadingText: React.CSSProperties = {
  fontFamily: sans, fontSize: 13, color: '#8C6520', margin: 0,
};
