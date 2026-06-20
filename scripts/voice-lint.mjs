#!/usr/bin/env node
// scripts/voice-lint.mjs
//
// Voice consistency check across long-form content.
// Reads:
//   - lib/topics.ts     (32 topic essays + summaries)
//   - lib/exercises.ts  (36 exercises: about, steps, reflection)
//   - lib/vs-pairs.ts   (CURATED_VS_PAIRS — short pair labels; the
//                        long-form prose for /vs pages is template-
//                        generated, but we check the disagreement /
//                        agreement phrasings too)
//   - lib/philosopher-bios.ts (22 long-form bios)
//
// Flags violations of STYLE-GUIDE.md §9 voice rules. Three severities:
//   - error:   patterns we always reject (gpt-3-isms, Latin without
//              translation, "Welcome back!"-style warmth)
//   - warn:    patterns that often need rewriting but sometimes have
//              legitimate uses (long sentences, em-dash flurries)
//   - info:    surface-level statistics (sentence count, avg length,
//              em-dash density) per entry for spot-checks
//
// Exit code: 0 if no errors. Warnings + info do not fail the lint;
// the script is a guidance tool, not a CI gate. Run on demand:
//
//   node scripts/voice-lint.mjs               # full report
//   node scripts/voice-lint.mjs --errors-only # just the blockers

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(__filename), '..');

const ERRORS_ONLY = process.argv.includes('--errors-only');

// ─── Loader: pull every prose string out of each lib file ────────────
//
// We do NOT import the TS files — that would require a compile step.
// Each lib has a regular shape we can extract with regex; the source
// is generated/curated and matches the shape reliably.

function extractTopics() {
  const src = readFileSync(resolve(ROOT, 'lib/topics.ts'), 'utf8');
  // Each topic has { slug, title, summary, essay, ... }. The essay
  // uses a backticked template literal. Summary is a normal string.
  const entries = [];
  // Walk topic objects by their slug field.
  const slugRe =
    /slug:\s*'([^']+)',\s*title:\s*'([^']*(?:\\'[^']*)*)',\s*summary:\s*'((?:[^'\\]|\\.)*)',\s*essay:\s*`((?:[^`\\]|\\.)*)`/g;
  let m;
  while ((m = slugRe.exec(src))) {
    entries.push({
      file: 'lib/topics.ts',
      kind: 'topic',
      slug: m[1],
      fields: {
        title: m[2],
        summary: m[3].replace(/\\'/g, "'"),
        essay: m[4].replace(/\\`/g, '`'),
      },
    });
  }
  return entries;
}

function extractExercises() {
  const src = readFileSync(resolve(ROOT, 'lib/exercises.ts'), 'utf8');
  const entries = [];
  // Exercises mix single-quoted, double-quoted, and string-concatenated
  // values (e.g. `about: "..." + "..."`). Walk slug-by-slug, then
  // extract each field independently within that entry's text range.
  //
  // We carve each entry from `{ slug: '...'` to the closing `},` that
  // appears at the same indent level as the opening `{`. The lib is
  // generated/curated and never has objects-within-objects in the
  // exercise records, so a non-greedy match up to `\n  },` is safe.
  const blockRe = /\{\s*slug:\s*'([^']+)'[\s\S]*?\n  \},/g;
  let m;
  while ((m = blockRe.exec(src))) {
    const block = m[0];
    const slug = m[1];

    // Extract concatenation-friendly fields. Match a key, then
    // greedily collect all consecutive single- or double-quoted
    // string literals joined by `+` until the next field begins.
    const grabStringField = (key) => {
      const re = new RegExp(
        `${key}:\\s*((?:(?:'[^']*'|"[^"]*"|\`(?:[^\`\\\\]|\\\\.)*\`)\\s*\\+?\\s*)+)`,
        'm',
      );
      const fm = block.match(re);
      if (!fm) return '';
      const concat = fm[1];
      // Pull out each quoted-string segment.
      return Array.from(
        concat.matchAll(/(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"|`((?:[^`\\]|\\.)*)`)/g),
      )
        .map((s) =>
          (s[1] ?? s[2] ?? s[3] ?? '')
            .replace(/\\'/g, "'")
            .replace(/\\"/g, '"')
            .replace(/\\`/g, '`'),
        )
        .join('');
    };

    // Steps is an array — pull each item.
    let steps = '';
    const stepsMatch = block.match(/steps:\s*\[([\s\S]*?)\],/);
    if (stepsMatch) {
      const stepsBlock = stepsMatch[1];
      const items = Array.from(
        stepsBlock.matchAll(/(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)")/g),
      ).map((s) => (s[1] ?? s[2] ?? '').replace(/\\'/g, "'").replace(/\\"/g, '"'));
      steps = items.join('\n');
    }

    entries.push({
      file: 'lib/exercises.ts',
      kind: 'exercise',
      slug,
      fields: {
        name: grabStringField('name'),
        summary: grabStringField('summary'),
        about: grabStringField('about'),
        steps,
        reflection: grabStringField('reflection'),
      },
    });
  }
  return entries;
}

function extractPhilosopherBios() {
  const src = readFileSync(resolve(ROOT, 'lib/philosopher-bios.ts'), 'utf8');
  const entries = [];
  // PHILOSOPHER_BIOS is a Record<string, string> with backticked values.
  const re = /(?:^|\n)\s*['"]?([\w-]+)['"]?:\s*`((?:[^`\\]|\\.)*)`/g;
  let m;
  while ((m = re.exec(src))) {
    entries.push({
      file: 'lib/philosopher-bios.ts',
      kind: 'bio',
      slug: m[1],
      fields: { bio: m[2].replace(/\\`/g, '`') },
    });
  }
  return entries;
}

// ─── Rules ──────────────────────────────────────────────────────────

const RULES = [
  // ── errors (always reject) ───────────────────────────────────────
  {
    id: 'gpt-warmth',
    severity: 'error',
    description:
      'Performative warmth — STYLE-GUIDE §9 explicitly forbids "Welcome back!"-style copy.',
    test: (text) =>
      /\b(welcome back|hi there|hey there!|hope you're (doing )?well|hope this finds you well|so glad you're here|let's dive in|you've got this|amazing job|incredible work)\b/i.test(
        text,
      ),
  },
  {
    id: 'ai-marketing',
    severity: 'error',
    description:
      'AI marketing-speak. "Powered by AI", "AI-powered", "leverage", "synergize" — STYLE-GUIDE §9 names cost honestly, not vaguely.',
    test: (text) =>
      /\b(powered by ai|ai-powered|ai-driven|cutting-edge|game-changing|revolutionize|disrupt|leverage|synergize|unleash|unlock your potential|next-generation|state-of-the-art|paradigm shift|deep dive)\b/i.test(
        text,
      ),
  },
  {
    id: 'latin-untranslated',
    severity: 'error',
    description:
      'Latin or specialised jargon used without translation. STYLE-GUIDE §9 bans "qua" and similar.',
    // Look for academic Latin words NOT immediately followed by a translation in parens/em-dash.
    test: (text) => {
      // "qua" is the canonical offender. Others: "ipso facto", "ad hominem"
      // (acceptable when defined), "a fortiori".
      const offenders = [
        /\bqua\b(?!\s*[—(])/i,
        /\bipso facto\b(?!\s*[—(])/i,
        /\ba fortiori\b(?!\s*[—(])/i,
        /\bmutatis mutandis\b(?!\s*[—(])/i,
        /\bsui generis\b(?!\s*[—(])/i,
      ];
      return offenders.some((re) => re.test(text));
    },
  },
  {
    id: 'therapy-speak',
    severity: 'error',
    description: 'Warm-bath therapeutic register. STYLE-GUIDE §9: Mull is not therapy.',
    test: (text) =>
      /\b(you are (so |such )?(brave|amazing|incredible|wonderful|beautiful)|self-care|trigger warning|safe space|healing journey|own your truth|honour your feelings)\b/i.test(
        text,
      ),
  },
  // ── warnings (often a problem, sometimes legit) ──────────────────
  {
    id: 'long-sentence',
    severity: 'warn',
    description: 'Sentence over 40 words. STYLE-GUIDE §9: sentences short to medium.',
    test: (text) => {
      // Split on sentence-ending punctuation. Conservative — we miss some
      // edge cases (Dr., U.S., quoted dialogue) but that's fine for a guidance check.
      // Split on sentence-ending punctuation, optionally followed by a
      // closing quote (so `happy."` ends a sentence the way `happy.` does).
      const sentences = text.split(/(?<=[.!?]['"]?)\s+/);
      return sentences.some((s) => s.split(/\s+/).filter(Boolean).length > 40);
    },
    findInstance: (text) => {
      // Split on sentence-ending punctuation, optionally followed by a
      // closing quote (so `happy."` ends a sentence the way `happy.` does).
      const sentences = text.split(/(?<=[.!?]['"]?)\s+/);
      const longest = sentences.reduce(
        (max, s) => {
          const len = s.split(/\s+/).filter(Boolean).length;
          return len > max.len ? { text: s, len } : max;
        },
        { text: '', len: 0 },
      );
      return longest.len > 40 ? `${longest.len} words: "${longest.text.slice(0, 100)}..."` : null;
    },
  },
  {
    id: 'em-dash-flurry',
    severity: 'warn',
    description:
      'More than 4 em-dashes in one paragraph. STYLE-GUIDE §9: em-dashes used sparingly.',
    test: (text) => {
      const paragraphs = text.split(/\n\n+/);
      return paragraphs.some((p) => (p.match(/—/g) || []).length > 4);
    },
  },
  {
    id: 'semicolon-flurry',
    severity: 'warn',
    description:
      'More than 3 semicolons in one paragraph. STYLE-GUIDE §9: semicolons used sparingly.',
    test: (text) => {
      const paragraphs = text.split(/\n\n+/);
      return paragraphs.some((p) => (p.match(/;/g) || []).length > 3);
    },
  },
  {
    id: 'apologetic',
    severity: 'warn',
    description: "Apologetic phrasing. STYLE-GUIDE §9: Mull doesn't apologise for itself.",
    test: (text) =>
      /\b(we apologi[sz]e|we're sorry|sorry for|please be patient|please bear with us|we hope you'll|hopefully this|we'll try to)\b/i.test(
        text,
      ),
  },
  {
    id: 'cliche',
    severity: 'warn',
    description: 'Tired cliché. Specific to common essay-prose offenders.',
    test: (text) =>
      /\b(at the end of the day|when all is said and done|that being said|with that said|needless to say|it goes without saying|in this day and age|food for thought|the bottom line is|the long and short of it)\b/i.test(
        text,
      ),
  },
];

// ─── Linter ─────────────────────────────────────────────────────────

function lintEntry(entry) {
  const findings = [];
  for (const [fieldName, fieldText] of Object.entries(entry.fields)) {
    if (typeof fieldText !== 'string' || !fieldText) continue;
    for (const rule of RULES) {
      if (rule.test(fieldText)) {
        const instance = rule.findInstance ? rule.findInstance(fieldText) : null;
        findings.push({
          rule: rule.id,
          severity: rule.severity,
          field: fieldName,
          description: rule.description,
          instance,
        });
      }
    }
  }
  return findings;
}

// ─── Main ───────────────────────────────────────────────────────────

const entries = [...extractTopics(), ...extractExercises(), ...extractPhilosopherBios()];

console.log(`\nLoaded ${entries.length} entries:`);
const byKind = entries.reduce((acc, e) => {
  acc[e.kind] = (acc[e.kind] || 0) + 1;
  return acc;
}, {});
for (const [k, n] of Object.entries(byKind)) console.log(`  ${k.padEnd(10)} ${n}`);

const allFindings = [];
for (const entry of entries) {
  const findings = lintEntry(entry);
  if (findings.length === 0) continue;
  for (const f of findings) allFindings.push({ ...f, entry });
}

const errors = allFindings.filter((f) => f.severity === 'error');
const warnings = allFindings.filter((f) => f.severity === 'warn');

console.log(`\nFindings: ${errors.length} error(s), ${warnings.length} warning(s).\n`);

function fmt(findings, label) {
  if (findings.length === 0) {
    console.log(`No ${label}s.\n`);
    return;
  }
  console.log(`── ${label.toUpperCase()}S ──`);
  // Group by rule for skimmability.
  const byRule = new Map();
  for (const f of findings) {
    const arr = byRule.get(f.rule) ?? [];
    arr.push(f);
    byRule.set(f.rule, arr);
  }
  for (const [rule, items] of byRule) {
    console.log(`\n[${rule}] ${items[0].description}`);
    for (const f of items) {
      console.log(`  ${f.entry.kind}/${f.entry.slug} · ${f.field}`);
      if (f.instance) console.log(`    ${f.instance}`);
    }
  }
  console.log('');
}

fmt(errors, 'error');
if (!ERRORS_ONLY) fmt(warnings, 'warning');

// Exit non-zero if errors. The script is informational by default
// but CI-friendly: `node scripts/voice-lint.mjs --errors-only && echo ok`.
process.exit(errors.length > 0 ? 1 : 0);
