# Mull roadmap

Notes on features queued up but not yet built. Source-of-truth lives here so future builds can pick up where we left off.

## What landed this session (autonomous, while Jimmy was revising)

- **Mobile responsiveness pass**: brandbar's secondary links (Diary, Simulated debate, Archetypes) hide on viewports ≤460px so the bar doesn't wrap into two rows; version + construction banners scale; pinch-to-zoom now works on the 3D constellation map (two-finger pinch, in addition to single-finger drag-to-rotate that was already there).
- **Open Graph meta tags**: layout-level defaults plus per-profile `generateMetadata` for `/u/[handle]`. Sharing a profile URL on Twitter, Slack, iMessage, etc. now previews with the user's display name + bio (or archetype if no bio).
- **Data export** (`GET /api/account/export`): downloads a single JSON file with everything we hold on the user — quiz attempts, dilemma responses, diary entries, debates, profile settings, plus the auth.users id/email/created_at. Surfaced as "Download my data (JSON)" on `/account/profile`.
- **Account deletion** (`POST /api/account/delete`): two-step UI gate (type "DELETE MY ACCOUNT" + click). Wipes every user-scoped table then removes the auth.users row via service-role admin client. About page copy updated to remove the "email Jimmy to delete" caveat.
- **Sitemap + robots**: `app/sitemap.ts` and `app/robots.ts`. Sitemap lists static public routes; `/u/<handle>` is allowed for crawling but not enumerated (privacy). API + private user routes disallowed.

### What Jimmy needs to do post-merge

1. Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local` and to Vercel project settings. Get it from Supabase → Project Settings → API → "service_role secret". Without this, `/api/account/delete` will wipe user data but error out before removing the auth row.
2. If `20260509_public_per_entry.sql` hasn't been run yet, run it. (See SETUP.md migration list.)
3. Test the account deletion flow with a throwaway account before relying on it — destructive operation, can't be tested non-destructively.
4. Test the public profile share preview by sharing a `/u/<handle>` URL.
5. Test the map's pinch-to-zoom on a real phone.

## Near term — finish before/around v1.0

### Translation of philosophical content
The site chrome (navigation, banners, hero, form labels, buttons, account-area copy) translates across all 8 locales as of v0.9. What remains in English-only:

- Quiz questions (both 20-question quick start and 50-question detailed diagnosis).
- Archetype names and prototype descriptions (16 archetypes × multiple sections each).
- Philosopher database (now 206 entries × name + dates + ideas + position) — disclaimer notices already in place across the chrome (`i18n.content_notice` on Next.js pages, `home.translation_notice` on mull.html). Bulk translation should run via `scripts/translate-i18n.js` with the API key.
- About page body (the principles, the economics-openly section, the build-credits).
- Reading list / learning lab content.
- A handful of small help-text paragraphs in the diary composer and dilemma form (currently flagged inline with an "in progress" tag when the user is on a non-English locale).

The convention in `lib/translations.ts` is: English is source of truth, other locales filled in by `scripts/translate-i18n.js` (calls Claude). For the philosophical content above, machine translation alone is too risky — terms like "tragic vision", "vital affirmation", "ascetic tendency" need a human who knows the original-language philosophical traditions to vet the renderings. Plan: machine-draft + human pass per locale.

### Mobile improvements
Pinch-to-zoom on the 3D constellation map; touch targets on per-philosopher checkboxes; the brandbar wrap on narrow viewports.

### Subscriptions
Mull+ at $4.99/mo or $29/yr; Founding Mind lifetime at $49 (capped at first 1,000). Until this lands, the daily-dilemma / diary / debate AI integrations are paid out of pocket. Front page already has a notice explaining this so users aren't surprised if the budget runs dry mid-month.

## Future — bigger swings

### "Mo" — local AI companion + diary archive map (Premium)
The core idea: turn the diary from an expressive log into a navigable inner library.

**What gets built:**
- Permanent storage of all diary entries by default (only user-initiated deletion removes them — soft delete with grace period). Already partly the case but make it explicit and irrecoverable-by-the-system once the user asks for deletion.
- A 2D idea-cluster map of the user's diary entries: each entry is embedded into a 2D space based on **what it's about** (semantic content), not on its philosophical-position vector. Result: visible clusters of recurring themes — work, family, mortality, art, particular relationships, particular projects. The map will likely surface 4–10 clusters for a regular journaler.
- Each cluster gets a Claude-generated synopsis: what the user has been thinking about in this cluster, how their thinking has shifted over time, recurring tensions, recurring images. Lightweight at first; deeper if the user asks for more.
- Each cluster's connections to other clusters get drawn explicitly: "the way you write about your father bleeds into how you write about authority"; "your grief cluster and your art cluster sit close to each other — the language overlaps". Synopsis of each connection generated by Claude.
- **Mo, the local AI companion.** A persistent chat interface where the user can talk to an AI specifically about their own diary clusters — "tell me what I keep returning to in the work cluster", "how has my view of my mother shifted over the last six months", "draw out the contradiction between the autonomy cluster and the belonging cluster". Mo has access to the full diary archive (read-only, scoped to the user) and can quote specific entries when answering. Distinct identity, distinct prompt — Mo isn't generic Claude, Mo is *yours*, and only knows you.

**Why premium:** Mo's context window per session is large (the whole archive plus running conversation), and any active journaler will rack up serious token costs. So either:
- Higher Mull+ tier ($14.99/mo or so), or
- A new "Mull Studio" tier that bundles Mo with longer debate generations and unlimited dilemma re-analysis, or
- Token-budgeted Mo (e.g. 50k tokens of Mo conversation per month at the standard tier, unlimited at a higher one).

Pricing decision deferred until we have real usage data on the daily dilemma / diary / debate features. Whatever tier structure shakes out has to keep the free tier (quiz + map + archetype + basic dilemma) generous, per the principles in About.

**Engineering notes for when this gets built:**
- Embeddings: probably `text-embedding-3-small` or whatever Anthropic ships; clustering with HDBSCAN or k-means with auto-k.
- 2D projection: UMAP or t-SNE; cache projection per user, recompute on schedule (nightly?) or on demand.
- Mo's prompt: needs careful work. Tone is contemplative, not therapeutic; remembers but doesn't pathologize; quotes the user back to themselves but doesn't flatter; pushes back when the user asks it to.
- Privacy: Mo runs server-side, never trains on the user's data, never leaves the per-user scope.
- The 2D cluster map should probably be its own page — `/diary/map` or similar. Linked from the existing diary index.

## Done (v0.9)
- Quiz (quick + detailed) + 16-dim vector model + archetype assignment
- 3D constellation map with over 200 philosophers
- Account / save attempts / trajectory trail
- Daily dilemma (Claude prose-to-vector)
- Two-philosopher simulated debate
- User-vs-philosopher debate (Mull+)
- Diary feature (philosophical journal, prose-to-vector)
- Public profile pages (opt-in, per-entry visibility)
- Multilingual chrome across 8 locales (en, es, fr, pt, ru, zh, ja, ko)
- Translation-in-progress notices for the still-English content
