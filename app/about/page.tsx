// /about — v3 pixel chrome restyle.
//
// Same content as before (kept manually in sync with the About
// section in public/mull.html). The prose stays in editorial
// Cormorant inside pixel panels — the "library book inside the
// game" beat that the redesign leans on. Section titles in
// Press Start 2P, body in Cormorant.

import Link from 'next/link';
import type { Metadata } from 'next';
import { getServerLocale } from '@/lib/locale-server';
import LanguageSwitcher from '@/components/language-switcher';
import { PixelWindow, PixelPageHeader } from '@/components/pixel-window';

export const metadata: Metadata = {
  title: 'About',
  description: "What Mull is, what it isn't, what it costs to run, and who pays.",
  openGraph: {
    title: 'About — Mull',
    description: "What Mull is, what it isn't, what it costs to run, and who pays.",
    url: 'https://mull.world/about',
    siteName: 'Mull',
    type: 'article',
  },
  alternates: { canonical: 'https://mull.world/about' },
};

export default async function AboutPage() {
  const locale = await getServerLocale();

  return (
    <main className="mx-auto max-w-[820px] px-6 pb-32 pt-12 sm:px-10 sm:pt-16">
      {/* Language switcher floats top-right under the global SiteNav */}
      <div className="mb-6 flex justify-end">
        <LanguageSwitcher initial={locale} />
      </div>

      <PixelPageHeader
        eyebrow="▶ ABOUT MULL"
        title="A PASSION PROJECT"
        subtitle={
          <div className="space-y-3">
            <p className="text-[16px] italic" style={{ fontFamily: "var(--font-editorial)" }}>
              Built on nights and weekends. Funded by nothing in particular.
            </p>
            <p className="text-[14px] text-[#8C6520]">
              This page exists so anyone using Mull can know what they&apos;re
              using — what it is, what it isn&apos;t, what it costs to run,
              and who pays.
            </p>
          </div>
        }
      />

      <div className="space-y-8">
        <PixelWindow title="WHY THIS EXISTS" badge="▶ MISSION">
          <Prose>
            <p>
              Philosophy is the original tool for examining your own thinking —
              the discipline that refuses to take its own framing for granted.
              Most people leave it behind after one survey course because the
              way it&apos;s taught makes it feel like memorizing a museum:
              dates, names, doctrines, exam.
            </p>
            <p>
              Mull inverts that. Instead of teaching you what dead philosophers
              thought, it asks what <strong>you</strong> think — concretely, on
              real questions — and shows you where that places you in the long
              conversation. The map isn&apos;t a verdict, it&apos;s a mirror.
              The 560 thinkers in the constellation are there as company, not
              as curriculum.
            </p>
          </Prose>
        </PixelWindow>

        <PixelWindow title="WHAT MULL ACTUALLY IS" badge="▶ THE PRODUCT">
          <Prose>
            <p>
              The site has grown beyond the original quiz. The pieces, with
              what each is for:
            </p>
          </Prose>
          <ul className="mt-5 space-y-3">
            <Promise title="The Quiz — two ways through.">
              The classic five-minute version (twenty questions, Likert-style)
              gets you onto the map fast. <strong>The Inheritor</strong> is
              the same questions wrapped in a fifteen-minute narrative — a
              midnight at a strange estate, four chambers, a stranger. Same
              16-dimensional placement underneath; different way of arriving
              at it. The home page leads with the Inheritor; the classic is
              one click away.
            </Promise>
            <Promise title="The Arena — argue a philosopher, get scored.">
              Debate any of ten thinkers (Socrates, Nietzsche, Arendt,
              Confucius, Mill, others — across three difficulty tiers) on
              everyday or philosophical topics. An impartial judge scores
              both sides on logical rigor, philosophical principle, and
              engagement — <em>not</em> on whose side won. Elo system,
              leaderboard, PvP against other humans. The Arena is Mull&apos;s
              answer to "what do I do once I know where I sit?"
            </Promise>
            <Promise title="560 philosophers, 10 archetypes, 12 topics, 30 matchups.">
              The constellation is the heart of the site — a 2D map you can
              wander. Every philosopher page is a small editorial essay; the
              archetype pages go longer. Topic explainers cover the questions
              philosophers keep returning to (free will, the trolley problem,
              meaning of life, what we owe each other). The vs pages are
              head-to-head comparisons across the 16 dimensions.
            </Promise>
            <Promise title="The Dilemma, the Diary, the Exercises.">
              Smaller surfaces, but the daily-return ones. A philosophical
              dilemma each day with the option to write a response. A
              personal philosophical diary. A short library of contemplative
              exercises. All optional.
            </Promise>
            <Promise title="Classes (for educators).">
              Teachers can spin up a class, share an invite link, and post
              philosophy assignments to students. Free for anyone with an
              academic email address (.edu / .ac.* / .k12.*.us auto-detected).
            </Promise>
          </ul>
        </PixelWindow>

        <PixelWindow title="THE PRINCIPLES" badge="▶ COMMITMENTS">
          <Prose>
            <p>
              The values that shape this product. They don&apos;t change as
              Mull grows — that&apos;s the whole point of writing them down.
            </p>
          </Prose>
          <ul className="mt-5 space-y-3">
            <Promise title="No ads, ever.">
              No banners, no tracking pixels, no sponsored newsletter slot.
              Your reflections are between you and the model. Nobody pays for
              the privilege of putting an ad next to them.
            </Promise>
            <Promise title="No selling your data.">
              If you make an account, we hold your email and your saved quiz
              attempts — nothing else. You can download everything we have on
              you as JSON, or delete your account outright, from the
              public-profile settings page (sign in, then visit{' '}
              <em>Account → Public profile settings</em>). Your map is
              private by default; public profiles are opt-in only.
            </Promise>
            <Promise title="Not VC-funded.">
              No investors, no growth quotas, no board demanding a 10× return.
              The product changes when we decide it should change, not when a
              quarterly review demands traction.
            </Promise>
            <Promise title='Not an "AI app".'>
              AI is used in a few specific, bounded places — turning your
              written daily dilemma, diary entry, or exercise reflection into
              a small dimensional shift on your map; generating the back-and-
              forth in simulated philosopher debates; and (Mull+) writing your
              end-of-year retrospective from your own data. The 16-dimensional
              model, the archetype system, the philosopher positions, the
              figures, the quiz questions — all hand-designed by humans who
              care about getting philosophy right. The full list, with prompts
              and data flows, is on the{' '}
              <Link
                href="/methodology"
                className="text-[#8C6520] underline decoration-[#B8862F]/40 underline-offset-3 hover:decoration-[#8C6520]"
              >
                methodology page
              </Link>
              .
            </Promise>
            <Promise title="The free tier stays generous.">
              If Mull grows past break-even, every dollar of margin goes back
              into the product: better LLM analysis, scholars to verify
              philosopher positions, illustrators to redo the figures
              properly, content for the learning lab. If it grows past{' '}
              <em>that</em>, none of these principles change.
            </Promise>
          </ul>
        </PixelWindow>

        <PixelWindow title="WHO'S BEHIND THIS" badge="▶ THE MAINTAINER">
          <Prose>
            <p>
              Built by <strong>Jimmy Ji</strong>, a philosophy student at
              King&apos;s College London. Mull is currently a one-person
              project, though it&apos;s young and will grow. If you want to
              help, push back on a question, suggest a thinker, or report a
              bug, write to{' '}
              <a
                href="mailto:jimmy.kaian.ji@gmail.com"
                className="text-[#8C6520] underline decoration-[#B8862F]/40 underline-offset-3 hover:decoration-[#8C6520]"
              >
                jimmy.kaian.ji@gmail.com
              </a>
              .
            </p>
          </Prose>
          <div
            className="mt-5 border-l-4 px-5 py-4 text-[14.5px] leading-[1.65] text-[#4A4338]"
            style={{ borderColor: '#B8862F', background: '#FBF6E8' }}
          >
            <strong className="text-[#221E18]">A short note from Jimmy:</strong>{' '}
            Mull is currently running entirely free — no subscriptions, no
            ads, no data sale. The full Stripe wiring is built and dormant; we&apos;ll
            flip it on if and when keeping the site running needs it. Until
            then, the costs come out of my pocket, and anyone who finds Mull
            useful and can spare anything can{' '}
            <a
              href="https://ko-fi.com/mull"
              target="_blank"
              rel="noopener"
              className="text-[#8C6520] underline decoration-[#B8862F]/40 underline-offset-3 hover:decoration-[#8C6520]"
            >
              tip on Ko-fi
            </a>{' '}
            — which materially helps keep the lights on, especially as the
            Arena adds real AI cost per match.
          </div>
        </PixelWindow>

        <PixelWindow title="THE ECONOMICS, OPENLY" badge="▶ COSTS + WHO PAYS">
          <Prose>
            <p>
              Real products with real databases and AI inference cost real
              money. Mull is currently <strong>free for everyone</strong> —
              there is no paid tier active. The maintainer pays out of pocket,
              with help from anyone who chooses to tip on Ko-fi.
            </p>
            <p>
              Rough costs at different sizes, assuming the current usage
              pattern (Arena debates being the dominant AI cost, with the
              Inheritor and daily dilemma adding smaller amounts):
            </p>
          </Prose>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full border-collapse text-[14px]">
              <thead>
                <tr className="border-b-2 border-[#221E18]">
                  <Th>ACTIVE USERS</Th>
                  <Th>MONTHLY COST</Th>
                  <Th>WHO PAYS</Th>
                </tr>
              </thead>
              <tbody>
                <Tr cells={['Under 100', '~$10', 'Maintainer + tips']} netClass="neutral" />
                <Tr cells={['1,000', '$100–400', 'Tips + maintainer']} netClass="neutral" />
                <Tr cells={['10,000', '$1,200–4,000', 'Will need real funding']} netClass="neutral" />
                <Tr cells={['100,000', '$10,000–40,000', 'Will need subscriptions / grants']} netClass="neutral" />
              </tbody>
            </table>
          </div>

          <p className="mt-3 text-[13px] leading-[1.55] text-[#8C6520]">
            The dominant variable is AI inference (Claude Sonnet for the
            Arena judge, Haiku for philosopher voices). A daily-cap of 3
            debates per user keeps the Arena&apos;s cost bounded; the
            quiz + map + philosopher pages all serve at near-zero marginal
            cost.
          </p>

          <div
            className="mt-6 border-2 px-5 py-4 text-[14px] leading-[1.65] text-[#4A4338]"
            style={{
              borderColor: '#E2D8B6',
              background: '#F5EFDC',
              boxShadow: '3px 3px 0 0 #B8862F',
            }}
          >
            <strong className="text-[#221E18]">
              How to support Mull right now:
            </strong>{' '}
            tipping on{' '}
            <a
              href="https://ko-fi.com/mull"
              target="_blank"
              rel="noopener"
              className="text-[#8C6520] underline decoration-[#B8862F]/40 underline-offset-3 hover:decoration-[#8C6520]"
            >
              Ko-fi
            </a>{' '}
            is the most direct path. The full subscription system
            (Mull+ at $4.99/month, $29/year, and a $59 lifetime Founding
            Mind pass) is built and dormant — we&apos;ll flip it on if Mull
            grows past the point where tips can cover infrastructure, and
            never as a way to gate the core features (quiz, map, philosopher
            pages, daily dilemma stay free forever).
          </div>
        </PixelWindow>
      </div>

      <p className="mt-12 text-center text-[13px] text-[#8C6520]">
        <Link
          href="/"
          className="underline decoration-[#B8862F]/40 underline-offset-3 hover:decoration-[#8C6520]"
        >
          ← Back to Mull
        </Link>
      </p>
    </main>
  );
}

// ──────────────────────────────────────────────────────────────
// Local helpers — small atoms used only on /about.
// ──────────────────────────────────────────────────────────────

function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="space-y-4 text-[15.5px] leading-[1.65] text-[#4A4338] [&_strong]:text-[#221E18]"
      style={{ fontFamily: 'var(--font-editorial)' }}
    >
      {children}
    </div>
  );
}

function Promise({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <li
      className="border-l-4 px-4 py-3 text-[14.5px] leading-[1.55] text-[#4A4338]"
      style={{ borderColor: '#B8862F', background: '#FFFCF4' }}
    >
      <strong className="block text-[15.5px] text-[#221E18]" style={{ fontFamily: 'var(--font-editorial)' }}>
        {title}
      </strong>
      <span className="mt-1 inline-block">{children}</span>
    </li>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      className="px-2 py-2 text-left text-[10px] font-medium tracking-[0.16em] text-[#8C6520]"
      style={{ fontFamily: 'var(--font-pixel-display)' }}
    >
      {children}
    </th>
  );
}

function Tr({ cells, netClass }: { cells: string[]; netClass: 'positive' | 'neutral' }) {
  const netColor = netClass === 'positive' ? '#2F5D5C' : '#8C6520';
  return (
    <tr className="border-b border-[#EBE3CA]">
      {cells.map((c, i) => (
        <td
          key={i}
          className={`px-2 py-3 text-[14px] ${
            i === cells.length - 1 ? 'font-medium' : ''
          }`}
          style={{ color: i === cells.length - 1 ? netColor : '#221E18' }}
        >
          {c}
        </td>
      ))}
    </tr>
  );
}
