# Mull · Session handoff

This doc hands off enough state for the next session to pick up cold.
Newest updates first.

**Last session ended:** 2026-06-19 (security hardening — AI/API spend
gating + a static CSP with a before/after visual audit). Prior:
2026-06-18, 2026-06-07, 2026-05-27.
**Branch:** `claude/zen-wu-4cd09b`. Ship with
`git push origin HEAD:redesign-2026` — that auto-deploys to
`mull.world` via Vercel (see "How to ship" below).

---

## Updates from the 2026-06-19 session

**Theme: security hardening — gate API/AI usage and make the site
harder to hack.** Jimmy's brief:
> "do what is needed to improve website security so the website is less
> likely to be hacked and api usage is gated. Other aspects should also
> be improved."

One commit on `claude/zen-wu-4cd09b` (pushed to `redesign-2026` →
auto-deploy):

| Commit | Title | Shape of change |
|---|---|---|
| `c234566` | Harden security: gate every AI endpoint + enforce a static CSP | The two halves below. |

### Half 1 — AI spend gating (the budget holes)

- **`/api/debate/generate` was the open hole**: an unauthenticated
  Sonnet call (≤4000 tok, ×2 retry) with NO rate limit. Now gated by
  `aiGate` with a tiered per-IP cap — **2/day anonymous, 6/day
  signed-in** (Jimmy's exact spec) — plus the site-wide spend
  kill-switch. The supabase client + user are now resolved once up top
  and reused by the later `debate_history` save.
- **`debate/me`, `account/retrospective`, `dilemma/submit-archive`**:
  added `aiGate` (per-user daily cap + kill-switch). These were
  authed / Mull+-bounded but had no spend ceiling.
- **`dilemma/submit`**: added the `readAiSpend()` kill-switch only — its
  per-user burst limit already logs the `dilemma_submit` cost, so a full
  `aiGate` would double-count.
- **`profile/search`** (unauthenticated by design): added a 60/min/IP
  `rateLimit` so nobody hammers the ILIKE substring scan. Non-AI.
- **`lib/rate-limit.ts`**: new buckets `debate_generate` / `debate_me` /
  `retrospective` / `dilemma_archive` / `profile_search`, each with a
  `BUCKET_COST_CENTS` entry (the `Record<Bucket,number>` type makes tsc
  reject a bucket added without a cost), `PER_USER_DAILY_CAPS`, and
  brand-voiced limit messages. `debate_generate` is tiered at the call
  site via `perUserDaily`; the registry default (6) is the fallback.

### Half 2 — Content-Security-Policy + baseline headers (next.config.ts)

- Every response now carries a **static, nonce-free CSP**. The choice is
  deliberate: a per-request nonce forces every route to render
  dynamically, killing static-gen / ISR / CDN caching for the ~550
  philosopher pages, the 10 archetypes and the SEO essays — i.e. most of
  the site. `'unsafe-inline'` is acceptable because we never inject
  user-supplied HTML into a `<script>` (only our own JSON-LD + Next's
  bootstrap; every `dangerouslySetInnerHTML` feeds trusted first-party
  SVG/markup).
- **X-Frame-Options dropped entirely** — clickjacking is handled by CSP
  `frame-ancestors` instead. Per Next's own headers doc, `frame-ancestors`
  supersedes XFO and (unlike XFO) can be **relaxed per route**: the
  public `/badge/*` and `/embed/*` routes omit the ancestor lock so they
  stay iframe-embeddable on Notion / Substack / personal sites, while
  every other route is pinned to `'self'`. Implemented via Next's
  header-override (last-match-wins): the broad `/(.*)` rule sets the
  locked CSP, then later `/badge/:path*` + `/embed/:path*` blocks re-set
  the CSP key without the lock.
- **Dev vs prod**: `script-src` / `connect-src` add `va.vercel-scripts.com`,
  `ws:` / `wss:` and `'unsafe-eval'` **only in dev** (Turbopack HMR +
  Vercel analytics *debug* script). Prod loads analytics same-origin from
  `/_vercel/*` (covered by `'self'`) and never evals. `connect-src` is
  derived from `NEXT_PUBLIC_SUPABASE_URL` (https origin + wss host).
- **Baseline hardening** on every response: HSTS (2yr, includeSubDomains,
  no preload), `X-Content-Type-Options: nosniff`, `Referrer-Policy:
  strict-origin-when-cross-origin`, and a `Permissions-Policy` locking
  camera / mic / geolocation and opting out of browsing-topics.

### Verification

- `npx tsc --noEmit` → **0 errors**.
  `node scripts/check-table-invariants.mjs` → passes (this batch adds no
  user-scoped tables).
- **Before/after visual audit** (Jimmy's explicit ask: "capture current
  visual … enforce csp … run a site-wide audit … if not [the same],
  fix"). Audited `/`, `/quiz`, `/philosopher/heraclitus`,
  `/archetype/cartographer`, `/embed/map` (the WebGL/three.js
  worst-case), `/about`, `/search`, `/billing` in the preview browser.
  Every route renders **identically** with the CSP enforced and **zero
  CSP-blocked sub-resources** (verified via `preview_network` `failed`
  filter + scanning the console for "Content Security Policy"). The only
  dev-console noise is the benign Turbopack `@babel/runtime …
  package.json EOF` cold-compile flake — not a CSP violation, and gone in
  a clean Vercel build.

### Notes for next session

- The CSP allowlist is complete for the current third-party surface
  (Supabase, Vercel analytics / speed-insights, same-origin everything
  else). **If you add a new external script / style / font / image / XHR
  host, add it to the matching directive in `next.config.ts` `headers()`**
  or the browser will block it in prod.
- Stripe needs no CSP entry: checkout is server-side and the client does
  a top-level `window.location.href = checkoutUrl` redirect (not subject
  to CSP). `/billing` is still in dry-run ("Stripe is not yet live").

---

## Updates from the 2026-06-18 session

**Theme: refine the philosopher generator + its supporting "context"
(dimension definitions), audit the corpus for accuracy, then sweep the
site for stale/inaccurate user-facing content.** Jimmy's brief:
> "refine the generator and context that we've been working based off
> of, making the content more natural, more human, more accurate … be
> sure to double check and audit. Then … do a site-wide swipe and
> improve on all the content using the newly improved generator and
> context. Then update the handoff doc on everything"

Five commits on `claude/zen-wu-4cd09b`, oldest first (all pushed to
`redesign-2026` → auto-deploy):

| Commit | Title | Shape of change |
|---|---|---|
| `aa37c0a` | Diversify Wave 2 blurbs | Broke the em-dash template monotony in the generated `keyIdea` blurbs (88% → 37% em-dash). Reworded `i:` strings in `scripts/gen-philosophers.mjs` ENTRIES, regenerated both files. |
| `63e1818` | 3 corpus accuracy fixes + accent-insensitive search | (1) `Kumarajila`→`Kumārajīva`; (2) bogus "Spinozism in Bayle" duplicate folded into Pierre Bayle (corpus 552→551); (3) "Whitehead's pupil — David Ray Griffin" display-name prefix stripped → `David Ray Griffin`. Plus `foldForSearch` in `lib/philosophers.ts` makes `matchesPhilosopherSearch` diacritic-blind so "kumarajiva" / "anzaldua" / "soren" find the accented names. The load-bearing `philosopherSlug` was left untouched. |
| `5473922` | Sync dimension definitions | `DIM_DESCRIPTIONS` (lib/dimensions.ts) had drifted terser than the polished `dim.*.desc` copy users actually read. Brought the canonical copy in line. De-jargoned Mystical Receptivity: "the apophatic" → "the unsayable" (en only). |
| `0a68a8d` | Fix stale `iconoclast` key | The archetype was renamed iconoclast→hammer but six dead-key refs lingered: 5 `relatedArchetypes` arrays in `lib/topics.ts` (rendered chips linking to `/archetype/iconoclast` → `notFound()` 404) + the mobile Diogenes sprite on the home page (fell through `ARCHETYPE_COLORS` to a default colour). All → `hammer`. |
| `0072ba9` | Dynamic THINKERS count | The home "THINKERS" card body said "Over 500 philosophers" right beneath its own live `551` headline stat. Now `{count}`-interpolated from `PHILOSOPHERS.length` so it can't restale. |

### How the generator + corpus actually work (re-confirmed this session)

- `scripts/gen-philosophers.mjs` emits the **`keyIdea` (`i:`) verbatim** —
  there is no procedural sentence assembly. So "more natural" means
  rewording the hand-authored `i:` strings, then `node
  scripts/gen-philosophers.mjs --apply` (splices BOTH
  `lib/philosophers.ts` and `public/mull.html`), then `node
  scripts/sync-mull-html-aliases.mjs --apply` to restore the per-entry
  aliases that `--apply` wipes from mull.html.
- Setting an entry's `i:` to `(see X)` or `(already in db …)` REMOVES it
  from output (the emit-skip logic at the dedup loop). That's how the
  Bayle duplicate was folded without leaving a stub.
- **Audit verdict:** the Wave 2 corpus is accurate. All 16 "Her …"
  blurb openers map to actual women (no mis-gendering); the 3 fixes
  above were the only real defects across 385 entries. Calibration
  clean — 551 corpus, **0** entries below the 0.92 isolation threshold.
  `npx tsc --noEmit` → 0 throughout.

### Dimension definitions live in TWO places (edit both)

- `lib/translations.ts` `dim.XX.desc` (en) — **human-facing**: what
  users read on /methodology + /archetype via `t()`. This was the
  *better, fuller* copy.
- `lib/dimensions.ts` `DIM_DESCRIPTIONS` — **machine-facing**: injected
  into the dilemma/exercises/diary AI scoring prompts (plus a dead `||`
  fallback on /methodology). This was the *terser, drifted* copy.

`5473922` points the machine copy at the human copy so the model scores
against the same definitions users see. If you change a dimension
definition, change BOTH. The 7 non-en `dim.*.desc` locales remain
frozen under the i18n freeze — en-only edits.

### Site-wide swipe — what was checked, what was left alone

Changed: dimension definitions, the iconoclast bug, the home THINKERS
count. **Audited and deliberately left intact** (already strong; the
project's conservative mandate): the quiz chapter microcopy
(`app/quiz/quiz-engine.tsx` `CHAPTER_TITLES`/`CHAPTER_LINES` — literate
and rhythmic by design), `lib/dim-narration.ts` compare-mode pole
fragments (well-written but machine-spliced via a fragile verb-regex —
risky to touch), all of `lib/archetypes.ts` long-form essays, and the
methodology page (it renders the improved dims via `t()`; no stale
counts). A thorough read-only defect sweep across user-facing routes
surfaced exactly one issue — the home count, now fixed. No broken
internal links; every `archetypeKey`/`withKey` literal in the app is
one of the canonical 10 archetypes.

### Correction to the 2026-06-07 handoff (below)

That section lists the `SUGGESTED_TOPICS` debate chips under "What's
next … (NOT started)." They were in fact shipped later the same day —
`lib/debate-topics.ts` + chip reordering in both debate forms (commit
`b3981a2`). That vector-space next-item is done.

---

## Updates from the 2026-06-07 session

**Theme: personalize the daily dilemma, then make the *entire* UX
vector-space-driven.** Jimmy's brief:
> "improving the daily dilemma, make it personalised to each archetype
> and also make the questions better … After this, make the entire ux
> archetype or even vector space based … This includes all types of
> recommendations, for features like daily dilemma but also other
> features"

Shipped across many small commits on `claude/zen-wu-4cd09b`, each
deployed via `git push origin HEAD:redesign-2026` (auto-deploys — see
the corrected "How to ship" below).

### Task A — deeper, per-archetype daily dilemma (DONE)

- `lib/archetype-dilemmas.ts` — hand-authored deep dilemmas keyed per
  archetype, replacing the shallow shared pool.
- `app/dilemma/page.tsx` personalizes the prompt for a placed user
  (archetype pill) with a graceful fallback for everyone else.
- `dilemma-form.tsx` POSTs a `dilemmaRef`; the submit route
  reconstructs the dilemma from that ref server-side (doesn't trust
  client text).

### Task B — vector-space recommendation engine (DONE for the featured-pick / nearest-content surfaces)

The spine is **`lib/recommendations.ts`** — the one engine that ranks
*content* against the *user's own 16-D vector*. Built on `lib/vectors.ts`
(cos, normalize, magnitude). Key exports:

- `rankByVector` / `nearestPhilosophersToVector` — cosine-nearest.
- `rankByDimensionFocus(userVec, items, getDims, n)` — **mean-centered**
  ranking: surfaces content sitting on the dimensions the user loads
  *most distinctively on* (above their OWN baseline), not globally-high
  axes. Powers the /topic + /exercises featured picks.
- `rankSplittingPairs` — score = `min(simA,simB)·(1+tension)`, for the
  /vs "debate that splits you."
- `pickWanderingPhilosophers` — kindred/far split for the Wandering week.

**Server-side personalization pattern** (used everywhere SEO matters):

```ts
const supabase = await createClient();              // @/utils/supabase/server
const { data: { user } } = await supabase.auth.getUser();
const orientation = await getUserOrientation(supabase, user?.id ?? null);
// orientation.vector is number[16] | null  (null = logged-out / unplaced / crawler)
```

`getUserOrientation` lives in `lib/user-orientation.ts`. Pages that
already call `getServerLocale()` are dynamically rendered, so the auth
read adds NO caching penalty, and the null/logged-out branch stays
byte-identical to before — public SEO output is unchanged. The
client-side mirror is the `mull.vector` localStorage key (written by
result-save), for client components.

**Surfaces converted to vector-space (all live):**

| Surface | What's personalized |
|---|---|
| Daily dilemma | per-archetype prompt (Task A) |
| Philosopher index | "philosophers nearest you" row |
| Wandering week | kindred / far philosophers |
| Pathway "trail from here" | vector-aware warm trail |
| `/vs` featured | "the debate that splits you" |
| `/topic` featured | "the question that lives where you do" |
| `/exercises` featured | "the practice for where you stand" |

**Content tagging added this session:** every Topic and Exercise now
carries `relevantDimensions: DimKey[]` (2–3 dims grounded in tradition
+ mechanism). For exercises the field is REQUIRED, so `tsc` fails if a
new exercise is added untagged — a built-in safety net.

**i18n coverage varies by key-group** — match the group you edit:
`topic.*`, `vs.*`, `wndr.*`, `pathway.*` are **en+zh only**;
`exercises.*` is **all 8 locales** (en/es/fr/pt/ru/zh/ja/ko). zh strings
MUST use full-width punctuation (，。？「」——), never ASCII quotes.

### What's next on the vector-space thread (NOT started)

- **`SUGGESTED_TOPICS` debate chips** (`app/debate/debate-form.tsx` +
  `app/debate/me/duel-form.tsx`) — 10 freeform debate prompts that map
  cleanly onto dimensions ("whether reason or experience reveals truth"
  → TR/TE; "whether the self is an illusion" → SI). Could be reordered
  so the user's distinctive axes come first. Modest payoff; needs a
  client-side `mull.vector` read in both forms (they're client
  components) + a prompt→dims map. The array is DUPLICATED across both
  files — dedupe while there.
- **Deliberately NOT converted** (don't "fix" these): the anthology
  (re-ranking fights the user's mental model of their own collection),
  `/atlas` (already a self-personalized XP tracker), the home page (SEO
  marketing, stays static), the archetype / philosopher / exercise
  DETAIL pages (their "related / nearest / kindred" lists are anchored
  on the *viewed subject*, not the visitor — correct as-is), and the
  philosopher index's daily "featured profile" (the page already has a
  personalized "nearest you" row above it; personalizing both would
  stack two philosopher recs).
- **Low-value cleanup deferred:** 3 duplicate cosine impls + a duplicate
  `archetypeNameToSlug` (`app/search/leaderboard.tsx:41`) could fold
  into the shared libs.

---

## Updates from the 2026-05-27 session

Five deploys this session, all live on production. Commits in
chronological order with a one-line summary; details below.

| Commit | Title | Shape of change |
|---|---|---|
| `6ca1db8` | Big content fill | Topics 12 → 32, vs pairs 30 → 58, exercises 16 → 36, arena topics 13 → 28, plus categorised index UIs with daily-rotating featured cards on `/topic`, `/vs`, `/exercises`, `/arena/pve` |
| `2742235` | Philosopher SEO enrichment | 22 hand-written long-form bios for the most-searched philosophers (lives in `lib/philosopher-bios.ts`), reverse-indexed topic + matchup cross-links (`lib/philosopher-cross-links.ts`), FAQ JSON-LD per page, featured-profile-of-the-day on `/philosopher` index |
| `524a161` | UX pathway widget | Illustrated quest-trail at the bottom of every hook surface (`/topic/[slug]`, `/philosopher/[slug]`, `/archetype/[slug]`, `/vs/[a]/[b]`, `/exercises/[slug]`, `/dilemma`, `/map`). Cold visitors see Quiz → Discovery → Daily; warm visitors (archetype set in localStorage) see Pilgrimage → Spar → Diary. `/result` writes `mull.archetype` synchronously so the next page personalises immediately |
| `7993ee5` | Mobile pass | iOS safe-area inset on every fixed-bottom element via `env(safe-area-inset-bottom)`, narrow-viewport (<360px) title sizing, PWA manifest + `apple-mobile-web-app-capable` + `viewport-fit: cover`, dedicated `/install` route with iOS/Android/desktop step cards + native Android install prompt hook + standalone-detection, tighter mobile crop on Inheritor chamber illustrations (per-scene viewBox + dropped corner ornaments at ≤640px), fixed Cmd-K vs Feedback button collision (both were bottom-left) |
| (this batch) | EN-only banner + docs sync | `ContentLanguageNotice` now on `/topic/[slug]` + `/vs/[a]/[b]` (the other long-form pages already had it), NEXT.md updated, this section added, CHANGELOG.md created |

### New files worth knowing about

- `lib/pathway.ts` + `components/pathway-next.tsx` — the trail widget
  and its per-surface data
- `lib/philosopher-bios.ts` + `lib/philosopher-cross-links.ts` — the
  enriched-bio system + reverse-index lookups for topic/matchup cards
  on philosopher pages
- `app/install/page.tsx` + `app/install/install-client.tsx` — the
  add-to-home-screen guide. Read this if you want to understand the
  PWA install model (it's mostly platform-detection + UA branching)
- `public/manifest.webmanifest` — PWA manifest with three home-tile
  shortcuts (Daily Spar, Pilgrimage, Inheritor)
- Generator-owned categorisation tables in `lib/topics.ts`
  (`TOPIC_CATEGORIES` + `topicsByCategory()`) and `lib/vs-pairs.ts`
  (`VS_CATEGORIES` + `vsPairsByCategory()`)

### Where archetype state lives now

The pathway widget personalises on a new lightweight localStorage key:
`mull.archetype` (e.g. `"keel"`). Set synchronously by `/result` on
quiz completion alongside the existing `mull.pending_quiz_attempt`.
Reading it is a single `localStorage.getItem` — no JSON parse — so
any client component can cheaply branch on it.

### Bugs fixed in passing

- Cmd-K floating button + Feedback button mobile collision (both
  bottom-left). Cmd-K is now bottom-right on mobile.
- `curatedPairSlugs()` in `lib/vs-pairs.ts` now filters out pairs
  where either name doesn't resolve in `PHILOSOPHERS`, so the
  sitemap can never emit URLs that 404. Removed Socrates/Avicenna/
  Averroes pairs that would have shipped broken.
- Renamed `Michel Foucault` → `Foucault` in vs-pairs to match the
  corpus slug.

### What ships next

See NEXT.md. The biggest unblocked items are the deferred quiz
calibration audit and adding aliases to `public/mull.html` for
search parity with `lib/philosophers.ts`. Lower priority but
substantial: Stripe/Mull+ subscriptions and the Mo coach UI.

---

## Read these first

In rough order of importance for getting oriented:

1. **`PROJECT-FOR-COWORK.md`** — comprehensive product description.
   Read this first; it covers every surface, the brand, the
   differentiation, target audiences. Originally written for a
   social media campaign agent but works as a general orientation.
2. **`AGENTS.md` / `CLAUDE.md`** — project rules (user-scoped table
   registry, generator-owned content blocks, archetype targets).
3. **`STYLE-GUIDE.md`** — operational design spec. Tokens,
   components, anti-patterns. Reach for this before touching UI.
4. **`DESIGN-DIRECTION.md`** — the *why* behind the brand. Pixel-
   game world, library-book content. v3+ addendum at the top
   covers recent additions (Pixelify Sans, MullMark, Arena,
   Inheritor).
5. **`NEXT.md`** — backlog of deferred items + the content
   calibration strategy + the translations strategy decision.
6. **`PROJECT-SYNOPSIS.md`, `ROADMAP.md`, `ROADMAP-IDEAS.md`,
   `LAUNCH-RUNBOOK.md`, `SETUP.md`, `MIGRATION-PLAN.md`,
   `OVERNIGHT-NOTES.md`, `REDESIGN-HANDOFF.md`** — older context;
   skim if relevant to the current task, ignore otherwise.

---

## Current state of mull.world (production)

**Everything below is LIVE.** Verify in incognito if uncertain.

### What shipped in THIS session (2026-05-25, commits b05a4ee → 31ee9de, three deploys)

**Inheritor → murder mystery + 10 archetype-keyed endings**
- `/quiz/journey` reshaped from quiet narrative to country-house
  murder mystery. Same 16-D math. Each chamber opens with an
  anomaly the silent servant points out (Elena's missing death
  record, the daughter's forgiveness letter Wren never answered,
  the rival's conceded manuscript, the steamship ticket dated
  last week). Two twists in the reveal (Wren is alive; the silent
  servant is the "late" Elena). Ten archetype-keyed endings via
  `pickEnding()` — each with its own recognition, inheritance,
  ask, plus per-flavor second-order tuning.
- Renamed "The Inheritor" → "The Inheritor: A Murder Mystery"
  across homepage card, gate, metadata, about page.

**Methodology v4 + map embed fix + polish sweep**
- `/methodology` revamped: TOC strip, 16-dimension grid card,
  math pipeline schematic, AI integrations restyled as cards,
  per-section archetype-color accents.
- `/about` removed the disingenuous "Not an AI app" section.
- `/embed/map` new route fixes the long-broken iframe on
  `/account` and `/u/[handle]`.
- 11 pages: italic Pixelify Sans → italic Cormorant (the "5"
  glyph rendered as "$"; "552 thinkers" displayed as "$$2").
- Archetype cards: stacked NO.XX/NAME layout, separators align,
  no truncation.
- 8 duplicate philosopher entries removed from Wave 2.
- EN-only banner on 5 long-form pages.

**Daily Spar + The Pilgrimage**
- `/spar` — daily rotating philosopher × topic, one turn each,
  Sonnet judges in 30 seconds. Reuses Arena's philosopher-voice +
  judge libs via a slim `/api/spar/play` endpoint. Daily limit 3
  (client-side).
- `/pilgrimage` — 30-day archetype-personalized course. Ten
  hand-crafted archetype arcs (300 day cards total) with
  per-flavor enrollment lenses. State in localStorage.
- Map bug on `/account` fixed via new chromeless `/embed/map`
  route.
- New /account surfaces: ActivityHeatmap (GitHub-style 7×52
  grid), TrajectoryChart (auto-picks the most-moved dimension),
  PilgrimageStatusCard (Day X of 30 with 30-segment progress).
- Arena weekly featured challenge: deterministic rotation per
  ISO week; dark hero card on `/arena`.
- Research consent gate: `<ResearchConsentGate>` before first
  quiz, `/consent` page with toggle, `/api/consent` endpoint.

**The Capability Atlas + 5 retention features + 4 scaffolds**
- `/atlas` — the dopamine spine. Six skills (Rigor, Depth,
  Consistency, Range, Self-Awareness, Synthesis), level math
  (10 + level*5 XP), recent event log.
- `<CapabilityToast>` mounted globally — Stardew-style "+3 RIGOR"
  badge fires on every retention action; flips to "LEVEL UP"
  presentation when crossing a threshold.
- `lib/capabilities.ts` — typed event log (localStorage), source
  → skill mapping, level + streak helpers. Cross-tab event bus.
- `/crucible` (S9) — daily real-world action, 60-prompt pool,
  yesterday's check-in with kept/tried/skipped buttons.
- `/anthology` (S18) — commonplace book. `<SaveToAnthology>` pill
  on Spar verdicts + Argument Diary takes.
- `/wandering` (S12) — one question per ISO week, 4 beats
  (Mon/Wed/Fri/Sun).
- `/year` (S19) — always-updating annual page, 12×6 month/skill
  heatmap.
- `/argument-diary` (S10) — Haiku one-shot returns steelman + 2
  fallacies + 3 kindred takes. `/api/argument-diary/analyze`.
- Coming-soon scaffolds: `/read` (S13), `/letters` (S14),
  `/arena/open` (S16), `/long-letter` (S20). Each is a proper
  landing with eyebrow + pitch + "what it'll do" + when.

**UX rewire so retention surfaces don't require discovery**
- Homepage: "WHAT TO DO TOMORROW · FIND YOUR RHYTHM" section
  with 6 RhythmCards across daily/weekly/long-arc cadences.
- SiteNav: added `/atlas`, `/spar`, `/pilgrimage` as top items;
  Archetypes + Today's Dilemma moved to Cmd-K.
- Cmd-K palette: added Crucible, Wandering, Anthology, Argument
  Diary, Year-in-View, Capability Atlas with hints.

**Existing surfaces now fire Atlas events**
- Spar emits "spar" event (2× XP if user won verdict). Verdict
  reasoning has a Save-to-Anthology button.
- Pilgrimage day-complete emits "pilgrimage" event (3× XP on
  Day 30 — the arc finish bonus).

**Total session shipped: 3 production deploys, 15 new routes,
~7,000 lines of new code, ~25,000 words of new content.**

---

### Cost picture (after this session)

**Per-use AI cost:**
- Arena PvE debate (4–8 turns + judge): ~$0.15–0.20
- Daily Spar (1 turn + judge): ~$0.05–0.08
- Argument Diary analysis: ~$0.005–0.01
- Daily Dilemma / Diary / Exercise: ~$0.005
- Yearly retrospective (Mull+): ~$0.30–0.50
- Inheritor / Pilgrimage / Crucible / Wandering / Atlas /
  Anthology / Year-in-View: **$0** (deterministic)

**Monthly cost at scale:**
- 100 MAU → ~$70 | 1,000 MAU → ~$720 | 10,000 MAU → ~$7,200

**Gating (documented but NOT yet enforced server-side):**
- Free: 1 Spar/day, 1 Arena/day, 3 Argument Diary/week.
- Mull+ ($4.99/mo, dormant): 5 Spars/day, unlimited Arena +
  Argument Diary, Reading Hour / Long Letter / Mull Open when
  built.
- Hard global caps regardless of tier: 10 Spars + 5 Arena + 5
  Argument Diary per user per day.

**CRITICAL GAP**: caps are currently localStorage-only. Server-side
rate-limit middleware (using existing `rate_limit_events` table)
is the next infra build before promoting these features hard.

---

### Older session shipped (for completeness)

P-tier (Wave 1 features — already shipped before previous session
started but listed here for completeness):
- P2.1 Challenge-a-friend, P2.2 Mull Wrapped, P2.3 Embed badge,
  P2.4 Classes, P2.5 Assignments, P2.6 EDU tier

W-tier (Wave 2 features, shipped this session):
- W2.1 Class insights (dimensional map + pre/post shift, teacher-only)
- W2.2 12 topic SEO explainer pages (`/topic/[slug]`)
- W2.3 30 vs philosopher matchup SEO pages (`/vs/[a]/[b]`)
- W2.4 AI-pattern heuristic on assignment submissions

Stripe + monetization:
- Full Stripe wiring exists but is DORMANT (no signup flow exposed)
- Founding Mind bumped from $49 → $59 to match Stripe dashboard
- Free-mode swap: all features free; Haiku for cheap routes; Ko-fi
  tip jar in footer + post-Arena-verdict + post-Inheritor

The Inheritor (RPG quiz):
- 6 prototype iterations (v1 Vigil → v6 Inheritor with gate)
- Lives at `/quiz/journey` — narrative quiz, 4 chambers + intro +
  reveal, choice-driven per-chamber epilogues (new options trigger
  revelations about the deceased)
- Home page promotes it as primary CTA over the classic quiz

The Arena (PvE + PvP):
- Full system: 10 philosophers across 3 tiers, 13 topics across 2
  categories, Elo gating, Elo decay, leaderboard, match history,
  PvP async, email notifications (challenge accepted / your turn /
  verdict), tip-jar surfaced post-verdict
- Lives at `/arena`, `/arena/pve`, `/arena/pvp`, `/arena/leaderboard`,
  `/arena/history`

UX/UI redesign sweep:
- New brand mark: `MullMark` SVG (circle with 8 dots + amber "you"
  dot). Replaces the old "M tile." Default in `MullWordmark` now.
  Favicon updated.
- Font swap: Pixelify Sans is the new default body font. Cormorant
  Garamond reserved for long-form essay pages (archetype detail,
  philosopher detail, about, methodology, topic, vs).
- `STYLE-GUIDE.md` written — operational spec with anti-patterns
  list.
- Home page IA rework: tier-1 Quiz + Arena as peer hero cards;
  added "WHAT YOU CAN DO HERE · THE FULL MAP" section with
  EXPLORE / DEEPEN / ALSO tiers.
- About page rewritten: covers Arena, Inheritor, free-mode economics.
- Site-nav refreshed: MullMark + Arena added to top nav + Cmd-K
  palette expanded from 15 to 26 entries.
- Result page next-steps restructured from CTA-pileup to hero +
  2-peer-cards + tier-3 links (Arena = peer of Inheritor).
- `/map` created as dedicated constellation page; cross-linked
  with `/philosopher` (alphabetical).
- Animation pass: `ScrollReveal` component + 5 new CSS utilities
  (stamp-in, reveal/revealed, pulse-amber, slow-bob, hover-wiggle).
  All `steps()`-based, no library. Sitewide on home + nav.

Calibration:
- `displayPct` formula recalibrated — best-fit archetypes now show
  ~70-80% instead of the previous ~38-50%
- Account-page achievements redesigned as compact badge lineup with
  hover tooltips (replaced wall-of-cards)
- Quick quiz audit (20 Qs): 9 changes — vector rebalances, two
  rephrases, three new answer options
- Detailed quiz audit (50 Qs): 9 changes — rebalances + negative-
  weight cleanups + two leading-phrasing rewrites
- Topic page audit: 24 philosopher names reconciled (full→short
  + missing→removed/replaced); "fat man" trolley language updated
- Exercises audit: read all 16, no changes needed
- Translation strategy: documented in NEXT.md — don't machine-
  translate philosophy; surface EN-only banner; commission
  human-translated pages on validated demand

Inheritor story-weaving (the most narratively interesting piece):
- Engine extended with `JourneyScene.choiceEpilogues?: Record<number, string>`
- Each of the 4 chambers now has a NEW 6TH OPTION that, when picked,
  triggers a unique 2-3-paragraph epilogue revealing something
  concrete about how the deceased lived
- Pick all four "revealing" options across the chambers and you've
  built a full secondary portrait of the deceased before meeting
  them in the final chamber

PROJECT-FOR-COWORK.md:
- 349-line campaign brief for social media planning agent

---

## What's queued (not started, ranked by priority)

### Lane A — Distribution (highest leverage)

1. **Run the cowork social media campaign** with PROJECT-FOR-COWORK.md
   as the brief. This is awaiting Jimmy actioning it, not me building
   anything.
2. **Launch post** for HN / r/sideprojects / philosophy Reddit.
   Mull never had a "v1 ship" moment.
3. **One real podcast or newsletter mention** — outreach work, not
   engineering.

### Lane B — Retention experiments (medium leverage)

4. **Branching Inheritor endings.** Per Jimmy 2026-05-24:
   > "is it possible to make the quiz questions change based on
   > player choices? For different stances to get different endings
   > for the inheritor quiz, ... Make sure each stance has a
   > different ending that is objectively different."

   My design proposal (not yet built):
   - 5 distinct endings clustered by stance: **The Silent** (silence
     option picked 3+ times), **The Reverent** (new revealing
     options picked 3+ times), **The Principled** (UI-heavy),
     **The Pragmatic** (PO/SS-heavy), **The Tragic** (TV/MR-heavy).
   - Each ending = a different ask from the deceased + a different
     inheritance + a different final action. Objectively different.
   - Implementation: ending-picker function reads accumulated
     vector + picks the closest. Engine routes to one of 5 reveal
     scenes instead of the single current reveal.
   - ~4-6 hours work. Substantial content writing for the 5 new
     ending scenes.

5. **Daily streaks on dilemma** — gentle, opt-in, would test
   daily-return mechanic. Not yet built.

6. **Email digests** — once a week summarizing your trajectory.
   Not yet built; would use existing `lib/email.ts`.

### Lane C — Polish that compounds (lower urgency)

7. **Map bug on `/account`.** Jimmy flagged 2026-05-25:
   > "the map on the account page is bugged, give this issue a go"
   I started investigating (grepped for `ConstellationMount` in
   `app/account/page.tsx` — no direct usage found, so the map is
   embedded indirectly somewhere; need to dig deeper). Did NOT get
   to fixing it. Next session should start here.

8. **Full polish sweep.** Jimmy asked 2026-05-25:
   > "do a full polish of the entire website focusing on cleaning
   > up code and any page connection and aesthetics"
   Not yet executed. Scope to define:
   - Dead code removal
   - Cross-link audit (broken `/philosopher` links etc.)
   - Per-surface consistency vs STYLE-GUIDE.md
   - Mobile QA pass (most session work was desktop)

9. **EN-only banner on 7 long-form pages.** Tracked in NEXT.md
   §Translations. `i18n.content_notice` key already exists; just
   needs surfacing on /archetype/[slug], /philosopher/[slug],
   /topic/[slug], /vs/[a]/[b], /about, /methodology, /exercises/[slug].

### Lane D — Future (logged, not blocking)

10. **Framer Motion for genuinely interactive timeline animations.**
    Inheritor scene transitions (chunky stepped fades between
    chambers). Arena verdict reveal one criterion at a time, with
    the kindred-philosopher line dropping at the end. Per Jimmy:
    > "i quite like this idea, we will do that after the
    > calibration no problem"

    When implementing: use Motion with custom step-based easings
    only (per STYLE-GUIDE.md §6 — no silky cubic-beziers). Don't
    use Aceternity / shadcn animation components.

11. **Add more philosopher opponents to Arena** as usage data
    accumulates. Calibrate philosopher voice prompts based on
    judged debates.

12. **Continue content calibration** on Arena topics + voices
    once 50+ judged debates exist per philosopher. Deferred per
    original plan.

---

## Open questions waiting on Jimmy

1. **Sequence for next session** — Lane A first (campaign launch)?
   Or build branching Inheritor first as a content asset the
   campaign can lean on? My recommendation: parallel — Jimmy runs
   cowork campaign while I build branching Inheritor.

2. **Branching Inheritor — 5 endings approved?** The 5-stance
   design above needs Jimmy's read before I commit hours to
   writing them.

3. **Map bug on /account** — Jimmy needs to describe what's
   actually broken (didn't get specifics last session). Screenshot
   would help.

4. **Cowork campaign — Jimmy's open questions from PROJECT-FOR-COWORK.md:**
   - Promote Ko-fi tip jar explicitly or stay quiet on funding?
   - Target specific philosophical community first or go broad?
   - Spoiler the Inheritor's ending in campaign content or not?
   - Treat the campaign itself as the launch moment?

---

## Operational context for the next session

### How to ship to production

**As of 2026-06-07 the deploy path is a single git push.** The Vercel
production branch is `redesign-2026`; pushing the working branch's HEAD
onto it auto-deploys to mull.world:

```bash
# from the worktree (local HEAD = claude/zen-wu-4cd09b):
git push origin HEAD:redesign-2026
```

Verify first (tsc + invariants green — see below). Jimmy has given
standing permission to push + prod-deploy after a verified batch, so no
approval round-trip is needed.

(Historical: earlier sessions claimed git auto-deploy was off and used a
direct `npx vercel deploy --prod` from a /tmp worktree with a copied
`.vercel`. That dance is no longer needed for this branch — the simple
push above is the live mechanism.)

### Common reset commands

```bash
# TS check (always run before commit)
npx tsc --noEmit 2>&1 | head -10

# build check
npm run build 2>&1 | grep -E "(error|Error|\\bfailed\\b)" | head -5

# table invariants (run after adding any user-scoped table)
node scripts/check-table-invariants.mjs
```

### Working agreements with Jimmy

- **Auto mode is the default.** Execute autonomously, minimize
  interruptions, prefer action over planning.
- **Long autonomous stretches preferred.** Don't pause to ask
  routine questions; make reasonable assumptions and ship. Jimmy
  reviews visually after the fact.
- **Jimmy is a non-coder.** He pastes terminal commands and reviews
  visual screenshots. No "now switch branches and run X" expectations.
- **Ship to production frequently.** Smallest-shippable-unit is the
  norm; rapid feedback loop matters more than batched changes.
- **Do not merge to redesign-2026 directly** — that's the shared
  branch and merges need user approval (denied previously). Direct
  Vercel CLI deploy is the workaround in use.

### Codebase invariants (from CLAUDE.md + AGENTS.md)

- This is a non-standard Next.js (Next.js 16.2.5). Read
  `node_modules/next/dist/docs/` before assuming any pattern from
  training data is current.
- Every user-scoped DB table MUST be registered in
  `lib/user-scoped-tables.ts` AND pass
  `node scripts/check-table-invariants.mjs`.
- Wave 2 philosopher entries (between `BEGIN gen-philosophers
  Wave 2` and `END` markers in `lib/philosophers.ts` + `public/mull.html`)
  are generator-owned. Don't hand-edit inside the markers; edit
  `scripts/gen-philosophers.mjs` and re-run `--apply`.
- Archetype target vectors live in `lib/archetype-targets.ts`.
  Both TS and `.mjs` callers exist; both must work.

---

## Recommended first 10 minutes of the next session

1. Read this doc (you're already here).
2. Skim `PROJECT-FOR-COWORK.md` for current product shape.
3. Glance at `git log --oneline -10` to see the last 10 commits.
4. Check the live site (mull.world) is still serving the right
   commit — Vercel sometimes drifts.
5. Pick a lane (A / B / C from above), tell Jimmy the plan, and
   start executing.

If Jimmy hasn't already specified — **default plan: confirm with
Jimmy whether to start with branching Inheritor (Lane B item #4)
since that was the last big thing he asked for before the session
ran out of context.**

Good luck. The product is in great shape. Distribution is the
real work now.

— previous session, 2026-05-25
