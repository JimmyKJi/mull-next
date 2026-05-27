# Persona test report

Generated: 2026-05-27T19:00:07.701Z.

Quiz parser sanity check: 20 quick questions, 50 detailed questions loaded.

- Canonical (10): 10/10 pass
- Edge (5): 5/5 pass
- Paradox (4): 4/4 signal low-margin tension (margin ≤ 0.04)

## Canonical personas

### ✓ pass — The Stoic

> Marcus Aurelius reader who actually practices premortems. Focused on what they control, accepting of what they can't. Quiet.

Classified: **The Keel** (sim 0.999)
Runner-up: The Cartographer (sim 0.955)
Margin: 0.0437
Expected one of: keel.

### ✓ pass — The Existentialist

> Camus reader. Knows the absurd is real, refuses both suicide and philosophical retreat. Acts with full freedom.

Classified: **The Pilgrim** (sim 0.975)
Runner-up: The Hammer (sim 0.966)
Margin: 0.0091
Expected one of: pilgrim.

### ✓ pass — The Systematic Rationalist

> Plato + Kant reader. Reality has a rational structure; reason can grasp it; the universal is what matters.

Classified: **The Lighthouse** (sim 0.994)
Runner-up: The Cartographer (sim 0.934)
Margin: 0.0598
Expected one of: lighthouse.

### ✓ pass — The Patient Mapper

> Spinoza + Parfit reader. Build the system. Trace how everything connects. Don't skip steps.

Classified: **The Cartographer** (sim 0.989)
Runner-up: The Lighthouse (sim 0.963)
Margin: 0.0256
Expected one of: cartographer.

### ✓ pass — The Sceptic

> Hume + Sextus Empiricus reader. Suspend judgment. Most philosophical certainties dissolve under pressure.

Classified: **The Touchstone** (sim 0.977)
Runner-up: The Pilgrim (sim 0.961)
Margin: 0.0162
Expected one of: touchstone.

### ✓ pass — The Iconoclast

> Nietzsche + Stirner reader. The inherited values are dead. Sovereign self against the herd. Break what doesn't serve.

Classified: **The Hammer** (sim 0.984)
Runner-up: The Pilgrim (sim 0.957)
Margin: 0.0269
Expected one of: hammer.

### ✓ pass — The Mystic

> Rumi + Pseudo-Dionysius reader. The deepest truths are apophatic. Reason runs out before reality does.

Classified: **The Threshold** (sim 0.953)
Runner-up: The Lighthouse (sim 0.917)
Margin: 0.0367
Expected one of: threshold.

### ✓ pass — The Reformist Liberal

> Mill + Wollstonecraft reader. Build forward through institutions. Reason + liberty + mutual sympathy.

Classified: **The Forge** (sim 0.985)
Runner-up: The Cartographer (sim 0.960)
Margin: 0.0248
Expected one of: forge, garden.

### ✓ pass — The Tradition-Keeper

> Confucius + Augustine reader. The practices that survived weren't lucky. Inherit and pass on.

Classified: **The Hearth** (sim 0.984)
Runner-up: The Keel (sim 0.950)
Margin: 0.0338
Expected one of: hearth.

### ✓ pass — The Epicurean Gardener

> Epicurus + Montaigne reader. Cultivate the small good things. Friendship, simple pleasures, freedom from anxiety.

Classified: **The Garden** (sim 0.989)
Runner-up: The Touchstone (sim 0.954)
Margin: 0.0356
Expected one of: garden.

## Edge personas

### ✓ pass — The Late-Stoic Pilgrim

> Stoic reader who also walks alone with the question — Marcus Aurelius meets Camus. Should be Keel or Pilgrim depending on which way the dimensions tip.

Classified: **The Keel** (sim 0.971)
Runner-up: The Pilgrim (sim 0.964)
Margin: 0.0076
Expected one of: keel, pilgrim.

### ✓ pass — The Engaged Cartographer

> Builds the system but uses it in the world — Spinoza-style monism turned practical. Cartographer or Forge.

Classified: **The Cartographer** (sim 0.980)
Runner-up: The Forge (sim 0.973)
Margin: 0.0079
Expected one of: cartographer, forge.

### ✓ pass — The Quiet Mystic-Sceptic

> Knows apophatic mysticism, suspends ordinary judgment, neither claims nor denies. Threshold or Touchstone.

Classified: **The Threshold** (sim 0.948)
Runner-up: The Keel (sim 0.915)
Margin: 0.0329
Expected one of: threshold, touchstone.

### ✓ pass — The Reformist Tradition-Keeper

> Reveres inherited practice, would still adjust it — Burkean-Whig. Hearth or Forge.

Classified: **The Hearth** (sim 0.974)
Runner-up: The Cartographer (sim 0.965)
Margin: 0.0093
Expected one of: hearth, forge.

### ✓ pass — The Lighthouse-Touchstone Borderline

> Wants reasoned universal truth — but holds doubt as a discipline. Wittgenstein late + Kant's critical edge. Lighthouse or Touchstone.

Classified: **The Lighthouse** (sim 0.941)
Runner-up: The Cartographer (sim 0.935)
Margin: 0.0067
Expected one of: lighthouse, touchstone.

## Paradox personas

### ✓ pass — The Conservative Anarchist

> Reveres inherited institutions AND insists moral authority is internal. Burke + Stirner. The high-RT, high-SS quadrant the 10-archetype model deliberately doesn't cover (see /methodology §Open Questions). Expected: any plausible archetype with a low margin so the result UI surfaces tension.

Classified: **The Cartographer** (sim 0.955)
Runner-up: The Keel (sim 0.942)
Margin: 0.0134
Expected: low margin (≤ 0.04) to signal tension. ✓ tension detected

### ✓ pass — The Mystical Empiricist

> Trusts bodily experience AND reaches for the apophatic. James + Rumi. Crosses Garden and Threshold.

Classified: **The Garden** (sim 0.942)
Runner-up: The Pilgrim (sim 0.929)
Margin: 0.0123
Expected: low margin (≤ 0.04) to signal tension. ✓ tension detected

### ✓ pass — The Practical Idealist

> Universal moral principles AND practical worldly engagement. Kant's ethics + Mill's reformism. Crosses Lighthouse and Forge.

Classified: **The Cartographer** (sim 0.976)
Runner-up: The Forge (sim 0.971)
Margin: 0.0059
Expected: low margin (≤ 0.04) to signal tension. ✓ tension detected

### ✓ pass — The Solitary Communitarian

> Treats the self as embedded in tradition AND insists on inward solitude. Augustine + Kierkegaard. Crosses Hearth and Pilgrim.

Classified: **The Keel** (sim 0.941)
Runner-up: The Threshold (sim 0.938)
Margin: 0.0030
Expected: low margin (≤ 0.04) to signal tension. ✓ tension detected
