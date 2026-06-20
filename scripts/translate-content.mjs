#!/usr/bin/env node
// Batch-translate Mull's English CONTENT data (archetypes, dimensions,
// dilemmas, philosophers, …) into other locales using Claude, writing the
// result into per-domain lib/<domain>-i18n.ts overlay files.
//
// This is the content companion to scripts/translate-i18n.js (which handles
// the UI string map in lib/translations.ts). The difference: content lives in
// typed data modules with varied shapes, so this script IMPORTS the typed
// data (via tsx) and extracts the translatable fields declared in the DOMAINS
// registry below.
//
// Run it with tsx (handles the .ts imports):
//   npx tsx scripts/translate-content.mjs                 # all domains, zh
//   npx tsx scripts/translate-content.mjs --domain archetypes
//   npx tsx scripts/translate-content.mjs --locale zh --domain archetypes,dimensions
//   npx tsx scripts/translate-content.mjs --force         # re-translate existing
//
// Each overlay file has a script-managed region between
//   // ─── BEGIN gen-translate <CONST> ───
//   // ─── END   gen-translate <CONST> ───
// markers. Only that region is rewritten; the types + localize* helper around
// it are hand-maintained. Existing translations for other locales are
// preserved (and skipped unless --force).

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// ── Domain data (typed imports; tsx transpiles these on the fly) ──
import { ARCHETYPES } from '../lib/archetypes';
import { ARCHETYPES_I18N } from '../lib/archetypes-i18n';
import { DILEMMAS } from '../lib/dilemmas';
import { DILEMMAS_I18N } from '../lib/dilemmas-i18n';
import { TOPICS } from '../lib/topics';
import { TOPICS_I18N } from '../lib/topics-i18n';
import { PHILOSOPHERS, philosopherSlug } from '../lib/philosophers';
import { PHILOSOPHERS_I18N } from '../lib/philosophers-i18n';
import { DETAILED_QUESTIONS } from '../lib/quiz-questions-detailed';
import { DETAILED_QUIZ_I18N } from '../lib/quiz-detailed-i18n';
import { DIM_NARRATIONS } from '../lib/dim-narration';
import { DIM_NARRATION_I18N } from '../lib/dim-narration-i18n';
import { PHILOSOPHER_BIOS } from '../lib/philosopher-bios';
import { PHILOSOPHER_BIOS_I18N } from '../lib/philosopher-bios-i18n';
import { EXERCISES } from '../lib/exercises';
import { EXERCISES_I18N } from '../lib/exercises-i18n';
import { EXERCISE_EXTRAS } from '../lib/exercises-extras';
import { EXERCISE_EXTRAS_I18N } from '../lib/exercises-extras-i18n';
import { JOURNEY_SCENES, JOURNEY_REVEALS } from '../lib/quiz-journey';
import { JOURNEY_SCENES_I18N, JOURNEY_REVEALS_I18N } from '../lib/quiz-journey-i18n';
import { PILGRIMAGE_ARCS, FLAVOR_LENSES } from '../lib/pilgrimage';
import { PILGRIMAGE_I18N } from '../lib/pilgrimage-i18n';
import { CRUCIBLES } from '../lib/crucible';
import { CRUCIBLE_I18N } from '../lib/crucible-i18n';
import { ARENA_TOPICS } from '../lib/arena/data';
import { ARENA_TOPICS_I18N } from '../lib/arena/topics-i18n';

// Merge the ten arcs with their per-flavor enrollment lenses into one
// record keyed by archetype, so a single domain pass covers both the
// 30-day arc content and the lenses. The synthetic `lens` field holds
// FLAVOR_LENSES[key] (a Record<DimKey,string>); the overlay getter in
// lib/pilgrimage-i18n.ts reads it back from the same place.
const PILGRIMAGE_MERGED = Object.fromEntries(
  Object.entries(PILGRIMAGE_ARCS).map(([k, arc]) => [k, { ...arc, lens: FLAVOR_LENSES[k] || {} }]),
);

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SEP = '␟'; // ␟ — unlikely to appear in content; used as a path separator

// Locales whose quotations use paired full-width marks. The model is asked to
// emit these, but for long passages it often falls back to ASCII " (which the
// anchor recoverer then preserves verbatim). ASCII quotes inside CJK prose read
// as a quality defect, so we normalize balanced ASCII double-quote pairs to the
// locale's marks deterministically at write time — idempotent, and independent
// of whether the model cooperated.
const CJK_QUOTES = {
  zh: ['“', '”'],
  ja: ['「', '」'],
};
function normalizeQuotes(str, loc) {
  const q = CJK_QUOTES[loc];
  if (!q || typeof str !== 'string') return str;
  // Pair ASCII double quotes greedily-but-minimally (the char class excludes ")
  // so each "…" maps to one open/close pair. An unpaired stray " is left alone.
  return str.replace(/"([^"]*)"/g, `${q[0]}$1${q[1]}`);
}

// Recursively normalize every string leaf under `node` (a field object, which
// may hold nested arrays of field objects). Returns the count of changed leaves.
function normalizeNode(node, loc) {
  let changed = 0;
  for (const [k, v] of Object.entries(node)) {
    if (typeof v === 'string') {
      const n = normalizeQuotes(v, loc);
      if (n !== v) {
        node[k] = n;
        changed++;
      }
    } else if (Array.isArray(v)) {
      for (const el of v) if (el && typeof el === 'object') changed += normalizeNode(el, loc);
    } else if (v && typeof v === 'object') {
      changed += normalizeNode(v, loc);
    }
  }
  return changed;
}

// Normalize quotes across a whole overlay map's `loc` subtree, in place. Handles
// both flatValue overlays (entry[loc] is a string) and field overlays
// (entry[loc] is an object of fields). Returns the count of changed leaves.
function deepNormalizeLocale(existing, loc) {
  let changed = 0;
  for (const entry of Object.values(existing || {})) {
    const sub = entry?.[loc];
    if (sub == null) continue;
    if (typeof sub === 'string') {
      const n = normalizeQuotes(sub, loc);
      if (n !== sub) {
        entry[loc] = n;
        changed++;
      }
    } else if (typeof sub === 'object') {
      changed += normalizeNode(sub, loc);
    }
  }
  return changed;
}

// ── env ──
function loadEnv() {
  const p = join(ROOT, '.env.local');
  const env = {};
  if (!existsSync(p)) return env;
  for (const line of readFileSync(p, 'utf8').split('\n')) {
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

const LOCALE_DESC = {
  es: 'Spanish (European Spanish, natural literary register)',
  fr: 'French (natural literary register, tu form for second person)',
  pt: 'Brazilian Portuguese (natural literary register)',
  ru: 'Russian (natural literary register)',
  zh: 'Simplified Chinese (Mandarin, natural literary register)',
  ja: 'Japanese (natural literary register, polite-but-conversational)',
  ko: 'Korean (natural literary register)',
};

// ── DOMAIN REGISTRY ──
// Each domain: where the data is, the unique key field, which fields to
// translate (string = flat field; {array, subfields} = translate sub-fields
// of each array element by index), and the overlay file + managed const.
const DOMAINS = {
  archetypes: {
    data: ARCHETYPES,
    existing: ARCHETYPES_I18N,
    keyField: 'key',
    overlayFile: 'lib/archetypes-i18n.ts',
    constName: 'ARCHETYPES_I18N',
    recordType: 'Record<string, Partial<Record<Locale, ArchetypeI18nFields>>>',
    fields: [
      'spirit',
      'detailedAbout',
      'whatItGetsRight',
      'whereItFalters',
      'dayInTheLife',
      { array: 'quotes', subfields: ['text'] },
      { array: 'readingList', subfields: ['note'] },
      { array: 'tensions', subfields: ['spark'] },
      { array: 'modernExemplars', subfields: ['role', 'note'] },
      { array: 'commonMistakes', subfields: ['mistake', 'antidote'] },
    ],
  },
  dilemmas: {
    data: DILEMMAS,
    existing: DILEMMAS_I18N,
    keyField: null, // no id field — key by array index
    overlayFile: 'lib/dilemmas-i18n.ts',
    constName: 'DILEMMAS_I18N',
    recordType: 'Record<string, Partial<Record<Locale, DilemmaI18nFields>>>',
    fields: ['prompt', 'hint'],
  },
  crucible: {
    data: CRUCIBLES,
    existing: CRUCIBLE_I18N,
    keyField: 'id', // stable numeric id 1..60
    overlayFile: 'lib/crucible-i18n.ts',
    constName: 'CRUCIBLE_I18N',
    recordType: 'Record<string, Partial<Record<Locale, CrucibleI18nFields>>>',
    fields: ['prompt', 'framing'],
    hint: 'This is "The Crucible" — a daily real-life moral ACTION the reader commits to today and reports on tomorrow (Stoic evening-review, modern shape). Register: plain, direct second person, a touch austere — a wise guide\'s terse daily instruction, never corporate or therapy-speak. Match the same Chinese literary register as the rest of Mull. Field notes: "prompt" is the action itself, in present-tense IMPERATIVE — keep it an imperative the reader could do today (e.g. "Notice three moments…", "Refuse an invitation…", "Steelman a view you usually dismiss…"); render the leading verb as a natural Chinese imperative (注意…, 拒绝…, 为…作最有力的辩护…). Many prompts END with a short clipped second instruction ("Just listen.", "Don\'t over-explain.", "Hold the silence.", "Count.") — keep those terse and imperative, do not pad. "framing" is a one-line aphoristic rationale (e.g. "The first move is awareness.", "Small repairs are weightier than they seem.", "Yeses owe nos elsewhere.") — keep it short, epigrammatic, and self-contained; do not expand into a full explanation. Keep any digits verbatim ("three moments", "100 written words", "20 minutes", "12 hours"). Do not add quotation marks the English does not have.',
  },
  topics: {
    data: TOPICS,
    existing: TOPICS_I18N,
    keyField: 'slug',
    overlayFile: 'lib/topics-i18n.ts',
    constName: 'TOPICS_I18N',
    recordType: 'Record<string, Partial<Record<Locale, TopicI18nFields>>>',
    fields: ['title', 'summary', 'essay', 'microPrompt'],
  },
  arenaTopics: {
    data: ARENA_TOPICS,
    existing: ARENA_TOPICS_I18N,
    keyField: 'slug',
    overlayFile: 'lib/arena/topics-i18n.ts',
    constName: 'ARENA_TOPICS_I18N',
    recordType: 'Record<string, Partial<Record<Locale, ArenaTopicI18nFields>>>',
    fields: ['title', 'prompt', 'primer'],
    hint: 'These are debate topics for Mull\'s philosophical sparring Arena. Register: intellectually serious, clear, and provocative without being sensational — the voice of a good seminar prompt. Field notes: "title" is a SHORT topic name (a noun phrase or a terse question, e.g. "Free Will", "Is lying ever obligatory?") — keep it short and punchy, mirror a question with a question. "prompt" is a SINGLE declarative debate proposition the two sides argue over (e.g. "We are wholly responsible for our choices, even when shaped by forces we did not choose.") — render it as one clean, debatable claim in natural Chinese, not softened into a question. "primer" is a neutral 1-3 sentence context paragraph shown to the user before they argue — even-handed, presenting the tension without taking a side; keep it neutral and readable. Match the same Chinese literary register as the rest of Mull. Keep any digits and proper names (philosophers, schools) in their standard Chinese forms.',
  },
  philosophers: {
    data: PHILOSOPHERS,
    existing: PHILOSOPHERS_I18N,
    keyFn: (p) => philosopherSlug(p.name), // slug derived from English name (stable URL key)
    overlayFile: 'lib/philosophers-i18n.ts',
    constName: 'PHILOSOPHERS_I18N',
    recordType: 'Record<string, Partial<Record<Locale, PhilosopherI18nFields>>>',
    fields: ['name', 'dates', 'keyIdea'],
  },
  quizDetailed: {
    data: DETAILED_QUESTIONS,
    existing: DETAILED_QUIZ_I18N,
    keyField: null, // no id field — key by array index (mirrors dilemmas)
    overlayFile: 'lib/quiz-detailed-i18n.ts',
    constName: 'DETAILED_QUIZ_I18N',
    recordType: 'Record<string, Partial<Record<Locale, DetailedQuestionI18nFields>>>',
    fields: ['p', { array: 'a', subfields: ['t'] }],
  },
  dimNarration: {
    data: DIM_NARRATIONS,
    existing: DIM_NARRATION_I18N,
    shape: 'record', // DIM_NARRATIONS is Record<dimKey, …>; key by dim key (TV, VA, …)
    overlayFile: 'lib/dim-narration-i18n.ts',
    constName: 'DIM_NARRATION_I18N',
    recordType: 'Record<string, Partial<Record<Locale, DimNarrationI18nFields>>>',
    fields: ['label', 'high', 'low'],
    // The `high`/`low` values are rendered on /compare with a degree adverb
    // prefixed (e.g. zh 强烈地/较为/略微 — "strongly"/"moderately"/"barely").
    // So each must read naturally with such a prefix.
    hint: 'The "high" and "low" values are sentence FRAGMENTS describing a leaning on a scale. At render time a degree adverb is prefixed to each (in Chinese: 强烈地 / 较为 / 略微 = "strongly" / "moderately" / "just barely"). Translate each so it reads naturally with that adverb in front: lead with a single GRADABLE predicate verb (信任…, 重视…, 倾向于…), NOT with a temporal/conditional clause and NOT with a comparative like 更 (which clashes with the prefixed adverb). The "label" is a short noun-phrase dimension name and takes no adverb. Keep the em-dash "——" clause structure where present.',
  },
  philosopherBios: {
    data: PHILOSOPHER_BIOS,
    existing: PHILOSOPHER_BIOS_I18N,
    shape: 'record', // PHILOSOPHER_BIOS is Record<slug, string>; key by slug
    flatValue: true, // …and the record VALUE is the whole essay (no field objects)
    overlayFile: 'lib/philosopher-bios-i18n.ts',
    constName: 'PHILOSOPHER_BIOS_I18N',
    recordType: 'Record<string, Partial<Record<Locale, string>>>',
    hint: 'Each value is a multi-paragraph editorial essay — a philosopher biography. Preserve the paragraph structure exactly: keep every blank-line "\\n\\n" break between paragraphs. The English wraps book/work titles and the occasional foreign term in *asterisks* (e.g. *Republic*, *Being and Nothingness*, *telos*, *eudaimonia*). Do NOT emit literal asterisks in the translation. Instead: render book/work titles with Chinese 《》 title marks (e.g. 《理想国》, 《存在与虚无》); for an emphasized foreign/technical term, give the established Chinese term and, on first mention where it aids the reader, append the romanized word in parentheses (e.g. 目的（telos）, 幸福（eudaimonia）). Keep years and parenthetical citations like "(1781)" verbatim. The register is an erudite, plain literary essay.',
  },
  exercises: {
    data: EXERCISES,
    existing: EXERCISES_I18N,
    keyField: 'slug',
    overlayFile: 'lib/exercises-i18n.ts',
    constName: 'EXERCISES_I18N',
    // Reuse the overlay's own ExerciseI18N alias (defined above the sentinels)
    // so the rewritten declaration keeps the existing, hand-authored type.
    recordType: 'Record<string, ExerciseI18N>',
    fields: [
      'name',
      'summary',
      'tradition',
      'duration',
      'reflection',
      'about',
      { stringArray: 'steps' },
    ],
    hint: 'These are short contemplative/philosophical PRACTICE exercises. "name" is the practice title. "tradition" names the school it comes from (e.g. Stoic→斯多葛, Zen→禅, Existentialist→存在主义) — use the established target-language school name. "duration" is a short time estimate like "10–15 min": keep the digits and en-dash, translate only the unit (min→分钟). "summary" is one inviting sentence. "about" is a short paragraph of rationale. "steps" are imperative, second-person instructions to the practitioner — keep them concrete and direct. "reflection" is a closing prompt, usually a question. Plain, warm, direct second person — instructions a thoughtful guide would give, not corporate copy.',
  },
  exerciseExtras: {
    data: EXERCISE_EXTRAS,
    existing: EXERCISE_EXTRAS_I18N,
    shape: 'record', // EXERCISE_EXTRAS is Record<slug, ExerciseExtras>; key by slug
    overlayFile: 'lib/exercises-extras-i18n.ts',
    constName: 'EXERCISE_EXTRAS_I18N',
    // Reuse the overlay's own ExtrasI18N alias (defined above the sentinels).
    recordType: 'Record<string, ExtrasI18N>',
    fields: [
      'longerAbout',
      'workedExample',
      { stringArray: 'commonPitfalls' },
      { array: 'relatedThinkers', subfields: ['name', 'note'] },
      { array: 'furtherReading', subfields: ['title', 'note'] },
      { array: 'kindredPractices', subfields: ['name', 'note'] },
    ],
    hint: 'These are deep-dive supplements to a contemplative/philosophical practice exercise. "longerAbout" is 2–3 paragraphs of history and lineage — preserve the blank-line "\\n\\n" paragraph breaks exactly. "commonPitfalls" are short cautionary notes (ways people get the practice wrong). "workedExample" is one concrete scenario paragraph. relatedThinkers: "name" is a thinker — use the established target-language rendering for well-known figures (e.g. Seneca→塞内卡, Marcus Aurelius→马可·奥勒留, Confucius→孔子; transliterate modern names like Gary Klein→加里·克莱因), "note" is why they matter (render work titles with 《》 for Chinese, e.g. Meditations→《沉思录》; keep years and parenthetical citations verbatim). furtherReading: "title" is a book/essay title — use the standard published target-language title when well known (e.g. Thinking, Fast and Slow→《思考，快与慢》), otherwise translate the sense and wrap in 《》 for Chinese; "note" is why to read it. kindredPractices: "name" is an allied practice, "note" is a one-line description. Plain, erudite, literary register.',
  },
  quizJourneyScenes: {
    data: JOURNEY_SCENES,
    existing: JOURNEY_SCENES_I18N,
    keyField: 'id', // each scene has a stable id (arrival, ch1…ch4, reveal)
    overlayFile: 'lib/quiz-journey-i18n.ts',
    constName: 'JOURNEY_SCENES_I18N',
    recordType: 'Record<string, SceneI18N>',
    fields: [
      'eyebrow',
      'body',
      'advance',
      'prompt',
      'epilogue',
      'coldOpen',
      'twistClue',
      { array: 'choices', subfields: ['text'] },
      { stringRecord: 'choiceEpilogues' },
    ],
    hint: 'This is "The Inheritor" — an immersive narrative quiz written as a country-house MURDER MYSTERY in close second person ("you"). Register: literary, atmospheric, a little gothic — match a good Chinese translation of a Penguin Classics novel, never UI copy. Keep the suspense and restraint; do not explain or flatten the prose. CRITICAL formatting: (1) Preserve every blank-line "\\n\\n" paragraph break EXACTLY. (2) The text uses *single asterisks* to wrap italicized passages — the will excerpt, lines quoted from letters, and emphasized words. KEEP the literal asterisks in place around the translated span (e.g. *I forgive you for all of it.* → *我原谅你所做的一切。*); never drop or convert them. (3) Keep ▶ ◂ arrows, em-dashes "——", and any digits verbatim. Recurring proper nouns — render these CONSISTENTLY every time so batches agree: Wren→雷恩 (his given name Andrew→安德鲁); Elena→埃莱娜; Margaret→玛格丽特; Imre→伊姆雷; Sasha→萨沙; Hargreaves→哈格里夫斯; Shortheath Estate→肖特希思庄园. Keep single-letter initials/signatures (M., A. K.) in Latin. Recurring terms: inheritor→继承人, the will→遗嘱, solicitor→事务律师, estate→庄园, the housekeeper / the servant→管家 (she), registry→登记处. Field notes: "eyebrow" is a chapter label like "II · The Foyer" — translate the room name but keep the Roman numeral and "·" (e.g. "II · 门厅"). "body"/"epilogue"/"coldOpen"/"twistClue" are narrative prose. "prompt" is the hinge question put to the player. "choices.text" are the player\'s first-person options (some are an action described in second person rather than speech). "advance" is a short imperative button label (e.g. "Walk to the door"). "choiceEpilogues" values are longer narrative beats that replace the default epilogue for a specific choice.',
  },
  quizJourneyReveals: {
    data: JOURNEY_REVEALS,
    existing: JOURNEY_REVEALS_I18N,
    shape: 'record', // JOURNEY_REVEALS is Record<archetypeKey, RevealEnding>
    overlayFile: 'lib/quiz-journey-i18n.ts',
    constName: 'JOURNEY_REVEALS_I18N',
    recordType: 'Record<string, RevealI18N>',
    fields: [
      'recognition',
      'flavorDetailDefault',
      'inheritance',
      'ask',
      'advance',
      { stringRecord: 'flavorDetails' },
    ],
    hint: 'These are the ten endings of "The Inheritor", a country-house murder mystery. In each, the dying philosopher WREN (雷恩) speaks directly to the player ("you"), recognizes what kind of mind they have, and gives + asks something. Register: literary, intimate, the measured speech of an old dying man — match a good Chinese literary translation, not UI copy. The pieces (recognition → a flavor beat → inheritance → ask) are spliced into one continuous speech at render time, so keep each self-contained but tonally seamless. CRITICAL: (1) Preserve every "\\n\\n" paragraph break EXACTLY. (2) *Single asterisks* wrap italicized passages — lines quoted from letters (e.g. *Publish it. Publish it this year…*) and emphasized phrases (e.g. *late-summer attention*, *change the disagreement*). KEEP the literal asterisks around the translated span; never drop them. (3) Keep digits, em-dashes "——", and ▶ arrows verbatim. Names, every time: Wren→雷恩; his wife Elena→埃莱娜; the daughter, the rival (论敌/对手), the correspondents Margaret→玛格丽特, Imre→伊姆雷, Sasha→萨沙; the solicitor Hargreaves→哈格里夫斯. Keep initials/signatures (M., A. K.) in Latin. Archetype words appear ("Cartographer", "Keel", "Threshold", "Pilgrim", "Touchstone", "Hearth", "Forge", "Hammer", "Garden", "Lighthouse") — render with the SAME Chinese archetype names Mull uses elsewhere: Cartographer→制图师, Keel→龙骨, Threshold→门槛, Pilgrim→朝圣者, Touchstone→试金石, Hearth→炉火, Forge→熔炉, Hammer→铁锤, Garden→花园, Lighthouse→灯塔. Field notes: "recognition" names the player\'s cast of mind; "flavorDetails" values are short mid-speech beats (one keyed per DimKey); "flavorDetailDefault" is the fallback beat; "inheritance" is what Wren leaves; "ask" is what he wants done; "advance" is a short imperative button label (e.g. "Take the manuscript").',
  },
  pilgrimage: {
    data: PILGRIMAGE_MERGED,
    existing: PILGRIMAGE_I18N,
    shape: 'record', // keyed by archetype (cartographer, keel, … lighthouse)
    overlayFile: 'lib/pilgrimage-i18n.ts',
    constName: 'PILGRIMAGE_I18N',
    recordType: 'Record<string, ArcI18N>',
    fields: [
      'spirit',
      'welcomeDefault',
      { stringArray: 'phases' },
      { array: 'days', subfields: ['title', 'framing', 'prompt', 'expect'] },
      { stringRecord: 'lens' },
    ],
    hint: 'This is "The Pilgrimage" — a 30-day personalized reflection course, one arc per archetype. Register: contemplative, plain, direct second person ("you"); spare and a little austere — a wise guide\'s daily instructions, never corporate or therapy-speak. Match the same Chinese literary register as the rest of Mull. Field notes: "spirit" is the one-line shape of the 30-day arc (e.g. "Thirty days redrawing what you thought was settled."). "welcomeDefault" is the enrollment welcome — one warm paragraph addressed to the reader. "phases" are three short ten-day PHASE NAMES (title-case noun phrases like "The Edges of Your Framework", "Other Maps, Other Mappers"); keep them short noun phrases. Each day has: "title" (a sharp 3–5 word day title — keep it terse and evocative), "framing" (1–2 sentences of theme), "prompt" (the single question/instruction the reader writes against — keep it a direct question or imperative), and "expect" (a one-line hint about a substantive answer, OFTEN A TERSE FRAGMENT like "Cost — not promise.", "Three steps deep.", "Drift has a price." — keep these clipped, do not pad into full sentences). "lens" values are per-flavor enrollment notes (2–3 sentences) calibrating the arc to a secondary leaning — same warm-but-spare register as welcomeDefault. CRITICAL: (1) Preserve every "\\n\\n" paragraph break EXACTLY. (2) Keep em-dashes "——", arrows (▶ ◂ ▸), and digits verbatim (e.g. "Day 1", "twenty days", "20-year view", "five years"). (3) The archetype NAME recurs throughout (sometimes lower-case, plural, or possessive: "the Keel", "Cartographers", "forge-people", "the hammer\'s", "Garden", "Threshold-people") — render with Mull\'s canonical Chinese archetype names every time: Cartographer→制图师, Keel→龙骨, Threshold→门槛, Pilgrim→朝圣者, Touchstone→试金石, Hearth→炉火, Forge→熔炉, Hammer→铁锤, Garden→花园, Lighthouse→灯塔. (4) Greek/technical terms appear with glosses — render the established Chinese term and keep the romanization in parentheses on first mention: phronesis→实践智慧（phronesis）, episteme→理论知识（episteme）, apophatic→否定之道, asceticism→苦修. Philosopher names use the established Chinese rendering (Aristotle→亚里士多德, Hume→休谟, Epictetus→爱比克泰德). Do NOT translate the lens subkeys (TV, CE, RT, …) — they are DimKey identifiers and are kept verbatim by the pipeline.',
  },
};

// ── args ──
const args = process.argv.slice(2);
const force = args.includes('--force');
// --repair: instead of translating missing strings, re-translate only the
// EXISTING values that look truncated (see isSuspectTruncation) — a cheap,
// targeted fix for damage left by the old lossy recovery, without re-sweeping
// the hundreds of good batches a --force run would redo.
const repair = args.includes('--repair');
// --renormalize: no API calls. Walk the EXISTING overlay values for `locale`
// and re-persist them through normalizeQuotes (ASCII " → locale quotation
// marks for CJK). Cheap, idempotent quote-quality cleanup that preserves the
// already-translated prose. Works across all domains/shapes.
const renormalize = args.includes('--renormalize');
// --dry-run: compute what WOULD be translated/repaired and print it, but make
// no API calls and write nothing. Lets us validate the --repair detector
// cheaply before spending tokens.
const dryRun = args.includes('--dry-run');
const locale = args.includes('--locale') ? args[args.indexOf('--locale') + 1] : 'zh';
const domainArg = args.includes('--domain') ? args[args.indexOf('--domain') + 1] : null;
const domainNames = domainArg ? domainArg.split(',') : Object.keys(DOMAINS);
// --max-batches N: process at most N batches this run, then exit (resumable via
// skip-existing). Lets us drive long translations as a series of short
// foreground invocations, since backgrounded processes have no network egress.
const maxBatches = args.includes('--max-batches')
  ? Math.max(1, parseInt(args[args.indexOf('--max-batches') + 1], 10) || 1)
  : Infinity;
// --batch-size N: strings per API call. Keep small — large batches make a
// single long-lived request that the sandbox/proxy cuts after ~a minute,
// surfacing as undici "fetch failed". Small batches finish fast and reliably.
const batchSize = args.includes('--batch-size')
  ? Math.max(1, parseInt(args[args.indexOf('--batch-size') + 1], 10) || 1)
  : 8;
if (!LOCALE_DESC[locale]) {
  console.error(`Unknown locale "${locale}". Known: ${Object.keys(LOCALE_DESC).join(', ')}`);
  process.exit(1);
}

// ── yield [entryKey, entryObject] pairs for a domain, regardless of shape ──
//   • shape:'record'   → Object.entries(data), key = the record key
//   • array + keyField → key = String(entry[keyField])  (e.g. archetypes 'key')
//   • array, no keyField → key = String(array index)    (e.g. dilemmas)
function entries(domain) {
  if (domain.shape === 'record') {
    return Object.entries(domain.data);
  }
  return domain.data.map((entry, i) => [
    domain.keyFn
      ? String(domain.keyFn(entry))
      : domain.keyField
        ? String(entry[domain.keyField])
        : String(i),
    entry,
  ]);
}

// ── Disambiguate a 3-part flatKey `key␟field␟sub`. Two field shapes
//    both produce 3-part keys: {stringArray} (sub = numeric index →
//    stored in an array) and {stringRecord} (sub = arbitrary string
//    key → stored in an object). Resolve by the field's declaration in
//    the domain. Defaults to 'stringArray' (the legacy 3-part shape) so
//    any caller without a matching field decl keeps old behavior. ──
function field3Shape(domain, fieldName) {
  for (const f of domain?.fields || []) {
    if (typeof f === 'object' && f.stringArray === fieldName) return 'stringArray';
    if (typeof f === 'object' && f.stringRecord === fieldName) return 'stringRecord';
  }
  return 'stringArray';
}

// ── flatten: build { flatKey -> englishText } for a domain ──
function extract(domain) {
  const out = {};
  // flatValue: the record VALUE is the translatable string itself (no fields).
  // flatKey is just the entry key (e.g. the slug).
  if (domain.flatValue) {
    for (const [k, entry] of entries(domain)) {
      if (k == null) continue;
      if (typeof entry === 'string' && entry.trim()) out[k] = entry;
    }
    return out;
  }
  for (const [k, entry] of entries(domain)) {
    if (k == null) continue;
    for (const f of domain.fields) {
      if (typeof f === 'string') {
        const v = entry[f];
        if (typeof v === 'string' && v.trim()) out[`${k}${SEP}${f}`] = v;
      } else if (f.stringArray) {
        // string[] field (e.g. exercise `steps`): translate each element by
        // index. flatKey is the 3-part `key␟field␟i` (vs the 4-part
        // array-of-objects form in the else branch below).
        const arr = entry[f.stringArray];
        if (!Array.isArray(arr)) continue;
        arr.forEach((v, i) => {
          if (typeof v === 'string' && v.trim()) out[`${k}${SEP}${f.stringArray}${SEP}${i}`] = v;
        });
      } else if (f.stringRecord) {
        // Record<string|number, string> field (e.g. journey
        // `choiceEpilogues` keyed by choice index, or reveal
        // `flavorDetails` keyed by DimKey): translate each value by its
        // record key. flatKey is the 3-part `key␟field␟subkey` — same
        // arity as stringArray, disambiguated by field3Shape at merge.
        const rec = entry[f.stringRecord];
        if (!rec || typeof rec !== 'object') continue;
        for (const [sk, v] of Object.entries(rec)) {
          if (typeof v === 'string' && v.trim()) out[`${k}${SEP}${f.stringRecord}${SEP}${sk}`] = v;
        }
      } else {
        const arr = entry[f.array];
        if (!Array.isArray(arr)) continue;
        arr.forEach((item, i) => {
          for (const sf of f.subfields) {
            const v = item?.[sf];
            if (typeof v === 'string' && v.trim())
              out[`${k}${SEP}${f.array}${SEP}${i}${SEP}${sf}`] = v;
          }
        });
      }
    }
  }
  return out;
}

// ── does the existing overlay already hold this flatKey for `locale`? ──
function hasExisting(existing, flatKey, loc, domain) {
  if (domain?.flatValue) return typeof existing?.[flatKey]?.[loc] === 'string';
  const parts = flatKey.split(SEP);
  const node = existing?.[parts[0]]?.[loc];
  if (!node) return false;
  if (parts.length === 2) return typeof node[parts[1]] === 'string';
  if (parts.length === 3) {
    // 3-part `key␟field␟sub` → either a string[] element (stringArray)
    // or an object value (stringRecord), by the field's declared shape.
    if (field3Shape(domain, parts[1]) === 'stringRecord') {
      return typeof node[parts[1]]?.[parts[2]] === 'string';
    }
    const el = node[parts[1]]?.[+parts[2]];
    return typeof el === 'string';
  }
  const [, arrName, idxStr, sf] = parts;
  const el = node[arrName]?.[+idxStr];
  return !!el && typeof el[sf] === 'string';
}

// ── merge translated flatKeys back into a nested overlay map ──
function applyTranslations(map, translations, loc, domain) {
  // Normalize CJK quotation marks up front, so both code paths below store the
  // cleaned value (see normalizeQuotes / CJK_QUOTES).
  translations = Object.fromEntries(
    Object.entries(translations).map(([k, v]) => [k, normalizeQuotes(v, loc)]),
  );
  if (domain?.flatValue) {
    for (const [flatKey, val] of Object.entries(translations)) {
      map[flatKey] ||= {};
      map[flatKey][loc] = val;
    }
    return map;
  }
  for (const [flatKey, val] of Object.entries(translations)) {
    const parts = flatKey.split(SEP);
    const entryKey = parts[0];
    map[entryKey] ||= {};
    map[entryKey][loc] ||= {};
    const node = map[entryKey][loc];
    if (parts.length === 2) {
      node[parts[1]] = val;
    } else if (parts.length === 3) {
      // 3-part `key␟field␟sub` → stringArray element OR stringRecord
      // value, by the field's declared shape.
      const fieldName = parts[1];
      if (field3Shape(domain, fieldName) === 'stringRecord') {
        // Object value keyed by an arbitrary subkey (choice index as a
        // string, or a DimKey). Store the subkey verbatim.
        node[fieldName] ||= {};
        node[fieldName][parts[2]] = val;
      } else {
        // string[] element. A batch boundary can deliver indices out of
        // order, so fill any lower holes with '' first; never clobber an
        // already-translated element.
        const idx = +parts[2];
        node[fieldName] ||= [];
        for (let j = 0; j < idx; j++) node[fieldName][j] ??= '';
        node[fieldName][idx] = val;
      }
    } else {
      const [, arrName, idxStr, sf] = parts;
      const idx = +idxStr;
      node[arrName] ||= [];
      for (let j = 0; j <= idx; j++) node[arrName][j] ||= {}; // fill holes with {}
      node[arrName][idx][sf] = val;
    }
  }
  return map;
}

// ── decode a JSON string BODY (between the quotes) tolerantly: honor \n \t
//    \" \\ \uXXXX etc., but pass bare/unescaped characters (incl. stray ")
//    through verbatim. Used by the anchor recoverer below. ──
function decodeJsonStringBody(s) {
  let r = '';
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '\\') {
      const n = s[i + 1];
      if (n === 'n') {
        r += '\n';
        i++;
      } else if (n === 't') {
        r += '\t';
        i++;
      } else if (n === 'r') {
        r += '\r';
        i++;
      } else if (n === '"') {
        r += '"';
        i++;
      } else if (n === '\\') {
        r += '\\';
        i++;
      } else if (n === '/') {
        r += '/';
        i++;
      } else if (n === 'b') {
        r += '\b';
        i++;
      } else if (n === 'f') {
        r += '\f';
        i++;
      } else if (n === 'u') {
        const hex = s.slice(i + 2, i + 6);
        if (/^[0-9a-fA-F]{4}$/.test(hex)) {
          r += String.fromCharCode(parseInt(hex, 16));
          i += 5;
        } else {
          r += c;
        }
      } else {
        r += c;
      }
    } else {
      r += c;
    }
  }
  return r;
}

// ── Anchor-based recovery: the model occasionally emits an unescaped ASCII
//    quote inside a value, which makes JSON.parse fail. The OLD recovery used
//    a /"key":"value"/ regex that stopped at the first inner quote — silently
//    truncating the value mid-sentence. Instead, use the KNOWN batch keys as
//    delimiters: each value runs from the quote after its key's colon up to the
//    next key anchor (or the closing brace). Inner quotes — escaped or not —
//    are preserved. ──
function recoverByAnchors(slice, keys) {
  const anchors = [];
  for (const k of keys) {
    const needle = JSON.stringify(k); // "flat␟key" exactly as it appears in output
    const idx = slice.indexOf(needle);
    if (idx >= 0) anchors.push({ key: k, start: idx, needleLen: needle.length });
  }
  anchors.sort((a, b) => a.start - b.start);
  const closeBrace = slice.lastIndexOf('}');
  const out = {};
  for (let i = 0; i < anchors.length; i++) {
    const a = anchors[i];
    const next = anchors[i + 1];
    const colon = slice.indexOf(':', a.start + a.needleLen);
    if (colon < 0) continue;
    const open = slice.indexOf('"', colon);
    if (open < 0) continue;
    const regionEnd = next ? next.start : closeBrace >= 0 ? closeBrace : slice.length;
    if (regionEnd <= open) continue;
    let seg = slice.slice(open + 1, regionEnd);
    seg = seg.replace(/\s*,?\s*$/, ''); // trailing comma/whitespace before next key
    const lastQuote = seg.lastIndexOf('"'); // the value's true closing quote
    if (lastQuote >= 0) seg = seg.slice(0, lastQuote);
    out[a.key] = decodeJsonStringBody(seg);
  }
  return out;
}

// ── truncation detector for --repair: flag persisted translations that look
//    cut short by the old lossy recovery. Two robust signals, no length-only
//    heuristic (CJK is dense, so short ≠ truncated):
//    (a) the English ends with terminal punctuation but the translation doesn't;
//    (b) the English carries a quotation but the translation dropped every
//        quote mark AND is materially shorter. ──
const EN_TERMINAL = /[.!?…"'’”)\]]\s*$/;
// Terminal CJK/ASCII punctuation, optionally followed by a closing quote — a
// value that ends "…。" (sentence then closing quotation) is complete, not cut.
const ZH_TERMINAL = /[。！？!?…”’』」）)\."']["'”’』」）]?\s*$/;
// A *real* quotation in the English source — double-quote family, or a single
// quote that OPENS a quotation (preceded by start/space). Deliberately excludes
// mid-word apostrophes (world's, isn't), which never broke JSON and so never
// truncated anything.
const HAS_QUOTATION_EN = /["“”«»「」『』]|(^|\s)['‘]/;
const HAS_QUOTE_ZH = /["“”「」『』«»]/;
// A trailing single-letter abbreviation ("2nd c.", "p.", "ed.") ends in a period
// that is NOT a sentence terminal — don't let signal (a) mistake it for one.
const EN_ABBREV_END = /(^|\s)[A-Za-z]\.\s*['"”’]?\s*$/;
function isSuspectTruncation(en, zh) {
  if (typeof zh !== 'string' || !zh.trim()) return false;
  const e = String(en).trim();
  const z = zh.trim();
  if (!e) return false;
  // (a) English ends in sentence punctuation but the translation doesn't.
  if (EN_TERMINAL.test(e) && !ZH_TERMINAL.test(z) && !EN_ABBREV_END.test(e)) return true;
  // (b) English carries a real quotation but the translation dropped every
  //     quote mark and is materially shorter → the quoted span was lost.
  if (HAS_QUOTATION_EN.test(e) && !HAS_QUOTE_ZH.test(z) && z.length < e.length * 0.7) return true;
  return false;
}

// ── read the persisted translation string for a flatKey (mirror of
//    hasExisting, but returns the value) ──
function getExisting(existing, flatKey, loc, domain) {
  if (domain?.flatValue) {
    const v = existing?.[flatKey]?.[loc];
    return typeof v === 'string' ? v : undefined;
  }
  const parts = flatKey.split(SEP);
  const node = existing?.[parts[0]]?.[loc];
  if (!node) return undefined;
  if (parts.length === 2) return typeof node[parts[1]] === 'string' ? node[parts[1]] : undefined;
  if (parts.length === 3) {
    // 3-part `key␟field␟sub` → string[] element OR stringRecord value.
    if (field3Shape(domain, parts[1]) === 'stringRecord') {
      const v = node[parts[1]]?.[parts[2]];
      return typeof v === 'string' ? v : undefined;
    }
    const el = node[parts[1]]?.[+parts[2]];
    return typeof el === 'string' ? el : undefined;
  }
  const [, arrName, idxStr, sf] = parts;
  const el = node[arrName]?.[+idxStr];
  return el && typeof el[sf] === 'string' ? el[sf] : undefined;
}

// ── Claude translation of one batch ({key: english}) → {key: translated} ──
// `hint` (optional, per-domain) is appended to the system prompt — used when a
// domain's strings will be recomposed at render time and the translator needs
// to know the grammatical frame (e.g. dim-narration fragments get a degree
// adverb prefixed, so each must lead with a gradable predicate).
async function translateBatch(loc, batch, hint) {
  const desc = LOCALE_DESC[loc];
  const system = `You are a professional literary translator for Mull, a philosophy-mapping web app. Translate the given English content into ${desc}. The register is contemplative, plain, warm but not cute — match literary translation (Penguin Classics / 商务印书馆 «汉译世界学术名著»), not corporate UI.
${hint ? `\nDomain note: ${hint}\n` : ''}
Rules:
- Return STRICT JSON only: an object mapping each input key to its translation. No prose, no markdown fences. Start with { and end with }.
- Keep every key EXACTLY as given. Only translate the value.
- Philosopher names and proper nouns: use the established target-language rendering when one is conventional (e.g. for Chinese: Plato→柏拉图, Kant→康德, Nietzsche→尼采, Confucius→孔子); otherwise transliterate sensibly.
- Book titles: use the standard published target-language title if well known; otherwise translate the sense.
- Technical philosophy terms (categorical imperative, eudaimonia, śūnyatā, ataraxia, qi, wu wei, …) use the established target-language term.
- Preserve paragraph breaks (\\n and \\n\\n) exactly. Preserve any placeholders like {n}, {name}, arrows (← → ↗ ✓) and emoji verbatim and in place.
- CRITICAL — quotation marks inside VALUES: never emit a raw ASCII double-quote (") inside a translated value; it corrupts the JSON. For quotations within the text, use typographic quotes — for Chinese/Japanese use “ ” (U+201C/U+201D) or 「 」; for other locales use that locale's conventional quotation marks (« », „ ", etc.). Do not use ASCII straight quotes or apostrophes inside values.
- Translate meaning faithfully; keep length reasonably similar; do not add notes or commentary.`;

  const user = `Translate each value into ${desc}. Return ONLY a JSON object with the same keys, mapping each to the translated string.\n\n${JSON.stringify(batch, null, 2)}`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 16000,
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
  let cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '');
  const s = cleaned.indexOf('{');
  const e = cleaned.lastIndexOf('}');
  if (s < 0 || e < 0) throw new Error('No JSON in response: ' + text.slice(0, 400));
  const slice = cleaned.slice(s, e + 1);
  try {
    return JSON.parse(slice);
  } catch (err) {
    // Anchor-based recovery (see recoverByAnchors): uses the known batch keys
    // as delimiters so unescaped inner quotes no longer truncate values.
    const recovered = recoverByAnchors(slice, Object.keys(batch));
    const n = Object.keys(recovered).length;
    if (n) {
      console.warn(
        `      JSON parse failed; recovered ${n}/${Object.keys(batch).length} by anchors`,
      );
      return recovered;
    }
    throw new Error('JSON parse failed and unrecoverable: ' + err.message);
  }
}

function chunk(obj, n) {
  const e = Object.entries(obj);
  const out = [];
  for (let i = 0; i < e.length; i += n) out.push(Object.fromEntries(e.slice(i, i + n)));
  return out;
}

// ── write the regenerated map back into the overlay file's managed region ──
function persist(domain, map) {
  const path = join(ROOT, domain.overlayFile);
  const src = readFileSync(path, 'utf8');
  const begin = `// ─── BEGIN gen-translate ${domain.constName} ───`;
  const end = `// ─── END gen-translate ${domain.constName} ───`;
  const bi = src.indexOf(begin);
  const ei = src.indexOf(end);
  if (bi < 0 || ei < 0)
    throw new Error(`Sentinels for ${domain.constName} not found in ${domain.overlayFile}`);
  const json = JSON.stringify(map, null, 2);
  const block = `${begin}\nexport const ${domain.constName}: ${domain.recordType} = ${json};\n${end}`;
  const next = src.slice(0, bi) + block + src.slice(ei + end.length);
  writeFileSync(path, next, 'utf8');
}

async function run() {
  console.log(
    `Locale: ${locale} (${LOCALE_DESC[locale]})  ·  domains: ${domainNames.join(', ')}  ·  ${repair ? 'repair' : force ? 'force' : 'fill'}`,
  );
  for (const name of domainNames) {
    const domain = DOMAINS[name];
    if (!domain) {
      console.warn(`  ✗ unknown domain "${name}" — skipping`);
      continue;
    }
    if (renormalize) {
      const map = JSON.parse(JSON.stringify(domain.existing || {}));
      const changed = deepNormalizeLocale(map, locale);
      if (changed && !dryRun) persist(domain, map);
      console.log(
        `  ${name}: ${dryRun ? 'would normalize' : 'normalized'} ${changed} value(s) for ${locale}`,
      );
      continue;
    }
    const all = extract(domain);
    const pending = {};
    if (repair) {
      // re-translate only existing values that look truncated
      for (const [k, v] of Object.entries(all)) {
        const cur = getExisting(domain.existing, k, locale, domain);
        if (cur != null && isSuspectTruncation(v, cur)) pending[k] = v;
      }
    } else {
      for (const [k, v] of Object.entries(all)) {
        if (!force && hasExisting(domain.existing, k, locale, domain)) continue;
        pending[k] = v;
      }
    }
    const total = Object.keys(all).length;
    const todo = Object.keys(pending).length;
    if (!todo) {
      console.log(
        `  ${name}: ${repair ? 'no truncated values found' : 'nothing to translate'} (${total} strings)`,
      );
      continue;
    }
    console.log(
      `  ${name}: ${repair ? 're-translating' : 'translating'} ${todo}/${total} strings into ${locale}…`,
    );
    if (dryRun) {
      for (const k of Object.keys(pending)) {
        if (repair) {
          const cur = getExisting(domain.existing, k, locale, domain);
          console.log(
            `      • ${k}\n          en: ${String(all[k]).slice(0, 80).replace(/\n/g, '⏎')}\n          zh: ${String(cur).slice(0, 80).replace(/\n/g, '⏎')}`,
          );
        } else {
          console.log(`      • ${k}`);
        }
      }
      continue;
    }
    // deep-clone existing so we layer onto already-present locales
    const map = JSON.parse(JSON.stringify(domain.existing || {}));
    const batches = chunk(pending, batchSize);
    const runCount = Math.min(batches.length, maxBatches);
    if (runCount < batches.length)
      console.log(
        `    (processing ${runCount} of ${batches.length} batches this run; re-run to continue)`,
      );
    for (let i = 0; i < runCount; i++) {
      process.stdout.write(`    batch ${i + 1}/${batches.length}…`);
      let attempt = 0;
      while (true) {
        try {
          const result = await translateBatch(locale, batches[i], domain.hint);
          applyTranslations(map, result, locale, domain);
          persist(domain, map); // persist after EACH batch → resumable
          process.stdout.write(' ✓\n');
          break;
        } catch (err) {
          const detail = err.cause?.code || err.cause?.message || '';
          if (++attempt >= 3) {
            process.stdout.write(` ✗ ${err.message}${detail ? ' [' + detail + ']' : ''}\n`);
            break;
          }
          process.stdout.write(` retry ${attempt}…`);
          await new Promise((r) => setTimeout(r, 2000));
        }
      }
    }
    console.log(`  ✓ ${name} written → ${domain.overlayFile}`);
  }
  console.log('✓ Done.');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
