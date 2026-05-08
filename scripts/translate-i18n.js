#!/usr/bin/env node
// Batch-translate the English source strings in lib/translations.ts into the 7
// non-English locales using Claude. Reads ANTHROPIC_API_KEY from .env.local.
//
// Usage:
//   node scripts/translate-i18n.js                # translate every locale
//   node scripts/translate-i18n.js --locale es    # just one
//   node scripts/translate-i18n.js --force        # overwrite existing values
//
// Output: rewrites lib/translations.ts in place with the new locale entries
// merged into each translation key.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TRANSLATIONS_FILE = path.join(ROOT, 'lib', 'translations.ts');
const ENV_FILE = path.join(ROOT, '.env.local');

// Parse .env.local (simple, no escaping)
function loadEnv() {
  const raw = fs.readFileSync(ENV_FILE, 'utf8');
  const env = {};
  for (const line of raw.split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) env[m[1]] = m[2].replace(/^"(.*)"$/, '$1');
  }
  return env;
}

const env = loadEnv();
const API_KEY = env.ANTHROPIC_API_KEY;
if (!API_KEY) {
  console.error('ANTHROPIC_API_KEY missing from .env.local');
  process.exit(1);
}

const args = process.argv.slice(2);
const onlyLocale = args.includes('--locale') ? args[args.indexOf('--locale') + 1] : null;
const force = args.includes('--force');

const ALL_LOCALES = ['es', 'fr', 'pt', 'ru', 'zh', 'ja', 'ko'];
const LOCALES = onlyLocale ? [onlyLocale] : ALL_LOCALES;

const LOCALE_FOR_PROMPT = {
  es: 'Spanish (European Spanish, natural register)',
  fr: 'French (natural conversational French, tu form for second person)',
  pt: 'Brazilian Portuguese (natural register)',
  ru: 'Russian (natural register)',
  zh: 'Simplified Chinese (Mandarin, natural register)',
  ja: 'Japanese (natural register, polite-but-conversational)',
  ko: 'Korean (natural register)',
};

// Load and parse translations.ts to get the current TRANSLATIONS object
function readTranslations() {
  const src = fs.readFileSync(TRANSLATIONS_FILE, 'utf8');
  // Extract the TRANSLATIONS object literal
  const startMatch = src.match(/export const TRANSLATIONS: TranslationMap = \{/);
  if (!startMatch) throw new Error('Could not find TRANSLATIONS export');
  const startIdx = startMatch.index + startMatch[0].length - 1; // position of opening {
  // Walk braces to find matching close
  let depth = 0;
  let inStr = null;
  let escape = false;
  let endIdx = -1;
  for (let i = startIdx; i < src.length; i++) {
    const ch = src[i];
    if (escape) { escape = false; continue; }
    if (ch === '\\') { escape = true; continue; }
    if (inStr) {
      if (ch === inStr) inStr = null;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') { inStr = ch; continue; }
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) { endIdx = i; break; }
    }
  }
  if (endIdx < 0) throw new Error('Could not find end of TRANSLATIONS object');
  const objSrc = src.slice(startIdx, endIdx + 1);
  // eval it safely
  // Use Function constructor to evaluate the object literal
  const obj = new Function('return ' + objSrc)();
  return { src, startIdx, endIdx, obj };
}

async function translateBatch(locale, batch) {
  const localeDesc = LOCALE_FOR_PROMPT[locale];
  const system = `You are a professional translator for Mull, a philosophy-mapping web app. Translate UI strings from English into ${localeDesc}.

Rules:
- Preserve placeholders verbatim: {n}, {topic}, {handle}, {email}, {when}, {phil}, {strong_never_visible}, {kbd_cmd}, {kbd_enter}, {em_simulated}, {em_you}, {em_map}, {code}. Do not translate them.
- Preserve HTML/markup-like tokens: e.g. {em_X} are placeholders for italicized words; keep them in the same place. The actual italic word (when separately keyed, like 'debate.simulated_em') gets translated.
- Preserve emoji and arrows: ✓, ←, →, ↗, ✺, ⌘, ↵, 🔥.
- Match the tone: contemplative, plain modern language, warm but not cute. Match the register of literary translations (think Penguin Classics) rather than corporate UI.
- Names of philosophical schools or technical terms (categorical imperative, śūnyatā, ataraxia, eudaimonia, etc.) should use the established translation in the target language if one exists.
- Keep the lengths reasonably similar; avoid making text dramatically longer than the source.
- Return STRICT JSON only — an object mapping each key to its translation. No prose around it, no markdown fences. Start with { and end with }.`;

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
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`API ${res.status}: ${t}`);
  }
  const data = await res.json();
  const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('').trim();
  let cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '');
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start < 0 || end < 0) throw new Error('No JSON in response: ' + text.slice(0, 400));
  const slice = cleaned.slice(start, end + 1);
  try {
    return JSON.parse(slice);
  } catch (e) {
    // Try a parse-line-by-line recovery: extract "key": "value" pairs that
    // we can validate one at a time. Skip broken lines.
    const recovered = {};
    const re = /"((?:[^"\\]|\\.)*)"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
    let m;
    while ((m = re.exec(slice)) !== null) {
      try {
        const k = JSON.parse('"' + m[1] + '"');
        const v = JSON.parse('"' + m[2] + '"');
        recovered[k] = v;
      } catch {}
    }
    if (Object.keys(recovered).length > 0) {
      console.warn(`\n      JSON parse failed; recovered ${Object.keys(recovered).length} entries by regex`);
      return recovered;
    }
    throw new Error('JSON parse failed and could not recover: ' + e.message + '\n--- start of response ---\n' + slice.slice(0, 1500));
  }
}

// Chunk an object into batches of N keys
function chunk(obj, n) {
  const entries = Object.entries(obj);
  const out = [];
  for (let i = 0; i < entries.length; i += n) {
    out.push(Object.fromEntries(entries.slice(i, i + n)));
  }
  return out;
}

async function translateLocale(locale, allObj) {
  // Build object of {key: english} that needs translating
  const pending = {};
  for (const [key, vals] of Object.entries(allObj)) {
    if (!force && vals[locale]) continue;
    if (!vals.en) continue;
    pending[key] = vals.en;
  }
  if (Object.keys(pending).length === 0) {
    console.log(`  ${locale}: nothing to translate`);
    return {};
  }
  console.log(`  ${locale}: translating ${Object.keys(pending).length} strings…`);
  const batches = chunk(pending, 60); // ~60 strings per Claude call
  const merged = {};
  for (let i = 0; i < batches.length; i++) {
    process.stdout.write(`    batch ${i + 1}/${batches.length}…`);
    let attempt = 0;
    while (attempt < 3) {
      try {
        const result = await translateBatch(locale, batches[i]);
        Object.assign(merged, result);
        process.stdout.write(' ✓\n');
        break;
      } catch (e) {
        attempt++;
        process.stdout.write(` retry ${attempt}…`);
        if (attempt >= 3) throw e;
        await new Promise(r => setTimeout(r, 2000));
      }
    }
  }
  return merged;
}

function serializeValue(s) {
  // JSON.stringify gives us proper escaping for the string content,
  // but we want the surrounding string to use single quotes for TS style.
  // Use double-quoted JSON style to keep things simple.
  return JSON.stringify(s);
}

function regenFile(originalSrc, startIdx, endIdx, obj) {
  // Pretty-print the TRANSLATIONS object back into TS literal form.
  const lines = ['{'];
  const keys = Object.keys(obj);
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    const localeMap = obj[k];
    const inner = Object.entries(localeMap)
      .map(([loc, val]) => `${loc}: ${serializeValue(val)}`)
      .join(', ');
    const comma = i < keys.length - 1 ? ',' : '';
    lines.push(`  ${JSON.stringify(k)}: { ${inner} }${comma}`);
  }
  lines.push('}');
  return originalSrc.slice(0, startIdx) + lines.join('\n') + originalSrc.slice(endIdx + 1);
}

function persist(obj) {
  // Re-read the file to get fresh start/end indices each time, then rewrite.
  const fresh = readTranslations();
  const newSrc = regenFile(fresh.src, fresh.startIdx, fresh.endIdx, obj);
  fs.writeFileSync(TRANSLATIONS_FILE, newSrc, 'utf8');
}

(async () => {
  const { obj } = readTranslations();
  console.log(`Loaded ${Object.keys(obj).length} translation keys.`);
  for (const locale of LOCALES) {
    try {
      const result = await translateLocale(locale, obj);
      for (const [key, val] of Object.entries(result)) {
        if (!obj[key]) obj[key] = {};
        obj[key][locale] = val;
      }
      // Persist after EACH locale, so a later failure doesn't lose earlier work.
      persist(obj);
      console.log(`  ✓ ${locale} written to disk (${Object.keys(result).length} keys)`);
    } catch (e) {
      console.error(`  ✗ ${locale} failed: ${e.message}`);
      // Don't bail out — keep going for the other locales.
    }
  }
  console.log('✓ Done.');
})().catch(e => {
  console.error(e);
  process.exit(1);
});
