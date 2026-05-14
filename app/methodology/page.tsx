// /methodology — v3 pixel chrome restyle.
//
// Same content as before. Defends the 16-D model + lists every AI
// integration in one document. Long-form prose stays in editorial
// Cormorant inside pixel panels.

import Link from 'next/link';
import type { Metadata } from 'next';
import { getServerLocale } from '@/lib/locale-server';
import LanguageSwitcher from '@/components/language-switcher';
import { PixelWindow, PixelPageHeader } from '@/components/pixel-window';

export const metadata: Metadata = {
  title: 'Methodology',
  description:
    "How Mull's 16-dimensional model was built, what it claims to capture, and exactly where AI sits inside the product.",
  openGraph: {
    title: 'Methodology — Mull',
    description:
      "How Mull's 16-dimensional model was built, what it claims to capture, and exactly where AI sits inside the product.",
    url: 'https://mull.world/methodology',
    siteName: 'Mull',
    type: 'article',
  },
  alternates: { canonical: 'https://mull.world/methodology' },
};

const LAST_REVIEWED = 'May 2026';

export default async function MethodologyPage() {
  const locale = await getServerLocale();

  return (
    <main className="mx-auto max-w-[820px] px-6 pb-32 pt-12 sm:px-10 sm:pt-16">
      <div className="mb-6 flex justify-end">
        <LanguageSwitcher initial={locale} />
      </div>

      <PixelPageHeader
        eyebrow={`▶ METHODOLOGY · LAST REVIEWED ${LAST_REVIEWED.toUpperCase()}`}
        title="HOW MULL WORKS"
        subtitle={
          <p className="text-[16px] italic" style={{ fontFamily: 'var(--font-prose)' }}>
            For readers who want more than the About page. The 16-dimensional
            model defended at length, and an enumerated list of every place AI
            sits inside the product.
          </p>
        }
      />

      <div className="space-y-8">
        <PixelWindow title="WHY SIXTEEN DIMENSIONS" badge="▶ MODEL">
          <Prose>
            <p>
              The standard alternatives — political compasses, MBTI, Big Five
              — collapse worldview to two, four, or five axes. That collapse
              is convenient (it produces tidy quadrants and shareable labels)
              but expensive: real philosophical positions don&apos;t live on
              so few axes. Hume and Buddha both score high on a kind of{' '}
              <em>self-as-illusion</em>; they reach it from opposite
              directions. A two-axis system can&apos;t see the difference.
              Mull&apos;s sixteen dimensions are an attempt to be coarse
              enough to be useful, fine enough to keep the distinctions that
              matter.
            </p>
            <p>
              The dimensions were chosen by reading widely across the canon
              and asking:{' '}
              <em>
                what stable axes recur, across centuries, when philosophers
                actually disagree?
              </em>{' '}
              The shortlist that survived is the result of dozens of
              iterations &mdash; some axes that seemed important early on
              (e.g. Optimism/Pessimism) turned out to be derivative of other
              dimensions and were dropped. Others (Self as Illusion, Communal
              Embeddedness) earned their place by repeatedly differentiating
              thinkers that other axes flattened.
            </p>
            <p>
              The dimensions aren&apos;t mutually exclusive and aren&apos;t
              orthogonal in any strict mathematical sense.{' '}
              <em>Trust in Reason</em> and <em>Trust in Experience</em> covary
              in some philosophers and pull apart in others.{' '}
              <em>Communal Embeddedness</em> and <em>Sovereign Self</em> are
              partly opposed, but both can score high in someone like
              Confucius (who locates the self deeply in relations <em>and</em>{' '}
              emphasizes self-cultivation). The sixteen-dimensional space is
              not a vector basis; it&apos;s a coordinate system that captures
              the texture of philosophical disagreement.
            </p>
          </Prose>
        </PixelWindow>

        <PixelWindow title="WHAT THE DIMENSIONS ARE NOT" badge="▶ DISCLAIMERS">
          <ul className="space-y-3">
            <NotItem>
              They <strong>aren&apos;t a personality test.</strong> Mull
              doesn&apos;t claim to predict behavior. It tries to map where
              you currently land in a long conversation about how to think.
            </NotItem>
            <NotItem>
              They <strong>aren&apos;t a verdict.</strong> The same person
              taking the quiz six months apart will land in slightly different
              places — that drift is the most interesting signal, and the
              trajectory map is built around it.
            </NotItem>
            <NotItem>
              They <strong>aren&apos;t empirically validated</strong> in the
              psychometric sense. We have no validation studies, no test-
              retest reliability data, no factor analysis of large user
              samples. This is a designed instrument, drawn from reading
              philosophical texts, not a discovered one. We&apos;re explicit
              about that limitation.
            </NotItem>
            <NotItem>
              They <strong>aren&apos;t culture-neutral.</strong> The selection
              of dimensions reflects the philosophical traditions Mull&apos;s
              author has read most carefully — heavily Western, with
              deliberate widening into Asian, African, and Indigenous
              philosophy. The dimensions try to capture distinctions that
              recur across traditions, but the framing is unavoidably
              perspectival.
            </NotItem>
          </ul>
        </PixelWindow>

        <PixelWindow title="MAPPING QUIZ → POSITION" badge="▶ MATH">
          <Prose>
            <p>
              Each multiple-choice question has 3–6 answers. Each answer
              carries a small vector — a few non-zero entries on the 16
              dimensions, weighted +1 to +3 (positive) or, occasionally,
              negative. Those vectors are summed across all your answered
              questions to produce your raw position. The position is then
              compared by cosine similarity to the prototype vectors of each
              archetype (also hand-designed) to pick a primary archetype.
            </p>
            <p>
              Skipping questions reduces total signal but doesn&apos;t bias
              position — skipped questions just don&apos;t contribute.
              Multi-select questions split their weight across selected
              answers. The raw vector is shown to you on the results page
              (the dimensional profile section) so you can see the math, not
              just the headline.
            </p>
            <p>
              Daily dilemmas, diary entries, and exercise reflections work
              differently. Their vectors come from{' '}
              <em>Claude reading your prose</em>, which is the only place a
              model has discretion over your map. The next section enumerates
              exactly how.
            </p>
          </Prose>
        </PixelWindow>

        <PixelWindow title="WHERE AI SITS INSIDE MULL" badge="▶ FIVE PLACES">
          <Prose>
            <p>
              Five places, all narrow, all read-only with respect to the
              model&apos;s training. We do not send your data to anyone for
              training; we don&apos;t store or expose it beyond what you see
              on your account.
            </p>
          </Prose>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full border-collapse text-[13.5px]">
              <thead>
                <tr className="border-b-2 border-[#221E18]">
                  <Th>WHERE</Th>
                  <Th>WHAT IT DOES</Th>
                  <Th>INPUT</Th>
                  <Th>OUTPUT</Th>
                </tr>
              </thead>
              <tbody>
                <Tr cells={[
                  'Daily dilemma submission',
                  'Reads your prose response, returns a 16-D vector delta + one-line analysis',
                  "The day's prompt + your response",
                  'JSON: { vector_delta: [16 floats], analysis: string }',
                ]} />
                <Tr cells={[
                  'Diary entry submission',
                  "Same prose-to-vector pipeline as the dilemma, with the diary's open-ended prompt",
                  'Your diary content (and optional title)',
                  'JSON: { vector_delta: [16 floats], analysis: string }',
                ]} />
                <Tr cells={[
                  'Exercise reflection submission',
                  'Reads your reflection on a structured exercise, returns a small vector delta',
                  'Exercise context (name + reflection prompt) + your reflection prose',
                  'JSON: { vector_delta: [16 floats], analysis: string }',
                ]} />
                <Tr cells={[
                  'Two-philosopher debate (and Mull+ debate-yourself)',
                  'Generates a back-and-forth exchange in the recorded voices of two philosophers on a chosen topic',
                  "The two thinkers' position vectors + the topic",
                  'A staged exchange (3–6 turns), shown on screen, saved to your debate history',
                ]} />
                <Tr cells={[
                  'Yearly retrospective (Mull+)',
                  'Reads a year of your dilemmas + diary + reflections, writes a ~700-word essay about how your thinking moved',
                  "The whole year's submitted prose for that user",
                  'A long prose essay shown on your account',
                ]} />
              </tbody>
            </table>
          </div>
          <Prose className="mt-4">
            <p>
              The model is currently <strong>Claude Sonnet 4.6</strong> via
              Anthropic&apos;s direct API. We don&apos;t use embeddings,
              vector databases, or any third-party AI tooling. The system
              prompts for each of the above live in the codebase under{' '}
              <code className="rounded border border-[#D6CDB6] bg-[#F5EFDC] px-1.5 py-0.5 text-[12.5px]">
                app/api/
              </code>{' '}
              if you ever want to read them. Anthropic doesn&apos;t train on
              API traffic by default; we don&apos;t opt into anything else.
            </p>
          </Prose>
        </PixelWindow>

        <PixelWindow title="WHAT WE STORE" badge="▶ ON THE SERVER">
          <Prose>
            <p>Three categories of data:</p>
          </Prose>
          <ul className="mt-3 space-y-2.5">
            <NotItem>
              <strong>Auth.</strong> Your email, a hashed password, and
              Supabase&apos;s session metadata. We never see your password in
              plaintext; password reset goes through Supabase&apos;s standard
              flow.
            </NotItem>
            <NotItem>
              <strong>Your data.</strong> Quiz attempts (with the resulting
              16-D vector + chosen archetype), dilemma responses, diary
              entries, exercise reflections, debate history, and your
              public-profile settings if you opted in. Each row is tagged
              with your user ID; row-level security enforces that only you
              (and, if you opted in, the public for explicitly-marked-public
              rows) can read them.
            </NotItem>
            <NotItem>
              <strong>Cookies.</strong> Two:{' '}
              <code className="rounded border border-[#D6CDB6] bg-[#F5EFDC] px-1.5 py-0.5 text-[12.5px]">
                mull_locale
              </code>{' '}
              (your language preference) and the Supabase auth session token.
              Both are strictly necessary for the site to work; we don&apos;t
              set any analytics, advertising, or tracking cookies.
            </NotItem>
          </ul>
          <Prose className="mt-4">
            <p>
              You can{' '}
              <Link
                href="/account/profile"
                className="text-[#8C6520] underline decoration-[#B8862F]/40 underline-offset-3 hover:decoration-[#8C6520]"
              >
                download all of this as JSON or delete your account outright
              </Link>{' '}
              from the public-profile settings page.
            </p>
          </Prose>
        </PixelWindow>

        <PixelWindow title="OPEN QUESTIONS" badge="▶ HONEST LIMITS">
          <Prose>
            <p>
              This is not a finished thing. The honest list of what we know
              is unsolved:
            </p>
          </Prose>
          <ul className="mt-3 space-y-2.5">
            <NotItem>
              The <strong>weighting per quiz answer</strong> was hand-tuned
              by reading patterns in early test results. It hasn&apos;t been
              calibrated against any external standard. A rigorous validation
              pass is on the long-term roadmap.
            </NotItem>
            <NotItem>
              The <strong>philosopher position vectors</strong> are drawn
              from reading their actual writings, but they&apos;re assigned
              by a single editor (Jimmy). A scholar in each tradition
              reviewing the assignments would tighten them considerably;
              that&apos;s queued for after subscriptions cover the cost of
              paying scholars.
            </NotItem>
            <NotItem>
              The <strong>archetype assignments</strong> use cosine
              similarity, which treats all dimensions as equally important.
              A real psychometric instrument would weight some axes more
              heavily based on how much they discriminate between archetypes.
              We don&apos;t do that yet.
            </NotItem>
            <NotItem>
              The <strong>16 dimensions themselves</strong> are not provably
              the right 16. They&apos;re the result of careful reading and
              many iterations, but the claim is one of usefulness, not
              metaphysical correctness.
            </NotItem>
            <NotItem>
              The{' '}
              <strong>
                ten archetypes don&apos;t cover every philosophical stance
                equally well
              </strong>
              . The combination of high reverence-for-tradition AND high
              sovereign-self — the Burkean conservative who venerates
              inherited institutions while locating moral authority in the
              individual — sits in an unclaimed quadrant of the 16-D space.
              People in that quadrant land near Keel or Hearth but rarely{' '}
              <em>on</em> them. The dimensional reading is the more honest
              portrait; the archetype label is approximate. A future model
              revision may add an archetype here.
            </NotItem>
          </ul>
        </PixelWindow>
      </div>

      <p className="mt-12 text-[13px] leading-[1.6] text-[#8C6520] opacity-80">
        Questions, push-back, or factual corrections welcome at{' '}
        <a
          href="mailto:jimmy.kaian.ji@gmail.com"
          className="underline decoration-[#B8862F]/40 underline-offset-3 hover:decoration-[#8C6520]"
        >
          jimmy.kaian.ji@gmail.com
        </a>
        . This page is reviewed quarterly; the date at the top reflects the
        last full review.
      </p>

      <p className="mt-10 text-center text-[13px] text-[#8C6520]">
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
        'space-y-4 text-[15.5px] leading-[1.65] text-[#4A4338] [&_strong]:text-[#221E18] ' +
        (className ?? '')
      }
      style={{ fontFamily: 'var(--font-prose)' }}
    >
      {children}
    </div>
  );
}

function NotItem({ children }: { children: React.ReactNode }) {
  return (
    <li
      className="border-l-4 px-4 py-2.5 text-[14.5px] leading-[1.6] text-[#4A4338]"
      style={{ borderColor: '#B8862F', background: '#FFFCF4' }}
    >
      {children}
    </li>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      className="px-2 py-2 text-left align-top text-[10px] font-medium tracking-[0.16em] text-[#8C6520]"
      style={{ fontFamily: 'var(--font-pixel-display)' }}
    >
      {children}
    </th>
  );
}

function Tr({ cells }: { cells: string[] }) {
  return (
    <tr className="border-b border-[#EBE3CA]">
      {cells.map((c, i) => (
        <td
          key={i}
          className="px-2 py-3 align-top text-[13.5px] leading-[1.5] text-[#221E18]"
        >
          {c}
        </td>
      ))}
    </tr>
  );
}
