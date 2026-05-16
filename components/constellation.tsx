// Constellation — the philosophical map. 560 philosophers projected
// from 16-D to 2-D, rendered as SVG points. Each point has a native
// <title> tooltip (free hover affordance, no client JS) and links to
// /philosopher/[slug].
//
// Optional user point overlay: when `userVector` is provided, a
// larger pulsing dot is rendered at the user's projected position,
// and nearby philosophers get a subtle highlight halo. This is the
// "here is where you sit" moment on the result page.
//
// Subtle drift: the whole point group is wrapped in a <g> with a
// slow CSS keyframe translate so the constellation doesn't feel
// frozen. Pure CSS, no JS cost. Respects prefers-reduced-motion
// via the @media rule in globals.css.

import Link from "next/link";
import {
  PHILOSOPHER_POSITIONS,
  projectTo2D,
} from "@/lib/projection";
import { ARCHETYPE_COLORS, DEFAULT_ARCHETYPE_COLOR } from "@/lib/archetype-colors";

type Props = {
  /** If provided, renders the "you are here" overlay at the user's
   *  projected position. Highlights philosophers within ~0.25 distance. */
  userVector?: number[];
  /** Visual variant. "decorative" softens the points to ambient
   *  background presence (used on /home); "interactive" makes points
   *  bigger + more clickable (used on /result). */
  variant?: "decorative" | "interactive";
  /** Whether points should be navigable links to /philosopher/[slug]. */
  clickable?: boolean;
  /** Width/height override — defaults to the SVG viewBox aspect (16:9). */
  className?: string;
};

// SVG canvas dimensions. The viewBox is the "design" coordinate
// system; CSS controls actual rendered size.
const W = 1000;
const H = 700;

// Map normalized (-1..1) → SVG pixel coordinates.
function toSvg(x: number, y: number): [number, number] {
  // Inset by 40px on each side so points don't hug the edges.
  const inset = 40;
  const px = inset + ((x + 1) / 2) * (W - inset * 2);
  // Flip Y: in math, +y is up; in SVG, +y is down.
  const py = inset + ((1 - y) / 2) * (H - inset * 2);
  return [px, py];
}

export function Constellation({
  userVector,
  variant = "decorative",
  clickable = true,
  className,
}: Props) {
  const isInteractive = variant === "interactive";

  // Resolve user position + neighborhood for the highlight ring.
  const userPos =
    userVector && userVector.length === 16
      ? toSvg(...projectTo2D(userVector))
      : null;

  const NEIGHBORHOOD_RADIUS = 130; // SVG units; "nearby" highlight zone

  return (
    <div className={"relative w-full " + (className ?? "")}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="A constellation of 560 philosophers, positioned by their philosophical orientation."
        className="block w-full"
        style={{ overflow: "visible" }}
      >
        {/* Quadrant axis labels — quiet, only on interactive variant */}
        {isInteractive ? <AxisLabels /> : null}

        {/* Drift group: subtle slow translate via CSS animation.
            CSS keyframes are defined locally below. */}
        <g className="mull-constellation-drift">
          {PHILOSOPHER_POSITIONS.map((p) => {
            const [px, py] = toSvg(p.x, p.y);
            const color =
              ARCHETYPE_COLORS[p.archetypeKey] ?? DEFAULT_ARCHETYPE_COLOR;

            // Highlight if the user's vector is within the
            // neighborhood radius.
            const dist = userPos
              ? Math.hypot(px - userPos[0], py - userPos[1])
              : Infinity;
            const near = dist < NEIGHBORHOOD_RADIUS;

            const r = isInteractive ? 4.5 : 3.5;
            const opacity = userPos
              ? near
                ? 1
                : 0.25
              : isInteractive
                ? 0.85
                : 0.55;

            const point = (
              <circle
                cx={px}
                cy={py}
                r={r}
                fill={color.primary}
                opacity={opacity}
                className={
                  clickable
                    ? "transition-all duration-200 hover:opacity-100"
                    : ""
                }
              >
                <title>
                  {p.name}
                  {p.dates ? ` · ${p.dates}` : ""}
                </title>
              </circle>
            );

            if (!clickable) return <g key={p.slug}>{point}</g>;

            return (
              <Link
                key={p.slug}
                href={`/philosopher/${p.slug}`}
                style={{ cursor: "pointer" }}
              >
                {point}
              </Link>
            );
          })}
        </g>

        {/* User point overlay — the "you are here" pulse */}
        {userPos ? (
          <g>
            {/* Halo */}
            <circle
              cx={userPos[0]}
              cy={userPos[1]}
              r={32}
              fill="#8C6520"
              opacity={0.12}
              className="mull-constellation-pulse"
            />
            {/* Inner ring */}
            <circle
              cx={userPos[0]}
              cy={userPos[1]}
              r={14}
              fill="none"
              stroke="#8C6520"
              strokeWidth={1.5}
              opacity={0.5}
            />
            {/* Center dot */}
            <circle
              cx={userPos[0]}
              cy={userPos[1]}
              r={6}
              fill="#221E18"
            >
              <title>You sit here.</title>
            </circle>
          </g>
        ) : null}
      </svg>

      {/* Local keyframes for drift + pulse. Scoped to the component
          via the class names. Respects prefers-reduced-motion. */}
      <style>{`
        @keyframes mull-constellation-drift {
          0%   { transform: translate(0, 0); }
          33%  { transform: translate(6px, -4px); }
          66%  { transform: translate(-4px, 5px); }
          100% { transform: translate(0, 0); }
        }
        .mull-constellation-drift {
          transform-origin: center;
          animation: mull-constellation-drift 18s ease-in-out infinite;
        }
        @keyframes mull-constellation-pulse {
          0%, 100% { opacity: 0.12; transform: scale(1); transform-origin: center; }
          50%      { opacity: 0.22; transform: scale(1.25); transform-origin: center; }
        }
        .mull-constellation-pulse {
          transform-box: fill-box;
          transform-origin: center;
          animation: mull-constellation-pulse 3s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .mull-constellation-drift,
          .mull-constellation-pulse {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}

// Quiet axis labels for the interactive variant. Edges only, deeply
// tinted so they don't compete with the points.
function AxisLabels() {
  const c = "#8C6520";
  const o = 0.45;
  const fz = 11;
  return (
    <g
      fontFamily="system-ui, sans-serif"
      fontSize={fz}
      fontWeight={500}
      letterSpacing="0.18em"
      style={{ textTransform: "uppercase" }}
      fill={c}
      opacity={o}
    >
      {/* X axis ends — sit ~24 from the edge so they don't crowd */}
      <text x={50} y={H / 2 - 8} textAnchor="start">EMBODIED</text>
      <text x={W - 50} y={H / 2 - 8} textAnchor="end">ABSTRACT</text>

      {/* Y axis ends */}
      <text x={W / 2} y={28} textAnchor="middle">SOVEREIGN SELF</text>
      <text x={W / 2} y={H - 16} textAnchor="middle">COMMUNAL</text>

      {/* Subtle center cross — pure decoration */}
      <line
        x1={W / 2}
        y1={42}
        x2={W / 2}
        y2={H - 30}
        stroke={c}
        strokeWidth={0.5}
        opacity={0.2}
        strokeDasharray="2 6"
      />
      <line
        x1={62}
        y1={H / 2}
        x2={W - 62}
        y2={H / 2}
        stroke={c}
        strokeWidth={0.5}
        opacity={0.2}
        strokeDasharray="2 6"
      />
    </g>
  );
}
