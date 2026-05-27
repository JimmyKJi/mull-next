# Supabase CLI setup + workflow

This doc covers wiring the Supabase CLI to Mull so future migrations
auto-apply via `supabase db push` instead of needing manual SQL Editor
paste. One-time setup, then a tight recurring workflow.

---

## One-time setup

```bash
# 1. Install the CLI (macOS, via Homebrew).
brew install supabase/tap/supabase

# 2. Log in. Opens a browser, saves a personal access token to
#    ~/.supabase/access-token. The token is per-user, not per-project
#    — you only do this once on your laptop.
supabase login

# 3. Get your project ref from the Supabase Dashboard URL. It's the
#    string after /project/:
#      https://supabase.com/dashboard/project/XXXXXXXXX
#                                              ^^^^^^^^^
#    Then link the local repo to it. Creates supabase/config.toml.
cd /Users/jimmy/Documents/mull-next
supabase link --project-ref YOUR_PROJECT_REF
```

After this:
- `~/.supabase/access-token` exists (gitignored — never committed)
- `supabase/config.toml` exists (commit it — has the project ref, not
  secrets)

---

## The "already-applied migrations" baseline (one-time)

Your `supabase/migrations/*.sql` files were applied manually via the
Dashboard SQL Editor before the CLI existed. The remote DB doesn't
record any of them as "applied" via the CLI's migrations table, so
`supabase db push` would try to re-run all 30+ and fail on the first
duplicate-column error.

Mark them all as applied first. The helper:

```bash
node scripts/supabase-baseline.mjs --exclude 20260527_arena_view_security
```

This prints the right `supabase migration repair` commands. The
`--exclude` flag holds the arena security migration *back* so the
next `supabase db push` actually runs it. Pipe through bash to run
them all in one go:

```bash
node scripts/supabase-baseline.mjs --exclude 20260527_arena_view_security \
  | grep '^supabase' \
  | bash
```

If any `repair` command errors (e.g. duplicate timestamps need the
full filename version), copy the failing line, swap the timestamp
for the full `<timestamp>_<name>` form (no `.sql`), and re-run.

After the baseline pass, verify:

```bash
supabase migration list --linked
```

Everything should show ✓ Local + ✓ Remote except the arena security
migration, which shows ✓ Local + ✗ Remote.

---

## Recurring workflow

From now on, when a new migration lands in `supabase/migrations/`:

```bash
# 1. See what would be applied (no changes yet).
supabase db push --dry-run

# 2. Apply for real if the diff looks right.
supabase db push

# 3. Confirm the remote state matches local.
supabase migration list --linked
```

Three guardrails:
- Always `--dry-run` first. The CLI prints the SQL it'd run.
- The CLI refuses to push if there's drift between local migrations
  and remote schema. If you've also been making changes in the
  Dashboard SQL Editor in parallel, you'll get a "schema drift"
  error — run `supabase db pull` first to capture the manual changes
  into a new migration file, then push.
- The CLI is interactive: `db push` will ask "Confirm? [y/N]" before
  modifying production unless you pass `--include-all -y`.

---

## Letting Claude auto-apply (optional)

If you want Claude to run `supabase db push` directly from a session
without you running it manually:

1. Export your access token where the shell can see it:
   ```bash
   echo 'export SUPABASE_ACCESS_TOKEN="$(cat ~/.supabase/access-token)"' \
     >> ~/.zshrc
   source ~/.zshrc
   ```
   This makes the CLI auth available to any shell command Claude
   runs through its Bash tool.

2. Tell Claude in-session: "you have permission to run
   `supabase db push --dry-run` to preview, but always ask before
   `supabase db push` for real."

Claude's auto-mode classifier may still block direct production
DB modifications, in which case it'll prompt you to copy-paste the
one-line command. Either workflow works; pick what feels right.

---

## What gets committed vs ignored

| File | Commit? | Why |
|---|---|---|
| `supabase/migrations/*.sql` | ✓ | The migration history |
| `supabase/config.toml` | ✓ | Project ref (public anyway) + local dev settings |
| `supabase/.temp/` | ✗ | CLI working dir |
| `~/.supabase/access-token` | ✗ (not in repo) | Personal access token — never check in |

`.gitignore` should already include `.supabase/`. Verify with
`grep supabase .gitignore`.
