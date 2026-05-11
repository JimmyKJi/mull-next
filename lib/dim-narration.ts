// Plain-language narration for each of the 16 dimensions. Used by
// /compare/[a]/[b] to translate raw score differences into sentences
// like "You lean toward X; they lean toward Y."
//
// Each entry has a high-pole sentence (what scoring high means) and
// a low-pole sentence (what scoring low means). We pick whichever
// pole each user is closer to and stitch the two together.

import { DIM_KEYS } from './dimensions';

export type DimNarration = {
  // Short human label (mirrors DIM_NAMES but kept here for the
  // narration package to be self-contained).
  label: string;
  // What scoring high on this dimension looks like, framed as a
  // first-person leaning. Should fit "leans toward {high}."
  high: string;
  // What scoring low looks like.
  low: string;
};

export const DIM_NARRATIONS: Record<string, DimNarration> = {
  TV: {
    label: 'Tragic vision',
    high: 'sees suffering as fundamental — meaning grows from how you face it',
    low: 'sees life as fundamentally workable, with suffering as a problem to solve',
  },
  VA: {
    label: 'Vital affirmation',
    high: 'affirms life as it is — pleasure and being alive don\'t need outside justification',
    low: 'sees the present life as preparation or backdrop for something else',
  },
  WP: {
    label: 'Will to shape',
    high: 'shapes the world rather than accepting it — value comes from effort and mastery',
    low: 'finds value in receptivity and acceptance more than in willed change',
  },
  TR: {
    label: 'Trust in reason',
    high: 'trusts careful reasoning from clear principles as the most reliable path to truth',
    low: 'distrusts purely deductive reasoning when it floats free of experience',
  },
  TE: {
    label: 'Trust in experience',
    high: 'trusts what can be observed, tested, and verified — empirical first',
    low: 'thinks the most important things sit outside what can be measured',
  },
  RT: {
    label: 'Reverence for tradition',
    high: 'treats inherited wisdom as a real resource — tradition has earned its weight',
    low: 'is suspicious of inherited frames — most of them are due for revision',
  },
  MR: {
    label: 'Mystical receptivity',
    high: 'is open to what bypasses words — the surface of things isn\'t the whole story',
    low: 'distrusts mystical claims — what can\'t be said cleanly probably isn\'t real',
  },
  SR: {
    label: 'Skeptical reflex',
    high: 'demands evidence before accepting claims — extraordinary claims, extraordinary proof',
    low: 'is willing to accept what feels true even without explicit justification',
  },
  CE: {
    label: 'Communal embeddedness',
    high: 'is rooted in community — most of who you are was given by people who came before',
    low: 'is more individualist — meaning is something each person makes for themselves',
  },
  SS: {
    label: 'Sovereign self',
    high: 'trusts their own judgment over the crowd\'s — sovereignty over received opinion',
    low: 'weights collective wisdom over solo conviction — the herd often knows things you don\'t',
  },
  PO: {
    label: 'Practical orientation',
    high: 'is grounded in practical action — philosophy is for living, not just thinking',
    low: 'is drawn to thinking as its own end, regardless of immediate use',
  },
  TD: {
    label: 'Theoretical drive',
    high: 'is pulled toward big systems and underlying structure',
    low: 'mistrusts grand systems — prefers concrete, modest claims',
  },
  AT: {
    label: 'Ascetic tendency',
    high: 'values discipline over indulgence — the work is in restraint',
    low: 'sees no virtue in self-denial — well-arranged pleasure is part of a good life',
  },
  ES: {
    label: 'Embodied sensibility',
    high: 'takes the body and the senses seriously — the embodied life is the real one',
    low: 'is drawn to mind over body — the senses are unreliable witnesses',
  },
  UI: {
    label: 'Universalist impulse',
    high: 'looks for principles that hold for everyone, not just for one tribe',
    low: 'is rooted in particulars — the local and specific outweigh the abstract universal',
  },
  SI: {
    label: 'Self as illusion',
    high: 'sees the self as a useful fiction — there\'s no fixed "you" underneath',
    low: 'experiences the self as real and continuous — there\'s a "you" doing the asking',
  },
};

// Scale midpoint for high/low — vectors range roughly [0, 12].
const MIDPOINT = 6;

export type CompareLine = {
  key: string;
  label: string;
  aValue: number;
  bValue: number;
  diff: number;
  poleFlip: boolean;       // true when users sit on opposite sides of the midpoint
  aText: string;
  bText: string;
};

// Render one user's stance on a dimension as a degree-qualified
// sentence. "strongly", "moderately", "leans" gives us same-side
// gradation so two users who both score "high" on Practical Orientation
// but with different magnitudes (9 vs 7) read as DIFFERENT sentences.
function poleSentence(value: number, narration: DimNarration): string {
  const high = value >= MIDPOINT;
  const pole = high ? narration.high : narration.low;
  // Distance from the midpoint, capped at 6 (the max it can be on
  // either side). Buckets: 0-1 "leans", 1-3 "moderately", 3+ "strongly".
  const dist = Math.abs(value - MIDPOINT);
  let qualifier: string;
  if (dist >= 3) qualifier = 'strongly';
  else if (dist >= 1) qualifier = 'moderately';
  else qualifier = 'just barely';
  // Splice the qualifier in: "is grounded" → "is strongly grounded".
  // For pole sentences starting with "is/sees/trusts/affirms/..." we
  // inject after the verb. Otherwise we prefix.
  const m = pole.match(/^(is|sees|trusts|affirms|values|treats|takes|looks|shapes|distrusts|demands|experiences|finds|mistrusts|thinks|weights|is open|is willing|is rooted|is suspicious|is drawn|is pulled|is grounded)\b\s*/i);
  if (m) {
    return `${m[0]}${qualifier} ${pole.slice(m[0].length)}`;
  }
  return `${qualifier} ${pole}`;
}

function buildLine(
  key: string,
  aValue: number,
  bValue: number,
): CompareLine {
  const meta = DIM_NARRATIONS[key];
  const diff = Math.abs(aValue - bValue);
  const aHigh = aValue >= MIDPOINT;
  const bHigh = bValue >= MIDPOINT;
  return {
    key,
    label: meta?.label ?? key,
    aValue,
    bValue,
    diff,
    poleFlip: aHigh !== bHigh,
    aText: meta ? poleSentence(aValue, meta) : '',
    bText: meta ? poleSentence(bValue, meta) : '',
  };
}

// Compute the top N most-divergent dimensions between two 16-D
// vectors. Pole-flips (users on opposite sides of the midpoint) are
// promoted above same-side gaps of equal magnitude — they're the
// most legible divergences and should lead the list. Ties on
// pole-flip status are broken by raw |a-b|.
export function topDivergences(
  vecA: number[],
  vecB: number[],
  n = 3,
): CompareLine[] {
  if (!Array.isArray(vecA) || !Array.isArray(vecB) || vecA.length !== 16 || vecB.length !== 16) {
    return [];
  }
  const rows = DIM_KEYS.map((key, i) => buildLine(key, vecA[i], vecB[i]));
  rows.sort((a, b) => {
    // Pole-flips first (a divergence across the midpoint reads as a
    // real disagreement, not just a magnitude gap).
    if (a.poleFlip !== b.poleFlip) return a.poleFlip ? -1 : 1;
    // Then by absolute magnitude difference.
    return b.diff - a.diff;
  });
  return rows.slice(0, n);
}

// Counterpart to topDivergences — the dimensions where the two users
// land MOST closely. Returns lines where both users sit at very
// similar values; the sentences will read near-identically, and that
// proximity is exactly the point.
export function topConvergences(
  vecA: number[],
  vecB: number[],
  n = 3,
): CompareLine[] {
  if (!Array.isArray(vecA) || !Array.isArray(vecB) || vecA.length !== 16 || vecB.length !== 16) {
    return [];
  }
  const rows = DIM_KEYS.map((key, i) => buildLine(key, vecA[i], vecB[i]));
  rows.sort((a, b) => {
    // Same-pole first (real convergence puts you on the same side of
    // the midpoint), then by smallest |a-b|.
    if (a.poleFlip !== b.poleFlip) return a.poleFlip ? 1 : -1;
    return a.diff - b.diff;
  });
  // Filter: only count it as a convergence if both users actually
  // have signal on that dimension (one of them at least 1 away from
  // midpoint). Two users both scoring exactly 6 isn't a real
  // convergence, it's a shared lack of opinion.
  const filtered = rows.filter(r => {
    if (r.poleFlip) return false;
    return Math.abs(r.aValue - MIDPOINT) >= 1 || Math.abs(r.bValue - MIDPOINT) >= 1;
  });
  return filtered.slice(0, n);
}
