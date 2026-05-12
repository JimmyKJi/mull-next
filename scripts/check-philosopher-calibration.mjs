#!/usr/bin/env node
// scripts/check-philosopher-calibration.mjs
//
// Mechanical calibration sanity check for the philosopher corpus.
//
// The Wave 2 corpus (394 entries, ~70% of the total) was generated
// from tradition baselines plus per-entry overrides. The tradition
// baselines are hand-tuned, the overrides are partial, and the result
// is a vector that should "feel right" — close to peers, classified
// into a defensible archetype. But "should feel right" is a vibe; this
// script makes it auditable.
//
// What it checks
//
//   1. Isolation. For each entry, compute its top-K nearest neighbors
//      via cosine similarity. An entry whose top-1 neighbor is far
//      away (low cosine sim) is sitting alone in vector space. That's
//      either (a) legitimately unique, or (b) a poorly-calibrated
//      vector. We flag entries below a configurable threshold so a
//      human can eyeball them.
//
//   2. Archetype margin. For each entry, find its top archetype + the
//      runner-up. Compute the sim difference. A tiny margin means the
//      entry sits between two archetypes — sometimes that's honest
//      (paradoxical thinkers like Spinoza), sometimes it means the
//      vector needs nudging.
//
//   3. Wave 1 vs Wave 2 distribution. Wave 1 was hand-curated. If
//      Wave 2 has a meaningfully different distribution (e.g. all
//      Wave 2 entries are isolated), the generator is wrong.
//
// What it doesn't check
//
//   * Whether the vector matches the actual philosophy. That requires
//     Claude reading the keyIdea against the vector — a separate pass
//     that runs through a skill rather than this script.
//
// Output: a markdown report at scripts/calibration-report.md plus a
// stdout summary. No file mutations.

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, '..');

// ─── Tunables ─────────────────────────────────────────────────────────

const TOP_K = 5;                       // how many nearest kin to display per entry
const ISOLATION_THRESHOLD = 0.92;      // top-1 sim below this is "isolated"
const MARGIN_THRESHOLD = 0.020;        // archetype margin below this is "ambiguous"
const REPORT_MAX_ISOLATED = 30;        // cap report size

// ─── Helpers ──────────────────────────────────────────────────────────

function cos(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return na && nb ? dot / Math.sqrt(na * nb) : 0;
}

// ─── Parse the registry-style files (no TS runtime needed) ────────────

async function loadPhilosophers() {
  const src = await readFile(join(REPO, 'lib/philosophers.ts'), 'utf8');
  const declMatch = src.match(/export const PHILOSOPHERS[\s\S]*?=\s*\[/);
  if (!declMatch) throw new Error('Could not find PHILOSOPHERS declaration.');
  const openIdx = declMatch.index + declMatch[0].length - 1;
  let depth = 0, closeIdx = -1;
  for (let i = openIdx; i < src.length; i++) {
    if (src[i] === '[') depth++;
    else if (src[i] === ']') {
      depth--;
      if (depth === 0) { closeIdx = i; break; }
    }
  }
  const arrayText = src.slice(openIdx, closeIdx + 1);
  const jsonish = arrayText
    .replace(/\/\/[^\n]*/g, '')        // strip line comments (Wave 1/2 markers)
    .replace(/,(\s*[\]}])/g, '$1');    // strip trailing commas
  const entries = JSON.parse(jsonish);
  return entries;
}

import { loadArchetypeTargets } from './_load-archetype-targets.mjs';

// Archetype target vectors come from lib/archetype-targets.ts via the
// shared loader. That file is the source of truth — when archetype
// targets change (e.g. the pre-launch bump of Cartographer's PO from
// 6 to 8), this script picks them up automatically.

async function loadArchetypes() {
  return loadArchetypeTargets();
}

const DIM_KEYS = ['TV','VA','WP','TR','TE','RT','MR','SR','CE','SS','PO','TD','AT','ES','UI','SI'];

function expandSignature(sigObj) {
  return DIM_KEYS.map(k => (k in sigObj ? sigObj[k] : 5));
}

// ─── Main analysis ───────────────────────────────────────────────────

async function main() {
  const philosophers = await loadPhilosophers();
  const archetypes = await loadArchetypes();
  console.log(`Loaded ${philosophers.length} philosophers and ${archetypes.length} archetypes.`);

  // Expand each archetype's partial dim signature into a full 16-D vector.
  const archVecs = archetypes.map(a => ({
    key: a.key,
    name: a.name,
    vec: expandSignature(a.p),
  }));

  // For each philosopher, compute top-K nearest other-philosopher kin
  // and the archetype classification with margin.
  const results = [];
  for (let i = 0; i < philosophers.length; i++) {
    const p = philosophers[i];
    const sims = [];
    for (let j = 0; j < philosophers.length; j++) {
      if (i === j) continue;
      sims.push({ idx: j, sim: cos(p.vector, philosophers[j].vector) });
    }
    sims.sort((a, b) => b.sim - a.sim);
    const top = sims.slice(0, TOP_K).map(s => ({
      name: philosophers[s.idx].name,
      archetype: philosophers[s.idx].archetypeName,
      sim: s.sim,
    }));

    // Archetype margin.
    const archSims = archVecs.map(a => ({ name: a.name, key: a.key, sim: cos(p.vector, a.vec) }));
    archSims.sort((a, b) => b.sim - a.sim);
    const margin = archSims[0].sim - archSims[1].sim;

    results.push({
      idx: i,
      name: p.name,
      dates: p.dates,
      classifiedAs: p.archetypeName,
      topKin: top,
      top1Sim: top[0]?.sim ?? 0,
      archetypeMargin: margin,
      runnerUpArchetype: archSims[1].name,
      runnerUpSim: archSims[1].sim,
    });
  }

  // ─── Aggregate stats ────────────────────────────────────────────
  const sortedByIsolation = results.slice().sort((a, b) => a.top1Sim - b.top1Sim);
  const sortedByMargin    = results.slice().sort((a, b) => a.archetypeMargin - b.archetypeMargin);

  const top1Sims = results.map(r => r.top1Sim);
  const meanTop1 = top1Sims.reduce((s, v) => s + v, 0) / top1Sims.length;
  const medianTop1 = top1Sims.slice().sort((a, b) => a - b)[Math.floor(top1Sims.length / 2)];
  const isolated = results.filter(r => r.top1Sim < ISOLATION_THRESHOLD);
  const ambiguous = results.filter(r => r.archetypeMargin < MARGIN_THRESHOLD);

  // Archetype distribution.
  const archetypeCounts = {};
  for (const r of results) archetypeCounts[r.classifiedAs] = (archetypeCounts[r.classifiedAs] ?? 0) + 1;

  // ─── Print summary ──────────────────────────────────────────────
  console.log(`\nIsolation (top-1 sim) distribution:`);
  console.log(`  mean   ${meanTop1.toFixed(3)}`);
  console.log(`  median ${medianTop1.toFixed(3)}`);
  console.log(`  isolated (< ${ISOLATION_THRESHOLD}): ${isolated.length} entries`);

  console.log(`\nArchetype-margin distribution:`);
  console.log(`  ambiguous (< ${MARGIN_THRESHOLD}): ${ambiguous.length} entries`);

  console.log(`\nArchetype counts:`);
  for (const [name, n] of Object.entries(archetypeCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(name).padEnd(22)} ${n}`);
  }

  // ─── Build report ───────────────────────────────────────────────
  const md = [];
  md.push('# Philosopher calibration report');
  md.push('');
  md.push(`Generated: ${new Date().toISOString()}.  Corpus size: ${philosophers.length}.`);
  md.push('');
  md.push(`Top-1 nearest-kin similarity — mean ${meanTop1.toFixed(3)}, median ${medianTop1.toFixed(3)}.`);
  md.push(`Entries below the isolation threshold (${ISOLATION_THRESHOLD}): **${isolated.length}**.`);
  md.push(`Entries below the archetype-margin threshold (${MARGIN_THRESHOLD}): **${ambiguous.length}**.`);
  md.push('');
  md.push('## Archetype distribution');
  md.push('');
  md.push('| Archetype | Count |');
  md.push('|---|---|');
  for (const [name, n] of Object.entries(archetypeCounts).sort((a, b) => b[1] - a[1])) {
    md.push(`| ${name} | ${n} |`);
  }
  md.push('');
  md.push('## Most isolated entries');
  md.push('');
  md.push('These have a low top-1 nearest-kin similarity. Isolation is sometimes legitimate (Buddha is genuinely far from anyone) and sometimes a calibration bug (a Wave 2 vector that needs nudging). Review each by inspecting the top-5 kin — if they make sense, the entry is fine; if they look totally unrelated, the vector probably needs work.');
  md.push('');
  md.push('| Name | Dates | Top-1 sim | Classified | Top 5 nearest kin |');
  md.push('|---|---|---|---|---|');
  for (const r of sortedByIsolation.slice(0, REPORT_MAX_ISOLATED)) {
    const kinList = r.topKin.map(k => `${k.name} (${(k.sim * 100).toFixed(0)}%)`).join('; ');
    md.push(`| ${r.name} | ${r.dates} | ${r.top1Sim.toFixed(3)} | ${r.classifiedAs} | ${kinList} |`);
  }
  md.push('');
  md.push('## Most archetype-ambiguous entries');
  md.push('');
  md.push('These sit nearly equidistant between two archetypes. A small margin is honest for paradoxical thinkers (Spinoza, Pascal, Wittgenstein) and a red flag for everyone else — if a thinker should clearly be one archetype, the vector may need to lean more in that direction.');
  md.push('');
  md.push('| Name | Classified | Runner-up | Margin |');
  md.push('|---|---|---|---|');
  for (const r of sortedByMargin.slice(0, REPORT_MAX_ISOLATED)) {
    md.push(`| ${r.name} | ${r.classifiedAs} | ${r.runnerUpArchetype} | ${r.archetypeMargin.toFixed(4)} |`);
  }
  md.push('');

  const reportPath = join(REPO, 'scripts/calibration-report.md');
  await writeFile(reportPath, md.join('\n'));
  console.log(`\nFull report: ${reportPath}`);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
