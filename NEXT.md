# Mull · Next

Things flagged during the May 12 polish session that we decided to defer.
When you ask "what's next?", start here.

## Shipped 2026-05-27 (this session)

Cleaned out of the backlog because the work landed:

- ✅ **Big content fill** — topics 12 → 32, vs pairs 30 → 58, exercises
      16 → 36, arena topics 13 → 28, plus per-section index UIs
      (featured-of-the-day + categorisation + quick-jump nav) on
      `/topic`, `/vs`, `/exercises`, `/arena/pve`. Commit `6ca1db8`.
- ✅ **Philosopher SEO enrichment** — 22 long-form hand-written bios
      for the most-searched philosophers (Plato, Aristotle, Nietzsche,
      Kant, …), reverse-indexed topic + matchup cross-links, FAQ JSON-LD
      schema for snippet eligibility, featured-profile-of-the-day on
      `/philosopher` index. Closes the "Enrich philosopher detail pages"
      item below. Commit `2742235`.
- ✅ **UX pathway** — illustrated quest-trail widget on every hook
      surface (`/topic/[slug]`, `/philosopher/[slug]`, `/archetype/[slug]`,
      `/vs/[a]/[b]`, `/exercises/[slug]`, `/dilemma`, `/map`) with
      sprite + dashed connector + animated arrow. Cold visitors see
      Quiz → Discovery → Daily; warm visitors (archetype set in
      localStorage) see Pilgrimage → Spar → Diary. `/result` now
      writes `mull.archetype` so the next page personalises immediately.
      Commit `524a161`.
- ✅ **Mobile pass** — iOS safe-area padding on every fixed-bottom
      element via `env(safe-area-inset-bottom)`, narrow-viewport (<360px)
      title sizing in `PixelPageHeader`, PWA manifest + apple/theme
      meta + `viewport-fit: cover`, dedicated `/install` guide with
      iOS/Android/desktop step cards + native Android install prompt
      hook + standalone-detection. Tighter mobile crop on Inheritor
      chamber illustrations via per-scene viewBox + dropped corner
      ornaments at ≤640px. Also fixed a Cmd-K vs Feedback button
      collision (both were bottom-left → Cmd-K moved to bottom-right).
      Commit `7993ee5`.
- ✅ **EN-only content notice on long-form pages** — added to
      `/topic/[slug]` and `/vs/[a]/[b]`. The other long-form pages
      (`/archetype/[slug]`, `/philosopher/[slug]`, `/exercises/[slug]`,
      `/about`, `/methodology`) already had it. The first item in
      §Translations §Concrete remaining tasks is now done.

## Content calibration — flagged 2026-05-24 (Jimmy's explicit ask after UX/UI sweep)

The following content surfaces need a calibration pass — not new
features, just deliberate review of what's already there for
consistency, voice, philosophical accuracy, and tone. Listed in
descending priority per the discussion:

- [x] ~~**Quizzes — re-audit every question against the 16-D model.**~~
      Tooling shipped 2026-05-27: `scripts/check-quiz-calibration.mjs`
      programmatically flags clustered answers (cosine sim ≥ 0.90),
      dominant answers (one carrying >1.8× the avg magnitude), and
      narrow-span questions (touching <3 dimensions). Output goes to
      `scripts/quiz-calibration-report.md`. First run: 1 cluster
      flagged in the 20-question quick quiz (Q13 Justice, answers
      2 ↔ 5 at 0.912), 1 in the 50-question detailed (Q32, answers
      1 ↔ 4 at 0.926). Every dimension touched ≥8 times in quick
      and ≥21 in detailed — no under-probed axes. The phrasing-audit
      half (nudging language, contemporary scenarios) is still a
      human-eye job; spin off a focused review session if you want
      to do it.

- [ ] **SEO pages — `/topic/[slug]` (12) + `/vs/[a]/[b]` (30 curated).**
      Each one was written in one shot. Re-read each for:
      * Voice consistency (per STYLE-GUIDE.md §9)
      * Updated references — e.g. include current debates around the
        topic, recent thinkers
      * Internal-link audit — does every philosopher mentioned link
        through? Do the related-archetype tags resolve well?
      * H1 + meta-description punchiness (currently fine but could
        be sharper for click-through)

- [ ] **Exercises — currently 16, mostly hand-written.** Audit for:
      * Same voice as elsewhere on Mull (per STYLE-GUIDE.md §9)
      * Useful, not therapeutic-cliché
      * Difficulty progression — currently scattered
      * Are the right exercises tagged to the right archetypes?
      Consider trimming weakest 3-5 rather than expanding.

- [ ] **Translations — 8 locales for chrome only.**
      Long content (philosopher entries, archetype essays, topic
      explainers, vs pages, Arena topics, Inheritor scenes) all
      English-only. Either commit to translating the most-visited
      surfaces (probably the 10 archetype pages + ~30 most-popular
      philosophers + the 12 topics + the 5 highest-traffic vs
      pairs), or be explicit on those pages with a "EN only for now"
      banner. Pick a strategy.

- [ ] **Arena topics + philosopher voices — re-audit after first
      real usage data.** Currently 13 topics + 10 voices, hand-
      written in single sessions. Once we have ~50+ judged debates
      against each philosopher, look at:
      * Are some topics producing one-sided debates? (sign the
        topic favors one stance — bad)
      * Are some philosopher voices judged systematically more/less
        accessible? (sign their voice prompt needs tuning)
      * Are the kindred-philosopher tags landing accurately?

This whole block is content work, not engineering — most of it is
"sit with the existing text and rewrite carefully." Time-boxed
sessions (2-4 hours each) work better than trying to do all five in
one push.

## Calibration

- [x] ~~**Investigate the calibration surprises and propose vector nudges.**~~
      Done 2026-05-27. Reviewed all 30 entries on the "Most isolated"
      table. Verdicts captured in `scripts/calibration-decisions.json`
      and rendered as ✓ accepted / ⚠ review badges in the regenerated
      `scripts/calibration-report.md`. 28 entries accepted (calibration
      feature: the 16-D model groups by *reasoning style* not political
      content — Rand/Wollstonecraft 94% sim reflects shared assertive
      reason-trusting individualism, with CE 1 vs 6 encoding the
      political divergence correctly). 2 entries flagged for deferred
      review (Joseph Butler 98% to Sara Heinämaa — both have "moderate
      everything" vectors that need stronger signature dims; Zeno of
      Elea's Freud/Turing/Meillassoux trio — defensible but worth a
      cross-era second look). Neither blocks. Spin into a Wave 3 vector
      pass when there's time.

- [x] ~~**Build the persona-based stress-test harness.**~~ Shipped
      2026-05-27 as a single file `scripts/run-persona-tests.mjs`
      rather than the multi-file layout the synopsis described —
      simpler to maintain. 19 personas seeded (10 canonical, 5 edge,
      4 paradox). Output to `scripts/persona-test-report.md`. Exits
      non-zero on canonical or edge failure. First run: 19/19 pass
      including the Conservative Anarchist (tradition-sovereignty
      gap), which fires a margin of 0.0134 — well under the 0.04
      tension threshold, so the gap is being flagged correctly by
      the math even without a dedicated archetype. Add more personas
      over time by extending the CANONICAL/EDGE/PARADOX arrays.

- [ ] **Run the full skill-creator eval workflow on `calibration-check`.**
      Right now `skills/calibration-check/SKILL.md` is a description
      that hasn't been put through the test-prompts → subagent-runs →
      viewer-review iteration loop. Run that if you want quantitative
      confidence in the skill's triggering accuracy.

## Tradition + sovereignty archetype gap

- [x] ~~**Pick A / B / C**~~ Decided 2026-05-27: **Option C** (document
      the gap honestly, defer the archetype add until launch signal
      shows real demand). The methodology paragraph is already live at
      `/methodology` §07 Open Questions — last bullet in the NotItem
      list, lines 526-546 of `app/methodology/page.tsx`. If three or
      more launch-feedback messages flag the Burkean mis-classification,
      escalate to Option A using the work plan in
      `scripts/tradition-sovereignty-analysis.md` §"If you want Option A
      now". Until then, the close-call language on `/methodology`
      carries the load.

## UI and search parity

- [x] ~~**Add aliases support to public/mull.html.**~~ Done 2026-05-27.
      `scripts/sync-mull-html-aliases.mjs` reads aliases from
      `lib/philosophers.ts` and injects them inline into mull.html's
      PHILOSOPHERS entries; the homepage search filter was patched to
      include them. 494 entries updated. Re-run the script if either
      side drifts.

## Major features (from synopsis "Known gaps")

- [ ] **Stripe + Mull+ subscriptions.** Schema, billing page, webhook
      stub exist. Payment flow not wired.
- [ ] **Mo (personal AI coach).** Schema exists, no UI.
- [ ] **Forum upvote/downvote leaderboard.** TODO #38 in
      `app/search/leaderboard.tsx`.
- [x] ~~**Enrich philosopher detail pages.**~~ Done 2026-05-27 (commit
      `2742235`): 22 hand-written long-form bios + reverse-indexed
      topic + matchup cross-links + FAQ JSON-LD. The other ~540
      philosophers still fall back to the chrome-only layout; expanding
      bios beyond the top 22 is a slow content task — pick the next
      tranche by search-volume signal.
- [ ] **Enrich archetype detail pages.** The 10 archetype essays are
      already substantial (5+ paragraphs each, kindred thinkers,
      reading list, exercises, dimensional fingerprint, day-in-the-life).
      The new PathwayNext widget added a "what to do next" trail.
      Lower priority than other items.

## Translations

### Strategy decision (2026-05-24)

After auditing all translatable surfaces, the explicit call is:
**don't machine-translate philosophical content.** Bad translations
of philosophy are worse than honest English-only with a banner.
For the long-form essays (archetype detail, philosopher detail,
topic explainers, vs matchups, about, methodology, exercises) the
plan is:

1. **Keep chrome (nav, buttons, form labels) translated** — already
   done for all 8 locales.
2. **Add an explicit "EN only" banner** to the long-form pages
   for non-English visitors so expectations are clear. The
   `i18n.content_notice` translation key already exists (used on
   /account); next translations sub-pass surfaces it on the other
   long-form surfaces.
3. **Defer human translation until validated demand** — when a
   specific page sees significant traffic from a specific locale,
   commission a human philosophical translator for that page
   (~$50-200 per page). Don't translate the whole site at once.
4. **Optional future:** a "translation requested" button on each
   long-form page lets users vote for which surfaces to translate
   next. Solves the prioritization problem with real signal.

### Concrete remaining tasks

- [x] ~~**Surface `content_notice` banner on long-form pages.**~~
      Done 2026-05-27. All seven long-form pages now render the
      banner via `<ContentLanguageNotice locale={locale} />`. Renders
      nothing when locale === 'en', so no English-visitor noise.
- [ ] **Translate deep content.** Quiz beyond the 20-question quick
      version, the 50-question detailed quiz, archetype prose, the
      philosopher database keyIdeas, the About + Methodology pages —
      all English-only. The translation-in-progress banner already
      tells users; the work itself is on hold.
- [ ] **Translate the full dilemma pool.** First ~90 prompts are
      translated; indices > 90 fall back to English.

## House-keeping items

- [x] ~~**Build the `npm run build` step into CI**~~ Done 2026-05-27.
      `.github/workflows/build.yml` runs `npm ci` + `npx tsc --noEmit`
      + `npm run build` on every push and PR.
- [x] ~~**Add a CHANGELOG.md**~~ Done 2026-05-27. Schema bumps captured
      in the file's tail section.

---

When working through any of these, please update or remove the
corresponding line so this file stays accurate.
