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

// Compute the top N most-divergent dimensions between two 16-D
// vectors. Returns each as { key, label, diff, aText, bText }
// where aText/bText are the appropriate pole sentence for each user.
export function topDivergences(
  vecA: number[],
  vecB: number[],
  n = 3,
): Array<{
  key: string;
  label: string;
  aValue: number;
  bValue: number;
  diff: number;
  aText: string;
  bText: string;
}> {
  if (!Array.isArray(vecA) || !Array.isArray(vecB) || vecA.length !== 16 || vecB.length !== 16) {
    return [];
  }
  const rows = DIM_KEYS.map((key, i) => ({
    key,
    aValue: vecA[i],
    bValue: vecB[i],
    diff: Math.abs(vecA[i] - vecB[i]),
  }));
  rows.sort((a, b) => b.diff - a.diff);
  return rows.slice(0, n).map(r => {
    const meta = DIM_NARRATIONS[r.key];
    // Normalize to scale-pole — vectors range roughly [0, 12] in this
    // model. "High" if you score above 6; otherwise low.
    const aHigh = r.aValue >= 6;
    const bHigh = r.bValue >= 6;
    return {
      key: r.key,
      label: meta?.label ?? r.key,
      aValue: r.aValue,
      bValue: r.bValue,
      diff: r.diff,
      aText: meta ? (aHigh ? meta.high : meta.low) : '',
      bText: meta ? (bHigh ? meta.high : meta.low) : '',
    };
  });
}
