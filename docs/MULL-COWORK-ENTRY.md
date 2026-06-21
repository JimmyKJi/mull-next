# Mull · Cowork orientation

**One-file entry point for any cowork agent picking up work on Mull.**
Lives at `/Users/jimmy/Documents/mull-next/MULL-COWORK-ENTRY.md`
(synced to main repo so cowork can read it directly without
worktree access).

---

## What Mull is, in one sentence

A philosophical mapping app — take a quiz, get placed in a
16-dimensional space among 551 philosophers, then explore
yourself through 15+ practice surfaces (debate, daily action,
weekly question, 30-day archetype-personalized course, etc.).
Built solo by Jimmy Ji, philosophy student at King's College
London. Free, ad-free, no data sale. Live at **mull.world**.

---

## Read these IN ORDER for full orientation

All four files live in `/Users/jimmy/Documents/mull-next/`:

1. **`PROJECT-FOR-COWORK.md`** (~430 lines) — the canonical
   product description. Every surface, the brand, the audiences,
   the economics, the campaign angles. Read this first.
2. **`SESSION-HANDOFF.md`** (~470 lines) — what shipped recently
   and where the state of the world is. The most recent session
   logged at the top.
3. **`RETENTION-NOTES.md`** (~700 lines) — retention strategy and
   the full pool of 20+ feature ideas with cadence map. Reference
   only — built features are already in PROJECT-FOR-COWORK.md.
4. **`NEXT.md`** (~varies) — small backlog of deferred items +
   the translation strategy decision. Skim if relevant.

Optional deeper reading:
- **`AGENTS.md`** / **`CLAUDE.md`** — project rules (user-scoped
  tables, generator-owned blocks, archetype targets). Required
  reading before touching code.
- **`STYLE-GUIDE.md`** — operational design spec with
  anti-patterns. Required reading before touching UI.
- **`DESIGN-DIRECTION.md`** — the *why* behind the brand.

---

## At a glance — what's live on mull.world

### Tier 1 — entry points (what the homepage leads with)
- **The Inheritor** (`/quiz/journey`) — country-house **murder
  mystery** as quiz. Two twists, ten archetype-keyed endings.
- **The classic quiz** (`/quiz?mode=quick`) — 20 questions, 5 min.
- **The Arena** (`/arena`) — debate philosophers, Elo, judged.

### Tier 2 — recurring rhythms (retention surfaces)
- **Daily Spar** (`/spar`) — 5-min argument practice, one turn
  each, Sonnet judges.
- **The Pilgrimage** (`/pilgrimage`) — 30-day archetype-
  personalized course.
- **The Crucible** (`/crucible`) — daily real-world action +
  tomorrow's check-in.
- **The Wandering Question** (`/wandering`) — one question per
  week across 4 beats.
- **Today's Dilemma** (`/dilemma`) — daily philosophical scenario.

### Tier 3 — persistent surfaces (dopamine spine)
- **Capability Atlas** (`/atlas`) — six skills (Rigor, Depth,
  Consistency, Range, Self-Awareness, Synthesis), live XP +
  level-ups via the Stardew-style toast in `<CapabilityToast>`.
- **Personal Anthology** (`/anthology`) — commonplace book.
- **Year-in-View** (`/year`) — always-updating annual page.
- **Argument Diary** (`/argument-diary`) — log real arguments,
  get Haiku-powered analysis.

### Tier 4 — explore
- **The Map** (`/map`), **551 philosophers** (`/philosopher`),
  **10 archetypes** (`/archetype`), **topic explainers**
  (`/topic`), **54 vs matchups** (`/vs`).

### Tier 5 — coming soon (scaffolded)
- `/read` (Reading Hour), `/letters` (Letters Between Inheritors),
  `/arena/open` (Mull Open quarterly tournament), `/long-letter`
  (Long Letter, 5-year vault).

---

## Economics + gating (campaign-relevant)

**Per-use AI cost:**
- Arena debate: ~$0.15–0.20
- Daily Spar: ~$0.05–0.08
- Argument Diary: ~$0.005–0.01
- Daily Dilemma / Diary / Exercise: ~$0.005
- Yearly retrospective (Mull+): ~$0.30–0.50
- Inheritor / Pilgrimage / Crucible / Wandering / Atlas /
  Anthology / Year-in-View: **$0** (deterministic)

**Monthly cost at scale (AI + infra combined):**
- 100 MAU → ~$70 | 1,000 MAU → ~$720 | 10,000 MAU → ~$7,200

**Free vs Mull+ (planned, Stripe wired but dormant):**
- Free: unlimited everything contemplative + 1 Spar/day + 1
  Arena/day + 3 Argument Diary/week.
- Mull+ ($4.99/mo, $29/yr, $59 lifetime): 5 Spars/day,
  unlimited Arena + Argument Diary, Reading Hour + Long Letter
  + Mull Open when built.

**Don't sell paid tier in any campaign.** Stripe is dormant.
The Ko-fi tip jar is currently switched off (legal hold on
accepting tips), so there is no active ask right now. The full
economics table is on
the live `/about` page if cowork wants to reference it.

---

## Brand voice (campaign-shaping)

- **Plain, sharp, never saccharine.** Names cost honestly
  ("each Arena verdict costs about 15¢ in AI fees").
- **Not academic.** No Latin without translation, no
  signaling-erudite vocabulary.
- **Pixel-game world, library-book content.** UI in chunky 8-bit
  pixel chrome (Press Start 2P + Pixelify Sans). Long-form prose
  in Cormorant Garamond inside that chrome — the "leather book
  inside a JRPG" beat.
- **Anti-references:** shadcn soft shadows, Aceternity glows,
  Inter-clone SaaS aesthetic, "Welcome back!" warmth.
- **Honest about AI.** Mull uses AI in 5 bounded places
  (Arena/Spar judging, prose→vector for dilemma/diary/exercise,
  philosopher voices, Argument Diary analysis, yearly
  retrospective). The model itself — 16-D, archetypes, 551
  philosopher positions, the quiz — is hand-designed.

---

## Target audiences

1. **Philosophy curious** — undergrads, autodidocts, ex-majors.
   r/philosophy, r/askphilosophy, Daily Nous, podcast listeners.
2. **MBTI/personality-test refugees** — people who want a quiz
   that doesn't insult their intelligence.
3. **Intellectual content creators** — newsletter writers,
   "thoughtful explainer" YouTubers, educators.
4. **"Interested but academia is exhausting"** — left philosophy
   after one course; still finds the questions interesting.
5. **Academic philosophers (secondary)** — Arena especially as a
   teaching tool.

---

## What the agent can ASSUME

- Mull is live at https://mull.world.
- All surfaces listed in Tier 1–4 above work. Verify in
  incognito if uncertain about anything specific.
- Stripe is wired but NOT exposed. Don't reference paid tier in
  campaign content unless explicitly told otherwise.
- The maintainer (Jimmy Ji) reads every campaign post before it
  ships. Any open question can be queued for him at the end of
  your work session.

## What to flag back

The maintainer has open questions captured in
`PROJECT-FOR-COWORK.md` §"Open campaign questions Jimmy hasn't
decided" — surface these to him if any campaign path forces a
decision.

---

*Maintained by Jimmy Ji
(<a href="mailto:jimmy.kaian.ji@gmail.com">jimmy.kaian.ji@gmail.com</a>).
Last updated 2026-05-25; corrected 2026-06-20 (corpus is 551; Ko-fi
tipping currently paused pending a legal question).*
