// /badge/[handle] — embeddable archetype badge.
//
// Designed to be loaded inside a third-party iframe (Notion, Linktree,
// personal blogs, Substack, X bio link, etc.):
//
//   <iframe src="https://mull.world/badge/jimmy"
//           width="320" height="120" frameborder="0"></iframe>
//
// Renders only the badge — no nav, no scroll, no chrome from the
// rest of the site. Designed to look like a small pixel ID card.
//
// Privacy:
//   - Only renders when the user has a public profile.
//   - Archetype is only shown when show_archetype = true.
//   - Otherwise we render a quiet "anonymous mind" badge that still
//     links to their profile (so the badge still works for users
//     who want to be on Mull without disclosing their archetype).
//
// Browser embedding: Next.js doesn't set X-Frame-Options by default,
// and our middleware doesn't either, so this route is iframe-loadable
// from any origin out of the box.

import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata, Viewport } from 'next';
import { createClient } from '@/utils/supabase/server';
import { ArchetypeSprite } from '@/components/archetype-sprite';

export const metadata: Metadata = {
  title: 'Mull badge',
  robots: { index: false, follow: false },
};

// Critical: viewport must not include initial-scale on an embed page,
// or iframe sizing breaks in some host pages.
export const viewport: Viewport = {
  width: 'device-width',
};

const pixel = "var(--font-pixel-display, 'Courier New', monospace)";
const serif = "'Cormorant Garamond', Georgia, serif";

type ProfileRow = {
  user_id: string;
  handle: string;
  display_name: string | null;
  show_archetype: boolean;
};

type Attempt = {
  archetype: string;
  flavor: string | null;
  alignment_pct: number;
};

function archetypeSlug(name: string): string {
  return name
    .replace(/^The\s+/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default async function BadgePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('public_profiles')
    .select('user_id, handle, display_name, show_archetype')
    .eq('handle', handle.toLowerCase())
    .maybeSingle<ProfileRow>();

  if (!profile) notFound();

  // Latest archetype via the public RPC. Only rendered when the user
  // has show_archetype = true.
  let latest: Attempt | null = null;
  if (profile.show_archetype) {
    const { data: rows } = await supabase.rpc('get_public_latest_archetype', {
      p_user_id: profile.user_id,
    });
    latest = (rows?.[0] ?? null) as Attempt | null;
  }

  const displayName = profile.display_name || profile.handle;
  const archName = latest ? latest.archetype.replace(/^The /, '') : null;
  const archSlug = latest ? archetypeSlug(latest.archetype) : null;

  return (
    <>
      {/* Strip body padding/margins so the badge fills the iframe
          exactly. Background transparent so the host page color
          shows through if they want. */}
      <style>{`
        html, body { margin: 0; padding: 0; background: transparent; }
        body { -webkit-font-smoothing: antialiased; }
      `}</style>
      <a
        href={`https://mull.world/u/${profile.handle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="pixel-press"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 14px',
          background: '#FFFCF4',
          border: '4px solid #221E18',
          boxShadow: '4px 4px 0 0 #B8862F',
          borderRadius: 0,
          textDecoration: 'none',
          color: '#221E18',
          fontFamily: serif,
          width: 'fit-content',
          minWidth: 260,
          maxWidth: 320,
          transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end)',
        }}
      >
        {/* Sprite tile — archetype sprite when public, generic pixel
            "M" otherwise. */}
        <div
          className="pixel-crisp"
          style={{
            width: 56,
            height: 56,
            background: '#F8EDC8',
            border: '3px solid #221E18',
            boxShadow: '2px 2px 0 0 #8C6520',
            padding: 4,
            flexShrink: 0,
          }}
          aria-hidden
        >
          {archSlug ? (
            <ArchetypeSprite archetypeKey={archSlug} size={42} />
          ) : (
            // Fallback: pixel "M" monogram for users without a public
            // archetype.
            <div style={{
              width: '100%', height: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: pixel,
              fontSize: 22,
              color: '#8C6520',
            }}>
              M
            </div>
          )}
        </div>

        {/* Name + archetype */}
        <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
          <div style={{
            fontFamily: pixel,
            fontSize: 9,
            color: '#8C6520',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            marginBottom: 4,
          }}>
            ON MULL
          </div>
          <div style={{
            fontFamily: serif,
            fontSize: 17,
            fontWeight: 500,
            color: '#221E18',
            lineHeight: 1.1,
            marginBottom: 4,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {displayName}
          </div>
          {archName ? (
            <div style={{
              fontFamily: serif,
              fontStyle: 'italic',
              fontSize: 13,
              color: '#8C6520',
              lineHeight: 1.2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {latest?.flavor ? `${latest.flavor} ` : 'The '}{archName}
              {' · '}
              <span style={{ fontFamily: pixel, fontSize: 10, fontStyle: 'normal' }}>
                {latest?.alignment_pct}%
              </span>
            </div>
          ) : (
            <div style={{
              fontFamily: serif,
              fontStyle: 'italic',
              fontSize: 13,
              color: '#8C6520',
              lineHeight: 1.2,
            }}>
              an anonymous mind
            </div>
          )}
        </div>

        {/* mull. wordmark anchor */}
        <div style={{
          fontFamily: serif,
          fontSize: 13,
          fontWeight: 600,
          color: '#221E18',
          letterSpacing: '-0.3px',
          flexShrink: 0,
        }}>
          mull<span style={{ color: '#B8862F' }}>.</span>
        </div>
      </a>
    </>
  );
}
