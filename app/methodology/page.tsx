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
//
// i18n: like /about, this page is NOT statically generated (it reads
// the locale cookie at request time), so the body branches on locale.
// `zh` ships a full Chinese render (MethodologyBodyZh); every other
// locale gets the English body plus the honest ContentLanguageNotice.
// The §01 dimension grid uses t() so it localizes for free in both.

import Link from 'next/link';
import type { Metadata } from 'next';
import { getServerLocale } from '@/lib/locale-server';
import { t, type Locale } from '@/lib/translations';
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
// Keep in sync with LAST_REVIEWED when the review date changes.
const LAST_REVIEWED_ZH = '2026 年 5 月';

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

const SECTIONS_ZH = [
  { id: 'dimensions', n: '01', label: '十六个维度' },
  { id: 'why16',      n: '02', label: '为何是十六个' },
  { id: 'disclaimers',n: '03', label: '它不是什么' },
  { id: 'math',       n: '04', label: '从测验到坐标' },
  { id: 'ai',         n: '05', label: 'AI 身处何处' },
  { id: 'storage',    n: '06', label: '我们存储什么' },
  { id: 'open',       n: '07', label: '尚未解决的问题' },
] as const;

export default async function MethodologyPage() {
  const locale = await getServerLocale();

  return (
    <main className="mx-auto max-w-[860px] px-6 pb-32 pt-12 sm:px-10 sm:pt-16">
      <ContentLanguageNotice locale={locale} translatedLocales={['zh']} />

      {locale === 'zh' ? (
        <MethodologyBodyZh locale={locale} />
      ) : (
        <MethodologyBodyEn locale={locale} />
      )}
    </main>
  );
}

// ──────────────────────────────────────────────────────────────
// English body — default for every non-zh locale.
// ──────────────────────────────────────────────────────────────

function MethodologyBodyEn({ locale }: { locale: Locale }) {
  return (
    <>
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
        className="mb-10 border-y-2 border-ink bg-[#FBF6E8] px-3 py-3"
      >
        <div
          className="mb-2 text-[10px] tracking-[0.22em] text-acc-deep"
          style={{ fontFamily: 'var(--font-pixel-display)' }}
        >
          ▶ ON THIS PAGE
        </div>
        <ul className="flex flex-wrap gap-1.5">
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="inline-flex items-center gap-1.5 border-2 border-ink bg-[#FFFCF4] px-2.5 py-1 text-[11px] tracking-[0.06em] text-ink transition-colors hover:bg-[#F8C75E]"
                style={{ fontFamily: 'var(--font-pixel-display)' }}
              >
                <span className="text-acc-deep">{s.n}</span>
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
            <DimensionGrid locale={locale} />
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
            <div className="mt-6 border-2 border-ink bg-[#FFFCF4] p-4">
              <div
                className="mb-3 text-[10px] tracking-[0.22em] text-acc-deep"
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
                      <span className="text-[12px] text-ink-soft">
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
                <code className="rounded border border-line bg-[#F5EFDC] px-1.5 py-0.5 text-[12.5px]">
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
                <code className="rounded border border-line bg-[#F5EFDC] px-1.5 py-0.5 text-[12.5px]">
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
                  className="text-acc-deep underline decoration-acc/40 underline-offset-3 hover:decoration-acc-deep"
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

      <p className="mt-12 text-[13px] leading-[1.6] text-acc-deep opacity-80">
        Questions, push-back, or factual corrections welcome at{' '}
        <a
          href="mailto:jimmy.kaian.ji@gmail.com"
          className="underline decoration-acc/40 underline-offset-3 hover:decoration-acc-deep"
        >
          jimmy.kaian.ji@gmail.com
        </a>
        . This page is reviewed quarterly; the date at the top reflects the
        last full review.
      </p>

      <p className="mt-10 text-center text-[13px] text-acc-deep">
        <Link
          href="/"
          className="underline decoration-acc/40 underline-offset-3 hover:decoration-acc-deep"
        >
          ← Back to Mull
        </Link>
      </p>
    </>
  );
}

// ──────────────────────────────────────────────────────────────
// Chinese body — full zh render. Mirrors MethodologyBodyEn; the §01
// dimension grid and archetype names come from t(), so they match the
// rest of the zh site. Dimension codes, vectors, JSON shapes, model
// names, and file paths stay verbatim.
// ──────────────────────────────────────────────────────────────

function MethodologyBodyZh({ locale }: { locale: Locale }) {
  return (
    <>
      <PixelPageHeader
        eyebrow={`▶ 方法论 · 最近审阅于 ${LAST_REVIEWED_ZH}`}
        title="MULL 如何运作"
        subtitle={
          <p
            className="text-[17px] italic"
            style={{ fontFamily: 'var(--font-editorial)' }}
          >
            写给那些不满足于"关于"页面的读者。这里会详尽地为这套十六维度模型辩护，逐一列出 AI 在产品中所处的每一个位置，并诚实地开出一份我们尚未解决的问题清单。
          </p>
        }
      />

      {/* ─── 目录 ─── */}
      <nav
        aria-label="本页内容"
        className="mb-10 border-y-2 border-ink bg-[#FBF6E8] px-3 py-3"
      >
        <div
          className="mb-2 text-[10px] tracking-[0.22em] text-acc-deep"
          style={{ fontFamily: 'var(--font-pixel-display)' }}
        >
          ▶ 本页内容
        </div>
        <ul className="flex flex-wrap gap-1.5">
          {SECTIONS_ZH.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="inline-flex items-center gap-1.5 border-2 border-ink bg-[#FFFCF4] px-2.5 py-1 text-[11px] tracking-[0.06em] text-ink transition-colors hover:bg-[#F8C75E]"
                style={{ fontFamily: 'var(--font-pixel-display)' }}
              >
                <span className="text-acc-deep">{s.n}</span>
                <span>{s.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="space-y-10">
        {/* ─── 01 · 十六个维度 ─── */}
        <section id="dimensions" className="scroll-mt-20">
          <SectionEyebrow n="01" word="章节" />
          <PixelWindow
            title="十六个维度"
            badge="▶ 模型"
            accent={SECTION_ACCENTS.dimensions}
          >
            <Prose>
              <p>
                本页正是以它们命名。在论证为何恰好有十六个之前，先看看它们究竟是什么。每一个都由一个两字母代码、一个简短名称和一句话的刻画组成。在网站的其他地方，你可以将鼠标悬停（或点按）任意一张维度卡片，看到的正是同一段描述。
              </p>
            </Prose>
            <DimensionGrid locale={locale} />
          </PixelWindow>
        </section>

        {/* ─── 02 · 为何是十六个 ─── */}
        <section id="why16" className="scroll-mt-20">
          <SectionEyebrow n="02" word="章节" />
          <PixelWindow title="为何是十六个" badge="▶ 设计抉择">
            <Prose>
              <p>
                那些常见的替代方案——政治坐标、MBTI、大五人格——都把世界观压缩到两条、四条或五条轴上。这种压缩很方便（它能产出整齐的象限和便于分享的标签），代价却不小：真实的哲学立场并不栖身于这么少的几条轴上。休谟与佛陀在某种<em>"自我即幻象"</em>上得分都很高，可他们是从相反的方向抵达那里的。一个双轴系统看不出这其中的差别。
              </p>
              <p>
                这些维度是通过广泛研读经典、并不断追问而选定的：<em>当哲学家们真正产生分歧时，有哪些稳定的轴会跨越数个世纪反复出现？</em>最终留存下来的这份精简清单，是数十次迭代的结果——一些早期看似重要的轴（例如乐观／悲观）后来被发现只是其他维度的派生，于是被舍弃。另一些（<em>自我即幻象</em>、<em>共同体嵌入</em>）则因为一再区分出那些被别的轴抹平的思想家，而赢得了自己的位置。
              </p>
              <p>
                这些维度并不互斥，在任何严格的数学意义上也并不正交。<em>对理性的信任</em>与<em>对经验的信任</em>在某些哲学家身上同向变化，在另一些人身上则彼此拉开。<em>共同体嵌入</em>与<em>自主自我</em>部分对立，但在像孔子这样的人身上却可以双双得高分（他把自我深深安放于各种关系之中，<em>同时</em>又强调自我修养）。这个十六维空间并不是一组向量基；它是一套坐标系，意在捕捉哲学分歧的肌理。
              </p>
            </Prose>
          </PixelWindow>
        </section>

        {/* ─── 03 · 它不是什么 ─── */}
        <section id="disclaimers" className="scroll-mt-20">
          <SectionEyebrow n="03" word="章节" />
          <PixelWindow title="它不是什么" badge="▶ 免责声明">
            <ul className="space-y-3">
              <NotItem>
                <strong>不是性格测试。</strong> Mull 并不声称能预测行为。它试图描绘的，是你此刻落在"如何思考"这场漫长对话中的哪个位置。
              </NotItem>
              <NotItem>
                <strong>不是判决。</strong> 同一个人相隔半年再做一次测验，落点会略有不同。这种漂移正是最有意思的信号，而轨迹地图正是围绕它而建的。
              </NotItem>
              <NotItem>
                <strong>未经实证检验</strong>（在心理测量学的意义上）。这里没有效度研究，没有重测信度数据，也没有针对大规模用户样本的因子分析。这是一件经由研读哲学文本而<em>设计</em>出来的工具，而非被<em>发现</em>的工具。对于这一局限，我们直言不讳。
              </NotItem>
              <NotItem>
                <strong>并非文化中立。</strong> 维度的选取，反映了 Mull 作者研读得最为仔细的那些哲学传统——以西方为主，并有意识地向亚洲、非洲与原住民哲学拓展。这些维度试图捕捉跨传统反复出现的区分，但其框架不可避免地带有特定视角。
              </NotItem>
            </ul>
          </PixelWindow>
        </section>

        {/* ─── 04 · 从测验到坐标 ─── */}
        <section id="math" className="scroll-mt-20">
          <SectionEyebrow n="04" word="章节" />
          <PixelWindow
            title="从测验到坐标"
            badge="▶ 背后的数学"
            accent={SECTION_ACCENTS.math}
          >
            <Prose>
              <p>
                每道选择题有 3 到 6 个答案。每个答案都带着一个小小的向量——在十六个维度上有几个非零分量，权重从 +1 到 +3（正向），偶尔为负。这些向量会在你回答过的所有问题上累加，得出你的原始坐标。随后，这个坐标会通过余弦相似度，与每一种原型（同样是手工设计的）的原型向量相比较，以选出一个主导原型。
              </p>
            </Prose>

            {/* 流程示意图——五个带标签的方框，中间以箭头相连，附样例数字 */}
            <div className="mt-6 border-2 border-ink bg-[#FFFCF4] p-4">
              <div
                className="mb-3 text-[10px] tracking-[0.22em] text-acc-deep"
                style={{ fontFamily: 'var(--font-pixel-display)' }}
              >
                ▶ 示例——一个答案，从头到尾
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-5 sm:items-stretch sm:gap-1">
                <PipelineBox
                  label="问题"
                  body="“面对艰难抉择时，你会从原则出发来推理吗？”"
                />
                <PipelineArrow />
                <PipelineBox
                  label="所选答案"
                  body="“几乎总是。”"
                />
                <PipelineArrow />
                <PipelineBox
                  label="Δ 向量"
                  body={
                    <span className="font-mono">
                      {`{ TR:+3, TD:+1, UI:+1 }`}
                    </span>
                  }
                />
              </div>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-5 sm:items-stretch sm:gap-1">
                <PipelineBox
                  label="累计向量 V"
                  body={
                    <span className="font-mono">
                      [4, 5, 3, <strong>8</strong>, 6, 4, 2, 3, 5, 5, 7,{' '}
                      <strong>9</strong>, 4, 5, <strong>7</strong>, 3]
                    </span>
                  }
                />
                <PipelineArrow />
                <PipelineBox
                  label="与 10 种原型的余弦"
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
                  label="结果"
                  body={
                    <>
                      <strong className="text-[#1E3A5F]">制图师</strong>
                      <br />
                      <span className="text-[12px] text-ink-soft">
                        （约 85% 契合）
                      </span>
                    </>
                  }
                />
              </div>
            </div>

            <Prose className="mt-5">
              <p>
                跳过问题会减少总的信号量，但不会让坐标产生偏倚——被跳过的问题只是不作贡献而已。多选题会把权重分摊到所选的各个答案上。原始向量会显示在结果页（维度剖面那一节）上，好让你看到背后的数学，而不只是结论。
              </p>
              <p>
                每日困境、日记条目和练习反思的运作方式则不同。它们的向量来自<em>Claude 对你文字的阅读</em>——这是模型唯一对你的地图拥有裁量权的地方。下一节会逐一说明它究竟如何运作。
              </p>
            </Prose>
          </PixelWindow>
        </section>

        {/* ─── 05 · AI 身处何处 ─── */}
        <section id="ai" className="scroll-mt-20">
          <SectionEyebrow n="05" word="章节" />
          <PixelWindow
            title="AI 身处何处"
            badge="▶ 五个位置"
            accent={SECTION_ACCENTS.ai}
          >
            <Prose>
              <p>
                五个位置，全都很狭窄，且就模型的训练而言全都是只读的。Mull 不会把你的数据交给任何人去做训练；除了你在自己账户里看到的内容之外，它既不存储也不暴露这些数据。当前使用的模型是经由 Anthropic 官方 API 调用的{' '}
                <strong>Claude Sonnet 4.6</strong>。没有嵌入向量，没有向量数据库，也没有任何第三方 AI 工具。
              </p>
            </Prose>
            <div className="mt-5 grid grid-cols-1 gap-3">
              <AIIntegrationCard
                n="01"
                where="提交每日困境"
                what="读取你的文字回应，返回一个十六维向量增量 + 一句话分析。"
                input="当天的提示 + 你的回应"
                output="JSON：{ vector_delta: [16 floats], analysis: string }"
                locale={locale}
              />
              <AIIntegrationCard
                n="02"
                where="提交日记条目"
                what={'与困境相同的"文字转向量"流程，只是配上日记那种开放式的提示。'}
                input="你的日记内容（以及可选的标题）"
                output="JSON：{ vector_delta: [16 floats], analysis: string }"
                locale={locale}
              />
              <AIIntegrationCard
                n="03"
                where="提交练习反思"
                what="读取你对某个结构化练习的反思，返回一个小的向量增量。"
                input="练习的上下文（名称 + 反思提示）+ 你的反思文字"
                output="JSON：{ vector_delta: [16 floats], analysis: string }"
                locale={locale}
              />
              <AIIntegrationCard
                n="04"
                where="竞技场与模拟哲学家辩论"
                what="生成入戏的哲学家声音（Haiku），再由一位 Sonnet 裁判就严谨、原则与投入为双方评分——而非评判谁胜谁负。"
                input="两位思想家的坐标向量 + 话题 + 用户的各个回合"
                output="一场 3 至 6 回合的交锋 + 一份结构化的裁决，存入你的历史记录"
                locale={locale}
              />
              <AIIntegrationCard
                n="05"
                where="年度回顾（Mull+）"
                what="读取你一整年的困境 + 日记 + 反思，写下一篇约 700 字的随笔，讲述你的思想如何移动。"
                input="该用户整年提交的所有文字"
                output="一篇展示在你账户里的长篇随笔"
                locale={locale}
              />
            </div>
            <Prose className="mt-5">
              <p>
                上述每一项的系统提示都放在{' '}
                <code className="rounded border border-line bg-[#F5EFDC] px-1.5 py-0.5 text-[12.5px]">
                  app/api/
                </code>{' '}
                目录下，如果你想读，随时可以去看。Anthropic 默认不会用 API 流量来训练模型；Mull 也没有选择加入任何其他用途。
              </p>
            </Prose>
          </PixelWindow>
        </section>

        {/* ─── 06 · 我们存储什么 ─── */}
        <section id="storage" className="scroll-mt-20">
          <SectionEyebrow n="06" word="章节" />
          <PixelWindow title="我们存储什么" badge="▶ 服务器上">
            <Prose>
              <p>三类数据：</p>
            </Prose>
            <ul className="mt-3 space-y-2.5">
              <NotItem>
                <strong>身份认证。</strong> 你的邮箱、一段哈希处理过的密码，以及 Supabase 的会话元数据。我们从不会看到你的明文密码；密码重置走的是 Supabase 的标准流程。
              </NotItem>
              <NotItem>
                <strong>你的数据。</strong> 测验记录（连同得出的十六维向量 + 所选原型）、困境回应、日记条目、练习反思、辩论历史，以及——如果你选择开启——你的公开资料设置。每一行都标有你的用户 ID；行级安全策略确保只有你本人（以及，若你选择公开，那些被明确标记为公开的行才对公众）可读。
              </NotItem>
              <NotItem>
                <strong>Cookie。</strong> 共两个：{' '}
                <code className="rounded border border-line bg-[#F5EFDC] px-1.5 py-0.5 text-[12.5px]">
                  mull_locale
                </code>{' '}
                （你的语言偏好）和 Supabase 的认证会话令牌。两者对网站的运作都是严格必需的；我们不设置任何用于分析、广告或追踪的 Cookie。
              </NotItem>
            </ul>
            <Prose className="mt-4">
              <p>
                你可以在公开资料设置页，{' '}
                <Link
                  href="/account/profile"
                  className="text-acc-deep underline decoration-acc/40 underline-offset-3 hover:decoration-acc-deep"
                >
                  把这一切下载为 JSON，或干脆直接删除你的账户
                </Link>
                。
              </p>
            </Prose>
          </PixelWindow>
        </section>

        {/* ─── 07 · 尚未解决的问题 ─── */}
        <section id="open" className="scroll-mt-20">
          <SectionEyebrow n="07" word="章节" />
          <PixelWindow
            title="尚未解决的问题"
            badge="▶ 诚实的局限"
            accent={SECTION_ACCENTS.open}
          >
            <Prose>
              <p>
                这并不是一件已经完成的东西。以下是尚未解决之处的诚实清单：
              </p>
            </Prose>
            <ul className="mt-3 space-y-2.5">
              <NotItem>
                <strong>每个测验答案的权重</strong>，是通过观察早期测试结果中的模式手工调出来的。它尚未对照任何外部标准做过校准。一次严格的效度检验，列在长期路线图上。
              </NotItem>
              <NotItem>
                <strong>哲学家的坐标向量</strong>取自对他们实际著作的研读，但它们由单独一位编辑（Jimmy）指派。若有各传统的学者来审阅这些指派，会大大收紧它们；这件事排在订阅收入足以支付学者酬劳之后。
              </NotItem>
              <NotItem>
                <strong>原型的指派</strong>使用余弦相似度，而它把所有维度视为同等重要。一件真正的心理测量工具，会依据各条轴在区分原型时的辨别力，给某些轴更高的权重。我们还没有这么做。
              </NotItem>
              <NotItem>
                <strong>这十六个维度本身</strong>，并不能被证明就是正确的那十六个。它们是仔细研读与多次迭代的结果，但我们主张的是它们有用，而非在形而上学上正确。
              </NotItem>
              <NotItem>
                <strong>这十种原型并不能同样妥帖地覆盖每一种哲学立场。</strong>高度尊崇传统、同时又高度自主的那种组合——那位伯克式的保守主义者，既敬重承袭而来的制度，又把道德权威安放在个体身上——栖身于十六维空间中一个无人认领的象限。落在那个象限里的人，会靠近龙骨或炉火，却很少正好<em>落在</em>它们之上。维度层面的解读是更诚实的写照；原型标签则是近似。未来的某次模型修订，或许会在这里增添一个原型。
              </NotItem>
            </ul>
          </PixelWindow>
        </section>
      </div>

      <p className="mt-12 text-[13px] leading-[1.6] text-acc-deep opacity-80">
        欢迎把问题、异议或事实更正发送至{' '}
        <a
          href="mailto:jimmy.kaian.ji@gmail.com"
          className="underline decoration-acc/40 underline-offset-3 hover:decoration-acc-deep"
        >
          jimmy.kaian.ji@gmail.com
        </a>
        。本页每季度审阅一次；顶部的日期反映的是最近一次完整审阅。
      </p>

      <p className="mt-10 text-center text-[13px] text-acc-deep">
        <Link
          href="/"
          className="underline decoration-acc/40 underline-offset-3 hover:decoration-acc-deep"
        >
          ← 返回 Mull
        </Link>
      </p>
    </>
  );
}

// ─── Atoms ───────────────────────────────────────────────────────

// §01 dimension grid — locale-aware (dim names + descriptions via t()),
// so it renders correctly in both the English and Chinese bodies.
function DimensionGrid({ locale }: { locale: Locale }) {
  return (
    <div className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
      {DIM_KEYS.map((k) => (
        <div
          key={k}
          className="flex gap-3 border-2 border-ink bg-[#FFFCF4] px-3 py-2.5"
          style={{ boxShadow: '2px 2px 0 0 var(--color-acc)' }}
        >
          <div
            className="shrink-0 self-start border-2 border-ink bg-[#F8C75E] px-2 py-1 text-[11px] font-bold leading-none text-[#1A1820]"
            style={{
              fontFamily: 'var(--font-pixel-display)',
              letterSpacing: '0.05em',
            }}
          >
            {k}
          </div>
          <div className="min-w-0">
            <div
              className="text-[14px] font-medium leading-tight text-ink"
              style={{ fontFamily: 'var(--font-editorial)' }}
            >
              {t(`dim.${k}.name`, locale) || DIM_NAMES[k]}
            </div>
            <div
              className="mt-1 text-[12.5px] leading-[1.45] text-ink-soft"
              style={{ fontFamily: 'var(--font-editorial)' }}
            >
              {t(`dim.${k}.desc`, locale) || DIM_DESCRIPTIONS[k]}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function SectionEyebrow({ n, word = 'SECTION' }: { n: string; word?: string }) {
  return (
    <div
      className="mb-2 ml-1 inline-flex items-center gap-2 text-[10px] tracking-[0.22em] text-acc-deep"
      style={{ fontFamily: 'var(--font-pixel-display)' }}
    >
      <span className="border border-acc-deep px-1.5 py-0.5 text-ink">
        {n}
      </span>
      <span>· {word}</span>
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
        'space-y-4 text-[15.5px] leading-[1.65] text-ink-soft [&_strong]:text-ink ' +
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
      className="border-l-4 px-4 py-2.5 text-[14.5px] leading-[1.6] text-ink-soft"
      style={{
        borderColor: 'var(--color-acc)',
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
      className="flex flex-col border-2 border-ink bg-acc-soft p-2.5"
      style={{ boxShadow: '2px 2px 0 0 #7A8B43' }}
    >
      <div
        className="mb-1 text-[9px] tracking-[0.22em] text-[#5C4528]"
        style={{ fontFamily: 'var(--font-pixel-display)' }}
      >
        {label.toUpperCase()}
      </div>
      <div
        className="text-[12px] leading-[1.4] text-ink"
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
  locale = 'en',
}: {
  n: string;
  where: string;
  what: string;
  input: string;
  output: string;
  locale?: Locale;
}) {
  const inLabel = locale === 'zh' ? '输入' : 'Input';
  const outLabel = locale === 'zh' ? '输出' : 'Output';
  return (
    <div
      className="border-2 border-ink bg-[#FFFCF4] p-4"
      style={{ boxShadow: '3px 3px 0 0 #3F2454' }}
    >
      <div className="mb-2 flex items-center gap-2">
        <span
          className="border border-ink bg-[#6B3E8C] px-1.5 py-0.5 text-[10px] tracking-[0.1em] text-[#FFFCF4]"
          style={{ fontFamily: 'var(--font-pixel-display)' }}
        >
          {n}
        </span>
        <h3
          className="text-[16px] font-medium leading-tight text-ink"
          style={{ fontFamily: 'var(--font-editorial)' }}
        >
          {where}
        </h3>
      </div>
      <p
        className="text-[14px] leading-[1.55] text-ink"
        style={{ fontFamily: 'var(--font-editorial)' }}
      >
        {what}
      </p>
      <dl className="mt-3 grid grid-cols-1 gap-x-4 gap-y-1.5 sm:grid-cols-[auto_1fr]">
        <Kv label={inLabel} value={input} />
        <Kv label={outLabel} value={output} />
      </dl>
    </div>
  );
}

function Kv({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt
        className="text-[10px] tracking-[0.22em] text-acc-deep"
        style={{ fontFamily: 'var(--font-pixel-display)' }}
      >
        {label.toUpperCase()}
      </dt>
      <dd
        className="text-[13px] leading-[1.5] text-ink-soft"
        style={{ fontFamily: 'var(--font-editorial)' }}
      >
        {value}
      </dd>
    </>
  );
}
