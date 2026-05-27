# Philosopher calibration report

Generated: 2026-05-27T22:34:35.756Z.  Corpus size: 552.

Top-1 nearest-kin similarity — mean 0.992, median 0.994.
Entries below the isolation threshold (0.92): **0**.
Entries below the archetype-margin threshold (0.02): **354**.

## Archetype distribution

| Archetype | Count |
|---|---|
| The Cartographer | 130 |
| The Forge | 100 |
| The Pilgrim | 70 |
| The Threshold | 66 |
| The Lighthouse | 55 |
| The Touchstone | 55 |
| The Keel | 29 |
| The Hearth | 29 |
| The Garden | 10 |
| The Hammer | 8 |

## Most isolated entries

These have a low top-1 nearest-kin similarity. Isolation is sometimes legitimate (Buddha is genuinely far from anyone) and sometimes a calibration bug (a Wave 2 vector that needs nudging). Review each by inspecting the top-5 kin — if they make sense, the entry is fine; if they look totally unrelated, the vector probably needs work.

The **Status** column reflects `scripts/calibration-decisions.json` — entries that have been human-reviewed get a verdict (✓ accepted = model feature; ⚠ review = vector probably needs work, deferred; ✦ nudge = decided change not yet applied). Entries with no status are unreviewed.

| Name | Dates | Top-1 sim | Classified | Status | Top 5 nearest kin |
|---|---|---|---|---|---|
| Ayn Rand | 1905–1982 | 0.938 | The Hammer | ✓ accepted | Mary Wollstonecraft (94%); Mill (92%); Sartre (91%); Voltaire (91%); Emma Goldman (91%) |
| Pyrrho | ~360–270 BCE | 0.959 | The Touchstone | ✓ accepted | Krishnamurti (96%); Sextus Empiricus (95%); Aenesidemus (95%); Wittgenstein (95%); Bodhidharma (94%) |
| Descartes | 1596–1650 | 0.966 | The Lighthouse | ✓ accepted | Christine Korsgaard (97%); Adrian Piper (96%); Ruth Barcan Marcus (96%); Alonzo Church (96%); Anton Wilhelm Amo (96%) |
| Derek Parfit | 1942–2017 | 0.967 | The Cartographer | ✓ accepted | Spinoza (97%); Gottlob Frege (96%); David Lewis (96%); Jenann Ismael (96%); Nick Bostrom (96%) |
| Hume | 1711–1776 | 0.973 | The Touchstone | ✓ accepted | Montaigne (97%); Richard Rorty (97%); Arcesilaus (97%); Bernard Mandeville (97%); Sextus Empiricus the Younger (97%) |
| Nagarjuna | ~150–250 CE | 0.973 | The Threshold | ✓ accepted | Vasubandhu (97%); Mahavira (97%); Adi Shankara (97%); Asanga (97%); Tsongkhapa (97%) |
| Schopenhauer | 1788–1860 | 0.973 | The Threshold | ✓ accepted | Pascal (97%); Wittgenstein (97%); Kierkegaard (96%); Heidegger (96%); Bhartrihari (96%) |
| Buddha | ~563–483 BCE | 0.973 | The Threshold | ✓ accepted | Dogen (97%); Mahavira (97%); Laozi (96%); Kumarajila (96%); Patanjali (96%) |
| Kant | 1724–1804 | 0.973 | The Lighthouse | ✓ accepted | Christine Korsgaard (97%); Plato (96%); Anton Wilhelm Amo (96%); Chrysippus (95%); Al-Farabi (95%) |
| Wittgenstein | 1889–1951 | 0.974 | The Touchstone | ✓ accepted | Walter Benjamin (97%); Frank Jackson (97%); Heidegger (97%); Wang Bi (97%); Derrida (97%) |
| Sextus Empiricus | ~160–210 CE | 0.974 | The Touchstone | ✓ accepted | Aenesidemus (97%); Sextus Empiricus the Younger (97%); Arcesilaus (97%); Carneades (97%); Lucian of Samosata (97%) |
| Marx | 1818–1883 | 0.976 | The Forge | ✓ accepted | Angela Davis (98%); Chen Duxiu (98%); Rosa Luxemburg (97%); Frantz Fanon (97%); Stuart Hall (96%) |
| Sartre | 1905–1980 | 0.976 | The Pilgrim | ✓ accepted | Emma Goldman (98%); Simone de Beauvoir (98%); Mikhail Bakunin (97%); Camus (97%); Alain Badiou (97%) |
| Plato | ~428–348 BCE | 0.977 | The Lighthouse | ✓ accepted | Diotima of Mantinea (98%); Hegel (97%); Plotinus (97%); Leibniz (97%); Proclus (96%) |
| U.G. Krishnamurti | 1918–2007 | 0.978 | The Pilgrim | ✓ accepted | Osho (Rajneesh) (98%); Zhuangzi (97%); Toni Packer (97%); Robert Aitken (97%); José Esteban Muñoz (97%) |
| Diogenes of Sinope | ~412–323 BCE | 0.978 | The Hammer | ✓ accepted | Antisthenes (98%); Emma Goldman (95%); Max Stirner (95%); Mikhail Bakunin (95%); Paul Feyerabend (95%) |
| Antisthenes | ~445–365 BCE | 0.978 | The Hammer | ✓ accepted | Diogenes of Sinope (98%); Emma Goldman (95%); Linji Yixuan (95%); Auguste Blanqui (94%); Paul Feyerabend (94%) |
| Heraclitus | ~535–475 BCE | 0.978 | The Pilgrim | ✓ accepted | Bergson (98%); Galen Strawson (98%); Anaxagoras (97%); Edith Wyschogrod (97%); Niels Bohr (97%) |
| Machiavelli | 1469–1527 | 0.979 | The Pilgrim | ✓ accepted | Hobbes (98%); Han Feizi (98%); Walter Mignolo (97%); Francis Hutcheson (97%); Achille Mbembe (96%) |
| Rumi | 1207–1273 | 0.979 | The Threshold | ✓ accepted | Julian of Norwich (98%); Anandamayi Ma (98%); Lalleshwari (Lal Ded) (98%); Baal Shem Tov (98%); Hildegard of Bingen (97%) |
| Joseph de Maistre | 1753–1821 | 0.979 | The Keel | ✓ accepted | Judah Halevi (98%); René Guénon (98%); Bahya ibn Paquda (98%); Edmund Burke (98%); A.K. Coomaraswamy (97%) |
| Mill | 1806–1873 | 0.979 | The Garden | ✓ accepted | Locke (98%); Mary Wollstonecraft (98%); Anthony Ashley Cooper (Shaftesbury) (97%); Voltaire (97%); Jeremy Bentham (97%) |
| Kierkegaard | 1813–1855 | 0.980 | The Pilgrim | ✓ accepted | Lev Tolstoy (98%); Karl Jaspers (98%); Pascal (98%); Sergei Bulgakov (98%); Heidegger (97%) |
| Nietzsche | 1844–1900 | 0.980 | The Hammer | ✓ accepted | Max Stirner (98%); Emma Goldman (96%); Paul Feyerabend (96%); Mikhail Bakunin (96%); Sartre (96%) |
| Max Stirner | 1806–1856 | 0.980 | The Hammer | ✓ accepted | Nietzsche (98%); Paul Feyerabend (97%); Emma Goldman (97%); Sartre (96%); Mikhail Bakunin (96%) |
| Krishnamurti | 1895–1986 | 0.980 | The Threshold | ✓ accepted | Zhuangzi (98%); Nisargadatta Maharaj (98%); Laozi (97%); Toni Packer (97%); Robert Aitken (97%) |
| Zhuangzi | ~369–286 BCE | 0.980 | The Pilgrim | ✓ accepted | Krishnamurti (98%); Wang Bi (98%); Liezi (98%); Toni Packer (97%); U.G. Krishnamurti (97%) |
| Aristotle | 384–322 BCE | 0.981 | The Cartographer |  | Michael Sandel (98%); Philippa Foot (98%); Bernard Williams (98%); Peirce (98%); Pietro Pomponazzi (98%) |
| Mozi | ~470–391 BCE | 0.981 | The Forge |  | Peter Singer (98%); John Rawls (97%); Condorcet (97%); Chen Duxiu (97%); Comte (96%) |
| Krishna Chandra Bhattacharya | 1875–1949 | 0.981 | The Cartographer |  | Heloise of Argenteuil (98%); Karen Armstrong (98%); Bahya ibn Paquda (98%); Edith Stein (98%); A.K. Coomaraswamy (98%) |

### Decision notes

**Ayn Rand** — *accepted*

> Rand 0.94 sim to Wollstonecraft is a model feature. The 16-D model captures *style* of reasoning (assertive, reason-trusting, sovereign-self, rejecting inherited gender/social roles) not political content. Both score high on VA/WP/TR/SS/PO/UI — the divergence is CE (Rand 1 vs Wollstonecraft 6), which the model encodes correctly. Politics-as-conclusion is content the model deliberately doesn't fingerprint.

**Pyrrho** — *accepted*

> Nearest = Sextus Empiricus, Aenesidemus, Krishnamurti, Wittgenstein, Bodhidharma. Sextus + Aenesidemus are direct successors. The Krishnamurti / Bodhidharma / Wittgenstein clustering captures the 'what can be said? nothing' contemplative-skeptical stance that crosses East/West.

**Descartes** — *accepted*

> 97% sim to Korsgaard is legitimate. Both rigorous rationalist Lighthouse thinkers; Korsgaard's whole project is constructivist Kantianism which inherits the Cartesian commitment to reason as the route to certainty. The vector groups by reasoning style, which is exactly what we'd want here.

**Derek Parfit** — *accepted*

> Nearest = Spinoza, Frege, David Lewis, Jenann Ismael, Nick Bostrom. All cool-rationalist Cartographer thinkers arguing for monism / impersonal identity / analytical-system-building. Defensible.

**Hume** — *accepted*

> Nearest = Montaigne, Rorty, Arcesilaus, Mandeville, Sextus the Younger. Empirical-skeptical-essayistic Touchstone lineage. The pairing with Rorty in particular is exactly the kind of dimensional kinship the model is designed to surface.

**Nagarjuna** — *accepted*

> Nearest = Vasubandhu, Mahavira, Adi Shankara, Asanga, Tsongkhapa. All Madhyamaka / Yogacara / Advaita non-dualist Threshold thinkers. The vector captures the apophatic emptiness orientation correctly.

**Schopenhauer** — *accepted*

> Nearest = Pascal, Wittgenstein, Kierkegaard, Heidegger, Bhartrihari. Surprising surface diversity (Catholic mystic, analytic, Lutheran existentialist, Heideggerian, Indian linguistic philosopher) but all share the 'reason has limits, the deep questions resist resolution' Threshold profile. Sensible.

**Buddha** — *accepted*

> Nearest = Dogen, Mahavira, Laozi, Kumarajila, Patanjali. Eastern contemplative-traditions founders. Exactly the cluster we'd expect.

**Kant** — *accepted*

> 97% sim to Korsgaard, 96% to Plato. Both unsurprising: Korsgaard's project is explicitly neo-Kantian, and Kant's transcendental idealism shares structural moves with Platonism (Forms-style universal reason).

**Wittgenstein** — *accepted*

> 97% to Walter Benjamin is surprising at first but defensible — both wrote in fragments, both wrestled with the limits of language and the mystical-adjacent edge of expression (Witt's 'showing what cannot be said' / Benjamin's 'Theological-Political Fragment'), both melancholic outsiders to their dominant schools. The big difference is AT (Witt 7 vs Benjamin 4) — Witt's monastic asceticism — which is captured. Cosine sim still high because so many other dimensions align.

**Sextus Empiricus** — *accepted*

> Nearest is Aenesidemus + Sextus Empiricus the Younger + the rest of the academic-skeptical school. Exactly the right kin.

**Marx** — *accepted*

> Nearest = Angela Davis, Chen Duxiu, Rosa Luxemburg, Frantz Fanon, Stuart Hall. All Marxist-tradition Forge thinkers. The vector is doing its job.

**Sartre** — *accepted*

> Nearest = Emma Goldman, Simone de Beauvoir, Bakunin, Camus, Badiou. Sartre's existentialist-anarchist-Marxist lineage neighbors. Sensible.

**Plato** — *accepted*

> Nearest = Diotima, Hegel, Plotinus, Leibniz, Proclus. The grand rationalist-idealist Lighthouse cluster. Exactly the kin we'd expect to see.

**U.G. Krishnamurti** — *accepted*

> Nearest = Osho, Zhuangzi, Toni Packer, Robert Aitken, José Esteban Muñoz. Non-dualist contemplative cluster + Muñoz's queer-utopian dis-identification. The Muñoz inclusion is the most surprising but defensible — both reject the prepackaged self.

**Diogenes of Sinope** — *accepted*

> Nearest = Antisthenes (his Cynic teacher), Emma Goldman, Max Stirner, Bakunin, Feyerabend. The 'sovereign individual against convention' Hammer cluster. Antisthenes is the lineage; Goldman/Stirner/Bakunin are the modern echoes; Feyerabend is the methodological Hammer in epistemology.

**Antisthenes** — *accepted*

> Mirror of Diogenes (his student) — same Cynic-anarchist cluster, same verdict.

**Heraclitus** — *accepted*

> Nearest = Bergson, Galen Strawson, Anaxagoras, Edith Wyschogrod, Niels Bohr. The 'reality is process / flux / dynamic-not-substance' cluster across ancient + modern + scientific. Sensible.

**Machiavelli** — *accepted*

> Nearest = Hobbes, Han Feizi, Walter Mignolo, Francis Hutcheson, Achille Mbembe. Realist/legalist/power-analysis political philosophy across cultures. Han Feizi is the perfect East Asian Machiavelli analog.

**Rumi** — *accepted*

> Nearest = Julian of Norwich, Anandamayi Ma, Lalleshwari, Baal Shem Tov, Hildegard of Bingen. Mystical-devotional poets across Christian, Hindu, Kashmiri Shaiva, Hasidic, Christian mystic traditions. The cross-traditional mystical Threshold cluster — exactly right.

**Joseph de Maistre** — *accepted*

> Nearest = Judah Halevi, René Guénon, Bahya ibn Paquda, Edmund Burke, Coomaraswamy. Traditionalist + perennial-philosophy + counter-Enlightenment Keel cluster. Politically uncomfortable assemblage but philosophically coherent.

**Mill** — *accepted*

> Nearest = Locke, Wollstonecraft, Shaftesbury, Voltaire, Bentham. The 18th-19th C British liberal Garden cluster. Sensible.

**Kierkegaard** — *accepted*

> Nearest = Tolstoy, Jaspers, Pascal, Sergei Bulgakov, Heidegger. Anguished religious-existential Pilgrim cluster — the lineage from Pascal forward, with Heidegger as the secular existential heir.

**Nietzsche** — *accepted*

> Nearest = Max Stirner, Emma Goldman, Feyerabend, Bakunin, Sartre. Sovereign-individualist Hammer cluster. Stirner is the philosophical predecessor.

**Max Stirner** — *accepted*

> Mirror of Nietzsche — same cluster, same verdict.

**Krishnamurti** — *accepted*

> Nearest = Zhuangzi, Nisargadatta Maharaj, Laozi, Toni Packer, Robert Aitken. The Daoist + Advaita + Zen contemplative cluster. Exactly right.

**Zhuangzi** — *accepted*

> Mirror of Krishnamurti — Daoist core, same cluster, same verdict.

## Most archetype-ambiguous entries

These sit nearly equidistant between two archetypes. A small margin is honest for paradoxical thinkers (Spinoza, Pascal, Wittgenstein) and a red flag for everyone else — if a thinker should clearly be one archetype, the vector may need to lean more in that direction.

| Name | Classified | Runner-up | Margin |
|---|---|---|---|
| Pierre Duhem | The Forge | The Cartographer | 0.0000 |
| Dalai Lama (14th) | The Hearth | The Threshold | 0.0000 |
| Tamar Schapiro | The Touchstone | The Cartographer | 0.0001 |
| David Velleman | The Touchstone | The Cartographer | 0.0001 |
| Octavio Paz | The Pilgrim | The Touchstone | 0.0001 |
| Mary Warnock | The Forge | The Pilgrim | 0.0001 |
| Hélène Cixous | The Pilgrim | The Touchstone | 0.0001 |
| Auguste Blanqui | The Hammer | The Pilgrim | 0.0001 |
| Sigmund Freud | The Cartographer | The Pilgrim | 0.0001 |
| Gayatri Spivak | The Touchstone | The Pilgrim | 0.0001 |
| Frank Ramsey | The Garden | The Forge | 0.0001 |
| Foucault | The Touchstone | The Pilgrim | 0.0003 |
| Pyotr Kropotkin | The Forge | The Pilgrim | 0.0003 |
| Gertrude Stein | The Forge | The Pilgrim | 0.0004 |
| Hugh of Saint Victor | The Keel | The Lighthouse | 0.0004 |
| Edward Said | The Pilgrim | The Forge | 0.0004 |
| Carl Jung | The Pilgrim | The Cartographer | 0.0005 |
| Rudolf Carnap | The Cartographer | The Forge | 0.0005 |
| Mary Midgley | The Pilgrim | The Forge | 0.0006 |
| Oyèrónkẹ́ Oyěwùmí | The Forge | The Pilgrim | 0.0006 |
| Jenann Ismael | The Cartographer | The Touchstone | 0.0006 |
| Mary Calkins | The Pilgrim | The Forge | 0.0007 |
| Cheng Yi | The Cartographer | The Keel | 0.0007 |
| Toby Ord | The Forge | The Cartographer | 0.0008 |
| Nel Noddings | The Pilgrim | The Forge | 0.0008 |
| Sara Ruddick | The Pilgrim | The Forge | 0.0008 |
| Iris Murdoch | The Keel | The Cartographer | 0.0008 |
| Cheng Hao | The Keel | The Cartographer | 0.0009 |
| Hildegard of Bingen | The Lighthouse | The Hearth | 0.0009 |
| Al-Farabi | The Lighthouse | The Cartographer | 0.0009 |
