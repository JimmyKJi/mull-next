"use client";

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

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import { useState, useRef, useMemo, Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import * as THREE from "three";
import { ARCHETYPES } from "@/lib/archetypes";
import {
  ARCHETYPE_COLORS,
  DEFAULT_ARCHETYPE_COLOR,
} from "@/lib/archetype-colors";
import {
  PHILOSOPHER_POSITIONS_3D,
  projectTo3D,
} from "@/lib/projection";
import { PhilosopherSprite } from "./philosopher-sprite";

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
  variant?: "interactive" | "ambient";
};

// Scale the [-1,1] projection into a roomier 3D space so points
// don't sit on top of each other. 4 units = a reasonable scene size
// for a camera at distance ~6.
const SCENE_SCALE = 4;

export function Constellation3D({
  userVector,
  height = 640,
  variant = "interactive",
}: Props) {
  const isInteractive = variant === "interactive";
  const [hovered, setHovered] = useState<Hovered>(null);

  // Search box: a non-empty query filters which philosophers appear
  // in the cloud, and the search result list (DOM, outside the
  // canvas) lets the user click to "fly to" any matching point.
  const [search, setSearch] = useState("");
  const trimmedQuery = search.trim().toLowerCase();
  const matched = useMemo(() => {
    if (!trimmedQuery) return null; // null = no filter (show all)
    return new Set(
      PHILOSOPHER_POSITIONS_3D.filter((p) =>
        p.name.toLowerCase().includes(trimmedQuery),
      ).map((p) => p.slug),
    );
  }, [trimmedQuery]);

  // All archetypes start enabled; toggle from the legend.
  const [enabled, setEnabled] = useState<Set<string>>(
    () => new Set(ARCHETYPES.map((a) => a.key)),
  );

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
    <div
      className="relative w-full overflow-hidden bg-[#1A1612]"
      style={{ height }}
    >
      <Canvas
        camera={{ position: [6, 5, 7], fov: 45 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
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
        <color attach="background" args={["#1A1612"]} />

        <Suspense fallback={null}>
          <Scene
            enabled={enabled}
            matched={matched}
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
        />
      ) : null}

      {/* Hover card overlay — DOM, outside the canvas. */}
      {isInteractive && hovered ? <HoverCard p={hovered} /> : null}

      {/* Archetype legend — sidebar with toggles. */}
      {isInteractive ? (
        <Legend
          enabled={enabled}
          onToggle={toggleArchetype}
          onOnly={setOnly}
          onAll={setAll}
        />
      ) : null}

      {/* Caption with axis legend at the bottom. */}
      {isInteractive ? <AxesCaption /> : null}

      {/* Empty state — cloud is empty if user toggled everything off. */}
      {isInteractive && enabled.size === 0 ? <EmptyState onAll={setAll} /> : null}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Scene — everything inside the <Canvas>.
// ────────────────────────────────────────────────────────────────
function Scene({
  enabled,
  matched,
  userPos,
  onHover,
  isInteractive,
}: {
  enabled: Set<string>;
  matched: Set<string> | null;
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
        onHover={onHover}
      />
      {userPos ? <UserPoint position={userPos} /> : null}
      {isInteractive ? <AxisLabels /> : null}
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
  onHover,
}: {
  enabled: Set<string>;
  matched: Set<string> | null;
  onHover: (p: Hovered) => void;
}) {
  const router = useRouter();

  return (
    <group>
      {PHILOSOPHER_POSITIONS_3D.map((p) => {
        const archetypeOn = enabled.has(p.archetypeKey);
        if (!archetypeOn) return null;

        const isMatch = matched ? matched.has(p.slug) : true;
        const dimmed = matched && !isMatch;

        const color =
          ARCHETYPE_COLORS[p.archetypeKey] ?? DEFAULT_ARCHETYPE_COLOR;

        // Bigger + brighter than v1. When dimmed by an active
        // search filter, shrink + drop emissive so matched points
        // visually pop.
        const radius = dimmed ? 0.04 : 0.085;
        const emissiveIntensity = dimmed ? 0.15 : 1.1;
        const opacity = dimmed ? 0.25 : 1;

        return (
          <mesh
            key={p.slug}
            position={[
              p.x * SCENE_SCALE,
              p.y * SCENE_SCALE,
              p.z * SCENE_SCALE,
            ]}
            onPointerOver={(e) => {
              e.stopPropagation();
              onHover(p);
              document.body.style.cursor = "pointer";
            }}
            onPointerOut={() => {
              onHover(null);
              document.body.style.cursor = "";
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
        <meshStandardMaterial
          color="#221E18"
          emissive="#8C6520"
          emissiveIntensity={0.7}
        />
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
        args={[size, divisions, "#3A3A3A", "#252525"]}
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
    fontSize: 0.18,
    color: "#9A8B6A",
    anchorX: "center" as const,
    anchorY: "middle" as const,
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
function HoverCard({ p }: { p: NonNullable<Hovered> }) {
  const color =
    ARCHETYPE_COLORS[p.archetypeKey] ?? DEFAULT_ARCHETYPE_COLOR;
  const archName =
    ARCHETYPES.find((a) => a.key === p.archetypeKey)?.key ?? p.archetypeKey;
  return (
    <div
      key={p.slug}
      className="pointer-events-none absolute right-4 top-20 z-10 w-[300px] sm:right-6 sm:top-24"
    >
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
            fontFamily: "var(--font-pixel-display)",
          }}
        >
          <span>THE {archName.toUpperCase()}</span>
          <span className="text-[#FFD580]">▶ HOVER</span>
        </div>

        {/* Sprite + name row */}
        <div className="flex items-start gap-3 px-3 py-3">
          <div className="shrink-0">
            <PhilosopherSprite
              name={p.name}
              archetypeKey={p.archetypeKey}
              size={64}
            />
          </div>
          <div className="min-w-0">
            <div
              className="text-[20px] leading-tight text-[#F8EDC8]"
              style={{ fontFamily: "var(--font-pixel-body)" }}
            >
              {p.name}
            </div>
            {p.dates ? (
              <div
                className="mt-0.5 text-[14px] text-[#B8862F]"
                style={{ fontFamily: "var(--font-pixel-body)" }}
              >
                {p.dates}
              </div>
            ) : null}
          </div>
        </div>

        {/* Key idea — Cormorant inside the pixel panel for the
            "library book inside the game" beat. */}
        {p.keyIdea ? (
          <div
            className="border-t-2 px-3 py-3"
            style={{ borderColor: color.deep }}
          >
            <p
              className="text-[15px] leading-[1.4] text-[#F8EDC8]/90"
              style={{ fontFamily: "var(--font-prose)" }}
            >
              <em>&ldquo;{p.keyIdea}&rdquo;</em>
            </p>
          </div>
        ) : null}

        {/* Click prompt */}
        <div
          className="border-t-2 px-3 py-1.5 text-center text-[10px] tracking-[0.2em]"
          style={{
            borderColor: color.deep,
            color: color.soft,
            fontFamily: "var(--font-pixel-display)",
          }}
        >
          ▶ CLICK FOR PROFILE
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
}: {
  value: string;
  onChange: (v: string) => void;
  matchCount: number | null;
}) {
  return (
    <div className="absolute left-1/2 top-4 z-20 w-[88%] max-w-[360px] -translate-x-1/2 sm:w-auto">
      <div
        className="border-4 border-[#221E18] bg-[#FFFCF4]"
        style={{ boxShadow: "4px 4px 0 0 #B8862F" }}
      >
        <div className="flex items-stretch">
          <span
            className="flex items-center border-r-2 border-[#221E18] bg-[#221E18] px-3 text-[12px] tracking-[0.16em] text-[#F8EDC8]"
            style={{ fontFamily: "var(--font-pixel-display)" }}
          >
            FIND ▶
          </span>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="search 560 thinkers…"
            className="min-w-0 flex-1 bg-transparent px-3 py-1.5 text-[18px] leading-none text-[#221E18] placeholder:text-[#8C6520]/60 focus:outline-none"
            style={{ fontFamily: "var(--font-pixel-body)" }}
          />
          {value ? (
            <button
              type="button"
              onClick={() => onChange("")}
              className="border-l-2 border-[#221E18] bg-[#FFFCF4] px-2 text-[16px] text-[#8C6520] hover:bg-[#F8EDC8]"
              style={{ fontFamily: "var(--font-pixel-display)" }}
              aria-label="Clear search"
            >
              ×
            </button>
          ) : null}
        </div>
        {matchCount !== null ? (
          <div
            className="border-t-2 border-[#221E18] bg-[#F8EDC8] px-3 py-1 text-[12px] tracking-[0.14em] text-[#8C6520]"
            style={{ fontFamily: "var(--font-pixel-display)" }}
          >
            {matchCount === 0 ? (
              <span className="text-[#7A2E2E]">▶ NO MATCH</span>
            ) : matchCount === 1 ? (
              <span>▶ 1 MATCH · CHECK PANEL</span>
            ) : (
              <span>▶ {matchCount} MATCHES</span>
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
}: {
  enabled: Set<string>;
  onToggle: (key: string) => void;
  onOnly: (key: string) => void;
  onAll: () => void;
}) {
  return (
    <div className="absolute bottom-4 left-4 z-10 max-w-[200px] rounded-xl border border-[#3A3528]/60 bg-[#0E1419]/90 p-3 shadow-[0_12px_40px_rgba(0,0,0,0.4)] backdrop-blur-md">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.22em] text-[#9A8B6A]">
          Archetypes
        </span>
        <button
          type="button"
          onClick={onAll}
          className="text-[10px] uppercase tracking-[0.16em] text-[#B8862F] hover:text-[#F1EAD8]"
          title="Show all"
        >
          All
        </button>
      </div>
      <ul className="mt-2.5 space-y-0.5">
        {ARCHETYPES.map((a) => {
          const color =
            ARCHETYPE_COLORS[a.key] ?? DEFAULT_ARCHETYPE_COLOR;
          const isOn = enabled.has(a.key);
          return (
            <li key={a.key}>
              <button
                type="button"
                onClick={() => onToggle(a.key)}
                onDoubleClick={() => onOnly(a.key)}
                title={`Click to toggle, double-click to solo`}
                className="group flex w-full items-center gap-2 rounded px-1.5 py-1 hover:bg-[#1A2129]"
              >
                <span
                  aria-hidden
                  className="inline-block h-2.5 w-2.5 shrink-0 rounded-full transition-opacity"
                  style={{
                    backgroundColor: color.primary,
                    opacity: isOn ? 1 : 0.25,
                    boxShadow: isOn
                      ? `0 0 6px ${color.primary}`
                      : "none",
                  }}
                />
                <span
                  className="font-display text-[14px] capitalize transition-colors"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: isOn ? "#F1EAD8" : "#5A5448",
                  }}
                >
                  {a.key}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="mt-2.5 border-t border-[#3A3528]/40 pt-2 text-[10px] text-[#5A5448]">
        Click toggle · double-click solo
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// AxesCaption — sits at the bottom-right with a short legend of
// what each axis means. Compact, never blocks the cloud.
// ────────────────────────────────────────────────────────────────
function AxesCaption() {
  return (
    <div className="pointer-events-none absolute bottom-4 right-4 z-10 max-w-[260px] rounded-xl border border-[#3A3528]/60 bg-[#0E1419]/85 p-3 text-[11px] leading-relaxed text-[#9A8B6A] backdrop-blur-md">
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#B8862F]">
        Axes
      </div>
      <ul className="mt-2 space-y-1">
        <li>
          <span className="text-[#D6CDB6]/80">X</span> · abstract ↔ embodied
        </li>
        <li>
          <span className="text-[#D6CDB6]/80">Y</span> · sovereign ↔ communal
        </li>
        <li>
          <span className="text-[#D6CDB6]/80">Z</span> · skeptical ↔ mystical
        </li>
      </ul>
      <div className="mt-2 border-t border-[#3A3528]/40 pt-2 text-[10px] text-[#5A5448]">
        Drag to rotate · scroll to zoom
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// EmptyState — when the user has toggled every archetype off.
// ────────────────────────────────────────────────────────────────
function EmptyState({ onAll }: { onAll: () => void }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
      <div className="pointer-events-auto rounded-xl border border-[#3A3528] bg-[#0E1419]/95 p-6 text-center">
        <div
          className="font-display text-[20px] italic text-[#F1EAD8]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          The map is empty.
        </div>
        <button
          type="button"
          onClick={onAll}
          className="mt-3 rounded-full bg-[#8C6520] px-4 py-1.5 text-[13px] text-[#FAF6EC] hover:bg-[#B8862F]"
        >
          Show all archetypes
        </button>
      </div>
    </div>
  );
}
