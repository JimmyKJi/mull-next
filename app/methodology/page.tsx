// /methodology — defends the 16-D model + lists every AI integration in
// one document. Lives here so a serious reader doesn't have to email Jimmy
// to ask "are these dimensions orthogonal?" or "what data goes to Claude?"
//
// Sources of truth:
//   - 16D model section: copies the principles from About + the long-form
//     defense Jimmy will refine over time. Treat this like a versioned
//     methodology paper — keep the "last reviewed" date current.
//   - AI uses table: enumerated by walking app/api routes that call
//     Claude. Update whenever a new integration ships.

import Link from 'next/link';
import type { Metadata } from 'next';
import { getServerLocale } from '@/lib/locale-server';
import LanguageSwitcher from '@/components/language-switcher';

const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'Inter', system-ui, sans-serif";

export const metadata: Metadata = {
  title: 'Methodology',
  description: "How Mull's 16-dimensional model was built, what it claims to capture, and exactly where AI sits inside the product.",
  openGraph: {
    title: 'Methodology — Mull',
    description: "How Mull's 16-dimensional model was built, what it claims to capture, and exactly where AI sits inside the product.",
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
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '60px 24px 120px' }}>
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

      <div style={{
        fontFamily: sans,
        fontSize: 11,
        fontWeight: 600,
        color: '#8C6520',
        textTransform: 'uppercase',
        letterSpacing: '0.18em',
        marginBottom: 14,
      }}>
        Methodology · last reviewed {LAST_REVIEWED}
      </div>
      <h1 style={{
        fontFamily: serif,
        fontSize: 44,
        fontWeight: 500,
        margin: '0 0 12px',
        letterSpacing: '-0.5px',
        lineHeight: 1.05,
      }}>
        How Mull works, in detail.
      </h1>
      <p style={{
        fontFamily: serif,
        fontStyle: 'italic',
        fontSize: 18,
        color: '#4A4338',
        margin: '0 0 36px',
        lineHeight: 1.55,
      }}>
        For readers who want more than the About page. The 16-dimensional model defended at length, and an enumerated list of every place AI sits inside the product.
      </p>

      <Section title="Why sixteen dimensions">
        <p>The standard alternatives — political compasses, MBTI, Big Five — collapse worldview to two, four, or five axes. That collapse is convenient (it produces tidy quadrants and shareable labels) but expensive: real philosophical positions don&apos;t live on so few axes. Hume and Buddha both score high on a kind of <em>self-as-illusion</em>; they reach it from opposite directions. A two-axis system can&apos;t see the difference. Mull&apos;s sixteen dimensions are an attempt to be coarse enough to be useful, fine enough to keep the distinctions that matter.</p>
        <p>The dimensions were chosen by reading widely across the canon and asking: <em>what stable axes recur, across centuries, when philosophers actually disagree?</em> The shortlist that survived is the result of dozens of iterations &mdash; some axes that seemed important early on (e.g. Optimism/Pessimism) turned out to be derivative of other dimensions and were dropped. Others (Self as Illusion, Communal Embeddedness) earned their place by repeatedly differentiating thinkers that other axes flattened.</p>
        <p>The dimensions aren&apos;t mutually exclusive and aren&apos;t orthogonal in any strict mathematical sense. <em>Trust in Reason</em> and <em>Trust in Experience</em> covary in some philosophers and pull apart in others. <em>Communal Embeddedness</em> and <em>Sovereign Self</em> are partly opposed, but both can score high in someone like Confucius (who locates the self deeply in relations <em>and</em> emphasizes self-cultivation). The sixteen-dimensional space is not a vector basis; it&apos;s a coordinate system that captures the texture of philosophical disagreement.</p>
      </Section>

      <Section title="What the dimensions are NOT">
        <ul style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'grid',
          gap: 12,
        }}>
          <li>They <strong>aren&apos;t a personality test.</strong> Mull doesn&apos;t claim to predict behavior. It tries to map where you currently land in a long conversation about how to think.</li>
          <li>They <strong>aren&apos;t a verdict.</strong> The same person taking the quiz six months apart will land in slightly different places — that drift is the most interesting signal, and the trajectory map is built around it.</li>
          <li>They <strong>aren&apos;t empirically validated</strong> in the psychometric sense. We have no validation studies, no test-retest reliability data, no factor analysis of large user samples. This is a designed instrument, drawn from reading philosophical texts, not a discovered one. We&apos;re explicit about that limitation.</li>
          <li>They <strong>aren&apos;t culture-neutral.</strong> The selection of dimensions reflects the philosophical traditions Mull&apos;s author has read most carefully — heavily Western, with deliberate widening into Asian, African, and Indigenous philosophy. The dimensions try to capture distinctions that recur across traditions, but the framing is unavoidably perspectival.</li>
        </ul>
      </Section>

      <Section title="The mapping from quiz to position">
        <p>Each multiple-choice question has 3–6 answers. Each answer carries a small vector — a few non-zero entries on the 16 dimensions, weighted +1 to +3 (positive) or, occasionally, negative. Those vectors are summed across all your answered questions to produce your raw position. The position is then compared by cosine similarity to the prototype vectors of each archetype (also hand-designed) to pick a primary archetype.</p>
        <p>Skipping questions reduces total signal but doesn&apos;t bias position — skipped questions just don&apos;t contribute. Multi-select questions split their weight across selected answers. The raw vector is shown to you on the results page (the dimensional profile section) so you can see the math, not just the headline.</p>
        <p>Daily dilemmas, diary entries, and exercise reflections work differently. Their vectors come from <em>Claude reading your prose</em>, which is the only place a model has discretion over your map. The next section enumerates exactly how.</p>
      </Section>

      <Section title="Where AI sits inside Mull">
        <p>Five places, all narrow, all read-only with respect to the model&apos;s training. We do not send your data to anyone for training; we don&apos;t store or expose it beyond what you see on your account.</p>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontFamily: sans,
          fontSize: 14,
          marginTop: 14,
        }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #D6CDB6' }}>
              <Th>Where</Th>
              <Th>What it does</Th>
              <Th>What it gets</Th>
              <Th>What it returns</Th>
            </tr>
          </thead>
          <tbody>
            <Tr cells={[
              'Daily dilemma submission',
              'Reads your prose response, returns a 16-D vector delta + one-line analysis',
              'The day\'s prompt + your response',
              'JSON: { vector_delta: [16 floats], analysis: string }',
            ]} />
            <Tr cells={[
              'Diary entry submission',
              'Same prose-to-vector pipeline as the dilemma, with the diary\'s open-ended prompt',
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
              'The two thinkers\' position vectors + the topic',
              'A staged exchange (3–6 turns), shown on screen, saved to your debate history',
            ]} />
            <Tr cells={[
              'Yearly retrospective (Mull+)',
              'Reads a year of your dilemmas + diary + reflections, writes a ~700-word essay about how your thinking moved',
              'The whole year\'s submitted prose for that user',
              'A long prose essay shown on your account',
            ]} />
          </tbody>
        </table>
        <p style={{ marginTop: 16 }}>The model is currently <strong>Claude Sonnet 4.6</strong> via Anthropic&apos;s direct API. We don&apos;t use embeddings, vector databases, or any third-party AI tooling. The system prompts for each of the above live in the codebase under <code style={{ fontSize: 13, background: '#F5EFDC', padding: '1px 5px', borderRadius: 3 }}>app/api/</code> if you ever want to read them. Anthropic doesn&apos;t train on API traffic by default; we don&apos;t opt into anything else.</p>
      </Section>

      <Section title="What we actually store on the server">
        <p>Three categories of data:</p>
        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 14px', display: 'grid', gap: 10 }}>
          <li><strong>Auth.</strong> Your email, a hashed password, and Supabase&apos;s session metadata. We never see your password in plaintext; password reset goes through Supabase&apos;s standard flow.</li>
          <li><strong>Your data.</strong> Quiz attempts (with the resulting 16-D vector + chosen archetype), dilemma responses, diary entries, exercise reflections, debate history, and your public-profile settings if you opted in. Each row is tagged with your user ID; row-level security enforces that only you (and, if you opted in, the public for explicitly-marked-public rows) can read them.</li>
          <li><strong>Cookies.</strong> Two: <code style={{ fontSize: 13, background: '#F5EFDC', padding: '1px 5px', borderRadius: 3 }}>mull_locale</code> (your language preference) and the Supabase auth session token. Both are strictly necessary for the site to work; we don&apos;t set any analytics, advertising, or tracking cookies.</li>
        </ul>
        <p>You can <Link href="/account/profile" style={{ color: '#8C6520', textDecoration: 'underline', textUnderlineOffset: 3 }}>download all of this as JSON or delete your account outright</Link> from the public-profile settings page.</p>
      </Section>

      <Section title="Open questions we know exist">
        <p>This is not a finished thing. The honest list of what we know is unsolved:</p>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
          <li>The <strong>weighting per quiz answer</strong> was hand-tuned by reading patterns in early test results. It hasn&apos;t been calibrated against any external standard. A rigorous validation pass is on the long-term roadmap.</li>
          <li>The <strong>philosopher position vectors</strong> are drawn from reading their actual writings, but they&apos;re assigned by a single editor (Jimmy). A scholar in each tradition reviewing the assignments would tighten them considerably; that&apos;s queued for after subscriptions cover the cost of paying scholars.</li>
          <li>The <strong>archetype assignments</strong> use cosine similarity, which treats all dimensions as equally important. A real psychometric instrument would weight some axes more heavily based on how much they discriminate between archetypes. We don&apos;t do that yet.</li>
          <li>The <strong>16 dimensions themselves</strong> are not provably the right 16. They&apos;re the result of careful reading and many iterations, but the claim is one of usefulness, not metaphysical correctness.</li>
        </ul>
      </Section>

      <p style={{
        marginTop: 56,
        fontFamily: sans,
        fontSize: 13,
        color: '#8C6520',
        opacity: 0.8,
        lineHeight: 1.6,
      }}>
        Questions, push-back, or factual corrections welcome at <a href="mailto:jimmy.kaian.ji@gmail.com" style={{ color: '#8C6520', textDecoration: 'underline' }}>jimmy.kaian.ji@gmail.com</a>. This page is reviewed quarterly; the date at the top reflects the last full review.
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
      verticalAlign: 'top',
    }}>
      {children}
    </th>
  );
}

function Tr({ cells }: { cells: string[] }) {
  return (
    <tr style={{ borderBottom: '1px solid #EBE3CA' }}>
      {cells.map((c, i) => (
        <td
          key={i}
          style={{
            padding: '12px 8px',
            fontFamily: sans,
            fontSize: 13.5,
            color: '#221E18',
            lineHeight: 1.5,
            verticalAlign: 'top',
          }}
        >
          {c}
        </td>
      ))}
    </tr>
  );
}
