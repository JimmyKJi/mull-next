// Generator for the second-wave philosopher corpus. Reads compact
// shorthand entries with a partial dim signature, expands to a full
// 16-D vector (defaulting unspecified dims to 5), computes nearest
// archetype via cosine similarity against the canonical archetype
// targets, and emits formatted entries.
//
// Two output paths:
//
//   `--apply` (recommended)
//     Reads lib/philosophers.ts and public/mull.html, finds the
//     `BEGIN gen-philosophers Wave 2` / `END gen-philosophers Wave 2`
//     markers in each, and writes the new entries in place. One
//     command keeps both files in sync — no more Python splice
//     dance. Errors out if either file is missing its sentinels.
//
//   Legacy stdout modes (kept for ad-hoc inspection)
//     `node scripts/gen-philosophers.mjs`          → JSON to stdout
//     `node scripts/gen-philosophers.mjs lib`      → lib/philosophers.ts entries
//     `node scripts/gen-philosophers.mjs html`     → mull.html entries
//     `node scripts/gen-philosophers.mjs untagged` → tag-debug helper
//
// To add new philosophers: append to the ENTRIES array below, tag
// the tradition explicitly with `tr:` if the keyword inference would
// miss it, then run `node scripts/gen-philosophers.mjs --apply`.

import { loadArchetypeTargets } from './_load-archetype-targets.mjs';

const DIMS = ['TV','VA','WP','TR','TE','RT','MR','SR','CE','SS','PO','TD','AT','ES','UI','SI'];

// Pulled from lib/archetype-targets.ts via the shared loader. The
// canonical targets live there so they don't drift across the three
// places that need them (this script, the calibration sanity check,
// and the inline copy in public/mull.html).
const ARCHETYPES = await loadArchetypeTargets();

// Tradition baselines — characteristic 16-D dim signatures inherited
// by all philosophers in that tradition. Entry-level v: overrides
// these on a per-dim basis. Unset dims (after both layers) default
// to 5. This lets us hand-calibrate by tradition once, then nudge
// per philosopher rather than restating all 16 dims each time.
const TRADITION_BASELINES = {
  'pre-socratic':    { TV:5, VA:6, WP:5, TR:7, TE:6, RT:4, MR:4, SR:5, CE:4, SS:5, PO:5, TD:8, AT:4, ES:5, UI:5, SI:5 },
  'sophist':         { TV:5, VA:6, WP:6, TR:6, TE:7, RT:3, MR:2, SR:8, CE:5, SS:7, PO:7, TD:5, AT:3, ES:6, UI:3, SI:5 },
  'stoic':           { TV:7, VA:6, WP:3, TR:8, TE:6, RT:6, MR:3, SR:4, CE:6, SS:5, PO:9, TD:5, AT:8, ES:3, UI:7, SI:4 },
  'skeptic':         { TV:5, VA:6, WP:3, TR:5, TE:7, RT:3, MR:2, SR:10,CE:4, SS:6, PO:6, TD:5, AT:4, ES:5, UI:3, SI:5 },
  'epicurean':       { TV:3, VA:8, WP:4, TR:6, TE:8, RT:3, MR:1, SR:6, CE:6, SS:6, PO:8, TD:5, AT:3, ES:9, UI:4, SI:4 },
  'cynic':           { TV:5, VA:6, WP:7, TR:4, TE:7, RT:1, MR:2, SR:8, CE:2, SS:10,PO:8, TD:3, AT:8, ES:5, UI:5, SI:4 },
  'aristotelian':    { TV:4, VA:7, WP:4, TR:8, TE:8, RT:6, MR:2, SR:4, CE:7, SS:5, PO:8, TD:8, AT:5, ES:6, UI:6, SI:2 },
  'platonist':       { TV:5, VA:5, WP:5, TR:9, TE:3, RT:5, MR:6, SR:2, CE:5, SS:5, PO:5, TD:10,AT:6, ES:2, UI:9, SI:3 },
  'neoplatonist':    { TV:5, VA:5, WP:4, TR:8, TE:4, RT:7, MR:9, SR:3, CE:5, SS:5, PO:5, TD:9, AT:7, ES:3, UI:7, SI:6 },
  'patristic':       { TV:7, VA:5, WP:4, TR:7, TE:5, RT:8, MR:8, SR:3, CE:7, SS:4, PO:6, TD:7, AT:7, ES:3, UI:7, SI:4 },
  'scholastic':      { TV:5, VA:5, WP:4, TR:9, TE:6, RT:8, MR:5, SR:3, CE:6, SS:5, PO:6, TD:9, AT:6, ES:4, UI:7, SI:3 },
  'mystic-christian':{ TV:7, VA:6, WP:3, TR:5, TE:5, RT:7, MR:10,SR:3, CE:6, SS:5, PO:5, TD:6, AT:8, ES:4, UI:5, SI:6 },
  'kabbalist':       { TV:6, VA:6, WP:4, TR:6, TE:4, RT:8, MR:9, SR:3, CE:7, SS:4, PO:5, TD:8, AT:6, ES:4, UI:6, SI:5 },
  'sufi':            { TV:6, VA:7, WP:3, TR:5, TE:5, RT:7, MR:10,SR:3, CE:6, SS:5, PO:5, TD:6, AT:8, ES:4, UI:5, SI:6 },
  'islamic-falsafa': { TV:5, VA:6, WP:4, TR:8, TE:6, RT:7, MR:5, SR:4, CE:6, SS:5, PO:6, TD:9, AT:5, ES:4, UI:7, SI:3 },
  'vedanta-advaita': { TV:6, VA:5, WP:3, TR:6, TE:4, RT:7, MR:10,SR:4, CE:5, SS:5, PO:5, TD:8, AT:8, ES:3, UI:8, SI:9 },
  'vedanta-bhakti':  { TV:5, VA:8, WP:3, TR:4, TE:5, RT:8, MR:9, SR:3, CE:7, SS:5, PO:6, TD:5, AT:6, ES:6, UI:5, SI:5 },
  'buddhist-theravada':{ TV:8, VA:4, WP:2, TR:6, TE:7, RT:7, MR:7, SR:6, CE:5, SS:4, PO:7, TD:5, AT:9, ES:3, UI:7, SI:9 },
  'buddhist-mahayana': { TV:7, VA:5, WP:3, TR:5, TE:6, RT:6, MR:9, SR:5, CE:7, SS:3, PO:6, TD:6, AT:7, ES:3, UI:8, SI:9 },
  'buddhist-zen':    { TV:5, VA:7, WP:4, TR:3, TE:7, RT:4, MR:9, SR:7, CE:5, SS:7, PO:7, TD:3, AT:6, ES:6, UI:5, SI:9 },
  'buddhist-tibetan':{ TV:7, VA:5, WP:3, TR:5, TE:6, RT:8, MR:10,SR:4, CE:6, SS:4, PO:5, TD:7, AT:8, ES:4, UI:7, SI:9 },
  'jain':            { TV:7, VA:4, WP:2, TR:6, TE:6, RT:8, MR:7, SR:5, CE:5, SS:5, PO:5, TD:7, AT:10,ES:3, UI:8, SI:5 },
  'tantric':         { TV:5, VA:8, WP:5, TR:4, TE:6, RT:6, MR:9, SR:5, CE:5, SS:7, PO:5, TD:5, AT:5, ES:8, UI:5, SI:8 },
  'confucian':       { TV:4, VA:6, WP:3, TR:6, TE:7, RT:10,MR:3, SR:3, CE:10,SS:2, PO:9, TD:5, AT:6, ES:5, UI:5, SI:2 },
  'neo-confucian':   { TV:5, VA:6, WP:4, TR:8, TE:7, RT:8, MR:6, SR:4, CE:8, SS:3, PO:7, TD:8, AT:7, ES:4, UI:6, SI:4 },
  'daoist':          { TV:5, VA:7, WP:3, TR:3, TE:6, RT:5, MR:8, SR:6, CE:4, SS:6, PO:6, TD:4, AT:5, ES:6, UI:4, SI:7 },
  'legalist':        { TV:6, VA:5, WP:9, TR:7, TE:7, RT:5, MR:1, SR:6, CE:5, SS:4, PO:9, TD:4, AT:5, ES:5, UI:6, SI:3 },
  'mohist':          { TV:5, VA:5, WP:5, TR:7, TE:7, RT:4, MR:2, SR:5, CE:7, SS:4, PO:8, TD:5, AT:6, ES:4, UI:9, SI:3 },
  'rationalist':     { TV:4, VA:5, WP:5, TR:10,TE:3, RT:4, MR:3, SR:3, CE:4, SS:6, PO:5, TD:9, AT:5, ES:3, UI:7, SI:3 },
  'empiricist':      { TV:4, VA:6, WP:4, TR:5, TE:10,RT:4, MR:1, SR:8, CE:5, SS:6, PO:7, TD:5, AT:3, ES:7, UI:4, SI:5 },
  'idealist':        { TV:6, VA:5, WP:5, TR:8, TE:4, RT:6, MR:7, SR:3, CE:6, SS:6, PO:5, TD:10,AT:5, ES:3, UI:7, SI:4 },
  'utilitarian':     { TV:5, VA:6, WP:6, TR:7, TE:8, RT:3, MR:1, SR:6, CE:6, SS:6, PO:9, TD:6, AT:3, ES:5, UI:9, SI:3 },
  'social-contract': { TV:5, VA:6, WP:5, TR:7, TE:6, RT:5, MR:2, SR:5, CE:6, SS:6, PO:7, TD:6, AT:4, ES:4, UI:7, SI:3 },
  'romantic':        { TV:6, VA:8, WP:6, TR:4, TE:5, RT:5, MR:7, SR:4, CE:5, SS:8, PO:5, TD:6, AT:3, ES:7, UI:5, SI:4 },
  'transcendentalist':{TV:5, VA:7, WP:6, TR:5, TE:6, RT:3, MR:7, SR:5, CE:4, SS:9, PO:6, TD:6, AT:5, ES:6, UI:5, SI:4 },
  'existentialist':  { TV:8, VA:6, WP:5, TR:4, TE:6, RT:3, MR:4, SR:6, CE:4, SS:9, PO:6, TD:6, AT:4, ES:6, UI:4, SI:5 },
  'phenomenologist': { TV:5, VA:6, WP:4, TR:6, TE:7, RT:5, MR:5, SR:5, CE:6, SS:6, PO:6, TD:7, AT:4, ES:8, UI:5, SI:5 },
  'pragmatist':      { TV:4, VA:7, WP:5, TR:6, TE:8, RT:4, MR:3, SR:6, CE:6, SS:6, PO:9, TD:5, AT:3, ES:6, UI:5, SI:4 },
  'analytic':        { TV:4, VA:5, WP:4, TR:9, TE:7, RT:4, MR:2, SR:7, CE:4, SS:5, PO:6, TD:8, AT:4, ES:4, UI:6, SI:4 },
  'positivist':      { TV:3, VA:6, WP:5, TR:7, TE:9, RT:3, MR:1, SR:8, CE:5, SS:5, PO:8, TD:6, AT:3, ES:5, UI:6, SI:4 },
  'marxist':         { TV:6, VA:6, WP:8, TR:7, TE:7, RT:3, MR:1, SR:7, CE:7, SS:5, PO:7, TD:7, AT:4, ES:5, UI:6, SI:3 },
  'critical-theory': { TV:7, VA:5, WP:6, TR:7, TE:6, RT:3, MR:2, SR:8, CE:6, SS:5, PO:6, TD:8, AT:4, ES:5, UI:5, SI:4 },
  'anarchist':       { TV:6, VA:7, WP:7, TR:5, TE:6, RT:1, MR:3, SR:7, CE:5, SS:9, PO:6, TD:5, AT:4, ES:5, UI:5, SI:4 },
  'feminist':        { TV:6, VA:6, WP:6, TR:6, TE:6, RT:3, MR:3, SR:7, CE:6, SS:7, PO:6, TD:6, AT:4, ES:6, UI:6, SI:4 },
  'postmodern':      { TV:6, VA:6, WP:5, TR:4, TE:6, RT:2, MR:4, SR:9, CE:5, SS:6, PO:5, TD:6, AT:3, ES:6, UI:3, SI:7 },
  'process':         { TV:5, VA:7, WP:5, TR:7, TE:7, RT:5, MR:7, SR:5, CE:6, SS:5, PO:5, TD:8, AT:4, ES:5, UI:6, SI:5 },
  'african-ubuntu':  { TV:5, VA:6, WP:5, TR:5, TE:6, RT:7, MR:5, SR:5, CE:9, SS:3, PO:7, TD:5, AT:5, ES:6, UI:5, SI:3 },
  'indigenous':      { TV:5, VA:7, WP:4, TR:4, TE:7, RT:8, MR:6, SR:4, CE:8, SS:4, PO:7, TD:4, AT:5, ES:7, UI:4, SI:4 },
  'postcolonial':    { TV:7, VA:5, WP:6, TR:6, TE:7, RT:4, MR:3, SR:8, CE:7, SS:5, PO:6, TD:6, AT:4, ES:5, UI:5, SI:4 },
  'liberation':      { TV:6, VA:6, WP:7, TR:6, TE:7, RT:4, MR:3, SR:7, CE:7, SS:5, PO:7, TD:5, AT:4, ES:5, UI:6, SI:3 },
  'natural-philosophy':{ TV:4, VA:6, WP:5, TR:9, TE:9, RT:4, MR:3, SR:5, CE:4, SS:5, PO:6, TD:8, AT:4, ES:4, UI:6, SI:3 },
  'cognitive-science':{ TV:4, VA:5, WP:4, TR:7, TE:9, RT:3, MR:3, SR:6, CE:5, SS:5, PO:6, TD:7, AT:3, ES:6, UI:5, SI:6 },
  'longtermist':     { TV:5, VA:5, WP:5, TR:8, TE:7, RT:4, MR:2, SR:6, CE:6, SS:5, PO:6, TD:7, AT:5, ES:4, UI:8, SI:4 },
  'virtue-ethics':   { TV:5, VA:6, WP:4, TR:7, TE:7, RT:8, MR:3, SR:4, CE:7, SS:5, PO:7, TD:7, AT:6, ES:5, UI:6, SI:3 },
  'kantian':         { TV:4, VA:5, WP:4, TR:10,TE:5, RT:5, MR:3, SR:4, CE:5, SS:7, PO:6, TD:8, AT:5, ES:3, UI:10,SI:3 },
  'mystical-cross-tradition': { TV:6, VA:6, WP:3, TR:5, TE:5, RT:6, MR:10,SR:4, CE:5, SS:5, PO:5, TD:6, AT:7, ES:5, UI:6, SI:6 },
  'naturalist':      { TV:4, VA:6, WP:5, TR:7, TE:9, RT:4, MR:2, SR:7, CE:5, SS:5, PO:7, TD:7, AT:4, ES:6, UI:5, SI:5 },
};

// Keyword-driven tradition inference. Checked in order; first match wins.
const TRADITION_PATTERNS = [
  ['buddhist-zen',   /\bzen\b|rinzai|\bs[ōo]t[ōo]\b|koan|d[oō]gen|hakuin|bankei|ikkyu|linji|wonhyo|jinul|chinul|aitken|shunryu|toni packer|pema|joanna macy/i],
  ['buddhist-tibetan',/\btibetan\b|dzogchen|milarepa|atisha|longchenpa|tsongkhapa|padmasambhava|dalai lama|patrul/i],
  ['buddhist-mahayana',/\b(huayan|tiantai|yog[āa]c[āa]ra|madhyamaka|m[āa]dhyamaka|emptiness|n[āa]g[āa]rjuna|asanga|vasubandhu|dharmakirti|dignaga)/i],
  ['buddhist-theravada',/\b(theravada|abhidhamma|visuddhimagga|buddhaghosa)/i],
  ['vedanta-advaita',/\b(advaita|non-?dual|atman is brahman|sa[ṅn]kara|adi shankara|ramana|nisargadatta|ramakrishna|vivekananda|sri aurobindo)/i],
  ['vedanta-bhakti', /\b(bhakti|krishna|mirabai|chaitanya|ramanuja|madhva|kabir|lal[ -]?ded|lalleshwari)/i],
  ['jain',           /\b(jain|mahavira|anekantavada)/i],
  ['tantric',        /\btantra|kashmiri shaivite|sahaja|tantric/i],
  ['sufi',           /\bsufi|rumi|hallaj|rabia|junayd|ibn arabi|sufism/i],
  ['kabbalist',      /\bkabbal|luria|sefirot|ein sof|hasid|baal shem|heschel/i],
  ['islamic-falsafa',/\bibn (sina|rushd|tufayl|bajja|khaldun|gabirol)|al-(farabi|ghazali|kindi|razi|biruni|jahiz)|mulla sadra|suhrawardi|iqbal|nasr|shariati/i],
  ['mystic-christian',/\b(meister eckhart|hildegard|julian of norwich|catherine of siena|teresa|john of the cross|porete|hadewijch|mechthild|bonaventure|bernard of clairvaux|nicholas of cusa|cusanus|pseudo-?dionysius)/i],
  ['scholastic',     /\b(aquinas|anselm|abelard|albertus|duns scotus|ockham|maimonides|scholastic)/i],
  ['patristic',      /\b(origen|gregory of nyssa|maximus the confessor|eriugena|augustin|macrina)/i],
  ['neoplatonist',   /\b(plotinus|porphyry|iamblichus|proclus|hypatia|damascius|ficino|neoplaton)/i],
  ['platonist',      /\b(form of beauty|form of the good|forms[, ]|platonic|plato'?s)/i],
  ['stoic',          /\b(stoic|epictetus|marcus aurelius|seneca|chrysippus|cleanthes|musonius|posidonius|hierocles)/i],
  ['epicurean',      /\b(epicur|lucretius|pleasure as|pleasure of)/i],
  ['cynic',          /\b(cynic|diogenes of sinope|antisthenes)/i],
  ['skeptic',        /\b(skeptic|skeptical|pyrrho|sextus|carneades|arcesilaus|aenesidemus|montaigne)/i],
  ['sophist',        /\bsophist|gorgias|protagoras|prodicus|hippias/i],
  ['aristotelian',   /\baristot|peripatetic|hylomorph|phronesis/i],
  ['neo-confucian',  /\b(neo-?confuc|zhu xi|wang yangming|cheng yi|cheng hao|wang fuzhi|dai zhen|mou zongsan|tu weiming|liang shuming|kang youwei|li zehou|new confuc|investigation of things)/i],
  ['confucian',      /\b(confuc|mencius|xunzi|filial|ban zhao|han yu|ren \(humaneness\))/i],
  ['daoist',         /\b(daoist|taoist|laozi|zhuangzi|liezi|wang bi|guo xiang|ziran|wu wei|naturalness)/i],
  ['legalist',       /\b(legalist|han fei|shang yang)/i],
  ['mohist',         /\b(mohist|mozi|impartial care)/i],
  ['pre-socratic',   /\b(pre-?socratic|heraclit|parmenid|anaxim|empedocles|anaxagoras|democrit|leucippus|xenophanes|zeno of elea|atomis|boundless|apeiron)/i],
  ['kantian',        /\b(kant\b|categorical imperative|noumen|transcendental idealism)/i],
  ['rationalist',    /\b(rationalist|descartes|spinoza|leibniz|geometric (?:method|order))/i],
  ['empiricist',     /\b(empiric|locke|hume|berkeley|bacon|induction)/i],
  ['idealist',       /\b(idealis|hegel|fichte|schelling|absolute spirit|bradley|t\.h\. green|hartshorne)/i],
  ['utilitarian',    /\b(utilitarian|bentham|greatest happiness|consequential|peter singer|effective altruism)/i],
  ['longtermist',    /\b(longtermism|existential risk|bostrom|toby ord|macaskill|future of humanity|precipice)/i],
  ['social-contract',/\b(social contract|state of nature|leviathan|veil of ignorance|rawls|grotius|pufendorf|nozick)/i],
  ['romantic',       /\b(romantic|schlegel|novalis|sta[ëe]l|m[üu]ller|hymns to the night|fragment as freedom)/i],
  ['transcendentalist',/\b(transcendentalist|emerson|thoreau|self-reliance|walden|margaret fuller)/i],
  ['existentialist', /\b(existentialis|sartre|de beauvoir|jaspers|berdyaev|absurd|radical freedom|kierkegaard|shestov)/i],
  ['phenomenologist',/\b(phenomenolog|husserl|merleau-?ponty|heidegger|levinas|edith stein|enactivis|embodied perception)/i],
  ['pragmatist',     /\b(pragmatis|dewey|peirce|william james|rorty|putnam|mead)/i],
  ['analytic',       /\b(analytic|frege|russell|wittgenstein|quine|davidson|kripke|lewis|williamson|dummett|sellars|brandom|mcdowell|kit fine|ramsey)/i],
  ['positivist',     /\b(positivis|vienna circle|carnap|schlick|ayer|neurath|verification)/i],
  ['marxist',        /\bmarx|capital|class struggle|luxemburg|gramsci|labour theory|alienation/i],
  ['critical-theory',/\b(adorno|horkheimer|frankfurt school|habermas|critical theory|benjamin|marcuse|negative dialectic)/i],
  ['anarchist',      /\banarch|bakunin|kropotkin|stirner|godwin|emma goldman/i],
  ['feminist',       /\bfemin|wollstonecraft|olympe de gouges|harriet taylor|catharine|gender|patriarchy|second sex|differen(?:t|ce) voice/i],
  ['postcolonial',   /\b(postcolon|fanon|césaire|cesaire|c[ée]saire|c\.l\.r\.|edward said|orientalis|gilroy|spivak|biko|rodney|achille mbembe)/i],
  ['liberation',     /\b(liberation|dussel|mariátegui|mariategui|paulo freire|las casas|enrique dussel|vine deloria|kimmerer|leanne|coulthard|simpson)/i],
  ['african-ubuntu', /\bubuntu|mbiti|wiredu|hountondji|ramose|menkiti|som[éa]|sobonfu|malidoma|oy[ěe]w[uù]m[íi]|nzegwu/i],
  ['postmodern',     /\b(postmodern|foucault|derrida|deleuze|lyotard|baudrillard|kristeva|cixous|irigaray|butler|haraway|sedgwick|berlant|mu[ñn]oz)/i],
  ['indigenous',     /\b(indigenous|amerindian|nishnaabeg|m[āa]ori|aboriginal|first nations|kimmerer|coulthard|simpson)/i],
  ['mystical-cross-tradition',/\b(perennial|guénon|guenon|schuon|coomaraswamy|krishnamurti|nasr|simone weil)/i],
  ['process',        /\b(whitehead|process (?:theology|philosophy)|hartshorne|prigogine|stuart kauffman)/i],
  ['virtue-ethics',  /\b(virtue ethic|anscombe|foot|murdoch|macintyre|after virtue|hursthouse)/i],
  ['cognitive-science',/\b(neurophilosoph|cognitive science|free energy|predictive coding|extended mind|enactivism|panpsych|hard problem|consciousness explained|damasio|seth)/i],
  ['natural-philosophy',/\b(natural philosoph|newton|galile|kepler|boyle|laplace|gauss|riemann|darwin|wallace|mendel|huygens|lavoisier|einstein|bohr|heisenberg|schr[öo]dinger|pauli|g[öo]del|turing|shannon|wiener|prigogine|margulis|fris[t]?on)/i],
  ['naturalist',     /\b(naturali[zs]ed|biosemantics|millikan|haack|flanagan|de waal|edward o\. wilson|s\.j\. gould|d\.s\. wilson)/i],

  // Long-tail patterns — catch the historical figures whose key-idea
  // text doesn't carry a thick tradition keyword. Order still matters.
  ['pre-socratic',   /\b(atomism|apeiron|leucippus|democritus|anaximander|anaximenes|empedocles|cheerful tranquility)/i],
  ['neoplatonist',   /\b(cambridge platonist|cudworth|henry more|spirit of nature|plastic nature|christian platonism)/i],
  ['scholastic',     /\b(victorine|hugh of saint|ramon llull|ars magna|peter abelard|conceptualism|allegorical reading|allegorical exegesis|consolation of philosophy|albertus magnus|grammar of assent|newman)/i],
  ['kabbalist',      /\b(duties of the heart|kuzari|jewish particularity|isaac luria|bahya|judah halevi|baruch|hasdai crescas)/i],
  ['mystic-christian',/\b(macrina|hilda|hugh of st|hugh of saint|simone weil|edith wyschogrod)/i],
  ['romantic',       /\b(goethe|schleiermacher|alexander von humboldt|wilhelm von humboldt|adam m[üu]ller|polarity and intensification|enthusiasm as|tropic|bildung)/i],
  ['existentialist', /\b(tolstoy|dostoevsky|solovyov|berdyaev|shestov|florensky|bulgakov|bakhtin|russian religious|absurd faith|grand inquisitor|sergei bulgakov|pavel florensky|mikhail bakhtin)/i],
  ['utilitarian',    /\b(jeremy bentham|moral sense|francis hutcheson|shaftesbury|adam smith|impartial spectator|theory of moral sentiments|moral sentiments)/i],
  ['empiricist',     /\b(common sense school|thomas reid|dugald stewart|scottish enlightenment|mandeville|fable of the bees|joseph butler|maine de biran|conscience as|effort and willing)/i],
  ['liberation',     /\b(condorcet|tom paine|rights of man|joseph priestley|godwin|political justice|abolition|popular lectures|frances wright|sojourner truth|abolitionist|harriet martineau|illustrations of political economy|olympe de gouges|charlotte perkins gilman|emma goldman|rosa mayreder|catharine macaulay|ida b\. wells|anna julia cooper|edith stein|sora juana|sor juana)/i],
  ['analytic',       /\b(stuart hampshire|cora diamond|talbot brewer|sarah buss|tamar schapiro|talia mae|jeff mcmahan|helen frowe|david velleman|owen flanagan|ruth millikan|jenann ismael|frank jackson|crispin wright|timothy williamson|kit fine|david lewis|saul kripke|hilary putnam|wilfrid sellars|robert brandom|john mcdowell|jaakko hintikka|frank ramsey|bernard bolzano|gottlob frege|kurt g[öo]del|alfred tarski|alonzo church|alan turing|norbert wiener|claude shannon|otto neurath|rudolf carnap|moritz schlick|a\.j\. ayer|gilbert ryle|p\.f\. strawson|michael dummett|donald davidson|peter singer|derek parfit|david chalmers|galen strawson|agnes callard|kieran setiya|susan wolf|cheshire calhoun|miranda fricker|rae langton|linda zagzebski|sally haslanger|charles mills|tommie shelby|adrian piper)/i],
  ['critical-theory',/\b(walter benjamin|alain badiou|jacques ranci[èe]re|étienne balibar|catherine malabou|bernard stiegler|jean-luc nancy|quentin meillassoux|after finitude|technics and time|max weber|émile durkheim|vilfredo pareto|disenchant|protestant ethic|sociology of)/i],
  ['postmodern',     /\b(roland barthes|maurice blanchot|jab[èe]s|julia kristeva|hélène cixous|luce irigaray|sara ahmed|lauren berlant|eve kosofsky|sedgwick|jos[ée] esteban|abjection|écriture|trans philosophy)/i],
  ['cognitive-science',/\b(andy clark|alva no[ëe]|evan thompson|francisco varela|nick bostrom|toby ord|macaskill|hilary greaves|jay garfield|owen flanagan|ruth millikan|jenann ismael|antonio damasio|anil seth|karl friston|patricia churchland|extended mind|enactivis|panpsychism|hard problem)/i],
  ['natural-philosophy',/\b(isaac newton|robert boyle|christiaan huygens|antoine lavoisier|pierre-simon laplace|carl friedrich gauss|bernhard riemann|charles darwin|alfred russel wallace|gregor mendel|henri poincar[ée]|pierre duhem|albert einstein|niels bohr|werner heisenberg|erwin schr[öo]dinger|wolfgang pauli|sigmund freud|wilhelm wundt|edward o\.? wilson|stephen jay gould|lynn margulis|stuart kauffman|ilya prigogine|frans de waal|iain mcgilchrist)/i],
  ['process',        /\b(charles hartshorne|process theology|alfred north whitehead|david bohm|wholeness and the implicate|david ray griffin)/i],
  ['feminist',       /\b(sappho|aspasia|diotima|themistoclea|macrina|hadewijch|mechthild|christine de pizan|sor juana|wollstonecraft|harriet|charlotte perkins|anna julia|sojourner|emma goldman|edith stein|rachel bespaloff|gertrude stein|susanne langer|mary calkins|l\.? susan stebbing|ruth barcan|philippa foot|iris murdoch|anscombe|mary midgley|mary warnock|christine korsgaard|carol gilligan|nel noddings|annette baier|onora|hilde lindemann|sara ruddick|gloria anzald[uú]a|maria lugones|linda mart[íi]n|catharine mackinnon|drucilla cornell|julia kristeva|hélène cixous|luce irigaray|sara ahmed|lauren berlant|eve kosofsky|sedgwick|donna haraway|martha nussbaum|judith butler|isabelle stengers|karen barad|anna tsing|edith wyschogrod)/i],
  ['liberation',     /\b(c\.l\.r\. james|aim[ée] c[ée]saire|suzanne c[ée]saire|cheikh anta|enrique dussel|mariátegui|mariategui|paulo freire|w\.e\.b\. du bois|cornel west|kwame anthony appiah|fanon|biko|walter rodney|bell hooks|audre lorde|angela davis|stuart hall|sylvia wynter|gayatri spivak|edward said|aníbal quijano|walter mignolo|paul gilroy|achille mbembe|charles mills|tommie shelby|adrian piper|anna julia|bartolomé de las casas|las casas)/i],
  ['indigenous',     /\b(linda tuhiwai|robin wall kimmerer|leanne|coulthard|simpson|nishnaabeg|vine deloria|braiding sweetgrass|red skin)/i],
  ['neo-confucian',  /\b(dai zhen|wang fuzhi|kang youwei|liang shuming|tu weiming|li zehou|wang hui)/i],
  ['islamic-falsafa',/\b(muhammad iqbal|reconstruction of religious thought|tariq ramadan|seyyed hossein nasr|fazlur rahman|al-razi|rhazes|al-biruni|al-jahiz)/i],
  ['daoist',         /\bwang bi|guo xiang|liezi|tao\b/i],
  ['anarchist',      /\b(blanqui|revolutionary by trade|wright \(political|emma goldman)/i],
];

function inferTradition(entry) {
  const text = `${entry.n} | ${entry.i || ''} | ${entry.d || ''}`;
  for (const [tag, re] of TRADITION_PATTERNS) {
    if (re.test(text)) return tag;
  }
  return null;
}

function expand(dimObj, traditionTag) {
  const base = traditionTag ? TRADITION_BASELINES[traditionTag] : null;
  return DIMS.map(d => {
    if (dimObj[d] !== undefined) return dimObj[d];
    if (base && base[d] !== undefined) return base[d];
    return 5;
  });
}

// Auto-aliases from name parsing: first word, last word (skipping
// trailing particles), parenthetical aliases ("Ibn Rushd (Averroes)"
// → "Averroes"), and "X of Y" → "X". Skips honorifics like Sri / Saint.
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
    // Skip honorifics AND particles. Honorifics are titles ("Sri",
    // "Saint"); particles are connective words like "Ibn" or "de"
    // that aren't real first names — adding them as standalone
    // aliases creates noisy search collisions (typing "Ibn" would
    // match every Ibn___ entry without helping disambiguate).
    while (firstIdx < words.length &&
           (HONORIFICS.has(words[firstIdx].toLowerCase()) ||
            PARTICLES.has(words[firstIdx].toLowerCase()))) firstIdx++;
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

function cos(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < 16; i++) { dot += a[i]*b[i]; na += a[i]*a[i]; nb += b[i]*b[i]; }
  return na && nb ? dot / Math.sqrt(na * nb) : 0;
}
function nearestArchetype(vec) {
  let best = null, bestSim = -Infinity;
  for (const a of ARCHETYPES) {
    const av = expand(a.p);
    const s = cos(vec, av);
    if (s > bestSim) { bestSim = s; best = a; }
  }
  return best;
}

// Each entry: { n: name, d: dates, i: keyIdea, v: { dim: value, ... } }
// Unspecified dims default to 5. Vectors use 0-10 scale.
const ENTRIES = [
  // ─── ANCIENT & HELLENISTIC GAPS ──────────────────────────────────
  { n:`Anaximander`, d:`~610–546 BCE`, i:`The boundless (apeiron) is the source of all things — pre-Socratic first physics.`, v:{TR:7,TE:6,TD:8,MR:5,SI:4} },
  { n:`Anaximenes`, d:`~586–526 BCE`, i:`Air is the underlying substance, condensing and rarefying into all phenomena.`, v:{TR:6,TE:7,TD:6,ES:5} },
  { n:`Xenophanes`, d:`~570–478 BCE`, i:`Skepticism toward anthropomorphic gods; truth as approximation, not certainty.`, v:{TR:6,SR:8,UI:6,MR:3} },
  { n:`Zeno of Elea`, d:`~490–430 BCE`, i:`Paradoxes of motion — reason undermines the senses; reality is one and unchanging.`, v:{TR:9,TD:8,TE:2,SR:6,SI:5} },
  { n:`Anaxagoras`, d:`~500–428 BCE`, i:`Nous (mind) orders an infinite mixture of seeds into a cosmos.`, v:{TR:7,TD:8,MR:5,UI:6} },
  { n:`Leucippus`, d:`~5th c. BCE`, i:`First atomist — reality is void plus indivisible atoms in motion.`, v:{TR:7,TE:8,TD:7,SI:5,MR:1} },
  { n:`Democritus`, d:`~460–370 BCE`, i:`Atomism + cheerful tranquility; nothing exists but atoms and void.`, v:{TR:7,TE:8,VA:7,SR:6,SI:5,MR:1} },
  { n:`Gorgias`, d:`~483–375 BCE`, i:`Nothing exists; if it did, it could not be known; if known, not communicated.`, v:{SR:9,SS:6,SI:7,MR:3,UI:2} },
  { n:`Antisthenes`, d:`~445–365 BCE`, i:`Virtue alone suffices for happiness — Cynic forerunner, friend of Socrates.`, v:{AT:9,SS:8,RT:3,VA:5,PO:6} },
  { n:`Cleanthes`, d:`~330–230 BCE`, i:`Hymn to Zeus; Stoic providence and assent to cosmic order.`, v:{RT:7,TR:7,MR:6,PO:7,UI:7,AT:7} },
  { n:`Chrysippus`, d:`~279–206 BCE`, i:`Second founder of Stoicism — propositional logic, fate, and assent.`, v:{TR:9,RT:6,TD:8,UI:7,PO:6} },
  { n:`Posidonius`, d:`~135–51 BCE`, i:`Middle Stoic synthesizer — astronomy, geography, sympathetic cosmos.`, v:{TR:7,TE:7,TD:7,UI:6,PO:6,MR:4} },
  { n:`Musonius Rufus`, d:`~25–95`, i:`Stoic teacher of Epictetus — women equally capable of philosophy.`, v:{AT:8,UI:8,PO:8,RT:6,SS:5} },
  { n:`Hierocles the Stoic`, d:`2nd c.`, i:`Oikeiōsis — concentric circles of moral concern radiating outward.`, v:{UI:8,CE:7,PO:7,RT:6} },
  { n:`Arcesilaus`, d:`~316–241 BCE`, i:`Founder of Academic skepticism — suspend judgment; live by probability.`, v:{SR:9,TR:5,SS:6,MR:2} },
  { n:`Carneades`, d:`~214–129 BCE`, i:`Pithanon — the persuasive — as guide where certainty fails.`, v:{SR:9,PO:6,TR:5,SI:4} },
  { n:`Aenesidemus`, d:`1st c. BCE`, i:`Revived Pyrrhonism — the ten tropes against dogmatic claims.`, v:{SR:10,SI:5,MR:3,TR:3} },
  { n:`Philo of Alexandria`, d:`~20 BCE–50 CE`, i:`Allegorical reading; bridges Jewish scripture and Greek philosophy.`, v:{MR:8,RT:7,TR:6,UI:6,TD:6} },
  { n:`Plotinus`, d:`204–270`, i:`The One overflows into Intellect, Soul, and Nature — Neoplatonic mysticism.`, v:{MR:10,TD:9,TR:7,AT:7,SI:6,UI:7} },
  { n:`Porphyry`, d:`~234–305`, i:`Editor of Plotinus; Isagoge framed medieval logic for a thousand years.`, v:{TR:8,TD:8,RT:7,MR:6} },
  { n:`Iamblichus`, d:`~245–325`, i:`Theurgy — ritual practice as the soul's ascent to the divine.`, v:{MR:9,RT:8,AT:7,TD:6,ES:3} },
  { n:`Proclus`, d:`412–485`, i:`Systematic Neoplatonism — every cause overflows itself; reality is graded triads.`, v:{TR:8,TD:10,MR:8,UI:8} },
  { n:`Hypatia`, d:`~360–415`, i:`Alexandrian mathematician and Neoplatonist; pagan martyr at Christian hands.`, v:{TR:9,TD:9,UI:7,MR:6,SS:7,AT:6} },
  { n:`Damascius`, d:`~458–538`, i:`Last head of the Athenian Academy — the Ineffable beyond even the One.`, v:{MR:10,TD:9,SI:7,AT:7,UI:6} },
  { n:`Boethius`, d:`~480–524`, i:`Consolation of Philosophy — fortune's wheel turned in a death cell.`, v:{TV:8,RT:7,TR:7,MR:6,AT:7,UI:7} },
  { n:`Cicero`, d:`106–43 BCE`, tr:'stoic', i:`Eclectic synthesizer — duty, friendship, and the just commonwealth.`, v:{TR:7,PO:8,UI:7,RT:7,CE:6,WP:5} },
  { n:`Plutarch`, d:`~46–119`, tr:'stoic', i:`Lives in parallel — character revealed through moral comparison.`, v:{RT:7,CE:6,PO:7,VA:6,MR:5} },
  { n:`Lucian of Samosata`, d:`~125–180`, tr:'skeptic', i:`Satirist of dogma — laughter as a corrosive on pretension.`, v:{SR:9,VA:6,SS:7,SI:5} },
  { n:`Marcus Tullius Varro`, d:`116–27 BCE`, tr:'stoic', i:`Encyclopedist — three hundred theologies catalogued before judgment.`, v:{TR:6,RT:7,SR:6,TD:7} },
  { n:`Sextus Empiricus the Younger`, d:`2nd–3rd c.`, i:`Outlines of Pyrrhonism — full inventory of the skeptical method.`, v:{SR:10,TE:7,SI:5,MR:2} },

  // ─── PATRISTIC & MEDIEVAL ────────────────────────────────────────
  { n:`Origen`, d:`~185–254`, i:`Allegorical exegesis and apokatastasis — even the devil eventually saved.`, v:{MR:8,TR:7,UI:7,RT:7,TD:7,AT:7} },
  { n:`Gregory of Nyssa`, d:`~335–395`, i:`Epektasis — infinite progress toward God; never arrival, always reaching.`, v:{MR:9,TV:6,AT:7,RT:7,UI:7} },
  { n:`Pseudo-Dionysius`, d:`~5th–6th c.`, i:`Apophatic theology — what God is not, the only honest path.`, v:{MR:10,SI:7,TD:7,AT:7,UI:5} },
  { n:`Maximus the Confessor`, d:`~580–662`, i:`Cosmic liturgy — Christ as the recapitulation of all logoi.`, v:{MR:9,RT:8,UI:7,TD:7,AT:7} },
  { n:`John Scotus Eriugena`, d:`~815–877`, i:`Periphyseon — God as the unfolding nature that creates itself.`, v:{MR:9,TD:9,UI:7,SI:5} },
  { n:`Bonaventure`, d:`1221–1274`, i:`Itinerarium — the soul's journey through nature to God's depths.`, v:{MR:8,RT:8,TD:7,AT:7,UI:6} },
  { n:`Avicebron (Ibn Gabirol)`, d:`~1021–1058`, i:`Fons Vitae — universal matter and form even in spiritual substances.`, v:{TR:7,TD:8,MR:7,RT:6} },
  { n:`Peter Abelard`, d:`1079–1142`, i:`Conceptualism — universals as concepts in the mind, neither things nor names.`, v:{TR:8,SS:7,SR:6,WP:6} },
  { n:`Heloise of Argenteuil`, d:`~1098–1164`, i:`Letters to Abelard — love as the truest motive, not law or duty.`, v:{VA:7,SS:8,ES:6,SR:5} },
  { n:`Anselm of Canterbury`, d:`1033–1109`, i:`Faith seeking understanding; the ontological argument from definition.`, v:{TR:9,RT:8,MR:6,TD:8,UI:7} },
  { n:`Albertus Magnus`, d:`~1200–1280`, i:`Aristotle baptized — natural philosophy as a path to divine wisdom.`, v:{TR:7,TE:7,RT:7,TD:7,UI:6} },
  { n:`Duns Scotus`, d:`~1266–1308`, i:`Univocity of being; haecceitas — the "thisness" that individuates.`, v:{TR:9,TD:9,RT:7,MR:5,SS:5} },
  { n:`Catherine of Siena`, d:`1347–1380`, i:`Mystic activist — the bridge of Christ; political letters to popes.`, v:{MR:9,RT:8,WP:6,AT:7,CE:7,UI:6} },
  { n:`Julian of Norwich`, d:`~1342–1416`, i:`All shall be well — Showings of divine love beyond suffering.`, v:{MR:9,VA:7,TV:7,RT:7,CE:5} },
  { n:`Marguerite Porete`, d:`~1250–1310`, i:`Mirror of Simple Souls — the soul annihilated into divine love.`, v:{MR:10,SI:8,AT:8,SS:7,VA:5} },
  { n:`Christine de Pizan`, d:`1364–1430`, i:`City of Ladies — virtue is not gendered; reason is the common ground.`, v:{UI:8,WP:6,TR:7,CE:6,SS:6} },
  { n:`Marsilius of Padua`, d:`~1275–1342`, tr:'social-contract', i:`Defender of the Peace — secular sovereignty over spiritual authority.`, v:{WP:7,UI:7,PO:7,SR:6,TR:6} },
  { n:`Nicholas of Cusa`, d:`1401–1464`, i:`Learned ignorance — the coincidence of opposites in the infinite.`, v:{MR:8,TD:9,TR:7,SI:6,UI:7} },
  { n:`Marsilio Ficino`, d:`1433–1499`, i:`Renaissance Neoplatonism — soul as the bond between God and matter.`, v:{MR:8,TD:8,RT:6,UI:6,ES:4} },
  { n:`Pico della Mirandola`, d:`1463–1494`, tr:'platonist', i:`Oration on the Dignity of Man — self-fashioning as the human birthright.`, v:{SS:8,WP:7,TR:7,UI:7,VA:6} },
  { n:`Pietro Pomponazzi`, d:`1462–1525`, tr:'aristotelian', i:`Mortality of the soul — virtue worth pursuing for its own sake.`, v:{TR:6,TE:7,SR:7,SS:6,AT:5} },
  { n:`Giordano Bruno`, d:`1548–1600`, tr:'neoplatonist', i:`Infinite worlds; the cosmos as living unity — burned for it.`, v:{MR:7,WP:7,SS:8,TD:8,TV:6} },
  { n:`Tommaso Campanella`, d:`1568–1639`, tr:'platonist', i:`City of the Sun — utopian republic governed by knowledge.`, v:{TR:6,UI:7,CE:7,WP:6,TD:6} },
  { n:`Lorenzo Valla`, d:`~1407–1457`, tr:'skeptic', i:`Philological criticism — the Donation of Constantine exposed as forgery.`, v:{SR:8,TR:7,SS:6,RT:3} },
  { n:`Erasmus of Rotterdam`, d:`~1466–1536`, tr:'scholastic', i:`Praise of Folly — Christian humanism, free will against Luther.`, v:{SR:7,RT:6,CE:6,UI:6,SS:5} },
  { n:`Hadewijch of Antwerp`, d:`~13th c.`, i:`Beguine mystic — the storm of love (minne) as God's own life.`, v:{MR:9,VA:6,ES:5,SS:6,AT:6} },
  { n:`Mechthild of Magdeburg`, d:`~1207–1282`, i:`Flowing Light of the Godhead — bridal mysticism in vernacular German.`, v:{MR:9,ES:5,VA:6,RT:6} },
  { n:`Hugh of Saint Victor`, d:`~1096–1141`, i:`Three eyes — flesh, reason, and contemplation each seeing differently.`, v:{MR:7,TR:7,RT:7,TD:6,AT:6} },
  { n:`Bernard of Clairvaux`, d:`1090–1153`, i:`Love of God in four ascending degrees; mysticism of the will.`, v:{MR:8,VA:6,RT:8,AT:7,CE:6} },
  { n:`Ramon Llull`, d:`~1232–1316`, i:`Ars Magna — combinatorial logic to convert through reason alone.`, v:{TR:8,TD:9,RT:6,UI:6,WP:5} },

  // ─── ISLAMIC, INDIAN, CHINESE EXPANSION ──────────────────────────
  { n:`Al-Razi (Rhazes)`, d:`~865–925`, i:`Naturalism and skepticism — five eternal principles, prophecy unnecessary.`, v:{TR:7,TE:8,SR:8,SS:7,RT:2,MR:2} },
  { n:`Al-Biruni`, d:`973–1048`, i:`India — comparative method without polemic; honest description first.`, v:{TR:7,TE:8,SR:7,UI:7,CE:5} },
  { n:`Ibn Bajja (Avempace)`, d:`~1085–1138`, i:`The solitary intellectual — virtue cultivated against degraded society.`, v:{TR:8,SS:8,AT:6,TD:7,CE:3} },
  { n:`Ibn Khaldun`, d:`1332–1406`, i:`Muqaddimah — asabiyyah (social cohesion) as the engine of dynastic cycles.`, v:{TE:8,SR:7,CE:7,TD:7,UI:6,PO:7} },
  { n:`Suhrawardi`, d:`1154–1191`, i:`Illuminationist philosophy — light as the metaphysical primitive.`, v:{MR:9,TD:8,TR:6,SI:6} },
  { n:`Al-Jahiz`, d:`~776–869`, i:`Book of Animals — early observations on adaptation, sociology of speech.`, v:{TE:8,SR:7,VA:6,ES:5,TD:6} },
  { n:`Rabia al-Adawiyya`, d:`~717–801`, i:`Sufi love of God for God's own sake — neither heaven sought nor hell feared.`, v:{MR:10,VA:6,AT:8,SS:6,SI:5} },
  { n:`Mansur al-Hallaj`, d:`~858–922`, i:`"I am the Truth" — annihilation in God; executed for the saying.`, v:{MR:10,SS:7,SI:7,AT:8,TV:6} },
  { n:`Junayd of Baghdad`, d:`~830–910`, i:`Sober Sufism — return to the world after fana, carrying knowledge of unity.`, v:{MR:9,RT:7,AT:7,CE:6,SI:6} },
  { n:`Bahya ibn Paquda`, d:`~1050–1120`, i:`Duties of the Heart — inner intention as the heart of Jewish piety.`, v:{MR:7,RT:8,AT:7,CE:6,UI:5} },
  { n:`Judah Halevi`, d:`~1075–1141`, i:`Kuzari — Jewish particularity over universal philosophy.`, v:{RT:9,CE:7,MR:6,UI:3} },
  { n:`Hasdai Crescas`, d:`~1340–1410`, i:`Critique of Aristotle — divine love as primary, the will as free.`, v:{TR:6,MR:7,RT:7,VA:6} },
  { n:`Isaac Luria`, d:`1534–1572`, i:`Lurianic Kabbalah — divine contraction, the shattering, and repair (tikkun).`, v:{MR:10,TD:8,RT:8,UI:6,SI:6} },
  { n:`Mulla Sadra`, d:`~1571–1640`, i:`Transcendent Theosophy — existence precedes essence; reality moves.`, v:{MR:9,TR:7,TD:9,UI:6,SI:5} },
  { n:`Bhartrihari`, d:`~5th c.`, tr:'vedanta-advaita', i:`Sphota theory — meaning flashes whole; language as world-disclosing.`, v:{MR:7,TD:8,SI:7,TR:6,UI:5} },
  { n:`Dharmakirti`, d:`~600–660`, i:`Buddhist logic and epistemology — perception and inference rebuilt.`, v:{TR:9,TE:8,SR:8,SI:7,TD:8} },
  { n:`Dignaga`, d:`~480–540`, i:`Pramanasamuccaya — the founder of Buddhist epistemology.`, v:{TR:8,TE:7,TD:8,SR:7,SI:6} },
  { n:`Asanga`, d:`~4th c.`, i:`Yogācāra — mind-only; consciousness constructs the world it perceives.`, v:{MR:8,SI:9,TR:7,AT:7,TD:7} },
  { n:`Vasubandhu`, d:`~4th c.`, i:`Twenty Verses — defense of mind-only against the realist objection.`, v:{TR:8,SI:9,MR:7,TD:8,SR:6} },
  { n:`Buddhaghosa`, d:`~5th c.`, i:`Visuddhimagga — the path of purification; Theravada commentary master.`, v:{AT:9,MR:7,RT:8,SI:7,TV:6} },
  { n:`Padmasambhava`, d:`~8th c.`, i:`Tibetan tantric founder — recognize mind as primordial awareness.`, v:{MR:9,SI:8,AT:6,SS:5,ES:6} },
  { n:`Atisha`, d:`982–1054`, i:`Three persons of capacity; lojong mind-training in compassion.`, v:{MR:8,AT:7,UI:7,CE:6,RT:7} },
  { n:`Milarepa`, d:`~1052–1135`, i:`Tibetan yogi-poet — songs from the caves; murder atoned through liberation.`, v:{MR:9,AT:9,TV:8,VA:6,SS:7,ES:5} },
  { n:`Longchenpa`, d:`1308–1364`, i:`Dzogchen master — primordial purity beyond all training.`, v:{MR:10,SI:8,AT:7,TD:7,VA:5} },
  { n:`Patrul Rinpoche`, d:`1808–1887`, i:`Words of My Perfect Teacher — the preliminary practices made plain.`, v:{MR:8,AT:8,CE:6,RT:7,SS:4} },
  { n:`Kumarajila`, d:`344–413`, tr:'buddhist-mahayana', i:`Translator of the Lotus and Diamond sutras — Chinese Buddhism's spine.`, v:{MR:8,RT:7,TR:6,UI:6} },
  { n:`Zhiyi`, d:`538–597`, i:`Tiantai founder — three truths held in mutual containment.`, v:{MR:9,TD:7,RT:7,UI:6,SI:6} },
  { n:`Fazang`, d:`643–712`, i:`Huayan — Indra's net; each part contains the whole.`, v:{MR:9,TD:8,UI:7,SI:7,CE:5} },
  { n:`Linji Yixuan`, d:`~810–866`, i:`Rinzai Zen — kill the Buddha if you meet him; nothing to find.`, v:{WP:7,SS:9,SR:7,MR:7,SI:7,RT:2} },
  { n:`Bankei Yotaku`, d:`1622–1693`, i:`The Unborn — your nature before opinion, prior to all method.`, v:{MR:9,SI:7,SS:6,RT:5,AT:5} },
  { n:`Ikkyu Sojun`, d:`1394–1481`, i:`Crazy-cloud Zen — sake, lovers, and satori in the brothels of Kyoto.`, v:{VA:8,SS:8,ES:7,SR:7,MR:7,AT:2} },
  { n:`Wonhyo`, d:`617–686`, i:`Korean Buddhist synthesis — drinking from a skull, awakened by it.`, v:{MR:8,SI:6,UI:7,PO:6} },
  { n:`Jinul`, d:`1158–1210`, i:`Korean Seon — sudden awakening followed by gradual cultivation.`, v:{MR:8,AT:7,SI:6,PO:5} },
  { n:`Wang Bi`, d:`226–249`, i:`Neo-Daoist commentary on the Yijing and Laozi — non-being as ground.`, v:{MR:7,TD:8,RT:6,SI:6} },
  { n:`Guo Xiang`, d:`~252–312`, i:`Self-so-ness (ziran) — each thing is its own reason; the Dao does nothing.`, v:{MR:6,VA:6,SS:5,SI:5,RT:6} },
  { n:`Liezi`, d:`~5th c. BCE legendary`, i:`The fearless rider of wind — illusion of self and effortless action.`, v:{MR:7,VA:6,SI:6,ES:5,SS:5} },
  { n:`Han Yu`, d:`768–824`, i:`Tang Confucian revival — orthodoxy of the Dao against Buddhism.`, v:{RT:9,CE:7,UI:5,WP:6} },
  { n:`Cheng Yi`, d:`1033–1107`, i:`Investigation of things — Neo-Confucian study as moral cultivation.`, v:{TR:7,TE:7,RT:8,TD:7,AT:6,CE:6} },
  { n:`Cheng Hao`, d:`1032–1085`, i:`Humaneness (ren) as identity with all things; mystical Confucianism.`, v:{MR:7,CE:8,RT:7,VA:6,UI:5} },
  { n:`Wang Fuzhi`, d:`1619–1692`, i:`Anti-quietist Confucian — qi is the only reality; history is its becoming.`, v:{TE:7,WP:6,CE:7,RT:6,SI:5,UI:5} },
  { n:`Dai Zhen`, d:`1724–1777`, i:`Evidential learning — feelings investigated yield principles, not blocked by them.`, v:{TE:7,SR:7,VA:7,PO:7,ES:6,RT:5} },
  { n:`Kang Youwei`, d:`1858–1927`, i:`Great Unity — utopian reformist Confucianism for a modern China.`, v:{UI:8,WP:7,CE:6,TR:6} },
  { n:`Liang Shuming`, d:`1893–1988`, i:`Three cultures compared — Chinese, Indian, Western paths of life.`, v:{CE:7,RT:7,MR:6,PO:6,TV:5} },
  { n:`Mou Zongsan`, d:`1909–1995`, i:`Contemporary New Confucianism — moral metaphysics from intellectual intuition.`, v:{TR:7,RT:7,MR:7,UI:6,TD:8} },
  { n:`Tu Weiming`, d:`b. 1940`, i:`Confucian humanism in dialogue with global ethics.`, v:{CE:8,RT:7,UI:7,PO:6} },
  { n:`Chinul (re-noted)`, d:`1158–1210`, i:`(see Jinul)`, v:{MR:8,AT:7} }, // duplicate-safe; we filter later

  // ─── RENAISSANCE & EARLY MODERN GAPS ─────────────────────────────
  { n:`Montaigne`, d:`1533–1592`, i:`Essays — Que sais-je? Skepticism turned into self-portrait.`, v:{SR:9,VA:6,SS:6,ES:6,PO:6,RT:5} },
  { n:`Francis Bacon`, d:`1561–1626`, i:`Novum Organum — induction as the engine of useful knowledge.`, v:{TE:9,SR:6,WP:7,PO:8,TR:6} },
  { n:`Galileo Galilei`, d:`1564–1642`, i:`Mathematics as the language nature is written in — and recanted under threat.`, v:{TR:9,TE:9,SR:6,UI:7,WP:7} },
  { n:`Johannes Kepler`, d:`1571–1630`, i:`Planets dance to laws — mysticism and precise measurement together.`, v:{TR:8,TE:7,MR:6,UI:7,TD:8} },
  { n:`Hugo Grotius`, d:`1583–1645`, i:`Natural law and international right — peace built on shared reason.`, v:{TR:7,UI:8,RT:6,PO:7,CE:6} },
  { n:`Hobbes`, d:`1588–1679`, i:`Leviathan — war of all against all averted only by absolute sovereignty.`, v:{TV:8,TE:7,WP:7,SR:6,UI:5,CE:5} },
  { n:`Mary Astell`, d:`1666-1731`, i:`(already in db — skip)`, v:{} }, // mark to skip
  { n:`Margaret Cavendish`, d:`1623–1673`, tr:'empiricist', i:`Vitalist materialism — matter perceives and reasons throughout.`, v:{TE:7,ES:7,SS:7,MR:5,SR:6} },
  { n:`Anne Conway`, d:`1631–1679`, i:`Principles — one substance with infinite gradations; influenced Leibniz.`, v:{MR:7,TR:7,TD:7,UI:6,SI:5} },
  { n:`Émilie du Châtelet`, d:`1706–1749`, i:`Newton in French — energy as mv²; the rights of women in thinking.`, v:{TR:8,TE:8,UI:7,WP:7,SS:6} },
  { n:`Cudworth`, d:`1617–1688`, i:`Cambridge Platonist — eternal moral truths, plastic nature.`, v:{TR:8,MR:7,RT:6,TD:7,UI:6} },
  { n:`Henry More`, d:`1614–1687`, i:`Spirit of nature — a Cartesian convinced that ghosts were data.`, v:{MR:7,TR:6,TE:6,RT:6,UI:5} },
  { n:`Ralph Cudworth (re-noted)`, d:`1617–1688`, i:`(see Cudworth)`, v:{} },
  { n:`Spinozism in Bayle`, d:`1647–1706`, i:`Pierre Bayle — Dictionary that armed the Enlightenment with skeptical entries.`, v:{SR:9,TR:6,SS:6,UI:5,RT:3} },
  { n:`Pierre Bayle`, d:`1647–1706`, i:`Historical and Critical Dictionary — skepticism as the wedge of toleration.`, v:{SR:9,TR:6,SS:6,UI:5,RT:3} },
  { n:`Samuel Pufendorf`, d:`1632–1694`, i:`Duty grounded in sociability — the moral entity over the natural body.`, v:{TR:7,UI:7,RT:6,CE:6,PO:6} },
  { n:`Anthony Ashley Cooper (Shaftesbury)`, d:`1671–1713`, i:`Moral sense — virtue as the harmony of feelings.`, v:{VA:7,ES:6,TR:5,CE:6} },
  { n:`Francis Hutcheson`, d:`1694–1746`, i:`Moral sense school — benevolence as the proper object of approval.`, v:{VA:6,UI:6,CE:6,TR:5} },
  { n:`Bernard Mandeville`, d:`1670–1733`, i:`Fable of the Bees — private vices, public benefits.`, v:{SR:7,TE:7,SS:6,UI:3,VA:6} },
  { n:`Adam Smith`, d:`1723–1790`, i:`Theory of Moral Sentiments — the impartial spectator inside each of us.`, v:{TR:6,TE:7,CE:7,UI:6,PO:7} },
  { n:`Joseph Butler`, d:`1692–1752`, i:`Conscience as the rightful sovereign of human nature.`, v:{RT:7,UI:6,TR:6,SS:5} },
  { n:`Thomas Reid`, d:`1710–1796`, i:`Common sense — the principles every philosophy must already presume.`, v:{TE:8,RT:7,SR:5,TR:6,CE:6} },
  { n:`Dugald Stewart`, d:`1753–1828`, i:`Scottish common sense made systematic — philosophy of the mind.`, v:{TE:7,TR:6,RT:6,CE:5} },
  { n:`Maine de Biran`, d:`1766–1824`, i:`Effort and willing as the felt origin of the self.`, v:{TE:7,ES:7,SS:7,SR:5} },
  { n:`Joseph de Maistre`, d:`1753–1821`, tr:'patristic', i:`Reactionary throne-and-altar — providence in violent history.`, v:{RT:10,TV:8,SR:6,CE:6,UI:3} },
  { n:`Edmund Burke`, d:`1729–1797`, tr:'scholastic', i:`Reflections on the Revolution — tradition as compressed wisdom.`, v:{RT:9,CE:7,SR:6,TV:6,UI:4} },
  { n:`Tom Paine`, d:`1737–1809`, i:`Rights of Man — common sense against monarchy and dogma.`, v:{WP:7,UI:8,SS:7,RT:2,TR:6} },
  { n:`Mary Wollstonecraft (re-noted)`, d:`1759–1797`, i:`(already in db — skip)`, v:{} },
  { n:`William Godwin`, d:`1756–1836`, i:`Political Justice — anarchism by reason; truth dissolves coercion.`, v:{TR:8,SS:7,UI:7,WP:5,RT:2} },
  { n:`Joseph Priestley`, d:`1733–1804`, i:`Necessity, materialism, oxygen — Unitarian radical chemist.`, v:{TE:8,TR:7,UI:7,WP:6,RT:3} },
  { n:`Condorcet`, d:`1743–1794`, i:`Sketch of human progress — optimism written in hiding from the guillotine.`, v:{TR:7,UI:8,WP:6,VA:6,TV:5} },

  // ─── 18TH–19TH C. EXPANSION ──────────────────────────────────────
  { n:`Auguste Comte (re-noted)`, d:`1798–1857`, i:`(already in db — skip)`, v:{} },
  { n:`Alexander von Humboldt`, d:`1769–1859`, i:`Cosmos as woven web — geography that became ecology.`, v:{TE:8,TD:7,UI:7,ES:6,VA:6} },
  { n:`Wilhelm von Humboldt`, d:`1767–1835`, i:`Language shapes thought — Bildung as freely formed individuality.`, v:{TR:7,SS:7,CE:6,VA:6,UI:6} },
  { n:`Friedrich Schleiermacher`, d:`1768–1834`, i:`Religion as the feeling of absolute dependence.`, v:{MR:8,RT:6,VA:6,UI:5} },
  { n:`Goethe`, d:`1749–1832`, i:`Polarity and intensification — nature studied with the poet's eye.`, v:{MR:6,ES:7,VA:7,TD:6,UI:6} },
  { n:`Friedrich Schlegel`, d:`1772–1829`, i:`Romantic fragment — irony as freedom from any fixed view.`, v:{SS:7,VA:7,MR:6,SR:6} },
  { n:`Novalis`, d:`1772–1801`, i:`Hymns to the Night — magical idealism; everything is symbol.`, v:{MR:9,VA:6,ES:5,TV:6} },
  { n:`Madame de Staël`, d:`1766–1817`, i:`De l'Allemagne — Romanticism for the French; enthusiasm as a political force.`, v:{VA:7,CE:6,WP:6,SS:6} },
  { n:`Adam Müller`, d:`1779–1829`, i:`Romantic conservatism — the organic state against atomistic liberalism.`, v:{RT:8,CE:7,SR:5,UI:4} },
  { n:`Søren Kierkegaard (re-noted)`, d:`1813–1855`, i:`(already in db — skip)`, v:{} },
  { n:`Ralph Waldo Emerson`, d:`1803–1882`, i:`Self-Reliance — the soul resists every membership but its own.`, v:{SS:9,VA:7,MR:6,WP:6,RT:3} },
  { n:`Henry David Thoreau`, d:`1817–1862`, i:`Walden — simplify, simplify; conscience over civil law.`, v:{AT:7,SS:8,ES:6,VA:7,RT:3} },
  { n:`Margaret Fuller`, d:`1810–1850`, i:`Woman in the Nineteenth Century — every soul self-developing.`, v:{SS:7,VA:7,MR:6,WP:6,UI:6} },
  { n:`Alexis de Tocqueville`, d:`1805–1859`, tr:'social-contract', i:`Democracy in America — equality\'s seductions and its soft despotisms.`, v:{TE:7,SR:7,CE:6,RT:6,UI:5} },
  { n:`John Henry Newman`, d:`1801–1890`, i:`Grammar of assent — real conviction belongs to whole persons, not to propositions.`, v:{RT:9,MR:7,TR:6,CE:6,UI:5} },
  { n:`Walter Pater`, d:`1839–1894`, tr:'romantic', i:`Burn always with a hard, gemlike flame — aesthetic life as ethics.`, v:{VA:9,ES:8,SS:7,AT:2} },
  { n:`F.H. Bradley`, d:`1846–1924`, i:`Appearance and Reality — relations contradict; the Absolute alone is real.`, v:{MR:7,TD:9,TR:7,SI:6} },
  { n:`T.H. Green`, d:`1836–1882`, i:`Idealist ethics — the common good as the proper end of state action.`, v:{UI:7,CE:7,TR:7,WP:5} },
  { n:`Henry Sidgwick`, d:`1838–1900`, i:`Methods of Ethics — utilitarianism, egoism, intuitionism scrupulously compared.`, v:{TR:8,UI:7,SR:7,TD:7} },
  { n:`Rosa Luxemburg`, d:`1871–1919`, i:`Spontaneity of the masses; socialism or barbarism.`, v:{WP:8,UI:7,CE:7,TV:6,SS:6} },
  { n:`Pyotr Kropotkin`, d:`1842–1921`, i:`Mutual Aid — cooperation as a factor of evolution.`, v:{CE:8,VA:6,WP:6,UI:7,RT:3} },
  { n:`Mikhail Bakunin`, d:`1814–1876`, i:`Anarchist passion — destroy the state, recover the spontaneous commune.`, v:{SS:9,WP:8,UI:5,RT:1,CE:6} },
  { n:`Max Stirner`, d:`1806–1856`, i:`The Ego and Its Own — every cause besides mine is the spook of mine.`, v:{SS:10,WP:7,SR:7,UI:1,RT:1,CE:1} },
  { n:`Jeremy Bentham`, d:`1748–1832`, i:`The greatest happiness of the greatest number — pleasure calculus made law.`, v:{UI:7,PO:8,TR:7,TE:7,VA:6} },
  { n:`Auguste Blanqui`, d:`1805–1881`, i:`Revolutionary by trade — eternity by the stars in a prison cell.`, v:{WP:7,TV:6,SS:6,UI:5} },
  { n:`Émile Durkheim`, d:`1858–1917`, i:`The conscience collective — society precedes and forms the individual.`, v:{CE:9,RT:7,TE:7,UI:6,SS:2} },
  { n:`Max Weber`, d:`1864–1920`, i:`Protestant Ethic — the iron cage of disenchanted rationality.`, v:{TR:7,TE:7,SR:7,TV:6,RT:5,UI:6} },
  { n:`Vilfredo Pareto`, d:`1848–1923`, i:`Residues and derivations — most reasoning rationalizes feeling.`, v:{SR:8,TE:7,SI:5,TR:5,UI:4} },
  { n:`Charles Sanders Peirce (re-noted)`, d:`1839–1914`, i:`(already in db — skip)`, v:{} },
  { n:`Lev Shestov`, d:`1866–1938`, i:`Athens and Jerusalem — reason cannot judge the absurdity of faith.`, v:{MR:8,SR:7,TV:7,SS:6,UI:3} },

  // ─── WOMEN ACROSS HISTORY (gaps after the above) ─────────────────
  { n:`Ban Zhao`, d:`~45–116`, i:`Lessons for Women — Han Confucian conduct manual by a female scholar.`, v:{RT:9,CE:8,AT:6,UI:4} },
  { n:`Diotima of Mantinea`, d:`~5th c. BCE`, i:`Symposium teacher of Socrates — love's ascent from bodies to the form of beauty.`, v:{MR:7,TD:8,TR:7,VA:6,UI:7} },
  { n:`Aspasia of Miletus`, d:`~470–400 BCE`, i:`Rhetorician of Pericles\' Athens; teacher of Socrates by report.`, v:{TR:7,WP:6,SS:6,CE:6} },
  { n:`Themistoclea`, d:`~6th c. BCE`, i:`Delphic priestess named by Pythagoras as his teacher on ethics.`, v:{MR:7,RT:7,AT:6,UI:5} },
  { n:`Sappho`, d:`~630–570 BCE`, i:`The tenth muse — desire as a force that re-orders the cosmos.`, v:{VA:9,ES:8,SS:7,MR:5} },
  { n:`Macrina the Younger`, d:`~324–379`, i:`On the Soul and Resurrection — Christian Platonism at her brother's deathbed.`, v:{MR:8,RT:7,TR:6,AT:7} },
  { n:`Lalleshwari (Lal Ded)`, d:`~1320–1392`, i:`Kashmiri Shaivite mystic — the verses called vakhs, sung without books.`, v:{MR:10,SI:7,VA:6,AT:7,RT:5} },
  { n:`Mirabai`, d:`~1498–1547`, i:`Krishna's bride — bhakti songs that dissolve caste and household.`, v:{MR:9,VA:7,SS:7,ES:5,RT:4} },
  { n:`Sor Juana Inés de la Cruz`, d:`1648–1695`, i:`Mexican nun-philosopher — Respuesta defending women's right to study.`, v:{TR:8,SS:7,UI:7,RT:5,WP:6} },
  { n:`Catharine Macaulay`, d:`1731–1791`, i:`History of England — republican virtue and women's equal capacity.`, v:{TR:7,UI:7,WP:6,SS:6} },
  { n:`Olympe de Gouges`, d:`1748–1793`, i:`Declaration of the Rights of Woman — guillotined for taking liberty seriously.`, v:{UI:8,WP:7,SS:7,TR:6} },
  { n:`Germaine de Staël (re-noted)`, d:`1766–1817`, i:`(see Madame de Staël)`, v:{} },
  { n:`Harriet Martineau`, d:`1802–1876`, i:`Illustrations of Political Economy — sociology as moral observation.`, v:{TE:8,UI:7,SR:6,CE:6,WP:5} },
  { n:`Harriet Taylor Mill`, d:`1807–1858`, i:`Enfranchisement of Women — argument that ran through Mill's pen.`, v:{UI:8,WP:6,TR:7,SS:6} },
  { n:`Frances Wright`, d:`1795–1852`, i:`Free thought, abolition, equal education — a Course of Popular Lectures.`, v:{UI:8,WP:7,SS:6,RT:2,TR:6} },
  { n:`Anna Julia Cooper`, d:`1858–1964`, i:`A Voice from the South — Black women as the measure of any republic.`, v:{CE:8,UI:7,WP:6,SS:7} },
  { n:`Ida B. Wells`, d:`1862–1931`, i:`Anti-lynching investigations — moral evidence over respectability.`, v:{WP:8,UI:7,TE:7,SS:7,SR:6} },
  { n:`Charlotte Perkins Gilman`, d:`1860–1935`, i:`Women and Economics — domestic labor as economic invisibility.`, v:{TE:7,UI:7,WP:7,CE:6,SS:6} },
  { n:`Emma Goldman`, d:`1869–1940`, i:`Anarchism and Other Essays — liberty answerable only to itself.`, v:{SS:9,WP:7,VA:7,RT:1,UI:5} },
  { n:`Rosa Mayreder`, d:`1858–1938`, i:`Toward a Critique of Femininity — culture\'s gender as constructed prison.`, v:{SR:7,UI:7,SS:7} },
  { n:`Edith Stein`, d:`1891–1942`, i:`Phenomenology of empathy; Carmelite nun killed at Auschwitz.`, v:{MR:8,RT:8,CE:6,UI:6,AT:7,TV:7} },
  { n:`Rachel Bespaloff`, d:`1895–1949`, i:`On the Iliad — the force that turns persons into things.`, v:{TV:8,MR:6,UI:6,SR:6} },
  { n:`Hannah Arendt (re-noted)`, d:`1906–1975`, i:`(already in db — skip)`, v:{} },
  { n:`Edith Wyschogrod`, d:`1930–2009`, i:`Saints and postmodernism — ethics in the gaps left by metaphysics.`, v:{MR:7,UI:7,SR:6,CE:6} },
  { n:`Gertrude Stein`, d:`1874–1946`, i:`Composition as explanation — repetition as a way of seeing the present.`, v:{ES:7,VA:7,SS:7,SR:6,TD:5} },
  { n:`Susanne Langer`, d:`1895–1985`, i:`Philosophy in a New Key — symbol-making as the mark of mind.`, v:{TR:7,MR:6,ES:6,TD:7,UI:5} },
  { n:`Mary Calkins`, d:`1863–1930`, i:`Personalist self-psychology — the self as primary datum of philosophy.`, v:{TR:7,TE:6,SS:6,UI:5} },
  { n:`L. Susan Stebbing`, d:`1885–1943`, i:`Thinking to Some Purpose — logic as a citizen's defense against propaganda.`, v:{TR:8,SR:7,UI:6,PO:7} },
  { n:`Ruth Barcan Marcus`, d:`1921–2012`, i:`Modal logic — possible worlds before Kripke gave them his name.`, v:{TR:9,TD:9,UI:6,SS:6} },
  { n:`Philippa Foot`, d:`1920–2010`, i:`Natural Goodness — virtues as facts about flourishing creatures.`, v:{RT:7,UI:7,TR:7,PO:6} },
  { n:`Iris Murdoch`, d:`1919–1999`, i:`Sovereignty of Good — moral attention to the singular other.`, v:{MR:8,TR:7,UI:7,TD:7,VA:6} },
  { n:`Elizabeth Anscombe (re-noted)`, d:`1919–2001`, i:`(already in db — skip)`, v:{} },
  { n:`Mary Midgley`, d:`1919–2018`, i:`Beast and Man — animals, ethics, science not as enemies.`, v:{ES:7,CE:6,PO:7,SR:6,UI:6} },
  { n:`Mary Warnock`, d:`1924–2019`, i:`Imagination — Warnock report on bioethics; reason in moral committees.`, v:{TR:6,UI:6,PO:7,SR:6} },
  { n:`Hilde Lindemann`, d:`b. 1949`, i:`Damaged Identities, Narrative Repair — story as moral practice.`, v:{CE:7,UI:6,VA:6,PO:6} },
  { n:`Carol Gilligan`, d:`b. 1936`, i:`In a Different Voice — ethics of care alongside ethics of justice.`, v:{CE:7,VA:6,UI:5,ES:5} },
  { n:`Nel Noddings`, d:`1929–2022`, i:`Caring — relational ethics centered on the encounter between persons.`, v:{CE:8,VA:6,ES:5,UI:4} },
  { n:`Annette Baier`, d:`1929–2012`, i:`Trust as the precondition of moral life; Hume re-read for the feminine.`, v:{CE:7,TE:6,VA:6,UI:5} },
  { n:`Onora O\'Neill`, d:`b. 1941`, i:`Constructive Kantianism; trust and accountability in modern institutions.`, v:{TR:8,UI:7,PO:6} },
  { n:`Susan Sontag`, d:`1933–2004`, tr:'postmodern', i:`Against Interpretation — the erotics of art beats hermeneutics.`, v:{ES:7,VA:7,SS:7,SR:6,VA:7} },
  { n:`Catharine MacKinnon`, d:`b. 1946`, i:`Toward a Feminist Theory of the State — sexual hierarchy as the deepest politics.`, v:{SR:7,WP:7,UI:6,CE:6,SS:6} },
  { n:`Drucilla Cornell`, d:`1950–2022`, i:`The imaginary domain — equality requires room to imagine oneself otherwise.`, v:{SS:6,UI:7,VA:6,WP:5} },
  { n:`Julia Kristeva`, d:`b. 1941`, i:`Abjection — the borders the self draws to remain itself.`, v:{SI:7,ES:6,SR:6,SS:6} },
  { n:`Hélène Cixous`, d:`b. 1937`, i:`Écriture féminine — writing from the body, refusing the binary.`, v:{ES:8,VA:7,SS:6,SI:6} },
  { n:`Luce Irigaray`, d:`b. 1930`, i:`Speculum of the Other Woman — sexual difference as philosophical ground.`, v:{ES:7,SS:6,SR:6,UI:4} },
  { n:`Patricia Churchland`, d:`b. 1943`, i:`Neurophilosophy — moral concepts naturalized into mammal brains.`, v:{TE:9,SR:7,SI:6,TR:6} },
  { n:`Susan Haack`, d:`b. 1945`, i:`Foundherentism — knowledge like a crossword, not a pyramid.`, v:{TR:7,TE:7,SR:7,PO:6} },
  { n:`Sally Haslanger`, d:`b. 1955`, i:`Race and gender as social positions, not natural kinds.`, v:{SR:7,SI:6,UI:6,CE:5} },
  { n:`Miranda Fricker`, d:`b. 1966`, i:`Epistemic Injustice — the wrongs done to people as knowers.`, v:{SR:7,UI:7,CE:6,VA:5} },
  { n:`Rae Langton`, d:`b. 1961`, i:`Pornography as silencing — speech-act theory turned to ethics.`, v:{SR:7,UI:6,TR:6} },
  { n:`Linda Zagzebski`, d:`b. 1946`, i:`Virtues of the Mind — epistemic and moral virtue as one fabric.`, v:{TR:7,RT:7,UI:6,VA:5} },
  { n:`Sara Heinämaa`, d:`b. 1960`, i:`Sexual difference as a phenomenology of embodiment after Beauvoir.`, v:{ES:7,SR:6,MR:5,SS:5} },
  { n:`Sara Ruddick`, d:`1935–2011`, i:`Maternal Thinking — practices of mothering as cognitive labor.`, v:{CE:8,VA:6,ES:5,UI:4} },
  { n:`Gloria Anzaldúa`, d:`1942–2004`, i:`Borderlands/La Frontera — the mestiza consciousness of bridging selves.`, v:{CE:7,ES:6,SS:7,SI:6,VA:6} },
  { n:`Maria Lugones`, d:`1944–2020`, i:`World-traveling — playful pluralism against the logic of purity.`, v:{CE:6,SS:6,VA:6,UI:5,SR:6} },
  { n:`Linda Martín Alcoff`, d:`b. 1955`, i:`Visible Identities — race, gender, and the politics of social epistemology.`, v:{CE:6,SR:6,UI:5,SS:5} },
  { n:`Charles Mills`, d:`1951–2021`, i:`The Racial Contract — liberal political theory laid bare.`, v:{SR:8,UI:6,CE:6,WP:5} },
  { n:`Tommie Shelby`, d:`b. 1967`, i:`Dark Ghettos — political philosophy of structural injustice.`, v:{UI:7,CE:7,WP:5,SR:5} },
  { n:`Adrian Piper`, d:`b. 1948`, i:`Rationality and the Structure of the Self — Kant and Black conceptual art.`, v:{TR:7,UI:6,SS:6,SR:6} },

  // ─── 20TH C. CONTINENTAL + ANALYTIC ──────────────────────────────
  { n:`Karl Popper`, d:`1902–1994`, tr:'analytic', i:`Falsifiability — open society defended by fallible knowledge.`, v:{TR:8,SR:7,UI:7,WP:6,RT:3} },
  { n:`Imre Lakatos`, d:`1922–1974`, tr:'analytic', i:`Research programs — science between Popper's edge and Kuhn's communities.`, v:{TR:7,SR:6,CE:6,TE:6,TD:6} },
  { n:`Thomas Kuhn`, d:`1922–1996`, tr:'analytic', i:`Structure of Scientific Revolutions — paradigms shift, not data.`, v:{CE:7,TE:6,SR:6,RT:5,SI:5} },
  { n:`Paul Feyerabend`, d:`1924–1994`, i:`Against Method — anything goes; epistemological anarchism.`, v:{SR:9,SS:8,WP:6,RT:1,UI:3} },
  { n:`Ian Hacking`, d:`1936–2023`, tr:'analytic', i:`Representing and Intervening — making up people; styles of reasoning.`, v:{SR:7,TE:7,SI:6,TR:6} },
  { n:`Bas van Fraassen`, d:`b. 1941`, i:`Constructive empiricism — accept what is observable, suspend on the rest.`, v:{TE:8,SR:8,TR:6,UI:5} },
  { n:`Nelson Goodman`, d:`1906–1998`, tr:'analytic', i:`Fact, Fiction, and Forecast — grue, and ways of worldmaking.`, v:{SR:7,TD:7,TR:6,SI:6} },
  { n:`Donald Davidson`, d:`1917–2003`, i:`Anomalous monism; radical interpretation as the test of meaning.`, v:{TR:8,TE:7,UI:6,TD:7} },
  { n:`Wilfrid Sellars`, d:`1912–1989`, i:`Myth of the Given — manifest and scientific images side by side.`, v:{TR:8,SR:6,TD:7,UI:6} },
  { n:`Robert Brandom`, d:`b. 1950`, i:`Making It Explicit — meaning as inferential commitment in social space.`, v:{TR:8,CE:6,TD:8,UI:6} },
  { n:`John McDowell`, d:`b. 1942`, i:`Mind and World — second nature, the space of reasons reaching all the way.`, v:{TR:7,RT:6,UI:6,TD:7} },
  { n:`Jaakko Hintikka`, d:`1929–2015`, i:`Game-theoretical semantics; epistemic logic for knowledge and belief.`, v:{TR:9,TD:8,SR:6} },
  { n:`Frank Ramsey`, d:`1903–1930`, i:`Truth as success; redundancy theory; partial belief and pragmatism.`, v:{TR:8,TE:7,SR:6,PO:6} },
  { n:`Bernard Bolzano`, d:`1781–1848`, i:`Theory of science — propositions in themselves before the linguistic turn.`, v:{TR:9,TD:8,UI:6} },
  { n:`Gottlob Frege`, d:`1848–1925`, i:`Begriffsschrift — logic born again as the foundation of arithmetic.`, v:{TR:10,TD:9,UI:7,SR:5} },
  { n:`Kurt Gödel`, d:`1906–1978`, i:`Incompleteness — any sufficient formal system leaves truths unprovable.`, v:{TR:10,TD:9,MR:5,SR:5} },
  { n:`Alfred Tarski`, d:`1901–1983`, i:`Semantic theory of truth; truth in a model.`, v:{TR:10,TD:8} },
  { n:`Alonzo Church`, d:`1903–1995`, i:`Lambda calculus; the undecidability of first-order logic.`, v:{TR:10,TD:9} },
  { n:`Alan Turing`, d:`1912–1954`, i:`Computable numbers; minds as machines, machines as minds.`, v:{TR:9,TD:8,TE:7,SI:5,UI:5} },
  { n:`Norbert Wiener`, d:`1894–1964`, i:`Cybernetics — feedback and control as the science of communication.`, v:{TR:7,TE:7,TD:7,UI:6} },
  { n:`Claude Shannon`, d:`1916–2001`, i:`A Mathematical Theory of Communication — information measured in bits.`, v:{TR:9,TD:8,TE:7} },
  { n:`Otto Neurath`, d:`1882–1945`, i:`Rebuilding the ship at sea — no philosophy outside ongoing science.`, v:{TE:8,SR:7,UI:6,WP:5} },
  { n:`Rudolf Carnap`, d:`1891–1970`, i:`Logical syntax of language; the principle of tolerance.`, v:{TR:9,SR:7,UI:7,TD:8} },
  { n:`Moritz Schlick`, d:`1882–1936`, i:`Vienna Circle — verification as the criterion of meaning.`, v:{TE:8,TR:7,SR:7,RT:3} },
  { n:`A.J. Ayer`, d:`1910–1989`, i:`Language, Truth and Logic — ethics is the expression of feeling.`, v:{TE:8,SR:8,VA:6,RT:2,MR:1} },
  { n:`Gilbert Ryle`, d:`1900–1976`, i:`The Concept of Mind — category mistakes; no ghost in the machine.`, v:{TR:7,SR:7,SI:6,UI:5} },
  { n:`P.F. Strawson`, d:`1919–2006`, i:`Individuals — descriptive metaphysics of persons and bodies.`, v:{TR:7,RT:6,UI:6,CE:5} },
  { n:`Michael Dummett`, d:`1925–2011`, i:`Anti-realism; meaning as use, with constructive logic in tow.`, v:{TR:9,TD:8,UI:6} },
  { n:`Bernard Williams (re-noted)`, d:`1929–2003`, i:`(already in db — skip)`, v:{} },
  { n:`Stuart Hampshire`, d:`1914–2004`, i:`Thought and action; freedom found in deliberation, not behind it.`, v:{TR:7,SS:6,PO:6,UI:5} },
  { n:`David Lewis`, d:`1941–2001`, i:`On the Plurality of Worlds — every possibility is a real world.`, v:{TR:9,TD:9,SI:5,UI:6} },
  { n:`Saul Kripke (re-noted)`, d:`1940–2022`, i:`(already in db — skip)`, v:{} },
  { n:`Hilary Putnam (re-noted)`, d:`1926–2016`, i:`(already in db — skip)`, v:{} },
  { n:`Bernard Lonergan`, d:`1904–1984`, tr:'scholastic', i:`Insight — the structure of intentional consciousness as cognitive method.`, v:{TR:8,RT:7,TD:8,UI:6,MR:6} },
  { n:`Vladimir Solovyov`, d:`1853–1900`, i:`Russian religious philosophy — total-unity and the wisdom of God.`, v:{MR:9,RT:7,UI:7,TD:7,TV:6} },
  { n:`Nikolai Berdyaev`, d:`1874–1948`, i:`Freedom and creativity as the divine in the human person.`, v:{SS:8,VA:6,MR:7,TV:6,WP:6,RT:3} },
  { n:`Lev Tolstoy`, d:`1828–1910`, i:`My Confession — anarchism, vegetarianism, the kingdom of God within.`, v:{MR:7,TV:7,AT:7,CE:6,RT:5,WP:5} },
  { n:`Fyodor Dostoevsky`, d:`1821–1881`, i:`The Grand Inquisitor — freedom heavier than bread.`, v:{TV:9,MR:7,SS:7,CE:6,SR:6,VA:6} },
  { n:`Pavel Florensky`, d:`1882–1937`, i:`The Pillar and Ground of the Truth — antinomy embraced as the form of faith.`, v:{MR:9,TD:8,RT:8,UI:6,TV:6} },
  { n:`Sergei Bulgakov`, d:`1871–1944`, i:`Sophia — the wisdom of God as the world's intelligible ground.`, v:{MR:8,RT:7,UI:6} },
  { n:`Mikhail Bakhtin`, d:`1895–1975`, i:`The dialogic imagination — selves built in the answer to another voice.`, v:{CE:8,SS:6,SI:5,VA:6,SR:5} },
  { n:`Roland Barthes`, d:`1915–1980`, i:`The death of the author — text's pleasure lives in the reader.`, v:{ES:7,VA:7,SR:6,SI:6} },
  { n:`Maurice Blanchot`, d:`1907–2003`, i:`The space of literature — writing as the disappearance of the writer.`, v:{MR:8,SI:8,TV:6,SS:5} },
  { n:`Edmond Jabès`, d:`1912–1991`, i:`The Book of Questions — the question outliving every answer.`, v:{MR:7,SR:7,RT:5,SI:5} },
  { n:`Jean-Luc Nancy`, d:`1940–2021`, i:`Being singular plural — existence is already with.`, v:{CE:7,SS:6,MR:6,SI:5} },
  { n:`Étienne Balibar`, d:`b. 1942`, tr:'critical-theory', i:`Citizen subject — equality and liberty as inseparable political invention.`, v:{UI:7,WP:6,CE:6,TR:6} },
  { n:`Alain Badiou`, d:`b. 1937`, i:`Being and Event — truth procedures issuing from singular fidelity.`, v:{TD:8,WP:7,SS:7,TR:7,UI:6} },
  { n:`Jacques Rancière`, d:`b. 1940`, i:`The distribution of the sensible — politics as redistribution of who counts.`, v:{WP:6,UI:7,CE:6,SR:6} },
  { n:`Bernard Stiegler`, d:`1952–2020`, i:`Technics and time — exteriorization of memory shapes the human.`, v:{TR:7,TE:7,TD:7,CE:6,TV:6} },
  { n:`Quentin Meillassoux`, d:`b. 1967`, i:`After Finitude — the absolute returns through speculative reason.`, v:{TR:8,TD:9,SR:6,SI:5} },
  { n:`Catherine Malabou`, d:`b. 1959`, i:`Plasticity — the brain as the form that gives and takes form.`, v:{TE:7,ES:6,WP:6,SR:5,SI:5} },
  { n:`Achille Mbembe (re-noted)`, d:`b. 1957`, i:`(already in db — skip)`, v:{} },
  { n:`Bruno Latour`, d:`1947–2022`, tr:'postmodern', i:`Actor-network theory — humans and nonhumans entangled in collectives.`, v:{TE:8,CE:7,SR:7,SI:5,RT:5} },
  { n:`Donna Haraway (re-noted)`, d:`b. 1944`, i:`(already in db — skip)`, v:{} },
  { n:`Isabelle Stengers`, d:`b. 1949`, i:`Cosmopolitics — sciences as practices, slow and risky.`, v:{TE:7,CE:6,SR:7} },
  { n:`Karen Barad`, d:`b. 1956`, i:`Agential realism — phenomena, not objects, as the units of reality.`, v:{TE:7,TD:7,SR:6,SI:6,ES:5} },
  { n:`Eduardo Viveiros de Castro`, d:`b. 1951`, i:`Amerindian perspectivism — bodies vary, points of view multiply.`, v:{CE:6,SR:6,TE:6,UI:4,MR:6} },
  { n:`Philippe Descola`, d:`b. 1949`, tr:'indigenous', i:`Beyond Nature and Culture — four ontologies organizing how peoples live.`, v:{CE:7,TE:7,RT:6,UI:5} },
  { n:`Eduardo Kohn`, d:`b. 1968`, tr:'indigenous', i:`How Forests Think — semiosis beyond the human in the forest's logic.`, v:{ES:7,MR:6,SR:6,SI:5} },
  { n:`Anna Tsing`, d:`b. 1952`, i:`The Mushroom at the End of the World — life in capitalist ruins.`, v:{TV:7,ES:7,CE:6,TE:6} },
  { n:`Karen Armstrong`, d:`b. 1944`, tr:'mystical-cross-tradition', i:`The Case for God — religion as practice that re-trains attention.`, v:{MR:7,RT:7,UI:6,PO:6} },
  { n:`Charles Hartshorne`, d:`1897–2000`, i:`Process theology — God dipolar, suffering with creation.`, v:{MR:7,TR:7,VA:6,RT:6,UI:6} },
  { n:`Alfred North Whitehead (re-noted)`, d:`1861–1947`, i:`(already in db — skip)`, v:{} },

  // ─── 20TH C. NON-WESTERN & POSTCOLONIAL ──────────────────────────
  { n:`Sri Aurobindo (re-noted)`, d:`1872–1950`, i:`(already in db — skip)`, v:{} },
  { n:`Ramana Maharshi (re-noted)`, d:`1879–1950`, i:`(already in db — skip)`, v:{} },
  { n:`Anandamayi Ma`, d:`1896–1982`, tr:'vedanta-bhakti', i:`Bhairavi mother — silence as her clearest teaching.`, v:{MR:10,VA:6,SI:6,AT:6} },
  { n:`Sarvepalli Radhakrishnan`, d:`1888–1975`, tr:'vedanta-advaita', i:`Hindu View of Life — religion as experience, philosophy as its grammar.`, v:{MR:7,RT:7,TR:7,UI:7} },
  { n:`Bhimrao Ambedkar`, d:`1891–1956`, tr:'liberation', i:`Annihilation of Caste — conversion to Buddhism as moral rebellion.`, v:{WP:8,UI:7,SR:7,SS:7,RT:2} },
  { n:`Mohandas Gandhi (re-noted)`, d:`1869–1948`, i:`(already in db — skip)`, v:{} },
  { n:`Vinoba Bhave`, d:`1895–1982`, tr:'liberation', i:`Bhoodan — land gift as Gandhian revolution by walking.`, v:{AT:7,CE:7,UI:6,WP:5,RT:5} },
  { n:`Jiddu Krishnamurti (re-noted)`, d:`1895–1986`, i:`(already in db — skip)`, v:{} },
  { n:`U.G. Krishnamurti`, d:`1918–2007`, i:`Anti-guru guru — the natural state has nothing to teach.`, v:{SS:8,SR:8,SI:7,MR:6,RT:1} },
  { n:`Osho (Rajneesh)`, d:`1931–1990`, tr:'tantric', i:`Dynamic meditation — sannyas remade for the modern hedonist.`, v:{VA:7,SS:7,MR:6,ES:7,RT:2} },
  { n:`B.K.S. Iyengar`, d:`1918–2014`, tr:'vedanta-bhakti', i:`Light on Yoga — alignment as the embodied form of intelligence.`, v:{ES:9,AT:6,RT:6,PO:7,MR:5} },
  { n:`Daisaku Ikeda`, d:`1928–2023`, tr:'buddhist-mahayana', i:`Soka Gakkai humanism — the practitioner's revolution from the inside.`, v:{VA:7,CE:7,UI:6,MR:5,RT:5} },
  { n:`Shunryu Suzuki`, d:`1904–1971`, i:`Zen Mind, Beginner\'s Mind — the original empty mind always available.`, v:{MR:8,AT:7,VA:5,SI:6} },
  { n:`Robert Aitken`, d:`1917–2010`, i:`American Zen with social engagement — koan and conscience.`, v:{MR:8,AT:6,UI:6,CE:6} },
  { n:`Toni Packer`, d:`1927–2013`, i:`Awakening without authority — inquiry without lineage.`, v:{MR:7,SS:7,SR:6,RT:3} },
  { n:`Pema Chödrön`, d:`b. 1936`, i:`When Things Fall Apart — basic goodness met in groundlessness.`, v:{MR:7,TV:7,VA:6,CE:6} },
  { n:`Joanna Macy`, d:`b. 1929`, i:`Work That Reconnects — despair as a doorway to ecological action.`, v:{ES:6,VA:6,CE:7,TV:7,MR:6} },
  { n:`David Bohm`, d:`1917–1992`, i:`Wholeness and the Implicate Order — physics and dialogue at the deepest level.`, v:{MR:7,TR:7,TD:8,UI:6,CE:6} },
  { n:`Krishna Chandra Bhattacharya`, d:`1875–1949`, i:`The subject as freedom — Indian Kantian phenomenology.`, v:{TR:7,SS:7,MR:6,TD:7,UI:5} },
  { n:`A.K. Coomaraswamy`, d:`1877–1947`, i:`Traditionalism — sacred art as the vehicle of metaphysical knowledge.`, v:{RT:9,MR:8,TD:7,AT:6,UI:5} },
  { n:`René Guénon`, d:`1886–1951`, i:`The crisis of the modern world — recovery of primordial tradition.`, v:{RT:10,MR:8,TD:7,AT:7,UI:4} },
  { n:`Frithjof Schuon`, d:`1907–1998`, i:`Transcendent unity of religions — the perennial philosophy.`, v:{RT:8,MR:9,UI:7,TD:6} },
  { n:`Seyyed Hossein Nasr`, d:`b. 1933`, i:`Islamic perennialism — science divorced from sacred is metaphysical violence.`, v:{RT:8,MR:8,TD:6,UI:6} },
  { n:`Ali Shariati`, d:`1933–1977`, i:`Red Shiism — revolutionary Islam against Western alienation.`, v:{WP:7,RT:7,UI:6,CE:6,VA:5} },
  { n:`Muhammad Iqbal`, d:`1877–1938`, i:`Reconstruction of Religious Thought in Islam — the ego as God\'s collaborator.`, v:{MR:7,SS:7,WP:6,RT:7,VA:6} },
  { n:`Tariq Ramadan`, d:`b. 1962`, i:`European Islam — internal reform without secular flattening.`, v:{RT:7,UI:6,CE:7,PO:6} },
  { n:`Wang Hui`, d:`b. 1959`, i:`Rise of modern Chinese thought — modernity reread from inside the tradition.`, v:{TE:7,RT:6,CE:6,TD:6,SR:6} },
  { n:`Li Zehou`, d:`1930–2021`, i:`Sedimentation theory — accumulated practice forms aesthetic-moral sense.`, v:{TE:7,CE:6,RT:5,VA:6,UI:5} },
  { n:`Karatani Kojin`, d:`b. 1941`, i:`Modes of exchange — capital and the gift as paired political histories.`, v:{TR:7,UI:6,CE:6,WP:5,TD:6} },
  { n:`Maruyama Masao`, d:`1914–1996`, tr:'analytic', i:`From feudal to modern — Japanese political thought\'s genealogy.`, v:{TR:7,TE:6,SR:6,UI:5,CE:5} },
  { n:`Tetsuro Watsuji (re-noted)`, d:`1889–1960`, i:`(already in db — skip)`, v:{} },
  { n:`Chen Duxiu`, d:`1879–1942`, tr:'marxist', i:`Founder of Chinese Communism — New Youth\'s call to science and democracy.`, v:{WP:7,UI:7,SR:6,RT:2} },
  { n:`Tan Sitong`, d:`1865–1898`, tr:'liberation', i:`Renxue — humaneness as universal ether; martyr of the Hundred Days Reform.`, v:{MR:7,UI:7,CE:6,WP:6} },
  { n:`Helio Oiticica`, d:`1937–1980`, i:`Tropicália aesthetics — the parangolé as a wearable proposition.`, v:{VA:7,ES:7,SS:6,UI:5} },
  { n:`Paulo Freire`, d:`1921–1997`, i:`Pedagogy of the Oppressed — education as the practice of freedom.`, v:{WP:7,CE:7,UI:7,VA:6} },
  { n:`Enrique Dussel`, d:`1934–2023`, i:`Philosophy of Liberation — the colonial Other as ethical first.`, v:{UI:6,CE:7,WP:6,TV:6,SR:5} },
  { n:`José Carlos Mariátegui`, d:`1894–1930`, i:`Seven Essays — indigenous communism rooted in the ayllu.`, v:{WP:7,UI:6,CE:8,RT:5,VA:5} },
  { n:`Octavio Paz`, d:`1914–1998`, tr:'postcolonial', i:`The Labyrinth of Solitude — masks, otherness, the Mexican condition.`, v:{ES:6,VA:7,CE:5,TV:5,MR:5} },
  { n:`Bartolomé de Las Casas`, d:`1484–1566`, i:`Defender of the Indies — humanity of indigenous peoples insisted upon.`, v:{UI:8,RT:6,VA:6,CE:6,SR:5} },
  { n:`Vine Deloria Jr. (re-noted)`, d:`1933–2005`, i:`(already in db — skip)`, v:{} },
  { n:`Robin Wall Kimmerer`, d:`b. 1953`, i:`Braiding Sweetgrass — botany held in the grammar of animacy.`, v:{ES:7,RT:7,CE:7,VA:6,MR:6} },
  { n:`Glen Coulthard`, d:`b. 1974`, i:`Red Skin, White Masks — Indigenous resurgence as anti-colonial.`, v:{WP:6,SS:6,CE:7,SR:6} },
  { n:`Leanne Betasamosake Simpson`, d:`b. 1971`, i:`As We Have Always Done — Nishnaabeg intelligence and resurgence.`, v:{CE:8,RT:7,VA:6,SS:5} },
  { n:`Whitehead\'s pupil — David Ray Griffin`, d:`1939–2022`, i:`Process theology — God and creativity coevolving in event-time.`, v:{TR:7,MR:7,VA:6,RT:6} },

  // ─── 21ST C. & CONTEMPORARY ──────────────────────────────────────
  { n:`Peter Singer (re-noted)`, d:`b. 1946`, i:`(already in db — skip)`, v:{} },
  { n:`Derek Parfit (re-noted)`, d:`1942–2017`, i:`(already in db — skip)`, v:{} },
  { n:`David Chalmers (re-noted)`, d:`b. 1966`, i:`(already in db — skip)`, v:{} },
  { n:`Galen Strawson`, d:`b. 1952`, i:`Panpsychism — experience all the way down, not magic at some threshold.`, v:{MR:7,TE:7,SI:7,TR:6} },
  { n:`Andy Clark`, d:`b. 1957`, i:`Extended mind — cognition leaks out into pen, paper, and phone.`, v:{TE:8,SI:6,ES:6,TR:6} },
  { n:`Alva Noë`, d:`b. 1964`, i:`Out of Our Heads — perception is what we do, not what we have.`, v:{ES:7,TE:7,SI:5,PO:6} },
  { n:`Evan Thompson`, d:`b. 1962`, i:`Mind in Life — enactivism, the autopoietic biology of consciousness.`, v:{ES:7,MR:6,TE:7,SI:6} },
  { n:`Francisco Varela`, d:`1946–2001`, i:`Autopoiesis — biology as self-making circular causality.`, v:{TE:7,ES:7,SR:5,SI:6,MR:5} },
  { n:`Nick Bostrom`, d:`b. 1973`, i:`Superintelligence — existential risk from misaligned optimization.`, v:{TR:8,TD:8,TE:7,UI:6,TV:6,SI:5} },
  { n:`Toby Ord`, d:`b. 1979`, i:`The Precipice — humanity's long future as a moral category.`, v:{TR:7,UI:7,PO:6,TV:5} },
  { n:`William MacAskill`, d:`b. 1987`, i:`Effective altruism and longtermism — doing the most good with the most rigor.`, v:{TR:7,UI:8,PO:7,TE:6} },
  { n:`Hilary Greaves`, d:`b. 1978`, i:`Longtermism — present obligations to vast possible futures.`, v:{TR:7,UI:7,TD:7,TE:6} },
  { n:`Agnes Callard`, d:`b. 1976`, i:`Aspiration — becoming a person who has the value she's reaching for.`, v:{VA:6,SS:7,WP:5,UI:5,TR:6} },
  { n:`Kieran Setiya`, d:`b. 1968`, i:`Midlife — what to want when you have more time than reason.`, v:{TV:6,VA:6,PO:6,SS:5} },
  { n:`Susan Wolf`, d:`b. 1952`, i:`Meaning in Life — engagement with projects of objective worth.`, v:{VA:6,CE:6,UI:5,PO:5} },
  { n:`Cheshire Calhoun`, d:`b. 1953`, i:`Feminist philosophy — moral failure, hope, and what's worth doing.`, v:{UI:6,CE:6,VA:5,SS:5} },
  { n:`Talia Mae Bettcher`, d:`b. 1972`, i:`Trans philosophy — first-person authority over one's own gender.`, v:{SS:7,SR:6,UI:6,SI:5} },
  { n:`Helen Frowe`, d:`b. 1979`, i:`Just war revisited — defensive liability and individual moral standing.`, v:{TR:7,UI:7,SR:6} },
  { n:`Jeff McMahan`, d:`b. 1954`, i:`Ethics of Killing — moral status across the boundary cases of life.`, v:{TR:7,UI:7,SR:6,TD:6} },
  { n:`David Velleman`, d:`b. 1952`, i:`Self-understanding as the form of agency; narratives of the self.`, v:{TR:6,SS:5,VA:5,CE:5} },
  { n:`Tamar Schapiro`, d:`b. 1965`, i:`Inclination as raw material for the will; agency reformed by reasons.`, v:{TR:7,SS:5,WP:5,UI:5} },
  { n:`Jay Garfield`, d:`b. 1955`, i:`Engaging Buddhism — analytic philosophy through Madhyamaka eyes.`, v:{TR:7,MR:6,SI:7,UI:6} },
  { n:`Owen Flanagan`, d:`b. 1949`, i:`Naturalized ethics — moral psychology grounded in biology.`, v:{TE:7,SI:5,UI:6,PO:6} },
  { n:`Ruth Millikan`, d:`b. 1933`, i:`Biosemantics — content as evolved proper function.`, v:{TR:7,TE:8,TD:7,SI:5} },
  { n:`Jenann Ismael`, d:`b. 1968`, i:`The self as a temporal pattern — physics meets first-person experience.`, v:{TR:7,TD:7,SI:6,TE:6} },
  { n:`Kit Fine`, d:`b. 1946`, i:`Essence, dependence, and the ontology of fragments.`, v:{TR:9,TD:9} },
  { n:`Timothy Williamson`, d:`b. 1955`, i:`Knowledge first — knowing as the unanalyzable starting point.`, v:{TR:8,TD:7,SR:6} },
  { n:`Crispin Wright`, d:`b. 1942`, i:`Realism in question — meaning, truth, and rule-following.`, v:{TR:8,TD:7,SR:6} },
  { n:`Frank Jackson`, d:`b. 1943`, i:`Mary's Room — what physicalism leaves out about the redness of red.`, v:{TR:7,MR:5,SR:6,SI:5} },
  { n:`Daniel Dennett (re-noted)`, d:`1942–2024`, i:`(already in db — skip)`, v:{} },
  { n:`David Velleman (re-noted)`, d:`b. 1952`, i:`(see Velleman above)`, v:{} },
  { n:`Cora Diamond`, d:`b. 1937`, i:`The Realistic Spirit — reading Wittgenstein and reading lives morally.`, v:{ES:6,VA:6,UI:6,SR:6} },
  { n:`Talbot Brewer`, d:`b. 1967`, i:`The Retrieval of Ethics — appetites trained by understanding.`, v:{TR:6,VA:6,RT:6,UI:5} },
  { n:`Sarah Buss`, d:`b. 1953`, i:`Autonomous Action — the conditions of self-governing agency.`, v:{SS:6,TR:6,UI:5} },

  // ─── INDIGENOUS, AFRICAN, LATIN AMERICAN (broader fill) ──────────
  { n:`Sobonfu Somé`, d:`1969–2017`, i:`West African Dagara teacher — grief rituals, intimacy of community.`, v:{CE:8,RT:7,MR:6,VA:6,UI:4} },
  { n:`Malidoma Patrice Somé`, d:`1956–2021`, i:`Of Water and the Spirit — initiation as homecoming to a wider self.`, v:{MR:7,RT:8,CE:7,VA:6} },
  { n:`John Mbiti`, d:`1931–2019`, i:`African Religions and Philosophy — "I am because we are."`, v:{CE:9,RT:8,MR:6,UI:5} },
  { n:`Paulin Hountondji`, d:`1942–2024`, i:`African Philosophy: Myth and Reality — written discourse over ethnophilosophy.`, v:{TR:7,SR:7,UI:6,CE:5} },
  { n:`Mogobe Ramose`, d:`b. 1949`, i:`African Philosophy through Ubuntu — wholeness as relational ontology.`, v:{CE:8,MR:6,RT:7,UI:5} },
  { n:`Lewis Gordon`, d:`b. 1962`, i:`Africana existential philosophy — Fanon, the antiblack world, the lived body.`, v:{TV:7,ES:6,SS:6,UI:5,CE:6} },
  { n:`Nkiru Nzegwu`, d:`b. 1953`, i:`African gender, motherhood, and the dual-sex Igbo polity.`, v:{CE:7,RT:6,UI:5} },
  { n:`Oyèrónkẹ́ Oyěwùmí`, d:`b. 1957`, i:`The Invention of Women — Yoruba society without the gender category.`, v:{CE:7,SR:6,UI:5,RT:5} },
  { n:`Sylvia Wynter (re-noted)`, d:`b. 1928`, i:`(already in db — skip)`, v:{} },
  { n:`Édouard Glissant`, d:`1928–2011`, tr:'postcolonial', i:`Poetics of Relation — opacity and the archipelagic right to be unknown.`, v:{CE:7,ES:6,VA:6,SR:6,SS:5} },
  { n:`Suzanne Césaire`, d:`1915–1966`, i:`Tropiques — surrealism and decolonial imagination from Martinique.`, v:{VA:7,ES:6,WP:6,SS:6} },
  { n:`C.L.R. James`, d:`1901–1989`, i:`The Black Jacobins — slaves who made themselves a republic.`, v:{WP:7,UI:7,CE:6,TV:6} },
  { n:`Walter Rodney`, d:`1942–1980`, i:`How Europe Underdeveloped Africa — political economy of empire.`, v:{TE:7,WP:6,UI:6,CE:6,SR:6} },
  { n:`Steve Biko`, d:`1946–1977`, i:`Black Consciousness — psychological liberation precedes political freedom.`, v:{WP:7,SS:7,CE:7,UI:6} },
  { n:`Edward Said`, d:`1935–2003`, i:`Orientalism — knowledge of "the other" as a project of empire.`, v:{SR:7,UI:6,CE:6,WP:5,TE:6} },
  { n:`Stuart Hall (re-noted)`, d:`1932–2014`, i:`(already in db — skip)`, v:{} },
  { n:`Paul Gilroy`, d:`b. 1956`, i:`The Black Atlantic — modernity through the prism of the Middle Passage.`, v:{TV:7,CE:7,UI:6,SR:5} },
  { n:`Sara Ahmed`, d:`b. 1969`, i:`The Promise of Happiness — affect that wills us to align.`, v:{ES:7,SR:7,VA:5,SS:5} },
  { n:`Lauren Berlant`, d:`1957–2021`, i:`Cruel Optimism — attachments to flourishing that obstruct it.`, v:{TV:7,VA:5,SR:6,ES:6} },
  { n:`Eve Kosofsky Sedgwick`, d:`1950–2009`, i:`Epistemology of the Closet — paranoid and reparative reading.`, v:{SR:7,ES:6,SS:5} },
  { n:`José Esteban Muñoz`, d:`1967–2013`, i:`Cruising Utopia — queerness as the not-yet-here.`, v:{VA:7,SS:6,ES:6,UI:5,TV:5} },
  { n:`Achille Mbembe (re-listed already)`, d:`b. 1957`, i:`(see above)`, v:{} },
  { n:`Achille Mbembe — Critique of Black Reason`, d:`b. 1957`, i:`(see Mbembe above)`, v:{} },
  { n:`Boaventura de Sousa Santos`, d:`b. 1940`, tr:'liberation', i:`Epistemologies of the South — knowledge born of struggle.`, v:{CE:7,UI:5,SR:6,WP:5} },
  { n:`Linda Tuhiwai Smith`, d:`b. 1950`, i:`Decolonizing Methodologies — research from the position of the researched.`, v:{CE:7,RT:6,SR:6} },
  { n:`Mariana Ortega`, d:`b. 1965`, tr:'liberation', i:`In-Between — multiplicitous selves of Latina lives.`, v:{ES:6,SS:5,CE:6,SR:5} },
  { n:`Aníbal Quijano`, d:`1928–2018`, i:`Coloniality of power — race as the deepest axis of modern domination.`, v:{SR:7,UI:6,CE:6,WP:5} },
  { n:`Walter Mignolo`, d:`b. 1941`, i:`Local histories/global designs — pluri-versality against the universal.`, v:{SR:7,CE:6,UI:4} },

  // ─── SCIENTISTS-AS-PHILOSOPHERS / NATURAL PHILOSOPHY ─────────────
  { n:`Isaac Newton`, d:`1643–1727`, i:`Mathematical principles of natural philosophy; absolute space and time.`, v:{TR:9,TE:8,RT:6,TD:9,UI:7,MR:5} },
  { n:`Robert Boyle`, d:`1627–1691`, i:`Skeptical Chymist — the experimental program; clockmaker God.`, v:{TE:8,TR:7,SR:5,RT:6,UI:5} },
  { n:`Christiaan Huygens`, d:`1629–1695`, i:`Pendulum clocks, wave optics, plurality of inhabited worlds.`, v:{TR:8,TE:8,TD:7,UI:6} },
  { n:`Antoine Lavoisier`, d:`1743–1794`, i:`Conservation of mass — chemistry refounded on quantitative method.`, v:{TR:8,TE:9,UI:6,TD:6} },
  { n:`Pierre-Simon Laplace`, d:`1749–1827`, i:`Celestial mechanics; the demon who, knowing all positions, sees all futures.`, v:{TR:9,TE:7,TD:9,UI:7,MR:1} },
  { n:`Carl Friedrich Gauss`, d:`1777–1855`, i:`Disquisitiones — non-Euclidean intuitions kept quietly in his desk.`, v:{TR:10,TD:9} },
  { n:`Bernhard Riemann`, d:`1826–1866`, i:`On the hypotheses underlying geometry — space as a manifold to be measured.`, v:{TR:10,TD:10,MR:5} },
  { n:`Charles Darwin`, d:`1809–1882`, i:`Origin of Species — descent with modification; the philosopher's hammer.`, v:{TE:9,SR:6,TR:6,UI:5,TV:4,RT:3} },
  { n:`Alfred Russel Wallace`, d:`1823–1913`, i:`Co-discoverer of natural selection; spiritualism on the human side.`, v:{TE:7,TR:6,MR:6,UI:5} },
  { n:`Gregor Mendel`, d:`1822–1884`, i:`The peas in the abbey garden — discrete inheritance discovered.`, v:{TE:9,TR:7,UI:5,AT:5} },
  { n:`Henri Poincaré`, d:`1854–1912`, i:`Conventionalism — geometries chosen for fit, not found in nature.`, v:{TR:8,TD:8,SR:6,UI:5} },
  { n:`Pierre Duhem`, d:`1861–1916`, i:`Aim and structure of physical theory — theory underdetermined by data.`, v:{SR:7,TR:7,TE:6,TD:6} },
  { n:`Albert Einstein`, d:`1879–1955`, i:`Relativity — God doesn't play dice; the universe yields to imagination.`, v:{TR:9,TD:9,MR:6,UI:7,SS:6} },
  { n:`Niels Bohr`, d:`1885–1962`, i:`Complementarity — wave and particle held together by the question asked.`, v:{TR:7,MR:6,SI:6,UI:5,TD:7} },
  { n:`Werner Heisenberg`, d:`1901–1976`, i:`Uncertainty — what we know depends on what we ask.`, v:{TR:7,SI:5,SR:6,MR:5,TD:7} },
  { n:`Erwin Schrödinger`, d:`1887–1961`, i:`What is Life? — the order from order across the boundary of physics.`, v:{TR:8,TD:8,MR:6,SI:5} },
  { n:`Wolfgang Pauli`, d:`1900–1958`, i:`Exclusion principle; Jungian correspondence on synchronicity.`, v:{TR:8,MR:6,TD:8,SI:5} },
  { n:`Sigmund Freud`, d:`1856–1939`, i:`The unconscious; civilization built on renounced desire.`, v:{TV:7,TE:6,SR:7,SI:6,ES:6,AT:4} },
  { n:`Carl Jung (re-noted)`, d:`1875–1961`, i:`(already in db — skip)`, v:{} },
  { n:`Wilhelm Wundt`, d:`1832–1920`, i:`Founder of experimental psychology; the social mind of peoples.`, v:{TE:8,TR:6,CE:6,SR:5} },
  { n:`William James (re-noted)`, d:`1842–1910`, i:`(already in db — skip)`, v:{} },
  { n:`Edward O. Wilson`, d:`1929–2021`, i:`Consilience — unity of knowledge across the natural sciences.`, v:{TE:8,UI:7,TD:7,SR:5,RT:5} },
  { n:`Stephen Jay Gould`, d:`1941–2002`, i:`Non-overlapping magisteria; punctuated equilibria; contingency in history.`, v:{TE:8,SR:6,UI:5,TV:5} },
  { n:`Lynn Margulis`, d:`1938–2011`, i:`Symbiogenesis — cells nested in cells; competition is not the whole story.`, v:{TE:8,CE:6,SR:6,UI:5} },
  { n:`Stuart Kauffman`, d:`b. 1939`, i:`At Home in the Universe — order for free; self-organization in complex systems.`, v:{TE:7,TD:8,MR:5,UI:5} },
  { n:`Ilya Prigogine`, d:`1917–2003`, i:`Dissipative structures — order through far-from-equilibrium flow.`, v:{TR:7,TD:8,TE:7,UI:5} },
  { n:`Henri Bergson (re-noted)`, d:`1859–1941`, i:`(already in db — skip)`, v:{} },
  { n:`D.S. Wilson`, d:`b. 1949`, i:`Multilevel selection — group selection rehabilitated for behavior.`, v:{TE:7,CE:6,UI:5,SR:5} },
  { n:`Frans de Waal`, d:`1948–2024`, i:`Primate ethics — empathy and morality with deep evolutionary roots.`, v:{TE:7,ES:6,VA:6,CE:6,SR:5} },
  { n:`Iain McGilchrist`, d:`b. 1953`, i:`The Master and His Emissary — hemispheres as ways of attending to the world.`, v:{TE:6,MR:7,TD:6,ES:6,UI:5} },
  { n:`Antonio Damasio`, d:`b. 1944`, i:`Somatic markers — feeling as the substrate of reason, not its opposite.`, v:{TE:8,ES:7,SI:5,VA:5} },
  { n:`Anil Seth`, d:`b. 1972`, i:`Being You — perception as a controlled hallucination.`, v:{TE:7,SI:6,SR:6,TR:6} },
  { n:`Karl Friston`, d:`b. 1959`, i:`Free energy principle — minds as inference engines minimizing surprise.`, v:{TR:8,TE:7,TD:8,SI:5} },
];

// ─── Output ───────────────────────────────────────────────────────
// Dedup by name (case-insensitive). Skip stub "re-noted" duplicates.
const seen = new Set();
const out = [];
const traditionStats = {};
let withoutTradition = 0;
for (const e of ENTRIES) {
  const key = e.n.toLowerCase().trim();
  if (seen.has(key)) continue;
  if (e.i && e.i.startsWith('(already in db') || e.i && e.i.startsWith('(see ')) continue;
  if (!e.i) continue;
  seen.add(key);
  const tradition = e.tr || inferTradition(e);
  if (tradition) traditionStats[tradition] = (traditionStats[tradition] || 0) + 1;
  else withoutTradition++;
  const vec = expand(e.v || {}, tradition);
  const arch = nearestArchetype(vec);
  out.push({
    name: e.n,
    dates: e.d,
    keyIdea: e.i,
    vector: vec,
    archetypeKey: arch.key,
    archetypeName: arch.name,
    aliases: genAliases(e.n),
  });
}

if (!process.argv[2]) console.log(JSON.stringify(out, null, 2));
console.error(`Generated ${out.length} entries.`);
console.error(`Without inferred tradition: ${withoutTradition}`);
console.error(`Top traditions: ${Object.entries(traditionStats).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([k,v])=>`${k}=${v}`).join(', ')}`);

// ─── Format variants ───
function jsonEscape(s) {
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

// Emit lib/philosophers.ts entries: full TS-typed JSON-style objects.
function emitLibFormat(rows) {
  return rows.map(r => {
    const dimVals = r.vector.join(',\n      ');
    const aliasArr = r.aliases.length
      ? r.aliases.map(a => `"${jsonEscape(a)}"`).join(', ')
      : '';
    return `  {
    "name": "${jsonEscape(r.name)}",
    "dates": "${jsonEscape(r.dates)}",
    "keyIdea": "${jsonEscape(r.keyIdea)}",
    "vector": [
      ${dimVals}
    ],
    "archetypeKey": "${r.archetypeKey}",
    "archetypeName": "${jsonEscape(r.archetypeName)}",
    "aliases": [${aliasArr}]
  }`;
  }).join(',\n');
}

// Emit mull.html PHILOSOPHERS entries: compact `v({...})` form.
const DIM_LABELS = ['TV','VA','WP','TR','TE','RT','MR','SR','CE','SS','PO','TD','AT','ES','UI','SI'];
function emitHtmlFormat(rows) {
  return rows.map(r => {
    const dimObj = DIM_LABELS.map((k, i) => `${k}:${r.vector[i]}`).join(',');
    return `  { name:"${jsonEscape(r.name)}", dates:"${jsonEscape(r.dates)}", keyIdea:"${jsonEscape(r.keyIdea)}",
    p: v({${dimObj}}) }`;
  }).join(',\n');
}

// ─── Apply mode: write both files in place ────────────────────────────
//
// Splices new entries between the BEGIN/END sentinels in
// lib/philosophers.ts and public/mull.html. The sentinels are
// one-line comments specifically formatted to be unambiguous and
// grep-able; if either file is missing them, we bail loudly rather
// than guess at where to insert.

const APPLY = process.argv.includes('--apply');
if (APPLY) {
  const { readFile, writeFile } = await import('node:fs/promises');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const REPO = join(__dirname, '..');

  // Splice helper: replace everything between the two sentinel lines
  // with the new body. Throws if either marker is missing. Preserves
  // the END sentinel's full line (including its leading indent) by
  // slicing from the start of the END line, not from the END text
  // itself.
  function spliceBetweenSentinels({ src, begin, end, body, file }) {
    const beginIdx = src.indexOf(begin);
    const endIdx = src.indexOf(end);
    if (beginIdx < 0) throw new Error(`Missing BEGIN sentinel in ${file}: "${begin}"`);
    if (endIdx < 0) throw new Error(`Missing END sentinel in ${file}: "${end}"`);
    if (endIdx < beginIdx) throw new Error(`Sentinels out of order in ${file}`);
    const beginEol = src.indexOf('\n', beginIdx);
    const endLineStart = src.lastIndexOf('\n', endIdx) + 1;
    return src.slice(0, beginEol + 1) + body + '\n' + src.slice(endLineStart);
  }

  const BEGIN = '// ─── BEGIN gen-philosophers Wave 2 ───';
  const END   = '// ─── END gen-philosophers Wave 2 ───';

  // ── lib/philosophers.ts ──
  const libPath = join(REPO, 'lib', 'philosophers.ts');
  const libSrc = await readFile(libPath, 'utf8');
  // Output is "  { … },\n  { … },\n  { … }" — emit*Format joins with
  // `,\n` so there's no trailing comma on the last entry, matching the
  // existing file's style.
  const libBody = emitLibFormat(out);
  const newLib = spliceBetweenSentinels({
    src: libSrc, begin: BEGIN, end: END, body: libBody, file: 'lib/philosophers.ts',
  });
  await writeFile(libPath, newLib);
  console.error(`Wrote lib/philosophers.ts (${out.length} Wave 2 entries between sentinels).`);

  // ── public/mull.html ──
  const mullPath = join(REPO, 'public', 'mull.html');
  const mullSrc = await readFile(mullPath, 'utf8');
  // The HTML format has no aliases — mull.html's PHILOSOPHERS table
  // is name-only and doesn't search by alias. emitHtmlFormat reflects
  // that (just name/dates/keyIdea/p).
  const mullBody = emitHtmlFormat(out);
  const newMull = spliceBetweenSentinels({
    src: mullSrc, begin: BEGIN, end: END, body: mullBody, file: 'public/mull.html',
  });
  await writeFile(mullPath, newMull);
  console.error(`Wrote public/mull.html (${out.length} Wave 2 entries between sentinels).`);

  console.error(`\nDone. Both files updated. To verify: \`git diff lib/philosophers.ts public/mull.html\``);
}

// ─── Legacy stdout modes (kept for backwards compat) ──────────────────
const mode = process.argv[2] || 'json';
if (mode === 'lib') {
  console.log(emitLibFormat(out));
} else if (mode === 'html') {
  console.log(emitHtmlFormat(out));
}

if (process.argv[2] === 'untagged') {
  for (const e of ENTRIES) {
    if (e.i && (e.i.startsWith('(already in db') || e.i.startsWith('(see '))) continue;
    if (!e.i) continue;
    const t = e.tr || inferTradition(e);
    if (!t) console.log(e.n + '  |  ' + e.i.slice(0, 80));
  }
}
