// /quiz/journey — narrative version of the quiz. Alpha prototype.
//
// Lives alongside /quiz (the classic 20-question version). Same
// scoring math + same /result handoff — we're only changing the UX
// layer, not the model. Header always offers a "Skip to classic quiz"
// escape hatch.
//
// i18n: the scenes + the ten reveal endings are localized server-side
// (getServerLocale → localizeScene / localizeReveals) and passed into
// the client engine as already-translated props, so a zh reader gets
// the whole murder mystery in Chinese without shipping both languages
// to the browser. Reading the locale cookie makes this route dynamic,
// which is fine — it's a noindex alpha and renders no faster static.

import type { Metadata, Viewport } from "next";
import { JOURNEY_SCENES, JOURNEY_REVEALS } from "@/lib/quiz-journey";
import { localizeScene, localizeReveals } from "@/lib/quiz-journey-i18n";
import { getServerLocale } from "@/lib/locale-server";
import { t } from "@/lib/translations";
import { JourneyEngine } from "./journey-engine";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return {
    title: t("journey.meta_title", locale),
    description: t("journey.meta_desc", locale),
    robots: { index: false, follow: false },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function JourneyPage() {
  const locale = await getServerLocale();
  const scenes = JOURNEY_SCENES.map((s) => localizeScene(s, locale));
  const reveals = localizeReveals(JOURNEY_REVEALS, locale);

  return (
    <main className="min-h-[100svh] bg-[#FAF6EC] text-[#221E18]">
      <JourneyEngine scenes={scenes} reveals={reveals} locale={locale} />
    </main>
  );
}
