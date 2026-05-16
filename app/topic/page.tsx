// /topic — index of all topic explainer pages.
//
// Linked from the home footer + the global Cmd-K palette. The list
// is short by design (~15 entries) so the index serves as a "guided
// tour through Mull's editorial map of philosophy" rather than a
// dump.

import Link from 'next/link';
import type { Metadata } from 'next';
import { TOPICS } from '@/lib/topics';
import { PixelPageHeader } from '@/components/pixel-window';
import LanguageSwitcher from '@/components/language-switcher';
import { getServerLocale } from '@/lib/locale-server';

export const metadata: Metadata = {
  title: 'Topics in philosophy',
  description: 'Short, readable primers on philosophical concepts — free will, stoicism, the trolley problem, and more. Each ends with where you sit on the map.',
  alternates: { canonical: 'https://mull.world/topic' },
};

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";
const serif = "'Cormorant Garamond', Georgia, serif";

export default async function TopicIndexPage() {
  const locale = await getServerLocale();

  return (
    <main className="mx-auto max-w-[820px] px-6 pb-32 pt-10 sm:px-10">
      <div className="mb-6 flex justify-end">
        <LanguageSwitcher initial={locale} />
      </div>

      <PixelPageHeader
        eyebrow="▶ TOPICS"
        title="TOPICS IN PHILOSOPHY"
        subtitle={
          <p style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 16, color: '#4A4338', lineHeight: 1.55 }}>
            Short primers on the questions philosophers keep returning to — free
            will, stoicism, the trolley problem, what makes a life meaningful.
            Each ends with a way to find where you sit.
          </p>
        }
      />

      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 14 }}>
        {TOPICS.map(t => (
          <li key={t.slug}>
            <Link
              href={`/topic/${t.slug}`}
              className="pixel-press"
              style={{
                display: 'block',
                padding: '18px 22px',
                background: '#FFFCF4',
                border: '4px solid #221E18',
                boxShadow: '4px 4px 0 0 #B8862F',
                borderRadius: 0,
                textDecoration: 'none',
                color: 'inherit',
                transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end)',
              }}
            >
              <h2 style={{
                fontFamily: serif,
                fontSize: 24,
                fontWeight: 500,
                margin: '0 0 8px',
                letterSpacing: '-0.3px',
                color: '#221E18',
              }}>
                {t.title}
              </h2>
              <p style={{
                fontFamily: serif,
                fontStyle: 'italic',
                fontSize: 16,
                color: '#4A4338',
                margin: 0,
                lineHeight: 1.5,
              }}>
                {t.summary}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
