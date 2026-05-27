# Changelog

Notable changes to Mull, newest first. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) loosely — we only call out
things a future maintainer would actually want to find when grepping.

## 2026-05-27 — Arena view security + admin panel on /account

### Added
- **`components/account-admin-panel.tsx`** — admin-only at-a-glance
  section that renders at the top of `/account` for users in
  `ADMIN_USER_IDS`. Surfaces 6 cells (users total + 24h delta, quiz
  attempts last 24h, dilemma responses today, AI spend today + month
  with % of cap, errors in the last hour) plus deep-link buttons to
  `/admin` and `/admin/usage`. Pauses-banner shows if the kill
  switch fires. Renders the dashboard-links fallback if the inline
  queries fail so the section never 500s.
- **`supabase/migrations/20260527_arena_view_security.sql`** — fixes
  the three "Security Definer View" CRITICAL warnings from Supabase
  Database Advisor on `arena_leaderboard`, `arena_open_challenges`,
  and `arena_my_active_pvp`. The views previously inherited the
  Postgres default `SECURITY DEFINER` semantics (queries run as the
  view creator, bypassing RLS). The migration:
    1. adds narrow row-level read policies on `arena_user_ratings`
       and `arena_sessions` matching exactly what each view exposes
       (calibrated + active raters for leaderboard, pending PvP
       sessions for open challenges, opponent visibility on PvP
       sessions and turns)
    2. recreates each view `WITH (security_invoker = true)` so the
       underlying queries run as the calling user under RLS
  The views return identical data; the access path now goes through
  RLS, the advisor warnings clear, and the new RLS policies grant
  read only to the rows already publicly visible through the views
  (no new exposure).

  **Runbook note:** this migration must be applied to the remote DB
  before the SECURITY DEFINER warnings clear. Paste the SQL into
  Supabase Dashboard → SQL Editor → New Query → Run. (Or use the
  Supabase CLI: `supabase db push` once the project is linked.)
  After applying, re-run Database Advisor — the three CRITICAL
  warnings should clear.

## 2026-05-27 — Calibration audit + persona harness

### Added
- **`scripts/calibration-decisions.json`** — human-reviewed verdicts on
  the 30 most-isolated philosopher entries. Each: name + verdict
  (`accepted` / `review` / `nudge:<dim>:<delta>`) + reasoning. Loaded
  by `scripts/check-philosopher-calibration.mjs` and rendered as
  ✓/⚠/✦ badges in the regenerated report. 28 accepted (calibration
  features — the 16-D model groups by reasoning style, not content),
  2 deferred for Wave 3 vector work (Joseph Butler, Zeno of Elea).
- **`scripts/run-persona-tests.mjs`** — persona stress-test harness for
  the quiz scoring + archetype model. 19 personas: 10 canonical (one
  per archetype's clearest exemplar), 5 edge (sitting on documented
  classification boundaries), 4 paradox (intentionally hybrid — must
  produce low-margin tension signal). Exits non-zero on canonical or
  edge failure. First run: 19/19 pass including Conservative
  Anarchist (margin 0.0134, well under the 0.04 tension threshold).
  Output to `scripts/persona-test-report.md`.
- **Tradition-sovereignty decision: Option C confirmed.** The
  /methodology Open Questions paragraph documenting the high-RT +
  high-SS quadrant gap was already live before this session;
  re-verified that it reads cleanly, that the Conservative Anarchist
  persona test fires the expected low-margin signal, and that the
  next session has the work plan for Option A (add an 11th archetype)
  if launch feedback shows real demand. NEXT.md marked done.

### Changed
- **`scripts/check-philosopher-calibration.mjs`** — loads
  `calibration-decisions.json` and adds a Status column + "Decision
  notes" section to the rendered report so verdicts are visible
  without opening the JSON.

## 2026-05-27 — Tooling + voice pass

### Added
- **`.github/workflows/build.yml`** — CI runs `npm ci`, `npx tsc
  --noEmit`, `npm run build` on every push + PR. Vercel auto-deploys
  are NOT how we ship (production goes out via direct `vercel deploy
  --prod`), so the workflow exists as an independent gate against
  type errors and build-time failures.
- **`scripts/sync-mull-html-aliases.mjs`** — codegen script that
  injects philosopher `aliases` from `lib/philosophers.ts` into
  `public/mull.html`'s standalone PHILOSOPHERS array, then patches
  the homepage search filter to query them. 494 entries augmented.
  Re-run with `--apply` whenever either source drifts. Dry-run by
  default.
- **`scripts/voice-lint.mjs`** — linter for STYLE-GUIDE §9 voice
  rules across `lib/topics.ts`, `lib/exercises.ts`, and
  `lib/philosopher-bios.ts`. Errors on performative warmth, AI
  marketing-speak, untranslated Latin, therapy register. Warns on
  long sentences, em-dash flurries, semicolon flurries, apologetic
  phrasing, tired clichés. First run on the 90 long-form entries:
  0 errors, 22 warnings (all long-sentence borderlines).
- **`scripts/check-quiz-calibration.mjs`** — companion to
  `check-philosopher-calibration.mjs`. For each quiz question, checks
  whether the answer vectors cluster (cosine sim ≥ 0.90 — picking
  between them changes nothing), whether one answer dominates the
  vector budget (>1.8× the average magnitude), and whether the
  question spans <3 dimensions (under-probes). Output goes to
  `scripts/quiz-calibration-report.md`. First run: 1 cluster flagged
  in the quick quiz (Q13), 1 in the detailed (Q32) — both 70-question
  quizzes well within tolerance.

### Changed
- **Voice rewrites of 4 long-sentence offenders:** `topic/phenomenology`
  Husserl paragraph, `topic/philosophy-of-love` opener, `bio/augustine`
  empire-cracked sentence, `bio/hobbes` Leviathan setup, `bio/camus`
  Sisyphus three-responses chain. None bordered on incomprehensible
  before — these are tightening passes, not corrections.
- **`public/mull.html`** — 494 PHILOSOPHERS entries gained an
  `aliases:[...]` field. Search filter at line ~9228 now includes
  alias matching alongside name + keyIdea.

## 2026-05-27

### Added
- **`/install`** — guided iOS/Android/desktop add-to-home-screen flow.
  Auto-detects platform, hooks `beforeinstallprompt` for Chromium one-tap
  install, detects already-installed standalone state. Surfaced in home
  footer + Cmd-K palette + sitemap.
- **PWA manifest** at `/manifest.webmanifest` with `display: standalone`,
  three home-tile shortcuts (Daily Spar, Pilgrimage, Inheritor), and
  the existing icon set wired into Web App + apple-touch.
- **`<PathwayNext>`** quest-trail widget on every hook surface
  (`/topic/[slug]`, `/philosopher/[slug]`, `/archetype/[slug]`,
  `/vs/[a]/[b]`, `/exercises/[slug]`, `/dilemma`, `/map`). Adapts
  cold→warm based on a new `mull.archetype` localStorage key written
  by `/result` on quiz completion.
- **22 long-form philosopher bios** in `lib/philosopher-bios.ts`
  rendered on `/philosopher/[slug]` for the most-searched names
  (Plato, Aristotle, Nietzsche, Kant, Sartre, Marx, Confucius,
  Buddha, Hume, Descartes, Spinoza, Augustine, Aquinas, Wittgenstein,
  Heidegger, Laozi, Rousseau, Hobbes, Locke, Camus, Schopenhauer,
  Kierkegaard).
- **Reverse-index cross-links** on philosopher pages — topics they
  appear in + matchups featuring them. Sourced via
  `lib/philosopher-cross-links.ts`.
- **FAQ JSON-LD schema** on every `/philosopher/[slug]` for Google
  rich-result eligibility.
- **Featured-of-the-day cards** rotating by day-of-year on `/topic`,
  `/vs`, `/exercises`, `/philosopher` indexes.
- **Per-category browse** with quick-jump nav chips on `/topic`
  (5 categories) and `/vs` (5 categories).
- **20 new topic essays** (12 → 32), **28 new vs pairs** (30 → 58
  input, ~53 unique after canonicalisation), **20 new exercises**
  (16 → 36), **15 new Arena topics** (13 → 28).
- **`ContentLanguageNotice`** EN-only banner now on `/topic/[slug]`
  and `/vs/[a]/[b]` (other long-form pages already had it).
- **iOS safe-area padding** via `env(safe-area-inset-bottom)` on
  FeedbackButton, CapabilityToast, mobile Cmd-K button, and the
  open Feedback dialog. `.safe-bottom` / `.safe-bottom-fixed`
  utility classes in `globals.css`.
- **`viewport-fit: cover`** + **`theme-color: #FAF6EC`** in the
  Next.js Viewport export.
- **<360px title clamp** in `PixelPageHeader` — drops to 16px / 2px
  shadow so long titles like "PHILOSOPHER VS PHILOSOPHER" no longer
  wrap on iPhone SE / Android compact.
- **Mobile-cropped Inheritor chamber illustrations** via per-scene
  tighter `viewBox` + dropped corner ornaments at ≤640px.

### Changed
- **`curatedPairSlugs()`** in `lib/vs-pairs.ts` now filters out any
  pair where either name doesn't resolve in `PHILOSOPHERS`. Sitemap
  + `generateStaticParams` can no longer emit URLs that would 404.
- **Mobile Cmd-K floating button** moved from bottom-left to
  bottom-right to fix a collision with the mobile FeedbackButton
  (both occupying bottom-left after the prior mobile aesthetics pass).
- **Sitemap** now sources exercise slugs dynamically from `EXERCISES`
  instead of a hardcoded list, and `/install` is included.

### Fixed
- Dropped `['Avicenna', 'Averroes']`, `['Al-Ghazali', 'Avicenna']`,
  and `['Plato', 'Socrates']` from `CURATED_VS_PAIRS` — Avicenna,
  Averroes, and Socrates aren't in `PHILOSOPHERS` so those pages
  404'd. Add the philosophers first, then reinstate the pairs.
- Renamed `'Michel Foucault'` → `'Foucault'` in vs-pairs to match
  the corpus slug.
- **`ContentLanguageNotice` is now a client component.** All five
  long-form detail pages use `generateStaticParams`, so the build
  ships one cached HTML per slug that doesn't vary by cookie. The
  server-rendered notice was therefore stuck on the build-host
  locale (always 'en') for those pages. Reading `mull_locale` from
  `document.cookie` after hydration keeps SSG intact and still
  shows the banner for non-EN visitors.

## 2026-05-25 — Mobile aesthetics + VAT-corrected spend caps (`03128b0`)

Mobile sweep + lowered the default daily/monthly spend caps after
realising Anthropic adds 20% VAT to UK invoices (so $500 USD on the
console means £500/mo in cash). Defaults are now 1700¢/day, 50000¢/mo.

## 2026-05-24 — Rate limits + kill switch (`376df15`)

Server-side rate limits + global kill switch on every AI endpoint,
fail-closed if Supabase is unreachable. Budget guard for the £500/mo
ceiling.

## 2026-05-24 — Capability Atlas + retention spine (`31ee9de`)

Six-skill Atlas (Rigor, Depth, Consistency, Range, Self-Awareness,
Synthesis) with `+3 RIGOR` toasts on completion. Five retention
features (Daily Spar, Pilgrimage, Crucible, Wandering, Anthology,
Argument Diary) + four coming-soon scaffolds (Reading Hour, Letters
Between Inheritors, Mull Open, Long Letter).

## 2026-05-24 — Pilgrimage + Daily Spar (`fa6c927`)

The first two retention features built end-to-end. Activity heatmap
on `/atlas`, UX rewired to surface retention rhythms from the
homepage.

## Earlier

Pre-changelog commits — see `git log` for granular history. Major
prior milestones: the 16-D model, the 560-philosopher corpus
(Wave 1 hand-curated, Wave 2 generator-owned), the 10 archetypes,
the Arena (PvE + PvP), the original Inheritor → murder mystery
rework.

---

## Schema bumps to know about

These are the data-layer changes a downstream consumer (account
export parser, CSV import, etc.) needs to be aware of:

- **`mull.archetype`** (localStorage key, 2026-05-27) — new lightweight
  string key ("keel", "cartographer", …) written by `/result` on
  quiz completion, used by the PathwayNext widget for client-side
  personalisation. Separate from the heavier `mull.pending_quiz_attempt`
  JSON blob.
- **Account export** is still v3 (last bumped 2026-05-19 for the
  Capability Atlas trajectory rows). Adding new user-scoped tables
  bumps this — see `lib/user-scoped-tables.ts` invariants in
  `AGENTS.md`.
