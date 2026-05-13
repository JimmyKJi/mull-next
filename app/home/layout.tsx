// Layout for the v2 redesign. Loads Cormorant Garamond via next/font
// and scopes the variable to this subtree so the rest of the app's
// type ladder is unaffected during the redesign rollout.
//
// When the redesign migrates to /, this loader will move up to
// app/layout.tsx and the @theme block's `--font-display` will point
// to var(--font-cormorant) globally.

import { Cormorant_Garamond } from "next/font/google";
import type { ReactNode } from "react";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

export default function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={cormorant.variable}
      style={{
        ["--font-display" as string]: "var(--font-cormorant), Georgia, serif",
      }}
    >
      {children}
    </div>
  );
}
