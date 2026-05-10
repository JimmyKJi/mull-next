# Mull launch runbook

Tuesday, May 12 2026 · 7:00 PM London (BST = UTC+1).

This is your single page for launch night. The order is: do the pre-flight checks Monday or Tuesday morning, post Tuesday at 7pm, then watch /admin and respond to the most-likely failures with the playbook below.

---

## Pre-flight (do Monday, or Tuesday morning)

Walk through this list on **your actual phone**, not desktop. Most friends will hit Mull from their phone — what works on desktop may break on iOS Safari.

### 1. Fresh-eyes new-user flow

Open mull.world in **a private/incognito tab on your phone** so you're not signed in.

- [ ] Hero loads, version pill is one line, H1 + lede + daily wisdom share a clean column edge
- [ ] "Begin →" on Quick start triggers the first question within ~1 second
- [ ] Answer 3 questions, hit "Skip" on one, hit "Back" — the back button restores your prior answer
- [ ] Finish all 20 questions
- [ ] Result reveal shows: archetype name, figure SVG, blurb, share row, archetype strip, constellation, debate ideas
- [ ] If your result is hybrid: "A close call" or "A productive tension" chip appears
- [ ] Tap "Post on Instagram" → opens `/share/<slug>` page → vertical card screenshots cleanly

### 2. Account creation

Still on mobile, in the same incognito tab.

- [ ] Tap "Save your map" or "Create account" → land on `/signup`
- [ ] Email + password form, fontSize ≥ 16px (no iOS zoom on focus)
- [ ] Sign up with a real test address (e.g. yourself+launch@gmail.com)
- [ ] Confirmation email arrives within ~1 minute → tap link → land on `/account`
- [ ] **Welcome email** arrives within ~1 minute (Resend live mode)
- [ ] `/account` shows: your archetype card, the share-result chip, the streak counter (1), the next-action card

### 3. Daily dilemma

- [ ] Tap "Today's dilemma →" or visit `/dilemma`
- [ ] Question loads, type a 2-sentence answer, tap Submit
- [ ] Analysis comes back within ~10 seconds
- [ ] Refresh `/account` → dilemma response appears in the timeline, dimensional shift visible

### 4. Mobile nav

- [ ] Top bar shows hamburger or all links visible (no hidden Exercises/Thinkers/Leaderboard)
- [ ] Tap each: Exercises, Thinkers (philosopher), Leaderboard (search), Compare — all load
- [ ] The floating "Feedback" button is visible bottom-right on every Next route (NOT on mull.html)

### 5. /admin (you only)

Sign in as your real Jimmy account.

- [ ] `/admin` loads
- [ ] Service-health pills: Supabase green, Anthropic green, Resend green or amber-with-note
- [ ] Stat cards show your test signups + quiz attempts + dilemma responses
- [ ] No errors in the "Errors" panel (or only ones you recognize)

---

## Launch night (Tuesday 7:00 PM London)

### Pre-launch (6:30 PM)

- [ ] Open `/admin` in one browser tab and leave it auto-refreshing
- [ ] Open Vercel deployments dashboard in another tab
- [ ] Open Resend dashboard in a third tab (delivery monitor)
- [ ] Open your Supabase project dashboard (logs / table editor) in a fourth
- [ ] Phone fully charged

### 7:00 PM — Post on Instagram + TikTok

Drop your post(s). Done.

### 7:00 – 9:00 PM — Watch the rooms

Things to glance for every 5–10 minutes:

- **Signups counter on /admin** — climbing means the funnel works
- **Errors panel on /admin** — should be empty or near-empty
- **Service-health pills** — all green
- **Vercel deployments** — no failed builds, no crashloops
- **Resend dashboard** — delivery rate ≥ 95%

You don't need to engage live. The system runs itself; your job is to notice if something's actively broken.

---

## If X breaks

### A. Signups working, but no one is finishing the quiz

→ Probably a JS error somewhere mid-quiz on a particular browser/device.

1. Open `/admin` errors panel — look for repeating client errors
2. Note the URL pattern
3. Open that URL in incognito on the device that breaks (Safari, Chrome, Firefox)
4. If you can repro: open browser dev tools console, see the error
5. **Don't try to hotfix during launch night.** Add a banner to `mull.html` that says "We're chasing a bug — please come back tomorrow if your quiz hangs" and call it a night

### B. AI features stop working (no dilemma analysis, no debate, etc.)

Most likely: Anthropic budget exhausted, or rate limit hit.

1. Check `/admin` health pill for Anthropic
2. Check Anthropic console for usage / billing alerts
3. **Graceful degrade is already wired:** the dilemma submit endpoint saves the user's response with `vector_delta: null` if the API is unavailable. They'll see "saved without analysis." Not a launch-killer.
4. Top up the Anthropic billing if budget hit, or accept the night runs without analysis

### C. Welcome emails not arriving

1. Check `/admin` Resend health pill
2. Check the Resend dashboard for the test signup — is it in "Bounced" or "Failed"?
3. Most likely: domain not yet verified, or `EMAIL_FROM` is set to an address Resend doesn't recognize
4. **Not a launch-killer** — users who signed up still have working accounts. Welcome email can re-fire when fixed (we're idempotent on `welcome_emails` table; you'd need to delete a row to retry per-user).

### D. Supabase down or slow

1. Check Supabase status page (status.supabase.com)
2. If their issue: nothing you can do; tweet/IG-story an apology
3. If your project: check Supabase dashboard → project quotas, especially row-count near plan limits

### E. Server returning 500 on dilemma submit

1. Check `/admin` Errors panel
2. If it's an `ANTHROPIC_API_KEY missing` message → set it in Vercel env vars + redeploy
3. If it's a Postgres error → check Supabase logs; most likely a missing migration

### F. Friends DM you saying "the site is broken"

1. **Get a screenshot from them first** — cheap, surfaces the actual error
2. If it's a real bug: thank them, tell them you're on it
3. **Don't push code at launch night** unless it's truly catastrophic. Hotfixes at 8pm with friends watching is the worst time. Make a note, fix tomorrow morning, ping them when fixed.

### G. Server is fine but quiz answers feel wrong

This is calibration drift, not a bug. The quiz isn't broken. Tell users it's a v0.9 build (the version pill says exactly this) and that calibration improves over time. The 16-D position is faithful even when the archetype label feels rough.

---

## Database migrations to confirm applied

Before launch, confirm these are in your Supabase project. All are idempotent (`IF NOT EXISTS` / `OR REPLACE`), so re-running is safe.

```
20260514_feedback.sql
20260514_streak_grace.sql
20260514_reflection_loop.sql
20260514_welcome_emails.sql
20260514_rate_limits.sql
20260514_error_log.sql
20260514_streak_email_log.sql
```

To check: Supabase → Database → Tables. You should see `feedback`, `welcome_emails`, `rate_limit_events`, `error_log`, `streak_break_emails` in the list.

## Vercel env vars to confirm set

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY`
- `CRON_SECRET`
- `ADMIN_USER_IDS`
- `EMAIL_PROVIDER_API_KEY` (optional — without it, emails dry-run)
- `EMAIL_FROM` (optional — same)
- `RATE_LIMIT_SALT` (optional — fallback constant if missing)

## Cron workflows in GitHub Actions

- `dilemma-reminder.yml` — hourly
- `weekly-digest.yml` — Sunday 09:00 UTC
- `streak-break.yml` — daily 14:00 UTC
- `rate-limit-cleanup.yml` — daily 03:00 UTC (added with this runbook)

All three need `CRON_SECRET` set as a repo secret.

---

## Your "I'm okay" mantras for launch night

- Some bugs will happen. They are fixable. None are fatal.
- Friends are forgiving. The version pill literally says "early build · hand-built." They expect rough edges and will respect that you shipped.
- Engagement on launch night is mostly a curiosity spike. Real retention happens on day 3 and day 14. Don't read Tuesday night's numbers as the verdict.
- The map, the questions, the archetypes — these are the product. The UI bugs are not the product. Most users won't notice what you spent the last week polishing.
- You built this on nights and weekends. That's the whole reason it's worth shipping.

Good luck.
