# Overnight UX walkthrough — for Jimmy to read in the morning

Persona-driven walkthroughs. Small fixes applied inline (those land in commits). Bigger judgment calls listed below — don't ship without your eye on them.

## Quick summary — small fixes I applied tonight

1. **Translated quiz `Skip / Back / Continue` buttons** — they had fallen through the i18n net and were hardcoded English in the rendered HTML.
2. **Updated outdated philosopher count** in the results page subtitle ("166 thinkers" → "Over two hundred thinkers").
3. **Fixed the misleading "AI is used in two specific places" claim** in both `mull.html` and `/about` — now honestly enumerates dilemma analysis, diary analysis, exercise reflection analysis, debate generation, and Mull+ retrospectives, while keeping the principle that AI doesn't shape Mull's worldview, only your individual writing's reflection of it.
4. **Added "Take this further in the diary →" link** in the post-submission area of `/dilemma`. Catches the longer thread when a daily prompt ignites more than the form can hold.
5. **Added `noindex,nofollow,nocache` metadata** to `/account`, `/account/profile`, `/diary`. Belt-and-braces alongside `robots.ts` — search engines should not be indexing user-private pages.

All of these compile clean (`tsc --noEmit` exit 0). They're in the working tree, ready for a commit.

## Big calls for you (numbered, ordered roughly by impact)

The bigger judgment calls are in the persona sections below. Quick index:

| # | Call | Persona who surfaced it |
| --- | --- | --- |
| 1 | Brandbar progressive disclosure (hide secondary nav until signed in / has data) | Maya — first-time visitor |
| 2 | Tighten the construction banner from 3 sentences to 1 | Maya |
| 3 | Move v0.9 pill out of the brandbar (footer or About) | Maya |
| 4 | "What's next?" card after quiz completion | Maya |
| 5 | A `/methodology` page defending the 16-D model | Sam — philosophy student |
| 6 | Per-philosopher source citations ("why this position?") | Sam |
| 7 | Streak surfacing on the dilemma page | Priya — daily user |
| 8 | "Past responses to similar prompts" feature | Priya |
| 9 | (✓ APPLIED) Deep-link from dilemma → diary | Priya |
| 10 | Quarterly audit of the principles against current reality | Marcus — skeptic |
| 11 | Public model card listing AI integrations | Marcus |
| 12 | Server-side data inventory in About | Devi — privacy-minded |
| 13 | Cookie disclosure (probably no banner needed, just an honest line) | Devi |

Detailed reasoning + concrete suggestions for each are in the persona sections. Read those when you have ~10 quiet minutes.

---



---

## Cycle 1 — Maya, 28, comms manager, no formal philosophy

She lands on `/`. Above the fold she sees:

- a brand mark
- seven nav links (Today's dilemma, Diary, Simulated debate, Exercises, Search minds, About, Archetypes)
- a language picker
- a v0.9 pill
- a small gold version banner
- a longer gold-bordered construction notice
- and only THEN the actual hero h1.

**Verdict: too much chrome above the fold.** A first-time visitor doesn't yet know what most of the nav links mean — Diary, Debate, Exercises, Search-Minds are all features that need context. They also can't see the actual product (the quiz CTAs) until they scroll, on most laptops.

**Small fix applied this round:**
- Translated the quiz `Skip / Back / Continue` buttons (were hardcoded English in the rendered HTML — fell through the i18n net).

**Big calls for Jimmy** (don't change without your eye):

1. **Brandbar progressive disclosure.** Consider hiding the secondary nav links until the user is signed in OR has completed a quiz. Right now `Diary`, `Simulated debate`, `Exercises`, `Search minds` all show as top-nav links to a brand-new visitor with no quiz history — they click in and find walls saying "sign in to use this feature." That's a lot of dead-ends to discover. Either:
   - Don't show those nav items until the user has data (most opinionated), or
   - Keep them but soften them (e.g. group them under a "Tools ▾" dropdown), or
   - Leave as-is and rely on the empty-state pages to do the lifting.

2. **The construction banner is three sentences when one would do.** Right now Maya reads ~80 words explaining cost-handling before she sees what the product even is. Suggested tighter version: "Mull is in early build — subscriptions aren't live yet, so AI features are paid out of pocket and may pause briefly if the budget runs out. Thanks for your patience." Cuts to ~30 words. The longer version belongs on /about for those who care.

3. **`v0.9` pill in brandbar.** Means nothing to a first-time visitor; reads as developer fingerprint. Either move it to the footer or to the About page. (Possibly: only show to signed-in users who've opted into "show me build details.")

4. **Onboarding signposts after the quiz.** Once Maya finishes the quiz and gets her archetype, what does she do next? The results page lists her archetype + the closest philosophers. But there's no clear "here's what to do next" beyond reading the archetype detail. A small "What's next?" card with three suggestions (read about your archetype / try today's dilemma / save your map by signing up) would convert curiosity into engagement without being pushy.

---

## Cycle 2 — Sam, philosophy student, expects rigor

Sam takes the detailed quiz. They want to know:
- How were these 16 dimensions chosen? (Answer is in the /about & /how-this-works details — fine.)
- Are the dimensions orthogonal? (Not addressed anywhere.)
- Why these specific philosopher positions? (The transparency-about-build is the closest answer; Sam would want to see *which positions in which writings* support the vector for, say, Wittgenstein. Out of scope for v0.x but a real question.)

**Small fix applied:**
- Results page subtitle for the constellation said "One hundred and sixty-six thinkers" — outdated. Updated to "Over two hundred thinkers."

**Things Sam would object to:**

- Some forced-choice quiz answers feel reductive. E.g. "Justice — what is it, primarily?" gives 6 options and forces a single pick. A serious student might want to grade their assent (this is a known limitation of single-choice forms; the detailed quiz already mitigates it via more questions, but the answer set itself is still mutually exclusive). Possible fix: more multi-select questions (the `multi: { max: 2 }` mechanism is already there).

- The "Closest companions" section names a "patron, ally, shadow" — but doesn't show why each was picked. A one-line gloss ("nearest in dimensional space," "near you on these axes but distant on those," "anti-correlated on the dimensions you scored highest") would make the picks legible to someone who can interpret it.

**Big calls for Jimmy:**

5. **Defend the 16-dimensional model somewhere reachable.** Right now if a serious philosophy student wants to know whether these dimensions are well-defined, orthogonal, or empirically grounded, they have nowhere to read about it beyond the high-level About page. A "/methodology" page (one carefully-written essay, ~1500 words) explaining (a) why these 16, (b) why not the standard MBTI/political-compass approach, (c) what the dimensions are NOT (they aren't strict mutually-exclusive axes), (d) the open questions you know exist — would buy a lot of credibility with the audience that would actually benefit most.

6. **Per-philosopher source citations.** When you click a philosopher and see their position vector, the user has to take it on trust that "Wittgenstein scored high on Mystical Receptivity" is right. A small "Why this position?" toggle showing 1–2 quoted lines from their actual writings + the dimensional reading would convert skeptics. Editorial work, not engineering — needs you specifically.

---

## Cycle 3 — Priya, returning user, mobile-first, 90-day dilemma streak

She opens `/dilemma` on her phone every morning during her commute. The page loads fast and the question is right there. The textarea is the right font-size (17px on iOS, so no auto-zoom — good).

What she'd want that's missing:
- A way to see **previous answers** without navigating to `/account` and scrolling. Specifically, after she's submitted today, the page shows her response + analysis + shifts + a "see trajectory" link. Adding "see your past responses" would keep her in the dilemma flow.
- A glance at **how long her streak is** would feel rewarding. Currently the streak shows on `/account` but not here.

**Big calls for Jimmy:**

7. **Streak surfacing on the dilemma page.** If a user has a 30-day streak, showing "30 days · keep going" somewhere unobtrusive (eyebrow line, maybe?) would be a satisfying moment of recognition without veering into engagement-loop territory. Just acknowledgment.

8. **"Past responses to today's prompt"** — once we have a year of data, an interesting feature would be: at the bottom of today's submission, show the user *their own* previous responses to similar prompts (i.e. ones that hit the same dimensions). Cheap to compute, surprising to read.

9. **Deep-link from dilemma → diary.** If the daily prompt ignites longer thoughts that don't fit the dilemma format, a "Take this to the diary →" link below the textarea would let the user catch the longer thread. Small touch, big psychological signal: "we trust your thought to overflow this form." **APPLIED THIS ROUND** — added the link in the post-submission card on `/dilemma`.

---

## Cycle 4 — Marcus, skeptic, suspicious of "AI app" claims

He hits the About page first. Reads the principles. Stops on:

> "Not an 'AI app'. AI is used in two specific places — analyzing your written daily dilemma into dimensional vectors, and generating philosopher dialogues."

He counts. Diary uses AI. Exercise reflections use AI. Yearly retrospective uses AI. Debate-with-yourself (Mull+) uses AI. So the claim "two specific places" is **already misleading** by the current codebase's own standards. As a skeptic, he reads this and thinks: either the About page is out of date (in which case, what else is?) or the team is downplaying.

**Small fix applied this round:**
- Updated both copies of the "Not an AI app" promise (in `mull.html` and in the `/about` Next.js route) to honestly enumerate the four places AI shows up, while keeping the principled stance: the model + archetypes + dimensions + quiz + philosopher positions + figures are human-designed, AI doesn't shape Mull's worldview, only your individual writing's reflection of it.

**Big calls for Jimmy:**

10. **Audit the "principles" promises against current reality, periodically.** As the product grows, the principles need a quarterly audit — what was true at v0.5 isn't necessarily true at v1.0. Maybe a /principles page (separate from /about) that's a living document, with edit history visible? Radical honesty as a feature.

11. **Public model card.** A page that lists, for each of Mull's AI integrations: which model, which prompt, what data goes in, what comes out, what data we keep, what we never train on. Two screens, but it would make the "not just an AI app" claim real instead of rhetorical.

---

## Cycle 5 — Devi, privacy-minded user

She loves the philosophy angle but starts at /about. Reads "no selling your data," "no ads," "you can download or delete." She likes those promises. Then she signs up to try the dilemma. After her first response, she goes to /account/profile to look at the controls.

What she finds:
- Public-profile toggles per entry ✓
- Searchable toggle ✓
- Download my data (JSON) ✓
- Delete account (with confirmation) ✓

Solid. But she also asks:
- "What's stored on the server beyond what I write?" (Just the textareas + metadata, but it's not stated explicitly anywhere.)
- "Can search engines index my account page?" (Robots.txt says no — but she'd want to verify on the page itself with a `noindex` meta.)
- "Are there cookies?" (Yes — locale + auth — but no banner.)

**Small fixes applied this round:**
- Added `<meta name="robots" content="noindex,nofollow,nocache">` (via Next.js metadata) to `/account`, `/account/profile`, `/diary`. Belt-and-braces alongside the existing robots.txt disallow. (Left `/dilemma` indexable since the public daily question itself is shareable; private user content is never written into the rendered HTML for crawlers.)

**Big calls for Jimmy:**

12. **Server-side data inventory in `/about` or `/principles`.** Two short paragraphs: "Here's everything that ends up on our server when you use Mull, and how long we keep it." Privacy gets stronger when you're concrete about it. Currently we say "no selling your data" but don't say what's stored. (You probably know: email, hashed password via Supabase auth, plus the row contents of the user-scoped tables. Worth listing explicitly.)

13. **A real cookie banner — or, better, a "we don't need to ask."** Mull only sets two cookies right now: `mull_locale` (preference, "strictly necessary" exempt under most cookie laws) and Supabase session tokens (also strictly necessary for logged-in users). We probably don't need a banner under EU/UK rules — but a small note in About saying "Mull uses two cookies, both strictly necessary, no analytics or tracking" would be more honest than a checkbox-and-banner ritual.


