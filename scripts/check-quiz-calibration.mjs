#!/usr/bin/env node
// scripts/check-quiz-calibration.mjs
//
// Quiz answer-vector calibration audit.
//
// For each question in the quick + detailed quizzes, this script asks:
//   1. Are the answer vectors spread out enough to actually distinguish
//      users? (If two answers produce nearly identical 16-D deltas,
//      picking between them changes nothing — wasted question.)
//   2. Does any answer dominate the vector budget? (If one answer
//      sums to twice what the others do, it's philosophically "free"
//      and unbalances the result.)
//   3. Does the question span the dimensions it claims to? (If a
//      question's answers all touch only TR and TE, it's pulling
//      duplicate signal — five questions like this and the user's
//      placement collapses onto those two axes.)
//
// This is the "answer-vector deltas cluster suspiciously" check
// flagged in NEXT.md §Content calibration. Companion to
// scripts/check-philosopher-calibration.mjs, which audits the
// 552-philosopher corpus's vectors. The two scripts share no code
// because they ask different questions.
//
// Output goes to scripts/quiz-calibration-report.md so it can be
// checked in alongside the philosopher report and reviewed in PRs.
//
// Usage:
//   node scripts/check-quiz-calibration.mjs        # writes report
//   node scripts/check-quiz-calibration.mjs --quiet # only summary
//
// Exit code: 0. The script is informational, not a CI gate (yet).

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(__filename), '..');
const OUT = resolve(ROOT, 'scripts/quiz-calibration-report.md');

const QUIET = process.argv.includes('--quiet');

// ─── 16-D model ─────────────────────────────────────────────────────

const DIM_KEYS = ['TV', 'VA', 'WP', 'TR', 'TE', 'RT', 'MR', 'SR', 'CE', 'SS', 'PO', 'TD', 'AT', 'ES', 'UI', 'SI'];

function vectorFromShortHand(obj) {
  const v = new Array(DIM_KEYS.length).fill(0);
  for (const [k, val] of Object.entries(obj)) {
    const idx = DIM_KEYS.indexOf(k);
    if (idx >= 0) v[idx] = val;
  }
  return v;
}

function magnitude(v) {
  return Math.sqrt(v.reduce((s, x) => s + x * x, 0));
}

function cosineSim(a, b) {
  const ma = magnitude(a);
  const mb = magnitude(b);
  if (ma === 0 || mb === 0) return 0;
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return dot / (ma * mb);
}

function dimensionsTouched(v) {
  return v.reduce((n, x) => n + (x !== 0 ? 1 : 0), 0);
}

// ─── Parse quiz files ───────────────────────────────────────────────
//
// Each file exports a QUESTIONS-shaped array of `{ p, a:[{t,v},...] }`.
// We extract by walking question-by-question, then per-answer pulling
// the `v({...})` shorthand argument into an object literal.

function parseQuiz(filename, exportName) {
  const src = readFileSync(resolve(ROOT, filename), 'utf8');
  // Find the start of the export array.
  const startMatch = src.match(new RegExp(`export const ${exportName}[^=]*=\\s*\\[`));
  if (!startMatch) throw new Error(`Could not locate ${exportName} in ${filename}`);
  const body = src.slice(startMatch.index + startMatch[0].length);

  const questions = [];
  // Iterate by `{ p: "..."` openings. Each question runs from its
  // opening `{` to the next `}]},` (closing answer-array + question).
  // Walk character-by-character respecting brace depth to avoid being
  // fooled by braces inside strings / nested object literals in `v({...})`.
  let i = 0;
  while (i < body.length) {
    // Skip to next `{`.
    while (i < body.length && body[i] !== '{') i++;
    if (i >= body.length) break;
    const start = i;
    let depth = 0;
    let inStr = null;
    let escape = false;
    while (i < body.length) {
      const ch = body[i];
      if (escape) { escape = false; i++; continue; }
      if (inStr) {
        if (ch === '\\') escape = true;
        else if (ch === inStr) inStr = null;
        i++;
        continue;
      }
      if (ch === '"' || ch === "'" || ch === '`') { inStr = ch; i++; continue; }
      if (ch === '{') depth++;
      else if (ch === '}') {
        depth--;
        if (depth === 0) { i++; break; }
      }
      i++;
    }
    const block = body.slice(start, i);

    // Parse the prompt — first `p:"..."` or `p: "..."`.
    const pMatch = block.match(/p:\s*"((?:[^"\\]|\\.)*)"/);
    if (!pMatch) continue;
    const prompt = pMatch[1].replace(/\\"/g, '"');

    // Parse each answer — `{ t: "...", v: v({...}) }`. Multiple per
    // question.
    const answers = [];
    const ansRe = /\{\s*t:\s*"((?:[^"\\]|\\.)*)"\s*,\s*v:\s*v\(\{([^}]*)\}\)\s*\}/g;
    let am;
    while ((am = ansRe.exec(block))) {
      const text = am[1];
      const shorthand = am[2];
      // Parse "TR:3,WP:2" shorthand.
      const obj = {};
      for (const part of shorthand.split(',')) {
        const [k, val] = part.split(':').map(s => s.trim());
        if (k && val) obj[k] = Number(val);
      }
      answers.push({ text, vector: vectorFromShortHand(obj), shorthand });
    }
    if (answers.length === 0) continue;

    questions.push({ prompt, answers });
  }

  return questions;
}

// ─── Analysis ───────────────────────────────────────────────────────

const CLUSTER_THRESHOLD = 0.90; // cosine similarity above this = answers indistinguishable
const DOMINANCE_RATIO = 1.8;    // strongest answer / average = bigger than this is unbalanced
const NARROW_DIM_COUNT = 3;     // a question touching fewer than this many dims is single-axis

function analyseQuiz(quizName, questions) {
  const issues = [];
  const stats = {
    name: quizName,
    questionCount: questions.length,
    avgAnswers: questions.reduce((s, q) => s + q.answers.length, 0) / questions.length,
    clusterIssues: 0,
    dominanceIssues: 0,
    narrowIssues: 0,
  };

  questions.forEach((q, qi) => {
    const qIssues = [];

    // 1. Clustered answers — pairs with cosine sim > CLUSTER_THRESHOLD.
    for (let i = 0; i < q.answers.length; i++) {
      for (let j = i + 1; j < q.answers.length; j++) {
        const sim = cosineSim(q.answers[i].vector, q.answers[j].vector);
        if (sim >= CLUSTER_THRESHOLD) {
          qIssues.push({
            type: 'cluster',
            severity: sim >= 0.97 ? 'high' : 'med',
            detail: `Answer ${i + 1} ↔ ${j + 1}: cosine sim ${sim.toFixed(3)} (${q.answers[i].shorthand || '—'} vs ${q.answers[j].shorthand || '—'})`,
          });
          stats.clusterIssues++;
        }
      }
    }

    // 2. Dominance — one answer's magnitude is much larger than the others.
    const mags = q.answers.map(a => magnitude(a.vector));
    const maxMag = Math.max(...mags);
    const avgMag = mags.reduce((s, x) => s + x, 0) / mags.length;
    if (avgMag > 0 && maxMag / avgMag > DOMINANCE_RATIO) {
      const dominantIdx = mags.indexOf(maxMag);
      qIssues.push({
        type: 'dominance',
        severity: maxMag / avgMag > 2.5 ? 'high' : 'med',
        detail: `Answer ${dominantIdx + 1} carries ${(maxMag / avgMag).toFixed(2)}× the average vector weight (mag ${maxMag.toFixed(1)} vs avg ${avgMag.toFixed(1)})`,
      });
      stats.dominanceIssues++;
    }

    // 3. Narrow dimensional span — the union of dimensions touched
    //    across all answers is fewer than NARROW_DIM_COUNT.
    const unionDims = new Set();
    for (const a of q.answers) {
      for (let k = 0; k < a.vector.length; k++) {
        if (a.vector[k] !== 0) unionDims.add(DIM_KEYS[k]);
      }
    }
    if (unionDims.size < NARROW_DIM_COUNT) {
      qIssues.push({
        type: 'narrow',
        severity: 'med',
        detail: `Only touches ${unionDims.size} dimension(s): {${[...unionDims].join(', ')}}. Adds limited information to placement.`,
      });
      stats.narrowIssues++;
    }

    if (qIssues.length > 0) {
      issues.push({ index: qi + 1, prompt: q.prompt, qIssues, dimensionsTouched: [...unionDims] });
    }
  });

  return { stats, issues };
}

// ─── Per-dimension answer coverage ──────────────────────────────────
//
// Across all questions in a quiz, how many times does each dimension
// get touched? If TR is touched in 18 of 20 questions and SI is touched
// in 1, the model is over-indexing on reason at the expense of
// self-identity.

function dimensionCoverage(questions) {
  const counts = Object.fromEntries(DIM_KEYS.map(k => [k, 0]));
  for (const q of questions) {
    const touched = new Set();
    for (const a of q.answers) {
      for (let k = 0; k < a.vector.length; k++) {
        if (a.vector[k] !== 0) touched.add(DIM_KEYS[k]);
      }
    }
    for (const t of touched) counts[t]++;
  }
  return counts;
}

// ─── Run ────────────────────────────────────────────────────────────

const quickQuestions = parseQuiz('lib/quiz-questions.ts', 'QUICK_QUESTIONS');
const detailedQuestions = parseQuiz('lib/quiz-questions-detailed.ts', 'DETAILED_QUESTIONS');

const quickResult = analyseQuiz('Quick (20-question)', quickQuestions);
const detailedResult = analyseQuiz('Detailed (50-question)', detailedQuestions);
const quickCoverage = dimensionCoverage(quickQuestions);
const detailedCoverage = dimensionCoverage(detailedQuestions);

// ─── Report ─────────────────────────────────────────────────────────

function renderReport() {
  const lines = [];
  lines.push('# Quiz calibration report');
  lines.push('');
  lines.push(`Generated: ${new Date().toISOString()}.`);
  lines.push('');
  lines.push('This report flags quiz questions whose answers either cluster (so picking between them changes nothing in the user\'s placement), dominate (one answer carries disproportionate vector weight), or span too narrow a slice of the 16-D model (touching ≤2 dimensions adds limited information).');
  lines.push('');
  lines.push('Thresholds:');
  lines.push(`- **Cluster:** cosine similarity between two answer vectors ≥ ${CLUSTER_THRESHOLD}`);
  lines.push(`- **Dominance:** one answer\'s magnitude > ${DOMINANCE_RATIO}× the average across the question`);
  lines.push(`- **Narrow:** union of dimensions touched < ${NARROW_DIM_COUNT}`);
  lines.push('');
  lines.push('A question can trip more than one. None of these are necessarily bugs — sometimes a question is *supposed* to be a single-axis probe, or a dominant answer reflects a genuinely sharper position. Review each flagged entry and decide.');
  lines.push('');

  for (const result of [quickResult, detailedResult]) {
    lines.push(`## ${result.stats.name}`);
    lines.push('');
    lines.push(`- Questions: ${result.stats.questionCount}`);
    lines.push(`- Average answers per question: ${result.stats.avgAnswers.toFixed(2)}`);
    lines.push(`- Questions with cluster issues: ${result.stats.clusterIssues}`);
    lines.push(`- Questions with dominance issues: ${result.stats.dominanceIssues}`);
    lines.push(`- Questions with narrow-span issues: ${result.stats.narrowIssues}`);
    lines.push('');

    if (result.issues.length === 0) {
      lines.push('*No flagged questions — every answer is distinguishable, balanced, and dimensionally broad enough.*');
      lines.push('');
    } else {
      lines.push(`### Flagged questions (${result.issues.length} / ${result.stats.questionCount})`);
      lines.push('');
      for (const issue of result.issues) {
        lines.push(`**Q${issue.index}.** ${issue.prompt}`);
        lines.push('');
        for (const iss of issue.qIssues) {
          lines.push(`- *${iss.type}* (${iss.severity}): ${iss.detail}`);
        }
        lines.push('');
      }
    }
  }

  lines.push('## Per-dimension coverage');
  lines.push('');
  lines.push('How many questions touch each dimension at least once. If a dimension is touched in ≤2 questions of the 20-question quiz (≤5 in the detailed), that dimension is under-probed and the user\'s score on it is noisy.');
  lines.push('');
  lines.push('| Dim | Quick (of 20) | Detailed (of 50) |');
  lines.push('|---|---|---|');
  for (const dim of DIM_KEYS) {
    lines.push(`| ${dim} | ${quickCoverage[dim]} | ${detailedCoverage[dim]} |`);
  }
  lines.push('');

  return lines.join('\n');
}

const report = renderReport();
writeFileSync(OUT, report);

if (!QUIET) {
  console.log(report);
} else {
  console.log(`Wrote ${OUT}`);
  console.log(`Quick:    ${quickResult.stats.questionCount}q, ${quickResult.issues.length} flagged`);
  console.log(`Detailed: ${detailedResult.stats.questionCount}q, ${detailedResult.issues.length} flagged`);
}
