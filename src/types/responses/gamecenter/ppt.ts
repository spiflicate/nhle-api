import type {
   DefendingSide,
   GameState,
   GoalModifier,
   LocalizedText,
   PeriodType,
   Strength,
} from './common.ts';

export interface PPTReplayGoal extends BasePPTReplay {
   goal: Goal;
}

// NOTE: As of now, the data for this endpoint appears to be incomplete and may not be in use by the NHL.
// The data structure contains only the base information about the game the event is associated with,
// without any specific details about the PPT events themselves.
export interface PPTReplayEvent extends BasePPTReplay {}

interface BasePPTReplay {
   id: number;
   gameDate: string;
   awayTeam: Team;
   homeTeam: Team;
   gameState: GameState;
   gameType: number;
}

interface Team {
   id: number;
   name: LocalizedText;
   abbrev: string;
   placeName: LocalizedText;
   placeNameWithPreposition: LocalizedText;
   logo: string;
   darkLogo: string;
}

interface Goal {
   periodDescriptor: PeriodDescriptor;
   situationCode: string;
   strength: Strength;
   playerId: number;
   firstName: LocalizedText;
   lastName: LocalizedText;
   name: LocalizedText;
   teamAbbrev: LocalizedText;
   headshot: string;
   logoUrl: string;
   goalsToDate: number;
   sweaterNumber: number;
   awayScore: number;
   homeScore: number;
   leadingTeamAbbrev?: LocalizedText;
   timeInPeriod: string;
   shotType: string;
   goalModifier: GoalModifier;
   assists: Player[];
   pptReplayUrl: string;
   homeTeamDefendingSide: DefendingSide;
   isHome: boolean;
   eventId: number;
   highlightClip?: number;
   highlightClipFr?: number;
   highlightClipSharingUrl?: string;
   highlightClipSharingUrlFr?: string;
}

interface Player {
   playerId: number;
   firstName: LocalizedText;
   lastName: LocalizedText;
   name: LocalizedText;
   assistsToDate: number;
   sweaterNumber: number;
}

interface PeriodDescriptor {
   number: number;
   periodType: PeriodType;
   maxRegulationPeriods: number;
}
