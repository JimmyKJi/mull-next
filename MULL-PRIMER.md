# Mull — primer for another chat

Drop this into a fresh conversation and the model will have enough to
discuss Mull intelligently without needing the rest of the repo. Written
2026-05-27 — covers the product, the model, every surface, the brand
voice, the stack, the economics, and what's planned next.

If you want even more detail, ask the model to read:
- `PROJECT-FOR-COWORK.md` (long-form product description with sample
  social media angles)
- `STYLE-GUIDE.md` (design + voice rules)
- `DESIGN-DIRECTION.md` (why the brand looks the way it does)
- `NEXT.md` (current backlog, deferred items, strategic decisions)
- `CHANGELOG.md` (recent additions)

---

## TL;DR

**Mull is a philosophical mapping app.** You take a quiz; it places you
in a 16-dimensional space alongside 560 philosophers from across
history. From there you can read about the kind of mind you turned out
to be, browse the philosophers nearest you, debate them with an AI
judging your argument rigor, write through daily moral dilemmas, and
join a daily/weekly practice rhythm built around your archetype.

Built solo as a passion project by Jimmy Ji (philosophy student at
King's College London). Free to use; ad-free; no data sold; runs on
tips. Live at **https://mull.world**.

Not VC-funded. Not an "AI app." AI is used in specific bounded places
(Arena judging, daily dilemma analysis, retrospectives) but the model
itself — 16 dimensions, 10 archetypes, 560 philosophers, every quiz
question, every archetype essay — is hand-designed by humans who care
about getting philosophy right.

---

## The model (what makes the math non-arbitrary)

### 16 dimensions

Each rated 1–10 per person. These are the axes Mull uses to
characterise a worldview. Pairs that cluster across the dataset are
intentional — they aren't redundant, they're testing different
expressions of similar instincts.

- **TV — Tragic Vision** — tragedy and limit as central vs life as
  fundamentally workable
- **VA — Valuing Affirmation** — affirming life as it is vs qualifying
  the affirmation
- **WP — Will to Power** — shaping and self-overcoming vs acceptance
  or context
- **TR — Trust in Reason** — reasoned argument as the route to truth
  vs reason as one tool among many
- **TE — Trust in Experience** — lived/embodied experience as ground
  vs other sources of evidence
- **RT — Reverence for Tradition** — inherited practice as wisdom vs
  open to questioning it
- **MR — Mystical Reach** — open to mystical/apophatic depths vs
  staying within what reason can name
- **SR — Skeptical Reserve** — doubt and suspended judgment as
  discipline vs willing to commit
- **CE — Communal Embed** — self in community and relationship vs
  starting from the individual
- **SS — Sovereign Self** — individual as seat of moral authority vs
  embedded elsewhere
- **PO — Practical Orientation** — oriented to what helps life go
  well vs foregrounding other priorities
- **TD — Theoretical Depth** — understanding for its own sake vs what
  understanding is for
- **AT — Ascetic Tendency** — restraint and ascetic discipline vs
  less drawn to that path
- **ES — Embodied Senses** — trusts the body and senses vs more
  dualist or sceptical of them
- **UI — Universal Idealism** — reaches for universal moral
  principles vs weighs particular contexts more
- **SI — Self Illusion** — unified self as illusion vs self as more
  given

### 10 archetypes

Each archetype is a clustering centroid in 16-D space. Mull's quiz
places you somewhere in 16-D; the closest archetype centroid by
cosine similarity is your archetype. The flavour adjective (e.g.
"reverent Keel") comes from a second-order analysis of which
dimensions you exceed the archetype mean on.

- **The Cartographer** — patient mapper of how things fit. Spinoza,
  Parfit, Frege, Dennett.
- **The Keel** — what keeps the boat upright in any storm. Stoic
  practitioners. Marcus Aurelius, Epictetus, Seneca.
- **The Threshold** — at the edge of what language can hold.
  Apophatic mystics. Pseudo-Dionysius, Rumi, Eckhart, Nagarjuna.
- **The Pilgrim** — walking on, alone, with the question still open.
  Existentialists. Camus, Kierkegaard, Sartre, Heidegger.
- **The Touchstone** — what's true is what survives the test.
  Skeptics. Hume, Sextus Empiricus, Wittgenstein, Rorty.
- **The Hearth** — where what binds us across generations is kept
  warm. Confucian/Augustinian/communitarian. Confucius, Aquinas,
  Wendell Berry.
- **The Forge** — what is is not what must be. Builders + reformers.
  Mill, Wollstonecraft, Marx, Nussbaum.
- **The Hammer** — break what no longer serves. Sovereign-self
  iconoclasts. Nietzsche, Stirner, Goldman, Hitchens.
- **The Garden** — the good things this life offers, taken
  seriously. Epicurean + embodied. Epicurus, Montaigne, Mary Oliver.
- **The Lighthouse** — guides the long way by an unchanging
  reference. Rationalist idealists. Plato, Kant, Parfit, Korsgaard.

### 560 philosophers

Each placed in 16-D by careful reading of their actual writings.

- **Wave 1** (~166 entries): hand-curated, includes the historically
  central + non-Western canonical figures (Confucius, Buddha, Laozi,
  Mencius, Avicenna-equivalents, Nagarjuna, etc.)
- **Wave 2** (~386 entries): generated via `scripts/gen-philosophers.mjs`
  from tradition baselines + per-entry overrides. The script lives in
  the repo; the generated entries sit between `BEGIN gen-philosophers
  Wave 2` and `END gen-philosophers Wave 2` markers in
  `lib/philosophers.ts`.

The corpus is auditable. Two tooling scripts run mechanical checks:
- `scripts/check-philosopher-calibration.mjs` flags entries whose
  top-1 nearest-kin similarity is suspiciously low (isolation) or
  whose archetype margin is tiny (ambiguous). Loads
  `scripts/calibration-decisions.json` for human-reviewed verdicts
  and renders ✓ accepted / ⚠ review badges in the report.
- `scripts/run-persona-tests.mjs` exercises the quiz+classification
  end-to-end with 19 personas across three families (canonical / edge /
  paradox). Exits non-zero on canonical or edge failure.

---

## The product, surface by surface

### Tier 1 — signature surfaces (what defines the product)

**The Inheritor** (`/quiz/journey`) — a 15-minute interactive country-
house murder mystery. A reclusive philosopher (A. K. Wren) is found
dead in their estate. You are one of seven inheritors named in the
strange will — and the only one who came tonight. A silent servant
guides you through four chambers of the estate, each containing an
artifact from the deceased's life AND a small anomaly that doesn't
fit. As you investigate, you make choices about what you'd do in
each situation. Two unexpected twists. Ten archetype-keyed endings
— the conclusion of the mystery is also the reveal of who you are.

**The 5-min quiz** (`/quiz?mode=quick`) — same 16-D math, shorter
format, less story. 20 questions. For users who want their map
without the narrative.

**The 50-question detailed quiz** — most rigorous placement. Used by
serious-curious users who want a precise dimensional fingerprint.

**The Arena** (`/arena`) — "chess.com for philosophy."
- PvE: pick a philosopher (Marcus Aurelius, Nietzsche, Hannah
  Arendt, Confucius, Mill, etc.) and a topic. You write 1 turn,
  the philosopher writes 1 back (in their actual voice via Haiku),
  an impartial Sonnet judges on rigor + principle + engagement
  (NOT stance — taking either side is fine if the argument is
  sound). Verdict in ~30 seconds. Elo system tracks your rating
  over time.
- PvP: write a position, leave it as an open challenge, another
  user picks it up. Same judging.
- Calibration mode for first-time users.

### Tier 2 — explore

**The Map** (`/map`) — interactive 2D constellation of all 560
philosophers, plotted in the same 16-D space. Pan, zoom, hover any
point to see name + dates + key idea. After taking the quiz, your
own point appears with a pulsing halo so you can see kindred minds.

**The 10 archetypes** (`/archetype/[key]`) — long editorial essays
covering the archetype's spirit, what it gets right, where it
falters, day-in-the-life, kindred thinkers, reading list, common
mistakes (with antidotes), modern exemplars, tensions with other
archetypes, topics that cluster here, suggested exercises. Each
page is ~1500 words of curated content + cross-link gold.

**Today's dilemma** (`/dilemma`) — one philosophical scenario per
day. Optional written response analysed by Haiku and turned into
a small dimensional shift on your map. Daily ritual.

**Topic explainers + Vs matchups** (`/topic`, `/vs`) — 32 short
SEO-targeted topic essays (free will, stoicism, the trolley
problem, phenomenology, buddhism, daoism, problem of evil, etc.)
and 53 unique head-to-head philosopher comparison pages (Plato vs
Aristotle, Nietzsche vs Kant, Confucius vs Mencius, Foucault vs
Habermas, Buddha vs Nagarjuna, bell hooks vs Audre Lorde). Each
auto-generates "where they sharply disagreed" + "where they
overlapped" sections from their actual 16-D vectors. Index pages
group by theme with daily-rotating featured cards.

**560 philosopher profiles** (`/philosopher/[slug]`) — each shows
the key idea, the dimensional fingerprint, the nearest 6 kindred
minds, topics where they figure, vs matchups featuring them, and
suggested exercises. The 22 most-searched philosophers (Plato,
Aristotle, Nietzsche, Kant, Sartre, Marx, Confucius, Buddha,
Hume, Descartes, Spinoza, Augustine, Aquinas, Wittgenstein,
Heidegger, Laozi, Rousseau, Hobbes, Locke, Camus, Schopenhauer,
Kierkegaard) also get 200-400 words of hand-written editorial
prose. Plus FAQ JSON-LD schema for Google rich-result eligibility.

### Tier 3 — retention rhythms

These are the surfaces that bring users back. Each fires events
into the Capability Atlas (six skills, visible Stardew-style
level-up toasts).

- **Daily Spar** (`/spar`) — 5-min argument practice. One rotating
  philosopher + topic per day. One turn each, Sonnet judges. Faster
  on-ramp than the Arena.
- **The Pilgrimage** (`/pilgrimage`) — 30-day archetype-keyed
  course. Each of the 10 archetypes has its own arc with per-flavour
  enrolment lens. The biggest single retention bet.
- **The Crucible** (`/crucible`) — daily real-world action. 60-prompt
  pool, rotates daily. Tomorrow Mull asks how it went. Stoic
  evening-review meets daily moral practice.
- **The Wandering Question** (`/wandering`) — 52 questions, one per
  ISO week, across 4 beats (Mon Start / Wed Kindred / Fri Far /
  Sun Synthesis).
- **Argument Diary** (`/argument-diary`) — log a real argument, get
  a Haiku-powered analysis (steelman of the other side, 2 fallacies
  in your framing, 3 kindred philosophers' takes).
- **Personal Anthology** (`/anthology`) — your commonplace book.
  Save passages from Spar verdicts, Argument Diary takes,
  philosopher pages. Grouped by source.
- **Capability Atlas** (`/atlas`) — your six skills (Rigor, Depth,
  Consistency, Range, Self-Awareness, Synthesis). Every action
  fires XP events; Stardew-style "+3 RIGOR" toasts pop on
  completion. The dopamine spine.
- **Year-in-View** (`/year`) — always-updating annual page. 12×6
  month/skill heatmap.
- **Diary** (`/diary`) — personal philosophical journal.
- **Today's Dilemma** also fits here (cross-listed).
- **Exercises** (`/exercises`) — 36 contemplative + logic + argument
  practices, each with a featured-of-the-day card on the index +
  per-card duration chip (Quick / Medium / Long).
- **Compare** (`/compare`) — stack two thinkers across all 16
  dimensions.
- **Simulated debate** (`/debate`) — watch two philosophers argue a
  topic you pick. (AI-driven via Haiku.)

### Tier 4 — coming soon (scaffolded landings)

These have proper landing pages explaining what they'll do and when.
Not built — waiting on infrastructure (cron, content lift, or
DB schema):

- **Reading Hour** (`/read`) — 60-min timer-bound reading session
  with a primary text Mull picks for you. Needs ~80 hand-picked
  excerpts before launch.
- **Letters Between Inheritors** (`/letters`) — structured letters
  from the deceased at +1 week, +1 month, +3 months after the
  Inheritor playthrough. Needs Resend cron + persistent state.
- **Mull Open** (`/arena/open`) — quarterly PvP tournament. Brackets,
  single elimination, spectator finals. Needs tournament infra and
  a real PvP user base.
- **Long Letter** (`/long-letter`) — annual 2,000+ word letter to
  yourself, vaulted, resurfaced 5 years later. The slowest retention
  loop. Earliest ship: Q4 2026.

### Tier 5 — utility + social

- **Add to home screen** (`/install`) — guided iOS / Android /
  desktop install of the PWA. Manifest, apple-touch icons, and
  `display: standalone` are wired. The PWA install on either OS
  produces a full-screen app with shortcut quick-actions to
  Daily Spar, Pilgrimage, and the Inheritor.
- **Mull Wrapped** (`/wrapped/[year]`) — annual personalised
  year-in-review.
- **Classes** (`/classes`) — teachers spin up a class with an invite
  link, students take the quiz, the teacher sees aggregated class
  insights (with consent-gated RLS — no individual student data
  exposed).
- **Friend challenges** + **Referrals** — light social loops.
- **Public profiles** (`/u/[handle]`) — opt-in. Show your archetype,
  vector, and milestone trajectory to the world.
- **Account export** (GDPR-compliant) and **account deletion** — both
  wired, both audit-safe via the user-scoped tables registry
  (`lib/user-scoped-tables.ts`).
- **Admin dashboard** (`/admin` + `/admin/usage`) — launch-night
  vitals + AI spend tracking, gated to ADMIN_USER_IDS env. Mirrored
  inline on `/account` for the admin user (Jimmy) so the at-a-glance
  cells show without navigating.

---

## Brand + voice

### Visual identity
Pixel-game world (Press Start 2P + Pixelify Sans pixel fonts) holding
a library book inside it (Cormorant Garamond editorial serif).
Restrained palette: cream-paper background (#FAF6EC), ink-dark
foreground (#221E18), amber accent (#B8862F), one archetype-themed
accent per page (forest green for Keel, brick for Hammer, plum for
Threshold, etc.). Chunky 3-4px square borders. Hard pixel drop
shadows offset 3-4px (never soft, never blurred). Square corners
everywhere. Pixel `steps()` animations for interactive feedback.

References: Stardew Valley for the pixel craft, Loot-drop.io for
playful info density, Penguin Classics covers for the editorial
serif inside the chrome. Explicit anti-references: shadcn-style soft
shadows, Aceternity glow effects, Inter-clone SaaS aesthetic,
"Welcome back!" warmth.

### Voice
Plain, sharp, never saccharine. Names cost honestly ("each Arena
verdict costs about 15¢ in AI fees"). Not academic — no Latin
without translation, no signaling-erudite vocabulary. Uses second
person liberally on personal surfaces (quiz, Inheritor, Arena
composer). Third person for editorial (about, topic, philosopher).
Doesn't apologise for itself. Doesn't perform warmth.

The voice has a programmatic guard: `scripts/voice-lint.mjs` audits
long-form content (topics, exercises, philosopher bios) against
STYLE-GUIDE.md §9 rules — errors on performative warmth, AI
marketing-speak, untranslated Latin, therapy register; warns on long
sentences, em-dash flurries, apologetic phrasing.

---

## What makes it distinctive

1. **No competitor places you on a continuous 16-D space.** MBTI puts
   you in a 16-box; Big Five gives you 5 numbers; political compass
   collapses to 4 quadrants. Mull is the only tool that lets you
   say "I'm a Touchstone with a heavy Tragic Vision lean and unusual
   Ascetic strength" and have that mean something specific against
   560 historical thinkers.

2. **The Arena is "chess.com for philosophy" and nobody else built
   it.** Kialo does structured debate but no scoring, no opponent,
   no philosopher voices. r/ChangeMyMind has quality issues. Twitter
   is yelling at strangers. Mull's Arena is real philosophical
   topics, real philosopher opponents in character (Haiku), an
   impartial judge (Sonnet) who scores rigor + principle + engagement
   (NOT stance), Elo, leaderboard. A real product shape that doesn't
   exist elsewhere.

3. **The Inheritor is a murder mystery that respects the user.**
   Personality quizzes are usually fluff (BuzzFeed); serious-
   philosophy quizzes are usually surveys (Big Five). The Inheritor
   is a 15-minute country-house mystery with two unexpected twists
   and ten distinct endings, that doubles as a rigorous 16-D
   placement. The wrapping IS the value, not a coat of paint over
   the value. The reveal isn't "who did it" — it's "who you turned
   out to be while solving it."

4. **Free + not VC-funded + not an AI app.** AI is used in specific
   bounded places (Arena judging, daily dilemma analysis, Argument
   Diary, retrospectives) but the model itself is hand-designed. The
   brand is explicitly the opposite of "AI does it all."

5. **Built solo, in public, by a philosophy student.** Jimmy Ji, King's
   College London. Stripe wiring exists but is dormant — no payments
   yet. Mull runs on tips (Ko-fi link in footer).

---

## Stack + infrastructure

- **Hosting**: Vercel (Next.js 16 App Router, React 19). Production
  is at https://mull.world via direct Vercel CLI deploys —
  `vercel deploy --prod --yes --archive=tgz` from a clean worktree.
  NOT via Vercel's git auto-deploy (which is disabled for prod).
- **CI**: `.github/workflows/build.yml` runs `npm ci`, `tsc --noEmit`,
  `next build` on every push and PR. The independent gate against
  build/type failures.
- **Database**: Supabase Postgres. Schema in `supabase/migrations/`.
  Currently applied manually via Dashboard SQL Editor (CLI workflow
  documented for the future). RLS is real: every user-scoped table is
  registered in `lib/user-scoped-tables.ts` and the account export +
  delete iterate over that registry.
- **Auth**: Supabase Auth with magic-link email.
- **AI**: Anthropic Claude API. Haiku for cheap in-character voice
  + per-user analysis; Sonnet for Arena judging + Argument Diary
  steelman + harder analytical tasks. Costs tracked via a
  `rate_limit_events` table; spend-cap kill switch in
  `lib/rate-limit.ts` fails CLOSED if Supabase is unreachable
  (better to pause AI briefly than to run unchecked).
- **OG image generation**: Next.js dynamic OG endpoint per surface.
- **Analytics**: Vercel Analytics + Speed Insights.
- **Email**: Resend (for streak emails, welcome, breaks). Cron
  workflows in `.github/workflows/` for daily/weekly jobs.

---

## Economics + gating

### Per-use AI cost (the real numbers, inclusive of 20% Anthropic VAT)

- Daily Spar exchange: ~$0.05 cents
- Arena PvE single turn (Haiku in-character): ~$0.10
- Arena PvE judge (Sonnet, 3 dimensions): ~$0.18
- Daily Dilemma response + analysis (Haiku): ~$0.04
- Argument Diary entry + analysis (Haiku 2-pass): ~$0.06
- Exercise reflection + analysis (Haiku): ~$0.05

### Monthly cost at scale (cash, inclusive of VAT)

At ~100 active users doing Daily Spar + 30% doing 2-3 weekly Arena
matches + 50% doing daily dilemmas:
- Daily Spar: ~$150/month
- Arena (PvE + judge): ~$120/month
- Dilemma: ~$60/month
- Total: ~$330/month

At 500 active users, projected ~$1,500/month before optimisation.

### Spend guard (live as of 2026-05-25)

Caps via env vars in Vercel:
- `MULL_DAILY_SPEND_CAP_CENTS` — default 1700 ($17/day)
- `MULL_MONTHLY_SPEND_CAP_CENTS` — default 50000 ($500/month)

Each AI endpoint calls `aiGate()` which checks the running cost
against the cap before authorising. If over, it pauses AI for that
endpoint until the next day/month. Admin override available via
`KILL_SWITCH_OVERRIDE=on|off|auto` env var.

### Free vs Mull+ (planned, dormant)

Free tier unlimited for: quiz, archetype reading, map, topic/vs,
philosopher profiles, dilemma, exercises, Anthology, Diary.
Mull+ would add: heavier Arena allowance, Mo (personal coach),
priority queue on busy days, archived Wrapped exports.
Stripe webhook stub exists; payment flow not wired.

### Cost-relevant guardrails still missing

- Per-user soft limits on Argument Diary daily volume
- Bucket-specific cost cents (currently uniform per bucket)
- A "support Mull" CTA more visible than the footer Ko-fi link

---

## What's live (high-confidence claims about the production app)

Verified 2026-05-27:

- 560-philosopher corpus with 16-D vectors, 10 archetypes, archetype
  classification, kindred-philosopher kinship math
- 20-question quick quiz + 50-question detailed quiz + 15-min
  Inheritor murder mystery with 10 archetype-keyed endings
- Arena PvE (5 philosophers + 28 topics) with Haiku in-character +
  Sonnet judge + Elo rating
- Arena PvP (open challenges board, accept + play, same judging,
  separate Elo)
- Daily Spar (rotating philosopher + topic, daily reset, Sonnet judge)
- The Pilgrimage (30-day arc, per-archetype + per-flavour content,
  enrolment + daily progression + completion tracking)
- The Crucible, Wandering, Anthology, Diary, Argument Diary
- Capability Atlas with 6-skill XP system + Stardew-style level toasts
- Today's Dilemma with daily question pool + Haiku analysis + vector
  drift
- 32 topic explainers (`/topic/[slug]`) + 53 unique vs matchups
  (`/vs/[a]/[b]`) + 10 archetype detail pages + 560 philosopher
  detail pages (with 22 long-form bios) + 36 exercises
- Pathway widget on every hook surface ("what to do next") that
  adapts cold → warm based on archetype state
- `/install` add-to-home-screen guide with iOS / Android / desktop
  step cards + PWA manifest + apple-touch + viewport-fit:cover
- iOS safe-area on all bottom-fixed UI
- Admin at-a-glance card on `/account` for admin users (signups,
  AI spend with cap %, quiz/dilemma counts, errors-last-hour)
- Server-side rate limiting + global spend kill switch
- GDPR-compliant account export + delete via user-scoped tables registry
- 8 locales for UI chrome (en, es, fr, pt, ru, zh, ja, ko); long-form
  content English-only with a "EN only" banner for non-English visitors
- Methodology page (`/methodology`) explaining the 16-D model, the
  scoring math, the AI integration, the honest limits
- CI workflow runs typecheck + build on every push

---

## What's next (the backlog)

Live in `NEXT.md`. Major items still open:

- **Stripe + Mull+ subscriptions.** Schema, billing page, webhook
  stub exist. Payment flow not wired.
- **Mo (personal AI coach).** Schema exists, no UI.
- **Forum upvote/downvote leaderboard.** Needs the forum to be
  built first.
- **Content prose audit** of the 32 topics + 53 vs pairs + 36
  exercises for voice consistency. Time-intensive — best done
  in dedicated 2-4-hour sessions.
- **Translate deep content.** Strategic call is "don't machine-
  translate philosophy; commission human translators per high-
  traffic page once demand validates." Until then the EN-only
  banner carries the load.
- **Add 11th archetype** for the Burkean tradition+sovereignty
  quadrant. Documented as a "honest limit" on the methodology page;
  bump priority if launch feedback flags it.
- **Wave 3 vector pass** for any remaining flagged calibration
  entries. Tooling supports it (calibration-decisions.json +
  persona harness).

---

## Repo map (for technical chats)

Top-level docs:
- `README.md` — short
- `PROJECT-FOR-COWORK.md` — comprehensive product description
- `PROJECT-SYNOPSIS.md` — older synopsis (some content stale)
- `SESSION-HANDOFF.md` — current session state for next-session pickup
- `AGENTS.md` / `CLAUDE.md` — project invariants (user-scoped table
  registry, generator-owned content blocks, etc.)
- `STYLE-GUIDE.md` — design + voice rules
- `DESIGN-DIRECTION.md` — brand philosophy
- `NEXT.md` — backlog
- `CHANGELOG.md` — recent additions
- `MULL-PRIMER.md` — this file
- `LAUNCH-RUNBOOK.md` — launch playbook

Key code paths:
- `lib/philosophers.ts` — 560-entry corpus, Wave 1 (hand) + Wave 2
  (generator-owned between BEGIN/END sentinels)
- `lib/archetypes.ts` — 10 archetypes with full content per page
- `lib/archetype-targets.ts` — the dimensional centroids used for
  classification (single source of truth; mirrored in `mull.html`)
- `lib/topics.ts` — 32 topic explainers + categorisation
- `lib/vs-pairs.ts` — 58 curated matchups + categorisation
- `lib/exercises.ts` — 36 exercises
- `lib/quiz-questions.ts` — 20-question quick quiz
- `lib/quiz-questions-detailed.ts` — 50-question detailed quiz
- `lib/quiz-journey.ts` — Inheritor murder mystery scenes
- `lib/pathway.ts` — pathway-widget data (per-surface "what next")
- `lib/philosopher-bios.ts` — 22 long-form bios for most-searched
- `lib/rate-limit.ts` — aiGate + spend tracking + kill switch
- `lib/capabilities.ts` — Capability Atlas skills + event bus
- `lib/user-scoped-tables.ts` — table registry for export + delete

App routes (Next.js App Router):
- `app/page.tsx` — homepage
- `app/quiz/page.tsx` + `app/quiz/journey/` — quizzes
- `app/result/` — quiz result page
- `app/archetype/`, `app/philosopher/`, `app/topic/`, `app/vs/` —
  all the editorial surfaces
- `app/arena/` — PvE + PvP
- `app/spar/`, `app/pilgrimage/`, `app/crucible/`, `app/wandering/`,
  `app/anthology/`, `app/diary/`, `app/argument-diary/`, `app/atlas/` —
  retention surfaces
- `app/admin/` + `app/admin/usage/` — admin
- `app/account/` — user home
- `app/install/` — PWA install guide
- `app/methodology/`, `app/about/` — meta

Scripts (audit + generation tools):
- `scripts/gen-philosophers.mjs` — Wave 2 regenerator
- `scripts/sync-mull-html-aliases.mjs` — keeps mull.html in sync
  with `lib/philosophers.ts` aliases
- `scripts/check-philosopher-calibration.mjs` — corpus calibration audit
- `scripts/check-quiz-calibration.mjs` — quiz answer-vector audit
- `scripts/voice-lint.mjs` — STYLE-GUIDE §9 voice check
- `scripts/run-persona-tests.mjs` — 19-persona end-to-end stress test
- `scripts/calibration-decisions.json` — human-reviewed surprise
  verdicts (loaded by the corpus calibrator)

---

## Status as of 2026-05-27

Mull is live, stable, free, and ad-free at https://mull.world.
Performance is good (Vercel + Supabase on the EU region, sub-second
TTFB on most surfaces). The model is hand-tuned and audit-passing
on three layers of mechanical checks. The retention loop is built
but unmeasured — no real launch signal yet on which features pull
users back.

The user (Jimmy) builds in stretches with Claude as co-author,
deploys via Vercel CLI, reviews visually, ships when something feels
ready. Not optimising for growth; optimising for being a real thing
that respects its users.

Mull is not for everyone. It assumes you have an hour to read,
care about thinking carefully about your own mind, and don't mind
that nobody else has built a 16-D philosopher placement before. If
that's you, take the quiz at https://mull.world.
