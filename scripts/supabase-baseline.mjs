#!/usr/bin/env node
// scripts/supabase-baseline.mjs
//
// One-shot helper for the FIRST time you wire the Supabase CLI to a
// project whose migrations were previously applied by hand via the
// Dashboard SQL Editor.
//
// Why this exists
//
// `supabase db push` looks at supabase_migrations.schema_migrations on
// the remote DB to figure out which migration files are unapplied. If
// you applied them all by hand, that table is empty (or stale), and
// db push will try to RE-APPLY every file — which will fail on the
// first duplicate-column / policy-already-exists error.
//
// The fix is `supabase migration repair --status applied <TIMESTAMP>`
// for each historical file. This script enumerates the files in
// supabase/migrations/ and prints the right commands for you to copy
// + paste (or pipe to bash). It does NOT run them automatically —
// repair is a state-changing CLI op and you should look at the list
// before confirming.
//
// Usage:
//   node scripts/supabase-baseline.mjs              # print commands
//   node scripts/supabase-baseline.mjs --exclude 20260527_arena_view_security
//     # skip a specific migration that you actually want to push fresh
//
// After running the printed `migration repair` commands, the next
// `supabase db push` will only run the unmarked migrations (the
// genuinely new ones).

import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(__filename), '..');
const MIG_DIR = resolve(ROOT, 'supabase/migrations');

// --exclude <slug-or-full-filename>... — repeatable. Excluded files
// won't have a repair command emitted, so they stay "unapplied" and
// will be pushed by the next db push run.
const args = process.argv.slice(2);
const exclude = new Set();
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--exclude' && args[i + 1]) {
    exclude.add(args[i + 1].replace(/\.sql$/, ''));
    i++;
  }
}

const files = readdirSync(MIG_DIR)
  .filter(f => f.endsWith('.sql'))
  .sort();

console.log(`Found ${files.length} migration files in supabase/migrations/.\n`);

const cmds = [];
for (const f of files) {
  const base = f.replace(/\.sql$/, '');
  // Supabase migration timestamps are the leading [0-9]+ before the
  // first underscore. Newer Supabase CLI versions expect the full
  // YYYYMMDDHHMMSS form (14 digits); older files use YYYYMMDD (8).
  // We pass whatever the filename has — the CLI accepts both.
  const ts = base.split('_')[0];
  if (!/^[0-9]+$/.test(ts)) {
    console.warn(`Skipping ${f} — filename doesn't start with a timestamp.`);
    continue;
  }
  // Match against either the timestamp or the full base name for
  // --exclude convenience.
  if (exclude.has(ts) || exclude.has(base)) {
    console.log(`# SKIP  ${f}  (will be pushed by next \`supabase db push\`)`);
    continue;
  }
  cmds.push({ ts, file: f });
}

console.log('\n# Paste these into your shell, in order:');
console.log('# (or pipe this script\'s output through `grep ^supabase | bash`)');
console.log('');
for (const { ts, file } of cmds) {
  console.log(`supabase migration repair --status applied ${ts}  # ${file}`);
}
console.log('');
console.log(`# ${cmds.length} migration(s) will be marked applied.`);
console.log(`# ${exclude.size} excluded — those will run on the next \`supabase db push\`.`);
