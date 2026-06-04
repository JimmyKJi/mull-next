// /topic — index of all topic explainer pages.
//
// Now categorised: schools of thought, big questions, ethics, eastern
// traditions, knowledge & beauty. A featured topic rotates daily based
// on day-of-year. Each card links to /topic/<slug>.
//
// Linked from the home footer + the global Cmd-K palette. Adding a
// new topic? Register its slug in TOPIC_CATEGORIES inside lib/topics.ts
// so it joins a section instead of dropping into the "More" bucket.

import Link from 'next/link';
import type { Metadata } from 'next';
import { TOPICS, topicsByCategory } from '@/lib/topics';
import { localizeTopic } from '@/lib/topics-i18n';
import { t } from '@/lib/translations';
import { PixelPageHeader } from '@/components/pixel-window';
import { getServerLocale } from '@/lib/locale-server';

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";
const serif = "var(--font-prose)";
const sans = "'Inter', system-ui, sans-serif";

export const metadata: Metadata = {
  title: 'Topics in philosophy',
  description: 'Short, readable primers on 32 philosophical concepts — free will, stoicism, Buddhism, the trolley problem, and more. Each ends with where you sit on the map.',
  alternates: { canonical: 'https://mull.world/topic' },
};

/** Featured topic rotates by day-of-year so the page feels alive
 *  without server state. Picks from a hand-chosen subset that reads
 *  well as the headline introduction. */
function pickFeaturedTopic() {
  const featuredSlugs = [
    'free-will', 'stoicism', 'meaning-of-life', 'absurdism',
    'buddhism', 'authenticity', 'consciousness', 'virtue-ethics',
    'daoism', 'existentialism', 'trolley-problem', 'eudaimonia',
  ];
  const now = new Date();
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86_400_000
  );
  const idx = dayOfYear % featuredSlugs.length;
  return TOPICS.find(t => t.slug === featuredSlugs[idx]) ?? TOPICS[0];
}

export default async function TopicIndexPage() {
  const locale = await getServerLocale();
  const groups = topicsByCategory();
  const featured = localizeTopic(pickFeaturedTopic(), locale);

  return (
    <main className="mx-auto max-w-[920px] px-5 pb-32 pt-10 sm:px-10">
      <PixelPageHeader
        eyebrow={`▶ ${t('topic.idx_eyebrow', locale)}`}
        title={t('topic.title', locale)}
        subtitle={
          <p style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 16, color: '#4A4338', lineHeight: 1.55 }}>
            {t('topic.subtitle', locale, { count: TOPICS.length })}
          </p>
        }
      />

      {/* ─── Featured topic card ───────────────────────────────── */}
      <section style={{ marginBottom: 36 }}>
        <div style={{
          fontFamily: pixel,
          fontSize: 10,
          color: '#8C6520',
          letterSpacing: 0.6,
          textTransform: 'uppercase',
          marginBottom: 8,
        }}>
          ◇ {t('topic.featured_today', locale)}
        </div>
        <Link
          href={`/topic/${featured.slug}`}
          className="pixel-press"
          style={{
            display: 'block',
            padding: '24px 26px',
            background: '#F8EBC9',
            border: '4px solid #221E18',
            boxShadow: '6px 6px 0 0 #B8862F',
            borderRadius: 0,
            textDecoration: 'none',
            color: 'inherit',
            transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end)',
          }}
        >
          <h2 style={{
            fontFamily: serif,
            fontSize: 30,
            fontWeight: 500,
            margin: '0 0 10px',
            letterSpacing: '-0.4px',
            color: '#221E18',
            lineHeight: 1.15,
          }}>
            {featured.title}
          </h2>
          <p style={{
            fontFamily: serif,
            fontStyle: 'italic',
            fontSize: 17,
            color: '#4A4338',
            margin: '0 0 12px',
            lineHeight: 1.5,
          }}>
            {featured.summary}
          </p>
          <span style={{
            fontFamily: pixel,
            fontSize: 10,
            color: '#8C6520',
            letterSpacing: 0.6,
            textTransform: 'uppercase',
          }}>
            {t('topic.read', locale)} ▶
          </span>
        </Link>
      </section>

      {/* ─── Quick jump nav ────────────────────────────────────── */}
      <nav style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 28,
        paddingBottom: 16,
        borderBottom: '2px dashed #C2A062',
      }}>
        {groups.map(g => (
          <a
            key={g.key}
            href={`#${g.key}`}
            style={{
              fontFamily: pixel,
              fontSize: 9.5,
              padding: '6px 10px',
              border: `2px solid ${g.accent}`,
              color: g.accent,
              textDecoration: 'none',
              letterSpacing: 0.5,
              textTransform: 'uppercase',
              background: '#FFFCF4',
              transition: 'background 80ms steps(2,end)',
            }}
          >
            {g.icon} {t(`topic.cat.${g.key}.label`, locale) || g.label}
          </a>
        ))}
      </nav>

      {/* ─── Sections ──────────────────────────────────────────── */}
      {groups.map(g => (
        <section key={g.key} id={g.key} style={{ marginBottom: 44, scrollMarginTop: 24 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 6,
          }}>
            <span style={{
              fontFamily: pixel,
              fontSize: 18,
              color: g.accent,
              lineHeight: 1,
            }}>
              {g.icon}
            </span>
            <h2 style={{
              fontFamily: serif,
              fontSize: 25,
              fontWeight: 500,
              margin: 0,
              letterSpacing: '-0.3px',
              color: '#221E18',
            }}>
              {t(`topic.cat.${g.key}.label`, locale) || g.label}
            </h2>
            <span style={{
              fontFamily: sans,
              fontSize: 11,
              color: '#8C6520',
              opacity: 0.7,
              marginLeft: 'auto',
            }}>
              {g.topics.length}
            </span>
          </div>
          <p style={{
            fontFamily: serif,
            fontStyle: 'italic',
            fontSize: 14.5,
            color: '#4A4338',
            margin: '0 0 16px',
            lineHeight: 1.55,
          }}>
            {t(`topic.cat.${g.key}.blurb`, locale) || g.blurb}
          </p>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 10,
          }}>
            {g.topics.map(t => (
              <li key={t.slug}>
                <Link
                  href={`/topic/${t.slug}`}
                  className="pixel-press"
                  style={{
                    display: 'block',
                    padding: '14px 16px',
                    background: '#FFFCF4',
                    border: '3px solid #221E18',
                    boxShadow: `3px 3px 0 0 ${g.accent}`,
                    borderRadius: 0,
                    textDecoration: 'none',
                    color: 'inherit',
                    height: '100%',
                    transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end)',
                  }}
                >
                  <h3 style={{
                    fontFamily: serif,
                    fontSize: 18,
                    fontWeight: 500,
                    margin: '0 0 6px',
                    letterSpacing: '-0.2px',
                    color: '#221E18',
                    lineHeight: 1.2,
                  }}>
                    {localizeTopic(t, locale).title}
                  </h3>
                  <p style={{
                    fontFamily: serif,
                    fontStyle: 'italic',
                    fontSize: 14,
                    color: '#4A4338',
                    margin: 0,
                    lineHeight: 1.45,
                  }}>
                    {localizeTopic(t, locale).summary}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {/* ─── CTA footer ────────────────────────────────────────── */}
      <div style={{
        marginTop: 36,
        padding: '20px 22px',
        background: '#FFFCF4',
        border: '3px solid #221E18',
        boxShadow: '4px 4px 0 0 #6B7F4F',
      }}>
        <p style={{
          fontFamily: serif,
          fontSize: 16,
          color: '#221E18',
          margin: '0 0 12px',
          lineHeight: 1.5,
        }}>
          {t('topic.cta_body', locale)}
        </p>
        <Link
          href="/inheritor"
          style={{
            display: 'inline-block',
            fontFamily: pixel,
            fontSize: 11,
            padding: '8px 14px',
            background: '#221E18',
            color: '#F8EBC9',
            border: '2px solid #221E18',
            textDecoration: 'none',
            letterSpacing: 0.6,
            textTransform: 'uppercase',
          }}
        >
          ▶ {t('topic.cta_button', locale)}
        </Link>
      </div>
    </main>
  );
}
