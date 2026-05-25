# Mull — project description for social media campaign planning

A self-contained brief on what Mull is, who it's for, what makes it
distinctive, and possible angles for a social media campaign. Written
for an autonomous agent (or human PM) to read once and have enough
context to plan content.

---

## One-line pitch

**Mull is a philosophical mapping app.** You take a quiz; it places
you in a 16-dimensional space among 560 philosophers from across
history. From there you can read about the kind of mind you turned
out to be, browse the philosophers nearest you, debate them with
AI judging your argument rigor, or write through daily moral
dilemmas. Built solo as a passion project. Free to use; ad-free;
no data sold; runs on tips.

**URL:** https://mull.world

---

## The product, surface by surface

### Tier 1 — signature surfaces (what defines the product)

**The Quiz (two flavours).**
- **The Inheritor** (`/quiz/journey`) — a 15-minute interactive
  country-house murder mystery. A reclusive philosopher is found
  dead in their estate. You are one of seven inheritors named in
  the strange will — and the only one who actually came tonight.
  A silent servant guides you through four chambers of the estate,
  each containing an artifact from the deceased's life AND a small
  anomaly that doesn't fit. As you investigate, you make choices
  about what you'd do in each situation. Two unexpected twists
  (no spoilers — but neither is "the butler did it" or "you are
  the killer"). Ten distinct endings — one per philosophical
  archetype — where the conclusion of the mystery is also the
  reveal of who you are. Same rigorous 16-D scoring as the
  classic quiz, delivered as genre fiction.
- **The classic quiz** (`/quiz?mode=quick`) — 20 questions, ~5
  minutes, Likert-style. For people who want the result fast.
- **The detailed quiz** (`/quiz?mode=detailed`) — 50 questions,
  ~15 minutes, sharper placement.

All three drop you into the same 16-D space.

**The Arena** (`/arena`) — debate a philosopher. Pick from 10
thinkers across three difficulty tiers (Friendly: William James,
Marcus Aurelius, Mencius; Sharp: Confucius, Hannah Arendt, J.S.
Mill, Simone de Beauvoir, Socrates; Heavy: Nietzsche, Hegel) on
either philosophical topics (moral luck, what we owe each other,
authenticity vs role) or everyday ones (ghosting a friend, the
small lie, the job vs the calling). After 2+ exchanges, an
impartial Sonnet judge scores both sides on **logical rigor,
philosophical principle, structural elegance, and engagement —
NOT on whose side won**. Elo system, leaderboard, match history.
Also PvP (debate another human, async). Elo gating: heavy voices
locked until you climb.

### Tier 2 — explore

**The Map** (`/map`) — interactive 2D constellation of all 560
philosophers, plotted in the same 16-D space. Pan, zoom, hover any
point to see name + dates + key idea. After taking the quiz, your
own point appears with a pulsing halo so you can see kindred minds.
Also as a list at `/philosopher` grouped alphabetically by
archetype.

**The 10 archetypes** (`/archetype/[key]`) — Cartographer, Keel,
Threshold, Pilgrim, Touchstone, Hearth, Forge, Hammer, Garden,
Lighthouse. Each is a long editorial essay (Cormorant Garamond
serif, "library book inside the game") covering what the archetype
gets right, where it falters, a day in the life, kindred thinkers,
a starter reading list.

**Today's dilemma** (`/dilemma`) — one philosophical scenario per
day. Optional written response analyzed by Haiku and turned into a
small dimensional shift on your map. Daily ritual.

**Topic explainers + Vs matchups** (`/topic`, `/vs`) — 12 short
SEO-targeted topic essays (free will, stoicism, the trolley
problem, what we owe each other, etc.) and 30 head-to-head
philosopher comparison pages (Plato vs Aristotle, Nietzsche vs
Kant, Confucius vs Mencius). Each comparison auto-generates
"where they sharply disagreed" + "where they overlapped" sections
from their actual 16-D vectors.

### Tier 3 — deepen + practice (recurring rhythms)

These are the retention surfaces. Each fires events into the
Capability Atlas (six skills, visible level-ups).

- **Daily Spar** (`/spar`) — 5-min argument practice. One
  rotating philosopher + topic per day. One turn each, Sonnet
  judges. Different from the Arena: it's the fast on-ramp.
- **The Pilgrimage** (`/pilgrimage`) — 30-day archetype-keyed
  course. Each of the 10 archetypes has its own arc with
  per-flavor enrollment lens. The biggest single retention bet.
- **The Crucible** (`/crucible`) — daily real-world action.
  60-prompt pool, rotates daily. Tomorrow Mull asks how it went.
  Stoic evening-review meets daily moral practice.
- **The Wandering Question** (`/wandering`) — 52 questions, one
  per ISO week, across 4 beats (Mon Start / Wed Kindred / Fri Far
  / Sun Synthesis).
- **Argument Diary** (`/argument-diary`) — log a real argument,
  get a Haiku-powered analysis (steelman of the other side, 2
  fallacies in your framing, 3 kindred philosophers' takes).
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
- **Today's Dilemma** (`/dilemma`) — one philosophical scenario
  per day, written response → vector drift.
- **Exercises** (`/exercises`) — 16 contemplative + logic +
  argument practices.
- **Compare** (`/compare`) — stack two thinkers across all 16
  dimensions.
- **Simulated debate** (`/debate`) — watch two philosophers
  argue a topic you pick.

### Tier 4 — coming soon (scaffolded landings)

These have proper landing pages explaining what they'll do and
when. Not built — waiting on infrastructure (cron, content lift,
or DB schema):

- **Reading Hour** (`/read`) — 60-min timer-bound reading session
  with a primary text Mull picks for you. Needs ~80 hand-picked
  excerpts before launch.
- **Letters Between Inheritors** (`/letters`) — structured letters
  from the deceased at +1 week, +1 month, +3 months after the
  Inheritor playthrough. Needs Resend cron + persistent state.
- **Mull Open** (`/arena/open`) — quarterly PvP tournament.
  Brackets, single elimination, spectator finals. Needs tournament
  infra and a real PvP user base.
- **Long Letter** (`/long-letter`) — annual 2,000+ word letter
  to yourself, vaulted, resurfaced 5 years later. The slowest
  retention loop. Earliest ship: Q4 2026.

### Tier 5 — utility + social

- **Mull Wrapped** — annual personalized year-in-review
- **Classes** — teachers can spin up a class with an invite link,
  post philosophy assignments; free for any academic email
  (auto-detected `.edu` / `.ac.*` / `.k12.*.us`)
- **Challenge a friend** — invite link generates a comparison page

---

## The 16-dimensional model (what makes the math non-arbitrary)

Mull places people on 16 dimensions of philosophical tendency. The
full list:

| Code | Name | Captures |
|------|------|----------|
| TV | Tragic Vision | Sees suffering and limit as fundamental |
| VA | Vital Affirmation | Affirms life as it is |
| WP | Will to Power | Shaping vs accepting; effort, mastery |
| TR | Trust in Reason | Reasoning from clear principles |
| TE | Trust in Experience | Direct observation, lived experience |
| RT | Reverence for Tradition | Inherited practices carry hidden wisdom |
| MR | Mystical Receptivity | Truths beyond what language can reach |
| SR | Skeptical Reflex | Questions claims, suspends judgment |
| CE | Communal Embeddedness | Self in relationships, communities |
| SS | Sovereign Self | Individual as seat of moral authority |
| PO | Practical Orientation | What helps a life go well |
| TD | Theoretical Drive | Understanding for its own sake |
| AT | Ascetic Tendency | Discipline, restraint, simplicity |
| ES | Embodied Sensibility | Trusts the body, the senses |
| UI | Universalist Impulse | Moral principles for everyone everywhere |
| SI | Self as Illusion | Suspects unified "self" is a story |

These are NOT MBTI-style binary boxes. Every user is a continuous
point in 16-D space. Two people with the same archetype still have
distinct fingerprints. The dimensions catch real distinctions: e.g.,
Buddha and Hume both score high on Self as Illusion but for opposite
reasons.

---

## Brand + voice

### Visual identity
**Pixel-game world, library-book content.** UI chrome is chunky
8-bit pixel art — 4px ink borders, hard amber/teal/brick drop
shadows (no soft glows), `steps()`-based animations (no silky
lerps), Press Start 2P + Pixelify Sans + VT323 typography. Long-
form essays inside that chrome use Cormorant Garamond — the
deliberate "leather book opened inside a JRPG" beat. Brand mark
is a small circle with 8 dots scattered around the inside and one
amber dot offset — abstracted constellation, "your place on the
map."

Reference points: Stardew Valley + Octopath Traveler for pixel
craft, Loot-drop.io for playful info-density. Explicit anti-
references: shadcn-style soft shadows, Aceternity glow effects,
Inter-clone SaaS aesthetic, "Welcome back!" warmth.

### Voice
Plain, sharp, never saccharine. Names cost honestly ("each Arena
verdict costs about 15¢ in AI fees"). Not academic — no Latin
without translation, no signaling-erudite vocabulary. Uses second
person liberally on personal surfaces. Doesn't apologize for
itself. Doesn't perform warmth.

---

## What makes it distinctive

1. **No competitor places you on a continuous 16-D space.**
   MBTI puts you in a 16-box; Big Five gives you 5 numbers;
   political compass collapses to 4 quadrants. Mull is the only
   tool that lets you say "I'm a Touchstone with a heavy Tragic
   Vision lean and unusual Ascetic strength" and have that mean
   something specific against 560 historical thinkers.

2. **The Arena is "chess.com for philosophy" and nobody else built it.**
   Kialo does structured debate but no scoring, no opponent, no
   philosophy. r/ChangeMyMind has quality issues. Twitter is
   yelling at strangers. Mull's Arena is: real philosophical
   topics, real philosopher opponents in character (AI Haiku), an
   impartial Sonnet judge who scores rigor + principle + engagement
   (NOT stance), Elo system, leaderboard. It's a real product
   shape that doesn't exist elsewhere.

3. **The Inheritor is a murder mystery that respects you.**
   Personality quizzes are usually fluff (BuzzFeed, "which Hogwarts
   house"). Serious-philosophy quizzes are usually surveys
   (Big Five). The Inheritor is a 15-minute country-house mystery —
   an investigation into the strange death of a reclusive
   philosopher, anomalies in each chamber that slowly suggest the
   death isn't what it seems, two unexpected twists, and ten
   distinct endings depending on the archetype you turn out to be —
   that doubles as a rigorous 16-D placement. It's the rare product
   where the wrapping IS the value, not a coat of paint over the
   value. And it's the rare mystery game where the reveal isn't
   "who did it" — it's "who you turned out to be while solving it."

4. **Free + not VC-funded + not an AI app.**
   Mull uses AI in specific bounded places (Arena judging, daily
   dilemma analysis, retrospectives) but the model (16-D, 10
   archetypes, 560 philosophers, every quiz question, every
   archetype essay) is hand-designed by humans who care about
   getting philosophy right. The brand is explicitly the opposite
   of "AI does it all."

5. **Built solo, in public, by a philosophy student.**
   Jimmy Ji, philosophy student at King's College London. Mull is
   a passion project. Stripe wiring exists but is dormant — no
   subscription tier exposed; the site runs on tips via Ko-fi.
   Costs come out of Jimmy's pocket. This is the honest version
   of "indie tech" — no growth quotas, no funding runway, no
   "Series A," just a real product made deliberately.

---

## Target audiences (for social media targeting)

1. **Philosophy curious (primary)** — undergrads taking intro
   philosophy, autodidacts who read SEP and Wikipedia for fun, ex-
   philosophy majors who miss the conversation, "intellectual
   dabblers." Reachable via: r/philosophy, r/askphilosophy, Daily
   Nous comments, philosophy podcast listeners, Sam Harris-adjacent
   folks (with caveat — Mull isn't ideological).

2. **MBTI/personality-test refugees** — people who've taken every
   personality quiz and want one that doesn't insult their
   intelligence. Reachable via: personality typology subreddits,
   16personalities-adjacent communities, Big Five enthusiasts.

3. **Intellectual content creators** — newsletter writers,
   YouTubers in the "thoughtful explainer" space (Vsauce, Veritasium
   audience-adjacent), educators looking for classroom tools (Mull
   Classes is free with EDU email auto-detection).

4. **The "I'm interested in ideas but academia is exhausting"
   crowd** — left philosophy after one course because lectures
   were dry, but still finds the questions interesting.

5. **Practicing philosophers / academic philosophers** — secondary
   but valuable for credibility. The Arena especially might
   intrigue them as a teaching tool.

---

## Suggested content angles (for the social media campaign agent)

These are angles I'd brainstorm against — pick what resonates,
discard the rest. Not all of these need to be made.

### Discovery hooks (one-shot virality candidates)

- **"Which philosophical archetype are you?"** — universal
  attention-grabber. Mull's quiz outperforms most personality
  quizzes on substance + presentation.

- **"Argue Nietzsche."** Screenshot of an Arena verdict screen.
  "I just debated AI Nietzsche on whether suffering is meaningful.
  He won 22-17. Here's where he beat me." The format is the hook.

- **"Plato vs Aristotle, plotted across 16 dimensions of
  philosophical tendency."** Carousel post showing the Vs page.

- **"This is the chess.com for philosophy nobody is talking
  about."** Quote tweet bait.

- **"The Inheritor"** — pitch as a 15-minute interactive country-
  house murder mystery with ten distinct endings, that doubles as
  a rigorous philosophical placement. Hooks lit-Twitter, the games-
  as-text crowd, AND the much larger mystery-genre audience (cozy
  mystery readers, Knives Out fans, escape-room people). The genre
  framing makes it shareable in places "narrative philosophy quiz"
  never would have reached.

### Value-shape hooks (sustained interest)

- **The Map of 560 philosophers.** Show the constellation with
  the user's point appearing. "You can finally see where you sit
  among the people you've been reading."

- **Daily dilemma threads.** Pull today's dilemma from `/dilemma`,
  post as a thread, ask responses, weave Mull's content into the
  thread. Recurring content.

- **"Today in philosophy" / philosopher spotlights.** Pull a
  philosopher from the 560 corpus and post their key idea, key
  dates, kindred minds. Daily/weekly.

- **Behind-the-scenes "passion project economics."** Jimmy posts
  about building Mull as a philosophy student, the actual costs
  ($X/month for AI, $Y for hosting), the Ko-fi tip jar.
  Audiences who like indie tech love this.

### Community hooks

- **"Argue this with me"** — Jimmy or other early users post an
  Arena topic and an opening turn. Others reply with their take;
  Jimmy challenges them to play it through formally on the Arena.

- **"What's your archetype?"** — get other thought-leader / niche
  people to take the quiz publicly. Their result becomes content.

### Honest cautions

- **Don't oversell as AI.** The brand is explicit anti-AI-app —
  AI is used in bounded places; the model is human-designed.
  Lean on "16D model designed by a philosophy student" not "AI-
  powered philosophy."
- **Don't sell paid tier in the campaign.** Stripe is dormant;
  Mull is free. The ask if any is Ko-fi tips.
- **Avoid the "personality test" frame solo** — it's correct but
  reductive. Pair "find your archetype" framing with the deeper
  "16-D map among 560 thinkers" angle so people see this isn't
  just BuzzFeed.

---

## Economics + gating (for campaign context)

Mull is currently free for everyone. The full Mull+ subscription
system is built and dormant (Stripe wired but no signup UI
exposed). When traffic justifies it, Mull+ flips on at $4.99/mo,
$29/year, or $59 lifetime "Founding Mind" — and gates only the
AI-heavy features, never the core ones.

### Per-use AI cost (the real numbers)

- **Arena PvE debate** (4–8 turns + judge): ~$0.15–0.20
- **Daily Spar** (1 turn + judge): ~$0.05–0.08
- **Argument Diary** analysis: ~$0.005–0.01
- **Daily Dilemma / Diary / Exercise**: ~$0.005
- **Yearly retrospective** (Mull+): ~$0.30–0.50
- Inheritor mystery / Pilgrimage / Crucible / Wandering /
  Anthology / Year-in-View / Atlas / Quiz / Map / philosopher
  pages / topic / vs: **$0** (no AI calls)

### Monthly cost at scale (cash, inclusive of 20% VAT on API)

Anthropic charges 20% VAT on top of the listed per-token price, so
$1 of API spend = $1.20 of cash out. Numbers below are cash totals.

- 100 MAU → ~$85
- 500 MAU → ~$420
- 1,000 MAU → ~$865 (Vercel Pro kicks in at ~$20/mo)
- 5,000 MAU → ~$4,200 (Mull+ at 10% conversion covers most)
- 10,000 MAU → ~$8,640 (needs Mull+ + grants / external)

### Spend guard (live as of 2026-05-25)

Server-side rate-limit middleware + global daily/monthly spend
ceilings live in `lib/rate-limit.ts`. Defaults:
- Daily AI cap: $17 (≈$20 cash with VAT)
- Monthly AI cap: $500 (≈$600 cash with VAT, ~£500)
- Per-user per-day caps on every AI endpoint (Spar 3/day, Arena
  judge 4/day, etc.)
- `MULL_KILL_SWITCH=on` env var force-pauses all AI from the
  Vercel dashboard, no deploy needed
- Admin dashboard at `/admin/usage` (admin-only) shows live spend

### Free vs Mull+ (planned gating)

**Free tier** — generous on contemplative features:
- Unlimited: Quiz, Inheritor, Map, all philosopher / topic / vs
  pages, Pilgrimage, Crucible, Wandering, Anthology, Atlas,
  Year-in-View, Dilemma (1/day), Diary (3/day)
- 1 Daily Spar/day
- 1 Arena PvE debate/day
- 3 Argument Diary analyses/week

**Mull+ ($4.99/mo)** — higher volume on AI surfaces:
- 5 Daily Spars/day
- Unlimited Arena PvE
- Unlimited Argument Diary + Diary
- Yearly retrospective
- Reading Hour, Long Letter, Mull Open access (when built)

**Hard caps regardless of tier** (cost protection):
- 10 Spars + 5 Arena debates + 5 Argument Diary calls per day
  per user
- Site-wide daily AI-spend ceiling — auto-pauses inference if
  exceeded. Safety net, not retention squeeze.

### Cost-relevant guardrails missing today

The above caps are currently **client-side only** (localStorage)
on the new surfaces. Server-side rate-limit middleware is the next
infra build. Until then, casual abuse is possible; campaign
traffic spikes should be watched carefully.

---

## Technical / operational notes (for any agent automating)

- **Stack:** Next.js 16 App Router on Vercel, Supabase
  (Postgres + auth + RLS), Anthropic Claude (Haiku for
  bulk + Sonnet for the Arena judge).
- **Hosting:** mull.world is the canonical domain.
- **Ad / tracking policy:** no banners, no third-party trackers
  beyond Vercel Analytics + Speed Insights, no data sale.
- **Email:** transactional only (welcome, dilemma reminders,
  PvP turn-it's-your-turn notifications via Resend); no
  marketing list yet.
- **Source of truth for product copy:** in-repo `.md` files —
  AGENTS.md (project rules), CLAUDE.md, DESIGN-DIRECTION.md
  (visual brand), STYLE-GUIDE.md (operational spec),
  README.md, RETENTION-NOTES.md (retention strategy), this file.
- **Capability Atlas (dopamine spine):** every retention surface
  fires events into `lib/capabilities.ts`. Six skills (Rigor,
  Depth, Consistency, Range, Self-Awareness, Synthesis) with
  visible level-up badges. Connects all retention features into
  one growth narrative.
- **Maintainer:** Jimmy Ji, philosophy student at King's
  College London. Email: jimmy.kaian.ji@gmail.com.

---

## Open campaign questions Jimmy hasn't decided

(For the cowork agent to flag back to Jimmy if any of these affect
campaign strategy:)

1. **Should the campaign explicitly promote the Ko-fi tip jar?**
   Or stay quiet on funding to avoid "make money" framing? Default
   answer: low-key mention in bios + on-site, not the campaign hook.
2. **Should the campaign target a specific philosophical
   community first** (e.g., Stoicism Reddit, Effective Altruism,
   academic-philosophy Twitter), or go broad? Default: broad, with
   a few targeted threads to specific communities as experiments.
3. **Should the Inheritor's mystery twists become a piece of
   content itself?** Spoiler risk is real (revealing either twist
   would gut the playthrough), but the twists are also genuinely
   strong viral hooks. Possible compromise: tease ONE artifact
   anomaly per post (the steamship ticket dated last week, the
   forgiveness letter from the daughter) without revealing where
   they lead — let curiosity pull people in.
4. **Is there a launch moment?** Mull doesn't have a "v1 launch"
   announcement post yet — most of the product was built in the
   open without ceremony. The campaign could be the launch.

---

*Last updated 2026-05-25 (after the Capability Atlas + retention
build shipped: Crucible / Wandering / Anthology / Year-in-View /
Argument Diary / Atlas all live on mull.world; Reading Hour /
Letters Between Inheritors / Mull Open / Long Letter scaffolded
as coming-soon landings.) Mull is a living product; some of the
above will be stale within weeks. The product surfaces and the
mull.world site are the source of truth if anything here
conflicts.*
