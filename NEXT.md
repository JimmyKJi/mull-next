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

- [ ] **Quizzes — re-audit every question against the 16-D model.**
      Highest priority. Both the 20-question quick quiz and the
      50-question detailed fingerprint. For each question:
      * Are the choice vectors balanced? (no answer should be
        philosophically "free" / dominate)
      * Are the choices distinct enough that the 16-D vector
        separates them meaningfully?
      * Does the phrasing nudge the user toward any one answer?
      * Are there better contemporary scenarios available?
      Tooling: `scripts/calibration-report.md` already exists; we
      should extend it to flag questions whose answer-vector deltas
      cluster suspiciously.

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

- [ ] **Investigate the calibration surprises and propose vector nudges.**
      From `scripts/calibration-report.md`: Ayn Rand sits near Mary
      Wollstonecraft (94% cosine sim) and Descartes near Christine
      Korsgaard (97%). Both pairings share surface signals
      (individualism / Kantian-style reason) but not deep stance.
      Worth a closer look at the full "Most isolated entries" table
      and proposing specific dim adjustments. Outcome: either confirm
      they're acceptable or list specific `tr:` / per-entry override
      changes to `scripts/gen-philosophers.mjs` ENTRIES followed by a
      `--apply` run.

- [ ] **Build the persona-based stress-test harness.** The synopsis
      describes `outputs/calibrate.mjs`, `personas.mjs`,
      `edge-personas.mjs`, `paradox-personas.mjs`, `run-*.mjs` — these
      files don't exist in the repo. Building them would let us verify
      Wave 2 against canonical / edge / paradox personas (the way Wave
      1 was verified). Roughly a few hundred lines of test
      infrastructure plus the personas themselves.

- [ ] **Run the full skill-creator eval workflow on `calibration-check`.**
      Right now `skills/calibration-check/SKILL.md` is a description
      that hasn't been put through the test-prompts → subagent-runs →
      viewer-review iteration loop. Run that if you want quantitative
      confidence in the skill's triggering accuracy.

## Tradition + sovereignty archetype gap

- [ ] **Pick A / B / C** (see `scripts/tradition-sovereignty-analysis.md`
      and chat history for the elaboration). If you pick A (new
      archetype), the work plan is in section "If you want Option A
      now" of that doc — ~1–2 days of focused work.

## UI and search parity

- [ ] **Add aliases support to public/mull.html.** Right now
      `lib/philosophers.ts` has aliases but mull.html's PHILOSOPHERS
      table doesn't — client-side search on the static homepage is
      name-only. Either add an `aliases:` field to mull.html entries
      and update its search code, or refactor the static page to fetch
      from a JSON endpoint shared with the Next routes.

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

- [ ] **Build the `npm run build` step into CI** so deploy-time failures
      surface before they hit Vercel.
- [ ] **Add a CHANGELOG.md** with the account-export schema bump
      (`v2` → `v3`) noted, so anyone parsing exports knows what
      changed and when.

---

When working through any of these, please update or remove the
corresponding line so this file stays accurate.
