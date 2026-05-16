// /join — manual invite-code entry page.
//
// Students who got the code another way (verbal, on a slide, etc.)
// land here, type the 6-char code, and the form POSTs to
// /api/classes/join. Signed-out users get sent to signup first;
// the code is preserved through the round-trip via the next= param.

import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import MullWordmark from '@/components/mull-wordmark';
import JoinForm from './join-form';

export const metadata: Metadata = {
  title: 'Join a class · Mull',
  robots: { index: false, follow: false },
};

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";
const serif = "'Cormorant Garamond', Georgia, serif";

export default async function JoinPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/join');

  return (
    <main className="mx-auto max-w-[540px] px-6 pb-32 pt-10 sm:px-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <MullWordmark />
        <Link href="/classes" style={{
          fontFamily: pixel, fontSize: 11,
          color: '#4A4338', textDecoration: 'none',
          letterSpacing: 0.4, textTransform: 'uppercase',
        }}>
          ◂ YOUR CLASSES
        </Link>
      </div>

      <div style={{
        fontFamily: pixel,
        fontSize: 12,
        color: '#8C6520',
        textTransform: 'uppercase',
        letterSpacing: '0.18em',
        marginBottom: 14,
      }}>
        ▸ JOIN A CLASS
      </div>
      <h1 style={{
        fontFamily: pixel,
        fontSize: 26,
        margin: '0 0 14px',
        color: '#221E18',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        textShadow: '3px 3px 0 #2F5D5C',
        lineHeight: 1.1,
      }}>
        ENTER YOUR INVITE CODE
      </h1>
      <p style={{
        fontFamily: serif,
        fontStyle: 'italic',
        fontSize: 16,
        color: '#4A4338',
        margin: '0 0 26px',
        lineHeight: 1.55,
      }}>
        Your instructor gave you a six-character code (something like
        <strong style={{ fontStyle: 'normal' }}> A2B3C4</strong>). Type
        it below to join their class.
      </p>

      <JoinForm initialCode="" />
    </main>
  );
}
