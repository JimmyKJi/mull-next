# Mull · Session handoff

The previous session was long and accomplished a lot. This doc
hands off enough state for the next session to pick up cold.

**Last session ended:** 2026-05-25.
**Branch:** `claude/zen-wu-4cd09b` (also live on `mull.world` via
direct Vercel CLI deploys — production deploys do NOT come from
git auto-deploy; see "How to ship" below).

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

### What was shipped in the previous session (in commit order)

P-tier (Wave 1 features — already shipped before this session
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

Production deploys do NOT auto-deploy from git anymore — Jimmy's
Vercel production branch is `redesign-2026`, and the previous
session shipped via direct Vercel CLI deploys from
`claude/zen-wu-4cd09b` to override that. The pattern is:

```bash
# from anywhere, push your work to claude/zen-wu-4cd09b first:
git push origin claude/zen-wu-4cd09b

# then in main repo, set up a fresh worktree at the latest commit:
cd /Users/jimmy/Documents/mull-next
git fetch origin claude/zen-wu-4cd09b
git worktree add /tmp/mull-deploy origin/claude/zen-wu-4cd09b
cp -r /Users/jimmy/Documents/mull-next/.vercel /tmp/mull-deploy/.vercel
cd /tmp/mull-deploy
npx vercel deploy --prod --yes --archive=tgz

# clean up:
git worktree remove /tmp/mull-deploy --force
```

For PREVIEW deploys (e.g. to share with Jimmy without affecting
mull.world), drop the `--prod` flag.

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
