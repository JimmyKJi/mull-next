// /methodology — v4 revamp (2026-05-25).
//
// What changed vs v3:
//   - Added an in-page Table of Contents so a long page becomes
//     navigable in two clicks.
//   - Added a new "The 16 Dimensions" section at the top — a 4x4
//     grid showing every dimension's code, name, and one-line
//     description. A page about a 16-D model that never SHOWED the
//     16 dimensions was a v3 oversight.
//   - Added a math schematic in the "mapping" section: a five-box
//     pipeline with sample numbers so the cosine-sim handoff is
//     visible at a glance.
//   - Replaced the AI integrations <table> with a card grid (five
//     labeled cards, one per integration). Reads less like a
//     spreadsheet, more like a real product surface.
//   - Each PixelWindow now uses a different archetype-color accent
//     so the page has visual rhythm instead of seven identical
//     cream-and-amber blocks stacked vertically.
//   - Sections numbered (01-07) for orientation; each gets an
//     anchor id so the TOC works.

import Link from 'next/link';
import type { Metadata } from 'next';
import { getServerLocale } from '@/lib/locale-server';
import LanguageSwitcher from '@/components/language-switcher';
import { PixelWindow, PixelPageHeader } from '@/components/pixel-window';
import { ContentLanguageNotice } from '@/components/content-language-notice';
import { DIM_KEYS, DIM_NAMES, DIM_DESCRIPTIONS } from '@/lib/dimensions';
import { ARCHETYPE_COLORS } from '@/lib/archetype-colors';

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

// Per-section accents — picked from ARCHETYPE_COLORS for visual rhythm.
// Each section gets a distinct tint so the page reads as chapters,
// not as a stack of identical panels.
const SECTION_ACCENTS = {
  dimensions: ARCHETYPE_COLORS.cartographer, // navy — the framework
  why16: undefined,                          // cream default (essay)
  disclaimers: undefined,                    // cream default (essay)
  math: ARCHETYPE_COLORS.garden,             // olive — the math
  ai: ARCHETYPE_COLORS.hammer,               // purple — the AI cells
  storage: undefined,                        // cream default
  open: ARCHETYPE_COLORS.threshold,          // lavender — uncertainty
} as const;

const SECTIONS = [
  { id: 'dimensions', n: '01', label: 'The 16 dimensions' },
  { id: 'why16',      n: '02', label: 'Why sixteen' },
  { id: 'disclaimers',n: '03', label: 'What this is not' },
  { id: 'math',       n: '04', label: 'Quiz → position' },
  { id: 'ai',         n: '05', label: 'Where AI sits' },
  { id: 'storage',    n: '06', label: 'What we store' },
  { id: 'open',       n: '07', label: 'Open questions' },
] as const;

export default async function MethodologyPage() {
  const locale = await getServerLocale();

  return (
    <main className="mx-auto max-w-[860px] px-6 pb-32 pt-12 sm:px-10 sm:pt-16">
      <div className="mb-6 flex justify-end">
        <LanguageSwitcher initial={locale} />
      </div>

      <ContentLanguageNotice locale={locale} />

      <PixelPageHeader
        eyebrow={`▶ METHODOLOGY · LAST REVIEWED ${LAST_REVIEWED.toUpperCase()}`}
        title="HOW MULL WORKS"
        subtitle={
          <p
            className="text-[17px] italic"
            style={{ fontFamily: 'var(--font-editorial)' }}
          >
            For readers who want more than the About page. The 16-dimensional
            model defended at length, an enumerated list of every place AI
            sits inside the product, and an honest punch-list of what we
            haven&apos;t solved yet.
          </p>
        }
      />

      {/* ─── Table of Contents — small pixel chips, jump anchors ─── */}
      <nav
        aria-label="On this page"
        className="mb-10 border-y-2 border-[#221E18] bg-[#FBF6E8] px-3 py-3"
      >
        <div
          className="mb-2 text-[10px] tracking-[0.22em] text-[#8C6520]"
          style={{ fontFamily: 'var(--font-pixel-display)' }}
        >
          ▶ ON THIS PAGE
        </div>
        <ul className="flex flex-wrap gap-1.5">
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="inline-flex items-center gap-1.5 border-2 border-[#221E18] bg-[#FFFCF4] px-2.5 py-1 text-[11px] tracking-[0.06em] text-[#221E18] transition-colors hover:bg-[#F8C75E]"
                style={{ fontFamily: 'var(--font-pixel-display)' }}
              >
                <span className="text-[#8C6520]">{s.n}</span>
                <span>{s.label.toUpperCase()}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="space-y-10">
        {/* ─── 01 · The 16 Dimensions ──────────────────────────── */}
        <section id="dimensions" className="scroll-mt-20">
          <SectionEyebrow n="01" />
          <PixelWindow
            title="THE 16 DIMENSIONS"
            badge="▶ THE MODEL"
            accent={SECTION_ACCENTS.dimensions}
          >
            <Prose>
              <p>
                The page is named after these. Before defending why there are
                sixteen of them, here&apos;s what they actually are. Each is a
                two-letter code, a short name, and a one-line characterization.
                You can hover (or tap) any dimension card on the rest of the
                site to see this same description.
              </p>
            </Prose>
            <div className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {DIM_KEYS.map((k) => (
                <div
                  key={k}
                  className="flex gap-3 border-2 border-[#221E18] bg-[#FFFCF4] px-3 py-2.5"
                  style={{ boxShadow: '2px 2px 0 0 #B8862F' }}
                >
                  <div
                    className="shrink-0 self-start border-2 border-[#221E18] bg-[#F8C75E] px-2 py-1 text-[11px] font-bold leading-none text-[#1A1820]"
                    style={{
                      fontFamily: 'var(--font-pixel-display)',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {k}
                  </div>
                  <div className="min-w-0">
                    <div
                      className="text-[14px] font-medium leading-tight text-[#221E18]"
                      style={{ fontFamily: 'var(--font-editorial)' }}
                    >
                      {DIM_NAMES[k]}
                    </div>
                    <div
                      className="mt-1 text-[12.5px] leading-[1.45] text-[#4A4338]"
                      style={{ fontFamily: 'var(--font-editorial)' }}
                    >
                      {DIM_DESCRIPTIONS[k]}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </PixelWindow>
        </section>

        {/* ─── 02 · Why sixteen ────────────────────────────────── */}
        <section id="why16" className="scroll-mt-20">
          <SectionEyebrow n="02" />
          <PixelWindow title="WHY SIXTEEN" badge="▶ DESIGN CHOICE">
            <Prose>
              <p>
                The standard alternatives — political compasses, MBTI, Big
                Five — collapse worldview to two, four, or five axes. That
                collapse is convenient (it produces tidy quadrants and
                shareable labels) but expensive: real philosophical positions
                don&apos;t live on so few axes. Hume and Buddha both score
                high on a kind of <em>self-as-illusion</em>; they reach it
                from opposite directions. A two-axis system can&apos;t see the
                difference.
              </p>
              <p>
                The dimensions were chosen by reading widely across the canon
                and asking:{' '}
                <em>
                  what stable axes recur, across centuries, when philosophers
                  actually disagree?
                </em>{' '}
                The shortlist that survived is the result of dozens of
                iterations — some axes that seemed important early on (e.g.
                Optimism/Pessimism) turned out to be derivative of other
                dimensions and were dropped. Others (<em>Self as Illusion</em>,{' '}
                <em>Communal Embeddedness</em>) earned their place by
                repeatedly differentiating thinkers that other axes flattened.
              </p>
              <p>
                The dimensions aren&apos;t mutually exclusive and aren&apos;t
                orthogonal in any strict mathematical sense. <em>Trust in
                Reason</em> and <em>Trust in Experience</em> covary in some
                philosophers and pull apart in others. <em>Communal
                Embeddedness</em> and <em>Sovereign Self</em> are partly
                opposed, but both can score high in someone like Confucius
                (who locates the self deeply in relations <em>and</em>{' '}
                emphasizes self-cultivation). The 16-dimensional space is not
                a vector basis; it&apos;s a coordinate system designed to
                capture the texture of philosophical disagreement.
              </p>
            </Prose>
          </PixelWindow>
        </section>

        {/* ─── 03 · What this is not ───────────────────────────── */}
        <section id="disclaimers" className="scroll-mt-20">
          <SectionEyebrow n="03" />
          <PixelWindow title="WHAT THIS IS NOT" badge="▶ DISCLAIMERS">
            <ul className="space-y-3">
              <NotItem>
                <strong>Not a personality test.</strong> Mull doesn&apos;t
                claim to predict behavior. It tries to map where you currently
                land in a long conversation about how to think.
              </NotItem>
              <NotItem>
                <strong>Not a verdict.</strong> The same person taking the
                quiz six months apart will land in slightly different places.
                That drift is the most interesting signal, and the trajectory
                map is built around it.
              </NotItem>
              <NotItem>
                <strong>Not empirically validated</strong> in the psychometric
                sense. There are no validation studies, no test-retest
                reliability data, no factor analysis of large user samples.
                This is a <em>designed</em> instrument, drawn from reading
                philosophical texts — not a discovered one. We&apos;re
                explicit about that limitation.
              </NotItem>
              <NotItem>
                <strong>Not culture-neutral.</strong> The selection of
                dimensions reflects the philosophical traditions Mull&apos;s
                author has read most carefully — heavily Western, with
                deliberate widening into Asian, African, and Indigenous
                philosophy. The dimensions try to capture distinctions that
                recur across traditions, but the framing is unavoidably
                perspectival.
              </NotItem>
            </ul>
          </PixelWindow>
        </section>

        {/* ─── 04 · Quiz → position ────────────────────────────── */}
        <section id="math" className="scroll-mt-20">
          <SectionEyebrow n="04" />
          <PixelWindow
            title="QUIZ → POSITION"
            badge="▶ THE MATH"
            accent={SECTION_ACCENTS.math}
          >
            <Prose>
              <p>
                Each multiple-choice question has 3–6 answers. Each answer
                carries a small vector — a few non-zero entries on the 16
                dimensions, weighted +1 to +3 (positive) or, occasionally,
                negative. Those vectors are summed across all your answered
                questions to produce your raw position. The position is then
                compared by cosine similarity to the prototype vectors of
                each archetype (also hand-designed) to pick a primary
                archetype.
              </p>
            </Prose>

            {/* Pipeline schematic — five labelled boxes, arrows between,
                with sample numbers so the math is visible at a glance. */}
            <div className="mt-6 border-2 border-[#221E18] bg-[#FFFCF4] p-4">
              <div
                className="mb-3 text-[10px] tracking-[0.22em] text-[#8C6520]"
                style={{ fontFamily: 'var(--font-pixel-display)' }}
              >
                ▶ EXAMPLE — ONE ANSWER, END-TO-END
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-5 sm:items-stretch sm:gap-1">
                <PipelineBox
                  label="Question"
                  body="“When facing a tough choice, do you reason from principles?”"
                />
                <PipelineArrow />
                <PipelineBox
                  label="Answer picked"
                  body="“Almost always.”"
                />
                <PipelineArrow />
                <PipelineBox
                  label="Δ vector"
                  body={
                    <span className="font-mono">
                      {`{ TR:+3, TD:+1, UI:+1 }`}
                    </span>
                  }
                />
              </div>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-5 sm:items-stretch sm:gap-1">
                <PipelineBox
                  label="Cumulative V"
                  body={
                    <span className="font-mono">
                      [4, 5, 3, <strong>8</strong>, 6, 4, 2, 3, 5, 5, 7,{' '}
                      <strong>9</strong>, 4, 5, <strong>7</strong>, 3]
                    </span>
                  }
                />
                <PipelineArrow />
                <PipelineBox
                  label="Cosine vs 10 archetypes"
                  body={
                    <span className="font-mono text-[11.5px]">
                      cartographer 0.91
                      <br />
                      lighthouse&nbsp;&nbsp;&nbsp;0.84
                      <br />
                      keel &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;0.79
                    </span>
                  }
                />
                <PipelineArrow />
                <PipelineBox
                  label="Result"
                  body={
                    <>
                      <strong className="text-[#1E3A5F]">
                        The Cartographer
                      </strong>
                      <br />
                      <span className="text-[12px] text-[#4A4338]">
                        (~85% alignment)
                      </span>
                    </>
                  }
                />
              </div>
            </div>

            <Prose className="mt-5">
              <p>
                Skipping questions reduces total signal but doesn&apos;t bias
                position — skipped questions just don&apos;t contribute.
                Multi-select questions split their weight across selected
                answers. The raw vector is shown on the results page (the
                dimensional profile section) so you can see the math, not just
                the headline.
              </p>
              <p>
                Daily dilemmas, diary entries, and exercise reflections work
                differently. Their vectors come from <em>Claude reading your
                prose</em>, which is the only place a model has discretion
                over your map. The next section enumerates exactly how.
              </p>
            </Prose>
          </PixelWindow>
        </section>

        {/* ─── 05 · Where AI sits ──────────────────────────────── */}
        <section id="ai" className="scroll-mt-20">
          <SectionEyebrow n="05" />
          <PixelWindow
            title="WHERE AI SITS"
            badge="▶ FIVE PLACES"
            accent={SECTION_ACCENTS.ai}
          >
            <Prose>
              <p>
                Five places, all narrow, all read-only with respect to the
                model&apos;s training. Mull does not send your data to anyone
                for training; it doesn&apos;t store or expose it beyond what
                you see on your account. The model is currently{' '}
                <strong>Claude Sonnet 4.6</strong> via Anthropic&apos;s direct
                API. No embeddings, no vector databases, no third-party AI
                tooling.
              </p>
            </Prose>
            <div className="mt-5 grid grid-cols-1 gap-3">
              <AIIntegrationCard
                n="01"
                where="Daily dilemma submission"
                what="Reads your prose response, returns a 16-D vector delta + one-line analysis."
                input="The day's prompt + your response"
                output="JSON: { vector_delta: [16 floats], analysis: string }"
              />
              <AIIntegrationCard
                n="02"
                where="Diary entry submission"
                what="Same prose-to-vector pipeline as the dilemma, with the diary's open-ended prompt."
                input="Your diary content (and optional title)"
                output="JSON: { vector_delta: [16 floats], analysis: string }"
              />
              <AIIntegrationCard
                n="03"
                where="Exercise reflection submission"
                what="Reads your reflection on a structured exercise, returns a small vector delta."
                input="Exercise context (name + reflection prompt) + your reflection prose"
                output="JSON: { vector_delta: [16 floats], analysis: string }"
              />
              <AIIntegrationCard
                n="04"
                where="The Arena & simulated philosopher debates"
                what="Generates philosopher voices in character (Haiku) and a Sonnet judge scores both sides on rigor, principle, and engagement — not whose side won."
                input="The two thinkers' position vectors + the topic + the user's turns"
                output="A 3-6 turn exchange + a structured verdict, saved to your history"
              />
              <AIIntegrationCard
                n="05"
                where="Yearly retrospective (Mull+)"
                what="Reads a year of your dilemmas + diary + reflections, writes a ~700-word essay about how your thinking has moved."
                input="The whole year's submitted prose for that user"
                output="A long prose essay shown on your account"
              />
            </div>
            <Prose className="mt-5">
              <p>
                System prompts for each of the above live under{' '}
                <code className="rounded border border-[#D6CDB6] bg-[#F5EFDC] px-1.5 py-0.5 text-[12.5px]">
                  app/api/
                </code>{' '}
                if you ever want to read them. Anthropic doesn&apos;t train on
                API traffic by default; Mull doesn&apos;t opt into anything
                else.
              </p>
            </Prose>
          </PixelWindow>
        </section>

        {/* ─── 06 · What we store ──────────────────────────────── */}
        <section id="storage" className="scroll-mt-20">
          <SectionEyebrow n="06" />
          <PixelWindow title="WHAT WE STORE" badge="▶ ON THE SERVER">
            <Prose>
              <p>Three categories of data:</p>
            </Prose>
            <ul className="mt-3 space-y-2.5">
              <NotItem>
                <strong>Auth.</strong> Your email, a hashed password, and
                Supabase&apos;s session metadata. We never see your password
                in plaintext; password reset goes through Supabase&apos;s
                standard flow.
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
                (your language preference) and the Supabase auth session
                token. Both are strictly necessary for the site to work; we
                don&apos;t set any analytics, advertising, or tracking
                cookies.
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
        </section>

        {/* ─── 07 · Open questions ─────────────────────────────── */}
        <section id="open" className="scroll-mt-20">
          <SectionEyebrow n="07" />
          <PixelWindow
            title="OPEN QUESTIONS"
            badge="▶ HONEST LIMITS"
            accent={SECTION_ACCENTS.open}
          >
            <Prose>
              <p>
                This is not a finished thing. The honest list of what is
                unsolved:
              </p>
            </Prose>
            <ul className="mt-3 space-y-2.5">
              <NotItem>
                The <strong>weighting per quiz answer</strong> was hand-tuned
                by reading patterns in early test results. It hasn&apos;t been
                calibrated against any external standard. A rigorous
                validation pass is on the long-term roadmap.
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
                heavily based on how much they discriminate between
                archetypes. We don&apos;t do that yet.
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
        </section>
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

// ─── Atoms ───────────────────────────────────────────────────────

function SectionEyebrow({ n }: { n: string }) {
  return (
    <div
      className="mb-2 ml-1 inline-flex items-center gap-2 text-[10px] tracking-[0.22em] text-[#8C6520]"
      style={{ fontFamily: 'var(--font-pixel-display)' }}
    >
      <span className="border border-[#8C6520] px-1.5 py-0.5 text-[#221E18]">
        {n}
      </span>
      <span>· SECTION</span>
    </div>
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
      style={{ fontFamily: 'var(--font-editorial)' }}
    >
      {children}
    </div>
  );
}

function NotItem({ children }: { children: React.ReactNode }) {
  return (
    <li
      className="border-l-4 px-4 py-2.5 text-[14.5px] leading-[1.6] text-[#4A4338]"
      style={{
        borderColor: '#B8862F',
        background: '#FFFCF4',
        fontFamily: 'var(--font-editorial)',
      }}
    >
      {children}
    </li>
  );
}

// ─── Pipeline schematic boxes (used in §04) ──────────────────────

function PipelineBox({
  label,
  body,
}: {
  label: string;
  body: React.ReactNode;
}) {
  return (
    <div
      className="flex flex-col border-2 border-[#221E18] bg-[#F8EDC8] p-2.5"
      style={{ boxShadow: '2px 2px 0 0 #7A8B43' }}
    >
      <div
        className="mb-1 text-[9px] tracking-[0.22em] text-[#5C4528]"
        style={{ fontFamily: 'var(--font-pixel-display)' }}
      >
        {label.toUpperCase()}
      </div>
      <div
        className="text-[12px] leading-[1.4] text-[#221E18]"
        style={{ fontFamily: 'var(--font-editorial)' }}
      >
        {body}
      </div>
    </div>
  );
}

function PipelineArrow() {
  return (
    <div className="hidden items-center justify-center text-[#7A8B43] sm:flex">
      <span
        className="text-[20px]"
        style={{ fontFamily: 'var(--font-pixel-display)' }}
      >
        ▶
      </span>
    </div>
  );
}

// ─── AI integration card (used in §05) ───────────────────────────

function AIIntegrationCard({
  n,
  where,
  what,
  input,
  output,
}: {
  n: string;
  where: string;
  what: string;
  input: string;
  output: string;
}) {
  return (
    <div
      className="border-2 border-[#221E18] bg-[#FFFCF4] p-4"
      style={{ boxShadow: '3px 3px 0 0 #3F2454' }}
    >
      <div className="mb-2 flex items-center gap-2">
        <span
          className="border border-[#221E18] bg-[#6B3E8C] px-1.5 py-0.5 text-[10px] tracking-[0.1em] text-[#FFFCF4]"
          style={{ fontFamily: 'var(--font-pixel-display)' }}
        >
          {n}
        </span>
        <h3
          className="text-[16px] font-medium leading-tight text-[#221E18]"
          style={{ fontFamily: 'var(--font-editorial)' }}
        >
          {where}
        </h3>
      </div>
      <p
        className="text-[14px] leading-[1.55] text-[#221E18]"
        style={{ fontFamily: 'var(--font-editorial)' }}
      >
        {what}
      </p>
      <dl className="mt-3 grid grid-cols-1 gap-x-4 gap-y-1.5 sm:grid-cols-[auto_1fr]">
        <Kv label="Input" value={input} />
        <Kv label="Output" value={output} />
      </dl>
    </div>
  );
}

function Kv({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt
        className="text-[10px] tracking-[0.22em] text-[#8C6520]"
        style={{ fontFamily: 'var(--font-pixel-display)' }}
      >
        {label.toUpperCase()}
      </dt>
      <dd
        className="text-[13px] leading-[1.5] text-[#4A4338]"
        style={{ fontFamily: 'var(--font-editorial)' }}
      >
        {value}
      </dd>
    </>
  );
}
