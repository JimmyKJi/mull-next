# Phase 3 — mull.html → Next.js migration plan

Status: in progress (started 2026-05-13, redesign-2026 branch).
Owner: this is a working doc; update as the migration proceeds.
Companion: `REDESIGN-HANDOFF.md` (project context),
`OVERNIGHT-NOTES.md` (mid-flight observations).

## What's in mull.html that needs to move

mull.html is a single 9402-line file. The structure breaks down as:

**Sections** (all in one DOM, toggled via `hidden`):
1. `#landing` — hero, version banner, daily-wisdom, two quiz CTAs,
   promise bullets, "how this works" details, archetype strip
2. `#about` — about page (long-form copy)
3. `#archetype-detail` — single archetype deep-dive
4. `#gallery` — all 10 archetypes grid
5. `#mappreview` — constellation map preview (no quiz result yet)
6. `#quiz` — single-question-at-a-time UI with progress bar
7. `#results` — the magical reveal + all the long-tail content
8. `#sticky-cta` — sticky daily-dilemma footer (results only)
9. `#compare-modal` — modal to compare two attempts
10. `<footer>` — site footer

**State model** (vanilla JS):
```
let state = {
  idx: 0,
  answers: [],         // index | indices[] | 'optout'
  vector: zeros(),     // 16-D
  multiPicks: [],
  quizMode: 'quick'    // 'quick' (Q, 20q) | 'detailed' (Q_DETAILED, 50q)
};
```

**Inline data** that already lives in `lib/` (don't re-extract):
- DIMS → `lib/dimensions.ts` (DIM_KEYS, DIM_NAMES, DIM_DESCRIPTIONS)
- ARCHETYPES → `lib/archetypes.ts` (rich data) + colors at
  `lib/archetype-colors.ts` (extracted in Phase 2)
- PHILOSOPHERS → `lib/philosophers.ts` (560 entries)
- FIGURES → `lib/figures.ts` (10 SVG portraits)
- Translations → `lib/translations.ts` (UI chrome only)

**Inline data** that does NOT yet exist in `lib/` (must be extracted):
- `Q` — 20 quick-mode questions with answer vectors
- `Q_DETAILED` — 50 detailed-mode questions with answer vectors
- `QUICK_I18N` — quick-mode question translations (~6 locales)
- `DETAILED_I18N` — detailed-mode question translations
- `DEBATES` — debate-stance positions (also in mull.html only)
- `WHY_POSITIONS` — "why this archetype" copy
- `QUOTES` — duplicated; `lib/archetypes.ts` has its own per-archetype
  quotes; mull.html's are similar but not identical. Pick one source.
- `READING` — same situation as QUOTES.

**JS functions** that need TypeScript equivalents (rough list):
- `v(obj)` — build a 16-D vector from `{TR:3, SS:2}` shorthand
- `cos(a, b)` — cosine similarity
- `magnitude(v)` — L2 norm
- `zeros()` — zero vector
- `displayPct(sim)` — sim → pct readable for users
- `computeFlavor(userVec, topArchetype)` — picks the "Stoic Cartographer"-style
  flavor word
- `topShifts(delta)` — already in `lib/dimensions.ts`
- `applyArchetypeTheme(arch)` — swap CSS custom properties on root
  (Phase 2 POC already does this via inline `themeStyle`)
- Quiz nav: `startQuiz`, `selectAnswer`, `goBack`, `continueMulti`, `selectOptout`
- Result render: `showResults`, `renderResultContext`, `renderWhy`,
  `renderDebates`, `renderRoles`, `renderProfile`, `renderReading`,
  `renderArchetypeStrip`, `setupShareRow`, `maybeShowOnboard`
- Constellation: `drawConstellation` (Three.js — port to R3F)
- Daily wisdom: deterministic-by-date selection from PHILOSOPHERS
- Auth chip / save attempt — already mostly handled by /api/account/* + Supabase

## Migration sub-phases

### 3a. Data unification (no UI change)

Extract from mull.html into typed lib modules. Each module becomes
the single source of truth; mull.html will keep its inline copy
until cutover.

- [ ] `lib/quiz-questions.ts` — typed `Question` and `Answer`, plus
      `QUICK_QUESTIONS`, `DETAILED_QUESTIONS`, and a `v()` helper.
- [ ] `lib/quiz-i18n.ts` — translations of question prompts and
      answer text, indexed by question index + locale.
- [ ] `lib/vectors.ts` — `cos`, `magnitude`, `zeros`, `displayPct`,
      `computeFlavor`. Pure functions, fully tested.
- [ ] `lib/debates.ts` — DEBATES + `topDebateStances` projection.
- [ ] `lib/why-positions.ts` — WHY_POSITIONS copy.
- [ ] Decide: keep duplicated QUOTES/READING in mull.html or
      converge to `lib/archetypes.ts`. Pick lib/ as canonical;
      replace any deviation with a TODO note in mull.html.

### 3b. New hero at app/(redesign)/home/

Build the modernized landing as a Next.js route. Strictly additive.
Cutover happens later by flipping `next.config.ts`.

- [ ] `app/(redesign)/home/page.tsx` — server shell with metadata.
- [ ] `app/(redesign)/home/hero.tsx` — H1 + lede + daily-wisdom
      with motion primitives. Preserves rag-right invariant
      (H1 + lede + daily-wisdom share the same rag-right edge — see
      AGENTS.md).
- [ ] `app/(redesign)/home/daily-wisdom.tsx` — server component
      that picks the day's quote deterministically. Uses
      `getDailyDilemma`-style date hash.
- [ ] `app/(redesign)/home/quiz-cta.tsx` — the two big buttons
      with subtle motion on hover/press.
- [ ] `app/(redesign)/home/promise-bullets.tsx` — three bullets.
- [ ] `app/(redesign)/home/howworks.tsx` — collapsible details
      block; preserves all 5 paragraphs of explanation.
- [ ] `app/(redesign)/home/archetype-strip.tsx` — 10-archetype
      grid that can also live on the result page (matches mull.html
      strip behavior).

### 3c. Quiz engine at app/(redesign)/quiz/

- [ ] `app/(redesign)/quiz/page.tsx` — server shell.
- [ ] `app/(redesign)/quiz/quiz-engine.tsx` — client; one question
      at a time, progress bar, skip + back, multi-pick support.
      State in React. Uses `lib/quiz-questions.ts`.
- [ ] On finish: navigate to `/result?v={base64Json(vec)}&m={mode}`
      so result page can render without re-running quiz.
- [ ] Persist mid-quiz state in sessionStorage so refresh doesn't
      lose progress (matches mull.html's existing behavior).

### 3d. Result page integration

- [ ] `app/(redesign)/result/page.tsx` — server; decodes vector,
      computes archetype + flavor on the server, passes to client
      reveal.
- [ ] Wire in the Phase 2 POC `ResultReveal` component as the
      hero block. Port from `app/(redesign)/result-preview/`.
- [ ] Add the long-tail blocks below the cream coda that mull.html
      currently has: result-context chips, "why this archetype",
      debates, kindred philosophers list, reading list, sticky
      daily-dilemma CTA, share row.
- [ ] Save-attempt flow: call existing `/api/quiz/save` (or add
      one) to persist when authed; stash in localStorage when guest.

### 3e. Constellation map (R3F port)

This is a non-trivial sub-phase. Three.js code in mull.html is
imperative; R3F is declarative. Plan separately when 3a–3d land.

- [ ] Read mull.html `drawConstellation` carefully.
- [ ] Build `<Constellation />` as an R3F canvas with:
      - 560 philosopher points placed via 16-D → 3-D PCA
      - User point (pulse animation)
      - History tail (last 10 positions, dashed line)
      - Hover tooltip with name + dates
- [ ] Mount in /home (mappreview slot) + /result.

### 3f. Remaining sections

- [ ] About page — already at /about as a Next route. Re-style
      with design tokens + Cormorant. Light pass.
- [ ] Archetype gallery at /archetype + /archetype/[slug] — already
      Next routes. Re-style.
- [ ] Footer — small, quiet. Build as a shared component used by
      both home and result.

### 3g. Cutover

- [ ] When /home, /quiz, /result, /constellation are at parity,
      flip the rewrite in next.config.ts so `/` serves the new home.
- [ ] Delete `public/mull.html`.
- [ ] Remove the rewrite block.
- [ ] Re-test all share links (mull.world/?v=...) — they currently
      hit mull.html's URL-decode flow. The new /result must accept
      the same URL params for backward compat.
- [ ] Update LAUNCH-RUNBOOK.md with the new pre-deploy checks.

## Decisions deferred (revisit during 3d)

- Does the new result page show the constellation map inline or
  link out to /constellation? mull.html shows inline. Inline keeps
  the "this is where you sit" moment with the philosophers visible.
  Probably keep inline; cost is one extra R3F mount.
- Does the share-row use the same OG-image generation as the
  current /share/[slug] route? Almost certainly yes — that's
  already good.
- The "About Mull" section currently embeds in mull.html as a
  toggled section. Should it stay as a /about route or be a
  scroll-anchor on /home? /about route is easier for share-link
  permanence; keep as route.

## Rollback plan

Until cutover (3g), mull.html stays in production at `/`. Anything
that breaks in /home, /quiz, /result during development is
invisible to real users. After cutover, if a regression is found:

1. Revert the next.config.ts change in a hotfix commit
2. Re-deploy — `/` serves mull.html again immediately
3. Diagnose at leisure on the new routes
