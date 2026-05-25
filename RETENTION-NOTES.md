# Mull · Retention deliberation

*Written 2026-05-25, after the Inheritor murder-mystery reshape + map
fix + polish sweep landed. The product is now hook-rich: Inheritor,
Arena, the constellation, archetype essays, 560-philosopher corpus.
Distribution is the harder problem now — but assuming the campaign
brings people in, the next-hardest problem is bringing them BACK.
This is a deliberation on what features would actually move
retention, ordered by leverage.*

---

## What Mull retains on today

Existing retentive surfaces, ranked by how much real pull they have:

1. **Today's dilemma** — daily ritual, opt-in, low cost. A small drift
   on the vector per submission. Genuinely habit-forming for people
   who enjoy short writing prompts. Currently the strongest retention
   loop Mull has.
2. **Account page trajectory** — most signed-in users glance at it
   when they come back. Shows recent quiz changes + dilemma activity.
   Visual but not narrative.
3. **Arena PvP turn-it's-your-turn emails** — fires when an opponent
   moves. Pulls users back on the order of hours/days. Limited scale
   (PvP has very few users so far).
4. **Annual Mull Wrapped** — heavy moment once a year. High-quality
   but extremely rare.
5. **Class assignment cadence (EDU tier)** — if a teacher uses Mull
   as part of a course, the students return on the teacher's
   schedule. Bounded by EDU adoption.

The honest read: **Mull currently retains on the dilemma alone.** The
trajectory page is a glance, not a destination. The Arena needs more
PvP density to be a loop. Wrapped is once a year. The dilemma is
doing most of the work.

---

## What's missing structurally

Mull has good IDENTITY (your archetype) but weak
IDENTITY-PROGRESSION. The classic ladder shapes that retain users —
streaks, levels, badges, kindred-found, things-completed — are mostly
absent or invisible. The dilemma drifts your vector, but you can't
SEE that drift moving you toward or away from specific philosophers,
or making a new ending of the Inheritor more likely, or unlocking
content. The mechanics that would make returning *feel like
something* are not wired.

The fix isn't more hooks. It's more LOOPS — bringing data the user
already produces back to them in a way that says "your effort moved
you, and here's where to next."

---

## Twelve retention bets, ranked by leverage

Each bet rated:
- **L** — leverage (how much it would move weekly active users)
- **C** — cost (relative implementation hours)
- **N** — novelty for Mull's brand (does this feel like us, or like
  every other SaaS app?)

### Tier 1 — Build these next

**1. Trajectory chart on `/account` (L: high · C: low · N: high)**
We already collect every quiz attempt and dilemma response. Render
the user's strongest dimension's value over the last 30 days as a
small chart on the account page. Make the dilemma *visibly
consequential*. ("Your Tragic Vision went from 5.2 to 6.1 this week
— what was that one about?") The data is already there; this is a
visualization layer.

**2. The Inheritor's task as a real weekly callback (L: high · C: low · N: very high)**
Once a signed-in user completes the Inheritor and gets, say, the
Hearth ending — Wren asks them to visit the daughter. Mull
schedules a follow-up email at +7 days: *"It's been a week. Did you
visit her? You can write back to this email — Elena reads it."* This
makes the Inheritor a META-narrative that extends past the
playthrough. Cost: a Resend cron + a small dialog where the user can
journal their "real-life inheritance progress." Genuinely unique to
Mull; no other product can do this beat because no other product has
the Inheritor.

**3. Daily streaks on dilemma (L: medium-high · C: low · N: medium)**
The Duolingo loop. Track consecutive days of dilemma submission;
show the streak count on `/account` and on `/dilemma`. Use the
existing one-day-grace function already in the codebase. Optionally
add a streak email at risk-of-break (T+2 days without a response, by
6pm in user's timezone). Already on the backlog (Lane B #5) — should
just ship.

**4. Weekly email digest (L: medium-high · C: medium · N: high if framed right)**
Sunday morning email to signed-in users. Three sections:
- *Your week on the map* — top dim shift, top dilemma response
  (excerpted), one new philosopher who came within cosine-sim 0.9 of
  you this week
- *One question from the corpus* — pulled from the user's nearest
  archetype's reading list, framed as a single discussion question
- *(Optional)* — your Inheritor task, if active

Framed as a *letter*, not a marketing email. Cormorant body. Already
have Resend + the trajectory data + the philosopher proximity calc.
Lane B #6 in the backlog.

### Tier 2 — Build after Tier 1 lands

**5. Re-take the Inheritor for alternate endings (L: medium · C: medium · N: very high)**
After completing the Inheritor once, the result page surfaces *"You
got the Hearth ending. There are nine others."* — locked, with the
TWO ARCHETYPE NAMES of nearest-other-archetypes shown as teasers but
no spoilers. The user can re-take the Inheritor and Mull computes
WHICH alternate ending they earned this time. Tracks which endings
they've seen. Optional badge for collecting all ten. Drives
re-engagement of an already-built asset.

**6. "Kindred minds this week" — slow accretion email (L: medium · C: low · N: high)**
Monthly email. As the user's vector shifts, their 5 nearest
philosophers change. Compare to last month: who's new in the top
five? Send a paragraph on each newcomer. Pure surfacing of existing
data — costs almost nothing per user.

**7. Reading-list tracker (L: medium · C: medium · N: medium)**
Each archetype has a curated reading list. Let users mark books read
(checkbox). Show progress as a sprite-style XP bar on the archetype
detail page. Compare aggregate progress against other users of the
same archetype (anonymous totals). Builds completionism + soft peer
pressure. The data structure is small (user_id × book_id × status).

**8. Personalized daily passage (L: medium · C: medium · N: high)**
Replace or supplement the existing "Today's thinker" daily drop with
a passage pulled from a philosopher in the user's kindred. Read in
~90 seconds. The hook: it's tuned to YOU. Engineering work: need
short passages (100-150 words) for at least 80 philosophers — this
is a content lift, not a code lift.

### Tier 3 — Slower / experimental

**9. The "thread of two hundred years" annual letter (L: low · C: low · N: very high)**
In-fiction: the Inheritor's deceased mentions a "small quiet
thread." Real Mull could make this a tiny opt-in annual newsletter
(1-2 emails/year) where some user's anonymized journey is shared —
"this is what one inheritor did with their Hearth task." Builds
belonging without social-media noise. Slow build but consistent with
brand voice.

**10. Class cohorts get peer-comparison views (L: medium for EDU only · C: medium · N: medium)**
If a teacher creates a class, members see weekly: "How the class's
average answered today's dilemma vs. how you did." Anonymous
aggregate. Drives consistent re-engagement during the term. Already
have Classes infrastructure; just need the comparison view.

**11. "Where you've been" — Mull's version of GitHub graph (L: low-medium · C: medium · N: high)**
A small heatmap on `/account` showing days you've interacted with
Mull (dilemma, Arena, diary). Visual streak. Pixel-styled. Cheap
data, fun visual.

**12. Arena weekly featured challenge (L: low · C: low · N: medium)**
Mull picks one philosopher × one topic per week, surfaces it as
"This week's challenge." Sunday email + home page section. Tracks
how many users played. Light, fits the existing Arena infra.

---

## My recommendation: build in this order

If retention is the goal, here's the slimmest 4-feature path that
moves the needle without bloating scope:

1. **Daily streaks on dilemma** (Tier 1 #3) — ship first, it's nearly
   free and the data structure already supports it.

2. **Trajectory chart on `/account`** (Tier 1 #1) — makes the dilemma
   visibly consequential, which 10x's the streak's pull.

3. **Inheritor follow-up email at +7 days** (Tier 1 #2) — the most
   distinctively-Mull retention bet. Nothing else on the internet
   sends a follow-up like this. It will be screenshotted and shared.

4. **Weekly email digest** (Tier 1 #4) — the consolidator. Bundles
   the trajectory + nearest-kin + Inheritor follow-up into a single
   Sunday letter. Once #1-#3 are working, this is the natural
   delivery vehicle.

Time estimate: roughly 8–12 hours of build for all four, assuming the
existing Resend, dilemma-streak, and trajectory infra holds up. Each
is independently shippable, so you can stop after any one.

---

## What NOT to build for retention

Avoid these even though other apps use them:

- **Push notifications** — out of brand; Mull is a slower medium.
- **Gamification rewards** (XP, coins, leaderboards beyond Arena) —
  cheapens the moral-seriousness pitch. Streaks are the only
  game-like mechanic that fits.
- **Social feeds / activity timelines** — Mull's audience is partly
  here BECAUSE it isn't Twitter. Don't build it.
- **In-app messaging between users** — moderation cost is too high;
  the PvP Arena already gives users a structured way to interact.
- **Heavy onboarding tours** — the product's strength is that you
  hit the quiz in 30 seconds and get a real result. Don't gate that
  with a guided tour.

---

*Maintainer note: this is a deliberation, not a roadmap. Items here
should be moved to NEXT.md before being scheduled. Treat the four
recommendations as the smallest shippable retention upgrade; treat
the rest as a brainstorm pool to draw from later.*

---

## Addendum (2026-05-25, second pass)

After the first pass landed, Jimmy pushed back: the twelve ideas
above were too much polish, not enough genuinely new surfaces. The
ask was for **new destinations the way Dilemma and Arena are
destinations** — things a user opens in their browser on purpose,
not features bolted onto existing pages.

Below are eight new surface candidates. Each could be its own route,
its own hero in the nav, its own pull. Ranked by leverage + how
specifically-Mull-shaped it is. Time estimates assume one solo
builder; treat them as orders of magnitude, not promises.

### S1 · The Pilgrimage (~3 weeks)

A thirty-day personalized course, archetype-keyed. Day 1 starts the
moment you finish the quiz. Each day brings:

- A short passage from a kindred philosopher (90 seconds)
- A prompt or exercise tuned to your archetype's strengths and to
  the dimension you're weakest on
- A small drift on your map when you respond

By Day 30 you've moved measurably (the chart at the top shows the
arc), met a dozen thinkers near you, and have a daily ritual that
isn't *just* one dilemma. Different from the dilemma in that it has
**momentum and a destination** — Day 17 builds on Day 16, the curve
matters.

The hook: it's a *course*, not a stream. The same psychological
shape that makes Headspace work (you're somewhere, you're going
somewhere) but for philosophy.

New route: `/pilgrimage` — list of available 30-day arcs, each
themed (the Stoic month, the skeptic's walk, the Hearth's year-
end). Users can also have one auto-generated.

### S2 · The Salon (~2 weeks)

Async, multi-user weekly question. One question goes live every
Monday. Users post a 100–250 word position. Other users reply (or
not). On Friday, an impartial Sonnet judge picks the three most
rigorous responses and writes a 200-word synthesis. Everyone's
contribution stays archived under their public profile.

Unlike the Arena (which is 1v1 debate), the Salon is *collective
inquiry*. Unlike Reddit, the discussions are bounded, judged, and
brand-mediated. Users develop a reputation over weeks — your archive
of Salon contributions becomes part of who-you-are-on-Mull.

New route: `/salon` — this week's question, the wall of responses,
last week's verdict.

### S3 · The Reflection Wheel (~2 weeks)

Pick any philosopher whose vector is close to yours. Mull simulates
a 20-minute structured conversation: the philosopher (in voice) asks
you 4–5 questions tuned to their concerns and YOUR current vector.
Not a debate — closer to a guided session with a wise relative who
happens to be Spinoza. Each session ends with a short note from them
about what they noticed.

Different from the Arena because there's no judging, no Elo, no
right answer. Different from the daily dilemma because YOU pick the
philosopher and the depth.

New route: `/reflect` — list of available philosophers (gated to
your closest 20 or so), recent sessions, start-a-new-session.

Cost note: ~$0.05 per session in AI fees; could be Mull+ if it gets
heavy use.

### S4 · Constellation Quests (~1 week)

Curated multi-step journeys across the philosopher map. Examples:

- *The Stoic trail* — Aurelius → Epictetus → Seneca → Hadot → Pigliucci
- *The Buddhist path* — Buddha → Nagarjuna → Dogen → Suzuki → modern
- *The skeptic's walk* — Pyrrho → Sextus → Montaigne → Hume → Bayle
- *Women philosophy left out* — Hypatia → Christine de Pizan →
  Astell → Wollstonecraft → Anscombe → Murdoch → de Beauvoir →
  Nussbaum

Each quest is 5–9 philosophers in a deliberate order with a 1–2
paragraph "why these, why this order" intro. Users mark themselves
through. Completing a quest leaves a small visual badge on their
map (a faint connecting line between the philosophers).

Mostly content-bound (the code to track progress is trivial). High
leverage for users who like the constellation but don't know where
to start reading. New route: `/quests`.

### S5 · The Daily Spar (~1.5 weeks)

A 5-minute Arena variant. One micro-topic, one philosopher opponent,
**one turn each, 200 words max, judge in 30 seconds**. Built for the
user who doesn't have 20 minutes for a full Arena debate but wants
the rigor practice.

Daily limit of 3. Separate "Spar Elo" so it doesn't muddy the main
Arena leaderboard. Today's spar-of-the-day rotates globally, so
everyone who plays today sees the same matchup — leaderboard for
"best response of the day" becomes a thing.

The hook: low commitment, high return. Like Wordle for arguments.
New route: `/spar`.

### S6 · The Inheritor sequels (~3 weeks each)

The Inheritor was a hit shape. The reshape into murder mystery made
it stronger. There's room for **a small library of narrative
quizzes**, each a different genre, each using the same 16-D scoring
engine. Candidates:

- **The Last Crossing** (sci-fi) — you've been selected as ethics
  officer on a generation ship. The first crisis happens hour one.
  Four scenarios over the next 100 years (cryosleep transitions
  collapse the time gap). Same chambers structure, sci-fi clothing.
- **The Oracle's Choice** (fantasy) — you've been brought to a
  cliffside monastery. The current oracle is dying; the order needs
  a successor. Four trials by the four masters.
- **The Letter Series** (epistolary) — 4 letters arrive over 4
  weeks. Each contains a moral problem someone you love is facing.
  You reply. The replies shape who you turn out to be.

Each new genre opens a new user who wouldn't have engaged with the
mystery. Already-completed users have a reason to play the next.
The "you've taken 3 of 5" shape is naturally retentive.

Existing engine (JourneyEngine + JOURNEY_REVEALS) was built modular;
adding sequels is mostly new content (~5,000 words each).

### S7 · Build-a-Philosopher (~3 weeks)

A long-running, slow-accreting feature. Over the year, your daily
choices on Mull (dilemmas, Inheritor playthroughs, Salon posts) feed
into a synthetic philosopher Mull is building from your data. They
get:

- A generated name (in a tradition that matches your archetype)
- A pixel portrait that evolves as you do
- A growing one-page manifesto written from your accumulated answers
- A position on the 560-philosopher map, plotted with the others

At the end of each season (quarter), Mull writes a 400-word "what
your philosopher became this season" essay. Shareable as a card.

This is the most distinctively-Mull-shaped retention idea on this
list: nobody else can do it because nobody else has the model. Users
spend a year here because they want to see what THEIR philosopher
becomes. New route: `/me/philosopher`.

### S8 · Mull Reading Club (~4 weeks)

Quarterly. One primary text per quarter (Aurelius's *Meditations*,
Beauvoir's *Ethics of Ambiguity*, Mill's *On Liberty*, Buddha's
*Dhammapada*, etc.) read on a 12-week schedule alongside other Mull
users. Each week:

- A reading assignment (1 chapter or ~30 pages)
- A prompt that ties the reading to a dimension on your map
- An async thread (Salon-style) for the cohort
- A small dimension drift on submission

Builds belonging. Users develop reading habits. Mull becomes the
place you read serious philosophy.

Content + ops heavy — needs a chosen book per quarter, scheduled
threads, light moderation. But the surface is durable once running.
New route: `/reading-club`.

---

### What ties these together

All eight share three properties:

1. **Each is a destination.** It has its own URL, its own hero
   surface, its own reason to open it. They're not bolted onto
   existing pages.
2. **Each has its own cadence.** Daily Spar fires daily, Salon
   fires weekly, Reading Club fires per-chapter, Pilgrimage fires
   per-day-of-30. Different rhythms compound — a user doesn't have
   to engage with all of them, but the more they do the more days
   per week Mull has a reason to be opened.
3. **Each is recognizably Mull.** Each leans on the 16-D model, the
   archetype system, or the philosopher corpus. None could be
   transplanted onto a generic productivity app and still make
   sense.

### Recommended build order if Jimmy says go

If you pick one to ship next, ship **S5 (Daily Spar)** — it's the
fastest to build, fits the existing Arena infrastructure, and gives
the immediate "Wordle for arguments" hook that's screenshot-shareable.

If you pick two, add **S4 (Constellation Quests)** — mostly content,
high leverage, makes the existing map dramatically more useful.

If you pick three, add **S1 (The Pilgrimage)** — the highest-leverage
single feature in the addendum, but also the longest build.

S7 (Build-a-Philosopher) is the most distinctive idea on this list
and should be built when there's time for a project at that scale.

---

## Third pass (2026-05-25, after S1+S5 shipped)

S1 (The Pilgrimage) and S5 (Daily Spar) have shipped. The next
round needs to keep adding **destinations**, not refinements, and
should diversify the kinds of return-rhythms Mull supports (daily,
weekly, monthly, seasonal, life-long). Below are S9 through S20.

### S9 · The Crucible (~2 weeks)

Daily moral commitment + report. Different from Dilemma: Dilemma is
hypothetical; Crucible is a small **actual action** you commit to
doing today and report on tomorrow. Generated from your archetype's
tendencies and the dimension you're weakest on.

- Day's Crucible: *"Today, ask one person whose work you've quietly
  resented to tell you what they were trying to do. Just listen."*
- Tomorrow's check-in: *"Did you do it? How did it go?"*
- Mull tracks completion rate, surfaces a "Crucible streak" alongside
  the Dilemma streak.

The hook: Stoic evening-review meets Atomic Habits. New route:
`/crucible`.

### S10 · The Argument Diary (~2 weeks)

Log your real-world arguments and disagreements. When you have one,
write a brief account (200 words). Mull does three things:

1. Steelmans the other side for you (Haiku)
2. Identifies fallacies in your own framing (gently)
3. Pulls 2-3 philosophers from your kindred and shows how they'd
   approach the disagreement

Less Arena (synthetic opponents), more journal-with-feedback. People
who have a hard conversation per week become heavy users. New route:
`/argument-diary`.

### S11 · Constellation Quests (~1 week)

Already in S4 but worth re-listing: curated multi-step journeys
across the philosopher map. 5-9 thinkers in a deliberate order.
Quests would include:

- The Stoic trail
- Women philosophy left out
- The skeptic's walk
- The non-Western canon Mull doesn't surface enough
- The argument against existentialism
- The mystics' lineage

Completing a quest leaves a small connecting line between the
philosophers on your personal map. Mostly content-bound; trivial
code. New route: `/quests`.

### S12 · The Wandering Question (~2 weeks)

A single deep question travels with you across a week. Different
from Dilemma's daily one-shots.

- Monday: get the question (e.g., "What do you owe the version of
  yourself five years from now?"). Write what comes.
- Tuesday: Mull shows you how 2 philosophers near you answered it.
  React.
- Wednesday: a new angle from one further on the map.
- Friday: synthesis — Mull pulls your three responses + the
  philosophers' frames and writes a short note about how the
  question moved through you.

A weekly arc, smaller than Pilgrimage, with a real ending each time.
New route: `/wandering`.

### S13 · The Reading Hour (~2 weeks)

A 60-minute timer-bound reading session with a primary text Mull
picks for you (from your kindred), broken into 5 prompts that fire
at intervals during the hour. Like a guided meditation but for
philosophy text. After: a brief synthesis you can save to your diary.

Differs from Reading Club (S8) because it's solo + on-demand, not
cohort + scheduled. Lower friction. New route: `/read`.

### S14 · Letters Between Inheritors (~3 weeks)

In-fiction extension of the Inheritor mystery: users who've finished
the Inheritor can opt-in to receive letters "from the deceased" at
the rhythm of their archetype's task. (Hearth's task was "visit the
daughter"; the deceased writes back at +1 week asking how it went.)

Differs from S2 (Salon) because it's 1:1 with a fictional persona,
not multi-user. Differs from a simple email because it's structured
correspondence with prompts back to the user.

Heaviest infra cost (Resend cron + persistent conversation state)
but the emotional pull is uniquely Mull. New route: not really a
route — the surface is your inbox.

### S15 · The Council (~3 weeks)

When you face a real decision, convene a "council" of 3-5
philosophers from your map (you pick, or Mull picks). Each one
weighs in briefly on your specific case. Like the Reflection Wheel
(S3) but multi-philosopher and decision-focused.

Use case: actual dilemmas in your actual life. The output is a
multi-voice document you can save, share, return to. New route:
`/council`.

### S16 · Mull Open (~4 weeks)

Quarterly Arena tournament. Brackets, single elimination, all PvP.
Top 16 from the season's leaderboard get seeded; the rest enter via
a play-in qualifier. The finals are spectator-viewable with the judge's
verdict broken out by round. Annual champion gets a permanent badge
+ a featured "kindred minds" page.

The retention shape: builds toward a quarterly event, gives the Arena
a season structure. Currently the Arena is open-ended; tournaments
add narrative arcs. New routes: `/arena/open`, `/arena/open/[year]`.

### S17 · Constellations of Sympathy (~3 weeks)

Show the user **who else on Mull is near them** — anonymized, opt-in,
geographic if they consent. Could be: "12 users in your city are
within 0.1 cosine of you. Send a postcard?" The postcard is a
structured intro message Mull generates from both users' archetypes.

Connection without the toxicity of social media — moderated, bounded,
purposeful. New route: `/sympathy`.

### S18 · Personal Anthology (~2 weeks)

A user-built collection. As you encounter passages, quotes, or
exchanges you find significant (in Arena, Pilgrimage, Salon, etc.),
you can "save to anthology" with a 1-line note. Over months, you
build a personal commonplace book. Mull surfaces themes as the
anthology grows.

Borges meets Pinterest, with a 16-D model behind it. New route:
`/anthology`.

### S19 · The Year-In-View (~1 week + ongoing)

A live, always-updating annual page (different from Mull Wrapped
which is a frozen December moment). Shows month-by-month:

- Dimension drift
- Most-cited philosopher on your behalf
- Open questions you've started but not closed
- Conversations across people on Mull (anonymized aggregates)

The hook: a personal annual record that updates in real time.
Replaces seasonal-only emails with an always-on surface. New route:
`/year`.

### S20 · The Long Letter (~2 weeks)

Once a year (or once per major life event), Mull invites the user
to write a long letter — 2,000+ words — about something specifically
hard. Mull provides scaffolding (an outline tuned to the user's
archetype) and saves the letter to a vault only the user can read.
Five years later, Mull surfaces the letter for re-reading.

Long-form retention: the user might write only 5-10 letters in their
lifetime, but each one is a major commitment that bonds them to the
product permanently. The 5-year resurfacing is the loop. New route:
`/letters`.

---

### Cadence map of the 20 ideas

| Cadence | Surfaces |
|---|---|
| **Daily** | Today's Dilemma · Daily Spar (S5) · The Crucible (S9) |
| **Weekly** | The Wandering Question (S12) · The Salon (S2) · Arena weekly challenge |
| **Monthly** | Kindred Minds email (#6) · The Reading Hour (S13) |
| **Seasonal / Quarterly** | Reading Club (S8) · Mull Open (S16) |
| **30-day arc** | The Pilgrimage (S1) |
| **Annual** | Mull Wrapped · The Long Letter (S20) |
| **On-demand** | The Council (S15) · Reflection Wheel (S3) · Argument Diary (S10) · Personal Anthology (S18) · Constellation Quests (S4/S11) · Letters Between Inheritors (S14) |
| **Always-on** | Year-In-View (S19) · Build-a-Philosopher (S7) · Constellations of Sympathy (S17) |

The strongest retention picture comes from users having ONE daily
ritual + ONE weekly ritual + ONE longer commitment they're inside.
Daily Spar + Wandering Question + Pilgrimage is one combo. Crucible
+ Salon + Build-a-Philosopher is another. Mull doesn't need users
to do all twenty surfaces; it needs to offer enough that any user
can find their three.

### Next builds I'd pick

If S1 + S5 are now in production and you're picking the next 2-3:

1. **S9 (Crucible)** — completes the daily ritual menu. Stoic-shaped,
   distinctively Mull, ~2 weeks.
2. **S12 (Wandering Question)** — fills the weekly slot with
   something fresh each Monday; cheap to build, high stickiness.
3. **S15 (The Council)** — the on-demand surface users will share
   screenshots of. ~3 weeks but the most viral shape on this list.

S20 (Long Letter) is the most distinctively-Mull idea here and
should be built when there's time for something that won't move
metrics for two years but will make Mull permanent for its users.
