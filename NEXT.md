# Mull · Next

Things flagged during the May 12 polish session that we decided to defer.
When you ask "what's next?", start here.

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
- [ ] **Enrich philosopher detail pages.** Currently one-line
      `keyIdea` + vector + nearest kin. Could add longer biography +
      "why this matters today."
- [ ] **Enrich archetype detail pages.** Same shape as above.

## Translations

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
