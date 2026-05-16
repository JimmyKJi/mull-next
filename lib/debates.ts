// Canonical philosophical debates — projections of the 16-D user
// vector onto recognizable named positions (libertarian free will,
// compatibilism, virtue ethics, etc.). Each position is a weighted
// linear combination of dimensions; the user's "stance" on a debate
// is whichever position scores highest under their vector.
//
// Extracted verbatim from public/mull.html `const DEBATES`. The
// projection helpers below replace the inline mull.html implementations.

import { DIM_KEYS, type DimKey } from "./dimensions";

export type DebatePosition = {
  /** Display name of the position, e.g. "Libertarian free will". */
  label: string;
  /** One-sentence summary in the user's voice. */
  gist: string;
  /** Per-dimension weight. Positive values mean "this position aligns
   *  with a high score on this dim"; negatives mean it aligns with
   *  low scores. Dot-product against the user's vector gives the
   *  position's score. */
  keys: Partial<Record<DimKey, number>>;
};

export type Debate = {
  /** Display name of the debate, e.g. "Free will & moral responsibility". */
  name: string;
  positions: DebatePosition[];
};

export const DEBATES: Debate[] = [
  { name: "Free will & moral responsibility",
    positions: [
      { label: "Libertarian free will",
        gist: "Choices are genuinely yours — not just causal echoes. The wrongdoer is fully accountable.",
        keys: { SS:+1.0, WP:+1.0, SI:-1.0, RT:+0.3 } },
      { label: "Compatibilism",
        gist: "Determinism is probably true, but freedom and responsibility still mean something in human terms.",
        keys: { TR:+1.0, SS:+0.4, PO:+0.5, SI:-0.4 } },
      { label: "Hard determinism / no-self",
        gist: "What looks like choice is patterns producing patterns. Responsibility is a useful social fiction.",
        keys: { SI:+1.0, SR:+1.0, SS:-1.0, ES:+0.3 } }
    ]
  },
  { name: "Ethics — what makes an act good?",
    positions: [
      { label: "Virtue ethics",
        gist: "Goodness is about what kind of person you become — habits, character, practical wisdom — not rules or outcomes.",
        keys: { RT:+1.0, CE:+0.7, AT:+0.6, PO:+0.5 } },
      { label: "Deontology",
        gist: "Some acts are right or wrong in themselves, regardless of consequences. Some lines you don't cross.",
        keys: { UI:+1.0, TR:+0.8, RT:+0.3, PO:-0.3 } },
      { label: "Consequentialism",
        gist: "An act's morality is determined by what it produces — measured against well-being or another concrete good.",
        keys: { TR:+0.8, PO:+1.0, WP:+0.4, UI:+0.5 } },
      { label: "Care / contextual ethics",
        gist: "Morality starts from particular relationships and contexts, not abstract principles. Listen to who's in front of you.",
        keys: { CE:+1.0, ES:+0.6, MR:+0.4, UI:-0.3 } }
    ]
  },
  { name: "The sacred",
    positions: [
      { label: "Apophatic theist",
        gist: "Something real points beyond what reason can name. Inherited religious forms preserve a wisdom worth respecting.",
        keys: { MR:+1.0, RT:+0.8, SR:-0.5 } },
      { label: "Spiritual but not religious",
        gist: "Something is there, but not the institutional God of any tradition. The mystery is direct, not mediated.",
        keys: { MR:+1.0, RT:-0.6, SS:+0.4 } },
      { label: "Skeptical agnostic",
        gist: "We don't, and probably can't, know. Suspending judgment is the honest posture.",
        keys: { SR:+1.0, MR:-0.3, TE:+0.5 } },
      { label: "Naturalist atheist",
        gist: "The world makes sense without anything beyond it. Religious experience has natural explanations.",
        keys: { SR:+1.0, TE:+1.0, MR:-1.0 } }
    ]
  },
  { name: "Mind & body",
    positions: [
      { label: "Embodied mind",
        gist: "Cognition isn't separable from the body and the world. Thinking is something a whole creature does.",
        keys: { ES:+1.0, TE:+0.7, SI:-0.3 } },
      { label: "Functionalist materialism",
        gist: "Mind is what brain does. The same patterns could in principle run on different hardware.",
        keys: { TR:+1.0, TD:+0.5, ES:-0.6 } },
      { label: "Idealist or dualist",
        gist: "Consciousness isn't fully reducible to matter. Either mind is fundamental, or there are two distinct kinds of substance.",
        keys: { MR:+1.0, TD:+0.7, ES:-0.5 } },
      { label: "No-self / process view",
        gist: "There's no fixed mental substance to explain. Mental life is a stream of dependent arising.",
        keys: { SI:+1.0, MR:+0.5, SS:-0.5 } }
    ]
  },
  { name: "Authority & politics",
    positions: [
      { label: "Communitarian / traditionalist",
        gist: "We become full humans through inherited communities and roles. Liberal individualism dissolves what makes life livable.",
        keys: { CE:+1.0, RT:+1.0, SS:-0.7 } },
      { label: "Liberal individualist",
        gist: "Each person has the right to author their own life. Universal rights protect that against community pressure.",
        keys: { SS:+1.0, UI:+0.8, TR:+0.4 } },
      { label: "Anarchist / libertarian",
        gist: "Hierarchy is presumptively suspect. Voluntary cooperation and self-rule beat top-down authority.",
        keys: { SS:+1.0, WP:+0.7, RT:-1.0, CE:-0.3 } },
      { label: "Pragmatic reformist",
        gist: "Politics is the art of what works. Slow, evidence-driven change against problems we can actually solve.",
        keys: { PO:+1.0, TE:+0.5, SR:+0.5 } }
    ]
  },
  { name: "Knowledge — how do we know?",
    positions: [
      { label: "Rationalist",
        gist: "Reason can reach truths experience can't — mathematical, ethical, structural — by working from clear principles.",
        keys: { TR:+1.0, TD:+0.8, TE:-0.5 } },
      { label: "Empiricist",
        gist: "All knowledge starts in experience. Claims that can't be checked against the world are usually empty.",
        keys: { TE:+1.0, SR:+0.7, MR:-0.5 } },
      { label: "Pragmatist",
        gist: "Truth is what reliably works under inquiry. Knowing is something we do together over time, not a mind-mirror relation.",
        keys: { PO:+1.0, TR:+0.4, TE:+0.4 } },
      { label: "Mystical intuitionist",
        gist: "The deepest truths are reached by attention beneath language — meditation, contemplation, the apophatic.",
        keys: { MR:+1.0, SI:+0.5, SR:-0.3 } }
    ]
  },
  { name: "Personal identity",
    positions: [
      { label: "Continuous self",
        gist: "There's a real you that persists through time, even as you change. The self bears memory and responsibility.",
        keys: { SS:+1.0, RT:+0.4, SI:-1.0 } },
      { label: "Narrative self",
        gist: "You're the story you keep telling about yourself, woven from memory and the people you love.",
        keys: { CE:+0.8, SS:+0.5, RT:+0.3, MR:+0.2 } },
      { label: "No-self",
        gist: "What you call 'I' is a flicker of patterns. There's no thing inside doing the experiencing.",
        keys: { SI:+1.0, MR:+0.5, SS:-0.7 } }
    ]
  },
  { name: "Beauty & aesthetics",
    positions: [
      { label: "Aesthetic objectivism",
        gist: "Beauty is real and points beyond itself, toward something eternal. Some forms of beauty are higher than others.",
        keys: { MR:+1.0, UI:+0.8, RT:+0.5, TD:+0.4 } },
      { label: "Hedonic aesthetics",
        gist: "Beauty is intense, embodied pleasure made permanent. The point is to be alive to the world's loveliness.",
        keys: { ES:+1.0, VA:+1.0, MR:+0.2 } },
      { label: "Apophatic — beauty for nothing",
        gist: "Beauty is for nothing. That's why it matters — it points to the part of being that resists explanation.",
        keys: { MR:+1.0, TV:+0.5, AT:+0.4, PO:-0.4 } },
      { label: "Skeptical / evolutionary",
        gist: "Beauty is mostly biology — a signal evolution selected for. The rest is decoration we add to feel important.",
        keys: { SR:+1.0, TE:+0.8, SI:+0.4, MR:-0.7 } }
    ]
  }
];

/** Score a debate position against a user vector — dot product over
 *  the position's `keys`. Positive scores mean the user's pattern
 *  aligns with this position; negative scores mean they pull away
 *  from it. */
export function scoreDebatePosition(
  vec: number[],
  keys: Partial<Record<DimKey, number>>,
): number {
  let score = 0;
  for (const k in keys) {
    const idx = DIM_KEYS.indexOf(k as DimKey);
    if (idx >= 0) score += vec[idx] * (keys[k as DimKey] ?? 0);
  }
  return score;
}

export type DebateStance = {
  name: string;
  top: DebatePosition & { score: number };
  all: (DebatePosition & { score: number })[];
};

/** For each debate, return the user's top-scoring position plus the
 *  full ranked list. Used on the result page to show "what stance
 *  Mull thinks you'd take" on each canonical question. */
export function topDebateStances(vec: number[]): DebateStance[] {
  return DEBATES.map((d) => {
    const scored = d.positions
      .map((p) => ({ ...p, score: scoreDebatePosition(vec, p.keys) }))
      .sort((a, b) => b.score - a.score);
    return { name: d.name, top: scored[0], all: scored };
  });
}
