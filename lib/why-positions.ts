// "Why this archetype" copy — per-philosopher quotes that explain
// the result, used in the result page's `renderWhy` block.
//
// Extracted verbatim from public/mull.html `const WHY_POSITIONS`.
// Indexed by the philosopher's display name (matches the patron
// names in mull.html ARCHETYPES); the migrated result page picks
// the matched archetype's patron and looks up that name here.

export type WhyPosition = {
  /** Short quote from the philosopher capturing the orientation. */
  quote: string;
  /** Citation. */
  source: string;
  /** Editorial reading explaining the dimensional pattern in the
   *  user's voice. One paragraph. */
  reading: string;
};

export const WHY_POSITIONS: Record<string, WhyPosition> = {
  "Plato": {
    quote: "The unexamined life is not worth living.",
    source: "Apology, 38a (Socrates' defense)",
    reading: "Scores high on Theoretical Drive and Universalist Impulse: the assertion that some lives are worth more than others, by a single criterion (examination), is exactly the move Plato makes throughout."
  },
  "Aristotle": {
    quote: "The good for man is an activity of the soul in accordance with virtue, and if there are several virtues, in accordance with the best and most perfect.",
    source: "Nicomachean Ethics, I.7",
    reading: "Trust in Reason + Practical Orientation top out: the good is identifiable through reasoning, but only as enacted in habit. Theoretical Drive present but bounded by practice."
  },
  "Marcus Aurelius": {
    quote: "You have power over your mind — not outside events. Realize this, and you will find strength.",
    source: "Meditations, Book IV",
    reading: "Maximum Practical Orientation paired with Tragic Vision and Ascetic Tendency. The quote names exactly the Stoic move: locating freedom in response, not in circumstance."
  },
  "Hume": {
    quote: "Reason is, and ought only to be, the slave of the passions, and can never pretend to any other office than to serve and obey them.",
    source: "A Treatise of Human Nature, Book II",
    reading: "Top scores on Skeptical Reflex and Trust in Experience; very low on Mystical Receptivity. The position is sharp: reason has no independent throne."
  },
  "Nietzsche": {
    quote: "He who has a why to live for can bear almost any how.",
    source: "Twilight of the Idols (often misattributed; appears across his corpus)",
    reading: "Will to Power and Sovereign Self both at the top of the scale; Communal Embeddedness near the bottom. The why is yours to forge — community can't manufacture it for you."
  },
  "Buddha": {
    quote: "All conditioned things are impermanent. When one sees this with insight, one turns away from suffering.",
    source: "Dhammapada, verse 277",
    reading: "Self as Illusion at maximum, paired with Mystical Receptivity and Ascetic Tendency. The vector reads as the central Buddhist move: stop clinging to what was never solid."
  },
  "Confucius": {
    quote: "When you know a thing, to hold that you know it; and when you do not know a thing, to allow that you do not know it — this is knowledge.",
    source: "Analects, II.17",
    reading: "Communal Embeddedness, Reverence for Tradition, and Practical Orientation all very high. Knowledge here is virtue-shaped — humility woven into the ritual practice of admission."
  },
  "Camus": {
    quote: "One must imagine Sisyphus happy.",
    source: "The Myth of Sisyphus, closing line",
    reading: "Tragic Vision and Sovereign Self both high; the vector captures the absurd-but-affirmed posture. Vital Affirmation present too — Camus is not a nihilist."
  },
  "Wittgenstein": {
    quote: "Whereof one cannot speak, thereof one must be silent.",
    source: "Tractatus Logico-Philosophicus, §7",
    reading: "Mystical Receptivity surprisingly high for an analytic philosopher — the famous closing line is the textual evidence. Trust in Reason also very high; the silence is reasoned, not arbitrary."
  },
  "Simone Weil": {
    quote: "Attention is the rarest and purest form of generosity.",
    source: "Letter to Joë Bousquet, April 1942",
    reading: "Maximum Ascetic Tendency, Mystical Receptivity, and Universalist Impulse. The whole vector reads as a stripping-away — generosity, attention, and self-erasure all named in a single sentence."
  }
};

/** Look up a why-position by patron name. Returns undefined when no
 *  matching entry — caller should fall back to the archetype's
 *  generic blurb. */
export function getWhyPosition(patronName: string): WhyPosition | undefined {
  return WHY_POSITIONS[patronName];
}
