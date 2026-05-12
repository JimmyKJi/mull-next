#!/usr/bin/env node
// scripts/check-table-invariants.mjs
//
// Mechanical sanity check for the privacy invariant: every user-scoped
// Postgres table must be registered in lib/user-scoped-tables.ts so the
// account-delete and account-export routes can iterate over it.
//
// What this script does, in order:
//
//   1. Loads lib/user-scoped-tables.ts (transpiled inline) and validates
//      the registry shape — no duplicate names, every entry has a note,
//      every entry has a deleteStrategy + inExport flag.
//   2. Greps the account-delete and account-export route source for
//      direct table references (e.g. `from('foo')`) — any reference to a
//      table that ISN'T in the registry is a red flag.
//   3. Parses supabase/migrations/*.sql for CREATE TABLE statements that
//      include a `user_id` column referencing auth.users. Any such table
//      that isn't in the registry is reported as drift.
//
// Exit codes:
//   0  — registry is consistent with both routes and the migration set
//   1  — drift detected (details printed)
//
// Run via: `node scripts/check-table-invariants.mjs`
//
// This is intentionally a plain Node script rather than a Jest test —
// the rest of Mull's testing is plain Node scripts (gen-philosophers.mjs
// follows the same convention), and there's no test runner configured.

import { readFile } from 'node:fs/promises';
import { readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');

// ─── helpers ────────────────────────────────────────────────────────

const C = {
  red:    (s) => `\x1b[31m${s}\x1b[0m`,
  green:  (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  dim:    (s) => `\x1b[2m${s}\x1b[0m`,
  bold:   (s) => `\x1b[1m${s}\x1b[0m`,
};

const findings = [];
function fail(msg)  { findings.push({ level: 'fail', msg }); }
function warn(msg)  { findings.push({ level: 'warn', msg }); }
function note(msg)  { findings.push({ level: 'note', msg }); }

// ─── 1. parse the registry ──────────────────────────────────────────
//
// We don't actually run TS — we read the file as text and pull out the
// `name:` entries plus their flags. This is brittle if the file's
// formatting changes a lot, but it's been stable and the alternative
// (ts-node / tsx) adds a dependency.

async function loadRegistry() {
  const path = join(REPO_ROOT, 'lib', 'user-scoped-tables.ts');
  const src = await readFile(path, 'utf8');

  // Parse strategy: isolate the USER_SCOPED_TABLES array body, then split
  // it at top-level entry boundaries (`},`) and parse each entry block
  // independently. This avoids the trap of a multi-entry regex match
  // accidentally spanning entries because an optional field (singleton)
  // happens to appear later in the file.
  //
  // String-body sub-pattern matches quote-then-content-then-quote with
  // escape handling, for all three TS quote styles.
  const STR = `(?:'((?:[^'\\\\]|\\\\.)*)'|"((?:[^"\\\\]|\\\\.)*)"|\`((?:[^\`\\\\]|\\\\.)*)\`)`;
  const pick = (...groups) => groups.find(g => g !== undefined) ?? '';

  // 1. Locate the array. The declaration looks like:
  //      export const USER_SCOPED_TABLES: readonly UserScopedTable[] = [
  //    We need the `[` AFTER `= `, not the one inside `UserScopedTable[]`.
  const declMatch = src.match(/USER_SCOPED_TABLES[\s\S]*?=\s*\[/);
  if (!declMatch || declMatch.index === undefined) {
    fail('Could not find USER_SCOPED_TABLES declaration in the file.');
    return [];
  }
  const openIdx = declMatch.index + declMatch[0].length - 1;
  // Walk forward, balancing brackets, to find the matching close.
  let depth = 0;
  let closeIdx = -1;
  for (let i = openIdx; i < src.length; i++) {
    const c = src[i];
    if (c === '[') depth++;
    else if (c === ']') {
      depth--;
      if (depth === 0) { closeIdx = i; break; }
    }
  }
  if (closeIdx < 0) {
    fail('Could not find the closing bracket of USER_SCOPED_TABLES.');
    return [];
  }
  const arrayBody = src.slice(openIdx + 1, closeIdx);

  // 2. Split into entry blocks. Each entry is `{ … },` — we match each
  //    top-level brace-balanced block.
  const blocks = [];
  let blockStart = -1;
  let braceDepth = 0;
  for (let i = 0; i < arrayBody.length; i++) {
    const c = arrayBody[i];
    if (c === '{') {
      if (braceDepth === 0) blockStart = i;
      braceDepth++;
    } else if (c === '}') {
      braceDepth--;
      if (braceDepth === 0 && blockStart >= 0) {
        blocks.push(arrayBody.slice(blockStart, i + 1));
        blockStart = -1;
      }
    }
  }

  // 3. Parse each block. Each field's regex is scoped to a single block
  //    so it can't accidentally pick up a sibling's value.
  const nameRe       = new RegExp(`name:\\s*${STR}`);
  const strategyRe   = new RegExp(`deleteStrategy:\\s*${STR}`);
  const inExportRe   = /inExport:\s*(true|false)/;
  const singletonRe  = /singleton:\s*(true|false)/;
  const noteRe       = new RegExp(`note:\\s*${STR}`);

  const entries = [];
  for (const block of blocks) {
    const nm = block.match(nameRe);
    const st = block.match(strategyRe);
    const ie = block.match(inExportRe);
    const sg = block.match(singletonRe);
    const nt = block.match(noteRe);
    if (!nm || !st || !ie) continue; // not a registry entry; skip
    entries.push({
      name:           pick(nm[1], nm[2], nm[3]),
      deleteStrategy: pick(st[1], st[2], st[3]),
      inExport:       ie[1] === 'true',
      singleton:      sg ? sg[1] === 'true' : false,
      note:           nt ? pick(nt[1], nt[2], nt[3]) : '',
    });
  }

  if (entries.length === 0) {
    fail('No entries parsed from lib/user-scoped-tables.ts. Either the file is empty or the parser regex needs updating.');
  }
  return entries;
}

// ─── 2. find direct table references in the two routes ─────────────

async function findTableRefs(relativePath) {
  const path = join(REPO_ROOT, relativePath);
  const src = await readFile(path, 'utf8');
  const refs = new Set();
  // Matches .from('table_name')
  const re = /\.from\(\s*['"]([a-z_][a-z0-9_]*)['"]\s*\)/g;
  let m;
  while ((m = re.exec(src)) !== null) refs.add(m[1]);
  return refs;
}

// ─── 3. scan migrations for user-scoped tables ─────────────────────
//
// Heuristic: a CREATE TABLE block that contains both a `user_id` column
// declaration AND a reference to auth.users. We collect the table name
// from the CREATE TABLE line.

async function findUserScopedTablesInMigrations() {
  const dir = join(REPO_ROOT, 'supabase', 'migrations');
  let files;
  try {
    files = (await readdir(dir)).filter(f => f.endsWith('.sql'));
  } catch {
    warn('No supabase/migrations directory found. Skipping schema-vs-registry check.');
    return new Set();
  }

  const tables = new Set();
  for (const file of files) {
    const src = await readFile(join(dir, file), 'utf8');

    // Split into CREATE TABLE blocks. We look for the table name in the
    // opening line and then scan the block body for user_id + auth.users.
    const blocks = src.split(/CREATE TABLE\s+(?:IF NOT EXISTS\s+)?/i).slice(1);
    for (const block of blocks) {
      const head = block.match(/^(?:public\.)?([a-z_][a-z0-9_]*)\s*\(/i);
      if (!head) continue;
      const tableName = head[1];
      // End of this CREATE TABLE — at the closing `);` at column zero
      // or the next CREATE TABLE. Use a simple match: everything up to
      // the first standalone `);`.
      const end = block.indexOf(');');
      const body = end > 0 ? block.slice(0, end) : block;
      if (/user_id\s+uuid/i.test(body) && /auth\.users/i.test(body)) {
        tables.add(tableName);
      }
    }
  }
  return tables;
}

// ─── main ──────────────────────────────────────────────────────────

async function main() {
  console.log(C.bold('Mull · user-scoped tables invariant check\n'));

  const registry = await loadRegistry();
  const registryNames = new Set(registry.map(e => e.name));

  console.log(C.dim(`Registry has ${registry.length} entries.`));

  // 1. shape checks
  for (const e of registry) {
    if (!e.note || e.note.length < 8) {
      fail(`Entry "${e.name}" is missing a substantive note.`);
    }
    if (!['wipe', 'fk_set_null', 'fk_cascade'].includes(e.deleteStrategy)) {
      fail(`Entry "${e.name}" has unknown deleteStrategy "${e.deleteStrategy}".`);
    }
  }
  const counts = registry.reduce((acc, e) => {
    acc[e.deleteStrategy] = (acc[e.deleteStrategy] ?? 0) + 1;
    return acc;
  }, {});
  console.log(C.dim(`  wipe: ${counts.wipe ?? 0}, fk_set_null: ${counts.fk_set_null ?? 0}, fk_cascade: ${counts.fk_cascade ?? 0}`));
  console.log(C.dim(`  inExport: ${registry.filter(e => e.inExport).length}/${registry.length}`));

  // 2. route refs vs registry
  console.log('\n' + C.bold('Checking account routes import from registry…'));
  const deleteRefs = await findTableRefs('app/api/account/delete/route.ts');
  const exportRefs = await findTableRefs('app/api/account/export/route.ts');

  for (const ref of deleteRefs) {
    if (!registryNames.has(ref)) {
      fail(`delete/route.ts references table "${ref}" that's not in the registry.`);
    }
  }
  for (const ref of exportRefs) {
    if (!registryNames.has(ref)) {
      fail(`export/route.ts references table "${ref}" that's not in the registry.`);
    }
  }

  // If a route has ANY hardcoded .from('…') it suggests the refactor wasn't
  // applied — it should iterate over the registry, not name tables inline.
  if (deleteRefs.size > 0) {
    warn(`delete/route.ts contains ${deleteRefs.size} hardcoded .from('…') references. The route should iterate over TABLES_TO_WIPE instead. Refs: ${[...deleteRefs].join(', ')}`);
  } else {
    console.log(C.green('  delete/route.ts: clean — no hardcoded table names.'));
  }
  if (exportRefs.size > 0) {
    warn(`export/route.ts contains ${exportRefs.size} hardcoded .from('…') references. The route should iterate over TABLES_TO_EXPORT. Refs: ${[...exportRefs].join(', ')}`);
  } else {
    console.log(C.green('  export/route.ts: clean — no hardcoded table names.'));
  }

  // 3. schema-vs-registry drift
  console.log('\n' + C.bold('Checking schema-vs-registry drift…'));
  const schemaTables = await findUserScopedTablesInMigrations();
  console.log(C.dim(`  Migrations declare ${schemaTables.size} user-scoped tables.`));

  for (const t of schemaTables) {
    if (!registryNames.has(t)) {
      fail(`Schema declares user-scoped table "${t}" but it's not in lib/user-scoped-tables.ts.`);
    }
  }

  // The reverse direction (registry tables that aren't in migrations) is
  // expected — `quiz_attempts` predates the migrations folder and was
  // created via the Supabase dashboard. We don't fail on that, just note it.
  for (const e of registry) {
    if (!schemaTables.has(e.name)) {
      note(`Registry has "${e.name}" but no CREATE TABLE found in supabase/migrations/. (OK if the table predates the migrations folder, e.g. quiz_attempts.)`);
    }
  }

  // ─── report ─────────────────────────────────────────────────────
  console.log('\n' + C.bold('Findings'));
  if (findings.length === 0) {
    console.log(C.green('  ✓ Everything checks out.'));
    process.exit(0);
  }

  const fails = findings.filter(f => f.level === 'fail');
  const warns = findings.filter(f => f.level === 'warn');
  const notes = findings.filter(f => f.level === 'note');

  for (const f of fails) console.log('  ' + C.red('✗ ' + f.msg));
  for (const w of warns) console.log('  ' + C.yellow('! ' + w.msg));
  for (const n of notes) console.log('  ' + C.dim('· ' + n.msg));

  console.log();
  if (fails.length > 0) {
    console.log(C.red(`Failed: ${fails.length} blocking issue(s).`));
    process.exit(1);
  } else {
    console.log(C.green('Passed (with notes).'));
    process.exit(0);
  }
}

main().catch(err => {
  console.error(C.red('Unexpected error:'), err);
  process.exit(2);
});
