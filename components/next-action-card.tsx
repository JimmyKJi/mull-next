// Adaptive "what's next" prompt for the /account top section.
//
// Surfaces a single high-value next action based on user state:
//   - Took the quiz? Direct them to today's dilemma.
//   - Answered today's dilemma + low streak? Encourage tomorrow's.
//   - Hot streak? Suggest sharing.
//   - No quiz yet? (Handled elsewhere by the FirstStepCard grid;
//     we render null here.)
//
// Static / server component — takes pre-computed flags from the
// /account page so we don't double-fetch.
//
// v3 pixel chrome: chunky 4px ink border + accent-colored hard
// shadow that matches the branch's accent color. The CTA is a
// pixel button with stepped hover.

import Link from 'next/link';

const serif = "'Cormorant Garamond', Georgia, serif";
const pixel = "var(--font-pixel-display, 'Courier New', monospace)";

type Props = {
  quizCount: number;
  respondedToday: boolean;
  streak: number;
  hasShareable: boolean;       // user has at least one quiz attempt to share
  topArchetypeKey?: string;
};

export default function NextActionCard({
  quizCount, respondedToday, streak, hasShareable, topArchetypeKey,
}: Props) {
  // No quiz yet → caller already shows the FirstStepCard grid; render
  // nothing here so the two don't fight for attention.
  if (quizCount === 0) return null;

  let eyebrow: string;
  let title: string;
  let body: string;
  let cta: string;
  let href: string;
  let accent: string;

  if (!respondedToday) {
    eyebrow = "TODAY'S PROMPT";
    title = "Today's dilemma is waiting.";
    body = "One short philosophical question. Your answer adds a small shift to your map.";
    cta = "ANSWER TODAY'S →";
    href = '/dilemma';
    accent = '#B8862F';
  } else if (streak >= 7 && hasShareable && topArchetypeKey) {
    eyebrow = `${streak}-DAY STREAK`;
    title = "You've kept the practice for a week.";
    body = "Worth marking. Drop a screenshot to your story so a friend might find their map too.";
    cta = 'GET YOUR SHARE CARD →';
    href = `/share/${topArchetypeKey}`;
    accent = '#2F5D5C';
  } else if (streak >= 3) {
    eyebrow = `${streak}-DAY STREAK`;
    title = 'Today is in. Try a different angle.';
    body = 'A diary entry or a philosophical exercise lets you write longer-form — they shift the map differently.';
    cta = 'OPEN THE DIARY →';
    href = '/diary';
    accent = '#7A4A2E';
  } else if (streak >= 1) {
    eyebrow = `DAY ${streak}`;
    title = 'Today is in. Come back tomorrow.';
    body = 'Two days in a row turns this into a habit. The map shifts when you keep showing up.';
    cta = 'SEE HOW IT SHIFTED →';
    href = '/account#progression';
    accent = '#2F5D5C';
  } else {
    // respondedToday && streak === 0 — shouldn't normally happen, but
    // be defensive.
    eyebrow = "TODAY'S PROMPT";
    title = 'Nicely done.';
    body = 'Your response is logged. The shift is small but real — see it on your map below.';
    cta = 'SCROLL TO MAP →';
    href = '/account#map';
    accent = '#2F5D5C';
  }

  return (
    <section style={{
      padding: '20px 24px',
      background: '#FFFCF4',
      border: '4px solid #221E18',
      boxShadow: `5px 5px 0 0 ${accent}`,
      borderRadius: 0,
      marginBottom: 28,
      display: 'flex',
      gap: 18,
      alignItems: 'center',
      flexWrap: 'wrap',
    }}>
      <div style={{ flex: '1 1 320px', minWidth: 0 }}>
        <div style={{
          fontFamily: pixel,
          fontSize: 11,
          color: accent,
          textTransform: 'uppercase',
          letterSpacing: '0.18em',
          marginBottom: 8,
        }}>
          ▸ {eyebrow}
        </div>
        <h2 style={{
          fontFamily: serif,
          fontSize: 22,
          fontWeight: 500,
          color: '#221E18',
          margin: '0 0 4px',
          letterSpacing: '-0.3px',
          lineHeight: 1.25,
        }}>
          {title}
        </h2>
        <p style={{
          fontFamily: serif,
          fontStyle: 'italic',
          fontSize: 15,
          color: '#4A4338',
          margin: 0,
          lineHeight: 1.5,
        }}>
          {body}
        </p>
      </div>
      <Link
        href={href}
        className="pixel-press"
        style={{
          padding: '12px 20px',
          background: '#221E18',
          color: '#FAF6EC',
          border: '4px solid #221E18',
          borderRadius: 0,
          boxShadow: `4px 4px 0 0 ${accent}`,
          fontFamily: pixel,
          fontSize: 12,
          letterSpacing: '0.08em',
          textDecoration: 'none',
          flexShrink: 0,
          transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end)',
        }}
      >
        {cta}
      </Link>
    </section>
  );
}
