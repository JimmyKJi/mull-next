// /privacy — v3 pixel chrome restyle. All content preserved.
//
// i18n: like /methodology, this page reads the locale cookie at request
// time, so the body branches on locale. `zh` ships a full Chinese render
// (PrivacyBodyZh); every other locale gets the English body plus the
// honest ContentLanguageNotice. Hrefs, mailto, the public-profile URL,
// <code> contents, and the contact email stay verbatim in both.

import Link from 'next/link';
import type { Metadata } from 'next';
import { getServerLocale } from '@/lib/locale-server';
import { PixelWindow, PixelPageHeader } from '@/components/pixel-window';
import { ContentLanguageNotice } from '@/components/content-language-notice';

export const metadata: Metadata = {
  title: 'Privacy',
  description: 'What Mull collects, what it does with it, and how to delete it.',
  alternates: { canonical: 'https://mull.world/privacy' },
};

const LAST_UPDATED = 'May 10, 2026';
// Keep in sync with LAST_UPDATED when the update date changes.
const LAST_UPDATED_ZH = '2026年5月10日';

export default async function PrivacyPage() {
  const locale = await getServerLocale();

  return (
    <main className="mx-auto max-w-[820px] px-6 pb-32 pt-12 sm:px-10 sm:pt-16">
      <ContentLanguageNotice locale={locale} translatedLocales={['zh']} />

      {locale === 'zh' ? <PrivacyBodyZh /> : <PrivacyBodyEn />}
    </main>
  );
}

// ──────────────────────────────────────────────────────────────
// English body — default for every non-zh locale. Unchanged from v3.
// ──────────────────────────────────────────────────────────────

function PrivacyBodyEn() {
  return (
    <>
      <PixelPageHeader
        eyebrow={`▶ PRIVACY · UPDATED ${LAST_UPDATED.toUpperCase()}`}
        title="WHAT WE HOLD"
        subtitle={
          <p className="text-[16px] italic" style={{ fontFamily: 'var(--font-editorial)' }}>
            Plain English. If anything below contradicts what you actually experience, the
            experience is the bug — please email me at{' '}
            <a
              href="mailto:jimmy.kaian.ji@gmail.com"
              className="not-italic text-acc-deep underline decoration-acc/40 underline-offset-3 hover:decoration-acc-deep"
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
              If you don&rsquo;t make an account, Mull stores nothing about you on our servers. The
              quiz runs entirely in your browser and we don&rsquo;t see your answers.
            </p>
            <p>If you make an account, we hold:</p>
          </Prose>
          <ul className="mt-3 space-y-2">
            <ProseLi>
              Your email address (used only to sign you in and to send you the email reminders
              you&rsquo;ve opted into).
            </ProseLi>
            <ProseLi>
              The dimensional positions, archetypes, and dilemma responses you save — i.e. the
              actual content of your engagement with Mull.
            </ProseLi>
            <ProseLi>
              Optional public-profile fields you fill in (handle, display name, what&rsquo;s shown
              on your public page) — these you control directly.
            </ProseLi>
            <ProseLi>Subscription state (free vs Mull+) once subscriptions are live.</ProseLi>
            <ProseLi>
              The IP address you connected from, hashed with a salt — kept for 24 hours, only to
              enforce rate limits. We don&rsquo;t store raw IPs.
            </ProseLi>
          </ul>
          <Prose className="mt-4">
            <p>
              We don&rsquo;t collect: location data, contacts, browsing history, fingerprints, or
              anything from third-party trackers. Mull has no analytics SDK that records what you
              click. The only telemetry is Vercel&rsquo;s privacy-respecting page-view counter,
              which doesn&rsquo;t set cookies.
            </p>
          </Prose>
        </PixelWindow>

        <PixelWindow title="HOW WE USE AI" badge="▶ NARROW">
          <Prose>
            <p>
              Three places use AI: the dilemma analyzer, the philosopher debate generator, and (for
              Mull+ subscribers, when that feature ships) the year-end retrospective. In each case,
              the text you wrote is sent to Anthropic&rsquo;s Claude API, processed, and the result
              is stored on your account. We don&rsquo;t train any model on your data.
              Anthropic&rsquo;s data policy applies to the in-flight API call; we don&rsquo;t retain
              anything beyond what&rsquo;s necessary for you to see it again on your account.
            </p>
            <p>
              Full technical detail — exact prompts, exact data flows — is on the{' '}
              <Link
                href="/methodology"
                className="text-acc-deep underline decoration-acc/40 underline-offset-3 hover:decoration-acc-deep"
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
              <strong>No ads.</strong> Ever. No display ads, no sponsored content, no affiliate
              links sneaked into archetype pages.
            </ProseLi>
            <ProseLi>
              <strong>No selling your data.</strong> Your reflections are between you and the model.
              We have no business relationship that would make selling them attractive even if we
              wanted to.
            </ProseLi>
            <ProseLi>
              <strong>No tracking pixels in emails.</strong> Email reminders are plain HTML/text. We
              don&rsquo;t know if you opened them.
            </ProseLi>
            <ProseLi>
              <strong>No third-party advertising cookies.</strong> Mull sets only what&rsquo;s
              required to keep you signed in.
            </ProseLi>
          </ul>
        </PixelWindow>

        <PixelWindow title="COOKIES" badge="▶ MINIMAL">
          <Prose>
            <p>
              We set: a Supabase session cookie (so you stay signed in), a small locale cookie (so
              the site remembers your language), and a one-time onboarding-dismissed cookie (so we
              don&rsquo;t repeat the welcome overlay). That&rsquo;s it. No analytics, no
              advertising, no tracking.
            </p>
          </Prose>
        </PixelWindow>

        <PixelWindow title="WHO CAN SEE YOUR DATA" badge="▶ PRIVATE BY DEFAULT">
          <Prose>
            <p>
              By default, your account is private. Your archetype, your map, your dilemma responses
              — only you see them. The{' '}
              <Link
                href="/account"
                className="text-acc-deep underline decoration-acc/40 underline-offset-3 hover:decoration-acc-deep"
              >
                public profile settings
              </Link>{' '}
              let you opt in to making any combination of these visible at{' '}
              <code className="rounded border border-line bg-[#F5EFDC] px-1.5 py-0.5 text-[12.5px]">
                mull.world/u/&lt;handle&gt;
              </code>
              . Default is everything off; you choose individually what to share.
            </p>
            <p>
              Maintainer (me, Jimmy) can technically see anything stored in our Supabase database. I
              look at this only to investigate bugs and abuse. I don&rsquo;t read user diaries,
              dilemmas, or chats for fun. The infrastructure is hosted on Vercel and Supabase; their
              staff have access to the underlying systems under their respective security policies.
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
              Plus a single welcome email when you first sign up. Turn any of these off in{' '}
              <Link
                href="/account"
                className="text-acc-deep underline decoration-acc/40 underline-offset-3 hover:decoration-acc-deep"
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
              <strong>Download everything we have on you</strong> as a single JSON file from{' '}
              <Link
                href="/account"
                className="text-acc-deep underline decoration-acc/40 underline-offset-3 hover:decoration-acc-deep"
              >
                account settings
              </Link>
              .
            </ProseLi>
            <ProseLi>
              <strong>Delete your account outright.</strong> Same place. We wipe every user-scoped
              row across all our tables and remove your sign-in record. Anonymous feedback you
              submitted is kept (the words remain; your identifier disappears).
            </ProseLi>
            <ProseLi>
              <strong>Object to anything specific</strong> by emailing me. I&rsquo;ll respond.
            </ProseLi>
          </ul>
        </PixelWindow>

        <PixelWindow title="CHILDREN · CHANGES · CONTACT">
          <Prose>
            <p>
              <strong>Children.</strong> Mull is not designed for users under 13. If you&rsquo;re
              under 13, please don&rsquo;t make an account.
            </p>
            <p>
              <strong>Changes.</strong> If this policy changes materially, signed-in users will get
              an email. The page is dated at the top so you can always check what&rsquo;s current.
            </p>
            <p>
              <strong>Contact.</strong> Email{' '}
              <a
                href="mailto:jimmy.kaian.ji@gmail.com"
                className="text-acc-deep underline decoration-acc/40 underline-offset-3 hover:decoration-acc-deep"
              >
                jimmy.kaian.ji@gmail.com
              </a>
              . I read every message.
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
// Chinese body — full zh render. Mirrors PrivacyBodyEn exactly; every
// href/mailto, the public-profile URL, <code> contents, and the contact
// email stay verbatim. Only the prose around them is translated.
// ──────────────────────────────────────────────────────────────

function PrivacyBodyZh() {
  return (
    <>
      <PixelPageHeader
        eyebrow={`▶ 隐私 · 更新于 ${LAST_UPDATED_ZH}`}
        title="我们持有什么"
        subtitle={
          <p className="text-[16px] italic" style={{ fontFamily: 'var(--font-editorial)' }}>
            用大白话说清楚。如果下面的任何内容与你实际体验到的相矛盾，那么以实际体验为准、文字才是漏洞——请发邮件给我：{' '}
            <a
              href="mailto:jimmy.kaian.ji@gmail.com"
              className="not-italic text-acc-deep underline decoration-acc/40 underline-offset-3 hover:decoration-acc-deep"
            >
              jimmy.kaian.ji@gmail.com
            </a>
            。
          </p>
        }
      />

      <div className="space-y-8">
        <PixelWindow title="MULL 收集什么" badge="▶ 数据">
          <Prose>
            <p>
              如果你不注册账户，Mull
              不会在我们的服务器上存储任何关于你的信息。测验完全在你的浏览器中运行，我们看不到你的答案。
            </p>
            <p>如果你注册了账户，我们会持有：</p>
          </Prose>
          <ul className="mt-3 space-y-2">
            <ProseLi>你的邮箱地址（仅用于让你登录，以及向你发送你已选择接收的邮件提醒）。</ProseLi>
            <ProseLi>
              你保存下来的维度坐标、原型与困境回应——也就是你与 Mull 互动的实际内容。
            </ProseLi>
            <ProseLi>
              你填写的可选公开资料字段（用户名、显示名称、在你公开页面上展示的内容）——这些由你直接掌控。
            </ProseLi>
            <ProseLi>订阅状态（免费版还是 Mull+），在订阅功能上线之后。</ProseLi>
            <ProseLi>
              你连接时所用的 IP 地址，会经过加盐哈希处理——仅保留 24
              小时，且只用于实施速率限制。我们不存储原始 IP。
            </ProseLi>
          </ul>
          <Prose className="mt-4">
            <p>
              我们不收集：位置数据、通讯录、浏览历史、设备指纹，或任何来自第三方追踪器的信息。Mull
              没有任何记录你点击行为的分析 SDK。唯一的遥测数据，是 Vercel 那个尊重隐私、且不设置
              Cookie 的页面浏览计数器。
            </p>
          </Prose>
        </PixelWindow>

        <PixelWindow title="我们如何使用 AI" badge="▶ 狭窄">
          <Prose>
            <p>
              有三个地方用到 AI：困境分析器、哲学家辩论生成器，以及（面向 Mull+
              订阅者，待该功能上线后的）年终回顾。在每种情形下，你所写的文字都会被发送到 Anthropic
              的 Claude API
              进行处理，结果再存储到你的账户上。我们不会用你的数据去训练任何模型。Anthropic
              的数据政策适用于进行中的 API
              调用；除了让你日后能在账户里再次看到所必需的内容之外，我们不保留任何东西。
            </p>
            <p>
              完整的技术细节——确切的提示词、确切的数据流向——都在{' '}
              <Link
                href="/methodology"
                className="text-acc-deep underline decoration-acc/40 underline-offset-3 hover:decoration-acc-deep"
              >
                方法论页面
              </Link>
              。
            </p>
          </Prose>
        </PixelWindow>

        <PixelWindow title="我们绝不做什么" badge="▶ 承诺">
          <ul className="space-y-2.5">
            <ProseLi>
              <strong>没有广告。</strong>
              永远没有。没有展示广告，没有赞助内容，也不会有偷偷塞进原型页面的联盟营销链接。
            </ProseLi>
            <ProseLi>
              <strong>不出售你的数据。</strong>
              你的反思只属于你和模型之间。我们没有任何商业关系会让出售这些数据变得诱人，即便我们想这么做也没有。
            </ProseLi>
            <ProseLi>
              <strong>邮件里没有追踪像素。</strong>邮件提醒都是纯
              HTML／文本。我们不知道你是否打开过它们。
            </ProseLi>
            <ProseLi>
              <strong>没有第三方广告 Cookie。</strong>Mull 只设置维持你登录状态所必需的那些。
            </ProseLi>
          </ul>
        </PixelWindow>

        <PixelWindow title="COOKIE" badge="▶ 最少化">
          <Prose>
            <p>
              我们会设置：一个 Supabase 会话 Cookie（让你保持登录）、一个小小的语言区域
              Cookie（让网站记住你的语言），以及一个一次性的"已关闭引导"Cookie（这样我们就不会重复弹出欢迎浮层）。仅此而已。没有分析，没有广告，没有追踪。
            </p>
          </Prose>
        </PixelWindow>

        <PixelWindow title="谁能看到你的数据" badge="▶ 默认私密">
          <Prose>
            <p>
              默认情况下，你的账户是私密的。你的原型、你的地图、你的困境回应——只有你自己能看到。通过{' '}
              <Link
                href="/account"
                className="text-acc-deep underline decoration-acc/40 underline-offset-3 hover:decoration-acc-deep"
              >
                公开资料设置
              </Link>
              ，你可以选择把这些内容的任意组合，公开在{' '}
              <code className="rounded border border-line bg-[#F5EFDC] px-1.5 py-0.5 text-[12.5px]">
                mull.world/u/&lt;handle&gt;
              </code>
              。默认是全部关闭；你可以逐项选择要分享什么。
            </p>
            <p>
              维护者（也就是我，Jimmy）在技术上能够看到存储在我们 Supabase
              数据库里的任何内容。我只会为了排查漏洞和滥用行为才去查看。我不会出于消遣去读用户的日记、困境或对话。基础设施托管在
              Vercel 与 Supabase 上；他们的员工在各自的安全政策之下，能够访问底层系统。
            </p>
          </Prose>
        </PixelWindow>

        <PixelWindow title="邮件" badge="▶ 仅限自愿订阅">
          <Prose>
            <p>可能会发出三类邮件，全部都需自愿订阅：</p>
          </Prose>
          <ul className="mt-3 space-y-2">
            <ProseLi>每日困境提醒，在你所选的本地时刻发送。</ProseLi>
            <ProseLi>周日的每周摘要，回顾你过去 7 天的情况。</ProseLi>
            <ProseLi>当一段 3 天以上的连续记录中断时，发送的一次性提醒邮件。</ProseLi>
          </ul>
          <Prose className="mt-4">
            <p>
              此外，在你首次注册时还会有一封欢迎邮件。要关闭其中任何一项，可前往{' '}
              <Link
                href="/account"
                className="text-acc-deep underline decoration-acc/40 underline-offset-3 hover:decoration-acc-deep"
              >
                账户设置
              </Link>
              。
            </p>
          </Prose>
        </PixelWindow>

        <PixelWindow title="你的权利" badge="▶ 完全掌控">
          <Prose>
            <p>你可以：</p>
          </Prose>
          <ul className="mt-3 space-y-2.5">
            <ProseLi>
              <strong>下载我们持有的关于你的全部数据</strong>，导出为单个 JSON 文件，就在{' '}
              <Link
                href="/account"
                className="text-acc-deep underline decoration-acc/40 underline-offset-3 hover:decoration-acc-deep"
              >
                账户设置
              </Link>
              里。
            </ProseLi>
            <ProseLi>
              <strong>直接删除你的账户。</strong>
              同样在那个地方。我们会抹去所有数据表中每一行与用户相关的记录，并移除你的登录凭据。你提交过的匿名反馈会被保留（文字仍在，但你的标识符会消失）。
            </ProseLi>
            <ProseLi>
              <strong>对任何具体事项提出异议</strong>，给我发邮件即可。我会回复。
            </ProseLi>
          </ul>
        </PixelWindow>

        <PixelWindow title="未成年人 · 变更 · 联系">
          <Prose>
            <p>
              <strong>未成年人。</strong>Mull 并非为 13 岁以下的用户设计。如果你未满 13
              岁，请不要注册账户。
            </p>
            <p>
              <strong>变更。</strong>
              如果本政策发生实质性变更，已登录的用户会收到邮件通知。本页顶部标有日期，你随时可以查看当前的版本。
            </p>
            <p>
              <strong>联系。</strong>发邮件至{' '}
              <a
                href="mailto:jimmy.kaian.ji@gmail.com"
                className="text-acc-deep underline decoration-acc/40 underline-offset-3 hover:decoration-acc-deep"
              >
                jimmy.kaian.ji@gmail.com
              </a>
              。每一条消息我都会读。
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

function Prose({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={
        'space-y-4 text-[15.5px] leading-[1.65] text-ink [&_strong]:text-ink ' + (className ?? '')
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
