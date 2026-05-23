// /quiz/journey — narrative version of the quiz. Alpha prototype.
//
// Lives alongside /quiz (the classic 20-question version). Same
// scoring math + same /result handoff — we're only changing the UX
// layer, not the model. Header always offers a "Skip to classic quiz"
// escape hatch.

import type { Metadata, Viewport } from "next";
import { JOURNEY_SCENES } from "@/lib/quiz-journey";
import { JourneyEngine } from "./journey-engine";

export const metadata: Metadata = {
  title: "The Vigil · Mull",
  description: "A narrative way through the Mull quiz. Find your place on the map by replaying moments of choice.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function JourneyPage() {
  return (
    <main className="min-h-[100svh] bg-[#FAF6EC] text-[#221E18]">
      <JourneyEngine scenes={JOURNEY_SCENES} />
    </main>
  );
}
