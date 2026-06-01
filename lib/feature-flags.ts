// Central product feature toggles — flip a flag here instead of
// hunting the codebase for every surface that needs to appear/disappear.

/**
 * Tipping / "Support Mull" (Ko-fi) surfaces.
 *
 * TEMPORARILY DISABLED (2026-06) — a legal constraint around accepting
 * tips/donations is awaiting a solution. While this is `false`, every
 * tip-jar surface hides itself:
 *   - <SupportMullPrompt>  (quiz-journey reveal + both Arena match screens)
 *   - the "Support Mull" link in the homepage footer
 *   - the two "tip on Ko-fi" boxes on /about
 *
 * To bring it all back once the legal question is resolved: set this to
 * `true`. Nothing else needs to change — every surface returns exactly
 * as it was, because each one reads this single flag.
 */
export const TIPPING_ENABLED: boolean = false;
