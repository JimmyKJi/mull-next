'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { t, type Locale } from '@/lib/translations';

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";
const serif = 'var(--font-prose)';

type Topic = {
  slug: string;
  title: string;
  category: 'philosophical' | 'everyday';
  prompt: string;
  primer: string;
};

export default function NewChallengeClient({
  topics,
  locale,
}: {
  topics: Topic[];
  locale: Locale;
}) {
  const router = useRouter();
  const [topicSlug, setTopicSlug] = useState<string | null>(null);
  const [opening, setOpening] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedTopic = topics.find((t) => t.slug === topicSlug);

  async function submit() {
    if (!topicSlug || opening.trim().length < 50 || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/arena/pvp/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic_slug: topicSlug,
          opening_content: opening.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error ?? t('arena.err_post', locale));
        setSubmitting(false);
        return;
      }
      router.push(`/arena/pvp/${json.session_id}`);
    } catch {
      setError(t('arena.err_network', locale));
      setSubmitting(false);
    }
  }

  const grouped = {
    philosophical: topics.filter((t) => t.category === 'philosophical'),
    everyday: topics.filter((t) => t.category === 'everyday'),
  };

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <section>
        <Head n={1} title={t('arena.pve_pick_topic', locale)} locale={locale} />
        {(['philosophical', 'everyday'] as const).map((cat) => {
          const list = grouped[cat];
          if (list.length === 0) return null;
          return (
            <div key={cat} style={{ marginBottom: 14 }}>
              <div
                style={{
                  fontFamily: pixel,
                  fontSize: 10,
                  color: 'var(--color-acc-deep)',
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  marginBottom: 6,
                }}
              >
                ▸{' '}
                {t(
                  cat === 'philosophical'
                    ? 'arena.pve_cat_philosophical'
                    : 'arena.pve_cat_everyday',
                  locale,
                )}
              </div>
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'grid',
                  gap: 6,
                }}
              >
                {list.map((topic) => {
                  const picked = topicSlug === topic.slug;
                  return (
                    <li key={topic.slug}>
                      <button
                        type="button"
                        onClick={() => setTopicSlug(topic.slug)}
                        style={{
                          display: 'block',
                          width: '100%',
                          textAlign: 'left',
                          padding: '10px 12px',
                          background: picked ? '#F8C75E' : '#FFFCF4',
                          border: '3px solid var(--color-ink)',
                          boxShadow: picked
                            ? '4px 4px 0 0 #2F5D5C'
                            : '3px 3px 0 0 var(--color-acc)',
                          cursor: 'pointer',
                          fontFamily: serif,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 15,
                            fontWeight: 500,
                            color: 'var(--color-ink)',
                          }}
                        >
                          {topic.title}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </section>

      {selectedTopic && (
        <section>
          <Head n={2} title={t('arena.pvp_opening_title', locale)} locale={locale} />
          <div
            style={{
              padding: '12px 14px',
              background: '#1F1814',
              border: '3px solid var(--color-acc)',
              marginBottom: 12,
            }}
          >
            <div
              style={{
                fontFamily: pixel,
                fontSize: 10,
                color: 'var(--color-acc)',
                letterSpacing: 0.4,
                textTransform: 'uppercase',
                marginBottom: 4,
              }}
            >
              {t('arena.pvp_topic_label', locale)}
            </div>
            <p
              style={{
                fontFamily: serif,
                fontStyle: 'italic',
                fontSize: 15,
                color: 'var(--color-acc-soft)',
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              {selectedTopic.prompt}
            </p>
          </div>
          <p
            style={{
              fontFamily: serif,
              fontStyle: 'italic',
              fontSize: 14,
              color: 'var(--color-acc-deep)',
              margin: '0 0 8px',
            }}
          >
            {t('arena.pvp_opening_help', locale)}
          </p>
          <textarea
            value={opening}
            onChange={(e) => setOpening(e.target.value)}
            placeholder={t('arena.pvp_opening_placeholder', locale)}
            maxLength={2000}
            rows={8}
            style={{
              width: '100%',
              padding: 14,
              fontFamily: serif,
              fontSize: 16,
              lineHeight: 1.55,
              border: '3px solid var(--color-ink)',
              background: '#FFFCF4',
              color: 'var(--color-ink)',
              resize: 'vertical',
              minHeight: 160,
            }}
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 8,
              flexWrap: 'wrap',
              gap: 10,
            }}
          >
            <span
              style={{
                fontFamily: pixel,
                fontSize: 10,
                color: 'var(--color-acc-deep)',
                letterSpacing: 0.4,
                textTransform: 'uppercase',
              }}
            >
              {opening.length} / 2000
            </span>
            <button
              type="button"
              onClick={submit}
              disabled={!topicSlug || opening.trim().length < 50 || submitting}
              style={{
                padding: '14px 20px',
                background:
                  topicSlug && opening.trim().length >= 50 ? '#F8C75E' : 'var(--color-line)',
                color: '#1A1820',
                border: '3px solid var(--color-ink)',
                boxShadow: '3px 3px 0 0 #2F5D5C',
                cursor: topicSlug && opening.trim().length >= 50 ? 'pointer' : 'not-allowed',
                fontFamily: pixel,
                fontSize: 12,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
              }}
            >
              {submitting ? t('arena.pvp_posting', locale) : t('arena.pvp_post_challenge', locale)}
            </button>
          </div>
        </section>
      )}

      {error && (
        <p
          style={{
            padding: '10px 14px',
            background: '#F5E0E0',
            border: '2px solid #7A2E2E',
            fontFamily: serif,
            fontSize: 14,
            color: '#4D1818',
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

function Head({ n, title, locale }: { n: number; title: string; locale: Locale }) {
  return (
    <div
      style={{
        fontFamily: pixel,
        fontSize: 11,
        color: 'var(--color-ink)',
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        marginBottom: 10,
        textShadow: '2px 2px 0 var(--pixel-shadow, var(--color-acc))',
      }}
    >
      {t('arena.pve_step', locale, { n, title: title.toUpperCase() })}
    </div>
  );
}
