// Minimal trajectory maths for surfaces that visualize a user's path
// through the 16-D space over time (the Today home; /account has its
// own richer copy carrying display fields). An event is either a quiz
// (an ABSOLUTE position) or a reflection (a DELTA applied to the
// running position). Feed events oldest → newest.

export type TrajectoryEvent =
  | { kind: 'quiz'; timestamp: number; vector: number[] }
  | { kind: 'delta'; timestamp: number; delta: number[] };

export type TrajectoryPoint = { timestamp: number; after: number[] };

/** Fold events into absolute positions after each one. Caller sorts
 *  oldest → newest. */
export function computeTrajectory(events: TrajectoryEvent[]): TrajectoryPoint[] {
  let pos = new Array(16).fill(0);
  const out: TrajectoryPoint[] = [];
  for (const ev of events) {
    if (ev.kind === 'quiz') {
      pos = ev.vector.slice();
    } else {
      pos = pos.map((v, i) => +(v + (ev.delta[i] ?? 0)).toFixed(3));
    }
    out.push({ timestamp: ev.timestamp, after: pos.slice() });
  }
  return out;
}
