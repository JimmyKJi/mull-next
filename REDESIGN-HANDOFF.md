# Mull · Redesign handoff

This document hands off the Mull UI/UX redesign project from a previous
Cowork conversation to a fresh Claude Code session. Read this first if
you're picking up the work cold. It's self-contained — you don't need
the previous conversation log.

---

## What we're doing

Migrating Mull's UI/UX from a "feels-like-2010s" baseline to a modern,
animated, mobile-first experience. The product itself (the 16-D
philosophical model, ten archetypes, 560 philosopher corpus, quiz +
result + dilemma + diary + exercise + debate surfaces) stays the same.
What changes is everything visual: motion, transitions, custom figure
animations, page navigation feel, the way the quiz result emerges, the
constellation map's polish.

We're on the **`redesign-2026`** branch.

## Decisions already made (don't re-litigate)

1. **Migrate `public/mull.html` (the 9000-line static homepage) into
   Next.js components.** This is the biggest single piece of work in
   the project. Keeping mull.html static and animating inside it was
   considered and rejected — unified codebase, shared components, real
   React + Framer Motion + R3F access everywhere is worth the effort.
2. **Keep the cream + warm editorial palette.** Modernizing doesn't
   mean abandoning the visual voice. Elevate with subtle gradients,
   better depth, motion-revealed accents — don't replace.
3. **Mobile-first responsive, laptop second.** Mull's growth is via
   IG/TikTok shares — mobile is the primary surface. Laptop must work
   well but doesn't drive the visual decisions.
4. **Tailwind CSS for styling.** Refactor from inline `style={{...}}`
   to Tailwind utilities. Significant up-front effort, but it
   establishes a real design system and unblocks every other change.
5. **Framer Motion for animation, React Three Fiber for the
   constellation map.** No GSAP unless we hit a specific use case it
   solves better.
6. **PWA approach, not a separate native app.** Service worker +
   manifest + install prompt. Same Next.js codebase serves both web
   and "installed-on-phone" experiences. Optional Capacitor wrapper
   later for App Store presence if desired. Critically: NOT a
   "marketing site + separate app" model — Mull's growth is
   link-shaped and search-shaped, both of which need the web.
7. **Branch:** `redesign-2026`. All work happens here. `main` stays
   stable.

## Scope and timeline

- **Phase 1 (Days 1–4): Foundation.** Dependencies, Tailwind
  configuration, design tokens, motion tokens, primitive components,
  reduced-motion respect.
- **Phase 2 (Week 1–2): Quiz result reveal proof-of-concept.** Build
  the magical moment as a standalone React component first, before
  migrating any of mull.html. This is the highest-emotional-payoff
  surface; if it lands, it sells the redesign.
- **Phase 3 (Weeks 2–3): Migrate mull.html.** Hero, quiz engine,
  result reveal (integrating the POC), constellation map (port
  Three.js to R3F), about + archetype gallery, share, version banner,
  footer.
- **Phase 4 (Weeks 3–4): Redesign existing Next.js surfaces.** Account
  hub, dilemma form, diary, compare, archetype detail pages,
  philosopher detail pages, exercises, search/leaderboard variants.
- **Phase 5 (Post): Polish, mobile perf, accessibility, PWA setup.**

**Realistic total: 3–4 weeks at one-polished-surface-per-day pace,
assuming Jimmy can review for ~30 minutes daily.** 6–8 weeks if we
cover every surface at full polish. "A few weeks or less" works if we
scope tightly to 5 hero surfaces (homepage, quiz, result, constellation,
account hub) and let the rest inherit foundations only.

## Tools to install in Claude Code

Run these inside Claude Code:

```
/plugin
```

Then install:
- `design` plugin — gives access to `design-critique`, `design-system`,
  `accessibility-review`, `ux-copy` skills. Use these throughout.
- (Already available by default in Claude Code, no install needed):
  WebSearch, the built-in coding skills.

If `xlsx`, `docx`, `pdf` skills aren't pre-installed in your Claude
Code session, install them too — they're handy for tracking/auditing.

The `.claude/skills/calibration-check/SKILL.md` skill is checked into
this repo and will auto-load.

## Architectural invariants — DO NOT BREAK

Read `AGENTS.md` for the full list. Quick summary:

1. **User-scoped tables MUST be registered in
   `lib/user-scoped-tables.ts`.** Both account-delete and account-export
   iterate over that registry. Adding a new user-scoped table without
   registering it = silent privacy violation.
2. **Wave 2 philosopher entries (between BEGIN/END sentinels in
   `lib/philosophers.ts` and `public/mull.html`) are generator-owned.**
   Don't hand-edit. Modify `scripts/gen-philosophers.mjs` ENTRIES and
   run `node scripts/gen-philosophers.mjs --apply`.
3. **Archetype targets live in `lib/archetype-targets.ts`.** TypeScript
   modules import directly; `.mjs` scripts use
   `scripts/_load-archetype-targets.mjs`.
4. **The `public/mull.html` constellation/quiz/result is currently
   live in production at `/`.** During the migration, don't break the
   current rewrite (`next.config.ts` `beforeFiles`) until the new
   route is ready. Migration strategy: build new components in
   `app/(home)/` while leaving mull.html in place; only flip the
   rewrite when the new path is feature-parity.

## What was done in the previous session (May 12, 2026 Cowork)

Summary of work already shipped that you don't need to redo:

- **Privacy invariant.** `lib/user-scoped-tables.ts` registry, refactored
  `app/api/account/delete/route.ts` and
  `app/api/account/export/route.ts` to iterate over it,
  `scripts/check-table-invariants.mjs` enforces drift detection. Caught
  and fixed an active bug where the export was missing 8 tables that
  delete was wiping (privacy-promise violation). Export schema bumped
  from v2 to v3.
- **Wave 1 alias backfill.** 77 philosopher entries had empty aliases.
  Backfilled 69 algorithmically + 8 hand-overridden cases (W.E.B. Du
  Bois, Thich Nhat Hanh, Dalai Lama, etc.). Algorithm fix: skip
  particles (Ibn, Ben, De) at first word, not just last.
  `scripts/backfill-aliases.mjs` is the one-shot, audit at
  `scripts/alias-backfill-audit.md`.
- **Generator refactor.** `scripts/gen-philosophers.mjs` now supports
  `--apply` mode that splices Wave 2 entries into both
  `lib/philosophers.ts` and `public/mull.html` in a single command
  via BEGIN/END sentinels. Legacy stdout modes preserved.
- **Archetype-targets dedup.** `lib/archetype-targets.ts` is the new
  source of truth; mjs scripts load via
  `scripts/_load-archetype-targets.mjs`.
- **DiagnosisCard on exercises.** Mounted in
  `app/exercises/[slug]/reflection-form.tsx` post-save state. The API
  was already returning diagnosis/kinship/is_novel; only the UI was
  missing.
- **Original Thinking extended.** `app/search/original-thinking.tsx`
  now unions diary + dilemmas + exercise reflections, sorted by
  recency, with source labels. Fixed a pre-existing bug:
  `public_profiles.is_public` column doesn't exist; the `!inner` join
  already enforces profile existence.
- **Calibration tooling.**
  `scripts/check-philosopher-calibration.mjs` mechanical sanity check.
  Skill at `.claude/skills/calibration-check/SKILL.md`. Report at
  `scripts/calibration-report.md`. Finding: corpus is densely packed
  but well-connected (mean top-1 sim 0.992); a couple of pairings
  worth investigating (Ayn Rand near Wollstonecraft, Descartes near
  Korsgaard) — flagged in `NEXT.md`.
- **Tradition+sovereignty gap.** Analysis at
  `scripts/tradition-sovereignty-analysis.md`. Jimmy picked Option C
  (document and defer). Methodology page updated.
- **App/page.tsx deleted.** Was Vercel boilerplate; never served (the
  rewrite covered `/`). Removed for clarity.
- **Account RLS fix.** `app/account/page.tsx` "Recent shifts" was
  showing every other user's public dilemma responses to new
  accounts. Added explicit `.eq('user_id', user.id)` to all four
  trajectory queries. The bug existed because two RLS SELECT policies
  apply on the affected tables (own rows + public rows); explicit
  user_id filter is required defensively.
- **nav.compare i18n.** Translation key was missing. Added across all
  8 locales.
- **LAUNCH-RUNBOOK updated.** Pre-deploy sanity-check section added:
  `tsc --noEmit -p .`, `check-table-invariants.mjs`, lint,
  `check-philosopher-calibration.mjs`, `npm run build`.
- **AGENTS.md updated.** New invariants documented.

## Deferred items

See `NEXT.md` for the full list. Headlines:

- Calibration vector nudges (Ayn Rand, Descartes)
- Persona-based stress-test harness (the `outputs/*.mjs` files the
  synopsis described but don't exist in the repo)
- Stripe/Mull+, Mo coach, forum upvote/downvote
- Deep-content translations
- Add aliases to `public/mull.html` for client-side search parity

## Day 1 plan (what to do first in Claude Code)

1. **Confirm branch:** `git status` should show `redesign-2026`.
2. **Install dependencies:**
   ```
   npm install -D tailwindcss postcss autoprefixer @tailwindcss/typography
   npm install framer-motion @react-three/fiber @react-three/drei clsx tailwind-merge
   ```
3. **Initialize Tailwind:**
   ```
   npx tailwindcss init -p
   ```
4. **Configure Tailwind:** Map the cream/warm palette to the theme.
   Existing inline styles must continue working — Tailwind is
   additive, not a replacement (yet).
5. **Create `lib/design-tokens.ts`:** Single source of truth for
   colors, typography, spacing. Both Tailwind config and any
   remaining inline styles reference this.
6. **Create `lib/motion-tokens.ts`:** Duration scale, easings, springs.
   Respect `prefers-reduced-motion`.
7. **Build a `lib/motion-primitives.tsx`:** FadeIn, SlideUp, Stagger.
   Reusable across the codebase.
8. **Stop and ask Jimmy to review.** Don't start migrating mull.html
   or changing existing surfaces until the foundation is approved.

After foundation: the quiz result reveal POC. Build it as a route at
`app/(redesign)/result-preview/page.tsx` or similar — a sandboxed page
Jimmy can view to see what the new aesthetic looks like, before any
existing route is touched.

## Key project files to know

```
public/mull.html               9000-line static homepage (gets rewritten to /)
lib/philosophers.ts            560 typed PhilosopherEntry records
lib/kinship.ts                 Shared diagnosis/kinship logic
lib/dimensions.ts              16-D model definitions
lib/archetype-targets.ts       10 archetype target vectors (NEW)
lib/user-scoped-tables.ts      Privacy registry (NEW)
lib/translations.ts            8-language i18n table
lib/dim-narration.ts           Compare divergence/convergence
components/diagnosis-card.tsx  Shared diagnosis UI
components/global-topbar.tsx   Top navigation
app/account/page.tsx           The most-visited authed surface
app/dilemma/page.tsx           Daily dilemma + form
app/diary/                     Diary entries
app/exercises/                 Stoic/Socratic exercises
app/compare/page.tsx           Side-by-side user comparison
app/share/[slug]/              Screenshot-friendly result card
app/search/                    Leaderboard + editor picks + original thinking
app/u/[handle]/                Public user profiles
app/archetype/                 Archetype detail pages
app/philosopher/               Philosopher detail pages

scripts/gen-philosophers.mjs           Wave 2 generator (one-command --apply)
scripts/check-table-invariants.mjs     Privacy invariant check
scripts/check-philosopher-calibration.mjs  Mechanical calibration audit
scripts/backfill-aliases.mjs           One-shot alias backfill (already run)
scripts/_load-archetype-targets.mjs    Helper for mjs scripts

next.config.ts            Rewrites `/` → `/mull.html`
AGENTS.md                 Project conventions + invariants
CLAUDE.md                 Auto-loaded by Claude Code
NEXT.md                   Deferred work items
LAUNCH-RUNBOOK.md         Pre-deploy sanity sweep + playbook
PROJECT-SYNOPSIS.md       Shorter handoff briefing
```

## Conventions to follow

- **Comments explain WHY, not WHAT.** Especially for non-obvious
  decisions. Mull's existing code has generous WHY-comments; match
  that voice.
- **Don't curse, don't use emojis** in code or comments unless
  specifically asked.
- **TypeScript strict mode.** `any` is rare; explicit types on
  RLS-scoped queries via `.returns<T[]>()`.
- **All inputs ≥ 16px font** on mobile (prevents iOS focus-zoom).
- **Editorial 720–760px column widths** for text-heavy pages. The
  modernization should keep this — the goal is to add motion and
  polish within the editorial structure, not abandon it.
- **The H1 + lede + daily-wisdom on the homepage share a single
  rag-right edge.** Don't add max-widths that break this when
  migrating mull.html.

## Suggested first prompt for Claude Code

> Read REDESIGN-HANDOFF.md, NEXT.md, AGENTS.md, and CLAUDE.md to get
> the project context. We're on the `redesign-2026` branch. Today is
> Day 1 of the redesign. Begin Phase 1: install dependencies
> (tailwindcss, framer-motion, R3F, drei, clsx, tailwind-merge),
> initialize Tailwind alongside existing inline styles, create
> `lib/design-tokens.ts` and `lib/motion-tokens.ts`, and build
> reusable motion primitives. Don't touch any existing visible
> surfaces yet — strictly additive work. Stop when foundation is in
> place and I can review.

---

## A note on the transition

You're picking up from a prior Cowork conversation that ran from
~May 12, 2026. The user (Jimmy) is a non-coder who builds Mull as a
passion project — he can paste terminal commands and review code
visually but doesn't write code himself. Communicate accordingly:
explain trade-offs without excessive jargon, give concrete diffs
rather than handwave-y descriptions, paste-ready terminal commands
when terminal action is needed.

Mull's launch was scheduled for May 12, 2026 7 PM London but Jimmy
decided to delay — the redesign comes first, then a relaunch. Take
your time on craft.
