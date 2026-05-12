import type { Metadata, Viewport } from "next";
import { ResultPreviewWithSwitcher } from "./archetype-switcher";

// Sandboxed redesign preview — Phase 2 of the redesign-2026 work.
//
// This route exists so the team can evaluate the new aesthetic for the
// quiz result reveal without touching any production surface. The
// `(redesign)` route group keeps it grouped with future preview-only
// pages (constellation POC, debate POC, etc.) and won't ship in the
// final URL — pages inside () are not part of the URL path.
//
// Visit: /result-preview
//
// What this is NOT:
//   - The real result page. The real result still lives in mull.html.
//   - Wired to any quiz state. The archetype is selected via the
//     floating switcher, not derived from a user vector.
//   - Final visual design. The motion choreography and layout are
//     intentionally explorations to evaluate before committing to a
//     migration of the live surface.

// Don't index — this is a preview-only sandbox.
export const metadata: Metadata = {
  title: "Result preview · Mull redesign",
  robots: { index: false, follow: false, nocache: true },
};

// Override the viewport to allow content to bleed under any system UI;
// the reveal panel uses `min-h-[100svh]` and benefits from the full
// viewport on first paint.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function ResultPreviewPage() {
  return <ResultPreviewWithSwitcher />;
}
