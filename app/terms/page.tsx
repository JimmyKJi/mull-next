// /terms — v3 pixel chrome restyle. All content preserved.

import Link from 'next/link';
import type { Metadata } from 'next';
import { PixelWindow, PixelPageHeader } from '@/components/pixel-window';

export const metadata: Metadata = {
  title: 'Terms',
  description: 'The rules of using Mull, written plainly.',
  alternates: { canonical: 'https://mull.world/terms' },
};

const LAST_UPDATED = 'May 10, 2026';

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-[820px] px-6 pb-32 pt-12 sm:px-10 sm:pt-16">
      <PixelPageHeader
        eyebrow={`▶ TERMS · UPDATED ${LAST_UPDATED.toUpperCase()}`}
        title="THE RULES, PLAINLY"
        subtitle={
          <p className="text-[16px] italic" style={{ fontFamily: 'var(--font-prose)' }}>
            By using Mull you agree to the below. If anything is unclear,
            email{' '}
            <a
              href="mailto:jimmy.kaian.ji@gmail.com"
              className="not-italic text-[#8C6520] underline decoration-[#B8862F]/40 underline-offset-3 hover:decoration-[#8C6520]"
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
              Mull is a passion-project philosophy app: a 16-dimensional
              mapping of philosophical tendencies, an archetype model, a daily
              dilemma, and a few related practices (diary, debates with
              simulated philosophers, exercises). It&rsquo;s a tool for
              thinking, not therapy, not a diagnostic, not a substitute for
              any kind of professional advice.
            </p>
          </Prose>
        </PixelWindow>

        <PixelWindow title="YOUR ACCOUNT" badge="▶ RESPONSIBILITIES">
          <ul className="space-y-2">
            <ProseLi>
              You&rsquo;re responsible for keeping your password private. If
              you suspect someone else got into your account, change the
              password immediately.
            </ProseLi>
            <ProseLi>
              You&rsquo;re responsible for what you write — dilemma
              responses, diary entries, debate text, public profile content.
            </ProseLi>
            <ProseLi>
              One person, one account, please. Don&rsquo;t make multiple
              accounts to game leaderboards or get extra free AI tier.
            </ProseLi>
          </ul>
        </PixelWindow>

        <PixelWindow title="WHAT YOU CAN'T DO" badge="▶ NO-GO">
          <ul className="space-y-2">
            <ProseLi>
              Don&rsquo;t use Mull to harass anyone. Public profiles and any
              forthcoming community features are not vehicles for that.
            </ProseLi>
            <ProseLi>
              Don&rsquo;t scrape Mull&rsquo;s content (questions, archetype
              prose, philosopher database) for redistribution. The text is
              hand-written and the model is hand-tuned; ask before reusing.
            </ProseLi>
            <ProseLi>
              Don&rsquo;t try to break our servers — DDoS, exploit attempts,
              automated abuse of the AI endpoints. Rate limits are in place;
              circumventing them violates these terms.
            </ProseLi>
            <ProseLi>
              Don&rsquo;t submit content that&rsquo;s illegal in your
              jurisdiction or that infringes someone else&rsquo;s rights.
            </ProseLi>
          </ul>
        </PixelWindow>

        <PixelWindow title="WHAT WE CAN DO" badge="▶ ON OUR SIDE">
          <ul className="space-y-2">
            <ProseLi>
              Suspend or close accounts that violate these terms. We&rsquo;ll
              typically reach out before doing so unless the violation is
              egregious.
            </ProseLi>
            <ProseLi>
              Change Mull&rsquo;s features, design, and behavior over time.
              This is v0.9 — things will move. We&rsquo;ll communicate big
              changes via the welcome email or a banner.
            </ProseLi>
            <ProseLi>
              Discontinue any feature that isn&rsquo;t working out.
              We&rsquo;ll give notice and offer data export before removing
              anything you depend on.
            </ProseLi>
          </ul>
        </PixelWindow>

        <PixelWindow title="YOUR CONTENT · AI · SUBSCRIPTIONS">
          <Prose>
            <p>
              <strong>Your content.</strong> You own everything you write on
              Mull. By posting it on a public profile or to any community
              surface (when those exist), you grant us a non-exclusive
              license to display it as part of Mull&rsquo;s normal operation
              — that&rsquo;s the whole point of opting public. Take down a
              piece of public content any time and the license to display it
              ends with the takedown.
            </p>
            <p>
              <strong>AI output.</strong> Mull uses Claude (made by
              Anthropic) for parts of its analysis. AI-generated text —
              dilemma analyses, debate exchanges, retrospectives — is best
              treated as a thoughtful prompt, not authoritative truth. We do
              our best to make these useful and fair, but they will sometimes
              be wrong, miss context, or reflect biases inherited from the
              model. Don&rsquo;t make life decisions on the basis of one AI
              analysis.
            </p>
            <p>
              <strong>Subscriptions (when live).</strong> Subscriptions are
              not yet active at the time this is published. When they go
              live, the rules will be: clear pricing on the{' '}
              <Link
                href="/billing"
                className="text-[#8C6520] underline decoration-[#B8862F]/40 underline-offset-3 hover:decoration-[#8C6520]"
              >
                billing page
              </Link>
              , no auto-renewal without warning, easy cancellation from your
              account, no dark patterns. We&rsquo;ll publish the specifics
              here at launch.
            </p>
          </Prose>
        </PixelWindow>

        <PixelWindow title="LIABILITY · PRIVACY · LAW · CONTACT">
          <Prose>
            <p>
              <strong>Limitation of liability.</strong> Mull is provided
              &ldquo;as is.&rdquo; To the extent the law allows, the
              maintainer is not liable for indirect, incidental, or
              consequential damages arising from your use of Mull. If
              something goes catastrophically wrong on our end, our liability
              is capped at what you&rsquo;ve paid us in the past twelve
              months — which is presently zero pounds.
            </p>
            <p>
              <strong>Privacy.</strong> See the{' '}
              <Link
                href="/privacy"
                className="text-[#8C6520] underline decoration-[#B8862F]/40 underline-offset-3 hover:decoration-[#8C6520]"
              >
                privacy policy
              </Link>
              . The short version: we hold the bare minimum to make Mull
              work, no ads, no sale of data, you can download or delete
              everything any time.
            </p>
            <p>
              <strong>Governing law.</strong> These terms are governed by
              English law. Disputes go to the courts of England and Wales
              unless you&rsquo;re a consumer, in which case your local
              consumer-protection law also applies.
            </p>
            <p>
              <strong>Contact.</strong>{' '}
              <a
                href="mailto:jimmy.kaian.ji@gmail.com"
                className="text-[#8C6520] underline decoration-[#B8862F]/40 underline-offset-3 hover:decoration-[#8C6520]"
              >
                jimmy.kaian.ji@gmail.com
              </a>
              .
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

function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="space-y-4 text-[15.5px] leading-[1.65] text-[#221E18] [&_strong]:text-[#221E18]"
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
