#!/usr/bin/env node
// scripts/sync-mull-html-aliases.mjs
//
// Synchronises the `aliases` field from lib/philosophers.ts into the
// PHILOSOPHERS array inside public/mull.html. Idempotent: re-running
// updates any drift without duplicating entries.
//
// Why this exists:
//   - lib/philosophers.ts has aliases (first names, common alt spellings)
//     that make search forgiving ("aristotle" finds "Aristotle"; "kant"
//     finds Immanuel Kant; "russell" finds Bertrand Russell)
//   - public/mull.html ships its own PHILOSOPHERS list (different
//     subset, kept for the homepage's standalone canvas embed). It
//     did NOT have aliases — searching "kant" on the homepage
//     wouldn't find Kant if his entry name was "Immanuel Kant"
//   - This script reads aliases from lib/philosophers.ts and injects
//     them inline into the matching mull.html entry, keeping the
//     two sources in sync without forcing the homepage to fetch a
//     JSON endpoint
//
// Usage:
//   node scripts/sync-mull-html-aliases.mjs        # dry-run (no write)
//   node scripts/sync-mull-html-aliases.mjs --apply # write changes back
//
// What it touches:
//   - public/mull.html PHILOSOPHERS entries that match a name in
//     lib/philosophers.ts. Entries with no aliases get aliases:[].
//     Entries whose names don't resolve in lib/philosophers.ts are
//     left untouched (they're mull.html-only, no cross-source aliases
//     exist to inject).
//   - Does NOT touch anything outside the PHILOSOPHERS array.
//   - Does NOT touch existing aliases:[...] if they're already set —
//     only adds the field if missing.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(__filename), '..');
const SRC_TS = resolve(ROOT, 'lib/philosophers.ts');
const TARGET_HTML = resolve(ROOT, 'public/mull.html');

const APPLY = process.argv.includes('--apply');

// ─── Extract aliases from lib/philosophers.ts ────────────────────────
//
// We do NOT import the TS file (it would require a compile step). The
// file is JSON-shaped — parse the entries by regex. This is fragile
// in the abstract but reliable against the generated-format the
// `scripts/gen-philosophers.mjs --apply` step produces.

const srcText = readFileSync(SRC_TS, 'utf8');

// Find every entry as `"name": "..."` followed (within the object)
// by `"aliases": [...]`. The aliases array can span multiple lines.
const aliasByName = new Map();
{
  // Slice the entries portion (from `export const PHILOSOPHERS` to
  // its closing `]`).
  const start = srcText.indexOf('export const PHILOSOPHERS');
  if (start === -1) {
    console.error('Could not locate PHILOSOPHERS export in lib/philosophers.ts');
    process.exit(1);
  }
  const body = srcText.slice(start);

  // Iterate by walking entry-by-entry. Each entry starts with `{`
  // after a newline of leading whitespace, and the `name` field
  // appears within the first dozen lines.
  const entryPattern = /"name":\s*"([^"]+)"[\s\S]*?"aliases":\s*\[([\s\S]*?)\]/g;
  let m;
  while ((m = entryPattern.exec(body))) {
    const name = m[1];
    const aliasesRaw = m[2];
    const aliases = Array.from(aliasesRaw.matchAll(/"([^"]+)"/g)).map(a => a[1]);
    aliasByName.set(name, aliases);
  }
}

console.log(`Loaded aliases for ${aliasByName.size} philosophers from lib/philosophers.ts`);

// ─── Patch public/mull.html ──────────────────────────────────────────
//
// Each entry in mull.html looks like:
//   { name:"Heraclitus", dates:"~535–475 BCE", keyIdea:"...",
//       p: v({TV:6,...}) },
//
// We want to insert ` aliases:[...]` between the keyIdea and `p:`,
// IF the entry doesn't already have an aliases field. The newline
// + indentation must survive.

const htmlText = readFileSync(TARGET_HTML, 'utf8');

// Bounds of the PHILOSOPHERS array literal.
const startMarker = 'const PHILOSOPHERS = [';
const startIdx = htmlText.indexOf(startMarker);
if (startIdx === -1) {
  console.error('Could not locate `const PHILOSOPHERS = [` in public/mull.html');
  process.exit(1);
}

// Find the matching closing `];` after startIdx — naive but works
// because there are no nested arrays at the top level. The next `];`
// after the PHILOSOPHERS opening is the end.
const endIdx = htmlText.indexOf('];', startIdx);
if (endIdx === -1) {
  console.error('Could not locate closing `];` of PHILOSOPHERS in public/mull.html');
  process.exit(1);
}

const arrayBlock = htmlText.slice(startIdx, endIdx + 2);
const beforeArray = htmlText.slice(0, startIdx);
const afterArray = htmlText.slice(endIdx + 2);

// Entry pattern: `{ name:"<name>", dates:"...", keyIdea:"...",\n      p: v({...}) }`
// We match per-entry, capture the name, and decide if the entry needs
// `aliases:[...]` injected after the keyIdea string.
//
// The pattern is intentionally narrow:
//   - `{ name:"<NAME>"` — opening
//   - non-greedy fill up to `keyIdea:"<CONTENT>"`
//   - the keyIdea string may contain escaped quotes — we match
//     `"(?:[^"\\]|\\.)*"`
//   - then a `,` then optional whitespace/newline then `p:` (which we
//     check is the next field, so we know we're between keyIdea and p)
const entryRegex = /(\{\s*name:"([^"]+)",[^}]*?keyIdea:"(?:[^"\\]|\\.)*",)(\s*)(p:\s*v\()/g;

let updatedEntries = 0;
let skippedAlreadyHas = 0;
let skippedNoSource = 0;
let untouched = 0;

const newArrayBlock = arrayBlock.replace(entryRegex, (match, prefix, name, ws, pStart) => {
  // Already has aliases? prefix would contain ` aliases:[` between
  // keyIdea and p. (Because keyIdea is *part of* prefix, we need to
  // check the chars between keyIdea and the end of prefix.)
  if (/aliases:\s*\[/.test(prefix)) {
    skippedAlreadyHas++;
    return match;
  }
  const aliases = aliasByName.get(name);
  if (!aliases) {
    skippedNoSource++;
    return match;
  }
  if (aliases.length === 0) {
    // No aliases to add. Skip the injection to keep the entry short.
    untouched++;
    return match;
  }
  updatedEntries++;
  const aliasesJson = JSON.stringify(aliases);
  // Insert ` aliases:[...]` between the trailing comma of keyIdea and
  // the whitespace before `p:`. Preserve the existing whitespace.
  return `${prefix} aliases:${aliasesJson},${ws}${pStart}`;
});

console.log(`Entries updated:        ${updatedEntries}`);
console.log(`Already had aliases:    ${skippedAlreadyHas}`);
console.log(`Not in lib (mull-only): ${skippedNoSource}`);
console.log(`In lib but empty aliases (skipped): ${untouched}`);

if (newArrayBlock === arrayBlock) {
  console.log('No changes needed. mull.html is already in sync.');
  process.exit(0);
}

if (!APPLY) {
  console.log('\nDry-run only. Re-run with --apply to write changes back.');
  process.exit(0);
}

// ─── Also patch the search filter to include aliases ─────────────────
//
// The existing filter (around line 9228) only matches name + keyIdea.
// We extend it to also match any alias. Idempotent: only patches if
// the alias check isn't already present.

let patchedHtml = beforeArray + newArrayBlock + afterArray;

const oldFilter = `s.philosopher.name.toLowerCase().includes(f) || (s.philosopher.keyIdea || '').toLowerCase().includes(f)`;
const newFilter = `s.philosopher.name.toLowerCase().includes(f) || (s.philosopher.keyIdea || '').toLowerCase().includes(f) || (s.philosopher.aliases || []).some(a => a.toLowerCase().includes(f))`;

if (patchedHtml.includes(oldFilter) && !patchedHtml.includes('s.philosopher.aliases')) {
  patchedHtml = patchedHtml.replace(oldFilter, newFilter);
  console.log('Patched search filter to include aliases.');
} else if (patchedHtml.includes('s.philosopher.aliases')) {
  console.log('Search filter already includes aliases. Skipping.');
} else {
  console.warn('WARNING: could not locate the search filter to patch. Aliases will be in the data but the search box may not use them. Check public/mull.html around line 9228.');
}

writeFileSync(TARGET_HTML, patchedHtml);
console.log(`\nWrote ${TARGET_HTML}.`);
