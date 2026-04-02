import { SQUASHHUB_CONSTANTS } from '@/lib/constants';

/**
 * ELO rating calculation
 * Based on the standard ELO formula used in chess and squash
 */

interface EloResult {
  newWinnerRating: number;
  newLoserRating: number;
  winnerChange: number;
  loserChange: number;
}

/**
 * Calculate new ELO ratings after a match
 * Using the standard ELO formula with adjustable K-factor
 */
export function calculateElo(
  winnerRating: number,
  loserRating: number,
  kFactor: number = SQUASHHUB_CONSTANTS.K_FACTOR,
): EloResult {
  // Expected score for winner
  const expectedWinner =
    1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
  // Expected score for loser
  const expectedLoser = 1 / (1 + Math.pow(10, (winnerRating - loserRating) / 400));

  // New ratings (winner gets actual score of 1, loser gets 0)
  const newWinnerRating = Math.round(
    winnerRating + kFactor * (1 - expectedWinner),
  );
  const newLoserRating = Math.round(loserRating + kFactor * (0 - expectedLoser));

  // Clamp ratings to valid range
  const clampedWinnerRating = Math.max(
    SQUASHHUB_CONSTANTS.MIN_ELO,
    Math.min(SQUASHHUB_CONSTANTS.MAX_ELO, newWinnerRating),
  );
  const clampedLoserRating = Math.max(
    SQUASHHUB_CONSTANTS.MIN_ELO,
    Math.min(SQUASHHUB_CONSTANTS.MAX_ELO, newLoserRating),
  );

  return {
    newWinnerRating: clampedWinnerRating,
    newLoserRating: clampedLoserRating,
    winnerChange: clampedWinnerRating - winnerRating,
    loserChange: clampedLoserRating - loserRating,
  };
}

/**
 * Calculate ELO for multiple opponents (doubles match)
 */
export function calculateEloDoubles(
  team1Ratings: [number, number],
  team2Ratings: [number, number],
  team1Wins: boolean,
  kFactor: number = SQUASHHUB_CONSTANTS.K_FACTOR,
): {
  team1Players: [EloResult, EloResult];
  team2Players: [EloResult, EloResult];
} {
  // Average rating for each team
  const team1AvgRating = (team1Ratings[0] + team1Ratings[1]) / 2;
  const team2AvgRating = (team2Ratings[0] + team2Ratings[1]) / 2;

  // Calculate as if it's a single match between teams
  const winnerAvg = team1Wins ? team1AvgRating : team2AvgRating;
  const loserAvg = team1Wins ? team2AvgRating : team1AvgRating;

  const baseElo = calculateElo(winnerAvg, loserAvg, kFactor);

  // Apply changes to individual players
  if (team1Wins) {
    return {
      team1Players: [
        {
          newWinnerRating: Math.round(team1Ratings[0] + baseElo.winnerChange / 2),
          newLoserRating: Math.round(team1Ratings[1] + baseElo.winnerChange / 2),
          winnerChange: Math.round(baseElo.winnerChange / 2),
          loserChange: Math.round(baseElo.winnerChange / 2),
        },
        {
          newWinnerRating: Math.round(team1Ratings[1] + baseElo.winnerChange / 2),
          newLoserRating: Math.round(team1Ratings[0] + baseElo.winnerChange / 2),
          winnerChange: Math.round(baseElo.winnerChange / 2),
          loserChange: Math.round(baseElo.winnerChange / 2),
        },
      ] as [EloResult, EloResult],
      team2Players: [
        {
          newWinnerRating: Math.round(team2Ratings[0] + baseElo.loserChange / 2),
          newLoserRating: Math.round(team2Ratings[1] + baseElo.loserChange / 2),
          winnerChange: Math.round(baseElo.loserChange / 2),
          loserChange: Math.round(baseElo.loserChange / 2),
        },
        {
          newWinnerRating: Math.round(team2Ratings[1] + baseElo.loserChange / 2),
          newLoserRating: Math.round(team2Ratings[0] + baseElo.loserChange / 2),
          winnerChange: Math.round(baseElo.loserChange / 2),
          loserChange: Math.round(baseElo.loserChange / 2),
        },
      ] as [EloResult, EloResult],
    };
  }

  return {
    team1Players: [
      {
        newWinnerRating: Math.round(team1Ratings[0] + baseElo.loserChange / 2),
        newLoserRating: Math.round(team1Ratings[1] + baseElo.loserChange / 2),
        winnerChange: Math.round(baseElo.loserChange / 2),
        loserChange: Math.round(baseElo.loserChange / 2),
      },
      {
        newWinnerRating: Math.round(team1Ratings[1] + baseElo.loserChange / 2),
        newLoserRating: Math.round(team1Ratings[0] + baseElo.loserChange / 2),
        winnerChange: Math.round(baseElo.loserChange / 2),
        loserChange: Math.round(baseElo.loserChange / 2),
      },
    ] as [EloResult, EloResult],
    team2Players: [
      {
        newWinnerRating: Math.round(team2Ratings[0] + baseElo.winnerChange / 2),
        newLoserRating: Math.round(team2Ratings[1] + baseElo.winnerChange / 2),
        winnerChange: Math.round(baseElo.winnerChange / 2),
        loserChange: Math.round(baseElo.winnerChange / 2),
      },
      {
        newWinnerRating: Math.round(team2Ratings[1] + baseElo.winnerChange / 2),
        newLoserRating: Math.round(team2Ratings[0] + baseElo.winnerChange / 2),
        winnerChange: Math.round(baseElo.winnerChange / 2),
        loserChange: Math.round(baseElo.winnerChange / 2),
      },
    ] as [EloResult, EloResult],
  };
}

/**
 * Predict the expected score (probability) of a player winning
 */
export function predictWinProbability(
  playerRating: number,
  opponentRating: number,
): number {
  return 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
}
