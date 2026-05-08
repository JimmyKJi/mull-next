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
```

Get the Anthropic key at https://console.anthropic.com/settings/keys.

## Required SQL migrations

Run each in the Supabase SQL editor (or `supabase db push` if using the CLI).

1. `supabase/migrations/<earlier>_quiz_attempts.sql` — already shipped
2. `supabase/migrations/20260507_dilemma_responses.sql` — ⚠️ **must run for the daily dilemma feature**
3. `supabase/migrations/20260508_debate_history.sql` — ⚠️ **must run to save user's last 3 debates**

Until #2 is run, `/dilemma` will fail to insert and `/account` trajectory
will skip dilemma events. Until #3 is run, generated debates won't persist
between visits (the feature still works; debates are just ephemeral).

## Routes

- `/` — landing → quiz → results (mull.html, served via beforeFiles rewrite)
- `/login`, `/signup` — auth
- `/account` — your account dashboard with trajectory map + recent shifts + streak
- `/dilemma` — today's daily dilemma question + write-in form
- `/debate` — pick two philosophers + topic → Claude-generated exchange
- `/api/dilemma/submit` — POST: saves response, calls Claude, returns vector_delta + analysis
- `/api/debate/generate` — POST: generates a back-and-forth between two philosophers on a topic

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
