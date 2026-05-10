// /privacy — privacy policy for Mull. Written in plain English in the
// Mull voice. Not legal advice; a starting-point document the
// maintainer can iterate on as the product evolves.
//
// Indexed (so search engines can verify the site is legitimate) but
// kept short so users actually read it.

import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy',
  description: 'What Mull collects, what it does with it, and how to delete it.',
  alternates: { canonical: 'https://mull.world/privacy' },
};

const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'Inter', system-ui, sans-serif";

const LAST_UPDATED = 'May 10, 2026';

export default function PrivacyPage() {
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

      <div style={eyebrow}>Privacy</div>
      <h1 style={h1}>What we hold, and why.</h1>
      <p style={lede}>
        Plain English. Updated {LAST_UPDATED}. If anything below contradicts what you actually experience, the experience is the bug — please email me at <a href="mailto:jimmy.kaian.ji@gmail.com" style={a}>jimmy.kaian.ji@gmail.com</a>.
      </p>

      <h2 style={h2}>What Mull collects</h2>
      <p style={p}>
        If you don&rsquo;t make an account, Mull stores nothing about you on our servers. The quiz runs entirely in your browser and we don&rsquo;t see your answers.
      </p>
      <p style={p}>
        If you make an account, we hold:
      </p>
      <ul style={ul}>
        <li>Your email address (used only to sign you in and to send you the email reminders you&rsquo;ve opted into).</li>
        <li>The dimensional positions, archetypes, and dilemma responses you save — i.e. the actual content of your engagement with Mull.</li>
        <li>Optional public-profile fields you fill in (handle, display name, what&rsquo;s shown on your public page) — these you control directly.</li>
        <li>Subscription state (free vs Mull+) once subscriptions are live.</li>
        <li>The IP address you connected from, hashed with a salt — kept for 24 hours, only to enforce rate limits. We don&rsquo;t store raw IPs.</li>
      </ul>
      <p style={p}>
        We don&rsquo;t collect: location data, contacts, browsing history, fingerprints, or anything from third-party trackers. Mull has no analytics SDK that records what you click. The only telemetry is Vercel&rsquo;s privacy-respecting page-view counter, which doesn&rsquo;t set cookies.
      </p>

      <h2 style={h2}>How we use AI</h2>
      <p style={p}>
        Three places use AI: the dilemma analyzer, the philosopher debate generator, and (for Mull+ subscribers, when that feature ships) the year-end retrospective. In each case, the text you wrote is sent to Anthropic&rsquo;s Claude API, processed, and the result is stored on your account. We don&rsquo;t train any model on your data. Anthropic&rsquo;s data policy applies to the in-flight API call; we don&rsquo;t retain anything beyond what&rsquo;s necessary for you to see it again on your account.
      </p>
      <p style={p}>
        Full technical detail — exact prompts, exact data flows — is on the <Link href="/methodology" style={a}>methodology page</Link>.
      </p>

      <h2 style={h2}>What we never do</h2>
      <ul style={ul}>
        <li><strong>No ads.</strong> Ever. No display ads, no sponsored content, no affiliate links sneaked into archetype pages.</li>
        <li><strong>No selling your data.</strong> Your reflections are between you and the model. We have no business relationship that would make selling them attractive even if we wanted to.</li>
        <li><strong>No tracking pixels in emails.</strong> Email reminders are plain HTML/text. We don&rsquo;t know if you opened them.</li>
        <li><strong>No third-party advertising cookies.</strong> Mull sets only what&rsquo;s required to keep you signed in.</li>
      </ul>

      <h2 style={h2}>Cookies</h2>
      <p style={p}>
        We set: a Supabase session cookie (so you stay signed in), a small locale cookie (so the site remembers your language), and a one-time onboarding-dismissed cookie (so we don&rsquo;t repeat the welcome overlay). That&rsquo;s it. No analytics, no advertising, no tracking.
      </p>

      <h2 style={h2}>Who can see your data</h2>
      <p style={p}>
        By default, your account is private. Your archetype, your map, your dilemma responses — only you see them. The <Link href="/account" style={a}>public profile settings</Link> let you opt in to making any combination of these visible at <code>mull.world/u/&lt;handle&gt;</code>. Default is everything off; you choose individually what to share.
      </p>
      <p style={p}>
        Maintainer (me, Jimmy) can technically see anything stored in our Supabase database. I look at this only to investigate bugs and abuse. I don&rsquo;t read user diaries, dilemmas, or chats for fun. The infrastructure is hosted on Vercel and Supabase; their staff have access to the underlying systems under their respective security policies.
      </p>

      <h2 style={h2}>Email</h2>
      <p style={p}>
        Three kinds of email may go out, all opt-in:
      </p>
      <ul style={ul}>
        <li>Daily dilemma reminder, at the local hour you choose.</li>
        <li>Sunday weekly digest of your past 7 days.</li>
        <li>One-time courtesy email if a streak of 3+ days breaks.</li>
      </ul>
      <p style={p}>
        Plus a single welcome email when you first sign up. Turn any of these off in <Link href="/account" style={a}>account settings</Link>.
      </p>

      <h2 style={h2}>Your rights</h2>
      <p style={p}>
        You can:
      </p>
      <ul style={ul}>
        <li><strong>Download everything we have on you</strong> as a single JSON file from <Link href="/account" style={a}>account settings</Link>.</li>
        <li><strong>Delete your account outright.</strong> Same place. We wipe every user-scoped row across all our tables and remove your sign-in record. Anonymous feedback you submitted is kept (the words remain; your identifier disappears).</li>
        <li><strong>Object to anything specific</strong> by emailing me. I&rsquo;ll respond.</li>
      </ul>

      <h2 style={h2}>Children</h2>
      <p style={p}>
        Mull is not designed for users under 13. If you&rsquo;re under 13, please don&rsquo;t make an account.
      </p>

      <h2 style={h2}>Changes</h2>
      <p style={p}>
        If this policy changes materially, signed-in users will get an email. The page is dated at the top so you can always check what&rsquo;s current.
      </p>

      <h2 style={h2}>Contact</h2>
      <p style={p}>
        Email <a href="mailto:jimmy.kaian.ji@gmail.com" style={a}>jimmy.kaian.ji@gmail.com</a>. I read every message.
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
