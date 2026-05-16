"use client";

// ConstellationMount — wraps the 3D constellation in a Next.js dynamic
// import (ssr:false) so the heavy three.js bundle only ships to the
// client, not the SSR HTML. While the bundle loads, we show the
// existing 2D SVG constellation as a placeholder — same data, cheap
// to render, fades to the 3D version on hydration.
//
// Why a separate file: dynamic() with `ssr:false` must be called from
// a Client Component. Putting it next to the 2D Constellation lets
// pages import either or both without thinking about the boundary.
//
// Mobile fullscreen mode (Phase P8):
//   - On touch devices, the inline constellation is rendered at a
//     reduced height (default: 360px) so it doesn't eat the entire
//     viewport, and a chunky "▶ FULLSCREEN" pixel button is overlaid
//     at top-right.
//   - Tapping fullscreen opens a portal-like full-viewport overlay
//     with the constellation at 100vh and a pixel close button.
//   - ESC closes fullscreen.

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Constellation } from "./constellation";
import FocusTrap from "./focus-trap";

const Constellation3D = dynamic(
  () => import("./constellation-3d").then((m) => m.Constellation3D),
  {
    ssr: false,
    // The 2D version is what visitors see during the ~1s the 3D
    // bundle is loading. It's also the fallback for users on
    // browsers without WebGL (the 3D component would error out
    // during init; this catches it gracefully).
    loading: () => (
      <div className="relative w-full overflow-hidden rounded-2xl border border-[#D6CDB6] bg-[#FFFCF4]">
        <Constellation
          variant="interactive"
          clickable={false}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-[11px] uppercase tracking-[0.22em] text-[#8C6520] opacity-70">
          Loading 3D view…
        </div>
      </div>
    ),
  },
);

type Props = {
  userVector?: number[];
  /** Desktop / tablet height (px). Default 540. */
  height?: number;
  /** Mobile (touch device) inline height (px). Default 360 — small
      enough that the constellation doesn't eat the viewport, with a
      "▶ FULLSCREEN" button to expand it on demand. */
  mobileHeight?: number;
  variant?: "interactive" | "ambient";
};

export function ConstellationMount({
  userVector,
  height = 540,
  mobileHeight = 360,
  variant = "interactive",
}: Props) {
  const [isTouch, setIsTouch] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  // Detect touch devices once on mount. We use this to shrink the
  // inline height + reveal the FULLSCREEN button. We deliberately
  // check (hover: none) rather than userAgent so an iPad with a
  // mouse keeps the desktop experience.
  useEffect(() => {
    const mq = window.matchMedia('(hover: none) and (pointer: coarse)');
    const update = () => setIsTouch(mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);

  // Lock body scroll while fullscreen is open so the page underneath
  // doesn't scroll under the constellation.
  useEffect(() => {
    if (!fullscreen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [fullscreen]);

  const inlineHeight = isTouch ? mobileHeight : height;

  return (
    <>
      <div style={{ position: 'relative' }}>
        <Constellation3D
          userVector={userVector}
          height={inlineHeight}
          variant={variant}
        />
        {/* Touch-only fullscreen trigger. Hidden on hover-capable
            devices since they have plenty of viewport to interact
            with the inline constellation already. */}
        {isTouch && (
          <button
            type="button"
            onClick={() => setFullscreen(true)}
            aria-label="Open constellation fullscreen"
            className="pixel-press"
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              zIndex: 5,
              padding: '8px 12px',
              background: '#221E18',
              color: '#FAF6EC',
              border: '3px solid #B8862F',
              boxShadow: '3px 3px 0 0 #B8862F',
              borderRadius: 0,
              fontFamily: "var(--font-pixel-display, 'Courier New', monospace)",
              fontSize: 10,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end)',
            }}
          >
            ▶ FULLSCREEN
          </button>
        )}
      </div>

      {fullscreen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Constellation fullscreen view"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 70,
            background: '#0E1419',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <FocusTrap onEscape={() => setFullscreen(false)}>
            {/* Top bar — pixel chrome, close button on the right. */}
            <div style={{
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderBottom: '4px solid #221E18',
              background: '#221E18',
            }}>
              <span style={{
                fontFamily: "var(--font-pixel-display, 'Courier New', monospace)",
                fontSize: 11,
                color: '#F8EDC8',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
              }}>
                ▶ MAP_OF_MINDS.EXE · FULLSCREEN
              </span>
              <button
                type="button"
                onClick={() => setFullscreen(false)}
                aria-label="Close fullscreen"
                className="pixel-press"
                style={{
                  padding: '6px 12px',
                  background: '#B8862F',
                  color: '#1A1612',
                  border: '3px solid #221E18',
                  boxShadow: '3px 3px 0 0 #221E18',
                  borderRadius: 0,
                  fontFamily: "var(--font-pixel-display, 'Courier New', monospace)",
                  fontSize: 11,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'transform 80ms steps(2, end), box-shadow 80ms steps(2, end)',
                }}
              >
                ✕ CLOSE
              </button>
            </div>
            {/* Constellation fills remaining viewport height. */}
            <div style={{ flex: 1, minHeight: 0 }}>
              <Constellation3D
                userVector={userVector}
                height={typeof window !== 'undefined' ? window.innerHeight - 56 : 600}
                variant={variant}
              />
            </div>
          </FocusTrap>
        </div>
      )}
    </>
  );
}
