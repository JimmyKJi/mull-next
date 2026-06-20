#!/usr/bin/env node
// Comment-preserving, prefix-SCOPED batch translator for lib/translations.ts.
//
// Why this exists (vs scripts/translate-i18n.js):
//   The original translate-i18n.js re-serializes the WHOLE TRANSLATIONS
//   object on write-back (regenFile). That (a) strips every interior
//   section-divider comment, and (b) reformats/reorders every line. This
//   script instead does SURGICAL, per-key, in-place replacement: it only
//   touches the `{ ... }` of the keys it actually fills, re-emitting them
//   in canonical locale order (en, es, fr, pt, ru, zh, ja, ko). Comments,
//   formatting, key order, and every non-target key are preserved byte-
//   for-byte.
//
// Usage:
//   node scripts/translate-i18n-scoped.js --prefix wndr,pilgrimage,res --dry-run
//   node scripts/translate-i18n-scoped.js --prefix wndr,pilgrimage,res
//   node scripts/translate-i18n-scoped.js --prefix res --locale fr
//   node scripts/translate-i18n-scoped.js --prefix res --force   # overwrite
//
// --dry-run does NO network calls. It reports exactly which keys x locales
// WOULD be translated, and runs a self-check: it re-serializes every target
// key with its EXISTING locale data only (no new values) and asserts the
// output is byte-identical to the input — proving the writer never disturbs
// comments or untouched content.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TRANSLATIONS_FILE = path.join(ROOT, 'lib', 'translations.ts');
const ENV_FILE = path.join(ROOT, '.env.local');

const CANONICAL_ORDER = ['en', 'es', 'fr', 'pt', 'ru', 'zh', 'ja', 'ko'];
const TRANSLATABLE = ['es', 'fr', 'pt', 'ru', 'zh', 'ja', 'ko'];

const LOCALE_FOR_PROMPT = {
  es: 'Spanish (European Spanish, natural register)',
  fr: 'French (natural conversational French, tu form for second person)',
  pt: 'Brazilian Portuguese (natural register)',
  ru: 'Russian (natural register)',
  zh: 'Simplified Chinese (Mandarin, natural register)',
  ja: 'Japanese (natural register, polite-but-conversational)',
  ko: 'Korean (natural register)',
};

// ── args ──────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
function argVal(name) {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : null;
}
const dryRun = args.includes('--dry-run');
const force = args.includes('--force');
const onlyLocale = argVal('--locale');
const prefixArg = argVal('--prefix');
if (!prefixArg) {
  console.error(
    'Required: --prefix a,b,c  (comma-separated key prefixes, e.g. wndr,pilgrimage,res)',
  );
  process.exit(1);
}
const PREFIXES = prefixArg
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const LOCALES = onlyLocale ? [onlyLocale] : TRANSLATABLE;

// ── env ───────────────────────────────────────────────────────────────
function loadEnv() {
  const raw = fs.readFileSync(ENV_FILE, 'utf8');
  const env = {};
  for (const line of raw.split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) env[m[1]] = m[2].replace(/^"(.*)"$/, '$1');
  }
  return env;
}
let API_KEY = null;
if (!dryRun) {
  API_KEY = loadEnv().ANTHROPIC_API_KEY;
  if (!API_KEY) {
    console.error('ANTHROPIC_API_KEY missing from .env.local');
    process.exit(1);
  }
}

// Walk from an opening-brace index to its matching close. String-aware
// AND comment-aware: skips '…' "…" `…` strings and // and /* */ comments,
// so an apostrophe inside a // comment (e.g. "don't") can't be mistaken
// for a string open. (The original translate-i18n.js lacks this and
// currently fails to parse the file for exactly that reason.)
function findCloseBrace(src, openIdx) {
  let depth = 0,
    inStr = null,
    escape = false;
  for (let i = openIdx; i < src.length; i++) {
    const ch = src[i],
      next = src[i + 1];
    if (inStr) {
      if (escape) {
        escape = false;
        continue;
      }
      if (ch === '\\') {
        escape = true;
        continue;
      }
      if (ch === inStr) inStr = null;
      continue;
    }
    if (ch === '/' && next === '/') {
      const nl = src.indexOf('\n', i);
      if (nl < 0) return -1;
      i = nl;
      continue;
    }
    if (ch === '/' && next === '*') {
      const c = src.indexOf('*/', i + 2);
      if (c < 0) return -1;
      i = c + 1;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') {
      inStr = ch;
      continue;
    }
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

// ── locate the TRANSLATIONS object span ───────────────────────────────
function objectSpan(src) {
  const m = src.match(/export const TRANSLATIONS: TranslationMap = \{/);
  if (!m) throw new Error('Could not find TRANSLATIONS export');
  const startIdx = m.index + m[0].length - 1; // the opening {
  const endIdx = findCloseBrace(src, startIdx);
  if (endIdx < 0) throw new Error('Could not find end of TRANSLATIONS object');
  return { startIdx, endIdx };
}

// Find every top-level `"key": { ... }` entry within the object span.
// Returns { key, valStart (index of '{'), valEnd (index of '}'), map }.
function findEntries(src) {
  const { startIdx, endIdx } = objectSpan(src);
  const entries = [];
  // Match a key at the start of a line followed by ': {'
  const re = /(^|\n)([ \t]*)"((?:[^"\\]|\\.)*)"\s*:\s*\{/g;
  re.lastIndex = startIdx;
  let m;
  while ((m = re.exec(src)) !== null) {
    const braceIdx = m.index + m[0].length - 1; // the '{'
    if (braceIdx >= endIdx) break;
    const close = findCloseBrace(src, braceIdx);
    if (close < 0 || close > endIdx) continue;
    const key = JSON.parse('"' + m[3] + '"');
    const objText = src.slice(braceIdx, close + 1);
    let map;
    try {
      map = new Function('return ' + objText)();
    } catch {
      re.lastIndex = close + 1;
      continue;
    }
    entries.push({ key, valStart: braceIdx, valEnd: close, map });
    re.lastIndex = close + 1;
  }
  return entries;
}

// Serialize a locale map to `{ en: "..", es: ".." }` in canonical order.
function serializeMap(map) {
  const ordered = [];
  for (const loc of CANONICAL_ORDER) if (loc in map) ordered.push([loc, map[loc]]);
  for (const loc of Object.keys(map))
    if (!CANONICAL_ORDER.includes(loc)) ordered.push([loc, map[loc]]);
  const inner = ordered.map(([loc, v]) => `${loc}: ${JSON.stringify(v)}`).join(', ');
  return `{ ${inner} }`;
}

// Apply { valStart, valEnd, newText } replacements (descending order).
function applyReplacements(src, repls) {
  repls.sort((a, b) => b.valStart - a.valStart);
  let out = src;
  for (const r of repls) out = out.slice(0, r.valStart) + r.newText + out.slice(r.valEnd + 1);
  return out;
}

// ── API ───────────────────────────────────────────────────────────────
async function translateBatch(locale, batch) {
  const localeDesc = LOCALE_FOR_PROMPT[locale];
  const system = `You are a professional translator for Mull, a philosophy-mapping web app. Translate UI strings from English into ${localeDesc}.

Rules:
- Preserve ANY placeholder wrapped in single curly braces verbatim and in place: e.g. {n}, {count}, {topic}, {handle}, {email}, {when}, {phil}, {year}, {picks}, {kbd_cmd}, {kbd_enter}, {em_simulated}, {em_you}, {em_map}, {code}. Never translate or reorder the contents of {...}.
- Preserve emoji, arrows, and symbols verbatim: ✓, ←, →, ↗, ✺, ⌘, ↵, 🔥, ▶, ·.
- Match the tone: contemplative, plain modern language, warm but not cute. Match the register of literary translations (think Penguin Classics) rather than corporate UI.
- Names of philosophical schools or technical terms (categorical imperative, śūnyatā, ataraxia, eudaimonia, etc.) should use the established translation in the target language if one exists.
- Keep lengths reasonably similar; avoid making text dramatically longer than the source.
- Return STRICT JSON only — an object mapping each key to its translation. No prose, no markdown fences. Start with { and end with }.`;
  const user = `Translate each value into ${localeDesc}. Return ONLY a JSON object with the same keys, mapping each to the translated string.

${JSON.stringify(batch, null, 2)}`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 8000,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const text = (data.content || [])
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('')
    .trim();
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '');
  const start = cleaned.indexOf('{'),
    end = cleaned.lastIndexOf('}');
  if (start < 0 || end < 0) throw new Error('No JSON in response: ' + text.slice(0, 400));
  const slice = cleaned.slice(start, end + 1);
  try {
    return JSON.parse(slice);
  } catch (e) {
    const recovered = {};
    const re = /"((?:[^"\\]|\\.)*)"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
    let mm;
    while ((mm = re.exec(slice)) !== null) {
      try {
        recovered[JSON.parse('"' + mm[1] + '"')] = JSON.parse('"' + mm[2] + '"');
      } catch {}
    }
    if (Object.keys(recovered).length) {
      console.warn(`\n      recovered ${Object.keys(recovered).length} entries by regex`);
      return recovered;
    }
    throw new Error('JSON parse failed: ' + e.message + '\n' + slice.slice(0, 1200));
  }
}
function chunk(obj, n) {
  const e = Object.entries(obj),
    out = [];
  for (let i = 0; i < e.length; i += n) out.push(Object.fromEntries(e.slice(i, i + n)));
  return out;
}

// ── main ──────────────────────────────────────────────────────────────
(async () => {
  let src = fs.readFileSync(TRANSLATIONS_FILE, 'utf8');
  const all = findEntries(src);
  const targets = all.filter((e) => PREFIXES.some((p) => e.key === p || e.key.startsWith(p + '.')));
  console.log(
    `Scope: prefixes [${PREFIXES.join(', ')}] -> ${targets.length} keys (of ${all.length} total).`,
  );

  // Pending work per locale.
  const pendingByLocale = {};
  for (const loc of LOCALES) {
    const pending = {};
    for (const e of targets) {
      if (!e.map.en) continue;
      if (!force && e.map[loc]) continue;
      pending[e.key] = e.map.en;
    }
    pendingByLocale[loc] = pending;
  }

  if (dryRun) {
    console.log('\n--- DRY RUN (no network) ---');
    let total = 0;
    for (const loc of LOCALES) {
      const n = Object.keys(pendingByLocale[loc]).length;
      total += n;
      console.log(`  ${loc}: ${n} strings to translate`);
    }
    console.log(`  TOTAL: ${total} strings across ${LOCALES.length} locales`);
    // Writer safety self-check: re-emit every target with EXISTING data only.
    const noop = applyReplacements(
      src,
      targets.map((e) => ({
        valStart: e.valStart,
        valEnd: e.valEnd,
        newText: serializeMap(e.map),
      })),
    );
    if (noop === src) {
      console.log(
        '  ✓ writer self-check PASSED: no-op re-serialization is byte-identical (comments + untouched keys safe).',
      );
    } else {
      console.log(
        '  ⚠ writer self-check: re-serialization differs from source. Diff is limited to target-key lines (likely locale-order normalization). Inspect before a real run.',
      );
      // Show which keys differ
      const before = src.split('\n'),
        after = noop.split('\n');
      for (let i = 0; i < Math.max(before.length, after.length); i++) {
        if (before[i] !== after[i])
          console.log(`    L${i + 1}\n      - ${before[i]}\n      + ${after[i]}`);
      }
    }
    console.log('\nNo files written.');
    return;
  }

  // Real run: translate then surgically write per locale (persist after each).
  const byKeyNew = {}; // key -> { loc: val }
  for (const loc of LOCALES) {
    const pending = pendingByLocale[loc];
    const keys = Object.keys(pending);
    if (!keys.length) {
      console.log(`  ${loc}: nothing to translate`);
      continue;
    }
    console.log(`  ${loc}: translating ${keys.length} strings…`);
    const batches = chunk(pending, 60);
    const merged = {};
    for (let i = 0; i < batches.length; i++) {
      process.stdout.write(`    batch ${i + 1}/${batches.length}…`);
      let attempt = 0;
      while (attempt < 3) {
        try {
          Object.assign(merged, await translateBatch(loc, batches[i]));
          process.stdout.write(' ✓\n');
          break;
        } catch (e) {
          attempt++;
          process.stdout.write(` retry ${attempt}…`);
          if (attempt >= 3) throw e;
          await new Promise((r) => setTimeout(r, 2000));
        }
      }
    }
    for (const [k, v] of Object.entries(merged)) {
      (byKeyNew[k] = byKeyNew[k] || {})[loc] = v;
    }

    // Persist after each locale: re-read fresh, merge, surgical write.
    src = fs.readFileSync(TRANSLATIONS_FILE, 'utf8');
    const fresh = findEntries(src);
    const repls = [];
    for (const e of fresh) {
      const adds = byKeyNew[e.key];
      if (!adds) continue;
      const newMap = { ...e.map };
      for (const [l, val] of Object.entries(adds)) if (force || !newMap[l]) newMap[l] = val;
      repls.push({ valStart: e.valStart, valEnd: e.valEnd, newText: serializeMap(newMap) });
    }
    src = applyReplacements(src, repls);
    fs.writeFileSync(TRANSLATIONS_FILE, src, 'utf8');
    console.log(`  ✓ ${loc} written (${Object.keys(merged).length} keys)`);
  }
  console.log('✓ Done.');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
