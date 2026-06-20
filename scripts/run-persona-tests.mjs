#!/usr/bin/env node
// scripts/run-persona-tests.mjs
//
// Persona-based stress test for the quiz scoring + archetype model.
//
// Why this exists
//
// Mull's 16-D model + 10 archetype targets are calibrated through a
// mix of hand-tuning, peer review, and the philosopher-corpus
// calibration script. None of those check the *end-to-end* user
// journey: would a user holding a specific philosophical stance
// actually be classified correctly? This script answers that.
//
// It defines three persona families:
//
//   1. CANONICAL — one persona per archetype, where the persona is
//      the archetype's clearest exemplar. The Stoic should land on
//      Keel. The existentialist should land on Pilgrim. If any
//      canonical persona fails, the model is broken at its core.
//
//   2. EDGE — personas sitting on documented classification
//      boundaries. The Spinoza-style monist between Cartographer and
//      Lighthouse, the Augustinian pilgrim between Keel and Pilgrim.
//      Each has a set of acceptable archetypes — failure means a
//      vector landed somewhere we didn't expect, not necessarily
//      that the model is wrong.
//
//   3. PARADOX — personas that intentionally span multiple
//      archetypes (Conservative Anarchist, Mystical Empiricist,
//      Practical Idealist). The model should signal *tension* on
//      these — a low archetype margin — rather than confidently
//      picking one. The test passes if the top archetype's margin
//      over the runner-up is small enough that the result UI would
//      surface the tension chip.
//
// Each persona's vector can be specified two ways:
//   - direct: `{ vector: [...] }` — a hand-tuned 16-D vector
//   - answers: `{ answers: { 'questionPrefix': 'optionPrefix', ... } }`
//     — quiz-driven; the script finds the matching answer and sums
//     its vector contribution. The questionPrefix matches the start
//     of the quiz question's prompt; the optionPrefix matches the
//     start of the chosen answer's text. Forgiving matchers so the
//     personas don't break every time we tweak quiz copy.
//
// Output: a markdown report at scripts/persona-test-report.md plus a
// stdout summary. Exits 0 if all canonical + edge personas pass
// (paradox is informational — paradox failures don't fail CI). Exits
// 1 if any canonical or edge persona fails — those are real bugs.
//
// Usage:
//   node scripts/run-persona-tests.mjs          # full report
//   node scripts/run-persona-tests.mjs --quiet  # summary only

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import { loadArchetypeTargets } from './_load-archetype-targets.mjs';

const __filename = fileURLToPath(import.meta.url);
const REPO = resolve(dirname(__filename), '..');
const QUIET = process.argv.includes('--quiet');

const DIM_KEYS = [
  'TV',
  'VA',
  'WP',
  'TR',
  'TE',
  'RT',
  'MR',
  'SR',
  'CE',
  'SS',
  'PO',
  'TD',
  'AT',
  'ES',
  'UI',
  'SI',
];
const PARADOX_MAX_MARGIN = 0.04; // top minus runner-up must be ≤ this to "signal tension"

// ─── Vector + scoring helpers ────────────────────────────────────────

function blankVec() {
  return new Array(DIM_KEYS.length).fill(0);
}

function vecFromShorthand(obj) {
  const v = blankVec();
  for (const [k, val] of Object.entries(obj)) {
    const i = DIM_KEYS.indexOf(k);
    if (i >= 0) v[i] = val;
  }
  return v;
}

function addVec(a, b) {
  return a.map((x, i) => x + b[i]);
}

function cos(a, b) {
  let dot = 0,
    na = 0,
    nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return na && nb ? dot / Math.sqrt(na * nb) : 0;
}

function expandSignature(sigObj) {
  return DIM_KEYS.map((k) => (k in sigObj ? sigObj[k] : 5));
}

function classify(userVec, archVecs) {
  const sims = archVecs.map((a) => ({ ...a, sim: cos(userVec, a.vec) }));
  sims.sort((a, b) => b.sim - a.sim);
  return {
    top: sims[0],
    runnerUp: sims[1],
    margin: sims[0].sim - sims[1].sim,
    all: sims,
  };
}

// ─── Quiz loading ────────────────────────────────────────────────────
//
// We reuse the parser from the voice-linter conceptually — walk the
// quiz file character by character, respecting braces + quotes, to
// pull out questions and their answer vectors. Simpler version here
// since we only need prompt text + answer text + vector.

async function loadQuiz(filename) {
  const src = await readFile(resolve(REPO, filename), 'utf8');
  const startRe = /export const \w+:\s*Question\[\]\s*=\s*\[/;
  const startMatch = src.match(startRe);
  if (!startMatch) throw new Error(`Could not locate QUESTIONS array in ${filename}`);
  const body = src.slice(startMatch.index + startMatch[0].length);
  const questions = [];

  let i = 0;
  while (i < body.length) {
    while (i < body.length && body[i] !== '{') i++;
    if (i >= body.length) break;
    const start = i;
    let depth = 0,
      inStr = null,
      escape = false;
    while (i < body.length) {
      const ch = body[i];
      if (escape) {
        escape = false;
        i++;
        continue;
      }
      if (inStr) {
        if (ch === '\\') escape = true;
        else if (ch === inStr) inStr = null;
        i++;
        continue;
      }
      if (ch === '"' || ch === "'" || ch === '`') {
        inStr = ch;
        i++;
        continue;
      }
      if (ch === '{') depth++;
      else if (ch === '}') {
        depth--;
        if (depth === 0) {
          i++;
          break;
        }
      }
      i++;
    }
    const block = body.slice(start, i);

    const pMatch = block.match(/p:\s*"((?:[^"\\]|\\.)*)"/);
    if (!pMatch) continue;
    const prompt = pMatch[1].replace(/\\"/g, '"');

    const answers = [];
    const ansRe = /\{\s*t:\s*"((?:[^"\\]|\\.)*)"\s*,\s*v:\s*v\(\{([^}]*)\}\)\s*\}/g;
    let am;
    while ((am = ansRe.exec(block))) {
      const text = am[1].replace(/\\"/g, '"');
      const shorthand = {};
      for (const part of am[2].split(',')) {
        const [k, val] = part.split(':').map((s) => s.trim());
        if (k && val) shorthand[k] = Number(val);
      }
      answers.push({ text, vector: vecFromShorthand(shorthand) });
    }
    if (answers.length > 0) questions.push({ prompt, answers });
  }
  return questions;
}

// Score a persona that specifies its answers via prefix matchers.
function scoreFromAnswers(answerMap, questions) {
  let vec = blankVec();
  const matched = [];
  const unmatched = [];
  for (const [qPrefix, aPrefix] of Object.entries(answerMap)) {
    const q = questions.find((q) => q.prompt.startsWith(qPrefix));
    if (!q) {
      unmatched.push({ qPrefix, why: 'no question matched prefix' });
      continue;
    }
    const a = q.answers.find((a) => a.text.startsWith(aPrefix));
    if (!a) {
      unmatched.push({ qPrefix, why: `no answer in matched question starts with "${aPrefix}"` });
      continue;
    }
    vec = addVec(vec, a.vector);
    matched.push({ q: q.prompt.slice(0, 60), a: a.text.slice(0, 60) });
  }
  return { vector: vec, matched, unmatched };
}

// ─── Personas ────────────────────────────────────────────────────────
//
// Vector personas: documented signatures for the archetype's exemplar.
// These mirror the archetype target vectors from lib/archetype-targets.ts
// but with small tweaks per persona so they aren't tautological. Each
// persona is meant to represent a *real human reader* of that
// orientation, not the archetype target itself.

const CANONICAL_PERSONAS = [
  {
    name: 'The Stoic',
    description:
      "Marcus Aurelius reader who actually practices premortems. Focused on what they control, accepting of what they can't. Quiet.",
    expected: ['keel'],
    vector: vecFromShorthand({
      TV: 7,
      VA: 6,
      WP: 2,
      TR: 8,
      TE: 6,
      RT: 6,
      MR: 3,
      SR: 5,
      CE: 6,
      SS: 5,
      PO: 10,
      TD: 5,
      AT: 8,
      ES: 3,
      UI: 7,
      SI: 3,
    }),
  },
  {
    name: 'The Existentialist',
    description:
      'Camus reader. Knows the absurd is real, refuses both suicide and philosophical retreat. Acts with full freedom.',
    expected: ['pilgrim'],
    vector: vecFromShorthand({
      TV: 8,
      VA: 5,
      WP: 7,
      TR: 5,
      TE: 7,
      RT: 2,
      MR: 3,
      SR: 4,
      CE: 4,
      SS: 9,
      PO: 6,
      TD: 4,
      AT: 4,
      ES: 6,
      UI: 4,
      SI: 5,
    }),
  },
  {
    name: 'The Systematic Rationalist',
    description:
      'Plato + Kant reader. Reality has a rational structure; reason can grasp it; the universal is what matters.',
    expected: ['lighthouse'],
    vector: vecFromShorthand({
      TV: 4,
      VA: 5,
      WP: 4,
      TR: 10,
      TE: 3,
      RT: 3,
      MR: 6,
      SR: 2,
      CE: 5,
      SS: 4,
      PO: 5,
      TD: 9,
      AT: 6,
      ES: 2,
      UI: 9,
      SI: 3,
    }),
  },
  {
    name: 'The Patient Mapper',
    description:
      "Spinoza + Parfit reader. Build the system. Trace how everything connects. Don't skip steps.",
    expected: ['cartographer'],
    vector: vecFromShorthand({
      TV: 5,
      VA: 5,
      WP: 4,
      TR: 9,
      TE: 6,
      RT: 5,
      MR: 4,
      SR: 4,
      CE: 5,
      SS: 4,
      PO: 8,
      TD: 9,
      AT: 5,
      ES: 5,
      UI: 7,
      SI: 4,
    }),
  },
  {
    name: 'The Sceptic',
    description:
      'Hume + Sextus Empiricus reader. Suspend judgment. Most philosophical certainties dissolve under pressure.',
    expected: ['touchstone'],
    vector: vecFromShorthand({
      TV: 6,
      VA: 5,
      WP: 3,
      TR: 6,
      TE: 7,
      RT: 4,
      MR: 3,
      SR: 9,
      CE: 5,
      SS: 6,
      PO: 6,
      TD: 6,
      AT: 4,
      ES: 6,
      UI: 4,
      SI: 6,
    }),
  },
  {
    name: 'The Iconoclast',
    description:
      "Nietzsche + Stirner reader. The inherited values are dead. Sovereign self against the herd. Break what doesn't serve.",
    expected: ['hammer'],
    vector: vecFromShorthand({
      TV: 5,
      VA: 7,
      WP: 9,
      TR: 6,
      TE: 6,
      RT: 1,
      MR: 2,
      SR: 5,
      CE: 2,
      SS: 10,
      PO: 6,
      TD: 5,
      AT: 4,
      ES: 7,
      UI: 3,
      SI: 4,
    }),
  },
  {
    name: 'The Mystic',
    description:
      'Rumi + Pseudo-Dionysius reader. The deepest truths are apophatic. Reason runs out before reality does.',
    expected: ['threshold'],
    vector: vecFromShorthand({
      TV: 7,
      VA: 7,
      WP: 3,
      TR: 4,
      TE: 5,
      RT: 7,
      MR: 10,
      SR: 5,
      CE: 6,
      SS: 4,
      PO: 5,
      TD: 8,
      AT: 7,
      ES: 4,
      UI: 7,
      SI: 7,
    }),
  },
  {
    name: 'The Reformist Liberal',
    description:
      'Mill + Wollstonecraft reader. Build forward through institutions. Reason + liberty + mutual sympathy.',
    expected: ['forge', 'garden'],
    vector: vecFromShorthand({
      TV: 4,
      VA: 7,
      WP: 6,
      TR: 8,
      TE: 7,
      RT: 3,
      MR: 2,
      SR: 5,
      CE: 6,
      SS: 7,
      PO: 8,
      TD: 6,
      AT: 3,
      ES: 6,
      UI: 8,
      SI: 3,
    }),
  },
  {
    name: 'The Tradition-Keeper',
    description:
      "Confucius + Augustine reader. The practices that survived weren't lucky. Inherit and pass on.",
    expected: ['hearth'],
    vector: vecFromShorthand({
      TV: 6,
      VA: 6,
      WP: 2,
      TR: 6,
      TE: 6,
      RT: 9,
      MR: 5,
      SR: 4,
      CE: 9,
      SS: 2,
      PO: 7,
      TD: 5,
      AT: 5,
      ES: 5,
      UI: 6,
      SI: 3,
    }),
  },
  {
    name: 'The Epicurean Gardener',
    description:
      'Epicurus + Montaigne reader. Cultivate the small good things. Friendship, simple pleasures, freedom from anxiety.',
    expected: ['garden'],
    vector: vecFromShorthand({
      TV: 3,
      VA: 9,
      WP: 3,
      TR: 6,
      TE: 8,
      RT: 5,
      MR: 2,
      SR: 6,
      CE: 7,
      SS: 6,
      PO: 9,
      TD: 5,
      AT: 3,
      ES: 8,
      UI: 5,
      SI: 4,
    }),
  },
];

// Edge personas — sit on documented boundaries.

const EDGE_PERSONAS = [
  {
    name: 'The Late-Stoic Pilgrim',
    description:
      'Stoic reader who also walks alone with the question — Marcus Aurelius meets Camus. Should be Keel or Pilgrim depending on which way the dimensions tip.',
    expected: ['keel', 'pilgrim'],
    vector: vecFromShorthand({
      TV: 7,
      VA: 5,
      WP: 4,
      TR: 7,
      TE: 7,
      RT: 4,
      MR: 3,
      SR: 5,
      CE: 5,
      SS: 7,
      PO: 8,
      TD: 5,
      AT: 6,
      ES: 5,
      UI: 5,
      SI: 4,
    }),
  },
  {
    name: 'The Engaged Cartographer',
    description:
      'Builds the system but uses it in the world — Spinoza-style monism turned practical. Cartographer or Forge.',
    expected: ['cartographer', 'forge'],
    vector: vecFromShorthand({
      TV: 5,
      VA: 6,
      WP: 6,
      TR: 9,
      TE: 6,
      RT: 4,
      MR: 3,
      SR: 4,
      CE: 6,
      SS: 5,
      PO: 9,
      TD: 8,
      AT: 4,
      ES: 5,
      UI: 7,
      SI: 4,
    }),
  },
  {
    name: 'The Quiet Mystic-Sceptic',
    description:
      'Knows apophatic mysticism, suspends ordinary judgment, neither claims nor denies. Threshold or Touchstone.',
    expected: ['threshold', 'touchstone'],
    vector: vecFromShorthand({
      TV: 6,
      VA: 6,
      WP: 3,
      TR: 5,
      TE: 6,
      RT: 6,
      MR: 8,
      SR: 8,
      CE: 5,
      SS: 5,
      PO: 5,
      TD: 7,
      AT: 6,
      ES: 4,
      UI: 6,
      SI: 7,
    }),
  },
  {
    name: 'The Reformist Tradition-Keeper',
    description:
      'Reveres inherited practice, would still adjust it — Burkean-Whig. Hearth or Forge.',
    expected: ['hearth', 'forge'],
    vector: vecFromShorthand({
      TV: 5,
      VA: 6,
      WP: 5,
      TR: 7,
      TE: 7,
      RT: 8,
      MR: 4,
      SR: 5,
      CE: 8,
      SS: 5,
      PO: 8,
      TD: 6,
      AT: 4,
      ES: 5,
      UI: 7,
      SI: 3,
    }),
  },
  {
    name: 'The Lighthouse-Touchstone Borderline',
    description:
      "Wants reasoned universal truth — but holds doubt as a discipline. Wittgenstein late + Kant's critical edge. Lighthouse or Touchstone.",
    expected: ['lighthouse', 'touchstone'],
    vector: vecFromShorthand({
      TV: 6,
      VA: 5,
      WP: 4,
      TR: 8,
      TE: 5,
      RT: 4,
      MR: 5,
      SR: 8,
      CE: 4,
      SS: 5,
      PO: 5,
      TD: 8,
      AT: 5,
      ES: 4,
      UI: 7,
      SI: 6,
    }),
  },
];

// Paradox personas — should produce LOW margin (tension signal).

const PARADOX_PERSONAS = [
  {
    name: 'The Conservative Anarchist',
    description:
      "Reveres inherited institutions AND insists moral authority is internal. Burke + Stirner. The high-RT, high-SS quadrant the 10-archetype model deliberately doesn't cover (see /methodology §Open Questions). Expected: any plausible archetype with a low margin so the result UI surfaces tension.",
    expectLowMargin: true,
    vector: vecFromShorthand({
      TV: 5,
      VA: 6,
      WP: 6,
      TR: 7,
      TE: 6,
      RT: 8,
      MR: 4,
      SR: 5,
      CE: 5,
      SS: 8,
      PO: 7,
      TD: 6,
      AT: 4,
      ES: 5,
      UI: 6,
      SI: 4,
    }),
  },
  {
    name: 'The Mystical Empiricist',
    description:
      'Trusts bodily experience AND reaches for the apophatic. James + Rumi. Crosses Garden and Threshold.',
    expectLowMargin: true,
    vector: vecFromShorthand({
      TV: 6,
      VA: 8,
      WP: 4,
      TR: 5,
      TE: 9,
      RT: 5,
      MR: 8,
      SR: 5,
      CE: 6,
      SS: 6,
      PO: 7,
      TD: 6,
      AT: 4,
      ES: 8,
      UI: 5,
      SI: 5,
    }),
  },
  {
    name: 'The Practical Idealist',
    description:
      "Universal moral principles AND practical worldly engagement. Kant's ethics + Mill's reformism. Crosses Lighthouse and Forge.",
    expectLowMargin: true,
    vector: vecFromShorthand({
      TV: 4,
      VA: 6,
      WP: 6,
      TR: 9,
      TE: 6,
      RT: 4,
      MR: 3,
      SR: 4,
      CE: 5,
      SS: 5,
      PO: 9,
      TD: 7,
      AT: 4,
      ES: 5,
      UI: 9,
      SI: 3,
    }),
  },
  {
    name: 'The Solitary Communitarian',
    description:
      'Treats the self as embedded in tradition AND insists on inward solitude. Augustine + Kierkegaard. Crosses Hearth and Pilgrim.',
    expectLowMargin: true,
    vector: vecFromShorthand({
      TV: 7,
      VA: 5,
      WP: 3,
      TR: 5,
      TE: 5,
      RT: 8,
      MR: 7,
      SR: 5,
      CE: 8,
      SS: 6,
      PO: 5,
      TD: 6,
      AT: 6,
      ES: 4,
      UI: 6,
      SI: 5,
    }),
  },
];

// ─── Run ─────────────────────────────────────────────────────────────

async function main() {
  const archetypeTargets = await loadArchetypeTargets();
  const archVecs = archetypeTargets.map((a) => ({
    key: a.key,
    name: a.name,
    vec: expandSignature(a.p),
  }));

  // Quizzes loaded but currently used only as a sanity check that the
  // parser still works. Persona vectors are set directly. Future
  // personas may exercise the `answers:` form — left in the file for
  // forward compatibility.
  const quickQuestions = await loadQuiz('lib/quiz-questions.ts');
  const detailedQuestions = await loadQuiz('lib/quiz-questions-detailed.ts');

  const results = {
    canonical: [],
    edge: [],
    paradox: [],
    parserCheck: { quick: quickQuestions.length, detailed: detailedQuestions.length },
  };

  for (const p of CANONICAL_PERSONAS) {
    const c = classify(p.vector, archVecs);
    const pass = p.expected.includes(c.top.key);
    results.canonical.push({ persona: p, classification: c, pass });
  }
  for (const p of EDGE_PERSONAS) {
    const c = classify(p.vector, archVecs);
    const pass = p.expected.includes(c.top.key);
    results.edge.push({ persona: p, classification: c, pass });
  }
  for (const p of PARADOX_PERSONAS) {
    const c = classify(p.vector, archVecs);
    const pass = c.margin <= PARADOX_MAX_MARGIN;
    results.paradox.push({ persona: p, classification: c, pass });
  }

  const canonicalFails = results.canonical.filter((r) => !r.pass);
  const edgeFails = results.edge.filter((r) => !r.pass);
  const paradoxFails = results.paradox.filter((r) => !r.pass);

  // ─── Report ─────────────────────────────────────────────────────
  const md = [];
  md.push('# Persona test report');
  md.push('');
  md.push(`Generated: ${new Date().toISOString()}.`);
  md.push('');
  md.push(
    `Quiz parser sanity check: ${results.parserCheck.quick} quick questions, ${results.parserCheck.detailed} detailed questions loaded.`,
  );
  md.push('');
  md.push(
    `- Canonical (${CANONICAL_PERSONAS.length}): ${results.canonical.length - canonicalFails.length}/${CANONICAL_PERSONAS.length} pass`,
  );
  md.push(
    `- Edge (${EDGE_PERSONAS.length}): ${results.edge.length - edgeFails.length}/${EDGE_PERSONAS.length} pass`,
  );
  md.push(
    `- Paradox (${PARADOX_PERSONAS.length}): ${results.paradox.length - paradoxFails.length}/${PARADOX_PERSONAS.length} signal low-margin tension (margin ≤ ${PARADOX_MAX_MARGIN})`,
  );
  md.push('');

  function renderSection(title, items, kind) {
    md.push(`## ${title}`);
    md.push('');
    for (const r of items) {
      const status = r.pass ? '✓ pass' : '✗ FAIL';
      md.push(`### ${status} — ${r.persona.name}`);
      md.push('');
      md.push(`> ${r.persona.description}`);
      md.push('');
      md.push(
        `Classified: **${r.classification.top.name}** (sim ${r.classification.top.sim.toFixed(3)})`,
      );
      md.push(
        `Runner-up: ${r.classification.runnerUp.name} (sim ${r.classification.runnerUp.sim.toFixed(3)})`,
      );
      md.push(`Margin: ${r.classification.margin.toFixed(4)}`);
      if (kind === 'paradox') {
        md.push(
          `Expected: low margin (≤ ${PARADOX_MAX_MARGIN}) to signal tension. ${r.pass ? '✓ tension detected' : '✗ classified too confidently — model thinks this is a single-archetype stance when the persona is intentionally hybrid'}`,
        );
      } else {
        md.push(`Expected one of: ${r.persona.expected.join(', ')}.`);
      }
      md.push('');
    }
  }

  renderSection('Canonical personas', results.canonical, 'canonical');
  renderSection('Edge personas', results.edge, 'edge');
  renderSection('Paradox personas', results.paradox, 'paradox');

  await writeFile(join(REPO, 'scripts/persona-test-report.md'), md.join('\n'));

  // ─── Stdout summary ─────────────────────────────────────────────
  console.log(`\nPersona test results:`);
  console.log(
    `  Canonical: ${CANONICAL_PERSONAS.length - canonicalFails.length}/${CANONICAL_PERSONAS.length}`,
  );
  console.log(`  Edge:      ${EDGE_PERSONAS.length - edgeFails.length}/${EDGE_PERSONAS.length}`);
  console.log(
    `  Paradox:   ${PARADOX_PERSONAS.length - paradoxFails.length}/${PARADOX_PERSONAS.length} (signal tension)`,
  );
  console.log(`Report: scripts/persona-test-report.md`);

  if (!QUIET) {
    if (canonicalFails.length) {
      console.log(`\n✗ Canonical failures:`);
      for (const f of canonicalFails) {
        console.log(
          `  ${f.persona.name}: classified as ${f.classification.top.name}, expected ${f.persona.expected.join('/')}`,
        );
      }
    }
    if (edgeFails.length) {
      console.log(`\n✗ Edge failures:`);
      for (const f of edgeFails) {
        console.log(
          `  ${f.persona.name}: classified as ${f.classification.top.name}, expected ${f.persona.expected.join('/')}`,
        );
      }
    }
    if (paradoxFails.length) {
      console.log(`\n✗ Paradox failures (over-confident classification):`);
      for (const f of paradoxFails) {
        console.log(
          `  ${f.persona.name}: classified as ${f.classification.top.name} with margin ${f.classification.margin.toFixed(4)} (expected ≤ ${PARADOX_MAX_MARGIN})`,
        );
      }
    }
  }

  // Exit non-zero on canonical or edge failure; paradox is informational.
  process.exit(canonicalFails.length + edgeFails.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
