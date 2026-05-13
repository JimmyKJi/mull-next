# Mull · Design direction (v2 redesign)

The v1 redesign was scrapped on 2026-05-13 — the result felt timid
relative to the bar Jimmy wants, and the dev experience was crashing
his laptop. This doc is the framing for v2 so we agree on direction
before building.

## What we keep

- **Brand**: cream + warm editorial palette, deep amber accents,
  Cormorant Garamond italic for display moments.
- **Product**: 16-D model, 10 archetypes, 560 philosophers.
- **Copy**: every line in mull.html (hero, lede, archetype prose,
  quiz questions, dilemmas, daily wisdom) stays.
- **Infrastructure**: Supabase tables, RLS, auth, OG generation,
  Vercel cron — reuse what exists.

## The bar

"Top tier modern and interactive." Reference points I'm aiming at:

- **The Pudding** — long-scroll data essays. Type-driven, image-light,
  occasional interactive widgets that genuinely earn their place.
- **Stripe Press** — texture, weight, generous whitespace, the sense
  of having been *designed* rather than templated.
- **Are.na** — library/archive feeling. The site reads as a place to
  spend time, not a tool to spend time *with*.
- **Apple Newsroom / Books** — cinematic scroll-driven reveals when
  they matter, restraint everywhere else.

What "top tier" does NOT mean for Mull:
- Not a SaaS marketing site with parallax stock photos.
- Not a flashy product launch microsite.
- Not animation-for-animation's-sake.

## Design principles

1. **Editorial-first, app-second.** The writing is the soul. The
   product happens to be interactive. The site should read like a
   thoughtful publication that lets you take a quiz inside it, not
   a SaaS app with prose decoration.

2. **Restrained but precise motion.** Every animation has a reason.
   Cream→night reads as "entering thought-space." A figure rising
   reads as "the person becoming visible." If we can't articulate
   what a piece of motion is *saying*, it's wrong.

3. **Generous typography.** Cormorant Garamond italic at display
   sizes (60–100px). Body text in a quality sans (Inter or system),
   real attention to leading (1.5–1.6 for body, 1.05–1.15 for
   display), letter-tracking deliberate.

4. **Color discipline.** Cream (`#FAF6EC`) + deep ink (`#221E18`) +
   warm amber (`#B8862F` / `#8C6520`) are the whole palette for
   chrome. Per-archetype accents (10 hues from
   `lib/archetype-colors.ts`) used only on archetype and result
   surfaces, never as global chrome.

5. **Per-page craft.** Homepage, quiz, result, archetype detail,
   philosopher detail each deserve their own aesthetic treatment.
   Not one template five times.

6. **Mobile-first but laptop-glorious.** Mull's growth is IG/TikTok
   shares — phone is the primary surface. Desktop should reward the
   bigger viewport with bigger interactions (constellation rotation,
   richer typography, more whitespace) but never *require* them.

7. **Cheap to run.** Server-render where possible. Lazy-load anything
   heavy (R3F, large client bundles). The dev experience should not
   crash a laptop. Production bundle should ship under 200KB of JS
   on the homepage, no exceptions.

## The five surfaces

### 1. Home
Editorial landing. Big H1 in italic Cormorant ("Find your place on
the map of how you think"), generous lede, today's philosopher quote
as a pull-out, single primary CTA into the quiz, a quiet preview of
the ten archetypes, footer.

What makes it top-tier: typographic richness (real hierarchy, real
breathing room), a *subtle* ambient texture (paper grain or soft
gradient drift, no parallax stock animation), and the constellation
hero — discussed below.

### 2. Constellation (the map)
The piece v1 didn't deliver. 560 philosopher positions projected from
16-D to 2-D via PCA, drifting slowly. Hover any → name + key idea +
their archetype. Click → /philosopher/[slug]. After the quiz the
user's own point appears, the surrounding philosophers brighten, and
the rest dim — *that* is the result.

Implementation: SVG or Canvas 2D for v2. Three.js / R3F only if and
when the 2D version stops feeling enough. Lighter, faster, simpler
to reason about.

### 3. Quiz
Single question at a time. Each question is its own moment — minimal
chrome, generous prompt, answer cards that feel like deliberate
choices rather than radio buttons. A faint progress dot, not a bar.
No-go: bouncy progress animation, "Continue →" sound effects, any
gamification beyond the actual moral seriousness of the prompts.

### 4. Result
"Here is where you sit." The constellation re-renders with the user's
point. Three closest philosophers introduce themselves through their
key ideas. The matched archetype is named — italic, generous — with
its short spirit phrase. A walking tour of why this archetype (the
dimensions you share, the runner-up, the productive tensions). At
the bottom: archetype essay, retake, save/sign-up CTA.

Motion: deliberate but not cinematic-overwrought. The user's point
fading into view in the constellation is the magic moment; everything
else is editorial revealing.

### 5. Archetype / philosopher detail
Long-scroll essays. The kind of polish you'd expect from a Pudding
or Stripe Press article — pulled quotes, an embedded
"fingerprint" (16-D vector visualization) for the philosopher pages,
a reading list at the bottom. Already exist as routes in `/archetype`
and `/philosopher` — restyle, don't rebuild.

## Build order

1. **Homepage shell** — server-rendered, no heavy JS, working on
   first paint. This is the slice we land first and stop on to
   review.
2. **Quiz flow** — single-question UI, sessionStorage resume,
   handoff to /result via URL-encoded vector.
3. **Result page** — vector decode + archetype match + the walking
   tour. Constellation embed is added once the constellation exists.
4. **Constellation widget** — 2D Canvas / SVG. Mountable on home
   (drifting decorative) and on result (your-point-here).
5. **Archetype + philosopher restyle** — typography + layout pass.
6. **Cutover** — flip the `/` rewrite, delete mull.html.

Each step lands as its own commit + review. No more "build five
things and hope they all land" — too easy to be off-direction five
ways at once.

## How to view (without crashing the laptop)

```
npm run preview     # build once, serve at localhost:3000
```

This is what we use during the redesign. `npm run dev` is for
active editing only; the file watcher + Turbopack are heavy with
this size of project.

When dev mode is needed for HMR:
```
npm run dev:webpack    # legacy webpack, lighter on RAM
```
