<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Mull-specific invariants

These are project-level rules that automated tooling enforces (or that
silent breakage will cost real user data). Read them before touching
the relevant files.

## User-scoped tables: single registry

Every Postgres table that stores per-user data MUST be registered in
`lib/user-scoped-tables.ts`. Both `app/api/account/delete/route.ts`
and `app/api/account/export/route.ts` iterate over that registry —
they no longer hardcode table names. If you add a new user-scoped
table:

1. Add a new entry to `USER_SCOPED_TABLES` with a substantive note.
2. Pick `deleteStrategy`: `wipe` for explicit DELETE, `fk_set_null`
   when ON DELETE SET NULL handles it, `fk_cascade` for chained
   cascades.
3. Set `inExport` to `true` unless the data is ephemeral ops (like
   `rate_limit_events`, which auto-prunes every 24h).
4. Run `node scripts/check-table-invariants.mjs`. It must pass.

If you DON'T register a new user-scoped table, two things break
silently: deleted accounts leave orphaned rows behind, and account
exports return an incomplete picture of what we have on the user.
Both are privacy-promise violations.

## Wave 2 philosopher corpus: generator-owned

The 394 Wave 2 philosopher entries live between
`// ─── BEGIN gen-philosophers Wave 2 ───` and
`// ─── END gen-philosophers Wave 2 ───` markers in both
`lib/philosophers.ts` and `public/mull.html`. Don't hand-edit
inside those markers — re-running `node scripts/gen-philosophers.mjs
--apply` will wipe your changes.

To add or modify Wave 2 entries:

1. Edit the `ENTRIES` array in `scripts/gen-philosophers.mjs`. Tag
   the tradition explicitly with `tr:'…'` if keyword inference
   would miss it.
2. Run `node scripts/gen-philosophers.mjs --apply`. Both files
   update in place.
3. Optionally run `node scripts/check-philosopher-calibration.mjs`
   to verify the new entries don't sit awkwardly.

Wave 1 entries (the ~166 hand-curated ones at the top of
`lib/philosophers.ts`, before the BEGIN sentinel) are hand-maintained
and not generator-managed. Edit those directly.

## Archetype targets: single source

The ten archetype target vectors live in `lib/archetype-targets.ts`.
TypeScript modules import directly; `.mjs` scripts read via
`scripts/_load-archetype-targets.mjs`. If you adjust an archetype
target — e.g. bumping Cartographer's PO weight — change it there,
then re-run `node scripts/gen-philosophers.mjs --apply` so the Wave 2
classifications pick up the new target.

Exception: `public/mull.html` has its own inline copy because it's
static HTML with embedded JS, not a module. Keep it in sync by hand
when targets change.
