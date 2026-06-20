// /terms — v3 pixel chrome restyle. All content preserved.
//
// i18n: like /methodology, this page is NOT statically generated (it
// reads the locale cookie at request time), so the body branches on
// locale. `zh` ships a full Chinese render (TermsBodyZh); every other
// locale gets the English body (TermsBodyEn) plus the honest
// ContentLanguageNotice.

import Link from 'next/link';
import type { Metadata } from 'next';
import { getServerLocale } from '@/lib/locale-server';
import { ContentLanguageNotice } from '@/components/content-language-notice';
import { PixelWindow, PixelPageHeader } from '@/components/pixel-window';

export const metadata: Metadata = {
  title: 'Terms',
  description: 'The rules of using Mull, written plainly.',
  alternates: { canonical: 'https://mull.world/terms' },
};

const LAST_UPDATED = 'May 10, 2026';
// Keep in sync with LAST_UPDATED when the update date changes.
const LAST_UPDATED_ZH = '2026年5月10日';

export default async function TermsPage() {
  const locale = await getServerLocale();

  return (
    <main className="mx-auto max-w-[820px] px-6 pb-32 pt-12 sm:px-10 sm:pt-16">
      <ContentLanguageNotice locale={locale} translatedLocales={['zh']} />

      {locale === 'zh' ? <TermsBodyZh /> : <TermsBodyEn />}
    </main>
  );
}

// ──────────────────────────────────────────────────────────────
// English body — default for every non-zh locale. Byte-for-byte the
// pre-i18n page body.
// ──────────────────────────────────────────────────────────────

function TermsBodyEn() {
  return (
    <>
      <PixelPageHeader
        eyebrow={`▶ TERMS · UPDATED ${LAST_UPDATED.toUpperCase()}`}
        title="THE RULES, PLAINLY"
        subtitle={
          <p className="text-[16px] italic" style={{ fontFamily: 'var(--font-editorial)' }}>
            By using Mull you agree to the below. If anything is unclear, email{' '}
            <a
              href="mailto:jimmy.kaian.ji@gmail.com"
              className="not-italic text-acc-deep underline decoration-acc/40 underline-offset-3 hover:decoration-acc-deep"
            >
              jimmy.kaian.ji@gmail.com
            </a>{' '}
            — I&rsquo;d rather you understand than nod through.
          </p>
        }
      />

      <div className="space-y-8">
        <PixelWindow title="WHAT MULL IS" badge="▶ INTRO">
          <Prose>
            <p>
              Mull is a passion-project philosophy app: a 16-dimensional mapping of philosophical
              tendencies, an archetype model, a daily dilemma, and a few related practices (diary,
              debates with simulated philosophers, exercises). It&rsquo;s a tool for thinking, not
              therapy, not a diagnostic, not a substitute for any kind of professional advice.
            </p>
          </Prose>
        </PixelWindow>

        <PixelWindow title="YOUR ACCOUNT" badge="▶ RESPONSIBILITIES">
          <ul className="space-y-2">
            <ProseLi>
              You&rsquo;re responsible for keeping your password private. If you suspect someone
              else got into your account, change the password immediately.
            </ProseLi>
            <ProseLi>
              You&rsquo;re responsible for what you write — dilemma responses, diary entries, debate
              text, public profile content.
            </ProseLi>
            <ProseLi>
              One person, one account, please. Don&rsquo;t make multiple accounts to game
              leaderboards or get extra free AI tier.
            </ProseLi>
          </ul>
        </PixelWindow>

        <PixelWindow title="WHAT YOU CAN'T DO" badge="▶ NO-GO">
          <ul className="space-y-2">
            <ProseLi>
              Don&rsquo;t use Mull to harass anyone. Public profiles and any forthcoming community
              features are not vehicles for that.
            </ProseLi>
            <ProseLi>
              Don&rsquo;t scrape Mull&rsquo;s content (questions, archetype prose, philosopher
              database) for redistribution. The text is hand-written and the model is hand-tuned;
              ask before reusing.
            </ProseLi>
            <ProseLi>
              Don&rsquo;t try to break our servers — DDoS, exploit attempts, automated abuse of the
              AI endpoints. Rate limits are in place; circumventing them violates these terms.
            </ProseLi>
            <ProseLi>
              Don&rsquo;t submit content that&rsquo;s illegal in your jurisdiction or that infringes
              someone else&rsquo;s rights.
            </ProseLi>
          </ul>
        </PixelWindow>

        <PixelWindow title="WHAT WE CAN DO" badge="▶ ON OUR SIDE">
          <ul className="space-y-2">
            <ProseLi>
              Suspend or close accounts that violate these terms. We&rsquo;ll typically reach out
              before doing so unless the violation is egregious.
            </ProseLi>
            <ProseLi>
              Change Mull&rsquo;s features, design, and behavior over time. This is v0.9 — things
              will move. We&rsquo;ll communicate big changes via the welcome email or a banner.
            </ProseLi>
            <ProseLi>
              Discontinue any feature that isn&rsquo;t working out. We&rsquo;ll give notice and
              offer data export before removing anything you depend on.
            </ProseLi>
          </ul>
        </PixelWindow>

        <PixelWindow title="YOUR CONTENT · AI · SUBSCRIPTIONS">
          <Prose>
            <p>
              <strong>Your content.</strong> You own everything you write on Mull. By posting it on
              a public profile or to any community surface (when those exist), you grant us a
              non-exclusive license to display it as part of Mull&rsquo;s normal operation —
              that&rsquo;s the whole point of opting public. Take down a piece of public content any
              time and the license to display it ends with the takedown.
            </p>
            <p>
              <strong>AI output.</strong> Mull uses Claude (made by Anthropic) for parts of its
              analysis. AI-generated text — dilemma analyses, debate exchanges, retrospectives — is
              best treated as a thoughtful prompt, not authoritative truth. We do our best to make
              these useful and fair, but they will sometimes be wrong, miss context, or reflect
              biases inherited from the model. Don&rsquo;t make life decisions on the basis of one
              AI analysis.
            </p>
            <p>
              <strong>Subscriptions (when live).</strong> Subscriptions are not yet active at the
              time this is published. When they go live, the rules will be: clear pricing on the{' '}
              <Link
                href="/billing"
                className="text-acc-deep underline decoration-acc/40 underline-offset-3 hover:decoration-acc-deep"
              >
                billing page
              </Link>
              , no auto-renewal without warning, easy cancellation from your account, no dark
              patterns. We&rsquo;ll publish the specifics here at launch.
            </p>
          </Prose>
        </PixelWindow>

        <PixelWindow title="LIABILITY · PRIVACY · LAW · CONTACT">
          <Prose>
            <p>
              <strong>Limitation of liability.</strong> Mull is provided &ldquo;as is.&rdquo; To the
              extent the law allows, the maintainer is not liable for indirect, incidental, or
              consequential damages arising from your use of Mull. If something goes
              catastrophically wrong on our end, our liability is capped at what you&rsquo;ve paid
              us in the past twelve months — which is presently zero pounds.
            </p>
            <p>
              <strong>Privacy.</strong> See the{' '}
              <Link
                href="/privacy"
                className="text-acc-deep underline decoration-acc/40 underline-offset-3 hover:decoration-acc-deep"
              >
                privacy policy
              </Link>
              . The short version: we hold the bare minimum to make Mull work, no ads, no sale of
              data, you can download or delete everything any time.
            </p>
            <p>
              <strong>Governing law.</strong> These terms are governed by English law. Disputes go
              to the courts of England and Wales unless you&rsquo;re a consumer, in which case your
              local consumer-protection law also applies.
            </p>
            <p>
              <strong>Contact.</strong>{' '}
              <a
                href="mailto:jimmy.kaian.ji@gmail.com"
                className="text-acc-deep underline decoration-acc/40 underline-offset-3 hover:decoration-acc-deep"
              >
                jimmy.kaian.ji@gmail.com
              </a>
              .
            </p>
          </Prose>
        </PixelWindow>
      </div>

      <p className="mt-12 text-center text-[13px] text-acc-deep">
        Last updated: {LAST_UPDATED}.{' '}
        <Link
          href="/"
          className="ml-2 underline decoration-acc/40 underline-offset-3 hover:decoration-acc-deep"
        >
          ← Back to Mull
        </Link>
      </p>
    </>
  );
}

// ──────────────────────────────────────────────────────────────
// Chinese body — full zh render. Mirrors TermsBodyEn section-for-
// section. All href/mailto targets, the /billing and /privacy links,
// the email address, and the mull_locale code string stay verbatim.
// ──────────────────────────────────────────────────────────────

function TermsBodyZh() {
  return (
    <>
      <PixelPageHeader
        eyebrow={`▶ 条款 · 更新于 ${LAST_UPDATED_ZH}`}
        title="规则，直说"
        subtitle={
          <p className="text-[16px] italic" style={{ fontFamily: 'var(--font-editorial)' }}>
            使用 Mull 即表示你同意以下条款。若有任何不明之处，请发邮件至{' '}
            <a
              href="mailto:jimmy.kaian.ji@gmail.com"
              className="not-italic text-acc-deep underline decoration-acc/40 underline-offset-3 hover:decoration-acc-deep"
            >
              jimmy.kaian.ji@gmail.com
            </a>{' '}
            ——比起让你一路点头略过，我更希望你真正理解。
          </p>
        }
      />

      <div className="space-y-8">
        <PixelWindow title="MULL 是什么" badge="▶ 引言">
          <Prose>
            <p>
              Mull
              是一个出于热爱而做的哲学应用：一套对哲学倾向的十六维度刻画、一个原型模型、一道每日困境，以及若干相关的实践（日记、与模拟哲学家的辩论、练习）。它是一件用于思考的工具，而非心理治疗、并非诊断工具，也不能替代任何形式的专业建议。
            </p>
          </Prose>
        </PixelWindow>

        <PixelWindow title="你的账户" badge="▶ 责任">
          <ul className="space-y-2">
            <ProseLi>
              你有责任为你的密码保密。若你怀疑有他人登入了你的账户，请立即更改密码。
            </ProseLi>
            <ProseLi>你对自己所写的内容负责——困境回应、日记条目、辩论文字、公开资料内容。</ProseLi>
            <ProseLi>
              请一人一个账户。不要为了在排行榜上作弊或获取额外的免费 AI 额度而注册多个账户。
            </ProseLi>
          </ul>
        </PixelWindow>

        <PixelWindow title="你不能做什么" badge="▶ 禁区">
          <ul className="space-y-2">
            <ProseLi>
              不要利用 Mull
              去骚扰任何人。公开资料以及任何即将推出的社区功能，都不是用来做这种事的工具。
            </ProseLi>
            <ProseLi>
              不要抓取 Mull
              的内容（题目、原型文字、哲学家数据库）用于再分发。这些文字皆为手工撰写，模型亦为手工调校；如需复用，请先征询。
            </ProseLi>
            <ProseLi>
              不要试图搞垮我们的服务器——DDoS、漏洞利用尝试、对 AI
              接口的自动化滥用。我们已设有速率限制；绕过这些限制即违反本条款。
            </ProseLi>
            <ProseLi>不要提交在你所在司法管辖区属于违法、或侵犯他人权利的内容。</ProseLi>
          </ul>
        </PixelWindow>

        <PixelWindow title="我们能做什么" badge="▶ 我们这一方">
          <ul className="space-y-2">
            <ProseLi>
              暂停或关闭违反本条款的账户。除非违规情节恶劣，我们通常会在动手之前先与你联系。
            </ProseLi>
            <ProseLi>
              随时间推移更改 Mull 的功能、设计与行为方式。现在是 v0.9
              版本——一切都会变动。重大变更我们会通过欢迎邮件或横幅来告知。
            </ProseLi>
            <ProseLi>
              停掉任何效果不佳的功能。在移除你所依赖的任何东西之前，我们会事先通知，并提供数据导出。
            </ProseLi>
          </ul>
        </PixelWindow>

        <PixelWindow title="你的内容 · AI · 订阅">
          <Prose>
            <p>
              <strong>你的内容。</strong> 你在 Mull
              上所写的一切都归你所有。当你把它发布到公开资料或任何社区版面（在这些功能存在时）上，即表示你授予我们一项非排他性许可，以将其作为
              Mull
              正常运作的一部分加以展示——这正是选择公开的全部意义所在。你随时可以撤下任何一则公开内容，展示它的许可也随该撤下而终止。
            </p>
            <p>
              <strong>AI 输出。</strong> Mull 在其部分分析中使用了 Claude（由 Anthropic 制造）。AI
              生成的文字——困境分析、辩论交锋、年度回顾——最好被当作一份引人深思的提示，而非权威真理。我们竭力让它们既有用又公允，但它们有时会出错、会遗漏语境，或会反映出从模型继承而来的偏见。不要仅凭一次
              AI 分析就做出人生抉择。
            </p>
            <p>
              <strong>订阅（上线时）。</strong>{' '}
              在本文发布之时，订阅尚未启用。当它上线时，规则将是：在{' '}
              <Link
                href="/billing"
                className="text-acc-deep underline decoration-acc/40 underline-offset-3 hover:decoration-acc-deep"
              >
                计费页
              </Link>
              上明码标价，不在无预警的情况下自动续费，可从你的账户轻松取消，没有任何暗黑模式。届时我们会在此发布具体细则。
            </p>
          </Prose>
        </PixelWindow>

        <PixelWindow title="责任 · 隐私 · 法律 · 联系方式">
          <Prose>
            <p>
              <strong>责任限制。</strong> Mull
              按&ldquo;现状&rdquo;提供。在法律允许的范围内，维护者对因你使用 Mull
              而产生的间接、附带或后果性损害概不负责。倘若我们这一端出了灾难性的差错，我们的责任上限为你在过去十二个月内向我们支付的金额——而目前那是零英镑。
            </p>
            <p>
              <strong>隐私。</strong> 参见{' '}
              <Link
                href="/privacy"
                className="text-acc-deep underline decoration-acc/40 underline-offset-3 hover:decoration-acc-deep"
              >
                隐私政策
              </Link>
              。简短版本：我们只保留让 Mull
              得以运作所需的最低限度数据，没有广告，不出售数据，你随时可以下载或删除一切。
            </p>
            <p>
              <strong>适用法律。</strong>{' '}
              本条款受英格兰法律管辖。争议交由英格兰及威尔士的法院处理，除非你是消费者——在这种情况下，你当地的消费者保护法亦同时适用。
            </p>
            <p>
              <strong>联系方式。</strong>{' '}
              <a
                href="mailto:jimmy.kaian.ji@gmail.com"
                className="text-acc-deep underline decoration-acc/40 underline-offset-3 hover:decoration-acc-deep"
              >
                jimmy.kaian.ji@gmail.com
              </a>
              。
            </p>
          </Prose>
        </PixelWindow>
      </div>

      <p className="mt-12 text-center text-[13px] text-acc-deep">
        最近更新：{LAST_UPDATED_ZH}。{' '}
        <Link
          href="/"
          className="ml-2 underline decoration-acc/40 underline-offset-3 hover:decoration-acc-deep"
        >
          ← 返回 Mull
        </Link>
      </p>
    </>
  );
}

function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="space-y-4 text-[15.5px] leading-[1.65] text-ink [&_strong]:text-ink"
      style={{ fontFamily: 'var(--font-prose)' }}
    >
      {children}
    </div>
  );
}

function ProseLi({ children }: { children: React.ReactNode }) {
  return (
    <li
      className="border-l-4 px-4 py-2 text-[14.5px] leading-[1.6] text-ink"
      style={{
        borderColor: 'var(--color-acc)',
        background: '#FFFCF4',
        fontFamily: 'var(--font-prose)',
      }}
    >
      {children}
    </li>
  );
}
