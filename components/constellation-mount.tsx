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

import dynamic from "next/dynamic";
import { Constellation } from "./constellation";

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
  height?: number;
  variant?: "interactive" | "ambient";
};

export function ConstellationMount(props: Props) {
  return <Constellation3D {...props} />;
}
