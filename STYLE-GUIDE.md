# Mull · Style Guide

The concrete operational spec for ongoing UI work. Pair with
`DESIGN-DIRECTION.md` (which explains the **why**); this doc covers
the **how** — exact values, conventions, and patterns to reach for
when building any new surface.

If a decision has been made anywhere in the codebase that contradicts
this guide, the guide is the source of truth. Update the code, not the
guide.

---

## 1. Brand identity

### Wordmark + mark

```tsx
import MullWordmark from '@/components/mull-wordmark';
import { MullMark } from '@/components/mull-mark';
```

The wordmark `<MullWordmark />` now defaults to `withMark={true}` —
the glyph sits to the left of the "Mull." text. Use the bare `<MullMark
/>` for tight surfaces (favicon, share avatars, badge centers).

| Surface | Use |
|---|---|
| Site header (every page) | `<MullWordmark />` (default size md, with mark) |
| Page-internal back-link | `<MullWordmark size="sm" />` |
| Share card hero | `<MullWordmark size="lg" />` |
| Favicon / app icon | `<MullMark size={32} />` |
| Single-color contexts (print, dark-only) | `<MullMark variant="mono" />` |

**Never** render the wordmark in a font other than Cormorant Garamond.
**Never** alter the amber period color (`#B8862F`). The mark is
allowed to scale to any size but always uses the integer-grid SVG
positions defined in `components/mull-mark.tsx` — do not stretch or
distort.

---

## 2. Color palette

Six chrome colors + 10 archetype accents + a small set of semantic
colors. No additions without a deliberate reason.

### Chrome (used everywhere)

| Token | Hex | Use |
|---|---|---|
| Cream | `#FAF6EC` | Page background, soft fills |
| Cream-paper | `#FFFCF4` | Card backgrounds (one step warmer than page bg) |
| Ink | `#221E18` | Primary text, borders, dark UI panels |
| Ink-soft | `#1A1820` | Theatre-immersion backgrounds (Inheritor) |
| Amber | `#B8862F` | Accent highlights, drop-shadow color #1 |
| Amber-deep | `#8C6520` | Text on amber, eyebrow labels |
| Amber-bright | `#F8C75E` | Primary CTA button fills, "you" accent |
| Amber-soft | `#F8EDC8` | Panel backgrounds, "you've picked this" highlight |
| Line | `#D6CDB6` | Dividers, hairlines, dashed borders |

### Semantic colors

| Token | Hex | Use |
|---|---|---|
| Teal | `#2F5D5C` | Success state, "your turn" emphasis, ELO-positive |
| Teal-soft | `#E5F0EE` | Success card background |
| Brick | `#7A2E2E` | Danger, error state, ELO-negative, "lock" indicators |
| Brick-soft | `#F5E0E0` | Error card background |
| Forest | `#4F5A26` | Editorial accent (rare — only on certain content pages) |

### Archetype accents

Defined in `lib/archetype-colors.ts`. Each archetype has 4 values:
`primary`, `deep`, `soft`, `accent`. Use these only for **archetype-
specific** surfaces — sprite tinting, archetype-detail pages,
constellation positions. Never use an archetype color for chrome
(e.g. don't make a button "garden-green" just because).

### Rules

- Maximum **six** colors visible in any one view (chrome + ≤2
  archetype accents when relevant).
- Never introduce a new color without updating this guide.
- Hover/focus states modify opacity or swap between palette entries
  (e.g. amber → amber-deep). No mid-tone interpolation.

---

## 3. Typography

Five faces, five roles. No others.

| CSS variable | Face | Role |
|---|---|---|
| `--font-pixel-display` | Press Start 2P | Tiny labels, page titles, button text, eyebrow chips |
| `--font-pixel-body` | VT323 | In-game body text, tooltips |
| `--font-prose` | **Pixelify Sans** | **DEFAULT body font sitewide** — pixel-styled sans-serif, readable at body sizes, reads as "of the pixel-game world". Use this for almost everything that isn't a chunky label. |
| `--font-editorial` | Cormorant Garamond | **Opt-in** for long-form editorial essays — archetype detail, philosopher detail, /about, /methodology, /topic, /vs pages. The "library book inside the game" beat. |
| `--font-lora` | Lora | Legacy — kept available but no longer the default. Pages that opted into Lora keep working; new surfaces use --font-prose. |

**The 2026-05-24 swap**: previously Cormorant Garamond was the
default for almost all body text. It clashed with the pixel chrome
on most surfaces — felt like "editorial book inside a game" rather
than "pixel game text". Pixelify Sans was added as the bridge: still
clearly pixel-themed, but readable for body prose. Cormorant stays
ONLY for the deliberate "library book" pages where the contrast IS
the design point.

### Scale (px)

| Use | Pixel display | Body serif | Editorial Cormorant |
|---|---|---|---|
| Eyebrow / chip | 9-11 | — | — |
| Section label | 12-14 | — | — |
| Page title (H1) | 22-32 | — | — |
| Body | — | 16 | 17-18 |
| Lead paragraph | — | 18-19 | 19-20 |
| Big subtitle | — | — | 22-26 |

### Rules

- **Never mix pixel + serif on the same line.** They clash. Pixel goes
  in label/chip slots; serif goes in body slots; the two appear
  vertically stacked never side-by-side.
- Prefer **Lora over Cormorant for body** on new surfaces. Cormorant
  is reserved for the long editorial essays on archetype and
  philosopher detail pages.
- Pixel-display text is **always** uppercase with `letterSpacing:
  '0.18em' – '0.22em'`. Sentence case in pixel is forbidden.
- Italics inline by literal asterisks: `*text*` → `<em>` (see the
  `italicizeMarkers` helper in the journey engine). Don't ship `<i>`
  tags by hand.

---

## 4. Spacing scale

Use these values. Don't invent new ones.

```
4, 6, 8, 10, 12, 14, 16, 18, 22, 26, 30, 36, 48
```

Component-internal padding (button, card) tends to live in
`12-18` range. Section spacing (between large blocks) tends to live
in `22-36`. Page-level top spacing (hero-to-content) lives at `48`.

Tailwind utilities map directly:
- `gap-2` (8) for tight chip groups
- `gap-3` (12) for choice cards
- `gap-4` (16) for cards in a grid
- `gap-6` (24) — avoid; use `5` (20) or `7` (28)

---

## 5. Borders + shadows

The single most identifying visual mark of Mull. Get this right and
the page feels Mull-shaped instantly.

### Border weights

| Weight | Use |
|---|---|
| `2px` | Small chips, dashed twist-clue panels, optional accents |
| `3px` | Default for buttons + cards + content panels |
| `4px` | Page-level container cards, hero cards |
| `5px` | The Arena verdict banner only |

**Always solid, always ink-dark (`#221E18`).** Other colors get used
for shadows, never borders. Exceptions:
- Brick (`#7A2E2E`) borders on error states + locked-opponent cards
- Amber (`#B8862F`) borders on the dark-panel epilogue cards
- Dashed borders for "interesting" content (twist clues, silence
  options) in matching accent color

### Shadow rule

Every card with `border: 3px+ solid #221E18` gets a hard offset shadow
in one of these colors:

| Shadow color | When |
|---|---|
| Amber `#B8862F` | Default, neutral content |
| Teal `#2F5D5C` | Selected, success state, "your turn" |
| Brick `#7A2E2E` | Danger, error |
| Ink `#221E18` | High-contrast, "PRESS START" energy (rare) |

```css
boxShadow: '3px 3px 0 0 #B8862F'  /* small cards */
boxShadow: '4px 4px 0 0 #B8862F'  /* medium cards */
boxShadow: '5px 5px 0 0 #B8862F'  /* page hero cards */
boxShadow: '6px 6px 0 0 #B8862F'  /* big container cards */
```

**Never** use `blur` on shadows. **Never** use `rgba()` shadows. The
shadow is a flat block, not a blur.

---

## 6. Animations

Keep them chunky, never silky.

| Pattern | Use |
|---|---|
| `transition: transform 80ms steps(2, end)` | Button hover, card hover (the "press" feel) |
| `transition: background 120ms ease` | Color swaps on hover |
| `transition: opacity 220ms ease` | Fading in/out the dimmed Arena choices after a pick |
| No animation | Default — most things shouldn't animate |

**Never** use cubic-bezier easings beyond `ease`. **Never** add Framer
Motion / GSAP / Aceternity animations to chrome surfaces; the visual
language is steps()-based on purpose.

The `pixel-press` utility class (in `globals.css`) is the canonical
hover behavior for clickable cards. Use it; don't reinvent.

---

## 7. Component patterns

### Buttons

Three variants. Don't invent more.

| Variant | Use | Implementation |
|---|---|---|
| Primary (amber-bright fill) | The single most important action on a page | `pixel-button pixel-button--amber` |
| Ghost (transparent fill, ink border) | Secondary actions, "or do this instead" | `pixel-button pixel-button--ghost` |
| Diegetic link (small underlined pixel-text) | Bail-out from a narrative flow ("keep silent", "leave") | Inline, font: pixel, fontSize: 9-11, opacity: 0.75 |

Primary button text is **always** uppercase + leading `▶`.
Ghost button text is **always** uppercase + leading `▶` or `◂`.

### Cards

| Pattern | When |
|---|---|
| **Door card** | Major navigation choice (3-4 per page max) — see `DoorCard` in `app/arena/page.tsx` |
| **Choice card** | Multi-option selection in a flow (quiz answer, arena opponent, debate choice) |
| **History row** | Tabular-ish list of past items (Arena history, leaderboard) |
| **Stat tile** | Compact metric display (PvE Elo, debates count) |

All four share the same border/shadow conventions from §5.

### Headers

Every content page should have:
- A small back-link in the top-left (pixel, 11px, uppercase, `◂
  PARENT`)
- An optional `<PixelPageHeader>` with eyebrow + title + serif
  subtitle
- Generous space below before content starts (margin-bottom 24-32)

---

## 8. Scene illustrations

When a surface needs pictorial content (the Inheritor scenes, archetype
mascots, philosopher sprites):

### Two distinct styles

1. **Sepia flat illustration** (Inheritor chambers) — single iconic
   element on warm sepia ground, clean line work, single accent color.
   See `components/scene-illustration.tsx`.

2. **Procedural pixel sprite** (philosopher, archetype) — true
   pixel-art SVG, `image-rendering: pixelated`, generated from name
   hash. See `components/philosopher-sprite.tsx` and
   `components/archetype-sprite.tsx`.

Don't introduce a third style without writing a new section here.

### Don't

- Don't use stock illustrations.
- Don't generate AI images at runtime.
- Don't use gradient backgrounds in illustrations (the brand is flat).
- Don't drop glowing/glassmorphism effects into ANY surface.

---

## 9. Voice

The copy across Mull should read as written by one person. The
person:

- **Speaks plainly.** Sentences are short to medium. Em-dashes are
  used; semicolons are used; both sparingly.
- **Names the cost honestly.** "This costs about 15 cents per
  judgment" beats "powered by AI." When discussing money, say it.
- **Is not warm-bath therapeutic.** Mull respects the user enough to
  not pretend everything they do is brave.
- **Is not academic.** No "qua", no Latin without translation, no
  signaling-erudite vocabulary. The whole thesis is that philosophy
  is accessible.
- **Uses second person liberally** on personal surfaces (quiz,
  Inheritor, Arena composer). Third person for editorial (about,
  topic, philosopher).
- **Doesn't apologize for itself.** Mull is a real thing made on
  purpose. The copy reflects that.

### Common copy patterns

| Surface | Pattern |
|---|---|
| Eyebrow chip | `▸ THING` or `▶ THING · STATE` — always uppercase, pixel font |
| Page title | Uppercase pixel for game-y pages (Arena, Inheritor); serif H1 for editorial (about, philosopher) |
| Section label | `▸ SECTION NAME` — pixel, uppercase, letter-spaced |
| Empty state | A short italic serif line in amber-deep on a dashed-border card. NOT a friendly cartoon. |
| Error state | A short serif line on brick-tinted card with brick border. State what's wrong + how to fix. |

---

## 10. What we don't do

These are explicit anti-patterns. Don't add them even if a popular
component library suggests them.

| Anti-pattern | Why we reject it |
|---|---|
| Soft shadows (`box-shadow: 0 4px 12px rgba(...)`) | Flat hard shadows are the brand |
| Rounded corners on cards (`rounded-lg`, `rounded-xl`) | Square corners are the brand |
| Gradient meshes / glassmorphism / blur effects | We're not a 2024 SaaS startup |
| Toast notifications that auto-dismiss | Use inline alerts that the user dismisses |
| Modal overlays for primary content | Build a real page; modals are for dangerous confirmations only |
| Tooltips that obscure surrounding content | Inline disclosures via `<details>` instead |
| Hover-only interactions | Everything must work on touch + keyboard |
| Lottie animations | Pixel `steps()` animations only |
| Stock illustrations / generic emoji at large sizes | Pixel sprites only |
| "Modern" SaaS sans-serifs (Inter, Geist, etc.) on chrome | Pixel-display or serif. System sans only in dense data tables. |
| The phrase "Welcome back!" or anything similar | Don't perform warmth |

---

## 11. Mobile

The brand language was designed mobile-first. All cards, buttons, and
shadows scale cleanly to small viewports. Specific accommodations:

- Pixel-display titles drop one size step on viewports < 640px
- Door cards stack vertically (single column) below 640px
- Hero columns collapse below 1024px
- Touch targets minimum 44×44px
- No hover-only affordances

---

## 12. Process

When designing a new surface:

1. Read `DESIGN-DIRECTION.md` (the why) and this guide (the how).
2. Sketch the surface using only the tokens above. If you need a
   value that's not here, that's a signal — either you're solving
   the wrong problem or this guide needs updating.
3. Build it. Reach for `pixel-press`, `pixel-button--amber`,
   existing border/shadow values, the spacing scale, the four font
   variables.
4. Run the page in a browser. Does it look like Mull at a glance? If
   not, find the part that doesn't and adjust.
5. If you found a real exception that this guide should accommodate,
   propose the addition + edit this file in the same commit as the
   feature.

---

Last updated: 2026-05-24 after the v3+ polish pass (Lora added,
MullMark introduced, Arena shipped, Inheritor refined).
