'use client';

// Constellation3D — interactive 3D map of all 560 philosophers.
//
// Centerpiece of the redesign. Drag to orbit, scroll to zoom, hover
// any point to see who they are, click to open their detail page.
// A side legend lets you toggle archetypes on/off so you can see
// (e.g.) "where do all the Cartographers sit?" or "are the
// Hammers really clustered together?".
//
// When `userVector` is provided, a larger pulsing point is added at
// the user's projected position and rendered with a halo.
//
// Tech: React Three Fiber + drei. Lazy-loaded from the consuming
// pages (Next dynamic import, ssr:false) because three.js is a
// chunky bundle and we don't want it on the first paint.
//
// Performance: 560 individual meshes is fine on modern hardware
// (drei's Instances would be more efficient but per-instance event
// handlers + per-color emission are simpler with one mesh per point).
// If perf becomes an issue we'll switch to InstancedMesh + raycast.

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { configureTextBuilder } from 'troika-three-text';
import { useState, useRef, useMemo, Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import * as THREE from 'three';
import { ARCHETYPES } from '@/lib/archetypes';
import { ARCHETYPE_COLORS, DEFAULT_ARCHETYPE_COLOR } from '@/lib/archetype-colors';
import { CANONICAL_PHILOSOPHER_NAMES } from '@/lib/canonical-philosophers';
import { PHILOSOPHER_POSITIONS_3D, projectTo3D } from '@/lib/projection';
import { PhilosopherSprite } from './philosopher-sprite';
import { t, type Locale } from '@/lib/translations';

// Force troika-three-text (drei's <Text>, used for the axis labels
// below) to typeset on the main thread instead of spawning a web
// worker.
//
// troika ships its worker by stringifying the module's `init` and
// eval'ing that source inside the Worker. Turbopack's transformed
// output doesn't survive the round-trip, so the worker's `init`
// returns a non-callable and troika throws "Worker module function
// was called but `init` did not return a callable function" — which
// Turbopack surfaces as a dev-only full-screen unhandledRejection
// overlay (harmless to prod, but it blocks local visual review).
// Main-thread typesetting is trivially cheap for our handful of
// static axis labels and behaves identically in dev and prod. Must
// run before the first <Text> mounts — troika ignores this config
// after the first font request — and module scope in this ssr:false
// chunk guarantees that ordering (the module evaluates before React
// renders the scene).
configureTextBuilder({ useWorker: false });

type Hovered = (typeof PHILOSOPHER_POSITIONS_3D)[number] | null;

type Props = {
  /** When provided, places a "you are here" point in the cloud and
   *  highlights the nearest philosophers. */
  userVector?: number[];
  /** Container height in pixels. Width is always 100%. */
  height?: number;
  /** Variant — "interactive" (full UI: legend, hover card, axis
   *  labels) vs "ambient" (no chrome, just the cloud, used as a
   *  decorative hero element). */
  variant?: 'interactive' | 'ambient';
  /** Display locale for the DOM chrome (search, legend, hover card,
   *  caption). The in-canvas 3D axis labels stay English — the WebGL
   *  text renderer uses an SDF font without CJK glyphs. Defaults 'en'. */
  locale?: Locale;
  /** Whether to render the heavy DOM chrome (archetype legend). The
   *  legend is ~434px tall — taller than the reduced inline height we
   *  use on phones — so on the touch *preview* we hide it and let the
   *  user open FULLSCREEN (where the canvas is tall enough to hold it)
   *  for the full filtering UI. Desktop + fullscreen pass `true`.
   *  Defaults `true`. */
  chrome?: boolean;
};

// Scale the [-1,1] projection into a roomier 3D space so points
// don't sit on top of each other. 4 units = a reasonable scene size
// for a camera at distance ~6.
const SCENE_SCALE = 4;

export function Constellation3D({
  userVector,
  height = 640,
  variant = 'interactive',
  locale = 'en',
  chrome = true,
}: Props) {
  const isInteractive = variant === 'interactive';
  const [hovered, setHovered] = useState<Hovered>(null);

  // Search box: a non-empty query filters which philosophers appear
  // in the cloud, and the search result list (DOM, outside the
  // canvas) lets the user click to "fly to" any matching point.
  const [search, setSearch] = useState('');
  const trimmedQuery = search.trim().toLowerCase();
  const matched = useMemo(() => {
    if (!trimmedQuery) return null; // null = no filter (show all)
    return new Set(
      PHILOSOPHER_POSITIONS_3D.filter((p) => p.name.toLowerCase().includes(trimmedQuery)).map(
        (p) => p.slug,
      ),
    );
  }, [trimmedQuery]);

  // All archetypes start enabled; toggle from the legend.
  const [enabled, setEnabled] = useState<Set<string>>(() => new Set(ARCHETYPES.map((a) => a.key)));

  // Canonical-only mode: by default, show only the 60 canonical
  // philosophers — keeps the cloud legible and the names recognizable.
  // User can flip the legend toggle to opt into the full 560.
  const [showAll, setShowAll] = useState(false);

  // Per-philosopher "pinned" set — when the user finds someone via
  // search who's NOT in the canonical 60, clicking the pin button
  // adds them to this set so they stay visible after the search
  // clears. (Cheap way to "favorite" individuals into the cloud.)
  const [pinned, setPinned] = useState<Set<string>>(() => new Set());

  function togglePin(slug: string) {
    setPinned((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  // When search narrows to a single match, surface its details in the
  // hover card so the user sees who they found without having to
  // mouse-hunt for the highlighted point.
  useEffect(() => {
    if (matched && matched.size === 1) {
      const slug = matched.values().next().value;
      const found = PHILOSOPHER_POSITIONS_3D.find((p) => p.slug === slug);
      if (found) setHovered(found);
    }
  }, [matched]);

  function toggleArchetype(key: string) {
    setEnabled((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function setOnly(key: string) {
    setEnabled(new Set([key]));
  }

  function setAll() {
    setEnabled(new Set(ARCHETYPES.map((a) => a.key)));
  }

  const userPos = useMemo<[number, number, number] | null>(() => {
    if (!userVector || userVector.length !== 16) return null;
    const [x, y, z] = projectTo3D(userVector);
    return [x * SCENE_SCALE, y * SCENE_SCALE, z * SCENE_SCALE];
  }, [userVector]);

  return (
    <div className="relative w-full overflow-hidden bg-[#1A1612]" style={{ height }}>
      <Canvas
        camera={{ position: [6, 5, 7], fov: 45 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
      >
        {/* Brighter ambient + key + amber rim light. The warm tint
            from the rim makes the front-facing points pop against
            the dark amber bg without needing more emissive boost. */}
        <ambientLight intensity={0.55} />
        <directionalLight position={[6, 8, 4]} intensity={0.9} color="#FFE3B0" />
        <directionalLight position={[-6, -4, -4]} intensity={0.4} color="#FFFCF4" />
        {/* Color the scene background with a warm amber-ink tone
            instead of pure dark blue — much friendlier on the eye
            and gives front-facing points more contrast. */}
        <color attach="background" args={['#1A1612']} />

        <Suspense fallback={null}>
          <Scene
            enabled={enabled}
            matched={matched}
            showAll={showAll}
            pinned={pinned}
            userPos={userPos}
            onHover={setHovered}
            isInteractive={isInteractive}
          />
        </Suspense>

        <OrbitControls
          enableDamping
          dampingFactor={0.08}
          rotateSpeed={0.6}
          zoomSpeed={0.8}
          minDistance={3}
          maxDistance={14}
          autoRotate={!hovered && !isInteractive}
          autoRotateSpeed={0.4}
        />
      </Canvas>

      {/* Search bar — pixel-bordered input pinned top-center. */}
      {isInteractive ? (
        <SearchBar
          value={search}
          onChange={setSearch}
          matchCount={matched ? matched.size : null}
          locale={locale}
        />
      ) : null}

      {/* Hover card overlay — DOM, outside the canvas. */}
      {isInteractive && hovered ? (
        <HoverCard
          p={hovered}
          pinned={pinned.has(hovered.slug)}
          isCanonical={CANONICAL_PHILOSOPHER_NAMES.has(hovered.name)}
          onTogglePin={() => togglePin(hovered.slug)}
          locale={locale}
        />
      ) : null}

      {/* Archetype legend — sidebar with toggles. Suppressed on the
          touch preview (chrome=false): it's ~434px tall and would
          spill off the reduced inline canvas. FULLSCREEN restores it. */}
      {isInteractive && chrome ? (
        <Legend
          enabled={enabled}
          onToggle={toggleArchetype}
          onOnly={setOnly}
          onAll={setAll}
          showAll={showAll}
          setShowAll={setShowAll}
          pinnedCount={pinned.size}
          onClearPins={() => setPinned(new Set())}
          locale={locale}
        />
      ) : null}

      {/* Caption with axis legend at the bottom. */}
      {isInteractive ? <AxesCaption locale={locale} /> : null}

      {/* Empty state — cloud is empty if user toggled everything off. */}
      {isInteractive && enabled.size === 0 ? <EmptyState onAll={setAll} locale={locale} /> : null}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Scene — everything inside the <Canvas>.
// ────────────────────────────────────────────────────────────────
function Scene({
  enabled,
  matched,
  showAll,
  pinned,
  userPos,
  onHover,
  isInteractive,
}: {
  enabled: Set<string>;
  matched: Set<string> | null;
  showAll: boolean;
  pinned: Set<string>;
  userPos: [number, number, number] | null;
  onHover: (p: Hovered) => void;
  isInteractive: boolean;
}) {
  return (
    <>
      <AxisGrid />
      <PhilosopherCloud
        enabled={enabled}
        matched={matched}
        showAll={showAll}
        pinned={pinned}
        onHover={onHover}
      />
      {userPos ? <UserPoint position={userPos} /> : null}
      {/* AxisLabels gets its OWN Suspense boundary. <Text> suspends on
          font load, and we never again want that to take the point
          cloud down with it (the bug that blanked the whole map). If
          the labels' font is slow or fails, only the labels wait — the
          cloud, grid and user point render regardless. */}
      {isInteractive ? (
        <Suspense fallback={null}>
          <AxisLabels />
        </Suspense>
      ) : null}
    </>
  );
}

// ────────────────────────────────────────────────────────────────
// PhilosopherCloud — the 560 philosopher spheres.
//
// Visibility logic:
//   - If `matched` is null, no search is active. Points show iff
//     their archetype is in `enabled`.
//   - If `matched` is non-null, search is active. Points NOT in
//     `matched` get dimmed + shrunk (still visible for context),
//     points in `matched` stay full-size + bright.
// ────────────────────────────────────────────────────────────────
function PhilosopherCloud({
  enabled,
  matched,
  showAll,
  pinned,
  onHover,
}: {
  enabled: Set<string>;
  matched: Set<string> | null;
  showAll: boolean;
  pinned: Set<string>;
  onHover: (p: Hovered) => void;
}) {
  const router = useRouter();

  return (
    <group>
      {PHILOSOPHER_POSITIONS_3D.map((p) => {
        const archetypeOn = enabled.has(p.archetypeKey);
        if (!archetypeOn) return null;

        // Visibility rules:
        //   - If showAll is true, show every philosopher whose
        //     archetype is enabled.
        //   - Otherwise show: canonical 60 + pinned + (when search
        //     is active) any matched slug.
        const isCanonical = CANONICAL_PHILOSOPHER_NAMES.has(p.name);
        const isPinned = pinned.has(p.slug);
        const isMatch = matched ? matched.has(p.slug) : false;
        if (!showAll && !isCanonical && !isPinned && !isMatch) return null;

        const inMatchSet = matched ? matched.has(p.slug) : true;
        const dimmed = matched && !inMatchSet;

        const color = ARCHETYPE_COLORS[p.archetypeKey] ?? DEFAULT_ARCHETYPE_COLOR;

        // Bigger + brighter than v1. When dimmed by an active
        // search filter, shrink + drop emissive so matched points
        // visually pop.
        const radius = dimmed ? 0.04 : 0.085;
        const emissiveIntensity = dimmed ? 0.15 : 1.1;
        const opacity = dimmed ? 0.25 : 1;

        return (
          <mesh
            key={p.slug}
            position={[p.x * SCENE_SCALE, p.y * SCENE_SCALE, p.z * SCENE_SCALE]}
            onPointerOver={(e) => {
              e.stopPropagation();
              onHover(p);
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
              onHover(null);
              document.body.style.cursor = '';
            }}
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/philosopher/${p.slug}`);
            }}
          >
            <sphereGeometry args={[radius, 14, 14]} />
            <meshStandardMaterial
              color={color.primary}
              emissive={color.primary}
              emissiveIntensity={emissiveIntensity}
              roughness={0.4}
              metalness={0.05}
              transparent={!!dimmed}
              opacity={opacity}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// ────────────────────────────────────────────────────────────────
// UserPoint — pulsing dark sphere with a soft amber halo. Stands
// out from the philosopher cloud so the "you are here" beat lands.
// ────────────────────────────────────────────────────────────────
function UserPoint({ position }: { position: [number, number, number] }) {
  const haloRef = useRef<THREE.Mesh>(null);
  const dotRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (haloRef.current) {
      const s = 1 + Math.sin(t * 1.6) * 0.18;
      haloRef.current.scale.set(s, s, s);
      const m = haloRef.current.material as THREE.MeshBasicMaterial;
      m.opacity = 0.18 + Math.sin(t * 1.6) * 0.08;
    }
    if (dotRef.current) {
      const s = 1 + Math.sin(t * 2.2) * 0.06;
      dotRef.current.scale.set(s, s, s);
    }
  });

  return (
    <group position={position}>
      <mesh ref={haloRef}>
        <sphereGeometry args={[0.32, 24, 24]} />
        <meshBasicMaterial color="#B8862F" transparent opacity={0.18} />
      </mesh>
      <mesh ref={dotRef}>
        <sphereGeometry args={[0.13, 16, 16]} />
        <meshStandardMaterial color="#221E18" emissive="#8C6520" emissiveIntensity={0.7} />
      </mesh>
    </group>
  );
}

// ────────────────────────────────────────────────────────────────
// AxisGrid — three faint planes (XY, XZ, YZ) sitting at origin,
// giving visual depth cues during orbit. Very subtle.
// ────────────────────────────────────────────────────────────────
function AxisGrid() {
  const size = SCENE_SCALE * 2.2;
  const divisions = 10;
  return (
    <group>
      {/* Floor (XZ plane) */}
      <gridHelper
        args={[size, divisions, '#3A3A3A', '#252525']}
        position={[0, -SCENE_SCALE * 1.05, 0]}
      />
      {/* Faint axis lines (X red, Y green, Z blue — but tinted to
          fit the dark amber-tinted scene rather than the standard
          neon palette) */}
      <axesHelper args={[SCENE_SCALE * 1.1]} />
    </group>
  );
}

// ────────────────────────────────────────────────────────────────
// AxisLabels — two-end labels per axis so the user can read what
// each direction means.
// ────────────────────────────────────────────────────────────────
function AxisLabels() {
  const D = SCENE_SCALE * 1.15;
  const props = {
    // Self-hosted font is LOAD-BEARING, not cosmetic. drei's <Text>
    // (troika-three-text) fetches glyph data to render, and with no
    // `font` set it pulls from troika's default CDN
    // (cdn.jsdelivr.net/gh/lojjic/unicode-font-resolver). Our CSP
    // `connect-src` only allows 'self' + Supabase, so that CDN fetch is
    // blocked — and because <Text> *suspends* until the font resolves,
    // a blocked fetch hangs the whole <Scene> Suspense and the entire
    // point cloud goes blank. Pointing at a same-origin TTF keeps the
    // fetch under 'self'. Must be a raw .ttf/.otf/.woff (troika can't
    // parse .woff2). Don't drop this back to the default font.
    font: '/fonts/Inter-Regular.ttf',
    fontSize: 0.18,
    color: '#9A8B6A',
    anchorX: 'center' as const,
    anchorY: 'middle' as const,
  };
  return (
    <group>
      {/* X axis: abstract ↔ embodied */}
      <Text {...props} position={[D, 0, 0]}>
        ABSTRACT
      </Text>
      <Text {...props} position={[-D, 0, 0]}>
        EMBODIED
      </Text>
      {/* Y axis: sovereign ↔ communal */}
      <Text {...props} position={[0, D, 0]}>
        SOVEREIGN
      </Text>
      <Text {...props} position={[0, -D, 0]}>
        COMMUNAL
      </Text>
      {/* Z axis: skeptical ↔ mystical */}
      <Text {...props} position={[0, 0, D]}>
        SKEPTICAL
      </Text>
      <Text {...props} position={[0, 0, -D]}>
        MYSTICAL
      </Text>
    </group>
  );
}

// ────────────────────────────────────────────────────────────────
// HoverCard — DOM overlay shown when a point is hovered. Pixel-
// chrome panel with a procedural pixel sprite of the philosopher,
// their name + dates + archetype tag + key idea.
//
// The sprite is generated on-the-fly from the philosopher's name
// (deterministic) — same name always produces the same sprite, so
// Plato is always Plato. Hover-triggered + sprite-pop-in animation
// makes every hover feel alive.
// ────────────────────────────────────────────────────────────────
function HoverCard({
  p,
  pinned,
  isCanonical,
  onTogglePin,
  locale,
}: {
  p: NonNullable<Hovered>;
  pinned: boolean;
  isCanonical: boolean;
  onTogglePin: () => void;
  locale: Locale;
}) {
  const color = ARCHETYPE_COLORS[p.archetypeKey] ?? DEFAULT_ARCHETYPE_COLOR;
  const archName = ARCHETYPES.find((a) => a.key === p.archetypeKey)?.key ?? p.archetypeKey;
  // zh shows the localized archetype name (e.g. "制图者"); en keeps the
  // "THE CARTOGRAPHER" pixel-tag style.
  const archLabel =
    locale === 'zh' ? t(`arch.${p.archetypeKey}.name`, 'zh') : `THE ${archName.toUpperCase()}`;
  return (
    <div key={p.slug} className="absolute right-4 top-20 z-10 w-[300px] sm:right-6 sm:top-24">
      <div
        className="pixel-panel sprite-pop-in pixel-panel--ink"
        style={{
          borderColor: color.deep,
          boxShadow: `4px 4px 0 0 ${color.deep}`,
        }}
      >
        {/* Title bar */}
        <div
          className="flex items-center justify-between border-b-4 px-3 py-2 text-[10px] tracking-[0.18em]"
          style={{
            borderColor: color.deep,
            backgroundColor: color.deep,
            color: color.soft,
            fontFamily: 'var(--font-pixel-display)',
          }}
        >
          <span>{archLabel}</span>
          <span className="text-[#FFD580]">▶ {t('cnst.hover', locale)}</span>
        </div>

        {/* Sprite + name row */}
        <div className="flex items-start gap-3 px-3 py-3">
          <div className="shrink-0">
            <PhilosopherSprite name={p.name} archetypeKey={p.archetypeKey} size={64} />
          </div>
          <div className="min-w-0">
            <div className="text-[18px] font-medium leading-tight text-acc-soft">{p.name}</div>
            {p.dates ? <div className="mt-0.5 text-[12px] text-acc">{p.dates}</div> : null}
          </div>
        </div>

        {/* Key idea — Cormorant inside the pixel panel for the
            "library book inside the game" beat. */}
        {p.keyIdea ? (
          <div className="border-t-2 px-3 py-3" style={{ borderColor: color.deep }}>
            <p
              className="text-[14px] leading-[1.45] text-acc-soft/90"
              style={{ fontFamily: 'var(--font-editorial)' }}
            >
              <em>&ldquo;{p.keyIdea}&rdquo;</em>
            </p>
          </div>
        ) : null}

        {/* Pin toggle — only relevant for non-canonical philosophers
            (canonical ones are always shown). Click to add them to
            the pinned set so they stay visible after search clears. */}
        {!isCanonical ? (
          <button
            type="button"
            onClick={onTogglePin}
            className="block w-full border-t-2 px-3 py-2 text-center text-[11px] tracking-[0.18em] hover:bg-ink/40"
            style={{
              borderColor: color.deep,
              color: color.soft,
              fontFamily: 'var(--font-pixel-display)',
            }}
          >
            {pinned ? t('cnst.pinned_unpin', locale) : t('cnst.pin_to_map', locale)}
          </button>
        ) : null}

        {/* Click prompt */}
        <div
          className="border-t-2 px-3 py-1.5 text-center text-[10px] tracking-[0.2em]"
          style={{
            borderColor: color.deep,
            color: color.soft,
            fontFamily: 'var(--font-pixel-display)',
          }}
        >
          ▶ {t('cnst.click_profile', locale)}
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// SearchBar — pixel-bordered input pinned at the top of the canvas.
// Query is passed up; parent computes which slugs match and renders
// matched points bright + dimmed points faint. Match count chip
// shows result count when a query is active.
// ────────────────────────────────────────────────────────────────
function SearchBar({
  value,
  onChange,
  matchCount,
  locale,
}: {
  value: string;
  onChange: (v: string) => void;
  matchCount: number | null;
  locale: Locale;
}) {
  return (
    <div className="absolute left-1/2 top-4 z-20 w-[88%] max-w-[360px] -translate-x-1/2 sm:w-auto">
      <div
        className="border-4 border-ink bg-[#FFFCF4]"
        style={{ boxShadow: '4px 4px 0 0 var(--color-acc)' }}
      >
        <div className="flex items-stretch">
          <span
            className="flex items-center border-r-2 border-ink bg-ink px-3 text-[12px] tracking-[0.16em] text-acc-soft"
            style={{ fontFamily: 'var(--font-pixel-display)' }}
          >
            {t('cnst.find', locale)} ▶
          </span>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={t('cnst.search_placeholder', locale, {
              count: PHILOSOPHER_POSITIONS_3D.length,
            })}
            className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-[18px] leading-none text-ink placeholder:text-acc-deep/60 focus:outline-none"
            style={{ fontFamily: 'var(--font-pixel-body)' }}
          />
          {value ? (
            <button
              type="button"
              onClick={() => onChange('')}
              className="border-l-2 border-ink bg-[#FFFCF4] px-2 text-[16px] text-acc-deep hover:bg-acc-soft"
              style={{ fontFamily: 'var(--font-pixel-display)' }}
              aria-label={t('cnst.clear_search', locale)}
            >
              ×
            </button>
          ) : null}
        </div>
        {matchCount !== null ? (
          <div
            className="border-t-2 border-ink bg-acc-soft px-3 py-1 text-[12px] tracking-[0.14em] text-acc-deep"
            style={{ fontFamily: 'var(--font-pixel-display)' }}
          >
            {matchCount === 0 ? (
              <span className="text-[#7A2E2E]">▶ {t('cnst.no_match', locale)}</span>
            ) : matchCount === 1 ? (
              <span>▶ {t('cnst.one_match', locale)}</span>
            ) : (
              <span>▶ {t('cnst.n_matches', locale, { count: matchCount })}</span>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Legend — sidebar with one row per archetype. Click the row to
// toggle visibility. Hover row to "solo" that archetype. "All"
// resets.
// ────────────────────────────────────────────────────────────────
function Legend({
  enabled,
  onToggle,
  onOnly,
  onAll,
  showAll,
  setShowAll,
  pinnedCount,
  onClearPins,
  locale,
}: {
  enabled: Set<string>;
  onToggle: (key: string) => void;
  onOnly: (key: string) => void;
  onAll: () => void;
  showAll: boolean;
  setShowAll: (v: boolean) => void;
  pinnedCount: number;
  onClearPins: () => void;
  locale: Locale;
}) {
  return (
    <div
      className="absolute bottom-4 left-4 z-10 max-w-[220px] border-4 border-[#3A3528] bg-[#0E1419]/95 p-3 backdrop-blur-md"
      style={{ boxShadow: '4px 4px 0 0 var(--color-ink)' }}
    >
      {/* Cloud size toggle — opt-in to all 560 */}
      <div className="flex items-center justify-between">
        <span
          className="text-[9px] uppercase tracking-[0.22em] text-[#9A8B6A]"
          style={{ fontFamily: 'var(--font-pixel-display)' }}
        >
          {t('cnst.the_cloud', locale)}
        </span>
      </div>
      <button
        type="button"
        onClick={() => setShowAll(!showAll)}
        className={
          'mt-1.5 flex w-full items-center justify-between px-2 py-1.5 text-left text-[12px] transition-colors ' +
          (showAll ? 'bg-acc text-[#1A1612]' : 'bg-[#1A2129] text-cream-2 hover:bg-[#28323F]')
        }
      >
        <span className="font-medium">
          {showAll
            ? t('cnst.showing_all', locale, { count: PHILOSOPHER_POSITIONS_3D.length })
            : t('cnst.essential_60', locale)}
        </span>
        <span className="text-[10px] opacity-70">
          ▶ {showAll ? t('cnst.hide', locale) : t('cnst.show_all', locale)}
        </span>
      </button>
      {pinnedCount > 0 ? (
        <button
          type="button"
          onClick={onClearPins}
          className="mt-1 flex w-full items-center justify-between px-2 py-1 text-[11px] text-acc hover:bg-[#1A2129]"
        >
          <span>★ {t('cnst.n_pinned', locale, { count: pinnedCount })}</span>
          <span className="text-[10px] opacity-70">{t('cnst.clear', locale)}</span>
        </button>
      ) : null}

      {/* Archetype filter */}
      <div className="mt-3 flex items-center justify-between border-t border-[#3A3528]/60 pt-2.5">
        <span
          className="text-[9px] uppercase tracking-[0.22em] text-[#9A8B6A]"
          style={{ fontFamily: 'var(--font-pixel-display)' }}
        >
          {t('cnst.archetypes', locale)}
        </span>
        <button
          type="button"
          onClick={onAll}
          className="-my-1.5 -mr-1.5 px-2 py-1.5 text-[10px] uppercase tracking-[0.16em] text-acc hover:text-cream-2"
          title={t('cnst.show_all_title', locale)}
        >
          {t('cnst.all', locale)}
        </button>
      </div>
      <ul className="mt-1.5 space-y-0.5">
        {ARCHETYPES.map((a) => {
          const color = ARCHETYPE_COLORS[a.key] ?? DEFAULT_ARCHETYPE_COLOR;
          const isOn = enabled.has(a.key);
          return (
            <li key={a.key}>
              <button
                type="button"
                onClick={() => onToggle(a.key)}
                onDoubleClick={() => onOnly(a.key)}
                title={t('cnst.toggle_solo_title', locale)}
                className="group flex w-full items-center gap-2 px-1.5 py-1 hover:bg-[#1A2129]"
              >
                <span
                  aria-hidden
                  className="inline-block h-2.5 w-2.5 shrink-0 transition-opacity"
                  style={{
                    backgroundColor: color.primary,
                    opacity: isOn ? 1 : 0.25,
                    boxShadow: isOn ? `0 0 6px ${color.primary}` : 'none',
                  }}
                />
                <span
                  className="text-[12px] capitalize transition-colors"
                  style={{
                    color: isOn ? 'var(--color-cream-2)' : '#5A5448',
                  }}
                >
                  {locale === 'zh' ? t(`arch.${a.key}.name`, 'zh') : a.key}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="mt-2 border-t border-[#3A3528]/40 pt-1.5 text-[10px] text-[#5A5448]">
        {t('cnst.toggle_hint', locale)}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// AxesCaption — sits at the bottom-right with a short legend of
// what each axis means. Compact, never blocks the cloud.
// ────────────────────────────────────────────────────────────────
function AxesCaption({ locale }: { locale: Locale }) {
  return (
    <div className="pointer-events-none absolute bottom-4 right-4 z-10 hidden max-w-[260px] rounded-xl border border-[#3A3528]/60 bg-[#0E1419]/85 p-3 text-[11px] leading-relaxed text-[#9A8B6A] backdrop-blur-md sm:block">
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-acc">
        {t('cnst.axes', locale)}
      </div>
      <ul className="mt-2 space-y-1">
        <li>
          <span className="text-line/80">X</span> · {t('cnst.axis_x', locale)}
        </li>
        <li>
          <span className="text-line/80">Y</span> · {t('cnst.axis_y', locale)}
        </li>
        <li>
          <span className="text-line/80">Z</span> · {t('cnst.axis_z', locale)}
        </li>
      </ul>
      <div className="mt-2 border-t border-[#3A3528]/40 pt-2 text-[10px] text-[#5A5448]">
        {t('cnst.drag_zoom', locale)}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// EmptyState — when the user has toggled every archetype off.
// ────────────────────────────────────────────────────────────────
function EmptyState({ onAll, locale }: { onAll: () => void; locale: Locale }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
      <div className="pointer-events-auto rounded-xl border border-[#3A3528] bg-[#0E1419]/95 p-6 text-center">
        <div
          className="font-display text-[20px] italic text-cream-2"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {t('cnst.map_empty', locale)}
        </div>
        <button
          type="button"
          onClick={onAll}
          className="mt-3 rounded-full bg-acc-deep px-4 py-1.5 text-[13px] text-cream hover:bg-acc"
        >
          {t('cnst.show_all_arch', locale)}
        </button>
      </div>
    </div>
  );
}
