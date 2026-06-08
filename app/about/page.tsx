// /about — v3 pixel chrome restyle.
//
// Same content as before (kept manually in sync with the About
// section in public/mull.html). The prose stays in editorial
// Cormorant inside pixel panels — the "library book inside the
// game" beat that the redesign leans on. Section titles in
// Press Start 2P, body in Cormorant.
//
// i18n: this page is NOT statically generated (it reads the locale
// cookie via getServerLocale at request time), so we can branch the
// body on the server. `zh` ships a full Chinese render (AboutBodyZh);
// every other locale gets the English body plus the honest
// ContentLanguageNotice. When another locale's translation lands,
// add it to `translatedLocales` and give it its own body branch.

import Link from 'next/link';
import type { Metadata } from 'next';
import { getServerLocale } from '@/lib/locale-server';
import { PHILOSOPHERS } from '@/lib/philosophers';
import { PixelWindow, PixelPageHeader } from '@/components/pixel-window';
import { ContentLanguageNotice } from '@/components/content-language-notice';
import { TIPPING_ENABLED } from '@/lib/feature-flags';

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
      <ContentLanguageNotice locale={locale} translatedLocales={['zh']} />

      {locale === 'zh' ? <AboutBodyZh /> : <AboutBodyEn />}
    </main>
  );
}

// ──────────────────────────────────────────────────────────────
// English body — default for every non-zh locale.
// ──────────────────────────────────────────────────────────────

function AboutBodyEn() {
  return (
    <>
      <PixelPageHeader
        eyebrow="▶ ABOUT MULL"
        title="A PASSION PROJECT"
        subtitle={
          <div className="space-y-3">
            <p className="text-[16px] italic" style={{ fontFamily: "var(--font-editorial)" }}>
              Built on nights and weekends. Funded by nothing in particular.
            </p>
            <p className="text-[14px] text-acc-deep">
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
              The {PHILOSOPHERS.length} thinkers in the constellation are there as company, not
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
              a fifteen-minute country-house murder mystery — a reclusive
              philosopher is dead, you&apos;re one of seven inheritors,
              four chambers each hide an anomaly, two unexpected twists,
              ten distinct endings based on your archetype. Same
              16-dimensional placement underneath; delivered as genre
              fiction. The home page leads with the Inheritor; the classic
              is one click away.
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
            <Promise title={`${PHILOSOPHERS.length} philosophers, 10 archetypes, 12 topics, 30 matchups.`}>
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
            <Promise title="Daily Spar.">
              A 5-minute philosophical sparring match. One philosopher,
              one topic, one turn each. Sonnet judges in 30 seconds.
              Rotates daily. Different from the Arena because it&rsquo;s
              built for the user who doesn&rsquo;t have 20 minutes for a
              full debate but wants the rigor practice.
            </Promise>
            <Promise title="The Pilgrimage — 30 days for your archetype.">
              A 30-day course shaped for the kind of mind you turned out
              to be. Ten archetype-specific arcs, each with its own
              phases, prompts, and per-flavor enrollment lens. One prompt
              per day. Different from the dilemma in that it has a curve
              — by Day 30 your map has moved.
            </Promise>
            <Promise title="The Crucible — daily real action.">
              Not a hypothetical. A small actual thing to do today,
              chosen from a pool of sixty rotating prompts. Tomorrow Mull
              asks how it went. Stoic evening-review meets daily moral
              practice.
            </Promise>
            <Promise title="The Wandering Question — one question per week.">
              A single question travels with you Mon-Wed-Fri-Sun. First
              response, then kindred takes, then far takes, then your
              own synthesis. Weekly arc, real ending each time.
            </Promise>
            <Promise title="Argument Diary.">
              Log a real argument from your life and Mull returns a
              steelman of the other side, two specific fallacies in your
              framing, and three kindred philosophers&rsquo; takes.
              Journal-with-feedback.
            </Promise>
            <Promise title="Personal Anthology + Year-in-View + Capability Atlas.">
              Three persistent surfaces. The Anthology is your
              commonplace book — save passages and verdicts from
              anywhere. Year-in-View is your annual record, updated the
              day you live it. The Atlas tracks six skills (Rigor,
              Depth, Consistency, Range, Self-Awareness, Synthesis) with
              level-up badges that fire on every completed action.
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
                className="text-acc-deep underline decoration-acc/40 underline-offset-3 hover:decoration-acc-deep"
              >
                jimmy.kaian.ji@gmail.com
              </a>
              .
            </p>
          </Prose>
          <div
            className="mt-5 border-l-4 px-5 py-4 text-[14.5px] leading-[1.65] text-ink-soft"
            style={{ borderColor: 'var(--color-acc)', background: '#FBF6E8' }}
          >
            <strong className="text-ink">A short note from Jimmy:</strong>{' '}
            Mull is currently running entirely free — no subscriptions, no
            ads, no data sale. The full Stripe wiring is built and dormant; we&apos;ll
            flip it on if and when keeping the site running needs it. Until
            then, the costs come out of my pocket
            {/* Ko-fi tip ask hidden via TIPPING_ENABLED (legal hold on
                accepting tips). The "Mull is free" reassurance above stays;
                only the solicitation is gated. Flip the flag to restore. */}
            {TIPPING_ENABLED ? (
              <>
                , and anyone who finds Mull useful and can spare anything
                can{' '}
                <a
                  href="https://ko-fi.com/mull"
                  target="_blank"
                  rel="noopener"
                  className="text-acc-deep underline decoration-acc/40 underline-offset-3 hover:decoration-acc-deep"
                >
                  tip on Ko-fi
                </a>{' '}
                — which materially helps keep the lights on, especially as
                the Arena adds real AI cost per match.
              </>
            ) : (
              '.'
            )}
          </div>
        </PixelWindow>

        <PixelWindow title="THE ECONOMICS, OPENLY" badge="▶ COSTS + WHO PAYS">
          <Prose>
            <p>
              Real products with real databases and AI inference cost
              real money. Most of Mull is free for everyone and always
              will be. The features that cost money per use are honest
              about it below.
            </p>
            <p>
              <strong>Per-use AI cost — the actual numbers:</strong>
            </p>
          </Prose>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full border-collapse text-[14px]">
              <thead>
                <tr className="border-b-2 border-ink">
                  <Th>FEATURE</Th>
                  <Th>COST PER USE</Th>
                  <Th>WHY</Th>
                </tr>
              </thead>
              <tbody>
                <Tr cells={['Arena debate (PvE, 4–8 turns + judge)', '~$0.15–0.20', 'Haiku per turn + Sonnet judge']} netClass="neutral" />
                <Tr cells={['Daily Spar (1 turn + judge)', '~$0.05–0.08', 'Haiku turn + Sonnet judge']} netClass="neutral" />
                <Tr cells={['Daily dilemma / diary / exercise', '~$0.005', 'Haiku prose→vector']} netClass="neutral" />
                <Tr cells={['Argument Diary analysis', '~$0.005–0.01', 'Single Haiku call']} netClass="neutral" />
                <Tr cells={['Yearly retrospective (Mull+)', '~$0.30–0.50', 'Sonnet over your full year']} netClass="neutral" />
                <Tr cells={['Inheritor mystery / Pilgrimage / Crucible / Wandering / Atlas / Anthology / Year-in-View', '$0', 'No AI calls']} netClass="positive" />
                <Tr cells={['Quiz / Map / Philosopher pages / Topics / Vs', '$0', 'Static / deterministic']} netClass="positive" />
              </tbody>
            </table>
          </div>

          <Prose className="mt-5">
            <p>
              <strong>Estimated monthly cost at different sizes</strong>{' '}
              — AI inference is the dominant variable. Anthropic
              charges 20% VAT on top of the listed API price, so $1
              of API cost is $1.20 in actual cash out. Numbers below
              are inclusive of VAT. Infrastructure (Supabase + Vercel
              + Resend) stays free until the low thousands of MAU,
              then adds ~$65–200/mo.
            </p>
          </Prose>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full border-collapse text-[14px]">
              <thead>
                <tr className="border-b-2 border-ink">
                  <Th>ACTIVE USERS</Th>
                  <Th>MONTHLY COST (CASH, INC. VAT)</Th>
                  <Th>WHO PAYS</Th>
                </tr>
              </thead>
              <tbody>
                <Tr cells={['Under 100', '~$6–85', 'Maintainer + tips']} netClass="neutral" />
                <Tr cells={['500', '~$420', 'Tips + maintainer']} netClass="neutral" />
                <Tr cells={['1,000', '~$865', 'Tips + Mull+ subscribers (when active)']} netClass="neutral" />
                <Tr cells={['5,000', '~$4,200', 'Mull+ subscriptions cover most']} netClass="neutral" />
                <Tr cells={['10,000', '~$8,640', 'Mull+ + grants / external funding']} netClass="neutral" />
              </tbody>
            </table>
          </div>

          <Prose className="mt-5">
            <p>
              <strong>How features are gated</strong> — designed so the
              free tier stays generous on contemplative surfaces and
              only the heavy AI features get per-day caps:
            </p>
          </Prose>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full border-collapse text-[14px]">
              <thead>
                <tr className="border-b-2 border-ink">
                  <Th>FEATURE</Th>
                  <Th>FREE</Th>
                  <Th>MULL+ ($4.99/mo)</Th>
                </tr>
              </thead>
              <tbody>
                <Tr cells={['Quiz / Inheritor / Map / Philosophers / Topics / Vs', 'Unlimited', 'Unlimited']} netClass="positive" />
                <Tr cells={['Pilgrimage / Crucible / Wandering / Anthology / Atlas / Year', 'Unlimited', 'Unlimited']} netClass="positive" />
                <Tr cells={['Daily Dilemma', '1/day', '1/day']} netClass="positive" />
                <Tr cells={['Diary', '3/day', 'Unlimited']} netClass="neutral" />
                <Tr cells={['Daily Spar', '1/day', '5/day']} netClass="neutral" />
                <Tr cells={['Arena PvE', '1/day', 'Unlimited']} netClass="neutral" />
                <Tr cells={['Argument Diary', '3/week', 'Unlimited']} netClass="neutral" />
                <Tr cells={['Yearly retrospective', '—', 'Included']} netClass="neutral" />
                <Tr cells={['Reading Hour / Long Letter / Mull Open (when built)', '—', 'Included']} netClass="neutral" />
              </tbody>
            </table>
          </div>

          <p className="mt-3 text-[13px] leading-[1.55] text-acc-deep">
            Hard global cap regardless of tier: max 10 Spars + 5 Arena
            debates + 5 Argument Diary calls per day per user, and a
            site-wide daily AI-spend ceiling that auto-pauses new
            inference if exceeded. Cost protection, not retention
            squeeze.
          </p>

          {/* Economics box — always visible. The Mull+ subscription /
              "free forever" copy stays up regardless; only the Ko-fi tip
              lead is gated behind TIPPING_ENABLED (legal hold on accepting
              tips). Flip the flag in lib/feature-flags.ts to restore the
              tip ask and swap the heading back. */}
          <div
            className="mt-6 border-2 px-5 py-4 text-[14px] leading-[1.65] text-ink-soft"
            style={{
              borderColor: '#E2D8B6',
              background: '#F5EFDC',
              boxShadow: '3px 3px 0 0 var(--color-acc)',
            }}
          >
            <strong className="text-ink">
              {TIPPING_ENABLED
                ? 'How to support Mull right now:'
                : 'How Mull stays free:'}
            </strong>{' '}
            {TIPPING_ENABLED && (
              <>
                tipping on{' '}
                <a
                  href="https://ko-fi.com/mull"
                  target="_blank"
                  rel="noopener"
                  className="text-acc-deep underline decoration-acc/40 underline-offset-3 hover:decoration-acc-deep"
                >
                  Ko-fi
                </a>{' '}
                is the most direct path.{' '}
              </>
            )}
            The full Mull+ subscription system ($4.99/month, $29/year,
            $59 lifetime Founding Mind pass) is built and dormant — it
            flips on when running costs require it, and never gates the
            quiz, map, philosopher pages, the Inheritor murder mystery,
            or the daily dilemma. Those stay free forever.
          </div>
        </PixelWindow>
      </div>

      <p className="mt-12 text-center text-[13px] text-acc-deep">
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
// Chinese body — full zh render. Mirrors AboutBodyEn structure and
// reuses the same atoms; only the copy differs. Cost figures, tier
// prices, emails, and product names stay verbatim.
// ──────────────────────────────────────────────────────────────

function AboutBodyZh() {
  return (
    <>
      <PixelPageHeader
        eyebrow="▶ 关于 MULL"
        title="因热爱而生"
        subtitle={
          <div className="space-y-3">
            <p className="text-[16px] italic" style={{ fontFamily: "var(--font-editorial)" }}>
              在深夜与周末间打磨，没有任何特定的资金来源。
            </p>
            <p className="text-[14px] text-acc-deep">
              这个页面的存在，是为了让每一位使用 Mull 的人都清楚自己在用什么——它是什么、不是什么、运营成本几何，又由谁来承担。
            </p>
          </div>
        }
      />

      <div className="space-y-8">
        <PixelWindow title="它为何存在" badge="▶ 使命">
          <Prose>
            <p>
              哲学是人类最初用来审视自身思维的工具——一门拒绝把自己的前提视为理所当然的学问。大多数人上完一门导论课便将它抛诸脑后，因为它的讲授方式让人觉得像是在背诵一座博物馆：年代、人名、学说、考试。
            </p>
            <p>
              Mull 把这一切颠倒过来。它不告诉你那些已故哲学家想过什么，而是问<strong>你</strong>怎么想——针对真实的问题，给出具体的回答——再告诉你，这些回答将你放在这场漫长对话中的哪个位置。这张地图不是判决，而是一面镜子。星图中的 {PHILOSOPHERS.length} 位思想家，是作为同伴、而非课程出现在那里的。
            </p>
          </Prose>
        </PixelWindow>

        <PixelWindow title="Mull 究竟是什么" badge="▶ 产品">
          <Prose>
            <p>
              这个网站早已超出了最初的那份测验。以下是它的各个部分，以及它们各自的用途：
            </p>
          </Prose>
          <ul className="mt-5 space-y-3">
            <Promise title="测验——两种通关方式。">
              经典的五分钟版本（二十道李克特量表式问题）让你迅速登上地图。<strong>《继承人》</strong>则是一场十五分钟的乡间宅邸谋杀谜案——一位离群索居的哲学家死了，你是七位继承人之一，四间密室各藏一处异常，两次意外反转，并依你的原型给出十种不同的结局。底层是同一套十六维度的定位，只是以类型小说的形式呈现。首页以《继承人》为主打，经典版本也只在一键之遥。
            </Promise>
            <Promise title="竞技场——与哲学家争辩，并获得评分。">
              就日常或哲学话题，与十位思想家中的任意一位（苏格拉底、尼采、阿伦特、孔子、密尔等——分三个难度档）展开辩论。一位中立的裁判会就逻辑的严谨、哲学的原则与投入的程度为双方评分——而<em>不</em>评判谁胜谁负。Elo 积分、排行榜、与真人对战的 PvP。当你已经知道自己身处何方，"接下来该做什么？"——竞技场便是 Mull 给出的答案。
            </Promise>
            <Promise title={`${PHILOSOPHERS.length} 位哲学家、10 种原型、12 个主题、30 场对决。`}>
              星图是整个网站的核心——一张你可以漫游的二维地图。每一个哲学家页面都是一篇小小的编辑随笔，原型页面则更为详尽。主题解说涵盖了哲学家们反复回到的那些问题（自由意志、电车难题、人生的意义、我们彼此亏欠什么）。对决页面则是跨越十六个维度的正面比较。
            </Promise>
            <Promise title="困境、日记、练习。">
              更小的几个板块，却是让人每日回访的那些。每天一则哲学困境，可以选择写下你的回应。一本私人的哲学日记。一座收录冥想练习的小型文库。一切皆为可选。
            </Promise>
            <Promise title="每日交锋。">
              一场五分钟的哲学过招。一位哲学家、一个话题、各出一招。Sonnet 在三十秒内作出裁决，每日轮换。它不同于竞技场——为那些挤不出二十分钟来完成整场辩论、却仍想练一练思辨严谨度的用户而设。
            </Promise>
            <Promise title="朝圣之旅——为你的原型而设的三十天。">
              一门为你这类心智量身打造的三十天课程。十条各属不同原型的旅程线，各有自己的阶段、提示，以及随风格而变的入门视角。每天一道提示。它与困境不同之处在于带有一条成长曲线——到第三十天，你的地图已经移动。
            </Promise>
            <Promise title="熔炉——每日的真实行动。">
              这不是假设，而是今天要去做的一件真实的小事，从六十条轮换的提示中选出。明天 Mull 会问你做得如何。斯多葛式的晚间自省，遇上每日的道德实践。
            </Promise>
            <Promise title="游走之问——每周一问。">
              一个问题在周一、周三、周五、周日一路伴你左右。先是初步回应，继而是相近的观点，再是迥异的看法，最后是你自己的综合。每周一段历程，每次都有一个真切的收束。
            </Promise>
            <Promise title="争论日记。">
              记下你生活中一次真实的争论，Mull 会回赠给你：对方立场的最强版本、你论述中的两处具体谬误，以及三位相近哲学家的看法。带反馈的日记。
            </Promise>
            <Promise title="个人文选 + 年度回望 + 能力图谱。">
              三个长期留存的板块。文选是你的摘抄簿——把任何地方的段落与判语收存其中。年度回望是你的年度记录，在你度过的当天即时更新。图谱追踪六项能力（严谨、深度、一致、广度、自我觉察、综合），每完成一次行动都会触发升级徽章。
            </Promise>
            <Promise title="班级（面向教育者）。">
              教师可以创建一个班级、分享邀请链接，并向学生发布哲学作业。任何拥有学术邮箱的人都可免费使用（自动识别 .edu / .ac.* / .k12.*.us）。
            </Promise>
          </ul>
        </PixelWindow>

        <PixelWindow title="这些原则" badge="▶ 承诺">
          <Prose>
            <p>
              塑造这款产品的那些价值。它们不会随着 Mull 的成长而改变——把它们写下来，正是为了这一点。
            </p>
          </Prose>
          <ul className="mt-5 space-y-3">
            <Promise title="永不投放广告。">
              没有横幅、没有追踪像素、没有赞助商的邮件位。你的思考只在你与模型之间。没有人能花钱买下把广告摆在它们旁边的特权。
            </Promise>
            <Promise title="绝不出售你的数据。">
              如果你注册账户，我们只保存你的邮箱和你存档的测验记录——别无其他。你可以把我们持有的、关于你的一切以 JSON 格式下载，或干脆直接删除账户，操作就在公开资料设置页（登录后，前往{' '}
              <em>账户 → 公开资料设置</em>）。你的地图默认私密；公开资料完全是自愿开启。
            </Promise>
            <Promise title="没有风险投资。">
              没有投资人、没有增长指标、没有董事会要求十倍回报。产品在我们认为该变的时候才变，而不是在某次季度考核要求出业绩的时候。
            </Promise>
            <Promise title="免费档始终慷慨。">
              如果 Mull 的成长越过了收支平衡线，每一块钱的盈余都会重新投回产品：更出色的大模型分析、聘请学者核实哲学家的立场、请插画师把人物像好好重画一遍、为学习实验室充实内容。即便再越过<em>那条线</em>，这些原则也一条都不会变。
            </Promise>
          </ul>
        </PixelWindow>

        <PixelWindow title="幕后是谁" badge="▶ 维护者">
          <Prose>
            <p>
              由 <strong>Jimmy Ji</strong> 打造，他是伦敦国王学院的一名哲学学生。Mull 目前是一个单人项目，尽管它还年轻，终会成长。如果你愿意帮忙、想对某个问题提出异议、推荐一位思想家，或报告一个 bug，欢迎写信至{' '}
              <a
                href="mailto:jimmy.kaian.ji@gmail.com"
                className="text-acc-deep underline decoration-acc/40 underline-offset-3 hover:decoration-acc-deep"
              >
                jimmy.kaian.ji@gmail.com
              </a>
              。
            </p>
          </Prose>
          <div
            className="mt-5 border-l-4 px-5 py-4 text-[14.5px] leading-[1.65] text-ink-soft"
            style={{ borderColor: 'var(--color-acc)', background: '#FBF6E8' }}
          >
            <strong className="text-ink">Jimmy 的一点说明：</strong>{' '}
            Mull 目前完全免费运行——没有订阅、没有广告、不出售数据。完整的 Stripe 收款已经搭好，只是处于休眠状态；只有当维持网站运转确实需要时，我们才会把它开启。在那之前，这些成本都由我自掏腰包
            {TIPPING_ENABLED ? (
              <>
                ，而任何觉得 Mull 有用、又愿意略尽绵薄的人，都可以{' '}
                <a
                  href="https://ko-fi.com/mull"
                  target="_blank"
                  rel="noopener"
                  className="text-acc-deep underline decoration-acc/40 underline-offset-3 hover:decoration-acc-deep"
                >
                  在 Ko-fi 上打赏
                </a>
                ——这能实实在在地帮我们维持运转，尤其是当竞技场的每一场对战都带来真金白银的 AI 成本时。
              </>
            ) : (
              '。'
            )}
          </div>
        </PixelWindow>

        <PixelWindow title="坦诚谈谈经济账" badge="▶ 成本与由谁承担">
          <Prose>
            <p>
              真实的产品，配上真实的数据库与 AI 推理，是要花真金白银的。Mull 的绝大部分对所有人免费，而且永远如此。那些每次使用都要花钱的功能，会在下方如实交代。
            </p>
            <p>
              <strong>单次使用的 AI 成本——实际数字：</strong>
            </p>
          </Prose>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full border-collapse text-[14px]">
              <thead>
                <tr className="border-b-2 border-ink">
                  <Th>功能</Th>
                  <Th>单次成本</Th>
                  <Th>原因</Th>
                </tr>
              </thead>
              <tbody>
                <Tr cells={['竞技场辩论（PvE，4–8 回合 + 裁判）', '~$0.15–0.20', '每回合 Haiku + Sonnet 裁判']} netClass="neutral" />
                <Tr cells={['每日交锋（1 回合 + 裁判）', '~$0.05–0.08', 'Haiku 回合 + Sonnet 裁判']} netClass="neutral" />
                <Tr cells={['每日困境 / 日记 / 练习', '~$0.005', 'Haiku 文本→向量']} netClass="neutral" />
                <Tr cells={['争论日记分析', '~$0.005–0.01', '单次 Haiku 调用']} netClass="neutral" />
                <Tr cells={['年度回顾（Mull+）', '~$0.30–0.50', 'Sonnet 通览你的一整年']} netClass="neutral" />
                <Tr cells={['《继承人》谜案 / 朝圣之旅 / 熔炉 / 游走之问 / 图谱 / 文选 / 年度回望', '$0', '无 AI 调用']} netClass="positive" />
                <Tr cells={['测验 / 地图 / 哲学家页面 / 主题 / 对决', '$0', '静态 / 确定性']} netClass="positive" />
              </tbody>
            </table>
          </div>

          <Prose className="mt-5">
            <p>
              <strong>不同规模下的预估月度成本</strong>{' '}
              ——AI 推理是最主要的变量。Anthropic 会在标示的 API 价格之上再收取 20% 的增值税，所以 1 美元的 API 成本，实际现金支出是 1.20 美元。下方数字均已含税。基础设施（Supabase + Vercel + Resend）在月活跃用户达到数千之前都保持免费，之后每月增加约 $65–200。
            </p>
          </Prose>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full border-collapse text-[14px]">
              <thead>
                <tr className="border-b-2 border-ink">
                  <Th>活跃用户</Th>
                  <Th>月度成本（现金，含税）</Th>
                  <Th>由谁承担</Th>
                </tr>
              </thead>
              <tbody>
                <Tr cells={['不足 100', '~$6–85', '维护者 + 打赏']} netClass="neutral" />
                <Tr cells={['500', '~$420', '打赏 + 维护者']} netClass="neutral" />
                <Tr cells={['1,000', '~$865', '打赏 + Mull+ 订阅者（启用后）']} netClass="neutral" />
                <Tr cells={['5,000', '~$4,200', 'Mull+ 订阅覆盖大部分']} netClass="neutral" />
                <Tr cells={['10,000', '~$8,640', 'Mull+ + 资助 / 外部资金']} netClass="neutral" />
              </tbody>
            </table>
          </div>

          <Prose className="mt-5">
            <p>
              <strong>功能如何分级</strong>——其设计宗旨是：让免费档在那些沉思性的板块上始终慷慨，只对消耗较大的 AI 功能设置每日上限：
            </p>
          </Prose>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full border-collapse text-[14px]">
              <thead>
                <tr className="border-b-2 border-ink">
                  <Th>功能</Th>
                  <Th>免费</Th>
                  <Th>MULL+（$4.99/月）</Th>
                </tr>
              </thead>
              <tbody>
                <Tr cells={['测验 / 继承人 / 地图 / 哲学家 / 主题 / 对决', '无限', '无限']} netClass="positive" />
                <Tr cells={['朝圣之旅 / 熔炉 / 游走之问 / 文选 / 图谱 / 年度', '无限', '无限']} netClass="positive" />
                <Tr cells={['每日困境', '1 次/天', '1 次/天']} netClass="positive" />
                <Tr cells={['日记', '3 次/天', '无限']} netClass="neutral" />
                <Tr cells={['每日交锋', '1 次/天', '5 次/天']} netClass="neutral" />
                <Tr cells={['竞技场 PvE', '1 次/天', '无限']} netClass="neutral" />
                <Tr cells={['争论日记', '3 次/周', '无限']} netClass="neutral" />
                <Tr cells={['年度回顾', '—', '包含']} netClass="neutral" />
                <Tr cells={['阅读时光 / 长信 / Mull 公开赛（建成后）', '—', '包含']} netClass="neutral" />
              </tbody>
            </table>
          </div>

          <p className="mt-3 text-[13px] leading-[1.55] text-acc-deep">
            无论哪个档位都有硬性总上限：每位用户每天最多 10 场交锋 + 5 场竞技场辩论 + 5 次争论日记调用；另有一道全站每日 AI 支出上限，一旦超出便自动暂停新的推理。这是为了控制成本，而非压榨留存。
          </p>

          <div
            className="mt-6 border-2 px-5 py-4 text-[14px] leading-[1.65] text-ink-soft"
            style={{
              borderColor: '#E2D8B6',
              background: '#F5EFDC',
              boxShadow: '3px 3px 0 0 var(--color-acc)',
            }}
          >
            <strong className="text-ink">
              {TIPPING_ENABLED
                ? '如何立刻支持 Mull：'
                : 'Mull 如何保持免费：'}
            </strong>{' '}
            {TIPPING_ENABLED && (
              <>
                在{' '}
                <a
                  href="https://ko-fi.com/mull"
                  target="_blank"
                  rel="noopener"
                  className="text-acc-deep underline decoration-acc/40 underline-offset-3 hover:decoration-acc-deep"
                >
                  Ko-fi
                </a>{' '}
                上打赏是最直接的方式。{' '}
              </>
            )}
            完整的 Mull+ 订阅体系（$4.99/月、$29/年、$59 的终身"创始心智"通行证）已经搭好，处于休眠——它会在运营成本需要时开启，且永远不会对测验、地图、哲学家页面、《继承人》谋杀谜案或每日困境设限。这些将永远免费。
          </div>
        </PixelWindow>
      </div>

      <p className="mt-12 text-center text-[13px] text-acc-deep">
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

// ──────────────────────────────────────────────────────────────
// Local helpers — small atoms used only on /about.
// ──────────────────────────────────────────────────────────────

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

function Promise({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <li
      className="border-l-4 px-4 py-3 text-[14.5px] leading-[1.55] text-ink-soft"
      style={{ borderColor: 'var(--color-acc)', background: '#FFFCF4' }}
    >
      <strong className="block text-[15.5px] text-ink" style={{ fontFamily: 'var(--font-editorial)' }}>
        {title}
      </strong>
      <span className="mt-1 inline-block">{children}</span>
    </li>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      className="px-2 py-2 text-left text-[10px] font-medium tracking-[0.16em] text-acc-deep"
      style={{ fontFamily: 'var(--font-pixel-display)' }}
    >
      {children}
    </th>
  );
}

function Tr({ cells, netClass }: { cells: string[]; netClass: 'positive' | 'neutral' }) {
  const netColor = netClass === 'positive' ? '#2F5D5C' : 'var(--color-acc-deep)';
  return (
    <tr className="border-b border-[#EBE3CA]">
      {cells.map((c, i) => (
        <td
          key={i}
          className={`px-2 py-3 text-[14px] ${
            i === cells.length - 1 ? 'font-medium' : ''
          }`}
          style={{ color: i === cells.length - 1 ? netColor : 'var(--color-ink)' }}
        >
          {c}
        </td>
      ))}
    </tr>
  );
}
