#!/usr/bin/env node
// scripts/backfill-aliases.mjs
//
// One-shot backfill of search aliases for the philosopher corpus. Wave 1
// (hand-curated) entries were never run through the alias generator, so
// many have empty `aliases: []` even when the algorithmic answer is clear
// — e.g. "Thomas Aquinas" should match both "Thomas" and "Aquinas".
//
// What this script does:
//
//   1. Loads lib/philosophers.ts, parses out the PHILOSOPHERS array.
//   2. For every entry whose `aliases` is empty, applies the genAliases()
//      algorithm copy-pasted from scripts/gen-philosophers.mjs.
//   3. For names where the algorithm produces a known-bad result
//      (initialisms like "W.E.B." that lose their dots; honorifics like
//      "Thich" that aren't real aliases; composite names like "Baal Shem
//      Tov"), uses a hand-curated override from MANUAL_OVERRIDES below.
//   4. Writes the updated array back into lib/philosophers.ts. Mirrors the
//      same change into public/mull.html's inline PHILOSOPHERS table so
//      the constellation map and the static homepage stay in sync.
//   5. Emits a JSON change log + a markdown audit report under outputs/
//      so the diff is auditable and re-runnable.
//
// Modes:
//   --dry-run   Compute changes and write the audit, but DON'T touch
//               lib/philosophers.ts or public/mull.html. Default.
//   --apply     Write the changes to both files. Pass this once the
//               dry-run audit looks good.

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, '..');

const APPLY = process.argv.includes('--apply');
const MODE = APPLY ? 'apply' : 'dry-run';

// ─── Algorithm (copy-pasted from gen-philosophers.mjs) ───────────────
// Keep this in sync if the generator changes. Duplicating beats taking a
// runtime dependency on a 700-line generator script for a one-shot.
function genAliases(name) {
  const aliases = new Set();
  const trimmed = name.trim();
  const paren = trimmed.match(/\(([^)]+)\)/);
  if (paren) aliases.add(paren[1].trim());
  const cleaned = trimmed.replace(/\s*\([^)]*\)/g, '').trim();
  const ofMatch = cleaned.match(/^(.+?)\s+of\s+(.+)$/i);
  if (ofMatch) aliases.add(ofMatch[1].trim());
  const PARTICLES = new Set(['of','the','de','la','le','von','van','der','den','di','da','ibn','ben','al','el','bin']);
  const HONORIFICS = new Set(['sri','saint','st','st.','dom','sister','brother','rabbi','sheikh','imam','swami','lama','rev','reverend','sor','madame','sir','dame']);
  const words = cleaned.replace(/[,.]/g, '').split(/\s+/).filter(Boolean);
  if (words.length > 1) {
    let firstIdx = 0;
    while (firstIdx < words.length && HONORIFICS.has(words[firstIdx].toLowerCase())) firstIdx++;
    if (firstIdx < words.length) aliases.add(words[firstIdx]);
    let lastIdx = words.length - 1;
    while (lastIdx > firstIdx && PARTICLES.has(words[lastIdx].toLowerCase())) lastIdx--;
    while (lastIdx > firstIdx && /^(jr\.?|sr\.?|i{1,3}|iv|v|vi)$/i.test(words[lastIdx])) lastIdx--;
    if (lastIdx > firstIdx) aliases.add(words[lastIdx]);
  }
  return [...aliases]
    .map(s => s.trim())
    .filter(s => s && s.toLowerCase() !== trimmed.toLowerCase());
}

// ─── Manual overrides ─────────────────────────────────────────────────
//
// Cases where the algorithm produces a wrong/awkward result. Each value
// is the FULL alias array we want (replaces the algorithm's output, not
// added to it). Keep the rationale next to each.
//
// Rule of thumb: pick aliases a real user might type when searching.
// "WEB" (dot-stripped initialism) isn't a thing anyone types; "Du Bois"
// is. Same for honorific-prefixed names — drop the honorific.

const MANUAL_OVERRIDES = {
  // Initialism surnames — preserve the dotted form + use the surname.
  'W.E.B. Du Bois':       ['Du Bois', 'W.E.B.'],
  'G.E.M. Anscombe':      ['Anscombe', 'G.E.M.'],
  'D.T. Suzuki':          ['D.T. Suzuki', 'Suzuki'], // Suzuki collides with Shunryu Suzuki; full form disambiguates.

  // Composite / honorific names — the honorific alone is not a useful alias.
  'Thich Nhat Hanh':      ['Nhat Hanh', 'Hanh'],
  'Cheikh Anta Diop':     ['Diop', 'Anta Diop'],

  // Composite title — the unit is the canonical reference.
  'Baal Shem Tov':        ['Baal Shem Tov', 'Besht'], // Besht is the standard initialism in Jewish thought.

  // Variants / alternate spellings.
  'Hui Neng':             ['Huineng', 'Hui Neng'],

  // Title with ordinal — "14th" is meaningless as alias; birth name fills in.
  'Dalai Lama (14th)':    ['Dalai Lama', 'Tenzin Gyatso'],
};

// ─── Load + parse philosophers ────────────────────────────────────────

const philosophersPath = join(REPO, 'lib/philosophers.ts');
const src = await readFile(philosophersPath, 'utf8');

const declMatch = src.match(/export const PHILOSOPHERS[\s\S]*?=\s*\[/);
if (!declMatch) throw new Error('Could not find PHILOSOPHERS array declaration.');
const openIdx = declMatch.index + declMatch[0].length - 1;

let depth = 0, closeIdx = -1;
for (let i = openIdx; i < src.length; i++) {
  if (src[i] === '[') depth++;
  else if (src[i] === ']') {
    depth--;
    if (depth === 0) { closeIdx = i; break; }
  }
}
if (closeIdx < 0) throw new Error('Could not find closing bracket of PHILOSOPHERS array.');

const arrayText = src.slice(openIdx, closeIdx + 1);
const jsonish = arrayText
  .replace(/\/\/[^\n]*/g, '')     // line comments
  .replace(/,(\s*[\]}])/g, '$1'); // trailing commas
const entries = JSON.parse(jsonish);

console.log(`Mull · alias backfill (${MODE})\n`);
console.log(`Loaded ${entries.length} philosopher entries from lib/philosophers.ts.\n`);

// ─── Compute changes ──────────────────────────────────────────────────

const changes = [];
let mononymCount = 0;
let overrideCount = 0;
let autoCount = 0;
let preservedCount = 0;

for (const entry of entries) {
  if (entry.aliases && entry.aliases.length > 0) {
    preservedCount++;
    continue; // already has aliases, don't touch
  }

  let newAliases;
  let source;
  if (MANUAL_OVERRIDES[entry.name]) {
    newAliases = MANUAL_OVERRIDES[entry.name];
    source = 'manual_override';
    overrideCount++;
  } else {
    newAliases = genAliases(entry.name);
    if (newAliases.length === 0) {
      mononymCount++;
      continue; // intentional mononym
    }
    source = 'algorithm';
    autoCount++;
  }

  changes.push({
    name: entry.name,
    dates: entry.dates,
    archetype: entry.archetypeName,
    before: entry.aliases,
    after: newAliases,
    source,
  });
  // Mutate in place for the eventual write.
  entry.aliases = newAliases;
}

console.log(`Empty-alias entries:`);
console.log(`  Mononyms (correctly left empty):     ${mononymCount}`);
console.log(`  Algorithm backfills:                 ${autoCount}`);
console.log(`  Manual overrides applied:            ${overrideCount}`);
console.log(`  Already had aliases (preserved):     ${preservedCount}`);
console.log(`  Total changes:                       ${changes.length}\n`);

// ─── Write the audit ──────────────────────────────────────────────────

const auditDir = join(REPO, 'scripts');
const auditJsonPath = join(REPO, 'scripts/alias-backfill-audit.json');
const auditMdPath = join(REPO, 'scripts/alias-backfill-audit.md');

await writeFile(auditJsonPath, JSON.stringify({
  mode: MODE,
  ranAt: new Date().toISOString(),
  stats: { mononymCount, autoCount, overrideCount, preservedCount, totalChanges: changes.length },
  changes,
}, null, 2));

const md = [];
md.push('# Alias backfill audit');
md.push('');
md.push(`Mode: **${MODE}**.  Generated: ${new Date().toISOString()}.`);
md.push('');
md.push(`Loaded ${entries.length} entries. ${changes.length} would change (${autoCount} algorithmic, ${overrideCount} hand-overridden).`);
md.push(`${mononymCount} entries are intentional mononyms (no alias needed). ${preservedCount} already had aliases and were left alone.`);
md.push('');
md.push('## Manual overrides');
md.push('');
md.push('| Name | Before | After | Why |');
md.push('|---|---|---|---|');
for (const c of changes.filter(c => c.source === 'manual_override')) {
  const why = {
    'W.E.B. Du Bois':    'algorithm strips dots → "WEB", and treats "Du" as particle, leaving "Bois" alone; the canonical search term is "Du Bois"',
    'G.E.M. Anscombe':   '"GEM" loses dots; "Anscombe" alone is the standard cite',
    'D.T. Suzuki':       'collides with Shunryu Suzuki, so keep the full "D.T. Suzuki" form alongside the surname',
    'Thich Nhat Hanh':   '"Thich" is a Vietnamese Buddhist honorific, not a name; "Hanh" / "Nhat Hanh" are the real handles',
    'Cheikh Anta Diop':  '"Cheikh" is Senegalese honorific akin to Sheikh',
    'Baal Shem Tov':     '"Baal" and "Tov" are meaningless atoms; the unit is the name. Besht is the standard initialism in Jewish thought',
    'Hui Neng':          'alt spelling "Huineng" is widely used in English-language scholarship',
    'Dalai Lama (14th)': '"14th" is not a useful alias; the birth name Tenzin Gyatso is the searchable form',
  }[c.name] || '';
  md.push(`| ${c.name} | ${JSON.stringify(c.before)} | ${JSON.stringify(c.after)} | ${why} |`);
}
md.push('');
md.push('## Algorithmic backfills');
md.push('');
md.push('| Name | Dates | After |');
md.push('|---|---|---|');
for (const c of changes.filter(c => c.source === 'algorithm')) {
  md.push(`| ${c.name} | ${c.dates} | ${JSON.stringify(c.after)} |`);
}
md.push('');
md.push('## Intentional mononyms (no change)');
md.push('');
md.push(`${mononymCount} entries kept empty aliases because the canonical name is the only searchable handle.`);
md.push('');
const mononymNames = entries
  .filter(e => (!e.aliases || e.aliases.length === 0))
  .map(e => e.name);
md.push(mononymNames.map(n => `\`${n}\``).join(', '));
md.push('');
await writeFile(auditMdPath, md.join('\n'));

console.log(`Audit written to:`);
console.log(`  ${auditJsonPath}`);
console.log(`  ${auditMdPath}\n`);

if (!APPLY) {
  console.log('Dry-run complete. Review the audit, then re-run with --apply to write the changes.');
  process.exit(0);
}

// ─── Apply: patch lib/philosophers.ts ─────────────────────────────────
//
// We do targeted, per-entry regex edits rather than rewriting the whole
// array via JSON.stringify, because the file has inline section comments
// (e.g. "// ─── Wave 2 corpus ───") that a full rewrite would wipe out.
//
// For each changed entry: find its `"name": "X"` line, then the next
// `"aliases": [...]` (which may span multiple lines for non-empty
// arrays), and replace just the alias array literal with the new value.

let libSrc = src;
let libChanged = 0;
let libNotFound = 0;

for (const c of changes) {
  // Escape regex special chars in the name. We match "name": "X" with
  // any whitespace, then [\s\S]*? lazily up to the entry's "aliases": […]
  // array. The array literal is matched as `\[` followed by any chars
  // (including newlines) followed by `\]`. Lazy so we don't span entries.
  const escapedName = c.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(
    `("name":\\s*"${escapedName}"[\\s\\S]*?"aliases":\\s*)\\[[\\s\\S]*?\\]`,
  );
  // Render the new alias array. Empty → `[]` inline; non-empty → JSON
  // multi-line shape to match the rest of the file.
  const newLiteral = c.after.length === 0
    ? '[]'
    : '[\n      ' + c.after.map(a => JSON.stringify(a)).join(',\n      ') + '\n    ]';
  const replaced = libSrc.replace(re, `$1${newLiteral}`);
  if (replaced === libSrc) {
    libNotFound++;
    console.warn(`  ! Not matched in lib/philosophers.ts: "${c.name}"`);
  } else {
    libChanged++;
    libSrc = replaced;
  }
}

await writeFile(philosophersPath, libSrc);
console.log(`Wrote ${philosophersPath}.`);
console.log(`  ${libChanged} entries updated; ${libNotFound} not matched.`);

// ─── Note on public/mull.html ────────────────────────────────────────
//
// mull.html's PHILOSOPHERS table doesn't have an `aliases` field — its
// in-browser search uses name-only matching against the constellation.
// Aliases are a server-side concept (used by /philosopher routes and
// the Next.js search-panel). If we ever want client-side alias search
// on the static homepage, we'd add an `aliases` property to each entry
// in mull.html — a separate, larger refactor we're not doing here.
//
// So the mull.html side of this is a no-op. Document in the audit so a
// future reader doesn't wonder why mull.html wasn't touched.
console.log(`public/mull.html: no aliases field in its PHILOSOPHERS table; nothing to update there.`);
console.log(`(Aliases are server-side only; client-side search uses name matching.)`);
