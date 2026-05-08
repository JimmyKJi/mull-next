# Mull setup notes

## Required environment variables

In `.env.local` (gitignored — set both locally and in Vercel project settings):

```
NEXT_PUBLIC_SUPABASE_URL=https://vthwhbhkoxzngaaagypj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<jwt-format-anon-key>

# For daily dilemma prose-to-vector analysis. Without this, the dilemma still
# saves the user's response to the database, just without an AI-derived
# vector_delta or analysis (graceful degradation).
ANTHROPIC_API_KEY=sk-ant-api03-...

# Service-role key for the very small number of operations that need to
# bypass RLS — currently just /api/account/delete (which has to remove the
# auth.users row). Without this, account deletion wipes user data but
# leaves the sign-in record, and the user gets a friendly "email Jimmy"
# error message at the end. NEVER expose this key client-side.
SUPABASE_SERVICE_ROLE_KEY=<service-role-jwt>
```

Get the Anthropic key at https://console.anthropic.com/settings/keys. Get
the Supabase service-role key at Supabase → Project Settings → API → "service_role secret".

## Required SQL migrations

Run each in the Supabase SQL editor (or `supabase db push` if using the CLI).

1. `supabase/migrations/<earlier>_quiz_attempts.sql` — already shipped
2. `supabase/migrations/20260507_dilemma_responses.sql` — ⚠️ **must run for the daily dilemma feature**
3. `supabase/migrations/20260508_debate_history.sql` — ⚠️ **must run to save user's last 3 debates**
4. `supabase/migrations/20260508_diary_entries.sql` — ⚠️ **must run for the diary feature**
5. `supabase/migrations/20260508_public_profiles.sql` — ⚠️ **must run for public profile pages**
6. `supabase/migrations/20260509_public_per_entry.sql` — ⚠️ **must run for per-entry visibility on public profiles + trail/archetype access**

Until #2 is run, `/dilemma` will fail to insert and `/account` trajectory
will skip dilemma events. Until #3 is run, generated debates won't persist
between visits (the feature still works; debates are just ephemeral).

## Routes

- `/` — landing → quiz → results (mull.html, served via beforeFiles rewrite)
- `/login`, `/signup` — auth
- `/account` — your account dashboard with trajectory map + recent shifts + streak
- `/dilemma` — today's daily dilemma question + write-in form
- `/debate` — pick two philosophers + topic → Claude-generated exchange
- `/diary` — free-form philosophical journal; entries feed into vector space
- `/diary/[id]` — view a single diary entry
- `/debate/me` — user-vs-philosopher debate (Mull+ feature, prototype-capped at 3/day)
- `/account/profile` — manage your opt-in public profile
- `/u/[handle]` — public profile page (visible to anyone with the link)
- `/api/dilemma/submit` — POST: saves response, calls Claude, returns vector_delta + analysis
- `/api/debate/generate` — POST: generates a back-and-forth between two philosophers on a topic
- `/api/debate/me` — POST: generates user-vs-philosopher exchange
- `/api/diary/save` — POST: save or update a diary entry, run Claude analysis
- `/api/diary/delete` — POST: delete an entry
- `/api/profile/save` — POST/DELETE: opt in/out of public profile

## Internationalization (i18n)

Foundation in place: 8 locales supported via cookie (`mull_locale`), language
switcher component (`<LanguageSwitcher />`), translations indexed by key in
`lib/translations.ts`. UI chrome strings (nav, buttons, common labels) are
translated. **Philosophical content — quiz questions, archetype descriptions,
philosopher entries, the entire `mull.html` body — remains English-only by
design**: machine-translating that material risks distorting nuance, and it
should be done carefully by a human translator.

Currently the language switcher appears on `/account`. Propagating it across
all Next.js pages, and translating each hardcoded English label to use
`t('key', locale)`, is incremental work.

## Daily dilemma flow

1. User visits `/dilemma`
2. Sees that day's question (deterministic from date — same prompt for all
   users on the same day)
3. Writes 30-4000 chars
4. Submits → `/api/dilemma/submit`
5. Server validates, checks for existing response that day, calls Claude
   with the system prompt that lists all 16 dimensions and asks for a JSON
   `{ vector_delta: [16 numbers], analysis: "one sentence" }` output
6. Saves to `dilemma_responses` table
7. Returns the delta + analysis to the form
8. Form shows the analysis + which dimensions shifted
9. `/account` page picks up the new event in the trajectory + recent shifts

## Trajectory math

User's current position is computed by walking through events oldest→newest:
- **Quiz attempt** sets the absolute 16-D position to its `vector`
- **Daily dilemma** adds its `vector_delta` to the previous position

The map iframe receives:
- `v` — the current (latest) absolute position, base64 of JSON
- `h` — the last 10 absolute positions in chronological order, base64 of JSON
  (pulse + dimming dots + dashed line on the map)

## Testing without an Anthropic API key

The route gracefully degrades. Submissions will save with `vector_delta=null`
and `analysis=null`. The form shows a note: "Your response was saved. The AI
analyzer isn't connected yet — when it is, past responses will be re-analyzed."

To re-analyze old responses once the key is set, either:
- Manually re-run them through a backfill script (TODO), or
- Have users delete and resubmit (lossy)
