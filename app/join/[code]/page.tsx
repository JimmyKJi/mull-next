// /join/[code] — direct invite link, opened by students from the
// teacher's share. We prefill the code into the join form so the
// student just clicks "Join".
//
// Auth handling:
//   - Not signed in → redirect to /signup?next=/join/<code> ;
//     after signup they land back here, prefilled, signed in.
//   - Signed in → show the prefilled form one-click away.
// We deliberately don't auto-join on visit — confirming the click
// gives the student a moment to see what they're joining + which
// account is signing in.

import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { getServerLocale } from '@/lib/locale-server';
import { t, type Locale } from '@/lib/translations';
import MullWordmark from '@/components/mull-wordmark';
import JoinForm from '../join-form';

export const metadata: Metadata = {
  title: 'Join a class · Mull',
  robots: { index: false, follow: false },
};

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";
const serif = 'var(--font-prose)';

type ClassPreview = {
  name: string;
  term: string | null;
  school_name: string | null;
  is_archived: boolean;
};

export default async function JoinByCodePage({ params }: { params: Promise<{ code: string }> }) {
  const { code: rawCode } = await params;
  const code = (rawCode || '').trim().toUpperCase();
  if (!code) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/signup?next=/join/${encodeURIComponent(code)}`);
  }

  const locale = await getServerLocale();

  // Preview the class (name + term + school) so the student knows
  // what they're about to join. Use admin client because the student
  // isn't a member yet — RLS would otherwise block the SELECT.
  let preview: ClassPreview | null = null;
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from('classes')
      .select('name, term, school_name, is_archived')
      .eq('invite_code', code)
      .maybeSingle<ClassPreview>();
    preview = data;
  } catch {
    // Admin client unavailable in dev — show the join form anyway,
    // the join API will still validate.
  }

  if (preview?.is_archived) {
    return <NotFoundShell code={code} reason={t('join.reason_archived', locale)} locale={locale} />;
  }
  if (preview === null) {
    return <NotFoundShell code={code} reason={t('join.reason_no_match', locale)} locale={locale} />;
  }

  return (
    <main className="mx-auto max-w-[540px] px-6 pb-32 pt-10 sm:px-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <MullWordmark />
        <Link
          href="/classes"
          style={{
            fontFamily: pixel,
            fontSize: 11,
            color: 'var(--color-ink-soft)',
            textDecoration: 'none',
            letterSpacing: 0.4,
            textTransform: 'uppercase',
          }}
        >
          ◂ {t('join.your_classes', locale)}
        </Link>
      </div>

      <div
        style={{
          fontFamily: pixel,
          fontSize: 12,
          color: 'var(--color-acc-deep)',
          textTransform: 'uppercase',
          letterSpacing: '0.18em',
          marginBottom: 14,
        }}
      >
        ▸ {t('join.invited_eyebrow', locale)}
      </div>
      <h1
        style={{
          fontFamily: pixel,
          fontSize: 24,
          margin: '0 0 14px',
          color: 'var(--color-ink)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          textShadow: '3px 3px 0 var(--pixel-shadow, #2F5D5C)',
          lineHeight: 1.15,
        }}
      >
        {t('join.join_label', locale)} {preview?.name?.toUpperCase()}
      </h1>
      {(preview?.term || preview?.school_name) && (
        <p
          style={{
            fontFamily: serif,
            fontStyle: 'italic',
            fontSize: 16,
            color: 'var(--color-acc-deep)',
            margin: '0 0 20px',
          }}
        >
          {[preview?.term, preview?.school_name].filter(Boolean).join(' · ')}
        </p>
      )}
      <p
        style={{
          fontFamily: serif,
          fontStyle: 'italic',
          fontSize: 15.5,
          color: 'var(--color-ink-soft)',
          margin: '0 0 22px',
          lineHeight: 1.55,
        }}
      >
        {t('join.roster_note', locale)}
      </p>

      <JoinForm initialCode={code} locale={locale} />
    </main>
  );
}

function NotFoundShell({ code, reason, locale }: { code: string; reason: string; locale: Locale }) {
  return (
    <main className="mx-auto max-w-[540px] px-6 pb-32 pt-12 sm:px-10">
      <div className="mb-6">
        <MullWordmark />
      </div>
      <div
        style={{
          padding: '28px 28px',
          background: '#FFFCF4',
          border: '4px solid var(--color-ink)',
          boxShadow: '5px 5px 0 0 #7A2E2E',
          borderRadius: 0,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontFamily: pixel,
            fontSize: 12,
            color: '#7A2E2E',
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            marginBottom: 14,
          }}
        >
          ▸ {t('join.invite_invalid_eyebrow', locale)}
        </div>
        <h1
          style={{
            fontFamily: serif,
            fontSize: 26,
            fontWeight: 500,
            margin: '0 0 12px',
            letterSpacing: '-0.4px',
          }}
        >
          {t('join.code_didnt_work_before', locale)}
          <code style={{ fontFamily: pixel, fontSize: 22 }}>{code}</code>
          {t('join.code_didnt_work_after', locale)}
        </h1>
        <p
          style={{
            fontFamily: serif,
            fontStyle: 'italic',
            fontSize: 16,
            color: 'var(--color-ink-soft)',
            margin: '0 0 24px',
            lineHeight: 1.55,
          }}
        >
          {reason}
        </p>
        <Link
          href="/join"
          className="pixel-press"
          style={{
            display: 'inline-block',
            padding: '12px 22px',
            background: 'var(--color-ink)',
            color: 'var(--color-cream)',
            border: '4px solid var(--color-ink)',
            boxShadow: '4px 4px 0 0 var(--color-acc)',
            borderRadius: 0,
            fontFamily: pixel,
            fontSize: 12,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            textDecoration: 'none',
            transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end)',
          }}
        >
          ▸ {t('join.try_another_code', locale)}
        </Link>
      </div>
    </main>
  );
}
