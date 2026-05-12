// Layout for the redesign sandbox. Scopes the Cormorant Garamond
// display font to /result-preview (and any future redesign POCs)
// without forcing the font onto every Next.js route during Phase 2.
//
// Why next/font/google: zero-runtime, self-hosted on the Vercel CDN,
// no FOIT, and Next handles the variable injection so we can use
// `var(--font-cormorant)` anywhere inside this layout subtree.
//
// When the redesign migrates to the production homepage, this font
// loader will move up to app/layout.tsx and the @theme block's
// `--font-display` token will point to `var(--font-cormorant)` so
// every surface inherits it.

import { Cormorant_Garamond } from "next/font/google";
import type { ReactNode } from "react";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  // Italic 400/500 are the workhorse weights for the archetype name
  // and the "what it gets right" pull. We don't need bold here — the
  // editorial voice avoids it.
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

export default function RedesignLayout({ children }: { children: ReactNode }) {
  // Adding the font variable on a wrapper div, not <html>, so the font
  // doesn't leak into surfaces that share the root layout above us.
  // Inline `--font-display` override picks up the loaded variable so
  // any component that does `style={{ fontFamily: 'var(--font-display)' }}`
  // automatically gets Cormorant inside this subtree.
  return (
    <div
      className={cormorant.variable}
      style={{ ["--font-display" as string]: "var(--font-cormorant), Georgia, serif" }}
    >
      {children}
    </div>
  );
}
