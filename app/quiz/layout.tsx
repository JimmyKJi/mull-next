// Layout for the v2 quiz. Same Cormorant Garamond loader as /home so
// the display type is consistent across the redesign sandbox.
//
// When the redesign migrates to /, this loader (and /home's) move up
// to app/layout.tsx so every route inherits the font variable.

import { Cormorant_Garamond } from "next/font/google";
import type { ReactNode } from "react";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

export default function QuizLayout({ children }: { children: ReactNode }) {
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
