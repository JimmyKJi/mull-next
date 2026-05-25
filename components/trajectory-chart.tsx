// TrajectoryChart — a small SVG line chart showing one dimension's
// value over the user's trajectory (oldest event → newest).
//
// Auto-picks the dimension that moved most across the trajectory
// (largest range max-min). For a user with a strong Cartographer
// drift, this surfaces "Trust in Reason went from 4.2 to 7.8 over
// 12 entries" without the user having to ask.
//
// Server-component-safe. Renders nothing for trajectories with <3
// points (chart would be meaningless).
//
// Retention design intent (RETENTION-NOTES.md §2): makes the dilemma
// and diary VISIBLY consequential. "I've moved 0.4 toward Tragic
// Vision this week — what was that one about?" is the loop.

import { DIM_KEYS, DIM_NAMES, type DimKey } from "@/lib/dimensions";

type TrajectoryPoint = {
  timestamp: number;
  /** Absolute 16-D position after this event. */
  after: number[];
};

type Props = {
  /** Trajectory points, oldest first. */
  trajectory: TrajectoryPoint[];
  /** Optional accent (defaults to amber). */
  accent?: { primary: string; deep: string; soft: string };
};

const W = 600;
const H = 140;
const PAD = { top: 18, right: 12, bottom: 22, left: 36 };

export function TrajectoryChart({ trajectory, accent }: Props) {
  if (trajectory.length < 3) return null;

  // For each dimension, compute the range (max - min) across the
  // trajectory. Pick the dimension with the largest range — that's
  // the most "interesting" movement to show.
  let bestKey: DimKey = "TV";
  let bestRange = -Infinity;
  for (const k of DIM_KEYS) {
    const i = DIM_KEYS.indexOf(k);
    let min = Infinity;
    let max = -Infinity;
    for (const t of trajectory) {
      const v = t.after[i] ?? 0;
      if (v < min) min = v;
      if (v > max) max = v;
    }
    const range = max - min;
    if (range > bestRange) {
      bestRange = range;
      bestKey = k;
    }
  }

  // If the best range is tiny (<0.5), the chart wouldn't read as
  // movement — fall back to the dimension with the highest end value.
  let chosenKey = bestKey;
  if (bestRange < 0.5) {
    const lastPos = trajectory[trajectory.length - 1].after;
    let bestEnd = -Infinity;
    for (const k of DIM_KEYS) {
      const v = lastPos[DIM_KEYS.indexOf(k)] ?? 0;
      if (v > bestEnd) {
        bestEnd = v;
        chosenKey = k;
      }
    }
  }

  const dimIdx = DIM_KEYS.indexOf(chosenKey);
  const values = trajectory.map((t) => t.after[dimIdx] ?? 0);
  const startVal = values[0];
  const endVal = values[values.length - 1];
  const delta = +(endVal - startVal).toFixed(2);

  // Y axis range with a bit of padding.
  const minY = Math.floor(Math.min(...values) * 2) / 2 - 0.25;
  const maxY = Math.ceil(Math.max(...values) * 2) / 2 + 0.25;
  const ySpan = Math.max(0.5, maxY - minY);

  // X positions evenly spaced.
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const xAt = (i: number) =>
    PAD.left + (values.length === 1 ? innerW / 2 : (i * innerW) / (values.length - 1));
  const yAt = (v: number) => PAD.top + innerH - ((v - minY) / ySpan) * innerH;

  // Pre-compute the polyline points string.
  const polyline = values.map((v, i) => `${xAt(i)},${yAt(v)}`).join(" ");

  // Pre-compute the area fill underneath the polyline.
  const area =
    `${xAt(0)},${PAD.top + innerH} ` +
    polyline +
    ` ${xAt(values.length - 1)},${PAD.top + innerH}`;

  const a = accent ?? { primary: "#B8862F", deep: "#8C6520", soft: "#F8EDC8" };

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p
            className="text-[14px] leading-[1.55] text-[#4A4338]"
            style={{ fontFamily: "var(--font-editorial)" }}
          >
            <strong className="text-[#221E18]">{DIM_NAMES[chosenKey]}</strong>{" "}
            ({chosenKey}) — the dimension that moved most across your last{" "}
            {trajectory.length} entries.
          </p>
        </div>
        <div
          className="flex items-center gap-2 text-[10px] tracking-[0.18em] text-[#8C6520]"
          style={{ fontFamily: "var(--font-pixel-display)" }}
        >
          <span>{startVal.toFixed(1)}</span>
          <span>→</span>
          <span style={{ color: a.deep }}>{endVal.toFixed(1)}</span>
          <span
            style={{
              color: delta > 0 ? "#2F5D5C" : delta < 0 ? "#8C3717" : "#8C6520",
            }}
          >
            ({delta > 0 ? "+" : ""}
            {delta})
          </span>
        </div>
      </div>
      <div
        className="overflow-hidden border-2 border-[#221E18] bg-[#FFFCF4] p-2"
        style={{ boxShadow: "3px 3px 0 0 #B8862F" }}
      >
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          style={{ display: "block", maxWidth: "100%" }}
          aria-hidden
        >
          {/* Y-axis ticks (3 levels) */}
          {[minY, (minY + maxY) / 2, maxY].map((v, i) => (
            <g key={i}>
              <line
                x1={PAD.left}
                y1={yAt(v)}
                x2={W - PAD.right}
                y2={yAt(v)}
                stroke="#E2D8B6"
                strokeWidth={1}
                strokeDasharray={i === 1 ? "0" : "2 3"}
              />
              <text
                x={PAD.left - 6}
                y={yAt(v) + 3}
                textAnchor="end"
                fontSize={9}
                fill="#8C6520"
                fontFamily="var(--font-pixel-display), monospace"
              >
                {v.toFixed(1)}
              </text>
            </g>
          ))}
          {/* Area under the line */}
          <polygon points={area} fill={a.soft} opacity={0.55} />
          {/* The line itself */}
          <polyline
            points={polyline}
            fill="none"
            stroke={a.deep}
            strokeWidth={2}
            strokeLinejoin="miter"
          />
          {/* Data points */}
          {values.map((v, i) => (
            <rect
              key={i}
              x={xAt(i) - 3}
              y={yAt(v) - 3}
              width={6}
              height={6}
              fill={a.deep}
            />
          ))}
          {/* X-axis label — "OLDEST" left, "LATEST" right */}
          <text
            x={PAD.left}
            y={H - 6}
            fontSize={9}
            fill="#8C6520"
            fontFamily="var(--font-pixel-display), monospace"
          >
            OLDEST
          </text>
          <text
            x={W - PAD.right}
            y={H - 6}
            fontSize={9}
            fill="#8C6520"
            fontFamily="var(--font-pixel-display), monospace"
            textAnchor="end"
          >
            LATEST
          </text>
        </svg>
      </div>
    </div>
  );
}
