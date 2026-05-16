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
            <p className="text-[16px] italic" style={{ fontFamily: "var(--font-prose)" }}>
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
              The over 500 thinkers in the constellation are there as company,
              not as curriculum.
            </p>
          </Prose>
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
            I&apos;m in the middle of exam season right now, so updates will
            land in bursts rather than steadily for the next few weeks.
            I&apos;ll keep pushing what I can between revision sessions, and
            the larger features (subscriptions, properly-translated
            philosophical content, mobile polish) are queued up for the moment
            things quiet down. Thanks for using Mull while it&apos;s still
            finding its shape.
          </div>
        </PixelWindow>

        <PixelWindow title="THE ECONOMICS, OPENLY" badge="▶ COSTS + REVENUE">
          <Prose>
            <p>
              Real products with real databases and AI analysis cost real
              money. Here&apos;s what Mull actually costs us each month at
              different sizes — and what it would earn if 5% of users
              subscribed to Mull+ at $4.99/month.
            </p>
          </Prose>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full border-collapse text-[14px]">
              <thead>
                <tr className="border-b-2 border-[#221E18]">
                  <Th>ACTIVE USERS</Th>
                  <Th>MONTHLY COST</Th>
                  <Th>REVENUE @ 5%</Th>
                  <Th>NET</Th>
                </tr>
              </thead>
              <tbody>
                <Tr cells={['Under 100', '~$5', '~$25', '+$20 / mo']} netClass="positive" />
                <Tr cells={['1,000', '$50–200', '~$250', 'break-even']} netClass="neutral" />
                <Tr cells={['10,000', '$550–1,600', '~$2,500', '+$900–1,950']} netClass="positive" />
                <Tr cells={['100,000', '$5,000–15,000', '~$25,000', '+$10,000–20,000']} netClass="positive" />
              </tbody>
            </table>
          </div>

          <p className="mt-3 text-[13px] leading-[1.55] text-[#8C6520]">
            Costs scale roughly with three things: hosting (Vercel), the
            database (Supabase), and AI inference (Claude). The wide ranges
            reflect how much usage we get from active users — heavy
            daily-dilemma writers cost more than casual quiz-takers.
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
              Mull+ is $4.99/month or $29/year.
            </strong>{' '}
            The free tier — quiz, map, archetype, basic daily dilemma — stays
            free forever. We need paid users to cover infrastructure once we
            grow past the few-dozen-users phase. Until then, costs come out of
            the maintainer&apos;s pocket.
            <br /><br />
            For early supporters who want to lock things in: a{' '}
            <strong>Founding Mind lifetime pass at $49</strong> — capped at
            the first 1,000. This funds roughly the first year of
            infrastructure outright, in exchange for never paying again.
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
      style={{ fontFamily: 'var(--font-prose)' }}
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
      <strong className="block text-[15.5px] text-[#221E18]" style={{ fontFamily: 'var(--font-prose)' }}>
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
