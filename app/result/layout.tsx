// Layout for the v2 result page. Same Cormorant Garamond loader as
// /home and /quiz so the display type is consistent across the
// redesign sandbox.

import { Cormorant_Garamond } from "next/font/google";
import type { ReactNode } from "react";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

export default function ResultLayout({ children }: { children: ReactNode }) {
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
