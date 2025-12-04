import type { LocalizedText, PositionCode } from './common.ts';

export interface TeamStats {
   season: string;
   gameType: number;
   skaters: Skater[];
   goalies: Goalie[];
}

interface Goalie {
   playerId: number;
   headshot: string;
   firstName: LocalizedText;
   lastName: LocalizedText;
   gamesPlayed: number;
   gamesStarted: number;
   wins: number;
   losses: number;
   overtimeLosses: number;
   goalsAgainstAverage: number;
   savePercentage: number;
   shotsAgainst: number;
   saves: number;
   goalsAgainst: number;
   shutouts: number;
   goals: number;
   assists: number;
   points: number;
   penaltyMinutes: number;
   timeOnIce: number;
}

interface Skater {
   playerId: number;
   headshot: string;
   firstName: LocalizedText;
   lastName: LocalizedText;
   positionCode: PositionCode;
   gamesPlayed: number;
   goals: number;
   assists: number;
   points: number;
   plusMinus: number;
   penaltyMinutes: number;
   powerPlayGoals: number;
   shorthandedGoals: number;
   gameWinningGoals: number;
   overtimeGoals: number;
   shots: number;
   shootingPctg: number;
   avgTimeOnIcePerGame: number;
   avgShiftsPerGame: number;
   faceoffWinPctg: number;
}

export interface TeamStatsSeason {
   season: number;
   gameTypes: (2 | 3)[];
}
