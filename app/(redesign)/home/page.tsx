// New homepage at /home (sandboxed during Phase 3 migration).
//
// Composes the modernized landing experience: hero, daily wisdom,
// quiz CTAs, promise bullets, "how this works" details, archetype
// strip, footer. Strictly additive — production root `/` still
// serves public/mull.html via the rewrite in next.config.ts. This
// route ships at /home until the cutover (Phase 3g).
//
// Server component. Locale resolves once at request time and is
// passed down to children.

import type { Metadata, Viewport } from "next";
import { getServerLocale } from "@/lib/locale-server";
import Hero from "./hero";
import DailyWisdom from "./daily-wisdom";
import QuizCTA from "./quiz-cta";
import PromiseBullets from "./promise-bullets";
import HowWorks from "./howworks";
import ArchetypeStrip from "./archetype-strip";
import Footer from "./footer";

export const metadata: Metadata = {
  title: "Mull · Find your place on the map of how you think",
  description:
    "A philosophical-mapping tool. 16 dimensions, ten archetypes, 560 thinkers. Take the quiz, see where your worldview sits — and which thinkers across history have stood near you.",
  // The redesign sandbox shouldn't be indexed yet (production /
  // still serves mull.html); flip this to default during Phase 3g
  // cutover.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function HomePage() {
  const locale = await getServerLocale();

  return (
    <>
      <main className="mx-auto min-h-[100svh] max-w-[800px] bg-[var(--color-cream,#FAF6EC)] px-6 pb-24 pt-12 text-[var(--color-ink,#221E18)] sm:px-10 sm:pt-20">
        <Hero locale={locale} />
        <DailyWisdom />
        <QuizCTA locale={locale} />
        <PromiseBullets locale={locale} />
        <HowWorks />
        <ArchetypeStrip />
      </main>
      <Footer />
    </>
  );
}
