# Mull · Design direction (v3: pixel-game world)

**v3 (2026-05-14): pivoted to a deliberate 8-bit pixel-art aesthetic.**
The reasoning: Mull's thesis is "for the curious, not the credentialed
— philosophy made accessible." A playful, game-like aesthetic actually
*serves* that thesis; "editorial-restrained" was the academic tone the
brand explicitly rejects. The literal pivot moment was Jimmy's note:
"if the general public is captivated by something fun, why gatekeep
philosophy and continue unnecessary seriousness."

(v2 — editorial Cormorant + 3D R3F constellation — landed the
constellation but felt thin everywhere else. Files preserved in git
history; the pivot below replaces the visual layer wholesale while
keeping all data, copy, and infrastructure.)

## What we keep

- **Brand palette base**: cream `#FAF6EC` + ink `#221E18` + warm
  amber `#B8862F` + deep amber `#8C6520`. Translates surprisingly
  well to 8-bit (think Game Boy + warm-tones).
- **Per-archetype accents** (10 hues from `lib/archetype-colors.ts`)
  remain — used as palette swaps for sprites.
- **Product**: 16-D model, 10 archetypes, 560 philosophers.
- **Copy**: every line in mull.html (hero, lede, archetype prose,
  quiz questions, dilemmas, daily wisdom) stays.
- **Infrastructure**: Supabase tables, RLS, auth, OG generation,
  Vercel cron — reuse what exists.
- **Cormorant Garamond** is *retained* — but only for the long-form
  editorial body inside the archetype/philosopher essay pages.
  Rationale: the killer combo is pixel-game *chrome* containing
  *library-book content* — like opening an old leather-bound book
  inside a JRPG. Cormorant lives inside that beat. Everywhere else
  uses pixel typography.

## The bar

"Modern, interactive, fun." Reference points I'm aiming at:

- **Stardew Valley / Octopath Traveler** — pixel art done with real
  craft, not "amateur retro." Every sprite considered, the world
  feels lived-in. *That* level of execution.
- **Loot-drop.io** (Jimmy's seed) — playful info-density, character-
  driven, dark humor adjacent.
- **Pixel art philosophy / educational JRPGs** — the rare game that
  treats serious ideas with affection rather than reverence.
- **Chillquarium / Cookie Clicker / The Lobotomy Corporation** —
  pixel UI that rewards exploration without explaining itself.

What this is NOT:
- Not "amateur pixel art" or stock retro assets — every sprite is
  hand-considered.
- Not chiptune-on-loop noise — sound is opt-in, used sparingly.
- Not gamification-for-engagement-metrics — the playful chrome
  is in service of *making philosophy approachable*, not making
  the user click more.

## Design principles (v3)

1. **Pixel-game world, library-book content.** UI chrome — buttons,
   nav, panels, transitions, tooltips — is chunky 8-bit pixel art.
   Long-form content (archetype essays, philosopher entries) is
   *editorial Cormorant inside a pixel window*. The contrast is
   the brand.

2. **Restrained palette.** Six colors max in any view: cream,
   ink, warm amber, deep amber, plus 1-2 archetype accents when
   relevant. Limited palette is what makes pixel art read as
   intentional rather than amateurish.

3. **Crisp, never blurred.** `image-rendering: pixelated` on every
   sprite. No anti-aliasing on small text or sprite edges.
   Animations snap on a beat (16ms intervals, not smooth lerps).

4. **Discoverable, not gamified.** No XP bars, no streaks-as-
   pressure, no FOMO. The pixel chrome invites exploration; the
   *content* rewards it. The user can ignore every game-like
   affordance and still get the philosophical map.

5. **Per-surface craft.** Homepage, constellation, quiz, result,
   archetype detail, philosopher detail each get their own
   pixel-scene treatment. Not one template five times.

6. **Mobile-first but laptop-glorious.** Pixel art scales cleanly
   to any viewport (no responsive image headaches). Mobile gets
   touch-tap-zoom on the constellation; desktop gets keyboard
   shortcuts and richer overlays.

7. **Cheap to run.** Pixel SVG/canvas is *lighter* than R3F.
   We can probably ship the whole homepage under 100KB of JS.
   No more dev-server crashes — `npm run preview` is the gold
   path for viewing.

## Visual language tokens

### Typography
- **`Press Start 2P`** (Google Font) — pixel display face. Used
  sparingly: page titles ("MULL"), section labels ("THE MAP"),
  small UI captions. Hard pixel forms.
- **`VT323`** (Google Font) — pixel monospace, but readable at
  body size. Used for in-game text: hover tooltips, button
  labels, quiz prompts, philosopher names in the constellation
  legend.
- **`Cormorant Garamond`** — kept *only* for the long-form
  essays inside the archetype/philosopher detail pages. The
  "library book inside the game" beat.

### Color
Hex — keep these as the only colors in `chrome` views:
```
Cream      #FAF6EC   page background
Ink        #221E18   primary text + dark UI panels
Amber      #B8862F   accent highlights, button fills
Amber-deep #8C6520   text on amber, button hover
Amber-soft #F8EDC8   panel backgrounds, soft halos
Line       #D6CDB6   borders, dividers
```
Plus the 10 per-archetype palettes (already in
`lib/archetype-colors.ts`) used as palette swaps for sprites.

### Sprite spec
- 64×64 sprites for archetype mascots
- 16×16 or 32×32 for philosopher avatars (procedural by name hash)
- 8-pixel borders on UI panels (chunky)
- 2-pixel borders on small chips
- `image-rendering: pixelated` everywhere
- No drop-shadow blurs — use a hard 4-pixel offset shadow instead

## The five surfaces (v3)

### 1. Home
Pixel-game opening screen. Wordmark "MULL" in `Press Start 2P` 96px.
Hero block frames the quiz CTA inside a pixel "dialog box" border.
Today's thinker becomes a "scroll" pixel artifact pinned in the
margin. Below: a 2D pixel "philosophical realm" overworld
(constellation, see #2). Then the ten archetype tiles as 64×64
sprite cards. CTA: a chunky pixel button "▶ BEGIN THE QUIZ".

### 2. Constellation (the philosophical realm)
2D pixel overworld. 560 philosophers as small colored sprites
scattered on a pixel grid. The plane represents abstract↔embodied
× sovereign↔communal. Drag to pan, scroll to zoom. Hover any
sprite → pixel-bordered tooltip with name, dates, key idea, and
their archetype tag. Click → opens their philosopher page.
Sidebar with pixel-style toggles for each archetype (show/solo/all).
After the quiz, the user's avatar appears as a sprite in the
realm with a "YOU" pixel label and a pulsing halo.

(R3F 3D version retired — 2D pixel reads as more on-theme and
ships in <50KB instead of 500KB.)

### 3. Quiz
Each question is a pixel "scene". Generous Cormorant prompt INSIDE
a pixel dialog window. Answer choices as pixel buttons that "press"
on click (1-pixel offset). Per-question micro-sprites themed to
the prompt (e.g. a tiny pixel skull for the dying-friend question,
a pixel scale for the trolley problem). Chapter pagination — every
5 questions a transition scene says "CHAPTER 2: TRUTH" with a
themed sprite, then continues. No progress bar; the chapter
counter is the rhythm.

### 4. Result
"YOU ARE THE [ARCHETYPE]." Pixel-game victory screen vibe — the
archetype's mascot sprite springs into the center on a chunky
animation. The user's stats appear as a pixel radar chart of
their 16-D fingerprint (literally drawn in pixels). Three nearest
philosophers as pixel cards "appearing" beside the user. The
constellation overworld is embedded with the user-sprite placed
in it. Tail: chunky pixel buttons — "READ THE ESSAY", "RETAKE
QUIZ", "SAVE PROGRESS".

### 5. Archetype / philosopher detail
This is the "library book inside the game" beat. Page header is
pixel chrome (archetype mascot sprite, archetype name in
`Press Start 2P`), then opens to a long-scroll editorial essay in
**Cormorant Garamond** — generous body text, real serif elegance.
At the bottom: pixel UI for the kindred-thinkers list and the
reading list. Pulled quotes get a pixel "scroll" frame.

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
