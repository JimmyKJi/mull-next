// Standalone /about route. Mirrors the About section that lives inside the
// homepage SPA (mull.html), but as a real Next.js page — so it has its own
// URL for sharing, its own OG meta, sitemap entry, language switcher,
// and survives if we ever migrate mull.html into Next.
//
// Content kept in sync manually with the About section in public/mull.html.
// If you change the principles or the economics here, change them there too.

import Link from 'next/link';
import type { Metadata } from 'next';
import { getServerLocale } from '@/lib/locale-server';
import LanguageSwitcher from '@/components/language-switcher';

const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'Inter', system-ui, sans-serif";

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
    <main style={{
      maxWidth: 720,
      margin: '0 auto',
      padding: '60px 24px 120px',
    }}>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 48,
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <Link href="/" style={{
          fontFamily: serif,
          fontSize: 28,
          fontWeight: 500,
          color: '#221E18',
          textDecoration: 'none',
          letterSpacing: '-0.5px',
        }}>
          Mull<span style={{ color: '#B8862F' }}>.</span>
        </Link>
        <LanguageSwitcher initial={locale} />
      </header>

      <section style={{ marginBottom: 48 }}>
        <h1 style={{
          fontFamily: serif,
          fontSize: 44,
          fontWeight: 500,
          margin: '0 0 16px',
          letterSpacing: '-0.5px',
          lineHeight: 1.05,
        }}>
          Mull is a <em style={{ color: '#8C6520' }}>passion project.</em>
        </h1>
        <p style={{
          fontFamily: serif,
          fontStyle: 'italic',
          fontSize: 19,
          color: '#4A4338',
          margin: '0 0 8px',
          lineHeight: 1.5,
        }}>
          Built on nights and weekends. Funded by nothing in particular.
        </p>
        <p style={{
          fontFamily: sans,
          fontSize: 14,
          color: '#8C6520',
          margin: 0,
          lineHeight: 1.55,
          opacity: 0.85,
        }}>
          This page exists so anyone using Mull can know what they&apos;re using — what it is, what it isn&apos;t, what it costs to run, and who pays.
        </p>
      </section>

      <Section title="Why this exists">
        <p>Philosophy is the original tool for examining your own thinking — the discipline that refuses to take its own framing for granted. Most people leave it behind after one survey course because the way it&apos;s taught makes it feel like memorizing a museum: dates, names, doctrines, exam.</p>
        <p>Mull inverts that. Instead of teaching you what dead philosophers thought, it asks what <strong>you</strong> think — concretely, on real questions — and shows you where that places you in the long conversation. The map isn&apos;t a verdict, it&apos;s a mirror. The over 200 thinkers in the constellation are there as company, not as curriculum.</p>
      </Section>

      <Section title="The principles">
        <p>The values that shape this product. They don&apos;t change as Mull grows — that&apos;s the whole point of writing them down.</p>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 14 }}>
          <Promise title="No ads, ever.">No banners, no tracking pixels, no sponsored newsletter slot. Your reflections are between you and the model. Nobody pays for the privilege of putting an ad next to them.</Promise>
          <Promise title="No selling your data.">If you make an account, we hold your email and your saved quiz attempts — nothing else. You can download everything we have on you as JSON, or delete your account outright, from the public-profile settings page (sign in, then visit <em>Account → Public profile settings</em>). Your map is private by default; public profiles are opt-in only.</Promise>
          <Promise title="Not VC-funded.">No investors, no growth quotas, no board demanding a 10× return. The product changes when we decide it should change, not when a quarterly review demands traction.</Promise>
          <Promise title='Not an "AI app".'>AI is used in two specific places — analyzing your written daily dilemma into dimensional vectors, and generating philosopher dialogues. The 16-dimensional model, the archetype system, the philosopher positions, the figures — hand-designed by humans who care about getting philosophy right.</Promise>
          <Promise title="The free tier stays generous.">If Mull grows past break-even, every dollar of margin goes back into the product: better LLM analysis, scholars to verify philosopher positions, illustrators to redo the figures properly, content for the learning lab. If it grows past <em>that</em>, none of these principles change.</Promise>
        </ul>
      </Section>

      <Section title="Who's behind this">
        <p>Built by <strong>Jimmy Ji</strong>, a philosophy student at King&apos;s College London. Mull is currently a one-person project, though it&apos;s young and will grow. If you want to help, push back on a question, suggest a thinker, or report a bug, write to <a href="mailto:jimmy.kaian.ji@gmail.com" style={{ color: '#8C6520', textDecoration: 'underline', textUnderlineOffset: 3 }}>jimmy.kaian.ji@gmail.com</a>.</p>
        <div style={{
          marginTop: 14,
          padding: '14px 18px',
          background: '#FBF6E8',
          borderLeft: '3px solid #B8862F',
          borderRadius: 6,
          fontSize: 15,
          lineHeight: 1.6,
          color: '#4A4338',
        }}>
          <strong style={{ color: '#221E18' }}>A short note from Jimmy:</strong> I&apos;m in the middle of exam season right now, so updates will land in bursts rather than steadily for the next few weeks. I&apos;ll keep pushing what I can between revision sessions, and the larger features (subscriptions, properly-translated philosophical content, mobile polish) are queued up for the moment things quiet down. Thanks for using Mull while it&apos;s still finding its shape.
        </div>
      </Section>

      <Section title="The economics, openly">
        <p>Real products with real databases and AI analysis cost real money. Here&apos;s what Mull actually costs us each month at different sizes — and what it would earn if 5% of users subscribed to Mull+ at $4.99/month.</p>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontFamily: sans,
          fontSize: 14,
          marginTop: 14,
        }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #D6CDB6' }}>
              <Th>Active users</Th>
              <Th>Monthly cost</Th>
              <Th>Revenue at 5%</Th>
              <Th>Net</Th>
            </tr>
          </thead>
          <tbody>
            <Tr cells={['Under 100', '~$5', '~$25', '+$20 / mo']} netClass="positive" />
            <Tr cells={['1,000', '$50–200', '~$250', 'break-even']} netClass="neutral" />
            <Tr cells={['10,000', '$550–1,600', '~$2,500', '+$900–1,950']} netClass="positive" />
            <Tr cells={['100,000', '$5,000–15,000', '~$25,000', '+$10,000–20,000']} netClass="positive" />
          </tbody>
        </table>
        <p style={{
          fontFamily: sans,
          fontSize: 13,
          color: '#8C6520',
          marginTop: 12,
          opacity: 0.85,
          lineHeight: 1.55,
        }}>
          Costs scale roughly with three things: hosting (Vercel), the database (Supabase), and AI inference (Claude). The wide ranges reflect how much usage we get from active users — heavy daily-dilemma writers cost more than casual quiz-takers.
        </p>
        <div style={{
          marginTop: 18,
          padding: '16px 20px',
          background: '#F5EFDC',
          border: '1px solid #E2D8B6',
          borderRadius: 8,
          fontSize: 14,
          lineHeight: 1.6,
          color: '#4A4338',
        }}>
          <strong style={{ color: '#221E18' }}>Mull+ is $4.99/month or $29/year.</strong> The free tier — quiz, map, archetype, basic daily dilemma — stays free forever. We need paid users to cover infrastructure once we grow past the few-dozen-users phase. Until then, costs come out of the maintainer&apos;s pocket.
          <br /><br />
          For early supporters who want to lock things in: a <strong>Founding Mind lifetime pass at $49</strong> — capped at the first 1,000. This funds roughly the first year of infrastructure outright, in exchange for never paying again.
        </div>
      </Section>

      <p style={{
        marginTop: 48,
        textAlign: 'center',
        fontFamily: sans,
        fontSize: 13,
        color: '#8C6520',
      }}>
        <Link href="/" style={{ color: '#8C6520', textDecoration: 'underline', textUnderlineOffset: 3 }}>
          ← Back to Mull
        </Link>
      </p>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{
      marginBottom: 40,
      paddingTop: 28,
      borderTop: '1px solid #EBE3CA',
    }}>
      <h2 style={{
        fontFamily: serif,
        fontSize: 26,
        fontWeight: 500,
        margin: '0 0 16px',
        letterSpacing: '-0.3px',
        color: '#221E18',
      }}>
        {title}
      </h2>
      <div style={{
        fontFamily: sans,
        fontSize: 15.5,
        color: '#4A4338',
        lineHeight: 1.65,
      }}>
        {children}
      </div>
    </section>
  );
}

function Promise({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <li style={{
      padding: '16px 18px',
      background: '#FFFCF4',
      borderLeft: '3px solid #B8862F',
      borderRadius: 6,
      fontSize: 14.5,
      color: '#4A4338',
      lineHeight: 1.55,
    }}>
      <strong style={{ color: '#221E18', display: 'block', marginBottom: 4, fontSize: 16 }}>{title}</strong>
      {children}
    </li>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th style={{
      textAlign: 'left',
      padding: '10px 8px',
      fontFamily: sans,
      fontSize: 11,
      fontWeight: 600,
      color: '#8C6520',
      textTransform: 'uppercase',
      letterSpacing: '0.12em',
    }}>
      {children}
    </th>
  );
}

function Tr({ cells, netClass }: { cells: string[]; netClass: 'positive' | 'neutral' }) {
  const netColor = netClass === 'positive' ? '#2F5D5C' : '#8C6520';
  return (
    <tr style={{ borderBottom: '1px solid #EBE3CA' }}>
      {cells.map((c, i) => (
        <td
          key={i}
          style={{
            padding: '12px 8px',
            fontFamily: sans,
            fontSize: 14,
            color: i === cells.length - 1 ? netColor : '#221E18',
            fontWeight: i === cells.length - 1 ? 500 : 400,
          }}
        >
          {c}
        </td>
      ))}
    </tr>
  );
}
