# The tradition + sovereignty gap

The paradoxical-persona calibration test (per PROJECT.md) found that the
Mull archetype set has **no archetype for the "tradition + sovereignty"
stance** — a real philosophical position represented by Burke,
Tocqueville, Hayek, Scruton, classical-liberal libertarians, and a
non-trivial slice of contemporary readers. The Conservative Anarchist
persona landed on Keel (defensible-but-not-ideal) and the system's
margin shrank on a handful of related personas.

This document presents the gap, the three options for addressing it,
and a recommendation. It's an open design question; the right answer
depends on how much weight you want to give a stance that's culturally
prominent but philosophically a thin slice of the canon.

---

## What the gap looks like

Two relevant dimensions:

- **RT (Reverence for Tradition)** — treats inherited practices and
  long-surviving institutions as carrying hidden wisdom
- **SS (Sovereign Self)** — locates moral authority in the
  individual; you author your own life

These two are *negatively correlated* in the existing archetype set:

| Archetype | RT | SS | What this combo means |
|---|---|---|---|
| **Hearth** (Confucius) | 9 | 2 | high tradition, low sovereignty — communal embedded |
| **Hammer** (Nietzsche) | 1 | 9 | low tradition, high sovereignty — sovereign break with the past |
| **Pilgrim** (Camus) | 2 | 9 | low tradition, high sovereignty — secular self-authoring |
| **Forge** (Mill) | 2 | 5 | low tradition, mid sovereignty — building forward |
| Burke / Tocqueville / Hayek / Scruton | **7–8** | **7–8** | high tradition AND high sovereignty — preserve inherited goods, choose your own path |

There's no archetype in the high-RT, high-SS quadrant. The model
implicitly treats this combination as a contradiction. It isn't:
real philosophers and real readers occupy this space.

Right now a Burkean conservative-libertarian who takes the quiz
will land on Keel (Marcus Aurelius — Stoic) by default, because
Stoicism is the closest "I take inherited duties seriously but
moral authority is internal" stance the model knows. Keel's
RT (6) and SS (5) aren't enormously off, but the patron and the
prose feel wrong for a Burkean.

---

## Three options

### Option A — Add an 11th archetype

Introduce a "Steward" or "Anchor" archetype with a high-RT, high-SS
signature. Possible patrons:

- **Burke** — canonical conservative (Reflections on the
  Revolution in France). The clearest fit, but politically loaded
  for some audiences.
- **Tocqueville** — more nuanced; conservatism with a liberal
  sociological lens. Less politically loaded.
- **Cicero** — older, less culturally charged, but his
  Stoic-republican stance is closer to Keel than to the new
  archetype.

Suggested signature: `RT:8, SS:7, TR:7, PO:8, UI:6, CE:5`.

**Pros**
- Honest representation of a real stance that ~5–10% of users
  plausibly hold
- Closes a real gap in the model
- Symmetry-completing — fills the empty quadrant

**Cons**
- Cascading work: new figure SVG, new color palette, new
  long-form prose at `/archetype/<slug>`, new OG image, new entry
  in the quiz calibration personas, re-running the canonical-10
  persona test (it might still pass, but every test needs to
  re-run)
- Burke is politically charged in a way Marcus Aurelius isn't —
  users who land on it might bristle at the label even if it
  fits their stance
- The 10-archetype set is documented and marketed; bumping to 11
  is a content / messaging change too

### Option B — Widen an existing archetype

Adjust one of the existing 10 to absorb this stance. Two candidates:

- **Pilgrim**: bump RT from 2 to 5–6. Pulls the archetype away
  from Camus toward something more like Augustine's pilgrim. Risk:
  drift on existing Pilgrim classifications (the calibration test
  passed at 10/10 specifically with these values).
- **Cartographer**: bump RT from 6 to 8 and SS from 5 to 7. The
  patient mapper might also revere inherited wisdom. Risk:
  Cartographer becomes too broad — it already holds 130 of 560
  entries (23%) at current weights.

**Pros**
- No new archetype; nothing to design
- Smallest content change

**Cons**
- Drift: changing target vectors shifts every other entry's
  classification by some amount. Cartographer's PO was already
  bumped 6→8 in the pre-launch session; another bump risks
  losing the test-passing calibration.
- Distorts the archetype's identity. Pilgrim with high RT isn't
  really a pilgrim anymore.

### Option C — Document as a known model limitation

Acknowledge the gap explicitly in `/methodology` and in the result
copy. Don't add or change archetypes. When a Burkean-leaning user
gets classified as Keel with low margin, the existing close-call
chip already softens this (it says "you're a hybrid").

**Pros**
- Zero code changes
- Honest about the model's coarse-grained nature, which is
  consistent with the project's voice ("the archetype is a label,
  not a verdict")
- Defers the design conversation until you see real users hit
  this gap and complain (the soft launch is a way to find out)

**Cons**
- Users who don't read /methodology won't know
- The Conservative Anarchist persona still lands on a non-ideal
  archetype — the existing 9/10 paradox-persona score doesn't
  improve

---

## Recommendation

**Option C now; reconsider Option A after the launch.**

Reasoning:

- The stance is real but represents a thin slice of likely users.
  The 30–50 friends in your soft launch will skew toward
  young-progressive-curious — the Burkean stance is unlikely to
  show up much in early signal.
- Option A is the right long-term answer but it's a meaningful
  content + design pass (new figure, palette, prose, OG image,
  i18n keys) that competes with Stripe / Mo / forum work that's
  also waiting for post-launch attention.
- Option B is the wrong fix — distorting an existing archetype
  to cover a missing stance makes both the existing classification
  and the new one worse.
- The close-call + productive-tension chips already soften
  borderline classifications, which mitigates the symptom even
  without fixing the cause.

**Concrete next steps if we go with C:**

1. Add a paragraph to `/methodology` acknowledging the gap.
   Suggested copy:

   > Mull's ten archetypes don't cover every philosophical stance
   > with equal sharpness. The "tradition + sovereignty"
   > combination — the Burkean conservative who venerates
   > inherited institutions while locating moral authority in the
   > individual — sits in an unclaimed quadrant of the 16-D
   > space. People in that quadrant will land near Keel or Hearth
   > but rarely *on* them. The dimensional reading is the more
   > honest portrait; the archetype label is approximate. A
   > future model revision may add an archetype here.

2. Watch for it in launch feedback. If three or more friends
   surface this confusion, bump priority on Option A.
3. If you want to move on Option A before then, the design
   sketch in this doc is the starting point — let's design the
   figure + palette together.

---

## If you want Option A now

Here's the rough work plan, ordered:

1. Pick a patron (Tocqueville is my preferred — less politically
   charged than Burke, more philosophically substantive than
   Cicero in this context)
2. Settle on signature dims. Suggestion: `RT:8, SS:7, TR:7, PO:8,
   UI:6, CE:5` — feel free to nudge
3. Design a figure SVG to match the other ten (`lib/figures.ts`)
4. Pick a color palette (primary / deep / soft / accent)
5. Add the archetype to all 10 places: `lib/archetypes.ts`,
   `lib/figures.ts`, mull.html ARCHETYPES, the quiz answer
   contributions (some answers should now contribute toward this
   archetype's signature), the i18n table, /archetype/[slug] page
6. Add the archetype's data to `scripts/gen-philosophers.mjs`
   ARCHETYPES so the Wave 2 corpus reclassifies — anyone whose
   vector ends up nearest the new archetype gets reassigned
7. Re-run `node scripts/check-philosopher-calibration.mjs` and
   confirm no regressions on existing classifications
8. Re-run the canonical / edge / paradox persona tests (those
   harnesses don't exist in the repo yet per the synopsis — would
   need to be built from the PROJECT.md description first)

This is roughly 1–2 days of focused work plus another day of
polish + testing. Most of the effort is in the prose for
`/archetype/[slug]` and matching the visual feel of the other
ten figures.
