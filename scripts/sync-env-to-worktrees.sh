#!/usr/bin/env bash
# Copy .env.local from the main checkout into every active git worktree.
#
# Why: .env.local is gitignored, so a fresh worktree starts without
# Supabase keys and the dev server can't run middleware (it crashes
# trying to construct a Supabase client). Copy-on-create is annoying
# to remember. This script is the manual one-shot.
#
# Usage:
#   ./scripts/sync-env-to-worktrees.sh
#
# Idempotent: re-running just overwrites with the current main copy,
# which is what you want when you rotate keys.
#
# Safety: only operates on worktrees under .claude/worktrees/. Won't
# touch external worktrees you've created elsewhere.

set -euo pipefail

# Resolve the repo's main worktree (the one with .git as a directory,
# not a file). Any worktree can run `git rev-parse --git-common-dir`
# and get back .git of the main checkout, so we can find the canonical
# .env.local from anywhere.
GIT_COMMON_DIR=$(git rev-parse --git-common-dir)
MAIN_WORKTREE=$(dirname "$(realpath "$GIT_COMMON_DIR")")
SOURCE_ENV="$MAIN_WORKTREE/.env.local"

if [[ ! -f "$SOURCE_ENV" ]]; then
  echo "✗ No .env.local found at $SOURCE_ENV" >&2
  echo "  Copy your Supabase keys there first, then re-run." >&2
  exit 1
fi

WORKTREES_DIR="$MAIN_WORKTREE/.claude/worktrees"
if [[ ! -d "$WORKTREES_DIR" ]]; then
  echo "No .claude/worktrees directory — nothing to sync."
  exit 0
fi

count=0
for wt in "$WORKTREES_DIR"/*/; do
  [[ -d "$wt" ]] || continue
  cp "$SOURCE_ENV" "$wt/.env.local"
  echo "  → $(basename "$wt")"
  count=$((count + 1))
done

if [[ $count -eq 0 ]]; then
  echo "No worktrees found under $WORKTREES_DIR — nothing to sync."
else
  echo "✓ Copied .env.local into $count worktree(s)."
fi
