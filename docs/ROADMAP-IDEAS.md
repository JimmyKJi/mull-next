# Mull — features and content ideas, ranked

A long list of things Mull could become, then narrowed through three deliberation passes. Final ranking is at the bottom — start there if you only have five minutes. Notes above are the working that produced it.

---

## Round 0: brainstorm (no judgment)

### Content additions to existing surfaces

1. More canonical debates beyond the current 8 (free will, ethics, sacred, mind-body, etc). Topics: nature of beauty, animal ethics, justice between generations, the role of art, technology and the good life, attention and meaning, friendship, work, the political state.
2. Translations of the 16 dimension names + descriptions, properly human-vetted per locale.
3. Translations of the 10 archetype names + blurbs, properly human-vetted per locale.
4. Proper translations of the 70 quiz questions across all 8 locales.
5. Translations of the philosopher database (166 entries), at least the names + dates + one-line ideas.
6. More philosophers in the constellation — Asian (more Daoists, Mohists, Indian Buddhists), African (ubuntu philosophy, Kwame Nkrumah, Achille Mbembe), Indigenous traditions, female philosophers (Hypatia, Anne Conway, Elisabeth of Bohemia, Susanne Langer, Anscombe, Foot, Murdoch, Nussbaum), more contemporary thinkers.
7. Hyperlinked SEP / Wikipedia references on each philosopher card.
8. Audio version of each archetype — read aloud by a human, since philosophical text rewards being heard slowly.
9. Quotes per archetype: 3-5 hand-picked quotes that capture the archetype's spirit.
10. A "starter reading list" per archetype — 3-5 books/essays specifically chosen to deepen this archetype.
11. More daily dilemmas (currently 30 — expand to 365 so there's a year of unique prompts).
12. Themed dilemma cycles: a week of prompts on death, on work, on love, etc. User can opt into a cycle.
13. More philosophical exercises — currently 5. Add: Marcus's morning preparation, Pythagorean evening review, Loving-kindness meditation, Examen, Phenomenological reduction (epoché), Lectio divina, Buddhist tonglen, Camus's absurd contemplation, etc.
14. A "today in philosophy" — anniversaries of births, deaths, publications, with a one-paragraph note.

### New product features (small)

15. Public profile **search** (built tonight).
16. **Account deletion + data export** (built tonight).
17. **/about route** as a real Next.js page (built tonight).
18. **Mobile pinch-to-zoom on map** (built tonight).
19. **Empty-state first-steps card on /account** (built tonight).
20. Email reminders for the daily dilemma — opt-in, sent at user-chosen time (scaffold built; needs SMTP wiring).
21. SMS reminders (probably not — high cost, low marginal value).
22. Push notifications via web push (better than email for engagement, no third-party).
23. Public profile customization: a small color accent the user picks; an optional "favorite philosopher" they pin.
24. Per-public-profile RSS feed of the user's public dilemmas + diary entries.
25. Embed widget — paste a code snippet on a personal site to show your archetype + map.
26. Daily streak emails: hit 7, 30, 100 days — small congratulation.
27. Streak recovery: if you miss a day, "save your streak" via a paid one-time recovery (Mull+).
28. Two-day reminders if a user starts a quiz but doesn't finish.
29. "Where am I drifting?" — a weekly summary email comparing this week's vector to last week's, with a Claude-generated paragraph on what shifted.

### New product features (medium)

30. **"Mo" (the AI companion + diary cluster map)** — already in ROADMAP.md.
31. Comments on public dilemma/diary entries — opt-in per entry.
32. Following — let users follow other public profiles, get notified when they post.
33. Group reading: a small persistent room of 3-8 people who agreed to read the same book/essay, with shared notes.
34. Couples mode: two users link accounts, see how their maps overlap and diverge.
35. Family/team mode: same but for a small group; shows the centroid + the gaps.
36. Print-on-demand: a beautiful printed map of your archetype + position, shipped as a poster (revenue + memento).
37. Gift cards / Mull+ for someone else.
38. Yearly retrospective (around Dec 28): every Mull+ user gets a Claude-generated essay on how their map shifted in the year.
39. A "challenge a thinker" mode — Claude steel-mans the philosopher most opposed to your current position, then you respond.
40. Collaborative debates — two real users debate a topic in turn-based form, Claude moderates.
41. Audio diary entries — record voice, transcribe, run prose-to-vector.
42. Export your map as a 3D model (glTF/USDZ) you can drop in a notes app or AR viewer.
43. Apple Watch / wearable complication: today's dilemma question in a glance.

### New product features (large)

44. **Mo + cluster map** (premium, in ROADMAP).
45. Real-time philosophy salons: once a week, a 30-min live group chat with Claude facilitating, organized by archetype affinity.
46. Tutored Mull+ tier: a real philosophy postgrad available 1-on-1 by appointment for $20-50 a session.
47. Course content — 4-6 week structured courses around topics ("Stoic year", "Ethics from Aristotle to now", "Buddhist epistemology"). Free intro, paid full course.
48. Books + audiobooks: original Mull-authored short books on each archetype.
49. Mobile native app (iOS/Android) wrapping the web app + push notifications.
50. Open the philosopher database via API for academic researchers (free) and curious developers (paid).
51. White-label "Mull for organizations" — workplaces, religious communities, schools licensed to run their own internal Mull instance.
52. A grant program: $1000 to one user/month who proposes a philosophical project they'd do with the time freed by Mull+.
53. Annual conference / weekend retreat — 30-50 Mull users meet in person.

### Quality / craft

54. A/B test the quiz: are people more honest with multiple-choice or sliders?
55. Add a "skipped questions" recap — show the user what they didn't answer, in case they want to revisit.
56. Save quiz progress mid-flow so they can come back.
57. Replace the 16-D vector visualization with a radar chart on the results page.
58. Animated map: when a user's vector shifts, the dot smoothly moves to its new position.
59. Better archetype illustrations — commission a real illustrator to redo the figures.
60. Improve copy on the long-tail philosopher entries (some are sparse).
61. Per-philosopher discussion thread (community-curated notes).
62. A "notable disagreements" section per philosopher — who would they fight with on this view?
63. Add a "how confident are you in this answer?" slider per quiz question — incorporate into vector weighting.
64. Better mobile map: lower polygon count, pre-baked positions, smaller bundle.
65. Offline-capable PWA: quiz works without internet, syncs later.

### Trust / business

66. Public revenue dashboard — show monthly costs vs. monthly Mull+ income transparently.
67. Open-source the 16-D model + archetype design (not the AI integrations or user data) under a permissive license.
68. Quarterly "what we built and why" letter to subscribers.
69. Audit log: every Mull+ user can request a server-side timeline of every action they've taken on the site.
70. SOC 2 / privacy-attestation if/when needed for org accounts.

---

## Round 1: cull

Strike anything (a) we're not equipped to ship in <12 months, (b) requires hardware or live people we don't have, or (c) duplicates something already on the roadmap.

**Removed**: 21 (SMS — cost), 33 (group reading rooms — needs realtime infra, big), 34 (couples — cute but small audience, defer), 35 (family — same), 39 (challenge a thinker — overlaps with debate-me), 41 (audio diary — speech transcription complexity), 42 (3D map export — niche), 43 (Apple Watch complication — wrapper app first), 45 (live salons — operational overhead), 46 (tutored tier — operational overhead, gig-economy headache), 49 (native mobile app — wrap-PWA approach is faster), 50 (API for researchers — premature), 51 (white-label orgs — premature), 52 (grant program — premature), 53 (annual conference — premature), 67 (open-source the model — too soon, gives away differentiation), 70 (SOC 2 — only if orgs become real customers).

What's left: 53 ideas, all theoretically buildable in the next year by one person + Claude.

---

## Round 2: rate each surviving idea on (Impact 1-10) × (Effort 1-10, lower = less effort)

Score = Impact / Effort (rough cost-of-value). Top of list = best ROI.

| # | Idea | Impact | Effort | Score |
|---|------|--------|--------|-------|
| 11 | Expand daily dilemmas to 365 | 8 | 2 | 4.0 |
| 13 | Add 5–10 more philosophical exercises | 7 | 2 | 3.5 |
| 9  | Quotes per archetype (3-5 each) | 6 | 2 | 3.0 |
| 10 | Starter reading list per archetype | 7 | 3 | 2.3 |
| 26 | Daily-streak congratulations email | 6 | 3 | 2.0 |
| 56 | Save quiz progress mid-flow | 8 | 4 | 2.0 |
| 6  | More philosophers (women, Indigenous, African, Asian) | 9 | 5 | 1.8 |
| 7  | SEP/Wikipedia links on philosopher cards | 5 | 3 | 1.7 |
| 14 | "Today in philosophy" anniversaries | 5 | 3 | 1.7 |
| 38 | Yearly retrospective essay (Mull+) | 8 | 5 | 1.6 |
| 65 | Offline PWA | 8 | 5 | 1.6 |
| 12 | Themed dilemma cycles | 7 | 5 | 1.4 |
| 23 | Public profile color/favorite-philosopher customization | 5 | 4 | 1.25 |
| 29 | Weekly drift summary email | 6 | 5 | 1.2 |
| 55 | Skipped-question recap | 4 | 4 | 1.0 |
| 57 | Radar chart on results | 4 | 4 | 1.0 |
| 58 | Animated map shifts | 5 | 5 | 1.0 |
| 22 | Web push notifications | 7 | 7 | 1.0 |
| 24 | Per-profile RSS feed | 4 | 4 | 1.0 |
| 25 | Embed widget | 6 | 6 | 1.0 |
| 36 | Print-on-demand poster | 7 | 7 | 1.0 |
| 5  | Translate philosopher database (top tier) | 8 | 8 | 1.0 |
| 4  | Translate quiz questions (8 locales) | 8 | 8 | 1.0 |
| 3  | Translate archetype names + blurbs | 7 | 7 | 1.0 |
| 2  | Translate 16 dimension names + descriptions | 7 | 7 | 1.0 |
| 27 | Streak recovery (Mull+ paid) | 6 | 6 | 1.0 |
| 28 | Quiz-abandonment reminders | 5 | 5 | 1.0 |
| 31 | Comments on public entries | 7 | 8 | 0.9 |
| 32 | Following other public profiles | 7 | 8 | 0.9 |
| 8  | Audio archetype readings | 6 | 7 | 0.86 |
| 30 | Mo + cluster map (premium) | 10 | 12 | 0.83 |
| 47 | Structured 4–6 week courses | 9 | 12 | 0.75 |
| 40 | Collaborative human-vs-human debates | 7 | 10 | 0.70 |
| 1  | More canonical debates | 6 | 10 | 0.60 |
| 66 | Public revenue dashboard | 4 | 7 | 0.57 |
| 59 | Commissioned archetype illustrations | 7 | 13 | 0.54 |
| 64 | Better mobile map (rewrite) | 6 | 12 | 0.50 |
| 60 | Improve sparse philosopher entries | 4 | 8 | 0.50 |
| 48 | Original Mull-authored books | 8 | 16 | 0.50 |
| 61 | Per-philosopher community discussion | 5 | 12 | 0.42 |
| 62 | "Notable disagreements" per philosopher | 4 | 10 | 0.40 |
| 63 | Confidence sliders per quiz answer | 5 | 13 | 0.38 |
| 37 | Gift cards / Mull+ for someone else | 4 | 10 | 0.40 |
| 68 | Quarterly "what we built" letter | 4 | 4 | 1.0 |
| 69 | Audit log per Mull+ user | 5 | 8 | 0.63 |
| 54 | A/B testing the quiz | 4 | 10 | 0.40 |
| 20 | Email reminders (wire up scaffold) | 8 | 4 | 2.0 |

Note: scoring is rough — Effort > 10 is shorthand for "more than one focused month".

---

## Round 3: layer Mull's mission on top

Pure ROI ranks small content additions highest. But Mull's principles (the About page) say we want to be a place that takes philosophy seriously, not a habit-loop optimization tool. Re-weight ideas by **how much they advance the thesis** ("philosophy is examining your own thinking, with company across history") on a 1–5 scale, then multiply.

A few items get demoted (streak gamification, A/B testing) and a few get promoted (more diverse philosophers, audio readings, structured courses, the Mo project). The underlying ethos: better content > more engagement hooks.

---

## Final ranking — ship next

Three buckets, ordered by what to do first within each.

### Bucket A: ship now (high ROI, ethos-aligned, weeks not months)

1. **Expand daily dilemmas to a full year (365)**. Currently ~30 looping. Easy wins for engagement and retention without engagement-loops; the daily question is the heart of the practice.
2. **Wire up the email reminder scaffold I built tonight**. Drop in a Resend or Postmark API key, add an opt-in checkbox in the user's settings, ship.
3. **Quotes per archetype (3-5 each)**. One paragraph of editorial work per archetype, shows up on the archetype detail page. Texturizes thin pages.
4. **Starter reading list per archetype**. Already exists in some form — clean it up, deepen it, link to publishers/libraries.
5. **5–10 more philosophical exercises**. The /exercises tab I scaffolded tonight is hungry for more content. Easy editorial work.
6. **Save quiz progress mid-flow**. Significant abandonment risk on the 50-question detailed quiz; this is a ~half-day fix.

### Bucket B: ship next (broader reach, bigger impact, real-but-bounded effort)

7. **Diversify the philosopher constellation**. Add at least 20 women, 10 African / Asian / Indigenous thinkers currently underrepresented. This is the single biggest credibility issue for a serious philosophy product.
8. **Translate dimension + archetype names properly**. Per-locale human pass. The chrome translates; the labels users actually see when reading their results don't.
9. **Yearly retrospective essay** (Mull+ feature). One Claude-generated essay per user around Dec 28 about how their year shifted philosophically. Big gift, no-repeat-cost-per-user, paid-only.
10. **Themed dilemma cycles**. A week of prompts on a theme, opt-in. Restores narrative shape to the daily practice.
11. **Offline PWA**. Service worker + cached quiz. Lets people answer dilemmas on a flight; small bundle work. 
12. **Streak congratulations** at 7/30/100 — sparingly, no manipulative loops.

### Bucket C: ship later (transformative but big, or premium unlocks)

13. **Mo + diary cluster map** (already in main ROADMAP.md). The biggest qualitative leap. Premium.
14. **Translate the philosophical content fully** (quiz, philosopher database, About) — ~2240 strings × 8 locales. Machine-draft via Claude API + scholar review per locale. Probably a multi-month project once exams are done.
15. **Structured 4–6 week courses**. "Stoic year", "Ethics from Aristotle to now", "Buddhist epistemology". Free intro, paid full. Real product expansion.
16. **Public profile customization** + comments + following. Builds the community surface intentionally — but only after Mo, since cluster discovery is what would make following meaningful.
17. **Print-on-demand archetype poster**. Revenue stream + a contemplative artifact that sits on a wall and reminds the user they thought about this.
18. **Web push notifications**. Better than email; harder than email. Defer until someone asks for it.

### Don't do (until evidence demands)

- Native mobile app, watch complication, white-label org tier, conferences/retreats, live salons, tutored sessions, open-source the model, public revenue dashboard, SMS, audit logs, SOC 2.

---

## TL;DR — three things to discuss when you're back

1. **Bucket A is editorial labor**. Most of it (1, 3, 4, 5) is writing more content, not building. Want me to start drafting? I can do dilemmas, quotes, reading lists in parallel.
2. **Item 7 (diversifying philosophers) deserves your hand directly** — get this wrong and the project loses credibility with the audience that would most benefit. We should pick the additions together.
3. **Item 9 (yearly retrospective) has the best premium-feature ROI** — gift-shaped, hard to copy, low marginal cost, and we already have everything we need (vector trajectory + Claude API). Could be the first concrete reason to buy Mull+.
