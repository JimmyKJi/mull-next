'use client';

// Live search input with 300ms debounce. State machine:
//  - empty query → show empty state ("type to search")
//  - typing      → "searching…"
//  - settled     → results or "no matches"
//  - error       → quiet error message

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { t, type Locale } from '@/lib/translations';
import EmptyStateSprite from '@/components/empty-state-sprite';

const serif = "'Cormorant Garamond', Georgia, serif";
const sans = "'Inter', system-ui, sans-serif";

type Result = {
  handle: string;
  display_name: string | null;
  bio: string | null;
  url: string;
};

export default function SearchPanel({ locale = 'en' }: { locale?: Locale }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reqIdRef = useRef(0);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim()) {
      setResults([]);
      setSearching(false);
      setError(null);
      setHasSearched(false);
      return;
    }
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      const myReqId = ++reqIdRef.current;
      try {
        const res = await fetch(`/api/profile/search?q=${encodeURIComponent(q.trim())}&limit=15`);
        const json = await res.json();
        // Guard against out-of-order responses — only apply the latest.
        if (myReqId !== reqIdRef.current) return;
        if (!res.ok) {
          setError(json?.error || 'Search failed.');
          setResults([]);
        } else {
          setResults(json.results || []);
          setError(null);
        }
      } catch (e) {
        if (myReqId !== reqIdRef.current) return;
        console.error(e);
        setError('Network error.');
        setResults([]);
      } finally {
        if (myReqId === reqIdRef.current) {
          setSearching(false);
          setHasSearched(true);
        }
      }
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [q]);

  return (
    <div className="pixel-form">
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          value={q}
          onChange={e => setQ(e.target.value)}
          autoFocus
          placeholder={t('search.placeholder', locale)}
          aria-label={t('search.title', locale)}
          maxLength={64}
          style={{
            fontFamily: serif,
            fontStyle: 'italic',
            fontSize: 18,
            padding: '14px 18px',
            border: '1px solid #D6CDB6',
            borderRadius: 10,
            background: '#FFFCF4',
            color: '#221E18',
            outline: 'none',
            width: '100%',
            boxSizing: 'border-box',
          }}
        />
        {searching && (
          <span style={{
            position: 'absolute',
            right: 18,
            top: '50%',
            transform: 'translateY(-50%)',
            fontFamily: sans,
            fontSize: 12,
            color: '#8C6520',
            opacity: 0.7,
            letterSpacing: 0.3,
          }}>
            {t('search.searching', locale)}
          </span>
        )}
      </div>

      {error && (
        <p className="pixel-alert pixel-alert--error" style={{ marginTop: 16 }}>
          {error}
        </p>
      )}

      {q.trim() && hasSearched && !searching && results.length === 0 && !error && (
        <div style={{ marginTop: 24 }}>
          <EmptyStateSprite
            variant="explorer"
            caption={t('search.no_match', locale, { q })}
          />
        </div>
      )}

      {results.length > 0 && (
        <ul style={{
          marginTop: 24,
          listStyle: 'none',
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}>
          {results.map(r => (
            <li key={r.handle}>
              <Link href={r.url} className="pixel-press" style={{
                display: 'block',
                padding: '14px 18px',
                background: '#FFFCF4',
                border: '3px solid #221E18',
                boxShadow: '3px 3px 0 0 #B8862F',
                borderRadius: 0,
                textDecoration: 'none',
                color: 'inherit',
                transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end)',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  gap: 12,
                  flexWrap: 'wrap',
                }}>
                  <span style={{
                    fontFamily: serif,
                    fontSize: 19,
                    fontWeight: 500,
                    color: '#221E18',
                  }}>
                    {r.display_name || r.handle}
                  </span>
                  <span style={{
                    fontFamily: sans,
                    fontSize: 12.5,
                    color: '#8C6520',
                  }}>
                    @{r.handle}
                  </span>
                </div>
                {r.bio && (
                  <p style={{
                    margin: '6px 0 0',
                    fontFamily: serif,
                    fontStyle: 'italic',
                    fontSize: 14,
                    color: '#4A4338',
                    lineHeight: 1.5,
                  }}>
                    {r.bio.length > 140 ? r.bio.slice(0, 140) + '…' : r.bio}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {!q.trim() && (
        <p style={{
          marginTop: 32,
          fontFamily: sans,
          fontSize: 13,
          color: '#8C6520',
          textAlign: 'center',
          opacity: 0.7,
          lineHeight: 1.6,
        }}>
          {t('search.empty_help', locale)}
        </p>
      )}
    </div>
  );
}
