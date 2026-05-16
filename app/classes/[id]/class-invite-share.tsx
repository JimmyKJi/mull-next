'use client';

// Teacher-only widget: shows the invite code + share URL + copy
// buttons. Renders on the class detail page so the teacher can
// distribute the invite link to students without leaving the page.

import { useState } from 'react';

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";
const serif = "'Cormorant Garamond', Georgia, serif";

export default function ClassInviteShare({
  inviteCode,
  studentCount,
}: {
  inviteCode: string;
  studentCount: number;
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
      window.prompt('Copy this:', text);
    }
  }

  return (
    <section style={{
      marginTop: 24,
      padding: '20px 22px',
      background: '#F8EDC8',
      border: '4px solid #221E18',
      boxShadow: '5px 5px 0 0 #B8862F',
      borderRadius: 0,
    }}>
      <div style={{
        fontFamily: pixel,
        fontSize: 12,
        color: '#8C6520',
        textTransform: 'uppercase',
        letterSpacing: '0.18em',
        marginBottom: 12,
      }}>
        ▸ INVITE STUDENTS
      </div>
      <p style={{
        fontFamily: serif,
        fontStyle: 'italic',
        fontSize: 15.5,
        color: '#221E18',
        margin: '0 0 16px',
        lineHeight: 1.55,
      }}>
        Share the link with your class. Students who already have a Mull
        account join in one click; new students sign up first and then
        the code joins them automatically.
        {' '}
        <strong style={{ fontStyle: 'normal' }}>
          {studentCount} {studentCount === 1 ? 'student has' : 'students have'} joined so far.
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
            border: '3px solid #221E18',
            fontFamily: 'ui-monospace, Menlo, monospace',
            fontSize: 13,
            color: '#221E18',
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
              background: copiedKind === 'url' ? '#2F5D5C' : '#221E18',
              color: '#FAF6EC',
              border: '3px solid #221E18',
              boxShadow: '3px 3px 0 0 #B8862F',
              borderRadius: 0,
              fontFamily: pixel,
              fontSize: 11,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end)',
            }}
          >
            {copiedKind === 'url' ? '✓ COPIED' : 'COPY URL'}
          </button>
        </div>

        {/* Bare code — for students typing into /join manually */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          background: '#FFFCF4',
          border: '2px dashed #8C6520',
        }}>
          <span style={{
            fontFamily: serif,
            fontStyle: 'italic',
            fontSize: 13,
            color: '#4A4338',
          }}>
            Or share the 6-character code directly:
          </span>
          <button
            type="button"
            onClick={() => copy(inviteCode, 'code')}
            className="pixel-press"
            style={{
              padding: '6px 14px',
              background: 'transparent',
              border: '2px solid #221E18',
              color: '#221E18',
              fontFamily: pixel,
              fontSize: 16,
              letterSpacing: 0.6,
              cursor: 'pointer',
              transition: 'transform 80ms steps(2, end)',
            }}
          >
            {copiedKind === 'code' ? '✓ COPIED' : inviteCode}
          </button>
        </div>
      </div>
    </section>
  );
}
