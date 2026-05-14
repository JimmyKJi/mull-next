// HeroSprites — the right-side decorative graphics on /home.
//
// Three layered elements:
//   1. A pixel "MAP PREVIEW" panel showing all 560 philosopher
//      positions as tiny colored pixels — a literal snapshot of
//      what the constellation section looks like.
//   2. Three floating archetype-mascot sprites (the existing
//      lib/figures.ts SVGs, rendered with image-rendering: pixelated
//      so they read as game characters) hovering at staggered
//      heights with offset float animations.
//   3. A small "MASCOT.SYS" caption card.
//
// All server-renderable (no client JS), pure SVG and CSS animations.

import { ARCHETYPES } from "@/lib/archetypes";
import { ARCHETYPE_COLORS } from "@/lib/archetype-colors";
import { FIGURES } from "@/lib/figures";
import { PHILOSOPHER_POSITIONS } from "@/lib/projection";

// Pick three archetype figures to "feature" on the right side.
// Hand-chosen to be visually varied (not three blue figures stacked).
const FEATURED = ["cartographer", "hammer", "garden"] as const;

export function HeroSprites() {
  return (
    <div className="relative h-[440px] w-full lg:h-[480px]">
      {/* Pixel map preview — a tiny rendition of the constellation,
          560 philosopher dots projected to a 200×140 pixel canvas. */}
      <div className="absolute right-0 top-0 w-full">
        <div className="pixel-panel pixel-panel--ink mx-auto w-full max-w-[340px]">
          <div
            className="flex items-center justify-between border-b-4 border-[#221E18] bg-[#221E18] px-3 py-1.5"
            style={{ fontFamily: "var(--font-pixel-display)" }}
          >
            <span className="text-[9px] tracking-[0.18em] text-[#F8EDC8]">
              ▶ MAP_PREVIEW
            </span>
            <span className="text-[9px] tracking-[0.16em] text-[#B8862F]">
              {PHILOSOPHER_POSITIONS.length} pts
            </span>
          </div>
          <MapPreview />
        </div>
      </div>

      {/* Floating archetype sprites — three of them, staggered in
          position + animation timing. The pixel-float keyframes give
          each a chunky bob; image-rendering: pixelated keeps the SVG
          edges crisp at 88×88. */}
      {FEATURED.map((key, i) => {
        const color = ARCHETYPE_COLORS[key];
        const fig = FIGURES[key] ?? "";
        const arch = ARCHETYPES.find((a) => a.key === key);
        // Position each sprite differently — manual placement reads
        // more deliberate than auto-layout for decorative chrome.
        const positions: React.CSSProperties[] = [
          { left: "0%", top: "200px" },
          { left: "32%", top: "260px" },
          { left: "64%", top: "210px" },
        ];
        const floatDelays = ["0s", "-0.8s", "-1.4s"];
        return (
          <div
            key={key}
            className="absolute"
            style={positions[i]}
            aria-hidden
          >
            {/* Per-sprite chunky drop shadow */}
            <div
              className="relative h-[100px] w-[100px]"
              style={{
                animation: `pixel-float 2.4s steps(4, end) infinite`,
                animationDelay: floatDelays[i],
              }}
            >
              <div
                className="absolute inset-0"
                style={{
                  background: `radial-gradient(circle at 50% 50%, ${color.soft} 0%, ${color.soft} 55%, transparent 75%)`,
                }}
              />
              <div
                className="pixel-crisp absolute inset-1"
                dangerouslySetInnerHTML={{ __html: fig }}
              />
              {/* Tiny pixel name label below */}
              <div
                className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap border-2 border-[#221E18] bg-[#FFFCF4] px-1.5 py-0.5 text-[9px] tracking-[0.12em] text-[#221E18]"
                style={{
                  top: "100%",
                  marginTop: 4,
                  fontFamily: "var(--font-pixel-display)",
                  boxShadow: `2px 2px 0 0 ${color.deep}`,
                }}
              >
                {arch?.key.toUpperCase()}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// MapPreview — 200x140 SVG canvas. Projects all 560 philosopher
// positions to pixel coordinates and renders each as a tiny colored
// rect. Server-renderable, ~12KB of inline SVG (acceptable hero cost).
function MapPreview() {
  const W = 320;
  const H = 200;
  const inset = 12;

  return (
    <div className="bg-[#0E1419] p-2">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        xmlns="http://www.w3.org/2000/svg"
        shapeRendering="crispEdges"
        style={{ display: "block", imageRendering: "pixelated" }}
        className="w-full"
      >
        {/* Faint gridlines to suggest the X/Y axes */}
        <line x1={W / 2} y1={inset} x2={W / 2} y2={H - inset} stroke="#3A3528" strokeWidth={1} strokeDasharray="2 4" />
        <line x1={inset} y1={H / 2} x2={W - inset} y2={H / 2} stroke="#3A3528" strokeWidth={1} strokeDasharray="2 4" />

        {/* Each philosopher = one 2x2 pixel rect, archetype-colored.
            Coords map [-1,1] × [-1,1] → SVG pixel space. */}
        {PHILOSOPHER_POSITIONS.map((p) => {
          const color =
            ARCHETYPE_COLORS[p.archetypeKey]?.primary ?? "#B8862F";
          const px = inset + ((p.x + 1) / 2) * (W - inset * 2);
          const py = inset + ((1 - p.y) / 2) * (H - inset * 2);
          return (
            <rect
              key={p.slug}
              x={Math.round(px)}
              y={Math.round(py)}
              width={2}
              height={2}
              fill={color}
            />
          );
        })}
      </svg>
      {/* Small labels at the four corners — what the axes mean */}
      <div
        className="mt-1 flex justify-between text-[8px] tracking-[0.16em] text-[#8C6520]"
        style={{ fontFamily: "var(--font-pixel-display)" }}
      >
        <span>EMBODIED</span>
        <span>ABSTRACT</span>
      </div>
    </div>
  );
}
