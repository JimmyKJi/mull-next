// Suggested-topic chips for the debate + duel forms — the one-tap prompts
// under the topic input. Previously these lived as two hand-duplicated
// string arrays (one per form) that had silently drifted out of sync;
// this is the single source both forms render.
//
// `relevantDimensions` declares which of the 16 axes each question is
// ABOUT (not a stance on them). That lets a placed user's chips reorder
// by rankByDimensionFocus — surfacing the prompts that probe the
// dimensions where the user most stands out from their own baseline,
// "the debate that lives where you do." Logged-out / unplaced visitors
// see this canonical order. Keep ~3 dims per topic, matching lib/topics.ts.

import type { DimKey } from './dimensions';

export type DebateTopicSuggestion = {
  /** The literal prompt — set verbatim into the topic input and sent to
   *  the generate API. Stable: used as the React key. English-only, as
   *  these chips have always been (they're examples, not chrome). */
  text: string;
  /** The 16-D axes this question probes, for dimension-focus ranking. */
  relevantDimensions: DimKey[];
};

export const SUGGESTED_DEBATE_TOPICS: readonly DebateTopicSuggestion[] = [
  { text: 'whether free will is real', relevantDimensions: ['TR', 'SS', 'SI'] },
  { text: 'what makes a life worth living', relevantDimensions: ['VA', 'PO', 'TV'] },
  { text: 'whether the self is an illusion', relevantDimensions: ['SI', 'SS', 'MR'] },
  { text: 'the source of moral authority', relevantDimensions: ['SS', 'CE', 'UI'] },
  { text: 'whether we owe anything to strangers', relevantDimensions: ['UI', 'CE', 'PO'] },
  { text: 'the role of suffering in a good life', relevantDimensions: ['TV', 'AT', 'VA'] },
  { text: 'whether tradition is wisdom or weight', relevantDimensions: ['RT', 'CE', 'SS'] },
  { text: 'what beauty is for', relevantDimensions: ['ES', 'VA', 'MR'] },
  { text: 'whether reason or experience reveals truth', relevantDimensions: ['TR', 'TE', 'SR'] },
  { text: 'how to face death well', relevantDimensions: ['TV', 'MR', 'AT'] },
] as const;
