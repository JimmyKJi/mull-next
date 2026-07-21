// DimensionRadar — "the shape of your mind" as a 16-axis radar. One
// spoke per dimension, the filled polygon is the user's signature.
// Server component, archetype-themed, responsive (viewBox + width
// 100%, so it scales cleanly from a phone rail to a desktop card).
// Axis labels are the 2-letter dimension codes to stay legible when
// small; the Today home pairs this with a plain-words "strongest…"
// caption so laymen get the takeaway without decoding the graph.

import { DIM_KEYS } from '@/lib/dimensions';

type Accent = { primary: string; deep: string; soft: string };

const N = 16;
const SIZE = 300;
const C = SIZE / 2;
const R = 86;

function ptAt(i: number, value: number, radius = R): [number, number] {
  const ang = (-90 + i * (360 / N)) * (Math.PI / 180);
  const r = (value / 10) * radius;
  return [C + r * Math.cos(ang), C + r * Math.sin(ang)];
}
function labelAt(i: number): [number, number] {
  const ang = (-90 + i * (360 / N)) * (Math.PI / 180);
  const r = R + 16;
  return [C + r * Math.cos(ang), C + r * Math.sin(ang)];
}

export function DimensionRadar({ vector, accent }: { vector: number[]; accent: Accent }) {
  if (!Array.isArray(vector) || vector.length !== 16) return null;

  const rings = [2.5, 5, 7.5, 10];
  const valuePoly = vector.map((v, i) => ptAt(i, v).join(',')).join(' ');

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      width="100%"
      style={{ display: 'block', maxWidth: 340, margin: '0 auto' }}
      role="img"
      aria-label="Your 16-dimension fingerprint"
    >
      {/* Concentric grid rings */}
      {rings.map((rv) => (
        <polygon
          key={rv}
          points={DIM_KEYS.map((_, i) => ptAt(i, rv).join(',')).join(' ')}
          fill="none"
          stroke="#E2D8B6"
          strokeWidth={1}
        />
      ))}
      {/* Spokes */}
      {DIM_KEYS.map((_, i) => {
        const [x, y] = ptAt(i, 10);
        return <line key={i} x1={C} y1={C} x2={x} y2={y} stroke="#EFE7D0" strokeWidth={1} />;
      })}
      {/* The signature */}
      <polygon
        points={valuePoly}
        fill={accent.primary}
        fillOpacity={0.35}
        stroke={accent.deep}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      {/* Vertices */}
      {vector.map((v, i) => {
        const [x, y] = ptAt(i, v);
        return <rect key={i} x={x - 2.5} y={y - 2.5} width={5} height={5} fill={accent.deep} />;
      })}
      {/* Axis labels (2-letter codes) */}
      {DIM_KEYS.map((k, i) => {
        const [x, y] = labelAt(i);
        return (
          <text
            key={k}
            x={x}
            y={y}
            fontSize={9}
            fill="#8C6520"
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily="var(--font-pixel-display), monospace"
          >
            {k}
          </text>
        );
      })}
    </svg>
  );
}
