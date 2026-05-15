'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { t, type Locale } from '@/lib/translations';
import DiagnosisCard from '@/components/diagnosis-card';
import type { Kinship } from '@/lib/kinship';

const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'Inter', system-ui, sans-serif";

const DRAFT_KEY = 'mull.diary.draft';

const DIM_KEYS = ['TV','VA','WP','TR','TE','RT','MR','SR','CE','SS','PO','TD','AT','ES','UI','SI'];
const DIM_NAMES: Record<string, string> = {
  TV: 'Tragic Vision', VA: 'Vital Affirmation', WP: 'Will to Power',
  TR: 'Trust in Reason', TE: 'Trust in Experience', RT: 'Reverence for Tradition',
  MR: 'Mystical Receptivity', SR: 'Skeptical Reflex', CE: 'Communal Embeddedness',
  SS: 'Sovereign Self', PO: 'Practical Orientation', TD: 'Theoretical Drive',
  AT: 'Ascetic Tendency', ES: 'Embodied Sensibility', UI: 'Universalist Impulse',
  SI: 'Self as Illusion'
};

type SubmitResult = {
  saved: boolean;
  id: string;
  vector_delta: number[] | null;
  analysis: string | null;
  diagnosis: string | null;
  kinship: Kinship | null;
  is_novel: boolean | null;
  analyzed: boolean;
};

function deltaToShifts(delta: number[] | null) {
  if (!Array.isArray(delta)) return [];
  return delta
    .map((d, i) => ({ key: DIM_KEYS[i], name: DIM_NAMES[DIM_KEYS[i]], delta: +d.toFixed(2) }))
    .filter(s => Math.abs(s.delta) >= 0.3)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, 4);
}

export default function DiaryComposer({ locale = 'en' }: { locale?: Locale }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [draftSavedAt, setDraftSavedAt] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [makePublic, setMakePublic] = useState(false);
  const router = useRouter();
  const draftSaveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load draft on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.title) setTitle(parsed.title);
        if (parsed?.content) setContent(parsed.content);
        if (parsed?.savedAt) setDraftSavedAt(parsed.savedAt);
      }
    } catch {}
  }, []);

  // Autosave draft to localStorage 1 second after typing stops
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (draftSaveTimeout.current) clearTimeout(draftSaveTimeout.current);
    if (!title && !content) {
      localStorage.removeItem(DRAFT_KEY);
      setDraftSavedAt(null);
      return;
    }
    draftSaveTimeout.current = setTimeout(() => {
      const now = Date.now();
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ title, content, savedAt: now }));
        setDraftSavedAt(now);
      } catch {}
    }, 800);
    return () => {
      if (draftSaveTimeout.current) clearTimeout(draftSaveTimeout.current);
    };
  }, [title, content]);

  const wordCount = content.trim() ? content.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = content.length;
  const tooShort = charCount > 0 && charCount < 30;
  const ready = charCount >= 30 && charCount <= 12000;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ready || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/diary/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, is_public: makePublic })
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error || 'Could not save your entry.');
        setSubmitting(false);
        return;
      }
      setResult(json as SubmitResult);
      // Clear draft now that it's saved to DB
      try { localStorage.removeItem(DRAFT_KEY); } catch {}
      setDraftSavedAt(null);
      router.refresh();
    } catch (err) {
      console.error(err);
      setError('Network error. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function startNew() {
    setTitle('');
    setContent('');
    setResult(null);
    setError(null);
  }

  function clearDraft() {
    if (!window.confirm(t('diary.discard_draft', locale))) return;
    setTitle('');
    setContent('');
    try { localStorage.removeItem(DRAFT_KEY); } catch {}
    setDraftSavedAt(null);
  }

  if (result) {
    const shifts = deltaToShifts(result.vector_delta);
    return (
      <div style={{
        padding: '28px 32px',
        background: '#FFFCF4',
        border: '1px solid #D6CDB6',
        borderLeft: '3px solid #2F5D5C',
        borderRadius: 8,
      }}>
        <div style={{
          fontFamily: sans,
          fontSize: 11,
          fontWeight: 600,
          color: '#2F5D5C',
          textTransform: 'uppercase',
          letterSpacing: '0.16em',
          marginBottom: 14,
        }}>
          {t('diary.saved_label', locale)}
        </div>
        {result.analysis ? (
          <div style={{
            padding: '14px 16px',
            background: '#F5EFDC',
            borderRadius: 6,
            marginBottom: 16,
          }}>
            <div style={{
              fontFamily: sans,
              fontSize: 10,
              fontWeight: 600,
              color: '#8C6520',
              textTransform: 'uppercase',
              letterSpacing: '0.16em',
              marginBottom: 6,
            }}>
              {t('dilemma.what_revealed', locale)}
            </div>
            <p style={{
              fontFamily: serif,
              fontStyle: 'italic',
              fontSize: 16,
              color: '#221E18',
              margin: 0,
              lineHeight: 1.55,
            }}>
              {result.analysis}
            </p>
          </div>
        ) : !result.analyzed ? (
          <p style={{
            fontFamily: sans,
            fontSize: 13,
            color: '#8C6520',
            marginBottom: 16,
            fontStyle: 'italic',
          }}>
            Saved. The AI analyzer didn't run on this entry — it'll be available when the
            integration is healthy. Your entry is intact.
          </p>
        ) : null}

        {/* Diagnosis: which philosophical move did the entry make, who else
            thought this way, what tradition does it sit in (or is it novel).
            Renders nothing when all three fields are null/empty. */}
        <DiagnosisCard
          diagnosis={result.diagnosis}
          kinship={result.kinship}
          is_novel={result.is_novel}
        />

        {shifts.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{
              fontFamily: sans,
              fontSize: 10,
              fontWeight: 600,
              color: '#8C6520',
              textTransform: 'uppercase',
              letterSpacing: '0.16em',
              marginBottom: 8,
            }}>
              {t('dilemma.shift_added', locale)}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
              {shifts.map(s => (
                <span key={s.key} style={{
                  fontFamily: sans,
                  fontSize: 14,
                  color: s.delta > 0 ? '#2F5D5C' : '#7A2E2E',
                }}>
                  <strong style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {s.delta > 0 ? '+' : ''}{s.delta.toFixed(1)}
                  </strong>{' '}
                  <span style={{ color: '#4A4338' }}>{s.name}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        <div style={{
          paddingTop: 18,
          borderTop: '1px solid #EBE3CA',
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
        }}>
          <button
            onClick={startNew}
            style={{
              padding: '10px 20px',
              background: '#221E18',
              color: '#FAF6EC',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontFamily: sans,
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            {t('diary.write_another', locale)}
          </button>
          <Link href="/account" style={{
            padding: '10px 20px',
            border: '1px solid #221E18',
            borderRadius: 6,
            color: '#221E18',
            textDecoration: 'none',
            fontFamily: sans,
            fontSize: 14,
          }}>
            {t('dilemma.see_trajectory', locale)}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="pixel-form" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <input
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder={t('diary.title_placeholder', locale)}
        maxLength={200}
        style={{
          fontFamily: serif,
          fontStyle: 'italic',
          fontSize: 22,
          fontWeight: 500,
          padding: '10px 14px',
          border: 'none',
          borderBottom: '1px solid #EBE3CA',
          background: 'transparent',
          color: '#221E18',
          outline: 'none',
        }}
      />
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder={t('diary.body_placeholder', locale)}
        rows={16}
        maxLength={12000}
        style={{
          fontFamily: serif,
          fontSize: 18,
          lineHeight: 1.65,
          padding: '18px 22px',
          border: '1px solid #D6CDB6',
          borderRadius: 12,
          background: '#FFFCF4',
          color: '#221E18',
          outline: 'none',
          resize: 'vertical',
          minHeight: 320,
        }}
        onKeyDown={(e) => {
          // Cmd/Ctrl+Enter submits
          if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            (e.currentTarget.form as HTMLFormElement | null)?.requestSubmit();
          }
        }}
      />
      <div style={{
        height: 3,
        background: '#EBE3CA',
        borderRadius: 2,
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${Math.min(100, (charCount / 12000) * 100)}%`,
          background: charCount < 30 ? '#D6CDB6'
                    : charCount > 11000 ? '#C7522A'
                    : '#2F5D5C',
          transition: 'width 0.18s ease, background 0.2s ease',
        }} />
      </div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{
            fontFamily: sans,
            fontSize: 12,
            color: tooShort ? '#7A2E2E' : '#8C6520',
            letterSpacing: 0.3,
          }}>
            {t('diary.entry_words', locale, { n: wordCount })} · {charCount}/12000
            {tooShort ? ' · ' + t('diary.too_short_hint', locale) : ''}
          </span>
          {draftSavedAt && (
            <span style={{
              fontFamily: sans,
              fontSize: 12,
              color: '#8C6520',
              opacity: 0.7,
              fontStyle: 'italic',
            }}>
              {t('diary.draft_saved', locale)}
            </span>
          )}
          {(title || content) && (
            <button
              type="button"
              onClick={clearDraft}
              style={{
                background: 'none',
                border: 'none',
                color: '#8C6520',
                fontFamily: sans,
                fontSize: 12,
                cursor: 'pointer',
                padding: 0,
                textDecoration: 'underline',
                textUnderlineOffset: 3,
              }}
            >
              {t('diary.clear_draft', locale)}
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={!ready || submitting}
          style={{
            fontFamily: sans,
            fontSize: 14.5,
            fontWeight: 500,
            padding: '12px 24px',
            background: ready ? '#221E18' : '#A39880',
            color: '#FAF6EC',
            border: 'none',
            borderRadius: 8,
            cursor: ready && !submitting ? 'pointer' : 'not-allowed',
            opacity: submitting ? 0.7 : 1,
            letterSpacing: 0.4,
          }}
        >
          {submitting ? t('dilemma.analyzing', locale) : t('diary.save_entry', locale)}
        </button>
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
      <label style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        padding: '10px 14px',
        background: makePublic ? '#F8EDC8' : '#FFFCF4',
        border: '2px solid #221E18',
        borderRadius: 0,
        cursor: 'pointer',
        fontFamily: sans,
        fontSize: 13,
        color: '#4A4338',
        lineHeight: 1.5,
      }}>
        <input
          type="checkbox"
          checked={makePublic}
          onChange={e => setMakePublic(e.target.checked)}
          style={{ marginTop: 2, accentColor: '#B8862F', flexShrink: 0 }}
        />
        <span>
          <strong style={{ color: '#221E18' }}>{t('diary.show_on_public', locale)}</strong>{' '}
          <span style={{ fontStyle: locale === 'en' ? 'normal' : 'italic' }}>
            Your most recent 5 public diary entries appear at <code className="pixel-kbd" style={{ fontSize: 11 }}>mull.world/u/&lt;your-handle&gt;</code> if you've set one up. Private by default.
          </span>
          {locale !== 'en' && (
            <span style={{ display: 'block', marginTop: 4, fontSize: 11.5, opacity: 0.7, fontStyle: 'italic' }}>
              {t('i18n.untranslated_short', locale)}
            </span>
          )}
        </span>
      </label>
      <p style={{
        fontFamily: sans,
        fontSize: 12,
        color: '#8C6520',
        margin: '4px 0 0',
        opacity: 0.75,
        lineHeight: 1.55,
      }}>
        <span style={{ fontStyle: locale === 'en' ? 'normal' : 'italic' }}>
          Drafts autosave to your browser. Submitted entries save to your account and Claude analyzes the prose into a small map shift. Press <kbd className="pixel-kbd">⌘</kbd> + <kbd className="pixel-kbd">↵</kbd> to save.
        </span>
        {locale !== 'en' && (
          <span style={{ display: 'block', marginTop: 4, opacity: 0.85, fontStyle: 'italic' }}>
            {t('i18n.untranslated_short', locale)}
          </span>
        )}
      </p>
    </form>
  );
}
