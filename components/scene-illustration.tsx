// SceneIllustration — flat-illustration SVG vignettes for the
// /quiz/journey "Inheritor" prototype.
//
// Honest scope: these are PLACEHOLDER illustrations meant to add
// visual rhythm + atmosphere without pretending to be the final art.
// Clean geometric shapes, restrained palette, no fake-pixel-art
// crudeness. If the prototype direction is approved, the production
// version would either be hand-illustrated by a real artist or
// upgraded to a much more detailed style.
//
// Visual approach: single iconic element per scene (envelope,
// photograph, brass button, etc.), drawn as a strong dark silhouette
// on a sepia-warm background, with one accent color (wax-red,
// candle-amber) for emphasis. Reads as a woodcut or a chapter
// vignette — dignified, period-appropriate, intentional.

import type { SceneArtKey } from '@/lib/quiz-journey';
import { type Locale } from '@/lib/translations';

// Shared palette — warm, restrained, "estate library" vibe.
const PAL = {
  ground: '#F0E5CB', // sepia background (warm, paper-like)
  groundShadow: '#D4C09A', // shadow tint
  ink: '#2A1F12', // dark line / silhouette
  inkSoft: '#5C4528', // mid-tone wood / mid-shadow
  wax: '#7A2E2E', // wax seal, blood red accent — rare
  flame: '#E8A33D', // candle flame, single warm accent
  flameSoft: '#C9842E',
  white: '#FFFDF5', // bright paper / candle halo
} as const;

type Props = {
  scene: SceneArtKey;
  /** Display width in CSS pixels. Height set by aspect ratio. */
  width?: number;
  /** Display locale — selects the alt-text language. Defaults 'en'. */
  locale?: Locale;
};

// Per-scene tighter viewBox for mobile (≤640px). The desktop SVG uses
// the full 200×100 frame with decorative corners; on mobile we drop
// the corners and crop to the subject so the illustration actually
// reads on a 360px-wide phone instead of floating in sepia margins.
// Format: "minX minY width height".
const MOBILE_VIEWBOX: Record<SceneArtKey, string> = {
  'envelope-seal': '55 25 90 55',
  'framed-photograph': '55 8 90 78',
  'stacked-letters': '55 25 90 50',
  'two-chairs': '30 25 140 55',
  'ticket-and-photo': '55 28 90 50',
  'candle-deathbed': '0 30 200 70',
};

export function SceneIllustration({ scene, width = 360, locale = 'en' }: Props) {
  const aspectRatio = 5 / 2.5; // 200×100 viewBox
  const height = Math.round(width / aspectRatio);
  const mobileVB = MOBILE_VIEWBOX[scene];
  const alt = (locale === 'zh' ? SCENE_ALT_ZH : SCENE_ALT)[scene];
  // Parse mobile viewBox to compute mobile aspect ratio + display
  // height. We render the mobile SVG at the same CSS max-width as
  // desktop so the layout doesn't shift; CSS hides the wrong one.
  const [, , mw, mh] = mobileVB.split(' ').map(Number);
  const mobileAspect = mw / mh;
  return (
    <div
      className="mull-scene-wrap"
      style={{ display: 'block', margin: '0 auto', maxWidth: '100%' }}
    >
      {/* Desktop / wide: original 200×100 frame with corner ornaments. */}
      <svg
        className="mull-scene-desktop"
        viewBox="0 0 200 100"
        width={width}
        height={height}
        style={{ display: 'block', margin: '0 auto', maxWidth: '100%' }}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={alt}
      >
        <SceneInner scene={scene} withCorners />
      </svg>
      {/* Mobile (≤640px): cropped to the subject, no corner ornaments.
          Aspect ratio adapts per scene so each one fills its frame. */}
      <svg
        className="mull-scene-mobile"
        viewBox={mobileVB}
        style={{
          display: 'none',
          margin: '0 auto',
          width: '100%',
          maxWidth: width,
          aspectRatio: `${mobileAspect}`,
        }}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={alt}
      >
        <SceneInner scene={scene} withCorners={false} />
      </svg>
      <style>{`
        @media (max-width: 640px) {
          .mull-scene-desktop { display: none !important; }
          .mull-scene-mobile { display: block !important; }
        }
      `}</style>
    </div>
  );
}

function SceneInner({ scene, withCorners }: { scene: SceneArtKey; withCorners: boolean }) {
  return (
    <>
      {/* Sepia ground — fills the full 200×100; the mobile viewBox
          windows in on a subset of it. */}
      <rect x={0} y={0} width={200} height={100} fill={PAL.ground} />
      {/* Subtle ground texture — two horizontal bands suggesting a
          shelf or floor line behind the subject */}
      <rect x={0} y={75} width={200} height={1} fill={PAL.groundShadow} />
      <rect x={0} y={76} width={200} height={24} fill={PAL.groundShadow} opacity={0.3} />
      {/* Scene content */}
      {SCENES[scene]()}
      {/* Decorative corner ornaments — desktop only. The mobile crop
          deliberately drops these so the subject fills the frame. */}
      {withCorners ? (
        <>
          <Corner x={2} y={2} />
          <Corner x={195} y={2} flipX />
          <Corner x={2} y={95} flipY />
          <Corner x={195} y={95} flipX flipY />
        </>
      ) : null}
    </>
  );
}

function Corner({
  x,
  y,
  flipX,
  flipY,
}: {
  x: number;
  y: number;
  flipX?: boolean;
  flipY?: boolean;
}) {
  const sx = flipX ? -1 : 1;
  const sy = flipY ? -1 : 1;
  return (
    <g transform={`translate(${x},${y}) scale(${sx},${sy})`}>
      <path d="M 0 0 L 5 0 L 5 1 L 1 1 L 1 5 L 0 5 Z" fill={PAL.ink} />
    </g>
  );
}

// ─── Per-scene illustrations ─────────────────────────────────────

const SCENES: Record<SceneArtKey, () => React.ReactNode> = {
  // I · The Invitation — an envelope, sealed in dark red wax.
  'envelope-seal': () => (
    <>
      {/* Envelope body */}
      <polygon
        points="60,30 140,30 140,70 60,70"
        fill={PAL.white}
        stroke={PAL.ink}
        strokeWidth={1.5}
      />
      {/* Envelope flap */}
      <polygon points="60,30 100,55 140,30" fill={PAL.ground} stroke={PAL.ink} strokeWidth={1.5} />
      {/* Wax seal — single red circle, slightly off-center */}
      <circle cx={100} cy={55} r={6} fill={PAL.wax} stroke={PAL.ink} strokeWidth={1} />
      {/* Tiny embossed marks on the seal */}
      <circle cx={100} cy={55} r={2.5} fill="none" stroke={PAL.ink} strokeWidth={0.6} />
      {/* Handwritten address line suggestion */}
      <line x1={75} y1={62} x2={92} y2={62} stroke={PAL.inkSoft} strokeWidth={0.6} />
      <line x1={75} y1={66} x2={88} y2={66} stroke={PAL.inkSoft} strokeWidth={0.6} />
    </>
  ),

  // II · The Foyer — a framed photograph on a panelled wall, single
  // candle below.
  'framed-photograph': () => (
    <>
      {/* Wall panel suggestion */}
      <rect
        x={20}
        y={10}
        width={160}
        height={75}
        fill="none"
        stroke={PAL.inkSoft}
        strokeWidth={0.6}
      />
      {/* Frame — heavier outer, lighter inner */}
      <rect
        x={75}
        y={20}
        width={50}
        height={45}
        fill={PAL.flameSoft}
        stroke={PAL.ink}
        strokeWidth={1.5}
      />
      <rect x={78} y={23} width={44} height={39} fill={PAL.white} />
      {/* Photograph content: simple silhouette of a hand reaching up */}
      <path
        d="M 95 60 L 95 45 Q 95 40 100 40 Q 105 40 105 45 L 105 55 L 110 55 L 110 60 Z"
        fill={PAL.ink}
      />
      <circle cx={100} cy={37} r={3} fill={PAL.ink} />
      {/* Candle below frame — single warm light */}
      <rect x={97} y={70} width={6} height={10} fill={PAL.flameSoft} />
      <ellipse cx={100} cy={68} rx={2} ry={3} fill={PAL.flame} />
      {/* Halo glow */}
      <circle cx={100} cy={68} r={10} fill={PAL.flame} opacity={0.12} />
    </>
  ),

  // III · The Writing Room — a wooden box, lid open, holding a thick
  // stack of letters in visibly different handwritings (showing the
  // child's thirty years). One letter is on top of the box, smaller
  // and earlier-looking — a child's hand. A folded letter rests beside.
  'stacked-letters': () => (
    <>
      {/* Desk */}
      <rect x={20} y={66} width={160} height={4} fill={PAL.inkSoft} />
      <rect x={20} y={66} width={160} height={20} fill={PAL.inkSoft} opacity={0.4} />
      {/* Window suggestion top-left */}
      <rect
        x={15}
        y={5}
        width={30}
        height={28}
        fill="none"
        stroke={PAL.inkSoft}
        strokeWidth={0.6}
      />
      <line x1={30} y1={5} x2={30} y2={33} stroke={PAL.inkSoft} strokeWidth={0.6} />
      <line x1={15} y1={19} x2={45} y2={19} stroke={PAL.inkSoft} strokeWidth={0.6} />
      {/* Wooden box, lid open behind */}
      <rect
        x={75}
        y={40}
        width={60}
        height={26}
        fill={PAL.inkSoft}
        stroke={PAL.ink}
        strokeWidth={1.2}
      />
      {/* Box lid (tilted up behind box) */}
      <polygon
        points="75,40 78,28 132,28 135,40"
        fill={PAL.inkSoft}
        stroke={PAL.ink}
        strokeWidth={1.2}
        opacity={0.85}
      />
      {/* Letters stacked inside box — different sizes to suggest different ages of writer */}
      <rect
        x={80}
        y={43}
        width={26}
        height={4}
        fill={PAL.white}
        stroke={PAL.ink}
        strokeWidth={0.4}
      />
      <rect
        x={82}
        y={47}
        width={28}
        height={4}
        fill={PAL.ground}
        stroke={PAL.ink}
        strokeWidth={0.4}
      />
      <rect
        x={79}
        y={51}
        width={30}
        height={4}
        fill={PAL.white}
        stroke={PAL.ink}
        strokeWidth={0.4}
      />
      <rect
        x={83}
        y={55}
        width={26}
        height={4}
        fill={PAL.ground}
        stroke={PAL.ink}
        strokeWidth={0.4}
      />
      <rect
        x={81}
        y={59}
        width={28}
        height={4}
        fill={PAL.white}
        stroke={PAL.ink}
        strokeWidth={0.4}
      />
      {/* Tiny handwriting lines on top letters — short and child-like vs longer + adult */}
      <line x1={84} y1={45} x2={88} y2={45} stroke={PAL.ink} strokeWidth={0.4} />
      <line x1={89} y1={45} x2={94} y2={45} stroke={PAL.ink} strokeWidth={0.4} />
      <line x1={86} y1={49} x2={104} y2={49} stroke={PAL.inkSoft} strokeWidth={0.3} />
      <line x1={83} y1={53} x2={106} y2={53} stroke={PAL.inkSoft} strokeWidth={0.3} />
      {/* A small folded letter on the desk beside the box — child's handwriting */}
      <rect
        x={140}
        y={56}
        width={22}
        height={10}
        fill={PAL.white}
        stroke={PAL.ink}
        strokeWidth={0.6}
      />
      <line x1={143} y1={59} x2={147} y2={59} stroke={PAL.ink} strokeWidth={0.6} />
      <line x1={148} y1={59} x2={154} y2={59} stroke={PAL.ink} strokeWidth={0.6} />
      <line x1={143} y1={62} x2={158} y2={62} stroke={PAL.ink} strokeWidth={0.6} />
      {/* Small inkwell on desk-right */}
      <rect x={155} y={48} width={6} height={7} fill={PAL.ink} />
      <ellipse cx={158} cy={48} rx={3} ry={0.8} fill={PAL.wax} opacity={0.7} />
    </>
  ),

  // IV · The Correspondence — two chairs facing across a low table.
  'two-chairs': () => (
    <>
      {/* Chair left — silhouette in profile */}
      <g transform="translate(40, 30)">
        {/* High back */}
        <rect x={0} y={0} width={4} height={40} fill={PAL.ink} />
        {/* Seat */}
        <rect x={0} y={28} width={28} height={4} fill={PAL.ink} />
        {/* Front leg */}
        <rect x={24} y={32} width={4} height={20} fill={PAL.ink} />
        {/* Back leg */}
        <rect x={0} y={32} width={4} height={20} fill={PAL.ink} />
      </g>
      {/* Chair right — mirrored */}
      <g transform="translate(160, 30) scale(-1, 1)">
        <rect x={0} y={0} width={4} height={40} fill={PAL.ink} />
        <rect x={0} y={28} width={28} height={4} fill={PAL.ink} />
        <rect x={24} y={32} width={4} height={20} fill={PAL.ink} />
        <rect x={0} y={32} width={4} height={20} fill={PAL.ink} />
      </g>
      {/* Low table between */}
      <rect x={84} y={55} width={32} height={3} fill={PAL.inkSoft} />
      <rect x={86} y={58} width={3} height={14} fill={PAL.inkSoft} />
      <rect x={111} y={58} width={3} height={14} fill={PAL.inkSoft} />
      {/* Two stacks of letters on table */}
      <rect
        x={90}
        y={50}
        width={10}
        height={5}
        fill={PAL.white}
        stroke={PAL.ink}
        strokeWidth={0.5}
      />
      <rect
        x={100}
        y={50}
        width={10}
        height={5}
        fill={PAL.white}
        stroke={PAL.ink}
        strokeWidth={0.5}
      />
      {/* String tying letters — single curved line */}
      <line x1={95} y1={48} x2={95} y2={56} stroke={PAL.wax} strokeWidth={0.5} />
      <line x1={105} y1={48} x2={105} y2={56} stroke={PAL.wax} strokeWidth={0.5} />
    </>
  ),

  // V · The Box on the Table — a wooden box, lid open, holding a
  // ticket and a small photograph of a coastal house. The life that
  // was not chosen.
  'ticket-and-photo': () => (
    <>
      {/* Table */}
      <rect x={40} y={70} width={120} height={3} fill={PAL.inkSoft} />
      <rect x={48} y={73} width={3} height={14} fill={PAL.inkSoft} />
      <rect x={149} y={73} width={3} height={14} fill={PAL.inkSoft} />
      {/* Wooden box — lid open behind */}
      <rect
        x={70}
        y={50}
        width={60}
        height={20}
        fill={PAL.inkSoft}
        stroke={PAL.ink}
        strokeWidth={1.2}
      />
      {/* Open lid behind */}
      <polygon
        points="70,50 73,30 127,30 130,50"
        fill={PAL.inkSoft}
        stroke={PAL.ink}
        strokeWidth={1.2}
        opacity={0.85}
      />
      {/* Wood grain on lid */}
      <line x1={75} y1={40} x2={125} y2={40} stroke={PAL.ink} strokeWidth={0.3} opacity={0.5} />
      {/* Inside box: a ticket (slim rectangle, slightly stylised) */}
      <rect
        x={75}
        y={55}
        width={26}
        height={10}
        fill={PAL.white}
        stroke={PAL.ink}
        strokeWidth={0.8}
      />
      {/* Ticket detail — a circle stamp + line */}
      <circle cx={94} cy={60} r={2} fill="none" stroke={PAL.wax} strokeWidth={0.6} />
      <line x1={78} y1={58} x2={88} y2={58} stroke={PAL.inkSoft} strokeWidth={0.4} />
      <line x1={78} y1={62} x2={88} y2={62} stroke={PAL.inkSoft} strokeWidth={0.4} />
      {/* Tiny "STEAMSHIP" hint */}
      <rect x={77} y={56} width={1} height={1} fill={PAL.ink} />
      {/* Beside the ticket: a small photograph — sepia frame around a
          simple coastline shape (sky, sea, small house silhouette) */}
      <g transform="translate(105, 53)">
        <rect
          x={0}
          y={0}
          width={20}
          height={15}
          fill={PAL.white}
          stroke={PAL.ink}
          strokeWidth={0.6}
        />
        {/* Sky */}
        <rect x={1} y={1} width={18} height={5} fill={PAL.flameSoft} opacity={0.5} />
        {/* Sea */}
        <rect x={1} y={6} width={18} height={5} fill={PAL.inkSoft} opacity={0.6} />
        {/* House silhouette */}
        <polygon points="8,5 8,9 12,9 12,5 10,3" fill={PAL.ink} />
        {/* Coastline */}
        <rect x={1} y={11} width={18} height={3} fill={PAL.flameSoft} opacity={0.7} />
      </g>
      {/* Soft shadow under box */}
      <ellipse cx={100} cy={71} rx={30} ry={1.5} fill={PAL.ink} opacity={0.3} />
    </>
  ),

  // VI · The Last Chamber — a single candle and the foot of a bed
  // in shadow.
  'candle-deathbed': () => (
    <>
      {/* Most of the frame is dark — almost-black with sepia tint */}
      <rect x={0} y={0} width={200} height={100} fill={PAL.ink} />
      {/* Candle on the right — primary light source */}
      <g transform="translate(150, 35)">
        {/* Candle body */}
        <rect x={-3} y={10} width={6} height={28} fill={PAL.flameSoft} />
        {/* Flame */}
        <ellipse cx={0} cy={6} rx={3} ry={5} fill={PAL.flame} />
        <ellipse cx={0} cy={4} rx={1.5} ry={3} fill={PAL.white} />
        {/* Halo */}
        <circle cx={0} cy={6} r={20} fill={PAL.flame} opacity={0.18} />
        <circle cx={0} cy={6} r={35} fill={PAL.flame} opacity={0.08} />
      </g>
      {/* Bed on the left — only the foot visible, silhouetted */}
      <g transform="translate(20, 60)">
        {/* Bedframe */}
        <rect x={0} y={0} width={80} height={4} fill={PAL.inkSoft} />
        {/* Footboard */}
        <rect x={0} y={-15} width={4} height={19} fill={PAL.inkSoft} />
        <rect x={0} y={-18} width={4} height={3} fill={PAL.flameSoft} />
        {/* Blanket suggestion */}
        <rect x={4} y={4} width={76} height={6} fill={PAL.inkSoft} opacity={0.7} />
        {/* Shape suggesting a person under the blanket — single rise */}
        <path
          d="M 4 4 Q 40 -2 80 4"
          fill="none"
          stroke={PAL.flameSoft}
          strokeWidth={0.6}
          opacity={0.6}
        />
      </g>
      {/* Faint floor line */}
      <line
        x1={0}
        y1={88}
        x2={200}
        y2={88}
        stroke={PAL.flameSoft}
        strokeWidth={0.3}
        opacity={0.4}
      />
    </>
  ),
};

const SCENE_ALT: Record<SceneArtKey, string> = {
  'envelope-seal': 'An envelope sealed with dark red wax, handwritten address visible.',
  'framed-photograph': 'A framed photograph hanging on a panelled wall, a single candle below.',
  'stacked-letters':
    "A wooden box opened on a writing desk, holding letters in several different handwritings stacked inside; a small folded child's letter beside the box and an inkwell on the desk.",
  'two-chairs':
    'Two chairs facing each other across a low table holding two stacks of bound letters.',
  'ticket-and-photo':
    'A wooden box opened on a table, holding an unused steamship ticket and a small sepia photograph of a coastal house.',
  'candle-deathbed': 'A single candle illuminating the foot of a bed in deep shadow.',
};

// zh alt text — kept inline (parallel to SCENE_ALT) rather than in
// translations.ts since it's a small fixed map local to this component.
const SCENE_ALT_ZH: Record<SceneArtKey, string> = {
  'envelope-seal': '一封以暗红色火漆封缄的信，手写的地址清晰可见。',
  'framed-photograph': '一幅带框的照片挂在镶板墙上，下方点着一支蜡烛。',
  'stacked-letters':
    '书桌上打开的木盒里，叠放着几种不同笔迹的信件；盒边放着一封折好的孩子写的小信，桌上还有一只墨水瓶。',
  'two-chairs': '两把椅子隔着一张矮桌相对而坐，桌上放着两叠捆好的信。',
  'ticket-and-photo': '桌上打开的木盒里，放着一张未使用的轮船船票，和一张海边小屋的褐色旧照片。',
  'candle-deathbed': '一支蜡烛照亮了深深阴影中的床尾。',
};
