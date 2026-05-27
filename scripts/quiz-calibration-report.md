# Quiz calibration report

Generated: 2026-05-27T15:37:07.259Z.

This report flags quiz questions whose answers either cluster (so picking between them changes nothing in the user's placement), dominate (one answer carries disproportionate vector weight), or span too narrow a slice of the 16-D model (touching ≤2 dimensions adds limited information).

Thresholds:
- **Cluster:** cosine similarity between two answer vectors ≥ 0.9
- **Dominance:** one answer's magnitude > 1.8× the average across the question
- **Narrow:** union of dimensions touched < 3

A question can trip more than one. None of these are necessarily bugs — sometimes a question is *supposed* to be a single-axis probe, or a dominant answer reflects a genuinely sharper position. Review each flagged entry and decide.

## Quick (20-question)

- Questions: 20
- Average answers per question: 4.85
- Questions with cluster issues: 1
- Questions with dominance issues: 0
- Questions with narrow-span issues: 0

### Flagged questions (1 / 20)

**Q13.** Justice — what is it, primarily?

- *cluster* (med): Answer 2 ↔ 5: cosine sim 0.912 (CE:2,ES:1,UI:1,WP:1 vs CE:3,UI:1,WP:1)

## Detailed (50-question)

- Questions: 50
- Average answers per question: 5.08
- Questions with cluster issues: 1
- Questions with dominance issues: 0
- Questions with narrow-span issues: 0

### Flagged questions (1 / 50)

**Q32.** A child suffers. How much can be prevented and should be?

- *cluster* (med): Answer 1 ↔ 4: cosine sim 0.926 (UI:3,WP:2,VA:1 vs UI:3,WP:1,TV:1,VA:1)

## Per-dimension coverage

How many questions touch each dimension at least once. If a dimension is touched in ≤2 questions of the 20-question quiz (≤5 in the detailed), that dimension is under-probed and the user's score on it is noisy.

| Dim | Quick (of 20) | Detailed (of 50) |
|---|---|---|
| TV | 9 | 33 |
| VA | 11 | 32 |
| WP | 12 | 28 |
| TR | 18 | 37 |
| TE | 10 | 24 |
| RT | 14 | 35 |
| MR | 17 | 37 |
| SR | 17 | 47 |
| CE | 15 | 36 |
| SS | 16 | 38 |
| PO | 16 | 37 |
| TD | 8 | 29 |
| AT | 14 | 21 |
| ES | 12 | 21 |
| UI | 11 | 27 |
| SI | 15 | 34 |
