// Arena Elo math.
//
// Standard Elo formula with the variant chess.com / Lichess use:
//   K-factor decays as the player plays more (provisional rating →
//   stable rating). Defaults: K=60 for first 20 debates, K=32 next 80,
//   K=16 after.
//
// Verdict mapping:
//   - "user" wins = user scored 1.0
//   - "draw"      = user scored 0.5
//   - "opponent"  = user scored 0.0
//
// Calibration:
//   Three placement matches against opponents at increasing
//   difficulty (1100, 1300, 1500). Final Elo = mean of (opponent_elo
//   + outcome_bias) across the three matches, where outcome_bias is
//   +200 for a win, 0 for a draw, -200 for a loss. Clamped to
//   [400, 2400].

export type Verdict = "user" | "opponent" | "draw";

/** User's score for Elo math. */
export function verdictToScore(v: Verdict): number {
  return v === "user" ? 1.0 : v === "draw" ? 0.5 : 0.0;
}

/** Expected score for player A vs B given their Elos. */
export function expectedScore(eloA: number, eloB: number): number {
  return 1 / (1 + Math.pow(10, (eloB - eloA) / 400));
}

/** Standard Elo update. K-factor controls update magnitude. */
export function newElo(
  currentElo: number,
  opponentElo: number,
  actualScore: number,
  kFactor: number,
): number {
  const expected = expectedScore(currentElo, opponentElo);
  const delta = kFactor * (actualScore - expected);
  return Math.round(currentElo + delta);
}

/** K-factor decay schedule. */
export function kFactorForGames(gamesPlayed: number): number {
  if (gamesPlayed < 20) return 60;
  if (gamesPlayed < 100) return 32;
  return 16;
}

/** Calibration: derive starter Elo from N placement matches. */
export type CalibrationMatch = {
  opponentElo: number;
  verdict: Verdict;
};

export function calibrationStartElo(matches: CalibrationMatch[]): number {
  if (matches.length === 0) return 1000;
  const bias = { user: 200, draw: 0, opponent: -200 } as const;
  const total = matches.reduce(
    (acc, m) => acc + m.opponentElo + bias[m.verdict],
    0,
  );
  const mean = total / matches.length;
  return clampElo(Math.round(mean));
}

/** Clamp Elo to a sensible range. */
export function clampElo(elo: number): number {
  return Math.max(400, Math.min(2400, elo));
}

/** Predefined opponent Elos for the 3 calibration matches. */
export const CALIBRATION_OPPONENT_ELOS = [1100, 1300, 1500] as const;
