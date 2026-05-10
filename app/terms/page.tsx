// /terms — terms of service for Mull. Plain English, kept short.
// Not a substitute for a real lawyer-drafted agreement; it's a
// good-faith document setting expectations. The maintainer should
// have a real lawyer review this before serious commercial scale.

import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms',
  description: 'The rules of using Mull, written plainly.',
  alternates: { canonical: 'https://mull.world/terms' },
};

const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'Inter', system-ui, sans-serif";

const LAST_UPDATED = 'May 10, 2026';

export default function TermsPage() {
  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '60px 24px 120px' }}>
      <header style={{ marginBottom: 36, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16, flexWrap: 'wrap' }}>
        <Link href="/" style={{
          fontFamily: serif, fontSize: 28, fontWeight: 500,
          color: '#221E18', textDecoration: 'none', letterSpacing: '-0.5px',
        }}>
          Mull<span style={{ color: '#B8862F' }}>.</span>
        </Link>
      </header>

      <div style={eyebrow}>Terms</div>
      <h1 style={h1}>The rules, plainly.</h1>
      <p style={lede}>
        Updated {LAST_UPDATED}. By using Mull you agree to the below. If anything is unclear, email <a href="mailto:jimmy.kaian.ji@gmail.com" style={a}>jimmy.kaian.ji@gmail.com</a> — I&rsquo;d rather you understand than nod through.
      </p>

      <h2 style={h2}>What Mull is</h2>
      <p style={p}>
        Mull is a passion-project philosophy app: a 16-dimensional mapping of philosophical tendencies, an archetype model, a daily dilemma, and a few related practices (diary, debates with simulated philosophers, exercises). It&rsquo;s a tool for thinking, not therapy, not a diagnostic, not a substitute for any kind of professional advice.
      </p>

      <h2 style={h2}>Your account</h2>
      <ul style={ul}>
        <li>You&rsquo;re responsible for keeping your password private. If you suspect someone else got into your account, change the password immediately.</li>
        <li>You&rsquo;re responsible for what you write — dilemma responses, diary entries, debate text, public profile content.</li>
        <li>One person, one account, please. Don&rsquo;t make multiple accounts to game leaderboards or get extra free AI tier.</li>
      </ul>

      <h2 style={h2}>What you can&rsquo;t do</h2>
      <ul style={ul}>
        <li>Don&rsquo;t use Mull to harass anyone. Public profiles and any forthcoming community features are not vehicles for that.</li>
        <li>Don&rsquo;t scrape Mull&rsquo;s content (questions, archetype prose, philosopher database) for redistribution. The text is hand-written and the model is hand-tuned; ask before reusing.</li>
        <li>Don&rsquo;t try to break our servers — DDoS, exploit attempts, automated abuse of the AI endpoints. Rate limits are in place; circumventing them violates these terms.</li>
        <li>Don&rsquo;t submit content that&rsquo;s illegal in your jurisdiction or that infringes someone else&rsquo;s rights.</li>
      </ul>

      <h2 style={h2}>What we can do</h2>
      <ul style={ul}>
        <li>Suspend or close accounts that violate these terms. We&rsquo;ll typically reach out before doing so unless the violation is egregious.</li>
        <li>Change Mull&rsquo;s features, design, and behavior over time. This is v0.9 — things will move. We&rsquo;ll communicate big changes via the welcome email or a banner.</li>
        <li>Discontinue any feature that isn&rsquo;t working out. We&rsquo;ll give notice and offer data export before removing anything you depend on.</li>
      </ul>

      <h2 style={h2}>Your content</h2>
      <p style={p}>
        You own everything you write on Mull. By posting it on a public profile or to any community surface (when those exist), you grant us a non-exclusive license to display it as part of Mull&rsquo;s normal operation — that&rsquo;s the whole point of opting public. Take down a piece of public content any time and the license to display it ends with the takedown.
      </p>

      <h2 style={h2}>AI output</h2>
      <p style={p}>
        Mull uses Claude (made by Anthropic) for parts of its analysis. AI-generated text — dilemma analyses, debate exchanges, retrospectives — is best treated as a thoughtful prompt, not authoritative truth. We do our best to make these useful and fair, but they will sometimes be wrong, miss context, or reflect biases inherited from the model. Don&rsquo;t make life decisions on the basis of one AI analysis.
      </p>

      <h2 style={h2}>Subscriptions (when live)</h2>
      <p style={p}>
        Subscriptions are not yet active at the time this is published. When they go live, the rules will be: clear pricing on the <Link href="/billing" style={a}>billing page</Link>, no auto-renewal without warning, easy cancellation from your account, no dark patterns. We&rsquo;ll publish the specifics here at launch.
      </p>

      <h2 style={h2}>Limitation of liability</h2>
      <p style={p}>
        Mull is provided &ldquo;as is.&rdquo; To the extent the law allows, the maintainer is not liable for indirect, incidental, or consequential damages arising from your use of Mull. If something goes catastrophically wrong on our end, our liability is capped at what you&rsquo;ve paid us in the past twelve months — which is presently zero pounds.
      </p>

      <h2 style={h2}>Privacy</h2>
      <p style={p}>
        See the <Link href="/privacy" style={a}>privacy policy</Link>. The short version: we hold the bare minimum to make Mull work, no ads, no sale of data, you can download or delete everything any time.
      </p>

      <h2 style={h2}>Governing law</h2>
      <p style={p}>
        These terms are governed by English law. Disputes go to the courts of England and Wales unless you&rsquo;re a consumer, in which case your local consumer-protection law also applies.
      </p>

      <h2 style={h2}>Contact</h2>
      <p style={p}>
        <a href="mailto:jimmy.kaian.ji@gmail.com" style={a}>jimmy.kaian.ji@gmail.com</a>.
      </p>

      <p style={{ ...p, marginTop: 48, fontSize: 13, color: '#8C6520', opacity: 0.8 }}>
        Last updated: {LAST_UPDATED}.
      </p>
    </main>
  );
}

const eyebrow: React.CSSProperties = {
  fontFamily: sans, fontSize: 11, fontWeight: 600,
  color: '#8C6520', textTransform: 'uppercase',
  letterSpacing: '0.18em', marginBottom: 14,
};
const h1: React.CSSProperties = {
  fontFamily: serif, fontSize: 42, fontWeight: 500,
  margin: '0 0 12px', letterSpacing: '-0.5px', lineHeight: 1.1,
};
const h2: React.CSSProperties = {
  fontFamily: serif, fontSize: 24, fontWeight: 500,
  margin: '36px 0 12px', letterSpacing: '-0.3px',
};
const lede: React.CSSProperties = {
  fontFamily: serif, fontStyle: 'italic',
  fontSize: 18, color: '#4A4338',
  marginBottom: 32, lineHeight: 1.55,
};
const p: React.CSSProperties = {
  fontFamily: serif, fontSize: 16, color: '#221E18',
  lineHeight: 1.65, margin: '0 0 14px',
};
const ul: React.CSSProperties = {
  fontFamily: serif, fontSize: 16, color: '#221E18',
  lineHeight: 1.65, paddingLeft: 22, margin: '0 0 14px',
};
const a: React.CSSProperties = {
  color: '#8C6520', textDecoration: 'underline', textUnderlineOffset: 3,
};
