// Canonical 60 — the "essentials" subset of philosophers shown by
// default in the constellation map. Hand-picked for:
//   - broad name recognition (anyone with a passing interest in
//     philosophy will know most of these)
//   - balanced coverage across archetypes (~6 per archetype)
//   - era/tradition diversity (pre-Socratics through 20th century,
//     Western + Eastern + post-colonial)
//
// The full 560-philosopher cloud stays available — users can opt in
// by clicking the legend's "SHOW ALL 560" toggle, or by searching
// any name not in the canonical set.
//
// All names must match exactly what's in lib/philosophers.ts —
// PHILOSOPHERS.find(p => p.name === '…') is what consumers use to
// resolve them. Cross-checked against the actual data file: any
// name in this list that doesn't appear in PHILOSOPHERS will be
// silently dropped (not an error — keeps the canonical list usable
// even if the underlying corpus shifts).

export const CANONICAL_PHILOSOPHER_NAMES: ReadonlySet<string> = new Set([
  // Greek + Hellenistic + Roman
  "Heraclitus",
  "Plato",
  "Aristotle",
  "Pyrrho of Elis",
  "Epicurus",
  "Marcus Aurelius",
  "Epictetus",
  "Seneca",
  "Diogenes the Cynic",
  "Plotinus",
  // Eastern + Indian + Chinese
  "Buddha",
  "Confucius",
  "Lao Tzu",
  "Zhuangzi",
  "Mencius",
  "Nāgārjuna",
  // Medieval
  "Augustine",
  "Boethius",
  "Thomas Aquinas",
  "Meister Eckhart",
  // Early modern
  "Michel de Montaigne",
  "René Descartes",
  "Baruch Spinoza",
  "Blaise Pascal",
  "John Locke",
  "Gottfried Leibniz",
  "David Hume",
  "Jean-Jacques Rousseau",
  "Immanuel Kant",
  "Edmund Burke",
  "Mary Wollstonecraft",
  // 19th century
  "Georg Wilhelm Friedrich Hegel",
  "Arthur Schopenhauer",
  "John Stuart Mill",
  "Søren Kierkegaard",
  "Karl Marx",
  "Friedrich Nietzsche",
  "William James",
  // Early 20th century
  "Ludwig Wittgenstein",
  "Bertrand Russell",
  "Martin Heidegger",
  "Jean-Paul Sartre",
  "Simone de Beauvoir",
  "Albert Camus",
  "Hannah Arendt",
  "Simone Weil",
  "Maurice Merleau-Ponty",
  // 20th century continued
  "John Dewey",
  "W.E.B. Du Bois",
  "Alfred North Whitehead",
  "Karl Popper",
  "Iris Murdoch",
  "John Rawls",
  "Michel Foucault",
  "Jacques Derrida",
  "Hans-Georg Gadamer",
  "Alasdair MacIntyre",
  "Martha Nussbaum",
  "Amartya Sen",
  // Modern voices
  "Wendell Berry",
]);

/** Filter helper — does this philosopher belong to the canonical 60? */
export function isCanonical(name: string): boolean {
  return CANONICAL_PHILOSOPHER_NAMES.has(name);
}
