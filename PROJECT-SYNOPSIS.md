# Mull — project synopsis

A handoff briefing for a fresh Claude chat. Read this top-to-bottom before touching the codebase.

---

## What Mull is

Mull (mull.world) is a philosophy app, not a personality test. The core insight: instead of teaching you what dead philosophers thought, ask what *you* think on real questions, then show you where your worldview sits among ~500 historical thinkers.

The maintainer is **Jimmy** (jimmy.kaian.ji@gmail.com). It's a passion project, hand-built nights-and-weekends, no investors, no ads. Currently v0.9 — soft-launching to ~30–50 friends from Instagram + TikTok on **Tuesday May 12 2026 at 7pm London**.

The product is built around four ideas:

1. **A 16-dimensional model of philosophical tendencies** (TR Trust in Reason, MR Mystical Receptivity, AT Ascetic Tendency, VA Vital Affirmation, SS Sovereign Self, CE Communal Embeddedness, RT Reverence for Tradition, TE Trust in Experience, etc.). Every position in the system — yours, Buddha's, Hume's — is a 16-D vector.

2. **Ten archetypes** (Cartographer, Keel, Threshold, Pilgrim, Touchstone, Hearth, Forge, Hammer, Garden, Lighthouse) — each is a target vector. Your archetype is whichever target your vector is closest to (cosine similarity). Your archetype is "a useful label, not a verdict" — the 16-D position is the real result.

3. **A daily dilemma** — one new philosophical question each morning. The user writes a free-text response; Claude analyzes it into a small dimensional shift, which moves the user's vector over time. The trail of shifts is visible on /account.

4. **A constellation of ~500 philosophers** with hand-tuned 16-D positions, browsable on /philosopher and visible as nearby stars on the user's map.

Other surfaces: diary (long-form journaling that also shifts the vector), exercises (Stoic / Socratic / Buddhist practices like premortem, steelmanning, view-from-above), debate (simulated philosopher debates via Claude), compare (side-by-side maps of two users), share (screenshot-friendly result card), leaderboard (public profiles ranked by activity).

---

## Tech stack

- **Next.js 16.2.5** with App Router + Turbopack
- **TypeScript** strict mode
- **Supabase** for Postgres + Auth + RLS + RPCs
- **Vercel** for hosting (Hobby tier — important: only allows daily crons)
- **GitHub Actions** for hourly/daily crons (replaces Vercel Cron)
- **Resend** REST API for transactional email (no SDK)
- **Anthropic Claude API** for AI analysis + debate generation
- **next/og** for OG image generation
- **Vercel Web Analytics** + **Speed Insights**
- No client-side state library — server components + lightweight client components

---

## Repository layout

The project is **dual-rendered**: a giant static `public/mull.html` (the homepage + quiz + result reveal + map), and a Next.js app for everything else.

```
public/
  mull.html              ← THE big one. Static landing + quiz + results.
                           ~8500 lines. Contains: 20-q + 50-q quiz arrays,
                           ARCHETYPES, PHILOSOPHERS, FIGURES (SVG), all
                           inline CSS, all inline JS, i18n translations.
                           Rewritten to '/' via next.config.ts.
  og.png                 ← 1200x630 site OG image
  favicon.svg, favicon-512.png

app/
  layout.tsx             ← root layout. metadata, GlobalTopBar, Analytics,
                           SpeedInsights, FeedbackButton (mounted globally).
  page.tsx               ← Next.js boilerplate, NEVER served (rewrite covers /).
  robots.ts, sitemap.ts  ← SEO basics.
  error.tsx              ← global client error boundary, posts to /api/error-report.

  account/page.tsx       ← THE hub. Shows archetype, vector, trajectory,
                           dilemma timeline, diary, debates, exercises,
                           public-profile settings, account export/delete,
                           ReflectionCard, NextActionCard, ReferralCard,
                           DilemmaReminderCard, WelcomePinger.
  account/retrospective/ ← Mull+ year-end retrospective panel.

  dilemma/page.tsx       ← Daily dilemma form + recent + streak.
  dilemma/archive/       ← Calendar of past dilemmas. Mull+ for full access.
  dilemma/dilemma-form.tsx ← client form for submission

  diary/                 ← Long-form journaling.
  exercises/             ← 16 hardcoded exercises with reflection forms.
  debate/                ← Watch two philosophers debate (or "duel" them).
  search/                ← Search philosophers + leaderboard tabs.
  compare/               ← Compare-with-a-friend by handle.
  archetype/             ← /archetype + /archetype/[slug] detail pages.
  philosopher/           ← Same pattern.
  share/[slug]/          ← Screenshot-friendly vertical result card.
  u/[handle]/            ← Public profile pages.
  signup/, login/        ← Auth pages.
  about/, methodology/   ← Long-form static pages.
  privacy/, terms/       ← Legal pages (drafted in Mull voice).

  admin/                 ← Owner-only metrics dashboard. Auto-refreshes
                           every 60s. Service-health pills (Supabase /
                           Anthropic / Resend), stat cards, archetype
                           distribution, latest 10 feedback, latest 8
                           errors. Gated to ADMIN_USER_IDS env var.

  api/
    dilemma/submit/        ← POST: scores + analyzes a dilemma response.
    dilemma/submit-archive/← Mull+ retroactive submission.
    dilemma/reflection/    ← 8-week reflection loop GET/POST.
    feedback/              ← Anonymous feedback notes (rate-limited).
    profile/save/, profile/search/  ← public profile CRUD + search.
    diary/save/, diary/delete/
    exercises/reflect/
    debate/me/, debate/generate/
    account/export/        ← downloads JSON of all user data
    account/delete/        ← wipes 19 user-scoped tables + auth row
    account/retrospective/ ← Mull+ retrospective generation
    account/welcome/       ← one-time welcome email, idempotent
    notifications/dilemma-reminder/  ← single-user reminder fire (legacy)
    billing/checkout/, billing/webhook/  ← Stripe (NOT live yet)
    error-report/          ← client error boundary endpoint
    referral/save/         ← generates user's code, attributes referrer cookie
    cron/dilemma-reminders/   ← hourly TZ-aware reminder cron
    cron/weekly-digest/       ← Sunday digest cron
    cron/streak-break/        ← daily streak-loss courtesy email
    cron/rate-limit-cleanup/  ← daily prune of rate_limit_events table
  r/[code]/route.ts        ← /r/<code> referral landing → cookie + redirect

components/                ← Mostly client components.
  global-topbar.tsx, topbar-mount.tsx
  feedback-button.tsx      ← floating bottom-right
  reflection-card.tsx      ← /account 8-week reflection
  next-action-card.tsx     ← /account adaptive CTA
  referral-card.tsx        ← /account invite link
  share-result-card.tsx
  welcome-pinger.tsx       ← fires welcome email on first /account visit
  dilemma-reminder-card.tsx
  progression-panel.tsx
  language-switcher.tsx
  ... (~25 components total)

lib/
  dimensions.ts            ← DIM_KEYS, DIM_NAMES, topShifts(). 16 dims.
  archetypes.ts            ← 10 archetype definitions (also embedded in mull.html)
  figures.ts               ← SVG art for each archetype
  philosophers.ts          ← 500+ philosopher data
  exercises.ts             ← 16 exercises + categories
  dilemmas.ts              ← getDailyDilemma(), 379-question pool
  translations.ts          ← 8-language i18n table (EN, ES, FR, PT, RU, ZH, JA, KO)
  locale-server.ts         ← reads mull_locale cookie server-side
  profile-progression.ts   ← computeUserStats, computeStreakFromDates
  rate-limit.ts            ← per-IP token bucket via Postgres RPC
  error-log.ts             ← logError(), service-role-only
  service-health.ts        ← runHealthChecks() for /admin
  admin.ts                 ← isAdminUserId(), reads ADMIN_USER_IDS env

utils/supabase/
  client.ts                ← browser client (cookie-bound)
  server.ts                ← server component / route client (cookie-bound)
  admin.ts                 ← service-role client (RLS-bypassing)

supabase/migrations/       ← 20+ SQL files. ALL are idempotent (IF NOT EXISTS / OR REPLACE).

.github/workflows/         ← cron pings to mull.world endpoints
  dilemma-reminder.yml     ← hourly
  weekly-digest.yml        ← Sunday 09:00 UTC
  streak-break.yml         ← daily 14:00 UTC
  rate-limit-cleanup.yml   ← daily 03:00 UTC
  All require CRON_SECRET as a repo secret AND in Vercel env.
```

---

## Data model (key tables)

All under RLS. `auth.users.id` is the foreign key everywhere.

```
quiz_attempts            archetype, flavor, alignment_pct, vector[16], taken_at
dilemma_responses        dilemma_date, question_text, response_text, vector_delta[16],
                         analysis, is_public, followup_text, followup_at
diary_entries            title, content, vector_delta[16], analysis, word_count
exercise_reflections     exercise_slug, content, vector_delta[16], analysis
debate_history           topic, participants, transcript

public_profiles          handle, display_name, show_archetype, show_dimensions,
                         show_map, show_streak, is_public ... (privacy-by-default,
                         every visibility flag is OFF until user opts in)

notification_preferences email_dilemma_reminder, reminder_local_hour, reminder_tz
subscriptions            (Stripe-shaped; not live yet)

mo_conversations         per-user AI coach threads (NOT live yet, schema exists)
mo_messages              messages within those threads

diary_embeddings         vector embeddings for clustering
diary_clusters           cluster centroids
diary_entry_clusters     entry → cluster mapping

feedback                 user_id (nullable), body, page_url, user_agent
                         (anyone-INSERT; SELECT service-role only)
welcome_emails           user_id PK, sent_at — dedupe ledger
streak_break_emails      user_id, miss_date PK, sent_at — dedupe
error_log                source, message, stack, user_id, user_agent, url
rate_limit_events        bucket, ip_hash, user_id, created_at
referral_codes           user_id PK, code UNIQUE — one per user
referrals                user_id PK, referrer_user_id, referrer_code
```

Important RPCs:
- `compute_dilemma_streak(uid)` — walks dates backward with one-day grace
- `next_reflection_candidate(uid, min_age_days)` — oldest unanswered ≥56 days old
- `check_rate_limit(bucket, ip_hash, user_id, window_seconds)` — atomic insert-and-count

---

## Critical conventions

### Privacy-first
- Public profiles default to **everything off**. Each visibility flag is independent.
- Account-delete wipes 19+ user-scoped tables explicitly (don't trust FK cascade).
- Account-export writes a single JSON with every user-scoped row + `_errors` array.
- IPs are sha256-hashed before storage; raw IPs never persisted.
- Email addresses are masked in cron logs (`a***@example.com`).
- The maintainer's email (`jimmy.kaian.ji@gmail.com`) is the support contact; do not introduce a no-reply address.

### Email
- All cron emails are **opt-in via notification_preferences.email_dilemma_reminder**.
- Resend is wired via REST (no SDK install). Falls back to dry-run logging if `EMAIL_PROVIDER_API_KEY` or `EMAIL_FROM` are missing.
- Welcome email is the only non-cron email; idempotent via `welcome_emails` table.
- All emails include "turn off in account settings" + sent-to address.

### Crons
- All cron endpoints check `Authorization: Bearer ${CRON_SECRET}`.
- All are triggered from GitHub Actions (NOT Vercel Cron — Hobby tier limits).
- `CRON_SECRET` must match in BOTH GitHub Actions secrets AND Vercel env vars.

### Rate limiting
- `lib/rate-limit.ts` with sha256-of-(IP+salt) buckets.
- Wired on `/api/feedback` (5/IP/5min), `/api/dilemma/submit` (3/IP/60s), `/api/error-report` (20/IP/min).
- Non-fatal: if the rate-limiter itself fails, the request goes through.

### i18n
- 8 languages: EN, ES, FR, PT, RU, ZH, JA, KO.
- Some surfaces (quiz, archetype prose, philosopher pages, About) are EN-only.
- A "translation in progress" notice shows on non-EN locales.
- `t(key, locale, vars?)` is the helper; returns the key string when no entry exists.

### Visual / brand
- Cream/warm color system: `--cream: #FAF6EC`, `--cream-2: #FFFCF4`, `--ink: #221E18`, `--ink-soft: #4A4338`, `--acc: #B8862F`, `--acc-deep: #8C6520`. Plus accent teal `#2F5D5C` for "tension"/positive states.
- Serif: Cormorant Garamond. Sans: Inter / system-ui.
- 720px or 760px max-width on most routes; left-aligned editorial style.
- Italic gold `<em>` highlights for emotional emphasis in headings.
- The H1 + lede + daily-wisdom on the homepage share a single rag-right edge — DO NOT add max-widths that break this.

### Mobile
- All inputs ≥ 16px font-size (prevents iOS focus zoom).
- Sticky daily-dilemma CTA on results page only.
- Three.js is deferred; Vercel insights are deferred.
- `mull.html` Supabase script is NOT deferred (inline init reads it sync).

### TypeScript
- Strict mode. `any` is rare; explicit types on RLS-scoped queries via `.returns<T[]>()`.
- Server components are async functions returning JSX.
- Client components have `'use client'` at top.

---

## Recently shipped (last few sessions)

In rough order:
1. **Quiz calibration** — 16/16 canonical persona tests pass + 9/10 paradoxical persona tests defensible. Cartographer PO weight bumped 6→8 to capture Aristotelian phronesis.
2. **Compare-with-a-friend** at `/compare`.
3. **Result-context chips** on the post-quiz reveal: "A close call" when runner-up is within 0.04 cosine sim, "A productive tension" when two opposing dimensions both fire (TR↔MR, AT↔VA, SS↔CE, RT↔SS, TE↔MR, SI↔SS).
4. **Feedback widget** (floating button on every Next route).
5. **Reflection loop** (`reflection-card.tsx` on /account, surfaces 8-week-old dilemmas).
6. **Streak grace day** — one missed day is forgiven (mirrored in JS + SQL function).
7. **Daily wisdom widget** on the homepage.
8. **/admin dashboard** with auto-refresh + service health + errors panel.
9. **Welcome email** on signup (idempotent via welcome_emails table).
10. **Onboarding polish** — single compact version pill, removed redundant construction notice.
11. **Hero rhythm fix** — daily-wisdom typographic, lede + daily-wisdom span column.
12. **Privacy + terms pages**.
13. **Rate limiting** + **error logging** + **rate-limit cleanup cron**.
14. **First-week digest cron** (Sunday).
15. **Streak-loss courtesy email cron**.
16. **Smart next-action card** on /account.
17. **Friend invite link** at `/r/<code>` with referrer attribution + ReferralCard.
18. **Privacy P0 fixes**: account-delete + export include all 19+ tables, cron logs mask emails, mull.html no longer leaks email to browser console.
19. **SEO + share basics**: `summary_large_image` Twitter card, OG image wired into root layout, robots.ts cleaned.
20. **Performance**: preconnect/dns-prefetch added.

---

## Known gaps / future work (post-launch)

- **Stripe / Mull+ subscriptions** — schema exists, billing webhook stub exists, payment flow not wired.
- **Mo (personal AI coach)** — schema exists (mo_conversations, mo_messages), no UI.
- **Forum upvote/downvote leaderboard** — referenced as TODO #38 in `app/search/leaderboard.tsx`.
- **Philosopher detail pages** — currently brief; need real biographical context.
- **Archetype detail pages** — same.
- **Translations beyond shell** — quiz, archetype prose, philosopher DB still EN-only.
- **Forum / community surface** — referenced in terms page, not built.

---

## Conventions Claude should follow

- **Read `LAUNCH-RUNBOOK.md`** for the launch context if the task is launch-related.
- **Idempotent migrations only.** Always `IF NOT EXISTS`, `CREATE OR REPLACE`, `DROP POLICY IF EXISTS` etc. Migrations may be re-run.
- **Always wipe new user-scoped tables in `app/api/account/delete/route.ts`.** Privacy invariant.
- **Always include new user-scoped tables in `app/api/account/export/route.ts`.** Same.
- **Never log raw email addresses** in console output. Use the `maskEmail()` helper.
- **Never store raw IPs.** Always sha256-hash with salt via the rate-limit lib.
- **Don't add `max-width` to homepage hero elements** — breaks the rag-right rhythm.
- **Don't add an 11th archetype** — the 16-D position handles paradox; resist the urge.
- **TS check after every code change**: `npx tsc --noEmit` should be silent.
- **JS parse check on `mull.html`**: extract the last `<script>` block and `node --check` it.
- **Don't break existing crons** by changing endpoint paths or auth shape.
- **The maintainer (Jimmy) prefers**: concise summaries, prose over bullets when explaining, calm voice, no over-apologizing. Keep responses tight.

---

## Environment variables (Vercel)

Required:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY     ← needed for admin client (delete, admin dashboard, service-role queries)
ANTHROPIC_API_KEY             ← needed for dilemma analysis + debate generation
CRON_SECRET                   ← matches GitHub Actions secret
ADMIN_USER_IDS                ← comma-separated UUIDs (currently just Jimmy's)
```

Optional:
```
EMAIL_PROVIDER_API_KEY        ← Resend; without it, emails dry-run
EMAIL_FROM                    ← e.g. "Mull <hello@mull.world>"
RATE_LIMIT_SALT               ← any random string; falls back to constant
STRIPE_*                      ← when subscriptions go live
```

GitHub Actions secrets:
```
CRON_SECRET                   ← same value as Vercel
```

---

## How the project is launched + maintained

- **Deploy** — push to `main`, Vercel auto-deploys.
- **Migrations** — paste SQL into Supabase SQL editor manually.
- **Test** — TS clean (no warnings) + node --check on the inline script in mull.html.
- **Watch** — `/admin` dashboard auto-refreshes every 60s with stats, errors, service health.
- **Feedback** — floating button in every Next route → `feedback` table → visible at `/admin`.

---

## Most important files for any new contribution

If a fresh agent has time to read only N files, read in this order:
1. **`AGENTS.md`** (linked from CLAUDE.md — project conventions)
2. **`PROJECT-SYNOPSIS.md`** (this file)
3. **`LAUNCH-RUNBOOK.md`** (if launch-related)
4. **`public/mull.html`** lines 3236–3270 (DIMS, DIM_KEYS, helpers)
5. **`lib/dimensions.ts`** (the 16-D space)
6. **`public/mull.html`** lines ~4940–5000 (ARCHETYPES — also in `lib/archetypes.ts`)
7. **`app/account/page.tsx`** (the hub)
8. **`app/api/dilemma/submit/route.ts`** (the AI integration pattern)
9. **`utils/supabase/{server,admin,client}.ts`** (auth + RLS conventions)
10. **`supabase/migrations/`** — newest files first
