'use client';

// Teacher-only widget: shows the invite code + share URL + copy
// buttons. Renders on the class detail page so the teacher can
// distribute the invite link to students without leaving the page.

import { useState } from 'react';
import { t, type Locale } from '@/lib/translations';

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";
const serif = "var(--font-prose)";

export default function ClassInviteShare({
  inviteCode,
  studentCount,
  locale,
}: {
  inviteCode: string;
  studentCount: number;
  locale: Locale;
}) {
  const [copiedKind, setCopiedKind] = useState<'url' | 'code' | null>(null);

  const url = typeof window !== 'undefined'
    ? `${window.location.origin}/join/${inviteCode}`
    : `https://mull.world/join/${inviteCode}`;

  async function copy(text: string, kind: 'url' | 'code') {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKind(kind);
      setTimeout(() => setCopiedKind(null), 1800);
    } catch {
      window.prompt(t('cls.copy_prompt', locale), text);
    }
  }

  return (
    <section style={{
      marginTop: 24,
      padding: '20px 22px',
      background: 'var(--color-acc-soft)',
      border: '4px solid var(--color-ink)',
      boxShadow: '5px 5px 0 0 var(--color-acc)',
      borderRadius: 0,
    }}>
      <div style={{
        fontFamily: pixel,
        fontSize: 12,
        color: 'var(--color-acc-deep)',
        textTransform: 'uppercase',
        letterSpacing: '0.18em',
        marginBottom: 12,
      }}>
        ▸ {t('cls.invite_eyebrow', locale)}
      </div>
      <p style={{
        fontFamily: serif,
        fontStyle: 'italic',
        fontSize: 15.5,
        color: 'var(--color-ink)',
        margin: '0 0 16px',
        lineHeight: 1.55,
      }}>
        {t('cls.invite_body', locale)}
        {' '}
        <strong style={{ fontStyle: 'normal' }}>
          {t(studentCount === 1 ? 'cls.invite_joined_one' : 'cls.invite_joined_many', locale, { count: studentCount })}
        </strong>
      </p>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}>
        {/* URL line */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'stretch', flexWrap: 'wrap' }}>
          <code style={{
            flex: '1 1 240px',
            minWidth: 0,
            padding: '10px 12px',
            background: '#FFFCF4',
            border: '3px solid var(--color-ink)',
            fontFamily: 'ui-monospace, Menlo, monospace',
            fontSize: 13,
            color: 'var(--color-ink)',
            overflow: 'auto',
            whiteSpace: 'nowrap',
          }}>
            {url}
          </code>
          <button
            type="button"
            onClick={() => copy(url, 'url')}
            className="pixel-press"
            style={{
              padding: '10px 16px',
              background: copiedKind === 'url' ? '#2F5D5C' : 'var(--color-ink)',
              color: 'var(--color-cream)',
              border: '3px solid var(--color-ink)',
              boxShadow: '3px 3px 0 0 var(--color-acc)',
              borderRadius: 0,
              fontFamily: pixel,
              fontSize: 11,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end)',
            }}
          >
            {copiedKind === 'url' ? t('cls.copied', locale) : t('cls.copy_url', locale)}
          </button>
        </div>

        {/* Bare code — for students typing into /join manually */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          background: '#FFFCF4',
          border: '2px dashed var(--color-acc-deep)',
        }}>
          <span style={{
            fontFamily: serif,
            fontStyle: 'italic',
            fontSize: 13,
            color: 'var(--color-ink-soft)',
          }}>
            {t('cls.share_code_directly', locale)}
          </span>
          <button
            type="button"
            onClick={() => copy(inviteCode, 'code')}
            className="pixel-press"
            style={{
              padding: '6px 14px',
              background: 'transparent',
              border: '2px solid var(--color-ink)',
              color: 'var(--color-ink)',
              fontFamily: pixel,
              fontSize: 16,
              letterSpacing: 0.6,
              cursor: 'pointer',
              transition: 'transform 80ms steps(2, end)',
            }}
          >
            {copiedKind === 'code' ? t('cls.copied', locale) : inviteCode}
          </button>
        </div>
      </div>
    </section>
  );
}
