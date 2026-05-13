// HowWorks — collapsible "how this actually works" essay. English-only
// (matches the philosophical-content i18n policy in AGENTS.md). Uses
// the native <details> element so it works without JS, just animated
// on open via the chevron rotate.
//
// Visual: small inline label, opens to a 5-paragraph editorial
// explanation. Strong leading phrase per paragraph. Generous serif
// pairing — Cormorant for the lead, system sans for the body.

export default function HowWorks() {
  return (
    <details className="howworks group mt-14 max-w-[640px]">
      <summary className="cursor-pointer list-none text-[14px] text-[var(--color-acc-deep,#8C6520)] underline decoration-[var(--color-acc,#B8862F)]/40 decoration-1 underline-offset-4 hover:decoration-[var(--color-acc-deep,#8C6520)] [&::-webkit-details-marker]:hidden">
        How this works (and why it isn&rsquo;t a political compass)
        <span className="ml-1.5 inline-block transition-transform group-open:rotate-90">
          ›
        </span>
      </summary>
      <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-[var(--color-ink-soft,#4A4338)]">
        <p>
          <strong className="text-[var(--color-ink,#221E18)]">Mull places you in a 16-dimensional space</strong>{" "}
          of philosophical tendencies — things like Trust in Reason, Tragic
          Vision, Mystical Receptivity, Communal Embeddedness, Self as
          Illusion. Each answer is a small vector that nudges your position.
        </p>
        <p>
          <strong className="text-[var(--color-ink,#221E18)]">Over 500 philosophers are positioned alongside you,</strong>{" "}
          drawn from their actual writings. Buddha and Hume both score high
          on Self as Illusion but for opposite reasons. Nietzsche and Sartre
          both score high on Sovereign Self but split on Will to Power. The
          dimensions catch real distinctions.
        </p>
        <p>
          <strong className="text-[var(--color-ink,#221E18)]">
            Every dilemma, diary entry, and exercise reflection gets diagnosed
            against the canon.
          </strong>{" "}
          Write a few sentences and Mull tells you which historical thinkers
          made that same move — by name, with the parallel quoted — what
          tradition the thinking sits inside, or, if the move isn&rsquo;t
          strongly captured by anyone in our database, that it&rsquo;s
          genuinely original ground. It also surfaces partial cousins:
          thinkers who approached your idea from a different angle. This is
          the part that turns Mull from a quiz into a conversation across
          centuries.
        </p>
        <p>
          <strong className="text-[var(--color-ink,#221E18)]">
            You&rsquo;re a continuous point in space, not a fixed type.
          </strong>{" "}
          A political compass collapses everything to two axes and four
          quadrants. MBTI sorts you into one of sixteen boxes. Mull never
          collapses you. Two people who get the same archetype headline still
          have different fingerprints — and the same person, taking the test
          six months later, will land somewhere slightly different as their
          thinking shifts.
        </p>
        <p>
          <strong className="text-[var(--color-ink,#221E18)]">
            The archetype on the result page is a useful label, not a verdict.
          </strong>{" "}
          The real result is the 16-dimensional position you can see in your
          profile and, eventually, watch evolve over time.
        </p>
      </div>
    </details>
  );
}
