// /privacy — v3 pixel chrome restyle. All content preserved.

import Link from 'next/link';
import type { Metadata } from 'next';
import { PixelWindow, PixelPageHeader } from '@/components/pixel-window';

export const metadata: Metadata = {
  title: 'Privacy',
  description: 'What Mull collects, what it does with it, and how to delete it.',
  alternates: { canonical: 'https://mull.world/privacy' },
};

const LAST_UPDATED = 'May 10, 2026';

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-[820px] px-6 pb-32 pt-12 sm:px-10 sm:pt-16">
      <PixelPageHeader
        eyebrow={`▶ PRIVACY · UPDATED ${LAST_UPDATED.toUpperCase()}`}
        title="WHAT WE HOLD"
        subtitle={
          <p className="text-[16px] italic" style={{ fontFamily: 'var(--font-prose)' }}>
            Plain English. If anything below contradicts what you actually
            experience, the experience is the bug — please email me at{' '}
            <a
              href="mailto:jimmy.kaian.ji@gmail.com"
              className="not-italic text-[#8C6520] underline decoration-[#B8862F]/40 underline-offset-3 hover:decoration-[#8C6520]"
            >
              jimmy.kaian.ji@gmail.com
            </a>
            .
          </p>
        }
      />

      <div className="space-y-8">
        <PixelWindow title="WHAT MULL COLLECTS" badge="▶ DATA">
          <Prose>
            <p>
              If you don&rsquo;t make an account, Mull stores nothing about
              you on our servers. The quiz runs entirely in your browser and
              we don&rsquo;t see your answers.
            </p>
            <p>If you make an account, we hold:</p>
          </Prose>
          <ul className="mt-3 space-y-2">
            <ProseLi>
              Your email address (used only to sign you in and to send you
              the email reminders you&rsquo;ve opted into).
            </ProseLi>
            <ProseLi>
              The dimensional positions, archetypes, and dilemma responses
              you save — i.e. the actual content of your engagement with Mull.
            </ProseLi>
            <ProseLi>
              Optional public-profile fields you fill in (handle, display
              name, what&rsquo;s shown on your public page) — these you
              control directly.
            </ProseLi>
            <ProseLi>Subscription state (free vs Mull+) once subscriptions are live.</ProseLi>
            <ProseLi>
              The IP address you connected from, hashed with a salt — kept
              for 24 hours, only to enforce rate limits. We don&rsquo;t store
              raw IPs.
            </ProseLi>
          </ul>
          <Prose className="mt-4">
            <p>
              We don&rsquo;t collect: location data, contacts, browsing
              history, fingerprints, or anything from third-party trackers.
              Mull has no analytics SDK that records what you click. The only
              telemetry is Vercel&rsquo;s privacy-respecting page-view
              counter, which doesn&rsquo;t set cookies.
            </p>
          </Prose>
        </PixelWindow>

        <PixelWindow title="HOW WE USE AI" badge="▶ NARROW">
          <Prose>
            <p>
              Three places use AI: the dilemma analyzer, the philosopher
              debate generator, and (for Mull+ subscribers, when that feature
              ships) the year-end retrospective. In each case, the text you
              wrote is sent to Anthropic&rsquo;s Claude API, processed, and
              the result is stored on your account. We don&rsquo;t train any
              model on your data. Anthropic&rsquo;s data policy applies to
              the in-flight API call; we don&rsquo;t retain anything beyond
              what&rsquo;s necessary for you to see it again on your account.
            </p>
            <p>
              Full technical detail — exact prompts, exact data flows — is
              on the{' '}
              <Link
                href="/methodology"
                className="text-[#8C6520] underline decoration-[#B8862F]/40 underline-offset-3 hover:decoration-[#8C6520]"
              >
                methodology page
              </Link>
              .
            </p>
          </Prose>
        </PixelWindow>

        <PixelWindow title="WHAT WE NEVER DO" badge="▶ COMMITMENTS">
          <ul className="space-y-2.5">
            <ProseLi>
              <strong>No ads.</strong> Ever. No display ads, no sponsored
              content, no affiliate links sneaked into archetype pages.
            </ProseLi>
            <ProseLi>
              <strong>No selling your data.</strong> Your reflections are
              between you and the model. We have no business relationship
              that would make selling them attractive even if we wanted to.
            </ProseLi>
            <ProseLi>
              <strong>No tracking pixels in emails.</strong> Email reminders
              are plain HTML/text. We don&rsquo;t know if you opened them.
            </ProseLi>
            <ProseLi>
              <strong>No third-party advertising cookies.</strong> Mull sets
              only what&rsquo;s required to keep you signed in.
            </ProseLi>
          </ul>
        </PixelWindow>

        <PixelWindow title="COOKIES" badge="▶ MINIMAL">
          <Prose>
            <p>
              We set: a Supabase session cookie (so you stay signed in), a
              small locale cookie (so the site remembers your language), and
              a one-time onboarding-dismissed cookie (so we don&rsquo;t
              repeat the welcome overlay). That&rsquo;s it. No analytics,
              no advertising, no tracking.
            </p>
          </Prose>
        </PixelWindow>

        <PixelWindow title="WHO CAN SEE YOUR DATA" badge="▶ PRIVATE BY DEFAULT">
          <Prose>
            <p>
              By default, your account is private. Your archetype, your map,
              your dilemma responses — only you see them. The{' '}
              <Link
                href="/account"
                className="text-[#8C6520] underline decoration-[#B8862F]/40 underline-offset-3 hover:decoration-[#8C6520]"
              >
                public profile settings
              </Link>{' '}
              let you opt in to making any combination of these visible at{' '}
              <code className="rounded border border-[#D6CDB6] bg-[#F5EFDC] px-1.5 py-0.5 text-[12.5px]">
                mull.world/u/&lt;handle&gt;
              </code>
              . Default is everything off; you choose individually what to
              share.
            </p>
            <p>
              Maintainer (me, Jimmy) can technically see anything stored in
              our Supabase database. I look at this only to investigate bugs
              and abuse. I don&rsquo;t read user diaries, dilemmas, or chats
              for fun. The infrastructure is hosted on Vercel and Supabase;
              their staff have access to the underlying systems under their
              respective security policies.
            </p>
          </Prose>
        </PixelWindow>

        <PixelWindow title="EMAIL" badge="▶ OPT-IN ONLY">
          <Prose>
            <p>Three kinds of email may go out, all opt-in:</p>
          </Prose>
          <ul className="mt-3 space-y-2">
            <ProseLi>Daily dilemma reminder, at the local hour you choose.</ProseLi>
            <ProseLi>Sunday weekly digest of your past 7 days.</ProseLi>
            <ProseLi>One-time courtesy email if a streak of 3+ days breaks.</ProseLi>
          </ul>
          <Prose className="mt-4">
            <p>
              Plus a single welcome email when you first sign up. Turn any
              of these off in{' '}
              <Link
                href="/account"
                className="text-[#8C6520] underline decoration-[#B8862F]/40 underline-offset-3 hover:decoration-[#8C6520]"
              >
                account settings
              </Link>
              .
            </p>
          </Prose>
        </PixelWindow>

        <PixelWindow title="YOUR RIGHTS" badge="▶ FULL CONTROL">
          <Prose>
            <p>You can:</p>
          </Prose>
          <ul className="mt-3 space-y-2.5">
            <ProseLi>
              <strong>Download everything we have on you</strong> as a single
              JSON file from{' '}
              <Link
                href="/account"
                className="text-[#8C6520] underline decoration-[#B8862F]/40 underline-offset-3 hover:decoration-[#8C6520]"
              >
                account settings
              </Link>
              .
            </ProseLi>
            <ProseLi>
              <strong>Delete your account outright.</strong> Same place. We
              wipe every user-scoped row across all our tables and remove
              your sign-in record. Anonymous feedback you submitted is kept
              (the words remain; your identifier disappears).
            </ProseLi>
            <ProseLi>
              <strong>Object to anything specific</strong> by emailing me.
              I&rsquo;ll respond.
            </ProseLi>
          </ul>
        </PixelWindow>

        <PixelWindow title="CHILDREN · CHANGES · CONTACT">
          <Prose>
            <p>
              <strong>Children.</strong> Mull is not designed for users
              under 13. If you&rsquo;re under 13, please don&rsquo;t make an
              account.
            </p>
            <p>
              <strong>Changes.</strong> If this policy changes materially,
              signed-in users will get an email. The page is dated at the
              top so you can always check what&rsquo;s current.
            </p>
            <p>
              <strong>Contact.</strong> Email{' '}
              <a
                href="mailto:jimmy.kaian.ji@gmail.com"
                className="text-[#8C6520] underline decoration-[#B8862F]/40 underline-offset-3 hover:decoration-[#8C6520]"
              >
                jimmy.kaian.ji@gmail.com
              </a>
              . I read every message.
            </p>
          </Prose>
        </PixelWindow>
      </div>

      <p className="mt-12 text-center text-[13px] text-[#8C6520]">
        Last updated: {LAST_UPDATED}.{' '}
        <Link
          href="/"
          className="ml-2 underline decoration-[#B8862F]/40 underline-offset-3 hover:decoration-[#8C6520]"
        >
          ← Back to Mull
        </Link>
      </p>
    </main>
  );
}

function Prose({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={
        'space-y-4 text-[15.5px] leading-[1.65] text-[#221E18] [&_strong]:text-[#221E18] ' +
        (className ?? '')
      }
      style={{ fontFamily: 'var(--font-prose)' }}
    >
      {children}
    </div>
  );
}

function ProseLi({ children }: { children: React.ReactNode }) {
  return (
    <li
      className="border-l-4 px-4 py-2 text-[14.5px] leading-[1.6] text-[#221E18]"
      style={{ borderColor: '#B8862F', background: '#FFFCF4', fontFamily: 'var(--font-prose)' }}
    >
      {children}
    </li>
  );
}
